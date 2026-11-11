export const DUEL_EFFECT_PRESETS = [
  {
    key: 'card_drop',
    icon: '🪂',
    label: 'Queda do Trono',
    shortDesc: 'Solta o pino, tomba torto e despenca do card',
    defeatedLabel: 'Tombou',
    accentClass: 'border-amber-400/55 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20',
  },
  {
    key: 'thanos_snap',
    icon: '🫰',
    label: 'Estalo do Thanos',
    shortDesc: 'Clarão roxo e cartaz desintegra em poeira dourada',
    defeatedLabel: 'Virou pó',
    accentClass: 'border-purple-400/55 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20',
  },
  {
    key: 'slash_cleave',
    icon: '⚔️',
    label: 'Corte de Katana',
    shortDesc: 'Lâmina diagonal fatia e derruba o ex-campeão',
    defeatedLabel: 'Fatiado',
    accentClass: 'border-rose-400/55 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  },
  {
    key: 'shatter_glass',
    icon: '🧊',
    label: 'Estilhaço de Cristal',
    shortDesc: 'Rachaduras no vidro explodem em cacos voadores',
    defeatedLabel: 'Estilhaçado',
    accentClass: 'border-cyan-400/55 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20',
  },
];

export const DUEL_EFFECT_MAP = Object.fromEntries(DUEL_EFFECT_PRESETS.map((p) => [p.key, p]));

export function pickRandomDuelEffect() {
  const index = Math.floor(Math.random() * DUEL_EFFECT_PRESETS.length);
  return DUEL_EFFECT_PRESETS[index]?.key || 'card_drop';
}
