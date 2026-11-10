import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, Sparkles, X, Film, Star, Crown, Swords, Flag, Ghost } from 'lucide-react';
import { playWorldConquestSound } from '../utils/trophyAudio';
import {
  notifyWorldChallengeStarted,
  notifyWorldChallengeCleared,
} from '../utils/xpSystem';

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

const COUNTRY_RARITY_THEMES = {
  common: {
    label: 'Comum',
    icon: '🟢',
    border: 'border-emerald-400/65',
    glow: 'shadow-[0_18px_55px_rgba(16,185,129,0.34),0_0_25px_rgba(16,185,129,0.2)]',
    bgGrad: 'from-zinc-950/95 via-emerald-950/45 to-zinc-950/95',
    beam: 'from-transparent via-emerald-400 to-transparent',
    accentText: 'text-emerald-300',
    pill: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
    barColor: '#10B981',
  },
  rare: {
    label: 'Raro',
    icon: '🔵',
    border: 'border-cyan-400/65',
    glow: 'shadow-[0_18px_60px_rgba(6,182,212,0.36),0_0_28px_rgba(34,211,238,0.24)]',
    bgGrad: 'from-zinc-950/95 via-cyan-950/50 to-zinc-950/95',
    beam: 'from-transparent via-cyan-400 to-transparent',
    accentText: 'text-cyan-300',
    pill: 'bg-cyan-500/20 border-cyan-400/55 text-cyan-200',
    barColor: '#06B6D4',
  },
  epic: {
    label: 'Épico',
    icon: '💜',
    border: 'border-purple-400/70',
    glow: 'shadow-[0_18px_60px_rgba(168,85,247,0.42),0_0_30px_rgba(192,132,252,0.28)]',
    bgGrad: 'from-zinc-950/95 via-purple-950/55 to-zinc-950/95',
    beam: 'from-transparent via-purple-400 to-transparent',
    accentText: 'text-purple-300',
    pill: 'bg-purple-500/20 border-purple-400/55 text-purple-200',
    barColor: '#A855F7',
  },
  legendary: {
    label: 'Lendário',
    icon: '🥇',
    border: 'border-amber-400/80',
    glow: 'shadow-[0_20px_65px_rgba(245,158,11,0.45),0_0_35px_rgba(251,191,36,0.35)]',
    bgGrad: 'from-zinc-950/95 via-amber-950/55 to-zinc-950/95',
    beam: 'from-transparent via-amber-300 to-transparent',
    accentText: 'text-amber-300',
    pill: 'bg-amber-500/25 border-amber-400/60 text-amber-200',
    barColor: '#F59E0B',
  },
  mythic: {
    label: 'Mítico',
    icon: '💎',
    border: 'border-rose-400/85',
    glow: 'shadow-[0_22px_70px_rgba(244,63,94,0.52),0_0_40px_rgba(251,113,133,0.4)]',
    bgGrad: 'from-zinc-950/95 via-rose-950/60 to-zinc-950/95',
    beam: 'from-transparent via-rose-400 to-transparent',
    accentText: 'text-rose-300',
    pill: 'bg-rose-500/25 border-rose-400/65 text-rose-200',
    barColor: '#F43F5E',
  },
};

function WorldChallengeCard({ item, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [stampSettled, setStampSettled] = useState(false);
  const removedRef = useRef(false);

  const isDethrone = item.kind === 'country_dethrone';
  const theme = COUNTRY_RARITY_THEMES[item.rarity] || COUNTRY_RARITY_THEMES.common;

  useEffect(() => {
    const timer = setTimeout(() => setStampSettled(true), 90);
    return () => clearTimeout(timer);
  }, []);

  const safeRemove = useCallback(() => {
    if (removedRef.current) return;
    removedRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      onRemove(item.toastId);
    }, 320);
  }, [item.toastId, onRemove]);

  const newPoster = resolvePosterUrl(item.posterUrl);
  const oldPoster = resolvePosterUrl(item.previousPosterUrl);
  const durationMs = isDethrone ? 5800 : 5000;
  const ratingDiff =
    isDethrone && Number(item.userRating) > Number(item.previousUserRating || 0)
      ? Number(item.userRating) - Number(item.previousUserRating || 0)
      : 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-2xl bg-gradient-to-r ${
        isDethrone
          ? 'from-zinc-950/96 via-amber-950/55 to-rose-950/45 border-amber-400/80 shadow-[0_22px_70px_rgba(245,158,11,0.45)]'
          : `${theme.bgGrad} ${theme.border} ${theme.glow}`
      } transition-all duration-300 ${
        isExiting
          ? 'opacity-0 -translate-y-4 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{
        animation: !isExiting ? 'wcCardArrival 0.45s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
      }}
    >
      {/* Barra luminosa superior */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
          isDethrone ? 'from-amber-400 via-yellow-200 to-rose-400' : theme.beam
        }`}
      />

      {/* Flash de impacto */}
      {stampSettled && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-amber-300/10 via-white/10 to-emerald-400/10 pointer-events-none"
          style={{ animation: 'wcFlash 0.65s ease-out forwards' }}
        />
      )}

      <div className="relative z-10 px-4 py-3.5 flex flex-col gap-3">
        {/* Topo: Bandeira + Tags + Botão Fechar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            {item.countryCode && (
              <img
                src={`https://flagcdn.com/w80/${String(item.countryCode).toLowerCase()}.png`}
                alt={item.countryName}
                className={`w-9 h-6 object-cover rounded-md border border-white/25 shadow-md transition-transform duration-500 ${
                  stampSettled ? 'scale-100 rotate-0' : 'scale-125 -rotate-6'
                }`}
              />
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${
                  isDethrone
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                    : 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200'
                }`}
              >
                {isDethrone ? (
                  <>
                    <Swords className="w-3 h-3 text-amber-300" />
                    DUELO NO DESAFIO 195
                  </>
                ) : (
                  <>
                    <Flag className="w-2.5 h-2.5 text-emerald-300 fill-current" />
                    PAÍS INÉDITO CONQUISTADO
                  </>
                )}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${theme.pill}`}
              >
                <span>{theme.icon}</span>
                <span>{theme.label.toUpperCase()}</span>
              </span>

              {item.xp > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono font-black text-amber-200 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />+{item.xp} XP
                </span>
              )}

              {item.isGhost && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/25 border border-violet-400/55 text-[9px] font-black uppercase tracking-wider text-violet-200">
                  <Ghost className="w-2.5 h-2.5" /> Fantasma
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={safeRemove}
            className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar notificação do Desafio 195"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo: Conquista Inédita OU Duelo Frente a Frente */}
        {isDethrone ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
                <span>Novo Campeão em {item.countryName}!</span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 shrink-0">
                {ratingDiff > 0
                  ? `+${ratingDiff.toFixed(2)} nota`
                  : item.winReason === 'manual'
                  ? 'Escolha Manual'
                  : 'Desempate Técnico'}
              </span>
            </div>

            {/* Arena VS */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 bg-zinc-950/75 border border-zinc-800/80 rounded-xl p-2.5">
              {/* Campeão Destronado */}
              <div className="flex items-center gap-2 min-w-0 opacity-65">
                {oldPoster ? (
                  <img
                    src={oldPoster}
                    alt={item.previousMovieTitle || 'Campeão anterior'}
                    className="w-10 h-14 object-cover rounded-lg border border-zinc-700 grayscale shrink-0"
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4 text-zinc-600" />
                  </div>
                )}
                <div className="min-w-0 flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-wider text-rose-300/90">
                    Destronado
                  </span>
                  <span className="text-[11px] font-bold text-zinc-300 truncate line-through">
                    {item.previousMovieTitle || 'Anterior'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 line-through">
                    ★ {Number(item.previousUserRating || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Centro VS */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/25 to-rose-500/25 border border-amber-400/60 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.35)]">
                  <Crown className="w-4 h-4 text-amber-300" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-300 mt-0.5">
                  TOMOU!
                </span>
              </div>

              {/* Novo Campeão */}
              <div className="flex items-center gap-2 min-w-0 justify-end text-right">
                <div className="min-w-0 flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-300">
                    Novo Rei 👑
                  </span>
                  <span className="text-xs font-black text-white truncate max-w-full">
                    {item.movieTitle}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-black text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {Number(item.userRating || 0).toFixed(2)}
                  </span>
                </div>
                {newPoster ? (
                  <img
                    src={newPoster}
                    alt={item.movieTitle}
                    className="w-11 h-16 object-cover rounded-lg border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0"
                  />
                ) : (
                  <div className="w-11 h-16 rounded-lg bg-zinc-900 border-2 border-amber-400/70 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            {newPoster ? (
              <img
                src={newPoster}
                alt={item.movieTitle}
                className="w-12 h-18 object-cover rounded-xl border border-white/25 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-12 h-18 rounded-xl bg-zinc-900/90 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Globe className={`w-6 h-6 ${theme.accentText}`} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-black text-white leading-tight truncate">
                {item.countryName}
              </div>
              <p className="text-xs font-bold text-zinc-200 truncate mt-0.5">
                {item.movieTitle}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-300 mt-1 flex-wrap">
                <span className="text-emerald-300 font-semibold">
                  {item.sourceTrigger === 'coproduction_curate'
                    ? 'Validado via Central de Coproduções'
                    : 'Território adicionado ao Passaporte 195'}
                </span>
                {Number(item.userRating) > 0 && (
                  <span className="inline-flex items-center gap-0.5 font-mono font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {Number(item.userRating).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Contagem Regressiva */}
      <div className="h-[3px] w-full bg-zinc-900/90 overflow-hidden">
        <div
          className="h-full origin-left"
          onAnimationEnd={() => {
            if (!isHovered) safeRemove();
          }}
          style={{
            backgroundColor: isDethrone ? '#F59E0B' : theme.barColor,
            animation: `wcCountdownBar ${durationMs}ms linear forwards`,
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
}

const MAX_VISIBLE_WORLD_CARDS = 2;

export default function WorldChallengeToastContainer() {
  const [state, setState] = useState({ visible: [], queue: [] });

  const enqueueUnlocks = useCallback((rawItems) => {
    const list = Array.isArray(rawItems) ? rawItems.filter(Boolean) : [];
    if (list.length === 0) return;

    notifyWorldChallengeStarted();

    setState((prev) => {
      const existingIds = new Set([
        ...prev.visible.map((x) => x.id),
        ...prev.queue.map((x) => x.id),
      ]);

      const prepared = [];
      list.forEach((u, idx) => {
        const uniqueKey = u.id || `wc_${u.countryCode}_${idx}_${Date.now()}`;
        if (existingIds.has(uniqueKey)) return;
        existingIds.add(uniqueKey);
        prepared.push({
          ...u,
          id: uniqueKey,
          toastId: `${uniqueKey}_${Math.random().toString(36).slice(2, 7)}`,
        });
      });

      if (prepared.length === 0) return prev;

      const allPending = [...prev.queue, ...prepared];
      const freeSlots = Math.max(MAX_VISIBLE_WORLD_CARDS - prev.visible.length, 0);

      if (freeSlots > 0) {
        const toShow = allPending.slice(0, freeSlots);
        const remaining = allPending.slice(freeSlots);

        toShow.forEach((item, i) => {
          setTimeout(() => {
            playWorldConquestSound(item.rarity, item.kind === 'country_dethrone');
          }, i * 180);
        });

        return { visible: [...prev.visible, ...toShow], queue: remaining };
      }

      return { visible: prev.visible, queue: allPending };
    });
  }, []);

  const removeCard = useCallback((toastId) => {
    setState((prev) => {
      const nextVisible = prev.visible.filter((p) => p.toastId !== toastId);
      if (nextVisible.length === prev.visible.length) return prev;

      if (nextVisible.length < MAX_VISIBLE_WORLD_CARDS && prev.queue.length > 0) {
        const [nextItem, ...restQueue] = prev.queue;
        setTimeout(() => {
          playWorldConquestSound(nextItem.rarity, nextItem.kind === 'country_dethrone');
        }, 100);
        return { visible: [...nextVisible, nextItem], queue: restQueue };
      }

      return { visible: nextVisible, queue: prev.queue };
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e?.detail) enqueueUnlocks(e.detail);
    };
    window.addEventListener('cine-world-challenge-unlock', handler);
    return () => window.removeEventListener('cine-world-challenge-unlock', handler);
  }, [enqueueUnlocks]);

  const { visible, queue } = state;
  const wasActiveRef = useRef(false);

  useEffect(() => {
    const isActive = visible.length > 0 || queue.length > 0;
    if (isActive) {
      wasActiveRef.current = true;
      notifyWorldChallengeStarted();
    } else if (wasActiveRef.current) {
      wasActiveRef.current = false;
      const timer = setTimeout(() => {
        notifyWorldChallengeCleared();
      }, 360);
      return () => clearTimeout(timer);
    }
  }, [visible.length, queue.length]);

  useEffect(() => {
    return () => {
      if (wasActiveRef.current) {
        notifyWorldChallengeCleared();
      }
    };
  }, []);

  if (visible.length === 0 && queue.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none flex flex-col gap-3 w-[94vw] max-w-[560px]"
    >
      {queue.length > 0 && (
        <div className="self-center px-3 py-1 rounded-full bg-zinc-950/90 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-200 shadow-xl flex items-center gap-1.5 backdrop-blur-md">
          <Globe className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>+{queue.length} evento(s) do Desafio 195 na sequência</span>
        </div>
      )}

      {visible.map((item) => (
        <WorldChallengeCard key={item.toastId} item={item} onRemove={removeCard} />
      ))}

      <style>{`
        @keyframes wcCardArrival {
          0% {
            opacity: 0;
            transform: translate3d(0, -24px, 0) scale(0.92);
            filter: brightness(1.8);
          }
          65% {
            opacity: 1;
            transform: translate3d(0, 3px, 0) scale(1.015);
            filter: brightness(1.15);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: brightness(1);
          }
        }
        @keyframes wcFlash {
          0% { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes wcCountdownBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
