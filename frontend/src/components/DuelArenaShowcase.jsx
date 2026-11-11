import React, { useEffect, useState } from 'react';
import { Crown, Film, Star, Swords } from 'lucide-react';
import { DUEL_EFFECT_MAP } from '../utils/duelEffectPresets';

const THANOS_DUST_PARTICLES = [
  { x: 14, y: 12, dx: 42, dy: -28, size: 3, delay: 40, color: '#FBBF24' },
  { x: 26, y: 18, dx: 58, dy: -42, size: 4, delay: 90, color: '#C084FC' },
  { x: 18, y: 34, dx: 52, dy: -22, size: 2.5, delay: 130, color: '#FDE68A' },
  { x: 32, y: 26, dx: 68, dy: -46, size: 3.5, delay: 70, color: '#E9D5FF' },
  { x: 22, y: 48, dx: 48, dy: -34, size: 3, delay: 170, color: '#F59E0B' },
  { x: 38, y: 40, dx: 76, dy: -30, size: 4, delay: 110, color: '#A855F7' },
  { x: 12, y: 54, dx: 40, dy: -44, size: 2.5, delay: 200, color: '#D4D4D8' },
  { x: 30, y: 60, dx: 64, dy: -38, size: 3, delay: 150, color: '#FBBF24' },
  { x: 46, y: 22, dx: 72, dy: -50, size: 3, delay: 80, color: '#FDE047' },
  { x: 55, y: 36, dx: 82, dy: -26, size: 2.5, delay: 140, color: '#C084FC' },
  { x: 65, y: 48, dx: 70, dy: -36, size: 3, delay: 180, color: '#F59E0B' },
  { x: 42, y: 52, dx: 60, dy: -52, size: 2, delay: 210, color: '#E4E4E7' },
  { x: 75, y: 24, dx: 65, dy: -40, size: 3, delay: 100, color: '#DDD6FE' },
  { x: 84, y: 42, dx: 74, dy: -28, size: 2.5, delay: 160, color: '#FCD34D' },
];

const GLASS_SHARDS = [
  { clip: 'polygon(0 0, 52% 0, 35% 45%)', dx: -26, dy: -28, rot: -42, delay: 140 },
  { clip: 'polygon(52% 0, 100% 0, 72% 42%, 35% 45%)', dx: 18, dy: -34, rot: 35, delay: 150 },
  { clip: 'polygon(0 0, 35% 45%, 24% 100%, 0 100%)', dx: -34, dy: 14, rot: -55, delay: 160 },
  { clip: 'polygon(35% 45%, 72% 42%, 64% 100%, 24% 100%)', dx: 8, dy: 38, rot: 28, delay: 170 },
  { clip: 'polygon(72% 42%, 100% 0, 100% 72%)', dx: 36, dy: -10, rot: 48, delay: 155 },
  { clip: 'polygon(72% 42%, 100% 72%, 100% 100%, 64% 100%)', dx: 32, dy: 30, rot: 62, delay: 180 },
];

const SLASH_SPARKS = [
  { x: 24, y: 58, dx: -24, dy: -26, delay: 70 },
  { x: 36, y: 46, dx: 26, dy: -22, delay: 90 },
  { x: 48, y: 34, dx: -22, dy: 24, delay: 110 },
  { x: 60, y: 22, dx: 28, dy: 20, delay: 130 },
  { x: 18, y: 66, dx: -30, dy: 12, delay: 100 },
  { x: 70, y: 16, dx: 22, dy: -28, delay: 120 },
];

export default function DuelArenaShowcase({
  oldPosterSrc,
  oldTitle,
  oldRating,
  newPosterSrc,
  newTitle,
  newRating,
  duelEffect = null,
  showVsTakenLabel = false,
  compact = false,
}) {
  const effectMeta = duelEffect ? DUEL_EFFECT_MAP[duelEffect] : null;
  const hasEffect = Boolean(effectMeta);
  const [phase, setPhase] = useState(hasEffect ? 'intro' : 'crowned');

  useEffect(() => {
    if (!hasEffect) {
      setPhase('crowned');
      return;
    }
    setPhase('intro');
    const strikeTimer = setTimeout(() => setPhase('strike'), 420);
    const crownedTimer = setTimeout(() => setPhase('crowned'), 1320);
    return () => {
      clearTimeout(strikeTimer);
      clearTimeout(crownedTimer);
    };
  }, [hasEffect, duelEffect]);

  const isStriking = phase === 'strike' || phase === 'crowned';
  const oldPosterDims = compact ? 'w-9 h-13' : 'w-10 h-14';
  const newPosterDims = compact ? 'w-10 h-14' : 'w-11 h-16';
  const centerDims = compact ? 'w-7 h-7' : 'w-8 h-8';

  const getOldCardAnimClass = () => {
    if (!hasEffect || phase === 'intro') return '';
    switch (duelEffect) {
      case 'card_drop':
        return 'duel-anim-card-drop';
      case 'thanos_snap':
        return 'duel-anim-thanos';
      case 'slash_cleave':
        return 'duel-anim-slash-fade';
      case 'shatter_glass':
        return 'duel-anim-shatter-fade';
      default:
        return '';
    }
  };

  const getNewCardAnimClass = () => {
    if (!hasEffect || phase === 'intro') return hasEffect ? 'opacity-90 scale-[0.96]' : '';
    if (duelEffect === 'thanos_snap') {
      return 'duel-anim-cosmic-rise';
    }
    return 'duel-anim-king-slam';
  };

  return (
    <div
      className={`relative overflow-hidden grid grid-cols-[1fr_auto_1fr] items-center ${
        compact ? 'gap-2 p-2' : 'gap-2.5 p-2.5'
      } bg-zinc-950/80 border border-zinc-800/85 rounded-xl`}
    >
      {/* LADO ESQUERDO: Campeão Anterior (Destronado) */}
      <div className="relative min-w-0">
        {/* Fundo residual discreto após o antigo campeão cair/desintegrar */}
        {hasEffect && isStriking && (
          <div className="absolute inset-0 flex items-center gap-2 opacity-65 pointer-events-none">
            <div
              className={`${oldPosterDims} rounded-lg border border-dashed border-zinc-700/70 bg-zinc-900/50 flex flex-col items-center justify-center shrink-0`}
            >
              <span className="text-sm">{effectMeta.icon}</span>
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                {effectMeta.defeatedLabel}
              </span>
              <span className="text-[10px] font-mono text-zinc-600 truncate">
                ★ {Number(oldRating || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Cartaz + Info do Campeão Anterior com a animação de derrota */}
        <div
          className={`relative flex items-center gap-2 min-w-0 ${
            !hasEffect ? 'opacity-65' : phase === 'intro' ? 'opacity-95' : ''
          } ${getOldCardAnimClass()}`}
        >
          {/* Pino solto em card_drop */}
          {hasEffect && duelEffect === 'card_drop' && isStriking && (
            <span className="absolute -top-1 left-0.5 z-20 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#F59E0B] duel-anim-pin-pop pointer-events-none" />
          )}

          {/* Metade superior/inferior para efeito Corte de Katana */}
          {hasEffect && duelEffect === 'slash_cleave' && isStriking ? (
            <div className={`relative ${oldPosterDims} shrink-0`}>
              {oldPosterSrc ? (
                <>
                  <img
                    src={oldPosterSrc}
                    alt={oldTitle || 'Campeão anterior'}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg border border-rose-400/70 duel-anim-cleave-top"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                  />
                  <img
                    src={oldPosterSrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg border border-rose-400/70 duel-anim-cleave-bottom"
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                  />
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 rounded-lg bg-zinc-800 border border-rose-400/70 flex items-center justify-center duel-anim-cleave-top"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                  >
                    <Film className="w-3.5 h-3.5 text-rose-300" />
                  </div>
                  <div
                    className="absolute inset-0 rounded-lg bg-zinc-900 border border-rose-400/70 flex items-center justify-center duel-anim-cleave-bottom"
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                  >
                    <Film className="w-3.5 h-3.5 text-rose-300" />
                  </div>
                </>
              )}
            </div>
          ) : oldPosterSrc ? (
            <img
              src={oldPosterSrc}
              alt={oldTitle || 'Campeão anterior'}
              className={`${oldPosterDims} object-cover rounded-lg border border-zinc-700 ${
                hasEffect && phase === 'intro' ? 'ring-1 ring-amber-400/40' : 'grayscale'
              } shrink-0`}
            />
          ) : (
            <div
              className={`${oldPosterDims} rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0`}
            >
              <Film className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          )}

          <div className="min-w-0 flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-wider text-rose-300/90">
              {hasEffect && phase === 'intro' ? 'Rei Atual' : 'Destronado'}
            </span>
            <span
              className={`text-[11px] font-bold text-zinc-300 truncate ${
                !hasEffect || isStriking ? 'line-through' : ''
              }`}
            >
              {oldTitle || 'Anterior'}
            </span>
            <span
              className={`text-[10px] font-mono text-zinc-400 ${
                !hasEffect || isStriking ? 'line-through' : ''
              }`}
            >
              ★ {Number(oldRating || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Camadas de partículas & overlays dos 4 efeitos */}
        {hasEffect && isStriking && duelEffect === 'thanos_snap' && (
          <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
            <div className="absolute -inset-1 rounded-lg bg-purple-400/35 duel-anim-snap-flash" />
            {THANOS_DUST_PARTICLES.map((p, idx) => (
              <span
                key={idx}
                className="absolute rounded-full duel-anim-dust-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  animationDelay: `${p.delay}ms`,
                  '--tx': `${p.dx}px`,
                  '--ty': `${p.dy}px`,
                }}
              />
            ))}
          </div>
        )}

        {hasEffect && isStriking && duelEffect === 'slash_cleave' && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className="w-[140%] h-[3px] bg-gradient-to-r from-transparent via-white to-rose-400 shadow-[0_0_16px_#FB7185] duel-anim-katana-beam" />
            {SLASH_SPARKS.map((s, idx) => (
              <span
                key={idx}
                className="absolute w-1.5 h-1.5 rounded-full bg-rose-300 shadow-[0_0_8px_#F43F5E] duel-anim-dust-particle"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  animationDelay: `${s.delay}ms`,
                  '--tx': `${s.dx}px`,
                  '--ty': `${s.dy}px`,
                }}
              />
            ))}
          </div>
        )}

        {hasEffect && isStriking && duelEffect === 'shatter_glass' && (
          <div className="absolute inset-y-0 left-0 w-12 pointer-events-none z-20">
            <svg
              viewBox="0 0 60 80"
              className="w-full h-full duel-anim-crack-flash"
              fill="none"
            >
              <path
                d="M30 40 L4 12 M30 40 L54 8 M30 40 L6 68 M30 40 L56 64 M30 40 L28 2 M30 40 L34 78"
                stroke="#BAE6FD"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {GLASS_SHARDS.map((sh, idx) => (
              <div
                key={idx}
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-100/80 via-sky-300/45 to-white/60 border border-white/80 duel-anim-glass-shard"
                style={{
                  clipPath: sh.clip,
                  animationDelay: `${sh.delay}ms`,
                  '--dx': `${sh.dx}px`,
                  '--dy': `${sh.dy}px`,
                  '--rot': `${sh.rot}deg`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CENTRO: VS / Impacto / Coroa */}
      <div className="relative flex flex-col items-center justify-center px-1 z-20">
        {hasEffect && isStriking && (
          <span
            className={`absolute inset-0 m-auto ${centerDims} rounded-full border-2 border-amber-300 pointer-events-none duel-anim-shockwave`}
          />
        )}
        <div
          className={`${centerDims} rounded-full bg-gradient-to-br from-amber-400/25 to-rose-500/25 border border-amber-400/60 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.35)] transition-transform duration-300 ${
            hasEffect && phase === 'strike' ? 'scale-125' : 'scale-100'
          }`}
        >
          {hasEffect && phase === 'intro' ? (
            <Swords className={compact ? 'w-3.5 h-3.5 text-rose-300' : 'w-4 h-4 text-rose-300'} />
          ) : (
            <Crown
              className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-300 ${
                hasEffect && isStriking ? 'animate-bounce' : ''
              }`}
            />
          )}
        </div>
        {(showVsTakenLabel || hasEffect) && (
          <span className="text-[8px] font-black uppercase tracking-widest text-amber-300 mt-0.5">
            {hasEffect && phase === 'intro' ? 'DUELO' : 'TOMOU!'}
          </span>
        )}
      </div>

      {/* LADO DIREITO: Novo Rei */}
      <div
        className={`relative flex items-center gap-2 min-w-0 justify-end text-right ${getNewCardAnimClass()}`}
      >
        <div className="min-w-0 flex flex-col items-end">
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-300">
            Novo Rei 👑
          </span>
          <span className="text-xs font-black text-white truncate max-w-full">
            {newTitle}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 ${
              compact ? 'text-[10px]' : 'text-[11px]'
            } font-mono font-black text-amber-300`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {Number(newRating || 0).toFixed(2)}
          </span>
        </div>
        {newPosterSrc ? (
          <img
            src={newPosterSrc}
            alt={newTitle}
            className={`${newPosterDims} object-cover rounded-lg border-2 border-amber-400/85 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0`}
          />
        ) : (
          <div
            className={`${newPosterDims} rounded-lg bg-zinc-900 border-2 border-amber-400/70 flex items-center justify-center shrink-0`}
          >
            <Crown className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-amber-300`} />
          </div>
        )}
      </div>

      {hasEffect && (
        <style>{`
          @keyframes duelCardDrop {
            0% { transform-origin: top left; transform: rotate(0deg) translate3d(0, 0, 0); opacity: 1; }
            22% { transform-origin: top left; transform: rotate(-16deg) translate3d(0, 4px, 0); opacity: 1; }
            45% { transform-origin: top left; transform: rotate(-28deg) translate3d(4px, 12px, 0); opacity: 0.95; }
            100% { transform-origin: top left; transform: rotate(24deg) translate3d(10px, 115px, 0) scale(0.75); opacity: 0; }
          }
          .duel-anim-card-drop {
            animation: duelCardDrop 0.95s cubic-bezier(0.55, 0.05, 0.68, 0.53) forwards;
          }
          @keyframes duelPinPop {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(-18px, -22px) scale(0); opacity: 0; }
          }
          .duel-anim-pin-pop {
            animation: duelPinPop 0.45s ease-out forwards;
          }

          @keyframes duelThanosDissolve {
            0% { opacity: 1; filter: blur(0px) sepia(0); transform: translate3d(0, 0, 0); clip-path: inset(0 0 0 0); }
            35% { opacity: 0.9; filter: blur(1px) sepia(0.55) hue-rotate(-30deg); transform: translate3d(3px, -2px, 0); clip-path: inset(0 0 0 12%); }
            100% { opacity: 0; filter: blur(6px) saturate(0.2); transform: translate3d(26px, -18px, 0) scale(0.92); clip-path: inset(0 0 0 100%); }
          }
          .duel-anim-thanos {
            animation: duelThanosDissolve 0.95s ease-in forwards;
          }
          @keyframes duelDustFloat {
            0% { opacity: 0; transform: translate3d(0, 0, 0) scale(1.2); }
            18% { opacity: 1; }
            100% { opacity: 0; transform: translate3d(var(--tx), var(--ty), 0) scale(0.2); }
          }
          .duel-anim-dust-particle {
            animation: duelDustFloat 0.9s ease-out forwards;
          }
          @keyframes duelSnapFlash {
            0% { opacity: 0.9; transform: scale(0.85); }
            100% { opacity: 0; transform: scale(1.35); }
          }
          .duel-anim-snap-flash {
            animation: duelSnapFlash 0.45s ease-out forwards;
          }

          @keyframes duelKatanaBeam {
            0% { opacity: 0; transform: rotate(-32deg) scaleX(0); }
            25% { opacity: 1; transform: rotate(-32deg) scaleX(1.2); }
            100% { opacity: 0; transform: rotate(-32deg) scaleX(1.4); }
          }
          .duel-anim-katana-beam {
            animation: duelKatanaBeam 0.45s ease-out forwards;
          }
          @keyframes duelCleaveTop {
            0% { transform: translate(0, 0) rotate(0); opacity: 1; }
            35% { transform: translate(-8px, -8px) rotate(-6deg); opacity: 0.95; }
            100% { transform: translate(-22px, -24px) rotate(-14deg); opacity: 0; }
          }
          @keyframes duelCleaveBottom {
            0% { transform: translate(0, 0) rotate(0); opacity: 1; }
            35% { transform: translate(8px, 10px) rotate(6deg); opacity: 0.95; }
            100% { transform: translate(18px, 32px) rotate(16deg); opacity: 0; }
          }
          @keyframes duelSlashFade {
            0%, 28% { opacity: 1; }
            100% { opacity: 0; transform: translateY(10px); }
          }
          .duel-anim-cleave-top { animation: duelCleaveTop 0.85s ease-out forwards; }
          .duel-anim-cleave-bottom { animation: duelCleaveBottom 0.85s ease-out forwards; }
          .duel-anim-slash-fade { animation: duelSlashFade 0.9s ease-out forwards; }

          @keyframes duelShatterFade {
            0% { transform: translate(0, 0); opacity: 1; }
            15% { transform: translate(-4px, 2px); }
            25% { transform: translate(4px, -2px); }
            35% { transform: translate(-3px, -2px); opacity: 0.95; }
            100% { transform: scale(0.7); opacity: 0; filter: blur(4px); }
          }
          .duel-anim-shatter-fade {
            animation: duelShatterFade 0.8s ease-in forwards;
          }
          @keyframes duelCrackFlash {
            0% { opacity: 0; }
            20%, 60% { opacity: 1; }
            100% { opacity: 0; }
          }
          .duel-anim-crack-flash {
            animation: duelCrackFlash 0.65s ease-out forwards;
          }
          @keyframes duelGlassShardFly {
            0% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(1); }
            20% { opacity: 0.95; }
            100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.45); }
          }
          .duel-anim-glass-shard {
            animation: duelGlassShardFly 0.8s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
          }

          @keyframes duelKingSlam {
            0% { transform: translate3d(0, -18px, 0) scale(1.08); }
            65% { transform: translate3d(0, 2px, 0) scale(1.02); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
          .duel-anim-king-slam {
            animation: duelKingSlam 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes duelCosmicRise {
            0% { opacity: 0.5; filter: brightness(1.8) drop-shadow(0 0 12px #A855F7); transform: scale(0.92); }
            100% { opacity: 1; filter: brightness(1); transform: scale(1); }
          }
          .duel-anim-cosmic-rise {
            animation: duelCosmicRise 0.65s ease-out forwards;
          }
          @keyframes duelShockwave {
            0% { opacity: 0.95; transform: scale(0.7); }
            100% { opacity: 0; transform: scale(2.8); }
          }
          .duel-anim-shockwave {
            animation: duelShockwave 0.6s ease-out forwards;
          }
        `}</style>
      )}
    </div>
  );
}
