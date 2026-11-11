import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Sparkles, X, Film, Star, Award, Zap, Swords, Crown, Ghost } from 'lucide-react';
import { playTimeMachineSound, playDethroneSound } from '../utils/trophyAudio';
import DuelArenaShowcase from './DuelArenaShowcase';
import { pickRandomDuelEffect } from '../utils/duelEffectPresets';
import {
  TIME_MACHINE_RARITY_META,
  notifyTimeMachineStarted,
  notifyTimeMachineCleared,
} from '../utils/xpSystem';

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

const RARITY_PORTAL_THEMES = {
  common: {
    border: 'border-emerald-400/60',
    glow: 'shadow-[0_18px_55px_rgba(16,185,129,0.32),0_0_25px_rgba(16,185,129,0.22)]',
    bgGrad: 'from-zinc-950/95 via-emerald-950/45 to-zinc-950/95',
    beam: 'from-transparent via-emerald-400 to-transparent',
    accentText: 'text-emerald-300',
    yearText: 'text-emerald-200 drop-shadow-[0_0_14px_rgba(52,211,153,0.65)]',
    pill: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
    barColor: '#10B981',
  },
  rare: {
    border: 'border-cyan-400/65',
    glow: 'shadow-[0_18px_60px_rgba(6,182,212,0.38),0_0_28px_rgba(34,211,238,0.28)]',
    bgGrad: 'from-zinc-950/95 via-cyan-950/50 to-zinc-950/95',
    beam: 'from-transparent via-cyan-400 to-transparent',
    accentText: 'text-cyan-300',
    yearText: 'text-cyan-200 drop-shadow-[0_0_16px_rgba(34,211,238,0.75)]',
    pill: 'bg-cyan-500/20 border-cyan-400/55 text-cyan-200',
    barColor: '#06B6D4',
  },
  epic: {
    border: 'border-purple-400/65',
    glow: 'shadow-[0_18px_60px_rgba(168,85,247,0.42),0_0_30px_rgba(192,132,252,0.3)]',
    bgGrad: 'from-zinc-950/95 via-purple-950/55 to-zinc-950/95',
    beam: 'from-transparent via-purple-400 to-transparent',
    accentText: 'text-purple-300',
    yearText: 'text-purple-200 drop-shadow-[0_0_16px_rgba(192,132,252,0.8)]',
    pill: 'bg-purple-500/20 border-purple-400/55 text-purple-200',
    barColor: '#A855F7',
  },
  legendary: {
    border: 'border-amber-400/75',
    glow: 'shadow-[0_20px_65px_rgba(245,158,11,0.45),0_0_35px_rgba(251,191,36,0.35)]',
    bgGrad: 'from-zinc-950/95 via-amber-950/55 to-zinc-950/95',
    beam: 'from-transparent via-amber-300 to-transparent',
    accentText: 'text-amber-300',
    yearText: 'text-amber-200 drop-shadow-[0_0_18px_rgba(251,191,36,0.85)]',
    pill: 'bg-amber-500/25 border-amber-400/60 text-amber-200',
    barColor: '#F59E0B',
  },
  mythic: {
    border: 'border-rose-400/80',
    glow: 'shadow-[0_22px_70px_rgba(244,63,94,0.5),0_0_40px_rgba(251,113,133,0.4)]',
    bgGrad: 'from-zinc-950/95 via-rose-950/60 to-zinc-950/95',
    beam: 'from-transparent via-rose-400 to-transparent',
    accentText: 'text-rose-300',
    yearText: 'text-rose-200 drop-shadow-[0_0_20px_rgba(251,113,133,0.9)]',
    pill: 'bg-rose-500/25 border-rose-400/65 text-rose-200',
    barColor: '#F43F5E',
  },
  decade_relic: {
    border: 'border-amber-300/85',
    glow: 'shadow-[0_22px_75px_rgba(245,158,11,0.55),0_0_42px_rgba(56,189,248,0.38)]',
    bgGrad: 'from-zinc-950/95 via-amber-950/65 to-cyan-950/55',
    beam: 'from-cyan-400 via-amber-300 to-cyan-400',
    accentText: 'text-amber-200',
    yearText: 'text-amber-200 drop-shadow-[0_0_20px_rgba(251,191,36,0.95)]',
    pill: 'bg-amber-500/25 border-amber-300/70 text-amber-100',
    barColor: '#FBBF24',
  },
};

function TimeMachinePortalCard({ item, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [displayYear, setDisplayYear] = useState(() =>
    item.kind === 'year' ? 1985 : null
  );
  const [lockedIn, setLockedIn] = useState(item.kind !== 'year');
  const removedRef = useRef(false);

  const isDethrone = item.kind === 'year_dethrone';
  const rarityKey = item.kind === 'decade' ? 'decade_relic' : item.rarity || 'epic';
  const baseTheme = RARITY_PORTAL_THEMES[rarityKey] || RARITY_PORTAL_THEMES.epic;
  const theme = isDethrone
    ? {
        ...baseTheme,
        border: 'border-amber-400/80',
        glow: 'shadow-[0_22px_70px_rgba(245,158,11,0.48),0_0_36px_rgba(244,63,94,0.32)]',
        bgGrad: 'from-zinc-950/95 via-amber-950/55 to-rose-950/45',
        beam: 'from-amber-400 via-yellow-200 to-rose-400',
        barColor: '#F59E0B',
      }
    : baseTheme;
  const rarityMeta = TIME_MACHINE_RARITY_META[item.rarity] || TIME_MACHINE_RARITY_META.epic;

  // Odômetro digital girando rapidamente até travar no ano conquistado (efeito DeLorean!)
  useEffect(() => {
    if ((item.kind !== 'year' && item.kind !== 'year_dethrone') || !item.year) {
      setLockedIn(true);
      return;
    }

    const scrambleYears = [1927, 1955, 1985, 1968, 2001, 1977, item.year];
    let step = 0;
    const interval = setInterval(() => {
      if (step < scrambleYears.length - 1) {
        setDisplayYear(scrambleYears[step]);
        step += 1;
      } else {
        setDisplayYear(item.year);
        setLockedIn(true);
        clearInterval(interval);
      }
    }, 58);

    return () => clearInterval(interval);
  }, [item.kind, item.year]);

  const safeRemove = useCallback(() => {
    if (removedRef.current) return;
    removedRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      onRemove(item.toastId);
    }, 320);
  }, [item.toastId, onRemove]);

  const posterSrc = resolvePosterUrl(item.posterUrl);
  const oldPosterSrc = resolvePosterUrl(item.previousPosterUrl);
  const durationMs = item.duelEffect || isDethrone || item.kind === 'decade' ? 6000 : 4800;
  const ratingDiff =
    isDethrone && Number(item.userRating) > Number(item.previousUserRating || 0)
      ? Number(item.userRating) - Number(item.previousUserRating || 0)
      : 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-2xl bg-gradient-to-r ${theme.bgGrad} ${theme.border} ${theme.glow} transition-all duration-300 ${
        isExiting
          ? 'opacity-0 -translate-y-4 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{
        animation: !isExiting ? 'tmPortalArrival 0.48s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
      }}
    >
      {/* Feixe superior de dobra temporal */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.beam}`} />

      {/* Grade cibernética sutil de fundo */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Flash luminoso no instante em que o odômetro trava */}
      {lockedIn && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-white/10 to-amber-400/10 pointer-events-none"
          style={{ animation: 'tmLockFlash 0.65s ease-out forwards' }}
        />
      )}

      <div className="relative z-10 px-4 py-3.5 flex items-center gap-4">
        {/* Esquerda: Pôster / Núcleo do Capacitor de Fluxo (oculto em Duelo pois há Arena VS) */}
        {!isDethrone && (
          <div className="relative shrink-0">
            <div
              className={`absolute -inset-1.5 rounded-xl border border-dashed ${theme.border} opacity-60 pointer-events-none`}
              style={{ animation: 'tmSpinSlow 9s linear infinite' }}
            />
            {item.kind === 'decade' ? (
              <div className="w-14 h-20 rounded-xl bg-gradient-to-br from-amber-500/30 via-amber-900/40 to-cyan-900/40 border border-amber-300/60 flex flex-col items-center justify-center shadow-inner">
                <Award className="w-7 h-7 text-amber-300 animate-bounce" />
                <span className="text-[9px] font-black font-mono text-amber-200 mt-1">10/10</span>
              </div>
            ) : posterSrc ? (
              <img
                src={posterSrc}
                alt={item.movieTitle || `Ano ${item.year}`}
                className="w-14 h-20 object-cover rounded-xl border border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-14 h-20 rounded-xl bg-zinc-900/90 border border-cyan-400/40 flex flex-col items-center justify-center">
                <Clock className={`w-6 h-6 ${theme.accentText} animate-spin`} style={{ animationDuration: '4s' }} />
                <Film className="w-3.5 h-3.5 text-zinc-400 mt-1" />
              </div>
            )}
          </div>
        )}

        {/* Centro: Odômetro do Ano + Detalhes / Arena de Duelo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {isDethrone ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/55 text-[9px] font-black uppercase tracking-widest text-amber-200">
                <Swords className="w-2.5 h-2.5 text-amber-300" />
                TOMADA DE TRONO TEMPORAL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/40 text-[9px] font-black uppercase tracking-widest text-cyan-200">
                <Zap className="w-2.5 h-2.5 text-amber-300" />
                {item.kind === 'decade' ? 'RELÍQUIA DA DÉCADA' : 'MÁQUINA DO TEMPO'}
              </span>
            )}

            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${theme.pill}`}>
              {item.kind === 'decade' ? (
                <>🕰️ DÉCADA PLATINADA</>
              ) : (
                <>
                  <span>{rarityMeta.icon}</span>
                  <span>ANO {rarityMeta.label.toUpperCase()}</span>
                </>
              )}
            </span>

            {item.xp > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono font-black text-amber-200 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />+{item.xp} XP
              </span>
            )}

            {isDethrone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/45 text-[9px] font-mono font-black text-rose-200">
                {ratingDiff > 0 ? `+${ratingDiff.toFixed(2)} nota` : 'Desempate Técnico'}
              </span>
            )}

            {item.isGhost && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/25 border border-violet-400/55 text-[9px] font-black uppercase tracking-wider text-violet-200">
                <Ghost className="w-2.5 h-2.5" /> Fantasma
              </span>
            )}
          </div>

          {isDethrone ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2.5 min-w-0">
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-black tracking-tighter leading-none ${theme.yearText} ${
                      lockedIn ? 'scale-100' : 'scale-95 opacity-85'
                    } transition-transform duration-150`}
                  >
                    {displayYear}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
                    Novo Rei de {item.year}!
                  </span>
                </div>
              </div>

              <DuelArenaShowcase
                oldPosterSrc={oldPosterSrc}
                oldTitle={item.previousMovieTitle}
                oldRating={item.previousUserRating}
                newPosterSrc={posterSrc}
                newTitle={item.movieTitle}
                newRating={item.userRating}
                duelEffect={item.duelEffect || null}
                compact
              />
            </div>
          ) : (
            /* Linha Principal com Odômetro LED */
            <div className="flex items-baseline gap-3">
              <span
                className={`font-mono text-3xl sm:text-4xl font-black tracking-tighter leading-none ${theme.yearText} ${
                  lockedIn ? 'scale-100' : 'scale-95 opacity-85'
                } transition-transform duration-150`}
              >
                {item.kind === 'decade' ? item.decadeId || 'DÉCADA' : displayYear}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-black text-white truncate">
                  {item.kind === 'decade'
                    ? `${item.decadeLabel || 'Década'} Restaurada Completa!`
                    : item.movieTitle || `Ano ${item.year} Desbloqueado!`}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-300/90 mt-0.5">
                  {item.kind === 'decade' ? (
                    <span className="text-amber-300/95 font-semibold">
                      Todos os 10 anos da década foram conquistados no catálogo!
                    </span>
                  ) : (
                    <>
                      <span className="text-cyan-300/90 font-semibold">
                        Linha do Tempo sincronizada
                      </span>
                      {Number(item.userRating) > 0 && (
                        <span className="inline-flex items-center gap-0.5 font-mono font-bold text-amber-300">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {Number(item.userRating).toFixed(3)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão Fechar */}
        <button
          type="button"
          onClick={safeRemove}
          className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Fechar portal temporal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Contagem Regressiva */}
      <div className="h-[3px] w-full bg-zinc-900/90 overflow-hidden">
        <div
          className="h-full origin-left"
          onAnimationEnd={() => {
            if (!isHovered) safeRemove();
          }}
          style={{
            backgroundColor: theme.barColor,
            animation: `tmCountdownBar ${durationMs}ms linear forwards`,
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
}

const MAX_VISIBLE_PORTALS = 2;

export default function TimeMachineToastContainer() {
  const [portalState, setPortalState] = useState({
    visible: [],
    queue: [],
  });

  const enqueueUnlocks = useCallback((rawItems) => {
    const list = Array.isArray(rawItems) ? rawItems.filter(Boolean) : [];
    if (list.length === 0) return;

    notifyTimeMachineStarted();

    setPortalState((prev) => {
      const existingIds = new Set([
        ...prev.visible.map((x) => x.id),
        ...prev.queue.map((x) => x.id),
      ]);

      const prepared = [];
      list.forEach((u, idx) => {
        const uniqueKey = u.id || `${u.kind || 'year'}_${u.year || u.decadeId || idx}_${Date.now()}`;
        if (existingIds.has(uniqueKey)) return;
        existingIds.add(uniqueKey);
        const resolvedEffect =
          u.kind === 'year_dethrone' ? u.duelEffect || pickRandomDuelEffect() : null;
        prepared.push({
          ...u,
          duelEffect: resolvedEffect,
          id: uniqueKey,
          toastId: `${uniqueKey}_${Math.random().toString(36).slice(2, 7)}`,
        });
      });

      if (prepared.length === 0) return prev;

      const allPending = [...prev.queue, ...prepared];
      const freeSlots = Math.max(MAX_VISIBLE_PORTALS - prev.visible.length, 0);

      if (freeSlots > 0) {
        const toShow = allPending.slice(0, freeSlots);
        const remaining = allPending.slice(freeSlots);

        toShow.forEach((item, i) => {
          setTimeout(() => {
            if (item.kind === 'year_dethrone') playDethroneSound(item.duelEffect || null);
            else playTimeMachineSound(item.kind === 'decade' ? 'decade_relic' : item.rarity);
          }, i * 180);
        });

        return {
          visible: [...prev.visible, ...toShow],
          queue: remaining,
        };
      }

      return {
        visible: prev.visible,
        queue: allPending,
      };
    });
  }, []);

  const removePortal = useCallback((toastId) => {
    setPortalState((prev) => {
      const nextVisible = prev.visible.filter((p) => p.toastId !== toastId);
      if (nextVisible.length === prev.visible.length) return prev;

      if (nextVisible.length < MAX_VISIBLE_PORTALS && prev.queue.length > 0) {
        const [nextItem, ...restQueue] = prev.queue;
        setTimeout(() => {
          if (nextItem.kind === 'year_dethrone') playDethroneSound(nextItem.duelEffect || null);
          else playTimeMachineSound(nextItem.kind === 'decade' ? 'decade_relic' : nextItem.rarity);
        }, 100);
        return {
          visible: [...nextVisible, nextItem],
          queue: restQueue,
        };
      }

      return {
        visible: nextVisible,
        queue: prev.queue,
      };
    });
  }, []);

  useEffect(() => {
    const handleUnlockEvent = (e) => {
      if (e?.detail) {
        enqueueUnlocks(e.detail);
      }
    };
    window.addEventListener('cine-time-machine-unlock', handleUnlockEvent);
    return () => {
      window.removeEventListener('cine-time-machine-unlock', handleUnlockEvent);
    };
  }, [enqueueUnlocks]);

  const { visible, queue } = portalState;
  const wasActiveRef = useRef(false);

  // Assim que o último Portal Temporal some da tela, aguarda 400ms e libera o Estágio 3 (Barra de XP)!
  useEffect(() => {
    const isActive = visible.length > 0 || queue.length > 0;
    if (isActive) {
      wasActiveRef.current = true;
      notifyTimeMachineStarted();
    } else if (wasActiveRef.current) {
      wasActiveRef.current = false;
      const timer = setTimeout(() => {
        notifyTimeMachineCleared();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visible.length, queue.length]);

  useEffect(() => {
    return () => {
      if (wasActiveRef.current) {
        notifyTimeMachineCleared();
      }
    };
  }, []);

  if (visible.length === 0 && queue.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none flex flex-col gap-3 w-[94vw] max-w-[540px]"
    >
      {queue.length > 0 && (
        <div className="self-center px-3 py-1 rounded-full bg-zinc-950/90 border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-200 shadow-xl flex items-center gap-1.5 backdrop-blur-md">
          <Clock className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>+{queue.length} salto(s) temporal(is) na sequência</span>
        </div>
      )}

      {visible.map((item) => (
        <TimeMachinePortalCard key={item.toastId} item={item} onRemove={removePortal} />
      ))}

      <style>{`
        @keyframes tmPortalArrival {
          0% {
            opacity: 0;
            transform: translate3d(0, -24px, 0) scaleX(0.45) scaleY(0.88);
            filter: brightness(2.2);
          }
          60% {
            opacity: 1;
            transform: translate3d(0, 3px, 0) scaleX(1.02) scaleY(1.01);
            filter: brightness(1.25);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: brightness(1);
          }
        }
        @keyframes tmLockFlash {
          0% { opacity: 0.9; }
          100% { opacity: 0; }
        }
        @keyframes tmSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes tmCountdownBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
