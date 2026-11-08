import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  X,
  Crown,
  Star,
  Pin,
  RotateCcw,
  Search,
  Target,
  Sparkles,
  Check,
  Film,
  Plus,
  Trash2,
  RefreshCw,
  Flag
} from 'lucide-react';
import { getRarityMeta } from '../data/countryRarityTiers';

const API_BASE_URL = 'http://localhost:5000/api';

const removeAccents = (str) =>
  str
    ? String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : '';

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

export default function CountryInspectionDrawer({
  country,
  isOpen,
  onClose,
  catalogMovies = [],
  savingAction = false,
  onPickChampion,
  onChangeMoviePrimaryCountry,
  onSaveWishlist,
  onRegisterWatchedFromWishlist
}) {
  const [pickerTab, setPickerTab] = useState('country'); // 'country' | 'catalog'
  const [catalogSearch, setCatalogSearch] = useState('');

  // Estados do Backlog / Wishlist para países vazios ("Terra Incógnita")
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [searchingTmdb, setSearchingTmdb] = useState(false);
  const [manualWishTitle, setManualWishTitle] = useState('');
  const [manualWishYear, setManualWishYear] = useState('');
  const [manualWishPoster, setManualWishPoster] = useState('');
  const [manualWishTmdbId, setManualWishTmdbId] = useState(null);
  const [manualWishNotes, setManualWishNotes] = useState('');

  const countryCode = country?.code;
  const candCount = country?.candidates?.length || 0;

  useEffect(() => {
    if (!countryCode || !isOpen) return;
    setCatalogSearch('');
    setTmdbQuery('');
    setTmdbResults([]);

    if (candCount > 0) {
      setPickerTab('country');
    } else {
      setPickerTab('catalog');
    }

    setManualWishTitle(country?.wishlist?.title || '');
    setManualWishYear(country?.wishlist?.year ? String(country.wishlist.year) : '');
    setManualWishPoster(country?.wishlist?.poster_url || '');
    setManualWishTmdbId(country?.wishlist?.tmdb_id || null);
    setManualWishNotes(country?.wishlist?.notes || '');
  }, [countryCode, isOpen, candCount, country?.wishlist]);

  // Busca preditiva no TMDB para marcar filme-alvo (Backlog / Wishlist)
  useEffect(() => {
    if (tmdbQuery.trim().length < 2) {
      setTmdbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingTmdb(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/movies/search`, {
          params: { q: tmdbQuery.trim() }
        });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setTmdbResults(res.data.data.slice(0, 6));
        }
      } catch {
        setTmdbResults([]);
      } finally {
        setSearchingTmdb(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [tmdbQuery]);

  // Filtro instantâneo em todo o catálogo para atribuir qualquer filme manualmente
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return catalogMovies.slice(0, 30);
    const q = removeAccents(catalogSearch);
    return catalogMovies
      .filter((m) => {
        const matchTitle = removeAccents(m.title).includes(q);
        const matchOrig = removeAccents(m.original_title).includes(q);
        const matchDir = (m.directors || []).some((d) => removeAccents(d).includes(q));
        const matchCountry = (m.countries || []).some((c) => removeAccents(c).includes(q));
        return matchTitle || matchOrig || matchDir || matchCountry;
      })
      .slice(0, 40);
  }, [catalogMovies, catalogSearch]);

  if (!isOpen || !country) return null;

  const isConquered = country.status === 'conquered' && Boolean(country.champion);
  const champion = country.champion;
  const flagCode = (country.flagCode || country.code || '').toLowerCase();
  const isHistorical = Boolean(country.era);
  const rarityMeta = !isHistorical ? getRarityMeta(country.rarityTier || country.code) : null;

  const handleSelectTmdbTarget = (item) => {
    setManualWishTitle(item.title || '');
    setManualWishYear(item.release_year ? String(item.release_year) : '');
    setManualWishPoster(item.poster_url || '');
    setManualWishTmdbId(item.tmdb_id || null);
    setTmdbQuery('');
    setTmdbResults([]);
  };

  const handleSaveTargetSubmit = (e) => {
    e.preventDefault();
    if (!manualWishTitle.trim()) return;
    onSaveWishlist(country, {
      title: manualWishTitle.trim(),
      year: manualWishYear ? Number(manualWishYear) : null,
      tmdb_id: manualWishTmdbId,
      poster_url: manualWishPoster || null,
      notes: manualWishNotes.trim() || null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-all">
      {/* Clique fora fecha a gaveta */}
      <div className="flex-1" onClick={onClose} />

      {/* Gaveta Tática Lateral */}
      <aside className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Cabeçalho da Província */}
        <div className="px-6 py-5 border-b border-zinc-800/90 bg-zinc-900/50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {flagCode && flagCode !== 'su' && !flagCode.startsWith('hist_') && !flagCode.startsWith('extra_') ? (
              <img
                src={`https://flagcdn.com/w80/${flagCode}.png`}
                alt={country.name}
                className="w-12 h-8 object-cover rounded-lg border border-zinc-700 shadow-md shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sm shrink-0">
                {country.code === 'hist_su' ? '☭' : '🚩'}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-zinc-100 uppercase tracking-wide truncate">
                  {country.name}
                </h2>
                {country.iso3 && (
                  <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                    {country.iso3}
                  </span>
                )}
                {rarityMeta && (
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${rarityMeta.softBadge}`}
                    title={rarityMeta.shortDesc}
                  >
                    {rarityMeta.key === 'mythic' ? `🔥 ${rarityMeta.label}` : rarityMeta.label}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {country.continent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Setor: {country.continent}
                  </span>
                )}
                {country.era && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Era: {country.era}
                  </span>
                )}
                <span className="text-zinc-700">•</span>
                {isConquered ? (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Conquistado
                  </span>
                ) : country.wishlist ? (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Alvo Marcado
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-700">
                    Missão Pendente
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Rolável */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {isConquered ? (
            /* ================================================================
             * VISÃO 1: PAÍS CONQUISTADO — CARD DO FILME CAMPEÃO + FRONTEIRAS
             * ================================================================ */
            <div
              className={`relative bg-gradient-to-br from-zinc-900/95 via-zinc-900/60 to-zinc-950 border rounded-2xl p-4 shadow-xl flex flex-col gap-4 ${
                rarityMeta ? rarityMeta.border : 'border-amber-500/35'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Representante Oficial (Campeão)
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {champion.originMode === 'manual' && (
                    <span
                      title="País primário deste filme foi movido ou confirmado manualmente por você"
                      className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Flag className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                      País Validado
                    </span>
                  )}

                  {country.selectionMode === 'manual' ? (
                    <>
                      <span className="text-[10px] font-black uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Fixado
                      </span>
                      <button
                        type="button"
                        disabled={savingAction}
                        onClick={() => onPickChampion(country, null)}
                        title="Voltar para escolha automática pela maior nota entre os filmes deste país"
                        className="text-[10px] font-bold uppercase text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Auto
                      </button>
                    </>
                  ) : champion.originMode !== 'manual' ? (
                    <span className="text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Automático (Maior Nota)
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-4">
                {resolvePosterUrl(champion.poster_url) ? (
                  <img
                    src={resolvePosterUrl(champion.poster_url)}
                    alt={champion.title}
                    className="w-24 h-36 object-cover rounded-xl border border-zinc-700 shadow-lg shrink-0"
                  />
                ) : (
                  <div className="w-24 h-36 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center gap-1 text-zinc-600 shrink-0">
                    <Film className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase">Sem Pôster</span>
                  </div>
                )}

                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-black text-zinc-100 leading-snug">
                      {champion.title}
                    </h3>
                    {champion.original_title && champion.original_title !== champion.title && (
                      <span className="text-xs italic text-zinc-400 truncate">
                        {champion.original_title}
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-300 font-semibold">
                      <span>{champion.release_year || 'S/Ano'}</span>
                      {champion.runtime && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span>{champion.runtime} min</span>
                        </>
                      )}
                      {champion.year_seen && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">
                            Visto em{' '}
                            {champion.month_seen
                              ? `${String(champion.month_seen).padStart(2, '0')}/${champion.year_seen}`
                              : champion.year_seen}
                          </span>
                        </>
                      )}
                    </div>

                    {champion.directors?.length > 0 && (
                      <p className="text-xs text-zinc-400 mt-1">
                        <strong className="text-zinc-300">Direção:</strong>{' '}
                        {champion.directors.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Badges Internos de Pontuação do Filme */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5 bg-zinc-950 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Nota: {Number(champion.user_rating || 0).toFixed(2)}</span>
                    </div>
                    {champion.imdb_rating && (
                      <span className="text-[11px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300 px-2 py-1 rounded-xl">
                        IMDb {champion.imdb_rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barra de Validação do Campeão */}
              <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Flag
                    className={`w-3.5 h-3.5 shrink-0 ${
                      champion.originMode === 'manual'
                        ? 'fill-emerald-400 text-emerald-400'
                        : 'text-zinc-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] text-zinc-300 block truncate">
                      {champion.originMode === 'manual'
                        ? `Filme confirmado e validado em ${country.name}.`
                        : `Deseja validar ${country.name} como o país oficial deste filme?`}
                    </span>
                    {champion.coproductionCountries?.length > 1 && (
                      <span className="text-[10px] text-zinc-500 block truncate">
                        Coprod.: {champion.coproductionCountries.map((c) => c.name).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {champion.originMode === 'manual' ? (
                  <button
                    type="button"
                    disabled={savingAction}
                    onClick={() => onChangeMoviePrimaryCountry(champion, null, '1º país padrão')}
                    className="text-[10px] font-bold uppercase text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Desmarcar
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={savingAction}
                    onClick={() =>
                      onChangeMoviePrimaryCountry(champion, country.code, country.name)
                    }
                    className="text-[10px] font-black uppercase text-emerald-300 hover:text-slate-950 bg-emerald-500/15 hover:bg-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                  >
                    <Flag className="w-3 h-3 fill-current" /> Validar País
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ================================================================
             * VISÃO 2: TERRA INCÓGNITA (PAÍS VAZIO) — MISSÃO PENDENTE & ALVO
             * ================================================================ */
            <div className="bg-zinc-900/40 border border-zinc-800/90 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-100">
                    Terra Incógnita • Planejamento de Missão
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Nenhum filme está alocado como representante primário de{' '}
                    <strong>{country.name}</strong>. Marque um filme-alvo na sua Wishlist ou
                    reivindique abaixo uma coprodução já assistida!
                  </p>
                </div>
              </div>

              {/* Card do Alvo Atual se já estiver marcado */}
              {country.wishlist && (
                <div className="bg-amber-500/8 border border-amber-500/35 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {country.wishlist.poster_url && (
                      <img
                        src={resolvePosterUrl(country.wishlist.poster_url)}
                        alt={country.wishlist.title}
                        className="w-12 h-16 object-cover rounded-lg border border-amber-500/40 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        🎯 Alvo Atual no Radar
                      </span>
                      <h4 className="text-sm font-black text-zinc-100 truncate">
                        {country.wishlist.title}{' '}
                        {country.wishlist.year ? `(${country.wishlist.year})` : ''}
                      </h4>
                      {country.wishlist.notes && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                          {country.wishlist.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {onRegisterWatchedFromWishlist && (
                      <button
                        type="button"
                        onClick={() =>
                          onRegisterWatchedFromWishlist(country, country.wishlist.title)
                        }
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Já Assisti!
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={savingAction}
                      onClick={() => onSaveWishlist(country, null)}
                      className="bg-zinc-900 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/40 text-zinc-400 hover:text-red-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remover
                    </button>
                  </div>
                </div>
              )}

              {/* Busca TMDB + Formulário Rápido de Alvo / Wishlist */}
              {!isHistorical && (
                <form onSubmit={handleSaveTargetSubmit} className="flex flex-col gap-3">
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                      Buscar Filme-Alvo no TMDB (Opcional)
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={tmdbQuery}
                        onChange={(e) => setTmdbQuery(e.target.value)}
                        placeholder={`Pesquisar filme de ${country.name} na API...`}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl py-2 pl-9 pr-8 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                      />
                      {searchingTmdb && (
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {tmdbResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl z-30 max-h-52 overflow-y-auto divide-y divide-zinc-800/70">
                        {tmdbResults.map((item) => (
                          <button
                            key={item.tmdb_id}
                            type="button"
                            onClick={() => handleSelectTmdbTarget(item)}
                            className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-zinc-900 text-left transition-colors cursor-pointer"
                          >
                            {item.poster_url ? (
                              <img
                                src={item.poster_url}
                                alt={item.title}
                                className="w-8 h-11 object-cover rounded border border-zinc-800 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-11 rounded bg-zinc-900 border border-zinc-800 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-zinc-100 truncate">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-zinc-500 truncate">
                                {item.original_title} • {item.release_year || 'S/Ano'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={manualWishTitle}
                        onChange={(e) => setManualWishTitle(e.target.value)}
                        placeholder="Título do filme-alvo para assistir..."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={manualWishYear}
                        onChange={(e) => setManualWishYear(e.target.value)}
                        placeholder="Ano"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={manualWishNotes}
                    onChange={(e) => setManualWishNotes(e.target.value)}
                    placeholder="Notas táticas (ex: Disponível na MUBI / Diretor famoso)..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={!manualWishTitle.trim() || savingAction}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    {country.wishlist ? 'Atualizar Alvo da Missão' : 'Marcar Filme como Alvo'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ==================================================================
           * SEÇÃO DE CURADORIA: FILMES DO PAÍS vs DISPUTA DE FRONTEIRA vs CATÁLOGO
           * ================================================================== */}
          <div className="flex flex-col gap-3.5 border-t border-zinc-800/90 pt-5">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                Selecionar Filme Representante
              </h3>
              <p className="text-[11px] text-zinc-500">
                Escolha outro filme já alocado neste país ou busque qualquer título do catálogo para ser o campeão oficial.
              </p>
            </div>

            {/* Abas do Seletor (2 Modos) */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setPickerTab('country')}
                className={`py-2 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  pickerTab === 'country'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Filmes do País ({candCount})
              </button>
              <button
                type="button"
                onClick={() => setPickerTab('catalog')}
                className={`py-2 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  pickerTab === 'catalog'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Buscar no Catálogo
              </button>
            </div>

            {pickerTab === 'country' ? (
              /* Aba 1: Filmes cujo País Primário atual é este território */
              candCount > 0 ? (
                <div className="flex flex-col gap-2">
                  {country.candidates.map((cand) => {
                    const isCurrentChamp = champion && champion.movie_id === cand.movie_id;
                    return (
                      <div
                        key={cand.movie_id}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                          isCurrentChamp
                            ? 'bg-amber-500/10 border-amber-500/45'
                            : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {resolvePosterUrl(cand.poster_url) ? (
                            <img
                              src={resolvePosterUrl(cand.poster_url)}
                              alt={cand.title}
                              className="w-10 h-14 object-cover rounded-lg border border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-14 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-black text-zinc-100 truncate">
                              {cand.title}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-semibold flex items-center gap-2 mt-0.5">
                              <span>{cand.release_year || 'S/Ano'}</span>
                              <span>•</span>
                              <span className="text-amber-400 font-black">
                                ★ {Number(cand.user_rating || 0).toFixed(2)}
                              </span>
                            </div>
                            {cand.countries?.length > 1 && (
                              <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                                Coprod.: {cand.countries.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        {isCurrentChamp ? (
                          <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Campeão
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={savingAction}
                            onClick={() => onPickChampion(country, cand.movie_id)}
                            className="bg-zinc-950 hover:bg-amber-500 text-zinc-200 hover:text-slate-950 border border-zinc-700 hover:border-amber-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                          >
                            Fixar Campeão
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 px-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Nenhum filme está alocado como representante em <strong>{country.name}</strong> no momento.
                  Use a aba &quot;Buscar no Catálogo&quot; para atribuir uma obra ou planeje um alvo acima!
                </div>
              )
            ) : (
              /* Aba 3: Buscar em todo o catálogo e transferir/fixar manualmente */
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Buscar qualquer filme visto por título, diretor ou país..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/60 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {filteredCatalog.map((m) => {
                    const isCurrentChamp = champion && champion.movie_id === m.movie_id;
                    return (
                      <div
                        key={m.movie_id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {resolvePosterUrl(m.poster_url) ? (
                            <img
                              src={resolvePosterUrl(m.poster_url)}
                              alt={m.title}
                              className="w-9 h-12 object-cover rounded border border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-12 rounded bg-zinc-950 border border-zinc-800 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-zinc-100 truncate">
                              {m.title}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate">
                              {m.release_year || 'S/Ano'} • ★ {Number(m.user_rating || 0).toFixed(2)}
                              {m.primaryCountryName ? ` • Em: ${m.primaryCountryName}` : ''}
                            </div>
                          </div>
                        </div>

                        {isCurrentChamp ? (
                          <span className="text-[10px] font-black uppercase text-amber-400 shrink-0">
                            Atual ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={savingAction}
                            onClick={() => onPickChampion(country, m.movie_id)}
                            className="bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                          >
                            Transferir & Fixar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
