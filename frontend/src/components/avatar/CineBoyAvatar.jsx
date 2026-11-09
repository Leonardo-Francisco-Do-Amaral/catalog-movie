import React, { useState, useEffect } from 'react';

/**
 * CineBoyAvatar - O Mascote Cinéfilo
 * Menininho Chibi Anime de pijama listrado, óculos, olhos azuis marcantes,
 * loirinho de cabelo comprido e descalço comendo pipoca no sofá verde!
 *
 * Suporta:
 * - Imagem oficial em alta resolução (estilo anime chibi) com remoção automática de fundo branco
 * - Efeitos visuais dinâmicos de TV, brilho na sala, tremor de tela no terror, estrelas de XP
 * - Balões de fala divertidos de cinema
 */

const DIALOGUES = {
  idle: [
    'Hmm... Nada supera pipoca com manteiga e filminho!',
    'Deixa eu ver o que a gente vai assistir hoje...',
    'Será que esse filme tem cena pós-créditos?!',
    'Passe a manteiga! Esse catálogo tá ficando gigante.',
    'Amo esse sofá... Melhor lugar da casa pra maratonar!',
  ],
  xp: [
    'BOAA!! SUBIMOS DE NÍVEL! MAIS XP PRO PERSONAGEM! ⚡',
    'Aí sim! O próximo troféu de platina é nosso! 🏆',
    'Level up! Eu sou o maior maratonista desse cinema!',
    'Olha a pontuação subindo! Vamos desbloquear mais classes!',
  ],
  superpower: [
    'EU SOU O VINGADOR DO CINEMA!... Opa, quase caí do sofá! 🦸‍♂️',
    'Com grandes filmes vêm grandes responsabilidades!',
    'Voo supersônico direto pro próximo clássico!',
    'Pulei alto demais... Mas o pouso heroico valeu a pena!',
  ],
  horror: [
    'Não desce na adega sozinho, seu tonto! Socorro... 👻',
    'Acho que ouvi um barulho na cozinha... Cadê a luz?!',
    'Tô espiando só com um olho... Dá muito medo!',
    'Ainda bem que a coberta me protege de qualquer demônio!',
  ],
  gore: [
    'Ki-ki-ki... Ma-ma-ma! Hoje tem sangue de groselha! 🪓',
    'Vigie seu acampamento... O Jason mirim está na área!',
    'Corta! Sangue falso pra todo lado, cinema puro!',
    'Essa máscara me dá +50 de resistência ao terror!',
  ],
};

// Map de imagens para cada estado (usa a imagem base como fallback)
const STATE_IMAGE_MAP = {
  idle: '/avatar/avatar-idle.jpg',
  xp: '/avatar/avatar-xp.png',
  superpower: '/avatar/avatar-superpower.png',
  horror: '/avatar/avatar-horror.png',
  gore: '/avatar/avatar-gore.png',
};

export default function CineBoyAvatar({
  state = 'idle',
  showSpeechBubble = true,
  customQuote = null,
  className = '',
  tvGlowIntensity = 1,
}) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [processedImgSrc, setProcessedImgSrc] = useState(null);

  // Troca de falas ao mudar de estado
  useEffect(() => {
    setCurrentQuoteIndex(0);
    setIsBubbleVisible(true);
  }, [state]);

  // Carrega e remove automaticamente o fundo branco externo via Canvas (preservando o branco do pijama e pipoca)
  useEffect(() => {
    const targetSrc = STATE_IMAGE_MAP[state] || STATE_IMAGE_MAP.idle;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = targetSrc;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessedImgSrc(targetSrc);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Flood Fill BFS a partir das 4 bordas para remover apenas o fundo branco externo
        const visited = new Uint8Array(w * h);
        const queue = [];

        // Adiciona bordas superior e inferior
        for (let x = 0; x < w; x++) {
          queue.push(x, 0);
          queue.push(x, h - 1);
        }
        // Adiciona bordas esquerda e direita
        for (let y = 0; y < h; y++) {
          queue.push(0, y);
          queue.push(w - 1, y);
        }

        let qHead = 0;
        while (qHead < queue.length) {
          const cx = queue[qHead++];
          const cy = queue[qHead++];
          const idx = cy * w + cx;
          if (visited[idx]) continue;
          visited[idx] = 1;

          const pIdx = idx * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];

          // Se for branco ou quase branco do fundo externo
          if (r > 238 && g > 238 && b > 238) {
            data[pIdx + 3] = 0; // Transparente!

            // Vizinhos 4-conectados
            if (cx + 1 < w && !visited[idx + 1]) queue.push(cx + 1, cy);
            if (cx - 1 >= 0 && !visited[idx - 1]) queue.push(cx - 1, cy);
            if (cy + 1 < h && !visited[idx + w]) queue.push(cx, cy + 1);
            if (cy - 1 >= 0 && !visited[idx - w]) queue.push(cx, cy - 1);
          } else if (r > 215 && g > 215 && b > 215) {
            // Suavização anti-aliasing das bordas externas
            data[pIdx + 3] = Math.round(data[pIdx + 3] * 0.35);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedImgSrc(canvas.toDataURL('image/png'));
      } catch {
        setProcessedImgSrc(targetSrc);
      }
    };

    img.onerror = () => {
      // Se não existir a imagem do estado específico (ex: avatar-xp.png), volta para a base idle
      if (targetSrc !== STATE_IMAGE_MAP.idle) {
        const fallback = new Image();
        fallback.src = STATE_IMAGE_MAP.idle;
        fallback.onload = () => setProcessedImgSrc(STATE_IMAGE_MAP.idle);
      }
    };
  }, [state]);

  const handleAvatarClick = () => {
    const list = DIALOGUES[state] || DIALOGUES.idle;
    setCurrentQuoteIndex((prev) => (prev + 1) % list.length);
    setIsBubbleVisible(true);
  };

  const activeQuote = customQuote || (DIALOGUES[state] || DIALOGUES.idle)[currentQuoteIndex];

  // Configuração das luzes da TV conforme o estado do filme
  const tvLightingConfigs = {
    idle: {
      ambientGlow: 'from-cyan-500/25 via-emerald-500/15 to-transparent',
      borderColor: 'border-cyan-500/30',
      badge: '🍿 Sessão Pipoca',
    },
    xp: {
      ambientGlow: 'from-amber-400/40 via-yellow-500/25 to-transparent',
      borderColor: 'border-amber-400/50',
      badge: '⭐ Level Up! (+XP)',
    },
    superpower: {
      ambientGlow: 'from-purple-500/40 via-cyan-500/30 to-transparent',
      borderColor: 'border-purple-400/50',
      badge: '🦸 Ação / Super-Herói',
    },
    horror: {
      ambientGlow: 'from-emerald-900/50 via-teal-950/40 to-transparent',
      borderColor: 'border-emerald-600/40',
      badge: '👻 Terror / Pânico',
    },
    gore: {
      ambientGlow: 'from-rose-900/50 via-red-950/50 to-transparent',
      borderColor: 'border-rose-500/50',
      badge: '🪓 Slasher / Gore',
    },
  };

  const currentTheme = tvLightingConfigs[state] || tvLightingConfigs.idle;

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center ${className}`}
      onClick={handleAvatarClick}
      title="Clique no menininho para ouvir o que ele tem a dizer!"
    >
      {/* 1. Balão de Fala Estilo Quadrinhos de Cinema */}
      {showSpeechBubble && (
        <div
          className={`absolute -top-16 md:-top-20 z-40 transition-all duration-300 transform ${
            isBubbleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="relative bg-zinc-900/95 border-2 border-amber-500/70 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md text-zinc-100 px-5 py-2.5 rounded-2xl max-w-xs md:max-w-md text-xs md:text-sm font-bold tracking-wide flex items-center gap-2.5">
            <span className="text-xl">
              {state === 'xp' ? '⭐' : state === 'horror' ? '👻' : state === 'superpower' ? '🦸' : state === 'gore' ? '🪓' : '🍿'}
            </span>
            <span className="leading-snug">{activeQuote}</span>
            {/* Pontinha do balão */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900/95 border-b-2 border-r-2 border-amber-500/70 transform rotate-45" />
          </div>
        </div>
      )}

      {/* 2. Feixe de Luz da Tela da TV na Sala Escura */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl transition-all duration-700"
        style={{ opacity: tvGlowIntensity }}
      >
        <div
          className={`absolute -bottom-16 left-1/2 -translate-x-1/2 w-[130%] h-[90%] bg-gradient-to-t ${currentTheme.ambientGlow} blur-3xl opacity-85 animate-pulse`}
          style={{ animationDuration: state === 'horror' ? '1.8s' : state === 'xp' ? '1.2s' : '3.8s' }}
        />
      </div>

      {/* 3. A Ilustração Real Chibi Anime no Sofá */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Camada de Animação CSS em volta da imagem real */}
        <div
          className={`relative transition-all duration-500 transform ${
            state === 'superpower'
              ? 'hover:scale-105 animate-bounce'
              : state === 'horror'
              ? 'animate-pulse'
              : state === 'xp'
              ? 'scale-105'
              : 'hover:scale-102'
          }`}
          style={{
            animationDuration: state === 'superpower' ? '2.5s' : state === 'horror' ? '0.3s' : '4s',
          }}
        >
          {processedImgSrc ? (
            <img
              src={processedImgSrc}
              alt="Mascote Cinéfilo no Sofá"
              className={`w-full max-w-[500px] h-auto object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)] filter ${
                state === 'horror'
                  ? 'brightness-90 contrast-110 hue-rotate-[160deg]'
                  : state === 'gore'
                  ? 'contrast-115 hue-rotate-[-30deg]'
                  : state === 'xp'
                  ? 'brightness-105 contrast-105'
                  : ''
              }`}
            />
          ) : (
            <img
              src="/avatar/avatar-idle.jpg"
              alt="Mascote Cinéfilo no Sofá"
              className="w-full max-w-[500px] h-auto object-contain rounded-2xl shadow-2xl"
            />
          )}

          {/* OVERLAY 1: Efeito de XP e Estrelinhas Flutuantes */}
          {state === 'xp' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="absolute top-2 left-6 text-3xl animate-ping">⭐</span>
              <span className="absolute top-8 right-8 text-2xl animate-bounce">✨</span>
              <span className="absolute -top-6 left-1/3 text-lg font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent animate-pulse">
                +100 XP! LEVEL UP!
              </span>
              <span className="absolute bottom-16 right-4 text-2xl animate-spin">🍿</span>
            </div>
          )}

          {/* OVERLAY 2: Efeito de Terror / Sustos */}
          {state === 'horror' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="absolute -top-4 right-10 text-3xl animate-bounce">👻</span>
              <div className="absolute inset-0 bg-emerald-950/20 mix-blend-overlay" />
            </div>
          )}

          {/* OVERLAY 3: Efeito de Slasher / Gore */}
          {state === 'gore' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="absolute top-4 left-6 text-3xl animate-pulse">🪓</span>
              <span className="absolute top-6 right-8 text-2xl">🩸</span>
              <div className="absolute inset-0 bg-red-950/20 mix-blend-color-burn" />
            </div>
          )}

          {/* OVERLAY 4: Efeito de Super Poder / Raios de Ação */}
          {state === 'superpower' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="absolute -top-6 right-1/4 text-3xl animate-bounce">⚡</span>
              <span className="absolute top-10 left-4 text-2xl animate-pulse">💥</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
