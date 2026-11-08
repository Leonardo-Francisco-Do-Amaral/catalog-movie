import React from 'react';
import {
  X,
  Landmark,
  Crown,
  Star,
  Film,
  Compass,
  ChevronRight,
  Pin,
  Sparkles,
  History,
  Flag
} from 'lucide-react';

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

export default function HistoricalTerritoriesDrawer({
  isOpen,
  onClose,
  historicalCountries = [],
  onInspectHistorical
}) {
  if (!isOpen) return null;

  const extinctNations = historicalCountries.filter((h) => !h.isSpecialTerritory);
  const specialTerritories = historicalCountries.filter((h) => h.isSpecialTerritory);
  const conqueredExtinctCount = extinctNations.filter((h) => h.status === 'conquered').length;

  const renderTerritoryCard = (item) => {
    const isConquered = item.status === 'conquered' && Boolean(item.champion);
    const champ = item.champion;
    const flagCode = item.flagCode && item.flagCode !== 'su' ? item.flagCode.toLowerCase() : null;

    return (
      <div
        key={item.code}
        className={`rounded-2xl border p-4 transition-all flex flex-col gap-3.5 ${
          isConquered
            ? 'bg-gradient-to-br from-amber-950/25 via-zinc-900/80 to-zinc-950 border-amber-500/35 hover:border-amber-400/60 shadow-lg'
            : 'bg-zinc-900/35 border-zinc-800/80 hover:border-zinc-700'
        }`}
      >
        {/* Topo: Bandeira/Insígnia + Nome + Era + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {item.code === 'hist_su' ? (
              <div className="w-11 h-8 rounded-lg bg-red-950/90 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black text-xs shadow shrink-0">
                ☭
              </div>
            ) : flagCode ? (
              <img
                src={`https://flagcdn.com/w80/${flagCode}.png`}
                alt={item.name}
                className={`w-11 h-8 object-cover rounded-lg border shrink-0 ${
                  isConquered ? 'border-amber-500/40' : 'border-zinc-700 opacity-50 grayscale'
                }`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-11 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black uppercase tracking-wide text-zinc-100 truncate">
                  {item.name}
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-amber-400">
                  {item.era}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1">
            {isConquered ? (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35">
                Relíquia Ativa
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
                Sem Registro
              </span>
            )}
            <span className="text-[10px] text-zinc-500 font-bold">
              {item.totalCandidates || 0} {item.totalCandidates === 1 ? 'filme' : 'filmes'}
            </span>
          </div>
        </div>

        {/* Filme Campeão da Nação Histórica (se houver) */}
        {isConquered && champ ? (
          <div className="bg-zinc-950/85 border border-zinc-800/90 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {resolvePosterUrl(champ.poster_url) ? (
                <img
                  src={resolvePosterUrl(champ.poster_url)}
                  alt={champ.title}
                  className="w-12 h-16 object-cover rounded-lg border border-amber-500/40 shrink-0 shadow"
                />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                  <Film className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-black uppercase tracking-widest text-amber-400">
                  <Crown className="w-3 h-3" />
                  <span>Campeão Histórico</span>
                  {champ.originMode === 'manual' && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.2 rounded">
                      <Flag className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" /> Validado
                    </span>
                  )}
                  {item.selectionMode === 'manual' ? (
                    <span className="inline-flex items-center gap-0.5 text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded">
                      <Pin className="w-2.5 h-2.5" /> Manual
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                      <Sparkles className="w-2.5 h-2.5" /> Auto
                    </span>
                  )}
                </div>

                <div className="text-xs font-black text-zinc-100 truncate mt-0.5">
                  {champ.title}
                </div>

                <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {champ.release_year || 'S/Ano'}
                  {champ.directors?.length > 0 ? ` • ${champ.directors.join(', ')}` : ''}
                </div>

                <div className="inline-flex items-center gap-1 mt-1 bg-amber-500/15 border border-amber-500/35 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-black">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>Nota {Number(champ.user_rating || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {onInspectHistorical && (
              <button
                type="button"
                onClick={() => onInspectHistorical(item)}
                className="shrink-0 bg-zinc-900 hover:bg-amber-500 text-zinc-200 hover:text-slate-950 border border-zinc-700 hover:border-amber-400 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Curar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-zinc-950/50 border border-dashed border-zinc-800/80 rounded-xl px-3 py-2.5">
            <span className="text-[11px] text-zinc-500">
              Nenhum filme desta era catalogado ainda — ou atribua manualmente uma obra clássica.
            </span>
            {onInspectHistorical && (
              <button
                type="button"
                onClick={() => onInspectHistorical(item)}
                className="shrink-0 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Atribuir
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-all">
      {/* Clique no backdrop fecha */}
      <div className="flex-1" onClick={onClose} />

      <aside className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-[0_0_70px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Header Tático */}
        <div className="px-6 py-5 border-b border-zinc-800/90 bg-gradient-to-r from-amber-950/30 via-zinc-900/60 to-zinc-950 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black uppercase tracking-wider text-zinc-100">
                  Territórios Perdidos & Históricos
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35">
                  {conqueredExtinctCount} / {extinctNations.length} Relíquias
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Impérios, federações e estados dissolvidos cujas obras-primas fazem parte da história
                do cinema mundial, preservados fora da contagem oficial dos 195 países atuais da ONU
                para não distorcer o mapa-múndi moderno.
              </p>
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

        {/* Lista Rolável */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Seção 1: Nações Extintas / Históricas */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                Nações Extintas do Século XX ({extinctNations.length})
              </h3>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                Fora da meta de 195 da ONU
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {extinctNations.map((item) => renderTerritoryCard(item))}
            </div>
          </div>

          {/* Seção 2: Territórios Autônomos / Polos Cinematográficos fora dos 195 assentos */}
          {specialTerritories.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  Territórios Especiais / Fora dos 195 Assentos da ONU ({specialTerritories.length})
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed -mt-1">
                O IMDb e o TMDB creditam polos autônomos de cinema (como Hong Kong, Taiwan ou Porto
                Rico) separadamente dos 195 estados-membros/observadores da ONU. Eles ficam
                arquivados aqui com seu próprio Filme Campeão!
              </p>

              <div className="grid grid-cols-1 gap-3">
                {specialTerritories.map((item) => renderTerritoryCard(item))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
