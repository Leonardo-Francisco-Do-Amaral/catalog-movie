import { WALK_OF_FAME_CURATED_MOVIES } from './walkOfFameCuratedMovies';

export type WalkAlameda = 'brasil' | 'vozes' | 'hollywood' | 'grupos';
export type WalkStarKind = 'actor' | 'dublador' | 'group';

export interface WalkMilestoneTier {
  thresholdPct: number;
  id: string;
  label: string;
  tierKey: 'bronze' | 'silver' | 'epic' | 'gold' | 'mythic' | 'diamond';
  icon: string;
  accentHex: string;
}

export const WALK_MILESTONES: WalkMilestoneTier[] = [
  { thresholdPct: 15, id: 'teste_elenco', label: 'Teste de Elenco', tierKey: 'bronze', icon: '🎟️', accentHex: '#cd7f32' },
  { thresholdPct: 30, id: 'rouba_cena', label: 'Rouba-Cena', tierKey: 'silver', icon: '🎬', accentHex: '#cbd5e1' },
  { thresholdPct: 45, id: 'holofotes', label: 'Queridinho dos Holofotes', tierKey: 'epic', icon: '📸', accentHex: '#a855f7' },
  { thresholdPct: 60, id: 'estrela_calcada', label: 'Estrela na Calçada', tierKey: 'gold', icon: '🌟', accentHex: '#f59e0b' },
  { thresholdPct: 75, id: 'lenda_viva', label: 'Lenda Viva do Set', tierKey: 'mythic', icon: '🔥', accentHex: '#f43f5e' },
  { thresholdPct: 90, id: 'imortal', label: 'Imortal da Sétima Arte', tierKey: 'diamond', icon: '💎', accentHex: '#38bdf8' },
];

export const WALK_MILESTONE_XP: Record<number, number> = {
  15: 20,
  30: 30,
  45: 40,
  60: 55,
  75: 75,
  90: 105,
};

export const WALK_EXTRA_STAR_XP = 60;
export const WALK_FILMS_PER_EXTRA_STAR = 2;

export const GENRE_CLASS_BY_NAME: Record<string, string> = {
  Drama: 'Oráculo do Drama',
  Comédia: 'Bardo do Humor',
  Ação: 'Paladino da Ação',
  Terror: 'Caçador das Sombras',
  'Ficção Científica': 'Crononauta Sci-Fi',
  Suspense: 'Estrategista do Suspense',
  Mistério: 'Detetive Arcano',
  Animação: 'Forjador de Mundos',
  Fantasia: 'Mago da Fantasia',
  Aventura: 'Explorador Lendário',
  Crime: 'Infiltrador Noir',
};

export interface WalkOfFameXpStarEntry {
  starId: string;
  name: string;
  icon: string;
  claimedPct: number;
  claimedExtraStars: number;
  xp: number;
}

export interface WalkOfFameXpSummary {
  claimedStarsCount: number;
  totalClaimedExtraStars: number;
  milestonesXp: number;
  extraStarsXp: number;
  totalXp: number;
  starsById: Record<string, WalkOfFameXpStarEntry>;
}

export const EMPTY_WALK_OF_FAME_XP_SUMMARY: WalkOfFameXpSummary = {
  claimedStarsCount: 0,
  totalClaimedExtraStars: 0,
  milestonesXp: 0,
  extraStarsXp: 0,
  totalXp: 0,
  starsById: {},
};

export function computeWalkXpSplit(
  percentage: number,
  extraStars: number
): { milestonesXp: number; extraStarsXp: number; totalXp: number } {
  let milestonesXp = 0;
  if (percentage >= 15) milestonesXp += WALK_MILESTONE_XP[15];
  if (percentage >= 30) milestonesXp += WALK_MILESTONE_XP[30];
  if (percentage >= 45) milestonesXp += WALK_MILESTONE_XP[45];
  if (percentage >= 60) milestonesXp += WALK_MILESTONE_XP[60];
  if (percentage >= 75) milestonesXp += WALK_MILESTONE_XP[75];
  if (percentage >= 90) milestonesXp += WALK_MILESTONE_XP[90];
  const extraStarsXp = Math.max(0, Number(extraStars || 0)) * WALK_EXTRA_STAR_XP;
  return {
    milestonesXp,
    extraStarsXp,
    totalXp: milestonesXp + extraStarsXp,
  };
}

export function computeWalkXpForStar(percentage: number, extraStars: number): number {
  return computeWalkXpSplit(percentage, extraStars).totalXp;
}

export function resolveRpgRank(percentage: number, extraStars = 0): string {
  if (percentage >= 90 && extraStars > 0) return 'SS';
  if (percentage >= 90) return 'S';
  if (percentage >= 75) return 'A+';
  if (percentage >= 60) return 'A';
  if (percentage >= 45) return 'B';
  if (percentage >= 30) return 'C';
  if (percentage >= 15) return 'D';
  return 'E';
}

export function resolveRpgClassLabel(options: {
  kind: WalkStarKind | string;
  isDeceased?: boolean;
  dominantGenre?: string | null;
  fallbackTitle?: string | null;
}): string {
  if (options.isDeceased) return 'Guardião Eterno';
  if (options.kind === 'dublador') return 'Mestre das Vozes';
  if (options.kind === 'group') return 'Aliança do Elenco';
  if (options.dominantGenre && GENRE_CLASS_BY_NAME[options.dominantGenre]) {
    return GENRE_CLASS_BY_NAME[options.dominantGenre];
  }
  return options.fallbackTitle || 'Lenda do Cinema';
}

export interface WalkAlamedaMeta {
  id: WalkAlameda;
  label: string;
  icon: string;
  subtitle: string;
}

export const WALK_ALAMEDAS: WalkAlamedaMeta[] = [
  { id: 'brasil', label: 'Alameda Brasil', icon: '🇧🇷', subtitle: 'Ícones do cinema nacional e do mundo' },
  { id: 'vozes', label: 'Vozes Imortais', icon: '🎙️', subtitle: 'Lendas eternas da dublagem brasileira' },
  { id: 'hollywood', label: 'Hollywood Boulevard', icon: '🌟', subtitle: 'Estrelas globais da telona' },
  { id: 'grupos', label: 'Elencos & Duplas', icon: '👥', subtitle: 'Equipes e duos inseparáveis' },
];

export interface WalkGroupMemberDef {
  name: string;
  roleLabel: string;
  searchQuery: string;
  wikiTitle: string;
  oscarWins?: number;
  oscarNominations?: number;
}

export interface WalkCuratedMovieReq {
  name: string;
  patterns: string[];
  year?: number;
  exclude?: string[];
  requireAdditionalPatterns?: string[];
  character?: string;
}

export interface WalkStarDefinition {
  id: string;
  albumNumber: number;
  name: string;
  searchQuery: string;
  wikiTitle: string;
  alameda: WalkAlameda;
  kind: WalkStarKind;
  icon: string;
  tagline: string;
  knownFor: string;
  quote: string;
  curiosities: string[];
  secretFact?: string;
  rpgTitle?: string;
  isPosthumous?: boolean;
  ceilingOverride?: number;
  oscarWins?: number;
  oscarNominations?: number;
  groupMembers?: WalkGroupMemberDef[];
}

export const WALK_OF_FAME_STARS: WalkStarDefinition[] = [
  {
    id: 'cf_fernanda_torres',
    albumNumber: 1,
    name: 'Fernanda Torres',
    searchQuery: 'Fernanda Torres',
    wikiTitle: 'Fernanda_Torres',
    alameda: 'brasil',
    kind: 'actor',
    icon: '🏆',
    oscarWins: 0,
    oscarNominations: 1,
    tagline: 'A Princesa do Brasil — Cultura no Sangue e Talento Puro',
    knownFor: 'Globo de Ouro • Ainda Estou Aqui • Os Normais',
    quote: 'A gente não desiste da cultura porque ela é a memória viva de quem fomos.',
    rpgTitle: 'Herdeira da Coroa Dramática',
    secretFact: 'Estreou no cinema ainda adolescente aos 17 anos em "Inocência" (1983) e, ao ser indicada ao Oscar em 2025, formou ao lado de Fernanda Montenegro um dos raríssimos pares mãe-filha indicados na história da Academia.',
    curiosities: [
      'Conquistou a Palma de Melhor Atriz em Cannes aos 20 anos por "Eu Sei Que Vou Te Amar" (1986).',
      'Venceu o Globo de Ouro 2025 de Melhor Atriz em Drama por "Ainda Estou Aqui", 25 anos após a indicação da mãe, Fernanda Montenegro.',
      'Também é romancista e cronista premiada, autora de livros como "Fim" e "A Glória e Seu Cortejo de Horrores".',
    ],
  },
  {
    id: 'cf_fernanda_montenegro',
    albumNumber: 2,
    name: 'Fernanda Montenegro',
    searchQuery: 'Fernanda Montenegro',
    wikiTitle: 'Fernanda_Montenegro',
    alameda: 'brasil',
    kind: 'actor',
    icon: '👑',
    oscarWins: 0,
    oscarNominations: 1,
    tagline: 'A Rainha Absoluta — Patrimônio Nacional Tombado',
    knownFor: 'Central do Brasil • O Auto da Compadecida • Eles Não Usam Black-Tie',
    quote: 'O palco e a tela são onde a humanidade se olha sem máscara.',
    rpgTitle: 'Guardiã Imortal da Dramaturgia',
    secretFact: 'Aos 95 anos, bateu o recorde mundial do Guinness ao reunir mais de 15 mil pessoas em leitura filosófica gratuita ao ar livre no Parque Ibirapuera.',
    curiosities: [
      'Foi a primeira atriz brasileira indicada ao Oscar de Melhor Atriz, por "Central do Brasil" (1998).',
      'Venceu o Emmy Internacional em 2013 por "Doce de Mãe" e ocupa cadeira na Academia Brasileira de Letras.',
      'Seu nome de batismo é Arlette Pinheiro Esteves da Silva; adotou "Fernanda" inspirada em personagens literárias.',
    ],
  },
  {
    id: 'cf_wagner_moura',
    albumNumber: 3,
    name: 'Wagner Moura',
    searchQuery: 'Wagner Moura',
    wikiTitle: 'Wagner_Moura',
    alameda: 'brasil',
    kind: 'actor',
    icon: '🎖️',
    tagline: 'O Rei do Brasil — Pede pra Sair ou Leva a Estatueta',
    knownFor: 'Tropa de Elite • Guerra Civil • Narcos',
    quote: 'Pede pra sair! O Capitão Nascimento virou símbolo cultural atravessando gerações.',
    rpgTitle: 'Comandante Tático da Tela',
    secretFact: 'Aprendeu espanhol fluentemente em apenas alguns meses vivendo na Colômbia para viver Pablo Escobar em "Narcos", sendo indicado ao Globo de Ouro mesmo atuando em segunda língua.',
    curiosities: [
      'É formado em Jornalismo pela UFBA e atuava nos palcos baianos com Lázaro Ramos e Vladimir Brichta.',
      'Passou por treinamento real do BOPE para viver o Capitão Nascimento em "Tropa de Elite", vencedor do Urso de Ouro em Berlim.',
      'Além de atuar, dirigiu "Marighella" (2019) e estrelou produções internacionais como "Guerra Civil" (A24).',
    ],
  },
  {
    id: 'cf_paulo_gustavo',
    albumNumber: 4,
    name: 'Paulo Gustavo',
    searchQuery: 'Paulo Gustavo',
    wikiTitle: 'Paulo_Gustavo',
    alameda: 'brasil',
    kind: 'actor',
    icon: '🕊️',
    tagline: 'Rir É um Ato de Resistência — O Eterno Paulo Gustavo',
    knownFor: 'Minha Mãe É uma Peça • Os Homens São de Marte • Vai que Cola',
    quote: 'Rir é um ato de resistência! Fazer o Brasil se enxergar na própria família sempre foi sua maior magia.',
    rpgTitle: 'Arauto Eterno do Riso',
    secretFact: 'Os três filmes de "Minha Mãe É uma Peça" somados venderam mais de 26 milhões de ingressos — transformando uma criação teatral íntima no maior fenômeno de público do cinema brasileiro.',
    isPosthumous: true,
    curiosities: [
      'Dona Hermínia foi inspirada diretamente em sua mãe, Déa Lúcia, e transformou a peça teatral em uma das maiores bilheterias da história do Brasil.',
      '"Minha Mãe É uma Peça 3" ultrapassou 11 milhões de espectadores nos cinemas brasileiros.',
      'Começou no teatro estudando na Casa das Artes de Laranjeiras (CAL) antes de revolucionar a comédia nacional.',
    ],
  },
  {
    id: 'cf_leandro_hassum',
    albumNumber: 5,
    name: 'Leandro Hassum',
    searchQuery: 'Leandro Hassum',
    wikiTitle: 'Leandro_Hassum',
    alameda: 'brasil',
    kind: 'actor',
    icon: '😂',
    tagline: 'O Campeão da Comédia Brasileira',
    knownFor: 'Até que a Sorte Nos Separe • O Candidato Honesto • Tudo Bem no Natal que Vem',
    quote: 'Humor popular feito com entrega de corpo inteiro — do improviso no palco às telonas do mundo.',
    rpgTitle: 'Campeão das Bilheterias',
    secretFact: 'Seu humor físico conquistou tanto o mercado internacional que foi escolhido para estrelar remakes estrangeiros nos EUA e alcançou #1 global na Netflix em dezenas de países simultaneamente.',
    curiosities: [
      'Liderou dezenas de comédias de bilheteria milionária no Brasil nos anos 2010 e levou "Tudo Bem no Natal que Vem" ao topo global da Netflix.',
      'Também dublou personagens icônicos no Brasil, incluindo Gru em toda a franquia "Meu Malvado Favorito".',
      'Começou a carreira ainda jovem no grupo de teatro Tablado, no Rio de Janeiro.',
    ],
  },
  {
    id: 'cf_isaac_bardavid',
    albumNumber: 6,
    name: 'Isaac Bardavid',
    searchQuery: 'Isaac Bardavid',
    wikiTitle: 'Isaac_Bardavid',
    alameda: 'vozes',
    kind: 'dublador',
    icon: '🐺',
    tagline: 'Não Entra no Meu Caminho, Pirralho — Tributo Eterno',
    knownFor: 'Wolverine (Hugh Jackman) • Esqueleto (He-Man) • Tigrão • Obi-Wan',
    quote: 'Não entra no meu caminho, pirralho! — A voz rasgada e inesquecível do Wolverine no Brasil.',
    rpgTitle: 'Voz Imortal de Adamantium',
    secretFact: 'Além da dublagem e das novelas, Isaac também era poeta publicado e escreveu livros de versos bem-humorados guardando com carinho o abraço histórico que recebeu de Hugh Jackman no The Noite.',
    isPosthumous: true,
    ceilingOverride: 20,
    curiosities: [
      'Emprestou a voz ao Wolverine de Hugh Jackman durante décadas, recebendo homenagem emocionada do próprio astro em visita ao Brasil.',
      'Foi o lendário Esqueleto em "He-Man", o Tigrão clássico da Disney, K.I.T.T. em "A Super Máquina" e Robotnik em "Sonic".',
      'Trabalhou por mais de 60 anos entre rádio, teatro, novelas (como "Escrava Isaura") e estúdios de dublagem.',
    ],
  },
  {
    id: 'cf_wendel_bezerra',
    albumNumber: 7,
    name: 'Wendel Bezerra',
    searchQuery: 'Wendel Bezerra',
    wikiTitle: 'Wendel_Bezerra',
    alameda: 'vozes',
    kind: 'dublador',
    icon: '🎙️',
    tagline: 'Oi, Eu Sou o Goku! — O Camaleão da Dublagem',
    knownFor: 'Robert Pattinson • Bear Grylls • Samwise Gamgee • Jackie Chan',
    quote: 'De heróis de anime a Batman e Bear Grylls: quando Wendel entra no estúdio, o filme ganha alma brasileira.',
    rpgTitle: 'Mestre das Mil Vozes',
    secretFact: 'Começou a trabalhar em estúdios de dublagem ainda criança na década de 1980 e chegou a dirigir e dublar simultaneamente cenas inteiras em que contracenava com personagens que ele mesmo criou.',
    ceilingOverride: 20,
    curiosities: [
      'É a voz oficial no Brasil de Goku ("Dragon Ball") e Bob Esponja, dois extremos vocais opostos.',
      'No cinema live-action, é a voz recorrente de Robert Pattinson ("The Batman", "Crepúsculo"), Samwise Gamgee ("O Senhor dos Anéis") e Bear Grylls.',
      'Também dirige dublagem e fundou a UniDub, um dos maiores estúdios de dublagem do país.',
    ],
  },
  {
    id: 'cf_robert_downey_jr',
    albumNumber: 8,
    name: 'Robert Downey Jr.',
    searchQuery: 'Robert Downey Jr.',
    wikiTitle: 'Robert_Downey_Jr.',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🦾',
    oscarWins: 1,
    oscarNominations: 3,
    tagline: 'Muito Mais que o Homem de Ferro e o Doutor Destino',
    knownFor: 'Oppenheimer • Homem de Ferro • Sherlock Holmes • Chaplin',
    quote: 'Eu sou o Homem de Ferro — e uma das maiores histórias de renascimento e talento de Hollywood.',
    rpgTitle: 'Engenheiro da Redenção',
    secretFact: 'Para interpretar Charles Chaplin em 1992, aprendeu a tocar violino e a jogar tênis com a mão esquerda apenas para reproduzir os gestos originais do ícone com perfeição.',
    curiosities: [
      'Venceu o Oscar de Melhor Ator Coadjuvante por "Oppenheimer" (2023) após indicações por "Chaplin" e "Trovão Tropical".',
      'Inaugurou todo o Universo Cinematográfico Marvel em 2008 e retorna ao estúdio como Doutor Destino.',
      'Improvisou a frase final "I am Iron Man", reescrevendo o tom de todos os filmes de super-heróis seguintes.',
    ],
  },
  {
    id: 'cf_benedict_cumberbatch',
    albumNumber: 9,
    name: 'Benedict Cumberbatch',
    searchQuery: 'Benedict Cumberbatch',
    wikiTitle: 'Benedict_Cumberbatch',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🧙‍♂️',
    oscarWins: 0,
    oscarNominations: 2,
    tagline: 'Benedict Cumber... Como se Pronuncia Esse Nome Mesmo?!',
    knownFor: 'O Jogo da Imitação • Doutor Estranho • Ataque dos Cães • Sherlock',
    quote: 'Precisão britânica, voz hipnótica (inclusive como o dragão Smaug) e papéis cerebrais inesquecíveis.',
    rpgTitle: 'Mago Supremo do Multiverso',
    secretFact: 'Em "Doutor Estranho" (2016), além de viver o herói Stephen Strange, gravou secretamente a captura facial e a voz de Dormammu — enfrentando literalmente a si mesmo na Dimensão Negra.',
    curiosities: [
      'Interpretou tanto a voz quanto a captura facial e corporal do dragão Smaug em "O Hobbit".',
      'Recebeu indicações ao Oscar por "O Jogo da Imitação" (Alan Turing) e "Ataque dos Cães".',
      'Estreou em "Sherlock" (BBC) antes de assumir o Mago Supremo nos cinemas.',
    ],
  },
  {
    id: 'cf_milla_jovovich',
    albumNumber: 10,
    name: 'Milla Jovovich',
    searchQuery: 'Milla Jovovich',
    wikiTitle: 'Milla_Jovovich',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🧬',
    tagline: 'Ela Tem Nome! Rainha Absoluta da Ação e Sci-Fi',
    knownFor: 'Resident Evil • O Quinto Elemento • Monster Hunter • Joana d\'Arc',
    quote: 'De Leeloo em O Quinto Elemento a Alice em Resident Evil — presença física e estilo únicos na ficção científica.',
    rpgTitle: 'Valquíria da Ficção Científica',
    secretFact: 'Em quase toda a saga "Resident Evil", realizou pessoalmente a grande maioria das acrobacias em cabos sem dublê — e foi exatamente durante as filmagens da franquia que conheceu o marido Paul W.S. Anderson.',
    curiosities: [
      'Falou uma língua fictícia de 400 palavras inventada por Luc Besson em "O Quinto Elemento" — e praticava conversando em cartas com o diretor.',
      'Liderou 6 filmes de "Resident Evil", uma das franquias de games mais lucrativas do cinema.',
      'Começou a modelar aos 11 anos, lançou álbum musical folk em 1994 e fala quatro idiomas.',
    ],
  },
  {
    id: 'cf_will_smith',
    albumNumber: 11,
    name: 'Will Smith',
    searchQuery: 'Will Smith',
    wikiTitle: 'Will_Smith',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🕶️',
    oscarWins: 1,
    oscarNominations: 4,
    tagline: 'Um Maluco nas Telas — Do Pedaço até o Oscar',
    knownFor: 'À Procura da Felicidade • Eu Sou a Lenda • MIB • King Richard',
    quote: 'Carisma de blockbuster que arrasta multidões desde os anos 90 até o Oscar por King Richard.',
    rpgTitle: 'Príncipe dos Blockbusters',
    secretFact: 'Quase entrou para a história como Neo em "Matrix" — mas recusou o convite por não ter entendido o pitch visual na época e foi fazer "As Loucas Aventuras de James West", abrindo caminho para Keanu Reeves.',
    curiosities: [
      'Foi o primeiro rapper a ganhar um Grammy antes mesmo de estourar como ator em "Um Maluco no Pedaço".',
      'Encadeou 8 filmes consecutivos estreando em #1 nas bilheterias dos EUA (recorde histórico de Hollywood).',
      'Venceu o Oscar de Melhor Ator em 2022 interpretando Richard Williams em "King Richard".',
    ],
  },
  {
    id: 'cf_jim_parsons',
    albumNumber: 12,
    name: 'Jim Parsons',
    searchQuery: 'Jim Parsons',
    wikiTitle: 'Jim_Parsons',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '⚛️',
    tagline: 'Bazinga! O Sheldon Cooper Fora de Pasadena',
    knownFor: 'Estrelas Além do Tempo • Cada Um na Sua Casa • The Normal Heart',
    quote: 'Muito além do "Bazinga": drama premiado, animação e comédia cult fora do apartamento 4A.',
    rpgTitle: 'Arquimago da Precisão',
    secretFact: 'Antes de conquistar o papel de Sheldon Cooper no teste final, Jim havia feito dezenas de pilotos rejeitados na TV e quase abandonou o teste por achar o ritmo dos diálogos rápido demais — até encaixar na primeira leitura com Chuck Lorre.',
    curiosities: [
      'Ganhou 4 prêmios Emmy de Melhor Ator em Comédia como Sheldon Cooper em "The Big Bang Theory".',
      'Brilhou em dramas aclamados como "The Normal Heart" (HBO) e "Estrelas Além do Tempo" (2016).',
      'Também deu voz ao alienígena Oh na animação da DreamWorks "Cada Um na Sua Casa" (2015).',
    ],
  },
  {
    id: 'cf_jacob_tremblay',
    albumNumber: 13,
    name: 'Jacob Tremblay',
    searchQuery: 'Jacob Tremblay',
    wikiTitle: 'Jacob_Tremblay',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🧒',
    tagline: 'Ontem Era Criança... Hoje Tem Mais Carreira que Muita Gente',
    knownFor: 'O Quarto de Jack • Extraordinário • Luca • Doutor Sono',
    quote: 'Aos 9 anos já arrepiou o mundo em O Quarto de Jack — e não parou de colecionar obras emocionantes.',
    rpgTitle: 'Prodígio da Sétima Arte',
    secretFact: 'Em "O Quarto de Jack", dormia de verdade em várias pausas no set minúsculo construído em galpão e pedia a Brie Larson para brincar de Star Wars entre as cenas pesadas para aliviar o clima do elenco.',
    curiosities: [
      'Aos 9 anos, venceu o Critics Choice Award de Melhor Jovem Ator por "O Quarto de Jack" (2015).',
      'Passava até 4 horas na cadeira de próteses diariamente para interpretar Auggie Pullman em "Extraordinário".',
      'Deu voz ao protagonista de "Luca" (Pixar) e ao Linguado no live-action de "A Pequena Sereia".',
    ],
  },
  {
    id: 'cf_tom_cruise',
    albumNumber: 14,
    name: 'Tom Cruise',
    searchQuery: 'Tom Cruise',
    wikiTitle: 'Tom_Cruise',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '✈️',
    oscarWins: 0,
    oscarNominations: 4,
    tagline: 'Ele Não Usa Dublê Nem pra Cair do Espaço!',
    knownFor: 'Top Gun: Maverick • Missão Impossível • No Limite do Amanhã • Magnólia',
    quote: 'Quando a câmera liga, Tom Cruise realmente pula do avião, pilota o caça e escala o prédio mais alto do mundo.',
    rpgTitle: 'Temerário Sem Limites',
    secretFact: 'Para a cena de queda HALO em "Missão Impossível: Efeito Fallout", realizou mais de 100 saltos reais de avião acima de 7.500 metros de altitude, com capacete iluminado por dentro exclusivamente para a filmagem.',
    curiosities: [
      'Aprendeu a pilotar helicópteros, caças acrobáticos e segurou a respiração por mais de 6 minutos debaixo d\'água para "Missão Impossível".',
      'Trabalhou com mestres como Stanley Kubrick, Martin Scorsese, Steven Spielberg e Paul Thomas Anderson.',
      'Recebeu 4 indicações ao Oscar e foi homenageado pela Palma de Ouro Honorária em Cannes.',
    ],
  },
  {
    id: 'cf_johnny_depp',
    albumNumber: 15,
    name: 'Johnny Depp',
    searchQuery: 'Johnny Depp',
    wikiTitle: 'Johnny_Depp',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🏴‍☠️',
    oscarWins: 0,
    oscarNominations: 3,
    tagline: 'O Homem das Mil Caras e Maquiagens',
    knownFor: 'Piratas do Caribe • Edward Mãos de Tesoura • Sweeney Todd • Ed Wood',
    quote: 'Capitão Jack Sparrow, Edward ou Chapeleiro — onde há excentricidade e sombra gótica, ele brilha.',
    rpgTitle: 'Metamorfo dos Sete Mares',
    secretFact: 'Executivos da Disney quase demitiram Depp na primeira semana de "Piratas do Caribe" por acharem seu Jack Sparrow excêntrico demais — meses depois, exatamente essa escolha deu a ele sua primeira indicação ao Oscar.',
    curiosities: [
      'A parceria criativa com Tim Burton rendeu oito filmes cult, começando em "Edward Mãos de Tesoura" (1990).',
      'Modelou os trejeitos de Jack Sparrow inspirando-se em Keith Richards (Rolling Stones) e no gambá Pepé Le Pew.',
      'Estreou no cinema ainda jovem no terror clássico "A Hora do Pesadelo" (1984).',
    ],
  },
  {
    id: 'cf_nicolas_cage',
    albumNumber: 16,
    name: 'Nicolas Cage',
    searchQuery: 'Nicolas Cage',
    wikiTitle: 'Nicolas_Cage',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🔥',
    oscarWins: 1,
    oscarNominations: 2,
    tagline: 'Ele Aceita Qualquer Roteiro! (O Culto a Nicolas Cage)',
    knownFor: 'A Outra Face • Despedida em Las Vegas • Pig • Motoqueiro Fantasma',
    quote: 'Do Oscar dramático ao caos absoluto — nunca existe atuação morna quando Nicolas Cage está no elenco.',
    rpgTitle: 'Alquimista do Caos Cult',
    secretFact: 'Batizou seu próprio estilo dramático de "Nouveau Shamanic" — misturando expressionismo alemão e kabuki japonês — e afirmou que atuar em "Pig" (2021) trouxe sua atuação favorita de toda a carreira.',
    curiosities: [
      'Venceu o Oscar de Melhor Ator por "Despedida em Las Vegas" (1995), antes de virar lenda dos blockbusters e filmes cult.',
      'Adotou o sobrenome "Cage" em homenagem ao herói da Marvel Luke Cage (seu nome original é Nicolas Coppola, sobrinho de Francis Ford Coppola).',
      'Interpretou a si mesmo na metalinguagem de "O Peso do Talento" (2022) e deu voz ao Homem-Aranha Noir.',
    ],
  },
  {
    id: 'cf_samuel_l_jackson',
    albumNumber: 17,
    name: 'Samuel L. Jackson',
    searchQuery: 'Samuel L. Jackson',
    wikiTitle: 'Samuel_L._Jackson',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '💼',
    oscarWins: 0,
    oscarNominations: 1,
    tagline: 'O Ator Mais Presente da História do Cinema',
    knownFor: 'Pulp Fiction • Os Vingadores • Django Livre • Corpo Fechado',
    quote: 'Se existe uma grande franquia ou um clássico de Tarantino, há 99% de chance do Samuel L. Jackson estar lá.',
    rpgTitle: 'Senhor de Todas as Franquias',
    secretFact: 'Na juventude sofreu de gagueira severa e descobriu que usar expressões fortes como ritmo vocal ajudava a destravar a fala — transformando o antigo obstáculo em sua marca registrada nas telonas.',
    curiosities: [
      'Somando bilheterias de suas participações (Marvel, Star Wars, Pixar, Jurassic Park, Tarantino), figura entre os atores mais lucrativos da história.',
      'Recebeu o Oscar Honorário em 2022 e foi indicado por Jules Winnfield em "Pulp Fiction".',
      'Exigiu contratualmente um sabre de luz roxo em "Star Wars" apenas para conseguir se localizar no meio das batalhas.',
    ],
  },
  {
    id: 'cf_margot_robbie',
    albumNumber: 18,
    name: 'Margot Robbie',
    searchQuery: 'Margot Robbie',
    wikiTitle: 'Margot_Robbie',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🎀',
    oscarWins: 0,
    oscarNominations: 3,
    tagline: 'A Rainha do Carisma — De Arlequina a Barbie',
    knownFor: 'Barbie • Eu, Tonya • O Lobo de Wall Street • Era Uma Vez em Hollywood',
    quote: 'Produtora visionária e estrela capaz de transformar comédia pop em fenômeno cultural bilionário.',
    rpgTitle: 'Soberana dos Holofotes',
    secretFact: 'Em "O Esquadrão Suicida", aprendeu a segurar a respiração embaixo d\'água por 5 minutos e executou pessoalmente a cena de ação giratória da Arlequina usando apenas os pés e pernas.',
    curiosities: [
      'Co-fundou a produtora LuckyChap Entertainment para impulsionar obras protagonizadas e dirigidas por mulheres, produzindo "Barbie", "Bela Vingança" e "Eu, Tonya".',
      'Garantiu seu papel em "O Lobo de Wall Street" improvisando um tapa em Leonardo DiCaprio durante o teste.',
      'Aprendeu patinação artística profissional por meses para protagonizar "Eu, Tonya" (indicada ao Oscar).',
    ],
  },
  {
    id: 'cf_anya_taylor_joy',
    albumNumber: 19,
    name: 'Anya Taylor-Joy',
    searchQuery: 'Anya Taylor-Joy',
    wikiTitle: 'Anya_Taylor-Joy',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '♟️',
    tagline: 'Olhos que Hipnotizam a Câmera',
    knownFor: 'A Bruxa • Furiosa • O Menu • Fragmentado • Noite Passada em Soho',
    quote: 'Do folk-horror minimalista ao deserto pós-apocalíptico de Mad Max — magnetismo puro em cada plano.',
    rpgTitle: 'Rainha do Tabuleiro Sombrio',
    secretFact: 'Sem sequer ter carteira de motorista quando foi escalada para "Furiosa", aprendeu direção de dublês de alto impacto (incluindo manobras de derrapagem 180° em caminhões de guerra no deserto australiano).',
    curiosities: [
      'Cresceu entre Buenos Aires e Londres e aprendeu inglês lendo livros de Harry Potter aos 8 anos.',
      'Estreou explodindo na crítica mundial com "A Bruxa" (2015), de Robert Eggers.',
      'Venceu o Globo de Ouro por "O Gambito da Rainha" e assumiu a versão jovem da Imperatriz Furiosa.',
    ],
  },
  {
    id: 'cf_pedro_pascal',
    albumNumber: 20,
    name: 'Pedro Pascal',
    searchQuery: 'Pedro Pascal',
    wikiTitle: 'Pedro_Pascal',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🛡️',
    tagline: 'O Pai Protetor Mais Requisitado de Hollywood',
    knownFor: 'Gladiador II • O Peso do Talento • Mulher-Maravilha 1984 • O Robô Selvagem',
    quote: 'Carisma chileno que conquistou Hollywood depois dos 40 — sempre com coração, humor e ação.',
    rpgTitle: 'Paladino Protetor da Galáxia',
    secretFact: 'Passou anos dormindo em sofás de amigos em Nova York trabalhando como garçom e quase desistiu de atuar antes da audição gravada às pressas no celular que lhe garantiu Oberyn Martell — graças à ajuda decisiva de Sarah Paulson.',
    curiosities: [
      'Nasceu em Santiago do Chile durante a ditadura militar; sua família recebeu asilo político na Dinamarca e depois mudou-se para os EUA.',
      'Trabalhou por quase 20 anos em participações pontuais antes de estourar como Oberyn Martell e dominar cinema e TV.',
      'Conhecido nos bastidores pela amizade inseparável com Nicolas Cage, Bella Ramsey e Oscar Isaac.',
    ],
  },
  {
    id: 'cf_supernatural_trio',
    albumNumber: 21,
    name: 'Trio Supernatural (Winchester & Castiel)',
    searchQuery: 'Jensen Ackles',
    wikiTitle: 'Jensen_Ackles',
    alameda: 'grupos',
    kind: 'group',
    icon: '🚘',
    tagline: 'O Negócio da Família: Salvar Pessoas e Caçar Monstros',
    knownFor: 'Jensen Ackles • Jared Padalecki • Misha Collins fora do Impala',
    quote: 'Saving people, hunting things — os filmes onde Sam, Dean e Castiel trocaram o Impala por outras aventuras!',
    rpgTitle: 'Caçadores da Estrada Sombria',
    secretFact: 'Ao final das 15 temporadas de Supernatural, a produção presenteou Jensen Ackles e Jared Padalecki com os próprios Chevrolet Impala 1967 originais usados na série — com chave, documentação e tudo.',
    groupMembers: [
      { name: 'Jensen Ackles', roleLabel: 'Dean Winchester', searchQuery: 'Jensen Ackles', wikiTitle: 'Jensen_Ackles' },
      { name: 'Jared Padalecki', roleLabel: 'Sam Winchester', searchQuery: 'Jared Padalecki', wikiTitle: 'Jared_Padalecki' },
      { name: 'Misha Collins', roleLabel: 'Castiel', searchQuery: 'Misha Collins', wikiTitle: 'Misha_Collins' },
    ],
    curiosities: [
      'Juntos comandaram 327 episódios ao longo de 15 temporadas de "Supernatural".',
      'Fora da série, estrelaram remakes clássicos de terror dos anos 2000 como "Sexta-Feira 13" (2009), "A Casa de Cera" e "Dia dos Namorados Macabro 3D".',
      'Jensen Ackles também dublou Jason Todd em "Batman Contra o Capuz Vermelho" e integrou o elenco de "The Boys".',
    ],
  },
  {
    id: 'cf_casal_warren',
    albumNumber: 22,
    name: 'Casal Warren (Vera & Patrick)',
    searchQuery: 'Vera Farmiga',
    wikiTitle: 'Vera_Farmiga',
    alameda: 'grupos',
    kind: 'group',
    icon: '✝️',
    oscarWins: 0,
    oscarNominations: 1,
    tagline: 'O Casal dos Warren Não Tem Folga — Ed e Lorraine',
    knownFor: 'Vera Farmiga • Patrick Wilson • Invocação do Mal • Sobrenatural',
    quote: 'Quando não estão enfrentando demônios juntos no porão dos Perron, continuam dominando o suspense e o terror!',
    rpgTitle: 'Exorcistas Supremos do Mistério',
    secretFact: 'Patrick Wilson já cantava profissionalmente na Broadway antes do cinema — por isso foi sua voz real ao violão cantando "Can\'t Help Falling in Love" para a família em "Invocação do Mal 2".',
    groupMembers: [
      { name: 'Vera Farmiga', roleLabel: 'Lorraine Warren', searchQuery: 'Vera Farmiga', wikiTitle: 'Vera_Farmiga', oscarWins: 0, oscarNominations: 1 },
      { name: 'Patrick Wilson', roleLabel: 'Ed Warren', searchQuery: 'Patrick Wilson', wikiTitle: 'Patrick_Wilson' },
    ],
    curiosities: [
      'Vera Farmiga e Patrick Wilson são pilares do Universo Invocação do Mal (que ultrapassou US$ 2 bilhões em bilheteria).',
      'Patrick Wilson também estrelou a saga "Sobrenatural" (Insidious) e interpretou o Rei Orm em "Aquaman".',
      'Vera Farmiga foi indicada ao Oscar por "Amor Sem Escalas" (Up in the Air) e brilhou em "Os Infiltrados" e "A Órfã".',
    ],
  },
  {
    id: 'cf_stranger_things_kids',
    albumNumber: 23,
    name: 'Turma de Hawkins (Stranger Things)',
    searchQuery: 'Millie Bobby Brown',
    wikiTitle: 'Millie_Bobby_Brown',
    alameda: 'grupos',
    kind: 'group',
    icon: '🎲',
    tagline: 'Eles Foram Jogar RPG em Outro Lugar (Fora de Hawkins)',
    knownFor: 'Millie Bobby Brown • Finn Wolfhard • Sadie Sink • Elenco Jovem',
    quote: 'De Enola Holmes a Ghostbusters e Rua do Medo: o Clube do Inferno espalhado pelos estúdios do mundo.',
    rpgTitle: 'Guardiões do Mundo Invertido',
    secretFact: 'Durante as audições da 1ª temporada de Stranger Things, os criadores Irmãos Duffer testaram mais de 900 meninos e 300 meninas até fechar exatamente a química real de amizade dessa turma.',
    groupMembers: [
      { name: 'Millie Bobby Brown', roleLabel: 'Eleven', searchQuery: 'Millie Bobby Brown', wikiTitle: 'Millie_Bobby_Brown' },
      { name: 'Finn Wolfhard', roleLabel: 'Mike Wheeler', searchQuery: 'Finn Wolfhard', wikiTitle: 'Finn_Wolfhard' },
      { name: 'Sadie Sink', roleLabel: 'Max Mayfield', searchQuery: 'Sadie Sink', wikiTitle: 'Sadie_Sink' },
      { name: 'Gaten Matarazzo', roleLabel: 'Dustin Henderson', searchQuery: 'Gaten Matarazzo', wikiTitle: 'Gaten_Matarazzo' },
      { name: 'Caleb McLaughlin', roleLabel: 'Lucas Sinclair', searchQuery: 'Caleb McLaughlin', wikiTitle: 'Caleb_McLaughlin' },
      { name: 'Noah Schnapp', roleLabel: 'Will Byers', searchQuery: 'Noah Schnapp', wikiTitle: 'Noah_Schnapp' },
    ],
    curiosities: [
      'Millie Bobby Brown lançou "Enola Holmes", "Godzilla II" e produziu seus próprios filmes pela Netflix ainda jovem.',
      'Finn Wolfhard integrou "It: A Coisa", "Ghostbusters: Mais Além" e "Pinóquio por Guillermo del Toro".',
      'Sadie Sink brilhou em "A Baleia" (ao lado de Brendan Fraser) e na trilogia "Rua do Medo".',
    ],
  },
  {
    id: 'cf_god_of_war',
    albumNumber: 24,
    name: 'Kratos & Atreus (Judge & Suljic)',
    searchQuery: 'Christopher Judge',
    wikiTitle: 'Christopher_Judge',
    alameda: 'grupos',
    kind: 'group',
    icon: '🪓',
    tagline: 'GAROTO! Feche Seu Coração para o Roteiro Ruim e Leia as Runas!',
    knownFor: 'God of War (Kratos & Atreus) • Mid90s • O Sacrifício do Cervo Sagrado • Stargate',
    quote: '“GAROTO!” — Quando o Fantasma de Esparta e o jovem Loki largam o Machado Leviatã em Midgard para invadir as telonas de Hollywood.',
    rpgTitle: 'Deuses da Guerra de Midgard',
    secretFact: 'Na captura de movimentos de "God of War" (2018), Christopher Judge (1,91m) precisou gravar cenas inteiras segurando o riso porque Sunny Suljic fazia manobras de skate escondido nos corredores do estúdio da Santa Monica usando o macacão cheio de bolinhas de sensores.',
    ceilingOverride: 10,
    groupMembers: [
      { name: 'Christopher Judge', roleLabel: 'Kratos (Fantasma de Esparta)', searchQuery: 'Christopher Judge', wikiTitle: 'Christopher_Judge' },
      { name: 'Sunny Suljic', roleLabel: 'Atreus / Loki ("GAROTO!")', searchQuery: 'Sunny Suljic', wikiTitle: 'Sunny_Suljic' },
    ],
    curiosities: [
      'Christopher Judge bateu o recorde do discurso mais longo da história do The Game Awards (quase 8 minutos!) ao vencer Melhor Performance por "God of War Ragnarök".',
      'Antes de quebrar o panteão nórdico como Atreus, Sunny Suljic era skatista prodígio e protagonizou "Mid90s" (dirigido por Jonah Hill) e "O Sacrifício do Cervo Sagrado" (Yorgos Lanthimos).',
      'Além de ser o eterno Teal\'c de "Stargate SG-1", Christopher Judge enfrentou o Bane no cinema em "Batman: O Cavaleiro das Trevas Ressurge" (2012), de Christopher Nolan.',
    ],
  },
  {
    id: 'cf_lazaro_ramos',
    albumNumber: 25,
    name: 'Lázaro Ramos',
    searchQuery: 'Lázaro Ramos',
    wikiTitle: 'Lázaro_Ramos',
    alameda: 'brasil',
    kind: 'actor',
    icon: '🎩',
    tagline: 'De Foguinho a Madame Satã: Se Não Tem Lázaro, Wagner Moura Nem Assina!',
    knownFor: 'Ó Paí, Ó • Meu Tio Matou um Cara • Madame Satã • O Homem que Copiava',
    quote: 'Do Bando de Teatro Olodum ao topo do cinema nacional — o homem que transforma qualquer cena em aula de carisma, ritmo baiano e potência dramática.',
    rpgTitle: 'Alquimista do Pelourinho',
    secretFact: 'Antes de viver o lendário "Madame Satã" (2002), Lázaro trabalhava como técnico de patologia em laboratório de análises clínicas em Salvador para pagar os cursos de teatro.',
    curiosities: [
      'Formou com Wagner Moura e Vladimir Brichta a "Santíssima Trindade" do teatro baiano nos anos 90 antes de dominarem o cinema brasileiro.',
      'Dirigiu o aclamado "Medida Provisória" (2022) e é autor de livros infantojuvenis e da autobiografia "Na Minha Pele".',
      'Foi indicado ao Emmy Internacional pelo fenômeno "Cobras & Lagartos" como o inesquecível Foguinho.',
    ],
  },
  {
    id: 'cf_selton_mello',
    albumNumber: 26,
    name: 'Selton Mello',
    searchQuery: 'Selton Mello',
    wikiTitle: 'Selton_Mello',
    alameda: 'brasil',
    kind: 'actor',
    icon: '🥖',
    tagline: 'Só Sei Que Foi Assim! O Chicó que Virou Diretor, Ator e Meme Filosófico',
    knownFor: 'O Auto da Compadecida • Ainda Estou Aqui • O Palhaço • Lisbela e o Prisioneiro',
    quote: '“Não sei, só sei que foi assim!” — O único ator capaz de te fazer chorar de rir como Chicó e chorar de soluçar em "Ainda Estou Aqui" no mesmo fim de semana.',
    rpgTitle: 'Poeta da Compadecida',
    secretFact: 'Nos anos 80 e 90, antes de explodir como ator adulto no cinema nacional, Selton Mello foi um dos dubladores mais requisitados do país — é dele a voz clássica de Daniel Larusso em "Karatê Kid" e dos "Goonies"!',
    curiosities: [
      'Dirigiu, roteirizou e estrelou "O Palhaço" (2011), escolhido para representar o Brasil na disputa pelo Oscar de Melhor Filme Internacional.',
      'Em "Ainda Estou Aqui" (2024), emocionou o mundo como Rubens Paiva, impulsionando a campanha histórica do filme rumo ao Oscar.',
      'Além de Chicó em "O Auto da Compadecida", deu voz ao Imperador Kuzco na dublagem brasileira clássica de "A Nova Onda do Imperador" (Disney).',
    ],
  },
  {
    id: 'cf_alice_braga',
    albumNumber: 27,
    name: 'Alice Braga',
    searchQuery: 'Alice Braga',
    wikiTitle: 'Alice_Braga',
    alameda: 'brasil',
    kind: 'actor',
    icon: '🌎',
    tagline: 'Sobreviveu a Zumbis com Will Smith, a Predadores e ao Trânsito de São Paulo!',
    knownFor: 'Cidade de Deus • Eu Sou a Lenda • Elysium • O Esquadrão Suicida • Eduardo e Mônica',
    quote: 'Passaporte carimbado em todas as galáxias: de Angélica em "Cidade de Deus" a guerreira em sci-fi de Hollywood e voz na Pixar.',
    rpgTitle: 'Embaixadora Intergaláctica do Brasil',
    secretFact: 'Sobrinha da lendária Sônia Braga, Alice fez o teste para "Cidade de Deus" (2002) escondendo da produção quem era sua tia famosa para ser avaliada exclusivamente pelo próprio talento.',
    curiosities: [
      'Depois de "Cidade de Deus", dividiu protagonismo com Will Smith em "Eu Sou a Lenda" (2007) e Matt Damon em "Elysium" (2013).',
      'Deu voz à conselheira espiritual Jerry tanto na versão original em inglês quanto na versão brasileira da animação "Soul" (Pixar), vencedora do Oscar.',
      'Venceu o Grande Prêmio do Cinema Brasileiro por "Cidade Baixa" e "Eduardo e Mônica".',
    ],
  },
  {
    id: 'cf_christian_bale',
    albumNumber: 28,
    name: 'Christian Bale',
    searchQuery: 'Christian Bale',
    wikiTitle: 'Christian_Bale',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🦇',
    oscarWins: 1,
    oscarNominations: 4,
    tagline: 'Perde 30kg na Segunda, Ganha 40kg na Sexta e É o Batman no Sábado!',
    knownFor: 'Batman: O Cavaleiro das Trevas • Psicopata Americano • O Operário • Ford vs Ferrari',
    quote: 'A nutrição humana chora, mas a Academia aplaude: o camaleão físico mais insano da história do cinema.',
    rpgTitle: 'Transmutador Cavaleiro das Trevas',
    secretFact: 'Após emagrecer 28 quilos vivendo apenas de uma maçã e uma lata de atum por dia para "O Operário" (2004), recuperou tudo e ganhou mais 45 quilos de massa muscular em apenas 6 meses para caber no uniforme de "Batman Begins" — chegando a ficar "forte demais" no primeiro dia de prova de roupa.',
    curiosities: [
      'Estreou como protagonista aos 13 anos em "Império do Sol" (1987), escolhido por Steven Spielberg entre mais de 4 mil crianças.',
      'Venceu o Oscar por "O Vencedor" (2010) e foi indicado por "Trapaça", "A Grande Aposta" e "Vice" (onde engordou 20 kg para viver Dick Cheney).',
      'Também é a voz em inglês de Howl no clássico "O Castelo Animado", do Studio Ghibli.',
    ],
  },
  {
    id: 'cf_natalie_portman',
    albumNumber: 29,
    name: 'Natalie Portman',
    searchQuery: 'Natalie Portman',
    wikiTitle: 'Natalie_Portman',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🦢',
    oscarWins: 1,
    oscarNominations: 3,
    tagline: 'Diploma em Harvard, Sabre de Luz, Mjolnir e um Cisne Negro na Estante',
    knownFor: 'Cisne Negro • O Profissional • V de Vingança • Star Wars • Closer',
    quote: 'Raspou a cabeça em cena única, formou-se em Psicologia em Harvard enquanto gravava Star Wars e dançou até o Oscar em Cisne Negro.',
    rpgTitle: 'Imperatriz do Cisne Negro',
    secretFact: 'Não compareceu à première mundial de "Star Wars: Episódio I — A Ameaça Fantasma" (1999) porque precisava estudar para as provas finais do ensino médio — e depois publicou dois artigos científicos acadêmicos em revistas de neurociência sob seu nome real (Natalie Hershlag).',
    curiosities: [
      'Estreou aos 12 anos no clássico cult "O Profissional" (Léon, 1994), ao lado de Jean Reno e Gary Oldman.',
      'Treinou balé clássico até 8 horas por dia durante um ano inteiro para protagonizar "Cisne Negro" (2010), levando o Oscar de Melhor Atriz.',
      'A cena em que tem a cabeça raspada em "V de Vingança" (2005) precisou ser gravada em tomada única real, sem possibilidade de erro.',
    ],
  },
  {
    id: 'cf_tom_holland',
    albumNumber: 30,
    name: 'Tom Holland',
    searchQuery: 'Tom Holland',
    wikiTitle: 'Tom_Holland',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🕷️',
    tagline: 'Proibido pela Marvel de Ler o Roteiro Inteiro pra Não Dar Spoiler!',
    knownFor: 'Homem-Aranha: Sem Volta Para Casa • O Impossível • O Diabo de Cada Dia • Uncharted',
    quote: 'Acrobata real, rei involuntário dos spoilers nas entrevistas e o Peter Parker que uniu três gerações do Aranhaverso.',
    rpgTitle: 'Acrobata Amigão da Vizinhança',
    secretFact: 'Depois que Tom vazou segredos demais em entrevistas, os Irmãos Russo passaram a entregar a ele apenas suas próprias falas avulsas em "Vingadores: Guerra Infinita" e "Ultimato" — em várias cenas de batalha, ele nem sabia contra qual vilão estava lutando no CGI!',
    curiosities: [
      'Começou no teatro musical em Londres interpretando Billy Elliot após dois anos de treino intensivo de balé e ginástica acrobática.',
      'Impressionou a crítica mundial ainda criança aos 16 anos no drama de sobrevivência real "O Impossível" (2012), ao lado de Naomi Watts e Ewan McGregor.',
      'Gravou pessoalmente um salto mortal para trás na fita de audição para a Marvel, convencendo Kevin Feige na hora de que era o próprio Homem-Aranha.',
    ],
  },
  {
    id: 'cf_andrew_garfield',
    albumNumber: 31,
    name: 'Andrew Garfield',
    searchQuery: 'Andrew Garfield',
    wikiTitle: 'Andrew_Garfield',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🕸️',
    oscarWins: 0,
    oscarNominations: 2,
    tagline: 'Eu Juro que NÃO Estou no Filme! (Mentiu por 1 Ano Inteiro com Cara de Paisagem)',
    knownFor: 'Até o Último Homem • Tick, Tick... Boom! • A Rede Social • O Espetacular Homem-Aranha',
    quote: 'Negou até para Emma Stone que estava em "Sem Volta Para Casa", segurou a MJ no ar para curar nosso trauma de 2014 e colecionou indicações ao Oscar.',
    rpgTitle: 'Bardo Redentor do Aranhaverso',
    secretFact: 'Para estrelar o musical "Tick, Tick... Boom!" (2021) sem nunca ter cantado profissionalmente na vida, Lin-Manuel Miranda o colocou em aulas secretas de canto lírico e piano por um ano inteiro — resultando em sua segunda indicação ao Oscar.',
    curiosities: [
      'Recebeu indicações ao Oscar de Melhor Ator por "Até o Último Homem" (2016) e "Tick, Tick... Boom!" (2021), além de vencer o Tony Award na Broadway.',
      'Ficou mundialmente famoso em "A Rede Social" (2010), de David Fincher, interpretando o cofundador brasileiro do Facebook, Eduardo Saverin.',
      'A cena em que seu Peter Parker salva a MJ de Zendaya em "Sem Volta Para Casa" levou salas de cinema do mundo inteiro às lágrimas.',
    ],
  },
  {
    id: 'cf_heath_ledger',
    albumNumber: 32,
    name: 'Heath Ledger',
    searchQuery: 'Heath Ledger',
    wikiTitle: 'Heath_Ledger',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🃏',
    oscarWins: 1,
    oscarNominations: 2,
    tagline: 'Why So Serious? O Coringa Definitivo e a Lenda que Nunca Envelhece',
    knownFor: 'Batman: O Cavaleiro das Trevas • O Segredo de Brokeback Mountain • 10 Coisas que Eu Odeio em Você',
    quote: 'De cantar "Can\'t Take My Eyes Off You" na arquibancada à anarquia hipnótica em Gotham: um gênio que eternizou cada fotograma.',
    rpgTitle: 'Príncipe Eterno do Caos',
    secretFact: 'Para construir a voz, a postura e o tique labial do Coringa, Heath isolou-se por 43 dias em um quarto de hotel em Londres escrevendo um diário inteiro como o personagem — e dirigiu pessoalmente os vídeos caseiros de ameaça que o Coringa envia à TV dentro do filme.',
    isPosthumous: true,
    ceilingOverride: 10,
    curiosities: [
      'Tornou-se o primeiro ator da história a vencer o Oscar (póstumo) por um filme de super-heróis, como o Coringa em "Batman: O Cavaleiro das Trevas" (2008).',
      'Aos 26 anos, já havia sido indicado ao Oscar de Melhor Ator pela atuação devastadora como Ennis Del Mar em "O Segredo de Brokeback Mountain" (2005).',
      'Quando faleceu durante as filmagens de "O Mundo Imaginário do Doutor Parnassus", Johnny Depp, Jude Law e Colin Farrell assumiram versões do seu personagem no espelho e doaram 100% de seus cachês para a filha de Heath, Matilda.',
    ],
  },
  {
    id: 'cf_brad_renfro',
    albumNumber: 33,
    name: 'Brad Renfro',
    searchQuery: 'Brad Renfro',
    wikiTitle: 'Brad_Renfro',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '📽️',
    tagline: 'Descoberto aos 11 Anos Sem Nunca Ter Atuado — O Talento Bruto dos Anos 90',
    knownFor: 'O Cliente • O Aprendiz • Sleepers: A Vingança Adormecida • Ghost World • Bully',
    quote: 'Rebeldia à flor da pele e olhar verdadeiro: de contracenar com Tommy Lee Jones e Ian McKellen ainda menino ao cinema indie cult.',
    rpgTitle: 'Prodígio Rebelde dos Anos 90',
    secretFact: 'Foi descoberto aos 11 anos no Tennessee por uma diretora de elenco que procurava um garoto "durão de verdade" para "O Cliente" (1994) — Brad nunca havia feito uma aula de teatro sequer e superou mais de 5 mil candidatos para estrelar ao lado de Susan Sarandon e Tommy Lee Jones.',
    isPosthumous: true,
    curiosities: [
      'Logo em sua estreia em "O Cliente" (1994), adaptado de John Grisham, tornou-se um dos jovens atores mais elogiados da década de 1990.',
      'Protagonizou um duelo de atuação memorável frente a frente com Sir Ian McKellen em "O Aprendiz" (Apt Pupil, 1998), baseado na obra de Stephen King.',
      'Deixou atuações marcantes no drama "Sleepers: A Vingança Adormecida" (com Robert De Niro e Brad Pitt) e no cult "Ghost World: Aprendendo a Viver" (ao lado de Scarlett Johansson e Thora Birch).',
    ],
  },
  {
    id: 'cf_scarlett_johansson',
    albumNumber: 34,
    name: 'Scarlett Johansson',
    searchQuery: 'Scarlett Johansson',
    wikiTitle: 'Scarlett_Johansson',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🖤',
    oscarWins: 0,
    oscarNominations: 2,
    tagline: 'Indicada a Dois Oscars no Mesmo Ano e Faz Você Se Apaixonar Até por um Sistema Operacional!',
    knownFor: 'Encontros e Desencontros • História de um Casamento • Jojo Rabbit • Viúva Negra • Ela (Her)',
    quote: 'De sussurrar no ouvido de Bill Murray em Tóquio a salvar os Vingadores e conquistar Joaquin Phoenix apenas com a voz em "Ela".',
    rpgTitle: 'Viúva Soberana da Sétima Arte',
    secretFact: 'Em 2020, entrou para um grupo histórico de apenas 12 pessoas em quase um século de Academia ao receber duas indicações simultâneas ao Oscar no mesmo ano: Melhor Atriz ("História de um Casamento") e Melhor Atriz Coadjuvante ("Jojo Rabbit").',
    curiosities: [
      'Venceu o prêmio BAFTA aos 19 anos por "Encontros e Desencontros" (Lost in Translation, 2003), de Sofia Coppola.',
      'Em "Ela" (Her, 2013), sua atuação exclusivamente por voz como a inteligência artificial Samantha foi tão aclamada que venceu prêmios de crítica mesmo sem aparecer em tela.',
      'Interpretou Natasha Romanoff (Viúva Negra) em 9 produções do MCU ao longo de mais de uma década.',
    ],
  },
  {
    id: 'cf_emma_stone',
    albumNumber: 35,
    name: 'Emma Stone',
    searchQuery: 'Emma Stone',
    wikiTitle: 'Emma_Stone',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '💃',
    oscarWins: 2,
    oscarNominations: 5,
    tagline: 'Fez um PowerPoint pros Pais pra Mudar pra Hollywood (e Já Ganhou 2 Oscars Antes dos 35!)',
    knownFor: 'Pobres Criaturas • La La Land • A Favorita • Birdman • A Mentira • Superbad',
    quote: 'Timing cômico impecável e entrega visceral: a musa oficial das loucuras geniais de Yorgos Lanthimos.',
    rpgTitle: 'Musa Alquímica de Duas Estatuetas',
    secretFact: 'Aos 15 anos, montou uma apresentação no PowerPoint intitulada "Projeto Hollywood" — com a música "Hollywood" da Madonna tocando no fundo — para convencer os pais a deixarem que ela saísse da escola no Arizona e tentasse testes de elenco em Los Angeles. Funcionou!',
    curiosities: [
      'Venceu dois Oscars de Melhor Atriz antes dos 36 anos: por "La La Land" (2016) e pela inesquecível Bella Baxter em "Pobres Criaturas" (2023).',
      'Seu nome verdadeiro é Emily Stone — precisou registrar "Emma" no sindicato de atores (SAG) porque "Emily Stone" já estava em uso, inspirando-se na Emma Bunton das Spice Girls.',
      'Além de brilhar em comédias como "Superbad", "Zumbilândia" e "A Mentira", formou com o diretor Yorgos Lanthimos uma das parcerias mais ousadas do cinema moderno.',
    ],
  },
  {
    id: 'cf_ethan_hawke',
    albumNumber: 36,
    name: 'Ethan Hawke',
    searchQuery: 'Ethan Hawke',
    wikiTitle: 'Ethan_Hawke',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '⏳',
    oscarWins: 0,
    oscarNominations: 4,
    tagline: 'Subiu na Carteira pela Poesia, Filmou por 12 Anos Seguidos e Ainda Toca o Terror de Máscara!',
    knownFor: 'Sociedade dos Poetas Mortos • Trilogia Antes do Amanhecer • Dia de Treinamento • O Telefone Preto',
    quote: 'Romântico em Viena, policial novato ao lado de Denzel Washington e vilão aterrorizante: quatro décadas sem errar um papel.',
    rpgTitle: 'Viajante do Tempo e da Poesia',
    secretFact: 'Para provar à indústria que "Gattaca" (1997) e a trilogia "Antes do Amanhecer" tinham alma autoral, Ethan coescreveu os roteiros de "Antes do Pôr do Sol" e "Antes da Meia-Noite" junto com Julie Delpy e Richard Linklater — sendo indicado ao Oscar tanto como ator quanto como roteirista!',
    curiosities: [
      'Filmou "Boyhood: Da Infância à Juventude" (2014) durante 12 anos reais consecutivos, acompanhando o crescimento verdadeiro do elenco.',
      'Tem 4 indicações ao Oscar: duas por atuação ("Dia de Treinamento" e "Boyhood") e duas por Melhor Roteiro Adaptado.',
      'Surpreendeu o público no terror moderno em "A Entidade" (Sinister) e como o sequestrador mascarado em "O Telefone Preto".',
    ],
  },
  {
    id: 'cf_toni_collette',
    albumNumber: 37,
    name: 'Toni Collette',
    searchQuery: 'Toni Collette',
    wikiTitle: 'Toni_Collette',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '😱',
    oscarWins: 0,
    oscarNominations: 1,
    tagline: 'Se a Toni Collette Gritar na Mesa de Jantar, a Academia Devia Entregar o Oscar na Hora!',
    knownFor: 'Hereditário • O Sexto Sentido • Pequena Miss Sunshine • Entre Facas e Segredos',
    quote: 'A maior injustiça da história do Oscar tem nome: Toni Collette dando aula de atuação em "Hereditário" enquanto flutua no teto do quarto.',
    rpgTitle: 'Sacerdotisa Suprema da Tensão',
    secretFact: 'Em "O Sexto Sentido" (1999), a cena devastadora dentro do carro em que o filho Cole revela o segredo sobre a avó dela foi gravada com tamanha emoção real que a equipe técnica inteira atrás das câmeras de M. Night Shyamalan terminou o take chorando em silêncio.',
    curiosities: [
      'É australiana de Sydney e domina sotaques americanos e britânicos com tanta perfeição que parte do público nem imagina sua origem.',
      'Foi indicada ao Oscar por "O Sexto Sentido" (1999) e estrelou clássicos como "O Casamento de Muriel", "Pequena Miss Sunshine" e "Entre Facas e Segredos".',
      'Sua performance como Annie Graham em "Hereditário" (2018), de Ari Aster, é considerada pela crítica mundial uma das maiores atuações da história do terror.',
    ],
  },
  {
    id: 'cf_zendaya_timothee',
    albumNumber: 38,
    name: 'Casal de Arrakis (Zendaya & Timothée)',
    searchQuery: 'Timothée Chalamet',
    wikiTitle: 'Timothée_Chalamet',
    alameda: 'grupos',
    kind: 'group',
    icon: '🏜️',
    oscarWins: 0,
    oscarNominations: 2,
    tagline: 'LISAN AL-GAIB! A Dupla que Domina o Deserto de Duna, o Tapete Vermelho e a Geração Z',
    knownFor: 'Duna: Parte 1 & 2 • Rivais (Challengers) • Homem-Aranha • Wonka • Me Chame Pelo Seu Nome',
    quote: 'Quando não estão cavalgando vermes da areia em Arrakis ao som de Hans Zimmer, estão carregando a bilheteria e a crítica da nova Hollywood nas costas.',
    rpgTitle: 'Soberanos das Areias de Arrakis',
    secretFact: 'Nos intervalos de filmagem de "Duna" no deserto escaldante da Jordânia, Zendaya e Timothée organizavam festas improvisadas no camarim com caixa de som portátil e disputas de dança para manter o elenco acordado debaixo dos trajes destiladores.',
    groupMembers: [
      { name: 'Zendaya', roleLabel: 'Chani / MJ / Tashi Duncan', searchQuery: 'Zendaya', wikiTitle: 'Zendaya' },
      { name: 'Timothée Chalamet', roleLabel: 'Paul Atreides (Lisan al-Gaib!)', searchQuery: 'Timothée Chalamet', wikiTitle: 'Timothée_Chalamet', oscarWins: 0, oscarNominations: 2 },
    ],
    curiosities: [
      'Juntos lideraram "Duna" (2021) e "Duna: Parte Dois" (2024), de Denis Villeneuve, ultrapassando US$ 1,1 bilhão em bilheteria mundial.',
      'Zendaya tornou-se a atriz mais jovem da história a vencer dois Emmys de Melhor Atriz em Série de Drama ("Euphoria") e brilhou na trilogia "Homem-Aranha" e em "Rivais".',
      'Timothée Chalamet foi um dos indicados mais jovens da história ao Oscar de Melhor Ator por "Me Chame Pelo Seu Nome" e protagonizou "Wonka", "Adoráveis Mulheres" e "Um Completo Desconhecido".',
    ],
  },
  {
    id: 'cf_leonardo_dicaprio',
    albumNumber: 39,
    name: 'Leonardo DiCaprio',
    searchQuery: 'Leonardo DiCaprio',
    wikiTitle: 'Leonardo_DiCaprio',
    alameda: 'hollywood',
    kind: 'actor',
    icon: '🥂',
    oscarWins: 1,
    oscarNominations: 7,
    tagline: 'Dormiu Dentro de um Cavalo no Gelo e Lutou com um Urso Só pra Academia Finalmente Dar o Oscar!',
    knownFor: 'O Lobo de Wall Street • A Origem • Titanic • O Regresso • Os Infiltrados • Ilha do Medo',
    quote: 'Cabia naquela porta do Titanic sim, cortou a mão de verdade em "Django Livre" e só trabalha se o diretor for lenda viva do cinema.',
    rpgTitle: 'Imperador dos Memes e das Bilheterias',
    secretFact: 'Na cena do jantar tenso em "Django Livre" (2012), Leonardo bateu a mão na mesa com tanta força que esmigalhou uma taça de cristal de verdade; mesmo com a mão sangrando de verdade, não saiu do personagem e continuou a cena até Quentin Tarantino gritar "corta" em choque.',
    curiosities: [
      'Depois de anos sendo o maior meme da internet por nunca ganhar o Oscar, finalmente levou a estatueta de Melhor Ator em 2016 por "O Regresso" — onde comeu fígado de bisão cru de verdade sendo vegetariano.',
      'É o parceiro favorito de Martin Scorsese no século XXI, estrelando seis épicos juntos: "Gangues de Nova York", "O Aviador", "Os Infiltrados", "Ilha do Medo", "O Lobo de Wall Street" e "Assassinos da Lua das Flores".',
      'Em "Titanic" (1997), as mãos que aparecem desenhando Rose no caderno de Jack não são de Leonardo DiCaprio — foram gravadas pelo próprio diretor James Cameron!',
    ],
  },
];

const CURATED_CACHE_BY_ID = new Map<string, WalkCuratedMovieReq[]>();

export function getCuratedMoviesForStar(starId: string): WalkCuratedMovieReq[] {
  if (CURATED_CACHE_BY_ID.has(starId)) {
    return CURATED_CACHE_BY_ID.get(starId)!;
  }
  const rawList: WalkCuratedMovieReq[] = Array.isArray(WALK_OF_FAME_CURATED_MOVIES[starId])
    ? WALK_OF_FAME_CURATED_MOVIES[starId]
    : [];
  CURATED_CACHE_BY_ID.set(starId, rawList);
  return rawList;
}
