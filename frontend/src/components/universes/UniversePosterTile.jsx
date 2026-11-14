import React from 'react';
import { Film, Star, Plus, Lock, CheckCircle2 } from 'lucide-react';
import { resolvePosterUrl } from './universeThemeConfig';

export function UniversePosterTile({ movie, onAddMovie, size = 'md' }) {
  const posterSrc = resolvePosterUrl(movie.posterUrl);
  const dims =
    size === 'sm'
      ? 'w-20 sm:w-24'
      : size === 'lg'
      ? 'w-28 sm:w-32'
      : 'w-24 sm:w-28';

  const handleAction = () => {
    if (!movie.watched && onAddMovie) {
      onAddMovie(movie.title, movie.year);
    }
  };

  return (
    <div
      onClick={handleAction}
      title={
        movie.watched
          ? `${movie.matchedTitle || movie.title} (${movie.year}) — Assistido`
          : `Clique para cadastrar "${movie.title}" (${movie.year})`
      }
      className={`group relative ${dims} shrink-0 flex flex-col gap-1.5 ${
        !movie.watched && onAddMovie ? 'cursor-pointer' : ''
      }`}
    >
      <div
        className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden border transition-all duration-300 ${
          movie.watched
            ? 'border-emerald-400/65 shadow-[0_6px_22px_rgba(16,185,129,0.22)] group-hover:scale-[1.03]'
            : 'border-zinc-700/80 bg-zinc-900 group-hover:border-amber-400/80 group-hover:scale-[1.03]'
        }`}
      >
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={movie.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-300 ${
              movie.watched
                ? ''
                : 'grayscale brightness-[0.55] contrast-125 group-hover:grayscale-0 group-hover:brightness-90'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-zinc-900">
            <Film className="w-5 h-5 text-zinc-500 mb-1" />
            <span className="text-[9px] font-bold text-zinc-400 line-clamp-3">{movie.title}</span>
          </div>
        )}

        {/* Número da ordem */}
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 border border-white/15 text-[9px] font-mono font-black text-zinc-200">
          #{movie.order}
        </span>

        {/* Badge Visto / Pendente */}
        {movie.watched ? (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/80 border border-zinc-600 text-zinc-300 flex items-center justify-center">
            <Lock className="w-3 h-3" />
          </span>
        )}

        {/* Nota se assistido ou CTA hover para cadastrar */}
        {movie.watched && movie.userRating > 0 && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 border border-amber-400/50 text-[9px] font-mono font-black text-amber-300 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {Number(movie.userRating).toFixed(2)}
          </div>
        )}

        {!movie.watched && onAddMovie && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-1.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
              <Plus className="w-2.5 h-2.5 stroke-[3]" /> Cadastrar
            </span>
          </div>
        )}
      </div>

      <div className="px-0.5">
        <div
          className={`text-[10px] font-bold leading-tight line-clamp-2 ${
            movie.watched ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-amber-200'
          }`}
        >
          {movie.matchedTitle || movie.title}
        </div>
        <div className="text-[9px] font-mono text-zinc-500">{movie.year}</div>
      </div>
    </div>
  );
}
