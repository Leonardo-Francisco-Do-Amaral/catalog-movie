import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, MessageSquareQuote } from 'lucide-react';
import {
  HARLEQUIN_BACKDROPS,
  HARLEQUIN_BUBBLE_STYLES,
  buildHarlequinFrameGradient,
  getHarlequinSkinById,
  resolveSkinPose,
  parseColoredDialogueSegments,
} from '../data/harlequinSkins';
import { playHarlequinVoiceBlip } from '../utils/harlequinAudio';

export function ColoredTypewriterText({ segments, maxChars }) {
  let remaining = maxChars;
  return segments.map((seg, idx) => {
    if (remaining <= 0) return null;
    const take = seg.text.slice(0, remaining);
    remaining -= take.length;
    if (!seg.color) {
      return <React.Fragment key={idx}>{take}</React.Fragment>;
    }
    return (
      <span
        key={idx}
        className="font-black"
        style={{
          color: seg.color,
          textShadow: `0 0 12px ${seg.color}70`,
        }}
      >
        {take}
      </span>
    );
  });
}

const CLICK_CLASSES = [
  'harlequin-click-jump-l',
  'harlequin-click-jump-r',
  'harlequin-click-spin',
  'harlequin-click-shake',
];

function getMoodChipTone(polarity) {
  if (polarity === 'happy') {
    return 'bg-emerald-950/95 border-emerald-400/80 text-emerald-100 shadow-[0_6px_18px_rgba(16,185,129,0.45)]';
  }
  if (polarity === 'sad') {
    return 'bg-rose-950/95 border-rose-400/80 text-rose-100 shadow-[0_6px_18px_rgba(244,63,94,0.4)]';
  }
  if (polarity === 'chaos') {
    return 'bg-fuchsia-950/95 border-fuchsia-300/85 text-fuchsia-100 shadow-[0_6px_18px_rgba(217,70,239,0.45)]';
  }
  return 'bg-zinc-900/95 border-amber-300/70 text-amber-100 shadow-[0_6px_18px_rgba(245,158,11,0.3)]';
}

function resolveMotionClass(motion, clickSeq) {
  if (motion === 'none') return null;
  if (motion === 'spin') return 'harlequin-click-spin';
  if (motion === 'shake') return 'harlequin-click-shake';
  return clickSeq % 2 === 0 ? 'harlequin-click-jump-l' : 'harlequin-click-jump-r';
}

export default function HarlequinCompanionPopup({
  event,
  soundEnabled = true,
  autoCloseMs = 10000,
  onDismiss,
}) {
  const [typedProgress, setTypedProgress] = useState({ key: '', count: 0 });

  const cardRef = useRef(null);
  const sheenRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  const clickSeqRef = useRef(0);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const skin = useMemo(() => getHarlequinSkinById(event?.skinId || 'classic'), [event?.skinId]);
  const poseInfo = useMemo(
    () => resolveSkinPose(skin, event?.poseId || 'neutral'),
    [skin, event?.poseId]
  );
  const bubbleTheme =
    event?.bubbleTheme || HARLEQUIN_BUBBLE_STYLES[skin.id] || HARLEQUIN_BUBBLE_STYLES.classic;
  const backdrop =
    HARLEQUIN_BACKDROPS[event?.backdropId || skin.defaultBackdrop] ||
    HARLEQUIN_BACKDROPS.casino_spotlight;

  const rawText = event?.dialogue || '';
  const dialogueSegments = useMemo(() => parseColoredDialogueSegments(rawText), [rawText]);
  const plainText = useMemo(
    () => dialogueSegments.map((seg) => seg.text).join(''),
    [dialogueSegments]
  );
  const activeKey = event?.key || '';
  const typedLength = typedProgress.key === activeKey ? typedProgress.count : 0;
  const isTyping = typedLength < plainText.length;

  // Dispara pulo inicial + sheen e efeito typewriter ao receber um novo evento
  useEffect(() => {
    if (!activeKey) return undefined;

    clickSeqRef.current += 1;
    const animClass = resolveMotionClass(event.motion, clickSeqRef.current);

    if (cardRef.current) {
      cardRef.current.classList.remove(...CLICK_CLASSES);
      if (animClass) {
        void cardRef.current.offsetWidth;
        cardRef.current.classList.add(animClass);
      }
    }
    if (sheenRef.current && !event?.emotional) {
      sheenRef.current.classList.remove('harlequin-sheen-sweep');
      void sheenRef.current.offsetWidth;
      sheenRef.current.classList.add('harlequin-sheen-sweep');
    }

    let idx = 0;
    let visibleChars = 0;
    const charSpeedMs = event?.emotional ? 34 : 24;
    const timer = window.setInterval(() => {
      idx += 1;
      const ch = plainText[idx - 1];
      setTypedProgress({ key: activeKey, count: idx });

      if (ch && ch.trim()) {
        visibleChars += 1;
        if (visibleChars % 2 === 1 && soundEnabledRef.current && !event?.silentSound) {
          playHarlequinVoiceBlip(skin.id, visibleChars, event.soundMood || 'neutral', false);
        }
      }

      if (idx >= plainText.length) {
        window.clearInterval(timer);
      }
    }, charSpeedMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeKey, plainText, event?.motion, event?.soundMood, event?.emotional, event?.silentSound, skin.id]);

  // Auto-fecha suavemente depois do tempo limite (pausa se o mouse estiver em cima)
  useEffect(() => {
    if (!event?.key || !autoCloseMs || autoCloseMs <= 0) return undefined;
    const timeout = window.setTimeout(() => {
      onDismiss?.();
    }, autoCloseMs);
    return () => window.clearTimeout(timeout);
  }, [event?.key, autoCloseMs, onDismiss]);

  if (!event) return null;

  return (
    <div
      key={event.key}
      role="status"
      aria-live="polite"
      className="harlequin-popup-enter fixed bottom-4 left-3 sm:bottom-5 sm:left-5 z-[9990] w-[calc(100vw-1.5rem)] max-w-[395px] pointer-events-auto select-none"
    >
      <div className="flex items-end gap-2.5 sm:gap-3">
        {/* Busto / Retrato */}
        <div className="relative shrink-0" style={{ perspective: '900px' }}>
          {event.moodChip && (
            <div
              key={`${event.key}_chip`}
              className={`harlequin-mood-chip pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap px-2 py-0.5 rounded-full border text-[10px] font-black tracking-wide ${getMoodChipTone(
                event.moodPolarity
              )}`}
            >
              {event.moodChip}
            </div>
          )}

          <div
            ref={cardRef}
            aria-label={`Retrato de ${skin.name}`}
            className="focus:outline-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={isTyping && !event?.emotional ? 'harlequin-talking-bob' : ''}>
              <div
                className="relative w-[78px] h-[106px] sm:w-[88px] sm:h-[118px] rounded-2xl p-[2.5px] shadow-[0_18px_40px_rgba(0,0,0,0.85)]"
                style={{
                  background: event?.frameId
                    ? buildHarlequinFrameGradient(
                        event.frameId,
                        bubbleTheme.accent,
                        bubbleTheme.border
                      )
                    : `linear-gradient(155deg, ${bubbleTheme.accent}, ${bubbleTheme.border}, #09090b)`,
                  boxShadow: `0 14px 32px rgba(0,0,0,0.85), 0 0 22px ${bubbleTheme.border}44`,
                }}
              >
                <div
                  className="relative w-full h-full rounded-[13px] overflow-hidden"
                  style={{ background: backdrop.cardBg }}
                >
                  <img
                    src={poseInfo.image}
                    alt={skin.name}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: poseInfo.bustCrop.objectPos,
                      transform: `scale(${poseInfo.bustCrop.scale})`,
                      transformOrigin: poseInfo.bustCrop.origin,
                    }}
                  />

                  {/* Brilho diagonal ao aparecer / clicar */}
                  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[13px]">
                    <div
                      ref={sheenRef}
                      className="w-1/2 h-full opacity-0"
                      style={{
                        background:
                          'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.58) 48%, rgba(255,255,255,0.12) 70%, transparent 100%)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balão de Fala com Visual Único por Personalidade */}
        <div
          onClick={() => {
            if (isTyping) setTypedProgress({ key: activeKey, count: plainText.length });
          }}
          className={`relative flex-1 min-w-0 rounded-2xl border p-3 sm:p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.88)] overflow-hidden ${
            isTyping ? 'cursor-pointer' : ''
          } ${bubbleTheme.fontClass}`}
          style={{
            background: bubbleTheme.bg,
            borderColor: `${bubbleTheme.border}aa`,
            boxShadow: `0 16px 40px rgba(0,0,0,0.88), 0 0 24px ${bubbleTheme.border}28`,
          }}
        >
          {/* Marca d'água sutil da skin */}
          <span
            className="pointer-events-none absolute bottom-1 right-2.5 text-[10px] font-black tracking-[0.22em] opacity-15"
            style={{ color: bubbleTheme.accent }}
          >
            {bubbleTheme.watermark}
          </span>

          {/* Cabeçalho do Balão */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span
                className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border truncate"
                style={{
                  borderColor: `${bubbleTheme.border}88`,
                  color: bubbleTheme.accent,
                  background: 'rgba(0,0,0,0.48)',
                }}
              >
                {bubbleTheme.tag}
              </span>
              {event.contextBadge && (
                <span className="text-[9px] font-mono font-bold text-zinc-400 truncate">
                  {event.contextBadge}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.();
              }}
              aria-label="Fechar fala do Arlequim"
              className="shrink-0 p-1 rounded-lg bg-black/40 hover:bg-black/75 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fala em Typewriter */}
          <div className="relative z-10 flex items-start gap-2 min-h-[2.7rem]">
            <MessageSquareQuote
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: bubbleTheme.subAccent }}
            />
            <p className="text-[12px] sm:text-[12.5px] leading-relaxed text-zinc-100">
              “<ColoredTypewriterText segments={dialogueSegments} maxChars={typedLength} />
              {isTyping && (
                <span
                  className="harlequin-cursor-blink inline-block w-1.5 h-3.5 ml-0.5 align-middle rounded-[1px]"
                  style={{ backgroundColor: bubbleTheme.accent }}
                />
              )}
              {!isTyping ? '”' : ''}
            </p>
          </div>

          {/* Rodapé */}
          <div className="relative z-10 mt-1.5 flex items-center justify-between text-[9.5px] text-zinc-400/85">
            <span>Companheiro da Guilda</span>
            <span className="font-mono">💬 Balatro UI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
