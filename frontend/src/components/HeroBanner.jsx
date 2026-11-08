import React from 'react';
import { Star, Play, Info, Calendar } from 'lucide-react';

export default function HeroBanner({ movie }) {
  if (!movie) {
    return (
      <div className="h-[480px] bg-zinc-950 flex items-center justify-center border-b border-zinc-800/80 rounded-2xl overflow-hidden animate-pulse">
        <span className="text-zinc-600 text-sm font-semibold tracking-wider uppercase">Carregando banner em destaque...</span>
      </div>
    );
  }

  const {
    title,
    original_title,
    release_year,
    synopsis,
    poster_url,
    countries = [],
    user_rating,
    tags = []
  } = movie;

  // Formatar notas
  const formattedRating = user_rating ? Number(user_rating).toFixed(3) : 'N/A';

  // Obter imagem de background (fallback se não houver poster)
  const bannerImage = poster_url
    ? (poster_url.startsWith('/') ? `http://localhost:5000${poster_url}` : poster_url)
    : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80';

  // Helper para renderizar a bandeira de forma limpa a partir do nome em português
  const renderFlag = (countryName) => {
    if (!countryName) return null;
    const cleanName = countryName.trim().toLowerCase();
    
    // Mapeamento simples de nomes comuns para ISO de 2 dígitos do FlagCDN
    const COUNTRY_TO_ISO = {
      'estados unidos': 'us',
      'brasil': 'br',
      'reino unido': 'gb',
      'frança': 'fr',
      'japão': 'jp',
      'coreia do sul': 'kr',
      'alemanha': 'de',
      'alemanha ocidental': 'de',
      'itália': 'it',
      'espanha': 'es',
      'suécia': 'se',
      'dinamarca': 'dk',
      'irlanda': 'ie',
      'canadá': 'ca',
      'líbano': 'lb',
      'chipre': 'cy',
      'catar': 'qa',
      'argentina': 'ar',
      'holanda': 'nl',
      'polônia': 'pl',
      'islândia': 'is',
      'noruega': 'no',
      'áfrica do sul': 'za',
      'nova zelândia': 'nz',
      'rússia': 'ru',
      'méxico': 'mx',
      'colômbia': 'co',
      'chile': 'cl',
      'índia': 'in',
      'china': 'cn',
      'hong kong': 'hk',
      'taiwan': 'tw',
      'tailândia': 'th',
    };

    const isoCode = COUNTRY_TO_ISO[cleanName];

    if (isoCode) {
      return (
        <img
          src={`https://flagcdn.com/w40/${isoCode}.png`}
          alt={`País: ${countryName}`}
          className="w-6 h-4 object-cover rounded shadow-sm border border-zinc-700/50"
          title={`Origem: ${countryName}`}
        />
      );
    }

    // Fallback se não for uma sigla de 2 letras
    return (
      <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold border border-zinc-700/50 tracking-wider">
        {countryName.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="relative h-[500px] w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      
      {/* Imagem de Fundo Estilizada (Capa Expandida) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 filter blur-[1px] transition-all duration-700"
        style={{ backgroundImage: `url(${bannerImage})` }}
      />

      {/* Gradiente Radial e Linear Imersivo para Fundo Escuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />

      {/* Conteúdo Principal do Banner */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-end justify-between z-10">
        
        {/* Lado Esquerdo - Detalhes do Filme */}
        <div className="flex-1 flex flex-col gap-4 text-left max-w-2xl">
          {/* Tag de Destaque */}
          <div className="inline-flex self-start bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
            Último Filme Assistido
          </div>

          {/* Título Principal */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-100 tracking-tight leading-none drop-shadow-md">
              {title}
            </h2>
            {original_title && original_title !== title && (
              <span className="text-sm font-semibold text-zinc-400 italic">
                Título original: {original_title}
              </span>
            )}
          </div>

          {/* Metadados: Ano, Origem, Nota */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-300">
            {/* Ano */}
            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800/80">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{release_year || 'Ano N/A'}</span>
            </div>

            {/* Bandeiras / Países */}
            {countries && countries.length > 0 && (
              <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800/80 flex-wrap max-w-xs">
                {countries.map((country) => (
                  <React.Fragment key={country}>
                    {renderFlag(country)}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Nota Pessoal */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-black text-sm tracking-wide">{formattedRating}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400/80 ml-0.5">Nota</span>
            </div>
          </div>

          {/* Sinopse resumida */}
          <p className="text-zinc-400 text-sm leading-relaxed drop-shadow line-clamp-3 md:line-clamp-4 max-w-xl font-medium">
            {synopsis || 'Sem sinopse disponível nas APIs externas. Este filme faz parte do registro histórico de migração do catálogo pessoal.'}
          </p>

          {/* Etiquetas das Tags Customizadas */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-extrabold px-3 py-1 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito - Botões de Ação (Apenas Visual/Estilizado) */}
        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Play className="w-4 h-4 fill-slate-950" />
            Assistir Trailer
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-100 border border-zinc-800 hover:border-zinc-700 font-bold px-6 py-3 rounded-xl transition-all duration-300 text-sm">
            <Info className="w-4 h-4" />
            Mais Info
          </button>
        </div>

      </div>
    </div>
  );
}
