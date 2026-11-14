import {
  LEVEL_TITLE_RANGES,
  TROPHY_TIER_META,
  COUNTRY_RARITY_META,
  TIME_MACHINE_RARITY_META,
  calculateClientXpStatus,
} from './xpSystem';
import { CATEGORY_BADGE_CONFIG, getCleanTrophyTitle } from '../components/TrophyBadges';
import { UN_COUNTRIES_195, getCountryRarityTier } from '../data/unCountries195';

const UN_COUNTRY_BY_CODE = new Map();
const UN_COUNTRY_BY_NAME = new Map();
const normalizeKey = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

UN_COUNTRIES_195.forEach((c) => {
  const code = c.code.toLowerCase();
  UN_COUNTRY_BY_CODE.set(code, c);
  UN_COUNTRY_BY_NAME.set(normalizeKey(c.name), c);
  if (Array.isArray(c.aliases)) {
    c.aliases.forEach((a) => UN_COUNTRY_BY_NAME.set(normalizeKey(a), c));
  }
});
[['estados unidos', 'us'], ['usa', 'us'], ['eua', 'us'], ['brasil', 'br'], ['reino unido', 'gb'], ['uk', 'gb'], ['inglaterra', 'gb'], ['holanda', 'nl'], ['paises baixos', 'nl'], ['russia', 'ru'], ['coreia do sul', 'kr'], ['coreia do norte', 'kp']].forEach(([alias, code]) => {
  const ref = UN_COUNTRY_BY_CODE.get(code);
  if (ref && !UN_COUNTRY_BY_NAME.has(alias)) UN_COUNTRY_BY_NAME.set(alias, ref);
});

export const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const FULL_MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

export const formatRuntime = (mins) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}min`;
  return rem > 0 ? `${h}h ${String(rem).padStart(2, '0')}m` : `${h}h`;
};

export const normalizeStudioOrDist = (text) => {
  if (!text) return '';
  const name = text.toLowerCase().trim();
  if (name === 'dc' || name.includes('dc entertainment') || name === 'dc comics') return 'DC Entertainment';
  if (name.includes('warner')) return 'Warner Bros.';
  if (name.includes('disney') || name.includes('pixar')) return 'Disney / Pixar';
  if (name.includes('universal')) return 'Universal Pictures';
  if (name.includes('paramount')) return 'Paramount';
  if (name.includes('sony') || name.includes('columbia')) return 'Sony Pictures';
  if (name.includes('netflix')) return 'Netflix';
  if (name.includes('a24')) return 'A24';
  if (name.includes('lionsgate') || name.includes('liongate')) return 'Lionsgate';
  if (name.includes('paris filmes')) return 'Paris Filmes';
  return text.trim();
};

export const splitDistributors = (distributorStr) => {
  if (!distributorStr) return [];
  return String(distributorStr)
    .split(/\s+-\s*|\s*-\s+|\s*\/\s*|\s*,\s*|\s+e\s+/)
    .map((d) => normalizeStudioOrDist(d.trim()))
    .filter(Boolean);
};

export function deduplicateMovies(movies = []) {
  const map = new Map();
  (movies || []).forEach((m) => {
    const key = m.movie_id || m.id || `${m.title}_${m.release_year || ''}`;
    if (!map.has(key)) {
      map.set(key, m);
    }
  });
  return Array.from(map.values());
}

export function getRankGrade(score) {
  if (score >= 97) {
    return {
      grade: 'SS++',
      title: 'Mítico Supremo',
      color: 'text-amber-200 border-amber-300 bg-gradient-to-r from-amber-500/35 via-rose-500/25 to-purple-500/35 shadow-[0_0_15px_rgba(251,191,36,0.45)] font-black tracking-wider animate-pulse',
    };
  }
  if (score >= 91) {
    return {
      grade: 'SS+',
      title: 'Cósmico',
      color: 'text-fuchsia-200 border-fuchsia-400 bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 shadow-[0_0_12px_rgba(217,70,239,0.35)] font-black tracking-wider',
    };
  }
  if (score >= 82) {
    return {
      grade: 'SS',
      title: 'Supremo',
      color: 'text-rose-300 border-rose-400/70 bg-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.25)] font-black',
    };
  }
  if (score >= 70) {
    return {
      grade: 'S',
      title: 'Lendário',
      color: 'text-amber-300 border-amber-400/60 bg-amber-500/20 font-black',
    };
  }
  if (score >= 50) {
    return {
      grade: 'A',
      title: 'Veterano',
      color: 'text-purple-300 border-purple-400/50 bg-purple-500/20 font-bold',
    };
  }
  if (score >= 30) {
    return {
      grade: 'B',
      title: 'Intermediário',
      color: 'text-cyan-300 border-cyan-400/50 bg-cyan-500/20 font-bold',
    };
  }
  return {
    grade: 'C',
    title: 'Iniciante',
    color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15 font-bold',
  };
}

/**
 * 1. Panteão das 4 Notas + Média Normalizada Suprema (0 a 100)
 */
export function computeRatingsPantheon(movies = []) {
  const unique = deduplicateMovies(movies);

  let sumUser100 = 0, countUser = 0;
  let sumImdb100 = 0, countImdb = 0;
  let sumMeta100 = 0, countMeta = 0;
  let sumRotten100 = 0, countRotten = 0;

  const enriched = unique.map((m) => {
    const rawUser = Number(m.user_rating);
    const hasUser = Number.isFinite(rawUser) && rawUser > 0;
    const normUser = hasUser ? rawUser * 10 : null;

    const rawImdb = Number(m.imdb_rating);
    const hasImdb = Number.isFinite(rawImdb) && rawImdb > 0;
    const normImdb = hasImdb ? rawImdb * 10 : null;

    const hasMeta =
      m.metacritic_score !== null &&
      m.metacritic_score !== undefined &&
      String(m.metacritic_score).trim() !== '' &&
      Number(m.metacritic_score) > 0;
    const rawMeta = hasMeta ? Number(m.metacritic_score) : null;
    const normMeta = rawMeta;

    const hasRotten =
      m.rotten_tomatoes_score !== null &&
      m.rotten_tomatoes_score !== undefined &&
      String(m.rotten_tomatoes_score).trim() !== '' &&
      Number.isFinite(Number(m.rotten_tomatoes_score));
    const rawRotten = hasRotten ? Number(m.rotten_tomatoes_score) : null;
    const normRotten = rawRotten;

    if (hasUser) { sumUser100 += normUser; countUser++; }
    if (hasImdb) { sumImdb100 += normImdb; countImdb++; }
    if (hasMeta) { sumMeta100 += normMeta; countMeta++; }
    if (hasRotten) { sumRotten100 += normRotten; countRotten++; }

    const validNorms = [normUser, normImdb, normMeta, normRotten].filter((v) => v !== null);
    const metricsCount = validNorms.length;
    const unifiedScore =
      metricsCount > 0
        ? validNorms.reduce((acc, cur) => acc + cur, 0) / metricsCount
        : 0;

    return {
      ...m,
      hasUser,
      hasImdb,
      hasMeta,
      hasRotten,
      rawUser: hasUser ? rawUser : null,
      rawImdb: hasImdb ? rawImdb : null,
      rawMeta,
      rawRotten,
      normUser,
      normImdb,
      normMeta,
      normRotten,
      metricsCount,
      unifiedScore,
      unifiedFormatted: unifiedScore.toFixed(2),
    };
  });

  const strict4Pool = enriched.filter((m) => m.metricsCount === 4);
  const unifiedPool = strict4Pool.length >= 5 ? strict4Pool : enriched.filter((m) => m.metricsCount >= 3);
  const usingStrict4 = strict4Pool.length >= 5;

  const sortedUnifiedDesc = [...unifiedPool].sort((a, b) => {
    if (Math.abs(b.unifiedScore - a.unifiedScore) > 0.0001) return b.unifiedScore - a.unifiedScore;
    return (b.rawUser || 0) - (a.rawUser || 0);
  });

  const sortedUnifiedAsc = [...unifiedPool].sort((a, b) => {
    if (Math.abs(a.unifiedScore - b.unifiedScore) > 0.0001) return a.unifiedScore - b.unifiedScore;
    return (a.rawUser || 0) - (b.rawUser || 0);
  });

  const top5User = enriched
    .filter((m) => m.hasUser)
    .sort((a, b) => b.rawUser - a.rawUser || b.unifiedScore - a.unifiedScore)
    .slice(0, 5);

  const bottom5User = enriched
    .filter((m) => m.hasUser)
    .sort((a, b) => a.rawUser - b.rawUser || a.unifiedScore - b.unifiedScore)
    .slice(0, 5);

  const top5Imdb = enriched
    .filter((m) => m.hasImdb)
    .sort(
      (a, b) =>
        b.rawImdb - a.rawImdb ||
        (Number(b.vote_count) || 0) - (Number(a.vote_count) || 0) ||
        (b.rawUser || 0) - (a.rawUser || 0)
    )
    .slice(0, 5);

  const top5Metacritic = enriched
    .filter((m) => m.hasMeta)
    .sort(
      (a, b) =>
        b.rawMeta - a.rawMeta ||
        (b.rawRotten || 0) - (a.rawRotten || 0) ||
        (b.rawUser || 0) - (a.rawUser || 0)
    )
    .slice(0, 5);

  const top5Rotten = enriched
    .filter((m) => m.hasRotten)
    .sort(
      (a, b) =>
        b.rawRotten - a.rawRotten ||
        (b.rawMeta || 0) - (a.rawMeta || 0) ||
        (b.rawImdb || 0) - (a.rawImdb || 0) ||
        (b.rawUser || 0) - (a.rawUser || 0)
    )
    .slice(0, 5);

  const judges = [
    {
      id: 'user',
      label: 'Minha Nota (×10)',
      shortLabel: 'Você',
      icon: '⭐',
      avg100: countUser > 0 ? sumUser100 / countUser : 0,
      rawDisplay: countUser > 0 ? `${(sumUser100 / countUser / 10).toFixed(3)} / 10` : 'N/A',
      count: countUser,
      barColor: 'from-amber-500 to-yellow-300',
      textColor: 'text-amber-300',
    },
    {
      id: 'rotten',
      label: 'Rotten Tomatoes',
      shortLabel: 'Rotten Tomatoes',
      icon: '🍅',
      avg100: countRotten > 0 ? sumRotten100 / countRotten : 0,
      rawDisplay: countRotten > 0 ? `${(sumRotten100 / countRotten).toFixed(1)}%` : 'N/A',
      count: countRotten,
      barColor: 'from-rose-500 to-orange-400',
      textColor: 'text-rose-300',
    },
    {
      id: 'imdb',
      label: 'Público IMDb (×10)',
      shortLabel: 'IMDb',
      icon: '🟡',
      avg100: countImdb > 0 ? sumImdb100 / countImdb : 0,
      rawDisplay: countImdb > 0 ? `${(sumImdb100 / countImdb / 10).toFixed(2)} / 10` : 'N/A',
      count: countImdb,
      barColor: 'from-yellow-500 to-amber-300',
      textColor: 'text-yellow-300',
    },
    {
      id: 'meta',
      label: 'Crítica Metacritic',
      shortLabel: 'Metacritic',
      icon: '🟩',
      avg100: countMeta > 0 ? sumMeta100 / countMeta : 0,
      rawDisplay: countMeta > 0 ? `${(sumMeta100 / countMeta).toFixed(1)} / 100` : 'N/A',
      count: countMeta,
      barColor: 'from-emerald-500 to-teal-300',
      textColor: 'text-emerald-300',
    },
  ];

  const activeJudges = judges.filter((j) => j.count > 0);
  const sortedJudges = [...activeJudges].sort((a, b) => b.avg100 - a.avg100);
  const mostGenerous = sortedJudges[0] || null;
  const harshest = sortedJudges[sortedJudges.length - 1] || null;

  return {
    top5Unified: sortedUnifiedDesc.slice(0, 5),
    bottom5Unified: sortedUnifiedAsc.slice(0, 5),
    eligibleUnifiedCount: unifiedPool.length,
    strict4Count: strict4Pool.length,
    usingStrict4,
    top5User,
    bottom5User,
    top5Imdb,
    top5Metacritic,
    top5Rotten,
    judges,
    mostGenerous,
    harshest,
  };
}

const RARITY_RANK_195 = { mythic: 5, legendary: 4, epic: 3, rare: 2, common: 1 };

const OMDB_MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function extractReleaseDateInfo(movie) {
  const tmdbDate = movie?.raw_api_data?.tmdb?.release_date;
  if (tmdbDate && typeof tmdbDate === 'string') {
    const parts = tmdbDate.trim().split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (month >= 1 && month <= 12) {
      return {
        month,
        day: day >= 1 && day <= 31 ? day : null,
        formatted:
          day >= 1 && day <= 31 && year > 1880
            ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
            : null,
      };
    }
  }
  const omdbRel = movie?.raw_api_data?.omdb?.Released;
  if (omdbRel && typeof omdbRel === 'string') {
    const match = omdbRel.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (match) {
      const month = OMDB_MONTH_MAP[match[2].toLowerCase()];
      const day = Number(match[1]);
      if (month) {
        return {
          month,
          day: day >= 1 && day <= 31 ? day : null,
          formatted: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${match[3]}`,
        };
      }
    }
  }
  return { month: null, day: null, formatted: null };
}

function resolveOriginRarityForMovie(movie, worldOriginMap = {}) {
  const mapped = movie?.movie_id != null ? worldOriginMap[String(movie.movie_id)] : null;
  let code = mapped?.code ? String(mapped.code).toLowerCase() : null;
  let tier = mapped?.rarityTier ? String(mapped.rarityTier).toLowerCase() : null;
  let name = mapped?.name || null;
  const isCountryChampion = Boolean(mapped?.isCountryChampion);

  if (!code) {
    const manual = String(movie?.manual_origin_code || movie?.manual_pick_code || '').toLowerCase().trim();
    if (manual && UN_COUNTRY_BY_CODE.has(manual)) {
      code = manual;
    } else if (Array.isArray(movie?.countries) && movie.countries.length === 1) {
      const ref = UN_COUNTRY_BY_NAME.get(normalizeKey(movie.countries[0]));
      if (ref) code = ref.code.toLowerCase();
    }
  }

  if (!code || !UN_COUNTRY_BY_CODE.has(code)) return null;
  const def = UN_COUNTRY_BY_CODE.get(code);
  const resolvedTier = tier || def?.rarityTier || getCountryRarityTier(code);
  const rank = RARITY_RANK_195[resolvedTier] || 0;
  if (!rank) return null;

  return {
    code,
    name: name || def?.name || code.toUpperCase(),
    rarityTier: resolvedTier,
    rank,
    isCountryChampion,
    meta: COUNTRY_RARITY_META[resolvedTier] || COUNTRY_RARITY_META.common,
  };
}

function buildRecordWithTies({
  id,
  rarity,
  rarityLabel,
  icon,
  title,
  subtitle,
  sortedCandidates,
  getScore,
  isSameScore = (a, b) => a === b,
  formatVariant,
  formatNextDistinct,
  tieSummary = null,
}) {
  if (!Array.isArray(sortedCandidates) || sortedCandidates.length === 0) return null;
  const topScore = getScore(sortedCandidates[0]);
  const tiedItems = sortedCandidates.filter((item) => isSameScore(getScore(item), topScore));
  const nextDistinct = sortedCandidates.find((item) => !isSameScore(getScore(item), topScore)) || null;
  const tiedVariants = tiedItems.map((item) => {
    const formatted = formatVariant(item);
    return {
      movie: item.movie || item,
      statBadge: formatted.statBadge,
      statDetail: formatted.statDetail,
      flagCode: formatted.flagCode || null,
    };
  });

  return {
    id,
    rarity,
    rarityLabel,
    icon,
    title,
    subtitle,
    movie: tiedVariants[0].movie,
    statBadge: tiedVariants[0].statBadge,
    statDetail: tiedVariants[0].statDetail,
    flagCode: tiedVariants[0].flagCode,
    tiedVariants,
    tieSummary: tiedVariants.length > 1 ? tieSummary : null,
    runnerUp: nextDistinct ? formatNextDistinct(nextDistinct) : null,
  };
}

/**
 * 2. Museu de Relíquias & Curiosidades Extremas (Loot Cards RPG com Flip para Empates)
 */
export function computeExtremeRecords(movies = [], worldOriginMap = {}) {
  const unique = deduplicateMovies(movies);
  if (unique.length === 0) return [];

  const records = [];
  const pushRec = (rec) => {
    if (rec) records.push(rec);
  };

  // 1 & 2. Menor e Maior Vote Count
  const withVotesAsc = unique
    .filter((m) => Number(m.vote_count) > 0)
    .sort((a, b) => Number(a.vote_count) - Number(b.vote_count) || Number(b.user_rating || 0) - Number(a.user_rating || 0));
  if (withVotesAsc.length > 0) {
    pushRec(buildRecordWithTies({
      id: 'rarest_votes',
      rarity: 'mythic',
      rarityLabel: '💎 RELÍQUIA MÍTICA',
      icon: '🕵️',
      title: 'Achado Mais Raro & Underground',
      subtitle: 'Menor número de votos globais no mundo',
      sortedCandidates: withVotesAsc,
      getScore: (m) => Number(m.vote_count),
      formatVariant: (m) => ({
        statBadge: `${Number(m.vote_count).toLocaleString('pt-BR')} votos`,
        statDetail: `Ano ${m.release_year || '?'} • Quase ninguém no planeta catalogou!`,
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${Number(m.vote_count).toLocaleString('pt-BR')} votos)`,
    }));

    const withVotesDesc = [...withVotesAsc].sort(
      (a, b) => Number(b.vote_count) - Number(a.vote_count) || Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
    pushRec(buildRecordWithTies({
      id: 'popular_votes',
      rarity: 'legendary',
      rarityLabel: '🥇 COLOSSO LENDÁRIO',
      icon: '🌍',
      title: 'Titã de Popularidade Global',
      subtitle: 'Filme com mais avaliações mundiais',
      sortedCandidates: withVotesDesc,
      getScore: (m) => Number(m.vote_count),
      formatVariant: (m) => ({
        statBadge: `${Number(m.vote_count).toLocaleString('pt-BR')} votos`,
        statDetail: `IMDb ${Number(m.imdb_rating || 0).toFixed(1)} • Minha: ${Number(m.user_rating || 0).toFixed(3)}`,
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${Number(m.vote_count).toLocaleString('pt-BR')})`,
    }));
  }

  // 3. País Mais Raro no Desafio dos 195 (1 card representativo por país empatado!)
  const rareCountryGroups = new Map();
  unique.forEach((m) => {
    const origin = resolveOriginRarityForMovie(m, worldOriginMap);
    if (!origin) return;
    if (!rareCountryGroups.has(origin.code)) {
      rareCountryGroups.set(origin.code, { origin, movies: [] });
    }
    const g = rareCountryGroups.get(origin.code);
    g.movies.push({ movie: m, isCountryChampion: origin.isCountryChampion });
  });

  const sortedRareCountries = Array.from(rareCountryGroups.values())
    .map((g) => {
      const sortedMovies = [...g.movies].sort(
        (a, b) =>
          Number(b.isCountryChampion) - Number(a.isCountryChampion) ||
          Number(b.movie.user_rating || 0) - Number(a.movie.user_rating || 0)
      );
      return {
        origin: g.origin,
        movie: sortedMovies[0].movie,
        allMovies: sortedMovies.map((x) => x.movie),
      };
    })
    .sort(
      (a, b) =>
        b.origin.rank - a.origin.rank ||
        Number(b.movie.user_rating || 0) - Number(a.movie.user_rating || 0)
    );

  if (sortedRareCountries.length > 0) {
    const topOrigin = sortedRareCountries[0].origin;
    const rarKey = ['mythic', 'legendary', 'epic', 'rare'].includes(topOrigin.rarityTier)
      ? topOrigin.rarityTier
      : 'rare';
    const topCountriesList = sortedRareCountries.filter((c) => c.origin.rank === topOrigin.rank);
    const countryNamesSummary = topCountriesList.map((c) => c.origin.name).join(', ');
    pushRec(buildRecordWithTies({
      id: 'rarest_origin_country',
      rarity: rarKey,
      rarityLabel: `${topOrigin.meta.icon} ${topOrigin.meta.label.toUpperCase()} • DESAFIO 195`,
      icon: '🗺️',
      title: 'País Mais Raro (Desafio 195)',
      subtitle: 'Maior raridade geográfica (país de origem único)',
      sortedCandidates: sortedRareCountries,
      getScore: (it) => it.origin.rank,
      tieSummary: `Empate (${topCountriesList.length} países: ${countryNamesSummary})`,
      formatVariant: (it) => {
        const titlesList = it.allMovies.map((m) => m.title).join(', ');
        return {
          statBadge: `${it.origin.meta.icon} ${it.origin.name} (${it.origin.meta.label})`,
          statDetail: `${it.allMovies.length > 1 ? `Filmes (${it.allMovies.length}): ${titlesList}` : `Filme: ${titlesList}`} • +${it.origin.meta.xpEach} XP`,
          flagCode: it.origin.code,
        };
      },
      formatNextDistinct: (it) => `2º: ${it.movie.title} (${it.origin.name} • ${it.origin.meta.label})`,
    }));
  }

  // 4 & 5. Maior e Menor Duração
  const withRuntimeDesc = unique
    .filter((m) => Number(m.runtime) > 0)
    .sort((a, b) => Number(b.runtime) - Number(a.runtime) || Number(b.user_rating || 0) - Number(a.user_rating || 0));
  if (withRuntimeDesc.length > 0) {
    pushRec(buildRecordWithTies({
      id: 'longest_runtime',
      rarity: 'legendary',
      rarityLabel: '🥇 CHEFÃO DE RESISTÊNCIA',
      icon: '⏳',
      title: 'Maior Tempo de Duração',
      subtitle: 'A maratona suprema de um único filme',
      sortedCandidates: withRuntimeDesc,
      getScore: (m) => Number(m.runtime),
      formatVariant: (m) => ({
        statBadge: `${m.runtime} min (${formatRuntime(m.runtime)})`,
        statDetail: `Lançado em ${m.release_year || '?'} • Teste máximo de foco!`,
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${m.runtime} min)`,
    }));

    const withRuntimeAsc = [...withRuntimeDesc].sort(
      (a, b) => Number(a.runtime) - Number(b.runtime) || Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
    pushRec(buildRecordWithTies({
      id: 'shortest_runtime',
      rarity: 'rare',
      rarityLabel: '🔵 SPEEDRUN RARO',
      icon: '⚡',
      title: 'Menor Tempo de Duração',
      subtitle: 'Tiro curto e direto ao ponto',
      sortedCandidates: withRuntimeAsc,
      getScore: (m) => Number(m.runtime),
      formatVariant: (m) => ({
        statBadge: `${m.runtime} min (${formatRuntime(m.runtime)})`,
        statDetail: `Lançado em ${m.release_year || '?'} • Nota ${Number(m.user_rating || 0).toFixed(3)}`,
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${m.runtime} min)`,
    }));
  }

  // 6. Maior Campeão de Oscars
  const withOscarWins = unique
    .filter((m) => Number(m.oscar_wins) > 0)
    .sort(
      (a, b) =>
        Number(b.oscar_wins) - Number(a.oscar_wins) ||
        Number(b.oscar_nominations || 0) - Number(a.oscar_nominations || 0) ||
        Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
  if (withOscarWins.length > 0) {
    pushRec(buildRecordWithTies({
      id: 'most_oscar_wins',
      rarity: 'mythic',
      rarityLabel: '💎 REALEZA DA ACADEMIA',
      icon: '🏆',
      title: 'Maior Ganhador de Oscar',
      subtitle: 'Recordista de estatuetas douradas no catálogo',
      sortedCandidates: withOscarWins,
      getScore: (m) => Number(m.oscar_wins),
      formatVariant: (m) => ({
        statBadge: `🏆 ${m.oscar_wins} Oscars`,
        statDetail: `${m.oscar_nominations || m.oscar_wins} indicações oficiais na cerimônia`,
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${m.oscar_wins} Oscars)`,
    }));
  }

  // 7. Mais Indicações ao Oscar
  const withOscarNoms = unique
    .filter((m) => Number(m.oscar_nominations) > 0)
    .sort(
      (a, b) =>
        Number(b.oscar_nominations) - Number(a.oscar_nominations) ||
        Number(b.oscar_wins || 0) - Number(a.oscar_wins || 0) ||
        Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
  if (withOscarNoms.length > 0) {
    pushRec(buildRecordWithTies({
      id: 'most_oscar_noms',
      rarity: 'epic',
      rarityLabel: '💜 ÍMÃ DA ACADEMIA',
      icon: '🎬',
      title: 'Recordista de Indicações ao Oscar',
      subtitle: 'O queridinho absoluto das votações',
      sortedCandidates: withOscarNoms,
      getScore: (m) => Number(m.oscar_nominations),
      formatVariant: (m) => ({
        statBadge: `🎬 ${m.oscar_nominations} Indicações`,
        statDetail: `Converteu ${m.oscar_wins || 0} vitória(s) na premiação`,
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${m.oscar_nominations} ind.)`,
    }));
  }

  // 8. Filme com Mais Tags
  const byTags = unique
    .filter((m) => Array.isArray(m.tags) && m.tags.length > 0)
    .sort((a, b) => b.tags.length - a.tags.length || Number(b.user_rating || 0) - Number(a.user_rating || 0));
  if (byTags.length > 0) {
    pushRec(buildRecordWithTies({
      id: 'most_tags',
      rarity: 'epic',
      rarityLabel: '💜 QUIMERA DE TAGS',
      icon: '🏷️',
      title: 'Filme com Maior Número de Tags',
      subtitle: 'Mistura mais insana de temas e elementos',
      sortedCandidates: byTags,
      getScore: (m) => m.tags.length,
      formatVariant: (m) => ({
        statBadge: `${m.tags.length} Tags`,
        statDetail: m.tags.slice(0, 5).join(' • ') + (m.tags.length > 5 ? '...' : ''),
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${m.tags.length} tags)`,
    }));
  }

  // 9. Filme com Mais Gêneros
  const byGenres = unique
    .filter((m) => Array.isArray(m.genres) && m.genres.length > 0)
    .sort((a, b) => b.genres.length - a.genres.length || Number(b.user_rating || 0) - Number(a.user_rating || 0));
  if (byGenres.length > 0) {
    pushRec(buildRecordWithTies({
      id: 'most_genres',
      rarity: 'rare',
      rarityLabel: '🔵 MUTANTE MULTICLASSE',
      icon: '🧬',
      title: 'Mais Gêneros Combinados',
      subtitle: 'Obra híbrida que cruza múltiplas classes',
      sortedCandidates: byGenres,
      getScore: (m) => m.genres.length,
      formatVariant: (m) => ({
        statBadge: `${m.genres.length} Gêneros`,
        statDetail: m.genres.join(' • '),
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${m.genres.length} gêneros)`,
    }));
  }

  // 10 & 11. Filme Mais Antigo & Filme Mais Novo Assistido (com mês de lançamento quando disponível)
  const withRelease = unique
    .filter((m) => Number(m.release_year) > 1880)
    .map((m) => {
      const dateInfo = extractReleaseDateInfo(m);
      return {
        movie: m,
        releaseYear: Number(m.release_year),
        releaseMonth: dateInfo.month,
        releaseDay: dateInfo.day,
        releaseDateFormatted: dateInfo.formatted,
      };
    });

  if (withRelease.length > 0) {
    const minYear = Math.min(...withRelease.map((r) => r.releaseYear));
    const minYearAllHaveMonth = withRelease
      .filter((r) => r.releaseYear === minYear)
      .every((r) => r.releaseMonth !== null);

    const byOldest = [...withRelease].sort((a, b) => {
      if (a.releaseYear !== b.releaseYear) return a.releaseYear - b.releaseYear;
      if (minYearAllHaveMonth) {
        if ((a.releaseMonth || 99) !== (b.releaseMonth || 99)) {
          return (a.releaseMonth || 99) - (b.releaseMonth || 99);
        }
        return (a.releaseDay || 99) - (b.releaseDay || 99);
      }
      return Number(b.movie.user_rating || 0) - Number(a.movie.user_rating || 0);
    });
    const currentYear = new Date().getFullYear();

    pushRec(buildRecordWithTies({
      id: 'oldest_release',
      rarity: 'mythic',
      rarityLabel: '💎 ARTEFATO ANCESTRAL',
      icon: '🏺',
      title: 'Filme Mais Antigo Assistido',
      subtitle: 'Sua viagem mais profunda ao passado do cinema',
      sortedCandidates: byOldest,
      getScore: (r) => (minYearAllHaveMonth && r.releaseYear === minYear ? r.releaseYear * 100 + r.releaseMonth : r.releaseYear),
      formatVariant: (r) => ({
        statBadge: r.releaseMonth ? `${MONTH_NAMES[r.releaseMonth - 1]}/${r.releaseYear}` : `Ano ${r.releaseYear}`,
        statDetail: `${r.releaseDateFormatted ? `Estreia ${r.releaseDateFormatted} • ` : ''}${currentYear - r.releaseYear} anos de história cinematográfica!`,
      }),
      formatNextDistinct: (r) =>
        `2º: ${r.movie.title} (${r.releaseMonth ? `${MONTH_NAMES[r.releaseMonth - 1]}/${r.releaseYear}` : r.releaseYear})`,
    }));

    const maxYear = Math.max(...withRelease.map((r) => r.releaseYear));
    const maxYearAllHaveMonth = withRelease
      .filter((r) => r.releaseYear === maxYear)
      .every((r) => r.releaseMonth !== null);

    const byNewest = [...withRelease].sort((a, b) => {
      if (b.releaseYear !== a.releaseYear) return b.releaseYear - a.releaseYear;
      if (maxYearAllHaveMonth) {
        if ((b.releaseMonth || 0) !== (a.releaseMonth || 0)) {
          return (b.releaseMonth || 0) - (a.releaseMonth || 0);
        }
        if ((b.releaseDay || 0) !== (a.releaseDay || 0)) {
          return (b.releaseDay || 0) - (a.releaseDay || 0);
        }
      }
      return (
        (Number(b.movie.year_seen) || 0) - (Number(a.movie.year_seen) || 0) ||
        (Number(b.movie.month_seen) || 0) - (Number(a.movie.month_seen) || 0) ||
        Number(b.movie.user_rating || 0) - Number(a.movie.user_rating || 0)
      );
    });

    const newestBadgeStr = byNewest[0]?.releaseMonth
      ? `${MONTH_NAMES[byNewest[0].releaseMonth - 1]}/${byNewest[0].releaseYear}`
      : `Ano ${maxYear}`;

    pushRec(buildRecordWithTies({
      id: 'newest_release',
      rarity: 'rare',
      rarityLabel: '🔵 LANÇAMENTO RECENTE',
      icon: '🚀',
      title: 'Filme Mais Novo Assistido',
      subtitle: 'A produção mais recente que você assistiu',
      sortedCandidates: byNewest,
      getScore: (r) => (maxYearAllHaveMonth && r.releaseYear === maxYear ? r.releaseYear * 100 + r.releaseMonth : r.releaseYear),
      tieSummary: `Empate (${newestBadgeStr})`,
      formatVariant: (r) => {
        const seenStr = r.movie.year_seen
          ? r.movie.month_seen
            ? `${MONTH_NAMES[Number(r.movie.month_seen) - 1] || r.movie.month_seen}/${r.movie.year_seen}`
            : String(r.movie.year_seen)
          : null;
        return {
          statBadge: r.releaseMonth ? `${MONTH_NAMES[r.releaseMonth - 1]}/${r.releaseYear}` : `Ano ${r.releaseYear}`,
          statDetail: `${r.releaseDateFormatted ? `Estreia ${r.releaseDateFormatted} • ` : ''}${seenStr ? `Assistido em ${seenStr} • ` : ''}Nota ${Number(r.movie.user_rating || 0).toFixed(3)}`,
        };
      },
      formatNextDistinct: (r) =>
        `2º: ${r.movie.title} (${r.releaseMonth ? `${MONTH_NAMES[r.releaseMonth - 1]}/${r.releaseYear}` : r.releaseYear})`,
    }));
  }

  // 12 & 13. Filme com Maior Nome & Filme com Menor Nome
  const withTitles = unique
    .filter((m) => String(m.title || '').trim().length > 0)
    .map((m) => ({ movie: m, titleLen: String(m.title || '').trim().length }));
  if (withTitles.length > 0) {
    const byLongestTitle = [...withTitles].sort(
      (a, b) => b.titleLen - a.titleLen || Number(b.movie.user_rating || 0) - Number(a.movie.user_rating || 0)
    );
    pushRec(buildRecordWithTies({
      id: 'longest_title',
      rarity: 'epic',
      rarityLabel: '💜 TÍTULO ÉPICO',
      icon: '📜',
      title: 'Filme com Maior Nome',
      subtitle: 'Título mais extenso do catálogo',
      sortedCandidates: byLongestTitle,
      getScore: (t) => t.titleLen,
      formatVariant: (t) => ({
        statBadge: `${t.titleLen} caracteres`,
        statDetail: `Ano ${t.movie.release_year || '?'} • Nota ${Number(t.movie.user_rating || 0).toFixed(3)}`,
      }),
      formatNextDistinct: (t) => `2º: ${t.movie.title} (${t.titleLen} car.)`,
    }));

    const byShortestTitle = [...withTitles].sort(
      (a, b) => a.titleLen - b.titleLen || Number(b.movie.user_rating || 0) - Number(a.movie.user_rating || 0)
    );
    pushRec(buildRecordWithTies({
      id: 'shortest_title',
      rarity: 'rare',
      rarityLabel: '🔵 TÍTULO MINIMALISTA',
      icon: '🔤',
      title: 'Filme com Menor Nome',
      subtitle: 'Título mais curto e direto do acervo',
      sortedCandidates: byShortestTitle,
      getScore: (t) => t.titleLen,
      formatVariant: (t) => ({
        statBadge: `${t.titleLen} ${t.titleLen === 1 ? 'caractere' : 'caracteres'}`,
        statDetail: `Ano ${t.movie.release_year || '?'} • Nota ${Number(t.movie.user_rating || 0).toFixed(3)}`,
      }),
      formatNextDistinct: (t) => `2º: ${t.movie.title} (${t.titleLen} car.)`,
    }));
  }

  // 14. Maior Coprodução Internacional
  const byCountries = unique
    .filter((m) => Array.isArray(m.countries) && m.countries.length > 0)
    .sort((a, b) => b.countries.length - a.countries.length || Number(b.user_rating || 0) - Number(a.user_rating || 0));
  if (byCountries.length > 0) {
    pushRec(buildRecordWithTies({
      id: 'most_countries',
      rarity: 'epic',
      rarityLabel: '💜 ALIANÇA DIPLOMÁTICA',
      icon: '🌐',
      title: 'Maior Coprodução Mundial',
      subtitle: 'Mais bandeiras unidas na mesma produção',
      sortedCandidates: byCountries,
      getScore: (m) => m.countries.length,
      formatVariant: (m) => ({
        statBadge: `${m.countries.length} Países`,
        statDetail: m.countries.join(', '),
      }),
      formatNextDistinct: (m) => `2º: ${m.title} (${m.countries.length} países)`,
    }));
  }

  // 15 & 16. Divergências Críticas ("Contra o Sistema" vs "Escudo Anti-Hype")
  const withCriticAndUser = unique
    .map((m) => {
      const u = Number(m.user_rating);
      if (!u || u <= 0) return null;
      const criticScores = [];
      if (m.metacritic_score !== null && m.metacritic_score !== undefined && Number(m.metacritic_score) > 0) {
        criticScores.push(Number(m.metacritic_score));
      }
      if (
        m.rotten_tomatoes_score !== null &&
        m.rotten_tomatoes_score !== undefined &&
        String(m.rotten_tomatoes_score).trim() !== '' &&
        Number.isFinite(Number(m.rotten_tomatoes_score))
      ) {
        criticScores.push(Number(m.rotten_tomatoes_score));
      }
      if (criticScores.length === 0) return null;
      const criticAvg = criticScores.reduce((a, b) => a + b, 0) / criticScores.length;
      const user100 = u * 10;
      const diff = user100 - criticAvg;
      return { ...m, criticAvg, user100, diff };
    })
    .filter(Boolean);

  if (withCriticAndUser.length > 0) {
    const rebelSorted = [...withCriticAndUser].sort((a, b) => b.diff - a.diff);
    if (rebelSorted[0] && rebelSorted[0].diff > 0) {
      pushRec(buildRecordWithTies({
        id: 'rebel_love',
        rarity: 'legendary',
        rarityLabel: '🥇 CONTRA O SISTEMA',
        icon: '⚔️',
        title: 'Eu Amei, a Crítica Chorou!',
        subtitle: 'Maior vantagem da sua nota contra os críticos',
        sortedCandidates: rebelSorted,
        getScore: (m) => Math.round(m.diff * 100),
        formatVariant: (m) => ({
          statBadge: `+${m.diff.toFixed(1)} pts acima`,
          statDetail: `Você: ${Number(m.user_rating).toFixed(3)} (${m.user100.toFixed(0)}) vs Crítica: ${m.criticAvg.toFixed(0)}/100`,
        }),
        formatNextDistinct: (m) => `2º: ${m.title} (+${m.diff.toFixed(1)} pts)`,
      }));
    }

    const shieldSorted = [...withCriticAndUser].sort((a, b) => a.diff - b.diff);
    if (shieldSorted[0] && shieldSorted[0].diff < 0) {
      pushRec(buildRecordWithTies({
        id: 'hype_shield',
        rarity: 'epic',
        rarityLabel: '💜 ESCUDO ANTI-HYPE',
        icon: '🛡️',
        title: 'Imune ao Hype da Crítica',
        subtitle: 'A crítica aplaudiu de pé, mas você foi rigoroso',
        sortedCandidates: shieldSorted,
        getScore: (m) => Math.round(m.diff * 100),
        formatVariant: (m) => ({
          statBadge: `${m.diff.toFixed(1)} pts abaixo`,
          statDetail: `Crítica: ${m.criticAvg.toFixed(0)}/100 vs Você: ${Number(m.user_rating).toFixed(3)} (${m.user100.toFixed(0)})`,
        }),
        formatNextDistinct: (m) => `2º: ${m.title} (${m.diff.toFixed(1)} pts)`,
      }));
    }
  }

  return records;
}

/**
 * 3. Checkpoints de Save Game (#1, #25, #50, #100, #150... + Último + Primeiras Vezes)
 */
export function computeSaveCheckpoints(allMovies = [], mode = 'registration') {
  const unique = deduplicateMovies(allMovies);
  if (unique.length === 0) {
    return { slots: [], nextCheckpoint: null, specialFirsts: [], totalCount: 0 };
  }

  const ordered = [...unique].sort((a, b) => {
    if (mode === 'watched') {
      const yA = Number(a.year_seen) || 9999;
      const yB = Number(b.year_seen) || 9999;
      if (yA !== yB) return yA - yB;
      const mA = Number(a.month_seen) || 99;
      const mB = Number(b.month_seen) || 99;
      if (mA !== mB) return mA - mB;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    }
    // Default: Ordem Oficial de Cadastro no Sistema (id crescente / watched_at crescente)
    const idA = Number(a.id) || 0;
    const idB = Number(b.id) || 0;
    if (idA !== idB) return idA - idB;
    const tA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
    const tB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
    return tA - tB;
  });

  const N = ordered.length;
  const targetIndices = new Set([1]);
  if (N >= 25) targetIndices.add(25);
  for (let milestone = 50; milestone <= N; milestone += 50) {
    targetIndices.add(milestone);
  }
  if (N > 1) {
    targetIndices.add(N);
  }

  const sortedTargets = Array.from(targetIndices).sort((a, b) => a - b);

  const slots = sortedTargets.map((num) => {
    const movie = ordered[num - 1];
    const isFirst = num === 1;
    const isLast = num === N && N > 1;
    const isMajor50 = num % 50 === 0;

    let badgeLabel = `SAVE #${String(num).padStart(3, '0')}`;
    let slotTitle = `Marco de ${num} Filmes`;
    let accent = 'cyan';

    if (isFirst) {
      badgeLabel = '🚩 SAVE #001 • GÊNESIS';
      slotTitle = mode === 'registration' ? '1º Filme Cadastrado' : '1º Filme Assistido';
      accent = 'emerald';
    } else if (isLast && isMajor50) {
      badgeLabel = `⚡ SAVE #${num} • MARCO & ATUAL`;
      slotTitle = `Centésimo/Marco #${num} & Último!`;
      accent = 'amber';
    } else if (isLast) {
      badgeLabel = `⚡ SAVE #${String(num).padStart(3, '0')} • ÚLTIMO`;
      slotTitle = mode === 'registration' ? 'Último Filme Cadastrado' : 'Último Filme Assistido';
      accent = 'rose';
    } else if (num === 25) {
      badgeLabel = '🌱 SAVE #025 • TUTORIAL';
      slotTitle = '25º Filme da Jornada';
      accent = 'sky';
    } else if (num % 100 === 0) {
      badgeLabel = `👑 SAVE #${num} • CENTENÁRIO`;
      slotTitle = `Marco Lendário #${num}`;
      accent = 'amber';
    } else if (isMajor50) {
      badgeLabel = `💎 SAVE #${num} • CHECKPOINT`;
      slotTitle = `Marco Oficial #${num}`;
      accent = 'purple';
    }

    let formattedSavedDate = null;
    if (movie?.watched_at) {
      const d = new Date(movie.watched_at);
      if (!Number.isNaN(d.getTime())) {
        formattedSavedDate = d.toLocaleDateString('pt-BR');
      }
    }

    const seenLabel = movie?.year_seen
      ? movie.month_seen
        ? `${MONTH_NAMES[Number(movie.month_seen) - 1] || movie.month_seen}/${movie.year_seen}`
        : String(movie.year_seen)
      : 'Sem data';

    return {
      number: num,
      badgeLabel,
      slotTitle,
      accent,
      movie,
      formattedSavedDate,
      seenLabel,
      isFirst,
      isLast,
    };
  });

  const nextMultiple50 = Math.floor(N / 50) * 50 + 50;
  const prevMultiple50 = Math.floor(N / 50) * 50;
  const nextCheckpoint = {
    targetNumber: nextMultiple50,
    remaining: nextMultiple50 - N,
    progressPct: Math.min(100, Math.round(((N - prevMultiple50) / 50) * 100)),
  };

  // Primeiras Vezes Históricas
  const specialFirsts = [];
  const firstMasterpieceIdx = ordered.findIndex((m) => Number(m.user_rating) >= 9.5);
  if (firstMasterpieceIdx !== -1) {
    specialFirsts.push({
      id: 'first_masterpiece',
      icon: '🌟',
      label: '1ª Obra-Prima (Nota 9.5+)',
      slotNum: firstMasterpieceIdx + 1,
      movie: ordered[firstMasterpieceIdx],
      detail: `Nota ${Number(ordered[firstMasterpieceIdx].user_rating).toFixed(3)}`,
    });
  }

  const firstOscarIdx = ordered.findIndex((m) => Number(m.oscar_wins) >= 1);
  if (firstOscarIdx !== -1) {
    specialFirsts.push({
      id: 'first_oscar',
      icon: '🏆',
      label: '1º Vencedor de Oscar',
      slotNum: firstOscarIdx + 1,
      movie: ordered[firstOscarIdx],
      detail: `${ordered[firstOscarIdx].oscar_wins} estatueta(s)`,
    });
  }

  const firstWorldIdx = ordered.findIndex((m) => {
    const cs = (m.countries || []).map((c) => String(c).toLowerCase().trim());
    if (cs.length === 0) return false;
    return !cs.some((c) => c === 'estados unidos' || c === 'united states' || c === 'brasil' || c === 'brazil');
  });
  if (firstWorldIdx !== -1) {
    specialFirsts.push({
      id: 'first_world',
      icon: '🌍',
      label: '1º Fora do Eixo EUA/Brasil',
      slotNum: firstWorldIdx + 1,
      movie: ordered[firstWorldIdx],
      detail: (ordered[firstWorldIdx].countries || []).join(', '),
    });
  }

  const firstClassicIdx = ordered.findIndex(
    (m) => Number(m.release_year) > 1880 && Number(m.release_year) < 1990
  );
  if (firstClassicIdx !== -1) {
    specialFirsts.push({
      id: 'first_classic',
      icon: '📼',
      label: '1º Clássico Pré-1990',
      slotNum: firstClassicIdx + 1,
      movie: ordered[firstClassicIdx],
      detail: `Lançado em ${ordered[firstClassicIdx].release_year}`,
    });
  }

  return {
    slots,
    nextCheckpoint,
    specialFirsts,
    totalCount: N,
  };
}

/**
 * 4. Duelo Temporal: Ano que Mais Vi Filmes vs Ano com Mais Gravações/Lançamentos
 */
export function computeYearShowdown(filteredMovies = [], allMovies = []) {
  // A) Ano em que o usuário MAIS ASSISTIU filmes (sempre usa allMovies para comparar anos de consumo!)
  const watchedByYearMap = new Map();
  const monthYearPeakMap = new Map();

  (allMovies || []).forEach((m) => {
    if (!m.year_seen) return;
    const yr = String(m.year_seen);
    if (!watchedByYearMap.has(yr)) {
      watchedByYearMap.set(yr, { year: yr, count: 0, minutes: 0, ratingSum: 0, ratingCount: 0 });
    }
    const entry = watchedByYearMap.get(yr);
    entry.count += 1;
    entry.minutes += Number(m.runtime) || 0;
    if (Number(m.user_rating) > 0) {
      entry.ratingSum += Number(m.user_rating);
      entry.ratingCount += 1;
    }

    if (m.month_seen) {
      const mIdx = Number(m.month_seen);
      if (mIdx >= 1 && mIdx <= 12) {
        const key = `${yr}-${mIdx}`;
        monthYearPeakMap.set(key, {
          year: yr,
          month: mIdx,
          label: `${FULL_MONTH_NAMES[mIdx - 1]} de ${yr}`,
          count: (monthYearPeakMap.get(key)?.count || 0) + 1,
        });
      }
    }
  });

  const watchedYearsRanked = Array.from(watchedByYearMap.values())
    .map((e) => ({
      ...e,
      hours: Math.round(e.minutes / 60),
      avgRating: e.ratingCount > 0 ? (e.ratingSum / e.ratingCount).toFixed(3) : 'N/A',
      avgPerMonth: (e.count / 12).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count || b.minutes - a.minutes);

  const peakMonthsRanked = Array.from(monthYearPeakMap.values()).sort((a, b) => b.count - a.count);

  // B) Ano de LANÇAMENTO / GRAVAÇÃO com mais filmes no catálogo
  const uniqueFiltered = deduplicateMovies(filteredMovies);
  const releaseByYearMap = new Map();

  uniqueFiltered.forEach((m) => {
    const ry = Number(m.release_year);
    if (!ry || ry < 1880) return;
    if (!releaseByYearMap.has(ry)) {
      releaseByYearMap.set(ry, {
        year: ry,
        count: 0,
        minutes: 0,
        ratingSum: 0,
        ratingCount: 0,
        bestMovie: null,
      });
    }
    const entry = releaseByYearMap.get(ry);
    entry.count += 1;
    entry.minutes += Number(m.runtime) || 0;
    const r = Number(m.user_rating) || 0;
    if (r > 0) {
      entry.ratingSum += r;
      entry.ratingCount += 1;
    }
    if (!entry.bestMovie || r > (Number(entry.bestMovie.user_rating) || 0)) {
      entry.bestMovie = m;
    }
  });

  const releaseYearsRanked = Array.from(releaseByYearMap.values())
    .map((e) => ({
      ...e,
      hours: Math.round(e.minutes / 60),
      avgRating: e.ratingCount > 0 ? (e.ratingSum / e.ratingCount).toFixed(3) : 'N/A',
    }))
    .sort((a, b) => b.count - a.count || b.year - a.year);

  return {
    championWatchedYear: watchedYearsRanked[0] || null,
    watchedYearsRanked,
    peakMonthEver: peakMonthsRanked[0] || null,
    championReleaseYear: releaseYearsRanked[0] || null,
    releaseYearsRanked: releaseYearsRanked.slice(0, 10),
    totalDistinctReleaseYears: releaseByYearMap.size,
  };
}

export const CHARACTER_TIERS = [
  { grade: 1, min: 0, max: 149, label: '🌱 Grau 1 • Aprendiz Cinéfilo', nextLabel: '⚔️ Grau 2 • Aventureiro das Salas (1ª Classe)', nextMin: 150 },
  { grade: 2, min: 150, max: 249, label: '⚔️ Grau 2 • Aventureiro das Salas (1ª Classe)', nextLabel: '🛡️ Grau 3 • Veterano da Claquete (2ª Classe)', nextMin: 250 },
  { grade: 3, min: 250, max: 349, label: '🛡️ Grau 3 • Veterano da Claquete (2ª Classe)', nextLabel: '👑 Grau 4 • Transclasse Cinéfila (Lord das Telas)', nextMin: 350 },
  { grade: 4, min: 350, max: 429, label: '👑 Grau 4 • Transclasse Cinéfila (Lord das Telas)', nextLabel: '⚡ Grau 5 • 3ª Evolução (Arcebispo da Sétima Arte)', nextMin: 430 },
  { grade: 5, min: 430, max: 499, label: '⚡ Grau 5 • 3ª Evolução (Arcebispo da Sétima Arte)', nextLabel: '🌌 Grau 6 • 4ª Evolução (Hiperclasse Mítica)', nextMin: 500 },
  { grade: 6, min: 500, max: 559, label: '🌌 Grau 6 • 4ª Evolução (Hiperclasse Mítica)', nextLabel: '🌟 Grau 7 • Entidade Cósmica Suprema (Semideus do 4K)', nextMin: 560 },
  { grade: 7, min: 560, max: 594, label: '🌟 Grau 7 • Entidade Cósmica Suprema (Semideus do 4K)', nextLabel: 'Limite Supremo Conquistado!', nextMin: null },
];

export const ALL_CINEMA_CLASSES = [
  {
    id: 'andarilho_setima_arte',
    unlockPts: 0,
    className: 'Andarilho da Sétima Arte',
    classIcon: '🎒',
    titleFlavor: 'Explorador Híbrido de Sessões & Camaleão Cinéfilo',
    lore: 'Um aventureiro versátil que transita entre blockbusters barulhentos e jóias cult escondidas sem preconceito algum.',
    favoriteMovie: 'Cinema Paradiso (1988).',
    passiveSkill: 'Mente Aberta: Aprecia desde filmes B de monstros até dramas europeus intimistas.',
  },
  {
    id: 'barbaro_imax',
    unlockPts: 35,
    className: 'O Bárbaro do IMAX & Pipoca Doce',
    classIcon: '🍿',
    titleFlavor: 'Destruidor de Roteiros & Adorador de Robôs Gigantes',
    lore: 'Não quer saber de metáforas, cinema cult ou desenvolvimento de personagem. Ele entra na sala com o maior balde de pipoca disponível apenas para ver prédios desabando e robôs gigantes trocando socos.',
    favoriteMovie: 'Godzilla vs. Kong (2021) ou qualquer produção de Michael Bay com explosões práticas em tela cheia.',
    passiveSkill: 'Cegueira Roteirística (ignora completamente qualquer furo lógico na narrativa desde que o som surround faça a poltrona do cinema tremer).',
  },
  {
    id: 'sicario_telonas',
    unlockPts: 70,
    className: 'Sicário das Telonas',
    classIcon: '⚡',
    titleFlavor: 'Velocista dos Créditos & Maratona Contínua',
    lore: 'Ele é tão rápido que quando você começou a ler este texto ele já viu um filme, pulou a abertura e já foi pros pós-créditos! Sua vida é um speedrun ininterrupto de sessões.',
    favoriteMovie: 'Qualquer curta de animação ou John Wick sem respirar.',
    passiveSkill: 'Passo Sombrio: Consegue emendar 4 filmes em sequência num sábado chuvoso sem cansaço.',
  },
  {
    id: 'bardo_herbert_richers',
    unlockPts: 105,
    className: 'O Bardo de Herbert Richers (Menestrel da Dublagem Clássica)',
    classIcon: '🎙️',
    titleFlavor: 'Menestrel da Versão Brasileira & Nostalgia dos Anos 80/90',
    lore: 'Conhece o elenco de dubladores de cabeça e sente uma dor física profunda quando um clássico dos anos 80 ou 90 ganha redublagem moderna na TV.',
    favoriteMovie: 'Curtindo a Vida Adoidado (1986) (estritamente com a primeira dublagem clássica).',
    passiveSkill: 'Afinador de Cordas Vocais (identifica a voz de dubladores lendários na primeira sílaba e ignora qualquer dessincronia labial original).',
  },
  {
    id: 'corsario_sete_mares',
    unlockPts: 140,
    className: 'O Corsário dos Sete Mares',
    classIcon: '🏴‍☠️',
    titleFlavor: 'Navegador de Servidores Ocultos & Fontes Alternativas',
    lore: 'Navega por servidores ocultos, nuvens misteriosas e fontes alternativas sem pegar um único vírus no sistema.',
    favoriteMovie: 'Piratas do Caribe: A Maldição do Pérola Negra (2003) (ou qualquer arquivo de 800 MB rodando direto na nuvem).',
    passiveSkill: 'VPN Espiritual (imune a travamentos de buffer, legendas dessincronizadas e telas pretas na metade do clímax).',
  },
  {
    id: 'vampiro_madrugada',
    unlockPts: 180,
    className: 'O Vampiro da Madrugada (Guardião da Sessão Coruja)',
    classIcon: '🦇',
    titleFlavor: 'Soberano da Luz Azul & Madrugadas Silenciosas',
    lore: 'A tela da sua TV só ganha vida depois que todo mundo em casa já foi dormir. Sua luz natural é o brilho escuro do painel da televisão enquanto o relógio passa das duas da manhã.',
    favoriteMovie: 'Taxi Driver (1976) ou Drive (2011).',
    passiveSkill: 'Visão Noturna (não sente cansaço visual no escuro total e ganha bônus de foco se o filme terminar exatamente quando o sol começar a nascer).',
  },
  {
    id: 'carnical_grindhouse',
    unlockPts: 220,
    className: 'O Carniçal do Grindhouse (Necromante do Gore)',
    classIcon: '🩸',
    titleFlavor: 'Necromante do Gore & Práticas de Borracha',
    lore: 'Se não voarem pelo menos cinquenta litros de sangue falso de xarope de milho nos primeiros vinte minutos de projeção, ele considera a obra um drama familiar.',
    favoriteMovie: 'Uma Noite Alucinante 2 (Evil Dead II, 1987) ou O ABC da Morte (2013).',
    passiveSkill: 'Estômago de Titânio (consegue jantar uma pizza inteira enquanto assiste a cenas viscerais com mutilação prática de borracha).',
  },
  {
    id: 'cacador_trufas',
    unlockPts: 260,
    className: 'Caçador de Trufas & Obras Obscuras',
    classIcon: '🍄',
    titleFlavor: 'Farejador de VHS Perdidos & Filmes Raros',
    lore: 'Ele sabe onde encontrar os filmes mais underground e desconhecidos do planeta nas profundezas da internet, mas não dá a mínima garantia de qualidade a ninguém!',
    favoriteMovie: 'Jogos Mortais (2004) ou um trash romeno obscuro de 1982.',
    passiveSkill: 'Faro Subterrâneo: +50% de tolerância a filmes com menos de 100 avaliações no mundo.',
  },
  {
    id: 'cartografo_195_reinos',
    unlockPts: 300,
    className: 'O Cartógrafo dos 195 Reinos',
    classIcon: '🧭',
    titleFlavor: 'Geopolítico dos Dramas Islandeses & Fronteiras Raras',
    lore: 'Para ele, cinema em língua inglesa é café com leite. Ele só fica satisfeito quando encontra um drama existencial islandês de duas horas e meia onde dois pescadores encaram o gelo em silêncio.',
    favoriteMovie: 'Coração de Pedra (2016) (ou qualquer produção obscura do Leste Europeu com coprodução de 4 países).',
    passiveSkill: 'Bússola Geopolítica (aponta a capital de qualquer país raro no mapa-múndi instantaneamente sem precisar consultar o Google).',
  },
  {
    id: 'sacerdote_cinefilo',
    unlockPts: 330,
    className: 'O Sacerdote Cinéfilo',
    classIcon: '✝️',
    titleFlavor: 'Exorcista de Demônios nas Telas em 4K',
    lore: 'Ele exorciza demônios direto na tela da TV junto com o padre. Já decorou todas as rezas em latim dos créditos iniciais e não teme assombração nem de madrugada com a luz apagada!',
    favoriteMovie: 'O Exorcista (1973) e um terço benzido com água benta.',
    passiveSkill: 'Água Benta Crítica: Imune a sustos baratos e jumpscares previsíveis.',
  },
  {
    id: 'monge_tres_casas',
    unlockPts: 360,
    className: 'O Monge das Três Casas Decimais',
    classIcon: '⚖️',
    titleFlavor: 'Balança Micrométrica & Inimigo da Nota Redonda',
    lore: 'Acha um absurdo notas inteiras ou meias estrelas. O verdadeiro sentido da sua vida cinéfila é deliberar calmamente se um longa merece um 8.742 ou um 8.745 no banco de dados.',
    favoriteMovie: '2001: Uma Odisseia no Espaço (1968) (rigorosamente avaliado com um 9.948 porque a perfeição absoluta de 10.000 não existe).',
    passiveSkill: 'Balança Micrométrica (imune a notas infladas da imprensa; detecta a menor inconsistência de montagem e desconta 0.015 pontos na hora).',
  },
  {
    id: 'cavaleiro_laser_azul',
    unlockPts: 400,
    className: 'O Cavaleiro do Laser Azul (Guardião da Mídia Física)',
    classIcon: '💿',
    titleFlavor: 'Guardião do Acrílico Sagrado & Pureza do Dolby Atmos',
    lore: 'Trata estojos de acrílico, encartes com luva e edições especiais como se fossem relíquias sagradas de museu. Para ele, compressão de bitrate de streaming é um crime inafiançável.',
    favoriteMovie: 'Mad Max: Estrada da Fúria (2015) (rodando direto no leitor de Blu-ray com áudio Dolby Atmos no talo).',
    passiveSkill: 'Armadura Anti-Risco (detecta artefatos visuais de compressão a 5 metros de distância e ganha bônus de foco ao manusear discos sem encostar nos dados).',
  },
  {
    id: 'algoz_tomatometro',
    unlockPts: 440,
    className: 'Algoz do Tomatômetro',
    classIcon: '🎯',
    titleFlavor: 'Julgamento Implacável do Selo Podre',
    lore: 'Possui uma precisão visual e crítica fora do comum. Se o microfone do boom aparecer por 1 frame no canto superior da tela, a nota da obra despenca sem dó!',
    favoriteMovie: 'Pulp Fiction (1994) e uma caneta bic vermelha de crítico.',
    passiveSkill: 'Golpe Crítico: Avaliações com exatidão milimétrica e tolerância zero a clichês de roteiro.',
  },
  {
    id: 'gladiador_ps5',
    unlockPts: 480,
    className: 'Gladiador Platinador de Ferro',
    classIcon: '🛡️',
    titleFlavor: 'Colecionador de Notificações & Carrasco de Platina',
    lore: 'Não assiste filmes apenas por lazer: assiste pelo som sagrado do troféu pipocando no canto da tela! Se faltar 1 filme para fechar a Trilogia ou a Categoria, ele não dorme.',
    favoriteMovie: 'Qualquer filme que conceda troféu Mítico ou Ouro no catálogo.',
    passiveSkill: 'Bexiga de Aço: Suporta maratonas de 4 horas sem pausar para ir ao banheiro.',
  },
  {
    id: 'arquimago_tempo',
    unlockPts: 520,
    className: 'Arquimago da Máquina do Tempo',
    classIcon: '🧙‍♂️',
    titleFlavor: 'Manipulador do Continuum Espaço-Temporal',
    lore: 'Capaz de transitar de 1920 até os lançamentos de 2027 como se pegasse o metrô. Já viu clássicos mudos soviéticos e discute direção de arte clássica com a calma de um sábio ancião!',
    favoriteMovie: 'De Volta Para o Futuro (1985) ou Metrópolis (1927).',
    passiveSkill: 'Teleporte Cronológico: +50% de sabedoria ao encarar filmes gravados antes da invenção da cor.',
  },
  {
    id: 'paladino_oscar',
    unlockPts: 560,
    className: 'Paladino do Santo Oscar',
    classIcon: '👑',
    titleFlavor: 'Guardião Implacável das Obras-Primas Intocáveis',
    lore: 'Ele só aperta o play se a fita vier abençoada por estatuetas douradas da Academia e nota pessoal 9.5+. Se o filme não for considerado arte suprema pela humanidade, ele nem clica!',
    favoriteMovie: 'O Poderoso Chefão (1972) com moldura dourada e água benta.',
    passiveSkill: 'Aura da Academia: +40% de pompa e solenidade em discussões cult de bar.',
  },
];

export function determineCharacterClass(attributes = [], totalStats = 0, _movies = []) {
  // Graus de Evolução (Tiers)
  const currentTier =
    CHARACTER_TIERS.find((t) => totalStats >= t.min && totalStats <= t.max) ||
    CHARACTER_TIERS[CHARACTER_TIERS.length - 1];

  // Avaliação do Desbloqueio Linear das Classes por Pontos Totais
  const evaluatedClasses = ALL_CINEMA_CLASSES.map((cls, idx) => {
    const isUnlocked = totalStats >= cls.unlockPts;
    const ptsRemaining = Math.max(0, cls.unlockPts - totalStats);
    return {
      ...cls,
      orderIndex: idx + 1,
      isUnlocked,
      ptsRemaining,
    };
  });

  const unlockedList = evaluatedClasses.filter((c) => c.isUnlocked);
  const highestUnlockedClass = unlockedList[unlockedList.length - 1] || evaluatedClasses[0];
  const nextClassToUnlock = evaluatedClasses.find((c) => !c.isUnlocked) || null;

  return {
    ...highestUnlockedClass,
    tierLabel: currentTier.label,
    tierGrade: currentTier.grade,
    nextTierName: currentTier.nextLabel,
    ptsToNextTier: currentTier.nextMin ? Math.max(0, currentTier.nextMin - totalStats) : 0,
    currentTierMin: currentTier.min,
    currentTierMax: currentTier.nextMin || currentTier.max,
    allClasses: evaluatedClasses,
    unlockedClassesCount: unlockedList.length,
    totalClassesCount: evaluatedClasses.length,
    nextClassToUnlock,
    totalStats,
    maxPossibleStats: 594, // 6 atributos x 99
    statsProgressPct: Math.min(100, Math.round((totalStats / 594) * 100)),
  };
}

/**
 * 5. Ficha RPG de 6 Atributos, Facções de Áudio, Maestria de Troféus e Guildas com Nota Média
 */
export function computeRpgAndGuilds(filteredMovies = [], allMovies = [], xpStatusProp = null, trophiesList = []) {
  const activeXp = xpStatusProp || calculateClientXpStatus(allMovies, trophiesList.length > 0 ? trophiesList : null);

  const uniqueAll = deduplicateMovies(allMovies);
  const uniqueFiltered = deduplicateMovies(filteredMovies);

  // Cálculos globais de horas / oscars / obras-primas
  let totalMinutes = 0;
  let epicRuntimeCount = 0;
  let _pre2000Count = 0;
  let oscarWinsTotal = 0;
  let oscarNomsTotal = 0;
  let moviesWithOscarWin = 0;
  let masterpiecesCount = 0;
  let ratedMoviesCount = 0;
  let ratingSum = 0;

  uniqueFiltered.forEach((m) => {
    const rt = Number(m.runtime) || 0;
    totalMinutes += rt;
    if (rt >= 140) epicRuntimeCount++;
    if (Number(m.release_year) > 0 && Number(m.release_year) < 2000) _pre2000Count++;

    const ow = Number(m.oscar_wins) || 0;
    const on = Number(m.oscar_nominations) || 0;
    oscarWinsTotal += ow;
    oscarNomsTotal += on;
    if (ow > 0) moviesWithOscarWin++;

    const ur = Number(m.user_rating) || 0;
    if (ur > 0) {
      ratedMoviesCount++;
      ratingSum += ur;
      if (ur >= 9.0) masterpiecesCount++;
    }
  });

  // 6 Atributos RPG (0 a 99) baseados na campanha completa com as novas regras
  let agiSum = 0;
  let epic120 = 0;
  let epic140 = 0;
  let epic170 = 0;

  let intHistoricalSum = 0;
  let pre2000EraCount = 0;
  let pre1980EraCount = 0;
  let pre1950EraCount = 0;

  let foreignCount = 0;
  let extremeRatingsCount = 0;
  let oscarWinsTotalAll = 0;
  let oscarNomsTotalAll = 0;

  uniqueAll.forEach((m) => {
    const rt = Number(m.runtime) || 0;
    if (rt > 170) {
      agiSum += 1.0;
      epic170++;
    } else if (rt > 140) {
      agiSum += 0.4;
      epic140++;
    } else if (rt > 120) {
      agiSum += 0.2;
      epic120++;
    }

    const ry = Number(m.release_year) || 0;
    if (ry > 0) {
      if (ry < 1950) {
        intHistoricalSum += 0.7;
        pre1950EraCount++;
      } else if (ry < 1980) {
        intHistoricalSum += 0.5;
        pre1980EraCount++;
      } else if (ry < 2000) {
        intHistoricalSum += 0.3;
        pre2000EraCount++;
      }
    }

    const cList = (m.countries || []).map((c) => String(c).toLowerCase().trim());
    const isForeign = cList.some((c) => c && !c.includes('brasil') && !c.includes('estados unidos'));
    if (isForeign) foreignCount++;

    const ur = Number(m.user_rating) || 0;
    if (ur >= 9.5 || (ur > 0 && ur <= 4.0)) {
      extremeRatingsCount++;
    }

    oscarWinsTotalAll += Number(m.oscar_wins) || 0;
    oscarNomsTotalAll += Number(m.oscar_nominations) || 0;
  });

  const tmConquered = activeXp?.sources?.timeMachine?.totalConqueredYears || 0;
  const countriesConquered = activeXp?.sources?.countries?.totalConqueredCount || 0;

  // VIT (Caça-Troféus PS5): SÓ ao desbloquear troféu (Bronze 0.2, Prata 0.4, Épico 0.6, Ouro 0.8, Mítico 1.0, Platina 3.0)
  let vitSum = 0;
  let unlockedTrophiesCount = 0;
  if (trophiesList && trophiesList.length > 0) {
    trophiesList.forEach((t) => {
      const isUnlocked = Boolean(t.is_unlocked || t.unlocked);
      if (isUnlocked) {
        unlockedTrophiesCount++;
        const tier = String(t.tier || '').toLowerCase();
        if (tier === 'platinum') vitSum += 3.0;
        else if (tier === 'mythic') vitSum += 1.0;
        else if (tier === 'gold') vitSum += 0.8;
        else if (tier === 'epic') vitSum += 0.6;
        else if (tier === 'silver') vitSum += 0.4;
        else vitSum += 0.2;
      }
    });
  } else if (activeXp?.sources?.trophies?.byTier) {
    const bt = activeXp.sources.trophies.byTier;
    vitSum += (bt.bronze?.count || 0) * 0.2;
    vitSum += (bt.silver?.count || 0) * 0.4;
    vitSum += (bt.epic?.count || 0) * 0.6;
    vitSum += (bt.gold?.count || 0) * 0.8;
    vitSum += (bt.mythic?.count || 0) * 1.0;
    vitSum += (bt.platinum?.count || 0) * 3.0;
    unlockedTrophiesCount = activeXp.sources.trophies.totalUnlocked || 0;
  } else if (activeXp?.sources?.trophies?.unlockedIds) {
    const ids = activeXp.sources.trophies.unlockedIds;
    Object.values(ids).forEach((t) => {
      unlockedTrophiesCount++;
      const tier = String(t.tier || '').toLowerCase();
      if (tier === 'platinum') vitSum += 3.0;
      else if (tier === 'mythic') vitSum += 1.0;
      else if (tier === 'gold') vitSum += 0.8;
      else if (tier === 'epic') vitSum += 0.6;
      else if (tier === 'silver') vitSum += 0.4;
      else vitSum += 0.2;
    });
  } else {
    unlockedTrophiesCount = activeXp?.sources?.trophies?.totalUnlocked || 0;
    vitSum = unlockedTrophiesCount * 0.4;
  }

  // 1. Vigor de Tela (AGI): >120m (0.2) + >140m (0.4) + >170m (1.0)
  const vigorScore = Math.min(99, Math.round(agiSum));

  // 2. Sabedoria Temporal (INT): Anos Máquina do Tempo (0.8 cada) + clássicos pré-2000 (0.3), pré-1980 (0.5), pré-1950 (0.7)
  const wisdomScore = Math.min(99, Math.round(tmConquered * 0.8 + intHistoricalSum));

  // 3. Diplomacia Global (DES): 1.0 por nação ONU expandida + 0.2 por filme fora do eixo EUA/Brasil
  const exploreScore = Math.min(99, Math.round(countriesConquered * 1.0 + foreignCount * 0.2));

  // 4. Olhar Clínico (SOR): 0.2 por obra catalogada + 0.8 por nota extrema (>=9.5 ou <=4.0)
  const precisionScore = Math.min(99, Math.round(uniqueAll.length * 0.2 + extremeRatingsCount * 0.8));

  // 5. Caça-Troféus PS5 (VIT): 0.2 bronze, 0.4 prata, 0.6 épico, 0.8 ouro, 1.0 mítico, 3.0 platina
  const trophyScore = Math.min(99, Math.round(vitSum));

  // 6. Prestígio Áureo (FOR): 0.4 por Oscar vencido + 0.2 por indicação (sem critério de nota)
  const prestigeScore = Math.min(99, Math.round(oscarWinsTotalAll * 0.4 + oscarNomsTotalAll * 0.2));

  // 6 Atributos na ordem solicitada inspirada em RPG clássico (AGI, INT, DES, SOR, VIT, FOR)
  const rpgAttributes = [
    {
      key: 'AGI',
      subject: 'Agilidade (AGI)',
      label: 'Vigor de Tela (Agilidade)',
      shortName: 'Agilidade',
      icon: '⚡',
      score: vigorScore,
      barColor: 'from-amber-400 to-yellow-300',
      ...getRankGrade(vigorScore),
      desc: `${epic170} gigantes (>170m) • ${epic140} épicos (>140m) • ${epic120} longos (>120m)`,
      formulaSummary: '>120m: +0.2 | >140m: +0.4 | >170m: +1.0',
    },
    {
      key: 'INT',
      subject: 'Inteligência (INT)',
      label: 'Sabedoria Temporal (Inteligência)',
      shortName: 'Inteligência',
      icon: '🧠',
      score: wisdomScore,
      barColor: 'from-cyan-400 to-blue-400',
      ...getRankGrade(wisdomScore),
      desc: `${tmConquered} anos Máquina do Tempo • ${pre2000EraCount + pre1980EraCount + pre1950EraCount} clássicos históricos`,
      formulaSummary: 'Ano Inédito: +0.8 | Pré-2000: +0.3 | Pré-1980: +0.5 | Pré-1950: +0.7',
    },
    {
      key: 'DES',
      subject: 'Destreza (DES)',
      label: 'Diplomacia Global (Destreza)',
      shortName: 'Destreza',
      icon: '🌍',
      score: exploreScore,
      barColor: 'from-emerald-400 to-teal-300',
      ...getRankGrade(exploreScore),
      desc: `${countriesConquered}/195 nações ONU • ${foreignCount} fora EUA/Brasil`,
      formulaSummary: 'Fora do Eixo EUA/Brasil: +0.2 | Nova Nação ONU Desafio 195: +1.0',
    },
    {
      key: 'SOR',
      subject: 'Sorte (SOR)',
      label: 'Olhar Clínico (Sorte)',
      shortName: 'Sorte',
      icon: '🎯',
      score: precisionScore,
      barColor: 'from-rose-400 to-pink-400',
      ...getRankGrade(precisionScore),
      desc: `${uniqueAll.length} obras catalogadas • ${extremeRatingsCount} notas extremas`,
      formulaSummary: 'Obra Catalogada: +0.2 | Nota Extrema (≥9.5 ou ≤4.0): +0.8',
    },
    {
      key: 'VIT',
      subject: 'Vitalidade (VIT)',
      label: 'Caça-Troféus PS5 (Vitalidade)',
      shortName: 'Vitalidade',
      icon: '🛡️',
      score: trophyScore,
      barColor: 'from-purple-400 to-violet-300',
      ...getRankGrade(trophyScore),
      desc: `${unlockedTrophiesCount} troféus conquistados (${vitSum.toFixed(1)} pts)`,
      formulaSummary: 'Bronze: +0.2 | Prata: +0.4 | Épico: +0.6 | Ouro: +0.8 | Mítico: +1.0 | Platina: +3.0',
    },
    {
      key: 'FOR',
      subject: 'Força (FOR)',
      label: 'Prestígio Áureo (Força)',
      shortName: 'Força',
      icon: '👑',
      score: prestigeScore,
      barColor: 'from-yellow-400 to-amber-300',
      ...getRankGrade(prestigeScore),
      desc: `${oscarWinsTotalAll} Oscars ganhos • ${oscarNomsTotalAll} indicações`,
      formulaSummary: 'Indicação ao Oscar: +0.2 | Vitória no Oscar: +0.4 (Sem critério de nota)',
    },
  ];

  const totalStatPoints = vigorScore + wisdomScore + exploreScore + precisionScore + trophyScore + prestigeScore;
  const characterClass = determineCharacterClass(rpgAttributes, totalStatPoints, uniqueAll);

  // Facções de Áudio (Dublado, Legendado, Legendado YouTube, Original & Outros)
  const audioMap = {
    Dublado: { count: 0, ratingSum: 0, ratingCount: 0 },
    Legendado: { count: 0, ratingSum: 0, ratingCount: 0 },
    YoutubeSub: { count: 0, ratingSum: 0, ratingCount: 0 },
    Original: { count: 0, ratingSum: 0, ratingCount: 0 },
    Outros: { count: 0, ratingSum: 0, ratingCount: 0 },
  };

  // Guildas com Contagem + Soma de Notas
  const addGuildStat = (map, rawName, rating) => {
    if (!rawName || !String(rawName).trim()) return;
    const name = String(rawName).trim();
    if (!map.has(name)) {
      map.set(name, { name, count: 0, ratingSum: 0, ratingCount: 0 });
    }
    const g = map.get(name);
    g.count += 1;
    if (rating > 0) {
      g.ratingSum += rating;
      g.ratingCount += 1;
    }
  };

  const directorsMap = new Map();
  const writersMap = new Map();
  const studiosMap = new Map();
  const distributorsMap = new Map();
  const tagsMap = new Map();
  const genresMap = new Map();
  const platformsMap = new Map();

  uniqueFiltered.forEach((m) => {
    const r = Number(m.user_rating) || 0;

    // Áudio
    const aud = String(m.audio_type || '').toLowerCase().trim();
    const bucket = aud.includes('dubl')
      ? 'Dublado'
      : aud.includes('youtube')
      ? 'YoutubeSub'
      : aud.includes('legend')
      ? 'Legendado'
      : aud.includes('original')
      ? 'Original'
      : 'Outros';
    audioMap[bucket].count += 1;
    if (r > 0) {
      audioMap[bucket].ratingSum += r;
      audioMap[bucket].ratingCount += 1;
    }

    // Diretores
    const dirs = Array.isArray(m.directors) && m.directors.length > 0 ? m.directors : m.director ? [m.director] : [];
    dirs.forEach((d) => addGuildStat(directorsMap, d, r));

    // Roteiristas
    (m.writers || []).forEach((w) => addGuildStat(writersMap, w, r));

    // Estúdios
    (m.studios || []).forEach((s) => addGuildStat(studiosMap, normalizeStudioOrDist(s), r));

    // Distribuidoras
    if (m.distributor) {
      splitDistributors(m.distributor).forEach((d) => addGuildStat(distributorsMap, d, r));
    }

    // Tags, Gêneros, Plataformas
    (m.tags || []).forEach((t) => addGuildStat(tagsMap, t, r));
    (m.genres || []).forEach((g) => addGuildStat(genresMap, g, r));
    if (m.platform) addGuildStat(platformsMap, m.platform, r);
  });

  const toTopList = (map, limit = 10) =>
    Array.from(map.values())
      .map((item) => ({
        ...item,
        avgRating: item.ratingCount > 0 ? item.ratingSum / item.ratingCount : 0,
        avgFormatted: item.ratingCount > 0 ? (item.ratingSum / item.ratingCount).toFixed(2) : '—',
      }))
      .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
      .slice(0, limit);

  const topGenres = toTopList(genresMap, 10);
  const dominantGenre1 = topGenres[0]?.name || 'Cinema';
  const dominantGenre2 = topGenres[1]?.name || 'Exploração';
  const factionLeaders = [
    { label: 'Facção Dublado 🎙️', count: audioMap.Dublado.count },
    { label: 'Facção Legendado 💬', count: audioMap.Legendado.count },
    { label: 'Facção Legenda YouTube 📺', count: audioMap.YoutubeSub.count },
    { label: 'Facção Áudio Original 🎞️', count: audioMap.Original.count },
  ].sort((a, b) => b.count - a.count);
  const dominantAudio = factionLeaders[0]?.label || 'Facção Dublado 🎙️';

  const characterSubclass = `Mestre em ${dominantGenre1} & ${dominantGenre2} • ${dominantAudio}`;

  // Maestria por Categoria de Troféus + Quests Quase em 100% + Troféus Raros Desbloqueados
  const categoryMastery = [];
  const almostThereQuests = [];
  const rarestUnlockedTrophies = [];

  if (Array.isArray(trophiesList) && trophiesList.length > 0) {
    const catMap = new Map();
    Object.keys(CATEGORY_BADGE_CONFIG).forEach((k) => {
      if (k !== 'multi') {
        catMap.set(k, { key: k, ...CATEGORY_BADGE_CONFIG[k], unlocked: 0, total: 0 });
      }
    });

    const tierWeight = { platinum: 6, mythic: 5, gold: 4, epic: 3, silver: 2, bronze: 1 };

    trophiesList.forEach((t) => {
      const cats = Array.isArray(t.categories) && t.categories.length > 0
        ? t.categories
        : t.category
        ? [t.category]
        : [];
      cats.forEach((ck) => {
        if (catMap.has(ck)) {
          const c = catMap.get(ck);
          c.total += 1;
          if (t.is_unlocked) c.unlocked += 1;
        }
      });

      if (t.is_unlocked) {
        rarestUnlockedTrophies.push({
          ...t,
          cleanTitle: getCleanTrophyTitle(t.title),
          weight: tierWeight[String(t.tier || 'bronze').toLowerCase()] || 1,
        });
      } else {
        const pct = Number(
          t.progress_percentage ?? t.progress?.percentage ?? t.progress_percent ?? 0
        );
        if (pct >= 50 && pct < 100) {
          almostThereQuests.push({
            ...t,
            cleanTitle: getCleanTrophyTitle(t.title),
            pct: Math.round(pct),
            currentVal: t.progress_current ?? t.progress?.current ?? t.current_progress ?? 0,
            targetVal: t.progress_target ?? t.progress?.target ?? t.target_value ?? 1,
          });
        }
      }
    });

    catMap.forEach((val) => {
      if (val.total > 0) {
        categoryMastery.push({
          ...val,
          pct: Math.round((val.unlocked / val.total) * 100),
        });
      }
    });
    categoryMastery.sort((a, b) => b.pct - a.pct || b.unlocked - a.unlocked);
    almostThereQuests.sort((a, b) => b.pct - a.pct);
    rarestUnlockedTrophies.sort((a, b) => b.weight - a.weight);
  }

  const totalAudioCount = Math.max(
    1,
    audioMap.Dublado.count +
      audioMap.Legendado.count +
      audioMap.YoutubeSub.count +
      audioMap.Original.count +
      audioMap.Outros.count
  );
  const formatAudioFaction = (entry) => ({
    ...entry,
    pct: Number(((entry.count / totalAudioCount) * 100).toFixed(1)),
    avg: entry.ratingCount > 0 ? (entry.ratingSum / entry.ratingCount).toFixed(2) : '—',
  });

  return {
    activeXp,
    characterClass,
    totalStatPoints,
    characterSubclass,
    campaignKpis: {
      totalMovies: uniqueFiltered.length,
      totalMinutes,
      hours: Math.round(totalMinutes / 60),
      days: (totalMinutes / 1440).toFixed(1),
      avgRuntime: uniqueFiltered.length > 0 ? Math.round(totalMinutes / uniqueFiltered.length) : 0,
      epicRuntimeCount,
      avgUserRating: ratedMoviesCount > 0 ? (ratingSum / ratedMoviesCount).toFixed(3) : 'N/A',
      masterpiecesCount,
      oscarWinsTotal,
      oscarNomsTotal,
      moviesWithOscarWin,
    },
    rpgAttributes,
    audioFactions: {
      dublado: formatAudioFaction(audioMap.Dublado),
      legendado: formatAudioFaction(audioMap.Legendado),
      youtubeSub: formatAudioFaction(audioMap.YoutubeSub),
      original: formatAudioFaction(audioMap.Original),
      outros: formatAudioFaction(audioMap.Outros),
    },
    guilds: {
      directors: toTopList(directorsMap, 10),
      writers: toTopList(writersMap, 10),
      studios: toTopList(studiosMap, 10),
      distributors: toTopList(distributorsMap, 10),
      tags: toTopList(tagsMap, 10),
      genres: topGenres,
      platforms: toTopList(platformsMap, 10),
    },
    trophyInsights: {
      categoryMastery,
      almostThereQuests: almostThereQuests.slice(0, 5),
      rarestUnlocked: rarestUnlockedTrophies.slice(0, 6),
    },
    levelRoadmap: LEVEL_TITLE_RANGES,
    metaDictionaries: {
      TROPHY_TIER_META,
      COUNTRY_RARITY_META,
      TIME_MACHINE_RARITY_META,
    },
  };
}

function splitCommaOrArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
  return [];
}

function normalizeMovieForRpg(movie) {
  if (!movie) return {};
  return {
    ...movie,
    runtime: Number(movie.runtime) || 0,
    release_year: Number(movie.release_year) || 0,
    user_rating: Number(movie.user_rating) || 0,
    oscar_wins: Number(movie.oscar_wins) || 0,
    oscar_nominations: Number(movie.oscar_nominations) || 0,
    countries: splitCommaOrArray(movie.countries),
    genres: splitCommaOrArray(movie.genres),
  };
}

function computeSingleMovieRpgContrib(movie) {
  const m = normalizeMovieForRpg(movie);
  let agi = 0;
  if (m.runtime > 170) agi = 1.0;
  else if (m.runtime > 140) agi = 0.4;
  else if (m.runtime > 120) agi = 0.2;

  let intHist = 0;
  if (m.release_year > 0) {
    if (m.release_year < 1950) intHist = 0.7;
    else if (m.release_year < 1980) intHist = 0.5;
    else if (m.release_year < 2000) intHist = 0.3;
  }

  const isForeign = m.countries.some(
    (c) => c && !c.toLowerCase().includes('brasil') && !c.toLowerCase().includes('estados unidos')
  );
  const desForeign = isForeign ? 0.2 : 0;

  let sor = 0.2;
  if (m.user_rating >= 9.5 || (m.user_rating > 0 && m.user_rating <= 4.0)) {
    sor += 0.8;
  }

  const forPts = m.oscar_wins * 0.4 + m.oscar_nominations * 0.2;
  return { agi, intHist, desForeign, sor, forPts };
}

function matchesMovieIdentity(existing, target) {
  if (!existing || !target) return false;
  if (target.movie_id != null && existing.movie_id != null) {
    return String(existing.movie_id) === String(target.movie_id);
  }
  if (target.id != null && existing.id != null) {
    return String(existing.id) === String(target.id);
  }
  return false;
}

function buildEffectivePrevXpStatus(prevXpStatus, nextXpStatus, newlyUnlocked, timeMachineUnlocks) {
  if (prevXpStatus) return prevXpStatus;
  if (!nextXpStatus) return null;

  const tmYearsDelta = Array.isArray(timeMachineUnlocks)
    ? timeMachineUnlocks.filter((u) => u && u.kind === 'year').length
    : 0;
  const prevTmYears = Math.max(0, (nextXpStatus?.sources?.timeMachine?.totalConqueredYears || 0) - tmYearsDelta);

  const nextUnlockedIds = { ...(nextXpStatus?.sources?.trophies?.unlockedIds || {}) };
  if (Array.isArray(newlyUnlocked)) {
    newlyUnlocked.forEach((t) => {
      if (t?.id != null) delete nextUnlockedIds[String(t.id)];
    });
  }

  const tierDelta = { bronze: 0, silver: 0, epic: 0, gold: 0, mythic: 0, platinum: 0 };
  if (Array.isArray(newlyUnlocked)) {
    newlyUnlocked.forEach((t) => {
      const k = String(t?.tier || 'bronze').toLowerCase();
      if (k in tierDelta) tierDelta[k] += 1;
      else tierDelta.bronze += 1;
    });
  }

  const nextByTier = nextXpStatus?.sources?.trophies?.byTier;
  const prevByTier = nextByTier
    ? Object.fromEntries(
        Object.entries(nextByTier).map(([tier, info]) => [
          tier,
          { ...info, count: Math.max(0, (info?.count || 0) - (tierDelta[tier] || 0)) },
        ])
      )
    : undefined;

  return {
    ...nextXpStatus,
    sources: {
      ...nextXpStatus.sources,
      timeMachine: {
        ...nextXpStatus.sources?.timeMachine,
        totalConqueredYears: prevTmYears,
      },
      trophies: {
        ...nextXpStatus.sources?.trophies,
        totalUnlocked: Math.max(
          0,
          (nextXpStatus.sources?.trophies?.totalUnlocked || 0) - (newlyUnlocked?.length || 0)
        ),
        unlockedIds: nextUnlockedIds,
        ...(prevByTier ? { byTier: prevByTier } : {}),
      },
    },
  };
}

/**
 * 6. Calcula os ganhos de atributos RPG e desbloqueio de classe ao cadastrar ou editar um filme
 */
export function computeMovieStatGains({
  movieData,
  newlyUnlocked = [],
  _progressedTrophies = [],
  timeMachineUnlocks = [],
  existingMovies = [],
  prevXpStatus = null,
  nextXpStatus = null,
  isEditMode = false,
}) {
  const statGains = [];
  const normalizedMovie = normalizeMovieForRpg(movieData);
  const effectivePrevXp = buildEffectivePrevXpStatus(
    prevXpStatus,
    nextXpStatus,
    newlyUnlocked,
    timeMachineUnlocks
  );

  const prevMovie = isEditMode
    ? (existingMovies || []).find((m) => matchesMovieIdentity(m, normalizedMovie))
    : null;

  const nextContrib = computeSingleMovieRpgContrib(normalizedMovie);
  const prevContrib = prevMovie
    ? computeSingleMovieRpgContrib(prevMovie)
    : isEditMode
    ? { ...nextContrib }
    : { agi: 0, intHist: 0, desForeign: 0, sor: 0, forPts: 0 };

  // 1. Agilidade (AGI) - Vigor de Tela (>120m: +0.2 | >140m: +0.4 | >170m: +1.0)
  const agiGain = Math.round(Math.max(0, nextContrib.agi - prevContrib.agi) * 10) / 10;
  if (agiGain > 0) {
    statGains.push({
      key: 'AGI',
      icon: '⚡',
      label: `+${agiGain.toFixed(1)} AGI`,
      gain: agiGain,
    });
  }

  // 2. Inteligência (INT) - Sabedoria Temporal (Pré-2000/1980/1950 + Ano Inédito: +0.8)
  const tmYearsCount =
    effectivePrevXp?.sources?.timeMachine?.totalConqueredYears != null &&
    nextXpStatus?.sources?.timeMachine?.totalConqueredYears != null
      ? Math.max(
          0,
          nextXpStatus.sources.timeMachine.totalConqueredYears -
            effectivePrevXp.sources.timeMachine.totalConqueredYears
        )
      : (timeMachineUnlocks || []).filter((u) => u && u.kind === 'year').length;

  const intHistGain = Math.max(0, nextContrib.intHist - prevContrib.intHist);
  const roundedInt = Math.round((intHistGain + tmYearsCount * 0.8) * 10) / 10;
  if (roundedInt > 0) {
    statGains.push({
      key: 'INT',
      icon: '🧠',
      label: `+${roundedInt.toFixed(1)} INT`,
      gain: roundedInt,
    });
  }

  // 3. Destreza (DES) - Diplomacia Global (Fora EUA/BR: +0.2 | Nova Nação ONU: +1.0)
  let newCountriesCount = 0;
  if (
    effectivePrevXp?.sources?.countries?.totalConqueredCount != null &&
    nextXpStatus?.sources?.countries?.totalConqueredCount != null
  ) {
    newCountriesCount = Math.max(
      0,
      nextXpStatus.sources.countries.totalConqueredCount -
        effectivePrevXp.sources.countries.totalConqueredCount
    );
  } else if (existingMovies && existingMovies.length > 0 && normalizedMovie.countries.length > 0) {
    const existingCountries = new Set();
    existingMovies.forEach((m) => {
      if (isEditMode && matchesMovieIdentity(m, normalizedMovie)) return;
      (m.countries || []).forEach((c) => existingCountries.add(String(c).toLowerCase().trim()));
    });
    const expandsNew = normalizedMovie.countries.some(
      (c) => !existingCountries.has(String(c).toLowerCase().trim())
    );
    if (expandsNew) newCountriesCount = 1;
  }

  const desForeignGain = Math.max(0, nextContrib.desForeign - prevContrib.desForeign);
  const roundedDes = Math.round((desForeignGain + newCountriesCount * 1.0) * 10) / 10;
  if (roundedDes > 0) {
    statGains.push({
      key: 'DES',
      icon: '🌍',
      label: `+${roundedDes.toFixed(1)} DES`,
      gain: roundedDes,
    });
  }

  // 4. Sorte (SOR) - Olhar Clínico (+0.2 por catalogação | +0.8 nota extrema >=9.5 ou <=4.0)
  const roundedSor = Math.round(Math.max(0, nextContrib.sor - prevContrib.sor) * 10) / 10;
  if (roundedSor > 0) {
    statGains.push({
      key: 'SOR',
      icon: '🎯',
      label: `+${roundedSor.toFixed(1)} SOR`,
      gain: roundedSor,
    });
  }

  // 5. Vitalidade (VIT) - Caça-Troféus PS5
  let vitGain = 0;
  if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
    newlyUnlocked.forEach((t) => {
      const tier = String(t.tier || '').toLowerCase();
      if (tier === 'platinum') vitGain += 3.0;
      else if (tier === 'mythic') vitGain += 1.0;
      else if (tier === 'gold') vitGain += 0.8;
      else if (tier === 'epic') vitGain += 0.6;
      else if (tier === 'silver') vitGain += 0.4;
      else vitGain += 0.2;
    });
  }
  const roundedVit = Math.round(vitGain * 10) / 10;
  if (roundedVit > 0) {
    statGains.push({
      key: 'VIT',
      icon: '🏆',
      label: `+${roundedVit.toFixed(1)} VIT`,
      gain: roundedVit,
    });
  }

  // 6. Força (FOR) - Prestígio Áureo (Indicado: +0.2 | Venceu: +0.4)
  const roundedFor = Math.round(Math.max(0, nextContrib.forPts - prevContrib.forPts) * 10) / 10;
  if (roundedFor > 0) {
    statGains.push({
      key: 'FOR',
      icon: '👑',
      label: `+${roundedFor.toFixed(1)} FOR`,
      gain: roundedFor,
    });
  }

  // Avaliação de Desbloqueio de Nova Classe usando o estado real antes e depois da gravação
  let unlockedClass = null;
  if (movieData) {
    try {
      const prevList = existingMovies || [];
      const hasMatch = isEditMode && prevList.some((m) => matchesMovieIdentity(m, normalizedMovie));
      const nextMovies = hasMatch
        ? prevList.map((m) => (matchesMovieIdentity(m, normalizedMovie) ? { ...m, ...normalizedMovie } : m))
        : [...prevList, normalizedMovie];

      const prevStats = computeRpgAndGuilds(prevList, prevList, effectivePrevXp);
      const prevClass = prevStats.characterClass;
      const nextStats = computeRpgAndGuilds(nextMovies, nextMovies, nextXpStatus || effectivePrevXp);
      const nextClass = nextStats.characterClass;

      if (
        nextClass &&
        prevClass &&
        nextClass.id !== prevClass.id &&
        nextClass.unlockPts > prevClass.unlockPts
      ) {
        unlockedClass = {
          name: nextClass.className,
          icon: nextClass.classIcon,
          flavor: nextClass.titleFlavor,
        };
      }
    } catch {
      // safe fallback
    }
  }

  return {
    statGains,
    unlockedClass,
  };
}

const UNIVERSE_TIER_NAMES = {
  mythic: 'Mítico',
  gold: 'Ouro',
  epic: 'Épico',
  silver: 'Prata',
  bronze: 'Bronze',
};

function parseValidUniverseScore(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s || s.toUpperCase() === 'N/A') return null;
  const n = Number(s.replace('%', '').replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function pickBestPosterFromList(items = []) {
  const watchedWithPoster = items
    .filter((m) => (m?.watched ?? true) && m?.posterUrl)
    .sort((a, b) => (parseValidUniverseScore(b.userRating) || 0) - (parseValidUniverseScore(a.userRating) || 0));
  if (watchedWithPoster[0]?.posterUrl) return watchedWithPoster[0].posterUrl;
  const anyWithPoster = items.find((m) => m?.posterUrl);
  return anyWithPoster?.posterUrl || null;
}

/**
 * 9. Visão Consolidada para o Banner "Universos Conquistados" (Painel Analytics)
 */
export function computeUniverseOverview(universeCodex = null, universeXpSummary = null) {
  const sagas = Array.isArray(universeCodex?.sagas) ? universeCodex.sagas : [];
  const megaSagas = Array.isArray(universeCodex?.megaSagas) ? universeCodex.megaSagas : [];
  const summary = universeCodex?.summary || {};
  const xp = universeXpSummary || universeCodex?.xpSummary || {};

  const uniqueMoviesMap = new Map();
  sagas.forEach((s) => {
    (s.movies || []).forEach((m) => {
      const key = m.movieId ? `id_${m.movieId}` : `${String(m.title || '').toLowerCase()}_${m.year || ''}`;
      const prev = uniqueMoviesMap.get(key);
      if (!prev || (!prev.watched && m.watched)) {
        uniqueMoviesMap.set(key, { watched: Boolean(m.watched) });
      }
    });
  });

  const uniqueTotalMovies = uniqueMoviesMap.size;
  let uniqueWatchedMovies = 0;
  uniqueMoviesMap.forEach((v) => {
    if (v.watched) uniqueWatchedMovies += 1;
  });

  const mythicEarnedXp = megaSagas
    .filter((ms) => ms.isCompleted)
    .reduce((acc, ms) => acc + Number(ms.completionXp || 0), 0);
  const mythicInProgress = megaSagas.filter((ms) => !ms.isCompleted && (ms.watchedMoviesCount || 0) > 0).length;

  const tierOrder = [
    { key: 'gold', label: 'Blocos Ouro', icon: '🥇', color: 'text-amber-300', barColor: 'bg-amber-400' },
    { key: 'epic', label: 'Blocos Épicos', icon: '💜', color: 'text-purple-300', barColor: 'bg-purple-400' },
    { key: 'silver', label: 'Blocos Prata', icon: '🥈', color: 'text-zinc-200', barColor: 'bg-zinc-300' },
    { key: 'bronze', label: 'Blocos Bronze', icon: '🥉', color: 'text-[#E8A96B]', barColor: 'bg-[#CD7F32]' },
  ];

  const byTier = [
    {
      key: 'mythic',
      label: 'Mega-Sagas Míticas',
      icon: '💎',
      color: 'text-fuchsia-300',
      barColor: 'bg-gradient-to-r from-fuchsia-400 via-amber-300 to-cyan-400',
      completed: Number(summary.completedMegaSagas ?? xp.completedMegaSagasCount ?? megaSagas.filter((m) => m.isCompleted).length),
      total: Number(summary.totalMegaSagas ?? xp.totalMegaSagasCount ?? megaSagas.length),
      inProgress: mythicInProgress,
      earnedXp: Number(summary.megaSagasXp ?? xp.megaSagasXp ?? mythicEarnedXp),
    },
    ...tierOrder.map((meta) => {
      const subset = sagas.filter((s) => s.tier === meta.key);
      const completedSubset = subset.filter((s) => s.isCompleted);
      const inProgress = subset.filter((s) => !s.isCompleted && (s.watchedCount || 0) > 0).length;
      const earnedXp = completedSubset.reduce((acc, s) => acc + Number(s.completionXp || 0), 0);
      return {
        ...meta,
        completed: completedSubset.length,
        total: subset.length,
        inProgress,
        earnedXp,
      };
    }),
  ].map((row) => ({
    ...row,
    pct: row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0,
  }));

  const topMegaProgress = [...megaSagas].sort(
    (a, b) =>
      Number(b.watchedMoviesCount || 0) - Number(a.watchedMoviesCount || 0) ||
      Number(b.progressPct || 0) - Number(a.progressPct || 0)
  )[0] || null;

  return {
    totalSagas: Number(summary.totalSagas ?? xp.totalSagasCount ?? sagas.length),
    completedSagas: Number(summary.completedSagas ?? xp.completedSagasCount ?? sagas.filter((s) => s.isCompleted).length),
    totalMegaSagas: Number(summary.totalMegaSagas ?? xp.totalMegaSagasCount ?? megaSagas.length),
    completedMegaSagas: Number(summary.completedMegaSagas ?? xp.completedMegaSagasCount ?? megaSagas.filter((m) => m.isCompleted).length),
    unlockedCheckpoints: Number(summary.unlockedCheckpoints ?? xp.unlockedCheckpointsCount ?? 0),
    totalCheckpoints: Number(summary.totalCheckpoints ?? 0),
    checkpointsXp: Number(summary.checkpointsXp ?? xp.checkpointsXp ?? 0),
    sagasXp: Number(summary.sagasXp ?? xp.sagasXp ?? 0),
    megaSagasXp: Number(summary.megaSagasXp ?? xp.megaSagasXp ?? 0),
    totalUniverseXp: Number(summary.totalUniverseXp ?? xp.totalXp ?? 0),
    uniqueWatchedMovies,
    uniqueTotalMovies,
    moviesPct: uniqueTotalMovies > 0 ? Math.round((uniqueWatchedMovies / uniqueTotalMovies) * 100) : 0,
    byTier,
    topMegaProgress,
  };
}

/**
 * 10. Relíquias Exclusivas do Códice dos Universos (Ala 3: Museu de Relíquias)
 */
export function computeUniverseRelics(universeCodex = null) {
  const sagas = Array.isArray(universeCodex?.sagas) ? universeCodex.sagas : [];
  const megaSagas = Array.isArray(universeCodex?.megaSagas) ? universeCodex.megaSagas : [];
  if (sagas.length === 0 && megaSagas.length === 0) return [];

  const records = [];
  const sagaById = new Map(sagas.map((s) => [s.id, s]));

  const resolveMegaPoster = (ms) => {
    const direct = pickBestPosterFromList(ms.posters || []);
    if (direct) return direct;
    for (const cid of ms.childSagaIds || []) {
      const child = sagaById.get(cid);
      const p = pickBestPosterFromList(child?.movies || []);
      if (p) return p;
    }
    return null;
  };

  // 1. Mega-Saga Mítica com Mais Filmes Conquistados (ex: 13/42)
  if (megaSagas.length > 0) {
    const sortedMega = [...megaSagas].sort(
      (a, b) =>
        Number(b.watchedMoviesCount || 0) - Number(a.watchedMoviesCount || 0) ||
        Number(b.progressPct || 0) - Number(a.progressPct || 0) ||
        Number(b.totalMoviesCount || 0) - Number(a.totalMoviesCount || 0)
    );
    const hasWatched = sortedMega.some((m) => Number(m.watchedMoviesCount || 0) > 0);
    const candidates = hasWatched ? sortedMega.filter((m) => Number(m.watchedMoviesCount || 0) > 0) : sortedMega;

    const rec = buildRecordWithTies({
      id: 'universe_mythic_most_movies',
      rarity: 'mythic',
      rarityLabel: '💎 RELÍQUIA MÍTICA • CÓDICE',
      icon: '🌌',
      title: 'Saga Mítica Mais Avançada',
      subtitle: 'Mega-Saga Mítica com mais filmes conquistados',
      sortedCandidates: candidates,
      getScore: (ms) => Number(ms.watchedMoviesCount || 0),
      formatVariant: (ms) => ({
        statBadge: `${ms.watchedMoviesCount || 0}/${ms.totalMoviesCount || 0} filmes`,
        statDetail: `${ms.icon || '💎'} ${ms.completedBlocks || 0}/${ms.totalBlocks || 0} blocos concluídos • ${ms.progressPct || 0}% da Mega-Saga`,
      }),
      formatNextDistinct: (ms) => `2º: ${ms.title} (${ms.watchedMoviesCount || 0}/${ms.totalMoviesCount || 0})`,
    });

    if (rec) {
      rec.tiedVariants = rec.tiedVariants.map((v) => ({
        ...v,
        movie: {
          title: v.movie.title,
          poster_url: resolveMegaPoster(v.movie),
        },
      }));
      rec.movie = rec.tiedVariants[0].movie;
      records.push(rec);
    }
  }

  // 2. Saga Dominada com Mais Filmes (100% concluída)
  const completedSagas = sagas
    .filter((s) => s.isCompleted)
    .sort(
      (a, b) =>
        Number(b.watchedCount || b.totalCount || 0) - Number(a.watchedCount || a.totalCount || 0) ||
        Number(b.completionXp || 0) - Number(a.completionXp || 0)
    );

  if (completedSagas.length > 0) {
    const rec = buildRecordWithTies({
      id: 'universe_completed_most_movies',
      rarity: 'legendary',
      rarityLabel: '🥇 COLOSSO DOMINADO • CÓDICE',
      icon: '🏆',
      title: 'Saga Dominada com Mais Filmes',
      subtitle: 'Maior bloco do Códice zerado em 100%',
      sortedCandidates: completedSagas,
      getScore: (s) => Number(s.watchedCount || s.totalCount || 0),
      formatVariant: (s) => ({
        statBadge: `${s.watchedCount || 0}/${s.totalCount || 0} filmes`,
        statDetail: `${s.icon || '🏆'} Tier ${UNIVERSE_TIER_NAMES[s.tier] || s.tier} • +${s.completionXp || 0} XP conquistados`,
      }),
      formatNextDistinct: (s) => `2º: ${s.title} (${s.watchedCount || 0} filmes)`,
    });
    if (rec) {
      rec.tiedVariants = rec.tiedVariants.map((v) => ({
        ...v,
        movie: {
          title: v.movie.title,
          poster_url: pickBestPosterFromList(v.movie.movies || []),
        },
      }));
      rec.movie = rec.tiedVariants[0].movie;
      records.push(rec);
    }
  } else if (sagas.length > 0) {
    const closest = [...sagas].sort(
      (a, b) =>
        Number(b.progressPct || 0) - Number(a.progressPct || 0) ||
        Number(b.watchedCount || 0) - Number(a.watchedCount || 0)
    )[0];
    records.push({
      id: 'universe_completed_most_movies',
      rarity: 'legendary',
      rarityLabel: '🥇 COLOSSO DOMINADO • CÓDICE',
      icon: '🏆',
      title: 'Saga Dominada com Mais Filmes',
      subtitle: 'Maior bloco do Códice zerado em 100%',
      movie: {
        title: 'Nenhuma Saga 100% Dominada',
        poster_url: pickBestPosterFromList(closest?.movies || []),
      },
      statBadge: `0 / ${sagas.length} Sagas 100%`,
      statDetail: closest
        ? `Mais próxima: ${closest.title} (${closest.watchedCount}/${closest.totalCount} • ${closest.progressPct}%)`
        : 'Conclua 100% de uma saga para registrar o recorde.',
      tiedVariants: [],
      runnerUp: null,
    });
  }

  // 3 & 4. Sagas Completas (100%) com Maior e Menor Média da Minha Nota (Números de filmes + Média)
  const ratedSagas = completedSagas
    .map((s) => {
      const validRatings = (s.movies || [])
        .map((m) => parseValidUniverseScore(m.userRating))
        .filter((v) => v !== null);
      if (validRatings.length === 0) return null;
      const sum = validRatings.reduce((acc, v) => acc + v, 0);
      const avg = sum / validRatings.length;
      return {
        ...s,
        ratedCount: validRatings.length,
        avgUserRating: avg,
        posterUrl: pickBestPosterFromList(s.movies || []),
      };
    })
    .filter(Boolean);

  if (ratedSagas.length > 0) {
    const byHighestAvg = [...ratedSagas].sort(
      (a, b) =>
        b.avgUserRating - a.avgUserRating ||
        b.ratedCount - a.ratedCount ||
        Number(b.totalCount || 0) - Number(a.totalCount || 0)
    );
    const highRec = buildRecordWithTies({
      id: 'universe_highest_user_avg',
      rarity: 'epic',
      rarityLabel: '💜 PINÁCULO DA NOTA • CÓDICE',
      icon: '👑',
      title: 'Saga com Maior Média Pessoal',
      subtitle: 'Maior média das suas notas entre sagas 100% completas',
      sortedCandidates: byHighestAvg,
      getScore: (s) => Math.round(s.avgUserRating * 1000),
      formatVariant: (s) => ({
        statBadge: `⭐ ${s.avgUserRating.toFixed(3)} • ${s.ratedCount} ${s.ratedCount === 1 ? 'filme' : 'filmes'}`,
        statDetail: `Média ${s.avgUserRating.toFixed(3)} em ${s.ratedCount} ${s.ratedCount === 1 ? 'filme avaliado' : 'filmes avaliados'} (${s.watchedCount}/${s.totalCount} • 100% completa)`,
      }),
      formatNextDistinct: (s) => `2º: ${s.title} (${s.avgUserRating.toFixed(3)} • ${s.ratedCount}f)`,
    });
    if (highRec) {
      highRec.tiedVariants = highRec.tiedVariants.map((v) => ({
        ...v,
        movie: {
          title: v.movie.title,
          poster_url: v.movie.posterUrl,
        },
      }));
      highRec.movie = highRec.tiedVariants[0].movie;
      records.push(highRec);
    }

    const byLowestAvg = [...ratedSagas].sort(
      (a, b) =>
        a.avgUserRating - b.avgUserRating ||
        b.ratedCount - a.ratedCount ||
        Number(b.totalCount || 0) - Number(a.totalCount || 0)
    );
    const lowRec = buildRecordWithTies({
      id: 'universe_lowest_user_avg',
      rarity: 'rare',
      rarityLabel: '🔵 CRIPTA CRÍTICA • CÓDICE',
      icon: '💀',
      title: 'Saga com Menor Média Pessoal',
      subtitle: 'Menor média das suas notas entre sagas 100% completas',
      sortedCandidates: byLowestAvg,
      getScore: (s) => Math.round(s.avgUserRating * 1000),
      formatVariant: (s) => ({
        statBadge: `⚠️ ${s.avgUserRating.toFixed(3)} • ${s.ratedCount} ${s.ratedCount === 1 ? 'filme' : 'filmes'}`,
        statDetail: `Média ${s.avgUserRating.toFixed(3)} em ${s.ratedCount} ${s.ratedCount === 1 ? 'filme avaliado' : 'filmes avaliados'} (${s.watchedCount}/${s.totalCount} • 100% completa)`,
      }),
      formatNextDistinct: (s) => `2º: ${s.title} (${s.avgUserRating.toFixed(3)} • ${s.ratedCount}f)`,
    });
    if (lowRec) {
      lowRec.tiedVariants = lowRec.tiedVariants.map((v) => ({
        ...v,
        movie: {
          title: v.movie.title,
          poster_url: v.movie.posterUrl,
        },
      }));
      lowRec.movie = lowRec.tiedVariants[0].movie;
      records.push(lowRec);
    }
  }

  return records;
}
