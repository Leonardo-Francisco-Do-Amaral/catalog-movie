import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies = [], onEdit }) {
  const rowRef = useRef(null);

  // Função para rolar o carrossel horizontalmente
  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      // Define a distância a rolar baseada no tamanho da tela
      const scrollAmount = direction === 'left' 
        ? -clientWidth * 0.75 
        : clientWidth * 0.75;
      
      rowRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="relative flex flex-col gap-3 py-4 group/row">
      {/* Título da Linha */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-zinc-100 uppercase tracking-widest bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          {movies.length} {movies.length === 1 ? 'filme' : 'filmes'}
        </span>
      </div>

      {/* Contêiner de Navegação */}
      <div className="relative w-full">
        {/* Botão Esquerdo */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-zinc-950/80 hover:bg-amber-500 hover:text-slate-950 text-zinc-300 w-11 h-11 rounded-full flex items-center justify-center border border-zinc-800 hover:border-amber-400 shadow-xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 transform -translate-x-3 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Linha de Filmes Horizontal */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth w-full px-2 py-2 select-none"
        >
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[210px]"
            >
              <MovieCard movie={movie} onEdit={onEdit} />
            </div>
          ))}
        </div>

        {/* Botão Direito */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-zinc-950/80 hover:bg-amber-500 hover:text-slate-950 text-zinc-300 w-11 h-11 rounded-full flex items-center justify-center border border-zinc-800 hover:border-amber-400 shadow-xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 transform translate-x-3 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
