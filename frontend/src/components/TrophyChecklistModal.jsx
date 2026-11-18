import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle2, Lock, Search, Loader2 } from 'lucide-react';
import { TIER_THEMES } from './PS5TrophyToastContainer';
import { TrophyCardBadges, getCleanTrophyTitle } from './TrophyBadges';
import { API_BASE_URL } from '../utils/apiConfig';

export default function TrophyChecklistModal({ trophy, onClose }) {
  const [search, setSearch] = useState('');
  const [loadedTrophy, setLoadedTrophy] = useState(null);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  useEffect(() => {
    let active = true;
    setSearch('');
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

  if (!activeTrophy) return null;

  const visualTierKey =
    activeTrophy.kind === 'rank'
      ? String(activeTrophy.highest_unlocked_tier || activeTrophy.ranks?.[0]?.tier || 'bronze').toLowerCase()
      : String(activeTrophy.tier || 'bronze').toLowerCase();
  const theme = TIER_THEMES[visualTierKey] || TIER_THEMES.bronze;
  const isUnlocked = Boolean(activeTrophy.is_unlocked);
  const cleanTitle = getCleanTrophyTitle(activeTrophy.title);
  const conqueredCount = checklistItems.filter((i) => i.conquered).length;
  const totalItems = checklistItems.length;
  const ranksList = activeTrophy.kind === 'rank' && Array.isArray(activeTrophy.ranks) ? activeTrophy.ranks : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] bg-zinc-950/95 border ${theme.border} rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-5 overflow-hidden ${theme.glow}`}
      >
        {/* Glow de fundo */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: theme.accentColor }}
        />

        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Ícone Estilo PS5 */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-gradient-to-br ${theme.iconBg} border ${theme.border} flex items-center justify-center text-3xl sm:text-4xl shadow-inner relative`}
            >
              <span>{activeTrophy.icon || theme.symbol}</span>
              {isUnlocked && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
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

              <h3 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight leading-snug">
                {cleanTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
                {activeTrophy.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso Real */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-2 relative z-10">
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

        {/* Trilha de 5 Ranks (para troféus evolutivos) */}
        {ranksList.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-400">
              <span>Trilha de Ranks ({activeTrophy.unlocked_ranks_count || 0}/{ranksList.length})</span>
              <span className="text-amber-400">Teto: {activeTrophy.target_value}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {ranksList.map((rk) => {
                const rkTheme = TIER_THEMES[String(rk.tier || 'bronze').toLowerCase()] || TIER_THEMES.bronze;
                const rkDone = Boolean(rk.is_unlocked);
                return (
                  <div
                    key={rk.id}
                    className={`rounded-xl p-2 border flex flex-col gap-1 transition-all ${
                      rkDone
                        ? `bg-zinc-950/90 ${rkTheme.border} ${rkTheme.glow}`
                        : 'bg-zinc-950/50 border-zinc-800/70 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-black">
                      <span>{rkTheme.symbol} {rkTheme.name}</span>
                      <span className="font-mono text-zinc-300">
                        {rk.progress_current}/{rk.progress_target}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-200 leading-tight line-clamp-2" title={rk.title}>
                      {getCleanTrophyTitle(rk.title)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Busca Interna se houver muitos itens */}
        {totalItems > 8 && (
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

        {/* Lista de Itens do Checklist */}
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

                    {/* Bandeira se houver */}
                    {flagUrl && (
                      <img
                        src={flagUrl}
                        alt={item.name}
                        className="w-6 h-4 object-cover rounded shadow-sm border border-zinc-800 shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}

                    {/* Detalhes do Item */}
                    <div className="min-w-0 flex flex-col">
                      <span className={`text-xs font-bold truncate ${isConq ? 'text-zinc-100' : 'text-zinc-300'}`}>
                        {item.name}
                      </span>

                      {item.movie_title && (
                        <span className="text-[11px] text-emerald-400/90 font-medium truncate flex items-center gap-1.5 mt-0.5">
                          🎬 {item.movie_title}
                          {item.movie_year ? ` (${item.movie_year})` : ''}
                        </span>
                      )}

                      {item.extra_info && (
                        <span className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                          {item.extra_info}
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
