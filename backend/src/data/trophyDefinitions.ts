export type TrophyTier = 'bronze' | 'silver' | 'epic' | 'gold' | 'mythic' | 'platinum';

export interface TrophyDefinition {
  id: string;
  category: string;
  categories?: string[];
  tier: TrophyTier;
  title: string;
  description: string;
  icon: string;
  target_type: string;
  target_value: number;
  target_metadata?: Record<string, any>;
  sort_order: number;
}

export const TIER_CONFIG: Record<
  TrophyTier,
  { name: string; symbol: string; color: string; points: number; border: string; glow: string }
> = {
  bronze: {
    name: 'Bronze',
    symbol: '🥉',
    color: '#CD7F32',
    points: 15,
    border: 'border-[#CD7F32]',
    glow: 'shadow-[0_0_20px_rgba(205,127,50,0.3)]',
  },
  silver: {
    name: 'Prata',
    symbol: '🥈',
    color: '#C0C0C0',
    points: 25,
    border: 'border-[#C0C0C0]',
    glow: 'shadow-[0_0_20px_rgba(192,192,192,0.3)]',
  },
  epic: {
    name: 'Épico',
    symbol: '💜',
    color: '#9B59B6',
    points: 40,
    border: 'border-[#9B59B6]',
    glow: 'shadow-[0_0_25px_rgba(155,89,182,0.4)]',
  },
  gold: {
    name: 'Ouro',
    symbol: '🥇',
    color: '#FFD700',
    points: 70,
    border: 'border-[#FFD700]',
    glow: 'shadow-[0_0_25px_rgba(255,215,0,0.4)]',
  },
  mythic: {
    name: 'Mítico',
    symbol: '💎',
    color: '#EF4444',
    points: 105,
    border: 'border-[#EF4444]',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]',
  },
  platinum: {
    name: 'Platina',
    symbol: '🏆',
    color: '#E5E4E2',
    points: 1000,
    border: 'border-[#E5E4E2]',
    glow: 'shadow-[0_0_35px_rgba(229,228,226,0.6)]',
  },
};

export const TROPHY_DEFINITIONS: TrophyDefinition[] = [
  {
    "id": "vm_br_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "É do Brasil!",
    "description": "Conquistar 1 filme do Brasil (1 filme).",
    "icon": "🇧🇷",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil"
    },
    "sort_order": 1,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_mx_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "É o Filme do Pelé?",
    "description": "Conquistar 1 filme do México (1 filme).",
    "icon": "🌮",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "mx",
      "countryName": "México"
    },
    "sort_order": 2,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_nl_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Errou!",
    "description": "Conquistar 1 filme dos Países Baixos / Holanda (1 filme).",
    "icon": "🌷",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "nl",
      "countryName": "Países Baixos"
    },
    "sort_order": 3,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_mc_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Não Era Só Corrida?",
    "description": "Conquistar 1 filme de Mônaco (1 filme).",
    "icon": "🏎️",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "mc",
      "countryName": "Mônaco"
    },
    "sort_order": 4,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_qa_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Não Podiam Construir um País Melhor?",
    "description": "Conquistar 1 filme do Catar (1 filme).",
    "icon": "🏙️",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "qa",
      "countryName": "Catar"
    },
    "sort_order": 5,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_cv_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Vozinha Feliz!",
    "description": "Conquistar 1 filme de Cabo Verde (1 filme).",
    "icon": "🏝️",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "cv",
      "countryName": "Cabo Verde"
    },
    "sort_order": 6,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_diff_td_ro",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes I",
    "description": "Conquistar Chade e Romênia (2 países).",
    "icon": "🇷🇴",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "td",
        "ro"
      ]
    },
    "sort_order": 7,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_diff_id_mc",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes II",
    "description": "Conquistar Indonésia e Mônaco (2 países).",
    "icon": "🇮🇩",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "id",
        "mc"
      ]
    },
    "sort_order": 8,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_diff_ie_ci",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes III",
    "description": "Conquistar Irlanda e Costa do Marfim (2 países).",
    "icon": "🇨🇮",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "ie",
        "ci"
      ]
    },
    "sort_order": 9,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_diff_ml_gn",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes IV",
    "description": "Conquistar Mali e Guiné (2 países).",
    "icon": "🇲🇱",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "ml",
        "gn"
      ]
    },
    "sort_order": 10,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_first_foreign",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Passaporte Carimbado",
    "description": "Conquistar 1 país estrangeiro no Desafio dos 195 (1 país fora o Brasil).",
    "icon": "🛂",
    "target_type": "conquered_countries_count",
    "target_value": 1,
    "target_metadata": {
      "excludeCode": "br"
    },
    "sort_order": 11,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_triple_border",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Tríplice Fronteira",
    "description": "Conquistar Brasil, Argentina e Paraguai (3 países).",
    "icon": "💧",
    "target_type": "country_list",
    "target_value": 3,
    "target_metadata": {
      "countryCodes": [
        "br",
        "ar",
        "py"
      ]
    },
    "sort_order": 12,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_pt_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Devolve Nosso Ouro!",
    "description": "Conquistar 1 filme de Portugal (1 filme).",
    "icon": "🇵🇹",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "pt",
      "countryName": "Portugal"
    },
    "sort_order": 13,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_ar_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Hermanos, Mas Só na Hora do Cinema",
    "description": "Conquistar 1 filme da Argentina (1 filme).",
    "icon": "🇦🇷",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "ar",
      "countryName": "Argentina"
    },
    "sort_order": 14,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_fr_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Baguete, Vinho e Filme Cult",
    "description": "Conquistar 1 filme da França (1 filme).",
    "icon": "🥖",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "fr",
      "countryName": "França"
    },
    "sort_order": 15,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_it_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Mamma Mia!",
    "description": "Conquistar 1 filme da Itália (1 filme).",
    "icon": "🍕",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "it",
      "countryName": "Itália"
    },
    "sort_order": 16,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_jp_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Otaku ou Cinéfilo?",
    "description": "Conquistar 1 filme do Japão (1 filme).",
    "icon": "⛩️",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "jp",
      "countryName": "Japão"
    },
    "sort_order": 17,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_kr_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "K-Pop, Dorama e Parasita",
    "description": "Conquistar 1 filme da Coreia do Sul (1 filme).",
    "icon": "🥢",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "kr",
      "countryName": "Coreia do Sul"
    },
    "sort_order": 18,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_in_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Dança, Música e 3 Horas de Filme!",
    "description": "Conquistar 1 filme da Índia (1 filme).",
    "icon": "👳",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "in",
      "countryName": "Índia"
    },
    "sort_order": 19,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_au_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Aqui Tem Mais Canguru que Gente!",
    "description": "Conquistar 1 filme da Austrália (1 filme).",
    "icon": "🦘",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "au",
      "countryName": "Austrália"
    },
    "sort_order": 20,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_ro_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Cuidado com o Drácula!",
    "description": "Conquistar 1 filme da Romênia (1 filme).",
    "icon": "🧛",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "ro",
      "countryName": "Romênia"
    },
    "sort_order": 21,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_is_first",
    "category": "volta_ao_mundo",
    "tier": "bronze",
    "title": "Só Tem Gelo, Vulcão e Paisagem Bonita",
    "description": "Conquistar 1 filme da Islândia (1 filme).",
    "icon": "🌋",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "is",
      "countryName": "Islândia"
    },
    "sort_order": 22,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_br_10",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Cinema Nacional",
    "description": "Conquistar 10 filmes do Brasil (10 filmes).",
    "icon": "🎬",
    "target_type": "country_movie_count",
    "target_value": 10,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil"
    },
    "sort_order": 23,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_de_7",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Terror do Brasil",
    "description": "Conquistar 7 filmes da Alemanha (7 filmes).",
    "icon": "⚽",
    "target_type": "country_movie_count",
    "target_value": 7,
    "target_metadata": {
      "countryCode": "de",
      "countryName": "Alemanha"
    },
    "sort_order": 24,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_ancient_wonders",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Será Que Foram Criadas por Aliens?",
    "description": "Conquistar 7 filmes dos países das 7 Maravilhas do Mundo Antigo: 2 filmes do Egito, 1 filme do Iraque, 2 filmes da Grécia e 2 filmes da Turquia (7 filmes).",
    "icon": "🏺",
    "target_type": "country_movie_counts",
    "target_value": 7,
    "target_metadata": {
      "requirements": [
        {
          "code": "eg",
          "name": "Egito",
          "min": 2
        },
        {
          "code": "iq",
          "name": "Iraque",
          "min": 1
        },
        {
          "code": "gr",
          "name": "Grécia",
          "min": 2
        },
        {
          "code": "tr",
          "name": "Turquia",
          "min": 2
        }
      ]
    },
    "sort_order": 25,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_modern_wonders",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Agora Todo Mundo Tem Maravilhas?",
    "description": "Conquistar os 7 países das Maravilhas do Mundo Moderno (1 filme de cada): Brasil, China, Peru, Jordânia, Itália, Índia e México (7 países).",
    "icon": "🗿",
    "target_type": "country_list",
    "target_value": 7,
    "target_metadata": {
      "countryCodes": [
        "br",
        "cn",
        "pe",
        "jo",
        "it",
        "in",
        "mx"
      ]
    },
    "sort_order": 26,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_world_cup_champs",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "No Futebol Eles São Bons, e no Cinema?",
    "description": "Conquistar os campeões mundiais: Alemanha, Argentina, Brasil, Espanha, França, Inglaterra (ou Reino Unido), Itália e Uruguai (8 países).",
    "icon": "🏆",
    "target_type": "country_list",
    "target_value": 8,
    "target_metadata": {
      "countryCodes": [
        "de",
        "ar",
        "br",
        "es",
        "fr",
        "gb",
        "it",
        "uy"
      ]
    },
    "sort_order": 27,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_freezing_cold",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Frio, Muito Frio!",
    "description": "Conquistar Rússia, Canadá, Mongólia, Noruega, Islândia e Finlândia (6 países).",
    "icon": "❄️",
    "target_type": "country_list",
    "target_value": 6,
    "target_metadata": {
      "countryCodes": [
        "ru",
        "ca",
        "mn",
        "no",
        "is",
        "fi"
      ]
    },
    "sort_order": 28,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_exotic_flags",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Minha Bandeira É Exótica!",
    "description": "Conquistar Nepal, Suíça, Quirguistão e Paraguai (4 países).",
    "icon": "🚩",
    "target_type": "country_list",
    "target_value": 4,
    "target_metadata": {
      "countryCodes": [
        "np",
        "ch",
        "kg",
        "py"
      ]
    },
    "sort_order": 29,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_top_gdp",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Rico, Mais Que Você!",
    "description": "Conquistar EUA, China, Alemanha, Japão e Índia (5 países).",
    "icon": "💰",
    "target_type": "country_list",
    "target_value": 5,
    "target_metadata": {
      "countryCodes": [
        "us",
        "cn",
        "de",
        "jp",
        "in"
      ]
    },
    "sort_order": 30,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_countries_25",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Mochileiro Continental",
    "description": "Conquistar 25 países diferentes no Desafio dos 195 (25 países).",
    "icon": "🎒",
    "target_type": "conquered_countries_count",
    "target_value": 25,
    "sort_order": 31,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_vikings",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Vikings na Tela",
    "description": "Conquistar Dinamarca, Noruega, Suécia, Finlândia e Islândia (5 países).",
    "icon": "⚔️",
    "target_type": "country_list",
    "target_value": 5,
    "target_metadata": {
      "countryCodes": [
        "dk",
        "no",
        "se",
        "fi",
        "is"
      ]
    },
    "sort_order": 32,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_parallel_38",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Tensão no Paralelo 38",
    "description": "Conquistar Coreia do Sul e Coreia do Norte (2 países).",
    "icon": "🎖️",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "kr",
        "kp"
      ]
    },
    "sort_order": 33,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_cold_war",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Guerra Fria no Sofá",
    "description": "Conquistar 5 filmes dos Estados Unidos e 5 filmes da Rússia (10 filmes).",
    "icon": "🚀",
    "target_type": "country_movie_counts",
    "target_value": 10,
    "target_metadata": {
      "requirements": [
        {
          "code": "us",
          "name": "Estados Unidos",
          "min": 5
        },
        {
          "code": "ru",
          "name": "Rússia",
          "min": 5
        }
      ]
    },
    "sort_order": 34,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_andes",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Cordilheira dos Andes",
    "description": "Conquistar Chile, Argentina, Bolívia, Peru, Equador, Colômbia e Venezuela (7 países).",
    "icon": "🏔️",
    "target_type": "country_list",
    "target_value": 7,
    "target_metadata": {
      "countryCodes": [
        "cl",
        "ar",
        "bo",
        "pe",
        "ec",
        "co",
        "ve"
      ]
    },
    "sort_order": 35,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_caribbean_pirates",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Piratas do Caribe (Sem o Johnny Depp)",
    "description": "Conquistar Cuba, Jamaica, Haiti, República Dominicana, Bahamas e Trinidad e Tobago (6 países).",
    "icon": "🏴‍☠️",
    "target_type": "country_list",
    "target_value": 6,
    "target_metadata": {
      "countryCodes": [
        "cu",
        "jm",
        "ht",
        "do",
        "bs",
        "tt"
      ]
    },
    "sort_order": 36,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_cradle_civilization",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Berço da Civilização",
    "description": "Conquistar Grécia, Itália, Egito, Irã, Iraque e China (6 países).",
    "icon": "🏛️",
    "target_type": "country_list",
    "target_value": 6,
    "target_metadata": {
      "countryCodes": [
        "gr",
        "it",
        "eg",
        "ir",
        "iq",
        "cn"
      ]
    },
    "sort_order": 37,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_chocolate_neutral",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Neutros, Ricos e Cheios de Chocolate",
    "description": "Conquistar Suíça, Áustria, Bélgica e Liechtenstein (4 países).",
    "icon": "🍫",
    "target_type": "country_list",
    "target_value": 4,
    "target_metadata": {
      "countryCodes": [
        "ch",
        "at",
        "be",
        "li"
      ]
    },
    "sort_order": 38,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_asian_tigers",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Tigres Asiáticos",
    "description": "Conquistar Coreia do Sul, Cingapura, Malásia, Tailândia e Indonésia (5 países).",
    "icon": "🐅",
    "target_type": "country_list",
    "target_value": 5,
    "target_metadata": {
      "countryCodes": [
        "kr",
        "sg",
        "my",
        "th",
        "id"
      ]
    },
    "sort_order": 39,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_commonwealth",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "O Sol Nunca se Põe na Commonwealth",
    "description": "Conquistar Reino Unido, Canadá, Austrália, Nova Zelândia, Índia e África do Sul (6 países).",
    "icon": "👑",
    "target_type": "country_list",
    "target_value": 6,
    "target_metadata": {
      "countryCodes": [
        "gb",
        "ca",
        "au",
        "nz",
        "in",
        "za"
      ]
    },
    "sort_order": 40,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_countries_50",
    "category": "volta_ao_mundo",
    "tier": "silver",
    "title": "Cidadão do Mundo",
    "description": "Conquistar 50 países diferentes no Desafio dos 195 (50 países).",
    "icon": "🌐",
    "target_type": "conquered_countries_count",
    "target_value": 50,
    "sort_order": 41,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_br_20",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Cinéfilo Cult",
    "description": "Conquistar 20 filmes do Brasil (20 filmes).",
    "icon": "🎞️",
    "target_type": "country_movie_count",
    "target_value": 20,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil"
    },
    "sort_order": 42,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_us_300",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Hollywood!",
    "description": "Conquistar 300 filmes dos Estados Unidos (300 filmes).",
    "icon": "⭐",
    "target_type": "country_movie_count",
    "target_value": 300,
    "target_metadata": {
      "countryCode": "us",
      "countryName": "Estados Unidos"
    },
    "sort_order": 43,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_kp_first",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Não Era Proibido?",
    "description": "Conquistar 1 filme da Coreia do Norte (1 filme).",
    "icon": "🚨",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "kp",
      "countryName": "Coreia do Norte"
    },
    "sort_order": 44,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_first_mythic",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Seu Primeiro Mítico!",
    "description": "Conquistar 1 país com classificação Mítico na página Desafio dos 195 (1 país).",
    "icon": "💎",
    "target_type": "rarity_mythic_count",
    "target_value": 1,
    "sort_order": 45,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_countries_71",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "A Bruxa do 71?",
    "description": "Conquistar 71 países diferentes no Desafio dos 195 (71 países).",
    "icon": "🧙‍♀️",
    "target_type": "conquered_countries_count",
    "target_value": 71,
    "sort_order": 46,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_hot_desert",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Quente, Muito Quente!",
    "description": "Conquistar Burkina Faso, Mali, Senegal, Mauritânia e Tuvalu (5 países).",
    "icon": "☀️",
    "target_type": "country_list",
    "target_value": 5,
    "target_metadata": {
      "countryCodes": [
        "bf",
        "ml",
        "sn",
        "mr",
        "tv"
      ]
    },
    "sort_order": 47,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_high_income",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "As Pessoas Têm Dinheiro Aqui, Bom pra Viver! (Ou Não)",
    "description": "Conquistar Luxemburgo, Irlanda, Suíça, Catar e Cingapura (5 países).",
    "icon": "💳",
    "target_type": "country_list",
    "target_value": 5,
    "target_metadata": {
      "countryCodes": [
        "lu",
        "ie",
        "ch",
        "qa",
        "sg"
      ]
    },
    "sort_order": 48,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_theocratic",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Teocráticos! Deus Acima de Todos (Ou Quase)",
    "description": "Conquistar Afeganistão, Arábia Saudita, Cidade do Vaticano, Irã, Mauritânia e Iêmen (6 países).",
    "icon": "🕌",
    "target_type": "country_list",
    "target_value": 6,
    "target_metadata": {
      "countryCodes": [
        "af",
        "sa",
        "va",
        "ir",
        "mr",
        "ye"
      ]
    },
    "sort_order": 49,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_communist",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Você É um Comunista Safado?!",
    "description": "Conquistar Cuba, China, Vietnã, Laos e Coreia do Norte (5 países).",
    "icon": "☭",
    "target_type": "country_list",
    "target_value": 5,
    "target_metadata": {
      "countryCodes": [
        "cu",
        "cn",
        "vn",
        "la",
        "kp"
      ]
    },
    "sort_order": 50,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_countries_100",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Centenário",
    "description": "Conquistar 100 países diferentes no Desafio dos 195 (100 países).",
    "icon": "💯",
    "target_type": "conquered_countries_count",
    "target_value": 100,
    "sort_order": 51,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_stan_gang",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "A Gangue do \"Stão\"",
    "description": "Conquistar Cazaquistão, Uzbequistão, Turcomenistão, Quirguistão, Tajiquistão, Afeganistão e Paquistão (7 países).",
    "icon": "🐎",
    "target_type": "country_list",
    "target_value": 7,
    "target_metadata": {
      "countryCodes": [
        "kz",
        "uz",
        "tm",
        "kg",
        "tj",
        "af",
        "pk"
      ]
    },
    "sort_order": 52,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_microstates",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Menores que o Bairro da Minha Vó!",
    "description": "Conquistar Cidade do Vaticano, Mônaco, San Marino, Liechtenstein, Andorra e Malta (6 países).",
    "icon": "🔍",
    "target_type": "country_list",
    "target_value": 6,
    "target_metadata": {
      "countryCodes": [
        "va",
        "mc",
        "sm",
        "li",
        "ad",
        "mt"
      ]
    },
    "sort_order": 53,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_balkans_powder_keg",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Barril de Pólvora (Bálcãs)",
    "description": "Conquistar Sérvia, Croácia, Bósnia e Herzegovina, Eslovênia, Montenegro, Macedônia do Norte, Albânia, Bulgária, Romênia e Grécia (10 países).",
    "icon": "💥",
    "target_type": "country_list",
    "target_value": 10,
    "target_metadata": {
      "countryCodes": [
        "rs",
        "hr",
        "ba",
        "si",
        "me",
        "mk",
        "al",
        "bg",
        "ro",
        "gr"
      ]
    },
    "sort_order": 54,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_iron_curtain",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Cortina de Ferro (Ex-URSS)",
    "description": "Conquistar Rússia, Ucrânia, Belarus, Estônia, Letônia, Lituânia, Geórgia, Armênia e Azerbaijão (9 países).",
    "icon": "⛓️",
    "target_type": "country_list",
    "target_value": 9,
    "target_metadata": {
      "countryCodes": [
        "ru",
        "ua",
        "by",
        "ee",
        "lv",
        "lt",
        "ge",
        "am",
        "az"
      ]
    },
    "sort_order": 55,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_brics_plus",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "BRICS+ no Cinema",
    "description": "Conquistar Brasil, Rússia, Índia, China, África do Sul, Egito, Etiópia, Irã e Emirados Árabes Unidos (9 países).",
    "icon": "🤝",
    "target_type": "country_list",
    "target_value": 9,
    "target_metadata": {
      "countryCodes": [
        "br",
        "ru",
        "in",
        "cn",
        "za",
        "eg",
        "et",
        "ir",
        "ae"
      ]
    },
    "sort_order": 56,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_landlocked",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Sem Praia, Só Montanha e Mato!",
    "description": "Conquistar Bolívia, Paraguai, Suíça, Áustria, Mongólia, Nepal, Butão, Etiópia, Ruanda e Chade (10 países).",
    "icon": "⛰️",
    "target_type": "country_list",
    "target_value": 10,
    "target_metadata": {
      "countryCodes": [
        "bo",
        "py",
        "ch",
        "at",
        "mn",
        "np",
        "bt",
        "et",
        "rw",
        "td"
      ]
    },
    "sort_order": 57,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_far_away",
    "category": "volta_ao_mundo",
    "tier": "epic",
    "title": "Onde Judas Perdeu as Botas!",
    "description": "Conquistar Madagascar, Islândia, Nova Zelândia, Sri Lanka, Filipinas, Fiji e Papua-Nova Guiné (7 países).",
    "icon": "🧭",
    "target_type": "country_list",
    "target_value": 7,
    "target_metadata": {
      "countryCodes": [
        "mg",
        "is",
        "nz",
        "lk",
        "ph",
        "fj",
        "pg"
      ]
    },
    "sort_order": 58,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_br_35",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Cinema em Casa",
    "description": "Conquistar 35 filmes do Brasil (35 filmes).",
    "icon": "🏠",
    "target_type": "country_movie_count",
    "target_value": 35,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil"
    },
    "sort_order": 59,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_us_500",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "O Pior País do Mundo Ainda Faz Uns Filmes Bons!",
    "description": "Conquistar 500 filmes dos Estados Unidos (500 filmes).",
    "icon": "🦅",
    "target_type": "country_movie_count",
    "target_value": 500,
    "target_metadata": {
      "countryCode": "us",
      "countryName": "Estados Unidos"
    },
    "sort_order": 60,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_va_first",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Eles Fazem Filmes?",
    "description": "Conquistar 1 filme da Cidade do Vaticano (1 filme).",
    "icon": "🇻🇦",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "va",
      "countryName": "Cidade do Vaticano"
    },
    "sort_order": 61,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_one_of_each_rarity",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Um de Cada!",
    "description": "Conquistar pelo menos 1 país de cada raridade (Comum, Raro, Épico, Lendário e Mítico) na página Desafio dos 195 (5 raridades).",
    "icon": "🌈",
    "target_type": "rarity_tier_coverage",
    "target_value": 5,
    "sort_order": 62,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_cplp_portuguese",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Eles Falam Português (Ou Quase)",
    "description": "Conquistar os 9 países da CPLP: Portugal, Brasil, Angola, Moçambique, Cabo Verde, Guiné-Bissau, São Tomé e Príncipe, Guiné Equatorial e Timor-Leste (9 países).",
    "icon": "🗣️",
    "target_type": "country_list",
    "target_value": 9,
    "target_metadata": {
      "countryCodes": [
        "pt",
        "br",
        "ao",
        "mz",
        "cv",
        "gw",
        "st",
        "gq",
        "tl"
      ]
    },
    "sort_order": 63,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_most_populous",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Muita Gente Mora Aqui!",
    "description": "Conquistar os 15 países mais populosos: Índia, China, EUA, Indonésia, Paquistão, Nigéria, Brasil, Bangladesh, Rússia, Etiópia, México, Japão, Egito, Filipinas e República Democrática do Congo (15 países).",
    "icon": "👥",
    "target_type": "country_list",
    "target_value": 15,
    "target_metadata": {
      "countryCodes": [
        "in",
        "cn",
        "us",
        "id",
        "pk",
        "ng",
        "br",
        "bd",
        "ru",
        "et",
        "mx",
        "jp",
        "eg",
        "ph",
        "cd"
      ]
    },
    "sort_order": 64,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_countries_150",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "A Reta Final",
    "description": "Conquistar 150 países diferentes no Desafio dos 195 (150 países).",
    "icon": "🏁",
    "target_type": "conquered_countries_count",
    "target_value": 150,
    "sort_order": 65,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_patria_grande",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Pátria Grande (América Latina Unida)",
    "description": "Conquistar Brasil, Argentina, Uruguai, Paraguai, Chile, Bolívia, Peru, Equador, Colômbia, Venezuela, México, Cuba, República Dominicana, Haiti, Guatemala, Honduras, El Salvador, Nicarágua, Costa Rica e Panamá (20 países).",
    "icon": "🌎",
    "target_type": "country_list",
    "target_value": 20,
    "target_metadata": {
      "countryCodes": [
        "br",
        "ar",
        "uy",
        "py",
        "cl",
        "bo",
        "pe",
        "ec",
        "co",
        "ve",
        "mx",
        "cu",
        "do",
        "ht",
        "gt",
        "hn",
        "sv",
        "ni",
        "cr",
        "pa"
      ]
    },
    "sort_order": 66,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_european_union",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Passaporte Europeu (União Europeia)",
    "description": "Conquistar os 27 países da União Europeia: Alemanha, Áustria, Bélgica, Bulgária, Chipre, Croácia, Dinamarca, Eslováquia, Eslovênia, Espanha, Estônia, Finlândia, França, Grécia, Hungria, Irlanda, Itália, Letônia, Lituânia, Luxemburgo, Malta, Países Baixos, Polônia, Portugal, República Tcheca, Romênia e Suécia (27 países).",
    "icon": "🇪🇺",
    "target_type": "country_list",
    "target_value": 27,
    "target_metadata": {
      "countryCodes": [
        "de",
        "at",
        "be",
        "bg",
        "cy",
        "hr",
        "dk",
        "sk",
        "si",
        "es",
        "ee",
        "fi",
        "fr",
        "gr",
        "hu",
        "ie",
        "it",
        "lv",
        "lt",
        "lu",
        "mt",
        "nl",
        "pl",
        "pt",
        "cz",
        "ro",
        "se"
      ]
    },
    "sort_order": 67,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_arab_world",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "As Mil e Uma Noites (Mundo Árabe)",
    "description": "Conquistar Egito, Argélia, Sudão, Iraque, Marrocos, Arábia Saudita, Iêmen, Síria, Tunísia, Jordânia, Emirados Árabes Unidos, Líbano, Líbia, Omã e Catar (15 países).",
    "icon": "🧞",
    "target_type": "country_list",
    "target_value": 15,
    "target_metadata": {
      "countryCodes": [
        "eg",
        "dz",
        "sd",
        "iq",
        "ma",
        "sa",
        "ye",
        "sy",
        "tn",
        "jo",
        "ae",
        "lb",
        "ly",
        "om",
        "qa"
      ]
    },
    "sort_order": 68,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_orient_master",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Mestre do Oriente",
    "description": "Conquistar 50 filmes somados entre Japão, Coreia do Sul e China (50 filmes).",
    "icon": "🐉",
    "target_type": "multi_country_movie_sum",
    "target_value": 50,
    "target_metadata": {
      "countryCodes": [
        "jp",
        "kr",
        "cn"
      ],
      "countryNames": [
        "Japão",
        "Coreia do Sul",
        "China"
      ]
    },
    "sort_order": 69,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_eurotrip_100",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Eurotrip Sem Sair do Sofá",
    "description": "Conquistar 100 filmes de países europeus no total (100 filmes).",
    "icon": "🚂",
    "target_type": "continent_movie_count",
    "target_value": 100,
    "target_metadata": {
      "continent": "Europa"
    },
    "sort_order": 70,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_countries_175",
    "category": "volta_ao_mundo",
    "tier": "gold",
    "title": "Quase Zerando o Planeta!",
    "description": "Conquistar 175 países diferentes no Desafio dos 195 (175 países).",
    "icon": "🚀",
    "target_type": "conquered_countries_count",
    "target_value": 175,
    "sort_order": 71,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_br_50",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Como Alguém Pode Falar Mal dos Filmes do Brasil?",
    "description": "Conquistar 50 filmes do Brasil (50 filmes).",
    "icon": "🇧🇷",
    "target_type": "country_movie_count",
    "target_value": 50,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil"
    },
    "sort_order": 72,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_monarchies",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Ainda Existe Monarquia?",
    "description": "Conquistar as 43 monarquias oficiais: Andorra, Antígua e Barbuda, Arábia Saudita, Austrália, Bahamas, Bahrein, Bélgica, Belize, Brunei, Butão, Camboja, Canadá, Catar, Cidade do Vaticano, Dinamarca, Emirados Árabes Unidos, Espanha, Essuatíni, Granada, Ilhas Salomão, Jamaica, Japão, Jordânia, Kuwait, Lesoto, Liechtenstein, Luxemburgo, Malásia, Marrocos, Mônaco, Noruega, Nova Zelândia, Omã, Países Baixos, Papua-Nova Guiné, Reino Unido, Santa Lúcia, São Cristóvão e Névis, São Vicente e Granadinas, Suécia, Tailândia, Tonga e Tuvalu (43 países).",
    "icon": "👑",
    "target_type": "country_list",
    "target_value": 43,
    "target_metadata": {
      "countryCodes": [
        "ad",
        "ag",
        "sa",
        "au",
        "bs",
        "bh",
        "be",
        "bz",
        "bn",
        "bt",
        "kh",
        "ca",
        "qa",
        "va",
        "dk",
        "ae",
        "es",
        "sz",
        "gd",
        "sb",
        "jm",
        "jp",
        "jo",
        "kw",
        "ls",
        "li",
        "lu",
        "my",
        "ma",
        "mc",
        "no",
        "nz",
        "om",
        "nl",
        "pg",
        "gb",
        "lc",
        "kn",
        "vc",
        "se",
        "th",
        "to",
        "tv"
      ]
    },
    "sort_order": 73,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_conqueror_south_america",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Conquistador da América do Sul",
    "description": "Conquistar 100% da América do Sul no Desafio dos 195 (12 países).",
    "icon": "🐆",
    "target_type": "country_list",
    "target_value": 12,
    "target_metadata": {
      "regionName": "América do Sul",
      "countryCodes": [
        "ar",
        "bo",
        "br",
        "cl",
        "co",
        "ec",
        "gy",
        "py",
        "pe",
        "sr",
        "uy",
        "ve"
      ]
    },
    "sort_order": 74,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_conqueror_north_america",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Conquistador da América do Norte e Caribe",
    "description": "Conquistar 100% da América do Norte, Central e Caribe no Desafio dos 195 (23 países).",
    "icon": "🗽",
    "target_type": "country_list",
    "target_value": 23,
    "target_metadata": {
      "regionName": "América do Norte e Caribe",
      "countryCodes": [
        "ag",
        "bs",
        "bb",
        "bz",
        "ca",
        "cr",
        "cu",
        "dm",
        "do",
        "sv",
        "gd",
        "gt",
        "ht",
        "hn",
        "jm",
        "mx",
        "ni",
        "pa",
        "kn",
        "lc",
        "vc",
        "tt",
        "us"
      ]
    },
    "sort_order": 75,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_conqueror_europe",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Conquistador da Europa",
    "description": "Conquistar 100% da Europa no Desafio dos 195 (44 países).",
    "icon": "🏰",
    "target_type": "country_list",
    "target_value": 44,
    "target_metadata": {
      "regionName": "Europa",
      "continent": "Europa"
    },
    "sort_order": 76,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_conqueror_asia",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Conquistador da Ásia",
    "description": "Conquistar 100% da Ásia no Desafio dos 195 (48 países).",
    "icon": "🏯",
    "target_type": "country_list",
    "target_value": 48,
    "target_metadata": {
      "regionName": "Ásia",
      "continent": "Ásia"
    },
    "sort_order": 77,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_conqueror_africa",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Conquistador da África",
    "description": "Conquistar 100% da África no Desafio dos 195 (54 países).",
    "icon": "🦁",
    "target_type": "country_list",
    "target_value": 54,
    "target_metadata": {
      "regionName": "África",
      "continent": "África"
    },
    "sort_order": 78,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_conqueror_oceania",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Conquistador da Oceania",
    "description": "Conquistar 100% da Oceania no Desafio dos 195 (14 países).",
    "icon": "🌊",
    "target_type": "country_list",
    "target_value": 14,
    "target_metadata": {
      "regionName": "Oceania",
      "continent": "Oceania"
    },
    "sort_order": 79,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_mythic_pantheon",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "O Panteão dos 18 Míticos",
    "description": "Conquistar todos os 18 países classificados como Míticos na página Desafio dos 195 (18 países).",
    "icon": "⚡",
    "target_type": "rarity_all_mythic",
    "target_value": 18,
    "sort_order": 80,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_hardest_camera",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Onde Acharam Uma Câmera Aqui?!",
    "description": "Conquistar Tuvalu, Nauru, Palau, Ilhas Marshall, Micronésia, São Cristóvão e Névis, Dominica, Kiribati, Tonga e São Tomé e Príncipe (10 países).",
    "icon": "📹",
    "target_type": "country_list",
    "target_value": 10,
    "target_metadata": {
      "countryCodes": [
        "tv",
        "nr",
        "pw",
        "mh",
        "fm",
        "kn",
        "dm",
        "ki",
        "to",
        "st"
      ]
    },
    "sort_order": 81,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_un_ambassador",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Embaixador da ONU",
    "description": "Conquistar 1.000 filmes no total espalhados por pelo menos 100 países diferentes (1000 filmes + 100 países).",
    "icon": "🇺🇳",
    "target_type": "global_movie_and_country_count",
    "target_value": 100,
    "target_metadata": {
      "minMovies": 1000,
      "minCountries": 100
    },
    "sort_order": 82,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_war_board_100",
    "category": "volta_ao_mundo",
    "tier": "mythic",
    "title": "Dono do Tabuleiro de War (100% Mundial)",
    "description": "Conquistar TODOS os 195 países na página Desafio dos 195 (195 países).",
    "icon": "🪐",
    "target_type": "conquered_countries_count",
    "target_value": 195,
    "sort_order": 83,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "vm_platinum_legend",
    "category": "volta_ao_mundo",
    "tier": "platinum",
    "title": "A Lenda Definitiva do Cinema",
    "description": "Conquistar TODOS os troféus da categoria Volta ao Mundo (verificação dinâmica: desbloqueia automaticamente quando 100% dos outros 122 troféus da categoria \"Volta ao Mundo\" estiverem conquistados, incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 122,
    "target_metadata": {
      "category": "volta_ao_mundo",
      "categoryScope": "volta_ao_mundo"
    },
    "sort_order": 84,
    "categories": [
      "volta_ao_mundo"
    ]
  },
  {
    "id": "dna_invocaversus_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Ed e Lorraine Estão Orgulhosos!",
    "description": "Conquistar 1 filme com a tag \"invocaversus\" (1 filme).",
    "icon": "🕯️",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "invocaversus"
      ]
    },
    "sort_order": 101,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_sk_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Bem-vindo ao Maine!",
    "description": "Conquistar 1 filme com a tag SK (Stephen King) (1 filme).",
    "icon": "🎈",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "SK"
      ]
    },
    "sort_order": 102,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_top250_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "O Início da Alta Cultura",
    "description": "Conquistar 1 filme com a tag TOP250 (1 filme).",
    "icon": "⭐",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "TOP250"
      ]
    },
    "sort_order": 103,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_vamp_kid_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "O Terror de Todo Pai?",
    "description": "Conquistar 1 filme com as tags Vampiro e Criança Malvada ao mesmo tempo (1 filme).",
    "icon": "🧛",
    "target_type": "tag_double_and",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Vampiro",
        "Criança Malvada"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 104,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_kid_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Propaganda de Anticoncepcional!",
    "description": "Conquistar 1 filme com a tag Criança Malvada (1 filme).",
    "icon": "👶",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Criança Malvada"
      ]
    },
    "sort_order": 105,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_school_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Nem nas Férias Eu Escapo da Escola?!",
    "description": "Conquistar 1 filme com a tag Colegio/Escola (1 filme).",
    "icon": "🏫",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Colegio/Escola"
      ]
    },
    "sort_order": 106,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_game_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Finalmente Uma Adaptação Que Presta? (Ou Não)",
    "description": "Conquistar 1 filme com a tag Baseado em jogo (1 filme).",
    "icon": "🎮",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Baseado em jogo"
      ]
    },
    "sort_order": 107,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_anime_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Medo Genuíno de Live-Action!",
    "description": "Conquistar 1 filme com a tag Baseado em Anime (1 filme).",
    "icon": "⛩️",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Baseado em Anime"
      ]
    },
    "sort_order": 108,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_anthro_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Esse Bicho Tá Falando e Usando Roupa?!",
    "description": "Conquistar 1 filme com a tag Animais antropomorficos (1 filme).",
    "icon": "🦊",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Animais antropomorficos"
      ]
    },
    "sort_order": 109,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_silent_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Ué, a TV Ficou no Mute?",
    "description": "Conquistar 1 filme com a tag Mudo (1 filme).",
    "icon": "🤫",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Mudo"
      ]
    },
    "sort_order": 110,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_bw_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Acabou a Tinta da Televisão!",
    "description": "Conquistar 1 filme com a tag Preto e branco (1 filme).",
    "icon": "🎞️",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Preto e branco"
      ]
    },
    "sort_order": 111,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_repeat_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Vale a Pena Ver de Novo!",
    "description": "Conquistar 1 filme com a tag Repetido (1 filme).",
    "icon": "🔁",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Repetido"
      ]
    },
    "sort_order": 112,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_parody_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Nada se Cria, Tudo se Zomba",
    "description": "Conquistar 1 filme com a tag Paródia (1 filme).",
    "icon": "🎭",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Paródia"
      ]
    },
    "sort_order": 113,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_xmas_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Já É Natal na Leader Magazine!",
    "description": "Conquistar 1 filme com a tag Natal (1 filme).",
    "icon": "🎄",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Natal"
      ]
    },
    "sort_order": 114,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_alien_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Busquem Conhecimento!",
    "description": "Conquistar 1 filme com a tag Aliens (1 filme).",
    "icon": "👽",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Aliens"
      ]
    },
    "sort_order": 115,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_epic_final_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Absolute Cinema!",
    "description": "Conquistar 1 filme com a tag Final Epico (1 filme).",
    "icon": "🍿",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Final Epico"
      ]
    },
    "sort_order": 116,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_gore_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Proibido Assistir Almoçando!",
    "description": "Conquistar 1 filme com a tag Gore (1 filme).",
    "icon": "🩸",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Gore"
      ]
    },
    "sort_order": 117,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_kidnap_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Alô, Liam Neeson? Preciso de Ajuda!",
    "description": "Conquistar 1 filme com a tag Sequestro (1 filme).",
    "icon": "📞",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Sequestro"
      ]
    },
    "sort_order": 118,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Todas as Cores na Tela",
    "description": "Conquistar 1 filme com a tag Personagem LGBT (1 filme).",
    "icon": "🏳️‍🌈",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ]
    },
    "sort_order": 119,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_wizard_1",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Cadê Minha Carta de Hogwarts?",
    "description": "Conquistar 1 filme com a tag Bruxo (1 filme).",
    "icon": "🧙",
    "target_type": "tag_movie_count",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Bruxo"
      ]
    },
    "sort_order": 120,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_anime_us_3",
    "category": "dna_cinefilo",
    "tier": "bronze",
    "title": "Hollywood Estragou Meu Anime?!",
    "description": "Conquistar 3 filmes dos Estados Unidos com a tag Baseado em Anime (3 filmes).",
    "icon": "🎬",
    "target_type": "tag_hybrid_country",
    "target_value": 3,
    "target_metadata": {
      "tags": [
        "Baseado em Anime"
      ],
      "countryCode": "us",
      "countryName": "Estados Unidos",
      "countryFlag": "🇺🇸",
      "isHybrid": true
    },
    "sort_order": 121,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_15",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Love is Love",
    "description": "Conquistar 15 filmes com a tag Personagem LGBT (15 filmes).",
    "icon": "💖",
    "target_type": "tag_movie_count",
    "target_value": 15,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ]
    },
    "sort_order": 122,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_vamp_lgbt_1",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Vampiros São Gays?",
    "description": "Conquistar 1 filme com as tags Vampiro e Personagem LGBT ao mesmo tempo (1 filme).",
    "icon": "🦇",
    "target_type": "tag_double_and",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Vampiro",
        "Personagem LGBT"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 123,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_vamp_kid_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Uma Epidemia de Mini Vampiros?",
    "description": "Conquistar 5 filmes com as tags Vampiro e Criança Malvada ao mesmo tempo (5 filmes).",
    "icon": "🩸",
    "target_type": "tag_double_and",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Vampiro",
        "Criança Malvada"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 124,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_abuse_kid_20",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "A Culpa É dos Pais!",
    "description": "Conquistar 20 filmes com as tags Abuso Familiar e Criança Malvada ao mesmo tempo (20 filmes).",
    "icon": "🏚️",
    "target_type": "tag_double_and",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Abuso Familiar",
        "Criança Malvada"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 125,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_alien_mx_1",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Já Chegou o Disco Voador!",
    "description": "Conquistar 1 filme do México com a tag Aliens (1 filme).",
    "icon": "🛸",
    "target_type": "tag_hybrid_country",
    "target_value": 1,
    "target_metadata": {
      "tags": [
        "Aliens"
      ],
      "countryCode": "mx",
      "countryName": "México",
      "countryFlag": "🇲🇽",
      "isHybrid": true
    },
    "sort_order": 126,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_dystopia_20",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Será Que o Mundo Acaba Assim?",
    "description": "Conquistar 20 filmes com a tag Dystopia (20 filmes).",
    "icon": "☣️",
    "target_type": "tag_movie_count",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Dystopia"
      ]
    },
    "sort_order": 127,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_time_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Vai e Volta",
    "description": "Conquistar 10 filmes com a tag Viagem no Tempo (10 filmes).",
    "icon": "⏳",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Viagem no Tempo"
      ]
    },
    "sort_order": 128,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_sk_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Turista de Derry e Castle Rock",
    "description": "Conquistar 5 filmes com a tag SK (Stephen King) (5 filmes).",
    "icon": "🤡",
    "target_type": "tag_movie_count",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "SK"
      ]
    },
    "sort_order": 129,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_top250_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Fiscal Oficial de Nota do IMDb",
    "description": "Conquistar 10 filmes com a tag TOP250 (10 filmes).",
    "icon": "📊",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "TOP250"
      ]
    },
    "sort_order": 130,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_invocaversus_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Chave do Museu Oculto dos Warren",
    "description": "Conquistar 5 filmes com a tag \"invocaversus\" (5 filmes).",
    "icon": "🗝️",
    "target_type": "tag_movie_count",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "invocaversus"
      ]
    },
    "sort_order": 131,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_true_crime_reais_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Ouvinte de Podcast de True Crime às 3h da Manhã",
    "description": "Conquistar 5 filmes com a tag Crime real e 5 filmes com a tag Fatos Reais (10 filmes).",
    "icon": "🎙️",
    "target_type": "tag_checklist_quota",
    "target_value": 10,
    "target_metadata": {
      "quotas": [
        {
          "tag": "Crime real",
          "count": 5
        },
        {
          "tag": "Fatos Reais",
          "count": 5
        }
      ]
    },
    "sort_order": 132,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_emotional_tragic_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Terapia Pra Quê se Eu Tenho Esse Catálogo?",
    "description": "Conquistar 5 filmes com a tag Emocionante e 5 filmes com a tag Trágico (10 filmes).",
    "icon": "😭",
    "target_type": "tag_checklist_quota",
    "target_value": 10,
    "target_metadata": {
      "quotas": [
        {
          "tag": "Emocionante",
          "count": 5
        },
        {
          "tag": "Trágico",
          "count": 5
        }
      ]
    },
    "sort_order": 133,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_abuse_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Jantar de Família Mais Tranquilo do Ano",
    "description": "Conquistar 5 filmes com a tag Abuso Familiar (5 filmes).",
    "icon": "🍷",
    "target_type": "tag_movie_count",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Abuso Familiar"
      ]
    },
    "sort_order": 134,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_prejudice_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Feridas da Sociedade",
    "description": "Conquistar 5 filmes com a tag Preconceito (5 filmes).",
    "icon": "💔",
    "target_type": "tag_movie_count",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Preconceito"
      ]
    },
    "sort_order": 135,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_vamp_wolf_6",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Team Edward ou Team Jacob?",
    "description": "Conquistar 3 filmes com a tag Vampiro e 3 filmes com a tag Lobisomem (6 filmes).",
    "icon": "🐺",
    "target_type": "tag_checklist_quota",
    "target_value": 6,
    "target_metadata": {
      "quotas": [
        {
          "tag": "Vampiro",
          "count": 3
        },
        {
          "tag": "Lobisomem",
          "count": 3
        }
      ]
    },
    "sort_order": 136,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_demon_relig_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Chama o Padre Que o Bagulho Ficou Doido!",
    "description": "Conquistar 5 filmes com as tags Demônio e Religião ao mesmo tempo (5 filmes).",
    "icon": "⛪",
    "target_type": "tag_double_and",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Demônio",
        "Religião"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 137,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_zombie_dystopia_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Manual de Sobrevivência do Fim do Mundo",
    "description": "Conquistar 5 filmes com as tags Zumbi e Dystopia ao mesmo tempo (5 filmes).",
    "icon": "🧟",
    "target_type": "tag_double_and",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Zumbi",
        "Dystopia"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 138,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_game_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Do Controle do PS5 Direto pra Pipoca",
    "description": "Conquistar 10 filmes com a tag Baseado em jogo (10 filmes).",
    "icon": "🕹️",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Baseado em jogo"
      ]
    },
    "sort_order": 139,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_xmen_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Matrícula Aprovada no Instituto Xavier",
    "description": "Conquistar 5 filmes com a tag X-Men (5 filmes).",
    "icon": "🧬",
    "target_type": "tag_movie_count",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "X-Men"
      ]
    },
    "sort_order": 140,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_villain_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "No Fundo, o Vilão Tinha Razão!",
    "description": "Conquistar 10 filmes com a tag Vilão (10 filmes).",
    "icon": "🦹",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Vilão"
      ]
    },
    "sort_order": 141,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_gore_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Açougueiro de Hollywood (Haja Sangue Falso!)",
    "description": "Conquistar 10 filmes com a tag Gore (10 filmes).",
    "icon": "🪓",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Gore"
      ]
    },
    "sort_order": 142,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_ghost_10",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Quem Você Vai Chamar? (Ghostbusters!)",
    "description": "Conquistar 10 filmes com a tag Fantasma (10 filmes).",
    "icon": "👻",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Fantasma"
      ]
    },
    "sort_order": 143,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_zombie_kr_3",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Trem para Busan!",
    "description": "Conquistar 3 filmes da Coreia do Sul com a tag Zumbi (3 filmes).",
    "icon": "🚆",
    "target_type": "tag_hybrid_country",
    "target_value": 3,
    "target_metadata": {
      "tags": [
        "Zumbi"
      ],
      "countryCode": "kr",
      "countryName": "Coreia do Sul",
      "countryFlag": "🇰🇷",
      "isHybrid": true
    },
    "sort_order": 144,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_ghost_jp_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Sadako Saiu da TV!",
    "description": "Conquistar 5 filmes do Japão com a tag Fantasma (5 filmes).",
    "icon": "📼",
    "target_type": "tag_hybrid_country",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Fantasma"
      ],
      "countryCode": "jp",
      "countryName": "Japão",
      "countryFlag": "🇯🇵",
      "isHybrid": true
    },
    "sort_order": 145,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_bw_fr_3",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Baguete em Preto e Branco (Nouvelle Vague)",
    "description": "Conquistar 3 filmes da França com a tag Preto e branco (3 filmes).",
    "icon": "🥖",
    "target_type": "tag_hybrid_country",
    "target_value": 3,
    "target_metadata": {
      "tags": [
        "Preto e branco"
      ],
      "countryCode": "fr",
      "countryName": "França",
      "countryFlag": "🇫🇷",
      "isHybrid": true
    },
    "sort_order": 146,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_time_epic_5",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Plot Twist que Explodiu Minha Cabeça!",
    "description": "Conquistar 5 filmes com as tags Viagem no Tempo e Final Epico ao mesmo tempo (5 filmes).",
    "icon": "🤯",
    "target_type": "tag_double_and",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Viagem no Tempo",
        "Final Epico"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 147,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_xmas_horror_3",
    "category": "dna_cinefilo",
    "tier": "silver",
    "title": "Natal Sangrento!",
    "description": "Conquistar 3 filmes que tenham a tag Natal combinada com Gore, Demônio, Zumbi ou Vilão no mesmo filme (3 filmes).",
    "icon": "🎅",
    "target_type": "tag_multi_or_and",
    "target_value": 3,
    "target_metadata": {
      "mainTag": "Natal",
      "anyOfTags": [
        "Gore",
        "Demônio",
        "Zumbi",
        "Vilão"
      ],
      "tags": [
        "Natal",
        "Gore/Demônio/Zumbi/Vilão"
      ]
    },
    "sort_order": 148,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_30",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "O Mundo É Colorido",
    "description": "Conquistar 30 filmes com a tag Personagem LGBT (30 filmes).",
    "icon": "🌈",
    "target_type": "tag_movie_count",
    "target_value": 30,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ]
    },
    "sort_order": 149,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_vamp_lgbt_5",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Sim, os Vampiros Gays!",
    "description": "Conquistar 5 filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo (5 filmes).",
    "icon": "🧛‍♂️",
    "target_type": "tag_double_and",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Vampiro",
        "Personagem LGBT"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 150,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_power_lgbt_5",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Mais Forte que um Gaydar!",
    "description": "Conquistar 5 filmes com as tags Super Poder e Personagem LGBT ao mesmo tempo (5 filmes).",
    "icon": "⚡",
    "target_type": "tag_double_and",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Super Poder",
        "Personagem LGBT"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 151,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_facts_br_10",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Fatos Brasileiros",
    "description": "Conquistar 10 filmes do Brasil com a tag Fatos Reais (10 filmes).",
    "icon": "🇧🇷",
    "target_type": "tag_hybrid_country",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Fatos Reais"
      ],
      "countryCode": "br",
      "countryName": "Brasil",
      "countryFlag": "🇧🇷",
      "isHybrid": true
    },
    "sort_order": 152,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_game_anime_25",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "8 ou 80",
    "description": "Conquistar 25 filmes somados com a tag Baseado em jogo ou Baseado em Anime (25 filmes).",
    "icon": "🎲",
    "target_type": "tag_pool_sum",
    "target_value": 25,
    "target_metadata": {
      "tags": [
        "Baseado em jogo",
        "Baseado em Anime"
      ],
      "tagMode": "double_or"
    },
    "sort_order": 153,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_sk_10",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "O Iluminado do Stephen King",
    "description": "Conquistar 10 filmes com a tag SK (Stephen King) (10 filmes).",
    "icon": "🪓",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "SK"
      ]
    },
    "sort_order": 154,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_top250_20",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Frequentador do Tapete Vermelho",
    "description": "Conquistar 20 filmes com a tag TOP250 (20 filmes).",
    "icon": "🏆",
    "target_type": "tag_movie_count",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "TOP250"
      ]
    },
    "sort_order": 155,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_invocaversus_10",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Exorcista Oficial do \"Invocaversus\"",
    "description": "Conquistar 10 filmes com a tag \"invocaversus\" (10 filmes).",
    "icon": "✝️",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "invocaversus"
      ]
    },
    "sort_order": 156,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_supernatural_bestiary_12",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Chama os Irmãos Winchester! (Bestiário Sobrenatural)",
    "description": "Conquistar pelo menos 2 filmes de cada criatura: Bruxo, Fantasma, Demônio, Vampiro, Lobisomem e Zumbi (12 filmes).",
    "icon": "🔫",
    "target_type": "tag_checklist_quota",
    "target_value": 12,
    "target_metadata": {
      "quotas": [
        {
          "tag": "Bruxo",
          "count": 2
        },
        {
          "tag": "Fantasma",
          "count": 2
        },
        {
          "tag": "Demônio",
          "count": 2
        },
        {
          "tag": "Vampiro",
          "count": 2
        },
        {
          "tag": "Lobisomem",
          "count": 2
        },
        {
          "tag": "Zumbi",
          "count": 2
        }
      ],
      "tags": [
        "Bruxo",
        "Fantasma",
        "Demônio",
        "Vampiro",
        "Lobisomem",
        "Zumbi"
      ]
    },
    "sort_order": 157,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_marvel_dc_30",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Guerra Civil dos Quadrinhos (Sem Clubismo!)",
    "description": "Conquistar 15 filmes com a tag Marvel e 15 filmes com a tag DC (30 filmes).",
    "icon": "⚔️",
    "target_type": "tag_checklist_quota",
    "target_value": 30,
    "target_metadata": {
      "quotas": [
        {
          "tag": "Marvel",
          "count": 15
        },
        {
          "tag": "DC",
          "count": 15
        }
      ],
      "tags": [
        "Marvel",
        "DC"
      ]
    },
    "sort_order": 158,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_epic_final_25",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "De Pé no Sofá Aplaudindo os Créditos!",
    "description": "Conquistar 25 filmes com a tag Final Epico (25 filmes).",
    "icon": "👏",
    "target_type": "tag_movie_count",
    "target_value": 25,
    "target_metadata": {
      "tags": [
        "Final Epico"
      ]
    },
    "sort_order": 159,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_repeat_15",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Síndrome da Sessão da Tarde (Já Sei as Falas de Cor)",
    "description": "Conquistar 15 filmes com a tag Repetido (15 filmes).",
    "icon": "📺",
    "target_type": "tag_movie_count",
    "target_value": 15,
    "target_metadata": {
      "tags": [
        "Repetido"
      ]
    },
    "sort_order": 160,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_cult_classic_13",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Cinéfilo Cult de Boina e Cachimbo",
    "description": "Conquistar 10 filmes com a tag Preto e branco e 3 filmes com a tag Mudo (13 filmes).",
    "icon": "🎩",
    "target_type": "tag_checklist_quota",
    "target_value": 13,
    "target_metadata": {
      "quotas": [
        {
          "tag": "Preto e branco",
          "count": 10
        },
        {
          "tag": "Mudo",
          "count": 3
        }
      ],
      "tags": [
        "Preto e branco",
        "Mudo"
      ]
    },
    "sort_order": 161,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_facts_supernatural_5",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Baseado em Fatos... Sobrenaturais?!",
    "description": "Conquistar 5 filmes que tenham a tag Fatos Reais combinada com Fantasma, Demônio ou Aliens no mesmo filme (5 filmes).",
    "icon": "🔮",
    "target_type": "tag_multi_or_and",
    "target_value": 5,
    "target_metadata": {
      "mainTag": "Fatos Reais",
      "anyOfTags": [
        "Fantasma",
        "Demônio",
        "Aliens"
      ],
      "tags": [
        "Fatos Reais",
        "Fantasma/Demônio/Aliens"
      ]
    },
    "sort_order": 162,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_cry_epic_10",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Chorei Horrores, Mas Valeu Cada Segundo!",
    "description": "Conquistar 10 filmes que tenham Emocionante ou Trágico combinado com Final Epico no mesmo filme (10 filmes).",
    "icon": "🥺",
    "target_type": "tag_multi_or_and",
    "target_value": 10,
    "target_metadata": {
      "mainTag": "Final Epico",
      "anyOfTags": [
        "Emocionante",
        "Trágico"
      ],
      "tags": [
        "Emocionante/Trágico",
        "Final Epico"
      ]
    },
    "sort_order": 163,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_prejudice_10",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Amor Contra o Preconceito",
    "description": "Conquistar 10 filmes com as tags Personagem LGBT e Preconceito ao mesmo tempo (10 filmes).",
    "icon": "✊",
    "target_type": "tag_double_and",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Personagem LGBT",
        "Preconceito"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 164,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_vatican_demon_3",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "O Exorcista do Vaticano!",
    "description": "Conquistar 3 filmes da Itália ou Cidade do Vaticano com as tags Demônio e Religião (3 filmes).",
    "icon": "🇻🇦",
    "target_type": "tag_hybrid_multi_country",
    "target_value": 3,
    "target_metadata": {
      "tags": [
        "Demônio",
        "Religião"
      ],
      "countryCodes": [
        "it",
        "va"
      ],
      "countryName": "Itália / Vaticano",
      "countryFlag": "🇻🇦",
      "isHybrid": true
    },
    "sort_order": 165,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_power_multiverse_10",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Crise nos Infinitos Multiversos",
    "description": "Conquistar 10 filmes com as tags Super Poder e Multiverso ao mesmo tempo (10 filmes).",
    "icon": "🌀",
    "target_type": "tag_double_and",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Super Poder",
        "Multiverso"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 166,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_crime_br_10",
    "category": "dna_cinefilo",
    "tier": "epic",
    "title": "Retrato da Realidade Brasileira",
    "description": "Conquistar 10 filmes do Brasil com a tag Crime real (10 filmes).",
    "icon": "🚓",
    "target_type": "tag_hybrid_country",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Crime real"
      ],
      "countryCode": "br",
      "countryName": "Brasil",
      "countryFlag": "🇧🇷",
      "isHybrid": true
    },
    "sort_order": 167,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_50",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Você É Livre!",
    "description": "Conquistar 50 filmes com a tag Personagem LGBT (50 filmes).",
    "icon": "🕊️",
    "target_type": "tag_movie_count",
    "target_value": 50,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ]
    },
    "sort_order": 168,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_vamp_lgbt_10",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Não Existe Vampiro Hétero?",
    "description": "Conquistar 10 filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo (10 filmes).",
    "icon": "🍷",
    "target_type": "tag_double_and",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Vampiro",
        "Personagem LGBT"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 169,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_power_100",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Todo Mundo Tem Poder?",
    "description": "Conquistar 100 filmes com a tag Super Poder (100 filmes).",
    "icon": "💥",
    "target_type": "tag_movie_count",
    "target_value": 100,
    "target_metadata": {
      "tags": [
        "Super Poder"
      ]
    },
    "sort_order": 170,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_power_non_us_20",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Não É Só os EUA que Tem Super-Herói!",
    "description": "Conquistar 20 filmes com a tag Super Poder que NÃO foram produzidos nos Estados Unidos (20 filmes).",
    "icon": "🛡️",
    "target_type": "tag_hybrid_exclude_country",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Super Poder"
      ],
      "excludeCountryCode": "us",
      "countryName": "Fora dos EUA",
      "countryFlag": "🌐",
      "isHybrid": true
    },
    "sort_order": 171,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_kid_school_30",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Ainda Bem que Não Sou Professor Deles!",
    "description": "Conquistar 30 filmes com as tags Criança Malvada e Colegio/Escola ao mesmo tempo (30 filmes).",
    "icon": "🎒",
    "target_type": "tag_double_and",
    "target_value": 30,
    "target_metadata": {
      "tags": [
        "Criança Malvada",
        "Colegio/Escola"
      ],
      "tagMode": "double_and"
    },
    "sort_order": 172,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_sk_18",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "A Torre Negra de Stephen King",
    "description": "Conquistar 18 filmes com a tag SK (Stephen King) (18 filmes).",
    "icon": "🗼",
    "target_type": "tag_movie_count",
    "target_value": 18,
    "target_metadata": {
      "tags": [
        "SK"
      ]
    },
    "sort_order": 173,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_top250_35",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Elite do IMDb",
    "description": "Conquistar 35 filmes com a tag TOP250 (35 filmes).",
    "icon": "🌟",
    "target_type": "tag_movie_count",
    "target_value": 35,
    "target_metadata": {
      "tags": [
        "TOP250"
      ]
    },
    "sort_order": 174,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_horror_master_60",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Senhor das Trevas (Mestre do Terror)",
    "description": "Conquistar 60 filmes somados entre as tags \"invocaversus\", Bruxo, Criança Malvada, Demônio, Fantasma, Gore, Lobisomem, SK, Vampiro e Zumbi (60 filmes).",
    "icon": "💀",
    "target_type": "tag_pool_sum",
    "target_value": 60,
    "target_metadata": {
      "tags": [
        "invocaversus",
        "Bruxo",
        "Criança Malvada",
        "Demônio",
        "Fantasma",
        "Gore",
        "Lobisomem",
        "SK",
        "Vampiro",
        "Zumbi"
      ]
    },
    "sort_order": 175,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_geek_master_60",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Rei da Comic-Con (Mestre Geek & Sci-Fi)",
    "description": "Conquistar 60 filmes somados entre as tags Aliens, Baseado em Anime, Baseado em jogo, DC, Dystopia, Marvel, Multiverso, Super Poder, Viagem no Tempo e X-Men (60 filmes).",
    "icon": "🚀",
    "target_type": "tag_pool_sum",
    "target_value": 60,
    "target_metadata": {
      "tags": [
        "Aliens",
        "Baseado em Anime",
        "Baseado em jogo",
        "DC",
        "Dystopia",
        "Marvel",
        "Multiverso",
        "Super Poder",
        "Viagem no Tempo",
        "X-Men"
      ]
    },
    "sort_order": 176,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_asian_horror_15",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Terror Asiático Não Perdoa!",
    "description": "Conquistar 15 filmes de terror (Fantasma, Demônio, Gore ou Zumbi) produzidos no Japão, Coreia do Sul, Tailândia ou Indonésia (15 filmes).",
    "icon": "👺",
    "target_type": "tag_hybrid_asian_horror",
    "target_value": 15,
    "target_metadata": {
      "tags": [
        "Fantasma/Demônio/Gore/Zumbi"
      ],
      "horrorTags": [
        "Fantasma",
        "Demônio",
        "Gore",
        "Zumbi"
      ],
      "countryCodes": [
        "jp",
        "kr",
        "th",
        "id"
      ],
      "countryName": "Ásia (Japão, Coreia, Tailândia, Indonésia)",
      "countryFlag": "⛩️",
      "isHybrid": true
    },
    "sort_order": 177,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_bingo_all_39",
    "category": "dna_cinefilo",
    "tier": "gold",
    "title": "Bingo Completo das Tags!",
    "description": "Conquistar pelo menos 1 filme em CADA UMA das 39 tags cadastradas no sistema (39 tags).",
    "icon": "🎯",
    "target_type": "tag_all_39_coverage",
    "target_value": 39,
    "target_metadata": {
      "minPerTag": 1,
      "tags": [
        "Todas as 39 Tags"
      ]
    },
    "sort_order": 178,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_75",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Todas as Letras!",
    "description": "Conquistar 75 filmes com a tag Personagem LGBT (75 filmes).",
    "icon": "🦄",
    "target_type": "tag_movie_count",
    "target_value": 75,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ]
    },
    "sort_order": 179,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_gore_br_15",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "A Nossa Bandeira Vai Ser Vermelha!!",
    "description": "Conquistar 15 filmes do Brasil com a tag Gore (15 filmes).",
    "icon": "🩸",
    "target_type": "tag_hybrid_country",
    "target_value": 15,
    "target_metadata": {
      "tags": [
        "Gore"
      ],
      "countryCode": "br",
      "countryName": "Brasil",
      "countryFlag": "🇧🇷",
      "isHybrid": true
    },
    "sort_order": 180,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_br_20",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Brasil Colorido",
    "description": "Conquistar 20 filmes do Brasil com a tag Personagem LGBT (20 filmes).",
    "icon": "🦜",
    "target_type": "tag_hybrid_country",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ],
      "countryCode": "br",
      "countryName": "Brasil",
      "countryFlag": "🇧🇷",
      "isHybrid": true
    },
    "sort_order": 181,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_kid_us_30",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Manual de Como Não se Criar uma Criança",
    "description": "Conquistar 30 filmes dos Estados Unidos com a tag Criança Malvada (30 filmes).",
    "icon": "👿",
    "target_type": "tag_hybrid_country",
    "target_value": 30,
    "target_metadata": {
      "tags": [
        "Criança Malvada"
      ],
      "countryCode": "us",
      "countryName": "Estados Unidos",
      "countryFlag": "🇺🇸",
      "isHybrid": true
    },
    "sort_order": 182,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_lgbt_africa_20",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Coragem!!!",
    "description": "Conquistar 20 filmes produzidos em países da África com a tag Personagem LGBT (20 filmes).",
    "icon": "🦁",
    "target_type": "tag_hybrid_continent",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ],
      "continent": "África",
      "countryName": "África",
      "countryFlag": "🌍",
      "isHybrid": true
    },
    "sort_order": 183,
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_sk_25",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Biógrafo Oficial do Stephen King",
    "description": "Conquistar 25 filmes com a tag SK (Stephen King) (25 filmes).",
    "icon": "👑",
    "target_type": "tag_movie_count",
    "target_value": 25,
    "target_metadata": {
      "tags": [
        "SK"
      ]
    },
    "sort_order": 184,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_top250_50",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Panteão do IMDb (Top 250)",
    "description": "Conquistar 50 filmes com a tag TOP250 (50 filmes).",
    "icon": "🏛️",
    "target_type": "tag_movie_count",
    "target_value": 50,
    "target_metadata": {
      "tags": [
        "TOP250"
      ]
    },
    "sort_order": 185,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_epic_final_75",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Só Assisto Obras-Primas!",
    "description": "Conquistar 75 filmes com a tag Final Epico (75 filmes).",
    "icon": "🏆",
    "target_type": "tag_movie_count",
    "target_value": 75,
    "target_metadata": {
      "tags": [
        "Final Epico"
      ]
    },
    "sort_order": 186,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_veteran_all_39",
    "category": "dna_cinefilo",
    "tier": "mythic",
    "title": "Veterano de Todas as Tribos",
    "description": "Conquistar pelo menos 5 filmes em CADA UMA das 39 tags do catálogo (39 tags com 5 filmes cada).",
    "icon": "🎖️",
    "target_type": "tag_all_39_coverage",
    "target_value": 39,
    "target_metadata": {
      "minPerTag": 5,
      "tags": [
        "Todas as 39 Tags"
      ]
    },
    "sort_order": 187,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "dna_platinum_master",
    "category": "dna_cinefilo",
    "tier": "platinum",
    "title": "O Arquivista Supremo das Tags",
    "description": "Conquistar TODOS os troféus da categoria DNA Cinéfilo (desbloqueio dinâmico automático ao atingir 100% dos outros 119 troféus desta categoria, incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 119,
    "target_metadata": {
      "category": "dna_cinefilo",
      "categoryScope": "dna_cinefilo"
    },
    "sort_order": 188,
    "categories": [
      "dna_cinefilo"
    ]
  },
  {
    "id": "ac_curta_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Acabou Antes da Pipoca Esfriar!",
    "description": "Conquistar 1 filme do gênero Curta (1 filme).",
    "icon": "⏱️",
    "target_type": "genre_count",
    "target_value": 1,
    "target_metadata": {
      "genre": "Curta"
    },
    "sort_order": 201
  },
  {
    "id": "ac_faroeste_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Esta Cidade É Pequena Demais para Nós Dois",
    "description": "Conquistar 1 filme do gênero Faroeste (1 filme).",
    "icon": "🤠",
    "target_type": "genre_count",
    "target_value": 1,
    "target_metadata": {
      "genre": "Faroeste"
    },
    "sort_order": 202
  },
  {
    "id": "ac_doc_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Juro que É Tudo Verdade!",
    "description": "Conquistar 1 filme do gênero Documentário (1 filme).",
    "icon": "📹",
    "target_type": "genre_count",
    "target_value": 1,
    "target_metadata": {
      "genre": "Documentário"
    },
    "sort_order": 203
  },
  {
    "id": "ac_musica_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Do Nada Todo Mundo Começou a Cantar?!",
    "description": "Conquistar 1 filme do gênero Música (1 filme).",
    "icon": "🎵",
    "target_type": "genre_count",
    "target_value": 1,
    "target_metadata": {
      "genre": "Música"
    },
    "sort_order": 204
  },
  {
    "id": "ac_animacao_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: É Desenho, Mas Não É Só pra Criança!",
    "description": "Conquistar 1 filme do gênero Animação (1 filme).",
    "icon": "🎨",
    "target_type": "genre_count",
    "target_value": 1,
    "target_metadata": {
      "genre": "Animação"
    },
    "sort_order": 205
  },
  {
    "id": "ac_acao_aventura_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Dupla Dinâmica de Sessão da Tarde",
    "description": "Conquistar 1 filme que tenha os gêneros Ação e Aventura ao mesmo tempo (1 filme).",
    "icon": "💥",
    "target_type": "genre_all_and",
    "target_value": 1,
    "target_metadata": {
      "genres": [
        "Ação",
        "Aventura"
      ]
    },
    "sort_order": 206
  },
  {
    "id": "ac_comedia_romance_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Suspiros e Risadas",
    "description": "Conquistar 1 filme que tenha os gêneros Comédia e Romance ao mesmo tempo (1 filme).",
    "icon": "💌",
    "target_type": "genre_all_and",
    "target_value": 1,
    "target_metadata": {
      "genres": [
        "Comédia",
        "Romance"
      ]
    },
    "sort_order": 207
  },
  {
    "id": "ac_crime_policial_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Sirene Ligada e Algema na Mão",
    "description": "Conquistar 1 filme que tenha os gêneros Crime e Policial ao mesmo tempo (1 filme).",
    "icon": "🚨",
    "target_type": "genre_all_and",
    "target_value": 1,
    "target_metadata": {
      "genres": [
        "Crime",
        "Policial"
      ]
    },
    "sort_order": 208
  },
  {
    "id": "ac_misterio_suspense_1",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "bronze",
    "title": "Anatomia do Cinema: Foi o Mordomo na Biblioteca!",
    "description": "Conquistar 1 filme que tenha os gêneros Mistério e Suspense ao mesmo tempo (1 filme).",
    "icon": "🔍",
    "target_type": "genre_all_and",
    "target_value": 1,
    "target_metadata": {
      "genres": [
        "Mistério",
        "Suspense"
      ]
    },
    "sort_order": 209
  },
  {
    "id": "ac_terrir_5",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Rindo de Nervoso! (O Famoso \"Terrir\")",
    "description": "Conquistar 5 filmes que tenham os gêneros Terror e Comédia ao mesmo tempo (5 filmes).",
    "icon": "👻",
    "target_type": "genre_all_and",
    "target_value": 5,
    "target_metadata": {
      "genres": [
        "Terror",
        "Comédia"
      ]
    },
    "sort_order": 210
  },
  {
    "id": "ac_ficcao_terror_5",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: No Espaço Ninguém Pode Ouvir Você Gritar",
    "description": "Conquistar 5 filmes que tenham os gêneros Ficção Científica e Terror ao mesmo tempo (5 filmes).",
    "icon": "🚀",
    "target_type": "genre_all_and",
    "target_value": 5,
    "target_metadata": {
      "genres": [
        "Ficção Científica",
        "Terror"
      ]
    },
    "sort_order": 211
  },
  {
    "id": "ac_bio_historia_10",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Já Posso Passar no ENEM Sem Estudar!",
    "description": "Conquistar 10 filmes que tenham os gêneros Biografia e História ao mesmo tempo (10 filmes).",
    "icon": "📚",
    "target_type": "genre_all_and",
    "target_value": 10,
    "target_metadata": {
      "genres": [
        "Biografia",
        "História"
      ]
    },
    "sort_order": 212
  },
  {
    "id": "ac_guerra_drama_10",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Soldado Ferido e Oscar Garantido",
    "description": "Conquistar 10 filmes que tenham os gêneros Guerra e Drama ao mesmo tempo (10 filmes).",
    "icon": "🎖️",
    "target_type": "genre_all_and",
    "target_value": 10,
    "target_metadata": {
      "genres": [
        "Guerra",
        "Drama"
      ]
    },
    "sort_order": 213
  },
  {
    "id": "ac_drama_romance_15",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Haja Lenço de Papel!",
    "description": "Conquistar 15 filmes que tenham os gêneros Drama e Romance ao mesmo tempo (15 filmes).",
    "icon": "😭",
    "target_type": "genre_all_and",
    "target_value": 15,
    "target_metadata": {
      "genres": [
        "Drama",
        "Romance"
      ]
    },
    "sort_order": 214
  },
  {
    "id": "ac_animacao_familia_15",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Domingo de Manhã no Sofá",
    "description": "Conquistar 15 filmes que tenham os gêneros Animação e Família ao mesmo tempo (15 filmes).",
    "icon": "🛋️",
    "target_type": "genre_all_and",
    "target_value": 15,
    "target_metadata": {
      "genres": [
        "Animação",
        "Família"
      ]
    },
    "sort_order": 215
  },
  {
    "id": "ac_fantasia_aventura_15",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: A Sociedade do Anel Aprova",
    "description": "Conquistar 15 filmes que tenham os gêneros Fantasia e Aventura ao mesmo tempo (15 filmes).",
    "icon": "🧙‍♂️",
    "target_type": "genre_all_and",
    "target_value": 15,
    "target_metadata": {
      "genres": [
        "Fantasia",
        "Aventura"
      ]
    },
    "sort_order": 216
  },
  {
    "id": "ac_curta_10",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Maratona Rápida no Horário de Almoço",
    "description": "Conquistar 10 filmes do gênero Curta (10 filmes).",
    "icon": "⚡",
    "target_type": "genre_count",
    "target_value": 10,
    "target_metadata": {
      "genre": "Curta"
    },
    "sort_order": 217
  },
  {
    "id": "ac_faroeste_10",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Gatilho Mais Rápido do Oeste",
    "description": "Conquistar 10 filmes do gênero Faroeste (10 filmes).",
    "icon": "🐎",
    "target_type": "genre_count",
    "target_value": 10,
    "target_metadata": {
      "genre": "Faroeste"
    },
    "sort_order": 218
  },
  {
    "id": "ac_policial_misterio_20",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Detetive Particular",
    "description": "Conquistar 20 filmes que tenham os gêneros Policial e Mistério ao mesmo tempo (20 filmes).",
    "icon": "🕵️‍♂️",
    "target_type": "genre_all_and",
    "target_value": 20,
    "target_metadata": {
      "genres": [
        "Policial",
        "Mistério"
      ]
    },
    "sort_order": 219
  },
  {
    "id": "ac_animacao_adulta_3",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Coloquei pro Meu Sobrinho Achando que Era Infantil!",
    "description": "Conquistar 3 filmes que combinem o gênero Animação com Terror, Crime ou Guerra no mesmo filme (3 filmes).",
    "icon": "🔞",
    "target_type": "genre_and_or",
    "target_value": 3,
    "target_metadata": {
      "mainGenre": "Animação",
      "anyOfGenres": [
        "Terror",
        "Crime",
        "Guerra"
      ]
    },
    "sort_order": 220
  },
  {
    "id": "ac_faroeste_weird_2",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Caubóis Contra Aliens (ou Fantasmas)?!",
    "description": "Conquistar 2 filmes que combinem o gênero Faroeste com Ficção Científica, Fantasia ou Terror no mesmo filme (2 filmes).",
    "icon": "👽",
    "target_type": "genre_and_or",
    "target_value": 2,
    "target_metadata": {
      "mainGenre": "Faroeste",
      "anyOfGenres": [
        "Ficção Científica",
        "Fantasia",
        "Terror"
      ]
    },
    "sort_order": 221
  },
  {
    "id": "ac_guerra_comedia_3",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Rindo no Meio do Bombardeio",
    "description": "Conquistar 3 filmes que tenham os gêneros Guerra e Comédia ao mesmo tempo (3 filmes).",
    "icon": "💣",
    "target_type": "genre_all_and",
    "target_value": 3,
    "target_metadata": {
      "genres": [
        "Guerra",
        "Comédia"
      ]
    },
    "sort_order": 222
  },
  {
    "id": "ac_familia_spooky_5",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Assustando a Família Inteira!",
    "description": "Conquistar 5 filmes que tenham o gênero Família combinado com Terror ou Mistério no mesmo filme (5 filmes).",
    "icon": "🎃",
    "target_type": "genre_and_or",
    "target_value": 5,
    "target_metadata": {
      "mainGenre": "Família",
      "anyOfGenres": [
        "Terror",
        "Mistério"
      ]
    },
    "sort_order": 223
  },
  {
    "id": "ac_doc_crime_10",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Investigador de Sofá (True Crime Doc)",
    "description": "Conquistar 10 filmes que tenham o gênero Documentário combinado com Crime ou Policial no mesmo filme (10 filmes).",
    "icon": "🔎",
    "target_type": "genre_and_or",
    "target_value": 10,
    "target_metadata": {
      "mainGenre": "Documentário",
      "anyOfGenres": [
        "Crime",
        "Policial"
      ]
    },
    "sort_order": 224
  },
  {
    "id": "ac_bio_musica_10",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Cinebiografia de Rockstar!",
    "description": "Conquistar 10 filmes que tenham os gêneros Biografia e Música ao mesmo tempo (10 filmes).",
    "icon": "🎸",
    "target_type": "genre_all_and",
    "target_value": 10,
    "target_metadata": {
      "genres": [
        "Biografia",
        "Música"
      ]
    },
    "sort_order": 225
  },
  {
    "id": "ac_misterio_suspense_terror_10",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Tríade do Infarto (Dormir de Luz Acesa)",
    "description": "Conquistar 10 filmes que tenham os 3 gêneros juntos: Mistério + Suspense + Terror (10 filmes).",
    "icon": "💡",
    "target_type": "genre_all_and",
    "target_value": 10,
    "target_metadata": {
      "genres": [
        "Mistério",
        "Suspense",
        "Terror"
      ]
    },
    "sort_order": 226
  },
  {
    "id": "ac_blockbuster_triplo_15",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Blockbuster de Bilhão!",
    "description": "Conquistar 15 filmes que tenham os 3 gêneros juntos: Ação + Aventura + Ficção Científica (15 filmes).",
    "icon": "🪐",
    "target_type": "genre_all_and",
    "target_value": 15,
    "target_metadata": {
      "genres": [
        "Ação",
        "Aventura",
        "Ficção Científica"
      ]
    },
    "sort_order": 227
  },
  {
    "id": "ac_mafia_triplo_15",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Máfia, Corrupção e Julgamento",
    "description": "Conquistar 15 filmes que tenham os 3 gêneros juntos: Crime + Drama + Policial (15 filmes).",
    "icon": "⚖️",
    "target_type": "genre_all_and",
    "target_value": 15,
    "target_metadata": {
      "genres": [
        "Crime",
        "Drama",
        "Policial"
      ]
    },
    "sort_order": 228
  },
  {
    "id": "ac_trincheira_amor_5",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Amor em Tempos de Trincheira",
    "description": "Conquistar 5 filmes que tenham os 3 gêneros juntos: Guerra + Romance + Drama (5 filmes).",
    "icon": "🕊️",
    "target_type": "genre_all_and",
    "target_value": 5,
    "target_metadata": {
      "genres": [
        "Guerra",
        "Romance",
        "Drama"
      ]
    },
    "sort_order": 229
  },
  {
    "id": "ac_bingo_21_generos",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Cardápio Completo (Bingo dos 21 Gêneros)",
    "description": "Conquistar pelo menos 1 filme em CADA UM dos 21 gêneros oficiais (21 gêneros).",
    "icon": "🎰",
    "target_type": "genre_all_21_coverage",
    "target_value": 21,
    "target_metadata": {
      "minPerGenre": 1
    },
    "sort_order": 230
  },
  {
    "id": "ac_quimera_4_generos_15",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Quimera Cinematográfica (4 Gêneros num Filme Só!)",
    "description": "Conquistar 15 filmes que possuam 4 ou mais gêneros oficiais simultaneamente (15 filmes).",
    "icon": "🐉",
    "target_type": "movie_min_genre_count",
    "target_value": 15,
    "target_metadata": {
      "minGenresPerMovie": 4
    },
    "sort_order": 231
  },
  {
    "id": "ac_drama_150",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Haja Terapia! (Rei do Drama)",
    "description": "Conquistar 150 filmes do gênero Drama (150 filmes).",
    "icon": "🎭",
    "target_type": "genre_count",
    "target_value": 150,
    "target_metadata": {
      "genre": "Drama"
    },
    "sort_order": 232
  },
  {
    "id": "ac_terror_suspense_quota_150",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Mestre do Medo e da Tensão",
    "description": "Conquistar 75 filmes de Terror e 75 filmes de Suspense (150 filmes).",
    "icon": "🩸",
    "target_type": "genre_quotas",
    "target_value": 150,
    "target_metadata": {
      "quotas": [
        {
          "genre": "Terror",
          "count": 75
        },
        {
          "genre": "Suspense",
          "count": 75
        }
      ]
    },
    "sort_order": 233
  },
  {
    "id": "ac_acao_aventura_quota_150",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Viciado em Adrenalina",
    "description": "Conquistar 75 filmes de Ação e 75 filmes de Aventura (150 filmes).",
    "icon": "🏎️",
    "target_type": "genre_quotas",
    "target_value": 150,
    "target_metadata": {
      "quotas": [
        {
          "genre": "Ação",
          "count": 75
        },
        {
          "genre": "Aventura",
          "count": 75
        }
      ]
    },
    "sort_order": 234
  },
  {
    "id": "ac_comedia_100",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Rir É o Melhor Remédio",
    "description": "Conquistar 100 filmes do gênero Comédia (100 filmes).",
    "icon": "😂",
    "target_type": "genre_count",
    "target_value": 100,
    "target_metadata": {
      "genre": "Comédia"
    },
    "sort_order": 235
  },
  {
    "id": "ac_doc_bio_hist_quota_75",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Professor de História e Atualidades",
    "description": "Conquistar 25 filmes de Documentário, 25 de Biografia e 25 de História (75 filmes).",
    "icon": "🏛️",
    "target_type": "genre_quotas",
    "target_value": 75,
    "target_metadata": {
      "quotas": [
        {
          "genre": "Documentário",
          "count": 25
        },
        {
          "genre": "Biografia",
          "count": 25
        },
        {
          "genre": "História",
          "count": 25
        }
      ]
    },
    "sort_order": 236
  },
  {
    "id": "ac_crise_5_generos_5",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Crise de Identidade Severa (5 Gêneros no Mesmo Filme!)",
    "description": "Conquistar 5 filmes que tenham 5 ou mais gêneros oficiais ao mesmo tempo (5 filmes).",
    "icon": "🤯",
    "target_type": "movie_min_genre_count",
    "target_value": 5,
    "target_metadata": {
      "minGenresPerMovie": 5
    },
    "sort_order": 237
  },
  {
    "id": "ac_onivoro_21_x_5",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Onívoro Cinematográfico",
    "description": "Conquistar pelo menos 5 filmes em CADA UM dos 21 gêneros oficiais (21 gêneros com 5 filmes cada).",
    "icon": "🌐",
    "target_type": "genre_all_21_coverage",
    "target_value": 21,
    "target_metadata": {
      "minPerGenre": 5
    },
    "sort_order": 238
  },
  {
    "id": "ac_locadora_15_generos_25",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Dono da Videolocadora",
    "description": "Conquistar pelo menos 25 filmes em 15 gêneros oficiais diferentes (15 gêneros).",
    "icon": "📼",
    "target_type": "genre_distinct_threshold",
    "target_value": 15,
    "target_metadata": {
      "minPerGenre": 25,
      "requiredDistinctGenres": 15
    },
    "sort_order": 239
  },
  {
    "id": "ac_trindade_drama_comedia_terror_440",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Trindade Sagrada do Cinema",
    "description": "Conquistar 200 filmes de Drama, 120 de Comédia e 120 de Terror (440 filmes).",
    "icon": "🔱",
    "target_type": "genre_quotas",
    "target_value": 440,
    "target_metadata": {
      "quotas": [
        {
          "genre": "Drama",
          "count": 200
        },
        {
          "genre": "Comédia",
          "count": 120
        },
        {
          "genre": "Terror",
          "count": 120
        }
      ]
    },
    "sort_order": 240
  },
  {
    "id": "ac_enciclopedia_combos_50",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Enciclopédia Viva dos Combos",
    "description": "Conquistar 50 filmes que tenham pelo menos 3 gêneros oficiais simultâneos (50 filmes).",
    "icon": "📖",
    "target_type": "movie_min_genre_count",
    "target_value": 50,
    "target_metadata": {
      "minGenresPerMovie": 3
    },
    "sort_order": 241
  },
  {
    "id": "ac_platinum_master",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "platinum",
    "title": "Anatomia do Cinema: O Mestre Supremo dos Gêneros",
    "description": "Conquistar TODOS os troféus da categoria Anatomia do Cinema (desbloqueio automático dinâmico ao atingir 100% dos outros 86 troféus desta categoria, incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 86,
    "target_metadata": {
      "category": "anatomia_cinema",
      "categoryScope": "anatomia_cinema"
    },
    "sort_order": 242
  },
  {
    "id": "dl_natal_fora_epoca_3",
    "category": "data_limite",
    "categories": [
      "dna_cinefilo",
      "data_limite"
    ],
    "tier": "bronze",
    "title": "Data Limite: Papai Noel Fora de Época (Natal no Calor?!)",
    "description": "Conquistar 3 filmes com a tag Natal assistidos fora do mês de Dezembro (de Janeiro a Novembro) (3 filmes).",
    "icon": "🏖️",
    "target_type": "tag_month_range",
    "target_value": 3,
    "target_metadata": {
      "tag": "Natal",
      "months": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11
      ]
    },
    "sort_order": 243
  },
  {
    "id": "dl_drama_novembro_10",
    "category": "data_limite",
    "categories": [
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "bronze",
    "title": "Data Limite: Chuva de Novembro (November Rain)",
    "description": "Conquistar 10 filmes do gênero Drama assistidos no mês de Novembro (10 filmes).",
    "icon": "🌧️",
    "target_type": "genre_month",
    "target_value": 10,
    "target_metadata": {
      "genre": "Drama",
      "month": 11
    },
    "sort_order": 244
  },
  {
    "id": "dl_escola_fev_ago_5",
    "category": "data_limite",
    "categories": [
      "dna_cinefilo",
      "data_limite"
    ],
    "tier": "bronze",
    "title": "Data Limite: Volta às Aulas!",
    "description": "Conquistar 5 filmes com a tag Colegio/Escola assistidos no mês de Fevereiro ou Agosto (5 filmes).",
    "icon": "🎒",
    "target_type": "tag_months",
    "target_value": 5,
    "target_metadata": {
      "tag": "Colegio/Escola",
      "months": [
        2,
        8
      ]
    },
    "sort_order": 245
  },
  {
    "id": "dl_fevereiro_geral_15",
    "category": "data_limite",
    "categories": [
      "data_limite"
    ],
    "tier": "bronze",
    "title": "Data Limite: Carnaval no Sofá!",
    "description": "Conquistar 15 filmes assistidos no mês de Fevereiro (15 filmes).",
    "icon": "🎭",
    "target_type": "month_movie_count",
    "target_value": 15,
    "target_metadata": {
      "month": 2
    },
    "sort_order": 246
  },
  {
    "id": "dna_animais_antropo_10",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "silver",
    "title": "DNA Cinéfilo: É um Digimon ou Pokémon?",
    "description": "Conquistar 10 filmes com a tag Animais antropomorficos (10 filmes).",
    "icon": "🦊",
    "target_type": "tag_movie_count",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Animais antropomorficos"
      ]
    },
    "sort_order": 247
  },
  {
    "id": "dl_natal_dezembro_10",
    "category": "data_limite",
    "categories": [
      "dna_cinefilo",
      "data_limite"
    ],
    "tier": "silver",
    "title": "Data Limite: Natal no Natal",
    "description": "Conquistar 10 filmes com a tag Natal assistidos no mês de Dezembro (10 filmes).",
    "icon": "🎄",
    "target_type": "tag_month",
    "target_value": 10,
    "target_metadata": {
      "tag": "Natal",
      "month": 12
    },
    "sort_order": 248
  },
  {
    "id": "dl_romance_junho_10",
    "category": "data_limite",
    "categories": [
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "silver",
    "title": "Data Limite: Dia dos Namorados Brasileiro",
    "description": "Conquistar 10 filmes do gênero Romance assistidos no mês de Junho (10 filmes).",
    "icon": "💖",
    "target_type": "genre_month",
    "target_value": 10,
    "target_metadata": {
      "genre": "Romance",
      "month": 6
    },
    "sort_order": 249
  },
  {
    "id": "dl_romance_fevereiro_10",
    "category": "data_limite",
    "categories": [
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "silver",
    "title": "Data Limite: Valentine's Day Gringo",
    "description": "Conquistar 10 filmes do gênero Romance assistidos no mês de Fevereiro (10 filmes).",
    "icon": "💘",
    "target_type": "genre_month",
    "target_value": 10,
    "target_metadata": {
      "genre": "Romance",
      "month": 2
    },
    "sort_order": 250
  },
  {
    "id": "dl_animacao_familia_julho_10",
    "category": "data_limite",
    "categories": [
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "silver",
    "title": "Data Limite: Férias de Julho com a Criançada",
    "description": "Conquistar 10 filmes do gênero Animação ou Família assistidos no mês de Julho (10 filmes).",
    "icon": "🏖️",
    "target_type": "genre_or_month",
    "target_value": 10,
    "target_metadata": {
      "genres": [
        "Animação",
        "Família"
      ],
      "month": 7
    },
    "sort_order": 251
  },
  {
    "id": "dl_repetido_viagem_janeiro_5",
    "category": "data_limite",
    "categories": [
      "dna_cinefilo",
      "data_limite"
    ],
    "tier": "silver",
    "title": "Data Limite: Ressaca de Ano Novo (Déjà Vu)",
    "description": "Conquistar 5 filmes com a tag Repetido ou Viagem no Tempo assistidos no mês de Janeiro (5 filmes).",
    "icon": "🔄",
    "target_type": "tag_or_month",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Repetido",
        "Viagem no Tempo"
      ],
      "month": 1
    },
    "sort_order": 252
  },
  {
    "id": "dl_todos_12_meses_1",
    "category": "data_limite",
    "categories": [
      "data_limite"
    ],
    "tier": "silver",
    "title": "Data Limite: Cinéfilo de Janeiro a Dezembro",
    "description": "Conquistar pelo menos 1 filme assistido em cada um dos 12 meses do ano (12 meses).",
    "icon": "📆",
    "target_type": "all_12_months_coverage",
    "target_value": 12,
    "target_metadata": {
      "minPerMonth": 1
    },
    "sort_order": 253
  },
  {
    "id": "cross_india_musica_romance_5",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Bollywood em Estado Puro!",
    "description": "Conquistar 5 filmes da Índia que tenham os gêneros Música ou Romance (5 filmes).",
    "icon": "🇮🇳",
    "target_type": "country_genres_or",
    "target_value": 5,
    "target_metadata": {
      "countryCode": "in",
      "countryName": "Índia",
      "genres": [
        "Música",
        "Romance"
      ]
    },
    "sort_order": 254
  },
  {
    "id": "cross_korea_drama_romance_10",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: K-Drama de Respeito",
    "description": "Conquistar 10 filmes da Coreia do Sul que tenham os gêneros Drama e Romance ao mesmo tempo (10 filmes).",
    "icon": "🇰🇷",
    "target_type": "country_genres_and",
    "target_value": 10,
    "target_metadata": {
      "countryCode": "kr",
      "countryName": "Coreia do Sul",
      "genres": [
        "Drama",
        "Romance"
      ]
    },
    "sort_order": 255
  },
  {
    "id": "cross_uk_comedia_10",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Humor Britânico Refinado",
    "description": "Conquistar 10 filmes do gênero Comédia produzidos no Reino Unido (10 filmes).",
    "icon": "🇬🇧",
    "target_type": "country_genre",
    "target_value": 10,
    "target_metadata": {
      "countryCode": "gb",
      "countryName": "Reino Unido",
      "genre": "Comédia"
    },
    "sort_order": 256
  },
  {
    "id": "cross_brasil_musica_5",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "anatomia_cinema"
    ],
    "tier": "silver",
    "title": "Anatomia do Cinema: Samba, Carnaval e Melodia",
    "description": "Conquistar 5 filmes do gênero Música produzidos no Brasil (5 filmes).",
    "icon": "🇧🇷",
    "target_type": "country_genre",
    "target_value": 5,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil",
      "genre": "Música"
    },
    "sort_order": 257
  },
  {
    "id": "dl_terror_outubro_13",
    "category": "data_limite",
    "categories": [
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "epic",
    "title": "Data Limite: Jason Ficaria Orgulhoso!",
    "description": "Conquistar 13 filmes do gênero Terror assistidos no mês de Outubro (13 filmes).",
    "icon": "🔪",
    "target_type": "genre_month",
    "target_value": 13,
    "target_metadata": {
      "genre": "Terror",
      "month": 10
    },
    "sort_order": 258
  },
  {
    "id": "cross_romenia_terror_5",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Volta ao Mundo: Transilvânia É o Seu Reino!",
    "description": "Conquistar 5 filmes do gênero Terror produzidos na Romênia (5 filmes).",
    "icon": "🇷🇴",
    "target_type": "country_genre",
    "target_value": 5,
    "target_metadata": {
      "countryCode": "ro",
      "countryName": "Romênia",
      "genre": "Terror"
    },
    "sort_order": 259
  },
  {
    "id": "cross_italia_faroeste_5",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Volta ao Mundo: Spaghetti Western Legítimo",
    "description": "Conquistar 5 filmes do gênero Faroeste produzidos na Itália (5 filmes).",
    "icon": "🇮🇹",
    "target_type": "country_genre",
    "target_value": 5,
    "target_metadata": {
      "countryCode": "it",
      "countryName": "Itália",
      "genre": "Faroeste"
    },
    "sort_order": 260
  },
  {
    "id": "dl_pride_lgbt_junho_10",
    "category": "data_limite",
    "categories": [
      "dna_cinefilo",
      "data_limite"
    ],
    "tier": "epic",
    "title": "Data Limite: Mês do Orgulho (Pride Month)",
    "description": "Conquistar 10 filmes com a tag Personagem LGBT assistidos no mês de Junho (10 filmes).",
    "icon": "🏳️‍🌈",
    "target_type": "tag_month",
    "target_value": 10,
    "target_metadata": {
      "tag": "Personagem LGBT",
      "month": 6
    },
    "sort_order": 261
  },
  {
    "id": "cross_animacao_antropo_10",
    "category": "anatomia_cinema",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Furry Oficial da Animação!",
    "description": "Conquistar 10 filmes que tenham o gênero Animação e a tag Animais antropomorficos ao mesmo tempo (10 filmes).",
    "icon": "🐾",
    "target_type": "genre_tag_and",
    "target_value": 10,
    "target_metadata": {
      "genre": "Animação",
      "tag": "Animais antropomorficos"
    },
    "sort_order": 262
  },
  {
    "id": "triple_japan_anime_scifi_5",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Akira & Cyberpunk (Combo Triplo)",
    "description": "Conquistar 5 filmes do Japão com os gêneros Animação e Ficção Científica e a tag Baseado em Anime ou Dystopia (5 filmes).",
    "icon": "🏍️",
    "target_type": "triple_combo_japan",
    "target_value": 5,
    "target_metadata": {
      "countryCode": "jp",
      "countryName": "Japão",
      "genres": [
        "Animação",
        "Ficção Científica"
      ],
      "anyOfTags": [
        "Baseado em Anime",
        "Dystopia"
      ]
    },
    "sort_order": 263
  },
  {
    "id": "triple_brasil_crime_real_5",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Investigação Criminal Brasileira (Combo Triplo)",
    "description": "Conquistar 5 filmes do Brasil com o gênero Crime ou Policial e a tag Crime real ou Fatos Reais (5 filmes).",
    "icon": "🇧🇷",
    "target_type": "triple_combo_brasil",
    "target_value": 5,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil",
      "anyOfGenres": [
        "Crime",
        "Policial"
      ],
      "anyOfTags": [
        "Crime real",
        "Fatos Reais"
      ]
    },
    "sort_order": 264
  },
  {
    "id": "triple_europa_terror_demonio_5",
    "category": "anatomia_cinema",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Exorcismo no Velho Continente (Combo Triplo)",
    "description": "Conquistar 5 filmes europeus do gênero Terror com a tag Demônio ou Religião (5 filmes).",
    "icon": "🏰",
    "target_type": "triple_combo_europa",
    "target_value": 5,
    "target_metadata": {
      "continent": "Europa",
      "genre": "Terror",
      "anyOfTags": [
        "Demônio",
        "Religião"
      ]
    },
    "sort_order": 265
  },
  {
    "id": "cross_doc_crime_fatos_5",
    "category": "anatomia_cinema",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Anatomia do Cinema: Documentário de Arrepiar os Cabelos",
    "description": "Conquistar 5 filmes do gênero Documentário com a tag Crime real, Sequestro ou Fatos Reais (5 filmes).",
    "icon": "🕵️",
    "target_type": "genre_tag_or",
    "target_value": 5,
    "target_metadata": {
      "genre": "Documentário",
      "anyOfTags": [
        "Crime real",
        "Sequestro",
        "Fatos Reais"
      ]
    },
    "sort_order": 266
  },
  {
    "id": "dl_terror_outubro_31",
    "category": "data_limite",
    "categories": [
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "gold",
    "title": "Data Limite: Mês das Bruxas Completo (31 Dias de Terror!)",
    "description": "Conquistar 31 filmes do gênero Terror assistidos no mês de Outubro (31 filmes).",
    "icon": "🕯️",
    "target_type": "genre_month",
    "target_value": 31,
    "target_metadata": {
      "genre": "Terror",
      "month": 10
    },
    "sort_order": 267
  },
  {
    "id": "dl_todos_12_meses_15",
    "category": "data_limite",
    "categories": [
      "data_limite"
    ],
    "tier": "gold",
    "title": "Data Limite: Sem Férias para o Controle Remoto",
    "description": "Conquistar pelo menos 15 filmes em cada um dos 12 meses do ano (12 meses com 15 filmes cada).",
    "icon": "🗓️",
    "target_type": "all_12_months_coverage",
    "target_value": 12,
    "target_metadata": {
      "minPerMonth": 15
    },
    "sort_order": 268
  },
  {
    "id": "triple_romenia_dracula_3",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Volta ao Mundo: Conde Drácula em Pessoa! (Combo Triplo)",
    "description": "Conquistar 3 filmes da Romênia do gênero Terror com a tag Vampiro (3 filmes).",
    "icon": "🧛‍♂️",
    "target_type": "triple_combo_romenia_dracula",
    "target_value": 3,
    "target_metadata": {
      "countryCode": "ro",
      "countryName": "Romênia",
      "genre": "Terror",
      "tag": "Vampiro"
    },
    "sort_order": 269
  },
  {
    "id": "quad_natal_classico_5",
    "category": "data_limite",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "gold",
    "title": "Data Limite: Especial de Natal Clássico (Crossover 4 Categorias!)",
    "description": "Conquistar 5 filmes dos EUA, Canadá ou Reino Unido + Gênero Comédia ou Família + Tag Natal + Assistidos no mês de Dezembro (5 filmes).",
    "icon": "🎅",
    "target_type": "quad_natal_classico",
    "target_value": 5,
    "target_metadata": {
      "countryCodes": [
        "us",
        "ca",
        "gb"
      ],
      "anyOfGenres": [
        "Comédia",
        "Família"
      ],
      "tag": "Natal",
      "month": 12
    },
    "sort_order": 270
  },
  {
    "id": "quad_pride_sem_fronteiras_5",
    "category": "data_limite",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "gold",
    "title": "Data Limite: Orgulho Sem Fronteiras em Junho (Crossover 4 Categorias!)",
    "description": "Conquistar 5 filmes fora dos EUA + Gênero Drama ou Romance + Tag Personagem LGBT + Assistidos no mês de Junho (5 filmes).",
    "icon": "🌈",
    "target_type": "quad_pride_sem_fronteiras",
    "target_value": 5,
    "target_metadata": {
      "excludeCountryCode": "us",
      "anyOfGenres": [
        "Drama",
        "Romance"
      ],
      "tag": "Personagem LGBT",
      "month": 6
    },
    "sort_order": 271
  },
  {
    "id": "quad_halloween_eua_10",
    "category": "data_limite",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "mythic",
    "title": "Data Limite: Halloween Clássico Americano (Crossover 4 Categorias!)",
    "description": "Conquistar 10 filmes dos Estados Unidos + Gênero Terror + Tag (Gore, Fantasma, Demônio, Bruxo, Zumbi ou SK) + Assistidos no mês de Outubro (10 filmes).",
    "icon": "🎃",
    "target_type": "quad_halloween_eua",
    "target_value": 10,
    "target_metadata": {
      "countryCode": "us",
      "genre": "Terror",
      "anyOfTags": [
        "Gore",
        "Fantasma",
        "Demônio",
        "Bruxo",
        "Zumbi",
        "SK"
      ],
      "month": 10
    },
    "sort_order": 272
  },
  {
    "id": "quad_outubro_macabro_mundo_10",
    "category": "data_limite",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "mythic",
    "title": "Data Limite: Outubro Macabro pelo Mundo (Crossover 4 Categorias!)",
    "description": "Conquistar 10 filmes produzidos fora dos Estados Unidos + Gênero Terror ou Suspense + Tag (Criança Malvada, Demônio, Fantasma, Gore, Vampiro ou Zumbi) + Assistidos no mês de Outubro (10 filmes).",
    "icon": "🩸",
    "target_type": "quad_outubro_macabro_mundo",
    "target_value": 10,
    "target_metadata": {
      "excludeCountryCode": "us",
      "anyOfGenres": [
        "Terror",
        "Suspense"
      ],
      "anyOfTags": [
        "Criança Malvada",
        "Demônio",
        "Fantasma",
        "Gore",
        "Vampiro",
        "Zumbi"
      ],
      "month": 10
    },
    "sort_order": 273
  },
  {
    "id": "quad_natal_macabro_3",
    "category": "data_limite",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema",
      "data_limite"
    ],
    "tier": "mythic",
    "title": "Data Limite: Natal Macabro no Fim do Ano (Crossover 4 Categorias!)",
    "description": "Conquistar 3 filmes de qualquer país + Gênero Terror ou Suspense + Tag Natal + Assistidos no mês de Dezembro (3 filmes).",
    "icon": "☠️",
    "target_type": "quad_natal_macabro",
    "target_value": 3,
    "target_metadata": {
      "anyOfGenres": [
        "Terror",
        "Suspense"
      ],
      "tag": "Natal",
      "month": 12
    },
    "sort_order": 274
  },
{
  "id": "us_barbenheimer",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Barbenheimer — O Evento do Século!",
  "description": "Conquistar os 2 filmes do fenômeno cultural: Barbie e Oppenheimer (2 filmes).",
  "icon": "💣",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "Barbenheimer",
    "movies": [
      {
        "name": "Barbie (2023)",
        "patterns": [
          "Barbie"
        ],
        "year": 2023
      },
      {
        "name": "Oppenheimer (2023)",
        "patterns": [
          "Oppenheimer"
        ],
        "year": 2023
      }
    ]
  },
  "sort_order": 301
},
{
  "id": "us_let_the_right_one_in",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Sangue Novo na Neve (Deixe Ela Entrar)",
  "description": "Conquistar o original sueco e o remake americano: Deixe Ela Entrar e Deixe-me Entrar (2 filmes).",
  "icon": "❄️",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "Deixe Ela Entrar",
    "movies": [
      {
        "name": "Deixe Ela Entrar (2008)",
        "patterns": [
          "Deixe Ela Entrar",
          "Lat den ratte komma in",
          "Let the Right One In"
        ],
        "year": 2008
      },
      {
        "name": "Deixe-me Entrar (2010)",
        "patterns": [
          "Deixe-me Entrar",
          "Deixe me Entrar",
          "Let Me In"
        ],
        "year": 2010
      }
    ]
  },
  "sort_order": 302
},
{
  "id": "us_shining_sleep",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Bem-vindo ao Hotel Overlook",
  "description": "Conquistar a duologia de terror de Stephen King: O Iluminado e Doutor Sono (2 filmes).",
  "icon": "🪓",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "O Iluminado",
    "movies": [
      {
        "name": "O Iluminado (1980)",
        "patterns": [
          "O Iluminado",
          "The Shining"
        ],
        "year": 1980
      },
      {
        "name": "Doutor Sono (2019)",
        "patterns": [
          "Doutor Sono",
          "Doctor Sleep"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 303
},
{
  "id": "us_sinister",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Fitas Proibidas no Sótão (A Entidade)",
  "description": "Conquistar os 2 filmes da franquia: A Entidade e A Entidade 2 (2 filmes).",
  "icon": "📼",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "A Entidade",
    "movies": [
      {
        "name": "A Entidade (2012)",
        "patterns": [
          "A Entidade",
          "Sinister"
        ],
        "year": 2012,
        "exclude": [
          "2"
        ]
      },
      {
        "name": "A Entidade 2 (2015)",
        "patterns": [
          "A Entidade 2",
          "Sinister 2"
        ],
        "year": 2015
      }
    ]
  },
  "sort_order": 304
},
{
  "id": "us_maleficent",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: A Fada Mais Incompreendida do Reino",
  "description": "Conquistar os 2 filmes da Malévola: Malévola e Malévola: Dona do Mal (2 filmes).",
  "icon": "🧝‍♀️",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "Malévola",
    "movies": [
      {
        "name": "Malévola (2014)",
        "patterns": [
          "Malevola",
          "Maleficent"
        ],
        "year": 2014,
        "exclude": [
          "Dona do Mal",
          "Mistress of Evil",
          "2"
        ]
      },
      {
        "name": "Malévola: Dona do Mal (2019)",
        "patterns": [
          "Malevola Dona do Mal",
          "Dona do Mal",
          "Mistress of Evil"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 305
},
{
  "id": "us_doom",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Rip and Tear! (Doom)",
  "description": "Conquistar as 2 adaptações cinematográficas de Doom: Doom: A Porta do Inferno e Doom: Annihilation (2 filmes).",
  "icon": "🔫",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "Doom",
    "movies": [
      {
        "name": "Doom: A Porta do Inferno (2005)",
        "patterns": [
          "Doom A Porta do Inferno",
          "A Porta do Inferno",
          "Doom"
        ],
        "year": 2005,
        "exclude": [
          "Annihilation"
        ]
      },
      {
        "name": "Doom: Annihilation (2019)",
        "patterns": [
          "Doom Annihilation",
          "Annihilation"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 306
},
{
  "id": "us_spiderverse",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Qualquer Pessoa Pode Usar a Máscara (Aranhaverso)",
  "description": "Conquistar as animações do Aranhaverso: Homem-Aranha no Aranhaverso e Homem-Aranha: Através do Aranhaverso (2 filmes).",
  "icon": "🕷️",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "Aranhaverso",
    "movies": [
      {
        "name": "Homem-Aranha no Aranhaverso (2018)",
        "patterns": [
          "No Aranhaverso",
          "Into the Spider-Verse"
        ],
        "year": 2018
      },
      {
        "name": "Homem-Aranha: Através do Aranhaverso (2023)",
        "patterns": [
          "Atraves do Aranhaverso",
          "Across the Spider-Verse"
        ],
        "year": 2023
      }
    ]
  },
  "sort_order": 307
},
{
  "id": "us_spiderman_andrew",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: O Espetacular Teioso (Era Andrew Garfield)",
  "description": "Conquistar os 2 filmes solo do Homem-Aranha de Andrew Garfield: O Espetacular Homem-Aranha 1 e 2 (2 filmes).",
  "icon": "🕸️",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "O Espetacular Homem-Aranha",
    "movies": [
      {
        "name": "O Espetacular Homem-Aranha (2012)",
        "patterns": [
          "O Espetacular Homem-Aranha",
          "The Amazing Spider-Man"
        ],
        "year": 2012,
        "exclude": [
          "2",
          "Electro"
        ]
      },
      {
        "name": "O Espetacular Homem-Aranha 2: A Ameaça de Electro (2014)",
        "patterns": [
          "O Espetacular Homem-Aranha 2",
          "The Amazing Spider-Man 2",
          "A Ameaca de Electro"
        ],
        "year": 2014
      }
    ]
  },
  "sort_order": 308
},
{
  "id": "us_it_pennywise",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Todos Flutuam Aqui embaixo! (It)",
  "description": "Conquistar as 3 adaptações de Pennywise: It (1990), It: A Coisa (2017) e It: Capítulo Dois (2019) (3 filmes).",
  "icon": "🎈",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "It",
    "movies": [
      {
        "name": "It: Uma Obra-Prima do Medo (1990)",
        "patterns": [
          "Obra-Prima do Medo",
          "It Uma Obra-Prima do Medo",
          "It"
        ],
        "year": 1990,
        "exclude": [
          "Capitulo",
          "Chapter",
          "Coisa"
        ]
      },
      {
        "name": "It: A Coisa (2017)",
        "patterns": [
          "It A Coisa",
          "A Coisa",
          "It Chapter One",
          "It"
        ],
        "year": 2017,
        "exclude": [
          "Capitulo Dois",
          "Chapter Two",
          "1990"
        ]
      },
      {
        "name": "It: Capítulo Dois (2019)",
        "patterns": [
          "It Capitulo Dois",
          "It Chapter Two",
          "Capitulo Dois",
          "Chapter Two"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 309
},
{
  "id": "us_minha_mae_peca",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Dona Hermínia para Sempre!",
  "description": "Conquistar a trilogia completa de Paulo Gustavo: Minha Mãe é uma Peça 1, 2 e 3 (3 filmes).",
  "icon": "👩‍🦱",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Minha Mãe é uma Peça",
    "movies": [
      {
        "name": "Minha Mãe é uma Peça: O Filme (2013)",
        "patterns": [
          "Minha Mae e uma Peca"
        ],
        "year": 2013,
        "exclude": [
          "2",
          "3"
        ]
      },
      {
        "name": "Minha Mãe é uma Peça 2 (2016)",
        "patterns": [
          "Minha Mae e uma Peca 2"
        ],
        "year": 2016
      },
      {
        "name": "Minha Mãe é uma Peça 3 (2019)",
        "patterns": [
          "Minha Mae e uma Peca 3"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 310
},
{
  "id": "us_butterfly_effect",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Mexeu no Passado, Estragou o Presente (Efeito Borboleta)",
  "description": "Conquistar a trilogia completa: Efeito Borboleta 1, 2 e 3 (3 filmes).",
  "icon": "🦋",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Efeito Borboleta",
    "movies": [
      {
        "name": "Efeito Borboleta (2004)",
        "patterns": [
          "Efeito Borboleta",
          "The Butterfly Effect"
        ],
        "year": 2004,
        "exclude": [
          "2",
          "3",
          "Revelacoes",
          "Revelations"
        ]
      },
      {
        "name": "Efeito Borboleta 2 (2006)",
        "patterns": [
          "Efeito Borboleta 2",
          "The Butterfly Effect 2"
        ],
        "year": 2006
      },
      {
        "name": "Efeito Borboleta 3: Revelações (2009)",
        "patterns": [
          "Efeito Borboleta 3",
          "The Butterfly Effect 3",
          "Revelacoes",
          "Revelations"
        ],
        "year": 2009
      }
    ]
  },
  "sort_order": 311
},
{
  "id": "us_batman_nolan",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: A Noite É Mais Escura Antes do Amanhecer (Trilogia Nolan)",
  "description": "Conquistar a trilogia O Cavaleiro das Trevas: Batman Begins, O Cavaleiro das Trevas e O Cavaleiro das Trevas Ressurge (3 filmes).",
  "icon": "🦇",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Batman Trilogia Nolan",
    "movies": [
      {
        "name": "Batman Begins (2005)",
        "patterns": [
          "Batman Begins"
        ],
        "year": 2005
      },
      {
        "name": "Batman: O Cavaleiro das Trevas (2008)",
        "patterns": [
          "Cavaleiro das Trevas",
          "The Dark Knight"
        ],
        "year": 2008,
        "exclude": [
          "Ressurge",
          "Rises"
        ]
      },
      {
        "name": "Batman: O Cavaleiro das Trevas Ressurge (2012)",
        "patterns": [
          "Cavaleiro das Trevas Ressurge",
          "The Dark Knight Rises",
          "Ressurge"
        ],
        "year": 2012
      }
    ]
  },
  "sort_order": 312
},
{
  "id": "us_batman_classic",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Eu Sou a Noite... e os Mamilos na Armadura! (Batman Clássico)",
  "description": "Conquistar os 4 filmes clássicos do Batman (1989–1997): Batman, Batman: O Retorno, Batman Eternamente e Batman & Robin (4 filmes).",
  "icon": "🃏",
  "target_type": "franchise_movie_list",
  "target_value": 4,
  "target_metadata": {
    "franchise": "Batman Clássico",
    "movies": [
      {
        "name": "Batman (1989)",
        "patterns": [
          "Batman"
        ],
        "year": 1989,
        "exclude": [
          "Retorno",
          "Returns",
          "Begins",
          "Forever",
          "Robin",
          "Arkham",
          "Superman",
          "Eternamente"
        ]
      },
      {
        "name": "Batman: O Retorno (1992)",
        "patterns": [
          "Batman O Retorno",
          "Batman Returns",
          "O Retorno"
        ],
        "year": 1992
      },
      {
        "name": "Batman Eternamente (1995)",
        "patterns": [
          "Batman Eternamente",
          "Batman Forever"
        ],
        "year": 1995
      },
      {
        "name": "Batman & Robin (1997)",
        "patterns": [
          "Batman & Robin",
          "Batman e Robin"
        ],
        "year": 1997
      }
    ]
  },
  "sort_order": 313
},
{
  "id": "us_robert_langdon",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Os Segredos do Vaticano e da Arte (Robert Langdon)",
  "description": "Conquistar a trilogia de Dan Brown: O Código Da Vinci, Anjos e Demônios e Inferno (3 filmes).",
  "icon": "🏛️",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Robert Langdon",
    "movies": [
      {
        "name": "O Código Da Vinci (2006)",
        "patterns": [
          "Codigo Da Vinci",
          "Da Vinci Code"
        ],
        "year": 2006
      },
      {
        "name": "Anjos e Demônios (2009)",
        "patterns": [
          "Anjos e Demonios",
          "Angels & Demons",
          "Angels and Demons"
        ],
        "year": 2009
      },
      {
        "name": "Inferno (2016)",
        "patterns": [
          "Inferno"
        ],
        "year": 2016,
        "exclude": [
          "Torre",
          "Verde"
        ]
      }
    ]
  },
  "sort_order": 314
},
{
  "id": "us_eastrail_177",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Deuses e Monstros Entre Nós (Trilogia Eastrail 177)",
  "description": "Conquistar a trilogia de M. Night Shyamalan: Corpo Fechado, Fragmentado e Vidro (3 filmes).",
  "icon": "🔮",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Trilogia Eastrail 177",
    "movies": [
      {
        "name": "Corpo Fechado (2000)",
        "patterns": [
          "Corpo Fechado",
          "Unbreakable"
        ],
        "year": 2000
      },
      {
        "name": "Fragmentado (2016)",
        "patterns": [
          "Fragmentado",
          "Split"
        ],
        "year": 2016
      },
      {
        "name": "Vidro (2019)",
        "patterns": [
          "Vidro",
          "Glass"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 315
},
{
  "id": "us_spiderman_tobey",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Com Grandes Poderes... (Era Tobey Maguire)",
  "description": "Conquistar a trilogia clássica de Sam Raimi: Homem-Aranha 1, 2 e 3 (3 filmes).",
  "icon": "🕷️",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Homem-Aranha Sam Raimi",
    "movies": [
      {
        "name": "Homem-Aranha (2002)",
        "patterns": [
          "Homem-Aranha",
          "Spider-Man"
        ],
        "year": 2002,
        "exclude": [
          "2",
          "3",
          "Espetacular",
          "Amazing",
          "Volta",
          "Casa",
          "Aranhaverso"
        ]
      },
      {
        "name": "Homem-Aranha 2 (2004)",
        "patterns": [
          "Homem-Aranha 2",
          "Spider-Man 2"
        ],
        "year": 2004,
        "exclude": [
          "Espetacular",
          "Amazing",
          "Longe"
        ]
      },
      {
        "name": "Homem-Aranha 3 (2007)",
        "patterns": [
          "Homem-Aranha 3",
          "Spider-Man 3"
        ],
        "year": 2007,
        "exclude": [
          "Sem Volta"
        ]
      }
    ]
  },
  "sort_order": 316
},
{
  "id": "us_spiderman_tom",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: O Amigão da Vizinhança no Multiverso (Era Tom Holland)",
  "description": "Conquistar a quadrilogia do Homem-Aranha de Tom Holland: De Volta ao Lar, Longe de Casa, Sem Volta para Casa e Um Novo Dia (4 filmes).",
  "icon": "🕸️",
  "target_type": "franchise_movie_list",
  "target_value": 4,
  "target_metadata": {
    "franchise": "Homem-Aranha Tom Holland",
    "movies": [
      {
        "name": "Homem-Aranha: De Volta ao Lar (2017)",
        "patterns": [
          "De Volta ao Lar",
          "Homecoming"
        ],
        "year": 2017
      },
      {
        "name": "Homem-Aranha: Longe de Casa (2019)",
        "patterns": [
          "Longe de Casa",
          "Far From Home"
        ],
        "year": 2019
      },
      {
        "name": "Homem-Aranha: Sem Volta para Casa (2021)",
        "patterns": [
          "Sem Volta para Casa",
          "No Way Home"
        ],
        "year": 2021
      },
      {
        "name": "Homem-Aranha: Um Novo Dia (2026)",
        "patterns": [
          "Um Novo Dia",
          "Brand New Day",
          "Homem-Aranha 4",
          "Spider-Man 4"
        ],
        "year": 2026
      }
    ]
  },
  "sort_order": 317
},
{
  "id": "us_venom",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Nós Somos Venom!",
  "description": "Conquistar a trilogia completa do Simbionte: Venom 1, 2 e 3 (3 filmes).",
  "icon": "🖤",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Venom",
    "movies": [
      {
        "name": "Venom (2018)",
        "patterns": [
          "Venom"
        ],
        "year": 2018,
        "exclude": [
          "Carnificina",
          "Carnage",
          "Ultima Rodada",
          "Last Dance",
          "2",
          "3"
        ]
      },
      {
        "name": "Venom: Tempo de Carnificina (2021)",
        "patterns": [
          "Tempo de Carnificina",
          "Let There Be Carnage",
          "Venom 2"
        ],
        "year": 2021
      },
      {
        "name": "Venom: A Última Rodada (2024)",
        "patterns": [
          "A Ultima Rodada",
          "The Last Dance",
          "Venom 3"
        ],
        "year": 2024
      }
    ]
  },
  "sort_order": 318
},
{
  "id": "us_sonic",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Rápido Como uma Esmeralda do Caos! (Sonic)",
  "description": "Conquistar a trilogia do ouriço azul: Sonic 1, 2 e 3 (3 filmes).",
  "icon": "🦔",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Sonic",
    "movies": [
      {
        "name": "Sonic: O Filme (2020)",
        "patterns": [
          "Sonic O Filme",
          "Sonic the Hedgehog"
        ],
        "year": 2020,
        "exclude": [
          "2",
          "3"
        ]
      },
      {
        "name": "Sonic 2: O Filme (2022)",
        "patterns": [
          "Sonic 2",
          "Sonic the Hedgehog 2"
        ],
        "year": 2022
      },
      {
        "name": "Sonic 3: O Filme (2024)",
        "patterns": [
          "Sonic 3",
          "Sonic the Hedgehog 3"
        ],
        "year": 2024
      }
    ]
  },
  "sort_order": 319
},
{
  "id": "us_kung_fu_panda",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: O Dragão Guerreiro de Jade (Kung Fu Panda)",
  "description": "Conquistar os 4 filmes de Po: Kung Fu Panda 1, 2, 3 e 4 (4 filmes).",
  "icon": "🐼",
  "target_type": "franchise_movie_list",
  "target_value": 4,
  "target_metadata": {
    "franchise": "Kung Fu Panda",
    "movies": [
      {
        "name": "Kung Fu Panda (2008)",
        "patterns": [
          "Kung Fu Panda"
        ],
        "year": 2008,
        "exclude": [
          "2",
          "3",
          "4"
        ]
      },
      {
        "name": "Kung Fu Panda 2 (2011)",
        "patterns": [
          "Kung Fu Panda 2"
        ],
        "year": 2011
      },
      {
        "name": "Kung Fu Panda 3 (2016)",
        "patterns": [
          "Kung Fu Panda 3"
        ],
        "year": 2016
      },
      {
        "name": "Kung Fu Panda 4 (2024)",
        "patterns": [
          "Kung Fu Panda 4"
        ],
        "year": 2024
      }
    ]
  },
  "sort_order": 320
},
{
  "id": "us_mogli",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Somente o Necessário! (Mogli: O Menino Lobo)",
  "description": "Conquistar as 4 versões de Mogli nas telas: O Menino Lobo (1967, 2003, 2016) e Entre Dois Mundos (2018) (4 filmes).",
  "icon": "🐻",
  "target_type": "franchise_movie_list",
  "target_value": 4,
  "target_metadata": {
    "franchise": "Mogli",
    "movies": [
      {
        "name": "Mogli: O Menino Lobo (1967)",
        "patterns": [
          "Mogli O Menino Lobo",
          "The Jungle Book",
          "Mogli"
        ],
        "year": 1967
      },
      {
        "name": "Mogli: O Menino Lobo 2 (2003)",
        "patterns": [
          "Mogli O Menino Lobo 2",
          "The Jungle Book 2",
          "Mogli 2"
        ],
        "year": 2003
      },
      {
        "name": "Mogli: O Menino Lobo (2016)",
        "patterns": [
          "Mogli O Menino Lobo",
          "The Jungle Book"
        ],
        "year": 2016
      },
      {
        "name": "Mogli: Entre Dois Mundos (2018)",
        "patterns": [
          "Mogli Entre Dois Mundos",
          "Mowgli Legend of the Jungle",
          "Mowgli"
        ],
        "year": 2018
      }
    ]
  },
  "sort_order": 321
},
{
  "id": "us_star_wars_prequels",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Star Wars — A Queda da República (Prequels)",
  "description": "Conquistar os Episódios I, II e III da saga Star Wars (3 filmes).",
  "icon": "🪐",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Star Wars Prequels",
    "movies": [
      {
        "name": "Star Wars: Episódio I – A Ameaça Fantasma (1999)",
        "patterns": [
          "A Ameaca Fantasma",
          "The Phantom Menace",
          "Episodio I",
          "Episode I"
        ],
        "year": 1999
      },
      {
        "name": "Star Wars: Episódio II – Ataque dos Clones (2002)",
        "patterns": [
          "Ataque dos Clones",
          "Attack of the Clones",
          "Episodio II",
          "Episode II"
        ],
        "year": 2002
      },
      {
        "name": "Star Wars: Episódio III – A Vingança dos Sith (2005)",
        "patterns": [
          "A Vinganca dos Sith",
          "Revenge of the Sith",
          "Episodio III",
          "Episode III"
        ],
        "year": 2005
      }
    ]
  },
  "sort_order": 322
},
{
  "id": "us_star_wars_originals",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Star Wars — Uma Galáxia Muito, Muito Distante (Originais)",
  "description": "Conquistar os Episódios IV, V e VI da saga Star Wars (3 filmes).",
  "icon": "⚔️",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Star Wars Originais",
    "movies": [
      {
        "name": "Star Wars: Episódio IV – Uma Nova Esperança (1977)",
        "patterns": [
          "Uma Nova Esperanca",
          "A New Hope",
          "Episodio IV",
          "Episode IV",
          "Guerra nas Estrelas"
        ],
        "year": 1977
      },
      {
        "name": "Star Wars: Episódio V – O Império Contra-Ataca (1980)",
        "patterns": [
          "O Imperio Contra-Ataca",
          "The Empire Strikes Back",
          "Episodio V",
          "Episode V"
        ],
        "year": 1980
      },
      {
        "name": "Star Wars: Episódio VI – O Retorno de Jedi (1983)",
        "patterns": [
          "O Retorno de Jedi",
          "Return of the Jedi",
          "Episodio VI",
          "Episode VI"
        ],
        "year": 1983
      }
    ]
  },
  "sort_order": 323
},
{
  "id": "us_star_wars_sequels",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "silver",
  "title": "Universos & Sagas: Star Wars — O Despertar da Nova Ordem (Sequels)",
  "description": "Conquistar os Episódios VII, VIII e IX da saga Star Wars (3 filmes).",
  "icon": "🌌",
  "target_type": "franchise_movie_list",
  "target_value": 3,
  "target_metadata": {
    "franchise": "Star Wars Sequels",
    "movies": [
      {
        "name": "Star Wars: Episódio VII – O Despertar da Força (2015)",
        "patterns": [
          "O Despertar da Forca",
          "The Force Awakens",
          "Episodio VII",
          "Episode VII"
        ],
        "year": 2015
      },
      {
        "name": "Star Wars: Episódio VIII – Os Últimos Jedi (2017)",
        "patterns": [
          "Os Ultimos Jedi",
          "The Last Jedi",
          "Episodio VIII",
          "Episode VIII"
        ],
        "year": 2017
      },
      {
        "name": "Star Wars: Episódio IX – A Ascensão Skywalker (2019)",
        "patterns": [
          "A Ascensao Skywalker",
          "The Rise of Skywalker",
          "Episodio IX",
          "Episode IX"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 324
},
{
  "id": "us_mcu_phase_1",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: MCU Fase 1 — Iniciativa Vingadores",
  "description": "Conquistar todos os 6 filmes da Fase 1 da Marvel (6 filmes).",
  "icon": "🛡️",
  "target_type": "franchise_movie_list",
  "target_value": 6,
  "target_metadata": {
    "phase": 1,
    "franchise": "Marvel MCU Fase 1",
    "movies": [
      {
        "name": "Homem de Ferro (2008)",
        "patterns": [
          "Homem de Ferro",
          "Iron Man"
        ],
        "year": 2008,
        "exclude": [
          "2",
          "3"
        ]
      },
      {
        "name": "O Incrível Hulk (2008)",
        "patterns": [
          "Incrivel Hulk",
          "Incredible Hulk"
        ],
        "year": 2008
      },
      {
        "name": "Homem de Ferro 2 (2010)",
        "patterns": [
          "Homem de Ferro 2",
          "Iron Man 2"
        ],
        "year": 2010
      },
      {
        "name": "Thor (2011)",
        "patterns": [
          "Thor"
        ],
        "year": 2011,
        "exclude": [
          "Mundo Sombrio",
          "Ragnarok",
          "Amor e Trovao",
          "Dark World",
          "Love and Thunder"
        ]
      },
      {
        "name": "Capitão América: O Primeiro Vingador (2011)",
        "patterns": [
          "O Primeiro Vingador",
          "The First Avenger"
        ],
        "year": 2011
      },
      {
        "name": "Os Vingadores (2012)",
        "patterns": [
          "Os Vingadores",
          "The Avengers",
          "Avengers"
        ],
        "year": 2012,
        "exclude": [
          "Era de Ultron",
          "Guerra Infinita",
          "Ultimato",
          "Age of Ultron",
          "Infinity War",
          "Endgame"
        ]
      }
    ]
  },
  "sort_order": 325
},
{
  "id": "us_mcu_phase_2",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: MCU Fase 2 — A Era das Joias do Infinito",
  "description": "Conquistar todos os 6 filmes da Fase 2 da Marvel (6 filmes).",
  "icon": "💎",
  "target_type": "franchise_movie_list",
  "target_value": 6,
  "target_metadata": {
    "phase": 2,
    "franchise": "Marvel MCU Fase 2",
    "movies": [
      {
        "name": "Homem de Ferro 3 (2013)",
        "patterns": [
          "Homem de Ferro 3",
          "Iron Man 3"
        ],
        "year": 2013
      },
      {
        "name": "Thor: O Mundo Sombrio (2013)",
        "patterns": [
          "O Mundo Sombrio",
          "The Dark World"
        ],
        "year": 2013
      },
      {
        "name": "Capitão América 2: O Soldado Invernal (2014)",
        "patterns": [
          "O Soldado Invernal",
          "The Winter Soldier"
        ],
        "year": 2014
      },
      {
        "name": "Guardiões da Galáxia (2014)",
        "patterns": [
          "Guardioes da Galaxia",
          "Guardians of the Galaxy"
        ],
        "year": 2014,
        "exclude": [
          "Vol 2",
          "Vol. 2",
          "Vol 3",
          "Vol. 3",
          "2",
          "3"
        ]
      },
      {
        "name": "Vingadores: Era de Ultron (2015)",
        "patterns": [
          "Era de Ultron",
          "Age of Ultron"
        ],
        "year": 2015
      },
      {
        "name": "Homem-Formiga (2015)",
        "patterns": [
          "Homem-Formiga",
          "Ant-Man"
        ],
        "year": 2015,
        "exclude": [
          "Vespa",
          "Wasp",
          "Quantumania"
        ]
      }
    ]
  },
  "sort_order": 326
},
{
  "id": "us_mcu_phase_3",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: MCU Fase 3 — Eu Sou Inevitável!",
  "description": "Conquistar todos os 11 filmes da Fase 3 da Marvel (11 filmes).",
  "icon": "🧤",
  "target_type": "franchise_movie_list",
  "target_value": 11,
  "target_metadata": {
    "phase": 3,
    "franchise": "Marvel MCU Fase 3",
    "movies": [
      {
        "name": "Capitão América: Guerra Civil (2016)",
        "patterns": [
          "Guerra Civil",
          "Civil War"
        ],
        "year": 2016
      },
      {
        "name": "Doutor Estranho (2016)",
        "patterns": [
          "Doutor Estranho",
          "Doctor Strange"
        ],
        "year": 2016,
        "exclude": [
          "Multiverso",
          "Multiverse"
        ]
      },
      {
        "name": "Guardiões da Galáxia Vol. 2 (2017)",
        "patterns": [
          "Guardioes da Galaxia Vol 2",
          "Guardians of the Galaxy Vol 2",
          "Guardioes da Galaxia 2"
        ],
        "year": 2017
      },
      {
        "name": "Homem-Aranha: De Volta ao Lar (2017)",
        "patterns": [
          "De Volta ao Lar",
          "Homecoming"
        ],
        "year": 2017
      },
      {
        "name": "Thor: Ragnarok (2017)",
        "patterns": [
          "Thor Ragnarok",
          "Ragnarok"
        ],
        "year": 2017
      },
      {
        "name": "Pantera Negra (2018)",
        "patterns": [
          "Pantera Negra",
          "Black Panther"
        ],
        "year": 2018,
        "exclude": [
          "Wakanda"
        ]
      },
      {
        "name": "Vingadores: Guerra Infinita (2018)",
        "patterns": [
          "Guerra Infinita",
          "Infinity War"
        ],
        "year": 2018
      },
      {
        "name": "Homem-Formiga e a Vespa (2018)",
        "patterns": [
          "Homem-Formiga e a Vespa",
          "Ant-Man and the Wasp"
        ],
        "year": 2018,
        "exclude": [
          "Quantumania"
        ]
      },
      {
        "name": "Capitã Marvel (2019)",
        "patterns": [
          "Capita Marvel",
          "Captain Marvel"
        ],
        "year": 2019
      },
      {
        "name": "Vingadores: Ultimato (2019)",
        "patterns": [
          "Ultimato",
          "Endgame"
        ],
        "year": 2019
      },
      {
        "name": "Homem-Aranha: Longe de Casa (2019)",
        "patterns": [
          "Longe de Casa",
          "Far From Home"
        ],
        "year": 2019
      }
    ]
  },
  "sort_order": 327
},
{
  "id": "us_mcu_phase_4",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: MCU Fase 4 — Abertura do Multiverso",
  "description": "Conquistar todos os 7 filmes da Fase 4 da Marvel (7 filmes).",
  "icon": "🌀",
  "target_type": "franchise_movie_list",
  "target_value": 7,
  "target_metadata": {
    "phase": 4,
    "franchise": "Marvel MCU Fase 4",
    "movies": [
      {
        "name": "Viúva Negra (2021)",
        "patterns": [
          "Viuva Negra",
          "Black Widow"
        ],
        "year": 2021
      },
      {
        "name": "Shang-Chi e a Lenda dos Dez Anéis (2021)",
        "patterns": [
          "Shang-Chi",
          "Lenda dos Dez Aneis",
          "Legend of the Ten Rings"
        ],
        "year": 2021
      },
      {
        "name": "Eternos (2021)",
        "patterns": [
          "Eternos",
          "Eternals"
        ],
        "year": 2021
      },
      {
        "name": "Homem-Aranha: Sem Volta para Casa (2021)",
        "patterns": [
          "Sem Volta para Casa",
          "No Way Home"
        ],
        "year": 2021
      },
      {
        "name": "Doutor Estranho no Multiverso da Loucura (2022)",
        "patterns": [
          "Multiverso da Loucura",
          "Multiverse of Madness"
        ],
        "year": 2022
      },
      {
        "name": "Thor: Amor e Trovão (2022)",
        "patterns": [
          "Amor e Trovao",
          "Love and Thunder"
        ],
        "year": 2022
      },
      {
        "name": "Pantera Negra: Wakanda Para Sempre (2022)",
        "patterns": [
          "Wakanda Para Sempre",
          "Wakanda Forever"
        ],
        "year": 2022
      }
    ]
  },
  "sort_order": 328
},
{
  "id": "us_mcu_phase_5",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: MCU Fase 5 — Novos Heróis e Anti-Heróis",
  "description": "Conquistar todos os 6 filmes da Fase 5 da Marvel (6 filmes).",
  "icon": "⚡",
  "target_type": "franchise_movie_list",
  "target_value": 6,
  "target_metadata": {
    "phase": 5,
    "franchise": "Marvel MCU Fase 5",
    "movies": [
      {
        "name": "Homem-Formiga e a Vespa: Quantumania (2023)",
        "patterns": [
          "Quantumania"
        ],
        "year": 2023
      },
      {
        "name": "Guardiões da Galáxia Vol. 3 (2023)",
        "patterns": [
          "Guardioes da Galaxia Vol 3",
          "Guardians of the Galaxy Vol 3",
          "Guardioes da Galaxia 3"
        ],
        "year": 2023
      },
      {
        "name": "As Marvels (2023)",
        "patterns": [
          "As Marvels",
          "The Marvels"
        ],
        "year": 2023
      },
      {
        "name": "Deadpool & Wolverine (2024)",
        "patterns": [
          "Deadpool & Wolverine",
          "Deadpool e Wolverine"
        ],
        "year": 2024
      },
      {
        "name": "Capitão América: Admirável Mundo Novo (2025)",
        "patterns": [
          "Admiravel Mundo Novo",
          "Brave New World"
        ],
        "year": 2025
      },
      {
        "name": "Thunderbolts* (2025)",
        "patterns": [
          "Thunderbolts"
        ],
        "year": 2025
      }
    ]
  },
  "sort_order": 329
},
{
  "id": "us_mcu_phase_6",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: MCU Fase 6 — O Fim do Multiverso",
  "description": "Conquistar os 4 filmes da Fase 6 da Marvel (4 filmes).",
  "icon": "🌌",
  "target_type": "franchise_movie_list",
  "target_value": 4,
  "target_metadata": {
    "phase": 6,
    "franchise": "Marvel MCU Fase 6",
    "movies": [
      {
        "name": "Quarteto Fantástico: Primeiros Passos (2025)",
        "patterns": [
          "Quarteto Fantastico Primeiros Passos",
          "Fantastic Four First Steps",
          "Primeiros Passos",
          "First Steps"
        ],
        "year": 2025
      },
      {
        "name": "Homem-Aranha: Um Novo Dia (2026)",
        "patterns": [
          "Um Novo Dia",
          "Brand New Day",
          "Homem-Aranha 4",
          "Spider-Man 4"
        ],
        "year": 2026
      },
      {
        "name": "Vingadores: Doomsday (2026)",
        "patterns": [
          "Vingadores Doomsday",
          "Avengers Doomsday",
          "Doomsday"
        ],
        "year": 2026
      },
      {
        "name": "Vingadores: Guerras Secretas (2027)",
        "patterns": [
          "Guerras Secretas",
          "Secret Wars"
        ],
        "year": 2027
      }
    ]
  },
  "sort_order": 330
},
{
  "id": "us_conjuring",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: Os Arquivos Principais de Ed e Lorraine (Invocação do Mal)",
  "description": "Conquistar os 4 filmes principais de Invocação do Mal (4 filmes).",
  "icon": "🕯️",
  "target_type": "franchise_movie_list",
  "target_value": 4,
  "target_metadata": {
    "franchise": "Invocação do Mal",
    "movies": [
      {
        "name": "Invocação do Mal (2013)",
        "patterns": [
          "Invocacao do Mal",
          "The Conjuring"
        ],
        "year": 2013,
        "exclude": [
          "2",
          "3",
          "4",
          "Ordem do Demonio",
          "Ultimo Ritual",
          "Last Rites"
        ]
      },
      {
        "name": "Invocação do Mal 2 (2016)",
        "patterns": [
          "Invocacao do Mal 2",
          "The Conjuring 2"
        ],
        "year": 2016
      },
      {
        "name": "Invocação do Mal 3: A Ordem do Demônio (2021)",
        "patterns": [
          "Invocacao do Mal 3",
          "The Conjuring 3",
          "A Ordem do Demonio",
          "The Devil Made Me Do It"
        ],
        "year": 2021
      },
      {
        "name": "Invocação do Mal 4: O Último Ritual (2025)",
        "patterns": [
          "Invocacao do Mal 4",
          "The Conjuring 4",
          "Ultimo Ritual",
          "Last Rites"
        ],
        "year": 2025
      }
    ]
  },
  "sort_order": 331
},
{
  "id": "us_purge",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: Sirenes do Expurgo (Uma Noite de Crime)",
  "description": "Conquistar todos os 5 filmes da franquia Uma Noite de Crime (5 filmes).",
  "icon": "🚨",
  "target_type": "franchise_movie_list",
  "target_value": 5,
  "target_metadata": {
    "franchise": "Uma Noite de Crime",
    "movies": [
      {
        "name": "Uma Noite de Crime (2013)",
        "patterns": [
          "Uma Noite de Crime",
          "The Purge"
        ],
        "year": 2013,
        "exclude": [
          "Anarquia",
          "Anarchy",
          "Eleicao",
          "Election",
          "Primeira",
          "First",
          "Fronteira",
          "Forever"
        ]
      },
      {
        "name": "Uma Noite de Crime: Anarquia (2014)",
        "patterns": [
          "Anarquia",
          "Anarchy"
        ],
        "year": 2014
      },
      {
        "name": "12 Horas para Sobreviver: O Ano da Eleição (2016)",
        "patterns": [
          "O Ano da Eleicao",
          "Election Year",
          "12 Horas para Sobreviver"
        ],
        "year": 2016
      },
      {
        "name": "A Primeira Noite de Crime (2018)",
        "patterns": [
          "A Primeira Noite de Crime",
          "The First Purge"
        ],
        "year": 2018
      },
      {
        "name": "Uma Noite de Crime: A Fronteira (2021)",
        "patterns": [
          "A Fronteira",
          "The Forever Purge",
          "Forever Purge"
        ],
        "year": 2021
      }
    ]
  },
  "sort_order": 332
},
{
  "id": "us_dceu_justice_league",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: Unidos (e Resetados no Tempo) — Liga da Justiça & Flash",
  "description": "Conquistar os 5 filmes do arco da Liga da Justiça no cinema (5 filmes).",
  "icon": "⚡",
  "target_type": "franchise_movie_list",
  "target_value": 5,
  "target_metadata": {
    "franchise": "Liga da Justiça DCEU",
    "movies": [
      {
        "name": "O Homem de Aço (2013)",
        "patterns": [
          "Homem de Aco",
          "Man of Steel"
        ],
        "year": 2013
      },
      {
        "name": "Batman vs Superman: A Origem da Justiça (2016)",
        "patterns": [
          "Batman vs Superman",
          "Batman v Superman",
          "Origem da Justica",
          "Dawn of Justice"
        ],
        "year": 2016
      },
      {
        "name": "Liga da Justiça (2017)",
        "patterns": [
          "Liga da Justica",
          "Justice League"
        ],
        "year": 2017,
        "exclude": [
          "Zack Snyder",
          "Snyder Cut",
          "Sem Limites",
          "Crise",
          "Flashpoint",
          "Dark",
          "Throne",
          "War"
        ]
      },
      {
        "name": "Liga da Justiça de Zack Snyder (2021)",
        "patterns": [
          "Zack Snyder s Justice League",
          "Zack Snyder",
          "Snyder Cut"
        ],
        "year": 2021
      },
      {
        "name": "The Flash (2023)",
        "patterns": [
          "The Flash",
          "Flash"
        ],
        "year": 2023,
        "exclude": [
          "Ponto de Ignicao",
          "Flashpoint",
          "Paradox"
        ]
      }
    ]
  },
  "sort_order": 333
},
{
  "id": "us_spiderman_all_3",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "gold",
  "title": "Universos & Sagas: O Sexteto (ou Trio) de Aranhas! (As 3 Franquias do Homem-Aranha)",
  "description": "Completar todas as 3 franquias live-action do Homem-Aranha: Tobey Maguire + Andrew Garfield + Tom Holland (9 filmes).",
  "icon": "🕷️",
  "target_type": "franchise_movie_list",
  "target_value": 9,
  "target_metadata": {
    "franchise": "As 3 Franquias Homem-Aranha",
    "movies": [
      {
        "name": "Homem-Aranha (2002)",
        "patterns": [
          "Homem-Aranha",
          "Spider-Man"
        ],
        "year": 2002,
        "exclude": [
          "2",
          "3",
          "Espetacular",
          "Amazing",
          "Volta",
          "Casa",
          "Aranhaverso"
        ]
      },
      {
        "name": "Homem-Aranha 2 (2004)",
        "patterns": [
          "Homem-Aranha 2",
          "Spider-Man 2"
        ],
        "year": 2004,
        "exclude": [
          "Espetacular",
          "Amazing",
          "Longe"
        ]
      },
      {
        "name": "Homem-Aranha 3 (2007)",
        "patterns": [
          "Homem-Aranha 3",
          "Spider-Man 3"
        ],
        "year": 2007,
        "exclude": [
          "Sem Volta"
        ]
      },
      {
        "name": "O Espetacular Homem-Aranha (2012)",
        "patterns": [
          "O Espetacular Homem-Aranha",
          "The Amazing Spider-Man"
        ],
        "year": 2012,
        "exclude": [
          "2",
          "Electro"
        ]
      },
      {
        "name": "O Espetacular Homem-Aranha 2: A Ameaça de Electro (2014)",
        "patterns": [
          "O Espetacular Homem-Aranha 2",
          "The Amazing Spider-Man 2",
          "A Ameaca de Electro"
        ],
        "year": 2014
      },
      {
        "name": "Homem-Aranha: De Volta ao Lar (2017)",
        "patterns": [
          "De Volta ao Lar",
          "Homecoming"
        ],
        "year": 2017
      },
      {
        "name": "Homem-Aranha: Longe de Casa (2019)",
        "patterns": [
          "Longe de Casa",
          "Far From Home"
        ],
        "year": 2019
      },
      {
        "name": "Homem-Aranha: Sem Volta para Casa (2021)",
        "patterns": [
          "Sem Volta para Casa",
          "No Way Home"
        ],
        "year": 2021
      },
      {
        "name": "Homem-Aranha: Um Novo Dia (2026)",
        "patterns": [
          "Um Novo Dia",
          "Brand New Day",
          "Homem-Aranha 4",
          "Spider-Man 4"
        ],
        "year": 2026
      }
    ]
  },
  "sort_order": 334
},
{
  "id": "us_mcu_half_journey",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "gold",
  "title": "Universos & Sagas: Metade da Jornada Marvel (3 Fases Concluídas)",
  "description": "Completar 100% de quaisquer 3 Fases da Marvel (MCU) (3 fases completas).",
  "icon": "⭐",
  "target_type": "mcu_phase_count",
  "target_value": 3,
  "target_metadata": {
    "requiredPhases": 3
  },
  "sort_order": 335
},
{
  "id": "us_omen",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "gold",
  "title": "Universos & Sagas: A Marca da Besta 666 (A Profecia)",
  "description": "Conquistar todos os 6 filmes da franquia Damien Thorn: A Profecia (6 filmes).",
  "icon": "👹",
  "target_type": "franchise_movie_list",
  "target_value": 6,
  "target_metadata": {
    "franchise": "A Profecia",
    "movies": [
      {
        "name": "A Profecia (1976)",
        "patterns": [
          "A Profecia",
          "The Omen"
        ],
        "year": 1976,
        "exclude": [
          "II",
          "III",
          "IV",
          "2",
          "3",
          "4",
          "Conflito",
          "Despertar",
          "Primeira"
        ]
      },
      {
        "name": "A Profecia II (1978)",
        "patterns": [
          "A Profecia II",
          "Damien Omen II",
          "A Profecia 2",
          "Damien"
        ],
        "year": 1978
      },
      {
        "name": "A Profecia III: O Conflito Final (1981)",
        "patterns": [
          "A Profecia III",
          "The Final Conflict",
          "O Conflito Final",
          "A Profecia 3",
          "Omen III"
        ],
        "year": 1981
      },
      {
        "name": "A Profecia IV: O Despertar (1991)",
        "patterns": [
          "A Profecia IV",
          "O Despertar",
          "The Awakening",
          "A Profecia 4",
          "Omen IV"
        ],
        "year": 1991
      },
      {
        "name": "A Profecia (2006)",
        "patterns": [
          "A Profecia",
          "The Omen",
          "666"
        ],
        "year": 2006,
        "exclude": [
          "II",
          "III",
          "IV",
          "Primeira"
        ]
      },
      {
        "name": "A Primeira Profecia (2024)",
        "patterns": [
          "A Primeira Profecia",
          "The First Omen"
        ],
        "year": 2024
      }
    ]
  },
  "sort_order": 336
},
{
  "id": "us_the_grudge",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "gold",
  "title": "Universos & Sagas: A Maldição de Kayako (O Grito)",
  "description": "Conquistar os 6 filmes principais da franquia O Grito (6 filmes).",
  "icon": "👻",
  "target_type": "franchise_movie_list",
  "target_value": 6,
  "target_metadata": {
    "franchise": "O Grito",
    "movies": [
      {
        "name": "O Grito (Ju-on: The Grudge, 2002)",
        "patterns": [
          "Ju-on The Grudge",
          "Ju-on",
          "O Grito"
        ],
        "year": 2002,
        "exclude": [
          "2",
          "3",
          "2020"
        ]
      },
      {
        "name": "O Grito 2 (Ju-on: The Grudge 2, 2003)",
        "patterns": [
          "Ju-on The Grudge 2",
          "Ju-on 2",
          "O Grito 2"
        ],
        "year": 2003
      },
      {
        "name": "O Grito (The Grudge, 2004)",
        "patterns": [
          "The Grudge",
          "O Grito"
        ],
        "year": 2004,
        "exclude": [
          "2",
          "3",
          "Ju-on",
          "2020"
        ]
      },
      {
        "name": "O Grito 2 (The Grudge 2, 2006)",
        "patterns": [
          "The Grudge 2",
          "O Grito 2"
        ],
        "year": 2006,
        "exclude": [
          "Ju-on"
        ]
      },
      {
        "name": "O Grito 3 (The Grudge 3, 2009)",
        "patterns": [
          "The Grudge 3",
          "O Grito 3"
        ],
        "year": 2009
      },
      {
        "name": "O Grito (The Grudge, 2020)",
        "patterns": [
          "The Grudge",
          "O Grito"
        ],
        "year": 2020,
        "exclude": [
          "2",
          "3",
          "Ju-on"
        ]
      }
    ]
  },
  "sort_order": 337
},
{
  "id": "us_dc_showcase",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "gold",
  "title": "Universos & Sagas: Colecionador de Curtas (DC Showcase)",
  "description": "Conquistar 10 curtas animados da coleção oficial DC Showcase (10 curtas).",
  "icon": "🎬",
  "target_type": "dc_showcase_count",
  "target_value": 10,
  "target_metadata": {
    "collection": "DC Showcase"
  },
  "sort_order": 338
},
{
  "id": "us_saw_complete",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "mythic",
  "title": "Universos & Sagas: Vamos Jogar um Jogo?",
  "description": "Conquistar todos os 10 filmes da franquia Jogos Mortais (10 filmes).",
  "icon": "🧩",
  "target_type": "franchise_movie_list",
  "target_value": 10,
  "target_metadata": {
    "franchise": "Jogos Mortais",
    "movies": [
      {
        "name": "Jogos Mortais (2004)",
        "patterns": [
          "Jogos Mortais",
          "Saw"
        ],
        "year": 2004,
        "exclude": [
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "Final",
          "Jigsaw",
          "Espiral",
          "Spiral",
          "X",
          "10",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII"
        ]
      },
      {
        "name": "Jogos Mortais 2 (2005)",
        "patterns": [
          "Jogos Mortais 2",
          "Jogos Mortais II",
          "Saw II",
          "Saw 2"
        ],
        "year": 2005
      },
      {
        "name": "Jogos Mortais 3 (2006)",
        "patterns": [
          "Jogos Mortais 3",
          "Jogos Mortais III",
          "Saw III",
          "Saw 3"
        ],
        "year": 2006
      },
      {
        "name": "Jogos Mortais 4 (2007)",
        "patterns": [
          "Jogos Mortais 4",
          "Jogos Mortais IV",
          "Saw IV",
          "Saw 4"
        ],
        "year": 2007
      },
      {
        "name": "Jogos Mortais 5 (2008)",
        "patterns": [
          "Jogos Mortais 5",
          "Jogos Mortais V",
          "Saw V",
          "Saw 5"
        ],
        "year": 2008
      },
      {
        "name": "Jogos Mortais 6 (2009)",
        "patterns": [
          "Jogos Mortais 6",
          "Jogos Mortais VI",
          "Saw VI",
          "Saw 6"
        ],
        "year": 2009
      },
      {
        "name": "Jogos Mortais: O Final (2010)",
        "patterns": [
          "Jogos Mortais O Final",
          "Saw 3D",
          "Saw The Final Chapter",
          "Jogos Mortais 7",
          "Jogos Mortais VII"
        ],
        "year": 2010
      },
      {
        "name": "Jogos Mortais: Jigsaw (2017)",
        "patterns": [
          "Jigsaw",
          "Jogos Mortais Jigsaw",
          "Saw 8"
        ],
        "year": 2017
      },
      {
        "name": "Espiral: O Legado de Jogos Mortais (2021)",
        "patterns": [
          "Espiral",
          "Spiral",
          "O Legado de Jogos Mortais"
        ],
        "year": 2021
      },
      {
        "name": "Jogos Mortais X (2023)",
        "patterns": [
          "Jogos Mortais X",
          "Saw X",
          "Jogos Mortais 10"
        ],
        "year": 2023
      }
    ]
  },
  "sort_order": 339
},
{
  "id": "us_children_of_the_corn",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "mythic",
  "title": "Universos & Sagas: Aquele Que Anda Por Trás das Fileiras (A Colheita Maldita)",
  "description": "Conquistar todos os 11 filmes da franquia A Colheita Maldita (11 filmes).",
  "icon": "🌽",
  "target_type": "franchise_movie_list",
  "target_value": 11,
  "target_metadata": {
    "franchise": "A Colheita Maldita",
    "movies": [
      {
        "name": "Colheita Maldita (1984)",
        "patterns": [
          "Colheita Maldita",
          "Children of the Corn"
        ],
        "year": 1984,
        "exclude": [
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "Sacrificio",
          "Urbana",
          "Campos",
          "Isaac",
          "Revelacao",
          "Genesis",
          "Fugitivos"
        ]
      },
      {
        "name": "Colheita Maldita 2: O Sacrifício Final (1992)",
        "patterns": [
          "Colheita Maldita 2",
          "O Sacrificio Final",
          "Children of the Corn II",
          "The Final Sacrifice"
        ],
        "year": 1992
      },
      {
        "name": "Colheita Maldita 3: A Colheita Urbana (1995)",
        "patterns": [
          "Colheita Maldita 3",
          "A Colheita Urbana",
          "Children of the Corn III",
          "Urban Harvest"
        ],
        "year": 1995
      },
      {
        "name": "Colheita Maldita 4 (1996)",
        "patterns": [
          "Colheita Maldita 4",
          "Children of the Corn IV",
          "The Gathering"
        ],
        "year": 1996
      },
      {
        "name": "Colheita Maldita 5: Campos do Terror (1998)",
        "patterns": [
          "Colheita Maldita 5",
          "Campos do Terror",
          "Children of the Corn V",
          "Fields of Terror"
        ],
        "year": 1998
      },
      {
        "name": "Colheita Maldita 666: Isaac Está de Volta (1999)",
        "patterns": [
          "Colheita Maldita 666",
          "Isaac Esta de Volta",
          "Children of the Corn 666",
          "Isaac s Return"
        ],
        "year": 1999
      },
      {
        "name": "Colheita Maldita 7: A Revelação (2001)",
        "patterns": [
          "Colheita Maldita 7",
          "A Revelacao",
          "Children of the Corn Revelation"
        ],
        "year": 2001
      },
      {
        "name": "A Colheita Maldita (2009)",
        "patterns": [
          "A Colheita Maldita",
          "Children of the Corn"
        ],
        "year": 2009,
        "exclude": [
          "Genesis",
          "Fugitivos",
          "1984"
        ]
      },
      {
        "name": "Colheita Maldita: Gênesis (2011)",
        "patterns": [
          "Genesis",
          "Colheita Maldita Genesis",
          "Children of the Corn Genesis"
        ],
        "year": 2011
      },
      {
        "name": "Colheita Maldita: Fugitivos (2018)",
        "patterns": [
          "Fugitivos",
          "Runaway",
          "Children of the Corn Runaway"
        ],
        "year": 2018
      },
      {
        "name": "Colheita Maldita (2020)",
        "patterns": [
          "Colheita Maldita",
          "Children of the Corn"
        ],
        "year": 2020,
        "exclude": [
          "1984",
          "2009"
        ]
      }
    ]
  },
  "sort_order": 340
},
{
  "id": "us_star_wars_complete",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "mythic",
  "title": "Universos & Sagas: Que a Força Esteja com Você! (Saga Completa Star Wars)",
  "description": "Conquistar todos os 11 filmes live-action de Star Wars: Episódios I a IX + Rogue One + Han Solo (11 filmes).",
  "icon": "🌌",
  "target_type": "franchise_movie_list",
  "target_value": 11,
  "target_metadata": {
    "franchise": "Star Wars Saga Completa",
    "movies": [
      {
        "name": "Star Wars: Episódio I – A Ameaça Fantasma (1999)",
        "patterns": [
          "A Ameaca Fantasma",
          "The Phantom Menace",
          "Episodio I",
          "Episode I"
        ],
        "year": 1999
      },
      {
        "name": "Star Wars: Episódio II – Ataque dos Clones (2002)",
        "patterns": [
          "Ataque dos Clones",
          "Attack of the Clones",
          "Episodio II",
          "Episode II"
        ],
        "year": 2002
      },
      {
        "name": "Star Wars: Episódio III – A Vingança dos Sith (2005)",
        "patterns": [
          "A Vinganca dos Sith",
          "Revenge of the Sith",
          "Episodio III",
          "Episode III"
        ],
        "year": 2005
      },
      {
        "name": "Star Wars: Episódio IV – Uma Nova Esperança (1977)",
        "patterns": [
          "Uma Nova Esperanca",
          "A New Hope",
          "Episodio IV",
          "Episode IV",
          "Guerra nas Estrelas"
        ],
        "year": 1977
      },
      {
        "name": "Star Wars: Episódio V – O Império Contra-Ataca (1980)",
        "patterns": [
          "O Imperio Contra-Ataca",
          "The Empire Strikes Back",
          "Episodio V",
          "Episode V"
        ],
        "year": 1980
      },
      {
        "name": "Star Wars: Episódio VI – O Retorno de Jedi (1983)",
        "patterns": [
          "O Retorno de Jedi",
          "Return of the Jedi",
          "Episodio VI",
          "Episode VI"
        ],
        "year": 1983
      },
      {
        "name": "Star Wars: Episódio VII – O Despertar da Força (2015)",
        "patterns": [
          "O Despertar da Forca",
          "The Force Awakens",
          "Episodio VII",
          "Episode VII"
        ],
        "year": 2015
      },
      {
        "name": "Star Wars: Episódio VIII – Os Últimos Jedi (2017)",
        "patterns": [
          "Os Ultimos Jedi",
          "The Last Jedi",
          "Episodio VIII",
          "Episode VIII"
        ],
        "year": 2017
      },
      {
        "name": "Star Wars: Episódio IX – A Ascensão Skywalker (2019)",
        "patterns": [
          "A Ascensao Skywalker",
          "The Rise of Skywalker",
          "Episodio IX",
          "Episode IX"
        ],
        "year": 2019
      },
      {
        "name": "Rogue One: Uma História Star Wars (2016)",
        "patterns": [
          "Rogue One"
        ],
        "year": 2016
      },
      {
        "name": "Han Solo: Uma História Star Wars (2018)",
        "patterns": [
          "Han Solo",
          "Solo A Star Wars Story"
        ],
        "year": 2018
      }
    ]
  },
  "sort_order": 341
},
{
  "id": "us_xmen_complete",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "mythic",
  "title": "Universos & Sagas: Gene X Supremo (Saga Completa X-Men, Logan & Deadpool)",
  "description": "Conquistar todos os 14 filmes da franquia mutante: X-Men, Wolverine, Logan e Deadpool (14 filmes).",
  "icon": "🧬",
  "target_type": "franchise_movie_list",
  "target_value": 14,
  "target_metadata": {
    "franchise": "X-Men & Mutantes",
    "movies": [
      {
        "name": "X-Men: O Filme (2000)",
        "patterns": [
          "X-Men O Filme",
          "X-Men"
        ],
        "year": 2000,
        "exclude": [
          "2",
          "Confronto",
          "Origens",
          "Primeira Classe",
          "Imortal",
          "Futuro",
          "Apocalipse",
          "Fenix",
          "Novos"
        ]
      },
      {
        "name": "X-Men 2 (2003)",
        "patterns": [
          "X-Men 2",
          "X2"
        ],
        "year": 2003
      },
      {
        "name": "X-Men: O Confronto Final (2006)",
        "patterns": [
          "O Confronto Final",
          "The Last Stand",
          "X-Men 3"
        ],
        "year": 2006
      },
      {
        "name": "X-Men Origens: Wolverine (2009)",
        "patterns": [
          "Origens Wolverine",
          "Origins Wolverine",
          "X-Men Origens"
        ],
        "year": 2009
      },
      {
        "name": "X-Men: Primeira Classe (2011)",
        "patterns": [
          "Primeira Classe",
          "First Class"
        ],
        "year": 2011
      },
      {
        "name": "Wolverine: Imortal (2013)",
        "patterns": [
          "Wolverine Imortal",
          "The Wolverine"
        ],
        "year": 2013
      },
      {
        "name": "X-Men: Dias de Um Futuro Esquecido (2014)",
        "patterns": [
          "Dias de Um Futuro Esquecido",
          "Days of Future Past"
        ],
        "year": 2014
      },
      {
        "name": "Deadpool (2016)",
        "patterns": [
          "Deadpool"
        ],
        "year": 2016,
        "exclude": [
          "2",
          "Wolverine"
        ]
      },
      {
        "name": "X-Men: Apocalipse (2016)",
        "patterns": [
          "X-Men Apocalipse",
          "X-Men Apocalypse"
        ],
        "year": 2016
      },
      {
        "name": "Logan (2017)",
        "patterns": [
          "Logan"
        ],
        "year": 2017
      },
      {
        "name": "Deadpool 2 (2018)",
        "patterns": [
          "Deadpool 2"
        ],
        "year": 2018,
        "exclude": [
          "Wolverine"
        ]
      },
      {
        "name": "X-Men: Fênix Negra (2019)",
        "patterns": [
          "Fenix Negra",
          "Dark Phoenix"
        ],
        "year": 2019
      },
      {
        "name": "Os Novos Mutantes (2020)",
        "patterns": [
          "Os Novos Mutantes",
          "The New Mutants"
        ],
        "year": 2020
      },
      {
        "name": "Deadpool & Wolverine (2024)",
        "patterns": [
          "Deadpool & Wolverine",
          "Deadpool e Wolverine"
        ],
        "year": 2024
      }
    ]
  },
  "sort_order": 342
},
{
  "id": "us_dc_animation_master",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "mythic",
  "title": "Universos & Sagas: Lenda Absoluta da DC Animation (Excluindo DC Showcase)",
  "description": "Conquistar 25 longas-metragens de Animação da DC (filmes com Tag DC + Gênero Animação, excluindo todos os curtas DC Showcase) (25 filmes).",
  "icon": "🦇",
  "target_type": "dc_animated_feature_count",
  "target_value": 25,
  "target_metadata": {
    "tag": "DC",
    "genre": "Animação",
    "excludePattern": "DC Showcase"
  },
  "sort_order": 343
},
{
  "id": "us_mcu_the_watcher",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "mythic",
  "title": "Universos & Sagas: O Vigia do Multiverso (As 6 Fases da Marvel Completas)",
  "description": "Completar 100% de todas as 6 Fases da Marvel (MCU) (6 fases completas / 40 filmes).",
  "icon": "👁️",
  "target_type": "mcu_phase_count",
  "target_value": 6,
  "target_metadata": {
    "requiredPhases": 6
  },
  "sort_order": 344
}
,
{
  "id": "us_resident_evil",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "gold",
  "title": "Universos & Sagas: Bem-vindo a Raccoon City (Corporação Umbrella)",
  "description": "Conquistar os 7 filmes live-action da franquia Resident Evil (7 filmes).",
  "icon": "☣️",
  "target_type": "franchise_movie_list",
  "target_value": 7,
  "target_metadata": {
    "franchise": "Resident Evil",
    "movies": [
      {
        "name": "Resident Evil: O Hóspede Maldito (2002)",
        "patterns": [
          "O Hospede Maldito",
          "Resident Evil"
        ],
        "year": 2002,
        "exclude": [
          "2",
          "3",
          "4",
          "5",
          "6",
          "Apocalipse",
          "Extinção",
          "Extincao",
          "Recomeço",
          "Recomeco",
          "Retribuição",
          "Retribuicao",
          "Capitulo",
          "Raccoon City"
        ]
      },
      {
        "name": "Resident Evil 2: Apocalipse (2004)",
        "patterns": [
          "Resident Evil 2",
          "Apocalipse",
          "Apocalypse"
        ],
        "year": 2004
      },
      {
        "name": "Resident Evil 3: A Extinção (2007)",
        "patterns": [
          "Resident Evil 3",
          "A Extincao",
          "Extinction"
        ],
        "year": 2007
      },
      {
        "name": "Resident Evil 4: Recomeço (2010)",
        "patterns": [
          "Resident Evil 4",
          "Recomeco",
          "Afterlife"
        ],
        "year": 2010
      },
      {
        "name": "Resident Evil 5: Retribuição (2012)",
        "patterns": [
          "Resident Evil 5",
          "Retribuicao",
          "Retribution"
        ],
        "year": 2012
      },
      {
        "name": "Resident Evil 6: O Capítulo Final (2016)",
        "patterns": [
          "Resident Evil 6",
          "O Capitulo Final",
          "The Final Chapter"
        ],
        "year": 2016
      },
      {
        "name": "Resident Evil: Bem-Vindo a Raccoon City (2021)",
        "patterns": [
          "Bem-Vindo a Raccoon City",
          "Bem Vindo a Raccoon City",
          "Welcome to Raccoon City"
        ],
        "year": 2021
      }
    ]
  },
  "sort_order": 345
},
{
  "id": "mafia_oscar_winner_1",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: O Oscar Vai Para... Meu Catálogo!",
  "description": "Conquistar 1 filme Ganhador do Oscar (pelo menos 1 vitória no Oscar) (1 filme).",
  "icon": "🏆",
  "target_type": "hollywood_oscar_winner_count",
  "target_value": 1,
  "target_metadata": {
    "minWins": 1
  },
  "sort_order": 401
},
{
  "id": "mafia_oscar_3_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: 33! (Aproveitamento 100% na Academia)",
  "description": "Conquistar 1 filme que foi indicado a 3 Oscars e ganhou os 3 (1 filme).",
  "icon": "🎯",
  "target_type": "hollywood_oscar_exact_ratio",
  "target_value": 1,
  "target_metadata": {
    "nominations": 3,
    "wins": 3
  },
  "sort_order": 402
},
{
  "id": "mafia_oscar_noms_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: Deve Ser um Filmão! (Ou Não)",
  "description": "Conquistar 1 filme que foi indicado a pelo menos 10 Oscars (1 filme).",
  "icon": "📜",
  "target_type": "hollywood_oscar_nominations_min",
  "target_value": 1,
  "target_metadata": {
    "minNominations": 10
  },
  "sort_order": 403
},
{
  "id": "mafia_dir_jordan_peele",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: É Terror ou Crítica Social? Não Sei, Só Sei que É Bom!",
  "description": "Conquistar 3 filmes do diretor Jordan Peele (3 filmes).",
  "icon": "☕",
  "target_type": "hollywood_director_count",
  "target_value": 3,
  "target_metadata": {
    "director": "Jordan Peele",
    "patterns": [
      "jordan peele"
    ]
  },
  "sort_order": 404
},
{
  "id": "mafia_writer_fil_braz",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: Rindo em Português: A Caneta da Comédia Nacional!",
  "description": "Conquistar 3 filmes do roteirista Fil Braz (3 filmes).",
  "icon": "✍️",
  "target_type": "hollywood_writer_count",
  "target_value": 3,
  "target_metadata": {
    "writer": "Fil Braz",
    "patterns": [
      "fil braz"
    ]
  },
  "sort_order": 405
},
{
  "id": "mafia_dist_sony_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: Pensei que a Sony Só Fazia Música e PlayStation!",
  "description": "Conquistar 10 filmes da distribuidora Sony Pictures (10 filmes).",
  "icon": "🎮",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 10,
  "target_metadata": {
    "company": "Sony Pictures",
    "patterns": [
      "sony",
      "columbia pictures",
      "tri-star",
      "tristar"
    ]
  },
  "sort_order": 406
},
{
  "id": "mafia_dir_michael_bay_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: BUM! Explosão ao Pôr do Sol ao Som de Linkin Park!",
  "description": "Conquistar 3 filmes dirigidos por Michael Bay (3 filmes).",
  "icon": "💥",
  "target_type": "hollywood_director_count",
  "target_value": 3,
  "target_metadata": {
    "director": "Michael Bay",
    "patterns": [
      "michael bay"
    ]
  },
  "sort_order": 407
},
{
  "id": "mafia_dir_zack_snyder_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: Câmera Lenta de 40 Minutos, Filtro Cinza e \"Hallelujah\" Tocando!",
  "description": "Conquistar 3 filmes dirigidos por Zack Snyder (3 filmes).",
  "icon": "⏳",
  "target_type": "hollywood_director_count",
  "target_value": 3,
  "target_metadata": {
    "director": "Zack Snyder",
    "patterns": [
      "zack snyder"
    ]
  },
  "sort_order": 408
},
{
  "id": "mafia_person_tarantino_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: Close no Pé, Diálogo Aleatório e Banho de Sangue!",
  "description": "Conquistar 3 filmes dirigidos ou escritos por Quentin Tarantino (3 filmes).",
  "icon": "🩸",
  "target_type": "hollywood_director_or_writer_count",
  "target_value": 3,
  "target_metadata": {
    "person": "Quentin Tarantino",
    "patterns": [
      "quentin tarantino",
      "tarantino"
    ]
  },
  "sort_order": 409
},
{
  "id": "mafia_dir_wes_anderson_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: Simetria Perfeita, Cores Pastel e Olhar Parado pro Centro da Câmera!",
  "description": "Conquistar 3 filmes dirigidos por Wes Anderson (3 filmes).",
  "icon": "📐",
  "target_type": "hollywood_director_count",
  "target_value": 3,
  "target_metadata": {
    "director": "Wes Anderson",
    "patterns": [
      "wes anderson"
    ]
  },
  "sort_order": 410
},
{
  "id": "mafia_person_del_toro_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: Monstros Bonzinhos, Humanos Malvados e Muita Maquiagem!",
  "description": "Conquistar 3 filmes dirigidos ou escritos por Guillermo del Toro (3 filmes).",
  "icon": "👹",
  "target_type": "hollywood_director_or_writer_count",
  "target_value": 3,
  "target_metadata": {
    "person": "Guillermo del Toro",
    "patterns": [
      "guillermo del toro",
      "del toro"
    ]
  },
  "sort_order": 411
},
{
  "id": "mafia_dir_david_fincher_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "A Máfia de Hollywood: 99 Takes pra Abrir uma Porta e Filtro Amarelo-Esverdeado!",
  "description": "Conquistar 3 filmes dirigidos por David Fincher (3 filmes).",
  "icon": "🚪",
  "target_type": "hollywood_director_count",
  "target_value": 3,
  "target_metadata": {
    "director": "David Fincher",
    "patterns": [
      "david fincher"
    ]
  },
  "sort_order": 412
},
{
  "id": "mafia_dir_tim_burton_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Só Tem Batman, Johnny Depp e Gótico Aqui?",
  "description": "Conquistar 5 filmes do diretor Tim Burton (5 filmes).",
  "icon": "🖤",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "Tim Burton",
    "patterns": [
      "tim burton"
    ]
  },
  "sort_order": 413
},
{
  "id": "mafia_dir_taika_waititi_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Ele Só Sabe Fazer Piada?! (Até no Thor e na Guerra!)",
  "description": "Conquistar 5 filmes do diretor Taika Waititi (5 filmes).",
  "icon": "😂",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "Taika Waititi",
    "patterns": [
      "taika waititi"
    ]
  },
  "sort_order": 414
},
{
  "id": "mafia_dir_james_wan_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: O Rei do Terror Moderno (Ou Quase)",
  "description": "Conquistar 5 filmes do diretor James Wan (5 filmes).",
  "icon": "👑",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "James Wan",
    "patterns": [
      "james wan"
    ]
  },
  "sort_order": 415
},
{
  "id": "mafia_dir_darren_bousman_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Alguém Me Explica se Ele Faz Filme Bom Mesmo?!",
  "description": "Conquistar 5 filmes do diretor Darren Lynn Bousman (5 filmes).",
  "icon": "🤔",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "Darren Lynn Bousman",
    "patterns": [
      "darren lynn bousman",
      "darren bousman"
    ]
  },
  "sort_order": 416
},
{
  "id": "mafia_writer_bob_kane_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Roubou os Créditos do Bill Finger e Foi Parar na Minha Lista!",
  "description": "Conquistar 5 filmes creditados ao roteirista Bob Kane (5 filmes).",
  "icon": "🦇",
  "target_type": "hollywood_writer_count",
  "target_value": 5,
  "target_metadata": {
    "writer": "Bob Kane",
    "patterns": [
      "bob kane"
    ]
  },
  "sort_order": 417
},
{
  "id": "mafia_person_paul_ws_anderson_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Olha a Minha Mulher! Olha Como Ela É Linda Batendo em Monstro!",
  "description": "Conquistar 5 filmes onde Paul W.S. Anderson seja diretor ou roteirista (5 filmes).",
  "icon": "🧟‍♀️",
  "target_type": "hollywood_director_or_writer_count",
  "target_value": 5,
  "target_metadata": {
    "person": "Paul W.S. Anderson",
    "patterns": [
      "paul w.s. anderson",
      "paul w. s. anderson",
      "paul ws anderson",
      "paul w s anderson"
    ]
  },
  "sort_order": 418
},
{
  "id": "mafia_person_mike_flanagan_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Monólogos de 10 Minutos e Fantasmas na Sala (Terapia com Mike Flanagan)",
  "description": "Conquistar 5 filmes dirigidos ou escritos por Mike Flanagan (5 filmes).",
  "icon": "🛋️",
  "target_type": "hollywood_director_or_writer_count",
  "target_value": 5,
  "target_metadata": {
    "person": "Mike Flanagan",
    "patterns": [
      "mike flanagan"
    ]
  },
  "sort_order": 419
},
{
  "id": "mafia_person_jj_abrams_bad_robot_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Cuidado com o Lens Flare no Olho! (A Caixa de Mistério)",
  "description": "Conquistar 5 filmes dirigidos/escritos por J.J. Abrams ou produzidos pelo estúdio Bad Robot (5 filmes).",
  "icon": "🤖",
  "target_type": "hollywood_director_writer_or_studio_count",
  "target_value": 5,
  "target_metadata": {
    "personPatterns": [
      "j.j. abrams",
      "j. j. abrams",
      "jj abrams"
    ],
    "studioPatterns": [
      "bad robot"
    ]
  },
  "sort_order": 420
},
{
  "id": "mafia_writer_gary_dauberman_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Se Tem Boneca Demoníaca ou Palhaço Assassino, Foi Ele Quem Escreveu!",
  "description": "Conquistar 5 filmes do roteirista Gary Dauberman (5 filmes).",
  "icon": "🪆",
  "target_type": "hollywood_writer_count",
  "target_value": 5,
  "target_metadata": {
    "writer": "Gary Dauberman",
    "patterns": [
      "gary dauberman"
    ]
  },
  "sort_order": 421
},
{
  "id": "mafia_dir_russo_brothers_4",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Salvadores da Pátria da Marvel (A Panelinha dos Irmãos Russo)",
  "description": "Conquistar 4 filmes dirigidos por Anthony Russo ou Joe Russo (4 filmes).",
  "icon": "🛡️",
  "target_type": "hollywood_director_count",
  "target_value": 4,
  "target_metadata": {
    "director": "Irmãos Russo",
    "patterns": [
      "anthony russo",
      "joe russo"
    ]
  },
  "sort_order": 422
},
{
  "id": "mafia_dir_christopher_nolan_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Não Entendi Nada do Final, a Música Tá Alta Demais, Mas Foi Filmado em IMAX!",
  "description": "Conquistar 5 filmes dirigidos por Christopher Nolan (5 filmes).",
  "icon": "🔊",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "Christopher Nolan",
    "patterns": [
      "christopher nolan"
    ]
  },
  "sort_order": 423
},
{
  "id": "mafia_dir_martin_scorsese_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: \"Isso Não É Cinema, É Parque de Diversões!\"",
  "description": "Conquistar 5 filmes dirigidos por Martin Scorsese (5 filmes).",
  "icon": "🎡",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "Martin Scorsese",
    "patterns": [
      "martin scorsese"
    ]
  },
  "sort_order": 424
},
{
  "id": "mafia_dir_steven_spielberg_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Pais Ausentes, Crianças Olhando pro Céu e Trilha do John Williams!",
  "description": "Conquistar 5 filmes dirigidos por Steven Spielberg (5 filmes).",
  "icon": "🚲",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "Steven Spielberg",
    "patterns": [
      "steven spielberg"
    ]
  },
  "sort_order": 425
},
{
  "id": "mafia_studio_disney_pixar_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Só Tem Filme Fofo (Mas Faz Marmanjo Chorar nos Primeiros 10 Minutos!)",
  "description": "Conquistar 10 filmes do estúdio Disney / Pixar (10 filmes).",
  "icon": "🏰",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 10,
  "target_metadata": {
    "company": "Disney / Pixar",
    "patterns": [
      "disney",
      "walt disney",
      "pixar",
      "buena vista"
    ]
  },
  "sort_order": 426
},
{
  "id": "mafia_studio_br_downtown_globo_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Orgulho da Indústria Nacional! (Você Já Viu Essa Vinheta no Cinema)",
  "description": "Conquistar 10 filmes somados dos estúdios Downtown Filmes ou Globo Filmes (10 filmes).",
  "icon": "🇧🇷",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 10,
  "target_metadata": {
    "company": "Downtown / Globo Filmes",
    "patterns": [
      "downtown filmes",
      "globo filmes"
    ]
  },
  "sort_order": 427
},
{
  "id": "mafia_studio_new_line_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: A Casa que o Freddy Krueger Construiu (Existe Vida Além do Terror!)",
  "description": "Conquistar 10 filmes do estúdio New Line Cinema (10 filmes).",
  "icon": "🏚️",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 10,
  "target_metadata": {
    "company": "New Line Cinema",
    "patterns": [
      "new line cinema",
      "new line"
    ]
  },
  "sort_order": 428
},
{
  "id": "mafia_studio_warner_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Como Assim Esse Filme Não Foi Cancelado pelo CEO?!",
  "description": "Conquistar 15 filmes do estúdio Warner Bros. (15 filmes).",
  "icon": "🛡️",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 15,
  "target_metadata": {
    "company": "Warner Bros.",
    "patterns": [
      "warner"
    ]
  },
  "sort_order": 429
},
{
  "id": "mafia_dist_a24_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: O Surpreendente Selo A24",
  "description": "Conquistar 10 filmes da distribuidora A24 (10 filmes).",
  "icon": "💎",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 10,
  "target_metadata": {
    "company": "A24",
    "patterns": [
      "a24"
    ]
  },
  "sort_order": 430
},
{
  "id": "mafia_dist_sony_30",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Eu Tenho Mais Filmes que Jogos Exclusivos de PS5!",
  "description": "Conquistar 30 filmes da distribuidora Sony Pictures (30 filmes).",
  "icon": "🕹️",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 30,
  "target_metadata": {
    "company": "Sony Pictures",
    "patterns": [
      "sony",
      "columbia pictures",
      "tri-star",
      "tristar"
    ]
  },
  "sort_order": 431
},
{
  "id": "mafia_studio_arad_8",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: O Verdadeiro Vilão do Homem-Aranha (Ou o Pai dos Brinquedos da Marvel!)",
  "description": "Conquistar 8 filmes do estúdio Arad Productions (8 filmes).",
  "icon": "🧸",
  "target_type": "hollywood_studio_count",
  "target_value": 8,
  "target_metadata": {
    "studio": "Arad Productions",
    "patterns": [
      "arad productions",
      "arad"
    ]
  },
  "sort_order": 432
},
{
  "id": "mafia_studio_constantin_8",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: A Fábrica Alemã de Zumbis e Adaptações de Videogame!",
  "description": "Conquistar 8 filmes do estúdio Constantin Film (8 filmes).",
  "icon": "🏭",
  "target_type": "hollywood_studio_count",
  "target_value": 8,
  "target_metadata": {
    "studio": "Constantin Film",
    "patterns": [
      "constantin film",
      "constantin"
    ]
  },
  "sort_order": 433
},
{
  "id": "mafia_dist_netflix_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: TUDUM! Nem Passou na Bilheteria e Já Caiu no Sofá",
  "description": "Conquistar 15 filmes distribuídos pela Netflix (15 filmes).",
  "icon": "🔴",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 15,
  "target_metadata": {
    "company": "Netflix",
    "patterns": [
      "netflix"
    ]
  },
  "sort_order": 434
},
{
  "id": "mafia_studio_dc_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Mais Reboots que a Linha do Tempo Aguenta!",
  "description": "Conquistar 15 filmes somados dos estúdios DC Entertainment e DC Films (15 filmes).",
  "icon": "⚡",
  "target_type": "hollywood_studio_or_tag_count",
  "target_value": 15,
  "target_metadata": {
    "patterns": [
      "dc entertainment",
      "dc films",
      "dc studios"
    ],
    "tag": "DC"
  },
  "sort_order": 435
},
{
  "id": "mafia_oscar_nominated_unwon_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Morreu na Praia, Mas Ganhou Aplauso de Pé!",
  "description": "Conquistar 15 filmes Indicados ao Oscar que não venceram nenhuma estatueta (15 filmes).",
  "icon": "👏",
  "target_type": "hollywood_oscar_nominated_unwon_count",
  "target_value": 15,
  "sort_order": 436
},
{
  "id": "mafia_oscar_wins_8",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Levou Tudo?!",
  "description": "Conquistar 1 filme que ganhou pelo menos 8 Oscars (1 filme).",
  "icon": "🏆",
  "target_type": "hollywood_oscar_wins_min",
  "target_value": 1,
  "target_metadata": {
    "minWins": 8
  },
  "sort_order": 437
},
{
  "id": "mafia_person_paul_ws_anderson_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Nepotismo Existe em Todos os Lugares (Mas Aqui Tem Câmera Lenta!)",
  "description": "Conquistar 10 filmes onde Paul W.S. Anderson seja diretor ou roteirista (10 filmes).",
  "icon": "🎬",
  "target_type": "hollywood_director_or_writer_count",
  "target_value": 10,
  "target_metadata": {
    "person": "Paul W.S. Anderson",
    "patterns": [
      "paul w.s. anderson",
      "paul w. s. anderson",
      "paul ws anderson",
      "paul w s anderson"
    ]
  },
  "sort_order": 438
},
{
  "id": "mafia_dir_stephen_daldry_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Do Balé de Billy Elliot ao Lixão do Brasil (Quase 100% no Oscar!)",
  "description": "Conquistar 5 filmes do diretor Stephen Daldry (5 filmes).",
  "icon": "🩰",
  "target_type": "hollywood_director_count",
  "target_value": 5,
  "target_metadata": {
    "director": "Stephen Daldry",
    "patterns": [
      "stephen daldry"
    ]
  },
  "sort_order": 439
},
{
  "id": "mafia_studio_twisted_pictures_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Game Over! (O Estúdio que Vive de Armadilha e Sangue)",
  "description": "Conquistar 10 filmes do estúdio Twisted Pictures (10 filmes).",
  "icon": "🩸",
  "target_type": "hollywood_studio_count",
  "target_value": 10,
  "target_metadata": {
    "studio": "Twisted Pictures",
    "patterns": [
      "twisted pictures"
    ]
  },
  "sort_order": 440
},
{
  "id": "mafia_studio_fox_20",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Fanfarra dos Holofotes: Tem de Tudo Aqui!",
  "description": "Conquistar 20 filmes do estúdio 20th Century Fox / Twentieth Century Fox (20 filmes).",
  "icon": "🎺",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 20,
  "target_metadata": {
    "company": "20th Century Fox",
    "patterns": [
      "20th century",
      "twentieth century"
    ]
  },
  "sort_order": 441
},
{
  "id": "mafia_studio_blumhouse_20",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: A Casa do Terror Barato que Lucra Bilhões!",
  "description": "Conquistar 20 filmes do estúdio Blumhouse Productions (20 filmes).",
  "icon": "🔪",
  "target_type": "hollywood_studio_count",
  "target_value": 20,
  "target_metadata": {
    "studio": "Blumhouse Productions",
    "patterns": [
      "blumhouse"
    ]
  },
  "sort_order": 442
},
{
  "id": "mafia_dist_lionsgate_20",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Jogos Mortais, Jogos Vorazes e John Wick Pagam as Contas Aqui!",
  "description": "Conquistar 20 filmes da distribuidora Lionsgate (20 filmes).",
  "icon": "🦁",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 20,
  "target_metadata": {
    "company": "Lionsgate",
    "patterns": [
      "lionsgate"
    ]
  },
  "sort_order": 443
},
{
  "id": "mafia_dist_paris_diamond_20",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Os Donos dos Ingressos no Brasil!",
  "description": "Conquistar 20 filmes somados das distribuidoras Paris Filmes e Diamond Films (20 filmes).",
  "icon": "🎟️",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 20,
  "target_metadata": {
    "company": "Paris Filmes & Diamond Films",
    "patterns": [
      "paris filmes",
      "diamond films"
    ]
  },
  "sort_order": 444
},
{
  "id": "mafia_dist_paramount_uip_25",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Quantas Estrelas Tem Nessa Montanha?!",
  "description": "Conquistar 25 filmes somados das distribuidoras Paramount e United International Pictures (UIP) (25 filmes).",
  "icon": "⭐",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 25,
  "target_metadata": {
    "company": "Paramount & UIP",
    "patterns": [
      "paramount",
      "united international pictures",
      "uip"
    ]
  },
  "sort_order": 445
},
{
  "id": "mafia_writer_director_same_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Deixa que Eu Mesmo Escrevo e Dirijo Essa Bagunça! (Ego de Autor)",
  "description": "Conquistar 15 filmes onde a mesma pessoa aparece como Diretor e Roteirista ao mesmo tempo (15 filmes).",
  "icon": "🎭",
  "target_type": "hollywood_same_director_writer_count",
  "target_value": 15,
  "sort_order": 446
},
{
  "id": "mafia_dir_zack_snyder_6",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Liberem o Snyder Cut de 4 Horas em Preto e Branco!",
  "description": "Conquistar 6 filmes dirigidos por Zack Snyder (6 filmes).",
  "icon": "🎥",
  "target_type": "hollywood_director_count",
  "target_value": 6,
  "target_metadata": {
    "director": "Zack Snyder",
    "patterns": [
      "zack snyder"
    ]
  },
  "sort_order": 447
},
{
  "id": "mafia_dir_michael_bay_6",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Haja Dinamite no Set de Filmagem! (Orçamento em Pólvora)",
  "description": "Conquistar 6 filmes dirigidos por Michael Bay (6 filmes).",
  "icon": "🧨",
  "target_type": "hollywood_director_count",
  "target_value": 6,
  "target_metadata": {
    "director": "Michael Bay",
    "patterns": [
      "michael bay"
    ]
  },
  "sort_order": 448
},
{
  "id": "mafia_oscar_winner_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Tapete Vermelho de Gala",
  "description": "Conquistar 15 filmes Ganhadores do Oscar (15 filmes).",
  "icon": "🌟",
  "target_type": "hollywood_oscar_winner_count",
  "target_value": 15,
  "target_metadata": {
    "minWins": 1
  },
  "sort_order": 449
},
{
  "id": "mafia_oscar_5_noms_0_wins_3",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "A Máfia de Hollywood: Esqueceram de Entregar a Estatueta! (O Maior Azarão)",
  "description": "Conquistar 3 filmes que tiveram 5 ou mais indicações ao Oscar, mas saíram com 0 vitórias (3 filmes).",
  "icon": "💔",
  "target_type": "hollywood_oscar_5_noms_unwon_count",
  "target_value": 3,
  "sort_order": 450
},
{
  "id": "mafia_oscar_5_5",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: 555! (Quina Dourada da Academia)",
  "description": "Conquistar 5 filmes que foram indicados a pelo menos 5 Oscars e ganharam pelo menos 5 Oscars (5 filmes).",
  "icon": "🖐️",
  "target_type": "hollywood_oscar_5_noms_5_wins_count",
  "target_value": 5,
  "sort_order": 451
},
{
  "id": "mafia_dir_shyamalan_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Esse Diretor É uma Montanha-Russa! (Uma Hora É Gênio, na Outra a Planta Mata!)",
  "description": "Conquistar 10 filmes do diretor M. Night Shyamalan (ou do estúdio Blinding Edge Pictures) (10 filmes).",
  "icon": "🎢",
  "target_type": "hollywood_director_or_studio_count",
  "target_value": 10,
  "target_metadata": {
    "directorPatterns": [
      "m. night shyamalan",
      "shyamalan"
    ],
    "studioPatterns": [
      "blinding edge pictures"
    ]
  },
  "sort_order": 452
},
{
  "id": "mafia_studio_warner_30",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Tem de Tudo Aqui: Do Super-Herói até o Terror!",
  "description": "Conquistar 30 filmes do estúdio Warner Bros. (30 filmes).",
  "icon": "🏰",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 30,
  "target_metadata": {
    "company": "Warner Bros.",
    "patterns": [
      "warner"
    ]
  },
  "sort_order": 453
},
{
  "id": "mafia_dist_a24_30",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Pode Vir Qualquer Coisa! (De Bode Falante a Pedra no Multiverso)",
  "description": "Conquistar 30 filmes da distribuidora A24 (30 filmes).",
  "icon": "🐐",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 30,
  "target_metadata": {
    "company": "A24",
    "patterns": [
      "a24"
    ]
  },
  "sort_order": 454
},
{
  "id": "mafia_modern_horror_architects_20",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Os Arquitetos do Pesadelo Moderno",
  "description": "Conquistar 20 filmes somados entre os diretores James Wan, M. Night Shyamalan, Mike Flanagan, Jordan Peele, Andy Muschietti, Darren Lynn Bousman, Lee Cronin, John R. Leonetti e Ciarán Foy (20 filmes).",
  "icon": "🏛️",
  "target_type": "hollywood_director_pool_count",
  "target_value": 20,
  "target_metadata": {
    "poolDirectors": [
      "James Wan",
      "M. Night Shyamalan",
      "Mike Flanagan",
      "Jordan Peele",
      "Andy Muschietti",
      "Darren Lynn Bousman",
      "Lee Cronin",
      "John R. Leonetti",
      "Ciarán Foy"
    ],
    "patterns": [
      "james wan",
      "m. night shyamalan",
      "shyamalan",
      "mike flanagan",
      "jordan peele",
      "andy muschietti",
      "darren lynn bousman",
      "darren bousman",
      "lee cronin",
      "john r. leonetti",
      "john leonetti",
      "ciaran foy"
    ]
  },
  "sort_order": 455
},
{
  "id": "mafia_unique_directors_3_films_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Conselho Supremo de Diretores",
  "description": "Ter pelo menos 10 diretores diferentes com 3 ou mais filmes conquistados no catálogo (10 diretores).",
  "icon": "🎬",
  "target_type": "hollywood_unique_directors_quota",
  "target_value": 10,
  "target_metadata": {
    "minFilmsPerDirector": 3,
    "requiredDirectorsCount": 10
  },
  "sort_order": 456
},
{
  "id": "mafia_unique_writers_3_films_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Sindicato dos Roteiristas de Elite",
  "description": "Ter pelo menos 10 roteiristas diferentes com 3 ou mais filmes conquistados no catálogo (10 roteiristas).",
  "icon": "📝",
  "target_type": "hollywood_unique_writers_quota",
  "target_value": 10,
  "target_metadata": {
    "minFilmsPerWriter": 3,
    "requiredWritersCount": 10
  },
  "sort_order": 457
},
{
  "id": "mafia_oscar_officer_90",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Fiscal Oficial da Academia",
  "description": "Conquistar 30 filmes Ganhadores do Oscar e 60 filmes Indicados ao Oscar (90 marcos do Oscar).",
  "icon": "🧐",
  "target_type": "hollywood_oscar_dual_quota",
  "target_value": 90,
  "target_metadata": {
    "requiredWinners": 30,
    "requiredNominees": 60
  },
  "sort_order": 458
},
{
  "id": "mafia_dist_sony_50",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "mythic",
  "title": "A Máfia de Hollywood: Ok, Talvez Eu Não Tenha Tanto Jogo Exclusivo da Sony Assim!",
  "description": "Conquistar 50 filmes da distribuidora Sony Pictures (50 filmes).",
  "icon": "💿",
  "target_type": "hollywood_distributor_studio_count",
  "target_value": 50,
  "target_metadata": {
    "company": "Sony Pictures",
    "patterns": [
      "sony",
      "columbia pictures",
      "tri-star",
      "tristar"
    ]
  },
  "sort_order": 459
},
{
  "id": "mafia_conglomerates_monopoly_150",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "mythic",
  "title": "A Máfia de Hollywood: Monopólio Absoluto das Bilheterias",
  "description": "Conquistar 150 filmes somados entre os grandes conglomerados (Disney / Pixar, Buena Vista International, 20th Century Fox, Warner Bros., Sony Pictures, Paramount e Universal) (150 filmes).",
  "icon": "💰",
  "target_type": "hollywood_conglomerates_count",
  "target_value": 150,
  "target_metadata": {
    "patterns": [
      "disney",
      "pixar",
      "buena vista",
      "20th century",
      "twentieth century",
      "warner",
      "sony",
      "columbia pictures",
      "tri-star",
      "tristar",
      "paramount",
      "universal"
    ]
  },
  "sort_order": 460
},
{
  "id": "mafia_oscar_lifetime_member",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "mythic",
  "title": "A Máfia de Hollywood: Membro Vitalício da Academia de Hollywood",
  "description": "Conquistar 50 filmes Ganhadores do Oscar ou 120 filmes Indicados ao Oscar (100% da meta).",
  "icon": "🏛️",
  "target_type": "hollywood_oscar_or_quota",
  "target_value": 100,
  "target_metadata": {
    "targetWins": 50,
    "targetNominations": 120
  },
  "sort_order": 461
},
{
  "id": "mafia_unique_directors_4_films_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "mythic",
  "title": "A Máfia de Hollywood: Panteão dos Autores",
  "description": "Ter pelo menos 15 diretores diferentes com 4 ou mais filmes conquistados no catálogo (15 diretores).",
  "icon": "👑",
  "target_type": "hollywood_unique_directors_quota",
  "target_value": 15,
  "target_metadata": {
    "minFilmsPerDirector": 4,
    "requiredDirectorsCount": 15
  },
  "sort_order": 462
},
{
  "id": "mafia_godfather_plat",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood"
  ],
  "tier": "platinum",
  "title": "A Máfia de Hollywood: O Poderoso Chefão dos Estúdios",
  "description": "Conquistar TODOS os troféus da categoria A Máfia de Hollywood (desbloqueio automático dinâmico ao atingir 100% dos outros 89 troféus desta categoria, incluindo multicategoria).",
  "icon": "🏆",
  "target_type": "platinum_dynamic",
  "target_value": 89,
  "target_metadata": {
    "category": "mafia_hollywood",
    "categoryScope": "mafia_hollywood"
  },
  "sort_order": 463
}
,
{
  "id": "multi_bay_december_1",
  "category": "multi",
  "categories": [
    "data_limite",
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "Fogos de Artifício ou Explosões do Michael Bay?!",
  "description": "Conquistar 1 filme do diretor Michael Bay assistido no mês de Dezembro (1 filme).",
  "icon": "💥",
  "target_type": "hybrid_director_month",
  "target_value": 1,
  "target_metadata": {
    "directorPatterns": [
      "michael bay"
    ],
    "month": 12,
    "isHybrid": true
  },
  "sort_order": 501
},
{
  "id": "multi_brazil_oscar_1",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "É do Brasil!! Finalmente Conseguimos!!",
  "description": "Conquistar 1 filme do Brasil que ganhou pelo menos 1 Oscar (1 filme).",
  "icon": "🇧🇷",
  "target_type": "hybrid_country_oscar_winner",
  "target_value": 1,
  "target_metadata": {
    "countryCode": "br",
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 502
},
{
  "id": "multi_horror_oscar_1",
  "category": "multi",
  "categories": [
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "Terror com Ouro! (Até a Academia Teve Medo)",
  "description": "Conquistar 1 filme do gênero Terror que ganhou pelo menos 1 Oscar (1 filme).",
  "icon": "😱",
  "target_type": "hybrid_genre_oscar_winner",
  "target_value": 1,
  "target_metadata": {
    "genre": "Terror",
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 503
},
{
  "id": "multi_blumhouse_october_3",
  "category": "multi",
  "categories": [
    "data_limite",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "bronze",
  "title": "Susto de Baixo Orçamento na Noite de Halloween!",
  "description": "Conquistar 3 filmes do gênero Terror produzidos pela Blumhouse Productions assistidos no mês de Outubro (3 filmes).",
  "icon": "🎃",
  "target_type": "hybrid_genre_studio_month",
  "target_value": 3,
  "target_metadata": {
    "genre": "Terror",
    "studioPatterns": [
      "blumhouse"
    ],
    "month": 10,
    "isHybrid": true
  },
  "sort_order": 504
},
{
  "id": "vm_petroleum_countries_4",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo"
  ],
  "tier": "silver",
  "title": "Volta ao Mundo: Aqui Não Tem Petróleo!! (Só Democracia Forçada)",
  "description": "Conquistar 1 filme de cada país: Iraque, Irã, Venezuela e Síria (4 países).",
  "icon": "🛢️",
  "target_type": "world_countries_checklist",
  "target_value": 4,
  "target_metadata": {
    "countries": [
      {
        "code": "iq",
        "name": "Iraque"
      },
      {
        "code": "ir",
        "name": "Irã"
      },
      {
        "code": "ve",
        "name": "Venezuela"
      },
      {
        "code": "sy",
        "name": "Síria"
      }
    ]
  },
  "sort_order": 505
},
{
  "id": "multi_non_us_oscar_5",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "Os Outros Países Também Querem Brincar!",
  "description": "Conquistar 5 filmes que ganharam Oscar e NÃO foram produzidos nos Estados Unidos (5 filmes).",
  "icon": "🌐",
  "target_type": "hybrid_non_us_oscar_winner",
  "target_value": 5,
  "target_metadata": {
    "excludeCountryCode": "us",
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 506
},
{
  "id": "multi_romance_lgbt_10",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema"
  ],
  "tier": "silver",
  "title": "Corações Jovens!",
  "description": "Conquistar 10 filmes do gênero Romance com a tag Personagem LGBT (10 filmes).",
  "icon": "🏳️‍🌈",
  "target_type": "hybrid_genre_tag",
  "target_value": 10,
  "target_metadata": {
    "genre": "Romance",
    "tag": "Personagem LGBT",
    "isHybrid": true
  },
  "sort_order": 507
},
{
  "id": "multi_short_oscar_5",
  "category": "multi",
  "categories": [
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "Tão Rápido que Já Pegou o Ouro!",
  "description": "Conquistar 5 filmes do gênero Curta que ganharam pelo menos 1 Oscar (5 filmes).",
  "icon": "⏱️",
  "target_type": "hybrid_genre_oscar_winner",
  "target_value": 5,
  "target_metadata": {
    "genre": "Curta",
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 508
},
{
  "id": "multi_hitchcock_suspense_5",
  "category": "multi",
  "categories": [
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "O Mestre do Suspense (Cuidado no Chuveiro e com os Pássaros!)",
  "description": "Conquistar 5 filmes do diretor Alfred Hitchcock que sejam do gênero Suspense ou Mistério (5 filmes).",
  "icon": "🔪",
  "target_type": "hybrid_director_genres",
  "target_value": 5,
  "target_metadata": {
    "directorPatterns": [
      "alfred hitchcock",
      "hitchcock"
    ],
    "anyOfGenres": [
      "Suspense",
      "Mistério"
    ],
    "isHybrid": true
  },
  "sort_order": 509
},
{
  "id": "multi_warren_invocaversus_5",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "O Multiverso da Loucura dos Warren!",
  "description": "Conquistar 5 filmes do gênero Terror com a tag \"invocaversus\" onde James Wan seja diretor ou roteirista (ou estúdio New Line Cinema) (5 filmes).",
  "icon": "🕯️",
  "target_type": "hybrid_warren_invocaversus",
  "target_value": 5,
  "target_metadata": {
    "genre": "Terror",
    "tag": "invocaversus",
    "personPatterns": [
      "james wan"
    ],
    "studioPatterns": [
      "new line cinema",
      "new line"
    ],
    "isHybrid": true
  },
  "sort_order": 510
},
{
  "id": "multi_pixar_cry_5",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "Fábrica de Chorar da Pixar!",
  "description": "Conquistar 5 filmes do gênero Animação do estúdio Disney / Pixar com a tag Emocionante ou Animais antropomorficos (5 filmes).",
  "icon": "🎈",
  "target_type": "hybrid_pixar_emotional_animals",
  "target_value": 5,
  "target_metadata": {
    "genre": "Animação",
    "companyPatterns": [
      "disney",
      "pixar",
      "walt disney",
      "buena vista"
    ],
    "anyOfTags": [
      "Emocionante",
      "Animais antropomorficos"
    ],
    "isHybrid": true
  },
  "sort_order": 511
},
{
  "id": "multi_gore_twisted_lionsgate_5",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "Sangue, Armadilhas e Gore Assinados pelo Mestre!",
  "description": "Conquistar 5 filmes do gênero Terror com a tag Gore do estúdio Twisted Pictures (ou Lionsgate) (5 filmes).",
  "icon": "⚙️",
  "target_type": "hybrid_gore_twisted_lionsgate",
  "target_value": 5,
  "target_metadata": {
    "genre": "Terror",
    "tag": "Gore",
    "companyPatterns": [
      "twisted pictures",
      "lionsgate"
    ],
    "isHybrid": true
  },
  "sort_order": 512
},
{
  "id": "multi_brazil_comedy_producers_8",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "Rir Pra Não Chorar no Cinema Brasileiro!",
  "description": "Conquistar 8 filmes do Brasil do gênero Comédia produzidos pela Downtown Filmes, Globo Filmes ou Paris Filmes (8 filmes).",
  "icon": "😂",
  "target_type": "hybrid_brazil_comedy_producers",
  "target_value": 8,
  "target_metadata": {
    "countryCode": "br",
    "genre": "Comédia",
    "companyPatterns": [
      "downtown filmes",
      "globo filmes",
      "paris filmes"
    ],
    "isHybrid": true
  },
  "sort_order": 513
},
{
  "id": "multi_disney_july_dec_5",
  "category": "multi",
  "categories": [
    "data_limite",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "Férias Escolares com o Mickey!",
  "description": "Conquistar 5 filmes de Animação ou Família da Disney / Pixar assistidos em Julho ou Dezembro (5 filmes).",
  "icon": "🏖️",
  "target_type": "hybrid_disney_vacation_july_dec",
  "target_value": 5,
  "target_metadata": {
    "anyOfGenres": [
      "Animação",
      "Família"
    ],
    "companyPatterns": [
      "disney",
      "pixar",
      "walt disney",
      "buena vista"
    ],
    "months": [
      7,
      12
    ],
    "isHybrid": true
  },
  "sort_order": 514
},
{
  "id": "multi_hitchcock_bw_3",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "silver",
  "title": "Clássico em Preto e Branco do Mestre Hitchcock!",
  "description": "Conquistar 3 filmes do diretor Alfred Hitchcock com a tag Preto e branco (3 filmes).",
  "icon": "📼",
  "target_type": "hybrid_hitchcock_black_white",
  "target_value": 3,
  "target_metadata": {
    "directorPatterns": [
      "alfred hitchcock",
      "hitchcock"
    ],
    "tag": "Preto e branco",
    "isHybrid": true
  },
  "sort_order": 515
},
{
  "id": "multi_non_us_oscar_15",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Essa Estatueta Não Fala Inglês!",
  "description": "Conquistar 15 filmes que ganharam Oscar e NÃO foram produzidos nos Estados Unidos (15 filmes).",
  "icon": "🗽",
  "target_type": "hybrid_non_us_oscar_winner",
  "target_value": 15,
  "target_metadata": {
    "excludeCountryCode": "us",
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 516
},
{
  "id": "multi_romance_school_20",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema"
  ],
  "tier": "epic",
  "title": "Amor nos Corredores (Suspiros na Sala de Aula)",
  "description": "Conquistar 20 filmes do gênero Romance com a tag Colegio/Escola (20 filmes).",
  "icon": "🏫",
  "target_type": "hybrid_genre_tag",
  "target_value": 20,
  "target_metadata": {
    "genre": "Romance",
    "tag": "Colegio/Escola",
    "isHybrid": true
  },
  "sort_order": 517
},
{
  "id": "multi_disney_fox_horror_5",
  "category": "multi",
  "categories": [
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Eles Fazem Terror?! (O Lado Sombrio do Castelo da Disney)",
  "description": "Conquistar 5 filmes do gênero Terror com distribuição ou estúdio Disney / Pixar, Buena Vista International ou 20th Century Fox (5 filmes).",
  "icon": "🏰",
  "target_type": "hybrid_disney_fox_horror",
  "target_value": 5,
  "target_metadata": {
    "genre": "Terror",
    "companyPatterns": [
      "disney",
      "pixar",
      "walt disney",
      "buena vista",
      "20th century fox",
      "20th century studios",
      "twentieth century"
    ],
    "isHybrid": true
  },
  "sort_order": 518
},
{
  "id": "multi_a24_horror_tags_8",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Terror Cult Cabeça que Só a A24 Explica!",
  "description": "Conquistar 8 filmes da distribuidora A24 do gênero Terror ou Suspense que tenham a tag Bruxo, Demônio, Gore ou Trágico (8 filmes).",
  "icon": "🐐",
  "target_type": "hybrid_a24_horror_tags",
  "target_value": 8,
  "target_metadata": {
    "companyPatterns": [
      "a24"
    ],
    "anyOfGenres": [
      "Terror",
      "Suspense"
    ],
    "anyOfTags": [
      "Bruxo",
      "Demônio",
      "Gore",
      "Trágico"
    ],
    "isHybrid": true
  },
  "sort_order": 519
},
{
  "id": "multi_top250_oscar_15",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Tapete Vermelho do IMDb (Aprovado pelo Público e pela Academia!)",
  "description": "Conquistar 15 filmes que tenham a tag TOP250 e sejam Ganhadores do Oscar ao mesmo tempo (15 filmes).",
  "icon": "🌟",
  "target_type": "hybrid_top250_oscar_winner",
  "target_value": 15,
  "target_metadata": {
    "tag": "TOP250",
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 520
},
{
  "id": "multi_sk_oscar_5",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Stephen King no Tapete Vermelho!",
  "description": "Conquistar 5 filmes com a tag SK (Stephen King) que foram Indicados ou Ganhadores do Oscar (5 filmes).",
  "icon": "🤡",
  "target_type": "hybrid_sk_oscar",
  "target_value": 5,
  "target_metadata": {
    "tag": "SK",
    "minNominationsOrWins": 1,
    "isHybrid": true
  },
  "sort_order": 521
},
{
  "id": "multi_zombie_constantin_pwsa_5",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Apocalipse Zumbi Patrocinado pela Alemanha e pela Milla!",
  "description": "Conquistar 5 filmes com a tag Zumbi e Baseado em jogo produzidos pela Constantin Film ou dirigidos/escritos por Paul W.S. Anderson (5 filmes).",
  "icon": "🧟",
  "target_type": "hybrid_zombie_game_constantin_pwsa",
  "target_value": 5,
  "target_metadata": {
    "tags": [
      "Zumbi",
      "Baseado em jogo"
    ],
    "companyPatterns": [
      "constantin film",
      "constantin"
    ],
    "personPatterns": [
      "paul w.s. anderson",
      "paul ws anderson",
      "paul w. s. anderson",
      "paul w s anderson"
    ],
    "isHybrid": true
  },
  "sort_order": 522
},
{
  "id": "multi_drama_oscar_summer_10",
  "category": "multi",
  "categories": [
    "data_limite",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Temporada do Oscar (Maratona de Verão da Academia)",
  "description": "Conquistar 10 filmes do gênero Drama ou Biografia que sejam Indicados ou Ganhadores do Oscar assistidos nos meses de Janeiro, Fevereiro ou Março (10 filmes).",
  "icon": "☀️",
  "target_type": "hybrid_drama_oscar_jan_feb_mar",
  "target_value": 10,
  "target_metadata": {
    "anyOfGenres": [
      "Drama",
      "Biografia"
    ],
    "months": [
      1,
      2,
      3
    ],
    "minNominationsOrWins": 1,
    "isHybrid": true
  },
  "sort_order": 523
},
{
  "id": "multi_shyamalan_twist_5",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "epic",
  "title": "Plot Twist Duplo do Shyamalan!",
  "description": "Conquistar 5 filmes do diretor M. Night Shyamalan do gênero Suspense ou Mistério com a tag Final Epico ou Super Poder (5 filmes).",
  "icon": "🌀",
  "target_type": "hybrid_shyamalan_twist",
  "target_value": 5,
  "target_metadata": {
    "directorPatterns": [
      "m. night shyamalan",
      "shyamalan"
    ],
    "anyOfGenres": [
      "Suspense",
      "Mistério"
    ],
    "anyOfTags": [
      "Final Epico",
      "Super Poder"
    ],
    "isHybrid": true
  },
  "sort_order": 524
},
{
  "id": "multi_non_us_oscar_30",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "Esse Ouro Eles Não Vão Roubar!",
  "description": "Conquistar 30 filmes que ganharam Oscar e NÃO foram produzidos nos Estados Unidos (30 filmes).",
  "icon": "🏺",
  "target_type": "hybrid_non_us_oscar_winner",
  "target_value": 30,
  "target_metadata": {
    "excludeCountryCode": "us",
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 525
},
{
  "id": "multi_dc_warner_vs_marvel_disney_30",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "A Guerra Fria dos Bilhões (Warner vs. Disney nos Quadrinhos!)",
  "description": "Conquistar 15 filmes de Ação/Aventura com a tag DC na Warner Bros. e 15 filmes de Ação/Aventura com a tag Marvel na Disney/Buena Vista/Sony (30 filmes).",
  "icon": "⚡",
  "target_type": "hybrid_warner_dc_vs_disney_marvel",
  "target_value": 30,
  "target_metadata": {
    "isHybrid": true
  },
  "sort_order": 526
},
{
  "id": "multi_drama_bio_hist_oscar_winner_25",
  "category": "multi",
  "categories": [
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "Chuva de Estatuetas em Noite de Drama!",
  "description": "Conquistar 25 filmes do gênero Drama, Biografia ou História que sejam Ganhadores do Oscar (25 filmes).",
  "icon": "🎭",
  "target_type": "hybrid_drama_bio_hist_oscar_winner",
  "target_value": 25,
  "target_metadata": {
    "anyOfGenres": [
      "Drama",
      "Biografia",
      "História"
    ],
    "minWins": 1,
    "isHybrid": true
  },
  "sort_order": 527
},
{
  "id": "multi_halloween_masters_10",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "anatomia_cinema",
    "data_limite",
    "mafia_hollywood"
  ],
  "tier": "gold",
  "title": "Noite das Bruxas com os Mestres do Terror (Crossover 4 Categorias!)",
  "description": "Conquistar 10 filmes do gênero Terror + Tag Sobrenatural (Fantasma, Demônio, Gore, Vampiro ou Zumbi) + Estúdio/Distribuidora (Blumhouse, A24, New Line ou Lionsgate) + Assistidos em Outubro (10 filmes).",
  "icon": "🧙‍♀️",
  "target_type": "hybrid_halloween_masters",
  "target_value": 10,
  "target_metadata": {
    "genre": "Terror",
    "anyOfTags": [
      "Fantasma",
      "Demônio",
      "Gore",
      "Vampiro",
      "Zumbi"
    ],
    "companyPatterns": [
      "blumhouse",
      "a24",
      "new line",
      "lionsgate"
    ],
    "month": 10,
    "isHybrid": true
  },
  "sort_order": 528
},
{
  "id": "multi_seven_deadly_sins_49",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "anatomia_cinema",
    "mafia_hollywood"
  ],
  "tier": "mythic",
  "title": "Os 7 Pecados Capitais do Cinema (7x7 = 49 Marcos!)",
  "description": "Cumprir todos os 7 Pecados Capitais do catálogo (49 filmes/marcos no checklist): Luxúria, Orgulho, Inveja, Ira, Preguiça, Avareza e Gula.",
  "icon": "🍎",
  "target_type": "hybrid_seven_deadly_sins",
  "target_value": 49,
  "target_metadata": {
    "isHybrid": true
  },
  "sort_order": 529
},
{
  "id": "multi_supreme_5_categories_15",
  "category": "multi",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "anatomia_cinema",
    "data_limite",
    "mafia_hollywood"
  ],
  "tier": "mythic",
  "title": "O Grande Cruzamento do Cinema Mundial (Supremo 5 Categorias!)",
  "description": "Conquistar 15 filmes que combinem simultaneamente: País fora dos EUA + Pelo menos 2 Gêneros Oficiais + Pelo menos 1 Tag Pessoal + Indicado ou Ganhador do Oscar + Data/Mês registrado (15 filmes).",
  "icon": "🌌",
  "target_type": "hybrid_supreme_5_categories",
  "target_value": 15,
  "target_metadata": {
    "isHybrid": true
  },
  "sort_order": 530
},
{
  "id": "tc_primeira_sentenca_1",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Primeira Sentença Favorável",
  "description": "Conquistar 1 filme com Minha Nota igual ou superior a 9.000 (1 filme).",
  "icon": "⚖️",
  "target_type": "critic_tribunal_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "ur_gte_9000"
  },
  "sort_order": 531
},
{
  "id": "tc_pena_maxima_1",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Pena Máxima: Duas Horas no Lixo!",
  "description": "Conquistar 1 filme com Minha Nota igual ou inferior a 3.000 (1 filme).",
  "icon": "🗑️",
  "target_type": "critic_tribunal_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "ur_lte_3000"
  },
  "sort_order": 532
},
{
  "id": "tc_tomate_fresco_3",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Tomate Fresco e Suculento",
  "description": "Conquistar 3 filmes com Rotten Tomatoes válido e igual ou superior a 90% (3 filmes).",
  "icon": "🍅",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "rt_gte_90"
  },
  "sort_order": 533
},
{
  "id": "tc_voz_das_massas_3",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Voz das Massas (Aprovado pelo IMDb)",
  "description": "Conquistar 3 filmes com IMDb válido e igual ou superior a 8.0 (3 filmes).",
  "icon": "⭐",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "imdb_gte_80"
  },
  "sort_order": 534
},
{
  "id": "tc_fenomeno_bilheteria_3",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Fenômeno de Bilheteria Global",
  "description": "Conquistar 3 filmes com Global Reviews igual ou superior a 1.000.000 (3 filmes).",
  "icon": "🌍",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "gr_gte_1m"
  },
  "sort_order": 535
},
{
  "id": "tc_garimpeiro_primeira_viagem_1",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Garimpeiro de Primeira Viagem",
  "description": "Conquistar 1 filme com Global Reviews válido e menor que 5.000 (1 filme).",
  "icon": "⛏️",
  "target_type": "critic_tribunal_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "gr_lt_5k"
  },
  "sort_order": 536
},
{
  "id": "tc_sem_tomates_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Sem Tomates por Hoje",
  "description": "Conquistar 10 filmes onde APENAS o Rotten Tomatoes está N/A (enquanto o Metacritic possui nota válida) (10 filmes).",
  "icon": "🚫",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "only_rt_na"
  },
  "sort_order": 537
},
{
  "id": "tc_evidencia_nao_encontrada_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Evidência Não Encontrada (Metacritic em Branco)",
  "description": "Conquistar 10 filmes onde APENAS o Metacritic está N/A (enquanto o Rotten Tomatoes possui nota válida) (10 filmes).",
  "icon": "📂",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "only_mc_na"
  },
  "sort_order": 538
},
{
  "id": "tc_this_is_cinema_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: This is Cinema! (Selo IMDb de Qualidade)",
  "description": "Conquistar 10 filmes com IMDb válido e igual ou superior a 8.0 (10 filmes).",
  "icon": "🎥",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "imdb_gte_80"
  },
  "sort_order": 539
},
{
  "id": "tc_so_eu_nao_tinha_visto_15",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Só Eu que Não Tinha Visto?!",
  "description": "Conquistar 15 filmes com Global Reviews igual ou superior a 1.000.000 (15 filmes).",
  "icon": "🍿",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "gr_gte_1m"
  },
  "sort_order": 540
},
{
  "id": "tc_filme_ruim_muito_publico_5",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Filme Ruim com Muito Público",
  "description": "Conquistar 5 filmes com Global Reviews superior a 1.000.000 e nota no IMDb abaixo de 7.0 (5 filmes).",
  "icon": "📉",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "gr_gt_1m_imdb_lt_70"
  },
  "sort_order": 541
},
{
  "id": "tc_apenas_eu_diretor_atores_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Apenas Eu, o Diretor e os Atores!",
  "description": "Conquistar 10 filmes com Global Reviews válido e menor que 1.000 (10 filmes).",
  "icon": "🪑",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "gr_lt_1k"
  },
  "sort_order": 542
},
{
  "id": "tc_valeu_a_pena_garimpar_5",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Valeu a Pena Garimpar!",
  "description": "Conquistar 5 filmes com Global Reviews válido e menor que 10.000 e Minha Nota igual ou superior a 8.000 (5 filmes).",
  "icon": "💎",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "gr_lt_10k_ur_gte_8000"
  },
  "sort_order": 543
},
{
  "id": "tc_tomate_podre_vale_ouro_5",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Tomate Podre que Vale Ouro!",
  "description": "Conquistar 5 filmes com Rotten Tomatoes válido abaixo de 40% e Minha Nota igual ou superior a 7.500 (5 filmes).",
  "icon": "🤢",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "rt_lt_40_ur_gte_7500"
  },
  "sort_order": 544
},
{
  "id": "tc_hipocrisia_critica_chata_5",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Hipocrisia da Crítica Chata",
  "description": "Conquistar 5 filmes com Metacritic válido igual ou superior a 80 e Minha Nota igual ou inferior a 6.000 (5 filmes).",
  "icon": "🧐",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "mc_gte_80_ur_lte_6000"
  },
  "sort_order": 545
},
{
  "id": "tc_precisao_farmaceutico_15",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Precisão de Farmacêutico (3 Casas Decimais)",
  "description": "Conquistar 15 filmes onde a Minha Nota termina em fração específica diferente de .000 e .500 (ex: .750, .800, .323, .125) (15 filmes).",
  "icon": "🔬",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "ur_pharmacist_decimals"
  },
  "sort_order": 546
},
{
  "id": "tc_eu_declino_20",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Eu Declino!",
  "description": "Conquistar 20 filmes onde APENAS o Metacritic está N/A (com Rotten Tomatoes preenchido) (20 filmes).",
  "icon": "🙅",
  "target_type": "critic_tribunal_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "only_mc_na"
  },
  "sort_order": 547
},
{
  "id": "tc_filme_realmente_existe_30",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Esse Filme Realmente Existe?",
  "description": "Conquistar 30 filmes onde TANTO o Metacritic QUANTO o Rotten Tomatoes estão como N/A (30 filmes).",
  "icon": "👻",
  "target_type": "critic_tribunal_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "both_mc_rt_na"
  },
  "sort_order": 548
},
{
  "id": "tc_clube_dos_80_25",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: O Clube dos 80%",
  "description": "Conquistar 25 filmes com Rotten Tomatoes válido entre 80% e 89% (25 filmes).",
  "icon": "🥂",
  "target_type": "critic_tribunal_rule",
  "target_value": 25,
  "target_metadata": {
    "ruleKey": "rt_80_to_89"
  },
  "sort_order": 549
},
{
  "id": "tc_copo_meio_cheio_15",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Copo Meio Cheio (Absolvido no Limite)",
  "description": "Conquistar 15 filmes onde a Minha Nota está na faixa moderada entre 6.000 e 7.000 (15 filmes).",
  "icon": "🥛",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "ur_6000_to_7000"
  },
  "sort_order": 550
},
{
  "id": "tc_julgamento_popular_20",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Julgamento Popular (Meio Milhão na Sala)",
  "description": "Conquistar 20 filmes com Global Reviews entre 500.000 e 1.000.000 (20 filmes).",
  "icon": "🏟️",
  "target_type": "critic_tribunal_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "gr_500k_to_1m"
  },
  "sort_order": 551
},
{
  "id": "tc_apelacao_negada_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Apelação Negada (Aprovado em Segunda Instância)",
  "description": "Conquistar 10 filmes onde o IMDb está abaixo de 6.5, mas o Metacritic está acima de 70 (10 filmes).",
  "icon": "👨‍⚖️",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "imdb_lt_65_mc_gt_70"
  },
  "sort_order": 552
},
{
  "id": "tc_inesqueciveis_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Inesquecíveis! (A Prateleira Mais Alta)",
  "description": "Conquistar 10 filmes com Minha Nota igual ou superior a 9.500 (10 filmes).",
  "icon": "🌟",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "ur_gte_9500"
  },
  "sort_order": 553
},
{
  "id": "tc_fundo_da_internet_5",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Tive que Cavar até o Fundo da Internet!",
  "description": "Conquistar 5 filmes com Global Reviews válido e menor que 100 avaliações (5 filmes).",
  "icon": "🕳️",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "gr_lt_100"
  },
  "sort_order": 554
},
{
  "id": "tc_eu_gostei_importa_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Eu Gostei e É o que Importa!",
  "description": "Conquistar 10 filmes com Minha Nota igual ou superior a 9.000 e nota no IMDb abaixo de 6.0 (10 filmes).",
  "icon": "😎",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "ur_gte_9000_imdb_lt_60"
  },
  "sort_order": 555
},
{
  "id": "tc_desculpe_senhor_juiz_5",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Desculpe, Senhor Juiz, Mas Não Sabemos se o Réu É Culpado!",
  "description": "Conquistar 5 filmes com as 4 notas válidas e uma diferença de pelo menos 4.0 pontos na escala 10 entre a maior e a menor nota do filme (5 filmes).",
  "icon": "🤯",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "four_scores_spread_40"
  },
  "sort_order": 556
},
{
  "id": "tc_reu_culpado_3_a_1_15",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: O Réu É Culpado por 3 a 1 Votos!",
  "description": "Conquistar 15 filmes onde a Minha Nota seja maior que 8.000, o IMDb seja menor que 6.0, o Metacritic seja menor que 50 e o Rotten Tomatoes seja menor que 50% (15 filmes).",
  "icon": "🔨",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "ur_gt_8000_imdb_lt_60_mc_lt_50_rt_lt_50"
  },
  "sort_order": 557
},
{
  "id": "tc_fantasma_no_catalogo_50",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Fantasma no Catálogo (Lenda Urbana Completa)",
  "description": "Conquistar 50 filmes onde TANTO o Metacritic QUANTO o Rotten Tomatoes estão como N/A (50 filmes).",
  "icon": "🕵️",
  "target_type": "critic_tribunal_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "both_mc_rt_na"
  },
  "sort_order": 558
},
{
  "id": "tc_100_aprovacao_3",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: 100% de Aprovação (A Crítica em Pânico!)",
  "description": "Conquistar 3 filmes com Rotten Tomatoes perfeito de 100% (3 filmes).",
  "icon": "💯",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "rt_eq_100"
  },
  "sort_order": 559
},
{
  "id": "tc_metacritica_sem_alma_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Metacrítica Sem Alma",
  "description": "Conquistar 10 filmes com Metacritic válido igual ou superior a 90 (10 filmes).",
  "icon": "🏛️",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "mc_gte_90"
  },
  "sort_order": 560
},
{
  "id": "tc_bomba_atomica_submarina_3",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Bomba Atômica Submarina (O Lendário 1.100!)",
  "description": "Conquistar 3 filmes com Minha Nota igual ou inferior a 2.000 e IMDb abaixo de 5.0 (3 filmes).",
  "icon": "☢️",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "ur_lte_2000_imdb_lt_50"
  },
  "sort_order": 561
},
{
  "id": "tc_bolha_de_hollywood_30",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: A Bolha de Hollywood",
  "description": "Conquistar 30 filmes com Global Reviews igual ou superior a 1.000.000 (30 filmes).",
  "icon": "🫧",
  "target_type": "critic_tribunal_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "gr_gte_1m"
  },
  "sort_order": 562
},
{
  "id": "tc_nem_minha_mae_conhece_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Nem a Minha Mãe Conhece Esse Filme",
  "description": "Conquistar 10 filmes com Global Reviews válido entre 100 e 500 avaliações (10 filmes).",
  "icon": "🙈",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "gr_100_to_500"
  },
  "sort_order": 563
},
{
  "id": "tc_panteao_dos_8_25",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: O Panteão dos 8.0",
  "description": "Conquistar 25 filmes com IMDb válido e igual ou superior a 8.0 (25 filmes).",
  "icon": "🏆",
  "target_type": "critic_tribunal_rule",
  "target_value": 25,
  "target_metadata": {
    "ruleKey": "imdb_gte_80"
  },
  "sort_order": 564
},
{
  "id": "tc_amo_fundo_coracao_20",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Amo do Fundo do Meu Coração!",
  "description": "Conquistar 20 filmes com Minha Nota igual ou superior a 9.500 (20 filmes).",
  "icon": "❤️‍🔥",
  "target_type": "critic_tribunal_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "ur_gte_9500"
  },
  "sort_order": 565
},
{
  "id": "tc_melhor_filme_vai_para_5",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: E o Troféu de Melhor Filme Vai Para...",
  "description": "Conquistar 5 filmes com Minha Nota igual ou superior a 9.700 (5 filmes).",
  "icon": "🎬",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "ur_gte_9700"
  },
  "sort_order": 566
},
{
  "id": "tc_amados_por_todos_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Amados por Todos (O Raro Alinhamento dos Planetas!)",
  "description": "Conquistar 10 filmes com todas as notas preenchidas onde Minha Nota >= 9.000, IMDb >= 8.0, Rotten Tomatoes >= 90% e Metacritic >= 90 (10 filmes).",
  "icon": "🪐",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "ur_90_imdb_80_rt_90_mc_90"
  },
  "sort_order": 567
},
{
  "id": "tc_regua_mais_fina_50",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: A Régua Mais Fina do Cinema",
  "description": "Conquistar 50 filmes com Minha Nota igual ou superior a 8.500 (50 filmes).",
  "icon": "📏",
  "target_type": "critic_tribunal_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "ur_gte_8500"
  },
  "sort_order": 568
},
{
  "id": "tc_inimigo_criticos_intelectuais_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Inimigo Público dos Críticos Intelectuais",
  "description": "Conquistar 10 filmes com nota vermelha na crítica (Metacritic válido < 45 ou Rotten Tomatoes válido < 45%) e Minha Nota >= 8.500 (10 filmes).",
  "icon": "😈",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "red_critic_lt_45_ur_gte_8500"
  },
  "sort_order": 569
},
{
  "id": "tc_grande_jurado_massas_40",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: O Grande Jurado das Massas",
  "description": "Conquistar 40 filmes com IMDb válido >= 8.0 e Rotten Tomatoes válido >= 85% (40 filmes).",
  "icon": "👑",
  "target_type": "critic_tribunal_rule",
  "target_value": 40,
  "target_metadata": {
    "ruleKey": "imdb_gte_80_rt_gte_85"
  },
  "sort_order": 570
},
{
  "id": "tc_arquivo_obscuro_sonhos_15",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Arquivo Obscuro dos Sonhos",
  "description": "Conquistar 15 filmes com Global Reviews válido menor que 5.000 e Minha Nota >= 8.500 (15 filmes).",
  "icon": "📜",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "gr_lt_5k_ur_gte_8500"
  },
  "sort_order": 571
},
{
  "id": "tc_desacato_autoridade_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Desacato à Autoridade (Gosto Duvidoso com Orgulho!)",
  "description": "Conquistar 10 filmes com nota no IMDb abaixo de 5.0 e Minha Nota igual ou superior a 7.500 (10 filmes).",
  "icon": "🫡",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "imdb_lt_50_ur_gte_7500"
  },
  "sort_order": 572
},
{
  "id": "tc_checkpoint_777_7",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Tribunal da Crítica: Checkpoint 777 (O Número da Sorte do Tribunal)",
  "description": "Conquistar 7 filmes onde TODAS as métricas estão no intervalo do 7: Minha Nota entre 7.000 e 7.999, IMDb entre 7.0 e 7.9, Rotten Tomatoes entre 70% e 79%, Metacritic entre 70 e 79 e Global Reviews entre 700.000 e 799.999 (7 filmes).",
  "icon": "🎰",
  "target_type": "critic_tribunal_rule",
  "target_value": 7,
  "target_metadata": {
    "ruleKey": "checkpoint_777"
  },
  "sort_order": 573
},
{
  "id": "tc_olimpo_9800_3",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Tribunal da Crítica: O Olimpo do 9.800 (A Perfeição Quase Inatingível)",
  "description": "Conquistar 3 filmes com Minha Nota igual ou superior a 9.750 (3 filmes).",
  "icon": "⚡",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "ur_gte_9750"
  },
  "sort_order": 574
},
{
  "id": "tc_unanimidade_absoluta_20",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Tribunal da Crítica: A Unanimidade Absoluta das Telas",
  "description": "Conquistar 20 filmes onde Minha Nota >= 9.000, IMDb >= 8.0, Rotten Tomatoes >= 88% e Metacritic >= 85 (20 filmes).",
  "icon": "🌌",
  "target_type": "critic_tribunal_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "ur_90_imdb_80_rt_88_mc_85"
  },
  "sort_order": 575
},
{
  "id": "tc_arqueologo_supremo_10",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Tribunal da Crítica: Arqueólogo Supremo do Cinema Perdido",
  "description": "Conquistar 10 filmes com Global Reviews válido e menor que 100.000 avaliações e Minha Nota igual ou superior a 8.000 (10 filmes).",
  "icon": "🏺",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "gr_lt_100k_ur_gte_8000"
  },
  "sort_order": 576
},
{
  "id": "tc_voz_das_multidoes_50",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Tribunal da Crítica: A Voz das Multidões",
  "description": "Conquistar 50 filmes com Global Reviews igual ou superior a 1.000.000 (50 filmes).",
  "icon": "📢",
  "target_type": "critic_tribunal_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "gr_gte_1m"
  },
  "sort_order": 577
},
{
  "id": "tc_hybrid_vergonha_franca_1",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Você É a Vergonha da Profissão! (Jacquin Decepcionado)",
  "description": "Conquistar 1 filme produzido na França com Minha Nota menor que 5.000 (1 filme).",
  "icon": "👨‍🍳",
  "target_type": "critic_tribunal_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "fr_ur_lt_5000",
    "isHybrid": true
  },
  "sort_order": 578
},
{
  "id": "tc_hybrid_no_more_mutants_1",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: No More Mutants! (Nem a Feiticeira Escarlate Tankou)",
  "description": "Conquistar 1 filme com a tag X-Men com Minha Nota abaixo de 7.000 (1 filme).",
  "icon": "🧬",
  "target_type": "critic_tribunal_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "xmen_ur_lt_7000",
    "isHybrid": true
  },
  "sort_order": 579
},
{
  "id": "tc_hybrid_papai_noel_bom_3",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Papai Noel Trouxe um Filme Bom de Presente!",
  "description": "Conquistar 3 filmes com a tag Natal com Minha Nota acima de 7.000 (3 filmes).",
  "icon": "🎅",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "natal_ur_gt_7000",
    "isHybrid": true
  },
  "sort_order": 580
},
{
  "id": "tc_hybrid_game_over_orgulho_3",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Game Over na Crítica, Mas Eu Zerei com Orgulho!",
  "description": "Conquistar 3 filmes com a tag Baseado em jogo que tenham Rotten Tomatoes abaixo de 50%, mas Minha Nota igual ou superior a 7.000 (3 filmes).",
  "icon": "🎮",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "game_rt_lt_50_ur_gte_7000",
    "isHybrid": true
  },
  "sort_order": 581
},
{
  "id": "tc_hybrid_rir_coisa_seria_5",
  "category": "tribunal_critica",
  "categories": [
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Rir É Coisa Séria! (Comédia Aclamada)",
  "description": "Conquistar 5 filmes do gênero Comédia com Minha Nota igual ou superior a 8.500 (5 filmes).",
  "icon": "😂",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "comedia_ur_gte_8500",
    "isHybrid": true
  },
  "sort_order": 582
},
{
  "id": "tc_hybrid_sexta_13_baixo_orcamento_2",
  "category": "tribunal_critica",
  "categories": [
    "anatomia_cinema",
    "data_limite",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Tribunal da Crítica: Sexta-Feira 13 de Baixo Orçamento (E Nota Baixa!)",
  "description": "Conquistar 2 filmes do gênero Terror com IMDb abaixo de 5.5 assistidos no mês de Outubro (2 filmes).",
  "icon": "🔪",
  "target_type": "critic_tribunal_rule",
  "target_value": 2,
  "target_metadata": {
    "ruleKey": "terror_imdb_lt_55_outubro",
    "isHybrid": true
  },
  "sort_order": 583
},
{
  "id": "tc_hybrid_tribunal_estrangeiro_5",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Tribunal Estrangeiro (Sucesso Global Fora da Bolha)",
  "description": "Conquistar 5 filmes que tiveram mais de 1.000.000 (1.0M) de Global Reviews e NÃO foram produzidos nos Estados Unidos (5 filmes).",
  "icon": "🌍",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "non_us_gr_gt_1m",
    "isHybrid": true
  },
  "sort_order": 584
},
{
  "id": "tc_hybrid_brasil_mundo_5",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Do Brasil para o Mundo!",
  "description": "Conquistar 5 filmes do Brasil com mais de 100.000 Global Reviews (5 filmes).",
  "icon": "🇧🇷",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "br_gr_gt_100k",
    "isHybrid": true
  },
  "sort_order": 585
},
{
  "id": "tc_hybrid_gravado_meu_bairro_5",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Foi Gravado Aqui no Meu Bairro?!",
  "description": "Conquistar 5 filmes do Brasil com menos de 1.000 Global Reviews (5 filmes).",
  "icon": "🏘️",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "br_gr_lt_1k",
    "isHybrid": true
  },
  "sort_order": 586
},
{
  "id": "tc_hybrid_a24_acima_8_5",
  "category": "tribunal_critica",
  "categories": [
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Estranhamente Bom! (O Selo Cult Não Falha)",
  "description": "Conquistar 5 filmes da distribuidora A24 com Minha Nota acima de 8.000 (5 filmes).",
  "icon": "💎",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "a24_ur_gt_8000",
    "isHybrid": true
  },
  "sort_order": 587
},
{
  "id": "tc_hybrid_oscar_baixo_reviews_5",
  "category": "tribunal_critica",
  "categories": [
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: O Diretor Fez com Troco de Pão e Ainda Levou uma Estatueta!",
  "description": "Conquistar 5 filmes Ganhadores do Oscar que tiveram menos de 300.000 Global Reviews (5 filmes).",
  "icon": "🏆",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "oscar_winner_gr_lt_300k",
    "isHybrid": true
  },
  "sort_order": 588
},
{
  "id": "tc_hybrid_agosto_ouro_15",
  "category": "tribunal_critica",
  "categories": [
    "data_limite",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: De Presente, um Filme Bom! (Agosto de Ouro)",
  "description": "Conquistar 15 filmes com Minha Nota acima de 7.000 assistidos no mês de Agosto (15 filmes).",
  "icon": "🎁",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "agosto_ur_gt_7000",
    "isHybrid": true
  },
  "sort_order": 589
},
{
  "id": "tc_hybrid_gore_rt_90_3",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Muitos Tomates Vermelhos (Sangue Fresco Certificado!)",
  "description": "Conquistar 3 filmes com a tag Gore e aprovação acima de 90% no Rotten Tomatoes (3 filmes).",
  "icon": "🍅",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "gore_rt_gt_90",
    "isHybrid": true
  },
  "sort_order": 590
},
{
  "id": "tc_hybrid_musica_nota_9_3",
  "category": "tribunal_critica",
  "categories": [
    "anatomia_cinema",
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Dance Como um Campeão! (Nota Máxima no Ritmo)",
  "description": "Conquistar 3 filmes do gênero Música com Minha Nota acima de 9.000 (3 filmes).",
  "icon": "🎵",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "musica_ur_gt_9000",
    "isHybrid": true
  },
  "sort_order": 591
},
{
  "id": "tc_hybrid_paradoxo_shyamalan_2",
  "category": "tribunal_critica",
  "categories": [
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Ele Acerta no Alvo ou Erra Muito Feio! (Paradoxo de Shyamalan)",
  "description": "Conquistar pelo menos 1 filme do diretor M. Night Shyamalan com Minha Nota acima de 8.000 e 1 filme dele com Minha Nota menor que 6.000 (2 filmes).",
  "icon": "🎯",
  "target_type": "hybrid_shyamalan_paradox",
  "target_value": 2,
  "target_metadata": {
    "director": "M. Night Shyamalan",
    "isHybrid": true
  },
  "sort_order": 592
},
{
  "id": "tc_hybrid_marvel_dc_acima_85_10",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: Fadiga de Super-Herói?! Aqui Não!",
  "description": "Conquistar 10 filmes com a tag Marvel ou DC que tenham Minha Nota acima de 8.500 (10 filmes).",
  "icon": "🦸",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "marvel_dc_ur_gt_8500",
    "isHybrid": true
  },
  "sort_order": 593
},
{
  "id": "tc_hybrid_stephen_king_juiz_5",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Tribunal da Crítica: O Rei do Terror Aprovado pelo Juiz!",
  "description": "Conquistar 5 filmes com a tag SK (Stephen King) com Minha Nota igual ou superior a 8.000 (5 filmes).",
  "icon": "👑",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "sk_ur_gte_8000",
    "isHybrid": true
  },
  "sort_order": 594
},
{
  "id": "tc_hybrid_juiz_juri_carrasco_5",
  "category": "tribunal_critica",
  "categories": [
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Eu Sou o Juiz, o Júri e o Carrasco!",
  "description": "Conquistar 5 filmes que foram aclamados pelo \"Júri\" (Indicados ou Ganhadores do Oscar E com Rotten Tomatoes >= 80% ou IMDb >= 7.5), mas que você executou como \"Carrasco\" dando Minha Nota menor ou igual a 6.000 (5 filmes).",
  "icon": "⚖️",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "oscar_acclaimed_ur_lte_6000",
    "isHybrid": true
  },
  "sort_order": 595
},
{
  "id": "tc_hybrid_medo_bom_terror_20",
  "category": "tribunal_critica",
  "categories": [
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Me Deu Medo, Mas Foi um Medo Bom! (Ou Não)",
  "description": "Conquistar 20 filmes do gênero Terror com Minha Nota acima de 8.000 (20 filmes).",
  "icon": "👻",
  "target_type": "critic_tribunal_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "terror_ur_gt_8000",
    "isHybrid": true
  },
  "sort_order": 596
},
{
  "id": "tc_hybrid_chorei_certeza_15",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Eu Chorei com Toda Certeza! (Coração Destruído)",
  "description": "Conquistar 15 filmes com Minha Nota acima de 8.000 que tenham as tags Emocionante e Abuso Familiar no mesmo filme (15 filmes).",
  "icon": "😭",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "emocionante_abuso_familiar_ur_gt_8000",
    "isHybrid": true
  },
  "sort_order": 597
},
{
  "id": "tc_hybrid_brazil_devastated_3",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Brazil, I'm Devastated! (Obra-Prima Nacional)",
  "description": "Conquistar 3 filmes produzidos no Brasil, do gênero Drama, com Minha Nota acima de 9.000 (3 filmes).",
  "icon": "🎭",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "br_drama_ur_gt_9000",
    "isHybrid": true
  },
  "sort_order": 598
},
{
  "id": "tc_hybrid_nerd_canto_oscar_20",
  "category": "tribunal_critica",
  "categories": [
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Eu Sou o Nerd no Canto da Escola!",
  "description": "Conquistar 20 filmes Ganhadores do Oscar que tiveram menos de 500.000 Global Reviews (20 filmes).",
  "icon": "🤓",
  "target_type": "critic_tribunal_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "oscar_winner_gr_lt_500k",
    "isHybrid": true
  },
  "sort_order": 599
},
{
  "id": "tc_hybrid_final_epico_nota_9_15",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Final Épico de Verdade (Proibido Dar Nota Baixa!)",
  "description": "Conquistar 15 filmes com a tag Final Epico que tenham Minha Nota acima de 9.000 (15 filmes).",
  "icon": "🔥",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "final_epico_ur_gt_9000",
    "isHybrid": true
  },
  "sort_order": 600
},
{
  "id": "tc_hybrid_animacao_aula_adulto_10",
  "category": "tribunal_critica",
  "categories": [
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Desenho Animado Que Dá Aula pra Muito Filme Adulto!",
  "description": "Conquistar 10 filmes do gênero Animação com Minha Nota acima de 8.500 e Rotten Tomatoes acima de 90% (10 filmes).",
  "icon": "🎨",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "animacao_ur_gt_8500_rt_gt_90",
    "isHybrid": true
  },
  "sort_order": 601
},
{
  "id": "tc_hybrid_fatos_reais_superam_ficcao_8",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Fatos Reais que Superam a Ficção!",
  "description": "Conquistar 8 filmes do gênero Biografia, História ou Documentário com a tag Fatos Reais e Minha Nota acima de 8.500 (8 filmes).",
  "icon": "📜",
  "target_type": "critic_tribunal_rule",
  "target_value": 8,
  "target_metadata": {
    "ruleKey": "fatos_reais_bio_hist_doc_ur_gt_8500",
    "isHybrid": true
  },
  "sort_order": 602
},
{
  "id": "tc_hybrid_gema_escondida_mapa_10",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Gema Escondida no Mapa-Múndi (Garimpo Internacional)",
  "description": "Conquistar 10 filmes produzidos fora dos Estados Unidos e fora do Brasil com menos de 50.000 Global Reviews e Minha Nota acima de 8.000 (10 filmes).",
  "icon": "🧭",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "non_us_non_br_gr_lt_50k_ur_gt_8000",
    "isHybrid": true
  },
  "sort_order": 603
},
{
  "id": "tc_hybrid_blumhouse_terror_suspense_5",
  "category": "tribunal_critica",
  "categories": [
    "anatomia_cinema",
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Blumhouse: Barato, Assustador e Nota Alta!",
  "description": "Conquistar 5 filmes do estúdio Blumhouse Productions do gênero Terror ou Suspense com Minha Nota acima de 8.000 (5 filmes).",
  "icon": "🏠",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "blumhouse_terror_suspense_ur_gt_8000",
    "isHybrid": true
  },
  "sort_order": 604
},
{
  "id": "tc_hybrid_dezembro_gala_10",
  "category": "tribunal_critica",
  "categories": [
    "data_limite",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Tribunal da Crítica: Dezembro de Gala (Terminando o Ano só com Filmão!)",
  "description": "Conquistar 10 filmes assistidos no mês de Dezembro com Minha Nota igual ou superior a 8.500 (10 filmes).",
  "icon": "🎄",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "dezembro_ur_gte_8500",
    "isHybrid": true
  },
  "sort_order": 605
},
{
  "id": "tc_hybrid_desmascarando_top250_3",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Nem Todo Top 250 Me Engana! (Desmascarando o IMDb)",
  "description": "Conquistar 3 filmes com a tag TOP250 aos quais você deu Minha Nota abaixo de 7.500 (3 filmes).",
  "icon": "🎭",
  "target_type": "critic_tribunal_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "top250_ur_lt_7500",
    "isHybrid": true
  },
  "sort_order": 606
},
{
  "id": "tc_hybrid_oasis_deserto_terror_10",
  "category": "tribunal_critica",
  "categories": [
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Oásis no Deserto do Terror (Eles Odeiam, Eu Amo!)",
  "description": "Conquistar 10 filmes do gênero Terror que têm nota abaixo de 6.5 no IMDb, mas receberam Minha Nota acima de 8.000 (10 filmes).",
  "icon": "🏜️",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "terror_imdb_lt_65_ur_gt_8000",
    "isHybrid": true
  },
  "sort_order": 607
},
{
  "id": "tc_hybrid_obras_primas_15_paises_15",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Obras-Primas dos Quatro Cantos do Planeta",
  "description": "Conquistar 15 filmes de 15 países diferentes (excluindo os EUA) que tenham Minha Nota igual ou superior a 8.500 (15 países).",
  "icon": "🌐",
  "target_type": "hybrid_15_countries_masterpieces",
  "target_value": 15,
  "target_metadata": {
    "minRating": 8.5,
    "isHybrid": true
  },
  "sort_order": 608
},
{
  "id": "tc_hybrid_orgulho_aclamado_lgbt_10",
  "category": "tribunal_critica",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: Orgulho Aclamado pela Crítica e pelo Meu Coração",
  "description": "Conquistar 10 filmes do gênero Drama ou Romance com a tag Personagem LGBT que tenham Minha Nota acima de 8.500 e Rotten Tomatoes acima de 80% (10 filmes).",
  "icon": "🌈",
  "target_type": "critic_tribunal_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "lgbt_drama_romance_ur_gt_8500_rt_gt_80",
    "isHybrid": true
  },
  "sort_order": 609
},
{
  "id": "tc_hybrid_elite_mafia_oscar_15",
  "category": "tribunal_critica",
  "categories": [
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Tribunal da Crítica: A Elite da Máfia (Diretores Favoritos no Topo)",
  "description": "Conquistar 15 filmes Ganhadores do Oscar que receberam Minha Nota igual ou superior a 9.000 (15 filmes).",
  "icon": "🎩",
  "target_type": "critic_tribunal_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "oscar_winner_ur_gte_9000",
    "isHybrid": true
  },
  "sort_order": 610
},
{
  "id": "tc_hybrid_santissima_trindade_6_cats_5",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "anatomia_cinema",
    "data_limite",
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Tribunal da Crítica: A Santíssima Trindade do Catálogo (6 Categorias num Só Troféu!)",
  "description": "Conquistar 5 filmes lendários que cumpram simultaneamente: Minha Nota >= 9.000 + IMDb >= 8.0, Indicado ou Ganhador do Oscar, Tag TOP250 ou Final Epico, pelo menos 2 gêneros oficiais e País + Mês registrados (5 filmes).",
  "icon": "🔱",
  "target_type": "critic_tribunal_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "santissima_trindade_6_cats",
    "isHybrid": true
  },
  "sort_order": 611
},
{
  "id": "tc_hybrid_curador_joias_raras_15",
  "category": "tribunal_critica",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "anatomia_cinema",
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Tribunal da Crítica: Curador Mundial de Joias Raras",
  "description": "Conquistar 15 filmes com menos de 50.000 Global Reviews que tenham Minha Nota >= 8.500, pelo menos 1 Tag Pessoal e pertençam a pelo menos 8 países diferentes (15 filmes).",
  "icon": "💎",
  "target_type": "hybrid_curador_joias_raras",
  "target_value": 15,
  "target_metadata": {
    "maxReviews": 50000,
    "minRating": 8.5,
    "minCountries": 8,
    "isHybrid": true
  },
  "sort_order": 612
},
{
  "id": "tc_suprema_corte_plat",
  "category": "tribunal_critica",
  "categories": [
    "tribunal_critica"
  ],
  "tier": "platinum",
  "title": "Tribunal da Crítica: A Suprema Corte do Cinema",
  "description": "Conquistar TODOS os troféus da categoria Tribunal da Crítica (desbloqueio automático dinâmico ao atingir 100% dos outros 82 troféus desta categoria).",
  "icon": "🏆",
  "target_type": "platinum_dynamic",
  "target_value": 82,
  "target_metadata": {
    "category": "tribunal_critica",
    "categoryScope": "tribunal_critica"
  },
  "sort_order": 613
},
{
  "id": "rc_bronze_cinema_15",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Saindo de Casa!",
  "description": "Conquistar 15 filmes assistidos no Cinema (15 filmes).",
  "icon": "🎟️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "cinema_count"
  },
  "sort_order": 614
},
{
  "id": "rc_bronze_original_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Me Sinto Tendo 3 Anos (Cadê a Tradução?!)",
  "description": "Conquistar 5 filmes assistidos no idioma Original (5 filmes).",
  "icon": "👶",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "audio_original_count"
  },
  "sort_order": 615
},
{
  "id": "rc_bronze_curta_15min_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Mas Já Acabou?! (Pisquei e Perdi)",
  "description": "Conquistar 10 filmes com 15 minutos ou menos de duração (10 filmes).",
  "icon": "⚡",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "runtime_lte_15"
  },
  "sort_order": 616
},
{
  "id": "rc_bronze_exato_120min_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: 2 Horas em Ponto!",
  "description": "Conquistar 5 filmes com minutagem exata de 120 minutos (5 filmes).",
  "icon": "⏱️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "runtime_eq_120"
  },
  "sort_order": 617
},
{
  "id": "rc_bronze_midia_fisica_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Tenho Mais Jogos em Mídia Física do que Isso!",
  "description": "Conquistar 10 filmes assistidos em Blu-ray ou DVD (10 filmes).",
  "icon": "💿",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "physical_media_count"
  },
  "sort_order": 618
},
{
  "id": "rc_bronze_youtube_legendado_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Pelo Menos Dá pra Ler (Mais ou Menos...)",
  "description": "Conquistar 5 filmes com áudio Legendado pelo YouTube (5 filmes).",
  "icon": "💬",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "youtube_subtitled_count"
  },
  "sort_order": 619
},
{
  "id": "rc_bronze_youtube_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: O YouTube Passa Filme Inteiro?!",
  "description": "Conquistar 10 filmes assistidos no YouTube (10 filmes).",
  "icon": "▶️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "youtube_count"
  },
  "sort_order": 620
},
{
  "id": "rc_bronze_cinema_legendado_3",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Talvez Não Tinha Sessão Dublada?",
  "description": "Conquistar 3 filmes assistidos no Cinema com áudio Legendado (3 filmes).",
  "icon": "🕶️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "cinema_legendado_count"
  },
  "sort_order": 621
},
{
  "id": "rc_bronze_dublado_50",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Versão Brasileira: Herbert Richers!",
  "description": "Conquistar 50 filmes com áudio Dublado (50 filmes).",
  "icon": "🎙️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "audio_dublado_count"
  },
  "sort_order": 622
},
{
  "id": "rc_bronze_legendado_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Treinando a Leitura Dinâmica",
  "description": "Conquistar 30 filmes com áudio Legendado (30 filmes).",
  "icon": "📖",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "audio_legendado_count"
  },
  "sort_order": 623
},
{
  "id": "rc_bronze_ano_1994_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Esse Filme É em Minha Homenagem! (Ou Não)",
  "description": "Conquistar 5 filmes lançados no ano de 1994 (5 filmes).",
  "icon": "🎂",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "year_eq_1994"
  },
  "sort_order": 624
},
{
  "id": "rc_bronze_ano_2012_3",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: O Mundo Não Ia Acabar?!",
  "description": "Conquistar 3 filmes lançados no ano de 2012 (3 filmes).",
  "icon": "☄️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "year_eq_2012"
  },
  "sort_order": 625
},
{
  "id": "rc_bronze_lancamento_mesmo_ano_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: No Dia do Lançamento (Ou Pelo Menos no Ano)",
  "description": "Conquistar 10 filmes onde o Ano de Lançamento e o Ano Visto são iguais (10 filmes).",
  "icon": "🆕",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "same_year_seen_release"
  },
  "sort_order": 626
},
{
  "id": "rc_bronze_anos_1920_1940_3",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: O Começo de Tudo!",
  "description": "Conquistar 3 filmes lançados entre 1920 e 1940 (3 filmes).",
  "icon": "🎞️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "year_between_1920_1940"
  },
  "sort_order": 627
},
{
  "id": "rc_bronze_prime_video_mesmo_ano_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "O Ritual do Cinéfilo: Mais Rápido que o Frete!",
  "description": "Conquistar 10 filmes no Prime Video onde o Ano de Lançamento e o Ano Visto são iguais (10 filmes).",
  "icon": "📦",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "prime_video_same_year"
  },
  "sort_order": 628
},
{
  "id": "rc_silver_cinema_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Não Vão Pegar Meu Celular!! ...Pegaram Meu Celular :(",
  "description": "Conquistar 30 filmes assistidos no Cinema (30 filmes).",
  "icon": "📱",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "cinema_count"
  },
  "sort_order": 629
},
{
  "id": "rc_silver_original_15",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Sorria e Acene, Rapazes! Sorria e Acene...",
  "description": "Conquistar 15 filmes no idioma Original (15 filmes).",
  "icon": "🐧",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "audio_original_count"
  },
  "sort_order": 630
},
{
  "id": "rc_silver_duracao_lte_60_20",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Dá pra Ver no Meu Almoço (Ou Quase)",
  "description": "Conquistar 20 filmes com 60 minutos ou menos de duração (20 filmes).",
  "icon": "🥪",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "runtime_lte_60"
  },
  "sort_order": 631
},
{
  "id": "rc_silver_duracao_gt_150_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Acaba, Pelo Amor de Deus, Acaba!",
  "description": "Conquistar 10 filmes com mais de 150 minutos de duração (10 filmes).",
  "icon": "🥱",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "runtime_gt_150"
  },
  "sort_order": 632
},
{
  "id": "rc_silver_duracao_gt_180_3",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Eram Duas Horas?! Mentira, Já São Três!",
  "description": "Conquistar 3 filmes com mais de 180 minutos de duração (3 filmes).",
  "icon": "⏳",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "runtime_gt_180"
  },
  "sort_order": 633
},
{
  "id": "rc_silver_midia_fisica_35",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Eu Tenho Quase o Mesmo Número de Jogos Físicos!",
  "description": "Conquistar 35 filmes assistidos em Blu-ray ou DVD (35 filmes).",
  "icon": "🎮",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 35,
  "target_metadata": {
    "ruleKey": "physical_media_count"
  },
  "sort_order": 634
},
{
  "id": "rc_silver_youtube_25",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: As Propagandas São um Saco! (Cadê o AdBlock?!)",
  "description": "Conquistar 25 filmes assistidos no YouTube (25 filmes).",
  "icon": "🛑",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 25,
  "target_metadata": {
    "ruleKey": "youtube_count"
  },
  "sort_order": 635
},
{
  "id": "rc_silver_cinema_gt_150min_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Pelo Menos a Poltrona do Cinema Era Confortável!",
  "description": "Conquistar 5 filmes com mais de 150 minutos assistidos no Cinema (5 filmes).",
  "icon": "💺",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "cinema_gt_150min"
  },
  "sort_order": 636
},
{
  "id": "rc_silver_hbo_max_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Qual Era o Nome Mesmo? HBO, HBO Max ou Só Max?!",
  "description": "Conquistar 30 filmes assistidos na HBO Max (30 filmes).",
  "icon": "💜",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "hbo_max_count"
  },
  "sort_order": 637
},
{
  "id": "rc_silver_netflix_50",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Chapolin Colorado: \"Sigam-me os Bons... Digo, TUDUM!\"",
  "description": "Conquistar 50 filmes assistidos na Netflix (50 filmes).",
  "icon": "🔴",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "netflix_count"
  },
  "sort_order": 638
},
{
  "id": "rc_silver_internet_25",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Tive que Ir até a Deep Web Buscar Essa Cópia!",
  "description": "Conquistar 25 filmes assistidos na Internet (25 filmes).",
  "icon": "🌐",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 25,
  "target_metadata": {
    "ruleKey": "internet_count"
  },
  "sort_order": 639
},
{
  "id": "rc_silver_dublado_150",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Cineasta da Sessão da Tarde",
  "description": "Conquistar 150 filmes com áudio Dublado (150 filmes).",
  "icon": "📺",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 150,
  "target_metadata": {
    "ruleKey": "audio_dublado_count"
  },
  "sort_order": 640
},
{
  "id": "rc_silver_legendado_90",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Olhos Rápidos de Águia",
  "description": "Conquistar 90 filmes com áudio Legendado (90 filmes).",
  "icon": "🦅",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 90,
  "target_metadata": {
    "ruleKey": "audio_legendado_count"
  },
  "sort_order": 641
},
{
  "id": "rc_silver_lancamento_mesmo_ano_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Lançamento!",
  "description": "Conquistar 30 filmes onde o Ano de Lançamento e o Ano Visto são iguais (30 filmes).",
  "icon": "🚀",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "same_year_seen_release"
  },
  "sort_order": 642
},
{
  "id": "rc_silver_streaming_livre_mesmo_ano_20",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Pesquei um Peixe Novinho (Ou Quase)!",
  "description": "Conquistar 20 filmes onde o Ano de Lançamento e o Ano Visto são iguais assistidos no My Family Cine, Internet ou YouTube (20 filmes).",
  "icon": "🎣",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "free_streaming_same_year"
  },
  "sort_order": 643
},
{
  "id": "rc_silver_esperar_streaming_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Vamos Esperar Sair no Streaming!",
  "description": "Conquistar 30 filmes assistidos com pelo menos 1 ano após o lançamento (Ano Visto > Ano de Lançamento) (30 filmes).",
  "icon": "🛋️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "seen_after_release_year"
  },
  "sort_order": 644
},
{
  "id": "rc_silver_antes_1994_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Antes de Eu Nascer!",
  "description": "Conquistar 30 filmes lançados antes de 1994 (30 filmes).",
  "icon": "👶",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "year_lt_1994"
  },
  "sort_order": 645
},
{
  "id": "rc_silver_antes_1958_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Antes dos Meus Pais Nascerem!",
  "description": "Conquistar 10 filmes lançados antes de 1958 (10 filmes).",
  "icon": "📻",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "year_lt_1958"
  },
  "sort_order": 646
},
{
  "id": "rc_silver_bug_milenio_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: O Bug do Milênio!",
  "description": "Conquistar 10 filmes lançados nos anos de 1999 ou 2000 (10 filmes).",
  "icon": "💾",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "year_1999_or_2000"
  },
  "sort_order": 647
},
{
  "id": "rc_silver_decada_2010_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: Só Tem Super-Herói Agora?!",
  "description": "Conquistar 30 filmes lançados entre 2010 e 2020 (30 filmes).",
  "icon": "🦸‍♂️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "year_between_2010_2020"
  },
  "sort_order": 648
},
{
  "id": "rc_silver_pentacampeonato_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: O Pentacampeonato no Cinema!",
  "description": "Conquistar 1 filme lançado em cada ano em que o Brasil foi campeão da Copa do Mundo: 1958, 1962, 1970, 1994 e 2002 (5 anos / 5 filmes no checklist).",
  "icon": "⭐",
  "target_type": "ritual_pentacampeonato",
  "target_value": 5,
  "target_metadata": {
    "years": [
      1958,
      1962,
      1970,
      1994,
      2002
    ]
  },
  "sort_order": 649
},
{
  "id": "rc_epic_cinema_50",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Será Que um Dia Eu Consigo?! (Sócio Carteirinha)",
  "description": "Conquistar 50 filmes assistidos no Cinema (50 filmes).",
  "icon": "💳",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "cinema_count"
  },
  "sort_order": 650
},
{
  "id": "rc_epic_midia_fisica_60",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Ok, Agora Eu Definitivamente Não Tenho Tantos Jogos Assim!",
  "description": "Conquistar 60 filmes assistidos em Blu-ray ou DVD (60 filmes).",
  "icon": "📀",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 60,
  "target_metadata": {
    "ruleKey": "physical_media_count"
  },
  "sort_order": 651
},
{
  "id": "rc_epic_pirata_jack_sparrow_50",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Capitão Jack Sparrow: \"Lembrem-se Deste Dia...\"",
  "description": "Conquistar 50 filmes assistidos na Internet ou My Family Cine (50 filmes).",
  "icon": "🏴‍☠️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "internet_or_mfc_count"
  },
  "sort_order": 652
},
{
  "id": "rc_epic_combo_streamings_oficiais_150",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Cinema em Casa (O Combo das Assinaturas)",
  "description": "Conquistar 150 filmes somados nas plataformas oficiais de streaming (Apple TV+, Disney+, HBO Max, Netflix, Prime Video e Star+) (150 filmes).",
  "icon": "🍿",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 150,
  "target_metadata": {
    "ruleKey": "official_streaming_count"
  },
  "sort_order": 653
},
{
  "id": "rc_epic_dublado_300",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: A Glória Máxima da Dublagem Brasileira!",
  "description": "Conquistar 300 filmes com áudio Dublado (300 filmes).",
  "icon": "🇧🇷",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 300,
  "target_metadata": {
    "ruleKey": "audio_dublado_count"
  },
  "sort_order": 654
},
{
  "id": "rc_epic_legendado_150",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Leitor Ninja: 200 Palavras por Minuto",
  "description": "Conquistar 150 filmes com áudio Legendado (150 filmes).",
  "icon": "🥷",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 150,
  "target_metadata": {
    "ruleKey": "audio_legendado_count"
  },
  "sort_order": 655
},
{
  "id": "rc_epic_duracao_gt_180_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Haja Bexiga! (Maratona de Gigantes)",
  "description": "Conquistar 10 filmes com mais de 180 minutos de duração (10 filmes).",
  "icon": "🚰",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "runtime_gt_180"
  },
  "sort_order": 656
},
{
  "id": "rc_epic_original_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Poliglota de Ouvido Apurado",
  "description": "Conquistar 30 filmes no idioma Original (30 filmes).",
  "icon": "🎧",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "audio_original_count"
  },
  "sort_order": 657
},
{
  "id": "rc_epic_lancamento_mesmo_ano_60",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Acabou de Sair do Forno!",
  "description": "Conquistar 60 filmes onde o Ano de Lançamento e o Ano Visto são iguais (60 filmes).",
  "icon": "🔥",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 60,
  "target_metadata": {
    "ruleKey": "same_year_seen_release"
  },
  "sort_order": 658
},
{
  "id": "rc_epic_capsula_tempo_30anos_15",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Cápsula do Tempo Cinematográfica",
  "description": "Conquistar 15 filmes onde a diferença entre o Ano Visto e o Ano de Lançamento seja de 30 anos ou mais (15 filmes).",
  "icon": "🕰️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "time_capsule_30_years"
  },
  "sort_order": 659
},
{
  "id": "rc_epic_ditadura_21",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Durante a Ditadura (21 Anos de Chumbo)",
  "description": "Conquistar pelo menos 1 filme lançado em CADA UM dos 21 anos do regime militar brasileiro: de 1964 até 1985 (21 anos / 21 filmes no checklist).",
  "icon": "🎖️",
  "target_type": "ritual_ditadura",
  "target_value": 21,
  "target_metadata": {
    "startYear": 1964,
    "endYear": 1985
  },
  "sort_order": 660
},
{
  "id": "rc_epic_nomade_telas_8",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Nômade Digital das Telas",
  "description": "Conquistar pelo menos 3 filmes em 8 plataformas diferentes do catálogo (8 plataformas).",
  "icon": "🧭",
  "target_type": "ritual_nomade_telas",
  "target_value": 8,
  "target_metadata": {
    "minMoviesPerPlatform": 3,
    "targetPlatforms": 8
  },
  "sort_order": 661
},
{
  "id": "rc_gold_cinema_75",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "O Ritual do Cinéfilo: VIP do Balcão de Pipoca",
  "description": "Conquistar 75 filmes assistidos no Cinema (75 filmes).",
  "icon": "🍿",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 75,
  "target_metadata": {
    "ruleKey": "cinema_count"
  },
  "sort_order": 662
},
{
  "id": "rc_gold_midia_fisica_100",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "O Ritual do Cinéfilo: Curador de Estante (Mídia Física Vive!)",
  "description": "Conquistar 100 filmes assistidos em Blu-ray ou DVD (100 filmes).",
  "icon": "🏛️",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 100,
  "target_metadata": {
    "ruleKey": "physical_media_count"
  },
  "sort_order": 663
},
{
  "id": "rc_gold_streaming_livre_100",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "O Ritual do Cinéfilo: A Frota Negra do Streaming Livre",
  "description": "Conquistar 100 filmes assistidos via Internet ou My Family Cine (100 filmes).",
  "icon": "⚓",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 100,
  "target_metadata": {
    "ruleKey": "internet_or_mfc_count"
  },
  "sort_order": 664
},
{
  "id": "rc_gold_minutos_totais_30k",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "O Ritual do Cinéfilo: O Senhor do Tempo Cinematográfico",
  "description": "Acumular mais de 30.000 minutos (500 horas) assistidos no catálogo (30.000 minutos).",
  "icon": "⌛",
  "target_type": "ritual_total_minutos",
  "target_value": 30000,
  "target_metadata": {
    "targetMinutes": 30000
  },
  "sort_order": 665
},
{
  "id": "rc_gold_original_50",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "O Ritual do Cinéfilo: Mestre do Idioma Nativo",
  "description": "Conquistar 50 filmes no idioma Original (50 filmes).",
  "icon": "🌐",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 50,
  "target_metadata": {
    "ruleKey": "audio_original_count"
  },
  "sort_order": 666
},
{
  "id": "rc_gold_petista_dinamico",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "O Ritual do Cinéfilo: SEU PETISTA! (A Era da Estrela Vermelha)",
  "description": "Conquistar pelo menos 1 filme lançado em cada ano de mandatos do PT: 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 e de 2023 até o ano mais recente cadastrado no catálogo (checklist dinâmico).",
  "icon": "⭐",
  "target_type": "ritual_petista",
  "target_value": 18,
  "target_metadata": {
    "baseYears": [
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016
    ],
    "recentStartYear": 2023
  },
  "sort_order": 667
},
{
  "id": "rc_mythic_projecao_classica_200",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "mythic",
  "title": "O Ritual do Cinéfilo: A Lenda da Projeção Clássica",
  "description": "Conquistar 100 filmes no Cinema E 100 filmes em Blu-ray ou DVD (200 filmes).",
  "icon": "📽️",
  "target_type": "ritual_projecao_classica",
  "target_value": 200,
  "target_metadata": {
    "cinemaTarget": 100,
    "physicalTarget": 100
  },
  "sort_order": 668
},
{
  "id": "rc_mythic_enciclopedia_acustica_500",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "mythic",
  "title": "O Ritual do Cinéfilo: Enciclopédia Acústica (Audiófilo Supremo)",
  "description": "Conquistar 300 filmes Dublados, 150 Legendados e 50 no idioma Original (500 marcos de áudio).",
  "icon": "🎛️",
  "target_type": "ritual_enciclopedia_acustica",
  "target_value": 500,
  "target_metadata": {
    "dubladoTarget": 300,
    "legendadoTarget": 150,
    "originalTarget": 50
  },
  "sort_order": 669
},
{
  "id": "rc_mythic_maratonista_60k",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "mythic",
  "title": "O Ritual do Cinéfilo: Maratonista Interminável",
  "description": "Acumular mais de 60.000 minutos (1.000 horas líquidas) de filmes assistidos no catálogo (60.000 minutos).",
  "icon": "🌌",
  "target_type": "ritual_total_minutos",
  "target_value": 60000,
  "target_metadata": {
    "targetMinutes": 60000
  },
  "sort_order": 670
},
{
  "id": "rc_plat_mestre_cabine",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "platinum",
  "title": "O Ritual do Cinéfilo: O Mestre da Cabine de Projeção",
  "description": "Conquistar TODOS os troféus da categoria O Ritual do Cinéfilo (desbloqueio automático dinâmico ao atingir 100% dos outros 57 troféus desta categoria).",
  "icon": "🏆",
  "target_type": "platinum_dynamic",
  "target_value": 57,
  "target_metadata": {
    "category": "ritual_cinefilo",
    "categoryScope": "ritual_cinefilo"
  },
  "sort_order": 671
},
{
  "id": "us_speak_no_evil",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: Visita Indesejada (Não Fale o Mal)",
  "description": "Conquistar o original dinamarquês e o remake americano: Não Fale o Mal (Speak No Evil, 2022) e Não Fale o Mal (Speak No Evil, 2024) (2 filmes).",
  "icon": "🤫",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "Não Fale o Mal",
    "movies": [
      {
        "name": "Não Fale o Mal (2022)",
        "patterns": [
          "Speak No Evil",
          "Gæsterne",
          "Gaesterne",
          "Não Fale o Mal",
          "Nao Fale o Mal"
        ],
        "year": 2022
      },
      {
        "name": "Não Fale o Mal (2024)",
        "patterns": [
          "Speak No Evil",
          "Não Fale o Mal",
          "Nao Fale o Mal"
        ],
        "year": 2024
      }
    ]
  },
  "sort_order": 672
},
{
  "id": "us_ciske_de_rat",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "bronze",
  "title": "Universos & Sagas: A Rebeldia de Amsterdã (Ciske de Rat)",
  "description": "Conquistar os 2 filmes clássicos holandeses de Ciske: Ciske de Rat (1955) e Ciske de Rat (Ciske, o Rato, 1984) (2 filmes).",
  "icon": "🐀",
  "target_type": "franchise_movie_list",
  "target_value": 2,
  "target_metadata": {
    "franchise": "Ciske de Rat",
    "movies": [
      {
        "name": "Ciske de Rat (1955)",
        "patterns": [
          "Ciske de Rat"
        ],
        "year": 1955
      },
      {
        "name": "Ciske de Rat (1984)",
        "patterns": [
          "Ciske de Rat",
          "Ciske, o Rato",
          "Ciske o Rato"
        ],
        "year": 1984
      }
    ]
  },
  "sort_order": 673
},
{
  "id": "vm_duas_coreias",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo"
  ],
  "tier": "silver",
  "title": "Volta ao Mundo: As Duas Coreias (Acordo de Paz na Tela)",
  "description": "Conquistar pelo menos 1 filme da Coreia do Sul e 1 filme da Coreia do Norte (2 países).",
  "icon": "🕊️",
  "target_type": "country_list",
  "target_value": 2,
  "target_metadata": {
    "countryCodes": [
      "kr",
      "kp"
    ]
  },
  "sort_order": 674
},
{
  "id": "rc_ano_2001_11",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Ritual do Cinéfilo: O Ano em que o Mundo Parou (2001)",
  "description": "Conquistar 11 filmes gravados/lançados no ano de 2001 (11 filmes).",
  "icon": "🛸",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 11,
  "target_metadata": {
    "ruleKey": "year_eq_2001"
  },
  "sort_order": 675
},
{
  "id": "rc_segunda_guerra_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "O Ritual do Cinéfilo: Transmissão da Segunda Guerra Mundial (1939–1945)",
  "description": "Conquistar 5 filmes gravados/lançados durante os anos da Segunda Guerra Mundial, entre 1939 e 1945 (5 filmes).",
  "icon": "📻",
  "target_type": "ritual_cinefilo_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "year_between_1939_1945"
  },
  "sort_order": 676
},
{
  "id": "rc_todos_anos_vida_34",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "O Ritual do Cinéfilo: Todos os Anos da Minha Vida! (1994 a 2027)",
  "description": "Conquistar pelo menos 1 filme gravado/lançado em cada ano desde 1994 até 2027 (34 anos no checklist).",
  "icon": "🎂",
  "target_type": "ritual_anos_checklist",
  "target_value": 34,
  "target_metadata": {
    "startYear": 1994,
    "endYear": 2027
  },
  "sort_order": 677
},
{
  "id": "rc_seculo_cinema_97",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo"
  ],
  "tier": "mythic",
  "title": "O Ritual do Cinéfilo: Um por Ano! O Século do Cinema (1931 a 2027)",
  "description": "Conquistar pelo menos 1 filme gravado/lançado em CADA UM dos 97 anos entre 1931 e 2027 (97 anos no checklist).",
  "icon": "⌛",
  "target_type": "ritual_anos_checklist",
  "target_value": 97,
  "target_metadata": {
    "startYear": 1931,
    "endYear": 2027
  },
  "sort_order": 678
},
{
  "id": "multi_rc_tc_pele_ii",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Era Melhor Ter Ido Ver o Filme do Pelé II!",
  "description": "Conquistar 1 filme visto no Cinema cuja Minha Nota seja menor que 7.000 (1 filme).",
  "icon": "⚽",
  "target_type": "multi_ritual_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "cinema_ur_lt_7000"
  },
  "sort_order": 679
},
{
  "id": "multi_mh_tc_a24_conceitual",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood",
    "tribunal_critica"
  ],
  "tier": "bronze",
  "title": "Explica, Explica! (Conceitual Demais até pra Mim)",
  "description": "Conquistar 1 filme da distribuidora A24 com Minha Nota abaixo de 6.000 (1 filme).",
  "icon": "🎨",
  "target_type": "multi_ritual_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "a24_ur_lt_6000"
  },
  "sort_order": 680
},
{
  "id": "multi_rc_dl_nascimento_ago94",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "data_limite"
  ],
  "tier": "bronze",
  "title": "Eu Nasci! (Agosto de 1994)",
  "description": "Conquistar 1 filme gravado/lançado em 1994 e que foi visto no mês de Agosto (1 filme).",
  "icon": "👶",
  "target_type": "multi_ritual_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "year_1994_seen_august"
  },
  "sort_order": 681
},
{
  "id": "multi_vm_rc_senna_1994",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "Ayrton Senna: Descanse em Paz (Legado de 1994)",
  "description": "Conquistar 1 filme gravado/lançado em 1994 produzido no Brasil (1 filme).",
  "icon": "🏎️",
  "target_type": "multi_ritual_rule",
  "target_value": 1,
  "target_metadata": {
    "ruleKey": "brazil_year_1994"
  },
  "sort_order": 682
},
{
  "id": "multi_vm_rc_copa_brasil_1950_2014",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "Copa no Brasil! (Do Maracanazo ao 7x1)",
  "description": "Conquistar 1 filme do Brasil lançado em 1950 e 1 filme do Brasil lançado em 2014 (2 filmes).",
  "icon": "🏟️",
  "target_type": "multi_ritual_rule",
  "target_value": 2,
  "target_metadata": {
    "ruleKey": "brazil_copa_1950_2014"
  },
  "sort_order": 683
},
{
  "id": "multi_ac_rc_animacao_dublada_15",
  "category": "anatomia_cinema",
  "categories": [
    "anatomia_cinema",
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "Dublagem de Ouro nos Desenhos!",
  "description": "Conquistar 15 filmes do gênero Animação assistidos com áudio Dublado (15 filmes).",
  "icon": "🎙️",
  "target_type": "multi_ritual_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "animacao_dublada_15"
  },
  "sort_order": 684
},
{
  "id": "multi_ac_dl_rc_terror_outubro_5",
  "category": "anatomia_cinema",
  "categories": [
    "anatomia_cinema",
    "data_limite",
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "Sessão da Meia-Noite em Outubro",
  "description": "Conquistar 5 filmes do gênero Terror assistidos no Cinema ou na Internet durante o mês de Outubro (5 filmes).",
  "icon": "🎃",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "terror_cinema_internet_outubro_5"
  },
  "sort_order": 685
},
{
  "id": "multi_ac_rc_curta_youtube_5",
  "category": "anatomia_cinema",
  "categories": [
    "anatomia_cinema",
    "ritual_cinefilo"
  ],
  "tier": "bronze",
  "title": "Curta-Metragem Direto do YouTube!",
  "description": "Conquistar 5 filmes do gênero Curta assistidos no YouTube (5 filmes).",
  "icon": "▶️",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "curta_youtube_5"
  },
  "sort_order": 686
},
{
  "id": "multi_vm_rc_brasil_cinema_5",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "Prestigiando o Cinema Nacional na Telona!",
  "description": "Conquistar 5 filmes do Brasil assistidos no Cinema (5 filmes).",
  "icon": "🇧🇷",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "brasil_cinema_5"
  },
  "sort_order": 687
},
{
  "id": "multi_rc_tc_cinema_nota_gt8_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Cinema Espetacular! (Valeram Cada Centavo do Ingresso)",
  "description": "Conquistar 10 filmes vistos no Cinema com Minha Nota maior que 8.000 (10 filmes).",
  "icon": "🎟️",
  "target_type": "multi_ritual_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "cinema_ur_gt_8000_10"
  },
  "sort_order": 688
},
{
  "id": "multi_rc_dl_ferias_cinema_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "data_limite"
  ],
  "tier": "silver",
  "title": "De Férias no Cinema!",
  "description": "Conquistar 10 filmes assistidos no Cinema nos meses de Julho ou Dezembro (10 filmes).",
  "icon": "🏖️",
  "target_type": "multi_ritual_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "cinema_ferias_julho_dez_10"
  },
  "sort_order": 689
},
{
  "id": "multi_vm_ac_biografia_fora_eua_br_5",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "anatomia_cinema"
  ],
  "tier": "silver",
  "title": "Sobre Outros Países (Vidas Além do Eixo EUA-Brasil)",
  "description": "Conquistar 5 filmes do gênero Biografia que NÃO foram filmados nos Estados Unidos nem no Brasil (5 filmes).",
  "icon": "📜",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "biografia_non_us_non_br_5"
  },
  "sort_order": 690
},
{
  "id": "multi_vm_dna_ac_japao_sem_animes_5",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "anatomia_cinema"
  ],
  "tier": "silver",
  "title": "Cadê os Animes?! (O Outro Lado do Japão)",
  "description": "Conquistar 5 filmes do Japão que NÃO possuam as tags Baseado em Anime ou Baseado em jogo e NÃO pertençam aos gêneros Terror ou Animação (5 filmes).",
  "icon": "🗾",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "japao_sem_animes_games_terror_5"
  },
  "sort_order": 691
},
{
  "id": "multi_dna_rc_pirata_lgbt_15",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo",
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "A Bandeira Desse Pirata É Diferente! (Arco-Íris nos Sete Mares)",
  "description": "Conquistar 15 filmes com a tag Personagem LGBT assistidos em My Family Cine, YouTube ou Internet somados (15 filmes).",
  "icon": "🏳️‍🌈",
  "target_type": "multi_ritual_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "pirata_tag_lgbt_15"
  },
  "sort_order": 692
},
{
  "id": "multi_dna_rc_pirata_crime_real_15",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo",
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "Essa Caveira Significa Perigo! PE-RI-GO! Ouviram Bem?! PE-RI-GO!",
  "description": "Conquistar 15 filmes com a tag Crime real assistidos em My Family Cine, Internet ou YouTube somados (15 filmes).",
  "icon": "☠️",
  "target_type": "multi_ritual_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "pirata_tag_crime_real_15"
  },
  "sort_order": 693
},
{
  "id": "multi_vm_rc_original_fora_br_eua_5",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "Poliglota pelo Mundo (Sem Dublador e Sem Legenda Gringa)",
  "description": "Conquistar 5 filmes no idioma Original produzidos fora do Brasil e fora dos Estados Unidos (5 filmes).",
  "icon": "🗣️",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "audio_original_non_us_non_br_5"
  },
  "sort_order": 694
},
{
  "id": "multi_rc_tc_midia_fisica_nota_gt8_15",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Estante de Clássicos em Mídia Física",
  "description": "Conquistar 15 filmes assistidos em Blu-ray ou DVD que tenham Minha Nota acima de 8.000 (15 filmes).",
  "icon": "📀",
  "target_type": "multi_ritual_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "midia_fisica_ur_gt_8000_15"
  },
  "sort_order": 695
},
{
  "id": "multi_ac_rc_guerra_historia_gt150_5",
  "category": "anatomia_cinema",
  "categories": [
    "anatomia_cinema",
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "O Dia Mais Longo (Trincheiras de 2 Horas e Meia)",
  "description": "Conquistar 5 filmes do gênero Guerra ou História que tenham mais de 150 minutos de duração (5 filmes).",
  "icon": "🎖️",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "guerra_historia_gt_150_5"
  },
  "sort_order": 696
},
{
  "id": "multi_dna_rc_antigo_pb_mudo_3",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo",
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "Mudo e em Preto e Branco como nos Anos 20!",
  "description": "Conquistar 3 filmes lançados antes de 1960 que possuam as tags Preto e branco ou Mudo (3 filmes).",
  "icon": "🎬",
  "target_type": "multi_ritual_rule",
  "target_value": 3,
  "target_metadata": {
    "ruleKey": "pre_1960_pb_mudo_3"
  },
  "sort_order": 697
},
{
  "id": "multi_rc_tc_blockbuster_estreia_cinema_15",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "silver",
  "title": "Blockbuster de Estreia no Escurinho do Cinema!",
  "description": "Conquistar 15 filmes vistos no Cinema no mesmo ano em que foram lançados (Ano Lançamento == Ano Visto) e que tenham mais de 500.000 Global Reviews (15 filmes).",
  "icon": "🍿",
  "target_type": "multi_ritual_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "blockbuster_estreia_cinema_15"
  },
  "sort_order": 698
},
{
  "id": "multi_ac_rc_terror_anos_80_10",
  "category": "anatomia_cinema",
  "categories": [
    "anatomia_cinema",
    "ritual_cinefilo"
  ],
  "tier": "silver",
  "title": "Rebobine a Fita VHS! (Terror Oitentista)",
  "description": "Conquistar 10 filmes do gênero Terror lançados na década de 1980 (1980 a 1989) (10 filmes).",
  "icon": "📼",
  "target_type": "multi_ritual_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "terror_anos_80_10"
  },
  "sort_order": 699
},
{
  "id": "multi_ac_rc_pirata_romance_30",
  "category": "anatomia_cinema",
  "categories": [
    "anatomia_cinema",
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "Os Piratas Também Amam! (Coração de Corsário)",
  "description": "Conquistar 30 filmes do gênero Romance assistidos em My Family Cine, YouTube ou Internet somados (30 filmes).",
  "icon": "🏴‍☠️",
  "target_type": "multi_ritual_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "pirata_romance_30"
  },
  "sort_order": 700
},
{
  "id": "multi_ac_dna_terror_sem_gore_30",
  "category": "anatomia_cinema",
  "categories": [
    "anatomia_cinema",
    "dna_cinefilo"
  ],
  "tier": "epic",
  "title": "Ué, Cadê o Sangue?! Temos que Fazer o Código ABACABB!",
  "description": "Conquistar 30 filmes do gênero Terror que NÃO possuem a tag Gore (30 filmes).",
  "icon": "👻",
  "target_type": "multi_ritual_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "terror_sem_gore_30"
  },
  "sort_order": 701
},
{
  "id": "multi_dna_rc_netflix_gore_30",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo",
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "Vermelho para Combinar com a Logo (TUDUM Sangrento!)",
  "description": "Conquistar 30 filmes com a tag Gore assistidos na Netflix (30 filmes).",
  "icon": "🩸",
  "target_type": "multi_ritual_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "netflix_gore_30"
  },
  "sort_order": 702
},
{
  "id": "multi_vm_dna_rc_cesio_137",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "Brilho Azul no Escuro: Protocolo Césio-137 (Goiânia, 1987)",
  "description": "Cumprir os 3 marcos de referência ao acidente radiológico de 1987 (7 itens no checklist): 3 filmes lançados em 1987, 1 filme com duração de 136 a 138 minutos e 3 filmes do Brasil com tag Trágico ou Fatos Reais (7 filmes).",
  "icon": "☢️",
  "target_type": "multi_ritual_rule",
  "target_value": 7,
  "target_metadata": {
    "ruleKey": "cesio_137_combo_7"
  },
  "sort_order": 703
},
{
  "id": "multi_dna_ac_rc_minecraft_stack_64",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "Um Stack Completo de 64 Blocos! (Crafting Table do Minecraft)",
  "description": "Juntar um Stack completo de 64 filmes somando elementos do Minecraft: tags Baseado em jogo, Zumbi, Bruxo ou Animais antropomorficos combinadas com gênero Aventura ou Fantasia (64 filmes).",
  "icon": "🧱",
  "target_type": "multi_ritual_rule",
  "target_value": 64,
  "target_metadata": {
    "ruleKey": "minecraft_stack_64"
  },
  "sort_order": 704
},
{
  "id": "multi_dna_rc_marvel_dc_cinema_20",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo",
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "Maratona Marvel & DC na Poltrona do Cinema!",
  "description": "Conquistar 20 filmes com a tag Marvel ou DC assistidos diretamente no Cinema (20 filmes).",
  "icon": "🦸",
  "target_type": "multi_ritual_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "marvel_dc_cinema_20"
  },
  "sort_order": 705
},
{
  "id": "multi_rc_tc_pirata_indie_hidden_gem_10",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Garimpo na Deep Web que Valeu Ouro!",
  "description": "Conquistar 10 filmes assistidos via Internet, YouTube ou My Family Cine que tenham menos de 50.000 Global Reviews e Minha Nota acima de 8.000 (10 filmes).",
  "icon": "💎",
  "target_type": "multi_ritual_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "pirata_hidden_gem_10"
  },
  "sort_order": 706
},
{
  "id": "multi_mh_rc_oscar_streaming_oficial_20",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood",
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "Noite de Gala do Oscar no Sofá de Casa",
  "description": "Conquistar 20 filmes Ganhadores do Oscar assistidos em plataformas de streaming oficiais (Netflix, HBO Max, Prime Video, Disney+, Star+ ou Apple TV+) (20 filmes).",
  "icon": "🛋️",
  "target_type": "multi_ritual_rule",
  "target_value": 20,
  "target_metadata": {
    "ruleKey": "oscar_winner_streaming_oficial_20"
  },
  "sort_order": 707
},
{
  "id": "multi_rc_tc_gt180_nota_gt9_5",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Três Horas de Obra-Prima (Nem Vi o Relógio Passar!)",
  "description": "Conquistar 5 filmes com mais de 180 minutos de duração que tenham Minha Nota acima de 9.000 (5 filmes).",
  "icon": "⏳",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "gt_180_min_ur_gt_9000_5"
  },
  "sort_order": 708
},
{
  "id": "multi_mh_rc_sony_midia_fisica_10",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood",
    "ritual_cinefilo"
  ],
  "tier": "epic",
  "title": "Colecionador Físico da Sony (Do Blu-ray pro PS5!)",
  "description": "Conquistar 10 filmes da distribuidora Sony Pictures assistidos em mídia física (Blu-ray ou DVD) (10 filmes).",
  "icon": "🎮",
  "target_type": "multi_ritual_rule",
  "target_value": 10,
  "target_metadata": {
    "ruleKey": "sony_midia_fisica_10"
  },
  "sort_order": 709
},
{
  "id": "multi_vm_rc_pirata_30_paises",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "Cidadão dos Sete Mares (Pirataria Internacional Sem Fronteiras)",
  "description": "Conquistar filmes de 30 países diferentes assistidos via Internet, My Family Cine ou YouTube (30 países).",
  "icon": "🗺️",
  "target_type": "multi_ritual_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "pirata_30_paises"
  },
  "sort_order": 710
},
{
  "id": "multi_rc_tc_reliquia_museu_pre1980_15",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "gold",
  "title": "Relíquia de Museu Aclamada pelo Tribunal",
  "description": "Conquistar 15 filmes lançados antes de 1980 que tenham Minha Nota acima de 8.000 e IMDb igual ou superior a 8.0 (15 filmes).",
  "icon": "🏛️",
  "target_type": "multi_ritual_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "pre_1980_ur_gt_8000_imdb_gte_80_15"
  },
  "sort_order": 711
},
{
  "id": "multi_mh_rc_oscar_ano_lancamento_15",
  "category": "mafia_hollywood",
  "categories": [
    "mafia_hollywood",
    "ritual_cinefilo"
  ],
  "tier": "gold",
  "title": "Tapete Vermelho em Tempo Real (Visto no Ano da Estatueta!)",
  "description": "Conquistar 15 filmes Indicados ou Ganhadores do Oscar onde o Ano Visto é igual ao Ano de Lançamento (ou Ano de Lançamento + 1, época da cerimônia) (15 filmes).",
  "icon": "🌟",
  "target_type": "multi_ritual_rule",
  "target_value": 15,
  "target_metadata": {
    "ruleKey": "oscar_ano_lancamento_ou_mais_um_15"
  },
  "sort_order": 712
},
{
  "id": "multi_rc_ac_dublagem_classica_80_90_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "anatomia_cinema"
  ],
  "tier": "gold",
  "title": "Dublagem Clássica de Sessão da Tarde (Anos 80 e 90)",
  "description": "Conquistar 30 filmes de Ação, Aventura ou Comédia lançados entre 1980 e 1999 assistidos com áudio Dublado (30 filmes).",
  "icon": "📺",
  "target_type": "multi_ritual_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "dublagem_classica_80_90_30"
  },
  "sort_order": 713
},
{
  "id": "multi_exodia_7_categorias_5",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "dna_cinefilo",
    "anatomia_cinema",
    "data_limite",
    "mafia_hollywood",
    "tribunal_critica",
    "ritual_cinefilo"
  ],
  "tier": "mythic",
  "title": "O Grande Alinhamento das 7 Categorias! (Exodia do Cine Catalog)",
  "description": "Conquistar 5 filmes que cumpram simultaneamente: fora do eixo EUA/Brasil, visto em Janeiro ou Dezembro, 2+ tags, 2+ gêneros, indicado ou vencedor do Oscar, Minha Nota >= 9.000, duração > 120 min e visto no Cinema ou Mídia Física (5 filmes).",
  "icon": "🔮",
  "target_type": "multi_ritual_rule",
  "target_value": 5,
  "target_metadata": {
    "ruleKey": "exodia_7_categorias_5"
  },
  "sort_order": 714
},
{
  "id": "multi_viajante_imortal_9_decadas_18",
  "category": "volta_ao_mundo",
  "categories": [
    "volta_ao_mundo",
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "mythic",
  "title": "Viajante Imortal das Décadas (90 Anos de Cinema Aclamado)",
  "description": "Conquistar pelo menos 2 filmes com Minha Nota >= 8.000 em cada uma das 9 décadas entre 1940s e 2020s, somando pelo menos 10 países diferentes no processo (18 filmes no checklist).",
  "icon": "🧭",
  "target_type": "multi_ritual_rule",
  "target_value": 18,
  "target_metadata": {
    "ruleKey": "viajante_9_decadas_18"
  },
  "sort_order": 715
},
{
  "id": "dna_animais_gore_1",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo"
  ],
  "tier": "bronze",
  "title": "DNA Cinéfilo: Tá Pegando Fogo, Bicho! (Churrasco no Bosque)",
  "description": "Conquistar 1 filme que possua as tags Animais antropomorficos e Gore ao mesmo tempo (1 filme).",
  "icon": "🔥",
  "target_type": "tag_double_and",
  "target_value": 1,
  "target_metadata": {
    "tags": [
      "Animais antropomorficos",
      "Gore"
    ]
  },
  "sort_order": 716
},
{
  "id": "dna_caso_evandro_crime_final_epico_7",
  "category": "dna_cinefilo",
  "categories": [
    "dna_cinefilo"
  ],
  "tier": "epic",
  "title": "DNA Cinéfilo: O Caso Evandro (Verdades e Finais Chocantes)",
  "description": "Conquistar 7 filmes que possuam as tags Crime real e Final Epico ao mesmo tempo (7 filmes).",
  "icon": "🔍",
  "target_type": "tag_double_and",
  "target_value": 7,
  "target_metadata": {
    "tags": [
      "Crime real",
      "Final Epico"
    ]
  },
  "sort_order": 717
},
{
  "id": "multi_rc_tc_celso_russomanno_30",
  "category": "ritual_cinefilo",
  "categories": [
    "ritual_cinefilo",
    "tribunal_critica"
  ],
  "tier": "epic",
  "title": "Chama o Celso Russomanno! (Patrulha do Consumidor no Streaming)",
  "description": "Conquistar 30 filmes assistidos em plataformas oficiais de streaming (Netflix, Prime Video, HBO Max, Disney+, Star+ ou Apple TV+) com Minha Nota menor que 6.000 (30 filmes).",
  "icon": "📢",
  "target_type": "multi_ritual_rule",
  "target_value": 30,
  "target_metadata": {
    "ruleKey": "celso_russomanno_streaming_ur_lt_6000_30"
  },
  "sort_order": 718
},
{
  "id": "ss_silvio_santos",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "bronze",
  "title": "Sessão Secreta: É o Silvio Santos? Quase!",
  "description": "Conquistar pelo menos 3 dos 4 filmes sobre lendas de auditório da TV brasileira (Meta: 3 de 4 filmes).",
  "icon": "📺",
  "target_type": "secret_session_curated",
  "target_value": 3,
  "target_metadata": {
    "curatedCount": 4,
    "minTarget": 3,
    "movies": [
      {
        "name": "Silvio (2024)",
        "patterns": [
          "silvio"
        ],
        "exclude": [
          "silvio santos vem ai",
          "silvio santos vem aí"
        ],
        "year": 2024
      },
      {
        "name": "Silvio Santos Vem Aí (2025)",
        "patterns": [
          "silvio santos vem ai",
          "silvio santos vem aí"
        ],
        "year": 2025
      },
      {
        "name": "Bingo: O Rei das Manhãs (2017)",
        "patterns": [
          "bingo o rei das manhas",
          "bingo o rei das manhãs",
          "bingo"
        ],
        "year": 2017
      },
      {
        "name": "Chacrinha: O Velho Guerreiro (2018)",
        "patterns": [
          "chacrinha o velho guerreiro",
          "chacrinha"
        ],
        "year": 2018
      }
    ]
  },
  "sort_order": 719
},
{
  "id": "ss_designer_do_cartaz",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "bronze",
  "title": "Sessão Secreta: O Filme Até Pode Ser Bom, Mas Demitam o Designer do Cartaz!",
  "description": "Conquistar pelo menos 5 dos 8 filmes famosos por pôsteres desastrosos (Meta: 5 de 8 filmes).",
  "icon": "🖼️",
  "target_type": "secret_session_curated",
  "target_value": 5,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 5,
    "movies": [
      {
        "name": "X-Men: Primeira Classe (2011)",
        "patterns": [
          "x-men primeira classe",
          "x men primeira classe",
          "first class"
        ],
        "year": 2011
      },
      {
        "name": "Homem-Aranha: De Volta ao Lar (2017)",
        "patterns": [
          "de volta ao lar",
          "homecoming",
          "spider-man homecoming"
        ],
        "year": 2017
      },
      {
        "name": "A Saga Crepúsculo: Amanhecer - Parte 2 (2012)",
        "patterns": [
          "amanhecer parte 2",
          "breaking dawn part 2",
          "amanhecer - parte 2"
        ],
        "year": 2012
      },
      {
        "name": "Ladrões (Takers, 2010)",
        "patterns": [
          "ladroes",
          "ladrões",
          "takers"
        ],
        "year": 2010
      },
      {
        "name": "O Escorpião Rei (2002)",
        "patterns": [
          "escorpiao rei",
          "escorpião rei",
          "scorpion king",
          "the scorpion king"
        ],
        "year": 2002
      },
      {
        "name": "Chef (2014)",
        "patterns": [
          "chef"
        ],
        "year": 2014
      },
      {
        "name": "Vingadores: Guerra Infinita (2018)",
        "patterns": [
          "guerra infinita",
          "infinity war"
        ],
        "year": 2018
      },
      {
        "name": "Matrix Resurrections (2021)",
        "patterns": [
          "matrix resurrections",
          "resurrections"
        ],
        "year": 2021
      }
    ]
  },
  "sort_order": 720
},
{
  "id": "ss_show_do_milhao",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "silver",
  "title": "Sessão Secreta: É o Show do Milhão?!",
  "description": "Conquistar pelo menos 6 de 8 filmes focados em programas de TV, gameshows e reality shows mortais (Meta: 6 de 8 filmes).",
  "icon": "💰",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 6,
    "movies": [
      {
        "name": "Quem Quer Ser um Milionário? (2008)",
        "patterns": [
          "quem quer ser um milionario",
          "quem quer ser um milionário",
          "slumdog millionaire"
        ],
        "year": 2008
      },
      {
        "name": "O Show de Truman (1998)",
        "patterns": [
          "show de truman",
          "the truman show"
        ],
        "year": 1998
      },
      {
        "name": "Jogos Vorazes (2012)",
        "patterns": [
          "jogos vorazes",
          "the hunger games",
          "hunger games"
        ],
        "year": 2012,
        "exclude": [
          "em chamas",
          "catching fire",
          "esperança",
          "mockingjay",
          "cantiga",
          "ballad of songbirds"
        ]
      },
      {
        "name": "Nerve: Um Jogo Sem Regras (2016)",
        "patterns": [
          "nerve"
        ],
        "year": 2016
      },
      {
        "name": "O Sobrevivente (1987)",
        "patterns": [
          "o sobrevivente",
          "the running man",
          "running man"
        ],
        "year": 1987
      },
      {
        "name": "Battle Royale (2000)",
        "patterns": [
          "battle royale"
        ],
        "year": 2000
      },
      {
        "name": "Quiz Show: A Verdade da Trapaça (1994)",
        "patterns": [
          "quiz show"
        ],
        "year": 1994
      },
      {
        "name": "O Preço da Fama (15 Minutes, 2001)",
        "patterns": [
          "o preco da fama",
          "o preço da fama",
          "15 minutes"
        ],
        "year": 2001
      }
    ]
  },
  "sort_order": 721
},
{
  "id": "ss_o_mundo_acabou",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "silver",
  "title": "Sessão Secreta: O Mundo Acabou?!",
  "description": "Conquistar pelo menos 6 de 10 filmes de catástrofe global e fim dos tempos (Meta: 6 de 10 filmes).",
  "icon": "🌋",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 10,
    "minTarget": 6,
    "movies": [
      {
        "name": "2012 (2009)",
        "patterns": [
          "2012"
        ],
        "year": 2009
      },
      {
        "name": "O Dia Depois de Amanhã (2004)",
        "patterns": [
          "o dia depois de amanha",
          "o dia depois de amanhã",
          "the day after tomorrow"
        ],
        "year": 2004
      },
      {
        "name": "Não Olhe para Cima (2021)",
        "patterns": [
          "nao olhe para cima",
          "não olhe para cima",
          "don't look up",
          "dont look up"
        ],
        "year": 2021
      },
      {
        "name": "Armageddon (1998)",
        "patterns": [
          "armageddon"
        ],
        "year": 1998
      },
      {
        "name": "Impacto Profundo (1998)",
        "patterns": [
          "impacto profundo",
          "deep impact"
        ],
        "year": 1998
      },
      {
        "name": "Terremoto: A Falha de San Andreas (2015)",
        "patterns": [
          "san andreas",
          "a falha de san andreas",
          "terremoto a falha de san andreas"
        ],
        "year": 2015
      },
      {
        "name": "Presságio (2009)",
        "patterns": [
          "pressagio",
          "presságio",
          "knowing"
        ],
        "year": 2009
      },
      {
        "name": "Fim dos Tempos (2008)",
        "patterns": [
          "fim dos tempos",
          "the happening"
        ],
        "year": 2008
      },
      {
        "name": "Destruição Final: O Último Refúgio (2020)",
        "patterns": [
          "destruicao final",
          "destruição final",
          "greenland"
        ],
        "year": 2020
      },
      {
        "name": "Guerra Mundial Z (2013)",
        "patterns": [
          "guerra mundial z",
          "world war z"
        ],
        "year": 2013
      }
    ]
  },
  "sort_order": 722
},
{
  "id": "ss_nazare_tedesco",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "silver",
  "title": "Sessão Secreta: É a Nazaré Tedesco?!",
  "description": "Conquistar pelo menos 5 de 8 filmes sobre sequestro ou rapto de crianças (Meta: 5 de 8 filmes).",
  "icon": "🚼",
  "target_type": "secret_session_curated",
  "target_value": 5,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 5,
    "movies": [
      {
        "name": "A Troca (2008)",
        "patterns": [
          "a troca",
          "changeling"
        ],
        "year": 2008
      },
      {
        "name": "Os Suspeitos (Prisoners, 2013)",
        "patterns": [
          "os suspeitos",
          "prisoners"
        ],
        "year": 2013
      },
      {
        "name": "O Telefone Preto (2021)",
        "patterns": [
          "o telefone preto",
          "the black phone",
          "telefone preto"
        ],
        "year": 2021
      },
      {
        "name": "O Quarto de Jack (2015)",
        "patterns": [
          "o quarto de jack",
          "room"
        ],
        "year": 2015
      },
      {
        "name": "Chamas da Vingança (2004)",
        "patterns": [
          "chamas da vinganca",
          "chamas da vingança",
          "man on fire"
        ],
        "year": 2004
      },
      {
        "name": "Medo da Verdade (2007)",
        "patterns": [
          "medo da verdade",
          "gone baby gone"
        ],
        "year": 2007
      },
      {
        "name": "O Preço de um Resgate (1996)",
        "patterns": [
          "o preco de um resgate",
          "o preço de um resgate",
          "ransom"
        ],
        "year": 1996
      },
      {
        "name": "Resgate (Extraction, 2020)",
        "patterns": [
          "resgate",
          "extraction"
        ],
        "year": 2020,
        "exclude": [
          "resgate 2",
          "extraction 2"
        ]
      }
    ]
  },
  "sort_order": 723
},
{
  "id": "ss_atuacoes_mirins",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "silver",
  "title": "Sessão Secreta: Gente Grande em Corpo de Criança",
  "description": "Conquistar pelo menos 6 de 10 filmes com atuações mirins lendárias (Meta: 6 de 10 filmes).",
  "icon": "🧸",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 10,
    "minTarget": 6,
    "movies": [
      {
        "name": "O Sexto Sentido (1999)",
        "patterns": [
          "sexto sentido",
          "the sixth sense"
        ],
        "year": 1999
      },
      {
        "name": "O Quarto de Jack (2015)",
        "patterns": [
          "o quarto de jack",
          "room"
        ],
        "year": 2015
      },
      {
        "name": "Logan (2017)",
        "patterns": [
          "logan"
        ],
        "year": 2017
      },
      {
        "name": "O Profissional (Léon, 1994)",
        "patterns": [
          "o profissional",
          "leon the professional",
          "leon: the professional",
          "leon"
        ],
        "year": 1994
      },
      {
        "name": "Entrevista com o Vampiro (1994)",
        "patterns": [
          "entrevista com o vampiro",
          "interview with the vampire"
        ],
        "year": 1994
      },
      {
        "name": "Central do Brasil (1998)",
        "patterns": [
          "central do brasil",
          "central station"
        ],
        "year": 1998
      },
      {
        "name": "Pequena Miss Sunshine (2006)",
        "patterns": [
          "pequena miss sunshine",
          "little miss sunshine"
        ],
        "year": 2006
      },
      {
        "name": "Projeto Flórida (2017)",
        "patterns": [
          "projeto florida",
          "projeto flórida",
          "the florida project"
        ],
        "year": 2017
      },
      {
        "name": "A Vida É Bela (1997)",
        "patterns": [
          "a vida e bela",
          "a vida é bela",
          "life is beautiful",
          "la vita e bella"
        ],
        "year": 1997
      },
      {
        "name": "E.T.: O Extraterrestre (1982)",
        "patterns": [
          "e.t.",
          "et o extraterrestre",
          "e.t. the extra-terrestrial",
          "o extraterrestre"
        ],
        "year": 1982
      }
    ]
  },
  "sort_order": 724
},
{
  "id": "ss_remakes_disney",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "silver",
  "title": "Sessão Secreta: Acabou a Criatividade no Castelo?",
  "description": "Conquistar pelo menos 7 de 10 remakes em live-action da Disney (Meta: 7 de 10 filmes).",
  "icon": "🏰",
  "target_type": "secret_session_curated",
  "target_value": 7,
  "target_metadata": {
    "curatedCount": 10,
    "minTarget": 7,
    "movies": [
      {
        "name": "Aladdin (2019)",
        "patterns": [
          "aladdin"
        ],
        "year": 2019
      },
      {
        "name": "Mulan (2020)",
        "patterns": [
          "mulan"
        ],
        "year": 2020
      },
      {
        "name": "O Rei Leão (2019)",
        "patterns": [
          "o rei leao",
          "o rei leão",
          "the lion king"
        ],
        "year": 2019
      },
      {
        "name": "A Bela e a Fera (2017)",
        "patterns": [
          "a bela e a fera",
          "beauty and the beast"
        ],
        "year": 2017
      },
      {
        "name": "A Pequena Sereia (2023)",
        "patterns": [
          "a pequena sereia",
          "the little mermaid"
        ],
        "year": 2023
      },
      {
        "name": "Cruella (2021)",
        "patterns": [
          "cruella"
        ],
        "year": 2021
      },
      {
        "name": "Cinderela (2015)",
        "patterns": [
          "cinderela",
          "cinderella"
        ],
        "year": 2015
      },
      {
        "name": "Dumbo (2019)",
        "patterns": [
          "dumbo"
        ],
        "year": 2019
      },
      {
        "name": "Pinóquio (2022)",
        "patterns": [
          "pinoquio",
          "pinóquio",
          "pinocchio"
        ],
        "year": 2022
      },
      {
        "name": "Branca de Neve (2025)",
        "patterns": [
          "branca de neve",
          "snow white"
        ],
        "year": 2025
      }
    ]
  },
  "sort_order": 725
},
{
  "id": "ss_pesadelo_cozinha",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "silver",
  "title": "Sessão Secreta: Pesadelo na Cozinha!",
  "description": "Conquistar pelo menos 4 de 6 filmes passados no caos da gastronomia (Meta: 4 de 6 filmes).",
  "icon": "🍳",
  "target_type": "secret_session_curated",
  "target_value": 4,
  "target_metadata": {
    "curatedCount": 6,
    "minTarget": 4,
    "movies": [
      {
        "name": "O Menu (2022)",
        "patterns": [
          "o menu",
          "the menu"
        ],
        "year": 2022
      },
      {
        "name": "Ratatouille (2007)",
        "patterns": [
          "ratatouille"
        ],
        "year": 2007
      },
      {
        "name": "O Ponto de Ebulição (2021)",
        "patterns": [
          "o ponto de ebulicao",
          "o ponto de ebulição",
          "boiling point"
        ],
        "year": 2021
      },
      {
        "name": "Pegando Fogo (2015)",
        "patterns": [
          "pegando fogo",
          "burnt"
        ],
        "year": 2015
      },
      {
        "name": "Chef (2014)",
        "patterns": [
          "chef"
        ],
        "year": 2014
      },
      {
        "name": "Sem Reservas (2007)",
        "patterns": [
          "sem reservas",
          "no reservations"
        ],
        "year": 2007
      }
    ]
  },
  "sort_order": 726
},
{
  "id": "ss_dia_da_marmota",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "silver",
  "title": "Sessão Secreta: O Dia da Marmota: Acordei no Mesmo Dia de Novo!",
  "description": "Conquistar pelo menos 4 de 6 filmes com dinâmica de loop temporal (Meta: 4 de 6 filmes).",
  "icon": "⏰",
  "target_type": "secret_session_curated",
  "target_value": 4,
  "target_metadata": {
    "curatedCount": 6,
    "minTarget": 4,
    "movies": [
      {
        "name": "Feitiço do Tempo (1993)",
        "patterns": [
          "feitico do tempo",
          "feitiço do tempo",
          "groundhog day"
        ],
        "year": 1993
      },
      {
        "name": "No Limite do Amanhã (2014)",
        "patterns": [
          "no limite do amanha",
          "no limite do amanhã",
          "edge of tomorrow",
          "live die repeat"
        ],
        "year": 2014
      },
      {
        "name": "A Morte Te Dá Parabéns (2017)",
        "patterns": [
          "a morte te da parabens",
          "a morte te dá parabéns",
          "happy death day"
        ],
        "year": 2017
      },
      {
        "name": "Palm Springs (2020)",
        "patterns": [
          "palm springs"
        ],
        "year": 2020
      },
      {
        "name": "Contra o Tempo (2011)",
        "patterns": [
          "contra o tempo",
          "source code"
        ],
        "year": 2011
      },
      {
        "name": "Triângulo do Medo (2009)",
        "patterns": [
          "triangulo do medo",
          "triângulo do medo",
          "triangle"
        ],
        "year": 2009
      }
    ]
  },
  "sort_order": 727
},
{
  "id": "ss_coracoes_jovens_ii",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "epic",
  "title": "Sessão Secreta: Corações Jovens II",
  "description": "Conquistar pelo menos 6 de 8 filmes de drama e descoberta LGBTQIA+ na juventude (Meta: 6 de 8 filmes).",
  "icon": "🏳️‍🌈",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 6,
    "movies": [
      {
        "name": "Close (2022)",
        "patterns": [
          "close"
        ],
        "year": 2022
      },
      {
        "name": "Jovens Corações (2024)",
        "patterns": [
          "jovens coracoes",
          "jovens corações",
          "young hearts"
        ],
        "year": 2024
      },
      {
        "name": "Heartstone (2016)",
        "patterns": [
          "heartstone",
          "hjartasteinn"
        ],
        "year": 2016
      },
      {
        "name": "Hoje Eu Quero Voltar Sozinho (2014)",
        "patterns": [
          "hoje eu quero voltar sozinho",
          "the way he looks"
        ],
        "year": 2014
      },
      {
        "name": "Com Amor, Simon (2018)",
        "patterns": [
          "com amor simon",
          "com amor, simon",
          "love simon",
          "love, simon"
        ],
        "year": 2018
      },
      {
        "name": "Moonlight: Sob a Luz do Luar (2016)",
        "patterns": [
          "moonlight"
        ],
        "year": 2016
      },
      {
        "name": "Me Chame Pelo Seu Nome (2017)",
        "patterns": [
          "me chame pelo seu nome",
          "call me by your name"
        ],
        "year": 2017
      },
      {
        "name": "Verão de 85 (2020)",
        "patterns": [
          "verao de 85",
          "verão de 85",
          "ete 85",
          "été 85",
          "summer of 85"
        ],
        "year": 2020
      }
    ]
  },
  "sort_order": 728
},
{
  "id": "ss_plot_twist_chocante",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "epic",
  "title": "Sessão Secreta: Como Assim?! (Eu Tive que Pausar Depois Desse Plot Twist!)",
  "description": "Conquistar pelo menos 9 de 12 filmes aclamados por reviravoltas chocantes (Meta: 9 de 12 filmes).",
  "icon": "🤯",
  "target_type": "secret_session_curated",
  "target_value": 9,
  "target_metadata": {
    "curatedCount": 12,
    "minTarget": 9,
    "movies": [
      {
        "name": "O Sexto Sentido (1999)",
        "patterns": [
          "sexto sentido",
          "the sixth sense"
        ],
        "year": 1999
      },
      {
        "name": "Os Outros (2001)",
        "patterns": [
          "os outros",
          "the others"
        ],
        "year": 2001
      },
      {
        "name": "Ilha do Medo (2010)",
        "patterns": [
          "ilha do medo",
          "shutter island"
        ],
        "year": 2010
      },
      {
        "name": "Clube da Luta (1999)",
        "patterns": [
          "clube da luta",
          "fight club"
        ],
        "year": 1999
      },
      {
        "name": "Garota Exemplar (2014)",
        "patterns": [
          "garota exemplar",
          "gone girl"
        ],
        "year": 2014
      },
      {
        "name": "Seven: Os Sete Crimes Capitais (1995)",
        "patterns": [
          "seven",
          "se7en",
          "os sete crimes capitais"
        ],
        "year": 1995
      },
      {
        "name": "Oldboy (2003)",
        "patterns": [
          "oldboy"
        ],
        "year": 2003
      },
      {
        "name": "O Nevoeiro (2007)",
        "patterns": [
          "o nevoeiro",
          "the mist"
        ],
        "year": 2007
      },
      {
        "name": "Jogos Mortais (2004)",
        "patterns": [
          "jogos mortais",
          "saw"
        ],
        "year": 2004,
        "exclude": [
          "jogos mortais 2",
          "saw ii",
          "saw 2"
        ]
      },
      {
        "name": "A Órfã (2009)",
        "patterns": [
          "a orfa",
          "a órfã",
          "orphan"
        ],
        "year": 2009,
        "exclude": [
          "primeira morte",
          "first kill"
        ]
      },
      {
        "name": "Corra! (2017)",
        "patterns": [
          "corra",
          "get out"
        ],
        "year": 2017
      },
      {
        "name": "Os Suspeitos (1995)",
        "patterns": [
          "os suspeitos",
          "the usual suspects",
          "usual suspects"
        ],
        "year": 1995
      }
    ]
  },
  "sort_order": 729
},
{
  "id": "ss_heroi_nao_vilao",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "epic",
  "title": "Sessão Secreta: Herói? Não, Vilão!",
  "description": "Conquistar pelo menos 5 de 8 filmes que subvertem a figura do super-herói (Meta: 5 de 8 filmes).",
  "icon": "🦹",
  "target_type": "secret_session_curated",
  "target_value": 5,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 5,
    "movies": [
      {
        "name": "Brightburn: Filho das Trevas (2019)",
        "patterns": [
          "brightburn",
          "filho das trevas"
        ],
        "year": 2019
      },
      {
        "name": "Injustice (2021)",
        "patterns": [
          "injustice",
          "injustica",
          "injustiça"
        ],
        "year": 2021
      },
      {
        "name": "Poder Sem Limites (2012)",
        "patterns": [
          "poder sem limites",
          "chronicle"
        ],
        "year": 2012
      },
      {
        "name": "Watchmen: O Filme (2009)",
        "patterns": [
          "watchmen"
        ],
        "year": 2009
      },
      {
        "name": "Superman: Entre a Foice e o Martelo (2020)",
        "patterns": [
          "entre a foice e o martelo",
          "red son",
          "superman: red son"
        ],
        "year": 2020
      },
      {
        "name": "Liga da Justiça: Deuses e Monstros (2015)",
        "patterns": [
          "deuses e monstros",
          "gods and monsters"
        ],
        "year": 2015
      },
      {
        "name": "Megamente (2010)",
        "patterns": [
          "megamente",
          "megamind"
        ],
        "year": 2010
      },
      {
        "name": "O Esquadrão Suicida (2021)",
        "patterns": [
          "o esquadrao suicida",
          "o esquadrão suicida",
          "the suicide squad"
        ],
        "year": 2021
      }
    ]
  },
  "sort_order": 730
},
{
  "id": "ss_veja_de_novo_pares",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "epic",
  "title": "Sessão Secreta: Veja de Novo! (Ambas as Versões Obrigatórias)",
  "description": "Conquistar pelo menos 3 pares completos assistindo TANTO a versão original/cinema QUANTO o corte do diretor/estendido (Meta: 3 pares completos).",
  "icon": "🔄",
  "target_type": "secret_session_pairs",
  "target_value": 3,
  "target_metadata": {
    "minTarget": 3,
    "totalPairs": 5,
    "pairs": [
      {
        "name": "Par 1: Liga da Justiça (Cinema 2017 & Snyder Cut 2021)",
        "partA": {
          "name": "Liga da Justiça (Cinema, 2017)",
          "patterns": [
            "liga da justica",
            "liga da justiça",
            "justice league"
          ],
          "year": 2017,
          "exclude": [
            "zack snyder",
            "snyder cut",
            "jovens titas",
            "jovens titãs",
            "teen titans",
            "lego",
            "flashpoint",
            "deuses e monstros",
            "dark",
            "sombria"
          ]
        },
        "partB": {
          "name": "Liga da Justiça de Zack Snyder (2021)",
          "patterns": [
            "liga da justica",
            "liga da justiça",
            "justice league"
          ],
          "requireAdditionalPatterns": [
            "zack snyder",
            "snyder cut"
          ],
          "year": 2021
        }
      },
      {
        "name": "Par 2: Batman vs Superman (Cinema & Edição Definitiva)",
        "partA": {
          "name": "Batman vs Superman (Cinema, 2016)",
          "patterns": [
            "batman vs superman",
            "batman v superman"
          ],
          "year": 2016,
          "exclude": [
            "edicao definitiva",
            "edição definitiva",
            "ultimate edition",
            "estendida",
            "extended"
          ]
        },
        "partB": {
          "name": "Batman vs Superman (Edição Definitiva)",
          "patterns": [
            "batman vs superman",
            "batman v superman"
          ],
          "requireAdditionalPatterns": [
            "edicao definitiva",
            "edição definitiva",
            "ultimate edition",
            "estendida",
            "extended"
          ]
        }
      },
      {
        "name": "Par 3: Doutor Sono (Cinema & Corte do Diretor)",
        "partA": {
          "name": "Doutor Sono (Cinema, 2019)",
          "patterns": [
            "doutor sono",
            "doctor sleep"
          ],
          "year": 2019,
          "exclude": [
            "corte do diretor",
            "director's cut",
            "directors cut",
            "estendida",
            "extended"
          ]
        },
        "partB": {
          "name": "Doutor Sono (Corte do Diretor)",
          "patterns": [
            "doutor sono",
            "doctor sleep"
          ],
          "requireAdditionalPatterns": [
            "corte do diretor",
            "director's cut",
            "directors cut",
            "estendida",
            "extended"
          ]
        }
      },
      {
        "name": "Par 4: Blade Runner (Cinema 1982 & Final Cut)",
        "partA": {
          "name": "Blade Runner (Cinema, 1982)",
          "patterns": [
            "blade runner"
          ],
          "year": 1982,
          "exclude": [
            "final cut",
            "corte final",
            "director's cut",
            "directors cut",
            "corte do diretor"
          ]
        },
        "partB": {
          "name": "Blade Runner (Final Cut / Corte do Diretor)",
          "patterns": [
            "blade runner"
          ],
          "requireAdditionalPatterns": [
            "final cut",
            "corte final",
            "director's cut",
            "directors cut",
            "corte do diretor"
          ]
        }
      },
      {
        "name": "Par 5: Donnie Darko (Cinema 2001 & Director's Cut)",
        "partA": {
          "name": "Donnie Darko (Cinema, 2001)",
          "patterns": [
            "donnie darko"
          ],
          "year": 2001,
          "exclude": [
            "director's cut",
            "directors cut",
            "corte do diretor",
            "estendida",
            "extended"
          ]
        },
        "partB": {
          "name": "Donnie Darko (Director's Cut)",
          "patterns": [
            "donnie darko"
          ],
          "requireAdditionalPatterns": [
            "director's cut",
            "directors cut",
            "corte do diretor",
            "estendida",
            "extended"
          ]
        }
      }
    ]
  },
  "sort_order": 731
},
{
  "id": "ss_claustrofobia_pura",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "epic",
  "title": "Sessão Secreta: Claustrofobia Pura: Não Saio Daqui Nem Morto!",
  "description": "Conquistar pelo menos 5 de 8 filmes passados em um único cômodo ou espaço confinado (Meta: 5 de 8 filmes).",
  "icon": "📦",
  "target_type": "secret_session_curated",
  "target_value": 5,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 5,
    "movies": [
      {
        "name": "12 Homens e uma Sentença (1957)",
        "patterns": [
          "12 homens e uma sentenca",
          "12 homens e uma sentença",
          "12 angry men"
        ],
        "year": 1957
      },
      {
        "name": "Por um Fio (2002)",
        "patterns": [
          "por um fio",
          "phone booth"
        ],
        "year": 2002
      },
      {
        "name": "Enterrado Vivo (2010)",
        "patterns": [
          "enterrado vivo",
          "buried"
        ],
        "year": 2010
      },
      {
        "name": "O Quarto do Pânico (2002)",
        "patterns": [
          "quarto do panico",
          "quarto do pânico",
          "panic room"
        ],
        "year": 2002
      },
      {
        "name": "O Culpado (2018 / 2021)",
        "patterns": [
          "o culpado",
          "the guilty",
          "den skyldige"
        ]
      },
      {
        "name": "Janela Indiscreta (1954)",
        "patterns": [
          "janela indiscreta",
          "rear window"
        ],
        "year": 1954
      },
      {
        "name": "A Corda (1948)",
        "patterns": [
          "a corda",
          "rope"
        ],
        "year": 1948
      },
      {
        "name": "Locke (2013)",
        "patterns": [
          "locke"
        ],
        "year": 2013
      }
    ]
  },
  "sort_order": 732
},
{
  "id": "ss_whodunit_poirot",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "epic",
  "title": "Sessão Secreta: Quem Matou?! (Detetive Poirot Mandou Lembranças)",
  "description": "Conquistar pelo menos 6 de 8 filmes do clássico estilo Whodunit (Meta: 6 de 8 filmes).",
  "icon": "🕵️",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 6,
    "movies": [
      {
        "name": "Entre Facas e Segredos (2019)",
        "patterns": [
          "entre facas e segredos",
          "knives out"
        ],
        "year": 2019
      },
      {
        "name": "Glass Onion: Um Mistério Knives Out (2022)",
        "patterns": [
          "glass onion"
        ],
        "year": 2022
      },
      {
        "name": "Assassinato no Expresso do Oriente (2017)",
        "patterns": [
          "assassinato no expresso do oriente",
          "murder on the orient express"
        ],
        "year": 2017
      },
      {
        "name": "Morte no Nilo (2022)",
        "patterns": [
          "morte no nilo",
          "death on the nile"
        ],
        "year": 2022
      },
      {
        "name": "Os 8 Odiados (2015)",
        "patterns": [
          "os 8 odiados",
          "os oito odiados",
          "the hateful eight"
        ],
        "year": 2015
      },
      {
        "name": "Os Sete Suspeitos (1985)",
        "patterns": [
          "os sete suspeitos",
          "clue"
        ],
        "year": 1985
      },
      {
        "name": "Veja Como Eles Dançam (2022)",
        "patterns": [
          "veja como eles dancam",
          "veja como eles dançam",
          "see how they run"
        ],
        "year": 2022
      },
      {
        "name": "A Noite das Bruxas (2023)",
        "patterns": [
          "a noite das bruxas",
          "a haunting in venice"
        ],
        "year": 2023
      }
    ]
  },
  "sort_order": 733
},
{
  "id": "ss_filme_virou_serie",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "gold",
  "title": "Sessão Secreta: O Filme É Melhor? (Das Telonas para as Telinhas)",
  "description": "Conquistar pelo menos 6 de 10 filmes que deram origem a séries famosas de TV ou spin-offs (Meta: 6 de 10 filmes).",
  "icon": "📺",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 10,
    "minTarget": 6,
    "movies": [
      {
        "name": "O Que Fazemos nas Sombras (2014)",
        "patterns": [
          "o que fazemos nas sombras",
          "what we do in the shadows"
        ],
        "year": 2014
      },
      {
        "name": "Fargo (1996)",
        "patterns": [
          "fargo"
        ],
        "year": 1996
      },
      {
        "name": "Psicose (1960)",
        "patterns": [
          "psicose",
          "psycho"
        ],
        "year": 1960
      },
      {
        "name": "Karatê Kid: A Hora da Verdade (1984)",
        "patterns": [
          "karate kid",
          "karatê kid",
          "the karate kid"
        ],
        "year": 1984
      },
      {
        "name": "Expresso do Amanhã (2013)",
        "patterns": [
          "expresso do amanha",
          "expresso do amanhã",
          "snowpiercer"
        ],
        "year": 2013
      },
      {
        "name": "Westworld: Onde Ninguém Tem Alma (1973)",
        "patterns": [
          "westworld"
        ],
        "year": 1973
      },
      {
        "name": "Pânico (1996)",
        "patterns": [
          "panico",
          "pânico",
          "scream"
        ],
        "year": 1996,
        "exclude": [
          "pânico 2",
          "pânico 3",
          "pânico 4",
          "pânico 5",
          "pânico 6",
          "scream 2",
          "scream 3",
          "scream 4",
          "scream 5",
          "scream 6"
        ]
      },
      {
        "name": "Brinquedo Assassino (1988)",
        "patterns": [
          "brinquedo assassino",
          "child's play",
          "childs play"
        ],
        "year": 1988,
        "exclude": [
          "brinquedo assassino 2",
          "brinquedo assassino 3",
          "child's play 2",
          "child's play 3"
        ]
      },
      {
        "name": "Sem Limites (2011)",
        "patterns": [
          "sem limites",
          "limitless"
        ],
        "year": 2011
      },
      {
        "name": "Duna (2021)",
        "patterns": [
          "duna",
          "dune"
        ],
        "year": 2021,
        "exclude": [
          "parte dois",
          "part two",
          "duna 2",
          "dune 2"
        ]
      }
    ]
  },
  "sort_order": 734
},
{
  "id": "ss_infancia_guerra_dor",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "gold",
  "title": "Sessão Secreta: Estou Chocado! (Infância Roubada na Guerra e na Dor)",
  "description": "Conquistar pelo menos 6 de 10 filmes densos sobre crianças em contextos de guerra ou tragédia extrema (Meta: 6 de 10 filmes).",
  "icon": "💔",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 10,
    "minTarget": 6,
    "movies": [
      {
        "name": "A Infância de Ivan (1962)",
        "patterns": [
          "a infancia de ivan",
          "a infância de ivan",
          "ivan's childhood",
          "ivans childhood"
        ],
        "year": 1962
      },
      {
        "name": "Vá e Veja (1985)",
        "patterns": [
          "va e veja",
          "vá e veja",
          "come and see",
          "idi i smotri"
        ],
        "year": 1985
      },
      {
        "name": "Beasts of No Nation (2015)",
        "patterns": [
          "beasts of no nation"
        ],
        "year": 2015
      },
      {
        "name": "Close (2022)",
        "patterns": [
          "close"
        ],
        "year": 2022
      },
      {
        "name": "Túmulo dos Vagalumes (1988)",
        "patterns": [
          "tumulo dos vagalumes",
          "túmulo dos vagalumes",
          "grave of the fireflies",
          "hotaru no haka"
        ],
        "year": 1988
      },
      {
        "name": "O Menino do Pijama Listrado (2008)",
        "patterns": [
          "o menino do pijama listrado",
          "the boy in the striped pajamas"
        ],
        "year": 2008
      },
      {
        "name": "Cafarnaum (2018)",
        "patterns": [
          "cafarnaum",
          "capernaum",
          "capharnaum"
        ],
        "year": 2018
      },
      {
        "name": "Jojo Rabbit (2019)",
        "patterns": [
          "jojo rabbit"
        ],
        "year": 2019
      },
      {
        "name": "Império do Sol (1987)",
        "patterns": [
          "imperio do sol",
          "império do sol",
          "empire of the sun"
        ],
        "year": 1987
      },
      {
        "name": "Cidade de Deus (2002)",
        "patterns": [
          "cidade de deus",
          "city of god"
        ],
        "year": 2002
      }
    ]
  },
  "sort_order": 735
},
{
  "id": "ss_sessao_da_tarde_classicos",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "gold",
  "title": "Sessão Secreta: A Tarde Toda! (Uma Turma da Pesada Aprontando Altas Confusões)",
  "description": "Conquistar pelo menos 9 de 12 clássicos absolutos da Sessão da Tarde (Meta: 9 de 12 filmes).",
  "icon": "🍿",
  "target_type": "secret_session_curated",
  "target_value": 9,
  "target_metadata": {
    "curatedCount": 12,
    "minTarget": 9,
    "movies": [
      {
        "name": "A Lagoa Azul (1980)",
        "patterns": [
          "a lagoa azul",
          "the blue lagoon"
        ],
        "year": 1980
      },
      {
        "name": "Curtindo a Vida Adoidado (1986)",
        "patterns": [
          "curtindo a vida adoidado",
          "ferris bueller's day off",
          "ferris bueller"
        ],
        "year": 1986
      },
      {
        "name": "Matilda (1996)",
        "patterns": [
          "matilda"
        ],
        "year": 1996
      },
      {
        "name": "Esqueceram de Mim (1990)",
        "patterns": [
          "esqueceram de mim",
          "home alone"
        ],
        "year": 1990,
        "exclude": [
          "esqueceram de mim 2",
          "home alone 2"
        ]
      },
      {
        "name": "Ghost: Do Outro Lado da Vida (1990)",
        "patterns": [
          "ghost",
          "do outro lado da vida"
        ],
        "year": 1990
      },
      {
        "name": "As Branquelas (2004)",
        "patterns": [
          "as branquelas",
          "white chicks"
        ],
        "year": 2004
      },
      {
        "name": "Jumanji (1995)",
        "patterns": [
          "jumanji"
        ],
        "year": 1995,
        "exclude": [
          "bem-vindo a selva",
          "proxima fase"
        ]
      },
      {
        "name": "De Volta para o Futuro (1985)",
        "patterns": [
          "de volta para o futuro",
          "back to the future"
        ],
        "year": 1985,
        "exclude": [
          "parte ii",
          "parte 2",
          "part ii",
          "part 2",
          "parte iii",
          "parte 3",
          "part iii",
          "part 3"
        ]
      },
      {
        "name": "Querida, Encolhi as Crianças (1989)",
        "patterns": [
          "querida encolhi as criancas",
          "querida, encolhi as crianças",
          "honey, i shrunk the kids",
          "honey i shrunk the kids"
        ],
        "year": 1989
      },
      {
        "name": "Karatê Kid: A Hora da Verdade (1984)",
        "patterns": [
          "karate kid",
          "karatê kid",
          "the karate kid"
        ],
        "year": 1984
      },
      {
        "name": "Meu Primeiro Amor (1991)",
        "patterns": [
          "meu primeiro amor",
          "my girl"
        ],
        "year": 1991
      },
      {
        "name": "Os Goonies (1985)",
        "patterns": [
          "os goonies",
          "the goonies",
          "goonies"
        ],
        "year": 1985
      }
    ]
  },
  "sort_order": 736
},
{
  "id": "ss_mestre_dos_golpes",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "gold",
  "title": "Sessão Secreta: O Mestre dos Golpes: Me Engana que Eu Gosto!",
  "description": "Conquistar pelo menos 6 de 8 filmes de trapaceiros, vigaristas e grandes golpes (Meta: 6 de 8 filmes).",
  "icon": "🃏",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 6,
    "movies": [
      {
        "name": "Prenda-me Se For Capaz (2002)",
        "patterns": [
          "prenda-me se for capaz",
          "prenda me se for capaz",
          "catch me if you can"
        ],
        "year": 2002
      },
      {
        "name": "O Lobo de Wall Street (2013)",
        "patterns": [
          "o lobo de wall street",
          "lobo de wall street",
          "the wolf of wall street"
        ],
        "year": 2013
      },
      {
        "name": "Onze Homens e um Segredo (2001)",
        "patterns": [
          "onze homens e um segredo",
          "ocean's eleven",
          "oceans eleven"
        ],
        "year": 2001
      },
      {
        "name": "Truque de Mestre (2013)",
        "patterns": [
          "truque de mestre",
          "now you see me"
        ],
        "year": 2013,
        "exclude": [
          "segundo ato",
          "second act",
          "now you see me 2"
        ]
      },
      {
        "name": "Trapaça (2013)",
        "patterns": [
          "trapaca",
          "trapaça",
          "american hustle"
        ],
        "year": 2013
      },
      {
        "name": "Golpe de Mestre (1973)",
        "patterns": [
          "golpe de mestre",
          "the sting"
        ],
        "year": 1973
      },
      {
        "name": "Foco (2015)",
        "patterns": [
          "foco",
          "focus"
        ],
        "year": 2015
      },
      {
        "name": "Os Vigaristas (2003)",
        "patterns": [
          "os vigaristas",
          "matchstick men"
        ],
        "year": 2003
      }
    ]
  },
  "sort_order": 737
},
{
  "id": "ss_paranoia_total",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "gold",
  "title": "Sessão Secreta: Paranoia Total: É Real ou Tá na Minha Cabeça?!",
  "description": "Conquistar pelo menos 6 de 8 filmes de delírio psicológico e quebra de realidade (Meta: 6 de 8 filmes).",
  "icon": "🌀",
  "target_type": "secret_session_curated",
  "target_value": 6,
  "target_metadata": {
    "curatedCount": 8,
    "minTarget": 6,
    "movies": [
      {
        "name": "A Origem (2010)",
        "patterns": [
          "a origem",
          "inception"
        ],
        "year": 2010
      },
      {
        "name": "Cisne Negro (2010)",
        "patterns": [
          "cisne negro",
          "black swan"
        ],
        "year": 2010
      },
      {
        "name": "Brilho Eterno de uma Mente Sem Lembranças (2004)",
        "patterns": [
          "brilho eterno de uma mente sem lembrancas",
          "brilho eterno de uma mente sem lembranças",
          "eternal sunshine of the spotless mind",
          "brilho eterno"
        ],
        "year": 2004
      },
      {
        "name": "O Operário (2004)",
        "patterns": [
          "o operario",
          "o operário",
          "the machinist"
        ],
        "year": 2004
      },
      {
        "name": "Amnésia (2000)",
        "patterns": [
          "amnesia",
          "amnésia",
          "memento"
        ],
        "year": 2000
      },
      {
        "name": "Réquiem para um Sonho (2000)",
        "patterns": [
          "requiem para um sonho",
          "réquiem para um sonho",
          "requiem for a dream"
        ],
        "year": 2000
      },
      {
        "name": "Psicopata Americano (2000)",
        "patterns": [
          "psicopata americano",
          "american psycho"
        ],
        "year": 2000
      },
      {
        "name": "Vanilla Sky (2001)",
        "patterns": [
          "vanilla sky"
        ],
        "year": 2001
      }
    ]
  },
  "sort_order": 738
},
{
  "id": "ss_dicionario_az_26",
  "category": "sessao_secreta",
  "categories": [
    "sessao_secreta"
  ],
  "tier": "mythic",
  "title": "Sessão Secreta: O Dicionário Completo de A a Z!",
  "description": "Conquistar pelo menos 1 filme que inicie com CADA UMA das 26 letras do alfabeto, de A até Z (26 letras no checklist).",
  "icon": "🔤",
  "target_type": "alphabet_az_coverage",
  "target_value": 26,
  "target_metadata": {
    "targetLetters": 26
  },
  "sort_order": 739
},
{
  "id": "cf_fernanda_torres",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: A Princesa do Brasil (Cultura no Sangue e Talento Puro!)",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Fernanda Torres (Meta: 10 de 20 filmes).",
  "icon": "👑",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Ainda Estou Aqui (2024)",
        "patterns": [
          "ainda estou aqui",
          "i'm still here",
          "im still here"
        ],
        "year": 2024
      },
      {
        "name": "Os Normais: O Filme (2003)",
        "patterns": [
          "os normais o filme",
          "os normais"
        ],
        "year": 2003,
        "exclude": [
          "os normais 2",
          "noite mais maluca"
        ]
      },
      {
        "name": "Os Normais 2: A Noite Mais Maluca de Todas (2009)",
        "patterns": [
          "os normais 2",
          "noite mais maluca"
        ],
        "year": 2009
      },
      {
        "name": "Terra Estrangeira (1995)",
        "patterns": [
          "terra estrangeira",
          "foreign land"
        ],
        "year": 1995
      },
      {
        "name": "Casa de Areia (2005)",
        "patterns": [
          "casa de areia",
          "the house of sand"
        ],
        "year": 2005
      },
      {
        "name": "O Que É Isso, Companheiro? (1997)",
        "patterns": [
          "o que e isso companheiro",
          "o que é isso companheiro",
          "four days in september"
        ],
        "year": 1997
      },
      {
        "name": "Saneamento Básico, O Filme (2007)",
        "patterns": [
          "saneamento basico",
          "saneamento básico"
        ],
        "year": 2007
      },
      {
        "name": "Eu Sei Que Vou Te Amar (1986)",
        "patterns": [
          "eu sei que vou te amar",
          "love me forever or never"
        ],
        "year": 1986
      },
      {
        "name": "A Marvada Carne (1985)",
        "patterns": [
          "a marvada carne"
        ],
        "year": 1985
      },
      {
        "name": "Com Licença, Eu Vou à Luta (1986)",
        "patterns": [
          "com licenca eu vou a luta",
          "com licença eu vou à luta"
        ],
        "year": 1986
      },
      {
        "name": "Kuarup (1989)",
        "patterns": [
          "kuarup",
          "quarup"
        ],
        "year": 1989
      },
      {
        "name": "Gêmeas (1999)",
        "patterns": [
          "gemeas",
          "gêmeas"
        ],
        "year": 1999
      },
      {
        "name": "Redentor (2004)",
        "patterns": [
          "redentor"
        ],
        "year": 2004
      },
      {
        "name": "Jogo de Cena (2007)",
        "patterns": [
          "jogo de cena",
          "playing"
        ],
        "year": 2007
      },
      {
        "name": "O Judeu (1996)",
        "patterns": [
          "o judeu",
          "the jew"
        ],
        "year": 1996
      },
      {
        "name": "Inocência (1983)",
        "patterns": [
          "inocencia",
          "inocência"
        ],
        "year": 1983
      },
      {
        "name": "A Mulher do Próximo (1988)",
        "patterns": [
          "a mulher do proximo",
          "a mulher do próximo",
          "the other man's wife"
        ],
        "year": 1988
      },
      {
        "name": "A Guerra de um Homem (One Man's War, 1991)",
        "patterns": [
          "a guerra de um homem",
          "one man's war",
          "one mans war"
        ],
        "year": 1991
      },
      {
        "name": "O Primeiro Dia (1998)",
        "patterns": [
          "o primeiro dia",
          "midnight"
        ],
        "year": 1998
      },
      {
        "name": "O Sonho Não Acabou (1982)",
        "patterns": [
          "o sonho nao acabou",
          "o sonho não acabou"
        ],
        "year": 1982
      }
    ]
  },
  "sort_order": 740
},
{
  "id": "cf_fernanda_montenegro",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "gold",
  "title": "Calçada da Fama: A Rainha Absoluta do Brasil (Patrimônio Nacional Tombado)",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Fernanda Montenegro (Meta: 10 de 20 filmes).",
  "icon": "👸",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Central do Brasil (1998)",
        "patterns": [
          "central do brasil",
          "central station"
        ],
        "year": 1998
      },
      {
        "name": "O Auto da Compadecida (2000)",
        "patterns": [
          "o auto da compadecida",
          "a dog's will",
          "a dogs will"
        ],
        "year": 2000,
        "exclude": [
          "compadecida 2",
          "auto da compadecida 2"
        ]
      },
      {
        "name": "Casa de Areia (2005)",
        "patterns": [
          "casa de areia",
          "the house of sand"
        ],
        "year": 2005
      },
      {
        "name": "A Vida Invisível (2019)",
        "patterns": [
          "a vida invisivel",
          "a vida invisível",
          "the invisible life"
        ],
        "year": 2019
      },
      {
        "name": "Ainda Estou Aqui (2024)",
        "patterns": [
          "ainda estou aqui",
          "i'm still here",
          "im still here"
        ],
        "year": 2024
      },
      {
        "name": "Eles Não Usam Black-tie (1981)",
        "patterns": [
          "eles nao usam black-tie",
          "eles não usam black-tie",
          "eles nao usam black tie",
          "they don't wear black tie"
        ],
        "year": 1981
      },
      {
        "name": "O Beijo no Asfalto (1981)",
        "patterns": [
          "o beijo no asfalto",
          "the kiss"
        ],
        "year": 1981
      },
      {
        "name": "Vitória (2025)",
        "patterns": [
          "vitoria",
          "vitória"
        ],
        "year": 2025
      },
      {
        "name": "O Que É Isso, Companheiro? (1997)",
        "patterns": [
          "o que e isso companheiro",
          "o que é isso companheiro",
          "four days in september"
        ],
        "year": 1997
      },
      {
        "name": "Redentor (2004)",
        "patterns": [
          "redentor"
        ],
        "year": 2004
      },
      {
        "name": "Olga (2004)",
        "patterns": [
          "olga"
        ],
        "year": 2004
      },
      {
        "name": "O Outro Lado da Rua (2004)",
        "patterns": [
          "o outro lado da rua",
          "the other side of the street"
        ],
        "year": 2004
      },
      {
        "name": "Traição (1998)",
        "patterns": [
          "traicao",
          "traição",
          "betrayal"
        ],
        "year": 1998
      },
      {
        "name": "O Tempo e o Vento (2013)",
        "patterns": [
          "o tempo e o vento",
          "time and the wind"
        ],
        "year": 2013
      },
      {
        "name": "Dona Flor e Seus Dois Maridos (2017)",
        "patterns": [
          "dona flor e seus dois maridos",
          "dona flor"
        ],
        "year": 2017
      },
      {
        "name": "A Falecida (1965)",
        "patterns": [
          "a falecida",
          "the deceased"
        ],
        "year": 1965
      },
      {
        "name": "Piedade (2019)",
        "patterns": [
          "piedade",
          "mercy"
        ],
        "year": 2019
      },
      {
        "name": "O Amor nos Tempos do Cólera (2007)",
        "patterns": [
          "o amor nos tempos do colera",
          "o amor nos tempos do cólera",
          "love in the time of cholera"
        ],
        "year": 2007
      },
      {
        "name": "Infância (2014)",
        "patterns": [
          "infancia",
          "infância",
          "childhood"
        ],
        "year": 2014,
        "exclude": [
          "boyhood"
        ]
      },
      {
        "name": "O Auto da Compadecida 2 (2024)",
        "patterns": [
          "auto da compadecida 2",
          "o auto da compadecida 2"
        ],
        "year": 2024
      }
    ]
  },
  "sort_order": 741
},
{
  "id": "cf_wagner_moura",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "gold",
  "title": "Calçada da Fama: O Rei do Brasil: Pede pra Sair ou Leva a Estatueta!",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Wagner Moura (Meta: 10 de 20 filmes).",
  "icon": "⚡",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Tropa de Elite (2007)",
        "patterns": [
          "tropa de elite",
          "elite squad"
        ],
        "year": 2007,
        "exclude": [
          "tropa de elite 2",
          "o inimigo agora e outro",
          "o inimigo agora é outro"
        ]
      },
      {
        "name": "Tropa de Elite 2: O Inimigo Agora É Outro (2010)",
        "patterns": [
          "tropa de elite 2",
          "o inimigo agora e outro",
          "o inimigo agora é outro",
          "elite squad the enemy within"
        ],
        "year": 2010
      },
      {
        "name": "Guerra Civil (Civil War, 2024)",
        "patterns": [
          "guerra civil",
          "civil war"
        ],
        "year": 2024,
        "exclude": [
          "capitao america",
          "capitão américa"
        ]
      },
      {
        "name": "Elysium (2013)",
        "patterns": [
          "elysium"
        ],
        "year": 2013
      },
      {
        "name": "Carandiru (2003)",
        "patterns": [
          "carandiru"
        ],
        "year": 2003
      },
      {
        "name": "O Homem do Futuro (2011)",
        "patterns": [
          "o homem do futuro",
          "the man from the future"
        ],
        "year": 2011
      },
      {
        "name": "Praia do Futuro (2014)",
        "patterns": [
          "praia do futuro",
          "futuro beach"
        ],
        "year": 2014
      },
      {
        "name": "Gato de Botas 2: O Último Pedido (2022)",
        "patterns": [
          "gato de botas 2",
          "o ultimo pedido",
          "o último pedido",
          "the last wish",
          "puss in boots the last wish"
        ],
        "year": 2022
      },
      {
        "name": "Sergio (2020)",
        "patterns": [
          "sergio"
        ],
        "year": 2020
      },
      {
        "name": "O Caminho das Nuvens (2003)",
        "patterns": [
          "o caminho das nuvens",
          "the middle of the world"
        ],
        "year": 2003
      },
      {
        "name": "Ó Paí, Ó (2007)",
        "patterns": [
          "o pai o",
          "ó paí, ó",
          "o pai, o"
        ],
        "year": 2007,
        "exclude": [
          "o pai o 2",
          "ó paí, ó 2"
        ]
      },
      {
        "name": "Deus É Brasileiro (2003)",
        "patterns": [
          "deus e brasileiro",
          "deus é brasileiro",
          "god is brazilian"
        ],
        "year": 2003
      },
      {
        "name": "A Busca (2012)",
        "patterns": [
          "a busca",
          "father's chair",
          "fathers chair"
        ],
        "year": 2012
      },
      {
        "name": "Wasp Network: Rede de Espiões (2019)",
        "patterns": [
          "wasp network",
          "rede de espioes",
          "rede de espiões"
        ],
        "year": 2019
      },
      {
        "name": "Agente Oculto (The Gray Man, 2022)",
        "patterns": [
          "agente oculto",
          "the gray man"
        ],
        "year": 2022
      },
      {
        "name": "Saneamento Básico, O Filme (2007)",
        "patterns": [
          "saneamento basico",
          "saneamento básico"
        ],
        "year": 2007
      },
      {
        "name": "VIPs (2010)",
        "patterns": [
          "vips"
        ],
        "year": 2010
      },
      {
        "name": "Romance (2008)",
        "patterns": [
          "romance"
        ],
        "year": 2008
      },
      {
        "name": "Abril Despedaçado (2001)",
        "patterns": [
          "abril despedacado",
          "abril despedaçado",
          "behind the sun"
        ],
        "year": 2001
      },
      {
        "name": "As Três Marias (2002)",
        "patterns": [
          "as tres marias",
          "as três marias",
          "the three marias"
        ],
        "year": 2002
      }
    ]
  },
  "sort_order": 742
},
{
  "id": "cf_robert_downey_jr",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: Eu Sou... Muito Mais que o Homem de Ferro e Doutor Destino!",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Robert Downey Jr. (Meta: 10 de 20 filmes).",
  "icon": "🦾",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Oppenheimer (2023)",
        "patterns": [
          "oppenheimer"
        ],
        "year": 2023
      },
      {
        "name": "Homem de Ferro (Iron Man, 2008)",
        "patterns": [
          "homem de ferro",
          "iron man"
        ],
        "year": 2008,
        "exclude": [
          "homem de ferro 2",
          "homem de ferro 3",
          "iron man 2",
          "iron man 3"
        ]
      },
      {
        "name": "Homem de Ferro 2 (2010)",
        "patterns": [
          "homem de ferro 2",
          "iron man 2"
        ],
        "year": 2010
      },
      {
        "name": "Homem de Ferro 3 (2013)",
        "patterns": [
          "homem de ferro 3",
          "iron man 3"
        ],
        "year": 2013
      },
      {
        "name": "Os Vingadores (The Avengers, 2012)",
        "patterns": [
          "os vingadores",
          "the avengers"
        ],
        "year": 2012,
        "exclude": [
          "era de ultron",
          "guerra infinita",
          "ultimato",
          "age of ultron",
          "infinity war",
          "endgame"
        ]
      },
      {
        "name": "Vingadores: Era de Ultron (2015)",
        "patterns": [
          "era de ultron",
          "age of ultron"
        ],
        "year": 2015
      },
      {
        "name": "Vingadores: Guerra Infinita (2018)",
        "patterns": [
          "guerra infinita",
          "infinity war"
        ],
        "year": 2018
      },
      {
        "name": "Vingadores: Ultimato (2019)",
        "patterns": [
          "ultimato",
          "endgame"
        ],
        "year": 2019
      },
      {
        "name": "Capitão América: Guerra Civil (2016)",
        "patterns": [
          "guerra civil",
          "civil war"
        ],
        "year": 2016,
        "requireAdditionalPatterns": [
          "capitao america",
          "capitão américa",
          "captain america"
        ]
      },
      {
        "name": "Homem-Aranha: De Volta ao Lar (2017)",
        "patterns": [
          "de volta ao lar",
          "homecoming"
        ],
        "year": 2017
      },
      {
        "name": "Sherlock Holmes (2009)",
        "patterns": [
          "sherlock holmes"
        ],
        "year": 2009,
        "exclude": [
          "jogo de sombras",
          "game of shadows"
        ]
      },
      {
        "name": "Sherlock Holmes: O Jogo de Sombras (2011)",
        "patterns": [
          "jogo de sombras",
          "a game of shadows"
        ],
        "year": 2011
      },
      {
        "name": "Trovão Tropical (Tropic Thunder, 2008)",
        "patterns": [
          "trovao tropical",
          "trovão tropical",
          "tropic thunder"
        ],
        "year": 2008
      },
      {
        "name": "Zodíaco (Zodiac, 2007)",
        "patterns": [
          "zodiaco",
          "zodíaco",
          "zodiac"
        ],
        "year": 2007
      },
      {
        "name": "O Juiz (The Judge, 2014)",
        "patterns": [
          "o juiz",
          "the judge"
        ],
        "year": 2014
      },
      {
        "name": "Beijos e Tiros (Kiss Kiss Bang Bang, 2005)",
        "patterns": [
          "beijos e tiros",
          "kiss kiss bang bang"
        ],
        "year": 2005
      },
      {
        "name": "Chaplin (1992)",
        "patterns": [
          "chaplin"
        ],
        "year": 1992
      },
      {
        "name": "Um Parto de Risco (Due Date, 2010)",
        "patterns": [
          "um parto de risco",
          "due date"
        ],
        "year": 2010
      },
      {
        "name": "Dolittle (2020)",
        "patterns": [
          "dolittle"
        ],
        "year": 2020
      },
      {
        "name": "Assassinos por Natureza (Natural Born Killers, 1994)",
        "patterns": [
          "assassinos por natureza",
          "natural born killers"
        ],
        "year": 1994
      }
    ]
  },
  "sort_order": 743
},
{
  "id": "cf_benedict_cumberbatch",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: Benedict Cumber... Como se Pronuncia Esse Nome Mesmo?!",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Benedict Cumberbatch (Meta: 10 de 20 filmes).",
  "icon": "🧙‍♂️",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "O Jogo da Imitação (The Imitation Game, 2014)",
        "patterns": [
          "o jogo da imitacao",
          "o jogo da imitação",
          "the imitation game"
        ],
        "year": 2014
      },
      {
        "name": "Doutor Estranho (Doctor Strange, 2016)",
        "patterns": [
          "doutor estranho",
          "doctor strange"
        ],
        "year": 2016,
        "exclude": [
          "multiverso da loucura",
          "multiverse of madness"
        ]
      },
      {
        "name": "Doutor Estranho no Multiverso da Loucura (2022)",
        "patterns": [
          "multiverso da loucura",
          "multiverse of madness"
        ],
        "year": 2022
      },
      {
        "name": "Homem-Aranha: Sem Volta para Casa (2021)",
        "patterns": [
          "sem volta para casa",
          "no way home"
        ],
        "year": 2021
      },
      {
        "name": "Vingadores: Guerra Infinita (2018)",
        "patterns": [
          "guerra infinita",
          "infinity war"
        ],
        "year": 2018
      },
      {
        "name": "Vingadores: Ultimato (2019)",
        "patterns": [
          "ultimato",
          "endgame"
        ],
        "year": 2019
      },
      {
        "name": "O Poder do Cão (The Power of the Dog, 2021)",
        "patterns": [
          "o poder do cao",
          "o poder do cão",
          "the power of the dog"
        ],
        "year": 2021
      },
      {
        "name": "1917 (2019)",
        "patterns": [
          "1917"
        ],
        "year": 2019
      },
      {
        "name": "Além da Escuridão: Star Trek (2013)",
        "patterns": [
          "alem da escuridao star trek",
          "além da escuridão star trek",
          "star trek into darkness",
          "into darkness"
        ],
        "year": 2013
      },
      {
        "name": "O Hobbit: A Desolação de Smaug (2013)",
        "patterns": [
          "a desolacao de smaug",
          "a desolação de smaug",
          "the desolation of smaug"
        ],
        "year": 2013
      },
      {
        "name": "A Incrível História de Henry Sugar (2023)",
        "patterns": [
          "a incrivel historia de henry sugar",
          "a incrível história de henry sugar",
          "the wonderful story of henry sugar",
          "henry sugar"
        ],
        "year": 2023
      },
      {
        "name": "Aliança do Crime (Black Mass, 2015)",
        "patterns": [
          "alianca do crime",
          "aliança do crime",
          "black mass"
        ],
        "year": 2015
      },
      {
        "name": "O Espião Que Sabia Demais (Tinker Tailor Soldier Spy, 2011)",
        "patterns": [
          "o espiao que sabia demais",
          "o espião que sabia demais",
          "tinker tailor soldier spy"
        ],
        "year": 2011
      },
      {
        "name": "12 Anos de Escravidão (12 Years a Slave, 2013)",
        "patterns": [
          "12 anos de escravidao",
          "12 anos de escravidão",
          "12 years a slave"
        ],
        "year": 2013
      },
      {
        "name": "O Grinch (The Grinch, 2018)",
        "patterns": [
          "o grinch",
          "the grinch"
        ],
        "year": 2018
      },
      {
        "name": "A Batalha das Correntes (The Current War, 2017)",
        "patterns": [
          "a batalha das correntes",
          "the current war"
        ],
        "year": 2017
      },
      {
        "name": "Cavalo de Guerra (War Horse, 2011)",
        "patterns": [
          "cavalo de guerra",
          "war horse"
        ],
        "year": 2011
      },
      {
        "name": "Álbum de Família (August: Osage County, 2013)",
        "patterns": [
          "album de familia",
          "álbum de família",
          "august osage county"
        ],
        "year": 2013
      },
      {
        "name": "A Criação (Creation, 2009)",
        "patterns": [
          "a criacao",
          "a criação",
          "creation"
        ],
        "year": 2009
      },
      {
        "name": "A Outra (The Other Boleyn Girl, 2008)",
        "patterns": [
          "a outra",
          "the other boleyn girl"
        ],
        "year": 2008
      }
    ]
  },
  "sort_order": 744
},
{
  "id": "cf_milla_jovovich",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: Ela Tem Nome!! (Atriz: Esposa do Paul W.S. Anderson)",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Milla Jovovich (Meta: 10 de 20 filmes).",
  "icon": "🧟‍♀️",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "O Quinto Elemento (The Fifth Element, 1997)",
        "patterns": [
          "o quinto elemento",
          "the fifth element"
        ],
        "year": 1997
      },
      {
        "name": "Resident Evil: O Hóspede Maldito (2002)",
        "patterns": [
          "o hospede maldito",
          "o hóspede maldito",
          "resident evil"
        ],
        "year": 2002,
        "exclude": [
          "apocalipse",
          "apocalypse",
          "extincao",
          "extinção",
          "extinction",
          "recomeco",
          "recomeço",
          "afterlife",
          "retribuicao",
          "retribuição",
          "retribution",
          "capitulo final",
          "capítulo final",
          "the final chapter",
          "bem-vindo a raccoon city"
        ]
      },
      {
        "name": "Resident Evil 2: Apocalipse (2004)",
        "patterns": [
          "resident evil apocalipse",
          "resident evil 2",
          "resident evil apocalypse"
        ],
        "year": 2004
      },
      {
        "name": "Resident Evil 3: A Extinção (2007)",
        "patterns": [
          "resident evil a extincao",
          "resident evil a extinção",
          "resident evil 3",
          "resident evil extinction"
        ],
        "year": 2007
      },
      {
        "name": "Resident Evil 4: Recomeço (2010)",
        "patterns": [
          "resident evil recomeco",
          "resident evil recomeço",
          "resident evil 4",
          "resident evil afterlife"
        ],
        "year": 2010
      },
      {
        "name": "Resident Evil 5: Retribuição (2012)",
        "patterns": [
          "resident evil retribuicao",
          "resident evil retribuição",
          "resident evil 5",
          "resident evil retribution"
        ],
        "year": 2012
      },
      {
        "name": "Resident Evil 6: O Capítulo Final (2016)",
        "patterns": [
          "o capitulo final",
          "o capítulo final",
          "the final chapter",
          "resident evil 6"
        ],
        "year": 2016
      },
      {
        "name": "Monster Hunter (2020)",
        "patterns": [
          "monster hunter"
        ],
        "year": 2020
      },
      {
        "name": "Os Três Mosqueteiros (2011)",
        "patterns": [
          "os tres mosqueteiros",
          "os três mosqueteiros",
          "the three musketeers"
        ],
        "year": 2011
      },
      {
        "name": "Ultravioleta (Ultraviolet, 2006)",
        "patterns": [
          "ultravioleta",
          "ultraviolet"
        ],
        "year": 2006
      },
      {
        "name": "Hellboy (2019)",
        "patterns": [
          "hellboy"
        ],
        "year": 2019
      },
      {
        "name": "De Volta à Lagoa Azul (Return to the Blue Lagoon, 1991)",
        "patterns": [
          "de volta a lagoa azul",
          "de volta à lagoa azul",
          "return to the blue lagoon"
        ],
        "year": 1991
      },
      {
        "name": "Contatos de 4º Grau (The Fourth Kind, 2009)",
        "patterns": [
          "contatos de 4o grau",
          "contatos de 4º grau",
          "the fourth kind"
        ],
        "year": 2009
      },
      {
        "name": "Zoolander (2001)",
        "patterns": [
          "zoolander"
        ],
        "year": 2001,
        "exclude": [
          "zoolander 2"
        ]
      },
      {
        "name": "Perseguição Mortal (Survivor, 2015)",
        "patterns": [
          "perseguicao mortal",
          "perseguição mortal",
          "survivor"
        ],
        "year": 2015
      },
      {
        "name": "Jovens, Loucos e Rebeldes (Dazed and Confused, 1993)",
        "patterns": [
          "jovens loucos e rebeldes",
          "dazed and confused"
        ],
        "year": 1993
      },
      {
        "name": "Joana D'Arc de Luc Besson (The Messenger, 1999)",
        "patterns": [
          "joana d arc",
          "joana d'arc",
          "the messenger the story of joan of arc",
          "joan of arc"
        ],
        "year": 1999
      },
      {
        "name": "Uma Noite Perfeita para Crimes (A Perfect Getaway, 2009)",
        "patterns": [
          "uma noite perfeita para crimes",
          "a perfect getaway"
        ],
        "year": 2009
      },
      {
        "name": "Amor Sem Limites (Dummy, 2002)",
        "patterns": [
          "amor sem limites",
          "dummy"
        ],
        "year": 2002
      },
      {
        "name": "In the Lost Lands (2025)",
        "patterns": [
          "in the lost lands"
        ],
        "year": 2025
      }
    ]
  },
  "sort_order": 745
},
{
  "id": "cf_will_smith",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: Um Maluco nas Telas: Do Pedaço até o Oscar!",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Will Smith (Meta: 10 de 20 filmes).",
  "icon": "🕶️",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "À Procura da Felicidade (The Pursuit of Happyness, 2006)",
        "patterns": [
          "a procura da felicidade",
          "à procura da felicidade",
          "the pursuit of happyness"
        ],
        "year": 2006
      },
      {
        "name": "Eu Sou a Lenda (I Am Legend, 2007)",
        "patterns": [
          "eu sou a lenda",
          "i am legend"
        ],
        "year": 2007
      },
      {
        "name": "Homens de Preto (Men in Black, 1997)",
        "patterns": [
          "homens de preto",
          "men in black"
        ],
        "year": 1997,
        "exclude": [
          "homens de preto 2",
          "homens de preto 3",
          "men in black 2",
          "men in black 3",
          "men in black international"
        ]
      },
      {
        "name": "Homens de Preto 2 (2002)",
        "patterns": [
          "homens de preto 2",
          "men in black 2",
          "men in black ii"
        ],
        "year": 2002
      },
      {
        "name": "Homens de Preto 3 (2012)",
        "patterns": [
          "homens de preto 3",
          "men in black 3",
          "men in black iii"
        ],
        "year": 2012
      },
      {
        "name": "King Richard: Criando Campeãs (2021)",
        "patterns": [
          "king richard"
        ],
        "year": 2021
      },
      {
        "name": "Hancock (2008)",
        "patterns": [
          "hancock"
        ],
        "year": 2008
      },
      {
        "name": "Eu, Robô (I, Robot, 2004)",
        "patterns": [
          "eu robo",
          "eu, robô",
          "i robot",
          "i, robot"
        ],
        "year": 2004
      },
      {
        "name": "Os Bad Boys (Bad Boys, 1995)",
        "patterns": [
          "os bad boys",
          "bad boys"
        ],
        "year": 1995,
        "exclude": [
          "bad boys 2",
          "bad boys ii",
          "bad boys para sempre",
          "bad boys for life",
          "bad boys ate o fim",
          "bad boys até o fim",
          "ride or die"
        ]
      },
      {
        "name": "Bad Boys 2 (2003)",
        "patterns": [
          "bad boys 2",
          "bad boys ii"
        ],
        "year": 2003
      },
      {
        "name": "Bad Boys para Sempre (Bad Boys for Life, 2020)",
        "patterns": [
          "bad boys para sempre",
          "bad boys for life"
        ],
        "year": 2020
      },
      {
        "name": "Bad Boys: Até o Fim (Bad Boys: Ride or Die, 2024)",
        "patterns": [
          "bad boys ate o fim",
          "bad boys até o fim",
          "bad boys: até o fim",
          "ride or die"
        ],
        "year": 2024
      },
      {
        "name": "Aladdin (2019)",
        "patterns": [
          "aladdin"
        ],
        "year": 2019
      },
      {
        "name": "Independence Day (1996)",
        "patterns": [
          "independence day"
        ],
        "year": 1996,
        "exclude": [
          "o ressurgimento",
          "resurgence"
        ]
      },
      {
        "name": "Sete Vidas (Seven Pounds, 2008)",
        "patterns": [
          "sete vidas",
          "seven pounds"
        ],
        "year": 2008
      },
      {
        "name": "Inimigo do Estado (Enemy of the State, 1998)",
        "patterns": [
          "inimigo do estado",
          "enemy of the state"
        ],
        "year": 1998
      },
      {
        "name": "Esquadrão Suicida (Suicide Squad, 2016)",
        "patterns": [
          "esquadrao suicida",
          "esquadrão suicida",
          "suicide squad"
        ],
        "year": 2016,
        "exclude": [
          "o esquadrao suicida",
          "the suicide squad"
        ]
      },
      {
        "name": "Golpe Duplo (Focus, 2015)",
        "patterns": [
          "golpe duplo",
          "focus"
        ],
        "year": 2015
      },
      {
        "name": "Ali (2001)",
        "patterns": [
          "ali"
        ],
        "year": 2001
      },
      {
        "name": "Emancipation: Uma História de Liberdade (2022)",
        "patterns": [
          "emancipation"
        ],
        "year": 2022
      }
    ]
  },
  "sort_order": 746
},
{
  "id": "cf_supernatural_trio",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "epic",
  "title": "Calçada da Fama: O Negócio da Família: Salvar Pessoas e Caçar Monstros!",
  "description": "Conquistar pelo menos 10 dos 20 filmes do trio de Supernatural (Jared Padalecki, Jensen Ackles ou Misha Collins) (Meta: 10 de 20 filmes).",
  "icon": "🚘",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Sexta-Feira 13 (Friday the 13th, 2009 — Jared)",
        "patterns": [
          "sexta feira 13",
          "sexta-feira 13",
          "friday the 13th"
        ],
        "year": 2009
      },
      {
        "name": "A Casa de Cera (House of Wax, 2005 — Jared)",
        "patterns": [
          "a casa de cera",
          "house of wax"
        ],
        "year": 2005
      },
      {
        "name": "Dia dos Namorados Macabro (My Bloody Valentine, 2009 — Jensen)",
        "patterns": [
          "dia dos namorados macabro",
          "my bloody valentine"
        ],
        "year": 2009
      },
      {
        "name": "Batman: Sob o Capuz Vermelho (2010 — Jensen)",
        "patterns": [
          "sob o capuz vermelho",
          "under the red hood"
        ],
        "year": 2010
      },
      {
        "name": "Batman: O Longo Dia das Bruxas - Parte 1 (2021 — Jensen)",
        "patterns": [
          "o longo dia das bruxas parte 1",
          "the long halloween part one",
          "o longo dia das bruxas - parte 1",
          "the long halloween part 1"
        ],
        "year": 2021
      },
      {
        "name": "Batman: O Longo Dia das Bruxas - Parte 2 (2021 — Jensen)",
        "patterns": [
          "o longo dia das bruxas parte 2",
          "the long halloween part two",
          "o longo dia das bruxas - parte 2",
          "the long halloween part 2"
        ],
        "year": 2021
      },
      {
        "name": "Liga da Justiça: Crise nas Infinitas Terras - Parte 1 (2024 — Jensen)",
        "patterns": [
          "crise nas infinitas terras parte 1",
          "crisis on infinite earths part one",
          "crise nas infinitas terras - parte 1"
        ],
        "year": 2024
      },
      {
        "name": "Liga da Justiça: Crise nas Infinitas Terras - Parte 2 (2024 — Jensen)",
        "patterns": [
          "crise nas infinitas terras parte 2",
          "crisis on infinite earths part two",
          "crise nas infinitas terras - parte 2"
        ],
        "year": 2024
      },
      {
        "name": "Liga da Justiça: Crise nas Infinitas Terras - Parte 3 (2024 — Jensen)",
        "patterns": [
          "crise nas infinitas terras parte 3",
          "crisis on infinite earths part three",
          "crise nas infinitas terras - parte 3"
        ],
        "year": 2024
      },
      {
        "name": "Garota, Interrompida (Girl, Interrupted, 1999 — Misha)",
        "patterns": [
          "garota interrompida",
          "garota, interrompida",
          "girl interrupted",
          "girl, interrupted"
        ],
        "year": 1999
      },
      {
        "name": "No Pique de Nova York (New York Minute, 2004 — Jared)",
        "patterns": [
          "no pique de nova york",
          "new york minute"
        ],
        "year": 2004
      },
      {
        "name": "Cry Wolf: O Jogo da Mentira (2005 — Jared)",
        "patterns": [
          "cry wolf",
          "o jogo da mentira"
        ],
        "year": 2005
      },
      {
        "name": "Doze É Demais (Cheaper by the Dozen, 2003 — Jared)",
        "patterns": [
          "doze e demais",
          "doze é demais",
          "cheaper by the dozen"
        ],
        "year": 2003
      },
      {
        "name": "O Voo da Fênix (Flight of the Phoenix, 2004 — Jared)",
        "patterns": [
          "o voo da fenix",
          "o voo da fênix",
          "flight of the phoenix"
        ],
        "year": 2004
      },
      {
        "name": "A Luz da Cidade (The Christmas Cottage, 2008 — Jared)",
        "patterns": [
          "a luz da cidade",
          "the christmas cottage",
          "thomas kinkade's the christmas cottage"
        ],
        "year": 2008
      },
      {
        "name": "Devour: A Maldição (2005 — Jensen)",
        "patterns": [
          "devour",
          "a maldicao",
          "a maldição"
        ],
        "year": 2005
      },
      {
        "name": "Ten Inch Hero (2007 — Jensen)",
        "patterns": [
          "ten inch hero"
        ],
        "year": 2007
      },
      {
        "name": "Nem Por Cima do Meu Cadáver (Over Her Dead Body, 2008 — Misha)",
        "patterns": [
          "nem por cima do meu cadaver",
          "nem por cima do meu cadáver",
          "over her dead body"
        ],
        "year": 2008
      },
      {
        "name": "Stonehenge Apocalypse (2010 — Misha)",
        "patterns": [
          "stonehenge apocalypse"
        ],
        "year": 2010
      },
      {
        "name": "Karla: Paixão Assassina (2006 — Misha)",
        "patterns": [
          "karla"
        ],
        "year": 2006
      }
    ]
  },
  "sort_order": 747
},
{
  "id": "cf_jim_parsons",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "bronze",
  "title": "Calçada da Fama: Bazinga! O Sheldon Cooper Foi Fazer Outra Coisa?!",
  "description": "Conquistar pelo menos 8 dos 18 filmes de Jim Parsons (Meta: 8 de 18 filmes).",
  "icon": "🖖",
  "target_type": "calcada_fama_curated",
  "target_value": 8,
  "target_metadata": {
    "curatedCount": 18,
    "minTarget": 8,
    "movies": [
      {
        "name": "Estrelas Além do Tempo (Hidden Figures, 2016)",
        "patterns": [
          "estrelas alem do tempo",
          "estrelas além do tempo",
          "hidden figures"
        ],
        "year": 2016
      },
      {
        "name": "The Boys in the Band (2020)",
        "patterns": [
          "the boys in the band"
        ],
        "year": 2020
      },
      {
        "name": "Ted Bundy: A Irresistível Face do Mal (2019)",
        "patterns": [
          "ted bundy a irresistivel face do mal",
          "ted bundy",
          "extremely wicked shockingly evil and vile"
        ],
        "year": 2019
      },
      {
        "name": "Uma Criança Como Jake (A Kid Like Jake, 2018)",
        "patterns": [
          "uma crianca como jake",
          "uma criança como jake",
          "a kid like jake"
        ],
        "year": 2018
      },
      {
        "name": "Spoiler Alert (2022)",
        "patterns": [
          "spoiler alert"
        ],
        "year": 2022
      },
      {
        "name": "O Grande Ano (The Big Year, 2011)",
        "patterns": [
          "o grande ano",
          "the big year"
        ],
        "year": 2011
      },
      {
        "name": "Cada Um na Sua Casa (Home, 2015)",
        "patterns": [
          "cada um na sua casa",
          "home"
        ],
        "year": 2015
      },
      {
        "name": "Hora de Voltar (Garden State, 2004)",
        "patterns": [
          "hora de voltar",
          "garden state"
        ],
        "year": 2004
      },
      {
        "name": "Os Muppets (The Muppets, 2011)",
        "patterns": [
          "os muppets",
          "the muppets"
        ],
        "year": 2011
      },
      {
        "name": "Escola de Idiotas (School for Scoundrels, 2006)",
        "patterns": [
          "escola de idiotas",
          "school for scoundrels"
        ],
        "year": 2006
      },
      {
        "name": "10 Itens ou Menos (10 Items or Less, 2006)",
        "patterns": [
          "10 itens ou menos",
          "10 items or less"
        ],
        "year": 2006
      },
      {
        "name": "The Normal Heart (2014)",
        "patterns": [
          "the normal heart"
        ],
        "year": 2014
      },
      {
        "name": "Em Busca de um Caminho (Heights, 2005)",
        "patterns": [
          "em busca de um caminho",
          "heights"
        ],
        "year": 2005
      },
      {
        "name": "O Grande Novo Maravilhoso (2005)",
        "patterns": [
          "o grande novo maravilhoso",
          "the great new wonderful"
        ],
        "year": 2005
      },
      {
        "name": "Sunset Stories (2012)",
        "patterns": [
          "sunset stories"
        ],
        "year": 2012
      },
      {
        "name": "Wish I Was Here (2014)",
        "patterns": [
          "wish i was here"
        ],
        "year": 2014
      },
      {
        "name": "Visions: Os Olhos do Passado (2015)",
        "patterns": [
          "visions",
          "os olhos do passado"
        ],
        "year": 2015
      },
      {
        "name": "Elf: Buddy's Musical Christmas (2014)",
        "patterns": [
          "elf buddys musical christmas",
          "elf: buddy's musical christmas",
          "buddy's musical christmas"
        ],
        "year": 2014
      }
    ]
  },
  "sort_order": 748
},
{
  "id": "cf_jacob_tremblay",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: Ontem Ele Era Criança... Hoje Já Tem Mais Carreira que Eu!",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Jacob Tremblay (Meta: 10 de 20 filmes).",
  "icon": "👦",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "O Quarto de Jack (Room, 2015)",
        "patterns": [
          "o quarto de jack",
          "room"
        ],
        "year": 2015
      },
      {
        "name": "Extraordinário (Wonder, 2017)",
        "patterns": [
          "extraordinario",
          "extraordinário",
          "wonder"
        ],
        "year": 2017,
        "exclude": [
          "wonder woman",
          "mulher maravilha",
          "mulher-maravilha"
        ]
      },
      {
        "name": "O Sono da Morte (Before I Wake, 2016)",
        "patterns": [
          "o sono da morte",
          "before i wake"
        ],
        "year": 2016
      },
      {
        "name": "Bons Meninos (Good Boys, 2019)",
        "patterns": [
          "bons meninos",
          "good boys"
        ],
        "year": 2019
      },
      {
        "name": "Doutor Sono (Doctor Sleep, 2019)",
        "patterns": [
          "doutor sono",
          "doctor sleep"
        ],
        "year": 2019
      },
      {
        "name": "Luca (2021)",
        "patterns": [
          "luca"
        ],
        "year": 2021
      },
      {
        "name": "A Pequena Sereia (The Little Mermaid, 2023)",
        "patterns": [
          "a pequena sereia",
          "the little mermaid"
        ],
        "year": 2023
      },
      {
        "name": "O Predador (The Predator, 2018)",
        "patterns": [
          "o predador",
          "the predator"
        ],
        "year": 2018
      },
      {
        "name": "O Livro de Henry (The Book of Henry, 2017)",
        "patterns": [
          "o livro de henry",
          "the book of henry"
        ],
        "year": 2017
      },
      {
        "name": "Os Smurfs 2 (2013)",
        "patterns": [
          "os smurfs 2",
          "the smurfs 2"
        ],
        "year": 2013
      },
      {
        "name": "Refém do Medo (Shut In, 2016)",
        "patterns": [
          "refem do medo",
          "refém do medo",
          "shut in"
        ],
        "year": 2016
      },
      {
        "name": "A Morte e a Vida de John F. Donovan (2018)",
        "patterns": [
          "a morte e a vida de john f donovan",
          "the death and life of john f. donovan",
          "john f donovan"
        ],
        "year": 2018
      },
      {
        "name": "O Dragão do Meu Pai (My Father's Dragon, 2022)",
        "patterns": [
          "o dragao do meu pai",
          "o dragão do meu pai",
          "my father's dragon",
          "my fathers dragon"
        ],
        "year": 2022
      },
      {
        "name": "O Fantasma de Canterville (2023)",
        "patterns": [
          "o fantasma de canterville",
          "the canterville ghost"
        ],
        "year": 2023
      },
      {
        "name": "O Vingador Tóxico (The Toxic Avenger, 2023)",
        "patterns": [
          "o vingador toxico",
          "o vingador tóxico",
          "the toxic avenger"
        ],
        "year": 2023
      },
      {
        "name": "A Vida em um Ano (Life in a Year, 2020)",
        "patterns": [
          "a vida em um ano",
          "life in a year"
        ],
        "year": 2020
      },
      {
        "name": "Órion e o Escuro (Orion and the Dark, 2024)",
        "patterns": [
          "orion e o escuro",
          "órion e o escuro",
          "orion and the dark"
        ],
        "year": 2024
      },
      {
        "name": "Cold Copy (2023)",
        "patterns": [
          "cold copy"
        ],
        "year": 2023
      },
      {
        "name": "O Menino e a Garça (2023)",
        "patterns": [
          "o menino e a garca",
          "o menino e a garça",
          "the boy and the heron",
          "kimitachi wa do ikiru ka"
        ],
        "year": 2023
      },
      {
        "name": "Corduroy (2017)",
        "patterns": [
          "corduroy"
        ],
        "year": 2017
      }
    ]
  },
  "sort_order": 749
},
{
  "id": "cf_paulo_gustavo",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "gold",
  "title": "Calçada da Fama: Rir É um Ato de Resistência: O Eterno Paulo Gustavo",
  "description": "Conquistar pelo menos 8 dos 14 filmes de Paulo Gustavo (Meta: 8 de 14 filmes).",
  "icon": "🎭",
  "target_type": "calcada_fama_curated",
  "target_value": 8,
  "target_metadata": {
    "curatedCount": 14,
    "minTarget": 8,
    "movies": [
      {
        "name": "Minha Mãe é uma Peça: O Filme (2013)",
        "patterns": [
          "minha mae e uma peca",
          "minha mãe é uma peça"
        ],
        "year": 2013,
        "exclude": [
          "minha mae e uma peca 2",
          "minha mãe é uma peça 2",
          "minha mae e uma peca 3",
          "minha mãe é uma peça 3"
        ]
      },
      {
        "name": "Minha Mãe é uma Peça 2 (2016)",
        "patterns": [
          "minha mae e uma peca 2",
          "minha mãe é uma peça 2"
        ],
        "year": 2016
      },
      {
        "name": "Minha Mãe é uma Peça 3 (2019)",
        "patterns": [
          "minha mae e uma peca 3",
          "minha mãe é uma peça 3"
        ],
        "year": 2019
      },
      {
        "name": "Os Homens São de Marte... E É pra Lá que Eu Vou (2014)",
        "patterns": [
          "os homens sao de marte",
          "os homens são de marte"
        ],
        "year": 2014
      },
      {
        "name": "Minha Vida em Marte (2018)",
        "patterns": [
          "minha vida em marte"
        ],
        "year": 2018
      },
      {
        "name": "Vai que Cola: O Filme (2015)",
        "patterns": [
          "vai que cola o filme",
          "vai que cola"
        ],
        "year": 2015,
        "exclude": [
          "vai que cola 2",
          "o comeco",
          "o começo"
        ]
      },
      {
        "name": "220 Volts: O Filme (2016)",
        "patterns": [
          "220 volts"
        ],
        "year": 2016
      },
      {
        "name": "Filho da Mãe (2022)",
        "patterns": [
          "filho da mae",
          "filho da mãe"
        ],
        "year": 2022
      },
      {
        "name": "Fala Sério, Mãe! (2017)",
        "patterns": [
          "fala serio mae",
          "fala sério, mãe!"
        ],
        "year": 2017
      },
      {
        "name": "Xuxa em Sonho de Menina (2007)",
        "patterns": [
          "sonho de menina",
          "xuxa em sonho de menina"
        ],
        "year": 2007
      },
      {
        "name": "Divã (2009)",
        "patterns": [
          "diva",
          "divã"
        ],
        "year": 2009
      },
      {
        "name": "A Esperança É a Última que Morre (2015)",
        "patterns": [
          "a esperanca e a ultima que morre",
          "a esperança é a última que morre"
        ],
        "year": 2015
      },
      {
        "name": "Vai que Cola 2: O Começo (2019)",
        "patterns": [
          "vai que cola 2",
          "o comeco",
          "o começo"
        ],
        "year": 2019
      },
      {
        "name": "D.P.A. - Detetives do Prédio Azul: O Filme (2017)",
        "patterns": [
          "detetives do predio azul o filme",
          "detetives do prédio azul: o filme",
          "d.p.a. o filme",
          "dpa o filme"
        ],
        "year": 2017
      }
    ]
  },
  "sort_order": 750
},
{
  "id": "cf_casal_warren",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "epic",
  "title": "Calçada da Fama: O Casal dos Warren Não Tem Folga! (Ed e Lorraine na Vida Real)",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Patrick Wilson e/ou Vera Farmiga (Meta: 10 de 20 filmes).",
  "icon": "🕯️",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Invocação do Mal (The Conjuring, 2013)",
        "patterns": [
          "invocacao do mal",
          "invocação do mal",
          "the conjuring"
        ],
        "year": 2013,
        "exclude": [
          "invocacao do mal 2",
          "invocação do mal 2",
          "conjuring 2",
          "invocacao do mal 3",
          "invocação do mal 3",
          "conjuring 3",
          "ordem do demonio",
          "ordem do demônio"
        ]
      },
      {
        "name": "Invocação do Mal 2 (The Conjuring 2, 2016)",
        "patterns": [
          "invocacao do mal 2",
          "invocação do mal 2",
          "the conjuring 2"
        ],
        "year": 2016
      },
      {
        "name": "Invocação do Mal 3: A Ordem do Demônio (2021)",
        "patterns": [
          "a ordem do demonio",
          "a ordem do demônio",
          "the devil made me do it",
          "conjuring 3"
        ],
        "year": 2021
      },
      {
        "name": "Annabelle 3: De Volta para Casa (2019)",
        "patterns": [
          "annabelle 3",
          "annabelle comes home",
          "de volta para casa"
        ],
        "year": 2019,
        "requireAdditionalPatterns": [
          "annabelle"
        ]
      },
      {
        "name": "A Órfã (Orphan, 2009)",
        "patterns": [
          "a orfa",
          "a órfã",
          "orphan"
        ],
        "year": 2009,
        "exclude": [
          "primeira morte",
          "first kill"
        ]
      },
      {
        "name": "Sobrenatural (Insidious, 2010)",
        "patterns": [
          "sobrenatural",
          "insidious"
        ],
        "year": 2010,
        "exclude": [
          "capitulo 2",
          "capítulo 2",
          "chapter 2",
          "capitulo 3",
          "capítulo 3",
          "chapter 3",
          "a ultima chave",
          "a última chave",
          "the last key",
          "a porta vermelha",
          "the red door"
        ]
      },
      {
        "name": "Sobrenatural: Capítulo 2 (2013)",
        "patterns": [
          "sobrenatural capitulo 2",
          "sobrenatural: capítulo 2",
          "insidious chapter 2"
        ],
        "year": 2013
      },
      {
        "name": "Sobrenatural: A Porta Vermelha (2023)",
        "patterns": [
          "a porta vermelha",
          "the red door"
        ],
        "year": 2023
      },
      {
        "name": "Watchmen: O Filme (2009)",
        "patterns": [
          "watchmen"
        ],
        "year": 2009
      },
      {
        "name": "Aquaman (2018)",
        "patterns": [
          "aquaman"
        ],
        "year": 2018,
        "exclude": [
          "o reino perdido",
          "the lost kingdom",
          "aquaman 2"
        ]
      },
      {
        "name": "Aquaman 2: O Reino Perdido (2023)",
        "patterns": [
          "o reino perdido",
          "the lost kingdom",
          "aquaman 2"
        ],
        "year": 2023
      },
      {
        "name": "Os Infiltrados (The Departed, 2006)",
        "patterns": [
          "os infiltrados",
          "the departed"
        ],
        "year": 2006
      },
      {
        "name": "Amor Sem Escalas (Up in the Air, 2009)",
        "patterns": [
          "amor sem escalas",
          "up in the air"
        ],
        "year": 2009
      },
      {
        "name": "O Menino do Pijama Listrado (2008)",
        "patterns": [
          "o menino do pijama listrado",
          "the boy in the striped pyjamas",
          "the boy in the striped pajamas"
        ],
        "year": 2008
      },
      {
        "name": "Godzilla II: Rei dos Monstros (2019)",
        "patterns": [
          "rei dos monstros",
          "king of the monsters"
        ],
        "year": 2019
      },
      {
        "name": "Passageiros (Passengers, 2008)",
        "patterns": [
          "passageiros",
          "passengers"
        ],
        "year": 2008
      },
      {
        "name": "O Passageiro (The Commuter, 2018)",
        "patterns": [
          "o passageiro",
          "the commuter"
        ],
        "year": 2018
      },
      {
        "name": "MeninaMá.com (Hard Candy, 2005)",
        "patterns": [
          "meninama com",
          "meninama.com",
          "menina má",
          "hard candy"
        ],
        "year": 2005
      },
      {
        "name": "Boneco de Neve (The Snowman, 2017)",
        "patterns": [
          "boneco de neve",
          "the snowman"
        ],
        "year": 2017
      },
      {
        "name": "Moonfall: Ameaça Lunar (2022)",
        "patterns": [
          "moonfall"
        ],
        "year": 2022
      }
    ]
  },
  "sort_order": 751
},
{
  "id": "cf_tom_cruise",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "gold",
  "title": "Calçada da Fama: Ele Não Usa Dublê Nem pra Cair do Espaço!",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Tom Cruise (Meta: 10 de 20 filmes).",
  "icon": "🪂",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Top Gun: Maverick (2022)",
        "patterns": [
          "top gun maverick",
          "maverick"
        ],
        "year": 2022
      },
      {
        "name": "Top Gun: Ases Indomáveis (1986)",
        "patterns": [
          "top gun",
          "ases indomaveis",
          "ases indomáveis"
        ],
        "year": 1986,
        "exclude": [
          "maverick"
        ]
      },
      {
        "name": "Missão: Impossível (1996)",
        "patterns": [
          "missao impossivel",
          "missão impossível",
          "mission impossible"
        ],
        "year": 1996,
        "exclude": [
          "protocolo fantasma",
          "ghost protocol",
          "nacao secreta",
          "nação secreta",
          "rogue nation",
          "efeito fallout",
          "fallout",
          "acerto de contas",
          "dead reckoning",
          "missao impossivel 2",
          "missao impossivel 3"
        ]
      },
      {
        "name": "Missão: Impossível 2 (2000)",
        "patterns": [
          "missao impossivel 2",
          "missão impossível 2",
          "mission impossible 2",
          "mission impossible ii"
        ],
        "year": 2000
      },
      {
        "name": "Missão: Impossível 3 (2006)",
        "patterns": [
          "missao impossivel 3",
          "missão impossível 3",
          "mission impossible 3",
          "mission impossible iii"
        ],
        "year": 2006
      },
      {
        "name": "Missão: Impossível - Protocolo Fantasma (2011)",
        "patterns": [
          "protocolo fantasma",
          "ghost protocol"
        ],
        "year": 2011
      },
      {
        "name": "Missão: Impossível - Nação Secreta (2015)",
        "patterns": [
          "nacao secreta",
          "nação secreta",
          "rogue nation"
        ],
        "year": 2015
      },
      {
        "name": "Missão: Impossível - Efeito Fallout (2018)",
        "patterns": [
          "efeito fallout",
          "fallout"
        ],
        "year": 2018
      },
      {
        "name": "Missão: Impossível - Acerto de Contas (2023)",
        "patterns": [
          "acerto de contas",
          "dead reckoning"
        ],
        "year": 2023
      },
      {
        "name": "No Limite do Amanhã (Edge of Tomorrow, 2014)",
        "patterns": [
          "no limite do amanha",
          "no limite do amanhã",
          "edge of tomorrow",
          "live die repeat"
        ],
        "year": 2014
      },
      {
        "name": "Minority Report: A Nova Lei (2002)",
        "patterns": [
          "minority report"
        ],
        "year": 2002
      },
      {
        "name": "Guerra dos Mundos (War of the Worlds, 2005)",
        "patterns": [
          "guerra dos mundos",
          "war of the worlds"
        ],
        "year": 2005
      },
      {
        "name": "Colateral (Collateral, 2004)",
        "patterns": [
          "colateral",
          "collateral"
        ],
        "year": 2004
      },
      {
        "name": "Entrevista com o Vampiro (1994)",
        "patterns": [
          "entrevista com o vampiro",
          "interview with the vampire"
        ],
        "year": 1994
      },
      {
        "name": "Jerry Maguire: A Grande Virada (1996)",
        "patterns": [
          "jerry maguire"
        ],
        "year": 1996
      },
      {
        "name": "O Último Samurai (The Last Samurai, 2003)",
        "patterns": [
          "o ultimo samurai",
          "o último samurai",
          "the last samurai"
        ],
        "year": 2003
      },
      {
        "name": "Magnólia (Magnolia, 1999)",
        "patterns": [
          "magnolia",
          "magnólia"
        ],
        "year": 1999
      },
      {
        "name": "Jack Reacher: O Último Tiro (2012)",
        "patterns": [
          "jack reacher"
        ],
        "year": 2012,
        "exclude": [
          "sem retorno",
          "never go back"
        ]
      },
      {
        "name": "Feito na América (American Made, 2017)",
        "patterns": [
          "feito na america",
          "feito na américa",
          "american made"
        ],
        "year": 2017
      },
      {
        "name": "De Olhos Bem Fechados (Eyes Wide Shut, 1999)",
        "patterns": [
          "de olhos bem fechados",
          "eyes wide shut"
        ],
        "year": 1999
      }
    ]
  },
  "sort_order": 752
},
{
  "id": "cf_johnny_depp",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "gold",
  "title": "Calçada da Fama: O Homem das Mil Caras e Maquiagens",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Johnny Depp (Meta: 10 de 20 filmes).",
  "icon": "🏴‍☠️",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Piratas do Caribe: A Maldição do Pérola Negra (2003)",
        "patterns": [
          "a maldicao do perola negra",
          "a maldição do pérola negra",
          "the curse of the black pearl"
        ],
        "year": 2003
      },
      {
        "name": "Piratas do Caribe: O Baú da Morte (2006)",
        "patterns": [
          "o bau da morte",
          "o baú da morte",
          "dead man's chest",
          "dead mans chest"
        ],
        "year": 2006
      },
      {
        "name": "Piratas do Caribe: No Fim do Mundo (2007)",
        "patterns": [
          "no fim do mundo",
          "at world's end",
          "at worlds end"
        ],
        "year": 2007
      },
      {
        "name": "Piratas do Caribe: Navegando em Águas Misteriosas (2011)",
        "patterns": [
          "navegando em aguas misteriosas",
          "navegando em águas misteriosas",
          "on stranger tides"
        ],
        "year": 2011
      },
      {
        "name": "Piratas do Caribe: A Vingança de Salazar (2017)",
        "patterns": [
          "a vinganca de salazar",
          "a vingança de salazar",
          "dead men tell no tales"
        ],
        "year": 2017
      },
      {
        "name": "Edward Mãos de Tesoura (1990)",
        "patterns": [
          "edward maos de tesoura",
          "edward mãos de tesoura",
          "edward scissorhands"
        ],
        "year": 1990
      },
      {
        "name": "A Fantástica Fábrica de Chocolate (2005)",
        "patterns": [
          "a fantastica fabrica de chocolate",
          "a fantástica fábrica de chocolate",
          "charlie and the chocolate factory"
        ],
        "year": 2005
      },
      {
        "name": "Sweeney Todd: O Barbeiro Demoníaco (2007)",
        "patterns": [
          "sweeney todd"
        ],
        "year": 2007
      },
      {
        "name": "Alice no País das Maravilhas (2010)",
        "patterns": [
          "alice no pais das maravilhas",
          "alice no país das maravilhas",
          "alice in wonderland"
        ],
        "year": 2010,
        "exclude": [
          "atraves do espelho",
          "através do espelho",
          "through the looking glass"
        ]
      },
      {
        "name": "A Lenda do Cavaleiro sem Cabeça (1999)",
        "patterns": [
          "a lenda do cavaleiro sem cabeca",
          "a lenda do cavaleiro sem cabeça",
          "sleepy hollow"
        ],
        "year": 1999
      },
      {
        "name": "Inimigos Públicos (Public Enemies, 2009)",
        "patterns": [
          "inimigos publicos",
          "inimigos públicos",
          "public enemies"
        ],
        "year": 2009
      },
      {
        "name": "Animais Fantásticos: Os Crimes de Grindelwald (2018)",
        "patterns": [
          "os crimes de grindelwald",
          "the crimes of grindelwald"
        ],
        "year": 2018
      },
      {
        "name": "Assassinato no Expresso do Oriente (2017)",
        "patterns": [
          "assassinato no expresso do oriente",
          "murder on the orient express"
        ],
        "year": 2017
      },
      {
        "name": "A Hora do Pesadelo (A Nightmare on Elm Street, 1984)",
        "patterns": [
          "a hora do pesadelo",
          "a nightmare on elm street"
        ],
        "year": 1984
      },
      {
        "name": "A Noiva-Cadáver (Corpse Bride, 2005)",
        "patterns": [
          "a noiva cadaver",
          "a noiva-cadáver",
          "corpse bride"
        ],
        "year": 2005
      },
      {
        "name": "Rango (2011)",
        "patterns": [
          "rango"
        ],
        "year": 2011
      },
      {
        "name": "Donnie Brasco (1997)",
        "patterns": [
          "donnie brasco"
        ],
        "year": 1997
      },
      {
        "name": "Janela Secreta (Secret Window, 2004)",
        "patterns": [
          "janela secreta",
          "secret window"
        ],
        "year": 2004
      },
      {
        "name": "Em Busca da Terra do Nunca (Finding Neverland, 2004)",
        "patterns": [
          "em busca da terra do nunca",
          "finding neverland"
        ],
        "year": 2004
      },
      {
        "name": "Aliança do Crime (Black Mass, 2015)",
        "patterns": [
          "alianca do crime",
          "aliança do crime",
          "black mass"
        ],
        "year": 2015
      }
    ]
  },
  "sort_order": 753
},
{
  "id": "cf_nicolas_cage",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "epic",
  "title": "Calçada da Fama: Ele Aceita Qualquer Roteiro! (O Culto a Nicolas Cage)",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Nicolas Cage (Meta: 10 de 20 filmes).",
  "icon": "🔥",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Motoqueiro Fantasma (Ghost Rider, 2007)",
        "patterns": [
          "motoqueiro fantasma",
          "ghost rider"
        ],
        "year": 2007,
        "exclude": [
          "espirito de vinganca",
          "espírito de vingança",
          "spirit of vengeance"
        ]
      },
      {
        "name": "Motoqueiro Fantasma: Espírito de Vingança (2011)",
        "patterns": [
          "espirito de vinganca",
          "espírito de vingança",
          "spirit of vengeance"
        ],
        "year": 2011
      },
      {
        "name": "A Rocha (The Rock, 1996)",
        "patterns": [
          "a rocha",
          "the rock"
        ],
        "year": 1996
      },
      {
        "name": "A Lenda do Tesouro Perdido (National Treasure, 2004)",
        "patterns": [
          "a lenda do tesouro perdido",
          "national treasure"
        ],
        "year": 2004,
        "exclude": [
          "livro dos segredos",
          "book of secrets"
        ]
      },
      {
        "name": "A Lenda do Tesouro Perdido: Livro dos Segredos (2007)",
        "patterns": [
          "livro dos segredos",
          "book of secrets"
        ],
        "year": 2007
      },
      {
        "name": "A Outra Face (Face/Off, 1997)",
        "patterns": [
          "a outra face",
          "face off",
          "face/off"
        ],
        "year": 1997
      },
      {
        "name": "Con Air: A Rota da Fuga (1997)",
        "patterns": [
          "con air"
        ],
        "year": 1997
      },
      {
        "name": "O Peso do Talento (2022)",
        "patterns": [
          "o peso do talento",
          "the unbearable weight of massive talent"
        ],
        "year": 2022
      },
      {
        "name": "Mandy (2018)",
        "patterns": [
          "mandy"
        ],
        "year": 2018
      },
      {
        "name": "Pig: A Vingança (Pig, 2021)",
        "patterns": [
          "pig"
        ],
        "year": 2021
      },
      {
        "name": "Despedida em Las Vegas (Leaving Las Vegas, 1995)",
        "patterns": [
          "despedida em las vegas",
          "leaving las vegas"
        ],
        "year": 1995
      },
      {
        "name": "Homem-Aranha no Aranhaverso (2018)",
        "patterns": [
          "no aranhaverso",
          "into the spider-verse",
          "spider verse"
        ],
        "year": 2018
      },
      {
        "name": "Renfield: Dando Sangue Pelo Chefe (2023)",
        "patterns": [
          "renfield"
        ],
        "year": 2023
      },
      {
        "name": "Presságio (Knowing, 2009)",
        "patterns": [
          "pressagio",
          "presságio",
          "knowing"
        ],
        "year": 2009
      },
      {
        "name": "Kick-Ass: Quebrando Tudo (2010)",
        "patterns": [
          "kick ass",
          "kick-ass"
        ],
        "year": 2010
      },
      {
        "name": "60 Segundos (Gone in 60 Seconds, 2000)",
        "patterns": [
          "60 segundos",
          "gone in sixty seconds",
          "gone in 60 seconds"
        ],
        "year": 2000
      },
      {
        "name": "O Homem de Palha (The Wicker Man, 2006)",
        "patterns": [
          "o homem de palha",
          "the wicker man"
        ],
        "year": 2006
      },
      {
        "name": "Adaptação (Adaptation, 2002)",
        "patterns": [
          "adaptacao",
          "adaptação",
          "adaptation"
        ],
        "year": 2002
      },
      {
        "name": "Longlegs: Vínculo Mortal (2024)",
        "patterns": [
          "longlegs"
        ],
        "year": 2024
      },
      {
        "name": "Willy's Wonderland: Parque Maldito (2021)",
        "patterns": [
          "willys wonderland",
          "willy's wonderland"
        ],
        "year": 2021
      }
    ]
  },
  "sort_order": 754
},
{
  "id": "cf_samuel_l_jackson",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "gold",
  "title": "Calçada da Fama: O Ator Mais Presente da História do Cinema!",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Samuel L. Jackson (Meta: 10 de 20 filmes).",
  "icon": "⚡",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Pulp Fiction: Tempo de Violência (1994)",
        "patterns": [
          "pulp fiction"
        ],
        "year": 1994
      },
      {
        "name": "Os Vingadores (The Avengers, 2012)",
        "patterns": [
          "os vingadores",
          "the avengers"
        ],
        "year": 2012,
        "exclude": [
          "era de ultron",
          "guerra infinita",
          "ultimato",
          "age of ultron",
          "infinity war",
          "endgame"
        ]
      },
      {
        "name": "Vingadores: Era de Ultron (2015)",
        "patterns": [
          "era de ultron",
          "age of ultron"
        ],
        "year": 2015
      },
      {
        "name": "Vingadores: Guerra Infinita (2018)",
        "patterns": [
          "guerra infinita",
          "infinity war"
        ],
        "year": 2018
      },
      {
        "name": "Vingadores: Ultimato (2019)",
        "patterns": [
          "ultimato",
          "endgame"
        ],
        "year": 2019
      },
      {
        "name": "Django Livre (Django Unchained, 2012)",
        "patterns": [
          "django livre",
          "django unchained"
        ],
        "year": 2012
      },
      {
        "name": "Corpo Fechado (Unbreakable, 2000)",
        "patterns": [
          "corpo fechado",
          "unbreakable"
        ],
        "year": 2000
      },
      {
        "name": "Vidro (Glass, 2019)",
        "patterns": [
          "vidro",
          "glass"
        ],
        "year": 2019
      },
      {
        "name": "Os 8 Odiados (The Hateful Eight, 2015)",
        "patterns": [
          "os 8 odiados",
          "os oito odiados",
          "the hateful eight"
        ],
        "year": 2015
      },
      {
        "name": "Star Wars: Episódio I – A Ameaça Fantasma (1999)",
        "patterns": [
          "a ameaca fantasma",
          "a ameaça fantasma",
          "the phantom menace"
        ],
        "year": 1999
      },
      {
        "name": "Star Wars: Episódio II – Ataque dos Clones (2002)",
        "patterns": [
          "ataque dos clones",
          "attack of the clones"
        ],
        "year": 2002
      },
      {
        "name": "Star Wars: Episódio III – A Vingança dos Sith (2005)",
        "patterns": [
          "a vinganca dos sith",
          "a vingança dos sith",
          "revenge of the sith"
        ],
        "year": 2005
      },
      {
        "name": "Kingsman: Serviço Secreto (2014)",
        "patterns": [
          "kingsman servico secreto",
          "kingsman: serviço secreto",
          "the secret service"
        ],
        "year": 2014
      },
      {
        "name": "Kong: A Ilha da Caveira (2017)",
        "patterns": [
          "a ilha da caveira",
          "skull island"
        ],
        "year": 2017
      },
      {
        "name": "Jurassic Park: O Parque dos Dinossauros (1993)",
        "patterns": [
          "jurassic park",
          "o parque dos dinossauros"
        ],
        "year": 1993,
        "exclude": [
          "o mundo perdido",
          "the lost world",
          "jurassic park 3",
          "jurassic park iii",
          "jurassic world"
        ]
      },
      {
        "name": "Capitã Marvel (2019)",
        "patterns": [
          "capita marvel",
          "capitã marvel",
          "captain marvel"
        ],
        "year": 2019
      },
      {
        "name": "As Marvels (2023)",
        "patterns": [
          "as marvels",
          "the marvels"
        ],
        "year": 2023
      },
      {
        "name": "Os Incríveis (The Incredibles, 2004)",
        "patterns": [
          "os incriveis",
          "os incríveis",
          "the incredibles"
        ],
        "year": 2004,
        "exclude": [
          "os incriveis 2",
          "os incríveis 2",
          "incredibles 2"
        ]
      },
      {
        "name": "Dupla Explosiva (The Hitman's Bodyguard, 2017)",
        "patterns": [
          "dupla explosiva",
          "the hitman's bodyguard",
          "the hitmans bodyguard"
        ],
        "year": 2017,
        "exclude": [
          "dupla explosiva 2",
          "e a primeira-dama do crime"
        ]
      },
      {
        "name": "Jackie Brown (1997)",
        "patterns": [
          "jackie brown"
        ],
        "year": 1997
      }
    ]
  },
  "sort_order": 755
},
{
  "id": "cf_margot_robbie",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: A Rainha do Carisma: De Arlequina a Barbie",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Margot Robbie (Meta: 10 de 20 filmes).",
  "icon": "💖",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Barbie (2023)",
        "patterns": [
          "barbie"
        ],
        "year": 2023
      },
      {
        "name": "O Lobo de Wall Street (The Wolf of Wall Street, 2013)",
        "patterns": [
          "o lobo de wall street",
          "lobo de wall street",
          "the wolf of wall street"
        ],
        "year": 2013
      },
      {
        "name": "Esquadrão Suicida (Suicide Squad, 2016)",
        "patterns": [
          "esquadrao suicida",
          "esquadrão suicida",
          "suicide squad"
        ],
        "year": 2016,
        "exclude": [
          "o esquadrao suicida",
          "the suicide squad"
        ]
      },
      {
        "name": "O Esquadrão Suicida (The Suicide Squad, 2021)",
        "patterns": [
          "o esquadrao suicida",
          "o esquadrão suicida",
          "the suicide squad"
        ],
        "year": 2021
      },
      {
        "name": "Aves de Rapina (Birds of Prey, 2020)",
        "patterns": [
          "aves de rapina",
          "birds of prey"
        ],
        "year": 2020
      },
      {
        "name": "Eu, Tonya (I, Tonya, 2017)",
        "patterns": [
          "eu tonya",
          "eu, tonya",
          "i tonya",
          "i, tonya"
        ],
        "year": 2017
      },
      {
        "name": "Era uma Vez em... Hollywood (2019)",
        "patterns": [
          "era uma vez em hollywood",
          "era uma vez em... hollywood",
          "once upon a time in hollywood",
          "once upon a time... in hollywood"
        ],
        "year": 2019
      },
      {
        "name": "Babilônia (Babylon, 2022)",
        "patterns": [
          "babilonia",
          "babilônia",
          "babylon"
        ],
        "year": 2022
      },
      {
        "name": "Golpe Duplo (Focus, 2015)",
        "patterns": [
          "golpe duplo",
          "focus"
        ],
        "year": 2015
      },
      {
        "name": "Questão de Tempo (About Time, 2013)",
        "patterns": [
          "questao de tempo",
          "questão de tempo",
          "about time"
        ],
        "year": 2013
      },
      {
        "name": "A Grande Aposta (The Big Short, 2015)",
        "patterns": [
          "a grande aposta",
          "the big short"
        ],
        "year": 2015
      },
      {
        "name": "Duas Rainhas (Mary Queen of Scots, 2018)",
        "patterns": [
          "duas rainhas",
          "mary queen of scots"
        ],
        "year": 2018
      },
      {
        "name": "O Escândalo (Bombshell, 2019)",
        "patterns": [
          "o escandalo",
          "o escândalo",
          "bombshell"
        ],
        "year": 2019
      },
      {
        "name": "Asteroid City (2023)",
        "patterns": [
          "asteroid city"
        ],
        "year": 2023
      },
      {
        "name": "A Lenda de Tarzan (2016)",
        "patterns": [
          "a lenda de tarzan",
          "the legend of tarzan"
        ],
        "year": 2016
      },
      {
        "name": "Pedro Coelho (Peter Rabbit, 2018)",
        "patterns": [
          "pedro coelho",
          "peter rabbit"
        ],
        "year": 2018,
        "exclude": [
          "pedro coelho 2",
          "o fugitivo",
          "the runaway"
        ]
      },
      {
        "name": "Pedro Coelho 2: O Fugitivo (2021)",
        "patterns": [
          "pedro coelho 2",
          "peter rabbit 2"
        ],
        "year": 2021
      },
      {
        "name": "A Vingança Perfeita (Terminal, 2018)",
        "patterns": [
          "a vinganca perfeita",
          "a vingança perfeita",
          "terminal"
        ],
        "year": 2018
      },
      {
        "name": "Suite Francesa (2014)",
        "patterns": [
          "suite francesa",
          "suite francaise"
        ],
        "year": 2014
      },
      {
        "name": "Amsterdam (2022)",
        "patterns": [
          "amsterdam"
        ],
        "year": 2022
      }
    ]
  },
  "sort_order": 756
},
{
  "id": "cf_anya_taylor_joy",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: Olhos que Hipnotizam a Câmera",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Anya Taylor-Joy (Meta: 10 de 20 filmes).",
  "icon": "👁️",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "A Bruxa (The Witch, 2015)",
        "patterns": [
          "a bruxa",
          "the witch"
        ],
        "year": 2015
      },
      {
        "name": "Fragmentado (Split, 2016)",
        "patterns": [
          "fragmentado",
          "split"
        ],
        "year": 2016
      },
      {
        "name": "Vidro (Glass, 2019)",
        "patterns": [
          "vidro",
          "glass"
        ],
        "year": 2019
      },
      {
        "name": "O Menu (The Menu, 2022)",
        "patterns": [
          "o menu",
          "the menu"
        ],
        "year": 2022
      },
      {
        "name": "Furiosa: Uma Saga Mad Max (2024)",
        "patterns": [
          "furiosa",
          "uma saga mad max",
          "a mad max saga"
        ],
        "year": 2024
      },
      {
        "name": "O Homem do Norte (The Northman, 2022)",
        "patterns": [
          "o homem do norte",
          "the northman"
        ],
        "year": 2022
      },
      {
        "name": "Super Mario Bros. O Filme (2023)",
        "patterns": [
          "super mario bros",
          "mario bros o filme"
        ],
        "year": 2023
      },
      {
        "name": "Noite Passada em Soho (Last Night in Soho, 2021)",
        "patterns": [
          "noite passada em soho",
          "last night in soho"
        ],
        "year": 2021
      },
      {
        "name": "Emma. (2020)",
        "patterns": [
          "emma"
        ],
        "year": 2020
      },
      {
        "name": "Os Novos Mutantes (The New Mutants, 2020)",
        "patterns": [
          "os novos mutantes",
          "the new mutants"
        ],
        "year": 2020
      },
      {
        "name": "Duna: Parte Dois (Dune: Part Two, 2024)",
        "patterns": [
          "duna parte 2",
          "duna parte dois",
          "duna: parte dois",
          "dune part two",
          "dune: part two"
        ],
        "year": 2024
      },
      {
        "name": "Morgan (2016)",
        "patterns": [
          "morgan"
        ],
        "year": 2016
      },
      {
        "name": "Radioactive (2019)",
        "patterns": [
          "radioactive"
        ],
        "year": 2019
      },
      {
        "name": "Barry (2016)",
        "patterns": [
          "barry"
        ],
        "year": 2016
      },
      {
        "name": "Puro-Sangue (Thoroughbreds, 2017)",
        "patterns": [
          "puro sangue",
          "puro-sangue",
          "thoroughbreds"
        ],
        "year": 2017
      },
      {
        "name": "O Segredo de Marrowbone (2017)",
        "patterns": [
          "o segredo de marrowbone",
          "marrowbone",
          "el secreto de marrowbone"
        ],
        "year": 2017
      },
      {
        "name": "Playmobil: O Filme (2019)",
        "patterns": [
          "playmobil"
        ],
        "year": 2019
      },
      {
        "name": "Amsterdam (2022)",
        "patterns": [
          "amsterdam"
        ],
        "year": 2022
      },
      {
        "name": "O Cristal Encantado: A Era da Resistência (2019)",
        "patterns": [
          "o cristal encantado",
          "the dark crystal: age of resistance",
          "a era da resistencia",
          "a era da resistência"
        ],
        "year": 2019
      },
      {
        "name": "A Garganta (The Gorge, 2025)",
        "patterns": [
          "a garganta",
          "the gorge"
        ],
        "year": 2025
      }
    ]
  },
  "sort_order": 757
},
{
  "id": "cf_pedro_pascal",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: A Babá Mais Requisitada de Hollywood",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Pedro Pascal (Meta: 10 de 20 filmes).",
  "icon": "🛡️",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Gladiador II (Gladiator II, 2024)",
        "patterns": [
          "gladiador 2",
          "gladiador ii",
          "gladiator 2",
          "gladiator ii"
        ],
        "year": 2024
      },
      {
        "name": "Mulher-Maravilha 1984 (2020)",
        "patterns": [
          "mulher maravilha 1984",
          "mulher-maravilha 1984",
          "wonder woman 1984"
        ],
        "year": 2020
      },
      {
        "name": "O Peso do Talento (The Unbearable Weight..., 2022)",
        "patterns": [
          "o peso do talento",
          "the unbearable weight of massive talent"
        ],
        "year": 2022
      },
      {
        "name": "Operação Fronteira (Triple Frontier, 2019)",
        "patterns": [
          "operacao fronteira",
          "operação fronteira",
          "triple frontier"
        ],
        "year": 2019
      },
      {
        "name": "Kingsman: O Círculo Dourado (2017)",
        "patterns": [
          "o circulo dourado",
          "o círculo dourado",
          "the golden circle"
        ],
        "year": 2017
      },
      {
        "name": "O Protetor 2 (The Equalizer 2, 2018)",
        "patterns": [
          "o protetor 2",
          "the equalizer 2"
        ],
        "year": 2018
      },
      {
        "name": "Pequenos Grandes Heróis (We Can Be Heroes, 2020)",
        "patterns": [
          "pequenos grandes herois",
          "pequenos grandes heróis",
          "we can be heroes"
        ],
        "year": 2020
      },
      {
        "name": "A Bolha (The Bubble, 2022)",
        "patterns": [
          "a bolha",
          "the bubble"
        ],
        "year": 2022
      },
      {
        "name": "Estranha Forma de Vida (Strange Way of Life, 2023)",
        "patterns": [
          "estranha forma de vida",
          "strange way of life"
        ],
        "year": 2023
      },
      {
        "name": "Prospect (2018)",
        "patterns": [
          "prospect"
        ],
        "year": 2018
      },
      {
        "name": "A Grande Muralha (The Great Wall, 2016)",
        "patterns": [
          "a grande muralha",
          "the great wall"
        ],
        "year": 2016
      },
      {
        "name": "Se a Rua Beale Falasse (2018)",
        "patterns": [
          "se a rua beale falasse",
          "if beale street could talk"
        ],
        "year": 2018
      },
      {
        "name": "Garotas em Fuga (Drive-Away Dolls, 2024)",
        "patterns": [
          "garotas em fuga",
          "drive away dolls",
          "drive-away dolls"
        ],
        "year": 2024
      },
      {
        "name": "Robô Selvagem (The Wild Robot, 2024)",
        "patterns": [
          "robo selvagem",
          "robô selvagem",
          "the wild robot"
        ],
        "year": 2024
      },
      {
        "name": "Quarteto Fantástico: Primeiros Passos (2025)",
        "patterns": [
          "quarteto fantastico",
          "quarteto fantástico",
          "the fantastic four",
          "first steps",
          "primeiros passos"
        ],
        "year": 2025
      },
      {
        "name": "Bloodsucking Bastards (2015)",
        "patterns": [
          "bloodsucking bastards"
        ],
        "year": 2015
      },
      {
        "name": "Sweets (2015)",
        "patterns": [
          "sweets"
        ],
        "year": 2015
      },
      {
        "name": "Os Agentes do Destino (2011)",
        "patterns": [
          "os agentes do destino",
          "the adjustment bureau"
        ],
        "year": 2011
      },
      {
        "name": "Freaky Tales (2024)",
        "patterns": [
          "freaky tales"
        ],
        "year": 2024
      },
      {
        "name": "Armas e Pecados (Burn Notice: The Fall of Sam Axe, 2011)",
        "patterns": [
          "armas e pecados",
          "the fall of sam axe",
          "burn notice the fall of sam axe"
        ],
        "year": 2011
      }
    ]
  },
  "sort_order": 758
},
{
  "id": "cf_leandro_hassum",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "silver",
  "title": "Calçada da Fama: O Campeão da Comédia Brasileira",
  "description": "Conquistar pelo menos 10 dos 20 filmes de Leandro Hassum (Meta: 10 de 20 filmes).",
  "icon": "😂",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Até que a Sorte nos Separe (2012)",
        "patterns": [
          "ate que a sorte nos separe",
          "até que a sorte nos separe"
        ],
        "year": 2012,
        "exclude": [
          "ate que a sorte nos separe 2",
          "até que a sorte nos separe 2",
          "ate que a sorte nos separe 3",
          "até que a sorte nos separe 3"
        ]
      },
      {
        "name": "Até que a Sorte nos Separe 2 (2013)",
        "patterns": [
          "ate que a sorte nos separe 2",
          "até que a sorte nos separe 2"
        ],
        "year": 2013
      },
      {
        "name": "Até que a Sorte nos Separe 3: A Falência Final (2015)",
        "patterns": [
          "ate que a sorte nos separe 3",
          "até que a sorte nos separe 3",
          "a falencia final",
          "a falência final"
        ],
        "year": 2015
      },
      {
        "name": "O Candidato Honesto (2014)",
        "patterns": [
          "o candidato honesto"
        ],
        "year": 2014,
        "exclude": [
          "o candidato honesto 2"
        ]
      },
      {
        "name": "O Candidato Honesto 2 (2018)",
        "patterns": [
          "o candidato honesto 2"
        ],
        "year": 2018
      },
      {
        "name": "Tudo Bem no Natal que Vem (2020)",
        "patterns": [
          "tudo bem no natal que vem",
          "just another christmas"
        ],
        "year": 2020
      },
      {
        "name": "Silvio Santos Vem Aí (2025)",
        "patterns": [
          "silvio santos vem ai",
          "silvio santos vem aí"
        ],
        "year": 2025
      },
      {
        "name": "Não Se Aceitam Devoluções (2018)",
        "patterns": [
          "nao se aceitam devolucoes",
          "não se aceitam devoluções"
        ],
        "year": 2018
      },
      {
        "name": "Amor Sem Medida (2021)",
        "patterns": [
          "amor sem medida"
        ],
        "year": 2021
      },
      {
        "name": "Vestido pra Casar (2014)",
        "patterns": [
          "vestido pra casar"
        ],
        "year": 2014
      },
      {
        "name": "Os Caras de Pau em O Misterioso Roubo do Anel (2014)",
        "patterns": [
          "os caras de pau",
          "o misterioso roubo do anel"
        ],
        "year": 2014
      },
      {
        "name": "Meu Malvado Favorito (2010)",
        "patterns": [
          "meu malvado favorito",
          "despicable me"
        ],
        "year": 2010,
        "exclude": [
          "meu malvado favorito 2",
          "meu malvado favorito 3",
          "meu malvado favorito 4",
          "despicable me 2",
          "despicable me 3",
          "despicable me 4"
        ]
      },
      {
        "name": "Meu Malvado Favorito 2 (2013)",
        "patterns": [
          "meu malvado favorito 2",
          "despicable me 2"
        ],
        "year": 2013
      },
      {
        "name": "Meu Malvado Favorito 3 (2017)",
        "patterns": [
          "meu malvado favorito 3",
          "despicable me 3"
        ],
        "year": 2017
      },
      {
        "name": "Meu Malvado Favorito 4 (2024)",
        "patterns": [
          "meu malvado favorito 4",
          "despicable me 4"
        ],
        "year": 2024
      },
      {
        "name": "Minions (2015)",
        "patterns": [
          "minions"
        ],
        "year": 2015,
        "exclude": [
          "minions 2",
          "a origem de gru",
          "the rise of gru"
        ]
      },
      {
        "name": "Se Puder... Dirija! (2013)",
        "patterns": [
          "se puder dirija",
          "se puder... dirija!"
        ],
        "year": 2013
      },
      {
        "name": "Muita Calma Nessa Hora (2010)",
        "patterns": [
          "muita calma nessa hora"
        ],
        "year": 2010,
        "exclude": [
          "muita calma nessa hora 2"
        ]
      },
      {
        "name": "Muita Calma Nessa Hora 2 (2014)",
        "patterns": [
          "muita calma nessa hora 2"
        ],
        "year": 2014
      },
      {
        "name": "Dona Flor e Seus Dois Maridos (2017)",
        "patterns": [
          "dona flor e seus dois maridos",
          "dona flor"
        ],
        "year": 2017
      }
    ]
  },
  "sort_order": 759
},
{
  "id": "cf_stranger_things_kids",
  "category": "calcada_da_fama",
  "categories": [
    "calcada_da_fama"
  ],
  "tier": "epic",
  "title": "Calçada da Fama: Eles Foram Jogar RPG em Outro Lugar! (O Clube do Inferno Fora de Hawkins)",
  "description": "Conquistar pelo menos 10 dos 20 filmes do elenco jovem de Stranger Things (Millie Bobby Brown, Finn Wolfhard, Gaten Matarazzo, Caleb McLaughlin, Noah Schnapp ou Sadie Sink) (Meta: 10 de 20 filmes).",
  "icon": "🚲",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "Godzilla II: Rei dos Monstros (2019 — Millie Bobby Brown)",
        "patterns": [
          "rei dos monstros",
          "king of the monsters"
        ],
        "year": 2019
      },
      {
        "name": "Godzilla vs. Kong (2021 — Millie Bobby Brown)",
        "patterns": [
          "godzilla vs kong",
          "godzilla vs. kong"
        ],
        "year": 2021
      },
      {
        "name": "Enola Holmes (2020 — Millie Bobby Brown)",
        "patterns": [
          "enola holmes"
        ],
        "year": 2020,
        "exclude": [
          "enola holmes 2"
        ]
      },
      {
        "name": "Enola Holmes 2 (2022 — Millie Bobby Brown)",
        "patterns": [
          "enola holmes 2"
        ],
        "year": 2022
      },
      {
        "name": "Donzela (Damsel, 2024 — Millie Bobby Brown)",
        "patterns": [
          "donzela",
          "damsel"
        ],
        "year": 2024
      },
      {
        "name": "The Electric State (2025 — Millie Bobby Brown)",
        "patterns": [
          "the electric state",
          "electric state"
        ],
        "year": 2025
      },
      {
        "name": "It: A Coisa (2017 — Finn Wolfhard)",
        "patterns": [
          "it a coisa",
          "it: a coisa",
          "it chapter one"
        ],
        "year": 2017,
        "exclude": [
          "capitulo 2",
          "capítulo 2",
          "chapter 2",
          "chapter two"
        ]
      },
      {
        "name": "It: Capítulo Dois (2019 — Finn Wolfhard)",
        "patterns": [
          "it capitulo dois",
          "it: capítulo dois",
          "it chapter two",
          "it capitulo 2",
          "it: capitulo 2"
        ],
        "year": 2019
      },
      {
        "name": "Ghostbusters: Mais Além (2021 — Finn Wolfhard)",
        "patterns": [
          "ghostbusters mais alem",
          "ghostbusters: mais além",
          "ghostbusters aftermath",
          "ghostbusters after life",
          "ghostbusters afterlife"
        ],
        "year": 2021
      },
      {
        "name": "Ghostbusters: Apocalipse de Gelo (2024 — Finn Wolfhard)",
        "patterns": [
          "apocalipse de gelo",
          "frozen empire"
        ],
        "year": 2024
      },
      {
        "name": "O Pintassilgo (The Goldfinch, 2019 — Finn Wolfhard)",
        "patterns": [
          "o pintassilgo",
          "the goldfinch"
        ],
        "year": 2019
      },
      {
        "name": "Os Órfãos (The Turning, 2020 — Finn Wolfhard)",
        "patterns": [
          "os orfaos",
          "os órfãos",
          "the turning"
        ],
        "year": 2020
      },
      {
        "name": "Pinóquio por Guillermo del Toro (2022 — Finn Wolfhard)",
        "patterns": [
          "pinoquio",
          "pinóquio",
          "pinocchio"
        ],
        "year": 2022,
        "requireAdditionalPatterns": [
          "guillermo del toro",
          "del toro"
        ]
      },
      {
        "name": "Honor Society (2022 — Gaten Matarazzo)",
        "patterns": [
          "honor society"
        ],
        "year": 2022
      },
      {
        "name": "Angry Birds 2: O Filme (2019 — Gaten Matarazzo)",
        "patterns": [
          "angry birds 2"
        ],
        "year": 2019
      },
      {
        "name": "Alma de Cowboy (Concrete Cowboy, 2020 — Caleb McLaughlin)",
        "patterns": [
          "alma de cowboy",
          "concrete cowboy"
        ],
        "year": 2020
      },
      {
        "name": "A Libertação (The Deliverance, 2024 — Caleb McLaughlin)",
        "patterns": [
          "a libertacao",
          "a libertação",
          "the deliverance"
        ],
        "year": 2024
      },
      {
        "name": "O Halloween do Hubie (Hubie Halloween, 2020 — Noah Schnapp)",
        "patterns": [
          "o halloween do hubie",
          "hubie halloween"
        ],
        "year": 2020
      },
      {
        "name": "A Baleia (The Whale, 2022 — Sadie Sink)",
        "patterns": [
          "a baleia",
          "the whale"
        ],
        "year": 2022
      },
      {
        "name": "Rua do Medo: 1978 - Parte 2 (Fear Street Part Two: 1978, 2021 — Sadie Sink)",
        "patterns": [
          "rua do medo 1978",
          "rua do medo: 1978",
          "fear street part two 1978",
          "fear street 1978"
        ],
        "year": 2021
      }
    ]
  },
  "sort_order": 760
},
{
  "id": "tc_folha_em_branco_15",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo"],
  "tier": "bronze",
  "title": "DNA Cinéfilo: Ué, uma Folha em Branco?!",
  "description": "Conquistar 15 filmes cadastrados que possuam exatamente 0 tags customizadas vinculadas (15 filmes).",
  "icon": "📄",
  "target_type": "movie_zero_tags_count",
  "target_value": 15,
  "target_metadata": {
    "tagCount": 0
  },
  "sort_order": 761
},
{
  "id": "tc_em_familia_10",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo"],
  "tier": "bronze",
  "title": "DNA Cinéfilo: O Clã Reunido na Frente da TV!",
  "description": "Conquistar 10 filmes cadastrados com a tag Em Família (10 filmes).",
  "icon": "👨‍👩‍👧‍👦",
  "target_type": "tag_movie_count",
  "target_value": 10,
  "target_metadata": {
    "tags": ["Em Família"]
  },
  "sort_order": 762
},
{
  "id": "tc_em_familia_terror_5",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema"],
  "tier": "bronze",
  "title": "Susto Compartilhado (Segura no Meu Braço!)",
  "description": "Conquistar 5 filmes do gênero Terror que possuam a tag Em Família (5 filmes).",
  "icon": "😱",
  "target_type": "genre_tag_and",
  "target_value": 5,
  "target_metadata": {
    "genre": "Terror",
    "tag": "Em Família"
  },
  "sort_order": 763
},
{
  "id": "tc_em_familia_natal_3",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "data_limite"],
  "tier": "bronze",
  "title": "Ceia de Natal com Cinema e Família",
  "description": "Conquistar 3 filmes com a tag Em Família que tenham a tag Natal OU tenham sido assistidos no mês de Dezembro (3 filmes).",
  "icon": "🎄",
  "target_type": "tag_and_tag_or_month",
  "target_value": 3,
  "target_metadata": {
    "tag": "Em Família",
    "orTag": "Natal",
    "orMonth": 12
  },
  "sort_order": 764
},
{
  "id": "tc_em_familia_cinema_10",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "ritual_cinefilo"],
  "tier": "silver",
  "title": "Pipoca Dividida (Disputa de Balde na Fileira F)",
  "description": "Conquistar 10 filmes com a tag Em Família assistidos diretamente no Cinema (10 filmes).",
  "icon": "🍿",
  "target_type": "tag_platform_count",
  "target_value": 10,
  "target_metadata": {
    "tag": "Em Família",
    "platform": "Cinema"
  },
  "sort_order": 765
},
{
  "id": "tc_em_familia_nota_85_10",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "tribunal_critica"],
  "tier": "silver",
  "title": "Todos Estavam Aplaudindo ou Fui Só Eu Mesmo?!",
  "description": "Conquistar 10 filmes com a tag Em Família cuja Minha Nota seja maior ou igual a 8.500 (10 filmes).",
  "icon": "👏",
  "target_type": "tag_min_rating_count",
  "target_value": 10,
  "target_metadata": {
    "tag": "Em Família",
    "minRating": 8500
  },
  "sort_order": 766
},
{
  "id": "tc_em_familia_estrangeiro_5",
  "category": "volta_ao_mundo",
  "categories": ["volta_ao_mundo", "dna_cinefilo"],
  "tier": "silver",
  "title": "Melhor que Duolingo (Legenda Coletiva)",
  "description": "Conquistar 5 filmes com a tag Em Família produzidos fora do Brasil e fora dos Estados Unidos (5 filmes).",
  "icon": "🗣️",
  "target_type": "tag_non_br_us_count",
  "target_value": 5,
  "target_metadata": {
    "tag": "Em Família"
  },
  "sort_order": 767
},
{
  "id": "tc_em_familia_agosto_5",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "data_limite"],
  "tier": "silver",
  "title": "Festa de Aniversário com a Galera!",
  "description": "Conquistar 5 filmes com a tag Em Família assistidos no mês de Agosto (5 filmes).",
  "icon": "🎂",
  "target_type": "tag_month",
  "target_value": 5,
  "target_metadata": {
    "tag": "Em Família",
    "month": 8
  },
  "sort_order": 768
},
{
  "id": "tc_em_familia_streaming_15",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "ritual_cinefilo"],
  "tier": "silver",
  "title": "Sessão da Tarde no Sofá de Casa",
  "description": "Conquistar 15 filmes com a tag Em Família assistidos em plataformas de streaming oficiais (Netflix, Prime Video, HBO Max, Disney+, Star+ ou Apple TV+) (15 filmes).",
  "icon": "🛋️",
  "target_type": "tag_official_streaming_count",
  "target_value": 15,
  "target_metadata": {
    "tag": "Em Família"
  },
  "sort_order": 769
},
{
  "id": "tc_em_familia_marvel_dc_5",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "universos_sagas"],
  "tier": "silver",
  "title": "Maratona dos Heróis com a Turma",
  "description": "Conquistar 5 filmes com a tag Em Família que também possuam a tag Marvel ou DC (5 filmes).",
  "icon": "🦸‍♂️",
  "target_type": "tag_and_any_of_tags",
  "target_value": 5,
  "target_metadata": {
    "tag": "Em Família",
    "orTags": ["Marvel", "DC"]
  },
  "sort_order": 770
},
{
  "id": "tc_em_familia_emocionante_10",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema"],
  "tier": "silver",
  "title": "Choro Coletivo na Sala (Ninguém Escondeu a Lágrima)",
  "description": "Conquistar 10 filmes que possuam simultaneamente a tag Em Família e a tag Emocionante (10 filmes).",
  "icon": "😭",
  "target_type": "tag_double_and",
  "target_value": 10,
  "target_metadata": {
    "tags": ["Em Família", "Emocionante"]
  },
  "sort_order": 771
},
{
  "id": "tc_em_familia_nota_90_5",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "tribunal_critica"],
  "tier": "epic",
  "title": "Debate de Cozinha Pós-Créditos (Unanimidade Máxima)",
  "description": "Conquistar 5 filmes com a tag Em Família avaliados com Minha Nota maior ou igual a 9.000 (5 filmes).",
  "icon": "🍽️",
  "target_type": "tag_min_rating_count",
  "target_value": 5,
  "target_metadata": {
    "tag": "Em Família",
    "minRating": 9000
  },
  "sort_order": 772
},
{
  "id": "tc_em_familia_paises_5",
  "category": "volta_ao_mundo",
  "categories": ["volta_ao_mundo", "dna_cinefilo"],
  "tier": "epic",
  "title": "Conexão Sem Fronteiras com a Galera",
  "description": "Conquistar filmes com a tag Em Família cobrindo pelo menos 5 países de origem diferentes no catálogo (5 países).",
  "icon": "🌐",
  "target_type": "tag_distinct_countries_count",
  "target_value": 5,
  "target_metadata": {
    "tag": "Em Família"
  },
  "sort_order": 773
},
{
  "id": "tc_muitas_tags_7_30",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo"],
  "tier": "gold",
  "title": "DNA Cinéfilo: Isso Aqui É uma Loucura Generalizada!",
  "description": "Conquistar 30 filmes cadastrados que possuam 7 ou mais tags customizadas vinculadas no mesmo filme (30 filmes).",
  "icon": "🌪️",
  "target_type": "movies_min_tags_count",
  "target_value": 30,
  "target_metadata": {
    "minTags": 7
  },
  "sort_order": 774
},
{
  "id": "tc_em_familia_45",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo"],
  "tier": "gold",
  "title": "DNA Cinéfilo: Tudo É Bem Melhor com Amigos e Família!",
  "description": "Conquistar 45 filmes cadastrados com a tag Em Família (45 filmes).",
  "icon": "🥳",
  "target_type": "tag_movie_count",
  "target_value": 45,
  "target_metadata": {
    "tags": ["Em Família"]
  },
  "sort_order": 775
},
{
  "id": "cf_isaac_bardavid",
  "category": "calcada_da_fama",
  "categories": ["calcada_da_fama"],
  "tier": "gold",
  "title": "Calçada da Fama: Não Entra no Meu Caminho, Pirralho! (Tributo a Isaac Bardavid)",
  "description": "Conquistar pelo menos 10 dos 20 filmes da lista curada de dublagens históricas de Isaac Bardavid (Meta: 10 de 20 / 50%).",
  "icon": "🐺",
  "target_type": "calcada_fama_curated",
  "target_value": 10,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 10,
    "movies": [
      {
        "name": "X-Men: O Filme (2000)",
        "patterns": ["x-men o filme", "x-men", "x men"],
        "year": 2000,
        "exclude": ["x-men 2", "x2", "confronto final", "dias de um futuro", "apocalypse", "primeira classe", "origens", "dark phoenix", "fenix negra"]
      },
      {
        "name": "X-Men 2 (2003)",
        "patterns": ["x-men 2", "x2", "x men 2", "x-men ii"],
        "year": 2003
      },
      {
        "name": "X-Men: O Confronto Final (2006)",
        "patterns": ["confronto final", "the last stand", "x-men 3", "x-men iii", "x men 3"],
        "year": 2006
      },
      {
        "name": "X-Men Origens: Wolverine (2009)",
        "patterns": ["origens wolverine", "origins wolverine", "x-men origens"],
        "year": 2009
      },
      {
        "name": "Wolverine: Imortal (2013)",
        "patterns": ["wolverine imortal", "the wolverine"],
        "year": 2013,
        "exclude": ["origens", "origins"]
      },
      {
        "name": "X-Men: Dias de um Futuro Esquecido (2014)",
        "patterns": ["dias de um futuro esquecido", "days of future past"],
        "year": 2014
      },
      {
        "name": "Logan (2017)",
        "patterns": ["logan"],
        "year": 2017,
        "exclude": ["lucky logan", "logan lucky"]
      },
      {
        "name": "Van Helsing: O Caçador de Monstros (2004)",
        "patterns": ["van helsing"],
        "year": 2004
      },
      {
        "name": "O Grande Truque (2006)",
        "patterns": ["o grande truque", "the prestige"],
        "year": 2006
      },
      {
        "name": "Fonte da Vida (2006)",
        "patterns": ["fonte da vida", "the fountain"],
        "year": 2006
      },
      {
        "name": "Austrália (2008)",
        "patterns": ["australia"],
        "year": 2008
      },
      {
        "name": "Gigantes de Aço (2011)",
        "patterns": ["gigantes de aco", "real steel"],
        "year": 2011
      },
      {
        "name": "Os Miseráveis (2012)",
        "patterns": ["os miseraveis", "les miserables"],
        "year": 2012
      },
      {
        "name": "Os Suspeitos (2013)",
        "patterns": ["os suspeitos", "prisoners"],
        "year": 2013
      },
      {
        "name": "Uma Noite no Museu 3: O Segredo da Tumba (2014)",
        "patterns": ["o segredo da tumba", "secret of the tomb", "uma noite no museu 3", "night at the museum 3"],
        "year": 2014
      },
      {
        "name": "Chappie (2015)",
        "patterns": ["chappie"],
        "year": 2015
      },
      {
        "name": "Voando Alto (2016)",
        "patterns": ["voando alto", "eddie the eagle"],
        "year": 2016
      },
      {
        "name": "O Rei do Show (2017)",
        "patterns": ["o rei do show", "the greatest showman"],
        "year": 2017
      },
      {
        "name": "O Corcunda de Notre Dame (1996)",
        "patterns": ["o corcunda de notre dame", "corcunda de notre dame", "the hunchback of notre dame", "hunchback of notre dame"],
        "year": 1996
      },
      {
        "name": "He-Man e os Mestres do Universo (1987)",
        "patterns": ["he-man", "mestres do universo", "masters of the universe"],
        "year": 1987
      }
    ]
  },
  "sort_order": 776
},
{
  "id": "cf_wendel_bezerra",
  "category": "calcada_da_fama",
  "categories": ["calcada_da_fama"],
  "tier": "gold",
  "title": "Calçada da Fama: Oi, Eu Sou o Goku! (Ops... Não É o Goku)",
  "description": "Conquistar pelo menos 12 dos 20 filmes da lista curada de atuações de Wendel Bezerra em live-actions e produções fora da franquia Dragon Ball (Meta: 12 de 20 / 60%).",
  "icon": "⚡",
  "target_type": "calcada_fama_curated",
  "target_value": 12,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 12,
    "movies": [
      {
        "name": "O Senhor dos Anéis: A Sociedade do Anel (2001)",
        "patterns": ["a sociedade do anel", "fellowship of the ring"],
        "year": 2001
      },
      {
        "name": "O Senhor dos Anéis: As Duas Torres (2002)",
        "patterns": ["as duas torres", "the two towers"],
        "year": 2002
      },
      {
        "name": "O Senhor dos Anéis: O Retorno do Rei (2003)",
        "patterns": ["o retorno do rei", "return of the king"],
        "year": 2003
      },
      {
        "name": "Crepúsculo (2008)",
        "patterns": ["crepusculo", "twilight"],
        "year": 2008,
        "exclude": ["lua nova", "eclipse", "amanhecer", "breaking dawn", "new moon"]
      },
      {
        "name": "A Saga Crepúsculo: Lua Nova (2009)",
        "patterns": ["lua nova", "new moon"],
        "year": 2009
      },
      {
        "name": "A Saga Crepúsculo: Eclipse (2010)",
        "patterns": ["eclipse"],
        "year": 2010
      },
      {
        "name": "The Batman (2022)",
        "patterns": ["the batman"],
        "year": 2022
      },
      {
        "name": "Tenet (2020)",
        "patterns": ["tenet"],
        "year": 2020
      },
      {
        "name": "O Farol (2019)",
        "patterns": ["o farol", "the lighthouse"],
        "year": 2019
      },
      {
        "name": "Bob Esponja: O Filme (2004)",
        "patterns": ["bob esponja o filme", "the spongebob squarepants movie", "spongebob squarepants movie"],
        "year": 2004,
        "exclude": ["fora d'agua", "fora d agua", "sponge out of water", "incrivel resgate", "sponge on the run"]
      },
      {
        "name": "Bob Esponja: Um Herói Fora D'Água (2015)",
        "patterns": ["um heroi fora d'agua", "um heroi fora d agua", "sponge out of water"],
        "year": 2015
      },
      {
        "name": "Bob Esponja: O Incrível Resgate (2020)",
        "patterns": ["o incrivel resgate", "sponge on the run"],
        "year": 2020
      },
      {
        "name": "Curtindo a Vida Adoidado (1986)",
        "patterns": ["curtindo a vida adoidado", "ferris bueller"],
        "year": 1986
      },
      {
        "name": "Meninas Malvadas (2004)",
        "patterns": ["meninas malvadas", "mean girls"],
        "year": 2004,
        "exclude": ["meninas malvadas 2", "mean girls 2"]
      },
      {
        "name": "Scott Pilgrim Contra o Mundo (2010)",
        "patterns": ["scott pilgrim", "contra o mundo"],
        "year": 2010
      },
      {
        "name": "Donnie Darko (2001)",
        "patterns": ["donnie darko"],
        "year": 2001
      },
      {
        "name": "Kick-Ass: Quebrando Tudo (2010)",
        "patterns": ["kick-ass", "kick ass"],
        "year": 2010,
        "exclude": ["kick-ass 2", "kick ass 2"]
      },
      {
        "name": "Bastardos Inglórios (2009)",
        "patterns": ["bastardos inglorios", "inglourious basterds"],
        "year": 2009
      },
      {
        "name": "Superbad: É Hoje (2007)",
        "patterns": ["superbad"],
        "year": 2007
      },
      {
        "name": "Gladiador (2000)",
        "patterns": ["gladiador", "gladiator"],
        "year": 2000,
        "exclude": ["gladiador 2", "gladiator 2", "gladiator ii"]
      }
    ]
  },
  "sort_order": 777
},
{
  "id": "mh_guillermo_del_toro_6",
  "category": "mafia_hollywood",
  "categories": ["mafia_hollywood"],
  "tier": "gold",
  "title": "A Máfia de Hollywood: Feito à Mão com Gosma e Poesia",
  "description": "Conquistar 6 filmes que tenham Guillermo del Toro creditado no campo de Direção ou Roteiro (6 filmes).",
  "icon": "👁️",
  "target_type": "hollywood_director_or_writer_count",
  "target_value": 6,
  "target_metadata": {
    "person": "Guillermo del Toro",
    "patterns": ["guillermo del toro", "del toro"]
  },
  "sort_order": 778
},
{
  "id": "tc_you_died_terror_tragico_nota_3",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema", "tribunal_critica"],
  "tier": "epic",
  "title": "YOU DIED! (Nem com Guia do Detonado)",
  "description": "Conquistar 3 filmes que combinem simultaneamente o gênero Terror, a tag Trágico e Minha Nota estritamente maior que 8.500 (3 filmes).",
  "icon": "💀",
  "target_type": "terror_tragico_min_rating",
  "target_value": 3,
  "target_metadata": {
    "genre": "Terror",
    "tag": "Trágico",
    "minRating": 8500
  },
  "sort_order": 779
},
{
  "id": "tc_achou_errado_rt_lt40_ur_gte80_5",
  "category": "tribunal_critica",
  "categories": ["tribunal_critica"],
  "tier": "silver",
  "title": "Achou Errado, Otário! (Doutor em Transporte Alternativo)",
  "description": "Conquistar 5 filmes onde o Rotten Tomatoes esteja cadastrado/válido abaixo de 40%, mas a Minha Nota pessoal seja maior ou igual a 8.000 (5 filmes).",
  "icon": "🚐",
  "target_type": "rt_lt_ur_gte_count",
  "target_value": 5,
  "target_metadata": {
    "maxRt": 40,
    "minRating": 8000
  },
  "sort_order": 780
},
{
  "id": "tc_press_f_tragico_emocionante_fisica_5",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "ritual_cinefilo"],
  "tier": "silver",
  "title": "Press F to Pay Respects",
  "description": "Conquistar 5 filmes que possuam a tag pessoal Trágico OU a tag pessoal Emocionante, assistidos em mídia física (Blu-ray ou DVD) (5 filmes).",
  "icon": "⌨️",
  "target_type": "tags_or_physical_media_count",
  "target_value": 5,
  "target_metadata": {
    "orTags": ["Trágico", "Emocionante"]
  },
  "sort_order": 781
},
{
  "id": "tc_ah_shit_repetido_crime_acao_1990_2004_1",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema", "ritual_cinefilo"],
  "tier": "bronze",
  "title": "Ah Shit, Here We Go Again... (CJ de Volta ao Bairro)",
  "description": "Conquistar 1 filme que possua a tag Repetido, pertença ao gênero Crime OU Ação, e tenha ano de lançamento situado entre 1990 e 2004 (1 filme).",
  "icon": "🚲",
  "target_type": "tag_and_genres_or_year_range",
  "target_value": 1,
  "target_metadata": {
    "tag": "Repetido",
    "orGenres": ["Crime", "Ação"],
    "minYear": 1990,
    "maxYear": 2004
  },
  "sort_order": 782
},
{
  "id": "tc_triforce_do_cinema",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema", "ritual_cinefilo", "tribunal_critica"],
  "tier": "mythic",
  "title": "A Triforce do Cinema (As Três Virtudes de Hyrule)",
  "description": "Cumprir os 30 marcos do checklist das três virtudes de Hyrule (30 filmes): 10 de Ação/Guerra (>140m), 10 de Doc/Hist/Bio (Nota >= 8.0) e 10 de Terror com Demônio/Gore/Fantasma.",
  "icon": "🔺",
  "target_type": "hyrule_triforce_checklist",
  "target_value": 30,
  "target_metadata": {
    "poderTarget": 10,
    "sabedoriaTarget": 10,
    "coragemTarget": 10
  },
  "sort_order": 783
},
{
  "id": "tc_magia_profunda_bruxa_decadas",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "ritual_cinefilo"],
  "tier": "mythic",
  "title": "Não me cite a Magia Profunda, Bruxa. Eu estava lá quando ela foi escrita.",
  "description": "Conquistar pelo menos 1 filme com a tag Bruxo em cada uma das 8 décadas entre 1960s e 2030s (1960s, 1970s, 1980s, 1990s, 2000s, 2010s, 2020s, 2030s) (8 décadas no checklist).",
  "icon": "🧙‍♀️",
  "target_type": "tag_decades_checklist",
  "target_value": 8,
  "target_metadata": {
    "tag": "Bruxo",
    "decades": [1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030]
  },
  "sort_order": 784
},
{
  "id": "ss_gotta_go_fast",
  "category": "sessao_secreta",
  "categories": ["sessao_secreta"],
  "tier": "gold",
  "title": "Sessão Secreta: Gotta Go Fast!",
  "description": "Conquistar pelo menos 14 dos 20 filmes da lista curada de velocistas e aceleração extrema (Meta: 14 de 20 / 70%).",
  "icon": "🦔",
  "target_type": "secret_session_curated",
  "target_value": 14,
  "target_metadata": {
    "curatedCount": 20,
    "minTarget": 14,
    "movies": [
      {
        "name": "Sonic: O Filme (2020)",
        "patterns": ["sonic: o filme", "sonic o filme", "sonic the hedgehog"],
        "year": 2020,
        "exclude": ["sonic 2", "sonic 3", "sonic the hedgehog 2", "sonic the hedgehog 3"]
      },
      {
        "name": "Sonic 2: O Filme (2022)",
        "patterns": ["sonic 2", "sonic the hedgehog 2"],
        "year": 2022
      },
      {
        "name": "Sonic 3: O Filme (2024)",
        "patterns": ["sonic 3", "sonic the hedgehog 3"],
        "year": 2024
      },
      {
        "name": "The Flash (2023)",
        "patterns": ["the flash", "flash"],
        "year": 2023
      },
      {
        "name": "X-Men: Dias de um Futuro Esquecido (2014)",
        "patterns": ["dias de um futuro esquecido", "days of future past"]
      },
      {
        "name": "X-Men: Apocalipse (2016)",
        "patterns": ["x-men: apocalipse", "x-men apocalipse", "x-men: apocalypse", "x-men apocalypse"]
      },
      {
        "name": "X-Men: Fênix Negra (2019)",
        "patterns": ["fênix negra", "fenix negra", "dark phoenix"]
      },
      {
        "name": "Vingadores: Era de Ultron (2015)",
        "patterns": ["era de ultron", "age of ultron"]
      },
      {
        "name": "Os Incríveis (2004)",
        "patterns": ["os incríveis", "os incriveis", "the incredibles"],
        "year": 2004,
        "exclude": ["os incríveis 2", "os incriveis 2", "the incredibles 2", "incredibles 2"]
      },
      {
        "name": "Os Incríveis 2 (2018)",
        "patterns": ["os incríveis 2", "os incriveis 2", "the incredibles 2", "incredibles 2"],
        "year": 2018
      },
      {
        "name": "Eternos (2021)",
        "patterns": ["eternos", "eternals"],
        "year": 2021
      },
      {
        "name": "Liga da Justiça de Zack Snyder (2021)",
        "patterns": ["liga da justiça de zack snyder", "liga da justica de zack snyder", "zack snyder's justice league", "snyder cut"],
        "year": 2021
      },
      {
        "name": "Turbo (2013)",
        "patterns": ["turbo"],
        "year": 2013
      },
      {
        "name": "Sky High: Super Escola de Heróis (2005)",
        "patterns": ["sky high", "super escola de heróis", "super escola de herois"]
      },
      {
        "name": "Shazam! (2019)",
        "patterns": ["shazam"],
        "year": 2019,
        "exclude": ["fúria dos deuses", "furia dos deuses", "fury of the gods"]
      },
      {
        "name": "Shazam! Fúria dos Deuses (2023)",
        "patterns": ["fúria dos deuses", "furia dos deuses", "fury of the gods"]
      },
      {
        "name": "Detona Ralph (2012)",
        "patterns": ["detona ralph", "wreck-it ralph"],
        "exclude": ["quebra a internet", "breaks the internet", "detona ralph 2"]
      },
      {
        "name": "Space Jam: O Jogo do Século (1996)",
        "patterns": ["space jam: o jogo do século", "space jam o jogo do seculo", "space jam"],
        "year": 1996,
        "exclude": ["um novo legado", "a new legacy"]
      },
      {
        "name": "Looney Tunes: De Volta à Ação (2003)",
        "patterns": ["de volta à ação", "de volta a acao", "back in action"]
      },
      {
        "name": "Forrest Gump: O Contador de Histórias (1994)",
        "patterns": ["forrest gump"],
        "year": 1994
      }
    ]
  },
  "sort_order": 785
},
{
  "id": "tc_new_game_plus_repetido_nota_9",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "tribunal_critica"],
  "tier": "gold",
  "title": "New Game+ (A Revanche dos Veteranos)",
  "description": "Conquistar 5 filmes cadastrados com a tag Repetido cuja Minha Nota seja maior ou igual a 9.000 (5 filmes).",
  "icon": "🔁",
  "target_type": "tag_min_rating_count",
  "target_value": 5,
  "target_metadata": {
    "tag": "Repetido",
    "minRating": 9000
  },
  "sort_order": 786
},
{
  "id": "tc_konami_code_acao_aventura_1980s_30",
  "category": "anatomia_cinema",
  "categories": ["anatomia_cinema", "ritual_cinefilo"],
  "tier": "gold",
  "title": "Konami Code: 30 Vidas no Cineclube!",
  "description": "Conquistar 30 filmes dos gêneros Ação ou Aventura lançados na década de 1980 (entre 1980 e 1989) (30 filmes).",
  "icon": "🎮",
  "target_type": "genres_or_decade_range_count",
  "target_value": 30,
  "target_metadata": {
    "genres": ["Ação", "Aventura"],
    "minYear": 1980,
    "maxYear": 1989
  },
  "sort_order": 787
},
{
  "id": "tc_666_sessao_do_capeta",
  "category": "tribunal_critica",
  "categories": ["tribunal_critica"],
  "tier": "epic",
  "title": "666: Sessão do Capeta (A Besta Mediana do Purgatório)",
  "description": "Conquistar 6 filmes onde pelo menos 3 notas distintas (entre Rotten Tomatoes, Metacritic, IMDb e Minha Nota) estejam na faixa do \"6\" (60% a 69% ou 6.0 a 6.9) (6 filmes).",
  "icon": "🤘",
  "target_type": "multi_critic_range_count",
  "target_value": 6,
  "target_metadata": {
    "digit": 6,
    "minDistinctMetrics": 3
  },
  "sort_order": 788
},
{
  "id": "tc_climao_almoco_domingo",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema"],
  "tier": "epic",
  "title": "Climão no Almoço de Domingo (Chama a Christina Rocha!)",
  "description": "Conquistar 10 filmes do gênero Drama que possuam a tag Em família combinada com a tag Abuso familiar OU Preconceito (10 filmes).",
  "icon": "🛋️",
  "target_type": "genre_and_tag_and_any_tag",
  "target_value": 10,
  "target_metadata": {
    "genre": "Drama",
    "requiredTag": "Em Família",
    "orTags": ["Abuso Familiar", "Preconceito"]
  },
  "sort_order": 789
},
{
  "id": "tc_e_morreu_terror_suspense_tragico_final_epico",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema"],
  "tier": "epic",
  "title": "E Morreu... (Sem Direito a Checkpoint)",
  "description": "Conquistar 30 filmes do gênero Terror ou Suspense que possuam simultaneamente a tag Trágico e a tag Final epico (30 filmes).",
  "icon": "💀",
  "target_type": "genres_or_and_tags_and",
  "target_value": 30,
  "target_metadata": {
    "genres": ["Terror", "Suspense"],
    "requiredTags": ["Trágico", "Final Epico"]
  },
  "sort_order": 790
},
{
  "id": "tc_333_o_meio_besta",
  "category": "tribunal_critica",
  "categories": ["tribunal_critica"],
  "tier": "silver",
  "title": "333: O Meio-Besta (Nem o Diabo Quis Completo)",
  "description": "Conquistar 3 filmes onde pelo menos 3 notas distintas (entre Rotten Tomatoes, Metacritic, IMDb e Minha Nota) estejam na faixa do \"3\" (30% a 39% ou 3.0 a 3.9) (3 filmes).",
  "icon": "🐐",
  "target_type": "multi_critic_range_count",
  "target_value": 3,
  "target_metadata": {
    "digit": 3,
    "minDistinctMetrics": 3
  },
  "sort_order": 791
},
{
  "id": "tc_milagre_industria_baseado_jogo_nota_8",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "tribunal_critica"],
  "tier": "silver",
  "title": "Milagre na Indústria: Essa Adaptação Ficou Boa?!",
  "description": "Conquistar 3 filmes com a tag Baseado em jogo onde a Minha Nota seja igual ou superior a 8.000 (3 filmes).",
  "icon": "👾",
  "target_type": "tag_min_rating_count",
  "target_value": 3,
  "target_metadata": {
    "tag": "Baseado em jogo",
    "minRating": 8000
  },
  "sort_order": 792
},
{
  "id": "tc_cake_is_a_lie_ficcao_dystopia_viagem_nota_lt5",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "anatomia_cinema", "tribunal_critica"],
  "tier": "silver",
  "title": "O Bolo É uma Mentira! (The Cake Is a Lie)",
  "description": "Conquistar 3 filmes do gênero Ficção Científica com a tag Dystopia OU Viagem no tempo que tenham recebido Minha Nota abaixo de 5.000 (3 filmes).",
  "icon": "🎂",
  "target_type": "genre_and_tags_or_max_rating",
  "target_value": 3,
  "target_metadata": {
    "genre": "Ficção Científica",
    "orTags": ["Dystopia", "Viagem no Tempo"],
    "maxRating": 5000
  },
  "sort_order": 793
},
{
  "id": "tc_snake_stealth_suspense_crime",
  "category": "anatomia_cinema",
  "categories": ["anatomia_cinema", "dna_cinefilo"],
  "tier": "silver",
  "title": "Snake? Snake?! SNAAAAAKE!",
  "description": "Conquistar 9 filmes do gênero Suspense ou Crime que possuam a tag Fatos reais ou Sequestro, mas SEM o gênero Ação e SEM a tag Gore (9 filmes).",
  "icon": "📦",
  "target_type": "stealth_suspense_crime_count",
  "target_value": 9,
  "target_metadata": {
    "includeGenres": ["Suspense", "Crime"],
    "includeTags": ["Fatos reais", "Sequestro"],
    "excludeGenres": ["Ação"],
    "excludeTags": ["Gore"]
  },
  "sort_order": 794
},
{
  "id": "mh_roberto_gomez_bolanos",
  "category": "mafia_hollywood",
  "categories": ["mafia_hollywood"],
  "tier": "silver",
  "title": "A Máfia de Hollywood: Isso, Isso, Isso! (Tá em Acapulco Tomando Coco)",
  "description": "Conquistar 1 filme que tenha Roberto Gómez Bolaños creditado em Direção, Roteiro ou Produção (1 filme).",
  "icon": "🥪",
  "target_type": "hollywood_director_or_writer_count",
  "target_value": 1,
  "target_metadata": {
    "person": "Roberto Gómez Bolaños",
    "patterns": ["roberto gomez bolanos", "roberto gómez bolaños", "chespirito"],
    "checkProducers": true
  },
  "sort_order": 795
},
{
  "id": "tc_rush_b_acao_max_90_min",
  "category": "anatomia_cinema",
  "categories": ["anatomia_cinema", "ritual_cinefilo"],
  "tier": "silver",
  "title": "\"Rush B, Não Para!\" (Modo Tático do CS)",
  "description": "Conquistar 10 filmes do gênero Ação com duração máxima de até 90 minutos (10 filmes).",
  "icon": "💣",
  "target_type": "genre_max_runtime_count",
  "target_value": 10,
  "target_metadata": {
    "genre": "Ação",
    "maxRuntime": 90
  },
  "sort_order": 796
},
{
  "id": "tc_e_verdade_esse_bilete_fatos_reais_nota_lt6",
  "category": "dna_cinefilo",
  "categories": ["dna_cinefilo", "tribunal_critica"],
  "tier": "silver",
  "title": "\"É Verdade Esse Bilete\" (Confia!)",
  "description": "Conquistar 5 filmes com a tag Fatos reais que tenham recebido Minha Nota abaixo de 6.000 (5 filmes).",
  "icon": "🎟️",
  "target_type": "tag_max_rating_count",
  "target_value": 5,
  "target_metadata": {
    "tag": "Fatos reais",
    "maxRating": 6000
  },
  "sort_order": 797
},
{
  "id": "tc_ray_tracing_bomba_2021_ficcao_acao_reviews_500k",
  "category": "anatomia_cinema",
  "categories": ["anatomia_cinema", "ritual_cinefilo", "tribunal_critica"],
  "tier": "silver",
  "title": "\"Nem o Ray Tracing Salva Essa Bomba!\"",
  "description": "Conquistar 3 filmes lançados a partir do ano de 2021 do gênero Ficção Científica ou Ação que tenham mais de 500.000 Global Reviews e Minha Nota abaixo de 5.000 (3 filmes).",
  "icon": "💥",
  "target_type": "bomba_ray_tracing_count",
  "target_value": 3,
  "target_metadata": {
    "genres": ["Ficção Científica", "Ação"],
    "minYear": 2021,
    "minGlobalReviews": 500000,
    "maxRating": 5000
  },
  "sort_order": 798
},
{
  "id": "tc_achou_que_nao_ia_ter_cinema_fev_mar_set",
  "category": "ritual_cinefilo",
  "categories": ["ritual_cinefilo", "data_limite"],
  "tier": "bronze",
  "title": "Achou que Não Ia Ter Cinema Hoje? Achou Errado, Otário!",
  "description": "Conquistar 3 filmes assistidos no Cinema durante os meses de Fevereiro, Março ou Setembro (3 filmes).",
  "icon": "🚐",
  "target_type": "cinema_specific_months_count",
  "target_value": 3,
  "target_metadata": {
    "months": [2, 3, 9]
  },
  "sort_order": 799
},
{
  "id": "us_michael_jackson_collection",
  "category": "universos_sagas",
  "categories": [
    "universos_sagas"
  ],
  "tier": "epic",
  "title": "Universos & Sagas: Hee-Hee! O Rei do Pop nas Telonas (Coleção Completa)",
  "description": "Conquistar os 5 filmes da coleção cinematográfica oficial de Michael Jackson.",
  "icon": "🕺",
  "target_type": "franchise_movie_list",
  "target_value": 5,
  "target_metadata": {
    "franchise": "Michael Jackson",
    "requireAll": true,
    "movies": [
      {
        "name": "Moonwalker (1988)",
        "patterns": [
          "Moonwalker"
        ],
        "year": 1988
      },
      {
        "name": "Michael Jackson: This Is It (2009)",
        "patterns": [
          "This Is It",
          "Michael Jackson: This Is It",
          "Michael Jackson's This Is It"
        ],
        "year": 2009
      },
      {
        "name": "Michael (2025/2026 — Cinebiografia Oficial)",
        "patterns": [
          "Michael",
          "Michael Jackson"
        ],
        "year": 2025,
        "exclude": [
          "Michael Clayton",
          "Michael Collins",
          "George Michael"
        ]
      },
      {
        "name": "Michael Jackson's Ghosts (1996)",
        "patterns": [
          "Ghosts",
          "Michael Jackson's Ghosts",
          "Michael Jackson: Ghosts"
        ],
        "year": 1996,
        "exclude": [
          "Ghost - Do Outro Lado",
          "Ghostbusters",
          "Ghost in the Shell",
          "Ghost Rider"
        ]
      },
      {
        "name": "Thriller 40 (2023) ou Bad 25 (2012)",
        "patterns": [
          "Thriller 40",
          "Bad 25",
          "Michael Jackson: Thriller 40",
          "Michael Jackson's Thriller 40",
          "Michael Jackson Bad 25",
          "Michael Jackson: Bad 25"
        ]
      }
    ]
  },
  "sort_order": 800
},
{
  "id": "multi_michael_jackson_ultimate_anthology",
  "category": "multi",
  "categories": [
    "dna_cinefilo",
    "anatomia_cinema",
    "volta_ao_mundo"
  ],
  "tier": "mythic",
  "title": "The Ultimate Anthology: O Disco de Diamante (15 Faixas + 15 Sons)",
  "description": "Conquistar 15 filmes com o gênero Música + o checklist das 15 faixas cronológicas do Rei do Pop (16 marcos).",
  "icon": "💿",
  "target_type": "michael_jackson_anthology",
  "target_value": 16,
  "target_metadata": {
    "isHybrid": true,
    "totalTracks": 15,
    "requiredMusicGenreCount": 15
  },
  "sort_order": 801
}
];
