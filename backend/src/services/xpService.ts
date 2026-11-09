import { query } from '../config/database';
import { TrophyTier } from '../data/trophyDefinitions';
import { CountryRarityTier, getCountryRarityTier, UN_COUNTRIES_195 } from '../data/unCountries195';
import { buildWorldChallengePayload } from './worldChallengeService';
import {
  computeTimeMachineXpSummary,
  TIME_MACHINE_RARITY_META,
  TimeMachineRarityTier,
  TimeMachineXpSummary,
} from './timeMachineService';
import type { EvaluatedTrophy, TrophiesSummaryResponse } from './trophyService';

export type WorldChallengePayload = Awaited<ReturnType<typeof buildWorldChallengePayload>>;

export const XP_PER_MOVIE = 10;

export const TROPHY_XP_BY_TIER: Record<TrophyTier, number> = {
  bronze: 15,
  silver: 25,
  epic: 40,
  gold: 70,
  mythic: 105,
  platinum: 1000,
};

export const COUNTRY_XP_BY_RARITY: Record<CountryRarityTier, number> = {
  common: 30,
  rare: 45,
  epic: 65,
  legendary: 100,
  mythic: 300,
};

export const COUNTRY_RARITY_META: Record<
  CountryRarityTier,
  { label: string; pluralLabel: string; icon: string; xpEach: number }
> = {
  common: { label: 'Comum', pluralLabel: 'Comuns', icon: '🟢', xpEach: 30 },
  rare: { label: 'Raro', pluralLabel: 'Raros', icon: '🔵', xpEach: 45 },
  epic: { label: 'Épico', pluralLabel: 'Épicos', icon: '💜', xpEach: 65 },
  legendary: { label: 'Lendário', pluralLabel: 'Lendários', icon: '🥇', xpEach: 100 },
  mythic: { label: 'Mítico', pluralLabel: 'Míticos', icon: '💎', xpEach: 300 },
};

export const TROPHY_TIER_META: Record<
  TrophyTier,
  { label: string; icon: string; xpEach: number }
> = {
  platinum: { label: 'Platina', icon: '🏆', xpEach: 1000 },
  mythic: { label: 'Mítico', icon: '💎', xpEach: 105 },
  gold: { label: 'Ouro', icon: '🥇', xpEach: 70 },
  epic: { label: 'Épico', icon: '💜', xpEach: 40 },
  silver: { label: 'Prata', icon: '🥈', xpEach: 25 },
  bronze: { label: 'Bronze', icon: '🥉', xpEach: 15 },
};

export interface LevelTitleRange {
  minLevel: number;
  maxLevel: number | null;
  title: string;
}

export const LEVEL_TITLE_RANGES: LevelTitleRange[] = [
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

export function getLevelTitle(level: number): string {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel >= 100) {
    return LEVEL_TITLE_RANGES[LEVEL_TITLE_RANGES.length - 1].title;
  }
  const found = LEVEL_TITLE_RANGES.find(
    (r) => safeLevel >= r.minLevel && (r.maxLevel === null || safeLevel <= r.maxLevel)
  );
  return found ? found.title : LEVEL_TITLE_RANGES[0].title;
}

export function getNextTitleMilestone(level: number): { level: number; title: string } | null {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel >= 100) return null;
  const nextMilestoneLevel = safeLevel < 5 ? 5 : Math.floor(safeLevel / 5) * 5 + 5;
  return {
    level: nextMilestoneLevel,
    title: getLevelTitle(nextMilestoneLevel),
  };
}

/**
 * Curva equilibrada de XP:
 * Nível 1 -> 2 exige 300 XP, com leve progressão linear de +5 XP por nível (300, 305, 310, 315...).
 */
export function getXpRequiredForLevelStep(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  return 300 + (safeLevel - 1) * 5;
}

export interface LevelProgressInfo {
  level: number;
  levelTitle: string;
  currentLevelBaseXp: number;
  nextLevelThresholdXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  xpRemaining: number;
  progressPercentage: number;
  nextTitleMilestone: { level: number; title: string } | null;
}

export function calculateLevelFromXp(rawTotalXp: number): LevelProgressInfo {
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

export interface UserXpStatus extends LevelProgressInfo {
  totalXp: number;
  sources: {
    movies: {
      count: number;
      xpPerMovie: number;
      totalXp: number;
    };
    countries: {
      totalConqueredCount: number;
      pendingCoproductionsCount: number;
      conqueredCodes: Record<string, { name: string; rarity: CountryRarityTier; xp: number }>;
      byRarity: Record<
        CountryRarityTier,
        { label: string; icon: string; count: number; total: number; xpEach: number; totalXp: number }
      >;
      totalXp: number;
    };
    trophies: {
      totalUnlocked: number;
      totalAvailable: number;
      unlockedIds: Record<string, { title: string; tier: TrophyTier; xp: number }>;
      byTier: Record<
        TrophyTier,
        { label: string; icon: string; count: number; total: number; xpEach: number; totalXp: number }
      >;
      totalXp: number;
    };
    timeMachine: TimeMachineXpSummary;
  };
}

export interface XpGainTag {
  type: 'movie' | 'country' | 'trophy' | 'time_machine' | 'time_decade';
  icon: string;
  label: string;
  xp: number;
  rarityOrTier?: string;
}

export interface TimeMachineUnlockNotification {
  id: string;
  kind: 'year' | 'decade';
  year?: number;
  decadeId?: string;
  decadeLabel?: string;
  rarity: TimeMachineRarityTier | 'decade_relic';
  xp: number;
  movieTitle?: string;
  posterUrl?: string | null;
  userRating?: number;
}

export interface XpStatGain {
  key: 'AGI' | 'INT' | 'DES' | 'SOR' | 'VIT' | 'FOR';
  icon: string;
  label: string;
  gain?: number;
}

export interface XpGainEvent {
  gainedXp: number;
  prevTotalXp: number;
  nextTotalXp: number;
  prevLevel: number;
  newLevel: number;
  prevPercentage: number;
  newPercentage: number;
  leveledUp: boolean;
  levelsGained: number;
  prevTitle: string;
  newTitle: string;
  titleChanged: boolean;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  xpRemaining: number;
  tags: XpGainTag[];
  timeMachineUnlocks?: TimeMachineUnlockNotification[];
  statGains?: XpStatGain[];
  unlockedClass?: { name: string; icon?: string; flavor?: string } | null;
}

function isMovieCoproduction(m: any): boolean {
  const coprodLen = Array.isArray(m?.coproductionCountries) ? m.coproductionCountries.length : 0;
  const rawLen = Array.isArray(m?.countries) ? m.countries.length : 0;
  return coprodLen > 1 || (rawLen > 1 && coprodLen >= 1);
}

/**
 * Constrói o status completo de XP a partir dos dados do Desafio 195 e da lista de Troféus.
 * Respeita estritamente a Regra de Ouro da Central de Curadoria de Coproduções!
 */
export function buildUserXpStatus(
  worldData: WorldChallengePayload,
  trophiesList: Array<{ id: string; title: string; tier: TrophyTier; is_unlocked: boolean }>
): UserXpStatus {
  // 1. XP por Filmes Cadastrados (cada filme único = +10 XP)
  const moviesCount = Array.isArray(worldData.catalogMovies) ? worldData.catalogMovies.length : 0;
  const moviesXp = moviesCount * XP_PER_MOVIE;

  // Contagem de coproduções aguardando curadoria manual
  const pendingCoproductionsCount = (worldData.catalogMovies || []).filter(
    (m) => isMovieCoproduction(m) && m.originMode !== 'manual'
  ).length;

  // 2. XP por Países Conquistados no Desafio 195 (por raridade)
  // REGRA DE OURO: um país só gera XP se possuir ao menos 1 filme de país único (!isCoproduction)
  // OU uma coprodução validada manualmente na Central de Curadoria (originMode === 'manual')!
  const rarityTotals: Record<CountryRarityTier, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };
  UN_COUNTRIES_195.forEach((c) => {
    const r = c.rarityTier || getCountryRarityTier(c.code);
    rarityTotals[r] = (rarityTotals[r] || 0) + 1;
  });

  const byRarity: UserXpStatus['sources']['countries']['byRarity'] = {
    common: { ...COUNTRY_RARITY_META.common, count: 0, total: rarityTotals.common, totalXp: 0 },
    rare: { ...COUNTRY_RARITY_META.rare, count: 0, total: rarityTotals.rare, totalXp: 0 },
    epic: { ...COUNTRY_RARITY_META.epic, count: 0, total: rarityTotals.epic, totalXp: 0 },
    legendary: { ...COUNTRY_RARITY_META.legendary, count: 0, total: rarityTotals.legendary, totalXp: 0 },
    mythic: { ...COUNTRY_RARITY_META.mythic, count: 0, total: rarityTotals.mythic, totalXp: 0 },
  };

  const conqueredCodes: Record<string, { name: string; rarity: CountryRarityTier; xp: number }> = {};
  let countriesXp = 0;

  for (const country of worldData.countries || []) {
    if (country.status !== 'conquered') continue;
    const validRepresentatives = (country.candidates || []).filter(
      (m) => !isMovieCoproduction(m) || m.originMode === 'manual'
    );
    if (validRepresentatives.length === 0) continue;

    const rarity: CountryRarityTier = country.rarityTier || getCountryRarityTier(country.code);
    const xpVal = COUNTRY_XP_BY_RARITY[rarity] || 30;
    byRarity[rarity].count += 1;
    byRarity[rarity].totalXp += xpVal;
    countriesXp += xpVal;
    conqueredCodes[country.code.toLowerCase()] = {
      name: country.name,
      rarity,
      xp: xpVal,
    };
  }

  const totalConqueredCount = Object.keys(conqueredCodes).length;

  // 3. XP por Troféus Conquistados
  const byTier: UserXpStatus['sources']['trophies']['byTier'] = {
    platinum: { ...TROPHY_TIER_META.platinum, count: 0, total: 0, totalXp: 0 },
    mythic: { ...TROPHY_TIER_META.mythic, count: 0, total: 0, totalXp: 0 },
    gold: { ...TROPHY_TIER_META.gold, count: 0, total: 0, totalXp: 0 },
    epic: { ...TROPHY_TIER_META.epic, count: 0, total: 0, totalXp: 0 },
    silver: { ...TROPHY_TIER_META.silver, count: 0, total: 0, totalXp: 0 },
    bronze: { ...TROPHY_TIER_META.bronze, count: 0, total: 0, totalXp: 0 },
  };

  const unlockedIds: Record<string, { title: string; tier: TrophyTier; xp: number }> = {};
  let trophiesXp = 0;
  let totalUnlocked = 0;

  for (const t of trophiesList || []) {
    const tier = (String(t.tier || 'bronze').toLowerCase() as TrophyTier) || 'bronze';
    if (!byTier[tier]) continue;
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
  }

  // 4. XP da Máquina do Tempo (Anos Conquistados + Bônus de Décadas Completas)
  const timeMachineSummary = computeTimeMachineXpSummary(worldData.catalogMovies || []);

  const totalXp = moviesXp + countriesXp + trophiesXp + timeMachineSummary.totalXp;
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
        totalConqueredCount,
        pendingCoproductionsCount,
        conqueredCodes,
        byRarity,
        totalXp: countriesXp,
      },
      trophies: {
        totalUnlocked,
        totalAvailable: (trophiesList || []).length,
        unlockedIds,
        byTier,
        totalXp: trophiesXp,
      },
      timeMachine: timeMachineSummary,
    },
  };
}

/**
 * Detecta anos inéditos e décadas recém-completadas na Máquina do Tempo entre dois snapshots de XP.
 */
export function computeTimeMachineUnlocks(
  prev: UserXpStatus | null | undefined,
  next: UserXpStatus | null | undefined
): TimeMachineUnlockNotification[] {
  if (!prev || !next || !next.sources?.timeMachine) return [];

  const prevYears = prev.sources?.timeMachine?.conqueredYears || {};
  const nextYears = next.sources?.timeMachine?.conqueredYears || {};
  const unlocks: TimeMachineUnlockNotification[] = [];

  const newlyConqueredYears = Object.values(nextYears)
    .filter((yInfo) => !prevYears[yInfo.year])
    .sort((a, b) => a.year - b.year); // Mais antigos / raros primeiro

  for (const yInfo of newlyConqueredYears) {
    unlocks.push({
      id: `tm_year_${yInfo.year}`,
      kind: 'year',
      year: yInfo.year,
      rarity: yInfo.rarity,
      xp: yInfo.xp,
      movieTitle: yInfo.topMovieTitle,
      posterUrl: yInfo.topMoviePoster,
      userRating: yInfo.topUserRating,
    });
  }

  const prevDecades = prev.sources?.timeMachine?.completedDecades || {};
  const nextDecades = next.sources?.timeMachine?.completedDecades || {};
  for (const [decId, decInfo] of Object.entries(nextDecades)) {
    if (!prevDecades[decId]) {
      unlocks.push({
        id: `tm_decade_${decId}`,
        kind: 'decade',
        decadeId: decId,
        decadeLabel: decInfo.label,
        rarity: 'decade_relic',
        xp: decInfo.xp,
      });
    }
  }

  return unlocks;
}

/**
 * Snapshot rápido do banco antes de uma mutação (evita reavaliar 432 regras duas vezes).
 */
export async function getQuickXpSnapshot(): Promise<UserXpStatus> {
  const [worldData, trophiesRes] = await Promise.all([
    buildWorldChallengePayload(),
    query(`
      SELECT t.id, t.title, t.tier, COALESCE(ut.is_unlocked, FALSE) AS is_unlocked
      FROM trophies t
      LEFT JOIN user_trophies ut ON ut.trophy_id = t.id
    `),
  ]);

  const trophiesList = trophiesRes.rows.map((r: any) => ({
    id: String(r.id),
    title: String(r.title || ''),
    tier: (String(r.tier || 'bronze').toLowerCase() as TrophyTier) || 'bronze',
    is_unlocked: Boolean(r.is_unlocked),
  }));

  return buildUserXpStatus(worldData, trophiesList);
}

/**
 * Calcula o evento de ganho de XP comparando o estado anterior e o novo estado.
 */
export function computeXpGainEvent(
  prev: UserXpStatus | null | undefined,
  next: UserXpStatus | null | undefined
): XpGainEvent | null {
  if (!prev || !next) return null;
  const gainedXp = next.totalXp - prev.totalXp;
  if (gainedXp <= 0) return null;

  const tags: XpGainTag[] = [];

  // 1. Tag de Filmes
  const movieDiff = next.sources.movies.count - prev.sources.movies.count;
  if (movieDiff > 0) {
    const mXp = movieDiff * XP_PER_MOVIE;
    tags.push({
      type: 'movie',
      icon: '🎬',
      label: movieDiff === 1 ? `+${mXp} XP Filme` : `+${mXp} XP Filmes (${movieDiff})`,
      xp: mXp,
    });
  }

  // 2. Tags de Países recém-conquistados no Desafio 195
  const newCountries: Array<{ code: string; name: string; rarity: CountryRarityTier; xp: number }> = [];
  for (const [code, info] of Object.entries(next.sources.countries.conqueredCodes)) {
    if (!prev.sources.countries.conqueredCodes[code]) {
      newCountries.push({ code, ...info });
    }
  }

  if (newCountries.length > 0 && newCountries.length <= 2) {
    for (const c of newCountries) {
      const meta = COUNTRY_RARITY_META[c.rarity];
      tags.push({
        type: 'country',
        icon: meta.icon,
        label: `+${c.xp} XP País ${meta.label} (${c.name})`,
        xp: c.xp,
        rarityOrTier: c.rarity,
      });
    }
  } else if (newCountries.length > 2) {
    const order: CountryRarityTier[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];
    for (const r of order) {
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
    }
  }

  // 3. Tags da Máquina do Tempo (Anos inéditos + Relíquias de Décadas)
  const timeMachineUnlocks = computeTimeMachineUnlocks(prev, next);
  const newYearUnlocks = timeMachineUnlocks.filter((u) => u.kind === 'year');
  const newDecadeUnlocks = timeMachineUnlocks.filter((u) => u.kind === 'decade');

  if (newYearUnlocks.length > 0 && newYearUnlocks.length <= 2) {
    for (const u of newYearUnlocks) {
      const rKey = (u.rarity as TimeMachineRarityTier) || 'common';
      const meta = TIME_MACHINE_RARITY_META[rKey] || TIME_MACHINE_RARITY_META.common;
      tags.push({
        type: 'time_machine',
        icon: '⏳',
        label: `+${u.xp} XP Ano ${meta.label} (${u.year})`,
        xp: u.xp,
        rarityOrTier: rKey,
      });
    }
  } else if (newYearUnlocks.length > 2) {
    const order: TimeMachineRarityTier[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];
    for (const r of order) {
      const group = newYearUnlocks.filter((u) => u.rarity === r);
      if (group.length > 0) {
        const meta = TIME_MACHINE_RARITY_META[r];
        const sumXp = group.reduce((acc, x) => acc + x.xp, 0);
        tags.push({
          type: 'time_machine',
          icon: '⏳',
          label:
            group.length === 1
              ? `+${sumXp} XP Ano ${meta.label} (${group[0].year})`
              : `+${sumXp} XP ${group.length} Anos (${meta.pluralLabel})`,
          xp: sumXp,
          rarityOrTier: r,
        });
      }
    }
  }

  if (newDecadeUnlocks.length > 0) {
    const sumDecXp = newDecadeUnlocks.reduce((acc, d) => acc + d.xp, 0);
    tags.push({
      type: 'time_decade',
      icon: '🕰️',
      label:
        newDecadeUnlocks.length === 1
          ? `+${sumDecXp} XP Década Completa (${newDecadeUnlocks[0].decadeLabel})`
          : `+${sumDecXp} XP ${newDecadeUnlocks.length} Décadas Completas`,
      xp: sumDecXp,
      rarityOrTier: 'legendary',
    });
  }

  // 4. Tags de Troféus recém-desbloqueados
  const newTrophies: Array<{ id: string; title: string; tier: TrophyTier; xp: number }> = [];
  for (const [id, info] of Object.entries(next.sources.trophies.unlockedIds)) {
    if (!prev.sources.trophies.unlockedIds[id]) {
      newTrophies.push({ id, ...info });
    }
  }

  if (newTrophies.length > 0) {
    const tierOrder: TrophyTier[] = ['platinum', 'mythic', 'gold', 'epic', 'silver', 'bronze'];
    for (const tr of tierOrder) {
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
    }
  }

  // 5. Ganhos de Atributos RPG Cinéfilo (AGI, INT, DES, SOR, VIT, FOR)
  const statGains: XpStatGain[] = [];
  if (movieDiff > 0) {
    statGains.push({
      key: 'AGI',
      icon: '⚡',
      label: `+${(movieDiff * 0.4).toFixed(1)} AGI`,
      gain: movieDiff * 0.4,
    });
    statGains.push({
      key: 'SOR',
      icon: '🎯',
      label: `+${(movieDiff * 0.3).toFixed(1)} SOR`,
      gain: movieDiff * 0.3,
    });
  }
  if (newYearUnlocks.length > 0 || newDecadeUnlocks.length > 0) {
    const intPoints = newYearUnlocks.length * 0.8 + newDecadeUnlocks.length * 1.5;
    statGains.push({
      key: 'INT',
      icon: '🧠',
      label: `+${intPoints.toFixed(1)} INT`,
      gain: intPoints,
    });
  }
  if (newCountries.length > 0) {
    const desPoints = newCountries.length * 1.2;
    statGains.push({
      key: 'DES',
      icon: '🌍',
      label: `+${desPoints.toFixed(1)} DES`,
      gain: desPoints,
    });
  }
  if (newTrophies.length > 0) {
    let vitPoints = 0;
    newTrophies.forEach((t) => {
      const tier = String(t.tier || '').toLowerCase();
      if (tier === 'platinum') vitPoints += 3.0;
      else if (tier === 'mythic') vitPoints += 1.0;
      else if (tier === 'gold') vitPoints += 0.8;
      else if (tier === 'epic') vitPoints += 0.6;
      else if (tier === 'silver') vitPoints += 0.4;
      else vitPoints += 0.2;
    });
    statGains.push({
      key: 'VIT',
      icon: '🏆',
      label: `+${vitPoints.toFixed(1)} VIT`,
      gain: vitPoints,
    });
  }

  // Fallback de segurança caso o ganho venha de ajuste/reavaliação sem entrada individual acima
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
    timeMachineUnlocks,
    statGains: statGains.length > 0 ? statGains : undefined,
  };
}
