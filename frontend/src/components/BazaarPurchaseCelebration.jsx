import React, { useEffect, useMemo } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import {
  GUILD_BAZAAR_RARITIES,
  HARLEQUIN_BACKDROPS,
  HARLEQUIN_BUBBLE_STYLES,
  HARLEQUIN_FRAMES,
  buildHarlequinFrameGradient,
  parseColoredDialogueSegments,
} from '../data/harlequinSkins';
import { ColoredTypewriterText } from './HarlequinCompanionPopup';
import {
  HarlequinAtmosphereLayers,
  HarlequinAvatarCard,
  HarlequinFrameDecor,
} from './HarlequinAvatarVisuals';
import { getXpBarSkinMeta } from '../data/xpBarSkins';
import { playShopPurchaseFanfare } from '../utils/harlequinAudio';

const CELEBRATION_BURST_SPOTS = Array.from({ length: 14 }, (_, idx) => {
  const angle = (idx / 14) * Math.PI * 2;
  const dist = 120 + (idx % 3) * 42;
  return {
    id: idx,
    sym: idx % 3 === 0 ? '🪙' : idx % 3 === 1 ? '✦' : '★',
    bx: `${Math.round(Math.cos(angle) * dist)}px`,
    by: `${Math.round(Math.sin(angle) * dist)}px`,
    brot: `${(idx % 2 === 0 ? 1 : -1) * 220}deg`,
    delay: `${idx * 25}ms`,
  };
});

export default function BazaarPurchaseCelebration({
  result, // { item, grantedSummary, soundEnabled }
  onEquipNow,
  onClose,
}) {
  const item = result?.item;
  const soundEnabled = result?.soundEnabled !== false;

  useEffect(() => {
    if (!item) return;
    playShopPurchaseFanfare(item.rarity || 'epic', !soundEnabled);
  }, [item, soundEnabled]);

  useEffect(() => {
    if (!item) return undefined;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [item, onClose]);

  const merchantSegments = useMemo(
    () => parseColoredDialogueSegments(item?.afterBuyLine || ''),
    [item?.afterBuyLine]
  );

  if (!item) return null;

  const rar = GUILD_BAZAAR_RARITIES[item.rarity] || GUILD_BAZAAR_RARITIES.epic;
  const isCosmetic = ['skin', 'backdrop', 'frame', 'bubble', 'xp_bar'].includes(item.kind);

  const renderShowcase = () => {
    if (item.kind === 'xp_bar') {
      const xpSkin = getXpBarSkinMeta(item.targetId);
      return (
        <div
          className="w-56 rounded-2xl border-2 p-4 bg-zinc-950/95 shadow-2xl flex flex-col items-center gap-3"
          style={{
            borderColor: xpSkin.previewAccent,
            boxShadow: `0 18px 42px rgba(0,0,0,0.9), 0 0 28px ${xpSkin.previewAccent}55`,
          }}
        >
          <span className="text-4xl">{xpSkin.icon}</span>
          <div className="text-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-amber-200/80">
              BARRA DE XP
            </div>
            <div className="text-xs font-black text-white">{xpSkin.name}</div>
          </div>
          <div className={`w-full h-3.5 rounded-full overflow-hidden border p-0.5 ${xpSkin.trackClass}`}>
            <div
              className={`h-full rounded-full ${xpSkin.barClass}`}
              style={{ width: '78%', boxShadow: xpSkin.glowStyle }}
            />
          </div>
        </div>
      );
    }
    if (item.kind === 'skin') {
      return (
        <HarlequinAvatarCard
          skinId={item.targetId}
          sizeClass="w-40 sm:w-44"
          interactive={false}
        />
      );
    }
    if (item.kind === 'backdrop') {
      const bg = HARLEQUIN_BACKDROPS[item.targetId] || HARLEQUIN_BACKDROPS.casino_spotlight;
      const bgAccent = bg.accent || rar.glowColor;
      return (
        <div
          className="w-44 sm:w-48 aspect-[2/3] rounded-[20px] border-2 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center"
          style={{
            background: bg.cardBg,
            borderColor: bgAccent,
            boxShadow: `0 18px 42px rgba(0,0,0,0.9), 0 0 28px ${bgAccent}48`,
          }}
        >
          <HarlequinAtmosphereLayers
            backdrop={bg}
            weather={bg.defaultWeather || { embers: true }}
            primaryColor={bgAccent}
            secondaryColor="#fbbf24"
          />
          <span className="relative z-10 text-5xl drop-shadow-[0_10px_22px_rgba(0,0,0,0.95)]">
            {bg.icon}
          </span>
          <div className="relative z-10 mt-3 px-3 py-1 rounded-full bg-black/75 border border-white/20 flex flex-col items-center">
            <span className="text-[8.5px] font-black uppercase tracking-widest text-amber-200/80">
              CENÁRIO / FUNDO
            </span>
            <span className="text-[11px] font-black text-white">
              {bg.shortName || item.shortName}
            </span>
          </div>
        </div>
      );
    }
    if (item.kind === 'frame') {
      const fr = HARLEQUIN_FRAMES[item.targetId] || HARLEQUIN_FRAMES.velvet_casino;
      return (
        <div
          className={`w-40 sm:w-44 aspect-[2/3] rounded-[20px] p-[4px] shadow-2xl ${
            fr.id === 'prism_holo' ? 'harlequin-holo-foil' : ''
          }`}
          style={{
            background: buildHarlequinFrameGradient(fr.id, rar.glowColor, '#fbbf24'),
            boxShadow: `0 18px 42px rgba(0,0,0,0.9), 0 0 28px ${rar.glowColor}48`,
          }}
        >
          <div
            className="relative w-full h-full rounded-[16px] overflow-hidden flex flex-col items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 50% 42%, #1d1924 0%, #09080c 100%)',
            }}
          >
            <HarlequinFrameDecor
              frameId={fr.id}
              primaryColor={rar.glowColor}
              secondaryColor="#fbbf24"
            />
            <span className="relative z-10 text-5xl drop-shadow-[0_10px_22px_rgba(0,0,0,0.95)]">
              {fr.icon}
            </span>
            <div className="relative z-10 mt-3 px-3 py-1 rounded-full bg-black/80 border border-white/20 flex flex-col items-center">
              <span className="text-[8.5px] font-black uppercase tracking-widest text-amber-200/80">
                MOLDURA
              </span>
              <span className="text-[11px] font-black text-white">
                {fr.shortName || item.shortName}
              </span>
            </div>
          </div>
        </div>
      );
    }
    if (item.kind === 'bubble') {
      const bb = HARLEQUIN_BUBBLE_STYLES[item.targetId] || HARLEQUIN_BUBBLE_STYLES.classic;
      return (
        <div
          className={`w-72 sm:w-80 rounded-2xl border-2 p-4 shadow-2xl relative overflow-hidden ${bb.fontClass}`}
          style={{
            background: bb.bg,
            borderColor: bb.border,
            boxShadow: `0 18px 42px ${bb.border}55`,
          }}
        >
          <span
            className="pointer-events-none absolute bottom-1 right-3 text-xs font-black tracking-[0.22em] opacity-20"
            style={{ color: bb.accent }}
          >
            {bb.watermark}
          </span>
          <span
            className="inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider bg-black/55 mb-2"
            style={{ borderColor: bb.border, color: bb.accent }}
          >
            {bb.tag}
          </span>
          <p className="text-xs italic text-zinc-100 leading-relaxed">
            “Agora todas as suas mensagens no cantinho podem usar o estilo {bb.name}!”
          </p>
        </div>
      );
    }

    // Item Mensal Real da Guilda
    const accent = item.accent || rar.glowColor;
    return (
      <div
        className="w-44 h-44 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-2xl"
        style={{
          borderColor: accent,
          background: `radial-gradient(circle at 50% 42%, ${accent}48 0%, #160c14 64%, #070408 100%)`,
          boxShadow: `0 0 46px ${accent}55`,
        }}
      >
        <div
          className="harlequin-magnet-spin pointer-events-none absolute w-32 h-32 rounded-full border border-dashed opacity-55"
          style={{ borderColor: accent }}
        />
        <span className="text-6xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]">{item.icon}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-white/20 text-[9.5px] font-black uppercase tracking-wider text-amber-200">
          {item.modeLabel || 'Suprimento Real'}
        </span>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Compra realizada: ${item.name}`}
      onClick={onClose}
      className="fixed inset-0 z-[9996] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bazaar-reveal-pop rpg-shop-brass-panel relative max-w-md w-full rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center gap-4 overflow-hidden"
      >
        {/* Feixes radiais girando ao fundo */}
        <div
          className="bazaar-rays-spin pointer-events-none absolute -inset-24 opacity-25"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${rar.glowColor}88 18deg, transparent 36deg, ${rar.glowColor}55 72deg, transparent 108deg, ${rar.glowColor}88 144deg, transparent 180deg, ${rar.glowColor}55 216deg, transparent 252deg, ${rar.glowColor}88 288deg, transparent 360deg)`,
          }}
        />

        {/* Moedas / estrelas voando */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {CELEBRATION_BURST_SPOTS.map((pt) => (
            <span
              key={pt.id}
              className="bazaar-coin-burst absolute top-1/2 left-1/2 text-lg drop-shadow"
              style={{
                '--bx': pt.bx,
                '--by': pt.by,
                '--brot': pt.brot,
                animationDelay: pt.delay,
              }}
            >
              {pt.sym}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-xl bg-black/65 hover:bg-black text-zinc-300 hover:text-white border border-[#8f6b2e] cursor-pointer"
          aria-label="Fechar celebração"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className={`px-3 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${rar.badgeClass}`}>
            ✦ {rar.label} • Compra Confirmada
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white leading-tight">{item.name}</h3>
        </div>

        {/* Showcase + Carimbo de Cera */}
        <div className="relative z-10 py-2 flex items-center justify-center">
          {renderShowcase()}
          <span
            className="rpg-sold-stamp pointer-events-none absolute bottom-2 right-0 px-3 py-1 rounded border-2 border-emerald-200 bg-emerald-700/95 text-xs font-black uppercase tracking-widest text-emerald-50 shadow-2xl"
          >
            ADQUIRIDO!
          </span>
        </div>

        {/* Resumo real creditado */}
        {result?.grantedSummary && (
          <div className="relative z-10 w-full rounded-xl bg-emerald-950/65 border border-emerald-400/50 px-3 py-2 text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{result.grantedSummary}</span>
          </div>
        )}

        {/* Fala do Arlequim Mercador */}
        {merchantSegments.length > 0 && (
          <p className="relative z-10 text-xs italic text-amber-100/90 leading-relaxed bg-black/55 border border-[#c89a49]/40 rounded-xl px-3.5 py-2.5 w-full">
            “<ColoredTypewriterText segments={merchantSegments} maxChars={999} />”
          </p>
        )}

        {/* Ações */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row gap-2">
          {isCosmetic && (
            <button
              type="button"
              onClick={() => onEquipNow?.(item)}
              className="rpg-shop-btn-emerald flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Equipar Agora
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rpg-shop-btn-gold flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Continuar no Bazar
          </button>
        </div>
      </div>
    </div>
  );
}
