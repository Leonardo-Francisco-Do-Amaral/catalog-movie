export const SECRET_DECK_BACK_IMAGE = '/secret-draw/deck-back.jpg';
export const SECRET_SPECIAL_SUSPENSE_BACK = '/secret-draw/special-mystery-back.jpg';

export const SECRET_SUIT_BACK_IMAGES = {
  common: '/secret-draw/suit-common.jpg',
  medium: '/secret-draw/suit-medium.jpg',
  hard: '/secret-draw/suit-hard.jpg',
  very_hard: '/secret-draw/suit-very_hard.jpg',
  exotic: '/secret-draw/suit-exotic.jpg',
};

export function getSecretSuitBackImage(difficulty) {
  return SECRET_SUIT_BACK_IMAGES[difficulty] || SECRET_SUIT_BACK_IMAGES.common;
}

export function getSecretCardUrl(rawPath) {
  if (!rawPath) return '';
  return encodeURI(String(rawPath));
}

const DECK_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUIT_LABEL_PT = {
  common: { symbol: '♣', name: 'Paus', accentText: 'text-emerald-300' },
  medium: { symbol: '♦', name: 'Ouros', accentText: 'text-sky-300' },
  hard: { symbol: '♠', name: 'Espadas', accentText: 'text-purple-300' },
  very_hard: { symbol: '♥', name: 'Copas', accentText: 'text-amber-300' },
  exotic: { symbol: '★', name: 'Coringa', accentText: 'text-rose-300' },
};

const RANK_WORD_PT = {
  A: 'Ás',
  J: 'Valete',
  Q: 'Dama',
  K: 'Rei',
};

export function getSecretPlayingCardMeta(card, roundId = 1) {
  const titleStr = String(card?.resolved?.title || card?.planilha?.rawTitle || '');
  let hash =
    Number(card?.resolved?.tmdbId || 0) * 17 +
    Number(card?.poolId || 0) * 13 +
    Number(roundId || 1) * 31 +
    Number(card?.seat || 1) * 7;
  for (let i = 0; i < titleStr.length; i += 1) {
    hash = (hash * 33 + titleStr.charCodeAt(i)) % 1000003;
  }
  const rank = DECK_RANKS[Math.abs(hash) % DECK_RANKS.length];
  const diff = card?.difficulty || 'common';
  const suitInfo = SUIT_LABEL_PT[diff] || SUIT_LABEL_PT.common;
  const rankWord = RANK_WORD_PT[rank] || rank;
  const fullName = diff === 'exotic' ? `${rankWord} ★ Coringa` : `${rankWord} de ${suitInfo.name}`;
  return {
    rank,
    symbol: suitInfo.symbol,
    suitName: suitInfo.name,
    accentText: suitInfo.accentText,
    fullName,
  };
}

export const SPECIAL_RARITY_META = {
  common: {
    key: 'common',
    label: 'COMUM • EVENTO',
    icon: '♣',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
    glowClass: 'shadow-[0_0_45px_rgba(16,185,129,0.45)]',
    ringGradient: 'conic-gradient(from 0deg, #10b981, #34d399, transparent 45%, #10b981)',
    soundKey: 'common',
    auraColor: 'rgba(16, 185, 129, 0.5)',
    panelAccent: 'border-emerald-400/35 bg-emerald-950/35',
  },
  rare: {
    key: 'rare',
    label: 'RARA • ARCANO',
    icon: '💎',
    badgeClass: 'bg-sky-500/20 border-sky-400/55 text-sky-200',
    glowClass: 'shadow-[0_0_55px_rgba(56,189,248,0.52)]',
    ringGradient: 'conic-gradient(from 0deg, #38bdf8, #818cf8, transparent 45%, #38bdf8)',
    soundKey: 'rare',
    auraColor: 'rgba(56, 189, 248, 0.55)',
    panelAccent: 'border-sky-400/35 bg-sky-950/35',
  },
  legendary: {
    key: 'legendary',
    label: 'LENDÁRIA • ÉPICA',
    icon: '👑',
    badgeClass: 'bg-amber-500/25 border-amber-300/65 text-amber-200',
    glowClass: 'shadow-[0_0_70px_rgba(251,191,36,0.68)]',
    ringGradient: 'conic-gradient(from 0deg, #fbbf24, #fde047, #f59e0b, transparent 40%, #fbbf24)',
    soundKey: 'legendary',
    auraColor: 'rgba(251, 191, 36, 0.65)',
    panelAccent: 'border-amber-400/45 bg-amber-950/35',
  },
  bet: {
    key: 'bet',
    label: 'APOSTA • CARA OU COROA',
    icon: '🪙',
    badgeClass: 'bg-fuchsia-500/25 border-amber-300/60 text-amber-200',
    glowClass: 'shadow-[0_0_65px_rgba(245,158,11,0.58)]',
    ringGradient: 'conic-gradient(from 0deg, #fbbf24, #ef4444, #a855f7, transparent 45%, #fbbf24)',
    soundKey: 'rare',
    auraColor: 'rgba(245, 158, 11, 0.6)',
    panelAccent: 'border-amber-400/40 bg-fuchsia-950/30',
  },
  cursed: {
    key: 'cursed',
    label: 'MALDIÇÃO • ABISMO',
    icon: '🩸',
    badgeClass: 'bg-rose-600/25 border-rose-400/65 text-rose-200',
    glowClass: 'shadow-[0_0_70px_rgba(244,63,94,0.68)]',
    ringGradient: 'conic-gradient(from 0deg, #f43f5e, #e11d48, #991b1b, transparent 45%, #f43f5e)',
    soundKey: 'cursed',
    auraColor: 'rgba(244, 63, 94, 0.65)',
    panelAccent: 'border-rose-500/45 bg-rose-950/40',
  },
};

const MILESTONE_SYSTEM_GROUPS = [
  { system: 'trophy', icon: '🏆', label: 'Troféu' },
  { system: 'world_challenge', icon: '🌍', label: 'País 195' },
  { system: 'time_machine', icon: '⏳', label: 'Década' },
  { system: 'universe', icon: '🌌', label: 'Universo' },
  { system: 'walk_of_fame', icon: '🌟', label: 'Fama' },
];

export function groupSimpleMilestones(milestones) {
  if (!Array.isArray(milestones) || milestones.length === 0) return [];
  const counts = {};
  for (const m of milestones) {
    const sys = m?.system;
    if (!sys) continue;
    counts[sys] = (counts[sys] || 0) + 1;
  }
  return MILESTONE_SYSTEM_GROUPS.filter((g) => counts[g.system] > 0).map((g) => ({
    ...g,
    count: counts[g.system],
  }));
}

export const FALLBACK_SPECIAL_CARDS_CATALOG = [
  { id: 'duas_caras', title: 'Rei Duas-Caras', icon: '🪙', rarity: 'bet', shortTag: 'Moeda 50/50 na Fila', images: ['/secret-draw/especiais/Rei Duas-Caras.png'] },
  { id: 'apresentador_vem_ca', title: 'Apresentador "Vem pra cá!"', icon: '✈️', rarity: 'common', shortTag: 'Puxa 1 Carta Aleatória da Mesa', images: ['/secret-draw/especiais/Apresentador.png'] },
  { id: 'ocarina_floresta', title: 'Ocarina da Floresta', icon: '⏳', rarity: 'rare', shortTag: 'Reembaralha a Mesa', images: ['/secret-draw/especiais/Ocarina da Floresta.png'] },
  { id: 'recarga_classe', title: 'Recarga do Poder da Classe', icon: '⚡', rarity: 'rare', shortTag: '+1 Carga da Classe', images: ['/secret-draw/especiais/Recarga do Poder da Classe I.png', '/secret-draw/especiais/Recarga do Poder da Classe II.png', '/secret-draw/especiais/Recarga do Poder da Classe III.png'] },
  { id: 'visao_marcos', title: 'Visão dos Marcos', icon: '👁️', rarity: 'rare', shortTag: 'Resumo dos Marcos na Mesa', images: ['/secret-draw/especiais/Visão dos Marcos I.png', '/secret-draw/especiais/Visão dos Marcos II.png'] },
  { id: 'arlequim_revela_3', title: 'Mini Arlequim — 3 Cartas', icon: '🃏', rarity: 'rare', shortTag: 'Revela 3 Filmes Fechados', images: ['/secret-draw/especiais/Revela 3.png'] },
  { id: 'arlequim_revela_5', title: 'Mini Arlequim Ascendido — 5 Cartas', icon: '🌟', rarity: 'legendary', shortTag: 'Revela 5 Filmes Fechados', images: ['/secret-draw/especiais/Revela 5.png'] },
  { id: 'portal_dimensional', title: 'Portal Dimensional', icon: '🌀', rarity: 'legendary', shortTag: 'Colhe XP + Volta ao Baralho', images: ['/secret-draw/especiais/Portais Dimensionais I.png', '/secret-draw/especiais/Portais Dimensionais II.png', '/secret-draw/especiais/Portais Dimensionais III.png', '/secret-draw/especiais/Portais Dimensionais IV.png'] },
  { id: 'pedra_filosofal', title: 'Pedra Filosofal — Ascensão', icon: '⚗️', rarity: 'legendary', shortTag: '+1 Raridade na Fila', images: ['/secret-draw/especiais/Ascensão I.png', '/secret-draw/especiais/Ascensão II.png'] },
  { id: 'armadilha_mecanica', title: 'A Armadilha Mecânica', icon: '⚙️', rarity: 'cursed', shortTag: '-1 Raridade na Fila', images: ['/secret-draw/especiais/A Armadilha.png'] },
  { id: 'corrente_destino', title: 'Corrente do Destino', icon: '⛓️', rarity: 'cursed', shortTag: 'Trava Bumerangue na Fila', images: ['/secret-draw/especiais/Corrente do Destino.png'] },
  { id: 'lamina_eclipse', title: 'Lâmina do Eclipse', icon: '💔', rarity: 'cursed', shortTag: 'Corta XP pela Metade (0.5×)', images: ['/secret-draw/especiais/Lâmina do Eclipse.jpg'] },
];
