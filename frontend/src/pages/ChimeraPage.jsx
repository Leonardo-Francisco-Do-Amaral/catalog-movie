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
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { triggerXPGainToast, dispatchXpStatusUpdate } from '../utils/xpSystem';
import {
  playChimeraJackpotTickSound,
  playChimeraJackpotFanfareSound,
  playChimeraAwakenSound,
  playChimeraRunePickSound,
} from '../utils/trophyAudio';
import ChimeraForgeRitual from '../components/ChimeraForgeRitual';
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
    window.dispatchEvent(new CustomEvent('cine-chimera-sync'));
  }
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

  // Cena D20 + Altar das Runas Roguelike
  const [labD20Mode, setLabD20Mode] = useState('auto');
  const [labForceLegendary, setLabForceLegendary] = useState(false);
  const [showRuneCodex, setShowRuneCodex] = useState(false);
  const [activeRitualContract, setActiveRitualContract] = useState(null);
  const [runeBusy, setRuneBusy] = useState(false);

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
      const res = await axios.get(`${API_BASE_URL}/chimeras/status`);
      if (res.data?.success && res.data?.data) {
        setStatusData(res.data.data);
        onStatusLoaded(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao carregar a Quimera Cinéfila.');
    } finally {
      setLoading(false);
    }
  }, [onStatusLoaded]);

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
    const onExternalSync = () => {
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
    try {
      const res = await axios.post(`${API_BASE_URL}/chimeras/pick-rune`, { chimeraId, runeId });
      const chosenRarity = res.data?.chimera?.recipe?.chosenFateRune?.rarity || 'common';
      playChimeraRunePickSound(chosenRarity);
      if (res.data?.chimera) {
        setActiveRitualContract(res.data.chimera);
      }
      if (res.data?.data) {
        applyServerStatus(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Erro ao selar Runa de Destino.');
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
      applyServerStatus(res.data?.data);
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
      applyServerStatus(res.data?.data);
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
      const res = await axios.post(`${API_BASE_URL}/chimeras/lab/grant-chip`, {
        amount: 1,
        type: chipType === 'decline' ? 'decline' : 'forge',
      });
      applyServerStatus(res.data?.data);
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
      applyServerStatus(res.data?.data, res.data?.xpStatus);
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
    nextResetLabel: 'Ciclo de 15 dias (Brasília)',
  };
  const maxChipsBank = Number(wallet.maxChipsBank || 5);
  const maxDeclineBank = Number(wallet.maxDeclineBank || 2);
  const cycleDays = Number(wallet.cycleDays || 15);
  const activeLimit = statusData?.activeLimit || 2;
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
                  Ciclo {cycleDays} Dias • {wallet.weeklyAllowance || 3} Fichas (máx. {maxChipsBank}) • 1 Declínio (máx. {maxDeclineBank})
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
              <strong className="text-purple-200">5 Runas ocultas no Altar</strong> ({runeCatalog.length || 27} no Códice!). Pesquise qualquer filme real que
              cumpra <strong className="text-white">1 de cada critério</strong> para ganhar o XP Base — e acerte
              os alvos dourados para empilhar <strong className="text-amber-300">Jackpots independentes</strong>!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
            <div className="rounded-2xl bg-zinc-950/80 border border-emerald-500/30 px-3 py-2.5 text-center">
              <div className="text-[10px] uppercase font-black tracking-wider text-emerald-300/80">
                Fichas ({cycleDays}d)
              </div>
              <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                {wallet.chipsRemaining}
                <span className="text-xs text-zinc-500">/{maxChipsBank}</span>
              </div>
            </div>
            <div
              title={`Ganha +1 Declínio a cada ${cycleDays} dias (acumula até ${maxDeclineBank}). Declinar devolve +1 Ficha de Forja!`}
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
              Códice das {runeCatalog.length || 27} Runas
            </button>
          </div>
        </div>

        {/* Painel Lab Expansível (Calibração do Dado D20 + Runas Lendárias + Simulações) */}
        {showLabTools && (
          <div className="relative mt-4 rounded-2xl border border-cyan-500/35 bg-cyan-950/20 p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-cyan-100">
                <FlaskConical className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Sandbox Lab:</strong> Force o D20 baixo (Pesadelo 1–4) ou alto (Bênção 17–20), garanta
                  Runas Lendárias no altar e simule capturas douradas à vontade!
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
                👑 {labForceLegendary ? 'Baralho c/ Lendária FORÇADO' : 'Forçar Runa Lendária no Altar'}
              </button>
            </div>
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
                    ⚡ Cargas: {chimeraPowerCharges}/{maxChimeraPowerCharges} (15 dias)
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

      {/* Cena D20 + Altar Roguelike (4 Categorias na ordem livre) */}
      {activeRitualContract && (
        <ChimeraForgeRitual
          contract={activeRitualContract}
          onSelectFateRune={handleSelectFateRune}
          runeBusy={runeBusy}
          onFinishRitual={handleFinishRitual}
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
                            md.hitJackpotYear
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.hitJackpotYear ? '🎰 JACKPOT Ano Exato!' : '✅ Ano na Faixa'}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.hitJackpotYear ? r.baseYearXp + (md.jackpotYearXp || 0) : r.baseYearXp} XP
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-2 border ${
                            md.hitJackpotCountry
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.hitJackpotCountry ? '🎰 JACKPOT País!' : '✅ Bloco Regional'}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.hitJackpotCountry ? r.baseCountryXp + (md.jackpotCountryXp || 0) : r.baseCountryXp} XP
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-2 border ${
                            md.hitJackpotGenre
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.hitJackpotGenre ? '🎰 JACKPOT 2 Gêneros!' : '✅ 1/2 Gêneros'}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.hitJackpotGenre ? r.baseGenreXp + (md.jackpotGenreXp || 0) : r.baseGenreXp} XP
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-2 border ${
                            md.hitJackpotTag
                              ? 'border-amber-400/70 bg-amber-400/15 text-amber-200'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          <div className="font-black">
                            {md.hitJackpotTag ? '👑 JACKPOT Tag Ouro!' : `✅ 1/${(r.tags || []).length || 5} Tags`}
                          </div>
                          <div className="font-mono text-[10px] opacity-90">
                            +{md.hitJackpotTag ? r.baseTagXp + (md.jackpotTagXp || 0) : r.baseTagXp} XP
                          </div>
                        </div>
                      </div>

                      {md.hitSpecialBonus && r.specialRule && (
                        <div className="rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-3 py-2 text-[11px] font-bold text-cyan-200 flex items-center justify-between">
                          <span>{r.specialRule.icon} Bônus Especial: {r.specialRule.label}</span>
                          <span className="font-mono text-cyan-100">+{md.specialBonusXp} XP</span>
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
                        {chosenRunes.map((cr) => (
                          <span
                            key={cr.id}
                            title={cr.label}
                            className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/45 text-purple-200 text-[11px] font-bold"
                          >
                            {cr.icon} {cr.runeName}
                          </span>
                        ))}
                        {(r.requiresDubbedBonusXp || 0) > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/45 text-emerald-200 text-[11px] font-bold">
                            🎙️ Filme Dublado (+{r.requiresDubbedBonusXp} XP)
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
                            ? `Sem Declínios disponíveis (1 a cada ${cycleDays} dias, máx. ${maxDeclineBank}).`
                            : 'Gasta 1 Declínio para cancelar esta Quimera e DEVOLVER +1 Ficha de Forja!'
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 text-[11px] font-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        🪶 Declinar (+1 Ficha)
                      </button>

                      {showLabTools && (
                        <button
                          type="button"
                          onClick={() => handleDiscardChimera(contract.id)}
                          disabled={actionBusy}
                          title="Descartar no Lab (sem devolver ficha)"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Descartar (Lab)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Runas pendentes se usuário fechou ou ganhou escolhas extras */}
                  {Array.isArray(r.fateRunes) && r.fateRunes.length > 0 && runePicksLeft > 0 && (
                    <div className="rounded-2xl border border-purple-400/45 bg-purple-950/20 p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-purple-200">
                        🔮 Escolha{' '}
                        <strong>
                          {runePicksLeft} Runa{runePicksLeft > 1 ? 's' : ''} restante{runePicksLeft > 1 ? 's' : ''}
                        </strong>{' '}
                        do Altar{r.revealRemainingRarities ? ' (👁️ Raridades Reveladas!)' : ''}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {r.fateRunes.map((rune, rIdx) => {
                          const isSealed = Boolean(rune.chosen) || chosenRunes.some((cr) => cr.id === rune.id);
                          const rarityHint =
                            r.revealRemainingRarities && !isSealed
                              ? rune.rarity === 'legendary'
                                ? ' • 👑 Lendária'
                                : rune.rarity === 'rare'
                                ? ' • 💠 Rara'
                                : ' • ⚪ Comum'
                              : '';
                          return (
                            <button
                              key={rune.id}
                              type="button"
                              disabled={runeBusy || isSealed}
                              onClick={() => handleSelectFateRune(contract.id, rune.id)}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black ${
                                isSealed
                                  ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200 cursor-default'
                                  : r.revealRemainingRarities && rune.rarity === 'legendary'
                                  ? 'border-amber-400 bg-amber-500/20 hover:bg-amber-400/30 text-amber-100 cursor-pointer'
                                  : r.revealRemainingRarities && rune.rarity === 'rare'
                                  ? 'border-sky-400 bg-sky-500/20 hover:bg-sky-400/30 text-sky-100 cursor-pointer'
                                  : 'border-purple-400/50 bg-purple-500/20 hover:border-amber-300 hover:bg-amber-400/20 text-purple-100 cursor-pointer'
                              }`}
                            >
                              {isSealed ? `${rune.icon} ${rune.runeName}` : `🔮 Runa #${rIdx + 1}${rarityHint}`}
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
                              </div>
                              <div className="rounded-xl bg-amber-500/10 border border-amber-400/35 px-3 py-2 text-[11px] text-amber-200 flex items-center justify-between gap-1">
                                <span>
                                  {legSet.has('year') ? (
                                    <strong>👑 CATEGORIA 100% JACKPOT!</strong>
                                  ) : r.extraTargetYears?.length ? (
                                    <>🎰 Alvos: <strong>{r.targetYear} / {r.extraTargetYears.join(' / ')}</strong></>
                                  ) : (
                                    <>🎰 Jackpot Exato: <strong>{r.targetYear}</strong></>
                                  )}
                                </span>
                                <span className="font-mono font-black shrink-0">+{r.jackpotYearXp} XP</span>
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
                              <div className="rounded-xl bg-amber-500/10 border border-amber-400/35 px-3 py-2 text-[11px] text-amber-200 flex items-center justify-between gap-1">
                                <span>
                                  {legSet.has('country') ? (
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
                                  +{r.jackpotCountryXp} XP{r.stackableCountryJackpots ? '×' : ''}
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
                              </div>
                              <div className="rounded-xl bg-amber-500/10 border border-amber-400/35 px-3 py-2 text-[11px] text-amber-200 flex items-center justify-between gap-1">
                                <span>
                                  {legSet.has('genre') ? (
                                    <strong>👑 GÊNEROS 100% JACKPOT!</strong>
                                  ) : r.extraJackpotGenres?.length ? (
                                    <>🌀 2+ Gên. ou Ouro ({r.extraJackpotGenres.join(' / ')}) acumulam!</>
                                  ) : (
                                    <>🎰 Quaisquer <strong>2 juntos</strong>!</>
                                  )}
                                </span>
                                <span className="font-mono font-black shrink-0">
                                  +{r.jackpotGenreXp} XP{r.stackableGenreJackpots ? '×' : ''}
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
                              </div>
                              <div className="rounded-xl bg-amber-500/10 border border-amber-400/35 px-3 py-2 text-[11px] text-amber-200 flex items-center justify-between gap-1">
                                <span>
                                  {legSet.has('tag') ? (
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
                                  +{r.jackpotTagXp} XP{r.stackableTagJackpots ? '×' : ''}
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

      {/* MODAL CÓDICE DAS 27 RUNAS ROGUELIKE */}
      {showRuneCodex && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl border border-purple-400/50 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(168,85,247,0.28)] flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                  🔮 Grimório Roguelike da Quimera
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Códice das {runeCatalog.length} Runas (Comuns • Raras • Lendárias)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Ao revelar as 4 categorias do D20, 5 runas ocultas surgem no altar sem revelar raridade nem efeito.
                  Rolagens baixas (1–4) elevam o desafio e aumentam a chance de virem Runas Raras e Lendárias!
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
                title: '👑 Runas Lendárias — Convertem Categorias Inteiras em Jackpot ou Amplificam XP',
                cardCls: 'border-amber-400/55 bg-amber-950/20 text-amber-100',
                badgeCls: 'bg-amber-400 text-zinc-950',
              },
              {
                key: 'rare',
                title: '💠 Runas Raras — Fazem 2º Sorteio de Categoria ou Dobram Alvos Jackpot',
                cardCls: 'border-sky-400/50 bg-sky-950/20 text-sky-100',
                badgeCls: 'bg-sky-400/25 border border-sky-300/60 text-sky-100',
              },
              {
                key: 'common',
                title: '⚪ Runas Comuns — Bônus Diretos & Flexibilidade na Caçada',
                cardCls: 'border-zinc-700 bg-zinc-900/80 text-zinc-100',
                badgeCls: 'bg-zinc-700 text-zinc-100',
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
                    {items.map((rune) => (
                      <div key={rune.id} className={`rounded-2xl border p-3.5 flex flex-col gap-1 ${group.cardCls}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black">
                            {rune.icon} {rune.runeName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${group.badgeCls}`}>
                            {rune.shortTag}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed">{rune.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
