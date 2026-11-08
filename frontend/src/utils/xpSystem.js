import { UN_COUNTRIES_195 } from '../data/unCountries195';
import { getCountryRarityTier } from '../data/countryRarityTiers';
import { evaluateTrophiesClientSide } from './trophyEngineClient';

export const XP_PER_MOVIE = 10;

export const TROPHY_XP_BY_TIER = {
  bronze: 15,
  silver: 25,
  epic: 40,
  gold: 70,
  mythic: 105,
  platinum: 1000,
};

export const COUNTRY_XP_BY_RARITY = {
  common: 30,
  rare: 45,
  epic: 65,
  legendary: 100,
  mythic: 300,
};

export const COUNTRY_RARITY_META = {
  common: { label: 'Comum', pluralLabel: 'Comuns', icon: '🟢', xpEach: 30, color: 'text-emerald-300', badge: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300' },
  rare: { label: 'Raro', pluralLabel: 'Raros', icon: '🔵', xpEach: 45, color: 'text-sky-300', badge: 'bg-sky-500/15 border-sky-400/40 text-sky-300' },
  epic: { label: 'Épico', pluralLabel: 'Épicos', icon: '💜', xpEach: 65, color: 'text-purple-300', badge: 'bg-purple-500/15 border-purple-400/40 text-purple-300' },
  legendary: { label: 'Lendário', pluralLabel: 'Lendários', icon: '🥇', xpEach: 100, color: 'text-amber-300', badge: 'bg-amber-500/15 border-amber-400/45 text-amber-300' },
  mythic: { label: 'Mítico', pluralLabel: 'Míticos', icon: '💎', xpEach: 300, color: 'text-rose-300', badge: 'bg-rose-500/20 border-rose-500/50 text-rose-300' },
};

export const TROPHY_TIER_META = {
  platinum: { label: 'Platina', icon: '🏆', xpEach: 1000, color: 'text-blue-200', badge: 'bg-blue-950/60 border-blue-300/50 text-blue-200' },
  mythic: { label: 'Mítico', icon: '💎', xpEach: 105, color: 'text-red-300', badge: 'bg-red-950/50 border-red-500/50 text-red-300' },
  gold: { label: 'Ouro', icon: '🥇', xpEach: 70, color: 'text-amber-300', badge: 'bg-amber-500/20 border-amber-400/50 text-amber-300' },
  epic: { label: 'Épico', icon: '💜', xpEach: 40, color: 'text-purple-300', badge: 'bg-purple-900/40 border-purple-500/50 text-purple-300' },
  silver: { label: 'Prata', icon: '🥈', xpEach: 25, color: 'text-zinc-200', badge: 'bg-zinc-700/40 border-zinc-400/50 text-zinc-100' },
  bronze: { label: 'Bronze', icon: '🥉', xpEach: 15, color: 'text-orange-300', badge: 'bg-[#CD7F32]/20 border-[#CD7F32]/50 text-[#E5A663]' },
};

export const LEVEL_TITLE_RANGES = [
  { minLevel: 1, maxLevel: 4, title: 'Turista da Sessão da Tarde' },
  { minLevel: 5, maxLevel: 9, title: 'Sobrevivente das Legendas do YouTube' },
  { minLevel: 10, maxLevel: 14, title: 'Freguês da Pipoca de R$ 60 Reais' },
  { minLevel: 15, maxLevel: 19, title: 'Vamos Jogar um Jogo?' },
  { minLevel: 20, maxLevel: 24, title: 'Quantas Armadilhas Você Fez para Chegar Aqui?' },
  { minLevel: 25, maxLevel: 29, title: 'Você Já Deve Ter Visto Bastante a Mulher do Paul W.S. Anderson!' },
  { minLevel: 30, maxLevel: 34, title: 'Advogado do Bill Finger Contra o Bob Kane' },
  { minLevel: 35, maxLevel: 39, title: 'Fiscal de Câmera Lenta do Zack Snyder' },
  { minLevel: 40, maxLevel: 44, title: 'Dublê de Explosão do Michael Bay' },
  { minLevel: 45, maxLevel: 49, title: 'Você Tem Tempo para Trabalhar?!' },
  { minLevel: 50, maxLevel: 54, title: 'Sócio Majoritário da Blumhouse e da A24' },
  { minLevel: 55, maxLevel: 59, title: 'Mais Troféus que Jogo Exclusivo de PS5!' },
  { minLevel: 60, maxLevel: 64, title: 'Inimigo Número 1 do Botão de Pause' },
  { minLevel: 65, maxLevel: 69, title: 'Membro Secreto do Invocaversus' },
  { minLevel: 70, maxLevel: 74, title: 'Juiz Implacável do 9.800 (10 Só Deus!)' },
  { minLevel: 75, maxLevel: 79, title: 'Dono do Tabuleiro de War dos 195 Países' },
  { minLevel: 80, maxLevel: 84, title: 'Nem o Diretor Viu Tantos Filmes Quanto Você!' },
  { minLevel: 85, maxLevel: 89, title: 'A Cadeira do Sofá Já Tem o Formato do Seu Corpo' },
  { minLevel: 90, maxLevel: 94, title: 'Chefe Final da Máfia de Hollywood' },
  { minLevel: 95, maxLevel: 99, title: 'Platinador Supremo da PSN Cinematográfica' },
  { minLevel: 100, maxLevel: null, title: 'A Entidade Absoluta do Cinema (Zerou a Vida Social!)' },
];

export function getLevelTitle(level) {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel >= 100) {
    return LEVEL_TITLE_RANGES[LEVEL_TITLE_RANGES.length - 1].title;
  }
  const found = LEVEL_TITLE_RANGES.find(
    (r) => safeLevel >= r.minLevel && (r.maxLevel === null || safeLevel <= r.maxLevel)
  );
  return found ? found.title : LEVEL_TITLE_RANGES[0].title;
}

export function getNextTitleMilestone(level) {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel >= 100) return null;
  const nextMilestoneLevel = safeLevel < 5 ? 5 : Math.floor(safeLevel / 5) * 5 + 5;
  return {
    level: nextMilestoneLevel,
    title: getLevelTitle(nextMilestoneLevel),
  };
}

export function getXpRequiredForLevelStep(level) {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  return 300 + (safeLevel - 1) * 5;
}

export function calculateLevelFromXp(rawTotalXp) {
  const totalXp = Math.max(0, Math.floor(rawTotalXp || 0));
  let level = 1;
  let accumulatedXp = 0;

  while (true) {
    const stepXp = getXpRequiredForLevelStep(level);
    if (totalXp >= accumulatedXp + stepXp) {
      accumulatedXp += stepXp;
      level++;
    } else {
      const currentLevelBaseXp = accumulatedXp;
      const nextLevelThresholdXp = accumulatedXp + stepXp;
      const xpInCurrentLevel = totalXp - currentLevelBaseXp;
      const xpNeededForNextLevel = stepXp;
      const xpRemaining = nextLevelThresholdXp - totalXp;
      const progressPercentage =
        stepXp > 0 ? Math.min(100, Math.round((xpInCurrentLevel / stepXp) * 1000) / 10) : 0;

      return {
        level,
        levelTitle: getLevelTitle(level),
        currentLevelBaseXp,
        nextLevelThresholdXp,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        xpRemaining,
        progressPercentage,
        nextTitleMilestone: getNextTitleMilestone(level),
      };
    }
  }
}

const cleanStr = (str) =>
  str
    ? String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : '';

export function isMovieCoproduction(m) {
  const coprodLen = Array.isArray(m?.coproductionCountries) ? m.coproductionCountries.length : 0;
  const rawLen = Array.isArray(m?.countries) ? m.countries.length : 0;
  return coprodLen > 1 || (rawLen > 1 && coprodLen >= 1);
}

/**
 * Fallback client-side completo para calcular o XP caso o backend esteja offline ou carregando.
 */
export function calculateClientXpStatus(movies = [], trophiesOverride = null, localChallengeState = null) {
  let savedLocal = localChallengeState;
  if (!savedLocal && typeof window !== 'undefined') {
    try {
      savedLocal = JSON.parse(localStorage.getItem('world_challenge_195_offline') || '{}');
    } catch {
      savedLocal = {};
    }
  }
  const manualOrigins = savedLocal?.origins || {};

  const unLookup = new Map();
  const unByCode = new Map();
  const rarityTotals = { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 };

  UN_COUNTRIES_195.forEach((c) => {
    unByCode.set(c.code, c);
    unLookup.set(cleanStr(c.code), c.code);
    unLookup.set(cleanStr(c.iso3), c.code);
    unLookup.set(cleanStr(c.name), c.code);
    (c.aliases || []).forEach((al) => unLookup.set(cleanStr(al), c.code));
    const r = c.rarityTier || getCountryRarityTier(c.code);
    rarityTotals[r] = (rarityTotals[r] || 0) + 1;
  });

  // Deduplica filmes únicos
  const uniqueMoviesMap = new Map();
  movies.forEach((m) => {
    const mid = m.movie_id || m.id || `${m.title}_${m.release_year || ''}`;
    if (!uniqueMoviesMap.has(mid)) {
      uniqueMoviesMap.set(mid, m);
    }
  });

  const uniqueMovies = Array.from(uniqueMoviesMap.values());
  const moviesCount = uniqueMovies.length;
  const moviesXp = moviesCount * XP_PER_MOVIE;

  let pendingCoproductionsCount = 0;
  const conqueredCodes = {};

  uniqueMovies.forEach((m) => {
    const mid = m.movie_id || m.id;
    const rawCountries = Array.isArray(m.countries) ? m.countries : [];
    const resolvedCodes = [];
    const seen = new Set();
    rawCountries.forEach((raw) => {
      const u = unLookup.get(cleanStr(raw));
      if (u && !seen.has(u)) {
        seen.add(u);
        resolvedCodes.push(u);
      }
    });

    const isCoprod = resolvedCodes.length > 1 || (rawCountries.length > 1 && resolvedCodes.length >= 1);
    const manualCode = (mid && manualOrigins[mid]) || (m.originMode === 'manual' ? m.primaryCountryCode : null);

    if (isCoprod && !manualCode) {
      pendingCoproductionsCount += 1;
      return; // REGRA DE OURO: coprodução não validada NÃO gera XP de país!
    }

    const activeCode = (manualCode || resolvedCodes[0] || '').toLowerCase();
    if (activeCode && unByCode.has(activeCode) && !conqueredCodes[activeCode]) {
      const def = unByCode.get(activeCode);
      const rarity = def.rarityTier || getCountryRarityTier(activeCode);
      conqueredCodes[activeCode] = {
        name: def.name,
        rarity,
        xp: COUNTRY_XP_BY_RARITY[rarity] || 30,
      };
    }
  });

  const byRarity = {
    common: { ...COUNTRY_RARITY_META.common, count: 0, total: rarityTotals.common, totalXp: 0 },
    rare: { ...COUNTRY_RARITY_META.rare, count: 0, total: rarityTotals.rare, totalXp: 0 },
    epic: { ...COUNTRY_RARITY_META.epic, count: 0, total: rarityTotals.epic, totalXp: 0 },
    legendary: { ...COUNTRY_RARITY_META.legendary, count: 0, total: rarityTotals.legendary, totalXp: 0 },
    mythic: { ...COUNTRY_RARITY_META.mythic, count: 0, total: rarityTotals.mythic, totalXp: 0 },
  };

  let countriesXp = 0;
  Object.values(conqueredCodes).forEach((info) => {
    byRarity[info.rarity].count += 1;
    byRarity[info.rarity].totalXp += info.xp;
    countriesXp += info.xp;
  });

  const trophiesList = Array.isArray(trophiesOverride)
    ? trophiesOverride
    : evaluateTrophiesClientSide(movies)?.trophies || [];

  const byTier = {
    platinum: { ...TROPHY_TIER_META.platinum, count: 0, total: 0, totalXp: 0 },
    mythic: { ...TROPHY_TIER_META.mythic, count: 0, total: 0, totalXp: 0 },
    gold: { ...TROPHY_TIER_META.gold, count: 0, total: 0, totalXp: 0 },
    epic: { ...TROPHY_TIER_META.epic, count: 0, total: 0, totalXp: 0 },
    silver: { ...TROPHY_TIER_META.silver, count: 0, total: 0, totalXp: 0 },
    bronze: { ...TROPHY_TIER_META.bronze, count: 0, total: 0, totalXp: 0 },
  };

  const unlockedIds = {};
  let trophiesXp = 0;
  let totalUnlocked = 0;

  trophiesList.forEach((t) => {
    const tier = String(t.tier || 'bronze').toLowerCase();
    if (!byTier[tier]) return;
    byTier[tier].total += 1;
    if (t.is_unlocked) {
      const xpVal = TROPHY_XP_BY_TIER[tier] || 15;
      byTier[tier].count += 1;
      byTier[tier].totalXp += xpVal;
      trophiesXp += xpVal;
      totalUnlocked += 1;
      unlockedIds[t.id] = {
        title: t.title,
        tier,
        xp: xpVal,
      };
    }
  });

  const totalXp = moviesXp + countriesXp + trophiesXp;
  const levelInfo = calculateLevelFromXp(totalXp);

  return {
    totalXp,
    ...levelInfo,
    sources: {
      movies: {
        count: moviesCount,
        xpPerMovie: XP_PER_MOVIE,
        totalXp: moviesXp,
      },
      countries: {
        totalConqueredCount: Object.keys(conqueredCodes).length,
        pendingCoproductionsCount,
        conqueredCodes,
        byRarity,
        totalXp: countriesXp,
      },
      trophies: {
        totalUnlocked,
        totalAvailable: trophiesList.length,
        unlockedIds,
        byTier,
        totalXp: trophiesXp,
      },
    },
  };
}

export function computeXpGainEvent(prev, next) {
  if (!prev || !next) return null;
  const gainedXp = next.totalXp - prev.totalXp;
  if (gainedXp <= 0) return null;

  const tags = [];

  const movieDiff = (next.sources?.movies?.count || 0) - (prev.sources?.movies?.count || 0);
  if (movieDiff > 0) {
    const mXp = movieDiff * XP_PER_MOVIE;
    tags.push({
      type: 'movie',
      icon: '🎬',
      label: movieDiff === 1 ? `+${mXp} XP Filme` : `+${mXp} XP Filmes (${movieDiff})`,
      xp: mXp,
    });
  }

  const prevCountries = prev.sources?.countries?.conqueredCodes || {};
  const nextCountries = next.sources?.countries?.conqueredCodes || {};
  const newCountries = [];
  Object.entries(nextCountries).forEach(([code, info]) => {
    if (!prevCountries[code]) {
      newCountries.push({ code, ...info });
    }
  });

  if (newCountries.length > 0 && newCountries.length <= 2) {
    newCountries.forEach((c) => {
      const meta = COUNTRY_RARITY_META[c.rarity] || COUNTRY_RARITY_META.common;
      tags.push({
        type: 'country',
        icon: meta.icon,
        label: `+${c.xp} XP País ${meta.label} (${c.name})`,
        xp: c.xp,
        rarityOrTier: c.rarity,
      });
    });
  } else if (newCountries.length > 2) {
    ['mythic', 'legendary', 'epic', 'rare', 'common'].forEach((r) => {
      const group = newCountries.filter((c) => c.rarity === r);
      if (group.length > 0) {
        const meta = COUNTRY_RARITY_META[r];
        const sumXp = group.reduce((acc, x) => acc + x.xp, 0);
        tags.push({
          type: 'country',
          icon: meta.icon,
          label:
            group.length === 1
              ? `+${sumXp} XP País ${meta.label} (${group[0].name})`
              : `+${sumXp} XP ${group.length} Países ${meta.pluralLabel}`,
          xp: sumXp,
          rarityOrTier: r,
        });
      }
    });
  }

  const prevTrophies = prev.sources?.trophies?.unlockedIds || {};
  const nextTrophies = next.sources?.trophies?.unlockedIds || {};
  const newTrophies = [];
  Object.entries(nextTrophies).forEach(([id, info]) => {
    if (!prevTrophies[id]) {
      newTrophies.push({ id, ...info });
    }
  });

  if (newTrophies.length > 0) {
    ['platinum', 'mythic', 'gold', 'epic', 'silver', 'bronze'].forEach((tr) => {
      const group = newTrophies.filter((t) => t.tier === tr);
      if (group.length > 0) {
        const meta = TROPHY_TIER_META[tr];
        const sumXp = group.reduce((acc, x) => acc + x.xp, 0);
        const fmtSum = sumXp.toLocaleString('pt-BR');
        tags.push({
          type: 'trophy',
          icon: meta.icon,
          label:
            group.length === 1
              ? `+${fmtSum} XP Troféu ${meta.label}`
              : `+${fmtSum} XP ${group.length} Troféus ${meta.label}`,
          xp: sumXp,
          rarityOrTier: tr,
        });
      }
    });
  }

  if (tags.length === 0) {
    tags.push({
      type: 'movie',
      icon: '✨',
      label: `+${gainedXp.toLocaleString('pt-BR')} XP Catálogo`,
      xp: gainedXp,
    });
  }

  return {
    gainedXp,
    prevTotalXp: prev.totalXp,
    nextTotalXp: next.totalXp,
    prevLevel: prev.level,
    newLevel: next.level,
    prevPercentage: prev.progressPercentage,
    newPercentage: next.progressPercentage,
    leveledUp: next.level > prev.level,
    levelsGained: Math.max(0, next.level - prev.level),
    prevTitle: prev.levelTitle,
    newTitle: next.levelTitle,
    titleChanged: prev.levelTitle !== next.levelTitle,
    xpInCurrentLevel: next.xpInCurrentLevel,
    xpNeededForNextLevel: next.xpNeededForNextLevel,
    xpRemaining: next.xpRemaining,
    tags,
  };
}

/**
 * Gerenciamento de Buffer de XP sincronizado com o Sistema de Troféus PS5:
 * Quando troféus estão sendo exibidos na tela ou na fila de espera, o ganho de XP
 * é retido e somado, disparando a barra de XP apenas quando TODAS as notificações
 * de troféu tiverem terminado e saído da tela.
 */
let isTrophyActiveFlag = false;
let activeTrophyToastsCount = 0;
let bufferedXpEvent = null;
let bufferedXpStatus = null;
let fallbackFlushTimer = null;

export function isTrophyToastActive() {
  return isTrophyActiveFlag || activeTrophyToastsCount > 0;
}

export function notifyTrophiesStarted() {
  isTrophyActiveFlag = true;
  activeTrophyToastsCount = Math.max(activeTrophyToastsCount, 1);

  // Timer de segurança: caso nenhuma notificação seja removida por erro inesperado em 35s, libera o XP
  if (fallbackFlushTimer) clearTimeout(fallbackFlushTimer);
  fallbackFlushTimer = setTimeout(() => {
    if (bufferedXpEvent) {
      console.warn('[XP System] Fallback safety timer acionado para liberar XP pendente.');
      flushBufferedXpGain();
    }
  }, 35000);
}

export function notifyTrophiesCleared() {
  isTrophyActiveFlag = false;
  activeTrophyToastsCount = 0;
  if (fallbackFlushTimer) {
    clearTimeout(fallbackFlushTimer);
    fallbackFlushTimer = null;
  }
  flushBufferedXpGain();
}

/**
 * Mescla dois eventos de ganho de XP (ex: XP de filme + XP de múltiplos troféus desbloqueados em fila)
 * garantindo que o progresso inicial (prev) e o final (new) sejam preservados com a soma total do XP ganho.
 */
export function mergeXpGainEvents(baseEvent, incomingEvent) {
  if (!baseEvent) return incomingEvent;
  if (!incomingEvent) return baseEvent;

  const gainedXp = (baseEvent.gainedXp || 0) + (incomingEvent.gainedXp || 0);
  const prevTotalXp = baseEvent.prevTotalXp ?? incomingEvent.prevTotalXp;
  const nextTotalXp = incomingEvent.nextTotalXp ?? (prevTotalXp + gainedXp);
  const prevLevel = baseEvent.prevLevel ?? incomingEvent.prevLevel;
  const newLevel = incomingEvent.newLevel ?? baseEvent.newLevel;
  const prevPercentage = baseEvent.prevPercentage ?? incomingEvent.prevPercentage;
  const newPercentage = incomingEvent.newPercentage ?? baseEvent.newPercentage;
  const leveledUp = newLevel > prevLevel || baseEvent.leveledUp || incomingEvent.leveledUp;
  const levelsGained = Math.max(0, newLevel - prevLevel);
  const prevTitle = baseEvent.prevTitle || incomingEvent.prevTitle;
  const newTitle = incomingEvent.newTitle || baseEvent.newTitle;
  const titleChanged = prevTitle !== newTitle;

  // Mesclagem inteligente de tags de XP
  const mergedTags = [...(baseEvent.tags || [])];
  (incomingEvent.tags || []).forEach((inTag) => {
    const existingIndex = mergedTags.findIndex(
      (t) => t.type === inTag.type && (t.rarityOrTier === inTag.rarityOrTier || (!t.rarityOrTier && !inTag.rarityOrTier))
    );
    if (existingIndex >= 0) {
      const existing = mergedTags[existingIndex];
      const sumXp = (existing.xp || 0) + (inTag.xp || 0);
      let label = inTag.label;
      if (inTag.type === 'movie') {
        label = `+${sumXp.toLocaleString('pt-BR')} XP Catálogo`;
      } else if (inTag.type === 'trophy') {
        const tierName = inTag.rarityOrTier ? TROPHY_TIER_META[inTag.rarityOrTier]?.label || inTag.rarityOrTier : 'Troféu';
        label = `+${sumXp.toLocaleString('pt-BR')} XP Troféus ${tierName}`;
      } else if (inTag.type === 'country') {
        label = `+${sumXp.toLocaleString('pt-BR')} XP Países Desafio 195`;
      }
      mergedTags[existingIndex] = {
        ...existing,
        xp: sumXp,
        label,
      };
    } else {
      mergedTags.push({ ...inTag });
    }
  });

  return {
    gainedXp,
    prevTotalXp,
    nextTotalXp,
    prevLevel,
    newLevel,
    prevPercentage,
    newPercentage,
    leveledUp,
    levelsGained,
    prevTitle,
    newTitle,
    titleChanged,
    xpInCurrentLevel: incomingEvent.xpInCurrentLevel ?? baseEvent.xpInCurrentLevel,
    xpNeededForNextLevel: incomingEvent.xpNeededForNextLevel ?? baseEvent.xpNeededForNextLevel,
    xpRemaining: incomingEvent.xpRemaining ?? baseEvent.xpRemaining,
    tags: mergedTags,
  };
}

export function flushBufferedXpGain() {
  if (!bufferedXpEvent) {
    if (bufferedXpStatus) {
      dispatchXpStatusUpdate(bufferedXpStatus);
      bufferedXpStatus = null;
    }
    return;
  }

  const eventToDispatch = bufferedXpEvent;
  const statusToDispatch = bufferedXpStatus;
  bufferedXpEvent = null;
  bufferedXpStatus = null;

  if (statusToDispatch) {
    dispatchXpStatusUpdate(statusToDispatch);
  }
  if (eventToDispatch && eventToDispatch.gainedXp > 0) {
    window.dispatchEvent(new CustomEvent('cine-xp-gain-toast', { detail: eventToDispatch }));
  }
}

/**
 * Eventos globais de sincronização instantânea de XP entre todas as páginas e Header
 */
export function dispatchXpStatusUpdate(xpStatus) {
  if (typeof window === 'undefined' || !xpStatus) return;
  window.dispatchEvent(new CustomEvent('cine-xp-status-sync', { detail: xpStatus }));
}

export function triggerXPGainToast(xpGainEvent, updatedXpStatus = null, forceImmediate = false) {
  if (typeof window === 'undefined') return;

  if (!xpGainEvent || !(xpGainEvent.gainedXp > 0)) {
    if (updatedXpStatus) {
      dispatchXpStatusUpdate(updatedXpStatus);
    }
    return;
  }

  // Se o sistema de troféus estiver ativo (notificações na tela ou na fila de espera)
  // e não foi forçado um disparo explícito:
  // Retém e soma o XP no buffer. A barra de XP só aparecerá
  // quando TODAS as notificações de troféu terminarem e sumirem da tela!
  if (!forceImmediate && isTrophyToastActive()) {
    bufferedXpEvent = mergeXpGainEvents(bufferedXpEvent, xpGainEvent);
    if (updatedXpStatus) {
      bufferedXpStatus = updatedXpStatus;
    }
    return;
  }

  // Se não há troféus em exibição ou fila, dispara a barra de XP imediatamente
  if (updatedXpStatus) {
    dispatchXpStatusUpdate(updatedXpStatus);
  }
  window.dispatchEvent(new CustomEvent('cine-xp-gain-toast', { detail: xpGainEvent }));
}
