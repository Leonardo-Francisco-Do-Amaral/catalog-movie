import {
  HISTORICAL_TERRITORIES,
  UN_COUNTRIES_195,
  UNCountryDefinition,
} from '../../data/unCountries195';
import type { WorldChallengePayload } from '../worldChallengeService';
import {
  normalizeAudioType,
  normalizeCanonicalPlatform,
} from './platformNormalizer';

export const ALL_21_GENRES = [
  'Animação',
  'Aventura',
  'Ação',
  'Biografia',
  'Comédia',
  'Crime',
  'Curta',
  'Documentário',
  'Drama',
  'Família',
  'Fantasia',
  'Faroeste',
  'Ficção Científica',
  'Guerra',
  'História',
  'Mistério',
  'Música',
  'Policial',
  'Romance',
  'Suspense',
  'Terror',
] as const;

export const MONTH_NAMES: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
};

export interface TrophyChecklistItem {
  id?: string;
  code?: string;
  name: string;
  flag?: string | null;
  required: number;
  current: number;
  conquered: boolean;
  movie_title?: string | null;
  movie_year?: number | null;
  poster_url?: string | null;
  extra_info?: string;
  rule_desc?: string;
}

export interface TrophyRankState {
  id: string;
  tier: 'bronze' | 'silver' | 'epic' | 'gold' | 'mythic';
  target_value: number;
  title: string;
  description: string;
  legacy_id?: string;
  is_unlocked: boolean;
  unlocked_at: string | null;
  test_override: boolean | null;
  is_new: boolean;
  progress_current: number;
  progress_target: number;
  progress_percentage: number;
}

export interface IndexedMovie {
  raw: any;
  movieId: string | number;
  title: string;
  originalTitle: string;
  releaseYear: number | null;
  monthSeen: number | null;
  yearSeen: number | null;
  runtime: number;
  posterUrl: string | null;
  oscarWins: number;
  oscarNoms: number;
  canonicalPlatform: string;
  audioLower: string;
  cleanTitles: string[];
  titleLetters: Set<string>;
  tagsSet: Set<string>;
  tagEntries: Array<{ raw: string; clean: string }>;
  genresSet: Set<string>;
  genresRaw: string[];
  all21GenresCount: number;
  primaryCountryCode195: string | null;
  rawPrimaryCountryCode: string | null;
  primaryCountryName: string | null;
  allCountryCodes: Set<string>;
  continentsSet: Set<string>;
  directors: Set<string>;
  directorsDisplay: Map<string, string>;
  writers: Set<string>;
  writersDisplay: Map<string, string>;
  producers: Set<string>;
  studios: Set<string>;
  distributors: Set<string>;
  companies: Set<string>;
  ur: number | null;
  urMillis: number | null;
  imdb: number | null;
  imdbMillis: number | null;
  mc: number | null;
  rt: number | null;
  gr: number | null;
}

export interface CatalogIndex {
  movies: IndexedMovie[];
  totalMovies: number;
  totalRuntimeMinutes: number;
  maxCatalogYear: number;
  moviesByMonth: Map<number, IndexedMovie[]>;
  moviesByRelYear: Map<number, IndexedMovie[]>;
  moviesByTag: Map<string, IndexedMovie[]>;
  moviesByGenre: Map<string, IndexedMovie[]>;
  moviesByCountryAll: Map<string, IndexedMovie[]>;
  moviesByCountryPrimary: Map<string, IndexedMovie[]>;
  moviesByContinent: Map<string, IndexedMovie[]>;
  moviesByPlatform: Map<string, IndexedMovie[]>;
  directorToMovies: Map<string, { displayName: string; movies: IndexedMovie[] }>;
  writerToMovies: Map<string, { displayName: string; movies: IndexedMovie[] }>;
  unCountryDefMap: Map<string, UNCountryDefinition>;
  unCountriesMap: Map<string, any>;
  historicalCountriesMap: Map<string, any>;
  allCountriesAndHistoricalMap: Map<string, any>;
  conqueredCountries: any[];
  conqueredCountriesCount: number;
}

export function cleanStr(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function cleanTag(str: string | null | undefined): string {
  if (!str) return '';
  let s = str.trim().replace(/^["']|["']$/g, '');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (s === 'stephen king' || s === 'sk') return 'sk';
  if (s === 'top 250' || s === 'top250') return 'top250';
  if (
    s.includes('super hero') ||
    s.includes('superhero') ||
    s === 'heroi' ||
    s.includes('super poder') ||
    s.includes('superpoder')
  ) {
    return 'super poder';
  }
  if (s === 'gori' || s === 'gore') return 'gore';
  if (s.includes('lgbt') || s.includes('persoangem') || s.includes('persomagem') || s.includes('presonagem')) {
    return 'personagem lgbt';
  }
  if (s.includes('colegio') || s.includes('escola')) return 'colegio/escola';
  if (s.includes('crianca malvada')) return 'crianca malvada';
  if (s.includes('fatos reais')) return 'fatos reais';
  if (s.includes('crime real')) return 'crime real';
  if (s.includes('viagem no tempo')) return 'viagem no tempo';
  if (s.includes('final epico')) return 'final epico';
  if (s.includes('preto e branco')) return 'preto e branco';
  if (s.includes('em familia')) return 'em familia';
  if (s.includes('emocionante')) return 'emocionante';
  if (s.includes('tragico')) return 'tragico';
  if (s.includes('lobisomem')) return 'lobisomem';
  if (s.includes('zumbi')) return 'zumbi';
  if (s.includes('fantasma')) return 'fantasma';
  if (s === 'x-men' || s === 'x-man') return 'x-men';
  if (s === 'curta-metragem' || s === 'curta metragem') return 'curta';
  return s;
}

export function cleanMovieTitleStr(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[:\-–—.,'"!?()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTitleLetters(rawTitle: string | null | undefined): string[] {
  if (!rawTitle) return [];
  const normalized = String(rawTitle)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/^["'“‘(\[\-–—\s]+/, '');

  const letters = new Set<string>();
  const m1 = normalized.match(/^[a-zA-Z]/);
  if (m1) letters.add(m1[0].toUpperCase());

  const articleRegex = /^(o|a|os|as|the|um|uma|an)\s+([a-zA-Z])/i;
  const m2 = normalized.match(articleRegex);
  if (m2 && m2[2]) {
    letters.add(m2[2].toUpperCase());
  }
  return Array.from(letters);
}

/**
 * Strict numeric score parser returning `null` for missing/N/A/non-finite values.
 */
export function parseStrictScore(val: any): number | null {
  if (val === null || val === undefined || typeof val === 'boolean') return null;
  if (typeof val === 'number') {
    return Number.isNaN(val) || !Number.isFinite(val) ? null : val;
  }
  let s = String(val).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower === 'n/a' || lower === 'na' || lower === 'null' || lower === 'undefined' || lower === '-' || lower === 'none') {
    return null;
  }
  if (s.includes('/')) {
    s = s.split('/')[0].trim();
  }
  s = s.replace(/%/g, '').replace(',', '.').trim();
  if (!s) return null;
  const num = Number(s);
  return Number.isNaN(num) || !Number.isFinite(num) ? null : num;
}

/**
 * Robust global review count parser supporting K/M suffixes and localized separators.
 */
export function parseGlobalReviews(val: any): number | null {
  if (val === null || val === undefined || typeof val === 'boolean') return null;
  if (typeof val === 'number') {
    return Number.isNaN(val) || !Number.isFinite(val) || val < 0 ? null : Math.round(val);
  }
  const s = String(val).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower === 'n/a' || lower === 'na' || lower === 'null' || lower === 'undefined' || lower === '-' || lower === 'none') {
    return null;
  }
  const upper = s.toUpperCase();
  if (upper.endsWith('M')) {
    const numPart = parseFloat(upper.slice(0, -1).replace(',', '.').trim());
    return Number.isNaN(numPart) || !Number.isFinite(numPart) || numPart < 0 ? null : Math.round(numPart * 1_000_000);
  }
  if (upper.endsWith('K')) {
    const numPart = parseFloat(upper.slice(0, -1).replace(',', '.').trim());
    return Number.isNaN(numPart) || !Number.isFinite(numPart) || numPart < 0 ? null : Math.round(numPart * 1_000);
  }
  const cleaned = s.replace(/[.,\s]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}

export function extractCriticMetrics(movie: any): {
  ur: number | null;
  imdb: number | null;
  mc: number | null;
  rt: number | null;
  gr: number | null;
} {
  const rawUr =
    movie.user_rating_raw !== undefined
      ? movie.user_rating_raw
      : movie.minha_nota !== undefined
        ? movie.minha_nota
        : movie.user_rating;
  const ur = parseStrictScore(rawUr);

  const rawImdb = movie.imdb_rating !== undefined ? movie.imdb_rating : movie.imdb;
  const imdb = parseStrictScore(rawImdb);

  const rawMc = movie.metacritic_score !== undefined ? movie.metacritic_score : movie.metacritic;
  const mc = parseStrictScore(rawMc);

  const rawRt = movie.rotten_tomatoes_score !== undefined ? movie.rotten_tomatoes_score : movie.rotten_tomatoes;
  const rt = parseStrictScore(rawRt);

  let gr: number | null = null;
  if (movie.global_reviews !== undefined && movie.global_reviews !== null && String(movie.global_reviews).trim() !== '') {
    gr = parseGlobalReviews(movie.global_reviews);
  }
  if (gr === null && movie.vote_count !== undefined && movie.vote_count !== null && String(movie.vote_count).trim() !== '') {
    gr = parseGlobalReviews(movie.vote_count);
  }
  if (gr === null && movie.raw_api_data?.omdb?.imdbVotes) {
    gr = parseGlobalReviews(movie.raw_api_data.omdb.imdbVotes);
  }
  if (gr === null && movie.raw_api_data?.tmdb?.vote_count !== undefined && movie.raw_api_data?.tmdb?.vote_count !== null) {
    gr = parseGlobalReviews(movie.raw_api_data.tmdb.vote_count);
  }

  return { ur, imdb, mc, rt, gr };
}

export function movieHasAnyPattern(set: Set<string>, patterns: string[]): boolean {
  const cleanPats = patterns.map((p) => cleanStr(p));
  for (const val of set) {
    for (const pat of cleanPats) {
      if (pat && val.includes(pat)) return true;
    }
  }
  return false;
}

export function matchFranchiseMovie(
  m: any,
  req: { name?: string; patterns: string[]; year?: number; exclude?: string[] }
): boolean {
  const relY = m.releaseYear ?? m.release_year;
  if (req.year && relY) {
    if (Math.abs(Number(relY) - Number(req.year)) > 1) {
      return false;
    }
  }

  const mTitles: string[] = Array.isArray(m.cleanTitles)
    ? m.cleanTitles
    : [cleanMovieTitleStr(m.title), cleanMovieTitleStr(m.original_title)].filter(Boolean);

  if (Array.isArray(req.exclude)) {
    for (const ex of req.exclude) {
      const cEx = cleanMovieTitleStr(ex);
      if (mTitles.some((t) => t.includes(cEx))) return false;
    }
  }

  const patterns = (req.patterns || []).map(cleanMovieTitleStr);
  for (const p of patterns) {
    for (const t of mTitles) {
      if (t === p || t.includes(p)) {
        return true;
      }
    }
  }
  return false;
}

export function matchCuratedCandidate(
  m: any,
  req: {
    name?: string;
    patterns: string[];
    year?: number;
    exclude?: string[];
    requireAdditionalPatterns?: string[];
  }
): boolean {
  if (req.year) {
    const movieYear = Number(
      m.releaseYear ?? m.release_year ?? m.year ?? (m.release_date ? String(m.release_date).slice(0, 4) : 0)
    );
    if (movieYear > 1800 && Math.abs(movieYear - Number(req.year)) > 1) {
      return false;
    }
  }

  const mTitles: string[] = Array.isArray(m.cleanTitles)
    ? m.cleanTitles
    : [cleanMovieTitleStr(m.title), cleanMovieTitleStr(m.original_title)].filter(Boolean);

  if (Array.isArray(req.exclude)) {
    for (const ex of req.exclude) {
      const cEx = cleanMovieTitleStr(ex);
      if (mTitles.some((t) => t.includes(cEx))) return false;
    }
  }

  const patterns = (req.patterns || []).map(cleanMovieTitleStr);
  const matchesBase = patterns.some((p) => mTitles.some((t) => t === p || t.includes(p)));
  if (!matchesBase) return false;

  if (Array.isArray(req.requireAdditionalPatterns) && req.requireAdditionalPatterns.length > 0) {
    const addPatterns = req.requireAdditionalPatterns.map(cleanMovieTitleStr);
    const matchesAdd = addPatterns.some((ap) => mTitles.some((t) => t.includes(ap)));
    if (!matchesAdd) return false;
  }

  return true;
}

export function buildMovieSlotsChecklist(
  matchingMovies: Array<IndexedMovie | any>,
  targetValue: number,
  extraInfoFn: (m: any) => string,
  pendingPlaceholder: string,
  fixedFlag?: string | null
): { checklist: TrophyChecklistItem[]; progressCurrent: number } {
  const checklist: TrophyChecklistItem[] = [];
  const cap = Math.min(matchingMovies.length, targetValue);

  for (let i = 0; i < targetValue; i++) {
    const entry = matchingMovies[i];
    if (entry) {
      const m = entry.raw ?? entry;
      const pCode = entry.primaryCountryCode195 ?? entry.rawPrimaryCountryCode ?? m.primaryCountryCode;
      checklist.push({
        id: `slot_${i + 1}`,
        name: `Filme #${i + 1}: ${m.title}${m.release_year ? ` (${m.release_year})` : ''}`,
        flag: fixedFlag !== undefined ? fixedFlag : pCode ? String(pCode).toLowerCase() : null,
        required: 1,
        current: 1,
        conquered: true,
        movie_title: m.title,
        movie_year: m.release_year ?? null,
        poster_url: m.poster_url || null,
        extra_info: extraInfoFn(entry),
      });
    } else {
      checklist.push({
        id: `slot_${i + 1}`,
        name: `Filme #${i + 1} (${pendingPlaceholder})`,
        flag: null,
        required: 1,
        current: 0,
        conquered: false,
        extra_info: 'Pendente',
      });
    }
  }

  return { checklist, progressCurrent: cap };
}

// Lookup estático para países UN-195 (reaproveitado entre avaliações)
const STATIC_UN_DEF_MAP = new Map<string, UNCountryDefinition>(UN_COUNTRIES_195.map((c) => [c.code.toLowerCase(), c]));
const STATIC_UN_ALIAS_MAP = new Map<string, string>();
for (const c of UN_COUNTRIES_195) {
  const code = c.code.toLowerCase();
  STATIC_UN_ALIAS_MAP.set(cleanStr(code), code);
  STATIC_UN_ALIAS_MAP.set(cleanStr(c.iso3), code);
  STATIC_UN_ALIAS_MAP.set(cleanStr(c.name), code);
  if (Array.isArray(c.aliases)) {
    for (const al of c.aliases) {
      STATIC_UN_ALIAS_MAP.set(cleanStr(al), code);
    }
  }
}
for (const h of HISTORICAL_TERRITORIES) {
  const code = h.code.toLowerCase();
  STATIC_UN_ALIAS_MAP.set(cleanStr(code), code);
  STATIC_UN_ALIAS_MAP.set(cleanStr(h.name), code);
  if (Array.isArray(h.aliases)) {
    for (const al of h.aliases) {
      STATIC_UN_ALIAS_MAP.set(cleanStr(al), code);
    }
  }
}
const ALL_21_GENRES_CLEAN_SET = new Set<string>(ALL_21_GENRES.map((g) => cleanTag(g)));

function pushToMapArray<K, V>(map: Map<K, V[]>, key: K, item: V): void {
  const arr = map.get(key);
  if (arr) {
    arr.push(item);
  } else {
    map.set(key, [item]);
  }
}

function addPeopleTokens(
  targetSet: Set<string>,
  displayMap: Map<string, string> | null,
  rawList: any,
  stripParens = false
): void {
  if (!rawList) return;
  const items: string[] = Array.isArray(rawList)
    ? rawList.map((x) => (typeof x === 'string' ? x : x?.name || '')).filter(Boolean)
    : String(rawList) === 'N/A'
      ? []
      : String(rawList).split(',');

  for (const rawItem of items) {
    let cleanRaw = String(rawItem).trim();
    if (stripParens) {
      cleanRaw = cleanRaw.replace(/\([^)]*\)/g, '').trim();
    }
    if (!cleanRaw || cleanRaw.toUpperCase() === 'N/A') continue;
    const norm = cleanStr(cleanRaw);
    if (!norm) continue;
    targetSet.add(norm);
    if (displayMap && !displayMap.has(norm)) {
      displayMap.set(norm, cleanRaw);
    }
  }
}

/**
 * Indexes all movies, countries, historical territories, genres, tags, and credits once per trophy evaluation pass.
 */
export function buildCatalogIndex(worldData: WorldChallengePayload | any): CatalogIndex {
  const rawMovies: any[] = Array.isArray(worldData?.catalogMovies) ? worldData.catalogMovies : [];

  const unCountriesMap = new Map<string, any>();
  for (const c of Array.isArray(worldData?.countries) ? worldData.countries : []) {
    if (c?.code) unCountriesMap.set(String(c.code).toLowerCase(), c);
  }

  const historicalCountriesMap = new Map<string, any>();
  for (const h of Array.isArray(worldData?.historicalCountries) ? worldData.historicalCountries : []) {
    if (h?.code) historicalCountriesMap.set(String(h.code).toLowerCase(), h);
  }

  const allCountriesAndHistoricalMap = new Map<string, any>([...unCountriesMap, ...historicalCountriesMap]);
  const conqueredCountries = Array.from(unCountriesMap.values()).filter((c) => c.status === 'conquered');

  const movies: IndexedMovie[] = [];
  const moviesByMonth = new Map<number, IndexedMovie[]>();
  const moviesByRelYear = new Map<number, IndexedMovie[]>();
  const moviesByTag = new Map<string, IndexedMovie[]>();
  const moviesByGenre = new Map<string, IndexedMovie[]>();
  const moviesByCountryAll = new Map<string, IndexedMovie[]>();
  const moviesByCountryPrimary = new Map<string, IndexedMovie[]>();
  const moviesByContinent = new Map<string, IndexedMovie[]>();
  const moviesByPlatform = new Map<string, IndexedMovie[]>();
  const directorToMovies = new Map<string, { displayName: string; movies: IndexedMovie[] }>();
  const writerToMovies = new Map<string, { displayName: string; movies: IndexedMovie[] }>();

  let totalRuntimeMinutes = 0;
  let maxCatalogYear = 2023;

  for (let idx = 0; idx < rawMovies.length; idx++) {
    const m = rawMovies[idx];
    const movieId = m.movie_id ?? m.id ?? `m_${idx}`;
    const title = String(m.title ?? '');
    const originalTitle = String(m.original_title ?? '');

    const rawRelYear = Number(m.release_year ?? m.ano_lancamento ?? m.ano);
    const releaseYear = !Number.isNaN(rawRelYear) && rawRelYear > 1800 ? rawRelYear : null;
    if (releaseYear && releaseYear > maxCatalogYear && releaseYear <= 2050) {
      maxCatalogYear = releaseYear;
    }

    const rawYearSeen = Number(m.year_seen ?? m.ano_visto);
    const yearSeen = !Number.isNaN(rawYearSeen) && rawYearSeen > 1800 ? rawYearSeen : null;

    const rawMonth = m.month_seen ?? m.mes_visto;
    const monthNum = rawMonth !== null && rawMonth !== undefined ? Number(rawMonth) : NaN;
    const monthSeen = !Number.isNaN(monthNum) && monthNum >= 1 && monthNum <= 12 ? monthNum : null;

    const rawRuntime = Number(m.runtime ?? m.duracao ?? m.min);
    const runtime = !Number.isNaN(rawRuntime) && rawRuntime > 0 ? rawRuntime : 0;
    totalRuntimeMinutes += runtime;

    const oscarWins = Number(m.oscar_wins) || 0;
    const oscarNoms = Number(m.oscar_nominations) || 0;

    const canonicalPlatform = normalizeCanonicalPlatform(m.platform ?? m.plataforma ?? '');
    const audioLower = normalizeAudioType(m.audio_type ?? m.audio ?? '');

    const cleanTitles = [cleanMovieTitleStr(title), cleanMovieTitleStr(originalTitle)].filter(Boolean);
    const titleLetters = new Set<string>([...getTitleLetters(title), ...getTitleLetters(originalTitle)]);

    const tagsSet = new Set<string>();
    const tagEntries: Array<{ raw: string; clean: string }> = [];
    if (Array.isArray(m.tags)) {
      for (const rawT of m.tags) {
        const s = String(rawT ?? '').trim();
        if (!s) continue;
        const c = cleanTag(s);
        if (c && !tagsSet.has(c)) {
          tagsSet.add(c);
          tagEntries.push({ raw: s, clean: c });
        }
      }
    }

    const genresSet = new Set<string>();
    const genresRaw: string[] = Array.isArray(m.genres) ? m.genres.filter(Boolean) : [];
    for (const rawG of genresRaw) {
      const c = cleanTag(rawG);
      if (c) genresSet.add(c);
    }
    let all21GenresCount = 0;
    for (const cg of genresSet) {
      if (ALL_21_GENRES_CLEAN_SET.has(cg)) all21GenresCount++;
    }

    // Países (primário UN-195 estrito + todas as coproduções)
    const rawPrimary = m.primaryCountryCode ? String(m.primaryCountryCode).toLowerCase() : null;
    const primaryCountryCode195 = rawPrimary && STATIC_UN_DEF_MAP.has(rawPrimary) ? rawPrimary : null;
    const allCountryCodes = new Set<string>();
    if (rawPrimary) allCountryCodes.add(rawPrimary);
    if (Array.isArray(m.coproductionCountries)) {
      for (const cc of m.coproductionCountries) {
        if (cc?.code) allCountryCodes.add(String(cc.code).toLowerCase());
      }
    }
    if (Array.isArray(m.countries)) {
      for (const rawCName of m.countries) {
        const mapped = STATIC_UN_ALIAS_MAP.get(cleanStr(rawCName));
        if (mapped) allCountryCodes.add(mapped);
      }
    }

    const continentsSet = new Set<string>();
    for (const code of allCountryCodes) {
      const def = STATIC_UN_DEF_MAP.get(code);
      if (def?.continent) continentsSet.add(cleanStr(def.continent));
    }

    // Créditos & estúdios
    const rawApi = m.raw_api_data || {};
    const directors = new Set<string>();
    const directorsDisplay = new Map<string, string>();
    addPeopleTokens(directors, directorsDisplay, m.directors ?? m.director);
    addPeopleTokens(directors, directorsDisplay, rawApi.omdb?.Director);
    if (Array.isArray(rawApi.tmdb?.credits?.crew)) {
      for (const c of rawApi.tmdb.credits.crew) {
        if (c?.job === 'Director' && c?.name) {
          addPeopleTokens(directors, directorsDisplay, [c.name]);
        }
      }
    }

    const writers = new Set<string>();
    const writersDisplay = new Map<string, string>();
    addPeopleTokens(writers, writersDisplay, m.writers ?? m.writer, true);
    addPeopleTokens(writers, writersDisplay, rawApi.omdb?.Writer, true);
    if (Array.isArray(rawApi.tmdb?.credits?.crew)) {
      for (const c of rawApi.tmdb.credits.crew) {
        if (
          c?.name &&
          (c.department === 'Writing' || ['Writer', 'Screenplay', 'Story', 'Characters'].includes(c.job))
        ) {
          addPeopleTokens(writers, writersDisplay, [c.name]);
        }
      }
    }

    const producers = new Set<string>();
    addPeopleTokens(producers, null, m.producers ?? m.producer);
    if (Array.isArray(rawApi.tmdb?.credits?.crew)) {
      for (const c of rawApi.tmdb.credits.crew) {
        if (c?.name && (c.job === 'Producer' || c.job === 'Executive Producer')) {
          addPeopleTokens(producers, null, [c.name]);
        }
      }
    }

    const studios = new Set<string>();
    addPeopleTokens(studios, null, m.studios ?? m.production_companies ?? m.studio);
    if (Array.isArray(rawApi.tmdb?.production_companies)) {
      addPeopleTokens(
        studios,
        null,
        rawApi.tmdb.production_companies.map((c: any) => c?.name || c).filter(Boolean)
      );
    }

    const distributors = new Set<string>();
    addPeopleTokens(distributors, null, m.distributors ?? m.distributor);
    addPeopleTokens(distributors, null, rawApi.omdb?.Production);

    const companies = new Set<string>([...studios, ...distributors]);

    const { ur, imdb, mc, rt, gr } = extractCriticMetrics(m);
    const urMillis = ur !== null ? Math.round(ur * 1000) : null;
    const imdbMillis = imdb !== null ? Math.round(imdb * 1000) : null;

    const indexed: IndexedMovie = {
      raw: m,
      movieId,
      title,
      originalTitle,
      releaseYear,
      monthSeen,
      yearSeen,
      runtime,
      posterUrl: m.poster_url || null,
      oscarWins,
      oscarNoms,
      canonicalPlatform,
      audioLower,
      cleanTitles,
      titleLetters,
      tagsSet,
      tagEntries,
      genresSet,
      genresRaw,
      all21GenresCount,
      primaryCountryCode195,
      rawPrimaryCountryCode: rawPrimary,
      primaryCountryName: m.primaryCountryName || null,
      allCountryCodes,
      continentsSet,
      directors,
      directorsDisplay,
      writers,
      writersDisplay,
      producers,
      studios,
      distributors,
      companies,
      ur,
      urMillis,
      imdb,
      imdbMillis,
      mc,
      rt,
      gr,
    };

    movies.push(indexed);

    if (monthSeen !== null) pushToMapArray(moviesByMonth, monthSeen, indexed);
    if (releaseYear !== null) pushToMapArray(moviesByRelYear, releaseYear, indexed);
    if (canonicalPlatform) pushToMapArray(moviesByPlatform, canonicalPlatform, indexed);
    for (const t of tagsSet) pushToMapArray(moviesByTag, t, indexed);
    for (const g of genresSet) pushToMapArray(moviesByGenre, g, indexed);
    for (const cc of allCountryCodes) pushToMapArray(moviesByCountryAll, cc, indexed);
    if (primaryCountryCode195) pushToMapArray(moviesByCountryPrimary, primaryCountryCode195, indexed);
    for (const cont of continentsSet) pushToMapArray(moviesByContinent, cont, indexed);

    for (const dNorm of directors) {
      const entry = directorToMovies.get(dNorm);
      if (entry) {
        entry.movies.push(indexed);
      } else {
        directorToMovies.set(dNorm, {
          displayName: directorsDisplay.get(dNorm) || dNorm,
          movies: [indexed],
        });
      }
    }

    for (const wNorm of writers) {
      const entry = writerToMovies.get(wNorm);
      if (entry) {
        entry.movies.push(indexed);
      } else {
        writerToMovies.set(wNorm, {
          displayName: writersDisplay.get(wNorm) || wNorm,
          movies: [indexed],
        });
      }
    }
  }

  return {
    movies,
    totalMovies: movies.length,
    totalRuntimeMinutes,
    maxCatalogYear,
    moviesByMonth,
    moviesByRelYear,
    moviesByTag,
    moviesByGenre,
    moviesByCountryAll,
    moviesByCountryPrimary,
    moviesByContinent,
    moviesByPlatform,
    directorToMovies,
    writerToMovies,
    unCountryDefMap: STATIC_UN_DEF_MAP,
    unCountriesMap,
    historicalCountriesMap,
    allCountriesAndHistoricalMap,
    conqueredCountries,
    conqueredCountriesCount: conqueredCountries.length,
  };
}
