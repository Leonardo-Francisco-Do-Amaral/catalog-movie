/**
 * Sistema de Classificação de Raridade RPG por Dificuldade Cinematográfica dos 195 Países (5 Tiers)
 */

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];

export const RARITY_RANK_WEIGHT = {
  mythic: 5,
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1
};

export const RARITY_TIER_CONFIG = {
  common: {
    key: 'common',
    label: 'COMUM',
    shortDesc: 'Potência Cinematográfica',
    border: 'border-emerald-500/60 hover:border-emerald-400',
    lockedBorder: 'border-zinc-800/90 hover:border-emerald-500/40',
    glow: 'shadow-[0_0_16px_rgba(16,185,129,0.12)]',
    badge: 'bg-emerald-500/90 text-slate-950 border-emerald-300',
    softBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    lockedBadge: 'bg-zinc-900/90 text-emerald-400/70 border-emerald-500/25',
    accentText: 'text-emerald-300',
    dotClass: 'bg-emerald-400',
    mapFill: 'rgba(16, 185, 129, 0.42)',
    mapHoverFill: 'rgba(52, 211, 153, 0.78)',
    mapStroke: '#34d399',
    mapHoverStroke: '#d1fae5',
    beaconFill: '#10b981',
    beaconStroke: '#a7f3d0'
  },
  rare: {
    key: 'rare',
    label: 'RARO',
    shortDesc: 'Cinema Consolidado / Autoral',
    border: 'border-sky-400/65 hover:border-sky-300',
    lockedBorder: 'border-zinc-800/90 hover:border-sky-400/45',
    glow: 'shadow-[0_0_18px_rgba(56,189,248,0.16)]',
    badge: 'bg-sky-400 text-slate-950 border-sky-200',
    softBadge: 'bg-sky-500/15 text-sky-300 border-sky-400/40',
    lockedBadge: 'bg-zinc-900/90 text-sky-400/75 border-sky-500/30',
    accentText: 'text-sky-300',
    dotClass: 'bg-sky-400',
    mapFill: 'rgba(14, 165, 233, 0.45)',
    mapHoverFill: 'rgba(56, 189, 248, 0.80)',
    mapStroke: '#38bdf8',
    mapHoverStroke: '#e0f2fe',
    beaconFill: '#0ea5e9',
    beaconStroke: '#bae6fd'
  },
  epic: {
    key: 'epic',
    label: 'ÉPICO',
    shortDesc: 'Produção Esporádica / Emergente',
    border: 'border-purple-400/75 hover:border-purple-300',
    lockedBorder: 'border-zinc-800/90 hover:border-purple-400/45',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.20)]',
    badge: 'bg-purple-500 text-white border-purple-300',
    softBadge: 'bg-purple-500/15 text-purple-300 border-purple-400/40',
    lockedBadge: 'bg-zinc-900/90 text-purple-300/75 border-purple-500/30',
    accentText: 'text-purple-300',
    dotClass: 'bg-purple-400',
    mapFill: 'rgba(168, 85, 247, 0.46)',
    mapHoverFill: 'rgba(192, 132, 252, 0.82)',
    mapStroke: '#c084fc',
    mapHoverStroke: '#f3e8ff',
    beaconFill: '#a855f7',
    beaconStroke: '#e9d5ff'
  },
  legendary: {
    key: 'legendary',
    label: 'LENDÁRIO',
    shortDesc: 'Raríssimo no Catálogo Mundial',
    border: 'border-amber-400/80 hover:border-amber-300',
    lockedBorder: 'border-zinc-800/90 hover:border-amber-400/50',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.24)]',
    badge: 'bg-amber-400 text-slate-950 border-yellow-200',
    softBadge: 'bg-amber-500/15 text-amber-300 border-amber-400/45',
    lockedBadge: 'bg-zinc-900/90 text-amber-300/80 border-amber-500/35',
    accentText: 'text-amber-300',
    dotClass: 'bg-amber-400',
    mapFill: 'rgba(245, 158, 11, 0.48)',
    mapHoverFill: 'rgba(251, 191, 36, 0.84)',
    mapStroke: '#fbbf24',
    mapHoverStroke: '#fef08a',
    beaconFill: '#f59e0b',
    beaconStroke: '#fef08a'
  },
  mythic: {
    key: 'mythic',
    label: 'MÍTICO',
    shortDesc: 'Grupo Seleto dos 18 Mais Difíceis',
    border: 'border-rose-500/90 hover:border-rose-300 ring-1 ring-rose-500/35',
    lockedBorder: 'border-rose-950/90 hover:border-rose-500/60',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.34)]',
    badge: 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white border-rose-300',
    softBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    lockedBadge: 'bg-rose-950/70 text-rose-300/90 border-rose-500/40',
    accentText: 'text-rose-300',
    dotClass: 'bg-rose-500 animate-pulse',
    mapFill: 'rgba(244, 63, 94, 0.56)',
    mapHoverFill: 'rgba(251, 113, 133, 0.88)',
    mapStroke: '#fb7185',
    mapHoverStroke: '#ffe4e6',
    beaconFill: '#e11d48',
    beaconStroke: '#fecdd3'
  }
};

// Os 18 países mais difíceis do Desafio Volta ao Mundo (Tier MÍTICO)
const MYTHIC_18_CODES = new Set([
  'tv', // Tuvalu
  'nr', // Nauru
  'ki', // Kiribati
  'pw', // Palau
  'fm', // Micronésia
  'mh', // Ilhas Marshall
  'va', // Vaticano
  'sm', // San Marino
  'ad', // Andorra
  'li', // Liechtenstein
  'mc', // Mônaco
  'st', // São Tomé e Príncipe
  'km', // Comores
  'sc', // Seicheles
  'dm', // Dominica
  'kn', // São Cristóvão e Névis
  'lc', // Santa Lúcia
  'ag'  // Antígua e Barbuda
]);

const COMMON_CODES = new Set([
  'us', 'br', 'gb', 'fr', 'jp', 'kr', 'in', 'de', 'it',
  'es', 'ca', 'cn', 'au', 'mx', 'ru', 'se', 'ie', 'nz'
]);

const RARE_CODES = new Set([
  'ar', 'cl', 'co', 'cu', 'uy', 'pe',
  'dk', 'be', 'nl', 'pl', 'at', 'ch', 'no', 'fi', 'pt',
  'gr', 'ro', 'cz', 'hu', 'rs', 'ua',
  'ir', 'tr', 'th', 'id', 'ph', 'il', 'vn', 'lb', 'sg', 'my',
  'za', 'eg', 'ng', 'ma', 'sn', 'tn'
]);

const EPIC_CODES = new Set([
  've', 'bo', 'ec', 'py', 'cr', 'gt', 'do', 'pa', 'jm',
  'is', 'hr', 'bg', 'ba', 'sk', 'si', 'lt', 'lv', 'ee',
  'lu', 'mk', 'al', 'by', 'md', 'me', 'mt',
  'kz', 'mn', 'ge', 'am', 'ps', 'jo', 'sa', 'ae', 'qa',
  'pk', 'bd', 'lk', 'np', 'kh', 'sy', 'iq', 'af', 'kg',
  'uz', 'az', 'cy',
  'ke', 'dz', 'et', 'bf', 'ml', 'gh', 'ci', 'cm', 'ao',
  'mz', 'cd', 'rw', 'ug', 'sd', 'mr'
]);

export function getCountryRarityTier(code) {
  const c = String(code || '').toLowerCase().trim();
  if (MYTHIC_18_CODES.has(c)) return 'mythic';
  if (COMMON_CODES.has(c)) return 'common';
  if (RARE_CODES.has(c)) return 'rare';
  if (EPIC_CODES.has(c)) return 'epic';
  return 'legendary';
}

export function getRarityMeta(tierOrCode) {
  if (RARITY_TIER_CONFIG[tierOrCode]) return RARITY_TIER_CONFIG[tierOrCode];
  return RARITY_TIER_CONFIG[getCountryRarityTier(tierOrCode)];
}
