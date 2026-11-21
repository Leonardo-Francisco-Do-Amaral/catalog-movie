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
} from 'lucide-react';
import {
  playChimeraDiceThrowSound,
  playChimeraSlotTickSound,
  playChimeraJackpotTickSound,
} from '../utils/trophyAudio';

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
  'border-purple-400/55 bg-gradient-to-b from-zinc-900 via-purple-950/35 to-zinc-950 hover:border-amber-300/75 shadow-[0_0_20px_rgba(168,85,247,0.18)]';

const RUNE_RARITY_STYLE = {
  common: {
    label: '⚪ Runa Comum',
    revealAnim: 'chimera-reveal-common',
    openCard: 'border-zinc-300/70 bg-zinc-900 text-zinc-100',
    tagColor: 'text-zinc-300',
    burstBanner: '⚪ Runa Comum Despertada',
  },
  rare: {
    label: '💠 Runa Rara',
    revealAnim: 'chimera-reveal-rare',
    openCard:
      'border-sky-400 bg-gradient-to-b from-sky-950/75 to-indigo-950/85 text-sky-100',
    tagColor: 'text-sky-300',
    burstBanner: '💠 VÓRTICE RARO DESPERTADO!',
  },
  legendary: {
    label: '👑 Runa Lendária',
    revealAnim: 'chimera-reveal-legendary',
    openCard:
      'chimera-rune-legendary border-amber-300 bg-gradient-to-b from-amber-500/25 via-zinc-950 to-yellow-950/60 text-amber-100',
    tagColor: 'text-amber-300',
    burstBanner: '👑 DESPERTAR LENDÁRIO SUPREMO!!',
  },
};

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
  onFinishRitual = () => {},
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

  const timersRef = useRef([]);
  const spinIntervalRef = useRef(null);

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
  const sacPillars = new Set(recipe?.sacrificedPillars || []);
  const fateRunes = recipe?.fateRunes || [];
  const chosenFateRune = recipe?.chosenFateRune || null;
  const chosenFateRunes =
    Array.isArray(recipe?.chosenFateRunes) && recipe.chosenFateRunes.length > 0
      ? recipe.chosenFateRunes
      : chosenFateRune
      ? [chosenFateRune]
      : [];
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
            🗡️ Categoria sacrificada pela Runa (-{recipe.baseYearXp || 0} XP base)
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
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] font-bold text-amber-300">
            {legPillars.has('year')
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
            🗡️ Categoria sacrificada pela Runa (-{recipe.baseCountryXp || 0} XP base)
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
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] font-bold text-amber-300">
            {legPillars.has('country')
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
            🗡️ Categoria sacrificada pela Runa (-{recipe.baseGenreXp || 0} XP base)
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
          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] font-bold text-amber-300">
            {legPillars.has('genre')
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
          🗡️ Categoria sacrificada pela Runa (-{recipe.baseTagXp || 0} XP base)
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
        <div className="mt-2 pt-2 border-t border-white/10 text-[11px] font-bold text-amber-300">
          {legPillars.has('tag')
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
              : 'Cada categoria abre seu próprio Dado D20 estilo Baldur’s Gate 3 + Roleta. As 5 Runas Roguelike aparecem após revelar as 4!'}
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* ALTAR DAS 5 RUNAS ROGUELIKE — Só destrava APÓS revelar todas as 4 categorias! */}
      {!allCategoriesRevealed ? (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 px-4 py-4 text-center text-xs text-zinc-400">
          🔮 <strong>Altar das 5 Runas Roguelike bloqueado:</strong> sorteie todas as <strong>4 categorias</strong>{' '}
          acima (faltam {4 - revealedCount}) para despertar as 5 Runas Arcanas!
        </div>
      ) : (
        fateRunes.length > 0 && (
          <div className="chimera-jackpot-pop mt-5 rounded-2xl border border-purple-400/50 bg-zinc-950/90 p-4 sm:p-5 flex flex-col gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-amber-200 flex flex-wrap items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {runePicksRemaining === 0 && chosenFateRunes.length > 0 ? (
                  <span>
                    Runa(s) Selada(s):{' '}
                    {chosenFateRunes.map((cr) => `${cr.icon} ${cr.runeName}`).join(' • ')}
                  </span>
                ) : chosenFateRunes.length > 0 && runePicksRemaining > 0 ? (
                  <span>
                    ⚡ Escolha Extra Liberada! Selecione mais {runePicksRemaining} Runa
                    {runePicksRemaining > 1 ? 's' : ''}
                    {revealRemainingRarities ? ' (👁️ Raridades Reveladas!)' : ' (Totalmente Ocultas!)'}
                  </span>
                ) : (
                  'Todas as 4 Categorias Reveladas! Escolha 1 das 5 Runas Misteriosas:'
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {runePicksRemaining === 0 && chosenFateRunes.length > 0
                  ? 'Todos os poderes foram aplicados diretamente na receita acima! Já pode ir caçar.'
                  : revealRemainingRarities
                  ? 'Eco Supremo revelou a raridade das cartas fechadas restantes! Escolha a próxima Runa do Altar.'
                  : 'Todas as Runas fechadas ocultam nome e raridade até você clicar!'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {fateRunes.map((rune, idx) => {
                const rStyle = RUNE_RARITY_STYLE[rune.rarity] || RUNE_RARITY_STYLE.common;
                const isChosen = Boolean(rune.chosen) || chosenFateRunes.some((cr) => cr.id === rune.id);
                const revealed = isChosen || (runePicksRemaining === 0 && chosenFateRunes.length > 0);
                const showClosedRarityHint = !revealed && revealRemainingRarities;

                const closedRarityFrame =
                  rune.rarity === 'legendary'
                    ? 'border-amber-400 bg-gradient-to-b from-amber-950/75 via-zinc-950 to-amber-900/40 hover:scale-[1.03] shadow-[0_0_24px_rgba(251,191,36,0.3)]'
                    : rune.rarity === 'rare'
                    ? 'border-sky-400 bg-gradient-to-b from-sky-950/75 via-zinc-950 to-sky-900/40 hover:scale-[1.03] shadow-[0_0_20px_rgba(56,189,248,0.22)]'
                    : 'border-zinc-500 bg-gradient-to-b from-zinc-800/80 via-zinc-950 to-zinc-900/90 hover:scale-[1.03]';

                return (
                  <button
                    key={rune.id}
                    type="button"
                    disabled={revealed || runeBusy || runePicksRemaining <= 0}
                    onClick={() => onSelectFateRune(contract.id, rune.id)}
                    className={`relative overflow-visible text-left rounded-2xl border-2 p-3.5 transition-all ${
                      !revealed
                        ? `${showClosedRarityHint ? closedRarityFrame : MYSTERY_RUNE_BACK_CLS} cursor-pointer`
                        : isChosen
                        ? `${rStyle.revealAnim} ${rStyle.openCard}`
                        : 'border-zinc-800 bg-zinc-950/75 text-zinc-500 opacity-55'
                    }`}
                  >
                    {/* Faíscas explosivas quando o jogador tira Lendária! */}
                    {revealed && isChosen && rune.rarity === 'legendary' && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
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

                    {!revealed ? (
                      <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                            showClosedRarityHint
                              ? rune.rarity === 'legendary'
                                ? 'bg-amber-400 text-zinc-950 border-amber-200'
                                : rune.rarity === 'rare'
                                ? 'bg-sky-400/25 border-sky-300 text-sky-100'
                                : 'bg-zinc-700 border-zinc-500 text-zinc-100'
                              : 'bg-purple-500/25 border-purple-400/50 text-purple-200'
                          }`}
                        >
                          {showClosedRarityHint ? `👁️ ${rStyle.label}` : '🔒 Selo Oculto'}
                        </span>
                        <span className="text-3xl my-1">🔮</span>
                        <span className="text-xs font-black uppercase tracking-wider text-white">
                          Runa #{idx + 1}
                        </span>
                        <span className="text-[10px] text-zinc-300/80">
                          {showClosedRarityHint ? 'Clique p/ revelar poder' : 'Clique p/ despertar'}
                        </span>
                      </div>
                    ) : (
                      <div className="relative z-10 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`text-[9px] font-black uppercase ${rStyle.tagColor}`}>
                            {rStyle.label}
                          </span>
                          {isChosen && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                rune.rarity === 'legendary'
                                  ? 'bg-amber-400 text-zinc-950'
                                  : rune.rarity === 'rare'
                                  ? 'bg-sky-400 text-zinc-950'
                                  : 'bg-zinc-200 text-zinc-950'
                              }`}
                            >
                              Selada
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-black flex items-center gap-1.5 mt-0.5">
                          <span>{rune.icon}</span>
                          <span>{rune.runeName}</span>
                        </div>
                        <p className="text-[10px] opacity-90 leading-relaxed">{rune.label}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}

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
