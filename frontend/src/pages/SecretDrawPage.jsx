import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Dices,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  FlaskConical,
  SearchCheck,
  AlertTriangle,
  Film,
  History,
  Upload,
  ChevronDown,
  ChevronUp,
  Trophy,
  BarChart3,
  CalendarClock,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { triggerXPGainToast } from '../utils/xpSystem';
import { dispatchHarlequinWorldEvent, dispatchHarlequinProfileSync } from '../utils/harlequinEvents';
import { getCycle15CountdownLabel, formatCycleKeyLabel } from '../utils/cycleCountdown';
import { ALL_CINEMA_CLASSES } from '../utils/analyticsEngine';
import {
  POWER_TIER_META,
  getClassPowers,
  getEquippedClassId,
  dispatchClassPowerSync,
} from '../utils/classPowersCatalog';
import {
  isAudioMuted,
  preloadSecretShuffleSound,
  startSecretShuffleSound,
  stopSecretShuffleSound,
  playSecretCardFlipSound,
} from '../utils/trophyAudio';
import SecretDrawCardRevealModal from '../components/SecretDrawCardRevealModal';
import PowerHelpButton from '../components/PowerHelpButton';
import {
  SECRET_DECK_BACK_IMAGE,
  HARLEQUIN_CROUPIER_AVATAR,
  HARLEQUIN_BACKGROUND_LORE,
  getSecretSuitBackImage,
  getSecretCardUrl,
  getSecretPlayingCardMeta,
  getSpecialCardArtGallery,
  getSpecialCardDisplayMeta,
  resolveSpecialCardPrimaryUrl,
  groupSimpleMilestones,
  SPECIAL_RARITY_META,
  FALLBACK_SPECIAL_CARDS_CATALOG,
} from '../utils/secretSpecialCardsCatalog';

const SUIT_META = {
  common: {
    suit: '♣',
    rank: 'C',
    suitName: 'Paus',
    borderFrame: 'border-emerald-400/55',
    innerFrame: 'border-emerald-300/30',
    backBg: 'from-[#06241c] via-[#0a3629] to-[#041812]',
    frontGradient: 'from-emerald-950/90 via-zinc-950/85 to-emerald-950/95',
    badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
    xpChip: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/60',
    ringColor: 'border-emerald-400',
    glowShadow: 'shadow-[0_18px_45px_rgba(16,185,129,0.24)]',
    shellClass: 'secret-shell-common',
    accentText: 'text-emerald-300',
    sparkleChar: '♣',
  },
  medium: {
    suit: '♦',
    rank: 'M',
    suitName: 'Ouros',
    borderFrame: 'border-sky-400/60',
    innerFrame: 'border-sky-300/30',
    backBg: 'from-[#081b33] via-[#0c2d54] to-[#051223]',
    frontGradient: 'from-sky-950/90 via-zinc-950/85 to-sky-950/95',
    badge: 'bg-sky-500/20 text-sky-200 border-sky-400/55',
    xpChip: 'bg-sky-400/20 text-sky-100 border-sky-300/60',
    ringColor: 'border-sky-400',
    glowShadow: 'shadow-[0_18px_48px_rgba(56,189,248,0.26)]',
    shellClass: 'secret-shell-medium',
    accentText: 'text-sky-300',
    sparkleChar: '♦',
  },
  hard: {
    suit: '♠',
    rank: 'D',
    suitName: 'Espadas',
    borderFrame: 'border-purple-400/65',
    innerFrame: 'border-purple-300/35',
    backBg: 'from-[#1a0b33] via-[#2b1254] to-[#100621]',
    frontGradient: 'from-purple-950/90 via-zinc-950/85 to-purple-950/95',
    badge: 'bg-purple-500/25 text-purple-200 border-purple-400/55',
    xpChip: 'bg-purple-400/25 text-purple-100 border-purple-300/60',
    ringColor: 'border-purple-400',
    glowShadow: 'shadow-[0_20px_52px_rgba(168,85,247,0.3)]',
    shellClass: 'secret-shell-hard',
    accentText: 'text-purple-300',
    sparkleChar: '♠',
  },
  very_hard: {
    suit: '♥',
    rank: 'MD',
    suitName: 'Copas',
    borderFrame: 'border-amber-400/75',
    innerFrame: 'border-amber-300/40',
    backBg: 'from-[#331307] via-[#54220a] to-[#1f0a03]',
    frontGradient: 'from-amber-950/90 via-zinc-950/85 to-orange-950/95',
    badge: 'bg-amber-500/25 text-amber-200 border-amber-400/65',
    xpChip: 'bg-amber-400/25 text-amber-100 border-amber-300/70',
    ringColor: 'border-amber-400',
    glowShadow: 'shadow-[0_20px_56px_rgba(245,158,11,0.34)]',
    shellClass: 'secret-shell-very_hard',
    accentText: 'text-amber-300',
    sparkleChar: '♥',
  },
  exotic: {
    suit: '★',
    rank: 'EX',
    suitName: 'Coringa Prisma',
    borderFrame: 'border-rose-300/80',
    innerFrame: 'border-fuchsia-300/45',
    backBg: 'from-[#2e0727] via-[#4a0e45] to-[#1b0529]',
    frontGradient: 'from-fuchsia-950/90 via-zinc-950/85 to-rose-950/95',
    badge: 'bg-gradient-to-r from-rose-500/30 via-fuchsia-500/30 to-amber-500/30 text-rose-100 border-rose-300/75 secret-exotic-holo',
    xpChip: 'bg-gradient-to-r from-rose-500/35 to-amber-400/30 text-white border-rose-200/80',
    ringColor: 'border-rose-400',
    glowShadow: 'shadow-[0_22px_65px_rgba(244,63,94,0.42)]',
    shellClass: 'secret-shell-exotic',
    accentText: 'text-rose-300',
    sparkleChar: '✦',
  },
};

const FAN_LAYOUT_CLASSES = [
  'xl:-rotate-[4deg] xl:translate-y-4',
  'xl:-rotate-[2deg] xl:translate-y-1',
  'xl:rotate-0 xl:translate-y-0',
  'xl:rotate-[2deg] xl:translate-y-1',
  'xl:rotate-[4deg] xl:translate-y-4',
];

const FAN_LAYOUT_3 = [
  'xl:-rotate-[3deg] xl:translate-y-2',
  'xl:rotate-0 xl:translate-y-0',
  'xl:rotate-[3deg] xl:translate-y-2',
];

const LARGE_HAND_TILT = [
  'xl:-rotate-[2deg] xl:translate-y-1',
  'xl:rotate-[1deg] xl:translate-y-0',
  'xl:rotate-0 xl:translate-y-0',
  'xl:-rotate-[1deg] xl:translate-y-0',
  'xl:rotate-[2deg] xl:translate-y-1',
];

const BURST_VECTORS = [
  { tx: '-88px', ty: '-74px', rot: '-42deg' },
  { tx: '88px', ty: '-74px', rot: '42deg' },
  { tx: '-105px', ty: '12px', rot: '-75deg' },
  { tx: '105px', ty: '12px', rot: '75deg' },
  { tx: '-62px', ty: '92px', rot: '-25deg' },
  { tx: '62px', ty: '92px', rot: '25deg' },
  { tx: '0px', ty: '-108px', rot: '18deg' },
  { tx: '0px', ty: '104px', rot: '-18deg' },
];

const AUDIT_STYLE = {
  selected: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
  skipped_watched_after_tmdb: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200',
  skipped_watched_before_api: 'bg-sky-500/10 border-sky-500/30 text-sky-200',
  skipped_duplicate_in_draw: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200',
  skipped_saga_sequel: 'bg-violet-500/10 border-violet-500/30 text-violet-200',
  skipped_saga_blocked: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
  skipped_not_found: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
  skipped_error: 'bg-red-500/10 border-red-500/30 text-red-200',
};

const RANDOM_FAVORITE_ANIMS = ['classic', 'tornado', 'wax'];

function getSecretRewardMeta(item) {
  const isGold = item?.rewardMode === 'gold' || item?.card?.rewardMode === 'gold';
  const amount = isGold
    ? Number(item?.goldAwarded || item?.goldReward || item?.card?.goldReward || 0)
    : Number(item?.xpAwarded || item?.xpReward || item?.card?.xpReward || 0);
  return {
    isGold,
    amount,
    short: isGold ? `+${amount} 🪙` : `+${amount} XP`,
    unit: isGold ? '🪙' : 'XP',
    badgeCls: isGold
      ? 'bg-amber-400/25 border-amber-300/75 text-amber-200'
      : 'bg-amber-500/20 border-amber-400/50 text-amber-200',
  };
}

const SAGA_RULE_OPTIONS = [
  {
    id: 'redirect_first',
    label: 'Começar do 1º Pendente',
    icon: '📚',
    hint: 'Se sair sequência (ex: Filme 3), redireciona automaticamente para o 1º capítulo ainda não assistido da saga',
  },
  {
    id: 'skip_sequels',
    label: 'Pular Sequências',
    icon: '⏭️',
    hint: 'Pula qualquer filme cujo capítulo anterior da saga ainda não foi assistido e sorteia outro',
  },
  {
    id: 'allow_any',
    label: 'Livre (Qualquer Cap.)',
    icon: '🔓',
    hint: 'Aceita qualquer capítulo da saga diretamente sem filtrar',
  },
];

let sharedAudioCtx = null;
function getAudioCtx() {
  if (typeof window === 'undefined' || isAudioMuted()) return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playCardDealFx(index) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(280 + index * 38, t);
  osc.frequency.exponentialRampToValueAtTime(520 + index * 45, t + 0.075);
  gain.gain.setValueAtTime(0.065, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.095);
}

function playSyntheticCardFlipFallback(difficulty, animStyle = 'classic') {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const chordByDiff = {
    common: [392, 493.88, 587.33],
    medium: [440, 554.37, 659.25],
    hard: [493.88, 622.25, 739.99],
    very_hard: [523.25, 659.25, 783.99, 1046.5],
    exotic: [587.33, 739.99, 880, 1174.66, 1479.98],
  };
  const freqs = chordByDiff[difficulty] || chordByDiff.common;
  const startOffset = animStyle === 'wax' ? 0.3 : animStyle === 'prism' ? 0.14 : animStyle === 'tornado' ? 0.58 : 0;
  const stepGap = animStyle === 'prism' ? 0.11 : 0.055;

  freqs.forEach((freq, idx) => {
    const t = now + startOffset + idx * stepGap;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = animStyle === 'prism' || difficulty === 'exotic' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.055, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}

function playCardFlipFx(difficulty, animStyle = 'classic') {
  playSecretCardFlipSound(() => playSyntheticCardFlipFallback(difficulty, animStyle));
}

function playCardDeclineFx() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Batida de carimbo + dissipação descendente
  [260, 195, 130].forEach((freq, i) => {
    const t = now + i * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.62, t + 0.28);
    gain.gain.setValueAtTime(0.065, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  });
}

function playCardBoomerangFx() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Voo em arco: sobe, gira e volta suave ao baralho
  [330, 493.88, 659.25, 440].forEach((freq, i) => {
    const t = now + i * 0.075;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(i === 3 ? freq * 0.85 : freq * 1.15, t + 0.24);
    gain.gain.setValueAtTime(0.055, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  });
}

const DECLINE_QUICK_REASONS = [
  'Não achei disponível para assistir',
  'Sem legenda ou áudio bom',
  'Deixar para outra oportunidade',
];

const BOOMERANG_QUICK_REASONS = [
  'Não estou no clima hoje',
  'Guardar para outra semana',
  'Prefiro ver outro gênero agora',
];

function SecretDrawCycleRestDisplay({ weekKey = '', outOfChips = true, hasQueuedMovies = false }) {
  const suitOrbiters = [
    { symbol: '♠', pos: 'top-3 left-6', delay: '0s', size: 'text-sm text-zinc-300' },
    { symbol: '♥', pos: 'top-6 right-5', delay: '0.45s', size: 'text-sm text-rose-400' },
    { symbol: '♦', pos: 'bottom-7 left-4', delay: '0.9s', size: 'text-sm text-amber-300' },
    { symbol: '♣', pos: 'bottom-4 right-6', delay: '1.35s', size: 'text-sm text-emerald-300' },
    { symbol: '★', pos: 'top-1/2 -left-1 -translate-y-1/2', delay: '0.6s', size: 'text-xs text-amber-200' },
    { symbol: '✦', pos: 'top-1/2 -right-1 -translate-y-1/2', delay: '1.1s', size: 'text-xs text-amber-200' },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-1">
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
        <div className="bingo-sanctum-aura pointer-events-none absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22)_0%,rgba(16,185,129,0.14)_46%,transparent_74%)]" />

        <svg
          viewBox="0 0 200 200"
          className="bingo-sanctum-orbit pointer-events-none absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(251, 191, 36, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
          <circle cx="100" cy="8" r="3" fill="#34d399" />
          <circle cx="192" cy="100" r="2.5" fill="#fde68a" />
          <circle cx="100" cy="192" r="3" fill="#34d399" />
          <circle cx="8" cy="100" r="2.5" fill="#fde68a" />
        </svg>

        <div className="bingo-sanctum-orbit-reverse pointer-events-none absolute inset-5 rounded-full border border-dashed border-amber-300/35 shadow-[inset_0_0_24px_rgba(245,158,11,0.14)]" />

        {suitOrbiters.map((sp, idx) => (
          <span
            key={idx}
            style={{ animationDelay: sp.delay }}
            className={`bingo-sanctum-sparkle pointer-events-none absolute ${sp.pos} ${sp.size} select-none font-black`}
          >
            {sp.symbol}
          </span>
        ))}

        {/* Baralho Secreto Lacrado */}
        <div className="bingo-sanctum-grimoire-float relative z-10 w-24 h-36 flex items-center justify-center">
          <div className="pointer-events-none absolute inset-0 translate-x-2 translate-y-1 rotate-6 rounded-2xl border shadow-lg border-amber-300/25 bg-[#111015]/95" />
          <div className="pointer-events-none absolute inset-0 -translate-x-2 translate-y-1 -rotate-6 rounded-2xl border shadow-lg border-emerald-400/25 bg-[#0a1412]/95" />

          <div className="relative w-full h-full rounded-2xl border-2 overflow-hidden shadow-2xl border-amber-300/75 bg-[#0a090d]">
            <img
              src={getSecretCardUrl(HARLEQUIN_CROUPIER_AVATAR)}
              alt="Baralho da Sessão Secreta Selado"
              className="w-full h-full object-cover object-[47%_18%] scale-[1.28] origin-[47%_18%] opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.65)] flex items-center justify-center text-slate-950">
                <Lock className="w-5 h-5 stroke-[2.6]" />
              </div>
            </div>
          </div>

          <span className="absolute -top-2 -right-3 px-2 py-0.5 rounded-full text-[9.5px] font-black text-slate-950 border border-amber-100 bg-gradient-to-r from-amber-300 to-yellow-500 shadow-[0_0_16px_rgba(251,191,36,0.45)]">
            {outOfChips && hasQueuedMovies ? '🔒 BANCA FECHADA' : '🔒 ZERADA'}
          </span>
        </div>
      </div>

      <div className="px-3.5 py-1 rounded-full border text-[10.5px] font-black uppercase tracking-widest shadow-inner bg-zinc-950/90 border-amber-400/35 text-amber-200">
        🃏 Baralho do Arlequim • {formatCycleKeyLabel(weekKey, { short: true, fallback: 'Ciclo Atual' })} • Trancado
      </div>
    </div>
  );
}

export default function SecretDrawPage({
  onOpenAddMovieForSecretCard,
  onXpStatusChange,
  onStatusLoaded,
}) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [shuffleDeepLoading, setShuffleDeepLoading] = useState(false);
  const [previewShuffling, setPreviewShuffling] = useState(false);
  const [dealingCount, setDealingCount] = useState(10);
  const [acting, setActing] = useState(false);
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoBanner, setInfoBanner] = useState('');
  const [ocarinaShuffling, setOcarinaShuffling] = useState(false);
  const [showLabTools, setShowLabTools] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).get('lab') === '1') return true;
      return window.localStorage.getItem('secret_draw_show_lab') === '1';
    } catch {
      return false;
    }
  });
  const [isLabTransparent, setIsLabTransparent] = useState(false);
  const [seatAnimStyles, setSeatAnimStyles] = useState({});
  const [countMode, setCountMode] = useState('10');
  const [sagaRule, setSagaRule] = useState('redirect_first');
  const [flippedSeats, setFlippedSeats] = useState({});
  const [flippingSeat, setFlippingSeat] = useState(null);
  const [burstSeats, setBurstSeats] = useState({});
  const [spotlightSeat, setSpotlightSeat] = useState(null);
  const [miniCatalogFilter, setMiniCatalogFilter] = useState('all');
  const [selectedPickId, setSelectedPickId] = useState(null);
  const [justSelectedPickId, setJustSelectedPickId] = useState(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [isSynopsisClamped, setIsSynopsisClamped] = useState(false);
  const synopsisTextRef = useRef(null);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [declineReasonInput, setDeclineReasonInput] = useState('Não achei disponível para assistir');
  const [decliningPickId, setDecliningPickId] = useState(null);
  const [isBoomerangOpen, setIsBoomerangOpen] = useState(false);
  const [boomerangReasonInput, setBoomerangReasonInput] = useState('Não estou no clima hoje');
  const [boomerangingPickId, setBoomerangingPickId] = useState(null);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [showSampleNorm, setShowSampleNorm] = useState(false);
  const [classPowerWallet, setClassPowerWallet] = useState(null);
  const [equippedClassId, setEquippedClassId] = useState(() => getEquippedClassId());
  const [selectedPowerPickId, setSelectedPowerPickId] = useState('');
  const [actingClassPower, setActingClassPower] = useState(false);
  const [bazaarProfile, setBazaarProfile] = useState(null);
  const [actingBazaarPower, setActingBazaarPower] = useState(false);
  const [revealModalSession, setRevealModalSession] = useState(null);
  const [showLabSpecialPanel, setShowLabSpecialPanel] = useState(false);
  const [showGrimoireModal, setShowGrimoireModal] = useState(false);
  const [showRulesStrip, setShowRulesStrip] = useState(false);
  const [spotlightArtIdx, setSpotlightArtIdx] = useState(0);
  const [grimoireSelectedId, setGrimoireSelectedId] = useState('duas_caras');
  const [grimoireArtIdx, setGrimoireArtIdx] = useState(0);
  const [grimoireRevealAll, setGrimoireRevealAll] = useState(false);
  const [cardBackLayout, setCardBackLayout] = useState(() => {
    try {
      const saved = window.localStorage.getItem('secret_draw_back_layout_v2');
      return saved === 'orb' ? 'orb' : 'top';
    } catch {
      return 'top';
    }
  });
  const fileInputRef = useRef(null);
  const dealTimersRef = useRef([]);
  const ocarinaPendingPromiseRef = useRef(null);

  const handleToggleBackLayout = (nextLayout) => {
    const clean = nextLayout === 'orb' ? 'orb' : 'top';
    setCardBackLayout(clean);
    try {
      window.localStorage.setItem('secret_draw_back_layout_v2', clean);
    } catch {
      // ignore storage errors
    }
  };

  const clearDealTimers = () => {
    dealTimersRef.current.forEach((t) => clearTimeout(t));
    dealTimersRef.current = [];
  };

  useEffect(() => {
    preloadSecretShuffleSound();
    return () => {
      clearDealTimers();
      stopSecretShuffleSound();
    };
  }, []);

  const toggleLabTools = useCallback((forcedNext) => {
    setShowLabTools((prev) => {
      const next = typeof forcedNext === 'boolean' ? forcedNext : !prev;
      try {
        window.localStorage.setItem('secret_draw_show_lab', next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      if (!next) {
        setIsLabTransparent(false);
        setShowAuditDrawer(false);
        setShowSampleNorm(false);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLabTools();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleLabTools]);

  const effectiveLabTransparent = showLabTools && isLabTransparent;

  const loadStatus = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get(`${API_BASE_URL}/secret-draw/status`);
      if (res.data?.success) {
        setStatusData(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao carregar Sessão Secreta.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadClassPowerWallet = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/class-powers/status`);
      if (res.data?.success) {
        setClassPowerWallet(res.data.data);
      }
    } catch {
      // silent fallback
    }
  }, []);

  const loadBazaarProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/guild-bazaar/status`);
      if (res.data?.success && res.data?.data) {
        setBazaarProfile(res.data.data);
      }
    } catch {
      // silent fallback
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadClassPowerWallet();
    loadBazaarProfile();
    const onSync = () => {
      setEquippedClassId(getEquippedClassId());
      loadClassPowerWallet();
    };
    const onProfileSync = (ev) => {
      if (ev?.detail) {
        setBazaarProfile(ev.detail);
      } else {
        loadBazaarProfile();
      }
    };
    window.addEventListener('cine-class-power-sync', onSync);
    window.addEventListener('cine-harlequin-profile-sync', onProfileSync);
    return () => {
      window.removeEventListener('cine-class-power-sync', onSync);
      window.removeEventListener('cine-harlequin-profile-sync', onProfileSync);
    };
  }, [loadStatus, loadClassPowerWallet, loadBazaarProfile]);

  useEffect(() => {
    loadClassPowerWallet();
  }, [statusData?.currentRound?.id, loadClassPowerWallet]);

  useEffect(() => {
    if (statusData && onStatusLoaded) {
      onStatusLoaded(statusData);
    }
  }, [statusData, onStatusLoaded]);

  const triggerDealSequence = useCallback((totalCards) => {
    clearDealTimers();
    setDealingCount(0);
    for (let i = 1; i <= totalCards; i++) {
      const timer = setTimeout(() => {
        setDealingCount(i);
        playCardDealFx(i - 1);
      }, (i - 1) * 145);
      dealTimersRef.current.push(timer);
    }
  }, []);

  const pickAnimForSeat = useCallback(
    () => RANDOM_FAVORITE_ANIMS[Math.floor(Math.random() * RANDOM_FAVORITE_ANIMS.length)],
    []
  );

  const handleDrawCards = async () => {
    clearDealTimers();
    setDrawing(true);
    setShuffleDeepLoading(false);
    setErrorMsg('');
    setInfoBanner('');
    setFlippedSeats({});
    setBurstSeats({});
    setSeatAnimStyles({});
    setSpotlightSeat(null);
    setIsDeclineOpen(false);
    setIsBoomerangOpen(false);
    startSecretShuffleSound();

    const phaseTimer = setTimeout(() => setShuffleDeepLoading(true), 1350);
    const minShuffleWait = new Promise((resolve) => setTimeout(resolve, 1150));
    try {
      const canChoose = Boolean(statusData?.chipsWallet?.canChooseCardCount);
      const requestedCount = canChoose && countMode !== 'random' ? Number(countMode) : null;
      const [res] = await Promise.all([
        axios.post(`${API_BASE_URL}/secret-draw/draw`, { requestedCount, sagaRule }),
        minShuffleWait,
      ]);
      if (res.data?.success) {
        stopSecretShuffleSound();
        await loadStatus(true);
        if (res.data.bazaarStatus) {
          setBazaarProfile(res.data.bazaarStatus);
          dispatchHarlequinProfileSync(res.data.bazaarStatus);
        }
        const cardsLen = res.data?.data?.round?.cards?.length || 3;
        triggerDealSequence(cardsLen);
        dispatchHarlequinWorldEvent('secret_draw', { cardsCount: cardsLen });
        setInfoBanner(
          `🍀 Foi sorteado ${cardsLen} carta${cardsLen === 1 ? '' : 's'} — boa sorte! (${canChoose ? 'Escolha liberada neste ciclo' : '1ª Ficha aleatória'})`
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao sortear cartas.');
    } finally {
      clearTimeout(phaseTimer);
      stopSecretShuffleSound();
      setShuffleDeepLoading(false);
      setDrawing(false);
    }
  };

  const handlePreviewShuffleOnly = async () => {
    if (drawing || previewShuffling || acting) return;
    clearDealTimers();
    setPreviewShuffling(true);
    startSecretShuffleSound();
    try {
      await new Promise((r) => setTimeout(r, 1750));
    } finally {
      stopSecretShuffleSound();
      setPreviewShuffling(false);
    }
    const len = statusData?.currentRound?.cards?.length || 5;
    triggerDealSequence(len);
  };

  const revealCardWithBurst = useCallback(
    (card) => {
      if (!card) return 'classic';
      const seat = card.seat;
      const animToUse = pickAnimForSeat();
      setSeatAnimStyles((prev) => ({ ...prev, [seat]: animToUse }));
      setFlippedSeats((prev) => ({ ...prev, [seat]: true }));
      setSpotlightSeat(seat);
      setBurstSeats((prev) => ({ ...prev, [seat]: (prev[seat] || 0) + 1 }));
      playCardFlipFx(card.difficulty, animToUse);
      return animToUse;
    },
    [pickAnimForSeat]
  );

  const handleReplaySeatAnim = (card) => {
    if (!card) return;
    const seat = card.seat;
    // Se já estava virada, desvira rapidamente e dispara o flip + efeito do zero!
    setFlippedSeats((prev) => ({ ...prev, [seat]: false }));
    setBurstSeats((prev) => ({ ...prev, [seat]: 0 }));
    setTimeout(() => {
      revealCardWithBurst(card);
    }, 65);
  };

  const runOcarinaTableShuffle = useCallback(
    async (cardsCount = 5, reshuffled = []) => {
      clearDealTimers();
      setOcarinaShuffling(true);
      setPreviewShuffling(true);
      startSecretShuffleSound();
      if (reshuffled.length > 0) {
        setFlippedSeats((prev) => {
          const next = { ...prev };
          reshuffled.forEach((s) => {
            delete next[s];
          });
          return next;
        });
        setBurstSeats((prev) => {
          const next = { ...prev };
          reshuffled.forEach((s) => {
            delete next[s];
          });
          return next;
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 1450));
      stopSecretShuffleSound();
      setPreviewShuffling(false);
      setOcarinaShuffling(false);
      triggerDealSequence(cardsCount);
    },
    [triggerDealSequence]
  );

  const handleRevealModalClose = useCallback(
    async (closedSession) => {
      setRevealModalSession(null);
      const isOcarina = closedSession?.outcome?.specialEvent?.id === 'ocarina_floresta';
      if (!isOcarina) return;

      let finalOutcome = closedSession?.outcome;
      let latestRoundCardsCount =
        statusData?.currentRound?.cards?.length || finalOutcome?.reshuffledSeats?.length || 5;

      if (ocarinaPendingPromiseRef.current) {
        setOcarinaShuffling(true);
        setPreviewShuffling(true);
        startSecretShuffleSound();
        const startedAt = Date.now();
        try {
          const resolvedData = await ocarinaPendingPromiseRef.current;
          if (resolvedData?.outcome) finalOutcome = resolvedData.outcome;
          if (resolvedData?.data?.currentRound?.cards?.length) {
            latestRoundCardsCount = resolvedData.data.currentRound.cards.length;
          }
        } catch {
          // ignore if error already set
        }
        const elapsed = Date.now() - startedAt;
        if (elapsed < 1200) {
          await new Promise((resolve) => setTimeout(resolve, 1200 - elapsed));
        }
        stopSecretShuffleSound();
        setPreviewShuffling(false);
        setOcarinaShuffling(false);
        const resSeats = finalOutcome?.reshuffledSeats || [];
        if (resSeats.length > 0) {
          setFlippedSeats((prev) => {
            const next = { ...prev };
            resSeats.forEach((s) => {
              delete next[s];
            });
            return next;
          });
          setBurstSeats((prev) => {
            const next = { ...prev };
            resSeats.forEach((s) => {
              delete next[s];
            });
            return next;
          });
          triggerDealSequence(latestRoundCardsCount);
        }
        return;
      }

      const reshuffled = finalOutcome?.reshuffledSeats;
      if (Array.isArray(reshuffled) && reshuffled.length > 0) {
        runOcarinaTableShuffle(latestRoundCardsCount, reshuffled);
      }
    },
    [runOcarinaTableShuffle, statusData?.currentRound?.cards?.length, triggerDealSequence]
  );

  const applySpecialOutcomeSideEffects = useCallback(
    (payloadData, outcome, sourceCard = null) => {
      setStatusData(payloadData);
      const spId = outcome?.specialEvent?.id;
      const chId = outcome?.chainedOutcome?.specialEvent?.id;
      if (spId === 'recarga_classe' || chId === 'recarga_classe') {
        loadClassPowerWallet();
        dispatchClassPowerSync();
      }

      const sessionKey = Date.now();
      const pendingMeta = outcome?.specialEvent?.outcomeData;

      if (pendingMeta?.pendingOcarina) {
        const bgPromise = axios
          .post(`${API_BASE_URL}/secret-draw/ocarina-reshuffle`, {
            roundId: pendingMeta.roundId || payloadData?.currentRound?.id || null,
            triggerSeat: pendingMeta.triggerSeat || null,
            createLabIfEmpty: Boolean(pendingMeta.createLabIfEmpty),
          })
          .then((oRes) => {
            if (oRes.data?.success) {
              setStatusData(oRes.data.data);
              setInfoBanner(
                oRes.data.outcome?.specialEvent?.resultSummary ||
                  '⏳ Ocarina da Floresta reembaralhou a mesa!'
              );
              setRevealModalSession((prev) =>
                prev && prev.key === sessionKey
                  ? {
                      ...prev,
                      roundId: oRes.data.data?.currentRound?.id || prev.roundId,
                      outcome: oRes.data.outcome,
                    }
                  : prev
              );
              return oRes.data;
            }
            return null;
          })
          .catch((oErr) => {
            setErrorMsg(
              oErr?.response?.data?.error || oErr?.message || 'Erro ao executar Ocarina da Floresta.'
            );
            return null;
          })
          .finally(() => {
            if (ocarinaPendingPromiseRef.current === bgPromise) {
              ocarinaPendingPromiseRef.current = null;
            }
          });
        ocarinaPendingPromiseRef.current = bgPromise;
      } else {
        const reshuffled = Array.isArray(outcome?.reshuffledSeats) ? outcome.reshuffledSeats : [];
        if (reshuffled.length > 0 && outcome?.specialEvent?.id !== 'ocarina_floresta') {
          setFlippedSeats((prev) => {
            const next = { ...prev };
            reshuffled.forEach((s) => {
              delete next[s];
            });
            return next;
          });
          setBurstSeats((prev) => {
            const next = { ...prev };
            reshuffled.forEach((s) => {
              delete next[s];
            });
            return next;
          });
          triggerDealSequence(payloadData?.currentRound?.cards?.length || 5);
        }
      }

      if (outcome?.pulledMoviePick?.id) {
        setJustSelectedPickId(outcome.pulledMoviePick.id);
        setSelectedPickId(outcome.pulledMoviePick.id);
      }

      setRevealModalSession({
        mode: 'special',
        key: sessionKey,
        roundId: payloadData?.currentRound?.id || null,
        card: outcome?.card || sourceCard || null,
        outcome,
      });
    },
    [loadClassPowerWallet, triggerDealSequence]
  );

  const handleAcceptMysteryCard = async (roundId, card) => {
    if (!card || acting) return;
    const pickedSeats = statusData?.currentRoundPickedSeats || [];
    const isAlreadyPicked = pickedSeats.includes(Number(card.seat));
    if (card.specialEvent?.triggered) {
      setSpotlightSeat(card.seat);
      setRevealModalSession({
        mode: 'special',
        key: Date.now(),
        roundId,
        card,
        outcome: { kind: 'special', specialEvent: card.specialEvent, card },
      });
      return;
    }
    if (isAlreadyPicked) {
      setSpotlightSeat(card.seat);
      setRevealModalSession({
        mode: 'movie',
        key: Date.now(),
        roundId,
        card,
      });
      setInfoBanner(`Carta #${card.seat} (${card.resolved?.title}) já está na sua fila para assistir!`);
      return;
    }

    setActing(true);
    setFlippingSeat(card.seat);
    setErrorMsg('');

    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/choose`, {
        roundId,
        seat: card.seat,
      });
      if (!res.data?.success) {
        setErrorMsg(res.data?.error || 'Não foi possível revelar esta carta agora.');
        return;
      }
      if (res.data?.success) {
        if (res.data.kind === 'special') {
          const outcome = res.data.outcome;
          const isQueueBlocked = Boolean(outcome?.specialEvent?.outcomeData?.queueFull);
          setSpotlightSeat(card.seat);
          if (!isQueueBlocked) {
            setFlippedSeats((prev) => ({ ...prev, [card.seat]: true }));
          }
          if (res.data.xpStatus && onXpStatusChange) {
            onXpStatusChange(res.data.xpStatus);
          }
          if (res.data.xpGain && res.data.xpStatus) {
            triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
            window.dispatchEvent(new CustomEvent('cine-secret-draw-sync'));
            window.dispatchEvent(new CustomEvent('cine-bingo-sync'));
          }
          if (res.data.bazaarStatus) {
            dispatchHarlequinProfileSync(res.data.bazaarStatus);
          }
          setIsDeclineOpen(false);
          setIsBoomerangOpen(false);
          setInfoBanner(
            outcome?.specialEvent?.resultSummary ||
              `🔥 Carta Especial revelada: ${outcome?.specialEvent?.title || ''}!`
          );
          applySpecialOutcomeSideEffects(res.data.data, outcome, card);
        } else {
          // Vira a carta silenciosamente na mesa; o modal toca o som simples uma única vez
          const animToUse = seatAnimStyles[card.seat] || pickAnimForSeat();
          setSeatAnimStyles((prev) => ({ ...prev, [card.seat]: animToUse }));
          setFlippedSeats((prev) => ({ ...prev, [card.seat]: true }));
          setSpotlightSeat(card.seat);
          setBurstSeats((prev) => ({ ...prev, [card.seat]: (prev[card.seat] || 0) + 1 }));
          setStatusData(res.data.data);
          const createdPick = (res.data?.data?.miniCatalog || []).find(
            (p) => Number(p.roundId) === Number(roundId) && Number(p.seat) === Number(card.seat)
          );
          if (createdPick) {
            setJustSelectedPickId(createdPick.id);
            setSelectedPickId(createdPick.id);
          }
          setIsDeclineOpen(false);
          setIsBoomerangOpen(false);
          const resolvedCard = res.data?.outcome?.card || createdPick?.card || card;
          const rw = getSecretRewardMeta(resolvedCard);
          setInfoBanner(
            `🔒 "${resolvedCard.resolved?.title}" (${resolvedCard.difficultyLabel} • ${rw.short}) foi direto para a sua fila!`
          );
          setRevealModalSession({
            mode: 'movie',
            key: Date.now(),
            roundId,
            card: resolvedCard,
            pick: createdPick || null,
          });
        }
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao revelar carta da mesa.');
    } finally {
      setActing(false);
      setFlippingSeat(null);
    }
  };

  const handleLabTriggerSpecial = async (specialId, variantIndex = null) => {
    if (!specialId || acting) return;
    setActing(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/lab/trigger-special`, {
        specialId,
        variantIndex,
      });
      if (res.data?.success) {
        const outcome = res.data.outcome;
        if (res.data.xpStatus && onXpStatusChange) {
          onXpStatusChange(res.data.xpStatus);
        }
        if (res.data.xpGain && res.data.xpStatus) {
          triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
          window.dispatchEvent(new CustomEvent('cine-secret-draw-sync'));
          window.dispatchEvent(new CustomEvent('cine-bingo-sync'));
        }
        if (res.data.bazaarStatus) {
          dispatchHarlequinProfileSync(res.data.bazaarStatus);
        }
        setInfoBanner(
          outcome?.specialEvent?.resultSummary ||
            `🧪 Lab: Carta Especial "${outcome?.specialEvent?.title}" ativada!`
        );
        applySpecialOutcomeSideEffects(res.data.data, outcome);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao testar Carta Especial no Lab.');
    } finally {
      setActing(false);
    }
  };

  const handleCardClick = (card) => {
    if (!card || card.removedByCurse) return;
    if (currentRound?.status === 'revealed') {
      handleAcceptMysteryCard(currentRound.id, card);
    }
  };

  const handleGrantLabChip = async (chipType = 'draw') => {
    if (acting) return;
    setActing(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/lab/grant-chip`, { amount: 1, type: chipType });
      if (res.data?.success) {
        setStatusData(res.data.data);
        setInfoBanner(
          chipType === 'boomerang'
            ? '🪃 +1 Ficha Bumerangue adicionada no Lab!'
            : '🎟️ +1 ficha de sorteio adicionada no Lab!'
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao adicionar ficha Lab.');
    } finally {
      setActing(false);
    }
  };

  const handleUseSecretBazaarPower = async (action, pickId = null) => {
    if (acting || actingBazaarPower) return;
    setActingBazaarPower(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/bazaar-power`, { action, pickId });
      if (res.data?.success) {
        if (res.data.data) setStatusData(res.data.data);
        if (res.data.bazaarStatus) {
          setBazaarProfile(res.data.bazaarStatus);
          dispatchHarlequinProfileSync(res.data.bazaarStatus);
        }
        setInfoBanner(res.data.message || '⚡ Poder do Bazar ativado!');
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error || err?.message || 'Erro ao usar Poder do Bazar na Sessão Secreta.'
      );
    } finally {
      setActingBazaarPower(false);
    }
  };

  const handleFinishSelection = async (roundId) => {
    if (!roundId || acting) return;
    setActing(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/finish-round`, { roundId });
      if (res.data?.success) {
        const pickedCount = Number(res.data?.result?.pickedCount || 0);
        const insuranceRefunded = Boolean(res.data?.result?.insuranceRefunded);
        setStatusData(res.data.data);
        if (res.data.bazaarStatus) {
          setBazaarProfile(res.data.bazaarStatus);
          dispatchHarlequinProfileSync(res.data.bazaarStatus);
        }
        setFlippedSeats({});
        setBurstSeats({});
        setSeatAnimStyles({});
        setSpotlightSeat(null);
        setInfoBanner(
          pickedCount > 0
            ? `Escolha finalizada com ${pickedCount} filme(s) adicionado(s) à sua fila abaixo! Cartas não escolhidas voltaram ao baralho.`
            : insuranceRefunded
              ? '🛡️ Seguro da Casa ativado! Mão pulada sem seleções — sua Ficha de Sorteio foi reembolsada na hora!'
              : 'Mão encerrada sem seleções — todas as cartas retornaram para o baralho!'
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao finalizar escolha.');
    } finally {
      setActing(false);
    }
  };

  const handleConfirmDeclinePick = async (pickId) => {
    if (!pickId) return;
    setActing(true);
    setErrorMsg('');
    setDecliningPickId(pickId);
    playCardDeclineFx();

    await new Promise((r) => setTimeout(r, 950));

    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/decline`, {
        pickId,
        reason: declineReasonInput.trim() || 'Não encontrado para assistir',
      });
      if (res.data?.success) {
        setStatusData(res.data.data);
        setIsDeclineOpen(false);
        setIsBoomerangOpen(false);
        setSelectedPickId(pickId);
        setInfoBanner('Carta descartada no vórtice! Uma vaga na sua fila de 10 filmes foi liberada.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao declinar carta.');
    } finally {
      setDecliningPickId(null);
      setActing(false);
    }
  };

  const handleConfirmBoomerangPick = async (pickId) => {
    if (!pickId || acting) return;
    setActing(true);
    setErrorMsg('');
    setBoomerangingPickId(pickId);
    playCardBoomerangFx();

    await new Promise((r) => setTimeout(r, 950));

    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/boomerang`, {
        pickId,
        reason: boomerangReasonInput.trim() || 'Não quero ver agora — volta para o baralho',
      });
      if (res.data?.success) {
        setStatusData(res.data.data);
        setIsBoomerangOpen(false);
        setIsDeclineOpen(false);
        setSelectedPickId(pickId);
        dispatchHarlequinWorldEvent('secret_boomerang', {});
        setInfoBanner(
          '🪃 Passe Bumerangue lançado! O filme saiu da sua fila (vaga liberada) e voltou ao baralho para poder ser sorteado de novo.'
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao usar Ficha Bumerangue.');
    } finally {
      setBoomerangingPickId(null);
      setActing(false);
    }
  };

  const handleClaimPick = async (pickId) => {
    if (!pickId || acting) return;
    setActing(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/claim`, { pickId });
      if (res.data?.success) {
        setStatusData(res.data.data);
        if (res.data.xpStatus && onXpStatusChange) {
          onXpStatusChange(res.data.xpStatus);
        }
        if (res.data.xpGain && res.data.xpStatus) {
          triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
        }
        if (res.data.bazaarStatus) {
          dispatchHarlequinProfileSync(res.data.bazaarStatus);
        }
        window.dispatchEvent(new CustomEvent('cine-secret-draw-sync'));
        window.dispatchEvent(new CustomEvent('cine-bingo-sync'));
        const claimedGold = Number(res.data?.claimed?.goldAwarded || 0);
        const claimedXp = Number(res.data?.claimed?.xpAwarded || res.data?.claimed?.xpReward || 0);
        setInfoBanner(
          claimedGold > 0
            ? `🪙 +${claimedGold} Moedas de Ouro depositadas direto no Bazar do Arlequim! Vaga liberada na sua fila.`
            : `✨ XP da Sessão Secreta colhido (+${claimedXp} XP)! Vaga liberada na sua fila.`
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao colher XP da carta.');
    } finally {
      setActing(false);
    }
  };

  const handleLabCompletePick = async (pickId) => {
    setActing(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/lab/complete`, { pickId });
      if (res.data?.success) {
        setStatusData(res.data.data);
        window.dispatchEvent(new CustomEvent('cine-secret-draw-sync'));
        setInfoBanner(
          '✨ Carta concluída no Lab! Agora clique em "Colher XP" para resgatar os pontos na Guilda.'
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao simular conclusão.');
    } finally {
      setActing(false);
    }
  };

  const handleLabReset = async () => {
    if (!window.confirm('Resetar todos os sorteios, históricos e XPs de teste da Sessão Secreta Lab?')) {
      return;
    }
    setActing(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/lab/reset`);
      if (res.data?.success) {
        setStatusData(res.data.data);
        setFlippedSeats({});
        setBurstSeats({});
        setSeatAnimStyles({});
        setSpotlightSeat(null);
        setSelectedPickId(null);
        setJustSelectedPickId(null);
        setIsDeclineOpen(false);
        setIsBoomerangOpen(false);
        setCountMode('10');
        if (res.data.xpStatus && onXpStatusChange) {
          onXpStatusChange(res.data.xpStatus);
        }
        setInfoBanner('Lab resetado com sucesso! Baralho pronto para novos testes limpos.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao resetar Lab.');
    } finally {
      setActing(false);
    }
  };

  const handleSyncSheet = async (file = null) => {
    setSyncingSheet(true);
    setErrorMsg('');
    try {
      let res;
      if (file) {
        const fd = new FormData();
        fd.append('sheet_file', file);
        res = await axios.post(`${API_BASE_URL}/secret-draw/sync-sheet`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axios.post(`${API_BASE_URL}/secret-draw/sync-sheet`);
      }
      if (res.data?.success) {
        setStatusData(res.data.data);
        setInfoBanner(
          file
            ? `Planilha "${file.name}" sincronizada no baralho!`
            : 'Planilha sorteio.xlsx re-sincronizada com seu catálogo atual!'
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao sincronizar planilha.');
    } finally {
      setSyncingSheet(false);
    }
  };

  const pool = statusData?.poolSummary || {};
  const deckStats = statusData?.deckStats || {};
  const xpSummary = statusData?.xpSummary || {};
  const chipsWallet = statusData?.chipsWallet || {
    weekKey: '',
    weeklyAllowance: 3,
    chipsRemaining: 3,
    chipsUsedThisWeek: 0,
    maxChipsBank: 5,
    cycleDays: 15,
    boomerangAllowance: 2,
    boomerangChipsRemaining: 2,
    boomerangUsedThisWeek: 0,
    maxBoomerangBank: 4,
    nextResetLabel: 'Dias 1 e 15 do mês (Brasília)',
  };
  const chipsRemaining = Number(chipsWallet.chipsRemaining ?? 0);
  const chipsAllowance = Number(chipsWallet.weeklyAllowance ?? 3);
  const maxChipsBank = Number(chipsWallet.maxChipsBank ?? 5);
  const boomerangChipsRemaining = Number(chipsWallet.boomerangChipsRemaining ?? 2);
  const boomerangAllowance = Number(chipsWallet.boomerangAllowance ?? 2);
  const maxBoomerangBank = Number(chipsWallet.maxBoomerangBank ?? 4);
  const canChooseCardCount = Boolean(chipsWallet.canChooseCardCount);
  const activeWatchLimit = Number(statusData?.activeWatchLimit || 10);
  const activeWatchCount = Number(statusData?.activeWatchCount || 0);
  const currentRound = statusData?.currentRound || null;
  const recentHistory = statusData?.recentHistory || [];
  const currentRoundPickedSeats = Array.isArray(statusData?.currentRoundPickedSeats)
    ? statusData.currentRoundPickedSeats.map((s) => Number(s))
    : [];

  const miniCatalogEntries = Array.isArray(statusData?.miniCatalog) ? statusData.miniCatalog : [];
  const activeQueuePicks = miniCatalogEntries.filter((entry) => entry.status === 'active');
  const readyToClaimPicks = miniCatalogEntries.filter((entry) => entry.status === 'ready_to_claim');
  const hasQueuedOrPendingSecretMovies =
    activeWatchCount > 0 || activeQueuePicks.length > 0 || readyToClaimPicks.length > 0;
  const isDeckClosedOutOfChips =
    !drawing &&
    !previewShuffling &&
    !currentRound &&
    chipsRemaining <= 0;
  const nextSecretCountdownLabel = isDeckClosedOutOfChips ? getCycle15CountdownLabel() : null;

  const filteredMiniCatalog =
    miniCatalogFilter === 'all'
      ? miniCatalogEntries
      : miniCatalogEntries.filter((entry) => entry.status === miniCatalogFilter);

  const focusedPick =
    miniCatalogEntries.find((entry) => Number(entry.id) === Number(selectedPickId)) ||
    readyToClaimPicks[0] ||
    miniCatalogEntries.find((entry) => entry.status === 'active') ||
    miniCatalogEntries[0] ||
    null;

  const focusedSynopsisText = focusedPick?.card?.resolved?.synopsis || '';
  const focusedPickKey = focusedPick?.id || null;

  useEffect(() => {
    if (synopsisExpanded) return;
    const el = synopsisTextRef.current;
    if (!el || !focusedSynopsisText) {
      setIsSynopsisClamped(false);
      return;
    }
    const measureClamp = () => {
      if (synopsisTextRef.current) {
        setIsSynopsisClamped(
          synopsisTextRef.current.scrollHeight > synopsisTextRef.current.clientHeight + 2
        );
      }
    };
    const raf = window.requestAnimationFrame(measureClamp);
    window.addEventListener('resize', measureClamp);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', measureClamp);
    };
  }, [focusedPickKey, focusedSynopsisText, synopsisExpanded]);

  const activePowerClass =
    ALL_CINEMA_CLASSES.find((c) => c.id === equippedClassId) || ALL_CINEMA_CLASSES[0];
  const activePowerSpec = getClassPowers(activePowerClass?.id)?.powers?.secret_draw;
  const activePowerTier =
    POWER_TIER_META[activePowerSpec?.tier] || POWER_TIER_META.support;
  const secretPowerCharges = Number(classPowerWallet?.secretCharges ?? 0);
  const maxSecretPowerCharges = Number(classPowerWallet?.maxSecretCharges ?? 2);
  const secretBuffArmed = classPowerWallet?.secretBuff || null;

  const isPickEligibleForSecretPower = useCallback(
    (pick) => {
      if (!pick || pick.status !== 'active') return false;
      if (activePowerClass?.id === 'paladino_oscar') {
        const diff = pick.difficulty || pick.card?.difficulty;
        return diff !== 'exotic';
      }
      return true;
    },
    [activePowerClass?.id]
  );

  const eligiblePowerQueuePicks = activeQueuePicks.filter(isPickEligibleForSecretPower);

  const formatQueuePickLabel = (pick) => {
    if (!pick) return '';
    const title =
      pick.card?.resolved?.title ||
      pick.card?.planilha?.cleanedTitle ||
      pick.card?.planilha?.rawTitle ||
      'Filme Secreto';
    const yr = pick.card?.resolved?.releaseYear ? ` (${pick.card.resolved.releaseYear})` : '';
    const suitIcon = SUIT_META[pick.difficulty || pick.card?.difficulty]?.suit || '🃏';
    const rw = getSecretRewardMeta(pick);
    return `${suitIcon} ${title}${yr} • ${rw.short} (Carta #${pick.seat})`;
  };

  useEffect(() => {
    const isActionPickCard = activePowerSpec?.actionType === 'pick_card';
    const firstEligibleId =
      focusedPick && isPickEligibleForSecretPower(focusedPick)
        ? String(focusedPick.id)
        : eligiblePowerQueuePicks[0]?.id
          ? String(eligiblePowerQueuePicks[0].id)
          : '';

    const curValid =
      selectedPowerPickId &&
      eligiblePowerQueuePicks.some((p) => String(p.id) === String(selectedPowerPickId));

    if (isActionPickCard) {
      if (!curValid && selectedPowerPickId !== firstEligibleId) {
        setSelectedPowerPickId(firstEligibleId);
      }
    } else if (selectedPowerPickId && !curValid) {
      setSelectedPowerPickId('');
    }
  }, [
    activePowerSpec?.actionType,
    eligiblePowerQueuePicks,
    focusedPick,
    isPickEligibleForSecretPower,
    selectedPowerPickId,
  ]);

  const handleActivateSecretClassPower = async (overridePickId) => {
    if (!activePowerClass || actingClassPower || acting) return;
    const explicitPickId =
      typeof overridePickId === 'number' || typeof overridePickId === 'string'
        ? Number(overridePickId)
        : selectedPowerPickId
          ? Number(selectedPowerPickId)
          : undefined;

    if (activePowerSpec?.actionType === 'pick_card' && !explicitPickId) {
      setErrorMsg('Escolha uma carta elegível ativa na fila para usar este poder.');
      return;
    }

    setActingClassPower(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/class-power`, {
        classId: activePowerClass.id,
        pickId: explicitPickId,
      });
      if (res.data?.success && res.data?.data) {
        const payload = res.data.data;
        if (payload.data) setStatusData(payload.data);
        if (payload.classWallet) setClassPowerWallet(payload.classWallet);
        setInfoBanner(payload.message || 'Poder da classe ativado na Sessão Secreta!');
        dispatchClassPowerSync();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao ativar poder da classe.');
    } finally {
      setActingClassPower(false);
    }
  };

  const handleGrantLabClassPower = async () => {
    if (actingClassPower || acting) return;
    setActingClassPower(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/class-powers/lab/grant`, {
        mode: 'secret_draw',
      });
      if (res.data?.success && res.data?.data) {
        setClassPowerWallet(res.data.data);
        setInfoBanner('⚡ +1 Carga de Poder da Classe (Sessão Secreta) adicionada no Lab!');
        dispatchClassPowerSync();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao conceder carga de classe.');
    } finally {
      setActingClassPower(false);
    }
  };

  const spotlightCard =
    currentRound?.status === 'revealed' && spotlightSeat != null && (effectiveLabTransparent || flippedSeats[spotlightSeat])
      ? (currentRound.cards || []).find((c) => Number(c.seat) === Number(spotlightSeat)) || null
      : null;

  useEffect(() => {
    setSpotlightArtIdx(0);
  }, [spotlightSeat, currentRound?.id]);

  const specialCatalogList =
    Array.isArray(statusData?.specialCardsCatalog) && statusData.specialCardsCatalog.length > 0
      ? statusData.specialCardsCatalog
      : FALLBACK_SPECIAL_CARDS_CATALOG;

  const specialCountsById = statusData?.specialCardStats?.countsById || {};
  const totalSpecialTriggered = Number(statusData?.specialCardStats?.totalTriggered || 0);

  const discoveredSpecialIds = React.useMemo(() => {
    const found = new Set();
    Object.entries(statusData?.specialCardStats?.countsById || {}).forEach(([id, count]) => {
      if (Number(count || 0) > 0) found.add(id);
    });
    const scanCards = (cards) => {
      if (!Array.isArray(cards)) return;
      cards.forEach((c) => {
        if (c?.specialEvent?.id && c.specialEvent.triggered) {
          found.add(c.specialEvent.id);
        }
      });
    };
    scanCards(statusData?.currentRound?.cards);
    (statusData?.recentHistory || []).forEach((r) => scanCards(r?.cards));
    (Array.isArray(statusData?.miniCatalog) ? statusData.miniCatalog : []).forEach((p) => {
      if (p?.card?.specialEvent?.id) found.add(p.card.specialEvent.id);
    });
    return found;
  }, [statusData]);

  const triggeredSpecialOnTable = (currentRound?.cards || []).find((c) => c?.specialEvent?.triggered)?.specialEvent || null;
  const harlequinDealerAvatar = HARLEQUIN_CROUPIER_AVATAR;
  const harlequinAvatarFrameClass =
    triggeredSpecialOnTable?.rarity === 'cursed'
      ? 'border-rose-500/65 shadow-[0_10px_28px_rgba(244,63,94,0.3)] hover:border-rose-400'
      : triggeredSpecialOnTable
        ? 'border-emerald-400/60 shadow-[0_10px_28px_rgba(16,185,129,0.28)] hover:border-emerald-300'
        : 'border-amber-400/45 shadow-[0_10px_28px_rgba(0,0,0,0.8)] hover:border-amber-300';

  const harlequinDealerLine = isDeckClosedOutOfChips
    ? hasQueuedOrPendingSecretMovies
      ? 'A banca fechou por agora e o baralho foi trancado — encare os filmes já puxados até a próxima recarga.'
      : 'Você viu todos os filmes que eu sorteei — parabéns! Espero que tenha gostado… ou não. Agora o baralho descansa até o próximo depósito.'
    : activeWatchCount >= activeWatchLimit
      ? 'Sua fila atingiu o limite. Resolva um filme pendente antes de pedir novas cartas.'
      : triggeredSpecialOnTable
        ? 'O Arlequim te deu uma carta especial — agora é só saber se é bênção ou maldição.'
        : currentRound?.status === 'revealed'
          ? 'As cartas estão sobre o feltro. Escolha com calma — bênçãos e maldições dividem a mesma mesa.'
          : 'O Arlequim embaralhou um monte de filmes que ele gosta de assistir — talvez você deteste, talvez ele force você a ver algum deles. No baralho, tudo depende só da vontade dele.';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Preparando a Mesa do Arlequim...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* HERO & CONTROLES SUPERIORES */}
      <section className="relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.65)] border-amber-400/25 bg-gradient-to-br from-[#09090d] via-[#131018] to-[#080a0c]">
        <div className="pointer-events-none absolute -top-24 -right-20 w-96 h-96 rounded-full blur-3xl bg-amber-500/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 rounded-full blur-3xl bg-emerald-500/8" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              {/* Retrato / Medalhão do Croupier Arlequim */}
              <button
                type="button"
                onClick={() => setShowGrimoireModal(true)}
                title="Abrir Grimório & História do Arlequim"
                className={`group relative w-24 h-28 sm:w-[118px] sm:h-[138px] rounded-2xl border bg-[#090c0b] overflow-hidden shrink-0 cursor-pointer transition ${harlequinAvatarFrameClass}`}
              >
                <img
                  src={getSecretCardUrl(harlequinDealerAvatar)}
                  alt="O Arlequim"
                  className="w-full h-full object-cover object-[47%_16%] scale-[1.45] origin-[47%_16%] group-hover:scale-[1.52] transition-transform duration-300"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 py-0.5 bg-gradient-to-t from-black/95 via-black/50 to-transparent text-center text-[8.5px] font-black uppercase tracking-widest text-amber-200">
                  Croupier
                </div>
              </button>

                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {showLabTools ? (
                        <button
                          type="button"
                          onClick={() => toggleLabTools(false)}
                          title="Clique para ocultar ferramentas do Lab (Atalho: Alt+L)"
                          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/45 text-amber-200 flex items-center gap-1 cursor-pointer"
                        >
                          <FlaskConical className="w-3 h-3" /> Modo Lab • Ocultar
                        </button>
                      ) : (
                        <span
                          onDoubleClick={() => toggleLabTools(true)}
                          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-zinc-900/95 border border-amber-400/30 text-amber-200/90 flex items-center gap-1.5 select-none"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Sala Particular • Sessão Secreta
                        </span>
                      )}

                      {currentRound?.status === 'revealed' && Array.isArray(currentRound.cards) && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/35 text-emerald-200">
                          Mesa Ativa • {currentRound.cards.length} Cartas
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Sessão Secreta
                      </h1>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-amber-300/85">
                        A Mesa do Arlequim
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm italic text-zinc-300/95 border-l-2 border-amber-400/50 pl-3 max-w-2xl">
                      “{harlequinDealerLine}”
                    </p>

                    {/* HUD Compacta e Sóbria */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span
                        className={`text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          chipsRemaining > 0
                            ? 'bg-zinc-900/90 border-amber-400/35 text-amber-200'
                            : 'bg-rose-950/50 border-rose-500/45 text-rose-200'
                        }`}
                        title={`Fichas de Sorteio (${chipsAllowance} nos dias 1 e 15 do mês, máx. ${maxChipsBank}) • Recarrega: ${chipsWallet.nextResetLabel}`}
                      >
                        <span>🎟️ Fichas {chipsRemaining}/{maxChipsBank}</span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: maxChipsBank }).map((_, idx) => (
                            <span
                              key={idx}
                              className={`inline-block w-1.5 h-1.5 rounded-full ${
                                idx < chipsRemaining ? 'bg-amber-300' : 'bg-zinc-700'
                              }`}
                            />
                          ))}
                        </span>
                      </span>

                      <span
                        className={`text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          boomerangChipsRemaining > 0
                            ? 'bg-zinc-900/90 border-sky-400/30 text-sky-200'
                            : 'bg-zinc-900/70 border-zinc-800 text-zinc-500'
                        }`}
                        title={`Fichas Bumerangue (${boomerangAllowance} nos dias 1 e 15 do mês, máx. ${maxBoomerangBank})`}
                      >
                        🪃 Bumerangue {boomerangChipsRemaining}/{maxBoomerangBank}
                      </span>

                      <span className="text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300">
                        🃏 {pool.availableCount || 0} no baralho
                      </span>

                      <span className="text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-amber-500/25 text-amber-200">
                        +{Number(xpSummary.totalXp || 0).toLocaleString('pt-BR')} XP
                      </span>

                      <span
                        className={`text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          activeWatchCount >= activeWatchLimit
                            ? 'bg-rose-950/60 border-rose-400/45 text-rose-200'
                            : 'bg-zinc-900/90 border-emerald-500/30 text-emerald-200'
                        }`}
                      >
                        🎯 Fila {activeWatchCount}/{activeWatchLimit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações Principais Noir */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={drawing || previewShuffling || acting || activeWatchCount >= activeWatchLimit || chipsRemaining <= 0}
                    onClick={handleDrawCards}
                    title={
                      activeWatchCount >= activeWatchLimit
                        ? `Fila cheia (${activeWatchCount}/${activeWatchLimit}). Conclua ou decline um filme abaixo para sortear novamente.`
                        : chipsRemaining <= 0
                          ? `Suas fichas acabaram! Recarrega ${chipsWallet.nextResetLabel}.`
                          : `Gasta 1 ficha (${chipsRemaining} restante${chipsRemaining === 1 ? '' : 's'}) e sorteia de 3 a 10 cartas`
                    }
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 shadow-[0_10px_28px_rgba(245,158,11,0.28)] transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    {drawing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4" />}
                    {drawing
                      ? 'Embaralhando...'
                      : isDeckClosedOutOfChips
                        ? `🔒 Recarrega ${chipsWallet.nextResetLabel}`
                        : canChooseCardCount && countMode !== 'random'
                          ? `Sortear ${countMode} Cartas`
                          : 'Sortear Cartas (3–10)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGrimoireModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-zinc-900/95 hover:bg-zinc-800 border border-amber-400/35 text-amber-200 transition cursor-pointer"
                    title="Ver coleção de cartas especiais e a história do Arlequim"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Grimório ({discoveredSpecialIds.size}/{specialCatalogList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRulesStrip((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                      showRulesStrip
                        ? 'bg-zinc-800 border-white/25 text-white'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                    }`}
                    title="Mostrar ou ocultar regras, naipes, planilha, qtd. de cartas e sagas"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Regras</span>
                  </button>

                  {showLabTools && (
                    <button
                      type="button"
                      onClick={() => setIsLabTransparent((v) => !v)}
                      className={`flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        isLabTransparent
                          ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/25'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                      title="Em modo Cego (padrão), as cartas e marcos ficam 100% secretos até virar. Ative o Raio-X Lab para espiar tudo."
                    >
                      {isLabTransparent ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {isLabTransparent ? 'Raio-X Lab: Aberto' : 'Espiar Tudo (Lab)'}
                    </button>
                  )}
                </div>
              </div>

              {showRulesStrip && (
                <div className="rounded-2xl border border-amber-400/25 bg-black/45 p-3.5 sm:p-4 flex flex-col gap-3">
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    As fichas são depositadas no <strong className="text-amber-300">dia 1º e no dia 15 de cada mês</strong> ({chipsAllowance} fichas por depósito, acumula até {maxChipsBank}) e cada sorteio abre de{' '}
                    <strong className="text-white">3 a 10 cartas fechadas</strong>. Declínios são{' '}
                    <strong className="text-emerald-300">ilimitados</strong>; para devolver um filme ao baralho sem queimá-lo, use uma{' '}
                    <strong className="text-sky-300">Ficha Bumerangue</strong> ({boomerangAllowance} nos dias 1 e 15, máx. {maxBoomerangBank}).{' '}
                    Já assistidas no catálogo: <strong className="text-zinc-200">{pool.watchedCount || 0}</strong>.
                  </div>

                  {/* Barra de Naipes + Planilha */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-800/80 text-[11px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-zinc-500 font-black uppercase tracking-wider">Naipes:</span>
                      {[
                        ['♣ Comum', '35 XP • +0.2 SOR', 'border-emerald-500/35 text-emerald-300 bg-emerald-500/10'],
                        ['♦ Mediano', '45 XP • +0.4 SOR', 'border-sky-500/35 text-sky-300 bg-sky-500/10'],
                        ['♠ Difícil', '70 XP • +0.6 SOR', 'border-purple-500/35 text-purple-300 bg-purple-500/10'],
                        ['♥ Muito Difícil', '100 XP • +1.0 SOR', 'border-amber-500/35 text-amber-300 bg-amber-500/10'],
                        ['★ Exótico', '150 XP • +1.3 SOR', 'border-rose-400/50 text-rose-200 bg-rose-500/15'],
                      ].map(([name, xp, cls]) => (
                        <span key={name} className={`px-2.5 py-0.5 rounded-full font-black border ${cls}`}>
                          {name} • <span className="font-mono">{xp}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xlsm,.xls,.csv"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleSyncSheet(f);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        disabled={syncingSheet}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Subir Planilha
                      </button>
                      <button
                        type="button"
                        disabled={syncingSheet}
                        onClick={() => handleSyncSheet(null)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncingSheet ? 'animate-spin' : ''}`} /> Re-sync
                      </button>
                    </div>
                  </div>

                  {/* Regras da Mão: Qtd. Cartas + Ordem de Sagas */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-800/60 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-zinc-500 font-black uppercase tracking-wider mr-1">Qtd. Cartas:</span>
                      {!canChooseCardCount ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg font-black border bg-fuchsia-500/20 border-fuchsia-400/55 text-fuchsia-100">
                            🎲 1ª Ficha: Sorteio Aleatório (3–10 cartas)
                          </span>
                          <span className="text-[10px] text-amber-300/85 font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-400/30">
                            🔒 Escolha manual libera a partir da 2ª ficha do ciclo
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 px-2 py-0.5 rounded-md mr-1">
                            🔓 Escolha Liberada:
                          </span>
                          <button
                            type="button"
                            onClick={() => setCountMode('random')}
                            className={`px-2 py-1 rounded-lg font-black border transition-all cursor-pointer ${
                              countMode === 'random'
                                ? 'bg-fuchsia-500/25 border-fuchsia-400/60 text-fuchsia-100'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            🎲 Aleatório
                          </button>
                          {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setCountMode(String(n))}
                              className={`w-7 py-1 rounded-lg font-black font-mono border transition-all cursor-pointer ${
                                countMode === String(n)
                                  ? 'bg-amber-400 text-slate-950 border-amber-200 shadow'
                                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-zinc-500 font-black uppercase tracking-wider mr-1">Sagas:</span>
                      {SAGA_RULE_OPTIONS.map((opt) => {
                        const active = sagaRule === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSagaRule(opt.id)}
                            title={opt.hint}
                            className={`px-2.5 py-1 rounded-lg font-black border transition-all cursor-pointer ${
                              active
                                ? 'bg-indigo-500/25 border-indigo-400/60 text-indigo-100'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                            }`}
                          >
                            {opt.icon} {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {showLabTools && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setShowSampleNorm((v) => !v)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-zinc-700 cursor-pointer flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3 h-3" /> Normalização
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleGrantLabChip('draw')}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/40 cursor-pointer flex items-center gap-1"
                    title="Adicionar +1 ficha de sorteio no Laboratório"
                  >
                    🎟️ +1 Ficha Lab
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleGrantLabChip('boomerang')}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-400/40 cursor-pointer flex items-center gap-1"
                    title="Adicionar +1 Ficha Bumerangue no Laboratório"
                  >
                    🪃 +1 Bumerangue Lab
                  </button>
                  <button
                    type="button"
                    disabled={acting || actingClassPower}
                    onClick={handleGrantLabClassPower}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-400/40 cursor-pointer flex items-center gap-1"
                    title="Adicionar +1 carga de Poder de Classe para a Sessão Secreta"
                  >
                    ⚡ +1 Poder Classe
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleBackLayout(cardBackLayout === 'orb' ? 'top' : 'orb')
                    }
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer flex items-center gap-1 ${
                      cardBackLayout === 'top'
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50'
                        : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/50'
                    }`}
                    title="Alternar visual dos versos (Opção 1: Orbe Central | Opção 2: Topo + Orbe)"
                  >
                    {cardBackLayout === 'top' ? '🃏 Verso: Opção 2 (Topo+Orbe)' : '🎨 Verso: Opção 1 (Orbe)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLabSpecialPanel((v) => !v)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer flex items-center gap-1 ${
                      showLabSpecialPanel
                        ? 'bg-orange-500/30 text-amber-100 border-orange-400/70 shadow'
                        : 'bg-orange-500/15 hover:bg-orange-500/25 text-amber-200 border-orange-400/40'
                    }`}
                    title="Abrir painel para testar todas as 12 Cartas Especiais no Lab"
                  >
                    🧪 Cartas Especiais ({(statusData?.specialCardsCatalog || FALLBACK_SPECIAL_CARDS_CATALOG).length})
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={handleLabReset}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Reset Lab
                  </button>
                </div>
              )}
        </div>
      </section>

      {/* LABORATÓRIO: TESTADOR DE CARTAS ESPECIAIS + VERSOS */}
      {showLabTools && showLabSpecialPanel && (
        <section className="rounded-3xl border border-orange-400/35 bg-gradient-to-br from-[#190d24] via-[#120b18] to-[#0a080f] p-4 sm:p-5 shadow-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-200 flex items-center gap-2">
                <span>🧪</span>
                <span>Laboratório das Cartas Especiais & Versos</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Clique em qualquer carta abaixo para rodar a animação completa de revelação + efeito real na fila/mesa atual.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => handleToggleBackLayout('orb')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition ${
                  cardBackLayout === 'orb'
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Opção 1: Orbe Central
              </button>
              <button
                type="button"
                onClick={() => handleToggleBackLayout('top')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition ${
                  cardBackLayout === 'top'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Opção 2: Topo + Orbe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {specialCatalogList.map((spec) => {
              const sMeta = SPECIAL_RARITY_META[spec.rarity] || SPECIAL_RARITY_META.rare;
              const dMeta = getSpecialCardDisplayMeta(spec, specialCatalogList);
              const artGallery = getSpecialCardArtGallery(spec, specialCatalogList);
              const thumbUrl = getSecretCardUrl(artGallery[0]?.url || spec.images?.[0]);
              return (
                <div
                  key={spec.id}
                  className="rounded-2xl border border-white/10 bg-black/45 p-2.5 flex items-center gap-3 hover:border-amber-400/45 transition"
                >
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleLabTriggerSpecial(spec.id, null)}
                    className={`w-12 h-[72px] rounded-xl overflow-hidden border border-white/20 shrink-0 cursor-pointer hover:scale-105 transition disabled:opacity-50 ${
                      spec.rarity === 'cursed' ? 'bg-zinc-950' : 'bg-white'
                    }`}
                    title={`Testar ${dMeta.title} (Arlequim)`}
                  >
                    <img
                      src={thumbUrl}
                      alt={dMeta.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${sMeta.badgeClass}`}>
                        {sMeta.icon} {spec.rarity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-black text-white truncate" title={dMeta.title}>
                      {spec.icon} {dMeta.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">{spec.shortTag}</div>
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => handleLabTriggerSpecial(spec.id, null)}
                        className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/45 text-[10px] font-black text-amber-200 cursor-pointer disabled:opacity-50"
                      >
                        ▶ Testar
                      </button>
                      {artGallery.length > 1 &&
                        artGallery.map((art, vIdx) => (
                          <button
                            key={art.url}
                            type="button"
                            disabled={acting}
                            onClick={() => handleLabTriggerSpecial(spec.id, vIdx)}
                            className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black cursor-pointer disabled:opacity-50 ${
                              art.kind === 'classic'
                                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-400/35 text-emerald-200'
                            }`}
                            title={`Testar arte: ${art.label}`}
                          >
                            {art.kind === 'arlequim' ? 'Arl' : art.kind === 'alt' ? 'Alt' : `C${vIdx}`}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PAINEL DE PODER DA CLASSE NA SESSÃO SECRETA */}
      {activePowerSpec && (
        <section className={`rounded-2xl border p-4 flex flex-col gap-3 ${activePowerTier.cardTone}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                {activePowerSpec.icon}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300">
                    ⚡ Poder da Classe • Sessão Secreta
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${activePowerTier.badgeTone}`}>
                    {activePowerTier.badge}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${
                      secretPowerCharges > 0
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                    title={classPowerWallet?.nextReset15Label ? `Recarga: ${classPowerWallet.nextReset15Label}` : undefined}
                  >
                    ⚡ Cargas: {secretPowerCharges}/{maxSecretPowerCharges} (dias 1 e 15)
                  </span>
                </div>
                <div className="text-sm font-black text-white flex flex-wrap items-center gap-2">
                  <span>{activePowerSpec.title}</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-950/90 border border-zinc-700 text-xs font-bold text-amber-200">
                    <span>{activePowerClass?.classIcon}</span>
                    <span>{activePowerClass?.className}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{activePowerSpec.desc}</p>
                {secretBuffArmed && (
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/55 text-[11px] font-bold text-amber-200 w-fit">
                    🌟 Buff Armado p/ Próximo Sorteio: {secretBuffArmed.powerTitle}
                    {secretBuffArmed.forceCardCount ? ` (${secretBuffArmed.forceCardCount} cartas)` : ''}
                    {secretBuffArmed.bonusNextPickXp ? ` (+${secretBuffArmed.bonusNextPickXp} XP)` : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {(activePowerSpec.actionType === 'pick_card' || activePowerSpec.actionType === 'pick_card_or_buff') && (
                <select
                  value={selectedPowerPickId}
                  onChange={(e) => setSelectedPowerPickId(e.target.value)}
                  aria-label="Selecionar carta ativa na fila"
                  className="px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-700 text-xs font-bold text-amber-200 max-w-[300px] focus:outline-none focus:border-amber-400"
                >
                  {activePowerSpec.actionType === 'pick_card_or_buff' ? (
                    <option value="">🌟 Armar para a próxima carta sorteada</option>
                  ) : eligiblePowerQueuePicks.length === 0 ? (
                    <option value="">
                      {activePowerClass?.id === 'paladino_oscar' && activeQueuePicks.length > 0
                        ? 'Nenhuma carta elegível (já em ★ Exótico)'
                        : 'Nenhuma carta ativa na fila'}
                    </option>
                  ) : null}
                  {eligiblePowerQueuePicks.map((pick) => (
                    <option key={pick.id} value={String(pick.id)}>
                      {formatQueuePickLabel(pick)}
                    </option>
                  ))}
                </select>
              )}

              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={
                    acting ||
                    actingClassPower ||
                    secretPowerCharges <= 0 ||
                    (activePowerSpec.actionType === 'pick_card' && !selectedPowerPickId)
                  }
                  onClick={() => handleActivateSecretClassPower()}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-500 to-amber-400 hover:from-fuchsia-400 hover:to-amber-300 text-slate-950 shadow-lg cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {actingClassPower ? 'Ativando...' : 'Ativar Poder'}
                </button>
                <PowerHelpButton
                  help={{
                    icon: activePowerSpec.icon,
                    title: `${activePowerSpec.title} (${activePowerClass?.className || ''})`,
                    subtitle: 'Poder da Classe RPG • Sessão Secreta',
                    description: activePowerSpec.desc,
                    rule: `Recarrega ${maxSecretPowerCharges}× nos dias 1 e 15 (além de recarga no Bazar).`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          MOCHILA DO BAZAR & RELÍQUIAS DA SESSÃO SECRETA
         ===================================================================== */}
      {(() => {
        const charges = bazaarProfile?.tacticalCharges || {};
        const armed = bazaarProfile?.armedSecretFlags || {};
        const relics = bazaarProfile?.ownedRelics || [];
        const hasAnyCharge =
          Number(charges.secret_amulet || 0) > 0 ||
          Number(charges.secret_radar || 0) > 0 ||
          Number(charges.secret_hand_plus2 || 0) > 0 ||
          Number(charges.secret_hand_plus5 || 0) > 0 ||
          Number(charges.secret_special_storm || 0) > 0 ||
          Number(charges.secret_transmute || 0) > 0;
        const hasAnyArmedOrRelic =
          Boolean(armed.amuletArmed) ||
          Number(armed.pendingExtraCards || 0) > 0 ||
          Boolean(armed.pendingSpecialStorm) ||
          Boolean(armed.pendingRadar) ||
          relics.length > 0;

        if (!hasAnyCharge && !hasAnyArmedOrRelic) return null;

        return (
          <section className="rounded-2xl border border-amber-400/35 bg-gradient-to-r from-[#170f08]/95 via-zinc-950/90 to-[#11181c]/95 px-4 py-3 flex flex-col gap-2.5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200">
                <span>🎒 Poderes &amp; Relíquias do Bazar</span>
                {relics.includes('vip_seat') && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-300/60 text-[10px] text-amber-200">
                    🛋️ Poltrona VIP (+1 Fila)
                    <PowerHelpButton helpKey="vip_seat" size="xs" />
                  </span>
                )}
                {relics.includes('golden_loupe') && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-300/60 text-[10px] text-yellow-200">
                    🔍 Lupa Eterna (+10% 🪙)
                    <PowerHelpButton helpKey="golden_loupe" size="xs" />
                  </span>
                )}
                {relics.includes('house_insurance') && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${
                      bazaarProfile?.houseInsuranceAvailableThisCycle
                        ? 'bg-sky-500/20 border-sky-300/65 text-sky-200'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    🛡️ Seguro {bazaarProfile?.houseInsuranceAvailableThisCycle ? 'Pronto (1×)' : 'Usado neste ciclo'}
                    <PowerHelpButton helpKey="house_insurance" size="xs" />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {armed.amuletArmed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-300/70 text-[10px] font-black text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse">
                    🛡️ Escudo do Arlequim ARMADO
                    <PowerHelpButton helpKey="secret_amulet" size="xs" />
                  </span>
                )}
                {Number(armed.pendingExtraCards || 0) > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-300/70 text-[10px] font-black text-cyan-200">
                    🃏 +{armed.pendingExtraCards} Cartas Armadas
                  </span>
                )}
                {armed.pendingSpecialStorm && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-300/70 text-[10px] font-black text-purple-200">
                    🌪️ 2–6 Especiais Armadas
                  </span>
                )}
                {armed.pendingRadar && (
                  <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/25 border border-fuchsia-300/70 text-[10px] font-black text-fuchsia-200">
                    🕵️ Radar Armado
                  </span>
                )}
              </div>
            </div>

            {hasAnyCharge && (
              <div className="flex flex-wrap items-center gap-2">
                {Number(charges.secret_amulet || 0) > 0 && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={actingBazaarPower || Boolean(armed.amuletArmed)}
                      onClick={() => handleUseSecretBazaarPower('arm_amulet')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/75 hover:bg-emerald-900/80 border border-emerald-400/60 text-[11px] font-black text-emerald-100 cursor-pointer disabled:opacity-45"
                    >
                      🛡️ Armar Escudo Anti-Maldição ({charges.secret_amulet}×)
                    </button>
                    <PowerHelpButton helpKey="secret_amulet" size="xs" />
                  </div>
                )}
                {Number(charges.secret_radar || 0) > 0 && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={actingBazaarPower}
                      onClick={() => handleUseSecretBazaarPower('activate_radar')}
                      className="px-3 py-1.5 rounded-xl bg-fuchsia-950/75 hover:bg-fuchsia-900/80 border border-fuchsia-400/60 text-[11px] font-black text-fuchsia-100 cursor-pointer disabled:opacity-45"
                    >
                      🕵️ Radar do Croupier ({charges.secret_radar}×)
                    </button>
                    <PowerHelpButton helpKey="secret_radar" size="xs" />
                  </div>
                )}
                {Number(charges.secret_hand_plus2 || 0) > 0 && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={actingBazaarPower || Number(armed.pendingExtraCards || 0) > 0}
                      onClick={() => handleUseSecretBazaarPower('arm_plus2')}
                      title={
                        Number(armed.pendingExtraCards || 0) > 0
                          ? `Já existe +${armed.pendingExtraCards} carta(s) extra(s) armada(s) para o próximo sorteio`
                          : 'Armar +2 cartas extras para o próximo sorteio'
                      }
                      className="px-3 py-1.5 rounded-xl bg-sky-950/75 hover:bg-sky-900/80 border border-sky-400/60 text-[11px] font-black text-sky-100 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      🃏 Manga Cheia +2 Cartas ({charges.secret_hand_plus2}×)
                    </button>
                    <PowerHelpButton helpKey="secret_hand_plus2" size="xs" />
                  </div>
                )}
                {Number(charges.secret_hand_plus5 || 0) > 0 && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={actingBazaarPower || Number(armed.pendingExtraCards || 0) > 0}
                      onClick={() => handleUseSecretBazaarPower('arm_plus5')}
                      title={
                        Number(armed.pendingExtraCards || 0) > 0
                          ? `Já existe +${armed.pendingExtraCards} carta(s) extra(s) armada(s) para o próximo sorteio`
                          : 'Armar +5 cartas extras para o próximo sorteio'
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-950/75 hover:bg-amber-900/80 border border-amber-400/60 text-[11px] font-black text-amber-100 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      🌟 Manga Cheia +5 Cartas ({charges.secret_hand_plus5}×)
                    </button>
                    <PowerHelpButton helpKey="secret_hand_plus5" size="xs" />
                  </div>
                )}
                {Number(charges.secret_special_storm || 0) > 0 && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={actingBazaarPower || Boolean(armed.pendingSpecialStorm)}
                      onClick={() => handleUseSecretBazaarPower('arm_special_storm')}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/75 hover:bg-purple-900/80 border border-purple-400/60 text-[11px] font-black text-purple-100 cursor-pointer disabled:opacity-45"
                    >
                      🌪️ 2–6 Especiais ({charges.secret_special_storm}×)
                    </button>
                    <PowerHelpButton helpKey="secret_special_storm" size="xs" />
                  </div>
                )}
                {Number(charges.secret_transmute || 0) > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-300/45 text-[10.5px] font-bold text-amber-200">
                    ⚖️ Selo de Transmutação ({charges.secret_transmute}×): use na carta da fila abaixo
                    <PowerHelpButton helpKey="secret_transmute" size="xs" />
                  </span>
                )}
              </div>
            )}
          </section>
        );
      })()}

      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/45 bg-rose-950/35 px-4 py-3 text-sm text-rose-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-xs font-bold text-rose-300/75 hover:text-white px-2"
          >
            ✕
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] rounded-2xl border border-rose-400/70 bg-rose-950/95 backdrop-blur-md px-4 py-3 text-xs sm:text-sm font-bold text-rose-100 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-rose-200 hover:text-white font-black text-xs px-1.5"
          >
            ✕
          </button>
        </div>
      )}
      {infoBanner && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{infoBanner}</span>
        </div>
      )}

      {/* Amostra de Normalização (Opcional no Lab) */}
      {showLabTools && showSampleNorm && Array.isArray(pool.sampleNormalized) && pool.sampleNormalized.length > 0 && (
        <section className="rounded-2xl border border-cyan-500/30 bg-zinc-950/90 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" /> Amostra de Limpeza da Planilha ({pool.totalRawRows || 0} linhas → {pool.totalUniqueRows || 0} únicas)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {pool.sampleNormalized.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/75 border border-zinc-800 rounded-xl p-2.5 text-xs flex flex-col gap-0.5">
                <div className="text-zinc-500 font-mono text-[10px]">L#{item.row}: “{item.rawTitle}” {item.rawYearStr ? `(${item.rawYearStr})` : ''}</div>
                <div className="text-emerald-300 font-bold">→ “{item.cleanedTitle}” {item.releaseYear ? `(${item.releaseYear})` : ''}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          MESA DE FELTRO DO BARALHO (EMBARALHAMENTO RIFFLE & 5 CARTAS EM LEQUE)
         ===================================================================== */}
      {(drawing || previewShuffling || (currentRound?.status === 'revealed' && Array.isArray(currentRound.cards))) && (
        <section
          className="relative overflow-hidden rounded-[2rem] border-2 shadow-[inset_0_0_90px_rgba(0,0,0,0.85),0_24px_70px_rgba(0,0,0,0.75)] px-4 sm:px-8 py-8 sm:py-10 border-amber-400/20"
          style={{
            background: 'radial-gradient(ellipse at center, #0b221a 0%, #05110d 56%, #030706 100%)',
          }}
        >
          {/* Arco dourado de mesa clássica */}
          <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-amber-400/15" />
          <div className="pointer-events-none absolute inset-6 rounded-[1.3rem] border border-amber-400/10" />

          {drawing || previewShuffling ? (
            /* ANIMAÇÃO REALISTA DE BARALHO EMBARALHANDO (RIFFLE SHUFFLE DE CROUPIER) */
            <div className="relative z-10 min-h-[380px] flex flex-col items-center justify-center gap-7 py-6">
              <div className="relative w-80 h-60 flex items-center justify-center">
                {/* Halo âmbar/esmeralda sobre o feltro */}
                <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-amber-500/20 via-fuchsia-500/15 to-emerald-400/25 blur-2xl animate-pulse" />

                {/* Monte Base Esquerdo (empilhado com espessura 3D) */}
                <div className="secret-riffle-left-stack absolute w-32 h-48 rounded-2xl border-2 border-amber-300/70 bg-[#120820] overflow-hidden shadow-[-6px_6px_0_rgba(255,255,255,0.12),-10px_10px_24px_rgba(0,0,0,0.75)]">
                  <img
                    src={SECRET_DECK_BACK_IMAGE}
                    alt="Verso do Baralho"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Monte Base Direito (empilhado com espessura 3D) */}
                <div className="secret-riffle-right-stack absolute w-32 h-48 rounded-2xl border-2 border-fuchsia-300/70 bg-[#120820] overflow-hidden shadow-[6px_6px_0_rgba(255,255,255,0.12),10px_10px_24px_rgba(0,0,0,0.75)]">
                  <img
                    src={SECRET_DECK_BACK_IMAGE}
                    alt="Verso do Baralho"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Monte Central Recebendo as Cartas Embaralhadas */}
                <div className="secret-riffle-center-stack relative z-10 w-32 h-48 rounded-2xl border-2 border-amber-200/85 bg-[#120820] overflow-hidden shadow-[0_6px_0_rgba(251,191,36,0.22),0_18px_40px_rgba(0,0,0,0.85)]">
                  <img
                    src={SECRET_DECK_BACK_IMAGE}
                    alt="Baralho da Sessão Secreta"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 12 Lâminas Alternadas Voando da Esquerda e da Direita (Riffle Cascade) */}
                {[0, 1, 2, 3, 4, 5].map((leafIdx) => (
                  <React.Fragment key={leafIdx}>
                    <div
                      style={{ animationDelay: `${leafIdx * 125}ms` }}
                      className="secret-riffle-leaf-left pointer-events-none absolute z-20 w-32 h-48 rounded-2xl border border-amber-200/75 bg-[#120820] overflow-hidden shadow-xl"
                    >
                      <img
                        src={SECRET_DECK_BACK_IMAGE}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      style={{ animationDelay: `${leafIdx * 125 + 62}ms` }}
                      className="secret-riffle-leaf-right pointer-events-none absolute z-20 w-32 h-48 rounded-2xl border border-cyan-200/75 bg-[#120820] overflow-hidden shadow-xl"
                    >
                      <img
                        src={SECRET_DECK_BACK_IMAGE}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="text-center flex flex-col items-center gap-1.5 max-w-md px-3">
                <div className="text-sm sm:text-base font-black uppercase tracking-[0.2em] text-amber-200 animate-pulse">
                  {ocarinaShuffling
                    ? '⏳ O Arlequim Está Reembaralhando Tudo!'
                    : previewShuffling
                      ? 'Testando Embaralhamento Riffle...'
                      : shuffleDeepLoading
                        ? 'O Arlequim Está Preparando a Mesa...'
                        : 'Embaralhando o Baralho da Sessão Secreta...'}
                </div>
                <div className="text-xs text-emerald-200/80 leading-relaxed">
                  {ocarinaShuffling
                    ? 'A melodia reversa está trocando e embaralhando todas as cartas fechadas da mesa sem gastar ficha'
                    : previewShuffling
                      ? 'Intercalando as cartas no feltro antes de distribuir sua mão'
                      : shuffleDeepLoading
                        ? 'Sorteando títulos inéditos da planilha, buscando pôsteres no TMDB/OMDb, checando ordem de sagas e calculando marcos ocultos — mãos maiores levam alguns segundinhos.'
                        : 'Cortando o baralho da planilha e separando de 3 a 10 cartas misteriosas...'}
                </div>
              </div>
            </div>
          ) : (
            /* MÃO DE 3 A 10 CARTAS DE BARALHO NA MESA */
            <div className="relative z-10 flex flex-col items-center gap-4">
              {(() => {
                let tableXpTotal = 0;
                let tableGoldTotal = 0;
                let tableClosedCount = 0;
                let tableBanishedCount = 0;
                let tableSpecialCount = 0;
                for (const c of currentRound.cards || []) {
                  if (c.removedByCurse) {
                    tableBanishedCount += 1;
                    continue;
                  }
                  const seatNum = Number(c.seat);
                  if (currentRoundPickedSeats.includes(seatNum) || c.specialEvent?.triggered) continue;
                  tableClosedCount += 1;
                  if (c.specialEvent) tableSpecialCount += 1;
                  const rw = getSecretRewardMeta(c);
                  if (rw.isGold) tableGoldTotal += rw.amount;
                  else tableXpTotal += rw.amount;
                }
                return (
                  <div className="w-full max-w-[1160px] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-black/45 border border-amber-400/25 rounded-2xl px-4 py-2.5">
                    <div className="flex flex-col gap-1 text-center lg:text-left">
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-200 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                        <span>
                          {`🃏 Mesa do Arlequim • ${currentRound.cards.length} carta${currentRound.cards.length === 1 ? '' : 's'} na mesa`}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">• Rodada #{currentRound.id}</span>
                        {tableBanishedCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-400/55 text-[10px] font-black text-rose-200 normal-case tracking-normal">
                            ⚔️ {tableBanishedCount} banida{tableBanishedCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-emerald-100/80">
                        Clicou na carta, aceitou! Ela vira e vai direto para a fila sem troca ({currentRoundPickedSeats.length} aceita(s) aqui • Fila: <strong className="text-amber-300">{activeWatchCount}/{activeWatchLimit}</strong>)
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 shrink-0">
                      <div
                        className="flex flex-wrap items-center gap-1.5 rounded-xl bg-black/60 border border-white/15 px-3 py-1.5"
                        title={`Total possível nas ${tableClosedCount} carta(s) ainda fechada(s) da mesa`}
                      >
                        <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 mr-0.5">
                          Na mesa ({tableClosedCount}):
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/45 text-[11px] font-black font-mono text-cyan-200">
                          ⚡ +{tableXpTotal} XP
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-300/55 text-[11px] font-black font-mono text-yellow-200">
                          🪙 +{tableGoldTotal}
                        </span>
                        <span
                          title="Quantidade de Cartas Especiais disfarçadas ainda fechadas nesta mesa (a localização continua oculta!)"
                          className="px-2 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/45 text-[11px] font-black font-mono text-fuchsia-200"
                        >
                          🎭 {tableSpecialCount} {tableSpecialCount === 1 ? 'Especial' : 'Especiais'}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => handleFinishSelection(currentRound.id)}
                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        title="Encerra esta mão e devolve todas as cartas que permaneceram fechadas ao baralho"
                      >
                        ✅ Finalizar Escolha ({currentRoundPickedSeats.length > 0 ? `${currentRoundPickedSeats.length} na fila` : 'Pular Mão'})
                      </button>
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const cardsCount = currentRound.cards.length;
                const isLargeHand = cardsCount >= 6;
                const cardSizeClass = isLargeHand
                  ? 'w-[184px] sm:w-[202px] md:w-[216px] h-[278px] sm:h-[306px] md:h-[328px]'
                  : 'w-[214px] sm:w-[238px] md:w-[252px] h-[324px] sm:h-[360px] md:h-[380px]';
                const gridWrapClass = isLargeHand
                  ? 'flex flex-wrap items-center justify-center gap-5 sm:gap-6 py-4 w-full max-w-[1380px]'
                  : 'flex flex-wrap items-center justify-center gap-6 sm:gap-7 py-4 w-full max-w-[1380px]';

                return (
                  <div className={gridWrapClass}>
                    {currentRound.cards.map((card, idx) => {
                      const suit = SUIT_META[card.difficulty] || SUIT_META.common;
                      const cardReward = getSecretRewardMeta(card);
                      const deckMeta = getSecretPlayingCardMeta(card, currentRound?.id);
                      const isDealt = idx < dealingCount;
                      const isPickedInRound = currentRoundPickedSeats.includes(Number(card.seat));
                      const isBanished = Boolean(card.removedByCurse);
                      const isSpecialTriggered = Boolean(card.specialEvent?.triggered);
                      const isSpecialFront =
                        !isBanished &&
                        Boolean(card.specialEvent) &&
                        (isSpecialTriggered || effectiveLabTransparent);
                      const isFlipped =
                        !isBanished &&
                        (effectiveLabTransparent ||
                          isPickedInRound ||
                          isSpecialTriggered ||
                          Boolean(flippedSeats[card.seat]));
                      const hasRadarPulse = Boolean(card.specialPulseHint && !isBanished && !isFlipped && !isPickedInRound);
                      const revealedGroups = card.simpleMilestonesHint
                        ? groupSimpleMilestones(
                            card.decoyMilestones?.length ? card.decoyMilestones : card.milestones
                          )
                        : [];
                      const isFlippingThis = !isBanished && !isFlipped && Number(flippingSeat) === Number(card.seat);
                      const isSelectedSpotlight = spotlightSeat === card.seat;
                      const burstKey = burstSeats[card.seat] || 0;
                      const fanClass = isLargeHand
                        ? LARGE_HAND_TILT[idx % LARGE_HAND_TILT.length]
                        : cardsCount === 3
                          ? FAN_LAYOUT_3[idx] || ''
                          : FAN_LAYOUT_CLASSES[idx] || '';
                      const hiddenCount = Number(card.totalMilestonesCount || 0);
                      const cardAnimStyle = seatAnimStyles[card.seat] || 'classic';
                      const modeClass =
                        cardAnimStyle === 'tornado'
                          ? 'secret-mode-tornado'
                          : cardAnimStyle === 'wax'
                            ? 'secret-mode-wax'
                            : '';

                      if (!isDealt) {
                        return <div key={card.seat} className={`${cardSizeClass} opacity-0`} />;
                      }

                      return (
                        <div
                          key={card.seat}
                          style={{ animationDelay: `${idx * 45}ms` }}
                          className={`secret-card-deal-in relative flex flex-col items-center gap-2.5 transition-transform duration-300 ${fanClass} hover:rotate-0 hover:-translate-y-3 hover:scale-[1.03] hover:z-30`}
                        >
                          {/* WRAPPER CINÉTICO EXTERNO + OVERLAYS DA ANIMAÇÃO (1, 3 OU 4) */}
                          <div
                            className={`relative ${burstKey > 0 ? `secret-motion-${cardAnimStyle}` : ''}`}
                          >
                            {burstKey > 0 && (
                              <div
                                key={`burst_${burstKey}_${cardAnimStyle}`}
                                className="pointer-events-none absolute -inset-6 flex items-center justify-center z-50"
                              >
                                {cardAnimStyle === 'tornado' && (
                                  <>
                                    <div
                                      className={`secret-slam-shockwave w-52 h-76 rounded-3xl border-4 ${suit.ringColor} shadow-[0_0_45px_rgba(255,255,255,0.55)]`}
                                    />
                                    {BURST_VECTORS.map((vec, pIdx) => (
                                      <span
                                        key={pIdx}
                                        style={{ '--tx': vec.tx, '--ty': vec.ty, '--rot': vec.rot }}
                                        className={`secret-suit-particle absolute text-xl font-black ${suit.accentText}`}
                                      >
                                        {pIdx % 2 === 0 ? '💨' : suit.suit}
                                      </span>
                                    ))}
                                  </>
                                )}

                                {cardAnimStyle === 'wax' && (
                                  <>
                                    <div className="secret-wax-flash absolute inset-6 rounded-2xl bg-gradient-to-br from-amber-400/55 via-orange-300/35 to-rose-500/45 border-2 border-amber-200" />
                                    <div className="secret-flip-burst-ring w-48 h-68 rounded-3xl border-4 border-amber-300 shadow-[0_0_55px_rgba(251,191,36,0.9)]" />
                                    {BURST_VECTORS.map((vec, pIdx) => (
                                      <span
                                        key={pIdx}
                                        style={{ '--tx': vec.tx, '--ty': vec.ty, '--rot': vec.rot }}
                                        className="secret-wax-shard absolute text-xl font-black text-amber-200 drop-shadow-[0_0_12px_rgba(245,158,11,0.95)]"
                                      >
                                        {pIdx % 2 === 0 ? '🔸' : '🔥'}
                                      </span>
                                    ))}
                                  </>
                                )}

                                {cardAnimStyle === 'classic' && (
                                  <>
                                    <div className={`secret-flip-burst-ring w-48 h-68 rounded-3xl border-4 ${suit.ringColor}`} />
                                    {BURST_VECTORS.map((vec, pIdx) => (
                                      <span
                                        key={pIdx}
                                        style={{ '--tx': vec.tx, '--ty': vec.ty, '--rot': vec.rot }}
                                        className={`secret-suit-particle absolute text-xl font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] ${suit.accentText}`}
                                      >
                                        {pIdx % 2 === 0 ? suit.suit : '✦'}
                                      </span>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}

                            {/* CORPO DA CARTA DE BARALHO (3D SCENE PURO) */}
                            <div
                              role="button"
                              aria-disabled={isBanished}
                              tabIndex={isBanished ? -1 : 0}
                              onClick={() => !isBanished && handleCardClick(card)}
                              onKeyDown={(e) => {
                                if (isBanished) return;
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleCardClick(card);
                                }
                              }}
                              className={`secret-card-scene ${cardSizeClass} select-none focus:outline-none ${
                                isBanished
                                  ? 'cursor-not-allowed opacity-60 grayscale contrast-125'
                                  : isFlippingThis
                                    ? 'cursor-wait ring-2 ring-amber-300 rounded-[20px] ring-offset-4 ring-offset-[#072019] animate-pulse shadow-[0_0_30px_rgba(251,191,36,0.65)]'
                                  : isPickedInRound
                                    ? 'cursor-pointer ring-2 ring-emerald-400 rounded-[20px] ring-offset-4 ring-offset-[#072019] shadow-[0_0_28px_rgba(16,185,129,0.55)]'
                                    : hasRadarPulse
                                      ? 'cursor-pointer secret-special-radar-pulse rounded-[20px]'
                                      : isSelectedSpotlight
                                        ? 'cursor-pointer ring-2 ring-amber-300/85 rounded-[20px] ring-offset-4 ring-offset-[#072019]'
                                        : 'cursor-pointer'
                              }`}
                            >
                              <div className={`secret-card-inner ${modeClass} ${isFlipped ? 'is-flipped' : ''}`}>
                          {/* ===================== VERSO (MODELO 4: OPÇÃO 1 ORBE / OPÇÃO 2 TOPO+ORBE) ===================== */}
                          <div
                            className={`secret-card-face secret-card-face-back rounded-[18px] border-2 ${
                              isBanished ? 'border-rose-500/65 bg-black' : `${suit.borderFrame} bg-[#09070e] ${suit.glowShadow}`
                            } overflow-hidden flex flex-col`}
                          >
                            {/* Banida pela Dama de Espadas — A Inquisidora (Q ♠) */}
                            {isBanished ? (
                              <>
                                <img
                                  src={getSecretSuitBackImage(card.difficulty)}
                                  alt={`Banida ${card.difficultyLabel}`}
                                  className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-rose-950/60 to-black/90" />
                                <div className="relative z-10 flex-1 p-3 flex flex-col items-center justify-between text-center">
                                  <span className="px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-400/60 text-[9px] font-black text-rose-200 uppercase tracking-wider">
                                    ⚔️ Q ♠ Banida
                                  </span>
                                  <div className="rounded-xl bg-black/80 border border-rose-400/50 px-2.5 py-2 space-y-1 shadow-xl">
                                    <div className="text-[11px] font-black text-rose-200 leading-tight">
                                      Banida pela Inquisidora
                                    </div>
                                    <div className="text-[9.5px] font-mono text-zinc-400 line-through">
                                      {cardReward.short} • {suit.rank} {suit.suit}
                                    </div>
                                    <div className="text-[9px] font-bold text-rose-300/90">
                                      Devolvida ao baralho
                                    </div>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-black/80 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                    Carta #{card.seat}
                                  </span>
                                </div>
                              </>
                            ) : card.revealedPreview ? (
                              <>
                                {card.resolved?.posterUrl ? (
                                  <img
                                    src={card.resolved.posterUrl}
                                    alt={card.resolved?.title || 'Filme Revelado'}
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={getSecretSuitBackImage(card.difficulty)}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-55"
                                  />
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/75" />
                                <div className="relative z-10 flex-1 p-2.5 flex flex-col justify-between">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="px-2 py-0.5 rounded-full bg-fuchsia-600/85 border border-fuchsia-300/70 text-[9px] font-black text-white shadow">
                                        🃏 Arlequim Revelou!
                                      </span>
                                      <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full border ${cardReward.isGold ? 'bg-amber-400/30 border-amber-300/75 text-amber-200' : suit.xpChip}`}>
                                        {cardReward.short}
                                      </span>
                                    </div>
                                    {card.goldConvertedByJack && (
                                      <span className="self-end px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-300/70 text-[8.5px] font-black text-amber-200 shadow">
                                        🪙 J♦ +15% Ouro
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-auto space-y-1">
                                    <div className="text-[10px] font-black uppercase text-amber-300">
                                      {suit.suit} {card.difficultyLabel} • {card.resolved?.releaseYear || '?'}
                                    </div>
                                    <div className="text-xs font-black text-white leading-tight line-clamp-2 drop-shadow">
                                      {card.resolved?.title || card.planilha?.rawTitle}
                                    </div>
                                    <div className="text-[9.5px] font-bold text-emerald-300">
                                      👆 Clique para pegar ou abrir
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Arte Modelo 4 do Naipe */}
                                <img
                                  src={getSecretSuitBackImage(card.difficulty)}
                                  alt={`Verso ${card.difficultyLabel}`}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />

                                {/* Camada sutil para leitura mantendo os 4 cristais dos cantos intactos */}
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-2">
                                  {/* FAIXA SUPERIOR: Opção 1 (só +XP central) vs Opção 2 (Naipe+Rank+XP central longe dos cantos) */}
                                  <div className="w-full flex flex-col items-center gap-1 pt-1">
                                    {cardBackLayout === 'top' ? (
                                      <div className="px-2.5 py-0.5 rounded-full bg-black/82 backdrop-blur-md border border-white/25 flex items-center gap-1.5 shadow-lg">
                                        <span className={`text-[11px] font-black font-serif ${suit.accentText}`}>
                                          {suit.rank} {suit.suit}
                                        </span>
                                        <span className="text-white/30 text-[10px]">•</span>
                                        <span className={`text-[10px] font-black font-mono ${cardReward.isGold ? 'text-yellow-300' : 'text-amber-200'}`}>
                                          {cardReward.short}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className={`px-2.5 py-0.5 rounded-full backdrop-blur-md border text-[10px] font-black font-mono shadow-lg ${cardReward.isGold ? 'bg-amber-950/85 border-amber-300/65 text-yellow-200' : 'bg-black/80 border-white/25 text-amber-200'}`}>
                                        {cardReward.short}
                                      </div>
                                    )}
                                    {card.goldConvertedByJack && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-300/75 text-[8.5px] font-black text-amber-200 shadow">
                                        🪙 J♦ +15% Ouro
                                      </span>
                                    )}
                                  </div>

                                  {/* ORBE CENTRAL DE OBSIDIANA (MARCOS & DIFICULDADE) */}
                                  <div className="my-auto w-[78%] rounded-xl bg-black/68 backdrop-blur-sm border border-white/15 px-2 py-1.5 flex flex-col items-center text-center gap-1 shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
                                    {cardBackLayout === 'orb' && (
                                      <div className="flex items-center gap-1">
                                        <span className={`text-xs font-black font-serif ${suit.accentText}`}>
                                          {suit.rank} {suit.suit}
                                        </span>
                                        <span className={`text-[9.5px] font-black uppercase tracking-wider ${suit.accentText}`}>
                                          {card.difficultyLabel}
                                        </span>
                                      </div>
                                    )}

                                    {cardBackLayout === 'top' && (
                                      <span className={`text-[9.5px] font-black uppercase tracking-[0.14em] ${suit.accentText}`}>
                                        {card.difficultyLabel}
                                      </span>
                                    )}

                                    <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-black text-zinc-100 whitespace-nowrap">
                                      {isFlippingThis
                                        ? '✨ Virando...'
                                        : hiddenCount > 0
                                          ? `❓ ${hiddenCount} Marco${hiddenCount > 1 ? 's' : ''}`
                                          : '❓ Destino Selado'}
                                    </div>

                                    {/* Visão dos Marcos I/II (quando ativada na mesa!) */}
                                    {revealedGroups.length > 0 && (
                                      <div className="flex flex-wrap justify-center gap-1 pt-0.5">
                                        {revealedGroups.map((grp) => (
                                          <span
                                            key={grp.system}
                                            title={`${grp.count}× ${grp.label}`}
                                            className="px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-300/45 text-[9px] font-black text-sky-100"
                                          >
                                            {grp.icon} ×{grp.count}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Buffs de Classe (Raio-X / Microfone / Portal das Décadas) */}
                                    {(currentRound.powerFlags?.xrayMilestones ||
                                      currentRound.powerFlags?.xrayUnconqueredYearsOnly ||
                                      currentRound.powerFlags?.revealYearRuntime) &&
                                      (() => {
                                        const showRuntime = Boolean(currentRound.powerFlags?.revealYearRuntime);
                                        const showAllMilestones = Boolean(currentRound.powerFlags?.xrayMilestones);
                                        const showYearsOnly = Boolean(
                                          currentRound.powerFlags?.xrayUnconqueredYearsOnly
                                        );
                                        const effectiveYear = card.resolved?.releaseYear || card.decoyYear;
                                        const effectiveRuntime = card.resolved?.runtime || card.decoyRuntime;
                                        const rawMilestones =
                                          Array.isArray(card.milestones) && card.milestones.length > 0
                                            ? card.milestones
                                            : Array.isArray(card.decoyMilestones)
                                              ? card.decoyMilestones
                                              : [];
                                        const visibleMilestones = showAllMilestones
                                          ? rawMilestones.slice(0, 2)
                                          : showYearsOnly
                                            ? rawMilestones
                                                .filter(
                                                  (m) =>
                                                    m.system === 'time_machine' &&
                                                    String(m.label || '').startsWith('Ano inédito')
                                                )
                                                .slice(0, 2)
                                            : [];
                                        if (
                                          !(showRuntime && (effectiveYear || effectiveRuntime)) &&
                                          visibleMilestones.length === 0
                                        ) {
                                          return null;
                                        }
                                        return (
                                          <div className="flex flex-col items-center gap-1 pt-0.5 max-w-full">
                                            {showRuntime && (effectiveYear || effectiveRuntime) && (
                                              <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-400/50 text-[8.5px] font-black font-mono text-cyan-200">
                                                🎙️ {effectiveYear || '?'} •{' '}
                                                {effectiveRuntime ? `${effectiveRuntime}m` : '?m'}
                                              </span>
                                            )}
                                            {visibleMilestones.length > 0 && (
                                              <div className="flex flex-wrap justify-center gap-1 max-w-full">
                                                {visibleMilestones.map((m, mIdx) => (
                                                  <span
                                                    key={mIdx}
                                                    className="px-1 py-0.5 rounded bg-black/80 border border-amber-400/45 text-[8px] font-bold text-amber-200 truncate max-w-[105px]"
                                                  >
                                                    {m.icon} {m.label}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                  </div>

                                  {/* Número discreto na base longe dos cristais dos cantos + radar de Carta Especial Oculta */}
                                  <div className="pb-0.5 flex flex-col items-center gap-1">
                                    {hasRadarPulse && (
                                      <span className="px-2 py-0.5 rounded-full bg-fuchsia-950/95 border border-fuchsia-300/80 text-[9px] font-black text-fuchsia-200 shadow-[0_0_12px_rgba(232,121,249,0.75)] animate-pulse">
                                        🕵️ Carta Especial Oculta
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full bg-black/75 border border-white/15 text-[9px] font-black uppercase tracking-widest text-white/75">
                                      Carta #{card.seat}
                                    </span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* ===================== FRENTE (FILME OU CARTA ESPECIAL ATIVADA) ===================== */}
                          <div
                            className={`secret-card-face secret-card-face-front rounded-[18px] border-2 ${suit.borderFrame} bg-gradient-to-b ${suit.frontGradient} ${suit.glowShadow} overflow-hidden flex flex-col`}
                          >
                            {isSpecialFront ? (
                              (() => {
                                const frontMeta = getSpecialCardDisplayMeta(
                                  card.specialEvent,
                                  specialCatalogList
                                );
                                const frontImgUrl = resolveSpecialCardPrimaryUrl(
                                  card.specialEvent,
                                  specialCatalogList
                                );
                                return (
                                  <>
                                    <img
                                      src={getSecretCardUrl(frontImgUrl)}
                                      alt={frontMeta.title}
                                      className={`w-full h-full object-cover ${
                                        card.specialEvent.rarity === 'cursed' ? 'bg-zinc-950' : 'bg-white'
                                      }`}
                                    />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black via-black/55 to-transparent" />
                                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                                      <span
                                        className={`px-2 py-0.5 rounded-full border text-[9px] font-black shadow ${
                                          card.specialEvent.rarity === 'cursed'
                                            ? 'bg-rose-700/90 border-rose-300/65 text-white'
                                            : 'bg-zinc-950/90 border-amber-300/70 text-amber-200'
                                        }`}
                                      >
                                        {isSpecialTriggered
                                          ? card.specialEvent.rarity === 'cursed'
                                            ? '🩸 MALDIÇÃO'
                                            : '✦ ARLEQUIM'
                                          : '👁️ LAB: ESPECIAL'}
                                      </span>
                                    </div>
                                    <div className="absolute bottom-2 inset-x-2 text-center">
                                      <div className="text-xs font-black text-white drop-shadow">
                                        {card.specialEvent.icon} {frontMeta.title}
                                      </div>
                                      <div className="text-[9.5px] font-semibold text-amber-200 truncate">
                                        {card.specialEvent.shortTag}
                                      </div>
                                    </div>
                                  </>
                                );
                              })()
                            ) : (
                              <>
                            {/* Pôster Full-Bleed dentro da carta */}
                            {card.resolved?.posterUrl ? (
                              <img
                                src={card.resolved.posterUrl}
                                alt={card.resolved.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                                <Film className="w-12 h-12 text-zinc-700" />
                              </div>
                            )}

                            {/* Brilho Foil Diagonal ao Revelar */}
                            <div
                              key={`foil_${burstKey}`}
                              className="secret-foil-sweep pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                            />

                            {/* Vinheta cinematográfica legível */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/70" />

                            {/* Moldura interior de baralho sobre o pôster */}
                            <div className={`relative z-10 flex-1 m-2 rounded-xl border ${suit.innerFrame} p-2 flex flex-col justify-between`}>
                              {/* Topo: Valor/Naipe Esquerdo (Ex: 7 ♥, 10 ♦) + Selo XP Direito */}
                              <div className="flex items-start justify-between gap-1">
                                <div className="px-1.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-amber-200/25 flex flex-col items-center leading-none">
                                  <span className={`text-sm font-black font-serif ${suit.accentText}`}>{deckMeta.rank}</span>
                                  <span className={`text-xs ${suit.accentText}`}>{deckMeta.symbol}</span>
                                </div>

                                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full border backdrop-blur-sm ${cardReward.isGold ? 'bg-amber-400/25 border-amber-300/75 text-amber-200' : suit.xpChip}`}>
                                  {cardReward.short}
                                </span>
                              </div>

                              {isPickedInRound && (
                                <div className="my-auto flex justify-center">
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg border border-emerald-200">
                                    ✓ Na Fila
                                  </span>
                                </div>
                              )}

                              {/* Base: Título, Ano & Contador dos Marcos Revelados */}
                              <div className={`flex flex-col gap-1 mt-auto ${isLargeHand ? 'pt-2' : 'pt-8'}`}>
                                <div className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 flex items-center gap-1 flex-wrap">
                                  <span>{suit.suit} {card.difficultyLabel}</span>
                                  <span>•</span>
                                  <span className="font-mono">{card.resolved?.releaseYear || '?'}</span>
                                  {card.resolved?.sagaRedirect && (
                                    <span className="ml-auto px-1.5 py-0.5 rounded bg-indigo-500/40 border border-indigo-300/50 text-[9px] text-indigo-100">
                                      📚 Cap. #{card.resolved.sagaRedirect.redirectedOrder}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm font-black text-white leading-tight line-clamp-2 drop-shadow">
                                  {card.resolved?.title}
                                </h3>
                                <div className="flex items-center justify-between gap-1 pt-0.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20">
                                    🎯 {card.totalMilestonesCount} marco{card.totalMilestonesCount === 1 ? '' : 's'}
                                  </span>
                                  <div className="px-1.5 py-0.5 rounded-md bg-black/80 border border-amber-200/20 flex flex-col items-center leading-none rotate-180">
                                    <span className={`text-xs font-black font-serif ${suit.accentText}`}>{deckMeta.rank}</span>
                                    <span className={`text-[10px] ${suit.accentText}`}>{deckMeta.symbol}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Status discreto quando aceita na fila OU especial ativada */}
                      {isSpecialTriggered && (
                        <button
                          type="button"
                          onClick={() => handleCardClick(card)}
                          className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/90 text-slate-950 border border-amber-200 shadow cursor-pointer hover:brightness-110"
                        >
                          🔥 Ver Carta Especial
                        </button>
                      )}
                      {isPickedInRound && !isSpecialTriggered && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-slate-950 border border-emerald-200 shadow">
                            🔒 Na Fila
                          </span>
                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => handleReplaySeatAnim(card)}
                            className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/60 hover:bg-black/80 text-cyan-200 border border-cyan-400/40 cursor-pointer"
                            title="Rever a animação visual de virada"
                          >
                            ⚡
                          </button>
                        </div>
                      )}
                    </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          PALCO DE PRÉ-VISUALIZAÇÃO DA CARTA VIRADA NA MESA
         ===================================================================== */}
      {spotlightCard && (spotlightCard.specialEvent ? (spotlightCard.specialEvent.triggered || effectiveLabTransparent) : true) && (
        (() => {
          const focusCard = spotlightCard;
          const suit = SUIT_META[focusCard.difficulty] || SUIT_META.common;
          const focusIsPicked = currentRoundPickedSeats.includes(Number(focusCard.seat));

          if (focusCard.specialEvent) {
            const sp = focusCard.specialEvent;
            const sMeta = SPECIAL_RARITY_META[sp.rarity] || SPECIAL_RARITY_META.rare;
            const spDisplay = getSpecialCardDisplayMeta(sp, specialCatalogList);
            const spGallery = getSpecialCardArtGallery(sp, specialCatalogList);
            const safeSpIdx = Math.min(spotlightArtIdx, Math.max(0, spGallery.length - 1));
            const activeSpArt = spGallery[safeSpIdx]?.url || resolveSpecialCardPrimaryUrl(sp, specialCatalogList);
            return (
              <section className={`rounded-3xl border-2 ${suit.borderFrame} bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 p-4 sm:p-5 shadow-2xl`}>
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={`w-28 sm:w-32 rounded-2xl overflow-hidden border-2 border-amber-300/40 shadow-2xl ${
                        sp.rarity === 'cursed' && safeSpIdx === 0 ? 'bg-zinc-950' : 'bg-white'
                      }`}
                    >
                      <img
                        src={getSecretCardUrl(activeSpArt)}
                        alt={spDisplay.title}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                    </div>
                    {spGallery.length > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-1 max-w-[140px]">
                        {spGallery.map((art, aIdx) => (
                          <button
                            key={art.url}
                            type="button"
                            onClick={() => setSpotlightArtIdx(aIdx)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                              safeSpIdx === aIdx
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                            }`}
                            title={`Ver arte: ${art.label}`}
                          >
                            {art.kind === 'arlequim' ? 'Arl' : art.kind === 'alt' ? 'Alt' : `C${aIdx}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${sMeta.badgeClass}`}>
                        {sMeta.icon} {sMeta.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-500/20 text-amber-200 border border-orange-400/45">
                        Carta #{focusCard.seat} • Evento Puro
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {sp.icon} {spDisplay.title}
                    </h2>
                    {spDisplay.quote && (
                      <p className="text-xs italic text-amber-200/85 border-l-2 border-amber-400/45 pl-2.5">
                        “{spDisplay.quote}”
                      </p>
                    )}
                    <p className="text-sm text-zinc-300 leading-relaxed">{spDisplay.description}</p>
                    {sp.resultSummary && (
                      <div className="rounded-xl bg-black/55 border border-white/15 px-3 py-2 text-xs font-bold text-emerald-200">
                        {sp.resultSummary}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section className={`rounded-3xl border-2 ${suit.borderFrame} bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 p-4 sm:p-5 shadow-2xl`}>
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                <div className="w-28 sm:w-32 shrink-0 rounded-2xl overflow-hidden border-2 border-white/15 bg-zinc-900 shadow-2xl mx-auto lg:mx-0">
                  {focusCard.resolved?.posterUrl ? (
                    <img
                      src={focusCard.resolved.posterUrl}
                      alt={focusCard.resolved.title}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 sm:h-48 flex items-center justify-center text-zinc-600">
                      <Film className="w-9 h-9" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  {(() => {
                    const focusRw = getSecretRewardMeta(focusCard);
                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${suit.badge}`}>
                          {suit.suit} Carta #{focusCard.seat} • {focusCard.difficultyLabel}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border flex items-center gap-1 ${focusRw.badgeCls}`}>
                          <Sparkles className="w-3 h-3" /> {focusRw.short}
                        </span>
                        {focusIsPicked && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-200 border border-emerald-400/55">
                            ✓ Selecionada p/ Fila
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {focusCard.resolved?.title}{' '}
                      {focusCard.resolved?.releaseYear && (
                        <span className="text-zinc-400 font-mono text-lg">
                          ({focusCard.resolved.releaseYear})
                        </span>
                      )}
                    </h2>
                    {focusCard.resolved?.originalTitle &&
                      focusCard.resolved.originalTitle !== focusCard.resolved.title && (
                        <div className="text-xs text-zinc-400 italic mt-0.5">
                          Título original: {focusCard.resolved.originalTitle}
                        </div>
                      )}
                  </div>

                  {/* Linha da planilha vs Achado */}
                  <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      <strong className="text-zinc-400">Planilha (L#{focusCard.planilha.sourceRow}):</strong>{' '}
                      <span className="text-fuchsia-200 font-mono">
                        {focusCard.planilha.rawTitle}
                        {focusCard.planilha.rawYearStr ? ` (${focusCard.planilha.rawYearStr})` : ''}
                      </span>
                    </span>
                    {focusCard.planilha.notesExtracted && (
                      <span className="text-amber-300 font-mono">Obs: {focusCard.planilha.notesExtracted}</span>
                    )}
                    {focusCard.resolved?.countries?.length > 0 && (
                      <span className="text-zinc-300">🌍 {focusCard.resolved.countries.join(', ')}</span>
                    )}
                    {focusCard.resolved?.directors?.length > 0 && (
                      <span className="text-zinc-300">🎬 {focusCard.resolved.directors.join(', ')}</span>
                    )}
                  </div>

                  {/* Aviso de Redirecionamento de Saga (só revelado após virar/escolher!) */}
                  {focusCard.resolved?.sagaRedirect && (
                    <div className="rounded-2xl bg-indigo-500/12 border border-indigo-400/40 px-3 py-2 text-xs text-indigo-100 flex items-start gap-2">
                      <span className="text-base leading-none mt-0.5">📚</span>
                      <div className="min-w-0">
                        <div className="font-black text-indigo-200 uppercase tracking-wider text-[10px]">
                          Ordem de Saga — Começando do Início ({focusCard.resolved.sagaRedirect.sagaTitle})
                        </div>
                        <div className="text-zinc-200 mt-0.5">
                          Sua planilha sorteou{' '}
                          <strong className="text-white">“{focusCard.resolved.sagaRedirect.originalTitle}”</strong>{' '}
                          (Cap. #{focusCard.resolved.sagaRedirect.originalOrder}), então ajustamos automaticamente para o{' '}
                          <strong className="text-amber-300">
                            Capítulo #{focusCard.resolved.sagaRedirect.redirectedOrder} ({focusCard.resolved.title})
                          </strong>{' '}
                          que ainda não foi assistido!
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Segredos Revelados (Os Marcos que estavam ocultos!) */}
                  <div className="flex flex-col gap-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                      🔓 Segredos Revelados ao Virar ({focusCard.milestones?.length || 0} Marcos):
                    </div>
                    {focusCard.milestones?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {focusCard.milestones.map((m, i) => (
                          <div
                            key={i}
                            className="rounded-xl bg-zinc-950/85 border border-zinc-800 px-2.5 py-1.5 flex items-start gap-2"
                          >
                            <span className="text-sm leading-none mt-0.5">{m.icon}</span>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-zinc-100">{m.label}</div>
                              <div className="text-[10px] text-zinc-400 truncate">{m.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-400 italic">
                        Nenhum marco objetivo escondido nesta carta — foco livre para dar sua nota, tags e curtir o filme!
                      </div>
                    )}
                  </div>

                  {/* Status na Fila ou Finalizar Escolha */}
                  {(() => {
                    const focusBtnRw = getSecretRewardMeta(focusCard);
                    return (
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {focusIsPicked ? (
                      <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/50">
                        <Lock className="w-4 h-4" />
                        🔒 Carta #{focusCard.seat} travada na sua fila abaixo ({focusBtnRw.short} ao cadastrar)
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={acting || activeWatchCount >= activeWatchLimit}
                        onClick={() => handleAcceptMysteryCard(currentRound.id, focusCard)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        Aceitar Carta #{focusCard.seat} na Fila ({focusBtnRw.short})
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => handleFinishSelection(currentRound.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/40 cursor-pointer disabled:opacity-50"
                    >
                      ✅ Finalizar Escolha ({currentRoundPickedSeats.length} na fila)
                    </button>
                  </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          );
        })()
      )}

      {/* MESA VAZIA ANTES DO PRIMEIRO SORTEIO OU QUANDO AS FICHAS ACABARAM */}
      {!drawing && !previewShuffling && !currentRound && (
        isDeckClosedOutOfChips ? (
          <section className="rounded-[2rem] border-2 p-7 sm:p-10 flex flex-col items-center justify-center text-center gap-5 shadow-2xl border-amber-400/30 bg-gradient-to-br from-[#0a090e] via-[#121017] to-[#070a09]">
            <SecretDrawCycleRestDisplay
              weekKey={chipsWallet.weekKey}
              outOfChips={true}
              hasQueuedMovies={hasQueuedOrPendingSecretMovies}
            />

            <div className="max-w-xl flex flex-col items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {hasQueuedOrPendingSecretMovies
                  ? 'O Arlequim fechou a banca — sem mais fichas por agora!'
                  : 'Você viu todos os filmes que o Arlequim sorteou — parabéns!'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300/85 leading-relaxed">
                {hasQueuedOrPendingSecretMovies ? (
                  <>
                    O Arlequim embaralhou tudo que podia em{' '}
                    <strong className="text-amber-300">
                      {formatCycleKeyLabel(chipsWallet.weekKey, { fallback: 'temporada' })}
                    </strong>{' '}
                    e trancou o baralho no cofre de veludo. Suas fichas acabaram por enquanto, mas{' '}
                    <strong className="text-emerald-300">os {activeWatchCount} filme(s) já escolhidos</strong> continuam esperando você na fila abaixo!
                  </>
                ) : (
                  <>
                    Espero que tenha gostado… ou não. Será que o Arlequim se importa? O baralho da{' '}
                    <strong className="text-amber-300">
                      {formatCycleKeyLabel(chipsWallet.weekKey, { fallback: 'temporada' })}
                    </strong>{' '}
                    já está guardado no cofre de veludo — aproveite o catálogo até a próxima recarga!
                  </>
                )}
              </p>
            </div>

            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
              <div className="rounded-2xl border bg-black/45 px-3.5 py-2.5 flex items-center gap-2.5 border-amber-400/25">
                <span className="w-8 h-8 rounded-xl border flex items-center justify-center text-base shrink-0 bg-amber-500/15 border-amber-400/35">
                  🎟️
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
                    Fichas &amp; Fila
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    0/{maxChipsBank} fichas • Fila {activeWatchCount}/{activeWatchLimit}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-400/35 bg-black/45 px-3.5 py-2.5 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-base shrink-0">
                  🏆
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
                    Cartas Catalogadas
                  </div>
                  <div className="text-xs font-black text-amber-200 truncate">
                    {Number(pool.completedCount || 0)} filme(s) • +{Number(xpSummary.totalXp || 0).toLocaleString('pt-BR')} XP
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-400/35 bg-black/45 px-3.5 py-2.5 flex items-center gap-2.5">
                <CalendarClock className="w-8 h-8 p-1.5 rounded-xl bg-sky-500/15 border border-sky-400/35 text-sky-300 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300/90">
                    Próxima Recarga
                  </div>
                  <div className="text-[11px] font-black text-sky-100 truncate" title={chipsWallet.nextResetLabel}>
                    {chipsWallet.nextResetLabel}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold shadow-inner border-amber-400/30 bg-zinc-950/90 text-zinc-200">
                <Lock className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>
                  Baralho selado •{' '}
                  {nextSecretCountdownLabel ? (
                    <strong className="text-amber-200">{nextSecretCountdownLabel}</strong>
                  ) : (
                    <>
                      Recarga em <strong className="text-amber-200">{chipsWallet.nextResetLabel}</strong>
                    </>
                  )}
                </span>
              </div>
              {showLabTools && (
                <button
                  type="button"
                  onClick={handlePreviewShuffleOnly}
                  className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider bg-black/55 hover:bg-black/75 text-amber-200 border border-amber-400/40 cursor-pointer"
                >
                  🃏 Testar Embaralhar
                </button>
              )}
            </div>
          </section>
        ) : (
          <section
            className="rounded-[2rem] border-2 p-8 flex flex-col items-center justify-center text-center gap-3.5 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] border-amber-400/20"
            style={{
              background: 'radial-gradient(ellipse at center, #0b221a 0%, #05110d 56%, #030706 100%)',
            }}
          >
            <div className="w-24 h-36 rounded-2xl border-2 border-amber-300/70 bg-[#120820] overflow-hidden shadow-2xl">
              <img
                src={SECRET_DECK_BACK_IMAGE}
                alt="Baralho da Sessão Secreta"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                A mesa do Arlequim está pronta para a próxima aposta.
              </h3>
              <p className="text-xs text-emerald-100/75 max-w-md mt-1">
                {activeWatchCount >= activeWatchLimit ? (
                  <span>
                    Sua fila atingiu o máximo de <strong>{activeWatchCount}/{activeWatchLimit} filmes</strong>. Cadastre ou decline um filme na grade abaixo para liberar vagas!
                  </span>
                ) : (
                  <span>
                    Você tem <strong>{chipsRemaining}/{maxChipsBank} ficha(s)</strong> (ganha {chipsAllowance} nos dias 1 e 15 do mês) e <strong>{activeWatchLimit - activeWatchCount} vaga(s)</strong> na fila. Ao sortear, lembre-se: clicou na carta, vai direto para a fila!
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={activeWatchCount >= activeWatchLimit || chipsRemaining <= 0 || acting}
                onClick={handleDrawCards}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 shadow cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950"
              >
                🎲 Embaralhar &amp; Sortear (3–10)
              </button>
              {showLabTools && (
                <button
                  type="button"
                  onClick={handlePreviewShuffleOnly}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-black/55 hover:bg-black/75 text-amber-200 border border-amber-400/40 cursor-pointer"
                >
                  🃏 Testar Embaralhar
                </button>
              )}
            </div>
          </section>
        )
      )}

      {/* BANNER DOURADO: CARTAS CONCLUÍDAS PRONTAS PARA COLHER */}
      {readyToClaimPicks.length > 0 && (() => {
        const readyXpSum = readyToClaimPicks.reduce(
          (acc, p) => acc + (getSecretRewardMeta(p).isGold ? 0 : getSecretRewardMeta(p).amount),
          0
        );
        const readyGoldSum = readyToClaimPicks.reduce(
          (acc, p) => acc + (getSecretRewardMeta(p).isGold ? getSecretRewardMeta(p).amount : 0),
          0
        );
        return (
        <section className="rounded-3xl border-2 border-amber-300/75 bg-gradient-to-br from-amber-950/65 via-zinc-950 to-emerald-950/50 p-4 sm:p-5 flex flex-col gap-3 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <h2 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wide">
                🃏 Cartas Concluídas — Prontas para Colher ({readyToClaimPicks.length})
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-200/90">
              Total pronto:{' '}
              {[readyXpSum > 0 ? `+${readyXpSum} XP` : null, readyGoldSum > 0 ? `+${readyGoldSum} 🪙` : null]
                .filter(Boolean)
                .join(' • ') || '+0 XP'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {readyToClaimPicks.map((pick) => {
              const pCard = pick.card;
              const pRw = getSecretRewardMeta(pick);
              return (
                <div
                  key={`ready_${pick.id}`}
                  className="rounded-2xl border border-amber-300/45 bg-black/55 p-3 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPickId(pick.id);
                      setMiniCatalogFilter('ready_to_claim');
                    }}
                    className="min-w-0 text-left flex-1 cursor-pointer hover:opacity-90"
                  >
                    <div className="text-xs font-black text-white truncate">
                      {pCard?.resolved?.title || pick.movieKey}
                    </div>
                    <div className="text-[10px] font-mono text-amber-200/85">
                      {pCard?.difficultyLabel || pick.difficulty} • {pRw.short} aguardando
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleClaimPick(pick.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 shadow cursor-pointer disabled:opacity-50"
                  >
                    {pRw.isGold ? `🪙 ${pRw.short}` : `✨ ${pRw.short}`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
        );
      })()}

      {/* =====================================================================
          EM BAIXO: PEQUENO CATÁLOGO — FILA PARA ASSISTIR (CARDS MENORES)
         ===================================================================== */}
      {miniCatalogEntries.length > 0 && (
        <section className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950 p-5 sm:p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Pequeno Catálogo — Fila da Sessão Secreta</span>
                </h2>
                <span
                  className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                    activeWatchCount >= activeWatchLimit
                      ? 'bg-rose-500/20 border-rose-400/60 text-rose-200'
                      : 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200'
                  }`}
                >
                  {activeWatchCount}/{activeWatchLimit} p/ assistir
                </span>
              </div>

              {/* Barra Visual dos 10 Slots da Fila (Declinados não contam!) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  {Array.from({ length: activeWatchLimit }).map((_, slotIdx) => {
                    const filled = slotIdx < activeWatchCount;
                    return (
                      <span
                        key={slotIdx}
                        className={`w-4 h-1.5 rounded-full transition-all ${
                          filled
                            ? activeWatchCount >= activeWatchLimit
                              ? 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.75)]'
                              : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]'
                            : 'bg-zinc-800'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] text-zinc-400">
                  Declinados, Bumerangues e catalogados não contam no limite de {activeWatchLimit}.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `Todas (${miniCatalogEntries.length})` },
                { id: 'ready_to_claim', label: `✨ P/ Colher (${readyToClaimPicks.length})` },
                { id: 'active', label: `🔥 P/ Assistir (${miniCatalogEntries.filter((x) => x.status === 'active').length})` },
                { id: 'completed', label: `✅ Catalogadas (${miniCatalogEntries.filter((x) => x.status === 'completed').length})` },
                { id: 'boomerang', label: `🪃 Bumerangue (${miniCatalogEntries.filter((x) => x.status === 'boomerang').length})` },
                { id: 'declined', label: `✂️ Declinadas (${miniCatalogEntries.filter((x) => x.status === 'declined').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMiniCatalogFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                    miniCatalogFilter === tab.id
                      ? 'bg-amber-400 text-slate-950 border-amber-200 shadow'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* PAINEL COMPACTO DO CARD SELECIONADO NA GRADE (AÇÕES, MARCOS E DECLÍNIO) */}
          {focusedPick && (() => {
            const fCard = focusedPick.card;
            const fStatus = focusedPick.status;
            const fDiff = focusedPick.difficulty || fCard?.difficulty || 'common';
            const suit = SUIT_META[fDiff] || SUIT_META.common;
            const isActiveMission = fStatus === 'active';
            const isReadyToClaimItem = fStatus === 'ready_to_claim';
            const isDecliningNow = Number(decliningPickId) === Number(focusedPick.id);
            const isReturningNow = Number(boomerangingPickId) === Number(focusedPick.id);
            const isDeclinedItem = fStatus === 'declined';
            const isBoomerangItem = fStatus === 'boomerang';
            const isDismissedItem = isDeclinedItem || isBoomerangItem;
            const isCompletedItem = fStatus === 'completed';
            const isJustEntered = Number(justSelectedPickId) === Number(focusedPick.id);

            return (
              <div
                key={`pick_focus_${focusedPick.id}`}
                className={`relative overflow-hidden rounded-2xl border ${
                  isDeclinedItem
                    ? 'border-zinc-700 bg-zinc-950/90'
                    : isBoomerangItem
                      ? 'border-sky-500/45 bg-gradient-to-br from-sky-950/55 via-zinc-950 to-indigo-950/45'
                      : isReadyToClaimItem
                        ? 'border-amber-300/80 bg-gradient-to-br from-amber-950/55 via-zinc-950 to-emerald-950/45 shadow-[0_0_24px_rgba(251,191,36,0.2)]'
                        : isCompletedItem
                          ? 'border-emerald-400/70 bg-gradient-to-br from-emerald-950/55 via-zinc-950 to-teal-950/40 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                          : `${suit.borderFrame} bg-gradient-to-br ${suit.frontGradient}`
                } p-3.5 sm:p-4 ${isJustEntered ? 'secret-catalog-enter' : ''}`}
              >
                {!isDismissedItem && (
                  <div className="secret-aura-sweep pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}

                {/* Efeito visual de Declínio Dimensional na faixa de detalhes */}
                {isDecliningNow && (
                  <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/65 backdrop-blur-[1px]">
                    <div className="secret-decline-slash-line w-full h-1.5 bg-gradient-to-r from-transparent via-rose-400 to-fuchsia-300 shadow-[0_0_24px_rgba(244,63,94,0.95)]" />
                    <div className="secret-decline-vortex-portal absolute w-24 h-24 rounded-full border-4 border-dashed border-fuchsia-400 bg-rose-500/20 shadow-[0_0_35px_rgba(232,121,249,0.85)] flex items-center justify-center">
                      <span className="text-2xl">🌀</span>
                    </div>
                  </div>
                )}

                {/* Efeito visual Bumerangue na faixa de detalhes (retorno em arco pro baralho) */}
                {isReturningNow && (
                  <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-slate-950/65 backdrop-blur-[1px]">
                    <div className="secret-boomerang-ring absolute w-24 h-24 rounded-full border-4 border-dashed border-sky-300 bg-sky-500/20 shadow-[0_0_35px_rgba(56,189,248,0.85)] flex items-center justify-center">
                      <span className="text-2xl">🪃</span>
                    </div>
                  </div>
                )}

                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start">
                  <div className={`w-20 sm:w-24 shrink-0 ${isDeclinedItem ? 'rounded-xl overflow-hidden border border-zinc-700' : isBoomerangItem ? 'rounded-xl overflow-hidden border border-sky-400/50' : `secret-rarity-shell ${suit.shellClass}`}`}>
                    <div className="relative z-10 rounded-[14px] overflow-hidden bg-zinc-950">
                      {fCard?.resolved?.posterUrl ? (
                        <img
                          src={fCard.resolved.posterUrl}
                          alt={fCard.resolved.title}
                          className={`w-full h-28 sm:h-36 object-cover ${
                            isDeclinedItem
                              ? 'grayscale contrast-125 brightness-60'
                              : isBoomerangItem
                                ? 'opacity-85 brightness-75 saturate-75'
                                : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-28 sm:h-36 flex items-center justify-center text-zinc-600">
                          <Film className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    {(() => {
                      const focusedRw = getSecretRewardMeta(focusedPick);
                      return (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${suit.badge}`}>
                        {suit.suit} {fCard?.difficultyLabel || fDiff}
                      </span>
                      {isReadyToClaimItem && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-amber-400/25 text-amber-200 border border-amber-300/80 animate-pulse">
                          {focusedRw.isGold ? `🪙 ${focusedRw.short} Pronto p/ Colher!` : `✨ ${focusedRw.short} Pronto para Colher!`}
                        </span>
                      )}
                      {isActiveMission && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-amber-500/20 text-amber-200 border border-amber-400/55">
                          🔒 {focusedRw.short} Travado
                        </span>
                      )}
                      {isCompletedItem && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-emerald-400/20 text-emerald-200 border border-emerald-300/75 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                          🏆 MISSÃO CUMPRIDA • {focusedRw.short} COLHIDO
                        </span>
                      )}
                      {isBoomerangItem && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-500/20 text-sky-200 border border-sky-400/50">
                          🪃 Devolvida ao Baralho (Pode sair de novo!)
                        </span>
                      )}
                      {isDeclinedItem && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-zinc-800 text-zinc-300 border border-zinc-600">
                          ✂️ Descartada no Vórtice
                        </span>
                      )}
                      {fCard?.twoFaceDoubled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/25 text-amber-200 border border-amber-300/60">
                          🪙 2× Rei Duas-Caras (Cara)
                        </span>
                      )}
                      {fCard?.halfXpCursed && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/25 text-rose-200 border border-rose-400/60">
                          {focusedRw.isGold ? '🩸 -50% Tributo (7 ♦)' : '💔 0.5× Maldição'}
                        </span>
                      )}
                      {fCard?.goldConvertedByJack && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/25 text-amber-200 border border-amber-300/65">
                          🪙 Valete de Ouros (+15% 🪙)
                        </span>
                      )}
                      {fCard?.goldConvertedByQueen && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/30 text-yellow-200 border border-amber-300/75 shadow-[0_0_12px_rgba(251,191,36,0.25)]">
                          👑 Toque Dourado (+25% 🪙)
                        </span>
                      )}
                      {fCard?.transmutedByBazaar && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-200 border border-amber-300/60">
                          ⚖️ Transmutada pelo Selo do Bazar
                        </span>
                      )}
                      {fCard?.boomerangLocked && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-950/80 text-rose-200 border border-rose-400/60">
                          ⛓️ Bumerangue Travado
                        </span>
                      )}
                      {fCard?.rarityChangedFrom && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-300/50">
                          ⚗️ Raridade alterada ({SUIT_META[fCard.rarityChangedFrom]?.suit || ''} → {suit.suit})
                        </span>
                      )}
                      {fCard?.portalHarvested && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-200 border border-cyan-400/55">
                          🌀 Portal Colheu Prêmio &amp; Devolveu ao Baralho
                        </span>
                      )}
                    </div>
                      );
                    })()}

                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {fCard?.resolved?.title}{' '}
                        {fCard?.resolved?.releaseYear && (
                          <span className="text-zinc-400 font-mono text-sm">({fCard.resolved.releaseYear})</span>
                        )}
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Rodada #{focusedPick.roundId} • Carta #{focusedPick.seat}
                      </span>
                    </div>

                    {(fCard?.resolved?.directors?.length > 0 || fCard?.resolved?.countries?.length > 0 || fCard?.resolved?.runtime) && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                        {fCard?.resolved?.directors?.length > 0 && (
                          <span>🎬 {fCard.resolved.directors.join(', ')}</span>
                        )}
                        {fCard?.resolved?.countries?.length > 0 && (
                          <span>🌍 {fCard.resolved.countries.join(', ')}</span>
                        )}
                        {fCard?.resolved?.runtime && (
                          <span>⏱️ {fCard.resolved.runtime} min</span>
                        )}
                      </div>
                    )}

                    {fCard?.resolved?.synopsis && (
                      <div className="rounded-xl bg-black/45 border border-white/10 px-3 py-2 text-xs text-zinc-300 leading-relaxed">
                        <p ref={synopsisTextRef} className={synopsisExpanded ? '' : 'line-clamp-2'}>
                          <span className="font-black uppercase tracking-wider text-[10px] text-amber-300/90 mr-1.5">
                            📖 Sinopse:
                          </span>
                          {fCard.resolved.synopsis}
                        </p>
                        {(isSynopsisClamped || synopsisExpanded) && (
                          <button
                            type="button"
                            onClick={() => setSynopsisExpanded((v) => !v)}
                            className="mt-1 text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
                          >
                            {synopsisExpanded ? 'Mostrar menos ▲' : 'Ler sinopse completa ▼'}
                          </button>
                        )}
                      </div>
                    )}

                    {isDeclinedItem && focusedPick.declineReason && (
                      <div className="rounded-xl bg-black/50 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300">
                        <strong>Motivo do declínio:</strong> {focusedPick.declineReason}
                      </div>
                    )}

                    {isBoomerangItem && focusedPick.declineReason && (
                      <div className="rounded-xl bg-sky-950/50 border border-sky-500/40 px-3 py-1.5 text-xs text-sky-200">
                        <strong>🪃 Passe Bumerangue:</strong> {focusedPick.declineReason} • O filme voltou ao baralho e continua sorteável!
                      </div>
                    )}

                    {fCard?.resolved?.sagaRedirect && (
                      <div className="rounded-xl bg-indigo-500/15 border border-indigo-400/40 px-2.5 py-1.5 text-[11px] text-indigo-100">
                        📚 <strong>Saga ({fCard.resolved.sagaRedirect.sagaTitle}):</strong> sorteado <em>“{fCard.resolved.sagaRedirect.originalTitle}”</em> (#{fCard.resolved.sagaRedirect.originalOrder}) → <strong>Cap. #{fCard.resolved.sagaRedirect.redirectedOrder}</strong>.
                      </div>
                    )}

                    {fCard?.milestones?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {fCard.milestones.map((m, idx) => (
                          <span
                            key={idx}
                            title={m.detail}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/50 border border-white/10 text-[10px] font-bold text-zinc-200"
                          >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {isReadyToClaimItem && (() => {
                      const focusedClaimRw = getSecretRewardMeta(focusedPick);
                      return (
                      <div className="rounded-2xl border border-amber-300/60 bg-amber-500/15 p-3 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="text-xs text-amber-100">
                          <strong>🎬 Missão Concluída!</strong>{' '}
                          {focusedClaimRw.isGold
                            ? 'Este filme já entrou no catálogo. Colete suas Moedas para o Bazar e reabra a vaga da fila:'
                            : 'Este filme já entrou no catálogo. Colete seu XP e reabra a vaga da fila:'}
                        </div>
                        <button
                          type="button"
                          disabled={acting}
                          onClick={() => handleClaimPick(focusedPick.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.45)] cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Colher {focusedClaimRw.short} Agora!
                        </button>
                      </div>
                      );
                    })()}

                    {isActiveMission && (() => {
                      const focusedActiveRw = getSecretRewardMeta(focusedPick);
                      return (
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenAddMovieForSecretCard && onOpenAddMovieForSecretCard(fCard)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cadastrar no Catálogo ({focusedActiveRw.short})
                          </button>

                          {Number(bazaarProfile?.tacticalCharges?.secret_transmute || 0) > 0 && (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={acting || actingBazaarPower}
                                onClick={() => handleUseSecretBazaarPower('transmute_pick', focusedPick.id)}
                                title="Inverte esta carta entre XP (⚡) e Ouro do Bazar (🪙)"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-300/60 cursor-pointer disabled:opacity-45"
                              >
                                ⚖️ {focusedActiveRw.isGold ? 'Virar XP (⚡)' : 'Virar Ouro (🪙)'} ({bazaarProfile.tacticalCharges.secret_transmute}×)
                              </button>
                              <PowerHelpButton helpKey="secret_transmute" size="xs" />
                            </div>
                          )}

                          {showLabTools && (
                            <button
                              type="button"
                              disabled={acting}
                              onClick={() => handleLabCompletePick(focusedPick.id)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-violet-500/20 hover:bg-violet-500/35 text-violet-200 border border-violet-400/50 cursor-pointer disabled:opacity-50"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              Concluir Lab ({focusedActiveRw.short})
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={acting || boomerangChipsRemaining <= 0 || Boolean(fCard?.boomerangLocked)}
                            onClick={() => {
                              setIsBoomerangOpen((v) => !v);
                              setIsDeclineOpen(false);
                            }}
                            title={
                              fCard?.boomerangLocked
                                ? '⛓️ Esta carta foi acorrentada (Corrente do Destino / Coroa) e não pode usar o Passe Bumerangue!'
                                : boomerangChipsRemaining <= 0
                                  ? `Suas Fichas Bumerangue acabaram (${boomerangAllowance} nos dias 1 e 15 do mês, máx. ${maxBoomerangBank})! Recarrega ${chipsWallet.nextResetLabel}.`
                                  : 'Tira da sua fila agora e devolve ao baralho para poder sair novamente depois (não queima o filme).'
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/50 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            <span>{fCard?.boomerangLocked ? '⛓️' : '🪃'}</span>
                            {fCard?.boomerangLocked
                              ? 'Bumerangue Travado'
                              : isBoomerangOpen
                                ? 'Cancelar Bumerangue'
                                : `Passe Bumerangue (${boomerangChipsRemaining}/${maxBoomerangBank})`}
                          </button>

                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => {
                              setIsDeclineOpen((v) => !v);
                              setIsBoomerangOpen(false);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/45 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {isDeclineOpen ? 'Cancelar' : 'Declinar'}
                          </button>

                          {activePowerSpec &&
                            (activePowerSpec.actionType === 'pick_card' ||
                              activePowerSpec.actionType === 'pick_card_or_buff') && (
                              <button
                                type="button"
                                disabled={
                                  acting ||
                                  actingClassPower ||
                                  secretPowerCharges <= 0 ||
                                  !isPickEligibleForSecretPower(focusedPick)
                                }
                                onClick={() => handleActivateSecretClassPower(focusedPick.id)}
                                title={
                                  !isPickEligibleForSecretPower(focusedPick)
                                    ? 'Esta carta já está no grau máximo ★ Exótico!'
                                    : activePowerSpec.desc
                                }
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-500/30 to-amber-400/25 hover:from-fuchsia-500/45 hover:to-amber-400/40 text-amber-100 border border-amber-400/55 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                {activePowerSpec.title}: Usar neste Filme ({secretPowerCharges}/{maxSecretPowerCharges})
                              </button>
                            )}
                        </div>

                        {isBoomerangOpen && (
                          <div className="rounded-xl border border-sky-400/45 bg-sky-950/35 p-2.5 flex flex-col gap-2">
                            <p className="text-[11px] text-sky-100/90 leading-snug">
                              🪃 <strong>Não quer ver agora sem queimar o filme?</strong> Sai da fila hoje (libera 1 vaga), usa{' '}
                              <strong>1 Ficha Bumerangue</strong> ({boomerangChipsRemaining}/{maxBoomerangBank} acumulados • +{boomerangAllowance} nos dias 1 e 15) e{' '}
                              <strong>volta pro baralho</strong> para poder ser sorteado de novo!
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {BOOMERANG_QUICK_REASONS.map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setBoomerangReasonInput(preset)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                    boomerangReasonInput === preset
                                      ? 'bg-sky-500/30 border-sky-300 text-sky-100'
                                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={boomerangReasonInput}
                                onChange={(e) => setBoomerangReasonInput(e.target.value)}
                                placeholder="Nota opcional..."
                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-sky-400"
                              />
                              <button
                                type="button"
                                disabled={acting || boomerangChipsRemaining <= 0}
                                onClick={() => handleConfirmBoomerangPick(focusedPick.id)}
                                className="px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-white shadow cursor-pointer disabled:opacity-50"
                              >
                                🪃 Jogar de Volta pro Baralho
                              </button>
                            </div>
                          </div>
                        )}

                        {isDeclineOpen && (
                          <div className="rounded-xl border border-rose-500/40 bg-black/65 p-2.5 flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              {DECLINE_QUICK_REASONS.map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setDeclineReasonInput(preset)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                    declineReasonInput === preset
                                      ? 'bg-rose-500/30 border-rose-400 text-rose-100'
                                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={declineReasonInput}
                                onChange={(e) => setDeclineReasonInput(e.target.value)}
                                placeholder="Motivo do declínio..."
                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-rose-400"
                              />
                              <button
                                type="button"
                                disabled={acting}
                                onClick={() => handleConfirmDeclinePick(focusedPick.id)}
                                className="px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:brightness-110 text-white shadow cursor-pointer disabled:opacity-50"
                              >
                                🌀 Descartar no Vórtice
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* GRADE COMPACTA DE CARDS MENORES COM ANIMAÇÕES ORBITAIS POR DIFICULDADE */}
          {filteredMiniCatalog.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-400/25 bg-black/35 px-4 py-6 text-center flex flex-col items-center gap-1.5">
              <span className="text-xl">🎭</span>
              <p className="text-xs sm:text-sm font-black text-amber-200">
                {miniCatalogFilter === 'active' || !hasQueuedOrPendingSecretMovies
                  ? 'Você viu todos os filmes que o Arlequim sorteou — parabéns!'
                  : 'Nenhuma carta nesta categoria no momento.'}
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 max-w-lg">
                {miniCatalogFilter === 'active' || !hasQueuedOrPendingSecretMovies
                  ? 'Espero que tenha gostado… ou não. Será que o Arlequim se importa?'
                  : 'Escolha outro filtro acima ou puxe novas cartas na mesa quando tiver fichas disponíveis.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredMiniCatalog.map((entry) => {
                const gCard = entry.card;
                const gDiff = entry.difficulty || gCard?.difficulty || 'common';
                const gSuit = SUIT_META[gDiff] || SUIT_META.common;
                const isSelected = Number(focusedPick?.id) === Number(entry.id);
                const isDeclined = entry.status === 'declined';
                const isBoomerang = entry.status === 'boomerang';
                const isDismissed = isDeclined || isBoomerang;
                const isReadyToClaim = entry.status === 'ready_to_claim';
                const isActive = entry.status === 'active';
                const isCompleted = entry.status === 'completed';
                const isDecliningCardNow = Number(decliningPickId) === Number(entry.id);
                const isBoomerangingCardNow = Number(boomerangingPickId) === Number(entry.id);

                return (
                  <button
                    key={entry.id}
                    type="button"
                    title={
                      gCard?.resolved?.synopsis
                        ? `${gCard.resolved.title}: ${gCard.resolved.synopsis}`
                        : gCard?.resolved?.title
                    }
                    onClick={() => {
                      setSelectedPickId(entry.id);
                      if (isPickEligibleForSecretPower(entry)) {
                        setSelectedPowerPickId(String(entry.id));
                      }
                      setIsDeclineOpen(false);
                      setIsBoomerangOpen(false);
                      setSynopsisExpanded(false);
                    }}
                    className={`group relative text-left transition-transform duration-200 cursor-pointer hover:-translate-y-1 focus:outline-none ${
                      isDeclined
                        ? 'rounded-2xl border border-dashed border-zinc-600/80 p-0.5 bg-zinc-950 opacity-75 hover:opacity-100'
                        : isBoomerang
                          ? 'rounded-2xl border border-dashed border-sky-400/55 p-0.5 bg-sky-950/35 opacity-85 hover:opacity-100'
                          : `secret-rarity-shell ${gSuit.shellClass}`
                    } ${isSelected ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-zinc-950 scale-[1.03]' : ''}`}
                  >
                    <div
                      className={`relative z-10 aspect-[2/3] w-full rounded-[14px] overflow-hidden bg-zinc-950 ${
                        isCompleted
                          ? 'ring-2 ring-inset ring-emerald-400/75 shadow-[inset_0_0_22px_rgba(16,185,129,0.35)]'
                          : isReadyToClaim
                            ? 'ring-2 ring-inset ring-amber-300/90'
                            : ''
                      }`}
                    >
                      {/* Efeito Criativo de Rasgo Dimensional + Vórtice ao Declinar */}
                      {isDecliningCardNow ? (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90">
                          {gCard?.resolved?.posterUrl && (
                            <>
                              <img
                                src={gCard.resolved.posterUrl}
                                alt=""
                                className="secret-decline-half-a absolute inset-0 w-full h-full object-cover"
                              />
                              <img
                                src={gCard.resolved.posterUrl}
                                alt=""
                                className="secret-decline-half-b absolute inset-0 w-full h-full object-cover"
                              />
                            </>
                          )}
                          <div className="secret-decline-slash-line absolute w-[150%] h-1 bg-gradient-to-r from-transparent via-rose-400 to-fuchsia-300 shadow-[0_0_18px_#f43f5e]" />
                          <div className="secret-decline-vortex-portal absolute w-14 h-14 rounded-full border-2 border-dashed border-fuchsia-300 bg-rose-500/25 flex items-center justify-center shadow-[0_0_24px_rgba(232,121,249,0.9)]">
                            <span className="text-lg">🌀</span>
                          </div>
                          {BURST_VECTORS.slice(0, 6).map((vec, pIdx) => (
                            <span
                              key={pIdx}
                              style={{ '--dx': vec.tx, '--dy': vec.ty, '--rot': vec.rot }}
                              className="secret-decline-shred absolute text-xs font-black text-rose-300"
                            >
                              {pIdx % 2 === 0 ? '✦' : '✂'}
                            </span>
                          ))}
                        </div>
                      ) : isBoomerangingCardNow ? (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90">
                          {gCard?.resolved?.posterUrl && (
                            <img
                              src={gCard.resolved.posterUrl}
                              alt=""
                              className="secret-boomerang-card absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          <div className="secret-boomerang-ring absolute w-14 h-14 rounded-full border-2 border-dashed border-sky-300 bg-sky-500/25 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.9)]">
                            <span className="text-lg">🪃</span>
                          </div>
                          {BURST_VECTORS.slice(0, 6).map((vec, pIdx) => (
                            <span
                              key={pIdx}
                              style={{ '--dx': vec.tx, '--dy': vec.ty, '--rot': vec.rot }}
                              className="secret-boomerang-spark absolute text-xs font-black text-sky-300"
                            >
                              {pIdx % 2 === 0 ? '🪃' : '✦'}
                            </span>
                          ))}
                        </div>
                      ) : gCard?.resolved?.posterUrl ? (
                        <img
                          src={gCard.resolved.posterUrl}
                          alt={gCard.resolved.title}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            isDeclined
                              ? 'grayscale contrast-125 brightness-50'
                              : isBoomerang
                                ? 'brightness-75 saturate-75'
                                : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <Film className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}

                      {/* Efeito Interno Específico por Raridade (não polui pôster!) */}
                      {!isDismissed && !isDecliningCardNow && !isBoomerangingCardNow && (
                        <>
                          {gDiff === 'common' && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden">
                              <span style={{ '--mx': '6px', animationDelay: '0s' }} className="secret-mote-rise absolute bottom-1 left-[20%] w-1 h-1 rounded-full bg-emerald-300/80" />
                              <span style={{ '--mx': '-5px', animationDelay: '1.1s' }} className="secret-mote-rise absolute bottom-2 left-[72%] w-1 h-1 rounded-full bg-emerald-200/75" />
                            </div>
                          )}
                          {(gDiff === 'medium' || gDiff === 'exotic') && (
                            <div className="secret-aura-sweep pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                          )}
                          {gDiff === 'very_hard' && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 overflow-hidden">
                              <span style={{ '--mx': '8px', animationDelay: '0.2s' }} className="secret-mote-rise absolute bottom-1 left-[28%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b]" />
                              <span style={{ '--mx': '-7px', animationDelay: '0.9s' }} className="secret-mote-rise absolute bottom-1 left-[68%] w-1 h-1 rounded-full bg-orange-400 shadow-[0_0_6px_#f97316]" />
                            </div>
                          )}
                          {gDiff === 'exotic' && (
                            <span className="pointer-events-none absolute bottom-12 right-1.5 text-[10px] text-amber-200 animate-pulse drop-shadow-[0_0_6px_#f43f5e]">
                              ✦
                            </span>
                          )}
                        </>
                      )}

                      {/* Vinheta compacta */}
                      <div
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${
                          isCompleted
                            ? 'from-emerald-950/95 via-black/35 to-black/60'
                            : 'from-black via-black/30 to-black/65'
                        }`}
                      />

                      {/* Topo compacto */}
                      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
                        <span className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-black border backdrop-blur-md leading-none ${gSuit.badge}`}>
                          {gSuit.suit} {gDiff === 'very_hard' ? 'M.Dif' : gCard?.difficultyLabel || gDiff}
                        </span>
                        <span
                          className={`leading-none px-1.5 py-0.5 rounded-full backdrop-blur-md tracking-wide uppercase ${
                            isCompleted
                              ? 'text-[8px] bg-emerald-400 text-slate-950 font-black border border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.75)]'
                              : isReadyToClaim
                                ? 'text-[8px] bg-amber-400 text-slate-950 font-black border border-amber-100 animate-pulse'
                                : isActive
                                  ? 'text-[8px] bg-amber-500/25 text-amber-200 font-black border border-amber-400/60'
                                  : 'text-[9px] bg-black/75 border border-white/15'
                          }`}
                        >
                          {isCompleted
                            ? gCard?.portalHarvested
                              ? '🌀 PORTAL'
                              : '✓ CONCLUÍDO'
                            : isReadyToClaim
                              ? '✨ COLHER'
                              : isActive
                                ? `${gCard?.boomerangLocked ? '⛓️ ' : ''}${gCard?.twoFaceDoubled ? '🪙 ' : gCard?.halfXpCursed ? '💔 ' : ''}🔥 FILA`
                                : isBoomerang
                                  ? '🪃'
                                  : '✂️'}
                        </span>
                      </div>

                      {/* Negativo cinematográfico sutil caso já declinada */}
                      {isDeclined && !isDecliningCardNow && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 border-r border-dashed border-zinc-500/60 bg-black/60" />
                      )}

                      {/* Rodapé compacto */}
                      {(() => {
                        const entryRw = getSecretRewardMeta(entry);
                        return (
                      <div className="absolute bottom-0 inset-x-0 p-2 flex flex-col gap-0.5">
                        <div className="text-[11px] font-black text-white leading-tight line-clamp-2 drop-shadow">
                          {gCard?.resolved?.title}
                        </div>
                        {isCompleted ? (
                          <div className="bg-emerald-500/25 border border-emerald-400/60 rounded-lg px-1.5 py-0.5 mt-0.5 flex items-center justify-between text-[9px] font-mono">
                            <span className="font-bold text-emerald-100">🏆 Visto</span>
                            <span className="font-black text-emerald-200">
                              ✓ {entryRw.short}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="text-zinc-300">{gCard?.resolved?.releaseYear || '?'}</span>
                            <span
                              className={`font-black ${
                                isReadyToClaim
                                  ? 'text-amber-300 animate-pulse'
                                  : isActive
                                    ? entryRw.isGold
                                      ? 'text-yellow-300'
                                      : 'text-amber-300'
                                    : isBoomerang
                                      ? 'text-sky-300'
                                      : 'text-zinc-400'
                              }`}
                            >
                              {isReadyToClaim
                                ? `${entryRw.isGold ? '🪙' : '✨'} ${entryRw.short}`
                                : isActive
                                  ? `⏳ ${entryRw.short}`
                                  : isBoomerang
                                    ? 'No Baralho'
                                    : 'Vórtice'}
                            </span>
                          </div>
                        )}
                      </div>
                        );
                      })()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          PAINEL CRIATIVO DO ORÁCULO — TELEMETRIA COMPLETA DA PLANILHA & BARALHO
         ===================================================================== */}
      {(() => {
        const totalUnique = Math.max(1, Number(pool.totalUniqueRows || 0));
        const availableN = Number(pool.availableCount || 0);
        const watchedN = Number(pool.watchedCount || 0);
        const completedN = Number(pool.completedCount || 0);
        const declinedN = Number(pool.declinedCount || 0);
        const drawnN = Number(pool.drawnCount || 0);
        const notFoundN = Number(pool.notFoundCount || 0);
        const removedN = Number(pool.removedCount || 0);

        const segments = [
          { label: 'Disponíveis no Baralho', value: availableN, color: 'bg-emerald-500', dot: 'bg-emerald-400' },
          { label: 'Já Assistidos (Catálogo)', value: watchedN, color: 'bg-sky-500', dot: 'bg-sky-400' },
          { label: 'Catalogados pela Sessão', value: completedN, color: 'bg-amber-400', dot: 'bg-amber-300' },
          { label: 'Declinadas', value: declinedN, color: 'bg-rose-500', dot: 'bg-rose-400' },
          { label: 'Na Mesa Agora', value: drawnN, color: 'bg-fuchsia-500', dot: 'bg-fuchsia-400' },
          { label: 'Sem Match TMDB / Removidos', value: notFoundN + removedN, color: 'bg-zinc-600', dot: 'bg-zinc-500' },
        ];

        const pctOf = (v) => ((v / totalUnique) * 100).toFixed(1);
        const diffByTier = xpSummary?.byDifficulty || {};
        const rarityEntries = [
          { key: 'common', label: '♣ Comum' },
          { key: 'medium', label: '♦ Mediano' },
          { key: 'hard', label: '♠ Difícil' },
          { key: 'very_hard', label: '♥ Muito Difícil' },
          { key: 'exotic', label: '★ Exótico' },
        ];

        return (
          <section className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-zinc-950 via-slate-950/90 to-zinc-950 p-5 sm:p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span>Painel do Oráculo — Telemetria da Planilha &amp; Baralho</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Raio-X em tempo real de tudo o que entrou pela planilha{' '}
                  <span className="font-mono text-cyan-300">{pool.lastSyncSource || 'sorteio.xlsx'}</span> e do destino de cada título.
                </p>
              </div>

              {/* Funil Resumido da Planilha */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-2xl">
                <span className="text-zinc-300">
                  📄 <strong>{Number(pool.totalRawRows || 0).toLocaleString('pt-BR')}</strong> linhas brutas
                </span>
                <span className="text-zinc-600">→</span>
                <span className="text-amber-300">
                  ♻️ <strong>-{Number(pool.dedupRemovedCount || 0).toLocaleString('pt-BR')}</strong> repetidas
                </span>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-300 font-black">
                  🗂️ {Number(pool.totalUniqueRows || 0).toLocaleString('pt-BR')} únicas
                </span>
              </div>
            </div>

            {/* Barra Proporcional Viva do Deck */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-full rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex p-0.5 gap-0.5">
                {segments.map((seg) => {
                  const pct = (seg.value / totalUnique) * 100;
                  if (seg.value <= 0) return null;
                  return (
                    <div
                      key={seg.label}
                      style={{ width: `${Math.max(pct, 1.2)}%` }}
                      title={`${seg.label}: ${seg.value.toLocaleString('pt-BR')} (${pct.toFixed(1)}%)`}
                      className={`h-full rounded-full ${seg.color} transition-all duration-500`}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-300">
                {segments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${seg.dot}`} />
                    <span className="text-zinc-400">{seg.label}:</span>
                    <strong className="font-mono text-zinc-100">{seg.value.toLocaleString('pt-BR')}</strong>
                    <span className="text-[10px] font-mono text-zinc-500">({pctOf(seg.value)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 Infocards Criativos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">🃏 No Baralho</span>
                <span className="text-2xl font-black font-mono text-white">{availableN.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-emerald-200/75">{pctOf(availableN)}% prontos p/ sair</span>
              </div>

              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300">👁️ Já Vistos</span>
                <span className="text-2xl font-black font-mono text-white">{watchedN.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-sky-200/75">Bloqueados pelo catálogo</span>
              </div>

              <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300">🎲 Sorteios</span>
                <span className="text-2xl font-black font-mono text-white">
                  {Number(deckStats.totalCardsDealtCount || 0).toLocaleString('pt-BR')}
                </span>
                <span className="text-[10px] text-fuchsia-200/75">
                  cartas em {Number(deckStats.totalRoundsCount || 0)} mãos
                </span>
              </div>

              <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">🏆 Catalogados</span>
                <span className="text-2xl font-black font-mono text-white">{completedN.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-amber-200/80">
                  +{Number(xpSummary.totalXp || 0).toLocaleString('pt-BR')} XP ganhos
                </span>
              </div>

              <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10 p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">🚫 Declinadas</span>
                <span className="text-2xl font-black font-mono text-white">{declinedN.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-rose-200/75">
                  Fora do deck • 🪃 {Number(deckStats.boomerangRoundsCount || 0)} voltaram
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/75 p-3.5 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">🕳️ Fora / Planilha</span>
                <span className="text-2xl font-black font-mono text-white">{(notFoundN + removedN).toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-zinc-400">
                  {notFoundN} TMDB • {removedN} removidos
                </span>
              </div>
            </div>

            {/* Conquistas por Raridade */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 mr-1">
                Dificuldades Concluídas:
              </span>
              {rarityEntries.map((r) => {
                const stat = diffByTier[r.key] || { count: 0, totalXp: 0 };
                const sMeta = SUIT_META[r.key] || SUIT_META.common;
                return (
                  <div
                    key={r.key}
                    className={`px-3 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${sMeta.badge}`}
                  >
                    <span>{r.label}</span>
                    <span className="font-mono px-1.5 py-0.2 rounded bg-black/45 border border-white/15">
                      {stat.count} ({stat.totalXp} XP)
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* =====================================================================
          CONSOLE RECOLHÍVEL DE AUDITORIA LAB ("O QUE TENTEI SORTEAR")
         ===================================================================== */}
      {showLabTools && currentRound?.auditLog?.length > 0 && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/90 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAuditDrawer((v) => !v)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-300">
              <SearchCheck className="w-4 h-4" />
              <span>Raio-X do Sorteio — O que tentei sortear ({currentRound.auditLog.length} checagens)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span>{showAuditDrawer || effectiveLabTransparent ? 'Ocultar' : 'Abrir Log Lab'}</span>
              {showAuditDrawer || effectiveLabTransparent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {(showAuditDrawer || effectiveLabTransparent) && (
            <div className="px-5 pb-5 flex flex-col gap-2 border-t border-zinc-800/80 pt-3">
              {currentRound.auditLog.map((entry, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border px-3.5 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    AUDIT_STYLE[entry.outcome] || 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-black/40 border border-white/10 shrink-0">
                      #{entry.attempt} • L{entry.sourceRow}
                    </span>
                    <span className="font-medium leading-snug break-words">{entry.message}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase shrink-0 opacity-80">
                    {entry.outcome === 'selected'
                      ? `Carta #${entry.seat}`
                      : entry.outcome === 'skipped_watched_after_tmdb'
                        ? 'Já Assistido (TMDB)'
                        : entry.outcome === 'skipped_watched_before_api'
                          ? 'Já Assistido'
                          : entry.outcome === 'skipped_not_found'
                            ? 'Sem Match TMDB'
                            : 'Substituído'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* HISTÓRICO RECENTE */}
      {recentHistory.length > 0 && (
        <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950/75 p-5 flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <History className="w-4 h-4 text-fuchsia-400" />
            {showLabTools ? 'Histórico Recente das Rodadas do Lab' : 'Histórico Recente das Rodadas'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentHistory.map((r) => {
              const chosen = (r.cards || []).find((c) => Number(c.seat) === Number(r.chosenSeat));
              const badgeCls =
                r.status === 'completed'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : r.status === 'declined'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700';
              const statusLabel =
                r.status === 'completed'
                  ? `✅ +${r.xpAwarded} XP`
                  : r.status === 'declined'
                    ? '🙈 Declinada'
                    : '🔄 Re-sorteio';
              return (
                <div
                  key={r.id}
                  className="rounded-2xl bg-zinc-900/70 border border-zinc-800 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-200 truncate">
                      Rodada #{r.id}:{' '}
                      {chosen ? `${chosen.resolved?.title} (${chosen.resolved?.releaseYear || '?'})` : 'Não escolhida'}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {chosen ? `${chosen.difficultyIcon} ${chosen.difficultyLabel}` : `${r.auditCount ?? r.auditLog?.length ?? 0} checagens`}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${badgeCls}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* MODAL CINEMATOGRÁFICO UNIFICADO (TARÔ / MISTÉRIO / CARTAS ESPECIAIS) */}
      <SecretDrawCardRevealModal
        session={revealModalSession}
        specialCardsCatalog={specialCatalogList}
        onClose={handleRevealModalClose}
        onOpenChainedSpecial={(chainedOutcome) => {
          setRevealModalSession({
            mode: 'special',
            key: Date.now(),
            roundId: statusData?.currentRound?.id || null,
            card: chainedOutcome.card || null,
            outcome: chainedOutcome,
          });
        }}
      />

      {/* MODAL GRIMÓRIO & HISTÓRIA DO ARLEQUIM */}
      {showGrimoireModal && (() => {
        const selectedSpec =
          specialCatalogList.find((c) => c.id === grimoireSelectedId) || specialCatalogList[0];
        const selectedMeta = SPECIAL_RARITY_META[selectedSpec?.rarity] || SPECIAL_RARITY_META.rare;
        const selectedDisplay = getSpecialCardDisplayMeta(selectedSpec, specialCatalogList);
        const selectedGallery = getSpecialCardArtGallery(selectedSpec, specialCatalogList);
        const safeGrimArtIdx = Math.min(grimoireArtIdx, Math.max(0, selectedGallery.length - 1));
        const activeGrimUrl = selectedGallery[safeGrimArtIdx]?.url || selectedSpec?.images?.[0] || '';
        const isSelectedUnlocked = grimoireRevealAll || showLabTools || discoveredSpecialIds.has(selectedSpec?.id);
        const selectedTimesDrawn = Number(specialCountsById[selectedSpec?.id] || 0);
        const selectedSharePct =
          totalSpecialTriggered > 0 ? Math.round((selectedTimesDrawn / totalSpecialTriggered) * 100) : 0;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/88 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowGrimoireModal(false);
            }}
          >
            <div className="relative w-full max-w-5xl rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#0b0a0f] via-[#121017] to-[#08090c] p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] space-y-5 my-auto">
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800/90 pb-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="hidden sm:block w-[72px] h-[88px] rounded-xl overflow-hidden border border-amber-400/40 bg-[#090c0b] shrink-0 shadow-lg">
                    <img
                      src={getSecretCardUrl(HARLEQUIN_CROUPIER_AVATAR)}
                      alt="O Arlequim"
                      className="w-full h-full object-cover object-[47%_16%] scale-[1.42] origin-[47%_16%]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300/85">
                        Arquivo da Sala Particular • {discoveredSpecialIds.size}/{specialCatalogList.length} Descobertas
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 text-[10px] font-mono font-black text-emerald-200"
                        title="Total de cartas especiais sorteadas e ativadas na mesa"
                      >
                        🎲 Total de Especiais Tiradas: {totalSpecialTriggered}×
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {HARLEQUIN_BACKGROUND_LORE.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
                      {HARLEQUIN_BACKGROUND_LORE.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGrimoireRevealAll((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition cursor-pointer ${
                      grimoireRevealAll
                        ? 'bg-amber-400/20 border-amber-300/60 text-amber-200'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {grimoireRevealAll ? '👁️ Mostrando Todas' : '👁️ Espiar Todas'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGrimoireModal(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center cursor-pointer"
                    title="Fechar Grimório"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Grade de Cartas */}
                <div className="lg:col-span-7 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {specialCatalogList.map((spec) => {
                    const unlocked = grimoireRevealAll || showLabTools || discoveredSpecialIds.has(spec.id);
                    const sDisplay = getSpecialCardDisplayMeta(spec, specialCatalogList);
                    const thumb = resolveSpecialCardPrimaryUrl(spec, specialCatalogList);
                    const isSelected = selectedSpec?.id === spec.id;
                    const timesDrawn = Number(specialCountsById[spec.id] || 0);

                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => {
                          setGrimoireSelectedId(spec.id);
                          setGrimoireArtIdx(0);
                        }}
                        className={`group rounded-2xl border p-1.5 flex flex-col gap-1.5 text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                            : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden ${
                            spec.rarity === 'cursed' ? 'bg-zinc-950' : 'bg-white'
                          }`}
                        >
                          <img
                            src={getSecretCardUrl(thumb)}
                            alt={unlocked ? sDisplay.title : 'Carta Misteriosa'}
                            className={`w-full h-full object-cover transition ${
                              unlocked ? 'group-hover:scale-105' : 'brightness-[0.15] contrast-150 grayscale'
                            }`}
                          />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-lg font-black">
                              ?
                            </div>
                          )}
                          <span
                            className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black border shadow ${
                              timesDrawn > 0
                                ? 'bg-amber-400/95 border-amber-100 text-slate-950'
                                : 'bg-black/75 border-zinc-700/80 text-zinc-400'
                            }`}
                            title={`Tirada ${timesDrawn} ${timesDrawn === 1 ? 'vez' : 'vezes'}`}
                          >
                            {timesDrawn}×
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 px-0.5">
                          <span className="text-[10px] font-black text-zinc-200 truncate">
                            {unlocked ? `${spec.icon} ${sDisplay.title}` : '??? Carta Oculta'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Detalhe da Carta Selecionada */}
                {selectedSpec && (
                  <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-black/50 p-4 flex flex-col gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`relative w-44 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-amber-300/40 shadow-2xl ${
                          selectedSpec.rarity === 'cursed' && safeGrimArtIdx === 0 ? 'bg-zinc-950' : 'bg-white'
                        }`}
                      >
                        <img
                          src={getSecretCardUrl(activeGrimUrl)}
                          alt={isSelectedUnlocked ? selectedDisplay.title : 'Carta Misteriosa'}
                          className={`w-full h-full object-cover ${
                            isSelectedUnlocked ? '' : 'brightness-[0.15] contrast-150 grayscale'
                          }`}
                        />
                        {!isSelectedUnlocked && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-zinc-300">
                            <Lock className="w-7 h-7" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Não Descoberta
                            </span>
                          </div>
                        )}
                      </div>

                      {isSelectedUnlocked && selectedGallery.length > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {selectedGallery.map((art, aIdx) => (
                            <button
                              key={art.url}
                              type="button"
                              onClick={() => setGrimoireArtIdx(aIdx)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                safeGrimArtIdx === aIdx
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                              }`}
                            >
                              {art.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${selectedMeta.badgeClass}`}>
                          {selectedMeta.icon} {selectedMeta.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-black ${
                            selectedTimesDrawn > 0
                              ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                              : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          🎲 Tirada {selectedTimesDrawn} {selectedTimesDrawn === 1 ? 'vez' : 'vezes'}
                          {selectedTimesDrawn > 0 && totalSpecialTriggered > 0 ? ` (${selectedSharePct}%)` : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {selectedSpec.shortTag}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">
                        {isSelectedUnlocked ? `${selectedSpec.icon} ${selectedDisplay.title}` : '??? Segredo da Mesa'}
                      </h3>

                      {isSelectedUnlocked ? (
                        <>
                          {selectedDisplay.lore && (
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              {selectedDisplay.lore}
                            </p>
                          )}
                          {selectedDisplay.quote && (
                            <p className="text-[11px] italic text-amber-200/85 border-l-2 border-amber-400/50 pl-2.5">
                              “{selectedDisplay.quote}”
                            </p>
                          )}
                          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-[11px] text-zinc-300">
                            <strong className="text-zinc-100">Efeito na mesa:</strong> {selectedDisplay.description}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">
                          Esta carta ainda não apareceu nos seus sorteios. Clique em “Espiar Todas” acima se quiser revelar o arquivo completo.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
