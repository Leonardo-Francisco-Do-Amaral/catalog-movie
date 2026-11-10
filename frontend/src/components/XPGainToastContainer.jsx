import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Zap, PartyPopper } from 'lucide-react';
import { playXpGainSound } from '../utils/trophyAudio';

function getTagBadgeStyle(tag) {
  if (tag.type === 'movie') {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  }
  if (tag.type === 'country' || tag.type === 'time_machine') {
    switch (tag.rarityOrTier) {
      case 'mythic':
        return 'bg-rose-500/20 text-rose-200 border-rose-500/50';
      case 'legendary':
        return 'bg-amber-500/20 text-amber-200 border-amber-400/50';
      case 'epic':
        return 'bg-purple-500/20 text-purple-200 border-purple-400/50';
      case 'rare':
        return 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50';
      default:
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50';
    }
  }
  if (tag.type === 'time_decade') {
    return 'bg-amber-500/25 text-amber-100 border-amber-300/65 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
  }
  if (tag.type === 'trophy') {
    switch (tag.rarityOrTier) {
      case 'platinum':
        return 'bg-blue-500/25 text-blue-100 border-blue-300/60';
      case 'mythic':
        return 'bg-red-500/25 text-red-200 border-red-400/60';
      case 'gold':
        return 'bg-amber-500/25 text-amber-200 border-amber-300/60';
      case 'epic':
        return 'bg-purple-500/25 text-purple-200 border-purple-400/60';
      case 'silver':
        return 'bg-zinc-600/35 text-zinc-100 border-zinc-400/50';
      default:
        return 'bg-[#CD7F32]/25 text-[#F1BE86] border-[#CD7F32]/55';
    }
  }
  return 'bg-zinc-800 text-zinc-200 border-zinc-700';
}

function XPGainCard({ item, onDismiss }) {
  const { id, event } = item;
  const {
    gainedXp,
    prevLevel,
    newLevel,
    prevPercentage,
    newPercentage,
    leveledUp,
    newTitle,
    titleChanged,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    tags = [],
    statGains = [],
    unlockedClass = null,
  } = event;

  const [barWidth, setBarWidth] = useState(Math.max(0, Math.min(100, prevPercentage || 0)));
  const [barAnimated, setBarAnimated] = useState(true);
  const [displayedLevel, setDisplayedLevel] = useState(prevLevel || newLevel);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);

  useEffect(() => {
    playXpGainSound(false);

    if (!leveledUp) {
      const t1 = setTimeout(() => {
        setBarAnimated(true);
        setBarWidth(Math.max(0, Math.min(100, newPercentage || 0)));
      }, 110);
      return () => clearTimeout(t1);
    }

    // Sequência dupla de animação ao subir de nível:
    // Fase 1: preenche suavemente até 100% do nível anterior
    const tFillMax = setTimeout(() => {
      setBarAnimated(true);
      setBarWidth(100);
    }, 100);

    // Fase 2: explode celebração LEVEL UP! + reseta barra para 0% e preenche até a nova %
    const tCelebrate = setTimeout(() => {
      setShowLevelUpCelebration(true);
      setDisplayedLevel(newLevel);
      playXpGainSound(true);
      setBarAnimated(false);
      setBarWidth(0);
    }, 1020);

    const tRefill = setTimeout(() => {
      setBarAnimated(true);
      setBarWidth(Math.max(2, Math.min(100, newPercentage || 0)));
    }, 1140);

    return () => {
      clearTimeout(tFillMax);
      clearTimeout(tCelebrate);
      clearTimeout(tRefill);
    };
  }, [leveledUp, newLevel, newPercentage]);

  const durationMs = (leveledUp || unlockedClass) ? 9200 : 6200;

  return (
    <div
      style={{
        animation: 'xpHudSlideUp 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl backdrop-blur-2xl p-4 shadow-2xl border transition-all duration-500 ${
        showLevelUpCelebration
          ? 'bg-gradient-to-br from-amber-950/95 via-zinc-950/96 to-emerald-950/90 border-amber-400/90 shadow-[0_0_45px_rgba(245,158,11,0.48)] ring-1 ring-amber-300/50 scale-[1.015]'
          : 'bg-zinc-950/95 border-amber-500/50 shadow-[0_0_32px_rgba(245,158,11,0.22)]'
      }`}
    >
      {/* Brilho radial de fundo */}
      <div
        className="pointer-events-none absolute -top-16 -left-12 w-56 h-56 rounded-full blur-3xl opacity-25"
        style={{
          background: showLevelUpCelebration
            ? 'radial-gradient(circle, #fbbf24 0%, #10b981 55%, transparent 75%)'
            : 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
        }}
      />

      {/* Topo: Ícone + "+XX XP GANHOS!" + Fechar */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-500 ${
              showLevelUpCelebration
                ? 'bg-gradient-to-br from-amber-400 to-emerald-400 text-slate-950 border-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-bounce'
                : 'bg-amber-500/15 border-amber-500/45 text-amber-400'
            }`}
          >
            {showLevelUpCelebration ? (
              <PartyPopper className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/35">
                ✨ Progresso RPG
              </span>
              <span className="text-[10px] font-mono font-black text-zinc-400">
                LVL {displayedLevel}
              </span>
              {event.isGhost && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-violet-500/25 text-violet-200 border border-violet-400/50">
                  👻 Modo Fantasma
                </span>
              )}
            </div>

            <div className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent mt-0.5">
              {(gainedXp || 0) > 0
                ? `+${gainedXp.toLocaleString('pt-BR')} XP GANHOS!`
                : unlockedClass
                  ? 'NOVA CLASSE DESBLOQUEADA!'
                  : 'EVOLUÇÃO DE ATRIBUTOS!'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70 transition-colors cursor-pointer"
          title="Fechar notificação de XP"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Banner Especial de LEVEL UP quando atinge 100% */}
      {showLevelUpCelebration && (
        <div
          style={{ animation: 'xpLevelUpPop 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          className="relative z-10 mt-3 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-emerald-500/25 border border-amber-300/70 px-3 py-2 flex flex-col gap-0.5 shadow-[0_0_20px_rgba(251,191,36,0.28)]"
        >
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>🎉 LEVEL UP! NÍVEL {newLevel} ALCANÇADO!</span>
          </div>
          <div className="text-[11px] font-bold text-zinc-100 leading-snug">
            {titleChanged ? 'Novo título desbloqueado: ' : 'Título atual: '}
            <strong className="text-emerald-300">{newTitle}</strong>
          </div>
        </div>
      )}

      {/* Banner Especial de Desbloqueio de Nova Classe RPG */}
      {unlockedClass && (
        <div
          style={{ animation: 'xpLevelUpPop 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          className="relative z-10 mt-3 rounded-xl bg-gradient-to-r from-purple-950/70 via-amber-950/70 to-zinc-950 border border-amber-400/80 px-3.5 py-2.5 flex items-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-1 ring-amber-300/40"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            {typeof unlockedClass === 'object' && unlockedClass.icon ? unlockedClass.icon : '👑'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              VOCÊ DESBLOQUEOU UMA NOVA CLASSE!
            </span>
            <span className="text-sm font-black text-white truncate">
              {typeof unlockedClass === 'object' ? unlockedClass.name : unlockedClass}
            </span>
          </div>
        </div>
      )}

      {/* Tags detalhando o que somou no XP */}
      {tags.length > 0 && (
        <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
          {tags.map((tg, idx) => (
            <span
              key={`${tg.label}_${idx}`}
              className={`inline-flex items-center gap-1 text-[10px] font-black tracking-wide px-2 py-0.5 rounded-lg border ${getTagBadgeStyle(
                tg
              )}`}
            >
              <span>{tg.icon}</span>
              <span>{tg.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Ganhos de Pontos de Atributos (ex: +0.8 AGI, +1.0 INT) */}
      {statGains.length > 0 && (
        <div className="relative z-10 mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mr-0.5">
            Atributos:
          </span>
          {statGains.map((sg, idx) => (
            <span
              key={`stat_${sg.key || idx}`}
              className="inline-flex items-center gap-1 text-[10px] font-mono font-black px-2 py-0.5 rounded-lg bg-zinc-900/90 border border-amber-500/40 text-amber-300 shadow-sm"
            >
              <span>{sg.icon || '?'}</span>
              <span>{sg.label || `${sg.gain} ${sg.key}`}</span>
            </span>
          ))}
        </div>
      )}

      {/* Barrinha de XP Animada */}
      <div className="relative z-10 mt-3.5 pt-2.5 border-t border-zinc-800/80 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="font-black uppercase tracking-wider text-amber-400">
            Nível {displayedLevel}
          </span>
          <span className="text-zinc-300 font-bold">
            {xpInCurrentLevel.toLocaleString('pt-BR')} / {xpNeededForNextLevel.toLocaleString('pt-BR')} XP{' '}
            <span className="text-amber-300">({Math.round(barWidth)}%)</span>
          </span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-zinc-900 border border-zinc-700/90 overflow-hidden p-0.5">
          <div
            style={{
              width: `${barWidth}%`,
              transition: barAnimated ? 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
            className={`relative h-full rounded-full ${
              showLevelUpCelebration
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 shadow-[0_0_16px_rgba(251,191,36,0.9)]'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(245,158,11,0.65)]'
            }`}
          >
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/60 blur-[2px] rounded-full" />
          </div>
        </div>
      </div>

      {/* Timer inferior de fechamento */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
          style={{
            animation: `xpHudTimer ${durationMs}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export default function XPGainToastContainer() {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const pushXpEvent = useCallback(
    (xpEvent) => {
      const hasContent =
        xpEvent &&
        ((xpEvent.gainedXp || 0) > 0 ||
          Boolean(xpEvent.unlockedClass) ||
          (Array.isArray(xpEvent.statGains) && xpEvent.statGains.length > 0));
      if (!hasContent) return;
      const id = `xp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const durationMs = (xpEvent.leveledUp || xpEvent.unlockedClass) ? 9200 : 6200;

      setItems((prev) => [{ id, event: xpEvent }, ...prev.slice(0, 2)]);

      setTimeout(() => {
        dismiss(id);
      }, durationMs);
    },
    [dismiss]
  );

  useEffect(() => {
    const handler = (e) => {
      if (e?.detail) {
        pushXpEvent(e.detail);
      }
    };
    window.addEventListener('cine-xp-gain-toast', handler);
    return () => window.removeEventListener('cine-xp-gain-toast', handler);
  }, [pushXpEvent]);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] pointer-events-none flex flex-col gap-3 max-w-[430px] w-[calc(100vw-2.5rem)] sm:w-full"
    >
      {items.map((item) => (
        <XPGainCard key={item.id} item={item} onDismiss={dismiss} />
      ))}

      <style>{`
        @keyframes xpHudSlideUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 28px, 0) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @keyframes xpLevelUpPop {
          0% {
            opacity: 0;
            transform: scale(0.88);
          }
          60% {
            transform: scale(1.03);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes xpHudTimer {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
