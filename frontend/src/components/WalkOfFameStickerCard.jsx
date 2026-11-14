import React, { useState, useCallback } from 'react';
import { Lock, Sparkles, CheckCircle2, Star, Layers, Clock, RefreshCw, Users } from 'lucide-react';
import {
  getThemeForTier,
  IMMORTAL_AURA_PRESETS,
  resolveEffectiveImmortalAura,
  resolveWalkMediaUrl,
  resolveWalkRpgRank,
} from '../utils/walkOfFameStickers';

function getRankBadgeClass(rank) {
  switch (rank) {
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

function GroupProtagonistBackFace({ star, members, selectedName, onPick, onCloseFlip }) {
  const useCompactGrid = members.length >= 5;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full h-full rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-400/65 p-2.5 flex flex-col justify-between shadow-[0_14px_38px_rgba(0,0,0,0.85)]"
    >
      <div className="flex items-center justify-between gap-1.5 border-b border-zinc-800 pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Users className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 truncate">
            Protagonista
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

export default function WalkOfFameStickerCard({
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
  onSelectProtagonist,
}) {
  const [pointer, setPointer] = useState({ x: 50, y: 35, rx: 0, ry: 0, active: false });
  const [isFlipped, setIsFlipped] = useState(false);

  const effectivePct = overridePct !== null ? overridePct : Number(star.percentage || 0);
  const unlocks = star.unlocks || {
    quoteUnlocked: effectivePct >= 15,
    curiosity1Unlocked: effectivePct >= 30,
    skinsUnlocked: effectivePct >= 45,
    curiosities23Unlocked: effectivePct >= 60,
    timelineUnlocked: effectivePct >= 75,
    immortalUnlocked: effectivePct >= 90,
  };

  const isUnlocked = Boolean(
    star.isStickerUnlocked || effectivePct >= 15 || forceUnlocked || overrideTierKey
  );
  const hasPendingOverlayUpgrade = Boolean(
    !overrideTierKey && isStuck && star.hasRarityUpgradeToStick && star.stuckTier
  );
  const displayedTierKey = overrideTierKey
    ? overrideTierKey
    : hasPendingOverlayUpgrade
    ? star.stuckTier
    : (isStuck && star.stuckTier) || star.statusTierKey || 'bronze';

  const upgradeTargetTheme = hasPendingOverlayUpgrade
    ? getThemeForTier(star.statusTierKey)
    : null;
  const underlayTierKey =
    overrideUnderlayTierKey || (!hasPendingOverlayUpgrade ? star.previousStuckTier : null);
  const underlayTheme = underlayTierKey ? getThemeForTier(underlayTierKey) : null;

  const visualTheme = getThemeForTier(displayedTierKey);
  const extraStars = overrideExtraStars !== null ? overrideExtraStars : Number(star.extraStars || 0);
  const numLabel = `#${String(star.albumNumber).padStart(3, '0')}`;
  const subtleTilt = demoBadge || justStuck ? 0 : star.albumNumber % 2 === 0 ? 0.7 : -0.7;

  const auraPreset = unlocks.immortalUnlocked
    ? resolveEffectiveImmortalAura(star.immortalAura || 'prism', extraStars)
    : IMMORTAL_AURA_PRESETS.prism;
  const activeFrameBackground = unlocks.immortalUnlocked
    ? auraPreset.frameBg
    : visualTheme.frameBackground;
  const activeBoxShadow = unlocks.immortalUnlocked ? auraPreset.shadow : visualTheme.boxShadow;
  const signatureFilm = unlocks.immortalUnlocked ? star.signatureFilm : null;

  const displayPhotoUrl = resolveWalkMediaUrl(
    unlocks.skinsUnlocked && star.activePhotoUrl ? star.activePhotoUrl : star.photoUrl
  );
  const rpgRank = star.rpgRank || resolveWalkRpgRank(effectivePct, extraStars);
  const rpgClassLabel = star.rpgClassLabel || star.rpgTitle || star.tagline;
  const groupMembers = Array.isArray(star.groupMembers) ? star.groupMembers : [];
  const isGroupSelectable = Boolean(
    star.kind === 'group' && isUnlocked && groupMembers.length > 1 && onSelectProtagonist && !demoBadge
  );
  const hasAvgRating = typeof star.avgUserRating === 'number';
  const filmCountLabel = `${star.watchedCount} ${star.watchedCount === 1 ? 'filme' : 'filmes'}`;
  const isLongName = String(star.name || '').length > 22;
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
    const missingTo15 = star.nextMilestone?.remainingFilms || 3;
    return (
      <button
        type="button"
        onClick={() => onSelect?.(star)}
        className="group relative aspect-[3/4] rounded-2xl border-2 border-dashed border-zinc-700/80 bg-zinc-900/55 hover:bg-zinc-900/85 hover:border-zinc-500 p-3 flex flex-col justify-between text-center transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-black">
              {numLabel}
            </span>
            <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black ${getRankBadgeClass(rpgRank)}`}>
              {rpgRank}
            </span>
          </div>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950/90 border border-zinc-800 text-zinc-400 font-bold">
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
              <p className="text-[9px] text-amber-300/75 font-semibold truncate mt-0.5">
                {rpgClassLabel}
              </p>
            )}
            {oscarBadge && <div className="mt-1 flex justify-center">{oscarBadge}</div>}
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/70 transition-all"
                style={{ width: `${Math.min(100, Math.round((effectivePct / 15) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 font-mono mt-1 flex items-center justify-center gap-1.5">
              <span>{filmCountLabel} ({effectivePct}%)</span>
              {hasAvgRating && <span className="text-amber-300">★{star.avgUserRating.toFixed(1)}</span>}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
              Falta{missingTo15 === 1 ? '' : 'm'}{' '}
              <strong className="text-amber-400">{missingTo15}</strong> p/ 15% + Frase
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
            className="sticker-card-face sticker-card-face-front group rounded-2xl border-2 border-dashed border-amber-400/75 bg-gradient-to-b from-amber-500/10 via-zinc-900/90 to-zinc-950 p-3 flex flex-col justify-between text-center cursor-pointer shadow-[0_0_24px_rgba(245,158,11,0.16)] hover:border-amber-300 transition-all"
          >
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black">
                  {numLabel}
                </span>
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black ${getRankBadgeClass(rpgRank)}`}>
                  {rpgRank}
                </span>
              </div>
              <div className="flex items-center gap-1">
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
                <p className="text-[10px] text-amber-300/90 font-semibold truncate mt-0.5">
                  {rpgClassLabel}
                </p>
                {oscarBadge && <div className="mt-1 flex justify-center">{oscarBadge}</div>}
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
          className="absolute inset-0 rounded-2xl p-[5px] pointer-events-none transition-all duration-500"
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
              className={`sticker-card-face sticker-card-face-front group w-full h-full rounded-2xl cursor-pointer sticker-holo-border p-[6px] ${
                justStuck ? 'ring-4 ring-amber-300/80' : ''
              }`}
              style={{
                background: activeFrameBackground,
                boxShadow: activeBoxShadow,
              }}
            >
            <div
              className="relative w-full h-full rounded-[11px] overflow-hidden bg-zinc-950 flex flex-col border"
              style={{
                borderColor: unlocks.immortalUnlocked
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

              {/* Topo: Número + Homenagem + Bônus ★ + Linha do Tempo (75%+) */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                <div className="flex items-center gap-1 min-w-0">
                  {demoBadge ? (
                    <span
                      className="px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-wider border shadow truncate max-w-[105px]"
                      style={visualTheme.badgeStyle}
                    >
                      {demoBadge}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-black/80 border border-white/25 font-mono text-[10px] font-black text-amber-300">
                      {numLabel}
                    </span>
                  )}
                  {star.isDeceased && (
                    <span
                      className="px-1 py-0.5 rounded bg-zinc-950/85 border border-amber-400/40 text-[9px]"
                      title="Em Memória"
                    >
                      🕊️
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {underlayTheme && (
                    <span
                      className="px-1 py-0.5 rounded bg-zinc-950/90 border border-white/25 text-zinc-200 font-bold text-[9px] flex items-center gap-0.5 shadow"
                      title="Figurinha atualizada por cima"
                    >
                      <Layers className="w-2.5 h-2.5 text-amber-300" />
                    </span>
                  )}
                  {extraStars > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded font-black text-[9px] flex items-center gap-0.5 shadow ${
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
                      className="px-1.5 py-0.5 rounded bg-zinc-900/90 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 border border-amber-400/45 font-black text-[9px] flex items-center gap-0.5 shadow cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {unlocks.timelineUnlocked && onOpenTimeline && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTimeline(star);
                      }}
                      title="Abrir Linha do Tempo Cinemática (75%+)"
                      className="px-1.5 py-0.5 rounded bg-sky-400/95 hover:bg-sky-300 text-zinc-950 font-black text-[9px] flex items-center gap-0.5 shadow cursor-pointer transition-transform active:scale-95"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>Linha</span>
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
                      className="px-1.5 py-0.5 rounded bg-emerald-500/90 hover:bg-zinc-900/90 text-zinc-950 hover:text-zinc-200 font-black text-[9px] uppercase flex items-center gap-0.5 shadow cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Placa Inferior: Autógrafo (SEMPRE acima do Selo de Obra-Prima!) + Nome + Marco */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10 flex flex-col gap-1">
                {unlocks.immortalUnlocked && signatureMode !== 'hidden' && (
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
                    style={{ borderColor: `${auraPreset.accent}88` }}
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
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getRankBadgeClass(rpgRank)}`}>
                    RANK {rpgRank}
                  </span>
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
                      style={{ color: unlocks.immortalUnlocked ? auraPreset.accent : visualTheme.accentHex }}
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

                {oscarBadge && <div className="flex items-center">{oscarBadge}</div>}

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300/90">
                  <span className="truncate text-amber-200/90">{rpgClassLabel}</span>
                  {!demoBadge && (
                    <span className="shrink-0 ml-1">
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
}
