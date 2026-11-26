/**
 * Catálogo modular de Skins, Poses/Expressões, Fundos, Molduras e Falas do Arlequim.
 * Imagens transparentes em /public/skins/harlequin/<skinId>/<pose>.png
 */

export const HARLEQUIN_POSES_META = [
  {
    id: 'neutral',
    label: 'Neutro',
    shortLabel: 'Neutro',
    icon: '🃏',
    hint: 'Postura padrão de espera na mesa ou no bazar',
  },
  {
    id: 'sad',
    label: 'Triste / Chorando',
    shortLabel: 'Triste',
    icon: '😢',
    hint: 'Reação a Dado 1, fracasso ou carta amarga',
  },
  {
    id: 'happy',
    label: 'Vitória / Jackpot',
    shortLabel: 'Vitória',
    icon: '🏆',
    hint: 'Celebração de Jackpot 20, bênção ou capricho cumprido',
  },
  {
    id: 'curse',
    label: 'Maldição',
    shortLabel: 'Maldição',
    icon: '🩸',
    hint: 'Ativação de armadilha, Lâmina do Eclipse ou Arcano XIII',
  },
];

export const HARLEQUIN_TRIGGERS = [
  {
    id: 'dice_1',
    label: 'Simular Dado 1 (Desastre)',
    shortLabel: 'Dado 1',
    icon: '🎲',
    pose: 'sad',
    cutInTitle: 'CRÍTICO NEGATIVO • DADO 1',
    cutInBadge: 'DESASTRE NA QUIMERA',
    moodTint: 'rgba(244, 63, 94, 0.92)',
    buttonTone: 'border-rose-500/45 bg-rose-950/45 hover:bg-rose-900/55 text-rose-100',
  },
  {
    id: 'jackpot_20',
    label: 'Simular Jackpot 20',
    shortLabel: 'Jackpot 20',
    icon: '🌟',
    pose: 'happy',
    cutInTitle: 'D20 SUPREMO • JACKPOT 20!',
    cutInBadge: 'TRIUNFO CINÉFILO',
    moodTint: 'rgba(245, 158, 11, 0.95)',
    buttonTone: 'border-amber-400/50 bg-amber-950/40 hover:bg-amber-900/55 text-amber-100',
  },
  {
    id: 'curse',
    label: 'Simular Maldição',
    shortLabel: 'Maldição',
    icon: '🩸',
    pose: 'curse',
    cutInTitle: 'MALDIÇÃO DO ARLEQUIM!',
    cutInBadge: 'ARMADILHA ATIVADA',
    moodTint: 'rgba(225, 29, 72, 0.95)',
    buttonTone: 'border-fuchsia-500/45 bg-fuchsia-950/40 hover:bg-fuchsia-900/55 text-fuchsia-100',
  },
  {
    id: 'dubbed_whim',
    label: 'Simular Capricho Dublado',
    shortLabel: 'Capricho Dublado',
    icon: '🎙️',
    pose: 'happy',
    cutInTitle: 'CAPRICHO DO ARLEQUIM!',
    cutInBadge: 'SESSÃO DUBLADA • BÔNUS',
    moodTint: 'rgba(16, 185, 129, 0.92)',
    buttonTone: 'border-emerald-400/45 bg-emerald-950/40 hover:bg-emerald-900/55 text-emerald-100',
  },
];

export const HARLEQUIN_BACKDROPS = {
  casino_spotlight: {
    id: 'casino_spotlight',
    name: 'Veludo & Holofote',
    shortName: 'Holofote',
    icon: '🎬',
    desc: 'Feixe de projetor 35mm atravessando a sala esmeralda da Sessão Secreta.',
    cardBg: 'radial-gradient(circle at 50% 18%, rgba(16,185,129,0.28) 0%, rgba(11,34,26,0.92) 48%, #050a08 100%)',
    stageBg: 'radial-gradient(ellipse at 50% 24%, rgba(16,185,129,0.22) 0%, #091310 56%, #040607 100%)',
    accent: '#10b981',
    defaultWeather: { rain: false, fog: false, lightning: false, embers: true },
  },
  magneto_storm: {
    id: 'magneto_storm',
    name: 'Tempestade Magnética',
    shortName: 'Magnético',
    icon: '⚡',
    desc: 'Anéis gravitacionais, campo violeta e descargas elétricas em órbita.',
    cardBg: 'radial-gradient(circle at 50% 35%, rgba(168,85,247,0.34) 0%, rgba(76,29,149,0.45) 45%, #0c0614 100%)',
    stageBg: 'radial-gradient(ellipse at 50% 32%, rgba(168,85,247,0.28) 0%, #140922 55%, #06040a 100%)',
    accent: '#a855f7',
    defaultWeather: { rain: false, fog: false, lightning: true, embers: true },
  },
  noir_rain: {
    id: 'noir_rain',
    name: 'Beco Chuvoso Noir',
    shortName: 'Chuva Noir',
    icon: '🌧️',
    desc: 'Poste âmbar distante, neblina baixa e chuva pesada na madrugada.',
    cardBg: 'linear-gradient(180deg, #0b111a 0%, #151821 48%, #090a0d 100%)',
    stageBg: 'radial-gradient(ellipse at 72% 18%, rgba(212,163,89,0.18) 0%, #0b1018 50%, #040508 100%)',
    accent: '#d4a359',
    defaultWeather: { rain: true, fog: true, lightning: false, embers: false },
  },
  holo_vault: {
    id: 'holo_vault',
    name: 'Cofre Prisma Holo',
    shortName: 'Prisma Holo',
    icon: '🌈',
    desc: 'Reflexo prismático iridescente estilo carta mítica de colecionador.',
    cardBg: 'linear-gradient(145deg, rgba(56,189,248,0.26) 0%, rgba(168,85,247,0.28) 48%, rgba(251,191,36,0.22) 100%)',
    stageBg: 'radial-gradient(ellipse at center, rgba(56,189,248,0.18) 0%, rgba(19,14,32,0.95) 58%, #05050a 100%)',
    accent: '#38bdf8',
    defaultWeather: { rain: false, fog: false, lightning: false, embers: true },
  },
  sertanejo_dourado: {
    id: 'sertanejo_dourado',
    name: 'Sertão Dourado & Sol 35mm',
    shortName: 'Sertão 35mm',
    icon: '☀️',
    desc: 'Poente dourado de cinema novo brasileiro com poeira quente e brisa de cordel.',
    cardBg: 'radial-gradient(circle at 50% 24%, rgba(245,158,11,0.34) 0%, rgba(120,53,15,0.52) 48%, #180c05 100%)',
    stageBg: 'radial-gradient(ellipse at 50% 28%, rgba(251,191,36,0.28) 0%, #241206 58%, #090503 100%)',
    accent: '#f59e0b',
    defaultWeather: { rain: false, fog: false, lightning: false, embers: true },
  },
  eclipse_terror: {
    id: 'eclipse_terror',
    name: 'Eclipse Sangrento & Corrente',
    shortName: 'Eclipse Rubro',
    icon: '🩸',
    desc: 'Lua vermelha sobre estúdio amaldiçoado, névoa fúnebre e relâmpagos escarlates.',
    cardBg: 'radial-gradient(circle at 50% 25%, rgba(225,29,72,0.42) 0%, rgba(127,29,29,0.42) 40%, #14050c 76%, #060205 100%)',
    stageBg: 'radial-gradient(ellipse at 50% 26%, rgba(225,29,72,0.32) 0%, #19070d 56%, #050204 100%)',
    accent: '#e11d48',
    defaultWeather: { rain: false, fog: true, lightning: true, embers: true },
  },
  clean_stage: {
    id: 'clean_stage',
    name: 'Palco Sombrio Minimalista',
    shortName: 'Minimalista',
    icon: '🌑',
    desc: 'Fundo escuro minimalista para destacar 100% o contorno recortado da skin.',
    cardBg: 'radial-gradient(circle at 50% 40%, #1b1b24 0%, #0b0b10 70%, #050507 100%)',
    stageBg: 'radial-gradient(ellipse at center, #14141b 0%, #08080c 68%, #040406 100%)',
    accent: '#a1a1aa',
    defaultWeather: { rain: false, fog: false, lightning: false, embers: false },
  },
};

export const HARLEQUIN_FRAMES = {
  velvet_casino: {
    id: 'velvet_casino',
    name: 'Carta Real ♠♦',
    shortName: 'Carta Real',
    icon: '♠',
    desc: 'Borda dupla clássica de baralho com cantoneiras douradas e naipes.',
  },
  magneto_forge: {
    id: 'magneto_forge',
    name: 'Aço Magnetizado',
    shortName: 'Magneto',
    icon: '🧲',
    desc: 'Armadura metálica escarlate/violeta com brilho elétrico nas bordas.',
  },
  noir_deco: {
    id: 'noir_deco',
    name: 'Art Déco Dourada',
    shortName: 'Art Déco',
    icon: '🕯️',
    desc: 'Moldura vintage de cinema 1940 com cantoneiras douradas.',
  },
  prism_holo: {
    id: 'prism_holo',
    name: 'Holográfica Mítica',
    shortName: 'Holográfica',
    icon: '💎',
    desc: 'Borda arco-íris animada e película holofoil deslizando na carta.',
  },
  cangaco_couro: {
    id: 'cangaco_couro',
    name: 'Couro & Sol Nordestino',
    shortName: 'Couro & Sol',
    icon: '☀️',
    desc: 'Costura artesanal em couro curtido com estrelas douradas de chapéu de cangaço.',
  },
  slasher_arame: {
    id: 'slasher_arame',
    name: 'Arame Farpado & Sangue',
    shortName: 'Arame Rubro',
    icon: '⛓️',
    desc: 'Moldura cortante carmesim com selos de película amaldiçoada e alerta vermelho.',
  },
};

export const HARLEQUIN_BACKDROPS_LIST = Object.values(HARLEQUIN_BACKDROPS);
export const HARLEQUIN_FRAMES_LIST = Object.values(HARLEQUIN_FRAMES);

export const HARLEQUIN_SKINS = {
  classic: {
    id: 'classic',
    name: 'Arlequim Clássico (Sem Skin)',
    title: 'Croupier da Sala Particular',
    personaBadge: 'Padrão • Sem Skin Equipada',
    rarityLabel: 'Inicial / Grátis',
    themeColor: '#10b981',
    secondaryColor: '#fbbf24',
    defaultBackdrop: 'casino_spotlight',
    defaultFrame: 'velvet_casino',
    cutInEyePosition: '50% 17%',
    cutInScale: 2.05,
    bustCrop: { scale: 2.25, origin: '50% 14%', objectPos: '50% 16%' },
    lore: 'O Arlequim em sua forma original: um croupier sarcástico que vive entre as mesas da Sessão Secreta e o Bazar 35mm observando suas apostas.',
    reference: 'Mascote Original do Catálogo & Tarô Arcano 0 (O Louco)',
    likes: 'Apostas arriscadas, filmes fora da caixinha e ver você suar na Quimera.',
    tone: 'Sarcástico, provocador, brincalhão e imprevisível',
    dialoguesPending: false,
    description:
      'Traje clássico preto e branco quadriculado, cauda esmeralda com guizos e humor afiado sobre suas escolhas.',
    poses: {
      neutral: {
        image: '/skins/harlequin/classic/neutral.png',
        cutInPosition: '50% 17%',
        cardPosition: '50% 18%',
        hasCustomArt: true,
      },
    },
    dialogues: {
      neutral: [
        'Embaralhei uns filmes que EU gosto. Se você vai gostar? Bom, os sinos já disseram que não é problema meu.',
        'Olhe só para você encarando o feltro… puxa logo uma carta antes que o rolo queime.',
        'Bons filmes, bombas escondidas e uma pitada de caos. Tudo em perfeito equilíbrio.',
      ],
      sad: [
        'Essa doeu até em mim… quer dizer, quase. Melhor rolar de novo quando a poeira baixar.',
        'Um desastre desses merecia trilha de violino triste. Quer tentar um Bumerangue na próxima?',
      ],
      happy: [
        'Ha! Sabia que até você acertava uma hora ou outra — aproveita o brilho antes que eu mude de ideia.',
        'Sessão digna de aplausos de pé. E olha que eu sou bem difícil de impressionar!',
      ],
      curse: [
        'Surpresa! Você realmente achou que todas as cartas da mesa eram gentis?',
        'Corte na película, corte no XP. Relaxa — sobreviver à armadilha também faz parte do espetáculo.',
      ],
      dice_1: [
        'Dado 1?! Até meus guizos ficaram em silêncio de vergonha alheia… boa sorte nessa tragédia.',
        'Parabéns, você tirou o pior resultado possível. Vou pegar a pipoca pra assistir isso!',
      ],
      jackpot_20: [
        'VINTE NATURAL! Tá bom, tiro meu chapéu invisível — o palco hoje é todo seu!',
        'Jackpot máximo! Só não vai se acostumar, porque na próxima quinzena eu embaralho mais pesado.',
      ],
      dubbed_whim: [
        'Hoje estou com preguiça de ler legenda: vê esse DUBLADO que eu solto um bônus caprichado!',
        'Quero ouvir a dublagem clássica ecoando na sala — cumpra meu capricho e colha a recompensa.',
      ],
      poke: [
        'Ei! Tira o dedo da carta — eu não sou um botão de sorteio, eu sou o croupier!',
        'Mais um clique desses e eu coloco três terror trash de 1974 seguidos na sua mão!',
        'Tlim-tlim! Gostou do barulho do sino, né? Pois o baralho continua implacável.',
      ],
    },
  },

  magneto: {
    id: 'magneto',
    name: 'Magneto Cinéfilo',
    title: 'Soberano do Magnetismo 35mm',
    personaBadge: '1ª Skin Oficial • Já Liberada',
    rarityLabel: 'Lendária',
    themeColor: '#a855f7',
    secondaryColor: '#ef4444',
    defaultBackdrop: 'magneto_storm',
    defaultFrame: 'magneto_forge',
    cutInEyePosition: '50% 23%',
    cutInScale: 2.15,
    bustCrop: { scale: 2.05, origin: '50% 19%', objectPos: '50% 21%' },
    lore: 'O Arlequim gosta tanto do Magneto que pediu uma roupa emprestada para o próprio Erik Lehnsherr — mas acabou absorvendo junto o orgulho, a gravidade e a personalidade inteira dele.',
    reference: 'Magneto (X-Men / Sir Ian McKellen & Michael Fassbender) + Cartas Carregadas',
    likes: 'Ama Sci-Fi, Ação, X-Men, Marvel, Reino Unido e Troféus de Prata/Mítico; corneta comédia romântica leve e notas < 6 em X-Men.',
    tone: 'Imperial, dramático, solene e intenso (130 falas ativas pelo site)',
    dialoguesPending: false,
    description:
      'Capacete de bobo da corte escarlate com guizos, peitoral M dourado, ombreiras de película 35mm e cartas carregadas de raios violetas.',
    poses: {
      neutral: {
        image: '/skins/harlequin/magneto/neutral.png',
        cutInPosition: '50% 23%',
        cardPosition: '50% 21%',
        hasCustomArt: true,
      },
    },
    dialogues: {
      neutral: [
        'Os carretéis de metal obedecem à minha vontade. Escolha um filme digno da sétima arte.',
        'Cartas, engrenagens e película 35mm… tudo neste catálogo orbita o meu campo magnético.',
        'Alguns catálogos são guiados pela sorte. O seu é dobrado pela gravidade do meu cinema.',
        'Com um gesto eu puxo a melhor obra da fila — resta saber se você aguenta o impacto.',
        'Não procuro filmes comuns. Quero obras que façam o metal do projetor tremer.',
      ],
      sad: [
        'Uma falha indigna de alinhamento. Meus carretéis quase enferrujaram assistindo a isso.',
        'De tanta coisa grandiosa no cinema… você foi atrair justo ferro-velho sem peso?',
        'Se for para desperdiçar meu campo magnético com mediocridade, prefiro descansar no capacete.',
        'Até meu manto perdeu o brilho diante de uma escolha tão apática.',
      ],
      happy: [
        'Esplêndido! A película inteira se curvou à nossa supremacia cinematográfica!',
        'Isso não foi sorte — foi gravidade pura atraindo uma obra-prima para a fila.',
        'Veja como até os guizos do meu elmo brilham quando você faz uma escolha soberana.',
        'Brilhante! Assim até me dá vontade de manter os reatores ligados a noite inteira.',
      ],
      curse: [
        'Sinta o peso da película invertida! Somente cinéfilos fortes sobrevivem a uma provação assim.',
        'Desativei suas proteções por diversão. Mostre do que você é feito sem escudo!',
        'Nenhuma coroa se mantém em cabeça fraca — encare a tempestade sem chorar.',
      ],
      dice_1: [
        'Um [[red:1]] miserável?! Alguém interferiu no meu campo magnético… enfrente o pesadelo de cabeça erguida!',
        'Até o melhor plano encontra interferência. Prove que merece o título de Soberano!',
      ],
      jackpot_20: [
        '[[gold:VINTE NATURAL]]! Veja como os astros e os carretéis se alinham diante da supremacia!',
        'Perfeição magnética! Cada pilar, cada frame, tudo dobrado ao nosso favor!',
      ],
      dubbed_whim: [
        'Ordem suprema da sessão: assista DUBLADO! Boas vozes carregam presença absoluta.',
        'Quero a potência da dublagem preenchendo a sala — cumpra o decreto e receba seu tributo.',
      ],
      poke: [
        'Você ousa cutucar o capacete do Soberano?! Cuidado para seus anéis não entortarem.',
        'Esse tilintar não é brinquedo — é descarga pura de magnetismo 35mm!',
        'Mais um toque no meu elmo e eu troco todos os seus romances por ficção científica dos anos 80.',
        'Sim, eu uso guizos de ferro e correntes nos pés. E ainda assim comando a mesa melhor que você.',
        'Cutuque de novo e eu alinho todas as suas próximas cartas para só cair drama pesado!',
      ],
    },
  },

  brasileiro: {
    id: 'brasileiro',
    name: 'Arlequim Brasileiro',
    title: 'Malandro do Sertão & Cinema Novo',
    personaBadge: '2ª Skin Oficial • Pátria Amada 35mm',
    rarityLabel: 'Lendária',
    themeColor: '#f59e0b',
    secondaryColor: '#10b981',
    defaultBackdrop: 'sertanejo_dourado',
    defaultFrame: 'cangaco_couro',
    cutInEyePosition: '50% 18%',
    cutInScale: 2.1,
    bustCrop: { scale: 2.15, origin: '50% 16%', objectPos: '50% 18%' },
    lore: 'Depois de maratonar O Auto da Compadecida, Cidade de Deus e uma pilha de clássicos nacionais com rádio de pilha ligado, o Arlequim trocou o xadrez europeu por chapéu de couro e camisa de retalhos.',
    reference: 'Cinema Nacional, Cangaço, Auto da Compadecida, Central do Brasil & Dublagem BR',
    likes: 'Ama filmes do Brasil, dublagem clássica brasileira, comédias nacionais e calor humano na tela.',
    tone: 'Espirituoso, acolhedor, debochado e orgulhoso da cultura brasileira (falas completas em breve)',
    dialoguesPending: true,
    description:
      'Chapéu de cangaceiro com guizos, colete de couro artesanal, camisa de retalhos, rádio retrô, claquete e cartas de cinema brasileiro flutuando.',
    poses: {
      neutral: {
        image: '/skins/harlequin/brasileiro/neutral.png',
        cutInPosition: '50% 18%',
        cardPosition: '50% 18%',
        hasCustomArt: true,
      },
    },
    dialogues: {
      neutral: [
        'Bota um cafezinho coado e um filminho nacional na roda que hoje a sessão promete, meu patrão!',
        'Com chapéu de couro e película brasileira na mão, até carta difícil vira história boa de contar!',
      ],
      happy: [
        'Aí sim, rapaz! Coisa linda de se ver — merece até música de festa no radinho de pilha!',
      ],
      sad: [
        'Oxente… que filme murcho foi esse? Até o galo da carta abaixou a crista!',
      ],
      poke: [
        'Ôxe, tira o dedo do meu chapéu de couro que esse aqui deu trabalho pra bordar!',
      ],
    },
  },

  terror: {
    id: 'terror',
    name: 'Colecionador de Pesadelos',
    title: 'Síndico do Corredor Escuro',
    personaBadge: '3ª Skin Oficial • Horror & Slasher',
    rarityLabel: 'Mítica',
    themeColor: '#e11d48',
    secondaryColor: '#991b1b',
    defaultBackdrop: 'eclipse_terror',
    defaultFrame: 'slasher_arame',
    cutInEyePosition: '50% 21%',
    cutInScale: 2.15,
    bustCrop: { scale: 2.1, origin: '50% 18%', objectPos: '50% 20%' },
    lore: 'Enrolado em arame farpado e película 35mm amaldiçoada, o Arlequim entrou no porão de todos os clássicos de terror ao mesmo tempo — e saiu de lá sorrindo com uma tesoura dourada e balões vermelhos.',
    reference: 'Jason Voorhees, It (A Coisa), Corra/Jordan Peele, O Iluminado & Clube da Insônia',
    likes: 'Ama Terror, Suspense, Slashers, trash de 1974 e comemora até quando você tira 1 no D20.',
    tone: 'Macabro, sorridente, perturbado e apaixonado por filmes de susto (falas completas em breve)',
    dialoguesPending: true,
    description:
      'Envolto em película cortante e arame farpado sobre engrenagens ensanguentadas, segurando tesoura dourada, máscara de hóquei e balões vermelhos.',
    poses: {
      neutral: {
        image: '/skins/harlequin/terror/neutral.png',
        cutInPosition: '50% 21%',
        cardPosition: '50% 20%',
        hasCustomArt: true,
      },
    },
    dialogues: {
      neutral: [
        'Hihihi… apagou a luz da sala? Ótimo. Os melhores filmes começam quando você jura ter ouvido um barulho no corredor.',
        'Tesoura afiada, balões vermelhos e um porão cheio de rolos de filme… vamos brincar de cinema de horror?',
      ],
      happy: [
        'Que grito maravilhoso! Sangue falso, suspense e tensão na medida — é disso que eu gosto!',
      ],
      sad: [
        'Nenhum susto? Nenhuma cena no escuro? Você me decepcionou profundamente…',
      ],
      poke: [
        'Cuidado onde encosta o dedo… esse arame farpado e essa tesoura não são de mentira, hihihi!',
      ],
    },
  },
};

export const HARLEQUIN_SKINS_LIST = Object.values(HARLEQUIN_SKINS);

export function getHarlequinSkinById(skinId) {
  return HARLEQUIN_SKINS[skinId] || HARLEQUIN_SKINS.classic;
}

export function resolveSkinPose(skin, poseId = 'neutral') {
  const safeSkin = skin || HARLEQUIN_SKINS.classic;
  const requested = safeSkin.poses?.[poseId];
  const fallback = safeSkin.poses?.neutral || HARLEQUIN_SKINS.classic.poses.neutral;
  const active = requested || fallback;
  return {
    skinId: safeSkin.id,
    requestedPose: poseId,
    resolvedPose: requested ? poseId : 'neutral',
    hasCustomArt: Boolean(requested?.hasCustomArt),
    isFallback: !requested,
    isFullCardArt: Boolean(active.isFullCardArt || safeSkin.isFullCardArt),
    image: active.image,
    cutInPosition: active.cutInPosition || safeSkin.cutInEyePosition || '50% 18%',
    cardPosition: active.cardPosition || '50% 18%',
    bustCrop: safeSkin.bustCrop || { scale: 2.0, origin: '50% 16%', objectPos: '50% 18%' },
  };
}

export function pickSkinDialogue(skin, key = 'neutral', seed = 0) {
  const safeSkin = skin || HARLEQUIN_SKINS.classic;
  const list =
    (Array.isArray(safeSkin.dialogues?.[key]) && safeSkin.dialogues[key].length > 0
      ? safeSkin.dialogues[key]
      : safeSkin.dialogues?.neutral) || [];
  if (list.length === 0) return 'O Arlequim observa a mesa em silêncio.';
  return list[Math.abs(Number(seed) || 0) % list.length];
}

export const HARLEQUIN_BUBBLE_STYLES = {
  classic: {
    id: 'classic',
    name: 'Mesa Clássica ♠♦',
    desc: 'Veludo esmeralda tradicional da Sessão Secreta com marca d’água dos naipes.',
    tag: '🎩 CRUPIÊ DA MESA',
    bg: 'linear-gradient(135deg, #0b1b15 0%, #142a21 55%, #090d0b 100%)',
    border: '#10b981',
    accent: '#34d399',
    subAccent: '#fbbf24',
    watermark: '♠ ♦ ♣',
    fontClass: 'font-sans',
  },
  magneto: {
    id: 'magneto',
    name: 'Soberano Magnético 35mm',
    desc: 'Caixa escarlate e violeta carregada de raios com timbre grave 250Hz.',
    tag: '🧲 SOBERANO 35MM',
    bg: 'linear-gradient(135deg, #270a19 0%, #220b38 56%, #0d0a14 100%)',
    border: '#ef4444',
    accent: '#f87171',
    subAccent: '#c084fc',
    watermark: 'M • ⚡',
    fontClass: 'font-sans',
  },
  brasileiro: {
    id: 'brasileiro',
    name: 'Cordel & Rádio 35mm',
    desc: 'Tons quentes de couro dourado e verde-brasil inspirados em cordel e rádio retrô.',
    tag: '☀️ MALANDRO 35MM',
    bg: 'linear-gradient(135deg, #261505 0%, #1c240d 55%, #0b140d 100%)',
    border: '#f59e0b',
    accent: '#fbbf24',
    subAccent: '#34d399',
    watermark: '☀ 35MM ★',
    fontClass: 'font-sans',
  },
  terror: {
    id: 'terror',
    name: 'Fita Maldita Rubra',
    desc: 'Balão sombrio carmesim com borda sangrenta e tipografia de horror.',
    tag: '🩸 SÍNDICO DO TERROR',
    bg: 'linear-gradient(135deg, #24040a 0%, #170612 58%, #070305 100%)',
    border: '#e11d48',
    accent: '#fb7185',
    subAccent: '#ef4444',
    watermark: '✕ 666 🩸',
    fontClass: 'font-serif',
  },
  noir: {
    id: 'noir',
    name: 'Jornal Vintage 1940',
    desc: 'Sépia chuvoso com tipografia clássica serifada dos filmes policiais.',
    tag: '🕯️ CRÔNICA 1940',
    bg: 'linear-gradient(135deg, #111115 0%, #1b1b21 58%, #08080a 100%)',
    border: '#d4a359',
    accent: '#fde68a',
    subAccent: '#94a3b8',
    watermark: 'NOIR • 35MM',
    fontClass: 'font-serif',
  },
  holo_prism: {
    id: 'holo_prism',
    name: 'Prisma Arco-Íris Holo',
    desc: 'Balão prismático ciano/violeta para combinar com molduras holográficas míticas.',
    tag: '💎 PRISMA HOLO',
    bg: 'linear-gradient(135deg, #0b1d2e 0%, #1e1038 54%, #1a1709 100%)',
    border: '#38bdf8',
    accent: '#7dd3fc',
    subAccent: '#facc15',
    watermark: '◈ PRISM ◈',
    fontClass: 'font-sans',
  },
};

export const HARLEQUIN_BUBBLE_STYLES_LIST = Object.values(HARLEQUIN_BUBBLE_STYLES);

export const HARLEQUIN_SHOPKEEPER_BUBBLE_STYLE = {
  id: 'shopkeeper',
  tag: '🛒 BALCÃO CONTRA-SKIN',
  bg: 'linear-gradient(135deg, #1f1407 0%, #291a0d 55%, #0d0b0a 100%)',
  border: '#f59e0b',
  accent: '#fbbf24',
  subAccent: '#fb7185',
  watermark: 'BAZAR',
  fontClass: 'font-sans',
};

export const HARLEQUIN_RPG_SHOP_KEEPER = {
  id: 'shopkeeper',
  name: 'Arlequim Mercador • Balcão Contra-Skin',
  title: 'Proprietário do Empório Clandestino 35mm',
  badge: '🛒 VENDEDOR SINCERICÍDIO • PSICOLOGIA REVERSA',
  image: '/skins/harlequin/shopkeeper/merchant.jpg',
  welcomeLines: [
    'Bem-vindo ao [[gold:Empório Clandestino 35mm]]. Olhe à vontade, encoste nas prateleiras… só não me culpe se eu tentar te convencer a [[red:não]] gastar suas fichas.',
    'Ah, um cliente de verdade! Tudo aqui foi contrabandeado entre uma sessão da madrugada e um D20 viciado. O que vai querer inspecionar?',
    'Atenção: vitrine 100% conceitual por enquanto! Aproveite para experimentar os itens antes de eu começar a cobrar de verdade no seu bolso.',
  ],
  haggleLines: [
    'Desconto?! Eu já estou quase pagando para você [[cyan:não]] levar essas armadilhas! Preço tabelado pelo Sindicato dos Guizos.',
    'Se pedir desconto de novo no meu balcão, eu subo o preço em [[gold:+200 fichas]] só para testar sua força de vontade!',
    'Olha a audácia… pechinchando em empório clandestino? Tudo bem, leva um sorriso debochado de brinde — grátis!',
  ],
  dailyDealLines: [
    'Oferta Misteriosa do Dia: o item que [[purple:menos]] combina com o seu histórico, embrulhado em veludo dourado e zero garantia!',
    'Quer a recomendação honesta da casa hoje? Feche a carteira, puxe um filme bom e ignore quase metade dessa estante!',
    'Segredo de balcão: se eu recomendei algo aqui, desconfie. Se eu proibi você de comprar… provavelmente é o melhor item da loja.',
  ],
  insufficientFundsLines: [
    'Carteira zerada, viajante! Clique em [[gold:+1.000 Fichas (Teste)]] ali no topo ou resete o carrinho para continuar brincando no empório.',
    'Sem fichas simuladas suficientes para essa extravagância! Até no mundo fictício o banqueiro fecha o cofre quando o saldo acaba.',
  ],
  alreadyOwnedLines: [
    'Ei, isso aí já foi para a sua sacola simulada! Quer pagar duas vezes pela mesma peça só para me deixar feliz?',
  ],
  afterBuyDefaultLines: [
    'Comprou mesmo?! Pois bem… [[gold:negócio fechado]] na simulação! Depois não diga que o lojista não avisou.',
    'Ouro no cofre do Arlequim! Guarde sua nova relíquia com carinho — e prepara o XP quando a loja abrir de verdade.',
  ],
  rerollLines: [
    'Girei a placa de desconto! [[gold:-20%]] em um item que você provavelmente não devia levar.',
    'Clac-clac-clac! Embaralhei a etiqueta dourada de [[gold:PROMO -20%]] no tapete. Agora quero ver sua força de vontade!',
    'Alavanca puxada! Troquei a pechincha do balcão — se não aproveitar antes do próximo giro, o problema é seu.',
  ],
  tryOnLines: [
    'Ficou bonito no espelho, hein? Pena que no espelho é de graça e no balcão custa ficha!',
    'Olha só posando no camarim 35mm… já vestiu metade da vitrine e ainda não abriu a bolsa de moedas!',
  ],
};

import { XP_BAR_SKINS } from './xpBarSkins.js';

export const GUILD_BAZAAR_CATEGORIES = [
  { id: 'all', label: '✦ TUDO' },
  { id: 'powers', label: '⚡ PODERES' },
  { id: 'xp_bars', label: '🌈 BARRA DE XP' },
  { id: 'relics', label: '🏺 RELÍQUIAS' },
  { id: 'monthly', label: '📅 MENSAIS DA GUILDA' },
  { id: 'skins', label: '🎭 SKINS' },
  { id: 'backdrops', label: '🌌 FUNDOS' },
  { id: 'frames', label: '🖼️ MOLDURAS' },
  { id: 'bubbles', label: '💬 BALÕES DE FALA' },
];

export const GUILD_BAZAAR_RARITIES = {
  common: {
    id: 'common',
    label: 'Comum',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/45',
    badgeClass: 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200',
    glowColor: '#10b981',
  },
  rare: {
    id: 'rare',
    label: 'Rara',
    textClass: 'text-sky-300',
    borderClass: 'border-sky-400/50',
    badgeClass: 'bg-sky-500/15 border-sky-400/50 text-sky-200',
    glowColor: '#38bdf8',
  },
  epic: {
    id: 'epic',
    label: 'Épica',
    textClass: 'text-purple-300',
    borderClass: 'border-purple-400/55',
    badgeClass: 'bg-purple-500/20 border-purple-400/55 text-purple-200',
    glowColor: '#a855f7',
  },
  legendary: {
    id: 'legendary',
    label: 'Lendária',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-400/65',
    badgeClass: 'bg-amber-500/20 border-amber-400/60 text-amber-200',
    glowColor: '#f59e0b',
  },
  mythic: {
    id: 'mythic',
    label: 'Mítica',
    textClass: 'text-rose-300',
    borderClass: 'border-rose-400/70',
    badgeClass: 'bg-rose-500/20 border-rose-400/65 text-rose-200',
    glowColor: '#f43f5e',
  },
};

export const HARLEQUIN_RPG_SHOP_RARITIES = GUILD_BAZAAR_RARITIES;

export const GUILD_BAZAAR_ITEMS = [
  // =========================================================================
  // 10 ITENS MENSAIS REAIS DA GUILDA
  // =========================================================================
  {
    id: 'monthly_secret_draw_chip',
    name: '+1 Ficha da Sessão Secreta',
    shortName: 'Ficha Secreta',
    subtitle: 'Suprimento Mensal Real • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'secret_draw_chip',
    rarity: 'epic',
    priceCoins: 280,
    monthlyLimit: 1,
    icon: '🎟️',
    accent: '#e879f9',
    modeLabel: 'Sessão Secreta',
    soundMood: 'happy',
    description:
      'Deposita imediatamente +1 Ficha de Sorteio real na sua mesa da Sessão Secreta para abrir mais uma rodada de cartas.',
    merchantLines: [
      'Mais uma ficha na Sessão Secreta? Só me avisa antes para eu esconder as piores bombas no fundo do baralho!',
      'Comprar sorteio extra todo mês é fácil… difícil é aguentar o que sai quando você vira a terceira carta!',
    ],
    afterBuyLine:
      '[[gold:+1 Ficha da Sessão Secreta]] caiu direto na sua mesa! Vai lá testar sua sorte agora.',
  },
  {
    id: 'monthly_chimera_forge',
    name: '+1 Ficha de Criação de Quimera',
    shortName: 'Forja Quimera',
    subtitle: 'Suprimento Mensal Real • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'chimera_forge_chip',
    rarity: 'epic',
    priceCoins: 280,
    monthlyLimit: 1,
    icon: '🧬',
    accent: '#10b981',
    modeLabel: 'Quimera Cinéfila',
    soundMood: 'happy',
    description:
      'Concede +1 Ficha de Forja real na Quimera Cinéfila para despertar uma nova criatura D20 + Cartas de Tarô.',
    merchantLines: [
      'Quer forjar mais uma Quimera neste mês?! Cuidado com o Dado 1 e com a carta do [[purple:Louco]] espreitando o baralho!',
      'Ficha quentinha saída da bigorna… só não reclama comigo se vier ano 1958 + Tag Noir!',
    ],
    afterBuyLine:
      'Bigorna liberada: [[emerald:+1 Ficha de Quimera]] pronta para invocar sua próxima criatura!',
  },
  {
    id: 'monthly_bingo_board',
    name: '+1 Cartela de Pergaminho 4×4',
    shortName: 'Cartela 4×4',
    subtitle: 'Suprimento Mensal Real • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'bingo_forge_chip',
    rarity: 'legendary',
    priceCoins: 320,
    monthlyLimit: 1,
    icon: '📜',
    accent: '#fbbf24',
    modeLabel: 'Pergaminhos 4×4',
    soundMood: 'happy',
    description:
      'Entrega +1 Ficha de Remessa real nos Pergaminhos da Guilda para abrir uma cartela 4×4 inédita com 16 contratos.',
    merchantLines: [
      'Cartela extra dos Pergaminhos! O banqueiro até ajeitou os óculos para carimbar mais 16 contratos para você!',
      'Lacre fileiras e tente o Grande Sinete — essa aqui realmente rende XP pesado se completar!',
    ],
    afterBuyLine:
      '[[gold:+1 Cartela de Pergaminho]] carimbada! O banqueiro já abriu espaço na mesa da Guilda.',
  },
  {
    id: 'monthly_secret_boomerang',
    name: '+1 Bumerangue da Sessão Secreta',
    shortName: 'Bumerangue',
    subtitle: 'Suprimento Mensal Real • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'secret_boomerang_chip',
    rarity: 'rare',
    priceCoins: 220,
    monthlyLimit: 1,
    icon: '🪃',
    accent: '#38bdf8',
    modeLabel: 'Sessão Secreta',
    soundMood: 'neutral',
    description:
      'Adiciona +1 Ficha Bumerangue na Sessão Secreta para devolver filmes escolhidos e tentar outra carta.',
    merchantLines: [
      'Se jogar esse Bumerangue de madeira na minha vitrine… ele volta direto na sua testa! Tem certeza?',
      'Para quem adora devolver carta que já aceitou na Sessão Secreta… confesso que salva peles!',
    ],
    afterBuyLine:
      '[[cyan:+1 Bumerangue]] no bolso da Sessão Secreta! Use com sabedoria na próxima rodada.',
  },
  {
    id: 'monthly_chimera_decline',
    name: '+1 Declínio da Quimera',
    shortName: 'Declínio D20',
    subtitle: 'Suprimento Mensal Real • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'chimera_decline_chip',
    rarity: 'rare',
    priceCoins: 220,
    monthlyLimit: 1,
    icon: '🛡️',
    accent: '#fb7185',
    modeLabel: 'Quimera Cinéfila',
    soundMood: 'neutral',
    description:
      'Credita +1 Ficha de Declínio na Quimera Cinéfila para recusar um contrato impossível sem dor de cabeça.',
    merchantLines: [
      'Comprando um escudo para fugir da Quimera? Não julgo… às vezes o D20 acorda de mau humor mesmo!',
      'Vale ouro quando aquela Quimera pede 4 pilares que nem existem juntos!',
    ],
    afterBuyLine:
      '[[red:+1 Declínio da Quimera]] guardado na manga para emergências na bigorna!',
  },
  {
    id: 'monthly_bingo_upgrade',
    name: '+1 Sinete +Dificuldade (Pergaminho)',
    shortName: '+Dif Pergaminho',
    subtitle: 'Suprimento Mensal Real • Limite 3/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'bingo_upgrade_chip',
    rarity: 'rare',
    priceCoins: 140,
    monthlyLimit: 3,
    icon: '🔺',
    accent: '#f97316',
    modeLabel: 'Pergaminhos 4×4',
    soundMood: 'happy',
    description:
      'Adiciona +1 ficha de Aumentar Dificuldade nos Pergaminhos para turbinar contratos e multiplicar a recompensa.',
    merchantLines: [
      'Quer deixar o pergaminho AINDA mais difícil de propósito?! Eu gosto de cliente corajoso!',
      'Pode levar até [[gold:3 desses por mês]] — só aguenta o tranco dos contratos turbinados depois!',
    ],
    afterBuyLine:
      '[[gold:+1 Sinete +Dificuldade]] entregue! Vai lá transformar contrato fácil em desafio épico.',
  },
  {
    id: 'monthly_bingo_downgrade',
    name: '+1 Sinete -Dificuldade (Pergaminho)',
    shortName: '-Dif Pergaminho',
    subtitle: 'Suprimento Mensal Real • Limite 3/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'bingo_downgrade_chip',
    rarity: 'rare',
    priceCoins: 140,
    monthlyLimit: 3,
    icon: '🔻',
    accent: '#22d3ee',
    modeLabel: 'Pergaminhos 4×4',
    soundMood: 'neutral',
    description:
      'Adiciona +1 ficha de Reduzir Dificuldade nos Pergaminhos para suavizar uma casa travada da cartela.',
    merchantLines: [
      'Aliviando o peso da cartela?! Tá perdoado — até [[gold:3 sinetes por mês]] para destravar linha empacada.',
      'Melhor reduzir um contrato do que deixar o pergaminho mofando até a virada do mês!',
    ],
    afterBuyLine:
      '[[cyan:+1 Sinete -Dificuldade]] liberado na sua mesa dos Pergaminhos!',
  },
  {
    id: 'monthly_power_secret',
    name: '+1 Recarga Poder: Sessão Secreta',
    shortName: 'Poder Secreta',
    subtitle: 'Carga de Classe Mensal • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'power_secret_draw',
    rarity: 'legendary',
    priceCoins: 360,
    monthlyLimit: 1,
    icon: '⚡',
    accent: '#c084fc',
    modeLabel: 'Poder • Secreta',
    soundMood: 'happy',
    description:
      'Recarrega +1 carga do seu Poder de Classe ativo diretamente para a Sessão Secreta.',
    merchantLines: [
      'Energia pura da sua Classe RPG engarrafada! Vai ativar Poder na Sessão Secreta mais cedo neste mês!',
      'Peça rara de estoque mensal: [[purple:1 por mês]]. Não desperdice com sorteio fraco!',
    ],
    afterBuyLine:
      '[[purple:+1 Carga de Poder (Sessão Secreta)]] injetada direto na sua Classe RPG!',
  },
  {
    id: 'monthly_power_chimera',
    name: '+1 Recarga Poder: Quimera',
    shortName: 'Poder Quimera',
    subtitle: 'Carga de Classe Mensal • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'power_chimera',
    rarity: 'legendary',
    priceCoins: 360,
    monthlyLimit: 1,
    icon: '🔥',
    accent: '#34d399',
    modeLabel: 'Poder • Quimera',
    soundMood: 'happy',
    description:
      'Recarrega +1 carga do seu Poder de Classe ativo diretamente para a Quimera Cinéfila.',
    merchantLines: [
      'Uma carga extra do seu Poder na Quimera! Os pilares e dados que se preparem!',
      'Esse frasco reluz mais que o próprio D20 no balcão — limite estrito de [[gold:1 por mês]].',
    ],
    afterBuyLine:
      '[[emerald:+1 Carga de Poder (Quimera)]] carregada na sua Classe RPG!',
  },
  {
    id: 'monthly_power_bingo',
    name: '+1 Recarga Poder: Pergaminhos',
    shortName: 'Poder Bingo',
    subtitle: 'Carga de Classe Mensal • Limite 1/mês',
    category: 'monthly',
    kind: 'monthly',
    targetId: 'power_bingo',
    rarity: 'legendary',
    priceCoins: 360,
    monthlyLimit: 1,
    icon: '✨',
    accent: '#fbbf24',
    modeLabel: 'Poder • Pergaminhos',
    soundMood: 'happy',
    description:
      'Recarrega +1 carga do seu Poder de Classe ativo diretamente para os Pergaminhos da Guilda 4×4.',
    merchantLines: [
      'Recarga de Poder dos Pergaminhos! O banqueiro vai chorar vendo você lacrar casas automáticas!',
      'Estoque mensal único — compre apenas se for usar sua Classe com estilo no Bingo.',
    ],
    afterBuyLine:
      '[[gold:+1 Carga de Poder (Pergaminhos)]] ativada e pronta para o Bingo 4×4!',
  },

  // =========================================================================
  // 4 SKINS OFICIAIS (2 LIBERADAS: CLASSIC & MAGNETO | 2 COMPRÁVEIS: BR & TERROR)
  // =========================================================================
  {
    id: 'preowned_skin_classic',
    name: 'Arlequim Clássico (Sem Skin)',
    shortName: 'Clássico',
    subtitle: 'Visual Padrão da Casa • Sempre Liberado',
    category: 'skins',
    kind: 'skin',
    targetId: 'classic',
    rarity: 'common',
    priceCoins: 0,
    isPreOwned: true,
    icon: '🃏',
    soundMood: 'neutral',
    description: HARLEQUIN_SKINS.classic.lore,
    merchantLines: [
      'Essa aí é literalmente a minha roupa de trabalho padrão — sempre gratuita no seu armário!',
    ],
    afterBuyLine: 'Já é sua desde o primeiro dia!',
  },
  {
    id: 'preowned_skin_magneto',
    name: 'Magneto Cinéfilo (Soberano 35mm)',
    shortName: 'Magneto',
    subtitle: '1ª Skin Oficial • Já Comprada (130 Falas Ativas)',
    category: 'skins',
    kind: 'skin',
    targetId: 'magneto',
    rarity: 'legendary',
    priceCoins: 1200,
    isPreOwned: true,
    icon: '🧲',
    soundMood: 'happy',
    description: HARLEQUIN_SKINS.magneto.lore,
    merchantLines: [
      'Essa joia já está marcada como [[gold:COMPRADA]] na sua conta! São 130 falas reagindo a X-Men, Marvel, Duelos, Troféus e 3 homenagens silenciosas!',
      'Só não deixe o Soberano perto da sua gaveta de moedas de metal ou ele puxa tudo!',
    ],
    afterBuyLine: 'Já está no seu Camarim pronta para equipar!',
  },
  {
    id: 'skin_brasileiro',
    name: 'Arlequim Brasileiro (Malandro 35mm)',
    shortName: 'Brasileiro',
    subtitle: '2ª Skin Oficial • Cangaço, Rádio & Cinema Nacional',
    category: 'skins',
    kind: 'skin',
    targetId: 'brasileiro',
    rarity: 'legendary',
    priceCoins: 1100,
    icon: '🇧🇷',
    soundMood: 'happy',
    description: HARLEQUIN_SKINS.brasileiro.lore,
    merchantLines: [
      'Cuidado: esse aqui traz chapéu de cangaceiro, rádio de pilha e opinião fortíssima sobre cinema nacional!',
      'Visual lindo demais! As falas exclusivas dele ainda estão sendo gravadas no estúdio, mas a arte já brilha no Camarim!',
    ],
    afterBuyLine:
      '[[gold:Arlequim Brasileiro]] entrou no seu Camarim! Já pode equipar o visual e combinar fundo/moldura na Classe.',
  },
  {
    id: 'skin_terror',
    name: 'Colecionador de Pesadelos (Slasher)',
    shortName: 'Terror',
    subtitle: '3ª Skin Oficial • Arame, Tesoura & Balões Rubros',
    category: 'skins',
    kind: 'skin',
    targetId: 'terror',
    rarity: 'mythic',
    priceCoins: 1350,
    icon: '🔪',
    soundMood: 'curse',
    description: HARLEQUIN_SKINS.terror.lore,
    merchantLines: [
      'Brrr… esse aí dorme no porão com máscara de hóquei e tesoura na mão! Não recomendo deixar no escuro!',
      'Visual Mítico assustador! As falas completas dele vêm na próxima leva, mas já pode equipar a aparência completa hoje!',
    ],
    afterBuyLine:
      '[[red:Colecionador de Pesadelos]] saiu da jaula direto para o seu Camarim da Classe!',
  },

  // =========================================================================
  // FUNDOS / CENÁRIOS (5 COMPRÁVEIS + 2 PADRÃO JÁ INCLUSOS)
  // =========================================================================
  {
    id: 'preowned_bg_magneto',
    name: 'Fundo: Tempestade Magnética',
    shortName: 'Tempestade Mag',
    subtitle: 'Cenário Padrão do Magneto • Incluído',
    category: 'backdrops',
    kind: 'backdrop',
    targetId: 'magneto_storm',
    rarity: 'epic',
    priceCoins: 0,
    isPreOwned: true,
    icon: '⚡',
    soundMood: 'happy',
    description: HARLEQUIN_BACKDROPS.magneto_storm.desc,
    merchantLines: ['Esse já veio junto com o capacete do Magneto — anéis violetas girando de graça!'],
  },
  {
    id: 'bg_sertanejo_dourado',
    name: 'Fundo: Sertão Dourado & Sol 35mm',
    shortName: 'Sertão 35mm',
    subtitle: 'Cenário Oficial Brasileiro • Poeira & Ouro',
    category: 'backdrops',
    kind: 'backdrop',
    targetId: 'sertanejo_dourado',
    rarity: 'legendary',
    priceCoins: 450,
    icon: '☀️',
    soundMood: 'happy',
    description: HARLEQUIN_BACKDROPS.sertanejo_dourado.desc,
    merchantLines: [
      'Luz quente de fim de tarde no sertão! Faz qualquer skin parecer capa premiada de festival!',
      'Combina que é uma beleza com o Arlequim Brasileiro — só não derrete o plástico do projetor!',
    ],
    afterBuyLine:
      'Cenário [[gold:Sertão Dourado & Sol 35mm]] guardado no seu Camarim — pronto para combinar com qualquer skin!',
  },
  {
    id: 'bg_eclipse_terror',
    name: 'Fundo: Eclipse Sangrento & Corrente',
    shortName: 'Eclipse Rubro',
    subtitle: 'Cenário Oficial Terror • Névoa & Raios',
    category: 'backdrops',
    kind: 'backdrop',
    targetId: 'eclipse_terror',
    rarity: 'mythic',
    priceCoins: 650,
    icon: '🩸',
    soundMood: 'curse',
    description: HARLEQUIN_BACKDROPS.eclipse_terror.desc,
    merchantLines: [
      'Lua vermelha, neblina e relâmpago sangrento… só faltou tocar órgão de igreja na tela!',
      'Dá um clima sinistro para qualquer personagem — e combina perfeitamente com a vitrine do Terror!',
    ],
    afterBuyLine:
      'Cenário [[red:Eclipse Sangrento]] desbloqueado no Camarim para combinar com qualquer skin!',
  },
  {
    id: 'bg_holo_vault',
    name: 'Fundo: Cofre Prisma Holo',
    shortName: 'Cofre Holo',
    subtitle: 'Cenário Colecionador • Película Iridescente',
    category: 'backdrops',
    kind: 'backdrop',
    targetId: 'holo_vault',
    rarity: 'legendary',
    priceCoins: 550,
    icon: '🌈',
    soundMood: 'happy',
    description: HARLEQUIN_BACKDROPS.holo_vault.desc,
    merchantLines: [
      'Brilho arco-íris de edição de colecionador! Vai ofuscar até as suas estrelas da calçada da fama.',
    ],
    afterBuyLine:
      'Cenário [[cyan:Cofre Prisma Holo]] liberado no Camarim para usar com a skin que preferir!',
  },
  {
    id: 'bg_noir_rain',
    name: 'Fundo: Beco Chuvoso Noir',
    shortName: 'Chuva Noir',
    subtitle: 'Cenário Atmosférico • Chuva & Neblina',
    category: 'backdrops',
    kind: 'backdrop',
    targetId: 'noir_rain',
    rarity: 'rare',
    priceCoins: 350,
    icon: '🌧️',
    soundMood: 'sad',
    description: HARLEQUIN_BACKDROPS.noir_rain.desc,
    merchantLines: [
      'Gastar ficha para deixar chuva caindo atrás do boneco? Se bem que fica estiloso de madrugada!',
    ],
    afterBuyLine:
      'Cenário [[cyan:Beco Chuvoso Noir]] guardado no Camarim — troque quando quiser na aba de Classe!',
  },
  {
    id: 'bg_clean_stage',
    name: 'Fundo: Palco Sombrio Minimalista',
    shortName: 'Minimalista',
    subtitle: 'Cenário Limpo • Destaque Máximo na Skin',
    category: 'backdrops',
    kind: 'backdrop',
    targetId: 'clean_stage',
    rarity: 'common',
    priceCoins: 200,
    icon: '🌑',
    soundMood: 'neutral',
    description: HARLEQUIN_BACKDROPS.clean_stage.desc,
    merchantLines: [
      'Zero distração, só o recorte da arte sobre fundo escuro puro. Para os minimalistas!',
    ],
    afterBuyLine:
      'Cenário Palco Sombrio Minimalista adicionado à sua coleção no Camarim!',
  },

  // =========================================================================
  // MOLDURAS (4 COMPRÁVEIS + 2 PADRÃO INCLUSAS)
  // =========================================================================
  {
    id: 'preowned_frame_magneto',
    name: 'Moldura: Aço Magnetizado',
    shortName: 'Aço Magneto',
    subtitle: 'Moldura Padrão do Magneto • Incluída',
    category: 'frames',
    kind: 'frame',
    targetId: 'magneto_forge',
    rarity: 'epic',
    priceCoins: 0,
    isPreOwned: true,
    icon: '🧲',
    soundMood: 'neutral',
    description: HARLEQUIN_FRAMES.magneto_forge.desc,
    merchantLines: ['Já vem soldada no pacote do Soberano 35mm — sem custo extra!'],
  },
  {
    id: 'frame_cangaco_couro',
    name: 'Moldura: Couro & Sol Nordestino',
    shortName: 'Couro & Sol',
    subtitle: 'Moldura Oficial • Estrelas & Costura Dourada',
    category: 'frames',
    kind: 'frame',
    targetId: 'cangaco_couro',
    rarity: 'epic',
    priceCoins: 400,
    icon: '☀️',
    soundMood: 'happy',
    description: HARLEQUIN_FRAMES.cangaco_couro.desc,
    merchantLines: [
      'Costura de couro artesanal com brilho dourado de estrela! Feita sob medida para o Malandro 35mm.',
    ],
    afterBuyLine:
      'Moldura [[gold:Couro & Sol Nordestino]] guardada no Camarim para emoldurar qualquer carta!',
  },
  {
    id: 'frame_slasher_arame',
    name: 'Moldura: Arame Farpado & Sangue',
    shortName: 'Arame Rubro',
    subtitle: 'Moldura Oficial • Carmesim Cortante',
    category: 'frames',
    kind: 'frame',
    targetId: 'slasher_arame',
    rarity: 'legendary',
    priceCoins: 500,
    icon: '⛓️',
    soundMood: 'curse',
    description: HARLEQUIN_FRAMES.slasher_arame.desc,
    merchantLines: [
      'Atenção para não furar o dedo ao equipar essa moldura — pontas afiadas e selo sangrento!',
    ],
    afterBuyLine:
      'Moldura [[red:Arame Farpado & Sangue]] liberada na sua coleção do Camarim!',
  },
  {
    id: 'frame_prism_holo',
    name: 'Moldura: Holográfica Mítica',
    shortName: 'Holo Mítica',
    subtitle: 'Borda Arco-Íris Animada • Reflexo Foil',
    category: 'frames',
    kind: 'frame',
    targetId: 'prism_holo',
    rarity: 'mythic',
    priceCoins: 650,
    icon: '💎',
    soundMood: 'happy',
    description: HARLEQUIN_FRAMES.prism_holo.desc,
    merchantLines: [
      'Cinco cores girando na borda da carta… ostentação nível máximo de colecionador!',
    ],
    afterBuyLine:
      'Moldura [[cyan:Holográfica Mítica]] adicionada ao Camarim — pronta para qualquer skin!',
  },
  {
    id: 'frame_noir_deco',
    name: 'Moldura: Art Déco Dourada',
    shortName: 'Art Déco',
    subtitle: 'Cantoneiras Vintage 1940',
    category: 'frames',
    kind: 'frame',
    targetId: 'noir_deco',
    rarity: 'rare',
    priceCoins: 300,
    icon: '🕯️',
    soundMood: 'neutral',
    description: HARLEQUIN_FRAMES.noir_deco.desc,
    merchantLines: [
      'Elegância clássica de cinema antigo em ouro escovado e vidro fumê.',
    ],
    afterBuyLine:
      'Moldura [[gold:Art Déco Dourada]] desbloqueada na sua coleção do Camarim!',
  },

  // =========================================================================
  // BALÕES DE FALA LIBERÁVEIS (4 COMPRÁVEIS + 2 INCLUSOS)
  // =========================================================================
  {
    id: 'preowned_bubble_magneto',
    name: 'Balão: Soberano Magnético 35mm',
    shortName: 'Balão Magneto',
    subtitle: 'Balão Oficial do Magneto • Incluído',
    category: 'bubbles',
    kind: 'bubble',
    targetId: 'magneto',
    rarity: 'epic',
    priceCoins: 0,
    isPreOwned: true,
    icon: '🧲',
    soundMood: 'neutral',
    description: HARLEQUIN_BUBBLE_STYLES.magneto.desc,
    merchantLines: ['Já veio desbloqueado junto com a personalidade do Magneto!'],
  },
  {
    id: 'bubble_brasileiro',
    name: 'Balão: Cordel & Rádio 35mm',
    shortName: 'Balão Cordel',
    subtitle: 'Estilo de Diálogo • Couro & Ouro Tropical',
    category: 'bubbles',
    kind: 'bubble',
    targetId: 'brasileiro',
    rarity: 'epic',
    priceCoins: 320,
    icon: '📻',
    soundMood: 'happy',
    description: HARLEQUIN_BUBBLE_STYLES.brasileiro.desc,
    merchantLines: [
      'Um balão todo estilizado em couro dourado e detalhes brasileiros! Dá pra usar até com o Magneto falando dentro!',
    ],
    afterBuyLine: '[[gold:Balão Cordel & Rádio]] desbloqueado para todas as suas falas!',
  },
  {
    id: 'bubble_terror',
    name: 'Balão: Fita Maldita Rubra',
    shortName: 'Balão Horror',
    subtitle: 'Estilo de Diálogo • Carmesim & Serif Gótica',
    category: 'bubbles',
    kind: 'bubble',
    targetId: 'terror',
    rarity: 'legendary',
    priceCoins: 380,
    icon: '🩸',
    soundMood: 'curse',
    description: HARLEQUIN_BUBBLE_STYLES.terror.desc,
    merchantLines: [
      'Letras dramáticas em fundo vermelho-sangue! Deixa até notícia boa parecendo ameaça de filme de terror!',
    ],
    afterBuyLine: '[[red:Balão Fita Maldita Rubra]] pronto para equipar no Camarim!',
  },
  {
    id: 'bubble_noir',
    name: 'Balão: Jornal Vintage 1940',
    shortName: 'Balão 1940',
    subtitle: 'Estilo de Diálogo • Sépia Clássico',
    category: 'bubbles',
    kind: 'bubble',
    targetId: 'noir',
    rarity: 'rare',
    priceCoins: 260,
    icon: '🗞️',
    soundMood: 'neutral',
    description: HARLEQUIN_BUBBLE_STYLES.noir.desc,
    merchantLines: [
      'Clássico, sério e elegante como recorte de jornal policial da década de 40!',
    ],
    afterBuyLine: 'Balão Jornal Vintage 1940 liberado!',
  },
  {
    id: 'bubble_holo_prism',
    name: 'Balão: Prisma Arco-Íris Holo',
    shortName: 'Balão Prisma',
    subtitle: 'Estilo de Diálogo • Ciano & Violeta Mítico',
    category: 'bubbles',
    kind: 'bubble',
    targetId: 'holo_prism',
    rarity: 'mythic',
    priceCoins: 450,
    icon: '💠',
    soundMood: 'happy',
    description: HARLEQUIN_BUBBLE_STYLES.holo_prism.desc,
    merchantLines: [
      'Para quem quer que até os comentários do cantinho da tela brilhem feito carta holográfica!',
    ],
    afterBuyLine: '[[cyan:Balão Prisma Holo]] desbloqueado no seu Camarim!',
  },

  // =========================================================================
  // SKINS DA BARRA DE XP DO TOPO (5 COMPRÁVEIS + 1 PADRÃO INCLUÍDA)
  // =========================================================================
  {
    id: 'preowned_xpbar_classic',
    name: 'Barra de XP: Clássica Âmbar-Esmeralda',
    shortName: 'XP Clássica',
    subtitle: 'HUD Oficial • Incluída',
    category: 'xp_bars',
    kind: 'xp_bar',
    targetId: 'classic',
    rarity: 'common',
    priceCoins: 0,
    isPreOwned: true,
    icon: '⚡',
    soundMood: 'neutral',
    description: XP_BAR_SKINS.classic.desc,
    merchantLines: ['A barra clássica que já acompanha a sua Ficha desde o nível 1.'],
  },
  {
    id: 'xpbar_crimson_ruby',
    name: 'Barra de XP: Carmesim Rubi',
    shortName: 'XP Rubi',
    subtitle: 'HUD Topo & Ficha • Vermelho Escarlate',
    category: 'xp_bars',
    kind: 'xp_bar',
    targetId: 'crimson_ruby',
    rarity: 'rare',
    priceCoins: 220,
    icon: '🔥',
    soundMood: 'curse',
    description: XP_BAR_SKINS.crimson_ruby.desc,
    merchantLines: ['Vermelho vivo cortando a barra inteira! Fica nervosa demais lá no topo!'],
    afterBuyLine: '[[red:Barra Carmesim Rubi]] liberada para equipar no seu HUD!',
  },
  {
    id: 'xpbar_imperial_gold',
    name: 'Barra de XP: Ouro Imperial',
    shortName: 'XP Ouro',
    subtitle: 'HUD Topo & Ficha • Amarelo / Ouro',
    category: 'xp_bars',
    kind: 'xp_bar',
    targetId: 'imperial_gold',
    rarity: 'epic',
    priceCoins: 280,
    icon: '👑',
    soundMood: 'happy',
    description: XP_BAR_SKINS.imperial_gold.desc,
    merchantLines: ['Amarelo ouro maciço brilhando a cada novo filme! Digno do Imperador!'],
    afterBuyLine: '[[gold:Barra Ouro Imperial]] pronta para reluzir na barra de XP!',
  },
  {
    id: 'xpbar_violet_abyss',
    name: 'Barra de XP: Abissal Violeta',
    shortName: 'XP Violeta',
    subtitle: 'HUD Topo & Ficha • Roxo & Ciano',
    category: 'xp_bars',
    kind: 'xp_bar',
    targetId: 'violet_abyss',
    rarity: 'epic',
    priceCoins: 320,
    icon: '🔮',
    soundMood: 'neutral',
    description: XP_BAR_SKINS.violet_abyss.desc,
    merchantLines: ['Roxo elétrico com feixe ciano pulsante — puro estilo arcano!'],
    afterBuyLine: '[[purple:Barra Abissal Violeta]] desbloqueada!',
  },
  {
    id: 'xpbar_prism_rainbow',
    name: 'Barra de XP: Espectro Arco-Íris',
    shortName: 'XP Arco-Íris',
    subtitle: 'HUD Topo & Ficha • 6 Cores Prismáticas',
    category: 'xp_bars',
    kind: 'xp_bar',
    targetId: 'prism_rainbow',
    rarity: 'legendary',
    priceCoins: 380,
    icon: '🌈',
    soundMood: 'happy',
    description: XP_BAR_SKINS.prism_rainbow.desc,
    merchantLines: ['Todas as cores do espectro juntas! De longe a barra mais colorida do cinema!'],
    afterBuyLine: '[[cyan:Barra Espectro Arco-Íris]] pronta para brilhar no topo!',
  },
  {
    id: 'xpbar_neon_rgb',
    name: 'Barra de XP: Neon RGB Dinâmico',
    shortName: 'XP Neon RGB',
    subtitle: 'HUD Topo & Ficha • RGB Animado',
    category: 'xp_bars',
    kind: 'xp_bar',
    targetId: 'neon_rgb',
    rarity: 'mythic',
    priceCoins: 520,
    icon: '✨',
    soundMood: 'happy',
    description: XP_BAR_SKINS.neon_rgb.desc,
    merchantLines: ['Gamer edition na guilda! Fluxo RGB vivo correndo sem parar na sua barra de XP!'],
    afterBuyLine: '[[gold:Barra Neon RGB Dinâmico]] desbloqueada para rodar em movimento!',
  },

  // =========================================================================
  // RELÍQUIAS PERMANENTES DO BAZAR (ENDGAME — COMPRA ÚNICA PARA SEMPRE)
  // =========================================================================
  {
    id: 'relic_vip_seat',
    name: 'Poltrona VIP Permanente',
    shortName: 'Poltrona VIP',
    subtitle: 'Relíquia Permanente • Sessão + Quimera',
    category: 'relics',
    kind: 'relic',
    targetId: 'vip_seat',
    rarity: 'mythic',
    priceCoins: 1600,
    icon: '🛋️',
    accent: '#fbbf24',
    soundMood: 'happy',
    description:
      'RELÍQUIA ETERNA: Aumenta para SEMPRE em +1 a capacidade máxima da fila da Sessão Secreta (10 → 11 filmes) e da Quimera Cinéfila (4 → 5 contratos)!',
    merchantLines: ['Comprou a Poltrona VIP, ganhou cadeira cativa extra nas duas mesas para sempre!'],
    afterBuyLine: '[[gold:Poltrona VIP Permanente]] instalada: +1 vaga eterna na Secreta e na Quimera!',
  },
  {
    id: 'relic_golden_loupe',
    name: 'Lupa Eterna de Ouro',
    shortName: 'Lupa +10% 🪙',
    subtitle: 'Relíquia Permanente • Bônus de Ouro Global',
    category: 'relics',
    kind: 'relic',
    targetId: 'golden_loupe',
    rarity: 'mythic',
    priceCoins: 1800,
    icon: '🔍',
    accent: '#facc15',
    soundMood: 'happy',
    description:
      'RELÍQUIA ETERNA: Concede +10% permanente em TODO Ouro (🪙) ganho ao colher cartas da Sessão Secreta, Quimeras e Pergaminhos do Bingo!',
    merchantLines: ['Com esta Lupa dourada, toda moeda que entra na sua bolsa multiplica automaticamente!'],
    afterBuyLine: '[[gold:Lupa Eterna de Ouro]] equipada para sempre: +10% em todo Ouro colhido!',
  },
  {
    id: 'relic_house_insurance',
    name: 'Seguro da Casa',
    shortName: 'Seguro da Casa',
    subtitle: 'Relíquia Permanente • Reembolso 1x/ciclo',
    category: 'relics',
    kind: 'relic',
    targetId: 'house_insurance',
    rarity: 'legendary',
    priceCoins: 1400,
    icon: '🛡️',
    accent: '#38bdf8',
    soundMood: 'neutral',
    description:
      'RELÍQUIA ETERNA: 1 vez por ciclo de 15 dias, devolve automaticamente 1 Ficha de Sorteio na Sessão Secreta se você finalizar/pular a mão sem pegar nenhuma carta!',
    merchantLines: ['Mesa veio só com pedreira? O Seguro da Casa estorna a ficha do sorteio na hora!'],
    afterBuyLine: '[[cyan:Seguro da Casa]] ativado permanentemente na sua conta!',
  },

  // =========================================================================
  // PODERES TÁTICOS CONSUMÍVEIS (SESSÃO SECRETA, QUIMERA & BINGO)
  // =========================================================================
  {
    id: 'power_secret_amulet',
    name: 'Amuleto Contra-Maldição (Escudo)',
    shortName: 'Escudo Arlequim',
    subtitle: 'Poder Tático • Sessão Secreta & Tarô da Quimera',
    category: 'powers',
    kind: 'power',
    targetId: 'secret_amulet',
    rarity: 'epic',
    priceCoins: 180,
    icon: '🛡️',
    accent: '#10b981',
    soundMood: 'happy',
    description:
      'Arme antes de abrir cartas: estilhaça automaticamente para ANULAR 100% da próxima Carta Amaldiçoada na Sessão Secreta OU do próximo Arcano Amaldiçoado no Tarô da Quimera (devolvendo +1 escolha limpa)!',
    merchantLines: ['Vai arriscar na mesa escura ou no Tarô? Leve o Escudo do Arlequim no peito e ria da maldição!'],
    afterBuyLine: '[[emerald:Amuleto Contra-Maldição]] guardado para defender Sessão Secreta & Quimera!',
  },
  {
    id: 'power_secret_transmute',
    name: 'Selo de Transmutação (XP ↔ Ouro)',
    shortName: 'Transmutar Fila',
    subtitle: 'Poder Tático • Sessão Secreta',
    category: 'powers',
    kind: 'power',
    targetId: 'secret_transmute',
    rarity: 'epic',
    priceCoins: 220,
    icon: '⚖️',
    accent: '#f59e0b',
    soundMood: 'happy',
    description:
      'Escolha manualmente 1 filme ativo na sua fila da Sessão Secreta para inverter o prêmio dele entre XP (⚡) e Ouro (🪙)!',
    merchantLines: ['Quer farmar moedas num filme de XP ou o contrário? Este selo vira a recompensa na hora!'],
    afterBuyLine: '[[gold:Selo de Transmutação]] guardado para usar na sua fila Secreta!',
  },
  {
    id: 'power_secret_radar',
    name: 'Radar do Croupier (Mão Antidisfarce)',
    shortName: 'Radar Croupier',
    subtitle: 'Poder Tático • Sessão Secreta',
    category: 'powers',
    kind: 'power',
    targetId: 'secret_radar',
    rarity: 'rare',
    priceCoins: 160,
    icon: '🕵️',
    accent: '#d946ef',
    soundMood: 'neutral',
    description:
      'Faz pulsar um contorno misterioso em todas as Cartas Especiais ainda fechadas na mesa (ou arma para a próxima mão!), revelando onde os truques se escondem sem entregar qual é.',
    merchantLines: ['Quer saber quais cartas do feltro escondem truques antes de clicar? Passe o Radar!'],
    afterBuyLine: '[[purple:Radar do Croupier]] guardado na mochila!',
  },
  {
    id: 'power_secret_plus2',
    name: 'Manga Cheia (+2 Cartas na Mesa)',
    shortName: 'Mesa +2 Cartas',
    subtitle: 'Poder Tático • Sessão Secreta',
    category: 'powers',
    kind: 'power',
    targetId: 'secret_hand_plus2',
    rarity: 'rare',
    priceCoins: 190,
    icon: '🃏',
    accent: '#38bdf8',
    soundMood: 'happy',
    description:
      'Arme antes de sortear na Sessão Secreta para acrescentar +2 cartas extras na mesa mantendo a divisão justa entre Ouro e XP! (Não acumula com outro poder de +Cartas.)',
    merchantLines: ['Duas cartas a mais escondidas na manga do paletó — mais escolha sem gastar ficha!'],
    afterBuyLine: '[[cyan:Manga Cheia (+2 Cartas)]] pronta para armar na Sessão Secreta!',
  },
  {
    id: 'power_secret_plus5',
    name: 'Manga Cheia Suprema (+5 Cartas)',
    shortName: 'Mesa +5 Cartas',
    subtitle: 'Poder Tático • Sessão Secreta',
    category: 'powers',
    kind: 'power',
    targetId: 'secret_hand_plus5',
    rarity: 'legendary',
    priceCoins: 340,
    icon: '🌟',
    accent: '#fbbf24',
    soundMood: 'happy',
    description:
      'Arme antes de sortear na Sessão Secreta para abrir uma mesa gigante com +5 cartas extras de uma só vez! (Não acumula com outro poder de +Cartas.)',
    merchantLines: ['Cinco cartas extras abertas no feltro! A casa fica gigantesca num estalo!'],
    afterBuyLine: '[[gold:Manga Cheia Suprema (+5 Cartas)]] guardada na mochila!',
  },
  {
    id: 'power_secret_special_storm',
    name: 'Baralho Carregado (2 a 6 Especiais)',
    shortName: '2–6 Especiais',
    subtitle: 'Poder Tático • Sessão Secreta',
    category: 'powers',
    kind: 'power',
    targetId: 'secret_special_storm',
    rarity: 'legendary',
    priceCoins: 290,
    icon: '🌪️',
    accent: '#a855f7',
    soundMood: 'happy',
    description:
      'Arme antes do próximo sorteio da Sessão Secreta: em vez de 1 a 3, a mesa passa a esconder de 2 a 6 Cartas Especiais disfarçadas atrás dos naipes!',
    merchantLines: ['Baralho adulterado da casa: até 6 Especiais disfarçadas na próxima mão!'],
    afterBuyLine: '[[purple:Baralho Carregado (2–6 Especiais)]] guardado na mochila!',
  },
  {
    id: 'power_chimera_oracle_2',
    name: 'Oráculo Bis (2 Arcanos na Forja)',
    shortName: '2 Arcanos Tarô',
    subtitle: 'Poder Tático • Quimera Cinéfila',
    category: 'powers',
    kind: 'power',
    targetId: 'chimera_oracle_2',
    rarity: 'epic',
    priceCoins: 260,
    icon: '🔮',
    accent: '#a855f7',
    soundMood: 'happy',
    description:
      'Use em uma Quimera ativa para ganhar +1 escolha de Carta de Tarô na mesa (chegando a 2 Arcanos na mesma forja). Limite: apenas 1 Poder de Tarô por Quimera!',
    merchantLines: ['Um Arcano só é pouco? Leve o Oráculo Bis e sele dois na mesma Quimera!'],
    afterBuyLine: '[[purple:Oráculo Bis (2 Arcanos)]] guardado para suas Quimeras!',
  },
  {
    id: 'power_chimera_oracle_3',
    name: 'Oráculo Triplo (3 Arcanos na Forja)',
    shortName: '3 Arcanos Tarô',
    subtitle: 'Poder Tático • Quimera Cinéfila',
    category: 'powers',
    kind: 'power',
    targetId: 'chimera_oracle_3',
    rarity: 'mythic',
    priceCoins: 420,
    icon: '👑',
    accent: '#fbbf24',
    soundMood: 'happy',
    description:
      'Use em uma Quimera ativa para ganhar +2 escolhas extras de Tarô na mesma mesa (totalizando 3 Arcanos combinados). Limite: apenas 1 Poder de Tarô por Quimera!',
    merchantLines: ['TRÊS Arcanos empilhados numa única Quimera! Isso aqui é combo supremo!'],
    afterBuyLine: '[[gold:Oráculo Triplo (3 Arcanos)]] guardado para uma forja épica!',
  },
  {
    id: 'power_chimera_tarot_reroll',
    name: 'Novo Corte do Tarô (Re-roll)',
    shortName: 'Re-roll Tarô',
    subtitle: 'Poder Tático • Quimera Cinéfila',
    category: 'powers',
    kind: 'power',
    targetId: 'chimera_tarot_reroll',
    rarity: 'rare',
    priceCoins: 170,
    icon: '🎲',
    accent: '#38bdf8',
    soundMood: 'neutral',
    description:
      'Reembaralha todas as Cartas de Tarô ainda não seladas da sua Quimera ativa e entrega um novo leque na mesa. Limite: apenas 1 Poder de Tarô por Quimera!',
    merchantLines: ['Não gostou das cartas da mesa do Tarô? Corte o baralho de novo por minha conta!'],
    afterBuyLine: '[[cyan:Novo Corte do Tarô]] guardado na mochila!',
  },
  {
    id: 'power_chimera_invert_essence',
    name: 'Alquimia Inversa (Virar XP ↔ Ouro)',
    shortName: 'Inverter Quimera',
    subtitle: 'Poder Tático • Quimera Cinéfila',
    category: 'powers',
    kind: 'power',
    targetId: 'chimera_invert_essence',
    rarity: 'epic',
    priceCoins: 240,
    icon: '⚗️',
    accent: '#f59e0b',
    soundMood: 'happy',
    description:
      'Selecione manualmente QUAL Quimera ativa (ou pronta para colheita) você quer inverter entre XP e Ouro (🪙), sem esperar a alternância da próxima forja!',
    merchantLines: ['Você aponta a Quimera exata e o alambique vira XP em Ouro ou Ouro em XP na hora!'],
    afterBuyLine: '[[gold:Alquimia Inversa]] guardada para escolher em qualquer Quimera!',
  },
  {
    id: 'power_chimera_golden_jackpot',
    name: 'Selo de Jackpot Dourado',
    shortName: '+1 Jackpot Categoria',
    subtitle: 'Poder Tático • Quimera Cinéfila',
    category: 'powers',
    kind: 'power',
    targetId: 'chimera_golden_jackpot',
    rarity: 'epic',
    priceCoins: 230,
    icon: '💎',
    accent: '#fbbf24',
    soundMood: 'happy',
    description:
      'Escolha uma categoria da Quimera — Ano, País ou Tag (exceto Gênero) — para sortear aleatoriamente +1 fator lá de dentro e transformá-lo em Jackpot Dourado extra!',
    merchantLines: ['Escolha Ano, País ou Tag e o Arlequim doura mais um alvo lá dentro para o Jackpot!'],
    afterBuyLine: '[[gold:Selo de Jackpot Dourado]] guardado para suas Quimeras!',
  },
  {
    id: 'power_bingo_hybrid_seal',
    name: 'Sinete Híbrido dos Pergaminhos',
    shortName: 'Sinete Híbrido',
    subtitle: 'Poder Tático • Pergaminhos (Bingo)',
    category: 'powers',
    kind: 'power',
    targetId: 'bingo_hybrid_seal',
    rarity: 'epic',
    priceCoins: 190,
    icon: '📜',
    accent: '#eab308',
    soundMood: 'happy',
    description:
      'Aplica em qualquer Pergaminho ou Fileira aberta: converte XP em 50% XP + 50% Ouro (🪙), OU turbina um Pergaminho Dourado em +25% Moedas extras!',
    merchantLines: ['Divide qualquer contrato em metade XP + metade Ouro, ou dá +25% nos Pergaminhos Dourados!'],
    afterBuyLine: '[[gold:Sinete Híbrido dos Pergaminhos]] guardado para o Bingo!',
  },
];

export const HARLEQUIN_RPG_SHOP_ITEMS = GUILD_BAZAAR_ITEMS;

export function buildShopCounterReaction({ itemId, seed = 0 }) {
  const item =
    GUILD_BAZAAR_ITEMS.find((entry) => entry.id === itemId) || GUILD_BAZAAR_ITEMS[0];
  const lines = item.merchantLines || ['Olha só o que você veio bisbilhotar no meu balcão!'];
  const line = lines[Math.abs(Number(seed) || 0) % lines.length];
  return {
    eventId: item.id,
    contextBadge: `BAZAR • ${item.priceCoins} FICHAS`,
    skinId: item.kind === 'skin' ? item.targetId : 'classic',
    poseId: 'neutral',
    bubbleTheme: HARLEQUIN_SHOPKEEPER_BUBBLE_STYLE,
    dialogue: line,
    moodPolarity: item.rarity === 'mythic' ? 'chaos' : 'happy',
    motion: 'jump',
    soundMood: item.soundMood || 'neutral',
  };
}

const DIALOGUE_COLOR_MAP = {
  red: '#ef4444',
  scarlet: '#ef4444',
  gold: '#fbbf24',
  amber: '#f59e0b',
  purple: '#c084fc',
  cyan: '#38bdf8',
  emerald: '#34d399',
};

/**
 * Converte marcações `[[red:Wanda]]` em segmentos coloridos preservando a digitação letra por letra.
 */
export function parseColoredDialogueSegments(rawText = '') {
  const input = String(rawText || '');
  const segments = [];
  const regex = /\[\[([a-z]+):([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index), color: null });
    }
    segments.push({
      text: match[2],
      color: DIALOGUE_COLOR_MAP[match[1]] || null,
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), color: null });
  }
  return segments;
}

export function getDialoguePlainText(rawText = '') {
  return parseColoredDialogueSegments(rawText)
    .map((seg) => seg.text)
    .join('');
}

export const MAGNETO_WORLD_TRIGGERS = [
  {
    id: 'mag_xmen_low_score',
    category: 'Catálogo • X-Men Nota < 6',
    label: 'Tag X-Men com Nota < 6',
    icon: '💢',
    contextBadge: 'X-MEN • NOTA ABAIXO DE 6',
    moodChip: '-1 Traição ❌',
    moodPolarity: 'sad',
    motion: 'shake',
    soundMood: 'curse',
    lines: [
      'Nota abaixo de [[red:6]] em um filme dos [[purple:X-Men]]?! Como é possível você ter coragem de dar uma nota dessas?!',
      'Você teve a audácia de avaliar minha própria linhagem abaixo de [[red:6]]? Apague isso antes que eu entorte sua escala inteira!',
      'Menos de 6 para um filme dos [[purple:X-Men]]… até os Sentinelas tinham mais respeito pelo poder mutante que você hoje.',
      'Reavaliar agora é uma ordem! Ninguém humilha um filme mutante na minha mesa e sai impune.',
    ],
  },
  {
    id: 'mag_tag_marvel',
    category: 'Catálogo • Tag Marvel',
    label: 'Tag: Marvel',
    icon: '☄️',
    contextBadge: 'TAG • MARVEL',
    moodChip: '🧬 Era Mutante',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      '[[red:Marvel]] no catálogo? Nunca se esqueçam de quem abriu as portas dos cinemas antes de qualquer equipe vingadora existir!',
      'Mais um filme da [[red:Marvel]] por aqui… pena que metade desses heróis cairia em dois segundos se eu puxasse o metal das armaduras.',
      'Universo [[red:Marvel]] crescendo na lista! Só me avisem quando os mutantes assumirem o comando absoluto dessa saga.',
      'Multiverso, joias e heróis da [[red:Marvel]] — ótimo espetáculo, contanto que tratem o Soberano do Magnetismo com respeito!',
    ],
  },
  {
    id: 'mag_tag_superpower',
    category: 'Catálogo • Tag Super Poder',
    label: 'Tag: Super Poder',
    icon: '⚡',
    contextBadge: 'TAG • SUPER PODER',
    moodChip: '⚡ Ironia Mutante',
    moodPolarity: 'neutral',
    motion: 'jump',
    soundMood: 'neutral',
    lines: [
      '[[gold:Agora todo mundo tem super poder?!]] Quando todo mundo se acha especial… ninguém mais merece usar o capacete!',
      'Mais um com super poder jogado na tela? Existe um abismo entre truque de laboratório e dom de nascença.',
      'Fantasia colorida e raiozinho não fazem um líder — quero ver quem aguenta dobrar o mundo de verdade!',
      'Dão poderes a qualquer um hoje em dia… resta saber quem teria coragem de carregar o peso de usá-los.',
    ],
  },
  {
    id: 'mag_tag_prejudice',
    category: 'Catálogo • Tag Preconceito',
    label: 'Tag: Preconceito',
    icon: '🛡️',
    contextBadge: 'TAG • PRECONCEITO',
    moodChip: '🧬 Orgulho Firme',
    moodPolarity: 'chaos',
    motion: 'none',
    soundMood: 'sad',
    emotional: true,
    lines: [
      'Eles temem o que não entendem… mas nós somos [[purple:mais fortes que isso]].',
      'Sempre começa com um olhar torto. Depois vêm as leis, as correntes… e é por isso que eu nunca me ajoelho.',
      'Chame de diferença ou de defeito — quem sobrevive ao medo alheio aprende a transformar ferro em armadura.',
      'A humanidade treme diante do próprio espelho porque tem pavor do próximo degrau da evolução.',
    ],
  },
  {
    id: 'mag_tag_prejudice_tragic',
    category: 'Catálogo • Preconceito + Trágico',
    label: 'Tag Preconceito + Trágico / Terror',
    icon: '🔥',
    contextBadge: 'PRECONCEITO + TRÁGICO / TERROR',
    moodChip: '🔥 Fúria Histórica',
    moodPolarity: 'sad',
    motion: 'shake',
    soundMood: 'sad',
    emotional: true,
    lines: [
      '[[red:Não confunda a reação do oprimido com a violência do opressor.]]',
      'Eles só lembram de chamar de horror ou tragédia quando o ferro finalmente volta na direção deles.',
      'Quando empurram alguém contra a parede por gerações, ninguém tem o direito de fingir espanto com o trovão.',
      'Nenhuma paz nasce em cima de jaulas silenciosas — toda dívida de opressão cobra juros em aço.',
    ],
  },
  {
    id: 'mag_country_germany_poland',
    category: 'Países & Épocas',
    label: 'Alemanha / Polônia (Época Sombras)',
    icon: '🕰️',
    contextBadge: 'PAÍS • ALEMANHA / POLÔNIA',
    moodChip: '🕯️ Memória Antiga',
    moodPolarity: 'sad',
    motion: 'none',
    soundMood: 'sad',
    emotional: true,
    lines: [
      '[[cyan:Alemanha]]… essa época… eu nunca vou esquecer o som do aço e dos portões fechando naquela neve.',
      '[[cyan:Polônia]]… há marcas dessa época que nem cem anos de cinema conseguem apagar da memória.',
      'Quando o catálogo volta para essa época na Europa, cada frame carrega o peso de quem sobreviveu.',
      'Guarde bem esses arquivos antigos: quem esquece o que houve naquela época está condenado a abrir as portas de novo.',
    ],
  },
  {
    id: 'mag_country_uk',
    category: 'Países & Épocas',
    label: 'Cadastrou Filme do Reino Unido',
    icon: '🇬🇧',
    contextBadge: 'PAÍS • REINO UNIDO',
    moodChip: '+1 Nobreza 🎭',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'neutral',
    lines: [
      '[[gold:Reino Unido]]… terra de palcos imortais, chuva cinzenta e dois velhos amigos discutindo o destino no xadrez.',
      'Sotaque britânico firme e dramaturgia de ferro — ninguém rouba a cena com tanta elegância quanto Londres.',
      'De Shakespeare aos mutantes… o cinema do [[gold:Reino Unido]] sempre sabe dar alma até a um vilão.',
      'Chá amargo, névoa e atuações impecáveis — até meu elmo descansa em respeito diante dessa escola.',
    ],
  },
  {
    id: 'mag_duel_win',
    category: 'Duelos País & Ano',
    label: 'Duelo País/Ano: Tomou o Trono',
    icon: '⚔️',
    contextBadge: 'DUELO PAÍS / ANO • TOMOU O TRONO',
    moodChip: '+1 Novo Campeão 👑',
    moodPolarity: 'happy',
    motion: 'spin',
    soundMood: 'happy',
    lines: [
      '[[gold:Tomada de Trono no País/Ano!]] A nota maior do novo filme dobrou o campeão antigo feito latinha amassada!',
      'Um novo Rei subiu ao trono do País e do Ano! Quando aparece uma nota superior, até os campeões antigos se curvam.',
      'Coroa transferida em aço puro! O filme anterior não aguentou o peso dessa avaliação no duelo.',
      'Mais um trono tomado pela força da nota maior — na minha arena só permanece no topo quem entrega grandeza!',
    ],
  },
  {
    id: 'mag_duel_dethroned',
    category: 'Duelos País & Ano',
    label: 'Duelo País/Ano: Caiu ou Barrado',
    icon: '🛡️',
    contextBadge: 'DUELO PAÍS / ANO • QUEDA OU DEFESA',
    moodChip: '⚔️ Peso da Coroa',
    moodPolarity: 'sad',
    motion: 'shake',
    soundMood: 'curse',
    lines: [
      'O antigo campeão caiu diante de uma nota maior! Até o aço mais duro perde o trono quando surge um filme superior.',
      'Esse novo título tentou tomar o País ou o Ano… mas ficou abaixo da nota do campeão atual e perdeu o duelo!',
      'Ver um antigo rei ser destronado dói um pouco… mas se o desafiante trouxe nota maior, a coroa mudou de mãos por mérito!',
      'Trono defendido! Enquanto ninguém cadastrar um filme com nota maior nesse País ou Ano, o campeão atual segue intocável.',
    ],
  },
  {
    id: 'mag_tag_villain_dystopia',
    category: 'Catálogo • Vilão & Distopia',
    label: 'Tags: Vilão / Distopia / Viagem Tempo',
    icon: '🏛️',
    contextBadge: 'TAG • VILÃO / DISTOPIA',
    moodChip: '+1 Razão 🟣',
    moodPolarity: 'chaos',
    motion: 'jump',
    soundMood: 'neutral',
    lines: [
      'Chamam de ‘[[red:vilão]]’ quem enxerga a tempestade antes da multidão cega… clássico erro da humanidade.',
      'Mais uma distopia de governos controladores e correntes? Eu avisei que terminava exatamente assim.',
      'Se você olhou para o antagonista desse filme e concordou em silêncio… bem-vindo à minha irmandade.',
      'Mexer com o tempo e com impérios caídos exige estômago — excelente tema no seu catálogo!',
    ],
  },
  {
    id: 'mag_trophy_silver',
    category: 'Troféus',
    label: 'Conquistou Troféu Prata',
    icon: '🥈',
    contextBadge: 'TROFÉU • PRATA',
    moodChip: '+1 Metal Puro 🥈',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      '[[cyan:Troféu de Prata]]! Sinto cada átomo desse metal puro vibrando direto na palma da minha mão!',
      'Finalmente um troféu feito de metal nobre de verdade — essa medalha de [[cyan:Prata]] combina com a minha armadura.',
      '[[cyan:Prata]] forjada em magnetismo e persistência! Um passo sólido antes de arrancar o Mítico da prateleira.',
      'Um troféu prateado reluzindo na estante… até meu campo magnético sorriu ao atrair essa conquista!',
    ],
  },
  {
    id: 'mag_trophy_mythic',
    category: 'Troféus',
    label: 'Conquistou Troféu Mítico',
    icon: '🏆',
    contextBadge: 'TROFÉU • MÍTICO',
    moodChip: '+1 Supremacia Mítica 🟣',
    moodPolarity: 'happy',
    motion: 'spin',
    soundMood: 'happy',
    lines: [
      '[[purple:Troféu Mítico]] conquistado! Poucos alcançam esse nível de controle sobre o catálogo.',
      'Uma relíquia [[purple:Mítica]]… brilha quase tanto quanto meu capacete quando os polos se alinham!',
      'Poucos cinéfilos arrancam um Mítico da lista — agora o respeito pela sua mesa é indiscutível.',
      'Selado em aço e fogo roxo! Esse Troféu Mítico carrega a assinatura de um verdadeiro Soberano.',
    ],
  },
  {
    id: 'mag_movie_great',
    category: 'Catálogo • Nota',
    label: 'Cadastrou Nota 9.0–10',
    icon: '⭐',
    contextBadge: 'CATÁLOGO • OBRA-PRIMA',
    moodChip: '+1 Supremacia ✨',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      'Obra-prima absoluta! Até os anéis de ferro no meu pulso vibraram com essa [[gold:nota 10]]!',
      'Bravo! É desse calibre cinematográfico que o meu império precisa no catálogo.',
      'Perfeição em película! Quando você acerta assim, o baralho inteiro reconhece sua autoridade.',
      'Quase raridade magnética pura — filme dessa grandeza merece ficar trancado em moldura de ouro.',
    ],
  },
  {
    id: 'mag_movie_trash',
    category: 'Catálogo • Nota',
    label: 'Cadastrou Bomba (≤ 4.5)',
    icon: '🗑️',
    contextBadge: 'CATÁLOGO • BOMBA',
    moodChip: '-1 Alinhamento 💧',
    moodPolarity: 'sad',
    motion: 'shake',
    soundMood: 'sad',
    lines: [
      'Nota baixa assim? Meus carretéis deram curto-circuito só de ler esse título!',
      'Você tem poder para puxar ouro da prateleira e me traz sucata cinematográfica?',
      'Desperdício puro de eletricidade… da próxima vez me pergunte antes de apertar o play nisso.',
      'Sério que passamos horas na fila para acabar nessa lata enferrujada?',
    ],
  },
  {
    id: 'mag_movie_scifi_action',
    category: 'Catálogo • Gênero',
    label: 'Ficção Científica / Ação',
    icon: '🚀',
    contextBadge: 'GÊNERO FAVORITO • SCI-FI/AÇÃO',
    moodChip: '+1 Voltagem ⚡',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      'Energia, metal e tensão em alta voltagem! Você finalmente falou a minha língua hoje.',
      'Excelente escolha de gênero — cinema de verdade precisa ter força para dobrar o aço!',
      'Naves, armas, tempestade elétrica… agora sim meu campo magnético está trabalhando feliz!',
      'Ação intensa e ficção sem medo de exagerar — é assim que eu gosto da sessão!',
    ],
  },
  {
    id: 'mag_movie_romcom',
    category: 'Catálogo • Gênero',
    label: 'Romance / Comédia Leve',
    icon: '🧁',
    contextBadge: 'GÊNERO OPOSTO • ROMANCE LEVE',
    moodChip: '-1 Paciência 😅',
    moodPolarity: 'sad',
    motion: 'shake',
    soundMood: 'sad',
    lines: [
      'Açúcar demais no projetor… quer derreter o capacete do Soberano com esse romance leve?',
      'Fofinho demais pro meu gosto. Me prometa algo mais sombrio na próxima sessão!',
      'Comédia romântica de domingo? Você está tentando me entediar de propósito?',
      'Onde estão os conflitos épicos? Isso aqui mal mexe uma moeda no meu bolso!',
    ],
  },
  {
    id: 'mag_movie_classic',
    category: 'Catálogo • Época',
    label: 'Clássico (< 1980)',
    icon: '🎞️',
    contextBadge: 'CATÁLOGO • CLÁSSICO',
    moodChip: '+1 Respeito 🧲',
    moodPolarity: 'neutral',
    motion: 'jump',
    soundMood: 'neutral',
    lines: [
      'Aço antigo forjado antes dos efeitos digitais! Respeito absoluto a quem construiu o cinema.',
      'Película clássica de verdade tem peso de ferro fundido — nada de plástico moderno descartável.',
      'Décadas passadas carregavam uma gravidade que poucos diretores atuais entendem.',
      'Antes de qualquer computador existir, já sabiam prender a sala inteira só com luz e sombra!',
    ],
  },
  {
    id: 'mag_movie_modern',
    category: 'Catálogo • Época',
    label: 'Moderno (≥ 2016)',
    icon: '🛰️',
    contextBadge: 'CATÁLOGO • MODERNO',
    moodChip: '+1 Energia ⚡',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      'Escala moderna, som ensurdecedor e ritmo acelerado — finalmente alguém ligou os reatores da mesa!',
      'Ao contrário daquele velho do relógio, eu não tenho medo do futuro — traga os megaprojetos!',
      'Tecnologia atual nas mãos certas cria espetáculos que tremem até as caixas de som.',
      'Novo século, novas armas visuais — gostei da ambição dessa escolha.',
    ],
  },
  {
    id: 'mag_secret_draw_cards',
    category: 'Sessão Secreta',
    label: 'Sessão Secreta: Cartas / Bumerangue',
    icon: '🃏',
    contextBadge: 'SESSÃO SECRETA',
    moodChip: '+1 Tensão ⚡',
    moodPolarity: 'neutral',
    motion: 'jump',
    soundMood: 'neutral',
    lines: [
      'Cartas eletrificadas no feltro! Vamos ver se você tem coragem de virar a mais pesada.',
      'Jogou o Bumerangue de volta? Fugir da gravidade só adia o encontro inevitável!',
      'Tantas cartas fechadas brilhando… minha mão já está coçando para puxar a Exótica no magnetismo.',
      'A banca acha que esconde os filmes atrás do papelão — pena que eu sinto o metal dos rolos daqui.',
    ],
  },
  {
    id: 'mag_chimera_d20_1',
    category: 'Quimera Cinéfila',
    label: 'Quimera: Tirou 1 no D20',
    icon: '💀',
    contextBadge: 'QUIMERA • D20 = 1',
    moodChip: '-1 Interferência ⚡',
    moodPolarity: 'sad',
    motion: 'shake',
    soundMood: 'sad',
    lines: [
      'Um [[red:1]] miserável no D20?! Alguém interferiu no meu campo magnético… enfrente o pesadelo de cabeça erguida!',
      'Esse dado caiu torto demais! Não me diga que vai declinar antes mesmo de tentar a criatura.',
      'Provação Pesadelo no D20… perfeito. É no ferro quente que se testa quem realmente manda.',
    ],
  },
  {
    id: 'mag_chimera_d20_20',
    category: 'Quimera Cinéfila',
    label: 'Quimera: Tirou 20 no D20',
    icon: '👑',
    contextBadge: 'QUIMERA • D20 = 20',
    moodChip: '+1 Supremacia 👑',
    moodPolarity: 'happy',
    motion: 'spin',
    soundMood: 'happy',
    lines: [
      '[[gold:VINTE NATURAL]]! Os polos do universo inteiro acabaram de se alinhar diante do meu poder!',
      'Olhe esse [[gold:20]] brilhando na mesa! Eu avisei que o campo magnético trabalhava a nosso favor!',
      'Criatura domada antes mesmo de nascer! Agora busque os 4 Jackpots sem piedade.',
      'Vinte no dado — até o destino abaixou a cabeça hoje.',
    ],
  },
  {
    id: 'mag_chimera_modern',
    category: 'Quimera Cinéfila',
    label: 'Quimera Ano Alto (2022)',
    icon: '🧬',
    contextBadge: 'QUIMERA • DESAFIO MODERNO',
    moodChip: '+1 Ambição ⚡',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      'Quimera de ano moderno? Aceite sem hesitar — só os fracos declinam um desafio direto!',
      '2022 na Quimera! Deixe os saudosistas reclamando do relógio enquanto nós colhemos o XP.',
      'Ano recente não assusta quem tem controle total da lista — manda ver nesse contrato!',
    ],
  },
  {
    id: 'mag_bingo_line',
    category: 'Pergaminhos',
    label: 'Fechou Linha no Bingo',
    icon: '📜',
    contextBadge: 'PERGAMINHOS • LINHA',
    moodChip: '+1 Domínio 🔥',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      'Uma linha inteira selada em ferro e fogo! Esse pergaminho já pertence ao nosso domínio.',
      'Mais um selo alinhado em fila reta! Gosto quando o caos se organiza em geometria perfeita.',
      'Linha fechada no pergaminho — o banqueiro já pode ir preparando o nosso pagamento.',
    ],
  },
];

export const MAGNETO_SECRET_EASTER_EGGS = [
  {
    id: 'mag_secret_wanda',
    triggerLabel: 'Álbum 100% / Pacote: Elizabeth Olsen (Wanda)',
    starId: 'cf_elizabeth_olsen',
    badge: '💔 SEGREDO ESCARLATE • WANDA',
    moodChip: '💔 Segredo Escarlate',
    moodPolarity: 'sad',
    motion: 'none',
    soundMood: 'sad',
    emotional: true,
    bubbleBorderOverride: '#ef4444',
    lines: [
      '[[red:Wanda]]… minha vida, sempre te amei. Me desculpa pelo que eu fiz… o meu único arrependimento nessa vida foi você.',
      'Tentei moldar o mundo inteiro em metal, [[red:Wanda]]… e no fim, tudo que importava escapou das minhas mãos.',
    ],
  },
  {
    id: 'mag_secret_xavier',
    triggerLabel: 'Álbum 100% / Pacote: Sir Patrick Stewart & Ian McKellen',
    starId: 'cf_stewart_mckellen',
    badge: '🕊️ HOMENAGEM PÓSTUMA • SIR PATRICK STEWART',
    moodChip: '🕊️ Em Memória',
    moodPolarity: 'neutral',
    motion: 'none',
    soundMood: 'sad',
    silentSound: true,
    emotional: true,
    bubbleBorderOverride: '#fbbf24',
    lines: [
      '[[gold:Charles]]… “Ele carregava o coração à flor da pele — um homem em quem confiar, admirar e, no meu caso, amar.”',
      'Rivais no tabuleiro inteiro… e ainda assim, o único capaz de entender o silêncio por trás desse capacete.',
    ],
  },
  {
    id: 'mag_secret_wolverine',
    triggerLabel: 'Álbum 100% / Pacote: Isaac Bardavid (Voz de Adamantium)',
    starId: 'cf_isaac_bardavid',
    badge: '🐺 HOMENAGEM PÓSTUMA • ISAAC BARDAVID',
    moodChip: '🕊️ Voz Imortal',
    moodPolarity: 'neutral',
    motion: 'none',
    soundMood: 'sad',
    silentSound: true,
    emotional: true,
    bubbleBorderOverride: '#38bdf8',
    lines: [
      'Garras de [[cyan:adamantium]]… uma língua afiada e uma voz imortal. Até fora das telas, eu tiro o capacete para esse guerreiro.',
      'O metal pode enferrujar e os filmes envelhecerem… mas uma voz lendária como a do [[cyan:Isaac]] ecoa para sempre.',
    ],
  },
  {
    id: 'mag_secret_chadwick',
    triggerLabel: 'Álbum 100% / Pacote: Chadwick Boseman (Rei T’Challa)',
    starId: 'cf_chadwick_boseman',
    badge: '👑 HOMENAGEM PÓSTUMA • CHADWICK BOSEMAN',
    moodChip: '🕊️ Rei Eterno',
    moodPolarity: 'neutral',
    motion: 'none',
    soundMood: 'sad',
    silentSound: true,
    emotional: true,
    bubbleBorderOverride: '#c084fc',
    lines: [
      '[[purple:Wakanda Forever]]… um rei que travou suas maiores batalhas em silêncio. Até eu curvo minha coroa de aço para [[gold:Chadwick Boseman]].',
      'Vibranium ou adamantium nenhum sustenta um legado assim — a morte não é o fim quando alguém se torna eterno.',
    ],
  },
  {
    id: 'mag_secret_strange',
    triggerLabel: 'Álbum 100% / Pacote: Benedict Cumberbatch (Mago Supremo)',
    starId: 'cf_benedict_cumberbatch',
    badge: '🔮 SEGREDO • MULTIVERSO',
    moodChip: '🔮 Rival Místico',
    moodPolarity: 'neutral',
    motion: 'jump',
    soundMood: 'neutral',
    lines: [
      'Um Mago brincando com portais? Guarde sua feitiçaria, Doutor… aqui quem dobra a realidade é o magnetismo [[purple:35mm]].',
      'Multiverso pra lá, feitiço pra cá… experimenta abrir um portal perto desses meus rolos de ferro pra ver o que acontece.',
    ],
  },
  {
    id: 'mag_secret_stark',
    triggerLabel: 'Álbum 100% / Pacote: Robert Downey Jr. (Homem de Ferro)',
    starId: 'cf_robert_downey_jr',
    badge: '🤖 SEGREDO • ARMADURA DE FERRO',
    moodChip: '😏 Alvo Fácil',
    moodPolarity: 'happy',
    motion: 'jump',
    soundMood: 'happy',
    lines: [
      'Uma armadura inteira de [[gold:ferro]] caminhando na minha frente? Você realmente quer testar a sorte perto de mim, Stark?',
      'Gênio, bilionário… vestido dentro de uma lata gigante na frente do mestre do magnetismo. Que ideia brilhante!',
    ],
  },
  {
    id: 'mag_secret_xmen_movie',
    triggerLabel: 'Catálogo: Cadastrou Filme X-Men / Mutante',
    starId: null,
    badge: '🧬 SEGREDO • MUTANTES NA TELA',
    moodChip: '🧬 Orgulho Mutante',
    moodPolarity: 'chaos',
    motion: 'spin',
    soundMood: 'happy',
    lines: [
      '[[purple:Mutantes]] na tela… lembre-se sempre: nós somos o próximo degrau deste catálogo, não peças descartáveis!',
      'Cada filme dessa saga na sua lista carrega metade do meu coração de metal — trate essa obra com respeito.',
    ],
  },
];

export function buildMagnetoWorldReaction({ triggerId, seed = 0 }) {
  const trigger =
    MAGNETO_WORLD_TRIGGERS.find((t) => t.id === triggerId) || MAGNETO_WORLD_TRIGGERS[0];
  const line = trigger.lines[Math.abs(Number(seed) || 0) % trigger.lines.length];
  return {
    eventId: trigger.id,
    contextBadge: trigger.contextBadge,
    skinId: 'magneto',
    poseId: 'neutral',
    bubbleTheme: HARLEQUIN_BUBBLE_STYLES.magneto,
    dialogue: line,
    moodChip: trigger.moodChip,
    moodPolarity: trigger.moodPolarity,
    motion: trigger.motion,
    soundMood: trigger.soundMood,
    silentSound: Boolean(trigger.silentSound),
    emotional: Boolean(trigger.emotional),
  };
}

export function buildMagnetoSecretReaction({ secretId, seed = 0 }) {
  const sec =
    MAGNETO_SECRET_EASTER_EGGS.find((s) => s.id === secretId) || MAGNETO_SECRET_EASTER_EGGS[0];
  const line = sec.lines[Math.abs(Number(seed) || 0) % sec.lines.length];
  const baseTheme = HARLEQUIN_BUBBLE_STYLES.magneto;
  const bubbleTheme = sec.bubbleBorderOverride
    ? {
        ...baseTheme,
        border: sec.bubbleBorderOverride,
        accent: sec.bubbleBorderOverride,
      }
    : baseTheme;
  return {
    eventId: sec.id,
    contextBadge: sec.badge,
    skinId: 'magneto',
    poseId: 'neutral',
    bubbleTheme,
    dialogue: line,
    moodChip: sec.moodChip,
    moodPolarity: sec.moodPolarity,
    motion: sec.motion,
    soundMood: sec.soundMood,
    silentSound: Boolean(sec.silentSound),
    emotional: Boolean(sec.emotional),
  };
}

const SKIN_BURST_SYMBOLS = {
  classic: ['♠', '♦', '♪', '✦', '♣', '♥'],
  magneto: ['⚡', '◈', '✦', '♪', '★', 'M'],
  brasileiro: ['☀', '★', '♪', '🎬', '✦', '🌵'],
  terror: ['🩸', '🔪', '✕', '🕯', '🦇', '★'],
};

export function createHarlequinBurstParticles(skinId = 'classic') {
  const symbols = SKIN_BURST_SYMBOLS[skinId] || SKIN_BURST_SYMBOLS.classic;
  return Array.from({ length: 8 }, (_, idx) => {
    const angle =
      -Math.PI / 2 +
      ((idx - 3.5) / 3.8) * Math.PI * 0.92 +
      (Math.random() - 0.5) * 0.25;
    const dist = 76 + Math.random() * 52;
    return {
      id: `${idx}_${Math.random().toString(36).slice(2, 6)}`,
      sym: symbols[idx % symbols.length],
      tx: `${Math.round(Math.cos(angle) * dist)}px`,
      ty: `${Math.round(Math.sin(angle) * dist - 14)}px`,
      rot: `${Math.round((Math.random() - 0.5) * 90)}deg`,
      delay: `${idx * 18}ms`,
    };
  });
}

export function buildHarlequinFrameGradient(frameId, primaryColor, secondaryColor) {
  if (frameId === 'prism_holo') {
    return 'linear-gradient(135deg, #38bdf8, #a855f7, #facc15, #34d399, #f43f5e)';
  }
  if (frameId === 'magneto_forge') {
    return 'linear-gradient(155deg, #ef4444, #a855f7 55%, #3b0764)';
  }
  if (frameId === 'noir_deco') {
    return 'linear-gradient(155deg, #fde68a, #b45309 45%, #27272a 85%, #d4a359)';
  }
  if (frameId === 'cangaco_couro') {
    return 'linear-gradient(155deg, #fbbf24, #b45309 45%, #451a03 82%, #10b981)';
  }
  if (frameId === 'slasher_arame') {
    return 'linear-gradient(155deg, #e11d48, #450a0a 52%, #18181b 82%, #dc2626)';
  }
  return `linear-gradient(155deg, ${secondaryColor}, ${primaryColor}, #18181b 75%, ${primaryColor})`;
}
