import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  SkipForward,
  XCircle,
  Search,
  Zap,
  RefreshCw,
  Sparkles,
  Check,
  Info,
  StopCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SpreadsheetImportModal({
  isOpen,
  onClose,
  onImportComplete,
  onReviewMovie,
  reviewedMovieIds = []
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'needs_review' | 'imported_api' | 'skipped' | 'error'
  const [acceptingId, setAcceptingId] = useState(null);
  const [linkedMap, setLinkedMap] = useState({}); // { [movieId]: linkedTitle }
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const pollTimerRef = useRef(null);
  const notifiedDoneRef = useRef(false);

  // Limpa polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const activeJobId = job?.jobId;
  const activeJobStatus = job?.status;

  // Polling de progresso em tempo real enquanto o job estiver rodando
  useEffect(() => {
    if (!activeJobId || activeJobStatus !== 'running') {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/movies/import-status/${activeJobId}`);
        if (res.data.success) {
          const updatedJob = res.data.data;
          setJob(updatedJob);

          if (updatedJob.status !== 'running' && !notifiedDoneRef.current) {
            notifiedDoneRef.current = true;
            if (updatedJob.counts.needsReview > 0) {
              setActiveFilter('needs_review');
            } else {
              setActiveFilter('all');
            }
            if (onImportComplete) {
              onImportComplete();
            }
          }
        }
      } catch (err) {
        console.error('[Importer] Erro ao consultar status:', err);
      }
    }, 350);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [activeJobId, activeJobStatus, onImportComplete]);

  const validateAndSetFile = (file) => {
    if (!file) return;
    setErrorMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xlsm', 'xls'].includes(ext)) {
      setErrorMsg('Formato inválido! Selecione um arquivo .xlsx, .xlsm, .xls ou .csv.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setErrorMsg('');
    notifiedDoneRef.current = false;
    setLinkedMap({});

    try {
      const formData = new FormData();
      formData.append('sheet_file', selectedFile);

      const res = await axios.post(`${API_BASE_URL}/movies/import-sheet`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const statusRes = await axios.get(`${API_BASE_URL}/movies/import-status/${res.data.jobId}`);
        if (statusRes.data.success) {
          const initialJob = statusRes.data.data;
          setJob(initialJob);
          if (initialJob.status !== 'running' && !notifiedDoneRef.current) {
            notifiedDoneRef.current = true;
            if (initialJob.counts.needsReview > 0) {
              setActiveFilter('needs_review');
            }
            if (onImportComplete) onImportComplete();
          }
        }
      }
    } catch (err) {
      console.error('[Importer] Erro ao enviar planilha:', err);
      setErrorMsg(err.response?.data?.error || 'Falha ao enviar planilha para o servidor.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelJob = async () => {
    if (!job || job.status !== 'running') return;
    try {
      await axios.post(`${API_BASE_URL}/movies/import-cancel/${job.jobId}`);
    } catch (err) {
      console.error('[Importer] Erro ao cancelar:', err);
    }
  };

  const handleResetImporter = () => {
    setSelectedFile(null);
    setJob(null);
    setActiveFilter('all');
    setErrorMsg('');
    notifiedDoneRef.current = false;
  };

  // Vincula em 1 clique usando a sugestão encontrada pela API, preservando 100% dos seus dados pessoais da planilha!
  const handleAcceptSuggestion = async (item) => {
    if (!item.suggestedApi || !item.movie) return;
    const movieDbId = item.movie.movie_id;
    setAcceptingId(movieDbId);

    try {
      const detailsRes = await axios.get(
        `${API_BASE_URL}/movies/details-api?id=${item.suggestedApi.tmdb_id}`
      );
      if (!detailsRes.data.success) {
        throw new Error('Não foi possível obter os detalhes completos do TMDB.');
      }

      const d = detailsRes.data.data;
      const m = item.movie;

      const data = new FormData();
      data.append('title', d.title || m.title || '');
      data.append('original_title', d.original_title || m.original_title || '');
      data.append('release_year', String(d.release_year || m.release_year || ''));
      data.append('runtime', String(d.runtime || m.runtime || ''));
      data.append('synopsis', d.synopsis || m.synopsis || '');
      data.append('poster_url', d.poster_url || m.poster_url || '');
      data.append('imdb_id', d.imdb_id || m.imdb_id || '');
      data.append('tmdb_id', String(d.tmdb_id || ''));
      data.append('imdb_rating', String(d.imdb_rating ?? m.imdb_rating ?? ''));
      data.append('metacritic_score', String(d.metacritic_score ?? m.metacritic_score ?? ''));
      data.append('rotten_tomatoes_score', String(d.rotten_tomatoes_score ?? m.rotten_tomatoes_score ?? ''));
      data.append('oscar_wins', String(m.oscar_wins || d.oscar_wins || 0));
      data.append('oscar_nominations', String(m.oscar_nominations || d.oscar_nominations || 0));
      data.append('vote_count', String(d.vote_count || m.vote_count || 0));
      data.append('is_custom', 'true');

      const finalCountries =
        d.countries && d.countries.length > 0 ? d.countries : m.countries || [];
      const finalGenres =
        d.genres && d.genres.length > 0 ? d.genres : m.genres || [];
      const finalDirectors =
        d.directors && d.directors.length > 0 ? d.directors : m.directors || [];
      const finalWriters =
        d.writers && d.writers.length > 0 ? d.writers : m.writers || [];
      const finalStudios =
        d.studios && d.studios.length > 0 ? d.studios : m.studios || [];

      data.append('countries', JSON.stringify(finalCountries));
      data.append('genres', JSON.stringify(finalGenres));
      data.append('directors', JSON.stringify(finalDirectors));
      data.append('writers', JSON.stringify(finalWriters));
      data.append('studios', JSON.stringify(finalStudios));
      data.append('distributor', m.distributor || d.distributor || '');
      data.append('tags', JSON.stringify(m.tags || []));

      if (m.id) {
        data.append('view_id', String(m.id));
      }
      data.append('user_rating', String(m.user_rating ?? 0));
      data.append('month_seen', m.month_seen ? String(m.month_seen) : '');
      data.append('year_seen', m.year_seen ? String(m.year_seen) : '');
      data.append('audio_type', m.audio_type || '');
      data.append('platform', m.platform || '');
      data.append('review_notes', m.review_notes || '');

      const editRes = await axios.put(`${API_BASE_URL}/movies/edit/${movieDbId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (editRes.data.success) {
        setLinkedMap((prev) => ({
          ...prev,
          [movieDbId]: `${d.title} (${d.release_year || 'S/Ano'})`
        }));
        if (onImportComplete) onImportComplete();
      }
    } catch (err) {
      console.error('[Importer] Erro ao aceitar sugestão:', err);
      alert(err.response?.data?.error || err.message || 'Erro ao vincular filme.');
    } finally {
      setAcceptingId(null);
    }
  };

  if (!isOpen) return null;

  const progressPct =
    job && job.total > 0 ? Math.min(100, Math.round((job.processed / job.total) * 100)) : 0;

  const filteredItems = job
    ? job.items.filter((item) => {
        if (activeFilter === 'all') return true;
        return item.status === activeFilter;
      })
    : [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/25 p-2.5 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-100 tracking-tight leading-none">
                Importar Planilha de Filmes
              </h2>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Modo Incremental Seguro • Mantém todos os seus filmes atuais intactos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={job?.status === 'running'}
            title={job?.status === 'running' ? 'Aguarde ou cancele a importação antes de fechar' : 'Fechar'}
            className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 p-1.5 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {!job ? (
            <>
              {/* Área de Upload / Drag-and-Drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-amber-400 bg-amber-500/10'
                    : selectedFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-zinc-700/80 hover:border-amber-500/60 bg-zinc-950/40 hover:bg-zinc-950/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xlsm,.xls"
                  onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                  className="hidden"
                />

                <div
                  className={`p-3.5 rounded-2xl border ${
                    selectedFile
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-amber-400'
                  }`}
                >
                  {selectedFile ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-black text-emerald-400">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Clique para trocar de arquivo
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-black text-zinc-200">
                      Arraste sua planilha aqui ou clique para selecionar
                    </span>
                    <span className="text-xs text-zinc-500">
                      Suporta Excel (<strong className="text-zinc-300">.xlsx, .xlsm, .xls</strong>) e{' '}
                      <strong className="text-zinc-300">.csv</strong> (separado por ponto-e-vírgula ou vírgula)
                    </span>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Guia Rápido + Botão de Planilha Modelo */}
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/70 pb-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                      Como funciona a Importação Inteligente?
                    </span>
                  </div>

                  <a
                    href={`${API_BASE_URL}/movies/import-template`}
                    download
                    className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Planilha Modelo (.xlsx)
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-400 leading-relaxed">
                  <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      ✅ O que você preenche na planilha
                    </span>
                    <p>
                      Apenas <strong className="text-zinc-200">Nome Original</strong> (ou{' '}
                      <strong className="text-zinc-200">Tradução</strong>),{' '}
                      <strong className="text-zinc-200">Ano do filme</strong>,{' '}
                      <strong className="text-zinc-200">minha nota</strong>,{' '}
                      <strong className="text-zinc-200">Mês/ano visto</strong>,{' '}
                      <strong className="text-zinc-200">Áudio</strong>,{' '}
                      <strong className="text-zinc-200">Visto em</strong> e suas{' '}
                      <strong className="text-zinc-200">Tags</strong>! (Também aceita sua planilha antiga completa).
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      ⚡ O que a API puxa sozinha
                    </span>
                    <p>
                      Capa oficial HD, Sinopse em PT-BR, <strong className="text-zinc-200">Países em Português</strong>,
                      Gêneros, Diretores (incluindo codiretores), Roteiristas, Estúdios, Duração, Nota IMDb, Metacritic e Rotten!
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Barra de Progresso em Tempo Real */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {job.status === 'running' ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : job.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-100">
                      {job.status === 'running'
                        ? `Importando: ${job.currentTitle || '...'}`
                        : job.status === 'completed'
                          ? 'Importação Finalizada com Sucesso!'
                          : job.status === 'cancelled'
                            ? 'Importação Cancelada (Filmes já lidos foram mantidos)'
                            : `Erro: ${job.errorMessage || 'Falha inesperada'}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-amber-400">
                      {job.processed} / {job.total} ({progressPct}%)
                    </span>

                    {job.status === 'running' && (
                      <button
                        type="button"
                        onClick={handleCancelJob}
                        className="flex items-center gap-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        <StopCircle className="w-3.5 h-3.5" />
                        Parar
                      </button>
                    )}
                  </div>
                </div>

                {/* Trilha da Barra */}
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      job.status === 'completed'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : 'bg-gradient-to-r from-amber-500 to-amber-300'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Placar / Abas de Filtro Rápido */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('imported_api')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeFilter === 'imported_api'
                        ? 'bg-emerald-500/15 border-emerald-500/50'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Novos c/ API
                    </div>
                    <div className="text-lg font-black text-zinc-100 mt-0.5">
                      {job.counts.importedApi}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter('needs_review')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeFilter === 'needs_review'
                        ? 'bg-amber-500/15 border-amber-500/50'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Para Revisar
                    </div>
                    <div className="text-lg font-black text-zinc-100 mt-0.5">
                      {job.counts.needsReview}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter('skipped')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeFilter === 'skipped'
                        ? 'bg-cyan-500/15 border-cyan-500/50'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1">
                      <SkipForward className="w-3 h-3" /> Já Cadastrados
                    </div>
                    <div className="text-lg font-black text-zinc-100 mt-0.5">
                      {job.counts.skipped}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3" /> Ver Todos
                    </div>
                    <div className="text-lg font-black text-zinc-100 mt-0.5">
                      {job.items.length}
                    </div>
                  </button>
                </div>
              </div>

              {/* Lista de Resultados e Revisão em 1 Clique */}
              <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredItems.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
                    {job.status === 'running'
                      ? 'Processando linhas da planilha...'
                      : 'Nenhum filme nesta categoria.'}
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const movieDbId = item.movie?.movie_id || item.movieId;
                    const isAlreadyReviewed =
                      Boolean(movieDbId && linkedMap[movieDbId]) ||
                      Boolean(movieDbId && reviewedMovieIds.includes(movieDbId));

                    return (
                      <div
                        key={`${item.rowNumber}-${idx}`}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                          item.status === 'needs_review' && !isAlreadyReviewed
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : item.status === 'error'
                              ? 'bg-red-500/5 border-red-500/30'
                              : 'bg-zinc-950/50 border-zinc-800/70'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {item.suggestedApi?.poster_url && item.status === 'needs_review' && (
                            <img
                              src={item.suggestedApi.poster_url}
                              alt={item.suggestedApi.title}
                              className="w-10 h-14 object-cover rounded-lg border border-zinc-700 shrink-0"
                            />
                          )}

                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                Linha {item.rowNumber}
                              </span>
                              <span className="text-xs font-black text-zinc-100 truncate">
                                {item.inputTitle}
                                {item.inputYear ? ` (${item.inputYear})` : ''}
                              </span>

                              {isAlreadyReviewed ? (
                                <span className="text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Revisado!
                                </span>
                              ) : item.status === 'imported_api' ? (
                                <span className="text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                  API OK
                                </span>
                              ) : item.status === 'needs_review' ? (
                                <span className="text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                  Revisar
                                </span>
                              ) : item.status === 'skipped' ? (
                                <span className="text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded-full">
                                  Ignorado
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Erro
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-zinc-400">
                              {linkedMap[movieDbId]
                                ? `Vinculado com sucesso a "${linkedMap[movieDbId]}" mantendo sua nota e tags!`
                                : item.message}
                            </p>
                          </div>
                        </div>

                        {/* Botões de Ação em 1 Clique para itens que precisam de revisão */}
                        {item.status === 'needs_review' && item.movie && !isAlreadyReviewed && (
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {item.suggestedApi && (
                              <button
                                type="button"
                                disabled={acceptingId === movieDbId}
                                onClick={() => handleAcceptSuggestion(item)}
                                title={`Vincular automaticamente com "${item.suggestedApi.title}" (${item.suggestedApi.release_year || 'S/Ano'})`}
                                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                              >
                                {acceptingId === movieDbId ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Zap className="w-3.5 h-3.5" />
                                )}
                                <span>Aceitar Sugestão</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onReviewMovie && onReviewMovie(item.movie, item.inputTitle)}
                              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>Buscar na API</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between gap-3">
          {!job ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!selectedFile || uploading}
                onClick={handleStartImport}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/15 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enviando Planilha...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Iniciar Importação Incremental
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={job.status === 'running'}
                onClick={handleResetImporter}
                className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 disabled:opacity-40 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Importar Outra Planilha
              </button>

              <button
                type="button"
                disabled={job.status === 'running'}
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Concluir e Voltar ao Catálogo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
