import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Disc3, Music2, Pause, Play, Square, VolumeX, X } from 'lucide-react';
import { isAudioMuted } from '../utils/trophyAudio';
import {
  UNIVERSE_MUSIC_PLAY_EVENT,
  UNIVERSE_MUSIC_STOP_EVENT,
  encodeAudioUrl,
} from '../utils/universeAudio';

const TIER_ACCENTS = {
  mythic: {
    border: 'border-fuchsia-400/50',
    glow: 'shadow-[0_12px_40px_rgba(192,38,211,0.32)]',
    badge: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40',
    progress: 'from-fuchsia-400 via-amber-300 to-cyan-400',
    iconBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
    playBtn: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
    label: 'Mítico',
  },
  gold: {
    border: 'border-amber-400/50',
    glow: 'shadow-[0_12px_40px_rgba(245,158,11,0.28)]',
    badge: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    progress: 'from-amber-400 to-yellow-300',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    playBtn: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    label: 'Ouro',
  },
  epic: {
    border: 'border-violet-400/50',
    glow: 'shadow-[0_12px_40px_rgba(139,92,246,0.28)]',
    badge: 'bg-violet-500/20 text-violet-200 border-violet-400/40',
    progress: 'from-violet-400 to-fuchsia-400',
    iconBg: 'bg-violet-500/20 text-violet-300 border-violet-400/40',
    playBtn: 'bg-violet-500 hover:bg-violet-400 text-white',
    label: 'Épico',
  },
  silver: {
    border: 'border-slate-300/45',
    glow: 'shadow-[0_12px_36px_rgba(148,163,184,0.24)]',
    badge: 'bg-slate-400/20 text-slate-100 border-slate-300/40',
    progress: 'from-slate-200 to-cyan-300',
    iconBg: 'bg-slate-400/20 text-slate-200 border-slate-300/40',
    playBtn: 'bg-slate-200 hover:bg-white text-slate-950',
    label: 'Prata',
  },
  bronze: {
    border: 'border-orange-400/50',
    glow: 'shadow-[0_12px_36px_rgba(234,88,12,0.26)]',
    badge: 'bg-orange-500/20 text-orange-200 border-orange-400/40',
    progress: 'from-orange-400 to-amber-400',
    iconBg: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    playBtn: 'bg-orange-400 hover:bg-orange-300 text-slate-950',
    label: 'Bronze',
  },
};

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function UniverseMusicPlayer() {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [globalMuted, setGlobalMuted] = useState(() => isAudioMuted());
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef(null);

  const disposeAudio = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    try {
      el.onloadedmetadata = null;
      el.ontimeupdate = null;
      el.onended = null;
      el.onerror = null;
      el.pause();
      el.currentTime = 0;
    } catch {
      // Ignora erro ao encerrar elemento de áudio anterior
    }
    audioRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    disposeAudio();
    setTrack(null);
    setIsPlaying(false);
    setHasEnded(false);
    setCurrentTime(0);
    setDuration(0);
    setAutoplayBlocked(false);
  }, [disposeAudio]);

  const handleStopTrack = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        // Ignora erro ao zerar faixa
      }
    }
    setIsPlaying(false);
    setHasEnded(false);
    setCurrentTime(0);
  }, []);

  const handleTogglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }

    if (hasEnded || (duration > 0 && el.currentTime >= duration - 0.15)) {
      el.currentTime = 0;
      setCurrentTime(0);
    }

    el.muted = false;
    setAutoplayBlocked(false);
    setHasEnded(false);
    el.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
        setAutoplayBlocked(true);
      });
  }, [duration, hasEnded, isPlaying]);

  const handleSeek = useCallback(
    (e) => {
      const el = audioRef.current;
      if (!el || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
      const target = ratio * duration;
      el.currentTime = target;
      setCurrentTime(target);
      setHasEnded(false);
    },
    [duration]
  );

  useEffect(() => {
    const onPlayTrack = (e) => {
      const detail = e?.detail;
      if (!detail?.url) return;

      disposeAudio();

      const mutedNow = isAudioMuted();
      setGlobalMuted(mutedNow);
      setHasEnded(false);
      setCurrentTime(0);
      setDuration(0);
      setAutoplayBlocked(false);
      setTrack(detail);

      const src = detail.encodedUrl || encodeAudioUrl(detail.url);
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.72;
      audio.muted = mutedNow;

      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime || 0);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setHasEnded(true);
        if (Number.isFinite(audio.duration)) {
          setCurrentTime(audio.duration);
        }
      };

      audio.onerror = () => {
        setIsPlaying(false);
      };

      audioRef.current = audio;

      if (mutedNow) {
        setIsPlaying(false);
        return;
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setAutoplayBlocked(true);
        });
    };

    const onStopPlayer = () => {
      handleClose();
    };

    const onMuteChange = (e) => {
      const muted = Boolean(e?.detail?.muted);
      setGlobalMuted(muted);
      const el = audioRef.current;
      if (!el) return;
      el.muted = muted;
      if (muted) {
        el.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener(UNIVERSE_MUSIC_PLAY_EVENT, onPlayTrack);
    window.addEventListener(UNIVERSE_MUSIC_STOP_EVENT, onStopPlayer);
    window.addEventListener('cine-audio-mute-change', onMuteChange);

    return () => {
      window.removeEventListener(UNIVERSE_MUSIC_PLAY_EVENT, onPlayTrack);
      window.removeEventListener(UNIVERSE_MUSIC_STOP_EVENT, onStopPlayer);
      window.removeEventListener('cine-audio-mute-change', onMuteChange);
      disposeAudio();
    };
  }, [disposeAudio, handleClose]);

  if (!track) return null;

  const tierKey = String(track.tier || 'gold').toLowerCase();
  const accent = TIER_ACCENTS[tierKey] || TIER_ACCENTS.gold;
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const playerNode = (
    <aside
      aria-label="Player de Trilha do Universo"
      className={`fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-[10020] w-[calc(100vw-1.5rem)] sm:w-[348px] rounded-2xl border ${accent.border} bg-zinc-950/92 backdrop-blur-xl ${accent.glow} text-zinc-100 p-3.5 transition-all`}
    >
      {/* Topo: Disco Animado + Origem do Universo + Botão Fechar */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl border ${accent.iconBg} flex items-center justify-center shrink-0`}
          >
            <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${accent.badge}`}>
                {track.entityType === 'mega_saga' ? 'Mega-Saga' : accent.label}
              </span>
              {track.universeTitle && (
                <span className="text-[10px] font-semibold text-zinc-400 truncate">
                  {track.universeIcon ? `${track.universeIcon} ` : ''}
                  {track.universeTitle}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1.5 min-w-0">
              <Music2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <p className="text-xs font-extrabold text-white truncate" title={track.title}>
                {track.title}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          title="Fechar player e parar música"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Progresso Clicável + Tempo */}
      <div className="mt-3 space-y-1.5">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Progresso da música"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(currentTime || 0)}
          onClick={handleSeek}
          onKeyDown={(e) => {
            if (!audioRef.current || !duration) return;
            if (e.key === 'ArrowRight') {
              audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
            } else if (e.key === 'ArrowLeft') {
              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
            }
          }}
          className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden cursor-pointer group"
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${accent.progress} transition-[width] duration-150`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[9px] uppercase tracking-wider font-sans font-bold text-zinc-500">
            {globalMuted ? (
              <span className="inline-flex items-center gap-1 text-amber-400">
                <VolumeX className="w-3 h-3" /> Áudio silenciado
              </span>
            ) : autoplayBlocked ? (
              <span className="text-amber-300">Clique em Tocar</span>
            ) : hasEnded ? (
              'Concluída'
            ) : isPlaying ? (
              'Tocando no site'
            ) : (
              'Parado'
            )}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controles Simples: Tocar/Pausar, Parar e Fechar */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${accent.playBtn}`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pausar' : hasEnded ? 'Ouvir de Novo' : 'Tocar'}</span>
        </button>

        <button
          type="button"
          onClick={handleStopTrack}
          title="Parar música e voltar ao início"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/12 text-zinc-200 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Square className="w-3 h-3 fill-current" />
          <span>Parar</span>
        </button>

        <button
          type="button"
          onClick={handleClose}
          title="Parar e fechar player"
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Fechar</span>
        </button>
      </div>
    </aside>
  );

  if (typeof document !== 'undefined') {
    return createPortal(playerNode, document.body);
  }
  return playerNode;
}
