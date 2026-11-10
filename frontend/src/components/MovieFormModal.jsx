import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Film,
  Globe,
  Star,
  Sparkles,
  Check,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { triggerTrophyBatch } from './PS5TrophyToastContainer';
import { triggerXPGainToast, triggerTimeMachineUnlock, dispatchXpStatusUpdate } from '../utils/xpSystem';
import { computeMovieStatGains } from '../utils/analyticsEngine';
import { UN_COUNTRIES_195, HISTORICAL_TERRITORIES } from '../data/unCountries195';
import { triggerApiRefreshToast } from './ApiRefreshToastContainer';

const DEFAULT_PLATFORMS = [
  'Cinema',
  'Blu Ray',
  'DVD',
  'Netflix',
  'Prime Video',
  'HBO MAX',
  'Disney +',
  'Star +',
  'Apple TV+',
  'Internet',
  'My Family Cine',
  'Youtube'
];

const ALL_REFERENCE_COUNTRIES = [
  ...UN_COUNTRIES_195.map((c) => ({ name: c.name, code: c.code })),
  ...HISTORICAL_TERRITORIES.map((t) => ({ name: t.name, code: t.flagCode })),
];

const COUNTRY_CODE_MAP = ALL_REFERENCE_COUNTRIES.reduce((acc, item) => {
  acc[item.name.toLowerCase().trim()] = item.code;
  return acc;
}, {});

function getCountryFlagUrl(countryName) {
  if (!countryName) return null;
  const code = COUNTRY_CODE_MAP[countryName.toLowerCase().trim()];
  return code ? `https://flagcdn.com/w20/${code.toLowerCase()}.png` : null;
}

export default function MovieFormModal({
  isOpen,
  onClose,
  movie,
  onSave,
  allTags = [],
  allPlatforms = [],
  initialSearchQuery = '',
  initialReleaseYear = '',
  existingMovies = [],
  onApiRefreshed = null
}) {
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

  // Upload local do pôster e galeria da API
  const [posterFile, setPosterFile] = useState(null);
  const [availablePosters, setAvailablePosters] = useState([]);
  const [isPosterGalleryOpen, setIsPosterGalleryOpen] = useState(false);

  // Países ativos do banco & Popover pesquisável
  const [activeCountries, setActiveCountries] = useState([]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  // Plataformas & Combobox customizável
  const [savedCustomPlatforms, setSavedCustomPlatforms] = useState(() => {
    try {
      const saved = localStorage.getItem('cine_catalog_custom_platforms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isAddingCustomPlatform, setIsAddingCustomPlatform] = useState(false);
  const [customPlatformInput, setCustomPlatformInput] = useState('');
  const platformDropdownRef = useRef(null);

  // Acordeão da Sinopse
  const [isSynopsisOpen, setIsSynopsisOpen] = useState(false);

  // Estados de busca preditiva na API
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [refreshingSafeApi, setRefreshingSafeApi] = useState(false);
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

  // Fecha popovers internos ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setIsCountryDropdownOpen(false);
      }
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(e.target)) {
        setIsPlatformDropdownOpen(false);
        setIsAddingCustomPlatform(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Lista unificada e deduplicada de plataformas (Padrão + Banco + Customizadas locais)
  const platformOptions = useMemo(() => {
    const map = new Map();
    DEFAULT_PLATFORMS.forEach((p) => {
      map.set(p.toLowerCase().trim(), p);
    });
    [...(allPlatforms || []), ...(savedCustomPlatforms || [])].forEach((p) => {
      const clean = String(p || '').trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      if (!map.has(key)) {
        map.set(key, clean);
      }
    });
    if (formData.platform && formData.platform.trim()) {
      const clean = formData.platform.trim();
      if (!map.has(clean.toLowerCase())) {
        map.set(clean.toLowerCase(), clean);
      }
    }
    return Array.from(map.values());
  }, [allPlatforms, savedCustomPlatforms, formData.platform]);

  // Sincronizar dados ao abrir/trocar de filme (Modo Edição)
  useEffect(() => {
    let cancelled = false;
    if (isOpen) {
      loadActiveCountries();
      setPosterFile(null); // Reseta arquivo selecionado anterior
      setIsPosterGalleryOpen(false);
      setIsCountryDropdownOpen(false);
      setIsPlatformDropdownOpen(false);
      setIsAddingCustomPlatform(false);
      setCustomPlatformInput('');
      setIsSynopsisOpen(false);

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

        // Se já houver galeria salva ou tmdb_id/imdb_id, disponibiliza múltiplas capas do TMDB
        const cachedPosters = movie.raw_api_data?.tmdb?.images?.posters;
        if (Array.isArray(cachedPosters) && cachedPosters.length > 0) {
          setAvailablePosters(
            cachedPosters.map((p) => ({
              file_path: p.file_path,
              url: p.url || `https://image.tmdb.org/t/p/w500${p.file_path}`,
              thumb_url: p.thumb_url || `https://image.tmdb.org/t/p/w342${p.file_path}`,
              iso_639_1: p.iso_639_1 || null,
            }))
          );
        } else {
          setAvailablePosters([]);
          if (movie.tmdb_id || movie.imdb_id) {
            axios
              .get('http://localhost:5000/api/movies/posters-api', {
                params: {
                  tmdb_id: movie.tmdb_id || undefined,
                  imdb_id: movie.imdb_id || undefined,
                  title: movie.original_title || movie.title,
                  year: movie.release_year || undefined,
                },
              })
              .then((res) => {
                if (!cancelled && res.data?.success && Array.isArray(res.data.posters)) {
                  setAvailablePosters(res.data.posters);
                }
              })
              .catch(() => {});
          }
        }
      } else {
        // Modo de Cadastro Limpo
        setAvailablePosters([]);
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
    return () => {
      cancelled = true;
    };
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
        const apiPosters = d.images?.posters || d.available_posters || [];
        setAvailablePosters(apiPosters);
        setIsPosterGalleryOpen(false);

        setFormData(prev => ({
          ...prev,
          tmdb_id: d.tmdb_id,
          imdb_id: d.imdb_id || '',
          title: d.title || '',
          original_title: d.original_title || '',
          release_year: d.release_year || '',
          runtime: d.runtime || '',
          synopsis: d.synopsis || '',
          poster_url: d.poster_url || (apiPosters[0]?.url || ''),
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

  // Salva nova plataforma personalizada e seleciona no formulário
  const handleSaveCustomPlatform = () => {
    const clean = customPlatformInput.trim();
    if (!clean) return;
    setSavedCustomPlatforms((prev) => {
      const exists = prev.some((p) => p.toLowerCase() === clean.toLowerCase());
      const next = exists ? prev : [...prev, clean];
      try {
        localStorage.setItem('cine_catalog_custom_platforms', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
    setFormData((prev) => ({ ...prev, platform: clean }));
    setCustomPlatformInput('');
    setIsAddingCustomPlatform(false);
    setIsPlatformDropdownOpen(false);
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

  // Cria dinamicamente um novo país no banco (via nome direto ou prompt)
  const handleAddNewCountry = async (explicitName) => {
    const rawName = typeof explicitName === 'string'
      ? explicitName
      : window.prompt('Digite o nome do novo país (ex: Japão):');
    if (rawName && rawName.trim()) {
      try {
        const res = await axios.post('http://localhost:5000/api/countries/add', { name: rawName.trim() });
        if (res.data.success) {
          const newCountry = res.data.data;
          setActiveCountries(prev => {
            if (prev.some(c => c.name.toLowerCase() === newCountry.name.toLowerCase())) return prev;
            return [...prev, newCountry].sort((a, b) => a.name.localeCompare(b.name));
          });
          setFormData(prev => ({
            ...prev,
            countries: prev.countries.includes(newCountry.name) ? prev.countries : [...prev.countries, newCountry.name]
          }));
          setCountrySearchQuery('');
        }
      } catch (err) {
        console.error('Erro ao adicionar país:', err);
      }
    }
  };

  // Atualização Seletiva de Métricas da API (Notas, Votos e Oscars APENAS - com Toast comparativo)
  const handleRefreshApiMetricsSafe = async () => {
    if (isEditMode && movie?.movie_id) {
      setRefreshingSafeApi(true);
      try {
        const res = await axios.post(`http://localhost:5000/api/movies/${movie.movie_id}/refresh-api-metrics`);
        if (res.data?.success) {
          const m = res.data.metrics;
          setFormData(prev => ({
            ...prev,
            imdb_rating: m.imdb_rating !== null && m.imdb_rating !== undefined ? m.imdb_rating : prev.imdb_rating,
            metacritic_score: m.metacritic_score !== null && m.metacritic_score !== undefined ? m.metacritic_score : prev.metacritic_score,
            rotten_tomatoes_score: m.rotten_tomatoes_score !== null && m.rotten_tomatoes_score !== undefined ? m.rotten_tomatoes_score : prev.rotten_tomatoes_score,
            vote_count: m.vote_count !== null && m.vote_count !== undefined ? m.vote_count : prev.vote_count,
            oscar_wins: m.oscar_wins !== null && m.oscar_wins !== undefined ? m.oscar_wins : prev.oscar_wins,
            oscar_nominations: m.oscar_nominations !== null && m.oscar_nominations !== undefined ? m.oscar_nominations : prev.oscar_nominations,
          }));
          triggerApiRefreshToast(res.data);
          if (onApiRefreshed) {
            onApiRefreshed(res.data);
          }
        }
      } catch (err) {
        triggerApiRefreshToast({
          title: formData.title || movie.title,
          error: err.response?.data?.error || err.message,
        });
      } finally {
        setRefreshingSafeApi(false);
      }
      return;
    }

    // Fallback no modo Cadastro Novo (sem ID salvo no banco ainda): busca notas via OMDb e exibe comparativo
    const { imdb_id, title } = formData;
    if (!imdb_id && !title) {
      alert('Preencha o Título ou o IMDb ID para buscar os dados nas APIs.');
      return;
    }
    setRefreshingSafeApi(true);
    try {
      const params = {};
      if (imdb_id) params.imdb_id = imdb_id;
      else if (title) params.title = title;

      const res = await axios.get('http://localhost:5000/api/movies/fetch-external-ratings', { params });
      if (res.data.success) {
        const ratings = res.data.data;
        const prevImdb = formData.imdb_rating ? Number(formData.imdb_rating) : null;
        const prevMc = formData.metacritic_score ? Number(formData.metacritic_score) : null;
        const prevRt = formData.rotten_tomatoes_score ? Number(formData.rotten_tomatoes_score) : null;
        const prevVotes = formData.vote_count ? Number(formData.vote_count) : null;

        const nextImdb = ratings.imdb_rating !== null ? ratings.imdb_rating : prevImdb;
        const nextMc = ratings.metacritic_score !== null ? ratings.metacritic_score : prevMc;
        const nextRt = ratings.rotten_tomatoes_score !== null ? ratings.rotten_tomatoes_score : prevRt;
        const nextVotes = ratings.vote_count !== null ? ratings.vote_count : prevVotes;

        setFormData(prev => ({
          ...prev,
          imdb_rating: nextImdb !== null ? nextImdb : prev.imdb_rating,
          metacritic_score: nextMc !== null ? nextMc : prev.metacritic_score,
          rotten_tomatoes_score: nextRt !== null ? nextRt : prev.rotten_tomatoes_score,
          vote_count: nextVotes !== null ? nextVotes : prev.vote_count
        }));

        triggerApiRefreshToast({
          title: formData.title || 'Novo Filme',
          changes: {
            imdb_rating: { before: prevImdb, after: nextImdb, changed: prevImdb !== nextImdb },
            metacritic_score: { before: prevMc, after: nextMc, changed: prevMc !== nextMc },
            rotten_tomatoes_score: { before: prevRt, after: nextRt, changed: prevRt !== nextRt },
            vote_count: { before: prevVotes, after: nextVotes, changed: prevVotes !== nextVotes },
            oscar_wins: { before: Number(formData.oscar_wins) || 0, after: Number(formData.oscar_wins) || 0, changed: false },
            oscar_nominations: { before: Number(formData.oscar_nominations) || 0, after: Number(formData.oscar_nominations) || 0, changed: false },
          },
        });
      }
    } catch (err) {
      triggerApiRefreshToast({
        title: formData.title || 'Novo Filme',
        error: err.response?.data?.error || err.message,
      });
    } finally {
      setRefreshingSafeApi(false);
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

              {/* Capa/Poster Duplo (Upload Local, URL e Galeria Múltipla TMDB) */}
              <div className="flex flex-col gap-2.5 bg-zinc-950/20 border border-zinc-850 p-3.5 rounded-xl relative">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    Capa / Imagem do Pôster
                  </label>

                  {availablePosters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIsPosterGalleryOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <span>🖼️</span>
                      <span>Escolher Outra Capa da API ({availablePosters.length} disponíveis)</span>
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  {/* Mini pré-visualização da capa ativa */}
                  {(posterFile || formData.poster_url) && (
                    <div className="w-12 h-[72px] rounded-lg overflow-hidden border border-zinc-700/80 bg-zinc-950 shrink-0 shadow-md">
                      <img
                        src={
                          posterFile
                            ? URL.createObjectURL(posterFile)
                            : formData.poster_url.startsWith('/')
                              ? `http://localhost:5000${formData.poster_url}`
                              : formData.poster_url
                        }
                        alt="Prévia da Capa"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
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
                      <div className="relative flex items-center justify-center bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-400 cursor-pointer h-[36px] transition-colors duration-300">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPosterFile(e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <span className="truncate max-w-[160px] font-semibold">
                          {posterFile ? posterFile.name : 'Selecionar arquivo (.png, .jpg...)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popover / Galeria de Seleção de Múltiplos Pôsteres TMDB */}
                {isPosterGalleryOpen && availablePosters.length > 1 && (
                  <div className="mt-2 bg-zinc-950/98 border border-amber-500/40 rounded-xl p-3 shadow-2xl z-30">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        🖼️ Capas Oficiais Disponíveis na API TMDB ({availablePosters.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPosterGalleryOpen(false)}
                        className="text-zinc-400 hover:text-zinc-100 p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                      {availablePosters.map((posterOpt, idx) => {
                        const isSelected = !posterFile && formData.poster_url === posterOpt.url;
                        const langLabel = posterOpt.iso_639_1 ? posterOpt.iso_639_1.toUpperCase() : 'LIMPO';
                        return (
                          <button
                            key={posterOpt.file_path || idx}
                            type="button"
                            onClick={() => {
                              setPosterFile(null);
                              setFormData((prev) => ({ ...prev, poster_url: posterOpt.url }));
                              setIsPosterGalleryOpen(false);
                            }}
                            className={`group relative aspect-[2/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[0.98]'
                                : 'border-zinc-800 hover:border-amber-500/60 hover:scale-[1.03]'
                            }`}
                            title={`Selecionar capa (${langLabel})`}
                          >
                            <img
                              src={posterOpt.thumb_url || posterOpt.url}
                              alt={`Capa ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/80 text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-zinc-200 border border-zinc-700/60">
                              {langLabel}
                            </span>
                            {isSelected && (
                              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Notas Técnicas + Sincronizador Seguro OMDb/TMDB */}
              <div className="flex flex-col gap-3 bg-zinc-950/30 border border-zinc-800/40 p-4 rounded-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-1.5 gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest flex items-center gap-1.5">
                    📈 Avaliações & Crítica Externa
                  </span>
                  <button
                    type="button"
                    disabled={refreshingSafeApi}
                    onClick={handleRefreshApiMetricsSafe}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-500 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-60"
                    title="Buscar notas externas e votos no OMDb para este filme"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshingSafeApi ? 'animate-spin' : ''}`} />
                    <span>{refreshingSafeApi ? 'Buscando...' : 'Buscar Notas das APIs 🔄'}</span>
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

              {/* Países de Origem Reestruturado: Chips atribuídos + Popover pesquisável */}
              <div ref={countryDropdownRef} className="flex flex-col gap-2 bg-zinc-950/20 border border-zinc-800/40 p-3.5 rounded-xl relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    Países de Origem
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {formData.countries.length} {formData.countries.length === 1 ? 'país atribuído' : 'países atribuídos'}
                  </span>
                </div>

                {/* Chips dos países atribuídos + botão limpo + Adicionar País */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {formData.countries.map((countryName) => {
                    const flagUrl = getCountryFlagUrl(countryName);
                    return (
                      <span
                        key={countryName}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/35"
                      >
                        {flagUrl ? (
                          <img
                            src={flagUrl}
                            alt={countryName}
                            className="w-4 h-2.5 object-cover rounded-sm shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px]">🌐</span>
                        )}
                        <span>{countryName}</span>
                        <button
                          type="button"
                          onClick={() => toggleCountry(countryName)}
                          className="ml-0.5 text-amber-300/70 hover:text-rose-400 transition-colors cursor-pointer"
                          title={`Remover ${countryName}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/35 hover:border-amber-400/70 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar País</span>
                  </button>
                </div>

                {/* Popover Pesquisável de Países */}
                {isCountryDropdownOpen && (
                  <div className="mt-1 bg-zinc-950/98 border border-zinc-700/80 rounded-xl p-3 shadow-2xl z-30 flex flex-col gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Pesquisar país para adicionar..."
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500 placeholder:text-zinc-600"
                      />
                      {countrySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCountrySearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                      {(() => {
                        const mergedCountryNames = Array.from(
                          new Set([
                            ...(formData.countries || []),
                            ...activeCountries.map((c) => c.name),
                            ...ALL_REFERENCE_COUNTRIES.map((c) => c.name),
                          ])
                        ).sort((a, b) => a.localeCompare(b, 'pt'));

                        const cleanSearch = countrySearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                        const filteredCountries = cleanSearch
                          ? mergedCountryNames.filter((c) =>
                              c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(cleanSearch)
                            )
                          : mergedCountryNames;

                        return (
                          <>
                            {filteredCountries.map((countryName) => {
                              const isSelected = formData.countries.includes(countryName);
                              const flagUrl = getCountryFlagUrl(countryName);
                              return (
                                <button
                                  key={countryName}
                                  type="button"
                                  onClick={() => {
                                    toggleCountry(countryName);
                                    setCountrySearchQuery('');
                                  }}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                                    isSelected
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-zinc-900/50 text-zinc-300 border-zinc-800/70 hover:bg-zinc-800/80 hover:text-zinc-100'
                                  }`}
                                >
                                  <span className="flex items-center gap-2 truncate">
                                    {flagUrl ? (
                                      <img
                                        src={flagUrl}
                                        alt={countryName}
                                        className="w-4 h-3 object-cover rounded-sm shrink-0"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xs shrink-0">🌐</span>
                                    )}
                                    <span className="truncate">{countryName}</span>
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                </button>
                              );
                            })}
                            {countrySearchQuery.trim() &&
                              !mergedCountryNames.some(
                                (c) => c.toLowerCase() === countrySearchQuery.trim().toLowerCase()
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => handleAddNewCountry(countrySearchQuery.trim())}
                                  className="mt-1 text-xs px-2.5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Cadastrar novo país &quot;{countrySearchQuery.trim()}&quot;</span>
                                </button>
                              )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
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

              {/* Sinopse Otimizada com Acordeão Toggle */}
              <div className="flex flex-col gap-2 bg-zinc-950/20 border border-zinc-800/40 p-3 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Sinopse do Filme</label>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      formData.synopsis?.trim()
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}>
                      {formData.synopsis?.trim() ? 'Preenchida' : 'Vazia'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSynopsisOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {isSynopsisOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>👁️ {isSynopsisOpen ? 'Ocultar Sinopse' : 'Ver / Editar Sinopse'}</span>
                  </button>
                </div>

                {isSynopsisOpen && (
                  <textarea
                    name="synopsis"
                    value={formData.synopsis}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Escreva ou edite a sinopse do filme..."
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500 resize-none placeholder:text-zinc-700"
                  />
                )}
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

              {/* Áudio e Seletor Inteligente de Plataforma */}
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
                <div ref={platformDropdownRef} className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Visto Em (Plataforma)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlatformDropdownOpen((prev) => !prev);
                      setIsAddingCustomPlatform(false);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <span className={formData.platform ? 'text-zinc-200 font-medium truncate' : 'text-zinc-500 truncate'}>
                      {formData.platform || 'Selecionar plataforma...'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 transition-transform shrink-0 ${
                        isPlatformDropdownOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {isPlatformDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-950/98 border border-zinc-700/80 rounded-xl p-2 shadow-2xl z-30 flex flex-col gap-1">
                      <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                        {platformOptions.map((plat) => {
                          const isSelected =
                            formData.platform &&
                            formData.platform.toLowerCase().trim() === plat.toLowerCase().trim();
                          return (
                            <button
                              key={plat}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, platform: plat }));
                                setIsPlatformDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100'
                              }`}
                            >
                              <span>{plat}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-zinc-800 pt-1.5 mt-0.5">
                        {!isAddingCustomPlatform ? (
                          <button
                            type="button"
                            onClick={() => setIsAddingCustomPlatform(true)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-black text-amber-400 hover:bg-amber-500/15 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Cadastrar Nova Plataforma...</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 p-1">
                            <input
                              type="text"
                              autoFocus
                              value={customPlatformInput}
                              onChange={(e) => setCustomPlatformInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveCustomPlatform();
                                }
                              }}
                              placeholder="Nome da plataforma..."
                              className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-2.5 py-1 text-xs text-zinc-200 outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSaveCustomPlatform}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                              Salvar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
