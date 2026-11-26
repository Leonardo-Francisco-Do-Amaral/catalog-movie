import React, { useRef, useState } from 'react';
import {
  HARLEQUIN_BACKDROPS,
  buildHarlequinFrameGradient,
  createHarlequinBurstParticles,
  getHarlequinSkinById,
  resolveSkinPose,
} from '../data/harlequinSkins';

const STAGE_MOTES = [
  { id: 1, sym: '✦', left: '10%', top: '18%', delay: '0s', size: 'text-sm' },
  { id: 2, sym: '♠', left: '84%', top: '14%', delay: '0.7s', size: 'text-xs' },
  { id: 3, sym: '♦', left: '15%', top: '72%', delay: '1.3s', size: 'text-xs' },
  { id: 4, sym: '♣', left: '86%', top: '68%', delay: '0.4s', size: 'text-sm' },
  { id: 5, sym: '★', left: '50%', top: '8%', delay: '1.8s', size: 'text-xs' },
  { id: 6, sym: '♥', left: '78%', top: '42%', delay: '1.1s', size: 'text-[11px]' },
];

const CLICK_ANIMATION_CLASSES = [
  'harlequin-click-jump-l',
  'harlequin-click-jump-r',
  'harlequin-click-spin',
  'harlequin-click-shake',
];

export function HarlequinAtmosphereLayers({
  backdrop,
  weather = {},
  primaryColor,
  secondaryColor,
  compact = false,
}) {
  const safeBg = backdrop || HARLEQUIN_BACKDROPS.casino_spotlight;
  return (
    <>
      {safeBg.id === 'casino_spotlight' && (
        <div
          className="harlequin-projector-beam pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-[140%] h-[115%] opacity-70"
          style={{
            background:
              'conic-gradient(from 165deg at 50% 0%, transparent 0deg, rgba(251,191,36,0.20) 14deg, rgba(16,185,129,0.16) 24deg, transparent 36deg)',
          }}
        />
      )}

      {safeBg.id === 'magneto_storm' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={`harlequin-magnet-spin rounded-full border-2 border-dashed ${
              compact ? 'w-28 h-28' : 'w-56 h-56 sm:w-64 sm:h-64'
            } opacity-55`}
            style={{ borderColor: '#a855f7', boxShadow: '0 0 24px rgba(168,85,247,0.35)' }}
          />
          <div
            className={`harlequin-magnet-spin-rev absolute rounded-full border ${
              compact ? 'w-20 h-20' : 'w-40 h-40 sm:w-48 sm:h-48'
            } opacity-45`}
            style={{ borderColor: '#ef4444' }}
          />
        </div>
      )}

      {safeBg.id === 'noir_rain' && (
        <>
          <div
            className="pointer-events-none absolute -top-10 right-3 w-36 h-36 rounded-full blur-2xl opacity-45"
            style={{
              background: 'radial-gradient(circle, rgba(212,163,89,0.5) 0%, transparent 72%)',
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </>
      )}

      {safeBg.id === 'holo_vault' && (
        <div
          className="harlequin-holo-foil pointer-events-none absolute inset-0 opacity-45 mix-blend-screen"
          style={{
            backgroundImage:
              'linear-gradient(125deg, rgba(56,189,248,0.35) 0%, rgba(168,85,247,0.35) 35%, rgba(251,191,36,0.35) 70%, rgba(16,185,129,0.35) 100%)',
          }}
        />
      )}

      {safeBg.id === 'sertanejo_dourado' && (
        <>
          <div
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full blur-xl opacity-55 ${
              compact ? 'top-2 w-24 h-24' : 'top-4 w-44 h-44'
            }`}
            style={{
              background:
                'radial-gradient(circle, rgba(253,224,71,0.75) 0%, rgba(245,158,11,0.35) 55%, transparent 75%)',
            }}
          />
          <div
            className="harlequin-projector-beam pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[150%] h-[115%] opacity-55"
            style={{
              background:
                'conic-gradient(from 168deg at 50% 4%, transparent 0deg, rgba(251,191,36,0.22) 15deg, rgba(16,185,129,0.12) 25deg, transparent 36deg)',
            }}
          />
        </>
      )}

      {safeBg.id === 'eclipse_terror' && (
        <>
          <div
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full ${
              compact ? 'top-3 w-20 h-20' : 'top-5 w-36 h-36'
            }`}
            style={{
              background:
                'radial-gradient(circle, #060204 42%, rgba(225,29,72,0.88) 54%, rgba(153,27,27,0.32) 72%, transparent 82%)',
              boxShadow: '0 0 38px rgba(225,29,72,0.55)',
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-rose-950/35 to-transparent" />
        </>
      )}

      {weather?.rain && (
        <>
          <div className="harlequin-rain-layer-b pointer-events-none absolute inset-0 opacity-75" />
          <div className="harlequin-rain-layer-a pointer-events-none absolute inset-0 opacity-85" />
        </>
      )}

      {weather?.fog && (
        <div
          className="harlequin-fog-drift pointer-events-none absolute -bottom-4 -inset-x-8 h-2/5 blur-xl opacity-70"
          style={{
            background:
              'radial-gradient(ellipse at 35% 75%, rgba(148,163,184,0.36) 0%, transparent 65%), radial-gradient(ellipse at 72% 85%, rgba(203,213,225,0.28) 0%, transparent 62%)',
          }}
        />
      )}

      {weather?.lightning && (
        <div
          className="harlequin-lightning-pulse pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 62% 24%, #ffffff 0%, ${primaryColor}99 28%, transparent 68%)`,
          }}
        />
      )}

      {weather?.embers && !compact && (
        <>
          {STAGE_MOTES.map((pt) => (
            <span
              key={pt.id}
              className={`harlequin-mote pointer-events-none absolute ${pt.size} font-black select-none`}
              style={{
                left: pt.left,
                top: pt.top,
                animationDelay: pt.delay,
                color: pt.id % 2 === 0 ? secondaryColor : primaryColor,
                textShadow: `0 0 12px ${primaryColor}`,
              }}
            >
              {pt.sym}
            </span>
          ))}
        </>
      )}
    </>
  );
}

export function HarlequinFrameDecor({ frameId, primaryColor, secondaryColor }) {
  if (frameId === 'noir_deco') {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-2.5 rounded-[14px] border"
          style={{ borderColor: 'rgba(212,163,89,0.5)' }}
        />
        <div className="pointer-events-none absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300/80" />
        <div className="pointer-events-none absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300/80" />
        <div className="pointer-events-none absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300/80" />
        <div className="pointer-events-none absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300/80" />
      </>
    );
  }

  if (frameId === 'magneto_forge') {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-2 rounded-[14px] border border-dashed opacity-55"
          style={{ borderColor: '#c084fc' }}
        />
        <span className="pointer-events-none absolute top-2 left-2.5 text-[10px] font-black text-purple-300/90">
          ⚡ M
        </span>
        <span className="pointer-events-none absolute top-2 right-2.5 text-[10px] font-black text-rose-400/90">
          35MM
        </span>
      </>
    );
  }

  if (frameId === 'cangaco_couro') {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-2 rounded-[14px] border border-dashed opacity-65"
          style={{ borderColor: '#fbbf24' }}
        />
        <span className="pointer-events-none absolute top-1.5 left-2 text-[11px] font-black text-amber-300 drop-shadow">
          ★
        </span>
        <span className="pointer-events-none absolute top-1.5 right-2 text-[11px] font-black text-emerald-300 drop-shadow">
          ☀
        </span>
      </>
    );
  }

  if (frameId === 'slasher_arame') {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-2 rounded-[14px] border border-dashed opacity-70"
          style={{ borderColor: '#ef4444' }}
        />
        <span className="pointer-events-none absolute top-1.5 left-2 text-[10px] font-black text-rose-400 drop-shadow">
          ✕
        </span>
        <span className="pointer-events-none absolute top-1.5 right-2 text-[9px] font-black text-rose-300/90">
          35MM
        </span>
      </>
    );
  }

  if (frameId === 'prism_holo') {
    return (
      <div
        className="harlequin-holo-foil pointer-events-none absolute inset-0 opacity-30 mix-blend-color-dodge"
        style={{
          backgroundImage:
            'linear-gradient(115deg, transparent 20%, rgba(56,189,248,0.6) 40%, rgba(250,204,21,0.55) 55%, rgba(232,121,249,0.6) 70%, transparent 85%)',
        }}
      />
    );
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-2 rounded-[14px] border"
        style={{ borderColor: `${secondaryColor}55` }}
      />
      <span
        className="pointer-events-none absolute top-2 left-2.5 text-[11px] font-black"
        style={{ color: secondaryColor }}
      >
        ♠
      </span>
      <span
        className="pointer-events-none absolute top-2 right-2.5 text-[11px] font-black"
        style={{ color: primaryColor }}
      >
        ♦
      </span>
    </>
  );
}

export function HarlequinAvatarCard({
  skinId = 'magneto',
  poseId = 'neutral',
  backdropId,
  frameId,
  weather,
  viewMode = 'card', // 'card' | 'free' | 'tarot'
  sizeClass = 'w-44 sm:w-52',
  compact = false,
  interactive = true,
  onTap,
  subtitleLabel,
}) {
  const [seq, setSeq] = useState(0);
  const [burst, setBurst] = useState(null);
  const [showTarotBack, setShowTarotBack] = useState(false);
  const cardRef = useRef(null);
  const sheenRef = useRef(null);

  const skin = getHarlequinSkinById(skinId);
  const pose = resolveSkinPose(skin, poseId);
  const bgObj =
    HARLEQUIN_BACKDROPS[backdropId || skin.defaultBackdrop] ||
    HARLEQUIN_BACKDROPS.casino_spotlight;
  const activeFrameId = frameId || skin.defaultFrame || 'velvet_casino';
  const activeWeather = weather || bgObj.defaultWeather || { embers: true };
  const primaryColor = bgObj.accent || skin.themeColor;

  const handleClick = () => {
    if (!interactive) return;
    if (viewMode === 'tarot') {
      setShowTarotBack((v) => !v);
      onTap?.(seq + 1, { tarotFlipped: !showTarotBack });
      return;
    }

    const nextSeq = seq + 1;
    setSeq(nextSeq);
    const animClass =
      nextSeq % 4 === 0
        ? 'harlequin-click-spin'
        : nextSeq % 2 === 0
        ? 'harlequin-click-jump-l'
        : 'harlequin-click-jump-r';

    if (cardRef.current) {
      cardRef.current.classList.remove(...CLICK_ANIMATION_CLASSES);
      void cardRef.current.offsetWidth;
      cardRef.current.classList.add(animClass);
    }
    if (sheenRef.current) {
      sheenRef.current.classList.remove('harlequin-sheen-sweep');
      void sheenRef.current.offsetWidth;
      sheenRef.current.classList.add('harlequin-sheen-sweep');
    }

    setBurst({
      id: nextSeq,
      particles: createHarlequinBurstParticles(skin.id),
    });
    onTap?.(nextSeq);
  };

  const renderCardBody = () => {
    if (viewMode === 'tarot') {
      return (
        <div
          className={`relative ${sizeClass} aspect-[2/3] rounded-[20px] p-[3px] shadow-2xl`}
          style={{
            background: buildHarlequinFrameGradient('prism_holo', '#a855f7', '#fbbf24'),
            boxShadow: '0 18px 42px rgba(0,0,0,0.9), 0 0 28px rgba(168,85,247,0.42)',
          }}
        >
          <img
            src={showTarotBack ? '/tarot/Verso.png' : '/tarot/0.jpg'}
            alt="Carta O Louco"
            className="w-full h-full object-cover rounded-[17px]"
          />
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-amber-300/50 text-[8.5px] font-black text-amber-200">
            {showTarotBack ? 'VERSO' : 'ARCANO 0'}
          </span>
        </div>
      );
    }

    if (viewMode === 'free') {
      return (
        <div className={`relative ${sizeClass} aspect-[2/3] flex items-center justify-center`}>
          <div className="absolute inset-2 rounded-2xl overflow-hidden opacity-80">
            <HarlequinAtmosphereLayers
              backdrop={bgObj}
              weather={activeWeather}
              primaryColor={primaryColor}
              secondaryColor={skin.secondaryColor}
              compact={compact}
            />
          </div>
          <img
            src={pose.image}
            alt={skin.name}
            className="relative z-10 w-full h-full object-contain transition-transform duration-300 hover:scale-[1.03]"
            style={{
              filter: `drop-shadow(0 16px 24px rgba(0,0,0,0.95)) drop-shadow(0 0 20px ${primaryColor}66)`,
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={`relative ${sizeClass} aspect-[2/3] rounded-[22px] p-[3px] shadow-2xl transition-transform duration-300 hover:scale-[1.03] ${
          activeFrameId === 'prism_holo' ? 'harlequin-holo-foil' : ''
        }`}
        style={{
          background: buildHarlequinFrameGradient(activeFrameId, primaryColor, skin.secondaryColor),
          boxShadow: `0 20px 48px rgba(0,0,0,0.9), 0 0 30px ${primaryColor}40`,
        }}
      >
        <div
          className="relative w-full h-full rounded-[19px] overflow-hidden flex items-center justify-center"
          style={{ background: bgObj.cardBg }}
        >
          <HarlequinAtmosphereLayers
            backdrop={bgObj}
            weather={activeWeather}
            primaryColor={primaryColor}
            secondaryColor={skin.secondaryColor}
            compact={compact}
          />
          <img
            src={pose.image}
            alt={skin.name}
            className="relative z-10 w-full h-full object-contain"
            style={{
              filter: `drop-shadow(0 10px 16px rgba(0,0,0,0.9)) drop-shadow(0 0 12px ${primaryColor}40)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[19px]">
            <div
              ref={sheenRef}
              className="w-1/2 h-full opacity-0"
              style={{
                background:
                  'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.58) 48%, rgba(255,255,255,0.12) 70%, transparent 100%)',
              }}
            />
          </div>
          <div className="relative z-20 pointer-events-none">
            <HarlequinFrameDecor
              frameId={activeFrameId}
              primaryColor={primaryColor}
              secondaryColor={skin.secondaryColor}
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-2.5 py-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-center">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-white truncate block">
              {subtitleLabel || skin.name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ perspective: '900px' }}>
      {burst && (
        <div
          key={burst.id}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        >
          {burst.particles.map((p) => (
            <span
              key={p.id}
              className="harlequin-particle-burst absolute top-1/2 left-1/2 text-base font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
              style={{
                color: p.sym === '♪' || p.sym === '★' ? '#fbbf24' : primaryColor,
                '--tx': p.tx,
                '--ty': p.ty,
                '--rot': p.rot,
                animationDelay: p.delay,
              }}
            >
              {p.sym}
            </span>
          ))}
        </div>
      )}

      <div
        ref={cardRef}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`harlequin-levitate select-none focus:outline-none ${
          interactive ? 'cursor-pointer' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {renderCardBody()}
      </div>
    </div>
  );
}
