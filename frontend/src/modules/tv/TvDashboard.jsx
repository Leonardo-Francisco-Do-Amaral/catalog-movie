import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Tv,
  RefreshCw,
  CheckCircle2,
  Trophy,
  Sparkles,
  Plus,
} from 'lucide-react';
import './theme.css';
import TvTopNavbar from './components/TvTopNavbar';
import ShowCard from './components/ShowCard';
import ShowFormModal from './components/ShowFormModal';
import AppendSeasonModal from './components/AppendSeasonModal';
import TvStatsPage from './pages/TvStatsPage';
import TvStudiosLeaguePage from './pages/TvStudiosLeaguePage';
import TvVoiceAlbumPage from './pages/TvVoiceAlbumPage';
import {
  STUDIO_TIER_META,
  deleteTvShowById,
  fetchTvCatalog,
  patchSeasonProgress,
  saveTvShow,
} from './utils/tvApi';

const GRID_CLASS_BY_COLS = {
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  7: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7',
};

export default function TvDashboard({ modeSwitcher = null, onLockApp = null }) {
  const [shows, setShows] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [xpStatus, setXpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDemographics, setSelectedDemographics] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedStudios, setSelectedStudios] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [gridCols, setGridCols] = useState(5);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [initialFormSearch, setInitialFormSearch] = useState('');
  const [appendTargetShow, setAppendTargetShow] = useState(null);
  const [completionPromptShow, setCompletionPromptShow] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [celebrationBanner, setCelebrationBanner] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? '' : curr));
    }, 3800);
  }, []);

  const handleXpEventCelebration = useCallback(
    (xpEvent) => {
      if (!xpEvent) return;
      if (xpEvent.leveledUp || (xpEvent.newlyUpgradedStudios && xpEvent.newlyUpgradedStudios.length > 0)) {
        setCelebrationBanner(xpEvent);
        setTimeout(() => {
          setCelebrationBanner((curr) => (curr === xpEvent ? null : curr));
        }, 6500);
      }
    },
    []
  );

  const handleVoiceAlbumXpUpdated = useCallback((nextXp) => {
    if (!nextXp) return;
    setXpStatus((prev) => {
      if (
        prev &&
        prev.currentLevel === nextXp.currentLevel &&
        prev.totalXp === nextXp.totalXp &&
        prev.levelTitle === nextXp.levelTitle
      ) {
        return prev;
      }
      return nextXp;
    });
  }, []);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchTvCatalog();
      setShows(res.data || []);
      setFilterOptions(res.filters || {});
      setXpStatus(res.xpStatus || null);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Erro ao carregar o catálogo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const toggleItem = (setter) => (value) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const clearCategory = (key) => {
    if (key === 'demographics') setSelectedDemographics([]);
    if (key === 'genres') setSelectedGenres([]);
    if (key === 'studios') setSelectedStudios([]);
    if (key === 'staff') setSelectedStaff([]);
    if (key === 'years') setSelectedYears([]);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setKindFilter('all');
    setStatusFilter('all');
    setSelectedDemographics([]);
    setSelectedGenres([]);
    setSelectedStudios([]);
    setSelectedStaff([]);
    setSelectedYears([]);
  };

  const filteredShows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = shows.filter((show) => {
      if (kindFilter !== 'all' && show.kind !== kindFilter) return false;
      if (statusFilter !== 'all' && show.watch_status !== statusFilter) return false;

      if (selectedDemographics.length > 0) {
        const demos = (show.genres || [])
          .filter((g) => g.group_type === 'demographic')
          .map((g) => g.name);
        if (!selectedDemographics.some((d) => demos.includes(d))) return false;
      }

      if (selectedGenres.length > 0) {
        const gens = (show.genres || [])
          .filter((g) => g.group_type === 'genre')
          .map((g) => g.name);
        if (!selectedGenres.some((g) => gens.includes(g))) return false;
      }

      if (selectedStudios.length > 0) {
        const st = (show.studios || []).map((s) => s.name);
        if (!selectedStudios.some((s) => st.includes(s))) return false;
      }

      if (selectedStaff.length > 0) {
        const stf = [...(show.creators || []), ...(show.directors || [])];
        if (!selectedStaff.some((p) => stf.includes(p))) return false;
      }

      if (selectedYears.length > 0) {
        if (!selectedYears.includes(Number(show.start_year))) return false;
      }

      if (q) {
        const haystack = [
          show.title,
          show.original_title,
          show.best_song_title,
          ...(show.studios || []).map((s) => s.name),
          ...(show.creators || []),
          ...(show.directors || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'user_rating') return (b.user_rating ?? -1) - (a.user_rating ?? -1);
      if (sortBy === 'music_rating') return (b.music_rating ?? -1) - (a.music_rating ?? -1);
      if (sortBy === 'external_score') return (b.external_score ?? -1) - (a.external_score ?? -1);
      if (sortBy === 'episodes_desc') return (b.watchedEpisodes ?? 0) - (a.watchedEpisodes ?? 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'pt');
      // recent (year_seen/month_seen/updated_at)
      const aTime = (a.year_seen || 0) * 100 + (a.month_seen || 0);
      const bTime = (b.year_seen || 0) * 100 + (b.month_seen || 0);
      if (bTime !== aTime) return bTime - aTime;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [
    shows,
    searchQuery,
    kindFilter,
    statusFilter,
    selectedDemographics,
    selectedGenres,
    selectedStudios,
    selectedStaff,
    selectedYears,
    sortBy,
  ]);

  const quickStats = useMemo(() => {
    const totalShows = shows.length;
    const totalEpisodes = shows.reduce((sum, s) => sum + (s.watchedEpisodes || 0), 0);
    const totalHours = shows.reduce((sum, s) => sum + (s.totalHoursWatched || 0), 0);
    const completedCount = shows.filter((s) => s.watch_status === 'completed').length;
    return {
      totalShows,
      totalEpisodes,
      totalHours: Number(totalHours.toFixed(1)),
      completedCount,
    };
  }, [shows]);

  const handleSavedShow = (savedShow, nextXp, xpDelta, wasEdit, xpEvent) => {
    setShows((prev) => {
      const exists = prev.some((s) => s.id === savedShow.id);
      if (exists) return prev.map((s) => (s.id === savedShow.id ? savedShow : s));
      return [savedShow, ...prev];
    });
    if (nextXp) setXpStatus(nextXp);
    // Recarrega metadados de filtros silenciosamente
    fetchTvCatalog()
      .then((res) => setFilterOptions(res.filters || {}))
      .catch(() => {});
    const xpTxt = xpDelta > 0 ? ` (+${xpDelta} XP Sakura!)` : '';
    showToast(`${wasEdit ? 'Obra atualizada' : 'Obra cadastrada'}: ${savedShow.title}${xpTxt}`);
    handleXpEventCelebration(xpEvent);
  };

  const handleIncrementSeason = async (seasonId, payload) => {
    try {
      const res = await patchSeasonProgress(seasonId, payload);
      const updated = res.data;
      setShows((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      if (res.xpStatus) setXpStatus(res.xpStatus);
      if (res.xpDelta > 0) {
        showToast(`+${res.xpDelta} XP Sakura!`);
      }
      handleXpEventCelebration(res.xpEvent);
      if (res.allSeasonsCompleted && updated.watch_status !== 'completed') {
        setCompletionPromptShow(updated);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao atualizar episódio.');
    }
  };

  const handleConfirmCompleteShow = async (show) => {
    try {
      const res = await saveTvShow(
        show.id,
        {
          kind: show.kind,
          title: show.title,
          original_title: show.original_title,
          primary_source: show.primary_source,
          mal_id: show.mal_id,
          tmdb_tv_id: show.tmdb_tv_id,
          imdb_id: show.imdb_id,
          poster_url: show.poster_url,
          synopsis: show.synopsis,
          start_year: show.start_year,
          end_year: show.end_year,
          airing_status: show.airing_status,
          origin_country: show.origin_country,
          external_score: show.external_score,
          watch_status: 'completed',
          user_rating: show.user_rating,
          music_rating: show.music_rating,
          best_song_title: show.best_song_title,
          best_song_kind: show.best_song_kind,
          best_season_number: show.best_season_number,
          month_seen: show.month_seen,
          year_seen: show.year_seen,
          audio_type: show.audio_type,
          platform: show.platform,
          review_notes: show.review_notes,
          studios: show.studios,
          genres: (show.genres || []).filter((g) => g.group_type === 'genre').map((g) => g.name),
          demographics: (show.genres || []).filter((g) => g.group_type === 'demographic').map((g) => g.name),
          creators: show.creators || [],
          directors: show.directors || [],
          seasons: show.seasons || [],
        },
        null
      );
      setShows((prev) => prev.map((s) => (s.id === res.data.id ? res.data : s)));
      if (res.xpStatus) setXpStatus(res.xpStatus);
      setCompletionPromptShow(null);
      showToast(`"${show.title}" marcada como Concluída! (+${res.xpDelta || 50} XP)`);
      handleXpEventCelebration(res.xpEvent);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao concluir obra.');
    }
  };

  const handleDeleteShow = async (show) => {
    if (!window.confirm(`Excluir "${show.title}" e todo o histórico de episódios deste módulo?`)) {
      return;
    }
    try {
      const res = await deleteTvShowById(show.id);
      setShows((prev) => prev.filter((s) => s.id !== show.id));
      if (res.xpStatus) setXpStatus(res.xpStatus);
      showToast(`"${show.title}" removida do catálogo.`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao excluir obra.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col tv-sakura-theme text-zinc-100 overflow-x-clip">
      <TvTopNavbar
        modeSwitcher={modeSwitcher}
        onLockApp={onLockApp}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        kindFilter={kindFilter}
        setKindFilter={setKindFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedDemographics={selectedDemographics}
        toggleDemographic={toggleItem(setSelectedDemographics)}
        selectedGenres={selectedGenres}
        toggleGenre={toggleItem(setSelectedGenres)}
        selectedStudios={selectedStudios}
        toggleStudio={toggleItem(setSelectedStudios)}
        selectedStaff={selectedStaff}
        toggleStaff={toggleItem(setSelectedStaff)}
        selectedYears={selectedYears}
        toggleYear={toggleItem(setSelectedYears)}
        clearCategory={clearCategory}
        clearAllFilters={clearAllFilters}
        filterOptions={filterOptions}
        xpStatus={xpStatus}
        onAddShow={() => {
          setEditingShow(null);
          setInitialFormSearch('');
          setIsFormOpen(true);
        }}
      />

      {/* Celebração de Level Up e Subida de Tier na Liga dos Estúdios */}
      {celebrationBanner && (
        <div className="fixed top-20 right-5 z-50 max-w-sm bg-gradient-to-br from-pink-950/95 via-purple-950/95 to-zinc-950/95 border border-pink-400/70 rounded-2xl p-4 shadow-2xl shadow-pink-500/25 space-y-2">
          {celebrationBanner.leveledUp && (
            <div className="text-xs text-pink-100 font-bold">
              <div className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                ⛩️ Level Up! Nível {celebrationBanner.newLevel}
              </div>
              <div>{celebrationBanner.newTitle}</div>
            </div>
          )}
          {(celebrationBanner.newlyUpgradedStudios || []).map((st) => {
            const meta = STUDIO_TIER_META[st.newTier] || STUDIO_TIER_META.bronze;
            const gainedStarsOnly =
              st.newTier === st.prevTier && (st.newExtraStars || 0) > (st.prevExtraStars || 0);
            return (
              <div key={st.studioId} className="text-xs text-fuchsia-100 font-bold flex items-center gap-2">
                <span>{st.emoji}</span>
                <span>
                  {gainedStarsOnly
                    ? `${st.studioName} conquistou ★${st.newExtraStars} pós-Mítico (+30 XP)!`
                    : `${st.studioName} subiu para ${meta.icon} ${meta.label}${
                        st.newExtraStars > 0 ? ` ★${st.newExtraStars}` : ''
                      } (+${st.newXpEarned} XP)!`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Sakura flutuante */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-950/95 border border-pink-500/60 text-pink-100 px-4 py-2.5 rounded-xl shadow-2xl shadow-pink-500/20 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Banner sugerindo conclusão automática quando última temporada é completada */}
      {completionPromptShow && (
        <div className="mx-4 sm:mx-6 lg:mx-10 mt-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Todas as temporadas de <strong>{completionPromptShow.title}</strong> foram assistidas! Deseja marcar a obra como <strong>Concluída</strong> (+50 XP)?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleConfirmCompleteShow(completionPromptShow)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase cursor-pointer"
            >
              Sim, Concluir!
            </button>
            <button
              type="button"
              onClick={() => setCompletionPromptShow(null)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6">
        {loading ? (
          <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Carregando Catálogo de Animes &amp; Séries...
            </span>
          </div>
        ) : activeTab === 'analytics' ? (
          <TvStatsPage
            onSelectShow={(showId) => {
              const target = shows.find((s) => s.id === showId);
              if (target) {
                setEditingShow(target);
                setIsFormOpen(true);
              }
            }}
          />
        ) : activeTab === 'studios_league' ? (
          <TvStudiosLeaguePage
            onAddShowByTitle={(title) => {
              setEditingShow(null);
              setInitialFormSearch(title);
              setIsFormOpen(true);
            }}
            onEditShowById={(showId) => {
              const target = shows.find((s) => s.id === showId);
              if (target) {
                setEditingShow(target);
                setIsFormOpen(true);
              }
            }}
          />
        ) : activeTab === 'voice_album' ? (
          <TvVoiceAlbumPage
            onAddShowByTitle={(title) => {
              setEditingShow(null);
              setInitialFormSearch(title);
              setIsFormOpen(true);
            }}
            onEditShowById={(showId) => {
              const target = shows.find((s) => s.id === showId);
              if (target) {
                setEditingShow(target);
                setIsFormOpen(true);
              }
            }}
            onXpUpdated={handleVoiceAlbumXpUpdated}
          />
        ) : activeTab === 'trophies' ? (
          <section className="max-w-3xl mx-auto bg-zinc-900/60 border border-fuchsia-500/25 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-fuchsia-400" />
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-100">
                Liga dos Estúdios &amp; Troféus Exclusivos (Fases 3 e 5)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Os <strong>~40 Troféus enxutos do módulo TV</strong> (avaliados em pipeline isolado, sem gerar gargalo com os 560 troféus de Cinema) chegarão na Fase 5. A <strong>Liga dos Estúdios Lendários</strong> já está disponível na aba própria!
            </p>
          </section>
        ) : (
          <div className="space-y-5">
            {errorMsg && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs rounded-xl px-4 py-3">
                {errorMsg}
              </div>
            )}

            {/* Barra de Título do Catálogo + Resumo + Controles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-500/15 pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Tv className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-zinc-100">
                  Catálogo Animes, Séries &amp; Doramas
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/35 text-pink-300 text-xs font-black">
                  {filteredShows.length} {filteredShows.length === 1 ? 'obra' : 'obras'}
                </span>
                <span className="text-xs text-zinc-400 hidden md:inline">
                  · {quickStats.totalEpisodes} eps · {quickStats.totalHours}h assistidas
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Densidade do Grid */}
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
                  <span className="text-zinc-500 text-[11px]">Colunas:</span>
                  {[4, 5, 7].map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => setGridCols(cols)}
                      className={`px-2 py-0.5 rounded font-black text-[11px] cursor-pointer ${
                        gridCols === cols
                          ? 'bg-pink-500 text-white'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>

                {/* Ordenação */}
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-zinc-500">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-zinc-200 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="recent" className="bg-zinc-950">Vistos / Atualizados</option>
                    <option value="user_rating" className="bg-zinc-950">Minha Nota</option>
                    <option value="music_rating" className="bg-zinc-950">Nota da Música</option>
                    <option value="external_score" className="bg-zinc-950">Nota MAL / IMDb</option>
                    <option value="episodes_desc" className="bg-zinc-950">Mais Episódios</option>
                    <option value="title" className="bg-zinc-950">Ordem Alfabética (A–Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredShows.length === 0 ? (
              <div className="min-h-[42vh] bg-zinc-900/40 border border-dashed border-pink-500/25 rounded-2xl flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-2xl">
                  ⛩️
                </div>
                <h3 className="text-base font-black text-zinc-200">
                  {shows.length === 0
                    ? 'Seu catálogo de Animes & Séries está pronto!'
                    : 'Nenhuma obra encontrada com esses filtros'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md">
                  {shows.length === 0
                    ? 'Cadastre seu primeiro anime via Jikan (MyAnimeList) ou série/dorama via TMDB, controle temporadas, músicas favoritas e progresso por episódio.'
                    : 'Tente limpar a busca ou ajustar os filtros de tipo, status ou estúdio.'}
                </p>
                {shows.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingShow(null);
                      setIsFormOpen(true);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-pink-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Primeira Obra</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-1 px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-pink-300 cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${GRID_CLASS_BY_COLS[gridCols] || GRID_CLASS_BY_COLS[5]}`}>
                {filteredShows.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    gridCols={gridCols}
                    onEdit={(item) => {
                      setEditingShow(item);
                      setIsFormOpen(true);
                    }}
                    onDelete={handleDeleteShow}
                    onIncrementSeason={handleIncrementSeason}
                    onOpenAppendSeason={(item) => setAppendTargetShow(item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ShowFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingShow(null);
          setInitialFormSearch('');
        }}
        editingShow={editingShow}
        initialSearchQuery={initialFormSearch}
        onSaved={handleSavedShow}
      />

      <AppendSeasonModal
        isOpen={Boolean(appendTargetShow)}
        show={appendTargetShow}
        onClose={() => setAppendTargetShow(null)}
        onShowUpdated={(updated, nextXp, xpDelta, xpEvent) => {
          setShows((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          if (nextXp) setXpStatus(nextXp);
          showToast(
            `Temporada anexada em ${updated.title}${xpDelta > 0 ? ` (+${xpDelta} XP)` : ''}!`
          );
          handleXpEventCelebration(xpEvent);
        }}
      />
    </div>
  );
}
