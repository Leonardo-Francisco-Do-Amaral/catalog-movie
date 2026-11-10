import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export function triggerApiRefreshToast(payload) {
  window.dispatchEvent(new CustomEvent('cine-api-refresh-toast', { detail: payload }));
}

function formatCompactVotes(num) {
  if (num === null || num === undefined || num === '' || Number(num) === 0) return 'N/A';
  const n = typeof num === 'string' ? parseInt(num.replace(/,/g, ''), 10) : Number(num);
  if (Number.isNaN(n) || n <= 0) return 'N/A';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function formatRating1Dec(val) {
  if (val === null || val === undefined || val === '') return 'N/A';
  const n = Number(val);
  return Number.isNaN(n) ? 'N/A' : n.toFixed(1);
}

function formatScoreInt(val, suffix = '') {
  if (val === null || val === undefined || val === '') return 'N/A';
  const n = Number(val);
  return Number.isNaN(n) ? 'N/A' : `${Math.round(n)}${suffix}`;
}

function renderSingleMovieComparison(c) {
  const imdbChanged = c.imdb_rating?.changed;
  const mcChanged = c.metacritic_score?.changed;
  const rtChanged = c.rotten_tomatoes_score?.changed;
  const votesChanged = c.vote_count?.changed;
  const oscarChanged = c.oscar_wins?.changed || c.oscar_nominations?.changed;

  const winsBefore = c.oscar_wins?.before ?? 0;
  const winsAfter = c.oscar_wins?.after ?? 0;
  const nomsBefore = c.oscar_nominations?.before ?? 0;
  const nomsAfter = c.oscar_nominations?.after ?? 0;

  return (
    <div className="flex flex-col gap-1 text-[11px] font-mono">
      <div className="flex items-center justify-between gap-2">
        <span className="text-zinc-400">• IMDb:</span>
        {imdbChanged ? (
          <span className="text-emerald-300 font-bold">
            {formatRating1Dec(c.imdb_rating.before)} <span className="text-amber-400">➔</span> {formatRating1Dec(c.imdb_rating.after)}
          </span>
        ) : (
          <span className="text-zinc-300">
            {formatRating1Dec(c.imdb_rating?.after)} <span className="text-zinc-500">(Sem alteração)</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-zinc-400">• Metacritic:</span>
        {mcChanged ? (
          <span className="text-emerald-300 font-bold">
            {formatScoreInt(c.metacritic_score.before)} <span className="text-amber-400">➔</span> {formatScoreInt(c.metacritic_score.after)}
          </span>
        ) : (
          <span className="text-zinc-300">
            {formatScoreInt(c.metacritic_score?.after)} <span className="text-zinc-500">(Sem alteração)</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-zinc-400">• Rotten Tomatoes:</span>
        {rtChanged ? (
          <span className="text-emerald-300 font-bold">
            {formatScoreInt(c.rotten_tomatoes_score.before, '%')} <span className="text-amber-400">➔</span> {formatScoreInt(c.rotten_tomatoes_score.after, '%')}
          </span>
        ) : (
          <span className="text-zinc-300">
            {formatScoreInt(c.rotten_tomatoes_score?.after, '%')} <span className="text-zinc-500">(Sem alteração)</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-zinc-400">• Votos:</span>
        {votesChanged ? (
          <span className="text-emerald-300 font-bold">
            {formatCompactVotes(c.vote_count.before)} <span className="text-amber-400">➔</span> {formatCompactVotes(c.vote_count.after)}
          </span>
        ) : (
          <span className="text-zinc-300">
            {formatCompactVotes(c.vote_count?.after)} <span className="text-zinc-500">(Sem alteração)</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-zinc-800/60 mt-0.5">
        <span className="text-zinc-400">• Oscar:</span>
        {oscarChanged ? (
          <span className="text-amber-300 font-bold text-right">
            {winsBefore}/{nomsBefore} <span className="text-amber-400">➔</span> {winsAfter} {winsAfter === 1 ? 'vitória' : 'vitórias'} / {nomsAfter} {nomsAfter === 1 ? 'indicação' : 'indicações'}
          </span>
        ) : (
          <span className="text-zinc-300 text-right">
            {winsAfter} {winsAfter === 1 ? 'vitória' : 'vitórias'} / {nomsAfter} {nomsAfter === 1 ? 'indicação' : 'indicações'} <span className="text-zinc-500">mantidas</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default function ApiRefreshToastContainer() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!e?.detail) return;
      const id = `api_ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const timeoutMs = e.detail.isBatch ? 28000 : 7200;
      setToasts((prev) => [{ id, data: e.detail, timeoutMs }, ...prev.slice(0, 1)]);
      setTimeout(() => dismiss(id), timeoutMs);
    };
    window.addEventListener('cine-api-refresh-toast', handler);
    return () => window.removeEventListener('cine-api-refresh-toast', handler);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] pointer-events-none flex flex-col gap-3 max-w-[460px] w-[calc(100vw-2.5rem)] sm:w-full"
    >
      {toasts.map(({ id, data, timeoutMs }) => {
        if (data.error) {
          return (
            <div
              key={id}
              className="pointer-events-auto relative overflow-hidden rounded-2xl bg-zinc-950/96 border border-rose-500/50 p-4 shadow-2xl backdrop-blur-xl animate-fadeIn"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-rose-300">
                      Erro ao Atualizar Dados da API
                    </p>
                    {data.title && (
                      <p className="text-[11px] font-bold text-zinc-200 mt-0.5">{data.title}</p>
                    )}
                    <p className="text-[11px] text-zinc-400 mt-1">{data.error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  className="text-zinc-500 hover:text-zinc-200 p-1 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        }

        // Modo Relatório em Lote do Catálogo Completo
        if (data.isBatch) {
          const updatedList = data.updatedMovies || [];
          const hasUpdates = updatedList.length > 0;

          return (
            <div
              key={id}
              style={{ animation: 'apiToastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl bg-zinc-950/98 border border-emerald-500/45 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            >
              <div className="flex items-start justify-between gap-2.5 border-b border-zinc-800/80 pb-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    {hasUpdates ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-emerald-300 tracking-tight">
                      ✅ Dados Atualizados com Sucesso!
                    </p>
                    <p className="text-[11px] font-semibold text-zinc-300 mt-0.5">
                      {data.processed} verificados •{' '}
                      <span className="text-emerald-400 font-bold">{data.updatedCount} atualizados</span> •{' '}
                      <span className="text-zinc-400">{data.unchangedCount} sem alteração</span>
                      {data.errorCount > 0 && (
                        <span className="text-rose-400"> • {data.errorCount} erro(s)</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0"
                  title="Fechar relatório"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {hasUpdates ? (
                <div className="mt-2.5 max-h-72 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-zinc-700">
                  {updatedList.map((item) => (
                    <div
                      key={item.movieId}
                      className="bg-zinc-900/75 border border-zinc-800/80 rounded-xl p-2.5 flex flex-col gap-1.5"
                    >
                      <p className="text-[11px] font-black text-amber-300 truncate">
                        🎬 {item.title}
                      </p>
                      {renderSingleMovieComparison(item.changes)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2.5 text-[11px] text-zinc-400 leading-relaxed">
                  Todos os filmes do catálogo já estão sincronizados com as notas externas, votos e Oscars mais recentes.
                </p>
              )}

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900">
                <div
                  className="h-full bg-emerald-400"
                  style={{ animation: `apiToastBar ${timeoutMs}ms linear forwards` }}
                />
              </div>
            </div>
          );
        }

        // Modo Filme Único (fallback)
        const c = data.changes || {};
        const anyChanged =
          c.imdb_rating?.changed ||
          c.metacritic_score?.changed ||
          c.rotten_tomatoes_score?.changed ||
          c.vote_count?.changed ||
          c.oscar_wins?.changed ||
          c.oscar_nominations?.changed;

        return (
          <div
            key={id}
            style={{ animation: 'apiToastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            className="pointer-events-auto relative overflow-hidden rounded-2xl bg-zinc-950/96 border border-emerald-500/45 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-2.5 border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  {anyChanged ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-emerald-300 tracking-tight">
                    ✅ {anyChanged ? 'Dados Atualizados com Sucesso!' : 'Dados Verificados na API!'}
                  </p>
                  <p className="text-[11px] font-bold text-zinc-200 truncate mt-0.5">
                    {data.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2.5">{renderSingleMovieComparison(c)}</div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900">
              <div
                className="h-full bg-emerald-400"
                style={{ animation: `apiToastBar ${timeoutMs}ms linear forwards` }}
              />
            </div>

            <style>{`
              @keyframes apiToastSlideIn {
                0% { opacity: 0; transform: translate3d(24px, -8px, 0) scale(0.96); }
                100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
              }
              @keyframes apiToastBar {
                0% { width: 100%; }
                100% { width: 0%; }
              }
            `}</style>
          </div>
        );
      })}

      <style>{`
        @keyframes apiToastSlideIn {
          0% { opacity: 0; transform: translate3d(24px, -8px, 0) scale(0.96); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes apiToastBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
