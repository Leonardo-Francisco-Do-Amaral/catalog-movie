import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Shuffle, Trophy, RotateCcw, Eye } from 'lucide-react';
import { resolveWalkMediaUrl } from '../utils/walkOfFameStickers';
import {
  playDirectorCardFlipSound,
  playDirectorOscarFanfareSound,
  playDirectorRazzieTomatoSound,
  playWalkOfFameTypeTickSound,
  stopAllTrophyAudio,
} from '../utils/trophyAudio';

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRoleBadgeInfo(roleType) {
  if (roleType === 'both') {
    return {
      icon: '🎬✍️',
      label: 'Dirigiu & Roteirizou',
      className: 'bg-amber-950/90 border-amber-400/65 text-amber-200',
    };
  }
  if (roleType === 'writer') {
    return {
      icon: '✍️',
      label: 'Roteirizou',
      className: 'bg-purple-950/90 border-purple-400/65 text-purple-200',
    };
  }
  return {
    icon: '🎬',
    label: 'Dirigiu',
    className: 'bg-sky-950/90 border-sky-400/65 text-sky-200',
  };
}

/**
 * 58+ piadas únicas divididas em categorias de divergência Crítica vs. Você.
 * O atribuidor de baralho garante ZERO repetição entre todas as cartas da mesa.
 */
const JOKE_POOLS = {
  muchHigher: [
    ({ director, imdbTxt, userTxt }) =>
      `A nota da crítica foi ${imdbTxt}, mas você cravou ${userTxt}! Você realmente gostou desse filme até mais que o próprio ${director} na sala de edição!`,
    ({ imdbTxt, userTxt }) =>
      `Crítica em ${imdbTxt} e você em ${userTxt}! Se o estúdio fizesse sessão-teste só no seu sofá, esse filme tinha saído do cinema com 14 Oscars!`,
    ({ director, imdbTxt, userTxt }) =>
      `Público: ${imdbTxt} vs. Você: ${userTxt}. Nem o fã-clube oficial de ${director} defendeu essa obra com tanta paixão quanto o seu catálogo!`,
    ({ imdbTxt, userTxt }) =>
      `Você deu ${userTxt} onde a crítica parou em ${imdbTxt}: parabéns, oficialmente você foi nomeado presidente do departamento de reabilitação histórica desse filme!`,
    ({ director, imdbTxt, userTxt }) =>
      `${imdbTxt} lá fora, ${userTxt} aqui dentro! Quando ${director} lê reviews desse nível, volta a acreditar na humanidade!`,
    ({ imdbTxt, userTxt }) =>
      `A crítica bateu ${imdbTxt} de má vontade e você respondeu com ${userTxt} na tabela! Isso não é nota, é abraço cinematográfico em tela IMAX!`,
    ({ imdbTxt, userTxt }) =>
      `Diferença gritante (${userTxt} contra ${imdbTxt})! Você viu camada artística invisível que passou direto pelo radar de meio mundo!`,
    ({ title, imdbTxt, userTxt }) =>
      `Com ${userTxt} contra ${imdbTxt} da crítica, "${title}" acabou de ganhar passe livre vitalício no seu hall de clássicos injustiçados!`,
    ({ imdbTxt, userTxt }) =>
      `Crítica dormiu no ponto (${imdbTxt}) e você acordou o cinema inteiro com ${userTxt}! Quase dá pra ouvir o projecionista batendo palmas!`,
    ({ director, imdbTxt, userTxt }) =>
      `Se ${director} precisar de um advogado no tribunal de Hollywood, sua nota ${userTxt} frente aos ${imdbTxt} da imprensa é prova irrefutável de genialidade!`,
  ],
  muchLower: [
    ({ imdbTxt, userTxt }) =>
      `A nota da crítica foi ${imdbTxt} e você deu ${userTxt}! Se você pudesse, fazia igual à Warner e cancelava esse filme pronto só pra abater no imposto!`,
    ({ director, imdbTxt, userTxt }) =>
      `O mundo deu ${imdbTxt}, mas o seu veredito foi ${userTxt}! Até ${director} olhou pra esse pôster hoje e pensou: "realmente, exagerei no café naquele dia".`,
    ({ imdbTxt, userTxt }) =>
      `Crítica: ${imdbTxt} × Você: ${userTxt}. Você saiu dessa sessão pedindo reembolso da pipoca, do estacionamento e das duas horas de vida!`,
    ({ title, imdbTxt, userTxt }) =>
      `Todo mundo elogiando "${title}" (${imdbTxt}) e você cravando ${userTxt}: o único jurado do planeta imune ao marketing de trailer!`,
    ({ imdbTxt, userTxt }) =>
      `Você deu ${userTxt} onde o público deu ${imdbTxt}! Esse aí entrou no catálogo só pra provar que ninguém acerta 100% das vezes!`,
    ({ director, imdbTxt, userTxt }) =>
      `${userTxt} contra ${imdbTxt}! Se ${director} fizesse versão do diretor desse filme, você pedia a versão do corte rápido de 12 minutos!`,
    ({ imdbTxt, userTxt }) =>
      `Crítica embalou com laço (${imdbTxt}) e você devolveu na portaria com ${userTxt}: hoje o controle remoto não perdoou nem grife famosa!`,
    ({ title, imdbTxt, userTxt }) =>
      `A imprensa chamou "${title}" de marco cultural (${imdbTxt}); você chamou de teste de paciência nível ${userTxt}!`,
    ({ imdbTxt, userTxt }) =>
      `De ${imdbTxt} para ${userTxt}: você não só discordou da crítica, você abriu boletim de ocorrência contra o terceiro ato!`,
    ({ imdbTxt, userTxt }) =>
      `Com ${userTxt} em cima de um ${imdbTxt} famoso, você provou que prestígio de pôster não compra uma única estrela no seu sofá!`,
  ],
  bothMasterpiece: [
    ({ director, imdbTxt, userTxt }) =>
      `Crítica: ${imdbTxt} e Você: ${userTxt}! Aliança absoluta com o cinema: essa obra de ${director} já merece ficar emoldurada no Louvre ao lado da Mona Lisa!`,
    ({ imdbTxt, userTxt }) =>
      `Sintonia de obra-prima! ${imdbTxt} lá e ${userTxt} cá — quando o filme termina e ninguém ousa mexer no celular durante os créditos inteiros!`,
    ({ imdbTxt, userTxt }) =>
      `Duplo aplauso de pé (${imdbTxt} × ${userTxt}): cinema no volume máximo, zero defeitos e vontade imediata de rever como se fosse a primeira vez!`,
    ({ title, imdbTxt, userTxt }) =>
      `"${title}" fechou ${userTxt} no seu sofá e ${imdbTxt} no mundo! Quando crítica e coração assinam o mesmo contrato, nasce um clássico eterno!`,
    ({ director, imdbTxt, userTxt }) =>
      `${userTxt} com ${imdbTxt} da crítica! ${director} atingiu aqui a temperatura perfeita de roteiro, câmera e pipoca esquecida na tigela!`,
    ({ imdbTxt, userTxt }) =>
      `Nota ${userTxt} batendo forte com ${imdbTxt}: aqui não teve discussão na saída do cinema, só silêncio respeitoso antes do aplauso!`,
    ({ imdbTxt, userTxt }) =>
      `Equação de ouro (${userTxt} × ${imdbTxt}): cada cena paga o ingresso inteiro — devia ser proibido assistir esse sem tela grande!`,
    ({ imdbTxt, userTxt }) =>
      `Com ${imdbTxt} lá e ${userTxt} aqui, o projetor chegou até a sorrir enquanto rodava o rolo final!`,
  ],
  bothDisaster: [
    ({ imdbTxt, userTxt }) =>
      `Crítica: ${imdbTxt} e Você: ${userTxt}. Pelo menos aqui não houve treta: todo mundo concordou em sair da sala antes dos créditos subirem!`,
    ({ imdbTxt, userTxt }) =>
      `Harmonia no desastre (${imdbTxt} × ${userTxt})! Até o microfone de lapela pediu demissão no meio das filmagens dessa bomba!`,
    ({ title, imdbTxt, userTxt }) =>
      `"${title}" uniu crítica (${imdbTxt}) e público do seu sofá (${userTxt}) numa rara concordância diplomática: nunca mais dar play por engano!`,
    ({ imdbTxt, userTxt }) =>
      `${userTxt} aqui e ${imdbTxt} fora: esse filme devia vir com aviso luminoso de saída de emergência logo no logo do estúdio!`,
    ({ director, imdbTxt, userTxt }) =>
      `Mesmo os maiores fãs de ${director} fingem amnésia coletiva com esse ${imdbTxt} / ${userTxt} — DVD excelente apenas como apoio de copo!`,
    ({ imdbTxt, userTxt }) =>
      `Pactuado no cartório: ${imdbTxt} da crítica e ${userTxt} seu — o único momento emocionante foi a barra de progresso chegando ao fim!`,
    ({ imdbTxt, userTxt }) =>
      `Nem velocidade 2x salvou (${userTxt} contra ${imdbTxt})! Parabéns por ter sobrevivido até o letreiro final como verdadeiro cinéfilo de guerra!`,
    ({ imdbTxt, userTxt }) =>
      `Acordo unânime de paz (${imdbTxt} × ${userTxt}): até o estagiário da montagem tentou esconder o próprio nome dos créditos!`,
  ],
  slightlyHigher: [
    ({ imdbTxt, userTxt }) =>
      `A crítica parou em ${imdbTxt}, mas seu coração cinéfilo empurrou para ${userTxt}! Você perdoou os furos de roteiro pelo carisma da direção!`,
    ({ director, imdbTxt, userTxt }) =>
      `${userTxt} contra ${imdbTxt}: um carinho extra merecido por ${director}! O tipo de sessão que ganha meio ponto só pela trilha sonora e atmosfera!`,
    ({ title, imdbTxt, userTxt }) =>
      `Você puxou "${title}" pra cima (${userTxt} vs ${imdbTxt})! Não mudou a história do cinema, mas salvou perfeitamente o domingo à noite!`,
    ({ imdbTxt, userTxt }) =>
      `Com ${userTxt} em cima do ${imdbTxt} geral, você mostrou generosidade de festival — aquela estrela bônus dada com sorriso no canto da boca!`,
    ({ imdbTxt, userTxt }) =>
      `Crítica cautelosa (${imdbTxt}), você entusiasmado (${userTxt}): quando o filme entrega o entretenimento certo na hora certa, não tem erro!`,
    ({ imdbTxt, userTxt }) =>
      `Um degrau acima da média (${userTxt} contra ${imdbTxt}): filme que envelheceu melhor na sua estante do que nas colunas de jornal da estreia!`,
    ({ imdbTxt, userTxt }) =>
      `Entre ${imdbTxt} e ${userTxt}, você deu aquele voto de confiança que transforma bom filme em companhia frequente de reprise!`,
  ],
  slightlyLower: [
    ({ imdbTxt, userTxt }) =>
      `A crítica fechou em ${imdbTxt}, mas o seu radar rigoroso baixou para ${userTxt}! Faltou aquela fagulha final pra levar nota máxima!`,
    ({ director, imdbTxt, userTxt }) =>
      `${userTxt} contra ${imdbTxt}: jurado técnico em ação! Você sabe o calibre de ${director}, então a régua aqui no seu sofá sobe pesado!`,
    ({ title, imdbTxt, userTxt }) =>
      `Bom filme, mas sem passe grátis: "${title}" ficou com ${userTxt} frente aos ${imdbTxt} do público — aquele corte no segundo ato pesou!`,
    ({ imdbTxt, userTxt }) =>
      `Com ${userTxt} versus ${imdbTxt}, você não caiu no hype da estreia e descontou pontinhos cirúrgicos como crítico de Cannes!`,
    ({ imdbTxt, userTxt }) =>
      `A plateia deu ${imdbTxt} e você segurou em ${userTxt}: gostou, elogiou a fotografia, mas saiu resmungando da última fala!`,
    ({ imdbTxt, userTxt }) =>
      `Régua bem calibrada (${userTxt} diante de ${imdbTxt}): longe de ser ruim, só não te convenceu a repetir o bis na semana seguinte!`,
    ({ imdbTxt, userTxt }) =>
      `Pequeno puxão de orelha (${imdbTxt} → ${userTxt}): faltou cortar 15 minutinhos de barriga no meio do roteiro para virar cinco estrelas!`,
  ],
  matched: [
    ({ imdbTxt, userTxt }) =>
      `Sintonia telepática: Crítica em ${imdbTxt} e Você em ${userTxt}! Seu termômetro cinematográfico está calibrado com precisão cirúrgica!`,
    ({ title, imdbTxt, userTxt }) =>
      `"${title}" bateu ${imdbTxt} lá fora e ${userTxt} aqui dentro — nem o algoritmo de recomendação acertaria esse empate tão limpo!`,
    ({ imdbTxt, userTxt }) =>
      `Empate técnico bonito (${userTxt} × ${imdbTxt}): pela primeira vez na semana, seu sofá e os votantes internacionais concordaram no mesmo filme!`,
    ({ director, imdbTxt, userTxt }) =>
      `Termômetro cravado (${imdbTxt} vs ${userTxt}): você leu exatamente a intenção que ${director} colocou na tela sem tirar nem pôr!`,
    ({ imdbTxt, userTxt }) =>
      `Coincidência rara no catálogo: Crítica ${imdbTxt}, Você ${userTxt}. Zero briga na mesa do júri — veredito unânime por aclamação!`,
    ({ imdbTxt, userTxt }) =>
      `Com ${userTxt} espelhando ${imdbTxt}, seu olhar cinéfilo e o consenso mundial apertaram as mãos em pleno tapete vermelho!`,
    ({ imdbTxt, userTxt }) =>
      `Precisão suíça: ${imdbTxt} na crítica, ${userTxt} na sua caderneta! Você literalmente sente o peso exato de cada cena!`,
    ({ imdbTxt, userTxt }) =>
      `Mesa do júri alinhada (${userTxt} = ${imdbTxt}): nenhum recurso cabível da defesa nem da acusação!`,
  ],
};

function resolveBucketInfo(movie) {
  const hasUser = typeof movie.userRating === 'number';
  const hasImdb = typeof movie.imdbRating === 'number';
  const user = hasUser ? Number(movie.userRating) : 7.5;
  const imdb = hasImdb ? Number(movie.imdbRating) : 7.0;
  const userTxt = hasUser ? user.toFixed(1) : '7.5*';
  const imdbTxt = hasImdb ? imdb.toFixed(1) : '7.0*';
  const diff = Number((user - imdb).toFixed(1));

  if (diff >= 1.2) {
    return {
      bucket: 'muchHigher',
      badge: `+${diff.toFixed(1)} Acima da Crítica`,
      badgeClass: 'bg-emerald-500/25 border-emerald-400/70 text-emerald-200',
      userTxt,
      imdbTxt,
      diff,
    };
  }
  if (diff <= -1.2) {
    return {
      bucket: 'muchLower',
      badge: `${diff.toFixed(1)} Abaixo da Crítica`,
      badgeClass: 'bg-rose-500/25 border-rose-400/70 text-rose-200',
      userTxt,
      imdbTxt,
      diff,
    };
  }
  if (user >= 8.5 && imdb >= 7.8) {
    return {
      bucket: 'bothMasterpiece',
      badge: 'Consenso Clássico',
      badgeClass: 'bg-amber-500/25 border-amber-300/70 text-amber-200',
      userTxt,
      imdbTxt,
      diff,
    };
  }
  if (user <= 5.5 && imdb <= 5.8) {
    return {
      bucket: 'bothDisaster',
      badge: 'Alarme Vermelho',
      badgeClass: 'bg-red-500/25 border-red-400/70 text-red-200',
      userTxt,
      imdbTxt,
      diff,
    };
  }
  if (diff > 0.35) {
    return {
      bucket: 'slightlyHigher',
      badge: `+${diff.toFixed(1)} Carinho Extra`,
      badgeClass: 'bg-sky-500/25 border-sky-400/70 text-sky-200',
      userTxt,
      imdbTxt,
      diff,
    };
  }
  if (diff < -0.35) {
    return {
      bucket: 'slightlyLower',
      badge: `${diff.toFixed(1)} Jurado Exigente`,
      badgeClass: 'bg-orange-500/25 border-orange-400/70 text-orange-200',
      userTxt,
      imdbTxt,
      diff,
    };
  }
  return {
    bucket: 'matched',
    badge: 'Sintonia Total',
    badgeClass: 'bg-zinc-700/75 border-zinc-400/55 text-zinc-100',
    userTxt,
    imdbTxt,
    diff,
  };
}

/**
 * Pré-atribui uma piada única para cada carta do baralho atual sem nunca repetir.
 */
function assignUniqueVerdicts(cards, directorName) {
  const used = new Set();
  const verdictMap = new Map();
  const fallbackOrder = [
    'matched',
    'slightlyHigher',
    'slightlyLower',
    'muchHigher',
    'muchLower',
    'bothMasterpiece',
    'bothDisaster',
  ];

  cards.forEach((movie, idx) => {
    const info = resolveBucketInfo(movie);
    const params = {
      director: directorName,
      title: movie.title || 'Este Filme',
      userTxt: info.userTxt,
      imdbTxt: info.imdbTxt,
    };

    const candidates = [info.bucket, ...fallbackOrder.filter((b) => b !== info.bucket)];
    let chosenText = null;

    for (const bucketKey of candidates) {
      const pool = JOKE_POOLS[bucketKey] || [];
      for (let offset = 0; offset < pool.length; offset += 1) {
        const jIdx = (idx + offset) % pool.length;
        const uid = `${bucketKey}:${jIdx}`;
        if (!used.has(uid)) {
          used.add(uid);
          chosenText = pool[jIdx](params);
          break;
        }
      }
      if (chosenText) break;
    }

    if (!chosenText) {
      const pool = JOKE_POOLS[info.bucket] || JOKE_POOLS.matched;
      chosenText = pool[idx % pool.length](params);
    }

    verdictMap.set(movie.movieId, {
      ...info,
      joke: chosenText,
    });
  });

  return verdictMap;
}

/**
 * Distribui os cartazes espelhados pelas laterais + topo + base da tela (100vw x 100vh),
 * mantendo o palco central livre para as notas, piada escrevendo e botões de Oscar/Framboesa.
 */
function computeScatteredSlots(count) {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 14, y: 50, tilt: -5, layer: 2 }];
  if (count === 2) {
    return [
      { x: 12, y: 50, tilt: -6, layer: 2 },
      { x: 88, y: 50, tilt: 6, layer: 2 },
    ];
  }
  if (count === 3) {
    return [
      { x: 12, y: 52, tilt: -6, layer: 2 },
      { x: 50, y: 11.5, tilt: 0, layer: 2 },
      { x: 88, y: 52, tilt: 6, layer: 2 },
    ];
  }
  if (count === 4) {
    return [
      { x: 11.5, y: 31, tilt: -7, layer: 2 },
      { x: 88.5, y: 31, tilt: 7, layer: 2 },
      { x: 13.5, y: 71, tilt: 5, layer: 2 },
      { x: 86.5, y: 71, tilt: -5, layer: 2 },
    ];
  }

  const slots = [];
  const sidePairsTarget = Math.min(Math.ceil(count * 0.56), count >= 18 ? 16 : count >= 10 ? 12 : 8);
  const topBottomRemaining = Math.max(0, count - sidePairsTarget);
  const topCount = Math.ceil(topBottomRemaining / 2);
  const bottomCount = topBottomRemaining - topCount;

  const pairsCount = Math.ceil(sidePairsTarget / 2);
  const rowsPerColumn = Math.ceil(pairsCount / 2);
  const useDualColumns = pairsCount > 4;

  let sideAdded = 0;
  for (let i = 0; i < pairsCount; i += 1) {
    const isInner = useDualColumns && i % 2 === 1;
    const colIndex = useDualColumns ? Math.floor(i / 2) : i;
    const colTotal = useDualColumns
      ? isInner
        ? Math.floor(pairsCount / 2)
        : rowsPerColumn
      : pairsCount;
    const t = colTotal <= 1 ? 0.5 : colIndex / (colTotal - 1);
    const yBase = 19 + t * 62 + (isInner ? 4.5 : 0);
    const y = Math.min(84, Math.max(17, yBase));
    const xOffset = isInner ? 17.8 : 7.2;
    const tiltBase = ((i % 3) - 1) * 5 + (isInner ? -3 : 3);

    slots.push({
      x: xOffset,
      y,
      tilt: tiltBase,
      layer: isInner ? 1 : 2,
    });
    sideAdded += 1;

    if (sideAdded < sidePairsTarget) {
      slots.push({
        x: 100 - xOffset,
        y,
        tilt: -tiltBase,
        layer: isInner ? 1 : 2,
      });
      sideAdded += 1;
    }
  }

  for (let i = 0; i < topCount; i += 1) {
    const t = topCount <= 1 ? 0.5 : i / (topCount - 1);
    const x = topCount === 1 ? 50 : 20 + t * 60;
    const arcLift = Math.sin(t * Math.PI) * 2.2;
    slots.push({
      x,
      y: 11 - arcLift,
      tilt: (t - 0.5) * 9,
      layer: i % 2 === 0 ? 2 : 1,
    });
  }

  for (let i = 0; i < bottomCount; i += 1) {
    const t = bottomCount <= 1 ? 0.5 : i / (bottomCount - 1);
    const x = bottomCount === 1 ? 50 : 20 + t * 60;
    const arcDrop = Math.sin(t * Math.PI) * 2.2;
    slots.push({
      x,
      y: 89 + arcDrop,
      tilt: -(t - 0.5) * 9,
      layer: i % 2 === 0 ? 2 : 1,
    });
  }

  return slots;
}

const FIREWORK_BURSTS = [
  { x: 18, y: 24, color: '#fbbf24', delay: '0.05s' },
  { x: 82, y: 22, color: '#38bdf8', delay: '0.28s' },
  { x: 24, y: 74, color: '#f472b6', delay: '0.52s' },
  { x: 78, y: 70, color: '#34d399', delay: '0.75s' },
  { x: 50, y: 14, color: '#fde047', delay: '0.40s' },
  { x: 14, y: 48, color: '#a78bfa', delay: '0.98s' },
  { x: 86, y: 46, color: '#fb923c', delay: '1.18s' },
];

const CLAP_POPUPS = [
  { x: 18, y: 82, delay: '0.1s', rot: '-12deg' },
  { x: 30, y: 86, delay: '0.35s', rot: '8deg' },
  { x: 42, y: 84, delay: '0.2s', rot: '-6deg' },
  { x: 58, y: 84, delay: '0.45s', rot: '10deg' },
  { x: 70, y: 86, delay: '0.25s', rot: '-9deg' },
  { x: 82, y: 82, delay: '0.5s', rot: '12deg' },
];

const TOMATO_PROJECTILES = [
  { sx: '-42vw', sy: '-32vh', tx: '-26px', ty: '-44px', rot: '-25deg', delay: '0.05s', size: 38 },
  { sx: '44vw', sy: '-28vh', tx: '34px', ty: '-18px', rot: '18deg', delay: '0.22s', size: 42 },
  { sx: '-40vw', sy: '26vh', tx: '-34px', ty: '36px', rot: '-14deg', delay: '0.42s', size: 36 },
  { sx: '42vw', sy: '30vh', tx: '22px', ty: '48px', rot: '30deg', delay: '0.62s', size: 40 },
  { sx: '0vw', sy: '-44vh', tx: '6px', ty: '6px', rot: '-8deg', delay: '0.84s', size: 46 },
  { sx: '-28vw', sy: '40vh', tx: '58px', ty: '-52px', rot: '22deg', delay: '1.04s', size: 34 },
];

function TomatoSplatSvg({ size = 56, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M40 8C45 14 54 11 59 18C63 23 72 24 71 33C70 40 77 48 68 54C62 58 63 69 53 68C46 67 40 75 33 68C25 69 17 65 18 55C19 48 8 43 13 34C17 28 11 19 20 17C28 16 32 10 40 8Z"
        fill="#ef4444"
        fillOpacity="0.9"
      />
      <path
        d="M39 20C45 20 53 26 52 34C51 42 58 46 49 52C42 56 31 55 27 47C23 39 27 25 39 20Z"
        fill="#dc2626"
      />
      <circle cx="14" cy="14" r="3.5" fill="#ef4444" />
      <circle cx="70" cy="18" r="3" fill="#dc2626" />
      <circle cx="67" cy="67" r="4" fill="#ef4444" />
      <circle cx="15" cy="64" r="3" fill="#dc2626" />
      <path d="M36 27L42 33M45 28L38 35" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function WalkOfFameDirectorVerdictModal({ star, onClose }) {
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [flippedIds, setFlippedIds] = useState(() => new Set());
  const [activeCardId, setActiveCardId] = useState(null);
  // 'browsing' | 'oscar' | 'razzie'
  const [ceremonyMode, setCeremonyMode] = useState('browsing');
  const [typedCount, setTypedCount] = useState(0);
  const [jokeNonce, setJokeNonce] = useState(0);

  const audioTickCounterRef = useRef(0);

  const deckMovies = useMemo(() => {
    if (!star) return [];
    const seenIds = new Set();
    const seenTitles = new Set();
    const list = [];

    const pushFilm = (f) => {
      if (!f || !f.title) return;
      const key = String(f.title).trim().toLowerCase();
      const id = f.movieId != null ? Number(f.movieId) : -(list.length + 1);
      if (seenTitles.has(key) || seenIds.has(id)) return;
      seenTitles.add(key);
      seenIds.add(id);
      list.push({ ...f, movieId: id });
    };

    (star.watchedFilms || []).forEach(pushFilm);
    if (list.length === 0) {
      (star.pendingFilms || []).slice(0, 12).forEach(pushFilm);
    }

    // Até 20 cartazes para manter o tabuleiro espaçoso e legível em 100vw x 100vh
    return shuffleArray(list.slice(0, 20));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [star?.id, shuffleSeed, star?.watchedFilms?.length]);

  const verdictMap = useMemo(
    () => assignUniqueVerdicts(deckMovies, star?.name || 'Diretor'),
    [deckMovies, star?.name]
  );

  const scatteredSlots = useMemo(
    () => computeScatteredSlots(deckMovies.length),
    [deckMovies.length]
  );

  // Melhor (Oscar) e pior (Framboesa) garantindo desempate para evitar coincidir o mesmo pôster com >=2 filmes
  const { bestMovie, worstMovie } = useMemo(() => {
    if (deckMovies.length === 0) return { bestMovie: null, worstMovie: null };
    const sortedBest = [...deckMovies].sort(
      (a, b) =>
        (Number(b.userRating) || 0) - (Number(a.userRating) || 0) ||
        (Number(b.imdbRating) || 0) - (Number(a.imdbRating) || 0) ||
        (Number(b.releaseYear) || 0) - (Number(a.releaseYear) || 0)
    );
    const best = sortedBest[0];
    const sortedWorst = [...deckMovies]
      .filter((m) => deckMovies.length === 1 || Number(m.movieId) !== Number(best.movieId))
      .sort(
        (a, b) =>
          (Number(a.userRating) || 0) - (Number(b.userRating) || 0) ||
          (Number(a.imdbRating) || 0) - (Number(b.imdbRating) || 0) ||
          (Number(a.releaseYear) || 0) - (Number(b.releaseYear) || 0)
      );
    const worst = sortedWorst[0] || best;
    return { bestMovie: best, worstMovie: worst };
  }, [deckMovies]);

  // Reinicia o show quando muda a estrela ou fecha
  useEffect(() => {
    if (!star) return undefined;
    setFlippedIds(new Set());
    setActiveCardId(null);
    setCeremonyMode('browsing');
    setTypedCount(0);
    setJokeNonce((n) => n + 1);
    return () => {
      stopAllTrophyAudio();
    };
  }, [star?.id, shuffleSeed]);

  const handleClose = useCallback(() => {
    stopAllTrophyAudio();
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!star) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [star, handleClose]);

  const activeMovie = useMemo(
    () => deckMovies.find((m) => Number(m.movieId) === Number(activeCardId)) || null,
    [deckMovies, activeCardId]
  );

  const spotlightMovie =
    ceremonyMode === 'oscar' ? bestMovie : ceremonyMode === 'razzie' ? worstMovie : null;

  // Texto que será escrito na máquina de escrever central
  const stageScript = useMemo(() => {
    if (!star) return { badge: '', badgeClass: '', text: '' };

    if (ceremonyMode === 'oscar' && bestMovie) {
      const u = typeof bestMovie.userRating === 'number' ? bestMovie.userRating.toFixed(1) : '10.0';
      const c = typeof bestMovie.imdbRating === 'number' ? bestMovie.imdbRating.toFixed(1) : '7.5';
      return {
        badge: '🏆 E O OSCAR DO CATÁLOGO VAI PARA...',
        badgeClass: 'bg-amber-400/20 border-amber-300/75 text-amber-200',
        text: `"${bestMovie.title}"! Sua nota ★${u} contra ${c} da crítica consagrou essa obra como a joia da coroa na filmografia de ${star.name}. Fogos no tapete vermelho e aplausos de pé!`,
      };
    }

    if (ceremonyMode === 'razzie' && worstMovie) {
      const u = typeof worstMovie.userRating === 'number' ? worstMovie.userRating.toFixed(1) : '4.0';
      const c = typeof worstMovie.imdbRating === 'number' ? worstMovie.imdbRating.toFixed(1) : '6.5';
      return {
        badge: '🫐 E A FRAMBOESA DE OURO VAI PARA...',
        badgeClass: 'bg-rose-500/25 border-rose-400/75 text-rose-200',
        text: `"${worstMovie.title}"! Com ★${u} na sua caderneta (Crítica: ${c}), ninguém escapou dos tomates da plateia hoje — nem ${star.name} escapa dessa troféu cômico!`,
      };
    }

    if (activeMovie) {
      const verdict = verdictMap.get(activeMovie.movieId);
      if (verdict) {
        return {
          badge: verdict.badge,
          badgeClass: verdict.badgeClass,
          text: verdict.joke,
        };
      }
    }

    return {
      badge: `🃏 ${deckMovies.length} CARTAZES MISTERIOSOS ESPALHADOS`,
      badgeClass: 'bg-zinc-900/80 border-amber-400/45 text-amber-200',
      text: `Clique em qualquer cartaz virado pela tela para revelar o filme de ${star.name}, comparar Nota da Crítica × Sua Nota e ouvir a reação do júri. Depois entregue o Oscar 🏆 e a Framboesa 🫐!`,
    };
  }, [star, ceremonyMode, bestMovie, worstMovie, activeMovie, verdictMap, deckMovies.length]);

  // Sempre que o cartão clicado ou cerimônia mudar, apaga imediatamente a piada anterior e escreve a nova!
  useEffect(() => {
    const fullText = stageScript.text || '';
    setTypedCount(0);
    audioTickCounterRef.current = 0;
    if (!fullText) return undefined;

    const timer = setInterval(() => {
      setTypedCount((prev) => {
        if (prev >= fullText.length) {
          clearInterval(timer);
          return prev;
        }
        const ch = fullText[prev];
        audioTickCounterRef.current += 1;
        if (ch && ch !== ' ' && audioTickCounterRef.current % 3 === 1) {
          playWalkOfFameTypeTickSound();
        }
        return prev + 1;
      });
    }, 18);

    return () => clearInterval(timer);
  }, [stageScript.text, jokeNonce]);

  const handleCardClick = (movie) => {
    if (ceremonyMode !== 'browsing') return;
    playDirectorCardFlipSound();
    setFlippedIds((prev) => {
      const next = new Set(prev);
      next.add(movie.movieId);
      return next;
    });
    setActiveCardId(movie.movieId);
    setJokeNonce((n) => n + 1);
  };

  const handleFlipAll = () => {
    playDirectorCardFlipSound();
    setCeremonyMode('browsing');
    setFlippedIds(new Set(deckMovies.map((m) => m.movieId)));
    if (!activeCardId && deckMovies[0]) {
      setActiveCardId(deckMovies[0].movieId);
    }
    setJokeNonce((n) => n + 1);
  };

  const handleReshuffle = () => {
    stopAllTrophyAudio();
    setCeremonyMode('browsing');
    setFlippedIds(new Set());
    setActiveCardId(null);
    setShuffleSeed((s) => s + 1);
    setJokeNonce((n) => n + 1);
  };

  const handleStartOscar = () => {
    if (!bestMovie) return;
    stopAllTrophyAudio();
    playDirectorOscarFanfareSound();
    setFlippedIds((prev) => {
      const next = new Set(prev);
      next.add(bestMovie.movieId);
      return next;
    });
    setCeremonyMode('oscar');
    setJokeNonce((n) => n + 1);
  };

  const handleStartRazzie = () => {
    if (!worstMovie) return;
    stopAllTrophyAudio();
    playDirectorRazzieTomatoSound();
    setFlippedIds((prev) => {
      const next = new Set(prev);
      next.add(worstMovie.movieId);
      return next;
    });
    setCeremonyMode('razzie');
    setJokeNonce((n) => n + 1);
  };

  const handleReturnToBoard = () => {
    stopAllTrophyAudio();
    setCeremonyMode('browsing');
    setJokeNonce((n) => n + 1);
  };

  if (!star) return null;

  const isCeremony = ceremonyMode === 'oscar' || ceremonyMode === 'razzie';
  const revealedCount = flippedIds.size;
  const typedText = (stageScript.text || '').slice(0, typedCount);
  const isTyping = typedCount < (stageScript.text || '').length;

  const cardSizeClass =
    deckMovies.length >= 15
      ? 'w-[74px] h-[112px] lg:w-[88px] lg:h-[132px] xl:w-[100px] xl:h-[150px]'
      : deckMovies.length >= 10
      ? 'w-[84px] h-[126px] lg:w-[100px] lg:h-[150px] xl:w-[114px] xl:h-[170px]'
      : 'w-[96px] h-[144px] lg:w-[114px] lg:h-[170px] xl:w-[126px] xl:h-[188px]';

  const content = (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Show de Cartazes de ${star.name}`}
    >
      {/* 1. Pano escuro cinematográfico que apaga o álbum atrás */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background:
            ceremonyMode === 'oscar'
              ? 'radial-gradient(circle at 50% 45%, rgba(250,204,21,0.16), rgba(3,4,10,0.98) 65%)'
              : ceremonyMode === 'razzie'
              ? 'radial-gradient(circle at 50% 45%, rgba(244,63,94,0.18), rgba(4,2,6,0.98) 65%)'
              : 'rgba(2, 4, 10, 0.94)',
          backdropFilter: 'blur(18px)',
          animation: 'dvEclipseBlackout 0.65s ease-out both',
        }}
      />

      {/* Onda expansiva de choque inicial */}
      <div
        key={`shock_${shuffleSeed}`}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          borderStyle: 'solid',
          borderColor: 'rgba(251, 191, 36, 0.7)',
          boxShadow: '0 0 80px rgba(251, 191, 36, 0.45)',
          animation: 'dvShockwave 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      />

      {/* Bokeh estrelado sutil no escuro */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 41 + 11) % 98}%`,
              top: `${(i * 67 + 9) % 96}%`,
              width: `${1.5 + (i % 3)}px`,
              height: `${1.5 + (i % 3)}px`,
              opacity: isCeremony ? 0.14 : 0.45,
              animation: `dvStarTwinkle ${2.2 + (i % 4) * 0.7}s ease-in-out ${(i % 5) * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Botão Fechar Flutuante */}
      <button
        type="button"
        onClick={handleClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/20 text-zinc-200 hover:text-white text-xs font-black flex items-center gap-1.5 shadow-xl cursor-pointer transition-all"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">Fechar Show</span>
      </button>

      {/* =================================================================
          2. CARTAZES VIRADOS ESPALHADOS PELA TELA (DESKTOP / MD+)
         ================================================================= */}
      <div
        className={`hidden md:block absolute inset-0 transition-all duration-700 ${
          isCeremony ? 'opacity-10 blur-[3px] scale-95 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        {deckMovies.map((movie, idx) => {
          const slot = scatteredSlots[idx] || { x: 50, y: 12, tilt: 0, layer: 1 };
          const dx = `${50 - slot.x}vw`;
          const dy = `${50 - slot.y}vh`;
          const delay = 0.08 + (idx % 12) * 0.045;
          const isFlipped = flippedIds.has(movie.movieId);
          const isActive = Number(activeCardId) === Number(movie.movieId);
          const poster = resolveWalkMediaUrl(movie.posterUrl);
          const role = getRoleBadgeInfo(movie.roleType);
          const userTxt =
            typeof movie.userRating === 'number' ? movie.userRating.toFixed(1) : '7.5';
          const imdbTxt =
            typeof movie.imdbRating === 'number' ? movie.imdbRating.toFixed(1) : '7.0';

          return (
            <div
              key={`${movie.movieId}_${shuffleSeed}`}
              className={`absolute ${slot.layer === 2 ? 'z-20' : 'z-10'}`}
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                '--dx': dx,
                '--dy': dy,
                '--tilt': `${slot.tilt}deg`,
                animation: `dvCardFlight 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
              }}
            >
              <div
                style={{
                  animation: `dvCardFloat ${4.6 + (idx % 4) * 0.7}s ease-in-out ${delay + 0.9}s infinite`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleCardClick(movie)}
                  title={isFlipped ? `${movie.title} — clique para reler` : 'Carta misteriosa — clique para virar!'}
                  className={`group relative ${cardSizeClass} cursor-pointer focus:outline-none transition-transform duration-300 ${
                    isActive ? 'scale-110 z-30' : 'hover:scale-110'
                  }`}
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className="relative w-full h-full transition-transform duration-700"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* VERSO DA CARTA (VIRADA PARA BAIXO) */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 border-amber-400/55 bg-gradient-to-br from-zinc-900 via-indigo-950/95 to-zinc-950 flex flex-col items-center justify-between p-2 shadow-[0_14px_34px_rgba(0,0,0,0.85)] overflow-hidden group-hover:border-amber-300"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(251,191,36,0.22) 6px, rgba(251,191,36,0.22) 7px)',
                        }}
                      />
                      <span className="relative z-10 text-[8px] font-mono font-black tracking-widest text-amber-300/80 uppercase">
                        CARTA #{idx + 1}
                      </span>
                      <div className="relative z-10 w-9 h-9 rounded-full border border-amber-300/60 bg-black/50 flex items-center justify-center text-lg font-black text-amber-200 group-hover:scale-110 transition-transform shadow-inner">
                        ?
                      </div>
                      <span className="relative z-10 text-[8px] font-bold text-amber-100/85 bg-amber-500/15 px-1.5 py-0.5 rounded-full border border-amber-400/35">
                        Virar 🃏
                      </span>
                    </div>

                    {/* FRENTE DA CARTA (CARTAZ REVELADO) */}
                    <div
                      className={`absolute inset-0 rounded-xl overflow-hidden border-2 bg-zinc-950 flex flex-col shadow-[0_16px_38px_rgba(0,0,0,0.9)] ${
                        isActive
                          ? 'border-amber-300 ring-2 ring-amber-300/60 shadow-[0_0_26px_rgba(251,191,36,0.55)]'
                          : 'border-white/30'
                      }`}
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="relative flex-1 overflow-hidden">
                        {poster ? (
                          <img
                            src={poster}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 p-2 text-center text-[10px] font-bold text-zinc-300">
                            {movie.title}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
                        <span
                          className={`absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-black border ${role.className}`}
                        >
                          {role.icon}
                        </span>
                        <span className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 border border-amber-300/45 text-[8px] font-mono font-black text-amber-200">
                          ★{userTxt}
                        </span>
                        <div className="absolute inset-x-1 bottom-1 text-left">
                          <p className="text-[9px] font-black text-white leading-tight line-clamp-2 drop-shadow">
                            {movie.title}
                          </p>
                          <p className="text-[8px] font-mono text-zinc-300 mt-0.5">
                            Crítica {imdbTxt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================================
          3. PALCO CENTRAL FLUTUANTE NO ESCURO
         ================================================================= */}
      <div className="relative z-30 h-full w-full flex flex-col items-center justify-center px-4 sm:px-8 pointer-events-none">
        {/* MODO CERIMÔNIA: HOLOFOTE DO OSCAR OU DA FRAMBOESA */}
        {isCeremony && spotlightMovie ? (
          <div className="pointer-events-auto flex flex-col items-center text-center gap-4 max-w-2xl w-full animate-fadeIn">
            {/* Efeito de Fogos + Palmas (OSCAR) ou Tomates Voando (FRAMBOESA) */}
            {ceremonyMode === 'oscar' && (
              <>
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
                  {FIREWORK_BURSTS.map((fw, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{ left: `${fw.x}%`, top: `${fw.y}%` }}
                    >
                      <span
                        className="block w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
                        style={{
                          background: fw.color,
                          boxShadow: `0 0 28px ${fw.color}`,
                          animation: `dvFireworkCore 1.55s ease-out ${fw.delay} infinite`,
                        }}
                      />
                      {Array.from({ length: 10 }).map((_, rayIdx) => {
                        const deg = rayIdx * 36;
                        return (
                          <span
                            key={rayIdx}
                            className="absolute left-0 top-0 w-1.5 h-4 rounded-full"
                            style={{
                              background: fw.color,
                              boxShadow: `0 0 12px ${fw.color}`,
                              transformOrigin: '50% 0',
                              '--rayRot': `${deg}deg`,
                              animation: `dvFireworkSpark 1.55s cubic-bezier(0.16, 1, 0.3, 1) ${fw.delay} infinite`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}

                  {/* Palmas da Plateia */}
                  {CLAP_POPUPS.map((c, idx) => (
                    <div
                      key={idx}
                      className="absolute text-3xl sm:text-4xl drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)]"
                      style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        '--rot': c.rot,
                        animation: `dvClapCheer 1.1s ease-in-out ${c.delay} infinite`,
                      }}
                    >
                      👏
                    </div>
                  ))}
                </div>
              </>
            )}

            {ceremonyMode === 'razzie' && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
                {TOMATO_PROJECTILES.map((t, idx) => (
                  <div
                    key={idx}
                    className="absolute left-1/2 top-[42%]"
                    style={{
                      '--sx': t.sx,
                      '--sy': t.sy,
                      '--tx': t.tx,
                      '--ty': t.ty,
                      '--rot': t.rot,
                      animation: `dvTomatoThrow 1.35s cubic-bezier(0.22, 1, 0.36, 1) ${t.delay} both`,
                    }}
                  >
                    <span className="text-4xl block drop-shadow-xl">🍅</span>
                  </div>
                ))}
              </div>
            )}

            {/* Título da Premiação */}
            <span
              className={`px-4 py-1.5 rounded-full border text-xs font-mono font-black tracking-[0.22em] uppercase shadow-lg ${stageScript.badgeClass}`}
            >
              {stageScript.badge}
            </span>

            {/* Pôster Único Iluminado no Centro */}
            <div
              className="relative flex flex-col items-center"
              style={
                ceremonyMode === 'razzie'
                  ? { animation: 'dvRazzieShake 0.65s ease-in-out 0.15s both' }
                  : undefined
              }
            >
              {/* Halo de Luz atrás do Pôster */}
              <div
                className="absolute -inset-10 rounded-full blur-3xl opacity-65 pointer-events-none"
                style={{
                  background:
                    ceremonyMode === 'oscar'
                      ? 'radial-gradient(circle, rgba(251,191,36,0.75), rgba(250,204,21,0.12) 68%)'
                      : 'radial-gradient(circle, rgba(244,63,94,0.72), rgba(225,29,72,0.12) 68%)',
                }}
              />

              <div
                className={`relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden border-[3px] shadow-[0_26px_70px_rgba(0,0,0,0.95)] ${
                  ceremonyMode === 'oscar'
                    ? 'border-amber-300 ring-4 ring-amber-400/35'
                    : 'border-rose-400 ring-4 ring-rose-500/35'
                }`}
              >
                {spotlightMovie.posterUrl ? (
                  <img
                    src={resolveWalkMediaUrl(spotlightMovie.posterUrl)}
                    alt={spotlightMovie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center p-4 text-sm font-black text-white">
                    {spotlightMovie.title}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent" />

                {/* Selo Superior no Pôster */}
                <div
                  className={`absolute top-2.5 inset-x-2.5 py-1 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-center shadow-lg ${
                    ceremonyMode === 'oscar'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-950'
                      : 'bg-gradient-to-r from-rose-600 to-red-500 text-white'
                  }`}
                >
                  {ceremonyMode === 'oscar' ? '🏆 OSCAR DO CATÁLOGO' : '🫐 FRAMBOESA DE OURO'}
                </div>

                {/* Tomates esmagados diretamente no pôster em modo Framboesa */}
                {ceremonyMode === 'razzie' && (
                  <>
                    <div
                      className="absolute top-10 left-3 pointer-events-none"
                      style={{ animation: 'dvSplatPop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0.45s both' }}
                    >
                      <TomatoSplatSvg size={54} />
                    </div>
                    <div
                      className="absolute top-20 right-2 pointer-events-none"
                      style={{ animation: 'dvSplatPop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0.7s both' }}
                    >
                      <TomatoSplatSvg size={64} />
                    </div>
                    <div
                      className="absolute bottom-20 left-8 pointer-events-none"
                      style={{ animation: 'dvSplatPop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) 1.05s both' }}
                    >
                      <TomatoSplatSvg size={48} />
                    </div>
                  </>
                )}

                {/* Placar no Rodapé do Pôster */}
                <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                  <p className="text-sm sm:text-base font-black text-white leading-tight drop-shadow">
                    {spotlightMovie.title}{' '}
                    {spotlightMovie.releaseYear ? `(${spotlightMovie.releaseYear})` : ''}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs font-mono font-black">
                    <span className="px-2 py-0.5 rounded bg-black/75 border border-amber-400/50 text-amber-200">
                      Você ★
                      {typeof spotlightMovie.userRating === 'number'
                        ? spotlightMovie.userRating.toFixed(1)
                        : '--'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/75 border border-zinc-600 text-zinc-200">
                      Crítica{' '}
                      {typeof spotlightMovie.imdbRating === 'number'
                        ? spotlightMovie.imdbRating.toFixed(1)
                        : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto da Premiação Escrevendo */}
            <div className="max-w-xl px-4">
              <p className="text-sm sm:text-base font-medium text-zinc-100 leading-relaxed min-h-[3.25rem]">
                {typedText}
                {isTyping && (
                  <span
                    className={`inline-block w-2 h-4 ml-1 align-middle animate-pulse ${
                      ceremonyMode === 'oscar' ? 'bg-amber-300' : 'bg-rose-400'
                    }`}
                  />
                )}
              </p>
            </div>

            {/* Controles da Cerimônia */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleReturnToBoard}
                className="px-4 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/25 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🃏 Voltar aos Cartazes</span>
              </button>
              {ceremonyMode === 'oscar' ? (
                <button
                  type="button"
                  onClick={handleStartRazzie}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-red-500 hover:brightness-110 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
                >
                  <span>🫐 Entregar Framboesa de Ouro!</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartOscar}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-xs font-black text-zinc-950 flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>🏆 Entregar Oscar!</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MODO CARTAS VIRADAS + MÁQUINA DE ESCREVER NO CENTRO */
          <div className="pointer-events-auto flex flex-col items-center text-center gap-3.5 max-w-lg sm:max-w-xl w-full animate-fadeIn">
            <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/45 text-[10px] font-mono font-black uppercase tracking-[0.24em] text-amber-200">
              🌟 TAKE 5 • SHOW DE CARTAZES • {revealedCount}/{deckMovies.length} REVELADOS
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.95)]">
              {star.name}
            </h2>

            {/* Nota da Crítica vs Sua Nota do cartaz clicado */}
            {activeMovie ? (
              <div className="w-full max-w-md rounded-2xl bg-black/75 border border-amber-400/40 p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-left min-w-0">
                    <p className="text-sm font-black text-white truncate">
                      {activeMovie.title}{' '}
                      {activeMovie.releaseYear ? `(${activeMovie.releaseYear})` : ''}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-300 mt-0.5 flex items-center gap-2">
                      <span className="text-amber-300 font-black">
                        Sua Nota: ★
                        {typeof activeMovie.userRating === 'number'
                          ? activeMovie.userRating.toFixed(1)
                          : '7.5'}
                      </span>
                      <span className="text-zinc-600">vs</span>
                      <span className="text-sky-200 font-bold">
                        Crítica:{' '}
                        {typeof activeMovie.imdbRating === 'number'
                          ? activeMovie.imdbRating.toFixed(1)
                          : '7.0'}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-black shrink-0 ${stageScript.badgeClass}`}
                  >
                    {stageScript.badge}
                  </span>
                </div>
              </div>
            ) : (
              <span
                className={`px-3 py-1 rounded-full border text-[10px] font-mono font-black uppercase tracking-wider ${stageScript.badgeClass}`}
              >
                {stageScript.badge}
              </span>
            )}

            {/* Piada escrevendo ao vivo (ao clicar outra carta, limpa na hora e escreve a nova) */}
            <div
              onClick={() => isTyping && setTypedCount((stageScript.text || '').length)}
              className="w-full max-w-lg min-h-[76px] flex items-center justify-center px-3 cursor-pointer"
              title={isTyping ? 'Clique para completar o texto instantaneamente' : ''}
            >
              <p className="text-sm sm:text-base font-serif italic text-amber-100 leading-relaxed drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                “{typedText}
                {isTyping ? (
                  <span className="inline-block w-2 h-4 ml-1 align-middle bg-amber-300 animate-pulse" />
                ) : (
                  '”'
                )}
              </p>
            </div>

            {/* Faixa Mobile Responsiva (em telas pequenas onde não cabem os flancos espalhados) */}
            <div className="md:hidden w-full overflow-x-auto pb-2 flex items-center gap-2.5 px-2">
              {deckMovies.map((movie, idx) => {
                const isFlipped = flippedIds.has(movie.movieId);
                const isActive = Number(activeCardId) === Number(movie.movieId);
                const poster = resolveWalkMediaUrl(movie.posterUrl);
                return (
                  <button
                    key={movie.movieId}
                    type="button"
                    onClick={() => handleCardClick(movie)}
                    className={`shrink-0 w-20 h-28 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? 'border-amber-300 scale-105'
                        : isFlipped
                        ? 'border-white/35'
                        : 'border-amber-400/50 bg-indigo-950/90'
                    }`}
                  >
                    {isFlipped ? (
                      poster ? (
                        <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-white p-1">{movie.title}</span>
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-amber-200">
                        <span className="text-lg font-black">?</span>
                        <span className="text-[9px] font-mono">#{idx + 1}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Botões Principais do Show (Dar Oscar + Dar Framboesa + Utilitários) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={!bestMovie}
                onClick={handleStartOscar}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 disabled:opacity-45 text-zinc-950 font-black text-xs sm:text-sm shadow-[0_0_28px_rgba(251,191,36,0.45)] flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                <span>🏆 Dar o Oscar!</span>
              </button>

              <button
                type="button"
                disabled={!worstMovie}
                onClick={handleStartRazzie}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-500 hover:brightness-110 disabled:opacity-45 text-white font-black text-xs sm:text-sm shadow-[0_0_28px_rgba(244,63,94,0.45)] flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <span>🫐 Dar a Framboesa de Ouro!</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleFlipAll}
                className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-zinc-200 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Virar Todas ({deckMovies.length})</span>
              </button>
              <button
                type="button"
                onClick={handleReshuffle}
                className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-zinc-200 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5 text-sky-300" />
                <span>Reembaralhar Mesa</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dvEclipseBlackout {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes dvShockwave {
          0% { width: 36px; height: 36px; opacity: 0.95; border-width: 5px; }
          100% { width: 145vmax; height: 145vmax; opacity: 0; border-width: 1px; }
        }
        @keyframes dvCardFlight {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate3d(var(--dx), var(--dy), 0) scale(0.2) rotate(0deg);
          }
          25% { opacity: 1; }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1) rotate(var(--tilt));
          }
        }
        @keyframes dvCardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes dvStarTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        @keyframes dvFireworkCore {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.3); }
          25% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.8); }
        }
        @keyframes dvFireworkSpark {
          0% {
            opacity: 0;
            transform: rotate(var(--rayRot)) translateY(0) scaleY(0.4);
          }
          18% { opacity: 1; }
          100% {
            opacity: 0;
            transform: rotate(var(--rayRot)) translateY(-62px) scaleY(1.25);
          }
        }
        @keyframes dvClapCheer {
          0%, 100% { transform: translateY(0) rotate(var(--rot)) scale(1); }
          40% { transform: translateY(-16px) rotate(var(--rot)) scale(1.25); }
          70% { transform: translateY(-4px) rotate(var(--rot)) scale(1.05); }
        }
        @keyframes dvTomatoThrow {
          0% {
            opacity: 0;
            transform: translate(var(--sx), var(--sy)) scale(1.6) rotate(0deg);
          }
          20% { opacity: 1; }
          72% {
            opacity: 1;
            transform: translate(var(--tx), var(--ty)) scale(1.15) rotate(var(--rot));
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(2.1) rotate(var(--rot));
          }
        }
        @keyframes dvSplatPop {
          0% { opacity: 0; transform: scale(0.2) rotate(-25deg); }
          100% { opacity: 0.92; transform: scale(1) rotate(-8deg); }
        }
        @keyframes dvRazzieShake {
          0%, 100% { transform: translateX(0); }
          18% { transform: translateX(-10px) rotate(-2deg); }
          36% { transform: translateX(10px) rotate(2deg); }
          54% { transform: translateX(-7px) rotate(-1.5deg); }
          72% { transform: translateX(6px) rotate(1deg); }
        }
      `}</style>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}
