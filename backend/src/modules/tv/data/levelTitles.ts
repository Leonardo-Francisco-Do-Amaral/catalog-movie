export interface TvLevelTitleRange {
  minLevel: number;
  maxLevel: number | null;
  title: string;
}

export const TV_XP_VALUES = {
  EPISODE_WATCHED: 1,
  SEASON_COMPLETED: 20,
  SHOW_COMPLETED: 50,
  MARATHON_DAY: 15,
} as const;

export const TV_LEVEL_TITLE_RANGES: TvLevelTitleRange[] = [
  { minLevel: 1, maxLevel: 4, title: 'Criança Escolhida do Acampamento de Verão (Cadê Meu Digivice?!)' },
  { minLevel: 5, maxLevel: 9, title: 'Pulei a Abertura? Jamais!' },
  { minLevel: 10, maxLevel: 14, title: 'Corda Arrebentada da Fender Stratocaster do Mafuyu' },
  { minLevel: 15, maxLevel: 19, title: 'Esperando a Temporada 2 que Nunca Vem' },
  { minLevel: 20, maxLevel: 24, title: 'Treinando a 100x a Gravidade na Nave da Corporação Cápsula' },
  { minLevel: 25, maxLevel: 29, title: 'Vocalista da Banda Given no Primeiro Live' },
  { minLevel: 30, maxLevel: 34, title: 'Alquimista Federal: Lei da Troca Equivalente (Sono por Episódios!)' },
  { minLevel: 35, maxLevel: 39, title: 'Digievolução para o Nível Mega!' },
  { minLevel: 40, maxLevel: 44, title: 'Capitão do Gotei 13 do Sofá' },
  { minLevel: 45, maxLevel: 49, title: '"Esse Ainda Não É nem o Meu Poder Total!" (Mais de 8.000!)' },
  { minLevel: 50, maxLevel: 54, title: 'Atravessou o Portão da Verdade sem Usar Pedra Filosofal' },
  { minLevel: 55, maxLevel: 59, title: 'Dominou a Bankai Completa na Soul Society' },
  { minLevel: 60, maxLevel: 64, title: 'Cavaleiro Real do Mundo Digital (Omegamon Approves!)' },
  { minLevel: 65, maxLevel: 69, title: 'Instinto Superior do Controle Remoto' },
  { minLevel: 70, maxLevel: 74, title: 'Sobrevivente da Guerra Sangrenta dos Mil Anos' },
  { minLevel: 75, maxLevel: null, title: 'A Entidade Absoluta dos Animes (Shenlong Já Te Conhece pelo Nome!)' },
];

export function getTvLevelTitle(level: number): string {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  const match = TV_LEVEL_TITLE_RANGES.find(
    (range) => safeLevel >= range.minLevel && (range.maxLevel === null || safeLevel <= range.maxLevel)
  );
  return match ? match.title : TV_LEVEL_TITLE_RANGES[TV_LEVEL_TITLE_RANGES.length - 1].title;
}

export function getTvNextTitleMilestone(level: number): { level: number; title: string } | null {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  if (safeLevel >= 75) return null;
  const nextMilestone = safeLevel < 5 ? 5 : Math.floor(safeLevel / 5) * 5 + 5;
  return {
    level: nextMilestone,
    title: getTvLevelTitle(nextMilestone),
  };
}

export function getTvXpRequiredForLevelStep(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  return 60 + (safeLevel - 1) * 25;
}

export function calculateTvLevelFromXp(rawTotalXp: number) {
  const totalXp = Math.max(0, Math.floor(rawTotalXp || 0));
  let level = 1;
  let accumulatedXp = 0;

  while (true) {
    const stepXp = getTvXpRequiredForLevelStep(level);
    if (accumulatedXp + stepXp > totalXp) {
      const xpInCurrentLevel = totalXp - accumulatedXp;
      const progressPercentage = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / stepXp) * 100)));
      return {
        totalXp,
        level,
        levelTitle: getTvLevelTitle(level),
        xpInCurrentLevel,
        xpNeededForNextLevel: stepXp,
        progressPercentage,
        xpRemaining: stepXp - xpInCurrentLevel,
        nextTitleMilestone: getTvNextTitleMilestone(level),
      };
    }
    accumulatedXp += stepXp;
    level += 1;
    if (level > 999) break;
  }

  return {
    totalXp,
    level: 999,
    levelTitle: getTvLevelTitle(999),
    xpInCurrentLevel: 0,
    xpNeededForNextLevel: 1000,
    progressPercentage: 100,
    xpRemaining: 0,
    nextTitleMilestone: null,
  };
}
