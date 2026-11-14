import fs from 'node:fs';
import path from 'node:path';
import { query } from '../config/database';
import { TrophyTier } from '../data/trophyDefinitions';
import {
  UNIVERSE_CHECKPOINT_XP,
  UNIVERSE_MEGA_BASE_XP,
  UNIVERSE_MEGA_SAGAS,
  UNIVERSE_SAGAS,
  UniverseMegaSagaDef,
  UniverseMovieRequirement,
  UniverseSagaDef,
  computeMegaSagaCompletionXp,
} from '../data/universeDefinitions';

let cachedPosterMap: Record<string, string> | null = null;
let cachedPosterMtime = 0;
let cachedPosterPath: string | null = null;

function getCachedPosterUrl(sagaId: string, order: number): string | null {
  if (!cachedPosterPath) {
    const candidates = [
      path.resolve(__dirname, '../data/universePosterCache.json'),
      path.resolve(process.cwd(), 'src/data/universePosterCache.json'),
      path.resolve(process.cwd(), 'backend/src/data/universePosterCache.json'),
    ];
    cachedPosterPath = candidates.find((file) => fs.existsSync(file)) || null;
  }

  if (cachedPosterPath && fs.existsSync(cachedPosterPath)) {
    try {
      const mtime = fs.statSync(cachedPosterPath).mtimeMs;
      if (!cachedPosterMap || mtime !== cachedPosterMtime) {
        cachedPosterMap = JSON.parse(fs.readFileSync(cachedPosterPath, 'utf8')) || {};
        cachedPosterMtime = mtime;
      }
    } catch {
      cachedPosterMap = cachedPosterMap || {};
    }
  } else if (!cachedPosterMap) {
    cachedPosterMap = {};
  }

  return (cachedPosterMap && cachedPosterMap[`${sagaId}::${order}`]) || null;
}

export const UNIVERSE_XP_BY_TIER: Record<Exclude<TrophyTier, 'platinum'>, number> = {
  bronze: 15,
  silver: 25,
  epic: 40,
  gold: 70,
  mythic: 105,
};

let universeTablesEnsured = false;

export async function ensureUniverseTables(): Promise<void> {
  if (universeTablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS universe_mega_sagas (
      id VARCHAR(80) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      icon VARCHAR(32) NOT NULL DEFAULT '💎',
      tier VARCHAR(32) NOT NULL DEFAULT 'mythic',
      child_saga_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      final_quote TEXT NOT NULL,
      custom_audio VARCHAR(255) NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS universe_sagas (
      id VARCHAR(80) PRIMARY KEY,
      mega_saga_id VARCHAR(80) NULL REFERENCES universe_mega_sagas(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      category_group VARCHAR(64) NOT NULL,
      icon VARCHAR(32) NOT NULL DEFAULT '🌌',
      tier VARCHAR(32) NOT NULL,
      movies JSONB NOT NULL DEFAULT '[]'::jsonb,
      checkpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
      final_quote TEXT NOT NULL,
      custom_audio VARCHAR(255) NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_universe_checkpoints (
      saga_id VARCHAR(80) NOT NULL REFERENCES universe_sagas(id) ON DELETE CASCADE,
      threshold INTEGER NOT NULL,
      xp_awarded INTEGER NOT NULL DEFAULT 30,
      trigger_movie_id INTEGER NULL,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (saga_id, threshold)
    );

    CREATE TABLE IF NOT EXISTS user_universe_completions (
      entity_type VARCHAR(32) NOT NULL,
      entity_id VARCHAR(80) NOT NULL,
      tier VARCHAR(32) NOT NULL,
      xp_awarded INTEGER NOT NULL DEFAULT 0,
      trigger_movie_id INTEGER NULL,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (entity_type, entity_id)
    );
  `);
  universeTablesEnsured = true;
}

export async function seedUniverses(): Promise<void> {
  await ensureUniverseTables();

  for (const ms of UNIVERSE_MEGA_SAGAS) {
    await query(
      `
      INSERT INTO universe_mega_sagas (id, title, subtitle, icon, tier, child_saga_ids, final_quote, custom_audio, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        icon = EXCLUDED.icon,
        tier = EXCLUDED.tier,
        child_saga_ids = EXCLUDED.child_saga_ids,
        final_quote = EXCLUDED.final_quote,
        custom_audio = COALESCE(universe_mega_sagas.custom_audio, EXCLUDED.custom_audio),
        sort_order = EXCLUDED.sort_order
      `,
      [
        ms.id,
        ms.title,
        ms.subtitle,
        ms.icon,
        ms.tier,
        JSON.stringify(ms.childSagaIds),
        ms.finalQuote,
        ms.customAudio || null,
        ms.sortOrder,
      ]
    );
  }

  for (const saga of UNIVERSE_SAGAS) {
    await query(
      `
      INSERT INTO universe_sagas (id, mega_saga_id, title, category_group, icon, tier, movies, checkpoints, final_quote, custom_audio, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        mega_saga_id = EXCLUDED.mega_saga_id,
        title = EXCLUDED.title,
        category_group = EXCLUDED.category_group,
        icon = EXCLUDED.icon,
        tier = EXCLUDED.tier,
        movies = EXCLUDED.movies,
        checkpoints = EXCLUDED.checkpoints,
        final_quote = EXCLUDED.final_quote,
        custom_audio = COALESCE(universe_sagas.custom_audio, EXCLUDED.custom_audio),
        sort_order = EXCLUDED.sort_order
      `,
      [
        saga.id,
        saga.megaSagaId,
        saga.title,
        saga.categoryGroup,
        saga.icon,
        saga.tier,
        JSON.stringify(saga.movies),
        JSON.stringify(saga.checkpoints),
        saga.finalQuote,
        saga.customAudio || null,
        saga.sortOrder,
      ]
    );
  }
}

function normalizeTokens(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsTokenPhrase(normalizedTitle: string, normalizedPhrase: string): boolean {
  if (!normalizedTitle || !normalizedPhrase) return false;
  if (normalizedTitle === normalizedPhrase) return true;
  const rx = new RegExp(`(?:^|\\s)${escapeRegExp(normalizedPhrase)}(?:$|\\s)`);
  return rx.test(normalizedTitle);
}

function parseValidScore(val: unknown, allowZero = false): number | null {
  if (val === null || val === undefined) return null;
  const raw = String(val).trim();
  if (!raw || raw.toUpperCase() === 'N/A') return null;
  const normalized = Number(raw.replace('%', '').replace(',', '.'));
  if (!Number.isFinite(normalized)) return null;
  if (allowZero ? normalized < 0 : normalized <= 0) return null;
  return normalized;
}

interface CatalogMovieRow {
  movie_id: number;
  title: string;
  original_title: string | null;
  release_year: number | null;
  poster_url: string | null;
  user_rating: number | null;
  imdb_rating: number | null;
  metacritic_score: number | null;
  rotten_tomatoes_score: number | null;
}

function matchesYearRequirement(movieYear: number | null, req: UniverseMovieRequirement): boolean {
  if (!movieYear || !req.year) return true;
  const accepted = Array.isArray(req.altYears) && req.altYears.length > 0 ? req.altYears : [req.year];
  return accepted.some((y) => Math.abs(Number(movieYear) - Number(y)) <= 1);
}

const CJK_SCRIPT_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;

function normalizeCjkText(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s・:：\-－—!！?？「」『』()（）/／,.、。~～]+/g, '')
    .trim();
}

export function matchUniverseMovie(m: CatalogMovieRow, req: UniverseMovieRequirement): boolean {
  if (!matchesYearRequirement(m.release_year, req)) {
    return false;
  }

  const rawTitles = [m.title, m.original_title].map((v) => String(v || '').trim()).filter(Boolean);
  if (rawTitles.length === 0) return false;

  const normalizedTitles = rawTitles.map(normalizeTokens).filter(Boolean);
  const cjkTitles = rawTitles.map(normalizeCjkText).filter(Boolean);

  if (Array.isArray(req.exclude) && req.exclude.length > 0) {
    for (const ex of req.exclude) {
      if (CJK_SCRIPT_REGEX.test(ex)) {
        const cjkEx = normalizeCjkText(ex);
        if (cjkEx && cjkTitles.some((t) => t.includes(cjkEx))) {
          return false;
        }
      } else {
        const cEx = normalizeTokens(ex);
        if (cEx && normalizedTitles.some((t) => containsTokenPhrase(t, cEx))) {
          return false;
        }
      }
    }
  }

  for (const p of req.patterns || []) {
    if (CJK_SCRIPT_REGEX.test(p)) {
      const cjkPattern = normalizeCjkText(p);
      if (cjkPattern.length >= 2 && cjkTitles.some((t) => t.includes(cjkPattern))) {
        return true;
      }
    } else {
      const normP = normalizeTokens(p);
      if (normP && normalizedTitles.some((t) => containsTokenPhrase(t, normP))) {
        return true;
      }
    }
  }

  return false;
}

export interface UniverseCheckpointStatus {
  threshold: number;
  xp: number;
  quote: string;
  unlocked: boolean;
}

export interface UniverseMovieStatus {
  order: number;
  title: string;
  originalTitle?: string;
  year: number;
  watched: boolean;
  movieId: number | null;
  matchedTitle: string | null;
  userRating: number | null;
  imdbRating: number | null;
  metacriticScore: number | null;
  rottenTomatoesScore: number | null;
  posterUrl: string | null;
}

export interface UniverseSagaStatus {
  id: string;
  megaSagaId: string | null;
  title: string;
  categoryGroup: string;
  icon: string;
  tier: Exclude<TrophyTier, 'platinum' | 'mythic'>;
  completionXp: number;
  watchedCount: number;
  totalCount: number;
  progressPct: number;
  isCompleted: boolean;
  checkpoints: UniverseCheckpointStatus[];
  unlockedCheckpointsCount: number;
  finalQuote: string;
  customAudio: string | null;
  sortOrder: number;
  movies: UniverseMovieStatus[];
}

export interface UniverseMegaSagaStatus {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tier: 'mythic';
  completionXp: number;
  childSagaIds: string[];
  completedBlocks: number;
  totalBlocks: number;
  totalMoviesCount: number;
  watchedMoviesCount: number;
  progressPct: number;
  isCompleted: boolean;
  finalQuote: string;
  customAudio: string | null;
  sortOrder: number;
  posters: Array<{
    title: string;
    posterUrl: string | null;
    year: number;
    userRating?: number | null;
    imdbRating?: number | null;
    metacriticScore?: number | null;
    rottenTomatoesScore?: number | null;
  }>;
}

export interface NewlyHitUniverseCheckpoint {
  sagaId: string;
  sagaTitle: string;
  icon: string;
  threshold: number;
  xp: number;
  quote: string;
  watchedCount: number;
  totalCount: number;
}

export interface UniverseVictoryEvent {
  id: string;
  universeId?: string;
  megaSagaId?: string | null;
  entityType: 'saga' | 'mega_saga';
  title: string;
  icon: string;
  tier: Exclude<TrophyTier, 'platinum'>;
  xp: number;
  finalQuote: string;
  customAudio: string | null;
  watchedCount: number;
  totalCount: number;
  posters: Array<{
    title: string;
    posterUrl: string | null;
    year: number;
    userRating?: number | null;
    imdbRating?: number | null;
    metacriticScore?: number | null;
    rottenTomatoesScore?: number | null;
  }>;
}

export interface UniverseXpSummary {
  completedSagasCount: number;
  totalSagasCount: number;
  completedMegaSagasCount: number;
  totalMegaSagasCount: number;
  unlockedCheckpointsCount: number;
  checkpointsXp: number;
  sagasXp: number;
  megaSagasXp: number;
  totalXp: number;
  unlockedCheckpointKeys: Record<
    string,
    { sagaId: string; sagaTitle: string; icon: string; threshold: number; quote: string; xp: number }
  >;
  completedSagas: Record<string, { id: string; title: string; tier: Exclude<TrophyTier, 'platinum'>; xp: number }>;
  completedMegaSagas: Record<string, { id: string; title: string; tier: 'mythic'; xp: number }>;
}

export interface UniverseCodexPayload {
  summary: {
    totalSagas: number;
    completedSagas: number;
    totalMegaSagas: number;
    completedMegaSagas: number;
    unlockedCheckpoints: number;
    totalCheckpoints: number;
    checkpointsXp: number;
    sagasXp: number;
    megaSagasXp: number;
    totalUniverseXp: number;
  };
  megaSagas: UniverseMegaSagaStatus[];
  sagas: UniverseSagaStatus[];
  xpSummary: UniverseXpSummary;
  newlyHitCheckpoints: NewlyHitUniverseCheckpoint[];
  newlyCompletedSagas: UniverseVictoryEvent[];
  newlyCompletedMegaSagas: UniverseVictoryEvent[];
}

export async function evaluateAndBuildUniverseCodex(
  options: { persist?: boolean; triggerMovieId?: number | null } = {}
): Promise<UniverseCodexPayload> {
  const { persist = false, triggerMovieId = null } = options;
  await seedUniverses();

  const [moviesRes, prevCpRes, prevCompRes, audioMetaRes] = await Promise.all([
    query(`
      SELECT
        m.id AS movie_id,
        m.title,
        m.original_title,
        m.release_year,
        m.poster_url,
        m.imdb_rating,
        m.metacritic_score,
        m.rotten_tomatoes_score,
        mv.user_rating
      FROM movies m
      LEFT JOIN LATERAL (
        SELECT user_rating
        FROM movie_views
        WHERE movie_id = m.id
        ORDER BY watched_at DESC NULLS LAST, id DESC
        LIMIT 1
      ) mv ON TRUE
      ORDER BY m.id ASC
    `),
    query(`SELECT saga_id, threshold, xp_awarded FROM user_universe_checkpoints`),
    query(`SELECT entity_type, entity_id, tier, xp_awarded FROM user_universe_completions`),
    query(`
      SELECT id, custom_audio, 'saga' AS kind FROM universe_sagas
      UNION ALL
      SELECT id, custom_audio, 'mega_saga' AS kind FROM universe_mega_sagas
    `),
  ]);

  const catalogMovies: CatalogMovieRow[] = moviesRes.rows.map((r: any) => ({
    movie_id: Number(r.movie_id),
    title: String(r.title || ''),
    original_title: r.original_title ? String(r.original_title) : null,
    release_year: r.release_year != null ? Number(r.release_year) : null,
    poster_url: r.poster_url ? String(r.poster_url) : null,
    user_rating: parseValidScore(r.user_rating),
    imdb_rating: parseValidScore(r.imdb_rating),
    metacritic_score: parseValidScore(r.metacritic_score),
    rotten_tomatoes_score: parseValidScore(r.rotten_tomatoes_score, true),
  }));

  const prevCheckpointsSet = new Set(
    prevCpRes.rows.map((r: any) => `${r.saga_id}::${Number(r.threshold)}`)
  );
  const prevCompletionsSet = new Set(
    prevCompRes.rows.map((r: any) => `${r.entity_type}::${r.entity_id}`)
  );

  const customAudioMap = new Map<string, string | null>();
  audioMetaRes.rows.forEach((r: any) => {
    customAudioMap.set(`${r.kind}::${r.id}`, r.custom_audio || null);
  });

  const sagasStatus: UniverseSagaStatus[] = [];
  const sagaById = new Map<string, UniverseSagaStatus>();
  const newlyHitCheckpoints: NewlyHitUniverseCheckpoint[] = [];
  const newlyCompletedSagas: UniverseVictoryEvent[] = [];

  const unlockedCheckpointKeys: UniverseXpSummary['unlockedCheckpointKeys'] = {};
  const completedSagasMap: UniverseXpSummary['completedSagas'] = {};
  const completedMegaSagasMap: UniverseXpSummary['completedMegaSagas'] = {};

  let totalCheckpointsCount = 0;
  let unlockedCheckpointsCount = 0;
  let checkpointsXp = 0;
  let sagasXp = 0;
  let megaSagasXp = 0;

  for (const sagaDef of UNIVERSE_SAGAS) {
    const usedIds = new Set<number>();
    const movieStatuses: UniverseMovieStatus[] = sagaDef.movies.map((req) => {
      const cachedPosterUrl = getCachedPosterUrl(sagaDef.id, req.order);
      const matched = catalogMovies.find(
        (m) => !usedIds.has(m.movie_id) && matchUniverseMovie(m, req)
      );
      if (matched) {
        usedIds.add(matched.movie_id);
        return {
          order: req.order,
          title: req.title,
          originalTitle: req.originalTitle,
          year: matched.release_year || req.year,
          watched: true,
          movieId: matched.movie_id,
          matchedTitle: matched.title,
          userRating: matched.user_rating,
          imdbRating: matched.imdb_rating,
          metacriticScore: matched.metacritic_score,
          rottenTomatoesScore: matched.rotten_tomatoes_score,
          posterUrl: matched.poster_url || cachedPosterUrl,
        };
      }
      return {
        order: req.order,
        title: req.title,
        originalTitle: req.originalTitle,
        year: req.year,
        watched: false,
        movieId: null,
        matchedTitle: null,
        userRating: null,
        imdbRating: null,
        metacriticScore: null,
        rottenTomatoesScore: null,
        posterUrl: cachedPosterUrl,
      };
    });

    const watchedCount = movieStatuses.filter((m) => m.watched).length;
    const totalCount = movieStatuses.length;
    const progressPct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
    const isCompleted = totalCount > 0 && watchedCount === totalCount;
    const completionXp = UNIVERSE_XP_BY_TIER[sagaDef.tier] || 25;
    const customAudio = customAudioMap.get(`saga::${sagaDef.id}`) ?? sagaDef.customAudio ?? null;

    const cpStatuses: UniverseCheckpointStatus[] = sagaDef.checkpoints.map((cp) => {
      totalCheckpointsCount += 1;
      const unlocked = watchedCount >= cp.threshold;
      const key = `${sagaDef.id}::${cp.threshold}`;
      const xpVal = cp.xp || UNIVERSE_CHECKPOINT_XP;

      if (unlocked) {
        unlockedCheckpointsCount += 1;
        checkpointsXp += xpVal;
        unlockedCheckpointKeys[key] = {
          sagaId: sagaDef.id,
          sagaTitle: sagaDef.title,
          icon: sagaDef.icon,
          threshold: cp.threshold,
          quote: cp.quote,
          xp: xpVal,
        };
        if (!prevCheckpointsSet.has(key)) {
          newlyHitCheckpoints.push({
            sagaId: sagaDef.id,
            sagaTitle: sagaDef.title,
            icon: sagaDef.icon,
            threshold: cp.threshold,
            xp: xpVal,
            quote: cp.quote,
            watchedCount,
            totalCount,
          });
        }
      }

      return {
        threshold: cp.threshold,
        xp: xpVal,
        quote: cp.quote,
        unlocked,
      };
    });

    if (isCompleted) {
      sagasXp += completionXp;
      completedSagasMap[sagaDef.id] = {
        id: sagaDef.id,
        title: sagaDef.title,
        tier: sagaDef.tier,
        xp: completionXp,
      };
      if (!prevCompletionsSet.has(`saga::${sagaDef.id}`)) {
        newlyCompletedSagas.push({
          id: `saga_${sagaDef.id}`,
          universeId: sagaDef.id,
          megaSagaId: sagaDef.megaSagaId ?? null,
          entityType: 'saga',
          title: sagaDef.title,
          icon: sagaDef.icon,
          tier: sagaDef.tier,
          xp: completionXp,
          finalQuote: sagaDef.finalQuote,
          customAudio,
          watchedCount,
          totalCount,
          posters: movieStatuses.map((ms) => ({
            title: ms.matchedTitle || ms.title,
            posterUrl: ms.posterUrl,
            year: ms.year,
            userRating: ms.userRating,
            imdbRating: ms.imdbRating,
            metacriticScore: ms.metacriticScore,
            rottenTomatoesScore: ms.rottenTomatoesScore,
          })),
        });
      }
    }

    if (persist) {
      const validThresholds = cpStatuses.map((c) => c.threshold);
      if (validThresholds.length > 0) {
        await query(
          `DELETE FROM user_universe_checkpoints WHERE saga_id = $1 AND NOT (threshold = ANY($2::int[]))`,
          [sagaDef.id, validThresholds]
        );
      } else {
        await query(`DELETE FROM user_universe_checkpoints WHERE saga_id = $1`, [sagaDef.id]);
      }

      for (const cp of cpStatuses) {
        if (cp.unlocked) {
          await query(
            `
            INSERT INTO user_universe_checkpoints (saga_id, threshold, xp_awarded, trigger_movie_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (saga_id, threshold) DO NOTHING
            `,
            [sagaDef.id, cp.threshold, cp.xp, triggerMovieId]
          );
        } else {
          await query(
            `DELETE FROM user_universe_checkpoints WHERE saga_id = $1 AND threshold = $2`,
            [sagaDef.id, cp.threshold]
          );
        }
      }

      if (isCompleted) {
        await query(
          `
          INSERT INTO user_universe_completions (entity_type, entity_id, tier, xp_awarded, trigger_movie_id)
          VALUES ('saga', $1, $2, $3, $4)
          ON CONFLICT (entity_type, entity_id) DO UPDATE SET
            tier = EXCLUDED.tier,
            xp_awarded = EXCLUDED.xp_awarded
          `,
          [sagaDef.id, sagaDef.tier, completionXp, triggerMovieId]
        );
      } else {
        await query(
          `DELETE FROM user_universe_completions WHERE entity_type = 'saga' AND entity_id = $1`,
          [sagaDef.id]
        );
      }
    }

    const sagaStatus: UniverseSagaStatus = {
      id: sagaDef.id,
      megaSagaId: sagaDef.megaSagaId,
      title: sagaDef.title,
      categoryGroup: sagaDef.categoryGroup,
      icon: sagaDef.icon,
      tier: sagaDef.tier,
      completionXp,
      watchedCount,
      totalCount,
      progressPct,
      isCompleted,
      checkpoints: cpStatuses,
      unlockedCheckpointsCount: cpStatuses.filter((c) => c.unlocked).length,
      finalQuote: sagaDef.finalQuote,
      customAudio,
      sortOrder: sagaDef.sortOrder,
      movies: movieStatuses,
    };

    sagasStatus.push(sagaStatus);
    sagaById.set(sagaDef.id, sagaStatus);
  }

  // Avalia Mega-Sagas Míticas a partir da conclusão de todos os blocos filhos
  const megaSagasStatus: UniverseMegaSagaStatus[] = [];
  const newlyCompletedMegaSagas: UniverseVictoryEvent[] = [];

  for (const msDef of UNIVERSE_MEGA_SAGAS) {
    const children = msDef.childSagaIds
      .map((cid) => sagaById.get(cid))
      .filter((x): x is UniverseSagaStatus => Boolean(x));

    const completedBlocks = children.filter((c) => c.isCompleted).length;
    const totalBlocks = children.length;
    const totalMoviesCount = children.reduce((acc, c) => acc + c.totalCount, 0);
    const watchedMoviesCount = children.reduce((acc, c) => acc + c.watchedCount, 0);
    const progressPct =
      totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
    const isCompleted = totalBlocks > 0 && completedBlocks === totalBlocks;
    // Regra Mítica: 500 XP de bônus base + 25 XP por filme total dos blocos filhos da Mega-Saga
    const completionXp = computeMegaSagaCompletionXp(totalMoviesCount);
    const customAudio = customAudioMap.get(`mega_saga::${msDef.id}`) ?? msDef.customAudio ?? null;

    // Pôsteres únicos dos filmes já vistos nos blocos desta Mega-Saga
    const seenPosterTitles = new Set<string>();
    const posters: UniverseMegaSagaStatus['posters'] = [];
    for (const child of children) {
      for (const m of child.movies) {
        if (!m.watched) continue;
        const key = `${m.movieId || m.title}`;
        if (seenPosterTitles.has(key)) continue;
        seenPosterTitles.add(key);
        posters.push({
          title: m.matchedTitle || m.title,
          posterUrl: m.posterUrl,
          year: m.year,
          userRating: m.userRating,
          imdbRating: m.imdbRating,
          metacriticScore: m.metacriticScore,
          rottenTomatoesScore: m.rottenTomatoesScore,
        });
      }
    }

    if (isCompleted) {
      megaSagasXp += completionXp;
      completedMegaSagasMap[msDef.id] = {
        id: msDef.id,
        title: msDef.title,
        tier: 'mythic',
        xp: completionXp,
      };
      if (!prevCompletionsSet.has(`mega_saga::${msDef.id}`)) {
        newlyCompletedMegaSagas.push({
          id: `mega_${msDef.id}`,
          universeId: msDef.id,
          megaSagaId: msDef.id,
          entityType: 'mega_saga',
          title: msDef.title,
          icon: msDef.icon,
          tier: 'mythic',
          xp: completionXp,
          finalQuote: msDef.finalQuote,
          customAudio,
          watchedCount: watchedMoviesCount,
          totalCount: totalMoviesCount,
          posters,
        });
      }
    }

    if (persist) {
      if (isCompleted) {
        await query(
          `
          INSERT INTO user_universe_completions (entity_type, entity_id, tier, xp_awarded, trigger_movie_id)
          VALUES ('mega_saga', $1, 'mythic', $2, $3)
          ON CONFLICT (entity_type, entity_id) DO UPDATE SET
            xp_awarded = EXCLUDED.xp_awarded
          `,
          [msDef.id, completionXp, triggerMovieId]
        );
      } else {
        await query(
          `DELETE FROM user_universe_completions WHERE entity_type = 'mega_saga' AND entity_id = $1`,
          [msDef.id]
        );
      }
    }

    megaSagasStatus.push({
      id: msDef.id,
      title: msDef.title,
      subtitle: msDef.subtitle,
      icon: msDef.icon,
      tier: 'mythic',
      completionXp,
      childSagaIds: msDef.childSagaIds,
      completedBlocks,
      totalBlocks,
      totalMoviesCount,
      watchedMoviesCount,
      progressPct,
      isCompleted,
      finalQuote: msDef.finalQuote,
      customAudio,
      sortOrder: msDef.sortOrder,
      posters,
    });
  }

  const completedSagasCount = Object.keys(completedSagasMap).length;
  const completedMegaSagasCount = Object.keys(completedMegaSagasMap).length;
  const totalUniverseXp = checkpointsXp + sagasXp + megaSagasXp;

  const xpSummary: UniverseXpSummary = {
    completedSagasCount,
    totalSagasCount: UNIVERSE_SAGAS.length,
    completedMegaSagasCount,
    totalMegaSagasCount: UNIVERSE_MEGA_SAGAS.length,
    unlockedCheckpointsCount,
    checkpointsXp,
    sagasXp,
    megaSagasXp,
    totalXp: totalUniverseXp,
    unlockedCheckpointKeys,
    completedSagas: completedSagasMap,
    completedMegaSagas: completedMegaSagasMap,
  };

  return {
    summary: {
      totalSagas: UNIVERSE_SAGAS.length,
      completedSagas: completedSagasCount,
      totalMegaSagas: UNIVERSE_MEGA_SAGAS.length,
      completedMegaSagas: completedMegaSagasCount,
      unlockedCheckpoints: unlockedCheckpointsCount,
      totalCheckpoints: totalCheckpointsCount,
      checkpointsXp,
      sagasXp,
      megaSagasXp,
      totalUniverseXp,
    },
    megaSagas: megaSagasStatus,
    sagas: sagasStatus,
    xpSummary,
    newlyHitCheckpoints,
    newlyCompletedSagas,
    newlyCompletedMegaSagas,
  };
}

/**
 * Lê rapidamente o resumo oficial de XP do Códice dos Universos diretamente do banco.
 */
export async function getQuickUniverseXpSummary(): Promise<UniverseXpSummary> {
  await seedUniverses();
  const [cpRes, compRes] = await Promise.all([
    query(`SELECT saga_id, threshold, xp_awarded FROM user_universe_checkpoints`),
    query(`SELECT entity_type, entity_id, tier, xp_awarded FROM user_universe_completions`),
  ]);

  const sagaById = new Map<string, UniverseSagaDef>(UNIVERSE_SAGAS.map((s) => [s.id, s]));
  const megaById = new Map<string, UniverseMegaSagaDef>(UNIVERSE_MEGA_SAGAS.map((m) => [m.id, m]));

  const unlockedCheckpointKeys: UniverseXpSummary['unlockedCheckpointKeys'] = {};
  let checkpointsXp = 0;

  for (const row of cpRes.rows) {
    const sagaId = String(row.saga_id);
    const threshold = Number(row.threshold);
    const sagaDef = sagaById.get(sagaId);
    const cpDef = sagaDef?.checkpoints.find((c) => c.threshold === threshold);
    if (!cpDef) continue;
    const xpVal = Number(row.xp_awarded) || cpDef.xp || UNIVERSE_CHECKPOINT_XP;
    checkpointsXp += xpVal;
    unlockedCheckpointKeys[`${sagaId}::${threshold}`] = {
      sagaId,
      sagaTitle: sagaDef?.title || sagaId,
      icon: sagaDef?.icon || '🌌',
      threshold,
      quote: cpDef.quote || '',
      xp: xpVal,
    };
  }

  const completedSagas: UniverseXpSummary['completedSagas'] = {};
  const completedMegaSagas: UniverseXpSummary['completedMegaSagas'] = {};
  let sagasXp = 0;
  let megaSagasXp = 0;

  for (const row of compRes.rows) {
    const entityType = String(row.entity_type);
    const entityId = String(row.entity_id);
    const xpVal = Number(row.xp_awarded) || 0;
    if (entityType === 'saga') {
      const sDef = sagaById.get(entityId);
      if (!sDef) continue;
      const tier = sDef.tier;
      const resolvedXp = UNIVERSE_XP_BY_TIER[tier] || xpVal || 25;
      sagasXp += resolvedXp;
      completedSagas[entityId] = {
        id: entityId,
        title: sDef.title,
        tier,
        xp: resolvedXp,
      };
    } else if (entityType === 'mega_saga') {
      const mDef = megaById.get(entityId);
      if (!mDef) continue;
      const totalMovies = mDef.childSagaIds.reduce(
        (acc, cid) => acc + (sagaById.get(cid)?.movies.length || 0),
        0
      );
      const dynamicXp = totalMovies > 0 ? computeMegaSagaCompletionXp(totalMovies) : 0;
      const resolvedXp = dynamicXp || xpVal || UNIVERSE_MEGA_BASE_XP;
      megaSagasXp += resolvedXp;
      completedMegaSagas[entityId] = {
        id: entityId,
        title: mDef.title,
        tier: 'mythic',
        xp: resolvedXp,
      };
    }
  }

  return {
    completedSagasCount: Object.keys(completedSagas).length,
    totalSagasCount: UNIVERSE_SAGAS.length,
    completedMegaSagasCount: Object.keys(completedMegaSagas).length,
    totalMegaSagasCount: UNIVERSE_MEGA_SAGAS.length,
    unlockedCheckpointsCount: Object.keys(unlockedCheckpointKeys).length,
    checkpointsXp,
    sagasXp,
    megaSagasXp,
    totalXp: checkpointsXp + sagasXp + megaSagasXp,
    unlockedCheckpointKeys,
    completedSagas,
    completedMegaSagas,
  };
}
