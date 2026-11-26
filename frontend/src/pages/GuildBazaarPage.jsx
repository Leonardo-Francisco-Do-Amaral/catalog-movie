import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  MessageSquareQuote,
  RefreshCw,
  Volume2,
  VolumeX,
  RotateCcw,
  Infinity as InfinityIcon,
  Sparkles,
  Check,
  FlaskConical,
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import {
  GUILD_BAZAAR_CATEGORIES,
  GUILD_BAZAAR_RARITIES,
  GUILD_BAZAAR_ITEMS,
  HARLEQUIN_BACKDROPS,
  HARLEQUIN_BUBBLE_STYLES,
  HARLEQUIN_FRAMES,
  HARLEQUIN_RPG_SHOP_KEEPER,
  buildHarlequinFrameGradient,
  getHarlequinSkinById,
  pickSkinDialogue,
  parseColoredDialogueSegments,
} from '../data/harlequinSkins';
import { ColoredTypewriterText } from '../components/HarlequinCompanionPopup';
import {
  HarlequinAvatarCard,
  HarlequinFrameDecor,
} from '../components/HarlequinAvatarVisuals';
import BazaarPurchaseCelebration from '../components/BazaarPurchaseCelebration';
import PowerHelpButton from '../components/PowerHelpButton';
import {
  playHarlequinCardTapSound,
  playHarlequinVoiceBlip,
  playShopRerollSound,
} from '../utils/harlequinAudio';
import { dispatchHarlequinProfileSync } from '../utils/harlequinEvents';
import { getXpBarSkinMeta } from '../data/xpBarSkins';

function checkIsOwned(item, status) {
  if (!item || !status) return false;
  if (item.kind === 'monthly' || item.kind === 'power') return false;
  if (item.kind === 'skin') return (status.ownedSkins || []).includes(item.targetId);
  if (item.kind === 'backdrop') return (status.ownedBackdrops || []).includes(item.targetId);
  if (item.kind === 'frame') return (status.ownedFrames || []).includes(item.targetId);
  if (item.kind === 'bubble') return (status.ownedBubbles || []).includes(item.targetId);
  if (item.kind === 'xp_bar') return (status.ownedXpBarSkins || ['classic']).includes(item.targetId);
  if (item.kind === 'relic') return (status.ownedRelics || []).includes(item.targetId);
  return Boolean(item.isPreOwned);
}

function checkIsEquipped(item, status) {
  if (!item || !status) return false;
  if (item.kind === 'skin') return status.equippedSkin === item.targetId;
  if (item.kind === 'backdrop') return status.equippedBackdrop === item.targetId;
  if (item.kind === 'frame') return status.equippedFrame === item.targetId;
  if (item.kind === 'bubble') return status.equippedBubble === item.targetId;
  if (item.kind === 'xp_bar') return (status.equippedXpBarSkin || 'classic') === item.targetId;
  if (item.kind === 'relic') return (status.ownedRelics || []).includes(item.targetId);
  return false;
}

function BazaarVelvetCard({
  item,
  status,
  showLabTools = false,
  isSelected,
  isPreviewing,
  rerollSeq,
  onSelect,
}) {
  const rar = GUILD_BAZAAR_RARITIES[item.rarity] || GUILD_BAZAAR_RARITIES.epic;
  const isOwned = checkIsOwned(item, status);
  const isEquipped = checkIsEquipped(item, status);
  const isMonthly = item.kind === 'monthly';
  const isPower = item.kind === 'power';
  const isRelic = item.kind === 'relic';
  const powerStock = isPower ? Number(status?.tacticalCharges?.[item.targetId] || 0) : 0;
  const usedMonthly = isMonthly ? Number(status?.monthlyCounts?.[item.id] || 0) : 0;
  const limitMonthly = Number(item.monthlyLimit || 1);
  const isSoldOutMonthly = isMonthly && usedMonthly >= limitMonthly;

  let visualSlot;
  if (item.kind === 'skin') {
    const sk = getHarlequinSkinById(item.targetId);
    const bg = HARLEQUIN_BACKDROPS[sk.defaultBackdrop] || HARLEQUIN_BACKDROPS.casino_spotlight;
    visualSlot = (
      <div
        className="w-[78px] aspect-[2/3] mx-auto rounded-lg p-[2px] shadow-[0_10px_20px_rgba(0,0,0,0.88)]"
        style={{
          background: buildHarlequinFrameGradient(sk.defaultFrame, bg.accent || sk.themeColor, sk.secondaryColor),
        }}
      >
        <div
          className="relative w-full h-full rounded-[6px] overflow-hidden"
          style={{ background: bg.cardBg }}
        >
          <img
            src={sk.poses?.neutral?.image}
            alt={sk.name}
            className="w-full h-full object-contain"
          />
          <HarlequinFrameDecor
            frameId={sk.defaultFrame}
            primaryColor={bg.accent || sk.themeColor}
            secondaryColor={sk.secondaryColor}
          />
        </div>
      </div>
    );
  } else if (item.kind === 'backdrop') {
    const bg = HARLEQUIN_BACKDROPS[item.targetId] || HARLEQUIN_BACKDROPS.casino_spotlight;
    visualSlot = (
      <div
        className="w-full max-w-[104px] h-[88px] mx-auto rounded-lg border-2 border-[#c89a49]/80 overflow-hidden relative flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
        style={{ background: bg.cardBg }}
      >
        <span className="text-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">{bg.icon}</span>
        <span className="absolute bottom-1 inset-x-1 text-center text-[7.5px] font-black uppercase tracking-widest bg-black/75 text-amber-100 rounded py-0.2">
          FUNDO
        </span>
      </div>
    );
  } else if (item.kind === 'frame') {
    const fr = HARLEQUIN_FRAMES[item.targetId] || HARLEQUIN_FRAMES.velvet_casino;
    visualSlot = (
      <div
        className={`w-[78px] aspect-[2/3] mx-auto rounded-lg p-[2.5px] shadow-[0_10px_20px_rgba(0,0,0,0.88)] ${
          fr.id === 'prism_holo' ? 'harlequin-holo-foil' : ''
        }`}
        style={{
          background: buildHarlequinFrameGradient(fr.id, rar.glowColor, '#fbbf24'),
        }}
      >
        <div className="relative w-full h-full rounded-[6px] bg-zinc-950/90 flex items-center justify-center overflow-hidden">
          <span className="text-2xl opacity-90">{fr.icon}</span>
          <HarlequinFrameDecor
            frameId={fr.id}
            primaryColor={rar.glowColor}
            secondaryColor="#fbbf24"
          />
        </div>
      </div>
    );
  } else if (item.kind === 'bubble') {
    const bb = HARLEQUIN_BUBBLE_STYLES[item.targetId] || HARLEQUIN_BUBBLE_STYLES.classic;
    visualSlot = (
      <div
        className={`w-full max-w-[110px] h-[82px] mx-auto rounded-xl border-2 p-2 flex flex-col justify-between shadow-lg relative overflow-hidden ${bb.fontClass}`}
        style={{ background: bb.bg, borderColor: bb.border }}
      >
        <span
          className="text-[7.5px] font-black uppercase tracking-wider truncate"
          style={{ color: bb.accent }}
        >
          {bb.tag}
        </span>
        <span className="text-[8.5px] italic text-zinc-200 leading-tight line-clamp-2">
          “Estilo de balão desbloqueável…”
        </span>
      </div>
    );
  } else if (item.kind === 'xp_bar') {
    const xpMeta = getXpBarSkinMeta(item.targetId);
    visualSlot = (
      <div className="w-full max-w-[116px] h-[82px] mx-auto rounded-xl border border-white/15 bg-zinc-950/90 p-2 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-[9px] font-black text-amber-200">
          <span>LVL 42</span>
          <span>{xpMeta.icon}</span>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden border p-0.5 ${xpMeta.trackClass}`}>
          <div
            className={`h-full rounded-full ${xpMeta.barClass}`}
            style={{ width: '78%', boxShadow: xpMeta.glowStyle }}
          />
        </div>
        <span className="text-[7.5px] font-black uppercase tracking-wider text-zinc-400 text-center">
          BARRA DE XP
        </span>
      </div>
    );
  } else {
    // Item Mensal, Poder Tático ou Relíquia Permanente
    const accent = item.accent || rar.glowColor;
    visualSlot = (
      <div
        className="w-[84px] h-[84px] mx-auto rounded-full border-2 flex flex-col items-center justify-center relative shadow-[0_10px_22px_rgba(0,0,0,0.9)]"
        style={{
          borderColor: accent,
          background: `radial-gradient(circle at 38% 32%, ${accent}50 0%, #170d14 64%, #070408 100%)`,
          boxShadow: `0 0 18px ${accent}33, inset 0 0 12px rgba(0,0,0,0.85)`,
        }}
      >
        <div
          className="absolute inset-1.5 rounded-full border border-dashed opacity-50"
          style={{ borderColor: accent }}
        />
        <span className="text-3xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.95)]">{item.icon}</span>
      </div>
    );
  }

  return (
    <button
      key={`${rerollSeq}_${item.id}`}
      type="button"
      onClick={() => onSelect(item)}
      className={`rpg-shelf-deal group relative rounded-xl p-2.5 flex flex-col items-center justify-between gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-1.5 hover:rotate-[-1deg] ${
        isSelected
          ? 'bg-black/65 border-2 border-[#fbd269] shadow-[0_0_22px_rgba(251,210,105,0.38)] scale-[1.03]'
          : 'bg-black/30 border border-white/10 hover:border-[#c89a49]/75 hover:bg-black/45'
      }`}
    >
      {/* Linha superior de status */}
      <div className="w-full flex items-center justify-between gap-1 min-h-[16px]">
        {isEquipped ? (
          <span className="px-1.5 py-0.2 rounded bg-emerald-400 text-[#032316] text-[8px] font-black uppercase tracking-wider">
            {isRelic ? 'ATIVA ∞' : 'EQUIPADO'}
          </span>
        ) : isPreviewing ? (
          <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-[#04212c] text-[8px] font-black uppercase tracking-wider">
            NO ESPELHO
          </span>
        ) : (
          <span className={`text-[8.5px] font-black uppercase tracking-wider ${rar.textClass}`}>
            ✦ {rar.label}
          </span>
        )}

        {isMonthly ? (
          <span
            className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
              isSoldOutMonthly
                ? 'bg-rose-950 text-rose-200 border border-rose-500/40'
                : 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
            }`}
          >
            {usedMonthly}/{limitMonthly} MÊS
          </span>
        ) : isPower ? (
          <span
            className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
              powerStock > 0
                ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
            }`}
          >
            MOCHILA: {powerStock}×
          </span>
        ) : isOwned ? (
          <span className="px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-400/40 text-[8px] font-black text-emerald-200">
            LIBERADA
          </span>
        ) : null}
      </div>

      {/* Objeto físico no tapete */}
      <div className="relative w-full py-1 flex items-center justify-center">
        {visualSlot}

        {(isSoldOutMonthly || (!isMonthly && !isPower && isOwned)) && (
          <span
            className={`rpg-sold-stamp pointer-events-none absolute top-1/2 left-1/2 z-20 px-2 py-0.5 rounded border-2 text-[9px] font-black uppercase tracking-widest shadow-xl ${
              isSoldOutMonthly
                ? 'border-rose-200 bg-rose-700/95 text-rose-50'
                : 'border-emerald-200 bg-emerald-700/90 text-emerald-50'
            }`}
          >
            {isSoldOutMonthly ? 'ESGOTADO' : isRelic ? 'ATIVA ∞' : 'ADQUIRIDA'}
          </span>
        )}
      </div>

      {/* Etiqueta de preço pendente + Nome curto */}
      <div className="w-full flex flex-col items-center gap-1.5">
        <div className="rpg-shop-price-tag relative px-2.5 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4a2e0e] border border-[#f5d58c]/70 inline-block" />
          {!isMonthly && !isPower && isOwned ? (
            <span className="text-emerald-950">✓ SUA</span>
          ) : showLabTools && status?.labInfiniteMoney ? (
            <>
              <span className="line-through opacity-55 text-[8.5px]">🪙{item.priceCoins}</span>
              <span className="text-fuchsia-950 font-black">∞ LAB</span>
            </>
          ) : (
            <span>🪙 {item.priceCoins}</span>
          )}
        </div>

        <div className="w-full px-1.5 py-0.5 rounded bg-[#140b06]/90 border border-[#7a5a26]/65 text-[10px] font-black text-amber-100 text-center truncate">
          {item.shortName || item.name}
        </div>
      </div>
    </button>
  );
}

export default function GuildBazaarPage({
  initialCategory = 'all',
  onRefreshGuildCounts,
  onOpenClassStudio,
}) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [shopCategory, setShopCategory] = useState(initialCategory || 'all');

  useEffect(() => {
    if (initialCategory) {
      setShopCategory(initialCategory);
    }
  }, [initialCategory]);
  const [inspectedItemId, setInspectedItemId] = useState('monthly_secret_draw_chip');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rerollSeq, setRerollSeq] = useState(0);
  const [shakeDialog, setShakeDialog] = useState(false);
  const [merchantSeed, setMerchantSeed] = useState(0);
  const [celebrationResult, setCelebrationResult] = useState(null);
  const [showLabTools, setShowLabTools] = useState(() => {
    try {
      return window.localStorage.getItem('bazaar_show_lab') === '1';
    } catch {
      return false;
    }
  });

  const toggleLabTools = useCallback((forcedNext) => {
    setShowLabTools((prev) => {
      const next = typeof forcedNext === 'boolean' ? forcedNext : !prev;
      try {
        window.localStorage.setItem('bazaar_show_lab', next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      if (!next) {
        axios
          .put(`${API_BASE_URL}/guild-bazaar/settings`, { labInfiniteMoney: false })
          .then((res) => {
            if (res.data?.success && res.data?.data) {
              setStatus(res.data.data);
              dispatchHarlequinProfileSync(res.data.data);
            }
          })
          .catch(() => {});
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLabTools();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleLabTools]);

  const [mirrorLook, setMirrorLook] = useState({
    skinId: 'magneto',
    backdropId: 'magneto_storm',
    frameId: 'magneto_forge',
    bubbleId: 'magneto',
    viewMode: 'card',
    weather: null,
  });
  const [mirrorBubbleLine, setMirrorBubbleLine] = useState('');

  const [merchantSpeech, setMerchantSpeech] = useState({
    key: 'init_bazaar',
    badge: 'BALCÃO CLANDESTINO 35MM',
    mood: 'neutral',
    rawText: HARLEQUIN_RPG_SHOP_KEEPER.welcomeLines[0],
  });
  const [typedMerchantLen, setTypedMerchantLen] = useState(0);
  const hasInteractedRef = useRef(false);

  const loadBazaarStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/guild-bazaar/status`);
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setStatus(d);
        setMirrorLook((prev) => ({
          ...prev,
          skinId: d.equippedSkin || 'magneto',
          backdropId: d.equippedBackdrop || 'magneto_storm',
          frameId: d.equippedFrame || 'magneto_forge',
          bubbleId: d.equippedBubble || 'magneto',
        }));
      }
    } catch (err) {
      setErrorBanner(err?.response?.data?.error || 'Não foi possível carregar o Bazar da Guilda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBazaarStatus();
    const onSync = (ev) => {
      if (ev?.detail) {
        setStatus(ev.detail);
      } else {
        loadBazaarStatus();
      }
    };
    window.addEventListener('cine-harlequin-profile-sync', onSync);
    return () => window.removeEventListener('cine-harlequin-profile-sync', onSync);
  }, [loadBazaarStatus]);

  const merchantSegments = useMemo(
    () => parseColoredDialogueSegments(merchantSpeech?.rawText || ''),
    [merchantSpeech?.rawText]
  );
  const merchantPlainText = useMemo(
    () => merchantSegments.map((s) => s.text).join(''),
    [merchantSegments]
  );
  const isMerchantTyping = typedMerchantLen < merchantPlainText.length;

  useEffect(() => {
    setTypedMerchantLen(0);
    if (!merchantPlainText) return undefined;
    let idx = 0;
    let visible = 0;
    const timer = window.setInterval(() => {
      idx += 1;
      const ch = merchantPlainText[idx - 1];
      setTypedMerchantLen(idx);
      if (ch && ch.trim()) {
        visible += 1;
        if (visible % 2 === 1 && hasInteractedRef.current && soundEnabled) {
          playHarlequinVoiceBlip('classic', visible, merchantSpeech?.mood || 'neutral', false);
        }
      }
      if (idx >= merchantPlainText.length) {
        window.clearInterval(timer);
      }
    }, 20);
    return () => window.clearInterval(timer);
  }, [merchantPlainText, merchantSpeech?.key, merchantSpeech?.mood, soundEnabled]);

  const inspectedItem = useMemo(
    () =>
      GUILD_BAZAAR_ITEMS.find((entry) => entry.id === inspectedItemId) || GUILD_BAZAAR_ITEMS[0],
    [inspectedItemId]
  );

  const filteredItems = useMemo(
    () =>
      GUILD_BAZAAR_ITEMS.filter(
        (entry) => shopCategory === 'all' || entry.category === shopCategory
      ),
    [shopCategory]
  );

  const applyItemToMirror = useCallback(
    (item) => {
      if (!item || item.kind === 'monthly') return;
      setMirrorLook((prev) => {
        if (item.kind === 'skin') {
          const sk = getHarlequinSkinById(item.targetId);
          return {
            ...prev,
            skinId: item.targetId,
            backdropId: sk.defaultBackdrop || prev.backdropId,
            frameId: sk.defaultFrame || prev.frameId,
            bubbleId: HARLEQUIN_BUBBLE_STYLES[item.targetId] ? item.targetId : prev.bubbleId,
            weather: null,
          };
        }
        if (item.kind === 'backdrop') {
          return { ...prev, backdropId: item.targetId, weather: null };
        }
        if (item.kind === 'frame') {
          return {
            ...prev,
            frameId: item.targetId,
            viewMode: 'card',
          };
        }
        if (item.kind === 'bubble') {
          return { ...prev, bubbleId: item.targetId };
        }
        return prev;
      });
    },
    []
  );

  const handleSelectVelvetItem = (item) => {
    hasInteractedRef.current = true;
    setErrorBanner('');
    setInspectedItemId(item.id);
    applyItemToMirror(item);

    const nextSeed = merchantSeed + 1;
    setMerchantSeed(nextSeed);
    const lines = item.merchantLines || HARLEQUIN_RPG_SHOP_KEEPER.welcomeLines;
    const picked = lines[nextSeed % lines.length];
    playHarlequinCardTapSound('classic', item.soundMood || 'neutral', !soundEnabled);
    setMerchantSpeech({
      key: `sel_${item.id}_${Date.now()}`,
      badge: `BALCÃO • ${item.shortName.toUpperCase()}`,
      mood: item.soundMood || 'neutral',
      rawText: picked,
    });
  };

  const handleMerchantCommand = (cmd) => {
    hasInteractedRef.current = true;
    const nextSeed = merchantSeed + 1;
    setMerchantSeed(nextSeed);

    if (cmd === 'haggle') {
      setShakeDialog(true);
      window.setTimeout(() => setShakeDialog(false), 450);
      playHarlequinCardTapSound('classic', 'curse', !soundEnabled);
      const list = HARLEQUIN_RPG_SHOP_KEEPER.haggleLines;
      setMerchantSpeech({
        key: `hag_${Date.now()}`,
        badge: 'PECHINCHA NO BALCÃO',
        mood: 'curse',
        rawText: list[nextSeed % list.length],
      });
      return;
    }

    if (cmd === 'shuffle') {
      setRerollSeq((s) => s + 1);
      playShopRerollSound(!soundEnabled);
      const pick = GUILD_BAZAAR_ITEMS[(nextSeed * 5 + 3) % GUILD_BAZAAR_ITEMS.length];
      if (pick) {
        setInspectedItemId(pick.id);
        applyItemToMirror(pick);
      }
      const list = HARLEQUIN_RPG_SHOP_KEEPER.dailyDealLines;
      setMerchantSpeech({
        key: `shuf_${Date.now()}`,
        badge: `DESTAQUE • ${pick?.shortName?.toUpperCase() || 'BAZAR'}`,
        mood: 'happy',
        rawText: list[nextSeed % list.length],
      });
    }
  };

  const handleBuyItem = async (item) => {
    if (!item || buying || item.isPreOwned) return;
    hasInteractedRef.current = true;
    setBuying(true);
    setErrorBanner('');
    try {
      const res = await axios.post(`${API_BASE_URL}/guild-bazaar/buy`, { itemId: item.id });
      if (res.data?.success && res.data?.data) {
        const nextStatus = res.data.data;
        setStatus(nextStatus);
        dispatchHarlequinProfileSync(nextStatus);

        if (item.kind === 'monthly') {
          window.dispatchEvent(new CustomEvent('cine-bingo-sync'));
          window.dispatchEvent(new CustomEvent('cine-class-power-sync'));
          onRefreshGuildCounts?.();
        }

        setCelebrationResult({
          item,
          grantedSummary: res.data.grantedSummary,
          soundEnabled,
        });
        setMerchantSpeech({
          key: `bought_${item.id}_${Date.now()}`,
          badge: `ADQUIRIDO • ${item.shortName.toUpperCase()}`,
          mood: 'happy',
          rawText:
            item.afterBuyLine ||
            HARLEQUIN_RPG_SHOP_KEEPER.afterBuyDefaultLines[
              merchantSeed % HARLEQUIN_RPG_SHOP_KEEPER.afterBuyDefaultLines.length
            ],
        });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Não foi possível concluir a compra.';
      setErrorBanner(msg);
      playHarlequinCardTapSound('classic', 'sad', !soundEnabled);
      setMerchantSpeech({
        key: `err_${Date.now()}`,
        badge: 'BALCÃO BLOQUEADO',
        mood: 'sad',
        rawText: msg,
      });
    } finally {
      setBuying(false);
    }
  };

  const handleEquipItem = async (item) => {
    if (!item || equipping || item.kind === 'monthly' || item.kind === 'power' || item.kind === 'relic') return;
    hasInteractedRef.current = true;
    setEquipping(true);
    setErrorBanner('');
    try {
      const payload = {};
      if (item.kind === 'skin') payload.skin = item.targetId;
      if (item.kind === 'backdrop') payload.backdrop = item.targetId;
      if (item.kind === 'frame') payload.frame = item.targetId;
      if (item.kind === 'bubble') payload.bubble = item.targetId;
      if (item.kind === 'xp_bar') payload.xpBarSkin = item.targetId;

      const res = await axios.put(`${API_BASE_URL}/guild-bazaar/equip`, payload);
      if (res.data?.success && res.data?.data) {
        const nextStatus = res.data.data;
        setStatus(nextStatus);
        dispatchHarlequinProfileSync(nextStatus);
        playHarlequinCardTapSound(
          nextStatus.equippedSkin || 'classic',
          'happy',
          !soundEnabled
        );
        setMerchantSpeech({
          key: `eq_${item.id}_${Date.now()}`,
          badge: `EQUIPADO • ${item.shortName.toUpperCase()}`,
          mood: 'happy',
          rawText:
            item.kind === 'xp_bar'
              ? `[[emerald:${item.name}]] já está brilhando na sua barra de XP lá em cima!`
              : `[[emerald:${item.name}]] já está equipado no seu Avatar oficial da Guilda!`,
        });
      }
    } catch (err) {
      setErrorBanner(err?.response?.data?.error || 'Erro ao equipar item.');
    } finally {
      setEquipping(false);
    }
  };

  const handleToggleInfiniteMoney = async () => {
    if (!status) return;
    hasInteractedRef.current = true;
    try {
      const res = await axios.put(`${API_BASE_URL}/guild-bazaar/settings`, {
        labInfiniteMoney: !status.labInfiniteMoney,
      });
      if (res.data?.success && res.data?.data) {
        setStatus(res.data.data);
        dispatchHarlequinProfileSync(res.data.data);
        playHarlequinCardTapSound('classic', 'happy', !soundEnabled);
      }
    } catch (err) {
      setErrorBanner(err?.response?.data?.error || 'Erro ao alternar modo Dinheiro Infinito.');
    }
  };

  const handleResetBazaarLab = async () => {
    hasInteractedRef.current = true;
    try {
      const res = await axios.post(`${API_BASE_URL}/guild-bazaar/lab/reset`);
      if (res.data?.success && res.data?.data) {
        setStatus(res.data.data);
        dispatchHarlequinProfileSync(res.data.data);
        setRerollSeq((s) => s + 1);
        playShopRerollSound(!soundEnabled);
        setMerchantSpeech({
          key: `rst_${Date.now()}`,
          badge: 'LAB RESETADO',
          mood: 'neutral',
          rawText:
            'Prateleiras restauradas para testes! O [[gold:Magneto Cinéfilo]] segue liberado no seu Camarim.',
        });
      }
    } catch (err) {
      setErrorBanner(err?.response?.data?.error || 'Erro ao resetar Bazar Lab.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-amber-200/80">
          Abrindo o Bazar Clandestino do Arlequim...
        </span>
      </div>
    );
  }

  const rar = GUILD_BAZAAR_RARITIES[inspectedItem.rarity] || GUILD_BAZAAR_RARITIES.epic;
  const isOwnedInspected = checkIsOwned(inspectedItem, status);
  const isEquippedInspected = checkIsEquipped(inspectedItem, status);
  const isMonthlyInspected = inspectedItem.kind === 'monthly';
  const isPowerInspected = inspectedItem.kind === 'power';
  const isRelicInspected = inspectedItem.kind === 'relic';
  const isXpBarInspected = inspectedItem.kind === 'xp_bar';
  const isNonMirrorOrbInspected = isMonthlyInspected || isPowerInspected || isRelicInspected;
  const inspectedPowerStock = isPowerInspected
    ? Number(status?.tacticalCharges?.[inspectedItem.targetId] || 0)
    : 0;
  const monthlyUsed = isMonthlyInspected
    ? Number(status?.monthlyCounts?.[inspectedItem.id] || 0)
    : 0;
  const monthlyLimit = Number(inspectedItem.monthlyLimit || 1);
  const isSoldOutMonthly = isMonthlyInspected && monthlyUsed >= monthlyLimit;

  const mirrorSkinMeta = getHarlequinSkinById(mirrorLook.skinId);
  const mirrorBubbleStyle =
    HARLEQUIN_BUBBLE_STYLES[mirrorLook.bubbleId] || HARLEQUIN_BUBBLE_STYLES.classic;
  const mirrorBgMeta =
    HARLEQUIN_BACKDROPS[mirrorLook.backdropId] || HARLEQUIN_BACKDROPS.casino_spotlight;
  const activeWeather = mirrorLook.weather || mirrorBgMeta.defaultWeather || { embers: true };

  return (
    <div className="rpg-shop-wood-bg rounded-3xl border border-[#8f6b2e]/65 p-3.5 sm:p-5 space-y-4 shadow-[0_24px_65px_rgba(0,0,0,0.8)]">
      {/* HUD Diegética do Bazar + Controles Lab Ocultos (Alt+L ou duplo clique no selo) */}
      <div className="rpg-shop-brass-panel rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div
            onDoubleClick={() => toggleLabTools()}
            title="Duplo clique ou Alt+L para alternar Modo Laboratório"
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#2c190a] to-[#1b1008] border border-[#c89a49]/80 text-xs font-black tracking-widest text-amber-200 uppercase shadow-inner select-none cursor-pointer"
          >
            ♠ BAZAR CLANDESTINO 35MM ♦
          </div>
          <span className="text-[10px] font-mono text-amber-200/75 hidden sm:inline">
            Renovação mensal: {status?.nextResetMonthLabel || 'Dia 01'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showLabTools && (
            <>
              <button
                type="button"
                onClick={handleToggleInfiniteMoney}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10.5px] font-black cursor-pointer transition ${
                  status?.labInfiniteMoney
                    ? 'bg-fuchsia-500/25 border-fuchsia-400/70 text-fuchsia-100 shadow-[0_0_16px_rgba(217,70,239,0.3)]'
                    : 'bg-black/60 border-zinc-700 text-zinc-300 hover:border-amber-400/60'
                }`}
                title="Modo Laboratório: permite testar compras no Bazar com dinheiro infinito sem gastar seu saldo real"
              >
                <InfinityIcon className="w-3.5 h-3.5 text-fuchsia-300" />
                <span>{status?.labInfiniteMoney ? 'LAB: Dinheiro Infinito ATIVO' : 'LAB: Saldo Real'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetBazaarLab}
                className="px-2.5 py-1.5 rounded-lg bg-[#1d1108] hover:bg-[#311d0d] border border-[#8f6b2e] text-[10.5px] font-black text-amber-200 cursor-pointer inline-flex items-center gap-1"
                title="Restaurar estoque mensal e compras cosméticas para retestar (mantém Magneto)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Lab
              </button>

              <button
                type="button"
                onClick={() => toggleLabTools(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-400/55 text-fuchsia-100 text-[10.5px] font-black cursor-pointer"
                title="Ocultar ferramentas do Lab (Atalho: Alt+L)"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Ocultar Lab
              </button>
            </>
          )}

          {/* Saldo Real de Moedas */}
          <div className="px-3 py-1.5 rounded-xl bg-[#1a1007] border border-[#c89a49]/80 text-xs font-black text-amber-200 inline-flex items-center gap-1.5">
            <span>🪙</span>
            <span>
              {showLabTools && status?.labInfiniteMoney
                ? `∞ (Real: ${(status?.coinsBalance || 0).toLocaleString('pt-BR')})`
                : (status?.coinsBalance || 0).toLocaleString('pt-BR')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="w-8 h-8 rounded-lg bg-[#1d1108] hover:bg-[#311d0d] border border-[#8f6b2e] flex items-center justify-center text-amber-200 cursor-pointer"
            title={soundEnabled ? 'Silenciar sons do Bazar' : 'Ativar sons do Bazar'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {errorBanner && (
        <div className="rounded-xl border border-rose-400/60 bg-rose-950/75 px-3.5 py-2 text-xs font-bold text-rose-100">
          {errorBanner}
        </div>
      )}

      {/* ATO 1: MERCADOR EM DESTAQUE (ESQUERDA) + ESPELHO PROVADOR AO VIVO (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Esquerda (7 cols): Cena Visual Novel do Mercador */}
        <div className="rpg-shop-brass-panel lg:col-span-7 rounded-2xl overflow-hidden relative min-h-[430px] sm:min-h-[485px] flex flex-col justify-between">
          <img
            src={HARLEQUIN_RPG_SHOP_KEEPER.image}
            alt={HARLEQUIN_RPG_SHOP_KEEPER.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />

          <div
            className="rpg-lantern-glow pointer-events-none absolute -right-12 top-1/4 w-72 h-72 rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 72%)' }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(8,4,3,0.4) 0%, transparent 30%, rgba(8,4,3,0.45) 60%, rgba(7,4,3,0.96) 100%)',
            }}
          />

          <div className="relative z-10 p-3 flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded bg-[#1d1007]/90 border border-[#c89a49]/80 text-[10px] font-black uppercase tracking-widest text-amber-200 shadow">
              🕯️ EMPÓRIO OFICIAL DA GUILDA
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-black/75 border border-purple-400/45 text-purple-200">
                Skins {(status?.ownedSkins || []).length}/4
              </span>
              <span className="px-2 py-0.5 rounded bg-black/75 border border-cyan-400/45 text-cyan-200">
                Fundos {(status?.ownedBackdrops || []).length}/7
              </span>
              <span className="px-2 py-0.5 rounded bg-black/75 border border-amber-400/45 text-amber-200">
                Balões {(status?.ownedBubbles || []).length}/6
              </span>
            </div>
          </div>

          {/* Caixa de Diálogo Clássica JRPG */}
          <div
            className={`relative z-20 mx-3 mb-3 sm:mx-4 sm:mb-4 rounded-xl border-2 border-[#c89a49] bg-[#0b0604]/92 p-3.5 sm:p-4 shadow-2xl ${
              shakeDialog ? 'harlequin-click-shake' : ''
            }`}
            style={{ boxShadow: 'inset 0 0 0 1px rgba(251,211,141,0.22), 0 14px 34px rgba(0,0,0,0.95)' }}
          >
            <div className="absolute -top-3.5 left-4 px-3 py-0.5 rounded bg-gradient-to-r from-[#fbd269] to-[#c48322] border border-[#fff2c2] text-[#1f1003] text-[10px] font-black uppercase tracking-widest -skew-x-6 shadow-md">
              ARLEQUIM MERCADOR
            </div>

            <div
              onClick={() => setTypedMerchantLen(merchantPlainText.length)}
              className="cursor-pointer pt-1"
              title={isMerchantTyping ? 'Clique para completar a fala' : undefined}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-amber-300/80">
                  {merchantSpeech?.badge || 'BALCÃO'}
                </span>
                <MessageSquareQuote className="w-3.5 h-3.5 text-amber-300/80 shrink-0" />
              </div>

              <p className="text-xs sm:text-sm italic text-amber-50 leading-relaxed min-h-[3.1rem]">
                “<ColoredTypewriterText segments={merchantSegments} maxChars={typedMerchantLen} />
                {isMerchantTyping && (
                  <span className="harlequin-cursor-blink inline-block w-1.5 h-3.5 ml-0.5 align-middle rounded-[1px] bg-amber-300" />
                )}
                {!isMerchantTyping ? '”' : ''}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#c89a49]/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMerchantCommand('haggle')}
                  className="px-2.5 py-1 rounded bg-[#2a1509] hover:bg-[#3f200e] border border-[#c89a49]/75 text-[10.5px] font-black text-amber-200 cursor-pointer transition"
                >
                  ▸ PECHINCHAR
                </button>
                <button
                  type="button"
                  onClick={() => handleMerchantCommand('shuffle')}
                  className="px-2.5 py-1 rounded bg-[#2d1022] hover:bg-[#491836] border border-fuchsia-400/65 text-[10.5px] font-black text-fuchsia-200 cursor-pointer transition"
                >
                  ▸ SORTEAR DESTAQUE
                </button>
                {onOpenClassStudio && (
                  <button
                    type="button"
                    onClick={onOpenClassStudio}
                    className="px-2.5 py-1 rounded bg-[#0e241b] hover:bg-[#16382b] border border-emerald-400/60 text-[10.5px] font-black text-emerald-200 cursor-pointer transition"
                  >
                    ▸ CAMARIM NA CLASSE
                  </button>
                )}
              </div>
              <span className="text-[9.5px] font-mono text-amber-200/55 hidden sm:inline">
                clique nos itens abaixo para provar
              </span>
            </div>
          </div>
        </div>

        {/* Direita (5 cols): Espelho Provador Ao Vivo + Compra Real */}
        <div className="rpg-shop-brass-panel lg:col-span-5 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#2d1a0a] border border-[#c89a49]/75 text-[10px] font-black uppercase tracking-widest text-amber-200">
              🪞 Espelho Provador Ao Vivo
            </span>

            <div className="flex items-center gap-1">
              {[
                { id: 'card', label: 'Carta' },
                { id: 'free', label: 'Solto' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMirrorLook((prev) => ({ ...prev, viewMode: m.id }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-black border cursor-pointer transition ${
                    mirrorLook.viewMode === m.id
                      ? 'bg-amber-400 text-[#1d1004] border-amber-200'
                      : 'bg-black/55 border-[#7a5a26] text-amber-100/75 hover:text-amber-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Palco do Espelho */}
          <div className="relative rounded-xl border-2 border-[#b8893c]/80 bg-[#080507] px-3 pt-4 pb-3 flex flex-col items-center justify-center min-h-[264px] overflow-hidden shadow-inner">
            <div className="pointer-events-none absolute top-1.5 inset-x-4 flex items-center justify-between">
              {Array.from({ length: 7 }).map((_, idx) => (
                <span
                  key={idx}
                  className="w-2 h-2 rounded-full bg-amber-300/85 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                />
              ))}
            </div>

            {/* Botões rápidos de Clima no espelho */}
            <div className="absolute right-2 top-6 z-30 flex flex-col gap-1">
              {[
                { key: 'rain', icon: '🌧️', title: 'Chuva' },
                { key: 'fog', icon: '🌫️', title: 'Neblina' },
                { key: 'lightning', icon: '⚡', title: 'Raios' },
                { key: 'embers', icon: '✨', title: 'Brilhos' },
              ].map((w) => {
                const on = Boolean(activeWeather[w.key]);
                return (
                  <button
                    key={w.key}
                    type="button"
                    title={w.title}
                    onClick={() =>
                      setMirrorLook((prev) => ({
                        ...prev,
                        weather: {
                          ...(prev.weather || mirrorBgMeta.defaultWeather || {}),
                          [w.key]: !on,
                        },
                      }))
                    }
                    className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center cursor-pointer transition ${
                      on
                        ? 'bg-amber-400/25 border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                        : 'bg-black/65 border-white/10 text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    {w.icon}
                  </button>
                );
              })}
            </div>

            {isXpBarInspected ? (
              (() => {
                const barMeta = getXpBarSkinMeta(inspectedItem.targetId);
                return (
                  <div className="my-2 w-full max-w-[260px] flex flex-col items-center gap-3 text-center py-4">
                    <div
                      className="w-16 h-16 rounded-2xl border-2 bg-zinc-950/90 flex items-center justify-center text-3xl shadow-xl"
                      style={{ borderColor: barMeta.previewAccent, boxShadow: barMeta.glowStyle }}
                    >
                      {barMeta.icon}
                    </div>
                    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 space-y-2 shadow-2xl">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-200">
                        <span>LVL 42 • Ficha do Cineasta</span>
                        <span className="font-mono text-zinc-400">78% XP</span>
                      </div>
                      <div className={`w-full h-3.5 rounded-full overflow-hidden border p-0.5 ${barMeta.trackClass}`}>
                        <div
                          className={`h-full rounded-full ${barMeta.barClass}`}
                          style={{ width: '78%', boxShadow: barMeta.glowStyle }}
                        />
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/75 border border-amber-300/40 text-[9.5px] font-black uppercase tracking-widest text-amber-200">
                      Prévia Ao Vivo • HUD Superior
                    </span>
                  </div>
                );
              })()
            ) : isNonMirrorOrbInspected ? (
              <div className="my-2 flex flex-col items-center justify-center gap-2 text-center py-2">
                <div
                  className="w-28 h-28 rounded-full border-2 flex items-center justify-center relative shadow-2xl"
                  style={{
                    borderColor: inspectedItem.accent || rar.glowColor,
                    background: `radial-gradient(circle at 40% 35%, ${(inspectedItem.accent || rar.glowColor)}50 0%, #150b12 68%, #070408 100%)`,
                  }}
                >
                  <div
                    className="harlequin-magnet-spin pointer-events-none absolute w-24 h-24 rounded-full border border-dashed opacity-50"
                    style={{ borderColor: inspectedItem.accent || rar.glowColor }}
                  />
                  <span className="text-5xl drop-shadow-[0_10px_18px_rgba(0,0,0,0.95)]">
                    {inspectedItem.icon}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-black/75 border border-amber-300/40 text-[9.5px] font-black uppercase tracking-widest text-amber-200">
                  {isMonthlyInspected
                    ? `${inspectedItem.modeLabel || 'Mensal'} • ${monthlyUsed}/${monthlyLimit} este mês`
                    : isPowerInspected
                    ? `${inspectedItem.subtitle} • Na mochila: ${inspectedPowerStock}×`
                    : isOwnedInspected
                    ? '♾️ RELÍQUIA PERMANENTE ATIVA'
                    : '🏺 RELÍQUIA PERMANENTE ÚNICA'}
                </span>
              </div>
            ) : (
              <HarlequinAvatarCard
                skinId={mirrorLook.skinId}
                backdropId={mirrorLook.backdropId}
                frameId={mirrorLook.frameId}
                weather={activeWeather}
                viewMode={mirrorLook.viewMode}
                sizeClass="w-36 sm:w-40"
                compact
                onTap={(seq) => {
                  hasInteractedRef.current = true;
                  playHarlequinCardTapSound(mirrorSkinMeta.id, 'happy', !soundEnabled);
                  setMirrorBubbleLine(pickSkinDialogue(mirrorSkinMeta, seq % 2 === 0 ? 'happy' : 'poke', seq));
                }}
              />
            )}

            {/* Prévia do Balão equipado/provado */}
            {(inspectedItem.kind === 'bubble' || mirrorBubbleLine) && !isNonMirrorOrbInspected && !isXpBarInspected && (
              <div
                className={`relative z-20 mt-2 w-full rounded-lg border px-2.5 py-1.5 text-[10.5px] italic text-zinc-100 leading-snug ${mirrorBubbleStyle.fontClass}`}
                style={{
                  background: mirrorBubbleStyle.bg,
                  borderColor: `${mirrorBubbleStyle.border}aa`,
                }}
              >
                <span
                  className="not-italic text-[8.5px] font-black uppercase tracking-wider block mb-0.5"
                  style={{ color: mirrorBubbleStyle.accent }}
                >
                  {mirrorBubbleStyle.tag}
                </span>
                “{mirrorBubbleLine || pickSkinDialogue(mirrorSkinMeta, 'neutral', 0)}”
              </div>
            )}
          </div>

          {/* Ficha / Lore do item inspecionado */}
          <div className="rounded-xl border border-[#8f6b2e]/70 bg-black/55 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${rar.textClass}`}>
                    ✦ {rar.label}
                  </span>
                  {isOwnedInspected && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-[8.5px] font-black text-emerald-200 inline-flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> COMPRADA
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-white min-w-0">
                  <span className="truncate">{inspectedItem.name}</span>
                  <PowerHelpButton helpKey={inspectedItem.targetId} size="xs" />
                </div>
              </div>
              {!inspectedItem.isPreOwned && (
                <div className="text-xs font-black font-mono text-amber-300 shrink-0">
                  {showLabTools && status?.labInfiniteMoney ? `∞ (🪙${inspectedItem.priceCoins})` : `🪙 ${inspectedItem.priceCoins}`}
                </div>
              )}
            </div>

            {/* Para skins, mostra ficha completa (História, Referência, Gostos, Tom) */}
            {inspectedItem.kind === 'skin' ? (
              (() => {
                const sk = getHarlequinSkinById(inspectedItem.targetId);
                return (
                  <div className="space-y-1 text-[10.5px] text-zinc-300 leading-snug">
                    <p className="italic text-amber-100/90">“{sk.lore}”</p>
                    <div>
                      <strong className="text-amber-300">Referência:</strong> {sk.reference}
                    </div>
                    <div>
                      <strong className="text-emerald-300">Gostos:</strong> {sk.likes}
                    </div>
                    <div>
                      <strong className="text-cyan-300">Tom:</strong> {sk.tone}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-[11px] text-zinc-300 leading-snug">{inspectedItem.description}</p>
            )}

            {/* Botões de Ação Reais */}
            <div className="pt-1 flex flex-wrap gap-2">
              {isMonthlyInspected ? (
                <button
                  type="button"
                  disabled={buying || isSoldOutMonthly}
                  onClick={() => handleBuyItem(inspectedItem)}
                  className={`w-full py-2.5 px-4 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    isSoldOutMonthly
                      ? 'bg-zinc-900 border border-zinc-700 text-zinc-500 cursor-not-allowed'
                      : 'rpg-shop-btn-gold cursor-pointer disabled:opacity-50'
                  }`}
                >
                  {isSoldOutMonthly
                    ? `ESGOTADO NO MÊS (${monthlyUsed}/${monthlyLimit})`
                    : buying
                    ? 'PROCESSANDO...'
                    : showLabTools && status?.labInfiniteMoney
                    ? `🪙 RESGATAR SUPRIMENTO (∞ LAB) • ${monthlyUsed}/${monthlyLimit}`
                    : `🪙 COMPRAR SUPRIMENTO • 🪙 ${inspectedItem.priceCoins}`}
                </button>
              ) : isPowerInspected ? (
                <button
                  type="button"
                  disabled={buying}
                  onClick={() => handleBuyItem(inspectedItem)}
                  className="rpg-shop-btn-gold w-full py-2.5 px-4 rounded-lg text-[11px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {buying
                    ? 'GUARDANDO NA MOCHILA...'
                    : showLabTools && status?.labInfiniteMoney
                    ? `🪙 COMPRAR +1 PODER (∞ LAB • Na mochila: ${inspectedPowerStock}×)`
                    : `🪙 COMPRAR +1 PODER • 🪙 ${inspectedItem.priceCoins} (Mochila: ${inspectedPowerStock}×)`}
                </button>
              ) : isRelicInspected && isOwnedInspected ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rpg-shop-btn-emerald opacity-95 cursor-default"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  ✓ RELÍQUIA PERMANENTE ATIVA
                </button>
              ) : isOwnedInspected ? (
                <button
                  type="button"
                  disabled={equipping || isEquippedInspected}
                  onClick={() => handleEquipItem(inspectedItem)}
                  className={`w-full py-2.5 px-4 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    isEquippedInspected
                      ? 'rpg-shop-btn-emerald opacity-95 cursor-default'
                      : 'rpg-shop-btn-emerald cursor-pointer'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isXpBarInspected
                    ? isEquippedInspected
                      ? '✓ BARRA DE XP EQUIPADA'
                      : '⚡ EQUIPAR NA BARRA DE XP'
                    : isEquippedInspected
                    ? '✓ EQUIPADO NO SEU AVATAR'
                    : '⚡ EQUIPAR NO AVATAR AGORA'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={buying}
                  onClick={() => handleBuyItem(inspectedItem)}
                  className="rpg-shop-btn-gold w-full py-2.5 px-4 rounded-lg text-[11px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {buying
                    ? 'COMPRANDO...'
                    : showLabTools && status?.labInfiniteMoney
                    ? `🪙 COMPRAR AGORA (∞ LAB • Normal 🪙${inspectedItem.priceCoins})`
                    : `🪙 COMPRAR AGORA • 🪙 ${inspectedItem.priceCoins}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Travessa de Madeira Entalhada */}
      <div className="h-2.5 rounded-full border border-[#c89a49]/60 bg-gradient-to-r from-[#2c180c] via-[#9a7132] to-[#2c180c] shadow-lg" />

      {/* ATO 2: TAPETE DE VELUDO ESMERALDA DO BALCÃO */}
      <div className="rpg-shop-velvet-rug rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {GUILD_BAZAAR_CATEGORIES.map((cat) => {
              const active = shopCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setShopCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-wider border border-b-[3px] cursor-pointer transition active:translate-y-[1px] ${
                    active
                      ? 'bg-gradient-to-b from-[#fbd269] to-[#cf8c24] text-[#1f1003] border-[#fff0bd] border-b-[#78460b] shadow'
                      : 'bg-[#170e09]/90 text-amber-100/80 border-[#7a5a26] border-b-[#36240c] hover:text-amber-100 hover:border-[#c89a49]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-200/75">
            {filteredItems.length} itens na mesa
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filteredItems.map((item) => {
            const isPreviewing =
              item.kind !== 'monthly' &&
              ((item.kind === 'skin' && mirrorLook.skinId === item.targetId) ||
                (item.kind === 'backdrop' && mirrorLook.backdropId === item.targetId) ||
                (item.kind === 'frame' && mirrorLook.frameId === item.targetId) ||
                (item.kind === 'bubble' && mirrorLook.bubbleId === item.targetId));

            return (
              <BazaarVelvetCard
                key={item.id}
                item={item}
                status={status}
                showLabTools={showLabTools}
                isSelected={inspectedItem.id === item.id}
                isPreviewing={isPreviewing}
                rerollSeq={rerollSeq}
                onSelect={handleSelectVelvetItem}
              />
            );
          })}
        </div>
      </div>

      {/* Overlay Cinematográfico de Compra */}
      <BazaarPurchaseCelebration
        result={celebrationResult}
        onEquipNow={async (item) => {
          await handleEquipItem(item);
          setCelebrationResult(null);
        }}
        onClose={() => setCelebrationResult(null)}
      />
    </div>
  );
}
