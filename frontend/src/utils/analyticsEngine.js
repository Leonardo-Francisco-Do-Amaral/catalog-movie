import {
  LEVEL_TITLE_RANGES,
  TROPHY_TIER_META,
  COUNTRY_RARITY_META,
  TIME_MACHINE_RARITY_META,
  calculateClientXpStatus,
} from './xpSystem';
import { CATEGORY_BADGE_CONFIG, getCleanTrophyTitle } from '../components/TrophyBadges';

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
    top5Imdb,
    top5Metacritic,
    top5Rotten,
    judges,
    mostGenerous,
    harshest,
  };
}

/**
 * 2. Museu de Relíquias & 12 Recordes Extremos (Loot Cards RPG)
 */
export function computeExtremeRecords(movies = []) {
  const unique = deduplicateMovies(movies);
  if (unique.length === 0) return [];

  const records = [];

  // 1. Filme Mais Raro / Underground (menor vote_count > 0)
  const withVotes = unique
    .filter((m) => Number(m.vote_count) > 0)
    .sort((a, b) => Number(a.vote_count) - Number(b.vote_count));
  if (withVotes.length > 0) {
    const win = withVotes[0];
    const second = withVotes[1];
    records.push({
      id: 'rarest_votes',
      rarity: 'mythic',
      rarityLabel: '💎 RELÍQUIA MÍTICA',
      icon: '🕵️',
      title: 'Achado Mais Raro & Underground',
      subtitle: 'Menor número de votos globais no mundo',
      movie: win,
      statBadge: `${Number(win.vote_count).toLocaleString('pt-BR')} votos`,
      statDetail: `Ano ${win.release_year || '?'} • Quase ninguém no planeta catalogou!`,
      runnerUp: second
        ? `2º: ${second.title} (${Number(second.vote_count).toLocaleString('pt-BR')} votos)`
        : null,
    });

    // 2. Colosso Mainstream (maior vote_count)
    const popWin = withVotes[withVotes.length - 1];
    const popSecond = withVotes[withVotes.length - 2];
    records.push({
      id: 'popular_votes',
      rarity: 'legendary',
      rarityLabel: '🥇 COLOSSO LENDÁRIO',
      icon: '🌍',
      title: 'Titã de Popularidade Global',
      subtitle: 'Filme com mais avaliações mundiais',
      movie: popWin,
      statBadge: `${Number(popWin.vote_count).toLocaleString('pt-BR')} votos`,
      statDetail: `IMDb ${Number(popWin.imdb_rating || 0).toFixed(1)} • Minha: ${Number(popWin.user_rating || 0).toFixed(3)}`,
      runnerUp: popSecond
        ? `2º: ${popSecond.title} (${Number(popSecond.vote_count).toLocaleString('pt-BR')})`
        : null,
    });
  }

  // 3 & 4. Maior e Menor Duração
  const withRuntime = unique
    .filter((m) => Number(m.runtime) > 0)
    .sort((a, b) => Number(b.runtime) - Number(a.runtime));
  if (withRuntime.length > 0) {
    const longest = withRuntime[0];
    const longest2 = withRuntime[1];
    records.push({
      id: 'longest_runtime',
      rarity: 'legendary',
      rarityLabel: '🥇 CHEFÃO DE RESISTÊNCIA',
      icon: '⏳',
      title: 'Maior Tempo de Duração',
      subtitle: 'A maratona suprema de um único filme',
      movie: longest,
      statBadge: `${longest.runtime} min (${formatRuntime(longest.runtime)})`,
      statDetail: `Lançado em ${longest.release_year || '?'} • Teste máximo de foco!`,
      runnerUp: longest2 ? `2º: ${longest2.title} (${longest2.runtime} min)` : null,
    });

    const shortest = withRuntime[withRuntime.length - 1];
    const shortest2 = withRuntime[withRuntime.length - 2];
    records.push({
      id: 'shortest_runtime',
      rarity: 'rare',
      rarityLabel: '🔵 SPEEDRUN RARO',
      icon: '⚡',
      title: 'Menor Tempo de Duração',
      subtitle: 'Tiro curto e direto ao ponto',
      movie: shortest,
      statBadge: `${shortest.runtime} min (${formatRuntime(shortest.runtime)})`,
      statDetail: `Lançado em ${shortest.release_year || '?'} • Nota ${Number(shortest.user_rating || 0).toFixed(3)}`,
      runnerUp: shortest2 ? `2º: ${shortest2.title} (${shortest2.runtime} min)` : null,
    });
  }

  // 5. Maior Campeão de Oscars
  const withOscarWins = unique
    .filter((m) => Number(m.oscar_wins) > 0)
    .sort(
      (a, b) =>
        Number(b.oscar_wins) - Number(a.oscar_wins) ||
        Number(b.oscar_nominations || 0) - Number(a.oscar_nominations || 0) ||
        Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
  if (withOscarWins.length > 0) {
    const oscWin = withOscarWins[0];
    const oscWin2 = withOscarWins[1];
    records.push({
      id: 'most_oscar_wins',
      rarity: 'mythic',
      rarityLabel: '💎 REALEZA DA ACADEMIA',
      icon: '🏆',
      title: 'Maior Ganhador de Oscar',
      subtitle: 'Recordista de estatuetas douradas no catálogo',
      movie: oscWin,
      statBadge: `🏆 ${oscWin.oscar_wins} Oscars`,
      statDetail: `${oscWin.oscar_nominations || oscWin.oscar_wins} indicações oficiais na cerimônia`,
      runnerUp: oscWin2 ? `2º: ${oscWin2.title} (${oscWin2.oscar_wins} Oscars)` : null,
    });
  }

  // 6. Mais Indicações ao Oscar
  const withOscarNoms = unique
    .filter((m) => Number(m.oscar_nominations) > 0)
    .sort(
      (a, b) =>
        Number(b.oscar_nominations) - Number(a.oscar_nominations) ||
        Number(b.oscar_wins || 0) - Number(a.oscar_wins || 0)
    );
  if (withOscarNoms.length > 0) {
    const nomWin = withOscarNoms[0];
    const nomWin2 = withOscarNoms[1];
    records.push({
      id: 'most_oscar_noms',
      rarity: 'epic',
      rarityLabel: '💜 ÍMÃ DA ACADEMIA',
      icon: '🎬',
      title: 'Recordista de Indicações ao Oscar',
      subtitle: 'O queridinho absoluto das votações',
      movie: nomWin,
      statBadge: `🎬 ${nomWin.oscar_nominations} Indicações`,
      statDetail: `Converteu ${nomWin.oscar_wins || 0} vitória(s) na premiação`,
      runnerUp: nomWin2 ? `2º: ${nomWin2.title} (${nomWin2.oscar_nominations} ind.)` : null,
    });
  }

  // 7. Filme com Mais Tags
  const byTags = unique
    .filter((m) => Array.isArray(m.tags) && m.tags.length > 0)
    .sort(
      (a, b) =>
        b.tags.length - a.tags.length ||
        Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
  if (byTags.length > 0) {
    const tagWin = byTags[0];
    const tagWin2 = byTags[1];
    records.push({
      id: 'most_tags',
      rarity: 'epic',
      rarityLabel: '💜 QUIMERA DE TAGS',
      icon: '🏷️',
      title: 'Filme com Maior Número de Tags',
      subtitle: 'Mistura mais insana de temas e elementos',
      movie: tagWin,
      statBadge: `${tagWin.tags.length} Tags`,
      statDetail: tagWin.tags.slice(0, 5).join(' • ') + (tagWin.tags.length > 5 ? '...' : ''),
      runnerUp: tagWin2 ? `2º: ${tagWin2.title} (${tagWin2.tags.length} tags)` : null,
    });
  }

  // 8. Filme com Mais Gêneros
  const byGenres = unique
    .filter((m) => Array.isArray(m.genres) && m.genres.length > 0)
    .sort(
      (a, b) =>
        b.genres.length - a.genres.length ||
        Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
  if (byGenres.length > 0) {
    const genWin = byGenres[0];
    const genWin2 = byGenres[1];
    records.push({
      id: 'most_genres',
      rarity: 'rare',
      rarityLabel: '🔵 MUTANTE MULTICLASSE',
      icon: '🧬',
      title: 'Mais Gêneros Combinados',
      subtitle: 'Obra híbrida que cruza múltiplas classes',
      movie: genWin,
      statBadge: `${genWin.genres.length} Gêneros`,
      statDetail: genWin.genres.join(' • '),
      runnerUp: genWin2 ? `2º: ${genWin2.title} (${genWin2.genres.length} gêneros)` : null,
    });
  }

  // 9. Gravação / Lançamento Mais Antigo
  const byOldest = unique
    .filter((m) => Number(m.release_year) > 1880)
    .sort(
      (a, b) =>
        Number(a.release_year) - Number(b.release_year) ||
        Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
  if (byOldest.length > 0) {
    const oldWin = byOldest[0];
    const oldWin2 = byOldest[1];
    const ageYears = new Date().getFullYear() - Number(oldWin.release_year);
    records.push({
      id: 'oldest_release',
      rarity: 'mythic',
      rarityLabel: '💎 ARTEFATO ANCESTRAL',
      icon: '🏺',
      title: 'Filme Mais Antigo Assistido',
      subtitle: 'Sua viagem mais profunda ao passado do cinema',
      movie: oldWin,
      statBadge: `Ano ${oldWin.release_year}`,
      statDetail: `${ageYears} anos de história cinematográfica!`,
      runnerUp: oldWin2 ? `2º: ${oldWin2.title} (${oldWin2.release_year})` : null,
    });
  }

  // 10. Maior Coprodução Internacional
  const byCountries = unique
    .filter((m) => Array.isArray(m.countries) && m.countries.length > 0)
    .sort(
      (a, b) =>
        b.countries.length - a.countries.length ||
        Number(b.user_rating || 0) - Number(a.user_rating || 0)
    );
  if (byCountries.length > 0) {
    const cWin = byCountries[0];
    const cWin2 = byCountries[1];
    records.push({
      id: 'most_countries',
      rarity: 'epic',
      rarityLabel: '💜 ALIANÇA DIPLOMÁTICA',
      icon: '🌐',
      title: 'Maior Coprodução Mundial',
      subtitle: 'Mais bandeiras unidas na mesma produção',
      movie: cWin,
      statBadge: `${cWin.countries.length} Países`,
      statDetail: cWin.countries.join(', '),
      runnerUp: cWin2 ? `2º: ${cWin2.title} (${cWin2.countries.length} países)` : null,
    });
  }

  // 11 & 12. Divergências Críticas ("Contra o Sistema" vs "Escudo Anti-Hype")
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
    const rebelWin = rebelSorted[0];
    if (rebelWin && rebelWin.diff > 0) {
      records.push({
        id: 'rebel_love',
        rarity: 'legendary',
        rarityLabel: '🥇 CONTRA O SISTEMA',
        icon: '⚔️',
        title: 'Eu Amei, a Crítica Chorou!',
        subtitle: 'Maior vantagem da sua nota contra os críticos',
        movie: rebelWin,
        statBadge: `+${rebelWin.diff.toFixed(1)} pts acima`,
        statDetail: `Você: ${Number(rebelWin.user_rating).toFixed(3)} (${rebelWin.user100.toFixed(0)}) vs Crítica: ${rebelWin.criticAvg.toFixed(0)}/100`,
        runnerUp: rebelSorted[1]
          ? `2º: ${rebelSorted[1].title} (+${rebelSorted[1].diff.toFixed(1)} pts)`
          : null,
      });
    }

    const shieldSorted = [...withCriticAndUser].sort((a, b) => a.diff - b.diff);
    const shieldWin = shieldSorted[0];
    if (shieldWin && shieldWin.diff < 0) {
      records.push({
        id: 'hype_shield',
        rarity: 'epic',
        rarityLabel: '💜 ESCUDO ANTI-HYPE',
        icon: '🛡️',
        title: 'Imune ao Hype da Crítica',
        subtitle: 'A crítica aplaudiu de pé, mas você foi rigoroso',
        movie: shieldWin,
        statBadge: `${shieldWin.diff.toFixed(1)} pts abaixo`,
        statDetail: `Crítica: ${shieldWin.criticAvg.toFixed(0)}/100 vs Você: ${Number(shieldWin.user_rating).toFixed(3)} (${shieldWin.user100.toFixed(0)})`,
        runnerUp: shieldSorted[1]
          ? `2º: ${shieldSorted[1].title} (${shieldSorted[1].diff.toFixed(1)} pts)`
          : null,
      });
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
    id: 'monge_tres_casas',
    className: 'O Monge das Três Casas Decimais',
    classIcon: '⚖️',
    titleFlavor: 'Balança Micrométrica & Inimigo da Nota Redonda',
    archetype: 'Crítico Matemático',
    lore: 'Acha um absurdo notas inteiras ou meias estrelas. O verdadeiro sentido da sua vida cinéfila é deliberar calmamente se um longa merece um 8.742 ou um 8.745 no banco de dados.',
    favoriteMovie: '2001: Uma Odisseia no Espaço (1968) (rigorosamente avaliado com um 9.948 porque a perfeição absoluta de 10.000 não existe).',
    passiveSkill: 'Balança Micrométrica (imune a notas infladas da imprensa; detecta a menor inconsistência de montagem e desconta 0.015 pontos na hora).',
  },
  {
    id: 'carnical_grindhouse',
    className: 'O Carniçal do Grindhouse (Necromante do Gore)',
    classIcon: '🩸',
    titleFlavor: 'Necromante do Gore & Práticas de Borracha',
    archetype: 'Terror Visceral',
    lore: 'Se não voarem pelo menos cinquenta litros de sangue falso de xarope de milho nos primeiros vinte minutos de projeção, ele considera a obra um drama familiar.',
    favoriteMovie: 'Uma Noite Alucinante 2 (Evil Dead II, 1987) ou O ABC da Morte (2013).',
    passiveSkill: 'Estômago de Titânio (consegue jantar uma pizza inteira enquanto assiste a cenas viscerais com mutilação prática de borracha).',
  },
  {
    id: 'corsario_sete_mares',
    className: 'O Corsário dos Sete Mares',
    classIcon: '🏴‍☠️',
    titleFlavor: 'Navegador de Servidores Ocultos & Fontes Alternativas',
    archetype: 'Explorador da Nuvem',
    lore: 'Navega por servidores ocultos, nuvens misteriosas e fontes alternativas sem pegar um único vírus no sistema.',
    favoriteMovie: 'Piratas do Caribe: A Maldição do Pérola Negra (2003) (ou qualquer arquivo de 800 MB rodando direto na nuvem).',
    passiveSkill: 'VPN Espiritual (imune a travamentos de buffer, legendas dessincronizadas e telas pretas na metade do clímax).',
  },
  {
    id: 'cavaleiro_laser_azul',
    className: 'O Cavaleiro do Laser Azul (Guardião da Mídia Física)',
    classIcon: '💿',
    titleFlavor: 'Guardião do Acrílico Sagrado & Pureza do Dolby Atmos',
    archetype: 'Audiófilo & Purista',
    lore: 'Trata estojos de acrílico, encartes com luva e edições especiais como se fossem relíquias sagradas de museu. Para ele, compressão de bitrate de streaming é um crime inafiançável.',
    favoriteMovie: 'Mad Max: Estrada da Fúria (2015) (rodando direto no leitor de Blu-ray com áudio Dolby Atmos no talo).',
    passiveSkill: 'Armadura Anti-Risco (detecta artefatos visuais de compressão a 5 metros de distância e ganha bônus de foco ao manusear discos sem encostar nos dados).',
  },
  {
    id: 'bardo_herbert_richers',
    className: 'O Bardo de Herbert Richers (Menestrel da Dublagem Clássica)',
    classIcon: '🎙️',
    titleFlavor: 'Menestrel da Versão Brasileira & Nostalgia dos Anos 80/90',
    archetype: 'Guardião da Voz',
    lore: 'Conhece o elenco de dubladores de cabeça e sente uma dor física profunda quando um clássico dos anos 80 ou 90 ganha redublagem moderna na TV.',
    favoriteMovie: 'Curtindo a Vida Adoidado (1986) (estritamente com a primeira dublagem clássica).',
    passiveSkill: 'Afinador de Cordas Vocais (identifica a voz de dubladores lendários na primeira sílaba e ignora qualquer dessincronia labial original).',
  },
  {
    id: 'cartografo_195_reinos',
    className: 'O Cartógrafo dos 195 Reinos',
    classIcon: '🧭',
    titleFlavor: 'Geopolítico dos Dramas Islandeses & Fronteiras Raras',
    archetype: 'Diplomata Global',
    lore: 'Para ele, cinema em língua inglesa é café com leite. Ele só fica satisfeito quando encontra um drama existencial islandês de duas horas e meia onde dois pescadores encaram o gelo em silêncio.',
    favoriteMovie: 'Coração de Pedra (2016) (ou qualquer produção obscura do Leste Europeu com coprodução de 4 países).',
    passiveSkill: 'Bússola Geopolítica (aponta a capital de qualquer país raro no mapa-múndi instantaneamente sem precisar consultar o Google).',
  },
  {
    id: 'barbaro_imax',
    className: 'O Bárbaro do IMAX & Pipoca Doce',
    classIcon: '🍿',
    titleFlavor: 'Destruidor de Roteiros & Adorador de Robôs Gigantes',
    archetype: 'Velocista de Ação',
    lore: 'Não quer saber de metáforas, cinema cult ou desenvolvimento de personagem. Ele entra na sala com o maior balde de pipoca disponível apenas para ver prédios desabando e robôs gigantes trocando socos.',
    favoriteMovie: 'Godzilla vs. Kong (2021) ou qualquer produção de Michael Bay com explosões práticas em tela cheia.',
    passiveSkill: 'Cegueira Roteirística (ignora completamente qualquer furo lógico na narrativa desde que o som surround faça a poltrona do cinema tremer).',
  },
  {
    id: 'vampiro_madrugada',
    className: 'O Vampiro da Madrugada (Guardião da Sessão Coruja)',
    classIcon: '🦇',
    titleFlavor: 'Soberano da Luz Azul & Madrugadas Silenciosas',
    archetype: 'Criatura Noturna',
    lore: 'A tela da sua TV só ganha vida depois que todo mundo em casa já foi dormir. Sua luz natural é o brilho escuro do painel da televisão enquanto o relógio passa das duas da manhã.',
    favoriteMovie: 'Taxi Driver (1976) ou Drive (2011).',
    passiveSkill: 'Visão Noturna (não sente cansaço visual no escuro total e ganha bônus de foco se o filme terminar exatamente quando o sol começar a nascer).',
  },
  {
    id: 'sacerdote_cinefilo',
    className: 'O Sacerdote Cinéfilo',
    classIcon: '✝️',
    titleFlavor: 'Exorcista de Demônios nas Telas em 4K',
    archetype: 'Caçador Sobrenatural',
    lore: 'Ele exorciza demônios direto na tela da TV junto com o padre. Já decorou todas as rezas em latim dos créditos iniciais e não teme assombração nem de madrugada com a luz apagada!',
    favoriteMovie: 'O Exorcista (1973) e um terço benzido com água benta.',
    passiveSkill: 'Água Benta Crítica: Imune a sustos baratos e jumpscares previsíveis.',
  },
  {
    id: 'cacador_trufas',
    className: 'Caçador de Trufas & Obras Obscuras',
    classIcon: '🍄',
    titleFlavor: 'Farejador de VHS Perdidos & Filmes Raros',
    archetype: 'Arqueólogo do Cinema',
    lore: 'Ele sabe onde encontrar os filmes mais underground e desconhecidos do planeta nas profundezas da internet, mas não dá a mínima garantia de qualidade a ninguém!',
    favoriteMovie: 'Jogos Mortais (2004) ou um trash romeno obscuro de 1982.',
    passiveSkill: 'Faro Subterrâneo: +50% de tolerância a filmes com menos de 100 avaliações no mundo.',
  },
  {
    id: 'sicario_telonas',
    className: 'Sicário das Telonas',
    classIcon: '⚡',
    titleFlavor: 'Velocista dos Créditos & Maratona Contínua',
    archetype: 'Velocista Ágil',
    lore: 'Ele é tão rápido que quando você começou a ler este texto ele já viu um filme, pulou a abertura e já foi pros pós-créditos! Sua vida é um speedrun ininterrupto de sessões.',
    favoriteMovie: 'Qualquer curta de animação ou John Wick sem respirar.',
    passiveSkill: 'Passo Sombrio: Consegue emendar 4 filmes em sequência num sábado chuvoso sem cansaço.',
  },
  {
    id: 'algoz_tomatometro',
    className: 'Algoz do Tomatômetro',
    classIcon: '🎯',
    titleFlavor: 'Julgamento Implacável do Selo Podre',
    archetype: 'Crítico Feroz',
    lore: 'Possui uma precisão visual e crítica fora do comum. Se o microfone do boom aparecer por 1 frame no canto superior da tela, a nota da obra despenca sem dó!',
    favoriteMovie: 'Pulp Fiction (1994) e uma caneta bic vermelha de crítico.',
    passiveSkill: 'Golpe Crítico: Avaliações com exatidão milimétrica e tolerância zero a clichês de roteiro.',
  },
  {
    id: 'arquimago_tempo',
    className: 'Arquimago da Máquina do Tempo',
    classIcon: '🧙‍♂️',
    titleFlavor: 'Manipulador do Continuum Espaço-Temporal',
    archetype: 'Historiador Cósmico',
    lore: 'Capaz de transitar de 1920 até os lançamentos de 2027 como se pegasse o metrô. Já viu clássicos mudos soviéticos e discute direção de arte clássica com a calma de um sábio ancião!',
    favoriteMovie: 'De Volta Para o Futuro (1985) ou Metrópolis (1927).',
    passiveSkill: 'Teleporte Cronológico: +50% de sabedoria ao encarar filmes gravados antes da invenção da cor.',
  },
  {
    id: 'paladino_oscar',
    className: 'Paladino do Santo Oscar',
    classIcon: '👑',
    titleFlavor: 'Guardião Implacável das Obras-Primas Intocáveis',
    archetype: 'Cavaleiro Dourado',
    lore: 'Ele só aperta o play se a fita vier abençoada por estatuetas douradas da Academia e nota pessoal 9.5+. Se o filme não for considerado arte suprema pela humanidade, ele nem clica!',
    favoriteMovie: 'O Poderoso Chefão (1972) com moldura dourada e água benta.',
    passiveSkill: 'Aura da Academia: +40% de pompa e solenidade em discussões cult de bar.',
  },
  {
    id: 'gladiador_ps5',
    className: 'Gladiador Platinador de Ferro',
    classIcon: '🛡️',
    titleFlavor: 'Colecionador de Notificações & Carrasco de Platina',
    archetype: 'Caçador de Conquistas',
    lore: 'Não assiste filmes apenas por lazer: assiste pelo som sagrado do troféu pipocando no canto da tela! Se faltar 1 filme para fechar a Trilogia ou a Categoria, ele não dorme.',
    favoriteMovie: 'Qualquer filme que conceda troféu Mítico ou Ouro no catálogo.',
    passiveSkill: 'Bexiga de Aço: Suporta maratonas de 4 horas sem pausar para ir ao banheiro.',
  },
  {
    id: 'andarilho_setima_arte',
    className: 'Andarilho da Sétima Arte',
    classIcon: '🎒',
    titleFlavor: 'Explorador Híbrido de Sessões & Camaleão Cinéfilo',
    archetype: 'Aventureiro Livre',
    lore: 'Um aventureiro versátil que transita entre blockbusters barulhentos e jóias cult escondidas sem preconceito algum.',
    favoriteMovie: 'Cinema Paradiso (1988).',
    passiveSkill: 'Mente Aberta: Aprecia desde filmes B de monstros até dramas europeus intimistas.',
  },
];

export function determineCharacterClass(attributes = [], totalStats = 0, movies = []) {
  const sorted = [...attributes].sort((a, b) => b.score - a.score);
  const primary = sorted[0]?.key || 'SOR';
  const secondary = sorted[1]?.key || 'FOR';
  const statMap = Object.fromEntries(attributes.map((a) => [a.key, a.score]));

  // Métricas extraídas do catálogo real
  let threeDecimalsCount = 0;
  let goreOrHorrorCount = 0;
  let dubladoCount = 0;
  let rareCountryCount = 0;
  let physicalBluRayOrDolbyCount = 0;
  let pirateOrAltSourceCount = 0;
  let actionImaxBoomCount = 0;
  let nightSessaoCorujaCount = 0;
  let demonExorcismCount = 0;
  let undergroundCount = 0;

  movies.forEach((m) => {
    const ur = Number(m.user_rating);
    const urStr = String(m.user_rating || '');
    if (urStr.includes('.') && urStr.split('.')[1]?.length >= 2) {
      threeDecimalsCount++;
    }

    const tags = (m.tags || []).map((t) => String(t).toLowerCase());
    const genres = (m.genres || []).map((g) => String(g).toLowerCase());
    const title = String(m.title || '').toLowerCase();
    const notes = String(m.notes || m.comments || m.review || '').toLowerCase();

    // Gore / Grindhouse
    if (
      tags.some((t) => t.includes('gore') || t.includes('slasher') || t.includes('canibal') || t.includes('zumbi') || t.includes('trash') || t.includes('mutilação')) ||
      (genres.includes('terror') && tags.some((t) => t.includes('sangue') || t.includes('visceral') || t.includes('morte'))) ||
      title.includes('evil dead') || title.includes('abc da morte') || title.includes('jogos mortais')
    ) {
      goreOrHorrorCount++;
    }

    // Herbert Richers (Dublagem)
    const audio = String(m.audio_track || m.audio || m.language || '').toLowerCase();
    if (audio.includes('dublado') || audio.includes('pt-br') || audio.includes('português') || audio.includes('portugues')) {
      dubladoCount++;
    }

    // Países raros fora de EUA, Brasil e Reino Unido
    const countries = (m.production_countries || m.countries || []).map((c) => String(c).toLowerCase());
    const isMainstreamCountry = countries.every((c) => c.includes('estados unidos') || c.includes('brasil') || c.includes('united states') || c.includes('reino unido'));
    if (!isMainstreamCountry && countries.length > 0) {
      rareCountryCount++;
    }

    // Cavaleiro do Laser Azul (Mídia física, 4K, Dolby Atmos, obras técnicas)
    if (
      notes.includes('blu-ray') || notes.includes('bluray') || notes.includes('mídia física') || notes.includes('4k') ||
      notes.includes('dolby') || notes.includes('steelbook') || (genres.includes('ação') && ur >= 9.0)
    ) {
      physicalBluRayOrDolbyCount++;
    }

    // Corsário dos Sete Mares (Nuvens, servidores, fontes alternativas)
    if (
      notes.includes('drive') || notes.includes('nuvem') || notes.includes('torrent') || notes.includes('stremio') ||
      notes.includes('servidor') || tags.includes('pirata') || title.includes('piratas do caribe')
    ) {
      pirateOrAltSourceCount++;
    }

    // Bárbaro do IMAX (Blockbusters, explosões, robôs)
    if (
      (genres.includes('ação') || genres.includes('ficção científica') || genres.includes('aventura')) &&
      (tags.some((t) => t.includes('explosão') || t.includes('robô') || t.includes('monstro') || t.includes('herói') || t.includes('super-herói') || t.includes('kaiju')) ||
      title.includes('godzilla') || title.includes('vingadores') || title.includes('kong') || title.includes('transformers'))
    ) {
      actionImaxBoomCount++;
    }

    // Vampiro da Madrugada (Suspense, Neo-Noir, Sessão Coruja, Drive, Taxi Driver)
    if (
      genres.includes('suspense') || genres.includes('crime') || tags.includes('noir') || tags.includes('neo-noir') ||
      notes.includes('madrugada') || notes.includes('coruja') || title.includes('taxi driver') || title.includes('drive')
    ) {
      nightSessaoCorujaCount++;
    }

    // Sacerdote Cinéfilo (Demônio, exorcismo, fantasma)
    if (
      tags.includes('demônio') || tags.includes('demonio') || tags.includes('exorcismo') || tags.includes('fantasma') ||
      (genres.includes('terror') && (tags.includes('sobrenatural') || tags.includes('bruxo'))) || title.includes('exorcista')
    ) {
      demonExorcismCount++;
    }

    // Caçador de Trufas (Obras raras com menos de 5000 votos)
    if (Number(m.vote_count) > 0 && Number(m.vote_count) < 5000) {
      undergroundCount++;
    }
  });

  // Graus de Evolução (Tiers)
  const currentTier = CHARACTER_TIERS.find((t) => totalStats >= t.min && totalStats <= t.max) || CHARACTER_TIERS[CHARACTER_TIERS.length - 1];

  // Cálculo de afinidade detalhado para as 16 classes
  const classAffinities = {
    monge_tres_casas: Math.min(100, (threeDecimalsCount > 0 ? 55 : 0) + (threeDecimalsCount * 8) + Math.round((statMap.SOR || 0) * 0.35)),
    carnical_grindhouse: Math.min(100, (goreOrHorrorCount * 22) + (statMap.AGI > 60 ? 15 : 0)),
    corsario_sete_mares: Math.min(100, 35 + (pirateOrAltSourceCount * 25) + Math.round((statMap.SOR || 0) * 0.2)),
    cavaleiro_laser_azul: Math.min(100, (physicalBluRayOrDolbyCount * 22) + Math.round((statMap.FOR || 0) * 0.35) + Math.round((statMap.AGI || 0) * 0.2)),
    bardo_herbert_richers: Math.min(100, (dubladoCount > 0 ? 50 : 20) + (dubladoCount * 12) + Math.round((statMap.INT || 0) * 0.2)),
    cartografo_195_reinos: Math.min(100, (rareCountryCount * 12) + Math.round((statMap.DES || 0) * 0.6)),
    barbaro_imax: Math.min(100, (actionImaxBoomCount * 12) + Math.round((statMap.AGI || 0) * 0.45) + (primary === 'AGI' ? 20 : 0)),
    vampiro_madrugada: Math.min(100, (nightSessaoCorujaCount * 10) + Math.round((statMap.SOR || 0) * 0.3) + 25),
    sacerdote_cinefilo: Math.min(100, (demonExorcismCount * 25) + (primary === 'INT' || secondary === 'INT' ? 20 : 0)),
    cacador_trufas: Math.min(100, (undergroundCount * 12) + Math.round((statMap.SOR || 0) * 0.4)),
    sicario_telonas: Math.min(100, Math.round((statMap.AGI || 0) * 0.8) + (primary === 'AGI' ? 20 : 0)),
    algoz_tomatometro: Math.min(100, Math.round((statMap.SOR || 0) * 0.6) + Math.round((statMap.FOR || 0) * 0.3)),
    arquimago_tempo: Math.min(100, Math.round((statMap.INT || 0) * 0.75) + (primary === 'INT' ? 25 : 0)),
    paladino_oscar: Math.min(100, Math.round((statMap.FOR || 0) * 0.75) + (primary === 'FOR' ? 25 : 0)),
    gladiador_ps5: Math.min(100, Math.round((statMap.VIT || 0) * 0.8) + (primary === 'VIT' ? 20 : 0)),
    andarilho_setima_arte: 40,
  };

  const rankedClasses = ALL_CINEMA_CLASSES.map((cls) => {
    const affinity = classAffinities[cls.id] || 30;
    return {
      ...cls,
      affinityPct: affinity,
    };
  }).sort((a, b) => b.affinityPct - a.affinityPct);

  const bestClass = rankedClasses[0] || ALL_CINEMA_CLASSES[0];

  return {
    ...bestClass,
    tierLabel: currentTier.label,
    tierGrade: currentTier.grade,
    nextTierName: currentTier.nextLabel,
    ptsToNextTier: currentTier.nextMin ? Math.max(0, currentTier.nextMin - totalStats) : 0,
    currentTierMin: currentTier.min,
    currentTierMax: currentTier.nextMin || currentTier.max,
    allClasses: rankedClasses,
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
  let pre2000Count = 0;
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
    if (Number(m.release_year) > 0 && Number(m.release_year) < 2000) pre2000Count++;

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

  // 6 Atributos RPG (0 a 99) baseados na campanha completa
  let allMinutes = 0;
  let allEpics = 0;
  let allOscars = 0;
  let allMasterpieces = 0;
  uniqueAll.forEach((m) => {
    const rt = Number(m.runtime) || 0;
    allMinutes += rt;
    if (rt >= 140) allEpics++;
    allOscars += (Number(m.oscar_wins) || 0) * 2 + (Number(m.oscar_nominations) || 0);
    if (Number(m.user_rating) >= 9.0) allMasterpieces++;
  });

  const allHours = allMinutes / 60;
  const tmConquered = activeXp?.sources?.timeMachine?.totalConqueredYears || 0;
  const countriesConquered = activeXp?.sources?.countries?.totalConqueredCount || 0;
  const trophiesUnlocked = activeXp?.sources?.trophies?.totalUnlocked || 0;
  const trophiesTotal = Math.max(1, activeXp?.sources?.trophies?.totalAvailable || 653);

  const vigorScore = Math.min(99, Math.round(Math.min(75, allHours / 8) + Math.min(24, allEpics * 0.8)));
  const wisdomScore = Math.min(99, Math.round((tmConquered / 108) * 85 + Math.min(14, pre2000Count * 0.5)));
  const exploreScore = Math.min(99, Math.round(Math.min(99, (countriesConquered / 80) * 99)));
  const precisionScore = Math.min(99, Math.round(Math.min(99, (uniqueAll.length / 300) * 65 + 34)));
  const trophyScore = Math.min(99, Math.round(Math.min(99, (trophiesUnlocked / trophiesTotal) * 120)));
  const prestigeScore = Math.min(99, Math.round(Math.min(60, allOscars * 0.35) + Math.min(39, allMasterpieces * 0.7)));

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
      desc: `${Math.round(allHours)}h jogadas • ${allEpics} épicos >140m`,
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
      desc: `${tmConquered}/108 anos conquistados`,
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
      desc: `${countriesConquered}/195 nações ONU`,
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
      desc: `${uniqueAll.length} obras catalogadas`,
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
      desc: `${trophiesUnlocked}/${trophiesTotal} conquistas`,
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
      desc: `${oscarWinsTotal} Oscars • ${allMasterpieces} notas 9+`,
    },
  ];

  const totalStatPoints = vigorScore + wisdomScore + exploreScore + precisionScore + trophyScore + prestigeScore;
  const characterClass = determineCharacterClass(rpgAttributes, totalStatPoints, uniqueAll);

  // Facções de Áudio (Dublado vs Legendado vs Outros)
  const audioMap = {
    Dublado: { count: 0, ratingSum: 0, ratingCount: 0 },
    Legendado: { count: 0, ratingSum: 0, ratingCount: 0 },
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
      : aud.includes('legend')
      ? 'Legendado'
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
  const dominantAudio =
    audioMap.Dublado.count >= audioMap.Legendado.count ? 'Facção Dublado 🎙️' : 'Facção Legendado 💬';

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
    audioMap.Dublado.count + audioMap.Legendado.count + audioMap.Outros.count
  );

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
      dublado: {
        ...audioMap.Dublado,
        pct: Math.round((audioMap.Dublado.count / totalAudioCount) * 100),
        avg: audioMap.Dublado.ratingCount > 0 ? (audioMap.Dublado.ratingSum / audioMap.Dublado.ratingCount).toFixed(2) : '—',
      },
      legendado: {
        ...audioMap.Legendado,
        pct: Math.round((audioMap.Legendado.count / totalAudioCount) * 100),
        avg: audioMap.Legendado.ratingCount > 0 ? (audioMap.Legendado.ratingSum / audioMap.Legendado.ratingCount).toFixed(2) : '—',
      },
      outros: {
        ...audioMap.Outros,
        pct: Math.round((audioMap.Outros.count / totalAudioCount) * 100),
      },
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
