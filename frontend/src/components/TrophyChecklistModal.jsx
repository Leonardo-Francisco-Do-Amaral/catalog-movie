import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  CheckCircle2,
  Lock,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Film,
  Star,
} from 'lucide-react';
import { TIER_THEMES } from './PS5TrophyToastContainer';
import {
  TrophyCardBadges,
  getCleanTrophyTitle,
  InfiniteStarsRow,
  INFINITE_STAR_VISUAL,
} from './TrophyBadges';
import { API_BASE_URL, resolveBackendAssetUrl } from '../utils/apiConfig';

export default function TrophyChecklistModal({ trophy, onClose }) {
  const [search, setSearch] = useState('');
  const [loadedTrophy, setLoadedTrophy] = useState(null);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [selectedMemorialIdx, setSelectedMemorialIdx] = useState(0);
  const [memorialTab, setMemorialTab] = useState('homages');

  useEffect(() => {
    let active = true;
    setSearch('');
    setSelectedMemorialIdx(0);
    setMemorialTab('homages');
    if (!trophy?.id) {
      setLoadedTrophy(null);
      return () => { active = false; };
    }
    if (Array.isArray(trophy.checklist) && trophy.checklist.length > 0) {
      setLoadedTrophy(trophy);
      setLoadingChecklist(false);
      return () => { active = false; };
    }

    setLoadedTrophy(trophy);
    setLoadingChecklist(true);
    axios
      .get(`${API_BASE_URL}/trophies/${encodeURIComponent(trophy.id)}/checklist`)
      .then((res) => {
        if (active && res.data?.success && res.data?.data) {
          setLoadedTrophy(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingChecklist(false);
      });

    return () => {
      active = false;
    };
  }, [trophy]);

  const activeTrophy = loadedTrophy?.id === trophy?.id ? loadedTrophy : trophy;

  const formattedDate = useMemo(() => {
    if (!activeTrophy?.unlocked_at) return null;
    try {
      const d = new Date(activeTrophy.unlocked_at);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [activeTrophy?.unlocked_at]);

  const checklistItems = useMemo(() => activeTrophy?.checklist || [], [activeTrophy]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return checklistItems;
    const q = search.toLowerCase().trim();
    return checklistItems.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(q);
      const movieMatch = item.movie_title?.toLowerCase().includes(q);
      const extraMatch = item.extra_info?.toLowerCase().includes(q);
      return nameMatch || movieMatch || extraMatch;
    });
  }, [checklistItems, search]);

  const isSpecialMemorial = Boolean(activeTrophy?.target_metadata?.isSpecialMemorial);
  const safeMemorialIdx = Math.min(selectedMemorialIdx, Math.max(0, checklistItems.length - 1));
  const activeHomage = isSpecialMemorial ? checklistItems[safeMemorialIdx] || null : null;
  const activeHomageMovies = useMemo(() => {
    if (!activeHomage) return [];
    if (Array.isArray(activeHomage.matched_movies) && activeHomage.matched_movies.length > 0) {
      return activeHomage.matched_movies;
    }
    if (activeHomage.movie_title) {
      return String(activeHomage.movie_title)
        .split(' • ')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((title) => ({ title }));
    }
    return [];
  }, [activeHomage]);

  if (!activeTrophy) return null;

  const visualTierKey =
    activeTrophy.kind === 'rank'
      ? String(activeTrophy.highest_unlocked_tier || activeTrophy.ranks?.[0]?.tier || 'bronze').toLowerCase()
      : String(activeTrophy.tier || 'bronze').toLowerCase();
  const baseTheme = TIER_THEMES[visualTierKey] || TIER_THEMES.bronze;
  const extraStarsCount = Math.max(0, Number(activeTrophy.extra_stars) || 0);
  const isInfiniteActive = activeTrophy.kind === 'rank' && extraStarsCount > 0;
  const theme = isInfiniteActive ? INFINITE_STAR_VISUAL : baseTheme;
  const isUnlocked = Boolean(activeTrophy.is_unlocked);
  const cleanTitle = getCleanTrophyTitle(activeTrophy.title);
  const conqueredCount = checklistItems.filter((i) => i.conquered).length;
  const totalItems = checklistItems.length;
  const ranksList = activeTrophy.kind === 'rank' && Array.isArray(activeTrophy.ranks) ? activeTrophy.ranks : [];

  const formatShortDate = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-zinc-950 border ${theme.border} rounded-3xl p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col gap-4 overflow-hidden ${theme.glow}`}
      >
        {/* Glow de fundo */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: theme.accentColor }}
        />

        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4 relative z-10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            {/* Ícone Estilo PS5 Ampliado */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-br ${theme.iconBg} border-2 ${theme.border} flex items-center justify-center text-4xl sm:text-5xl shadow-xl relative`}
            >
              <span>{activeTrophy.icon || theme.symbol}</span>
              {isUnlocked && (
                <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md border border-zinc-950">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <TrophyCardBadges
                trophy={activeTrophy}
                theme={theme}
                isUnlocked={isUnlocked}
                unlockedDateStr={formattedDate}
              />

              <h3 className="text-base sm:text-xl font-black text-zinc-100 tracking-tight leading-snug mt-0.5">
                {cleanTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                {activeTrophy.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso Real ou Progressão Infinita (★) */}
        {ranksList.length > 0 && isUnlocked ? (
          <div
            className={`rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2 relative z-10 shrink-0 border ${
              extraStarsCount > 0
                ? 'bg-gradient-to-r from-cyan-950/45 via-fuchsia-950/35 to-amber-950/40 border-cyan-400/45'
                : 'bg-zinc-900/75 border-zinc-800/80'
            }`}
          >
            {activeTrophy.is_finite_cap ? (
              <div className="flex items-center justify-between text-xs font-bold gap-2">
                <span className="text-amber-300 uppercase tracking-wider text-[11px]">
                  🏆 Teto Máximo Definitivo (Desafio dos 195)
                </span>
                <span className="text-zinc-100 font-mono">
                  {activeTrophy.progress_current} / {activeTrophy.progress_target} (100%)
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-bold gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-cyan-300 uppercase tracking-wider text-[11px]">
                      🌟 Modo Infinito • Rumo à Estrela ★{extraStarsCount + 1}
                    </span>
                    <InfiniteStarsRow count={extraStarsCount} />
                  </div>
                  <span className="text-zinc-100 font-mono">
                    {activeTrophy.star_progress_current || 0} / {activeTrophy.star_progress_target || activeTrophy.star_step || 1}{' '}
                    <span className="text-zinc-400">
                      ({Math.min(100, activeTrophy.star_progress_percentage || 0)}%)
                    </span>
                  </span>
                </div>

                <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300"
                    style={{
                      width: `${Math.min(100, activeTrophy.star_progress_percentage || 0)}%`,
                      boxShadow: '0 0 12px rgba(34,211,238,0.65)',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono flex-wrap gap-2">
                  <span>
                    +{activeTrophy.star_step || 1} por estrela (20% do Mítico) • +55 XP por ★
                  </span>
                  {extraStarsCount > 0 && (
                    <span className="text-amber-300 font-bold">
                      Total Estrelas: {extraStarsCount}★ (+{extraStarsCount * 55} XP)
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900/75 border border-zinc-800/80 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2 relative z-10 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
                {ranksList.length > 0 ? 'Próximo Marco de Rank' : 'Progresso no Banco de Dados'}
              </span>
              <span className="text-zinc-100 font-mono">
                {Math.min(activeTrophy.progress_current, activeTrophy.progress_target)} / {activeTrophy.progress_target}{' '}
                <span className="text-zinc-500">
                  ({Math.min(100, activeTrophy.progress_percentage || 0)}%)
                </span>
              </span>
            </div>

            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, activeTrophy.progress_percentage || 0)}%`,
                  backgroundColor: theme.accentColor,
                  boxShadow: `0 0 12px ${theme.accentColor}80`,
                }}
              />
            </div>
          </div>
        )}

        {/* Abas do Troféu Especial Memorial: Homenagens Clicáveis vs Trilha de Ranks */}
        {isSpecialMemorial && ranksList.length > 0 && (
          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <button
              type="button"
              onClick={() => setMemorialTab('homages')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                memorialTab === 'homages'
                  ? 'bg-amber-500/20 border-amber-400/70 text-amber-200 shadow-sm'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>🕯️</span>
              <span>Homenagens ({checklistItems.length || 5})</span>
            </button>
            <button
              type="button"
              onClick={() => setMemorialTab('ranks')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                memorialTab === 'ranks'
                  ? 'bg-purple-500/20 border-purple-400/70 text-purple-200 shadow-sm'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>🏅</span>
              <span>Níveis do Rank ({activeTrophy.unlocked_ranks_count || 0}/{ranksList.length})</span>
            </button>
          </div>
        )}

        {/* Trilha de 5 Ranks (sem corte de texto e com data exata de finalização por Rank) */}
        {ranksList.length > 0 && (!isSpecialMemorial || memorialTab === 'ranks') && (
          <div className={`bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-3.5 flex flex-col gap-2.5 relative z-10 ${isSpecialMemorial ? 'flex-1 overflow-hidden' : 'shrink-0'}`}>
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-400 shrink-0">
              <span>Trilha de Ranks ({activeTrophy.unlocked_ranks_count || 0}/{ranksList.length})</span>
              <span className="text-amber-400 font-mono">Teto: {activeTrophy.target_value}</span>
            </div>
            <div className={`flex flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 ${isSpecialMemorial ? 'flex-1' : 'max-h-[28vh]'}`}>
              {ranksList.map((rk) => {
                const rkTheme = TIER_THEMES[String(rk.tier || 'bronze').toLowerCase()] || TIER_THEMES.bronze;
                const rkDone = Boolean(rk.is_unlocked);
                const rkDate = rkDone ? formatShortDate(rk.unlocked_at) : null;
                const rkPct = Math.min(100, Number(rk.progress_percentage) || 0);
                return (
                  <div
                    key={rk.id}
                    className={`rounded-xl px-3 py-2 border flex items-center justify-between gap-3 transition-all ${
                      rkDone
                        ? `bg-zinc-950/90 ${rkTheme.border} shadow-sm`
                        : 'bg-zinc-950/45 border-zinc-800/70 opacity-85'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center text-lg ${
                          rkDone ? `${rkTheme.badgeBg} ${rkTheme.border}` : 'bg-zinc-900 border-zinc-800 grayscale opacity-60'
                        }`}
                      >
                        {rkTheme.symbol}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-black uppercase tracking-wider"
                            style={{ color: rkTheme.color }}
                          >
                            {rkTheme.name}
                          </span>
                          <span className="text-xs font-bold text-zinc-100 leading-snug">
                            {getCleanTrophyTitle(rk.title)}
                          </span>
                        </div>
                        {rk.description && (
                          <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                            {rk.description}
                          </p>
                        )}
                        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${rkPct}%`,
                              backgroundColor: rkDone ? rkTheme.color : '#71717a',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                      <span className="text-[11px] font-mono font-bold text-zinc-200">
                        {rk.progress_current}/{rk.progress_target}
                      </span>
                      {rkDone ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                          ✓ {rkDate || 'Conquistado'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-zinc-500">
                          🔒 Pendente
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Busca Interna se houver muitos itens (troféus comuns) */}
        {!isSpecialMemorial && totalItems > 8 && (
          <div className="relative z-10">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar países ou filmes deste checklist..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        )}

        {/* Área Interativa de Homenagens Clicáveis (Troféu Especial Memorial) ou Lista Padrão */}
        {isSpecialMemorial ? (
          memorialTab === 'homages' ? (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-zinc-700 relative z-10">
            {loadingChecklist && checklistItems.length === 0 ? (
              <div className="py-10 flex items-center justify-center gap-2 text-zinc-400 text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Carregando homenagens da família...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <span>🕯️</span>
                    <span>Clique em uma pessoa para abrir a homenagem</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMemorialIdx((prev) =>
                          prev <= 0 ? Math.max(0, checklistItems.length - 1) : prev - 1
                        )
                      }
                      className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                    </button>
                    <span className="text-[11px] font-mono text-zinc-400 px-1.5">
                      {checklistItems.length > 0 ? `${safeMemorialIdx + 1}/${checklistItems.length}` : '0/0'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMemorialIdx((prev) =>
                          prev >= checklistItems.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Próxima <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 5 Cards Clicáveis de Homenagem */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {checklistItems.map((item, idx) => {
                    const isSelected = idx === safeMemorialIdx;
                    const isConq = Boolean(item.conquered);
                    const totalMatched = Number(item.total_matched ?? item.current ?? 0);
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => setSelectedMemorialIdx(idx)}
                        className={`text-left rounded-xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-zinc-900 border-amber-400/80 shadow-[0_0_18px_rgba(245,158,11,0.22)]'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-amber-500/45 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm">{isSelected ? '🕯️' : isConq ? '✨' : '🤍'}</span>
                          <span
                            className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded border ${
                              isConq
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {totalMatched}/5{totalMatched > 5 ? ` +${totalMatched - 5}★` : ''}
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-black leading-snug line-clamp-2 ${
                            isSelected ? 'text-amber-200' : 'text-zinc-200'
                          }`}
                        >
                          {item.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Painel Detalhado da Homenagem Selecionada */}
                {activeHomage && (
                  <div className="rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-amber-400/40 p-4 sm:p-5 flex flex-col gap-3.5 shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-center text-2xl shrink-0">
                          🕯️
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-black text-amber-200 leading-snug">
                            {activeHomage.name}
                          </h4>
                          <span className="inline-block text-[11px] font-mono text-cyan-300 mt-0.5">
                            Critério: {activeHomage.rule_label || activeHomage.extra_info}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {activeHomage.conquered ? (
                          <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                            ✓ Ciclo 5/5 Completo
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-black tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-mono">
                            {activeHomage.total_matched ?? activeHomage.current ?? 0} / 5 filmes
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dedicatória Completa */}
                    {activeHomage.rule_desc && (
                      <blockquote className="rounded-r-2xl border-l-4 border-amber-400/75 bg-zinc-900/75 px-4 py-3.5 text-xs sm:text-sm text-zinc-200 italic leading-relaxed">
                        &ldquo;{activeHomage.rule_desc}&rdquo;
                      </blockquote>
                    )}

                    {/* Lista Visual de Filmes Assistidos Nesta Homenagem */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                          Filmes Assistidos em Homenagem ({activeHomageMovies.length})
                        </span>
                        {activeHomageMovies.length > 5 && (
                          <span className="text-cyan-300 font-mono">
                            +{activeHomageMovies.length - 5} além dos 5 ciclos!
                          </span>
                        )}
                      </div>

                      {activeHomageMovies.length === 0 ? (
                        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3 text-xs text-zinc-500 italic">
                          Nenhum filme catalogado com este critério ainda. Assista a um filme que cumpra a regra acima para dedicar a primeira sessão!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeHomageMovies.map((mv, mvIdx) => {
                            const posterSrc = resolveBackendAssetUrl(mv.poster_url);
                            const seenStr =
                              mv.month_seen && mv.year_seen
                                ? `${String(mv.month_seen).padStart(2, '0')}/${mv.year_seen}`
                                : mv.year_seen
                                  ? String(mv.year_seen)
                                  : null;
                            return (
                              <div
                                key={`${mv.title}_${mvIdx}`}
                                className="flex items-center gap-2.5 rounded-xl bg-zinc-950/85 border border-zinc-800/90 p-2 hover:border-amber-500/35 transition-colors"
                              >
                                {posterSrc ? (
                                  <img
                                    src={posterSrc}
                                    alt={mv.title}
                                    className="w-9 h-12 object-cover rounded-lg border border-zinc-800 shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-9 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm shrink-0">
                                    🎬
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-zinc-100 truncate">
                                    {mv.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5 flex-wrap">
                                    {mv.year && <span>{mv.year}</span>}
                                    {seenStr && <span>• Visto em {seenStr}</span>}
                                    {mv.rating !== null && mv.rating !== undefined && (
                                      <span className="text-amber-300 font-bold inline-flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        {Number(mv.rating).toFixed(3)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          ) : null
        ) : (
        /* Lista de Itens do Checklist Padrão */
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[46vh] scrollbar-thin scrollbar-thumb-zinc-700 relative z-10">
          {loadingChecklist && checklistItems.length === 0 ? (
            <div className="py-10 flex items-center justify-center gap-2 text-zinc-400 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Carregando checklist detalhado do banco...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs italic">
              Nenhum item correspondente no checklist.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isConq = Boolean(item.conquered);
              const flagCode = item.flag ? String(item.flag).toLowerCase() : null;
              const flagUrl = flagCode && flagCode.length === 2 ? `https://flagcdn.com/w40/${flagCode}.png` : null;

              return (
                <div
                  key={item.id || item.code || idx}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                    isConq
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-zinc-100'
                      : 'bg-zinc-900/40 border-zinc-800/70 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {isConq ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>

                    {/* Bandeira ou emblema especial se houver */}
                    {flagUrl ? (
                      <img
                        src={flagUrl}
                        alt={item.name}
                        className="w-6 h-4 object-cover rounded shadow-sm border border-zinc-800 shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : item.badge_icon ? (
                      <span className="text-base leading-none shrink-0" title={item.name}>
                        {item.badge_icon}
                      </span>
                    ) : null}

                    {/* Detalhes do Item */}
                    <div className="min-w-0 flex flex-col">
                      <span className={`text-xs font-bold ${isConq ? 'text-zinc-100' : 'text-zinc-300'}`}>
                        {item.name}
                      </span>

                      {item.movie_title && (
                        <span className="text-[11px] text-emerald-400/90 font-medium line-clamp-2 flex items-center gap-1.5 mt-0.5">
                          🎬 {item.movie_title}
                          {item.movie_year ? ` (${item.movie_year})` : ''}
                        </span>
                      )}

                      {item.extra_info && (
                        <span className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                          {item.extra_info}
                        </span>
                      )}

                      {item.rule_desc && (
                        <span className="text-[11px] text-zinc-400/90 italic mt-1 leading-relaxed">
                          {item.rule_desc}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge de Conclusão do Item */}
                  <div className="shrink-0">
                    {isConq ? (
                      <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                        Cumprido
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-zinc-900 text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-md">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}

        {/* Rodapé com Resumo */}
        <div className="border-t border-zinc-800/80 pt-3 flex items-center justify-between text-xs text-zinc-400 relative z-10">
          <span>
            {conqueredCount} de {totalItems} itens cumpridos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
