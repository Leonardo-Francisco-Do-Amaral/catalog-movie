import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import axios from 'axios';
import pool, { query, runWithTransactionClient, testConnection } from './config/database';
import { fetchMovieDetailsByTitle, fetchMoviePosters, normalizeGenre } from './services/movieIntegration';
import {
  refreshSingleMovieExternalMetrics,
  startCatalogApiRefreshJob,
  getCatalogApiRefreshJob,
  cancelCatalogApiRefreshJob,
} from './services/apiRefreshService';
import {
  startSpreadsheetImportJob,
  getImportJob,
  cancelImportJob,
  generateTemplateXlsxBuffer,
} from './services/spreadsheetImporter';
import {
  buildWorldChallengePayload,
  setManualCountryPick,
  setMovieCulturalOrigin,
  setCountryWishlistTarget,
  resolveTerritoryDescriptor,
} from './services/worldChallengeService';
import {
  ensureTimeMachineTables,
  buildTimeMachinePayload,
  setManualYearPick,
  setYearWishlistTarget,
} from './services/timeMachineService';
import {
  seedTrophies,
  evaluateTrophies,
  acknowledgeNewTrophies,
  setTrophyTestOverride,
  resetAllTrophyOverrides,
} from './services/trophyService';
import {
  getQuickXpSnapshot,
  computeXpGainEvent,
  computeTimeMachineUnlocks,
  computeTimeMachineEvents,
  computeWorldChallengeEvents,
} from './services/xpService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configura pasta de uploads estática
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Apenas imagens (.jpg, .jpeg, .png, .webp) são permitidas.'));
    }
  }
});

// Upload em memória para planilhas (.csv, .xlsx, .xlsm, .xls)
const sheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xlsm', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Envie um arquivo .csv, .xlsx, .xlsm ou .xls.'));
    }
  }
});

app.use('/uploads', express.static(uploadsDir));

// Helper para parsear campos de lista vindos de formulários multipart
function parseListField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  const str = String(field).trim();
  if (!str) return [];
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      return JSON.parse(str);
    } catch {
      // Fallback
    }
  }
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function parseNumeric(val: any, fallback: number = 0): number {
  if (val === undefined || val === null) return fallback;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'na' || str.toLowerCase() === 'n/a') return fallback;
  const num = Number(str);
  return isNaN(num) ? fallback : num;
}

function parseNullableNumeric(val: any): number | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'na' || str.toLowerCase() === 'n/a') return null;
  const num = Number(str.replace('%', '').trim());
  return isNaN(num) ? null : num;
}

function parseGlobalReviewsNullable(val: any): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') {
    return Number.isNaN(val) || !Number.isFinite(val) ? null : Math.round(val);
  }
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'na' || str.toLowerCase() === 'n/a' || str === '-') {
    return null;
  }
  const upper = str.toUpperCase();
  if (upper.endsWith('M')) {
    const base = parseFloat(upper.slice(0, -1).replace(',', '.').trim());
    return Number.isNaN(base) ? null : Math.round(base * 1_000_000);
  }
  if (upper.endsWith('K')) {
    const base = parseFloat(upper.slice(0, -1).replace(',', '.').trim());
    return Number.isNaN(base) ? null : Math.round(base * 1_000);
  }
  const digitsOnly = str.replace(/[.,\s]/g, '');
  if (!/^\d+$/.test(digitsOnly)) return null;
  const parsed = parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// Rota de Health Check / Status
app.get('/api/health', async (req: Request, res: Response) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'OK',
    timestamp: new Date(),
    database: dbConnected ? 'Conectado' : 'Erro de Conexão',
  });
});

// 1. Rota: Último Filme Assistido (Destaque HeroBanner)
app.get('/api/movies/latest', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT mv.id, m.id as movie_id, m.imdb_id, m.tmdb_id, m.title, m.original_title, m.release_year, m.runtime, m.synopsis, m.poster_url, m.imdb_rating, m.metacritic_score, m.rotten_tomatoes_score, m.is_custom, m.oscar_wins, m.oscar_nominations, m.vote_count, m.distributor, m.raw_api_data,
             mv.user_rating, mv.month_seen, mv.year_seen, mv.audio_type, mv.platform, mv.review_notes, mv.watched_at,
             COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags,
             COALESCE(array_agg(DISTINCT ag.name) FILTER (WHERE ag.name IS NOT NULL), '{}') as genres,
             COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') as countries,
             COALESCE(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}') as directors,
             COALESCE(array_agg(DISTINCT w.name) FILTER (WHERE w.name IS NOT NULL), '{}') as writers,
             COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as studios,
             (SELECT wmo.primary_country_code FROM world_challenge_movie_origins wmo WHERE wmo.movie_id = m.id LIMIT 1) as manual_origin_code,
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code
      FROM movie_views mv
      JOIN movies m ON mv.movie_id = m.id
      LEFT JOIN movie_tags mt ON m.id = mt.movie_id
      LEFT JOIN user_tags ut ON mt.tag_id = ut.id
      LEFT JOIN movie_api_genres mag ON m.id = mag.movie_id
      LEFT JOIN api_genres ag ON mag.genre_id = ag.id
      LEFT JOIN movie_countries mc ON m.id = mc.movie_id
      LEFT JOIN countries c ON mc.country_id = c.id
      LEFT JOIN movie_directors md ON m.id = md.movie_id
      LEFT JOIN directors d ON md.director_id = d.id
      LEFT JOIN movie_writers mw ON m.id = mw.movie_id
      LEFT JOIN writers w ON mw.writer_id = w.id
      LEFT JOIN movie_studios ms ON m.id = ms.movie_id
      LEFT JOIN studios s ON ms.studio_id = s.id
      GROUP BY m.id, mv.id
      ORDER BY mv.year_seen DESC NULLS LAST, mv.month_seen DESC NULLS LAST, mv.watched_at DESC, mv.id DESC
      LIMIT 1;
    `;
    const result = await query(sql);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Nenhum filme assistido encontrado no banco.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar último filme:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Rota: Favoritos Inesquecíveis (user_rating >= 9.5)
app.get('/api/movies/favorites', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT mv.id, m.id as movie_id, m.imdb_id, m.tmdb_id, m.title, m.original_title, m.release_year, m.runtime, m.synopsis, m.poster_url, m.imdb_rating, m.metacritic_score, m.rotten_tomatoes_score, m.is_custom, m.oscar_wins, m.oscar_nominations, m.vote_count, m.distributor, m.raw_api_data,
             mv.user_rating, mv.month_seen, mv.year_seen, mv.audio_type, mv.platform, mv.review_notes, mv.watched_at,
             COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags,
             COALESCE(array_agg(DISTINCT ag.name) FILTER (WHERE ag.name IS NOT NULL), '{}') as genres,
             COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') as countries,
             COALESCE(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}') as directors,
             COALESCE(array_agg(DISTINCT w.name) FILTER (WHERE w.name IS NOT NULL), '{}') as writers,
             COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as studios,
             (SELECT wmo.primary_country_code FROM world_challenge_movie_origins wmo WHERE wmo.movie_id = m.id LIMIT 1) as manual_origin_code,
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code
      FROM movie_views mv
      JOIN movies m ON mv.movie_id = m.id
      LEFT JOIN movie_tags mt ON m.id = mt.movie_id
      LEFT JOIN user_tags ut ON mt.tag_id = ut.id
      LEFT JOIN movie_api_genres mag ON m.id = mag.movie_id
      LEFT JOIN api_genres ag ON mag.genre_id = ag.id
      LEFT JOIN movie_countries mc ON m.id = mc.movie_id
      LEFT JOIN countries c ON mc.country_id = c.id
      LEFT JOIN movie_directors md ON m.id = md.movie_id
      LEFT JOIN directors d ON md.director_id = d.id
      LEFT JOIN movie_writers mw ON m.id = mw.movie_id
      LEFT JOIN writers w ON mw.writer_id = w.id
      LEFT JOIN movie_studios ms ON m.id = ms.movie_id
      LEFT JOIN studios s ON ms.studio_id = s.id
      WHERE mv.user_rating >= 9.5
      GROUP BY m.id, mv.id
      ORDER BY mv.year_seen DESC NULLS LAST, mv.month_seen DESC NULLS LAST, mv.watched_at DESC, mv.id DESC;
    `;
    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar favoritos:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Rota: Terror & Tensão (Gênero ou Tags de Horror/Suspense/Gore/Vampiro)
app.get('/api/movies/horror-suspense', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT mv.id, m.id as movie_id, m.imdb_id, m.tmdb_id, m.title, m.original_title, m.release_year, m.runtime, m.synopsis, m.poster_url, m.imdb_rating, m.metacritic_score, m.rotten_tomatoes_score, m.is_custom, m.oscar_wins, m.oscar_nominations, m.vote_count, m.distributor, m.raw_api_data,
             mv.user_rating, mv.month_seen, mv.year_seen, mv.audio_type, mv.platform, mv.review_notes, mv.watched_at,
             COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags,
             COALESCE(array_agg(DISTINCT ag.name) FILTER (WHERE ag.name IS NOT NULL), '{}') as genres,
             COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') as countries,
             COALESCE(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}') as directors,
             COALESCE(array_agg(DISTINCT w.name) FILTER (WHERE w.name IS NOT NULL), '{}') as writers,
             COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as studios,
             (SELECT wmo.primary_country_code FROM world_challenge_movie_origins wmo WHERE wmo.movie_id = m.id LIMIT 1) as manual_origin_code,
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code
      FROM movie_views mv
      JOIN movies m ON mv.movie_id = m.id
      LEFT JOIN movie_tags mt ON m.id = mt.movie_id
      LEFT JOIN user_tags ut ON mt.tag_id = ut.id
      LEFT JOIN movie_api_genres mag ON m.id = mag.movie_id
      LEFT JOIN api_genres ag ON mag.genre_id = ag.id
      LEFT JOIN movie_countries mc ON m.id = mc.movie_id
      LEFT JOIN countries c ON mc.country_id = c.id
      LEFT JOIN movie_directors md ON m.id = md.movie_id
      LEFT JOIN directors d ON md.director_id = d.id
      LEFT JOIN movie_writers mw ON m.id = mw.movie_id
      LEFT JOIN writers w ON mw.writer_id = w.id
      LEFT JOIN movie_studios ms ON m.id = ms.movie_id
      LEFT JOIN studios s ON ms.studio_id = s.id
      WHERE ag.name ILIKE '%horror%' 
         OR ag.name ILIKE '%terror%' 
         OR ag.name ILIKE '%suspense%' 
         OR ag.name ILIKE '%misterio%' 
         OR ag.name ILIKE '%mistério%'
         OR ut.name ILIKE '%horror%' 
         OR ut.name ILIKE '%suspense%' 
         OR ut.name ILIKE '%gore%' 
         OR ut.name ILIKE '%vampiro%'
      GROUP BY m.id, mv.id
      ORDER BY mv.year_seen DESC NULLS LAST, mv.month_seen DESC NULLS LAST, mv.watched_at DESC, mv.id DESC;
    `;
    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar terror/suspense:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Rota: Todos os Filmes (Grelha Geral e Filtros)
app.get('/api/movies/all', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT mv.id, m.id as movie_id, m.imdb_id, m.tmdb_id, m.title, m.original_title, m.release_year, m.runtime, m.synopsis, m.poster_url, m.imdb_rating, m.metacritic_score, m.rotten_tomatoes_score, m.is_custom, m.oscar_wins, m.oscar_nominations, m.vote_count, m.distributor, m.raw_api_data,
             mv.user_rating, mv.month_seen, mv.year_seen, mv.audio_type, mv.platform, mv.review_notes, mv.watched_at,
             COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags,
             COALESCE(array_agg(DISTINCT ag.name) FILTER (WHERE ag.name IS NOT NULL), '{}') as genres,
             COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') as countries,
             COALESCE(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}') as directors,
             COALESCE(array_agg(DISTINCT w.name) FILTER (WHERE w.name IS NOT NULL), '{}') as writers,
             COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as studios,
             (SELECT wmo.primary_country_code FROM world_challenge_movie_origins wmo WHERE wmo.movie_id = m.id LIMIT 1) as manual_origin_code,
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code
      FROM movie_views mv
      JOIN movies m ON mv.movie_id = m.id
      LEFT JOIN movie_tags mt ON m.id = mt.movie_id
      LEFT JOIN user_tags ut ON mt.tag_id = ut.id
      LEFT JOIN movie_api_genres mag ON m.id = mag.movie_id
      LEFT JOIN api_genres ag ON mag.genre_id = ag.id
      LEFT JOIN movie_countries mc ON m.id = mc.movie_id
      LEFT JOIN countries c ON mc.country_id = c.id
      LEFT JOIN movie_directors md ON m.id = md.movie_id
      LEFT JOIN directors d ON md.director_id = d.id
      LEFT JOIN movie_writers mw ON m.id = mw.movie_id
      LEFT JOIN writers w ON mw.writer_id = w.id
      LEFT JOIN movie_studios ms ON m.id = ms.movie_id
      LEFT JOIN studios s ON ms.studio_id = s.id
      GROUP BY m.id, mv.id
      ORDER BY mv.year_seen DESC NULLS LAST, mv.month_seen DESC NULLS LAST, mv.watched_at DESC, mv.id DESC;
    `;
    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar todos os filmes:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4.1 Rota: Todas as Tags Customizadas Registradas no Sistema
app.get('/api/tags/all', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, name, slug FROM user_tags ORDER BY name ASC');
    return res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar tags:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Pesquisar Filme na API TMDB em tempo real
app.get('/api/movies/search-api', async (req: Request, res: Response) => {
  const { query: queryText } = req.query;
  if (!queryText || typeof queryText !== 'string') {
    return res.status(400).json({ success: false, error: 'Parâmetro "query" é obrigatório.' });
  }
  try {
    const tmdbResponse = await axios.get('https://api.themoviedb.org/3/search/movie', {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`
      },
      params: {
        query: queryText,
        language: 'pt-BR'
      }
    });
    return res.json({ success: true, results: tmdbResponse.data.results });
  } catch (err: any) {
    console.error('[Express] Erro na busca TMDB:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Detalhes do Filme no TMDB
app.get('/api/movies/details-api', async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Parâmetro "id" é obrigatório.' });
  }
  try {
    const movieData = await fetchMovieDetailsByTitle('', undefined, Number(id));
    return res.json({ success: true, data: movieData });
  } catch (err: any) {
    console.error('[Express] Erro ao obter detalhes do filme na API:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Galeria de Pôsteres Disponíveis no TMDB
app.get('/api/movies/posters-api', async (req: Request, res: Response) => {
  const { tmdb_id, imdb_id, title, year } = req.query;
  try {
    const posters = await fetchMoviePosters({
      tmdbId: tmdb_id ? Number(tmdb_id) : null,
      imdbId: imdb_id ? String(imdb_id) : null,
      title: title ? String(title) : '',
      year: year ? Number(year) : null,
    });
    return res.json({ success: true, posters });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar pôsteres na API:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function evaluatePostMovieSaveEvents(params: {
  prevXp: any;
  prevWorld: any;
  prevTm: any;
  movieId: number;
  movieTitle: string;
  sourceTrigger: 'movie_add' | 'movie_edit';
  isGhost?: boolean;
}) {
  const { prevXp, prevWorld, prevTm, movieId, movieTitle, sourceTrigger, isGhost = false } = params;
  let newlyUnlocked: any[] = [];
  let progressedTrophies: any[] = [];
  let xpStatus: any = null;
  try {
    const trophyResult = await evaluateTrophies({
      markNew: true,
      dryRun: isGhost,
      recordLastMovie:
        isGhost || sourceTrigger !== 'movie_add' ? undefined : { movieId, title: movieTitle },
    });
    newlyUnlocked = trophyResult.newlyUnlocked || [];
    progressedTrophies = trophyResult.progressedTrophies || [];
    xpStatus = trophyResult.xpStatus || null;
  } catch (e: any) {
    console.error(`[Trophies] Erro na auto-avaliação (${sourceTrigger}):`, e.message);
  }

  const nextWorld = await buildWorldChallengePayload().catch(() => null);
  const nextTm = nextWorld ? await buildTimeMachinePayload(nextWorld).catch(() => null) : null;
  if (!xpStatus) {
    xpStatus = await getQuickXpSnapshot().catch(() => null);
  }
  const xpGain = computeXpGainEvent(prevXp, xpStatus);
  const timeMachineUnlocks = computeTimeMachineEvents(prevTm, nextTm, prevXp, xpStatus, {
    movieId,
    isGhost,
  });
  const worldChallengeUnlocks = computeWorldChallengeEvents(prevWorld, nextWorld, {
    sourceTrigger,
    movieId,
    isGhost,
  });

  return {
    newlyUnlocked,
    progressedTrophies,
    timeMachineUnlocks,
    worldChallengeUnlocks,
    xpStatus,
    xpGain,
  };
}

// Rota: Adicionar Filme (Multipart com Multer — suporta is_ghost para simulação via ROLLBACK)
app.post('/api/movies/add', upload.single('poster_file'), async (req: Request, res: Response) => {
  const isGhost = req.body.is_ghost === 'true' || req.body.is_ghost === true;
  const [prevXp, prevWorld] = await Promise.all([
    getQuickXpSnapshot().catch(() => null),
    buildWorldChallengePayload().catch(() => null),
  ]);
  const prevTm = prevWorld ? await buildTimeMachinePayload(prevWorld).catch(() => null) : null;

  const cleanupGhostUpload = () => {
    if (isGhost && req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // ignore temp cleanup errors
      }
    }
  };

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    const {
      imdb_id,
      tmdb_id,
      title,
      original_title,
      release_year,
      release_date,
      runtime,
      synopsis,
      poster_url,
      imdb_rating,
      metacritic_score,
      rotten_tomatoes_score,
      is_custom,
      oscar_wins,
      oscar_nominations,

      // Relacionamentos
      countries,
      genres,
      directors,
      writers,
      studios,
      tags,

      // Visualização
      view_id,
      user_rating,
      month_seen,
      year_seen,
      audio_type,
      platform,
      review_notes,
      vote_count,
      distributor
    } = req.body;

    if (!title) {
      throw new Error('Título do filme é obrigatório.');
    }

    // Configura pôster de upload local se presente, senão usa URL externa
    let finalPosterUrl = poster_url || null;
    if (req.file && !isGhost) {
      finalPosterUrl = `/uploads/${req.file.filename}`;
    }

    const parsedCountries = parseListField(countries);
    const parsedGenres = parseListField(genres);
    const parsedDirectors = parseListField(directors);
    const parsedWriters = parseListField(writers);
    const parsedStudios = parseListField(studios);
    const parsedTags = parseListField(tags);

    let effectiveImdbId: string | null = imdb_id && imdb_id.trim() ? imdb_id.trim() : null;
    let effectiveTmdbId: number | null = parseNullableNumeric(tmdb_id);

    // Verificar duplicidade de ID IMDb / TMDB antes de inserir (no modo Fantasma evita conflito mantendo simulação)
    if (effectiveImdbId) {
      const existingRes = await dbClient.query(
        'SELECT title FROM movies WHERE imdb_id = $1',
        [effectiveImdbId]
      );
      if (existingRes.rows.length > 0) {
        if (!isGhost) {
          await dbClient.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `Já existe um filme cadastrado com este IMDb ID (${effectiveImdbId}) chamado "${existingRes.rows[0].title}". Tente pesquisar por ele no catálogo.`
          });
        }
        effectiveImdbId = null;
      }
    }
    if (effectiveTmdbId !== null) {
      const existingRes = await dbClient.query(
        'SELECT title FROM movies WHERE tmdb_id = $1',
        [effectiveTmdbId]
      );
      if (existingRes.rows.length > 0) {
        if (!isGhost) {
          await dbClient.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `Já existe um filme cadastrado com este TMDB ID (${tmdb_id}) chamado "${existingRes.rows[0].title}". Tente pesquisar por ele no catálogo.`
          });
        }
        effectiveTmdbId = null;
      }
    }

    // 1. Inserir filme na tabela movies
    const cleanReleaseDate =
      release_date && typeof release_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(release_date.trim())
        ? release_date.trim()
        : null;
    const initialRawApiData = cleanReleaseDate ? JSON.stringify({ tmdb: { release_date: cleanReleaseDate } }) : null;

    const insertMovieRes = await dbClient.query(
      `INSERT INTO movies (imdb_id, tmdb_id, title, original_title, release_year, runtime, synopsis, poster_url, imdb_rating, metacritic_score, rotten_tomatoes_score, is_custom, oscar_wins, oscar_nominations, vote_count, distributor, raw_api_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb) RETURNING id`,
      [
        effectiveImdbId,
        effectiveTmdbId,
        title,
        original_title || null,
        parseNullableNumeric(release_year),
        parseNullableNumeric(runtime),
        synopsis || null,
        finalPosterUrl,
        parseNullableNumeric(imdb_rating),
        parseNullableNumeric(metacritic_score),
        parseNullableNumeric(rotten_tomatoes_score),
        is_custom === 'true' || is_custom === true,
        parseNumeric(oscar_wins, 0),
        parseNumeric(oscar_nominations, 0),
        parseGlobalReviewsNullable(vote_count),
        distributor || null,
        initialRawApiData
      ]
    );
    const movieId = insertMovieRes.rows[0].id;

    // 2. Vincular países
    for (const name of parsedCountries) {
      if (!name.trim()) continue;
      const countryRes = await dbClient.query(
        `INSERT INTO countries (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_countries (movie_id, country_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [movieId, countryRes.rows[0].id]
      );
    }

    // Se o filme possuir apenas 1 país, registra imediatamente como origem cultural exclusiva no Desafio 195
    if (parsedCountries.length === 1 && parsedCountries[0].trim()) {
      const territoryRef = resolveTerritoryDescriptor(parsedCountries[0].trim());
      if (territoryRef && territoryRef.code) {
        await dbClient.query(
          `INSERT INTO world_challenge_movie_origins (movie_id, primary_country_code, exclusive, updated_at)
           VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
           ON CONFLICT (movie_id)
           DO UPDATE SET
             primary_country_code = EXCLUDED.primary_country_code,
             exclusive = TRUE,
             updated_at = CURRENT_TIMESTAMP`,
          [movieId, territoryRef.code]
        );
      }
    }

    // 3. Vincular gêneros
    for (const name of parsedGenres) {
      const normalized = normalizeGenre(name);
      if (!normalized) continue;
      const genreRes = await dbClient.query(
        `INSERT INTO api_genres (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [normalized]
      );
      await dbClient.query(
        `INSERT INTO movie_api_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [movieId, genreRes.rows[0].id]
      );
    }

    // 4. Vincular diretores
    for (const name of parsedDirectors) {
      if (!name.trim()) continue;
      const dirRes = await dbClient.query(
        `INSERT INTO directors (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_directors (movie_id, director_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [movieId, dirRes.rows[0].id]
      );
    }

    // Vincular roteiristas
    for (const name of parsedWriters) {
      if (!name.trim()) continue;
      const writRes = await dbClient.query(
        `INSERT INTO writers (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_writers (movie_id, writer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [movieId, writRes.rows[0].id]
      );
    }

    // 5. Vincular estúdios
    for (const name of parsedStudios) {
      if (!name.trim()) continue;
      const studioRes = await dbClient.query(
        `INSERT INTO studios (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_studios (movie_id, studio_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [movieId, studioRes.rows[0].id]
      );
    }

    // 6. Vincular tags
    for (const name of parsedTags) {
      if (!name.trim()) continue;
      const slug = name.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      const tagRes = await dbClient.query(
        `INSERT INTO user_tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim(), slug]
      );
      await dbClient.query(
        `INSERT INTO movie_tags (movie_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [movieId, tagRes.rows[0].id]
      );
    }

    // 7. Inserir visualização (movie_views)
    await dbClient.query(
      `INSERT INTO movie_views (movie_id, user_rating, month_seen, year_seen, audio_type, platform, review_notes, watched_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [
        movieId,
        parseNumeric(user_rating, 0),
        parseNullableNumeric(month_seen),
        parseNullableNumeric(year_seen),
        audio_type || null,
        platform || null,
        review_notes || null
      ]
    );

    const movieTitle = String(title || original_title || 'Último filme cadastrado');
    if (isGhost) {
      const ghostEvents = await runWithTransactionClient(dbClient, () =>
        evaluatePostMovieSaveEvents({
          prevXp,
          prevWorld,
          prevTm,
          movieId,
          movieTitle,
          sourceTrigger: 'movie_add',
          isGhost: true,
        })
      );
      await dbClient.query('ROLLBACK');
      cleanupGhostUpload();
      return res.json({
        success: true,
        isGhost: true,
        movieId: null,
        ...ghostEvents,
      });
    }

    await dbClient.query('COMMIT');
    const savedEvents = await evaluatePostMovieSaveEvents({
      prevXp,
      prevWorld,
      prevTm,
      movieId,
      movieTitle,
      sourceTrigger: 'movie_add',
      isGhost: false,
    });
    return res.json({ success: true, isGhost: false, movieId, ...savedEvents });
  } catch (err: any) {
    await dbClient.query('ROLLBACK');
    cleanupGhostUpload();
    console.error('[Express] Erro ao adicionar filme:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    dbClient.release();
  }
});

// Rota: Editar Filme (Multipart com Multer)
app.put('/api/movies/edit/:id', upload.single('poster_file'), async (req: Request, res: Response) => {
  const movieId = Number(req.params.id);
  const [prevXp, prevWorld] = await Promise.all([
    getQuickXpSnapshot().catch(() => null),
    buildWorldChallengePayload().catch(() => null),
  ]);
  const prevTm = prevWorld ? await buildTimeMachinePayload(prevWorld).catch(() => null) : null;
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    const {
      imdb_id,
      tmdb_id,
      title,
      original_title,
      release_year,
      release_date,
      runtime,
      synopsis,
      poster_url,
      imdb_rating,
      metacritic_score,
      rotten_tomatoes_score,
      oscar_wins,
      oscar_nominations,
      vote_count,
      
      // Relacionamentos
      countries,
      genres,
      directors,
      writers,
      studios,
      tags,
      
      // Dados de Visualização (movie_views)
      view_id,
      user_rating,
      month_seen,
      year_seen,
      audio_type,
      platform,
      review_notes,
      distributor
    } = req.body;

    if (!title) {
      throw new Error('Título do filme é obrigatório.');
    }

    // Configura pôster de upload local se presente, senão usa URL externa
    let finalPosterUrl = poster_url || null;
    if (req.file) {
      finalPosterUrl = `/uploads/${req.file.filename}`;
    }

    const parsedCountries = parseListField(countries);
    const parsedGenres = parseListField(genres);
    const parsedDirectors = parseListField(directors);
    const parsedWriters = parseListField(writers);
    const parsedStudios = parseListField(studios);
    const parsedTags = parseListField(tags);

    // Verificar duplicidade de ID IMDb / TMDB antes de salvar alterações
    if (imdb_id && imdb_id.trim()) {
      const existingRes = await dbClient.query(
        'SELECT title FROM movies WHERE imdb_id = $1 AND id != $2',
        [imdb_id.trim(), movieId]
      );
      if (existingRes.rows.length > 0) {
        await dbClient.query('ROLLBACK');
        dbClient.release();
        return res.status(400).json({
          success: false,
          error: `Já existe outro filme cadastrado com este IMDb ID (${imdb_id.trim()}) chamado "${existingRes.rows[0].title}". Tente pesquisar por ele no catálogo.`
        });
      }
    }
    if (tmdb_id) {
      const existingRes = await dbClient.query(
        'SELECT title FROM movies WHERE tmdb_id = $1 AND id != $2',
        [Number(tmdb_id), movieId]
      );
      if (existingRes.rows.length > 0) {
        await dbClient.query('ROLLBACK');
        dbClient.release();
        return res.status(400).json({
          success: false,
          error: `Já existe outro filme cadastrado com este TMDB ID (${tmdb_id}) chamado "${existingRes.rows[0].title}". Tente pesquisar por ele no catálogo.`
        });
      }
    }

    const activeMovieId = movieId;
    const cleanEditReleaseDate =
      typeof release_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(release_date.trim())
        ? release_date.trim()
        : null;

    // 1. Atualizar movies (marcando is_custom = TRUE)
    await dbClient.query(
      `UPDATE movies 
       SET imdb_id = $1, tmdb_id = $2, title = $3, original_title = $4, release_year = $5, runtime = $6, synopsis = $7, poster_url = $8, imdb_rating = $9, metacritic_score = $10, rotten_tomatoes_score = $11, is_custom = TRUE, oscar_wins = $12, oscar_nominations = $13, vote_count = $14, distributor = $15,
           raw_api_data = CASE
             WHEN $16::text IS NOT NULL THEN
               COALESCE(raw_api_data, '{}'::jsonb) || jsonb_build_object(
                 'tmdb',
                 COALESCE(raw_api_data->'tmdb', '{}'::jsonb) || jsonb_build_object('release_date', $16::text)
               )
             ELSE raw_api_data
           END
       WHERE id = $17`,
      [
        imdb_id || null,
        parseNullableNumeric(tmdb_id),
        title,
        original_title || null,
        parseNullableNumeric(release_year),
        parseNullableNumeric(runtime),
        synopsis || null,
        finalPosterUrl,
        parseNullableNumeric(imdb_rating),
        parseNullableNumeric(metacritic_score),
        parseNullableNumeric(rotten_tomatoes_score),
        parseNumeric(oscar_wins, 0),
        parseNumeric(oscar_nominations, 0),
        parseGlobalReviewsNullable(vote_count),
        distributor || null,
        cleanEditReleaseDate,
        activeMovieId
      ]
    );

    // 2. Atualizar países
    await dbClient.query('DELETE FROM movie_countries WHERE movie_id = $1', [activeMovieId]);
    for (const name of parsedCountries) {
      if (!name.trim()) continue;
      const countryRes = await dbClient.query(
        `INSERT INTO countries (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_countries (movie_id, country_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [activeMovieId, countryRes.rows[0].id]
      );
    }

    // Se o filme possuir apenas 1 país, registra imediatamente como origem cultural exclusiva no Desafio 195
    if (parsedCountries.length === 1 && parsedCountries[0].trim()) {
      const territoryRef = resolveTerritoryDescriptor(parsedCountries[0].trim());
      if (territoryRef && territoryRef.code) {
        await dbClient.query(
          `INSERT INTO world_challenge_movie_origins (movie_id, primary_country_code, exclusive, updated_at)
           VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
           ON CONFLICT (movie_id)
           DO UPDATE SET
             primary_country_code = EXCLUDED.primary_country_code,
             exclusive = TRUE,
             updated_at = CURRENT_TIMESTAMP`,
          [activeMovieId, territoryRef.code]
        );
      }
    }

    // 3. Atualizar gêneros
    await dbClient.query('DELETE FROM movie_api_genres WHERE movie_id = $1', [activeMovieId]);
    for (const name of parsedGenres) {
      const normalized = normalizeGenre(name);
      if (!normalized) continue;
      const genreRes = await dbClient.query(
        `INSERT INTO api_genres (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [normalized]
      );
      await dbClient.query(
        `INSERT INTO movie_api_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [activeMovieId, genreRes.rows[0].id]
      );
    }

    // 4. Atualizar diretores
    await dbClient.query('DELETE FROM movie_directors WHERE movie_id = $1', [activeMovieId]);
    for (const name of parsedDirectors) {
      if (!name.trim()) continue;
      const dirRes = await dbClient.query(
        `INSERT INTO directors (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_directors (movie_id, director_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [activeMovieId, dirRes.rows[0].id]
      );
    }

    // Atualizar roteiristas
    await dbClient.query('DELETE FROM movie_writers WHERE movie_id = $1', [activeMovieId]);
    for (const name of parsedWriters) {
      if (!name.trim()) continue;
      const writRes = await dbClient.query(
        `INSERT INTO writers (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_writers (movie_id, writer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [activeMovieId, writRes.rows[0].id]
      );
    }

    // 5. Atualizar estúdios
    await dbClient.query('DELETE FROM movie_studios WHERE movie_id = $1', [activeMovieId]);
    for (const name of parsedStudios) {
      if (!name.trim()) continue;
      const studioRes = await dbClient.query(
        `INSERT INTO studios (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim()]
      );
      await dbClient.query(
        `INSERT INTO movie_studios (movie_id, studio_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [activeMovieId, studioRes.rows[0].id]
      );
    }

    // 6. Atualizar tags
    await dbClient.query('DELETE FROM movie_tags WHERE movie_id = $1', [activeMovieId]);
    for (const name of parsedTags) {
      if (!name.trim()) continue;
      const slug = name.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      const tagRes = await dbClient.query(
        `INSERT INTO user_tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name.trim(), slug]
      );
      await dbClient.query(
        `INSERT INTO movie_tags (movie_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [activeMovieId, tagRes.rows[0].id]
      );
    }

    // 7. Atualizar visualização (movie_views)
    const numericRating = parseNumeric(user_rating, 0);
    const numericMonth = parseNullableNumeric(month_seen);
    const numericYear = parseNullableNumeric(year_seen);

    if (view_id) {
      await dbClient.query(
        `UPDATE movie_views 
         SET user_rating = $1, month_seen = $2, year_seen = $3, audio_type = $4, platform = $5, review_notes = $6, movie_id = $7
         WHERE id = $8`,
        [
          numericRating,
          numericMonth,
          numericYear,
          audio_type || null,
          platform || null,
          review_notes || null,
          activeMovieId,
          Number(view_id)
        ]
      );
    } else {
      const checkView = await dbClient.query('SELECT id FROM movie_views WHERE movie_id = $1 LIMIT 1', [activeMovieId]);
      if (checkView.rows.length > 0) {
        await dbClient.query(
          `UPDATE movie_views 
           SET user_rating = $1, month_seen = $2, year_seen = $3, audio_type = $4, platform = $5, review_notes = $6, movie_id = $7
           WHERE id = $8`,
          [
            numericRating,
            numericMonth,
            numericYear,
            audio_type || null,
            platform || null,
            review_notes || null,
            activeMovieId,
            checkView.rows[0].id
          ]
        );
      } else {
        await dbClient.query(
          `INSERT INTO movie_views (movie_id, user_rating, month_seen, year_seen, audio_type, platform, review_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            activeMovieId,
            numericRating,
            numericMonth,
            numericYear,
            audio_type || null,
            platform || null,
            review_notes || null
          ]
        );
      }
    }

    await dbClient.query('COMMIT');
    const savedEvents = await evaluatePostMovieSaveEvents({
      prevXp,
      prevWorld,
      prevTm,
      movieId: activeMovieId,
      movieTitle: String(title || original_title || 'Filme editado'),
      sourceTrigger: 'movie_edit',
      isGhost: false,
    });
    return res.json({ success: true, ...savedEvents });
  } catch (err: any) {
    await dbClient.query('ROLLBACK');
    console.error('[Express] Erro ao editar filme:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    dbClient.release();
  }
});

// Rota: Deletar Filme Permanentemente
app.delete('/api/movies/:id', async (req: Request, res: Response) => {
  const movieId = Number(req.params.id);
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    
    // Deleta o filme da tabela principal movies.
    // Pelo ON DELETE CASCADE, todas as visualizações, tags, diretores, gêneros e países vinculados serão removidos.
    const deleteRes = await dbClient.query('DELETE FROM movies WHERE id = $1', [movieId]);
    
    if (deleteRes.rowCount === 0) {
      throw new Error('Filme não encontrado.');
    }
    
    await dbClient.query('COMMIT');
    console.log(`[Express] Filme com ID ${movieId} foi deletado permanentemente.`);
    // Reavalia troféus após deletar filme
    evaluateTrophies({ markNew: false }).catch((e) => console.error('[Trophies] Erro na auto-avaliação pós-delete:', e.message));
    return res.json({ success: true, message: 'Filme excluído com sucesso.' });
  } catch (err: any) {
    await dbClient.query('ROLLBACK');
    console.error('[Express] Erro ao deletar filme:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    dbClient.release();
  }
});

// Rota: Sincronizar Notas das APIs (OMDb) em tempo real
app.get('/api/movies/fetch-external-ratings', async (req: Request, res: Response) => {
  const { imdb_id, title } = req.query;
  try {
    // Recarrega variáveis de ambiente para refletir alterações sem precisar de restart do processo Node
    dotenv.config({ override: true });
    const OMDB_API_KEY = process.env.OMDB_API_KEY || 'trilogy';
    if (!OMDB_API_KEY) {
      throw new Error('Configuração ausente: OMDB_API_KEY não está definido.');
    }

    let url = '';
    if (imdb_id) {
      url = `http://www.omdbapi.com/?i=${imdb_id}&apikey=${OMDB_API_KEY}`;
    } else if (title) {
      url = `http://www.omdbapi.com/?t=${encodeURIComponent(String(title))}&apikey=${OMDB_API_KEY}`;
    } else {
      return res.status(400).json({ success: false, error: 'Parâmetro "imdb_id" ou "title" é obrigatório.' });
    }

    console.log(`[Express] Buscando notas no OMDb via url: ${url}`);
    const omdbResponse = await axios.get(url);
    const o = omdbResponse.data;

    if (o && o.Response === 'True') {
      let imdbRating: number | null = null;
      let metacriticScore: number | null = null;
      let rottenTomatoesScore: number | null = null;
      let voteCount: number | null = null;

      if (o.imdbRating && o.imdbRating !== 'N/A') {
        imdbRating = parseFloat(o.imdbRating);
      }
      if (o.Metascore && o.Metascore !== 'N/A') {
        metacriticScore = parseInt(o.Metascore, 10);
      }
      if (o.Ratings && o.Ratings.length > 0) {
        const rt = o.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
        if (rt && rt.Value) {
          const rtMatch = rt.Value.match(/\d+/);
          if (rtMatch) {
            rottenTomatoesScore = parseInt(rtMatch[0], 10);
          }
        }
      }
      if (o.imdbVotes && o.imdbVotes !== 'N/A') {
        voteCount = parseInt(o.imdbVotes.replace(/,/g, ''), 10);
      }

      return res.json({
        success: true,
        data: {
          imdb_rating: imdbRating,
          metacritic_score: metacriticScore,
          rotten_tomatoes_score: rottenTomatoesScore,
          vote_count: voteCount
        }
      });
    } else {
      return res.status(404).json({ success: false, error: o.Error || 'Filme não encontrado no OMDb.' });
    }
  } catch (err: any) {
    console.error('[Express] Erro ao buscar notas externas:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Atualização Seletiva de Métricas Externas da API para 1 filme (Notas, Votos e Oscars APENAS)
app.post('/api/movies/:id/refresh-api-metrics', async (req: Request, res: Response) => {
  const movieId = Number(req.params.id);
  if (!movieId || Number.isNaN(movieId)) {
    return res.status(400).json({ success: false, error: 'ID de filme inválido.' });
  }

  const prevXp = await getQuickXpSnapshot().catch(() => null);
  try {
    const currentRes = await query(
      `SELECT id, imdb_id, tmdb_id, title, original_title, release_year,
              imdb_rating, metacritic_score, rotten_tomatoes_score,
              vote_count, oscar_wins, oscar_nominations
       FROM movies
       WHERE id = $1`,
      [movieId]
    );

    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Filme não encontrado no banco de dados.' });
    }

    const diff = await refreshSingleMovieExternalMetrics(currentRes.rows[0]);

    let newlyUnlocked: any[] = [];
    let progressedTrophies: any[] = [];
    let xpStatus: any = null;
    if (diff.anyChanged) {
      try {
        const trophyResult = await evaluateTrophies({ markNew: true });
        newlyUnlocked = trophyResult.newlyUnlocked || [];
        progressedTrophies = trophyResult.progressedTrophies || [];
        xpStatus = trophyResult.xpStatus || null;
      } catch (e: any) {
        console.error('[Trophies] Erro pós-refresh-api-metrics:', e.message);
      }
    }
    if (!xpStatus) {
      xpStatus = await getQuickXpSnapshot().catch(() => null);
    }
    const xpGain = computeXpGainEvent(prevXp, xpStatus);
    const timeMachineUnlocks = computeTimeMachineUnlocks(prevXp, xpStatus);

    return res.json({
      success: true,
      movieId: diff.movieId,
      title: diff.title,
      metrics: diff.metrics,
      changes: diff.changes,
      newlyUnlocked,
      progressedTrophies,
      timeMachineUnlocks,
      xpStatus,
      xpGain,
    });
  } catch (err: any) {
    console.error('[Express] Erro ao atualizar dados da API seletivamente:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rotas: Atualização em Lote de Métricas Externas para TODOS os filmes do Catálogo
app.post('/api/movies/refresh-all-api-metrics/start', async (req: Request, res: Response) => {
  try {
    const job = await startCatalogApiRefreshJob();
    return res.json({ success: true, jobId: job.jobId, total: job.total, status: job.status });
  } catch (err: any) {
    console.error('[Express] Erro ao iniciar atualização em lote da API:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/movies/refresh-all-api-metrics/status/:jobId', (req: Request, res: Response) => {
  const job = getCatalogApiRefreshJob(String(req.params.jobId));
  if (!job) {
    return res.status(404).json({ success: false, error: 'Sessão de atualização não encontrada.' });
  }
  return res.json({ success: true, data: job });
});

app.post('/api/movies/refresh-all-api-metrics/cancel/:jobId', (req: Request, res: Response) => {
  const cancelled = cancelCatalogApiRefreshJob(String(req.params.jobId));
  return res.json({ success: cancelled });
});

// Rota: Buscar Países Ativos (com pelo menos 1 filme associado)
app.get('/api/countries/active', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT c.id, c.name, COUNT(mc.movie_id) as count
      FROM countries c
      JOIN movie_countries mc ON c.id = mc.country_id
      GROUP BY c.id, c.name
      ORDER BY c.name ASC;
    `;
    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar países ativos:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Adicionar Novo País
app.post('/api/countries/add', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Nome do país é obrigatório.' });
  }
  try {
    const sql = `
      INSERT INTO countries (name) 
      VALUES ($1) 
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
      RETURNING id, name;
    `;
    const result = await query(sql, [name.trim()]);
    return res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('[Express] Erro ao adicionar país:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Buscar Estúdios Ativos (com pelo menos 1 filme associado)
app.get('/api/studios/active', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT s.id, s.name, COUNT(ms.movie_id) as count
      FROM studios s
      JOIN movie_studios ms ON s.id = ms.studio_id
      GROUP BY s.id, s.name
      ORDER BY s.name ASC;
    `;
    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar estúdios ativos:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Buscar Plataformas Ativas
app.get('/api/platforms/active', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT DISTINCT platform 
      FROM movie_views 
      WHERE platform IS NOT NULL AND platform != ''
      ORDER BY platform ASC;
    `;
    const result = await query(sql);
    return res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Express] Erro ao buscar plataformas ativas:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// ROTAS DE IMPORTAÇÃO DE PLANILHA (.CSV / .XLSX / .XLSM) DIRETO PELO SITE
// ============================================================================

// Rota: Baixar planilha modelo (.xlsx) limpa e pronta para preenchimento
app.get('/api/movies/import-template', (req: Request, res: Response) => {
  try {
    const buffer = generateTemplateXlsxBuffer();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Modelo_Catalogo_Filmes.xlsx"'
    );
    return res.send(buffer);
  } catch (err: any) {
    console.error('[Importer] Erro ao gerar modelo .xlsx:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Enviar planilha e iniciar job assíncrono incremental
app.post('/api/movies/import-sheet', (req: Request, res: Response) => {
  sheetUpload.single('sheet_file')(req, res, async (uploadErr: any) => {
    if (uploadErr) {
      return res.status(400).json({ success: false, error: uploadErr.message });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo de planilha foi enviado.',
      });
    }
    try {
      const job = await startSpreadsheetImportJob(
        req.file.buffer,
        req.file.originalname
      );
      return res.json({
        success: true,
        jobId: job.jobId,
        total: job.total,
        fileName: job.fileName,
      });
    } catch (err: any) {
      console.error('[Importer] Erro ao iniciar importação:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });
});

// Rota: Consultar progresso em tempo real e itens para revisão
app.get('/api/movies/import-status/:jobId', (req: Request, res: Response) => {
  const job = getImportJob(String(req.params.jobId));
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Sessão de importação não encontrada.',
    });
  }
  return res.json({ success: true, data: job });
});

// Rota: Cancelar importação em andamento (mantém os filmes já salvos até o momento)
app.post('/api/movies/import-cancel/:jobId', (req: Request, res: Response) => {
  const cancelled = cancelImportJob(String(req.params.jobId));
  return res.json({ success: cancelled });
});

// ============================================================================
// ROTAS DO DESAFIO "VOLTA AO MUNDO EM 195 FILMES" (WAR ROOM & CURADORIA)
// ============================================================================

// Rota: Obter panorama completo dos 195 países, campeões automáticos/manuais, alvos e territórios históricos
app.get('/api/challenge/world-195', async (req: Request, res: Response) => {
  try {
    const data = await buildWorldChallengePayload();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[WorldChallenge] Erro ao carregar desafio 195 países:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function evaluateWorldActionFeedback(
  prevXp: any,
  prevWorld: any,
  nextWorld: any,
  sourceTrigger: 'country_pick' | 'coproduction_curate',
  movieId?: number
) {
  let newlyUnlocked: any[] = [];
  let progressedTrophies: any[] = [];
  let xpStatus: any = null;
  try {
    const trophyResult = await evaluateTrophies({ markNew: true });
    newlyUnlocked = trophyResult.newlyUnlocked || [];
    progressedTrophies = trophyResult.progressedTrophies || [];
    xpStatus = trophyResult.xpStatus || null;
  } catch (e: any) {
    console.error(`[Trophies] Erro pós-${sourceTrigger}:`, e.message);
  }
  if (!xpStatus) {
    xpStatus = await getQuickXpSnapshot().catch(() => null);
  }
  const xpGain = computeXpGainEvent(prevXp, xpStatus);
  const worldChallengeUnlocks = computeWorldChallengeEvents(prevWorld, nextWorld, {
    sourceTrigger,
    movieId,
  });
  return { newlyUnlocked, progressedTrophies, xpStatus, xpGain, worldChallengeUnlocks };
}

// Rota: Fixar (ou restaurar automático se movieId = null) o Filme Campeão de um país
app.put('/api/challenge/world-195/pick/:countryCode', async (req: Request, res: Response) => {
  try {
    const [prevXp, prevWorld] = await Promise.all([
      getQuickXpSnapshot().catch(() => null),
      buildWorldChallengePayload().catch(() => null),
    ]);
    const countryCode = String(req.params.countryCode);
    const { countryName, movieId, lockExclusiveOrigin } = req.body;
    const parsedMovieId =
      movieId === null || movieId === undefined || movieId === '' ? null : Number(movieId);

    const data = await setManualCountryPick(
      countryCode,
      countryName || countryCode.toUpperCase(),
      parsedMovieId,
      Boolean(lockExclusiveOrigin)
    );
    const feedback = await evaluateWorldActionFeedback(
      prevXp,
      prevWorld,
      data,
      'country_pick',
      parsedMovieId ?? undefined
    );
    return res.json({ success: true, data, ...feedback });
  } catch (err: any) {
    console.error('[WorldChallenge] Erro ao salvar escolha manual:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Consagrar (ou liberar) Origem Cultural Exclusiva de uma coprodução
app.put('/api/challenge/world-195/origin/:movieId', async (req: Request, res: Response) => {
  try {
    const [prevXp, prevWorld] = await Promise.all([
      getQuickXpSnapshot().catch(() => null),
      buildWorldChallengePayload().catch(() => null),
    ]);
    const movieId = Number(req.params.movieId);
    const { countryCode } = req.body;
    const cleanCode = countryCode ? String(countryCode).trim() : null;
    const data = await setMovieCulturalOrigin(movieId, cleanCode);
    const feedback = await evaluateWorldActionFeedback(
      prevXp,
      prevWorld,
      data,
      'coproduction_curate',
      movieId
    );
    return res.json({ success: true, data, ...feedback });
  } catch (err: any) {
    console.error('[WorldChallenge] Erro ao atualizar origem cultural:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Salvar ou limpar Filme Alvo (Backlog / Wishlist) para países pendentes ("Terra Incógnita")
app.put('/api/challenge/world-195/wishlist/:countryCode', async (req: Request, res: Response) => {
  try {
    const countryCode = String(req.params.countryCode);
    const { countryName, wishlist } = req.body;
    const data = await setCountryWishlistTarget(
      countryCode,
      countryName || countryCode.toUpperCase(),
      wishlist || null
    );
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[WorldChallenge] Erro ao salvar alvo/wishlist do país:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// ROTAS DA PÁGINA 5: "MÁQUINA DO TEMPO: O SÉCULO DO CINEMA"
// ============================================================================

// Rota: Obter panorama completo dos anos (1920..Hoje + Pioneiros), campeões por Maior Nota ou escolha manual, e décadas
app.get('/api/challenge/time-machine', async (req: Request, res: Response) => {
  try {
    const data = await buildTimeMachinePayload();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[TimeMachine] Erro ao carregar Máquina do Tempo:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Fixar manualmente (ou restaurar automático se movieId = null) o Filme Campeão de um ano
app.put('/api/challenge/time-machine/pick/:year', async (req: Request, res: Response) => {
  try {
    const year = Number(req.params.year);
    const { movieId } = req.body;
    const parsedMovieId =
      movieId === null || movieId === undefined || movieId === '' ? null : Number(movieId);
    const data = await setManualYearPick(year, parsedMovieId);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[TimeMachine] Erro ao salvar escolha manual do ano:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Salvar ou limpar Filme Alvo (Wishlist Temporal) para anos bloqueados
app.put('/api/challenge/time-machine/wishlist/:year', async (req: Request, res: Response) => {
  try {
    const year = Number(req.params.year);
    const { wishlist } = req.body;
    const data = await setYearWishlistTarget(year, wishlist || null);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[TimeMachine] Erro ao salvar alvo temporal do ano:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// ROTAS DO MOTOR DE TROFÉUS E CONQUISTAS (ESTILO PLAYSTATION PS5)
// ============================================================================

// Rota: Obter todos os troféus, resumo geral, contagem por tier e novidades
app.get('/api/trophies', async (req: Request, res: Response) => {
  try {
    const data = await evaluateTrophies({ markNew: false });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Trophies] Erro ao listar troféus:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Reavaliar todos os troféus contra os filmes reais salvos no banco
app.post('/api/trophies/evaluate', async (req: Request, res: Response) => {
  try {
    const markNew = req.body.markNew !== undefined ? Boolean(req.body.markNew) : true;
    const data = await evaluateTrophies({ markNew });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Trophies] Erro ao avaliar troféus:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Reconhecer novos troféus (limpa a flag is_new para não re-disparar toasts)
app.post('/api/trophies/ack-new', async (req: Request, res: Response) => {
  try {
    const trophyIds = req.body.trophyIds as string[] | undefined;
    await acknowledgeNewTrophies(trophyIds);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Trophies] Erro ao reconhecer novos troféus:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Forçar status de teste de um troféu (Ferramenta de Homologação)
app.post('/api/trophies/test/override', async (req: Request, res: Response) => {
  try {
    const prevXp = await getQuickXpSnapshot().catch(() => null);
    const { trophyId, overrideState } = req.body;
    if (!trophyId) {
      return res.status(400).json({ success: false, error: 'trophyId é obrigatório' });
    }
    const parsedState = overrideState === null ? null : Boolean(overrideState);
    await setTrophyTestOverride(String(trophyId), parsedState);
    const data = await evaluateTrophies({ markNew: false });
    const xpGain = computeXpGainEvent(prevXp, data.xpStatus);
    return res.json({ success: true, data, xpStatus: data.xpStatus, xpGain });
  } catch (err: any) {
    console.error('[Trophies] Erro ao aplicar override de teste:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Resetar todos os overrides de teste e reavaliar do zero
app.post('/api/trophies/test/reset-all', async (req: Request, res: Response) => {
  try {
    await resetAllTrophyOverrides();
    const data = await evaluateTrophies({ markNew: false });
    return res.json({ success: true, data, xpStatus: data.xpStatus });
  } catch (err: any) {
    console.error('[Trophies] Erro ao resetar testes:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// ROTA DO SISTEMA OFICIAL DE XP E NÍVEIS DO USUÁRIO
// ============================================================================
app.get('/api/xp', async (req: Request, res: Response) => {
  try {
    const xpStatus = await getQuickXpSnapshot();
    return res.json({ success: true, data: xpStatus });
  } catch (err: any) {
    console.error('[XP] Erro ao consultar status de XP:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`[Server] Servidor backend rodando em http://localhost:${PORT}`);
  await testConnection();
  try {
    await ensureTimeMachineTables();
    await seedTrophies();
    const initialTrophies = await evaluateTrophies({ markNew: false });
    console.log(
      `[Trophies] Motor PS5 iniciado com sucesso! Desbloqueados: ${initialTrophies.unlockedCount}/${initialTrophies.totalTrophies} (${initialTrophies.overallPercentage}%)`
    );
  } catch (tErr: any) {
    console.error('[Trophies] Erro ao inicializar troféus no boot:', tErr.message);
  }
});
