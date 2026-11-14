import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, TrendingUp, CheckCircle2, Layers } from 'lucide-react';
import {
  playTrophySound,
  playCollectibleChimeSound,
} from '../utils/trophyAudio';
import { notifyTrophiesStarted, notifyTrophiesCleared } from '../utils/xpSystem';
import { getCleanTrophyTitle } from './TrophyBadges';

export const CATEGORY_LABELS = {
  volta_ao_mundo: 'Volta ao Mundo',
  dna_cinefilo: 'DNA Cinéfilo',
  anatomia_cinema: 'Anatomia do Cinema',
  data_limite: 'Data Limite',
  mafia_hollywood: 'A Máfia de Hollywood',
  tribunal_critica: 'Tribunal da Crítica',
  ritual_cinefilo: 'O Ritual do Cinéfilo',
  sessao_secreta: 'Sessão Secreta',
  multi: 'Multicategoria',
  tags: 'Tags & Curadoria',
  generos: 'Gêneros Cinematográficos',
  comemorativas: 'Datas Comemorativas',
  geral: 'Geral',
};

export const TIER_THEMES = {
  bronze: {
    name: 'Bronze',
    symbol: '🥉',
    color: '#CD7F32',
    border: 'border-[#CD7F32]',
    borderColor: '#E59866',
    rayColor: '#F59E0B',
    badgeBg: 'bg-[#CD7F32]/25 text-[#E5A663] border-[#CD7F32]/70',
    iconBg: 'from-[#CD7F32]/40 to-amber-950/60',
    accentColor: '#CD7F32',
  },
  silver: {
    name: 'Prata',
    symbol: '🥈',
    color: '#C0C0C0',
    border: 'border-zinc-200',
    borderColor: '#E4E4E7',
    rayColor: '#F8FAFC',
    badgeBg: 'bg-zinc-700/50 text-zinc-100 border-zinc-300/70',
    iconBg: 'from-zinc-400/40 to-zinc-800/60',
    accentColor: '#C0C0C0',
  },
  epic: {
    name: 'Épico',
    symbol: '💜',
    color: '#9B59B6',
    border: 'border-purple-400',
    borderColor: '#C084FC',
    rayColor: '#C084FC',
    badgeBg: 'bg-purple-900/40 text-purple-200 border-purple-400/70',
    iconBg: 'from-purple-600/40 to-purple-950/60',
    accentColor: '#9B59B6',
  },
  gold: {
    name: 'Ouro',
    symbol: '🥇',
    color: '#FFD700',
    border: 'border-amber-300',
    borderColor: '#FDE047',
    rayColor: '#FDE047',
    badgeBg: 'bg-amber-500/25 text-amber-200 border-amber-300/80',
    iconBg: 'from-amber-400/40 to-amber-950/60',
    accentColor: '#FFD700',
  },
  mythic: {
    name: 'Mítico',
    symbol: '💎',
    color: '#EF4444',
    border: 'border-rose-500',
    borderColor: '#FB7185',
    rayColor: '#FB7185',
    badgeBg: 'bg-red-950/50 text-red-200 border-red-500/80',
    iconBg: 'from-red-500/40 to-rose-950/60',
    accentColor: '#EF4444',
  },
  platinum: {
    name: 'Platina',
    symbol: '🏆',
    color: '#E5E4E2',
    border: 'border-blue-200',
    borderColor: '#BAE6FD',
    rayColor: '#93C5FD',
    badgeBg: 'bg-blue-950/50 text-blue-100 border-blue-300/80',
    iconBg: 'from-blue-400/40 via-slate-200/30 to-indigo-950/60',
    accentColor: '#E5E4E2',
  },
};

export const TIER_DIFFICULTY_WEIGHT = {
  platinum: 60,
  platina: 60,
  mythic: 50,
  gold: 40,
  epic: 30,
  silver: 20,
  bronze: 10,
};

export function getTrophyPriority(item) {
  if (!item || !item.trophy) return 0;
  const isUnlock = item.type === 'unlock';
  const tierKey = String(item.trophy.tier || 'bronze').toLowerCase();
  const tierWeight = TIER_DIFFICULTY_WEIGHT[tierKey] || 10;

  if (isUnlock) {
    return 1000 + tierWeight;
  } else {
    const pct = Number(item.trophy.progress_percentage ?? item.trophy.percentage) || 0;
    return pct + (tierWeight / 10);
  }
}

export const STORAGE_KEY_DURATION_UNLOCKED = 'cinecatalog_toast_duration_unlocked';
export const STORAGE_KEY_DURATION_PROGRESS = 'cinecatalog_toast_duration_progress';
export const STORAGE_KEY_MAX_PROGRESS = 'cinecatalog_toast_max_progress';

export function getToastSettings() {
  if (typeof window === 'undefined') {
    return { durationUnlocked: 8000, durationProgress: 8000, maxProgress: 99 };
  }
  const u = Number(localStorage.getItem(STORAGE_KEY_DURATION_UNLOCKED)) || 8000;
  const rawMax = localStorage.getItem(STORAGE_KEY_MAX_PROGRESS);
  const m = rawMax !== null && !isNaN(Number(rawMax)) && Number(rawMax) > 0 ? Number(rawMax) : 99;
  return { durationUnlocked: u, durationProgress: u, maxProgress: m };
}

export function saveToastSettings({ durationUnlocked, durationProgress, maxProgress }) {
  if (typeof window === 'undefined') return;
  const unifiedDuration = Number(durationUnlocked || durationProgress);
  if (unifiedDuration > 0) {
    localStorage.setItem(STORAGE_KEY_DURATION_UNLOCKED, String(unifiedDuration));
    localStorage.setItem(STORAGE_KEY_DURATION_PROGRESS, String(unifiedDuration));
  }
  if (maxProgress !== undefined) {
    const val = Number(maxProgress) || 99;
    localStorage.setItem(STORAGE_KEY_MAX_PROGRESS, String(val));
  }
  window.dispatchEvent(new CustomEvent('ps5-toast-settings-updated'));
}

export function triggerPS5TrophyToast(trophy) {
  if (typeof window === 'undefined' || !trophy) return;
  notifyTrophiesStarted();
  window.dispatchEvent(
    new CustomEvent('ps5-trophy-unlock', {
      detail: trophy,
    })
  );
}

export function triggerPS5ProgressToast(progressData) {
  if (typeof window === 'undefined' || !progressData) return;
  notifyTrophiesStarted();
  window.dispatchEvent(
    new CustomEvent('ps5-trophy-progress', {
      detail: progressData,
    })
  );
}

export function triggerTrophyBatch({ progressed = [], unlocked = [] }) {
  if (typeof window === 'undefined') return;
  const { maxProgress } = getToastSettings();
  const limit = maxProgress || 99;

  // Ordena os progressos por relevância (mais próximos de 100% primeiro, depois tier)
  const sortedProgress = [...progressed].sort((a, b) => {
    const pctA =
      Number(
        a.progress_percentage ??
        a.percentage ??
        (a.currentCount && a.targetCount ? (a.currentCount / a.targetCount) * 100 : 0)
      ) || 0;
    const pctB =
      Number(
        b.progress_percentage ??
        b.percentage ??
        (b.currentCount && b.targetCount ? (b.currentCount / b.targetCount) * 100 : 0)
      ) || 0;
    if (pctB !== pctA) return pctB - pctA;
    const wa = TIER_DIFFICULTY_WEIGHT[String(a.tier || 'bronze').toLowerCase()] || 0;
    const wb = TIER_DIFFICULTY_WEIGHT[String(b.tier || 'bronze').toLowerCase()] || 0;
    return wb - wa;
  });

  const cappedProgress = limit >= 99 ? sortedProgress : sortedProgress.slice(0, limit);

  if (unlocked.length > 0 || cappedProgress.length > 0) {
    notifyTrophiesStarted();
  }

  window.dispatchEvent(
    new CustomEvent('ps5-trophy-batch', {
      detail: {
        unlocked,
        progressed: cappedProgress,
      },
    })
  );
}

let toastSequence = 0;
function createToastId(prefix, type) {
  toastSequence += 1;
  return `${prefix || 't'}_${type}_${Date.now()}_${toastSequence}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Card PS5 Compacto e Elegante
 * Otimizado para caber até 5 cards na tela confortavelmente (1 troféu + 4 progressos, ou 5 progressos).
 */
function PS5ToastCard({ toast, onRemove, settings }) {
  const { trophy, toastId, type } = toast;
  const isProgress = type === 'progress';
  const tierKey = String(trophy.tier || 'bronze').toLowerCase();
  const theme = TIER_THEMES[tierKey] || TIER_THEMES.bronze;
  const isPlatinum = tierKey === 'platinum' || tierKey === 'platina';

  const cleanTitle = getCleanTrophyTitle(trophy.title);
  const categoryLabel =
    CATEGORY_LABELS[trophy.category] ||
    (trophy.category === 'dna_cinefilo' ? 'DNA Cinéfilo' : 'Volta ao Mundo');

  const totalDurationMs = settings.durationUnlocked || settings.durationProgress || 8000;
  const [remainingMs, setRemainingMs] = useState(totalDurationMs);
  const [isHovered, setIsHovered] = useState(false);
  const timerStartRef = useRef(0);
  const timerIdRef = useRef(null);
  const hasRemovedRef = useRef(false);

  const safeRemove = useCallback(() => {
    if (hasRemovedRef.current) return;
    hasRemovedRef.current = true;
    onRemove(toastId);
  }, [onRemove, toastId]);

  // Barra de progresso animada
  const previousPct = Number(trophy.previousPercentage) || 0;
  const currentPct = Number(trophy.progress_percentage ?? trophy.percentage) || 0;
  const [animatedPct, setAnimatedPct] = useState(isProgress ? previousPct : currentPct);

  useEffect(() => {
    if (isProgress) {
      const frame = requestAnimationFrame(() => {
        setAnimatedPct(currentPct);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isProgress, currentPct]);

  useEffect(() => {
    if (isHovered) {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    timerStartRef.current = Date.now();
    timerIdRef.current = setTimeout(() => {
      safeRemove();
    }, remainingMs);

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [isHovered, remainingMs, safeRemove]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const elapsed = Date.now() - timerStartRef.current;
    setRemainingMs((prev) => Math.max(prev - elapsed, 500));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const curCount = trophy.currentCount ?? trophy.progress_current ?? 0;
  const tgtCount = trophy.targetCount ?? trophy.progress_target ?? 1;
  const incBy = trophy.increasedBy ?? 1;
  const remainingCount = Math.max(tgtCount - curCount, 0);

  let motivationalSubtext = `${currentPct}%`;
  if (remainingCount === 1) {
    motivationalSubtext = 'Falta 1!';
  } else if (remainingCount <= 5) {
    motivationalSubtext = `Faltam ${remainingCount}!`;
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        animation: 'ps5SlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`pointer-events-auto relative transition-all duration-300 hover:scale-[1.01] ${
        isProgress ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      {/* Raio Elétrico da Cor do Troféu Contornando a Notificação */}
      {!isProgress && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-30"
          aria-hidden="true"
        >
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="16"
            ry="16"
            fill="none"
            stroke={theme.rayColor || theme.accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="22 78"
            style={{
              animation: 'ps5RayTravel 2.8s linear infinite',
              filter: `drop-shadow(0 0 3px #FFFFFF) drop-shadow(0 0 6px ${theme.rayColor || theme.accentColor}) drop-shadow(0 0 12px ${theme.accentColor})`,
            }}
          />
        </svg>
      )}

      {/* Corpo Principal do Card */}
      <div
        className={`relative overflow-hidden bg-zinc-950/95 backdrop-blur-2xl shadow-2xl flex flex-col ${
          isProgress
            ? 'rounded-xl border border-amber-500/35 p-3 sm:p-3.5 gap-2'
            : 'rounded-2xl border border-zinc-700/80 p-3.5 sm:p-4 gap-2.5'
        }`}
      >
        {/* Glow de fundo sutil */}
        <div
          className={`absolute inset-0 pointer-events-none ${isProgress ? 'opacity-15' : 'opacity-20'}`}
          style={{
            background: `radial-gradient(circle at 10% 50%, ${isProgress ? '#F59E0B' : theme.accentColor} 0%, transparent 65%)`,
          }}
        />

        {/* Linha Superior: Ícone + Textos + Fechar */}
        <div className="flex items-start gap-2.5 sm:gap-3 relative z-10">
          {/* Ícone com Halo PSN (Proporções nobres e equilibradas) */}
          <div
            className={`relative shrink-0 rounded-xl flex items-center justify-center shadow-inner ${
              isProgress
                ? 'w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-950 border border-amber-500/50 text-xl'
                : `w-12 h-12 sm:w-13 sm:h-13 bg-gradient-to-br ${theme.iconBg} border border-white/20 text-2xl sm:text-3xl shadow-[0_0_15px_rgba(255,255,255,0.15)] ring-1 ring-white/20`
            }`}
          >
            <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] select-none">
              {trophy.icon || theme.symbol}
            </span>
            {isPlatinum && (
              <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-blue-300 animate-pulse" />
            )}
            {isProgress && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 rounded-full p-0.5 shadow-md">
                <TrendingUp className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </div>

          {/* Conteúdo Textual */}
          <div className="flex-1 min-w-0 pr-1">
            {/* Header Badges */}
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {isProgress ? (
                <>
                  <span className="text-[8.5px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <span>PROGRESSO</span>
                    <span className="font-mono text-[9px] text-amber-200 font-black">+{incBy}</span>
                  </span>
                  <span
                    className={`text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${theme.badgeBg}`}
                  >
                    {theme.symbol} {theme.name}
                  </span>
                </>
              ) : (
                <span
                  className={`text-[9.5px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md border ${theme.badgeBg}`}
                >
                  {theme.symbol} {theme.name}
                </span>
              )}

              <span className="text-[8.5px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 truncate max-w-[130px]">
                {categoryLabel}
              </span>

              {!isProgress && (
                <span className="text-[9.5px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Conquistado!
                </span>
              )}
              {trophy.isGhost && (
                <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-400/50 text-violet-200">
                  👻 Fantasma
                </span>
              )}
            </div>

            {/* Título */}
            <h4
              className={`font-black tracking-tight leading-tight truncate ${
                isProgress
                  ? 'text-xs sm:text-[13px] text-zinc-100'
                  : 'text-sm sm:text-[14.5px] text-white drop-shadow-sm'
              }`}
            >
              {cleanTitle}
            </h4>

            {/* Descrição: aparece no troféu e também no progresso! */}
            {trophy.description && (
              <p
                className={`font-normal leading-snug ${
                  isProgress
                    ? 'text-[11px] sm:text-[11.5px] text-zinc-400 line-clamp-1 mt-0.5'
                    : 'text-xs text-zinc-300 line-clamp-2 leading-relaxed mt-1'
                }`}
              >
                {trophy.description}
              </p>
            )}

            {/* Indicador Numérico e Subtexto para Progresso */}
            {isProgress && (
              <div className="flex items-center justify-between mt-1 gap-2 font-mono">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-amber-300 tracking-tight">
                    {curCount}
                  </span>
                  <span className="text-[10px] text-zinc-500">/</span>
                  <span className="text-[10px] text-zinc-400">
                    {tgtCount}
                  </span>
                  <span className="text-[9.5px] text-zinc-500 ml-1">
                    ({Math.round(currentPct)}%)
                  </span>
                </div>
                <span className="text-[10.5px] font-bold text-amber-400 italic truncate">
                  {motivationalSubtext}
                </span>
              </div>
            )}
          </div>

          {/* Botão de Fechar */}
          <button
            type="button"
            onClick={safeRemove}
            className={`shrink-0 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer ${
              isProgress ? 'p-1' : 'p-1.5'
            }`}
            title="Fechar notificação"
          >
            <X className={isProgress ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </button>
        </div>

        {/* Barra de Progresso Animada */}
        {isProgress && (
          <div className="relative z-10 w-full h-1.5 bg-zinc-900/90 rounded-full overflow-hidden border border-amber-500/25 p-[0.5px]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${Math.min(Math.max(animatedPct, 3), 100)}%` }}
            />
          </div>
        )}

        {/* Linha de Dismiss Timer */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-zinc-800/80 overflow-hidden ${
            isProgress ? 'h-[1.5px]' : 'h-[2.5px]'
          }`}
        >
          <div
            className="h-full origin-left"
            onAnimationEnd={() => {
              if (!isHovered) {
                safeRemove();
              }
            }}
            style={{
              backgroundColor: isProgress ? '#F59E0B' : theme.accentColor,
              animation: `ps5TimerBar ${totalDurationMs}ms linear forwards`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Máximo de cards de progresso por leva embaixo do troféu (1 troféu + 4 progressos = 5 cards na tela)
const MAX_PROGRESS_PER_WAVE = 4;

export default function PS5TrophyToastContainer() {
  const [settings, setSettings] = useState(getToastSettings);

  // Estado gerenciador de Levas (Waves) no Canto Superior Direito:
  // - 1 Troféu Conquistado no topo + até 4 Progressos embaixo se houver
  // - Cada troféu ganha sua própria leva tocando seu som exclusivo
  // - Se uma leva não tiver troféu (só progressos), cabem até 5 progressos na tela!
  const [waveState, setWaveState] = useState({
    visible: [],        // até 5 cards simultâneos na tela (1 troféu + 4 progressos, ou 5 progressos)
    unlockedQueue: [],  // troféus aguardando próximas levas
    progressQueue: [],  // progressos aguardando próximas levas
    waveId: 0,
    soundTarget: null,  // { type: 'unlock', trophy } | { type: 'progress' }
  });

  const lastPlayedWaveRef = useRef(0);

  // Monitora configurações do painel
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getToastSettings());
    };
    window.addEventListener('ps5-toast-settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('ps5-toast-settings-updated', handleSettingsUpdate);
    };
  }, []);

  // Disparo sonoro atômico por Leva:
  // - Se a leva tiver troféu desbloqueado: toca o som do troféu!
  // - Se a leva tiver apenas progressos: toca o som de progresso (anel do Sonic)!
  useEffect(() => {
    if (!waveState.waveId || lastPlayedWaveRef.current === waveState.waveId) return;
    lastPlayedWaveRef.current = waveState.waveId;

    if (waveState.soundTarget) {
      if (waveState.soundTarget.type === 'unlock') {
        const trophy = waveState.soundTarget.trophy;
        playTrophySound(trophy?.tier, trophy);
      } else if (waveState.soundTarget.type === 'progress') {
        playCollectibleChimeSound();
      }
    }
  }, [waveState.waveId, waveState.soundTarget]);

  // Função central para enfileirar e promover levas:
  // 1 troféu no topo + até 4 progressos embaixo dele (ou até 5 progressos se não houver troféu)
  const enqueueBatch = useCallback((newUnlocked = [], newProgress = []) => {
    if (newUnlocked.length === 0 && newProgress.length === 0) return;
    notifyTrophiesStarted();

    setWaveState((prev) => {
      // Deduplicação de troféus
      const existingUnlockKeys = new Set([
        ...prev.visible.filter((t) => t.type === 'unlock').map((t) => t.trophy?.id || t.trophy?.title),
        ...prev.unlockedQueue.map((t) => t.trophy?.id || t.trophy?.title),
      ]);

      const filteredUnlocked = newUnlocked.filter((item) => {
        const key = item.trophy?.id || item.trophy?.title;
        if (existingUnlockKeys.has(key)) return false;
        existingUnlockKeys.add(key);
        return true;
      });

      // Deduplicação de progressos
      const existingProgressKeys = new Set([
        ...prev.visible.filter((t) => t.type === 'progress').map((t) => t.trophy?.id || t.trophy?.title),
        ...prev.progressQueue.map((t) => t.trophy?.id || t.trophy?.title),
      ]);

      const filteredProgress = newProgress.filter((item) => {
        const key = item.trophy?.id || item.trophy?.title;
        if (existingProgressKeys.has(key)) return false;
        existingProgressKeys.add(key);
        return true;
      });

      if (filteredUnlocked.length === 0 && filteredProgress.length === 0) return prev;

      // Junta com filas pendentes e ordena por prioridade
      const allUnlocked = [...prev.unlockedQueue, ...filteredUnlocked];
      allUnlocked.sort((a, b) => getTrophyPriority(b) - getTrophyPriority(a));

      const allProgress = [...prev.progressQueue, ...filteredProgress];
      allProgress.sort((a, b) => getTrophyPriority(b) - getTrophyPriority(a));

      // Se a tela estiver vazia, monta a primeira leva imediatamente!
      if (prev.visible.length === 0) {
        const toShow = [];
        let remainingUnlocked = allUnlocked;
        let remainingProgress = allProgress;
        let soundTarget = null;

        if (allUnlocked.length > 0) {
          // 1 Troféu em cima!
          const leadTrophy = allUnlocked[0];
          remainingUnlocked = allUnlocked.slice(1);
          toShow.push(leadTrophy);

          // E até 4 progressos embaixo dele!
          const toShowProgress = allProgress.slice(0, MAX_PROGRESS_PER_WAVE);
          remainingProgress = allProgress.slice(MAX_PROGRESS_PER_WAVE);
          toShow.push(...toShowProgress);

          soundTarget = { type: 'unlock', trophy: leadTrophy.trophy };
        } else if (allProgress.length > 0) {
          // Apenas progressos (até 5 cards na tela)
          const toShowProgress = allProgress.slice(0, MAX_PROGRESS_PER_WAVE + 1);
          remainingProgress = allProgress.slice(MAX_PROGRESS_PER_WAVE + 1);
          toShow.push(...toShowProgress);

          soundTarget = { type: 'progress' };
        }

        return {
          visible: toShow,
          unlockedQueue: remainingUnlocked,
          progressQueue: remainingProgress,
          waveId: prev.waveId + 1,
          soundTarget,
        };
      }

      // Se já houver cards na tela, adiciona às filas de espera para as próximas levas
      return {
        ...prev,
        unlockedQueue: allUnlocked,
        progressQueue: allProgress,
      };
    });
  }, []);

  // Remoção atômica por leva:
  // Quando todos os cards da leva atual terminam (ou o usuário fecha todos),
  // a próxima leva assume o comando com seu som exclusivo!
  const removeToast = useCallback((toastId) => {
    setWaveState((prev) => {
      const newVisible = prev.visible.filter((t) => t.toastId !== toastId);
      if (newVisible.length === prev.visible.length) return prev;

      // Se ainda sobraram cards da leva atual na tela, apenas remove o card
      if (newVisible.length > 0) {
        return {
          ...prev,
          visible: newVisible,
        };
      }

      // Toda a leva atual terminou! Verifica se há próximas levas na fila
      if (prev.unlockedQueue.length > 0 || prev.progressQueue.length > 0) {
        const allUnlocked = prev.unlockedQueue;
        const allProgress = prev.progressQueue;
        const toShow = [];
        let remainingUnlocked = allUnlocked;
        let remainingProgress = allProgress;
        let soundTarget = null;

        if (allUnlocked.length > 0) {
          // Próximo troféu desbloqueado em cima!
          const leadTrophy = allUnlocked[0];
          remainingUnlocked = allUnlocked.slice(1);
          toShow.push(leadTrophy);

          // E até 4 progressos embaixo dele!
          const toShowProgress = allProgress.slice(0, MAX_PROGRESS_PER_WAVE);
          remainingProgress = allProgress.slice(MAX_PROGRESS_PER_WAVE);
          toShow.push(...toShowProgress);

          soundTarget = { type: 'unlock', trophy: leadTrophy.trophy };
        } else if (allProgress.length > 0) {
          // Apenas progressos restantes (até 5 cards)
          const toShowProgress = allProgress.slice(0, MAX_PROGRESS_PER_WAVE + 1);
          remainingProgress = allProgress.slice(MAX_PROGRESS_PER_WAVE + 1);
          toShow.push(...toShowProgress);

          soundTarget = { type: 'progress' };
        }

        return {
          visible: toShow,
          unlockedQueue: remainingUnlocked,
          progressQueue: remainingProgress,
          waveId: prev.waveId + 1,
          soundTarget,
        };
      }

      return {
        ...prev,
        visible: newVisible,
      };
    });
  }, []);

  // Listeners de eventos
  useEffect(() => {
    const handleUnlockEvent = (e) => {
      if (e?.detail) {
        const item = {
          toastId: createToastId(e.detail.id, 'unlock'),
          trophy: e.detail,
          type: 'unlock',
          createdAt: Date.now(),
        };
        enqueueBatch([item], []);
      }
    };

    const handleProgressEvent = (e) => {
      if (e?.detail) {
        const item = {
          toastId: createToastId(e.detail.id, 'progress'),
          trophy: e.detail,
          type: 'progress',
          createdAt: Date.now(),
        };
        enqueueBatch([], [item]);
      }
    };

    const handleBatchEvent = (e) => {
      const { unlocked = [], progressed = [] } = e?.detail || {};

      const unlockItems = unlocked.map((u) => ({
        toastId: createToastId(u.id, 'unlock'),
        trophy: u,
        type: 'unlock',
        createdAt: Date.now(),
      }));

      const progressItems = progressed.map((p) => ({
        toastId: createToastId(p.id, 'progress'),
        trophy: p,
        type: 'progress',
        createdAt: Date.now(),
      }));

      enqueueBatch(unlockItems, progressItems);
    };

    window.addEventListener('ps5-trophy-unlock', handleUnlockEvent);
    window.addEventListener('ps5-trophy-progress', handleProgressEvent);
    window.addEventListener('ps5-trophy-batch', handleBatchEvent);

    return () => {
      window.removeEventListener('ps5-trophy-unlock', handleUnlockEvent);
      window.removeEventListener('ps5-trophy-progress', handleProgressEvent);
      window.removeEventListener('ps5-trophy-batch', handleBatchEvent);
    };
  }, [enqueueBatch]);

  // Sincronização estrita com o sistema de XP:
  const isActive =
    waveState.visible.length > 0 ||
    waveState.unlockedQueue.length > 0 ||
    waveState.progressQueue.length > 0;
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      notifyTrophiesStarted();
    } else if (wasActiveRef.current) {
      wasActiveRef.current = false;
      const timer = setTimeout(() => {
        notifyTrophiesCleared();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (wasActiveRef.current) {
        notifyTrophiesCleared();
      }
    };
  }, []);

  if (!isActive) return null;

  const remainingTrophiesCount = waveState.unlockedQueue.length;
  const remainingProgressCount = waveState.progressQueue.length;
  const hasQueueIndicator = remainingTrophiesCount > 0 || remainingProgressCount > 0;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2 max-w-[410px] w-full max-sm:left-3 max-sm:right-3 max-sm:w-auto"
    >
      {/* Indicador Unificado de Fila no Topo de Tudo (Escreve junto Troféus e Progressos na fila) */}
      {hasQueueIndicator && (
        <div className="self-end px-3 py-1 rounded-full bg-zinc-950/95 border border-zinc-700/80 text-[10px] font-mono font-bold text-zinc-300 shadow-xl flex items-center gap-1.5 animate-pulse backdrop-blur-md pointer-events-auto">
          <Layers className="w-3 h-3 text-amber-400 shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {remainingTrophiesCount > 0 && (
              <span className="text-amber-300 flex items-center gap-1">
                <span>🏆</span>
                <span>
                  +{remainingTrophiesCount}{' '}
                  {remainingTrophiesCount === 1 ? 'troféu' : 'troféus'}
                </span>
              </span>
            )}
            {remainingTrophiesCount > 0 && remainingProgressCount > 0 && (
              <span className="text-zinc-500 font-bold">•</span>
            )}
            {remainingProgressCount > 0 && (
              <span className="text-cyan-300 flex items-center gap-1">
                <span>🎯</span>
                <span>
                  +{remainingProgressCount}{' '}
                  {remainingProgressCount === 1 ? 'progresso' : 'progressos'}
                </span>
              </span>
            )}
            <span className="text-zinc-400 font-normal">na fila</span>
          </div>
        </div>
      )}

      {/* Cards Visíveis da Leva Atual:
          1 Troféu em cima e até 4 de progresso embaixo dele (cabe 5 na tela perfeitamente!) */}
      {waveState.visible.map((toast) => (
        <PS5ToastCard
          key={toast.toastId}
          toast={toast}
          onRemove={removeToast}
          settings={settings}
        />
      ))}

      {/* Animações CSS */}
      <style>{`
        @keyframes ps5SlideIn {
          0% {
            opacity: 0;
            transform: translate3d(30px, -10px, 0) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @keyframes ps5TimerBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        @keyframes ps5RayTravel {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
}
