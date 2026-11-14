import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Award, Film, Star, ChevronRight, Ghost, Crown } from 'lucide-react';
import { stopAllTrophyAudio } from '../utils/trophyAudio';
import { playUniverseMusicTrack, resolveUniverseVictoryTrack } from '../utils/universeAudio';

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

const VICTORY_TIER_THEMES = {
  bronze: {
    label: 'Bronze',
    icon: '🥉',
    badge: 'bg-[#CD7F32]/25 border-[#CD7F32]/75 text-[#F1BE86]',
    cardBorder: 'border-[#CD7F32]/75',
    posterBorder: 'border-[#CD7F32]/80',
    glow: 'shadow-[0_0_95px_rgba(205,127,50,0.42)]',
    accentGrad: 'from-[#CD7F32] via-amber-300 to-[#CD7F32]',
    titleGrad: 'from-amber-200 via-orange-200 to-amber-400',
    ringHex: '#CD7F32',
    auraRgba: 'rgba(205, 127, 50, 0.28)',
    cursorClass: 'text-amber-300',
  },
  silver: {
    label: 'Prata',
    icon: '🥈',
    badge: 'bg-zinc-300/20 border-zinc-200/65 text-zinc-100',
    cardBorder: 'border-zinc-300/65',
    posterBorder: 'border-zinc-200/80',
    glow: 'shadow-[0_0_95px_rgba(228,228,231,0.34)]',
    accentGrad: 'from-zinc-300 via-white to-zinc-400',
    titleGrad: 'from-white via-zinc-200 to-zinc-400',
    ringHex: '#E4E4E7',
    auraRgba: 'rgba(212, 212, 216, 0.24)',
    cursorClass: 'text-zinc-200',
  },
  epic: {
    label: 'Épico',
    icon: '💜',
    badge: 'bg-purple-500/25 border-purple-400/75 text-purple-100',
    cardBorder: 'border-purple-400/75',
    posterBorder: 'border-purple-400/85',
    glow: 'shadow-[0_0_110px_rgba(168,85,247,0.48)]',
    accentGrad: 'from-purple-400 via-fuchsia-300 to-indigo-400',
    titleGrad: 'from-purple-200 via-fuchsia-200 to-indigo-300',
    ringHex: '#A855F7',
    auraRgba: 'rgba(168, 85, 247, 0.3)',
    cursorClass: 'text-fuchsia-300',
  },
  gold: {
    label: 'Ouro',
    icon: '🥇',
    badge: 'bg-amber-500/25 border-amber-300/85 text-amber-100',
    cardBorder: 'border-amber-400/85',
    posterBorder: 'border-amber-300/85',
    glow: 'shadow-[0_0_120px_rgba(251,191,36,0.5)]',
    accentGrad: 'from-amber-400 via-yellow-200 to-amber-500',
    titleGrad: 'from-amber-200 via-yellow-100 to-amber-400',
    ringHex: '#FBBF24',
    auraRgba: 'rgba(251, 191, 36, 0.3)',
    cursorClass: 'text-amber-300',
  },
  mythic: {
    label: 'Mítico',
    icon: '💎',
    badge: 'bg-gradient-to-r from-fuchsia-600/40 via-amber-500/35 to-cyan-500/35 border-fuchsia-300/85 text-fuchsia-100',
    cardBorder: 'border-fuchsia-400/90',
    posterBorder: 'border-fuchsia-300/90',
    glow: 'shadow-[0_0_150px_rgba(217,70,239,0.58),0_0_80px_rgba(245,158,11,0.38)]',
    accentGrad: 'from-fuchsia-400 via-amber-200 to-cyan-400',
    titleGrad: 'from-fuchsia-200 via-amber-100 to-cyan-200',
    ringHex: '#E879F9',
    auraRgba: 'rgba(217, 70, 239, 0.36)',
    cursorClass: 'text-cyan-300',
  },
};

/**
 * Calcula posições espelhadas e distribuídas pela tela inteira (100vw x 100vh)
 * preservando a zona central limpa para o título da saga e o efeito máquina de escrever.
 */
function computeMirroredSlots(count) {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 14, y: 50, tilt: -4, layer: 2 }];
  if (count === 2) {
    return [
      { x: 13.5, y: 50, tilt: -5, layer: 2 },
      { x: 86.5, y: 50, tilt: 5, layer: 2 },
    ];
  }
  if (count === 3) {
    return [
      { x: 13.5, y: 52, tilt: -6, layer: 2 },
      { x: 50, y: 12.5, tilt: 0, layer: 2 },
      { x: 86.5, y: 52, tilt: 6, layer: 2 },
    ];
  }
  if (count === 4) {
    return [
      { x: 12, y: 31, tilt: -7, layer: 2 },
      { x: 88, y: 31, tilt: 7, layer: 2 },
      { x: 14, y: 70, tilt: 5, layer: 2 },
      { x: 86, y: 70, tilt: -5, layer: 2 },
    ];
  }

  // Distribuição simétrica nos 4 flancos ao redor do núcleo central:
  // Colunas Esquerda/Direita + Faixas Superior/Inferior (espelhadas horizontalmente).
  const slots = [];
  const sidePairsTarget = Math.min(Math.ceil(count * 0.56), count >= 24 ? 22 : count >= 12 ? 12 : 8);
  const topBottomRemaining = Math.max(0, count - sidePairsTarget);
  const topCount = Math.ceil(topBottomRemaining / 2);
  const bottomCount = topBottomRemaining - topCount;

  // Flancos Esquerdo e Direito em pares perfeitamente espelhados (outer + inner alternados)
  const pairsCount = Math.ceil(sidePairsTarget / 2);
  const rowsPerColumn = Math.ceil(pairsCount / 2);
  const useDualColumns = pairsCount > 4;

  let sideAdded = 0;
  for (let i = 0; i < pairsCount; i += 1) {
    const isInner = useDualColumns && i % 2 === 1;
    const colIndex = useDualColumns ? Math.floor(i / 2) : i;
    const colTotal = useDualColumns
      ? isInner
        ? Math.floor(pairsCount / 2)
        : rowsPerColumn
      : pairsCount;
    const t = colTotal <= 1 ? 0.5 : colIndex / (colTotal - 1);
    const yBase = 19 + t * 62 + (isInner ? 4.5 : 0);
    const y = Math.min(84, Math.max(17, yBase));
    const xOffset = isInner ? 18.5 : 7.5;
    const tiltBase = ((i % 3) - 1) * 5 + (isInner ? -3 : 3);

    slots.push({
      x: xOffset,
      y,
      tilt: tiltBase,
      layer: isInner ? 1 : 2,
    });
    sideAdded += 1;

    if (sideAdded < sidePairsTarget) {
      slots.push({
        x: 100 - xOffset,
        y,
        tilt: -tiltBase,
        layer: isInner ? 1 : 2,
      });
      sideAdded += 1;
    }
  }

  // Faixa Superior (y: 8.5..13.5%, distribuída entre x: 16..84%)
  for (let i = 0; i < topCount; i += 1) {
    const t = topCount <= 1 ? 0.5 : i / (topCount - 1);
    const x = topCount === 1 ? 50 : 18 + t * 64;
    const arcLift = Math.sin(t * Math.PI) * 2.5;
    slots.push({
      x,
      y: 11.5 - arcLift,
      tilt: (t - 0.5) * 10,
      layer: i % 2 === 0 ? 2 : 1,
    });
  }

  // Faixa Inferior (y: 86.5..91.5%, espelhando a Superior)
  for (let i = 0; i < bottomCount; i += 1) {
    const t = bottomCount <= 1 ? 0.5 : i / (bottomCount - 1);
    const x = bottomCount === 1 ? 50 : 18 + t * 64;
    const arcDrop = Math.sin(t * Math.PI) * 2.5;
    slots.push({
      x,
      y: 88.5 + arcDrop,
      tilt: -(t - 0.5) * 10,
      layer: i % 2 === 0 ? 2 : 1,
    });
  }

  return slots.slice(0, count);
}

function getCardSizeClasses(count) {
  if (count <= 4) return 'w-24 sm:w-28 lg:w-32';
  if (count <= 8) return 'w-20 sm:w-24 lg:w-28';
  if (count <= 16) return 'w-16 sm:w-20 lg:w-24';
  if (count <= 28) return 'w-14 sm:w-16 lg:w-20';
  return 'w-12 sm:w-14 lg:w-[68px]';
}

const STARFIELD_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 98}%`,
  top: `${(i * 53 + 7) % 96}%`,
  size: i % 4 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
  delay: `${(i * 0.27) % 4}s`,
  duration: `${2.4 + (i % 5) * 0.7}s`,
}));

function parseValidMetric(raw, allowZero = false) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s || s.toUpperCase() === 'N/A') return null;
  const num = Number(s.replace('%', '').replace(',', '.'));
  if (!Number.isFinite(num)) return null;
  if (allowZero ? num < 0 : num <= 0) return null;
  return num;
}

function computeRatingsSummary(posters = []) {
  const accumulate = (key, allowZero = false) => {
    let sum = 0;
    let count = 0;
    for (const p of posters) {
      const val = parseValidMetric(p?.[key], allowZero);
      if (val !== null) {
        sum += val;
        count += 1;
      }
    }
    return { avg: count > 0 ? sum / count : null, count };
  };

  const user = accumulate('userRating', false);
  const imdb = accumulate('imdbRating', false);
  const metacritic = accumulate('metacriticScore', false);
  const rotten = accumulate('rottenTomatoesScore', true);

  const normalizedMetrics = [];
  if (user.avg !== null) normalizedMetrics.push(user.avg * 10);
  if (imdb.avg !== null) normalizedMetrics.push(imdb.avg * 10);
  if (metacritic.avg !== null) normalizedMetrics.push(metacritic.avg);
  if (rotten.avg !== null) normalizedMetrics.push(rotten.avg);

  const unifiedAvg100 =
    normalizedMetrics.length > 0
      ? normalizedMetrics.reduce((a, b) => a + b, 0) / normalizedMetrics.length
      : null;

  return {
    user,
    imdb,
    metacritic,
    rotten,
    unifiedAvg100,
    validSourcesCount: normalizedMetrics.length,
  };
}

function SpinningPosterCard({ poster, idx, totalCount, slot, theme, isMega, isHovered, onHover }) {
  const posterSrc = resolvePosterUrl(poster.posterUrl);
  const sizeClass = getCardSizeClasses(totalCount);

  // Mantém o turbilhão inicial sincronizado com os 2.9s do áudio digimon-tamers-card-spin
  const staggerMs = Math.min(idx * (totalCount > 20 ? 28 : totalCount > 10 ? 45 : 85), 1150);
  const spinDurationMs = isMega ? 1550 : 1380;
  const spinDegrees = isMega ? 1080 : 720;
  const dxVw = 50 - slot.x;
  const dyVh = 50 - slot.y;

  return (
    <div
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        '--dx': `${dxVw}vw`,
        '--dy': `${dyVh}vh`,
        '--tilt': `${slot.tilt}deg`,
        '--spinDeg': `${(idx % 2 === 0 ? 1 : -1) * spinDegrees}deg`,
        animation: `uvCardFlight ${spinDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerMs}ms both`,
        zIndex: isHovered ? 70 : slot.layer === 2 ? 20 : 12,
      }}
      className="fixed pointer-events-auto select-none"
      onMouseEnter={() => onHover(idx)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        style={{
          animation: `uvCardFloat ${4.2 + (idx % 4) * 0.55}s ease-in-out ${staggerMs + spinDurationMs}ms infinite`,
        }}
        className="relative"
      >
        <div
          style={{
            perspective: '1200px',
            transform: isHovered ? 'scale(1.26)' : 'scale(1)',
          }}
          className="relative transition-transform duration-300 ease-out cursor-pointer"
        >
          {/* Flipper 3D estilo Digimon Tamers Card Spin */}
        <div
          style={{
            transformStyle: 'preserve-3d',
            '--spinDeg': `${(idx % 2 === 0 ? 1 : -1) * spinDegrees}deg`,
            animation: `uvCardSpin3D ${spinDurationMs}ms cubic-bezier(0.18, 0.88, 0.25, 1) ${staggerMs}ms both`,
          }}
          className={`relative ${sizeClass} aspect-[2/3]`}
        >
          {/* Face Frontal: Pôster + Moldura Espelhada */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className={`absolute inset-0 rounded-xl overflow-hidden border-2 ${theme.posterBorder} bg-zinc-950 ${
              isMega
                ? 'shadow-[0_0_26px_rgba(217,70,239,0.45),0_12px_28px_rgba(0,0,0,0.8)]'
                : 'shadow-[0_0_20px_rgba(251,191,36,0.32),0_12px_24px_rgba(0,0,0,0.75)]'
            }`}
          >
            {posterSrc ? (
              <img
                src={posterSrc}
                alt={poster.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center bg-gradient-to-b from-zinc-900 to-black">
                <Film className="w-4 h-4 text-amber-400/80 mb-1" />
                <span className="text-[8px] font-black text-zinc-200 line-clamp-3 leading-tight">
                  {poster.title}
                </span>
              </div>
            )}

            {/* Reflexo Holográfico Diagonal Espelhado */}
            <div
              style={{
                animation: `uvMirrorGloss 4.5s ease-in-out ${staggerMs + spinDurationMs}ms infinite`,
              }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
            />

            {poster.userRating > 0 && (
              <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/85 border border-amber-400/60 text-[8px] font-mono font-black text-amber-300 flex items-center gap-0.5">
                <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                {Number(poster.userRating).toFixed(1)}
              </div>
            )}
          </div>

          {/* Verso da Carta 3D (visível durante os giros rápidos estilo Digimon Tamers) */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className={`absolute inset-0 rounded-xl border-2 ${theme.posterBorder} bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 flex flex-col items-center justify-center p-1 overflow-hidden shadow-inner`}
          >
            <div className="w-full h-full rounded-lg border border-white/25 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_70%)]">
              <Sparkles className="w-5 h-5 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
              <span className="mt-1 text-[7px] font-black uppercase tracking-[0.2em] text-amber-200/90">
                CÓDICE
              </span>
            </div>
          </div>
          </div>
        </div>

        {/* Reflexo Espelhado Sutil Sob a Carta */}
        <div
          aria-hidden="true"
          className="pointer-events-none w-full h-4 mt-0.5 rounded-b-xl overflow-hidden opacity-35 blur-[1.5px] scale-y-[-1]"
        >
          {posterSrc ? (
            <img src={posterSrc} alt="" className="w-full h-12 object-cover object-bottom mask-fade" />
          ) : (
            <div className="w-full h-full bg-gradient-to-t from-amber-400/30 to-transparent" />
          )}
        </div>

        {/* Tooltip Flutuante ao Passar o Mouse no Card */}
        {isHovered && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-zinc-950/95 border border-amber-400/60 text-[10px] font-bold text-white shadow-xl pointer-events-none">
            {poster.title}
            {poster.year ? ` (${poster.year})` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

function VictoryStage({ current, remainingCount, onCloseCurrent }) {
  const isMega = current.entityType === 'mega_saga';
  const tierKey = isMega ? 'mythic' : String(current.tier || 'gold').toLowerCase();
  const theme = VICTORY_TIER_THEMES[tierKey] || VICTORY_TIER_THEMES.gold;
  const posters = useMemo(() => (Array.isArray(current.posters) ? current.posters : []), [current.posters]);
  const fullQuote = current.finalQuote || '';

  const [typedCount, setTypedCount] = useState(0);
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);

  const slots = useMemo(() => computeMirroredSlots(posters.length), [posters.length]);
  const ratingsSummary = useMemo(() => computeRatingsSummary(posters), [posters]);
  const isTypingComplete = typedCount >= fullQuote.length;

  // Dispara trilha sonora / efeito sonoro no player persistente global após a entrada do Letreiro
  useEffect(() => {
    const timer = setTimeout(() => {
      stopAllTrophyAudio();
      const track = resolveUniverseVictoryTrack(current);
      playUniverseMusicTrack({
        ...track,
        universeTitle: current.title,
        universeIcon: current.icon,
        tier: tierKey,
        entityType: current.entityType,
      });
    }, 45);
    return () => clearTimeout(timer);
  }, [current, tierKey]);

  // Efeito Máquina de Escrever para a piada final da saga
  useEffect(() => {
    if (!fullQuote) return undefined;

    const startDelayMs = isMega ? 1250 : 900;
    const charIntervalMs = Math.max(14, Math.min(26, Math.round(2800 / Math.max(fullQuote.length, 45))));
    let intervalId = null;

    const delayId = setTimeout(() => {
      intervalId = setInterval(() => {
        setTypedCount((prev) => {
          if (prev >= fullQuote.length) {
            clearInterval(intervalId);
            return prev;
          }
          return prev + 1;
        });
      }, charIntervalMs);
    }, startDelayMs);

    return () => {
      clearTimeout(delayId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fullQuote, isMega]);

  // Atalhos: ESC fecha | Espaço revela imediatamente a máquina de escrever
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopAllTrophyAudio();
        onCloseCurrent();
      } else if (e.key === ' ' && typedCount < fullQuote.length) {
        e.preventDefault();
        setTypedCount(fullQuote.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCloseCurrent, typedCount, fullQuote.length]);

  const handleRevealFullQuote = () => {
    if (!isTypingComplete) setTypedCount(fullQuote.length);
  };

  const handleClose = () => {
    stopAllTrophyAudio();
    onCloseCurrent();
  };

  const displayedQuote = fullQuote.slice(0, typedCount);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-hidden"
      style={{ animation: 'uvEclipseBlackout 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
    >
      {/* Clarão Dimensional + Aura Radial de Evento */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: isMega
            ? 'radial-gradient(circle at 50% 50%, rgba(217,70,239,0.28) 0%, rgba(245,158,11,0.14) 32%, rgba(6,182,212,0.08) 56%, rgba(0,0,0,0.92) 82%)'
            : `radial-gradient(circle at 50% 50%, ${theme.auraRgba} 0%, rgba(0,0,0,0.88) 72%)`,
        }}
      />

      {/* Ondas de Choque Luminosas na Abertura */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          borderColor: theme.ringHex,
          animation: isMega
            ? 'uvShockwave 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            : 'uvShockwave 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      />
      {isMega && (
        <div
          className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300/80"
          style={{ animation: 'uvShockwave 1.85s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards' }}
        />
      )}

      {/* Borda Energizada em Tela Cheia para Evento Mítico */}
      {isMega && (
        <div
          className="pointer-events-none fixed inset-2 sm:inset-4 rounded-3xl border border-fuchsia-400/30 shadow-[inset_0_0_90px_rgba(217,70,239,0.22)]"
          style={{ animation: 'uvMythicBorderPulse 3.2s ease-in-out infinite' }}
        />
      )}

      {/* Campo Estelar / Brilho Espalhado na Tela Escura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {STARFIELD_PARTICLES.map((pt) => (
          <span
            key={pt.id}
            style={{
              left: pt.left,
              top: pt.top,
              width: `${pt.size}px`,
              height: `${pt.size}px`,
              animation: `uvStarTwinkle ${pt.duration} ease-in-out ${pt.delay} infinite`,
            }}
            className={`absolute rounded-full ${isMega ? 'bg-amber-200' : 'bg-white/80'}`}
          />
        ))}
      </div>

      {/* Anéis Orbitais Arcanos no Centro (Exclusivo Mega-Saga Mítica) */}
      {isMega && (
        <svg
          viewBox="0 0 600 600"
          className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] sm:w-[740px] h-[540px] sm:h-[740px] opacity-30"
          aria-hidden="true"
        >
          <circle
            cx="300"
            cy="300"
            r="268"
            fill="none"
            stroke="url(#uvMythicRingGrad)"
            strokeWidth="2"
            strokeDasharray="18 10 4 10"
            style={{ transformOrigin: '300px 300px', animation: 'uvRotateSlow 24s linear infinite' }}
          />
          <circle
            cx="300"
            cy="300"
            r="214"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="1.5"
            strokeDasharray="8 14"
            style={{ transformOrigin: '300px 300px', animation: 'uvRotateReverse 16s linear infinite' }}
          />
          <defs>
            <linearGradient id="uvMythicRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E879F9" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* ARENA TELA CHEIA (Desktop/Tablet md+): Cartas 3D Girando e Espelhadas por Toda a Tela */}
      {posters.length > 0 && (
        <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden">
          {posters.map((poster, idx) => (
            <SpinningPosterCard
              key={`${poster.title}_${idx}`}
              poster={poster}
              idx={idx}
              totalCount={posters.length}
              slot={slots[idx] || { x: 12, y: 50, tilt: 0, layer: 2 }}
              theme={theme}
              isMega={isMega}
              isHovered={hoveredCardIdx === idx}
              onHover={setHoveredCardIdx}
            />
          ))}
        </div>
      )}

      {/* Botão Fechar Global (sempre no topo direito acima de tudo) */}
      <button
        type="button"
        onClick={handleClose}
        className="fixed top-4 right-4 z-[80] p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-lg"
        title="Fechar Letreiro de Vitória (ESC)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* MONÓLITO CENTRAL: Nome da Saga + Máquina de Escrever */}
      <div className="relative z-40 w-full max-w-xl lg:max-w-2xl flex flex-col items-center gap-3 max-h-[94vh] overflow-y-auto md:overflow-visible py-2">
        {/* Faixa Superior Compacta Mobile (< md): garante experiência completa sem sobreposição */}
        {posters.length > 0 && (
          <div className="md:hidden w-full flex items-center justify-center gap-2 overflow-x-auto py-1 px-2">
            {posters.slice(0, Math.ceil(posters.length / 2)).map((p, idx) => {
              const posterSrc = resolvePosterUrl(p.posterUrl);
              return (
                <div
                  key={`mob_top_${p.title}_${idx}`}
                  style={{ animation: `uvCardSpin3D 1.1s ease-out ${idx * 70}ms both` }}
                  className={`w-12 aspect-[2/3] shrink-0 rounded-lg overflow-hidden border ${theme.posterBorder} bg-zinc-900 shadow-lg`}
                >
                  {posterSrc ? (
                    <img src={posterSrc} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-1 text-[7px] font-bold text-center text-zinc-300">
                      {p.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div
          style={{ animation: 'uvTitleSlam 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both' }}
          className="relative w-full px-4 py-4 sm:px-6 sm:py-5 flex flex-col items-center text-center gap-4 bg-transparent"
        >
          {/* Halo radial invisível (sem borda/grade) apenas para dar leitura suave ao centro */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0) 80%)',
            }}
          />

          {/* Destaque Supremo do Tipo de Troféu, Evento & XP */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap relative z-10">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] backdrop-blur-md shadow-[0_0_28px_rgba(0,0,0,0.6)] ${
                isMega
                  ? 'bg-fuchsia-500/25 text-fuchsia-100 shadow-[0_0_32px_rgba(217,70,239,0.5)]'
                  : 'bg-amber-500/15 text-amber-200'
              }`}
            >
              {isMega ? (
                <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              )}
              {isMega ? 'EVENTO MÍTICO • SAGA SUPREMA 100%' : 'SAGA 100% DOMINADA'}
            </span>

            {current.xp > 0 && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-xs sm:text-sm font-mono font-black text-emerald-300 drop-shadow-[0_0_16px_rgba(16,185,129,0.45)]">
                +{Number(current.xp).toLocaleString('pt-BR')} XP
              </span>
            )}

            {current.isGhost && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/25 text-[10px] font-black uppercase tracking-wider text-violet-200">
                <Ghost className="w-3 h-3" /> Modo Fantasma
              </span>
            )}
          </div>

          {/* Emblema Central + Tipo de Troféu em Destaque + Título na Cor do Troféu */}
          <div className="flex flex-col items-center gap-2.5 relative z-10">
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-28 h-28 rounded-full blur-2xl opacity-70"
                style={{ backgroundColor: theme.auraRgba }}
              />
              <span className="relative text-5xl sm:text-6xl select-none drop-shadow-[0_8px_28px_rgba(0,0,0,0.9)]">
                {current.icon || '🌌'}
              </span>
            </div>

            {/* Destaque do Tipo de Troféu */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-1 rounded-full backdrop-blur-sm text-sm sm:text-base font-black uppercase tracking-[0.2em] drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] ${theme.badge} border-0`}
            >
              <span className="text-lg sm:text-xl leading-none">{theme.icon}</span>
              <span>Troféu {theme.label}</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r ${theme.titleGrad} bg-clip-text text-transparent leading-[1.1] max-w-2xl drop-shadow-[0_6px_26px_rgba(0,0,0,0.95)]`}
            >
              {current.title}
            </h2>

            {/* Destaque das Obras Consagradas */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-sm text-sm sm:text-base font-black tracking-wide text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
              <span>
                <strong className={`bg-gradient-to-r ${theme.titleGrad} bg-clip-text text-transparent text-base sm:text-lg font-mono`}>
                  {current.watchedCount || posters.length} / {current.totalCount || posters.length}
                </strong>{' '}
                obras consagradas • <span className="text-emerald-300">100% Completo</span>
              </span>
            </div>
          </div>

          {/* Piada da Saga Flutuante com Efeito Máquina de Escrever (Sem Grade/Caixa) */}
          {fullQuote && (
            <button
              type="button"
              onClick={handleRevealFullQuote}
              className={`relative z-10 w-full max-w-xl px-2 py-2 text-center bg-transparent border-0 focus:outline-none ${
                !isTypingComplete ? 'cursor-pointer' : 'cursor-default'
              }`}
              title={!isTypingComplete ? 'Clique para revelar o texto completo' : undefined}
            >
              <p className="text-base sm:text-lg lg:text-xl font-extrabold italic text-zinc-100 leading-relaxed tracking-tight min-h-[3rem] drop-shadow-[0_3px_18px_rgba(0,0,0,0.98)]">
                &ldquo;{displayedQuote}
                {!isTypingComplete ? (
                  <span
                    className={`inline-block w-2 ml-0.5 font-mono font-black not-italic animate-pulse ${theme.cursorClass}`}
                  >
                    ▌
                  </span>
                ) : (
                  <>&rdquo;</>
                )}
              </p>

              {!isTypingComplete && (
                <span className="mt-1.5 block text-[10px] font-mono uppercase tracking-widest text-zinc-400 drop-shadow">
                  Clique ou pressione Espaço para acelerar
                </span>
              )}
            </button>
          )}

          {/* Painel Flutuante de Médias das Notas (Destaque Minha Nota + Crítica, ignorando N/A e null) */}
          <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-3 pt-1">
            {/* Destaque Central: Minha Nota */}
            <div className="relative inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 backdrop-blur-md shadow-[0_0_40px_rgba(251,191,36,0.28)]">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] shrink-0" />
              <div className="flex flex-col items-start text-left leading-none">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">
                  Média • Minha Nota
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(251,191,36,0.45)]">
                    {ratingsSummary.user.avg !== null ? ratingsSummary.user.avg.toFixed(2) : '—'}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200/75">
                    / 10
                    {ratingsSummary.user.count > 0
                      ? ` (${ratingsSummary.user.count} ${ratingsSummary.user.count === 1 ? 'obra' : 'obras'})`
                      : ''}
                  </span>
                </div>
              </div>
              {ratingsSummary.unifiedAvg100 !== null && (
                <div className="pl-3 ml-1 flex flex-col items-end text-right leading-none border-l border-amber-300/25">
                  <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-300">
                    Média Unificada
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-white mt-0.5">
                    {ratingsSummary.unifiedAvg100.toFixed(1)}
                    <span className="text-[10px] text-zinc-400 ml-0.5">/100</span>
                  </span>
                </div>
              )}
            </div>

            {/* Médias Externas Flutuantes (IMDb, Metacritic, Rotten Tomatoes - ignorando N/A/null) */}
            <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm font-mono drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              <div className="flex items-center gap-1.5">
                <span className="font-black uppercase text-[10px] tracking-wider text-yellow-400">IMDb</span>
                <span className="font-black text-white">
                  {ratingsSummary.imdb.avg !== null ? `${ratingsSummary.imdb.avg.toFixed(1)}/10` : '—'}
                </span>
                {ratingsSummary.imdb.count > 0 && (
                  <span className="text-[10px] text-zinc-400">({ratingsSummary.imdb.count})</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-black uppercase text-[10px] tracking-wider text-emerald-400">Metacritic</span>
                <span className="font-black text-white">
                  {ratingsSummary.metacritic.avg !== null ? `${Math.round(ratingsSummary.metacritic.avg)}/100` : '—'}
                </span>
                {ratingsSummary.metacritic.count > 0 && (
                  <span className="text-[10px] text-zinc-400">({ratingsSummary.metacritic.count})</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-black uppercase text-[10px] tracking-wider text-rose-400">Rotten</span>
                <span className="font-black text-white">
                  {ratingsSummary.rotten.avg !== null ? `${Math.round(ratingsSummary.rotten.avg)}%` : '—'}
                </span>
                {ratingsSummary.rotten.count > 0 && (
                  <span className="text-[10px] text-zinc-400">({ratingsSummary.rotten.count})</span>
                )}
              </div>
            </div>
          </div>

          {/* Rodapé / Botão de Ação (sem bordas) */}
          <div className="relative z-10 w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-mono text-zinc-400 drop-shadow">
              {remainingCount > 0
                ? `+${remainingCount} ${remainingCount === 1 ? 'consagração aguardando' : 'consagrações aguardando'} na fila`
                : 'Passe o mouse nas cartas ao redor para inspecionar'}
            </span>

            <button
              type="button"
              onClick={handleClose}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-xl ${
                isMega
                  ? 'bg-gradient-to-r from-fuchsia-400 via-amber-300 to-cyan-300 text-slate-950 hover:brightness-110'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 hover:brightness-110'
              }`}
            >
              <span>{remainingCount > 0 ? 'Próximo Letreiro' : 'Continuar'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Faixa Inferior Compacta Mobile (< md) */}
        {posters.length > 1 && (
          <div className="md:hidden w-full flex items-center justify-center gap-2 overflow-x-auto py-1 px-2">
            {posters.slice(Math.ceil(posters.length / 2)).map((p, idx) => {
              const posterSrc = resolvePosterUrl(p.posterUrl);
              return (
                <div
                  key={`mob_bot_${p.title}_${idx}`}
                  style={{ animation: `uvCardSpin3D 1.1s ease-out ${(idx + 2) * 70}ms both` }}
                  className={`w-12 aspect-[2/3] shrink-0 rounded-lg overflow-hidden border ${theme.posterBorder} bg-zinc-900 shadow-lg`}
                >
                  {posterSrc ? (
                    <img src={posterSrc} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-1 text-[7px] font-bold text-center text-zinc-300">
                      {p.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes uvEclipseBlackout {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes uvShockwave {
          0% { width: 40px; height: 40px; opacity: 0.95; border-width: 5px; }
          100% { width: 150vmax; height: 150vmax; opacity: 0; border-width: 1px; }
        }
        @keyframes uvCardFlight {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate3d(var(--dx), var(--dy), 0) scale(0.18) rotate(0deg);
          }
          18% {
            opacity: 1;
          }
          82% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1) rotate(var(--tilt));
          }
        }
        @keyframes uvCardSpin3D {
          0% {
            transform: rotateY(var(--spinDeg, 720deg)) rotateX(18deg) scale(0.85);
          }
          75% {
            transform: rotateY(22deg) rotateX(0deg) scale(1.06);
          }
          100% {
            transform: rotateY(0deg) rotateX(0deg) scale(1);
          }
        }
        @keyframes uvCardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes uvMirrorGloss {
          0%, 100% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          40%, 60% { opacity: 0.55; }
          50% { transform: translateX(140%) skewX(-18deg); opacity: 0.8; }
        }
        @keyframes uvBannerSheen {
          0% { transform: translateX(-120%); }
          60%, 100% { transform: translateX(120%); }
        }
        @keyframes uvTitleSlam {
          0% { opacity: 0; transform: scale(1.08) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes uvStarTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.35); }
        }
        @keyframes uvMythicBorderPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes uvRotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes uvRotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .mask-fade {
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.65), transparent);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.65), transparent);
        }
      `}</style>
    </div>
  );
}

export default function UniverseVictoryBanner() {
  const [queue, setQueue] = useState([]);
  const current = queue[0] || null;
  const remainingCount = Math.max(0, queue.length - 1);

  const handleCloseCurrent = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const list = Array.isArray(e?.detail) ? e.detail.filter(Boolean) : e?.detail ? [e.detail] : [];
      if (list.length === 0) return;
      const stamped = list.map((item, idx) => ({
        ...item,
        _victoryKey: `${item.id || item.title}_${Date.now()}_${idx}`,
      }));
      setQueue((prev) => [...prev, ...stamped]);
    };

    window.addEventListener('cine-universe-victory', handler);
    return () => window.removeEventListener('cine-universe-victory', handler);
  }, []);

  if (!current) return null;

  const content = (
    <VictoryStage
      key={current._victoryKey}
      current={current}
      remainingCount={remainingCount}
      onCloseCurrent={handleCloseCurrent}
    />
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
}
