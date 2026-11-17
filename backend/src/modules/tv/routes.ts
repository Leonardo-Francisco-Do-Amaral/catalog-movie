import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import {
  JikanMovieGuardError,
  fetchJikanAnimeBundle,
  fetchJikanSeasonEntry,
  searchAnimeOnJikan,
} from './clients/jikanClient';
import { fetchTmdbTvBundle, searchTvOnTmdb } from './clients/tmdbTvClient';
import {
  appendSeasonToShow,
  createTvShow,
  deleteTvShow,
  incrementSeasonProgress,
  listAllTvShows,
  updateTvShow,
} from './services/catalogService';
import {
  buildStudiosLeaguePayload,
  captureTvXpState,
  computeTvXpMutationEvent,
  getTvXpSnapshot,
} from './services/xpService';
import {
  buildTvVoiceAlbumPayload,
  openVoicePack,
  saveVoiceCustomSkin,
  stickAllUnlockedVoices,
  stickVoiceSticker,
  syncAllShowsVoiceCredits,
  syncShowVoiceCredits,
  unstickVoiceSticker,
  updateVoicePreferences,
} from './services/voiceAlbumService';
import { buildTvStatsPayload } from './services/statsService';
import { TvShowInput } from './types';

function parseJsonOrArray<T = any>(val: any, fallback: T): T {
  if (val === undefined || val === null) return fallback;
  if (typeof val !== 'string') return val as T;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function parseCommaList(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
  const str = String(val).trim();
  if (!str) return [];
  if (str.startsWith('[')) {
    const parsed = parseJsonOrArray<string[]>(str, []);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
  }
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

function normalizeShowBody(req: Request): TvShowInput {
  const b = req.body || {};
  let posterUrl = b.poster_url ? String(b.poster_url).trim() : null;
  if (req.file) {
    posterUrl = `/uploads/${req.file.filename}`;
  }

  return {
    kind: b.kind || 'anime',
    title: String(b.title || '').trim(),
    original_title: b.original_title ? String(b.original_title).trim() : null,
    primary_source: b.primary_source || 'manual',
    mal_id: b.mal_id ? Number(b.mal_id) : null,
    tmdb_tv_id: b.tmdb_tv_id ? Number(b.tmdb_tv_id) : null,
    imdb_id: b.imdb_id ? String(b.imdb_id).trim() : null,
    poster_url: posterUrl,
    synopsis: b.synopsis || null,
    start_year: b.start_year ? Number(b.start_year) : null,
    end_year: b.end_year ? Number(b.end_year) : null,
    airing_status: b.airing_status || null,
    origin_country: b.origin_country || null,
    external_score: b.external_score !== undefined && b.external_score !== '' ? Number(b.external_score) : null,
    watch_status: b.watch_status || 'watching',
    user_rating: b.user_rating !== undefined && b.user_rating !== '' ? Number(String(b.user_rating).replace(',', '.')) : null,
    music_rating: b.music_rating !== undefined && b.music_rating !== '' ? Number(String(b.music_rating).replace(',', '.')) : null,
    best_song_title: b.best_song_title || null,
    best_song_kind: b.best_song_kind || null,
    best_season_number: b.best_season_number ? Number(b.best_season_number) : null,
    month_seen: b.month_seen ? Number(b.month_seen) : null,
    year_seen: b.year_seen ? Number(b.year_seen) : null,
    audio_type: b.audio_type || null,
    platform: b.platform || null,
    review_notes: b.review_notes || null,
    raw_api_data: parseJsonOrArray(b.raw_api_data, {}),
    is_movie_guard_type: b.is_movie_guard_type || null,
    studios: parseJsonOrArray(b.studios, parseCommaList(b.studios)),
    genres: parseCommaList(b.genres),
    demographics: parseCommaList(b.demographics),
    themes: parseCommaList(b.themes),
    creators: parseCommaList(b.creators),
    directors: parseCommaList(b.directors),
    seasons: parseJsonOrArray(b.seasons, []),
  };
}

function cleanupUploadedFile(req: Request) {
  if (req.file?.path && fs.existsSync(req.file.path)) {
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // ignora erro de limpeza
    }
  }
}

export function createTvRouter(uploadMiddleware: multer.Multer): Router {
  const router = express.Router();

  router.get('/health', (_req: Request, res: Response) => {
    return res.json({ success: true, enabled: true, module: 'tv' });
  });

  router.get('/shows', async (_req: Request, res: Response) => {
    try {
      const catalog = await listAllTvShows();
      const league = await buildStudiosLeaguePayload(catalog.shows);
      const xpStatus = await getTvXpSnapshot({ shows: catalog.shows, league });
      return res.json({
        success: true,
        data: catalog.shows,
        filters: catalog.filters,
        xpStatus,
      });
    } catch (err: any) {
      console.error('[TV Module] Erro ao listar obras:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/xp', async (_req: Request, res: Response) => {
    try {
      const xpStatus = await getTvXpSnapshot();
      return res.json({ success: true, data: xpStatus });
    } catch (err: any) {
      console.error('[TV Module] Erro ao consultar XP:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/studios-league', async (_req: Request, res: Response) => {
    try {
      const { league, xpStatus } = await captureTvXpState();
      return res.json({ success: true, data: league, xpStatus });
    } catch (err: any) {
      console.error('[TV Module] Erro ao montar Liga dos Estúdios:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/voice-album', async (_req: Request, res: Response) => {
    try {
      const { shows } = await listAllTvShows();
      const [album, league] = await Promise.all([
        buildTvVoiceAlbumPayload(shows),
        buildStudiosLeaguePayload(shows),
      ]);
      const xpStatus = await getTvXpSnapshot({ shows, league, voiceAlbum: album });
      return res.json({ success: true, data: album, xpStatus });
    } catch (err: any) {
      console.error('[TV Module] Erro ao montar Álbum de Dubladores:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/voice-album/sync', async (_req: Request, res: Response) => {
    try {
      const syncResult = await syncAllShowsVoiceCredits();
      const { shows } = await listAllTvShows();
      const [album, league] = await Promise.all([
        buildTvVoiceAlbumPayload(shows),
        buildStudiosLeaguePayload(shows),
      ]);
      const xpStatus = await getTvXpSnapshot({ shows, league, voiceAlbum: album });
      return res.json({ success: true, data: album, syncResult, xpStatus });
    } catch (err: any) {
      console.error('[TV Module] Erro ao sincronizar dubladores:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/voice-album/stick-all', async (_req: Request, res: Response) => {
    try {
      const result = await stickAllUnlockedVoices();
      const xpStatus = await getTvXpSnapshot({ voiceAlbum: result.payload });
      return res.json({
        success: true,
        data: result.payload,
        stuckCount: result.stuckCount,
        xpGained: result.xpGained,
        xpStatus,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/voice-album/:voiceId/stick', async (req: Request, res: Response) => {
    try {
      const result = await stickVoiceSticker(String(req.params.voiceId));
      const xpStatus = await getTvXpSnapshot({ voiceAlbum: result.payload });
      return res.json({
        success: true,
        data: result.payload,
        xpGained: result.xpGained,
        xpStatus,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/voice-album/:voiceId/unstick', async (req: Request, res: Response) => {
    try {
      const album = await unstickVoiceSticker(String(req.params.voiceId));
      const xpStatus = await getTvXpSnapshot({ voiceAlbum: album });
      return res.json({ success: true, data: album, xpStatus });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/voice-album/packs/:packId/open', async (req: Request, res: Response) => {
    try {
      const packId = Number(req.params.packId);
      if (!Number.isFinite(packId) || packId <= 0) {
        return res.status(400).json({ success: false, error: 'ID de pacote inválido.' });
      }
      const result = await openVoicePack(packId);
      const xpStatus = await getTvXpSnapshot({ voiceAlbum: result.payload });
      return res.json({
        success: true,
        data: result.payload,
        xpGained: result.xpGained,
        voiceId: result.voiceId,
        xpStatus,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.patch('/voice-album/:voiceId/preferences', async (req: Request, res: Response) => {
    try {
      const b = req.body || {};
      const album = await updateVoicePreferences(String(req.params.voiceId), {
        selectedSkinUrl: b.selectedSkinUrl,
        selectedSkinLabel: b.selectedSkinLabel,
        immortalAura: b.immortalAura,
        signatureWorkKey: b.signatureWorkKey,
        isFullArt: b.isFullArt,
        isFavoriteGuardian: b.isFavoriteGuardian,
      });
      return res.json({ success: true, data: album });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post(
    '/voice-album/:voiceId/custom-skin',
    uploadMiddleware.single('skin_file'),
    async (req: Request, res: Response) => {
      try {
        const skinUrl = req.file
          ? `/uploads/${req.file.filename}`
          : String(req.body?.skin_url || req.body?.skinUrl || '').trim();
        if (!skinUrl) {
          cleanupUploadedFile(req);
          return res.status(400).json({ success: false, error: 'Informe uma imagem ou link válido.' });
        }
        const skinLabel = String(req.body?.skin_label || req.body?.skinLabel || 'Minha Imagem').trim();
        const album = await saveVoiceCustomSkin(String(req.params.voiceId), skinUrl, skinLabel);
        return res.json({ success: true, data: album });
      } catch (err: any) {
        cleanupUploadedFile(req);
        return res.status(400).json({ success: false, error: err.message });
      }
    }
  );

  router.get('/stats', async (_req: Request, res: Response) => {
    try {
      const data = await buildTvStatsPayload();
      return res.json({ success: true, data });
    } catch (err: any) {
      console.error('[TV Module] Erro ao calcular estatísticas:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/search', async (req: Request, res: Response) => {
    try {
      const source = String(req.query.source || 'jikan').toLowerCase();
      const q = String(req.query.q || '').trim();
      const year = req.query.year ? Number(req.query.year) : undefined;

      if (!q) {
        return res.status(400).json({ success: false, error: 'Informe um termo para busca.' });
      }

      const results =
        source === 'tmdb'
          ? await searchTvOnTmdb(q, year)
          : await searchAnimeOnJikan(q, year);

      return res.json({ success: true, data: results });
    } catch (err: any) {
      console.error('[TV Module] Erro na busca externa:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/details', async (req: Request, res: Response) => {
    try {
      const source = String(req.query.source || 'jikan').toLowerCase();
      const id = Number(req.query.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ success: false, error: 'ID inválido.' });
      }

      const data =
        source === 'tmdb'
          ? await fetchTmdbTvBundle(id)
          : await fetchJikanAnimeBundle(id);

      return res.json({ success: true, data });
    } catch (err: any) {
      if (err instanceof JikanMovieGuardError) {
        return res.status(400).json({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      console.error('[TV Module] Erro ao buscar detalhes externos:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/jikan/season/:malId', async (req: Request, res: Response) => {
    try {
      const malId = Number(req.params.malId);
      const seasonNumber = req.query.seasonNumber ? Number(req.query.seasonNumber) : 1;
      if (!Number.isFinite(malId) || malId <= 0) {
        return res.status(400).json({ success: false, error: 'MAL ID inválido.' });
      }
      const data = await fetchJikanSeasonEntry(malId, seasonNumber);
      return res.json({ success: true, data });
    } catch (err: any) {
      if (err instanceof JikanMovieGuardError) {
        return res.status(400).json({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      console.error('[TV Module] Erro ao carregar temporada do Jikan:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/shows', uploadMiddleware.single('poster_file'), async (req: Request, res: Response) => {
    try {
      const payload = normalizeShowBody(req);
      const prevState = await captureTvXpState();
      const show = await createTvShow(payload);
      // Sincroniza créditos de voz (Seiyūs / Vozes EUA) em segundo plano sem travar resposta
      syncShowVoiceCredits(show).catch((e) =>
        console.warn('[TV Voice Sync] Erro em background:', e?.message)
      );
      const nextState = await captureTvXpState();
      const xpEvent = computeTvXpMutationEvent(prevState, nextState);

      return res.status(201).json({
        success: true,
        data: show,
        xpStatus: nextState.xpStatus,
        xpDelta: xpEvent.xpDelta,
        xpEvent,
      });
    } catch (err: any) {
      cleanupUploadedFile(req);
      return res.status(400).json({
        success: false,
        code: err?.code,
        error: err.message,
      });
    }
  });

  router.put('/shows/:id', uploadMiddleware.single('poster_file'), async (req: Request, res: Response) => {
    try {
      const showId = Number(req.params.id);
      if (!Number.isFinite(showId) || showId <= 0) {
        cleanupUploadedFile(req);
        return res.status(400).json({ success: false, error: 'ID de obra inválido.' });
      }
      const payload = normalizeShowBody(req);
      const prevState = await captureTvXpState();
      const show = await updateTvShow(showId, payload);
      const nextState = await captureTvXpState();
      const xpEvent = computeTvXpMutationEvent(prevState, nextState);

      return res.json({
        success: true,
        data: show,
        xpStatus: nextState.xpStatus,
        xpDelta: xpEvent.xpDelta,
        xpEvent,
      });
    } catch (err: any) {
      cleanupUploadedFile(req);
      return res.status(400).json({
        success: false,
        code: err?.code,
        error: err.message,
      });
    }
  });

  router.patch('/seasons/:seasonId/progress', async (req: Request, res: Response) => {
    try {
      const seasonId = Number(req.params.seasonId);
      if (!Number.isFinite(seasonId) || seasonId <= 0) {
        return res.status(400).json({ success: false, error: 'ID de temporada inválido.' });
      }

      const prevState = await captureTvXpState();
      const result = await incrementSeasonProgress(seasonId, {
        delta: req.body?.delta !== undefined ? Number(req.body.delta) : undefined,
        episodes_watched:
          req.body?.episodes_watched !== undefined ? Number(req.body.episodes_watched) : undefined,
        autoCompleteShow: Boolean(req.body?.autoCompleteShow),
      });
      const nextState = await captureTvXpState();
      const xpEvent = computeTvXpMutationEvent(prevState, nextState);

      return res.json({
        success: true,
        data: result.show,
        allSeasonsCompleted: result.allSeasonsCompleted,
        xpStatus: nextState.xpStatus,
        xpDelta: xpEvent.xpDelta,
        xpEvent,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/shows/:id/seasons', async (req: Request, res: Response) => {
    try {
      const showId = Number(req.params.id);
      if (!Number.isFinite(showId) || showId <= 0) {
        return res.status(400).json({ success: false, error: 'ID de obra inválido.' });
      }
      const seasonInput = req.body?.season || req.body;
      const extraStudios = Array.isArray(req.body?.studios) ? req.body.studios : [];

      const prevState = await captureTvXpState();
      const show = await appendSeasonToShow(showId, seasonInput, extraStudios);
      const nextState = await captureTvXpState();
      const xpEvent = computeTvXpMutationEvent(prevState, nextState);

      return res.status(201).json({
        success: true,
        data: show,
        xpStatus: nextState.xpStatus,
        xpDelta: xpEvent.xpDelta,
        xpEvent,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  router.delete('/shows/:id', async (req: Request, res: Response) => {
    try {
      const showId = Number(req.params.id);
      if (!Number.isFinite(showId) || showId <= 0) {
        return res.status(400).json({ success: false, error: 'ID de obra inválido.' });
      }
      const deleted = await deleteTvShow(showId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Obra não encontrada.' });
      }
      const xpStatus = await getTvXpSnapshot();
      return res.json({ success: true, xpStatus });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
