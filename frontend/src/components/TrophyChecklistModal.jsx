import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, Lock, Search, Trophy, Calendar, Sparkles } from 'lucide-react';
import { TIER_THEMES } from './PS5TrophyToastContainer';
import { TrophyCardBadges, getCleanTrophyTitle } from './TrophyBadges';

export default function TrophyChecklistModal({ trophy, onClose }) {
  const [search, setSearch] = useState('');

  if (!trophy) return null;

  const tierKey = String(trophy.tier || 'bronze').toLowerCase();
  const theme = TIER_THEMES[tierKey] || TIER_THEMES.bronze;
  const isUnlocked = Boolean(trophy.is_unlocked);
  const cleanTitle = getCleanTrophyTitle(trophy.title);

  const formattedDate = useMemo(() => {
    if (!trophy.unlocked_at) return null;
    try {
      const d = new Date(trophy.unlocked_at);
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
  }, [trophy.unlocked_at]);

  const checklistItems = trophy.checklist || [];

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

  const conqueredCount = checklistItems.filter((i) => i.conquered).length;
  const totalItems = checklistItems.length;

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
              <span>{trophy.icon || theme.symbol}</span>
              {isUnlocked && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <TrophyCardBadges
                trophy={trophy}
                theme={theme}
                isUnlocked={isUnlocked}
                unlockedDateStr={formattedDate}
              />

              <h3 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight leading-snug">
                {cleanTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
                {trophy.description}
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
              Progresso no Banco de Dados
            </span>
            <span className="text-zinc-100 font-mono">
              {Math.min(trophy.progress_current, trophy.progress_target)} / {trophy.progress_target}{' '}
              <span className="text-zinc-500">
                ({Math.min(100, trophy.progress_percentage || 0)}%)
              </span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, trophy.progress_percentage || 0)}%`,
                backgroundColor: theme.accentColor,
                boxShadow: `0 0 12px ${theme.accentColor}80`,
              }}
            />
          </div>
        </div>

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
          {filteredItems.length === 0 ? (
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
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
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
