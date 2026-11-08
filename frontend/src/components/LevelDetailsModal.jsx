import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Film,
  Clock,
  Star,
  Trophy,
  Globe,
  Zap,
  Award,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { COUNTRY_RARITY_META, TROPHY_TIER_META } from '../utils/xpSystem';

export default function LevelDetailsModal({
  isOpen,
  onClose,
  xpStatus,
  catalogStats,
  onNavigateTab,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !xpStatus) return null;

  const {
    totalXp = 0,
    level = 1,
    levelTitle = '',
    xpInCurrentLevel = 0,
    xpNeededForNextLevel = 300,
    xpRemaining = 300,
    progressPercentage = 0,
    nextTitleMilestone = null,
    sources,
  } = xpStatus;

  const moviesSource = sources?.movies || { count: 0, xpPerMovie: 10, totalXp: 0 };
  const countriesSource = sources?.countries || {
    totalConqueredCount: 0,
    pendingCoproductionsCount: 0,
    byRarity: {},
    totalXp: 0,
  };
  const trophiesSource = sources?.trophies || {
    totalUnlocked: 0,
    totalAvailable: 0,
    byTier: {},
    totalXp: 0,
  };

  const tierKeys = ['platinum', 'mythic', 'gold', 'epic', 'silver', 'bronze'];
  const rarityKeys = ['mythic', 'legendary', 'epic', 'rare', 'common'];

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col"
      >
        {/* Glows decorativos de topo */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-80 h-80 bg-amber-500/12 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* =====================================================================
            HEADER: NÍVEL ATUAL, TÍTULO CRIATIVO & BARRA DE PROGRESSO DE XP
           ===================================================================== */}
        <div className="relative z-10 p-5 sm:p-6 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/25 via-amber-500/10 to-zinc-900 border border-amber-400/50 flex flex-col items-center justify-center shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 leading-none">
                  LVL
                </span>
                <span className="text-xl font-black text-zinc-100 leading-tight">{level}</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35">
                    <Sparkles className="w-3 h-3" /> Ficha Oficial de Cineasta
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {totalXp.toLocaleString('pt-BR')} XP Total Acumulado
                  </span>
                </div>

                <h2 className="text-base sm:text-xl font-black text-zinc-100 tracking-tight mt-1 leading-snug">
                  {levelTitle}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
              title="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Barra de Progresso do Nível Atual */}
          <div className="mt-5 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-wider text-amber-400">
                  Nível {level} → Nível {level + 1}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono font-bold text-zinc-200">
                  {xpInCurrentLevel.toLocaleString('pt-BR')} /{' '}
                  {xpNeededForNextLevel.toLocaleString('pt-BR')} XP
                </span>
              </div>

              <span className="text-[11px] font-bold text-amber-300">
                Faltam {xpRemaining.toLocaleString('pt-BR')} XP para o Nível {level + 1} (
                {progressPercentage}%)
              </span>
            </div>

            <div className="w-full h-3.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-700 shadow-[0_0_16px_rgba(245,158,11,0.5)]"
                style={{ width: `${Math.max(progressPercentage > 0 ? 2 : 0, progressPercentage)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-0.5">
              {nextTitleMilestone ? (
                <span className="text-zinc-400">
                  Próxima mudança de título no{' '}
                  <strong className="text-amber-300">Nível {nextTitleMilestone.level}</strong>:{' '}
                  <span className="text-zinc-200 italic">&ldquo;{nextTitleMilestone.title}&rdquo;</span>
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">
                  👑 Patente Máxima Nível 100+ Desbloqueada!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================================
            CORPO DO MODAL: ESTATÍSTICAS ATUAIS + SALA DE TROFÉUS + EXTRATO DE XP
           ===================================================================== */}
        <div className="relative z-10 p-5 sm:p-6 flex flex-col gap-5">
          {/* 1. ESTATÍSTICAS CLÁSSICAS DO CINEASTA (PRESERVADAS INTEGRALMENTE) */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" /> Estatísticas Gerais do Catálogo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-900/65 border border-zinc-800/90 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Total de Filmes Assistidos
                  </div>
                  <div className="text-lg font-black text-zinc-100">
                    {catalogStats.totalMovies}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/65 border border-zinc-800/90 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Total de Horas Vistas
                  </div>
                  <div className="text-lg font-black text-cyan-300">
                    {catalogStats.totalHours}h
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/65 border border-zinc-800/90 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Média Geral de Nota
                  </div>
                  <div className="text-lg font-black text-purple-300">
                    {catalogStats.avgRating > 0 ? catalogStats.avgRating.toFixed(2) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Destaques de afinidade já existentes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-zinc-900/40 border border-zinc-800/70 rounded-2xl px-4 py-2.5 text-xs">
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Gênero Favorito</span>
                <span className="font-black text-amber-400 truncate max-w-full">
                  {catalogStats.topGenre}
                </span>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Diretor Freq.</span>
                <span className="font-black text-amber-400 truncate max-w-full">
                  {catalogStats.topDirector}
                </span>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Roteirista Freq.</span>
                <span className="font-black text-amber-400 truncate max-w-full">
                  {catalogStats.topWriter}
                </span>
              </div>
            </div>
          </section>

          {/* 2. RESUMO DA SALA DE TROFÉUS (TOTAL + 6 TIPOS SEPARADOS) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Resumo da Sala de Troféus
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-zinc-100 bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-xl">
                  🏆 {trophiesSource.totalUnlocked} / {trophiesSource.totalAvailable} Conquistados
                </span>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('trophies');
                      onClose();
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    Abrir Sala <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {tierKeys.map((tierKey) => {
                const meta = TROPHY_TIER_META[tierKey];
                const stat = trophiesSource.byTier?.[tierKey] || {
                  count: 0,
                  total: 0,
                  totalXp: 0,
                };
                return (
                  <div
                    key={tierKey}
                    className={`rounded-2xl border p-3 flex flex-col items-center text-center gap-1 ${meta.badge}`}
                  >
                    <span className="text-xl select-none">{meta.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {meta.label}
                    </span>
                    <span className="text-base font-black text-white leading-none mt-0.5">
                      {stat.count}
                      <span className="text-[10px] font-mono opacity-70">/{stat.total}</span>
                    </span>
                    <span className="text-[9px] font-mono opacity-80">
                      +{meta.xpEach.toLocaleString('pt-BR')} XP/un
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. EXTRATO DETALHADO DA ORIGEM DO XP */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Extrato Oficial da Origem do XP
              </h3>
              <span className="text-xs font-mono font-black text-emerald-400">
                Total: {totalXp.toLocaleString('pt-BR')} XP
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Fonte 1: Filmes */}
              <div className="bg-zinc-900/65 border border-zinc-800/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl select-none">🎬</span>
                  <div>
                    <div className="text-xs font-black text-zinc-100 uppercase tracking-wide">
                      XP de Filmes Cadastrados
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {moviesSource.count} filmes no catálogo × {moviesSource.xpPerMovie} XP cada
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl self-start sm:self-auto">
                  +{moviesSource.totalXp.toLocaleString('pt-BR')} XP
                </span>
              </div>

              {/* Fonte 2: Desafio 195 por Raridade */}
              <div className="bg-zinc-900/65 border border-zinc-800/90 rounded-2xl p-3.5 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl select-none">🌍</span>
                    <div>
                      <div className="text-xs font-black text-zinc-100 uppercase tracking-wide flex items-center gap-2 flex-wrap">
                        <span>XP do Desafio 195 (Países por Raridade)</span>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                          {countriesSource.totalConqueredCount}/195 países validados
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Filmes de 1 país pontuam na hora; coproduções pontuam após curadoria manual.
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl self-start sm:self-auto">
                    +{countriesSource.totalXp.toLocaleString('pt-BR')} XP
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {rarityKeys.map((rKey) => {
                    const meta = COUNTRY_RARITY_META[rKey];
                    const st = countriesSource.byRarity?.[rKey] || {
                      count: 0,
                      total: 0,
                      totalXp: 0,
                    };
                    return (
                      <div
                        key={rKey}
                        className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-2.5 py-2 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px] font-black">
                          <span className={meta.color}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="font-mono text-zinc-400">
                            {st.count}/{st.total}
                          </span>
                        </div>
                        <div className="text-xs font-mono font-black text-zinc-100">
                          +{st.totalXp.toLocaleString('pt-BR')} XP
                        </div>
                        <div className="text-[9px] text-zinc-500 font-mono">
                          ({meta.xpEach} XP cada)
                        </div>
                      </div>
                    );
                  })}
                </div>

                {countriesSource.pendingCoproductionsCount > 0 && (
                  <div className="flex items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/35 rounded-xl px-3 py-2 text-[11px] text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Você tem{' '}
                        <strong>
                          {countriesSource.pendingCoproductionsCount} coprodução(ões)
                        </strong>{' '}
                        aguardando atribuição manual na Central de Curadoria para liberar XP de país!
                      </span>
                    </span>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateTab('challenge');
                          onClose();
                        }}
                        className="font-black uppercase tracking-wider text-[10px] bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer hover:bg-amber-400"
                      >
                        Curar Agora
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Fonte 3: Troféus por Tiers */}
              <div className="bg-zinc-900/65 border border-zinc-800/90 rounded-2xl p-3.5 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl select-none">🏆</span>
                    <div>
                      <div className="text-xs font-black text-zinc-100 uppercase tracking-wide">
                        XP de Troféus (Soma por Tiers)
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Bronze (15) • Prata (25) • Épico (40) • Ouro (70) • Mítico (105) • Platina (1.000)
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-black text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl self-start sm:self-auto">
                    +{trophiesSource.totalXp.toLocaleString('pt-BR')} XP
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {tierKeys.map((tKey) => {
                    const meta = TROPHY_TIER_META[tKey];
                    const st = trophiesSource.byTier?.[tKey] || { count: 0, totalXp: 0 };
                    return (
                      <div
                        key={tKey}
                        className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-2.5 py-2 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px] font-black">
                          <span className={meta.color}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="font-mono text-zinc-400">{st.count}x</span>
                        </div>
                        <div className="text-xs font-mono font-black text-zinc-100">
                          +{st.totalXp.toLocaleString('pt-BR')} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
