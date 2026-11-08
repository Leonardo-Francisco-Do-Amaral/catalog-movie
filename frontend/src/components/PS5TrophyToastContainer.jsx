import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, TrendingUp, CheckCircle2, Award, Layers } from 'lucide-react';
import { playTrophySound, playCollectibleChimeSound } from '../utils/trophyAudio';
import { notifyTrophiesStarted, notifyTrophiesCleared } from '../utils/xpSystem';
import { getCleanTrophyTitle } from './TrophyBadges';

export const CATEGORY_LABELS = {
  volta_ao_mundo: 'Volta ao Mundo',
  dna_cinefilo: 'DNA Cinéfilo',
  anatomia_cinema: 'Anatomia do Cinema',
  data_limite: 'Data Limite',
  universos_sagas: 'Universos & Sagas',
  mafia_hollywood: 'A Máfia de Hollywood',
  tribunal_critica: 'Tribunal da Crítica',
  ritual_cinefilo: 'O Ritual do Cinéfilo',
  sessao_secreta: 'Sessão Secreta',
  calcada_da_fama: 'Calçada da Fama',
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
    border: 'border-[#CD7F32]/60',
    glow: 'shadow-[0_0_25px_rgba(205,127,50,0.35)]',
    badgeBg: 'bg-[#CD7F32]/20 text-[#E5A663] border-[#CD7F32]/50',
    iconBg: 'from-[#CD7F32]/30 to-amber-950/40',
    accentColor: '#CD7F32',
  },
  silver: {
    name: 'Prata',
    symbol: '🥈',
    color: '#C0C0C0',
    border: 'border-[#C0C0C0]/60',
    glow: 'shadow-[0_0_25px_rgba(192,192,192,0.35)]',
    badgeBg: 'bg-zinc-700/40 text-zinc-100 border-zinc-400/50',
    iconBg: 'from-zinc-400/30 to-zinc-800/40',
    accentColor: '#C0C0C0',
  },
  epic: {
    name: 'Épico',
    symbol: '💜',
    color: '#9B59B6',
    border: 'border-[#9B59B6]/60',
    glow: 'shadow-[0_0_30px_rgba(155,89,182,0.45)]',
    badgeBg: 'bg-purple-900/30 text-purple-300 border-purple-500/50',
    iconBg: 'from-purple-600/30 to-purple-950/40',
    accentColor: '#9B59B6',
  },
  gold: {
    name: 'Ouro',
    symbol: '🥇',
    color: '#FFD700',
    border: 'border-[#FFD700]/70',
    glow: 'shadow-[0_0_35px_rgba(255,215,0,0.45)]',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/60',
    iconBg: 'from-amber-400/30 to-amber-950/40',
    accentColor: '#FFD700',
  },
  mythic: {
    name: 'Mítico',
    symbol: '💎',
    color: '#EF4444',
    border: 'border-[#EF4444]/70',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.5)]',
    badgeBg: 'bg-red-950/40 text-red-300 border-red-500/60',
    iconBg: 'from-red-500/30 to-rose-950/40',
    accentColor: '#EF4444',
  },
  platinum: {
    name: 'Platina',
    symbol: '🏆',
    color: '#E5E4E2',
    border: 'border-[#E5E4E2]/80',
    glow: 'shadow-[0_0_45px_rgba(229,228,226,0.6),0_0_25px_rgba(59,130,246,0.4)]',
    badgeBg: 'bg-blue-950/40 text-blue-200 border-blue-300/60',
    iconBg: 'from-blue-400/30 via-slate-200/20 to-indigo-950/50',
    accentColor: '#E5E4E2',
  },
};

/**
 * Peso de dificuldade/raridade para ordenação de exibição:
 * Platina (mais difícil) -> Mítico -> Ouro -> Épico -> Prata -> Bronze
 */
export const TIER_DIFFICULTY_WEIGHT = {
  platinum: 60,
  platina: 60,
  mythic: 50,
  gold: 40,
  epic: 30,
  silver: 20,
  bronze: 10,
};

/**
 * Calcula a prioridade de exibição:
 * - Troféus Conquistados (100% / unlock): 1010 a 1060 (aparecem sempre primeiro, do mais difícil para o mais fácil)
 * - Colecionáveis (progress): 0 a 100 (aparecem sempre por último)
 */
export function getTrophyPriority(item) {
  if (!item || !item.trophy) return 0;
  const isUnlock = item.type === 'unlock';
  const tierKey = String(item.trophy.tier || 'bronze').toLowerCase();
  const tierWeight = TIER_DIFFICULTY_WEIGHT[tierKey] || 10;

  if (isUnlock) {
    // Conquistados têm prioridade superior (Platina 1060 > Mítico 1050 > Ouro 1040 > Épico 1030 > Prata 1020 > Bronze 1010)
    return 1000 + tierWeight;
  } else {
    // Colecionáveis ficam por último; desempate por proximidade da meta (%) e raridade
    const pct = Number(item.trophy.progress_percentage ?? item.trophy.percentage) || 0;
    return pct + (tierWeight / 10);
  }
}

export const STORAGE_KEY_DURATION_UNLOCKED = 'cinecatalog_toast_duration_unlocked';
export const STORAGE_KEY_DURATION_PROGRESS = 'cinecatalog_toast_duration_progress';
export const STORAGE_KEY_MAX_PROGRESS = 'cinecatalog_toast_max_progress';

export function getToastSettings() {
  if (typeof window === 'undefined') {
    return { durationUnlocked: 8000, durationProgress: 6000, maxProgress: 3 };
  }
  const u = Number(localStorage.getItem(STORAGE_KEY_DURATION_UNLOCKED)) || 8000;
  const p = Number(localStorage.getItem(STORAGE_KEY_DURATION_PROGRESS)) || 6000;
  const rawMax = localStorage.getItem(STORAGE_KEY_MAX_PROGRESS);
  const m = rawMax !== null ? Number(rawMax) : 3;
  return { durationUnlocked: u, durationProgress: p, maxProgress: isNaN(m) ? 3 : m };
}

export function saveToastSettings({ durationUnlocked, durationProgress, maxProgress }) {
  if (typeof window === 'undefined') return;
  if (durationUnlocked) localStorage.setItem(STORAGE_KEY_DURATION_UNLOCKED, String(durationUnlocked));
  if (durationProgress) localStorage.setItem(STORAGE_KEY_DURATION_PROGRESS, String(durationProgress));
  if (maxProgress !== undefined) localStorage.setItem(STORAGE_KEY_MAX_PROGRESS, String(maxProgress));
  window.dispatchEvent(new CustomEvent('ps5-toast-settings-updated'));
}

/**
 * Dispara um toast de Troféu Conquistado (100% / Desbloqueado)
 */
export function triggerPS5TrophyToast(trophy) {
  if (typeof window === 'undefined' || !trophy) return;
  notifyTrophiesStarted();
  window.dispatchEvent(
    new CustomEvent('ps5-trophy-unlock', {
      detail: trophy,
    })
  );
}

/**
 * Dispara um toast estilo Colecionável / HUD de Progresso numérico (ex: 47/50)
 */
export function triggerPS5ProgressToast(progressData) {
  if (typeof window === 'undefined' || !progressData) return;
  notifyTrophiesStarted();
  window.dispatchEvent(
    new CustomEvent('ps5-trophy-progress', {
      detail: progressData,
    })
  );
}

/**
 * Orquestra o lote completo para a fila gerenciada:
 * - Troféus Conquistados são ordenados por dificuldade (mais difícil primeiro)
 * - Colecionáveis aparecem por último
 * - No máximo 4 na tela; os demais aguardam na fila de espera
 */
export function triggerTrophyBatch({ progressed = [], unlocked = [] }) {
  if (typeof window === 'undefined') return;
  const { maxProgress } = getToastSettings();
  const cappedProgress = maxProgress === 0 ? [] : (maxProgress >= 99 ? progressed : progressed.slice(0, maxProgress));

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

// Gerador de IDs rigorosamente únicos para evitar colisões no React
let toastSequence = 0;
function createToastId(prefix, type) {
  toastSequence += 1;
  return `${prefix || 't'}_${type}_${Date.now()}_${toastSequence}_${Math.random().toString(36).slice(2, 7)}`;
}

function playToastSound(item) {
  try {
    if (item.type === 'progress') {
      playCollectibleChimeSound();
    } else {
      playTrophySound(item.trophy?.tier);
    }
  } catch (audioErr) {
    console.warn('[PS5Toast] Falha ao reproduzir áudio do toast:', audioErr);
  }
}

/**
 * Card individual de notificação PS5 com suporte a pause on hover
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

  // Duração configurável
  const totalDurationMs = isProgress
    ? settings.durationProgress || 6000
    : settings.durationUnlocked || 8000;

  const [remainingMs, setRemainingMs] = useState(totalDurationMs);
  const [isHovered, setIsHovered] = useState(false);
  const timerStartRef = useRef(Date.now());
  const timerIdRef = useRef(null);
  const hasRemovedRef = useRef(false);

  const safeRemove = useCallback(() => {
    if (hasRemovedRef.current) return;
    hasRemovedRef.current = true;
    onRemove(toastId);
  }, [onRemove, toastId]);

  // Barra de progresso animada (do previousPercentage até currentPercentage)
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

  // Gerenciamento de auto-dismiss com pause no hover
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

  // Cálculos de contagem numérica para o HUD de colecionável
  const curCount = trophy.currentCount ?? trophy.progress_current ?? 0;
  const tgtCount = trophy.targetCount ?? trophy.progress_target ?? 1;
  const incBy = trophy.increasedBy ?? 1;
  const remainingCount = Math.max(tgtCount - curCount, 0);

  // Mensagem motivacional
  let motivationalSubtext = `${currentPct}% concluído`;
  if (remainingCount === 1) {
    motivationalSubtext = 'Falta apenas 1 para conquistar!';
  } else if (remainingCount <= 5) {
    motivationalSubtext = `Faltam apenas ${remainingCount}!`;
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        animation: 'ps5SlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border ${
        isProgress ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]' : `${theme.border} ${theme.glow}`
      } p-3.5 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2.5`}
    >
      {/* Glow de fundo */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 10% 50%, ${isProgress ? '#F59E0B' : theme.accentColor} 0%, transparent 65%)`,
        }}
      />

      {/* Linha Principal: Ícone + Textos + Fechar */}
      <div className="flex items-start gap-3 relative z-10">
        {/* Ícone com Halo PSN */}
        <div
          className={`relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${
            isProgress ? 'from-amber-500/30 via-zinc-900 to-zinc-950 border-amber-500/60' : `${theme.iconBg} ${theme.border}`
          } border flex items-center justify-center text-2xl shadow-inner`}
        >
          <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] select-none">
            {trophy.icon || theme.symbol}
          </span>
          {isPlatinum && (
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-blue-300 animate-pulse" />
          )}
          {isProgress && (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 rounded-full p-0.5 shadow-md">
              <TrendingUp className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Conteúdo Textual */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Header Badges */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {isProgress ? (
              <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-sm">
                <span>🎯 PROGRESSO</span>
                <span className="font-mono text-[10px] text-amber-200 font-black">+{incBy}</span>
              </span>
            ) : (
              <span
                className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md border ${theme.badgeBg}`}
              >
                {theme.symbol} {theme.name}
              </span>
            )}

            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700/80 text-zinc-300">
              {categoryLabel}
            </span>

            {!isProgress && (
              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Conquistado!
              </span>
            )}
          </div>

          <h4 className="text-sm font-black text-zinc-100 truncate tracking-tight">
            {cleanTitle}
          </h4>

          {/* Subtítulo ou Contador Destacado */}
          {isProgress ? (
            <div className="flex items-baseline justify-between mt-1 gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black font-mono text-amber-300 tracking-tight">
                  {curCount}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-500">/</span>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {tgtCount}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-400/90 italic truncate">
                {motivationalSubtext}
              </span>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed mt-0.5">
              {trophy.description}
            </p>
          )}
        </div>

        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={safeRemove}
          className="shrink-0 p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          title="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Progresso do Colecionável (se for progresso) */}
      {isProgress && (
        <div className="relative z-10 w-full h-2 bg-zinc-900/90 rounded-full overflow-hidden border border-amber-500/30 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            style={{ width: `${Math.min(Math.max(animatedPct, 3), 100)}%` }}
          />
        </div>
      )}

      {/* Linha de Dismiss Timer no rodapé com pausa no hover e gatilho de término seguro */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800/80 overflow-hidden">
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
  );
}

const MAX_VISIBLE_TOASTS = 4;

export default function PS5TrophyToastContainer() {
  // Estado único e sincronizado para evitar descompasso e duplicações
  const [toastState, setToastState] = useState({
    visible: [], // até 4 notificações simultâneas na tela
    queue: [],   // fila de espera com os excedentes
  });

  const [settings, setSettings] = useState(getToastSettings);

  // Atualiza configurações quando o usuário alterar via Painel de Testes
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getToastSettings());
    };
    window.addEventListener('ps5-toast-settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('ps5-toast-settings-updated', handleSettingsUpdate);
    };
  }, []);

  // Função atômica para enfileirar novos itens respeitando a hierarquia de dificuldade
  const enqueueItems = useCallback((newItems) => {
    if (!newItems || newItems.length === 0) return;
    notifyTrophiesStarted();

    setToastState((prevState) => {
      // Evita duplicar o mesmo troféu que já esteja ativo na tela ou aguardando na fila
      const existingTrophyKeys = new Set([
        ...prevState.visible.map((t) => `${t.type}_${t.trophy?.id || t.trophy?.title}`),
        ...prevState.queue.map((t) => `${t.type}_${t.trophy?.id || t.trophy?.title}`),
      ]);

      const filteredNewItems = newItems.filter((item) => {
        const key = `${item.type}_${item.trophy?.id || item.trophy?.title}`;
        if (existingTrophyKeys.has(key)) return false;
        existingTrophyKeys.add(key);
        return true;
      });

      if (filteredNewItems.length === 0) return prevState;

      // Junta com a fila existente e ordena estritamente por dificuldade/prioridade:
      // Mais difícil primeiro (Platina -> Mítico -> Ouro -> Épico -> Prata -> Bronze)
      // Colecionáveis por último
      const allPending = [...prevState.queue, ...filteredNewItems];
      allPending.sort((a, b) => getTrophyPriority(b) - getTrophyPriority(a));

      // Calcula vagas disponíveis na tela (máximo 4)
      const freeSlots = Math.max(MAX_VISIBLE_TOASTS - prevState.visible.length, 0);

      if (freeSlots > 0 && allPending.length > 0) {
        const toShow = allPending.slice(0, freeSlots);
        const remainingInQueue = allPending.slice(freeSlots);

        // Toca o som de forma cadenciada para os itens promovidos para a tela
        toShow.forEach((item, idx) => {
          setTimeout(() => {
            playToastSound(item);
          }, idx * 120);
        });

        return {
          visible: [...prevState.visible, ...toShow],
          queue: remainingInQueue,
        };
      }

      return {
        visible: prevState.visible,
        queue: allPending,
      };
    });
  }, []);

  // Remoção atômica: remove o item da tela e promove o próximo da fila
  const removeToast = useCallback((toastId) => {
    setToastState((prevState) => {
      const newVisible = prevState.visible.filter((t) => t.toastId !== toastId);
      if (newVisible.length === prevState.visible.length) return prevState;

      // Se liberou espaço e tem alguém aguardando na fila de espera:
      if (newVisible.length < MAX_VISIBLE_TOASTS && prevState.queue.length > 0) {
        const nextItem = prevState.queue[0];
        const nextQueue = prevState.queue.slice(1);

        setTimeout(() => {
          playToastSound(nextItem);
        }, 80);

        return {
          visible: [...newVisible, nextItem],
          queue: nextQueue,
        };
      }

      return {
        visible: newVisible,
        queue: prevState.queue,
      };
    });
  }, []);

  useEffect(() => {
    const handleUnlockEvent = (e) => {
      if (e?.detail) {
        const item = {
          toastId: createToastId(e.detail.id, 'unlock'),
          trophy: e.detail,
          type: 'unlock',
          createdAt: Date.now(),
        };
        enqueueItems([item]);
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
        enqueueItems([item]);
      }
    };

    const handleBatchEvent = (e) => {
      const { unlocked = [], progressed = [] } = e?.detail || {};
      const itemsToAdd = [];

      // Conquistados (100%)
      unlocked.forEach((u) => {
        itemsToAdd.push({
          toastId: createToastId(u.id, 'unlock'),
          trophy: u,
          type: 'unlock',
          createdAt: Date.now(),
        });
      });

      // Colecionáveis de Progresso
      progressed.forEach((p) => {
        itemsToAdd.push({
          toastId: createToastId(p.id, 'progress'),
          trophy: p,
          type: 'progress',
          createdAt: Date.now(),
        });
      });

      if (itemsToAdd.length > 0) {
        enqueueItems(itemsToAdd);
      }
    };

    window.addEventListener('ps5-trophy-unlock', handleUnlockEvent);
    window.addEventListener('ps5-trophy-progress', handleProgressEvent);
    window.addEventListener('ps5-trophy-batch', handleBatchEvent);

    return () => {
      window.removeEventListener('ps5-trophy-unlock', handleUnlockEvent);
      window.removeEventListener('ps5-trophy-progress', handleProgressEvent);
      window.removeEventListener('ps5-trophy-batch', handleBatchEvent);
    };
  }, [enqueueItems]);

  const { visible, queue } = toastState;
  const wasActiveRef = useRef(false);

  // Monitora transições de visibilidade dos troféus:
  // Notifica o sistema de XP quando inicia e quando TODAS as notificações
  // (incluindo as da fila de espera) tiverem terminado e sumido da tela.
  useEffect(() => {
    const isActive = visible.length > 0 || queue.length > 0;
    if (isActive) {
      wasActiveRef.current = true;
      notifyTrophiesStarted();
    } else if (wasActiveRef.current) {
      wasActiveRef.current = false;
      // Pausa graciosa (400ms) para que a animação de saída termine antes da barra de XP aparecer
      const timer = setTimeout(() => {
        notifyTrophiesCleared();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visible.length, queue.length]);

  useEffect(() => {
    return () => {
      if (wasActiveRef.current) {
        notifyTrophiesCleared();
      }
    };
  }, []);

  if (visible.length === 0 && queue.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] pointer-events-none flex flex-col gap-3 max-w-[420px] w-full"
    >
      {/* Indicador de Fila de Espera quando houver mais de 4 notificações */}
      {queue.length > 0 && (
        <div className="self-end px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[10px] font-mono font-bold text-zinc-300 shadow-xl flex items-center gap-1.5 animate-pulse backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>+{queue.length} na fila de espera</span>
        </div>
      )}

      {/* Exibição dos até 4 toasts visíveis */}
      {visible.map((toast) => (
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
            transform: translate3d(40px, -15px, 0) scale(0.94);
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
      `}</style>
    </div>
  );
}
