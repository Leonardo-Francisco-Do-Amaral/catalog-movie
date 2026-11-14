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

export function getThemeForTier(tierKey) {
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

export function resolveWalkMediaUrl(url) {
  if (!url) return null;
  const s = String(url);
  if (s.startsWith('/uploads')) return `http://localhost:5000${s}`;
  return s;
}

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

export const WALK_EXTRA_STAR_XP = 60;
export const WALK_FILMS_PER_EXTRA_STAR = 2;

export function computeWalkXpClient(percentage = 0, extraStars = 0) {
  let xp = 0;
  for (const [th, reward] of Object.entries(WALK_MILESTONE_XP)) {
    if (percentage >= Number(th)) xp += reward;
  }
  xp += Math.max(0, Number(extraStars || 0)) * WALK_EXTRA_STAR_XP;
  return xp;
}

export function resolveWalkRpgRank(percentage = 0, extraStars = 0) {
  if (percentage >= 90 && extraStars > 0) return 'SS';
  if (percentage >= 90) return 'S';
  if (percentage >= 75) return 'A+';
  if (percentage >= 60) return 'A';
  if (percentage >= 45) return 'B';
  if (percentage >= 30) return 'C';
  if (percentage >= 15) return 'D';
  return 'E';
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

export function tierKeyForPct(pct) {
  if (pct >= 90) return 'diamond';
  if (pct >= 75) return 'mythic';
  if (pct >= 60) return 'gold';
  if (pct >= 45) return 'epic';
  if (pct >= 30) return 'silver';
  if (pct >= 15) return 'bronze';
  return 'carving';
}

export function resolveUnlocksForPct(pct) {
  return {
    quoteUnlocked: pct >= 15,
    curiosity1Unlocked: pct >= 30,
    skinsUnlocked: pct >= 45,
    curiosities23Unlocked: pct >= 60,
    timelineUnlocked: pct >= 75,
    immortalUnlocked: pct >= 90,
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
  const pct = simPct != null ? simPct : star.percentage;
  const tierKey = tierKeyForPct(pct);
  const theme = getThemeForTier(tierKey);
  const ceiling = Number(star.ceiling || 20);
  const extraStars =
    simExtraStars != null ? simExtraStars : simPct != null ? (pct >= 100 ? 2 : 0) : Number(star.extraStars || 0);
  const simWatchedCount =
    simPct != null
      ? pct >= 100
        ? ceiling + extraStars * WALK_FILMS_PER_EXTRA_STAR
        : Math.max(pct === 0 ? 0 : 1, Math.round((pct / 100) * ceiling))
      : star.watchedCount;

  const unlocks = resolveUnlocksForPct(pct);
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

  // Para testar a Linha do Tempo e Obra-Prima em 75%+ mesmo se a estrela tiver poucos filmes no DB:
  let effectiveWatchedFilms = Array.isArray(star.watchedFilms) ? [...star.watchedFilms] : [];
  if (simPct != null && pct >= 75 && effectiveWatchedFilms.length < 5 && Array.isArray(star.pendingFilms)) {
    const existingNorm = new Set(effectiveWatchedFilms.map((f) => String(f.title || '').toLowerCase()));
    const fillers = star.pendingFilms.filter((p) => p?.title && !existingNorm.has(p.title.toLowerCase()));
    const synthScores = [9.5, 6.2, 8.9, 7.1, 9.8, 7.6];
    const baseYear = 2024;
    const allGroupNames = Array.isArray(star.groupMembers)
      ? star.groupMembers.map((m) => m.name).filter(Boolean)
      : [];
    fillers.slice(0, 6 - effectiveWatchedFilms.length).forEach((pf, idx) => {
      effectiveWatchedFilms.push({
        movieId: -(idx + 101),
        title: pf.title,
        originalTitle: pf.title,
        releaseYear: pf.releaseYear || 2005 + idx * 3,
        posterUrl: pf.posterUrl || null,
        backdropUrl: null,
        userRating: synthScores[idx % synthScores.length],
        imdbRating: 8.1,
        viewId: idx + 1,
        watchedAt: new Date(baseYear, idx, 10 + idx).toISOString(),
        monthSeen: (idx % 12) + 1,
        yearSeen: 2023 + Math.floor(idx / 3),
        character: pf.character || 'Papel Icônico',
        memberNames: allGroupNames,
        source: 'sim_timeline',
        isSimulatedDemo: true,
      });
    });
  }

  const ratedEffective = effectiveWatchedFilms
    .filter((f) => typeof f.userRating === 'number')
    .sort((a, b) => Number(b.userRating) - Number(a.userRating) || (b.releaseYear || 0) - (a.releaseYear || 0));
  const simAvgRating =
    ratedEffective.length > 0
      ? Number((ratedEffective.reduce((acc, f) => acc + f.userRating, 0) / ratedEffective.length).toFixed(1))
      : star.avgUserRating;
  const topUserFilm = ratedEffective.length > 0 ? ratedEffective[0] : effectiveWatchedFilms[0] || star.topUserFilm || null;
  const worstUserFilm = ratedEffective.length > 0 ? ratedEffective[ratedEffective.length - 1] : star.worstUserFilm || null;

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

  const baseMilestones = Array.isArray(star.milestones) ? star.milestones : [];
  const nextMilestones = baseMilestones.map((m) => ({
    ...m,
    unlocked: pct >= m.thresholdPct,
    remainingFilms: pct >= m.thresholdPct ? 0 : Math.max(1, (m.targetCount || 1) - simWatchedCount),
  }));

  const nextMilestone = nextMilestones.find((m) => !m.unlocked) || null;
  const simPotentialXp = computeWalkXpClient(Math.min(100, pct), extraStars);

  return {
    ...star,
    percentage: Math.min(100, pct),
    watchedCount: simWatchedCount,
    extraStars,
    rpgRank: resolveWalkRpgRank(Math.min(100, pct), extraStars),
    rpgClassLabel: star.rpgClassLabel || star.rpgTitle || star.tagline,
    statusTierKey: tierKey,
    statusLabel: theme.label,
    statusIcon: theme.icon,
    accentHex: theme.accentHex,
    isStickerUnlocked: pct >= 15,
    isInaugurated: pct >= 15,
    isDiamond: pct >= 90,
    isStuck: pct >= 15,
    stuckTier: pct >= 15 ? tierKey : null,
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
    avgUserRating: simAvgRating,
    topUserFilm,
    worstUserFilm,
    potentialXp: simPotentialXp,
    rpgXp: star.isSimulated ? simPotentialXp : star.claimedXp ?? simPotentialXp,
    decadeBreakdown: simDecadeBreakdown,
    unlocks,
    milestones: nextMilestones,
    nextMilestone,
    rpgStats: undefined,
    isSimulated: simPct != null || simExtraStars != null || Boolean(simOverrides),
  };
}
