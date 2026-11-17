import { TvStudioItem } from '../types';

export type StudioTier = 'none' | 'bronze' | 'silver' | 'epic' | 'gold' | 'mythic';

export const STUDIO_EXTRA_STAR_STEP = 3;
export const STUDIO_EXTRA_STAR_XP = 30;

export const STUDIO_TIER_TARGETS: Array<{
  tier: Exclude<StudioTier, 'none'>;
  minCompleted: number;
  xp: number;
  label: string;
  icon: string;
}> = [
  { tier: 'bronze', minCompleted: 1, xp: 20, label: 'Bronze', icon: '🥉' },
  { tier: 'silver', minCompleted: 3, xp: 30, label: 'Prata', icon: '🥈' },
  { tier: 'epic', minCompleted: 5, xp: 50, label: 'Épico', icon: '🔮' },
  { tier: 'gold', minCompleted: 10, xp: 100, label: 'Ouro', icon: '🥇' },
  { tier: 'mythic', minCompleted: 17, xp: 170, label: 'Mítico', icon: '🩸' },
];

export const STUDIO_TIER_RANK: Record<StudioTier, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  epic: 3,
  gold: 4,
  mythic: 5,
};

export interface LegendaryStudioDefinition {
  id: string;
  name: string;
  malId: number;
  aliases: string[];
  foundedYear: number;
  emoji: string;
  motto: string;
  signatureWorks: string[];
}

export const LEGENDARY_STUDIOS: LegendaryStudioDefinition[] = [
  {
    id: 'pierrot',
    name: 'Pierrot',
    malId: 1,
    aliases: ['pierrot', 'studio pierrot', 'pierrot films'],
    foundedYear: 1979,
    emoji: '⚔️',
    motto: 'Mestres do shounen de longa duração e batalhas icônicas.',
    signatureWorks: ['Bleach', 'Bleach: Thousand-Year Blood War', 'Yu Yu Hakusho', 'Naruto'],
  },
  {
    id: 'bones',
    name: 'Bones',
    malId: 4,
    aliases: ['bones', 'studio bones'],
    foundedYear: 1998,
    emoji: '⚗️',
    motto: 'Coreografia fluida e adaptações lendárias da Lei da Troca Equivalente.',
    signatureWorks: ['Fullmetal Alchemist: Brotherhood', 'Mob Psycho 100', 'Boku no Hero Academia', 'Soul Eater'],
  },
  {
    id: 'toei',
    name: 'Toei Animation',
    malId: 18,
    aliases: ['toei animation', 'toei'],
    foundedYear: 1948,
    emoji: '🐉',
    motto: 'O berço histórico que moldou gerações no Brasil e no mundo.',
    signatureWorks: ['Dragon Ball Z', 'Digimon Adventure', 'One Piece', 'Slam Dunk'],
  },
  {
    id: 'lerche',
    name: 'Lerche',
    malId: 456,
    aliases: ['lerche'],
    foundedYear: 2011,
    emoji: '🎸',
    motto: 'Narrativas musicais marcantes e thrillers escolares intensos.',
    signatureWorks: ['Given', 'Ansatsu Kyoushitsu', 'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e', 'Kanata no Astra'],
  },
  {
    id: 'madhouse',
    name: 'Madhouse',
    malId: 11,
    aliases: ['madhouse'],
    foundedYear: 1972,
    emoji: '🪶',
    motto: 'Precisão autoral e clássicos atemporais de qualquer década.',
    signatureWorks: ['Sousou no Frieren', 'Hunter x Hunter (2011)', 'Death Note', 'Monster'],
  },
  {
    id: 'ufotable',
    name: 'Ufotable',
    malId: 43,
    aliases: ['ufotable'],
    foundedYear: 2000,
    emoji: '🔥',
    motto: 'Fusão cinematográfica de 2D, 3D e iluminação espetacular.',
    signatureWorks: ['Kimetsu no Yaiba', 'Fate/Zero', 'Fate/stay night: Unlimited Blade Works', 'Kara no Kyoukai'],
  },
  {
    id: 'mappa',
    name: 'MAPPA',
    malId: 569,
    aliases: ['mappa'],
    foundedYear: 2011,
    emoji: '⚡',
    motto: 'Intensidade cinematográfica e ação visceral moderna.',
    signatureWorks: ['Jujutsu Kaisen', 'Shingeki no Kyojin: The Final Season', 'Chainsaw Man', 'Vinland Saga Season 2'],
  },
  {
    id: 'kyoani',
    name: 'Kyoto Animation',
    malId: 2,
    aliases: ['kyoto animation', 'kyoani'],
    foundedYear: 1981,
    emoji: '🌸',
    motto: 'Sensibilidade estética e animação expressiva em cada detalhe.',
    signatureWorks: ['Violet Evergarden', 'Clannad: After Story', 'Hibike! Euphonium', 'Nichijou'],
  },
  {
    id: 'wit',
    name: 'Wit Studio',
    malId: 858,
    aliases: ['wit studio', 'wit'],
    foundedYear: 2012,
    emoji: '🛡️',
    motto: 'Sequências aéreas grandiosas e direção de tirar o fôlego.',
    signatureWorks: ['Shingeki no Kyojin', 'Vinland Saga', 'Ousama Ranking', 'Spy x Family'],
  },
  {
    id: 'production_ig',
    name: 'Production I.G',
    malId: 10,
    aliases: ['production i.g', 'production i.g.', 'production ig'],
    foundedYear: 1987,
    emoji: '🏐',
    motto: 'Excelência técnica tanto no sci-fi cyberpunk quanto nos esportes.',
    signatureWorks: ['Haikyuu!!', 'Psycho-Pass', 'Tengoku Daimakyou', 'Kaijuu 8-gou'],
  },
  {
    id: 'cloverworks',
    name: 'CloverWorks',
    malId: 1835,
    aliases: ['cloverworks'],
    foundedYear: 2018,
    emoji: '🍀',
    motto: 'Versatilidade criativa, comédia musical e romance contemporâneo.',
    signatureWorks: ['Bocchi the Rock!', 'Yakusoku no Neverland', 'Sono Bisque Doll wa Koi wo Suru', 'Horimiya'],
  },
  {
    id: 'a1',
    name: 'A-1 Pictures',
    malId: 56,
    aliases: ['a-1 pictures', 'a1 pictures'],
    foundedYear: 2005,
    emoji: '🎭',
    motto: 'Produções de alto impacto em comédia romântica, drama e fantasia.',
    signatureWorks: ['Kaguya-sama wa Kokurasetai', 'Ore dake Level Up na Ken', '86', 'Boku dake ga Inai Machi'],
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    malId: 14,
    aliases: ['sunrise', 'bandai namco filmworks'],
    foundedYear: 1972,
    emoji: '🤖',
    motto: 'Realeza do mecha, óperas espaciais e humor lendário.',
    signatureWorks: ['Code Geass: Hangyaku no Lelouch', 'Cowboy Bebop', 'Gintama', 'Mobile Suit Gundam'],
  },
  {
    id: 'trigger',
    name: 'Trigger',
    malId: 803,
    aliases: ['trigger', 'studio trigger'],
    foundedYear: 2011,
    emoji: '🚀',
    motto: 'Energia estilizada, exagero criativo e paixão pelo quadro a quadro.',
    signatureWorks: ['Cyberpunk: Edgerunners', 'Dungeon Meshi', 'Kill la Kill', 'Little Witch Academia'],
  },
  {
    id: 'shaft',
    name: 'Shaft',
    malId: 44,
    aliases: ['shaft'],
    foundedYear: 1975,
    emoji: '🌙',
    motto: 'Vanguarda visual, cortes geométricos e diálogos hipnóticos.',
    signatureWorks: ['Bakemonogatari', 'Mahou Shoujo Madoka★Magica', '3-gatsu no Lion', 'Nisekoi'],
  },
  {
    id: 'david',
    name: 'David Production',
    malId: 287,
    aliases: ['david production'],
    foundedYear: 2007,
    emoji: '⭐',
    motto: 'Estilo extravagante, paletas ousadas e design sonoro inconfundível.',
    signatureWorks: ['JoJo no Kimyou na Bouken', 'Enen no Shouboutai', 'Hataraku Saibou', 'Undead Unluck'],
  },
  {
    id: 'science_saru',
    name: 'Science SARU',
    malId: 1591,
    aliases: ['science saru'],
    foundedYear: 2013,
    emoji: '🛸',
    motto: 'Experimentalismo ousado, ritmo alucinante e traço expressivo.',
    signatureWorks: ['Dandadan', 'Devilman: Crybaby', 'Keep Your Hands Off Eizouken!', 'Heike Monogatari'],
  },
  {
    id: 'tms',
    name: 'TMS Entertainment',
    malId: 73,
    aliases: ['tms entertainment', 'tms', 'tokyo movie shinsha'],
    foundedYear: 1946,
    emoji: '🧪',
    motto: 'Tradição histórica unindo aventura científica e dramas premiados.',
    signatureWorks: ['Dr. Stone', 'Fruits Basket (2019)', 'Detective Conan', 'Megalo Box'],
  },
  {
    id: 'gainax',
    name: 'Gainax',
    malId: 6,
    aliases: ['gainax'],
    foundedYear: 1984,
    emoji: '🌌',
    motto: 'O estúdio revolucionário que redefiniu o anime moderno nos anos 90.',
    signatureWorks: ['Neon Genesis Evangelion', 'Tengen Toppa Gurren Lagann', 'FLCL', 'Nadia'],
  },
];

function normalizeStudioName(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchShowToLegendaryStudios(showStudios: TvStudioItem[]): LegendaryStudioDefinition[] {
  if (!Array.isArray(showStudios) || showStudios.length === 0) return [];

  const matched = new Map<string, LegendaryStudioDefinition>();

  for (const st of showStudios) {
    const norm = normalizeStudioName(st.name);
    for (const def of LEGENDARY_STUDIOS) {
      const byMalId = st.mal_id !== null && st.mal_id !== undefined && Number(st.mal_id) === def.malId;
      const byAlias = def.aliases.some((alias) => normalizeStudioName(alias) === norm);
      if (byMalId || byAlias) {
        matched.set(def.id, def);
      }
    }
  }

  return Array.from(matched.values());
}

export function resolveStudioTier(completedCount: number): {
  currentTier: StudioTier;
  xpEarned: number;
  extraStars: number;
  extraStarsXp: number;
  nextTier: Exclude<StudioTier, 'none'> | null;
  nextTierTarget: number | null;
  nextStarTarget: number | null;
  progressPercentage: number;
} {
  let currentTier: StudioTier = 'none';
  let baseTierXp = 0;

  for (const step of STUDIO_TIER_TARGETS) {
    if (completedCount >= step.minCompleted) {
      currentTier = step.tier;
      baseTierXp = step.xp;
    }
  }

  const mythicMin = STUDIO_TIER_TARGETS[STUDIO_TIER_TARGETS.length - 1].minCompleted; // 17
  if (completedCount >= mythicMin) {
    const overMythic = completedCount - mythicMin;
    const extraStars = Math.floor(overMythic / STUDIO_EXTRA_STAR_STEP);
    const extraStarsXp = extraStars * STUDIO_EXTRA_STAR_XP;
    const nextStarTarget = mythicMin + (extraStars + 1) * STUDIO_EXTRA_STAR_STEP;
    const progressInStar = overMythic % STUDIO_EXTRA_STAR_STEP;
    const progressPercentage = Math.round((progressInStar / STUDIO_EXTRA_STAR_STEP) * 100);

    return {
      currentTier: 'mythic',
      xpEarned: baseTierXp + extraStarsXp,
      extraStars,
      extraStarsXp,
      nextTier: null,
      nextTierTarget: null,
      nextStarTarget,
      progressPercentage,
    };
  }

  const nextStep = STUDIO_TIER_TARGETS.find((step) => completedCount < step.minCompleted) || null;
  if (!nextStep) {
    return {
      currentTier,
      xpEarned: baseTierXp,
      extraStars: 0,
      extraStarsXp: 0,
      nextTier: null,
      nextTierTarget: null,
      nextStarTarget: null,
      progressPercentage: 100,
    };
  }

  const prevMin =
    [...STUDIO_TIER_TARGETS]
      .reverse()
      .find((s) => completedCount >= s.minCompleted)?.minCompleted ?? 0;
  const span = Math.max(1, nextStep.minCompleted - prevMin);
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round(((completedCount - prevMin) / span) * 100))
  );

  return {
    currentTier,
    xpEarned: baseTierXp,
    extraStars: 0,
    extraStarsXp: 0,
    nextTier: nextStep.tier,
    nextTierTarget: nextStep.minCompleted,
    nextStarTarget: null,
    progressPercentage,
  };
}
