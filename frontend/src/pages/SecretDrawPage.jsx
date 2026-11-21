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
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { triggerXPGainToast } from '../utils/xpSystem';
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

function playCardSelectFx() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [440, 554.37, 659.25, 880].forEach((freq, i) => {
    const t = now + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  });
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
  const [burstSeats, setBurstSeats] = useState({});
  const [spotlightSeat, setSpotlightSeat] = useState(null);
  const [miniCatalogFilter, setMiniCatalogFilter] = useState('all');
  const [selectedPickId, setSelectedPickId] = useState(null);
  const [justSelectedPickId, setJustSelectedPickId] = useState(null);
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
  const fileInputRef = useRef(null);
  const dealTimersRef = useRef([]);

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

  useEffect(() => {
    loadStatus();
    loadClassPowerWallet();
    const onSync = () => {
      setEquippedClassId(getEquippedClassId());
      loadClassPowerWallet();
    };
    window.addEventListener('cine-class-power-sync', onSync);
    return () => window.removeEventListener('cine-class-power-sync', onSync);
  }, [loadStatus, loadClassPowerWallet]);

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
        const cardsLen = res.data?.data?.round?.cards?.length || 3;
        triggerDealSequence(cardsLen);
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

  const handleAcceptMysteryCard = async (roundId, card) => {
    if (!card || acting) return;
    const pickedSeats = statusData?.currentRoundPickedSeats || [];
    const isAlreadyPicked = pickedSeats.includes(Number(card.seat));
    if (isAlreadyPicked) {
      setSpotlightSeat(card.seat);
      setInfoBanner(`Carta #${card.seat} (${card.resolved?.title}) já está na sua fila para assistir!`);
      return;
    }

    const curActive = Number(statusData?.activeWatchCount || 0);
    const curLimit = Number(statusData?.activeWatchLimit || 10);
    if (curActive >= curLimit) {
      setErrorMsg(
        `Fila cheia (${curActive}/${curLimit} filmes)! Cadastre ou decline um filme abaixo para abrir vaga.`
      );
      return;
    }

    setActing(true);
    setErrorMsg('');

    // Vira dramaticamente com uma das animações (1, 3 ou 4) e já trava direto na fila — sem direito de troca!
    if (!flippedSeats[card.seat] && !effectiveLabTransparent) {
      revealCardWithBurst(card);
    } else {
      const animToUse = seatAnimStyles[card.seat] || pickAnimForSeat();
      setSeatAnimStyles((prev) => ({ ...prev, [card.seat]: animToUse }));
      setSpotlightSeat(card.seat);
      setBurstSeats((prev) => ({ ...prev, [card.seat]: (prev[card.seat] || 0) + 1 }));
      playCardFlipFx(card.difficulty, animToUse);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/choose`, {
        roundId,
        seat: card.seat,
      });
      if (res.data?.success) {
        playCardSelectFx();
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
        setInfoBanner(
          `🔒 "${card.resolved?.title}" (${card.difficultyLabel} • +${card.xpReward} XP) foi direto para a sua fila!`
        );
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao enviar carta para a fila.');
    } finally {
      setActing(false);
    }
  };

  const handleCardClick = (card) => {
    if (!card) return;
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

  const handleFinishSelection = async (roundId) => {
    if (!roundId || acting) return;
    setActing(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/secret-draw/finish-round`, { roundId });
      if (res.data?.success) {
        const pickedCount = Number(res.data?.result?.pickedCount || 0);
        setStatusData(res.data.data);
        setFlippedSeats({});
        setBurstSeats({});
        setSeatAnimStyles({});
        setSpotlightSeat(null);
        setInfoBanner(
          pickedCount > 0
            ? `Escolha finalizada com ${pickedCount} filme(s) adicionado(s) à sua fila abaixo! Cartas não escolhidas voltaram ao baralho.`
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
        window.dispatchEvent(new CustomEvent('cine-secret-draw-sync'));
        window.dispatchEvent(new CustomEvent('cine-bingo-sync'));
        const claimedXp = Number(res.data?.claimed?.xpAwarded || res.data?.claimed?.xpReward || 0);
        setInfoBanner(
          `✨ XP da Sessão Secreta colhido (+${claimedXp} XP)! Vaga liberada na sua fila.`
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
    nextResetLabel: 'Ciclo de 15 dias (Brasília)',
  };
  const chipsRemaining = Number(chipsWallet.chipsRemaining ?? 0);
  const chipsAllowance = Number(chipsWallet.weeklyAllowance ?? 3);
  const maxChipsBank = Number(chipsWallet.maxChipsBank ?? 5);
  const cycleDays = Number(chipsWallet.cycleDays ?? 15);
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
    return `${suitIcon} ${title}${yr} • +${pick.xpReward} XP (Carta #${pick.seat})`;
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-fuchsia-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Preparando Mesa do Oráculo...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* HERO & CONTROLES SUPERIORES */}
      <section className="relative overflow-hidden rounded-3xl border border-fuchsia-500/35 bg-gradient-to-br from-zinc-950 via-violet-950/25 to-zinc-950 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute -top-24 -right-20 w-96 h-96 bg-fuchsia-500/12 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {showLabTools ? (
                  <button
                    type="button"
                    onClick={() => toggleLabTools(false)}
                    title="Clique para ocultar ferramentas do Lab (Atalho: Alt+L)"
                    className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-400/50 text-fuchsia-200 flex items-center gap-1 cursor-pointer"
                  >
                    <FlaskConical className="w-3 h-3" /> Modo Lab Ativo • Ocultar
                  </button>
                ) : (
                  <span
                    onDoubleClick={() => toggleLabTools(true)}
                    className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-200 flex items-center gap-1 select-none"
                  >
                    <Sparkles className="w-3 h-3" /> Temporada Oficial • {chipsAllowance} Fichas / {cycleDays} Dias (máx. {maxChipsBank})
                  </span>
                )}
                <span
                  className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                    chipsRemaining > 0
                      ? 'bg-amber-400/20 border-amber-300/60 text-amber-200'
                      : 'bg-rose-500/20 border-rose-400/55 text-rose-200'
                  }`}
                  title={`Fichas de Sorteio (${chipsAllowance} a cada ${cycleDays} dias, acúmulo máx. ${maxChipsBank}) • Recarrega: ${chipsWallet.nextResetLabel}`}
                >
                  <span>🎟️ Fichas: {chipsRemaining}/{maxChipsBank}</span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: maxChipsBank }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`inline-block w-2 h-2 rounded-full border ${
                          idx < chipsRemaining
                            ? 'bg-amber-300 border-amber-100 shadow-[0_0_6px_#fbbf24]'
                            : 'bg-zinc-800 border-zinc-600'
                        }`}
                      />
                    ))}
                  </span>
                </span>
                <span
                  className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                    boomerangChipsRemaining > 0
                      ? 'bg-sky-400/20 border-sky-300/60 text-sky-200'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}
                  title={`Fichas Bumerangue (${boomerangAllowance} a cada ${cycleDays} dias, acúmulo máx. ${maxBoomerangBank}) • Recarrega: ${chipsWallet.nextResetLabel}`}
                >
                  <span>🪃 Bumerangue: {boomerangChipsRemaining}/{maxBoomerangBank}</span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: maxBoomerangBank }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`inline-block w-2 h-2 rounded-full border ${
                          idx < boomerangChipsRemaining
                            ? 'bg-sky-300 border-sky-100 shadow-[0_0_6px_#38bdf8]'
                            : 'bg-zinc-800 border-zinc-600'
                        }`}
                      />
                    ))}
                  </span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300">
                  🃏 {pool.availableCount || 0} no baralho ({pool.watchedCount || 0} já assistidas{pool.removedCount > 0 ? ` • ${pool.removedCount} removidas` : ''})
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/40 text-amber-200">
                  +{Number(xpSummary.totalXp || 0).toLocaleString('pt-BR')} XP Liberado
                </span>
                <span
                  className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md border ${
                    activeWatchCount >= activeWatchLimit
                      ? 'bg-rose-500/20 border-rose-400/60 text-rose-200'
                      : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                  }`}
                >
                  🎯 Fila p/ Assistir: {activeWatchCount}/{activeWatchLimit}
                </span>
                {currentRound?.status === 'revealed' && Array.isArray(currentRound.cards) && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-cyan-200">
                    Mão de {currentRound.cards.length} Cartas
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-fuchsia-100 to-amber-200 bg-clip-text text-transparent">
                🃏 Sessão Secreta — Mesa das Cartas Misteriosas
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl">
                Cada ciclo de <strong className="text-amber-300">{cycleDays} dias</strong> concede <strong className="text-amber-300">{chipsAllowance} fichas</strong> (acumula até {maxChipsBank}) e cada sorteio abre de <strong className="text-zinc-200">3 a 10 cartas fechadas</strong>. Declínios são <strong className="text-emerald-300">ilimitados</strong>; para guardar um filme na fila sem queimá-lo, use uma <strong className="text-sky-300">Ficha Bumerangue</strong> ({boomerangAllowance}/{cycleDays} dias, acumula até {maxBoomerangBank}).
              </p>
            </div>

            {/* Ações Principais */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={drawing || previewShuffling || acting || activeWatchCount >= activeWatchLimit || chipsRemaining <= 0}
                onClick={handleDrawCards}
                title={
                  activeWatchCount >= activeWatchLimit
                    ? `Fila cheia (${activeWatchCount}/${activeWatchLimit}). Conclua ou decline um filme abaixo para sortear novamente.`
                    : chipsRemaining <= 0
                      ? showLabTools
                        ? `Suas fichas acabaram! Recarrega ${chipsWallet.nextResetLabel} (ou use "+1 Ficha Lab").`
                        : `Suas fichas acabaram! Recarrega ${chipsWallet.nextResetLabel}.`
                      : `Gasta 1 ficha (${chipsRemaining} restante${chipsRemaining === 1 ? '' : 's'}) e sorteia de 3 a 10 cartas`
                }
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-500 via-violet-500 to-amber-500 hover:brightness-110 text-white shadow-lg shadow-fuchsia-500/25 transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {drawing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Dices className="w-4 h-4" />
                )}
                {drawing
                  ? 'Embaralhando...'
                  : canChooseCardCount && countMode !== 'random'
                    ? `Embaralhar & Sortear ${countMode} Cartas`
                    : 'Embaralhar & Sortear (3–10)'}
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

          {/* Barra compacta de ferramentas Lab + Naipes */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800/80 text-[11px]">
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
              {showLabTools && (
                <>
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
                    disabled={acting}
                    onClick={handleLabReset}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Reset Lab
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Linha de Regras da Mão: 1ª Ficha Aleatória vs 2ª+ Ficha Escolhível + Ordem de Sagas */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60 text-[11px]">
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
      </section>

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
                    ⚡ Cargas: {secretPowerCharges}/{maxSecretPowerCharges} (15 dias)
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
            </div>
          </div>
        </section>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/45 bg-rose-950/35 px-4 py-3 text-sm text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
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
          className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-500/25 shadow-[inset_0_0_90px_rgba(0,0,0,0.85),0_24px_70px_rgba(0,0,0,0.75)] px-4 sm:px-8 py-8 sm:py-10"
          style={{
            background:
              'radial-gradient(ellipse at center, #0e382b 0%, #072019 56%, #040d0a 100%)',
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
                <div className="secret-riffle-left-stack absolute w-32 h-48 rounded-2xl border-2 border-amber-300/65 bg-gradient-to-br from-[#210d38] via-[#36135c] to-[#11051f] shadow-[-6px_6px_0_rgba(255,255,255,0.12),-10px_10px_24px_rgba(0,0,0,0.75)] flex items-center justify-center">
                  <div className="inset-2 absolute rounded-xl border border-amber-300/35 pointer-events-none" />
                  <span className="text-3xl text-amber-200/80 select-none">♠</span>
                </div>

                {/* Monte Base Direito (empilhado com espessura 3D) */}
                <div className="secret-riffle-right-stack absolute w-32 h-48 rounded-2xl border-2 border-fuchsia-300/65 bg-gradient-to-br from-[#2a0826] via-[#480f42] to-[#140417] shadow-[6px_6px_0_rgba(255,255,255,0.12),10px_10px_24px_rgba(0,0,0,0.75)] flex items-center justify-center">
                  <div className="inset-2 absolute rounded-xl border border-fuchsia-300/35 pointer-events-none" />
                  <span className="text-3xl text-fuchsia-200/80 select-none">♦</span>
                </div>

                {/* Monte Central Recebendo as Cartas Embaralhadas */}
                <div className="secret-riffle-center-stack relative z-10 w-32 h-48 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-emerald-950 via-violet-950 to-zinc-950 shadow-[0_6px_0_rgba(251,191,36,0.22),0_18px_40px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center gap-1">
                  <div className="inset-2 absolute rounded-xl border border-amber-300/40 pointer-events-none" />
                  <span className="text-3xl">🃏</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-200/90">Baralho</span>
                </div>

                {/* 12 Lâminas Alternadas Voando da Esquerda e da Direita (Riffle Cascade) */}
                {[0, 1, 2, 3, 4, 5].map((leafIdx) => (
                  <React.Fragment key={leafIdx}>
                    <div
                      style={{ animationDelay: `${leafIdx * 125}ms` }}
                      className="secret-riffle-leaf-left pointer-events-none absolute z-20 w-32 h-48 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-violet-900/95 via-fuchsia-950/95 to-zinc-950/95 shadow-xl flex items-center justify-center"
                    >
                      <div className="inset-2 absolute rounded-xl border border-amber-300/30" />
                      <span className="text-2xl text-amber-200/80">{leafIdx % 2 === 0 ? '♣' : '♠'}</span>
                    </div>
                    <div
                      style={{ animationDelay: `${leafIdx * 125 + 62}ms` }}
                      className="secret-riffle-leaf-right pointer-events-none absolute z-20 w-32 h-48 rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-emerald-950/95 via-indigo-950/95 to-zinc-950/95 shadow-xl flex items-center justify-center"
                    >
                      <div className="inset-2 absolute rounded-xl border border-cyan-300/30" />
                      <span className="text-2xl text-cyan-200/80">{leafIdx % 2 === 0 ? '♥' : '♦'}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="text-center flex flex-col items-center gap-1.5 max-w-md px-3">
                <div className="text-sm sm:text-base font-black uppercase tracking-[0.2em] text-amber-200 animate-pulse">
                  {previewShuffling
                    ? 'Testando Embaralhamento Riffle...'
                    : shuffleDeepLoading
                      ? 'Consultando o Oráculo & Preparando a Mão...'
                      : 'Embaralhando o Baralho da Sessão Secreta...'}
                </div>
                <div className="text-xs text-emerald-200/80 leading-relaxed">
                  {previewShuffling
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
              <div className="w-full max-w-[1160px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-black/40 border border-amber-400/25 rounded-2xl px-4 py-2.5">
                <div className="flex flex-col gap-0.5 text-center sm:text-left">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-200 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span>🍀 Foi sorteado {currentRound.cards.length} carta{currentRound.cards.length === 1 ? '' : 's'} — boa sorte!</span>
                    <span className="text-[10px] font-mono text-zinc-400">• Rodada #{currentRound.id}</span>
                  </div>
                  <div className="text-[11px] text-emerald-100/80">
                    Clicou na carta, aceitou! Ela vira e vai direto para a fila sem troca ({currentRoundPickedSeats.length} aceita(s) aqui • Fila: <strong className="text-amber-300">{activeWatchCount}/{activeWatchLimit}</strong>)
                  </div>
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

              {(() => {
                const cardsCount = currentRound.cards.length;
                const isLargeHand = cardsCount >= 6;
                const cardSizeClass = isLargeHand
                  ? 'w-[172px] sm:w-[186px] h-[272px]'
                  : 'w-[196px] sm:w-[210px] h-[304px]';
                const gridWrapClass = isLargeHand
                  ? 'flex flex-wrap items-center justify-center gap-4 sm:gap-5 py-3 w-full max-w-[1160px]'
                  : 'flex flex-wrap items-center justify-center gap-5 sm:gap-6 py-3 w-full';

                return (
                  <div className={gridWrapClass}>
                    {currentRound.cards.map((card, idx) => {
                      const suit = SUIT_META[card.difficulty] || SUIT_META.common;
                      const isDealt = idx < dealingCount;
                      const isPickedInRound = currentRoundPickedSeats.includes(Number(card.seat));
                      const isFlipped = effectiveLabTransparent || isPickedInRound || Boolean(flippedSeats[card.seat]);
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
                              tabIndex={0}
                              onClick={() => handleCardClick(card)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleCardClick(card);
                                }
                              }}
                              className={`secret-card-scene ${cardSizeClass} cursor-pointer select-none focus:outline-none ${
                                isPickedInRound
                                  ? 'ring-2 ring-emerald-400 rounded-[20px] ring-offset-4 ring-offset-[#072019] shadow-[0_0_28px_rgba(16,185,129,0.55)]'
                                  : isSelectedSpotlight
                                    ? 'ring-2 ring-amber-300/85 rounded-[20px] ring-offset-4 ring-offset-[#072019]'
                                    : ''
                              }`}
                            >
                              <div className={`secret-card-inner ${modeClass} ${isFlipped ? 'is-flipped' : ''}`}>
                          {/* ===================== VERSO (100% MISTERIOSO) ===================== */}
                          <div
                            className={`secret-card-face secret-card-face-back rounded-[18px] border-2 ${suit.borderFrame} bg-gradient-to-br ${suit.backBg} ${suit.glowShadow} p-2 flex flex-col overflow-hidden`}
                          >
                            {/* Textura sutil de losangos de baralho */}
                            <div
                              className="pointer-events-none absolute inset-0 opacity-20"
                              style={{
                                backgroundImage:
                                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
                                backgroundSize: '14px 14px',
                              }}
                            />

                            {/* Moldura interna de baralho */}
                            <div className={`relative z-10 flex-1 rounded-xl border ${suit.innerFrame} ${isLargeHand ? 'p-2' : 'p-2.5'} flex flex-col justify-between`}>
                              {/* Índice Superior Esquerdo */}
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col items-center leading-none">
                                  <span className={`${isLargeHand ? 'text-base' : 'text-lg'} font-black font-serif ${suit.accentText}`}>{suit.rank}</span>
                                  <span className={`${isLargeHand ? 'text-sm' : 'text-base'} ${suit.accentText}`}>{suit.suit}</span>
                                </div>
                                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full border ${suit.xpChip}`}>
                                  +{card.xpReward} XP
                                </span>
                              </div>

                              {/* Brasão Central + Contador Misterioso (SEM NENHUMA PISTA DE QUAL MARCO É!) */}
                              <div className="flex flex-col items-center text-center gap-1 my-auto px-0.5">
                                <div className={`${isLargeHand ? 'w-11 h-11' : 'w-14 h-14'} rounded-full border-2 ${suit.borderFrame} bg-black/45 flex items-center justify-center shadow-inner shrink-0`}>
                                  <span className={`${isLargeHand ? 'text-xl' : 'text-2xl'} ${suit.accentText}`}>{suit.suit}</span>
                                </div>

                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${suit.accentText}`}>
                                    {card.difficultyLabel}
                                  </span>
                                  <div className="px-2.5 py-0.5 rounded-full bg-black/55 border border-white/15 text-[11px] font-black text-zinc-100 whitespace-nowrap">
                                    {hiddenCount > 0
                                      ? `❓ ${hiddenCount} Marco${hiddenCount > 1 ? 's' : ''} Oculto${hiddenCount > 1 ? 's' : ''}`
                                      : '❓ Destino Selado'}
                                  </div>
                                  <span className="text-[9.5px] text-zinc-300/75 italic leading-tight">
                                    Clicou = revela e vai p/ fila
                                  </span>
                                </div>
                              </div>

                              {/* Índice Inferior Direito Invertido (Baralho Clássico) */}
                              {(currentRound.powerFlags?.xrayMilestones || currentRound.powerFlags?.revealYearRuntime) && (
                                <div className="my-auto flex flex-col items-center gap-1 px-1 z-10">
                                  {currentRound.powerFlags?.revealYearRuntime && (card.resolved?.releaseYear || card.resolved?.runtime) && (
                                    <span className="px-2 py-0.5 rounded-md bg-black/75 border border-cyan-400/50 text-[9px] font-black font-mono text-cyan-200 shadow">
                                      🎙️ {card.resolved?.releaseYear || '?'} • {card.resolved?.runtime ? `${card.resolved.runtime}m` : '?m'}
                                    </span>
                                  )}
                                  {currentRound.powerFlags?.xrayMilestones && Array.isArray(card.milestones) && card.milestones.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1 max-w-full">
                                      {card.milestones.slice(0, 3).map((m, mIdx) => (
                                        <span
                                          key={mIdx}
                                          title={m.detail || m.label}
                                          className="px-1.5 py-0.5 rounded bg-black/80 border border-amber-400/45 text-[8.5px] font-bold text-amber-200 truncate max-w-[115px]"
                                        >
                                          {m.icon} {m.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-end justify-between">
                                <span className="text-[9.5px] font-black uppercase tracking-widest text-white/60">
                                  Carta #{card.seat}
                                </span>
                                <div className="flex flex-col items-center leading-none rotate-180">
                                  <span className={`${isLargeHand ? 'text-base' : 'text-lg'} font-black font-serif ${suit.accentText}`}>{suit.rank}</span>
                                  <span className={`${isLargeHand ? 'text-sm' : 'text-base'} ${suit.accentText}`}>{suit.suit}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ===================== FRENTE (CARTA ILUSTRADA) ===================== */}
                          <div
                            className={`secret-card-face secret-card-face-front rounded-[18px] border-2 ${suit.borderFrame} bg-gradient-to-b ${suit.frontGradient} ${suit.glowShadow} overflow-hidden flex flex-col`}
                          >
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
                              {/* Topo: Naipe Esquerdo + Selo XP Direito */}
                              <div className="flex items-start justify-between gap-1">
                                <div className="px-1.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-white/15 flex flex-col items-center leading-none">
                                  <span className={`text-sm font-black font-serif ${suit.accentText}`}>{suit.rank}</span>
                                  <span className={`text-xs ${suit.accentText}`}>{suit.suit}</span>
                                </div>

                                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full border backdrop-blur-sm ${suit.xpChip}`}>
                                  +{card.xpReward} XP
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
                                  <div className="px-1.5 py-0.5 rounded-md bg-black/70 border border-white/10 flex flex-col items-center leading-none rotate-180">
                                    <span className={`text-xs font-black font-serif ${suit.accentText}`}>{suit.rank}</span>
                                    <span className={`text-[10px] ${suit.accentText}`}>{suit.suit}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Status discreto apenas quando já aceita na fila */}
                      {isPickedInRound && (
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
      {spotlightCard && (
        (() => {
          const focusCard = spotlightCard;
          const suit = SUIT_META[focusCard.difficulty] || SUIT_META.common;
          const focusIsPicked = currentRoundPickedSeats.includes(Number(focusCard.seat));

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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${suit.badge}`}>
                      {suit.suit} Carta #{focusCard.seat} • {focusCard.difficultyLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-amber-500/20 text-amber-200 border border-amber-400/50 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> +{focusCard.xpReward} XP
                    </span>
                    {focusIsPicked && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-200 border border-emerald-400/55">
                        ✓ Selecionada p/ Fila
                      </span>
                    )}
                  </div>

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
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {focusIsPicked ? (
                      <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/50">
                        <Lock className="w-4 h-4" />
                        🔒 Carta #{focusCard.seat} travada na sua fila abaixo (+{focusCard.xpReward} XP ao cadastrar)
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={acting || activeWatchCount >= activeWatchLimit}
                        onClick={() => handleAcceptMysteryCard(currentRound.id, focusCard)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        Aceitar Carta #{focusCard.seat} na Fila (+{focusCard.xpReward} XP)
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
                </div>
              </div>
            </section>
          );
        })()
      )}

      {/* MESA VAZIA ANTES DO PRIMEIRO SORTEIO OU APÓS FINALIZAR ESCOLHA */}
      {!drawing && !previewShuffling && !currentRound && (
        <section
          className="rounded-[2rem] border-2 border-emerald-500/20 p-8 flex flex-col items-center justify-center text-center gap-3.5 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"
          style={{
            background: 'radial-gradient(ellipse at center, #0e382b 0%, #072019 56%, #040d0a 100%)',
          }}
        >
          <div className="w-20 h-28 rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-violet-950 to-zinc-950 flex flex-col items-center justify-center shadow-2xl">
            <span className="text-3xl">🃏</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-200 mt-1">Baralho</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">A mesa está livre para um novo sorteio!</h3>
            <p className="text-xs text-emerald-100/75 max-w-md mt-1">
              {activeWatchCount >= activeWatchLimit ? (
                <span>
                  Sua fila atingiu o máximo de <strong>{activeWatchCount}/{activeWatchLimit} filmes</strong>. Cadastre ou decline um filme na grade abaixo para liberar vagas!
                </span>
              ) : chipsRemaining <= 0 ? (
                <span>
                  Suas fichas de sorteio acabaram! Próxima recarga: <strong>{chipsWallet.nextResetLabel}</strong> ({chipsAllowance} fichas a cada {cycleDays} dias, acumula até {maxChipsBank})
                  {showLabTools ? <> (ou clique em <strong>+1 Ficha Lab</strong> no painel acima para continuar testando)</> : '.'}
                </span>
              ) : (
                <span>
                  Você tem <strong>{chipsRemaining}/{maxChipsBank} ficha(s)</strong> (ganha {chipsAllowance} a cada {cycleDays} dias) e <strong>{activeWatchLimit - activeWatchCount} vaga(s)</strong> na fila. Ao sortear, lembre-se: clicou na carta, vai direto para a fila!
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={activeWatchCount >= activeWatchLimit || chipsRemaining <= 0 || acting}
              onClick={handleDrawCards}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-500 to-amber-500 hover:brightness-110 text-white shadow cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
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
      )}

      {/* BANNER DOURADO: CARTAS CONCLUÍDAS PRONTAS PARA COLHER XP */}
      {readyToClaimPicks.length > 0 && (
        <section className="rounded-3xl border-2 border-amber-300/75 bg-gradient-to-br from-amber-950/65 via-zinc-950 to-emerald-950/50 p-4 sm:p-5 flex flex-col gap-3 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <h2 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wide">
                🃏 Cartas Concluídas — Prontas para Colher XP ({readyToClaimPicks.length})
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-200/90">
              Total pronto: +{readyToClaimPicks.reduce((acc, p) => acc + Number(p.xpReward || 0), 0)} XP
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {readyToClaimPicks.map((pick) => {
              const pCard = pick.card;
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
                      {pCard?.difficultyLabel || pick.difficulty} • +{pick.xpReward} XP aguardando
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleClaimPick(pick.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 shadow cursor-pointer disabled:opacity-50"
                  >
                    ✨ +{pick.xpReward} XP
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${suit.badge}`}>
                        {suit.suit} {fCard?.difficultyLabel || fDiff}
                      </span>
                      {isReadyToClaimItem && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-amber-400/25 text-amber-200 border border-amber-300/80 animate-pulse">
                          ✨ +{focusedPick.xpReward} XP Pronto para Colher!
                        </span>
                      )}
                      {isActiveMission && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-amber-500/20 text-amber-200 border border-amber-400/55">
                          🔒 +{focusedPick.xpReward} XP Travado
                        </span>
                      )}
                      {isCompletedItem && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-emerald-400/20 text-emerald-200 border border-emerald-300/75 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                          🏆 MISSÃO CUMPRIDA • +{focusedPick.xpAwarded || focusedPick.xpReward} XP COLHIDO
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
                    </div>

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

                    {isReadyToClaimItem && (
                      <div className="rounded-2xl border border-amber-300/60 bg-amber-500/15 p-3 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="text-xs text-amber-100">
                          <strong>🎬 Missão Concluída!</strong> Este filme já entrou no catálogo. Colete seu XP para liberar +XP e reabrir a vaga da fila:
                        </div>
                        <button
                          type="button"
                          disabled={acting}
                          onClick={() => handleClaimPick(focusedPick.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.45)] cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Colher +{focusedPick.xpReward} XP Agora!
                        </button>
                      </div>
                    )}

                    {isActiveMission && (
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenAddMovieForSecretCard && onOpenAddMovieForSecretCard(fCard)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cadastrar no Catálogo (+{focusedPick.xpReward} XP)
                          </button>

                          {showLabTools && (
                            <button
                              type="button"
                              disabled={acting}
                              onClick={() => handleLabCompletePick(focusedPick.id)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-violet-500/20 hover:bg-violet-500/35 text-violet-200 border border-violet-400/50 cursor-pointer disabled:opacity-50"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              Concluir Lab (+{focusedPick.xpReward} XP)
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={acting || boomerangChipsRemaining <= 0}
                            onClick={() => {
                              setIsBoomerangOpen((v) => !v);
                              setIsDeclineOpen(false);
                            }}
                            title={
                              boomerangChipsRemaining <= 0
                                ? `Suas Fichas Bumerangue acabaram (${boomerangAllowance}/${cycleDays} dias, máx. ${maxBoomerangBank})! Recarrega ${chipsWallet.nextResetLabel}.`
                                : 'Tira da sua fila agora e devolve ao baralho para poder sair novamente depois (não queima o filme).'
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/50 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            <span>🪃</span>
                            {isBoomerangOpen
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
                              <strong>1 Ficha Bumerangue</strong> ({boomerangChipsRemaining}/{maxBoomerangBank} acumulados • +{boomerangAllowance}/{cycleDays}d) e{' '}
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
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* GRADE COMPACTA DE CARDS MENORES COM ANIMAÇÕES ORBITAIS POR DIFICULDADE */}
          {filteredMiniCatalog.length > 0 && (
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
                    onClick={() => {
                      setSelectedPickId(entry.id);
                      if (isPickEligibleForSecretPower(entry)) {
                        setSelectedPowerPickId(String(entry.id));
                      }
                      setIsDeclineOpen(false);
                      setIsBoomerangOpen(false);
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
                            ? '✓ CONCLUÍDO'
                            : isReadyToClaim
                              ? '✨ COLHER'
                              : isActive
                                ? '🔥 FILA'
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
                      <div className="absolute bottom-0 inset-x-0 p-2 flex flex-col gap-0.5">
                        <div className="text-[11px] font-black text-white leading-tight line-clamp-2 drop-shadow">
                          {gCard?.resolved?.title}
                        </div>
                        {isCompleted ? (
                          <div className="bg-emerald-500/25 border border-emerald-400/60 rounded-lg px-1.5 py-0.5 mt-0.5 flex items-center justify-between text-[9px] font-mono">
                            <span className="font-bold text-emerald-100">🏆 Visto</span>
                            <span className="font-black text-emerald-200">
                              ✓ +{entry.xpAwarded || entry.xpReward} XP
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
                                    ? 'text-amber-300'
                                    : isBoomerang
                                      ? 'text-sky-300'
                                      : 'text-zinc-400'
                              }`}
                            >
                              {isReadyToClaim
                                ? `✨ +${entry.xpReward} XP`
                                : isActive
                                  ? `⏳ +${entry.xpReward} XP`
                                  : isBoomerang
                                    ? 'No Baralho'
                                    : 'Vórtice'}
                            </span>
                          </div>
                        )}
                      </div>
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
                      {chosen ? `${chosen.difficultyIcon} ${chosen.difficultyLabel}` : `${r.auditLog?.length || 0} checagens`}
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
    </div>
  );
}
