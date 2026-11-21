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
  getCachedTrophiesSummary,
  getTrophyChecklistById,
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
import {
  seedUniverses,
  evaluateAndBuildUniverseCodex,
} from './services/universeCodexService';
import {
  buildWalkOfFamePayload,
  getWalkOfFamePendingPacksSummary,
  checkWalkOfFameMovieTrigger,
  stickWalkOfFameStar,
  stickWalkOfFameStarsBatch,
  unstickWalkOfFameStar,
  openWalkOfFamePack,
  updateWalkOfFamePreferences,
  saveWalkOfFameCustomSkin,
  invalidateWalkOfFameCache,
} from './services/walkOfFameService';
import {
  ensureSecretDrawTables,
  ensurePoolPopulatedIfEmpty,
  getSecretDrawStatus,
  drawSecretCards,
  chooseSecretCard,
  finishSecretDrawRound,
  declineSecretPick,
  boomerangSecretPick,
  claimSecretDrawPick,
  labCompleteSecretPick,
  labAddWeeklyDrawChip,
  labResetSecretDraws,
  syncSecretDrawPoolFromBuffer,
  checkAndCompleteActiveDrawOnMovieSave,
  activateSecretDrawClassPower,
} from './services/secretDrawService';
import {
  ensureChimeraTables,
  getChimeraStatus,
  forgeChimeraContract,
  pickChimeraFateRune,
  applyChimeraPillarAction,
  claimChimeraContract,
  discardChimeraContract,
  declineChimeraContract,
  labAddChimeraChip,
  labSimulateMatchChimera,
  labResetChimeras,
  checkChimeraMatchOnMovieSave,
  activateChimeraClassPower,
} from './services/chimeraService';
import {
  ensureBingoTables,
  getBingoStatus,
  forgeBingoBoard,
  archiveExpiredBingoBoard,
  applyBingoBoardAction,
  claimBingoReward,
  evaluateBingoOnMovieSave,
  evaluateBingoOnSecretDrawClaim,
  evaluateBingoOnChimeraClaim,
  evaluateBingoOnStickerGain,
  labAddBingoChip,
  labSimulateBingoProgress,
  labSimulateBingoMonthRollover,
  labResetBingo,
  BingoChipType,
  activateBingoClassPower,
} from './services/bingoService';
import {
  getClassPowerWalletStatus,
  labGrantClassPowerCharge,
} from './services/classPowersService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import zlib from 'node:zlib';
import {
  derivePinSessionToken,
  getConfiguredAppPassword,
  isRequestAuthenticated,
  requireWriteAuth,
  verifyAppPassword,
} from './middleware/appAuth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-token', 'x-app-password'],
  })
);
app.use(express.json());

// Compressão Gzip nativa para respostas JSON acima de 1 KB
app.use((req: Request, res: Response, next) => {
  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  if (req.method === 'HEAD' || !/\bgzip\b/i.test(acceptEncoding)) {
    return next();
  }
  const originalJson = res.json.bind(res);
  res.json = ((body: any) => {
    if (res.headersSent) return res;
    const rawBuf = Buffer.from(JSON.stringify(body), 'utf8');
    if (rawBuf.length < 1024) {
      return originalJson(body);
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    zlib.gzip(rawBuf, (err, gzBuf) => {
      if (res.writableEnded || res.destroyed) return;
      if (err) {
        res.removeHeader('Content-Encoding');
        return originalJson(body);
      }
      res.setHeader('Content-Length', String(gzBuf.length));
      return res.end(gzBuf);
    });
    return res;
  }) as any;
  return next();
});

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

// Proteção global de escrita na API por PIN (POST/PUT/PATCH/DELETE sob /api, exceto /api/auth/verify)
app.use('/api', requireWriteAuth);

// Rotas de autenticação por PIN (tela de bloqueio do app)
app.get('/api/auth/status', (req: Request, res: Response) => {
  return res.json({
    success: true,
    lockEnabled: true,
    authenticated: isRequestAuthenticated(req),
  });
});

app.post('/api/auth/verify', (req: Request, res: Response) => {
  const password = String(req.body?.password ?? '');
  if (!verifyAppPassword(password)) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_PIN',
      error: 'PIN incorreto. Tente novamente.',
    });
  }
  const token = derivePinSessionToken(getConfiguredAppPassword());
  return res.json({
    success: true,
    token,
  });
});

// Rota de Health Check / Status
app.get('/api/health', async (req: Request, res: Response) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'OK',
    timestamp: new Date(),
    database: dbConnected ? 'Conectado' : 'Erro de Conexão',
  });
});

const SECRET_DRAW_MOVIE_SELECT_FIELDS = `
             (SELECT sdp.difficulty FROM secret_draw_picks sdp WHERE sdp.completed_movie_id = m.id AND sdp.status = 'completed' ORDER BY sdp.completed_at DESC NULLS LAST, sdp.id DESC LIMIT 1) as secret_draw_difficulty,
             (SELECT sdp.xp_awarded FROM secret_draw_picks sdp WHERE sdp.completed_movie_id = m.id AND sdp.status = 'completed' ORDER BY sdp.completed_at DESC NULLS LAST, sdp.id DESC LIMIT 1) as secret_draw_xp
`;

// 1. Rota: Último Filme Assistido (Destaque HeroBanner)
app.get('/api/movies/latest', async (req: Request, res: Response) => {
  try {
    await ensureSecretDrawTables();
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
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code,
${SECRET_DRAW_MOVIE_SELECT_FIELDS}
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
    await ensureSecretDrawTables();
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
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code,
${SECRET_DRAW_MOVIE_SELECT_FIELDS}
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
    await ensureSecretDrawTables();
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
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code,
${SECRET_DRAW_MOVIE_SELECT_FIELDS}
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
    await ensureSecretDrawTables();
    const sql = `
      SELECT mv.id, m.id as movie_id, m.imdb_id, m.tmdb_id, m.title, m.original_title, m.release_year, m.runtime, m.synopsis, m.poster_url, m.imdb_rating, m.metacritic_score, m.rotten_tomatoes_score, m.is_custom, m.oscar_wins, m.oscar_nominations, m.vote_count, m.distributor,
             CASE
               WHEN m.raw_api_data IS NULL THEN NULL
               ELSE jsonb_strip_nulls(jsonb_build_object(
                 'omdb', m.raw_api_data->'omdb',
                 'tmdb', jsonb_strip_nulls(jsonb_build_object(
                   'release_date', m.raw_api_data->'tmdb'->'release_date',
                   'vote_count', m.raw_api_data->'tmdb'->'vote_count',
                   'production_companies', m.raw_api_data->'tmdb'->'production_companies',
                   'images', m.raw_api_data->'tmdb'->'images',
                   'credits', CASE
                     WHEN jsonb_typeof(m.raw_api_data->'tmdb'->'credits'->'crew') = 'array' THEN
                       jsonb_build_object(
                         'crew',
                         COALESCE((
                           SELECT jsonb_agg(jsonb_build_object('name', elem->'name', 'job', elem->'job'))
                           FROM jsonb_array_elements(m.raw_api_data->'tmdb'->'credits'->'crew') elem
                           WHERE elem->>'job' IN ('Director', 'Writer', 'Screenplay', 'Story', 'Characters', 'Producer', 'Executive Producer')
                         ), '[]'::jsonb)
                       )
                     ELSE NULL
                   END
                 ))
               ))
             END AS raw_api_data,
             mv.user_rating, mv.month_seen, mv.year_seen, mv.audio_type, mv.platform, mv.review_notes, mv.watched_at,
             COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags,
             COALESCE(array_agg(DISTINCT ag.name) FILTER (WHERE ag.name IS NOT NULL), '{}') as genres,
             COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') as countries,
             COALESCE(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}') as directors,
             COALESCE(array_agg(DISTINCT w.name) FILTER (WHERE w.name IS NOT NULL), '{}') as writers,
             COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as studios,
             (SELECT wmo.primary_country_code FROM world_challenge_movie_origins wmo WHERE wmo.movie_id = m.id LIMIT 1) as manual_origin_code,
             (SELECT wcp.country_code FROM world_challenge_picks wcp WHERE wcp.champion_movie_id = m.id ORDER BY wcp.updated_at DESC LIMIT 1) as manual_pick_code,
${SECRET_DRAW_MOVIE_SELECT_FIELDS}
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

/**
 * Persiste/atualiza relações N:N de um filme (países, gêneros, diretores, roteiristas, estúdios, tags)
 * em lote via UNNEST, evitando dezenas de round-trips sequenciais por salvamento.
 */
async function syncMovieRelations(params: {
  dbClient: any;
  movieId: number;
  countries: string[];
  genres: string[];
  directors: string[];
  writers: string[];
  studios: string[];
  tags: string[];
  replaceExisting: boolean;
}) {
  const {
    dbClient,
    movieId,
    countries,
    genres,
    directors,
    writers,
    studios,
    tags,
    replaceExisting,
  } = params;

  const upsertAndLinkNames = async (
    table: string,
    joinTable: string,
    fkCol: string,
    names: string[]
  ) => {
    if (replaceExisting) {
      await dbClient.query(`DELETE FROM ${joinTable} WHERE movie_id = $1`, [movieId]);
    }
    const clean = Array.from(new Set(names.map((n) => String(n || '').trim()).filter(Boolean)));
    if (clean.length === 0) return;

    const entRes = await dbClient.query(
      `INSERT INTO ${table} (name)
       SELECT n FROM UNNEST($1::text[]) AS t(n)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [clean]
    );
    const ids = entRes.rows.map((r: any) => Number(r.id)).filter(Boolean);
    if (ids.length > 0) {
      await dbClient.query(
        `INSERT INTO ${joinTable} (movie_id, ${fkCol})
         SELECT $1, eid FROM UNNEST($2::int[]) AS t(eid)
         ON CONFLICT DO NOTHING`,
        [movieId, ids]
      );
    }
  };

  await upsertAndLinkNames('countries', 'movie_countries', 'country_id', countries);

  // Se o filme possuir apenas 1 país, registra imediatamente como origem cultural exclusiva no Desafio 195
  if (countries.length === 1 && String(countries[0] || '').trim()) {
    const territoryRef = resolveTerritoryDescriptor(String(countries[0]).trim());
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

  const normalizedGenres = genres.map((g) => normalizeGenre(String(g || ''))).filter(Boolean);
  await upsertAndLinkNames('api_genres', 'movie_api_genres', 'genre_id', normalizedGenres);
  await upsertAndLinkNames('directors', 'movie_directors', 'director_id', directors);
  await upsertAndLinkNames('writers', 'movie_writers', 'writer_id', writers);
  await upsertAndLinkNames('studios', 'movie_studios', 'studio_id', studios);

  if (replaceExisting) {
    await dbClient.query('DELETE FROM movie_tags WHERE movie_id = $1', [movieId]);
  }
  const tagBySlug = new Map<string, string>();
  for (const rawName of tags) {
    const cleanName = String(rawName || '').trim();
    if (!cleanName) continue;
    const slug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (slug && !tagBySlug.has(slug)) {
      tagBySlug.set(slug, cleanName);
    }
  }
  if (tagBySlug.size > 0) {
    const tagRes = await dbClient.query(
      `INSERT INTO user_tags (name, slug)
       SELECT n, s FROM UNNEST($1::text[], $2::text[]) AS t(n, s)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [Array.from(tagBySlug.values()), Array.from(tagBySlug.keys())]
    );
    const tagIds = tagRes.rows.map((r: any) => Number(r.id)).filter(Boolean);
    if (tagIds.length > 0) {
      await dbClient.query(
        `INSERT INTO movie_tags (movie_id, tag_id)
         SELECT $1, tid FROM UNNEST($2::int[]) AS t(tid)
         ON CONFLICT DO NOTHING`,
        [movieId, tagIds]
      );
    }
  }
}

interface BingoMovieInput {
  tmdbId: number | null;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  runtime: number | null;
  voteCount: number;
  imdbRating: number | null;
  rottenTomatoesScore: number | null;
  metacriticScore: number | null;
  userRating: number | null;
  audioType: string | null;
  platform: string | null;
  reviewNotes: string | null;
  oscarWins: number;
  oscarNominations: number;
  countries: string[];
  genres: string[];
  tags: string[];
}

function buildBingoMovieInputFromBody(
  body: any,
  extras: { tmdbId: number | null; countries: string[]; genres: string[]; tags: string[] }
): BingoMovieInput {
  return {
    tmdbId: extras.tmdbId,
    title: String(body?.title || ''),
    originalTitle: body?.original_title ? String(body.original_title) : null,
    releaseYear: parseNullableNumeric(body?.release_year),
    runtime: parseNullableNumeric(body?.runtime),
    voteCount: parseGlobalReviewsNullable(body?.vote_count) ?? 0,
    imdbRating: parseNullableNumeric(body?.imdb_rating),
    rottenTomatoesScore: parseNullableNumeric(body?.rotten_tomatoes_score),
    metacriticScore: parseNullableNumeric(body?.metacritic_score),
    userRating: parseNullableNumeric(body?.user_rating),
    audioType: body?.audio_type ? String(body.audio_type) : null,
    platform: body?.platform ? String(body.platform) : null,
    reviewNotes: body?.review_notes ? String(body.review_notes) : null,
    oscarWins: parseNumeric(body?.oscar_wins, 0),
    oscarNominations: parseNumeric(body?.oscar_nominations, 0),
    countries: extras.countries,
    genres: extras.genres,
    tags: extras.tags,
  };
}

async function syncBingoWithWalkOfFameMutation(
  data: any,
  prevXp: any,
  xpStatus: any,
  allowedStarIds?: Set<string>
) {
  try {
    const candidateStars: any[] = Array.isArray(data?.updatedStars)
      ? data.updatedStars
      : Array.isArray(data?.stars)
        ? allowedStarIds
          ? data.stars.filter((s: any) => allowedStarIds.has(String(s.id)))
          : data.stars
        : [];
    const prevMap = prevXp?.sources?.walkOfFame?.starsById || {};
    const nextMap = xpStatus?.sources?.walkOfFame?.starsById || {};
    const gainedStars = candidateStars.filter((s: any) => {
      const sid = String(s.id);
      const prevEntry = prevMap[sid];
      const nextEntry = nextMap[sid];
      if (!nextEntry) return Boolean(s.stuckTier);
      return (
        !prevEntry ||
        Number(nextEntry.xp || 0) > Number(prevEntry.xp || 0) ||
        Number(nextEntry.claimedPct || 0) > Number(prevEntry.claimedPct || 0) ||
        Number(nextEntry.claimedExtraStars || 0) > Number(prevEntry.claimedExtraStars || 0)
      );
    });
    if (gainedStars.length > 0) {
      await evaluateBingoOnStickerGain(
        gainedStars.map((s: any) => ({
          id: String(s.id),
          kind: s.kind,
          alameda: s.alameda,
          statusTierKey: s.statusTierKey,
          extraStars: s.extraStars,
        }))
      );
    }
  } catch (err: any) {
    console.warn('[Bingo] Erro ao avaliar figurinha para o Bingo:', err?.message);
  }
}

async function evaluatePostMovieSaveEvents(params: {
  prevXp: any;
  prevWorld: any;
  prevTm: any;
  movieId: number;
  movieTitle: string;
  sourceTrigger: 'movie_add' | 'movie_edit';
  isGhost?: boolean;
  bingoMoviePayload?: BingoMovieInput | null;
}) {
  const {
    prevXp,
    prevWorld,
    prevTm,
    movieId,
    movieTitle,
    sourceTrigger,
    isGhost = false,
    bingoMoviePayload = null,
  } = params;
  let universeEvents: {
    checkpoints: any[];
    completedSagas: any[];
    completedMegaSagas: any[];
  } = {
    checkpoints: [],
    completedSagas: [],
    completedMegaSagas: [],
  };

  const [codexRes, nextWorld] = await Promise.all([
    evaluateAndBuildUniverseCodex({
      persist: true,
      triggerMovieId: movieId,
    }).catch((uErr: any) => {
      console.error(`[Universes] Erro na auto-avaliação (${sourceTrigger}):`, uErr.message);
      return null;
    }),
    buildWorldChallengePayload().catch(() => null),
  ]);

  if (codexRes) {
    universeEvents = {
      checkpoints: codexRes.newlyHitCheckpoints.map((cp) =>
        isGhost ? { ...cp, isGhost: true } : cp
      ),
      completedSagas: codexRes.newlyCompletedSagas.map((s) =>
        isGhost ? { ...s, isGhost: true } : s
      ),
      completedMegaSagas: codexRes.newlyCompletedMegaSagas.map((ms) =>
        isGhost ? { ...ms, isGhost: true } : ms
      ),
    };
  }

  let newlyUnlocked: any[] = [];
  let progressedTrophies: any[] = [];
  let xpStatus: any = null;
  try {
    const trophyResult = await evaluateTrophies({
      markNew: true,
      dryRun: isGhost,
      skipUnlocked: sourceTrigger === 'movie_add',
      recordLastMovie:
        isGhost || sourceTrigger !== 'movie_add' ? undefined : { movieId, title: movieTitle },
      existingWorldData: nextWorld || undefined,
    });
    newlyUnlocked = trophyResult.newlyUnlocked || [];
    progressedTrophies = trophyResult.progressedTrophies || [];
    xpStatus = trophyResult.xpStatus || null;
  } catch (e: any) {
    console.error(`[Trophies] Erro na auto-avaliação (${sourceTrigger}):`, e.message);
  }

  const [nextTm, resolvedXpStatus] = await Promise.all([
    nextWorld ? buildTimeMachinePayload(nextWorld).catch(() => null) : Promise.resolve(null),
    xpStatus
      ? Promise.resolve(xpStatus)
      : getQuickXpSnapshot(nextWorld ? { worldData: nextWorld } : {}).catch(() => null),
  ]);
  xpStatus = resolvedXpStatus;
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

  if (!isGhost && bingoMoviePayload) {
    const wonYearOrCountryDuel =
      timeMachineUnlocks.some((u: any) => u.kind === 'year_dethrone') ||
      worldChallengeUnlocks.some((u: any) => u.kind === 'country_dethrone');
    const conqueredNewYearOrCountry =
      timeMachineUnlocks.some((u: any) => u.kind === 'year') ||
      worldChallengeUnlocks.some((u: any) => u.kind === 'country_unlock');
    const extraTrophyStarsDelta = Math.max(
      0,
      Number(xpStatus?.sources?.trophies?.extraStarsCount || 0) -
        Number(prevXp?.sources?.trophies?.extraStarsCount || 0)
    );
    await evaluateBingoOnMovieSave({
      movieId,
      ...bingoMoviePayload,
      newlyUnlockedTrophiesCount: Array.isArray(newlyUnlocked) ? newlyUnlocked.length : 0,
      extraTrophyStarsDelta,
      progressedTrophiesCount: Array.isArray(progressedTrophies) ? progressedTrophies.length : 0,
      wonYearOrCountryDuel,
      conqueredNewYearOrCountry,
      isNewMovie: sourceTrigger === 'movie_add',
    }).catch((bErr: any) => {
      console.warn('[Bingo] Erro ao avaliar filme para o Bingo Mensal:', bErr?.message);
    });
  }

  return {
    newlyUnlocked,
    progressedTrophies,
    timeMachineUnlocks,
    worldChallengeUnlocks,
    universeEvents,
    xpStatus,
    xpGain,
  };
}

// Rota: Adicionar Filme (Multipart com Multer — suporta is_ghost para simulação via ROLLBACK)
app.post('/api/movies/add', upload.single('poster_file'), async (req: Request, res: Response) => {
  const isGhost = req.body.is_ghost === 'true' || req.body.is_ghost === true;
  const prevWorld = await buildWorldChallengePayload().catch(() => null);
  const [prevXp, prevTm] = await Promise.all([
    getQuickXpSnapshot(prevWorld ? { worldData: prevWorld } : {}).catch(() => null),
    prevWorld ? buildTimeMachinePayload(prevWorld).catch(() => null) : Promise.resolve(null),
  ]);

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

    await syncMovieRelations({
      dbClient,
      movieId,
      countries: parsedCountries,
      genres: parsedGenres,
      directors: parsedDirectors,
      writers: parsedWriters,
      studios: parsedStudios,
      tags: parsedTags,
      replaceExisting: false,
    });

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
    invalidateWalkOfFameCache();
    const secretDrawCompleted = await checkAndCompleteActiveDrawOnMovieSave({
      movieId,
      tmdbId: effectiveTmdbId,
      imdbId: effectiveImdbId,
      title: String(title || ''),
      originalTitle: original_title ? String(original_title) : null,
      releaseYear: parseNullableNumeric(release_year),
    }).catch((sdErr: any) => {
      console.warn('[SecretDraw] Erro ao verificar conclusão de carta ativa:', sdErr?.message);
      return null;
    });
    const chimeraMatched = await checkChimeraMatchOnMovieSave({
      movieId,
      title: String(title || ''),
      originalTitle: original_title ? String(original_title) : null,
      releaseYear: parseNullableNumeric(release_year),
      posterUrl: finalPosterUrl,
      runtime: parseNullableNumeric(runtime),
      voteCount: parseGlobalReviewsNullable(vote_count) ?? 0,
      audioType: audio_type ? String(audio_type) : null,
      countries: parsedCountries,
      genres: parsedGenres,
      tags: parsedTags,
    }).catch((chErr: any) => {
      console.warn('[Chimera] Erro ao verificar match de Quimera ativa:', chErr?.message);
      return [];
    });
    const savedEvents = await evaluatePostMovieSaveEvents({
      prevXp,
      prevWorld,
      prevTm,
      movieId,
      movieTitle,
      sourceTrigger: 'movie_add',
      isGhost: false,
      bingoMoviePayload: buildBingoMovieInputFromBody(req.body, {
        tmdbId: effectiveTmdbId,
        countries: parsedCountries,
        genres: parsedGenres,
        tags: parsedTags,
      }),
    });
    return res.json({ success: true, isGhost: false, movieId, secretDrawCompleted, chimeraMatched, ...savedEvents });
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
  const prevWorld = await buildWorldChallengePayload().catch(() => null);
  const [prevXp, prevTm] = await Promise.all([
    getQuickXpSnapshot(prevWorld ? { worldData: prevWorld } : {}).catch(() => null),
    prevWorld ? buildTimeMachinePayload(prevWorld).catch(() => null) : Promise.resolve(null),
  ]);
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

    await syncMovieRelations({
      dbClient,
      movieId: activeMovieId,
      countries: parsedCountries,
      genres: parsedGenres,
      directors: parsedDirectors,
      writers: parsedWriters,
      studios: parsedStudios,
      tags: parsedTags,
      replaceExisting: true,
    });

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
    invalidateWalkOfFameCache();
    const chimeraMatched = await checkChimeraMatchOnMovieSave({
      movieId: activeMovieId,
      title: String(title || ''),
      originalTitle: original_title ? String(original_title) : null,
      releaseYear: parseNullableNumeric(release_year),
      posterUrl: finalPosterUrl,
      runtime: parseNullableNumeric(runtime),
      voteCount: parseGlobalReviewsNullable(vote_count) ?? 0,
      audioType: audio_type ? String(audio_type) : null,
      countries: parsedCountries,
      genres: parsedGenres,
      tags: parsedTags,
    }).catch((chErr: any) => {
      console.warn('[Chimera] Erro ao verificar match de Quimera na edição:', chErr?.message);
      return [];
    });
    const savedEvents = await evaluatePostMovieSaveEvents({
      prevXp,
      prevWorld,
      prevTm,
      movieId: activeMovieId,
      movieTitle: String(title || original_title || 'Filme editado'),
      sourceTrigger: 'movie_edit',
      isGhost: false,
      bingoMoviePayload: buildBingoMovieInputFromBody(req.body, {
        tmdbId: parseNullableNumeric(tmdb_id),
        countries: parsedCountries,
        genres: parsedGenres,
        tags: parsedTags,
      }),
    });
    return res.json({ success: true, chimeraMatched, ...savedEvents });
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
    invalidateWalkOfFameCache();
    console.log(`[Express] Filme com ID ${movieId} foi deletado permanentemente.`);
    // Reavalia Códice dos Universos e troféus após deletar filme
    evaluateAndBuildUniverseCodex({ persist: true })
      .then(() => evaluateTrophies({ markNew: false }))
      .catch((e) => console.error('[Trophies/Universes] Erro na auto-avaliação pós-delete:', e.message));
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
    const trophyResult = await evaluateTrophies({ markNew: true, existingWorldData: nextWorld });
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
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
    const data = forceRefresh ? await evaluateTrophies({ markNew: false }) : await getCachedTrophiesSummary();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Trophies] Erro ao listar troféus:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Carregar checklist detalhado sob demanda para 1 troféu específico
app.get('/api/trophies/:id/checklist', async (req: Request, res: Response) => {
  try {
    const trophyId = String(req.params.id || '');
    const data = await getTrophyChecklistById(trophyId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Troféu não encontrado.' });
    }
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Trophies] Erro ao carregar checklist sob demanda:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota: Reavaliar todos os troféus contra os filmes reais salvos no banco
app.post('/api/trophies/evaluate', async (req: Request, res: Response) => {
  try {
    await evaluateAndBuildUniverseCodex({ persist: true }).catch(() => {});
    const markNew = req.body.markNew !== undefined ? Boolean(req.body.markNew) : true;
    const forceSeed = Boolean(req.body.forceSeed);
    const data = await evaluateTrophies({ markNew, forceSeed });
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
    const { trophyId, overrideState, overrideExtraStars } = req.body;
    if (!trophyId) {
      return res.status(400).json({ success: false, error: 'trophyId é obrigatório' });
    }
    const parsedState =
      overrideState === undefined ? null : overrideState === null ? null : Boolean(overrideState);
    const parsedExtraStars =
      overrideExtraStars === undefined
        ? undefined
        : overrideExtraStars === null
          ? null
          : Math.max(0, Math.floor(Number(overrideExtraStars) || 0));
    await setTrophyTestOverride(String(trophyId), parsedState, parsedExtraStars);
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
// ROTAS DO CÓDICE DOS UNIVERSOS (MEGA-SAGAS MÍTICAS, SAGAS & CHECKPOINTS)
// ============================================================================
app.get('/api/universes', async (req: Request, res: Response) => {
  try {
    const data = await evaluateAndBuildUniverseCodex({ persist: true });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Universes] Erro ao carregar Códice dos Universos:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/universes/sync', async (req: Request, res: Response) => {
  try {
    const data = await evaluateAndBuildUniverseCodex({ persist: true, forceSeed: true });
    const xpStatus = await getQuickXpSnapshot();
    return res.json({ success: true, data, xpStatus });
  } catch (err: any) {
    console.error('[Universes] Erro na sincronização retroativa do Códice:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// ROTAS DA CALÇADA DA FAMA (PROJETO / LAB VISUAL DE ARTISTAS & DUBLADORES)
// ============================================================================
app.get('/api/walk-of-fame', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const data = await buildWalkOfFamePayload({ forceRefresh });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao carregar Calçada da Fama:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/refresh', async (_req: Request, res: Response) => {
  try {
    const data = await buildWalkOfFamePayload({ forceRefresh: true });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao atualizar cache da Calçada da Fama:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/walk-of-fame/packs', async (_req: Request, res: Response) => {
  try {
    const data = await getWalkOfFamePendingPacksSummary();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao listar pacotinhos:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/check-movie', async (req: Request, res: Response) => {
  try {
    const movieId = req.body?.movieId ? Number(req.body.movieId) : null;
    const movieTitle = req.body?.movieTitle ? String(req.body.movieTitle) : null;
    const data = await checkWalkOfFameMovieTrigger({ movieId, movieTitle });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao checar pacotinho pós-cadastro:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/packs/:packId/open', async (req: Request, res: Response) => {
  try {
    const packId = Number(req.params.packId);
    const stickImmediately = req.body?.stickImmediately !== false;
    const compact = req.body?.compact === true || req.query.compact === 'true';
    const worldData = await buildWorldChallengePayload().catch(() => undefined);
    const prevXp = await getQuickXpSnapshot({ worldData });
    const data = await openWalkOfFamePack(packId, stickImmediately, { compact });
    const xpStatus = await getQuickXpSnapshot({ worldData });
    await syncBingoWithWalkOfFameMutation(data, prevXp, xpStatus);
    const xpGain = computeXpGainEvent(prevXp, xpStatus);
    return res.json({ success: true, data: { ...data, xpStatus, xpGain } });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao abrir pacotinho:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/stickers/stick-batch', async (req: Request, res: Response) => {
  try {
    const starIds = Array.isArray(req.body?.starIds) ? req.body.starIds.map(String) : [];
    const compact = req.body?.compact === true || req.query.compact === 'true';
    const worldData = await buildWorldChallengePayload().catch(() => undefined);
    const prevXp = await getQuickXpSnapshot({ worldData });
    const data = await stickWalkOfFameStarsBatch(starIds, { compact });
    const xpStatus = await getQuickXpSnapshot({ worldData });
    await syncBingoWithWalkOfFameMutation(data, prevXp, xpStatus, new Set(starIds));
    const rawGain = computeXpGainEvent(prevXp, xpStatus);
    const xpGain =
      rawGain && (rawGain.gainedXp > 0 || (rawGain.statGains && rawGain.statGains.length > 0))
        ? rawGain
        : null;
    return res.json({ success: true, data: { ...data, xpStatus, xpGain } });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao colar figurinhas em lote:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/stickers/:starId/stick', async (req: Request, res: Response) => {
  try {
    const starId = String(req.params.starId);
    const compact = req.body?.compact === true || req.query.compact === 'true';
    const worldData = await buildWorldChallengePayload().catch(() => undefined);
    const prevXp = await getQuickXpSnapshot({ worldData });
    const data = await stickWalkOfFameStar(starId, { compact });
    const xpStatus = await getQuickXpSnapshot({ worldData });
    await syncBingoWithWalkOfFameMutation(data, prevXp, xpStatus, new Set([starId]));
    const rawGain = computeXpGainEvent(prevXp, xpStatus);
    const xpGain =
      rawGain && (rawGain.gainedXp > 0 || (rawGain.statGains && rawGain.statGains.length > 0))
        ? rawGain
        : null;
    return res.json({ success: true, data: { ...data, xpStatus, xpGain } });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao colar figurinha:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/stickers/:starId/unstick', async (req: Request, res: Response) => {
  try {
    const compact = req.body?.compact === true || req.query.compact === 'true';
    const data = await unstickWalkOfFameStar(String(req.params.starId), { compact });
    const xpStatus = await getQuickXpSnapshot().catch(() => null);
    return res.json({ success: true, data: { ...data, xpStatus } });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao descolar figurinha:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/stickers/:starId/preferences', async (req: Request, res: Response) => {
  try {
    const compact = req.body?.compact === true || req.query.compact === 'true';
    const data = await updateWalkOfFamePreferences(String(req.params.starId), req.body || {}, { compact });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[WalkOfFame] Erro ao salvar preferências da figurinha:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/walk-of-fame/stickers/:starId/custom-skin', (req: Request, res: Response) => {
  upload.single('skin_file')(req, res, async (uploadErr: any) => {
    if (uploadErr) {
      return res.status(400).json({ success: false, error: uploadErr.message || 'Erro no upload da imagem.' });
    }
    try {
      const compact =
        req.body?.compact === true ||
        req.body?.compact === 'true' ||
        req.query.compact === 'true';
      const skinUrl = req.file
        ? `/uploads/${req.file.filename}`
        : String(req.body?.skin_url || req.body?.skinUrl || '').trim();
      const skinLabel = String(req.body?.skin_label || req.body?.skinLabel || 'Foto Personalizada').trim();
      const data = await saveWalkOfFameCustomSkin(String(req.params.starId), skinUrl, skinLabel, {
        compact,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore cleanup failure
        }
      }
      console.error('[WalkOfFame] Erro ao salvar foto personalizada:', err.message);
      return res.status(400).json({ success: false, error: err.message });
    }
  });
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

// ============================================================================
// ROTAS DA SESSÃO SECRETA (LAB TRANSPARENTE — SORTEIO DE CARTAS DA PLANILHA)
// ============================================================================
app.get('/api/class-powers/status', async (_req: Request, res: Response) => {
  try {
    const data = await getClassPowerWalletStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao carregar poderes de classe.' });
  }
});

app.post('/api/class-powers/lab/grant', async (req: Request, res: Response) => {
  try {
    const rawMode = String(req.body?.mode || 'all');
    const mode =
      rawMode === 'secret_draw' || rawMode === 'chimera' || rawMode === 'bingo'
        ? rawMode
        : 'all';
    const data = await labGrantClassPowerCharge(mode);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Erro ao conceder carga de classe.' });
  }
});

app.post('/api/secret-draw/class-power', async (req: Request, res: Response) => {
  try {
    const classId = String(req.body?.classId || '').trim();
    const pickId = req.body?.pickId ? Number(req.body.pickId) : undefined;
    const data = await activateSecretDrawClassPower({ classId, pickId });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Erro ao ativar poder na Sessão Secreta.' });
  }
});

app.get('/api/secret-draw/status', async (_req: Request, res: Response) => {
  try {
    const data = await getSecretDrawStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao carregar status:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/draw', async (req: Request, res: Response) => {
  try {
    const rawCount = req.body?.requestedCount;
    const requestedCount =
      rawCount === null || rawCount === undefined || rawCount === 'random' || rawCount === ''
        ? null
        : Number(rawCount);
    const rawSagaRule = String(req.body?.sagaRule || '').trim();
    const sagaRule =
      rawSagaRule === 'skip_sequels' || rawSagaRule === 'allow_any' || rawSagaRule === 'redirect_first'
        ? rawSagaRule
        : 'redirect_first';
    const data = await drawSecretCards({ requestedCount, sagaRule });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao sortear cartas:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/choose', async (req: Request, res: Response) => {
  try {
    const roundId = Number(req.body?.roundId);
    const seat = Number(req.body?.seat);
    if (!roundId || !seat) {
      return res.status(400).json({ success: false, error: 'roundId e seat são obrigatórios.' });
    }
    await chooseSecretCard(roundId, seat);
    const data = await getSecretDrawStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao escolher carta:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/finish-round', async (req: Request, res: Response) => {
  try {
    const roundId = Number(req.body?.roundId);
    if (!roundId) {
      return res.status(400).json({ success: false, error: 'roundId é obrigatório.' });
    }
    const result = await finishSecretDrawRound(roundId);
    const data = await getSecretDrawStatus();
    return res.json({ success: true, result, data });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao finalizar escolha da mão:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/decline', async (req: Request, res: Response) => {
  try {
    const pickId = Number(req.body?.pickId);
    const reason = String(req.body?.reason || 'Não encontrado para assistir').trim();
    if (!pickId) {
      return res.status(400).json({ success: false, error: 'pickId é obrigatório.' });
    }
    await declineSecretPick(pickId, reason);
    const data = await getSecretDrawStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao declinar carta:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/boomerang', async (req: Request, res: Response) => {
  try {
    const pickId = Number(req.body?.pickId);
    const reason = String(req.body?.reason || 'Não quero ver agora — volta para o baralho').trim();
    if (!pickId) {
      return res.status(400).json({ success: false, error: 'pickId é obrigatório.' });
    }
    await boomerangSecretPick(pickId, reason);
    const data = await getSecretDrawStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao devolver carta com Ficha Bumerangue:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/claim', async (req: Request, res: Response) => {
  try {
    const pickId = Number(req.body?.pickId);
    if (!pickId) {
      return res.status(400).json({ success: false, error: 'pickId é obrigatório.' });
    }
    const prevXp = await getQuickXpSnapshot().catch(() => null);
    const claimed = await claimSecretDrawPick(pickId);
    await evaluateBingoOnSecretDrawClaim({
      pickId: claimed.id,
      difficulty: claimed.difficulty,
    }).catch((bErr: any) => console.warn('[Bingo] Erro ao avaliar Sessão Secreta:', bErr?.message));
    const [data, xpStatus] = await Promise.all([
      getSecretDrawStatus(),
      getQuickXpSnapshot().catch(() => null),
    ]);
    const xpGain = computeXpGainEvent(prevXp, xpStatus);
    return res.json({ success: true, claimed, data, xpStatus, xpGain });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao colher XP da carta:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/lab/complete', async (req: Request, res: Response) => {
  try {
    const pickId = Number(req.body?.pickId);
    if (!pickId) {
      return res.status(400).json({ success: false, error: 'pickId é obrigatório.' });
    }
    const prevXp = await getQuickXpSnapshot().catch(() => null);
    await labCompleteSecretPick(pickId);
    const [data, xpStatus] = await Promise.all([
      getSecretDrawStatus(),
      getQuickXpSnapshot().catch(() => null),
    ]);
    const xpGain = computeXpGainEvent(prevXp, xpStatus);
    return res.json({ success: true, data, xpStatus, xpGain });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao concluir carta no Lab:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/lab/grant-chip', async (req: Request, res: Response) => {
  try {
    const amount = Number(req.body?.amount || 1);
    const chipType = req.body?.type === 'boomerang' ? 'boomerang' : 'draw';
    await labAddWeeklyDrawChip(amount, chipType);
    const data = await getSecretDrawStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao recarregar ficha no Lab:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/lab/reset', async (_req: Request, res: Response) => {
  try {
    await labResetSecretDraws();
    const [data, xpStatus] = await Promise.all([
      getSecretDrawStatus(),
      getQuickXpSnapshot().catch(() => null),
    ]);
    return res.json({ success: true, data, xpStatus });
  } catch (err: any) {
    console.error('[SecretDraw] Erro ao resetar testes Lab:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/secret-draw/sync-sheet', (req: Request, res: Response) => {
  sheetUpload.single('sheet_file')(req, res, async (uploadErr: any) => {
    if (uploadErr) {
      return res.status(400).json({ success: false, error: uploadErr.message || 'Erro no upload da planilha.' });
    }
    try {
      if (req.file?.buffer) {
        await syncSecretDrawPoolFromBuffer(req.file.buffer, req.file.originalname || 'upload.xlsx');
      } else {
        const candidates = [
          path.resolve(__dirname, 'data/sorteio.xlsx'),
          path.resolve(process.cwd(), 'src/data/sorteio.xlsx'),
          path.resolve(process.cwd(), 'backend/src/data/sorteio.xlsx'),
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        if (!found) {
          return res.status(404).json({ success: false, error: 'Arquivo sorteio.xlsx não encontrado no servidor.' });
        }
        const buf = fs.readFileSync(found);
        await syncSecretDrawPoolFromBuffer(buf, path.basename(found));
      }
      const data = await getSecretDrawStatus();
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error('[SecretDraw] Erro ao sincronizar planilha:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });
});

// ============================================================================
// ROTAS DA QUIMERA CINÉFILA (FORJA SEMANAL + JACKPOTS INDEPENDENTES + LAB)
// ============================================================================
app.post('/api/chimeras/class-power', async (req: Request, res: Response) => {
  try {
    const classId = String(req.body?.classId || '').trim();
    const chimeraId = req.body?.chimeraId ? Number(req.body.chimeraId) : undefined;
    const choiceValue =
      req.body?.choiceValue !== undefined && req.body?.choiceValue !== null
        ? String(req.body.choiceValue).trim()
        : undefined;
    const data = await activateChimeraClassPower({ classId, chimeraId, choiceValue });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Erro ao ativar poder na Quimera.' });
  }
});

app.get('/api/chimeras/status', async (_req: Request, res: Response) => {
  try {
    const data = await getChimeraStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao carregar status:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/forge', async (req: Request, res: Response) => {
  try {
    const ritualStyle = req.body?.ritualStyle;
    const labD20Mode = req.body?.labD20Mode;
    const labForceLegendary = Boolean(req.body?.labForceLegendary);
    const result = await forgeChimeraContract({ ritualStyle, labD20Mode, labForceLegendary });
    const data = await getChimeraStatus();
    return res.json({ success: true, forged: result.chimera, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao forjar Quimera:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/pick-rune', async (req: Request, res: Response) => {
  try {
    const chimeraId = Number(req.body?.chimeraId);
    const runeId = String(req.body?.runeId || '').trim();
    if (!chimeraId || !runeId) {
      return res.status(400).json({ success: false, error: 'chimeraId e runeId são obrigatórios.' });
    }
    const updated = await pickChimeraFateRune(chimeraId, runeId);
    const data = await getChimeraStatus();
    return res.json({ success: true, chimera: updated, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao selar Runa da Quimera:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/claim', async (req: Request, res: Response) => {
  try {
    const chimeraId = Number(req.body?.chimeraId);
    if (!chimeraId) {
      return res.status(400).json({ success: false, error: 'chimeraId é obrigatório.' });
    }
    const prevXp = await getQuickXpSnapshot().catch(() => null);
    const claimed = await claimChimeraContract(chimeraId);
    await evaluateBingoOnChimeraClaim({
      chimeraId: claimed.id,
      jackpotsHitCount: Number(claimed.matchDetails?.jackpotsHitCount || 0),
    }).catch((bErr: any) => console.warn('[Bingo] Erro ao avaliar Quimera:', bErr?.message));
    const [data, xpStatus] = await Promise.all([
      getChimeraStatus(),
      getQuickXpSnapshot().catch(() => null),
    ]);
    const xpGain = computeXpGainEvent(prevXp, xpStatus);
    return res.json({ success: true, claimed, data, xpStatus, xpGain });
  } catch (err: any) {
    console.error('[Chimera] Erro ao colher XP da Quimera:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/pillar-action', async (req: Request, res: Response) => {
  try {
    const chimeraId = Number(req.body?.chimeraId);
    const pillar = String(req.body?.pillar || '') as 'year' | 'country' | 'genre' | 'tag';
    const actionType = String(req.body?.actionType || '') as 'transmute' | 'sacrifice';
    if (!chimeraId || !['year', 'country', 'genre', 'tag'].includes(pillar) || !['transmute', 'sacrifice'].includes(actionType)) {
      return res.status(400).json({ success: false, error: 'chimeraId, pillar e actionType válidos são obrigatórios.' });
    }
    const updated = await applyChimeraPillarAction(chimeraId, pillar, actionType);
    const data = await getChimeraStatus();
    return res.json({ success: true, chimera: updated, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao aplicar poder de pilar na Quimera:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/decline', async (req: Request, res: Response) => {
  try {
    const chimeraId = Number(req.body?.chimeraId);
    if (!chimeraId) {
      return res.status(400).json({ success: false, error: 'chimeraId é obrigatório.' });
    }
    await declineChimeraContract(chimeraId);
    const data = await getChimeraStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao declinar Quimera:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/discard', async (req: Request, res: Response) => {
  try {
    const chimeraId = Number(req.body?.chimeraId);
    if (!chimeraId) {
      return res.status(400).json({ success: false, error: 'chimeraId é obrigatório.' });
    }
    await discardChimeraContract(chimeraId);
    const data = await getChimeraStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao descartar Quimera:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/lab/grant-chip', async (req: Request, res: Response) => {
  try {
    const amount = Number(req.body?.amount || 1);
    const chipType = req.body?.type === 'decline' ? 'decline' : 'forge';
    await labAddChimeraChip(amount, chipType);
    const data = await getChimeraStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao recarregar ficha no Lab:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/lab/simulate-match', async (req: Request, res: Response) => {
  try {
    const chimeraId = Number(req.body?.chimeraId);
    if (!chimeraId) {
      return res.status(400).json({ success: false, error: 'chimeraId é obrigatório.' });
    }
    const mode = req.body?.mode === 'full_jackpot' ? 'full_jackpot' : 'normal';
    const simulated = await labSimulateMatchChimera(chimeraId, mode);
    const data = await getChimeraStatus();
    return res.json({ success: true, simulated, data });
  } catch (err: any) {
    console.error('[Chimera] Erro ao simular match no Lab:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chimeras/lab/reset', async (_req: Request, res: Response) => {
  try {
    await labResetChimeras();
    const [data, xpStatus] = await Promise.all([
      getChimeraStatus(),
      getQuickXpSnapshot().catch(() => null),
    ]);
    return res.json({ success: true, data, xpStatus });
  } catch (err: any) {
    console.error('[Chimera] Erro ao resetar Quimera no Lab:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// BINGO MENSAL 4×4 (GUILDA DO DESTINO)
// ============================================================================

app.post('/api/bingo/class-power', async (req: Request, res: Response) => {
  try {
    const classId = String(req.body?.classId || '').trim();
    const boardId = req.body?.boardId ? Number(req.body.boardId) : undefined;
    const squareIndex =
      req.body?.squareIndex !== undefined && req.body?.squareIndex !== null
        ? Number(req.body.squareIndex)
        : undefined;
    const chosenGoalKey =
      req.body?.chosenGoalKey !== undefined && req.body?.chosenGoalKey !== null
        ? String(req.body.chosenGoalKey).trim()
        : undefined;
    const data = await activateBingoClassPower({
      classId,
      boardId,
      squareIndex,
      chosenGoalKey,
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || 'Erro ao ativar poder nos Pergaminhos.' });
  }
});

app.get('/api/bingo/status', async (_req: Request, res: Response) => {
  try {
    const data = await getBingoStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Bingo] Erro ao carregar status do Bingo Mensal:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/forge', async (_req: Request, res: Response) => {
  try {
    const forged = await forgeBingoBoard();
    const data = await getBingoStatus();
    return res.json({ success: true, board: forged.board, data });
  } catch (err: any) {
    console.error('[Bingo] Erro ao sortear cartela de Bingo:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/archive', async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.body?.boardId);
    if (!boardId) {
      return res.status(400).json({ success: false, error: 'boardId é obrigatório.' });
    }
    await archiveExpiredBingoBoard(boardId);
    const data = await getBingoStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Bingo] Erro ao arquivar cartela expirada:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/action', async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.body?.boardId);
    const action = String(req.body?.action || '') as 'board_reroll' | 'square_reroll' | 'upgrade' | 'downgrade';
    const squareIndex = req.body?.squareIndex !== undefined ? Number(req.body.squareIndex) : undefined;
    if (!boardId || !['board_reroll', 'square_reroll', 'upgrade', 'downgrade'].includes(action)) {
      return res.status(400).json({ success: false, error: 'boardId e action válidos são obrigatórios.' });
    }
    const updated = await applyBingoBoardAction({ boardId, action, squareIndex });
    const data = await getBingoStatus();
    return res.json({ success: true, ...updated, data });
  } catch (err: any) {
    console.error('[Bingo] Erro ao aplicar ficha na cartela:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/claim', async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.body?.boardId);
    const targetType = String(req.body?.targetType || 'all') as 'square' | 'line' | 'blackout' | 'all';
    const targetId = req.body?.targetId;
    if (!boardId || !['square', 'line', 'blackout', 'all'].includes(targetType)) {
      return res.status(400).json({ success: false, error: 'boardId e targetType válidos são obrigatórios.' });
    }
    const prevXp = await getQuickXpSnapshot().catch(() => null);
    const claimed = await claimBingoReward({ boardId, targetType, targetId });
    const [data, xpStatus] = await Promise.all([
      getBingoStatus(),
      getQuickXpSnapshot().catch(() => null),
    ]);
    const xpGain = computeXpGainEvent(prevXp, xpStatus);
    return res.json({ success: true, ...claimed, data, xpStatus, xpGain });
  } catch (err: any) {
    console.error('[Bingo] Erro ao colher XP do Bingo:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/lab/grant-chip', async (req: Request, res: Response) => {
  try {
    const chipType = String(req.body?.chipType || req.body?.type || 'forge') as BingoChipType | 'all';
    const amount = Number(req.body?.amount || 1);
    const validTypes: Array<BingoChipType | 'all'> = ['forge', 'board_reroll', 'square_reroll', 'upgrade', 'downgrade', 'all'];
    if (!validTypes.includes(chipType)) {
      return res.status(400).json({ success: false, error: 'chipType inválido.' });
    }
    await labAddBingoChip(chipType, amount);
    const data = await getBingoStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Bingo] Erro ao recarregar ficha no Lab:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/lab/simulate', async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.body?.boardId);
    const mode = String(req.body?.mode || 'complete_square') as 'complete_square' | 'complete_line' | 'advance_all' | 'almost_blackout';
    const squareIndex = req.body?.squareIndex !== undefined ? Number(req.body.squareIndex) : undefined;
    if (!boardId || !['complete_square', 'complete_line', 'advance_all', 'almost_blackout'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'boardId e mode válidos são obrigatórios.' });
    }
    const board = await labSimulateBingoProgress({ boardId, mode, squareIndex });
    const data = await getBingoStatus();
    return res.json({ success: true, board, data });
  } catch (err: any) {
    console.error('[Bingo] Erro ao simular progresso no Bingo:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/lab/simulate-month', async (_req: Request, res: Response) => {
  try {
    await labSimulateBingoMonthRollover();
    const data = await getBingoStatus();
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Bingo] Erro ao simular virada de mês no Bingo:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bingo/lab/reset', async (_req: Request, res: Response) => {
  try {
    await labResetBingo();
    const [data, xpStatus] = await Promise.all([
      getBingoStatus(),
      getQuickXpSnapshot().catch(() => null),
    ]);
    return res.json({ success: true, data, xpStatus });
  } catch (err: any) {
    console.error('[Bingo] Erro ao resetar Bingo no Lab:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Ponto único de entrada do módulo isolado de Animes, Séries & Doramas
const tvMountRouter = express.Router();
if (process.env.ENABLE_ANIME_MODULE === 'true') {
  const tvModuleReady = import('./modules/tv')
    .then(({ registerTvModule }) =>
      registerTvModule(
        {
          use: (_prefix: string, r: express.RequestHandler) => {
            tvMountRouter.use(r);
          },
        } as any,
        upload
      )
    )
    .catch((err) => {
      console.error('[TV Module] Erro ao inicializar módulo de Animes & Séries:', err.message);
    });

  app.use('/api/tv', async (req, res, next) => {
    await tvModuleReady;
    return tvMountRouter(req, res, next);
  });
}

// Servir o build estático do front-end em produção (Render / Web Service único)
const frontendDistCandidates = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
];
const frontendDistDir = frontendDistCandidates.find((dir) =>
  fs.existsSync(path.join(dir, 'index.html'))
);

if (frontendDistDir) {
  console.log(`[Server] Servindo frontend estático em produção de: ${frontendDistDir}`);
  app.use(
    express.static(frontendDistDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(`${path.sep}index.html`) || filePath.endsWith(`${path.sep}sw.js`)) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    })
  );
  app.use('/api', (_req: Request, res: Response) => {
    return res.status(404).json({ success: false, error: 'Endpoint da API não encontrado.' });
  });
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    return res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[Server] Servidor backend rodando em http://0.0.0.0:${PORT}`);
  await testConnection();
  try {
    await ensureTimeMachineTables();
    await seedUniverses();
    const initialCodex = await evaluateAndBuildUniverseCodex({ persist: true });
    console.log(
      `[Universes] Códice dos Universos sincronizado: ${initialCodex.summary.completedSagas}/${initialCodex.summary.totalSagas} Sagas, ${initialCodex.summary.unlockedCheckpoints} Marcos, ${initialCodex.summary.completedMegaSagas}/${initialCodex.summary.totalMegaSagas} Mega-Sagas (+${initialCodex.summary.totalUniverseXp} XP)`
    );
    await seedTrophies();
    const initialTrophies = await evaluateTrophies({ markNew: false });
    console.log(
      `[Trophies] Motor PS5 iniciado com sucesso! Desbloqueados: ${initialTrophies.unlockedCount}/${initialTrophies.totalTrophies} (${initialTrophies.overallPercentage}%)`
    );
    await ensurePoolPopulatedIfEmpty();
    await ensureChimeraTables();
    await ensureBingoTables();
  } catch (tErr: any) {
    console.error('[Trophies] Erro ao inicializar troféus/universos no boot:', tErr.message);
  }
});
