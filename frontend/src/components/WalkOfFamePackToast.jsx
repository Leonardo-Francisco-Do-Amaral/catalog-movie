import React, { useEffect, useRef } from 'react';
import { Gift, X, Lock } from 'lucide-react';
import { playWalkOfFameLockUnlockSound } from '../utils/trophyAudio';

export default function WalkOfFamePackToast({
  packs = [],
  onDismiss,
}) {
  const lastPlayedKeyRef = useRef(null);

  const first = Array.isArray(packs) && packs.length > 0 ? packs[0] : null;
  const count = Array.isArray(packs) ? packs.length : 0;

  useEffect(() => {
    if (!first) {
      lastPlayedKeyRef.current = null;
      return;
    }
    const key = `${first.packId || ''}_${first.packType || ''}_${count}_${
      first.isDemo ? 'demo' : 'real'
    }`;
    if (lastPlayedKeyRef.current === key) return;
    lastPlayedKeyRef.current = key;

    try {
      playWalkOfFameLockUnlockSound({ isFinal: false });
    } catch {
      // ignora erro de áudio caso o navegador bloqueie antes da interação
    }
  }, [first, count]);

  useEffect(() => {
    if (!first) return undefined;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 6500);
    return () => clearTimeout(timer);
  }, [first, count, onDismiss]);

  if (!first) return null;

  const headline =
    count > 1
      ? `Você tem ${count} pacotes aguardando no Álbum!`
      : 'Você tem um pacote aguardando no Álbum!';

  const subline =
    count > 1
      ? 'Confira o contador na aba 📖 Álbum da Fama no topo para abrir um por vez (sem spoilers!).'
      : 'Confira o contador na aba 📖 Álbum da Fama no topo para revelar quem saiu e resgatar o XP!';

  return (
    <div
      className="fixed bottom-5 left-5 z-[9850] max-w-xs sm:max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl p-[2px] animate-fadeIn transition-all"
      style={{
        background:
          'linear-gradient(135deg, rgba(253,224,71,0.9), rgba(245,158,11,0.85), rgba(244,63,94,0.8), rgba(56,189,248,0.85))',
        boxShadow: '0 14px 40px rgba(245,158,11,0.28)',
      }}
    >
      <div className="rounded-[14px] bg-zinc-950/95 backdrop-blur-xl p-3.5 relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-14 opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(251,191,36,0.9), transparent 70%)',
          }}
        />

        <div className="relative z-10 flex items-start gap-3">
          {/* Envelope / Pacote Secreto Sem Spoiler */}
          <div className="relative w-11 h-12 rounded-xl border border-amber-300/45 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 shrink-0 shadow-lg flex flex-col items-center justify-center gap-0.5 overflow-hidden">
            <Gift className="w-4 h-4 text-amber-300 animate-bounce" />
            <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-black text-amber-200/90">
              <Lock className="w-2.5 h-2.5" />
              ???
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider font-mono text-amber-300 truncate">
                  📖 Álbum da Fama
                </span>
                {first.isDemo && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-[8px] font-mono font-black text-cyan-200 uppercase shrink-0">
                    Simulação
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-0.5"
                title="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-black text-white leading-tight mt-0.5">{headline}</p>
            <p className="text-[11px] text-zinc-300 leading-snug mt-1">{subline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
