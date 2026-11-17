import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Music,
  Star,
  Award,
  Clock,
  Check,
  Tv,
} from 'lucide-react';
import {
  TV_KIND_META,
  TV_SEASON_TYPE_META,
  TV_STATUS_META,
  formatMonthYearPt,
  resolveTvPosterUrl,
} from '../utils/tvApi';

export default function ShowCard({
  show,
  gridCols = 4,
  onEdit,
  onDelete,
  onIncrementSeason,
  onOpenAppendSeason,
}) {
  const [seasonsOpen, setSeasonsOpen] = useState(false);
  const [busySeasonId, setBusySeasonId] = useState(null);

  const kindMeta = TV_KIND_META[show.kind] || TV_KIND_META.anime;
  const statusMeta = TV_STATUS_META[show.watch_status] || TV_STATUS_META.watching;
  const posterSrc = resolveTvPosterUrl(show.poster_url);
  const demographics = (show.genres || []).filter((g) => g.group_type === 'demographic');
  const genres = (show.genres || []).filter((g) => g.group_type === 'genre');
  const seenLabel = formatMonthYearPt(show.month_seen, show.year_seen);

  const totalEps = show.totalEpisodes;
  const watchedEps = show.watchedEpisodes || 0;
  const overallPct =
    totalEps && totalEps > 0 ? Math.min(100, Math.round((watchedEps / totalEps) * 100)) : 0;

  const currentSeason =
    show.stoppedAt && Array.isArray(show.seasons)
      ? show.seasons.find((s) => s.id === show.stoppedAt.seasonId) || show.seasons[0]
      : show.seasons?.[0];

  const canQuickAdvanceCurrent =
    currentSeason &&
    (currentSeason.episodes_total === null ||
      currentSeason.episodes_watched < currentSeason.episodes_total);

  const isCompact = gridCols >= 6;

  const handleStep = async (seasonId, payload) => {
    setBusySeasonId(seasonId);
    try {
      await onIncrementSeason(seasonId, payload);
    } finally {
      setBusySeasonId(null);
    }
  };

  return (
    <article className="group bg-zinc-900/65 border border-zinc-800/90 hover:border-pink-500/45 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 tv-sakura-card-glow">
      {/* Pôster e Overlays */}
      <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={show.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-600 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 text-center">
            <Tv className="w-10 h-10 text-pink-500/40" />
            <span className="text-xs font-bold text-zinc-400 line-clamp-2">{show.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

        {/* Topo esquerdo: Tipo + Demografia */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${kindMeta.badgeClass}`}
          >
            {kindMeta.icon} {kindMeta.label}
          </span>
          {demographics.slice(0, 1).map((d) => (
            <span
              key={d.id}
              className="px-2 py-0.5 rounded-md border border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-200 text-[10px] font-black uppercase tracking-wider backdrop-blur-md"
            >
              {d.name}
            </span>
          ))}
        </div>

        {/* Topo direito: Botões Editar / Excluir (visíveis direto em telas touch) */}
        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(show)}
            title="Editar obra"
            className="p-1.5 rounded-lg bg-zinc-950/85 hover:bg-pink-500 text-zinc-200 hover:text-white border border-zinc-700/80 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(show)}
            title="Excluir obra"
            className="p-1.5 rounded-lg bg-zinc-950/85 hover:bg-rose-600 text-zinc-200 hover:text-white border border-zinc-700/80 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Rodapé do poster: Status + Notas */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${statusMeta.badgeClass}`}
          >
            {statusMeta.icon} {statusMeta.label}
          </span>

          <div className="flex items-center gap-1.5">
            {show.user_rating !== null && show.user_rating !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950/90 border border-pink-400/50 text-pink-200 text-xs font-black backdrop-blur-md">
                <Star className="w-3 h-3 fill-pink-400 text-pink-400" />
                {Number(show.user_rating).toFixed(2).replace(/\.?0+$/, '')}
              </span>
            )}
            {show.external_score !== null && show.external_score !== undefined && (
              <span
                title={`Nota ${kindMeta.scoreLabel}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-950/85 border border-zinc-700 text-zinc-300 text-[10px] font-bold backdrop-blur-md"
              >
                {kindMeta.scoreLabel} {Number(show.external_score).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="p-3.5 flex-1 flex flex-col gap-2.5">
        <div>
          <h3 className="font-black text-sm text-zinc-100 leading-snug line-clamp-2" title={show.title}>
            {show.title}
          </h3>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-zinc-400 mt-0.5">
            {show.start_year && <span>{show.start_year}</span>}
            {show.seasons?.length > 0 && (
              <span>
                · {show.seasons.length} {show.seasons.length === 1 ? 'temporada' : 'temporadas'}
              </span>
            )}
            {show.totalHoursWatched > 0 && (
              <span className="inline-flex items-center gap-1 text-purple-300 font-semibold">
                · <Clock className="w-3 h-3" /> {show.totalHoursWatched}h
              </span>
            )}
          </div>
        </div>

        {/* Progresso Geral + Parou em */}
        <div className="bg-zinc-950/75 border border-zinc-800/90 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-zinc-300">
              {watchedEps} / {totalEps ?? '?'} eps
            </span>
            {totalEps ? (
              <span className="font-black text-pink-400">{overallPct}%</span>
            ) : null}
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          {show.stoppedAt && (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[10px] text-zinc-400 truncate" title={show.stoppedAt.label}>
                {show.watch_status === 'completed' ? 'Última: ' : 'Parou em: '}
                <strong className="text-zinc-200">
                  T{show.stoppedAt.seasonNumber} ({show.stoppedAt.episodesWatched}/{show.stoppedAt.episodesTotal ?? '?'})
                </strong>
              </span>

              {canQuickAdvanceCurrent && (
                <button
                  type="button"
                  disabled={busySeasonId === currentSeason.id}
                  onClick={() => handleStep(currentSeason.id, { delta: 1 })}
                  className="px-2 py-0.5 rounded-md bg-pink-500/20 hover:bg-pink-500 border border-pink-500/45 text-pink-200 hover:text-white text-[10px] font-black transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  title={`Avançar +1 episódio em ${currentSeason.label}`}
                >
                  +1 Ep
                </button>
              )}
            </div>
          )}
        </div>

        {/* Música e Melhor Temporada */}
        {!isCompact && (show.music_rating !== null || show.best_song_title || show.bestSeasonLabel) && (
          <div className="space-y-1 text-[11px]">
            {(show.music_rating !== null || show.best_song_title) && (
              <div className="flex items-center gap-1.5 text-fuchsia-300/95 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg px-2 py-1">
                <Music className="w-3 h-3 shrink-0 text-fuchsia-400" />
                <span className="truncate flex-1" title={show.best_song_title || 'Nota de música'}>
                  {show.best_song_title || 'Trilha Sonora'}
                </span>
                {show.music_rating !== null && (
                  <span className="font-black text-fuchsia-200 shrink-0">
                    {Number(show.music_rating).toFixed(1)}
                  </span>
                )}
              </div>
            )}
            {show.bestSeasonLabel && (
              <div className="flex items-center gap-1.5 text-amber-300/90 text-[10px] font-bold px-1">
                <Award className="w-3 h-3 shrink-0 text-amber-400" />
                <span className="truncate">Melhor Temp: {show.bestSeasonLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* Estúdio / Autor / Gêneros */}
        {!isCompact && (
          <div className="text-[10px] text-zinc-400 space-y-1">
            {show.studios?.length > 0 && (
              <div className="truncate">
                <span className="text-zinc-500">Estúdio:</span>{' '}
                <span className="text-zinc-200 font-semibold">
                  {show.studios.map((s) => s.name).join(', ')}
                </span>
              </div>
            )}
            {(show.creators?.length > 0 || show.directors?.length > 0) && (
              <div className="truncate">
                {show.creators?.length > 0 && (
                  <span>
                    <span className="text-zinc-500">Autor:</span>{' '}
                    <span className="text-zinc-300">{show.creators[0]}</span>
                  </span>
                )}
                {show.creators?.length > 0 && show.directors?.length > 0 && ' · '}
                {show.directors?.length > 0 && (
                  <span>
                    <span className="text-zinc-500">Dir:</span>{' '}
                    <span className="text-zinc-300">{show.directors[0]}</span>
                  </span>
                )}
              </div>
            )}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {genres.slice(0, 3).map((g) => (
                  <span
                    key={g.id}
                    className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[9px] font-semibold"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Temporadas expansíveis + Botão +Temporada */}
        <div className="mt-auto pt-2 border-t border-zinc-800/70 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSeasonsOpen((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-pink-300 hover:text-pink-200 cursor-pointer"
            >
              {seasonsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>Temporadas ({show.seasons?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAppendSeason(show)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/35 text-purple-200 text-[10px] font-black uppercase cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Temporada</span>
            </button>
          </div>

          {seasonsOpen && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto tv-sakura-scroll pr-0.5">
              {(show.seasons || []).map((s) => {
                const typeMeta = TV_SEASON_TYPE_META[s.season_type] || TV_SEASON_TYPE_META.tv;
                const sSeen = formatMonthYearPt(s.month_seen, s.year_seen);
                const isDone = s.episodes_total !== null && s.episodes_watched >= s.episodes_total;
                const isBusy = busySeasonId === s.id;

                return (
                  <div
                    key={s.id}
                    className="bg-zinc-950/90 border border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-zinc-200 truncate" title={s.label}>
                        T{s.season_number}: {s.label}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded border text-[9px] font-black shrink-0 ${typeMeta.badge}`}>
                        {typeMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className={isDone ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                        {s.episodes_watched} / {s.episodes_total ?? '?'} eps
                        {sSeen && <span className="text-purple-300 ml-1">({sSeen})</span>}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isBusy || s.episodes_watched <= 0}
                          onClick={() => handleStep(s.id, { delta: -1 })}
                          className="p-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-35 cursor-pointer"
                          title="-1 ep"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isBusy || isDone}
                          onClick={() => handleStep(s.id, { delta: 1 })}
                          className="p-0.5 rounded bg-pink-500/25 hover:bg-pink-500 text-pink-200 hover:text-white disabled:opacity-35 cursor-pointer"
                          title="+1 ep"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        {s.episodes_total && !isDone && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleStep(s.id, { episodes_watched: s.episodes_total })}
                            className="p-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white cursor-pointer"
                            title="Completar temporada"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rodapé visto em */}
          {seenLabel && (
            <div className="flex items-center justify-end text-[10px] text-zinc-500 pt-0.5">
              <span>Visto: {seenLabel}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
