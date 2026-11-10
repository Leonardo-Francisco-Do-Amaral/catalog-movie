import { query } from '../config/database';
import {
  TROPHY_DEFINITIONS,
  TrophyDefinition,
  TrophyTier,
  TIER_CONFIG,
} from '../data/trophyDefinitions';
import { UN_COUNTRIES_195, CountryRarityTier } from '../data/unCountries195';
import { buildWorldChallengePayload, ChallengeCountryEntry } from './worldChallengeService';
import { buildUserXpStatus, UserXpStatus } from './xpService';

let tablesEnsured = false;

export async function ensureTrophyTables(): Promise<void> {
  if (tablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS trophies (
      id VARCHAR(80) PRIMARY KEY,
      category VARCHAR(64) DEFAULT 'volta_ao_mundo',
      tier VARCHAR(32) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(64) NOT NULL,
      target_type VARCHAR(64) NOT NULL,
      target_value INTEGER NOT NULL DEFAULT 1,
      target_metadata JSONB DEFAULT '{}'::jsonb,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_trophies (
      trophy_id VARCHAR(80) PRIMARY KEY REFERENCES trophies(id) ON DELETE CASCADE,
      is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
      unlocked_at TIMESTAMP NULL,
      progress_current INTEGER NOT NULL DEFAULT 0,
      progress_target INTEGER NOT NULL DEFAULT 1,
      progress_percentage INTEGER NOT NULL DEFAULT 0,
      checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_new BOOLEAN NOT NULL DEFAULT FALSE,
      test_override BOOLEAN DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trophy_last_activity (
      id INTEGER PRIMARY KEY,
      movie_id INTEGER NULL,
      movie_title VARCHAR(255) NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      entries JSONB NOT NULL DEFAULT '[]'::jsonb
    );
  `);
  await query('ALTER TABLE trophies ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT \'[]\'::jsonb;');
  tablesEnsured = true;
}

export async function seedTrophies(): Promise<void> {
  await ensureTrophyTables();

  for (const t of TROPHY_DEFINITIONS) {
    await query(
      `
      INSERT INTO trophies (id, category, categories, tier, title, description, icon, target_type, target_value, target_metadata, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        categories = EXCLUDED.categories,
        tier = EXCLUDED.tier,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        target_type = EXCLUDED.target_type,
        target_value = EXCLUDED.target_value,
        target_metadata = EXCLUDED.target_metadata,
        sort_order = EXCLUDED.sort_order;
    `,
      [
        t.id,
        t.category,
        JSON.stringify(t.categories || (t.target_metadata?.isHybrid ? ['volta_ao_mundo', 'dna_cinefilo'] : [t.category])),
        t.tier,
        t.title,
        t.description,
        t.icon,
        t.target_type,
        t.target_value,
        JSON.stringify(t.target_metadata || {}),
        t.sort_order,
      ]
    );

    // Garante que existe registro em user_trophies
    await query(
      `
      INSERT INTO user_trophies (trophy_id, progress_target)
      VALUES ($1, $2)
      ON CONFLICT (trophy_id) DO NOTHING;
    `,
      [t.id, t.target_value]
    );
  }
}

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
  extra_info?: string | null;
  rule_desc?: string | null;
}

export interface EvaluatedTrophy {
  categories: string[];
  id: string;
  category: string;
  tier: TrophyTier;
  title: string;
  description: string;
  icon: string;
  target_type: string;
  target_value: number;
  target_metadata: any;
  sort_order: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress_current: number;
  progress_target: number;
  progress_percentage: number;
  checklist: TrophyChecklistItem[];
  is_new: boolean;
  test_override: boolean | null;
}

export interface ProgressedTrophy extends EvaluatedTrophy {
  previousCount: number;
  currentCount: number;
  targetCount: number;
  previousPercentage: number;
  increasedBy: number;
}

export interface TrophyTierStats {
  name: string;
  color: string;
  symbol: string;
  total: number;
  unlocked: number;
  percentage: number;
}

export interface TrophyLastActivityEntry {
  trophyId: string;
  previousCount: number;
  currentCount: number;
  increasedBy: number;
  unlockedNow: boolean;
}

export interface TrophyLastActivity {
  movieId: number | null;
  movieTitle: string | null;
  recordedAt: string | null;
  entries: TrophyLastActivityEntry[];
}

export interface TrophiesSummaryResponse {
  totalTrophies: number;
  unlockedCount: number;
  totalPoints: number;
  earnedPoints: number;
  overallPercentage: number;
  tierStats: Record<TrophyTier, TrophyTierStats>;
  trophies: EvaluatedTrophy[];
  newlyUnlocked: EvaluatedTrophy[];
  progressedTrophies?: ProgressedTrophy[];
  xpStatus?: UserXpStatus;
  lastActivity?: TrophyLastActivity | null;
}

/**
 * Avalia todos os troféus no banco de dados e calcula checklists detalhadas.
 */

function cleanStr(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function getTrophyLadderKey(t: ProgressedTrophy): string {
  const meta = t.target_metadata || {};
  switch (t.target_type) {
    case 'country_count':
      return `country_${meta.country_code || meta.country || t.category}`;
    case 'tag_count':
      return `tag_${meta.tag || (Array.isArray(meta.tags) ? meta.tags.join('_') : '')}`;
    case 'genre_count':
      return `genre_${meta.genre}`;
    case 'month_count':
      return `month_${meta.month}`;
    case 'release_year_decade':
      return `decade_${meta.decade}`;
    case 'total_movies':
      return `total_movies`;
    case 'runtime_gte_180':
      return `runtime_gte_180`;
    case 'oscar_wins':
      return `oscar_wins`;
    case 'oscar_nominations':
      return `oscar_nominations`;
    case 'director_count':
    case 'hollywood_director_count':
      return `director_${meta.director}`;
    case 'rating_rule':
      return `rating_${meta.ruleKey}`;
    case 'franchise_movie_list':
      return `franchise_${meta.franchise}`;
    default:
      return `ladder_${t.id}`;
  }
}

export function filterProgressedTrophies(progressedList: ProgressedTrophy[]): ProgressedTrophy[] {
  if (progressedList.length === 0) return [];

  const ladderMap = new Map<string, ProgressedTrophy[]>();
  for (const t of progressedList) {
    const key = getTrophyLadderKey(t);
    if (!ladderMap.has(key)) ladderMap.set(key, []);
    ladderMap.get(key)!.push(t);
  }

  const filtered: ProgressedTrophy[] = [];
  ladderMap.forEach((group) => {
    // Escolhe o marco mais próximo (menor target_value)
    group.sort((a, b) => a.target_value - b.target_value);
    filtered.push(group[0]);
  });

  // Ordena por maior % de conclusão (mais perto de 100% primeiro), depois maior progresso absoluto
  filtered.sort((a, b) => {
    if (b.progress_percentage !== a.progress_percentage) {
      return b.progress_percentage - a.progress_percentage;
    }
    return b.progress_current - a.progress_current;
  });

  return filtered;
}

const ALL_39_TAGS: string[] = [
  "invocaversus",
  "SK",
  "TOP250",
  "Vampiro",
  "Criança Malvada",
  "Colegio/Escola",
  "Baseado em jogo",
  "Baseado em Anime",
  "Animais antropomorficos",
  "Mudo",
  "Preto e branco",
  "Repetido",
  "Paródia",
  "Natal",
  "Aliens",
  "Final Epico",
  "Gore",
  "Sequestro",
  "Personagem LGBT",
  "Bruxo",
  "Abuso Familiar",
  "Dystopia",
  "Viagem no Tempo",
  "Crime real",
  "Fatos Reais",
  "Emocionante",
  "Trágico",
  "Preconceito",
  "Lobisomem",
  "Demônio",
  "Religião",
  "Zumbi",
  "X-Men",
  "Vilão",
  "Fantasma",
  "Super Poder",
  "Marvel",
  "DC",
  "Multiverso"
];

function cleanTag(str: string): string {
  if (!str) return '';
  let s = str.trim().replace(/^["']|["']$/g, '');
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  if (s === 'stephen king' || s === 'sk') return 'sk';
  if (s === 'top 250' || s === 'top250') return 'top250';
  if (s.includes('super hero') || s.includes('superhero') || s === 'heroi' || s.includes('super poder') || s.includes('superpoder')) return 'super poder';
  if (s === 'gori' || s === 'gore') return 'gore';
  if (s.includes('lgbt') || s.includes('persoangem') || s.includes('persomagem') || s.includes('presonagem')) return 'personagem lgbt';
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
  return s;
}

function movieHasTag(movie: any, targetTag: string): boolean {
  const target = cleanTag(targetTag);
  const movieTags = (Array.isArray(movie.tags) ? movie.tags : []).map(cleanTag);
  return movieTags.includes(target);
}

function movieHasCountry(movie: any, countryCode: string, unCountryDefMap: Map<string, any>): boolean {
  const code = (countryCode || '').toLowerCase();
  if (movie.primaryCountryCode && movie.primaryCountryCode.toLowerCase() === code) return true;
  if (Array.isArray(movie.coproductionCountries)) {
    if (movie.coproductionCountries.some((c: any) => c.code && c.code.toLowerCase() === code)) return true;
  }
  const def = unCountryDefMap.get(code);
  if (def && Array.isArray(movie.countries)) {
    const cleanNames = movie.countries.map(cleanStr);
    if (cleanNames.includes(cleanStr(def.name))) return true;
    if (Array.isArray(def.aliases)) {
      for (const a of def.aliases) {
        if (cleanNames.includes(cleanStr(a))) return true;
      }
    }
  }
  return false;
}


const ALL_21_GENRES = [
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
];

const MONTH_NAMES: Record<number, string> = {
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

function movieHasGenre(movie: any, genreName: string): boolean {
  if (!movie || !Array.isArray(movie.genres)) return false;
  const target = cleanStr(genreName);
  return movie.genres.some((g: string) => cleanStr(g) === target);
}

function movieHasAllGenres(movie: any, genreNames: string[]): boolean {
  return genreNames.every((g) => movieHasGenre(movie, g));
}

function movieHasAnyGenre(movie: any, genreNames: string[]): boolean {
  return genreNames.some((g) => movieHasGenre(movie, g));
}

function movieInMonth(movie: any, month: number | number[]): boolean {
  if (!movie || movie.month_seen === null || movie.month_seen === undefined) return false;
  const m = Number(movie.month_seen);
  if (Array.isArray(month)) {
    return month.includes(m);
  }
  return m === month;
}

function movieInContinent(movie: any, continentName: string, unCountryDefMap: Map<string, any>): boolean {
  const targetContinent = cleanStr(continentName);
  const codes = new Set<string>();
  if (movie.primaryCountryCode) codes.add(movie.primaryCountryCode.toLowerCase());
  if (Array.isArray(movie.coproductionCountries)) {
    movie.coproductionCountries.forEach((c: any) => c.code && codes.add(c.code.toLowerCase()));
  }
  for (const c of codes) {
    const def = unCountryDefMap.get(c);
    if (def && cleanStr(def.continent) === targetContinent) return true;
  }
  return false;
}

function cleanMovieTitleStr(str: string): string {
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

function matchFranchiseMovie(
  m: any,
  req: { name: string; patterns: string[]; year?: number; exclude?: string[] }
): boolean {
  if (req.year && m.release_year) {
    if (Math.abs(Number(m.release_year) - Number(req.year)) > 1) {
      return false;
    }
  }

  const mTitles = [cleanMovieTitleStr(m.title), cleanMovieTitleStr(m.original_title)].filter(Boolean);

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

function matchCuratedCandidate(
  m: any,
  req: { name?: string; patterns: string[]; year?: number; exclude?: string[]; requireAdditionalPatterns?: string[] }
): boolean {
  if (req.year) {
    const movieYear = Number(m.release_year || m.year || (m.release_date ? String(m.release_date).slice(0, 4) : 0));
    if (movieYear > 1800 && Math.abs(movieYear - Number(req.year)) > 1) {
      return false;
    }
  }

  const mTitles = [cleanMovieTitleStr(m.title), cleanMovieTitleStr(m.original_title)].filter(Boolean);

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

function getTitleLetters(rawTitle: string): string[] {
  if (!rawTitle) return [];
  const normalized = String(rawTitle)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/^["'“‘(\[\-–—\s]+/, '');

  const letters = new Set<string>();
  const m1 = normalized.match(/^[a-zA-Z]/);
  if (m1) letters.add(m1[0].toUpperCase());

  // Check common articles: O, A, Os, As, The, Um, Uma, An
  const articleRegex = /^(o|a|os|as|the|um|uma|an)\s+([a-zA-Z])/i;
  const m2 = normalized.match(articleRegex);
  if (m2 && m2[2]) {
    letters.add(m2[2].toUpperCase());
  }

  return Array.from(letters);
}

function getMovieDirectors(m: any): Set<string> {
  const set = new Set<string>();
  (m.directors || []).forEach((d: string) => d && set.add(cleanStr(d)));
  const raw = m.raw_api_data || {};
  if (raw.omdb?.Director && raw.omdb.Director !== 'N/A') {
    raw.omdb.Director.split(',').forEach((d: string) => set.add(cleanStr(d)));
  }
  if (Array.isArray(raw.tmdb?.credits?.crew)) {
    raw.tmdb.credits.crew.filter((c: any) => c.job === 'Director').forEach((c: any) => c.name && set.add(cleanStr(c.name)));
  }
  return set;
}

function getMovieWriters(m: any): Set<string> {
  const set = new Set<string>();
  (m.writers || []).forEach((w: string) => w && set.add(cleanStr(w)));
  const raw = m.raw_api_data || {};
  if (raw.omdb?.Writer && raw.omdb.Writer !== 'N/A') {
    raw.omdb.Writer.split(',').forEach((w: string) => {
      const cleaned = cleanStr(w.replace(/\s*\([^)]*\)/g, ''));
      if (cleaned) set.add(cleaned);
    });
  }
  if (Array.isArray(raw.tmdb?.credits?.crew)) {
    raw.tmdb.credits.crew
      .filter((c: any) => ['Writer', 'Screenplay', 'Story', 'Characters'].includes(c.job))
      .forEach((c: any) => c.name && set.add(cleanStr(c.name)));
  }
  return set;
}

function getMovieProducers(m: any): Set<string> {
  const set = new Set<string>();
  (m.producers || []).forEach((p: string) => p && set.add(cleanStr(p)));
  const raw = m.raw_api_data || {};
  if (raw.omdb?.Production && raw.omdb.Production !== 'N/A') {
    set.add(cleanStr(raw.omdb.Production));
  }
  if (Array.isArray(raw.tmdb?.credits?.crew)) {
    raw.tmdb.credits.crew
      .filter((c: any) => c && ['Producer', 'Executive Producer'].includes(c.job))
      .forEach((c: any) => c.name && set.add(cleanStr(c.name)));
  }
  return set;
}

function getMovieStudios(m: any): Set<string> {
  const set = new Set<string>();
  (m.studios || []).forEach((s: string) => s && set.add(cleanStr(s)));
  const raw = m.raw_api_data || {};
  if (raw.omdb?.Production && raw.omdb.Production !== 'N/A') {
    set.add(cleanStr(raw.omdb.Production));
  }
  if (Array.isArray(raw.tmdb?.production_companies)) {
    raw.tmdb.production_companies.forEach((p: any) => p.name && set.add(cleanStr(p.name)));
  }
  return set;
}

function getMovieDistributors(m: any): Set<string> {
  const set = new Set<string>();
  if (m.distributor) {
    m.distributor.split(/[-–—,/]/).forEach((d: string) => {
      const c = cleanStr(d);
      if (c) set.add(c);
    });
  }
  return set;
}

function movieHasAnyPattern(set: Set<string>, patterns: string[]): boolean {
  for (const item of set) {
    for (const pat of patterns) {
      const p = cleanStr(pat);
      if (p && item.includes(p)) return true;
    }
  }
  return false;
}

function buildMovieSlotsChecklist(
  matchingMovies: any[],
  target: number,
  extraInfoFormatter: (m: any) => string,
  pendingSlotDesc: string,
  flagCode?: string | null
): { checklist: TrophyChecklistItem[]; progressCurrent: number } {
  const checklist: TrophyChecklistItem[] = [];
  const cappedMovies = matchingMovies.slice(0, target);

  cappedMovies.forEach((m: any, idx: number) => {
    checklist.push({
      id: `m_${m.movie_id || idx}`,
      name: `${m.title}${m.release_year ? ` (${m.release_year})` : ''}`,
      flag: flagCode || (m.primaryCountryCode ? m.primaryCountryCode.toLowerCase() : null),
      required: 1,
      current: 1,
      conquered: true,
      movie_title: m.title,
      movie_year: m.release_year,
      poster_url: m.poster_url,
      extra_info: extraInfoFormatter(m),
    });
  });

  if (cappedMovies.length < target) {
    for (let i = cappedMovies.length; i < target; i++) {
      checklist.push({
        id: `slot_${i + 1}`,
        name: `Filme #${i + 1} (${pendingSlotDesc})`,
        flag: flagCode || null,
        required: 1,
        current: 0,
        conquered: false,
        extra_info: 'Pendente',
      });
    }
  }

  return {
    checklist,
    progressCurrent: cappedMovies.length,
  };
}

/**
 * REGRA DE OURO DO TRIBUNAL DA CRÍTICA:
 * Jamais converte null, undefined, "" ou "N/A" em 0!
 * Retorna number válido ou null estrito quando ausente.
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
 * Parser robusto de Global Reviews:
 * Suporta sufixos 'M'/'m' (x 1.000.000), 'K'/'k' (x 1.000), inteiros formatados ("537,711", "85.000") e números puros.
 * Valores ausentes ou "N/A" retornam null estrito.
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

function extractCriticMetrics(movie: any): {
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

function evaluateCriticTribunalMovie(
  movie: any,
  ruleKey: string,
  unCountryDefMap?: Map<string, any>
): { matched: boolean; extraInfo: string; sortScore: number } {
  const { ur, imdb, mc, rt, gr } = extractCriticMetrics(movie);
  const urMillis = ur !== null ? Math.round(ur * 1000) : null;
  const imdbMillis = imdb !== null ? Math.round(imdb * 1000) : null;

  const fmtUr = (v: number) => v.toFixed(3);
  const fmtImdb = (v: number) => v.toFixed(1);
  const fmtGr = (v: number) => v.toLocaleString('pt-BR');

  switch (ruleKey) {
    case 'ur_gte_9000':
      if (ur !== null && urMillis! >= 9000) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_lte_3000':
      if (ur !== null && urMillis! <= 3000) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_gte_90':
      if (rt !== null && rt >= 90) {
        return { matched: true, extraInfo: `Rotten Tomatoes: ${rt}%`, sortScore: rt };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_gte_80':
      if (imdb !== null && imdbMillis! >= 8000) {
        return { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)}`, sortScore: imdbMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_gte_1m':
      if (gr !== null && gr >= 1_000_000) {
        return { matched: true, extraInfo: `Global Reviews: ${fmtGr(gr)}`, sortScore: gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_5k':
      if (gr !== null && gr < 5_000) {
        return { matched: true, extraInfo: `Global Reviews: ${fmtGr(gr)}`, sortScore: -gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'only_rt_na':
      if (rt === null && mc !== null) {
        return { matched: true, extraInfo: `RT: N/A | Metacritic: ${mc}`, sortScore: mc };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'only_mc_na':
      if (mc === null && rt !== null) {
        return { matched: true, extraInfo: `Metacritic: N/A | RT: ${rt}%`, sortScore: rt };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_gt_1m_imdb_lt_70':
      if (gr !== null && gr > 1_000_000 && imdb !== null && imdbMillis! < 7000) {
        return { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | IMDb: ${fmtImdb(imdb)}`, sortScore: gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_1k':
      if (gr !== null && gr < 1_000) {
        return { matched: true, extraInfo: `Global Reviews: ${fmtGr(gr)}`, sortScore: -gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_10k_ur_gte_8000':
      if (gr !== null && gr < 10_000 && ur !== null && urMillis! >= 8000) {
        return { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_lt_40_ur_gte_7500':
      if (rt !== null && rt < 40 && ur !== null && urMillis! >= 7500) {
        return { matched: true, extraInfo: `RT: ${rt}% | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! - rt * 10 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'mc_gte_80_ur_lte_6000':
      if (mc !== null && mc >= 80 && ur !== null && urMillis! <= 6000) {
        return { matched: true, extraInfo: `Metacritic: ${mc} | Minha Nota: ${fmtUr(ur)}`, sortScore: mc * 100 - urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_pharmacist_decimals': {
      if (ur !== null) {
        const frac = ((urMillis! % 1000) + 1000) % 1000;
        if (frac !== 0 && frac !== 500) {
          return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)} (.${String(frac).padStart(3, '0')})`, sortScore: urMillis! };
        }
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'both_mc_rt_na':
      if (mc === null && rt === null) {
        return {
          matched: true,
          extraInfo: `Metacritic: N/A | RT: N/A${ur !== null ? ` | Nota: ${fmtUr(ur)}` : ''}`,
          sortScore: urMillis || 0,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_80_to_89':
      if (rt !== null && rt >= 80 && rt <= 89) {
        return { matched: true, extraInfo: `Rotten Tomatoes: ${rt}%`, sortScore: rt };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_6000_to_7000':
      if (ur !== null && urMillis! >= 6000 && urMillis! <= 7000) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_500k_to_1m':
      if (gr !== null && gr >= 500_000 && gr <= 1_000_000) {
        return { matched: true, extraInfo: `Global Reviews: ${fmtGr(gr)}`, sortScore: gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_lt_65_mc_gt_70':
      if (imdb !== null && imdbMillis! < 6500 && mc !== null && mc > 70) {
        return { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | Metacritic: ${mc}`, sortScore: mc * 100 - imdbMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9500':
      if (ur !== null && urMillis! >= 9500) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_100':
      if (gr !== null && gr < 100) {
        return { matched: true, extraInfo: `Global Reviews: ${fmtGr(gr)}`, sortScore: -gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9000_imdb_lt_60':
      if (ur !== null && urMillis! >= 9000 && imdb !== null && imdbMillis! < 6000) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)}`, sortScore: urMillis! - imdbMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'four_scores_spread_40': {
      if (ur !== null && imdb !== null && mc !== null && rt !== null) {
        const norms = [ur, imdb, mc / 10, rt / 10];
        const maxNorm = Math.max(...norms);
        const minNorm = Math.min(...norms);
        const spreadMillis = Math.round((maxNorm - minNorm) * 1000);
        if (spreadMillis >= 4000) {
          return {
            matched: true,
            extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | RT: ${rt}% | MC: ${mc} (Δ ${(spreadMillis / 1000).toFixed(2)} pts)`,
            sortScore: spreadMillis,
          };
        }
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'ur_gt_8000_imdb_lt_60_mc_lt_50_rt_lt_50':
      if (
        ur !== null &&
        urMillis! > 8000 &&
        imdb !== null &&
        imdbMillis! < 6000 &&
        mc !== null &&
        mc < 50 &&
        rt !== null &&
        rt < 50
      ) {
        return {
          matched: true,
          extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | MC: ${mc} | RT: ${rt}%`,
          sortScore: urMillis!,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_eq_100':
      if (rt !== null && rt === 100) {
        return { matched: true, extraInfo: `Rotten Tomatoes: 100%${ur !== null ? ` | Minha Nota: ${fmtUr(ur)}` : ''}`, sortScore: urMillis || 100 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'mc_gte_90':
      if (mc !== null && mc >= 90) {
        return { matched: true, extraInfo: `Metacritic: ${mc}`, sortScore: mc };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_lte_2000_imdb_lt_50':
      if (ur !== null && urMillis! <= 2000 && imdb !== null && imdbMillis! < 5000) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)}`, sortScore: -(urMillis! + imdbMillis!) };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_100_to_500':
      if (gr !== null && gr >= 100 && gr <= 500) {
        return { matched: true, extraInfo: `Global Reviews: ${fmtGr(gr)}`, sortScore: -gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9700':
      if (ur !== null && urMillis! >= 9700) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_90_imdb_80_rt_90_mc_90':
      if (ur !== null && urMillis! >= 9000 && imdb !== null && imdbMillis! >= 8000 && rt !== null && rt >= 90 && mc !== null && mc >= 90) {
        return {
          matched: true,
          extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | RT: ${rt}% | MC: ${mc}`,
          sortScore: urMillis! + mc * 10 + rt * 10,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_8500':
      if (ur !== null && urMillis! >= 8500) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'red_critic_lt_45_ur_gte_8500':
      if (ur !== null && urMillis! >= 8500 && ((mc !== null && mc < 45) || (rt !== null && rt < 45))) {
        const parts = [`Minha Nota: ${fmtUr(ur)}`];
        if (mc !== null) parts.push(`MC: ${mc}`);
        if (rt !== null) parts.push(`RT: ${rt}%`);
        return { matched: true, extraInfo: parts.join(' | '), sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_gte_80_rt_gte_85':
      if (imdb !== null && imdbMillis! >= 8000 && rt !== null && rt >= 85) {
        return { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | RT: ${rt}%`, sortScore: imdbMillis! + rt * 10 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_5k_ur_gte_8500':
      if (gr !== null && gr < 5_000 && ur !== null && urMillis! >= 8500) {
        return { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_lt_50_ur_gte_7500':
      if (imdb !== null && imdbMillis! < 5000 && ur !== null && urMillis! >= 7500) {
        return { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! - imdbMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'checkpoint_777':
      if (
        ur !== null &&
        urMillis! >= 7000 &&
        urMillis! <= 7999 &&
        imdb !== null &&
        imdbMillis! >= 7000 &&
        imdbMillis! <= 7999 &&
        rt !== null &&
        rt >= 70 &&
        rt <= 79 &&
        mc !== null &&
        mc >= 70 &&
        mc <= 79 &&
        gr !== null &&
        gr >= 700_000 &&
        gr <= 799_999
      ) {
        return {
          matched: true,
          extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | RT: ${rt}% | MC: ${mc} | Reviews: ${fmtGr(gr)}`,
          sortScore: urMillis!,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9750':
      if (ur !== null && urMillis! >= 9750) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_90_imdb_80_rt_88_mc_85':
      if (ur !== null && urMillis! >= 9000 && imdb !== null && imdbMillis! >= 8000 && rt !== null && rt >= 88 && mc !== null && mc >= 85) {
        return {
          matched: true,
          extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | RT: ${rt}% | MC: ${mc}`,
          sortScore: urMillis! + mc * 10 + rt * 10,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_100k_ur_gte_8000':
      if (gr !== null && gr < 100_000 && ur !== null && urMillis! >= 8000) {
        return { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'fr_ur_lt_5000':
      if (unCountryDefMap && movieHasCountry(movie, 'fr', unCountryDefMap) && ur !== null && urMillis! < 5000) {
        return { matched: true, extraInfo: `França | Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'xmen_ur_lt_7000':
      if (movieHasTag(movie, 'X-Men') && ur !== null && urMillis! < 7000) {
        return { matched: true, extraInfo: `Tag X-Men | Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'natal_ur_gt_7000':
      if (movieHasTag(movie, 'Natal') && ur !== null && urMillis! > 7000) {
        return { matched: true, extraInfo: `Tag Natal | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'game_rt_lt_50_ur_gte_7000':
      if (movieHasTag(movie, 'Baseado em jogo') && rt !== null && rt < 50 && ur !== null && urMillis! >= 7000) {
        return {
          matched: true,
          extraInfo: `Tag Baseado em jogo | RT: ${rt}% | Minha Nota: ${fmtUr(ur)}`,
          sortScore: urMillis! + (100 - rt),
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'comedia_ur_gte_8500':
      if (movieHasGenre(movie, 'Comédia') && ur !== null && urMillis! >= 8500) {
        return { matched: true, extraInfo: `Comédia | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_imdb_lt_55_outubro':
      if (movieHasGenre(movie, 'Terror') && imdb !== null && imdbMillis! < 5500 && movieInMonth(movie, 10)) {
        return { matched: true, extraInfo: `Terror em Outubro | IMDb: ${fmtImdb(imdb)}`, sortScore: -imdbMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'non_us_gr_gt_1m':
      if (unCountryDefMap && !movieHasCountry(movie, 'us', unCountryDefMap) && gr !== null && gr > 1_000_000) {
        return {
          matched: true,
          extraInfo: `${movie.primaryCountryName || 'Fora dos EUA'} | Reviews: ${fmtGr(gr)}`,
          sortScore: gr,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'br_gr_gt_100k':
      if (unCountryDefMap && movieHasCountry(movie, 'br', unCountryDefMap) && gr !== null && gr > 100_000) {
        return { matched: true, extraInfo: `Brasil | Reviews: ${fmtGr(gr)}`, sortScore: gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'br_gr_lt_1k':
      if (unCountryDefMap && movieHasCountry(movie, 'br', unCountryDefMap) && gr !== null && gr < 1_000) {
        return { matched: true, extraInfo: `Brasil | Reviews: ${fmtGr(gr)}`, sortScore: -gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'a24_ur_gt_8000':
      if (
        (movieHasAnyPattern(getMovieStudios(movie), ['a24']) ||
          movieHasAnyPattern(getMovieDistributors(movie), ['a24'])) &&
        ur !== null &&
        urMillis! > 8000
      ) {
        return { matched: true, extraInfo: `A24 | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_gr_lt_300k':
      if ((Number(movie.oscar_wins) || 0) >= 1 && gr !== null && gr < 300_000) {
        return {
          matched: true,
          extraInfo: `${movie.oscar_wins || 1} Oscar(s) | Reviews: ${fmtGr(gr)}`,
          sortScore: -gr,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'agosto_ur_gt_7000':
      if (movieInMonth(movie, 8) && ur !== null && urMillis! > 7000) {
        return { matched: true, extraInfo: `Visto em Agosto | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gore_rt_gt_90':
      if (movieHasTag(movie, 'Gore') && rt !== null && rt > 90) {
        return {
          matched: true,
          extraInfo: `Tag Gore | RT: ${rt}%${ur !== null ? ` | Minha Nota: ${fmtUr(ur)}` : ''}`,
          sortScore: rt,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'musica_ur_gt_9000':
      if (movieHasGenre(movie, 'Música') && ur !== null && urMillis! > 9000) {
        return { matched: true, extraInfo: `Música | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'marvel_dc_ur_gt_8500':
      if (
        (movieHasTag(movie, 'Marvel') || movieHasTag(movie, 'DC')) &&
        ur !== null &&
        urMillis! > 8500
      ) {
        const heroTag = movieHasTag(movie, 'Marvel') ? 'Marvel' : 'DC';
        return { matched: true, extraInfo: `Tag ${heroTag} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'sk_ur_gte_8000':
      if (movieHasTag(movie, 'SK') && ur !== null && urMillis! >= 8000) {
        return { matched: true, extraInfo: `Tag SK (Stephen King) | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_acclaimed_ur_lte_6000':
      if (
        ((Number(movie.oscar_nominations) || 0) >= 1 || (Number(movie.oscar_wins) || 0) >= 1) &&
        ((rt !== null && rt >= 80) || (imdb !== null && imdbMillis! >= 7500)) &&
        ur !== null &&
        urMillis! <= 6000
      ) {
        const juryInfo = [
          rt !== null ? `RT: ${rt}%` : '',
          imdb !== null ? `IMDb: ${fmtImdb(imdb)}` : '',
        ].filter(Boolean).join(' | ');
        return {
          matched: true,
          extraInfo: `Oscar Aclamado (${juryInfo}) | Minha Nota: ${fmtUr(ur)}`,
          sortScore: -urMillis!,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_ur_gt_8000':
      if (movieHasGenre(movie, 'Terror') && ur !== null && urMillis! > 8000) {
        return { matched: true, extraInfo: `Terror | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'emocionante_abuso_familiar_ur_gt_8000':
      if (movieHasTag(movie, 'Emocionante') && movieHasTag(movie, 'Abuso Familiar') && ur !== null && urMillis! > 8000) {
        return { matched: true, extraInfo: `Emocionante + Abuso Familiar | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'br_drama_ur_gt_9000':
      if (unCountryDefMap && movieHasCountry(movie, 'br', unCountryDefMap) && movieHasGenre(movie, 'Drama') && ur !== null && urMillis! > 9000) {
        return { matched: true, extraInfo: `Brasil • Drama | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_gr_lt_500k':
      if ((Number(movie.oscar_wins) || 0) >= 1 && gr !== null && gr < 500_000) {
        return {
          matched: true,
          extraInfo: `${movie.oscar_wins || 1} Oscar(s) | Reviews: ${fmtGr(gr)}`,
          sortScore: -gr,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'final_epico_ur_gt_9000':
      if (movieHasTag(movie, 'Final Epico') && ur !== null && urMillis! > 9000) {
        return { matched: true, extraInfo: `Final Épico | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'animacao_ur_gt_8500_rt_gt_90':
      if (movieHasGenre(movie, 'Animação') && ur !== null && urMillis! > 8500 && rt !== null && rt > 90) {
        return { matched: true, extraInfo: `Animação | RT: ${rt}% | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! + rt * 10 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'fatos_reais_bio_hist_doc_ur_gt_8500':
      if (
        (movieHasGenre(movie, 'Biografia') || movieHasGenre(movie, 'História') || movieHasGenre(movie, 'Documentário')) &&
        movieHasTag(movie, 'Fatos Reais') &&
        ur !== null &&
        urMillis! > 8500
      ) {
        const matchingGenres = (movie.genres || []).filter((g: string) => ['Biografia', 'História', 'Documentário'].includes(g));
        return { matched: true, extraInfo: `Fatos Reais • ${matchingGenres.join('/')} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'non_us_non_br_gr_lt_50k_ur_gt_8000':
      if (
        unCountryDefMap &&
        !movieHasCountry(movie, 'us', unCountryDefMap) &&
        !movieHasCountry(movie, 'br', unCountryDefMap) &&
        gr !== null &&
        gr < 50_000 &&
        ur !== null &&
        urMillis! > 8000
      ) {
        return {
          matched: true,
          extraInfo: `${movie.primaryCountryName || 'Internacional'} | Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`,
          sortScore: urMillis!,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'blumhouse_terror_suspense_ur_gt_8000':
      if (
        (movieHasAnyPattern(getMovieStudios(movie), ['blumhouse']) ||
          movieHasAnyPattern(getMovieDistributors(movie), ['blumhouse'])) &&
        (movieHasGenre(movie, 'Terror') || movieHasGenre(movie, 'Suspense')) &&
        ur !== null &&
        urMillis! > 8000
      ) {
        const matchedGenre = movieHasGenre(movie, 'Terror') ? 'Terror' : 'Suspense';
        return { matched: true, extraInfo: `Blumhouse • ${matchedGenre} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'dezembro_ur_gte_8500':
      if (movieInMonth(movie, 12) && ur !== null && urMillis! >= 8500) {
        return { matched: true, extraInfo: `Visto em Dezembro | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'top250_ur_lt_7500':
      if (movieHasTag(movie, 'TOP250') && ur !== null && urMillis! < 7500) {
        return { matched: true, extraInfo: `Tag TOP250 | Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_imdb_lt_65_ur_gt_8000':
      if (movieHasGenre(movie, 'Terror') && imdb !== null && imdbMillis! < 6500 && ur !== null && urMillis! > 8000) {
        return { matched: true, extraInfo: `Terror | IMDb: ${fmtImdb(imdb)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! - imdbMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'lgbt_drama_romance_ur_gt_8500_rt_gt_80':
      if (
        (movieHasGenre(movie, 'Drama') || movieHasGenre(movie, 'Romance')) &&
        movieHasTag(movie, 'Personagem LGBT') &&
        ur !== null &&
        urMillis! > 8500 &&
        rt !== null &&
        rt > 80
      ) {
        const matchedGenre = movieHasGenre(movie, 'Drama') ? 'Drama' : 'Romance';
        return {
          matched: true,
          extraInfo: `Personagem LGBT • ${matchedGenre} | RT: ${rt}% | Minha Nota: ${fmtUr(ur)}`,
          sortScore: urMillis! + rt * 10,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_ur_gte_9000':
      if ((Number(movie.oscar_wins) || 0) >= 1 && ur !== null && urMillis! >= 9000) {
        return { matched: true, extraInfo: `${movie.oscar_wins || 1} Oscar(s) | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'santissima_trindade_6_cats': {
      const c1 = ur !== null && urMillis! >= 9000 && imdb !== null && imdbMillis! >= 8000;
      const c2 = (Number(movie.oscar_nominations) || 0) >= 1 || (Number(movie.oscar_wins) || 0) >= 1;
      const c3 = movieHasTag(movie, 'TOP250') || movieHasTag(movie, 'Final Epico');
      const c4 = (movie.genres || []).filter((g: string) => ALL_21_GENRES.includes(g)).length >= 2;
      const c5 =
        (Boolean(movie.primaryCountryCode) ||
          (Array.isArray(movie.countries) && movie.countries.length > 0) ||
          (Array.isArray(movie.coproductionCountries) && movie.coproductionCountries.length > 0)) &&
        movie.month_seen !== null &&
        movie.month_seen !== undefined &&
        Number(movie.month_seen) >= 1 &&
        Number(movie.month_seen) <= 12;

      if (c1 && c2 && c3 && c4 && c5) {
        return {
          matched: true,
          extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | Oscar | ${(movie.genres || []).slice(0, 2).join('/')} | Mês ${movie.month_seen}`,
          sortScore: urMillis! + imdbMillis!,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    default:
      return { matched: false, extraInfo: '', sortScore: 0 };
  }
}


// ==========================================
// HELPERS PARA A CATEGORIA: O RITUAL DO CINÉFILO
// ==========================================
function getMovieRuntime(movie: any): number {
  const r = Number(movie.runtime ?? movie.duracao ?? movie.min);
  return !isNaN(r) && r > 0 ? r : 0;
}

function getMovieReleaseYear(movie: any): number | null {
  const y = Number(movie.release_year ?? movie.ano_lancamento ?? movie.ano);
  return !isNaN(y) && y > 1800 ? y : null;
}

function getMovieYearSeen(movie: any): number | null {
  const y = Number(movie.year_seen ?? movie.ano_visto);
  return !isNaN(y) && y > 1800 ? y : null;
}

function getMoviePlatform(movie: any): string {
  return String(movie.platform ?? movie.plataforma ?? '').trim();
}

function getMovieAudio(movie: any): string {
  return String(movie.audio_type ?? movie.audio ?? '').trim();
}

function isPhysicalMedia(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'bluray' || p === 'dvd';
}

function isCinema(plat: string): boolean {
  return plat.toLowerCase().trim() === 'cinema';
}

function isYouTube(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'youtube';
}

function isHboMax(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'hbomax' || p === 'max' || p === 'hbo';
}

function isNetflix(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'netflix';
}

function isInternet(plat: string): boolean {
  return plat.toLowerCase().trim() === 'internet';
}

function isPrimeVideo(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'primevideo' || p === 'amazonprime' || p === 'amazonprimevideo';
}

function isMyFamilyCine(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'myfamilycine' || p === 'mfc';
}

function isOfficialStreaming(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s+]/g, '');
  return (
    p === 'netflix' ||
    p === 'primevideo' ||
    p === 'amazonprime' ||
    p === 'amazonprimevideo' ||
    p === 'hbomax' ||
    p === 'max' ||
    p === 'disney' ||
    p === 'star' ||
    p === 'appletv'
  );
}

function isFreeStreaming(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'internet' || p === 'myfamilycine' || p === 'mfc' || p === 'youtube';
}

function isInternetOrMfc(plat: string): boolean {
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return p === 'internet' || p === 'myfamilycine' || p === 'mfc';
}

function isDubbed(audio: string): boolean {
  return audio.toLowerCase().includes('dublado');
}

function isSubtitled(audio: string): boolean {
  return audio.toLowerCase().includes('legendado');
}

function isOriginalAudio(audio: string): boolean {
  const a = audio.toLowerCase().trim();
  return a === 'original' || a.includes('idioma original');
}

function isYouTubeSubtitled(plat: string, audio: string): boolean {
  const a = audio.toLowerCase();
  const p = plat.toLowerCase().replace(/[-_\s]/g, '');
  return a.includes('legendado pelo youtube') || (p === 'youtube' && a.includes('legendado'));
}

function evaluateRitualCinefiloMovie(m: any, ruleKey: string): { matched: boolean; extraInfo: string; sortScore: number } {
  const runtime = getMovieRuntime(m);
  const relYear = getMovieReleaseYear(m);
  const yearSeen = getMovieYearSeen(m);
  const plat = getMoviePlatform(m);
  const audio = getMovieAudio(m);

  switch (ruleKey) {
    case 'cinema_count':
      if (isCinema(plat)) {
        return { matched: true, extraInfo: `Assistido no Cinema (${yearSeen || relYear || 'Ano N/I'})`, sortScore: yearSeen || relYear || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'audio_original_count':
      if (isOriginalAudio(audio)) {
        return { matched: true, extraInfo: `Áudio Original (${plat || 'Plataforma N/I'})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_lte_15':
      if (runtime > 0 && runtime <= 15) {
        return { matched: true, extraInfo: `Duração: ${runtime} min`, sortScore: -runtime };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_eq_120':
      if (runtime === 120) {
        return { matched: true, extraInfo: `Duração exata: 120 min`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'physical_media_count':
      if (isPhysicalMedia(plat)) {
        return { matched: true, extraInfo: `Mídia Física: ${plat}`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'youtube_subtitled_count':
      if (isYouTubeSubtitled(plat, audio)) {
        return { matched: true, extraInfo: `YouTube Legendado`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'youtube_count':
      if (isYouTube(plat)) {
        return { matched: true, extraInfo: `YouTube (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_legendado_count':
      if (isCinema(plat) && isSubtitled(audio)) {
        return { matched: true, extraInfo: `Cinema Legendado`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'audio_dublado_count':
      if (isDubbed(audio)) {
        return { matched: true, extraInfo: `Áudio: ${audio}`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'audio_legendado_count':
      if (isSubtitled(audio)) {
        return { matched: true, extraInfo: `Áudio: ${audio}`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_eq_1994':
      if (relYear === 1994) {
        return { matched: true, extraInfo: `Lançado em 1994`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_eq_2012':
      if (relYear === 2012) {
        return { matched: true, extraInfo: `Lançado em 2012`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'same_year_seen_release':
      if (relYear !== null && yearSeen !== null && relYear === yearSeen) {
        return { matched: true, extraInfo: `Lançado e visto em ${relYear}`, sortScore: relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_between_1920_1940':
      if (relYear !== null && relYear >= 1920 && relYear <= 1940) {
        return { matched: true, extraInfo: `Lançado em ${relYear}`, sortScore: relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'prime_video_same_year':
      if (isPrimeVideo(plat) && relYear !== null && yearSeen !== null && relYear === yearSeen) {
        return { matched: true, extraInfo: `Prime Video no lançamento (${relYear})`, sortScore: relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_lte_60':
      if (runtime > 0 && runtime <= 60) {
        return { matched: true, extraInfo: `Duração: ${runtime} min`, sortScore: -runtime };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_gt_150':
      if (runtime > 150) {
        return { matched: true, extraInfo: `Duração: ${runtime} min`, sortScore: runtime };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_gt_180':
      if (runtime > 180) {
        return { matched: true, extraInfo: `Duração épica: ${runtime} min`, sortScore: runtime };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_gt_150min':
      if (isCinema(plat) && runtime > 150) {
        return { matched: true, extraInfo: `Cinema (${runtime} min)`, sortScore: runtime };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'hbo_max_count':
      if (isHboMax(plat)) {
        return { matched: true, extraInfo: `HBO Max (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'netflix_count':
      if (isNetflix(plat)) {
        return { matched: true, extraInfo: `Netflix (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'internet_count':
      if (isInternet(plat)) {
        return { matched: true, extraInfo: `Internet (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'free_streaming_same_year':
      if (isFreeStreaming(plat) && relYear !== null && yearSeen !== null && relYear === yearSeen) {
        return { matched: true, extraInfo: `${plat} no lançamento (${relYear})`, sortScore: relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'seen_after_release_year':
      if (relYear !== null && yearSeen !== null && yearSeen > relYear) {
        return { matched: true, extraInfo: `Lançado em ${relYear}, visto em ${yearSeen} (+${yearSeen - relYear} anos)`, sortScore: yearSeen - relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_lt_1994':
      if (relYear !== null && relYear < 1994) {
        return { matched: true, extraInfo: `Lançado em ${relYear} (antes de 1994)`, sortScore: -relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_lt_1958':
      if (relYear !== null && relYear < 1958) {
        return { matched: true, extraInfo: `Lançado em ${relYear} (antes de 1958)`, sortScore: -relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_1999_or_2000':
      if (relYear === 1999 || relYear === 2000) {
        return { matched: true, extraInfo: `Lançado em ${relYear} (Bug do Milênio)`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_between_2010_2020':
      if (relYear !== null && relYear >= 2010 && relYear <= 2020) {
        return { matched: true, extraInfo: `Lançado em ${relYear}`, sortScore: relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'internet_or_mfc_count':
      if (isInternetOrMfc(plat)) {
        return { matched: true, extraInfo: `${plat}`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'official_streaming_count':
      if (isOfficialStreaming(plat)) {
        return { matched: true, extraInfo: `Streaming Oficial: ${plat}`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'time_capsule_30_years':
      if (relYear !== null && yearSeen !== null && (yearSeen - relYear) >= 30) {
        return { matched: true, extraInfo: `Lançado em ${relYear}, visto em ${yearSeen} (${yearSeen - relYear} anos depois)`, sortScore: yearSeen - relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };


    case 'year_eq_2001':
      if (relYear === 2001) {
        return { matched: true, extraInfo: 'Lançado em 2001', sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_between_1939_1945':
      if (relYear !== null && relYear >= 1939 && relYear <= 1945) {
        return { matched: true, extraInfo: `Segunda Guerra (${relYear})`, sortScore: relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    default:
      return { matched: false, extraInfo: '', sortScore: 0 };
  }
}

function evaluateMultiRitualMovie(
  m: any,
  ruleKey: string,
  unCountryDefMap: Map<string, any>
): { matched: boolean; extraInfo: string; sortScore: number } {
  const runtime = getMovieRuntime(m);
  const relYear = getMovieReleaseYear(m);
  const yearSeen = getMovieYearSeen(m);
  const plat = getMoviePlatform(m);
  const audio = getMovieAudio(m);
  const { ur, imdb, gr } = extractCriticMetrics(m);
  const urMillis = ur !== null ? Math.round(ur * 1000) : null;
  const imdbMillis = imdb !== null ? Math.round(imdb * 1000) : null;

  const fmtUr = (v: number) => v.toFixed(3);
  const fmtImdb = (v: number) => v.toFixed(1);
  const fmtGr = (v: number) => v.toLocaleString('pt-BR');

  switch (ruleKey) {
    case 'cinema_ur_lt_7000':
      if (isCinema(plat) && ur !== null && urMillis! < 7000 && urMillis! > 0) {
        return { matched: true, extraInfo: `Cinema | Minha Nota: ${fmtUr(ur)} (< 7.000)`, sortScore: -urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'a24_ur_lt_6000': {
      const isA24 =
        movieHasAnyPattern(getMovieStudios(m), ['a24']) ||
        movieHasAnyPattern(getMovieDistributors(m), ['a24']);
      if (isA24 && ur !== null && urMillis! < 6000 && urMillis! > 0) {
        return { matched: true, extraInfo: `A24 | Minha Nota: ${fmtUr(ur)} (< 6.000)`, sortScore: -urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'year_1994_seen_august':
      if (relYear === 1994 && movieInMonth(m, 8)) {
        return { matched: true, extraInfo: 'Lançado em 1994 | Visto em Agosto', sortScore: 1994 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'brazil_year_1994':
      if (relYear === 1994 && movieHasCountry(m, 'br', unCountryDefMap)) {
        return { matched: true, extraInfo: 'Brasil | Lançado em 1994', sortScore: 1994 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'animacao_dublada_15':
      if (movieHasGenre(m, 'Animação') && isDubbed(audio)) {
        return { matched: true, extraInfo: `Animação Dublada (${plat || 'Plataforma N/I'})`, sortScore: yearSeen || relYear || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_cinema_internet_outubro_5':
      if (movieHasGenre(m, 'Terror') && (isCinema(plat) || isInternet(plat)) && movieInMonth(m, 10)) {
        return { matched: true, extraInfo: `Terror em Outubro (${plat})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'curta_youtube_5':
      if ((movieHasGenre(m, 'Curta') || movieHasGenre(m, 'Curta-metragem') || movieHasGenre(m, 'Curta Metragem')) && isYouTube(plat)) {
        return { matched: true, extraInfo: 'Curta no YouTube', sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'brasil_cinema_5':
      if (movieHasCountry(m, 'br', unCountryDefMap) && isCinema(plat)) {
        return { matched: true, extraInfo: 'Filme Brasileiro no Cinema', sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_ur_gt_8000_10':
      if (isCinema(plat) && ur !== null && urMillis! > 8000) {
        return { matched: true, extraInfo: `Cinema | Minha Nota: ${fmtUr(ur)} (> 8.000)`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_ferias_julho_dez_10':
      if (isCinema(plat) && (movieInMonth(m, 7) || movieInMonth(m, 12))) {
        return { matched: true, extraInfo: `Cinema nas Férias (${movieInMonth(m, 7) ? 'Julho' : 'Dezembro'})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'biografia_non_us_non_br_5':
      if (movieHasGenre(m, 'Biografia') && !movieHasCountry(m, 'us', unCountryDefMap) && !movieHasCountry(m, 'br', unCountryDefMap)) {
        return { matched: true, extraInfo: `Biografia (${m.primaryCountryName || m.primaryCountryCode || 'Internacional'})`, sortScore: yearSeen || relYear || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'japao_sem_animes_games_terror_5':
      if (
        movieHasCountry(m, 'jp', unCountryDefMap) &&
        !movieHasTag(m, 'Baseado em Anime') &&
        !movieHasTag(m, 'Baseado em jogo') &&
        !movieHasGenre(m, 'Terror') &&
        !movieHasGenre(m, 'Animação')
      ) {
        return { matched: true, extraInfo: 'Japão (Sem Anime/Terror/Game)', sortScore: yearSeen || relYear || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_tag_lgbt_15':
      if (movieHasTag(m, 'Personagem LGBT') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat))) {
        return { matched: true, extraInfo: `Tag Personagem LGBT (${plat})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_tag_crime_real_15':
      if (movieHasTag(m, 'Crime real') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat))) {
        return { matched: true, extraInfo: `Tag Crime real (${plat})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'audio_original_non_us_non_br_5':
      if (isOriginalAudio(audio) && !movieHasCountry(m, 'br', unCountryDefMap) && !movieHasCountry(m, 'us', unCountryDefMap)) {
        return { matched: true, extraInfo: `Idioma Original (${m.primaryCountryName || m.primaryCountryCode || 'Mundo'})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'midia_fisica_ur_gt_8000_15':
      if (isPhysicalMedia(plat) && ur !== null && urMillis! > 8000) {
        return { matched: true, extraInfo: `Mídia Física (${plat}) | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'guerra_historia_gt_150_5':
      if ((movieHasGenre(m, 'Guerra') || movieHasGenre(m, 'História') || movieHasGenre(m, 'Historia')) && runtime > 150) {
        return { matched: true, extraInfo: `Guerra/História | Duração: ${runtime} min`, sortScore: runtime };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'pre_1960_pb_mudo_3':
      if (relYear !== null && relYear < 1960 && (movieHasTag(m, 'Preto e branco') || movieHasTag(m, 'Mudo'))) {
        return { matched: true, extraInfo: `Ano ${relYear} | Preto e branco / Mudo`, sortScore: -relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'blockbuster_estreia_cinema_15':
      if (isCinema(plat) && relYear !== null && yearSeen !== null && relYear === yearSeen && gr !== null && gr > 500_000) {
        return { matched: true, extraInfo: `Cinema na Estreia (${relYear}) | Reviews: ${fmtGr(gr)}`, sortScore: gr };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_anos_80_10':
      if (movieHasGenre(m, 'Terror') && relYear !== null && relYear >= 1980 && relYear <= 1989) {
        return { matched: true, extraInfo: `Terror de ${relYear}`, sortScore: relYear };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_romance_30':
      if (movieHasGenre(m, 'Romance') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat))) {
        return { matched: true, extraInfo: `Romance (${plat})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_sem_gore_30':
      if (movieHasGenre(m, 'Terror') && !movieHasTag(m, 'Gore')) {
        return { matched: true, extraInfo: 'Terror sem Gore', sortScore: yearSeen || relYear || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'netflix_gore_30':
      if (movieHasTag(m, 'Gore') && isNetflix(plat)) {
        return { matched: true, extraInfo: 'Tag Gore na Netflix', sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'minecraft_stack_64': {
      const hasMcTag =
        movieHasTag(m, 'Baseado em jogo') ||
        movieHasTag(m, 'Zumbi') ||
        movieHasTag(m, 'Bruxo') ||
        movieHasTag(m, 'Animais antropomorficos');
      const hasMcGenre = movieHasGenre(m, 'Aventura') || movieHasGenre(m, 'Fantasia');
      if (hasMcTag && hasMcGenre) {
        return { matched: true, extraInfo: 'Minecraft: Tag + Aventura/Fantasia', sortScore: yearSeen || relYear || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'marvel_dc_cinema_20':
      if ((movieHasTag(m, 'Marvel') || movieHasTag(m, 'DC')) && isCinema(plat)) {
        return { matched: true, extraInfo: 'Marvel/DC no Cinema', sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_hidden_gem_10':
      if (
        (isInternet(plat) || isYouTube(plat) || isMyFamilyCine(plat)) &&
        gr !== null && gr > 0 && gr < 50_000 &&
        ur !== null && urMillis! > 8000
      ) {
        return { matched: true, extraInfo: `${plat} | Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_streaming_oficial_20':
      if ((Number(m.oscar_wins) || 0) >= 1 && isOfficialStreaming(plat)) {
        return { matched: true, extraInfo: `${m.oscar_wins} Oscar(s) | Plataforma: ${plat}`, sortScore: Number(m.oscar_wins) || 1 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'gt_180_min_ur_gt_9000_5':
      if (runtime > 180 && ur !== null && urMillis! > 9000) {
        return { matched: true, extraInfo: `Duração: ${runtime} min | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'sony_midia_fisica_10': {
      const isSony =
        movieHasAnyPattern(getMovieStudios(m), ['sony', 'columbia', 'tri-star', 'tristar', 'sony pictures']) ||
        movieHasAnyPattern(getMovieDistributors(m), ['sony', 'columbia', 'tri-star', 'tristar', 'sony pictures']);
      if (isSony && isPhysicalMedia(plat)) {
        return { matched: true, extraInfo: `Sony Pictures em Mídia Física (${plat})`, sortScore: yearSeen || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'pre_1980_ur_gt_8000_imdb_gte_80_15':
      if (relYear !== null && relYear < 1980 && ur !== null && urMillis! > 8000 && imdb !== null && imdbMillis! >= 8000) {
        return { matched: true, extraInfo: `Ano ${relYear} | Minha Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)}`, sortScore: urMillis! + imdbMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_ano_lancamento_ou_mais_um_15': {
      const hasOscar = (Number(m.oscar_nominations) || 0) >= 1 || (Number(m.oscar_wins) || 0) >= 1;
      if (hasOscar && relYear !== null && yearSeen !== null && (yearSeen === relYear || yearSeen === relYear + 1)) {
        return { matched: true, extraInfo: `Oscar (${m.oscar_wins || 0}W/${m.oscar_nominations || 0}N) | Lançado: ${relYear}, Visto: ${yearSeen}`, sortScore: yearSeen };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'dublagem_classica_80_90_30': {
      const isActionAdvComedy = movieHasGenre(m, 'Ação') || movieHasGenre(m, 'Aventura') || movieHasGenre(m, 'Comédia');
      if (isActionAdvComedy && relYear !== null && relYear >= 1980 && relYear <= 1999 && isDubbed(audio)) {
        return { matched: true, extraInfo: `Dublado (${relYear}) | Sessão da Tarde`, sortScore: yearSeen || relYear || 0 };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'exodia_7_categorias_5': {
      const isNonUsNonBr = !movieHasCountry(m, 'us', unCountryDefMap) && !movieHasCountry(m, 'br', unCountryDefMap);
      const isJanOrDec = movieInMonth(m, [1, 12]);
      const has2Tags = (Array.isArray(m.tags) ? m.tags.length : 0) >= 2;
      const has2Genres = (Array.isArray(m.genres) ? m.genres.length : 0) >= 2;
      const hasOscar = (Number(m.oscar_nominations) || 0) >= 1 || (Number(m.oscar_wins) || 0) >= 1;
      const isUrGte9 = ur !== null && urMillis! >= 9000;
      const isRitualMet = runtime > 120 && (isCinema(plat) || isPhysicalMedia(plat));

      if (isNonUsNonBr && isJanOrDec && has2Tags && has2Genres && hasOscar && isUrGte9 && isRitualMet) {
        return {
          matched: true,
          extraInfo: `Exodia 7 Cats | ${m.primaryCountryName || 'Mundo'} | Mês ${m.month_seen} | Nota: ${fmtUr(ur)} | ${runtime}m | ${plat}`,
          sortScore: urMillis!,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'celso_russomanno_streaming_ur_lt_6000_30':
      if (isOfficialStreaming(plat) && ur !== null && urMillis! < 6000 && urMillis! > 0) {
        return { matched: true, extraInfo: `Streaming Oficial (${plat}) | Minha Nota: ${fmtUr(ur)} (< 6.000)`, sortScore: -urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    default:
      return { matched: false, extraInfo: '', sortScore: 0 };
  }
}

type PreviousTrophyStateMap = Map<
  string,
  {
    is_unlocked: boolean;
    unlocked_at: string | null;
    test_override: boolean | null;
    progress_current: number;
    progress_target: number;
    progress_percentage: number;
  }
>;

type WorldChallengePayload = Awaited<ReturnType<typeof buildWorldChallengePayload>>;

function cloneWorldDataWithoutMovie(
  worldData: WorldChallengePayload,
  excludedMovieId: number
): WorldChallengePayload {
  const nextCatalogMovies = (worldData.catalogMovies || []).filter(
    (m) => Number(m.movie_id) !== Number(excludedMovieId)
  );
  const nextCountries = (worldData.countries || []).map((c) => {
    const nextCandidates = (c.candidates || []).filter(
      (m) => Number(m.movie_id) !== Number(excludedMovieId)
    );
    const championRemoved = c.champion && Number(c.champion.movie_id) === Number(excludedMovieId);
    const nextChampion = championRemoved ? nextCandidates[0] || null : c.champion;
    const nextStatus: 'conquered' | 'wishlist' | 'unconquered' = nextChampion
      ? 'conquered'
      : c.wishlist
      ? 'wishlist'
      : 'unconquered';
    return {
      ...c,
      candidates: nextCandidates,
      totalCandidates: nextCandidates.length,
      champion: nextChampion,
      status: nextStatus,
    };
  });
  return {
    ...worldData,
    catalogMovies: nextCatalogMovies,
    countries: nextCountries,
  };
}

function buildLastActivityEntries(
  getPrev: (id: string) => { is_unlocked?: boolean; progress_current?: number } | undefined,
  evaluatedTrophies: EvaluatedTrophy[]
): TrophyLastActivityEntry[] {
  const entries: TrophyLastActivityEntry[] = [];
  for (const ev of evaluatedTrophies) {
    if (ev.test_override !== null) continue;
    const prev = getPrev(ev.id);
    const prevCount = prev?.progress_current || 0;
    const wasUnlocked = Boolean(prev?.is_unlocked);
    const unlockedNow = !wasUnlocked && Boolean(ev.is_unlocked);
    const diff = Math.max(0, ev.progress_current - prevCount);
    if (unlockedNow || diff > 0) {
      entries.push({
        trophyId: ev.id,
        previousCount: prevCount,
        currentCount: ev.progress_current,
        increasedBy: diff > 0 ? diff : 1,
        unlockedNow,
      });
    }
  }
  return entries;
}

function evaluateDefinitionsFromWorldData(
  worldData: WorldChallengePayload,
  previousStateMap: PreviousTrophyStateMap,
  markNew: boolean
): { evaluatedTrophies: EvaluatedTrophy[]; progressedTrophiesRaw: ProgressedTrophy[] } {
  const unCountriesMap = new Map<string, ChallengeCountryEntry>();
  worldData.countries.forEach((c) => unCountriesMap.set(c.code.toLowerCase(), c));

  // Mapa de países oficiais para metadados (nome, continente, etc.)
  const unCountryDefMap = new Map(UN_COUNTRIES_195.map((c) => [c.code.toLowerCase(), c]));

  // Monta mapa de filmes por país a partir de catalogMovies do worldChallengeService
  const moviesByCountryCode = new Map<string, any[]>();
  const catalogMovies = worldData.catalogMovies;
  const totalCatalogMoviesCount = worldData.catalogMovies.length;

  for (const movie of worldData.catalogMovies) {
    const matchedCodes = new Set<string>();
    if (movie.primaryCountryCode) {
      matchedCodes.add(movie.primaryCountryCode.toLowerCase());
    }
    if (Array.isArray(movie.coproductionCountries)) {
      for (const coprod of movie.coproductionCountries) {
        if (coprod.code) {
          matchedCodes.add(coprod.code.toLowerCase());
        }
      }
    }

    for (const code of matchedCodes) {
      if (!moviesByCountryCode.has(code)) {
        moviesByCountryCode.set(code, []);
      }
      moviesByCountryCode.get(code)!.push(movie);
    }
  }

  const evaluatedTrophies: EvaluatedTrophy[] = [];
  const progressedTrophiesRaw: ProgressedTrophy[] = [];

  // Helper para buscar filme representativo do país
  const getRepresentativeMovie = (code: string) => {
    const unEntry = unCountriesMap.get(code.toLowerCase());
    if (unEntry?.champion) return unEntry.champion;
    const movies = moviesByCountryCode.get(code.toLowerCase()) || [];
    return movies.length > 0 ? movies[0] : null;
  };

  // Avalia troféus padrão (todos exceto Platina, que depende dos outros)
  const standardDefinitions = TROPHY_DEFINITIONS.filter(
    (t) => t.tier !== 'platinum' && t.target_type !== 'platinum_dynamic' && t.target_type !== 'platinum_all_category'
  );

  for (const def of standardDefinitions) {
    let progressCurrent = 0;
    let progressTarget = def.target_value;
    let isMet = false;
    const checklist: TrophyChecklistItem[] = [];

    switch (def.target_type) {
      case 'country_movie_count': {
        const cCode = String(def.target_metadata?.countryCode || '').toLowerCase();
        const cName = def.target_metadata?.countryName || unCountryDefMap.get(cCode)?.name || cCode.toUpperCase();
        const movies = moviesByCountryCode.get(cCode) || [];
        progressTarget = def.target_value;

        if (progressTarget === 1) {
          const rep = movies[0] || getRepresentativeMovie(cCode);
          const hasMovie = movies.length > 0;
          progressCurrent = hasMovie ? 1 : 0;
          isMet = hasMovie;
          checklist.push({
            code: cCode,
            name: cName,
            flag: cCode,
            required: 1,
            current: hasMovie ? 1 : 0,
            conquered: hasMovie,
            movie_title: rep?.title || null,
            movie_year: rep?.release_year || null,
            poster_url: rep?.poster_url || null,
          });
        } else {
          const res = buildMovieSlotsChecklist(
            movies,
            progressTarget,
            (m: any) => m.user_rating ? `Nota: ${m.user_rating}` : `Filme de ${cName}`,
            `Pendente: filme de ${cName}`,
            cCode
          );
          progressCurrent = res.progressCurrent;
          checklist.push(...res.checklist);
          isMet = progressCurrent >= progressTarget;
        }
        break;
      }

      case 'country_list': {
        let codes: string[] = def.target_metadata?.countryCodes || [];
        // Se for por continente (ex: Conquistador da Europa, Ásia, etc.)
        if (def.target_metadata?.continent) {
          const contName = def.target_metadata.continent;
          codes = UN_COUNTRIES_195.filter((c) => c.continent === contName).map((c) => c.code.toLowerCase());
        }
        progressTarget = codes.length;
        let conqueredCount = 0;

        for (const code of codes) {
          const cCode = code.toLowerCase();
          const unDef = unCountryDefMap.get(cCode);
          const unEntry = unCountriesMap.get(cCode);
          const isConq = unEntry?.status === 'conquered' || (moviesByCountryCode.get(cCode)?.length || 0) > 0;
          if (isConq) conqueredCount++;

          const rep = getRepresentativeMovie(cCode);
          checklist.push({
            code: cCode,
            name: unDef?.name || cCode.toUpperCase(),
            flag: cCode,
            required: 1,
            current: isConq ? 1 : 0,
            conquered: isConq,
            movie_title: rep?.title || null,
            movie_year: rep?.release_year || null,
            poster_url: rep?.poster_url || null,
          });
        }

        progressCurrent = conqueredCount;
        isMet = conqueredCount >= progressTarget;
        break;
      }

      case 'country_movie_counts': {
        const reqs: Array<{ code: string; name: string; min: number }> = def.target_metadata?.requirements || [];
        let totalCurrent = 0;
        let allSatisfied = true;

        for (const req of reqs) {
          const cCode = req.code.toLowerCase();
          const movies = moviesByCountryCode.get(cCode) || [];
          const count = movies.length;
          const met = count >= req.min;
          if (!met) allSatisfied = false;
          totalCurrent += Math.min(count, req.min);

          const rep = movies[0] || getRepresentativeMovie(cCode);
          checklist.push({
            code: cCode,
            name: `${req.name} (${count}/${req.min} filmes)`,
            flag: cCode,
            required: req.min,
            current: Math.min(count, req.min),
            conquered: met,
            movie_title: rep?.title || null,
            movie_year: rep?.release_year || null,
            poster_url: rep?.poster_url || null,
            extra_info: met ? 'Requisito atingido' : `Falta(m) ${req.min - count} filme(s)`,
          });
        }

        progressCurrent = totalCurrent;
        isMet = allSatisfied;
        break;
      }

      case 'multi_country_movie_sum': {
        const codes: string[] = def.target_metadata?.countryCodes || [];
        const names: string[] = def.target_metadata?.countryNames || [];
        let sum = 0;

        codes.forEach((code, idx) => {
          const cCode = code.toLowerCase();
          const movies = moviesByCountryCode.get(cCode) || [];
          sum += movies.length;
          checklist.push({
            code: cCode,
            name: `${names[idx] || cCode.toUpperCase()}: ${movies.length} filme(s)`,
            flag: cCode,
            required: def.target_value,
            current: movies.length,
            conquered: movies.length > 0,
          });
        });

        progressCurrent = Math.min(sum, progressTarget);
        isMet = sum >= progressTarget;
        break;
      }

      case 'continent_movie_count': {
        const contName = def.target_metadata?.continent || 'Europa';
        const euroCodes = new Set(
          UN_COUNTRIES_195.filter((c) => c.continent === contName).map((c) => c.code.toLowerCase())
        );

        const continentMovies: any[] = [];
        for (const movie of worldData.catalogMovies) {
          const codes = new Set<string>();
          if (movie.primaryCountryCode) codes.add(movie.primaryCountryCode.toLowerCase());
          if (Array.isArray(movie.coproductionCountries)) {
            movie.coproductionCountries.forEach((cp: any) => cp.code && codes.add(cp.code.toLowerCase()));
          }
          const hasContinentCountry = Array.from(codes).some((cd) => euroCodes.has(cd));
          if (hasContinentCountry) {
            continentMovies.push(movie);
          }
        }

        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          continentMovies,
          progressTarget,
          () => `Filme da ${contName}`,
          `Pendente: filme da ${contName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'conquered_countries_count': {
        const excludeCode = def.target_metadata?.excludeCode?.toLowerCase();
        let validConquered = 0;

        for (const [code, entry] of unCountriesMap.entries()) {
          if (excludeCode && code === excludeCode) continue;
          if (entry.status === 'conquered') {
            validConquered++;
            if (checklist.length < 30) {
              checklist.push({
                code,
                name: entry.name,
                flag: code,
                required: 1,
                current: 1,
                conquered: true,
                movie_title: entry.champion?.title || null,
                movie_year: entry.champion?.release_year || null,
                poster_url: entry.champion?.poster_url || null,
              });
            }
          }
        }

        progressCurrent = Math.min(validConquered, progressTarget);
        isMet = validConquered >= progressTarget;

        if (validConquered < progressTarget) {
          checklist.unshift({
            name: `Progresso Geral: ${validConquered} de ${progressTarget} países conquistados`,
            required: progressTarget,
            current: validConquered,
            conquered: false,
          });
        }
        break;
      }

      case 'rarity_tier_coverage': {
        const tiers: CountryRarityTier[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
        const tierLabels: Record<CountryRarityTier, string> = {
          common: 'Comum (Potência Cinematográfica)',
          rare: 'Raro (Consolidado Autoral)',
          epic: 'Épico (Produção Esporádica)',
          legendary: 'Lendário (Poucos Títulos)',
          mythic: 'Mítico (Os 18 Mais Difíceis)',
        };

        let tiersCovered = 0;
        for (const tr of tiers) {
          const conqCountry = Array.from(unCountriesMap.values()).find(
            (c) => c.rarityTier === tr && c.status === 'conquered'
          );
          const has = Boolean(conqCountry);
          if (has) tiersCovered++;

          checklist.push({
            name: tierLabels[tr],
            flag: conqCountry?.code || null,
            required: 1,
            current: has ? 1 : 0,
            conquered: has,
            movie_title: conqCountry ? `${conqCountry.name}: ${conqCountry.champion?.title || 'Conquistado'}` : null,
            movie_year: conqCountry?.champion?.release_year || null,
            poster_url: conqCountry?.champion?.poster_url || null,
          });
        }

        progressCurrent = tiersCovered;
        progressTarget = 5;
        isMet = tiersCovered >= 5;
        break;
      }

      case 'rarity_mythic_count': {
        const mythicCountries = Array.from(unCountriesMap.values()).filter((c) => c.rarityTier === 'mythic');
        const conqMythics = mythicCountries.filter((c) => c.status === 'conquered');
        progressCurrent = Math.min(conqMythics.length, progressTarget);
        isMet = conqMythics.length >= progressTarget;

        if (conqMythics.length > 0) {
          conqMythics.forEach((c) => {
            checklist.push({
              code: c.code,
              name: c.name,
              flag: c.code,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: c.champion?.title || null,
              movie_year: c.champion?.release_year || null,
              poster_url: c.champion?.poster_url || null,
            });
          });
        } else {
          checklist.push({
            name: 'Conquiste pelo menos 1 dos 18 países Míticos no Desafio 195',
            required: 1,
            current: 0,
            conquered: false,
          });
        }
        break;
      }

      case 'rarity_all_mythic': {
        const mythicCountries = Array.from(unCountriesMap.values()).filter((c) => c.rarityTier === 'mythic');
        progressTarget = mythicCountries.length || 18;
        let conqCount = 0;

        for (const c of mythicCountries) {
          const isConq = c.status === 'conquered';
          if (isConq) conqCount++;

          checklist.push({
            code: c.code,
            name: c.name,
            flag: c.code,
            required: 1,
            current: isConq ? 1 : 0,
            conquered: isConq,
            movie_title: c.champion?.title || null,
            movie_year: c.champion?.release_year || null,
            poster_url: c.champion?.poster_url || null,
          });
        }

        progressCurrent = conqCount;
        isMet = conqCount >= progressTarget;
        break;
      }

      case 'global_movie_and_country_count': {
        const minMovies = def.target_metadata?.minMovies || 1000;
        const minCountries = def.target_metadata?.minCountries || 100;

        const totalCountriesWithMovies = Array.from(moviesByCountryCode.keys()).length;
        const moviesMet = totalCatalogMoviesCount >= minMovies;
        const countriesMet = totalCountriesWithMovies >= minCountries;
        isMet = moviesMet && countriesMet;

        const movieProgressScore = Math.min(totalCatalogMoviesCount, minMovies) / minMovies;
        const countryProgressScore = Math.min(totalCountriesWithMovies, minCountries) / minCountries;
        progressCurrent = Math.round(((movieProgressScore + countryProgressScore) / 2) * 100);
        progressTarget = 100;

        checklist.push({
          name: `1.000 Filmes no Catálogo`,
          required: minMovies,
          current: totalCatalogMoviesCount,
          conquered: moviesMet,
          extra_info: `${totalCatalogMoviesCount} / ${minMovies} filmes`,
        });
        checklist.push({
          name: `100 Países Diferentes com Filmes`,
          required: minCountries,
          current: totalCountriesWithMovies,
          conquered: countriesMet,
          extra_info: `${totalCountriesWithMovies} / ${minCountries} países representados`,
        });
        break;
      }

      
      // ==========================================
      // ==========================================
      // 🧬 DNA CINÉFILO: CASOS DE AVALIAÇÃO
      // ==========================================
      case 'tag_movie_count': {
        const targetTag = def.target_metadata?.tags?.[0] || '';
        const matchingMovies = catalogMovies.filter((m) => movieHasTag(m, targetTag));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Tag [${targetTag}]`,
          `Pendente: tag [${targetTag}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_double_and': {
        const reqTags: string[] = def.target_metadata?.tags || [];
        const tag1 = reqTags[0] || '';
        const tag2 = reqTags[1] || '';
        const matchingMovies = catalogMovies.filter((m) => movieHasTag(m, tag1) && movieHasTag(m, tag2));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Tags: [${tag1}] + [${tag2}]`,
          `Pendente: [${tag1}] + [${tag2}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_hybrid_country': {
        const reqTag = def.target_metadata?.tags?.[0] || '';
        const cCode = def.target_metadata?.countryCode || '';
        const cName = def.target_metadata?.countryName || cCode.toUpperCase();
        const matchingMovies = catalogMovies.filter((m) => movieHasTag(m, reqTag) && movieHasCountry(m, cCode, unCountryDefMap));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Tag [${reqTag}] + País [${cName}]`,
          `Pendente: ${cName} com [${reqTag}]`,
          cCode.toLowerCase()
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_hybrid_multi_country': {
        const reqTags: string[] = def.target_metadata?.tags || [];
        const cCodes: string[] = def.target_metadata?.countryCodes || [];
        const cName = def.target_metadata?.countryName || 'Países Selecionados';
        const matchingMovies = catalogMovies.filter((m) => {
          const hasAllTags = reqTags.every((t) => movieHasTag(m, t));
          const hasAnyCountry = cCodes.some((code) => movieHasCountry(m, code, unCountryDefMap));
          return hasAllTags && hasAnyCountry;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${reqTags.join(' + ')} em ${cName}`,
          `Pendente: ${cName} com ${reqTags.join(' + ')}`,
          cCodes[0]?.toLowerCase()
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_hybrid_continent': {
        const reqTag = def.target_metadata?.tags?.[0] || '';
        const continent = def.target_metadata?.continent || 'África';
        const matchingMovies = catalogMovies.filter((m) => movieHasTag(m, reqTag) && movieInContinent(m, continent, unCountryDefMap));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Tag [${reqTag}] na ${continent}`,
          `Pendente: filme da ${continent} com [${reqTag}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_hybrid_exclude_country': {
        const reqTag = def.target_metadata?.tags?.[0] || '';
        const excludeCode = def.target_metadata?.excludeCountryCode || 'us';
        const matchingMovies = catalogMovies.filter((m) => movieHasTag(m, reqTag) && !movieHasCountry(m, excludeCode, unCountryDefMap));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `[${reqTag}] fora dos EUA`,
          `Pendente: filme com [${reqTag}] fora dos EUA`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_hybrid_asian_horror': {
        const horrorTags = def.target_metadata?.horrorTags || ['Fantasma', 'Demônio', 'Gore', 'Zumbi'];
        const countryCodes = def.target_metadata?.countryCodes || ['jp', 'kr', 'th', 'id'];
        const matchingMovies = catalogMovies.filter((m) => {
          const hasHorror = horrorTags.some((t: string) => movieHasTag(m, t));
          const hasAsianCountry = countryCodes.some((code: string) => movieHasCountry(m, code, unCountryDefMap));
          return hasHorror && hasAsianCountry;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Terror Asiático',
          'Pendente: terror no Japão/Coreia/Tailândia/Indonésia'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_multi_or_and': {
        const mainTag = def.target_metadata?.mainTag || '';
        const anyOfTags: string[] = def.target_metadata?.anyOfTags || [];
        const matchingMovies = catalogMovies.filter((m) => {
          const hasMain = movieHasTag(m, mainTag);
          const hasAny = anyOfTags.some((t: string) => movieHasTag(m, t));
          return hasMain && hasAny;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Combinação [${mainTag}] + [${anyOfTags.join('/')}]`,
          `Pendente: [${mainTag}] + [${anyOfTags.join('/')}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_pool_sum': {
        const poolTags: string[] = def.target_metadata?.tags || [];
        const matchingMovies = catalogMovies.filter((m) => poolTags.some((t: string) => movieHasTag(m, t)));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matched = poolTags.filter((t: string) => movieHasTag(m, t));
            return `Tag(s): ${matched.join(', ')}`;
          },
          'Pendente: filme com uma das tags exigidas'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_checklist_quota': {
        const quotas: Array<{ tag: string; count: number }> = def.target_metadata?.quotas || [];
        let totalCurrent = 0;
        let totalTarget = 0;
        let allQuotasMet = true;

        quotas.forEach((q) => {
          const countInTag = catalogMovies.filter((m) => movieHasTag(m, q.tag)).length;
          const isQMet = countInTag >= q.count;
          if (!isQMet) allQuotasMet = false;
          totalCurrent += Math.min(countInTag, q.count);
          totalTarget += q.count;

          checklist.push({
            name: `Tag [${q.tag}] (${q.count} filmes)`,
            required: q.count,
            current: Math.min(countInTag, q.count),
            conquered: isQMet,
            extra_info: `${Math.min(countInTag, q.count)} / ${q.count} filme(s)`,
          });
        });

        progressTarget = totalTarget || def.target_value;
        progressCurrent = Math.min(totalCurrent, progressTarget);
        isMet = allQuotasMet && progressCurrent >= progressTarget;
        break;
      }

      case 'tag_all_39_coverage': {
        const minPerTag = Number(def.target_metadata?.minPerTag || 1);
        let tagsFulfilled = 0;

        ALL_39_TAGS.forEach((tag) => {
          const countInTag = catalogMovies.filter((m) => movieHasTag(m, tag)).length;
          const isFulfilled = countInTag >= minPerTag;
          if (isFulfilled) tagsFulfilled++;

          checklist.push({
            name: `Tag [${tag}]`,
            required: minPerTag,
            current: Math.min(countInTag, minPerTag),
            conquered: isFulfilled,
            extra_info: isFulfilled ? `${countInTag} filme(s)` : 'Pendente (0 filmes)',
          });
        });

        progressTarget = 39;
        progressCurrent = Math.min(tagsFulfilled, progressTarget);
        isMet = tagsFulfilled >= progressTarget;
        break;
      }

      
      // ==========================================
      // 🎬 ANATOMIA DO CINEMA & 📅 DATA LIMITE & CROSSOVERS
      // ==========================================
      case 'genre_count': {
        const genre = def.target_metadata?.genre || '';
        const matchingMovies = catalogMovies.filter((m) => movieHasGenre(m, genre));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Gênero: ${genre}`,
          `Pendente: gênero ${genre}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_all_and': {
        const reqGenres: string[] = def.target_metadata?.genres || [];
        const matchingMovies = catalogMovies.filter((m) => movieHasAllGenres(m, reqGenres));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Gêneros: ${reqGenres.join(' + ')}`,
          `Pendente: ${reqGenres.join(' + ')}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_and_or': {
        const mainGenre = def.target_metadata?.mainGenre || '';
        const anyOf: string[] = def.target_metadata?.anyOfGenres || [];
        const matchingMovies = catalogMovies.filter((m) => movieHasGenre(m, mainGenre) && movieHasAnyGenre(m, anyOf));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${mainGenre} com ${anyOf.join('/')}`,
          `Pendente: ${mainGenre} com ${anyOf.join('/')}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_all_21_coverage': {
        const minPerGenre = Number(def.target_metadata?.minPerGenre || 1);
        let genresFulfilled = 0;
        progressTarget = 21;

        ALL_21_GENRES.forEach((g) => {
          const count = catalogMovies.filter((m) => movieHasGenre(m, g)).length;
          const met = count >= minPerGenre;
          if (met) genresFulfilled++;
          checklist.push({
            name: `Gênero: ${g}`,
            required: minPerGenre,
            current: Math.min(count, minPerGenre),
            conquered: met,
            extra_info: met ? `${count} filme(s) catalogado(s)` : `Pendente (${count}/${minPerGenre})`,
          });
        });

        progressCurrent = Math.min(genresFulfilled, progressTarget);
        isMet = genresFulfilled >= progressTarget;
        break;
      }

      case 'movie_min_genre_count': {
        const minGenres = Number(def.target_metadata?.minGenresPerMovie || 3);
        const matchingMovies = catalogMovies.filter((m) => Array.isArray(m.genres) && m.genres.length >= minGenres);
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${m.genres.length} gêneros: ${m.genres.join(', ')}`,
          `Pendente: filme com >= ${minGenres} gêneros`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_quotas': {
        const quotas: Array<{ genre: string; count: number }> = def.target_metadata?.quotas || [];
        let totalCurrent = 0;
        let totalTarget = 0;
        let allQuotasMet = true;

        quotas.forEach((q) => {
          const countInGenre = catalogMovies.filter((m) => movieHasGenre(m, q.genre)).length;
          const isQMet = countInGenre >= q.count;
          if (!isQMet) allQuotasMet = false;
          totalCurrent += Math.min(countInGenre, q.count);
          totalTarget += q.count;

          checklist.push({
            name: `Gênero: ${q.genre} (${q.count} filmes)`,
            required: q.count,
            current: Math.min(countInGenre, q.count),
            conquered: isQMet,
            extra_info: `${Math.min(countInGenre, q.count)} / ${q.count} filme(s)`,
          });
        });

        progressTarget = totalTarget || def.target_value;
        progressCurrent = Math.min(totalCurrent, progressTarget);
        isMet = allQuotasMet && progressCurrent >= progressTarget;
        break;
      }

      case 'genre_distinct_threshold': {
        const minPer = def.target_metadata?.minPerGenre || 25;
        const reqDistinct = def.target_metadata?.requiredDistinctGenres || 15;
        let qualifyingCount = 0;
        progressTarget = reqDistinct;

        ALL_21_GENRES.forEach((g) => {
          const count = catalogMovies.filter((m) => movieHasGenre(m, g)).length;
          const met = count >= minPer;
          if (met) qualifyingCount++;
          checklist.push({
            name: `Gênero: ${g}`,
            required: minPer,
            current: Math.min(count, minPer),
            conquered: met,
            extra_info: `${count}/${minPer} filmes`,
          });
        });

        progressCurrent = Math.min(qualifyingCount, progressTarget);
        isMet = qualifyingCount >= progressTarget;
        break;
      }

      case 'month_movie_count': {
        const month = def.target_metadata?.month;
        const matchingMovies = catalogMovies.filter((m) => movieInMonth(m, month));
        progressTarget = def.target_value;
        const monthName = MONTH_NAMES[month] || `Mês ${month}`;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Assistido em ${MONTH_NAMES[m.month_seen] || m.month_seen}`,
          `Pendente: assistido em ${monthName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'all_12_months_coverage': {
        const minPerMonth = Number(def.target_metadata?.minPerMonth || 1);
        let monthsFulfilled = 0;
        progressTarget = 12;

        for (let mo = 1; mo <= 12; mo++) {
          const count = catalogMovies.filter((m) => movieInMonth(m, mo)).length;
          const met = count >= minPerMonth;
          if (met) monthsFulfilled++;
          checklist.push({
            name: `${MONTH_NAMES[mo] || mo}`,
            required: minPerMonth,
            current: Math.min(count, minPerMonth),
            conquered: met,
            extra_info: `${count} / ${minPerMonth} filme(s)`,
          });
        }

        progressCurrent = Math.min(monthsFulfilled, progressTarget);
        isMet = monthsFulfilled >= progressTarget;
        break;
      }

      case 'genre_month': {
        const genre = def.target_metadata?.genre || '';
        const month = def.target_metadata?.month;
        const monthName = MONTH_NAMES[month] || `Mês ${month}`;
        const matchingMovies = catalogMovies.filter((m) => movieHasGenre(m, genre) && movieInMonth(m, month));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${genre} em ${monthName}`,
          `Pendente: ${genre} em ${monthName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_month': {
        const tag = def.target_metadata?.tag || '';
        const month = def.target_metadata?.month;
        const monthName = MONTH_NAMES[month] || `Mês ${month}`;
        const matchingMovies = catalogMovies.filter((m) => movieHasTag(m, tag) && movieInMonth(m, month));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Tag [${tag}] em ${monthName}`,
          `Pendente: tag [${tag}] em ${monthName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_month_range':
      case 'tag_months': {
        const tag = def.target_metadata?.tag || '';
        const months: number[] = def.target_metadata?.months || [];
        const matchingMovies = catalogMovies.filter((m) => movieHasTag(m, tag) && movieInMonth(m, months));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Tag [${tag}] em ${MONTH_NAMES[m.month_seen] || m.month_seen}`,
          `Pendente: tag [${tag}] nos meses exigidos`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_or_month': {
        const genres: string[] = def.target_metadata?.genres || [];
        const month = def.target_metadata?.month;
        const monthName = MONTH_NAMES[month] || `Mês ${month}`;
        const matchingMovies = catalogMovies.filter((m) => movieHasAnyGenre(m, genres) && movieInMonth(m, month));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${genres.join('/')} em ${monthName}`,
          `Pendente: ${genres.join('/')} em ${monthName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_or_month': {
        const tags: string[] = def.target_metadata?.tags || [];
        const month = def.target_metadata?.month;
        const monthName = MONTH_NAMES[month] || `Mês ${month}`;
        const matchingMovies = catalogMovies.filter((m) => tags.some((t) => movieHasTag(m, t)) && movieInMonth(m, month));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${tags.join('/')} em ${monthName}`,
          `Pendente: ${tags.join('/')} em ${monthName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'country_genres_or': {
        const cCode = def.target_metadata?.countryCode;
        const cName = def.target_metadata?.countryName || cCode;
        const genres: string[] = def.target_metadata?.genres || [];
        const matchingMovies = catalogMovies.filter((m) => movieHasCountry(m, cCode, unCountryDefMap) && movieHasAnyGenre(m, genres));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${cName} com ${genres.join('/')}`,
          `Pendente: ${cName} com ${genres.join('/')}`,
          cCode
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'country_genres_and': {
        const cCode = def.target_metadata?.countryCode;
        const cName = def.target_metadata?.countryName || cCode;
        const genres: string[] = def.target_metadata?.genres || [];
        const matchingMovies = catalogMovies.filter((m) => movieHasCountry(m, cCode, unCountryDefMap) && movieHasAllGenres(m, genres));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${cName} com ${genres.join(' + ')}`,
          `Pendente: ${cName} com ${genres.join(' + ')}`,
          cCode
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'country_genre': {
        const cCode = def.target_metadata?.countryCode;
        const cName = def.target_metadata?.countryName || cCode;
        const genre = def.target_metadata?.genre || '';
        const matchingMovies = catalogMovies.filter((m) => movieHasCountry(m, cCode, unCountryDefMap) && movieHasGenre(m, genre));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${cName} (${genre})`,
          `Pendente: filme de ${cName} (${genre})`,
          cCode
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_tag_and': {
        const genre = def.target_metadata?.genre || '';
        const tag = def.target_metadata?.tag || '';
        const matchingMovies = catalogMovies.filter((m) => movieHasGenre(m, genre) && movieHasTag(m, tag));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${genre} + Tag [${tag}]`,
          `Pendente: ${genre} + Tag [${tag}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_tag_or': {
        const genre = def.target_metadata?.genre || '';
        const anyTags: string[] = def.target_metadata?.anyOfTags || [];
        const matchingMovies = catalogMovies.filter((m) => movieHasGenre(m, genre) && anyTags.some((t) => movieHasTag(m, t)));
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${genre} + Tag [${anyTags.join('/')}]`,
          `Pendente: ${genre} + Tag [${anyTags.join('/')}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'triple_combo_japan': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            movieHasCountry(m, 'jp', unCountryDefMap) &&
            movieHasGenre(m, 'Animação') &&
            movieHasGenre(m, 'Ficção Científica') &&
            (movieHasTag(m, 'Baseado em Anime') || movieHasTag(m, 'Dystopia'))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Japão: Animação + Ficção Científica',
          'Pendente: Japão (Animação + SciFi)',
          'jp'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'triple_combo_brasil': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            movieHasCountry(m, 'br', unCountryDefMap) &&
            (movieHasGenre(m, 'Crime') || movieHasGenre(m, 'Policial')) &&
            (movieHasTag(m, 'Crime real') || movieHasTag(m, 'Fatos Reais'))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Brasil: Crime/Policial + Fatos Reais',
          'Pendente: Brasil (Crime/Policial)',
          'br'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'triple_combo_europa': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            movieInContinent(m, 'Europa', unCountryDefMap) &&
            movieHasGenre(m, 'Terror') &&
            (movieHasTag(m, 'Demônio') || movieHasTag(m, 'Religião'))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Europa: Terror + Demônio/Religião',
          'Pendente: Europa (Terror + Demônio/Religião)'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'triple_combo_romenia_dracula': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            movieHasCountry(m, 'ro', unCountryDefMap) &&
            movieHasGenre(m, 'Terror') &&
            movieHasTag(m, 'Vampiro')
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Romênia: Terror + Vampiro',
          'Pendente: Romênia (Terror + Vampiro)',
          'ro'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'quad_natal_classico': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            (movieHasCountry(m, 'us', unCountryDefMap) ||
              movieHasCountry(m, 'ca', unCountryDefMap) ||
              movieHasCountry(m, 'gb', unCountryDefMap)) &&
            (movieHasGenre(m, 'Comédia') || movieHasGenre(m, 'Família')) &&
            movieHasTag(m, 'Natal') &&
            movieInMonth(m, 12)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'EUA/Canadá/UK + Comédia/Família + Natal (Dezembro)',
          'Pendente: Natal Clássico'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'quad_pride_sem_fronteiras': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            !movieHasCountry(m, 'us', unCountryDefMap) &&
            (movieHasGenre(m, 'Drama') || movieHasGenre(m, 'Romance')) &&
            movieHasTag(m, 'Personagem LGBT') &&
            movieInMonth(m, 6)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Fora dos EUA + Drama/Romance + LGBT (Junho)',
          'Pendente: Orgulho sem Fronteiras'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'quad_halloween_eua': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            movieHasCountry(m, 'us', unCountryDefMap) &&
            movieHasGenre(m, 'Terror') &&
            ['Gore', 'Fantasma', 'Demônio', 'Bruxo', 'Zumbi', 'SK'].some((t) => movieHasTag(m, t)) &&
            movieInMonth(m, 10)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'EUA + Terror + Outubro',
          'Pendente: Halloween Americano',
          'us'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'quad_outubro_macabro_mundo': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            !movieHasCountry(m, 'us', unCountryDefMap) &&
            (movieHasGenre(m, 'Terror') || movieHasGenre(m, 'Suspense')) &&
            ['Criança Malvada', 'Demônio', 'Fantasma', 'Gore', 'Vampiro', 'Zumbi'].some((t) => movieHasTag(m, t)) &&
            movieInMonth(m, 10)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Mundial + Terror/Suspense + Outubro',
          'Pendente: Outubro Macabro Mundial'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'quad_natal_macabro': {
        const matchingMovies = catalogMovies.filter(
          (m) =>
            (movieHasGenre(m, 'Terror') || movieHasGenre(m, 'Suspense')) &&
            movieHasTag(m, 'Natal') &&
            movieInMonth(m, 12)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Terror/Suspense + Natal (Dezembro)',
          'Pendente: Natal Macabro'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      // ==========================================
      // 🌌 UNIVERSOS & SAGAS (Franquias e Coleções)
      // ==========================================
      case 'franchise_movie_list': {
        const reqMovies: Array<{ name: string; patterns: string[]; year?: number; exclude?: string[] }> =
          def.target_metadata?.movies || [];
        progressTarget = reqMovies.length || def.target_value || 1;
        let countConquered = 0;
        const usedMovieIds = new Set<string | number>();

        reqMovies.forEach((req, idx) => {
          const matchedMovie = catalogMovies.find(
            (m: any) => !usedMovieIds.has(m.movie_id || (m as any).id) && matchFranchiseMovie(m, req)
          );
          if (matchedMovie) {
            usedMovieIds.add(matchedMovie.movie_id || (matchedMovie as any).id);
            countConquered++;
            checklist.push({
              id: `req_${idx + 1}`,
              name: req.name,
              flag: matchedMovie.primaryCountryCode ? matchedMovie.primaryCountryCode.toLowerCase() : null,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: matchedMovie.title,
              movie_year: matchedMovie.release_year,
              poster_url: matchedMovie.poster_url,
              extra_info: 'Conquistado',
            });
          } else {
            checklist.push({
              id: `req_${idx + 1}`,
              name: req.name,
              flag: null,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: 'Pendente',
            });
          }
        });

        progressCurrent = countConquered;
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'mcu_phase_count': {
        const reqPhases = def.target_value || 3;
        progressTarget = reqPhases;
        let completedPhases = 0;

        for (let p = 1; p <= 6; p++) {
          const phaseDef = TROPHY_DEFINITIONS.find((t) => t.id === `us_mcu_phase_${p}`);
          const phaseMovies = phaseDef?.target_metadata?.movies || [];
          let phaseDoneCount = 0;
          phaseMovies.forEach((req: any) => {
            if (catalogMovies.some((m: any) => matchFranchiseMovie(m, req))) {
              phaseDoneCount++;
            }
          });
          const isPhaseMet = phaseMovies.length > 0 && phaseDoneCount >= phaseMovies.length;
          if (isPhaseMet) completedPhases++;

          checklist.push({
            id: `phase_${p}`,
            name: `MCU Fase ${p} (${phaseMovies.length} filmes)`,
            flag: null,
            required: phaseMovies.length,
            current: phaseDoneCount,
            conquered: isPhaseMet,
            extra_info: isPhaseMet ? '100% Concluída' : `${phaseDoneCount}/${phaseMovies.length} filmes`,
          });
        }

        progressCurrent = completedPhases;
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'dc_showcase_count': {
        const matchingMovies = catalogMovies.filter((m: any) => {
          const t1 = cleanMovieTitleStr(m.title);
          const t2 = cleanMovieTitleStr(m.original_title);
          return t1.includes('dc showcase') || t2.includes('dc showcase');
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Curta DC Showcase',
          'Pendente: curta DC Showcase'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'dc_animated_feature_count': {
        const matchingMovies = catalogMovies.filter((m: any) => {
          const isDC = movieHasTag(m, 'DC');
          const isAnimation = movieHasGenre(m, 'Animacao') || movieHasGenre(m, 'Animação');
          const t1 = cleanMovieTitleStr(m.title);
          const t2 = cleanMovieTitleStr(m.original_title);
          const isShowcase = t1.includes('dc showcase') || t2.includes('dc showcase');
          return isDC && isAnimation && !isShowcase;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Longa Animado DC (Excl. Showcase)',
          'Pendente: longa de animação DC'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      // ==========================================
      // 🕴️ A MÁFIA DE HOLLYWOOD
      // ==========================================
      case 'hollywood_oscar_winner_count': {
        const minWins = def.target_metadata?.minWins || 1;
        const matchingMovies = catalogMovies.filter(
          (m: any) => (Number(m.oscar_wins) || 0) >= minWins
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${m.oscar_wins} vitórias / ${m.oscar_nominations || 0} indicações no Oscar`,
          'Pendente: Filme Ganhador do Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_oscar_exact_ratio': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            (Number(m.oscar_nominations) || 0) === def.target_metadata?.nominations &&
            (Number(m.oscar_wins) || 0) === def.target_metadata?.wins
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => '3 indicações e 3 vitórias (100% de aproveitamento)',
          'Pendente: 3 de 3 no Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_oscar_nominations_min': {
        const minNoms = def.target_metadata?.minNominations || 10;
        const matchingMovies = catalogMovies.filter(
          (m: any) => (Number(m.oscar_nominations) || 0) >= minNoms
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${m.oscar_nominations} indicações (${m.oscar_wins || 0} vitórias)`,
          'Pendente: Filme com 10+ indicações ao Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_oscar_wins_min': {
        const minWins = def.target_metadata?.minWins || 8;
        const matchingMovies = catalogMovies.filter(
          (m: any) => (Number(m.oscar_wins) || 0) >= minWins
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${m.oscar_wins} estatuetas conquistadas`,
          'Pendente: Filme com 8+ vitórias no Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_oscar_nominated_unwon_count': {
        const matchingMovies = catalogMovies.filter(
          (m: any) => (Number(m.oscar_nominations) || 0) >= 1 && (Number(m.oscar_wins) || 0) === 0
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${m.oscar_nominations} indicações (0 vitórias)`,
          'Pendente: Indicado ao Oscar sem vitória'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_oscar_5_noms_unwon_count': {
        const matchingMovies = catalogMovies.filter(
          (m: any) => (Number(m.oscar_nominations) || 0) >= 5 && (Number(m.oscar_wins) || 0) === 0
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${m.oscar_nominations} indicações (0 vitórias - Maior Azarão)`,
          'Pendente: 5+ indicações e 0 vitórias'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_oscar_5_noms_5_wins_count': {
        const matchingMovies = catalogMovies.filter(
          (m: any) => (Number(m.oscar_nominations) || 0) >= 5 && (Number(m.oscar_wins) || 0) >= 5
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${m.oscar_wins} vitórias em ${m.oscar_nominations} indicações (Quina Dourada)`,
          'Pendente: 5+ vitórias no Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_director_count': {
        const patterns = def.target_metadata?.patterns || [];
        const dirName = def.target_metadata?.director || 'Diretor';
        const matchingMovies = catalogMovies.filter((m: any) =>
          movieHasAnyPattern(getMovieDirectors(m), patterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Direção: ${dirName}`,
          `Pendente: filme de ${dirName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_writer_count': {
        const patterns = def.target_metadata?.patterns || [];
        const writerName = def.target_metadata?.writer || 'Roteirista';
        const matchingMovies = catalogMovies.filter((m: any) =>
          movieHasAnyPattern(getMovieWriters(m), patterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Roteiro: ${writerName}`,
          `Pendente: roteiro de ${writerName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_director_or_writer_count': {
        const patterns = def.target_metadata?.patterns || [];
        const personName = def.target_metadata?.person || 'Autor';
        const checkProducers = Boolean(def.target_metadata?.checkProducers);
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDirectors(m), patterns) ||
            movieHasAnyPattern(getMovieWriters(m), patterns) ||
            (checkProducers && movieHasAnyPattern(getMovieProducers(m), patterns))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const isDir = movieHasAnyPattern(getMovieDirectors(m), patterns);
            const isWri = movieHasAnyPattern(getMovieWriters(m), patterns);
            const isProd = checkProducers && movieHasAnyPattern(getMovieProducers(m), patterns);
            const roles: string[] = [];
            if (isDir) roles.push('Direção');
            if (isWri) roles.push('Roteiro');
            if (isProd) roles.push('Produção');
            return `${roles.join(' & ') || 'Crédito'}: ${personName}`;
          },
          `Pendente: filme de ${personName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_distributor_studio_count': {
        const patterns = def.target_metadata?.patterns || [];
        const companyName = def.target_metadata?.company || 'Estúdio/Distribuidora';
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDistributors(m), patterns) ||
            movieHasAnyPattern(getMovieStudios(m), patterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => companyName,
          `Pendente: ${companyName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_studio_count': {
        const patterns = def.target_metadata?.patterns || [];
        const studioName = def.target_metadata?.studio || 'Estúdio';
        const matchingMovies = catalogMovies.filter((m: any) =>
          movieHasAnyPattern(getMovieStudios(m), patterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Estúdio: ${studioName}`,
          `Pendente: produção de ${studioName}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_studio_or_tag_count': {
        const patterns = def.target_metadata?.patterns || [];
        const tag = def.target_metadata?.tag;
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieStudios(m), patterns) ||
            (tag && movieHasTag(m, tag))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'DC Studios / Tag DC',
          'Pendente: filme/produção DC'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_director_writer_or_studio_count': {
        const personPatterns = def.target_metadata?.personPatterns || [];
        const studioPatterns = def.target_metadata?.studioPatterns || [];
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDirectors(m), personPatterns) ||
            movieHasAnyPattern(getMovieWriters(m), personPatterns) ||
            movieHasAnyPattern(getMovieStudios(m), studioPatterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'J.J. Abrams / Bad Robot',
          'Pendente: J.J. Abrams / Bad Robot'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_director_or_studio_count': {
        const directorPatterns = def.target_metadata?.directorPatterns || [];
        const studioPatterns = def.target_metadata?.studioPatterns || [];
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDirectors(m), directorPatterns) ||
            movieHasAnyPattern(getMovieStudios(m), studioPatterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'M. Night Shyamalan / Blinding Edge',
          'Pendente: M. Night Shyamalan'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_director_pool_count': {
        const patterns = def.target_metadata?.patterns || [];
        const matchingMovies = catalogMovies.filter((m: any) =>
          movieHasAnyPattern(getMovieDirectors(m), patterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const dirs = Array.from(getMovieDirectors(m)).map((d) =>
              d.replace(/\b\w/g, (c) => c.toUpperCase())
            );
            return `Direção: ${dirs.join(', ')}`;
          },
          'Pendente: Mestre do Terror Moderno'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_same_director_writer_count': {
        const matchingMovies = catalogMovies.filter((m: any) => {
          const dirs = getMovieDirectors(m);
          const wrs = getMovieWriters(m);
          for (const d of dirs) {
            if (wrs.has(d)) return true;
          }
          return false;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const dirs = getMovieDirectors(m);
            const wrs = getMovieWriters(m);
            const shared = Array.from(dirs).find((d) => wrs.has(d));
            return shared
              ? `Autor: ${shared.replace(/\b\w/g, (c) => c.toUpperCase())}`
              : 'Diretor e Roteirista';
          },
          'Pendente: Diretor & Roteirista mesmo autor'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_unique_directors_quota': {
        const minFilms = def.target_metadata?.minFilmsPerDirector || 3;
        const dirMap = new Map<string, any[]>();
        for (const m of catalogMovies) {
          const dirs = getMovieDirectors(m);
          for (const d of dirs) {
            if (!dirMap.has(d)) dirMap.set(d, []);
            dirMap.get(d)!.push(m);
          }
        }
        const qualifiedDirs = Array.from(dirMap.entries())
          .filter(([_, list]) => list.length >= minFilms)
          .sort((a, b) => b[1].length - a[1].length);

        progressTarget = def.target_value;
        progressCurrent = qualifiedDirs.length;
        isMet = progressCurrent >= progressTarget;

        const cappedDirs = qualifiedDirs.slice(0, progressTarget);
        cappedDirs.forEach(([dirName, list], idx) => {
          checklist.push({
            id: `dir_${idx + 1}`,
            name: dirName.replace(/\b\w/g, (c) => c.toUpperCase()),
            flag: null,
            required: minFilms,
            current: list.length,
            conquered: true,
            extra_info: `${list.length} filmes no catálogo`,
          });
        });

        if (cappedDirs.length < progressTarget) {
          for (let i = cappedDirs.length; i < progressTarget; i++) {
            checklist.push({
              id: `dir_slot_${i + 1}`,
              name: `Diretor #${i + 1} (${minFilms}+ filmes)`,
              flag: null,
              required: minFilms,
              current: 0,
              conquered: false,
              extra_info: `Pendente: necessita de ${minFilms} filmes dirigidos`,
            });
          }
        }
        break;
      }

      case 'hollywood_unique_writers_quota': {
        const minFilms = def.target_metadata?.minFilmsPerWriter || 3;
        const writerMap = new Map<string, any[]>();
        for (const m of catalogMovies) {
          const wrs = getMovieWriters(m);
          for (const w of wrs) {
            if (!writerMap.has(w)) writerMap.set(w, []);
            writerMap.get(w)!.push(m);
          }
        }
        const qualifiedWriters = Array.from(writerMap.entries())
          .filter(([_, list]) => list.length >= minFilms)
          .sort((a, b) => b[1].length - a[1].length);

        progressTarget = def.target_value;
        progressCurrent = qualifiedWriters.length;
        isMet = progressCurrent >= progressTarget;

        const cappedWriters = qualifiedWriters.slice(0, progressTarget);
        cappedWriters.forEach(([writerName, list], idx) => {
          checklist.push({
            id: `writer_${idx + 1}`,
            name: writerName.replace(/\b\w/g, (c) => c.toUpperCase()),
            flag: null,
            required: minFilms,
            current: list.length,
            conquered: true,
            extra_info: `${list.length} filmes no catálogo`,
          });
        });

        if (cappedWriters.length < progressTarget) {
          for (let i = cappedWriters.length; i < progressTarget; i++) {
            checklist.push({
              id: `writer_slot_${i + 1}`,
              name: `Roteirista #${i + 1} (${minFilms}+ filmes)`,
              flag: null,
              required: minFilms,
              current: 0,
              conquered: false,
              extra_info: `Pendente: necessita de ${minFilms} filmes escritos`,
            });
          }
        }
        break;
      }

      case 'hollywood_oscar_dual_quota': {
        const winners = catalogMovies.filter((m: any) => (Number(m.oscar_wins) || 0) >= 1);
        const nominees = catalogMovies.filter((m: any) => (Number(m.oscar_nominations) || 0) >= 1);
        const wCapped = Math.min(30, winners.length);
        const nCapped = Math.min(60, nominees.length);
        progressTarget = 90;
        progressCurrent = wCapped + nCapped;
        isMet = winners.length >= 30 && nominees.length >= 60;

        checklist.push({
          id: 'oscar_winners_quota',
          name: '🏆 Filmes Ganhadores do Oscar (mínimo 1 vitória cada)',
          flag: null,
          required: 30,
          current: wCapped,
          conquered: winners.length >= 30,
          extra_info: `${winners.length} de 30 filmes conquistados (${Math.min(100, Math.round((winners.length / 30) * 100))}%)`,
        });

        checklist.push({
          id: 'oscar_nominees_quota',
          name: '🎬 Filmes Indicados ao Oscar (mínimo 1 indicação cada)',
          flag: null,
          required: 60,
          current: nCapped,
          conquered: nominees.length >= 60,
          extra_info: `${nominees.length} de 60 filmes conquistados (${Math.min(100, Math.round((nominees.length / 60) * 100))}%)`,
        });
        break;
      }

      case 'hollywood_conglomerates_count': {
        const patterns = def.target_metadata?.patterns || [];
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieStudios(m), patterns) ||
            movieHasAnyPattern(getMovieDistributors(m), patterns)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Conglomerado de Hollywood',
          'Pendente: Filme de Grande Conglomerado'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hollywood_oscar_or_quota': {
        const winners = catalogMovies.filter((m: any) => (Number(m.oscar_wins) || 0) >= 1);
        const nominees = catalogMovies.filter((m: any) => (Number(m.oscar_nominations) || 0) >= 1);
        const pctW = Math.min(100, Math.round((winners.length / 50) * 100));
        const pctN = Math.min(100, Math.round((nominees.length / 120) * 100));
        progressTarget = 100;
        progressCurrent = Math.max(pctW, pctN);
        isMet = winners.length >= 50 || nominees.length >= 120;

        checklist.push({
          id: 'opt_winners_50',
          name: '🏆 Opção A: 50 Filmes Ganhadores do Oscar',
          flag: null,
          required: 50,
          current: Math.min(50, winners.length),
          conquered: winners.length >= 50,
          extra_info: `${winners.length} de 50 filmes (${pctW}%)`,
        });

        checklist.push({
          id: 'opt_nominees_120',
          name: '🎬 Opção B: 120 Filmes Indicados ao Oscar',
          flag: null,
          required: 120,
          current: Math.min(120, nominees.length),
          conquered: nominees.length >= 120,
          extra_info: `${nominees.length} de 120 filmes (${pctN}%)`,
        });
        break;
      }

      // ==========================================
      // 🔥 PACOTE ESPECIAL MULTICATEGORIA & PETRÓLEO
      // ==========================================
      case 'hybrid_director_month': {
        const patterns = def.target_metadata?.directorPatterns || [];
        const month = def.target_metadata?.month || 12;
        const matchingMovies = catalogMovies.filter(
          (m: any) => movieHasAnyPattern(getMovieDirectors(m), patterns) && movieInMonth(m, month)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Direção: Michael Bay (Assistido em ${MONTH_NAMES[month] || 'Dezembro'})`,
          `Pendente: filme de Michael Bay em ${MONTH_NAMES[month] || 'Dezembro'}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_country_oscar_winner': {
        const code = def.target_metadata?.countryCode || 'br';
        const minWins = def.target_metadata?.minWins || 1;
        const matchingMovies = catalogMovies.filter(
          (m: any) => movieHasCountry(m, code, unCountryDefMap) && (Number(m.oscar_wins) || 0) >= minWins
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Brasil + ${m.oscar_wins} vitórias no Oscar`,
          'Pendente: Filme brasileiro vencedor do Oscar',
          code
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_genre_oscar_winner': {
        const genre = def.target_metadata?.genre || 'Terror';
        const minWins = def.target_metadata?.minWins || 1;
        const matchingMovies = catalogMovies.filter(
          (m: any) => movieHasGenre(m, genre) && (Number(m.oscar_wins) || 0) >= minWins
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Gênero ${genre} + ${m.oscar_wins} vitórias no Oscar`,
          `Pendente: Filme de ${genre} vencedor do Oscar`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_genre_studio_month': {
        const genre = def.target_metadata?.genre || 'Terror';
        const patterns = def.target_metadata?.studioPatterns || ['blumhouse'];
        const month = def.target_metadata?.month || 10;
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasGenre(m, genre) &&
            (movieHasAnyPattern(getMovieStudios(m), patterns) || movieHasAnyPattern(getMovieDistributors(m), patterns)) &&
            movieInMonth(m, month)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Terror Blumhouse (Outubro)`,
          'Pendente: Terror Blumhouse em Outubro'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'world_countries_checklist': {
        const reqCountries: Array<{ code: string; name: string }> =
          def.target_metadata?.countries || [];
        progressTarget = reqCountries.length;
        let countDone = 0;

        reqCountries.forEach((rc) => {
          const cCode = rc.code.toLowerCase();
          const repMovie = getRepresentativeMovie(cCode);
          const hasMovie = Boolean(repMovie);
          if (hasMovie) countDone++;

          checklist.push({
            id: `country_${cCode}`,
            name: `${rc.name} (${cCode.toUpperCase()})`,
            flag: cCode,
            required: 1,
            current: hasMovie ? 1 : 0,
            conquered: hasMovie,
            movie_title: repMovie ? repMovie.title : undefined,
            movie_year: repMovie ? repMovie.release_year : undefined,
            poster_url: repMovie ? repMovie.poster_url : undefined,
            extra_info: hasMovie ? 'Conquistado' : 'Pendente (0 filmes assistidos)',
          });
        });

        progressCurrent = countDone;
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_non_us_oscar_winner': {
        const minWins = def.target_metadata?.minWins || 1;
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            m.primaryCountryCode &&
            m.primaryCountryCode.toLowerCase() !== 'us' &&
            (Number(m.oscar_wins) || 0) >= minWins
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${(m.primaryCountryName || m.primaryCountryCode || '').toUpperCase()} + ${m.oscar_wins} vitórias no Oscar`,
          'Pendente: Filme fora dos EUA vencedor do Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_genre_tag': {
        const genre = def.target_metadata?.genre || 'Romance';
        const tag = def.target_metadata?.tag || 'Personagem LGBT';
        const matchingMovies = catalogMovies.filter(
          (m: any) => movieHasGenre(m, genre) && movieHasTag(m, tag)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `${genre} + Tag ${tag}`,
          `Pendente: ${genre} com tag ${tag}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_director_genres': {
        const patterns = def.target_metadata?.directorPatterns || ['alfred hitchcock', 'hitchcock'];
        const anyOfGenres = def.target_metadata?.anyOfGenres || ['Suspense', 'Mistério'];
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDirectors(m), patterns) &&
            anyOfGenres.some((g: string) => movieHasGenre(m, g))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Direção: Alfred Hitchcock (Suspense/Mistério)',
          'Pendente: Filme de Hitchcock (Suspense/Mistério)'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_warren_invocaversus': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasGenre(m, 'Terror') &&
            movieHasTag(m, 'invocaversus') &&
            (movieHasAnyPattern(getMovieDirectors(m), ['james wan']) ||
              movieHasAnyPattern(getMovieWriters(m), ['james wan']) ||
              movieHasAnyPattern(getMovieStudios(m), ['new line']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['new line']))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Terror + Tag "invocaversus" + James Wan / New Line',
          'Pendente: Filme do Universo Invocação do Mal'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_pixar_emotional_animals': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasGenre(m, 'Animação') &&
            (movieHasAnyPattern(getMovieStudios(m), ['disney', 'pixar', 'walt disney', 'buena vista']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['disney', 'pixar', 'walt disney', 'buena vista'])) &&
            (movieHasTag(m, 'Emocionante') || movieHasTag(m, 'Animais antropomorficos'))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Disney/Pixar Animação + Emocionante / Animais',
          'Pendente: Animação Disney/Pixar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_gore_twisted_lionsgate': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasGenre(m, 'Terror') &&
            movieHasTag(m, 'Gore') &&
            (movieHasAnyPattern(getMovieStudios(m), ['twisted pictures', 'lionsgate']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['twisted pictures', 'lionsgate']))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Terror + Tag Gore + Twisted Pictures/Lionsgate',
          'Pendente: Terror Gore Twisted/Lionsgate'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_brazil_comedy_producers': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasCountry(m, 'br', unCountryDefMap) &&
            movieHasGenre(m, 'Comédia') &&
            (movieHasAnyPattern(getMovieStudios(m), ['downtown filmes', 'globo filmes', 'paris filmes']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['downtown filmes', 'globo filmes', 'paris filmes']))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Brasil Comédia + Downtown / Globo / Paris Filmes',
          'Pendente: Comédia nacional de grande estúdio',
          'br'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_disney_vacation_july_dec': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            (movieHasGenre(m, 'Animação') || movieHasGenre(m, 'Família')) &&
            (movieHasAnyPattern(getMovieStudios(m), ['disney', 'pixar', 'walt disney', 'buena vista']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['disney', 'pixar', 'walt disney', 'buena vista'])) &&
            (movieInMonth(m, 7) || movieInMonth(m, 12))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Disney/Pixar Animação/Família (Assistido em ${MONTH_NAMES[Number(m.month_seen)] || 'Férias'})`,
          'Pendente: Disney/Pixar em Julho ou Dezembro'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_hitchcock_black_white': {
        const patterns = def.target_metadata?.directorPatterns || ['alfred hitchcock', 'hitchcock'];
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDirectors(m), patterns) &&
            movieHasTag(m, 'Preto e branco')
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Alfred Hitchcock + Tag Preto e branco',
          'Pendente: Clássico P&B de Hitchcock'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_disney_fox_horror': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasGenre(m, 'Terror') &&
            (movieHasAnyPattern(getMovieStudios(m), ['disney', 'pixar', 'walt disney', 'buena vista', '20th century', 'twentieth century']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['disney', 'pixar', 'walt disney', 'buena vista', '20th century', 'twentieth century']))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Terror + Disney / Buena Vista / 20th Century Fox',
          'Pendente: Terror Disney ou Fox'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_a24_horror_tags': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            (movieHasAnyPattern(getMovieStudios(m), ['a24']) || movieHasAnyPattern(getMovieDistributors(m), ['a24'])) &&
            (movieHasGenre(m, 'Terror') || movieHasGenre(m, 'Suspense')) &&
            (movieHasTag(m, 'Bruxo') || movieHasTag(m, 'Demônio') || movieHasTag(m, 'Gore') || movieHasTag(m, 'Trágico'))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'A24 + Terror/Suspense + Tag Bruxo/Demônio/Gore/Trágico',
          'Pendente: Terror Cult A24'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_top250_oscar_winner': {
        const matchingMovies = catalogMovies.filter(
          (m: any) => movieHasTag(m, 'TOP250') && (Number(m.oscar_wins) || 0) >= 1
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `TOP 250 IMDb + ${m.oscar_wins} vitórias no Oscar`,
          'Pendente: Filme TOP250 Vencedor do Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_sk_oscar': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasTag(m, 'SK') &&
            ((Number(m.oscar_nominations) || 0) >= 1 || (Number(m.oscar_wins) || 0) >= 1)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Stephen King (SK) + ${m.oscar_nominations || 0} noms / ${m.oscar_wins || 0} vitórias`,
          'Pendente: Filme de Stephen King indicado/vencedor do Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_zombie_game_constantin_pwsa': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasTag(m, 'Zumbi') &&
            movieHasTag(m, 'Baseado em jogo') &&
            (movieHasAnyPattern(getMovieStudios(m), ['constantin']) ||
              movieHasAnyPattern(getMovieDirectors(m), ['paul w.s. anderson', 'paul ws anderson', 'paul w. s. anderson', 'paul w s anderson']) ||
              movieHasAnyPattern(getMovieWriters(m), ['paul w.s. anderson', 'paul ws anderson', 'paul w. s. anderson', 'paul w s anderson']))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Zumbi + Baseado em jogo + Constantin / Paul W.S. Anderson',
          'Pendente: Zumbi de Videogame Constantin/PWSA'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_drama_oscar_jan_feb_mar': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            (movieHasGenre(m, 'Drama') || movieHasGenre(m, 'Biografia')) &&
            ((Number(m.oscar_nominations) || 0) >= 1 || (Number(m.oscar_wins) || 0) >= 1) &&
            (movieInMonth(m, 1) || movieInMonth(m, 2) || movieInMonth(m, 3))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Drama/Biografia Oscar (${MONTH_NAMES[Number(m.month_seen)] || 'Verão'})`,
          'Pendente: Drama indicado ao Oscar em Jan/Fev/Mar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_shyamalan_twist': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDirectors(m), ['m. night shyamalan', 'shyamalan']) &&
            (movieHasGenre(m, 'Suspense') || movieHasGenre(m, 'Mistério')) &&
            (movieHasTag(m, 'Final Epico') || movieHasTag(m, 'Super Poder'))
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'M. Night Shyamalan + Suspense/Mistério + Final Épico / Super Poder',
          'Pendente: Plot Twist de Shyamalan'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_warner_dc_vs_disney_marvel': {
        const matchingA = catalogMovies.filter(
          (m: any) =>
            (movieHasGenre(m, 'Ação') || movieHasGenre(m, 'Aventura')) &&
            movieHasTag(m, 'DC') &&
            (movieHasAnyPattern(getMovieStudios(m), ['warner']) || movieHasAnyPattern(getMovieDistributors(m), ['warner']))
        );
        const matchingB = catalogMovies.filter(
          (m: any) =>
            (movieHasGenre(m, 'Ação') || movieHasGenre(m, 'Aventura')) &&
            movieHasTag(m, 'Marvel') &&
            (movieHasAnyPattern(getMovieStudios(m), ['disney', 'buena vista', 'sony', 'columbia']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['disney', 'buena vista', 'sony', 'columbia']))
        );
        const curA = Math.min(15, matchingA.length);
        const curB = Math.min(15, matchingB.length);
        progressTarget = 30;
        progressCurrent = curA + curB;
        isMet = matchingA.length >= 15 && matchingB.length >= 15;

        checklist.push({
          id: 'dc_warner_quota',
          name: '🦇 DC Comics na Warner Bros. (Ação/Aventura)',
          flag: null,
          required: 15,
          current: curA,
          conquered: matchingA.length >= 15,
          extra_info: `${matchingA.length} de 15 filmes conquistados (${Math.min(100, Math.round((matchingA.length / 15) * 100))}%)`,
        });

        checklist.push({
          id: 'marvel_disney_sony_quota',
          name: '🛡️ Marvel Studios na Disney / Sony (Ação/Aventura)',
          flag: null,
          required: 15,
          current: curB,
          conquered: matchingB.length >= 15,
          extra_info: `${matchingB.length} de 15 filmes conquistados (${Math.min(100, Math.round((matchingB.length / 15) * 100))}%)`,
        });
        break;
      }

      case 'hybrid_drama_bio_hist_oscar_winner': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            (movieHasGenre(m, 'Drama') || movieHasGenre(m, 'Biografia') || movieHasGenre(m, 'História')) &&
            (Number(m.oscar_wins) || 0) >= 1
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Drama/Biografia/História + ${m.oscar_wins} vitórias no Oscar`,
          'Pendente: Drama/Biografia/História Vencedor do Oscar'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_halloween_masters': {
        const matchingMovies = catalogMovies.filter(
          (m: any) =>
            movieHasGenre(m, 'Terror') &&
            (movieHasTag(m, 'Fantasma') ||
              movieHasTag(m, 'Demônio') ||
              movieHasTag(m, 'Gore') ||
              movieHasTag(m, 'Vampiro') ||
              movieHasTag(m, 'Zumbi')) &&
            (movieHasAnyPattern(getMovieStudios(m), ['blumhouse', 'a24', 'new line', 'lionsgate']) ||
              movieHasAnyPattern(getMovieDistributors(m), ['blumhouse', 'a24', 'new line', 'lionsgate'])) &&
            movieInMonth(m, 10)
        );
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => 'Terror Sobrenatural de Grande Estúdio (Outubro)',
          'Pendente: Terror Sobrenatural em Outubro'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_seven_deadly_sins': {
        const matching1 = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieDirectors(m), ['paul w.s. anderson', 'paul ws anderson', 'paul w. s. anderson', 'paul w s anderson']) ||
            movieHasAnyPattern(getMovieWriters(m), ['paul w.s. anderson', 'paul ws anderson', 'paul w. s. anderson', 'paul w s anderson'])
        );
        const matching2 = catalogMovies.filter((m: any) => movieHasCountry(m, 'us', unCountryDefMap));
        const matching3 = catalogMovies.filter((m: any) => movieHasAnyPattern(getMovieWriters(m), ['bob kane']));
        const matching4 = catalogMovies.filter((m: any) => movieHasTag(m, 'Criança Malvada'));
        const matching5 = catalogMovies.filter((m: any) => movieHasGenre(m, 'Curta'));
        const matching6 = catalogMovies.filter(
          (m: any) =>
            movieHasAnyPattern(getMovieStudios(m), ['blumhouse', 'disney', 'pixar', 'walt disney', 'buena vista']) ||
            movieHasAnyPattern(getMovieDistributors(m), ['blumhouse', 'disney', 'pixar', 'walt disney', 'buena vista'])
        );
        const matching7 = catalogMovies.filter((m: any) => movieHasTag(m, 'Natal'));

        const cur1 = Math.min(7, matching1.length);
        const cur2 = Math.min(7, matching2.length);
        const cur3 = Math.min(7, matching3.length);
        const cur4 = Math.min(7, matching4.length);
        const cur5 = Math.min(7, matching5.length);
        const cur6 = Math.min(7, matching6.length);
        const cur7 = Math.min(7, matching7.length);

        progressTarget = 49;
        progressCurrent = cur1 + cur2 + cur3 + cur4 + cur5 + cur6 + cur7;
        isMet = cur1 >= 7 && cur2 >= 7 && cur3 >= 7 && cur4 >= 7 && cur5 >= 7 && cur6 >= 7 && cur7 >= 7;

        const sinsConfig = [
          {
            id: 'sin_luxuria',
            name: '❤️ 1. Luxúria (Direção/Roteiro de Paul W.S. Anderson)',
            matching: matching1,
            cur: cur1,
            desc: 'Filmes de Paul W.S. Anderson ("Olha minha mulher!")',
          },
          {
            id: 'sin_orgulho',
            name: '👑 2. Orgulho (Filmes dos Estados Unidos)',
            matching: matching2,
            cur: cur2,
            desc: 'Filmes produzidos nos Estados Unidos',
          },
          {
            id: 'sin_inveja',
            name: '🐍 3. Inveja (Roteiro de Bob Kane)',
            matching: matching3,
            cur: cur3,
            desc: 'Filmes creditados a Bob Kane (Bill Finger)',
          },
          {
            id: 'sin_ira',
            name: '🔥 4. Ira (Tag Criança Malvada)',
            matching: matching4,
            cur: cur4,
            desc: 'Filmes com a tag Criança Malvada',
          },
          {
            id: 'sin_preguica',
            name: '🦥 5. Preguiça (Gênero Curta)',
            matching: matching5,
            cur: cur5,
            desc: 'Filmes do gênero Curta',
          },
          {
            id: 'sin_avareza',
            name: '💰 6. Avareza (Blumhouse ou Disney / Pixar)',
            matching: matching6,
            cur: cur6,
            desc: 'Filmes da Blumhouse ou Disney/Pixar',
          },
          {
            id: 'sin_gula',
            name: '🍗 7. Gula (Tag Natal - A Grande Ceia)',
            matching: matching7,
            cur: cur7,
            desc: 'Filmes com a tag Natal',
          },
        ];

        for (const sin of sinsConfig) {
          checklist.push({
            id: sin.id,
            name: sin.name,
            flag: null,
            required: 7,
            current: sin.cur,
            conquered: sin.cur >= 7,
            extra_info: `${sin.cur} de 7 filmes conquistados (${sin.matching.length} no catálogo)`,
          });

          const capped = sin.matching.slice(0, 7);
          capped.forEach((m: any, idx: number) => {
            checklist.push({
              id: `${sin.id}_m_${m.movie_id || idx}`,
              name: `   ↳ ${m.title}${m.release_year ? ` (${m.release_year})` : ''}`,
              flag: m.primaryCountryCode ? m.primaryCountryCode.toLowerCase() : null,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              movie_year: m.release_year,
              poster_url: m.poster_url,
              extra_info: sin.desc,
            });
          });

          if (capped.length < 7) {
            for (let i = capped.length; i < 7; i++) {
              checklist.push({
                id: `${sin.id}_slot_${i + 1}`,
                name: `   ↳ Filme #${i + 1} (${sin.desc})`,
                flag: null,
                required: 1,
                current: 0,
                conquered: false,
                extra_info: 'Pendente',
              });
            }
          }
        }
        break;
      }

      case 'hybrid_supreme_5_categories': {
        const matchingMovies = catalogMovies.filter((m: any) => {
          const isNonUs = m.primaryCountryCode && m.primaryCountryCode.toLowerCase() !== 'us';
          const has2Genres = Array.isArray(m.genres) && m.genres.length >= 2;
          const has1Tag = Array.isArray(m.tags) && m.tags.length >= 1;
          const hasOscar = (Number(m.oscar_nominations) || 0) >= 1 || (Number(m.oscar_wins) || 0) >= 1;
          const hasMonth =
            m.month_seen !== null &&
            m.month_seen !== undefined &&
            Number(m.month_seen) >= 1 &&
            Number(m.month_seen) <= 12;
          return isNonUs && has2Genres && has1Tag && hasOscar && hasMonth;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) =>
            `${(m.primaryCountryName || m.primaryCountryCode || '').toUpperCase()} | ${m.genres.slice(0, 2).join('/')} | ${m.tags[0]} | Oscar | Mês ${m.month_seen}`,
          'Pendente: Filme combo 5 categorias'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'critic_tribunal_rule': {
        const ruleKey = String(def.target_metadata?.ruleKey || '');
        const evaluatedMatches: { movie: any; extraInfo: string; sortScore: number }[] = [];
        for (const m of catalogMovies) {
          const evalRes = evaluateCriticTribunalMovie(m, ruleKey, unCountryDefMap);
          if (evalRes.matched) {
            evaluatedMatches.push({
              movie: m,
              extraInfo: evalRes.extraInfo,
              sortScore: evalRes.sortScore,
            });
          }
        }
        evaluatedMatches.sort((a, b) => b.sortScore - a.sortScore);
        const extraMap = new Map<any, string>();
        const matchingMovies = evaluatedMatches.map((e) => {
          extraMap.set(e.movie, e.extraInfo);
          return e.movie;
        });

        progressTarget = def.target_value;
        const cleanReq = def.description.replace(/^Conquistar\s+\d+\s+filmes?\s+(com\s+|onde\s+)?/i, '').replace(/\s*\(\d+\s+filmes?\)\.?$/i, '');
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => extraMap.get(m) || 'Veredicto aprovado',
          `Pendente: ${cleanReq}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hybrid_shyamalan_paradox': {
        const patterns = ['m. night shyamalan', 'm night shyamalan', 'shyamalan'];
        const shyamalanMovies = catalogMovies.filter((m: any) => movieHasAnyPattern(getMovieDirectors(m), patterns));
        const slot1Candidates = shyamalanMovies.filter((m: any) => {
          const { ur } = extractCriticMetrics(m);
          return ur !== null && Math.round(ur * 1000) >= 8000;
        });
        const slot2Candidates = shyamalanMovies.filter((m: any) => {
          const { ur } = extractCriticMetrics(m);
          return ur !== null && Math.round(ur * 1000) < 6000;
        });
        progressTarget = 2;
        const curSlot1 = slot1Candidates.length > 0 ? 1 : 0;
        const curSlot2 = slot2Candidates.length > 0 ? 1 : 0;
        progressCurrent = curSlot1 + curSlot2;
        isMet = curSlot1 === 1 && curSlot2 === 1;

        const best1 = slot1Candidates[0];
        const best2 = slot2Candidates[0];
        checklist.push({
          id: 'shyamalan_hit',
          name: 'Filme de M. Night Shyamalan com Minha Nota >= 8.000',
          required: 1,
          current: curSlot1,
          conquered: curSlot1 === 1,
          movie_title: best1?.title || null,
          extra_info: best1
            ? `Minha Nota: ${Number(best1.user_rating_raw || best1.user_rating).toFixed(3)}`
            : 'Pendente: Obra-prima de Shyamalan (>= 8.000)',
        });
        checklist.push({
          id: 'shyamalan_miss',
          name: 'Filme de M. Night Shyamalan com Minha Nota < 6.000',
          required: 1,
          current: curSlot2,
          conquered: curSlot2 === 1,
          movie_title: best2?.title || null,
          extra_info: best2
            ? `Minha Nota: ${Number(best2.user_rating_raw || best2.user_rating).toFixed(3)}`
            : 'Pendente: Decepção de Shyamalan (< 6.000)',
        });
        break;
      }

      case 'hybrid_15_countries_masterpieces': {
        const countryMap = new Map<string, any>();
        for (const m of catalogMovies) {
          const { ur } = extractCriticMetrics(m);
          if (ur === null || Math.round(ur * 1000) < 8500) continue;
          if (movieHasCountry(m, 'us', unCountryDefMap)) continue;

          let cCode = m.primaryCountryCode ? m.primaryCountryCode.toLowerCase() : null;
          if (!cCode && Array.isArray(m.coproductionCountries) && m.coproductionCountries.length > 0) {
            cCode = m.coproductionCountries[0].code?.toLowerCase();
          }
          if (!cCode && Array.isArray(m.countries) && m.countries.length > 0) {
            const def = unCountryDefMap.get(cleanStr(m.countries[0]));
            if (def) cCode = def.code.toLowerCase();
          }
          if (!cCode || cCode === 'us') continue;

          const currentRating = Number(m.user_rating_raw || m.user_rating);
          const existing = countryMap.get(cCode);
          if (!existing || currentRating > Number(existing.user_rating_raw || existing.user_rating)) {
            countryMap.set(cCode, m);
          }
        }

        const entries = Array.from(countryMap.entries());
        entries.sort(
          (a, b) => Number(b[1].user_rating_raw || b[1].user_rating) - Number(a[1].user_rating_raw || a[1].user_rating)
        );

        progressTarget = 15;
        progressCurrent = Math.min(15, entries.length);
        isMet = entries.length >= 15;

        for (let i = 0; i < 15; i++) {
          const item = entries[i];
          if (item) {
            const [cCode, m] = item;
            const cDef = unCountryDefMap.get(cCode);
            checklist.push({
              id: `masterpiece_country_${cCode}`,
              code: cCode,
              name: cDef ? cDef.name : cCode.toUpperCase(),
              flag: cCode,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              extra_info: `Minha Nota: ${Number(m.user_rating_raw || m.user_rating).toFixed(3)}`,
            });
          } else {
            checklist.push({
              id: `masterpiece_slot_${i + 1}`,
              name: `País Estrangeiro #${i + 1} com Minha Nota >= 8.500`,
              required: 1,
              current: 0,
              conquered: false,
              movie_title: null,
              extra_info: 'Pendente: Filme internacional com nota >= 8.500',
            });
          }
        }
        break;
      }

      case 'hybrid_curador_joias_raras': {
        const qualifyingMovies: any[] = [];
        for (const m of catalogMovies) {
          const { ur, gr } = extractCriticMetrics(m);
          if (ur === null || Math.round(ur * 1000) < 8500) continue;
          if (gr === null || gr >= 50_000) continue;
          if (!Array.isArray(m.tags) || m.tags.length === 0) continue;

          qualifyingMovies.push(m);
        }

        qualifyingMovies.sort(
          (a, b) => Number(b.user_rating_raw || b.user_rating) - Number(a.user_rating_raw || a.user_rating)
        );

        const selectedMovies: any[] = [];
        const seenCountries = new Set<string>();

        // 1ª passada: 1 filme por país para maximizar diversidade geográfica
        for (const m of qualifyingMovies) {
          const cCode = (m.primaryCountryCode || (m.countries && m.countries[0]) || 'unknown').toLowerCase();
          if (!seenCountries.has(cCode)) {
            seenCountries.add(cCode);
            selectedMovies.push(m);
            if (selectedMovies.length === 15) break;
          }
        }

        // 2ª passada se ainda faltar para 15 filmes
        if (selectedMovies.length < 15) {
          for (const m of qualifyingMovies) {
            if (!selectedMovies.includes(m)) {
              selectedMovies.push(m);
              const cCode = (m.primaryCountryCode || (m.countries && m.countries[0]) || 'unknown').toLowerCase();
              seenCountries.add(cCode);
              if (selectedMovies.length === 15) break;
            }
          }
        }

        progressTarget = 15;
        progressCurrent = Math.min(15, selectedMovies.length);
        const countriesCount = seenCountries.size;
        isMet = selectedMovies.length >= 15 && countriesCount >= 8;

        const res = buildMovieSlotsChecklist(
          selectedMovies,
          progressTarget,
          (m: any) =>
            `Reviews: ${(parseGlobalReviews(m.global_reviews || m.vote_count) || 0).toLocaleString('pt-BR')} | Minha Nota: ${Number(m.user_rating_raw || m.user_rating).toFixed(3)} | País: ${m.primaryCountryName || m.primaryCountryCode || 'Mundo'}`,
          `Pendente: Filme < 50k Reviews, Nota >= 8.500 e 1+ Tag (Total: 8+ países diferentes)`
        );
        checklist.push(...res.checklist);
        break;
      }

      case 'michael_jackson_anthology': {
        progressTarget = 16;
        let countMet = 0;

        // Marco 0: Meta Global - 15 filmes do gênero Música
        const musicMovies = catalogMovies.filter((m: any) => movieHasGenre(m, 'Música'));
        const musicCount = musicMovies.length;
        const isMusicGlobalMet = musicCount >= 15;
        if (isMusicGlobalMet) countMet++;

        checklist.push({
          id: 'track_00_music_genre',
          name: 'Meta Global: Conquistar 15 Filmes com o Gênero Música',
          required: 15,
          current: Math.min(15, musicCount),
          conquered: isMusicGlobalMet,
          movie_title: musicMovies[0]?.title || null,
          movie_year: musicMovies[0]?.release_year || null,
          poster_url: musicMovies[0]?.poster_url || null,
          rule_desc: 'Ter pelo menos 15 filmes cadastrados com o gênero oficial Música no catálogo',
          extra_info: isMusicGlobalMet
            ? `✅ Cumprida (${musicCount}/15 filmes) • Requisito: Ter pelo menos 15 filmes com o gênero Música`
            : `🔒 Pendente (${musicCount}/15 filmes) • Requisito: Ter pelo menos 15 filmes com o gênero Música`,
        });

        // 15 Faixas Cronológicas
        const trackDefinitions = [
          {
            id: 'track_01_abc',
            name: 'Faixa 01: [ABC] (1970) — The Jackson 5',
            ruleDesc: '1 filme lançado em 1970 com a tag "Colegio/Escola" OU tag "Em Família"',
            match: (m: any) =>
              Number(m.release_year) === 1970 &&
              (movieHasTag(m, 'Colegio/Escola') || movieHasTag(m, 'Em Família')),
          },
          {
            id: 'track_02_beat_it',
            name: 'Faixa 02: [Beat It] (1983)',
            ruleDesc: '1 filme lançado em 1983 com o gênero "Ação"',
            match: (m: any) =>
              Number(m.release_year) === 1983 &&
              movieHasGenre(m, 'Ação'),
          },
          {
            id: 'track_03_billie_jean',
            name: 'Faixa 03: [Billie Jean] (1983)',
            ruleDesc: '1 filme lançado em 1983 com a tag "Trágico" OU gênero "Suspense"',
            match: (m: any) =>
              Number(m.release_year) === 1983 &&
              (movieHasTag(m, 'Trágico') || movieHasGenre(m, 'Suspense')),
          },
          {
            id: 'track_04_thriller',
            name: 'Faixa 04: [Thriller] (1984)',
            ruleDesc: '1 filme lançado em 1984 com a tag "Lobisomem" OU tag "Zumbi"',
            match: (m: any) =>
              Number(m.release_year) === 1984 &&
              (movieHasTag(m, 'Lobisomem') || movieHasTag(m, 'Zumbi')),
          },
          {
            id: 'track_05_bad',
            name: 'Faixa 05: [Bad] (1987)',
            ruleDesc: '1 filme lançado em 1987 com a tag "Criança Malvada"',
            match: (m: any) =>
              Number(m.release_year) === 1987 &&
              movieHasTag(m, 'Criança Malvada'),
          },
          {
            id: 'track_06_smooth_criminal',
            name: 'Faixa 06: [Smooth Criminal] (1988)',
            ruleDesc: '1 filme lançado em 1988 com a tag "Crime real" OU gênero "Policial"',
            match: (m: any) =>
              Number(m.release_year) === 1988 &&
              (movieHasTag(m, 'Crime real') || movieHasGenre(m, 'Policial') || movieHasGenre(m, 'Crime')),
          },
          {
            id: 'track_07_black_or_white',
            name: 'Faixa 07: [Black or White] (1991)',
            ruleDesc: '1 filme lançado em 1991 com a tag "Preto e branco" OU tag "Em Família"',
            match: (m: any) =>
              Number(m.release_year) === 1991 &&
              (movieHasTag(m, 'Preto e branco') || movieHasTag(m, 'Em Família')),
          },
          {
            id: 'track_08_heal_the_world',
            name: 'Faixa 08: [Heal the World] (1991)',
            ruleDesc: '1 filme lançado em 1991 com a tag "Emocionante" OU tag "Fatos Reais"',
            match: (m: any) =>
              Number(m.release_year) === 1991 &&
              (movieHasTag(m, 'Emocionante') || movieHasTag(m, 'Fatos Reais')),
          },
          {
            id: 'track_09_remember_the_time',
            name: 'Faixa 09: [Remember the Time] (1992)',
            ruleDesc: '1 filme lançado em 1992 com a tag "Viagem no Tempo"',
            match: (m: any) =>
              Number(m.release_year) === 1992 &&
              movieHasTag(m, 'Viagem no Tempo'),
          },
          {
            id: 'track_10_you_are_not_alone',
            name: 'Faixa 10: [You Are Not Alone] (1995)',
            ruleDesc: '1 filme lançado em 1995 com a tag "Em Família" OU gênero "Romance"',
            match: (m: any) =>
              Number(m.release_year) === 1995 &&
              (movieHasTag(m, 'Em Família') || movieHasGenre(m, 'Romance')),
          },
          {
            id: 'track_11_earth_song',
            name: 'Faixa 11: [Earth Song] (1995)',
            ruleDesc: '1 filme lançado em 1995 com a tag "Trágico" OU gênero "Documentário"',
            match: (m: any) =>
              Number(m.release_year) === 1995 &&
              (movieHasTag(m, 'Trágico') || movieHasGenre(m, 'Documentário')),
          },
          {
            id: 'track_12_they_dont_care_about_us',
            name: "Faixa 12: [They Don't Care About Us] (1996)",
            ruleDesc: '1 filme lançado em 1996 produzido/gravado no Brasil',
            match: (m: any) =>
              Number(m.release_year) === 1996 &&
              movieHasCountry(m, 'br', unCountryDefMap),
          },
          {
            id: 'track_13_ghosts',
            name: 'Faixa 13: [Ghosts] (1996)',
            ruleDesc: '1 filme lançado em 1996 com a tag "Fantasma"',
            match: (m: any) =>
              Number(m.release_year) === 1996 &&
              movieHasTag(m, 'Fantasma'),
          },
          {
            id: 'track_14_blood_on_the_dance_floor',
            name: 'Faixa 14: [Blood on the Dance Floor] (1997)',
            ruleDesc: '1 filme lançado em 1997 com a tag "Gore"',
            match: (m: any) =>
              Number(m.release_year) === 1997 &&
              movieHasTag(m, 'Gore'),
          },
          {
            id: 'track_15_love_never_felt_so_good',
            name: 'Faixa 15: [Love Never Felt So Good] (2014) — feat. Justin Timberlake',
            ruleDesc: '1 filme lançado em 2014 com a tag "Em Família" OU tag "Emocionante"',
            match: (m: any) =>
              Number(m.release_year) === 2014 &&
              (movieHasTag(m, 'Em Família') || movieHasTag(m, 'Emocionante')),
          },
        ];

        trackDefinitions.forEach((trk) => {
          const matchedMovie = catalogMovies.find(trk.match);
          if (matchedMovie) {
            countMet++;
            checklist.push({
              id: trk.id,
              name: trk.name,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: matchedMovie.title,
              movie_year: matchedMovie.release_year,
              poster_url: matchedMovie.poster_url || null,
              flag: matchedMovie.primaryCountryCode ? matchedMovie.primaryCountryCode.toLowerCase() : null,
              rule_desc: trk.ruleDesc,
              extra_info: `✅ Cumprida (${matchedMovie.title}) • Requisito: ${trk.ruleDesc}`,
            });
          } else {
            checklist.push({
              id: trk.id,
              name: trk.name,
              required: 1,
              current: 0,
              conquered: false,
              movie_title: null,
              movie_year: null,
              poster_url: null,
              flag: null,
              rule_desc: trk.ruleDesc,
              extra_info: `🔒 Pendente • Requisito: ${trk.ruleDesc}`,
            });
          }
        });

        progressCurrent = countMet;
        isMet = progressCurrent >= progressTarget;
        break;
      }


      // ==========================================
      // CASOS DA CATEGORIA: O RITUAL DO CINÉFILO
      // ==========================================
      case 'ritual_cinefilo_rule': {
        const ruleKey = String(def.target_metadata?.ruleKey || '');
        const evaluatedMatches: { movie: any; extraInfo: string; sortScore: number }[] = [];
        for (const m of catalogMovies) {
          const evalRes = evaluateRitualCinefiloMovie(m, ruleKey);
          if (evalRes.matched) {
            evaluatedMatches.push({
              movie: m,
              extraInfo: evalRes.extraInfo,
              sortScore: evalRes.sortScore,
            });
          }
        }
        evaluatedMatches.sort((a, b) => b.sortScore - a.sortScore);
        const extraMap = new Map<any, string>();
        const matchingMovies = evaluatedMatches.map((e) => {
          extraMap.set(e.movie, e.extraInfo);
          return e.movie;
        });

        progressTarget = def.target_value;
        const cleanReq = def.description.replace(/^Conquistar\s+\d+\s+filmes?\s+(com\s+|onde\s+|no\s+|em\s+)?/i, '').replace(/\s*\(\d+\s+filmes?\)\.?$/i, '');
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => extraMap.get(m) || 'Ritual cumprido',
          `Pendente: ${cleanReq}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'ritual_pentacampeonato': {
        const pentaYears = [1958, 1962, 1970, 1994, 2002];
        progressTarget = 5;
        let conqueredYears = 0;
        for (const yr of pentaYears) {
          const match = catalogMovies.find((m: any) => getMovieReleaseYear(m) === yr);
          if (match) {
            conqueredYears++;
            checklist.push({
              id: `penta_${yr}`,
              name: `Copa do Mundo de ${yr}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: match.title,
              movie_year: yr,
              poster_url: match.poster_url || null,
              extra_info: `Lançado no ano do título: ${yr}`,
            });
          } else {
            checklist.push({
              id: `penta_${yr}`,
              name: `Copa do Mundo de ${yr}`,
              required: 1,
              current: 0,
              conquered: false,
              movie_title: null,
              extra_info: `Pendente: Filme lançado em ${yr}`,
            });
          }
        }
        progressCurrent = conqueredYears;
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'ritual_ditadura': {
        const startYr = 1964;
        const endYr = 1985;
        progressTarget = 21;
        let conqueredCount = 0;
        for (let yr = startYr; yr <= endYr; yr++) {
          const match = catalogMovies.find((m: any) => getMovieReleaseYear(m) === yr);
          if (match) {
            conqueredCount++;
            checklist.push({
              id: `ditadura_${yr}`,
              name: `Ano de ${yr}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: match.title,
              movie_year: yr,
              poster_url: match.poster_url || null,
              extra_info: `Filme de ${yr}`,
            });
          } else {
            checklist.push({
              id: `ditadura_${yr}`,
              name: `Ano de ${yr}`,
              required: 1,
              current: 0,
              conquered: false,
              movie_title: null,
              extra_info: `Pendente: Filme lançado em ${yr}`,
            });
          }
        }
        progressCurrent = Math.min(progressTarget, conqueredCount);
        isMet = conqueredCount >= progressTarget;
        break;
      }

      case 'ritual_petista': {
        const baseYears = [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
        let maxCatYear = 2023;
        for (const m of catalogMovies) {
          const y = getMovieReleaseYear(m);
          if (y && y > maxCatYear && y <= 2050) {
            maxCatYear = y;
          }
        }
        const recentYears: number[] = [];
        for (let y = 2023; y <= maxCatYear; y++) {
          recentYears.push(y);
        }
        const allPetistaYears = [...baseYears, ...recentYears];
        progressTarget = allPetistaYears.length;
        let conqueredCount = 0;
        for (const yr of allPetistaYears) {
          const match = catalogMovies.find((m: any) => getMovieReleaseYear(m) === yr);
          if (match) {
            conqueredCount++;
            checklist.push({
              id: `petista_${yr}`,
              name: `Ano de ${yr}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: match.title,
              movie_year: yr,
              poster_url: match.poster_url || null,
              extra_info: `Filme de ${yr}`,
            });
          } else {
            checklist.push({
              id: `petista_${yr}`,
              name: `Ano de ${yr}`,
              required: 1,
              current: 0,
              conquered: false,
              movie_title: null,
              extra_info: `Pendente: Filme lançado em ${yr}`,
            });
          }
        }
        progressCurrent = conqueredCount;
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'ritual_nomade_telas': {
        progressTarget = 8;
        const moviesByPlat = new Map<string, any[]>();
        for (const m of catalogMovies) {
          const rawPlat = getMoviePlatform(m);
          if (!rawPlat || rawPlat === 'Não Informado' || rawPlat === 'N/A') continue;
          const p = rawPlat;
          if (!moviesByPlat.has(p)) moviesByPlat.set(p, []);
          moviesByPlat.get(p)!.push(m);
        }
        const sortedPlats = Array.from(moviesByPlat.entries()).sort((a, b) => b[1].length - a[1].length);
        let qualifyingPlats = 0;
        for (const [pName, pMovies] of sortedPlats) {
          const isQual = pMovies.length >= 3;
          if (isQual) qualifyingPlats++;
          checklist.push({
            id: `plat_${pName.toLowerCase().replace(/\s+/g, '_')}`,
            name: `Plataforma: ${pName}`,
            required: 3,
            current: Math.min(3, pMovies.length),
            conquered: isQual,
            movie_title: pMovies[0]?.title || null,
            poster_url: pMovies[0]?.poster_url || null,
            extra_info: `${pMovies.length} filme(s) assistido(s) nesta plataforma`,
          });
        }
        progressCurrent = Math.min(8, qualifyingPlats);
        isMet = qualifyingPlats >= progressTarget;
        break;
      }

      case 'ritual_projecao_classica': {
        progressTarget = 200;
        const cinemaMovies = catalogMovies.filter((m: any) => isCinema(getMoviePlatform(m)));
        const physicalMovies = catalogMovies.filter((m: any) => isPhysicalMedia(getMoviePlatform(m)));

        const cinCur = Math.min(100, cinemaMovies.length);
        const physCur = Math.min(100, physicalMovies.length);
        progressCurrent = cinCur + physCur;
        isMet = cinemaMovies.length >= 100 && physicalMovies.length >= 100;

        checklist.push({
          id: 'projecao_cinema',
          name: '100 Filmes assistidos no Cinema',
          required: 100,
          current: cinCur,
          conquered: cinemaMovies.length >= 100,
          movie_title: cinemaMovies[0]?.title || null,
          poster_url: cinemaMovies[0]?.poster_url || null,
          extra_info: `${cinemaMovies.length} de 100 filmes no Cinema`,
        });

        checklist.push({
          id: 'projecao_fisica',
          name: '100 Filmes assistidos em Blu-ray ou DVD',
          required: 100,
          current: physCur,
          conquered: physicalMovies.length >= 100,
          movie_title: physicalMovies[0]?.title || null,
          poster_url: physicalMovies[0]?.poster_url || null,
          extra_info: `${physicalMovies.length} de 100 filmes em Mídia Física`,
        });
        break;
      }

      case 'ritual_enciclopedia_acustica': {
        progressTarget = 500;
        const dubbedMovies = catalogMovies.filter((m: any) => isDubbed(getMovieAudio(m)));
        const subtitledMovies = catalogMovies.filter((m: any) => isSubtitled(getMovieAudio(m)));
        const originalMovies = catalogMovies.filter((m: any) => isOriginalAudio(getMovieAudio(m)));

        const dubCur = Math.min(300, dubbedMovies.length);
        const subCur = Math.min(150, subtitledMovies.length);
        const origCur = Math.min(50, originalMovies.length);

        progressCurrent = dubCur + subCur + origCur;
        isMet = dubbedMovies.length >= 300 && subtitledMovies.length >= 150 && originalMovies.length >= 50;

        checklist.push({
          id: 'acustica_dublado',
          name: '300 Filmes com áudio Dublado',
          required: 300,
          current: dubCur,
          conquered: dubbedMovies.length >= 300,
          movie_title: dubbedMovies[0]?.title || null,
          poster_url: dubbedMovies[0]?.poster_url || null,
          extra_info: `${dubbedMovies.length} de 300 filmes Dublados`,
        });

        checklist.push({
          id: 'acustica_legendado',
          name: '150 Filmes com áudio Legendado',
          required: 150,
          current: subCur,
          conquered: subtitledMovies.length >= 150,
          movie_title: subtitledMovies[0]?.title || null,
          poster_url: subtitledMovies[0]?.poster_url || null,
          extra_info: `${subtitledMovies.length} de 150 filmes Legendados`,
        });

        checklist.push({
          id: 'acustica_original',
          name: '50 Filmes no idioma Original',
          required: 50,
          current: origCur,
          conquered: originalMovies.length >= 50,
          movie_title: originalMovies[0]?.title || null,
          poster_url: originalMovies[0]?.poster_url || null,
          extra_info: `${originalMovies.length} de 50 filmes em Idioma Original`,
        });
        break;
      }

      case 'ritual_total_minutos': {
        const targetMinutes = Number(def.target_value) || 30000;
        progressTarget = targetMinutes;
        const totalMinutes = catalogMovies.reduce((acc: number, m: any) => acc + getMovieRuntime(m), 0);
        progressCurrent = Math.min(progressTarget, totalMinutes);
        isMet = totalMinutes >= progressTarget;

        const hours = Math.floor(totalMinutes / 60);
        const targetHours = Math.floor(targetMinutes / 60);

        checklist.push({
          id: `minutos_${targetMinutes}`,
          name: `${targetMinutes.toLocaleString('pt-BR')} minutos (${targetHours} horas) assistidos`,
          required: targetMinutes,
          current: progressCurrent,
          conquered: isMet,
          extra_info: `${totalMinutes.toLocaleString('pt-BR')} minutos acumulados (${hours} horas líquidas)`,
        });
        break;
      }

      case 'ritual_anos_checklist': {
        const startYear = Number(def.target_metadata?.startYear) || 1994;
        const endYear = Number(def.target_metadata?.endYear) || 2027;
        const totalYears = endYear - startYear + 1;
        progressTarget = totalYears;

        let conqueredCount = 0;
        for (let y = startYear; y <= endYear; y++) {
          const matchedMovie = catalogMovies.find((m: any) => getMovieReleaseYear(m) === y);
          if (matchedMovie) {
            conqueredCount++;
            checklist.push({
              id: `ano_${y}`,
              name: `Ano de ${y}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: matchedMovie.title,
              movie_year: y,
              poster_url: matchedMovie.poster_url || null,
              extra_info: `✅ Conquistado (${matchedMovie.title})`,
            });
          } else {
            checklist.push({
              id: `ano_${y}`,
              name: `Ano de ${y}`,
              required: 1,
              current: 0,
              conquered: false,
              movie_title: null,
              movie_year: y,
              poster_url: null,
              extra_info: `🔒 Pendente: Nenhum filme gravado/lançado em ${y}`,
            });
          }
        }

        progressCurrent = conqueredCount;
        isMet = conqueredCount >= progressTarget;
        break;
      }

      case 'multi_ritual_rule': {
        const ruleKey = String(def.target_metadata?.ruleKey || '');

        if (ruleKey === 'brazil_copa_1950_2014') {
          progressTarget = 2;
          const m1950 = catalogMovies.find((m: any) => movieHasCountry(m, 'br', unCountryDefMap) && getMovieReleaseYear(m) === 1950);
          const m2014 = catalogMovies.find((m: any) => movieHasCountry(m, 'br', unCountryDefMap) && getMovieReleaseYear(m) === 2014);

          checklist.push({
            id: 'copa_1950',
            name: 'Brasil na Copa de 1950 (Maracanazo)',
            required: 1,
            current: m1950 ? 1 : 0,
            conquered: Boolean(m1950),
            movie_title: m1950?.title || null,
            movie_year: 1950,
            poster_url: m1950?.poster_url || null,
            extra_info: m1950 ? `✅ Conquistado (${m1950.title})` : '🔒 Pendente: Filme brasileiro de 1950',
          });

          checklist.push({
            id: 'copa_2014',
            name: 'Brasil na Copa de 2014 (Mineiraço 7x1)',
            required: 1,
            current: m2014 ? 1 : 0,
            conquered: Boolean(m2014),
            movie_title: m2014?.title || null,
            movie_year: 2014,
            poster_url: m2014?.poster_url || null,
            extra_info: m2014 ? `✅ Conquistado (${m2014.title})` : '🔒 Pendente: Filme brasileiro de 2014',
          });

          progressCurrent = (m1950 ? 1 : 0) + (m2014 ? 1 : 0);
          isMet = progressCurrent >= progressTarget;
          break;
        }

        if (ruleKey === 'cesio_137_combo_7') {
          progressTarget = 7;
          const usedIds = new Set<string | number>();
          let currentConquered = 0;

          // 3 filmes de 1987
          for (let i = 1; i <= 3; i++) {
            const m = catalogMovies.find((mv: any) => {
              const id = mv.movie_id;
              return !usedIds.has(id) && getMovieReleaseYear(mv) === 1987;
            });
            if (m) {
              usedIds.add(m.movie_id);
              currentConquered++;
              checklist.push({
                id: `cesio_1987_${i}`,
                name: `Filme do Ano do Desastre (1987) #${i}`,
                required: 1,
                current: 1,
                conquered: true,
                movie_title: m.title,
                movie_year: 1987,
                poster_url: m.poster_url || null,
                extra_info: `✅ Conquistado (${m.title})`,
              });
            } else {
              checklist.push({
                id: `cesio_1987_${i}`,
                name: `Filme do Ano do Desastre (1987) #${i}`,
                required: 1,
                current: 0,
                conquered: false,
                movie_title: null,
                poster_url: null,
                extra_info: '🔒 Pendente: Filme gravado/lançado em 1987',
              });
            }
          }

          // 1 filme com 136..138 min (Protocolo Césio-137)
          const m137 = catalogMovies.find((mv: any) => {
            const id = mv.movie_id;
            const rt = getMovieRuntime(mv);
            return !usedIds.has(id) && rt >= 136 && rt <= 138;
          });
          if (m137) {
            usedIds.add(m137.movie_id);
            currentConquered++;
            checklist.push({
              id: 'cesio_137_min',
              name: 'Duração no Marco do Césio-137 (136 a 138 min)',
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m137.title,
              movie_year: getMovieReleaseYear(m137) || undefined,
              poster_url: m137.poster_url || null,
              extra_info: `✅ Conquistado (${m137.title} - ${getMovieRuntime(m137)} min)`,
            });
          } else {
            checklist.push({
              id: 'cesio_137_min',
              name: 'Duração no Marco do Césio-137 (136 a 138 min)',
              required: 1,
              current: 0,
              conquered: false,
              movie_title: null,
              poster_url: null,
              extra_info: '🔒 Pendente: Filme com duração entre 136 e 138 minutos',
            });
          }

          // 3 filmes do Brasil com tag Trágico ou Fatos Reais
          for (let i = 1; i <= 3; i++) {
            const m = catalogMovies.find((mv: any) => {
              const id = mv.movie_id;
              return (
                !usedIds.has(id) &&
                movieHasCountry(mv, 'br', unCountryDefMap) &&
                (movieHasTag(mv, 'Trágico') || movieHasTag(mv, 'Fatos Reais'))
              );
            });
            if (m) {
              usedIds.add(m.movie_id);
              currentConquered++;
              checklist.push({
                id: `cesio_br_tragico_${i}`,
                name: `Brasil Trágico ou Fatos Reais #${i}`,
                required: 1,
                current: 1,
                conquered: true,
                movie_title: m.title,
                movie_year: getMovieReleaseYear(m) || undefined,
                poster_url: m.poster_url || null,
                extra_info: `✅ Conquistado (${m.title})`,
              });
            } else {
              checklist.push({
                id: `cesio_br_tragico_${i}`,
                name: `Brasil Trágico ou Fatos Reais #${i}`,
                required: 1,
                current: 0,
                conquered: false,
                movie_title: null,
                poster_url: null,
                extra_info: '🔒 Pendente: Filme brasileiro com tag Trágico ou Fatos Reais',
              });
            }
          }

          progressCurrent = currentConquered;
          isMet = currentConquered >= progressTarget;
          break;
        }

        if (ruleKey === 'pirata_30_paises') {
          progressTarget = 30;
          const pirateMovies = catalogMovies.filter((m: any) => {
            const plat = getMoviePlatform(m);
            return isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat);
          });

          const countryMap = new Map<string, { countryName: string; flag: string; movie: any }>();
          for (const m of pirateMovies) {
            const cCode = (m.primaryCountryCode || (Array.isArray(m.countries) ? m.countries[0] : null) || '').toLowerCase();
            if (!cCode) continue;
            const unDef = unCountryDefMap.get(cCode);
            const countryKey = unDef ? unDef.code.toLowerCase() : cCode;
            const cName = unDef ? unDef.name : (m.primaryCountryName || cCode.toUpperCase());
            if (!countryMap.has(countryKey)) {
              countryMap.set(countryKey, {
                countryName: cName,
                flag: unDef?.code?.toLowerCase() || cCode,
                movie: m,
              });
            }
          }

          const conqueredEntries = Array.from(countryMap.values());
          progressCurrent = Math.min(progressTarget, conqueredEntries.length);

          for (let i = 0; i < progressTarget; i++) {
            const entry = conqueredEntries[i];
            if (entry) {
              checklist.push({
                id: `pirata_pais_${i + 1}`,
                name: `País #${i + 1}: ${entry.countryName}`,
                required: 1,
                current: 1,
                conquered: true,
                flag: entry.flag,
                movie_title: entry.movie.title,
                movie_year: getMovieReleaseYear(entry.movie) || undefined,
                poster_url: entry.movie.poster_url || null,
                extra_info: `✅ Conquistado (${entry.movie.title} via ${getMoviePlatform(entry.movie)})`,
              });
            } else {
              checklist.push({
                id: `pirata_pais_${i + 1}`,
                name: `País Pirata #${i + 1}`,
                required: 1,
                current: 0,
                conquered: false,
                movie_title: null,
                poster_url: null,
                extra_info: '🔒 Pendente: Filme de novo país assistido via Pirataria',
              });
            }
          }

          isMet = conqueredEntries.length >= progressTarget;
          break;
        }

        if (ruleKey === 'viajante_9_decadas_18') {
          progressTarget = 18;
          const decades = [
            { label: 'Anos 1940 (1940-1949)', start: 1940, end: 1949 },
            { label: 'Anos 1950 (1950-1959)', start: 1950, end: 1959 },
            { label: 'Anos 1960 (1960-1969)', start: 1960, end: 1969 },
            { label: 'Anos 1970 (1970-1979)', start: 1970, end: 1979 },
            { label: 'Anos 1980 (1980-1989)', start: 1980, end: 1989 },
            { label: 'Anos 1990 (1990-1999)', start: 1990, end: 1999 },
            { label: 'Anos 2000 (2000-2009)', start: 2000, end: 2009 },
            { label: 'Anos 2010 (2010-2019)', start: 2010, end: 2019 },
            { label: 'Anos 2020 (2020-2029)', start: 2020, end: 2029 },
          ];

          const usedIds = new Set<string | number>();
          const conqueredCountries = new Set<string>();
          let totalConquered = 0;

          decades.forEach((dec) => {
            const candidates = catalogMovies
              .filter((mv: any) => {
                const y = getMovieReleaseYear(mv);
                if (y === null || y < dec.start || y > dec.end) return false;
                const { ur } = extractCriticMetrics(mv);
                const urMillis = ur !== null ? Math.round(ur * 1000) : null;
                return urMillis !== null && urMillis >= 8000;
              })
              .sort((a: any, b: any) => {
                const urA = extractCriticMetrics(a).ur || 0;
                const urB = extractCriticMetrics(b).ur || 0;
                return urB - urA;
              });

            for (let slot = 1; slot <= 2; slot++) {
              const m = candidates.find((mv: any) => !usedIds.has(mv.movie_id));
              if (m) {
                usedIds.add(m.movie_id);
                totalConquered++;
                const cCode = (m.primaryCountryCode || (Array.isArray(m.countries) ? m.countries[0] : null) || '').toLowerCase();
                if (cCode) conqueredCountries.add(cCode);

                const { ur } = extractCriticMetrics(m);
                checklist.push({
                  id: `viajante_${dec.start}_${slot}`,
                  name: `${dec.label} - Filme #${slot}`,
                  required: 1,
                  current: 1,
                  conquered: true,
                  movie_title: m.title,
                  movie_year: getMovieReleaseYear(m) || undefined,
                  poster_url: m.poster_url || null,
                  flag: cCode && cCode.length === 2 ? cCode : null,
                  extra_info: `✅ Conquistado (${m.title} - Nota: ${ur ? ur.toFixed(3) : '8.0+'} | ${m.primaryCountryName || 'País N/I'})`,
                });
              } else {
                checklist.push({
                  id: `viajante_${dec.start}_${slot}`,
                  name: `${dec.label} - Filme #${slot}`,
                  required: 1,
                  current: 0,
                  conquered: false,
                  movie_title: null,
                  poster_url: null,
                  extra_info: `🔒 Pendente: Filme de ${dec.start}-${dec.end} com Minha Nota >= 8.000`,
                });
              }
            }
          });

          progressCurrent = totalConquered;
          isMet = totalConquered >= progressTarget && conqueredCountries.size >= 10;
          break;
        }

        // Caso padrão de slots para multi_ritual_rule
        const evaluatedMatches: { movie: any; extraInfo: string; sortScore: number }[] = [];
        for (const m of catalogMovies) {
          const evalRes = evaluateMultiRitualMovie(m, ruleKey, unCountryDefMap);
          if (evalRes.matched) {
            evaluatedMatches.push({
              movie: m,
              extraInfo: evalRes.extraInfo,
              sortScore: evalRes.sortScore,
            });
          }
        }
        evaluatedMatches.sort((a, b) => b.sortScore - a.sortScore);
        const extraMap = new Map<any, string>();
        const matchingMovies = evaluatedMatches.map((e) => {
          extraMap.set(e.movie, e.extraInfo);
          return e.movie;
        });

        progressTarget = def.target_value;
        const cleanReq = def.description
          .replace(/^Conquistar\s+\d+\s+filmes?\s+(com\s+|onde\s+|assistidos\s+em\s+|vistos\s+no\s+)?/i, '')
          .replace(/\s*\(\d+\s+filmes?\)\.?$/i, '');
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => extraMap.get(m) || 'Critério atendido',
          `Pendente: ${cleanReq}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'secret_session_curated':
      case 'calcada_fama_curated': {
        const reqMovies: Array<{
          name: string;
          patterns: string[];
          year?: number;
          exclude?: string[];
          requireAdditionalPatterns?: string[];
        }> = def.target_metadata?.movies || [];
        progressTarget = def.target_value || def.target_metadata?.minTarget || reqMovies.length || 1;
        let countConquered = 0;
        const usedMovieIds = new Set<string | number>();

        reqMovies.forEach((req, idx) => {
          const matchedMovie = catalogMovies.find(
            (m: any) => !usedMovieIds.has(m.movie_id || (m as any).id) && matchCuratedCandidate(m, req)
          );
          if (matchedMovie) {
            usedMovieIds.add(matchedMovie.movie_id || (matchedMovie as any).id);
            countConquered++;
            checklist.push({
              id: `${def.id}_curated_${idx + 1}`,
              name: req.name,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: matchedMovie.title,
              movie_year: matchedMovie.release_year,
              poster_url: matchedMovie.poster_url || null,
              extra_info: `✅ Conquistado (${matchedMovie.title})`,
            });
          } else {
            checklist.push({
              id: `${def.id}_curated_${idx + 1}`,
              name: req.name,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: '🔒 Pendente',
            });
          }
        });

        progressCurrent = Math.min(progressTarget, countConquered);
        isMet = countConquered >= progressTarget;
        break;
      }

      case 'secret_session_pairs': {
        const pairs: Array<{
          name: string;
          partA: { name: string; patterns: string[]; year?: number; exclude?: string[]; requireAdditionalPatterns?: string[] };
          partB: { name: string; patterns: string[]; year?: number; exclude?: string[]; requireAdditionalPatterns?: string[] };
        }> = def.target_metadata?.pairs || [];

        progressTarget = def.target_value || def.target_metadata?.minTarget || 3;
        let countConquered = 0;
        const usedMovieIds = new Set<string | number>();

        pairs.forEach((pair, idx) => {
          const matchA = catalogMovies.find(
            (m: any) => !usedMovieIds.has(m.movie_id || (m as any).id) && matchCuratedCandidate(m, pair.partA)
          );
          const matchB = catalogMovies.find(
            (m: any) =>
              !usedMovieIds.has(m.movie_id || (m as any).id) &&
              (matchA ? (m.movie_id || (m as any).id) !== (matchA.movie_id || (matchA as any).id) : true) &&
              matchCuratedCandidate(m, pair.partB)
          );

          if (matchA && matchB) {
            usedMovieIds.add(matchA.movie_id || (matchA as any).id);
            usedMovieIds.add(matchB.movie_id || (matchB as any).id);
            countConquered++;
            checklist.push({
              id: `ss_pair_${idx + 1}`,
              name: pair.name,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: `${matchA.title} + ${matchB.title}`,
              movie_year: matchA.release_year || matchB.release_year,
              poster_url: matchA.poster_url || matchB.poster_url || null,
              extra_info: `✅ Par Conquistado (${matchA.title} + ${matchB.title})`,
            });
          } else {
            let partialStatus = '🔒 Pendente: Nenhuma versão assistida';
            let titleInfo: string | null = null;
            let posterInfo: string | null = null;

            if (matchA && !matchB) {
              partialStatus = `⚠️ Incompleto: Assistido "${matchA.title}", falta corte alternativo`;
              titleInfo = matchA.title;
              posterInfo = matchA.poster_url || null;
            } else if (!matchA && matchB) {
              partialStatus = `⚠️ Incompleto: Assistido "${matchB.title}", falta versão cinema`;
              titleInfo = matchB.title;
              posterInfo = matchB.poster_url || null;
            }

            checklist.push({
              id: `ss_pair_${idx + 1}`,
              name: pair.name,
              required: 1,
              current: 0,
              conquered: false,
              movie_title: titleInfo,
              poster_url: posterInfo,
              extra_info: partialStatus,
            });
          }
        });

        progressCurrent = Math.min(progressTarget, countConquered);
        isMet = countConquered >= progressTarget;
        break;
      }

      case 'alphabet_az_coverage': {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        progressTarget = 26;
        let conqueredLetters = 0;

        alphabet.forEach((letter) => {
          const matchedMovie = catalogMovies.find((m: any) => {
            const lettersA = getTitleLetters(m.title);
            const lettersB = getTitleLetters(m.original_title);
            return lettersA.includes(letter) || lettersB.includes(letter);
          });

          if (matchedMovie) {
            conqueredLetters++;
            checklist.push({
              id: `letter_${letter}`,
              name: `Letra ${letter}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: matchedMovie.title,
              movie_year: matchedMovie.release_year,
              poster_url: matchedMovie.poster_url || null,
              extra_info: `✅ Conquistado (${matchedMovie.title})`,
            });
          } else {
            checklist.push({
              id: `letter_${letter}`,
              name: `Letra ${letter}`,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: `🔒 Pendente: Filme começando com a letra ${letter}`,
            });
          }
        });

        progressCurrent = Math.min(progressTarget, conqueredLetters);
        isMet = conqueredLetters >= progressTarget;
        break;
      }

      // ==========================================
      // CASOS ESPECIAIS: TAG EM FAMÍLIA E EXTREMOS DE TAGS
      // ==========================================
      case 'movie_zero_tags_count': {
        const matchingMovies = catalogMovies.filter((m: any) => {
          const t = Array.isArray(m.tags) ? m.tags.filter((x: any) => Boolean(x && String(x).trim())) : [];
          return t.length === 0;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => '0 tags vinculadas',
          'Pendente: filme sem tags'
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_and_tag_or_month': {
        const reqTag = def.target_metadata?.tag || 'Em Família';
        const orTag = def.target_metadata?.orTag || 'Natal';
        const orMonth = def.target_metadata?.orMonth || 12;
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          return movieHasTag(m, orTag) || movieInMonth(m, orMonth);
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const hasNatalTag = movieHasTag(m, orTag);
            const inDez = movieInMonth(m, orMonth);
            const reason = hasNatalTag && inDez ? `Tag [${orTag}] + Dezembro` : hasNatalTag ? `Tag [${orTag}]` : 'Assistido em Dezembro';
            return `Tag [${reqTag}] + ${reason}`;
          },
          `Pendente: [${reqTag}] com [${orTag}] ou Dezembro`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_platform_count': {
        const reqTag = def.target_metadata?.tag || 'Em Família';
        const reqPlatform = (def.target_metadata?.platform || '').toLowerCase();
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          const plat = (m.viewingPlatform || m.platform || '').toString().toLowerCase();
          return plat.includes(reqPlatform);
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          () => `Tag [${reqTag}] no Cinema`,
          `Pendente: [${reqTag}] no Cinema`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_min_rating_count': {
        const reqTag = def.target_metadata?.tag || 'Em Família';
        const rawMin = def.target_metadata?.minRating || 8500;
        const minRatingMillis = rawMin > 10 ? rawMin : Math.round(rawMin * 1000);
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          const { ur } = extractCriticMetrics(m);
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          return urMillis !== null && urMillis >= minRatingMillis;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const { ur } = extractCriticMetrics(m);
            return `Tag [${reqTag}] | Minha Nota: ${ur !== null ? ur.toFixed(3) : '-'}`;
          },
          `Pendente: [${reqTag}] com Minha Nota >= ${(minRatingMillis / 1000).toFixed(1)}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_non_br_us_count': {
        const reqTag = def.target_metadata?.tag || 'Em Família';
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          const isBr = movieHasCountry(m, 'br', unCountryDefMap);
          const isUs = movieHasCountry(m, 'us', unCountryDefMap);
          return !isBr && !isUs;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Fora do BR e EUA (${m.primaryCountryName || 'Estrangeiro'})`,
          `Pendente: [${reqTag}] fora de BR e EUA`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_official_streaming_count': {
        const reqTag = def.target_metadata?.tag || 'Em Família';
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          const plat = (m.viewingPlatform || m.platform || '').toString();
          return isOfficialStreaming(plat);
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `Streaming Oficial: ${m.viewingPlatform || m.platform}`,
          `Pendente: [${reqTag}] em streaming oficial`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_and_any_of_tags': {
        const reqTag = def.target_metadata?.tag || 'Em Família';
        const orTags: string[] = def.target_metadata?.orTags || [];
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          return orTags.some((ot: string) => movieHasTag(m, ot));
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matchedTag = orTags.find((ot: string) => movieHasTag(m, ot)) || '';
            return `Tag [${reqTag}] + [${matchedTag}]`;
          },
          `Pendente: [${reqTag}] + [${orTags.join(' / ')}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_distinct_countries_count': {
        const reqTag = def.target_metadata?.tag || 'Em Família';
        const matchingMovies = catalogMovies.filter((m: any) => movieHasTag(m, reqTag));
        const countryMap = new Map<string, any[]>();
        for (const m of matchingMovies) {
          const cCode = (m.primaryCountryCode || (Array.isArray(m.countries) ? m.countries[0] : null) || 'unknown').toLowerCase();
          if (!countryMap.has(cCode)) countryMap.set(cCode, []);
          countryMap.get(cCode)!.push(m);
        }
        const distinctCountries = Array.from(countryMap.keys()).filter((c) => c !== 'unknown');
        progressTarget = def.target_value;
        progressCurrent = Math.min(progressTarget, distinctCountries.length);
        isMet = distinctCountries.length >= progressTarget;

        for (let i = 0; i < progressTarget; i++) {
          if (i < distinctCountries.length) {
            const cCode = distinctCountries[i];
            const unDef = unCountryDefMap.get(cCode);
            const cName = unDef ? unDef.name : cCode.toUpperCase();
            const firstMovie = countryMap.get(cCode)![0];
            checklist.push({
              id: `tag_country_${i + 1}`,
              name: `País ${i + 1}: ${cName}`,
              required: 1,
              current: 1,
              conquered: true,
              extra_info: `✅ Conquistado (${firstMovie.title})`,
            });
          } else {
            checklist.push({
              id: `tag_country_${i + 1}`,
              name: `País ${i + 1}`,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: `🔒 Pendente: Novo país com tag [${reqTag}]`,
            });
          }
        }
        break;
      }

      case 'movies_min_tags_count': {
        const minTags = def.target_metadata?.minTags || 7;
        const matchingMovies = catalogMovies.filter((m: any) => {
          const t = Array.isArray(m.tags) ? m.tags.filter((x: any) => Boolean(x && String(x).trim())) : [];
          return t.length >= minTags;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${(Array.isArray(m.tags) ? m.tags : []).length} tags vinculadas`,
          `Pendente: filme com ${minTags}+ tags`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      // ==========================================
      // CASOS ESPECIAIS: MEMES, GAMES E HOMENAGENS
      // ==========================================
      case 'terror_tragico_min_rating': {
        const reqGenre = def.target_metadata?.genre || 'Terror';
        const reqTag = def.target_metadata?.tag || 'Trágico';
        const rawMin = def.target_metadata?.minRating || 8500;
        const minRatingMillis = rawMin > 10 ? rawMin : Math.round(rawMin * 1000);
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasGenre(m, reqGenre) || !movieHasTag(m, reqTag)) return false;
          const { ur } = extractCriticMetrics(m);
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          return urMillis !== null && urMillis > minRatingMillis;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const { ur } = extractCriticMetrics(m);
            return `${reqGenre} + [${reqTag}] | Minha Nota: ${ur !== null ? ur.toFixed(3) : '-'} (> 8.500)`;
          },
          `Pendente: ${reqGenre} com [${reqTag}] e Minha Nota > 8.500`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'rt_lt_ur_gte_count': {
        const maxRt = def.target_metadata?.maxRt ?? 40;
        const rawMin = def.target_metadata?.minRating || 8000;
        const minRatingMillis = rawMin > 10 ? rawMin : Math.round(rawMin * 1000);
        const matchingMovies = catalogMovies.filter((m: any) => {
          const { ur, rt } = extractCriticMetrics(m);
          if (rt === null || isNaN(rt) || rt >= maxRt) return false;
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          return urMillis !== null && urMillis >= minRatingMillis;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const { ur, rt } = extractCriticMetrics(m);
            return `RT: ${rt}% (< ${maxRt}%) | Minha Nota: ${ur !== null ? ur.toFixed(3) : '-'} (>= ${(minRatingMillis / 1000).toFixed(1)})`;
          },
          `Pendente: RT < ${maxRt}% com Minha Nota >= ${(minRatingMillis / 1000).toFixed(1)}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tags_or_physical_media_count': {
        const orTags: string[] = def.target_metadata?.orTags || ['Trágico', 'Emocionante'];
        const matchingMovies = catalogMovies.filter((m: any) => {
          const hasAnyTag = orTags.some((t: string) => movieHasTag(m, t));
          if (!hasAnyTag) return false;
          const plat = getMoviePlatform(m);
          return isPhysicalMedia(plat);
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matchedTag = orTags.find((t: string) => movieHasTag(m, t)) || 'Tag';
            const plat = getMoviePlatform(m);
            return `Tag [${matchedTag}] em Mídia Física (${plat})`;
          },
          `Pendente: [${orTags.join(' / ')}] em Mídia Física (Blu-ray ou DVD)`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_and_genres_or_year_range': {
        const reqTag = def.target_metadata?.tag || 'Repetido';
        const orGenres: string[] = def.target_metadata?.orGenres || ['Crime', 'Ação'];
        const minYear = def.target_metadata?.minYear || 1990;
        const maxYear = def.target_metadata?.maxYear || 2004;
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          const hasAnyGenre = orGenres.some((g: string) => movieHasGenre(m, g));
          if (!hasAnyGenre) return false;
          const relYear = getMovieReleaseYear(m);
          return relYear !== null && relYear >= minYear && relYear <= maxYear;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matchedGenre = orGenres.find((g: string) => movieHasGenre(m, g)) || 'Gênero';
            const relYear = getMovieReleaseYear(m);
            return `Tag [${reqTag}] | ${matchedGenre} | Lançado em ${relYear}`;
          },
          `Pendente: [${reqTag}] de ${orGenres.join(' ou ')} (${minYear}-${maxYear})`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'hyrule_triforce_checklist': {
        const poderTarget = Number(def.target_metadata?.poderTarget || 10);
        const sabedoriaTarget = Number(def.target_metadata?.sabedoriaTarget || 10);
        const coragemTarget = Number(def.target_metadata?.coragemTarget || 10);
        progressTarget = poderTarget + sabedoriaTarget + coragemTarget;

        const usedMovieIds = new Set<string | number>();

        // 1. Trilha do Poder (10): Ação ou Guerra com duração > 140 min
        const poderCandidates = catalogMovies.filter((m: any) => {
          const hasGenre = movieHasGenre(m, 'Ação') || movieHasGenre(m, 'Guerra');
          return hasGenre && getMovieRuntime(m) > 140;
        });
        let poderCount = 0;
        for (let i = 0; i < poderTarget; i++) {
          const m = poderCandidates.find((c: any) => !usedMovieIds.has(c.movie_id || (c as any).id));
          if (m && poderCount < poderTarget) {
            usedMovieIds.add(m.movie_id || (m as any).id);
            poderCount++;
            checklist.push({
              id: `${def.id}_poder_${i + 1}`,
              name: `Trilha do Poder: ${m.title}${m.release_year ? ` (${m.release_year})` : ''}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              movie_year: m.release_year,
              poster_url: m.poster_url || null,
              extra_info: `Duração: ${getMovieRuntime(m)} min | ${(m.genres || []).filter((g: string) => ['Ação', 'Guerra'].includes(g)).join('/')}`,
            });
          } else {
            checklist.push({
              id: `${def.id}_poder_${i + 1}`,
              name: `Trilha do Poder #${i + 1} (Ação/Guerra > 140m)`,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: '🔒 Pendente',
            });
          }
        }

        // 2. Trilha da Sabedoria (10): Documentário, História ou Biografia com Minha Nota >= 8.000
        const sabedoriaCandidates = catalogMovies.filter((m: any) => {
          const hasGenre =
            movieHasGenre(m, 'Documentário') ||
            movieHasGenre(m, 'Documentario') ||
            movieHasGenre(m, 'História') ||
            movieHasGenre(m, 'Historia') ||
            movieHasGenre(m, 'Biografia');
          if (!hasGenre) return false;
          const { ur } = extractCriticMetrics(m);
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          return urMillis !== null && urMillis >= 8000;
        });
        let sabedoriaCount = 0;
        for (let i = 0; i < sabedoriaTarget; i++) {
          const m = sabedoriaCandidates.find((c: any) => !usedMovieIds.has(c.movie_id || (c as any).id));
          if (m && sabedoriaCount < sabedoriaTarget) {
            usedMovieIds.add(m.movie_id || (m as any).id);
            sabedoriaCount++;
            const { ur } = extractCriticMetrics(m);
            checklist.push({
              id: `${def.id}_sabedoria_${i + 1}`,
              name: `Trilha da Sabedoria: ${m.title}${m.release_year ? ` (${m.release_year})` : ''}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              movie_year: m.release_year,
              poster_url: m.poster_url || null,
              extra_info: `Minha Nota: ${ur !== null ? ur.toFixed(3) : '8.000+'} | ${(m.genres || []).filter((g: string) => ['Documentário', 'Documentario', 'História', 'Historia', 'Biografia'].includes(g)).join('/')}`,
            });
          } else {
            checklist.push({
              id: `${def.id}_sabedoria_${i + 1}`,
              name: `Trilha da Sabedoria #${i + 1} (Doc/Hist/Bio c/ Nota ≥ 8.000)`,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: '🔒 Pendente',
            });
          }
        }

        // 3. Trilha da Coragem (10): Terror com tag Demônio, Gore ou Fantasma
        const coragemCandidates = catalogMovies.filter((m: any) => {
          if (!movieHasGenre(m, 'Terror')) return false;
          return (
            movieHasTag(m, 'Demônio') ||
            movieHasTag(m, 'Demonio') ||
            movieHasTag(m, 'Gore') ||
            movieHasTag(m, 'Fantasma')
          );
        });
        let coragemCount = 0;
        for (let i = 0; i < coragemTarget; i++) {
          const m = coragemCandidates.find((c: any) => !usedMovieIds.has(c.movie_id || (c as any).id));
          if (m && coragemCount < coragemTarget) {
            usedMovieIds.add(m.movie_id || (m as any).id);
            coragemCount++;
            const matchedTag = ['Demônio', 'Demonio', 'Gore', 'Fantasma'].find((t) => movieHasTag(m, t)) || 'Terror';
            checklist.push({
              id: `${def.id}_coragem_${i + 1}`,
              name: `Trilha da Coragem: ${m.title}${m.release_year ? ` (${m.release_year})` : ''}`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              movie_year: m.release_year,
              poster_url: m.poster_url || null,
              extra_info: `Terror com Tag [${matchedTag}]`,
            });
          } else {
            checklist.push({
              id: `${def.id}_coragem_${i + 1}`,
              name: `Trilha da Coragem #${i + 1} (Terror c/ Demônio, Gore ou Fantasma)`,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: '🔒 Pendente',
            });
          }
        }

        progressCurrent = poderCount + sabedoriaCount + coragemCount;
        isMet = poderCount >= poderTarget && sabedoriaCount >= sabedoriaTarget && coragemCount >= coragemTarget;
        break;
      }

      case 'tag_decades_checklist': {
        const reqTag = def.target_metadata?.tag || 'Bruxo';
        const decades: number[] = def.target_metadata?.decades || [1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030];
        progressTarget = def.target_value || decades.length;
        let countDecades = 0;

        for (const dec of decades) {
          const m = catalogMovies.find((cm: any) => {
            if (!movieHasTag(cm, reqTag)) return false;
            const y = getMovieReleaseYear(cm);
            return y !== null && y >= dec && y <= dec + 9;
          });

          if (m) {
            countDecades++;
            checklist.push({
              id: `${def.id}_dec_${dec}`,
              name: `Década de ${dec}s`,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              movie_year: m.release_year,
              poster_url: m.poster_url || null,
              extra_info: `✅ Conquistado (${m.title} - ${m.release_year})`,
            });
          } else {
            checklist.push({
              id: `${def.id}_dec_${dec}`,
              name: `Década de ${dec}s`,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: `🔒 Pendente (filme dos anos ${dec} c/ tag [${reqTag}])`,
            });
          }
        }

        progressCurrent = countDecades;
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genres_or_decade_range_count': {
        const genres: string[] = def.target_metadata?.genres || ['Ação', 'Aventura'];
        const minYear = Number(def.target_metadata?.minYear || 1980);
        const maxYear = Number(def.target_metadata?.maxYear || 1989);
        const matchingMovies = catalogMovies.filter((m: any) => {
          const hasAnyGenre = genres.some((g: string) => movieHasGenre(m, g));
          if (!hasAnyGenre) return false;
          const y = getMovieReleaseYear(m);
          return y !== null && y >= minYear && y <= maxYear;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matched = genres.filter((g: string) => movieHasGenre(m, g)).join('/');
            return `${matched} (${m.release_year})`;
          },
          `Pendente: ${genres.join(' ou ')} (${minYear}-${maxYear})`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'multi_critic_range_count': {
        const digit = Number(def.target_metadata?.digit || 6);
        const minMetrics = Number(def.target_metadata?.minDistinctMetrics || 3);
        const matchingMovies = catalogMovies.filter((m: any) => {
          const { ur, imdb, mc, rt } = extractCriticMetrics(m);
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          const inRt = rt !== null && rt >= digit * 10 && rt <= digit * 10 + 9;
          const inMc = mc !== null && mc >= digit * 10 && mc <= digit * 10 + 9;
          const inImdb = imdb !== null && imdb >= digit && imdb < digit + 1;
          const inUr = urMillis !== null && urMillis >= digit * 1000 && urMillis <= digit * 1000 + 999;
          const count = (inRt ? 1 : 0) + (inMc ? 1 : 0) + (inImdb ? 1 : 0) + (inUr ? 1 : 0);
          return count >= minMetrics;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const { ur, imdb, mc, rt } = extractCriticMetrics(m);
            const urMillis = ur !== null ? Math.round(ur * 1000) : null;
            const parts: string[] = [];
            if (rt !== null && rt >= digit * 10 && rt <= digit * 10 + 9) parts.push(`RT: ${rt}%`);
            if (mc !== null && mc >= digit * 10 && mc <= digit * 10 + 9) parts.push(`MC: ${mc}`);
            if (imdb !== null && imdb >= digit && imdb < digit + 1) parts.push(`IMDb: ${imdb.toFixed(1)}`);
            if (urMillis !== null && urMillis >= digit * 1000 && urMillis <= digit * 1000 + 999) parts.push(`Nota: ${ur!.toFixed(3)}`);
            return parts.join(' | ');
          },
          `Pendente: filme com 3+ notas na faixa do ${digit}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_and_tag_and_any_tag': {
        const reqGenre = def.target_metadata?.genre || 'Drama';
        const reqTag = def.target_metadata?.requiredTag || 'Em Família';
        const orTags: string[] = def.target_metadata?.orTags || ['Abuso Familiar', 'Preconceito'];
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasGenre(m, reqGenre)) return false;
          if (!movieHasTag(m, reqTag)) return false;
          return orTags.some((t: string) => movieHasTag(m, t));
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matchedOr = orTags.find((t: string) => movieHasTag(m, t)) || 'Tag';
            return `${reqGenre} + [${reqTag}] + [${matchedOr}]`;
          },
          `Pendente: ${reqGenre} com [${reqTag}] e [${orTags.join(' ou ')}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genres_or_and_tags_and': {
        const genres: string[] = def.target_metadata?.genres || ['Terror', 'Suspense'];
        const requiredTags: string[] = def.target_metadata?.requiredTags || ['Trágico', 'Final Epico'];
        const matchingMovies = catalogMovies.filter((m: any) => {
          const hasAnyGenre = genres.some((g: string) => movieHasGenre(m, g));
          if (!hasAnyGenre) return false;
          return requiredTags.every((t: string) => movieHasTag(m, t));
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matchedGenre = genres.find((g: string) => movieHasGenre(m, g)) || 'Gênero';
            return `${matchedGenre} | [${requiredTags.join(' + ')}]`;
          },
          `Pendente: ${genres.join(' ou ')} com tags [${requiredTags.join(' e ')}]`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_and_tags_or_max_rating': {
        const reqGenre = def.target_metadata?.genre || 'Ficção Científica';
        const orTags: string[] = def.target_metadata?.orTags || ['Dystopia', 'Viagem no Tempo'];
        const rawMax = def.target_metadata?.maxRating || 5000;
        const maxRatingMillis = rawMax > 10 ? rawMax : Math.round(rawMax * 1000);
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasGenre(m, reqGenre)) return false;
          const hasOrTag = orTags.some((t: string) => movieHasTag(m, t));
          if (!hasOrTag) return false;
          const { ur } = extractCriticMetrics(m);
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          return urMillis !== null && urMillis < maxRatingMillis;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const matchedTag = orTags.find((t: string) => movieHasTag(m, t)) || 'Tag';
            const { ur } = extractCriticMetrics(m);
            return `${reqGenre} [${matchedTag}] | Minha Nota: ${ur !== null ? ur.toFixed(3) : '-'}`;
          },
          `Pendente: ${reqGenre} c/ [${orTags.join(' ou ')}] e Minha Nota < ${(maxRatingMillis / 1000).toFixed(1)}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'stealth_suspense_crime_count': {
        const incGenres: string[] = def.target_metadata?.includeGenres || ['Suspense', 'Crime'];
        const incTags: string[] = def.target_metadata?.includeTags || ['Fatos reais', 'Sequestro'];
        const excGenres: string[] = def.target_metadata?.excludeGenres || ['Ação'];
        const excTags: string[] = def.target_metadata?.excludeTags || ['Gore'];

        const matchingMovies = catalogMovies.filter((m: any) => {
          const hasIncGenre = incGenres.some((g: string) => movieHasGenre(m, g));
          if (!hasIncGenre) return false;
          const hasIncTag = incTags.some((t: string) => movieHasTag(m, t));
          if (!hasIncTag) return false;
          const hasExcGenre = excGenres.some((g: string) => movieHasGenre(m, g));
          if (hasExcGenre) return false;
          const hasExcTag = excTags.some((t: string) => movieHasTag(m, t));
          if (hasExcTag) return false;
          return true;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const g = incGenres.find((genre: string) => movieHasGenre(m, genre)) || 'Gênero';
            const t = incTags.find((tag: string) => movieHasTag(m, tag)) || 'Tag';
            return `${g} + [${t}] (Sem Ação/Gore)`;
          },
          `Pendente: Suspense/Crime com [${incTags.join(' ou ')}] (sem Ação e sem Gore)`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'genre_max_runtime_count': {
        const reqGenre = def.target_metadata?.genre || 'Ação';
        const maxRuntime = Number(def.target_metadata?.maxRuntime || 90);
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasGenre(m, reqGenre)) return false;
          const r = getMovieRuntime(m);
          return r > 0 && r <= maxRuntime;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => `${reqGenre} (${getMovieRuntime(m)} min)`,
          `Pendente: ${reqGenre} com até ${maxRuntime} min`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'tag_max_rating_count': {
        const reqTag = def.target_metadata?.tag || 'Fatos reais';
        const rawMax = def.target_metadata?.maxRating || 6000;
        const maxRatingMillis = rawMax > 10 ? rawMax : Math.round(rawMax * 1000);
        const matchingMovies = catalogMovies.filter((m: any) => {
          if (!movieHasTag(m, reqTag)) return false;
          const { ur } = extractCriticMetrics(m);
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          return urMillis !== null && urMillis < maxRatingMillis;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const { ur } = extractCriticMetrics(m);
            return `Tag [${reqTag}] | Minha Nota: ${ur !== null ? ur.toFixed(3) : '-'}`;
          },
          `Pendente: [${reqTag}] com Minha Nota < ${(maxRatingMillis / 1000).toFixed(1)}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'bomba_ray_tracing_count': {
        const genres: string[] = def.target_metadata?.genres || ['Ficção Científica', 'Ação'];
        const minYear = Number(def.target_metadata?.minYear || 2021);
        const minReviews = Number(def.target_metadata?.minGlobalReviews || 500000);
        const rawMax = def.target_metadata?.maxRating || 5000;
        const maxRatingMillis = rawMax > 10 ? rawMax : Math.round(rawMax * 1000);

        const matchingMovies = catalogMovies.filter((m: any) => {
          const hasAnyGenre = genres.some((g: string) => movieHasGenre(m, g));
          if (!hasAnyGenre) return false;
          const y = getMovieReleaseYear(m);
          if (y === null || y < minYear) return false;
          const { ur, gr } = extractCriticMetrics(m);
          if (gr === null || gr <= minReviews) return false;
          const urMillis = ur !== null ? Math.round(ur * 1000) : null;
          return urMillis !== null && urMillis < maxRatingMillis;
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const { ur, gr } = extractCriticMetrics(m);
            return `${m.release_year} | Reviews: ${gr?.toLocaleString('pt-BR')} | Minha Nota: ${ur !== null ? ur.toFixed(3) : '-'}`;
          },
          `Pendente: Ficção/Ação >= ${minYear} c/ > ${minReviews.toLocaleString('pt-BR')} reviews e Nota < ${(maxRatingMillis / 1000).toFixed(1)}`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      case 'cinema_specific_months_count': {
        const months: number[] = def.target_metadata?.months || [2, 3, 9];
        const matchingMovies = catalogMovies.filter((m: any) => {
          const plat = getMoviePlatform(m);
          return isCinema(plat) && movieInMonth(m, months);
        });
        progressTarget = def.target_value;
        const res = buildMovieSlotsChecklist(
          matchingMovies,
          progressTarget,
          (m: any) => {
            const mIdx = Number(m.month_seen);
            return `Cinema em ${MONTH_NAMES[mIdx] || `Mês ${mIdx}`}`;
          },
          `Pendente: Filme no Cinema em Fevereiro, Março ou Setembro`
        );
        progressCurrent = res.progressCurrent;
        checklist.push(...res.checklist);
        isMet = progressCurrent >= progressTarget;
        break;
      }

      default:
        break;
    }

    // Calcula porcentagem do troféu
    const progressPct = progressTarget > 0 ? Math.min(100, Math.round((progressCurrent / progressTarget) * 100)) : 0;

    // Respeita override de teste se houver
    const prev = previousStateMap.get(def.id);
    const testOverride = prev?.test_override ?? null;

    let finalUnlocked = isMet;
    if (testOverride === true) finalUnlocked = true;
    if (testOverride === false) finalUnlocked = false;

    // Determina se é novo desbloqueio
    const wasUnlocked = Boolean(prev?.is_unlocked);
    const isNowUnlocked = finalUnlocked;
    const isNew = markNew && !wasUnlocked && isNowUnlocked;

    // REGRA DE OURO: Se o troféu já possui uma data original de conquista salva,
    // JAMAIS sobrescreva ou altere essa data existente!
    let unlockedAt = prev?.unlocked_at || null;
    if (unlockedAt) {
      if (!isNowUnlocked && testOverride === false) {
        unlockedAt = null;
      }
    } else if (isNowUnlocked) {
      unlockedAt = new Date().toISOString();
    }

    evaluatedTrophies.push({
      id: def.id,
      category: def.category,
      categories: def.categories || (def.target_metadata?.isHybrid ? ['volta_ao_mundo', 'dna_cinefilo'] : [def.category]),
      tier: def.tier,
      title: def.title,
      description: def.description,
      icon: def.icon,
      target_type: def.target_type,
      target_value: def.target_value,
      target_metadata: def.target_metadata,
      sort_order: def.sort_order,
      is_unlocked: isNowUnlocked,
      unlocked_at: unlockedAt,
      progress_current: progressCurrent,
      progress_target: progressTarget,
      progress_percentage: progressPct,
      checklist,
      is_new: isNew,
      test_override: testOverride,
    });

    if (!wasUnlocked && !isNowUnlocked && progressCurrent > (prev?.progress_current || 0)) {
      progressedTrophiesRaw.push({
        id: def.id,
        category: def.category,
        categories: def.categories || (def.target_metadata?.isHybrid ? ['volta_ao_mundo', 'dna_cinefilo'] : [def.category]),
        tier: def.tier,
        title: def.title,
        description: def.description,
        icon: def.icon,
        target_type: def.target_type,
        target_value: def.target_value,
        target_metadata: def.target_metadata,
        sort_order: def.sort_order,
        is_unlocked: false,
        unlocked_at: null,
        progress_current: progressCurrent,
        progress_target: progressTarget,
        progress_percentage: progressPct,
        checklist,
        is_new: false,
        test_override: testOverride,
        previousCount: prev?.progress_current || 0,
        currentCount: progressCurrent,
        targetCount: progressTarget,
        previousPercentage: prev?.progress_percentage || 0,
        increasedBy: progressCurrent - (prev?.progress_current || 0),
      });
    }
  }

  
  // 4. Avalia Troféus de PLATINA DINÂMICOS (1 por categoria independente)
  const platinumDefs = TROPHY_DEFINITIONS.filter(
    (t) => t.tier === 'platinum' || t.target_type === 'platinum_dynamic' || t.target_type === 'platinum_all_category'
  );
  for (const platDef of platinumDefs) {
    const targetCategory = platDef.target_metadata?.category || platDef.target_metadata?.categoryScope || platDef.category;
    const nonPlatinumTrophies = evaluatedTrophies.filter((t) => {
      if (t.id === platDef.id || t.tier === 'platinum' || t.target_type === 'platinum_dynamic' || t.target_type === 'platinum_all_category') return false;
      const cats = Array.isArray(t.categories) && t.categories.length > 0 ? t.categories : [t.category];
      return cats.includes(targetCategory);
    });
    const totalNonPlatinum = nonPlatinumTrophies.length;
    const unlockedNonPlatinum = nonPlatinumTrophies.filter((t) => t.is_unlocked).length;

    const platPct = totalNonPlatinum > 0 ? Math.round((unlockedNonPlatinum / totalNonPlatinum) * 100) : 0;
    const platMet = unlockedNonPlatinum === totalNonPlatinum && totalNonPlatinum > 0;

    const prevPlat = previousStateMap.get(platDef.id);
    const testOverridePlat = prevPlat?.test_override ?? null;

    let finalPlatUnlocked = platMet;
    if (testOverridePlat === true) finalPlatUnlocked = true;
    if (testOverridePlat === false) finalPlatUnlocked = false;

    const wasPlatUnlocked = Boolean(prevPlat?.is_unlocked);
    const isPlatNew = markNew && !wasPlatUnlocked && finalPlatUnlocked;

    // REGRA DE OURO (Platinas): Preserva a data original se já conquistada anteriormente
    let platUnlockedAt = prevPlat?.unlocked_at || null;
    if (platUnlockedAt) {
      if (!finalPlatUnlocked && testOverridePlat === false) {
        platUnlockedAt = null;
      }
    } else if (finalPlatUnlocked) {
      platUnlockedAt = new Date().toISOString();
    }

    const tierOrder: TrophyTier[] = ['bronze', 'silver', 'epic', 'gold', 'mythic'];
    const platChecklist: TrophyChecklistItem[] = tierOrder.map((tr) => {
      const inTier = nonPlatinumTrophies.filter((t) => t.tier === tr);
      const unqInTier = inTier.filter((t) => t.is_unlocked).length;
      return {
        name: `${TIER_CONFIG[tr].symbol} Troféus de ${TIER_CONFIG[tr].name}`,
        required: inTier.length,
        current: unqInTier,
        conquered: unqInTier === inTier.length && inTier.length > 0,
        extra_info: `${unqInTier} de ${inTier.length} conquistados (${inTier.length > 0 ? Math.round((unqInTier / inTier.length) * 100) : 0}%)`,
      };
    });

    evaluatedTrophies.push({
      id: platDef.id,
      category: platDef.category,
      categories: platDef.categories || [platDef.category],
      tier: platDef.tier,
      title: platDef.title,
      description: platDef.description,
      icon: platDef.icon,
      target_type: platDef.target_type,
      target_value: totalNonPlatinum,
      target_metadata: platDef.target_metadata,
      sort_order: platDef.sort_order,
      is_unlocked: finalPlatUnlocked,
      unlocked_at: platUnlockedAt,
      progress_current: unlockedNonPlatinum,
      progress_target: totalNonPlatinum,
      progress_percentage: platPct,
      checklist: platChecklist,
      is_new: isPlatNew,
      test_override: testOverridePlat,
    });
  }

  return { evaluatedTrophies, progressedTrophiesRaw };
}

export async function evaluateTrophies(
  options: { markNew?: boolean; recordLastMovie?: { movieId: number; title: string } } = {}
): Promise<TrophiesSummaryResponse> {
  await seedTrophies();

  const markNew = options.markNew ?? true;

  // 1. Obtém dados consolidados do desafio mundial e catálogo
  const worldData = await buildWorldChallengePayload();

  // 2. Lê o estado atual salvo de user_trophies e a última atividade registrada
  const [userTrophiesRes, lastActRes] = await Promise.all([
    query(`
      SELECT trophy_id, is_unlocked, unlocked_at, test_override, progress_current, progress_target, progress_percentage
      FROM user_trophies
    `),
    query(`SELECT movie_id, movie_title, recorded_at, entries FROM trophy_last_activity WHERE id = 1`),
  ]);

  const previousStateMap: PreviousTrophyStateMap = new Map();
  userTrophiesRes.rows.forEach((r) => {
    previousStateMap.set(r.trophy_id, {
      is_unlocked: Boolean(r.is_unlocked),
      unlocked_at: r.unlocked_at ? new Date(r.unlocked_at).toISOString() : null,
      test_override: r.test_override === null ? null : Boolean(r.test_override),
      progress_current: Number(r.progress_current) || 0,
      progress_target: Number(r.progress_target) || 1,
      progress_percentage: Number(r.progress_percentage) || 0,
    });
  });

  const { evaluatedTrophies, progressedTrophiesRaw } = evaluateDefinitionsFromWorldData(
    worldData,
    previousStateMap,
    markNew
  );
  const newlyUnlocked: EvaluatedTrophy[] = [];

  // 3. Registra (ou inicializa na 1ª carga) quais troféus evoluíram com o último filme cadastrado
  let lastActivity: TrophyLastActivity | null = null;
  if (lastActRes.rows.length > 0) {
    const row = lastActRes.rows[0];
    lastActivity = {
      movieId: row.movie_id ? Number(row.movie_id) : null,
      movieTitle: row.movie_title || null,
      recordedAt: row.recorded_at ? new Date(row.recorded_at).toISOString() : null,
      entries: Array.isArray(row.entries) ? row.entries : [],
    };
  }

  if (options.recordLastMovie) {
    const entries = buildLastActivityEntries((id) => previousStateMap.get(id), evaluatedTrophies);
    const nowIso = new Date().toISOString();
    lastActivity = {
      movieId: options.recordLastMovie.movieId,
      movieTitle: options.recordLastMovie.title,
      recordedAt: nowIso,
      entries,
    };
    await query(
      `
      INSERT INTO trophy_last_activity (id, movie_id, movie_title, recorded_at, entries)
      VALUES (1, $1, $2, CURRENT_TIMESTAMP, $3)
      ON CONFLICT (id) DO UPDATE SET
        movie_id = EXCLUDED.movie_id,
        movie_title = EXCLUDED.movie_title,
        recorded_at = CURRENT_TIMESTAMP,
        entries = EXCLUDED.entries;
      `,
      [options.recordLastMovie.movieId, options.recordLastMovie.title, JSON.stringify(entries)]
    );
  } else if (!lastActivity && Array.isArray(worldData.catalogMovies) && worldData.catalogMovies.length > 0) {
    const latestMovie = [...worldData.catalogMovies].sort(
      (a, b) => Number(b.movie_id) - Number(a.movie_id)
    )[0];
    if (latestMovie) {
      const overrideOnlyMap: PreviousTrophyStateMap = new Map();
      previousStateMap.forEach((st, id) => {
        if (st.test_override !== null) {
          overrideOnlyMap.set(id, { ...st, progress_current: 0, progress_percentage: 0 });
        }
      });
      const prevEval = evaluateDefinitionsFromWorldData(
        cloneWorldDataWithoutMovie(worldData, Number(latestMovie.movie_id)),
        overrideOnlyMap,
        false
      ).evaluatedTrophies;
      const prevEvalMap = new Map(prevEval.map((e) => [e.id, e]));
      const entries = buildLastActivityEntries((id) => prevEvalMap.get(id), evaluatedTrophies);
      const nowIso = new Date().toISOString();
      lastActivity = {
        movieId: Number(latestMovie.movie_id),
        movieTitle: String(latestMovie.title || latestMovie.original_title || 'Último filme cadastrado'),
        recordedAt: nowIso,
        entries,
      };
      await query(
        `
        INSERT INTO trophy_last_activity (id, movie_id, movie_title, recorded_at, entries)
        VALUES (1, $1, $2, CURRENT_TIMESTAMP, $3)
        ON CONFLICT (id) DO UPDATE SET
          movie_id = EXCLUDED.movie_id,
          movie_title = EXCLUDED.movie_title,
          recorded_at = CURRENT_TIMESTAMP,
          entries = EXCLUDED.entries;
        `,
        [lastActivity.movieId, lastActivity.movieTitle, JSON.stringify(entries)]
      );
    }
  }

  // 5. Salva estado avaliado no banco de dados
  for (const ev of evaluatedTrophies) {
    if (ev.is_new) {
      newlyUnlocked.push(ev);
    }

    await query(
      `
      INSERT INTO user_trophies (
        trophy_id, is_unlocked, unlocked_at, progress_current, progress_target,
        progress_percentage, checklist, is_new, test_override, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (trophy_id) DO UPDATE SET
        is_unlocked = EXCLUDED.is_unlocked,
        unlocked_at = CASE
          -- REGRA DE OURO: Se o troféu já foi conquistado e possui data salva, NUNCA sobrescreve a data original!
          WHEN user_trophies.unlocked_at IS NOT NULL AND EXCLUDED.is_unlocked = TRUE THEN user_trophies.unlocked_at
          WHEN user_trophies.unlocked_at IS NOT NULL AND (EXCLUDED.test_override IS NULL OR EXCLUDED.test_override = TRUE) THEN user_trophies.unlocked_at
          -- Primeira vez desbloqueado: grava data de agora
          WHEN EXCLUDED.is_unlocked = TRUE AND user_trophies.unlocked_at IS NULL THEN COALESCE(EXCLUDED.unlocked_at, CURRENT_TIMESTAMP)
          -- Revogação explícita de teste:
          WHEN EXCLUDED.is_unlocked = FALSE AND EXCLUDED.test_override = FALSE THEN NULL
          ELSE user_trophies.unlocked_at
        END,
        progress_current = EXCLUDED.progress_current,
        progress_target = EXCLUDED.progress_target,
        progress_percentage = EXCLUDED.progress_percentage,
        checklist = EXCLUDED.checklist,
        is_new = EXCLUDED.is_new,
        test_override = EXCLUDED.test_override,
        updated_at = CURRENT_TIMESTAMP;
    `,
      [
        ev.id,
        ev.is_unlocked,
        ev.unlocked_at,
        ev.progress_current,
        ev.progress_target,
        ev.progress_percentage,
        JSON.stringify(ev.checklist),
        ev.is_new,
        ev.test_override,
      ]
    );
  }

  // Ordena troféus pela ordem de exibição
  evaluatedTrophies.sort((a, b) => a.sort_order - b.sort_order);

  // 6. Monta resumo por Tier e Geral
  const tierStats: Record<TrophyTier, TrophyTierStats> = {
    bronze: { name: 'Bronze', color: '#CD7F32', symbol: '🥉', total: 0, unlocked: 0, percentage: 0 },
    silver: { name: 'Prata', color: '#C0C0C0', symbol: '🥈', total: 0, unlocked: 0, percentage: 0 },
    epic: { name: 'Épico', color: '#9B59B6', symbol: '💜', total: 0, unlocked: 0, percentage: 0 },
    gold: { name: 'Ouro', color: '#FFD700', symbol: '🥇', total: 0, unlocked: 0, percentage: 0 },
    mythic: { name: 'Mítico', color: '#EF4444', symbol: '💎', total: 0, unlocked: 0, percentage: 0 },
    platinum: { name: 'Platina', color: '#E5E4E2', symbol: '🏆', total: 0, unlocked: 0, percentage: 0 },
  };

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const t of evaluatedTrophies) {
    const tier = t.tier;
    const points = TIER_CONFIG[tier]?.points || 15;
    tierStats[tier].total++;
    totalPoints += points;
    if (t.is_unlocked) {
      tierStats[tier].unlocked++;
      earnedPoints += points;
    }
  }

  for (const tr of Object.keys(tierStats) as TrophyTier[]) {
    const st = tierStats[tr];
    st.percentage = st.total > 0 ? Math.round((st.unlocked / st.total) * 100) : 0;
  }

  const unlockedCount = evaluatedTrophies.filter((t) => t.is_unlocked).length;
  const overallPercentage = evaluatedTrophies.length > 0 ? Math.round((unlockedCount / evaluatedTrophies.length) * 100) : 0;
  const xpStatus = buildUserXpStatus(worldData, evaluatedTrophies);
  const progressedTrophies = filterProgressedTrophies(progressedTrophiesRaw);

  return {
    totalTrophies: evaluatedTrophies.length,
    unlockedCount,
    totalPoints,
    earnedPoints,
    overallPercentage,
    tierStats,
    trophies: evaluatedTrophies,
    newlyUnlocked,
    progressedTrophies,
    xpStatus,
    lastActivity,
  };
}

/**
 * Reconhece troféus recém-desbloqueados (limpa a flag is_new)
 */
export async function acknowledgeNewTrophies(trophyIds?: string[]): Promise<void> {
  await ensureTrophyTables();
  if (trophyIds && trophyIds.length > 0) {
    await query(`UPDATE user_trophies SET is_new = FALSE WHERE trophy_id = ANY($1)`, [trophyIds]);
  } else {
    await query(`UPDATE user_trophies SET is_new = FALSE WHERE is_new = TRUE`);
  }
}

/**
 * Força o estado de teste de um troféu específico (útil para homologação e debug)
 */
export async function setTrophyTestOverride(trophyId: string, overrideState: boolean | null): Promise<void> {
  await ensureTrophyTables();
  await query(
    `
    UPDATE user_trophies
    SET test_override = $2,
        is_unlocked = CASE WHEN $2 = TRUE THEN TRUE WHEN $2 = FALSE THEN FALSE ELSE is_unlocked END,
        unlocked_at = CASE WHEN $2 = TRUE THEN CURRENT_TIMESTAMP WHEN $2 = FALSE THEN NULL ELSE unlocked_at END,
        is_new = CASE WHEN $2 = TRUE THEN TRUE ELSE FALSE END
    WHERE trophy_id = $1;
  `,
    [trophyId, overrideState]
  );
}

/**
 * Reseta todos os overrides de teste e reavalia do zero
 */
export async function resetAllTrophyOverrides(): Promise<void> {
  await ensureTrophyTables();
  await query(`UPDATE user_trophies SET test_override = NULL, is_new = FALSE`);
}
