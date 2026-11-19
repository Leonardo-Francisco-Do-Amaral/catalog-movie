/**
 * Motor Local de Avaliação de Troféus (Client-Side Fallback & Instant Preview)
 * Espelha exatamente as regras, Ranks, Platinas e normalização canônica do backend.
 */
import { CLIENT_TROPHY_DEFINITIONS, TIER_CONFIG } from './trophyDefinitions';
import { HISTORICAL_TERRITORIES, UN_COUNTRIES_195 } from '../data/unCountries195';

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

const MONTH_NAMES = {
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

function cleanStr(str) {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function cleanTag(str) {
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

function normalizeCanonicalPlatform(rawPlatform) {
  const raw = String(rawPlatform ?? '').trim();
  if (!raw) return '';
  const compact = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!compact || compact === 'naoinformado' || compact === 'na' || compact === 'null' || compact === 'undefined') {
    return '';
  }
  if (compact === 'cinema' || compact.includes('cinema')) return 'Cinema';
  if (compact === 'bluray' || compact === 'bd') return 'Blu-ray';
  if (compact === 'dvd') return 'DVD';
  if (compact === 'netflix') return 'Netflix';
  if (compact === 'primevideo' || compact === 'amazonprime' || compact === 'amazonprimevideo' || compact === 'prime') {
    return 'Prime Video';
  }
  if (compact === 'hbomax' || compact === 'max' || compact === 'hbo') return 'Max (HBO Max)';
  if (compact === 'disney' || compact === 'disneyplus') return 'Disney+';
  if (compact === 'star' || compact === 'starplus') return 'Star+';
  if (compact === 'appletv' || compact === 'appletvplus' || compact === 'aplletv' || compact === 'apple') {
    return 'Apple TV+';
  }
  if (compact === 'youtube' || compact === 'yt') return 'YouTube';
  if (compact === 'myfamilycine' || compact === 'mfc') return 'My Family Cine';
  if (compact === 'internet') return 'Internet';
  if (compact === 'globoplay') return 'Globoplay';
  if (compact === 'paramount' || compact === 'paramountplus') return 'Paramount+';
  if (compact === 'telecine') return 'Telecine';
  if (compact === 'mubi') return 'MUBI';
  if (compact === 'looke') return 'Looke';
  if (compact === 'tv' || compact === 'televisao') return 'TV';
  return raw;
}

const isPhysicalMedia = (p) => p === 'Blu-ray' || p === 'DVD';
const isCinema = (p) => p === 'Cinema';
const isYouTube = (p) => p === 'YouTube';
const isHboMax = (p) => p === 'Max (HBO Max)';
const isNetflix = (p) => p === 'Netflix';
const isInternet = (p) => p === 'Internet';
const isPrimeVideo = (p) => p === 'Prime Video';
const isMyFamilyCine = (p) => p === 'My Family Cine';
const isOfficialStreaming = (p) =>
  p === 'Netflix' || p === 'Prime Video' || p === 'Max (HBO Max)' || p === 'Disney+' || p === 'Star+' || p === 'Apple TV+';
const isFreeStreaming = (p) => p === 'Internet' || p === 'My Family Cine' || p === 'YouTube';
const isInternetOrMfc = (p) => p === 'Internet' || p === 'My Family Cine';

const isDubbed = (a) => a.includes('dublado');
const isSubtitled = (a) => a.includes('legendado');
const isOriginalAudio = (a) => a === 'original' || a.includes('idioma original');
const isYouTubeSubtitled = (p, a) => a.includes('legendado pelo youtube') || (p === 'YouTube' && a.includes('legendado'));

function parseStrictScore(val) {
  if (val === null || val === undefined || typeof val === 'boolean') return null;
  if (typeof val === 'number') return Number.isNaN(val) || !Number.isFinite(val) ? null : val;
  let s = String(val).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (['n/a', 'na', 'null', 'undefined', '-', 'none'].includes(lower)) return null;
  if (s.includes('/')) s = s.split('/')[0].trim();
  s = s.replace(/%/g, '').replace(',', '.').trim();
  if (!s) return null;
  const num = Number(s);
  return Number.isNaN(num) || !Number.isFinite(num) ? null : num;
}

function parseGlobalReviews(val) {
  if (val === null || val === undefined || typeof val === 'boolean') return null;
  if (typeof val === 'number') return Number.isNaN(val) || !Number.isFinite(val) || val < 0 ? null : Math.round(val);
  const s = String(val).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (['n/a', 'na', 'null', 'undefined', '-', 'none'].includes(lower)) return null;
  const upper = s.toUpperCase();
  if (upper.endsWith('M')) {
    const n = parseFloat(upper.slice(0, -1).replace(',', '.').trim());
    return Number.isNaN(n) || n < 0 ? null : Math.round(n * 1_000_000);
  }
  if (upper.endsWith('K')) {
    const n = parseFloat(upper.slice(0, -1).replace(',', '.').trim());
    return Number.isNaN(n) || n < 0 ? null : Math.round(n * 1_000);
  }
  const cleaned = s.replace(/[.,\s]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}

function getTitleLetters(rawTitle) {
  if (!rawTitle) return [];
  const normalized = String(rawTitle)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/^["'“‘([\-–—\s]+/, '');
  const letters = new Set();
  const m1 = normalized.match(/^[a-zA-Z]/);
  if (m1) letters.add(m1[0].toUpperCase());
  const m2 = normalized.match(/^(o|a|os|as|the|um|uma|an)\s+([a-zA-Z])/i);
  if (m2 && m2[2]) letters.add(m2[2].toUpperCase());
  return Array.from(letters);
}

const unByCode = new Map();
const unLookupMap = new Map();
for (const c of UN_COUNTRIES_195) {
  const code = c.code.toLowerCase();
  unByCode.set(code, c);
  unLookupMap.set(cleanStr(code), code);
  unLookupMap.set(cleanStr(c.iso3), code);
  unLookupMap.set(cleanStr(c.name), code);
  if (Array.isArray(c.aliases)) {
    for (const a of c.aliases) unLookupMap.set(cleanStr(a), code);
  }
}
for (const h of HISTORICAL_TERRITORIES) {
  const code = h.code.toLowerCase();
  unLookupMap.set(cleanStr(code), code);
  unLookupMap.set(cleanStr(h.name), code);
  if (Array.isArray(h.aliases)) {
    for (const a of h.aliases) unLookupMap.set(cleanStr(a), code);
  }
}

const ALL_21_GENRES_SET = new Set(ALL_21_GENRES.map(cleanTag));

function addTokens(set, displayMap, rawList, stripParens = false) {
  if (!rawList) return;
  const items = Array.isArray(rawList)
    ? rawList.map((x) => (typeof x === 'string' ? x : x?.name || '')).filter(Boolean)
    : String(rawList) === 'N/A'
      ? []
      : String(rawList).split(',');
  for (const r of items) {
    let val = String(r).trim();
    if (stripParens) val = val.replace(/\([^)]*\)/g, '').trim();
    if (!val || val.toUpperCase() === 'N/A') continue;
    const norm = cleanStr(val);
    if (!norm) continue;
    set.add(norm);
    if (displayMap && !displayMap.has(norm)) displayMap.set(norm, val);
  }
}

function pushMap(map, key, val) {
  const arr = map.get(key);
  if (arr) arr.push(val);
  else map.set(key, [val]);
}

function buildClientCatalogIndex(rawMovies) {
  const movies = [];
  const moviesByMonth = new Map();
  const moviesByRelYear = new Map();
  const moviesByTag = new Map();
  const moviesByGenre = new Map();
  const moviesByCountryAll = new Map();
  const moviesByCountryPrimary = new Map();
  const moviesByContinent = new Map();
  const moviesByPlatform = new Map();
  const directorToMovies = new Map();
  const writerToMovies = new Map();

  let totalRuntimeMinutes = 0;
  let maxCatalogYear = 2023;

  for (let i = 0; i < rawMovies.length; i++) {
    const m = rawMovies[i];
    const movieId = m.movie_id ?? m.id ?? `m_${i}`;
    const title = String(m.title ?? '');
    const originalTitle = String(m.original_title ?? '');
    const relY = Number(m.release_year ?? m.ano_lancamento ?? m.ano);
    const releaseYear = !Number.isNaN(relY) && relY > 1800 ? relY : null;
    if (releaseYear && releaseYear > maxCatalogYear && releaseYear <= 2050) maxCatalogYear = releaseYear;

    const ys = Number(m.year_seen ?? m.ano_visto);
    const yearSeen = !Number.isNaN(ys) && ys > 1800 ? ys : null;
    const ms = Number(m.month_seen ?? m.mes_visto);
    const monthSeen = !Number.isNaN(ms) && ms >= 1 && ms <= 12 ? ms : null;
    const rt = Number(m.runtime ?? m.duracao ?? m.min);
    const runtime = !Number.isNaN(rt) && rt > 0 ? rt : 0;
    totalRuntimeMinutes += runtime;

    const canonicalPlatform = normalizeCanonicalPlatform(m.platform ?? m.plataforma ?? '');
    const audioLower = String(m.audio_type ?? m.audio ?? '').trim().toLowerCase();
    const titleLetters = new Set([...getTitleLetters(title), ...getTitleLetters(originalTitle)]);

    const tagsSet = new Set();
    const tagEntries = [];
    for (const rawT of Array.isArray(m.tags) ? m.tags : []) {
      const s = String(rawT ?? '').trim();
      const c = cleanTag(s);
      if (s && c && !tagsSet.has(c)) {
        tagsSet.add(c);
        tagEntries.push({ raw: s, clean: c });
      }
    }

    const genresSet = new Set();
    const genresRaw = Array.isArray(m.genres) ? m.genres.filter(Boolean) : [];
    for (const rawG of genresRaw) {
      const c = cleanTag(rawG);
      if (c) genresSet.add(c);
    }
    let all21GenresCount = 0;
    for (const cg of genresSet) {
      if (ALL_21_GENRES_SET.has(cg)) all21GenresCount++;
    }

    const allCountryCodes = new Set();
    if (m.primaryCountryCode) allCountryCodes.add(String(m.primaryCountryCode).toLowerCase());
    if (Array.isArray(m.coproductionCountries)) {
      for (const cc of m.coproductionCountries) if (cc?.code) allCountryCodes.add(String(cc.code).toLowerCase());
    }
    if (Array.isArray(m.countries)) {
      for (const rc of m.countries) {
        const mapped = unLookupMap.get(cleanStr(rc));
        if (mapped) allCountryCodes.add(mapped);
      }
    }

    let rawPrimary = m.primaryCountryCode ? String(m.primaryCountryCode).toLowerCase() : null;
    if (!rawPrimary && Array.isArray(m.countries) && m.countries.length === 1) {
      rawPrimary = unLookupMap.get(cleanStr(m.countries[0])) || null;
    }
    const primaryCountryCode195 = rawPrimary && unByCode.has(rawPrimary) ? rawPrimary : null;

    const continentsSet = new Set();
    for (const code of allCountryCodes) {
      const def = unByCode.get(code);
      if (def?.continent) continentsSet.add(cleanStr(def.continent));
    }

    const rawApi = m.raw_api_data || {};
    const directors = new Set();
    const directorsDisplay = new Map();
    addTokens(directors, directorsDisplay, m.directors ?? m.director);
    addTokens(directors, directorsDisplay, rawApi.omdb?.Director);
    const writers = new Set();
    const writersDisplay = new Map();
    addTokens(writers, writersDisplay, m.writers ?? m.writer, true);
    addTokens(writers, writersDisplay, rawApi.omdb?.Writer, true);
    const producers = new Set();
    addTokens(producers, null, m.producers ?? m.producer);
    const studios = new Set();
    addTokens(studios, null, m.studios ?? m.production_companies ?? m.studio);
    const distributors = new Set();
    addTokens(distributors, null, m.distributors ?? m.distributor);
    addTokens(distributors, null, rawApi.omdb?.Production);
    const companies = new Set([...studios, ...distributors]);

    const ur = parseStrictScore(m.user_rating_raw ?? m.minha_nota ?? m.user_rating);
    const imdb = parseStrictScore(m.imdb_rating ?? m.imdb);
    const mc = parseStrictScore(m.metacritic_score ?? m.metacritic);
    const rts = parseStrictScore(m.rotten_tomatoes_score ?? m.rotten_tomatoes);
    const gr = parseGlobalReviews(m.global_reviews ?? m.vote_count ?? rawApi.omdb?.imdbVotes ?? rawApi.tmdb?.vote_count);

    const indexed = {
      raw: m,
      movieId,
      title,
      originalTitle,
      releaseYear,
      monthSeen,
      yearSeen,
      runtime,
      posterUrl: m.poster_url || null,
      oscarWins: Number(m.oscar_wins) || 0,
      oscarNoms: Number(m.oscar_nominations) || 0,
      canonicalPlatform,
      audioLower,
      titleLetters,
      tagsSet,
      tagEntries,
      genresSet,
      genresRaw,
      all21GenresCount,
      primaryCountryCode195,
      rawPrimaryCountryCode: rawPrimary,
      primaryCountryName: (primaryCountryCode195 && unByCode.get(primaryCountryCode195)?.name) || m.primaryCountryName || null,
      allCountryCodes,
      continentsSet,
      directors,
      writers,
      producers,
      studios,
      distributors,
      companies,
      ur,
      urMillis: ur !== null ? Math.round(ur * 1000) : null,
      imdb,
      imdbMillis: imdb !== null ? Math.round(imdb * 1000) : null,
      mc,
      rt: rts,
      gr,
    };

    movies.push(indexed);
    if (monthSeen !== null) pushMap(moviesByMonth, monthSeen, indexed);
    if (releaseYear !== null) pushMap(moviesByRelYear, releaseYear, indexed);
    if (canonicalPlatform) pushMap(moviesByPlatform, canonicalPlatform, indexed);
    for (const t of tagsSet) pushMap(moviesByTag, t, indexed);
    for (const g of genresSet) pushMap(moviesByGenre, g, indexed);
    for (const cc of allCountryCodes) pushMap(moviesByCountryAll, cc, indexed);
    if (primaryCountryCode195) pushMap(moviesByCountryPrimary, primaryCountryCode195, indexed);
    for (const ct of continentsSet) pushMap(moviesByContinent, ct, indexed);

    for (const dNorm of directors) {
      const e = directorToMovies.get(dNorm);
      if (e) e.movies.push(indexed);
      else directorToMovies.set(dNorm, { displayName: directorsDisplay.get(dNorm) || dNorm, movies: [indexed] });
    }
    for (const wNorm of writers) {
      const e = writerToMovies.get(wNorm);
      if (e) e.movies.push(indexed);
      else writerToMovies.set(wNorm, { displayName: writersDisplay.get(wNorm) || wNorm, movies: [indexed] });
    }
  }

  // Mapa Desafio 195 + Territórios Históricos
  const unCountriesMap = new Map();
  for (const c of UN_COUNTRIES_195) {
    const code = c.code.toLowerCase();
    const list = moviesByCountryPrimary.get(code) || [];
    const sorted = [...list].sort((a, b) => (b.urMillis || 0) - (a.urMillis || 0));
    const champ = sorted[0];
    unCountriesMap.set(code, {
      ...c,
      code,
      status: list.length > 0 ? 'conquered' : 'unconquered',
      champion: champ ? { title: champ.title, release_year: champ.releaseYear, poster_url: champ.posterUrl } : null,
    });
  }

  const historicalCountriesMap = new Map();
  for (const h of HISTORICAL_TERRITORIES) {
    const code = h.code.toLowerCase();
    const list = movies.filter((mv) => mv.rawPrimaryCountryCode === code);
    const sorted = [...list].sort((a, b) => (b.urMillis || 0) - (a.urMillis || 0));
    const champ = sorted[0];
    historicalCountriesMap.set(code, {
      ...h,
      code,
      status: list.length > 0 ? 'conquered' : 'unconquered',
      champion: champ ? { title: champ.title, release_year: champ.releaseYear, poster_url: champ.posterUrl } : null,
    });
  }

  const allCountriesAndHistoricalMap = new Map([...unCountriesMap, ...historicalCountriesMap]);
  const conqueredCountries = Array.from(unCountriesMap.values()).filter((c) => c.status === 'conquered');

  return {
    movies,
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
    unCountryDefMap: unByCode,
    unCountriesMap,
    historicalCountriesMap,
    allCountriesAndHistoricalMap,
    conqueredCountries,
  };
}

const hasCountry = (m, c) => m.allCountryCodes.has(String(c).toLowerCase());
const hasGenre = (m, g) => m.genresSet.has(cleanTag(g));
const hasTag = (m, t) => m.tagsSet.has(cleanTag(t));
const inMonth = (m, month) => (m.monthSeen === null ? false : Array.isArray(month) ? month.includes(m.monthSeen) : m.monthSeen === month);
const hasPattern = (set, pats) => {
  const cp = (pats || []).map(cleanStr);
  for (const v of set) for (const p of cp) if (p && v.includes(p)) return true;
  return false;
};
const fmtUr = (v) => v.toFixed(3);
const fmtImdb = (v) => v.toFixed(1);
const fmtGr = (v) => v.toLocaleString('pt-BR');

function evalCritic(m, key) {
  const { ur, urMillis, imdb, imdbMillis, mc, rt, gr } = m;
  switch (key) {
    case 'ur_gte_9000': return ur !== null && urMillis >= 9000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'ur_lte_3000': return ur !== null && urMillis <= 3000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'rt_gte_90': return rt !== null && rt >= 90 ? { matched: true, extraInfo: `RT: ${rt}%`, sortScore: rt } : null;
    case 'imdb_gte_80': return imdb !== null && imdbMillis >= 8000 ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)}`, sortScore: imdbMillis } : null;
    case 'gr_gte_1m': return gr !== null && gr >= 1_000_000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)}`, sortScore: gr } : null;
    case 'gr_lt_5k': return gr !== null && gr < 5_000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)}`, sortScore: -gr } : null;
    case 'only_rt_na': return rt === null && mc !== null ? { matched: true, extraInfo: `RT: N/A | MC: ${mc}`, sortScore: mc } : null;
    case 'only_mc_na': return mc === null && rt !== null ? { matched: true, extraInfo: `MC: N/A | RT: ${rt}%`, sortScore: rt } : null;
    case 'gr_gt_1m_imdb_lt_70': return gr !== null && gr > 1_000_000 && imdb !== null && imdbMillis < 7000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | IMDb: ${fmtImdb(imdb)}`, sortScore: gr } : null;
    case 'gr_lt_1k': return gr !== null && gr < 1_000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)}`, sortScore: -gr } : null;
    case 'gr_lt_10k_ur_gte_8000': return gr !== null && gr < 10_000 && ur !== null && urMillis >= 8000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'rt_lt_40_ur_gte_7500': return rt !== null && rt < 40 && ur !== null && urMillis >= 7500 ? { matched: true, extraInfo: `RT: ${rt}% | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'mc_gte_80_ur_lte_6000': return mc !== null && mc >= 80 && ur !== null && urMillis <= 6000 ? { matched: true, extraInfo: `MC: ${mc} | Nota: ${fmtUr(ur)}`, sortScore: mc } : null;
    case 'ur_pharmacist_decimals': return ur !== null && urMillis % 1000 !== 0 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'both_mc_rt_na': return mc === null && rt === null ? { matched: true, extraInfo: 'MC: N/A | RT: N/A', sortScore: urMillis || 0 } : null;
    case 'rt_80_to_89': return rt !== null && rt >= 80 && rt <= 89 ? { matched: true, extraInfo: `RT: ${rt}%`, sortScore: rt } : null;
    case 'ur_6000_to_7000': return ur !== null && urMillis >= 6000 && urMillis <= 7000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'gr_500k_to_1m': return gr !== null && gr >= 500_000 && gr <= 1_000_000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)}`, sortScore: gr } : null;
    case 'imdb_lt_65_mc_gt_70': return imdb !== null && imdbMillis < 6500 && mc !== null && mc > 70 ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | MC: ${mc}`, sortScore: mc } : null;
    case 'ur_gte_9500': return ur !== null && urMillis >= 9500 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'gr_lt_100': return gr !== null && gr < 100 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)}`, sortScore: -gr } : null;
    case 'ur_gte_9000_imdb_lt_60': return ur !== null && urMillis >= 9000 && imdb !== null && imdbMillis < 6000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)}`, sortScore: urMillis } : null;
    case 'four_scores_spread_40': {
      if (ur !== null && imdb !== null && mc !== null && rt !== null) {
        const scores = [ur * 10, imdb * 10, mc, rt];
        const diff = Math.max(...scores) - Math.min(...scores);
        if (diff >= 40) return { matched: true, extraInfo: `Amplitude: ${diff.toFixed(1)}`, sortScore: diff };
      }
      return null;
    }
    case 'ur_gt_8000_imdb_lt_60_mc_lt_50_rt_lt_50': return ur !== null && urMillis > 8000 && imdb !== null && imdbMillis < 6000 && mc !== null && mc < 50 && rt !== null && rt < 50 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'rt_eq_100': return rt === 100 ? { matched: true, extraInfo: 'RT: 100%', sortScore: urMillis || 100 } : null;
    case 'mc_gte_90': return mc !== null && mc >= 90 ? { matched: true, extraInfo: `MC: ${mc}`, sortScore: mc } : null;
    case 'ur_lte_2000_imdb_lt_50': return ur !== null && urMillis <= 2000 && imdb !== null && imdbMillis < 5000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'gr_100_to_500': return gr !== null && gr >= 100 && gr <= 500 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)}`, sortScore: gr } : null;
    case 'ur_gte_9700': return ur !== null && urMillis >= 9700 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'ur_90_imdb_80_rt_90_mc_90': return ur !== null && urMillis >= 9000 && imdb !== null && imdbMillis >= 8000 && rt !== null && rt >= 90 && mc !== null && mc >= 90 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)} | 4 notas top`, sortScore: urMillis } : null;
    case 'ur_gte_8500': return ur !== null && urMillis >= 8500 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'red_critic_lt_45_ur_gte_8500': return rt !== null && rt < 45 && mc !== null && mc < 45 && imdb !== null && imdbMillis < 6000 && ur !== null && urMillis >= 8500 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'imdb_gte_80_rt_gte_85': return imdb !== null && imdbMillis >= 8000 && rt !== null && rt >= 85 ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | RT: ${rt}%`, sortScore: imdbMillis } : null;
    case 'gr_lt_5k_ur_gte_8500': return gr !== null && gr < 5_000 && ur !== null && urMillis >= 8500 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'imdb_lt_50_ur_gte_7500': return imdb !== null && imdbMillis < 5000 && ur !== null && urMillis >= 7500 ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'checkpoint_777': return ur !== null && urMillis >= 7000 && urMillis <= 7999 && imdb !== null && imdbMillis >= 7000 && imdbMillis <= 7999 && rt !== null && rt >= 70 && rt <= 79 && mc !== null && mc >= 70 && mc <= 79 ? { matched: true, extraInfo: `7777: ${fmtUr(ur)}/${fmtImdb(imdb)}/${rt}%/${mc}`, sortScore: urMillis } : null;
    case 'ur_gte_9750': return ur !== null && urMillis >= 9750 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'ur_90_imdb_80_rt_88_mc_85': return ur !== null && urMillis >= 9000 && imdb !== null && imdbMillis >= 8000 && rt !== null && rt >= 88 && mc !== null && mc >= 85 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'gr_lt_100k_ur_gte_8000': return gr !== null && gr < 100_000 && ur !== null && urMillis >= 8000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'fr_ur_lt_5000': return hasCountry(m, 'fr') && ur !== null && urMillis < 5000 ? { matched: true, extraInfo: `França | Nota: ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'xmen_ur_lt_7000': return hasTag(m, 'X-Men') && ur !== null && urMillis < 7000 ? { matched: true, extraInfo: `X-Men | Nota: ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'natal_ur_gt_7000': return hasTag(m, 'Natal') && ur !== null && urMillis > 7000 ? { matched: true, extraInfo: `Natal | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'game_rt_lt_50_ur_gte_7000': return hasTag(m, 'Baseado em jogo') && rt !== null && rt < 50 && ur !== null && urMillis >= 7000 ? { matched: true, extraInfo: `Jogo | RT: ${rt}% | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'comedia_ur_gte_8500': return hasGenre(m, 'Comédia') && ur !== null && urMillis >= 8500 ? { matched: true, extraInfo: `Comédia | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'terror_imdb_lt_55_outubro': return hasGenre(m, 'Terror') && imdb !== null && imdbMillis < 5500 && inMonth(m, 10) ? { matched: true, extraInfo: `Terror Out | IMDb: ${fmtImdb(imdb)}`, sortScore: -imdbMillis } : null;
    case 'non_us_gr_gt_1m': return !hasCountry(m, 'us') && gr !== null && gr > 1_000_000 ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)}`, sortScore: gr } : null;
    case 'br_gr_gt_100k': return hasCountry(m, 'br') && gr !== null && gr > 100_000 ? { matched: true, extraInfo: `Brasil | Reviews: ${fmtGr(gr)}`, sortScore: gr } : null;
    case 'br_gr_lt_1k': return hasCountry(m, 'br') && gr !== null && gr < 1_000 ? { matched: true, extraInfo: `Brasil | Reviews: ${fmtGr(gr)}`, sortScore: -gr } : null;
    case 'a24_ur_gt_8000': return hasPattern(m.companies, ['a24']) && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `A24 | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'oscar_winner_gr_lt_300k': return m.oscarWins >= 1 && gr !== null && gr < 300_000 ? { matched: true, extraInfo: `Oscar | Reviews: ${fmtGr(gr)}`, sortScore: -gr } : null;
    case 'agosto_ur_gt_7000': return inMonth(m, 8) && ur !== null && urMillis > 7000 ? { matched: true, extraInfo: `Agosto | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'gore_rt_gt_90': return hasTag(m, 'Gore') && rt !== null && rt > 90 ? { matched: true, extraInfo: `Gore | RT: ${rt}%`, sortScore: rt } : null;
    case 'musica_ur_gt_9000': return hasGenre(m, 'Música') && ur !== null && urMillis > 9000 ? { matched: true, extraInfo: `Música | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'marvel_dc_ur_gt_8500': return (hasTag(m, 'Marvel') || hasTag(m, 'DC')) && ur !== null && urMillis > 8500 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'sk_ur_gte_8000': return hasTag(m, 'SK') && ur !== null && urMillis >= 8000 ? { matched: true, extraInfo: `SK | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'oscar_acclaimed_ur_lte_6000': return (m.oscarNoms >= 1 || m.oscarWins >= 1) && ((rt !== null && rt >= 80) || (imdb !== null && imdbMillis >= 7500)) && ur !== null && urMillis <= 6000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'terror_ur_gt_8000': return hasGenre(m, 'Terror') && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `Terror | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'emocionante_abuso_familiar_ur_gt_8000': return hasTag(m, 'Emocionante') && hasTag(m, 'Abuso Familiar') && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'br_drama_ur_gt_9000': return hasCountry(m, 'br') && hasGenre(m, 'Drama') && ur !== null && urMillis > 9000 ? { matched: true, extraInfo: `BR Drama | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'oscar_winner_gr_lt_500k': return m.oscarWins >= 1 && gr !== null && gr < 500_000 ? { matched: true, extraInfo: `Oscar | Reviews: ${fmtGr(gr)}`, sortScore: -gr } : null;
    case 'final_epico_ur_gt_9000': return hasTag(m, 'Final Epico') && ur !== null && urMillis > 9000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'animacao_ur_gt_8500_rt_gt_90': return hasGenre(m, 'Animação') && ur !== null && urMillis > 8500 && rt !== null && rt > 90 ? { matched: true, extraInfo: `RT: ${rt}% | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'non_us_non_br_gr_lt_50k_ur_gt_8000': return !hasCountry(m, 'us') && !hasCountry(m, 'br') && gr !== null && gr < 50_000 && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'blumhouse_terror_suspense_ur_gt_8000': return hasPattern(m.companies, ['blumhouse']) && (hasGenre(m, 'Terror') || hasGenre(m, 'Suspense')) && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `Blumhouse | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'dezembro_ur_gte_8500': return inMonth(m, 12) && ur !== null && urMillis >= 8500 ? { matched: true, extraInfo: `Dezembro | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'top250_ur_lt_7500': return hasTag(m, 'TOP250') && ur !== null && urMillis < 7500 ? { matched: true, extraInfo: `TOP250 | Nota: ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'terror_imdb_lt_65_ur_gt_8000': return hasGenre(m, 'Terror') && imdb !== null && imdbMillis < 6500 && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'lgbt_drama_romance_ur_gt_8500_rt_gt_80': return (hasGenre(m, 'Drama') || hasGenre(m, 'Romance')) && hasTag(m, 'Personagem LGBT') && ur !== null && urMillis > 8500 ? { matched: true, extraInfo: `LGBT • Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'oscar_winner_ur_gte_9000': return m.oscarWins >= 1 && ur !== null && urMillis >= 9000 ? { matched: true, extraInfo: `Oscar | Nota: ${fmtUr(ur)}`, sortScore: urMillis } : null;
    default: return null;
  }
}

function evalRitual(m, key) {
  const { runtime, releaseYear: relYear, yearSeen, canonicalPlatform: plat, audioLower: audio } = m;
  switch (key) {
    case 'cinema_count': return isCinema(plat) ? { matched: true, extraInfo: `Cinema`, sortScore: yearSeen || 0 } : null;
    case 'audio_original_count': return isOriginalAudio(audio) ? { matched: true, extraInfo: `Áudio Original`, sortScore: yearSeen || 0 } : null;
    case 'runtime_lte_15': return runtime > 0 && runtime <= 15 ? { matched: true, extraInfo: `${runtime} min`, sortScore: -runtime } : null;
    case 'runtime_eq_120': return runtime === 120 ? { matched: true, extraInfo: '120 min', sortScore: yearSeen || 0 } : null;
    case 'physical_media_count': return isPhysicalMedia(plat) ? { matched: true, extraInfo: plat, sortScore: yearSeen || 0 } : null;
    case 'youtube_subtitled_count': return isYouTubeSubtitled(plat, audio) ? { matched: true, extraInfo: 'YouTube Legendado', sortScore: yearSeen || 0 } : null;
    case 'youtube_count': return isYouTube(plat) ? { matched: true, extraInfo: 'YouTube', sortScore: yearSeen || 0 } : null;
    case 'cinema_legendado_count': return isCinema(plat) && isSubtitled(audio) ? { matched: true, extraInfo: 'Cinema Legendado', sortScore: yearSeen || 0 } : null;
    case 'audio_dublado_count': return isDubbed(audio) ? { matched: true, extraInfo: 'Dublado', sortScore: yearSeen || 0 } : null;
    case 'audio_legendado_count': return isSubtitled(audio) ? { matched: true, extraInfo: 'Legendado', sortScore: yearSeen || 0 } : null;
    case 'year_eq_1994': return relYear === 1994 ? { matched: true, extraInfo: '1994', sortScore: 1994 } : null;
    case 'year_eq_2012': return relYear === 2012 ? { matched: true, extraInfo: '2012', sortScore: 2012 } : null;
    case 'same_year_seen_release': return relYear !== null && yearSeen !== null && relYear === yearSeen ? { matched: true, extraInfo: `${relYear}`, sortScore: relYear } : null;
    case 'year_between_1920_1940': return relYear !== null && relYear >= 1920 && relYear <= 1940 ? { matched: true, extraInfo: `${relYear}`, sortScore: relYear } : null;
    case 'prime_video_same_year': return isPrimeVideo(plat) && relYear !== null && yearSeen !== null && relYear === yearSeen ? { matched: true, extraInfo: `Prime (${relYear})`, sortScore: relYear } : null;
    case 'runtime_lte_60': return runtime > 0 && runtime <= 60 ? { matched: true, extraInfo: `${runtime} min`, sortScore: -runtime } : null;
    case 'runtime_gt_150': return runtime > 150 ? { matched: true, extraInfo: `${runtime} min`, sortScore: runtime } : null;
    case 'runtime_gt_180': return runtime > 180 ? { matched: true, extraInfo: `${runtime} min`, sortScore: runtime } : null;
    case 'cinema_gt_150min': return isCinema(plat) && runtime > 150 ? { matched: true, extraInfo: `Cinema ${runtime}m`, sortScore: runtime } : null;
    case 'hbo_max_count': return isHboMax(plat) ? { matched: true, extraInfo: plat, sortScore: yearSeen || 0 } : null;
    case 'netflix_count': return isNetflix(plat) ? { matched: true, extraInfo: 'Netflix', sortScore: yearSeen || 0 } : null;
    case 'internet_count': return isInternet(plat) ? { matched: true, extraInfo: 'Internet', sortScore: yearSeen || 0 } : null;
    case 'free_streaming_same_year': return isFreeStreaming(plat) && relYear !== null && yearSeen !== null && relYear === yearSeen ? { matched: true, extraInfo: `${plat} (${relYear})`, sortScore: relYear } : null;
    case 'seen_after_release_year': return relYear !== null && yearSeen !== null && yearSeen > relYear ? { matched: true, extraInfo: `${relYear} → ${yearSeen}`, sortScore: yearSeen - relYear } : null;
    case 'year_lt_1994': return relYear !== null && relYear < 1994 ? { matched: true, extraInfo: `${relYear}`, sortScore: -relYear } : null;
    case 'year_lt_1958': return relYear !== null && relYear < 1958 ? { matched: true, extraInfo: `${relYear}`, sortScore: -relYear } : null;
    case 'year_1999_or_2000': return relYear === 1999 || relYear === 2000 ? { matched: true, extraInfo: `${relYear}`, sortScore: relYear } : null;
    case 'year_between_2010_2020': return relYear !== null && relYear >= 2010 && relYear <= 2020 ? { matched: true, extraInfo: `${relYear}`, sortScore: relYear } : null;
    case 'internet_or_mfc_count': return isInternetOrMfc(plat) ? { matched: true, extraInfo: plat, sortScore: yearSeen || 0 } : null;
    case 'official_streaming_count': return isOfficialStreaming(plat) ? { matched: true, extraInfo: plat, sortScore: yearSeen || 0 } : null;
    case 'time_capsule_30_years': return relYear !== null && yearSeen !== null && yearSeen - relYear >= 30 ? { matched: true, extraInfo: `+${yearSeen - relYear} anos`, sortScore: yearSeen - relYear } : null;
    case 'year_eq_2001': return relYear === 2001 ? { matched: true, extraInfo: '2001', sortScore: 2001 } : null;
    case 'year_between_1939_1945': return relYear !== null && relYear >= 1939 && relYear <= 1945 ? { matched: true, extraInfo: `${relYear}`, sortScore: relYear } : null;
    default: return null;
  }
}

function evalMultiRitual(m, key) {
  const { runtime, releaseYear: relYear, canonicalPlatform: plat, audioLower: audio, ur, urMillis, imdb, imdbMillis, gr } = m;
  switch (key) {
    case 'cinema_ur_lt_7000': return isCinema(plat) && ur !== null && urMillis < 7000 && urMillis > 0 ? { matched: true, extraInfo: `Cinema | ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'a24_ur_lt_6000': return hasPattern(m.companies, ['a24']) && ur !== null && urMillis < 6000 && urMillis > 0 ? { matched: true, extraInfo: `A24 | ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    case 'year_1994_seen_august': return relYear === 1994 && inMonth(m, 8) ? { matched: true, extraInfo: '1994 em Agosto', sortScore: 1994 } : null;
    case 'brazil_year_1994': return relYear === 1994 && hasCountry(m, 'br') ? { matched: true, extraInfo: 'Brasil 1994', sortScore: 1994 } : null;
    case 'animacao_dublada_15': return hasGenre(m, 'Animação') && isDubbed(audio) ? { matched: true, extraInfo: 'Animação Dublada', sortScore: 1 } : null;
    case 'curta_youtube_5': return hasGenre(m, 'Curta') && isYouTube(plat) ? { matched: true, extraInfo: 'Curta no YouTube', sortScore: 1 } : null;
    case 'brasil_cinema_5': return hasCountry(m, 'br') && isCinema(plat) ? { matched: true, extraInfo: 'Brasil no Cinema', sortScore: 1 } : null;
    case 'cinema_ur_gt_8000_10': return isCinema(plat) && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `Cinema | ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'cinema_ferias_julho_dez_10': return isCinema(plat) && (inMonth(m, 7) || inMonth(m, 12)) ? { matched: true, extraInfo: 'Cinema nas Férias', sortScore: 1 } : null;
    case 'biografia_non_us_non_br_5': return hasGenre(m, 'Biografia') && !hasCountry(m, 'us') && !hasCountry(m, 'br') ? { matched: true, extraInfo: 'Biografia Internacional', sortScore: 1 } : null;
    case 'japao_sem_animes_games_terror_5': return hasCountry(m, 'jp') && !hasTag(m, 'Baseado em Anime') && !hasTag(m, 'Baseado em jogo') && !hasGenre(m, 'Terror') && !hasGenre(m, 'Animação') ? { matched: true, extraInfo: 'Japão Live-Action', sortScore: 1 } : null;
    case 'pirata_tag_lgbt_15': return hasTag(m, 'Personagem LGBT') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat)) ? { matched: true, extraInfo: plat, sortScore: 1 } : null;
    case 'pirata_tag_crime_real_15': return hasTag(m, 'Crime real') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat)) ? { matched: true, extraInfo: plat, sortScore: 1 } : null;
    case 'midia_fisica_ur_gt_8000_15': return isPhysicalMedia(plat) && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `${plat} | ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'pre_1960_pb_mudo_3': return relYear !== null && relYear < 1960 && (hasTag(m, 'Preto e branco') || hasTag(m, 'Mudo')) ? { matched: true, extraInfo: `${relYear}`, sortScore: -relYear } : null;
    case 'terror_anos_80_10': return hasGenre(m, 'Terror') && relYear !== null && relYear >= 1980 && relYear <= 1989 ? { matched: true, extraInfo: `${relYear}`, sortScore: relYear } : null;
    case 'pirata_romance_30': return hasGenre(m, 'Romance') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat)) ? { matched: true, extraInfo: plat, sortScore: 1 } : null;
    case 'terror_sem_gore_30': return hasGenre(m, 'Terror') && !hasTag(m, 'Gore') ? { matched: true, extraInfo: 'Terror sem Gore', sortScore: 1 } : null;
    case 'netflix_gore_30': return hasTag(m, 'Gore') && isNetflix(plat) ? { matched: true, extraInfo: 'Netflix Gore', sortScore: 1 } : null;
    case 'minecraft_stack_64': return (hasTag(m, 'Baseado em jogo') || hasTag(m, 'Zumbi') || hasTag(m, 'Bruxo') || hasTag(m, 'Animais antropomorficos')) && (hasGenre(m, 'Aventura') || hasGenre(m, 'Fantasia')) ? { matched: true, extraInfo: 'Minecraft Stack', sortScore: 1 } : null;
    case 'marvel_dc_cinema_20': return (hasTag(m, 'Marvel') || hasTag(m, 'DC')) && isCinema(plat) ? { matched: true, extraInfo: 'Cinema', sortScore: 1 } : null;
    case 'pirata_hidden_gem_10': return (isInternet(plat) || isYouTube(plat) || isMyFamilyCine(plat)) && gr !== null && gr > 0 && gr < 50_000 && ur !== null && urMillis > 8000 ? { matched: true, extraInfo: `${plat} | ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'oscar_winner_streaming_oficial_20': return m.oscarWins >= 1 && isOfficialStreaming(plat) ? { matched: true, extraInfo: plat, sortScore: m.oscarWins } : null;
    case 'gt_180_min_ur_gt_9000_5': return runtime > 180 && ur !== null && urMillis > 9000 ? { matched: true, extraInfo: `${runtime}m | ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'sony_midia_fisica_10': return hasPattern(m.companies, ['sony', 'columbia', 'tri-star', 'tristar', 'sony pictures']) && isPhysicalMedia(plat) ? { matched: true, extraInfo: plat, sortScore: 1 } : null;
    case 'pre_1980_ur_gt_8000_imdb_gte_80_15': return relYear !== null && relYear < 1980 && ur !== null && urMillis > 8000 && imdb !== null && imdbMillis >= 8000 ? { matched: true, extraInfo: `${relYear} | ${fmtUr(ur)}`, sortScore: urMillis } : null;
    case 'celso_russomanno_streaming_ur_lt_6000_30': return isOfficialStreaming(plat) && ur !== null && urMillis < 6000 && urMillis > 0 ? { matched: true, extraInfo: `${plat} | ${fmtUr(ur)}`, sortScore: -urMillis } : null;
    default: return null;
  }
}

function buildSlots(matches, targetValue, extraFn, pendingLabel) {
  const checklist = [];
  for (let i = 0; i < targetValue; i++) {
    const m = matches[i];
    if (m) {
      checklist.push({
        id: `slot_${i + 1}`,
        name: `Filme #${i + 1}: ${m.title}${m.releaseYear ? ` (${m.releaseYear})` : ''}`,
        flag: m.primaryCountryCode195 || m.rawPrimaryCountryCode || null,
        required: 1,
        current: 1,
        conquered: true,
        movie_title: m.title,
        movie_year: m.releaseYear,
        poster_url: m.posterUrl,
        extra_info: extraFn(m),
      });
    } else {
      checklist.push({
        id: `slot_${i + 1}`,
        name: `Filme #${i + 1} (${pendingLabel})`,
        required: 1,
        current: 0,
        conquered: false,
        extra_info: 'Pendente',
      });
    }
  }
  return { rawCount: matches.length, progressCurrent: Math.min(matches.length, targetValue), progressTarget: targetValue, isMet: matches.length >= targetValue, checklist };
}

function computeRule(def, index) {
  const meta = def.target_metadata || {};
  let pt = def.target_value || 1;
  const checklist = [];

  switch (def.target_type) {
    case 'conquered_countries_count': {
      const ex = meta.excludeCode ? String(meta.excludeCode).toLowerCase() : null;
      const valid = ex ? index.conqueredCountries.filter((c) => c.code !== ex) : index.conqueredCountries;
      valid.slice(0, 40).forEach((e) => checklist.push({ code: e.code, name: e.name, flag: e.code, required: 1, current: 1, conquered: true, movie_title: e.champion?.title }));
      return { rawCount: valid.length, progressCurrent: Math.min(valid.length, pt), progressTarget: pt, isMet: valid.length >= pt, checklist };
    }
    case 'country_movie_count': {
      const cc = String(meta.countryCode || '').toLowerCase();
      const matches = meta.strictPrimary ? index.moviesByCountryPrimary.get(cc) || [] : index.moviesByCountryAll.get(cc) || [];
      return buildSlots(matches, pt, () => meta.countryName || cc.toUpperCase(), meta.countryName || cc);
    }
    case 'continent_movie_count': {
      const matches = index.moviesByContinent.get(cleanStr(meta.continent || 'Europa')) || [];
      return buildSlots(matches, pt, (m) => m.primaryCountryName || meta.continent, meta.continent);
    }
    case 'country_list': {
      let codes = Array.isArray(meta.countryCodes) ? meta.countryCodes.map((c) => c.toLowerCase()) : [];
      if (codes.length === 0 && meta.continent) {
        codes = Array.from(index.unCountryDefMap.values()).filter((c) => cleanStr(c.continent) === cleanStr(meta.continent)).map((c) => c.code);
      }
      let conq = 0;
      for (const code of codes) {
        const entry = index.unCountriesMap.get(code);
        const ok = entry?.status === 'conquered';
        if (ok) conq++;
        checklist.push({ code, name: entry?.name || code.toUpperCase(), flag: code, required: 1, current: ok ? 1 : 0, conquered: ok, movie_title: entry?.champion?.title || null });
      }
      return { rawCount: conq, progressCurrent: conq, progressTarget: codes.length || pt, isMet: conq >= (codes.length || pt), checklist };
    }
    case 'world_countries_checklist': {
      const list = Array.isArray(meta.countries) ? meta.countries : [];
      let conq = 0;
      for (const item of list) {
        const entry = index.unCountriesMap.get(String(item.code).toLowerCase());
        const ok = entry?.status === 'conquered';
        if (ok) conq++;
        checklist.push({ code: item.code, name: item.name || item.code, flag: item.code, required: 1, current: ok ? 1 : 0, conquered: ok, movie_title: entry?.champion?.title || null });
      }
      return { rawCount: conq, progressCurrent: conq, progressTarget: list.length || pt, isMet: conq >= (list.length || pt), checklist };
    }
    case 'country_movie_counts': {
      const reqs = Array.isArray(meta.requirements) ? meta.requirements : [];
      let sum = 0, reqTot = 0, allMet = true;
      for (const r of reqs) {
        const matches = index.moviesByCountryAll.get(String(r.code).toLowerCase()) || [];
        const min = Number(r.min) || 1;
        reqTot += min;
        sum += Math.min(matches.length, min);
        if (matches.length < min) allMet = false;
        checklist.push({ code: r.code, name: `${r.name} (${matches.length}/${min})`, flag: r.code, required: min, current: Math.min(matches.length, min), conquered: matches.length >= min });
      }
      return { rawCount: sum, progressCurrent: sum, progressTarget: reqTot || pt, isMet: allMet && sum >= (reqTot || pt), checklist };
    }
    case 'historical_territories_list': {
      const codes = Array.isArray(meta.territoryCodes) ? meta.territoryCodes : [];
      const minC = Number(meta.minCount) || pt || 4;
      let conq = 0;
      for (const code of codes) {
        const h = index.historicalCountriesMap.get(String(code).toLowerCase());
        const ok = h?.status === 'conquered';
        if (ok) conq++;
        checklist.push({ code, name: h?.name || code, flag: h?.flagCode || null, badge_icon: h?.badgeIcon || null, required: 1, current: ok ? 1 : 0, conquered: ok, movie_title: h?.champion?.title || null });
      }
      return { rawCount: conq, progressCurrent: Math.min(conq, minC), progressTarget: minC, isMet: conq >= minC, checklist };
    }
    case 'allies_vs_axis_checklist': {
      const slots = Array.isArray(meta.slots) ? meta.slots : [];
      let conq = 0;
      for (const s of slots) {
        const hit = (s.codes || []).map((c) => index.allCountriesAndHistoricalMap.get(String(c).toLowerCase())).find((e) => e?.status === 'conquered');
        if (hit) conq++;
        checklist.push({ id: s.id, name: s.name, flag: hit?.flagCode || hit?.code || s.flag || null, required: 1, current: hit ? 1 : 0, conquered: Boolean(hit), movie_title: hit?.champion?.title || null });
      }
      return { rawCount: conq, progressCurrent: conq, progressTarget: slots.length || pt, isMet: conq >= (slots.length || pt), checklist };
    }
    case 'tag_movie_count': {
      const tag = (Array.isArray(meta.tags) && meta.tags[0]) || meta.tag || '';
      return buildSlots(index.moviesByTag.get(cleanTag(tag)) || [], pt, () => `Tag: ${tag}`, tag);
    }
    case 'movie_zero_tags_count': return buildSlots(index.movies.filter((m) => m.tagEntries.length === 0), pt, () => '0 tags', 'Sem tags');
    case 'movies_min_tags_count': return buildSlots(index.movies.filter((m) => m.tagEntries.length >= (meta.minTags || 7)), pt, (m) => `${m.tagEntries.length} tags`, `${meta.minTags || 7}+ tags`);
    case 'tag_double_and': {
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      return buildSlots(index.movies.filter((m) => tags.length > 0 && tags.every((t) => hasTag(m, t))), pt, () => tags.join(' + '), tags.join(' + '));
    }
    case 'tag_pool_sum': {
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      return buildSlots(index.movies.filter((m) => tags.some((t) => hasTag(m, t))), pt, () => tags.join(' / '), tags.join('/'));
    }
    case 'tag_multi_or_and': {
      const any = meta.anyOfTags || [];
      return buildSlots((index.moviesByTag.get(cleanTag(meta.mainTag)) || []).filter((m) => any.some((t) => hasTag(m, t))), pt, () => meta.mainTag, meta.mainTag);
    }
    case 'tag_checklist_quota': {
      const quotas = Array.isArray(meta.quotas) ? meta.quotas : [];
      const counts = quotas.map((q) => (index.moviesByTag.get(cleanTag(q.tag)) || []).length);
      let sum = 0, reqTot = 0, okAll = true;
      quotas.forEach((q, idx) => {
        const req = Number(q.count) || 1;
        reqTot += req;
        sum += Math.min(counts[idx], req);
        if (counts[idx] < req) okAll = false;
        checklist.push({ id: `tq_${idx}`, name: `Tag "${q.tag}"`, required: req, current: Math.min(counts[idx], req), conquered: counts[idx] >= req });
      });
      return { rawCount: sum, progressCurrent: sum, progressTarget: pt || reqTot, isMet: okAll && sum >= (pt || reqTot), checklist, quotaRawCounts: counts };
    }
    case 'tag_hybrid_country': {
      const tags = Array.isArray(meta.tags) ? meta.tags : meta.tag ? [meta.tag] : [];
      const cc = String(meta.countryCode || '').toLowerCase();
      return buildSlots((index.moviesByCountryAll.get(cc) || []).filter((m) => tags.every((t) => hasTag(m, t))), pt, () => `${meta.countryName} + ${tags.join(' + ')}`, meta.countryName || cc);
    }
    case 'tag_hybrid_continent': {
      const tags = Array.isArray(meta.tags) ? meta.tags : meta.tag ? [meta.tag] : [];
      return buildSlots((index.moviesByContinent.get(cleanStr(meta.continent)) || []).filter((m) => tags.every((t) => hasTag(m, t))), pt, () => meta.continent, meta.continent);
    }
    case 'tag_hybrid_exclude_country': {
      const tags = Array.isArray(meta.tags) ? meta.tags : meta.tag ? [meta.tag] : [];
      const ex = String(meta.excludeCountryCode || 'us').toLowerCase();
      return buildSlots(index.movies.filter((m) => !hasCountry(m, ex) && tags.every((t) => hasTag(m, t))), pt, () => tags.join(' + '), tags.join(' + '));
    }
    case 'tag_hybrid_asian_horror': {
      const ccs = meta.countryCodes || ['jp', 'kr', 'th', 'id'];
      const hTags = meta.horrorTags || ['Fantasma', 'Demônio', 'Gore', 'Zumbi'];
      return buildSlots(index.movies.filter((m) => ccs.some((c) => hasCountry(m, c)) && hTags.some((t) => hasTag(m, t))), pt, () => 'Terror Asiático', 'Terror Asiático');
    }
    case 'tag_non_br_us_count': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag || 'Em Família')) || []).filter((m) => !hasCountry(m, 'us') && !hasCountry(m, 'br')), pt, () => 'Internacional', meta.tag);
    case 'tag_platform_count': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag)) || []).filter((m) => cleanStr(m.canonicalPlatform) === cleanStr(meta.platform)), pt, () => meta.platform, meta.tag);
    case 'tag_min_rating_count': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag)) || []).filter((m) => m.urMillis !== null && m.urMillis >= (meta.minRating || 8000)), pt, (m) => `Nota: ${fmtUr(m.ur)}`, meta.tag);
    case 'tag_max_rating_count': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag)) || []).filter((m) => m.urMillis !== null && m.urMillis < (meta.maxRating || 6000)), pt, (m) => `Nota: ${fmtUr(m.ur)}`, meta.tag);
    case 'genre_count': return buildSlots(index.moviesByGenre.get(cleanTag(meta.genre)) || [], pt, () => meta.genre, meta.genre);
    case 'genre_all_and': {
      const gs = meta.genres || [];
      return buildSlots(index.movies.filter((m) => gs.length > 0 && gs.every((g) => hasGenre(m, g))), pt, () => gs.join(' + '), gs.join(' + '));
    }
    case 'genre_and_or': {
      const any = meta.anyOfGenres || [];
      return buildSlots((index.moviesByGenre.get(cleanTag(meta.mainGenre)) || []).filter((m) => any.some((g) => hasGenre(m, g))), pt, () => meta.mainGenre, meta.mainGenre);
    }
    case 'genre_quotas': {
      const quotas = Array.isArray(meta.quotas) ? meta.quotas : [];
      const counts = quotas.map((q) => (index.moviesByGenre.get(cleanTag(q.genre)) || []).length);
      let sum = 0, reqTot = 0, okAll = true;
      quotas.forEach((q, idx) => {
        const req = Number(q.count) || 1;
        reqTot += req;
        sum += Math.min(counts[idx], req);
        if (counts[idx] < req) okAll = false;
        checklist.push({ id: `gq_${idx}`, name: `Gênero ${q.genre}`, required: req, current: Math.min(counts[idx], req), conquered: counts[idx] >= req });
      });
      return { rawCount: sum, progressCurrent: sum, progressTarget: pt || reqTot, isMet: okAll && sum >= (pt || reqTot), checklist, quotaRawCounts: counts };
    }
    case 'genre_distinct_threshold': {
      const minG = Number(meta.minPerGenre) || 25;
      let qCount = 0;
      for (const g of ALL_21_GENRES) {
        const c = (index.moviesByGenre.get(cleanTag(g)) || []).length;
        if (c >= minG) qCount++;
        checklist.push({ id: `dg_${cleanTag(g)}`, name: g, required: minG, current: Math.min(c, minG), conquered: c >= minG });
      }
      return { rawCount: qCount, progressCurrent: Math.min(qCount, pt), progressTarget: pt, isMet: qCount >= pt, checklist };
    }
    case 'movie_min_genre_count': return buildSlots(index.movies.filter((m) => m.all21GenresCount >= (meta.minGenresPerMovie || 4)), pt, (m) => `${m.all21GenresCount} gêneros`, `${meta.minGenresPerMovie || 4}+ gêneros`);
    case 'country_genre': return buildSlots((index.moviesByCountryAll.get(String(meta.countryCode).toLowerCase()) || []).filter((m) => hasGenre(m, meta.genre)), pt, () => meta.genre, meta.genre);
    case 'genre_tag_and': return buildSlots((index.moviesByGenre.get(cleanTag(meta.genre)) || []).filter((m) => hasTag(m, meta.tag)), pt, () => meta.tag, meta.genre);
    case 'genre_and_tag_and_any_tag': return buildSlots((index.moviesByGenre.get(cleanTag(meta.genre)) || []).filter((m) => hasTag(m, meta.requiredTag) && (meta.orTags || []).some((t) => hasTag(m, t))), pt, () => meta.genre, meta.genre);
    case 'genre_and_tags_or_max_rating': return buildSlots((index.moviesByGenre.get(cleanTag(meta.genre)) || []).filter((m) => m.urMillis !== null && m.urMillis < (meta.maxRating || 5000) && (meta.orTags || []).some((t) => hasTag(m, t))), pt, (m) => `Nota: ${fmtUr(m.ur)}`, meta.genre);
    case 'genre_max_runtime_count': return buildSlots((index.moviesByGenre.get(cleanTag(meta.genre)) || []).filter((m) => m.runtime > 0 && m.runtime <= (meta.maxRuntime || 90)), pt, (m) => `${m.runtime}m`, meta.genre);
    case 'terror_tragico_min_rating': return buildSlots((index.moviesByGenre.get(cleanTag(meta.genre || 'Terror')) || []).filter((m) => hasTag(m, meta.tag || 'Trágico') && m.urMillis !== null && m.urMillis > (meta.minRating || 8500)), pt, (m) => `Nota: ${fmtUr(m.ur)}`, 'Terror Trágico');
    case 'month_movie_count': return buildSlots(index.moviesByMonth.get(Number(meta.month) || 1) || [], pt, () => MONTH_NAMES[Number(meta.month)], MONTH_NAMES[Number(meta.month)]);
    case 'genre_month': return buildSlots((index.moviesByMonth.get(Number(meta.month)) || []).filter((m) => hasGenre(m, meta.genre)), pt, () => meta.genre, meta.genre);
    case 'genre_or_month': return buildSlots((index.moviesByMonth.get(Number(meta.month)) || []).filter((m) => (meta.genres || []).some((g) => hasGenre(m, g))), pt, () => 'Gênero', 'Férias');
    case 'tag_month': return buildSlots((index.moviesByMonth.get(Number(meta.month)) || []).filter((m) => hasTag(m, meta.tag)), pt, () => meta.tag, meta.tag);
    case 'tag_month_range':
    case 'tag_months': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag)) || []).filter((m) => inMonth(m, meta.months || [])), pt, () => meta.tag, meta.tag);
    case 'tag_or_month': return buildSlots((index.moviesByMonth.get(Number(meta.month)) || []).filter((m) => (meta.tags || []).some((t) => hasTag(m, t))), pt, () => 'Tag', 'Mês');
    case 'tag_and_tag_or_month': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag)) || []).filter((m) => hasTag(m, meta.orTag) || inMonth(m, Number(meta.orMonth) || 12)), pt, () => meta.tag, meta.tag);
    case 'all_12_months_coverage': {
      const monthTarget = Number(def.target_value) || 15;
      const monthCounts = [];
      for (let mo = 1; mo <= 12; mo++) {
        const list = index.moviesByMonth.get(mo) || [];
        monthCounts.push(list.length);
        checklist.push({
          id: `m_${mo}`,
          name: MONTH_NAMES[mo],
          required: monthTarget,
          current: Math.min(list.length, monthTarget),
          conquered: list.length >= monthTarget,
          movie_title: list[0]?.title || null,
          movie_year: list[0]?.releaseYear || null,
          poster_url: list[0]?.posterUrl || null,
          extra_info:
            list.length >= monthTarget
              ? `${list.length}/${monthTarget} filmes neste mês ✓`
              : `${list.length}/${monthTarget} filmes neste mês (faltam ${monthTarget - list.length})`,
        });
      }
      const minMonthCount = monthCounts.length ? Math.min(...monthCounts) : 0;
      return { rawCount: minMonthCount, progressCurrent: minMonthCount, progressTarget: monthTarget, isMet: minMonthCount >= monthTarget, checklist, monthCounts };
    }
    case 'tag_decades_checklist': {
      const cands = index.moviesByTag.get(cleanTag(meta.tag || 'Bruxo')) || [];
      const decs = meta.decades || [1960, 1970, 1980, 1990, 2000, 2010, 2020];
      let cov = 0;
      for (const d of decs) {
        const m = cands.find((x) => x.releaseYear !== null && x.releaseYear >= d && x.releaseYear <= d + 9);
        if (m) cov++;
        checklist.push({ id: `d_${d}`, name: `Década ${d}`, required: 1, current: m ? 1 : 0, conquered: Boolean(m), movie_title: m?.title || null });
      }
      return { rawCount: cov, progressCurrent: cov, progressTarget: decs.length, isMet: cov >= decs.length, checklist };
    }
    case 'quad_natal_classico': return buildSlots((index.moviesByMonth.get(meta.month || 12) || []).filter((m) => (meta.countryCodes || ['us', 'ca', 'gb']).some((c) => hasCountry(m, c)) && (meta.anyOfGenres || ['Comédia', 'Família']).some((g) => hasGenre(m, g)) && hasTag(m, meta.tag || 'Natal')), pt, () => 'Natal Clássico', 'Natal Clássico');
    case 'quad_natal_macabro': return buildSlots((index.moviesByMonth.get(meta.month || 12) || []).filter((m) => (meta.anyOfGenres || ['Terror', 'Suspense']).some((g) => hasGenre(m, g)) && hasTag(m, meta.tag || 'Natal')), pt, () => 'Natal Macabro', 'Natal Macabro');
    case 'quad_outubro_macabro_mundo': return buildSlots((index.moviesByMonth.get(meta.month || 10) || []).filter((m) => !hasCountry(m, meta.excludeCountryCode || 'us') && (meta.anyOfGenres || ['Terror', 'Suspense']).some((g) => hasGenre(m, g)) && (meta.anyOfTags || ['Criança Malvada', 'Demônio', 'Fantasma', 'Gore', 'Vampiro', 'Zumbi']).some((t) => hasTag(m, t))), pt, () => 'Outubro Mundial', 'Outubro Mundial');
    case 'quad_pride_sem_fronteiras': return buildSlots((index.moviesByMonth.get(6) || []).filter((m) => (meta.excludeCountryCodes || ['us', 'br']).every((c) => !hasCountry(m, c)) && (hasGenre(m, 'Drama') || hasGenre(m, 'Romance')) && hasTag(m, 'Personagem LGBT')), pt, () => 'Orgulho Sem Fronteiras', 'Orgulho Sem Fronteiras');
    case 'triple_combo_brasil': return buildSlots((index.moviesByCountryAll.get('br') || []).filter((m) => (meta.anyOfGenres || ['Crime', 'Policial']).some((g) => hasGenre(m, g)) && (meta.anyOfTags || ['Crime real', 'Fatos Reais']).some((t) => hasTag(m, t))), pt, () => 'Crime Nacional', 'Crime Nacional');
    case 'triple_combo_europa': return buildSlots((index.moviesByContinent.get('europa') || []).filter((m) => hasGenre(m, 'Terror') && (hasTag(m, 'Demônio') || hasTag(m, 'Religião'))), pt, () => 'Terror Europeu', 'Terror Europeu');
    case 'hollywood_oscar_winner_count': return buildSlots(index.movies.filter((m) => m.oscarWins >= (meta.minWins || 1)), pt, (m) => `${m.oscarWins} Oscar(s)`, 'Oscar Winner');
    case 'hollywood_oscar_exact_ratio': return buildSlots(index.movies.filter((m) => m.oscarNoms === (meta.nominations || 3) && m.oscarWins === (meta.wins || 3)), pt, () => `${meta.wins || 3}/${meta.nominations || 3} Oscar`, 'Placar Oscar');
    case 'hollywood_oscar_nominations_min': return buildSlots(index.movies.filter((m) => m.oscarNoms >= (meta.minNominations || 10)), pt, (m) => `${m.oscarNoms} ind.`, 'Oscar Noms');
    case 'hollywood_oscar_wins_min': return buildSlots(index.movies.filter((m) => m.oscarWins >= (meta.minWins || 8)), pt, (m) => `${m.oscarWins} Oscars`, 'Oscar Wins');
    case 'hollywood_oscar_nominated_unwon_count': return buildSlots(index.movies.filter((m) => m.oscarNoms >= 1 && m.oscarWins === 0), pt, (m) => `${m.oscarNoms} ind / 0 wins`, 'Azarão Oscar');
    case 'hollywood_oscar_5_noms_unwon_count': return buildSlots(index.movies.filter((m) => m.oscarNoms >= 5 && m.oscarWins === 0), pt, (m) => `${m.oscarNoms} ind / 0 wins`, '5+ ind 0 wins');
    case 'hollywood_oscar_5_noms_5_wins_count': return buildSlots(index.movies.filter((m) => m.oscarNoms >= 5 && m.oscarWins >= 5), pt, (m) => `${m.oscarWins}/${m.oscarNoms}`, '5+/5+ Oscar');
    case 'hollywood_oscar_dual_quota': {
      const rw = meta.requiredWinners || 30, rn = meta.requiredNominees || 60;
      const w = index.movies.filter((m) => m.oscarWins >= 1).length;
      const n = index.movies.filter((m) => m.oscarNoms >= 1 || m.oscarWins >= 1).length;
      const sum = Math.min(w, rw) + Math.min(n, rn);
      return { rawCount: sum, progressCurrent: sum, progressTarget: rw + rn, isMet: w >= rw && n >= rn, checklist: [{ id: 'w', name: `Vencedores (${w}/${rw})`, required: rw, current: Math.min(w, rw), conquered: w >= rw }, { id: 'n', name: `Indicados (${n}/${rn})`, required: rn, current: Math.min(n, rn), conquered: n >= rn }] };
    }
    case 'hollywood_oscar_or_quota': {
      const tw = meta.targetWins || 50, tn = meta.targetNominations || 120;
      const w = index.movies.filter((m) => m.oscarWins >= 1).length;
      const n = index.movies.filter((m) => m.oscarNoms >= 1 || m.oscarWins >= 1).length;
      const pct = Math.round(Math.max(Math.min(1, w / tw), Math.min(1, n / tn)) * 100);
      return { rawCount: pct, progressCurrent: pct, progressTarget: 100, isMet: w >= tw || n >= tn, checklist: [{ id: 'w', name: `${tw} Vencedores (${w})`, required: tw, current: Math.min(w, tw), conquered: w >= tw }, { id: 'n', name: `${tn} Indicados (${n})`, required: tn, current: Math.min(n, tn), conquered: n >= tn }] };
    }
    case 'hollywood_distributor_studio_count':
    case 'hollywood_studio_count':
    case 'hollywood_conglomerates_count': return buildSlots(index.movies.filter((m) => hasPattern(m.companies, meta.patterns || [])), pt, () => meta.company || meta.studio || 'Estúdio', meta.company || 'Estúdio');
    case 'hollywood_studio_or_tag_count': return buildSlots(index.movies.filter((m) => hasPattern(m.companies, meta.patterns || []) || (meta.tag && hasTag(m, meta.tag))), pt, () => meta.tag || 'Estúdio', meta.tag || 'Estúdio');
    case 'hollywood_director_or_writer_count': return buildSlots(index.movies.filter((m) => hasPattern(m.directors, meta.patterns || []) || hasPattern(m.writers, meta.patterns || []) || (meta.checkProducers && hasPattern(m.producers, meta.patterns || []))), pt, () => meta.person || 'Cineasta', meta.person || 'Cineasta');
    case 'hollywood_same_director_writer_count': return buildSlots(index.movies.filter((m) => { for (const d of m.directors) if (m.writers.has(d)) return true; return false; }), pt, () => 'Autoral', 'Diretor = Roteirista');
    case 'hollywood_unique_directors_quota': {
      const minF = meta.minFilmsPerDirector || 3;
      const q = Array.from(index.directorToMovies.values()).filter((x) => x.movies.length >= minF);
      return { rawCount: q.length, progressCurrent: Math.min(q.length, pt), progressTarget: pt, isMet: q.length >= pt, checklist: q.slice(0, pt).map((d, i) => ({ id: `d_${i}`, name: `${d.displayName} (${d.movies.length})`, required: minF, current: minF, conquered: true })) };
    }
    case 'hollywood_unique_writers_quota': {
      const minF = meta.minFilmsPerWriter || 3;
      const q = Array.from(index.writerToMovies.values()).filter((x) => x.movies.length >= minF);
      return { rawCount: q.length, progressCurrent: Math.min(q.length, pt), progressTarget: pt, isMet: q.length >= pt, checklist: q.slice(0, pt).map((w, i) => ({ id: `w_${i}`, name: `${w.displayName} (${w.movies.length})`, required: minF, current: minF, conquered: true })) };
    }
    case 'critic_tribunal_rule': {
      const key = String(meta.ruleKey || '');
      const scored = [];
      for (const m of index.movies) { const r = evalCritic(m, key); if (r?.matched) scored.push({ m, r }); }
      scored.sort((a, b) => b.r.sortScore - a.r.sortScore);
      const map = new Map(scored.map((s) => [s.m, s.r.extraInfo]));
      return buildSlots(scored.map((s) => s.m), pt, (m) => map.get(m) || 'Veredicto', 'Crítica');
    }
    case 'rt_lt_ur_gte_count': return buildSlots(index.movies.filter((m) => m.rt !== null && m.rt < (meta.maxRt || 40) && m.urMillis !== null && m.urMillis >= (meta.minRating || 8000)), pt, (m) => `RT: ${m.rt}%`, 'RT < 40%');
    case 'multi_critic_range_count': {
      const d = meta.digit || 6, minD = meta.minDistinctMetrics || 3;
      return buildSlots(index.movies.filter((m) => {
        let h = 0;
        if (m.rt !== null && m.rt >= d * 10 && m.rt <= d * 10 + 9) h++;
        if (m.mc !== null && m.mc >= d * 10 && m.mc <= d * 10 + 9) h++;
        if (m.imdbMillis !== null && m.imdbMillis >= d * 1000 && m.imdbMillis <= d * 1000 + 999) h++;
        if (m.urMillis !== null && m.urMillis >= d * 1000 && m.urMillis <= d * 1000 + 999) h++;
        return h >= minD;
      }), pt, () => `Faixa do ${d}`, `Notas ${d}`);
    }
    case 'bomba_ray_tracing_count': return buildSlots(index.movies.filter((m) => m.releaseYear >= (meta.minYear || 2021) && m.gr > (meta.minGlobalReviews || 500_000) && m.urMillis !== null && m.urMillis < (meta.maxRating || 5000) && (meta.genres || ['Ficção Científica', 'Ação']).some((g) => hasGenre(m, g))), pt, (m) => fmtUr(m.ur), 'Bomba');
    case 'genres_or_decade_range_count': return buildSlots(index.movies.filter((m) => m.releaseYear >= (meta.minYear || 1980) && m.releaseYear <= (meta.maxYear || 1989) && (meta.genres || ['Ação', 'Aventura']).some((g) => hasGenre(m, g))), pt, (m) => `${m.releaseYear}`, 'Década');
    case 'tag_and_any_of_tags': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag)) || []).filter((m) => (meta.orTags || []).some((t) => hasTag(m, t))), pt, () => meta.tag, meta.tag);
    case 'tag_and_genres_or_year_range': return buildSlots((index.moviesByTag.get(cleanTag(meta.tag)) || []).filter((m) => m.releaseYear >= (meta.minYear || 1990) && m.releaseYear <= (meta.maxYear || 2004) && (meta.orGenres || []).some((g) => hasGenre(m, g))), pt, (m) => `${m.releaseYear}`, meta.tag);
    case 'tags_or_physical_media_count': return buildSlots(index.movies.filter((m) => isPhysicalMedia(m.canonicalPlatform) && (meta.orTags || ['Trágico', 'Emocionante']).some((t) => hasTag(m, t))), pt, (m) => m.canonicalPlatform, 'Mídia Física');
    case 'cinema_specific_months_count': return buildSlots((index.moviesByPlatform.get('Cinema') || []).filter((m) => inMonth(m, meta.months || [2, 3, 9])), pt, (m) => MONTH_NAMES[m.monthSeen], 'Cinema');
    case 'hybrid_15_countries_masterpieces': {
      const best = new Map();
      for (const m of index.movies) {
        if (m.urMillis !== null && m.urMillis >= 8500 && m.primaryCountryCode195 && m.primaryCountryCode195 !== 'us') {
          const p = best.get(m.primaryCountryCode195);
          if (!p || m.urMillis > p.urMillis) best.set(m.primaryCountryCode195, m);
        }
      }
      const list = Array.from(best.values());
      return buildSlots(list, pt, (m) => `Nota: ${fmtUr(m.ur)}`, 'Obra-prima internacional');
    }
    case 'hybrid_curador_joias_raras': {
      const qual = index.movies.filter((m) => m.urMillis !== null && m.urMillis >= 8500 && m.gr !== null && m.gr < 50_000 && m.tagEntries.length > 0)
        .sort((a, b) => a.tagEntries.length - b.tagEntries.length || b.urMillis - a.urMillis);
      const usedM = new Set(), usedT = new Set(), usedC = new Set(), picked = [];
      for (const m of qual) {
        if (picked.length >= pt) break;
        if (!m.primaryCountryCode195 || usedC.has(m.primaryCountryCode195)) continue;
        const tag = m.tagEntries.find((t) => !usedT.has(t.clean));
        if (!tag) continue;
        usedC.add(m.primaryCountryCode195); usedT.add(tag.clean); usedM.add(m.movieId); picked.push(m);
      }
      for (const m of [...qual].sort((a, b) => b.urMillis - a.urMillis)) {
        if (picked.length >= pt) break;
        if (usedM.has(m.movieId)) continue;
        const tag = m.tagEntries.find((t) => !usedT.has(t.clean));
        if (!tag) continue;
        usedT.add(tag.clean); usedM.add(m.movieId); if (m.primaryCountryCode195) usedC.add(m.primaryCountryCode195); picked.push(m);
      }
      const res = buildSlots(picked, pt, (m) => `Nota: ${fmtUr(m.ur)} | Reviews: ${fmtGr(m.gr)}`, 'Joia Rara (tag distinta)');
      res.isMet = picked.length >= pt && usedC.size >= (meta.minCountries || 8);
      return res;
    }
    case 'hybrid_shyamalan_paradox': {
      const sm = index.movies.filter((m) => hasPattern(m.directors, ['shyamalan', 'm. night shyamalan', 'm night shyamalan']));
      const h = sm.some((m) => m.urMillis !== null && m.urMillis >= 8000);
      const l = sm.some((m) => m.urMillis !== null && m.urMillis < 6000);
      const c = (h ? 1 : 0) + (l ? 1 : 0);
      return { rawCount: c, progressCurrent: c, progressTarget: 2, isMet: c === 2, checklist: [{ id: 's1', name: 'Shyamalan >= 8.000', required: 1, current: h ? 1 : 0, conquered: h }, { id: 's2', name: 'Shyamalan < 6.000', required: 1, current: l ? 1 : 0, conquered: l }] };
    }
    case 'ritual_cinefilo_rule': {
      const key = String(meta.ruleKey || '');
      const scored = [];
      for (const m of index.movies) { const r = evalRitual(m, key); if (r?.matched) scored.push({ m, r }); }
      return buildSlots(scored.map((s) => s.m), pt, (m) => scored.find((x) => x.m === m)?.r.extraInfo || 'Ritual', 'Ritual');
    }
    case 'ritual_nomade_telas': {
      const minP = meta.minMoviesPerPlatform || 3;
      const qual = Array.from(index.moviesByPlatform.entries()).filter(([, list]) => list.length >= minP);
      return { rawCount: qual.length, progressCurrent: Math.min(qual.length, pt), progressTarget: pt, isMet: qual.length >= pt, checklist: Array.from(index.moviesByPlatform.entries()).map(([p, list]) => ({ id: p, name: `${p} (${list.length})`, required: minP, current: Math.min(list.length, minP), conquered: list.length >= minP })) };
    }
    case 'ritual_total_minutos': return { rawCount: index.totalRuntimeMinutes, progressCurrent: Math.min(index.totalRuntimeMinutes, pt), progressTarget: pt, isMet: index.totalRuntimeMinutes >= pt, checklist: [] };
    case 'ritual_anos_checklist': {
      const sy = meta.startYear || 1994, ey = meta.endYear || 2027;
      let cov = 0;
      for (let y = sy; y <= ey; y++) {
        const hit = (index.moviesByRelYear.get(y) || [])[0];
        if (hit) cov++;
        checklist.push({ id: `y_${y}`, name: `Ano ${y}`, required: 1, current: hit ? 1 : 0, conquered: Boolean(hit), movie_title: hit?.title || null });
      }
      return { rawCount: cov, progressCurrent: cov, progressTarget: ey - sy + 1, isMet: cov >= ey - sy + 1, checklist };
    }
    case 'ritual_petista': {
      const base = meta.baseYears || [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
      const yrs = [...base];
      for (let y = meta.recentStartYear || 2023; y <= index.maxCatalogYear; y++) yrs.push(y);
      let cov = 0;
      for (const y of yrs) {
        const hit = (index.moviesByRelYear.get(y) || [])[0];
        if (hit) cov++;
        checklist.push({ id: `p_${y}`, name: `Ano ${y}`, required: 1, current: hit ? 1 : 0, conquered: Boolean(hit), movie_title: hit?.title || null });
      }
      return { rawCount: cov, progressCurrent: cov, progressTarget: yrs.length, isMet: cov >= yrs.length, checklist };
    }
    case 'multi_ritual_rule': {
      const key = String(meta.ruleKey || '');
      if (key === 'brazil_copa_1950_2014') {
        const br = index.moviesByCountryAll.get('br') || [];
        const a = br.some((m) => m.releaseYear === 1950), b = br.some((m) => m.releaseYear === 2014);
        const c = (a ? 1 : 0) + (b ? 1 : 0);
        return { rawCount: c, progressCurrent: c, progressTarget: 2, isMet: c === 2, checklist: [] };
      }
      if (key === 'viajante_9_decadas_18') {
        const decs = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
        const used = new Set(), ccSet = new Set();
        let cov = 0;
        for (const d of decs) {
          const cands = index.movies.filter((m) => m.releaseYear >= d && m.releaseYear <= d + 9 && m.urMillis >= 8000);
          for (let s = 0; s < 2; s++) {
            const pick = cands.find((x) => !used.has(x.movieId));
            if (pick) { used.add(pick.movieId); cov++; if (pick.primaryCountryCode195) ccSet.add(pick.primaryCountryCode195); }
          }
        }
        return { rawCount: cov, progressCurrent: cov, progressTarget: 18, isMet: cov >= 18 && ccSet.size >= 10, checklist: [] };
      }
      const scored = [];
      for (const m of index.movies) { const r = evalMultiRitual(m, key); if (r?.matched) scored.push({ m, r }); }
      return buildSlots(scored.map((s) => s.m), pt, () => 'Multi', 'Multi');
    }
    case 'alphabet_az_coverage': {
      const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      let cov = 0;
      for (const l of alph) {
        const hit = index.movies.find((m) => m.titleLetters.has(l));
        if (hit) cov++;
        checklist.push({ id: `l_${l}`, name: `Letra ${l}`, required: 1, current: hit ? 1 : 0, conquered: Boolean(hit), movie_title: hit?.title || null });
      }
      return { rawCount: cov, progressCurrent: cov, progressTarget: 26, isMet: cov >= 26, checklist };
    }
    case 'hybrid_country_oscar_winner': return buildSlots((index.moviesByCountryAll.get(String(meta.countryCode || 'br').toLowerCase()) || []).filter((m) => m.oscarWins >= (meta.minWins || 1)), pt, (m) => `${m.oscarWins} Oscar(s)`, 'Oscar');
    case 'hybrid_non_us_oscar_winner': return buildSlots(index.movies.filter((m) => !hasCountry(m, meta.excludeCountryCode || 'us') && m.oscarWins >= (meta.minWins || 1)), pt, (m) => `${m.oscarWins} Oscar(s)`, 'Oscar Não-EUA');
    case 'hybrid_genre_oscar_winner': return buildSlots((index.moviesByGenre.get(cleanTag(meta.genre || 'Animação')) || []).filter((m) => m.oscarWins >= (meta.minWins || 1)), pt, (m) => `${m.oscarWins} Oscar(s)`, 'Oscar');
    case 'hybrid_genre_studio_month': return buildSlots((index.moviesByMonth.get(meta.month || 10) || []).filter((m) => hasGenre(m, meta.genre || 'Terror') && hasPattern(m.companies, meta.studioPatterns || ['blumhouse'])), pt, () => 'Combo', 'Combo');
    case 'hybrid_genre_tag': return buildSlots((index.moviesByGenre.get(cleanTag(meta.genre || 'Romance')) || []).filter((m) => hasTag(m, meta.tag)), pt, () => meta.tag, meta.genre);
    case 'hybrid_disney_fox_horror': return buildSlots((index.moviesByGenre.get(cleanTag('Terror')) || []).filter((m) => hasPattern(m.companies, meta.companyPatterns || ['disney', 'pixar', 'buena vista', '20th century'])), pt, () => 'Terror Disney/Fox', 'Terror');
    case 'hybrid_disney_vacation_july_dec': return buildSlots(index.movies.filter((m) => inMonth(m, meta.months || [7, 12]) && (meta.anyOfGenres || ['Animação', 'Família']).some((g) => hasGenre(m, g)) && hasPattern(m.companies, meta.companyPatterns || ['disney', 'pixar', 'buena vista'])), pt, () => 'Disney Férias', 'Disney');
    case 'hybrid_gore_twisted_lionsgate': return buildSlots((index.moviesByGenre.get(cleanTag('Terror')) || []).filter((m) => hasTag(m, 'Gore') && hasPattern(m.companies, meta.companyPatterns || ['twisted pictures', 'lionsgate'])), pt, () => 'Gore Twisted', 'Gore');
    case 'hybrid_pixar_emotional_animals': return buildSlots((index.moviesByGenre.get(cleanTag('Animação')) || []).filter((m) => hasPattern(m.companies, meta.companyPatterns || ['disney', 'pixar', 'buena vista']) && (meta.anyOfTags || ['Emocionante', 'Animais antropomorficos']).some((t) => hasTag(m, t))), pt, () => 'Pixar Emocionante', 'Pixar');
    case 'hybrid_sk_oscar': return buildSlots((index.moviesByTag.get('sk') || []).filter((m) => m.oscarNoms >= 1 || m.oscarWins >= 1), pt, () => 'SK Oscar', 'SK Oscar');
    case 'hybrid_top250_oscar_winner': return buildSlots((index.moviesByTag.get('top250') || []).filter((m) => m.oscarWins >= 1), pt, () => 'TOP250 Oscar', 'TOP250');
    case 'hybrid_warner_dc_vs_disney_marvel': {
      const a = index.movies.filter((m) => (hasGenre(m, 'Ação') || hasGenre(m, 'Aventura')) && hasTag(m, 'DC') && hasPattern(m.companies, ['warner'])).length;
      const b = index.movies.filter((m) => (hasGenre(m, 'Ação') || hasGenre(m, 'Aventura')) && hasTag(m, 'Marvel') && hasPattern(m.companies, ['disney', 'buena vista', 'sony', 'columbia'])).length;
      const sum = Math.min(15, a) + Math.min(15, b);
      return { rawCount: sum, progressCurrent: sum, progressTarget: 30, isMet: a >= 15 && b >= 15, checklist: [] };
    }
    case 'hybrid_seven_deadly_sins': {
      const s1 = index.movies.filter((m) => hasPattern(m.directors, ['paul w.s. anderson', 'paul w s anderson']) || hasPattern(m.writers, ['paul w.s. anderson', 'paul w s anderson'])).length;
      const s2 = (index.moviesByCountryAll.get('us') || []).length;
      const s3 = index.movies.filter((m) => hasPattern(m.writers, ['bob kane'])).length;
      const s4 = (index.moviesByTag.get(cleanTag('Criança Malvada')) || []).length;
      const s5 = (index.moviesByGenre.get(cleanTag('Curta')) || []).length;
      const s6 = index.movies.filter((m) => hasPattern(m.companies, ['blumhouse', 'disney', 'pixar', 'buena vista'])).length;
      const s7 = (index.moviesByTag.get(cleanTag('Natal')) || []).length;
      const arr = [s1, s2, s3, s4, s5, s6, s7];
      const sum = arr.reduce((acc, v) => acc + Math.min(7, v), 0);
      return { rawCount: sum, progressCurrent: sum, progressTarget: 49, isMet: arr.every((v) => v >= 7), checklist: [] };
    }
    case 'michael_jackson_anthology': {
      const mus = (index.moviesByGenre.get(cleanTag('Música')) || []).length >= 15;
      const checks = [
        (m) => m.releaseYear === 1970 && (hasTag(m, 'Colegio/Escola') || hasTag(m, 'Em Família')),
        (m) => m.releaseYear === 1983 && hasGenre(m, 'Ação'),
        (m) => m.releaseYear === 1983 && (hasTag(m, 'Trágico') || hasGenre(m, 'Suspense')),
        (m) => m.releaseYear === 1984 && (hasTag(m, 'Lobisomem') || hasTag(m, 'Zumbi')),
        (m) => m.releaseYear === 1987 && hasTag(m, 'Criança Malvada'),
        (m) => m.releaseYear === 1988 && (hasTag(m, 'Crime real') || hasGenre(m, 'Policial') || hasGenre(m, 'Crime')),
        (m) => m.releaseYear === 1991 && (hasTag(m, 'Preto e branco') || hasTag(m, 'Em Família')),
        (m) => m.releaseYear === 1991 && (hasTag(m, 'Emocionante') || hasTag(m, 'Fatos Reais')),
        (m) => m.releaseYear === 1992 && hasTag(m, 'Viagem no Tempo'),
        (m) => m.releaseYear === 1995 && (hasTag(m, 'Em Família') || hasGenre(m, 'Romance')),
        (m) => m.releaseYear === 1995 && (hasTag(m, 'Trágico') || hasGenre(m, 'Documentário')),
        (m) => m.releaseYear === 1996 && hasCountry(m, 'br'),
        (m) => m.releaseYear === 1996 && hasTag(m, 'Fantasma'),
        (m) => m.releaseYear === 1997 && hasTag(m, 'Gore'),
        (m) => m.releaseYear === 2014 && (hasTag(m, 'Em Família') || hasTag(m, 'Emocionante')),
      ];
      let c = mus ? 1 : 0;
      for (const fn of checks) if (index.movies.some(fn)) c++;
      return { rawCount: c, progressCurrent: c, progressTarget: 16, isMet: c >= 16, checklist: [] };
    }
    case 'alan_turing_chronicle': {
      const globalReq = Number(meta.requiredGlobalCount) || 8;
      const globalMovies = index.movies.filter((m) => hasGenre(m, 'Ficção Científica') && hasTag(m, 'Personagem LGBT'));
      const globalMet = globalMovies.length >= globalReq;
      let countMet = globalMet ? 1 : 0;
      checklist.push({
        id: 'turing_global_scifi_lgbt',
        name: `Meta Global: Conquistar ${globalReq} filmes de Ficção Científica com a tag "Personagem LGBT"`,
        required: globalReq,
        current: Math.min(globalReq, globalMovies.length),
        conquered: globalMet,
        movie_title: globalMovies[0]?.title || null,
        extra_info: `${globalMovies.length}/${globalReq} filmes no catálogo`,
      });
      const milestones = [
        { id: 'marco_01', name: 'Marco 01 — Sherborne & Christopher (1920 a 1940)', ruleDesc: '1920–1940 + tags "Colégio/Escola" e "Personagem LGBT"', context: 'O despertar matemático no colégio interno e o primeiro amor/amizade profunda com Christopher Morcom, que marcou toda a sua vida.', match: (m) => m.releaseYear !== null && m.releaseYear >= 1920 && m.releaseYear <= 1940 && hasTag(m, 'Colegio/Escola') && hasTag(m, 'Personagem LGBT') },
        { id: 'marco_02', name: 'Marco 02 — A Máquina Universal (1920 a 1940)', ruleDesc: '1920–1940 + gênero "Drama" ou "Ficção Científica"', context: 'Em 1936, Turing publica "On Computable Numbers", criando o conceito teórico da Máquina de Turing.', match: (m) => m.releaseYear !== null && m.releaseYear >= 1920 && m.releaseYear <= 1940 && (hasGenre(m, 'Drama') || hasGenre(m, 'Ficção Científica')) },
        { id: 'marco_03', name: 'Marco 03 — Bletchley Park e o Código Enigma (1930 a 1940)', ruleDesc: '1930–1940 + Reino Unido ou Alemanha', context: 'Lidera a equipe secreta em Bletchley Park e projeta a máquina Bombe para decifrar a Enigma alemã.', match: (m) => m.releaseYear !== null && m.releaseYear >= 1930 && m.releaseYear <= 1940 && (hasCountry(m, 'gb') || hasCountry(m, 'de')) },
        { id: 'marco_04', name: 'Marco 04 — Os Anos de Guerra e o Silêncio (1940 a 1949)', ruleDesc: '1940–1949 + gênero "Drama"', context: 'Seu trabalho encurtou a guerra e salvou milhões de vidas, permanecendo sob sigilo oficial.', match: (m) => m.releaseYear !== null && m.releaseYear >= 1940 && m.releaseYear <= 1949 && hasGenre(m, 'Drama') },
        { id: 'marco_05', name: 'Marco 05 — O Teste de Turing (1950)', ruleDesc: 'Ano 1950 + gênero "Ficção Científica"', context: 'Publica o artigo com o famoso Jogo da Imitação (Teste de Turing), base da Inteligência Artificial.', match: (m) => m.releaseYear === 1950 && hasGenre(m, 'Ficção Científica') },
        { id: 'marco_06', name: 'Marco 06 — O Julgamento Injusto (1952)', ruleDesc: 'Ano 1952 + tag "Preconceito"', context: 'Condenado pela justiça britânica por sua homossexualidade e submetido à castração química.', match: (m) => m.releaseYear === 1952 && hasTag(m, 'Preconceito') },
        { id: 'marco_07', name: 'Marco 07 — A Maçã Envenenada (1954)', ruleDesc: 'Ano 1954 + gênero "Animação"', context: 'Sua morte trágica aos 41 anos por envenenamento por cianeto, encontrado com uma maçã mordida ao lado da cama.', match: (m) => m.releaseYear === 1954 && hasGenre(m, 'Animação') },
        { id: 'marco_08', name: 'Marco 08 — Perdão depois da morte: será que resolve? (2013)', ruleDesc: 'Ano 2013 + Reino Unido', context: 'A Rainha Elizabeth II concede o perdão real póstumo oficial pela perseguição de 1952.', match: (m) => m.releaseYear === 2013 && hasCountry(m, 'gb') },
      ];
      for (const ms of milestones) {
        const matched = index.movies.find(ms.match);
        if (matched) countMet++;
        checklist.push({ id: ms.id, name: ms.name, required: 1, current: matched ? 1 : 0, conquered: Boolean(matched), movie_title: matched?.title || null, movie_year: matched?.releaseYear || null, poster_url: matched?.posterUrl || null, rule_desc: ms.context, extra_info: matched ? `${ms.ruleDesc} • Cumprida` : `Pendente • ${ms.ruleDesc}` });
      }
      return { rawCount: countMet, progressCurrent: countMet, progressTarget: 9, isMet: countMet >= 9, checklist };
    }
    case 'memorial_luto_cycles': {
      const tributes = [
        { id: 'mem_01_vo_delha', name: '1. Vó "Delha" Adélia (2012)', ruleLabel: 'Brasil • Ano 2012 • Gênero Comédia', homage: 'Eu amava muito a minha vó — ela tinha um coração enorme, onde cabiam todos os seus netos, bisnetos, filhos e filhas, a família inteira. Rezava por todos, pensava em todos. Essa eu saberia exatamente o que gostaria de ver na TV: um bom filme de comédia ou o "bonitão" do Silvio Santos. Será que, se o céu existir, ela já o encontrou pessoalmente?', match: (m) => hasCountry(m, 'br') && m.releaseYear === 2012 && hasGenre(m, 'Comédia') },
        { id: 'mem_02_vo', name: '2. Vô (2016)', ruleLabel: 'Ano 2016 • Gênero Ação', homage: 'Um homem do seu tempo, com seus problemas, trabalhador e sofrido com o peso da vida — mas, no final do dia, uma boa pessoa ao seu modo de ser e dentro da sua perspectiva do que era ser "bom".', match: (m) => m.releaseYear === 2016 && hasGenre(m, 'Ação') },
        { id: 'mem_03_vo_nena', name: '3. Vó "Nena" Umbelina (2022)', ruleLabel: 'Ano 2022 • Tag "Religião"', homage: 'Aquela que morou na minha casa por quase 8 anos. Sinto falta do amor, do carinho e de ser chamado de "lindo da avó". Espero que ela esteja bem, onde quer que esteja.', match: (m) => m.releaseYear === 2022 && hasTag(m, 'Religião') },
        { id: 'mem_04_tio_galo', name: '4. Tio "Galo" Onofre (2022)', ruleLabel: 'Ano 2022 • Gênero Animação', homage: 'Uma pessoa trabalhadora e carinhosa à sua maneira. Infelizmente o Parkinson tirou seus gestos, mas nunca o seu sorriso, a sua felicidade e a sua vontade de beber 😉. Acredito que adoraria assistir a uma animação com seus sobrinhos, mesmo que não fosse muito do estilo dele.', match: (m) => m.releaseYear === 2022 && hasGenre(m, 'Animação') },
        { id: 'mem_05_tio_agnaldo', name: '5. Tio Agnaldo (2023)', ruleLabel: 'Ano 2023 • Gênero Curta', homage: 'Uma pessoa bondosa à sua maneira, que me amava o máximo que podia, com um coração enorme e sempre acompanhado do seu radinho de pilha e um cigarro. Como não tinha paciência para ver filmes longos — só se a protagonista fosse bonita ou se fosse um jogo de futebol rsrs —, um curta é a medida perfeita.', match: (m) => m.releaseYear === 2023 && hasGenre(m, 'Curta') },
      ];
      const counts = [];
      for (const tr of tributes) {
        const matches = index.movies.filter(tr.match);
        counts.push(matches.length);
        const previewTitles = matches.length > 0 ? matches.map((m) => m.title).join(' • ') : null;
        checklist.push({
          id: tr.id,
          name: tr.name,
          required: 5,
          current: Math.min(matches.length, 5),
          conquered: matches.length >= 5,
          movie_title: previewTitles,
          poster_url: matches[0]?.posterUrl || null,
          rule_desc: tr.homage,
          rule_label: tr.ruleLabel,
          total_matched: matches.length,
          matched_movies: matches.map((m) => ({
            title: m.title,
            year: m.releaseYear ?? null,
            poster_url: m.posterUrl || null,
            rating: m.ur ?? null,
            month_seen: m.monthSeen ?? null,
            year_seen: m.yearSeen ?? null,
          })),
          extra_info: `${tr.ruleLabel} • ${matches.length}/5 ciclos base${matches.length > 5 ? ` (+${matches.length - 5} extra ★)` : ''}`,
        });
      }
      const completeCycles = counts.length ? Math.min(...counts) : 0;
      return { rawCount: completeCycles, progressCurrent: completeCycles, progressTarget: 5, isMet: completeCycles >= 5, checklist, quotaRawCounts: counts };
    }
    default: return { rawCount: 0, progressCurrent: 0, progressTarget: pt, isMet: false, checklist: [] };
  }
}

function computeClientInfiniteStars(def, raw, isFullyUnlocked, cardOverride, testExtraStarsOverride) {
  const isFiniteCap = Boolean(def.target_metadata?.finiteCap) || def.target_type === 'conquered_countries_count';
  if (isFiniteCap) {
    return { isFiniteCap: true, extraStars: 0, starStep: 0, starCurr: 0, starTarget: 0, starPct: 0 };
  }
  const steps = Array.isArray(def.ranks) ? def.ranks : [];
  const mythicTarget = Number(steps[steps.length - 1]?.target_value ?? def.target_value) || 1;
  let starStep = Math.max(1, Math.round(mythicTarget * 0.2));

  if (testExtraStarsOverride !== null && testExtraStarsOverride !== undefined) {
    return { isFiniteCap: false, extraStars: Math.max(0, Math.floor(Number(testExtraStarsOverride) || 0)), starStep, starCurr: 0, starTarget: starStep, starPct: 0 };
  }
  if (!isFullyUnlocked || cardOverride === false) {
    return { isFiniteCap: false, extraStars: 0, starStep, starCurr: 0, starTarget: starStep, starPct: 0 };
  }
  if (def.target_type === 'memorial_luto_cycles' && Array.isArray(raw.quotaRawCounts) && raw.quotaRawCounts.length > 0) {
    starStep = 1;
    const extraStars = Math.max(0, raw.rawCount - mythicTarget);
    const nextGoal = mythicTarget + extraStars + 1;
    const ready = raw.quotaRawCounts.filter((c) => c >= nextGoal).length;
    const tot = raw.quotaRawCounts.length;
    return { isFiniteCap: false, extraStars, starStep, starCurr: ready, starTarget: tot, starPct: tot > 0 ? Math.min(100, Math.round((ready / tot) * 100)) : 0 };
  }
  if ((def.target_type === 'genre_quotas' || def.target_type === 'tag_checklist_quota') && Array.isArray(raw.quotaRawCounts) && raw.quotaRawCounts.length > 0) {
    const nQ = raw.quotaRawCounts.length;
    const mythicPer = Math.max(1, Math.floor(mythicTarget / nQ));
    const perBucket = Math.max(1, Math.round((mythicTarget * 0.2) / nQ));
    starStep = perBucket * nQ;
    const minEx = Math.min(...raw.quotaRawCounts.map((c) => Math.max(0, c - mythicPer)));
    const extraStars = Math.floor(minEx / perBucket);
    const baseEach = mythicPer + extraStars * perBucket;
    const starCurr = raw.quotaRawCounts.reduce((acc, c) => acc + Math.min(perBucket, Math.max(0, c - baseEach)), 0);
    return { isFiniteCap: false, extraStars, starStep, starCurr, starTarget: starStep, starPct: starStep > 0 ? Math.min(100, Math.round((starCurr / starStep) * 100)) : 0 };
  }
  const excess = Math.max(0, raw.rawCount - mythicTarget);
  const extraStars = Math.floor(excess / starStep);
  const starCurr = excess % starStep;
  return { isFiniteCap: false, extraStars, starStep, starCurr, starTarget: starStep, starPct: starStep > 0 ? Math.min(100, Math.round((starCurr / starStep) * 100)) : 0 };
}

export function evaluateTrophiesClientSide(movies = [], testOverrides = {}, previousTrophies = []) {
  const index = buildClientCatalogIndex(Array.isArray(movies) ? movies : []);
  const prevMap = new Map((Array.isArray(previousTrophies) ? previousTrophies : []).map((t) => [t.id, t]));
  const nonPlats = CLIENT_TROPHY_DEFINITIONS.filter((d) => d.kind !== 'platinum' && d.target_type !== 'platinum_dynamic');
  const plats = CLIENT_TROPHY_DEFINITIONS.filter((d) => d.kind === 'platinum' || d.target_type === 'platinum_dynamic');
  const nowIso = new Date().toISOString();

  const cards = [];
  for (const def of nonPlats) {
    const raw = computeRule(def, index);
    const prev = prevMap.get(def.id);
    const categories = def.categories || [def.category];

    if (def.kind === 'rank' && Array.isArray(def.ranks)) {
      const starOverrideKey = `__stars__${def.id}`;
      const testExtraStarsOverride = testOverrides[starOverrideKey] !== undefined ? testOverrides[starOverrideKey] : prev?.test_extra_stars ?? null;
      const cardOverrideRaw = testOverrides[def.id] !== undefined ? testOverrides[def.id] : prev?.test_override ?? null;
      const cardOverride = testExtraStarsOverride !== null && testExtraStarsOverride > 0 && cardOverrideRaw !== false ? true : cardOverrideRaw;

      let unlockedCount = 0;
      let highestTier = null;
      const ranks = def.ranks.map((step) => {
        const stepOv = cardOverride !== null ? cardOverride : testOverrides[step.id] !== undefined ? testOverrides[step.id] : null;
        let stepTarget = step.target_value;
        let stepCurrent = Math.min(raw.rawCount, stepTarget);
        let stepMet = raw.rawCount >= stepTarget;

        if ((def.target_type === 'genre_quotas' || def.target_type === 'tag_checklist_quota') && Array.isArray(raw.quotaRawCounts)) {
          const n = raw.quotaRawCounts.length || 2;
          const per = Math.max(1, Math.floor(step.target_value / n));
          stepTarget = per * n;
          stepCurrent = raw.quotaRawCounts.reduce((a, v) => a + Math.min(v, per), 0);
          stepMet = raw.quotaRawCounts.every((v) => v >= per);
        }

        const isUnlocked = stepOv === true ? true : stepOv === false ? false : stepMet;
        if (isUnlocked) { unlockedCount++; highestTier = step.tier; }
        return {
          ...step,
          is_unlocked: isUnlocked,
          unlocked_at: isUnlocked ? nowIso : null,
          test_override: stepOv,
          is_new: false,
          progress_current: stepCurrent,
          progress_target: stepTarget,
          progress_percentage: stepTarget > 0 ? Math.min(100, Math.round((stepCurrent / stepTarget) * 100)) : 0,
        };
      });

      const isFullyUnlocked = unlockedCount >= ranks.length;
      const starMetrics = computeClientInfiniteStars(def, raw, isFullyUnlocked, cardOverride, testExtraStarsOverride);
      const active = ranks.find((r) => !r.is_unlocked) || ranks[ranks.length - 1];
      cards.push({
        ...def,
        categories,
        search_keywords: [def.title, def.description, ...ranks.map((r) => `${r.title} ${r.description}`)].join(' '),
        is_unlocked: isFullyUnlocked,
        unlocked_at: unlockedCount > 0 ? nowIso : null,
        test_override: cardOverride,
        is_new: false,
        progress_current: active?.progress_current ?? raw.progressCurrent,
        progress_target: active?.progress_target ?? raw.progressTarget,
        progress_percentage: active?.progress_percentage ?? 0,
        ranks,
        unlocked_ranks_count: unlockedCount,
        highest_unlocked_tier: highestTier,
        extra_stars: starMetrics.extraStars,
        star_step: starMetrics.starStep,
        star_progress_current: starMetrics.starCurr,
        star_progress_target: starMetrics.starTarget,
        star_progress_percentage: starMetrics.starPct,
        test_extra_stars: testExtraStarsOverride,
        is_finite_cap: starMetrics.isFiniteCap,
        checklist: raw.checklist,
      });
    } else {
      const ov = testOverrides[def.id] !== undefined ? testOverrides[def.id] : prev?.test_override ?? null;
      const isUnlocked = ov === true ? true : ov === false ? false : raw.isMet;
      cards.push({
        ...def,
        categories,
        search_keywords: `${def.title} ${def.description}`,
        is_unlocked: isUnlocked,
        unlocked_at: isUnlocked ? prev?.unlocked_at || nowIso : null,
        test_override: ov,
        is_new: false,
        progress_current: raw.progressCurrent,
        progress_target: raw.progressTarget,
        progress_percentage: raw.progressTarget > 0 ? Math.min(100, Math.round((raw.progressCurrent / raw.progressTarget) * 100)) : 0,
        checklist: raw.checklist,
      });
    }
  }

  for (const pDef of plats) {
    const scopeCat = pDef.target_metadata?.categoryScope || pDef.target_metadata?.category || pDef.category;
    const scoped = cards.filter((c) => c.category === scopeCat || (c.categories || []).includes(scopeCat));
    let tot = 0, done = 0;
    for (const c of scoped) {
      if (c.kind === 'rank' && Array.isArray(c.ranks)) {
        tot += c.ranks.length;
        done += c.ranks.filter((r) => r.is_unlocked).length;
      } else {
        tot += 1;
        if (c.is_unlocked) done += 1;
      }
    }
    const ov = testOverrides[pDef.id] !== undefined ? testOverrides[pDef.id] : null;
    const isUnlocked = ov === true ? true : ov === false ? false : tot > 0 && done >= tot;
    cards.push({
      ...pDef,
      categories: pDef.categories || [pDef.category],
      search_keywords: `${pDef.title} ${pDef.description}`,
      is_unlocked: isUnlocked,
      unlocked_at: isUnlocked ? nowIso : null,
      test_override: ov,
      is_new: false,
      progress_current: done,
      progress_target: tot,
      progress_percentage: tot > 0 ? Math.min(100, Math.round((done / tot) * 100)) : 0,
      checklist: scoped.map((c) => ({ id: c.id, name: c.title, required: 1, current: c.is_unlocked ? 1 : 0, conquered: c.is_unlocked })),
    });
  }

  cards.sort((a, b) => a.sort_order - b.sort_order);

  const tierStats = {};
  for (const [k, cfg] of Object.entries(TIER_CONFIG)) {
    tierStats[k] = { name: cfg.name, symbol: cfg.symbol, color: cfg.color, total: 0, unlocked: 0, percentage: 0 };
  }
  let totalPoints = 0, earnedPoints = 0, unlockedCards = 0, totalAch = 0, unlockedAch = 0;
  for (const c of cards) {
    if (c.kind === 'rank' && Array.isArray(c.ranks)) {
      if ((c.unlocked_ranks_count || 0) > 0) unlockedCards++;
      for (const r of c.ranks) {
        totalAch++;
        const pts = TIER_CONFIG[r.tier]?.points || 15;
        tierStats[r.tier].total++;
        totalPoints += pts;
        if (r.is_unlocked) { unlockedAch++; tierStats[r.tier].unlocked++; earnedPoints += pts; }
      }
    } else {
      if (c.is_unlocked) unlockedCards++;
      totalAch++;
      const pts = TIER_CONFIG[c.tier]?.points || 15;
      tierStats[c.tier].total++;
      totalPoints += pts;
      if (c.is_unlocked) { unlockedAch++; tierStats[c.tier].unlocked++; earnedPoints += pts; }
    }
  }
  for (const st of Object.values(tierStats)) st.percentage = st.total > 0 ? Math.round((st.unlocked / st.total) * 100) : 0;

  return {
    totalTrophies: cards.length,
    totalAchievements: totalAch,
    unlockedCount: unlockedCards,
    unlockedAchievementsCount: unlockedAch,
    overallPercentage: totalAch > 0 ? Math.round((unlockedAch / totalAch) * 100) : 0,
    totalPoints,
    earnedPoints,
    tierStats,
    trophies: cards,
    newlyUnlocked: [],
    progressedTrophies: [],
  };
}
