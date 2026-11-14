import { query } from '../config/database';
import { matchCuratedCandidate } from './trophyService';
import {
  WALK_ALAMEDAS,
  WALK_FILMS_PER_EXTRA_STAR,
  WALK_MILESTONES,
  WALK_OF_FAME_STARS,
  WalkCuratedMovieReq,
  WalkMilestoneTier,
  WalkStarDefinition,
  computeWalkXpForStar,
  getCuratedMoviesForStar,
  resolveRpgClassLabel,
  resolveRpgRank,
} from '../data/walkOfFameData';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMG_W342 = 'https://image.tmdb.org/t/p/w342';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedPersonCredit {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string;
  release_year: number | null;
  character: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  order: number;
  genre_ids: number[];
}

export interface WalkSkinOption {
  id: string;
  label: string;
  sublabel: string;
  imageUrl: string;
  kind: 'portrait' | 'scene' | 'movie_poster' | 'member' | 'custom';
}

interface CachedExtraImage {
  url: string;
  label: string;
  sublabel: string;
  kind: 'portrait' | 'scene';
}

interface CachedPersonProfile {
  tmdbId: number | null;
  name: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  biography: string | null;
  profilePath: string | null;
  popularity: number | null;
  imdbId: string | null;
  tmdbTotalFeatureCount: number;
  extraImages?: CachedExtraImage[];
  extraImagesChecked?: boolean;
}

interface PersonLookupResult {
  cacheKey: string;
  profile: CachedPersonProfile;
  credits: CachedPersonCredit[];
  wikiExtract: string | null;
  wikiThumbnail: string | null;
}

export const WALK_TIER_RANK: Record<string, number> = {
  cement: 0,
  carving: 0,
  bronze: 1,
  silver: 2,
  epic: 3,
  gold: 4,
  mythic: 5,
  diamond: 6,
};

let walkTablesEnsured = false;

export async function ensureWalkOfFameTables(): Promise<void> {
  if (walkTablesEnsured) return;

  const colCheck = await query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'walk_of_fame_album_state'
        AND column_name = 'claimed_xp_pct'
    ) AS has_claimed_col
  `).catch(() => ({ rows: [{ has_claimed_col: false }] }));
  const hadClaimedCol = Boolean(colCheck.rows?.[0]?.has_claimed_col);

  await query(`
    CREATE TABLE IF NOT EXISTS walk_of_fame_person_cache (
      cache_key VARCHAR(120) PRIMARY KEY,
      tmdb_person_id INTEGER NULL,
      profile_json JSONB DEFAULT '{}'::jsonb,
      credits_json JSONB DEFAULT '[]'::jsonb,
      wiki_extract TEXT NULL,
      wiki_thumbnail TEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS walk_of_fame_album_state (
      star_id VARCHAR(80) PRIMARY KEY,
      stuck_tier VARCHAR(32) NULL,
      previous_stuck_tier VARCHAR(32) NULL,
      stuck_extra_stars INTEGER NOT NULL DEFAULT 0,
      last_notified_tier VARCHAR(32) NULL,
      last_notified_extra_stars INTEGER NOT NULL DEFAULT 0,
      stuck_at TIMESTAMP NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS previous_stuck_tier VARCHAR(32) NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS selected_skin_url TEXT NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS selected_skin_label VARCHAR(120) NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS is_full_art BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS is_favorite_guardian BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS custom_skin_url TEXT NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS custom_skin_label VARCHAR(120) NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS immortal_aura VARCHAR(32) NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS signature_movie_id INTEGER NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS featured_member_name VARCHAR(120) NULL;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS claimed_xp_pct INTEGER NOT NULL DEFAULT 0;

    ALTER TABLE walk_of_fame_album_state
      ADD COLUMN IF NOT EXISTS claimed_xp_extra_stars INTEGER NOT NULL DEFAULT 0;

    CREATE TABLE IF NOT EXISTS walk_of_fame_packs (
      id SERIAL PRIMARY KEY,
      star_id VARCHAR(80) NOT NULL,
      pack_type VARCHAR(32) NOT NULL,
      from_tier VARCHAR(32) NULL,
      to_tier VARCHAR(32) NOT NULL,
      from_pct INTEGER NOT NULL DEFAULT 0,
      to_pct INTEGER NOT NULL DEFAULT 0,
      extra_stars_unlocked INTEGER NOT NULL DEFAULT 0,
      trigger_movie_id INTEGER NULL,
      trigger_movie_title VARCHAR(255) NULL,
      status VARCHAR(24) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      opened_at TIMESTAMP NULL
    );
  `);

  // Migração única: estrelas já coladas sem pacote pendente herdam seu XP já desbloqueado no álbum
  if (!hadClaimedCol) {
    await query(`
      UPDATE walk_of_fame_album_state s
      SET
        claimed_xp_pct = CASE s.stuck_tier
          WHEN 'bronze' THEN 15
          WHEN 'silver' THEN 30
          WHEN 'epic' THEN 45
          WHEN 'gold' THEN 60
          WHEN 'mythic' THEN 75
          WHEN 'diamond' THEN 90
          ELSE 0
        END,
        claimed_xp_extra_stars = CASE
          WHEN s.stuck_tier = 'diamond' THEN COALESCE(s.stuck_extra_stars, 0)
          ELSE 0
        END
      WHERE s.stuck_tier IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM walk_of_fame_packs p
          WHERE p.star_id = s.star_id AND p.status = 'pending'
        )
    `).catch(() => {});
  }

  walkTablesEnsured = true;
}

function getTmdbHeaders(): Record<string, string> {
  const token = process.env.TMDB_BEARER_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeLookupText(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function filterEligibleFeatureCredits(rawCast: any[]): { eligible: CachedPersonCredit[]; totalCount: number } {
  if (!Array.isArray(rawCast)) return { eligible: [], totalCount: 0 };
  const currentMaxYear = new Date().getFullYear() + 1;
  const seenIds = new Set<number>();
  const eligible: CachedPersonCredit[] = [];

  for (const c of rawCast) {
    const id = Number(c?.id || 0);
    if (!id || seenIds.has(id)) continue;
    if (c.adult || c.video) continue;

    const releaseDate = String(c.release_date || '').trim();
    const year = releaseDate.length >= 4 ? Number(releaseDate.slice(0, 4)) : null;
    if (!year || year < 1920 || year > currentMaxYear) continue;

    const charText = String(c.character || '').trim();
    const genres: number[] = Array.isArray(c.genre_ids) ? c.genre_ids.map(Number) : [];
    const isSelfOrArchive = /^(self|himself|herself|themself|archive footage|ele mesmo|ela mesma)/i.test(charText);
    const isDocumentary = genres.includes(99);
    if (isSelfOrArchive) continue;
    if (isDocumentary && (!charText || Number(c.order ?? 99) > 3)) continue;
    if (Number(c.order ?? 0) > 22 && Number(c.popularity ?? 0) < 6) continue;

    seenIds.add(id);
    eligible.push({
      id,
      title: String(c.title || c.original_title || ''),
      original_title: String(c.original_title || c.title || ''),
      poster_path: c.poster_path ? String(c.poster_path) : null,
      backdrop_path: c.backdrop_path ? String(c.backdrop_path) : null,
      release_date: releaseDate,
      release_year: year,
      character: charText,
      popularity: Number(c.popularity || 0),
      vote_average: Number(c.vote_average || 0),
      vote_count: Number(c.vote_count || 0),
      order: Number(c.order ?? 99),
      genre_ids: genres,
    });
  }

  eligible.sort((a, b) => {
    const scoreA = a.popularity * 2 + Math.min(2000, a.vote_count) * 0.03;
    const scoreB = b.popularity * 2 + Math.min(2000, b.vote_count) * 0.03;
    return scoreB - scoreA;
  });

  return {
    eligible: eligible.slice(0, 75),
    totalCount: eligible.length,
  };
}

async function fetchJsonSafe(url: string, headers: Record<string, string>): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchWikipediaSummaryPt(wikiTitle: string): Promise<{ extract: string | null; thumbnail: string | null }> {
  if (!wikiTitle) return { extract: null, thumbnail: null };
  const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  const data = await fetchJsonSafe(url, {
    'User-Agent': 'CineCatalogWalkOfFame/1.0 (personal-movie-catalog)',
    Accept: 'application/json',
  });
  if (!data || data.type === 'disambiguation') {
    return { extract: null, thumbnail: null };
  }
  const extract = typeof data.extract === 'string' && data.extract.trim().length > 20 ? data.extract.trim() : null;
  const thumb =
    (data.originalimage?.source && String(data.originalimage.source)) ||
    (data.thumbnail?.source && String(data.thumbnail.source)) ||
    null;
  return { extract, thumbnail: thumb };
}

async function fetchPersonFromApis(
  cacheKey: string,
  searchQuery: string,
  wikiTitle: string
): Promise<PersonLookupResult> {
  const headers = { ...getTmdbHeaders(), Accept: 'application/json' };
  let tmdbId: number | null = null;
  let profile: CachedPersonProfile = {
    tmdbId: null,
    name: searchQuery,
    birthday: null,
    deathday: null,
    placeOfBirth: null,
    biography: null,
    profilePath: null,
    popularity: null,
    imdbId: null,
    tmdbTotalFeatureCount: 0,
  };
  let credits: CachedPersonCredit[] = [];

  if (process.env.TMDB_BEARER_TOKEN) {
    const searchUrl = `${TMDB_BASE}/search/person?query=${encodeURIComponent(searchQuery)}&language=pt-BR&include_adult=false`;
    const searchData = await fetchJsonSafe(searchUrl, headers);
    const results: any[] = searchData?.results || [];
    const best =
      results.find(
        (r) =>
          normalizeLookupText(r.name) === normalizeLookupText(searchQuery) &&
          r.known_for_department === 'Acting'
      ) ||
      results.find((r) => r.known_for_department === 'Acting') ||
      results[0];

    if (best?.id) {
      tmdbId = Number(best.id);
      const detailUrl = `${TMDB_BASE}/person/${tmdbId}?language=pt-BR&append_to_response=movie_credits,images`;
      const taggedUrl = `${TMDB_BASE}/person/${tmdbId}/tagged_images?page=1`;
      const [d, taggedData] = await Promise.all([
        fetchJsonSafe(detailUrl, headers),
        fetchJsonSafe(taggedUrl, headers),
      ]);
      if (d) {
        const filtered = filterEligibleFeatureCredits(d.movie_credits?.cast || []);
        credits = filtered.eligible;

        const extraImages: CachedExtraImage[] = [];
        const seenPaths = new Set<string>();
        if (d.profile_path) seenPaths.add(String(d.profile_path));

        // 1. Retratos / Ensaios Oficiais da pessoa (sempre fotos reais do artista)
        const profilesList: any[] = Array.isArray(d.images?.profiles) ? d.images.profiles : [];
        let portraitIndex = 2;
        let portraitCount = 0;
        for (const img of profilesList) {
          if (portraitCount >= 4) break;
          const fp = img?.file_path ? String(img.file_path) : null;
          if (!fp || seenPaths.has(fp)) continue;
          seenPaths.add(fp);
          extraImages.push({
            url: `${TMDB_IMG_W500}${fp}`,
            label: `Retrato Oficial #${portraitIndex}`,
            sublabel: 'Ensaio / Foto do Artista',
            kind: 'portrait',
          });
          portraitIndex++;
          portraitCount++;
        }

        // 2. Fotos em Cena / Bastidores marcados no TMDB (priorizando enquadramento vertical)
        const taggedResults: any[] = Array.isArray(taggedData?.results) ? [...taggedData.results] : [];
        taggedResults.sort((a, b) => {
          const aVert = Number(a?.height || 0) >= Number(a?.width || 0) ? 1 : 0;
          const bVert = Number(b?.height || 0) >= Number(b?.width || 0) ? 1 : 0;
          return bVert - aVert;
        });
        let sceneCount = 0;
        for (const item of taggedResults) {
          if (sceneCount >= 4) break;
          const fp = item?.file_path ? String(item.file_path) : null;
          if (!fp || seenPaths.has(fp)) continue;
          seenPaths.add(fp);
          const mediaTitle = item?.media?.title || item?.media?.name || null;
          extraImages.push({
            url: `${TMDB_IMG_W500}${fp}`,
            label: mediaTitle ? String(mediaTitle) : 'Caracterizado em Cena',
            sublabel: item?.media_type === 'tv' ? 'Em Cena / Bastidor (Série)' : 'Em Cena (TMDB)',
            kind: 'scene',
          });
          sceneCount++;
        }

        profile = {
          tmdbId,
          name: String(d.name || searchQuery),
          birthday: d.birthday || null,
          deathday: d.deathday || null,
          placeOfBirth: d.place_of_birth || null,
          biography: typeof d.biography === 'string' && d.biography.trim() ? d.biography.trim() : null,
          profilePath: d.profile_path || best.profile_path || null,
          popularity: d.popularity != null ? Number(d.popularity) : null,
          imdbId: d.imdb_id || null,
          tmdbTotalFeatureCount: filtered.totalCount,
          extraImages,
          extraImagesChecked: true,
        };
      }
    }
  }

  const wiki = await fetchWikipediaSummaryPt(wikiTitle);

  return {
    cacheKey,
    profile,
    credits,
    wikiExtract: wiki.extract,
    wikiThumbnail: wiki.thumbnail,
  };
}

async function resolvePersonMetadata(
  cacheKey: string,
  searchQuery: string,
  wikiTitle: string,
  existingMap: Map<string, any>,
  forceRefresh: boolean
): Promise<PersonLookupResult> {
  const existing = existingMap.get(cacheKey);
  if (existing && !forceRefresh) {
    const updatedMs = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
    const isFresh = updatedMs > 0 && Date.now() - updatedMs < CACHE_TTL_MS;
    const hasTmdbOrNotNeeded = Boolean(!process.env.TMDB_BEARER_TOKEN || existing.tmdb_person_id);
    const hasExtraChecked = Boolean(!process.env.TMDB_BEARER_TOKEN || existing.profile_json?.extraImagesChecked);
    const hasUsefulData = Boolean(
      hasTmdbOrNotNeeded &&
        hasExtraChecked &&
        (existing.profile_json?.profilePath || existing.wiki_thumbnail || existing.wiki_extract)
    );
    if (isFresh && hasUsefulData) {
      return {
        cacheKey,
        profile: existing.profile_json || {},
        credits: Array.isArray(existing.credits_json) ? existing.credits_json : [],
        wikiExtract: existing.wiki_extract || null,
        wikiThumbnail: existing.wiki_thumbnail || null,
      };
    }
  }

  const fresh = await fetchPersonFromApis(cacheKey, searchQuery, wikiTitle);
  const hasAnyData = Boolean(
    fresh.profile.tmdbId || fresh.profile.profilePath || fresh.wikiThumbnail || fresh.wikiExtract
  );
  if (hasAnyData) {
    await query(
      `
        INSERT INTO walk_of_fame_person_cache
          (cache_key, tmdb_person_id, profile_json, credits_json, wiki_extract, wiki_thumbnail, updated_at)
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (cache_key) DO UPDATE SET
          tmdb_person_id = EXCLUDED.tmdb_person_id,
          profile_json = EXCLUDED.profile_json,
          credits_json = EXCLUDED.credits_json,
          wiki_extract = EXCLUDED.wiki_extract,
          wiki_thumbnail = EXCLUDED.wiki_thumbnail,
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        cacheKey,
        fresh.profile.tmdbId,
        JSON.stringify(fresh.profile),
        JSON.stringify(fresh.credits),
        fresh.wikiExtract,
        fresh.wikiThumbnail,
      ]
    );
  }

  return fresh;
}

function formatDateBr(isoDate: string | null | undefined): string | null {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function calculateAgeMetadata(
  birthday: string | null | undefined,
  deathday: string | null | undefined,
  fallbackDeceased = false
): {
  age: number | null;
  birthdayBr: string | null;
  deathdayBr: string | null;
  isDeceased: boolean;
  lifespanLabel: string | null;
} {
  const bStr = birthday && /^\d{4}-\d{2}-\d{2}$/.test(birthday) ? birthday : null;
  const dStr = deathday && /^\d{4}-\d{2}-\d{2}$/.test(deathday) ? deathday : null;
  const isDeceased = Boolean(dStr || fallbackDeceased);

  if (!bStr) {
    return {
      age: null,
      birthdayBr: null,
      deathdayBr: formatDateBr(dStr),
      isDeceased,
      lifespanLabel: isDeceased ? 'Em Memória' : null,
    };
  }

  const [by, bm, bd] = bStr.split('-').map(Number);
  let refY: number;
  let refM: number;
  let refD: number;

  if (dStr) {
    [refY, refM, refD] = dStr.split('-').map(Number);
  } else {
    const now = new Date();
    refY = now.getFullYear();
    refM = now.getMonth() + 1;
    refD = now.getDate();
  }

  let age = refY - by;
  if (refM < bm || (refM === bm && refD < bd)) {
    age -= 1;
  }
  const safeAge = age >= 0 && age < 130 ? age : null;
  const birthdayBr = formatDateBr(bStr);
  const deathdayBr = formatDateBr(dStr);

  let lifespanLabel: string | null = null;
  if (isDeceased && dStr) {
    lifespanLabel = `${by} — ✝ ${dStr.slice(0, 4)}${safeAge !== null ? ` (${safeAge} anos)` : ''}`;
  } else if (safeAge !== null) {
    lifespanLabel = `${safeAge} anos`;
  }

  return { age: safeAge, birthdayBr, deathdayBr, isDeceased, lifespanLabel };
}

function filmsNeededForPct(currentCount: number, ceiling: number, targetPct: number): number {
  if (ceiling <= 0) return 0;
  const currentPct = Math.min(100, Math.round((currentCount / ceiling) * 100));
  if (currentPct >= targetPct) return 0;
  for (let k = currentCount + 1; k <= ceiling + 1; k++) {
    if (Math.min(100, Math.round((k / ceiling) * 100)) >= targetPct) {
      return k - currentCount;
    }
  }
  return Math.max(1, ceiling - currentCount);
}

export function resolveWalkMilestones(watchedCount: number, ceiling: number) {
  const safeCeiling = Math.max(1, ceiling);
  const percentage = Math.min(100, Math.round((watchedCount / safeCeiling) * 100));

  const milestones = WALK_MILESTONES.map((m) => {
    const unlocked = percentage >= m.thresholdPct;
    const targetCount = Math.max(1, Math.round((m.thresholdPct / 100) * safeCeiling));
    const remainingFilms = unlocked ? 0 : filmsNeededForPct(watchedCount, safeCeiling, m.thresholdPct);
    return {
      ...m,
      targetCount,
      unlocked,
      remainingFilms,
    };
  });

  const unlockedList = milestones.filter((m) => m.unlocked);
  const currentMilestone: (WalkMilestoneTier & { targetCount?: number }) | null =
    unlockedList.length > 0 ? unlockedList[unlockedList.length - 1] : null;
  const nextMilestone = milestones.find((m) => !m.unlocked) || null;
  const isDiamond = percentage >= 90;

  const extraFilms = Math.max(0, watchedCount - safeCeiling);
  const extraStars = Math.floor(extraFilms / WALK_FILMS_PER_EXTRA_STAR);
  const filmsToNextExtraStar = WALK_FILMS_PER_EXTRA_STAR - (extraFilms % WALK_FILMS_PER_EXTRA_STAR);

  let statusLabel = 'Bloqueada';
  let statusIcon = '🔒';
  let statusTierKey = 'cement';
  let accentHex = '#71717a';

  if (currentMilestone) {
    statusLabel = currentMilestone.label;
    statusIcon = currentMilestone.icon;
    statusTierKey = currentMilestone.tierKey;
    accentHex = currentMilestone.accentHex;
  } else if (watchedCount > 0) {
    statusLabel = 'Bloqueada (em progresso)';
    statusIcon = '🔒';
    statusTierKey = 'carving';
    accentHex = '#a1a1aa';
  }

  return {
    percentage,
    watchedCount,
    ceiling: safeCeiling,
    extraFilms,
    extraStars,
    filmsToNextExtraStar,
    isStickerUnlocked: percentage >= 15,
    isInaugurated: percentage >= 15,
    isDiamond,
    statusLabel,
    statusIcon,
    statusTierKey,
    accentHex,
    currentMilestone,
    nextMilestone,
    milestones,
  };
}

interface CatalogMovieJoined {
  movie_id: number;
  title: string;
  original_title: string | null;
  release_year: number | null;
  poster_url: string | null;
  backdrop_path: string | null;
  imdb_rating: number | null;
  user_rating: number | null;
  view_id: number | null;
  watched_at: string | null;
  month_seen: number | null;
  year_seen: number | null;
  tmdb_id: number | null;
  cast_json: any[] | null;
  tmdb_genres?: any[] | null;
}

function findCharacterForCatalogMovie(
  movie: CatalogMovieJoined,
  credits: CachedPersonCredit[],
  personIds: Set<number>
): string | null {
  if (movie.tmdb_id) {
    const hit = credits.find((c) => Number(c.id) === Number(movie.tmdb_id) && c.character);
    if (hit) return hit.character;
  }
  if (Array.isArray(movie.cast_json) && personIds.size > 0) {
    const memberHit = movie.cast_json.find((c) => personIds.has(Number(c?.id)) && c?.character);
    if (memberHit) return String(memberHit.character);
  }
  const mNormTitles = [normalizeLookupText(movie.title), normalizeLookupText(movie.original_title)].filter(Boolean);
  const titleHit = credits.find((c) => {
    const cNorm = [normalizeLookupText(c.title), normalizeLookupText(c.original_title)];
    return c.character && cNorm.some((t) => t && mNormTitles.includes(t));
  });
  return titleHit?.character || null;
}

function findPosterForCuratedReq(req: WalkCuratedMovieReq, credits: CachedPersonCredit[]): { posterUrl: string | null; tmdbYear: number | null; character: string | null } {
  const cleanPatterns = (req.patterns || []).map(normalizeLookupText).filter(Boolean);
  const match = credits.find((c) => {
    if (req.year && c.release_year && Math.abs(c.release_year - req.year) > 1) return false;
    const cTitles = [normalizeLookupText(c.title), normalizeLookupText(c.original_title)].filter(Boolean);
    return cleanPatterns.some((p) => cTitles.some((t) => t === p || t.includes(p)));
  });
  return {
    posterUrl: match?.poster_path ? `${TMDB_IMG_W342}${match.poster_path}` : null,
    tmdbYear: match?.release_year || req.year || null,
    character: match?.character || null,
  };
}

async function runInChunks<T, R>(items: T[], chunkSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const out = await Promise.all(chunk.map(fn));
    results.push(...out);
  }
  return results;
}

function extractMovieGenres(movie: CatalogMovieJoined): string[] {
  if (!Array.isArray(movie.tmdb_genres)) return [];
  const names: string[] = [];
  for (const g of movie.tmdb_genres) {
    if (typeof g === 'string' && g.trim()) {
      names.push(g.trim());
    } else if (g && typeof g === 'object') {
      if (g.id != null && TMDB_GENRE_NAMES[Number(g.id)]) {
        names.push(TMDB_GENRE_NAMES[Number(g.id)]);
      } else if (typeof g.name === 'string' && g.name.trim()) {
        names.push(g.name.trim());
      }
    }
  }
  return names;
}

function computeDominantGenre(
  moviesList: CatalogMovieJoined[],
  creditsFallback: CachedPersonCredit[]
): string | null {
  const counts = new Map<string, number>();
  for (const m of moviesList) {
    for (const gName of extractMovieGenres(m)) {
      counts.set(gName, (counts.get(gName) || 0) + 1);
    }
  }
  if (counts.size === 0) {
    for (const c of creditsFallback || []) {
      for (const gid of c.genre_ids || []) {
        const mapped = TMDB_GENRE_NAMES[Number(gid)];
        if (mapped) counts.set(mapped, (counts.get(mapped) || 0) + 1);
      }
    }
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [name, cnt] of counts.entries()) {
    if (cnt > bestCount) {
      best = name;
      bestCount = cnt;
    }
  }
  return best;
}

function toCompactFilmRef(film: any) {
  if (!film) return null;
  return {
    movieId: Number(film.movieId),
    title: String(film.title || ''),
    releaseYear: film.releaseYear || null,
    posterUrl: film.posterUrl || null,
    userRating: typeof film.userRating === 'number' ? Number(film.userRating) : null,
    character: film.character || null,
  };
}

function buildGroupMemberSummary(
  def: { name: string; roleLabel: string; oscarWins?: number; oscarNominations?: number },
  resolved: PersonLookupResult,
  memberWatchedFilms: any[] = [],
  memberMovies: CatalogMovieJoined[] = []
) {
  const ageMeta = calculateAgeMetadata(resolved.profile.birthday, resolved.profile.deathday, false);
  const photoUrl = resolved.profile.profilePath
    ? `${TMDB_IMG_W500}${resolved.profile.profilePath}`
    : resolved.wikiThumbnail || null;

  const ratedFilms = [...memberWatchedFilms]
    .filter((f) => typeof f.userRating === 'number')
    .sort((a, b) => {
      const diff = Number(b.userRating) - Number(a.userRating);
      if (diff !== 0) return diff;
      return (b.releaseYear || 0) - (a.releaseYear || 0);
    });

  const avgUserRating =
    ratedFilms.length > 0
      ? Number((ratedFilms.reduce((sum, f) => sum + Number(f.userRating), 0) / ratedFilms.length).toFixed(1))
      : null;
  const topUserFilm = ratedFilms.length > 0 ? ratedFilms[0] : memberWatchedFilms[0] || null;
  const worstUserFilm = ratedFilms.length > 0 ? ratedFilms[ratedFilms.length - 1] : null;
  const dominantGenre = computeDominantGenre(memberMovies, resolved.credits || []);
  const biography =
    (resolved.profile.biography && resolved.profile.biography.length >= 40
      ? resolved.profile.biography
      : null) ||
    resolved.wikiExtract ||
    resolved.profile.biography ||
    `${def.name} (${def.roleLabel}) compõe esta estrela em conjunto no catálogo.`;
  const bioSource =
    resolved.profile.biography && resolved.profile.biography.length >= 40
      ? 'TMDB PT-BR'
      : resolved.wikiExtract
      ? 'Wikipedia PT-BR'
      : 'Curadoria';

  return {
    name: def.name,
    roleLabel: def.roleLabel,
    tmdbId: resolved.profile.tmdbId,
    photoUrl,
    age: ageMeta.age,
    birthdayBr: ageMeta.birthdayBr,
    deathdayBr: ageMeta.deathdayBr,
    isDeceased: ageMeta.isDeceased,
    lifespanLabel: ageMeta.lifespanLabel,
    placeOfBirth: resolved.profile.placeOfBirth,
    biography,
    bioSource,
    dominantGenre,
    rpgClassLabel: resolveRpgClassLabel({
      kind: 'actor',
      isDeceased: ageMeta.isDeceased,
      dominantGenre,
      fallbackTitle: def.roleLabel,
    }),
    oscarWins: Number(def.oscarWins || 0),
    oscarNominations: Number(def.oscarNominations || 0),
    watchedCount: memberWatchedFilms.length,
    avgUserRating,
    topUserFilm: toCompactFilmRef(topUserFilm),
    worstUserFilm: toCompactFilmRef(worstUserFilm),
  };
}

const TMDB_GENRE_NAMES: Record<number, string> = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
};

export const WALK_IMMORTAL_AURA_ORDER = [
  'prism',
  'gold',
  'ruby',
  'cyan',
  'emerald',
  'amethyst',
  'magma',
  'rose_neon',
  'celestial',
  'void',
] as const;

export type WalkImmortalAuraId = (typeof WALK_IMMORTAL_AURA_ORDER)[number];

function resolveRpgLevelMeta(totalXp: number) {
  const safeXp = Math.max(0, totalXp);
  const xpPerLevel = 250;
  const rpgLevel = Math.floor(safeXp / xpPerLevel) + 1;
  const xpInLevel = safeXp % xpPerLevel;
  const rpgProgressPct = Math.round((xpInLevel / xpPerLevel) * 100);

  let rpgLevelTitle = 'Colecionador Iniciante';
  if (rpgLevel >= 20) rpgLevelTitle = 'Entidade Imortal do Cinema';
  else if (rpgLevel >= 15) rpgLevelTitle = 'Arquivista Lendário da Calçada';
  else if (rpgLevel >= 11) rpgLevelTitle = 'Curador Supremo das Estrelas';
  else if (rpgLevel >= 7) rpgLevelTitle = 'Diretor de Acervo VIP';
  else if (rpgLevel >= 4) rpgLevelTitle = 'Caçador de Autógrafos';
  else if (rpgLevel >= 2) rpgLevelTitle = 'Olheiro da Sétima Arte';

  return {
    rpgXpTotal: safeXp,
    rpgLevel,
    rpgLevelTitle,
    rpgXpInLevel: xpInLevel,
    rpgXpPerLevel: xpPerLevel,
    rpgProgressPct,
  };
}

function buildSkinOptions(options: {
  starKind: WalkStarDefinition['kind'];
  photoUrl: string | null;
  customSkinUrl: string | null;
  customSkinLabel: string | null;
  primary: PersonLookupResult;
  groupResolved: Array<{ def: { name: string; roleLabel: string }; resolved?: PersonLookupResult }>;
  watchedFilms: any[];
  pendingFilms: any[];
  combinedCredits: CachedPersonCredit[];
}): WalkSkinOption[] {
  const {
    starKind,
    photoUrl,
    customSkinUrl,
    customSkinLabel,
    primary,
    groupResolved,
    watchedFilms,
    pendingFilms,
    combinedCredits,
  } = options;
  const skins: WalkSkinOption[] = [];
  const seenUrls = new Set<string>();

  const pushSkin = (skin: WalkSkinOption, maxCap = 5) => {
    if (!skin.imageUrl || seenUrls.has(skin.imageUrl) || skins.length >= maxCap) return;
    seenUrls.add(skin.imageUrl);
    skins.push(skin);
  };

  if (photoUrl) {
    pushSkin({
      id: 'default_portrait',
      label: 'Retrato Oficial',
      sublabel: 'Visual Clássico da Estrela',
      imageUrl: photoUrl,
      kind: 'portrait',
    });
  }

  // Para grupos/elencos, prioriza os rostos dos integrantes reais
  for (const gm of groupResolved) {
    if (skins.length >= 4) break;
    const gUrl = gm.resolved?.profile?.profilePath
      ? `${TMDB_IMG_W500}${gm.resolved.profile.profilePath}`
      : gm.resolved?.wikiThumbnail || null;
    if (gUrl) {
      pushSkin({
        id: `member_${normalizeLookupText(gm.def.name).replace(/\s+/g, '_')}`,
        label: gm.def.name,
        sublabel: gm.def.roleLabel || 'Integrante do Grupo',
        imageUrl: gUrl,
        kind: 'member',
      });
    }
  }

  // OPÇÃO 1: Fotos reais da pessoa / em cena (sem capas de filme na frente!)
  const extraImgs = Array.isArray(primary.profile.extraImages) ? primary.profile.extraImages : [];
  const portraitsFirst = [
    ...extraImgs.filter((x) => x.kind === 'scene'),
    ...extraImgs.filter((x) => x.kind !== 'scene'),
  ];
  for (let i = 0; i < portraitsFirst.length; i++) {
    if (skins.length >= 5) break;
    const ex = portraitsFirst[i];
    pushSkin({
      id: `extra_${ex.kind}_${i + 1}`,
      label: ex.label,
      sublabel: ex.sublabel,
      imageUrl: ex.url,
      kind: ex.kind,
    });
  }

  // OPÇÃO 2 (Dubladores): frames/cenas da obra animada antes de recorrer a pôster completo
  if (starKind === 'dublador') {
    for (const wf of watchedFilms) {
      if (skins.length >= 5) break;
      if (!wf.backdropUrl) continue;
      pushSkin({
        id: `dub_scene_${wf.movieId}`,
        label: wf.title,
        sublabel: wf.character ? `Cena: ${wf.character}` : 'Cena da Animação / Dublagem',
        imageUrl: wf.backdropUrl,
        kind: 'scene',
      });
    }
  }

  // Completa os slots restantes com fotos de álbum / cartazes se faltarem fotos da pessoa
  for (const wf of watchedFilms) {
    if (skins.length >= 5) break;
    if (!wf.posterUrl) continue;
    pushSkin({
      id: `watched_poster_${wf.movieId}`,
      label: wf.title,
      sublabel: wf.character ? `Papel: ${wf.character}` : `Catálogo (${wf.releaseYear || 'Clássico'})`,
      imageUrl: wf.posterUrl,
      kind: 'movie_poster',
    });
  }

  for (const pf of pendingFilms) {
    if (skins.length >= 5) break;
    if (!pf.posterUrl) continue;
    pushSkin({
      id: `pending_poster_${normalizeLookupText(pf.title).slice(0, 28)}`,
      label: pf.title,
      sublabel: pf.character ? `Papel: ${pf.character}` : `Obra Icônica (${pf.releaseYear || 'Clássico'})`,
      imageUrl: pf.posterUrl,
      kind: 'movie_poster',
    });
  }

  for (const c of combinedCredits) {
    if (skins.length >= 5) break;
    if (!c.poster_path) continue;
    pushSkin({
      id: `credit_poster_${c.id}`,
      label: c.title,
      sublabel: c.character ? `Papel: ${c.character}` : `Filmografia (${c.release_year || 'TMDB'})`,
      imageUrl: `${TMDB_IMG_W500}${c.poster_path}`,
      kind: 'movie_poster',
    });
  }

  // Foto enviada pelo usuário (Upload do PC ou Link URL) entra junto como skin extra exclusiva
  if (customSkinUrl) {
    pushSkin(
      {
        id: 'custom_user_skin',
        label: customSkinLabel || 'Minha Foto Customizada',
        sublabel: 'Personalizada por Você',
        imageUrl: customSkinUrl,
        kind: 'custom',
      },
      6
    );
  }

  return skins;
}

function buildDecadeBreakdown(watchedFilms: any[]) {
  type DecadeAcc = { count: number; ratings: number[]; topTitle: string | null; topRating: number };
  const byDecade = new Map<number, DecadeAcc>();
  for (const f of watchedFilms) {
    const year = Number(f.releaseYear);
    if (!Number.isFinite(year) || year < 1900) continue;
    const dec = Math.floor(year / 10) * 10;
    const entry: DecadeAcc = byDecade.get(dec) || {
      count: 0,
      ratings: [],
      topTitle: f.title ? String(f.title) : null,
      topRating: -1,
    };
    entry.count++;
    if (typeof f.userRating === 'number') {
      entry.ratings.push(f.userRating);
      if (f.userRating > entry.topRating) {
        entry.topRating = f.userRating;
        entry.topTitle = f.title;
      }
    } else if (!entry.topTitle) {
      entry.topTitle = f.title;
    }
    byDecade.set(dec, entry);
  }

  const decades = [...byDecade.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, info]) => ({
      decade,
      label: decade < 2000 ? `Anos ${String(decade).slice(2)}` : `Anos ${decade}`,
      count: info.count,
      avgRating:
        info.ratings.length > 0
          ? Number((info.ratings.reduce((acc, r) => acc + r, 0) / info.ratings.length).toFixed(1))
          : null,
      topTitle: info.topTitle,
    }));

  const favoriteDecade =
    decades.length > 0
      ? [...decades].sort(
          (a, b) => b.count - a.count || (b.avgRating ?? -1) - (a.avgRating ?? -1)
        )[0]
      : null;

  return { decades, favoriteDecade };
}

export async function buildWalkOfFamePayload(options: { forceRefresh?: boolean } = {}) {
  const forceRefresh = Boolean(options.forceRefresh);
  await ensureWalkOfFameTables();

  const [moviesRes, cacheRes, albumStateRes, packsRes] = await Promise.all([
    query(`
      SELECT
        m.id AS movie_id,
        m.title,
        m.original_title,
        m.release_year,
        m.poster_url,
        m.imdb_rating,
        m.tmdb_id,
        m.raw_api_data->'tmdb'->'credits'->'cast' AS cast_json,
        m.raw_api_data->'tmdb'->'genres' AS genres_json,
        m.raw_api_data->'tmdb'->>'backdrop_path' AS backdrop_path,
        mv.view_id,
        mv.user_rating,
        mv.watched_at,
        mv.month_seen,
        mv.year_seen
      FROM movies m
      LEFT JOIN LATERAL (
        SELECT id AS view_id, user_rating, watched_at, month_seen, year_seen
        FROM movie_views
        WHERE movie_id = m.id
        ORDER BY watched_at DESC NULLS LAST, id DESC
        LIMIT 1
      ) mv ON TRUE
      ORDER BY m.id ASC
    `),
    query(`SELECT cache_key, tmdb_person_id, profile_json, credits_json, wiki_extract, wiki_thumbnail, updated_at FROM walk_of_fame_person_cache`),
    query(`SELECT star_id, stuck_tier, previous_stuck_tier, stuck_extra_stars, last_notified_tier, last_notified_extra_stars, stuck_at, selected_skin_url, selected_skin_label, custom_skin_url, custom_skin_label, is_full_art, is_favorite_guardian, immortal_aura, signature_movie_id, featured_member_name, claimed_xp_pct, claimed_xp_extra_stars FROM walk_of_fame_album_state`),
    query(`SELECT id, star_id, pack_type, from_tier, to_tier, from_pct, to_pct, extra_stars_unlocked, trigger_movie_id, trigger_movie_title, status, created_at FROM walk_of_fame_packs WHERE status = 'pending' ORDER BY created_at DESC, id DESC`),
  ]);

  const albumStateMap = new Map<string, any>();
  for (const row of albumStateRes.rows) {
    albumStateMap.set(String(row.star_id), row);
  }
  const pendingPackByStar = new Map<string, any>();
  for (const row of packsRes.rows) {
    if (!pendingPackByStar.has(String(row.star_id))) {
      pendingPackByStar.set(String(row.star_id), row);
    }
  }

  const catalogMovies: CatalogMovieJoined[] = moviesRes.rows.map((r: any) => ({
    movie_id: Number(r.movie_id),
    title: String(r.title || ''),
    original_title: r.original_title ? String(r.original_title) : null,
    release_year: r.release_year != null ? Number(r.release_year) : null,
    poster_url: r.poster_url ? String(r.poster_url) : null,
    backdrop_path: r.backdrop_path ? String(r.backdrop_path) : null,
    imdb_rating: r.imdb_rating != null && Number.isFinite(Number(r.imdb_rating)) ? Number(r.imdb_rating) : null,
    user_rating: r.user_rating != null && Number.isFinite(Number(r.user_rating)) ? Number(r.user_rating) : null,
    view_id: r.view_id != null ? Number(r.view_id) : null,
    watched_at: r.watched_at ? new Date(r.watched_at).toISOString() : null,
    month_seen: r.month_seen != null ? Number(r.month_seen) : null,
    year_seen: r.year_seen != null ? Number(r.year_seen) : null,
    tmdb_id: r.tmdb_id != null && Number.isFinite(Number(r.tmdb_id)) ? Number(r.tmdb_id) : null,
    cast_json: Array.isArray(r.cast_json) ? r.cast_json : null,
    tmdb_genres: Array.isArray(r.genres_json) ? r.genres_json : null,
  }));

  const cacheMap = new Map<string, any>();
  for (const row of cacheRes.rows) {
    cacheMap.set(String(row.cache_key), row);
  }

  // Enrich all 23 lead stars + group members with bounded concurrency
  const lookupJobs: Array<{ cacheKey: string; searchQuery: string; wikiTitle: string }> = [];
  for (const star of WALK_OF_FAME_STARS) {
    lookupJobs.push({
      cacheKey: star.id,
      searchQuery: star.searchQuery,
      wikiTitle: star.wikiTitle,
    });
    if (Array.isArray(star.groupMembers)) {
      for (const gm of star.groupMembers) {
        lookupJobs.push({
          cacheKey: `${star.id}::${normalizeLookupText(gm.name).replace(/\s+/g, '_')}`,
          searchQuery: gm.searchQuery,
          wikiTitle: gm.wikiTitle,
        });
      }
    }
  }

  const resolvedList = await runInChunks(lookupJobs, 3, (job) =>
    resolvePersonMetadata(job.cacheKey, job.searchQuery, job.wikiTitle, cacheMap, forceRefresh)
  );

  const resolvedByKey = new Map<string, PersonLookupResult>();
  for (const item of resolvedList) {
    resolvedByKey.set(item.cacheKey, item);
  }

  const starsPayload = WALK_OF_FAME_STARS.map((star: WalkStarDefinition) => {
    const primary = resolvedByKey.get(star.id)!;
    const curatedReqs = getCuratedMoviesForStar(star.id);

    const groupResolved = (star.groupMembers || []).map((gm) => ({
      def: gm,
      resolved: resolvedByKey.get(`${star.id}::${normalizeLookupText(gm.name).replace(/\s+/g, '_')}`),
    }));

    const seenCreditIds = new Set<number>();
    const combinedCredits: CachedPersonCredit[] = [];
    const pushCredit = (c: CachedPersonCredit) => {
      const cid = Number(c?.id || 0);
      if (!cid || seenCreditIds.has(cid)) return;
      seenCreditIds.add(cid);
      combinedCredits.push(c);
    };
    for (const c of primary.credits) pushCredit(c);
    const personIds = new Set<number>();
    if (primary.profile.tmdbId) personIds.add(primary.profile.tmdbId);
    for (const g of groupResolved) {
      if (g.resolved?.profile?.tmdbId) personIds.add(g.resolved.profile.tmdbId);
      if (Array.isArray(g.resolved?.credits)) {
        for (const c of g.resolved!.credits) pushCredit(c);
      }
    }
    if (star.kind === 'group') {
      combinedCredits.sort((a, b) => {
        const scoreA = a.popularity * 2 + Math.min(2000, a.vote_count) * 0.03;
        const scoreB = b.popularity * 2 + Math.min(2000, b.vote_count) * 0.03;
        return scoreB - scoreA;
      });
    }

    const creditMovieIds = seenCreditIds;

    const resolveMemberNamesForMovie = (movie: CatalogMovieJoined, fromCurated: boolean): string[] => {
      if (star.kind !== 'group' || groupResolved.length === 0) return [];
      const names: string[] = [];
      const normMovieTitles = [
        normalizeLookupText(movie.title),
        normalizeLookupText(movie.original_title),
      ].filter(Boolean);
      for (const g of groupResolved) {
        if (!g.resolved) continue;
        const mPid = g.resolved.profile?.tmdbId ? Number(g.resolved.profile.tmdbId) : null;
        const mCredits = Array.isArray(g.resolved.credits) ? g.resolved.credits : [];
        const mCreditIds = new Set(mCredits.map((c) => Number(c.id)));
        const hitByTmdb = Boolean(movie.tmdb_id && mCreditIds.has(Number(movie.tmdb_id)));
        const hitByCast = Boolean(
          mPid &&
            Array.isArray(movie.cast_json) &&
            movie.cast_json.some((c: any) => Number(c?.id) === mPid)
        );
        const hitByTitle =
          !hitByTmdb &&
          !hitByCast &&
          normMovieTitles.length > 0 &&
          mCredits.some((c) => {
            if (movie.release_year && c.release_year && Math.abs(c.release_year - movie.release_year) > 1) {
              return false;
            }
            const cTitles = [normalizeLookupText(c.title), normalizeLookupText(c.original_title)].filter(
              Boolean
            );
            return cTitles.some((t) => normMovieTitles.includes(t));
          });
        if (hitByTmdb || hitByCast || hitByTitle) {
          names.push(g.def.name);
        }
      }
      if (names.length === 0 && fromCurated) {
        return groupResolved.map((g) => g.def.name);
      }
      return names;
    };

    // 1. Curated list matching (guarantees compatibility with all 283 catalog entries & dubladores)
    const matchedCatalogIds = new Set<number>();
    const matchedCatalogMovies: CatalogMovieJoined[] = [];
    const watchedFilms: any[] = [];
    const pendingFilms: any[] = [];

    for (const req of curatedReqs) {
      const hit = catalogMovies.find((m) => !matchedCatalogIds.has(m.movie_id) && matchCuratedCandidate(m, req));
      if (hit) {
        matchedCatalogIds.add(hit.movie_id);
        matchedCatalogMovies.push(hit);
        const char = req.character || findCharacterForCatalogMovie(hit, combinedCredits, personIds);
        const creditMatch = hit.tmdb_id
          ? combinedCredits.find((c) => Number(c.id) === Number(hit.tmdb_id))
          : null;
        const rawBd = hit.backdrop_path || creditMatch?.backdrop_path || null;
        watchedFilms.push({
          movieId: hit.movie_id,
          title: hit.title,
          originalTitle: hit.original_title,
          releaseYear: hit.release_year,
          posterUrl: hit.poster_url,
          backdropUrl: rawBd ? `${TMDB_IMG_W500}${rawBd}` : null,
          userRating: hit.user_rating,
          imdbRating: hit.imdb_rating,
          viewId: hit.view_id,
          watchedAt: hit.watched_at,
          monthSeen: hit.month_seen,
          yearSeen: hit.year_seen,
          character: char,
          memberNames: resolveMemberNamesForMovie(hit, true),
          source: 'curated',
        });
      } else {
        const enriched = findPosterForCuratedReq(req, combinedCredits);
        pendingFilms.push({
          title: req.name,
          releaseYear: enriched.tmdbYear,
          posterUrl: enriched.posterUrl,
          character: req.character || enriched.character,
          source: 'curated',
        });
      }
    }

    // 2. Dynamic TMDB Cast/Credits matching for actors & groups (excludes dubladores)
    if (star.kind !== 'dublador') {
      for (const m of catalogMovies) {
        if (matchedCatalogIds.has(m.movie_id)) continue;
        const matchViaTmdbId = Boolean(m.tmdb_id && creditMovieIds.has(m.tmdb_id));
        const matchViaRawCast = Boolean(
          Array.isArray(m.cast_json) &&
            personIds.size > 0 &&
            m.cast_json.some((c: any) => personIds.has(Number(c?.id)))
        );

        if (matchViaTmdbId || matchViaRawCast) {
          matchedCatalogIds.add(m.movie_id);
          matchedCatalogMovies.push(m);
          const char = findCharacterForCatalogMovie(m, combinedCredits, personIds);
          const creditMatch = m.tmdb_id
            ? combinedCredits.find((c) => Number(c.id) === Number(m.tmdb_id))
            : null;
          const rawBd = m.backdrop_path || creditMatch?.backdrop_path || null;
          watchedFilms.push({
            movieId: m.movie_id,
            title: m.title,
            originalTitle: m.original_title,
            releaseYear: m.release_year,
            posterUrl: m.poster_url,
            backdropUrl: rawBd ? `${TMDB_IMG_W500}${rawBd}` : null,
            userRating: m.user_rating,
            imdbRating: m.imdb_rating,
            viewId: m.view_id,
            watchedAt: m.watched_at,
            monthSeen: m.month_seen,
            yearSeen: m.year_seen,
            character: char,
            memberNames: resolveMemberNamesForMovie(m, false),
            source: 'tmdb_cast',
          });
        }
      }
    }

    // Preenche filmes pendentes notáveis do TMDB para atores e grupos quando a curadoria estiver vazia ou curta
    if (star.kind !== 'dublador' && pendingFilms.length < 10) {
      const seenPendingNorm = new Set([
        ...pendingFilms.map((p) => normalizeLookupText(p.title)),
        ...watchedFilms.map((w) => normalizeLookupText(w.title)),
        ...watchedFilms.map((w) => normalizeLookupText(w.originalTitle)),
      ]);
      for (const minVotes of [80, 15]) {
        for (const c of combinedCredits) {
          if (pendingFilms.length >= 12) break;
          const norm = normalizeLookupText(c.title);
          if (!norm || seenPendingNorm.has(norm)) continue;
          if (!c.poster_path || c.vote_count < minVotes) continue;
          seenPendingNorm.add(norm);
          pendingFilms.push({
            title: c.title,
            releaseYear: c.release_year,
            posterUrl: `${TMDB_IMG_W342}${c.poster_path}`,
            character: c.character || null,
            source: 'tmdb_credit',
          });
        }
        if (pendingFilms.length >= 10) break;
      }
    }

    watchedFilms.sort((a, b) => {
      const rA = a.userRating ?? -1;
      const rB = b.userRating ?? -1;
      if (rB !== rA) return rB - rA;
      return (b.releaseYear || 0) - (a.releaseYear || 0);
    });

    const curatedCount = curatedReqs.length;
    const tmdbFeatureTotal = primary.profile.tmdbTotalFeatureCount || curatedCount || 20;
    const uniqueCombinedCount = seenCreditIds.size;
    // Regra geral retroativa: <=20 filmes -> teto 10 | 21-28 filmes -> teto 15 | >28 filmes -> teto 20
    const effectiveFilmPool =
      star.kind === 'dublador'
        ? curatedCount || 20
        : star.kind === 'group'
        ? Math.max(curatedCount, uniqueCombinedCount)
        : tmdbFeatureTotal;
    const ceiling =
      star.ceilingOverride === 10 || star.ceilingOverride === 15 || star.ceilingOverride === 20
        ? star.ceilingOverride
        : effectiveFilmPool <= 20
        ? 10
        : effectiveFilmPool <= 28
        ? 15
        : 20;

    const progress = resolveWalkMilestones(watchedFilms.length, ceiling);
    const albumRow = albumStateMap.get(star.id) || null;
    const pendingPackRow = pendingPackByStar.get(star.id) || null;
    const stuckTier = albumRow?.stuck_tier ? String(albumRow.stuck_tier) : null;
    const stuckRank = stuckTier ? (WALK_TIER_RANK[stuckTier] || 0) : 0;
    const currRank = WALK_TIER_RANK[progress.statusTierKey] || 0;
    const isStuck = Boolean(stuckTier);
    const hasRarityUpgradeToStick = Boolean(isStuck && currRank > stuckRank);
    const ageMeta = calculateAgeMetadata(
      primary.profile.birthday,
      primary.profile.deathday,
      Boolean(star.isPosthumous)
    );

    const ratedFilms = watchedFilms.filter((f) => typeof f.userRating === 'number');
    const avgUserRating =
      ratedFilms.length > 0
        ? Number((ratedFilms.reduce((sum, f) => sum + f.userRating, 0) / ratedFilms.length).toFixed(1))
        : null;
    const topUserFilm = ratedFilms.length > 0 ? ratedFilms[0] : watchedFilms[0] || null;
    const worstUserFilm = ratedFilms.length > 0 ? ratedFilms[ratedFilms.length - 1] : null;

    const catalogMovieById = new Map(matchedCatalogMovies.map((m) => [Number(m.movie_id), m]));
    const groupMembersSummary = groupResolved
      .filter((g) => g.resolved)
      .map((g) => {
        const memberFilms = watchedFilms.filter(
          (f) => Array.isArray(f.memberNames) && f.memberNames.includes(g.def.name)
        );
        const memberMovies = memberFilms
          .map((f) => catalogMovieById.get(Number(f.movieId)))
          .filter(Boolean) as CatalogMovieJoined[];
        return buildGroupMemberSummary(g.def, g.resolved!, memberFilms, memberMovies);
      });

    const rawFeaturedMemberName = albumRow?.featured_member_name
      ? String(albumRow.featured_member_name)
      : null;
    const matchedFeaturedMember =
      star.kind === 'group' && groupMembersSummary.length > 0
        ? groupMembersSummary.find((m) => m.name === rawFeaturedMemberName) || groupMembersSummary[0]
        : null;
    const featuredMemberName = matchedFeaturedMember?.name || null;

    const photoUrl =
      matchedFeaturedMember?.photoUrl ||
      (primary.profile.profilePath
        ? `${TMDB_IMG_W500}${primary.profile.profilePath}`
        : primary.wikiThumbnail || null);

    const customSkinUrl = albumRow?.custom_skin_url ? String(albumRow.custom_skin_url) : null;
    const customSkinLabel = albumRow?.custom_skin_label ? String(albumRow.custom_skin_label) : null;

    const skinOptions = buildSkinOptions({
      starKind: star.kind,
      photoUrl,
      customSkinUrl,
      customSkinLabel,
      primary,
      groupResolved,
      watchedFilms,
      pendingFilms,
      combinedCredits,
    });

    const selectedSkinUrl = albumRow?.selected_skin_url ? String(albumRow.selected_skin_url) : null;
    const selectedSkinLabel = albumRow?.selected_skin_label ? String(albumRow.selected_skin_label) : null;
    const activePhotoUrl = selectedSkinUrl || photoUrl;
    const isFullArt = Boolean(progress.percentage >= 90 && albumRow?.is_full_art);
    const isFavoriteGuardian = Boolean(progress.percentage >= 90 && albumRow?.is_favorite_guardian);
    const rawAura = albumRow?.immortal_aura ? String(albumRow.immortal_aura) : 'prism';
    const auraIdx = WALK_IMMORTAL_AURA_ORDER.indexOf(rawAura as WalkImmortalAuraId);
    const immortalAura = (
      auraIdx >= 0 && progress.extraStars >= auraIdx ? WALK_IMMORTAL_AURA_ORDER[auraIdx] : 'prism'
    ) as WalkImmortalAuraId;
    const rawSigMovieId = albumRow?.signature_movie_id ? Number(albumRow.signature_movie_id) : null;
    const signatureFilm =
      (rawSigMovieId && watchedFilms.find((f) => Number(f.movieId) === rawSigMovieId)) ||
      topUserFilm ||
      null;
    const signatureMovieId = signatureFilm ? Number(signatureFilm.movieId) : null;

    const unlocks = {
      quoteUnlocked: progress.percentage >= 15,
      curiosity1Unlocked: progress.percentage >= 30,
      skinsUnlocked: progress.percentage >= 45,
      curiosities23Unlocked: progress.percentage >= 60,
      timelineUnlocked: progress.percentage >= 75,
      immortalUnlocked: progress.percentage >= 90,
    };

    const decadeBreakdown = buildDecadeBreakdown(watchedFilms);
    const dominantGenre = computeDominantGenre(matchedCatalogMovies, combinedCredits);
    const rpgRank = resolveRpgRank(progress.percentage, progress.extraStars);
    const rpgClassLabel = resolveRpgClassLabel({
      kind: star.kind,
      isDeceased: ageMeta.isDeceased,
      dominantGenre,
      fallbackTitle: star.rpgTitle,
    });

    const claimedXpPct = Math.max(0, Number(albumRow?.claimed_xp_pct || 0));
    const claimedXpExtraStars = Math.max(0, Number(albumRow?.claimed_xp_extra_stars || 0));
    const claimedXp = computeWalkXpForStar(claimedXpPct, claimedXpExtraStars);
    const potentialXp = computeWalkXpForStar(progress.percentage, progress.extraStars);
    const unclaimedXp = Math.max(0, potentialXp - claimedXp);
    const rpgXp = claimedXp;

    const biography =
      (primary.profile.biography && primary.profile.biography.length >= 40
        ? primary.profile.biography
        : null) ||
      primary.wikiExtract ||
      primary.profile.biography ||
      star.quote;

    return {
      id: star.id,
      albumNumber: star.albumNumber,
      name: star.name,
      alameda: star.alameda,
      kind: star.kind,
      icon: star.icon,
      tagline: star.tagline,
      knownFor: star.knownFor,
      quote: star.quote,
      curiosities: star.curiosities,
      secretFact: star.secretFact || null,
      oscarWins: Number(star.oscarWins || 0),
      oscarNominations: Number(star.oscarNominations || 0),
      rpgTitle: star.rpgTitle || star.tagline,
      rpgRank,
      rpgClassLabel,
      dominantGenre,
      photoUrl,
      activePhotoUrl,
      featuredMemberName,
      skinOptions,
      selectedSkinUrl,
      selectedSkinLabel,
      customSkinUrl,
      customSkinLabel,
      isFullArt,
      isFavoriteGuardian,
      immortalAura,
      signatureMovieId,
      signatureFilm: signatureFilm
        ? {
            movieId: Number(signatureFilm.movieId),
            title: String(signatureFilm.title),
            releaseYear: signatureFilm.releaseYear || null,
            userRating: signatureFilm.userRating ?? null,
            character: signatureFilm.character || null,
          }
        : null,
      decadeBreakdown,
      unlocks,
      rpgXp,
      claimedXp,
      potentialXp,
      unclaimedXp,
      claimedXpPct,
      claimedXpExtraStars,
      tmdbPersonId: primary.profile.tmdbId,
      tmdbTotalFeatureCount: tmdbFeatureTotal,
      biography,
      bioSource: primary.profile.biography && primary.profile.biography.length >= 40 ? 'TMDB PT-BR' : primary.wikiExtract ? 'Wikipedia PT-BR' : 'Curadoria',
      placeOfBirth: primary.profile.placeOfBirth,
      ...ageMeta,
      groupMembers: groupMembersSummary,
      ...progress,
      isStuck,
      stuckTier,
      previousStuckTier: albumRow?.previous_stuck_tier ? String(albumRow.previous_stuck_tier) : null,
      stuckExtraStars: Number(albumRow?.stuck_extra_stars || 0),
      hasRarityUpgradeToStick,
      pendingPackId: pendingPackRow ? Number(pendingPackRow.id) : null,
      pendingPackType: pendingPackRow ? String(pendingPackRow.pack_type) : null,
      avgUserRating,
      topUserFilm: toCompactFilmRef(topUserFilm),
      worstUserFilm: toCompactFilmRef(worstUserFilm),
      topUserFilmTitle: topUserFilm?.title || null,
      watchedFilms,
      pendingFilms: pendingFilms.slice(0, 14),
    };
  });

  // Inicializa baseline silencioso para qualquer estrela recém-adicionada sem registro em walk_of_fame_album_state
  const missingStateStars = starsPayload.filter((s) => !albumStateMap.has(s.id));
  for (const s of missingStateStars) {
    await query(
      `
        INSERT INTO walk_of_fame_album_state
          (star_id, stuck_tier, stuck_extra_stars, last_notified_tier, last_notified_extra_stars)
        VALUES ($1, NULL, 0, $2, $3)
        ON CONFLICT (star_id) DO NOTHING
      `,
      [s.id, s.statusTierKey, s.extraStars]
    );
  }

  const starsById = new Map(starsPayload.map((s) => [s.id, s]));
  const pendingPacks = packsRes.rows
    .map((p: any) => {
      const star = starsById.get(String(p.star_id));
      if (!star) return null;
      const packTargetPct = Math.max(Number(p.to_pct || 0), Number(star.percentage || 0));
      const packTargetStars = Math.max(Number(p.extra_stars_unlocked || 0), Number(star.extraStars || 0));
      const packXp = Math.max(0, computeWalkXpForStar(packTargetPct, packTargetStars) - Number(star.claimedXp || 0));
      return {
        packId: Number(p.id),
        starId: String(p.star_id),
        packType: String(p.pack_type),
        fromTier: p.from_tier ? String(p.from_tier) : null,
        toTier: String(p.to_tier),
        fromPct: Number(p.from_pct || 0),
        toPct: Number(p.to_pct || 0),
        extraStarsUnlocked: Number(p.extra_stars_unlocked || 0),
        packXp,
        triggerMovieId: p.trigger_movie_id ? Number(p.trigger_movie_id) : null,
        triggerMovieTitle: p.trigger_movie_title ? String(p.trigger_movie_title) : null,
        createdAt: p.created_at,
        star,
      };
    })
    .filter(Boolean);

  const inauguratedCount = starsPayload.filter((s) => s.isInaugurated).length;
  const diamondCount = starsPayload.filter((s) => s.isDiamond).length;
  const totalWatchedAppearances = starsPayload.reduce((acc, s) => acc + s.watchedCount, 0);
  const totalWalkXp = starsPayload.reduce((acc, s) => acc + Number(s.rpgXp || 0), 0);
  const totalExtraStars = starsPayload.reduce((acc, s) => acc + Number(s.extraStars || 0), 0);
  const rpgMeta = resolveRpgLevelMeta(totalWalkXp);
  const topWatchedPodium = [...starsPayload]
    .filter((s) => s.watchedCount > 0)
    .sort(
      (a, b) =>
        b.watchedCount - a.watchedCount ||
        (b.avgUserRating ?? -1) - (a.avgUserRating ?? -1) ||
        b.percentage - a.percentage ||
        a.albumNumber - b.albumNumber
    )
    .slice(0, 3)
    .map((s, idx) => ({
      rankPosition: idx + 1,
      id: s.id,
      albumNumber: s.albumNumber,
      name: s.name,
      icon: s.icon,
      tagline: s.tagline,
      photoUrl: s.activePhotoUrl || s.photoUrl,
      watchedCount: s.watchedCount,
      ceiling: s.ceiling,
      avgUserRating: s.avgUserRating,
      percentage: s.percentage,
      extraStars: s.extraStars,
      isDeceased: s.isDeceased,
    }));
  const guardians = starsPayload
    .filter((s) => s.isFavoriteGuardian)
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      albumNumber: s.albumNumber,
      name: s.name,
      icon: s.icon,
      tagline: s.tagline,
      photoUrl: s.activePhotoUrl || s.photoUrl,
      percentage: s.percentage,
      extraStars: s.extraStars,
    }));

  return {
    alamedas: WALK_ALAMEDAS,
    milestones: WALK_MILESTONES,
    summary: {
      totalStars: starsPayload.length,
      inauguratedCount,
      diamondCount,
      stuckCount: starsPayload.filter((s) => s.isStuck).length,
      pendingPackCount: pendingPacks.length,
      totalWatchedAppearances,
      totalExtraStars,
      ...rpgMeta,
      topWatchedPodium,
      guardians,
    },
    pendingPacks,
    stars: starsPayload,
  };
}

export async function getWalkOfFamePendingPacksSummary() {
  const data = await buildWalkOfFamePayload({ forceRefresh: false });
  return {
    pendingPackCount: data.pendingPacks.length,
    pendingPacks: data.pendingPacks,
  };
}

export async function checkWalkOfFameMovieTrigger(options: {
  movieId?: number | null;
  movieTitle?: string | null;
}) {
  const { movieId = null, movieTitle = null } = options;
  const payload = await buildWalkOfFamePayload({ forceRefresh: false });
  const stateRes = await query(
    `SELECT star_id, stuck_tier, stuck_extra_stars, last_notified_tier, last_notified_extra_stars, claimed_xp_pct FROM walk_of_fame_album_state`
  );
  const stateById = new Map<string, any>();
  for (const r of stateRes.rows) stateById.set(String(r.star_id), r);

  const newlyCreatedPackIds: number[] = [];

  for (const star of payload.stars) {
    if (movieId) {
      const matchedThisMovie = star.watchedFilms.some((f: any) => Number(f.movieId) === Number(movieId));
      if (!matchedThisMovie) continue;
    }

    const row = stateById.get(star.id);
    const prevTier = row?.last_notified_tier ? String(row.last_notified_tier) : 'cement';
    const prevRank = WALK_TIER_RANK[prevTier] || 0;
    const currRank = WALK_TIER_RANK[star.statusTierKey] || 0;
    const prevExtra = Number(row?.last_notified_extra_stars || 0);

    let packType: string | null = null;
    if (currRank >= 1 && currRank > prevRank) {
      packType = prevRank === 0 ? 'new_sticker' : 'rarity_up';
    } else if (star.extraStars > prevExtra) {
      packType = 'extra_star';
    }

    if (packType) {
      const ins = await query(
        `
          INSERT INTO walk_of_fame_packs
            (star_id, pack_type, from_tier, to_tier, from_pct, to_pct, extra_stars_unlocked, trigger_movie_id, trigger_movie_title, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
          RETURNING id
        `,
        [
          star.id,
          packType,
          prevTier,
          star.statusTierKey,
          Number(row?.claimed_xp_pct || 0),
          star.percentage,
          star.extraStars,
          movieId,
          movieTitle,
        ]
      );
      if (ins.rows[0]?.id) newlyCreatedPackIds.push(Number(ins.rows[0].id));
    }

    await query(
      `
        INSERT INTO walk_of_fame_album_state
          (star_id, stuck_tier, stuck_extra_stars, last_notified_tier, last_notified_extra_stars, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (star_id) DO UPDATE SET
          last_notified_tier = EXCLUDED.last_notified_tier,
          last_notified_extra_stars = EXCLUDED.last_notified_extra_stars,
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        star.id,
        row?.stuck_tier || null,
        Number(row?.stuck_extra_stars || 0),
        star.statusTierKey,
        star.extraStars,
      ]
    );
  }

  const refreshed = await buildWalkOfFamePayload({ forceRefresh: false });
  const createdPacks = refreshed.pendingPacks.filter((p: any) => newlyCreatedPackIds.includes(p.packId));

  return {
    createdPacks,
    pendingPackCount: refreshed.pendingPacks.length,
    pendingPacks: refreshed.pendingPacks,
  };
}

export async function stickWalkOfFameStar(starId: string) {
  const payload = await buildWalkOfFamePayload({ forceRefresh: false });
  const star = payload.stars.find((s) => s.id === starId);
  if (!star) throw new Error('Estrela não encontrada.');
  if (!star.isStickerUnlocked) {
    throw new Error('Alcance pelo menos 15% para liberar e colar esta figurinha.');
  }

  const currRank = WALK_TIER_RANK[star.statusTierKey] || 0;
  const stuckRank = star.stuckTier ? (WALK_TIER_RANK[star.stuckTier] || 0) : 0;
  const nextPreviousTier =
    star.stuckTier && currRank > stuckRank ? star.stuckTier : star.previousStuckTier || null;

  await query(
    `
      INSERT INTO walk_of_fame_album_state
        (star_id, stuck_tier, previous_stuck_tier, stuck_extra_stars, last_notified_tier, last_notified_extra_stars, claimed_xp_pct, claimed_xp_extra_stars, stuck_at, updated_at)
      VALUES ($1, $2, $3, $4, $2, $4, $5, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (star_id) DO UPDATE SET
        stuck_tier = EXCLUDED.stuck_tier,
        previous_stuck_tier = EXCLUDED.previous_stuck_tier,
        stuck_extra_stars = EXCLUDED.stuck_extra_stars,
        last_notified_tier = EXCLUDED.last_notified_tier,
        last_notified_extra_stars = EXCLUDED.last_notified_extra_stars,
        claimed_xp_pct = GREATEST(COALESCE(walk_of_fame_album_state.claimed_xp_pct, 0), EXCLUDED.claimed_xp_pct),
        claimed_xp_extra_stars = GREATEST(COALESCE(walk_of_fame_album_state.claimed_xp_extra_stars, 0), EXCLUDED.claimed_xp_extra_stars),
        stuck_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `,
    [star.id, star.statusTierKey, nextPreviousTier, star.extraStars, star.percentage]
  );

  await query(
    `
      UPDATE walk_of_fame_packs
      SET status = 'stuck', opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP)
      WHERE star_id = $1 AND status IN ('pending', 'opened')
    `,
    [star.id]
  );

  return buildWalkOfFamePayload({ forceRefresh: false });
}

export async function unstickWalkOfFameStar(starId: string) {
  await ensureWalkOfFameTables();
  await query(
    `
      UPDATE walk_of_fame_album_state
      SET stuck_tier = NULL, previous_stuck_tier = NULL, stuck_extra_stars = 0, stuck_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE star_id = $1
    `,
    [starId]
  );
  return buildWalkOfFamePayload({ forceRefresh: false });
}

export async function openWalkOfFamePack(packId: number, stickImmediately = true) {
  await ensureWalkOfFameTables();
  const res = await query(`SELECT id, star_id, to_pct, extra_stars_unlocked FROM walk_of_fame_packs WHERE id = $1`, [packId]);
  const row = res.rows[0];
  if (!row) throw new Error('Pacotinho não encontrado.');

  if (stickImmediately) {
    return stickWalkOfFameStar(String(row.star_id));
  }

  const payloadBefore = await buildWalkOfFamePayload({ forceRefresh: false });
  const star = payloadBefore.stars.find((s) => s.id === String(row.star_id));
  const claimPct = Math.max(Number(row.to_pct || 0), Number(star?.percentage || 0));
  const claimExtra = Math.max(Number(row.extra_stars_unlocked || 0), Number(star?.extraStars || 0));

  await query(
    `
      INSERT INTO walk_of_fame_album_state
        (star_id, last_notified_tier, last_notified_extra_stars, claimed_xp_pct, claimed_xp_extra_stars, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (star_id) DO UPDATE SET
        claimed_xp_pct = GREATEST(COALESCE(walk_of_fame_album_state.claimed_xp_pct, 0), EXCLUDED.claimed_xp_pct),
        claimed_xp_extra_stars = GREATEST(COALESCE(walk_of_fame_album_state.claimed_xp_extra_stars, 0), EXCLUDED.claimed_xp_extra_stars),
        updated_at = CURRENT_TIMESTAMP
    `,
    [String(row.star_id), star?.statusTierKey || 'bronze', claimExtra, claimPct, claimExtra]
  );

  await query(
    `UPDATE walk_of_fame_packs SET status = 'opened', opened_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [packId]
  );
  return buildWalkOfFamePayload({ forceRefresh: false });
}

export async function updateWalkOfFamePreferences(
  starId: string,
  prefs: {
    selectedSkinUrl?: string | null;
    selectedSkinLabel?: string | null;
    customSkinUrl?: string | null;
    customSkinLabel?: string | null;
    featuredMemberName?: string | null;
    isFullArt?: boolean;
    isFavoriteGuardian?: boolean;
    immortalAura?: WalkImmortalAuraId;
    signatureMovieId?: number | null;
  }
) {
  const payload = await buildWalkOfFamePayload({ forceRefresh: false });
  const star = payload.stars.find((s) => s.id === starId);
  if (!star) throw new Error('Estrela não encontrada.');

  if (prefs.selectedSkinUrl !== undefined && prefs.selectedSkinUrl !== null && !star.unlocks.skinsUnlocked) {
    throw new Error('Alcance 45% (Queridinho dos Holofotes) para equipar skins alternativas.');
  }
  if (prefs.customSkinUrl !== undefined && prefs.customSkinUrl !== null && !star.unlocks.skinsUnlocked) {
    throw new Error('Alcance 45% (Queridinho dos Holofotes) para personalizar sua foto da estrela.');
  }
  if (prefs.featuredMemberName !== undefined) {
    if (star.kind !== 'group') {
      throw new Error('Escolha de protagonista disponível apenas para estrelas de grupo/elenco.');
    }
    if (!star.isStickerUnlocked) {
      throw new Error('Alcance 15% para escolher o protagonista na carta deste conjunto.');
    }
    if (
      prefs.featuredMemberName !== null &&
      !(star.groupMembers || []).some((m: any) => m.name === prefs.featuredMemberName)
    ) {
      throw new Error('Integrante selecionado não encontrado nesta estrela.');
    }
  }
  if (prefs.immortalAura !== undefined) {
    if (!star.unlocks.immortalUnlocked) {
      throw new Error('Alcance 90% (Imortal da Sétima Arte) para personalizar a Aura da Edição Assinada.');
    }
    const reqStars = WALK_IMMORTAL_AURA_ORDER.indexOf(prefs.immortalAura);
    if (reqStars < 0) {
      throw new Error('Aura selecionada inválida.');
    }
    if ((star.extraStars || 0) < reqStars) {
      throw new Error(
        `Esta cor de Aura exige ${reqStars}★ extra(s) (alcance +${reqStars * WALK_FILMS_PER_EXTRA_STAR} filmes após o teto).`
      );
    }
  }
  if (prefs.signatureMovieId !== undefined && prefs.signatureMovieId !== null && !star.unlocks.immortalUnlocked) {
    throw new Error('Alcance 90% (Imortal da Sétima Arte) para fixar o Selo de Obra-Prima Favorita na carta.');
  }
  if (prefs.isFullArt === true && !star.unlocks.immortalUnlocked) {
    throw new Error('Alcance 90% (Imortal da Sétima Arte) para ativar o Modo Full-Art.');
  }
  if (prefs.isFavoriteGuardian === true) {
    if (!star.unlocks.immortalUnlocked) {
      throw new Error('Alcance 90% para equipar esta estrela como Guardiã Imortal.');
    }
    const existingGuardians = payload.stars.filter((s) => s.isFavoriteGuardian && s.id !== starId);
    if (existingGuardians.length >= 3) {
      throw new Error('Você já equipou o máximo de 3 Guardiões Imortais! Remova um antes de equipar outro.');
    }
  }

  const nextFeaturedMemberName =
    prefs.featuredMemberName !== undefined
      ? prefs.featuredMemberName
      : star.featuredMemberName || null;

  const switchingProtagonistOnly =
    prefs.featuredMemberName !== undefined &&
    prefs.selectedSkinUrl === undefined &&
    prefs.customSkinUrl === undefined;

  const nextCustomSkinUrl =
    prefs.customSkinUrl !== undefined ? prefs.customSkinUrl : star.customSkinUrl || null;
  const nextCustomSkinLabel =
    prefs.customSkinLabel !== undefined
      ? prefs.customSkinLabel
      : prefs.customSkinUrl === null
      ? null
      : star.customSkinLabel || null;

  const nextSkinUrl = switchingProtagonistOnly
    ? null
    : prefs.selectedSkinUrl !== undefined
    ? prefs.selectedSkinUrl
    : star.selectedSkinUrl || null;
  const nextSkinLabel = switchingProtagonistOnly
    ? null
    : prefs.selectedSkinLabel !== undefined
    ? prefs.selectedSkinLabel
    : prefs.selectedSkinUrl === null
    ? null
    : star.selectedSkinLabel || null;
  const nextFullArt = prefs.isFullArt !== undefined ? Boolean(prefs.isFullArt) : Boolean(star.isFullArt);
  const nextGuardian =
    prefs.isFavoriteGuardian !== undefined ? Boolean(prefs.isFavoriteGuardian) : Boolean(star.isFavoriteGuardian);
  const nextAura: WalkImmortalAuraId =
    prefs.immortalAura && WALK_IMMORTAL_AURA_ORDER.includes(prefs.immortalAura)
      ? prefs.immortalAura
      : (star.immortalAura as WalkImmortalAuraId) || 'prism';
  const nextSigMovieId =
    prefs.signatureMovieId !== undefined
      ? prefs.signatureMovieId
      : star.signatureMovieId ?? null;

  await query(
    `
      INSERT INTO walk_of_fame_album_state
        (star_id, last_notified_tier, last_notified_extra_stars, selected_skin_url, selected_skin_label, custom_skin_url, custom_skin_label, featured_member_name, is_full_art, is_favorite_guardian, immortal_aura, signature_movie_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      ON CONFLICT (star_id) DO UPDATE SET
        selected_skin_url = EXCLUDED.selected_skin_url,
        selected_skin_label = EXCLUDED.selected_skin_label,
        custom_skin_url = EXCLUDED.custom_skin_url,
        custom_skin_label = EXCLUDED.custom_skin_label,
        featured_member_name = EXCLUDED.featured_member_name,
        is_full_art = EXCLUDED.is_full_art,
        is_favorite_guardian = EXCLUDED.is_favorite_guardian,
        immortal_aura = EXCLUDED.immortal_aura,
        signature_movie_id = EXCLUDED.signature_movie_id,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      star.id,
      star.statusTierKey,
      star.extraStars,
      nextSkinUrl,
      nextSkinLabel,
      nextCustomSkinUrl,
      nextCustomSkinLabel,
      nextFeaturedMemberName,
      nextFullArt,
      nextGuardian,
      nextAura,
      nextSigMovieId,
    ]
  );

  return buildWalkOfFamePayload({ forceRefresh: false });
}

export async function saveWalkOfFameCustomSkin(
  starId: string,
  skinUrl: string,
  skinLabel = 'Foto Personalizada'
) {
  const trimmedUrl = String(skinUrl || '').trim();
  if (!trimmedUrl) {
    throw new Error('Informe um link válido ou selecione uma imagem do computador.');
  }
  const cleanLabel = String(skinLabel || 'Foto Personalizada').trim().slice(0, 120) || 'Foto Personalizada';
  return updateWalkOfFamePreferences(starId, {
    customSkinUrl: trimmedUrl,
    customSkinLabel: cleanLabel,
    selectedSkinUrl: trimmedUrl,
    selectedSkinLabel: cleanLabel,
  });
}
