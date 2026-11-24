import React, { useState, useEffect, useMemo, Suspense } from 'react';
import axios from 'axios';
import { Shield, Sparkles, Dna, ScrollText, RefreshCw, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { computeRpgAndGuilds } from '../utils/analyticsEngine';
import RpgClassSheet from '../components/RpgClassSheet';

const SecretDrawPage = React.lazy(() => import('./SecretDrawPage'));
const ChimeraPage = React.lazy(() => import('./ChimeraPage'));
const BingoPage = React.lazy(() => import('./BingoPage'));

const SUB_TABS = [
  { id: 'class', label: '🛡️ Classe RPG & Atributos', accent: 'amber' },
  { id: 'secret_draw', label: '🃏 Sessão Secreta', accent: 'fuchsia' },
  { id: 'chimera', label: '🧬 Quimera Cinéfila', accent: 'emerald' },
  { id: 'bingo', label: '📜 Pergaminhos da Guilda', accent: 'amber' },
];

const VALID_GUILD_TABS = ['class', 'secret_draw', 'chimera', 'bingo'];

export default function GuildaDestinoPage({
  movies = [],
  xpStatus: xpStatusProp = null,
  initialSubTab = 'class',
  onSubTabChange,
  secretDrawRefreshKey = 0,
  secretReadyCount = 0,
  onSecretReadyCountChange,
  chimeraReadyCount = 0,
  onChimeraReadyCountChange,
  bingoReadyCount = 0,
  onBingoReadyCountChange,
  onXpStatusChange,
  onOpenAddMovieForSecretCard,
  onOpenAddMovieForChimera,
}) {
  const [subTab, setSubTab] = useState(
    VALID_GUILD_TABS.includes(initialSubTab) ? initialSubTab : 'class'
  );
  const [liveXp, setLiveXp] = useState(xpStatusProp);
  const [trophiesList, setTrophiesList] = useState([]);
  const [walkOfFameData, setWalkOfFameData] = useState(null);
  const [secretDrawData, setSecretDrawData] = useState(null);

  useEffect(() => {
    if (VALID_GUILD_TABS.includes(initialSubTab)) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (xpStatusProp) setLiveXp(xpStatusProp);
  }, [xpStatusProp]);

  useEffect(() => {
    let mounted = true;
    const loadRpgGuildSources = async () => {
      try {
        const [xpRes, trRes, wofRes, secretRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/xp`),
          axios.get(`${API_BASE_URL}/trophies`),
          axios.get(`${API_BASE_URL}/walk-of-fame`),
          axios.get(`${API_BASE_URL}/secret-draw/status`),
        ]);
        if (!mounted) return;
        if (xpRes.status === 'fulfilled' && xpRes.value.data?.success && xpRes.value.data?.data) {
          setLiveXp(xpRes.value.data.data);
        }
        if (wofRes.status === 'fulfilled' && wofRes.value.data?.success && wofRes.value.data?.data) {
          setWalkOfFameData(wofRes.value.data.data);
        }
        if (secretRes.status === 'fulfilled' && secretRes.value.data?.success && secretRes.value.data?.data) {
          setSecretDrawData(secretRes.value.data.data);
        }
        if (trRes.status === 'fulfilled' && trRes.value.data?.success && trRes.value.data?.data?.trophies) {
          setTrophiesList(trRes.value.data.data.trophies);
          return;
        }
      } catch {
        // Servidor indisponível; mantém trophiesList atual
      }
    };

    loadRpgGuildSources();

    const onSync = (e) => {
      if (e?.detail && mounted) setLiveXp(e.detail);
    };
    window.addEventListener('cine-xp-status-sync', onSync);
    return () => {
      mounted = false;
      window.removeEventListener('cine-xp-status-sync', onSync);
    };
  }, [movies, subTab]);

  const rpgData = useMemo(
    () => computeRpgAndGuilds(movies, movies, liveXp, trophiesList, walkOfFameData, secretDrawData),
    [movies, liveXp, trophiesList, walkOfFameData, secretDrawData]
  );

  const { activeXp, characterClass, totalStatPoints, rpgAttributes } = rpgData;

  const handleSelectSubTab = (nextId) => {
    setSubTab(nextId);
    if (onSubTabChange) onSubTabChange(nextId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-16">
      {/* Cabeçalho Unificado da Guilda do Destino */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-br from-zinc-950 via-zinc-900/95 to-indigo-950/35 p-4 sm:p-6 shadow-[0_0_45px_rgba(245,158,11,0.12)]">
        <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5" />
                Salão Central de RPG &amp; Contratos
              </span>
              {characterClass?.className && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-[10px] font-bold">
                  <span>{characterClass.classIcon}</span>
                  <span>{characterClass.className}</span>
                  <span className="text-amber-300 font-mono">• Nv.{activeXp?.level || 1}</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              ⚔️ Guilda do Destino
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Gerencie sua Classe Cinéfila e Pontos de Atributo, sorteie cartas na{' '}
              <strong className="text-fuchsia-300">Sessão Secreta</strong>, forje contratos na{' '}
              <strong className="text-emerald-300">Quimera Cinéfila</strong> e lacre missões nos{' '}
              <strong className="text-amber-300">Pergaminhos da Guilda 4×4</strong>.
            </p>
          </div>

          {/* Navegação Interna Separada dos Submódulos */}
          <div className="flex flex-wrap items-center gap-2 bg-zinc-950/85 p-1.5 rounded-2xl border border-zinc-800/90 shrink-0">
            {SUB_TABS.map((tab) => {
              const isActive = subTab === tab.id;
              const activeCls =
                tab.accent === 'fuchsia'
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25'
                  : tab.accent === 'emerald'
                  ? 'bg-gradient-to-r from-emerald-400 to-amber-300 text-zinc-950 shadow-md shadow-emerald-400/25'
                  : tab.accent === 'cyan'
                  ? 'bg-gradient-to-r from-cyan-400 to-amber-300 text-zinc-950 shadow-md shadow-cyan-400/25'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-950 shadow-md shadow-amber-400/25';

              const readyBadgeCount =
                tab.id === 'secret_draw'
                  ? secretReadyCount
                  : tab.id === 'chimera'
                  ? chimeraReadyCount
                  : tab.id === 'bingo'
                  ? bingoReadyCount
                  : 0;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectSubTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? activeCls
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {readyBadgeCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black animate-pulse">
                      ✨ {readyBadgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conteúdo Separado de Cada Aba Dentro da Guilda */}
      {subTab === 'class' ? (
        <div className="flex flex-col gap-6">
          <RpgClassSheet
            characterClass={characterClass}
            totalStatPoints={totalStatPoints}
            rpgAttributes={rpgAttributes}
            showPowersTeaser
          />

          {/* Portais Rápidos para os Desafios Separados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleSelectSubTab('secret_draw')}
              className="group text-left rounded-3xl border border-fuchsia-500/35 bg-gradient-to-br from-fuchsia-950/35 via-zinc-950 to-zinc-950 hover:border-fuchsia-400/70 p-5 flex items-center justify-between gap-4 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-400/40 flex items-center justify-center text-2xl shrink-0">
                  🃏
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                    <span>Sessão Secreta</span>
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                    {secretReadyCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black animate-pulse">
                        ✨ {secretReadyCount} Pronta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cartas misteriosas da sua lista • 3 fichas nos dias 1 e 15 do mês (máx. 5) e Bumerangue.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-fuchsia-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubTab('chimera')}
              className="group text-left rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/35 via-zinc-950 to-zinc-950 hover:border-emerald-400/70 p-5 flex items-center justify-between gap-4 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-2xl shrink-0">
                  🧬
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                    <span>Quimera Cinéfila</span>
                    <Dna className="w-3.5 h-3.5 text-emerald-300" />
                    {chimeraReadyCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black animate-pulse">
                        ✨ {chimeraReadyCount} Pronta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Forja D20 de 4 pilares + 5 Cartas de Tarô ocultas • 3 fichas nos dias 1 e 15 (máx. 5) &amp; Declínios.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubTab('bingo')}
              className="group text-left rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/35 via-zinc-950 to-zinc-950 hover:border-amber-400/75 p-5 flex items-center justify-between gap-4 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                  📜
                </div>
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                    <span>Pergaminhos da Guilda 4×4</span>
                    <ScrollText className="w-3.5 h-3.5 text-amber-300" />
                    {bingoReadyCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black animate-pulse">
                        ✨ {bingoReadyCount} Pronta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    16 contratos mensais em pergaminho • Lacre missões, feche fileiras (+75 XP) e conquiste o Grande Sinete (+200 XP).
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="min-h-[45vh] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
              <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                Carregando desafio da Guilda...
              </span>
            </div>
          }
        >
          {subTab === 'secret_draw' ? (
            <SecretDrawPage
              key={secretDrawRefreshKey}
              onXpStatusChange={onXpStatusChange}
              onStatusLoaded={(data) => {
                if (onSecretReadyCountChange) {
                  onSecretReadyCountChange(Number(data?.readyToClaimCount || 0));
                }
              }}
              onOpenAddMovieForSecretCard={onOpenAddMovieForSecretCard}
            />
          ) : subTab === 'chimera' ? (
            <ChimeraPage
              onXpStatusChange={onXpStatusChange}
              onStatusLoaded={(data) => {
                if (onChimeraReadyCountChange) {
                  onChimeraReadyCountChange(Number(data?.readyToClaimCount || 0));
                }
              }}
              onOpenAddMovieForChimera={onOpenAddMovieForChimera}
            />
          ) : (
            <BingoPage
              onXpStatusChange={onXpStatusChange}
              onStatusLoaded={(data) => {
                if (onBingoReadyCountChange) {
                  onBingoReadyCountChange(Number(data?.readyToClaimCount || 0));
                }
              }}
            />
          )}
        </Suspense>
      )}
    </div>
  );
}
