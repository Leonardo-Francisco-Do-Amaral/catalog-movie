export type VoiceRarityTier =
  | 'locked'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'super_rare'
  | 'legendary'
  | 'mythic';

export const VOICE_ALBUM_CEILING = 20;
export const VOICE_WORKS_PER_EXTRA_STAR = 3;
export const VOICE_EXTRA_STAR_XP = 75;

export interface VoiceMilestoneTier {
  thresholdPct: number;
  tier: Exclude<VoiceRarityTier, 'locked'>;
  id: string;
  label: string;
  tcgCode: string;
  icon: string;
  xp: number;
  rank: string;
  accentHex: string;
  unlockTitle: string;
}

export const VOICE_MILESTONES: VoiceMilestoneTier[] = [
  {
    thresholdPct: 15,
    tier: 'common',
    id: 'comum',
    label: 'Comum',
    tcgCode: 'C',
    icon: '🎟️',
    xp: 30,
    rank: 'D',
    accentHex: '#d97706',
    unlockTitle: 'Invocação Inicial + Personagem Principal + Medalhão Seiyū',
  },
  {
    thresholdPct: 30,
    tier: 'uncommon',
    id: 'incomum',
    label: 'Incomum',
    tcgCode: 'UC',
    icon: '⚔️',
    xp: 55,
    rank: 'C',
    accentHex: '#cbd5e1',
    unlockTitle: 'Grimório de Papéis + Selo Camaleão Vocal',
  },
  {
    thresholdPct: 45,
    tier: 'rare',
    id: 'rara',
    label: 'Rara',
    tcgCode: 'R',
    icon: '🧪',
    xp: 75,
    rank: 'B',
    accentHex: '#34d399',
    unlockTitle: 'Troca de Arte Livre + Flip 3D (Frente/Verso)',
  },
  {
    thresholdPct: 60,
    tier: 'super_rare',
    id: 'super_rara',
    label: 'Super Rara',
    tcgCode: 'SR',
    icon: '⚡',
    xp: 90,
    rank: 'A',
    accentHex: '#c084fc',
    unlockTitle: 'Radar de Afinidade + Gêneros Dominantes',
  },
  {
    thresholdPct: 75,
    tier: 'legendary',
    id: 'lendaria',
    label: 'Lendária',
    tcgCode: 'LR',
    icon: '🌟',
    xp: 130,
    rank: 'A+',
    accentHex: '#facc15',
    unlockTitle: 'Crônica de Batalha (Décadas & Média Geral)',
  },
  {
    thresholdPct: 100,
    tier: 'mythic',
    id: 'mitica',
    label: 'Mítica Suprema',
    tcgCode: 'UR',
    icon: '🩸',
    xp: 180,
    rank: 'S',
    accentHex: '#f43f5e',
    unlockTitle: 'Despertar: Assinatura Caligráfica + Obra-Prima + Auras',
  },
];

export const VOICE_TIER_ORDER: Record<VoiceRarityTier, number> = {
  locked: 0,
  common: 1,
  uncommon: 2,
  rare: 3,
  super_rare: 4,
  legendary: 5,
  mythic: 6,
};

export const VOICE_IMMORTAL_AURA_ORDER = [
  'sakura_prism',
  'bankai_crimson',
  'saiyan_gold',
  'alchemy_gold',
  'gear5_lunar',
  'digivice_royal',
  'given_strat',
  'infinite_void',
  'jade_shinobi',
  'abyss_obsidian',
] as const;

export type VoiceImmortalAuraId = (typeof VOICE_IMMORTAL_AURA_ORDER)[number];

export interface LegendaryVoiceDefinition {
  id: string;
  name: string;
  aliases?: string[];
  wikiTitle?: string;
  nationalityCode: 'jp' | 'us';
  nationalityLabel: string;
  icon: string;
  voiceType?: string;
  hometown?: string;
  birthYear?: number;
  isPosthumous?: boolean;
  tagline: string;
  knownFor: string;
  quote: string;
  quoteJp?: string;
  rpgTitle: string;
  bio: string;
  secretFact: string;
  curiosities: [string, string, string];
  signatureFranchises: string[];
  characterExamples?: Record<string, string>;
}

/**
 * Complementa os dubladores JP/US já existentes no Álbum da Fama do Cinema
 * com padrões de franquias de animes & séries animadas para match imediato.
 */
export const SHARED_CINEMA_VOICE_FRANCHISES: Record<
  string,
  { patterns: string[]; defaultCharacter?: string; voiceType?: string; quoteJp?: string }
> = {
  'masako nozawa': {
    patterns: ['dragon ball', 'digimon tamers', 'gegege no kitaro'],
    defaultCharacter: 'Son Goku / Guilmon',
    voiceType: 'Energia Pura Eterna • Protagonista Shōnen',
    quoteJp: '「オッス！オラ悟空！」(Osu! Ora Gokū!)',
  },
  'toshiko fujita': {
    patterns: ['digimon adventure', 'one piece', "cat's eye"],
    defaultCharacter: 'Taichi Yagami',
    voiceType: 'Chama da Coragem • Espírito Líder',
    quoteJp: '「いくぞ、アグモン！」(Iku zo, Agumon!)',
  },
  'natsuki hanae': {
    patterns: ['kimetsu no yaiba', 'demon slayer', 'tokyo ghoul', 'shigatsu wa kimi no uso', 'your lie in april', 'dandadan', 'digimon adventure tri'],
    defaultCharacter: 'Tanjiro Kamado / Ken Kaneki / Taichi',
    voiceType: 'Tenor Empático & Grito Dilacerante',
    quoteJp: '「全集中・水の呼吸！」(Zenshūchū: Mizu no Kokyū!)',
  },
  'kouichi yamadera': {
    patterns: ['cowboy bebop', 'dragon ball super', 'evangelion', 'ghost in the shell', 'lupin'],
    defaultCharacter: 'Spike Spiegel / Bills / Kaji',
    voiceType: 'O Homem das Sete Vozes • Barítono Camaleônico',
    quoteJp: '「じゃあな…バン。(Bang.)」',
  },
  'kenjiro tsuda': {
    patterns: ['jujutsu kaisen', 'yu-gi-oh', 'chainsaw man', 'boku no hero', 'my hero academia', 'golden kamuy', 'gokushufudou'],
    defaultCharacter: 'Seto Kaiba / Kento Nanami / Kishibe',
    voiceType: 'Barítono Aveludado & Frieza Tática',
    quoteJp: '「ここからは時間外労働です」(Hora extra a partir daqui)',
  },
  'kevin conroy': {
    patterns: ['batman', 'liga da justica', 'justice league'],
    defaultCharacter: 'Batman / Bruce Wayne',
    voiceType: 'Voz Sombria Definitiva de Gotham',
    quoteJp: '“I am vengeance. I am the night. I am Batman!”',
  },
  'robbie daymond': {
    patterns: ['jujutsu kaisen', 'spider-man', 'homem-aranha', 'sailor moon', 'devil may cry'],
    defaultCharacter: 'Megumi Fushiguro / Homem-Aranha',
    voiceType: 'Versátil Heroico & Anti-Herói Sombrio',
  },
  'ray chase': {
    patterns: ['jujutsu kaisen', 'kimetsu no yaiba', 'demon slayer', 'x-men'],
    defaultCharacter: 'Ryomen Sukuna / Tengen Uzui',
    voiceType: 'Barítono Imponente & Soberania Vilanesca',
  },
  'frank welker': {
    patterns: ['scooby-doo', 'transformers', 'futurama', 'animaniacs'],
    defaultCharacter: 'Fred / Scooby-Doo / Megatron',
    voiceType: 'Rei dos Rugidos, Monstros & Sintetizadores Orgânicos',
  },
  'jim cummings': {
    patterns: ['ursinho pooh', 'winnie the pooh', 'darkwing duck', 'duck tales'],
    defaultCharacter: 'Ursinho Pooh / Tigrão',
    voiceType: 'Timbre Aconchegante & Vilão Operístico',
  },
  'john ratzenberger': {
    patterns: ['toy story', 'pixar', 'carros', 'monstros s.a'],
    defaultCharacter: 'Porquinho Hamm / Caminhão Mack',
    voiceType: 'Carisma Clássico de Emeryville',
  },
};

export const LEGENDARY_TV_VOICES: LegendaryVoiceDefinition[] = [
  {
    id: 'tv_masakazu_morita',
    name: 'Masakazu Morita',
    aliases: ['morita masakazu'],
    wikiTitle: 'Masakazu_Morita',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '⚔️',
    voiceType: 'Grito Ardente Shōnen • Espírito Protetor',
    hometown: 'Tóquio, Japão',
    birthYear: 1972,
    tagline: '“Ban-Kai!” — A Voz Ardente do Shinigami Substituto Mais Famoso dos Animes!',
    knownFor: 'Ichigo Kurosaki (Bleach / TYBW) • Whis (Dragon Ball Super) • Marco (One Piece) • Pegasus Seiya',
    quote: 'Quando Masakazu Morita grita "Getsuga Tenshou!", a Soul Society inteira treme.',
    quoteJp: '「卍解…天鎖斬月！」(Bankai... Tensa Zangetsu!)',
    rpgTitle: 'Shinigami Substituto da Voz Suprema',
    bio: 'Ator e seiyū japonês da Aoni Production, imortalizado mundialmente como Ichigo Kurosaki em Bleach e Bleach: Thousand-Year Blood War. Antes de ser Ichigo, fez captura de movimentos para Tidus em Final Fantasy X antes de dar a própria voz ao personagem, revelando uma entrega física incomparável.',
    secretFact: 'Para gravar a estreia da Bankai de Ichigo em Bleach, Morita quase perdeu a voz de tanto gritar no estúdio — e em Dragon Ball Super provou o extremo oposto ao viver Whis com elegância calma e aristocrática.',
    curiosities: [
      'Foi contratado inicialmente em "Final Fantasy X" apenas para fazer captura de movimento (motion capture) de Tidus, mas sua leitura de roteiro impressionou tanto o diretor que ele ganhou o papel vocal principal.',
      'Venceu o prêmio de Melhor Ator Revelação no primeiro Seiyu Awards em 2007 justamente por sua performance visceral como Ichigo Kurosaki em Bleach.',
      'Também substituiu Toru Furuya como Pegasus Seiya na fase Hades dos Cavaleiros do Zodíaco e dá voz ao anjo Whis em Dragon Ball Super.',
    ],
    signatureFranchises: ['bleach', 'dragon ball super', 'one piece', 'tiger & bunny', 'saint seiya'],
    characterExamples: { bleach: 'Ichigo Kurosaki', 'dragon ball super': 'Whis', 'one piece': 'Marco' },
  },
  {
    id: 'tv_romi_park',
    name: 'Romi Park',
    aliases: ['paku romi', 'romi paku'],
    wikiTitle: 'Romi_Park',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '⚗️',
    voiceType: 'Alto-Tenor Alquímico • Intensidade Explosiva',
    hometown: 'Edogawa, Tóquio, Japão',
    birthYear: 1972,
    tagline: 'Da Alquimia de Edward Elric à Capitania da Soul Society e à Tropa de Exploração!',
    knownFor: 'Edward Elric (Fullmetal Alchemist) • Tōshirō Hitsugaya (Bleach) • Hange Zoë (AoT) • Ken Ichijouji (Digimon 02)',
    quote: '“Quem você está chamando de baixinho?!” — Energia explosiva e drama incomparável.',
    quoteJp: '「誰が豆粒ドチビか！！」',
    rpgTitle: 'Alquimista Federal de Aço Vocal',
    bio: 'Uma das maiores seiyūs da história da animação japonesa, vencedora do Tokyo Anime Award e de múltiplos Seiyu Awards. Formada em teatro, Romi Park é lendária por interpretar protagonistas masculinos juvenis com ferocidade e vulnerabilidade emocional profundas.',
    secretFact: 'O icônico criador de Gundam, Yoshiyuki Tomino, descobriu Romi Park no teatro e deu a ela o papel masculino principal de Loran Cehack em Turn A Gundam em 1999, abrindo as portas para Edward Elric, Hitsugaya e Hange Zoë.',
    curiosities: [
      'Interpretou Edward Elric tanto no anime clássico de 2003 quanto em "Fullmetal Alchemist: Brotherhood" (2009), eternizando a Lei da Troca Equivalente na história dos animes.',
      'Vive o prodígio Capitão Tōshirō Hitsugaya da 10ª Divisão em Bleach, o Imperador Digimon Ken Ichijouji em Digimon Adventure 02 e a excêntrica Hange Zoë em Attack on Titan.',
      'Também brilhou em papéis femininos dramáticos icônicos como Nana Osaki em "NANA" e Ragyo Kiryuin em "Kill la Kill".',
    ],
    signatureFranchises: ['fullmetal alchemist', 'hagane no renkinjutsushi', 'bleach', 'shingeki no kyojin', 'attack on titan', 'digimon adventure 02', 'nana'],
    characterExamples: { 'fullmetal alchemist': 'Edward Elric', bleach: 'Tōshirō Hitsugaya', 'shingeki no kyojin': 'Hange Zoë', 'digimon adventure 02': 'Ken Ichijouji' },
  },
  {
    id: 'tv_rie_kugimiya',
    name: 'Rie Kugimiya',
    aliases: ['kugimiya rie'],
    wikiTitle: 'Rie_Kugimiya',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🛡️',
    voiceType: 'Soprano Cristalina • Versatilidade Absoluta',
    hometown: 'Kumamoto, Japão',
    birthYear: 1979,
    tagline: 'A Rainha Versátil: De Alphonse Elric na Armadura até Kagura e Ikki/Happy!',
    knownFor: 'Alphonse Elric (Fullmetal Alchemist) • Kagura (Gintama) • Happy (Fairy Tail) • Taiga Aisaka • Nemu Kurotsuchi',
    quote: 'Do coração gentil de Alphonse dentro da armadura ao humor ácido de Kagura em Gintama.',
    quoteJp: '「兄さん…！」(Nii-san...!)',
    rpgTitle: 'Guardiã da Armadura Alquímica',
    bio: 'Vencedora do prêmio de Melhor Atriz Principal no 3º Seiyu Awards, Rie Kugimiya marcou gerações inteiras por alternar com naturalidade entre o gentil Alphonse Elric em Fullmetal Alchemist, mascotes carismáticos como Happy em Fairy Tail e heroínas icônicas.',
    secretFact: 'Para simular a acústica metálica da armadura vazia de Alphonse Elric no microfone, a equipe aplicava um filtro leve apenas depois — toda a leveza infantil vinha puramente do controle respiratório de Rie.',
    curiosities: [
      'A química no estúdio entre Rie Kugimiya (Alphonse) e Romi Park (Edward) era tão forte em FMA que as duas gravavam muitas cenas olhando diretamente uma para a outra.',
      'Ficou apelidada pelos fãs japoneses como a "Rainha Tsundere" nos anos 2000 graças a papéis como Taiga Aisaka (Toradora!), Shana e Louise.',
      'Em Gintama, deu vida a Kagura com sotaque cômico marcante, e em Bleach interpreta a misteriosa tenente Nemu Kurotsuchi e Karin Kurosaki.',
    ],
    signatureFranchises: ['fullmetal alchemist', 'hagane no renkinjutsushi', 'gintama', 'fairy tail', 'toradora', 'bleach'],
    characterExamples: { 'fullmetal alchemist': 'Alphonse Elric', gintama: 'Kagura', 'fairy tail': 'Happy', bleach: 'Nemu Kurotsuchi' },
  },
  {
    id: 'tv_ryo_horikawa',
    name: 'Ryō Horikawa',
    aliases: ['ryo horikawa', 'horikawa ryo'],
    wikiTitle: 'Ryō_Horikawa',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '👑',
    voiceType: 'Orgulho Real • Barítono Nobre',
    hometown: 'Osaka, Japão',
    birthYear: 1958,
    tagline: '“Seu Verme Insolente!” — O Orgulho Supremo do Príncipe dos Saiyajins!',
    knownFor: 'Vegeta (Dragon Ball Z / Super) • Shun de Andrômeda (Cavaleiros do Zodíaco) • Heiji Hattori • Reinhard von Lohengramm',
    quote: 'Do orgulho real de Vegeta ao Final Flash, poucas vozes definiram tão bem a rivalidade nos animes.',
    quoteJp: '「このサイヤ人の王子ベジータ様が！」',
    rpgTitle: 'Príncipe Soberano dos Saiyajins',
    bio: 'Veterano lendário da dublagem japonesa com carreira iniciada ainda jovem no teatro. Ryō Horikawa imortalizou Vegeta durante quase 40 anos de Dragon Ball, além de contrastar completamente com a doçura pacifista de Shun de Andrômeda em Saint Seiya.',
    secretFact: 'Como Ryō Horikawa nasceu em Osaka, ele também usa seu sotaque natural de Kansai para dar voz a Heiji Hattori em Detective Conan — sendo quase impossível reconhecer o mesmo dublador de Vegeta!',
    curiosities: [
      'Antes de Dragon Ball Z, seu papel mais famoso era Shun de Andrômeda em "Cavaleiros do Zodíaco" — uma voz meiga e sensível, o exato oposto do feroz Vegeta.',
      'Horikawa revelou que nos momentos mais tensos de Vegeta — como seu sacrifício contra Majin Boo — gravava tão entregue ao personagem que o estúdio inteiro ficava em silêncio absoluto.',
      'Também é a voz de Captain Falcon na série Smash Bros. (“Falcon Punch!”) e de Reinhard von Lohengramm em Legend of the Galactic Heroes.',
    ],
    signatureFranchises: ['dragon ball', 'saint seiya', 'cavaleiros do zodíaco', 'detective conan', 'legend of the galactic heroes'],
    characterExamples: { 'dragon ball': 'Vegeta', 'saint seiya': 'Shun de Andrômeda' },
  },
  {
    id: 'tv_shogo_yano',
    name: 'Shōgo Yano',
    aliases: ['shogo yano', 'yano shogo'],
    wikiTitle: 'Shōgo_Yano',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🎸',
    voiceType: 'Vocal Emocional • Acústico & Lirismo',
    hometown: 'Tokushima, Japão',
    birthYear: 1989,
    tagline: '“La-la-la...” — O Grito de Dor e Esperança Que Parou o Palco em Given!',
    knownFor: 'Mafuyu Satō (Given) • Nanao Kisaragi • Biscuit Griffon • Shōgo em Bakuten!!',
    quote: 'Uma única canção no primeiro live de Given transformou Mafuyu Satō em um dos momentos mais emocionantes dos animes musicais.',
    quoteJp: '「まだ 消えないで」(Ainda não desapareça)',
    rpgTitle: 'Vocalista da Stratocaster Partida',
    bio: 'Ator e seiyū da Super Eccentric Theater, Shōgo Yano entrou para a história dos animes musicais como Mafuyu Satō em Given — executando ao vivo tanto os diálogos tímidos do personagem quanto a explosão vocal da canção "Fuyu no Hanashi".',
    secretFact: 'Diferente de muitos animes em que outro cantor assume as músicas, Shōgo Yano gravou pessoalmente todos os vocais da banda "given", fazendo fãs chorarem no episódio 9.',
    curiosities: [
      'A canção "Fuyu no Hanashi", cantada por Yano no clímax do episódio 9 de Given, tornou-se um dos maiores fenômenos musicais do estúdio Lerche.',
      'Também trabalhou com música e esportes como Nanao Kisaragi em "Tsurune" e em "Bakuten!!", mostrando afinidade com elencos artísticos.',
      'Começou no teatro musical, o que explica o alcance respiratório capaz de sustentar notas agudas em meio a diálogos de choro.',
    ],
    signatureFranchises: ['given', 'bakuten', 'tsurune'],
    characterExamples: { given: 'Mafuyu Satō' },
  },
  {
    id: 'tv_yuma_uchida',
    name: 'Yūma Uchida',
    aliases: ['yuma uchida', 'uchida yuma'],
    wikiTitle: 'Yūma_Uchida',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🎶',
    voiceType: 'Tenor Moderno • Melodia & Sombras',
    hometown: 'Tóquio, Japão',
    birthYear: 1992,
    tagline: 'De Ritsuka Uenoyama e Kyo Sohma até Megumi Fushiguro e Chika Kudō!',
    knownFor: 'Ritsuka Uenoyama (Given) • Megumi Fushiguro (Jujutsu Kaisen) • Kyo Sohma (Fruits Basket) • Ash Lynx (Banana Fish)',
    quote: 'Entre acordes de guitarra em Given e sombras amaldiçoadas em Jujutsu Kaisen.',
    quoteJp: '「布瑠部由良由良…」 (Tesouro Sagrado: Balança)',
    rpgTitle: 'Guitarrista das Sombras Amaldiçoadas',
    bio: 'Vencedor do prêmio de Melhor Ator Principal no 13º Seiyu Awards por seu trabalho como Ash Lynx em Banana Fish, Yūma Uchida é um dos nomes mais respeitados da geração atual — brilhando igualmente em dramas musicais e grandes shōnens.',
    secretFact: 'É irmão mais novo da também famosa seiyū Maaya Uchida — e os dois já contracenaram como irmãos e rivais em dezenas de animes e shows ao vivo.',
    curiosities: [
      'Em "Given", interpretou Ritsuka Uenoyama, o guitarrista que ensina os primeiros acordes a Mafuyu Satō e reacende a paixão pela música.',
      'Como Megumi Fushiguro em "Jujutsu Kaisen", alterna frieza estratégica e explosões de Expansão de Domínio ("Jardim das Sombras Quimera").',
      'Também estrelou como Kyo Sohma no remake de "Fruits Basket", Sunraku em "Shangri-La Frontier" e Chika Kudō em "Kono Oto Tomare!".',
    ],
    signatureFranchises: ['given', 'jujutsu kaisen', 'fruits basket', 'banana fish', 'shangri-la frontier', 'blue lock'],
    characterExamples: { given: 'Ritsuka Uenoyama', 'jujutsu kaisen': 'Megumi Fushiguro', 'fruits basket': 'Kyo Sohma' },
  },
  {
    id: 'tv_mamoru_miyano',
    name: 'Mamoru Miyano',
    aliases: ['miyano mamoru'],
    wikiTitle: 'Mamoru_Miyano',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '📓',
    voiceType: 'Barítono Teatral • Gênio & Loucura',
    hometown: 'Saitama, Japão',
    birthYear: 1983,
    tagline: '“Eu Serei o Deus do Novo Mundo!” — Do Caderno da Morte ao Cientista Louco Hououin Kyouma!',
    knownFor: 'Light Yagami (Death Note) • Rintarō Okabe (Steins;Gate) • Ling Yao (FMAB) • Osamu Dazai • Chrollo Lucilfer',
    quote: 'El Psy Kongroo! Um mestre tanto no suspense psicológico quanto na comédia exagerada.',
    quoteJp: '「計画通り…！(Keikaku dōri!) / El Psy Kongroo!」',
    rpgTitle: 'Cientista Louco do Novo Mundo',
    bio: 'Um dos seiyūs e artistas musicais mais premiados da história do Japão, vencedor de múltiplos Seiyu Awards e Tokyo Anime Awards. Deu alma ao cálculo frio de Light Yagami em Death Note e à teatralidade maníaca de Okabe Rintarō em Steins;Gate.',
    secretFact: 'A famosa risada maníaca de Light Yagami no episódio final de Death Note — gravada sem cortes — deixou até os engenheiros de som arrepiados pela entrega teatral de Miyano.',
    curiosities: [
      'Em "Fullmetal Alchemist: Brotherhood", interpretou o carismático príncipe Ling Yao — incluindo o diálogo duplo quando divide o corpo com o homúnculo Ganância (Greed).',
      'Também é a voz de Osamu Dazai ("Bungo Stray Dogs"), Chrollo Lucilfer ("Hunter x Hunter"), Atsumu Miya ("Haikyuu!!") e Douma ("Demon Slayer").',
      'É o primeiro ator de dublagem masculino a emplacar singles no topo das paradas Oricon do Japão com carreira solo pop de estádio.',
    ],
    signatureFranchises: ['death note', 'steins;gate', 'fullmetal alchemist: brotherhood', 'bungo stray dogs', 'hunter x hunter', 'haikyuu'],
    characterExamples: { 'death note': 'Light Yagami', 'steins;gate': 'Rintarō Okabe', 'fullmetal alchemist: brotherhood': 'Ling Yao' },
  },
  {
    id: 'tv_takahiro_sakurai',
    name: 'Takahiro Sakurai',
    aliases: ['sakurai takahiro'],
    wikiTitle: 'Takahiro_Sakurai',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🐞',
    voiceType: 'Timbre Frio & Conselheiro • Versátil',
    hometown: 'Okazaki, Aichi, Japão',
    birthYear: 1974,
    tagline: 'De Tentomon no Mundo Digital até Reigen Arataka, Giyu Tomioka e Suguru Geto!',
    knownFor: 'Tentomon (Digimon Adventure) • Giyu Tomioka (Demon Slayer) • Reigen Arataka (Mob Psycho 100) • Suguru Geto • Griffith',
    quote: 'Do humor conselheiro do Tentomon à calma implacável da Respiração da Água.',
    quoteJp: '「俺は嫌われてない」(Eu não sou odiado)',
    rpgTitle: 'Mestre da Calma Digital e Espiritual',
    bio: 'Seiyū veterano cuja carreira atravessa quatro décadas de clássicos. Começou encantando crianças como o inseto sábio Tentomon em Digimon Adventure antes de se tornar a voz icônica de personagens enigmáticos como Cloud Strife, Reigen Arataka, Giyu Tomioka e Suguru Geto.',
    secretFact: 'Nos anos 90, Sakurai criou um sotaque clássico de Osaka para o pequeno Tentomon em Digimon que marcou para sempre os fãs japoneses — exatamente o oposto da frieza zen de Giyu Tomioka.',
    curiosities: [
      'Em "Demon Slayer" (Kimetsu no Yaiba), é a voz do Pilar da Água Giyu Tomioka, e em "Jujutsu Kaisen" dá vida a Suguru Geto.',
      'Vive o carismático e trapaceiro mentor Reigen Arataka em "Mob Psycho 100", entregando discursos rápidos em ritmo de comédia absurda.',
      'Também interpretou Suzaku Kururugi ("Code Geass"), Izuru Kira ("Bleach"), Makishima ("Psycho-Pass") e Griffith na trilogia de filmes de "Berserk".',
    ],
    signatureFranchises: ['digimon', 'kimetsu no yaiba', 'demon slayer', 'mob psycho 100', 'jujutsu kaisen', 'code geass', 'bleach'],
    characterExamples: { digimon: 'Tentomon', 'kimetsu no yaiba': 'Giyu Tomioka', 'mob psycho 100': 'Reigen Arataka', 'jujutsu kaisen': 'Suguru Geto' },
  },
  {
    id: 'tv_kana_hanazawa',
    name: 'Kana Hanazawa',
    aliases: ['hanazawa kana'],
    wikiTitle: 'Kana_Hanazawa',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🌷',
    voiceType: 'Soprano Suave • Doçura & Tensão',
    hometown: 'Tóquio, Japão',
    birthYear: 1989,
    tagline: 'Uma das Vozes Mais Doces e Inconfundíveis da Animação Japonesa!',
    knownFor: 'Mitsuri Kanroji (Demon Slayer) • Mayuri Shiina (Steins;Gate) • Akane Tsunemori (Psycho-Pass) • Rize Kamishiro',
    quote: 'Tuturu! Da leveza encantadora ao suspense sombrio em frações de segundo.',
    quoteJp: '「トゥットゥルー♪」(Tuturu ♪)',
    rpgTitle: 'Flor de Cerejeira dos Seiyūs',
    bio: 'Cantora pop e seiyū premiadíssima, Kana Hanazawa começou como atriz mirim e se tornou um fenômeno internacional pela voz doce que pode se transformar instantaneamente em psicose sombria — como Rize em Tokyo Ghoul.',
    secretFact: 'Sua música "Renai Circulation" (cantada originalmente como Nadeko Sengoku em Bakemonogatari) viralizou mundialmente anos depois, acumulando centenas de milhões de reproduções.',
    curiosities: [
      'Imortalizou a saudação “Tuturu ♪” como Mayuri Shiina em "Steins;Gate" e brilha como a Hashira do Amor Mitsuri Kanroji em "Demon Slayer".',
      'Protagonizou a inspetora Akane Tsunemori em "Psycho-Pass" e deu vida a Kanade Tachibana em "Angel Beats!", Rize em "Tokyo Ghoul" e Seryu/Ichika em dramas premiados.',
      'Vencedora do Seiyu Awards de Melhor Atriz Coadjuvante e eleita múltiplas vezes entre as vozes femininas mais queridas do Japão.',
    ],
    signatureFranchises: ['steins;gate', 'kimetsu no yaiba', 'demon slayer', 'psycho-pass', 'tokyo ghoul', 'monogatari', '3-gatsu no lion'],
    characterExamples: { 'steins;gate': 'Mayuri Shiina', 'kimetsu no yaiba': 'Mitsuri Kanroji', 'psycho-pass': 'Akane Tsunemori' },
  },
  {
    id: 'tv_hiroshi_kamiya',
    name: 'Hiroshi Kamiya',
    aliases: ['kamiya hiroshi'],
    wikiTitle: 'Hiroshi_Kamiya',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🗡️',
    voiceType: 'Barítono Cirúrgico • Sarcasmo & Autoridade',
    hometown: 'Matsudo, Chiba, Japão',
    birthYear: 1975,
    tagline: '“Tatakae!” — O Capitão Levi, Trafalgar Law e Koyomi Araragi em Uma Só Voz!',
    knownFor: 'Levi Ackerman (Attack on Titan) • Trafalgar Law (One Piece) • Yato (Noragami) • Saiki Kusuo • Ranpo Edogawa',
    quote: 'Frieza cirúrgica em cada sílaba — o recordista absoluto de prêmios no Seiyu Awards.',
    quoteJp: '「悔いのない方を自分で選べ」(Escolha a opção sem arrependimentos)',
    rpgTitle: 'Capitão Supremo da Tropa Vocal',
    bio: 'Entrou para o Hall da Fama do Seiyu Awards após vencer 5 anos seguidos como o dublador mais votado pelos fãs no Japão. Famoso pelo ritmo impecável em diálogos rápidos de Monogatari e pela autoridade gélida de Levi Ackerman.',
    secretFact: 'Em 2006, Kamiya sofreu um grave acidente de moto que o deixou em coma; recuperou-se e voltou com ainda mais vigor, tornando-se o recordista absoluto da história do Seiyu Awards.',
    curiosities: [
      'Deu ao Capitão Levi em "Shingeki no Kyojin" um tom seco, exausto e implacável que redefiniu o arquétipo do guerreiro mais forte.',
      'Como Trafalgar D. Water Law em "One Piece", entoa “Room... Shambles!” com calma letal, além de estrelar como Yato ("Noragami") e Saiki Kusuo.',
      'É o grande amigo e coapresentador de longa data de Daisuke Ono no lendário programa de rádio Dear Girl ~Stories~.',
    ],
    signatureFranchises: ['shingeki no kyojin', 'attack on titan', 'one piece', 'noragami', 'saiki k', 'haikyuu', 'blue lock', 'bungo stray dogs'],
    characterExamples: { 'shingeki no kyojin': 'Levi Ackerman', 'one piece': 'Trafalgar Law', noragami: 'Yato' },
  },
  {
    id: 'tv_yuki_kaji',
    name: 'Yūki Kaji',
    aliases: ['yuki kaji', 'kaji yuki'],
    wikiTitle: 'Yuki_Kaji',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🔥',
    voiceType: 'Tenor Visceral • Fúria & Determinação',
    hometown: 'Tóquio, Japão',
    birthYear: 1985,
    tagline: 'Intensidade Máxima: De Eren Yeager e Shoto Todoroki até Kenma Kozume!',
    knownFor: 'Eren Yeager (Attack on Titan) • Shoto Todoroki (My Hero Academia) • Kenma Kozume (Haikyuu!!) • Meliodas • Koichi Hirose',
    quote: 'Poucos dubladores entregam fúria, desespero e determinação com tanta visceralidade quanto Yūki Kaji.',
    quoteJp: '「駆逐してやる！！」(Vou exterminar todos eles!!)',
    rpgTitle: 'Titã da Entrega Emocional',
    bio: 'Primeiro dublador da história a vencer o Seiyu Awards de Melhor Ator Principal em dois anos consecutivos (2013 e 2014). Seu desempenho como Eren Yeager ao longo de dez anos de Attack on Titan é estudado por atores do mundo inteiro.',
    secretFact: 'Durante as sessões finais de Attack on Titan, Yūki Kaji chorou genuinamente em várias cenas de Eren enquanto gravava, recusando ajustes artificiais para manter a verdade emocional crua.',
    curiosities: [
      'Acompanhou o amadurecimento vocal de Eren Yeager da infância furiosa na Temporada 1 à melancolia grave e trágica da Temporada Final.',
      'Mostra incrível contraste ao interpretar Shoto Todoroki em "My Hero Academia", Kenma Kozume (frio e contido) em "Haikyuu!!" e Meliodas em "Nanatsu no Taizai".',
      'É casado com a também seiyū Ayana Taketatsu, formando um dos casais mais queridos da indústria dos animes.',
    ],
    signatureFranchises: ['shingeki no kyojin', 'attack on titan', 'boku no hero', 'my hero academia', 'haikyuu', 'nanatsu no taizai', 'jojo'],
    characterExamples: { 'shingeki no kyojin': 'Eren Yeager', 'boku no hero': 'Shoto Todoroki', haikyuu: 'Kenma Kozume' },
  },
  {
    id: 'tv_daisuke_ono',
    name: 'Daisuke Ono',
    aliases: ['ono daisuke'],
    wikiTitle: 'Daisuke_Ono',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '⭐',
    voiceType: 'Barítono Nobre • Ora Ora & Liderança',
    hometown: 'Sakawa, Kōchi, Japão',
    birthYear: 1978,
    tagline: '“Yare Yare Daze...” — De Jotaro Kujo e Comandante Erwin a Sebastian Michaelis!',
    knownFor: 'Jotaro Kujo (JoJo) • Erwin Smith (Attack on Titan) • Sebastian Michaelis • Shizuo Heiwajima • Sinbad',
    quote: 'Ora Ora Ora! Carisma, liderança épica e o timbre mais imponente dos shōnen.',
    quoteJp: '「やれやれだぜ… オラオラオラ！」',
    rpgTitle: 'Comandante Platinum dos Stands',
    bio: 'Vencedor do Seiyu Awards como Melhor Ator Principal por seu lendário papel em Kuroshitsuji, Daisuke Ono define a imagem do homem estoico e poderoso — imortalizando Jotaro Kujo em JoJo’s Bizarre Adventure e o discurso suicida de Erwin Smith.',
    secretFact: 'Para os famigerados gritos “ORA ORA ORA!” do Star Platinum, Daisuke Ono treinou fôlego diafragmático para disparar rajadas contínuas de até 20 segundos em um único take sem cortar!',
    curiosities: [
      'O discurso final do Comandante Erwin Smith diante da morte em "Shingeki no Kyojin" é considerado pelos fãs um dos melhores monólogos da história dos animes.',
      'Estrela como Sebastian Michaelis em "Kuroshitsuji" ("Black Butler"), Jotaro Kujo da Parte 3 até a Parte 6 de "JoJo" e Shizuo Heiwajima em "Durarara!!".',
      'Também é um entusiasta da astronomia e da cultura de sua província natal, Kōchi, servindo como embaixador turístico oficial.',
    ],
    signatureFranchises: ['jojo', 'shingeki no kyojin', 'attack on titan', 'kuroshitsuji', 'black butler', 'durarara'],
    characterExamples: { jojo: 'Jotaro Kujo', 'shingeki no kyojin': 'Erwin Smith', kuroshitsuji: 'Sebastian Michaelis' },
  },
  {
    id: 'tv_junko_takeuchi',
    name: 'Junko Takeuchi',
    aliases: ['takeuchi junko'],
    wikiTitle: 'Junko_Takeuchi',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🍥',
    voiceType: 'Energia Inabalável • Garoto Protagonista',
    hometown: 'Saitama, Japão',
    birthYear: 1972,
    tagline: '“Tô Certo! Dattebayo!” — De Naruto Uzumaki ao Inesquecível Gomamon em Digimon!',
    knownFor: 'Naruto Uzumaki (Naruto / Shippuden) • Gomamon (Digimon Adventure) • Gon Freecss (HxH 1999) • Takuya Kanbara',
    quote: 'Eu nunca volto atrás na minha palavra — esse é o meu jeito ninja de ser!',
    quoteJp: '「だってばよ！」(Dattebayo!)',
    rpgTitle: 'Hokage Eterna da Determinação',
    bio: 'Uma das vozes mais reconhecíveis do planeta, Junko Takeuchi acompanhou Naruto Uzumaki do menino solitário da Academia até se tornar o Sétimo Hokage — além de ser eternamente amada como Gomamon em Digimon Adventure e Takuya em Digimon Frontier.',
    secretFact: 'No primeiro teste de Naruto, o bordão “Dattebayo” parecia difícil de encaixar naturalmente na fala — Junko criou uma cadência rascante e cheia de sorrisos que tornou o grito assinatura mundial.',
    curiosities: [
      'No universo Digimon, deu vida tanto ao irreverente parceiro Gomamon de Joe em "Digimon Adventure" quanto ao protagonista Takuya Kanbara em "Digimon Frontier".',
      'Deu a primeira voz a Gon Freecss na versão clássica de "Hunter x Hunter" (1999) e dublou Endou Mamoru em "Inazuma Eleven" (Super Onze).',
      'Manteve o papel principal de Naruto ao longo de mais de 700 episódios entre Naruto Clássico, Shippuden e Boruto.',
    ],
    signatureFranchises: ['naruto', 'digimon', 'hunter x hunter', 'inazuma eleven'],
    characterExamples: { naruto: 'Naruto Uzumaki', digimon: 'Gomamon / Takuya Kanbara', 'hunter x hunter': 'Gon Freecss' },
  },
  {
    id: 'tv_megumi_ogata',
    name: 'Megumi Ogata',
    aliases: ['ogata megumi'],
    wikiTitle: 'Megumi_Ogata',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '🎻',
    voiceType: 'Contralto Angustiado • Ikemen & Alma',
    hometown: 'Chiyoda, Tóquio, Japão',
    birthYear: 1965,
    tagline: 'De Shinji Ikari e Kurama Yōko até Yuta Okkotsu e Sailor Urano!',
    knownFor: 'Shinji Ikari (Evangelion) • Yuta Okkotsu (Jujutsu Kaisen 0) • Kurama (Yu Yu Hakusho) • Yukito (Cardcaptor Sakura)',
    quote: 'Quando o peso psicológico do mundo cai sobre um protagonista, Megumi Ogata assume o microfone.',
    quoteJp: '「逃げちゃダメだ…」(Não posso fugir...)',
    rpgTitle: 'Piloto da Unidade Evangelion 01',
    bio: 'Cantora, diretora e uma das seiyūs mais influentes dos anos 90 até hoje. Megumi Ogata redefiniu o protagonismo dramático nos animes como Shinji Ikari em Neon Genesis Evangelion e surpreendeu o mundo décadas depois dando voz a Yuta Okkotsu em Jujutsu Kaisen.',
    secretFact: 'Hideaki Anno escolheu Megumi Ogata para viver Shinji Ikari justamente pela vulnerabilidade andrógina de sua voz, e anos depois Gege Akutami aprovou pessoalmente sua escolha como Yuta Okkotsu!',
    curiosities: [
      'Estrelou alguns dos maiores clássicos absolutos dos anos 90: Kurama em "Yu Yu Hakusho", Haruka / Sailor Urano em "Sailor Moon", Yukito / Yue em "Cardcaptor Sakura" e Shinji Ikari.',
      'Conseguiu um dos maiores momentos vocais recentes como Yuta Okkotsu em "Jujutsu Kaisen 0", voltando ao topo das premiações japonesas.',
      'Também é o protagonista Makoto Naegi e o gênio caótico Nagito Komaeda na série "Danganronpa".',
    ],
    signatureFranchises: ['evangelion', 'jujutsu kaisen', 'yu yu hakusho', 'cardcaptor sakura', 'sailor moon', 'danganronpa'],
    characterExamples: { evangelion: 'Shinji Ikari', 'jujutsu kaisen': 'Yuta Okkotsu', 'yu yu hakusho': 'Kurama' },
  },
  {
    id: 'tv_mayumi_tanaka',
    name: 'Mayumi Tanaka',
    aliases: ['tanaka mayumi'],
    wikiTitle: 'Mayumi_Tanaka',
    nationalityCode: 'jp',
    nationalityLabel: 'Japão',
    icon: '👒',
    voiceType: 'Espírito Livre & Aventureiro • Lenda Viva',
    hometown: 'Tóquio, Japão',
    birthYear: 1955,
    tagline: '“Eu Serei o Rei dos Piratas!” — De Monkey D. Luffy a Kuririn em Dragon Ball Z!',
    knownFor: 'Monkey D. Luffy (One Piece) • Kuririn (Dragon Ball Z / Super) • Pazu (O Castelo no Céu) • Koenma (Yu Yu Hakusho)',
    quote: 'Mais de mil episódios em alto mar e quatro décadas ao lado dos Guerreiros Z!',
    quoteJp: '「海賊王に俺はなる！」(Kaizoku-ō ni ore wa naru!)',
    rpgTitle: 'Capitã Suprema dos Chapéus de Palha',
    bio: 'Monumento vivo da animação japonesa. Além de liderar One Piece por mais de 25 anos como Monkey D. Luffy, Mayumi Tanaka foi a fiel companheira de Masako Nozawa dando voz a Kuririn em toda a saga Dragon Ball e Pazu no clássico do Studio Ghibli.',
    secretFact: 'Eiichiro Oda escolheu pessoalmente Mayumi Tanaka para Luffy depois de se apaixonar por sua interpretação de Pazu em "O Castelo no Céu", do Studio Ghibli!',
    curiosities: [
      'Em Dragon Ball, além de Kuririn, também deu voz ao mestre Yajirobe e à Vovó Uranai — muitas vezes contracenando consigo mesma e com Masako Nozawa.',
      'Pediu humoristicamente que seu amigo Masako Nozawa “não deixe ninguém assumir Luffy antes da hora” — as duas são grandes amigas há quase 40 anos.',
      'Também viveu Ryunosuke Fujinami em "Urusei Yatsura", Kanna em "Sakura Wars" e Koenma em "Yu Yu Hakusho".',
    ],
    signatureFranchises: ['one piece', 'dragon ball', 'yu yu hakusho', 'castle in the sky'],
    characterExamples: { 'one piece': 'Monkey D. Luffy', 'dragon ball': 'Kuririn', 'yu yu hakusho': 'Koenma' },
  },
  {
    id: 'tv_mark_hamill',
    name: 'Mark Hamill',
    aliases: [],
    wikiTitle: 'Mark_Hamill',
    nationalityCode: 'us',
    nationalityLabel: 'Estados Unidos',
    icon: '🃏',
    voiceType: 'Barítono Maníaco & Soberania Vilanesca',
    hometown: 'Oakland, Califórnia, EUA',
    birthYear: 1951,
    tagline: 'Do Coringa Definitivo das Animações DC ao Senhor do Fogo Ozai em Avatar!',
    knownFor: 'Coringa / Joker (Batman TAS / Liga da Justiça) • Senhor do Fogo Ozai (Avatar) • Saltitão (Apenas um Show)',
    quote: 'Ao lado de Kevin Conroy, Mark Hamill criou a risada mais icônica de toda a animação americana.',
    quoteJp: '“Without Batman, crime has no punchline!”',
    rpgTitle: 'Príncipe Palhaço das Cordas Vocais',
    bio: 'Muito além de Luke Skywalker em Star Wars, Mark Hamill construiu uma segunda carreira lendária como um dos maiores dubladores da história americana — com destaque eterno como o Coringa da DC e o Senhor do Fogo Ozai em Avatar.',
    secretFact: 'Hamill diz que seu Coringa não tem apenas uma risada — ele escolheu “um instrumento musical diferente de risada para cada emoção”: sarcástica, triunfante, furiosa e desesperada!',
    curiosities: [
      'Aceitou o papel do Coringa em "Batman: A Série Animada" achando que jamais seria escalado por ser muito associado a um herói bonzinho (Luke Skywalker).',
      'Retornou ao lado de Kevin Conroy na trilogia de videogames "Batman: Arkham" e na animação "Batman: A Piada Mortal".',
      'Também interpretou o temido Senhor do Fogo Ozai em "Avatar: A Lenda de Aang", Saltitão (Skips) em "Apenas um Show" e Art Rosenbaum em "Invencível".',
    ],
    signatureFranchises: ['batman', 'justice league', 'liga da justica', 'avatar', 'regular show', 'apenas um show', 'invincible'],
    characterExamples: { batman: 'Coringa (Joker)', 'liga da justica': 'Coringa / Solomon Grundy', avatar: 'Senhor do Fogo Ozai' },
  },
  {
    id: 'tv_tara_strong',
    name: 'Tara Strong',
    aliases: [],
    wikiTitle: 'Tara_Strong',
    nationalityCode: 'us',
    nationalityLabel: 'Estados Unidos',
    icon: '💜',
    voiceType: 'Camaleoa Multivozes • Heroínas & Jovens',
    hometown: 'Toronto, Canadá / EUA',
    birthYear: 1973,
    tagline: 'A Rainha da Animação Americana: Ravena, Ben 10, Timmy Turner, Arlequina e Batgirl!',
    knownFor: 'Ravena (Jovens Titãs) • Ben Tennyson (Ben 10) • Timmy Turner • Arlequina / Batgirl • Docinho',
    quote: 'Azarath Metrion Zinthos! Se você assistiu desenhos americanos dos anos 90 aos 2020, ouviu Tara Strong.',
    quoteJp: '“Azarath Metrion Zinthos!”',
    rpgTitle: 'Feiticeira Suprema dos Cartoons',
    bio: 'Dona de centenas de papéis amados da cultura pop ocidental, Tara Strong cresceu de atriz mirim a pilar insubstituível das animações da Cartoon Network, Nickelodeon, Disney e DC Comics.',
    secretFact: 'No estúdio, Tara muitas vezes gravou falas da sombria e sarcástica Ravena no mesmo dia em que gravava a voz estridente do hiperativo Timmy Turner em "Os Padrinhos Mágicos"!',
    curiosities: [
      'Interpreta há décadas Ravena nos "Jovens Titãs", Ben Tennyson na série clássica de "Ben 10" e Docinho em "As Meninas Superpoderosas".',
      'É a principal voz de Arlequina nos games "Batman: Arkham" (após Arleen Sorkin passar o bastão) e foi Batgirl em "As Novas Aventuras do Batman".',
      'Também aparece como a assistente Miss Minutes em "Loki" no Universo Cinematográfico Marvel.',
    ],
    signatureFranchises: ['teen titans', 'jovens titas', 'ben 10', 'batman', 'justice league', 'liga da justica', 'powerpuff'],
    characterExamples: { 'jovens titas': 'Ravena', 'ben 10': 'Ben Tennyson', batman: 'Batgirl / Arlequina' },
  },
  {
    id: 'tv_phil_lamarr',
    name: 'Phil LaMarr',
    aliases: [],
    wikiTitle: 'Phil_LaMarr',
    nationalityCode: 'us',
    nationalityLabel: 'Estados Unidos',
    icon: '💚',
    voiceType: 'Barítono Firme • Honra & Humor',
    hometown: 'Los Angeles, Califórnia, EUA',
    birthYear: 1967,
    tagline: 'A Voz Inabalável do Lanterna Verde John Stewart, Samurai Jack e Super Choque!',
    knownFor: 'Lanterna Verde John Stewart (Liga da Justiça) • Samurai Jack • Super Choque (Static Shock) • Hermes Conrad',
    quote: '“No dia mais claro, na noite mais densa...” — Autoridade, honra e heroísmo na animação americana.',
    quoteJp: '“In brightest day, in blackest night...”',
    rpgTitle: 'Guardião Esmeralda da Liga',
    bio: 'Formado em teatro por Yale e veterano do grupo de comédia MADtv, Phil LaMarr marcou a infância de toda uma geração nos anos 2000 protagonizando três das séries animadas mais celebradas de sua época ao mesmo tempo.',
    secretFact: 'Para criar o tom econômico e sereno de Samurai Jack, LaMarr estudou interpretações minimalistas dos clássicos filmes de samurai de Akira Kurosawa, como Toshirō Mifune.',
    curiosities: [
      'Protagonizou simultaneamente "Liga da Justiça" (John Stewart), "Samurai Jack" e "Super Choque" (Virgil Hawkins) na era de ouro da animação americana.',
      'Os fãs de Star Wars também o reconhecem como a voz recorrente do Mestre Jedi Kit Fisto em "Star Wars: A Guerra dos Clones".',
      'No cinema live-action, protagonizou uma das cenas mais comentadas de "Pulp Fiction" (1994) de Quentin Tarantino como Marvin.',
    ],
    signatureFranchises: ['justice league', 'liga da justica', 'samurai jack', 'static shock', 'super choque', 'futurama', 'young justice'],
    characterExamples: { 'liga da justica': 'John Stewart (Lanterna Verde)', 'samurai jack': 'Samurai Jack' },
  },
  {
    id: 'tv_dante_basco',
    name: 'Dante Basco',
    aliases: [],
    wikiTitle: 'Dante_Basco',
    nationalityCode: 'us',
    nationalityLabel: 'Estados Unidos',
    icon: '☄️',
    voiceType: 'Rascante Rebelde • Redenção & Honra',
    hometown: 'Pittsburg, Califórnia, EUA',
    birthYear: 1975,
    tagline: '“Preciso Recuperar Minha Honra!” — A Voz Inesquecível do Príncipe Zuko!',
    knownFor: 'Príncipe Zuko (Avatar: A Lenda de Aang) • General Iroh II (Korra) • Jake Long (Dragão Ocidental)',
    quote: 'Um dos maiores arcos de redenção da história da TV ganhou alma na voz de Dante Basco.',
    quoteJp: '“I must capture the Avatar to restore my honor!”',
    rpgTitle: 'Mestre da Dobra do Fogo Azul',
    bio: 'Ator de cinema (Rufio em Hook de Spielberg) e estrela eterna da dublagem animada. A voz levemente rasgada e apaixonada de Dante Basco transformou o Príncipe Zuko de Avatar em um dos personagens mais complexos da história da TV.',
    secretFact: 'Na continuação "A Lenda de Korra", os criadores convidaram Dante Basco para retornar — desta vez como o neto heroico de Zuko, o General Iroh II!',
    curiosities: [
      'A linha de Zuko sobre "recuperar minha honra" tornou-se tão icônica que Dante é aplaudido sempre que a repete em convenções pelo mundo.',
      'Também estrelou a animação da Disney "Jake Long: O Dragão Ocidental" como protagonista no mesmo período em que dublava Zuko.',
      'Na juventude, brilhou diante das câmeras como o líder dos Garotos Perdidos, Rufio, ao lado de Robin Williams em "Hook" (1991).',
    ],
    signatureFranchises: ['avatar', 'korra', 'american dragon', 'jake long'],
    characterExamples: { avatar: 'Príncipe Zuko', korra: 'General Iroh II' },
  },
];

export function computeVoiceXpSplit(percentage: number, extraStars: number): {
  milestonesXp: number;
  extraStarsXp: number;
  totalXp: number;
} {
  let milestonesXp = 0;
  for (const step of VOICE_MILESTONES) {
    if (percentage >= step.thresholdPct) {
      milestonesXp += step.xp;
    }
  }
  const stars = Math.max(0, Number(extraStars || 0));
  const extraStarsXp = stars * VOICE_EXTRA_STAR_XP;
  return {
    milestonesXp,
    extraStarsXp,
    totalXp: milestonesXp + extraStarsXp,
  };
}

export function resolveVoiceRpgRank(percentage: number, extraStars = 0): string {
  if (percentage >= 100 && extraStars > 0) return 'SS';
  if (percentage >= 100) return 'S';
  if (percentage >= 75) return 'A+';
  if (percentage >= 60) return 'A';
  if (percentage >= 45) return 'B';
  if (percentage >= 30) return 'C';
  if (percentage >= 15) return 'D';
  return 'E';
}

export function resolveVoiceTierByPct(percentage: number, extraStars = 0): {
  currentTier: VoiceRarityTier;
  tierLabel: string;
  tierIcon: string;
  tcgCode: string;
  rpgRank: string;
  xpEarned: number;
  nextTier: Exclude<VoiceRarityTier, 'locked'> | null;
  nextTierPct: number | null;
  nextTierXp: number | null;
} {
  let matched: VoiceMilestoneTier | null = null;
  for (const step of VOICE_MILESTONES) {
    if (percentage >= step.thresholdPct) {
      matched = step;
    }
  }

  const nextStep = VOICE_MILESTONES.find((s) => percentage < s.thresholdPct) || null;
  const split = computeVoiceXpSplit(percentage, extraStars);

  if (!matched) {
    return {
      currentTier: 'locked',
      tierLabel: 'Não Desbloqueada',
      tierIcon: '🔒',
      tcgCode: 'LOCKED',
      rpgRank: 'E',
      xpEarned: 0,
      nextTier: 'common',
      nextTierPct: 15,
      nextTierXp: 30,
    };
  }

  return {
    currentTier: matched.tier,
    tierLabel: matched.label,
    tierIcon: matched.icon,
    tcgCode: matched.tcgCode,
    rpgRank: resolveVoiceRpgRank(percentage, extraStars),
    xpEarned: split.totalXp,
    nextTier: nextStep ? nextStep.tier : null,
    nextTierPct: nextStep ? nextStep.thresholdPct : null,
    nextTierXp: nextStep ? nextStep.xp : null,
  };
}

export function resolveVoiceTier(totalWorks: number): {
  percentage: number;
  ceiling: number;
  extraStars: number;
  worksToNextExtraStar: number;
  worksToUnlock15: number;
  nextMilestoneWorks: number | null;
  currentTier: VoiceRarityTier;
  tierLabel: string;
  tierIcon: string;
  tcgCode: string;
  rpgRank: string;
  xpEarned: number;
  nextTier: Exclude<VoiceRarityTier, 'locked'> | null;
  nextTierPct: number | null;
  nextTierXp: number | null;
  progressPercentage: number;
} {
  const safeWorks = Math.max(0, Number(totalWorks || 0));
  const ceiling = VOICE_ALBUM_CEILING; // 20

  let percentage = 0;
  if (safeWorks >= 20) percentage = 100;
  else if (safeWorks >= 14) percentage = 75;
  else if (safeWorks >= 11) percentage = 60;
  else if (safeWorks >= 8) percentage = 45;
  else if (safeWorks >= 5) percentage = 30;
  else if (safeWorks >= 3) percentage = 15;
  else percentage = Math.min(14, Math.floor((safeWorks / ceiling) * 100));

  const extraStars =
    safeWorks > ceiling
      ? Math.floor((safeWorks - ceiling) / VOICE_WORKS_PER_EXTRA_STAR)
      : 0;

  const worksToNextExtraStar =
    safeWorks >= ceiling
      ? VOICE_WORKS_PER_EXTRA_STAR - ((safeWorks - ceiling) % VOICE_WORKS_PER_EXTRA_STAR)
      : ceiling - safeWorks + VOICE_WORKS_PER_EXTRA_STAR;

  const worksToUnlock15 = Math.max(0, 3 - safeWorks);

  const info = resolveVoiceTierByPct(percentage, extraStars);

  let nextMilestoneWorks: number | null = null;
  if (safeWorks < 3) nextMilestoneWorks = 3;
  else if (safeWorks < 5) nextMilestoneWorks = 5;
  else if (safeWorks < 8) nextMilestoneWorks = 8;
  else if (safeWorks < 11) nextMilestoneWorks = 11;
  else if (safeWorks < 14) nextMilestoneWorks = 14;
  else if (safeWorks < 20) nextMilestoneWorks = 20;
  else nextMilestoneWorks = null;

  return {
    percentage,
    ceiling,
    extraStars,
    worksToNextExtraStar,
    worksToUnlock15,
    nextMilestoneWorks,
    ...info,
    progressPercentage: percentage,
  };
}
