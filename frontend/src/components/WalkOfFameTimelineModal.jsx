import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Star,
  Calendar,
  Eye,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { resolveWalkMediaUrl } from '../utils/walkOfFameStickers';
import {
  isAudioMuted,
  playWalkOfFameTimelineOpenSound,
  playWalkOfFameTimelineStepSound,
  playWalkOfFameTimelineCompleteSound,
  stopAllTrophyAudio,
} from '../utils/trophyAudio';

const STAGE_HEIGHT = 544;
const AXIS_Y = 272;
const COL_STEP = 232;
const STAGE_PAD_X = 128;
const CARD_WIDTH = 204;
const CARD_HEIGHT = 122;

const MONTHS_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function formatWatchPeriod(film) {
  if (film.monthSeen && film.yearSeen) {
    const m = MONTHS_PT[Math.max(0, Math.min(11, Number(film.monthSeen) - 1))] || '';
    return `${m}/${film.yearSeen}`;
  }
  if (film.yearSeen) return `Ass. ${film.yearSeen}`;
  if (film.watchedAt) {
    const d = new Date(film.watchedAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    }
  }
  return 'Catálogo';
}

function ratingBadgeStyle(rating, delta) {
  if (typeof rating !== 'number') {
    return 'bg-zinc-900 border-zinc-700 text-zinc-400';
  }
  if (delta > 0.05) return 'bg-emerald-500/20 border-emerald-400/80 text-emerald-200';
  if (delta < -0.05) return 'bg-rose-500/20 border-rose-400/80 text-rose-200';
  return 'bg-amber-400/20 border-amber-300/80 text-amber-200';
}

export default function WalkOfFameTimelineModal({ star, onClose }) {
  const [sortMode, setSortMode] = useState('watched'); // 'watched' | 'release'
  const [isPlaying, setIsPlaying] = useState(true);
  const [slowMode, setSlowMode] = useState(true);
  const [revealedCount, setRevealedCount] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(() => !isAudioMuted());
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const activeNodeRef = useRef(null);
  const lastSoundStepRef = useRef(null);

  const orderedFilms = useMemo(() => {
    const raw = Array.isArray(star?.watchedFilms) ? [...star.watchedFilms] : [];
    if (sortMode === 'release') {
      raw.sort((a, b) => {
        const yA = a.releaseYear || 9999;
        const yB = b.releaseYear || 9999;
        if (yA !== yB) return yA - yB;
        return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
      });
    } else {
      raw.sort((a, b) => {
        const yA = a.yearSeen || 9999;
        const yB = b.yearSeen || 9999;
        if (yA !== yB) return yA - yB;
        const mA = a.monthSeen || 12;
        const mB = b.monthSeen || 12;
        if (mA !== mB) return mA - mB;
        const tA = a.watchedAt ? new Date(a.watchedAt).getTime() : 0;
        const tB = b.watchedAt ? new Date(b.watchedAt).getTime() : 0;
        if (tA !== tB) return tA - tB;
        return Number(a.viewId || a.movieId || 0) - Number(b.viewId || b.movieId || 0);
      });
    }
    return raw;
  }, [star, sortMode]);

  const ratedFilms = useMemo(
    () => orderedFilms.filter((f) => typeof f.userRating === 'number'),
    [orderedFilms]
  );

  const overallAverage = useMemo(() => {
    if (ratedFilms.length === 0) return star?.avgUserRating ?? null;
    const sum = ratedFilms.reduce((acc, f) => acc + Number(f.userRating), 0);
    return Number((sum / ratedFilms.length).toFixed(2));
  }, [ratedFilms, star]);

  const highestRatedFilm = useMemo(() => {
    if (ratedFilms.length === 0) return null;
    return [...ratedFilms].sort((a, b) => b.userRating - a.userRating)[0];
  }, [ratedFilms]);

  const lowestRatedFilm = useMemo(() => {
    if (ratedFilms.length === 0) return null;
    return [...ratedFilms].sort((a, b) => a.userRating - b.userRating)[0];
  }, [ratedFilms]);

  // Calcula posição criativa em linha reta horizontal com variação para cima / baixo conforme nota vs Média Geral
  const nodes = useMemo(() => {
    const baseline = typeof overallAverage === 'number' ? overallAverage : 7.5;
    return orderedFilms.map((film, idx) => {
      const x = STAGE_PAD_X + idx * COL_STEP;
      const hasRating = typeof film.userRating === 'number';
      const delta = hasRating ? Number((film.userRating - baseline).toFixed(2)) : 0;
      const prevRatedFilm = idx > 0 ? orderedFilms[idx - 1] : null;
      const stepDelta =
        hasRating && typeof prevRatedFilm?.userRating === 'number'
          ? Number((film.userRating - prevRatedFilm.userRating).toFixed(1))
          : null;

      // Direção em torno do eixo reto central (AXIS_Y):
      // Notas acima (ou iguais em índice par) sobem; notas abaixo (ou sem nota em ímpar) descem.
      const isUp = hasRating ? (delta > 0.01 ? true : delta < -0.01 ? false : idx % 2 === 0) : idx % 2 === 0;
      const magnitude = hasRating ? Math.min(1, Math.abs(delta) / 2.2) : 0.28;

      // Garante espaçamento mínimo de 24px fora da faixa central de data (AXIS_Y ± 18px)
      let cardTop;
      let anchorY;
      if (isUp) {
        // Sobe quanto maior for o delta positivo: de top=108 (perto da média) até top=16 (pico máximo)
        cardTop = Math.round(108 - magnitude * 92);
        anchorY = cardTop + CARD_HEIGHT;
      } else {
        // Desce quanto maior for o delta negativo: de top=312 (perto da média) até top=404 (fundo mínimo)
        cardTop = Math.round(312 + magnitude * 92);
        anchorY = cardTop;
      }

      return {
        film,
        idx,
        x,
        cardTop,
        anchorY,
        isUp,
        hasRating,
        delta,
        stepDelta,
        axisLabel: sortMode === 'release' ? String(film.releaseYear || 'S/D') : formatWatchPeriod(film),
      };
    });
  }, [orderedFilms, overallAverage, sortMode]);

  const starId = star?.id || null;

  // Reinicia suavemente ao abrir ou mudar de ordem + toca som de abertura
  useEffect(() => {
    if (!starId) return undefined;
    setRevealedCount(1);
    setIsPlaying(orderedFilms.length > 1);
    lastSoundStepRef.current = null;
    if (soundEnabledRef.current) {
      playWalkOfFameTimelineOpenSound();
    }
    return () => {
      stopAllTrophyAudio();
    };
  }, [starId, sortMode, orderedFilms.length]);

  // Esc para fechar
  useEffect(() => {
    if (!star) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [star, onClose]);

  const stepIntervalMs = slowMode ? 1300 : 720;

  // Avança lentamente filme por filme
  useEffect(() => {
    if (!star || !isPlaying) return undefined;
    if (revealedCount >= nodes.length) {
      setIsPlaying(false);
      if (soundEnabled && nodes.length > 1) {
        playWalkOfFameTimelineCompleteSound();
      }
      return undefined;
    }
    const timer = setTimeout(() => {
      setRevealedCount((c) => Math.min(nodes.length, c + 1));
    }, stepIntervalMs);
    return () => clearTimeout(timer);
  }, [star, isPlaying, revealedCount, nodes.length, stepIntervalMs, soundEnabled]);

  // Áudio sincronizado quando um novo ponto da linha do tempo ilumina + scroll horizontal suave
  useEffect(() => {
    if (!star || nodes.length === 0) return;
    const currentIdx = Math.min(nodes.length - 1, Math.max(0, revealedCount - 1));
    const currentNode = nodes[currentIdx];

    if (
      soundEnabled &&
      isPlaying &&
      revealedCount > 1 &&
      lastSoundStepRef.current !== `${sortMode}_${revealedCount}`
    ) {
      lastSoundStepRef.current = `${sortMode}_${revealedCount}`;
      playWalkOfFameTimelineStepSound({
        rating: currentNode?.film?.userRating,
        delta: currentNode?.delta || 0,
      });
    }

    if (isPlaying && activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [star, revealedCount, isPlaying, nodes, soundEnabled, sortMode]);

  if (!star) return null;

  const portraitUrl = resolveWalkMediaUrl(star.activePhotoUrl || star.photoUrl);
  const stageWidth = Math.max(840, STAGE_PAD_X * 2 + Math.max(0, nodes.length - 1) * COL_STEP);
  const visibleNodes = nodes.slice(0, revealedCount);
  const firstX = nodes[0]?.x ?? STAGE_PAD_X;
  const lastX = nodes[nodes.length - 1]?.x ?? stageWidth - STAGE_PAD_X;
  const currentActiveX = visibleNodes[visibleNodes.length - 1]?.x ?? firstX;

  const handleRestart = () => {
    lastSoundStepRef.current = null;
    setRevealedCount(1);
    setIsPlaying(nodes.length > 1);
    if (soundEnabled) {
      playWalkOfFameTimelineOpenSound();
    }
  };

  const handleRevealAll = () => {
    setIsPlaying(false);
    setRevealedCount(nodes.length);
    if (soundEnabled) {
      playWalkOfFameTimelineCompleteSound();
    }
  };

  const handleCloseModal = () => {
    stopAllTrophyAudio();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-2xl flex flex-col overflow-hidden animate-fadeIn"
      onClick={handleCloseModal}
    >
      {/* Brilhos cinemáticos escuros ao fundo */}
      <div className="absolute -top-28 left-1/4 w-[420px] h-[420px] bg-sky-500/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 right-1/4 w-[420px] h-[420px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className="relative z-10 flex flex-col h-full max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =================================================================
            CABEÇALHO + MÉDIA GERAL + CONTROLES
           ================================================================= */}
        <header className="rounded-2xl bg-zinc-950/90 border border-sky-400/35 p-4 flex flex-col gap-3 shadow-2xl shrink-0">
          <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              {portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={star.name}
                  className="w-12 h-12 rounded-full object-cover object-top border-2 border-amber-400 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-amber-400/50 flex items-center justify-center text-2xl shrink-0">
                  {star.icon}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/45 text-sky-200 font-mono text-[10px] font-black uppercase">
                    🎞️ Linha do Tempo Cinemática • 75%+
                  </span>
                  {star.isSimulated && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/45 text-purple-200 font-mono text-[10px] font-black">
                      🧪 PRÉVIA DO LAB
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white truncate mt-0.5">
                  {star.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5 ml-auto flex-wrap">
              {/* Média Geral destacada */}
              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-zinc-900 border border-amber-400/50 flex items-center gap-2.5">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300/90 block">
                    Média Geral (Eixo Central)
                  </span>
                  <span className="font-mono text-base font-black text-white">
                    {overallAverage !== null ? overallAverage.toFixed(2) : '—'}
                    <span className="text-[11px] font-normal text-zinc-400 ml-1">
                      ({orderedFilms.length} filmes)
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled((s) => !s)}
                title={soundEnabled ? 'Silenciar trilha da linha do tempo' : 'Ativar som da linha do tempo'}
                className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  soundEnabled
                    ? 'bg-sky-500/15 border-sky-400/45 text-sky-200 hover:bg-sky-500/25'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                aria-label="Fechar linha do tempo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barra de Modos & Controles de Animação */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/90">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSortMode('watched')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortMode === 'watched'
                    ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>1º Ordem em que Assisti</span>
              </button>
              <button
                type="button"
                onClick={() => setSortMode('release')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortMode === 'release'
                    ? 'bg-sky-400 text-zinc-950 border-sky-300 shadow-lg shadow-sky-500/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>2º Ordem de Lançamento</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (revealedCount >= nodes.length) {
                    handleRestart();
                  } else {
                    setIsPlaying((p) => !p);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  {isPlaying
                    ? 'Pausar'
                    : revealedCount >= nodes.length
                    ? 'Rever Animação'
                    : 'Continuar'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSlowMode((s) => !s)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  slowMode
                    ? 'bg-purple-500/20 border-purple-400/50 text-purple-200'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}
              >
                {slowMode ? '🐢 Devagar' : '⚡ Rápido'}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>

              {revealedCount < nodes.length && (
                <button
                  type="button"
                  onClick={handleRevealAll}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Mostrar Tudo</span>
                </button>
              )}
            </div>
          </div>

          {/* Legenda visual Acima / Abaixo */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> Acima da linha = Nota acima da média (▲)
              </span>
              <span className="inline-flex items-center gap-1 text-rose-300 font-bold">
                <TrendingDown className="w-3.5 h-3.5" /> Abaixo da linha = Nota abaixo da média (▼)
              </span>
            </div>
            <span>
              Progresso:{' '}
              <strong className="text-white">
                {Math.min(revealedCount, nodes.length)} / {nodes.length}
              </strong>{' '}
              filmes
            </span>
          </div>
        </header>

        {/* =================================================================
            PALCO HORIZONTAL RETO + PONTOS DE DATA + OSCILAÇÃO DE NOTA
           ================================================================= */}
        <div className="flex-1 min-h-0 rounded-3xl bg-zinc-950/75 border border-zinc-800/90 shadow-inner flex flex-col justify-center overflow-x-auto overflow-y-auto px-2 py-4">
          {nodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 gap-2 p-8">
              <Sparkles className="w-8 h-8 text-sky-400" />
              <p className="text-sm font-bold text-zinc-200">
                Nenhum filme registrado ainda para traçar a linha do tempo.
              </p>
              <p className="text-xs text-zinc-500">
                Cadastre filmes dessa estrela ou teste com 75%+ / 90%+ no Laboratório de Testes.
              </p>
            </div>
          ) : (
            <div
              className="relative mx-auto shrink-0"
              style={{ width: `${stageWidth}px`, height: `${STAGE_HEIGHT}px` }}
            >
              {/* Camada SVG: Linha Reta Horizontal (Eixo) + Hastes + Curva de Variação de Nota */}
              <svg
                width={stageWidth}
                height={STAGE_HEIGHT}
                viewBox={`0 0 ${stageWidth} ${STAGE_HEIGHT}`}
                className="absolute inset-0 pointer-events-none"
              >
                <defs>
                  <linearGradient id="walkStraightAxisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                {/* Guias horizontais sutis acima e abaixo da média */}
                <line
                  x1={24}
                  y1={AXIS_Y - 125}
                  x2={stageWidth - 24}
                  y2={AXIS_Y - 125}
                  stroke="rgba(52, 211, 153, 0.10)"
                  strokeDasharray="4 8"
                />
                <line
                  x1={24}
                  y1={AXIS_Y + 125}
                  x2={stageWidth - 24}
                  y2={AXIS_Y + 125}
                  stroke="rgba(251, 113, 133, 0.10)"
                  strokeDasharray="4 8"
                />

                {/* Trilho reto completo em background escuro */}
                <line
                  x1={firstX}
                  y1={AXIS_Y}
                  x2={lastX}
                  y2={AXIS_Y}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />

                {/* Trilho reto aceso que avança conforme os filmes aparecem */}
                <line
                  x1={firstX}
                  y1={AXIS_Y}
                  x2={currentActiveX}
                  y2={AXIS_Y}
                  stroke="url(#walkStraightAxisGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ transition: 'x2 0.65s ease-out' }}
                />

                {/* Etiqueta da Média Geral no começo do eixo */}
                <g transform={`translate(18, ${AXIS_Y - 12})`}>
                  <rect
                    width="82"
                    height="24"
                    rx="8"
                    fill="rgba(24,24,27,0.95)"
                    stroke="rgba(251,191,36,0.45)"
                  />
                  <text
                    x="41"
                    y="15"
                    textAnchor="middle"
                    fill="#fde68a"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {overallAverage !== null ? `Média ★${overallAverage.toFixed(1)}` : 'Eixo'}
                  </text>
                </g>

                {/* Curva conectando a oscilação de nota de filme para filme (verde sobe / rosa desce) */}
                {visibleNodes.map((node, idx) => {
                  if (idx === 0) return null;
                  const prev = visibleNodes[idx - 1];
                  const wentUp =
                    node.hasRating && prev.hasRating
                      ? node.film.userRating >= prev.film.userRating
                      : node.isUp;
                  return (
                    <path
                      key={`trend-${node.film.movieId}-${idx}`}
                      d={`M ${prev.x} ${prev.anchorY} C ${prev.x + COL_STEP * 0.45} ${prev.anchorY}, ${node.x - COL_STEP * 0.45} ${node.anchorY}, ${node.x} ${node.anchorY}`}
                      fill="none"
                      stroke={wentUp ? 'rgba(52, 211, 153, 0.55)' : 'rgba(251, 113, 133, 0.55)'}
                      strokeWidth="2.5"
                      strokeDasharray="5 4"
                    />
                  );
                })}

                {/* Hastes verticais saindo de cada ponto de data até o card (para cima ou para baixo) */}
                {visibleNodes.map((node) => (
                  <g key={`stem-${node.film.movieId}-${node.idx}`}>
                    <line
                      x1={node.x}
                      y1={AXIS_Y}
                      x2={node.x}
                      y2={node.anchorY}
                      stroke={
                        node.delta > 0.05
                          ? 'rgba(52, 211, 153, 0.7)'
                          : node.delta < -0.05
                          ? 'rgba(251, 113, 133, 0.7)'
                          : 'rgba(251, 191, 36, 0.65)'
                      }
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={node.x}
                      cy={node.anchorY}
                      r="5"
                      fill={
                        node.delta > 0.05
                          ? '#34d399'
                          : node.delta < -0.05
                          ? '#fb7185'
                          : '#fbbf24'
                      }
                      stroke="#09090b"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>

              {/* Nós (Card Acima/Abaixo + Ponto de Data na Linha Reta Central) */}
              {nodes.map((node) => {
                const { film, idx, x, cardTop, isUp, delta, stepDelta, axisLabel } = node;
                const isRevealed = idx < revealedCount;
                const isCurrent = idx === revealedCount - 1;
                const posterUrl = resolveWalkMediaUrl(film.posterUrl);
                const leftCard = x - CARD_WIDTH / 2;

                return (
                  <React.Fragment key={`${film.movieId}_${idx}`}>
                    {/* Card do Filme (Sobe ou Desce pela variação da nota) */}
                    <div
                      ref={isCurrent ? activeNodeRef : null}
                      style={{
                        left: `${leftCard}px`,
                        top: `${cardTop}px`,
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                      }}
                      className={`absolute rounded-2xl border p-2.5 flex items-center gap-2.5 transition-all duration-500 ${
                        isRevealed
                          ? 'opacity-100 translate-y-0 scale-100'
                          : `opacity-0 ${isUp ? 'translate-y-4' : '-translate-y-4'} scale-95 pointer-events-none`
                      } ${
                        isCurrent
                          ? 'bg-zinc-900 border-amber-300 shadow-[0_0_26px_rgba(251,191,36,0.32)] z-20'
                          : delta > 0.05
                          ? 'bg-zinc-950/95 border-emerald-500/45 shadow-lg z-10'
                          : delta < -0.05
                          ? 'bg-zinc-950/95 border-rose-500/45 shadow-lg z-10'
                          : 'bg-zinc-950/95 border-zinc-700/80 shadow-lg z-10'
                      }`}
                    >
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={film.title}
                          className="w-14 h-[94px] rounded-lg object-cover border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-[94px] rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xl shrink-0">
                          🎬
                        </div>
                      )}

                      <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[9px] font-mono font-bold text-zinc-400">
                              #{String(idx + 1).padStart(2, '0')} • {film.releaseYear || '—'}
                            </span>
                            {stepDelta !== null && stepDelta !== 0 && (
                              <span
                                className={`text-[9px] font-mono font-black ${
                                  stepDelta > 0 ? 'text-emerald-300' : 'text-rose-300'
                                }`}
                                title="Variação em relação ao filme anterior"
                              >
                                {stepDelta > 0 ? `↗+${stepDelta}` : `↘${stepDelta}`}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-black text-white leading-tight line-clamp-2">
                            {film.title}
                          </h4>

                          {film.character && (
                            <p className="text-[9px] text-purple-200/80 truncate mt-0.5">
                              {film.character}
                            </p>
                          )}
                          {star.kind === 'group' &&
                            Array.isArray(film.memberNames) &&
                            film.memberNames.length > 0 && (
                              <p className="text-[8px] font-bold text-amber-300/90 truncate mt-0.5">
                                👥 {film.memberNames.join(' • ')}
                              </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md border font-mono text-[11px] font-black ${ratingBadgeStyle(
                              film.userRating,
                              delta
                            )}`}
                          >
                            {typeof film.userRating === 'number'
                              ? `★ ${film.userRating.toFixed(1)}`
                              : 'Sem Nota'}
                          </span>

                          {typeof film.userRating === 'number' && overallAverage !== null && (
                            <span
                              className={`text-[9px] font-mono font-black ${
                                delta > 0.05
                                  ? 'text-emerald-300'
                                  : delta < -0.05
                                  ? 'text-rose-300'
                                  : 'text-amber-200'
                              }`}
                            >
                              {delta > 0.05
                                ? `▲ +${delta.toFixed(1)}`
                                : delta < -0.05
                                ? `▼ ${delta.toFixed(1)}`
                                : '● Média'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ponto de Data fixo sobre o Eixo Reto Horizontal */}
                    <div
                      style={{
                        left: `${x}px`,
                        top: `${AXIS_Y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`absolute z-30 transition-all duration-500 flex flex-col items-center ${
                        isRevealed ? 'opacity-100 scale-100' : 'opacity-25 scale-90'
                      }`}
                    >
                      <div
                        className={`px-2.5 py-1 rounded-full border font-mono text-[10px] font-black whitespace-nowrap flex items-center gap-1.5 shadow-lg ${
                          isCurrent
                            ? 'bg-amber-400 text-zinc-950 border-white ring-4 ring-amber-400/25'
                            : isRevealed
                            ? 'bg-zinc-950 text-sky-200 border-sky-400/70'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCurrent
                              ? 'bg-zinc-950 animate-ping'
                              : isRevealed
                              ? delta > 0.05
                                ? 'bg-emerald-400'
                                : delta < -0.05
                                ? 'bg-rose-400'
                                : 'bg-amber-300'
                              : 'bg-zinc-600'
                          }`}
                        />
                        <span>{axisLabel}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* =================================================================
            RESUMO FINAL (MAIOR NOTA, MENOR NOTA & MÉDIA GERAL)
           ================================================================= */}
        {orderedFilms.length > 0 && (
          <footer className="rounded-2xl bg-zinc-950/90 border border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-zinc-400">
                Ordem:{' '}
                <strong className="text-white">
                  {sortMode === 'watched' ? 'Ordem em que Assisti' : 'Ordem de Lançamento'}
                </strong>
              </span>
              {highestRatedFilm && (
                <span className="text-emerald-300 font-semibold">
                  ▲ Pico: <strong>{highestRatedFilm.title}</strong> (★
                  {highestRatedFilm.userRating.toFixed(1)})
                </span>
              )}
              {lowestRatedFilm && ratedFilms.length > 1 && lowestRatedFilm.movieId !== highestRatedFilm?.movieId && (
                <span className="text-rose-300 font-semibold">
                  ▼ Piso: <strong>{lowestRatedFilm.title}</strong> (★
                  {lowestRatedFilm.userRating.toFixed(1)})
                </span>
              )}
            </div>

            <span className="font-mono font-black text-amber-300">
              Média Geral: ★ {overallAverage !== null ? overallAverage.toFixed(2) : '—'}
            </span>
          </footer>
        )}
      </div>
    </div>
  );
}
