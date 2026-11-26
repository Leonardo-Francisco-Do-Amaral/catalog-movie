import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Sparkles,
  Lock,
  Maximize2,
  X,
  Store,
  Check,
  MessageSquareQuote,
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import {
  GUILD_BAZAAR_ITEMS,
  HARLEQUIN_BACKDROPS_LIST,
  HARLEQUIN_BUBBLE_STYLES,
  HARLEQUIN_BUBBLE_STYLES_LIST,
  HARLEQUIN_FRAMES_LIST,
  HARLEQUIN_SKINS_LIST,
  getHarlequinSkinById,
  parseColoredDialogueSegments,
  pickSkinDialogue,
} from '../data/harlequinSkins';
import { HarlequinAvatarCard } from './HarlequinAvatarVisuals';
import { ColoredTypewriterText } from './HarlequinCompanionPopup';
import { dispatchHarlequinProfileSync } from '../utils/harlequinEvents';
import { playHarlequinCardTapSound } from '../utils/harlequinAudio';

const STUDIO_TABS = [
  { id: 'skins', label: '🎭 Skins' },
  { id: 'backdrops', label: '🌌 Fundos' },
  { id: 'frames', label: '🖼️ Molduras' },
  { id: 'bubbles', label: '💬 Balões de Fala' },
];

export default function HarlequinAvatarStudio({ onOpenBazaar }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('skins');
  const [viewMode, setViewMode] = useState('card');
  const [equipping, setEquipping] = useState(false);
  const [dialogueSeed, setDialogueSeed] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/guild-bazaar/status`);
      if (res.data?.success && res.data?.data) {
        setProfile(res.data.data);
      }
    } catch {
      // Fallback visual caso offline
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const onSync = (ev) => {
      if (ev?.detail) {
        setProfile(ev.detail);
      } else {
        loadProfile();
      }
    };
    window.addEventListener('cine-harlequin-profile-sync', onSync);
    return () => window.removeEventListener('cine-harlequin-profile-sync', onSync);
  }, [loadProfile]);

  useEffect(() => {
    if (!isZoomOpen) return undefined;
    const onEsc = (e) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isZoomOpen]);

  const equippedSkinId = profile?.equippedSkin || 'magneto';
  const equippedBackdropId = profile?.equippedBackdrop || 'magneto_storm';
  const equippedFrameId = profile?.equippedFrame || 'magneto_forge';
  const equippedBubbleId = profile?.equippedBubble || 'magneto';
  const avatarEnabled = profile?.avatarEnabled !== false;

  const skin = useMemo(() => getHarlequinSkinById(equippedSkinId), [equippedSkinId]);
  const bubbleStyle = useMemo(
    () => HARLEQUIN_BUBBLE_STYLES[equippedBubbleId] || HARLEQUIN_BUBBLE_STYLES.classic,
    [equippedBubbleId]
  );

  const sampleDialogue = useMemo(
    () => pickSkinDialogue(skin, dialogueSeed % 3 === 1 ? 'happy' : dialogueSeed % 3 === 2 ? 'poke' : 'neutral', dialogueSeed),
    [skin, dialogueSeed]
  );

  const handleEquip = async (field, value) => {
    if (equipping) return;
    setEquipping(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/guild-bazaar/equip`, { [field]: value });
      if (res.data?.success && res.data?.data) {
        setProfile(res.data.data);
        dispatchHarlequinProfileSync(res.data.data);
        playHarlequinCardTapSound(res.data.data.equippedSkin || 'classic', 'happy', false);
      }
    } catch {
      // ignora erro transitório
    } finally {
      setEquipping(false);
    }
  };

  const getPriceForTarget = (kind, targetId) => {
    const found = GUILD_BAZAAR_ITEMS.find((i) => i.kind === kind && i.targetId === targetId);
    return found ? found.priceCoins : null;
  };

  const renderWardrobeGrid = () => {
    if (activeTab === 'skins') {
      const ownedSet = new Set(profile?.ownedSkins || ['classic', 'magneto']);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HARLEQUIN_SKINS_LIST.map((sk) => {
            const isOwned = ownedSet.has(sk.id);
            const isEquipped = equippedSkinId === sk.id;
            const price = getPriceForTarget('skin', sk.id);
            return (
              <div
                key={sk.id}
                className={`rounded-2xl border p-3 flex items-center gap-3 transition ${
                  isEquipped
                    ? 'bg-zinc-900/95 border-amber-400/75 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                    : isOwned
                    ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                    : 'bg-black/50 border-zinc-800/80 opacity-85'
                }`}
              >
                <div className="w-12 h-16 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0 flex items-center justify-center">
                  <img
                    src={sk.poses?.neutral?.image}
                    alt={sk.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-white truncate">{sk.name}</span>
                    {!isOwned && <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {sk.dialoguesPending ? '⏳ Falas completas em breve' : '🎙️ Personalidade ativa'}
                  </div>

                  {isOwned ? (
                    <button
                      type="button"
                      disabled={equipping || isEquipped}
                      onClick={() => handleEquip('skin', sk.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition inline-flex items-center gap-1 ${
                        isEquipped
                          ? 'bg-emerald-500/25 border border-emerald-400/60 text-emerald-200 cursor-default'
                          : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3 h-3" /> Equipada
                        </>
                      ) : (
                        'Equipar'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenBazaar?.('skins')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/45 text-[10px] font-black text-amber-200 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Store className="w-3 h-3" />
                      Bazar {price ? `(🪙 ${price})` : ''}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'backdrops') {
      const ownedSet = new Set(profile?.ownedBackdrops || ['casino_spotlight', 'magneto_storm']);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HARLEQUIN_BACKDROPS_LIST.map((bg) => {
            const isOwned = ownedSet.has(bg.id);
            const isEquipped = equippedBackdropId === bg.id;
            const price = getPriceForTarget('backdrop', bg.id);
            return (
              <div
                key={bg.id}
                className={`rounded-2xl border p-3 flex items-center gap-3 transition ${
                  isEquipped
                    ? 'bg-zinc-900/95 border-cyan-400/75 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                    : isOwned
                    ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                    : 'bg-black/50 border-zinc-800/80 opacity-85'
                }`}
              >
                <div
                  className="w-12 h-14 rounded-xl border border-white/15 shrink-0 flex items-center justify-center text-xl"
                  style={{ background: bg.cardBg }}
                >
                  {bg.icon}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-white truncate">{bg.name}</span>
                    {!isOwned && <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">{bg.desc}</div>
                  {isOwned ? (
                    <button
                      type="button"
                      disabled={equipping || isEquipped}
                      onClick={() => handleEquip('backdrop', bg.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition inline-flex items-center gap-1 ${
                        isEquipped
                          ? 'bg-cyan-500/25 border border-cyan-400/60 text-cyan-200 cursor-default'
                          : 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3 h-3" /> Equipado
                        </>
                      ) : (
                        'Equipar'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenBazaar?.('backdrops')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/45 text-[10px] font-black text-amber-200 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Store className="w-3 h-3" />
                      Bazar {price ? `(🪙 ${price})` : ''}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'frames') {
      const ownedSet = new Set(profile?.ownedFrames || ['velvet_casino', 'magneto_forge']);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HARLEQUIN_FRAMES_LIST.map((fr) => {
            const isOwned = ownedSet.has(fr.id);
            const isEquipped = equippedFrameId === fr.id;
            const price = getPriceForTarget('frame', fr.id);
            return (
              <div
                key={fr.id}
                className={`rounded-2xl border p-3 flex items-center gap-3 transition ${
                  isEquipped
                    ? 'bg-zinc-900/95 border-purple-400/75 shadow-[0_0_18px_rgba(168,85,247,0.18)]'
                    : isOwned
                    ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                    : 'bg-black/50 border-zinc-800/80 opacity-85'
                }`}
              >
                <div className="w-12 h-14 rounded-xl border border-purple-400/35 bg-zinc-950 shrink-0 flex items-center justify-center text-xl">
                  {fr.icon}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-white truncate">{fr.name}</span>
                    {!isOwned && <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">{fr.desc}</div>
                  {isOwned ? (
                    <button
                      type="button"
                      disabled={equipping || isEquipped}
                      onClick={() => handleEquip('frame', fr.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition inline-flex items-center gap-1 ${
                        isEquipped
                          ? 'bg-purple-500/25 border border-purple-400/60 text-purple-200 cursor-default'
                          : 'bg-purple-400 hover:bg-purple-300 text-zinc-950'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3 h-3" /> Equipada
                        </>
                      ) : (
                        'Equipar'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenBazaar?.('frames')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/45 text-[10px] font-black text-amber-200 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Store className="w-3 h-3" />
                      Bazar {price ? `(🪙 ${price})` : ''}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Balões de Fala
    const ownedSet = new Set(profile?.ownedBubbles || ['classic', 'magneto']);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {HARLEQUIN_BUBBLE_STYLES_LIST.map((bb) => {
          const isOwned = ownedSet.has(bb.id);
          const isEquipped = equippedBubbleId === bb.id;
          const price = getPriceForTarget('bubble', bb.id);
          return (
            <div
              key={bb.id}
              className={`rounded-2xl border p-3 flex flex-col gap-2 transition ${
                isEquipped
                  ? 'bg-zinc-900/95 border-amber-400/80 shadow-[0_0_18px_rgba(245,158,11,0.18)]'
                  : isOwned
                  ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                  : 'bg-black/50 border-zinc-800/80 opacity-85'
              }`}
            >
              <div
                className={`rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-2 ${bb.fontClass}`}
                style={{ background: bb.bg, borderColor: bb.border }}
              >
                <span className="text-[9.5px] font-black uppercase truncate" style={{ color: bb.accent }}>
                  {bb.tag}
                </span>
                {!isOwned && <Lock className="w-3 h-3 text-zinc-400 shrink-0" />}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-white truncate">{bb.name}</span>
                {isOwned ? (
                  <button
                    type="button"
                    disabled={equipping || isEquipped}
                    onClick={() => handleEquip('bubble', bb.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer shrink-0 ${
                      isEquipped
                        ? 'bg-emerald-500/25 border border-emerald-400/60 text-emerald-200 cursor-default'
                        : 'bg-amber-400 hover:bg-amber-300 text-zinc-950'
                    }`}
                  >
                    {isEquipped ? '✓ Equipado' : 'Equipar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenBazaar?.('bubbles')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/45 text-[10px] font-black text-amber-200 cursor-pointer shrink-0"
                  >
                    Bazar {price ? `(🪙 ${price})` : ''}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-zinc-950 via-[#120e1b] to-zinc-950 border border-purple-500/35 p-4 sm:p-6 shadow-[0_18px_55px_rgba(0,0,0,0.65)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Camarim &amp; Montador do Avatar RPG
          </span>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Combine Skin, Fundo, Moldura e Balão de Fala comprados no Bazar — reflete no corpo inteiro e nos popups pelo site.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!avatarEnabled && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-400/45 text-[10px] font-black text-rose-200">
              🔕 Avatar Pausado na Guilda
            </span>
          )}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-black/60 border border-zinc-800">
            {[
              { id: 'card', label: 'Carta' },
              { id: 'free', label: 'Corpo Solto' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black cursor-pointer transition ${
                  viewMode === m.id ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10.5px] font-black text-amber-200 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Ampliar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Esquerda: Avatar Vivo + Ficha da Personalidade Equipada */}
        <div className="lg:col-span-5 flex flex-col items-center gap-3">
          <div className="w-full rounded-2xl border border-white/10 bg-black/50 p-4 flex flex-col items-center justify-center gap-3">
            <HarlequinAvatarCard
              skinId={equippedSkinId}
              backdropId={equippedBackdropId}
              frameId={equippedFrameId}
              viewMode={viewMode}
              sizeClass="w-40 sm:w-44"
              onTap={(seq) => {
                setDialogueSeed(seq);
                playHarlequinCardTapSound(equippedSkinId, 'poke', false);
              }}
            />

            {/* Prévia do Balão Equipado */}
            <div
              className={`w-full rounded-2xl border p-3 shadow-lg relative overflow-hidden ${bubbleStyle.fontClass}`}
              style={{
                background: bubbleStyle.bg,
                borderColor: `${bubbleStyle.border}aa`,
              }}
            >
              <span
                className="pointer-events-none absolute bottom-1 right-2.5 text-[9.5px] font-black tracking-[0.2em] opacity-15"
                style={{ color: bubbleStyle.accent }}
              >
                {bubbleStyle.watermark}
              </span>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase bg-black/50"
                  style={{ borderColor: `${bubbleStyle.border}77`, color: bubbleStyle.accent }}
                >
                  {bubbleStyle.tag}
                </span>
                <MessageSquareQuote className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <p className="text-[11px] italic text-zinc-100 leading-relaxed">
                “<ColoredTypewriterText segments={parseColoredDialogueSegments(sampleDialogue)} maxChars={999} />”
              </p>
            </div>
          </div>

          {/* Ficha de Lore / Referência / Gostos / Tom */}
          <div className="w-full rounded-2xl border border-zinc-800/90 bg-zinc-900/75 p-3.5 space-y-1.5 text-[11px] text-zinc-300">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-amber-300">{skin.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${
                  skin.dialoguesPending
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                    : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                }`}
              >
                {skin.dialoguesPending ? '⏳ Falas completas em breve' : '🎙️ Personalidade ativa'}
              </span>
            </div>
            <p className="italic text-zinc-200">“{skin.lore}”</p>
            <div>
              <strong className="text-amber-300">Referência:</strong> {skin.reference}
            </div>
            <div>
              <strong className="text-emerald-300">Gostos:</strong> {skin.likes}
            </div>
            <div>
              <strong className="text-cyan-300">Tom:</strong> {skin.tone}
            </div>
          </div>
        </div>

        {/* Direita: Abas de Equipamento */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-zinc-800/90">
            {STUDIO_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-zinc-950 shadow'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {renderWardrobeGrid()}
        </div>
      </div>

      {/* Modal de Ampliação em Corpo Inteiro */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização ampliada de ${skin.name}`}
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-[9995] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full rounded-3xl border border-zinc-700/80 bg-zinc-950 p-5 shadow-2xl flex flex-col items-center gap-4"
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-sm font-black text-white">{skin.title}</span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black text-zinc-300 border border-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <HarlequinAvatarCard
              skinId={equippedSkinId}
              backdropId={equippedBackdropId}
              frameId={equippedFrameId}
              viewMode={viewMode}
              sizeClass="w-64 sm:w-72"
            />
            <p className="text-xs text-zinc-300 text-center">{skin.lore}</p>
          </div>
        </div>
      )}
    </section>
  );
}
