import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Skull,
  Dices,
  Zap,
  CheckCircle2,
  Crown,
  Hand,
  Calendar,
  Globe,
  Film,
  Tag,
  X,
  Eye,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import {
  playChimeraDiceThrowSound,
  playChimeraSlotTickSound,
  playChimeraJackpotTickSound,
  playChimeraTarotRarityRevealSound,
  stopAllTrophyAudio,
} from '../utils/trophyAudio';
import { TAROT_BACK_IMAGE, getRuneTarotMeta } from '../utils/chimeraTarotCatalog';

const D20_TIER_THEME = {
  nightmare: {
    ring: 'border-rose-500/80 shadow-[0_0_55px_rgba(244,63,94,0.38)]',
    bg: 'from-rose-950/75 via-zinc-950 to-amber-950/35',
    shockwave: 'border-rose-400',
    badge: 'bg-rose-500/20 border-rose-400/60 text-rose-200',
    diceFrom: '#fb7185',
    diceMid: '#be123c',
    diceTo: '#4c0519',
    diceStroke: '#fecdd3',
    label: '💀 Pesadelo',
    headline: 'Provação Extrema — Categoria em modo difícil (+XP sobrevivência)!',
  },
  hard: {
    ring: 'border-amber-500/70 shadow-[0_0_45px_rgba(245,158,11,0.3)]',
    bg: 'from-amber-950/60 via-zinc-950 to-zinc-900',
    shockwave: 'border-amber-400',
    badge: 'bg-amber-500/20 border-amber-400/60 text-amber-200',
    diceFrom: '#fbbf24',
    diceMid: '#b45309',
    diceTo: '#451a03',
    diceStroke: '#fde68a',
    label: '🔥 Difícil',
    headline: 'Desafio Árduo — Combinação clássica valendo ótimo XP!',
  },
  balanced: {
    ring: 'border-emerald-400/65 shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    bg: 'from-emerald-950/50 via-zinc-950 to-zinc-900',
    shockwave: 'border-emerald-400',
    badge: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
    diceFrom: '#34d399',
    diceMid: '#059669',
    diceTo: '#064e3b',
    diceStroke: '#a7f3d0',
    label: '⚔️ Equilibrado',
    headline: 'Caçada Equilibrada — Boa margem de manobra.',
  },
  blessed: {
    ring: 'border-yellow-300/80 shadow-[0_0_50px_rgba(253,224,71,0.35)]',
    bg: 'from-yellow-950/45 via-zinc-950 to-emerald-950/40',
    shockwave: 'border-yellow-300',
    badge: 'bg-yellow-400/20 border-yellow-300/70 text-yellow-100',
    diceFrom: '#fde047',
    diceMid: '#ca8a04',
    diceTo: '#713f12',
    diceStroke: '#fef9c3',
    label: '🌟 Bênção',
    headline: 'Bênção do Oráculo — Sorte alta na categoria!',
  },
};

const MYSTERY_RUNE_BACK_CLS =
  'border-amber-400/55 bg-zinc-950 hover:border-amber-300 shadow-[0_12px_28px_rgba(0,0,0,0.75)]';

const RUNE_RARITY_STYLE = {
  common: {
    label: '⚪ Comum',
    revealAnim: 'chimera-reveal-common',
    openCard: 'border-zinc-300/75 bg-zinc-900 text-zinc-100',
    tagColor: 'text-zinc-200',
    burstBanner: '⚪ Arcano Comum Despertado',
  },
  rare: {
    label: '💠 Rara',
    revealAnim: 'chimera-reveal-rare',
    openCard:
      'border-sky-400 bg-gradient-to-b from-sky-950/75 to-indigo-950/85 text-sky-100',
    tagColor: 'text-sky-300',
    burstBanner: '💠 ARCANO RARO DESPERTADO!',
  },
  legendary: {
    label: '👑 Lendária',
    revealAnim: 'chimera-reveal-legendary',
    openCard:
      'chimera-rune-legendary border-amber-300 bg-gradient-to-b from-amber-500/25 via-zinc-950 to-yellow-950/60 text-amber-100',
    tagColor: 'text-amber-300',
    burstBanner: '👑 ARCANO LENDÁRIO SUPREMO!!',
  },
  cursed: {
    label: '💀 Maldição',
    revealAnim: 'chimera-reveal-cursed',
    openCard:
      'border-rose-500/85 bg-gradient-to-b from-rose-950/90 via-zinc-950 to-black text-rose-100 shadow-[0_0_26px_rgba(225,29,72,0.45)]',
    tagColor: 'text-rose-300',
    burstBanner: '💀 ARCANO XIII • A MORTE DESPERTADA!',
  },
};

const SPELL_THEME_BY_RARITY = {
  common: {
    neonConic:
      'conic-gradient(from 0deg, transparent 0deg 45deg, #94a3b8 85deg, #f8fafc 125deg, #c084fc 165deg, transparent 210deg 235deg, #e2e8f0 285deg, #ffffff 315deg, transparent 355deg)',
    cardShadow: '0 0 42px rgba(226, 232, 240, 0.48), 0 0 90px rgba(148, 163, 184, 0.25)',
    badgeNeonGlow: '0 0 22px rgba(226, 232, 240, 0.75), inset 0 0 12px rgba(248, 250, 252, 0.25)',
    badgeText: 'text-zinc-100',
    badgeInnerBg: 'bg-zinc-950/92',
    ringBorder: 'border-zinc-200',
    divider: 'via-zinc-300/55',
    tagPill: 'bg-zinc-200/10 border-zinc-300/45 text-zinc-100',
    ctaCls: 'border-zinc-200/75 text-white shadow-[0_0_24px_rgba(226,232,240,0.4)] hover:bg-zinc-100/15',
  },
  rare: {
    neonConic:
      'conic-gradient(from 0deg, transparent 0deg 35deg, #0284c7 80deg, #22d3ee 125deg, #e0f2fe 155deg, transparent 200deg 225deg, #38bdf8 275deg, #a5f3fc 315deg, transparent 355deg)',
    cardShadow: '0 0 48px rgba(34, 211, 238, 0.58), 0 0 105px rgba(14, 165, 233, 0.35)',
    badgeNeonGlow: '0 0 26px rgba(34, 211, 238, 0.9), inset 0 0 14px rgba(56, 189, 248, 0.35)',
    badgeText: 'text-cyan-200',
    badgeInnerBg: 'bg-[#051221]/95',
    ringBorder: 'border-cyan-300',
    divider: 'via-cyan-300/65',
    tagPill: 'bg-cyan-400/15 border-cyan-300/55 text-cyan-100',
    ctaCls: 'border-cyan-300/80 text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.45)] hover:bg-cyan-400/15',
  },
  legendary: {
    neonConic:
      'conic-gradient(from 0deg, transparent 0deg 30deg, #ea580c 70deg, #fbbf24 115deg, #fef9c3 150deg, #ffffff 165deg, transparent 205deg 225deg, #f59e0b 270deg, #fde047 315deg, transparent 355deg)',
    cardShadow: '0 0 56px rgba(251, 191, 36, 0.68), 0 0 120px rgba(245, 158, 11, 0.38)',
    badgeNeonGlow: '0 0 30px rgba(251, 191, 36, 0.95), inset 0 0 16px rgba(253, 224, 71, 0.38)',
    badgeText: 'text-amber-200',
    badgeInnerBg: 'bg-[#170e03]/95',
    ringBorder: 'border-amber-300',
    divider: 'via-amber-300/70',
    tagPill: 'bg-amber-400/15 border-amber-300/60 text-amber-100',
    ctaCls: 'border-amber-300/85 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.5)] hover:bg-amber-400/15',
  },
  cursed: {
    neonConic:
      'conic-gradient(from 0deg, transparent 0deg 30deg, #9f1239 75deg, #f43f5e 120deg, #fecdd3 150deg, transparent 195deg 220deg, #be123c 270deg, #fb7185 315deg, transparent 355deg)',
    cardShadow: '0 0 60px rgba(244, 63, 94, 0.72), 0 0 125px rgba(190, 18, 60, 0.45)',
    badgeNeonGlow: '0 0 32px rgba(244, 63, 94, 0.98), inset 0 0 16px rgba(251, 113, 133, 0.4)',
    badgeText: 'text-rose-200',
    badgeInnerBg: 'bg-[#1a0308]/95',
    ringBorder: 'border-rose-400',
    divider: 'via-rose-400/70',
    tagPill: 'bg-rose-500/20 border-rose-400/60 text-rose-100',
    ctaCls: 'border-rose-400/85 text-rose-100 shadow-[0_0_28px_rgba(244,63,94,0.5)] hover:bg-rose-500/20',
  },
};

const CHARGING_NEON_CONIC =
  'conic-gradient(from 0deg, transparent 0deg 60deg, #9333ea 115deg, #c084fc 155deg, #fde68a 180deg, transparent 225deg 260deg, #7e22ce 305deg, transparent 355deg)';

const VIBRATE_DURATION_BY_RARITY = {
  common: 620,
  rare: 800,
  legendary: 980,
  cursed: 1500,
};

export function TarotCardShowcaseModal({ rune, onClose }) {
  const [revealStage, setRevealStage] = useState('typing'); // 'typing' -> 'vibrating' -> 'revealed'
  const [typedTitle, setTypedTitle] = useState('');
  const [showLoreDrawer, setShowLoreDrawer] = useState(false);
  const revealTimersRef = useRef({ interval: null, timers: [] });

  const clearRevealTimers = useCallback(() => {
    if (revealTimersRef.current.interval) {
      clearInterval(revealTimersRef.current.interval);
      revealTimersRef.current.interval = null;
    }
    revealTimersRef.current.timers.forEach((id) => clearTimeout(id));
    revealTimersRef.current.timers = [];
  }, []);

  const arcana = rune ? getRuneTarotMeta(rune) : null;
  const fullArcanaHeading =
    rune && arcana ? `Arcano ${arcana.roman} — ${arcana.name} • ${arcana.subtitle}` : '';
  const runeKey = rune?.id ? `${rune.id}:${rune.rarity}` : null;
  const runeRarity = rune?.rarity || 'common';

  useEffect(() => {
    clearRevealTimers();
    if (!runeKey || !fullArcanaHeading) {
      setRevealStage('typing');
      setTypedTitle('');
      setShowLoreDrawer(false);
      return;
    }

    setRevealStage('typing');
    setTypedTitle('');
    setShowLoreDrawer(false);

    const typeBudgetMs = runeRarity === 'cursed' ? 1220 : runeRarity === 'legendary' ? 1050 : 920;
    const vibrateHoldMs = VIBRATE_DURATION_BY_RARITY[runeRarity] || 750;
    let charIdx = 0;
    const stepMs = Math.max(
      12,
      Math.min(25, Math.round(typeBudgetMs / Math.max(1, fullArcanaHeading.length)))
    );

    revealTimersRef.current.interval = setInterval(() => {
      charIdx += 1;
      setTypedTitle(fullArcanaHeading.slice(0, charIdx));
      if (charIdx >= fullArcanaHeading.length) {
        if (revealTimersRef.current.interval) {
          clearInterval(revealTimersRef.current.interval);
          revealTimersRef.current.interval = null;
        }
        const vibrateTimer = setTimeout(() => {
          setRevealStage('vibrating');
          playChimeraTarotRarityRevealSound(runeRarity);
          const revealedTimer = setTimeout(() => {
            setRevealStage('revealed');
          }, vibrateHoldMs);
          revealTimersRef.current.timers.push(revealedTimer);
        }, 110);
        revealTimersRef.current.timers.push(vibrateTimer);
      }
    }, stepMs);

    return clearRevealTimers;
  }, [runeKey, runeRarity, fullArcanaHeading, clearRevealTimers]);

  const handleCloseModal = useCallback(() => {
    clearRevealTimers();
    stopAllTrophyAudio();
    onClose?.();
  }, [clearRevealTimers, onClose]);

  const handleSkipReveal = () => {
    if (revealStage !== 'typing') return;
    clearRevealTimers();
    setTypedTitle(fullArcanaHeading);
    setRevealStage('vibrating');
    playChimeraTarotRarityRevealSound(runeRarity);
    const holdMs = runeRarity === 'cursed' ? 1150 : 600;
    const t = setTimeout(() => setRevealStage('revealed'), holdMs);
    revealTimersRef.current.timers.push(t);
  };

  if (!rune || !arcana) return null;
  const rStyle = RUNE_RARITY_STYLE[rune.rarity] || RUNE_RARITY_STYLE.common;
  const spellTheme = SPELL_THEME_BY_RARITY[rune.rarity] || SPELL_THEME_BY_RARITY.common;
  const isCursed = rune.rarity === 'cursed';
  const showRarityBurst = revealStage === 'vibrating' || revealStage === 'revealed';
  const isFullyRevealed = revealStage === 'revealed';

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleCloseModal}
    >
      {/* Palco flutuante SEM caixa/quadrado ao redor! */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (revealStage === 'typing') handleSkipReveal();
        }}
        className="relative w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-4"
      >
        {/* Botão Fechar flutuante discreto */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCloseModal();
          }}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 w-10 h-10 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/20 hover:border-white/50 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-all shadow-xl"
          aria-label="Fechar Carta de Magia"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ESQUERDA: CARTA DE TARÔ GRANDONA COM NEON CORRENDO POR TODA A BORDA */}
        <div
          className={`relative shrink-0 flex flex-col items-center ${
            revealStage === 'vibrating'
              ? isCursed
                ? 'chimera-spell-vibrate-cursed'
                : 'chimera-spell-vibrate'
              : ''
          }`}
        >
          {/* Onda expansiva de impacto */}
          {revealStage === 'vibrating' && (
            <div
              className={`chimera-spell-aura-ring pointer-events-none absolute -inset-4 rounded-3xl border-2 ${spellTheme.ringBorder}`}
            />
          )}

          {/* Wrapper da Arte com Neon passando por TODA a carta */}
          <div
            className="relative w-[265px] sm:w-[310px] md:w-[355px] aspect-[2/3] rounded-2xl"
            style={{
              boxShadow: showRarityBurst
                ? spellTheme.cardShadow
                : '0 0 38px rgba(168, 85, 247, 0.35)',
            }}
          >
            {/* Bloom neon externo difuso girando atrás */}
            <div className="pointer-events-none absolute -inset-2 rounded-3xl overflow-hidden blur-lg opacity-85">
              <div
                className={`chimera-neon-orbit absolute left-1/2 top-1/2 w-[175%] aspect-square ${
                  isCursed ? 'chimera-neon-orbit-fast' : ''
                }`}
                style={{
                  background: showRarityBurst ? spellTheme.neonConic : CHARGING_NEON_CONIC,
                }}
              />
            </div>

            {/* Borda Neon nítida de 3px correndo por toda a volta da carta */}
            <div className="relative w-full h-full rounded-2xl p-[3px] overflow-hidden bg-zinc-950/90">
              <div
                className={`chimera-neon-orbit pointer-events-none absolute left-1/2 top-1/2 w-[175%] aspect-square ${
                  isCursed ? 'chimera-neon-orbit-fast' : ''
                }`}
                style={{
                  background: showRarityBurst ? spellTheme.neonConic : CHARGING_NEON_CONIC,
                }}
              />
              <div className="relative z-10 w-full h-full rounded-[13px] overflow-hidden bg-zinc-950">
                <img
                  src={arcana.image}
                  alt={`Arcano ${arcana.roman} — ${arcana.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* GEMA DE RARIDADE / DIFICULDADE COM NEON EM VOLTA */}
          <div className="-mt-5 z-20 min-h-[2.5rem] flex items-center justify-center">
            {!showRarityBurst ? (
              <div className="px-5 py-1.5 rounded-full border border-purple-400/50 bg-zinc-950/95 text-[11px] font-black uppercase tracking-[0.2em] text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.45)]">
                ✦ Invocando Raridade...
              </div>
            ) : (
              <div
                className="chimera-gem-slam relative rounded-full p-[2px] overflow-hidden"
                style={{ boxShadow: spellTheme.badgeNeonGlow }}
              >
                <div
                  className="chimera-neon-orbit-fast pointer-events-none absolute left-1/2 top-1/2 w-[260%] aspect-square"
                  style={{ background: spellTheme.neonConic }}
                />
                <div
                  className={`relative z-10 px-6 py-1.5 rounded-full ${spellTheme.badgeInnerBg} ${spellTheme.badgeText} text-xs sm:text-sm font-black uppercase tracking-[0.22em] backdrop-blur-md`}
                >
                  {rStyle.label}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DIREITA: CONTEÚDO FLUTUANTE DA MAGIA RPG (SEM CAIXAS!) */}
        <div className="flex-1 max-w-xl w-full flex flex-col items-center md:items-start text-center md:text-left gap-4 px-2">
          {/* FASE 1: Escrita Progressiva (Typewriter) do Arcano */}
          <div className="w-full flex flex-col items-center md:items-start gap-2">
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300/85 shrink-0">
                ✦ Tarô Arcano
              </span>
              <div
                className={`h-px flex-1 bg-gradient-to-r ${
                  showRarityBurst ? spellTheme.divider : 'via-purple-400/60'
                } from-amber-300/50 to-transparent`}
              />
            </div>

            <p className="font-serif text-base sm:text-lg font-bold tracking-wide text-amber-100/95 min-h-[1.75rem]">
              <span>{typedTitle}</span>
              {revealStage === 'typing' && (
                <span className="inline-block w-[2px] h-4 bg-amber-300 ml-1 align-middle animate-pulse" />
              )}
            </p>
          </div>

          {/* FASE 3: Nome da Magia, Efeito, Botão [?] e Botão Neon de Ação */}
          <div
            className={`w-full flex flex-col items-center md:items-start gap-3.5 transition-all duration-500 ${
              isFullyRevealed
                ? 'opacity-100 translate-y-0'
                : 'opacity-15 translate-y-2 pointer-events-none select-none'
            }`}
          >
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h3 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)]">
                <span className="mr-2">{rune.icon}</span>
                {rune.runeName}
              </h3>

              {isFullyRevealed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLoreDrawer((v) => !v);
                  }}
                  title="Ver significado da Arcana e referências de cinema na arte"
                  aria-label="Ver significado e referências da carta"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    showLoreDrawer
                      ? 'bg-amber-400 text-zinc-950 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.75)] scale-105'
                      : 'bg-zinc-950/75 hover:bg-amber-400/20 border-white/25 hover:border-amber-300/75 text-amber-200'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <span
              className={`px-4 py-1 rounded-full border text-xs font-black tracking-wide ${spellTheme.tagPill}`}
            >
              ✦ {rune.shortTag} ✦
            </span>

            <div className="w-full py-3 flex flex-col gap-3">
              <div
                className={`h-px w-full bg-gradient-to-r from-transparent md:from-white/30 ${
                  showRarityBurst ? spellTheme.divider : 'via-purple-300/40'
                } to-transparent`}
              />
              <p className="text-base sm:text-[17px] text-zinc-100 leading-relaxed font-medium">
                {rune.label}
              </p>
              <div
                className={`h-px w-full bg-gradient-to-r from-transparent md:from-white/30 ${
                  showRarityBurst ? spellTheme.divider : 'via-purple-300/40'
                } to-transparent`}
              />
            </div>

            {isFullyRevealed && showLoreDrawer && (
              <div className="chimera-jackpot-pop w-full py-1 text-left flex flex-col gap-2 text-xs sm:text-sm">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">
                  🔮 Significado de Arcano {arcana.roman} — {arcana.name}
                </div>
                <p className="text-zinc-200 leading-relaxed">{arcana.meaning}</p>
                <p className="text-xs text-zinc-300/90 leading-relaxed">
                  <strong className="text-amber-300">🎬 Referências na Ilustração:</strong> {arcana.cinemaRefs}
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseModal();
                }}
                className={`px-8 py-3 rounded-full border-2 bg-zinc-950/85 font-black uppercase text-xs sm:text-sm tracking-[0.18em] transition-all cursor-pointer active:scale-[0.98] ${spellTheme.ctaCls}`}
              >
                {isCursed ? '💀 Aceitar Destino' : '✦ Confirmar & Continuar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LEGENDARY_SPARKS = [
  { icon: '👑', tx: '-95px', ty: '-65px', rot: '-180deg' },
  { icon: '✨', tx: '95px', ty: '-65px', rot: '180deg' },
  { icon: '🌟', tx: '-60px', ty: '-95px', rot: '-240deg' },
  { icon: '💎', tx: '60px', ty: '-95px', rot: '240deg' },
  { icon: '🔥', tx: '0px', ty: '-105px', rot: '360deg' },
  { icon: '✨', tx: '-115px', ty: '10px', rot: '140deg' },
  { icon: '✨', tx: '115px', ty: '10px', rot: '-140deg' },
];

const CATEGORY_ORDER = [
  { id: 'era', title: '1. Época & Ano', icon: Calendar, color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/20' },
  { id: 'block', title: '2. Bloco Regional', icon: Globe, color: 'text-sky-300 border-sky-500/40 bg-sky-950/20' },
  { id: 'genre', title: '3. Gêneros', icon: Film, color: 'text-purple-300 border-purple-500/40 bg-purple-950/20' },
  { id: 'tag', title: '4. 5 Tags Temáticas', icon: Tag, color: 'text-amber-300 border-amber-500/45 bg-amber-950/20' },
];

function resolveDifficultyKey(d20Roll) {
  const n = Number(d20Roll || 10);
  if (n <= 4) return 'nightmare';
  if (n <= 9) return 'hard';
  if (n <= 15) return 'balanced';
  return 'blessed';
}

function buildSlotCandidates(category, recipe) {
  if (!recipe) return ['...'];
  if (category === 'era') {
    const winner = `${recipe.minYear} — ${recipe.maxYear} (${recipe.eraLabel})`;
    const decoys = [
      '1931 — 1950 (Relíquia P&B)',
      '1952 — 1966 (Era de Ouro)',
      '1974 — 1983 (Clássicos & VHS)',
      '1985 — 1994 (Clássicos & VHS)',
      '1996 — 2005 (Clássicos & VHS)',
      '2008 — 2012 (Era Moderna)',
      '2019 — 2023 (Era Moderna)',
    ].filter((x) => x !== winner);
    return [...decoys, winner];
  }
  if (category === 'block') {
    const winner = `${recipe.blockIcon} ${recipe.blockLabel} (Alvo: ${recipe.jackpotCountry})`;
    const decoys = [
      '🗽 América do Norte',
      '🏰 Europa Ocidental',
      '🌎 América do Sul & Caribe',
      '🍝 Europa Mediterrânea',
      '🐉 Ásia Oriental',
      '❄️ Escandinávia & Norte Europeu',
      '🪆 Europa Central & Leste',
      '🪷 Sul & Sudeste Asiático',
      '🕌 Oriente Médio & Norte da África',
    ].filter((x) => !winner.includes(x.slice(2).trim()));
    return [...decoys, winner];
  }
  if (category === 'genre') {
    const winner = `${(recipe.genres || []).join(' / ')}`;
    const decoys = [
      'Drama / Suspense',
      'Terror / Mistério',
      'Ação / Ficção Científica',
      'Policial / Thriller',
      'Comédia / Romance',
      'Animação / Fantasia',
      'Guerra / Ação',
      'Faroeste / Aventura',
    ].filter((x) => x !== winner);
    return [...decoys, winner];
  }
  const winner = `${(recipe.tags || []).slice(0, 3).join(' • ')} (+${Math.max(0, (recipe.tags || []).length - 3)})`;
  const decoys = [
    'Gore • Vampiro • Demônio',
    'Viagem no Tempo • Aliens • Multiverso',
    'Fatos Reais • Crime real • Trágico',
    'Preto e branco • Religião • Abuso Familiar',
    'Baseado em Anime • Super Poder • Vilão',
    'Colegio/Escola • Personagem LGBT • Natal',
  ];
  return [...decoys, winner];
}

function D20Bg3Svg({ value, phase, theme }) {
  const isSpinning = phase === 'spinning';
  const isLanded = phase === 'landed' || phase === 'slowing';
  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center shrink-0">
      {/* Anel rúnico externo estilo Baldur's Gate 3 */}
      <div
        className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-500 ${
          isSpinning ? 'border-amber-300/60 chimera-bg3-spinning' : `${theme.shockwave} opacity-80`
        }`}
      />
      {isLanded && (
        <div
          className={`chimera-impact-ring absolute inset-2 rounded-full border-2 pointer-events-none ${theme.shockwave}`}
        />
      )}

      <div
        className={`relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center ${
          isSpinning ? 'chimera-bg3-spinning' : 'chimera-jackpot-pop'
        }`}
      >
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_14px_26px_rgba(0,0,0,0.75)]">
          <defs>
            <linearGradient id="chimeraBg3D20Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isSpinning ? '#fbbf24' : theme.diceFrom} />
              <stop offset="55%" stopColor={isSpinning ? '#7c3aed' : theme.diceMid} />
              <stop offset="100%" stopColor={isSpinning ? '#1e1b4b' : theme.diceTo} />
            </linearGradient>
          </defs>
          <polygon
            points="60,5 112,34 112,86 60,115 8,86 8,34"
            fill="url(#chimeraBg3D20Grad)"
            stroke={isSpinning ? '#fde68a' : theme.diceStroke}
            strokeWidth="2.8"
          />
          <polygon
            points="60,18 96,42 82,88 38,88 24,42"
            fill="rgba(9,9,11,0.38)"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.5"
          />
          <line x1="60" y1="5" x2="60" y2="18" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
          <line x1="112" y1="34" x2="96" y2="42" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
          <line x1="8" y1="34" x2="24" y2="42" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
          <line x1="112" y1="86" x2="82" y2="88" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
          <line x1="8" y1="86" x2="38" y2="88" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
          <line x1="60" y1="115" x2="60" y2="88" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-black tracking-widest text-white/85">D20</span>
          <span className="text-3xl sm:text-4xl font-black font-mono leading-none text-white drop-shadow">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChimeraForgeRitual({
  contract = null,
  onSelectFateRune = () => {},
  runeBusy = false,
  actionBusy = false,
  onFinishRitual = () => {},
  onDeclineChimera,
  onDiscardChimera,
  declineChipsRemaining = 0,
  showLabTools = false,
}) {
  const recipe = contract?.recipe || null;
  const d20Rolls = recipe?.d20Rolls || {
    era: recipe?.d20Roll || 10,
    block: recipe?.d20Roll || 10,
    genre: recipe?.d20Roll || 10,
    tag: recipe?.d20Roll || 10,
  };

  // Controle de revelação na ordem que o usuário quiser
  const [revealedMap, setRevealedMap] = useState({
    era: false,
    block: false,
    genre: false,
    tag: false,
  });

  // Modal BG3 / Caça-Níqueis da categoria clicada
  const [modalCat, setModalCat] = useState(null);
  const [modalPhase, setModalPhase] = useState('spinning'); // 'spinning' | 'slowing' | 'landed'
  const [liveDiceValue, setLiveDiceValue] = useState(12);
  const [slotCandidates, setSlotCandidates] = useState([]);
  const [slotIdx, setSlotIdx] = useState(0);
  const [inspectedRune, setInspectedRune] = useState(null);

  const timersRef = useRef([]);
  const spinIntervalRef = useRef(null);
  const prevSealedRuneIdsRef = useRef(new Set());
  const trackedContractIdRef = useRef(null);

  const clearModalTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
  }, []);

  useEffect(() => clearModalTimers, [clearModalTimers]);

  // Se trocou o contrato forjado, reseta a mesa
  useEffect(() => {
    clearModalTimers();
    setModalCat(null);
    setRevealedMap({ era: false, block: false, genre: false, tag: false });
  }, [contract?.id, clearModalTimers]);

  const revealedCount = Object.values(revealedMap).filter(Boolean).length;
  const allCategoriesRevealed = revealedCount === 4;

  const legPillars = new Set(recipe?.legendaryJackpotPillars || []);
  const cursedPillars = new Set(recipe?.cursedJackpotPillars || []);
  const sacPillars = new Set(recipe?.sacrificedPillars || []);
  const optPillars = new Set(recipe?.optionalPillars || []);
  const fateRunes = recipe?.fateRunes || [];
  const chosenFateRune = recipe?.chosenFateRune || null;
  const chosenFateRunes =
    Array.isArray(recipe?.chosenFateRunes) && recipe.chosenFateRunes.length > 0
      ? recipe.chosenFateRunes
      : chosenFateRune
      ? [chosenFateRune]
      : [];

  useEffect(() => {
    const cId = contract?.id || null;
    const sealedList = Array.isArray(recipe?.chosenFateRunes) && recipe.chosenFateRunes.length > 0
      ? recipe.chosenFateRunes
      : recipe?.chosenFateRune
      ? [recipe.chosenFateRune]
      : [];
    const curIds = new Set(sealedList.map((r) => r.id));

    if (trackedContractIdRef.current !== cId) {
      trackedContractIdRef.current = cId;
      prevSealedRuneIdsRef.current = curIds;
      setInspectedRune(null);
      return;
    }

    const newlySealed = sealedList.find((r) => !prevSealedRuneIdsRef.current.has(r.id));
    prevSealedRuneIdsRef.current = curIds;
    if (newlySealed) {
      setInspectedRune(newlySealed);
    }
  }, [contract?.id, recipe?.chosenFateRunes, recipe?.chosenFateRune]);
  const runePicksRemaining = Number(
    recipe?.runePicksRemaining ?? (chosenFateRunes.length > 0 ? 0 : fateRunes.length > 0 ? 1 : 0)
  );
  const revealRemainingRarities = Boolean(recipe?.revealRemainingRarities);
  const allBlockCountries = Array.from(
    new Set([...(recipe?.blockCountries || []), ...(recipe?.extraBlockCountries || [])])
  );
  const goldGenreSet = new Set(recipe?.extraJackpotGenres || []);

  const handleOpenCategoryBg3 = (catId) => {
    if (!recipe || revealedMap[catId] || modalCat) return;
    clearModalTimers();
    const candidates = buildSlotCandidates(catId, recipe);
    setSlotCandidates(candidates);
    setSlotIdx(0);
    setModalCat(catId);
    setModalPhase('spinning');

    spinIntervalRef.current = setInterval(() => {
      setLiveDiceValue((prev) => ((prev + 6) % 20) + 1);
      setSlotIdx((prev) => (prev + 1) % candidates.length);
    }, 75);
  };

  const handleStopDiceAndDecelerate = () => {
    if (!modalCat || modalPhase !== 'spinning' || !recipe) return;
    clearModalTimers();

    const targetRoll = Number(d20Rolls[modalCat] || 10);
    setLiveDiceValue(targetRoll);
    setModalPhase('slowing');
    // Toca o som real do dado sendo jogado UMA VEZ
    playChimeraDiceThrowSound(targetRoll);

    const len = Math.max(1, slotCandidates.length);
    const winningIdx = len - 1;
    // 9 degraus desacelerando devagar até cravar no winningIdx!
    const delays = [75, 165, 280, 425, 610, 835, 1105, 1430, 1820];
    delays.forEach((ms, stepIdx) => {
      const id = setTimeout(() => {
        const remaining = delays.length - 1 - stepIdx;
        const nextIdx = (winningIdx - remaining + len * 3) % len;
        setSlotIdx(nextIdx);
        playChimeraSlotTickSound(stepIdx, delays.length);

        if (stepIdx === delays.length - 1) {
          setModalPhase('landed');
          const tier = resolveDifficultyKey(targetRoll);
          playChimeraJackpotTickSound(tier === 'nightmare' || tier === 'blessed' ? 3 : 1);
        }
      }, ms);
      timersRef.current.push(id);
    });
  };

  const handleAcceptModalResult = () => {
    if (!modalCat) return;
    clearModalTimers();
    setRevealedMap((prev) => ({ ...prev, [modalCat]: true }));
    setModalCat(null);
  };

  const handleRevealAllAtOnce = () => {
    clearModalTimers();
    setModalCat(null);
    setRevealedMap({ era: true, block: true, genre: true, tag: true });
    playChimeraDiceThrowSound(recipe?.d20Roll || 10);
  };

  if (!recipe) return null;

  const overallTier = recipe.d20Difficulty || 'balanced';
  const overallTheme = D20_TIER_THEME[overallTier] || D20_TIER_THEME.balanced;
  const activeModalCatMeta = CATEGORY_ORDER.find((c) => c.id === modalCat);
  const modalTargetRoll = modalCat ? Number(d20Rolls[modalCat] || 10) : 10;
  const modalTier = resolveDifficultyKey(modalTargetRoll);
  const modalTheme = D20_TIER_THEME[modalTier] || D20_TIER_THEME.balanced;

  const renderCategoryContent = (catId) => {
    if (catId === 'era') {
      if (sacPillars.has('year')) {
        return (
          <div className="text-xs text-rose-300/90 font-bold py-2">
            🗡️ Categoria sacrificada pela Carta de Tarô (-{recipe.baseYearXp || 0} XP base)
          </div>
        );
      }
      return (
        <>
          <div className="text-lg font-black font-mono text-white">
            {recipe.minYear} — {recipe.maxYear}
            {recipe.allowPost2000 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-[10px] font-black align-middle">
                🚀 ou 2000+
              </span>
            )}
          </div>
          <div className="text-[11px] opacity-85 mt-0.5">
            {recipe.eraLabel} • Faixa de {recipe.windowSize} anos (+{recipe.baseYearXp} XP)
          </div>
          {optPillars.has('year') && (
            <div className="mt-1.5 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
              ♾️ Ano Opcional (Completa sem XP se fora da faixa)
            </div>
          )}
          <div className={`mt-2 pt-2 border-t border-white/10 text-[11px] font-bold ${cursedPillars.has('year') ? 'text-rose-300' : 'text-amber-300'}`}>
            {cursedPillars.has('year')
              ? '💀 Jackpot Ceifado pela Morte (+0 XP)'
              : legPillars.has('year')
              ? `👑 CATEGORIA 100% JACKPOT (+${recipe.jackpotYearXp} XP)`
              : recipe.extraTargetYears?.length
              ? `⏳ Alvos: ${recipe.targetYear} / ${recipe.extraTargetYears.join(' / ')} (+${recipe.jackpotYearXp} XP)`
              : `🎯 Exato: ${recipe.targetYear} (+${recipe.jackpotYearXp} XP)`}
          </div>
        </>
      );
    }

    if (catId === 'block') {
      if (sacPillars.has('country')) {
        return (
          <div className="text-xs text-rose-300/90 font-bold py-2">
            🗡️ Categoria sacrificada pela Carta de Tarô (-{recipe.baseCountryXp || 0} XP base)
          </div>
        );
      }
      const extraCountryNames = (recipe.extraJackpotCountries || []).map((ej) => ej.name);
      return (
        <>
          <div className="text-sm font-black text-white">
            {recipe.blockIcon} {recipe.blockLabel}
            {recipe.extraBlockLabel ? ` + ${recipe.extraBlockLabel}` : ''}
          </div>
          {optPillars.has('country') && (
            <div className="mt-1.5 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
              🧭 Países Opcionais (Perde XP de País se fora)
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {allBlockCountries.map((c) => {
              const isJack = c === recipe.jackpotCountry || extraCountryNames.includes(c);
              return (
                <span
                  key={c}
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                    legPillars.has('country') || isJack
                      ? 'bg-amber-400/20 border-amber-300/60 text-amber-100'
                      : 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {isJack ? '🚩 ' : ''}
                  {c}
                </span>
              );
            })}
          </div>
          <div className={`mt-2 pt-2 border-t border-white/10 text-[11px] font-bold ${cursedPillars.has('country') ? 'text-rose-300' : 'text-amber-300'}`}>
            {cursedPillars.has('country')
              ? '💀 Jackpot Ceifado pela Morte (+0 XP)'
              : legPillars.has('country')
              ? `👑 BLOCO 100% JACKPOT (+${recipe.jackpotCountryXp} XP)`
              : extraCountryNames.length > 0
              ? `🚩 Jackpots${recipe.stackableCountryJackpots ? ' Acumuláveis' : ''}: ${[recipe.jackpotCountry, ...extraCountryNames].join(' / ')} (+${recipe.jackpotCountryXp} XP${recipe.stackableCountryJackpots ? ' cada' : ''})`
              : `🚩 País Jackpot: ${recipe.jackpotCountry} (+${recipe.jackpotCountryXp} XP)`}
          </div>
        </>
      );
    }

    if (catId === 'genre') {
      if (sacPillars.has('genre')) {
        return (
          <div className="text-xs text-rose-300/90 font-bold py-2">
            🗡️ Categoria sacrificada pela Carta de Tarô (-{recipe.baseGenreXp || 0} XP base)
          </div>
        );
      }
      return (
        <>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {(recipe.genres || []).map((g, idx) => {
              const isGoldG = legPillars.has('genre') || goldGenreSet.has(g);
              return (
                <React.Fragment key={g}>
                  {idx > 0 && <span className="text-[10px] font-black text-zinc-500">OU</span>}
                  <span
                    className={`px-2 py-0.5 rounded-lg border text-xs font-black ${
                      isGoldG
                        ? 'bg-amber-400/20 border-amber-300/60 text-amber-100'
                        : 'bg-purple-500/20 border-purple-400/45 text-purple-100'
                    }`}
                  >
                    {isGoldG ? '👑 ' : ''}
                    {g}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
          <div className="text-[11px] opacity-80 mt-1.5">
            Basta 1 gênero (+{recipe.baseGenreXp} XP)
          </div>
          {optPillars.has('genre') && (
            <div className="mt-1.5 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
              🕊️ Gêneros Desativados (Sem XP se não bater)
            </div>
          )}
          <div className={`mt-2 pt-2 border-t border-white/10 text-[11px] font-bold ${cursedPillars.has('genre') ? 'text-rose-300' : 'text-amber-300'}`}>
            {cursedPillars.has('genre')
              ? '💀 Jackpot Ceifado pela Morte (+0 XP)'
              : legPillars.has('genre')
              ? `👑 GÊNEROS 100% JACKPOT (+${recipe.jackpotGenreXp} XP)`
              : recipe.extraJackpotGenres?.length
              ? `🌀 2+ Gêneros ou Ouro (${recipe.extraJackpotGenres.join(' / ')}) acumulam +${recipe.jackpotGenreXp} XP!`
              : `🎭 Quaisquer 2 juntos (+${recipe.jackpotGenreXp} XP)`}
          </div>
        </>
      );
    }

    if (sacPillars.has('tag')) {
      return (
        <div className="text-xs text-rose-300/90 font-bold py-2">
          🗡️ Categoria sacrificada pela Carta de Tarô (-{recipe.baseTagXp || 0} XP base)
        </div>
      );
    }

    const goldSet = new Set([recipe.jackpotTag, ...(recipe.extraJackpotTags || [])]);
    return (
      <>
        <div className="flex flex-wrap gap-1 mt-1">
          {(recipe.tags || []).map((t) => {
            const isGold = legPillars.has('tag') || goldSet.has(t);
            return (
              <span
                key={t}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                  isGold
                    ? 'bg-amber-400/20 border-amber-300/60 text-amber-100'
                    : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
                }`}
              >
                {isGold ? '👑 ' : '🏷️ '}
                {t}
              </span>
            );
          })}
        </div>
        {optPillars.has('tag') && (
          <div className="mt-1.5 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
            🌑 Tags Opcionais (Sem XP de Tag se não bater)
          </div>
        )}
        <div className={`mt-2 pt-2 border-t border-white/10 text-[11px] font-bold ${cursedPillars.has('tag') ? 'text-rose-300' : 'text-amber-300'}`}>
          {cursedPillars.has('tag')
            ? '💀 Jackpot Ceifado pela Morte (+0 XP)'
            : legPillars.has('tag')
            ? `👑 TODAS AS TAGS = JACKPOT (+${recipe.jackpotTagXp} XP)`
            : recipe.extraJackpotTags?.length
            ? `☄️ Ouros${recipe.stackableTagJackpots ? ' Acumuláveis' : ''}: ${Array.from(goldSet).join(' / ')} (+${recipe.jackpotTagXp} XP${recipe.stackableTagJackpots ? ' cada' : ''})`
            : `👑 Tag Ouro: ${recipe.jackpotTag} (+${recipe.jackpotTagXp} XP)`}
        </div>
      </>
    );
  };

  return (
    <section
      className={`rounded-3xl border-2 p-5 sm:p-6 transition-all duration-500 bg-gradient-to-br ${
        allCategoriesRevealed ? overallTheme.bg : 'from-zinc-950 via-zinc-900 to-indigo-950/30'
      } ${allCategoriesRevealed ? overallTheme.ring : 'border-amber-400/45 shadow-[0_0_45px_rgba(251,191,36,0.18)]'}`}
    >
      {/* Cabeçalho da Mesa D20 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/45 text-amber-200 text-[10px] font-black uppercase tracking-widest">
              <Dices className="w-3.5 h-3.5" />
              Mesa de Forja D20 • {revealedCount}/4 Categorias Sorteadas
            </span>
            {allCategoriesRevealed && (recipe.difficultyBonusXp || 0) > 0 && (
              <span className="chimera-jackpot-pop px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-200 text-[10px] font-black">
                +{recipe.difficultyBonusXp} XP Dificuldade
              </span>
            )}
            {allCategoriesRevealed && recipe.specialRule && (
              <span className="chimera-jackpot-pop inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 text-[10px] font-black">
                <Zap className="w-3 h-3" /> {recipe.specialRule.label}
              </span>
            )}
            {allCategoriesRevealed && (recipe.requiresDubbedBonusXp || 0) > 0 && (
              <span className="chimera-jackpot-pop inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 text-[10px] font-black">
                🎙️ Dublado +{recipe.requiresDubbedBonusXp} XP
              </span>
            )}
            {allCategoriesRevealed && (recipe.requiresSubbedBonusXp || 0) > 0 && (
              <span className="chimera-jackpot-pop inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-100 text-[10px] font-black">
                💬 Legendado +{recipe.requiresSubbedBonusXp} XP
              </span>
            )}
            {allCategoriesRevealed && (recipe.categoryXpMultiplierBonusRate || 0) > 0 && (
              <span className="chimera-jackpot-pop inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-100 text-[10px] font-black">
                🗼 +{Math.round(recipe.categoryXpMultiplierBonusRate * 100)}% XP / Categoria
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
            {allCategoriesRevealed && overallTier === 'nightmare' && (
              <Skull className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>
              {allCategoriesRevealed
                ? recipe.creatureTitle
                : 'Clique nas Categorias na Ordem que Quiser para Rolar os D20!'}
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            {allCategoriesRevealed
              ? recipe.creatureSubtitle
              : 'Cada categoria abre seu próprio Dado D20 estilo Baldur’s Gate 3 + Roleta. As 5 Cartas de Tarô aparecem após revelar as 4!'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!allCategoriesRevealed ? (
            <button
              type="button"
              onClick={handleRevealAllAtOnce}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-bold cursor-pointer"
            >
              ⚡ Revelar Todas Rápido
            </button>
          ) : (runePicksRemaining === 0 && (chosenFateRunes.length > 0 || fateRunes.length === 0)) ? (
            <button
              type="button"
              onClick={onFinishRitual}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-300 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Selar Contrato & Ir Caçar!
            </button>
          ) : null}

          {onDeclineChimera && (
            <button
              type="button"
              onClick={() => onDeclineChimera(contract.id)}
              disabled={actionBusy || runeBusy || declineChipsRemaining <= 0}
              title={
                declineChipsRemaining <= 0
                  ? 'Sem fichas de Declínio disponíveis no momento.'
                  : 'Gasta 1 Declínio para cancelar esta Quimera e DEVOLVER +1 Ficha de Forja!'
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 text-[11px] font-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🪶 Declinar (+1 Ficha • {declineChipsRemaining})
            </button>
          )}

          {showLabTools && onDiscardChimera && (
            <button
              type="button"
              onClick={() => onDiscardChimera(contract.id)}
              disabled={actionBusy || runeBusy}
              title="Deletar esta Quimera no Lab (sem estornar ficha)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/45 text-rose-200 text-[11px] font-black transition-colors cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Deletar Quimera (Lab)
            </button>
          )}
        </div>
      </div>

      {/* Grid das 4 Categorias Clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 mt-4">
        {CATEGORY_ORDER.map((cat) => {
          const isOpen = Boolean(revealedMap[cat.id]);
          const catRoll = Number(d20Rolls[cat.id] || 10);
          const catTier = resolveDifficultyKey(catRoll);
          const catTheme = D20_TIER_THEME[catTier];
          const isFullLeg =
            (cat.id === 'era' && legPillars.has('year')) ||
            (cat.id === 'block' && legPillars.has('country')) ||
            (cat.id === 'genre' && legPillars.has('genre')) ||
            (cat.id === 'tag' && legPillars.has('tag'));
          const Icon = cat.icon;

          if (!isOpen) {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleOpenCategoryBg3(cat.id)}
                className="group rounded-2xl border-2 border-dashed border-amber-400/45 hover:border-amber-300 bg-zinc-950/75 hover:bg-amber-950/20 p-5 flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer min-h-[170px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Dices className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-white">
                    {cat.title}
                  </div>
                  <div className="text-[11px] text-amber-300/85 mt-1 font-bold">
                    🎲 Clique para Rolar o D20
                  </div>
                </div>
              </button>
            );
          }

          return (
            <div
              key={cat.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                isFullLeg
                  ? 'chimera-rune-legendary border-amber-300 bg-gradient-to-b from-amber-500/20 to-zinc-950 text-amber-100'
                  : `${cat.color} chimera-jackpot-pop`
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {cat.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[9px] font-black ${catTheme.badge}`}
                  >
                    🎲 {catRoll} • {catTheme.label}
                  </span>
                </div>
                {renderCategoryContent(cat.id)}
              </div>
              {isFullLeg && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-amber-300">
                  <Crown className="w-3.5 h-3.5" /> Poder Lendário Ativo!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MESA DAS 5 CARTAS DE TARÔ — Só destrava APÓS revelar todas as 4 categorias! */}
      {!allCategoriesRevealed ? (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 px-4 py-4 text-center text-xs text-zinc-400">
          🔮 <strong>Mesa de Tarô bloqueada:</strong> sorteie todas as <strong>4 categorias</strong>{' '}
          acima (faltam {4 - revealedCount}) para despertar as 5 Cartas de Tarô!
        </div>
      ) : (
        fateRunes.length > 0 && (
          <div className="chimera-jackpot-pop relative overflow-hidden mt-5 rounded-[2rem] border border-amber-400/35 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.34),rgba(9,9,11,0.97)_74%)] p-5 sm:p-6 flex flex-col gap-5 shadow-[inset_0_0_65px_rgba(0,0,0,0.85)]">
            {/* Círculo astral decorativo sutil da Mesa de Tarô */}
            <div className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 w-[520px] h-[520px] rounded-full border border-amber-300/10" />
            <div className="pointer-events-none absolute left-1/2 -top-14 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-dashed border-purple-300/10" />

            <div className="relative z-10 text-center flex flex-col items-center gap-1">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-200 flex flex-wrap items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {runePicksRemaining === 0 && chosenFateRunes.length > 0 ? (
                  <span>
                    Arcano(s) Selado(s):{' '}
                    {chosenFateRunes.map((cr) => `${cr.icon} ${cr.runeName}`).join(' • ')}
                  </span>
                ) : chosenFateRunes.length > 0 && runePicksRemaining > 0 ? (
                  <span>
                    ⚡ Escolha Extra na Mesa! Selecione mais {runePicksRemaining} Carta
                    {runePicksRemaining > 1 ? 's' : ''}
                    {revealRemainingRarities ? ' (👁️ Raridades Reveladas!)' : ' (Totalmente Ocultas!)'}
                  </span>
                ) : (
                  '🕯️ Mesa de Tarô Cinéfilo — Escolha 1 das 5 Cartas Viradas'
                )}
              </div>
              <p className="text-[11px] text-zinc-400 max-w-xl">
                {runePicksRemaining === 0 && chosenFateRunes.length > 0
                  ? 'Clique em qualquer carta revelada na mesa abaixo para abrir em tamanho grande e ler seu significado.'
                  : revealRemainingRarities
                  ? 'A Clarividência revelou as auras das cartas fechadas (incluindo eventual Maldição da Morte 💀)! Clique para virar.'
                  : 'Passe o cursor e escolha sua carta no leque — cuidados ocultos aguardam entre bênçãos Comuns, Raras, Lendárias e a temida Morte (XIII).'}
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 py-3 sm:py-5 px-1">
              {fateRunes.map((rune, idx) => {
                const rStyle = RUNE_RARITY_STYLE[rune.rarity] || RUNE_RARITY_STYLE.common;
                const arcanaMeta = getRuneTarotMeta(rune);
                const isChosen = Boolean(rune.chosen) || chosenFateRunes.some((cr) => cr.id === rune.id);
                const revealed = isChosen || (runePicksRemaining === 0 && chosenFateRunes.length > 0);
                const showClosedRarityHint = !revealed && revealRemainingRarities;
                const arcTiltCls = [
                  'lg:-rotate-6 lg:translate-y-4',
                  'lg:-rotate-3 lg:translate-y-1',
                  'lg:rotate-0 lg:-translate-y-1',
                  'lg:rotate-3 lg:translate-y-1',
                  'lg:rotate-6 lg:translate-y-4',
                ][idx % 5];

                const closedRarityFrame =
                  rune.rarity === 'cursed'
                    ? 'border-rose-500 ring-2 ring-rose-500/60 shadow-[0_0_28px_rgba(225,29,72,0.5)]'
                    : rune.rarity === 'legendary'
                    ? 'border-amber-400 ring-2 ring-amber-300/60 shadow-[0_0_28px_rgba(251,191,36,0.45)]'
                    : rune.rarity === 'rare'
                    ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-[0_0_24px_rgba(56,189,248,0.35)]'
                    : 'border-zinc-400 shadow-[0_0_16px_rgba(161,161,170,0.22)]';

                const isDisabled = !revealed && (runeBusy || runePicksRemaining <= 0);

                return (
                  <button
                    key={rune.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!revealed) {
                        onSelectFateRune(contract.id, rune.id);
                      } else {
                        setInspectedRune(rune);
                      }
                    }}
                    className={`group relative flex flex-col text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                      !revealed
                        ? `${arcTiltCls} hover:rotate-0 hover:-translate-y-4 hover:scale-[1.05] hover:z-30 ${
                            showClosedRarityHint ? closedRarityFrame : MYSTERY_RUNE_BACK_CLS
                          }`
                        : isChosen
                        ? `${rStyle.revealAnim} ${rStyle.openCard} scale-[1.03] z-20 hover:scale-[1.06]`
                        : 'border-zinc-700/80 bg-zinc-950/90 text-zinc-400 opacity-70 hover:opacity-100 hover:scale-[1.03]'
                    }`}
                  >
                    {/* Faíscas explosivas quando o jogador tira Lendária! */}
                    {revealed && isChosen && rune.rarity === 'legendary' && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
                        {LEGENDARY_SPARKS.map((sp, spIdx) => (
                          <span
                            key={spIdx}
                            className="chimera-coin-particle absolute text-xl select-none"
                            style={{
                              '--tx': sp.tx,
                              '--ty': sp.ty,
                              '--rot': sp.rot,
                              animationDelay: `${spIdx * 0.04}s`,
                            }}
                          >
                            {sp.icon}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Imagem Real de Tarô (Verso fechada ou Arcano aberta) */}
                    <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden">
                      <img
                        src={revealed ? arcanaMeta.image : TAROT_BACK_IMAGE}
                        alt={revealed ? `${arcanaMeta.roman} ${arcanaMeta.name}` : `Carta de Tarô #${idx + 1}`}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          !revealed ? 'group-hover:scale-105' : isChosen ? '' : 'grayscale-[35%] brightness-75'
                        }`}
                      />

                      {!revealed && (
                        <>
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60" />
                          <div className="absolute top-2 inset-x-2 flex justify-center">
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${
                                showClosedRarityHint
                                  ? rune.rarity === 'cursed'
                                    ? 'bg-rose-600 text-white border-rose-200 animate-pulse'
                                    : rune.rarity === 'legendary'
                                      ? 'bg-amber-400 text-zinc-950 border-amber-200'
                                      : rune.rarity === 'rare'
                                        ? 'bg-sky-500/85 border-sky-200 text-white'
                                        : 'bg-zinc-800/90 border-zinc-400 text-zinc-100'
                                  : 'bg-black/75 border-amber-400/50 text-amber-200'
                              }`}
                            >
                              {showClosedRarityHint ? `👁️ ${rStyle.label}` : `Carta #${idx + 1}`}
                            </span>
                          </div>
                          <div className="absolute bottom-2 inset-x-2 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-black/80 border border-amber-300/45 text-[10px] font-black uppercase tracking-wider text-amber-200 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                              ✨ Virar Carta
                            </span>
                          </div>
                        </>
                      )}

                      {revealed && (
                        <>
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent opacity-90" />
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border backdrop-blur-md ${
                                rune.rarity === 'cursed'
                                  ? 'bg-rose-600/90 border-rose-200 text-white'
                                  : rune.rarity === 'legendary'
                                    ? 'bg-amber-400 text-zinc-950 border-amber-100'
                                    : rune.rarity === 'rare'
                                      ? 'bg-sky-500/90 text-white border-sky-200'
                                      : 'bg-zinc-800/90 text-zinc-100 border-zinc-400'
                              }`}
                            >
                              {rStyle.label}
                            </span>
                            {isChosen && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-zinc-950 text-[9px] font-black uppercase shadow">
                                Selada
                              </span>
                            )}
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/85 border border-amber-300/70 text-[10px] font-black text-amber-200 shadow-lg">
                              <Eye className="w-3 h-3" /> Ampliar
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Rodapé entalhado da carta revelada */}
                    {revealed && (
                      <div className="p-2.5 bg-zinc-950/95 border-t border-white/10 flex flex-col gap-1 flex-1">
                        <div className="text-[9.5px] font-mono uppercase tracking-wider text-amber-300/90 truncate">
                          Arcano {arcanaMeta.roman} • {arcanaMeta.name}
                        </div>
                        <div className="text-xs font-black text-white flex items-center gap-1 leading-tight">
                          <span>{rune.icon}</span>
                          <span className="truncate">{rune.runeName}</span>
                        </div>
                        <p className="text-[10px] text-zinc-300/90 line-clamp-2 leading-snug">
                          {rune.shortTag}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Aviso se alguma Maldição de Morte anulou Jackpot em algum pilar */}
      {cursedPillars.size > 0 && (
        <div className="mt-3 rounded-xl border border-rose-500/45 bg-rose-950/35 px-3.5 py-2 text-[11px] font-bold text-rose-200 flex items-center gap-2">
          <Skull className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            Maldição da Morte ativa: o Jackpot foi ceifado em{' '}
            {Array.from(cursedPillars).join(', ').toUpperCase()}.
          </span>
        </div>
      )}

      <TarotCardShowcaseModal rune={inspectedRune} onClose={() => setInspectedRune(null)} />

      {/* MODAL CENA BALDUR'S GATE 3 + CAÇA-NÍQUEIS DESACELERANDO */}
      {modalCat && (
        <div className="fixed inset-0 z-[130] bg-black/88 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`relative w-full max-w-xl rounded-3xl border-2 p-6 sm:p-8 flex flex-col items-center gap-5 text-center transition-all duration-300 bg-gradient-to-b ${
              modalPhase === 'spinning'
                ? 'from-zinc-900 via-indigo-950/60 to-zinc-950 border-amber-400/75 shadow-[0_0_90px_rgba(251,191,36,0.35)]'
                : `${modalTheme.bg} ${modalTheme.ring}`
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300/90">
                🎲 Teste de Destino Estilo Baldur’s Gate
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activeModalCatMeta?.title}
              </h3>
              <span className="text-[11px] text-zinc-400">
                1–4 💀 Pesadelo • 5–9 🔥 Difícil • 10–15 ⚔️ Médio • 16–20 🌟 Suave
              </span>
            </div>

            {/* Dado D20 BG3 */}
            <D20Bg3Svg value={liveDiceValue} phase={modalPhase} theme={modalTheme} />

            {/* Resultado do Dado quando travado */}
            {modalPhase !== 'spinning' && (
              <div
                className={`chimera-jackpot-pop px-4 py-1.5 rounded-full border text-xs font-black ${modalTheme.badge}`}
              >
                Rolagem D20: {modalTargetRoll} — {modalTheme.headline}
              </div>
            )}

            {/* Roleta Caça-Níqueis Desacelerando */}
            <div className="w-full rounded-2xl border border-white/15 bg-zinc-950/90 p-4 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {modalPhase === 'spinning'
                  ? '🎰 Roleta girando — clique abaixo para parar o dado!'
                  : modalPhase === 'slowing'
                  ? '⏳ Desacelerando devagar até o alvo...'
                  : '✅ Sorteio Travado!'}
              </span>

              <div
                className={`min-h-[3.5rem] rounded-xl border px-4 py-3 flex items-center justify-center font-black text-sm sm:text-base transition-all ${
                  modalPhase === 'landed'
                    ? 'chimera-jackpot-pop border-amber-400 bg-amber-400/15 text-amber-200'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-100'
                }`}
              >
                {slotCandidates[slotIdx] || '...'}
              </div>

              {/* Mostra TODOS os detalhes reais (inclusive todos países do bloco!) ao pousar */}
              {modalPhase === 'landed' && (
                <div className="chimera-jackpot-pop text-left rounded-xl bg-zinc-900/90 border border-white/10 p-3 mt-1">
                  {renderCategoryContent(modalCat)}
                </div>
              )}
            </div>

            {/* Botão Principal da Cena BG3 */}
            {modalPhase === 'spinning' ? (
              <button
                type="button"
                onClick={handleStopDiceAndDecelerate}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-zinc-950 font-black uppercase text-sm tracking-wider shadow-[0_0_32px_rgba(251,191,36,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Hand className="w-5 h-5" />
                Clique para Parar o Dado!
              </button>
            ) : modalPhase === 'slowing' ? (
              <div className="text-xs font-black uppercase tracking-widest text-amber-300 animate-pulse py-2">
                Desacelerando roleta...
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAcceptModalResult}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-300 text-zinc-950 font-black uppercase text-sm tracking-wider shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                Aceitar e Voltar à Mesa
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
