/**
 * Skins equipáveis para a Barra de XP (TopNavbar HUD & Ficha de Nível)
 */
export const XP_BAR_SKINS = {
  classic: {
    id: 'classic',
    name: 'Clássica Âmbar-Esmeralda',
    shortName: 'Clássica',
    icon: '⚡',
    desc: 'Gradiente padrão âmbar dourado e esmeralda da Guilda.',
    barClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400',
    glowStyle: '0 0 12px rgba(245, 158, 11, 0.45)',
    trackClass: 'bg-zinc-950 border-zinc-800/80',
    previewAccent: '#fbbf24',
  },
  crimson_ruby: {
    id: 'crimson_ruby',
    name: 'Carmesim Rubi (Vermelha)',
    shortName: 'Rubi Vermelha',
    icon: '🔥',
    desc: 'Energia vermelha escarlate incandescente com brilho rubi contínuo.',
    barClass: 'xp-bar-skin-crimson',
    glowStyle: '0 0 16px rgba(244, 63, 94, 0.72)',
    trackClass: 'bg-[#1a0509] border-rose-500/45',
    previewAccent: '#f43f5e',
  },
  imperial_gold: {
    id: 'imperial_gold',
    name: 'Ouro Imperial (Amarela)',
    shortName: 'Ouro Imperial',
    icon: '👑',
    desc: 'Barras em ouro maciço amarelo reluzente com reflexo metálico animado.',
    barClass: 'xp-bar-skin-gold',
    glowStyle: '0 0 18px rgba(250, 204, 21, 0.78)',
    trackClass: 'bg-[#171103] border-amber-400/55',
    previewAccent: '#facc15',
  },
  violet_abyss: {
    id: 'violet_abyss',
    name: 'Abissal Violeta Holo',
    shortName: 'Violeta Holo',
    icon: '🔮',
    desc: 'Pulso arcano roxo-elétrico e ciano holográfico do Camarim.',
    barClass: 'xp-bar-skin-violet',
    glowStyle: '0 0 16px rgba(168, 85, 247, 0.75)',
    trackClass: 'bg-[#12071e] border-purple-400/50',
    previewAccent: '#a855f7',
  },
  prism_rainbow: {
    id: 'prism_rainbow',
    name: 'Espectro Arco-Íris (Colorida)',
    shortName: 'Arco-Íris',
    icon: '🌈',
    desc: 'Degradê multicolorido completo em 6 espectros cinematográficos.',
    barClass: 'xp-bar-skin-rainbow',
    glowStyle: '0 0 18px rgba(56, 189, 248, 0.72)',
    trackClass: 'bg-zinc-950 border-fuchsia-400/50',
    previewAccent: '#ec4899',
  },
  neon_rgb: {
    id: 'neon_rgb',
    name: 'Neon RGB Dinâmico',
    shortName: 'Neon RGB',
    icon: '✨',
    desc: 'Fluxo RGB vivo em movimento contínuo — a barra muda de cor sem parar!',
    barClass: 'xp-bar-skin-rgb',
    glowStyle: '0 0 22px rgba(34, 211, 238, 0.85)',
    trackClass: 'bg-black border-cyan-300/65',
    previewAccent: '#22d3ee',
  },
};

export function getXpBarSkinMeta(skinId) {
  return XP_BAR_SKINS[skinId] || XP_BAR_SKINS.classic;
}
