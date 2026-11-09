import React, { useState } from 'react';
import {
  Film,
  Tv,
  ArrowLeft,
  Sliders,
  Info,
} from 'lucide-react';
import CineBoyAvatar from '../components/avatar/CineBoyAvatar';

export default function AvatarLabPage({
  onBack = () => {},
}) {
  const [avatarState, setAvatarState] = useState('idle');
  const [tvGlow, setTvGlow] = useState(1);
  const [selectedSimMovie, setSelectedSimMovie] = useState(null);

  // Botões de Simulação Rápida de Gênero de Filme
  const SIMULATION_PRESETS = [
    {
      id: 'idle',
      label: '🍿 Normal / Comendo Pipoca',
      state: 'idle',
      tag: 'Qualquer Filme',
      desc: 'Mastigando pipoca quentinha, relaxado no sofá, piscando os olhos azuis e assistindo TV.',
      theme: 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-amber-500/50',
      activeTheme: 'border-amber-500 bg-amber-500/15 text-amber-300 ring-2 ring-amber-500/30',
      movieExample: 'De Volta Para o Futuro (1985)',
    },
    {
      id: 'xp',
      label: '⭐ Comemoração de XP / Level Up',
      state: 'xp',
      tag: '+XP Catálogo',
      desc: 'Levanta o controle como um troféu, joga pipocas pro alto, estrelinhas de XP brilhando e sorrisão!',
      theme: 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-yellow-500/50',
      activeTheme: 'border-yellow-400 bg-yellow-400/15 text-yellow-300 ring-2 ring-yellow-400/40',
      movieExample: 'Filme Novo Cadastrado (+45 XP)',
    },
    {
      id: 'superpower',
      label: '🦸 Pulo no Sofá (Super Poder)',
      state: 'superpower',
      tag: 'Heróis / Marvel / DC',
      desc: 'Pula em pé no sofá com capa de herói, faz pose triunfante, perde o equilíbrio e cai de bumbum rindo!',
      theme: 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-purple-500/50',
      activeTheme: 'border-purple-500 bg-purple-500/15 text-purple-300 ring-2 ring-purple-500/40',
      movieExample: 'Vingadores: Era de Ultron (2015)',
    },
    {
      id: 'horror',
      label: '👻 Coberta de Medo (Terror)',
      state: 'horror',
      tag: 'Terror / Sobrenatural',
      desc: 'Puxa a coberta até o nariz, se encolhe no sofá tremendo de susto com os olhinhos azuis arregalados.',
      theme: 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-emerald-500/50',
      activeTheme: 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-2 ring-emerald-500/40',
      movieExample: 'Invocação do Mal (2013) / Sobrenatural',
    },
    {
      id: 'gore',
      label: '🪓 Máscara do Jason (Gore / Slasher)',
      state: 'gore',
      tag: 'Gore / Slasher',
      desc: 'Puxa a máscara do Jason Voorhees de trás da almofada, coloca no rosto e empunha o controle remoto!',
      theme: 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-rose-500/50',
      activeTheme: 'border-rose-500 bg-rose-500/15 text-rose-300 ring-2 ring-rose-500/40',
      movieExample: 'Sexta-Feira 13 / Jogos Mortais',
    },
  ];

  const handleSelectPreset = (preset) => {
    setAvatarState(preset.state);
    setSelectedSimMovie(preset.movieExample);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto px-2 md:px-4 animate-fadeIn">
      {/* 1. Header do Laboratório */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            Voltar ao Catálogo
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍿</span>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                Laboratório do Mascote Cinéfilo
              </h1>
              <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Fase de Testes
              </span>
            </div>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              Protótipo interativo do garotinho cinéfilo assistindo TV no sofá, com cabelo loirinho, óculos vermelho, olhos azuis marcantes e pés descalços.
            </p>
          </div>
        </div>

        {/* Status do Jogador Vinculado */}
        <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-2xl">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Estado Ativo</span>
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              {avatarState.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Palco Principal: O Avatar no Cinema em Casa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Janela da Sala de Cinema com o Mascote */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center min-h-[480px]">
            {/* Vinheta decorativa de sala escura */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[11px] font-mono text-zinc-500 ml-2">Sessão Pipoca #1</span>
            </div>

            {selectedSimMovie && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/80 px-3 py-1 rounded-full text-[11px] text-zinc-400">
                <Film className="w-3 h-3 text-amber-500" />
                <span>Simulando: <strong className="text-zinc-200">{selectedSimMovie}</strong></span>
              </div>
            )}

            {/* O Componente do Avatar */}
            <div className="w-full max-w-[540px] pt-10 pb-4">
              <CineBoyAvatar
                state={avatarState}
                tvGlowIntensity={tvGlow}
                showSpeechBubble={true}
              />
            </div>

            {/* Rodapé da Sala: Dica Interativa */}
            <div className="w-full border-t border-zinc-800/50 pt-3 mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                💡 <em>Clique no menininho para ouvir outra fala ou testar o balão!</em>
              </span>
              <span className="hidden sm:inline font-mono text-[11px] text-amber-500/80">
                Resolução: Vetorial SVG
              </span>
            </div>
          </div>

          {/* Ajuste de Intensidade de Luz da TV */}
          <div className="w-full mt-4 flex items-center justify-between bg-zinc-900/60 border border-zinc-800/60 px-5 py-3 rounded-2xl text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-zinc-300">Brilho da Luz da TV na Sala:</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTvGlow(0.4)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  tvGlow === 0.4 ? 'bg-cyan-500 text-slate-950' : 'bg-zinc-800 hover:text-white'
                }`}
              >
                Penumbra
              </button>
              <button
                type="button"
                onClick={() => setTvGlow(1.0)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  tvGlow === 1.0 ? 'bg-cyan-500 text-slate-950' : 'bg-zinc-800 hover:text-white'
                }`}
              >
                Padrão
              </button>
              <button
                type="button"
                onClick={() => setTvGlow(1.5)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  tvGlow === 1.5 ? 'bg-cyan-500 text-slate-950' : 'bg-zinc-800 hover:text-white'
                }`}
              >
                Vibrante
              </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Seletor das Animações & Detalhes do Mascote */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Sliders className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-black text-white tracking-wide uppercase">
                Animações para Testar
              </h2>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Clique em qualquer botão abaixo para mudar a reação do menininho em tempo real e ver a iluminação da sala, pose e acessórios:
            </p>

            <div className="flex flex-col gap-3">
              {SIMULATION_PRESETS.map((preset) => {
                const isActive = avatarState === preset.state;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                      isActive ? preset.activeTheme : preset.theme
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm tracking-wide flex items-center gap-2">
                        {preset.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-950/70 border border-zinc-800 text-zinc-400">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-snug">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ficha Visual do Mascote */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-3 text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500" />
              Características do Design
            </h3>
            <ul className="space-y-1.5 text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✔</span>
                <span><strong>Idade:</strong> Cerca de 8 a 10 anos, bochechas coradas.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✔</span>
                <span><strong>Cabelo:</strong> Loiro comprido, mechas onduladas sobre as orelhas e testa.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✔</span>
                <span><strong>Óculos:</strong> Armação grossa em vermelho marcante com reflexos da TV.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✔</span>
                <span><strong>Olhos:</strong> Azuis safira expressivos com brilho duplo.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✔</span>
                <span><strong>Pés:</strong> Descalço com dedinhos à mostra no sofá e no tapete.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✔</span>
                <span><strong>Acessórios:</strong> Pijama azul marinho com luas, balde retrô de pipoca e controle remoto.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
