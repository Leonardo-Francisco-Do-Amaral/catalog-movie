import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Music,
  Calendar,
  Upload,
  Sparkles,
  Film,
  Star,
} from 'lucide-react';
import {
  MONTH_OPTIONS_PT,
  fetchJikanSeasonDetails,
  fetchTvExternalDetails,
  resolveTvPosterUrl,
  saveTvShow,
  searchTvExternal,
} from '../utils/tvApi';

const EMPTY_SEASON = (num = 1, kind = 'anime') => ({
  season_number: num,
  label: `Temporada ${num}`,
  season_type: 'tv',
  mal_id: null,
  tmdb_season_number: null,
  episodes_total: null,
  episodes_watched: 0,
  episode_duration_min: kind === 'anime' ? 24 : 45,
  year: null,
  external_score: null,
  poster_url: null,
  themes: { openings: [], endings: [] },
  customDate: false,
  month_seen: '',
  year_seen: '',
});

const INITIAL_FORM = {
  kind: 'anime',
  title: '',
  original_title: '',
  primary_source: 'mal',
  mal_id: null,
  tmdb_tv_id: null,
  imdb_id: '',
  poster_url: '',
  synopsis: '',
  start_year: '',
  end_year: '',
  airing_status: '',
  origin_country: '',
  external_score: '',
  watch_status: 'watching',
  user_rating: '',
  music_rating: '',
  best_song_title: '',
  best_song_kind: '',
  best_season_number: '',
  month_seen: '',
  year_seen: '',
  audio_type: 'Legendado',
  platform: '',
  review_notes: '',
  studiosText: '',
  genresText: '',
  demographicsText: '',
  creatorsText: '',
  directorsText: '',
  raw_api_data: {},
};

function mapShowToForm(show) {
  const studios = (show.studios || []).map((s) => s.name).join(', ');
  const genres = (show.genres || [])
    .filter((g) => g.group_type === 'genre')
    .map((g) => g.name)
    .join(', ');
  const demographics = (show.genres || [])
    .filter((g) => g.group_type === 'demographic')
    .map((g) => g.name)
    .join(', ');

  return {
    kind: show.kind || 'anime',
    title: show.title || '',
    original_title: show.original_title || '',
    primary_source: show.primary_source || 'manual',
    mal_id: show.mal_id || null,
    tmdb_tv_id: show.tmdb_tv_id || null,
    imdb_id: show.imdb_id || '',
    poster_url: show.poster_url || '',
    synopsis: show.synopsis || '',
    start_year: show.start_year ? String(show.start_year) : '',
    end_year: show.end_year ? String(show.end_year) : '',
    airing_status: show.airing_status || '',
    origin_country: show.origin_country || '',
    external_score:
      show.external_score !== null && show.external_score !== undefined
        ? String(show.external_score)
        : '',
    watch_status: show.watch_status || 'watching',
    user_rating:
      show.user_rating !== null && show.user_rating !== undefined ? String(show.user_rating) : '',
    music_rating:
      show.music_rating !== null && show.music_rating !== undefined ? String(show.music_rating) : '',
    best_song_title: show.best_song_title || '',
    best_song_kind: show.best_song_kind || '',
    best_season_number:
      show.best_season_number !== null && show.best_season_number !== undefined
        ? String(show.best_season_number)
        : '',
    month_seen: show.month_seen ? String(show.month_seen) : '',
    year_seen: show.year_seen ? String(show.year_seen) : '',
    audio_type: show.audio_type || 'Legendado',
    platform: show.platform || '',
    review_notes: show.review_notes || '',
    studiosText: studios,
    genresText: genres,
    demographicsText: demographics,
    creatorsText: (show.creators || []).join(', '),
    directorsText: (show.directors || []).join(', '),
    raw_api_data: {},
  };
}

export default function ShowFormModal({ isOpen, onClose, editingShow, onSaved, initialSearchQuery = '' }) {
  const isEdit = Boolean(editingShow?.id);

  const [searchSource, setSearchSource] = useState('jikan'); // 'jikan' | 'tmdb' | 'manual'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);
  const [seasons, setSeasons] = useState([EMPTY_SEASON(1, 'anime')]);
  const [studioObjects, setStudioObjects] = useState([]);
  const [relatedSeasons, setRelatedSeasons] = useState([]);
  const [availablePosters, setAvailablePosters] = useState([]);

  // Busca secundária para anexar temporadas extras do MAL
  const [seasonSearchQuery, setSeasonSearchQuery] = useState('');
  const [seasonSearchResults, setSeasonSearchResults] = useState([]);
  const [loadingSeasonAppend, setLoadingSeasonAppend] = useState(false);

  const [posterFile, setPosterFile] = useState(null);
  const [posterFilePreview, setPosterFilePreview] = useState('');
  const [songManualMode, setSongManualMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setPosterFile(null);
    setPosterFilePreview('');
    setSearchResults([]);
    setSeasonSearchQuery('');
    setSeasonSearchResults([]);

    if (editingShow) {
      setForm(mapShowToForm(editingShow));
      setStudioObjects(editingShow.studios || []);
      setSeasons(
        (editingShow.seasons && editingShow.seasons.length > 0
          ? editingShow.seasons
          : [EMPTY_SEASON(1, editingShow.kind)]
        ).map((s, idx) => ({
          ...s,
          season_number: idx + 1,
          customDate: Boolean(s.month_seen || s.year_seen),
          month_seen: s.month_seen ? String(s.month_seen) : '',
          year_seen: s.year_seen ? String(s.year_seen) : '',
          themes: s.themes || { openings: [], endings: [] },
        }))
      );
      setSearchSource(editingShow.primary_source === 'tmdb' ? 'tmdb' : editingShow.primary_source === 'mal' ? 'jikan' : 'manual');
      setAvailablePosters([]);
      setRelatedSeasons([]);
      setSongManualMode(Boolean(editingShow.best_song_title && editingShow.best_song_kind === 'manual'));

      // Se é anime do MAL, busca relações pendentes em segundo plano
      const seedMal = [...(editingShow.seasons || [])].reverse().find((s) => s.mal_id)?.mal_id || editingShow.mal_id;
      if (seedMal) {
        fetchTvExternalDetails('jikan', seedMal)
          .then((b) => setRelatedSeasons(b?.relatedSeasons || []))
          .catch(() => {});
      }
    } else {
      setForm(INITIAL_FORM);
      setSeasons([EMPTY_SEASON(1, 'anime')]);
      setStudioObjects([]);
      setRelatedSeasons([]);
      setAvailablePosters([]);
      setSearchSource('jikan');
      setSearchQuery(initialSearchQuery || '');
      setSearchYear('');
      setSongManualMode(false);
      if (initialSearchQuery && initialSearchQuery.trim()) {
        setSearching(true);
        searchTvExternal('jikan', initialSearchQuery.trim())
          .then((results) => setSearchResults(results))
          .catch(() => {})
          .finally(() => setSearching(false));
      }
    }
  }, [isOpen, editingShow, initialSearchQuery]);

  useEffect(() => {
    if (!posterFile) {
      setPosterFilePreview('');
      return;
    }
    const url = URL.createObjectURL(posterFile);
    setPosterFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  // Todas as aberturas e encerramentos das temporadas anexadas
  const songOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    seasons.forEach((s, idx) => {
      const openings = s.themes?.openings || [];
      const endings = s.themes?.endings || [];
      openings.forEach((title) => {
        const key = `opening::${title.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ title, kind: 'opening', label: `OP (T${idx + 1}): ${title}` });
        }
      });
      endings.forEach((title) => {
        const key = `ending::${title.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ title, kind: 'ending', label: `ED (T${idx + 1}): ${title}` });
        }
      });
    });
    return list;
  }, [seasons]);

  if (!isOpen) return null;

  const handleExternalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchSource === 'manual') return;
    setErrorMsg('');
    setSearching(true);
    try {
      const results = await searchTvExternal(
        searchSource,
        searchQuery.trim(),
        searchYear ? Number(searchYear) : undefined
      );
      setSearchResults(results);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setSearching(false);
    }
  };

  const handlePickSearchResult = async (item) => {
    if (item.isMovie) {
      setErrorMsg(
        `"${item.title}" é um longa-metragem de anime (Movie). Cadastre no modo 🎬 Filmes.`
      );
      return;
    }
    setErrorMsg('');
    setLoadingDetails(true);
    try {
      const bundle = await fetchTvExternalDetails(item.source, item.id);
      setForm((prev) => ({
        ...prev,
        kind: bundle.suggestedKind || prev.kind,
        title: bundle.title || prev.title,
        original_title: bundle.original_title || '',
        primary_source: bundle.source === 'jikan' ? 'mal' : 'tmdb',
        mal_id: bundle.mal_id,
        tmdb_tv_id: bundle.tmdb_tv_id,
        imdb_id: bundle.imdb_id || '',
        poster_url: bundle.poster_url || '',
        synopsis: bundle.synopsis || '',
        start_year: bundle.start_year ? String(bundle.start_year) : '',
        end_year: bundle.end_year ? String(bundle.end_year) : '',
        airing_status: bundle.airing_status || '',
        origin_country: bundle.origin_country || '',
        external_score:
          bundle.external_score !== null && bundle.external_score !== undefined
            ? String(bundle.external_score)
            : '',
        studiosText: (bundle.studios || []).map((s) => s.name).join(', '),
        genresText: (bundle.genres || []).join(', '),
        demographicsText: (bundle.demographics || []).join(', '),
        creatorsText: (bundle.creators || []).join(', '),
        directorsText: (bundle.directors || []).join(', '),
        raw_api_data: bundle.raw_api_data || {},
      }));

      setStudioObjects(bundle.studios || []);
      setAvailablePosters(bundle.available_posters || []);
      setRelatedSeasons(bundle.relatedSeasons || []);
      setSeasons(
        (bundle.seasons || [EMPTY_SEASON(1, bundle.suggestedKind)]).map((s, idx) => ({
          ...s,
          season_number: idx + 1,
          customDate: false,
          month_seen: '',
          year_seen: '',
          themes: s.themes || { openings: [], endings: [] },
        }))
      );
      setSearchResults([]);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAttachMalSeason = async (malId) => {
    if (seasons.some((s) => Number(s.mal_id) === Number(malId))) {
      setErrorMsg('Esta temporada já está incluída na lista acima.');
      return;
    }
    setErrorMsg('');
    setLoadingSeasonAppend(true);
    try {
      const nextNum = seasons.length + 1;
      const data = await fetchJikanSeasonDetails(malId, nextNum);
      setSeasons((prev) => [
        ...prev,
        {
          ...data.season,
          season_number: prev.length + 1,
          customDate: false,
          month_seen: '',
          year_seen: '',
        },
      ]);

      // Mescla novos estúdios e novas relações sugeridas (ex: S2 sugere S3)
      if (Array.isArray(data.studios) && data.studios.length > 0) {
        setStudioObjects((prev) => {
          const map = new Map(prev.map((s) => [s.name.toLowerCase(), s]));
          data.studios.forEach((s) => {
            if (!map.has(s.name.toLowerCase())) map.set(s.name.toLowerCase(), s);
          });
          const merged = Array.from(map.values());
          setForm((f) => ({ ...f, studiosText: merged.map((s) => s.name).join(', ') }));
          return merged;
        });
      }

      if (Array.isArray(data.relatedSeasons) && data.relatedSeasons.length > 0) {
        setRelatedSeasons((prev) => {
          const seen = new Set(prev.map((r) => r.mal_id));
          const merged = [...prev];
          data.relatedSeasons.forEach((r) => {
            if (!seen.has(r.mal_id)) {
              seen.add(r.mal_id);
              merged.push(r);
            }
          });
          return merged;
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoadingSeasonAppend(false);
    }
  };

  const handleMiniSeasonSearch = async () => {
    if (!seasonSearchQuery.trim()) return;
    setErrorMsg('');
    setLoadingSeasonAppend(true);
    try {
      const res = await searchTvExternal('jikan', seasonSearchQuery.trim());
      setSeasonSearchResults(res);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoadingSeasonAppend(false);
    }
  };

  const updateSeasonAt = (idx, patch) => {
    setSeasons((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const removeSeasonAt = (idx) => {
    if (seasons.length <= 1) return;
    setSeasons((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, season_number: i + 1 }))
    );
  };

  const handleAddManualSeason = () => {
    setSeasons((prev) => [...prev, EMPTY_SEASON(prev.length + 1, form.kind)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg('Informe o título da obra.');
      return;
    }
    setErrorMsg('');
    setSaving(true);
    try {
      const studioNames = form.studiosText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const studioMalByName = new Map(
        studioObjects.map((s) => [s.name.toLowerCase(), s.mal_id ?? null])
      );
      const studiosPayload = studioNames.map((name) => ({
        name,
        mal_id: studioMalByName.get(name.toLowerCase()) ?? null,
      }));

      const payload = {
        kind: form.kind,
        title: form.title.trim(),
        original_title: form.original_title.trim() || null,
        primary_source: form.primary_source || 'manual',
        mal_id: form.mal_id || null,
        tmdb_tv_id: form.tmdb_tv_id || null,
        imdb_id: form.imdb_id.trim() || null,
        poster_url: form.poster_url.trim() || null,
        synopsis: form.synopsis.trim() || null,
        start_year: form.start_year ? Number(form.start_year) : null,
        end_year: form.end_year ? Number(form.end_year) : null,
        airing_status: form.airing_status || null,
        origin_country: form.origin_country || null,
        external_score: form.external_score !== '' ? Number(form.external_score) : null,
        watch_status: form.watch_status,
        user_rating: form.user_rating !== '' ? form.user_rating : null,
        music_rating: form.music_rating !== '' ? form.music_rating : null,
        best_song_title: form.best_song_title.trim() || null,
        best_song_kind: form.best_song_title.trim()
          ? form.best_song_kind || 'manual'
          : null,
        best_season_number: form.best_season_number ? Number(form.best_season_number) : null,
        month_seen: form.month_seen ? Number(form.month_seen) : null,
        year_seen: form.year_seen ? Number(form.year_seen) : null,
        audio_type: form.audio_type || null,
        platform: form.platform.trim() || null,
        review_notes: form.review_notes.trim() || null,
        raw_api_data: form.raw_api_data || {},
        studios: studiosPayload,
        genres: form.genresText.split(',').map((s) => s.trim()).filter(Boolean),
        demographics: form.demographicsText.split(',').map((s) => s.trim()).filter(Boolean),
        creators: form.creatorsText.split(',').map((s) => s.trim()).filter(Boolean),
        directors: form.directorsText.split(',').map((s) => s.trim()).filter(Boolean),
        seasons: seasons.map((s, idx) => ({
          id: s.id,
          season_number: idx + 1,
          label: s.label.trim() || `Temporada ${idx + 1}`,
          season_type: s.season_type || 'tv',
          mal_id: s.mal_id || null,
          tmdb_season_number: s.tmdb_season_number ?? null,
          episodes_total:
            s.episodes_total !== null && s.episodes_total !== '' ? Number(s.episodes_total) : null,
          episodes_watched: Number(s.episodes_watched || 0),
          episode_duration_min:
            s.episode_duration_min !== null && s.episode_duration_min !== ''
              ? Number(s.episode_duration_min)
              : 24,
          year: s.year ? Number(s.year) : null,
          external_score: s.external_score !== null && s.external_score !== '' ? Number(s.external_score) : null,
          poster_url: s.poster_url || null,
          themes: s.themes || { openings: [], endings: [] },
          month_seen: s.customDate && s.month_seen ? Number(s.month_seen) : null,
          year_seen: s.customDate && s.year_seen ? Number(s.year_seen) : null,
        })),
      };

      const res = await saveTvShow(editingShow?.id, payload, posterFile);
      onSaved(res.data, res.xpStatus, res.xpDelta, isEdit, res.xpEvent);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const attachedMalIds = new Set(seasons.map((s) => Number(s.mal_id)).filter(Boolean));
  const posterPreviewUrl = posterFilePreview || resolveTvPosterUrl(form.poster_url);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-zinc-950 border border-pink-500/35 rounded-2xl shadow-2xl shadow-pink-500/15 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-zinc-950 border-b border-pink-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">
              {isEdit ? 'Editar Obra do Catálogo' : '⛩️ Nova Obra (Animes, Séries & Doramas)'}
            </span>
            <h2 className="text-lg font-black text-zinc-100">
              {isEdit ? form.title : 'Buscar nas APIs ou Cadastrar Manualmente'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto tv-sakura-scroll space-y-6">
          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-rose-500/15 border border-rose-500/45 text-rose-200 text-xs rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BLOCO 1: Busca Jikan / TMDB */}
          {!isEdit && (
            <div className="bg-zinc-900/55 border border-pink-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'jikan', label: '⛩️ Anime (Jikan / MyAnimeList)' },
                  { id: 'tmdb', label: '📺 Série, Animação Ocidental ou Dorama (TMDB)' },
                  { id: 'manual', label: '✍️ Preencher Manualmente' },
                ].map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      setSearchSource(src.id);
                      setSearchResults([]);
                      if (src.id === 'manual') {
                        setForm((p) => ({ ...p, primary_source: 'manual' }));
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      searchSource === src.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>

              {searchSource !== 'manual' && (
                <>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleExternalSearch(e);
                          }
                        }}
                        placeholder={
                          searchSource === 'jikan'
                            ? 'Ex: Bleach, Fullmetal Alchemist, Given, Frieren...'
                            : 'Ex: Round 6, Liga da Justiça, Breaking Bad, Arcane...'
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-pink-500/60 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <input
                      type="number"
                      value={searchYear}
                      onChange={(e) => setSearchYear(e.target.value)}
                      placeholder="Ano (opc.)"
                      className="w-full sm:w-28 bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={searching}
                      onClick={handleExternalSearch}
                      className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-black uppercase cursor-pointer disabled:opacity-60"
                    >
                      {searching ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>

                  {loadingDetails && (
                    <div className="flex items-center gap-2 text-xs text-pink-300 py-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Carregando metadados, estúdios, autor/direção e músicas...</span>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto tv-sakura-scroll pr-1">
                      {searchResults.map((item) => (
                        <button
                          key={`${item.source}-${item.id}`}
                          type="button"
                          disabled={item.isMovie || loadingDetails}
                          onClick={() => handlePickSearchResult(item)}
                          className={`flex items-center gap-3 text-left p-2.5 rounded-xl border transition-all ${
                            item.isMovie
                              ? 'bg-zinc-950/60 border-amber-500/35 opacity-75 cursor-not-allowed'
                              : 'bg-zinc-950 border-zinc-800 hover:border-pink-500/60 hover:bg-pink-500/5 cursor-pointer'
                          }`}
                        >
                          {item.poster_url ? (
                            <img
                              src={item.poster_url}
                              alt={item.title}
                              className="w-11 h-16 object-cover rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-16 bg-zinc-900 rounded-lg shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-zinc-100 truncate">{item.title}</div>
                            {item.original_title && (
                              <div className="text-[10px] text-zinc-400 truncate">{item.original_title}</div>
                            )}
                            <div className="text-[10px] text-zinc-400 mt-1 flex flex-wrap gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200 font-bold">
                                {item.mediaTypeLabel}
                              </span>
                              {item.year && <span>{item.year}</span>}
                              {item.episodes && <span>· {item.episodes} eps</span>}
                              {item.external_score && <span>· ★ {item.external_score}</span>}
                            </div>
                            {item.isMovie && (
                              <div className="text-[10px] text-amber-400 font-bold mt-1 flex items-center gap-1">
                                <Film className="w-3 h-3" />
                                Longa-metragem — cadastre no modo Filmes
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* BLOCO 2: Identidade, Capa e Status */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Capa */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="aspect-[2/3] w-full max-w-[200px] mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                {posterPreviewUrl ? (
                  <img src={posterPreviewUrl} alt="Prévia da capa" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-zinc-500">Sem capa</span>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400">URL da Capa</label>
                <input
                  type="text"
                  value={form.poster_url}
                  onChange={(e) => setForm((p) => ({ ...p, poster_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-zinc-200 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-pink-400" />
                  <span>{posterFile ? posterFile.name : 'Upload Capa Local'}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  />
                </label>
                {posterFile && (
                  <button
                    type="button"
                    onClick={() => setPosterFile(null)}
                    className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-rose-300 cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {availablePosters.length > 1 && (
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400">Pôsteres TMDB</span>
                  <div className="flex gap-1.5 overflow-x-auto py-1 tv-sakura-scroll">
                    {availablePosters.map((opt) => (
                      <button
                        key={opt.file_path}
                        type="button"
                        onClick={() => {
                          setPosterFile(null);
                          setForm((p) => ({ ...p, poster_url: opt.url }));
                        }}
                        className={`w-10 h-14 rounded overflow-hidden border-2 shrink-0 cursor-pointer ${
                          form.poster_url === opt.url ? 'border-pink-500' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={opt.thumb_url} alt="Poster" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Campos principais */}
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Título Exibido *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Título Original</label>
                  <input
                    type="text"
                    value={form.original_title}
                    onChange={(e) => setForm((p) => ({ ...p, original_title: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Categoria</label>
                  <select
                    value={form.kind}
                    onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100"
                  >
                    <option value="anime">⛩️ Anime</option>
                    <option value="series">📺 Série</option>
                    <option value="dorama">🌸 Dorama</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Meu Status</label>
                  <select
                    value={form.watch_status}
                    onChange={(e) => setForm((p) => ({ ...p, watch_status: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100"
                  >
                    <option value="watching">▶️ Assistindo</option>
                    <option value="completed">✅ Concluída</option>
                    <option value="on_hold">⏸️ Hiato (Pausei)</option>
                    <option value="dropped">✖️ Dropada</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Minha Nota (0-10)</label>
                  <div className="relative mt-1">
                    <Star className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={form.user_rating}
                      onChange={(e) => setForm((p) => ({ ...p, user_rating: e.target.value }))}
                      placeholder="9.25"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Nota Externa</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={form.external_score}
                    onChange={(e) => setForm((p) => ({ ...p, external_score: e.target.value }))}
                    placeholder="MAL/IMDb"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100"
                  />
                </div>
              </div>

              {/* Data em que assistiu + Áudio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Mês Visto (Obra)</label>
                  <select
                    value={form.month_seen}
                    onChange={(e) => setForm((p) => ({ ...p, month_seen: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100"
                  >
                    <option value="">--</option>
                    {MONTH_OPTIONS_PT.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Ano Visto (Obra)</label>
                  <input
                    type="number"
                    value={form.year_seen}
                    onChange={(e) => setForm((p) => ({ ...p, year_seen: e.target.value }))}
                    placeholder="2025"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Áudio</label>
                  <select
                    value={form.audio_type}
                    onChange={(e) => setForm((p) => ({ ...p, audio_type: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100"
                  >
                    <option value="Legendado">Legendado</option>
                    <option value="Dublado">Dublado</option>
                    <option value="Original">Original</option>
                  </select>
                </div>
              </div>

              {/* Música & Melhor Temporada */}
              <div className="bg-fuchsia-500/5 border border-fuchsia-500/25 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    Trilha Sonora &amp; Melhor Temporada
                  </span>
                  {songOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSongManualMode((prev) => !prev)}
                      className="text-[10px] font-bold text-pink-300 hover:underline cursor-pointer"
                    >
                      {songManualMode ? 'Escolher da lista OP/ED do anime' : 'Digitar música manualmente'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-zinc-400">Nota da Música</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={form.music_rating}
                      onChange={(e) => setForm((p) => ({ ...p, music_rating: e.target.value }))}
                      placeholder="9.5"
                      className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-bold text-zinc-400">Melhor Música (OP/ED)</label>
                    {songOptions.length > 0 && !songManualMode ? (
                      <select
                        value={form.best_song_title}
                        onChange={(e) => {
                          const picked = songOptions.find((o) => o.title === e.target.value);
                          setForm((p) => ({
                            ...p,
                            best_song_title: e.target.value,
                            best_song_kind: picked ? picked.kind : '',
                          }));
                        }}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="">Selecionar abertura/encerramento...</option>
                        {songOptions.map((opt) => (
                          <option key={`${opt.kind}-${opt.title}`} value={opt.title}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.best_song_title}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, best_song_title: e.target.value, best_song_kind: 'manual' }))
                        }
                        placeholder="Nome da música / OP / ED..."
                        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                      />
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-zinc-400">Melhor Temporada</label>
                    <select
                      value={form.best_season_number}
                      onChange={(e) => setForm((p) => ({ ...p, best_season_number: e.target.value }))}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                    >
                      <option value="">Nenhuma selecionada</option>
                      {seasons.map((s, idx) => (
                        <option key={idx} value={String(idx + 1)}>
                          T{idx + 1}: {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Metadados da Planilha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">
                    Tipo / Demografia (Shounen, Seinen, Shoujo…)
                  </label>
                  <input
                    type="text"
                    value={form.demographicsText}
                    onChange={(e) => setForm((p) => ({ ...p, demographicsText: e.target.value }))}
                    placeholder="Shounen, Seinen..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Gêneros</label>
                  <input
                    type="text"
                    value={form.genresText}
                    onChange={(e) => setForm((p) => ({ ...p, genresText: e.target.value }))}
                    placeholder="Ação, Aventura, Drama..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Autor Original</label>
                  <input
                    type="text"
                    value={form.creatorsText}
                    onChange={(e) => setForm((p) => ({ ...p, creatorsText: e.target.value }))}
                    placeholder="Ex: Tite Kubo, Hiromu Arakawa..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Direção</label>
                  <input
                    type="text"
                    value={form.directorsText}
                    onChange={(e) => setForm((p) => ({ ...p, directorsText: e.target.value }))}
                    placeholder="Diretor(es)..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Estúdio(s)</label>
                  <input
                    type="text"
                    value={form.studiosText}
                    onChange={(e) => setForm((p) => ({ ...p, studiosText: e.target.value }))}
                    placeholder="Madhouse, Bones, Pierrot..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Ano de Lançamento</label>
                  <input
                    type="number"
                    value={form.start_year}
                    onChange={(e) => setForm((p) => ({ ...p, start_year: e.target.value }))}
                    placeholder="2009"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 3: Gerenciador de Temporadas Agrupadas */}
          <div className="bg-zinc-900/50 border border-purple-500/25 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
                  Temporadas e Extras desta Obra ({seasons.length})
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Defina em qual temporada e episódio parou. Continuações independentes (ex.: Bleach TYBW) podem ser cadastradas como outra obra.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddManualSeason}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 text-purple-200 text-xs font-black uppercase cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Temporada Manual / OVA</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {seasons.map((s, idx) => (
                <div
                  key={`${s.mal_id || 'm'}-${idx}`}
                  className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-zinc-400">T{idx + 1} · Nome</label>
                      <input
                        type="text"
                        value={s.label}
                        onChange={(e) => updateSeasonAt(idx, { label: e.target.value })}
                        className="w-full mt-0.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400">Formato</label>
                      <select
                        value={s.season_type || 'tv'}
                        onChange={(e) => updateSeasonAt(idx, { season_type: e.target.value })}
                        className="w-full mt-0.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="tv">TV</option>
                        <option value="ova">OVA</option>
                        <option value="ona">ONA</option>
                        <option value="special">Special</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400">Assistidos</label>
                      <input
                        type="number"
                        min="0"
                        value={s.episodes_watched ?? 0}
                        onChange={(e) => updateSeasonAt(idx, { episodes_watched: Number(e.target.value) })}
                        className="w-full mt-0.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400">Total Eps</label>
                      <input
                        type="number"
                        min="1"
                        value={s.episodes_total ?? ''}
                        onChange={(e) =>
                          updateSeasonAt(idx, {
                            episodes_total: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="?"
                        className="w-full mt-0.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-100"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1 justify-end">
                      {s.episodes_total ? (
                        <button
                          type="button"
                          onClick={() => updateSeasonAt(idx, { episodes_watched: s.episodes_total })}
                          className="px-2 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-200 hover:text-white text-[10px] font-black cursor-pointer"
                          title="Marcar temporada completa"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                      {seasons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSeasonAt(idx)}
                          className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-600 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] cursor-pointer"
                          title="Remover temporada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Linha extra: Duração + Ano + Data customizada opcional (Decisão 17) */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Min/Ep:</span>
                      <input
                        type="number"
                        min="1"
                        value={s.episode_duration_min ?? 24}
                        onChange={(e) =>
                          updateSeasonAt(idx, { episode_duration_min: Number(e.target.value) || 24 })
                        }
                        className="w-14 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-200"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Ano:</span>
                      <input
                        type="number"
                        value={s.year ?? ''}
                        onChange={(e) =>
                          updateSeasonAt(idx, { year: e.target.value ? Number(e.target.value) : null })
                        }
                        placeholder="—"
                        className="w-16 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-200"
                      />
                    </div>

                    <label className="inline-flex items-center gap-1.5 text-zinc-300 cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={Boolean(s.customDate)}
                        onChange={(e) => updateSeasonAt(idx, { customDate: e.target.checked })}
                        className="accent-pink-500"
                      />
                      <Calendar className="w-3 h-3 text-pink-400" />
                      <span>{s.customDate ? 'Época própria:' : 'Herda a data da obra'}</span>
                    </label>

                    {s.customDate && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={s.month_seen || ''}
                          onChange={(e) => updateSeasonAt(idx, { month_seen: e.target.value })}
                          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200"
                        >
                          <option value="">Mês</option>
                          {MONTH_OPTIONS_PT.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={s.year_seen || ''}
                          onChange={(e) => updateSeasonAt(idx, { year_seen: e.target.value })}
                          placeholder="Ano"
                          className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sugestões de Sequências do Jikan + Mini busca MAL */}
            {(form.kind === 'anime' || relatedSeasons.length > 0) && (
              <div className="pt-2 border-t border-zinc-800 space-y-2.5">
                {relatedSeasons.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Sequências / OVAs sugeridas pelo MyAnimeList
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {relatedSeasons.map((rel) => {
                        const isAttached = attachedMalIds.has(Number(rel.mal_id));
                        return (
                          <button
                            key={rel.mal_id}
                            type="button"
                            disabled={isAttached || loadingSeasonAppend}
                            onClick={() => handleAttachMalSeason(rel.mal_id)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                              isAttached
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-default'
                                : 'bg-zinc-950 hover:bg-pink-500/15 border-zinc-700 hover:border-pink-500/50 text-zinc-200 cursor-pointer'
                            }`}
                          >
                            {isAttached ? '✓ ' : '+ '}
                            {rel.title} <span className="text-zinc-500">({rel.relation})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seasonSearchQuery}
                    onChange={(e) => setSeasonSearchQuery(e.target.value)}
                    placeholder="Buscar outra temporada/OVA no MAL para anexar nesta obra..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100"
                  />
                  <button
                    type="button"
                    disabled={loadingSeasonAppend}
                    onClick={handleMiniSeasonSearch}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer disabled:opacity-50"
                  >
                    {loadingSeasonAppend ? '...' : 'Buscar Temp'}
                  </button>
                </div>

                {seasonSearchResults.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto tv-sakura-scroll">
                    {seasonSearchResults.map((item) => {
                      const isAttached = attachedMalIds.has(Number(item.id));
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={item.isMovie || isAttached || loadingSeasonAppend}
                          onClick={() => handleAttachMalSeason(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-pink-500/50 text-[11px] text-zinc-200 disabled:opacity-45 cursor-pointer"
                        >
                          {item.isMovie ? '🎬 [Filme] ' : isAttached ? '✓ ' : '+ '}
                          {item.title} ({item.mediaTypeLabel})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BLOCO 4: Sinopse & Notas Pessoais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">Notas / Comentários</label>
              <textarea
                rows={3}
                value={form.review_notes}
                onChange={(e) => setForm((p) => ({ ...p, review_notes: e.target.value }))}
                placeholder="Opinião pessoal, arco favorito, motivo do hiato..."
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">Sinopse</label>
              <textarea
                rows={3}
                value={form.synopsis}
                onChange={(e) => setForm((p) => ({ ...p, synopsis: e.target.value }))}
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300"
              />
            </div>
          </div>

          {/* Rodapé Ações */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-pink-500/20 cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
