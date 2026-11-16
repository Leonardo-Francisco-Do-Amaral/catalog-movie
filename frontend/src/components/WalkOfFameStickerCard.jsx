import React, { useState, useCallback } from 'react';
import { Lock, Sparkles, CheckCircle2, Star, Layers, Clock, RefreshCw, Users, Heart } from 'lucide-react';
import {
  getThemeForTier,
  IMMORTAL_AURA_PRESETS,
  isDirectorStar,
  isDubladorStar,
  resolveEffectiveImmortalAura,
  resolveUnlocksForPct,
  resolveWalkMediaUrl,
  resolveWalkRpgRank,
  RISING_STAR_RANK_X_TOOLTIP,
  RISING_STAR_THEME,
} from '../utils/walkOfFameStickers';

function getRankBadgeClass(rank) {
  switch (rank) {
    case 'X':
      return 'bg-gradient-to-r from-sky-500/35 via-indigo-500/35 to-cyan-400/35 text-sky-100 border-sky-300/85 shadow-[0_0_12px_rgba(56,189,248,0.35)]';
    case 'SS':
      return 'bg-gradient-to-r from-amber-400/35 via-yellow-300/25 to-sky-400/35 text-amber-100 border-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.3)]';
    case 'S':
      return 'bg-sky-500/25 text-sky-200 border-sky-400/75';
    case 'A+':
      return 'bg-rose-500/25 text-rose-200 border-rose-400/70';
    case 'A':
      return 'bg-amber-500/25 text-amber-200 border-amber-400/65';
    case 'B':
      return 'bg-purple-500/25 text-purple-200 border-purple-400/65';
    case 'C':
      return 'bg-slate-400/20 text-slate-200 border-slate-300/60';
    case 'D':
      return 'bg-[#cd7f32]/25 text-amber-200 border-[#cd7f32]/65';
    default:
      return 'bg-zinc-800/90 text-zinc-400 border-zinc-700';
  }
}

function RankBadge({
  rank,
  isRisingStar = false,
  prefixRankWord = false,
  tooltipPlacement = 'down',
}) {
  const label = prefixRankWord ? `RANK ${rank}` : rank;
  const pill = (
    <span
      className={`px-1.5 py-0.5 rounded border text-[9px] font-black ${
        prefixRankWord ? 'uppercase tracking-wider ' : ''
      }${getRankBadgeClass(rank)} ${isRisingStar ? 'cursor-help inline-flex items-center' : ''}`}
    >
      {label}
    </span>
  );

  if (!isRisingStar) return pill;

  return (
    <span className="relative inline-flex group/rank shrink-0">
      {pill}
      <span
        role="tooltip"
        className={`hidden group-hover/rank:block pointer-events-none absolute left-0 ${
          tooltipPlacement === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        } w-44 sm:w-48 z-50 rounded-xl bg-zinc-950/95 border border-sky-400/75 px-2.5 py-2 text-left shadow-2xl`}
      >
        <span className="block text-[9.5px] font-black text-sky-200 uppercase tracking-wider">
          🌟 Estrela em Ascensão (Rank X)
        </span>
        <span className="block text-[10px] font-medium text-zinc-200 leading-snug normal-case tracking-normal mt-0.5">
          Diretor com até 7 filmes na carreira. Figurinha e Show de Cartazes liberam juntos aos 80%; demais seções já liberadas.
        </span>
      </span>
    </span>
  );
}

function GroupProtagonistBackFace({ star, members, selectedName, onPick, onCloseFlip }) {
  const useCompactGrid = members.length >= 5;
  const isCouple = star?.alameda === 'casais';

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full h-full rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-400/65 p-2.5 flex flex-col justify-between shadow-[0_14px_38px_rgba(0,0,0,0.85)]"
    >
      <div className="flex items-center justify-between gap-1.5 border-b border-zinc-800 pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {isCouple ? (
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <Users className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          )}
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 truncate">
            {isCouple ? 'Par na Carta' : 'Protagonista'}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCloseFlip?.();
          }}
          className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-200 cursor-pointer shrink-0"
        >
          Virar
        </button>
      </div>

      <div
        className={`flex-1 min-h-0 overflow-y-auto overscroll-contain py-1.5 ${
          useCompactGrid ? 'grid grid-cols-2 gap-1.5 content-start' : 'space-y-1.5 pr-0.5'
        }`}
      >
        {members.map((m) => {
          const isActive = m.name === selectedName || (!selectedName && members[0]?.name === m.name);
          const photo = resolveWalkMediaUrl(m.photoUrl);

          if (useCompactGrid) {
            return (
              <button
                key={m.name}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPick?.(m.name);
                }}
                title={`${m.name} (${m.watchedCount ?? 0} filmes)`}
                className={`relative w-full flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/25 border-amber-400 shadow'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800/80'
                }`}
              >
                {isActive && (
                  <span className="absolute top-1 right-1 text-[9px] font-black text-amber-300 leading-none">
                    ✓
                  </span>
                )}
                {photo ? (
                  <img
                    src={photo}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover object-top border border-amber-400/50 shrink-0 pointer-events-none"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs shrink-0 pointer-events-none">
                    🎬
                  </div>
                )}
                <div className="w-full min-w-0 pointer-events-none">
                  <p className="text-[10px] font-black text-white line-clamp-2 break-words leading-tight">
                    {m.name}
                  </p>
                  <p className="text-[8px] text-zinc-400 truncate leading-tight">
                    {m.watchedCount ?? 0} {m.watchedCount === 1 ? 'filme' : 'filmes'}
                  </p>
                </div>
              </button>
            );
          }

          return (
            <button
              key={m.name}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPick?.(m.name);
              }}
              className={`w-full flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400/80 shadow'
                  : 'bg-zinc-900/75 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover object-top border border-amber-400/50 shrink-0 pointer-events-none"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs shrink-0 pointer-events-none">
                  🎬
                </div>
              )}
              <div className="min-w-0 flex-1 pointer-events-none">
                <p className="text-[11px] font-black text-white line-clamp-2 leading-tight">{m.name}</p>
                <p className="text-[9px] text-zinc-400 truncate">
                  {m.watchedCount ?? 0} {m.watchedCount === 1 ? 'filme' : 'filmes'}
                  {typeof m.avgUserRating === 'number' ? ` • ★ ${m.avgUserRating.toFixed(1)}` : ''}
                </p>
              </div>
              {isActive && (
                <span className="text-[9px] font-black text-amber-300 shrink-0">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[9px] text-center text-zinc-500 pt-1 border-t border-zinc-800/80 leading-tight line-clamp-2 shrink-0">
        {star.name}
      </p>
    </div>
  );
}

const PLATINA_GLINTS = [
  { top: '14%', left: '18%', size: 12, delay: '0s', dur: '1.7s', color: '#ffffff' },
  { top: '26%', left: '80%', size: 15, delay: '0.5s', dur: '2.1s', color: '#e0f2fe' },
  { top: '55%', left: '16%', size: 10, delay: '1.1s', dur: '1.8s', color: '#f8fafc' },
  { top: '65%', left: '82%', size: 13, delay: '0.3s', dur: '2.3s', color: '#bae6fd' },
];

const BRONZE_SPARKS = [
  { left: '18%', size: 4, delay: '0s', dur: '2.5s', color: '#fdba74' },
  { left: '42%', size: 3, delay: '0.8s', dur: '2.1s', color: '#fbbf24' },
  { left: '68%', size: 4, delay: '1.3s', dur: '2.4s', color: '#fb923c' },
  { left: '84%', size: 3, delay: '0.5s', dur: '1.9s', color: '#fde68a' },
];

function FourPointGlint({ top, left, size, delay, dur, color }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute pointer-events-none"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        animation: `stickerSparkBlink ${dur} ease-in-out ${delay} infinite`,
        filter: `drop-shadow(0 0 6px ${color})`,
      }}
    >
      <path d="M12 0 L14.8 9.2 L24 12 L14.8 14.8 L12 24 L9.2 14.8 L0 12 L9.2 9.2 Z" fill={color} />
    </svg>
  );
}

function FoilEffectOverlays({ effectId, pointer }) {
  const glowPos = `${pointer.x}% ${pointer.y}%`;

  return (
    <>
      {/* 15% OFICIAL: BRONZE 2 — ÂMBAR FORJADO */}
      {effectId === 'bronze_forjado' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-35"
            style={{
              background:
                'radial-gradient(circle at 50% 85%, rgba(234,88,12,0.55), transparent 65%)',
            }}
          />
          {BRONZE_SPARKS.map((sp, idx) => (
            <span
              key={idx}
              className="absolute bottom-5 rounded-full pointer-events-none"
              style={{
                left: sp.left,
                width: `${sp.size}px`,
                height: `${sp.size}px`,
                backgroundColor: sp.color,
                boxShadow: `0 0 7px 2px ${sp.color}`,
                animation: `stickerFloatUp ${sp.dur} ease-out ${sp.delay} infinite`,
              }}
            />
          ))}
        </>
      )}

      {/* 30% OFICIAL: PRATA 2 — PLATINA CINTILANTE */}
      {effectId === 'prata_platina' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-32 mix-blend-screen"
            style={{
              background:
                'radial-gradient(circle at 25% 20%, rgba(224,242,254,0.6), transparent 55%), radial-gradient(circle at 80% 80%, rgba(203,213,225,0.5), transparent 55%)',
            }}
          />
          {PLATINA_GLINTS.map((sp, idx) => (
            <FourPointGlint key={idx} {...sp} />
          ))}
        </>
      )}

      {/* 45% (EFEITO 8): AURORA BOREAL */}
      {effectId === 'aurora_wave' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-55 mix-blend-screen sticker-hue-cycle"
          style={{
            background:
              'radial-gradient(ellipse 115% 50% at 30% 18%, rgba(52,211,153,0.72), transparent 70%), radial-gradient(ellipse 105% 48% at 75% 32%, rgba(168,85,247,0.58), transparent 72%)',
          }}
        />
      )}

      {/* 60% (EFEITO 1): OURO LÍQUIDO 24K */}
      {effectId === 'liquid_gold' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-38 mix-blend-soft-light"
            style={{
              background:
                'linear-gradient(135deg, rgba(254,240,138,0.58), transparent 42%, rgba(250,204,21,0.52) 75%, rgba(255,255,255,0.42))',
            }}
          />
          <div
            className="absolute -inset-y-8 w-20 pointer-events-none sticker-sheen-bar"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(254,240,138,0.88), rgba(250,204,21,0.62), transparent)',
            }}
          />
        </>
      )}

      {/* 75% (EFEITO 13): CYBERPUNK SCANLINE PERCORRENDO TODA A FIGURA */}
      {effectId === 'cyber_glitch' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-28"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(34,211,238,0.24) 0px 1px, transparent 1px 4px)',
            }}
          />
          <div
            className="absolute left-0 right-0 h-8 pointer-events-none sticker-scan-down"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.28) 35%, rgba(34,211,238,0.95) 52%, rgba(244,63,94,0.65) 68%, transparent 100%)',
              boxShadow: '0 0 14px rgba(34,211,238,0.75)',
            }}
          />
          <div className="absolute top-8 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-300/95 pointer-events-none" />
          <div className="absolute top-8 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-rose-400/95 pointer-events-none" />
          <div className="absolute bottom-14 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-300/75 pointer-events-none" />
          <div className="absolute bottom-14 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-rose-400/75 pointer-events-none" />
        </>
      )}

      {/* 90% (EFEITO 3): CRACKED ICE PRISM */}
      {effectId === 'cracked_ice' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-48 mix-blend-color-dodge sticker-hue-cycle"
            style={{
              backgroundImage: `linear-gradient(115deg, rgba(56,189,248,0.48) 12%, transparent 13%, transparent 38%, rgba(244,63,94,0.48) 39%, transparent 41%), linear-gradient(35deg, rgba(168,85,247,0.48) 22%, transparent 23%, transparent 62%, rgba(250,204,21,0.48) 63%, transparent 65%), conic-gradient(from ${(pointer.x * 2).toFixed(0)}deg at ${glowPos}, rgba(56,189,248,0.52), rgba(255,255,255,0.58), rgba(168,85,247,0.52), rgba(56,189,248,0.52))`,
              backgroundSize: '36px 36px, 44px 44px, 100% 100%',
            }}
          />
          <div
            className="absolute -inset-y-8 w-20 pointer-events-none sticker-sheen-bar"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(224,242,254,0.88), rgba(56,189,248,0.52), transparent)',
            }}
          />
        </>
      )}

      {/* ===================================================================
          EFEITOS ESPECIAIS 35MM OFICIAIS DOS DIRETORES (TAKES 1–5 + ASCENSÃO)
         =================================================================== */}
      {/* Take 1 (Bronze • 20%): Carretel Kodak em Movimento 35mm */}
      {effectId === 'film35_scrolling_ember' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-35"
            style={{
              background:
                'linear-gradient(125deg, rgba(251,191,36,0.35), transparent 45%, rgba(217,119,6,0.45) 88%)',
            }}
          />
          <div
            className="absolute inset-y-0 left-0 w-16 pointer-events-none sticker-beam-sweep mix-blend-screen"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(253,224,71,0.34), transparent)',
            }}
          />
        </>
      )}

      {/* Take 2 (Prata • 40%): Moviola de Montagem 35mm */}
      {effectId === 'film35_moviola_cut' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(125,211,252,0.18) 0px 1px, transparent 1px 6px)',
            }}
          />
          <div
            className="absolute -inset-y-8 w-20 pointer-events-none sticker-sheen-bar"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(186,230,253,0.75), rgba(56,189,248,0.4), transparent)',
            }}
          />
        </>
      )}

      {/* Take 3 (Ouro • 60%): Carretel Gala Dourado 35mm */}
      {effectId === 'film35_gala_confetti' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-32"
            style={{
              background:
                'radial-gradient(circle at 50% 85%, rgba(250,204,21,0.5), transparent 65%)',
            }}
          />
          {BRONZE_SPARKS.map((sp, idx) => (
            <span
              key={idx}
              className="absolute bottom-5 rounded-full pointer-events-none"
              style={{
                left: sp.left,
                width: `${sp.size}px`,
                height: `${sp.size}px`,
                backgroundColor: '#fef08a',
                boxShadow: '0 0 8px 2px rgba(250,204,21,0.85)',
                animation: `stickerFloatUp ${sp.dur} ease-out ${sp.delay} infinite`,
              }}
            />
          ))}
        </>
      )}

      {/* Take 4 (Mítico • 80%): Tapete Vermelho Paparazzi 35mm */}
      {effectId === 'film35_premiere_flash' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-35"
            style={{
              background:
                'radial-gradient(circle at 80% 18%, rgba(251,113,133,0.48), transparent 55%), radial-gradient(circle at 20% 82%, rgba(250,204,21,0.38), transparent 55%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none bg-white sticker-flash-burst mix-blend-screen"
          />
        </>
      )}

      {/* Take 5 (Diamante • 90%+): Celuloide Platina Solar 35mm */}
      {effectId === 'film35_celestial_reel' && (
        <>
          <div
            className="absolute inset-[-40%] pointer-events-none opacity-38 mix-blend-screen sticker-conic-spin"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(254,240,138,0.55) 45deg, transparent 90deg, rgba(56,189,248,0.5) 180deg, transparent 225deg, rgba(255,255,255,0.55) 310deg, transparent 360deg)',
            }}
          />
          {PLATINA_GLINTS.map((sp, idx) => (
            <FourPointGlint key={idx} {...sp} color="#fef08a" />
          ))}
        </>
      )}

      {/* Estrela em Ascensão (≤ 7 filmes): Visor IMAX Titânio & Safira 35mm */}
      {effectId === 'rising_titanium_hud' && (
        <>
          <div
            className="absolute -inset-y-8 w-20 pointer-events-none sticker-sheen-bar"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(186,230,253,0.8), rgba(129,140,248,0.4), transparent)',
            }}
          />
          <span className="absolute top-8 left-2.5 px-1.5 py-0.5 rounded bg-zinc-950/75 border border-sky-300/60 text-[7.5px] font-mono font-black tracking-wider text-sky-200 flex items-center gap-1 pointer-events-none z-[7]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            REC
          </span>
          <div className="absolute top-8 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-sky-300/90 pointer-events-none" />
          <div className="absolute top-8 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-sky-300/90 pointer-events-none" />
          <div className="absolute bottom-14 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-300/90 pointer-events-none" />
          <div className="absolute bottom-14 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-300/90 pointer-events-none" />
        </>
      )}

      {/* Reflexo especular do cursor */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle 130px at ${glowPos}, rgba(255,255,255,0.72), rgba(255,255,255,0.14) 48%, transparent 74%)`,
        }}
      />
    </>
  );
}

function Director35mmRails({
  variant = 'classic',
  trackBg = 'rgba(9, 9, 11, 0.78)',
  holeColor = 'rgba(255, 255, 255, 0.35)',
  compact = false,
}) {
  const isScroll = variant === 'reel_scroll';
  const isLocked = variant === 'locked';
  const isUnlockedDashed = variant === 'unlocked_dashed';
  const trackWidth = compact ? 'w-[8px]' : 'w-[9px]';

  if (isLocked || isUnlockedDashed) {
    const holeBg = isUnlockedDashed ? 'rgba(251, 191, 36, 0.28)' : 'rgba(113, 113, 122, 0.25)';
    const railBg = isUnlockedDashed ? 'rgba(245, 158, 11, 0.1)' : 'rgba(9, 9, 11, 0.55)';
    return (
      <>
        {['left', 'right'].map((side) => (
          <div
            key={side}
            aria-hidden="true"
            className={`absolute inset-y-2 ${side === 'left' ? 'left-1 rounded-l' : 'right-1 rounded-r'} ${trackWidth} pointer-events-none z-[4] flex flex-col justify-between py-1.5 items-center`}
            style={{ backgroundColor: railBg }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="w-[5px] h-[7px] rounded-[1.5px] border"
                style={{
                  backgroundColor: holeBg,
                  borderColor: isUnlockedDashed ? 'rgba(251,191,36,0.45)' : 'rgba(161,161,170,0.28)',
                }}
              />
            ))}
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {['left', 'right'].map((side) => (
        <div
          key={side}
          aria-hidden="true"
          className={`absolute inset-y-[6px] ${side === 'left' ? 'left-[1.5px]' : 'right-[1.5px]'} w-[9px] rounded-sm pointer-events-none z-[8] overflow-hidden flex flex-col items-center`}
          style={{
            backgroundColor: trackBg,
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.85)',
          }}
        >
          {isScroll ? (
            <div
              className="w-full h-full film35-reel-scroll"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px 4px, ${holeColor} 4px 11px, transparent 11px 16px)`,
                backgroundSize: '5px 16px',
                backgroundPositionX: 'center',
                backgroundRepeat: 'repeat-y',
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col justify-between py-1 items-center">
              {Array.from({ length: 13 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[5px] h-[7px] rounded-[1.5px] border"
                  style={{
                    backgroundColor: holeColor,
                    borderColor: 'rgba(255,255,255,0.28)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

const SOUNDWAVE_BAR_WIDTHS = [38, 82, 54, 95, 44, 76, 98, 60, 88, 48, 72];

function DubladorSoundwaveRails({
  variant = 'studio',
  accentHex = '#f59e0b',
  compact = false,
}) {
  const isLocked = variant === 'locked';
  const isUnlockedDashed = variant === 'unlocked_dashed';
  const railWidth = compact ? 'w-[8px]' : 'w-[9px]';
  const trackBg = isLocked
    ? 'rgba(9, 9, 11, 0.55)'
    : isUnlockedDashed
    ? 'rgba(245, 158, 11, 0.12)'
    : 'rgba(9, 9, 11, 0.82)';

  return (
    <>
      {['left', 'right'].map((side) => {
        const isLeft = side === 'left';
        return (
          <div
            key={side}
            aria-hidden="true"
            className={`absolute ${
              isLocked || isUnlockedDashed ? 'inset-y-2' : 'inset-y-[6px]'
            } ${
              isLocked || isUnlockedDashed
                ? isLeft
                  ? 'left-1 rounded-l'
                  : 'right-1 rounded-r'
                : isLeft
                ? 'left-[1.5px] rounded-sm'
                : 'right-[1.5px] rounded-sm'
            } ${railWidth} pointer-events-none ${
              isLocked || isUnlockedDashed ? 'z-[4]' : 'z-[8]'
            } overflow-hidden flex flex-col justify-between py-1 px-[1px] items-center`}
            style={{
              backgroundColor: trackBg,
              boxShadow: isLocked ? undefined : 'inset 0 0 4px rgba(0,0,0,0.85)',
            }}
          >
            <span
              className="text-[7px] leading-none font-black select-none shrink-0"
              style={{
                color: isLocked ? 'rgba(161, 161, 170, 0.45)' : accentHex,
              }}
            >
              {isLeft ? '♪' : '♫'}
            </span>
            <div
              className={`w-full flex-1 flex flex-col justify-between py-1 ${
                isLeft ? 'items-start' : 'items-end'
              }`}
            >
              {SOUNDWAVE_BAR_WIDTHS.map((w, idx) => {
                const mirroredW = isLeft
                  ? w
                  : SOUNDWAVE_BAR_WIDTHS[SOUNDWAVE_BAR_WIDTHS.length - 1 - idx];
                const isPeak = idx === 3 || idx === 6;
                return (
                  <span
                    key={idx}
                    className="h-[3px] rounded-full transition-all"
                    style={{
                      width: `${mirroredW}%`,
                      backgroundColor: isLocked
                        ? 'rgba(161, 161, 170, 0.28)'
                        : isUnlockedDashed
                        ? isPeak
                          ? 'rgba(251, 191, 36, 0.72)'
                          : 'rgba(251, 191, 36, 0.36)'
                        : isPeak
                        ? '#fb7185'
                        : accentHex,
                      opacity: isLocked
                        ? 0.5
                        : isUnlockedDashed
                        ? 0.75
                        : idx % 2 === 0
                        ? 0.92
                        : 0.65,
                      boxShadow:
                        !isLocked && !isUnlockedDashed && isPeak
                          ? '0 0 5px rgba(251, 113, 133, 0.7)'
                          : undefined,
                    }}
                  />
                );
              })}
            </div>
            <span
              className="text-[7px] leading-none font-black select-none shrink-0"
              style={{
                color: isLocked ? 'rgba(161, 161, 170, 0.45)' : '#fb7185',
              }}
            >
              {isLeft ? '♫' : '♪'}
            </span>
          </div>
        );
      })}
    </>
  );
}

/**
 * Motivo visual de dublagem: notas musicais e arcos sonoros sutis sem encobrir o rosto.
 */
function DubladorMusicalNotesOverlay({ accentHex = '#fbbf24', subtle = false }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden z-[6] select-none ${
        subtle ? 'opacity-45' : 'opacity-90'
      }`}
    >
      {/* Linha ondulada sutil de estúdio no rodapé */}
      <svg
        viewBox="0 0 200 44"
        preserveAspectRatio="none"
        className="absolute bottom-14 left-0 right-0 w-full h-11 opacity-55"
      >
        <path
          d="M0,28 Q25,10 50,24 T100,20 T150,26 T200,16"
          fill="none"
          stroke={accentHex}
          strokeWidth="1.25"
          strokeDasharray="3 3"
        />
        <path
          d="M0,34 Q30,22 60,32 T120,28 T180,33 T200,26"
          fill="none"
          stroke="#fb7185"
          strokeWidth="1"
          strokeOpacity="0.7"
        />
      </svg>

      {/* Notas musicais flutuantes nas margens inferiores e laterais */}
      <span
        className="absolute bottom-[74px] left-2.5 text-sm font-black -rotate-12"
        style={{
          color: accentHex,
          textShadow: `0 0 10px ${accentHex}, 0 2px 6px rgba(0,0,0,0.95)`,
        }}
      >
        ♪
      </span>
      <span
        className="absolute bottom-[98px] left-4 text-[11px] font-black rotate-6 text-rose-300/90"
        style={{
          textShadow: '0 0 8px rgba(251,113,133,0.75), 0 2px 6px rgba(0,0,0,0.95)',
        }}
      >
        ♫
      </span>
      <span
        className="absolute bottom-[78px] right-2.5 text-base font-black rotate-12"
        style={{
          color: '#fde68a',
          textShadow: `0 0 12px ${accentHex}, 0 2px 6px rgba(0,0,0,0.95)`,
        }}
      >
        ♬
      </span>
      <span
        className="absolute bottom-[106px] right-4 text-xs font-black -rotate-6"
        style={{
          color: accentHex,
          textShadow: `0 0 10px ${accentHex}, 0 2px 6px rgba(0,0,0,0.95)`,
        }}
      >
        ♪
      </span>
      <span
        className="absolute top-11 right-2.5 text-[11px] font-black rotate-12 opacity-80"
        style={{
          color: '#fde68a',
          textShadow: `0 0 8px ${accentHex}, 0 2px 6px rgba(0,0,0,0.95)`,
        }}
      >
        ♫
      </span>
    </div>
  );
}

const WalkOfFameStickerCard = React.memo(function WalkOfFameStickerCard({
  star,
  isStuck = false,
  justStuck = false,
  forceUnlocked = false,
  overrideTierKey = null,
  overrideUnderlayTierKey = null,
  overridePct = null,
  overrideExtraStars = null,
  demoBadge = null,
  signatureMode = 'normal',
  onStick,
  onUnstick,
  onSelect,
  onOpenTimeline,
  onOpenDirectorVerdict,
  onSelectProtagonist,
}) {
  const [pointer, setPointer] = useState({ x: 50, y: 35, rx: 0, ry: 0, active: false });
  const [isFlipped, setIsFlipped] = useState(false);

  const isDirectorCard = isDirectorStar(star);
  const isDubladorCard = !isDirectorCard && isDubladorStar(star);
  const hasSideRails = isDirectorCard || isDubladorCard;
  const isNewEraVisionary = Boolean(star.isNewEraVisionary);
  const unlockFloor = isDirectorCard ? (isNewEraVisionary ? 80 : 20) : 15;
  const effectivePct = overridePct !== null ? overridePct : Number(star.percentage || 0);
  const unlocks =
    star.unlocks ||
    resolveUnlocksForPct(effectivePct, isDirectorCard, isNewEraVisionary, isDubladorCard);

  const isUnlocked = Boolean(
    overrideTierKey ||
      forceUnlocked ||
      (overridePct !== null
        ? effectivePct >= unlockFloor
        : star.isStickerUnlocked || effectivePct >= unlockFloor)
  );
  const hasPendingOverlayUpgrade = Boolean(
    !overrideTierKey &&
      !(isDirectorCard && isNewEraVisionary) &&
      isStuck &&
      star.hasRarityUpgradeToStick &&
      star.stuckTier
  );
  const displayedTierKey = overrideTierKey
    ? overrideTierKey
    : hasPendingOverlayUpgrade
    ? star.stuckTier
    : (isStuck && star.stuckTier) || star.statusTierKey || 'bronze';

  const upgradeTargetTheme = hasPendingOverlayUpgrade
    ? getThemeForTier(star.statusTierKey, isDirectorCard)
    : null;
  const underlayTierKey =
    isDirectorCard && isNewEraVisionary
      ? null
      : overrideUnderlayTierKey || (!hasPendingOverlayUpgrade ? star.previousStuckTier : null);
  const underlayTheme = underlayTierKey ? getThemeForTier(underlayTierKey, isDirectorCard) : null;

  const visualTheme =
    isDirectorCard && isNewEraVisionary
      ? RISING_STAR_THEME
      : getThemeForTier(displayedTierKey, isDirectorCard);
  const extraStars = overrideExtraStars !== null ? overrideExtraStars : Number(star.extraStars || 0);
  const numLabel = `#${String(star.albumNumber).padStart(3, '0')}`;
  const subtleTilt = demoBadge || justStuck ? 0 : star.albumNumber % 2 === 0 ? 0.7 : -0.7;

  const auraPreset = unlocks.immortalUnlocked
    ? resolveEffectiveImmortalAura(star.immortalAura || 'prism', extraStars)
    : IMMORTAL_AURA_PRESETS.prism;
  const useCustomShowcaseFrame = isDirectorCard && isNewEraVisionary;
  const activeFrameBackground = useCustomShowcaseFrame
    ? visualTheme.frameBackground
    : unlocks.immortalUnlocked
    ? auraPreset.frameBg
    : visualTheme.frameBackground;
  const activeBoxShadow = useCustomShowcaseFrame
    ? visualTheme.boxShadow
    : unlocks.immortalUnlocked
    ? auraPreset.shadow
    : visualTheme.boxShadow;
  const signatureFilm =
    unlocks.galaUnlocked || unlocks.immortalUnlocked ? star.signatureFilm : null;

  const displayPhotoUrl = resolveWalkMediaUrl(
    unlocks.skinsUnlocked && star.activePhotoUrl ? star.activePhotoUrl : star.photoUrl
  );
  const rpgRank =
    star.rpgRank ||
    resolveWalkRpgRank(effectivePct, extraStars, isDirectorCard, isNewEraVisionary);
  const rpgClassLabel = star.rpgClassLabel || star.rpgTitle || star.tagline;
  const groupMembers = Array.isArray(star.groupMembers) ? star.groupMembers : [];
  const isGroupSelectable = Boolean(
    isUnlocked && groupMembers.length > 1 && onSelectProtagonist && !demoBadge
  );
  const hasAvgRating = typeof star.avgUserRating === 'number';
  const filmCountLabel = `${star.watchedCount} ${star.watchedCount === 1 ? 'filme' : 'filmes'}`;
  const isLongName = String(star.name || '').length > 22;
  const rawNatCodes =
    Array.isArray(star.nationalityCodes) && star.nationalityCodes.length > 0
      ? star.nationalityCodes
      : star.nationalityCode
      ? [star.nationalityCode]
      : [];
  const natCodes = rawNatCodes.filter(Boolean).slice(0, 3);
  const natLabel = star.nationalityLabel || '';
  const flagBadge =
    natCodes.length > 0 ? (
      <span
        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-zinc-950/90 border border-white/20 shadow-sm shrink-0"
        title={natLabel ? `Nacionalidade: ${natLabel}` : 'Nacionalidade'}
      >
        {natCodes.map((code) => (
          <img
            key={code}
            src={`https://flagcdn.com/w40/${String(code).toLowerCase()}.png`}
            alt={code}
            className="w-3.5 h-2.5 object-cover rounded-[2px]"
          />
        ))}
      </span>
    ) : null;
  const isCoupleCard = star.alameda === 'casais';
  const kindBadgeConfig =
    isDirectorCard && isNewEraVisionary
      ? {
          icon: '🌟',
          title: 'Visionário da Nova Era (Diretor & Roteirista • Até 7 filmes)',
          className: 'bg-cyan-950/90 border-amber-300/80 text-amber-100',
        }
      : isDirectorCard
      ? {
          icon: '🎬✍️',
          title: 'Diretor & Roteirista',
          className: 'bg-indigo-950/90 border-indigo-400/70 text-indigo-100',
        }
      : star.kind === 'dublador'
      ? {
          icon: '🎙️',
          title: 'Dublador(a) — Estúdio de Voz & Dublagem',
          className: 'bg-cyan-950/90 border-cyan-400/55',
        }
      : isCoupleCard
      ? {
          icon: '💑',
          title: 'Casal Icônico',
          className: 'bg-rose-950/90 border-rose-400/55',
        }
      : star.kind === 'group'
      ? {
          icon: '👥',
          title: 'Elenco & Dupla',
          className: 'bg-purple-950/90 border-purple-400/55',
        }
      : {
          icon: '🎭',
          title: 'Ator / Atriz',
          className: 'bg-amber-950/85 border-amber-400/45',
        };
  const kindBadge = isDirectorCard ? null : (
    <span
      className={`inline-flex items-center justify-center px-1 py-0.5 rounded border text-[9px] leading-none shadow-sm shrink-0 ${kindBadgeConfig.className}`}
      title={kindBadgeConfig.title}
    >
      {kindBadgeConfig.icon}
    </span>
  );
  const oscarWins = Number(star.oscarWins || 0);
  const oscarNominations = Number(star.oscarNominations || 0);
  const isOscarWinner = oscarWins > 0;
  const isOscarNominee = !isOscarWinner && oscarNominations > 0;
  const oscarBadge =
    isOscarWinner || isOscarNominee ? (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold tracking-wider leading-none ${
          isOscarWinner
            ? 'bg-amber-950/85 border-amber-400/55 text-amber-300'
            : 'bg-blue-950/85 border-blue-400/55 text-blue-300'
        }`}
        title={
          isOscarWinner
            ? `${oscarWins} ${oscarWins === 1 ? 'vitória' : 'vitórias'} e ${oscarNominations} ${oscarNominations === 1 ? 'indicação' : 'indicações'} ao Oscar`
            : `${oscarNominations} ${oscarNominations === 1 ? 'indicação' : 'indicações'} ao Oscar`
        }
      >
        {isOscarWinner
          ? `🏆 ${oscarWins} ${oscarWins === 1 ? 'VITÓRIA' : 'VITÓRIAS'} / ${oscarNominations} IND.`
          : `🎬 ${oscarNominations} IND. AO OSCAR`}
      </span>
    ) : null;

  const directorRoleBadge = null;

  const handleMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      const maxAngle = unlocks.immortalUnlocked ? 9 : 7;
      const rx = ((50 - yPct) / 50) * maxAngle;
      const ry = ((xPct - 50) / 50) * maxAngle;
      setPointer({ x: xPct, y: yPct, rx, ry, active: true });
    },
    [unlocks.immortalUnlocked]
  );

  const handleMouseLeave = useCallback(() => {
    setPointer({ x: 50, y: 35, rx: 0, ry: 0, active: false });
  }, []);

  // =========================================================================
  // ESTADO 1 (0% e 1%–14%): BLOQUEADA IGUAL ÁLBUM
  // =========================================================================
  if (!isUnlocked) {
    const missingTo15 =
      star.nextMilestone?.remainingFilms ||
      Math.max(1, Math.round(((unlockFloor - effectivePct) / 100) * (star.ceiling || 6)));
    return (
      <button
        type="button"
        onClick={() => onSelect?.(star)}
        className={`group relative aspect-[3/4] rounded-2xl border-2 border-dashed border-zinc-700/80 bg-zinc-900/55 hover:bg-zinc-900/85 hover:border-zinc-500 ${
          hasSideRails ? 'px-4 py-3' : 'p-3'
        } flex flex-col justify-between text-center transition-all cursor-pointer`}
      >
        {isDirectorCard && <Director35mmRails variant="locked" compact />}
        {isDubladorCard && <DubladorSoundwaveRails variant="locked" compact />}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-black">
              {numLabel}
            </span>
            {flagBadge}
            {kindBadge}
            <RankBadge
              rank={rpgRank}
              isRisingStar={isDirectorCard && isNewEraVisionary}
              prefixRankWord={isDirectorCard && isNewEraVisionary}
              tooltipPlacement="down"
            />
          </div>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950/90 border border-zinc-800 text-zinc-400 font-bold ml-auto">
            <Lock className="w-2.5 h-2.5" /> {effectivePct}%
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 my-auto">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-700 bg-zinc-950/85 flex items-center justify-center text-2xl opacity-45 group-hover:opacity-80 transition-opacity">
            {star.icon}
          </div>
          <div className="w-full px-1">
            <p
              className={`${
                isLongName ? 'text-[11px]' : 'text-xs'
              } font-black text-zinc-200 group-hover:text-white leading-tight break-words`}
              title={star.name}
            >
              {star.name}
            </p>
            {rpgClassLabel && (
              <p className="text-[9.5px] text-amber-300/80 font-semibold leading-tight break-words mt-0.5">
                {rpgClassLabel}
              </p>
            )}
            {(oscarBadge || directorRoleBadge) && (
              <div className="mt-1 flex flex-col items-center gap-1">
                {oscarBadge}
                {directorRoleBadge}
              </div>
            )}
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/70 transition-all"
                style={{ width: `${Math.min(100, Math.round((effectivePct / unlockFloor) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 font-mono mt-1 flex items-center justify-center gap-1.5">
              <span>{filmCountLabel} ({effectivePct}%)</span>
              {hasAvgRating && <span className="text-amber-300">★{star.avgUserRating.toFixed(1)}</span>}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
              Falta{missingTo15 === 1 ? '' : 'm'}{' '}
              <strong className="text-amber-400">{missingTo15}</strong> p/ {unlockFloor}% +{' '}
              {isDirectorCard
                ? isNewEraVisionary
                  ? 'Liberar Figurinha'
                  : 'Take 1'
                : 'Frase'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-amber-300 transition-colors">
          Figurinha Bloqueada • Ver Dossiê →
        </span>
      </button>
    );
  }

  // =========================================================================
  // ESTADO 2 (≥ 15%, AINDA NÃO COLADA NO ÁLBUM)
  // =========================================================================
  if (!isStuck) {
    return (
      <div className="relative aspect-[3/4] sticker-flip-scene">
        <div className={`sticker-flip-inner ${isFlipped && isGroupSelectable ? 'is-flipped' : ''}`}>
          <div
            onClick={() => onSelect?.(star)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect?.(star)}
            className={`sticker-card-face sticker-card-face-front group rounded-2xl border-2 border-dashed border-amber-400/75 bg-gradient-to-b from-amber-500/10 via-zinc-900/90 to-zinc-950 ${
              hasSideRails ? 'px-4 py-3' : 'p-3'
            } flex flex-col justify-between text-center cursor-pointer shadow-[0_0_24px_rgba(245,158,11,0.16)] hover:border-amber-300 transition-all`}
          >
            {isDirectorCard && <Director35mmRails variant="unlocked_dashed" compact />}
            {isDubladorCard && (
              <>
                <DubladorSoundwaveRails variant="unlocked_dashed" compact />
                <DubladorMusicalNotesOverlay accentHex="#fbbf24" subtle />
              </>
            )}
            <div className="flex flex-wrap items-start justify-between gap-1 text-[10px] font-mono">
              <div className="flex items-center gap-1 shrink-0">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black">
                  {numLabel}
                </span>
                {flagBadge}
                {kindBadge}
                <RankBadge
                  rank={rpgRank}
                  isRisingStar={isDirectorCard && isNewEraVisionary}
                  prefixRankWord={isDirectorCard && isNewEraVisionary}
                  tooltipPlacement="down"
                />
              </div>
              <div className="flex items-center justify-end gap-1 ml-auto shrink-0">
                {isGroupSelectable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMouseLeave();
                      setIsFlipped(true);
                    }}
                    title="Virar carta para escolher o protagonista"
                    className="p-1 rounded bg-zinc-900/90 border border-amber-400/40 text-amber-300 hover:text-white cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                  </button>
                )}
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold animate-pulse">
                  LIBERADA!
                </span>
              </div>
            </div>

            <div className="relative my-auto flex flex-col items-center gap-1.5 w-full">
              <div
                className="relative w-16 h-20 sm:w-[74px] sm:h-[88px] rounded-xl overflow-hidden p-[2px] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform"
                style={{ background: visualTheme.frameBackground }}
              >
                <div className="w-full h-full rounded-[10px] overflow-hidden bg-zinc-900">
                  {displayPhotoUrl ? (
                    <img src={displayPhotoUrl} alt={star.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">{star.icon}</div>
                  )}
                </div>
              </div>
              <div className="w-full px-1">
                <p
                  className={`${
                    isLongName ? 'text-[11px]' : 'text-xs'
                  } font-black text-white leading-tight break-words`}
                  title={star.name}
                >
                  {star.name}
                </p>
                <p className="text-[9.5px] text-amber-300/95 font-semibold leading-tight break-words mt-0.5">
                  {rpgClassLabel}
                </p>
                {(oscarBadge || directorRoleBadge) && (
                  <div className="mt-1 flex flex-col items-center gap-1">
                    {oscarBadge}
                    {directorRoleBadge}
                  </div>
                )}
                <p className="text-[10px] font-mono font-bold mt-0.5 flex items-center justify-center gap-1.5" style={{ color: visualTheme.accentHex }}>
                  <span>{filmCountLabel} • {effectivePct}%</span>
                  {hasAvgRating && <span className="text-amber-300">★{star.avgUserRating.toFixed(1)}</span>}
                </p>
                {extraStars > 0 && (
                  <p className="text-[10px] font-black text-yellow-300 mt-0.5">
                    {'★'.repeat(Math.min(5, extraStars))} (+{extraStars} bônus)
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStick?.(star.id);
              }}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Colar Figurinha!</span>
            </button>
          </div>

          {isGroupSelectable && (
            <div className="sticker-card-face sticker-card-face-back">
              <GroupProtagonistBackFace
                star={star}
                members={groupMembers}
                selectedName={star.featuredMemberName}
                onPick={(memberName) => {
                  onSelectProtagonist?.(star.id, memberName);
                  setIsFlipped(false);
                }}
                onCloseFlip={() => setIsFlipped(false)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ESTADO 3: FIGURINHA COLADA (MOLDURA HOLOGRÁFICA + ASSINATURA + TIMELINE 75%+)
  // =========================================================================
  const pasteClass = justStuck ? 'sticker-peel-unroll' : '';

  return (
    <div className="relative aspect-[3/4]">
      {/* Camada de baixo: figurinha antiga aparecendo levemente por baixo ("colada por cima") */}
      {underlayTheme && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500 ${
            hasSideRails ? 'px-[11px] py-[5px]' : 'p-[5px]'
          }`}
          style={{
            background: underlayTheme.frameBackground,
            transform: 'translate(-4px, 4px) rotate(-3deg) scale(0.985)',
            opacity: 0.9,
            boxShadow: '0 8px 18px rgba(0,0,0,0.65)',
          }}
        >
          <div className="w-full h-full rounded-[11px] bg-zinc-950/90 border border-white/15" />
        </div>
      )}

      {/* Selo de borda ao finalizar a rolagem adesiva */}
      {justStuck && (
        <div
          className="absolute -inset-1.5 rounded-3xl border-2 pointer-events-none z-20 sticker-paste-ring"
          style={{ borderColor: visualTheme.accentHex }}
        />
      )}

      {/* Camada de animação de colagem + Tilt 3D + Flip 3D (Conjuntos) */}
      <div className={`relative w-full h-full z-10 ${pasteClass}`}>
        <div
          onMouseMove={!isFlipped ? handleMouseMove : undefined}
          onMouseLeave={!isFlipped ? handleMouseLeave : undefined}
          className="w-full h-full transition-transform duration-200 sticker-flip-scene"
          style={{
            transform:
              isFlipped
                ? 'none'
                : pointer.active
                ? `perspective(750px) rotateX(${pointer.rx.toFixed(2)}deg) rotateY(${pointer.ry.toFixed(2)}deg) scale(1.04)`
                : `rotate(${subtleTilt}deg)`,
          }}
        >
          <div className={`sticker-flip-inner ${isFlipped && isGroupSelectable ? 'is-flipped' : ''}`}>
            <div
              onClick={() => onSelect?.(star)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect?.(star)}
              className={`sticker-card-face sticker-card-face-front group relative w-full h-full rounded-2xl cursor-pointer sticker-holo-border ${
                hasSideRails ? 'px-[12px] py-[6px]' : 'p-[6px]'
              } ${justStuck ? 'ring-4 ring-amber-300/80' : ''}`}
              style={{
                background: activeFrameBackground,
                boxShadow: activeBoxShadow,
              }}
            >
            {isDirectorCard && (
              <Director35mmRails
                variant={visualTheme.film35mmStyle || 'classic'}
                trackBg={visualTheme.filmTrackBg || 'rgba(9, 9, 11, 0.78)'}
                holeColor={visualTheme.filmHoleColor || 'rgba(255, 255, 255, 0.42)'}
              />
            )}
            {isDubladorCard && (
              <DubladorSoundwaveRails
                variant="studio"
                accentHex={visualTheme.accentHex || '#f59e0b'}
              />
            )}
            <div
              className="relative w-full h-full rounded-[10px] overflow-hidden bg-zinc-950 flex flex-col border"
              style={{
                borderColor:
                  unlocks.immortalUnlocked && !useCustomShowcaseFrame
                    ? `${auraPreset.accent}aa`
                    : visualTheme.innerTrimColor,
              }}
            >
              {displayPhotoUrl ? (
                <img
                  src={displayPhotoUrl}
                  alt={star.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-5xl">
                  {star.icon}
                </div>
              )}

              <FoilEffectOverlays effectId={visualTheme.metallicType} pointer={pointer} />

              {isDubladorCard && (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-28 pointer-events-none opacity-35"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(251,191,36,0.22) 0px, rgba(251,191,36,0.22) 2px, transparent 2px, transparent 7px)',
                      maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                      WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                    }}
                  />
                  <DubladorMusicalNotesOverlay
                    accentHex={
                      unlocks.immortalUnlocked && !useCustomShowcaseFrame
                        ? auraPreset.accent
                        : visualTheme.accentHex || '#fbbf24'
                    }
                  />
                </>
              )}

              {/* Barra de alisamento do Rolo Adesivo */}
              {justStuck && (
                <div
                  className="absolute left-0 right-0 h-14 pointer-events-none z-20 sticker-peel-unroll-wiper"
                  style={{
                    background:
                      'linear-gradient(0deg, transparent, rgba(255,255,255,0.92) 48%, rgba(186,230,253,0.62) 62%, transparent)',
                  }}
                />
              )}

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/95 via-black/25 to-black/35" />

              {/* Topo: Número + Homenagem + Bônus ★ + Linha do Tempo / Ações */}
              <div className="absolute top-2 left-2 right-2 flex flex-wrap items-start justify-between gap-1 z-10">
                <div className="flex items-center gap-1 shrink-0">
                  {demoBadge ? (
                    <span
                      className="px-1.5 py-0.5 rounded font-mono text-[8.5px] leading-none font-black uppercase tracking-wider border shadow truncate max-w-[100px]"
                      style={visualTheme.badgeStyle}
                    >
                      {demoBadge}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-black/80 border border-white/25 font-mono text-[9.5px] leading-none font-black text-amber-300">
                      {numLabel}
                    </span>
                  )}
                  {flagBadge}
                  {kindBadge}
                  {star.isDeceased && (
                    <span
                      className="px-1 py-0.5 rounded bg-zinc-950/85 border border-amber-400/40 text-[9px] leading-none shrink-0"
                      title="Em Memória"
                    >
                      🕊️
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-[80px] flex flex-wrap items-center justify-end gap-1 ml-auto">
                  {underlayTheme && (
                    <span
                      className="px-1 py-0.5 rounded bg-zinc-950/90 border border-white/25 text-zinc-200 font-bold text-[8.5px] leading-none flex items-center gap-0.5 shadow"
                      title="Figurinha atualizada por cima"
                    >
                      <Layers className="w-2.5 h-2.5 text-amber-300" />
                    </span>
                  )}
                  {extraStars > 0 && (
                    <span
                      className={`px-1 py-0.5 rounded font-black text-[8.5px] leading-none flex items-center gap-0.5 shadow ${
                        unlocks.immortalUnlocked
                          ? 'bg-gradient-to-r from-yellow-300 via-amber-300 to-sky-300 text-zinc-950 ring-1 ring-white/70'
                          : 'bg-yellow-400/95 text-zinc-950'
                      }`}
                      title={`${extraStars} estrela(s) bônus (+1 ★ a cada 2 filmes após ${star.ceiling})`}
                    >
                      <Star className="w-2.5 h-2.5 fill-zinc-950" />
                      <span>{extraStars}</span>
                    </span>
                  )}
                  {isGroupSelectable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMouseLeave();
                        setIsFlipped(true);
                      }}
                      title="Virar carta para escolher o protagonista"
                      className="px-1 py-0.5 rounded bg-zinc-900/90 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 border border-amber-400/45 font-black text-[8.5px] leading-none flex items-center gap-0.5 shadow cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {isDirectorCard && unlocks.timelineUnlocked && onSelect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(star);
                      }}
                      title="Ver Manias & DNA Autoral de Set (Take 3 • 60%+)"
                      className="px-1 py-0.5 rounded bg-cyan-400/95 hover:bg-cyan-300 text-zinc-950 font-black text-[8.5px] leading-none flex items-center gap-0.5 shadow cursor-pointer transition-transform active:scale-95"
                    >
                      <span>🎯</span>
                      <span>Marca</span>
                    </button>
                  )}
                  {isDirectorCard &&
                    (unlocks.verdictUnlocked ?? (!isNewEraVisionary && unlocks.immortalUnlocked)) &&
                    onOpenDirectorVerdict && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDirectorVerdict(star);
                      }}
                      title={
                        isNewEraVisionary
                          ? 'Abrir Show de Cartazes: Cartas Viradas, Oscar & Framboesa de Ouro (80%+)'
                          : 'Abrir Show de Cartazes: Cartas Viradas, Oscar & Framboesa de Ouro (Take 5 • 90%+)'
                      }
                      className="px-1 py-0.5 rounded bg-gradient-to-r from-amber-400 to-rose-400 hover:brightness-110 text-zinc-950 font-black text-[8.5px] leading-none flex items-center gap-0.5 shadow cursor-pointer transition-transform active:scale-95"
                    >
                      <span>🃏</span>
                      <span>Júri</span>
                    </button>
                  )}
                  {!isDirectorCard && unlocks.timelineUnlocked && onOpenTimeline && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTimeline(star);
                      }}
                      title="Abrir Linha do Tempo Cinemática (75%+)"
                      className="px-1 py-0.5 rounded bg-sky-400/95 hover:bg-sky-300 text-zinc-950 font-black text-[8.5px] leading-none flex items-center gap-0.5 shadow cursor-pointer transition-transform active:scale-95"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>Linha</span>
                    </button>
                  )}
                  {isDubladorCard && unlocks.voiceClipsUnlocked && onSelect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(star);
                      }}
                      title="Vozes Marcantes liberadas (60%+) — Abrir Mesa de Som"
                      className="px-1 py-0.5 rounded bg-amber-400/95 hover:bg-amber-300 text-zinc-950 font-black text-[8.5px] leading-none flex items-center gap-0.5 shadow cursor-pointer transition-transform active:scale-95"
                    >
                      <span>🎙️</span>
                      <span>Voz</span>
                    </button>
                  )}
                  {onUnstick && !hasPendingOverlayUpgrade && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnstick(star.id);
                      }}
                      title="Descolar figurinha"
                      className="px-1 py-0.5 rounded bg-emerald-500/90 hover:bg-zinc-900/90 text-zinc-950 hover:text-zinc-200 font-black text-[8.5px] leading-none uppercase flex items-center gap-0.5 shadow cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Placa Inferior: Autógrafo (somente Atores/Vozes/Casais) OU Selo Corte Final (Diretores) */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10 flex flex-col gap-1">
                {!isDirectorCard && unlocks.immortalUnlocked && signatureMode !== 'hidden' && (
                  <div
                    key={signatureMode === 'writing' ? 'sig-writing' : 'sig-normal'}
                    className="pointer-events-none flex justify-end mb-0.5"
                  >
                    <div
                      className="relative inline-block max-w-full text-right select-none -rotate-3"
                      style={{
                        textShadow: `0 0 12px ${auraPreset.accent}, 0 2px 6px rgba(0,0,0,0.98)`,
                      }}
                    >
                      <span
                        className={`${
                          isLongName ? 'text-xs sm:text-[13px]' : 'text-base sm:text-[17px]'
                        } italic font-semibold tracking-wide block leading-none pr-1 truncate ${
                          signatureMode === 'writing' ? 'autograph-write-text' : ''
                        }`}
                        style={{
                          fontFamily: "'Brush Script MT', 'Segoe Script', 'Snell Roundhand', Georgia, serif",
                          color: '#fef08a',
                        }}
                      >
                        {star.name}
                      </span>
                      {signatureMode === 'writing' && (
                        <span
                          aria-hidden="true"
                          className="autograph-write-nib absolute w-2.5 h-2.5 rounded-full pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle, #ffffff 10%, #fde047 65%, transparent 100%)',
                            boxShadow: `0 0 10px 3px #fde047, 0 0 16px ${auraPreset.accent}`,
                          }}
                        />
                      )}
                      <svg viewBox="0 0 120 10" className="w-24 h-2 ml-auto opacity-95">
                        <path
                          d="M4 7 Q 55 1, 116 5"
                          fill="none"
                          stroke={auraPreset.accent}
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          className={signatureMode === 'writing' ? 'autograph-write-line' : ''}
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {hasPendingOverlayUpgrade && upgradeTargetTheme && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStick?.(star.id);
                    }}
                    className="mb-1 w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:brightness-110 text-zinc-950 font-black text-[10px] shadow-lg flex items-center justify-center gap-1 animate-pulse cursor-pointer"
                  >
                    <Layers className="w-3 h-3 shrink-0" />
                    <span className="truncate">Colar nova edição por cima!</span>
                  </button>
                )}

                {signatureFilm && (
                  <div
                    className="px-2 py-0.5 rounded-md bg-black/85 border text-[9px] font-bold text-amber-200 flex items-center justify-between gap-1 truncate shadow"
                    style={{
                      borderColor: `${
                        unlocks.immortalUnlocked && !useCustomShowcaseFrame
                          ? auraPreset.accent
                          : visualTheme.accentHex
                      }88`,
                    }}
                    title={`Obra-Prima Favorita: ${signatureFilm.title}`}
                  >
                    <span className="truncate">🏆 {signatureFilm.title}</span>
                    {typeof signatureFilm.userRating === 'number' && (
                      <span className="font-mono font-black text-amber-300 shrink-0">
                        ★{signatureFilm.userRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <RankBadge
                      rank={rpgRank}
                      isRisingStar={isDirectorCard && isNewEraVisionary}
                      prefixRankWord
                      tooltipPlacement="up"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasAvgRating && (
                      <span
                        className="px-1.5 py-0.5 rounded bg-black/75 border border-amber-400/40 font-mono text-[9px] font-black text-amber-300"
                        title="Sua nota média nesta estrela"
                      >
                        ★{star.avgUserRating.toFixed(1)}
                      </span>
                    )}
                    <span
                      className="font-mono text-xs font-black shrink-0 drop-shadow"
                      style={{
                        color:
                          unlocks.immortalUnlocked && !useCustomShowcaseFrame
                            ? auraPreset.accent
                            : visualTheme.accentHex,
                      }}
                    >
                      {effectivePct}%
                    </span>
                  </div>
                </div>

                <h3
                  className={`${
                    isLongName ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                  } font-black text-white leading-tight break-words drop-shadow`}
                  title={star.name}
                >
                  {star.name}
                </h3>

                {(oscarBadge || directorRoleBadge) && (
                  <div className="flex flex-col items-start gap-1">
                    {oscarBadge}
                    {directorRoleBadge}
                  </div>
                )}

                <div className="flex items-end justify-between gap-1.5 text-[9.5px] leading-[1.15] text-zinc-300/90">
                  <span className="font-sans font-semibold text-amber-200/95 break-words min-w-0">
                    {rpgClassLabel}
                  </span>
                  {!demoBadge && (
                    <span className="font-mono font-semibold shrink-0 whitespace-nowrap">
                      {filmCountLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
            </div>

            {isGroupSelectable && (
              <div className="sticker-card-face sticker-card-face-back">
                <GroupProtagonistBackFace
                  star={star}
                  members={groupMembers}
                  selectedName={star.featuredMemberName}
                  onPick={(memberName) => {
                    onSelectProtagonist?.(star.id, memberName);
                    setIsFlipped(false);
                  }}
                  onCloseFlip={() => setIsFlipped(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default WalkOfFameStickerCard;
