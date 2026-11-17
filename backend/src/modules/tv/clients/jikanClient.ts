import axios, { AxiosError } from 'axios';
import {
  TvDetailsBundle,
  TvRelatedSeasonOption,
  TvSearchResultItem,
  TvSeasonInput,
  TvSeasonType,
} from '../types';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';
const MIN_INTERVAL_MS = 420; // <= 2.38 req/s (abaixo do limite de 3 req/s e 60 req/min do Jikan)
const CACHE_TTL_MS = 15 * 60 * 1000;
const JIKAN_TIMEOUT_MS = 3500;
const JIKAN_CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000;

export class JikanMovieGuardError extends Error {
  public readonly code = 'MOVIE_NOT_ALLOWED_IN_TV_MODULE';
  constructor(title: string) {
    super(
      `"${title}" é um longa-metragem de anime (Movie). Conforme a regra do catálogo, filmes de anime devem ser cadastrados no modo 🎬 Filmes.`
    );
    this.name = 'JikanMovieGuardError';
  }
}

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const memoryCache = new Map<string, CacheEntry<any>>();
let lastRequestTimestamp = 0;
let queueChain: Promise<void> = Promise.resolve();
let jikanDownUntil = 0;

export function isJikanCircuitOpen(): boolean {
  return Date.now() < jikanDownUntil;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Garante fila sequencial com espaçamento mínimo entre requisições ao Jikan
 * e retry com backoff em caso de HTTP 429 ou 5xx temporário.
 * Abre o circuit-breaker quando há erro de rede/timeout para ativar fallback rápido (AniList).
 */
export function enqueueJikanRequest<T>(path: string, params?: Record<string, any>): Promise<T> {
  const cacheKey = `jikan::${path}::${JSON.stringify(params || {})}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data as T);
  }

  if (isJikanCircuitOpen()) {
    return Promise.reject(new Error('Jikan circuit breaker ativo; usando fallback AniList.'));
  }

  const task = queueChain.then(async () => {
    if (isJikanCircuitOpen()) {
      throw new Error('Jikan circuit breaker ativo; usando fallback AniList.');
    }

    const backoffDelays = [1200, 2500];
    let lastError: any;

    for (let attempt = 0; attempt <= backoffDelays.length; attempt++) {
      const waitMs = Math.max(0, lastRequestTimestamp + MIN_INTERVAL_MS - Date.now());
      if (waitMs > 0) {
        await sleep(waitMs);
      }
      lastRequestTimestamp = Date.now();

      try {
        const response = await axios.get<T>(`${JIKAN_BASE_URL}${path}`, {
          params,
          timeout: JIKAN_TIMEOUT_MS,
          headers: { Accept: 'application/json' },
        });
        memoryCache.set(cacheKey, {
          expiresAt: Date.now() + CACHE_TTL_MS,
          data: response.data,
        });
        return response.data;
      } catch (err) {
        lastError = err;
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        if (status === 429 && attempt < backoffDelays.length) {
          await sleep(backoffDelays[attempt]);
          continue;
        }
        // Timeout ou erro de conexão/5xx: abre circuit breaker e cai para AniList
        if (!status || status >= 500) {
          jikanDownUntil = Date.now() + JIKAN_CIRCUIT_COOLDOWN_MS;
          console.warn(
            `[JikanClient] Jikan indisponível (${axiosErr.message}). Circuit breaker aberto por 5 min; usando AniList GraphQL.`
          );
        }
        throw err;
      }
    }

    throw lastError;
  });

  // Mantém a cadeia viva mesmo em caso de erro
  queueChain = task.then(
    () => undefined,
    () => undefined
  );

  return task;
}

async function queryAniList<T>(queryStr: string, variables: Record<string, any>): Promise<T> {
  const cacheKey = `anilist::${queryStr}::${JSON.stringify(variables)}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const res = await axios.post<{ data?: T; errors?: Array<{ message: string }> }>(
    ANILIST_GRAPHQL_URL,
    { query: queryStr, variables },
    {
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  if (res.data?.errors?.length && !res.data?.data) {
    throw new Error(res.data.errors[0].message);
  }

  memoryCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: res.data.data,
  });
  return res.data.data as T;
}

const JIKAN_GENRE_PT: Record<string, string> = {
  Action: 'Ação',
  Adventure: 'Aventura',
  'Avant Garde': 'Vanguarda',
  'Award Winning': 'Premiado',
  'Boys Love': 'Boys Love',
  Comedy: 'Comédia',
  Drama: 'Drama',
  Fantasy: 'Fantasia',
  'Girls Love': 'Girls Love',
  Gourmet: 'Gastronomia',
  Horror: 'Terror',
  MahouShoujo: 'Mahou Shoujo',
  'Mahou Shoujo': 'Mahou Shoujo',
  Mecha: 'Mecha',
  Music: 'Música',
  Mystery: 'Mistério',
  Psychological: 'Psicológico',
  Romance: 'Romance',
  'Sci-Fi': 'Ficção Científica',
  'Slice of Life': 'Slice of Life',
  Sports: 'Esportes',
  Supernatural: 'Sobrenatural',
  Suspense: 'Suspense',
  Thriller: 'Suspense',
};

function translateJikanLabel(name: string): string {
  const clean = String(name || '').trim();
  return JIKAN_GENRE_PT[clean] || clean;
}

export function parseJikanDurationMinutes(durationStr?: string | null): number | null {
  if (!durationStr) return null;
  const text = String(durationStr).toLowerCase();
  let totalMin = 0;
  const hrMatch = text.match(/(\d+)\s*hr/);
  const minMatch = text.match(/(\d+)\s*min/);
  if (hrMatch) totalMin += parseInt(hrMatch[1], 10) * 60;
  if (minMatch) totalMin += parseInt(minMatch[1], 10);
  if (totalMin > 0) return totalMin;
  return null;
}

export function mapJikanSeasonType(rawType?: string | null): TvSeasonType {
  const normalized = String(rawType || '').trim().toLowerCase();
  if (normalized === 'ova') return 'ova';
  if (normalized === 'ona') return 'ona';
  if (normalized === 'special' || normalized === 'tv_short' || normalized === 'tv special') {
    return 'special';
  }
  return 'tv';
}

export function cleanJikanThemeSong(raw: string): string {
  let s = String(raw || '').trim();
  s = s.replace(/^(?:S?\d+\s*:\s*)/i, '');
  s = s.replace(/\s*\((?:eps?|broadcast|re-?broadcast)[^)]*\)\s*$/i, '').trim();
  const byMatch = s.match(/^"([^"]+)"\s+by\s+(.+)$/i);
  if (byMatch) {
    return `${byMatch[1].trim()} — ${byMatch[2].trim()}`;
  }
  return s.replace(/^"|"$/g, '').trim();
}

function mapJikanAiringStatus(status?: string | null): string | null {
  const raw = String(status || '').trim();
  if (!raw) return null;
  if (/currently airing|releasing/i.test(raw)) return 'Em exibição';
  if (/finished airing|finished/i.test(raw)) return 'Finalizada';
  if (/not yet aired|not_yet_released/i.test(raw)) return 'Ainda não exibida';
  if (/cancelled/i.test(raw)) return 'Cancelada';
  if (/hiatus/i.test(raw)) return 'Em hiato';
  return raw;
}

function extractYearFromJikanAnime(item: any): number | null {
  if (typeof item?.year === 'number' && item.year > 1900) return item.year;
  const fromStr = item?.aired?.from;
  if (fromStr) {
    const parsed = parseInt(String(fromStr).slice(0, 4), 10);
    if (!Number.isNaN(parsed) && parsed > 1900) return parsed;
  }
  return null;
}

function extractEndYearFromJikanAnime(item: any): number | null {
  const toStr = item?.aired?.to;
  if (toStr) {
    const parsed = parseInt(String(toStr).slice(0, 4), 10);
    if (!Number.isNaN(parsed) && parsed > 1900) return parsed;
  }
  return null;
}

async function tryResolveTmdbPtBrTitle(
  candidates: Array<string | null | undefined>,
  year?: number | null
): Promise<string | null> {
  const token = process.env.TMDB_BEARER_TOKEN;
  if (!token) return null;

  const uniqueCandidates = candidates
    .map((c) => (c ? String(c).trim() : ''))
    .filter((c, i, arr) => c.length > 0 && arr.indexOf(c) === i);

  for (const queryText of uniqueCandidates) {
    try {
      const res = await axios.get('https://api.themoviedb.org/3/search/tv', {
        timeout: 2500,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        params: {
          query: queryText,
          language: 'pt-BR',
        },
      });
      const results: any[] = res.data?.results || [];
      if (results.length === 0) continue;

      const animeMatch = results.find((r) => {
        const countries: string[] = Array.isArray(r.origin_country) ? r.origin_country : [];
        const genres: number[] = Array.isArray(r.genre_ids) ? r.genre_ids : [];
        const isAnimeCountryOrGenre = countries.includes('JP') || genres.includes(16);
        if (!isAnimeCountryOrGenre) return false;
        if (!year || !r.first_air_date) return true;
        const tmdbYear = parseInt(String(r.first_air_date).slice(0, 4), 10);
        return !Number.isNaN(tmdbYear) && Math.abs(tmdbYear - year) <= 2;
      });

      if (animeMatch?.name) {
        return String(animeMatch.name).trim();
      }
    } catch {
      // Silencioso: título em PT-BR via TMDB é apenas melhoria opcional
    }
  }
  return null;
}

function extractRelatedSeasonOptions(fullData: any): TvRelatedSeasonOption[] {
  const relations: any[] = Array.isArray(fullData?.relations) ? fullData.relations : [];
  const allowedRelations = new Set([
    'Sequel',
    'Prequel',
    'Side story',
    'Parent story',
    'Alternative version',
    'Spin-off',
  ]);
  const options: TvRelatedSeasonOption[] = [];
  const seenIds = new Set<number>([Number(fullData?.mal_id)]);

  for (const rel of relations) {
    const relationName = String(rel?.relation || '').trim();
    if (!allowedRelations.has(relationName)) continue;
    const entries: any[] = Array.isArray(rel?.entry) ? rel.entry : [];
    for (const entry of entries) {
      if (String(entry?.type || '').toLowerCase() !== 'anime') continue;
      const entryId = Number(entry?.mal_id);
      if (!entryId || seenIds.has(entryId)) continue;
      seenIds.add(entryId);
      const title = String(entry?.name || '').trim();
      options.push({
        mal_id: entryId,
        title,
        relation: relationName,
        type: 'anime',
        isMovie: /\b(movie|film)\b/i.test(title),
      });
    }
  }

  return options;
}

// ============================================================================
// FALLBACK ANILIST GRAPHQL (usado automaticamente se Jikan estiver offline)
// ============================================================================

const ANILIST_SEARCH_QUERY = `
query ($search: String, $year: Int) {
  Page(perPage: 15) {
    media(search: $search, type: ANIME, isAdult: false, seasonYear: $year) {
      id
      idMal
      format
      status
      episodes
      seasonYear
      startDate { year }
      meanScore
      averageScore
      description(asHtml: false)
      title { romaji english native }
      coverImage { extraLarge large }
    }
  }
}
`;

const ANILIST_DETAILS_FIELDS = `
  id
  idMal
  format
  status
  episodes
  duration
  seasonYear
  startDate { year }
  endDate { year }
  meanScore
  averageScore
  description(asHtml: false)
  title { romaji english native }
  coverImage { extraLarge large }
  genres
  tags { name category }
  studios(isMain: true) { nodes { id name } }
  staff(sort: [RELEVANCE, ID], perPage: 25) {
    edges {
      role
      node { name { full } }
    }
  }
  relations {
    edges {
      relationType
      node {
        id
        idMal
        type
        format
        title { romaji english }
      }
    }
  }
`;

const ANILIST_BY_MAL_ID_QUERY = `query ($id: Int) { Media(idMal: $id, type: ANIME) { ${ANILIST_DETAILS_FIELDS} } }`;
const ANILIST_BY_AL_ID_QUERY = `query ($id: Int) { Media(id: $id, type: ANIME) { ${ANILIST_DETAILS_FIELDS} } }`;

const ANILIST_RELATION_LABEL: Record<string, string> = {
  SEQUEL: 'Sequel',
  PREQUEL: 'Prequel',
  SIDE_STORY: 'Side story',
  PARENT: 'Parent story',
  ALTERNATIVE: 'Alternative version',
  SPIN_OFF: 'Spin-off',
};

function mapAniListFormatLabel(format?: string | null): string {
  const f = String(format || 'TV').toUpperCase();
  if (f === 'MOVIE') return 'Movie';
  if (f === 'TV_SHORT') return 'TV Special';
  return f;
}

function buildSeasonFromAniList(media: any, seasonNumber: number): TvSeasonInput {
  const scoreRaw = typeof media?.meanScore === 'number' ? media.meanScore : media?.averageScore;
  const externalScore = typeof scoreRaw === 'number' && scoreRaw > 0 ? Number((scoreRaw / 10).toFixed(2)) : null;
  const year = media?.seasonYear || media?.startDate?.year || null;

  return {
    season_number: seasonNumber,
    label: String(media?.title?.english || media?.title?.romaji || `Temporada ${seasonNumber}`).trim(),
    season_type: mapJikanSeasonType(media?.format),
    mal_id: Number(media?.idMal || media?.id),
    tmdb_season_number: null,
    episodes_total: typeof media?.episodes === 'number' ? media.episodes : null,
    episodes_watched: 0,
    episode_duration_min: typeof media?.duration === 'number' ? media.duration : 24,
    year,
    external_score: externalScore,
    poster_url: media?.coverImage?.extraLarge || media?.coverImage?.large || null,
    themes: { openings: [], endings: [] },
    month_seen: null,
    year_seen: null,
  };
}

function extractAniListRelatedOptions(media: any): TvRelatedSeasonOption[] {
  const edges: any[] = Array.isArray(media?.relations?.edges) ? media.relations.edges : [];
  const options: TvRelatedSeasonOption[] = [];
  const seenIds = new Set<number>([Number(media?.idMal || media?.id)]);

  for (const edge of edges) {
    const relType = String(edge?.relationType || '').toUpperCase();
    const mappedRel = ANILIST_RELATION_LABEL[relType];
    if (!mappedRel) continue;
    const node = edge?.node;
    if (!node || String(node?.type || '').toUpperCase() !== 'ANIME') continue;
    const targetId = Number(node.idMal || node.id);
    if (!targetId || seenIds.has(targetId)) continue;
    seenIds.add(targetId);

    const title = String(node?.title?.english || node?.title?.romaji || `Anime #${targetId}`).trim();
    options.push({
      mal_id: targetId,
      title,
      relation: mappedRel,
      type: 'anime',
      isMovie: String(node?.format || '').toUpperCase() === 'MOVIE',
    });
  }

  return options;
}

async function searchAnimeOnAniList(queryStr: string, year?: number): Promise<TvSearchResultItem[]> {
  const vars: Record<string, any> = { search: queryStr };
  if (year && Number.isFinite(year) && year > 1950) {
    vars.year = year;
  }

  let data = await queryAniList<{ Page?: { media?: any[] } }>(ANILIST_SEARCH_QUERY, vars);
  let list = Array.isArray(data?.Page?.media) ? data.Page.media : [];
  if (list.length === 0 && vars.year) {
    data = await queryAniList<{ Page?: { media?: any[] } }>(ANILIST_SEARCH_QUERY, { search: queryStr });
    list = Array.isArray(data?.Page?.media) ? data.Page.media : [];
  }

  return list.map((item) => {
    const formatUpper = String(item?.format || 'TV').toUpperCase();
    const isMovie = formatUpper === 'MOVIE';
    const titlePrimary =
      String(item?.title?.english || item?.title?.romaji || '').trim() || 'Sem título';
    const titleOrig = String(item?.title?.romaji || item?.title?.native || '').trim() || null;
    const scoreRaw = typeof item?.meanScore === 'number' ? item.meanScore : item?.averageScore;

    return {
      source: 'jikan',
      id: Number(item.idMal || item.id),
      title: titlePrimary,
      original_title: titleOrig !== titlePrimary ? titleOrig : item?.title?.native || null,
      year: item?.seasonYear || item?.startDate?.year || null,
      poster_url: item?.coverImage?.extraLarge || item?.coverImage?.large || null,
      mediaTypeLabel: mapAniListFormatLabel(item?.format),
      isMovie,
      suggestedKind: 'anime',
      episodes: typeof item?.episodes === 'number' ? item.episodes : null,
      external_score:
        typeof scoreRaw === 'number' && scoreRaw > 0 ? Number((scoreRaw / 10).toFixed(2)) : null,
      origin_country: 'JP',
      synopsis: item?.description ? String(item.description) : null,
    };
  });
}

async function fetchAniListMedia(targetId: number): Promise<any> {
  try {
    const byMal = await queryAniList<{ Media?: any }>(ANILIST_BY_MAL_ID_QUERY, { id: targetId });
    if (byMal?.Media) return byMal.Media;
  } catch {
    // Tenta buscar por AniList ID caso idMal não exista
  }

  const byAl = await queryAniList<{ Media?: any }>(ANILIST_BY_AL_ID_QUERY, { id: targetId });
  if (byAl?.Media) return byAl.Media;

  throw new Error(`Anime ID ${targetId} não encontrado no MyAnimeList nem no AniList.`);
}

async function fetchAnimeBundleViaAniList(targetId: number): Promise<TvDetailsBundle> {
  const media = await fetchAniListMedia(targetId);
  if (String(media?.format || '').toUpperCase() === 'MOVIE') {
    throw new JikanMovieGuardError(
      String(media?.title?.english || media?.title?.romaji || `ID #${targetId}`)
    );
  }

  const creators: string[] = [];
  const directors: string[] = [];
  const staffEdges: any[] = Array.isArray(media?.staff?.edges) ? media.staff.edges : [];
  for (const edge of staffEdges) {
    const role = String(edge?.role || '').trim();
    const name = String(edge?.node?.name?.full || '').trim();
    if (!name) continue;
    if (/^(original creator|original story|original work|story & art|story)$/i.test(role) && !creators.includes(name)) {
      creators.push(name);
    }
    if (/^(director|chief director|series director)$/i.test(role) && !directors.includes(name)) {
      directors.push(name);
    }
  }

  const startYear = media?.seasonYear || media?.startDate?.year || null;
  const endYear = media?.endDate?.year || null;
  const ptTitle = await tryResolveTmdbPtBrTitle(
    [media?.title?.english, media?.title?.romaji],
    startYear
  );

  const displayTitle =
    ptTitle ||
    String(media?.title?.english || media?.title?.romaji || '').trim() ||
    `Anime #${targetId}`;
  const originalTitle = String(media?.title?.romaji || media?.title?.native || '').trim() || null;

  const studios: Array<{ name: string; mal_id?: number | null }> = Array.isArray(media?.studios?.nodes)
    ? media.studios.nodes
        .map((s: any) => ({ name: String(s?.name || '').trim(), mal_id: null }))
        .filter((s: { name: string }) => s.name.length > 0)
    : [];

  const genres: string[] = Array.isArray(media?.genres)
    ? media.genres.map((g: any) => translateJikanLabel(String(g))).filter(Boolean)
    : [];

  const tags: any[] = Array.isArray(media?.tags) ? media.tags : [];
  const demographics = tags
    .filter((t) => String(t?.category || '').toLowerCase() === 'demographic')
    .map((t) => String(t?.name || '').trim())
    .filter(Boolean);
  const themes = tags
    .filter((t) => String(t?.category || '').toLowerCase() !== 'demographic')
    .slice(0, 8)
    .map((t) => String(t?.name || '').trim())
    .filter(Boolean);

  const mainPoster = media?.coverImage?.extraLarge || media?.coverImage?.large || null;
  const scoreRaw = typeof media?.meanScore === 'number' ? media.meanScore : media?.averageScore;
  const firstSeason = buildSeasonFromAniList(media, 1);

  return {
    source: 'jikan',
    suggestedKind: 'anime',
    mal_id: Number(media.idMal || media.id),
    tmdb_tv_id: null,
    imdb_id: null,
    title: displayTitle,
    original_title: originalTitle,
    poster_url: mainPoster,
    available_posters: mainPoster
      ? [{ file_path: mainPoster, url: mainPoster, thumb_url: mainPoster, iso_639_1: null }]
      : [],
    synopsis: media?.description ? String(media.description) : null,
    start_year: startYear,
    end_year: endYear,
    airing_status: mapJikanAiringStatus(media?.status),
    origin_country: 'JP',
    external_score:
      typeof scoreRaw === 'number' && scoreRaw > 0 ? Number((scoreRaw / 10).toFixed(2)) : null,
    studios,
    genres: Array.from(new Set(genres)),
    demographics: Array.from(new Set(demographics)),
    themes: Array.from(new Set(themes)),
    creators,
    directors,
    seasons: [firstSeason],
    relatedSeasons: extractAniListRelatedOptions(media),
    raw_api_data: { anilist: media },
  };
}

// ============================================================================
// FUNÇÕES PÚBLICAS (Jikan primário + fallback automático transparente p/ AniList)
// ============================================================================

export async function searchAnimeOnJikan(
  queryStr: string,
  year?: number
): Promise<TvSearchResultItem[]> {
  const cleanQuery = String(queryStr || '').trim();
  if (!cleanQuery) return [];

  const params: Record<string, any> = {
    q: cleanQuery,
    limit: 15,
    sfw: true,
  };
  if (year && Number.isFinite(year) && year > 1950) {
    params.start_date = `${year}-01-01`;
  }

  try {
    const res = await enqueueJikanRequest<{ data?: any[] }>('/anime', params);
    const list = Array.isArray(res?.data) ? res.data : [];

    return list.map((item) => {
      const rawType = String(item?.type || 'TV');
      const isMovie = rawType.toLowerCase() === 'movie';
      const titlePrimary = String(item?.title_english || item?.title || '').trim() || 'Sem título';
      const titleOriginal = String(item?.title || item?.title_japanese || '').trim() || null;

      return {
        source: 'jikan',
        id: Number(item.mal_id),
        title: titlePrimary,
        original_title: titleOriginal !== titlePrimary ? titleOriginal : item?.title_japanese || null,
        year: extractYearFromJikanAnime(item),
        poster_url:
          item?.images?.jpg?.large_image_url ||
          item?.images?.jpg?.image_url ||
          item?.images?.webp?.large_image_url ||
          null,
        mediaTypeLabel: rawType,
        isMovie,
        suggestedKind: 'anime',
        episodes: typeof item?.episodes === 'number' ? item.episodes : null,
        external_score: typeof item?.score === 'number' ? Number(item.score) : null,
        origin_country: 'JP',
        synopsis: item?.synopsis ? String(item.synopsis) : null,
      };
    });
  } catch (err) {
    if (err instanceof JikanMovieGuardError) throw err;
    return searchAnimeOnAniList(cleanQuery, year);
  }
}

function buildSeasonFromJikanFull(fullData: any, seasonNumber: number): TvSeasonInput {
  const openings: string[] = Array.isArray(fullData?.theme?.openings)
    ? fullData.theme.openings.map(cleanJikanThemeSong).filter(Boolean)
    : [];
  const endings: string[] = Array.isArray(fullData?.theme?.endings)
    ? fullData.theme.endings.map(cleanJikanThemeSong).filter(Boolean)
    : [];

  return {
    season_number: seasonNumber,
    label: String(fullData?.title_english || fullData?.title || `Temporada ${seasonNumber}`).trim(),
    season_type: mapJikanSeasonType(fullData?.type),
    mal_id: Number(fullData.mal_id),
    tmdb_season_number: null,
    episodes_total: typeof fullData?.episodes === 'number' ? fullData.episodes : null,
    episodes_watched: 0,
    episode_duration_min: parseJikanDurationMinutes(fullData?.duration) ?? 24,
    year: extractYearFromJikanAnime(fullData),
    external_score: typeof fullData?.score === 'number' ? Number(fullData.score) : null,
    poster_url:
      fullData?.images?.jpg?.large_image_url || fullData?.images?.jpg?.image_url || null,
    themes: {
      openings: Array.from(new Set(openings)),
      endings: Array.from(new Set(endings)),
    },
    month_seen: null,
    year_seen: null,
  };
}

export async function fetchJikanSeasonEntry(
  malId: number,
  seasonNumber = 1
): Promise<{
  season: TvSeasonInput;
  relatedSeasons: TvRelatedSeasonOption[];
  studios: Array<{ name: string; mal_id?: number | null }>;
}> {
  try {
    const fullRes = await enqueueJikanRequest<{ data?: any }>(`/anime/${malId}/full`);
    const fullData = fullRes?.data;
    if (!fullData) {
      throw new Error(`Anime MAL ID ${malId} não encontrado no Jikan.`);
    }
    if (String(fullData.type || '').toLowerCase() === 'movie') {
      throw new JikanMovieGuardError(
        String(fullData.title_english || fullData.title || `MAL #${malId}`)
      );
    }

    const studios: Array<{ name: string; mal_id?: number | null }> = Array.isArray(fullData?.studios)
      ? fullData.studios
          .map((s: any) => ({
            name: String(s?.name || '').trim(),
            mal_id: s?.mal_id ? Number(s.mal_id) : null,
          }))
          .filter((s: { name: string }) => s.name.length > 0)
      : [];

    return {
      season: buildSeasonFromJikanFull(fullData, seasonNumber),
      relatedSeasons: extractRelatedSeasonOptions(fullData),
      studios,
    };
  } catch (err) {
    if (err instanceof JikanMovieGuardError) throw err;
    const media = await fetchAniListMedia(malId);
    if (String(media?.format || '').toUpperCase() === 'MOVIE') {
      throw new JikanMovieGuardError(
        String(media?.title?.english || media?.title?.romaji || `ID #${malId}`)
      );
    }
    const studios: Array<{ name: string; mal_id?: number | null }> = Array.isArray(media?.studios?.nodes)
      ? media.studios.nodes
          .map((s: any) => ({ name: String(s?.name || '').trim(), mal_id: null }))
          .filter((s: { name: string }) => s.name.length > 0)
      : [];
    return {
      season: buildSeasonFromAniList(media, seasonNumber),
      relatedSeasons: extractAniListRelatedOptions(media),
      studios,
    };
  }
}

export async function fetchJikanAnimeBundle(malId: number): Promise<TvDetailsBundle> {
  try {
    const fullRes = await enqueueJikanRequest<{ data?: any }>(`/anime/${malId}/full`);
    const fullData = fullRes?.data;
    if (!fullData) {
      throw new Error(`Anime MAL ID ${malId} não encontrado no Jikan.`);
    }

    if (String(fullData.type || '').toLowerCase() === 'movie') {
      throw new JikanMovieGuardError(
        String(fullData.title_english || fullData.title || `MAL #${malId}`)
      );
    }

    let staffList: any[] = [];
    try {
      const staffRes = await enqueueJikanRequest<{ data?: any[] }>(`/anime/${malId}/staff`);
      staffList = Array.isArray(staffRes?.data) ? staffRes.data : [];
    } catch {
      staffList = [];
    }

    const creators: string[] = [];
    const directors: string[] = [];

    for (const entry of staffList) {
      const personName = String(entry?.person?.name || '').trim();
      if (!personName) continue;
      const positions: string[] = Array.isArray(entry?.positions)
        ? entry.positions.map((p: any) => String(p || '').trim())
        : [];

      if (
        positions.some((p) => /^(original creator|story & art|story|original story)$/i.test(p)) &&
        !creators.includes(personName)
      ) {
        creators.push(personName);
      }

      if (
        positions.some((p) => /^(director|chief director|series director)$/i.test(p)) &&
        !directors.includes(personName)
      ) {
        directors.push(personName);
      }
    }

    const startYear = extractYearFromJikanAnime(fullData);
    const endYear = extractEndYearFromJikanAnime(fullData);

    const ptTitle = await tryResolveTmdbPtBrTitle(
      [fullData.title_english, fullData.title],
      startYear
    );

    const displayTitle =
      ptTitle ||
      String(fullData.title_english || fullData.title || '').trim() ||
      `Anime #${malId}`;
    const originalTitle = String(fullData.title || fullData.title_japanese || '').trim() || null;

    const studios: Array<{ name: string; mal_id?: number | null }> = Array.isArray(fullData?.studios)
      ? fullData.studios
          .map((s: any) => ({
            name: String(s?.name || '').trim(),
            mal_id: s?.mal_id ? Number(s.mal_id) : null,
          }))
          .filter((s: { name: string }) => s.name.length > 0)
      : [];

    const genres: string[] = Array.isArray(fullData?.genres)
      ? fullData.genres.map((g: any) => translateJikanLabel(g?.name)).filter(Boolean)
      : [];

    const demographics: string[] = Array.isArray(fullData?.demographics)
      ? fullData.demographics.map((d: any) => String(d?.name || '').trim()).filter(Boolean)
      : [];

    const themes: string[] = Array.isArray(fullData?.themes)
      ? fullData.themes.map((t: any) => String(t?.name || '').trim()).filter(Boolean)
      : [];

    const mainPoster =
      fullData?.images?.jpg?.large_image_url ||
      fullData?.images?.jpg?.image_url ||
      fullData?.images?.webp?.large_image_url ||
      null;

    const firstSeason = buildSeasonFromJikanFull(fullData, 1);

    return {
      source: 'jikan',
      suggestedKind: 'anime',
      mal_id: Number(fullData.mal_id),
      tmdb_tv_id: null,
      imdb_id: null,
      title: displayTitle,
      original_title: originalTitle,
      poster_url: mainPoster,
      available_posters: mainPoster
        ? [{ file_path: mainPoster, url: mainPoster, thumb_url: mainPoster, iso_639_1: null }]
        : [],
      synopsis: fullData?.synopsis ? String(fullData.synopsis) : null,
      start_year: startYear,
      end_year: endYear,
      airing_status: mapJikanAiringStatus(fullData?.status),
      origin_country: 'JP',
      external_score: typeof fullData?.score === 'number' ? Number(fullData.score) : null,
      studios,
      genres: Array.from(new Set(genres)),
      demographics: Array.from(new Set(demographics)),
      themes: Array.from(new Set(themes)),
      creators,
      directors,
      seasons: [firstSeason],
      relatedSeasons: extractRelatedSeasonOptions(fullData),
      raw_api_data: { jikan: fullData },
    };
  } catch (err) {
    if (err instanceof JikanMovieGuardError) throw err;
    return fetchAnimeBundleViaAniList(malId);
  }
}
