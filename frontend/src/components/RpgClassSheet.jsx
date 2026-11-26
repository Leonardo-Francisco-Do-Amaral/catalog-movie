import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BookOpen, Search, Lock, X, Sparkles, Zap } from 'lucide-react';
import { InfiniteStarsRow } from './TrophyBadges';
import { API_BASE_URL } from '../utils/apiConfig';
import {
  EQUIPPED_CLASS_STORAGE_KEY,
  POWER_TIER_META,
  CLASS_POWER_MODE_META,
  getClassPowers,
  dispatchClassPowerSync,
} from '../utils/classPowersCatalog';
import HarlequinAvatarStudio from './HarlequinAvatarStudio';

export default function RpgClassSheet({
  characterClass = {},
  totalStatPoints = 0,
  rpgAttributes = [],
  showPowersTeaser = true,
  onOpenBazaar,
}) {
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [grimoireSearch, setGrimoireSearch] = useState('');
  const [showAttributeHelp, setShowAttributeHelp] = useState(false);
  const [powerWallet, setPowerWallet] = useState(null);
  const [equippedClassId, setEquippedClassId] = useState(() => {
    try {
      return window.localStorage.getItem(EQUIPPED_CLASS_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const loadPowerWallet = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/class-powers/status`);
      if (res.data?.success && res.data?.data) {
        setPowerWallet(res.data.data);
      }
    } catch {
      // fallback visual
    }
  }, []);

  useEffect(() => {
    loadPowerWallet();
    const onSync = () => loadPowerWallet();
    window.addEventListener('cine-class-power-sync', onSync);
    return () => window.removeEventListener('cine-class-power-sync', onSync);
  }, [loadPowerWallet]);

  const handleEquipClass = (nextId) => {
    setEquippedClassId(nextId);
    try {
      if (nextId) {
        window.localStorage.setItem(EQUIPPED_CLASS_STORAGE_KEY, nextId);
      } else {
        window.localStorage.removeItem(EQUIPPED_CLASS_STORAGE_KEY);
      }
    } catch {
      // ignora erro de storage
    }
    dispatchClassPowerSync();
  };

  const activeDisplayClass = useMemo(() => {
    if (equippedClassId && characterClass?.allClasses) {
      const found = characterClass.allClasses.find((c) => c.id === equippedClassId && c.isUnlocked);
      if (found) {
        return {
          ...characterClass,
          ...found,
          isCustomEquipped: true,
        };
      }
    }
    return {
      ...characterClass,
      isCustomEquipped: false,
    };
  }, [equippedClassId, characterClass]);

  const equippedPowersProfile = useMemo(
    () => getClassPowers(activeDisplayClass?.id || characterClass?.id),
    [activeDisplayClass?.id, characterClass?.id]
  );

  return (
    <div className="flex flex-col gap-5">
      {/* MONTADOR DO AVATAR RPG (SKINS, FUNDOS, MOLDURAS & BALÕES) */}
      <HarlequinAvatarStudio onOpenBazaar={onOpenBazaar} />

      {/* FICHA DE ATRIBUTOS POR PONTOS & CLASSE DO PERSONAGEM */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Coluna da Esquerda (Card da Classe do Personagem - 6 colunas) */}
        <div className="xl:col-span-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border border-amber-500/35 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4">
            {/* Topo: Emblema e Badge da Classe */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-500/15 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center text-3xl shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                  {activeDisplayClass.classIcon || '🎬'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40">
                      Classe #{activeDisplayClass.orderIndex || 1} de {characterClass.totalClassesCount || 20} • {activeDisplayClass.unlockPts || 0} pts
                    </span>
                    {activeDisplayClass.isCustomEquipped ? (
                      <span className="text-[10px] font-mono font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40">
                        Equipada Manualmente
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40">
                        Classe Atual (Desbloqueada)
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {activeDisplayClass.className || 'Cinéfilo Desperto'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {(activeDisplayClass.classStars || 0) > 0 && (
                  <InfiniteStarsRow count={activeDisplayClass.classStars} compact maxVisible={5} />
                )}
                <span className="text-xs font-mono font-black px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-400/35 text-amber-300">
                  {totalStatPoints} pts
                </span>
              </div>
            </div>

            {/* Subtítulo / Título de Honra */}
            <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
              <span>{activeDisplayClass.titleFlavor}</span>
              {activeDisplayClass.isCustomEquipped && (
                <button
                  type="button"
                  onClick={() => handleEquipClass(null)}
                  className="text-[10px] text-zinc-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Restaurar Automático
                </button>
              )}
            </div>

            {/* Lore / História Cômica */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-3.5 text-xs text-zinc-300 leading-relaxed italic relative">
              <span className="text-amber-400 font-serif text-lg leading-none mr-1">“</span>
              {activeDisplayClass.lore}
              <span className="text-amber-400 font-serif text-lg leading-none ml-1">”</span>
            </div>

            {/* Destaques: Filme Favorito / Arma Relíquia + Habilidade Passiva */}
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-4 flex flex-col gap-1.5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <span>🎬</span>
                  <span>Filme Favorito / Relíquia Sagrada:</span>
                </span>
                <p className="text-xs font-medium text-white leading-relaxed">
                  {activeDisplayClass.favoriteMovie}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-4 flex flex-col gap-1.5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Habilidade Passiva:</span>
                </span>
                <p className="text-xs font-medium text-zinc-200 leading-relaxed">
                  {activeDisplayClass.passiveSkill}
                </p>
              </div>
            </div>

            {/* Próxima Classe a Desbloquear na Trilha Linear */}
            {characterClass.nextClassToUnlock ? (
              <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-purple-950/30 border border-purple-500/40 p-3.5 flex items-center justify-between gap-3 text-xs shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                    {characterClass.nextClassToUnlock.classIcon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-wider block">
                      🔒 Próxima Classe a Desbloquear:
                    </span>
                    <span className="text-purple-200 font-black text-sm block leading-snug">
                      {characterClass.nextClassToUnlock.className}
                    </span>
                    <span className="text-zinc-400 text-[11px] block mt-0.5">
                      {characterClass.nextClassToUnlock.titleFlavor}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-amber-300 font-black text-sm">
                    +{characterClass.nextClassToUnlock.ptsRemaining} pts
                  </span>
                  <span className="text-zinc-500 text-[10px] block font-sans">
                    Requer {characterClass.nextClassToUnlock.unlockPts} pts
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-400/40 p-3.5 flex items-center gap-3 text-xs">
                <div className="text-2xl">👑</div>
                <div>
                  <span className="text-amber-300 font-black block">Trilha Lendária Completa!</span>
                  <span className="text-zinc-400 text-[11px] block">
                    Você desbloqueou todas as {characterClass.totalClassesCount || 20} classes cinematográficas da jornada!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Barra de Pontos Totais de Atributo + Acesso ao Grimório */}
          <div className="relative z-10 pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono gap-2 flex-wrap">
              <span className="text-zinc-400 font-bold">
                Pontos Totais de Atributo Investidos:
              </span>
              <span className="text-amber-300 font-black flex items-center gap-2">
                {(activeDisplayClass.classStars || 0) > 0 ? (
                  <>
                    <span>
                      Ciclo {activeDisplayClass.classCycleScore} / {activeDisplayClass.maxPossibleStats} ({activeDisplayClass.classCyclePct}%)
                    </span>
                    <span className="text-cyan-300">• Total: {totalStatPoints} pts</span>
                  </>
                ) : (
                  <span>
                    {totalStatPoints} / {activeDisplayClass.maxPossibleStats || 693} pts ({activeDisplayClass.statsProgressPct || 0}%)
                  </span>
                )}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (activeDisplayClass.classStars || 0) > 0
                    ? 'bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300'
                    : 'bg-gradient-to-r from-amber-500 via-purple-400 to-cyan-400'
                }`}
                style={{
                  width: `${
                    (activeDisplayClass.classStars || 0) > 0
                      ? activeDisplayClass.classCyclePct
                      : (activeDisplayClass.statsProgressPct || 0)
                  }%`,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsGrimoireOpen(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-xs font-black uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md group mt-1"
            >
              <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>📖 Grimório Completo das {characterClass.totalClassesCount || 20} Classes Cinéfilas</span>
            </button>
          </div>
        </div>

        {/* Coluna da Direita (Os 7 Atributos em Linhas com Barra de XP - 6 colunas) */}
        <div className="xl:col-span-6 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between gap-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                ⚔️ Ficha de Atributos do Personagem
              </span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Pontuação individual baseada nos feitos reais do seu acervo
              </p>
            </div>
            {/* Legenda de Ranks com SS+ e SS++ */}
            <div className="flex items-center gap-1 font-mono text-[9px] font-black px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex-wrap">
              <span className="text-emerald-400" title="C: Iniciante">C</span>
              <span>•</span>
              <span className="text-cyan-400" title="B: Intermediário">B</span>
              <span>•</span>
              <span className="text-purple-400" title="A: Veterano">A</span>
              <span>•</span>
              <span className="text-amber-400" title="S: Lendário">S</span>
              <span>•</span>
              <span className="text-rose-400" title="SS: Supremo">SS</span>
              <span>•</span>
              <span className="text-fuchsia-300 font-extrabold" title="SS+: Cósmico">SS+</span>
              <span>•</span>
              <span className="text-yellow-200 font-extrabold animate-pulse" title="SS++: Mítico Supremo">SS++</span>
            </div>
          </div>

          {/* Lista dos 7 Atributos na Ordem Clássica com Mini-Barras de XP */}
          <div className="flex flex-col gap-2.5">
            {rpgAttributes.map((attr) => (
              <div
                key={attr.key}
                className={`rounded-2xl p-3 flex flex-col gap-1.5 transition-all ${
                  (attr.stars || 0) > 0
                    ? 'bg-zinc-900/85 border border-cyan-400/45 shadow-[0_0_16px_rgba(34,211,238,0.12)] hover:border-cyan-300/70'
                    : 'bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-amber-300">
                      {attr.key}
                    </span>
                    <span className="font-black text-white flex items-center gap-1 truncate">
                      <span>{attr.icon}</span>
                      <span className="truncate">{attr.label}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAttributeHelp(true)}
                      className="w-4 h-4 rounded-full bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/40 flex items-center justify-center text-[10px] font-black cursor-pointer transition-all shrink-0"
                      title={`Ver fórmula de ${attr.label}`}
                    >
                      ?
                    </button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm font-black text-white">
                      {attr.score} <span className="text-[10px] text-zinc-500 font-normal">/ 99</span>
                    </span>
                    {(attr.stars || 0) > 0 && (
                      <span className="text-[10px] font-mono text-cyan-300 font-bold" title="Pontuação real acumulada sem reset">
                        ({attr.rawScore} pts)
                      </span>
                    )}
                    <InfiniteStarsRow count={attr.stars || 0} compact maxVisible={4} />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${attr.color}`}>
                      {attr.grade}
                    </span>
                  </div>
                </div>

                {/* Barra de XP do Atributo */}
                <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${attr.barColor || 'from-amber-400 to-yellow-300'}`}
                    style={{ width: `${attr.barPct ?? Math.min(100, Math.max(2, attr.score))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span className="truncate">{attr.desc}</span>
                  {attr.formulaSummary && (
                    <span className="text-amber-400/80 font-mono text-[9px] shrink-0 ml-2 hidden sm:inline">
                      {attr.formulaSummary}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vitrine dos 3 Poderes da Classe Equipada */}
      {showPowersTeaser && (
        <div className="rounded-3xl border border-amber-500/35 bg-gradient-to-br from-[#18121f] via-zinc-950 to-[#14110b] p-4 sm:p-5 flex flex-col gap-3.5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-center text-lg">
                {activeDisplayClass.classIcon || '🎬'}
              </span>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Poderes Ativos — {activeDisplayClass.className || 'Classe Equipada'}</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Especialidade:{' '}
                  <strong className="text-amber-200">
                    {CLASS_POWER_MODE_META[equippedPowersProfile.specialtyMode]?.icon}{' '}
                    {CLASS_POWER_MODE_META[equippedPowersProfile.specialtyMode]?.label}
                  </strong>{' '}
                  • Cada modo tem 1 carga compartilhada (dias 1 e 15 Secreta/Quimera, 1 mês Pergaminhos) — troque de classe no Grimório conforme sua estratégia!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGrimoireOpen(true)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/45 cursor-pointer transition-colors shrink-0"
            >
              📖 Trocar Classe Equipada
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {['secret_draw', 'chimera', 'bingo'].map((modeKey) => {
              const modeMeta = CLASS_POWER_MODE_META[modeKey];
              const power = equippedPowersProfile.powers?.[modeKey];
              const tierMeta = POWER_TIER_META[power?.tier || 'support'];

              const charges =
                modeKey === 'secret_draw'
                  ? powerWallet?.secretCharges ?? 1
                  : modeKey === 'chimera'
                    ? powerWallet?.chimeraCharges ?? 1
                    : powerWallet?.bingoCharges ?? 1;
              const maxCharges =
                modeKey === 'secret_draw'
                  ? powerWallet?.maxSecretCharges ?? 2
                  : modeKey === 'chimera'
                    ? powerWallet?.maxChimeraCharges ?? 2
                    : powerWallet?.maxBingoCharges ?? 2;
              const nextReset =
                modeKey === 'bingo'
                  ? powerWallet?.nextResetMonthLabel || '01 do mês'
                  : powerWallet?.nextReset15Label || 'dias 1 e 15 do mês';
              const armedBuff =
                modeKey === 'secret_draw' ? powerWallet?.secretBuff : null;

              return (
                <div
                  key={modeKey}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${tierMeta.cardTone}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${modeMeta.accentText}`}>
                        <span>{modeMeta.icon}</span>
                        <span>{modeMeta.label}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${tierMeta.badgeTone}`}>
                        {tierMeta.badge}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-xl leading-none shrink-0 mt-0.5">{power?.icon || '✨'}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                          <span>{power?.title}</span>
                          {power?.tier === 'specialty' && (
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-300/90 mt-1 leading-relaxed">
                          {power?.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="text-zinc-400">{power?.cooldownLabel || modeMeta.cooldownLabel}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-black border ${
                          charges > 0
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/45'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                        }`}
                        title={`Próxima recarga: ${nextReset}`}
                      >
                        {charges > 0 ? `⚡ Pronta (${charges}/${maxCharges})` : `⏳ Recarrega ${nextReset}`}
                      </span>
                    </div>
                    {armedBuff && (
                      <div className="text-[10px] font-bold text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-400/35 rounded-lg px-2 py-1">
                        🔥 Armado para próximo sorteio: {armedBuff.powerTitle}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DA TRILHA DE CLASSES CINÉFILAS */}
      {isGrimoireOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                  📖
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    Trilha das {characterClass.totalClassesCount || 20} Classes Cinéfilas
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Desbloqueie novas classes acumulando pontos de atributo na sua jornada. Você pode equipar qualquer classe já conquistada!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGrimoireOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={grimoireSearch}
                  onChange={(e) => setGrimoireSearch(e.target.value)}
                  placeholder="Buscar por classe, filme ou passiva..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
                {equippedClassId && (
                  <button
                    type="button"
                    onClick={() => handleEquipClass(null)}
                    className="font-black text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Restaurar Mais Alta Desbloqueada
                  </button>
                )}
                <span className="font-mono text-zinc-400">
                  <strong className="text-amber-300">{characterClass.unlockedClassesCount || 11}</strong> / {characterClass.totalClassesCount || 20} Desbloqueadas
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {(characterClass.allClasses || [])
                .filter((cls) => {
                  if (!grimoireSearch) return true;
                  const q = grimoireSearch.toLowerCase();
                  return (
                    cls.className.toLowerCase().includes(q) ||
                    cls.titleFlavor.toLowerCase().includes(q) ||
                    cls.lore.toLowerCase().includes(q) ||
                    cls.favoriteMovie.toLowerCase().includes(q) ||
                    cls.passiveSkill.toLowerCase().includes(q)
                  );
                })
                .map((cls) => {
                  const isEquipped = activeDisplayClass.id === cls.id;
                  const isUnlocked = cls.isUnlocked;

                  return (
                    <div
                      key={cls.id}
                      className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 transition-all ${
                        !isUnlocked
                          ? 'bg-zinc-950/40 border-zinc-800/40 opacity-55 border-dashed'
                          : isEquipped
                          ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className={`text-2xl p-2 rounded-xl bg-zinc-950 border shrink-0 ${isUnlocked ? 'border-zinc-800' : 'border-zinc-800/60 grayscale'}`}>
                              {cls.classIcon}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-white leading-snug">
                                {cls.className}
                              </h4>
                              <p className="text-[11px] font-bold text-amber-300/90 mt-0.5 leading-snug">
                                {cls.titleFlavor}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 self-start ${
                            isUnlocked
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {isUnlocked ? `✅ Desbloqueada (${cls.unlockPts} pts)` : `🔒 Requer ${cls.unlockPts} pts`}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 italic bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 leading-relaxed">
                          “{cls.lore}”
                        </p>

                        <div className="text-[11px] flex flex-col gap-2 text-zinc-300">
                          <div className="rounded-xl bg-zinc-950/40 p-2.5 border border-zinc-800/40 flex flex-col gap-0.5">
                            <span className="text-[10px] font-black uppercase text-amber-400">🎬 Filme Favorito / Relíquia:</span>
                            <span className="text-zinc-100 font-medium leading-relaxed">{cls.favoriteMovie}</span>
                          </div>
                          <div className="rounded-xl bg-zinc-950/40 p-2.5 border border-zinc-800/40 flex flex-col gap-0.5">
                            <span className="text-[10px] font-black uppercase text-cyan-300">✨ Habilidade Passiva:</span>
                            <span className="text-zinc-200 leading-relaxed">{cls.passiveSkill}</span>
                          </div>

                          {/* 3 Poderes nos Desafios da Guilda */}
                          {(() => {
                            const clsPowers = cls.powers || getClassPowers(cls.id);
                            return (
                              <div className="rounded-xl bg-zinc-950/65 p-2.5 border border-zinc-800/60 flex flex-col gap-1.5">
                                <span className="text-[10px] font-black uppercase text-amber-300">
                                  ⚡ Poderes nos 3 Modos da Guilda:
                                </span>
                                {['secret_draw', 'chimera', 'bingo'].map((mk) => {
                                  const mm = CLASS_POWER_MODE_META[mk];
                                  const pw = clsPowers.powers?.[mk];
                                  const isSpec = pw?.tier === 'specialty';
                                  return (
                                    <div
                                      key={mk}
                                      className={`rounded-lg px-2 py-1 border text-[10.5px] leading-snug ${
                                        isSpec
                                          ? 'border-amber-400/45 bg-amber-500/10 text-amber-100'
                                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1 font-bold">
                                        <span>
                                          {mm.icon} {pw?.icon} {pw?.title}
                                        </span>
                                        <span className={`text-[9px] shrink-0 ${isSpec ? 'text-amber-300' : 'text-zinc-400'}`}>
                                          {pw?.tierLabel}
                                        </span>
                                      </div>
                                      <div className="text-[10px] opacity-85 mt-0.5">{pw?.desc}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {isUnlocked ? (
                            isEquipped ? '👑 Atualmente Equipada' : 'Desbloqueada para uso'
                          ) : (
                            <span className="text-amber-400/90 font-bold">Faltam {cls.ptsRemaining} pts de atributo</span>
                          )}
                        </span>

                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              handleEquipClass(cls.id);
                              setIsGrimoireOpen(false);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                              isEquipped
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                            }`}
                          >
                            {isEquipped ? 'Equipada' : 'Equipar Classe'}
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 flex items-center gap-1 cursor-not-allowed">
                            <Lock className="w-3 h-3" /> Bloqueada
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXPLICAÇÃO DAS FÓRMULAS DE ATRIBUTO (?) */}
      {showAttributeHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-amber-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl font-black text-amber-300">
                  ?
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Como Ganhar Cada Ponto de Atributo?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Regras e métricas oficiais que calculam sua pontuação (0–99 por ciclo + ★ infinitas)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttributeHelp(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* AGI */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <span>⚡</span> AGI • Vigor de Tela (Agilidade)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
                      Ciclo 0–99 + ★
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede sua resistência física e fôlego de maratona com filmes longos.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• Filme com duração <strong>&gt; 120 min</strong>: <strong>+0.2 AGI</strong></div>
                    <div>• Filme com duração <strong>&gt; 140 min</strong>: <strong>+0.4 AGI</strong></div>
                    <div>• Filme com duração <strong>&gt; 170 min</strong>: <strong>+1.0 AGI</strong></div>
                    <div>• 🧬 <strong>Quimera (Gêneros)</strong>: <strong>+0.1</strong> normal / <strong>+0.5</strong> Jackpot (acumulável)</div>
                    <div>• 📜 <strong>Pergaminhos da Guilda (AGI)</strong>: <strong>+0.1</strong> Normal | <strong>+0.2</strong> 🔥 +Dif</div>
                  </div>
                </div>

                {/* INT */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                      <span>🧠</span> INT • Sabedoria Temporal (Inteligência)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
                      Ciclo 0–99 + ★
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede seu alcance cronológico, história do cinema e clássicos.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• Ano Inédito na Máquina do Tempo: <strong>+0.8 INT</strong> (Década: <strong>+1.5 INT</strong>)</div>
                    <div>• Filme Pré-2000 (1980–1999): <strong>+0.3 INT</strong></div>
                    <div>• Filme Pré-1980 (1950–1979): <strong>+0.5 INT</strong></div>
                    <div>• Filme Pré-1950 (Antes de 1950): <strong>+0.7 INT</strong></div>
                    <div>• 🧬 <strong>Quimera (Ano)</strong>: <strong>+0.1</strong> normal / <strong>+0.5</strong> Jackpot (+0.6 total)</div>
                    <div>• 📜 <strong>Pergaminhos da Guilda (INT)</strong>: <strong>+0.1</strong> Normal | <strong>+0.2</strong> 🔥 +Dif</div>
                  </div>
                </div>

                {/* DES */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <span>🌍</span> DES • Diplomacia Global (Destreza)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
                      Ciclo 0–99 + ★
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede sua exploração internacional fora do circuito tradicional.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• Filme <strong>fora do eixo EUA/Brasil</strong>: <strong>+0.2 DES</strong></div>
                    <div>• <strong>Expandir Nova Nação ONU</strong> no Desafio 195: <strong>+1.0 DES</strong></div>
                    <div>• 🧬 <strong>Quimera (Países)</strong>: <strong>+0.1</strong> normal / <strong>+0.5</strong> Jackpot (acumulável)</div>
                    <div>• 📜 <strong>Pergaminhos da Guilda (DES)</strong>: <strong>+0.1</strong> Normal | <strong>+0.2</strong> 🔥 +Dif</div>
                  </div>
                </div>

                {/* SOR */}
                <div className="rounded-2xl bg-zinc-900/70 border border-fuchsia-500/30 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                      <span>🎯</span> SOR • Olhar Clínico &amp; Fortuna (Sorte)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
                      Ciclo 0–99 + ★
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Soma o volume e extremos das suas avaliações com as cartas concluídas na Sessão Secreta:
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• Toda catalogação que amplia seu acervo: <strong>+0.2 SOR</strong></div>
                    <div>• Nota extrema (Obra-prima <strong>&ge; 9.5</strong> ou Trash <strong>&le; 4.0</strong>): <strong>+0.8 SOR</strong></div>
                    <div>
                      • 🃏 <strong>Sessão Secreta</strong> — ♣ Comum: <strong>+0.2</strong> | ♦ Mediano: <strong>+0.4</strong> | ♠ Difícil: <strong>+0.6</strong> | ♥ M.Dif: <strong>+1.0</strong> | ★ Exótico: <strong>+1.3 SOR</strong>
                    </div>
                    <div>• 📜 <strong>Pergaminhos da Guilda (SOR)</strong>: <strong>+0.1</strong> Normal | <strong>+0.2</strong> 🔥 +Dif</div>
                  </div>
                </div>

                {/* VIT */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                      <span>🛡️</span> VIT • Caça-Troféus (Vitalidade)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
                      Ciclo 0–99 + ★
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Pontos concedidos exclusivamente ao desbloquear troféus e pergaminhos:
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• 🥉 Bronze: <strong>+0.2 VIT</strong> | 🥈 Prata: <strong>+0.4 VIT</strong></div>
                    <div>• 🔮 Épico: <strong>+0.6 VIT</strong> | 🥇 Ouro: <strong>+0.8 VIT</strong></div>
                    <div>• 💎 Mítico: <strong>+1.0 VIT</strong> | 🏆 Platina: <strong>+3.0 VIT</strong></div>
                    <div>• 🌟 Estrela Infinita (★): <strong>+0.5 VIT por ★</strong></div>
                    <div>• 📜 <strong>Pergaminhos da Guilda (VIT)</strong>: <strong>+0.1</strong> Normal | <strong>+0.2</strong> 🔥 +Dif</div>
                  </div>
                </div>

                {/* FOR */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                      <span>👑</span> FOR • Prestígio Áureo (Força)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
                      Ciclo 0–99 + ★
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede o prestígio e reconhecimento oficial da Academia e da Guilda.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• Cada <strong>Indicação ao Oscar</strong>: <strong>+0.2 FOR</strong></div>
                    <div>• Cada <strong>Vitória / Estatueta do Oscar</strong>: <strong>+0.4 FOR</strong></div>
                    <div>• 📜 <strong>Pergaminhos da Guilda (FOR)</strong>: <strong>+0.1</strong> Normal | <strong>+0.2</strong> 🔥 +Dif</div>
                  </div>
                </div>

                {/* CAR */}
                <div className="rounded-2xl bg-zinc-900/70 border border-rose-500/35 p-4 flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                      <span>🌟</span> CAR • Aura de Estrela (Carisma)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
                      Ciclo 0–99 + ★
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Soma figurinhas <strong>efetivamente coladas</strong> no Álbum da Fama, Tags da Quimera Cinéfila e Pergaminhos:
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono grid grid-cols-1 sm:grid-cols-2 gap-1 text-zinc-300">
                    <div>• 🥉 Rank D: <strong>+0.1 CAR</strong> | 🥈 Rank C: <strong>+0.2 CAR</strong></div>
                    <div>• 🔮 Rank B: <strong>+0.3 CAR</strong> | 🏆 Rank A: <strong>+0.4 CAR</strong></div>
                    <div>• ❤️‍🔥 Rank A+ / 🌟 Rank X: <strong>+0.5 CAR</strong></div>
                    <div>• 💎 Rank S: <strong>+0.6 CAR</strong> | 👑 Rank SS: <strong>+0.7 CAR</strong></div>
                    <div>• 🧬 <strong>Quimera (Tags)</strong>: <strong>+0.1</strong> normal / <strong>+0.5</strong> Jackpot (acumulável)</div>
                    <div>• 📜 <strong>Pergaminhos da Guilda (CAR)</strong>: <strong>+0.1</strong> Normal | <strong>+0.2</strong> 🔥 +Dif</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-500/35 p-4 text-xs text-zinc-200 leading-relaxed">
                <span className="font-black text-amber-300 uppercase tracking-wider block mb-1">
                  🌟 Ranks Infinitos e Soma Total de Pontos
                </span>
                A soma real dos seus 7 atributos continua subindo sem parar para desbloquear as <strong>{characterClass.totalClassesCount || 20} Classes Cinéfilas</strong>! Ao atingir <strong>100 pts</strong> em um atributo (além do SS++ / 99), você ganha uma <strong>Estrela Infinita (★)</strong>, a barra reinicia do <strong>0 ao 99</strong> para subir novamente do C ao SS++, e sua pontuação total acumulada continua sendo somada! Passando de <strong>693 pts</strong> totais, a sua Classe também conquista Estrelas de Prestígio.
              </div>
            </div>

            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAttributeHelp(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
