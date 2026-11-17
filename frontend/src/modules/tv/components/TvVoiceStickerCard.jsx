import React, { useState, useCallback, memo, useMemo } from 'react';
import {
  Lock,
  Sparkles,
  Star,
  Layers,
  Film,
  Tv,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import {
  VOICE_RANK_META,
  formatVoiceStars,
  getAffinityTag,
  getThemeForVoiceTier,
  resolveEffectiveVoiceAura,
  resolveVoiceUnlocksForPct,
} from '../utils/tvVoiceStickers';
import { resolveTvPosterUrl } from '../utils/tvApi';

const KI_SPARKS = [
  { left: '12%', size: 4, delay: '0s', dur: '2.4s' },
  { left: '28%', size: 5, delay: '0.7s', dur: '2.9s' },
  { left: '46%', size: 3.5, delay: '1.3s', dur: '2.5s' },
  { left: '66%', size: 5, delay: '0.4s', dur: '3.0s' },
  { left: '84%', size: 4, delay: '1.1s', dur: '2.7s' },
];

const ANIME_PETALS = [
  { sym: '🌸', left: '12%', bottom: '22%', delay: '0s', dur: '3.8s' },
  { sym: '✦', left: '48%', bottom: '30%', delay: '1.1s', dur: '3.2s' },
  { sym: '🌸', left: '82%', bottom: '24%', delay: '0.6s', dur: '4.0s' },
];

function AnimeFloatingPetals({ accentHex = '#f472b6', subtle = false }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-[6]"
      style={{ opacity: subtle ? 0.35 : 0.72 }}
    >
      {ANIME_PETALS.map((n, idx) => (
        <span
          key={idx}
          className="absolute font-black select-none"
          style={{
            left: n.left,
            bottom: n.bottom,
            fontSize: subtle ? '9px' : '11px',
            color: accentHex,
            textShadow: `0 0 8px ${accentHex}`,
            animation: `animeSoundNoteFloat ${n.dur} ease-in-out ${n.delay} infinite`,
          }}
        >
          {n.sym}
        </span>
      ))}
    </div>
  );
}

function AnimeFoilOverlays({ effectId, pointer }) {
  if (!effectId || effectId === 'matte') return null;
  const glowPos = `${pointer.x.toFixed(1)}% ${pointer.y.toFixed(1)}%`;

  return (
    <>
      {effectId === 'shinobi_bronze' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-soft-light"
          style={{
            background:
              'linear-gradient(135deg, rgba(251,191,36,0.35), transparent 55%, rgba(217,119,6,0.45))',
          }}
        />
      )}

      {effectId === 'zanpakuto_silver' && (
        <div
          className="absolute -inset-y-10 w-16 pointer-events-none anime-card-sheen-sweep"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(224,242,254,0.75), rgba(255,255,255,0.4), transparent)',
          }}
        />
      )}

      {effectId === 'alchemical_emerald' && (
        <>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25 mix-blend-screen">
            <div className="w-40 h-40 rounded-full border border-dashed border-emerald-300/70 anime-alchemy-spin-rev flex items-center justify-center">
              <div className="w-28 h-28 rotate-45 border border-cyan-300/60" />
            </div>
          </div>
          <div
            className="absolute inset-0 pointer-events-none opacity-35"
            style={{
              background: `radial-gradient(circle 140px at ${glowPos}, rgba(52,211,153,0.45), transparent 70%)`,
            }}
          />
        </>
      )}

      {effectId === 'cyber_akihabara' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(192,132,252,0.25) 0px 1px, transparent 1px 4px)',
            }}
          />
          <div
            className="absolute left-0 right-0 h-8 pointer-events-none anime-scan-down"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.3) 35%, rgba(236,72,153,0.85) 52%, rgba(34,211,238,0.5) 70%, transparent 100%)',
            }}
          />
        </>
      )}

      {effectId === 'saiyan_gold_24k' && (
        <>
          <div
            className="absolute -inset-y-10 w-20 pointer-events-none anime-card-sheen-sweep"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(254,240,138,0.85), rgba(250,204,21,0.5), transparent)',
            }}
          />
          {KI_SPARKS.map((sp, i) => (
            <span
              key={i}
              className="absolute bottom-4 rounded-full pointer-events-none"
              style={{
                left: sp.left,
                width: `${sp.size}px`,
                height: `${sp.size}px`,
                backgroundColor: '#fef08a',
                boxShadow: '0 0 10px 2px rgba(250,204,21,0.85)',
                animation: `animeKiFloatUp ${sp.dur} ease-out ${sp.delay} infinite`,
              }}
            />
          ))}
        </>
      )}

      {effectId === 'bankai_prism' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-color-dodge anime-conic-spin"
            style={{
              background:
                'conic-gradient(from 0deg, #f43f5e, #fb7185, #fef08a, #a855f7, #38bdf8, #f43f5e)',
            }}
          />
          {KI_SPARKS.map((sp, i) => (
            <span
              key={i}
              className="absolute bottom-4 rounded-full pointer-events-none"
              style={{
                left: sp.left,
                width: `${sp.size}px`,
                height: `${sp.size}px`,
                backgroundColor: i % 2 === 0 ? '#fda4af' : '#fef08a',
                boxShadow: '0 0 10px 2px rgba(244,63,94,0.85)',
                animation: `animeKiFloatUp ${sp.dur} ease-out ${sp.delay} infinite`,
              }}
            />
          ))}
        </>
      )}

      {/* Reflexo especular do cursor */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle 140px at ${glowPos}, rgba(255,255,255,0.75), rgba(255,255,255,0.16) 48%, transparent 74%)`,
        }}
      />
    </>
  );
}

function RankBadge({ rank, prefix = false }) {
  const meta = VOICE_RANK_META[rank] || VOICE_RANK_META.E;
  return (
    <span
      className={`px-1.5 py-0.5 rounded border text-[9px] font-black leading-none ${
        prefix ? 'uppercase tracking-wider ' : ''
      }${meta.badgeClass}`}
    >
      {prefix ? `RANK ${meta.rank}` : meta.rank}
    </span>
  );
}

const TvVoiceStickerCard = memo(function TvVoiceStickerCard({
  voice,
  justStuck = false,
  signatureMode = 'normal',
  activeVisualTheme = 'prism_gacha', // 'prism_gacha' | 'shonen_manga' | 'cyber_mecha' | 'dark_grimoire'
  flipped = null,
  swapArt = null,
  onSelect,
  onStick,
  onOpenPack,
}) {
  const [pointer, setPointer] = useState({ x: 50, y: 50, rx: 0, ry: 0, active: false });
  const [localFlipped, setLocalFlipped] = useState(false);
  const [localSwapFocus, setLocalSwapFocus] = useState(false);

  const isFlipped = flipped !== null ? flipped : localFlipped;
  const isSwapped = swapArt !== null ? swapArt : localSwapFocus;

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const rx = ((py - 50) / 50) * -9;
    const ry = ((px - 50) / 50) * 10;
    setPointer({ x: px, y: py, rx, ry, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPointer({ x: 50, y: 50, rx: 0, ry: 0, active: false });
  }, []);

  const numLabel = `#${String(voice.albumNumber || 1).padStart(3, '0')}`;
  const pct = Number(voice.percentage || 0);
  const extraStars = Number(voice.extraStars || 0);
  const isUnlocked = pct >= 15;
  const isStuck = Boolean(voice.isStuck);
  const currentTier = voice.currentTier || 'locked';
  const visualTheme = getThemeForVoiceTier(currentTier);
  const unlocks = resolveVoiceUnlocksForPct(pct);
  const auraPreset = resolveEffectiveVoiceAura(voice.immortalAura, extraStars);

  // Melhor obra e personagem para o destaque e verso
  const topCharacterWork = useMemo(() => {
    const works = voice.combinedWorks || [];
    if (voice.signatureWork) return voice.signatureWork;
    const withChar = [...works]
      .filter((w) => Boolean(w.character || w.characterName))
      .sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    return withChar[0] || works[0] || null;
  }, [voice]);

  const charImgUrl = resolveTvPosterUrl(
    topCharacterWork?.characterImageUrl ||
      topCharacterWork?.posterUrl ||
      voice.activePhotoUrl ||
      voice.photoUrl
  );
  const actorPhotoUrl = resolveTvPosterUrl(voice.activePhotoUrl || voice.photoUrl);

  // Seleção de destaque (Padrão: Personagem em tela cheia | Invertido: Dublador em tela cheia)
  const mainImageUrl = isSwapped ? actorPhotoUrl : charImgUrl || actorPhotoUrl;
  const medallionImageUrl = isSwapped ? charImgUrl || actorPhotoUrl : actorPhotoUrl;
  const characterTitle =
    topCharacterWork?.character || topCharacterWork?.characterName || 'Papel Principal';
  const showTitle = topCharacterWork?.title || voice.knownFor?.split('•')[0]?.trim() || '';

  const affinity = useMemo(
    () => getAffinityTag(voice.avgUserRating, voice.totalWorksCount),
    [voice.avgUserRating, voice.totalWorksCount]
  );

  const otherRoles = useMemo(() => {
    const works = voice.combinedWorks || [];
    return works.filter((w) => (w.character || w.characterName) && (w.character || w.characterName) !== characterTitle);
  }, [voice, characterTitle]);

  const starsInfo = useMemo(() => formatVoiceStars(extraStars), [extraStars]);

  const underlayTheme =
    isStuck && voice.previousStuckTier && voice.previousStuckTier !== currentTier
      ? getThemeForVoiceTier(voice.previousStuckTier)
      : null;

  const isLongName = String(voice.name || '').length >= 16;
  const subtleTilt = ((voice.albumNumber || 1) % 3 - 1) * 0.4;
  const hasAvgRating =
    typeof voice.avgUserRating === 'number' && Number.isFinite(voice.avgUserRating);

  const flagBadge = (
    <span className="px-1 py-0.5 rounded bg-black/75 border border-white/15 text-[9.5px] leading-none shrink-0">
      {voice.nationalityCode === 'jp' ? '🇯🇵' : '🇺🇸'}
    </span>
  );

  // =========================================================================
  // ESTADO 1 (0%–14%): SELO OFUDA LACRADO (0–2 Obras)
  // =========================================================================
  if (!isUnlocked) {
    const missing = Math.max(1, Number(voice.worksToUnlock15 || 3 - voice.totalWorksCount));
    return (
      <button
        type="button"
        onClick={() => onSelect?.(voice)}
        className="group relative aspect-[3/4] rounded-2xl border border-dashed border-zinc-700/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-3 flex flex-col justify-between text-center hover:border-pink-500/45 transition-all cursor-pointer overflow-hidden shadow-lg"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 right-5 w-7 h-24 rotate-12 bg-gradient-to-b from-pink-500/20 to-amber-500/10 border border-pink-500/25 flex items-center justify-center text-[10px] font-black text-pink-300/60"
        >
          封印
        </div>

        <div className="relative z-10 flex items-center justify-between gap-1 text-[10px] font-mono w-full">
          <div className="flex items-center gap-1 min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-black">
              {numLabel}
            </span>
            {flagBadge}
            <RankBadge rank={voice.rpgRank || 'E'} />
          </div>
          <span className="text-[9.5px] font-black text-zinc-500">{pct}%</span>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-2 w-full">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-inner">
            {actorPhotoUrl ? (
              <img
                src={actorPhotoUrl}
                alt={voice.name}
                className="w-full h-full object-cover object-top grayscale opacity-35"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">
                {voice.icon || '🎙️'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
              <Lock className="w-5 h-5 text-zinc-300" />
            </div>
          </div>

          <div className="w-full px-1 space-y-1">
            <h3 className="text-xs font-black text-zinc-200 leading-tight truncate">{voice.name}</h3>
            <p className="text-[9.5px] text-zinc-500 truncate">{voice.rpgTitle}</p>
            <div className="w-full h-1.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500/60 to-purple-500/60 rounded-full"
                style={{ width: `${Math.max(pct, voice.totalWorksCount > 0 ? 5 : 0)}%` }}
              />
            </div>
            <p className="text-[10px] font-mono font-bold text-zinc-400">
              {voice.totalWorksCount}/{voice.ceiling || 20} obras
            </p>
            <p className="text-[9.5px] text-zinc-500 leading-snug">
              Falta{missing === 1 ? '' : 'm'}{' '}
              <strong className="text-pink-400">{missing}</strong> p/ invocar (+30 XP)
            </p>
          </div>
        </div>

        <span className="relative z-10 text-[9.5px] font-bold text-zinc-500 group-hover:text-pink-300 transition-colors">
          Selo Lacrado (封印) • Dossiê →
        </span>
      </button>
    );
  }

  // =========================================================================
  // ESTADO 2 (≥ 15%, PRONTA PARA INVOCAR / COLAR NO FICHÁRIO)
  // =========================================================================
  if (!isStuck) {
    return (
      <div
        onClick={() => onSelect?.(voice)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect?.(voice)}
        className="group relative aspect-[3/4] rounded-2xl border-2 border-dashed border-pink-400/80 bg-gradient-to-b from-pink-500/12 via-zinc-900/95 to-zinc-950 p-3 flex flex-col justify-between text-center cursor-pointer shadow-[0_0_26px_rgba(236,72,153,0.18)] hover:border-pink-300 transition-all overflow-hidden"
      >
        <AnimeFloatingPetals accentHex={visualTheme.accentHex} subtle />

        <div className="relative z-10 flex items-center justify-between gap-1 text-[10px] font-mono">
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-pink-500/20 border border-pink-400/45 text-pink-200 font-black">
              {numLabel}
            </span>
            {flagBadge}
            <RankBadge rank={voice.rpgRank} />
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[9px] font-black animate-pulse">
            INVOCADA!
          </span>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-1.5 w-full">
          <div
            className="relative w-18 h-22 sm:w-[78px] sm:h-[94px] rounded-xl overflow-hidden p-[2px] shadow-2xl rotate-2 group-hover:rotate-0 transition-transform"
            style={{ background: visualTheme.frameBackground }}
          >
            <div className="w-full h-full rounded-[10px] overflow-hidden bg-zinc-900">
              {mainImageUrl ? (
                <img
                  src={mainImageUrl}
                  alt={voice.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {voice.icon || '🎙️'}
                </div>
              )}
            </div>
          </div>

          <div className="w-full px-1">
            <h3
              className={`${isLongName ? 'text-[11px]' : 'text-xs'} font-black text-white leading-tight truncate`}
              title={voice.name}
            >
              {voice.name}
            </h3>
            <p className="text-[9.5px] text-pink-300 font-semibold leading-tight truncate mt-0.5">
              {characterTitle}
            </p>
            <div
              className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold mt-1"
              style={{ color: visualTheme.accentHex }}
            >
              <span>
                {visualTheme.tcgCode} • {pct}%
              </span>
              {hasAvgRating && <span className="text-amber-300">★{voice.avgUserRating.toFixed(1)}</span>}
            </div>
            <div className="text-[9.5px] text-zinc-400 mt-0.5 flex items-center justify-center gap-2">
              {voice.watchedMoviesCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  <Film className="w-2.5 h-2.5" /> {voice.watchedMoviesCount}
                </span>
              )}
              {voice.watchedShowsCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-pink-300">
                  <Tv className="w-2.5 h-2.5" /> {voice.watchedShowsCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (voice.pendingPackId && onOpenPack) {
              onOpenPack(voice.pendingPackId);
            } else {
              onStick?.(voice.id);
            }
          }}
          className="relative z-10 w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 hover:brightness-110 text-white font-black text-[11px] shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {voice.pendingPackId ? 'Abrir Pacote' : 'Colar'} (+{voice.unclaimedXp || visualTheme.xpReward} XP)
          </span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // ESTADO 3: CARTA COLADA TCG (FULL-BLEED + MEDALHÃO + FLIP 3D + 4 TEMAS)
  // =========================================================================
  const isMangaTheme = activeVisualTheme === 'shonen_manga';
  const isMechaTheme = activeVisualTheme === 'cyber_mecha';
  const isGrimoireTheme = activeVisualTheme === 'dark_grimoire';
  const isPrismTheme = activeVisualTheme === 'prism_gacha' || !activeVisualTheme;

  const activeFrameBackground =
    isGrimoireTheme
      ? 'linear-gradient(135deg, #78350f, #d97706 25%, #fde68a 50%, #991b1b 75%, #18181b)'
      : unlocks.mythicSignedUnlocked
      ? auraPreset.frameBg
      : visualTheme.frameBackground;

  const activeBoxShadow =
    isGrimoireTheme
      ? '0 0 28px rgba(245,158,11,0.45), 0 0 45px rgba(153,27,27,0.35)'
      : unlocks.mythicSignedUnlocked
      ? auraPreset.shadow
      : visualTheme.boxShadow;

  const activeAccentHex = unlocks.mythicSignedUnlocked
    ? auraPreset.accent
    : visualTheme.accentHex;

  const themeContainerClass = `theme-${(activeVisualTheme || 'prism_gacha').replace('_', '-')}`;

  return (
    <div className={`relative aspect-[3/4] ${themeContainerClass}`}>
      {/* Carta anterior aparecendo por baixo em caso de upgrade */}
      {underlayTheme && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl pointer-events-none p-[3px]"
          style={{
            background: underlayTheme.frameBackground,
            transform: 'translate(-4px, 4px) rotate(-3deg) scale(0.985)',
            opacity: 0.88,
            boxShadow: '0 8px 18px rgba(0,0,0,0.65)',
          }}
        >
          <div className="w-full h-full rounded-[13px] bg-zinc-950/90 border border-white/15" />
        </div>
      )}

      {justStuck && (
        <div
          className="absolute -inset-1.5 rounded-3xl border-2 pointer-events-none z-20 tv-sticker-paste-ring"
          style={{ borderColor: activeAccentHex }}
        />
      )}

      <div className={`relative w-full h-full z-10 ${justStuck ? 'tv-sticker-peel-unroll' : ''}`}>
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full transition-transform duration-200"
          style={{
            transform: pointer.active
              ? `perspective(750px) rotateX(${pointer.rx.toFixed(2)}deg) rotateY(${pointer.ry.toFixed(2)}deg) scale(1.04)`
              : `rotate(${subtleTilt}deg)`,
          }}
        >
          {/* MOLDURA TCG FULL-BLEED */}
          <div
            onClick={() => onSelect?.(voice)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect?.(voice)}
            className={`group relative w-full h-full rounded-2xl cursor-pointer p-[3px] ${
              justStuck ? 'ring-4 ring-pink-300/80' : ''
            }`}
            style={{
              background: activeFrameBackground,
              boxShadow: activeBoxShadow,
            }}
          >
            {/* ===============================================================
                VERSO DA CARTA (FLIP 3D): FICHA DE PODER & STATUS COMPLETO
               =============================================================== */}
            {isFlipped ? (
              <div className="relative w-full h-full rounded-[13px] overflow-hidden bg-zinc-950 flex flex-col justify-between p-3 border border-white/20">
                {charImgUrl && (
                  <img
                    src={charImgUrl}
                    alt={characterTitle}
                    className="absolute inset-0 w-full h-full object-cover opacity-25 blur-[2px] scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/80 to-black/95" />

                {/* Topo do Verso */}
                <div className="relative z-10 flex items-center justify-between gap-1">
                  <span
                    className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border"
                    style={{
                      borderColor: `${activeAccentHex}88`,
                      color: activeAccentHex,
                      background: 'rgba(9,9,11,0.9)',
                    }}
                  >
                    ⚔️ FICHA DE PODER & STATUS
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalFlipped(false);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-900/90 hover:bg-pink-500 text-zinc-200 hover:text-white border border-white/20 text-[9px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                    title="Voltar para a Frente"
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                    <span>Frente</span>
                  </button>
                </div>

                {/* Centro do Verso: Destaque do Papel & Afinidade */}
                <div className="relative z-10 my-auto flex flex-col items-center text-center gap-1.5 w-full">
                  <div
                    className="w-16 h-20 rounded-xl overflow-hidden border-2 shadow-xl shrink-0"
                    style={{ borderColor: activeAccentHex }}
                  >
                    <img
                      src={charImgUrl || actorPhotoUrl}
                      alt={characterTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="w-full px-1">
                    <span className="text-[8.5px] font-bold uppercase tracking-widest text-zinc-400 block">
                      Personagem Principal
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-1">
                      {characterTitle}
                    </h4>
                    {showTitle && (
                      <p className="text-[10px] font-semibold text-pink-300 truncate mt-0.5">
                        {showTitle}
                      </p>
                    )}
                  </div>

                  {/* Selo de Afinidade Automático */}
                  <div
                    className="px-2.5 py-0.5 rounded-full bg-black/85 border text-[9.5px] font-black shadow"
                    style={{ borderColor: `${affinity.color}77`, color: affinity.color }}
                  >
                    {affinity.label}
                  </div>

                  {/* Galeria de Outros Papéis (Grimório de Papéis 30%+) */}
                  {otherRoles.length > 0 && (
                    <div className="w-full pt-1 border-t border-white/10">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                        Grimório de Papéis ({otherRoles.length + 1})
                      </span>
                      <div className="flex items-center justify-center gap-1.5 overflow-hidden">
                        {otherRoles.slice(0, 3).map((r, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[8.5px] font-semibold text-zinc-300 truncate max-w-[85px]"
                            title={`${r.character || r.characterName} (${r.title})`}
                          >
                            {r.character || r.characterName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rodapé do Verso: Quotes & Status */}
                <div className="relative z-10 space-y-1 border-t border-white/10 pt-2 text-[9px] font-mono">
                  {voice.quoteJp && (
                    <p className="font-bold text-amber-300 text-center line-clamp-1">
                      {voice.quoteJp}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>🎬 {voice.watchedMoviesCount} · ⛩️ {voice.watchedShowsCount} obras</span>
                    <span className="text-emerald-300 font-black">+{voice.claimedXp || visualTheme.xpReward} XP</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ===============================================================
                  FRENTE DA CARTA: ARTE FULL-BLEED + MEDALHÃO SEIYŪ + TEMAS
                 =============================================================== */
              <div
                className="relative w-full h-full rounded-[13px] overflow-hidden bg-zinc-950 flex flex-col border"
                style={{
                  borderColor: unlocks.mythicSignedUnlocked
                    ? `${activeAccentHex}bb`
                    : visualTheme.innerTrimColor,
                }}
              >
                {/* ARTE PRINCIPAL FULL-BLEED (Sem barras pretas laterais) */}
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={isSwapped ? voice.name : characterTitle}
                    className={`w-full h-full object-cover object-top transition-all duration-300 ${
                      isMangaTheme ? 'tcg-manga-art' : ''
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-5xl">
                    {voice.icon || '🎙️'}
                  </div>
                )}

                {/* 1. MOTOR HOLO-PRISMÁTICO SSR (prism_gacha) */}
                {isPrismTheme && (
                  <>
                    <div className="tcg-holo-overlay absolute inset-0 pointer-events-none z-[6] mix-blend-color-dodge opacity-50" />
                    <AnimeFloatingPetals accentHex={activeAccentHex} />
                    <AnimeFoilOverlays effectId={visualTheme.metallicType} pointer={pointer} />
                  </>
                )}

                {/* 2. MOTOR MANGÁ SHONEN JUMP P&B + NEON (shonen_manga) */}
                {isMangaTheme && (
                  <>
                    <div className="tcg-halftone-overlay absolute inset-0 pointer-events-none z-[6] opacity-35 mix-blend-overlay" />
                    <div className="tcg-speedlines absolute inset-0 pointer-events-none z-[6]" />
                    <span
                      aria-hidden="true"
                      className="tcg-onomatopoeia pointer-events-none absolute right-3 top-12 font-black text-xs tracking-tighter text-pink-400 select-none z-[7] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      ゴゴゴゴ
                    </span>
                    <span
                      aria-hidden="true"
                      className="tcg-onomatopoeia pointer-events-none absolute left-3 bottom-14 font-black text-[11px] tracking-tighter text-amber-300 select-none z-[7] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
                    >
                      ドドン!
                    </span>
                  </>
                )}

                {/* 3. MOTOR CYBER-MECHA HUD AKIHABARA (cyber_mecha) */}
                {isMechaTheme && (
                  <>
                    <div className="tcg-scanlines absolute inset-0 pointer-events-none z-[6] opacity-30" />
                    <div className="tcg-laser-beam absolute left-0 right-0 h-1 bg-cyan-400 pointer-events-none z-[7] shadow-[0_0_12px_#22d3ee]" />
                    <div className="absolute top-1 left-3 z-[7] text-[7.5px] font-mono text-cyan-300 tracking-widest uppercase font-black bg-black/60 px-1 rounded">
                      HUD//SYNC 99.8%
                    </div>
                  </>
                )}

                {/* 4. MOTOR GRIMÓRIO DOURADO & CARMESIM (dark_grimoire) */}
                {isGrimoireTheme && (
                  <>
                    <div className="tcg-alchemy-rune absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 mix-blend-screen z-[6]">
                      <div className="w-44 h-44 rounded-full border-2 border-dashed border-amber-300/80 flex items-center justify-center">
                        <div className="w-32 h-32 rotate-45 border border-rose-400/70" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none z-[6] overflow-hidden">
                      <span className="tcg-ember absolute left-6 bottom-3 text-[10px] text-amber-300">🔥</span>
                      <span
                        className="tcg-ember absolute left-20 bottom-1 text-[11px] text-rose-400"
                        style={{ animationDelay: '0.8s' }}
                      >
                        ✦
                      </span>
                      <span
                        className="tcg-ember absolute right-8 bottom-4 text-[10px] text-yellow-200"
                        style={{ animationDelay: '1.4s' }}
                      >
                        🔥
                      </span>
                    </div>
                  </>
                )}

                {/* MEDALHÃO CIRCULAR ELEGANTE (Permite inverter foco com 1 clique) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocalSwapFocus((prev) => !prev);
                  }}
                  title={`Alternar foco da arte: ${isSwapped ? 'Ver Personagem' : 'Ver Dublador'}`}
                  className="group/medallion absolute top-9 right-2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[2px] shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ec4899, #38bdf8)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.8), 0 0 12px rgba(236,72,153,0.5)',
                  }}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-950 border border-white/40">
                    {medallionImageUrl ? (
                      <img
                        src={medallionImageUrl}
                        alt={isSwapped ? characterTitle : voice.name}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        🎙️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover/medallion:bg-black/0 transition-colors" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/85 py-0.2 text-[7px] font-black text-center text-amber-200 tracking-tighter uppercase truncate px-0.5">
                      {isSwapped ? 'Char' : 'Voz'}
                    </div>
                  </div>
                </div>

                {justStuck && (
                  <div
                    className="absolute left-0 right-0 h-14 pointer-events-none z-20 tv-sticker-peel-wiper"
                    style={{
                      background:
                        'linear-gradient(0deg, transparent, rgba(255,255,255,0.9) 48%, rgba(236,72,153,0.6) 65%, transparent)',
                    }}
                  />
                )}

                {/* Gradiente escuro concentrado na base para manter visibilidade de texto */}
                <div
                  className="absolute inset-0 pointer-events-none z-[5]"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 22%, transparent 52%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.98) 100%)',
                  }}
                />

                {/* TOPO DA CARTA (Raridade, TCG Code, Bandeira, Estrelas, Flip) */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="px-1.5 py-0.5 rounded font-mono text-[9px] leading-none font-black uppercase italic border shadow"
                      style={visualTheme.badgeStyle}
                    >
                      {visualTheme.tcgCode}
                    </span>
                    {flagBadge}
                    <RankBadge rank={voice.rpgRank} />
                    {voice.isDeceased && (
                      <span
                        className="px-1 py-0.5 rounded bg-zinc-950/85 border border-amber-400/40 text-[9px] leading-none"
                        title="In Memoriam"
                      >
                        🕊️
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Estrelas Infinitas (1-6 individuais ou 7+ contador numérico) */}
                    {starsInfo && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8.5px] font-black leading-none flex items-center gap-0.5 shadow ${
                          starsInfo.isCompact
                            ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-zinc-950 font-black'
                            : 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] tracking-tighter'
                        }`}
                        title={`${extraStars} estrela(s) de prestígio`}
                      >
                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        <span>{starsInfo.isCompact ? starsInfo.count : starsInfo.text}</span>
                      </span>
                    )}

                    {voice.isFavoriteGuardian && (
                      <span
                        className="px-1 py-0.5 rounded bg-pink-500/90 text-white font-black text-[8.5px] leading-none shadow"
                        title="Guardião Favorito"
                      >
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {/* Botão de Flip 3D (Desbloqueado em 45%+ Rara ou quando simulado) */}
                    {(unlocks.skinsUnlocked || voice.isSimulated) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalFlipped(true);
                        }}
                        title="Virar Carta: Ver Ficha de Poder, Status & Obras (45%+)"
                        className="px-1.5 py-0.5 rounded bg-zinc-950/85 hover:bg-pink-500 text-zinc-200 hover:text-white border border-white/20 text-[8.5px] font-black flex items-center gap-0.5 shadow cursor-pointer transition-colors"
                      >
                        <RotateCw className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Flip</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PLACA INFERIOR */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10 flex flex-col gap-1">
                  {/* Assinatura Caligráfica (Mítica 100%) */}
                  {unlocks.mythicSignedUnlocked && signatureMode !== 'hidden' && (
                    <div className="pointer-events-none flex justify-end mb-0.5">
                      <div
                        className="relative inline-block max-w-full text-right select-none -rotate-3"
                        style={{
                          textShadow: `0 0 12px ${activeAccentHex}, 0 2px 6px rgba(0,0,0,0.98)`,
                        }}
                      >
                        <span
                          className={`${
                            isLongName ? 'text-xs' : 'text-[15px]'
                          } italic font-semibold tracking-wide block leading-none pr-1 truncate ${
                            signatureMode === 'writing' ? 'tv-autograph-write-text' : ''
                          }`}
                          style={{
                            fontFamily: "'Brush Script MT', 'Segoe Script', Georgia, serif",
                            color: '#fef08a',
                          }}
                        >
                          {voice.name}
                        </span>
                        <svg viewBox="0 0 120 10" className="w-24 h-2 ml-auto opacity-95">
                          <path
                            d="M4 7 Q 55 1, 116 5"
                            fill="none"
                            stroke={activeAccentHex}
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            className={signatureMode === 'writing' ? 'tv-autograph-write-line' : ''}
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Botão de Upgrade pendente */}
                  {voice.hasRarityUpgradeToStick && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (voice.pendingPackId && onOpenPack) {
                          onOpenPack(voice.pendingPackId);
                        } else {
                          onStick?.(voice.id);
                        }
                      }}
                      className="mb-1 w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-pink-400 via-amber-300 to-pink-400 hover:brightness-110 text-zinc-950 font-black text-[10px] shadow-lg flex items-center justify-center gap-1 animate-pulse cursor-pointer"
                    >
                      <Layers className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        Evoluir p/ {visualTheme.label}! (+{voice.unclaimedXp} XP)
                      </span>
                    </button>
                  )}

                  {/* Selo Obra-Prima (Mítica 100%) */}
                  {unlocks.mythicSignedUnlocked && voice.signatureWork && (
                    <div
                      className="px-2 py-0.5 rounded-md bg-black/85 border text-[9px] font-bold text-amber-200 flex items-center justify-between gap-1 truncate shadow"
                      style={{ borderColor: `${activeAccentHex}88` }}
                      title={`Obra-Prima: ${voice.signatureWork.title}`}
                    >
                      <span className="truncate">🏆 {voice.signatureWork.title}</span>
                      {typeof voice.signatureWork.userRating === 'number' && (
                        <span className="font-mono font-black text-amber-300 shrink-0">
                          ★{voice.signatureWork.userRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10.5px] font-black text-white truncate drop-shadow">
                      {isSwapped ? voice.name : characterTitle}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {hasAvgRating && (
                        <span className="px-1 py-0.5 rounded bg-black/75 border border-amber-400/40 font-mono text-[9px] font-black text-amber-300">
                          ★{voice.avgUserRating.toFixed(1)}
                        </span>
                      )}
                      <span
                        className="font-mono text-xs font-black drop-shadow"
                        style={{ color: activeAccentHex }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`${
                      isLongName ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                    } font-black text-zinc-200 leading-tight truncate drop-shadow`}
                    title={voice.name}
                  >
                    {isSwapped ? characterTitle : voice.name}
                  </h3>

                  <div className="flex items-end justify-between gap-1.5 text-[9.5px] leading-[1.15] text-zinc-300/95">
                    <span className="font-semibold text-pink-200/95 truncate min-w-0">
                      {showTitle || voice.rpgTitle}
                    </span>
                    <span className="font-mono font-semibold shrink-0 whitespace-nowrap">
                      {voice.totalWorksCount}/{voice.ceiling || 20}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TvVoiceStickerCard;
