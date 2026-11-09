import React, { useState, useEffect } from 'react';

/**
 * CineBoyAvatar - O Mascote Cinéfilo
 * Menininho de 8-10 anos, loirinho de cabelo comprido, óculos vermelho,
 * olhos azuis marcantes, pijama quentinho e descalço no sofá com pipoca e controle.
 *
 * Estados de Animação:
 * - 'idle': Comendo pipoca tranquilinho, luz de cinema na TV, piscando e mastigando.
 * - 'xp': Comemorando XP / Level Up! Levanta o controle, pipocas voando, estrelas e sorrisão.
 * - 'superpower': Fica em pé no sofá com capa de herói, faz pose de voo, tropeça e cai de bunda rindo!
 * - 'horror': Puxa a coberta até o nariz, encolhido no canto, tremendo de medo com olhos arregalados.
 * - 'gore': Puxa a máscara do Jason (Sexta-Feira 13), coloca no rosto e vira mini-assassino slasher!
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

export default function CineBoyAvatar({
  state = 'idle',
  showSpeechBubble = true,
  customQuote = null,
  className = '',
  tvGlowIntensity = 1,
}) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [isChewing, setIsChewing] = useState(true);

  // Troca de falas ao mudar de estado ou ao clicar no personagem
  useEffect(() => {
    setCurrentQuoteIndex(0);
    setIsBubbleVisible(true);
  }, [state]);

  // Ciclo sutil de mastigação no modo idle
  useEffect(() => {
    if (state !== 'idle') return;
    const interval = setInterval(() => {
      setIsChewing((prev) => !prev);
    }, 1800);
    return () => clearInterval(interval);
  }, [state]);

  const handleAvatarClick = () => {
    const list = DIALOGUES[state] || DIALOGUES.idle;
    setCurrentQuoteIndex((prev) => (prev + 1) % list.length);
    setIsBubbleVisible(true);
  };

  const activeQuote = customQuote || (DIALOGUES[state] || DIALOGUES.idle)[currentQuoteIndex];

  // Configurações de cores de iluminação da TV de acordo com o estado
  const tvLightingConfigs = {
    idle: {
      lightColor: 'rgba(56, 189, 248, 0.22)',
      ambientGlow: 'from-cyan-500/20 via-amber-500/10 to-transparent',
      shadowColor: 'rgba(14, 165, 233, 0.4)',
      beamColor: '#38bdf8',
    },
    xp: {
      lightColor: 'rgba(245, 158, 11, 0.35)',
      ambientGlow: 'from-amber-400/30 via-yellow-500/20 to-transparent',
      shadowColor: 'rgba(251, 191, 36, 0.6)',
      beamColor: '#fbbf24',
    },
    superpower: {
      lightColor: 'rgba(168, 85, 247, 0.32)',
      ambientGlow: 'from-purple-500/30 via-cyan-500/20 to-transparent',
      shadowColor: 'rgba(168, 85, 247, 0.5)',
      beamColor: '#c084fc',
    },
    horror: {
      lightColor: 'rgba(16, 185, 129, 0.28)',
      ambientGlow: 'from-emerald-900/40 via-teal-950/30 to-transparent',
      shadowColor: 'rgba(16, 185, 129, 0.4)',
      beamColor: '#34d399',
    },
    gore: {
      lightColor: 'rgba(239, 68, 68, 0.35)',
      ambientGlow: 'from-rose-900/40 via-red-950/40 to-transparent',
      shadowColor: 'rgba(239, 68, 68, 0.55)',
      beamColor: '#f87171',
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
          className={`absolute -top-14 md:-top-16 z-30 transition-all duration-300 transform ${
            isBubbleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="relative bg-zinc-900/95 border-2 border-amber-500/60 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md text-zinc-100 px-4 py-2 rounded-2xl max-w-xs md:max-w-md text-xs md:text-sm font-semibold tracking-wide flex items-center gap-2">
            <span className="text-base">
              {state === 'xp' ? '⭐' : state === 'horror' ? '👻' : state === 'superpower' ? '🦸' : state === 'gore' ? '🪓' : '🍿'}
            </span>
            <span className="leading-snug">{activeQuote}</span>
            {/* Pontinha do balão apontando para a cabeça do menino */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900/95 border-b-2 border-r-2 border-amber-500/60 transform rotate-45" />
          </div>
        </div>
      )}

      {/* 2. Feixe de Luz Cônica da Tela da TV (iluminando a sala escura) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl transition-all duration-700"
        style={{ opacity: tvGlowIntensity }}
      >
        <div
          className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-gradient-to-t ${currentTheme.ambientGlow} blur-3xl opacity-75 animate-pulse`}
          style={{ animationDuration: state === 'horror' ? '2s' : state === 'xp' ? '1s' : '3.5s' }}
        />
      </div>

      {/* 3. Ilustração Vetorial SVG Completa com Rigging e Keyframes CSS */}
      <svg
        viewBox="0 0 680 560"
        className="w-full h-auto max-w-[620px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradientes do Sofá */}
          <linearGradient id="sofaBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="60%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>

          <linearGradient id="sofaCushion" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#333338" />
            <stop offset="100%" stopColor="#1c1c20" />
          </linearGradient>

          {/* Gradientes da Pele do Menino */}
          <linearGradient id="skinBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          {/* Gradientes do Cabelo Loiro Comprido */}
          <linearGradient id="blondeHair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          <linearGradient id="blondeHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.2" />
          </linearGradient>

          {/* Gradientes do Pijama Aconchegante */}
          <linearGradient id="pajamaBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Gradiente da Manta / Capa */}
          <linearGradient id="blanketRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Gradiente dos Olhos Azuis Safira */}
          <radialGradient id="blueIris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>

          {/* Brilho da TV nos Óculos e Rosto */}
          <linearGradient id="tvGlassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="50%" stopColor={currentTheme.beamColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          {/* Gradiente do Tapete no Chão */}
          <radialGradient id="rugGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2e1065" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#1e1b4b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0.95" />
          </radialGradient>

          {/* Estilos e Animações CSS embutidas no SVG */}
          <style>{`
            @keyframes breathe {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-3px); }
            }
            @keyframes chew {
              0%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.94); }
            }
            @keyframes blink {
              0%, 94%, 98%, 100% { transform: scaleY(1); }
              96% { transform: scaleY(0.08); }
            }
            @keyframes popcornWave {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(4deg) translateY(-2px); }
            }
            @keyframes xpVictory {
              0% { transform: translateY(0) scale(1); }
              30% { transform: translateY(-16px) scale(1.05); }
              60% { transform: translateY(-10px) scale(1.02); }
              100% { transform: translateY(0) scale(1); }
            }
            @keyframes floatParticle {
              0% { transform: translateY(0) scale(0.6); opacity: 0; }
              50% { opacity: 1; transform: translateY(-40px) scale(1.1); }
              100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
            }
            @keyframes tremble {
              0%, 100% { transform: translate(0, 0); }
              20% { transform: translate(-2px, 1px); }
              40% { transform: translate(2px, -1px); }
              60% { transform: translate(-1.5px, -1px); }
              80% { transform: translate(1.5px, 1px); }
            }
            @keyframes superheroJump {
              0% { transform: translateY(0) rotate(0deg); }
              25% { transform: translateY(-55px) scale(1.08) rotate(-4deg); }
              50% { transform: translateY(-60px) scale(1.08) rotate(3deg); }
              75% { transform: translateY(8px) scale(0.96) rotate(-2deg); }
              100% { transform: translateY(0) rotate(0deg); }
            }
            @keyframes capeFlutter {
              0%, 100% { transform: rotate(-5deg) scaleX(1); }
              50% { transform: rotate(8deg) scaleX(1.15); }
            }
            @keyframes footWiggle {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(5deg); }
            }
            .anim-breathe { animation: breathe 3.6s ease-in-out infinite; transform-origin: 340px 360px; }
            .anim-chew { animation: chew 0.6s ease-in-out infinite; transform-origin: 340px 240px; }
            .anim-blink { animation: blink 4s ease-in-out infinite; transform-origin: 340px 200px; }
            .anim-xp { animation: xpVictory 1.8s ease-in-out infinite; transform-origin: 340px 320px; }
            .anim-tremble { animation: tremble 0.25s linear infinite; }
            .anim-jump { animation: superheroJump 2.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; transform-origin: 340px 420px; }
            .anim-cape { animation: capeFlutter 1.4s ease-in-out infinite; transform-origin: 340px 240px; }
            .anim-foot { animation: footWiggle 3s ease-in-out infinite; transform-origin: 410px 470px; }
          `}</style>
        </defs>

        {/* ========================================================
            CAMADA 1: CHÃO, TAPETE OVAL E FEIXE DE LUZ DA TV
           ======================================================== */}
        <g id="ground-and-light">
          {/* Tapete aconchegante */}
          <ellipse cx="340" cy="490" rx="270" ry="60" fill="url(#rugGradient)" />
          <ellipse cx="340" cy="490" rx="255" ry="52" fill="none" stroke="#4338ca" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />

          {/* Cone de luz suave da TV projetado no chão */}
          <polygon
            points="120,550 560,550 430,380 250,380"
            fill={currentTheme.lightColor}
            opacity="0.35"
            style={{ filter: 'blur(12px)' }}
          />
        </g>

        {/* ========================================================
            CAMADA 2: O SOFÁ VELUDO ACONCHEGANTE
           ======================================================== */}
        <g id="sofa">
          {/* Encosto principal do sofá */}
          <path
            d="M 140 180 C 140 150, 180 130, 240 130 L 440 130 C 500 130, 540 150, 540 180 L 550 360 L 130 360 Z"
            fill="url(#sofaBack)"
          />
          {/* Botões do capitonê do sofá */}
          <circle cx="240" cy="190" r="5" fill="#18181b" opacity="0.8" />
          <circle cx="340" cy="190" r="5" fill="#18181b" opacity="0.8" />
          <circle cx="440" cy="190" r="5" fill="#18181b" opacity="0.8" />
          <circle cx="290" cy="240" r="5" fill="#18181b" opacity="0.8" />
          <circle cx="390" cy="240" r="5" fill="#18181b" opacity="0.8" />

          {/* Braço Esquerdo do Sofá */}
          <rect x="110" y="270" width="65" height="150" rx="28" fill="#27272a" stroke="#18181b" strokeWidth="2" />
          {/* Braço Direito do Sofá */}
          <rect x="505" y="270" width="65" height="150" rx="28" fill="#27272a" stroke="#18181b" strokeWidth="2" />

          {/* Assento fofinho com costuras */}
          <path
            d="M 145 340 C 145 320, 200 310, 340 310 C 480 310, 535 320, 535 340 L 530 425 C 530 445, 480 455, 340 455 C 200 455, 150 445, 150 425 Z"
            fill="url(#sofaCushion)"
            stroke="#1c1c20"
            strokeWidth="3"
          />

          {/* Almofada decorativa Amarela Mostarda à esquerda */}
          <g transform="translate(165, 290) rotate(-14)">
            <rect x="0" y="0" width="60" height="60" rx="14" fill="#ca8a04" opacity="0.85" />
            <path d="M 10 10 L 50 50 M 10 50 L 50 10" stroke="#a16207" strokeWidth="2" opacity="0.5" />
          </g>
        </g>

        {/* ========================================================
            CAMADA 3: O MENININHO (AVATAR RIGGING DINÂMICO)
           ======================================================== */}
        <g
          id="cineboy-character"
          className={
            state === 'superpower'
              ? 'anim-jump'
              : state === 'xp'
              ? 'anim-xp'
              : state === 'horror'
              ? 'anim-tremble'
              : 'anim-breathe'
          }
        >
          {/* --- CAPA DE SUPER-HERÓI (Apenas no estado superpower) --- */}
          {state === 'superpower' && (
            <g id="hero-cape" className="anim-cape">
              <path
                d="M 310 240 Q 230 260 210 380 Q 260 410 300 370 Q 330 310 340 250 Z"
                fill="url(#blanketRed)"
                stroke="#9f1239"
                strokeWidth="2"
              />
            </g>
          )}

          {/* --- CORPO & PIJAMA ACONCHEGANTE --- */}
          <g id="pajama-torso">
            {/* Tronco sentado */}
            <path
              d="M 285 240 C 275 290, 275 350, 280 380 L 400 380 C 405 350, 405 290, 395 240 Z"
              fill="url(#pajamaBody)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Estampas fofas no pijama (luas e estrelinhas sutis) */}
            <path d="M 320 280 A 6 6 0 1 1 326 274 A 8 8 0 0 0 320 280 Z" fill="#fef08a" opacity="0.75" />
            <circle cx="360" cy="305" r="2.5" fill="#fef08a" opacity="0.75" />
            <circle cx="305" cy="340" r="2" fill="#fef08a" opacity="0.6" />
            <path d="M 365 345 A 5 5 0 1 1 370 340 A 7 7 0 0 0 365 345 Z" fill="#fef08a" opacity="0.7" />

            {/* Gola redonda do pijama */}
            <path d="M 315 240 C 325 252, 355 252, 365 240 Z" fill="#334155" />
          </g>

          {/* --- PERNAS & PÉS DESCALÇOS (DESCALÇO!) --- */}
          <g id="legs-and-barefeet">
            {/* Perna Direita (Dormindo/dobrada relaxada no sofá) */}
            <path
              d="M 290 370 C 270 385, 260 405, 270 425 C 285 440, 330 435, 345 420 L 330 380 Z"
              fill="#1e293b"
            />
            {/* Pé Esquerdo descalço descansando na almofada */}
            <g transform="translate(265, 415) rotate(15)">
              {/* Sola e pezinho rosado */}
              <ellipse cx="15" cy="10" rx="16" ry="11" fill="url(#skinBase)" />
              {/* Dedinhos fofos */}
              <circle cx="2" cy="4" r="3.2" fill="#fed7aa" />
              <circle cx="8" cy="1" r="3.5" fill="#fed7aa" />
              <circle cx="15" cy="0" r="3.7" fill="#fed7aa" />
              <circle cx="22" cy="2" r="3.4" fill="#fed7aa" />
              <circle cx="28" cy="6" r="3" fill="#fed7aa" />
            </g>

            {/* Perna Esquerda (Apoiada perto da beirada do sofá) */}
            <path
              d="M 350 370 C 370 385, 385 405, 380 435 C 375 450, 420 460, 435 440 L 400 375 Z"
              fill="#0f172a"
            />
            {/* Pé Direito descalço balançando fofinho */}
            <g id="right-barefoot" className="anim-foot" transform="translate(405, 440)">
              {/* Calcanhar e planta do pé */}
              <ellipse cx="14" cy="12" rx="16" ry="11" fill="url(#skinBase)" />
              {/* Dedinhos descalços apontando pra frente */}
              <circle cx="0" cy="8" r="3.2" fill="#fed7aa" />
              <circle cx="6" cy="4" r="3.5" fill="#fed7aa" />
              <circle cx="13" cy="3" r="3.8" fill="#fed7aa" />
              <circle cx="20" cy="5" r="3.5" fill="#fed7aa" />
              <circle cx="27" cy="9" r="3.1" fill="#fed7aa" />
            </g>
          </g>

          {/* --- BRAÇO ESQUERDO COM CONTROLE REMOTO --- */}
          <g id="left-arm-remote">
            {state === 'xp' ? (
              /* Pose de Vitória XP: Braço erguido no ar comemorando! */
              <g transform="translate(385, 245) rotate(-55)">
                <path d="M 0 0 C 15 -10, 40 -15, 60 -5 L 60 12 C 40 5, 20 10, 0 16 Z" fill="#1e293b" />
                {/* Mãozinha segurando controle */}
                <circle cx="65" cy="2" r="9" fill="url(#skinBase)" />
                {/* Controle Remoto erguido para o alto como troféu */}
                <rect x="58" y="-28" width="16" height="34" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
                <circle cx="66" cy="-22" r="2.5" fill="#ef4444" />
                <circle cx="66" cy="-14" r="2" fill="#3b82f6" />
                <circle cx="66" cy="-8" r="2" fill="#10b981" />
              </g>
            ) : (
              /* Pose Normal: Braço descansando na perna com controle apontado pra TV */
              <g transform="translate(370, 275) rotate(18)">
                <path d="M 0 0 C 20 15, 35 45, 30 75 L 14 78 C 16 50, 5 25, -12 8 Z" fill="#1e293b" />
                {/* Mãozinha */}
                <circle cx="22" cy="84" r="9" fill="url(#skinBase)" />
                {/* Controle Remoto preto na mão */}
                <rect x="14" y="78" width="16" height="32" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" transform="rotate(35, 22, 94)" />
                <circle cx="22" cy="85" r="2.5" fill="#ef4444" />
                <circle cx="26" cy="92" r="2" fill="#3b82f6" />
                <circle cx="29" cy="98" r="2" fill="#eab308" />
              </g>
            )}
          </g>

          {/* --- PESCOÇO --- */}
          <rect x="328" y="222" width="24" height="24" rx="6" fill="#fed7aa" />

          {/* --- CABEÇA & ROSTO --- */}
          <g id="head" className={isChewing && state === 'idle' ? 'anim-chew' : ''}>
            {/* Formato do Rosto Infantil fofo e bochechudo */}
            <path
              d="M 292 180 C 292 140, 310 120, 340 120 C 370 120, 388 140, 388 180 C 388 218, 372 236, 340 236 C 308 236, 292 218, 292 180 Z"
              fill="url(#skinBase)"
            />

            {/* Bochechinhas coradas rosadas */}
            <ellipse cx="308" cy="192" rx="9" ry="5" fill="#fda4af" opacity="0.65" />
            <ellipse cx="372" cy="192" rx="9" ry="5" fill="#fda4af" opacity="0.65" />

            {/* --- CABELO LOIRINHO COMPRIDO (PARTE DE TRÁS/VOLUMAÇÃO) --- */}
            <path
              d="M 285 160 C 270 180, 265 220, 275 255 C 290 265, 305 250, 305 235 L 292 170 Z"
              fill="url(#blondeHair)"
            />
            <path
              d="M 395 160 C 410 180, 415 220, 405 255 C 390 265, 375 250, 375 235 L 388 170 Z"
              fill="url(#blondeHair)"
            />

            {/* --- OLHOS AZUIS MARCANTES (EMBAIXO DOS ÓCULOS) --- */}
            <g id="eyes" className="anim-blink">
              {/* Olho Esquerdo */}
              <ellipse cx="320" cy="175" rx="10" ry="11" fill="#ffffff" />
              <ellipse cx="321" cy="175" rx="6.5" ry="7" fill="url(#blueIris)" />
              <circle cx="321" cy="175" r="3.2" fill="#0f172a" />
              {/* Brilho duplo nos olhos */}
              <circle cx="319" cy="172" r="2" fill="#ffffff" />
              <circle cx="323" cy="177" r="1.1" fill="#ffffff" />

              {/* Olho Direito */}
              <ellipse cx="360" cy="175" rx="10" ry="11" fill="#ffffff" />
              <ellipse cx="361" cy="175" rx="6.5" ry="7" fill="url(#blueIris)" />
              <circle cx="361" cy="175" r="3.2" fill="#0f172a" />
              {/* Brilho duplo nos olhos */}
              <circle cx="359" cy="172" r="2" fill="#ffffff" />
              <circle cx="363" cy="177" r="1.1" fill="#ffffff" />
            </g>

            {/* --- ÓCULOS VERMELHO MARCANTE! --- */}
            <g id="red-glasses">
              {/* Haste Esquerda */}
              <path d="M 292 173 L 305 174" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
              {/* Lente/Armação Esquerda */}
              <rect
                x="305"
                y="160"
                width="30"
                height="28"
                rx="8"
                fill="url(#tvGlassReflection)"
                stroke="#dc2626"
                strokeWidth="4.5"
              />
              {/* Ponte central dos óculos sobre o nariz */}
              <path d="M 335 172 Q 340 168 345 172" stroke="#dc2626" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Lente/Armação Direita */}
              <rect
                x="345"
                y="160"
                width="30"
                height="28"
                rx="8"
                fill="url(#tvGlassReflection)"
                stroke="#dc2626"
                strokeWidth="4.5"
              />
              {/* Haste Direita */}
              <path d="M 375 174 L 388 173" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />

              {/* Reflexo diagonal moderno nas lentes dos óculos */}
              <line x1="309" y1="182" x2="328" y2="164" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              <line x1="349" y1="182" x2="368" y2="164" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            </g>

            {/* Narizinho de botão */}
            <path d="M 338 186 Q 340 190 342 186" stroke="#fb923c" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Boquinha com expressões dinâmicas */}
            <g id="mouth">
              {state === 'xp' ? (
                /* Sorrisão aberto de orelha a orelha comemorando XP */
                <g transform="translate(340, 208)">
                  <path d="M -14 -4 Q 0 16 14 -4 Z" fill="#991b1b" />
                  <path d="M -10 -3 Q 0 4 10 -3" fill="#ffffff" />
                  <path d="M -7 6 Q 0 12 7 6" fill="#f43f5e" />
                </g>
              ) : state === 'horror' ? (
                /* Boquinha em O de susto / tensão */
                <ellipse cx="340" cy="207" rx="5" ry="6" fill="#881337" />
              ) : (
                /* Boquinha normal fofa sorrindo / mastigando */
                <path d="M 333 204 Q 340 211 347 204" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              )}
            </g>

            {/* --- CABELO LOIRINHO COMPRIDO (PARTE DA FRENTE/FRANJA) --- */}
            <g id="blonde-bangs">
              {/* Topete e mechas superiores */}
              <path
                d="M 288 160 C 295 125, 320 110, 345 110 C 375 110, 395 128, 392 160 C 380 145, 365 140, 350 145 C 335 135, 315 138, 298 152 Z"
                fill="url(#blondeHair)"
              />
              {/* Mechas longas caídas na testa e laterais */}
              <path d="M 302 145 Q 312 165 308 175 Q 300 165 302 145 Z" fill="#fde047" />
              <path d="M 342 135 Q 352 155 348 168 Q 338 155 342 135 Z" fill="#fef08a" />
              <path d="M 368 140 Q 380 165 375 178 Q 365 160 368 140 Z" fill="#facc15" />
              {/* Mecha longa loira caindo perto do ombro esquerdo */}
              <path d="M 285 170 Q 275 210 282 245 Q 295 230 292 195 Z" fill="url(#blondeHair)" />
              {/* Mecha longa loira caindo perto do ombro direito */}
              <path d="M 395 170 Q 405 210 398 245 Q 385 230 388 195 Z" fill="url(#blondeHair)" />
            </g>

            {/* --- MÁSCARA DO JASON (Apenas no estado 'gore') --- */}
            {state === 'gore' && (
              <g id="jason-hockey-mask" className="anim-breathe" transform="translate(340, 185)">
                {/* Máscara branca arredondada */}
                <ellipse cx="0" cy="0" rx="42" ry="46" fill="#f4f4f5" stroke="#71717a" strokeWidth="2.5" />
                {/* Chevrons vermelhos clássicos de Sexta-Feira 13 */}
                <polygon points="0,-36 -8,-22 8,-22" fill="#dc2626" />
                <polygon points="-30,6 -20,2 -24,-8" fill="#dc2626" />
                <polygon points="30,6 20,2 24,-8" fill="#dc2626" />
                {/* Furos dos olhos com os olhinhos azuis brilhando por trás */}
                <ellipse cx="-16" cy="-8" rx="8" ry="6" fill="#18181b" />
                <circle cx="-16" cy="-8" r="3" fill="#38bdf8" />
                <ellipse cx="16" cy="-8" rx="8" ry="6" fill="#18181b" />
                <circle cx="16" cy="-8" r="3" fill="#38bdf8" />
                {/* Furos de respiração da máscara */}
                <circle cx="-8" cy="14" r="1.5" fill="#27272a" />
                <circle cx="0" cy="14" r="1.5" fill="#27272a" />
                <circle cx="8" cy="14" r="1.5" fill="#27272a" />
                <circle cx="-12" cy="20" r="1.5" fill="#27272a" />
                <circle cx="-4" cy="20" r="1.5" fill="#27272a" />
                <circle cx="4" cy="20" r="1.5" fill="#27272a" />
                <circle cx="12" cy="20" r="1.5" fill="#27272a" />
              </g>
            )}
          </g>

          {/* --- COBERTA DE TERROR (Apenas no estado 'horror') --- */}
          {state === 'horror' && (
            <g id="horror-blanket">
              <path
                d="M 265 200 C 270 195, 340 190, 415 200 L 430 380 C 370 410, 310 410, 250 380 Z"
                fill="#334155"
                stroke="#475569"
                strokeWidth="3"
                opacity="0.95"
              />
              {/* Dobras da coberta tremendo */}
              <path d="M 280 230 Q 340 240 400 230" stroke="#1e293b" strokeWidth="2.5" fill="none" />
              <path d="M 270 280 Q 340 295 410 280" stroke="#1e293b" strokeWidth="2.5" fill="none" />
              {/* Duas mãozinhas segurando a coberta até a boca */}
              <circle cx="310" cy="205" r="7" fill="url(#skinBase)" />
              <circle cx="370" cy="205" r="7" fill="url(#skinBase)" />
            </g>
          )}

          {/* --- BALDE DE PIPOCA CLÁSSICO LISTRADO --- */}
          {state !== 'horror' && (
            <g id="popcorn-bucket" transform="translate(305, 335) rotate(-6)">
              {/* Balde com listras vermelhas e brancas */}
              <polygon points="10,25 70,25 62,85 18,85" fill="#dc2626" />
              {/* Listras brancas */}
              <polygon points="22,25 32,25 28,85 19,85" fill="#ffffff" />
              <polygon points="40,25 50,25 46,85 36,85" fill="#ffffff" />
              <polygon points="58,25 66,25 60,85 54,85" fill="#ffffff" />
              {/* Borda superior do balde */}
              <ellipse cx="40" cy="25" rx="30" ry="8" fill="#b91c1c" />

              {/* Pipocas quentinhas transbordando */}
              <g id="popcorn-kernels" className={state === 'xp' ? 'anim-chew' : ''}>
                <circle cx="25" cy="20" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                <circle cx="38" cy="16" r="8" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
                <circle cx="52" cy="19" r="7.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                <circle cx="32" cy="24" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
                <circle cx="46" cy="25" r="6.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                <circle cx="38" cy="10" r="6.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="0.8" />
              </g>

              {/* Braço Direito levando pipoca pra boca (no modo normal) */}
              {state === 'idle' && (
                <g id="arm-eating-popcorn" className="anim-chew">
                  <path d="M 0 0 C 10 -25, 25 -50, 30 -80" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" fill="none" />
                  {/* Mãozinha segurando uma pipoca */}
                  <circle cx="30" cy="-85" r="8" fill="url(#skinBase)" />
                  <circle cx="32" cy="-90" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                </g>
              )}
            </g>
          )}

          {/* --- PIPOCAS VOANDO E ESTRELINHAS DE XP (No modo 'xp') --- */}
          {state === 'xp' && (
            <g id="xp-flying-particles">
              {/* Pipocas voando de comemoração */}
              <circle cx="280" cy="250" r="5.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" className="anim-jump" />
              <circle cx="410" cy="220" r="6" fill="#fde047" stroke="#ca8a04" strokeWidth="1" className="anim-jump" />
              <circle cx="340" cy="130" r="5" fill="#ffffff" stroke="#ca8a04" strokeWidth="1" className="anim-jump" />

              {/* Estrelinhas de XP cintilantes */}
              <path d="M 270 180 L 274 190 L 285 192 L 276 199 L 279 210 L 270 203 L 261 210 L 264 199 L 255 192 L 266 190 Z" fill="#fbbf24" opacity="0.9" />
              <path d="M 420 160 L 423 168 L 432 170 L 425 176 L 427 185 L 420 179 L 413 185 L 415 176 L 408 170 L 417 168 Z" fill="#f59e0b" opacity="0.9" />

              {/* Texto flutuante +XP */}
              <text x="410" y="140" fill="#fef08a" fontSize="18" fontWeight="900" fontFamily="sans-serif" className="anim-breathe">
                +XP!
              </text>
              <text x="235" y="170" fill="#fbbf24" fontSize="16" fontWeight="900" fontFamily="sans-serif" className="anim-breathe">
                LEVEL UP!
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
