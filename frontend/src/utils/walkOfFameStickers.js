import { resolveBackendAssetUrl } from './apiConfig';

// Acabamentos oficiais aprovados para Bronze (15% = Opção 2) e Prata (30% = Opção 2)
export const OFFICIAL_BRONZE_ID = 'bronze_forjado';
export const OFFICIAL_SILVER_ID = 'prata_platina';

const FIXED_TIER_THEMES = {
  carving: {
    key: 'carving',
    shortTag: 'BLOQUEADA',
    label: 'Em Progresso',
    icon: '🔒',
    pctHint: '0%–14%',
    accentHex: '#a1a1aa',
    frameBackground: 'linear-gradient(135deg, #3f3f46, #27272a 50%, #52525b)',
    innerTrimColor: 'rgba(161, 161, 170, 0.25)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.55)',
    badgeStyle: {
      backgroundColor: 'rgba(63, 63, 70, 0.85)',
      borderColor: 'rgba(161, 161, 170, 0.5)',
      color: '#e4e4e7',
    },
    metallicType: 'matte',
  },
  bronze: {
    key: 'bronze',
    shortTag: 'BRONZE FORJADO',
    label: 'Teste de Elenco',
    icon: '🎟️',
    pctHint: '15%+',
    accentHex: '#f59e0b',
    frameBackground: 'linear-gradient(135deg, #78350f, #ea580c 26%, #fdba74 50%, #b45309 76%, #451a03)',
    innerTrimColor: 'rgba(253, 186, 116, 0.65)',
    boxShadow: '0 10px 30px rgba(234, 88, 12, 0.38)',
    badgeStyle: {
      backgroundColor: 'rgba(154, 52, 18, 0.92)',
      borderColor: 'rgba(253, 186, 116, 0.8)',
      color: '#ffedd5',
    },
    metallicType: OFFICIAL_BRONZE_ID,
  },
  silver: {
    key: 'silver',
    shortTag: 'PLATINA GLINT',
    label: 'Rouba-Cena',
    icon: '🎬',
    pctHint: '30%+',
    accentHex: '#e0f2fe',
    frameBackground: 'linear-gradient(135deg, #334155, #bae6fd 26%, #ffffff 50%, #cbd5e1 74%, #1e293b)',
    innerTrimColor: 'rgba(224, 242, 254, 0.8)',
    boxShadow: '0 10px 30px rgba(186, 230, 253, 0.34)',
    badgeStyle: {
      backgroundColor: 'rgba(30, 41, 59, 0.92)',
      borderColor: '#e0f2fe',
      color: '#ffffff',
    },
    metallicType: OFFICIAL_SILVER_ID,
  },
  epic: {
    key: 'epic',
    shortTag: 'AURORA BOREAL',
    label: 'Queridinho dos Holofotes',
    icon: '🌌',
    pctHint: '45%+',
    accentHex: '#34d399',
    frameBackground: 'linear-gradient(135deg, #064e3b, #34d399 28%, #22d3ee 54%, #a855f7 80%, #022c22)',
    innerTrimColor: 'rgba(110, 231, 183, 0.82)',
    boxShadow: '0 12px 34px rgba(52, 211, 153, 0.42)',
    badgeStyle: {
      backgroundColor: 'rgba(6, 78, 59, 0.94)',
      borderColor: '#6ee7b7',
      color: '#ecfdf5',
    },
    metallicType: 'aurora_wave',
  },
  gold: {
    key: 'gold',
    shortTag: 'OURO LÍQUIDO 24K',
    label: 'Estrela na Calçada',
    icon: '🏆',
    pctHint: '60%+',
    accentHex: '#facc15',
    frameBackground:
      'linear-gradient(135deg, #713f12, #fde047 22%, #fef9c3 46%, #ca8a04 68%, #facc15 88%, #78350f)',
    innerTrimColor: 'rgba(254, 240, 138, 0.9)',
    boxShadow: '0 12px 34px rgba(250, 204, 21, 0.45)',
    badgeStyle: {
      backgroundColor: 'rgba(113, 63, 18, 0.94)',
      borderColor: 'rgba(254, 240, 138, 0.95)',
      color: '#fef9c3',
    },
    metallicType: 'liquid_gold',
  },
  mythic: {
    key: 'mythic',
    shortTag: 'CYBER SCANLINE',
    label: 'Lenda Viva do Set',
    icon: '📟',
    pctHint: '75%+',
    accentHex: '#22d3ee',
    frameBackground: 'linear-gradient(135deg, #083344, #22d3ee 25%, #f43f5e 52%, #a855f7 78%, #09090b)',
    innerTrimColor: 'rgba(34, 211, 238, 0.85)',
    boxShadow: '0 12px 36px rgba(34, 211, 238, 0.44)',
    badgeStyle: {
      backgroundColor: 'rgba(8, 51, 68, 0.94)',
      borderColor: '#22d3ee',
      color: '#cffafe',
    },
    metallicType: 'cyber_glitch',
  },
  diamond: {
    key: 'diamond',
    shortTag: 'CRACKED ICE PRISM',
    label: 'Imortal da Sétima Arte',
    icon: '💎',
    pctHint: '90%+',
    accentHex: '#38bdf8',
    frameBackground: 'linear-gradient(125deg, #38bdf8, #e0f2fe 24%, #a855f7 52%, #f43f5e 76%, #38bdf8)',
    innerTrimColor: 'rgba(186, 230, 253, 0.95)',
    boxShadow: '0 14px 40px rgba(56, 189, 248, 0.48)',
    badgeStyle: {
      backgroundColor: 'rgba(12, 74, 110, 0.92)',
      borderColor: '#7dd3fc',
      color: '#e0f2fe',
    },
    metallicType: 'cracked_ice',
  },
};

export const RISING_STAR_RANK_X_TOOLTIP =
  'Estrela em Ascensão (Rank X → X+ → X++): diretores com teto enxuto de até 7 filmes na carreira. 40% (Rank X): libera a figurinha, Frase de Set, 1ª Curiosidade e Foto Própria (+70 XP). 80% (Rank X+): libera os marcos de 60% & 80% (Manias de Set, Curiosidades #2–#3 e Obra-Prima, +150 XP). 100% (Rank X++): libera o Cânone Total (Show de Cartazes e 10 Auras, +125 XP).';

export const RISING_STAR_THEME = {
  id: 'rising_5_titanium_hud',
  key: 'rising',
  shortTag: 'ESTRELA EM ASCENSÃO',
  label: 'Estrela em Ascensão (≤ 7 filmes)',
  name: 'Visor IMAX Titânio & Safira',
  badge: 'Visor IMAX',
  icon: '🌟',
  pctHint: '40% / 80% / 100% • Rank X → X++',
  accentHex: '#38bdf8',
  frameBackground:
    'linear-gradient(135deg, #09090b 0%, #38bdf8 26%, #f8fafc 50%, #818cf8 74%, #09090b 100%)',
  innerTrimColor: 'rgba(186, 230, 253, 0.9)',
  boxShadow: '0 12px 30px -6px rgba(56, 189, 248, 0.52), 0 0 24px rgba(129, 140, 248, 0.35)',
  badgeStyle: {
    backgroundColor: 'rgba(9, 9, 11, 0.92)',
    color: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  metallicType: 'rising_titanium_hud',
  film35mmStyle: 'reel_scroll',
  filmTrackBg: 'rgba(9, 9, 11, 0.95)',
  filmHoleColor: 'rgba(224, 242, 254, 0.8)',
  filmCode: 'IMAX CAM',
};

export const RISING_STAR_STAGE_THEMES = {
  silver: {
    ...RISING_STAR_THEME,
    key: 'silver',
    shortTag: 'RANK X • 40%',
    label: 'Estágio 1 • Rank X',
    icon: '🌟',
    pctHint: '40%+',
    accentHex: '#38bdf8',
    filmCode: 'IMAX • X',
  },
  mythic: {
    ...RISING_STAR_THEME,
    key: 'mythic',
    shortTag: 'RANK X+ • 80%',
    label: 'Estágio 2 • Rank X+',
    icon: '⚡',
    pctHint: '80%+',
    accentHex: '#818cf8',
    frameBackground:
      'linear-gradient(135deg, #09090b 0%, #6366f1 24%, #e0e7ff 50%, #ec4899 76%, #09090b 100%)',
    innerTrimColor: 'rgba(165, 180, 252, 0.95)',
    boxShadow: '0 14px 36px -6px rgba(99, 102, 241, 0.56), 0 0 28px rgba(236, 72, 153, 0.34)',
    badgeStyle: {
      backgroundColor: 'rgba(30, 27, 75, 0.94)',
      color: '#e0e7ff',
      borderColor: '#818cf8',
    },
    filmCode: 'IMAX • X+',
  },
  diamond: {
    ...RISING_STAR_THEME,
    key: 'diamond',
    shortTag: 'RANK X++ • 100%',
    label: 'Estágio 3 • Rank X++',
    icon: '👑',
    pctHint: '100%',
    accentHex: '#fde047',
    frameBackground:
      'linear-gradient(135deg, #09090b 0%, #38bdf8 22%, #ffffff 48%, #fde047 74%, #1e1b4b 100%)',
    innerTrimColor: 'rgba(254, 240, 138, 0.96)',
    boxShadow: '0 14px 42px rgba(255, 255, 255, 0.42), 0 0 32px rgba(250, 204, 21, 0.42)',
    badgeStyle: {
      backgroundColor: 'rgba(15, 23, 42, 0.94)',
      color: '#fef9c3',
      borderColor: '#fde047',
    },
    filmCode: 'IMAX • X++',
  },
};

export function getRisingStarTheme(tierKey) {
  if (!tierKey || tierKey === 'carving' || tierKey === 'cement') {
    return {
      ...DIRECTOR_TIER_THEMES.carving,
      pctHint: '0%–39%',
      label: 'Estrela em Ascensão (Bloqueada)',
    };
  }
  if (tierKey === 'diamond') return RISING_STAR_STAGE_THEMES.diamond;
  if (tierKey === 'mythic' || tierKey === 'gold') return RISING_STAR_STAGE_THEMES.mythic;
  return RISING_STAR_STAGE_THEMES.silver;
}

export const DIRECTOR_TIER_THEMES = {
  carving: {
    ...FIXED_TIER_THEMES.carving,
    label: 'Claquete Fechada',
    pctHint: '0%–19%',
    film35mmStyle: 'classic',
    filmCode: 'BLOQUEADA',
  },
  bronze: {
    key: 'bronze',
    shortTag: 'TAKE 1 • CLAQUETE',
    label: 'Take 1: Claquete Inicial',
    icon: '🎬',
    pctHint: '20%+',
    accentHex: '#fbbf24',
    frameBackground:
      'linear-gradient(135deg, #713f12 0%, #d97706 25%, #fde68a 50%, #b45309 75%, #451a03 100%)',
    innerTrimColor: 'rgba(253, 224, 71, 0.72)',
    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.42)',
    badgeStyle: FIXED_TIER_THEMES.bronze.badgeStyle,
    metallicType: 'film35_scrolling_ember',
    film35mmStyle: 'reel_scroll',
    filmTrackBg: 'rgba(24, 14, 5, 0.76)',
    filmHoleColor: 'rgba(253, 230, 138, 0.48)',
    filmCode: '24FPS',
  },
  silver: {
    key: 'silver',
    shortTag: 'TAKE 2 • CORTE DO DIRETOR',
    label: 'Take 2: Corte do Diretor',
    icon: '✂️',
    pctHint: '40%+',
    accentHex: '#7dd3fc',
    frameBackground:
      'linear-gradient(135deg, #0f172a 0%, #38bdf8 26%, #e0f2fe 50%, #64748b 76%, #0f172a 100%)',
    innerTrimColor: 'rgba(125, 211, 252, 0.85)',
    boxShadow: '0 12px 32px rgba(56, 189, 248, 0.34)',
    badgeStyle: FIXED_TIER_THEMES.silver.badgeStyle,
    metallicType: 'film35_moviola_cut',
    film35mmStyle: 'reel_scroll',
    filmTrackBg: 'rgba(15, 23, 42, 0.8)',
    filmHoleColor: 'rgba(125, 211, 252, 0.62)',
    filmCode: 'MOVIOLA',
  },
  gold: {
    key: 'gold',
    shortTag: 'TAKE 3 • DNA AUTORAL',
    label: 'Take 3: DNA Autoral & Manias',
    icon: '🎯',
    pctHint: '60%+',
    accentHex: '#fbbf24',
    frameBackground:
      'linear-gradient(135deg, #1c1917 0%, #b45309 22%, #fde047 50%, #f59e0b 78%, #1c1917 100%)',
    innerTrimColor: 'rgba(253, 224, 71, 0.88)',
    boxShadow: '0 12px 34px rgba(234, 179, 8, 0.5)',
    badgeStyle: FIXED_TIER_THEMES.gold.badgeStyle,
    metallicType: 'film35_gala_confetti',
    film35mmStyle: 'reel_scroll',
    filmTrackBg: 'rgba(12, 10, 9, 0.84)',
    filmHoleColor: 'rgba(250, 204, 21, 0.72)',
    filmCode: 'PREMIERE',
  },
  mythic: {
    key: 'mythic',
    shortTag: 'TAKE 4 • SESSÃO DE GALA',
    label: 'Take 4: Sessão de Gala',
    icon: '🎞️',
    pctHint: '80%+',
    accentHex: '#fb7185',
    frameBackground:
      'linear-gradient(135deg, #4c0519 0%, #e11d48 28%, #fbbf24 52%, #7e22ce 78%, #1f030d 100%)',
    innerTrimColor: 'rgba(251, 113, 133, 0.88)',
    boxShadow: '0 14px 38px rgba(225, 29, 72, 0.46)',
    badgeStyle: {
      backgroundColor: 'rgba(76, 5, 25, 0.94)',
      borderColor: '#fb7185',
      color: '#ffe4e6',
    },
    metallicType: 'film35_premiere_flash',
    film35mmStyle: 'reel_scroll',
    filmTrackBg: 'rgba(24, 3, 10, 0.84)',
    filmHoleColor: 'rgba(251, 113, 133, 0.78)',
    filmCode: 'GALA',
  },
  diamond: {
    key: 'diamond',
    shortTag: 'TAKE 5 • CÂNONE ABSOLUTO',
    label: 'Take 5: Cânone Absoluto',
    icon: '🌟',
    pctHint: '90%+',
    accentHex: '#fde047',
    frameBackground:
      'linear-gradient(135deg, #0f172a 0%, #38bdf8 22%, #ffffff 48%, #fde047 72%, #1e1b4b 100%)',
    innerTrimColor: 'rgba(255, 255, 255, 0.96)',
    boxShadow: '0 14px 42px rgba(255, 255, 255, 0.42), 0 0 32px rgba(250, 204, 21, 0.38)',
    badgeStyle: FIXED_TIER_THEMES.diamond.badgeStyle,
    metallicType: 'film35_celestial_reel',
    film35mmStyle: 'reel_scroll',
    filmTrackBg: 'rgba(15, 23, 42, 0.78)',
    filmHoleColor: 'rgba(254, 249, 195, 0.9)',
    filmCode: 'MASTER',
  },
};

export function getThemeForTier(tierKey, isDirector = false) {
  if (isDirector) {
    return DIRECTOR_TIER_THEMES[tierKey] || DIRECTOR_TIER_THEMES.carving;
  }
  return FIXED_TIER_THEMES[tierKey] || FIXED_TIER_THEMES.carving;
}

export const STICKER_TIER_THEMES = {
  bronze: FIXED_TIER_THEMES.bronze,
  silver: FIXED_TIER_THEMES.silver,
  epic: FIXED_TIER_THEMES.epic,
  gold: FIXED_TIER_THEMES.gold,
  mythic: FIXED_TIER_THEMES.mythic,
  diamond: FIXED_TIER_THEMES.diamond,
};

export const resolveWalkMediaUrl = resolveBackendAssetUrl;

export const IMMORTAL_AURA_LIST = [
  {
    id: 'prism',
    label: 'Prisma Cracked Ice',
    shortLabel: 'Prisma',
    requiredStars: 0,
    swatch: 'linear-gradient(135deg, #38bdf8, #a855f7, #f59e0b)',
    frameBg:
      'linear-gradient(135deg, #06b6d4 0%, #3b82f6 25%, #a855f7 50%, #f43f5e 75%, #fbbf24 100%)',
    shadow: '0 0 28px rgba(56,189,248,0.5), 0 0 42px rgba(168,85,247,0.32)',
    accent: '#38bdf8',
  },
  {
    id: 'gold',
    label: 'Ouro Real 24K',
    shortLabel: 'Ouro',
    requiredStars: 1,
    swatch: 'linear-gradient(135deg, #fef08a, #f59e0b, #b45309)',
    frameBg:
      'linear-gradient(135deg, #78350f 0%, #f59e0b 32%, #fef08a 52%, #d97706 78%, #78350f 100%)',
    shadow: '0 0 28px rgba(245,158,11,0.55), 0 0 42px rgba(254,240,138,0.28)',
    accent: '#fbbf24',
  },
  {
    id: 'ruby',
    label: 'Rubi Estelar',
    shortLabel: 'Rubi',
    requiredStars: 2,
    swatch: 'linear-gradient(135deg, #fda4af, #e11d48, #881337)',
    frameBg:
      'linear-gradient(135deg, #4c0519 0%, #e11d48 35%, #fecdd3 54%, #be123c 80%, #4c0519 100%)',
    shadow: '0 0 28px rgba(244,63,94,0.52), 0 0 42px rgba(190,18,60,0.34)',
    accent: '#fb7185',
  },
  {
    id: 'cyan',
    label: 'Ciano Glacial',
    shortLabel: 'Ciano',
    requiredStars: 3,
    swatch: 'linear-gradient(135deg, #cffafe, #06b6d4, #0369a1)',
    frameBg:
      'linear-gradient(135deg, #082f49 0%, #0284c7 30%, #a5f3fc 52%, #06b6d4 78%, #0c4a6e 100%)',
    shadow: '0 0 28px rgba(6,182,212,0.55), 0 0 42px rgba(165,243,252,0.26)',
    accent: '#22d3ee',
  },
  {
    id: 'emerald',
    label: 'Esmeralda Imperial',
    shortLabel: 'Esmeralda',
    requiredStars: 4,
    swatch: 'linear-gradient(135deg, #a7f3d0, #10b981, #064e3b)',
    frameBg:
      'linear-gradient(135deg, #022c22 0%, #10b981 30%, #a7f3d0 52%, #059669 78%, #064e3b 100%)',
    shadow: '0 0 28px rgba(16,185,129,0.55), 0 0 42px rgba(167,243,208,0.25)',
    accent: '#34d399',
  },
  {
    id: 'amethyst',
    label: 'Ametista Cósmica',
    shortLabel: 'Ametista',
    requiredStars: 5,
    swatch: 'linear-gradient(135deg, #e9d5ff, #9333ea, #3b0764)',
    frameBg:
      'linear-gradient(135deg, #2e1065 0%, #9333ea 30%, #f3e8ff 52%, #7e22ce 78%, #3b0764 100%)',
    shadow: '0 0 28px rgba(168,85,247,0.58), 0 0 42px rgba(216,180,254,0.28)',
    accent: '#c084fc',
  },
  {
    id: 'magma',
    label: 'Solar Magma',
    shortLabel: 'Magma',
    requiredStars: 6,
    swatch: 'linear-gradient(135deg, #fde047, #f97316, #9a3412)',
    frameBg:
      'linear-gradient(135deg, #431407 0%, #ea580c 30%, #fed7aa 52%, #dc2626 78%, #450a0a 100%)',
    shadow: '0 0 28px rgba(249,115,22,0.58), 0 0 42px rgba(251,146,60,0.32)',
    accent: '#fb923c',
  },
  {
    id: 'rose_neon',
    label: 'Rosa Neon Synth',
    shortLabel: 'Neon',
    requiredStars: 7,
    swatch: 'linear-gradient(135deg, #f9a8d4, #ec4899, #6366f1)',
    frameBg:
      'linear-gradient(135deg, #500724 0%, #ec4899 30%, #fbcfe8 50%, #6366f1 78%, #1e1b4b 100%)',
    shadow: '0 0 28px rgba(236,72,153,0.58), 0 0 42px rgba(99,102,241,0.34)',
    accent: '#f472b6',
  },
  {
    id: 'celestial',
    label: 'Platina Celestial',
    shortLabel: 'Celestial',
    requiredStars: 8,
    swatch: 'linear-gradient(135deg, #ffffff, #e2e8f0, #94a3b8)',
    frameBg:
      'linear-gradient(135deg, #1e293b 0%, #cbd5e1 28%, #ffffff 50%, #7dd3fc 76%, #0f172a 100%)',
    shadow: '0 0 30px rgba(255,255,255,0.52), 0 0 44px rgba(186,230,253,0.35)',
    accent: '#f8fafc',
  },
  {
    id: 'void',
    label: 'Eclipse Void',
    shortLabel: 'Eclipse',
    requiredStars: 9,
    swatch: 'linear-gradient(135deg, #18181b, #6d28d9, #fbbf24)',
    frameBg:
      'linear-gradient(135deg, #09090b 0%, #4c1d95 34%, #fde047 50%, #5b21b6 66%, #09090b 100%)',
    shadow: '0 0 32px rgba(139,92,246,0.65), 0 0 48px rgba(251,191,36,0.35)',
    accent: '#e879f9',
  },
];

export const IMMORTAL_AURA_PRESETS = Object.fromEntries(
  IMMORTAL_AURA_LIST.map((preset) => [preset.id, preset])
);

export const WALK_MILESTONE_XP = {
  15: 20,
  30: 30,
  45: 40,
  60: 55,
  75: 75,
  90: 105,
};

export const DIRECTOR_MILESTONE_XP = {
  20: 25,
  40: 45,
  60: 65,
  80: 85,
  90: 125,
};

export const RISING_STAR_MILESTONE_XP = {
  40: 70,
  80: 150,
  100: 125,
};

export const WALK_EXTRA_STAR_XP = 60;
export const WALK_FILMS_PER_EXTRA_STAR = 2;

export function computeWalkXpClient(
  percentage = 0,
  extraStars = 0,
  isDirector = false,
  isNewEraVisionary = false
) {
  let xp = 0;
  const table =
    isDirector && isNewEraVisionary
      ? RISING_STAR_MILESTONE_XP
      : isDirector
      ? DIRECTOR_MILESTONE_XP
      : WALK_MILESTONE_XP;
  for (const [th, reward] of Object.entries(table)) {
    if (percentage >= Number(th)) xp += reward;
  }
  xp += Math.max(0, Number(extraStars || 0)) * WALK_EXTRA_STAR_XP;
  return xp;
}

export function resolveWalkRpgRank(
  percentage = 0,
  extraStars = 0,
  isDirector = false,
  isNewEraVisionary = false
) {
  if (isDirector && isNewEraVisionary) {
    if (percentage >= 100) return 'X++';
    if (percentage >= 80) return 'X+';
    if (percentage >= 40) return 'X';
    return 'E';
  }
  if (percentage >= 90 && extraStars > 0) return 'SS';
  if (percentage >= 90) return 'S';
  if (isDirector) {
    if (percentage >= 80) return 'A+';
    if (percentage >= 60) return 'A';
    if (percentage >= 40) return 'B';
    if (percentage >= 20) return 'C';
    return 'E';
  }
  if (percentage >= 75) return 'A+';
  if (percentage >= 60) return 'A';
  if (percentage >= 45) return 'B';
  if (percentage >= 30) return 'C';
  if (percentage >= 15) return 'D';
  return 'E';
}

export const WALK_CAR_POINTS_BY_RANK = {
  D: 0.1,
  C: 0.2,
  B: 0.3,
  A: 0.4,
  'A+': 0.5,
  S: 0.6,
  SS: 0.7,
  X: 0.3,
  'X+': 0.5,
  'X++': 0.7,
};

export const ACTOR_RANK_ORDER = ['D', 'C', 'B', 'A', 'A+', 'S', 'SS'];
export const DIRECTOR_RANK_ORDER = ['C', 'B', 'A', 'A+', 'S', 'SS', 'X', 'X+', 'X++'];

export const WALK_RANK_DISPLAY_META = {
  D: {
    rank: 'D',
    label: 'Figurinhas Rank D',
    shortLabel: 'Rank D',
    badgeClass: 'bg-[#cd7f32]/25 text-amber-200 border-[#cd7f32]/65',
    barGradient: 'from-amber-700 to-orange-400',
    points: 0.1,
    actorHint: '15%–29%',
    directorHint: null,
  },
  C: {
    rank: 'C',
    label: 'Figurinhas Rank C',
    shortLabel: 'Rank C',
    badgeClass: 'bg-slate-400/20 text-slate-200 border-slate-300/60',
    barGradient: 'from-slate-400 to-zinc-200',
    points: 0.2,
    actorHint: '30%–44%',
    directorHint: '20%–39%',
  },
  B: {
    rank: 'B',
    label: 'Figurinhas Rank B',
    shortLabel: 'Rank B',
    badgeClass: 'bg-purple-500/25 text-purple-200 border-purple-400/65',
    barGradient: 'from-purple-500 to-fuchsia-400',
    points: 0.3,
    actorHint: '45%–59%',
    directorHint: '40%–59%',
  },
  A: {
    rank: 'A',
    label: 'Figurinhas Rank A',
    shortLabel: 'Rank A',
    badgeClass: 'bg-amber-500/25 text-amber-200 border-amber-400/65',
    barGradient: 'from-amber-500 to-yellow-300',
    points: 0.4,
    actorHint: '60%–74%',
    directorHint: '60%–79%',
  },
  'A+': {
    rank: 'A+',
    label: 'Figurinhas Rank A+',
    shortLabel: 'Rank A+',
    badgeClass: 'bg-rose-500/25 text-rose-200 border-rose-400/70',
    barGradient: 'from-rose-500 to-pink-400',
    points: 0.5,
    actorHint: '75%–89%',
    directorHint: '80%–89%',
  },
  S: {
    rank: 'S',
    label: 'Figurinhas Rank S',
    shortLabel: 'Rank S',
    badgeClass: 'bg-sky-500/25 text-sky-200 border-sky-400/75',
    barGradient: 'from-sky-500 to-cyan-300',
    points: 0.6,
    actorHint: '90%+',
    directorHint: '90%+',
  },
  SS: {
    rank: 'SS',
    label: 'Figurinhas Rank SS',
    shortLabel: 'Rank SS',
    badgeClass:
      'bg-gradient-to-r from-amber-400/35 via-yellow-300/25 to-sky-400/35 text-amber-100 border-amber-300/80',
    barGradient: 'from-amber-300 via-yellow-200 to-sky-400',
    points: 0.7,
    actorHint: '90%+ ★',
    directorHint: '90%+ ★',
  },
  X: {
    rank: 'X',
    label: 'Estrela em Ascensão • Rank X',
    shortLabel: 'Rank X',
    badgeClass:
      'bg-gradient-to-r from-sky-500/35 via-indigo-500/35 to-cyan-400/35 text-sky-100 border-sky-300/85',
    barGradient: 'from-sky-400 via-indigo-400 to-cyan-300',
    points: 0.3,
    actorHint: null,
    directorHint: '≤7 filmes • 40%–79%',
  },
  'X+': {
    rank: 'X+',
    label: 'Estrela em Ascensão • Rank X+',
    shortLabel: 'Rank X+',
    badgeClass:
      'bg-gradient-to-r from-indigo-500/35 via-fuchsia-500/30 to-sky-400/35 text-indigo-100 border-indigo-300/85',
    barGradient: 'from-indigo-400 via-fuchsia-400 to-sky-300',
    points: 0.5,
    actorHint: null,
    directorHint: '≤7 filmes • 80%–99%',
  },
  'X++': {
    rank: 'X++',
    label: 'Estrela em Ascensão • Rank X++',
    shortLabel: 'Rank X++',
    badgeClass:
      'bg-gradient-to-r from-amber-400/35 via-sky-400/35 to-fuchsia-400/35 text-amber-100 border-amber-300/90',
    barGradient: 'from-amber-300 via-white to-sky-400',
    points: 0.7,
    actorHint: null,
    directorHint: '≤7 filmes • 100%',
  },
};

export function resolveWalkRpgRankFromTier(
  tierKey,
  extraStars = 0,
  isDirector = false,
  isNewEraVisionary = false
) {
  const key = String(tierKey || '').toLowerCase();
  if (!key || key === 'cement' || key === 'carving') return 'E';
  if (isDirector && isNewEraVisionary) {
    if (key === 'diamond') return 'X++';
    if (key === 'mythic' || key === 'gold') return 'X+';
    if (key === 'silver' || key === 'bronze' || key === 'epic') return 'X';
    return 'E';
  }
  if (key === 'diamond') return extraStars > 0 ? 'SS' : 'S';
  if (key === 'mythic') return 'A+';
  if (key === 'gold') return 'A';
  if (isDirector) {
    if (key === 'silver') return 'B';
    if (key === 'bronze') return 'C';
    return 'E';
  }
  if (key === 'epic') return 'B';
  if (key === 'silver') return 'C';
  if (key === 'bronze') return 'D';
  return 'E';
}

export function getWalkCarPointsForRank(rank) {
  if (!rank) return 0;
  return WALK_CAR_POINTS_BY_RANK[String(rank)] || 0;
}

export const WALK_UNLOCK_ROADMAP = [
  { pct: 15, xpReward: 15, tierKey: 'bronze', icon: '💬', title: 'Frase Marcante + Colar no Álbum', short: '15% Frase (+15 XP)' },
  { pct: 30, xpReward: 25, tierKey: 'silver', icon: '🔍', title: '1ª Curiosidade de Bastidores', short: '30% Curiosidade #1 (+25 XP)' },
  { pct: 45, xpReward: 35, tierKey: 'epic', icon: '🎨', title: '5 Skins (Fotos Reais + Upload/Link)', short: '45% 5 Skins + Foto (+35 XP)' },
  { pct: 60, xpReward: 50, tierKey: 'gold', icon: '✨', title: '2ª e 3ª Curiosidades', short: '60% Curiosidades #2–#3 (+50 XP)' },
  {
    pct: 75,
    xpReward: 70,
    tierKey: 'mythic',
    icon: '🎞️',
    title: 'Linha do Tempo Cinemática & Raio-X das Décadas',
    short: '75% Linha do Tempo (+70 XP)',
  },
  {
    pct: 90,
    xpReward: 100,
    tierKey: 'diamond',
    icon: '💎',
    title: 'Edição Assinada + 10 Auras por ★ + Obra-Prima',
    short: '90% Assinada + Auras (+100 XP)',
  },
];

export const DIRECTOR_UNLOCK_ROADMAP = [
  {
    pct: 20,
    take: 1,
    xpReward: 25,
    tierKey: 'bronze',
    icon: '🎬',
    title: 'Take 1: Claquete Inicial — Figurinha + Frase de Set',
    short: '20% Take 1 (+25 XP)',
  },
  {
    pct: 40,
    take: 2,
    xpReward: 45,
    tierKey: 'silver',
    icon: '✂️',
    title: 'Take 2: Corte do Diretor — 1ª Curiosidade + Opção de Foto Própria',
    short: '40% Take 2 (+45 XP)',
  },
  {
    pct: 60,
    take: 3,
    xpReward: 65,
    tierKey: 'gold',
    icon: '🎯',
    title: 'Take 3: DNA Autoral & Manias — Bingo de Manias de Set',
    short: '60% Take 3 (+65 XP)',
  },
  {
    pct: 80,
    take: 4,
    xpReward: 85,
    tierKey: 'mythic',
    icon: '🎞️',
    title: 'Take 4: Sessão de Gala 70mm — Curiosidades #2–#3 + Obra-Prima',
    short: '80% Take 4 (+85 XP)',
  },
  {
    pct: 90,
    take: 5,
    xpReward: 125,
    tierKey: 'diamond',
    icon: '🌟',
    title: 'Take 5: Cânone Absoluto — Show de Cartazes (Oscar & Framboesa) + 10 Auras',
    short: '90% Take 5 (+125 XP)',
  },
];

export const DUBLADOR_UNLOCK_ROADMAP = [
  { pct: 15, xpReward: 15, tierKey: 'bronze', icon: '💬', title: 'Frase Marcante + Colar no Álbum', short: '15% Frase (+15 XP)' },
  { pct: 30, xpReward: 25, tierKey: 'silver', icon: '🔍', title: 'Todas as 3 Curiosidades de Bastidores', short: '30% 3 Curiosidades (+25 XP)' },
  { pct: 45, xpReward: 35, tierKey: 'epic', icon: '🎨', title: '5 Skins (Fotos Reais + Upload/Link)', short: '45% 5 Skins + Foto (+35 XP)' },
  { pct: 60, xpReward: 50, tierKey: 'gold', icon: '🎙️', title: 'Vozes Marcantes (Player de Áudio)', short: '60% Vozes Marcantes (+50 XP)' },
  {
    pct: 75,
    xpReward: 70,
    tierKey: 'mythic',
    icon: '🎞️',
    title: 'Linha do Tempo Cinemática & Raio-X das Décadas',
    short: '75% Linha do Tempo (+70 XP)',
  },
  {
    pct: 90,
    xpReward: 100,
    tierKey: 'diamond',
    icon: '💎',
    title: 'Edição Assinada + 10 Auras por ★ + Obra-Prima',
    short: '90% Assinada + Auras (+100 XP)',
  },
];

export const RISING_STAR_UNLOCK_ROADMAP = [
  {
    pct: 40,
    xpReward: 70,
    tierKey: 'silver',
    icon: '🌟',
    title: 'Rank X (40%) — Figurinha + Frase de Set + Curiosidade #1 + Foto Própria',
    short: '40% Rank X: Figurinha + Marco 40% (+70 XP)',
  },
  {
    pct: 80,
    xpReward: 150,
    tierKey: 'mythic',
    icon: '⚡',
    title: 'Rank X+ (80%) — DNA Autoral & Manias (60%) + Curiosidades #2–#3 + Obra-Prima',
    short: '80% Rank X+: Marcos 60% & 80% (+150 XP)',
  },
  {
    pct: 100,
    xpReward: 125,
    tierKey: 'diamond',
    icon: '👑',
    title: 'Rank X++ (100%) — Cânone Total: Show de Cartazes (Oscar & Framboesa) + 10 Auras',
    short: '100% Rank X++: Tudo Restante (+125 XP)',
  },
];

export function isDirectorStar(star) {
  return Boolean(star && (star.kind === 'director' || star.alameda === 'diretores'));
}

export function isDubladorStar(star) {
  return Boolean(star && (star.kind === 'dublador' || star.alameda === 'vozes'));
}

export function getUnlockRoadmapForStar(star) {
  if (isDirectorStar(star) && star?.isNewEraVisionary) {
    return RISING_STAR_UNLOCK_ROADMAP;
  }
  if (isDirectorStar(star)) {
    return DIRECTOR_UNLOCK_ROADMAP;
  }
  if (isDubladorStar(star)) {
    return DUBLADOR_UNLOCK_ROADMAP;
  }
  return WALK_UNLOCK_ROADMAP;
}

export function tierKeyForPct(pct, isDirector = false) {
  if (isDirector) {
    if (pct >= 90) return 'diamond';
    if (pct >= 80) return 'mythic';
    if (pct >= 60) return 'gold';
    if (pct >= 40) return 'silver';
    if (pct >= 20) return 'bronze';
    return 'carving';
  }
  if (pct >= 90) return 'diamond';
  if (pct >= 75) return 'mythic';
  if (pct >= 60) return 'gold';
  if (pct >= 45) return 'epic';
  if (pct >= 30) return 'silver';
  if (pct >= 15) return 'bronze';
  return 'carving';
}

export function resolveUnlocksForPct(pct, isDirector = false, isNewEraVisionary = false, isDublador = false) {
  if (isDirector && isNewEraVisionary) {
    return {
      quoteUnlocked: pct >= 40,
      curiosity1Unlocked: pct >= 40,
      skinsUnlocked: pct >= 40,
      timelineUnlocked: pct >= 80,
      curiosities23Unlocked: pct >= 80,
      galaUnlocked: pct >= 80,
      immortalUnlocked: pct >= 100,
      verdictUnlocked: pct >= 100,
      voiceClipsUnlocked: false,
    };
  }
  if (isDirector) {
    return {
      quoteUnlocked: pct >= 20,
      curiosity1Unlocked: pct >= 40,
      skinsUnlocked: pct >= 40,
      timelineUnlocked: pct >= 60,
      curiosities23Unlocked: pct >= 80,
      galaUnlocked: pct >= 80,
      immortalUnlocked: pct >= 90,
      verdictUnlocked: pct >= 90,
      voiceClipsUnlocked: false,
    };
  }
  if (isDublador) {
    return {
      quoteUnlocked: pct >= 15,
      curiosity1Unlocked: pct >= 30,
      skinsUnlocked: pct >= 45,
      curiosities23Unlocked: pct >= 30,
      timelineUnlocked: pct >= 75,
      galaUnlocked: pct >= 90,
      immortalUnlocked: pct >= 90,
      verdictUnlocked: false,
      voiceClipsUnlocked: pct >= 60,
    };
  }
  return {
    quoteUnlocked: pct >= 15,
    curiosity1Unlocked: pct >= 30,
    skinsUnlocked: pct >= 45,
    curiosities23Unlocked: pct >= 60,
    timelineUnlocked: pct >= 75,
    galaUnlocked: pct >= 90,
    immortalUnlocked: pct >= 90,
    verdictUnlocked: false,
    voiceClipsUnlocked: false,
  };
}

function buildSimulatedDecades(films) {
  const map = new Map();
  for (const f of films) {
    const y = Number(f.releaseYear);
    if (!Number.isFinite(y) || y < 1900) continue;
    const dec = Math.floor(y / 10) * 10;
    const entry = map.get(dec) || { count: 0, ratings: [], topTitle: f.title, topRating: -1 };
    entry.count++;
    if (typeof f.userRating === 'number') {
      entry.ratings.push(f.userRating);
      if (f.userRating > entry.topRating) {
        entry.topRating = f.userRating;
        entry.topTitle = f.title;
      }
    }
    map.set(dec, entry);
  }
  const decades = [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, info]) => ({
      decade,
      label: decade < 2000 ? `Anos ${String(decade).slice(2)}` : `Anos ${decade}`,
      count: info.count,
      avgRating:
        info.ratings.length > 0
          ? Number((info.ratings.reduce((acc, r) => acc + r, 0) / info.ratings.length).toFixed(1))
          : null,
      topTitle: info.topTitle,
    }));
  const favoriteDecade =
    decades.length > 0
      ? [...decades].sort((a, b) => b.count - a.count || (b.avgRating ?? -1) - (a.avgRating ?? -1))[0]
      : null;
  return { decades, favoriteDecade };
}

export function resolveEffectiveImmortalAura(rawAuraId, extraStars = 0) {
  const preset = IMMORTAL_AURA_PRESETS[rawAuraId] || IMMORTAL_AURA_PRESETS.prism;
  if ((Number(extraStars) || 0) >= preset.requiredStars) {
    return preset;
  }
  return IMMORTAL_AURA_PRESETS.prism;
}

/**
 * Aplica uma simulação não destrutiva de marco (0%–100%+★) sobre uma estrela para testes visuais.
 */
export function applySimulatedMilestoneToStar(star, simPct, simExtraStars = null, simOverrides = null) {
  if (!star) return star;
  const isDir = isDirectorStar(star);
  const isDub = isDubladorStar(star);
  const isNewEraVisionary = isDir && Boolean(star.isNewEraVisionary);
  const pct = simPct != null ? simPct : star.percentage;
  const tierKey = isNewEraVisionary
    ? pct >= 100
      ? 'diamond'
      : pct >= 80
      ? 'mythic'
      : pct >= 40
      ? 'silver'
      : pct > 0
      ? 'carving'
      : 'cement'
    : tierKeyForPct(pct, isDir);
  const theme = isNewEraVisionary
    ? getRisingStarTheme(tierKey)
    : getThemeForTier(tierKey, isDir);
  const ceiling = Number(star.ceiling || 20);
  const extraStars =
    simExtraStars != null ? simExtraStars : simPct != null ? (pct >= 100 ? 2 : 0) : Number(star.extraStars || 0);
  const simWatchedCount =
    simPct != null
      ? pct >= 100
        ? ceiling + extraStars * WALK_FILMS_PER_EXTRA_STAR
        : Math.max(pct === 0 ? 0 : 1, Math.round((pct / 100) * ceiling))
      : star.watchedCount;

  const unlocks = resolveUnlocksForPct(pct, isDir, isNewEraVisionary, isDub);
  const featuredMemberName =
    simOverrides?.featuredMemberName !== undefined
      ? simOverrides.featuredMemberName
      : star.featuredMemberName || null;
  const featuredMemberObj =
    star.kind === 'group' && Array.isArray(star.groupMembers) && star.groupMembers.length > 0
      ? star.groupMembers.find((m) => m.name === featuredMemberName) || star.groupMembers[0]
      : null;
  const resolvedBasePhoto = featuredMemberObj?.photoUrl || star.photoUrl;

  const customSkinUrl =
    simOverrides?.customSkinUrl !== undefined
      ? simOverrides.customSkinUrl
      : star.customSkinUrl || null;
  const customSkinLabel =
    simOverrides?.customSkinLabel !== undefined
      ? simOverrides.customSkinLabel
      : star.customSkinLabel || 'Minha Foto Customizada';
  const switchingProtagonistOnly =
    simOverrides?.featuredMemberName !== undefined &&
    simOverrides?.selectedSkinUrl === undefined &&
    simOverrides?.customSkinUrl === undefined;
  const selectedSkinUrl = switchingProtagonistOnly
    ? null
    : simOverrides?.selectedSkinUrl !== undefined
    ? simOverrides.selectedSkinUrl
    : star.selectedSkinUrl || null;
  const selectedSkinLabel = switchingProtagonistOnly
    ? null
    : simOverrides?.selectedSkinLabel !== undefined
    ? simOverrides.selectedSkinLabel
    : star.selectedSkinLabel || null;

  let nextSkinOptions = Array.isArray(star.skinOptions) ? [...star.skinOptions] : [];
  if (isDir) {
    nextSkinOptions = nextSkinOptions.filter(
      (s) => s.id === 'default_portrait' || s.kind === 'custom'
    );
  }
  if (customSkinUrl) {
    nextSkinOptions = nextSkinOptions.filter((s) => s.id !== 'custom_user_skin');
    nextSkinOptions.push({
      id: 'custom_user_skin',
      label: customSkinLabel || 'Minha Foto Customizada',
      sublabel: 'Prévia Personalizada (Lab)',
      imageUrl: customSkinUrl,
      kind: 'custom',
    });
  }

  const requestedAura = unlocks.immortalUnlocked
    ? simOverrides?.immortalAura || star.immortalAura || 'prism'
    : 'prism';
  const immortalAura = unlocks.immortalUnlocked
    ? resolveEffectiveImmortalAura(requestedAura, extraStars).id
    : 'prism';

  // Para testar a Linha do Tempo, Estrela em Abertura e Mesa Secreta (90%+) com dados ricos:
  let effectiveWatchedFilms = Array.isArray(star.watchedFilms) ? [...star.watchedFilms] : [];
  if (simPct != null) {
    if (pct === 0) {
      effectiveWatchedFilms = [];
    } else if (simWatchedCount < effectiveWatchedFilms.length) {
      effectiveWatchedFilms = effectiveWatchedFilms.slice(0, simWatchedCount);
    } else if (
      (pct >= (isDir ? 60 : 75) || (isDir && simWatchedCount > effectiveWatchedFilms.length)) &&
      Array.isArray(star.pendingFilms)
    ) {
      const targetFilmTotal =
        star.kind === 'director'
          ? Math.min(ceiling + Math.max(0, extraStars) * 2, Math.max(simWatchedCount, pct >= 90 ? ceiling : simWatchedCount))
          : Math.max(6, simWatchedCount);
      const existingNorm = new Set(effectiveWatchedFilms.map((f) => String(f.title || '').toLowerCase()));
      const fillers = star.pendingFilms.filter((p) => p?.title && !existingNorm.has(p.title.toLowerCase()));
      const synthScores = [9.5, 5.1, 8.9, 6.2, 9.8, 4.7, 8.3, 7.1, 9.1, 5.6, 8.6, 7.8];
      const baseYear = 2024;
      const allGroupNames = Array.isArray(star.groupMembers)
        ? star.groupMembers.map((m) => m.name).filter(Boolean)
        : [];
      const needed = Math.max(0, targetFilmTotal - effectiveWatchedFilms.length);
      fillers.slice(0, needed).forEach((pf, idx) => {
        effectiveWatchedFilms.push({
          movieId: -(idx + 101),
          title: pf.title,
          originalTitle: pf.title,
          releaseYear: pf.releaseYear || 2005 + idx * 3,
          posterUrl: pf.posterUrl || null,
          backdropUrl: null,
          userRating: synthScores[idx % synthScores.length],
          imdbRating: typeof pf.imdbRating === 'number' ? pf.imdbRating : 7.4,
          viewId: idx + 1,
          watchedAt: new Date(baseYear, idx, 10 + idx).toISOString(),
          monthSeen: (idx % 12) + 1,
          yearSeen: 2023 + Math.floor(idx / 3),
          character: pf.character || 'Papel Icônico',
          roleType: pf.roleType || (star.kind === 'director' ? 'director' : null),
          memberNames: allGroupNames,
          source: 'sim_timeline',
          isSimulatedDemo: true,
        });
      });
    }
  }

  const simDirectorStats =
    star.kind === 'director' && star.directorStats
      ? (() => {
          const bothCount = effectiveWatchedFilms.filter((f) => f.roleType === 'both').length;
          const directedOnlyCount = effectiveWatchedFilms.filter((f) => f.roleType === 'director').length;
          const writtenOnlyCount = effectiveWatchedFilms.filter((f) => f.roleType === 'writer').length;
          return {
            ...star.directorStats,
            bothCount,
            directedOnlyCount,
            writtenOnlyCount,
            totalDirectedWatched: bothCount + directedOnlyCount,
            totalWrittenWatched: bothCount + writtenOnlyCount,
          };
        })()
      : star.directorStats || null;

  const ratedEffective = effectiveWatchedFilms
    .filter((f) => typeof f.userRating === 'number')
    .sort((a, b) => Number(b.userRating) - Number(a.userRating) || (b.releaseYear || 0) - (a.releaseYear || 0));
  const simAvgRating =
    ratedEffective.length > 0
      ? Number((ratedEffective.reduce((acc, f) => acc + f.userRating, 0) / ratedEffective.length).toFixed(1))
      : pct === 0
      ? null
      : star.avgUserRating;
  const topUserFilm = ratedEffective.length > 0 ? ratedEffective[0] : effectiveWatchedFilms[0] || (pct === 0 ? null : star.topUserFilm) || null;
  const worstUserFilm = ratedEffective.length > 0 ? ratedEffective[ratedEffective.length - 1] : (pct === 0 ? null : star.worstUserFilm) || null;

  const chosenSigId =
    simOverrides?.signatureMovieId !== undefined
      ? simOverrides.signatureMovieId
      : star.signatureMovieId;
  const sigFilm =
    (chosenSigId && effectiveWatchedFilms.find((f) => Number(f.movieId) === Number(chosenSigId))) ||
    ratedEffective[0] ||
    effectiveWatchedFilms[0] ||
    star.signatureFilm ||
    null;

  const simDecadeBreakdown =
    effectiveWatchedFilms.length > (star.watchedFilms?.length || 0)
      ? buildSimulatedDecades(effectiveWatchedFilms)
      : star.decadeBreakdown;

  const rawBaseMilestones = Array.isArray(star.milestones) ? star.milestones : [];
  const baseMilestones = isNewEraVisionary
    ? RISING_STAR_UNLOCK_ROADMAP.map((r) => ({
        thresholdPct: r.pct,
        id: `estrela_ascensao_${r.pct}`,
        tierKey: r.tierKey,
        label: r.title,
        icon: r.icon,
        accentHex: getRisingStarTheme(r.tierKey).accentHex,
        xpReward: r.xpReward,
        targetCount: Math.max(1, Math.round((r.pct / 100) * ceiling)),
      }))
    : isDir && rawBaseMilestones.length !== 5
    ? DIRECTOR_UNLOCK_ROADMAP.map((r) => ({
        thresholdPct: r.pct,
        tierKey: r.tierKey,
        label: r.title,
        icon: r.icon,
        xpReward: r.xpReward,
        targetCount: Math.max(1, Math.round((r.pct / 100) * ceiling)),
      }))
    : rawBaseMilestones;
  const nextMilestones = baseMilestones.map((m) => ({
    ...m,
    unlocked: pct >= m.thresholdPct,
    remainingFilms: pct >= m.thresholdPct ? 0 : Math.max(1, (m.targetCount || 1) - simWatchedCount),
  }));

  const unlockFloor = isDir ? (isNewEraVisionary ? 40 : 20) : 15;
  const nextMilestone = nextMilestones.find((m) => !m.unlocked) || null;
  const simPotentialXp = computeWalkXpClient(
    Math.min(100, pct),
    extraStars,
    isDir,
    isNewEraVisionary
  );

  return {
    ...star,
    percentage: Math.min(100, pct),
    watchedCount: simWatchedCount,
    extraStars,
    rpgRank: resolveWalkRpgRank(Math.min(100, pct), extraStars, isDir, isNewEraVisionary),
    rpgClassLabel: star.rpgClassLabel || star.rpgTitle || star.tagline,
    statusTierKey: tierKey,
    statusLabel: theme.label,
    statusIcon: theme.icon,
    accentHex: theme.accentHex,
    isStickerUnlocked: pct >= unlockFloor,
    isInaugurated: pct >= unlockFloor,
    isDiamond: isNewEraVisionary ? pct >= 100 : pct >= 90,
    isStuck: pct >= unlockFloor,
    stuckTier: pct >= unlockFloor ? tierKey : null,
    featuredMemberName: featuredMemberObj?.name || featuredMemberName,
    photoUrl: resolvedBasePhoto,
    skinOptions: nextSkinOptions,
    customSkinUrl,
    customSkinLabel,
    selectedSkinUrl,
    selectedSkinLabel,
    activePhotoUrl: unlocks.skinsUnlocked && selectedSkinUrl ? selectedSkinUrl : resolvedBasePhoto,
    immortalAura,
    signatureMovieId: sigFilm ? Number(sigFilm.movieId) : null,
    signatureFilm: sigFilm
      ? {
          movieId: Number(sigFilm.movieId),
          title: sigFilm.title,
          releaseYear: sigFilm.releaseYear || null,
          userRating: sigFilm.userRating ?? null,
          character: sigFilm.character || null,
        }
      : null,
    watchedFilms: effectiveWatchedFilms,
    directorStats: simDirectorStats,
    directorObsessions:
      Array.isArray(star.directorObsessions) && star.directorObsessions.length > 0
        ? star.directorObsessions
        : isDirectorStar(star)
        ? [
            {
              icon: '🎬',
              title: 'Assinatura Visual de Enquadramento',
              description: 'Planos sequência, enquadramentos simétricos e ritmo de montagem inconfundível.',
            },
            {
              icon: '✍️',
              title: 'Subtexto & Virada no Terceiro Ato',
              description: 'Camadas ocultas nos diálogos que mudam de sentido perto do desfecho.',
            },
            {
              icon: '🔊',
              title: 'Clima Sonoro Tenso',
              description: 'Silêncios calculados e trilha musical usada como armadilha narrativa.',
            },
          ]
        : [],
    avgUserRating: simAvgRating,
    topUserFilm,
    worstUserFilm,
    potentialXp: simPotentialXp,
    rpgXp: star.isSimulated ? simPotentialXp : star.claimedXp ?? simPotentialXp,
    decadeBreakdown: simDecadeBreakdown,
    unlocks,
    voiceClipsUnlocked: Boolean(unlocks.voiceClipsUnlocked),
    milestones: nextMilestones,
    nextMilestone,
    rpgStats: undefined,
    isSimulated: simPct != null || simExtraStars != null || Boolean(simOverrides),
  };
}
