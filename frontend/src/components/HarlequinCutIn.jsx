import React, { useEffect } from 'react';

/**
 * Simulador leve em CSS puro de Cut-In estilo Anime / Mangá (Persona / RPG).
 * Com os PNGs transparentes, renderiza o recorte dos olhos direto sobre fundo sombrio estilizado + auras e clima.
 */
export default function HarlequinCutIn({
  cutIn,
  onClose,
  durationMs = 1850,
}) {
  const cutInKey = cutIn?.key || null;

  useEffect(() => {
    if (!cutInKey) return undefined;
    const timer = window.setTimeout(() => {
      onClose?.();
    }, durationMs);
    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [cutInKey, durationMs, onClose]);

  if (!cutIn) return null;

  const {
    skin,
    image,
    cutInPosition = '50% 18%',
    cutInScale = 2.1,
    title = 'ARLEQUIM EM CENA!',
    badge = 'EVENTO ESPECIAL',
    dialogue = '',
    flashTone,
    weather = {},
  } = cutIn;

  const primaryColor = flashTone || skin?.themeColor || '#10b981';
  const secondaryColor = skin?.secondaryColor || '#fbbf24';

  return (
    <div
      key={cutInKey}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => onClose?.()}
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/78 backdrop-blur-[2px] cursor-pointer select-none"
    >
      {/* Flash rápido de impacto na tela */}
      <div
        className="harlequin-cutin-flash pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, #ffffff 0%, ${primaryColor} 45%, transparent 85%)`,
        }}
      />

      {/* Faixa diagonal dramática estilo anime/mangá */}
      <div
        className="harlequin-cutin-band relative w-[108vw] -skew-y-2 border-y-[3px] shadow-[0_24px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        style={{
          borderColor: primaryColor,
          background: `linear-gradient(105deg, #050508 0%, #101018 46%, ${primaryColor}38 100%)`,
          boxShadow: `0 0 60px ${primaryColor}66, inset 0 0 40px rgba(0,0,0,0.9)`,
        }}
      >
        {/* Linhas de velocidade animadas */}
        <div
          className="harlequin-cutin-speedlines pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -14deg,
              transparent 0px,
              transparent 16px,
              ${primaryColor}45 16px,
              ${primaryColor}45 18px,
              transparent 18px,
              transparent 34px,
              rgba(255,255,255,0.22) 34px,
              rgba(255,255,255,0.22) 35px
            )`,
          }}
        />

        {weather?.rain && (
          <div className="harlequin-rain-layer-a pointer-events-none absolute inset-0 opacity-55" />
        )}

        {/* Conteúdo interno desentortado sutilmente para leitura nítida */}
        <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-8 flex flex-row items-stretch h-[170px] sm:h-[228px] skew-y-2">
          {/* Painel esquerdo com recorte zoom focado nos olhos sobre fundo escuro com aura rim-light */}
          <div
            className="relative w-[156px] sm:w-[276px] md:w-[328px] h-full shrink-0 overflow-hidden border-r-[3px]"
            style={{
              borderColor: secondaryColor,
              background: `radial-gradient(circle at 46% 52%, ${primaryColor}52 0%, #12101a 58%, #050508 100%)`,
              clipPath: 'polygon(0 0, 100% 0, 86% 100%, 0 100%)',
              boxShadow: `8px 0 32px ${primaryColor}88`,
            }}
          >
            <img
              src={image}
              alt={skin?.name || 'Arlequim'}
              className="harlequin-cutin-portrait w-full h-full object-cover"
              style={{
                objectPosition: cutInPosition,
                transformOrigin: cutInPosition,
                '--cutin-scale': cutInScale,
                filter: `drop-shadow(0 0 16px ${primaryColor}) drop-shadow(0 6px 14px rgba(0,0,0,0.9))`,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 25%, transparent 72%, rgba(0,0,0,0.6) 100%)`,
              }}
            />
          </div>

          {/* Faixa direita: Badge + Título Explosivo + Fala da Skin */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 sm:gap-2 pl-2 pr-4 sm:pl-6 sm:pr-8 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-sm text-[9px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-zinc-950 shadow-lg"
                style={{ backgroundColor: secondaryColor }}
              >
                {badge}
              </span>
              {skin?.name && (
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-300">
                  {skin.name}
                </span>
              )}
            </div>

            <h2
              className="text-lg sm:text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white leading-none drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]"
              style={{
                textShadow: `0 0 24px ${primaryColor}`,
              }}
            >
              {title}
            </h2>

            {dialogue && (
              <p
                className="text-[11px] sm:text-sm md:text-base font-semibold italic text-zinc-100/95 line-clamp-2 border-l-2 pl-2.5 max-w-2xl drop-shadow"
                style={{ borderColor: primaryColor }}
              >
                “{dialogue}”
              </p>
            )}

            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400/90 mt-0.5">
              Toque em qualquer lugar para fechar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
