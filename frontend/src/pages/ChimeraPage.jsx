import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Dna,
  Sparkles,
  FlaskConical,
  Plus,
  RotateCcw,
  Trash2,
  Trophy,
  Calendar,
  Globe,
  Film,
  Tag,
  Zap,
  Crown,
  Search,
  RefreshCw,
  X,
  AlertTriangle,
  BookOpen,
  Dices,
  Lock,
  CalendarClock,
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { triggerXPGainToast, dispatchXpStatusUpdate } from '../utils/xpSystem';
import { getCycle15CountdownLabel, formatCycleKeyLabel } from '../utils/cycleCountdown';
import {
  playChimeraJackpotTickSound,
  playChimeraJackpotFanfareSound,
  playChimeraAwakenSound,
  playChimeraRunePickSound,
  playChimeraTarotFlipSound,
} from '../utils/trophyAudio';
import ChimeraForgeRitual, { TarotCardShowcaseModal } from '../components/ChimeraForgeRitual';
import { TAROT_BACK_IMAGE, getRuneTarotMeta } from '../utils/chimeraTarotCatalog';
import ChimeraAwakenCeremony from '../components/ChimeraAwakenCeremony';
import { ALL_CINEMA_CLASSES } from '../utils/analyticsEngine';
import {
  POWER_TIER_META,
  getClassPowers,
  getEquippedClassId,
  dispatchClassPowerSync,
} from '../utils/classPowersCatalog';

const LAB_D20_MODES = [
  { id: 'auto', label: '🎲 Rolagem Real (1–20)' },
  { id: 'nightmare', label: '💀 Forçar D20 Baixo (1–4 Difícil)' },
  { id: 'hard', label: '🔥 Forçar D20 Médio-Baixo (5–9)' },
  { id: 'blessed', label: '🌟 Forçar D20 Alto (17–20)' },
];

function dispatchChimeraSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cine-chimera-sync', { detail: { source: 'chimera-page' } }));
  }
}

function ChimeraCycleRestDisplay({ cycleKey = '' }) {
  const spores = [
    { symbol: '🧬', pos: 'top-3 left-6', delay: '0s', size: 'text-sm text-emerald-300' },
    { symbol: '✨', pos: 'top-6 right-5', delay: '0.45s', size: 'text-xs text-amber-300' },
    { symbol: '🔮', pos: 'bottom-7 left-4', delay: '0.9s', size: 'text-xs text-teal-200' },
    { symbol: '🎲', pos: 'bottom-4 right-6', delay: '1.35s', size: 'text-xs text-amber-200' },
    { symbol: '⭐', pos: 'top-1/2 -left-1 -translate-y-1/2', delay: '0.6s', size: 'text-xs text-emerald-200' },
    { symbol: '⚗️', pos: 'top-1/2 -right-1 -translate-y-1/2', delay: '1.1s', size: 'text-xs text-teal-300' },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-1">
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
        <div className="bingo-sanctum-aura pointer-events-none absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.32)_0%,rgba(245,158,11,0.14)_48%,transparent_74%)]" />

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
            stroke="rgba(52, 211, 153, 0.42)"
            strokeWidth="1.5"
            strokeDasharray="7 7"
          />
          <circle cx="100" cy="8" r="3" fill="#6ee7b7" />
          <circle cx="192" cy="100" r="2.5" fill="#fde68a" />
          <circle cx="100" cy="192" r="3" fill="#6ee7b7" />
          <circle cx="8" cy="100" r="2.5" fill="#fde68a" />
        </svg>

        <div className="bingo-sanctum-orbit-reverse pointer-events-none absolute inset-5 rounded-full border border-dashed border-amber-400/40 shadow-[inset_0_0_24px_rgba(16,185,129,0.16)]" />

        {spores.map((sp, idx) => (
          <span
            key={idx}
            style={{ animationDelay: sp.delay }}
            className={`bingo-sanctum-sparkle pointer-events-none absolute ${sp.pos} ${sp.size} select-none`}
          >
            {sp.symbol}
          </span>
        ))}

        {/* Frasco Alquímico Selado com Hélice DNA Adormecida */}
        <div className="bingo-sanctum-grimoire-float relative z-10 w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="chimFlaskGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="chimGlassGlow" cx="45%" cy="55%" r="55%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.48" />
                <stop offset="65%" stopColor="#065f46" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#042f2e" stopOpacity="0.96" />
              </radialGradient>
            </defs>

            {/* Tampa hermética dourada */}
            <rect x="55" y="18" width="30" height="11" rx="4" fill="url(#chimFlaskGold)" stroke="#451a03" strokeWidth="1.5" />
            <rect x="51" y="28" width="38" height="9" rx="3" fill="#0f766e" stroke="url(#chimFlaskGold)" strokeWidth="1.8" />

            {/* Corpo de cristal alquímico */}
            <path
              d="M58 37 L58 53 L32 95 C27 104 33 118 45 118 L95 118 C107 118 113 104 108 95 L82 53 L82 37 Z"
              fill="url(#chimGlassGlow)"
              stroke="url(#chimFlaskGold)"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />

            {/* Poção estabilizada no fundo */}
            <path
              d="M39 92 Q70 84 101 92 L106 100 C108 108 102 115 94 115 L46 115 C38 115 32 108 34 100 Z"
              fill="rgba(16, 185, 129, 0.38)"
            />

            {/* Fita dupla de DNA em repouso */}
            <path
              d="M58 64 C78 72, 62 84, 82 94"
              fill="none"
              stroke="#fde68a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M82 64 C62 72, 78 84, 58 94"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line x1="63" y1="69" x2="77" y2="69" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
            <line x1="63" y1="79" x2="77" y2="79" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
            <line x1="63" y1="89" x2="77" y2="89" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />

            {/* Selo central de lacre */}
            <circle cx="70" cy="105" r="8" fill="#064e3b" stroke="url(#chimFlaskGold)" strokeWidth="1.6" />
            <path
              d="M70 100 L71.6 103.3 L75.2 103.8 L72.6 106.3 L73.2 109.9 L70 108.2 L66.8 109.9 L67.4 106.3 L64.8 103.8 L68.4 103.3 Z"
              fill="#fef3c7"
            />
          </svg>

          <span className="absolute -top-1 -right-2 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-zinc-950 border border-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.55)]">
            ⚗️ SELADA
          </span>
        </div>
      </div>

      <div className="px-3.5 py-1 rounded-full bg-emerald-950/75 border border-emerald-400/45 text-[10.5px] font-black uppercase tracking-widest text-emerald-200 shadow-inner">
        🧬 Forja de Quimeras • {formatCycleKeyLabel(cycleKey, { short: true, fallback: 'Ciclo Atual' })} • Em Repouso
      </div>
    </div>
  );
}

export default function ChimeraPage({
  onXpStatusChange = () => {},
  onOpenAddMovieForChimera = () => {},
  onStatusLoaded = () => {},
}) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoBanner, setInfoBanner] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [classPowerWallet, setClassPowerWallet] = useState(null);
  const [equippedClassId, setEquippedClassId] = useState(() => getEquippedClassId());
  const [selectedPowerChimeraId, setSelectedPowerChimeraId] = useState('');
  const [selectedPowerChoice, setSelectedPowerChoice] = useState('');
  const [actingClassPower, setActingClassPower] = useState(false);

  // Cena D20 + Mesa das Cartas de Tarô Roguelike
  const [labD20Mode, setLabD20Mode] = useState('auto');
  const [labForceLegendary, setLabForceLegendary] = useState(false);
  const [showRuneCodex, setShowRuneCodex] = useState(false);
  const [activeRitualContract, setActiveRitualContract] = useState(null);
  const [runeBusy, setRuneBusy] = useState(false);
  const [inspectedTarotRune, setInspectedTarotRune] = useState(null);

  // Modo Lab oculto por padrão (revelado via Alt+L ou duplo clique no selo Ciclo 15 Dias)
  const [showLabTools, setShowLabTools] = useState(() => {
    try {
      return window.localStorage.getItem('chimera_show_lab') === '1';
    } catch {
      return false;
    }
  });

  const toggleLabTools = useCallback((forcedNext) => {
    setShowLabTools((prev) => {
      const next = typeof forcedNext === 'boolean' ? forcedNext : !prev;
      try {
        window.localStorage.setItem('chimera_show_lab', next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      if (!next) {
        setLabD20Mode('auto');
        setLabForceLegendary(false);
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

  // Cerimônia de Despertar & Colheita Dourada
  const [awakenContract, setAwakenContract] = useState(null);
  const [awakenRevealStep, setAwakenRevealStep] = useState(0);
  const [awakenClaiming, setAwakenClaiming] = useState(false);
  const [awakenClaimResult, setAwakenClaimResult] = useState(null);

  const timersRef = useRef([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearAllTimers, [clearAllTimers]);

  const applyServerStatus = useCallback(
    (data, xpStatus = null) => {
      if (data) {
        setStatusData(data);
        setActiveRitualContract((prev) => {
          if (!prev) return null;
          const stillActive = (data.activeChimeras || []).find((c) => Number(c.id) === Number(prev.id));
          return stillActive || null;
        });
        onStatusLoaded(data);
      }
      if (xpStatus) {
        onXpStatusChange(xpStatus);
        dispatchXpStatusUpdate(xpStatus);
      }
      dispatchChimeraSync();
    },
    [onStatusLoaded, onXpStatusChange]
  );

  const fetchStatus = useCallback(async () => {
    try {
      setErrorMsg('');
      const res = await axios.get(`${API_BASE_URL}/chimeras/status`, {
        params: { lab: showLabTools ? '1' : '0' },
      });
      if (res.data?.success && res.data?.data) {
        const nextData = res.data.data;
        setStatusData(nextData);
        setActiveRitualContract((prev) => {
          if (!prev) return null;
          const stillActive = (nextData.activeChimeras || []).find((c) => Number(c.id) === Number(prev.id));
          return stillActive || null;
        });
        onStatusLoaded(nextData);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao carregar a Quimera Cinéfila.');
    } finally {
      setLoading(false);
    }
  }, [onStatusLoaded, showLabTools]);

  const fetchClassPowerWallet = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/class-powers/status`);
      if (res.data?.success) {
        setClassPowerWallet(res.data.data);
      }
    } catch {
      // ignore wallet fetch error
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchClassPowerWallet();
  }, [fetchStatus, fetchClassPowerWallet]);

  useEffect(() => {
    const onExternalSync = (e) => {
      if (e?.detail?.source === 'chimera-page') return;
      fetchStatus();
      fetchClassPowerWallet();
    };
    const onClassPowerSync = () => {
      setEquippedClassId(getEquippedClassId());
      setSelectedPowerChoice('');
      fetchClassPowerWallet();
    };
    window.addEventListener('cine-chimera-sync', onExternalSync);
    window.addEventListener('cine-class-power-sync', onClassPowerSync);
    return () => {
      window.removeEventListener('cine-chimera-sync', onExternalSync);
      window.removeEventListener('cine-class-power-sync', onClassPowerSync);
    };
  }, [fetchStatus, fetchClassPowerWallet]);

  const handleForgeChimera = async () => {
    if (actionBusy || activeRitualContract) return;
    clearAllTimers();
    setErrorMsg('');
    setActionBusy(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/forge`, {
        ritualStyle: 'rogue_runes',
        labD20Mode: showLabTools ? labD20Mode : 'auto',
        labForceLegendary: showLabTools ? labForceLegendary : false,
        labMode: Boolean(showLabTools),
      });
      const forged = res.data?.forged || null;
      const nextData = res.data?.data || null;
      if (forged) {
        setActiveRitualContract(forged);
      }
      if (nextData) {
        applyServerStatus(nextData);
      } else {
        fetchStatus();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Não foi possível forjar uma nova Quimera.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleSelectFateRune = async (chimeraId, runeId) => {
    if (runeBusy || !chimeraId || !runeId) return;
    setRuneBusy(true);
    setErrorMsg('');
    playChimeraTarotFlipSound('common');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/pick-rune`, { chimeraId, runeId });
      const recipeAfter = res.data?.chimera?.recipe;
      const pickedRune =
        recipeAfter?.fateRunes?.find((r) => r.id === runeId) || recipeAfter?.chosenFateRune;
      if (res.data?.chimera && Number(activeRitualContract?.id) === Number(chimeraId)) {
        setActiveRitualContract(res.data.chimera);
      } else if (pickedRune) {
        setInspectedTarotRune(pickedRune);
        setInfoBanner(
          `🔮 Carta de Tarô "${pickedRune.icon || '✨'} ${pickedRune.runeName}" selada na Quimera #${chimeraId}!`
        );
      }
      if (res.data?.data) {
        applyServerStatus(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao selar Carta de Tarô.');
    } finally {
      setRuneBusy(false);
    }
  };

  const handleApplyPillarAction = async (chimeraId, pillar, actionType) => {
    if (actionBusy || !chimeraId || !pillar || !actionType) return;
    setActionBusy(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/pillar-action`, {
        chimeraId,
        pillar,
        actionType,
      });
      playChimeraRunePickSound(actionType === 'transmute' ? 'rare' : 'common');
      if (res.data?.chimera && activeRitualContract?.id === chimeraId) {
        setActiveRitualContract(res.data.chimera);
      }
      if (res.data?.data) {
        applyServerStatus(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao aplicar poder de categoria.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleFinishRitual = () => {
    clearAllTimers();
    setActiveRitualContract(null);
    fetchStatus();
  };

  const handleDeclineChimera = async (chimeraId) => {
    if (actionBusy) return;
    setActionBusy(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/decline`, { chimeraId });
      if (Number(activeRitualContract?.id) === Number(chimeraId)) {
        clearAllTimers();
        setActiveRitualContract(null);
        setInspectedTarotRune(null);
      }
      applyServerStatus(res.data?.data);
      setInfoBanner(`🪶 Quimera #${chimeraId} declinada! +1 Ficha de Forja estornada.`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao declinar Quimera.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDiscardChimera = async (chimeraId) => {
    if (actionBusy) return;
    setActionBusy(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/discard`, { chimeraId });
      if (Number(activeRitualContract?.id) === Number(chimeraId)) {
        clearAllTimers();
        setActiveRitualContract(null);
        setInspectedTarotRune(null);
      }
      applyServerStatus(res.data?.data);
      setInfoBanner(`🗑️ Quimera #${chimeraId} deletada no Laboratório.`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao descartar Quimera.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleStartAwakenCeremony = (contract) => {
    if (!contract || awakenClaiming) return;
    clearAllTimers();
    setAwakenContract(contract);
    setAwakenClaimResult(null);
    setAwakenRevealStep(0);

    const details = contract.matchDetails || {};
    const stepDelays = [320, 680, 1040, 1400, 1800];
    stepDelays.forEach((ms, idx) => {
      const id = setTimeout(() => {
        setAwakenRevealStep(idx + 1);
        const hitFlags = [
          details.hitJackpotYear,
          details.hitJackpotCountry,
          details.hitJackpotGenre,
          details.hitJackpotTag,
          details.hitSpecialBonus,
        ];
        if (hitFlags[idx]) {
          playChimeraJackpotTickSound(idx);
        }
      }, ms);
      timersRef.current.push(id);
    });

    const finaleId = setTimeout(() => {
      playChimeraAwakenSound(details.jackpotsHitCount || 0);
    }, 1920);
    timersRef.current.push(finaleId);
  };

  const handleConfirmClaimXp = async () => {
    if (!awakenContract || awakenClaiming) return;
    setAwakenClaiming(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/claim`, {
        chimeraId: awakenContract.id,
      });
      setAwakenClaimResult(res.data);
      applyServerStatus(res.data?.data, res.data?.xpStatus);
      window.dispatchEvent(new CustomEvent('cine-bingo-sync'));
      if (res.data?.xpGain) {
        triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
      }
      playChimeraJackpotFanfareSound(res.data?.claimed?.matchDetails?.jackpotsHitCount || 0);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao colher o XP da Quimera.');
    } finally {
      setAwakenClaiming(false);
    }
  };

  const handleCloseAwakenModal = () => {
    clearAllTimers();
    setAwakenContract(null);
    setAwakenClaimResult(null);
    setAwakenRevealStep(0);
  };

  const handleLabGrantChip = async (chipType = 'forge') => {
    if (actionBusy) return;
    setActionBusy(true);
    setErrorMsg('');
    try {
      const normalizedType = chipType === 'decline' ? 'decline' : chipType === 'slot' ? 'slot' : 'forge';
      const res = await axios.post(`${API_BASE_URL}/chimeras/lab/grant-chip`, {
        amount: 1,
        type: normalizedType,
      });
      applyServerStatus(res.data?.data);
      if (normalizedType === 'slot') {
        setInfoBanner('🧬 +2 Slots extras de Quimera ativados no Lab!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao recarregar ficha no Lab.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleLabSimulateMatch = async (chimeraId, mode) => {
    if (actionBusy) return;
    setActionBusy(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/lab/simulate-match`, {
        chimeraId,
        mode,
      });
      if (Number(activeRitualContract?.id) === Number(chimeraId)) {
        clearAllTimers();
        setActiveRitualContract(null);
      }
      applyServerStatus(res.data?.data);
      playChimeraJackpotTickSound(mode === 'full_jackpot' ? 3 : 1);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao simular captura no Lab.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleLabReset = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/lab/reset`);
      clearAllTimers();
      setActiveRitualContract(null);
      setInspectedTarotRune(null);
      applyServerStatus(res.data?.data, res.data?.xpStatus);
      setInfoBanner('🧪 Laboratório resetado com sucesso!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao resetar Quimeras no Lab.');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Aquecendo a Forja da Quimera Cinéfila...
        </span>
      </div>
    );
  }

  const wallet = statusData?.wallet || {
    chipsRemaining: 0,
    weeklyAllowance: 3,
    maxChipsBank: 5,
    cycleDays: 15,
    declineChipsRemaining: 0,
    maxDeclineBank: 2,
    nextBlessedRolls: 0,
    chipsUsedThisWeek: 0,
    nextResetLabel: 'Dias 1 e 15 do mês (Brasília)',
  };
  const maxChipsBank = Number(wallet.maxChipsBank || 5);
  const maxDeclineBank = Number(wallet.maxDeclineBank || 2);
  const baseActiveLimit = Number(statusData?.baseActiveLimit ?? 2);
  const labActiveLimit = Number(statusData?.labActiveLimit ?? statusData?.activeLimit ?? baseActiveLimit);
  const activeLimit = showLabTools ? labActiveLimit : baseActiveLimit;
  const readyChimeras = statusData?.readyChimeras || [];
  const activeChimeras = statusData?.activeChimeras || [];
  const claimedHistory = statusData?.claimedHistory || [];
  const xpSummary = statusData?.xpSummary || { claimedCount: 0, totalXp: 0, totalJackpotsHit: 0 };
  const runeCatalog = statusData?.runeCatalog || [];
  const slotsUsed = activeChimeras.length + readyChimeras.length;

  const activePowerClass =
    ALL_CINEMA_CLASSES.find((c) => c.id === equippedClassId) || ALL_CINEMA_CLASSES[0];
  const activePowerSpec = getClassPowers(activePowerClass?.id)?.powers?.chimera;
  const activePowerTier =
    POWER_TIER_META[activePowerSpec?.tier] || POWER_TIER_META.support;
  const chimeraPowerCharges = Number(classPowerWallet?.chimeraCharges ?? 0);
  const maxChimeraPowerCharges = Number(classPowerWallet?.maxChimeraCharges ?? 2);
  const targetPowerChimeraId =
    selectedPowerChimeraId && activeChimeras.some((c) => Number(c.id) === Number(selectedPowerChimeraId))
      ? Number(selectedPowerChimeraId)
      : activeChimeras[0]?.id
        ? Number(activeChimeras[0].id)
        : undefined;

  const chimeraChoiceOptions = (() => {
    const req = activePowerSpec?.requiresChoice;
    if (!req) return [];
    if (req === 'country_block') {
      return (statusData?.classPowerOptions?.countries || []).map((c) => ({
        value: c.iso,
        label: `${c.name} (${c.blockLabel})`,
      }));
    }
    if (req === 'genre') {
      return (statusData?.classPowerOptions?.genres || []).map((g) => ({
        value: g,
        label: g,
      }));
    }
    if (req === 'tag') {
      return (statusData?.classPowerOptions?.tags || []).map((t) => ({
        value: t,
        label: t,
      }));
    }
    if (req === 'pillar') {
      return [
        { value: 'year', label: '📅 Ano' },
        { value: 'country', label: '🌍 País / Bloco' },
        { value: 'genre', label: '🎭 Gênero' },
        { value: 'tag', label: '🏷️ Tag' },
      ];
    }
    return [];
  })();

  const handleActivateChimeraClassPower = async () => {
    if (!activePowerClass || actingClassPower || actionBusy) return;
    if (!targetPowerChimeraId) {
      setErrorMsg('Forje uma Quimera ativa primeiro antes de aplicar o poder de classe.');
      return;
    }
    if (activePowerSpec?.requiresChoice && !selectedPowerChoice) {
      setErrorMsg('Escolha a opção do poder no seletor antes de ativar.');
      return;
    }
    setActingClassPower(true);
    setErrorMsg('');
    setInfoBanner('');
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/class-power`, {
        classId: activePowerClass.id,
        chimeraId: targetPowerChimeraId,
        choiceValue: activePowerSpec?.requiresChoice ? selectedPowerChoice : undefined,
      });
      if (res.data?.success && res.data?.data) {
        const payload = res.data.data;
        if (payload.chimera && Number(activeRitualContract?.id) === Number(targetPowerChimeraId)) {
          setActiveRitualContract(payload.chimera);
        }
        if (payload.data) applyServerStatus(payload.data);
        if (payload.classWallet) setClassPowerWallet(payload.classWallet);
        setInfoBanner(payload.message || 'Poder da classe ativado na Quimera!');
        setSelectedPowerChoice('');
        dispatchClassPowerSync();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao ativar poder na Quimera.');
    } finally {
      setActingClassPower(false);
    }
  };

  const handleLabGrantClassPower = async () => {
    if (actingClassPower || actionBusy) return;
    setActingClassPower(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/class-powers/lab/grant`, {
        mode: 'chimera',
      });
      if (res.data?.success && res.data?.data) {
        setClassPowerWallet(res.data.data);
        setInfoBanner('⚡ +1 Carga de Poder da Classe (Quimera) adicionada no Lab!');
        dispatchClassPowerSync();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao conceder carga de classe.');
    } finally {
      setActingClassPower(false);
    }
  };
  const ritualInProgress = Boolean(activeRitualContract);
  const canForge = wallet.chipsRemaining > 0 && slotsUsed < activeLimit && !ritualInProgress;
  const isChimeraCycleExhausted =
    !ritualInProgress && slotsUsed === 0 && Number(wallet.chipsRemaining || 0) <= 0;
  const nextChimeraCountdownLabel = isChimeraCycleExhausted ? getCycle15CountdownLabel() : null;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-16">
      {/* Cabeçalho Alquímico + KPIs */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-zinc-950 via-emerald-950/25 to-amber-950/20 p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.12)]">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              {showLabTools ? (
                <button
                  type="button"
                  onClick={() => toggleLabTools(false)}
                  title="Clique para ocultar ferramentas de Laboratório (atalho: Alt+L)"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-cyan-300" />
                  Modo Lab Ativo • Ocultar
                </button>
              ) : (
                <span
                  onDoubleClick={() => toggleLabTools(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-[10px] font-black uppercase tracking-widest select-none"
                >
                  <Dna className="w-3.5 h-3.5" />
                  Dias 1 e 15 • {wallet.weeklyAllowance || 3} Fichas (máx. {maxChipsBank}) •{' '}
                  {wallet.declineChipsRemaining ?? 0} Declínio{(wallet.declineChipsRemaining ?? 0) === 1 ? '' : 's'}{' '}
                  disp. (máx. {maxDeclineBank})
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                ⏳ Recarga: {wallet.nextResetLabel}
              </span>
              {(wallet.nextBlessedRolls || 0) > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-300/60 text-cyan-100 text-[10px] font-black animate-pulse">
                  ✨ Bênção D20 Ativa (Próx. Forja 14–20!)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🧬 Quimera Cinéfila</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed">
              Sorteie uma criatura cinematográfica única combinando{' '}
              <strong className="text-emerald-300">Época</strong>,{' '}
              <strong className="text-sky-300">Bloco Regional</strong>,{' '}
              <strong className="text-purple-300">2 Gêneros</strong> e{' '}
              <strong className="text-amber-300">5 Tags Temáticas</strong>, mais 1 de{' '}
              <strong className="text-purple-200">5 Cartas de Tarô ocultas na Mesa</strong> ({runeCatalog.length || 30} no Códice!). Pesquise qualquer filme real que
              cumpra <strong className="text-white">1 de cada critério</strong> para ganhar o XP Base — e acerte
              os alvos dourados para empilhar <strong className="text-amber-300">Jackpots independentes</strong>!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
            <div className="rounded-2xl bg-zinc-950/80 border border-emerald-500/30 px-3 py-2.5 text-center">
              <div className="text-[10px] uppercase font-black tracking-wider text-emerald-300/80">
                Fichas (1º/15)
              </div>
              <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                {wallet.chipsRemaining}
                <span className="text-xs text-zinc-500">/{maxChipsBank}</span>
              </div>
            </div>
            <div
              title={`Ganha +1 Declínio nos dias 1 e 15 do mês (acumula até ${maxDeclineBank}). Declinar devolve +1 Ficha de Forja!`}
              className="rounded-2xl bg-zinc-950/80 border border-sky-500/30 px-3 py-2.5 text-center"
            >
              <div className="text-[10px] uppercase font-black tracking-wider text-sky-300/80">
                Declínios
              </div>
              <div className="text-xl font-black font-mono text-sky-300 mt-0.5">
                {wallet.declineChipsRemaining ?? 0}
                <span className="text-xs text-zinc-500">/{maxDeclineBank}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 px-3 py-2.5 text-center">
              <div className="text-[10px] uppercase font-black tracking-wider text-zinc-400">Slots Ativos</div>
              <div className="text-xl font-black font-mono text-white mt-0.5">
                {slotsUsed}
                <span className="text-xs text-zinc-500">/{activeLimit}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-950/80 border border-amber-500/30 px-3 py-2.5 text-center">
              <div className="text-[10px] uppercase font-black tracking-wider text-amber-300/80">Jackpots</div>
              <div className="text-xl font-black font-mono text-amber-300 mt-0.5">
                {xpSummary.totalJackpotsHit || 0}
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-950/80 border border-purple-500/30 px-3 py-2.5 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-black tracking-wider text-purple-300/80">XP Colhido</div>
              <div className="text-xl font-black font-mono text-purple-300 mt-0.5">
                +{(xpSummary.totalXp || 0).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ação: Botão Forjar + Toggle Modo Lab */}
        <div className="relative mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleForgeChimera}
              disabled={!canForge || actionBusy}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                canForge && !actionBusy
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-zinc-950 shadow-[0_0_28px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <Dices className={`w-4 h-4 ${ritualInProgress ? 'animate-spin' : ''}`} />
              {ritualInProgress
                ? 'Dado D20 em Jogo...'
                : isChimeraCycleExhausted
                ? `🔒 Recarrega ${wallet.nextResetLabel}`
                : wallet.chipsRemaining <= 0
                ? 'Fichas de Forja Esgotadas'
                : slotsUsed >= activeLimit
                ? `Limite de ${activeLimit} Slots Ativos`
                : '🎲 Lançar D20 do Destino'}
            </button>

            <button
              type="button"
              onClick={() => onOpenAddMovieForChimera({})}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
              Catalogar Filme Manualmente
            </button>

            <button
              type="button"
              onClick={() => setShowRuneCodex(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-400/40 text-purple-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-purple-300" />
              Códice das {runeCatalog.length || 30} Cartas de Tarô
            </button>
          </div>
        </div>

        {/* Painel Lab Expansível (Calibração do Dado D20 + Cartas Lendárias + Simulações) */}
        {showLabTools && (
          <div className="relative mt-4 rounded-2xl border border-cyan-500/35 bg-cyan-950/20 p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-cyan-100">
                <FlaskConical className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Sandbox Lab:</strong> Force o D20 baixo (Pesadelo 1–4) ou alto (Bênção 17–20), garanta
                  Cartas de Tarô Lendárias na mesa e simule capturas douradas à vontade!
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLabGrantChip('forge')}
                  disabled={actionBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +1 Ficha Lab
                </button>
                <button
                  type="button"
                  onClick={() => handleLabGrantChip('decline')}
                  disabled={actionBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +1 Declínio Lab
                </button>
                <button
                  type="button"
                  onClick={handleLabGrantClassPower}
                  disabled={actionBusy || actingClassPower}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  title="Adicionar +1 carga de Poder de Classe para a Quimera"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  +1 Poder Classe
                </button>
                <button
                  type="button"
                  onClick={() => handleLabGrantChip('slot')}
                  disabled={actionBusy || Number(wallet?.labExtraSlots || 0) >= 8}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  title={`Liberar +2 Slots extras de Quimera no Lab (bônus atual: +${Number(wallet?.labExtraSlots || 0)}/8)`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {Number(wallet?.labExtraSlots || 0) >= 8
                    ? 'Slots Lab Máx (+8)'
                    : `+2 Slots Lab${Number(wallet?.labExtraSlots || 0) > 0 ? ` (+${Number(wallet?.labExtraSlots || 0)})` : ''}`}
                </button>
                <button
                  type="button"
                  onClick={handleLabReset}
                  disabled={actionBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Lab
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-cyan-400/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300/90 mr-1">
                  Teste de Dado D20:
                </span>
                {LAB_D20_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setLabD20Mode(m.id)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                      labD20Mode === m.id
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-300 text-zinc-950 border-amber-200 shadow'
                        : 'bg-zinc-950/75 border-cyan-500/30 text-cyan-100 hover:border-amber-400/50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setLabForceLegendary((v) => !v)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                  labForceLegendary
                    ? 'bg-amber-400/25 border-amber-300 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.3)]'
                    : 'bg-zinc-950/75 border-cyan-500/30 text-zinc-300 hover:border-amber-400/40'
                }`}
              >
                👑 {labForceLegendary ? 'Baralho c/ Lendária FORÇADO' : 'Forçar Carta Lendária no Tarô'}
              </button>
            </div>

            {(activeChimeras.length > 0 || readyChimeras.length > 0) && (
              <div className="pt-2.5 border-t border-cyan-400/20 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-300/90">
                  <span>
                    🧬 Fila de Quimeras Ativas ({slotsUsed}/{activeLimit}) — Declinar ou Remover pelo Lab:
                  </span>
                  <span className="text-sky-300 font-mono">
                    Declínios: {wallet.declineChipsRemaining ?? 0} • Fichas: {wallet.chipsRemaining ?? 0}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    ...readyChimeras.map((c) => ({ ...c, _queueStage: 'Pronta' })),
                    ...activeChimeras.map((c) => ({ ...c, _queueStage: 'Em Caça' })),
                  ].map((ch) => (
                    <div
                      key={`lab-q-${ch.id}`}
                      className="rounded-xl border border-cyan-500/25 bg-zinc-950/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            ch._queueStage === 'Pronta'
                              ? 'bg-amber-400/20 border border-amber-400/50 text-amber-200'
                              : 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-200'
                          }`}
                        >
                          #{ch.id} • {ch._queueStage}
                        </span>
                        <span className="text-xs font-bold text-zinc-100 truncate">
                          {ch.recipe?.creatureTitle || `Quimera #${ch.id}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeclineChimera(ch.id)}
                          disabled={actionBusy || (wallet.declineChipsRemaining ?? 0) <= 0}
                          title="Declinar Quimera (+1 Ficha de Forja)"
                          className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/45 text-sky-200 text-[10px] font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          🪶 Declinar (+1 Ficha • {wallet.declineChipsRemaining ?? 0})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscardChimera(ch.id)}
                          disabled={actionBusy}
                          title="Remover Quimera pelo Lab (sem estornar ficha)"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/45 text-rose-200 text-[10px] font-black cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* PAINEL DE PODER DA CLASSE NA QUIMERA */}
      {activePowerSpec && (
        <section className={`rounded-2xl border p-4 flex flex-col gap-3 ${activePowerTier.cardTone}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                {activePowerSpec.icon}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    ⚡ Poder da Classe • Quimera Cinéfila
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${activePowerTier.badgeTone}`}>
                    {activePowerTier.badge}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${
                      chimeraPowerCharges > 0
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                    title={classPowerWallet?.nextReset15Label ? `Recarga: ${classPowerWallet.nextReset15Label}` : undefined}
                  >
                    ⚡ Cargas: {chimeraPowerCharges}/{maxChimeraPowerCharges} (dias 1 e 15)
                  </span>
                </div>
                <div className="text-sm font-black text-white flex flex-wrap items-center gap-2">
                  <span>{activePowerSpec.title}</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-950/90 border border-zinc-700 text-xs font-bold text-emerald-200">
                    <span>{activePowerClass?.classIcon}</span>
                    <span>{activePowerClass?.className}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{activePowerSpec.desc}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeChimeras.length > 1 && (
                <select
                  value={targetPowerChimeraId ? String(targetPowerChimeraId) : ''}
                  onChange={(e) => setSelectedPowerChimeraId(e.target.value)}
                  aria-label="Selecionar Quimera alvo"
                  className="px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-700 text-xs font-bold text-emerald-200 focus:outline-none focus:border-emerald-400"
                >
                  {activeChimeras.map((ch) => (
                    <option key={ch.id} value={String(ch.id)}>
                      🧬 Quimera #{ch.id} ({ch.recipe?.targetYear || ch.recipe?.yearRange || 'Ativa'})
                    </option>
                  ))}
                </select>
              )}

              {activePowerSpec.requiresChoice && (
                <select
                  value={selectedPowerChoice}
                  onChange={(e) => setSelectedPowerChoice(e.target.value)}
                  aria-label="Escolher alvo específico do poder na Quimera"
                  className="px-3 py-2 rounded-xl bg-zinc-950/90 border border-amber-400/50 text-xs font-bold text-amber-200 max-w-[230px] focus:outline-none focus:border-amber-300"
                >
                  <option value="">
                    {activePowerSpec.requiresChoice === 'country_block'
                      ? 'Selecione o País...'
                      : activePowerSpec.requiresChoice === 'genre'
                        ? 'Selecione o Gênero...'
                        : activePowerSpec.requiresChoice === 'tag'
                          ? 'Selecione a Tag...'
                          : 'Selecione o Pilar...'}
                  </option>
                  {chimeraChoiceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                disabled={
                  actionBusy ||
                  actingClassPower ||
                  chimeraPowerCharges <= 0 ||
                  activeChimeras.length === 0 ||
                  Boolean(activePowerSpec.requiresChoice && !selectedPowerChoice)
                }
                onClick={handleActivateChimeraClassPower}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-amber-300 hover:from-emerald-300 hover:to-amber-200 text-slate-950 shadow-lg cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {actingClassPower ? 'Ativando...' : 'Ativar Poder na Quimera'}
              </button>
            </div>
          </div>
        </section>
      )}

      {infoBanner && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/35 px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{infoBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setInfoBanner('')}
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/35 px-4 py-3 flex items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-rose-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cena D20 + Mesa de Tarô Roguelike (4 Categorias na ordem livre) */}
      {activeRitualContract && (
        <ChimeraForgeRitual
          contract={activeRitualContract}
          onSelectFateRune={handleSelectFateRune}
          runeBusy={runeBusy}
          actionBusy={actionBusy}
          onFinishRitual={handleFinishRitual}
          onDeclineChimera={handleDeclineChimera}
          onDiscardChimera={handleDiscardChimera}
          declineChipsRemaining={wallet.declineChipsRemaining ?? 0}
          showLabTools={showLabTools}
        />
      )}

      {/* 1. QUIMERAS DOURADAS (PRONTAS PARA DESPERTAR & COLHER XP) */}
      {readyChimeras.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
              Captura Dourada — Prontas para Despertar ({readyChimeras.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {readyChimeras.map((contract) => {
              const r = contract.recipe;
              const movie = contract.matchedMovie;
              const md = contract.matchDetails || {};

              return (
                <div
                  key={contract.id}
                  className="chimera-golden-ready rounded-3xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-950/45 via-zinc-950 to-emerald-950/35 p-5 sm:p-6"
                >
                  <div className="flex flex-col lg:flex-row gap-5 justify-between">
                    {/* Poster + Filme Capturado */}
                    <div className="flex gap-4 items-start">
                      <div className="w-20 sm:w-24 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-amber-400/70 bg-zinc-900 shrink-0 shadow-lg">
                        {movie?.posterUrl ? (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-300">
                            <Film className="w-7 h-7" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-widest">
                          ✨ Quimera Capturada • #{contract.id}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                          {movie?.title || 'Filme Compatível'}
                          {movie?.releaseYear ? (
                            <span className="text-amber-300 font-mono text-base ml-2">
                              ({movie.releaseYear})
                            </span>
                          ) : null}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-300">
                          {(movie?.countries || []).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700"
                            >
                              {c}
                            </span>
                          ))}
                          {(movie?.genres || []).map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-400/30 text-purple-200"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Checklist dos 4 Pilares + Botão Colher XP */}
                    <div className="flex flex-col justify-between gap-4 lg:min-w-[360px]">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div
                          className={`rounded-xl px-3 py-2 border ${
                            md.baseYearOk === false
                              ? 'border-zinc-700/70 bg-zinc-900/60 text-zinc-400'
                              : md.hitJackpotYear
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.baseYearOk === false
                              ? '♾️ Ano Dispensado'
                              : md.hitJackpotYear
                              ? '🎰 JACKPOT Ano Exato!'
                              : '✅ Ano na Faixa'}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.baseYearOk === false ? 0 : md.hitJackpotYear ? r.baseYearXp + (md.jackpotYearXp || 0) : r.baseYearXp} XP
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-2 border ${
                            md.baseCountryOk === false
                              ? 'border-zinc-700/70 bg-zinc-900/60 text-zinc-400'
                              : md.hitJackpotCountry
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.baseCountryOk === false
                              ? '🧭 País Dispensado'
                              : md.hitJackpotCountry
                              ? '🎰 JACKPOT País!'
                              : '✅ Bloco Regional'}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.baseCountryOk === false ? 0 : md.hitJackpotCountry ? r.baseCountryXp + (md.jackpotCountryXp || 0) : r.baseCountryXp} XP
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-2 border ${
                            md.baseGenreOk === false
                              ? 'border-zinc-700/70 bg-zinc-900/60 text-zinc-400'
                              : md.hitJackpotGenre
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.baseGenreOk === false
                              ? '🕊️ Gênero Dispensado'
                              : md.hitJackpotGenre
                              ? '🎰 JACKPOT 2 Gêneros!'
                              : '✅ Gênero Compatível'}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.baseGenreOk === false ? 0 : md.hitJackpotGenre ? r.baseGenreXp + (md.jackpotGenreXp || 0) : r.baseGenreXp} XP
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-2 border ${
                            md.baseTagOk === false
                              ? 'border-zinc-700/70 bg-zinc-900/60 text-zinc-400'
                              : md.hitJackpotTag
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.baseTagOk === false
                              ? '🌑 Tag Dispensada'
                              : md.hitJackpotTag
                              ? '👑 JACKPOT Tag Ouro!'
                              : `✅ 1/${(r.tags || []).length || 5} Tags`}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.baseTagOk === false ? 0 : md.hitJackpotTag ? r.baseTagXp + (md.jackpotTagXp || 0) : r.baseTagXp} XP
                          </div>
                        </div>
                      </div>

                      {md.hitSpecialBonus && r.specialRule && (
                        <div className="rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-3 py-2 text-[11px] font-bold text-cyan-200 flex items-center justify-between">
                          <span>{r.specialRule.icon} Bônus Especial: {r.specialRule.label}</span>
                          <span className="font-mono text-cyan-100">+{md.specialBonusXp} XP</span>
                        </div>
                      )}

                      {md.hitDubbingBonus && (md.dubbingBonusXp || 0) > 0 && (
                        <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-3 py-2 text-[11px] font-bold text-emerald-200 flex items-center justify-between">
                          <span>🎙️ Bônus Áudio Dublado</span>
                          <span className="font-mono text-emerald-100">+{md.dubbingBonusXp} XP</span>
                        </div>
                      )}

                      {md.hitSubbingBonus && (md.subbingBonusXp || 0) > 0 && (
                        <div className="rounded-xl border border-sky-400/50 bg-sky-500/15 px-3 py-2 text-[11px] font-bold text-sky-200 flex items-center justify-between">
                          <span>💬 Bônus Filme Legendado</span>
                          <span className="font-mono text-sky-100">+{md.subbingBonusXp} XP</span>
                        </div>
                      )}

                      {(md.categoryBoostXp || 0) > 0 && (
                        <div className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-[11px] font-bold text-amber-200 flex items-center justify-between">
                          <span>🗼 Sobrecarga da Torre (+{Math.round((r.categoryXpMultiplierBonusRate || 0.25) * 100)}%/Cat)</span>
                          <span className="font-mono text-amber-100">+{md.categoryBoostXp} XP</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartAwakenCeremony(contract)}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-zinc-950 font-black uppercase text-xs sm:text-sm tracking-wider shadow-[0_0_30px_rgba(251,191,36,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5" />
                        Despertar Quimera & Colher +{md.totalClaimableXp || r.totalBaseXp} XP
                      </button>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeclineChimera(contract.id)}
                          disabled={actionBusy || (wallet.declineChipsRemaining ?? 0) <= 0}
                          title={
                            (wallet.declineChipsRemaining ?? 0) <= 0
                              ? `Sem Declínios disponíveis (1 nos dias 1 e 15 do mês, máx. ${maxDeclineBank}).`
                              : 'Gasta 1 Declínio para cancelar esta Quimera e DEVOLVER +1 Ficha de Forja!'
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 text-[11px] font-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          🪶 Declinar (+1 Ficha • {wallet.declineChipsRemaining ?? 0} disp.)
                        </button>

                        {showLabTools && (
                          <button
                            type="button"
                            onClick={() => handleDiscardChimera(contract.id)}
                            disabled={actionBusy}
                            title="Remover / deletar esta Quimera da fila no Lab (sem estornar ficha de forja)"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/45 text-rose-200 text-[11px] font-black transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remover Quimera (Lab)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. QUIMERAS ATIVAS EM CAÇA */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <Dna className="w-5 h-5 text-emerald-400" />
            Receitas Ativas ({activeChimeras.length})
          </h2>
        </div>

        {activeChimeras.length === 0 && readyChimeras.length === 0 ? (
          isChimeraCycleExhausted ? (
            <div className="chimera-sanctum-card rounded-3xl border-2 border-emerald-400/45 p-7 sm:p-10 text-center flex flex-col items-center gap-5 shadow-2xl">
              <ChimeraCycleRestDisplay cycleKey={wallet.cycleKey || wallet.weekKey} />

              <div className="max-w-xl flex flex-col items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Você já concluiu todas as Quimeras desse ciclo — volte na próxima recarga!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  Os alquimistas apagaram os fornos de{' '}
                  <strong className="text-emerald-300">{formatCycleKeyLabel(wallet.cycleKey || wallet.weekKey, { fallback: 'temporada' })}</strong>: não há mais Quimeras ativas na caçada nem fichas de D20 restantes no momento. Aguarde a virada do ciclo para despertar novas criaturas!
                </p>
              </div>

              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
                <div className="rounded-2xl border border-emerald-400/35 bg-black/45 px-3.5 py-2.5 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-base shrink-0">
                    🎟️
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/90">
                      Fichas de Forja
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      0/{maxChipsBank} (+{wallet.weeklyAllowance || 3} dias 1 e 15)
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-400/35 bg-black/45 px-3.5 py-2.5 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-base shrink-0">
                    👑
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
                      Histórico Total
                    </div>
                    <div className="text-xs font-black text-amber-200 truncate">
                      {xpSummary.claimedCount || claimedHistory.length} Desperta(s) • {xpSummary.totalJackpotsHit || 0} Jackpot(s)
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-400/35 bg-black/45 px-3.5 py-2.5 flex items-center gap-2.5">
                  <CalendarClock className="w-8 h-8 p-1.5 rounded-xl bg-sky-500/15 border border-sky-400/35 text-sky-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300/90">
                      Próxima Recarga
                    </div>
                    <div className="text-[11px] font-black text-sky-100 truncate" title={wallet.nextResetLabel}>
                      {wallet.nextResetLabel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/65 text-xs font-bold text-emerald-200 shadow-inner">
                <Lock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>
                  Forja em descanso •{' '}
                  {nextChimeraCountdownLabel ? (
                    <strong className="text-amber-200">{nextChimeraCountdownLabel}</strong>
                  ) : (
                    <>
                      Recarga em <strong className="text-amber-200">{wallet.nextResetLabel}</strong>
                    </>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center flex flex-col items-center gap-3">
              <Dna className="w-10 h-10 text-emerald-400/60" />
              <div className="text-base font-black text-zinc-200">
                Nenhuma Quimera forjada no momento
              </div>
              <p className="text-xs text-zinc-400 max-w-md">
                Clique em <strong className="text-emerald-300">🎲 Lançar D20 do Destino</strong> acima para sortear
                sua nova criatura com 4 pilares + Jackpots secretos.
              </p>
            </div>
          )
        ) : activeChimeras.length === 0 ? (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-4 text-xs text-amber-200/90 text-center">
            Desperte sua Quimera dourada acima para liberar espaço e forjar uma nova criatura!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {activeChimeras.map((contract) => {
              const r = contract.recipe;
              const maxPossibleXp = (r.totalBaseXp || 0) + (r.maxJackpotBonusXp || 0);
              const chosenRunes =
                Array.isArray(r.chosenFateRunes) && r.chosenFateRunes.length > 0
                  ? r.chosenFateRunes
                  : r.chosenFateRune
                  ? [r.chosenFateRune]
                  : [];
              const runePicksLeft = Number(
                r.runePicksRemaining ?? (chosenRunes.length > 0 ? 0 : Array.isArray(r.fateRunes) && r.fateRunes.length > 0 ? 1 : 0)
              );
              const pendingPillarAction =
                Array.isArray(r.pendingPillarActions) && r.pendingPillarActions.length > 0
                  ? r.pendingPillarActions[0]
                  : r.pendingPillarAction || null;
              const sacSet = new Set(r.sacrificedPillars || []);
              const optSet = new Set(r.optionalPillars || []);

              return (
                <article
                  key={contract.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-5 sm:p-6 shadow-xl flex flex-col gap-5"
                >
                  {/* Topo da Receita */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      {r.creatureTitle && (
                        <div className="text-base sm:text-lg font-black text-white flex flex-wrap items-center gap-2">
                          <span>👾 {r.creatureTitle}</span>
                          {r.creatureSubtitle && (
                            <span className="text-[11px] font-semibold text-amber-200/75">
                              — {r.creatureSubtitle}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                          🧬 Quimera #{contract.id}
                        </span>
                        {r.d20Roll != null && (
                          <span
                            className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                              r.isCriticalD20
                                ? 'bg-amber-400/20 border-amber-300/60 text-amber-200'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                            }`}
                          >
                            🎲 D20: {r.d20Roll}
                            {r.isCriticalD20 ? ' (Crítico!)' : ''}
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] font-mono font-bold">
                          Base: +{r.totalBaseXp} XP • Potencial Máx: +{maxPossibleXp} XP
                        </span>
                        {chosenRunes.map((cr) => {
                          const tarot = getRuneTarotMeta(cr);
                          const crBadgeCls =
                            cr.rarity === 'cursed'
                              ? 'bg-rose-950/60 hover:bg-rose-900/70 border-rose-500/65 text-rose-200'
                              : cr.rarity === 'legendary'
                              ? 'bg-amber-500/20 hover:bg-amber-400/30 border-amber-300/60 text-amber-100'
                              : cr.rarity === 'rare'
                              ? 'bg-sky-500/20 hover:bg-sky-400/30 border-sky-400/55 text-sky-100'
                              : 'bg-purple-500/20 hover:bg-purple-400/30 border-purple-400/45 text-purple-200';
                          return (
                            <button
                              key={cr.id}
                              type="button"
                              onClick={() => setInspectedTarotRune(cr)}
                              title={`Clique para ampliar a carta Arcano ${tarot.roman} (${tarot.name}) — ${cr.label}`}
                              className={`px-2.5 py-1 rounded-full border text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${crBadgeCls}`}
                            >
                              <span className="font-mono text-[10px] opacity-80">{tarot.roman} •</span>
                              <span>
                                {cr.icon} {cr.runeName}
                              </span>
                            </button>
                          );
                        })}
                        {(r.cursedNotes || []).map((note, noteIdx) => (
                          <span
                            key={`cursed-note-${noteIdx}`}
                            className="px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/55 text-rose-200 text-[11px] font-bold"
                          >
                            💀 {note}
                          </span>
                        ))}
                        {(r.requiresDubbedBonusXp || 0) > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/45 text-emerald-200 text-[11px] font-bold">
                            🎙️ Filme Dublado (+{r.requiresDubbedBonusXp} XP)
                          </span>
                        )}
                        {(r.requiresSubbedBonusXp || 0) > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/45 text-sky-200 text-[11px] font-bold">
                            💬 Filme Legendado (+{r.requiresSubbedBonusXp} XP)
                          </span>
                        )}
                        {(r.categoryXpMultiplierBonusRate || 0) > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/45 text-amber-200 text-[11px] font-bold">
                            🗼 Sobrecarga da Torre (+{Math.round(r.categoryXpMultiplierBonusRate * 100)}%/Cat)
                          </span>
                        )}
                        {r.specialRule && (
                          <span
                            title={r.specialRule.hint}
                            className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-[11px] font-bold"
                          >
                            {r.specialRule.icon} {r.specialRule.label} (+{r.specialRule.bonusXp} XP)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeclineChimera(contract.id)}
                        disabled={actionBusy || (wallet.declineChipsRemaining ?? 0) <= 0}
                        title={
                          (wallet.declineChipsRemaining ?? 0) <= 0
                            ? `Sem Declínios disponíveis (1 nos dias 1 e 15 do mês, máx. ${maxDeclineBank}).`
                            : 'Gasta 1 Declínio para cancelar esta Quimera e DEVOLVER +1 Ficha de Forja!'
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 text-[11px] font-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        🪶 Declinar (+1 Ficha • {wallet.declineChipsRemaining ?? 0} disp.)
                      </button>

                      {showLabTools && (
                        <button
                          type="button"
                          onClick={() => handleDiscardChimera(contract.id)}
                          disabled={actionBusy}
                          title="Remover / deletar esta Quimera da fila no Lab (sem estornar ficha de forja)"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/45 text-rose-200 text-[11px] font-black transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remover Quimera (Lab)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cartas de Tarô pendentes se usuário fechou ou ganhou escolhas extras */}
                  {Array.isArray(r.fateRunes) && r.fateRunes.length > 0 && runePicksLeft > 0 && (
                    <div className="rounded-2xl border border-purple-400/45 bg-purple-950/20 p-3.5 flex flex-col gap-3">
                      <span className="text-xs font-bold text-purple-200">
                        🔮 Mesa de Tarô — Escolha{' '}
                        <strong>
                          {runePicksLeft} Carta{runePicksLeft > 1 ? 's' : ''} restante{runePicksLeft > 1 ? 's' : ''}
                        </strong>{' '}
                        da Mesa{r.revealRemainingRarities ? ' (👁️ Raridades Reveladas!)' : ''}:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {r.fateRunes.map((rune, rIdx) => {
                          const isSealed = Boolean(rune.chosen) || chosenRunes.some((cr) => cr.id === rune.id);
                          const tarot = getRuneTarotMeta(rune);
                          const rarityHint =
                            r.revealRemainingRarities && !isSealed
                              ? rune.rarity === 'cursed'
                                ? '💀 Maldição XIII'
                                : rune.rarity === 'legendary'
                                ? '👑 Lendária'
                                : rune.rarity === 'rare'
                                ? '💠 Rara'
                                : '⚪ Comum'
                              : '';
                          return (
                            <button
                              key={rune.id}
                              type="button"
                              disabled={runeBusy}
                              onClick={() =>
                                isSealed ? setInspectedTarotRune(rune) : handleSelectFateRune(contract.id, rune.id)
                              }
                              className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 ${
                                isSealed
                                  ? rune.rarity === 'cursed'
                                    ? 'border-rose-500/70 bg-rose-950/55 hover:bg-rose-900/55 text-rose-100'
                                    : 'border-emerald-400/55 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-100'
                                  : r.revealRemainingRarities && rune.rarity === 'cursed'
                                  ? 'border-rose-500 bg-rose-950/55 hover:bg-rose-900/65 text-rose-100'
                                  : r.revealRemainingRarities && rune.rarity === 'legendary'
                                  ? 'border-amber-400 bg-amber-500/20 hover:bg-amber-400/30 text-amber-100'
                                  : r.revealRemainingRarities && rune.rarity === 'rare'
                                  ? 'border-sky-400 bg-sky-500/20 hover:bg-sky-400/30 text-sky-100'
                                  : 'border-purple-400/50 bg-purple-500/20 hover:border-amber-300 hover:bg-amber-400/20 text-purple-100'
                              }`}
                            >
                              <div className="w-10 aspect-[2/3] rounded-lg overflow-hidden shrink-0 border border-white/15 bg-black">
                                <img
                                  src={isSealed ? tarot.image : TAROT_BACK_IMAGE}
                                  alt={isSealed ? `${tarot.roman} - ${tarot.name}` : `Carta fechada ${rIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1 flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                                  {isSealed ? `Arcano ${tarot.roman}` : `Arcano #${rIdx + 1}`}
                                </span>
                                <span className="text-[11px] font-black leading-tight truncate">
                                  {isSealed ? `${rune.icon} ${rune.runeName}` : 'Carta Oculta'}
                                </span>
                                <span className="text-[10px] opacity-85 truncate mt-0.5">
                                  {isSealed ? 'Ver carta' : rarityHint || 'Despertar'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Seletor Interativo para Poderes de Pilar (Alquimia / Sacrifício) */}
                  {pendingPillarAction && (
                    <div className="chimera-jackpot-pop rounded-2xl border border-amber-400/55 bg-gradient-to-r from-amber-950/40 via-purple-950/35 to-zinc-950 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-amber-100">
                        {pendingPillarAction === 'transmute' ? (
                          <span>
                            🔀 <strong>Alquimia de Categoria Ativa!</strong> Escolha 1 categoria abaixo para{' '}
                            <strong className="text-amber-300">rerrolar com D20 alto (10–20)</strong>:
                          </span>
                        ) : (
                          <span>
                            🗡️ <strong>Sacrifício de Pilar Ativo!</strong> Escolha 1 categoria para{' '}
                            <strong className="text-rose-300">dispensar completamente</strong> (abre mão apenas do XP dela):
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'year', label: '📅 Época', baseXp: r.baseYearXp },
                          { key: 'country', label: '🌍 Bloco', baseXp: r.baseCountryXp },
                          { key: 'genre', label: '🎭 Gêneros', baseXp: r.baseGenreXp },
                          { key: 'tag', label: '🏷️ Tags', baseXp: r.baseTagXp },
                        ]
                          .filter((p) => !sacSet.has(p.key))
                          .map((p) => (
                            <button
                              key={p.key}
                              type="button"
                              disabled={actionBusy}
                              onClick={() => handleApplyPillarAction(contract.id, p.key, pendingPillarAction)}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black cursor-pointer disabled:opacity-50 ${
                                pendingPillarAction === 'transmute'
                                  ? 'bg-sky-500/20 hover:bg-sky-400/30 border-sky-400/55 text-sky-100'
                                  : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-400/55 text-rose-100'
                              }`}
                            >
                              {pendingPillarAction === 'transmute'
                                ? `🔀 Rerrolar ${p.label}`
                                : `🗡️ Sacrificar ${p.label} (-${p.baseXp} XP)`}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Regra especial explicada se houver */}
                  {r.specialRule && (
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-2.5 text-xs text-cyan-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        <strong>Modificador Especial Sorteado:</strong> {r.specialRule.hint}
                      </span>
                    </div>
                  )}

                  {/* Os 4 Pilares (refletem mutações de Runas Comuns, Raras & Lendárias) */}
                  {(() => {
                    const legSet = new Set(r.legendaryJackpotPillars || []);
                    const cursedSet = new Set(r.cursedJackpotPillars || []);
                    const allBlockCountries = Array.from(
                      new Set([...(r.blockCountries || []), ...(r.extraBlockCountries || [])])
                    );
                    const allGoldTags = Array.from(new Set([r.jackpotTag, ...(r.extraJackpotTags || [])].filter(Boolean)));
                    const allGoldTagSet = new Set(allGoldTags);
                    const allGoldGenres = new Set(r.extraJackpotGenres || []);
                    const allJackpotCountries = Array.from(
                      new Set([r.jackpotCountry, ...(r.extraJackpotCountries || []).map((ej) => ej.name)].filter(Boolean))
                    );

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                        {/* Pilar 1: Ano / Época */}
                        <div
                          className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                            sacSet.has('year')
                              ? 'border-zinc-800 bg-zinc-950/60 opacity-65'
                              : legSet.has('year')
                              ? 'chimera-rune-legendary border-amber-300 bg-amber-950/35'
                              : 'border-emerald-500/30 bg-emerald-950/15'
                          }`}
                        >
                          {sacSet.has('year') ? (
                            <div className="text-xs text-rose-300 font-bold py-6 text-center">
                              🗡️ 1. Época Sacrificada
                              <div className="text-[10px] text-zinc-400 font-normal mt-1">Qualquer ano aceito (+0 XP)</div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> 1. Época
                                  </span>
                                  <span className="font-mono">+{r.baseYearXp} XP</span>
                                </div>
                                <div className="text-xl font-black font-mono text-white mt-2">
                                  {r.minYear} — {r.maxYear}
                                  {r.allowPost2000 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-[10px] font-black align-middle">
                                      🚀 ou 2000+
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-emerald-200/75 mt-0.5">
                                  {r.eraLabel} • Faixa de {r.windowSize} anos
                                </div>
                                {optSet.has('year') && (
                                  <div className="mt-2 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
                                    ♾️ Opcional (Completa sem XP se fora)
                                  </div>
                                )}
                              </div>
                              <div
                                className={`rounded-xl border px-3 py-2 text-[11px] flex items-center justify-between gap-1 ${
                                  cursedSet.has('year')
                                    ? 'bg-rose-950/45 border-rose-500/45 text-rose-200'
                                    : 'bg-amber-500/10 border-amber-400/35 text-amber-200'
                                }`}
                              >
                                <span>
                                  {cursedSet.has('year') ? (
                                    <strong>💀 Ceifado pela Morte</strong>
                                  ) : legSet.has('year') ? (
                                    <strong>👑 CATEGORIA 100% JACKPOT!</strong>
                                  ) : r.extraTargetYears?.length ? (
                                    <>🎰 Alvos: <strong>{r.targetYear} / {r.extraTargetYears.join(' / ')}</strong></>
                                  ) : (
                                    <>🎰 Jackpot Exato: <strong>{r.targetYear}</strong></>
                                  )}
                                </span>
                                <span className="font-mono font-black shrink-0">
                                  {cursedSet.has('year') ? '+0 XP' : `+${r.jackpotYearXp} XP`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Pilar 2: Bloco Regional */}
                        <div
                          className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                            sacSet.has('country')
                              ? 'border-zinc-800 bg-zinc-950/60 opacity-65'
                              : legSet.has('country')
                              ? 'chimera-rune-legendary border-amber-300 bg-amber-950/35'
                              : 'border-sky-500/30 bg-sky-950/15'
                          }`}
                        >
                          {sacSet.has('country') ? (
                            <div className="text-xs text-rose-300 font-bold py-6 text-center">
                              🗡️ 2. Bloco Sacrificado
                              <div className="text-[10px] text-zinc-400 font-normal mt-1">Qualquer país aceito (+0 XP)</div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-sky-300">
                                  <span className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" /> 2. Bloco Regional
                                  </span>
                                  <span className="font-mono">+{r.baseCountryXp} XP</span>
                                </div>
                                <div className="text-base font-black text-white mt-2">
                                  {r.blockIcon} {r.blockLabel}
                                  {r.extraBlockLabel ? ` + ${r.extraBlockLabel}` : ''}
                                </div>
                                {optSet.has('country') && (
                                  <div className="mt-1.5 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
                                    🧭 Países Opcionais (Perde XP de País se fora)
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {allBlockCountries.map((c) => {
                                    const isJackCountry = allJackpotCountries.includes(c);
                                    return (
                                      <span
                                        key={c}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                          legSet.has('country') || isJackCountry
                                            ? 'bg-amber-400/15 border-amber-400/45 text-amber-200'
                                            : 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
                                        }`}
                                      >
                                        {isJackCountry ? '🚩 ' : ''}
                                        {c}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                              <div
                                className={`rounded-xl border px-3 py-2 text-[11px] flex items-center justify-between gap-1 ${
                                  cursedSet.has('country')
                                    ? 'bg-rose-950/45 border-rose-500/45 text-rose-200'
                                    : 'bg-amber-500/10 border-amber-400/35 text-amber-200'
                                }`}
                              >
                                <span>
                                  {cursedSet.has('country') ? (
                                    <strong>💀 Ceifado pela Morte</strong>
                                  ) : legSet.has('country') ? (
                                    <strong>👑 BLOCO 100% JACKPOT!</strong>
                                  ) : allJackpotCountries.length > 1 ? (
                                    <>
                                      🎰 Jackpot{r.stackableCountryJackpots ? ' (Acumula)' : ''}:{' '}
                                      <strong>{allJackpotCountries.join(' / ')}</strong>
                                    </>
                                  ) : (
                                    <>🎰 País Jackpot: <strong>{r.jackpotCountry}</strong></>
                                  )}
                                </span>
                                <span className="font-mono font-black shrink-0">
                                  {cursedSet.has('country')
                                    ? '+0 XP'
                                    : `+${r.jackpotCountryXp} XP${r.stackableCountryJackpots ? '×' : ''}`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Pilar 3: Gêneros */}
                        <div
                          className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                            sacSet.has('genre')
                              ? 'border-zinc-800 bg-zinc-950/60 opacity-65'
                              : legSet.has('genre')
                              ? 'chimera-rune-legendary border-amber-300 bg-amber-950/35'
                              : 'border-purple-500/30 bg-purple-950/15'
                          }`}
                        >
                          {sacSet.has('genre') ? (
                            <div className="text-xs text-rose-300 font-bold py-6 text-center">
                              🗡️ 3. Gêneros Sacrificados
                              <div className="text-[10px] text-zinc-400 font-normal mt-1">Qualquer gênero aceito (+0 XP)</div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-purple-300">
                                  <span className="flex items-center gap-1.5">
                                    <Film className="w-3.5 h-3.5" /> 3. Gêneros (1 de {(r.genres || []).length})
                                  </span>
                                  <span className="font-mono">+{r.baseGenreXp} XP</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                                  {(r.genres || []).map((g, gIdx) => {
                                    const isGoldG = legSet.has('genre') || allGoldGenres.has(g);
                                    return (
                                      <React.Fragment key={g}>
                                        {gIdx > 0 && (
                                          <span className="text-[10px] font-black text-zinc-500 uppercase">OU</span>
                                        )}
                                        <span
                                          className={`px-2.5 py-1 rounded-xl border text-xs font-black ${
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
                                {optSet.has('genre') && (
                                  <div className="mt-2 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
                                    🕊️ Gêneros Desativados (Sem XP se fora)
                                  </div>
                                )}
                              </div>
                              <div
                                className={`rounded-xl border px-3 py-2 text-[11px] flex items-center justify-between gap-1 ${
                                  cursedSet.has('genre')
                                    ? 'bg-rose-950/45 border-rose-500/45 text-rose-200'
                                    : 'bg-amber-500/10 border-amber-400/35 text-amber-200'
                                }`}
                              >
                                <span>
                                  {cursedSet.has('genre') ? (
                                    <strong>💀 Ceifado pela Morte</strong>
                                  ) : legSet.has('genre') ? (
                                    <strong>👑 GÊNEROS 100% JACKPOT!</strong>
                                  ) : r.extraJackpotGenres?.length ? (
                                    <>🌀 2+ Gên. ou Ouro ({r.extraJackpotGenres.join(' / ')}) acumulam!</>
                                  ) : (
                                    <>🎰 Quaisquer <strong>2 juntos</strong>!</>
                                  )}
                                </span>
                                <span className="font-mono font-black shrink-0">
                                  {cursedSet.has('genre')
                                    ? '+0 XP'
                                    : `+${r.jackpotGenreXp} XP${r.stackableGenreJackpots ? '×' : ''}`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Pilar 4: 5+ Tags Temáticas */}
                        <div
                          className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                            sacSet.has('tag')
                              ? 'border-zinc-800 bg-zinc-950/60 opacity-65'
                              : legSet.has('tag')
                              ? 'chimera-rune-legendary border-amber-300 bg-amber-950/35'
                              : 'border-amber-500/35 bg-amber-950/15'
                          }`}
                        >
                          {sacSet.has('tag') ? (
                            <div className="text-xs text-rose-300 font-bold py-6 text-center">
                              🗡️ 4. Tags Sacrificadas
                              <div className="text-[10px] text-zinc-400 font-normal mt-1">Qualquer tag aceita (+0 XP)</div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-amber-300">
                                  <span className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" /> 4. Tags (1 de {(r.tags || []).length || 5})
                                  </span>
                                  <span className="font-mono">+{r.baseTagXp} XP</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {(r.tags || []).map((t) => {
                                    const isJackpot = legSet.has('tag') || allGoldTagSet.has(t);
                                    return (
                                      <div
                                        key={t}
                                        className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1.5 ${
                                          isJackpot
                                            ? 'bg-amber-400/20 border-amber-300/60 text-amber-100'
                                            : 'bg-zinc-900/80 border-zinc-700 text-zinc-200'
                                        }`}
                                      >
                                        <span>
                                          {isJackpot ? '👑 ' : '🏷️ '}
                                          {t}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {optSet.has('tag') && (
                                  <div className="mt-2 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold">
                                    🌑 Tags Opcionais (Sem XP se não bater)
                                  </div>
                                )}
                              </div>
                              <div
                                className={`rounded-xl border px-3 py-2 text-[11px] flex items-center justify-between gap-1 ${
                                  cursedSet.has('tag')
                                    ? 'bg-rose-950/45 border-rose-500/45 text-rose-200'
                                    : 'bg-amber-500/10 border-amber-400/35 text-amber-200'
                                }`}
                              >
                                <span>
                                  {cursedSet.has('tag') ? (
                                    <strong>💀 Ceifado pela Morte</strong>
                                  ) : legSet.has('tag') ? (
                                    <strong>👑 TODAS AS TAGS = JACKPOT!</strong>
                                  ) : allGoldTags.length > 1 ? (
                                    <>
                                      ☄️ Ouro{r.stackableTagJackpots ? ' (Acumula)' : ''}:{' '}
                                      <strong>{allGoldTags.join(' / ')}</strong>
                                    </>
                                  ) : (
                                    <>👑 Usar <strong>{r.jackpotTag}</strong></>
                                  )}
                                </span>
                                <span className="font-mono font-black shrink-0">
                                  {cursedSet.has('tag')
                                    ? '+0 XP'
                                    : `+${r.jackpotTagXp} XP${r.stackableTagJackpots ? '×' : ''}`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Sugestões Reais do TMDB (3-5 filmes não assistidos) */}
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Pistas do Radar TMDB ({(r.tmdbSuggestions || []).length} filmes inéditos na faixa & bloco)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Você também pode catalogar <strong className="text-zinc-200">qualquer outro filme</strong>{' '}
                        que combine com os 4 pilares acima.
                      </span>
                    </div>

                    {Array.isArray(r.tmdbSuggestions) && r.tmdbSuggestions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        {r.tmdbSuggestions.map((sug) => (
                          <button
                            key={sug.tmdbId}
                            type="button"
                            onClick={() =>
                              onOpenAddMovieForChimera({
                                tmdbId: sug.tmdbId,
                                title: sug.title,
                                originalTitle: sug.originalTitle,
                                releaseYear: sug.releaseYear,
                              })
                            }
                            className="group text-left rounded-2xl border border-zinc-800 hover:border-amber-400/60 bg-zinc-900/70 hover:bg-zinc-900 p-2.5 flex items-center gap-2.5 transition-all cursor-pointer"
                          >
                            <div className="w-11 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                              {sug.posterUrl ? (
                                <img
                                  src={sug.posterUrl}
                                  alt={sug.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                  <Film className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-zinc-100 truncate group-hover:text-amber-300">
                                {sug.title}
                              </div>
                              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                {sug.releaseYear || '?'} • {sug.voteCount?.toLocaleString('pt-BR') || 0} votos
                              </div>
                              {Array.isArray(sug.genres) && sug.genres.length > 0 && (
                                <div className="text-[10px] text-purple-300/90 truncate mt-0.5">
                                  {sug.genres.slice(0, 2).join(', ')}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 italic">
                        Use a busca por suas tags pessoais ao catalogar um novo filme — qualquer obra compatível
                        acenderá esta Quimera em dourado automaticamente!
                      </div>
                    )}
                  </div>

                  {/* Controles Lab por Quimera */}
                  {showLabTools && (
                    <div className="pt-3 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-cyan-300/90">
                        🧪 Teste instantâneo para Quimera #{contract.id}:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLabSimulateMatch(contract.id, 'normal')}
                          disabled={actionBusy}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                        >
                          ✨ Simular Match Base
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLabSimulateMatch(contract.id, 'full_jackpot')}
                          disabled={actionBusy}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/25 to-emerald-400/25 hover:from-amber-400/40 hover:to-emerald-400/40 border border-amber-300/60 text-amber-100 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                        >
                          🎰 Simular Full Jackpot (4/4)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineChimera(contract.id)}
                          disabled={actionBusy || (wallet.declineChipsRemaining ?? 0) <= 0}
                          className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/45 text-sky-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          🪶 Declinar (+1 Ficha)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscardChimera(contract.id)}
                          disabled={actionBusy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/45 text-rose-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remover (Lab)
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. GRIMÓRIO DE QUIMERAS DESPERTADAS */}
      {claimedHistory.length > 0 && (
        <section className="flex flex-col gap-3 pt-2">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-200 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Grimório de Quimeras Concluídas ({claimedHistory.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {claimedHistory.map((item) => {
              const md = item.matchDetails || {};
              const r = item.recipe;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 flex items-center gap-3.5"
                >
                  <div className="w-12 h-[4.5rem] rounded-xl overflow-hidden bg-zinc-900 border border-amber-500/35 shrink-0">
                    {item.matchedMovie?.posterUrl ? (
                      <img
                        src={item.matchedMovie.posterUrl}
                        alt={item.matchedMovie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white truncate">
                      {item.matchedMovie?.title || `Quimera #${item.id}`}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {r.blockIcon} {r.blockLabel} • {r.minYear}–{r.maxYear}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-black">
                        +{item.xpAwarded} XP
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-200 text-[10px] font-bold">
                        🎰 {md.jackpotsHitCount || 0}/4 Jackpots
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* MODAL RPG DE ABATE & JACKPOT DOURADO AO COLHER XP */}
      <ChimeraAwakenCeremony
        contract={awakenContract}
        revealStep={awakenRevealStep}
        claiming={awakenClaiming}
        claimResult={awakenClaimResult}
        onConfirmClaim={handleConfirmClaimXp}
        onClose={handleCloseAwakenModal}
      />

      {/* MODAL CÓDICE DAS CARTAS DE TARÔ */}
      {showRuneCodex && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-3xl border border-purple-400/50 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(168,85,247,0.28)] flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                  🔮 Grimório Roguelike & Tarô Cinéfilo
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Códice das {runeCatalog.length || 35} Cartas de Tarô (Comuns • Raras • Lendárias • Maldição XIII)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Ao revelar as 4 categorias do D20, 5 cartas de tarô ocultas surgem na mesa. Clique em qualquer carta
                  abaixo para ampliá-la e conferir o significado simbólico, as referências de cinema e a habilidade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRuneCodex(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {[
              {
                key: 'legendary',
                title: '👑 Cartas de Tarô Lendárias — Convertem Categorias Inteiras em Jackpot ou Amplificam XP',
                cardCls: 'border-amber-400/55 bg-amber-950/20 hover:bg-amber-950/35 text-amber-100',
                badgeCls: 'bg-amber-400 text-zinc-950',
              },
              {
                key: 'rare',
                title: '💠 Cartas de Tarô Raras — Fazem 2º Sorteio de Categoria ou Dobram Alvos Jackpot',
                cardCls: 'border-sky-400/50 bg-sky-950/20 hover:bg-sky-950/35 text-sky-100',
                badgeCls: 'bg-sky-400/25 border border-sky-300/60 text-sky-100',
              },
              {
                key: 'common',
                title: '⚪ Cartas de Tarô Comuns — Bônus Diretos & Flexibilidade na Caçada',
                cardCls: 'border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800/85 text-zinc-100',
                badgeCls: 'bg-zinc-700 text-zinc-100',
              },
              {
                key: 'cursed',
                title: '💀 Arcano XIII • A Morte — Maldições Ocultas da Mesa (Cuidado ao puxar às cegas!)',
                cardCls: 'border-rose-500/60 bg-rose-950/30 hover:bg-rose-950/45 text-rose-100',
                badgeCls: 'bg-rose-600/40 border border-rose-400/70 text-rose-100',
              },
            ].map((group) => {
              const items = runeCatalog.filter((x) => x.rarity === group.key);
              if (items.length === 0) return null;
              return (
                <div key={group.key} className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    {group.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((rune) => {
                      const tarot = getRuneTarotMeta(rune);
                      return (
                        <button
                          key={rune.id}
                          type="button"
                          onClick={() => setInspectedTarotRune(rune)}
                          className={`rounded-2xl border p-3 flex items-start gap-3 text-left transition-all cursor-pointer hover:scale-[1.01] ${group.cardCls}`}
                        >
                          <div className="w-14 aspect-[2/3] rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black shadow-md">
                            <img
                              src={tarot.image}
                              alt={`${tarot.roman} - ${tarot.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
                                Arcano {tarot.roman} • {tarot.name}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${group.badgeCls}`}>
                                {rune.shortTag}
                              </span>
                            </div>
                            <span className="text-sm font-black leading-tight">
                              {rune.icon} {rune.runeName}
                            </span>
                            <p className="text-[11px] opacity-90 leading-relaxed">{rune.label}</p>
                            <span className="text-[10px] font-bold opacity-65 mt-0.5">
                              🔍 Clique para ampliar a carta e ver referências
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TarotCardShowcaseModal rune={inspectedTarotRune} onClose={() => setInspectedTarotRune(null)} />
    </div>
  );
}
