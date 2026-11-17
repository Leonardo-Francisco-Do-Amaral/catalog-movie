export const VOICE_ALBUM_CEILING = 20;
export const VOICE_WORKS_PER_EXTRA_STAR = 3;
export const VOICE_EXTRA_STAR_XP = 75;

export const VOICE_RARITY_THEMES = {
  locked: {
    key: 'locked',
    tcgCode: '封印',
    shortTag: 'SELO OFUDA',
    label: 'Não Desbloqueada',
    icon: '🔒',
    pctHint: '0%–14% (0–2 obras)',
    xpReward: 0,
    accentHex: '#a1a1aa',
    frameBackground: 'linear-gradient(135deg, #3f3f46, #18181b 52%, #52525b)',
    innerTrimColor: 'rgba(161, 161, 170, 0.25)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
    badgeStyle: {
      backgroundColor: 'rgba(39, 39, 42, 0.9)',
      borderColor: 'rgba(161, 161, 170, 0.45)',
      color: '#d4d4d8',
    },
    metallicType: 'matte',
  },
  common: {
    key: 'common',
    tcgCode: 'C',
    shortTag: 'INVOCAÇÃO INICIAL',
    label: 'Comum',
    icon: '🎟️',
    pctHint: '15%+ (3 obras)',
    xpReward: 30,
    accentHex: '#f59e0b',
    frameBackground: 'linear-gradient(135deg, #78350f, #d97706 28%, #fde68a 52%, #b45309 76%, #451a03)',
    innerTrimColor: 'rgba(253, 186, 116, 0.7)',
    boxShadow: '0 10px 28px rgba(217, 119, 6, 0.35)',
    badgeStyle: {
      backgroundColor: 'rgba(120, 53, 15, 0.92)',
      borderColor: 'rgba(253, 186, 116, 0.8)',
      color: '#ffedd5',
    },
    metallicType: 'shinobi_bronze',
  },
  uncommon: {
    key: 'uncommon',
    tcgCode: 'UC',
    shortTag: 'GRIMÓRIO DE PAPÉIS',
    label: 'Incomum',
    icon: '⚔️',
    pctHint: '30%+ (5 obras)',
    xpReward: 55,
    accentHex: '#e0f2fe',
    frameBackground: 'linear-gradient(135deg, #334155, #bae6fd 26%, #ffffff 50%, #94a3b8 74%, #1e293b)',
    innerTrimColor: 'rgba(224, 242, 254, 0.85)',
    boxShadow: '0 10px 30px rgba(186, 230, 253, 0.34)',
    badgeStyle: {
      backgroundColor: 'rgba(30, 41, 59, 0.94)',
      borderColor: '#e0f2fe',
      color: '#ffffff',
    },
    metallicType: 'zanpakuto_silver',
  },
  rare: {
    key: 'rare',
    tcgCode: 'R',
    shortTag: 'ARTE LIVRE & FLIP 3D',
    label: 'Rara',
    icon: '🧪',
    pctHint: '45%+ (8 obras)',
    xpReward: 75,
    accentHex: '#34d399',
    frameBackground: 'linear-gradient(135deg, #064e3b, #34d399 28%, #22d3ee 54%, #a855f7 80%, #022c22)',
    innerTrimColor: 'rgba(110, 231, 183, 0.85)',
    boxShadow: '0 12px 34px rgba(52, 211, 153, 0.42)',
    badgeStyle: {
      backgroundColor: 'rgba(6, 78, 59, 0.94)',
      borderColor: '#6ee7b7',
      color: '#ecfdf5',
    },
    metallicType: 'alchemical_emerald',
  },
  super_rare: {
    key: 'super_rare',
    tcgCode: 'SR',
    shortTag: 'RADAR DE AFINIDADE',
    label: 'Super Rara',
    icon: '⚡',
    pctHint: '60%+ (11 obras)',
    xpReward: 90,
    accentHex: '#c084fc',
    frameBackground: 'linear-gradient(135deg, #2e1065, #a855f7 25%, #ec4899 52%, #22d3ee 78%, #09090b)',
    innerTrimColor: 'rgba(216, 180, 254, 0.9)',
    boxShadow: '0 12px 36px rgba(168, 85, 247, 0.48)',
    badgeStyle: {
      backgroundColor: 'rgba(59, 7, 100, 0.94)',
      borderColor: '#d8b4fe',
      color: '#f3e8ff',
    },
    metallicType: 'cyber_akihabara',
  },
  legendary: {
    key: 'legendary',
    tcgCode: 'LR',
    shortTag: 'CRÔNICA DE BATALHA',
    label: 'Lendária',
    icon: '🌟',
    pctHint: '75%+ (14 obras)',
    xpReward: 130,
    accentHex: '#facc15',
    frameBackground:
      'linear-gradient(135deg, #713f12, #fde047 22%, #fef9c3 46%, #ca8a04 68%, #facc15 88%, #78350f)',
    innerTrimColor: 'rgba(254, 240, 138, 0.95)',
    boxShadow: '0 14px 38px rgba(250, 204, 21, 0.5)',
    badgeStyle: {
      backgroundColor: 'rgba(113, 63, 18, 0.94)',
      borderColor: 'rgba(254, 240, 138, 0.95)',
      color: '#fef9c3',
    },
    metallicType: 'saiyan_gold_24k',
  },
  mythic: {
    key: 'mythic',
    tcgCode: 'UR',
    shortTag: 'DESPERTAR SUPREMO',
    label: 'Mítica Suprema',
    icon: '🩸',
    pctHint: '100% (20 obras)',
    xpReward: 180,
    accentHex: '#f43f5e',
    frameBackground:
      'linear-gradient(125deg, #f43f5e 0%, #fb7185 20%, #fef08a 45%, #a855f7 72%, #38bdf8 90%, #e11d48 100%)',
    innerTrimColor: 'rgba(254, 205, 211, 0.95)',
    boxShadow: '0 14px 44px rgba(244, 63, 94, 0.58), 0 0 28px rgba(168, 85, 247, 0.4)',
    badgeStyle: {
      backgroundColor: 'rgba(136, 19, 55, 0.94)',
      borderColor: '#fda4af',
      color: '#ffe4e6',
    },
    metallicType: 'bankai_prism',
  },
};

export const VOICE_IMMORTAL_AURA_LIST = [
  {
    id: 'sakura_prism',
    label: 'Sakura Prismática',
    shortLabel: 'Sakura',
    requiredStars: 0,
    swatch: 'linear-gradient(135deg, #ec4899, #a855f7, #38bdf8)',
    frameBg: 'linear-gradient(135deg, #ec4899 0%, #a855f7 32%, #38bdf8 66%, #f43f5e 100%)',
    shadow: '0 0 28px rgba(236,72,153,0.55), 0 0 44px rgba(168,85,247,0.35)',
    accent: '#f472b6',
  },
  {
    id: 'bankai_crimson',
    label: 'Bankai Eclipse Carmesim',
    shortLabel: 'Bankai',
    requiredStars: 1,
    swatch: 'linear-gradient(135deg, #ef4444, #991b1b, #fb7185)',
    frameBg: 'linear-gradient(135deg, #450a0a 0%, #ef4444 35%, #fecdd3 52%, #b91c1c 80%, #450a0a 100%)',
    shadow: '0 0 32px rgba(239,68,68,0.65), 0 0 46px rgba(185,28,28,0.42)',
    accent: '#fb7185',
  },
  {
    id: 'saiyan_gold',
    label: 'Aura Super Saiyajin 24K',
    shortLabel: 'Saiyajin',
    requiredStars: 2,
    swatch: 'linear-gradient(135deg, #fef08a, #facc15, #b45309)',
    frameBg: 'linear-gradient(135deg, #78350f 0%, #f59e0b 30%, #fef08a 52%, #eab308 76%, #78350f 100%)',
    shadow: '0 0 32px rgba(250,204,21,0.62), 0 0 45px rgba(254,240,138,0.34)',
    accent: '#facc15',
  },
  {
    id: 'alchemy_gold',
    label: 'Alquimia da Verdade',
    shortLabel: 'Alquimia',
    requiredStars: 3,
    swatch: 'linear-gradient(135deg, #fbbf24, #d97706, #fef3c7)',
    frameBg: 'linear-gradient(135deg, #451a03 0%, #fbbf24 35%, #ffffff 55%, #b45309 82%, #1c1917 100%)',
    shadow: '0 0 28px rgba(251,191,36,0.58), 0 0 42px rgba(217,119,6,0.35)',
    accent: '#fbbf24',
  },
  {
    id: 'gear5_lunar',
    label: 'Branco Lunar Gear 5',
    shortLabel: 'Gear 5',
    requiredStars: 4,
    swatch: 'linear-gradient(135deg, #ffffff, #e0e7ff, #c084fc)',
    frameBg: 'linear-gradient(135deg, #312e81 0%, #f8fafc 32%, #e9d5ff 55%, #a855f7 80%, #1e1b4b 100%)',
    shadow: '0 0 30px rgba(248,250,252,0.55), 0 0 46px rgba(192,132,252,0.4)',
    accent: '#e9d5ff',
  },
  {
    id: 'digivice_royal',
    label: 'Cavaleiro Real Ômega',
    shortLabel: 'Ômega',
    requiredStars: 5,
    swatch: 'linear-gradient(135deg, #38bdf8, #2563eb, #facc15)',
    frameBg: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 30%, #fef08a 52%, #2563eb 78%, #09090b 100%)',
    shadow: '0 0 30px rgba(56,189,248,0.55), 0 0 42px rgba(37,99,235,0.4)',
    accent: '#38bdf8',
  },
  {
    id: 'given_strat',
    label: 'Palco Acústico Sunset',
    shortLabel: 'Given',
    requiredStars: 6,
    swatch: 'linear-gradient(135deg, #fb923c, #f43f5e, #c084fc)',
    frameBg: 'linear-gradient(135deg, #431407 0%, #fb923c 30%, #fda4af 54%, #a855f7 82%, #18181b 100%)',
    shadow: '0 0 30px rgba(251,146,60,0.55), 0 0 42px rgba(244,63,94,0.35)',
    accent: '#fb923c',
  },
  {
    id: 'infinite_void',
    label: 'Vazio Infinito Violeta',
    shortLabel: 'Infinito',
    requiredStars: 7,
    swatch: 'linear-gradient(135deg, #7e22ce, #a855f7, #22d3ee)',
    frameBg: 'linear-gradient(135deg, #2e1065 0%, #a855f7 32%, #22d3ee 58%, #6b21a8 84%, #09090b 100%)',
    shadow: '0 0 32px rgba(168,85,247,0.62), 0 0 44px rgba(34,211,238,0.38)',
    accent: '#c084fc',
  },
  {
    id: 'jade_shinobi',
    label: 'Chama Esmeralda Shinobi',
    shortLabel: 'Jade',
    requiredStars: 8,
    swatch: 'linear-gradient(135deg, #10b981, #34d399, #22d3ee)',
    frameBg: 'linear-gradient(135deg, #022c22 0%, #10b981 32%, #a7f3d0 54%, #06b6d4 82%, #022c22 100%)',
    shadow: '0 0 30px rgba(16,185,129,0.58), 0 0 42px rgba(34,211,238,0.35)',
    accent: '#34d399',
  },
  {
    id: 'abyss_obsidian',
    label: 'Abismo Cósmico Kuro',
    shortLabel: 'Kuro',
    requiredStars: 9,
    swatch: 'linear-gradient(135deg, #09090b, #f43f5e, #38bdf8)',
    frameBg: 'linear-gradient(135deg, #09090b 0%, #f43f5e 30%, #ffffff 50%, #38bdf8 74%, #09090b 100%)',
    shadow: '0 0 34px rgba(244,63,94,0.58), 0 0 48px rgba(56,189,248,0.42)',
    accent: '#f43f5e',
  },
];

export const VOICE_IMMORTAL_AURA_PRESETS = Object.fromEntries(
  VOICE_IMMORTAL_AURA_LIST.map((a) => [a.id, a])
);

export const VOICE_UNLOCK_ROADMAP = [
  {
    pct: 15,
    xpReward: 30,
    tierKey: 'common',
    tierLabel: 'Comum',
    icon: '💬',
    title: 'Bordão Marcante + Colar Figurinha no Álbum',
    short: '15% Comum (+30 XP)',
  },
  {
    pct: 15,
    worksRequired: 3,
    xpReward: 30,
    tierKey: 'common',
    tierLabel: 'Comum',
    tcgCode: 'C',
    icon: '🎟️',
    title: 'Invocação Inicial + Personagem Principal + Medalhão Seiyū',
    short: '15% Comum (3 obras · +30 XP)',
  },
  {
    pct: 30,
    worksRequired: 5,
    xpReward: 55,
    tierKey: 'uncommon',
    tierLabel: 'Incomum',
    tcgCode: 'UC',
    icon: '⚔️',
    title: 'Grimório de Papéis + Selo Camaleão Vocal (3+ papéis)',
    short: '30% Incomum (5 obras · +55 XP)',
  },
  {
    pct: 45,
    worksRequired: 8,
    xpReward: 75,
    tierKey: 'rare',
    tierLabel: 'Rara',
    tcgCode: 'R',
    icon: '🧪',
    title: 'Troca de Arte Livre + Flip 3D (Frente/Verso)',
    short: '45% Rara (8 obras · +75 XP)',
  },
  {
    pct: 60,
    worksRequired: 11,
    xpReward: 90,
    tierKey: 'super_rare',
    tierLabel: 'Super Rara',
    tcgCode: 'SR',
    icon: '⚡',
    title: 'Radar de Afinidade + Gêneros Dominantes',
    short: '60% Super Rara (11 obras · +90 XP)',
  },
  {
    pct: 75,
    worksRequired: 14,
    xpReward: 130,
    tierKey: 'legendary',
    tierLabel: 'Lendária',
    tcgCode: 'LR',
    icon: '🌟',
    title: 'Crônica de Batalha (Décadas & Média Geral)',
    short: '75% Lendária (14 obras · +130 XP)',
  },
  {
    pct: 100,
    worksRequired: 20,
    xpReward: 180,
    tierKey: 'mythic',
    tierLabel: 'Mítica Suprema',
    tcgCode: 'UR',
    icon: '🩸',
    title: 'Despertar: Assinatura Caligráfica + Obra-Prima + Auras (★ = +75 XP)',
    short: '100% Mítica (20 obras · +180 XP)',
  },
];

export const VOICE_RANK_META = {
  E: { rank: 'E', badgeClass: 'bg-zinc-800/90 text-zinc-400 border-zinc-700' },
  D: { rank: 'D', badgeClass: 'bg-amber-900/40 text-amber-200 border-amber-600/70' },
  C: { rank: 'C', badgeClass: 'bg-slate-400/20 text-slate-200 border-slate-300/65' },
  B: { rank: 'B', badgeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/70' },
  A: { rank: 'A', badgeClass: 'bg-purple-500/25 text-purple-200 border-purple-400/75' },
  'A+': { rank: 'A+', badgeClass: 'bg-yellow-500/25 text-yellow-200 border-yellow-400/80' },
  S: { rank: 'S', badgeClass: 'bg-rose-500/30 text-rose-100 border-rose-400/85 shadow-[0_0_12px_rgba(244,63,94,0.4)]' },
  SS: {
    rank: 'SS',
    badgeClass:
      'bg-gradient-to-r from-rose-500/40 via-amber-400/35 to-sky-400/40 text-amber-100 border-amber-300/90 shadow-[0_0_14px_rgba(251,191,36,0.45)]',
  },
};

export function getThemeForVoiceTier(tierKey) {
  return VOICE_RARITY_THEMES[tierKey] || VOICE_RARITY_THEMES.locked;
}

export function resolveEffectiveVoiceAura(auraId, extraStars = 0) {
  const preset = VOICE_IMMORTAL_AURA_PRESETS[auraId] || VOICE_IMMORTAL_AURA_PRESETS.sakura_prism;
  if ((Number(extraStars) || 0) >= preset.requiredStars) return preset;
  return VOICE_IMMORTAL_AURA_PRESETS.sakura_prism;
}

export function tierKeyForVoicePct(pct) {
  if (pct >= 100) return 'mythic';
  if (pct >= 75) return 'legendary';
  if (pct >= 60) return 'super_rare';
  if (pct >= 45) return 'rare';
  if (pct >= 30) return 'uncommon';
  if (pct >= 15) return 'common';
  return 'locked';
}

export function resolveVoiceRpgRankForPct(pct, extraStars = 0) {
  if (pct >= 100 && extraStars > 0) return 'SS';
  if (pct >= 100) return 'S';
  if (pct >= 75) return 'A+';
  if (pct >= 60) return 'A';
  if (pct >= 45) return 'B';
  if (pct >= 30) return 'C';
  if (pct >= 15) return 'D';
  return 'E';
}

export function resolveVoiceUnlocksForPct(pct) {
  return {
    quoteUnlocked: pct >= 15,
    rolesGrimoireUnlocked: pct >= 30,
    skinsUnlocked: pct >= 45,
    affinityRadarUnlocked: pct >= 60,
    timelineUnlocked: pct >= 75,
    mythicSignedUnlocked: pct >= 100,
    aurasUnlocked: pct >= 100,
  };
}

/**
 * Formata as Estrelas de Prestígio Infinitas (> 20 obras):
 * - 1 a 6 estrelas: renderiza individualmente ('★' até '★★★★★★')
 * - 7+ estrelas: renderiza com contador numérico ('★ 7', '★ 8', '★ 12', etc.)
 */
export function formatVoiceStars(extraStars) {
  const count = Math.max(0, Number(extraStars || 0));
  if (count <= 0) return null;
  if (count <= 6) {
    return {
      text: '★'.repeat(count),
      count,
      isCompact: false,
    };
  }
  return {
    text: `★ ${count}`,
    count,
    isCompact: true,
  };
}

/**
 * Selo de Afinidade Vocal baseado na nota média do usuário.
 */
export function getAffinityTag(avgRating, totalWorks = 0) {
  if (typeof avgRating !== 'number' || !Number.isFinite(avgRating)) {
    return { label: 'Selo em Avaliação', color: '#a1a1aa' };
  }
  if (avgRating >= 9.0) return { label: '💖 Alma Gêmea Vocal', color: '#f472b6' };
  if (avgRating >= 8.0) return { label: '🔥 Favorito da Temporada', color: '#fbbf24' };
  if (avgRating >= 7.0) return { label: '⚔️ Aliado Confiável', color: '#38bdf8' };
  if (totalWorks >= 5) return { label: '🎭 Voz Ótima, Roteiro Duro', color: '#c084fc' };
  return { label: '🌱 Em Observação', color: '#94a3b8' };
}

export function computeVoiceXpForSimPct(pct, extraStars = 0) {
  let xp = 0;
  for (const step of VOICE_UNLOCK_ROADMAP) {
    if (pct >= step.pct) xp += step.xpReward;
  }
  xp += Math.max(0, Number(extraStars || 0)) * VOICE_EXTRA_STAR_XP;
  return xp;
}

/**
 * Converte quantidade de obras em pct e extraStars sobre teto 20:
 * - 0–2 obras: 0%–14% (Lacrada)
 * - 3 obras: 15% (Comum C, +30 XP)
 * - 5 obras: 30% (Incomum UC, +55 XP)
 * - 8 obras: 45% (Rara R, +75 XP)
 * - 11 obras: 60% (Super Rara SR, +90 XP)
 * - 14 obras: 75% (Lendária LR, +130 XP)
 * - 20 obras: 100% (Mítica UR, +180 XP)
 * - Cada +3 obras acima de 20: +1 Estrela (+75 XP)
 */
export function resolveWorksProgress(worksCount) {
  const safeWorks = Math.max(0, Number(worksCount || 0));
  const ceiling = VOICE_ALBUM_CEILING; // 20

  let percentage = 0;
  if (safeWorks >= 20) percentage = 100;
  else if (safeWorks >= 14) percentage = 75;
  else if (safeWorks >= 11) percentage = 60;
  else if (safeWorks >= 8) percentage = 45;
  else if (safeWorks >= 5) percentage = 30;
  else if (safeWorks >= 3) percentage = 15;
  else percentage = Math.min(14, Math.floor((safeWorks / ceiling) * 100));

  const extraStars =
    safeWorks > ceiling
      ? Math.floor((safeWorks - ceiling) / VOICE_WORKS_PER_EXTRA_STAR)
      : 0;

  const worksToUnlock15 = Math.max(0, 3 - safeWorks);

  return {
    safeWorks,
    percentage,
    extraStars,
    ceiling,
    worksToUnlock15,
  };
}

/**
 * Aplica simulação contínua por número de obras (0 a 60) ou por porcentagem.
 */
export function applySimulatedVoiceMilestone(voice, simValue, simExtraStars = null) {
  if (!voice || simValue == null) return voice;

  // Se simValue for >= 0 e <= 60 com intenção de ser número de obras:
  // ou se for pct de marco (15, 30, 45, 60, 75, 100)
  let worksCount = 0;
  let pct = 0;
  let extraStars = 0;

  if (typeof simValue === 'number') {
    // Pode ser works direto (ex: slider 0 a 60)
    // Se for exatamente os marcos pct (15, 30, 45, 60, 75) e simExtraStars == null:
    if (simValue === 15) worksCount = 3;
    else if (simValue === 30) worksCount = 5;
    else if (simValue === 45) worksCount = 8;
    else if (simValue === 60) worksCount = 11;
    else if (simValue === 75) worksCount = 14;
    else if (simValue === 100 && simExtraStars != null) worksCount = 20 + Number(simExtraStars) * 3;
    else if (simValue === 100) worksCount = 20;
    else worksCount = simValue; // Slider contínuo de obras direto!
  }

  const progress = resolveWorksProgress(worksCount);
  pct = progress.percentage;
  extraStars = simExtraStars != null ? Number(simExtraStars) : progress.extraStars;

  const tierKey = tierKeyForVoicePct(pct);
  const theme = getThemeForVoiceTier(tierKey);
  const rpgRank = resolveVoiceRpgRankForPct(pct, extraStars);
  const simXp = computeVoiceXpForSimPct(pct, extraStars);

  return {
    ...voice,
    isSimulated: true,
    percentage: pct,
    progressPercentage: pct,
    extraStars,
    totalWorksCount: worksCount,
    currentTier: tierKey,
    tierLabel: theme.label,
    tierIcon: theme.icon,
    tcgCode: theme.tcgCode,
    rpgRank,
    isStickerUnlocked: pct >= 15,
    isStuck: pct >= 15,
    stuckTier: pct >= 15 ? tierKey : null,
    stuckExtraStars: pct >= 15 ? extraStars : 0,
    hasRarityUpgradeToStick: false,
    potentialXp: simXp,
    claimedXp: simXp,
    xpEarned: simXp,
    unclaimedXp: 0,
    worksToUnlock15: progress.worksToUnlock15,
    signatureWork:
      voice.signatureWork ||
      (voice.combinedWorks && voice.combinedWorks[0]) ||
      (pct >= 100 ? { title: voice.knownFor?.split('•')[0]?.trim() || 'Obra Lendária', userRating: 9.8 } : null),
  };
}
