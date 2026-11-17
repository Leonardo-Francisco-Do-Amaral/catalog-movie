import React, { useEffect, useState } from 'react';
import { X, Plus, Search, AlertTriangle, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import {
  MONTH_OPTIONS_PT,
  appendSeasonToTvShow,
  fetchJikanSeasonDetails,
  fetchTvExternalDetails,
  searchTvExternal,
} from '../utils/tvApi';

export default function AppendSeasonModal({ isOpen, show, onClose, onShowUpdated }) {
  const [tab, setTab] = useState('jikan'); // 'jikan' | 'manual'
  const [relatedOptions, setRelatedOptions] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [manualSeason, setManualSeason] = useState({
    label: '',
    season_type: 'tv',
    episodes_total: '',
    episodes_watched: '0',
    episode_duration_min: show?.kind === 'anime' ? '24' : '45',
    year: '',
    customDate: false,
    month_seen: '',
    year_seen: '',
  });

  useEffect(() => {
    if (!isOpen || !show) return;
    setErrorMsg('');
    setSearchQuery('');
    setSearchResults([]);
    setTab(show.kind === 'anime' ? 'jikan' : 'manual');
    setManualSeason({
      label: `Temporada ${(show.seasons?.length || 0) + 1}`,
      season_type: 'tv',
      episodes_total: '',
      episodes_watched: '0',
      episode_duration_min: show.kind === 'anime' ? '24' : '45',
      year: '',
      customDate: false,
      month_seen: '',
      year_seen: '',
    });

    // Busca sequências relacionadas da última temporada que tenha mal_id
    const lastMalSeason = [...(show.seasons || [])].reverse().find((s) => s.mal_id);
    const seedMalId = lastMalSeason?.mal_id || show.mal_id;
    if (seedMalId) {
      setLoadingRelations(true);
      fetchTvExternalDetails('jikan', seedMalId)
        .then((bundle) => {
          const existingMalIds = new Set((show.seasons || []).map((s) => s.mal_id).filter(Boolean));
          const filtered = (bundle?.relatedSeasons || []).filter((r) => !existingMalIds.has(r.mal_id));
          setRelatedOptions(filtered);
        })
        .catch(() => setRelatedOptions([]))
        .finally(() => setLoadingRelations(false));
    } else {
      setRelatedOptions([]);
    }
  }, [isOpen, show]);

  if (!isOpen || !show) return null;

  const existingMalIds = new Set((show.seasons || []).map((s) => s.mal_id).filter(Boolean));

  const handleSearchJikan = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setErrorMsg('');
    setSearching(true);
    try {
      const results = await searchTvExternal('jikan', searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAttachMalEntry = async (malId) => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const nextNum = (show.seasons?.length || 0) + 1;
      const details = await fetchJikanSeasonDetails(malId, nextNum);
      const res = await appendSeasonToTvShow(show.id, details.season, details.studios);
      onShowUpdated(res.data, res.xpStatus, res.xpDelta, res.xpEvent);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!manualSeason.label.trim()) {
      setErrorMsg('Informe o nome da temporada.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await appendSeasonToTvShow(show.id, {
        season_number: (show.seasons?.length || 0) + 1,
        label: manualSeason.label.trim(),
        season_type: manualSeason.season_type,
        episodes_total: manualSeason.episodes_total ? Number(manualSeason.episodes_total) : null,
        episodes_watched: Number(manualSeason.episodes_watched || 0),
        episode_duration_min: manualSeason.episode_duration_min ? Number(manualSeason.episode_duration_min) : 24,
        year: manualSeason.year ? Number(manualSeason.year) : null,
        month_seen: manualSeason.customDate && manualSeason.month_seen ? Number(manualSeason.month_seen) : null,
        year_seen: manualSeason.customDate && manualSeason.year_seen ? Number(manualSeason.year_seen) : null,
      });
      onShowUpdated(res.data, res.xpStatus, res.xpDelta, res.xpEvent);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-pink-500/40 rounded-2xl shadow-2xl shadow-pink-500/15 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-zinc-950 border-b border-pink-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">
              + Anexar Temporada / OVA
            </span>
            <h3 className="text-base font-black text-zinc-100">{show.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto tv-sakura-scroll space-y-4">
          <div className="text-xs text-purple-200/90 bg-purple-500/10 border border-purple-500/30 rounded-xl px-3.5 py-2.5">
            💡 <strong>Dica:</strong> Se você considera a continuação uma obra separada (ex.: <em>Bleach</em> vs{' '}
            <em>Bleach: Thousand-Year Blood War</em>), feche aqui e cadastre pelo botão <strong>"+ Adicionar Obra"</strong>.
          </div>

          <div className="flex gap-2 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setTab('jikan')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                tab === 'jikan' ? 'bg-pink-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ⛩️ Buscar / Sequências (Jikan MAL)
            </button>
            <button
              type="button"
              onClick={() => setTab('manual')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                tab === 'manual' ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ✍️ Temporada Manual / OVA
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs rounded-xl px-3.5 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'jikan' ? (
            <div className="space-y-4">
              {loadingRelations ? (
                <div className="flex items-center gap-2 text-xs text-pink-300 py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Buscando sequências sugeridas no MyAnimeList...</span>
                </div>
              ) : relatedOptions.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sugestões de Continuação / Extras
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto tv-sakura-scroll pr-1">
                    {relatedOptions.map((rel) => (
                      <div
                        key={rel.mal_id}
                        className="flex items-center justify-between gap-3 bg-zinc-900/75 border border-zinc-800 rounded-xl px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-100 truncate">{rel.title}</div>
                          <div className="text-[10px] text-zinc-400">
                            {rel.relation} · MAL #{rel.mal_id}
                            {rel.isMovie && (
                              <span className="ml-2 text-amber-400 font-bold">
                                (Se for filme, cadastre em 🎬 Filmes)
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleAttachMalEntry(rel.mal_id)}
                          className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500 border border-pink-500/40 text-pink-200 hover:text-white text-[11px] font-black uppercase cursor-pointer shrink-0 transition-all disabled:opacity-50"
                        >
                          + Anexar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleSearchJikan} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar outra temporada ou OVA no MyAnimeList..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-100 focus:outline-none focus:border-pink-500/60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-black uppercase cursor-pointer disabled:opacity-60"
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-56 overflow-y-auto tv-sakura-scroll pr-1">
                  {searchResults.map((item) => {
                    const alreadyAttached = existingMalIds.has(item.id);
                    const disabled = item.isMovie || alreadyAttached || submitting;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 border ${
                          item.isMovie
                            ? 'bg-zinc-900/40 border-amber-500/30 opacity-75'
                            : 'bg-zinc-900/75 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.poster_url && (
                            <img src={item.poster_url} alt={item.title} className="w-8 h-11 object-cover rounded" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-zinc-100 truncate">{item.title}</div>
                            <div className="text-[10px] text-zinc-400">
                              {item.mediaTypeLabel} · {item.year || '?'} · {item.episodes ?? '?'} eps
                            </div>
                            {item.isMovie && (
                              <div className="text-[10px] text-amber-400 font-bold">
                                🎬 Longa-metragem — cadastre no modo Filmes
                              </div>
                            )}
                            {alreadyAttached && (
                              <div className="text-[10px] text-emerald-400 font-bold">
                                ✓ Já anexada nesta obra
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleAttachMalEntry(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500 border border-pink-500/40 text-pink-200 hover:text-white text-[11px] font-black uppercase cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {alreadyAttached ? 'Inclusa' : '+ Anexar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveManual} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Nome da Temporada / Extra</label>
                  <input
                    type="text"
                    value={manualSeason.label}
                    onChange={(e) => setManualSeason((p) => ({ ...p, label: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Formato</label>
                  <select
                    value={manualSeason.season_type}
                    onChange={(e) => setManualSeason((p) => ({ ...p, season_type: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  >
                    <option value="tv">TV (Temporada)</option>
                    <option value="ova">OVA (Extra)</option>
                    <option value="ona">ONA (Extra)</option>
                    <option value="special">Special (Extra)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Eps Assistidos</label>
                  <input
                    type="number"
                    min="0"
                    value={manualSeason.episodes_watched}
                    onChange={(e) => setManualSeason((p) => ({ ...p, episodes_watched: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Total Eps</label>
                  <input
                    type="number"
                    min="1"
                    value={manualSeason.episodes_total}
                    onChange={(e) => setManualSeason((p) => ({ ...p, episodes_total: e.target.value }))}
                    placeholder="?"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Min / Ep</label>
                  <input
                    type="number"
                    min="1"
                    value={manualSeason.episode_duration_min}
                    onChange={(e) => setManualSeason((p) => ({ ...p, episode_duration_min: e.target.value }))}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400">Ano</label>
                  <input
                    type="number"
                    value={manualSeason.year}
                    onChange={(e) => setManualSeason((p) => ({ ...p, year: e.target.value }))}
                    placeholder="2024"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualSeason.customDate}
                    onChange={(e) => setManualSeason((p) => ({ ...p, customDate: e.target.checked }))}
                    className="accent-pink-500"
                  />
                  <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  <span>Assisti em outra época (diferente da data principal da obra)</span>
                </label>

                {manualSeason.customDate && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <select
                      value={manualSeason.month_seen}
                      onChange={(e) => setManualSeason((p) => ({ ...p, month_seen: e.target.value }))}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    >
                      <option value="">Mês visto...</option>
                      {MONTH_OPTIONS_PT.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={manualSeason.year_seen}
                      onChange={(e) => setManualSeason((p) => ({ ...p, year_seen: e.target.value }))}
                      placeholder="Ano visto (ex: 2025)"
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black uppercase cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Salvando...' : 'Anexar Temporada'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
