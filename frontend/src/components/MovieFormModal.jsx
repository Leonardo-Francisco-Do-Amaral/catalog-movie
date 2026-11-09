import React, { useState, useEffect } from 'react';
import { X, Search, Film, Globe, Star, Sparkles, Check, Plus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { triggerTrophyBatch } from './PS5TrophyToastContainer';
import { triggerXPGainToast, triggerTimeMachineUnlock, dispatchXpStatusUpdate } from '../utils/xpSystem';
import { computeMovieStatGains } from '../utils/analyticsEngine';

export default function MovieFormModal({ isOpen, onClose, movie, onSave, allTags = [], initialSearchQuery = '', initialReleaseYear = '', existingMovies = [] }) {
  const isEditMode = !!movie;

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    original_title: '',
    release_year: '',
    runtime: '',
    synopsis: '',
    poster_url: '',
    imdb_id: '',
    tmdb_id: '',
    imdb_rating: '',
    metacritic_score: '',
    rotten_tomatoes_score: '',
    oscar_wins: 0,
    oscar_nominations: 0,
    vote_count: 0,
    
    // Relacionamentos
    countries: [], // Países salvos em array
    genres: '',
    directors: '',
    writers: '',
    studios: '',
    distributor: '',
    tags: [],

    // Visualização (movie_views)
    view_id: null,
    user_rating: '',
    month_seen: '',
    year_seen: new Date().getFullYear(),
    audio_type: 'Dublado',
    platform: '',
    review_notes: ''
  });

  // Upload local do pôster
  const [posterFile, setPosterFile] = useState(null);

  // Países ativos do banco
  const [activeCountries, setActiveCountries] = useState([]);

  // Estados de busca preditiva na API
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Carrega países ativos ao abrir
  const loadActiveCountries = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/countries/active');
      if (res.data.success) {
        setActiveCountries(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar países ativos:', err);
    }
  };

  // Sincronizar dados ao abrir/trocar de filme (Modo Edição)
  useEffect(() => {
    if (isOpen) {
      loadActiveCountries();
      setPosterFile(null); // Reseta arquivo selecionado anterior

      if (movie) {
        setFormData({
          title: movie.title || '',
          original_title: movie.original_title || '',
          release_year: movie.release_year || '',
          runtime: movie.runtime || '',
          synopsis: movie.synopsis || '',
          poster_url: movie.poster_url || '',
          imdb_id: movie.imdb_id || '',
          tmdb_id: movie.tmdb_id || '',
          imdb_rating: movie.imdb_rating || '',
          metacritic_score: movie.metacritic_score || '',
          rotten_tomatoes_score: movie.rotten_tomatoes_score || '',
          oscar_wins: movie.oscar_wins || 0,
          oscar_nominations: movie.oscar_nominations || 0,
          vote_count: movie.vote_count || 0,
          countries: movie.countries || [],
          genres: movie.genres ? movie.genres.join(', ') : '',
          directors: movie.directors ? movie.directors.join(', ') : '',
          writers: movie.writers ? movie.writers.join(', ') : '',
          studios: movie.studios ? movie.studios.join(', ') : '',
          distributor: movie.distributor || '',
          tags: movie.tags || [],
          
          view_id: movie.id || null, // ID da visualização vindo da rota
          user_rating: movie.user_rating || '',
          month_seen: movie.month_seen || '',
          year_seen: movie.year_seen || new Date().getFullYear(),
          audio_type: movie.audio_type || 'Dublado',
          platform: movie.platform || '',
          review_notes: movie.review_notes || ''
        });
      } else {
        // Modo de Cadastro Limpo
        setFormData({
          title: '',
          original_title: '',
          release_year: initialReleaseYear || '',
          runtime: '',
          synopsis: '',
          poster_url: '',
          imdb_id: '',
          tmdb_id: '',
          imdb_rating: '',
          metacritic_score: '',
          rotten_tomatoes_score: '',
          oscar_wins: 0,
          oscar_nominations: 0,
          vote_count: 0,
          countries: [],
          genres: '',
          directors: '',
          writers: '',
          studios: '',
          distributor: '',
          tags: [],
          view_id: null,
          user_rating: '',
          month_seen: '',
          year_seen: new Date().getFullYear(),
          audio_type: 'Dublado',
          platform: '',
          review_notes: ''
        });
      }
      setSearchQuery(initialSearchQuery || '');
      setSearchResults([]);
      setCountrySearchQuery('');
      setTagSearchQuery('');
    }
  }, [isOpen, movie, initialSearchQuery, initialReleaseYear]);

  // Busca na API TMDB do backend
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/movies/search-api?query=${encodeURIComponent(searchQuery)}`);
        if (res.data.success) {
          setSearchResults(res.data.results);
        }
      } catch (err) {
        console.error('Erro na busca preditiva:', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Carrega os detalhes completos do filme selecionado
  const handleSelectTmdbMovie = async (tmdbId) => {
    setLoadingApi(true);
    setSearchResults([]);
    setSearchQuery('');
    try {
      const res = await axios.get(`http://localhost:5000/api/movies/details-api?id=${tmdbId}`);
      if (res.data.success) {
        const d = res.data.data;
        setFormData(prev => ({
          ...prev,
          tmdb_id: d.tmdb_id,
          imdb_id: d.imdb_id || '',
          title: d.title || '',
          original_title: d.original_title || '',
          release_year: d.release_year || '',
          runtime: d.runtime || '',
          synopsis: d.synopsis || '',
          poster_url: d.poster_url || '',
          imdb_rating: d.imdb_rating || '',
          metacritic_score: d.metacritic_score || '',
          rotten_tomatoes_score: d.rotten_tomatoes_score || '',
          oscar_wins: d.oscar_wins || (isEditMode ? prev.oscar_wins : 0) || 0,
          oscar_nominations: d.oscar_nominations || (isEditMode ? prev.oscar_nominations : 0) || 0,
          vote_count: d.vote_count || 0,
          countries: d.countries && d.countries.length > 0 ? d.countries : (isEditMode ? prev.countries : []),
          genres: d.genres ? d.genres.join(', ') : '',
          directors: d.directors ? d.directors.join(', ') : '',
          writers: d.writers ? d.writers.join(', ') : '',
          studios: d.studios ? d.studios.join(', ') : '',
          distributor: d.distributor || (isEditMode ? prev.distributor : '') || ''
        }));
      }
    } catch (err) {
      console.error('Erro ao obter detalhes técnicos:', err);
    } finally {
      setLoadingApi(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Alterna tag selecionada
  const toggleTag = (tagName) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName];
      return { ...prev, tags };
    });
  };

  // Alterna país selecionado
  const toggleCountry = (countryName) => {
    setFormData(prev => {
      const countries = prev.countries.includes(countryName)
        ? prev.countries.filter(c => c !== countryName)
        : [...prev.countries, countryName];
      return { ...prev, countries };
    });
  };

  // Adiciona nova tag customizada no form
  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      const tag = newTagInput.trim();
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setNewTagInput('');
    }
  };

  // Cria dinamicamente um novo país no banco
  const handleAddNewCountryPrompt = async () => {
    const name = window.prompt('Digite o nome do novo país (ex: Japão):');
    if (name && name.trim()) {
      try {
        const res = await axios.post('http://localhost:5000/api/countries/add', { name: name.trim() });
        if (res.data.success) {
          const newCountry = res.data.data;
          // Adiciona à lista de países ativos local se não existir
          setActiveCountries(prev => {
            if (prev.some(c => c.name.toLowerCase() === newCountry.name.toLowerCase())) return prev;
            return [...prev, newCountry].sort((a, b) => a.name.localeCompare(b.name));
          });
          // Seleciona automaticamente
          setFormData(prev => ({
            ...prev,
            countries: prev.countries.includes(newCountry.name) ? prev.countries : [...prev.countries, newCountry.name]
          }));
        }
      } catch (err) {
        console.error('Erro ao adicionar país:', err);
      }
    }
  };

  // Sincroniza notas em tempo real via OMDb
  const handleSyncRatings = async () => {
    const { imdb_id, title } = formData;
    if (!imdb_id && !title) {
      alert('Preencha o Título ou o IMDb ID para buscar as notas nas APIs.');
      return;
    }
    setLoadingApi(true);
    try {
      const params = {};
      if (imdb_id) params.imdb_id = imdb_id;
      else if (title) params.title = title;

      const res = await axios.get('http://localhost:5000/api/movies/fetch-external-ratings', { params });
      if (res.data.success) {
        const ratings = res.data.data;
        setFormData(prev => ({
          ...prev,
          imdb_rating: ratings.imdb_rating !== null ? ratings.imdb_rating : prev.imdb_rating,
          metacritic_score: ratings.metacritic_score !== null ? ratings.metacritic_score : prev.metacritic_score,
          rotten_tomatoes_score: ratings.rotten_tomatoes_score !== null ? ratings.rotten_tomatoes_score : prev.rotten_tomatoes_score,
          vote_count: ratings.vote_count !== null ? ratings.vote_count : prev.vote_count
        }));
        alert('Notas e quantidade de votos sincronizadas com sucesso a partir das APIs externas!');
      }
    } catch (err) {
      console.error('Erro ao sincronizar notas:', err);
      alert('Erro ao buscar notas nas APIs: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingApi(false);
    }
  };

  // Submit do formulário usando FormData para Multer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('O título do filme é obrigatório.');
      return;
    }

    const splitList = (str) => str ? str.split(',').map(item => item.trim()).filter(Boolean) : [];

    const data = new FormData();
    
    // Anexa campos simples
    data.append('title', formData.title);
    data.append('original_title', formData.original_title);
    data.append('release_year', formData.release_year || '');
    data.append('runtime', formData.runtime || '');
    data.append('synopsis', formData.synopsis);
    data.append('poster_url', formData.poster_url);
    data.append('imdb_id', formData.imdb_id);
    data.append('tmdb_id', formData.tmdb_id || '');
    data.append('imdb_rating', formData.imdb_rating || '');
    data.append('metacritic_score', formData.metacritic_score || '');
    data.append('rotten_tomatoes_score', formData.rotten_tomatoes_score || '');
    data.append('oscar_wins', String(formData.oscar_wins || 0));
    data.append('oscar_nominations', String(formData.oscar_nominations || 0));
    data.append('vote_count', String(formData.vote_count || 0));
    data.append('is_custom', 'true'); // Gravação manual sempre ativa a permanência

    // Anexa arrays serializados em string JSON para robustez
    data.append('countries', JSON.stringify(formData.countries));
    data.append('genres', JSON.stringify(splitList(formData.genres)));
    data.append('directors', JSON.stringify(splitList(formData.directors)));
    data.append('writers', JSON.stringify(splitList(formData.writers)));
    data.append('studios', JSON.stringify(splitList(formData.studios)));
    data.append('distributor', formData.distributor || '');
    data.append('tags', JSON.stringify(formData.tags));

    // Dados de Visualização
    if (formData.view_id) {
      data.append('view_id', String(formData.view_id));
    }
    data.append('user_rating', formData.user_rating || '0');
    data.append('month_seen', formData.month_seen || '');
    data.append('year_seen', formData.year_seen || '');
    data.append('audio_type', formData.audio_type);
    data.append('platform', formData.platform);
    data.append('review_notes', formData.review_notes);

    // Anexa arquivo se presente
    if (posterFile) {
      data.append('poster_file', posterFile);
    }

    try {
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (isEditMode) {
        // PUT
        const res = await axios.put(`http://localhost:5000/api/movies/edit/${movie.movie_id}`, data, { headers });
        if (res.data.success) {
          const newlyUnlocked = res.data.newlyUnlocked || [];
          const progressedTrophies = res.data.progressedTrophies || [];
          const timeMachineUnlocks = res.data.timeMachineUnlocks || res.data.xpGain?.timeMachineUnlocks || [];

          // 1º Estágio: Troféus PS5 (Colecionáveis de progresso + Conquistados 100%)
          if (progressedTrophies.length > 0 || newlyUnlocked.length > 0) {
            triggerTrophyBatch({
              progressed: progressedTrophies,
              unlocked: newlyUnlocked,
            });
          }

          if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
            axios.post('http://localhost:5000/api/trophies/ack-new', {
              trophyIds: newlyUnlocked.map((x) => x.id),
            }).catch(() => {});
          }

          // 2º Estágio: Desbloqueio da Máquina do Tempo (aguarda troféus terminarem antes de abrir o portal!)
          if (Array.isArray(timeMachineUnlocks) && timeMachineUnlocks.length > 0) {
            triggerTimeMachineUnlock(timeMachineUnlocks);
          }

          // 3º Estágio: Barra de XP (aguarda troféus E Máquina do Tempo terminarem!)
          if (res.data.xpGain) {
            const { statGains, unlockedClass } = computeMovieStatGains({
              movieData: { ...movie, ...formData },
              newlyUnlocked,
              progressedTrophies,
              timeMachineUnlocks,
              existingMovies,
            });

            const enrichedXpGain = {
              ...res.data.xpGain,
              statGains: (res.data.xpGain.statGains && res.data.xpGain.statGains.length > 0)
                ? res.data.xpGain.statGains
                : statGains,
              unlockedClass: res.data.xpGain.unlockedClass || unlockedClass,
            };

            triggerXPGainToast(enrichedXpGain, res.data.xpStatus);
          } else if (res.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.xpStatus);
          }
          onSave(newlyUnlocked, { ...movie, ...formData }, res.data.xpStatus);
          onClose();
        }
      } else {
        // POST
        const res = await axios.post('http://localhost:5000/api/movies/add', data, { headers });
        if (res.data.success) {
          const newlyUnlocked = res.data.newlyUnlocked || [];
          const progressedTrophies = res.data.progressedTrophies || [];
          const timeMachineUnlocks = res.data.timeMachineUnlocks || res.data.xpGain?.timeMachineUnlocks || [];

          // 1º Estágio: Troféus PS5 (Colecionáveis de progresso + Conquistados 100%)
          if (progressedTrophies.length > 0 || newlyUnlocked.length > 0) {
            triggerTrophyBatch({
              progressed: progressedTrophies,
              unlocked: newlyUnlocked,
            });
          }

          if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
            axios.post('http://localhost:5000/api/trophies/ack-new', {
              trophyIds: newlyUnlocked.map((x) => x.id),
            }).catch(() => {});
          }

          // 2º Estágio: Desbloqueio da Máquina do Tempo (aguarda troféus terminarem antes de abrir o portal!)
          if (Array.isArray(timeMachineUnlocks) && timeMachineUnlocks.length > 0) {
            triggerTimeMachineUnlock(timeMachineUnlocks);
          }

          // 3º Estágio: Barra de XP (aguarda troféus E Máquina do Tempo terminarem!)
          if (res.data.xpGain) {
            const { statGains, unlockedClass } = computeMovieStatGains({
              movieData: { id: res.data.movieId, ...formData },
              newlyUnlocked,
              progressedTrophies,
              timeMachineUnlocks,
              existingMovies,
            });

            const enrichedXpGain = {
              ...res.data.xpGain,
              statGains: (res.data.xpGain.statGains && res.data.xpGain.statGains.length > 0)
                ? res.data.xpGain.statGains
                : statGains,
              unlockedClass: res.data.xpGain.unlockedClass || unlockedClass,
            };

            triggerXPGainToast(enrichedXpGain, res.data.xpStatus);
          } else if (res.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.xpStatus);
          }
          onSave(newlyUnlocked, { id: res.data.movieId, ...formData }, res.data.xpStatus);
          onClose();
        }
      }
    } catch (err) {
      console.error('Erro ao salvar o filme:', err);
      const errorMsg = err.response?.data?.error || 'Erro ao salvar o filme no banco de dados.';
      alert(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-all duration-300">
      
      {/* Container Principal do Modal */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
              <Film className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-100 tracking-tight leading-none">
                {isEditMode ? `Editar Filme: ${formData.title}` : 'Adicionar Novo Filme'}
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Uploads Locais & Sincronizadores Ativos
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 p-1.5 rounded-lg transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Busca preditiva no topo (Visível em Ambos os Modos) */}
        <div className="px-6 py-3 border-b border-zinc-800/50 bg-zinc-950/20 flex flex-col gap-1 relative z-20">
          <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">
            {isEditMode ? 'Puxar/Atualizar Informações da API (TMDB)' : 'Pesquisar Filme na API (TMDB)'}
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder={isEditMode ? "Pesquise outro filme ou digite para atualizar metadados técnicos..." : "Comece a digitar o título do filme..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-200 outline-none transition-all duration-300 placeholder:text-zinc-600"
            />
            {searching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-amber-500/25 border-t-amber-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Dropdown de Resultados da Pesquisa da API */}
          {searchResults.length > 0 && (
            <div className="absolute left-6 right-6 top-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-30 max-h-80 overflow-y-auto">
              {searchResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectTmdbMovie(m.id)}
                  className="w-full text-left px-4 py-3.5 hover:bg-zinc-900 border-b border-zinc-900/60 last:border-0 flex items-start gap-4 transition-colors duration-200"
                >
                  {m.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} 
                      alt="" 
                      className="w-9 h-13 object-cover rounded border border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-13 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-650 shrink-0">No Img</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-zinc-200 flex items-center gap-1.5 flex-wrap">
                      <span>{m.title}</span>
                      <span className="text-xs text-amber-500 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                        ({m.release_date ? m.release_date.split('-')[0] : 'N/A'})
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">
                      {m.original_title && m.original_title !== m.title ? `Original: ${m.original_title}` : ''}
                    </div>
                    {m.overview && (
                      <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-1 leading-relaxed">
                        {m.overview}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulário - Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {loadingApi && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-40">
              <div className="flex flex-col items-center gap-3 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
                <div className="w-8 h-8 border-4 border-amber-500/25 border-t-amber-500 rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-zinc-300">Acessando servidores externos...</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Coluna Esquerda: Dados Técnicos (API / Planilha) */}
            <div className="flex flex-col gap-5 border-r border-zinc-800/30 lg:pr-8">
              <div className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-2">
                <Film className="w-3.5 h-3.5" />
                Dados Técnicos do Filme
              </div>

              {/* Título Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Título em Português*</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Título Original</label>
                  <input
                    type="text"
                    name="original_title"
                    value={formData.original_title}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Ano, Duração e IMDb ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Ano de Lançamento</label>
                  <input
                    type="number"
                    name="release_year"
                    value={formData.release_year}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Duração (Minutos)</label>
                  <input
                    type="number"
                    name="runtime"
                    value={formData.runtime}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">IMDb ID (tt...)</label>
                  <input
                    type="text"
                    name="imdb_id"
                    value={formData.imdb_id}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Capa/Poster Duplo (Upload Local ou URL) */}
              <div className="flex flex-col gap-2.5 bg-zinc-950/20 border border-zinc-850 p-3.5 rounded-xl">
                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Capa / Imagem do Pôster</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Opção A: Cole URL Externa</span>
                    <input
                      type="text"
                      name="poster_url"
                      value={formData.poster_url}
                      onChange={handleInputChange}
                      placeholder="http://site.com/imagem.jpg"
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Opção B: Upload do Computador</span>
                    <div className="relative flex items-center justify-center bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-400 cursor-pointer h-[38px] transition-colors duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPosterFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="truncate max-w-[180px] font-semibold">
                        {posterFile ? posterFile.name : 'Selecionar arquivo (.png, .jpg, .webp)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas Técnicas + Sincronizador OMDb */}
              <div className="flex flex-col gap-3 bg-zinc-950/30 border border-zinc-800/40 p-4 rounded-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-1.5">
                  <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest flex items-center gap-1.5">
                    📈 Avaliações & Crítica Externa
                  </span>
                  <button
                    type="button"
                    onClick={handleSyncRatings}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Buscar Notas das APIs 🔄
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Nota IMDb</label>
                    <input
                      type="text"
                      name="imdb_rating"
                      value={formData.imdb_rating}
                      onChange={handleInputChange}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Metacritic</label>
                    <input
                      type="number"
                      name="metacritic_score"
                      value={formData.metacritic_score}
                      onChange={handleInputChange}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Rotten (%)</label>
                    <input
                      type="number"
                      name="rotten_tomatoes_score"
                      value={formData.rotten_tomatoes_score}
                      onChange={handleInputChange}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">👥 Qtd de Votos</label>
                    <input
                      type="number"
                      name="vote_count"
                      value={formData.vote_count}
                      onChange={handleInputChange}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono font-bold text-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Conquistas do Oscar */}
              <div className="flex flex-col gap-3 bg-zinc-950/30 border border-zinc-800/40 p-4 rounded-xl">
                <div className="border-b border-zinc-800/40 pb-1.5">
                  <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest flex items-center gap-1.5">
                    🏆 Premiações & Conquistas (Oscar)
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1">🏆 Oscars Ganhos</label>
                    <input
                      type="number"
                      name="oscar_wins"
                      value={formData.oscar_wins}
                      onChange={handleInputChange}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">🎬 Indicações</label>
                    <input
                      type="number"
                      name="oscar_nominations"
                      value={formData.oscar_nominations}
                      onChange={handleInputChange}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Países (Badges + Regras Clicáveis + Busca Rápida) */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-1">
                  <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    Países de Origem
                  </span>
                  <button
                    type="button"
                    onClick={handleAddNewCountryPrompt}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar País
                  </button>
                </div>

                {/* Campo de Pesquisa Rápida para Países */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="🔍 Pesquisar país..."
                    value={countrySearchQuery}
                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500 placeholder:text-zinc-600 transition-colors"
                  />
                  {countrySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCountrySearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                      title="Limpar busca de país"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Grid de Badges de Países com Altura Expandida e Filtro em Tempo Real */}
                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto border border-zinc-800/40 p-3 rounded-xl bg-zinc-950/20 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                  {(() => {
                    const mergedCountryNames = Array.from(
                      new Set([
                        ...(formData.countries || []),
                        ...activeCountries.map((c) => c.name),
                      ])
                    ).sort((a, b) => a.localeCompare(b, 'pt'));

                    if (mergedCountryNames.length === 0) {
                      return (
                        <span className="text-[10px] text-zinc-600 italic">
                          Carregando países ativos...
                        </span>
                      );
                    }

                    const cleanSearch = countrySearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                    const filteredCountries = cleanSearch
                      ? mergedCountryNames.filter((c) =>
                          c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(cleanSearch)
                        )
                      : mergedCountryNames;

                    if (filteredCountries.length === 0) {
                      return (
                        <span className="text-[10px] text-zinc-500 italic py-1">
                          Nenhum país encontrado para &quot;{countrySearchQuery}&quot;
                        </span>
                      );
                    }

                    return filteredCountries.map((countryName) => {
                      const isSelected = formData.countries.includes(countryName);
                      return (
                        <button
                          key={countryName}
                          type="button"
                          onClick={() => toggleCountry(countryName)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-zinc-900/40 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                          {countryName}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Gêneros, Diretores, Estúdios e Distribuidora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Gêneros (Separados por vírgula)</label>
                  <input
                    type="text"
                    name="genres"
                    value={formData.genres}
                    onChange={handleInputChange}
                    placeholder="Horror, Drama, Suspense"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500 placeholder:text-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Diretores (Separados por vírgula)</label>
                  <input
                    type="text"
                    name="directors"
                    value={formData.directors}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Roteiristas (Separados por vírgula)</label>
                  <input
                    type="text"
                    name="writers"
                    value={formData.writers}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Estúdios (Separados por vírgula)</label>
                  <input
                    type="text"
                    name="studios"
                    value={formData.studios}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Distribuidora</label>
                  <input
                    type="text"
                    name="distributor"
                    value={formData.distributor}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Sinopse */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Sinopse do Filme</label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleInputChange}
                  rows="4"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Coluna Direita: Minha Avaliação Pessoal (Visualização) */}
            <div className="flex flex-col gap-5">
              <div className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-2">
                <Star className="w-3.5 h-3.5" />
                Minha Avaliação Pessoal
              </div>

              {/* Nota Pessoal com 3 Casas Decimais no placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Minha Nota (0 a 10)</label>
                  <input
                    type="text"
                    name="user_rating"
                    value={formData.user_rating}
                    onChange={handleInputChange}
                    placeholder="Ex: 9.500"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Mês Visto</label>
                  <select
                    name="month_seen"
                    value={formData.month_seen}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  >
                    <option value="">Não Informado</option>
                    {Array.from({ length: 12 }, (_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {new Date(0, idx).toLocaleString('pt-BR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Ano Visto</label>
                  <input
                    type="number"
                    name="year_seen"
                    value={formData.year_seen}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Áudio e Plataforma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Tipo de Áudio</label>
                  <select
                    name="audio_type"
                    value={formData.audio_type}
                    onChange={handleInputChange}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  >
                    <option value="Dublado">Dublado</option>
                    <option value="Legendado">Legendado</option>
                    <option value="Legendado pelo Youtube">Legendado pelo Youtube</option>
                    <option value="Original">Original</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Visto Em (Plataforma)</label>
                  <input
                    type="text"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    placeholder="Ex: Netflix, Prime Video, Cinema"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Minha Crítica / Observações */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Minha Crítica / Observações</label>
                <textarea
                  name="review_notes"
                  value={formData.review_notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Tags Customizadas (Espaço Aberto Total + Pesquisa Rápida) */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Vincular Tags Customizadas</span>
                  {allTags.length > 0 && (
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                      {formData.tags.length} selecionada{formData.tags.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {/* Linha Dupla: 1) Pesquisar Tag Existente | 2) Adicionar Nova Tag */}
                <div className="flex flex-col gap-2">
                  {/* Campo de Pesquisa Rápida para Tags */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="🔍 Pesquisar tag existente..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500 placeholder:text-zinc-600 transition-colors"
                    />
                    {tagSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTagSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                        title="Limpar busca de tag"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Campo para criar/inserir nova tag rapidamente */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar nova tag personalizada..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500 placeholder:text-zinc-600"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCustomTag}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 rounded-xl border border-zinc-700/50 flex items-center justify-center cursor-pointer transition-colors"
                      title="Cadastrar nova tag"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid Aberto de Tags (Sem scroll interno para exibir tudo de uma vez no espaço livre) */}
                <div className="flex flex-wrap gap-1.5 border border-zinc-800/40 p-3 rounded-xl bg-zinc-950/20">
                  {(() => {
                    const allUniqueTags = Array.from(new Set([...formData.tags, ...allTags])).sort((a, b) => a.localeCompare(b, 'pt'));
                    if (allUniqueTags.length === 0) {
                      return (
                        <span className="text-[10px] text-zinc-600 italic">Digite e adicione tags customizadas acima...</span>
                      );
                    }

                    const cleanTagSearch = tagSearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                    const filteredTags = cleanTagSearch
                      ? allUniqueTags.filter((t) =>
                          t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(cleanTagSearch)
                        )
                      : allUniqueTags;

                    if (filteredTags.length === 0) {
                      return (
                        <div className="w-full flex items-center justify-between text-[11px] text-zinc-500 py-1">
                          <span>Nenhuma tag encontrada para &quot;{tagSearchQuery}&quot;</span>
                          <button
                            type="button"
                            onClick={() => {
                              const tagToAdd = tagSearchQuery.trim();
                              if (tagToAdd && !formData.tags.includes(tagToAdd)) {
                                setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagToAdd] }));
                              }
                              setTagSearchQuery('');
                            }}
                            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-colors cursor-pointer"
                          >
                            + Adicionar &quot;{tagSearchQuery}&quot;
                          </button>
                        </div>
                      );
                    }

                    return filteredTags.map((tag) => {
                      const isSelected = formData.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 ring-1 ring-amber-500/20'
                              : 'bg-zinc-900/40 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                          {tag}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>

          </div>

          {/* Botões de Ação no Rodapé do Form */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-800 font-bold px-6 py-2.5 rounded-xl transition-all duration-300 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-8 py-2.5 rounded-xl transition-all duration-300 text-xs shadow-lg shadow-amber-500/10"
            >
              {isEditMode ? 'Salvar Alterações' : 'Cadastrar Filme'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
