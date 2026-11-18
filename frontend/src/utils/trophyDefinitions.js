export const TIER_CONFIG = {
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

export const TROPHY_DEFINITIONS = [
  {
    "id": "vm_rank_brasil",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "É do Brasil! (Pátria Cinematográfica)",
    "description": "Assistir filmes do Brasil (inclui coproduções).",
    "icon": "🇧🇷",
    "target_type": "country_movie_count",
    "target_value": 70,
    "target_metadata": {
      "countryCode": "br",
      "countryName": "Brasil"
    },
    "ranks": [
      {
        "id": "vm_rank_brasil__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "É do Brasil!",
        "description": "Assistir filmes do Brasil (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "vm_br_first"
      },
      {
        "id": "vm_rank_brasil__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "Cinema Nacional",
        "description": "Assistir filmes do Brasil (inclui coproduções). (Rank Prata: meta 10).",
        "legacy_id": "vm_br_10"
      },
      {
        "id": "vm_rank_brasil__epic",
        "tier": "epic",
        "target_value": 25,
        "title": "Cinéfilo Cult Brasileiro",
        "description": "Assistir filmes do Brasil (inclui coproduções). (Rank Épico: meta 25).",
        "legacy_id": "vm_br_20"
      },
      {
        "id": "vm_rank_brasil__gold",
        "tier": "gold",
        "target_value": 45,
        "title": "Cinema em Casa",
        "description": "Assistir filmes do Brasil (inclui coproduções). (Rank Ouro: meta 45).",
        "legacy_id": "vm_br_35"
      },
      {
        "id": "vm_rank_brasil__mythic",
        "tier": "mythic",
        "target_value": 70,
        "title": "Como Alguém Pode Falar Mal dos Filmes do Brasil?",
        "description": "Assistir filmes do Brasil (inclui coproduções). (Rank Mítico: meta 70).",
        "legacy_id": "vm_br_50"
      }
    ],
    "legacy_ids": [
      "vm_br_first",
      "vm_br_10",
      "vm_br_20",
      "vm_br_35",
      "vm_br_50"
    ],
    "sort_order": 1
  },
  {
    "id": "vm_rank_countries_195",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Dono do Tabuleiro de War (Da Bruxa do 71 aos 195!)",
    "description": "Conquistar países diferentes no Desafio dos 195 (país de origem único).",
    "icon": "🗺️",
    "target_type": "conquered_countries_count",
    "target_value": 195,
    "target_metadata": {},
    "ranks": [
      {
        "id": "vm_rank_countries_195__bronze",
        "tier": "bronze",
        "target_value": 25,
        "title": "Mochileiro Continental (25 Países)",
        "description": "Conquistar países diferentes no Desafio dos 195 (país de origem único). (Rank Bronze: meta 25).",
        "legacy_id": "vm_countries_25"
      },
      {
        "id": "vm_rank_countries_195__silver",
        "tier": "silver",
        "target_value": 50,
        "title": "Cidadão do Mundo (50 Países)",
        "description": "Conquistar países diferentes no Desafio dos 195 (país de origem único). (Rank Prata: meta 50).",
        "legacy_id": "vm_countries_50"
      },
      {
        "id": "vm_rank_countries_195__epic",
        "tier": "epic",
        "target_value": 71,
        "title": "A Bruxa do 71? (71 Países!)",
        "description": "Conquistar países diferentes no Desafio dos 195 (país de origem único). (Rank Épico: meta 71).",
        "legacy_id": "vm_countries_71"
      },
      {
        "id": "vm_rank_countries_195__gold",
        "tier": "gold",
        "target_value": 130,
        "title": "A Reta Final (130 Países)",
        "description": "Conquistar países diferentes no Desafio dos 195 (país de origem único). (Rank Ouro: meta 130).",
        "legacy_id": "vm_countries_150"
      },
      {
        "id": "vm_rank_countries_195__mythic",
        "tier": "mythic",
        "target_value": 195,
        "title": "Dono do Tabuleiro de War (195 Países!)",
        "description": "Conquistar países diferentes no Desafio dos 195 (país de origem único). (Rank Mítico: meta 195).",
        "legacy_id": "vm_war_board_100"
      }
    ],
    "legacy_ids": [
      "vm_countries_25",
      "vm_countries_50",
      "vm_countries_71",
      "vm_countries_150",
      "vm_war_board_100"
    ],
    "sort_order": 2
  },
  {
    "id": "vm_rank_eua",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Hollywood! (O Império do Tio Sam)",
    "description": "Assistir filmes dos Estados Unidos (inclui coproduções).",
    "icon": "🇺🇸",
    "target_type": "country_movie_count",
    "target_value": 400,
    "target_metadata": {
      "countryCode": "us",
      "countryName": "Estados Unidos"
    },
    "ranks": [
      {
        "id": "vm_rank_eua__bronze",
        "tier": "bronze",
        "target_value": 50,
        "title": "Passaporte Americano (50 EUA)",
        "description": "Assistir filmes dos Estados Unidos (inclui coproduções). (Rank Bronze: meta 50).",
        "legacy_id": "vm_us_300"
      },
      {
        "id": "vm_rank_eua__silver",
        "tier": "silver",
        "target_value": 120,
        "title": "Rota 66 de Cinema (120 EUA)",
        "description": "Assistir filmes dos Estados Unidos (inclui coproduções). (Rank Prata: meta 120).",
        "legacy_id": "vm_us_300"
      },
      {
        "id": "vm_rank_eua__epic",
        "tier": "epic",
        "target_value": 200,
        "title": "Estrela na Calçada (200 EUA)",
        "description": "Assistir filmes dos Estados Unidos (inclui coproduções). (Rank Épico: meta 200).",
        "legacy_id": "vm_us_300"
      },
      {
        "id": "vm_rank_eua__gold",
        "tier": "gold",
        "target_value": 300,
        "title": "Hollywood! (300 EUA)",
        "description": "Assistir filmes dos Estados Unidos (inclui coproduções). (Rank Ouro: meta 300).",
        "legacy_id": "vm_us_300"
      },
      {
        "id": "vm_rank_eua__mythic",
        "tier": "mythic",
        "target_value": 400,
        "title": "O Pior País do Mundo Ainda Faz Uns Filmes Bons! (400 EUA)",
        "description": "Assistir filmes dos Estados Unidos (inclui coproduções). (Rank Mítico: meta 400).",
        "legacy_id": "vm_us_500"
      }
    ],
    "legacy_ids": [
      "vm_us_300",
      "vm_us_300",
      "vm_us_300",
      "vm_us_300",
      "vm_us_500"
    ],
    "sort_order": 3
  },
  {
    "id": "vm_rank_franca",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Baguete, Vinho & Nouvelle Vague",
    "description": "Assistir filmes da França (inclui coproduções).",
    "icon": "🥖",
    "target_type": "country_movie_count",
    "target_value": 10,
    "target_metadata": {
      "countryCode": "fr",
      "countryName": "França"
    },
    "ranks": [
      {
        "id": "vm_rank_franca__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Baguete, Vinho & Nouvelle Vague • Rank Bronze",
        "description": "Assistir filmes da França (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "vm_fr_first"
      },
      {
        "id": "vm_rank_franca__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Baguete, Vinho & Nouvelle Vague • Rank Prata",
        "description": "Assistir filmes da França (inclui coproduções). (Rank Prata: meta 3)."
      },
      {
        "id": "vm_rank_franca__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Baguete, Vinho & Nouvelle Vague • Rank Épico",
        "description": "Assistir filmes da França (inclui coproduções). (Rank Épico: meta 5)."
      },
      {
        "id": "vm_rank_franca__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Baguete, Vinho & Nouvelle Vague • Rank Ouro",
        "description": "Assistir filmes da França (inclui coproduções). (Rank Ouro: meta 8)."
      },
      {
        "id": "vm_rank_franca__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Baguete, Vinho & Nouvelle Vague • Rank Mítico",
        "description": "Assistir filmes da França (inclui coproduções). (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "vm_fr_first"
    ],
    "sort_order": 4
  },
  {
    "id": "vm_rank_japao",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Otaku ou Cinéfilo? (Terra do Sol Nascente)",
    "description": "Assistir filmes do Japão (inclui coproduções).",
    "icon": "⛩️",
    "target_type": "country_movie_count",
    "target_value": 30,
    "target_metadata": {
      "countryCode": "jp",
      "countryName": "Japão"
    },
    "ranks": [
      {
        "id": "vm_rank_japao__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Otaku ou Cinéfilo? (Terra do Sol Nascente) • Rank Bronze",
        "description": "Assistir filmes do Japão (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "vm_jp_first"
      },
      {
        "id": "vm_rank_japao__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Otaku ou Cinéfilo? (Terra do Sol Nascente) • Rank Prata",
        "description": "Assistir filmes do Japão (inclui coproduções). (Rank Prata: meta 5)."
      },
      {
        "id": "vm_rank_japao__epic",
        "tier": "epic",
        "target_value": 12,
        "title": "Otaku ou Cinéfilo? (Terra do Sol Nascente) • Rank Épico",
        "description": "Assistir filmes do Japão (inclui coproduções). (Rank Épico: meta 12)."
      },
      {
        "id": "vm_rank_japao__gold",
        "tier": "gold",
        "target_value": 20,
        "title": "Otaku ou Cinéfilo? (Terra do Sol Nascente) • Rank Ouro",
        "description": "Assistir filmes do Japão (inclui coproduções). (Rank Ouro: meta 20)."
      },
      {
        "id": "vm_rank_japao__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Otaku ou Cinéfilo? (Terra do Sol Nascente) • Rank Mítico",
        "description": "Assistir filmes do Japão (inclui coproduções). (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "vm_jp_first"
    ],
    "sort_order": 5
  },
  {
    "id": "vm_rank_coreia_sul",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "K-Pop, Dorama e Parasita",
    "description": "Assistir filmes da Coreia do Sul (inclui coproduções).",
    "icon": "🥢",
    "target_type": "country_movie_count",
    "target_value": 5,
    "target_metadata": {
      "countryCode": "kr",
      "countryName": "Coreia do Sul"
    },
    "ranks": [
      {
        "id": "vm_rank_coreia_sul__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "K-Pop, Dorama e Parasita • Rank Bronze",
        "description": "Assistir filmes da Coreia do Sul (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "vm_kr_first"
      },
      {
        "id": "vm_rank_coreia_sul__silver",
        "tier": "silver",
        "target_value": 2,
        "title": "K-Pop, Dorama e Parasita • Rank Prata",
        "description": "Assistir filmes da Coreia do Sul (inclui coproduções). (Rank Prata: meta 2)."
      },
      {
        "id": "vm_rank_coreia_sul__epic",
        "tier": "epic",
        "target_value": 3,
        "title": "K-Pop, Dorama e Parasita • Rank Épico",
        "description": "Assistir filmes da Coreia do Sul (inclui coproduções). (Rank Épico: meta 3)."
      },
      {
        "id": "vm_rank_coreia_sul__gold",
        "tier": "gold",
        "target_value": 4,
        "title": "K-Pop, Dorama e Parasita • Rank Ouro",
        "description": "Assistir filmes da Coreia do Sul (inclui coproduções). (Rank Ouro: meta 4)."
      },
      {
        "id": "vm_rank_coreia_sul__mythic",
        "tier": "mythic",
        "target_value": 5,
        "title": "K-Pop, Dorama e Parasita • Rank Mítico",
        "description": "Assistir filmes da Coreia do Sul (inclui coproduções). (Rank Mítico: meta 5)."
      }
    ],
    "legacy_ids": [
      "vm_kr_first"
    ],
    "sort_order": 6
  },
  {
    "id": "vm_rank_islandia",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Só Tem Gelo, Vulcão e Paisagem Bonita",
    "description": "Assistir filmes da Islândia (inclui coproduções).",
    "icon": "🌋",
    "target_type": "country_movie_count",
    "target_value": 10,
    "target_metadata": {
      "countryCode": "is",
      "countryName": "Islândia"
    },
    "ranks": [
      {
        "id": "vm_rank_islandia__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Só Tem Gelo, Vulcão e Paisagem Bonita • Rank Bronze",
        "description": "Assistir filmes da Islândia (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "vm_is_first"
      },
      {
        "id": "vm_rank_islandia__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Só Tem Gelo, Vulcão e Paisagem Bonita • Rank Prata",
        "description": "Assistir filmes da Islândia (inclui coproduções). (Rank Prata: meta 3)."
      },
      {
        "id": "vm_rank_islandia__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Só Tem Gelo, Vulcão e Paisagem Bonita • Rank Épico",
        "description": "Assistir filmes da Islândia (inclui coproduções). (Rank Épico: meta 5)."
      },
      {
        "id": "vm_rank_islandia__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Só Tem Gelo, Vulcão e Paisagem Bonita • Rank Ouro",
        "description": "Assistir filmes da Islândia (inclui coproduções). (Rank Ouro: meta 8)."
      },
      {
        "id": "vm_rank_islandia__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Só Tem Gelo, Vulcão e Paisagem Bonita • Rank Mítico",
        "description": "Assistir filmes da Islândia (inclui coproduções). (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "vm_is_first"
    ],
    "sort_order": 7
  },
  {
    "id": "vm_rank_eurotrip",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Eurotrip Sem Sair do Sofá",
    "description": "Assistir filmes de países europeus (inclui coproduções).",
    "icon": "🚂",
    "target_type": "continent_movie_count",
    "target_value": 60,
    "target_metadata": {
      "continent": "Europa"
    },
    "ranks": [
      {
        "id": "vm_rank_eurotrip__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Eurotrip Sem Sair do Sofá • Rank Bronze",
        "description": "Assistir filmes de países europeus (inclui coproduções). (Rank Bronze: meta 5).",
        "legacy_id": "vm_eurotrip_100"
      },
      {
        "id": "vm_rank_eurotrip__silver",
        "tier": "silver",
        "target_value": 15,
        "title": "Eurotrip Sem Sair do Sofá • Rank Prata",
        "description": "Assistir filmes de países europeus (inclui coproduções). (Rank Prata: meta 15)."
      },
      {
        "id": "vm_rank_eurotrip__epic",
        "tier": "epic",
        "target_value": 30,
        "title": "Eurotrip Sem Sair do Sofá • Rank Épico",
        "description": "Assistir filmes de países europeus (inclui coproduções). (Rank Épico: meta 30)."
      },
      {
        "id": "vm_rank_eurotrip__gold",
        "tier": "gold",
        "target_value": 45,
        "title": "Eurotrip Sem Sair do Sofá • Rank Ouro",
        "description": "Assistir filmes de países europeus (inclui coproduções). (Rank Ouro: meta 45)."
      },
      {
        "id": "vm_rank_eurotrip__mythic",
        "tier": "mythic",
        "target_value": 60,
        "title": "Eurotrip Sem Sair do Sofá • Rank Mítico",
        "description": "Assistir filmes de países europeus (inclui coproduções). (Rank Mítico: meta 60)."
      }
    ],
    "legacy_ids": [
      "vm_eurotrip_100"
    ],
    "sort_order": 8
  },
  {
    "id": "vm_rank_japao_sem_animes",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Cadê os Animes?! (O Outro Lado do Japão)",
    "description": "Filmes do Japão sem tags Baseado em Anime/Jogo e sem gêneros Terror/Animação (inclui coproduções).",
    "icon": "🗾",
    "target_type": "multi_ritual_rule",
    "target_value": 10,
    "target_metadata": {
      "ruleKey": "japao_sem_animes_games_terror_5"
    },
    "ranks": [
      {
        "id": "vm_rank_japao_sem_animes__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Cadê os Animes?! (O Outro Lado do Japão) • Rank Bronze",
        "description": "Filmes do Japão sem tags Baseado em Anime/Jogo e sem gêneros Terror/Animação (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "multi_vm_dna_ac_japao_sem_animes_5"
      },
      {
        "id": "vm_rank_japao_sem_animes__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Cadê os Animes?! (O Outro Lado do Japão) • Rank Prata",
        "description": "Filmes do Japão sem tags Baseado em Anime/Jogo e sem gêneros Terror/Animação (inclui coproduções). (Rank Prata: meta 3)."
      },
      {
        "id": "vm_rank_japao_sem_animes__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Cadê os Animes?! (O Outro Lado do Japão) • Rank Épico",
        "description": "Filmes do Japão sem tags Baseado em Anime/Jogo e sem gêneros Terror/Animação (inclui coproduções). (Rank Épico: meta 5)."
      },
      {
        "id": "vm_rank_japao_sem_animes__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Cadê os Animes?! (O Outro Lado do Japão) • Rank Ouro",
        "description": "Filmes do Japão sem tags Baseado em Anime/Jogo e sem gêneros Terror/Animação (inclui coproduções). (Rank Ouro: meta 8)."
      },
      {
        "id": "vm_rank_japao_sem_animes__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Cadê os Animes?! (O Outro Lado do Japão) • Rank Mítico",
        "description": "Filmes do Japão sem tags Baseado em Anime/Jogo e sem gêneros Terror/Animação (inclui coproduções). (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "multi_vm_dna_ac_japao_sem_animes_5"
    ],
    "sort_order": 9
  },
  {
    "id": "vm_rank_em_familia_estrangeiro",
    "kind": "rank",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Melhor que Duolingo (Legenda Coletiva)",
    "description": "Filmes com a tag Em Família produzidos fora do Brasil e dos EUA (inclui coproduções).",
    "icon": "🗣️",
    "target_type": "tag_non_br_us_count",
    "target_value": 10,
    "target_metadata": {
      "tag": "Em Família"
    },
    "ranks": [
      {
        "id": "vm_rank_em_familia_estrangeiro__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Melhor que Duolingo (Legenda Coletiva) • Rank Bronze",
        "description": "Filmes com a tag Em Família produzidos fora do Brasil e dos EUA (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "tc_em_familia_estrangeiro_5"
      },
      {
        "id": "vm_rank_em_familia_estrangeiro__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Melhor que Duolingo (Legenda Coletiva) • Rank Prata",
        "description": "Filmes com a tag Em Família produzidos fora do Brasil e dos EUA (inclui coproduções). (Rank Prata: meta 3)."
      },
      {
        "id": "vm_rank_em_familia_estrangeiro__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Melhor que Duolingo (Legenda Coletiva) • Rank Épico",
        "description": "Filmes com a tag Em Família produzidos fora do Brasil e dos EUA (inclui coproduções). (Rank Épico: meta 5)."
      },
      {
        "id": "vm_rank_em_familia_estrangeiro__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Melhor que Duolingo (Legenda Coletiva) • Rank Ouro",
        "description": "Filmes com a tag Em Família produzidos fora do Brasil e dos EUA (inclui coproduções). (Rank Ouro: meta 8)."
      },
      {
        "id": "vm_rank_em_familia_estrangeiro__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Melhor que Duolingo (Legenda Coletiva) • Rank Mítico",
        "description": "Filmes com a tag Em Família produzidos fora do Brasil e dos EUA (inclui coproduções). (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "tc_em_familia_estrangeiro_5"
    ],
    "sort_order": 10
  },
  {
    "id": "vm_historical_relics_extinct",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "gold",
    "title": "Atlas Fantasma: Nações Que Não Existem Mais!",
    "description": "Conquistar no mapa (país de origem único) pelo menos 4 das 7 nações históricas extintas: União Soviética, Alemanha Ocidental, Alemanha Oriental, Iugoslávia, Checoslováquia, Sérvia e Montenegro ou Antilhas Holandesas.",
    "icon": "⏳",
    "target_type": "historical_territories_list",
    "target_value": 4,
    "target_metadata": {
      "territoryCodes": [
        "hist_su",
        "hist_de_w",
        "hist_dd",
        "hist_yu",
        "hist_cs",
        "hist_scg",
        "hist_an"
      ],
      "minCount": 4
    },
    "legacy_ids": [
      "vm_historical_relics_extinct"
    ],
    "sort_order": 11
  },
  {
    "id": "vm_allies_vs_axis",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Aliados vs. Eixo: O Tabuleiro da Segunda Guerra",
    "description": "Conquistar no Desafio dos 195 / Relíquias (país de origem único) os blocos históricos: EUA, Reino Unido, França e União Soviética (ou Rússia) vs. Alemanha (ou Ocidental/Oriental), Itália e Japão (7 frentes).",
    "icon": "⚔️",
    "target_type": "allies_vs_axis_checklist",
    "target_value": 7,
    "target_metadata": {
      "slots": [
        {
          "id": "us",
          "name": "Aliados: Estados Unidos",
          "flag": "us",
          "codes": [
            "us"
          ]
        },
        {
          "id": "gb",
          "name": "Aliados: Reino Unido",
          "flag": "gb",
          "codes": [
            "gb"
          ]
        },
        {
          "id": "fr",
          "name": "Aliados: França",
          "flag": "fr",
          "codes": [
            "fr"
          ]
        },
        {
          "id": "su_ru",
          "name": "Aliados: União Soviética ou Rússia",
          "flag": "ru",
          "codes": [
            "hist_su",
            "ru"
          ]
        },
        {
          "id": "de",
          "name": "Eixo: Alemanha (ou Ocidental/Oriental)",
          "flag": "de",
          "codes": [
            "de",
            "hist_de_w",
            "hist_dd"
          ]
        },
        {
          "id": "it",
          "name": "Eixo: Itália",
          "flag": "it",
          "codes": [
            "it"
          ]
        },
        {
          "id": "jp",
          "name": "Eixo: Japão",
          "flag": "jp",
          "codes": [
            "jp"
          ]
        }
      ]
    },
    "legacy_ids": [
      "vm_allies_vs_axis"
    ],
    "sort_order": 12
  },
  {
    "id": "vm_mx_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "É o Filme do Pelé?",
    "description": "Conquistar 1 filme do México (1 filme) (inclui coproduções).",
    "icon": "🌮",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "mx",
      "countryName": "México"
    },
    "legacy_ids": [
      "vm_mx_first"
    ],
    "sort_order": 13
  },
  {
    "id": "vm_nl_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Errou!",
    "description": "Conquistar 1 filme dos Países Baixos / Holanda (1 filme) (inclui coproduções).",
    "icon": "🌷",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "nl",
      "countryName": "Países Baixos"
    },
    "legacy_ids": [
      "vm_nl_first"
    ],
    "sort_order": 14
  },
  {
    "id": "vm_mc_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Não Era Só Corrida?",
    "description": "Conquistar 1 filme de Mônaco (1 filme) (inclui coproduções).",
    "icon": "🏎️",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "mc",
      "countryName": "Mônaco"
    },
    "legacy_ids": [
      "vm_mc_first"
    ],
    "sort_order": 15
  },
  {
    "id": "vm_qa_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Não Podiam Construir um País Melhor?",
    "description": "Conquistar 1 filme do Catar (1 filme) (inclui coproduções).",
    "icon": "🏙️",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "qa",
      "countryName": "Catar"
    },
    "legacy_ids": [
      "vm_qa_first"
    ],
    "sort_order": 16
  },
  {
    "id": "vm_cv_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Vozinha Feliz!",
    "description": "Conquistar 1 filme de Cabo Verde (1 filme) (inclui coproduções).",
    "icon": "🏝️",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "cv",
      "countryName": "Cabo Verde"
    },
    "legacy_ids": [
      "vm_cv_first"
    ],
    "sort_order": 17
  },
  {
    "id": "vm_diff_td_ro",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes I",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Chade e Romênia (2 países).",
    "icon": "🇷🇴",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "td",
        "ro"
      ]
    },
    "legacy_ids": [
      "vm_diff_td_ro"
    ],
    "sort_order": 18
  },
  {
    "id": "vm_diff_id_mc",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes II",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Indonésia e Mônaco (2 países).",
    "icon": "🇮🇩",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "id",
        "mc"
      ]
    },
    "legacy_ids": [
      "vm_diff_id_mc"
    ],
    "sort_order": 19
  },
  {
    "id": "vm_diff_ie_ci",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes III",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Irlanda e Costa do Marfim (2 países).",
    "icon": "🇨🇮",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "ie",
        "ci"
      ]
    },
    "legacy_ids": [
      "vm_diff_ie_ci"
    ],
    "sort_order": 20
  },
  {
    "id": "vm_diff_ml_gn",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Iguais, Mas Diferentes IV",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Mali e Guiné (2 países).",
    "icon": "🇲🇱",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "ml",
        "gn"
      ]
    },
    "legacy_ids": [
      "vm_diff_ml_gn"
    ],
    "sort_order": 21
  },
  {
    "id": "vm_triple_border",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Tríplice Fronteira",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Brasil, Argentina e Paraguai (3 países).",
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
    "legacy_ids": [
      "vm_triple_border"
    ],
    "sort_order": 22
  },
  {
    "id": "vm_pt_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Devolve Nosso Ouro!",
    "description": "Conquistar 1 filme de Portugal (1 filme) (inclui coproduções).",
    "icon": "🇵🇹",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "pt",
      "countryName": "Portugal"
    },
    "legacy_ids": [
      "vm_pt_first"
    ],
    "sort_order": 23
  },
  {
    "id": "vm_in_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Dança, Música e 3 Horas de Filme!",
    "description": "Conquistar 1 filme da Índia (1 filme) (inclui coproduções).",
    "icon": "👳",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "in",
      "countryName": "Índia"
    },
    "legacy_ids": [
      "vm_in_first"
    ],
    "sort_order": 24
  },
  {
    "id": "vm_au_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Aqui Tem Mais Canguru que Gente!",
    "description": "Conquistar 1 filme da Austrália (1 filme) (inclui coproduções).",
    "icon": "🦘",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "au",
      "countryName": "Austrália"
    },
    "legacy_ids": [
      "vm_au_first"
    ],
    "sort_order": 25
  },
  {
    "id": "vm_ro_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "bronze",
    "title": "Cuidado com o Drácula!",
    "description": "Conquistar 1 filme da Romênia (1 filme) (inclui coproduções).",
    "icon": "🧛",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "ro",
      "countryName": "Romênia"
    },
    "legacy_ids": [
      "vm_ro_first"
    ],
    "sort_order": 26
  },
  {
    "id": "vm_de_7",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Terror do Brasil",
    "description": "Conquistar 7 filmes da Alemanha (7 filmes) (inclui coproduções).",
    "icon": "⚽",
    "target_type": "country_movie_count",
    "target_value": 7,
    "target_metadata": {
      "countryCode": "de",
      "countryName": "Alemanha"
    },
    "legacy_ids": [
      "vm_de_7"
    ],
    "sort_order": 27
  },
  {
    "id": "vm_ancient_wonders",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Será Que Foram Criadas por Aliens?",
    "description": "Conquistar 7 filmes dos países das 7 Maravilhas do Mundo Antigo: 2 filmes do Egito, 1 filme do Iraque, 2 filmes da Grécia e 2 filmes da Turquia (7 filmes) (inclui coproduções).",
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
    "legacy_ids": [
      "vm_ancient_wonders"
    ],
    "sort_order": 28
  },
  {
    "id": "vm_modern_wonders",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Agora Todo Mundo Tem Maravilhas?",
    "description": "Conquistar no Desafio dos 195 (país de origem único) os 7 países das Maravilhas do Mundo Moderno: Brasil, China, Peru, Jordânia, Itália, Índia e México (7 países).",
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
    "legacy_ids": [
      "vm_modern_wonders"
    ],
    "sort_order": 29
  },
  {
    "id": "vm_world_cup_champs",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "No Futebol Eles São Bons, e no Cinema?",
    "description": "Conquistar no Desafio dos 195 (país de origem único) os campeões mundiais: Alemanha, Argentina, Brasil, Espanha, França, Inglaterra (ou Reino Unido), Itália e Uruguai (8 países).",
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
    "legacy_ids": [
      "vm_world_cup_champs"
    ],
    "sort_order": 30
  },
  {
    "id": "vm_freezing_cold",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Frio, Muito Frio!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Rússia, Canadá, Mongólia, Noruega, Islândia e Finlândia (6 países).",
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
    "legacy_ids": [
      "vm_freezing_cold"
    ],
    "sort_order": 31
  },
  {
    "id": "vm_exotic_flags",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Minha Bandeira É Exótica!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Nepal, Suíça, Quirguistão e Paraguai (4 países).",
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
    "legacy_ids": [
      "vm_exotic_flags"
    ],
    "sort_order": 32
  },
  {
    "id": "vm_top_gdp",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Rico, Mais Que Você!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): EUA, China, Alemanha, Japão e Índia (5 países).",
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
    "legacy_ids": [
      "vm_top_gdp"
    ],
    "sort_order": 33
  },
  {
    "id": "vm_vikings",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Vikings na Tela",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Dinamarca, Noruega, Suécia, Finlândia e Islândia (5 países).",
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
    "legacy_ids": [
      "vm_vikings"
    ],
    "sort_order": 34
  },
  {
    "id": "vm_parallel_38",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Tensão no Paralelo 38",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Coreia do Sul e Coreia do Norte (2 países).",
    "icon": "🎖️",
    "target_type": "country_list",
    "target_value": 2,
    "target_metadata": {
      "countryCodes": [
        "kr",
        "kp"
      ]
    },
    "legacy_ids": [
      "vm_parallel_38"
    ],
    "sort_order": 35
  },
  {
    "id": "vm_andes",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Cordilheira dos Andes",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Chile, Argentina, Bolívia, Peru, Equador, Colômbia e Venezuela (7 países).",
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
    "legacy_ids": [
      "vm_andes"
    ],
    "sort_order": 36
  },
  {
    "id": "vm_cradle_civilization",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Berço da Civilização",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Grécia, Itália, Egito, Irã, Iraque e China (6 países).",
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
    "legacy_ids": [
      "vm_cradle_civilization"
    ],
    "sort_order": 37
  },
  {
    "id": "vm_chocolate_neutral",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Neutros, Ricos e Cheios de Chocolate",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Suíça, Áustria, Bélgica e Liechtenstein (4 países).",
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
    "legacy_ids": [
      "vm_chocolate_neutral"
    ],
    "sort_order": 38
  },
  {
    "id": "vm_asian_tigers",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Tigres Asiáticos",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Coreia do Sul, Cingapura, Malásia, Tailândia e Indonésia (5 países).",
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
    "legacy_ids": [
      "vm_asian_tigers"
    ],
    "sort_order": 39
  },
  {
    "id": "vm_commonwealth",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "O Sol Nunca se Põe na Commonwealth",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Reino Unido, Canadá, Austrália, Nova Zelândia, Índia e África do Sul (6 países).",
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
    "legacy_ids": [
      "vm_commonwealth"
    ],
    "sort_order": 40
  },
  {
    "id": "vm_kp_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Não Era Proibido?",
    "description": "Conquistar 1 filme da Coreia do Norte (1 filme) (inclui coproduções).",
    "icon": "🚨",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "kp",
      "countryName": "Coreia do Norte"
    },
    "legacy_ids": [
      "vm_kp_first"
    ],
    "sort_order": 41
  },
  {
    "id": "vm_hot_desert",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Quente, Muito Quente!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Burkina Faso, Mali, Senegal, Mauritânia e Tuvalu (5 países).",
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
    "legacy_ids": [
      "vm_hot_desert"
    ],
    "sort_order": 42
  },
  {
    "id": "vm_high_income",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "As Pessoas Têm Dinheiro Aqui, Bom pra Viver! (Ou Não)",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Luxemburgo, Irlanda, Suíça, Catar e Cingapura (5 países).",
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
    "legacy_ids": [
      "vm_high_income"
    ],
    "sort_order": 43
  },
  {
    "id": "vm_theocratic",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Teocráticos! Deus Acima de Todos (Ou Quase)",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Afeganistão, Arábia Saudita, Cidade do Vaticano, Irã, Mauritânia e Iêmen (6 países).",
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
    "legacy_ids": [
      "vm_theocratic"
    ],
    "sort_order": 44
  },
  {
    "id": "vm_communist",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Você É um Comunista Safado?!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Cuba, China, Vietnã, Laos e Coreia do Norte (5 países).",
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
    "legacy_ids": [
      "vm_communist"
    ],
    "sort_order": 45
  },
  {
    "id": "vm_microstates",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Menores que o Bairro da Minha Vó!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Cidade do Vaticano, Mônaco, San Marino, Liechtenstein, Andorra e Malta (6 países).",
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
    "legacy_ids": [
      "vm_microstates"
    ],
    "sort_order": 46
  },
  {
    "id": "vm_balkans_powder_keg",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Barril de Pólvora (Bálcãs)",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Sérvia, Croácia, Bósnia e Herzegovina, Eslovênia, Montenegro, Macedônia do Norte, Albânia, Bulgária, Romênia e Grécia (10 países).",
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
    "legacy_ids": [
      "vm_balkans_powder_keg"
    ],
    "sort_order": 47
  },
  {
    "id": "vm_iron_curtain",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Cortina de Ferro (Ex-URSS)",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Rússia, Ucrânia, Belarus, Estônia, Letônia, Lituânia, Geórgia, Armênia e Azerbaijão (9 países).",
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
    "legacy_ids": [
      "vm_iron_curtain"
    ],
    "sort_order": 48
  },
  {
    "id": "vm_brics_plus",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "BRICS+ no Cinema",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Brasil, Rússia, Índia, China, África do Sul, Egito, Etiópia, Irã e Emirados Árabes Unidos (9 países).",
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
    "legacy_ids": [
      "vm_brics_plus"
    ],
    "sort_order": 49
  },
  {
    "id": "vm_far_away",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "epic",
    "title": "Onde Judas Perdeu as Botas!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Madagascar, Islândia, Nova Zelândia, Sri Lanka, Filipinas, Fiji e Papua-Nova Guiné (7 países).",
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
    "legacy_ids": [
      "vm_far_away"
    ],
    "sort_order": 50
  },
  {
    "id": "vm_va_first",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "gold",
    "title": "Eles Fazem Filmes?",
    "description": "Conquistar 1 filme da Cidade do Vaticano (1 filme) (inclui coproduções).",
    "icon": "🇻🇦",
    "target_type": "country_movie_count",
    "target_value": 1,
    "target_metadata": {
      "countryCode": "va",
      "countryName": "Cidade do Vaticano"
    },
    "legacy_ids": [
      "vm_va_first"
    ],
    "sort_order": 51
  },
  {
    "id": "vm_cplp_portuguese",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "gold",
    "title": "Eles Falam Português (Ou Quase)",
    "description": "Conquistar no Desafio dos 195 (país de origem único) os 9 países da CPLP: Portugal, Brasil, Angola, Moçambique, Cabo Verde, Guiné-Bissau, São Tomé e Príncipe, Guiné Equatorial e Timor-Leste (9 países).",
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
    "legacy_ids": [
      "vm_cplp_portuguese"
    ],
    "sort_order": 52
  },
  {
    "id": "vm_most_populous",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "gold",
    "title": "Muita Gente Mora Aqui!",
    "description": "Conquistar no Desafio dos 195 (país de origem único) os 15 países mais populosos: Índia, China, EUA, Indonésia, Paquistão, Nigéria, Brasil, Bangladesh, Rússia, Etiópia, México, Japão, Egito, Filipinas e República Democrática do Congo (15 países).",
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
    "legacy_ids": [
      "vm_most_populous"
    ],
    "sort_order": 53
  },
  {
    "id": "vm_patria_grande",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "gold",
    "title": "Pátria Grande (América Latina Unida)",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Brasil, Argentina, Uruguai, Paraguai, Chile, Bolívia, Peru, Equador, Colômbia, Venezuela, México, Cuba, República Dominicana, Haiti, Guatemala, Honduras, El Salvador, Nicarágua, Costa Rica e Panamá (20 países).",
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
    "legacy_ids": [
      "vm_patria_grande"
    ],
    "sort_order": 54
  },
  {
    "id": "vm_european_union",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "gold",
    "title": "Passaporte Europeu (União Europeia)",
    "description": "Conquistar no Desafio dos 195 (país de origem único) os 27 países da União Europeia: Alemanha, Áustria, Bélgica, Bulgária, Chipre, Croácia, Dinamarca, Eslováquia, Eslovênia, Espanha, Estônia, Finlândia, França, Grécia, Hungria, Irlanda, Itália, Letônia, Lituânia, Luxemburgo, Malta, Países Baixos, Polônia, Portugal, República Tcheca, Romênia e Suécia (27 países).",
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
    "legacy_ids": [
      "vm_european_union"
    ],
    "sort_order": 55
  },
  {
    "id": "vm_arab_world",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "gold",
    "title": "As Mil e Uma Noites (Mundo Árabe)",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Egito, Argélia, Sudão, Iraque, Marrocos, Arábia Saudita, Iêmen, Síria, Tunísia, Jordânia, Emirados Árabes Unidos, Líbano, Líbia, Omã e Catar (15 países).",
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
    "legacy_ids": [
      "vm_arab_world"
    ],
    "sort_order": 56
  },
  {
    "id": "vm_monarchies",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Ainda Existe Monarquia?",
    "description": "Conquistar no Desafio dos 195 (país de origem único) as 43 monarquias oficiais: Andorra, Antígua e Barbuda, Arábia Saudita, Austrália, Bahamas, Bahrein, Bélgica, Belize, Brunei, Butão, Camboja, Canadá, Catar, Cidade do Vaticano, Dinamarca, Emirados Árabes Unidos, Espanha, Essuatíni, Granada, Ilhas Salomão, Jamaica, Japão, Jordânia, Kuwait, Lesoto, Liechtenstein, Luxemburgo, Malásia, Marrocos, Mônaco, Noruega, Nova Zelândia, Omã, Países Baixos, Papua-Nova Guiné, Reino Unido, Santa Lúcia, São Cristóvão e Névis, São Vicente e Granadinas, Suécia, Tailândia, Tonga e Tuvalu (43 países).",
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
    "legacy_ids": [
      "vm_monarchies"
    ],
    "sort_order": 57
  },
  {
    "id": "vm_conqueror_south_america",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
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
    "legacy_ids": [
      "vm_conqueror_south_america"
    ],
    "sort_order": 58
  },
  {
    "id": "vm_conqueror_north_america",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
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
    "legacy_ids": [
      "vm_conqueror_north_america"
    ],
    "sort_order": 59
  },
  {
    "id": "vm_conqueror_europe",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
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
    "legacy_ids": [
      "vm_conqueror_europe"
    ],
    "sort_order": 60
  },
  {
    "id": "vm_conqueror_asia",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
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
    "legacy_ids": [
      "vm_conqueror_asia"
    ],
    "sort_order": 61
  },
  {
    "id": "vm_conqueror_africa",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
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
    "legacy_ids": [
      "vm_conqueror_africa"
    ],
    "sort_order": 62
  },
  {
    "id": "vm_conqueror_oceania",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
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
    "legacy_ids": [
      "vm_conqueror_oceania"
    ],
    "sort_order": 63
  },
  {
    "id": "vm_hardest_camera",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Onde Acharam Uma Câmera Aqui?!",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Tuvalu, Nauru, Palau, Ilhas Marshall, Micronésia, São Cristóvão e Névis, Dominica, Kiribati, Tonga e São Tomé e Príncipe (10 países).",
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
    "legacy_ids": [
      "vm_hardest_camera"
    ],
    "sort_order": 64
  },
  {
    "id": "vm_petroleum_countries_4",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "silver",
    "title": "Aqui Não Tem Petróleo!! (Só Democracia Forçada)",
    "description": "Conquistar no Desafio dos 195 (país de origem único): Iraque, Irã, Venezuela e Síria (4 países).",
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
    "legacy_ids": [
      "vm_petroleum_countries_4"
    ],
    "sort_order": 65
  },
  {
    "id": "multi_vm_rc_senna_1994",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_vm_rc_senna_1994"
    ],
    "sort_order": 66
  },
  {
    "id": "multi_vm_rc_copa_brasil_1950_2014",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_vm_rc_copa_brasil_1950_2014"
    ],
    "sort_order": 67
  },
  {
    "id": "multi_vm_rc_brasil_cinema_5",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_vm_rc_brasil_cinema_5"
    ],
    "sort_order": 68
  },
  {
    "id": "multi_vm_ac_biografia_fora_eua_br_5",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_vm_ac_biografia_fora_eua_br_5"
    ],
    "sort_order": 69
  },
  {
    "id": "multi_viajante_imortal_9_decadas_18",
    "kind": "unique",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo",
      "ritual_cinefilo",
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Viajante Imortal das Décadas (90 Anos de Cinema Aclamado)",
    "description": "Conquistar pelo menos 2 filmes com Minha Nota >= 8.000 em cada uma das 9 décadas entre 1940s e 2020s, somando pelo menos 10 países diferentes no Desafio dos 195 (país de origem único) (18 filmes no checklist).",
    "icon": "🧭",
    "target_type": "multi_ritual_rule",
    "target_value": 18,
    "target_metadata": {
      "ruleKey": "viajante_9_decadas_18"
    },
    "legacy_ids": [
      "multi_viajante_imortal_9_decadas_18"
    ],
    "sort_order": 70
  },
  {
    "id": "vm_platinum_legend",
    "kind": "platinum",
    "category": "volta_ao_mundo",
    "categories": [
      "volta_ao_mundo"
    ],
    "tier": "platinum",
    "title": "A Lenda Definitiva do Cinema",
    "description": "Conquistar 100% dos troféus e ranks da categoria Volta ao Mundo (incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 122,
    "target_metadata": {
      "category": "volta_ao_mundo",
      "categoryScope": "volta_ao_mundo"
    },
    "legacy_ids": [
      "vm_platinum_legend"
    ],
    "sort_order": 71
  },
  {
    "id": "dna_rank_sk",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Biógrafo Oficial do Stephen King",
    "description": "Assistir filmes com a tag SK (Stephen King).",
    "icon": "🎈",
    "target_type": "tag_movie_count",
    "target_value": 25,
    "target_metadata": {
      "tags": [
        "SK"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_sk__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Bem-vindo ao Maine!",
        "description": "Assistir filmes com a tag SK (Stephen King). (Rank Bronze: meta 1).",
        "legacy_id": "dna_sk_1"
      },
      {
        "id": "dna_rank_sk__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Turista de Derry e Castle Rock",
        "description": "Assistir filmes com a tag SK (Stephen King). (Rank Prata: meta 5).",
        "legacy_id": "dna_sk_5"
      },
      {
        "id": "dna_rank_sk__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "O Iluminado do Stephen King",
        "description": "Assistir filmes com a tag SK (Stephen King). (Rank Épico: meta 10).",
        "legacy_id": "dna_sk_10"
      },
      {
        "id": "dna_rank_sk__gold",
        "tier": "gold",
        "target_value": 18,
        "title": "A Torre Negra de Stephen King",
        "description": "Assistir filmes com a tag SK (Stephen King). (Rank Ouro: meta 18).",
        "legacy_id": "dna_sk_18"
      },
      {
        "id": "dna_rank_sk__mythic",
        "tier": "mythic",
        "target_value": 25,
        "title": "Biógrafo Oficial do Stephen King",
        "description": "Assistir filmes com a tag SK (Stephen King). (Rank Mítico: meta 25).",
        "legacy_id": "dna_sk_25"
      }
    ],
    "legacy_ids": [
      "dna_sk_1",
      "dna_sk_5",
      "dna_sk_10",
      "dna_sk_18",
      "dna_sk_25"
    ],
    "sort_order": 72
  },
  {
    "id": "dna_rank_top250",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Panteão do IMDb (Top 250)",
    "description": "Assistir filmes com a tag TOP250.",
    "icon": "⭐",
    "target_type": "tag_movie_count",
    "target_value": 50,
    "target_metadata": {
      "tags": [
        "TOP250"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_top250__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "O Início da Alta Cultura",
        "description": "Assistir filmes com a tag TOP250. (Rank Bronze: meta 1).",
        "legacy_id": "dna_top250_1"
      },
      {
        "id": "dna_rank_top250__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "Fiscal Oficial de Nota do IMDb",
        "description": "Assistir filmes com a tag TOP250. (Rank Prata: meta 10).",
        "legacy_id": "dna_top250_10"
      },
      {
        "id": "dna_rank_top250__epic",
        "tier": "epic",
        "target_value": 20,
        "title": "Frequentador do Tapete Vermelho",
        "description": "Assistir filmes com a tag TOP250. (Rank Épico: meta 20).",
        "legacy_id": "dna_top250_20"
      },
      {
        "id": "dna_rank_top250__gold",
        "tier": "gold",
        "target_value": 35,
        "title": "Elite do IMDb",
        "description": "Assistir filmes com a tag TOP250. (Rank Ouro: meta 35).",
        "legacy_id": "dna_top250_35"
      },
      {
        "id": "dna_rank_top250__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Panteão do IMDb (Top 250)",
        "description": "Assistir filmes com a tag TOP250. (Rank Mítico: meta 50).",
        "legacy_id": "dna_top250_50"
      }
    ],
    "legacy_ids": [
      "dna_top250_1",
      "dna_top250_10",
      "dna_top250_20",
      "dna_top250_35",
      "dna_top250_50"
    ],
    "sort_order": 73
  },
  {
    "id": "dna_rank_vamp_kid",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Uma Epidemia de Mini Vampiros?",
    "description": "Assistir filmes com as tags Vampiro e Criança Malvada ao mesmo tempo.",
    "icon": "🧛",
    "target_type": "tag_double_and",
    "target_value": 15,
    "target_metadata": {
      "tags": [
        "Vampiro",
        "Criança Malvada"
      ],
      "tagMode": "double_and"
    },
    "ranks": [
      {
        "id": "dna_rank_vamp_kid__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "O Terror de Todo Pai?",
        "description": "Assistir filmes com as tags Vampiro e Criança Malvada ao mesmo tempo. (Rank Bronze: meta 1).",
        "legacy_id": "dna_vamp_kid_1"
      },
      {
        "id": "dna_rank_vamp_kid__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Presinhas no Recreio",
        "description": "Assistir filmes com as tags Vampiro e Criança Malvada ao mesmo tempo. (Rank Prata: meta 3).",
        "legacy_id": "dna_vamp_kid_5"
      },
      {
        "id": "dna_rank_vamp_kid__epic",
        "tier": "epic",
        "target_value": 6,
        "title": "Uma Epidemia de Mini Vampiros?",
        "description": "Assistir filmes com as tags Vampiro e Criança Malvada ao mesmo tempo. (Rank Épico: meta 6)."
      },
      {
        "id": "dna_rank_vamp_kid__gold",
        "tier": "gold",
        "target_value": 10,
        "title": "Orfanato da Transilvânia",
        "description": "Assistir filmes com as tags Vampiro e Criança Malvada ao mesmo tempo. (Rank Ouro: meta 10)."
      },
      {
        "id": "dna_rank_vamp_kid__mythic",
        "tier": "mythic",
        "target_value": 15,
        "title": "Creche dos Mortos-Vivos",
        "description": "Assistir filmes com as tags Vampiro e Criança Malvada ao mesmo tempo. (Rank Mítico: meta 15)."
      }
    ],
    "legacy_ids": [
      "dna_vamp_kid_1",
      "dna_vamp_kid_5"
    ],
    "sort_order": 74
  },
  {
    "id": "dna_rank_game",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Do Controle do PS5 Direto pra Pipoca",
    "description": "Assistir filmes com a tag Baseado em jogo.",
    "icon": "🎮",
    "target_type": "tag_movie_count",
    "target_value": 25,
    "target_metadata": {
      "tags": [
        "Baseado em jogo"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_game__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Finalmente Uma Adaptação Que Presta? (Ou Não)",
        "description": "Assistir filmes com a tag Baseado em jogo. (Rank Bronze: meta 1).",
        "legacy_id": "dna_game_1"
      },
      {
        "id": "dna_rank_game__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Player 2 Conectado",
        "description": "Assistir filmes com a tag Baseado em jogo. (Rank Prata: meta 5).",
        "legacy_id": "dna_game_10"
      },
      {
        "id": "dna_rank_game__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Do Controle do PS5 Direto pra Pipoca",
        "description": "Assistir filmes com a tag Baseado em jogo. (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_game__gold",
        "tier": "gold",
        "target_value": 18,
        "title": "Platina na Tela Grande",
        "description": "Assistir filmes com a tag Baseado em jogo. (Rank Ouro: meta 18)."
      },
      {
        "id": "dna_rank_game__mythic",
        "tier": "mythic",
        "target_value": 25,
        "title": "Fliperama Cinematográfico",
        "description": "Assistir filmes com a tag Baseado em jogo. (Rank Mítico: meta 25)."
      }
    ],
    "legacy_ids": [
      "dna_game_1",
      "dna_game_10"
    ],
    "sort_order": 75
  },
  {
    "id": "dna_rank_anthro",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Esse Bicho Tá Falando e Usando Roupa?!",
    "description": "Assistir filmes com a tag Animais antropomorficos.",
    "icon": "🦊",
    "target_type": "tag_movie_count",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Animais antropomorficos"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_anthro__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Esse Bicho Tá Falando e Usando Roupa?!",
        "description": "Assistir filmes com a tag Animais antropomorficos. (Rank Bronze: meta 1).",
        "legacy_id": "dna_anthro_1"
      },
      {
        "id": "dna_rank_anthro__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Reunião na Floresta Encantada",
        "description": "Assistir filmes com a tag Animais antropomorficos. (Rank Prata: meta 5).",
        "legacy_id": "dna_animais_antropo_10"
      },
      {
        "id": "dna_rank_anthro__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "É um Digimon ou Pokémon?",
        "description": "Assistir filmes com a tag Animais antropomorficos. (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_anthro__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Zoológico de Terno e Gravata",
        "description": "Assistir filmes com a tag Animais antropomorficos. (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_anthro__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Fábula Suprema dos Bichos",
        "description": "Assistir filmes com a tag Animais antropomorficos. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_anthro_1",
      "dna_animais_antropo_10"
    ],
    "sort_order": 76
  },
  {
    "id": "dna_rank_repeat",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Síndrome da Sessão da Tarde (Vale a Pena Ver de Novo!)",
    "description": "Assistir filmes com a tag Repetido.",
    "icon": "🔁",
    "target_type": "tag_movie_count",
    "target_value": 30,
    "target_metadata": {
      "tags": [
        "Repetido"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_repeat__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Vale a Pena Ver de Novo!",
        "description": "Assistir filmes com a tag Repetido. (Rank Bronze: meta 1).",
        "legacy_id": "dna_repeat_1"
      },
      {
        "id": "dna_rank_repeat__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Botão Replay Sem Freio",
        "description": "Assistir filmes com a tag Repetido. (Rank Prata: meta 5).",
        "legacy_id": "dna_repeat_15"
      },
      {
        "id": "dna_rank_repeat__epic",
        "tier": "epic",
        "target_value": 12,
        "title": "Já Sei as Falas de Cor",
        "description": "Assistir filmes com a tag Repetido. (Rank Épico: meta 12)."
      },
      {
        "id": "dna_rank_repeat__gold",
        "tier": "gold",
        "target_value": 20,
        "title": "Reprise Eterna do Sofá",
        "description": "Assistir filmes com a tag Repetido. (Rank Ouro: meta 20)."
      },
      {
        "id": "dna_rank_repeat__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Loop Infinito da Sessão da Tarde",
        "description": "Assistir filmes com a tag Repetido. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "dna_repeat_1",
      "dna_repeat_15"
    ],
    "sort_order": 77
  },
  {
    "id": "dna_rank_final_epico",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "De Pé no Sofá Aplaudindo os Créditos!",
    "description": "Assistir filmes com a tag Final Epico.",
    "icon": "🍿",
    "target_type": "tag_movie_count",
    "target_value": 100,
    "target_metadata": {
      "tags": [
        "Final Epico"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_final_epico__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Absolute Cinema!",
        "description": "Assistir filmes com a tag Final Epico. (Rank Bronze: meta 1).",
        "legacy_id": "dna_epic_final_1"
      },
      {
        "id": "dna_rank_final_epico__silver",
        "tier": "silver",
        "target_value": 15,
        "title": "Queixo Caído nos Créditos",
        "description": "Assistir filmes com a tag Final Epico. (Rank Prata: meta 15).",
        "legacy_id": "dna_epic_final_25"
      },
      {
        "id": "dna_rank_final_epico__epic",
        "tier": "epic",
        "target_value": 35,
        "title": "De Pé no Sofá Aplaudindo!",
        "description": "Assistir filmes com a tag Final Epico. (Rank Épico: meta 35).",
        "legacy_id": "dna_epic_final_25"
      },
      {
        "id": "dna_rank_final_epico__gold",
        "tier": "gold",
        "target_value": 65,
        "title": "Apoteose Cinematográfica",
        "description": "Assistir filmes com a tag Final Epico. (Rank Ouro: meta 65).",
        "legacy_id": "dna_epic_final_75"
      },
      {
        "id": "dna_rank_final_epico__mythic",
        "tier": "mythic",
        "target_value": 100,
        "title": "Só Assisto Obras-Primas! (100 Finais Épicos)",
        "description": "Assistir filmes com a tag Final Epico. (Rank Mítico: meta 100).",
        "legacy_id": "dna_epic_final_75"
      }
    ],
    "legacy_ids": [
      "dna_epic_final_1",
      "dna_epic_final_25",
      "dna_epic_final_25",
      "dna_epic_final_75",
      "dna_epic_final_75"
    ],
    "sort_order": 78
  },
  {
    "id": "dna_rank_gore",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Açougueiro de Hollywood (Haja Sangue Falso!)",
    "description": "Assistir filmes com a tag Gore.",
    "icon": "🩸",
    "target_type": "tag_movie_count",
    "target_value": 130,
    "target_metadata": {
      "tags": [
        "Gore"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_gore__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Proibido Assistir Almoçando!",
        "description": "Assistir filmes com a tag Gore. (Rank Bronze: meta 1).",
        "legacy_id": "dna_gore_1"
      },
      {
        "id": "dna_rank_gore__silver",
        "tier": "silver",
        "target_value": 15,
        "title": "Açougueiro de Hollywood",
        "description": "Assistir filmes com a tag Gore. (Rank Prata: meta 15).",
        "legacy_id": "dna_gore_10"
      },
      {
        "id": "dna_rank_gore__epic",
        "tier": "epic",
        "target_value": 45,
        "title": "Banho de Ketchup Industrial",
        "description": "Assistir filmes com a tag Gore. (Rank Épico: meta 45)."
      },
      {
        "id": "dna_rank_gore__gold",
        "tier": "gold",
        "target_value": 85,
        "title": "Mestre do Splatter",
        "description": "Assistir filmes com a tag Gore. (Rank Ouro: meta 85)."
      },
      {
        "id": "dna_rank_gore__mythic",
        "tier": "mythic",
        "target_value": 130,
        "title": "Carnificina Suprema (130 Gore)",
        "description": "Assistir filmes com a tag Gore. (Rank Mítico: meta 130)."
      }
    ],
    "legacy_ids": [
      "dna_gore_1",
      "dna_gore_10"
    ],
    "sort_order": 79
  },
  {
    "id": "dna_rank_lgbt",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Todas as Cores na Tela",
    "description": "Assistir filmes com a tag Personagem LGBT.",
    "icon": "🏳️‍🌈",
    "target_type": "tag_movie_count",
    "target_value": 100,
    "target_metadata": {
      "tags": [
        "Personagem LGBT"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_lgbt__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Todas as Cores na Tela",
        "description": "Assistir filmes com a tag Personagem LGBT. (Rank Bronze: meta 1).",
        "legacy_id": "dna_lgbt_1"
      },
      {
        "id": "dna_rank_lgbt__silver",
        "tier": "silver",
        "target_value": 15,
        "title": "Love is Love",
        "description": "Assistir filmes com a tag Personagem LGBT. (Rank Prata: meta 15).",
        "legacy_id": "dna_lgbt_15"
      },
      {
        "id": "dna_rank_lgbt__epic",
        "tier": "epic",
        "target_value": 40,
        "title": "O Mundo É Colorido",
        "description": "Assistir filmes com a tag Personagem LGBT. (Rank Épico: meta 40).",
        "legacy_id": "dna_lgbt_30"
      },
      {
        "id": "dna_rank_lgbt__gold",
        "tier": "gold",
        "target_value": 70,
        "title": "Você É Livre!",
        "description": "Assistir filmes com a tag Personagem LGBT. (Rank Ouro: meta 70).",
        "legacy_id": "dna_lgbt_50"
      },
      {
        "id": "dna_rank_lgbt__mythic",
        "tier": "mythic",
        "target_value": 100,
        "title": "Todas as Letras! (100 Filmes)",
        "description": "Assistir filmes com a tag Personagem LGBT. (Rank Mítico: meta 100).",
        "legacy_id": "dna_lgbt_75"
      }
    ],
    "legacy_ids": [
      "dna_lgbt_1",
      "dna_lgbt_15",
      "dna_lgbt_30",
      "dna_lgbt_50",
      "dna_lgbt_75"
    ],
    "sort_order": 80
  },
  {
    "id": "dna_rank_vamp_lgbt",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Não Existe Vampiro Hétero?",
    "description": "Assistir filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo.",
    "icon": "🦇",
    "target_type": "tag_double_and",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Vampiro",
        "Personagem LGBT"
      ],
      "tagMode": "double_and"
    },
    "ranks": [
      {
        "id": "dna_rank_vamp_lgbt__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Vampiros São Gays?",
        "description": "Assistir filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo. (Rank Bronze: meta 1).",
        "legacy_id": "dna_vamp_lgbt_1"
      },
      {
        "id": "dna_rank_vamp_lgbt__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Sim, os Vampiros Gays!",
        "description": "Assistir filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo. (Rank Prata: meta 5).",
        "legacy_id": "dna_vamp_lgbt_5"
      },
      {
        "id": "dna_rank_vamp_lgbt__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Não Existe Vampiro Hétero?",
        "description": "Assistir filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo. (Rank Épico: meta 10).",
        "legacy_id": "dna_vamp_lgbt_10"
      },
      {
        "id": "dna_rank_vamp_lgbt__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Baile Noturno Colorido",
        "description": "Assistir filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo. (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_vamp_lgbt__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Clã Arco-Íris da Transilvânia",
        "description": "Assistir filmes com as tags Vampiro e Personagem LGBT ao mesmo tempo. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_vamp_lgbt_1",
      "dna_vamp_lgbt_5",
      "dna_vamp_lgbt_10"
    ],
    "sort_order": 81
  },
  {
    "id": "dna_rank_em_familia",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Clã Reunido (Tudo É Melhor com Amigos e Família!)",
    "description": "Assistir filmes com a tag Em Família.",
    "icon": "👨‍👩‍👧‍👦",
    "target_type": "tag_movie_count",
    "target_value": 100,
    "target_metadata": {
      "tags": [
        "Em Família"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_em_familia__bronze",
        "tier": "bronze",
        "target_value": 10,
        "title": "O Clã Reunido na Frente da TV!",
        "description": "Assistir filmes com a tag Em Família. (Rank Bronze: meta 10).",
        "legacy_id": "tc_em_familia_10"
      },
      {
        "id": "dna_rank_em_familia__silver",
        "tier": "silver",
        "target_value": 25,
        "title": "Sala Lotada de Pipoca",
        "description": "Assistir filmes com a tag Em Família. (Rank Prata: meta 25).",
        "legacy_id": "tc_em_familia_10"
      },
      {
        "id": "dna_rank_em_familia__epic",
        "tier": "epic",
        "target_value": 45,
        "title": "Tudo É Bem Melhor com Amigos e Família!",
        "description": "Assistir filmes com a tag Em Família. (Rank Épico: meta 45).",
        "legacy_id": "tc_em_familia_45"
      },
      {
        "id": "dna_rank_em_familia__gold",
        "tier": "gold",
        "target_value": 75,
        "title": "Domingo Eterno com a Galera",
        "description": "Assistir filmes com a tag Em Família. (Rank Ouro: meta 75)."
      },
      {
        "id": "dna_rank_em_familia__mythic",
        "tier": "mythic",
        "target_value": 100,
        "title": "Matriz Familiar do Cinema (100 Filmes)",
        "description": "Assistir filmes com a tag Em Família. (Rank Mítico: meta 100)."
      }
    ],
    "legacy_ids": [
      "tc_em_familia_10",
      "tc_em_familia_10",
      "tc_em_familia_45"
    ],
    "sort_order": 82
  },
  {
    "id": "dna_rank_brasil_colorido",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Brasil Colorido",
    "description": "Assistir filmes do Brasil com a tag Personagem LGBT (inclui coproduções).",
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
    "ranks": [
      {
        "id": "dna_rank_brasil_colorido__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Brasil Colorido • Rank Bronze",
        "description": "Assistir filmes do Brasil com a tag Personagem LGBT (inclui coproduções). (Rank Bronze: meta 2).",
        "legacy_id": "dna_lgbt_br_20"
      },
      {
        "id": "dna_rank_brasil_colorido__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Brasil Colorido • Rank Prata",
        "description": "Assistir filmes do Brasil com a tag Personagem LGBT (inclui coproduções). (Rank Prata: meta 5)."
      },
      {
        "id": "dna_rank_brasil_colorido__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Brasil Colorido • Rank Épico",
        "description": "Assistir filmes do Brasil com a tag Personagem LGBT (inclui coproduções). (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_brasil_colorido__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Brasil Colorido • Rank Ouro",
        "description": "Assistir filmes do Brasil com a tag Personagem LGBT (inclui coproduções). (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_brasil_colorido__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Brasil Colorido • Rank Mítico",
        "description": "Assistir filmes do Brasil com a tag Personagem LGBT (inclui coproduções). (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_lgbt_br_20"
    ],
    "sort_order": 83
  },
  {
    "id": "dna_rank_anime_us",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Hollywood Estragou Meu Anime?!",
    "description": "Filmes dos EUA com a tag Baseado em Anime (inclui coproduções).",
    "icon": "🎬",
    "target_type": "tag_hybrid_country",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Baseado em Anime"
      ],
      "countryCode": "us",
      "countryName": "Estados Unidos",
      "countryFlag": "🇺🇸",
      "isHybrid": true
    },
    "ranks": [
      {
        "id": "dna_rank_anime_us__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Hollywood Estragou Meu Anime?! • Rank Bronze",
        "description": "Filmes dos EUA com a tag Baseado em Anime (inclui coproduções). (Rank Bronze: meta 1).",
        "legacy_id": "dna_anime_us_3"
      },
      {
        "id": "dna_rank_anime_us__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Hollywood Estragou Meu Anime?! • Rank Prata",
        "description": "Filmes dos EUA com a tag Baseado em Anime (inclui coproduções). (Rank Prata: meta 3)."
      },
      {
        "id": "dna_rank_anime_us__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Hollywood Estragou Meu Anime?! • Rank Épico",
        "description": "Filmes dos EUA com a tag Baseado em Anime (inclui coproduções). (Rank Épico: meta 5)."
      },
      {
        "id": "dna_rank_anime_us__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Hollywood Estragou Meu Anime?! • Rank Ouro",
        "description": "Filmes dos EUA com a tag Baseado em Anime (inclui coproduções). (Rank Ouro: meta 8)."
      },
      {
        "id": "dna_rank_anime_us__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Hollywood Estragou Meu Anime?! • Rank Mítico",
        "description": "Filmes dos EUA com a tag Baseado em Anime (inclui coproduções). (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "dna_anime_us_3"
    ],
    "sort_order": 84
  },
  {
    "id": "dna_rank_abuse_kid",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "A Culpa É dos Pais!",
    "description": "Filmes com as tags Abuso Familiar e Criança Malvada ao mesmo tempo.",
    "icon": "🏚️",
    "target_type": "tag_double_and",
    "target_value": 40,
    "target_metadata": {
      "tags": [
        "Abuso Familiar",
        "Criança Malvada"
      ],
      "tagMode": "double_and"
    },
    "ranks": [
      {
        "id": "dna_rank_abuse_kid__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "A Culpa É dos Pais! • Rank Bronze",
        "description": "Filmes com as tags Abuso Familiar e Criança Malvada ao mesmo tempo. (Rank Bronze: meta 5).",
        "legacy_id": "dna_abuse_kid_20"
      },
      {
        "id": "dna_rank_abuse_kid__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "A Culpa É dos Pais! • Rank Prata",
        "description": "Filmes com as tags Abuso Familiar e Criança Malvada ao mesmo tempo. (Rank Prata: meta 10)."
      },
      {
        "id": "dna_rank_abuse_kid__epic",
        "tier": "epic",
        "target_value": 20,
        "title": "A Culpa É dos Pais! • Rank Épico",
        "description": "Filmes com as tags Abuso Familiar e Criança Malvada ao mesmo tempo. (Rank Épico: meta 20)."
      },
      {
        "id": "dna_rank_abuse_kid__gold",
        "tier": "gold",
        "target_value": 30,
        "title": "A Culpa É dos Pais! • Rank Ouro",
        "description": "Filmes com as tags Abuso Familiar e Criança Malvada ao mesmo tempo. (Rank Ouro: meta 30)."
      },
      {
        "id": "dna_rank_abuse_kid__mythic",
        "tier": "mythic",
        "target_value": 40,
        "title": "A Culpa É dos Pais! • Rank Mítico",
        "description": "Filmes com as tags Abuso Familiar e Criança Malvada ao mesmo tempo. (Rank Mítico: meta 40)."
      }
    ],
    "legacy_ids": [
      "dna_abuse_kid_20"
    ],
    "sort_order": 85
  },
  {
    "id": "dna_rank_dystopia",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Será Que o Mundo Acaba Assim?",
    "description": "Filmes com a tag Dystopia.",
    "icon": "☣️",
    "target_type": "tag_movie_count",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Dystopia"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_dystopia__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Será Que o Mundo Acaba Assim? • Rank Bronze",
        "description": "Filmes com a tag Dystopia. (Rank Bronze: meta 2).",
        "legacy_id": "dna_dystopia_20"
      },
      {
        "id": "dna_rank_dystopia__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Será Que o Mundo Acaba Assim? • Rank Prata",
        "description": "Filmes com a tag Dystopia. (Rank Prata: meta 5)."
      },
      {
        "id": "dna_rank_dystopia__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Será Que o Mundo Acaba Assim? • Rank Épico",
        "description": "Filmes com a tag Dystopia. (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_dystopia__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Será Que o Mundo Acaba Assim? • Rank Ouro",
        "description": "Filmes com a tag Dystopia. (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_dystopia__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Será Que o Mundo Acaba Assim? • Rank Mítico",
        "description": "Filmes com a tag Dystopia. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_dystopia_20"
    ],
    "sort_order": 86
  },
  {
    "id": "dna_rank_viagem_tempo",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Vai e Volta",
    "description": "Filmes com a tag Viagem no Tempo.",
    "icon": "⏳",
    "target_type": "tag_movie_count",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Viagem no Tempo"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_viagem_tempo__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Vai e Volta • Rank Bronze",
        "description": "Filmes com a tag Viagem no Tempo. (Rank Bronze: meta 2).",
        "legacy_id": "dna_time_10"
      },
      {
        "id": "dna_rank_viagem_tempo__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Vai e Volta • Rank Prata",
        "description": "Filmes com a tag Viagem no Tempo. (Rank Prata: meta 5)."
      },
      {
        "id": "dna_rank_viagem_tempo__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Vai e Volta • Rank Épico",
        "description": "Filmes com a tag Viagem no Tempo. (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_viagem_tempo__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Vai e Volta • Rank Ouro",
        "description": "Filmes com a tag Viagem no Tempo. (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_viagem_tempo__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Vai e Volta • Rank Mítico",
        "description": "Filmes com a tag Viagem no Tempo. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_time_10"
    ],
    "sort_order": 87
  },
  {
    "id": "dna_rank_emotional_tragic",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Terapia Pra Quê se Eu Tenho Esse Catálogo?",
    "description": "Quotas iguais de filmes Emocionante e Trágico.",
    "icon": "😭",
    "target_type": "tag_checklist_quota",
    "target_value": 20,
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
    "ranks": [
      {
        "id": "dna_rank_emotional_tragic__bronze",
        "tier": "bronze",
        "target_value": 4,
        "title": "Terapia Pra Quê se Eu Tenho Esse Catálogo? • Rank Bronze",
        "description": "Quotas iguais de filmes Emocionante e Trágico. (Rank Bronze: meta 4).",
        "legacy_id": "dna_emotional_tragic_10"
      },
      {
        "id": "dna_rank_emotional_tragic__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Terapia Pra Quê se Eu Tenho Esse Catálogo? • Rank Prata",
        "description": "Quotas iguais de filmes Emocionante e Trágico. (Rank Prata: meta 8)."
      },
      {
        "id": "dna_rank_emotional_tragic__epic",
        "tier": "epic",
        "target_value": 12,
        "title": "Terapia Pra Quê se Eu Tenho Esse Catálogo? • Rank Épico",
        "description": "Quotas iguais de filmes Emocionante e Trágico. (Rank Épico: meta 12)."
      },
      {
        "id": "dna_rank_emotional_tragic__gold",
        "tier": "gold",
        "target_value": 16,
        "title": "Terapia Pra Quê se Eu Tenho Esse Catálogo? • Rank Ouro",
        "description": "Quotas iguais de filmes Emocionante e Trágico. (Rank Ouro: meta 16)."
      },
      {
        "id": "dna_rank_emotional_tragic__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Terapia Pra Quê se Eu Tenho Esse Catálogo? • Rank Mítico",
        "description": "Quotas iguais de filmes Emocionante e Trágico. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_emotional_tragic_10"
    ],
    "sort_order": 88
  },
  {
    "id": "dna_rank_abuse",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Jantar de Família Mais Tranquilo do Ano",
    "description": "Filmes com a tag Abuso Familiar.",
    "icon": "🍷",
    "target_type": "tag_movie_count",
    "target_value": 50,
    "target_metadata": {
      "tags": [
        "Abuso Familiar"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_abuse__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Jantar de Família Mais Tranquilo do Ano • Rank Bronze",
        "description": "Filmes com a tag Abuso Familiar. (Rank Bronze: meta 5).",
        "legacy_id": "dna_abuse_5"
      },
      {
        "id": "dna_rank_abuse__silver",
        "tier": "silver",
        "target_value": 12,
        "title": "Jantar de Família Mais Tranquilo do Ano • Rank Prata",
        "description": "Filmes com a tag Abuso Familiar. (Rank Prata: meta 12)."
      },
      {
        "id": "dna_rank_abuse__epic",
        "tier": "epic",
        "target_value": 25,
        "title": "Jantar de Família Mais Tranquilo do Ano • Rank Épico",
        "description": "Filmes com a tag Abuso Familiar. (Rank Épico: meta 25)."
      },
      {
        "id": "dna_rank_abuse__gold",
        "tier": "gold",
        "target_value": 38,
        "title": "Jantar de Família Mais Tranquilo do Ano • Rank Ouro",
        "description": "Filmes com a tag Abuso Familiar. (Rank Ouro: meta 38)."
      },
      {
        "id": "dna_rank_abuse__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Jantar de Família Mais Tranquilo do Ano • Rank Mítico",
        "description": "Filmes com a tag Abuso Familiar. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "dna_abuse_5"
    ],
    "sort_order": 89
  },
  {
    "id": "dna_rank_prejudice",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Feridas da Sociedade",
    "description": "Filmes com a tag Preconceito.",
    "icon": "💔",
    "target_type": "tag_movie_count",
    "target_value": 50,
    "target_metadata": {
      "tags": [
        "Preconceito"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_prejudice__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Feridas da Sociedade • Rank Bronze",
        "description": "Filmes com a tag Preconceito. (Rank Bronze: meta 5).",
        "legacy_id": "dna_prejudice_5"
      },
      {
        "id": "dna_rank_prejudice__silver",
        "tier": "silver",
        "target_value": 12,
        "title": "Feridas da Sociedade • Rank Prata",
        "description": "Filmes com a tag Preconceito. (Rank Prata: meta 12)."
      },
      {
        "id": "dna_rank_prejudice__epic",
        "tier": "epic",
        "target_value": 25,
        "title": "Feridas da Sociedade • Rank Épico",
        "description": "Filmes com a tag Preconceito. (Rank Épico: meta 25)."
      },
      {
        "id": "dna_rank_prejudice__gold",
        "tier": "gold",
        "target_value": 38,
        "title": "Feridas da Sociedade • Rank Ouro",
        "description": "Filmes com a tag Preconceito. (Rank Ouro: meta 38)."
      },
      {
        "id": "dna_rank_prejudice__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Feridas da Sociedade • Rank Mítico",
        "description": "Filmes com a tag Preconceito. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "dna_prejudice_5"
    ],
    "sort_order": 90
  },
  {
    "id": "dna_rank_demon_relig",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Chama o Padre Que o Bagulho Ficou Doido!",
    "description": "Filmes com as tags Demônio e Religião ao mesmo tempo.",
    "icon": "⛪",
    "target_type": "tag_double_and",
    "target_value": 30,
    "target_metadata": {
      "tags": [
        "Demônio",
        "Religião"
      ],
      "tagMode": "double_and"
    },
    "ranks": [
      {
        "id": "dna_rank_demon_relig__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Chama o Padre Que o Bagulho Ficou Doido! • Rank Bronze",
        "description": "Filmes com as tags Demônio e Religião ao mesmo tempo. (Rank Bronze: meta 3).",
        "legacy_id": "dna_demon_relig_5"
      },
      {
        "id": "dna_rank_demon_relig__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Chama o Padre Que o Bagulho Ficou Doido! • Rank Prata",
        "description": "Filmes com as tags Demônio e Religião ao mesmo tempo. (Rank Prata: meta 8)."
      },
      {
        "id": "dna_rank_demon_relig__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Chama o Padre Que o Bagulho Ficou Doido! • Rank Épico",
        "description": "Filmes com as tags Demônio e Religião ao mesmo tempo. (Rank Épico: meta 15)."
      },
      {
        "id": "dna_rank_demon_relig__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Chama o Padre Que o Bagulho Ficou Doido! • Rank Ouro",
        "description": "Filmes com as tags Demônio e Religião ao mesmo tempo. (Rank Ouro: meta 22)."
      },
      {
        "id": "dna_rank_demon_relig__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Chama o Padre Que o Bagulho Ficou Doido! • Rank Mítico",
        "description": "Filmes com as tags Demônio e Religião ao mesmo tempo. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "dna_demon_relig_5"
    ],
    "sort_order": 91
  },
  {
    "id": "dna_rank_xmen",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Matrícula Aprovada no Instituto Xavier",
    "description": "Filmes com a tag X-Men.",
    "icon": "🧬",
    "target_type": "tag_movie_count",
    "target_value": 15,
    "target_metadata": {
      "tags": [
        "X-Men"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_xmen__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Matrícula Aprovada no Instituto Xavier • Rank Bronze",
        "description": "Filmes com a tag X-Men. (Rank Bronze: meta 1).",
        "legacy_id": "dna_xmen_5"
      },
      {
        "id": "dna_rank_xmen__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Matrícula Aprovada no Instituto Xavier • Rank Prata",
        "description": "Filmes com a tag X-Men. (Rank Prata: meta 3)."
      },
      {
        "id": "dna_rank_xmen__epic",
        "tier": "epic",
        "target_value": 6,
        "title": "Matrícula Aprovada no Instituto Xavier • Rank Épico",
        "description": "Filmes com a tag X-Men. (Rank Épico: meta 6)."
      },
      {
        "id": "dna_rank_xmen__gold",
        "tier": "gold",
        "target_value": 10,
        "title": "Matrícula Aprovada no Instituto Xavier • Rank Ouro",
        "description": "Filmes com a tag X-Men. (Rank Ouro: meta 10)."
      },
      {
        "id": "dna_rank_xmen__mythic",
        "tier": "mythic",
        "target_value": 15,
        "title": "Matrícula Aprovada no Instituto Xavier • Rank Mítico",
        "description": "Filmes com a tag X-Men. (Rank Mítico: meta 15)."
      }
    ],
    "legacy_ids": [
      "dna_xmen_5"
    ],
    "sort_order": 92
  },
  {
    "id": "dna_rank_power_lgbt",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Mais Forte que um Gaydar!",
    "description": "Filmes com as tags Super Poder e Personagem LGBT ao mesmo tempo.",
    "icon": "⚡",
    "target_type": "tag_double_and",
    "target_value": 10,
    "target_metadata": {
      "tags": [
        "Super Poder",
        "Personagem LGBT"
      ],
      "tagMode": "double_and"
    },
    "ranks": [
      {
        "id": "dna_rank_power_lgbt__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Mais Forte que um Gaydar! • Rank Bronze",
        "description": "Filmes com as tags Super Poder e Personagem LGBT ao mesmo tempo. (Rank Bronze: meta 1).",
        "legacy_id": "dna_power_lgbt_5"
      },
      {
        "id": "dna_rank_power_lgbt__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Mais Forte que um Gaydar! • Rank Prata",
        "description": "Filmes com as tags Super Poder e Personagem LGBT ao mesmo tempo. (Rank Prata: meta 3)."
      },
      {
        "id": "dna_rank_power_lgbt__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Mais Forte que um Gaydar! • Rank Épico",
        "description": "Filmes com as tags Super Poder e Personagem LGBT ao mesmo tempo. (Rank Épico: meta 5)."
      },
      {
        "id": "dna_rank_power_lgbt__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Mais Forte que um Gaydar! • Rank Ouro",
        "description": "Filmes com as tags Super Poder e Personagem LGBT ao mesmo tempo. (Rank Ouro: meta 8)."
      },
      {
        "id": "dna_rank_power_lgbt__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Mais Forte que um Gaydar! • Rank Mítico",
        "description": "Filmes com as tags Super Poder e Personagem LGBT ao mesmo tempo. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "dna_power_lgbt_5"
    ],
    "sort_order": 93
  },
  {
    "id": "dna_rank_facts_br",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Fatos Brasileiros",
    "description": "Filmes do Brasil com a tag Fatos Reais (inclui coproduções).",
    "icon": "🇧🇷",
    "target_type": "tag_hybrid_country",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Fatos Reais"
      ],
      "countryCode": "br",
      "countryName": "Brasil",
      "countryFlag": "🇧🇷",
      "isHybrid": true
    },
    "ranks": [
      {
        "id": "dna_rank_facts_br__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Fatos Brasileiros • Rank Bronze",
        "description": "Filmes do Brasil com a tag Fatos Reais (inclui coproduções). (Rank Bronze: meta 2).",
        "legacy_id": "dna_facts_br_10"
      },
      {
        "id": "dna_rank_facts_br__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Fatos Brasileiros • Rank Prata",
        "description": "Filmes do Brasil com a tag Fatos Reais (inclui coproduções). (Rank Prata: meta 5)."
      },
      {
        "id": "dna_rank_facts_br__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Fatos Brasileiros • Rank Épico",
        "description": "Filmes do Brasil com a tag Fatos Reais (inclui coproduções). (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_facts_br__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Fatos Brasileiros • Rank Ouro",
        "description": "Filmes do Brasil com a tag Fatos Reais (inclui coproduções). (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_facts_br__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Fatos Brasileiros • Rank Mítico",
        "description": "Filmes do Brasil com a tag Fatos Reais (inclui coproduções). (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_facts_br_10"
    ],
    "sort_order": 94
  },
  {
    "id": "dna_rank_marvel_dc",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Guerra Civil dos Quadrinhos (Sem Clubismo!)",
    "description": "Quotas iguais de filmes Marvel e DC (até 10 de cada = 20).",
    "icon": "⚔️",
    "target_type": "tag_checklist_quota",
    "target_value": 20,
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
    "ranks": [
      {
        "id": "dna_rank_marvel_dc__bronze",
        "tier": "bronze",
        "target_value": 4,
        "title": "Guerra Civil dos Quadrinhos (Sem Clubismo!) • Rank Bronze",
        "description": "Quotas iguais de filmes Marvel e DC (até 10 de cada = 20). (Rank Bronze: meta 4).",
        "legacy_id": "dna_marvel_dc_30"
      },
      {
        "id": "dna_rank_marvel_dc__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Guerra Civil dos Quadrinhos (Sem Clubismo!) • Rank Prata",
        "description": "Quotas iguais de filmes Marvel e DC (até 10 de cada = 20). (Rank Prata: meta 8)."
      },
      {
        "id": "dna_rank_marvel_dc__epic",
        "tier": "epic",
        "target_value": 12,
        "title": "Guerra Civil dos Quadrinhos (Sem Clubismo!) • Rank Épico",
        "description": "Quotas iguais de filmes Marvel e DC (até 10 de cada = 20). (Rank Épico: meta 12)."
      },
      {
        "id": "dna_rank_marvel_dc__gold",
        "tier": "gold",
        "target_value": 16,
        "title": "Guerra Civil dos Quadrinhos (Sem Clubismo!) • Rank Ouro",
        "description": "Quotas iguais de filmes Marvel e DC (até 10 de cada = 20). (Rank Ouro: meta 16)."
      },
      {
        "id": "dna_rank_marvel_dc__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Guerra Civil dos Quadrinhos (Sem Clubismo!) • Rank Mítico",
        "description": "Quotas iguais de filmes Marvel e DC (até 10 de cada = 20). (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_marvel_dc_30"
    ],
    "sort_order": 95
  },
  {
    "id": "dna_rank_super_poder",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Todo Mundo Tem Poder?",
    "description": "Filmes com a tag Super Poder.",
    "icon": "💥",
    "target_type": "tag_movie_count",
    "target_value": 50,
    "target_metadata": {
      "tags": [
        "Super Poder"
      ]
    },
    "ranks": [
      {
        "id": "dna_rank_super_poder__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Todo Mundo Tem Poder? • Rank Bronze",
        "description": "Filmes com a tag Super Poder. (Rank Bronze: meta 5).",
        "legacy_id": "dna_power_100"
      },
      {
        "id": "dna_rank_super_poder__silver",
        "tier": "silver",
        "target_value": 12,
        "title": "Todo Mundo Tem Poder? • Rank Prata",
        "description": "Filmes com a tag Super Poder. (Rank Prata: meta 12)."
      },
      {
        "id": "dna_rank_super_poder__epic",
        "tier": "epic",
        "target_value": 25,
        "title": "Todo Mundo Tem Poder? • Rank Épico",
        "description": "Filmes com a tag Super Poder. (Rank Épico: meta 25)."
      },
      {
        "id": "dna_rank_super_poder__gold",
        "tier": "gold",
        "target_value": 38,
        "title": "Todo Mundo Tem Poder? • Rank Ouro",
        "description": "Filmes com a tag Super Poder. (Rank Ouro: meta 38)."
      },
      {
        "id": "dna_rank_super_poder__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Todo Mundo Tem Poder? • Rank Mítico",
        "description": "Filmes com a tag Super Poder. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "dna_power_100"
    ],
    "sort_order": 96
  },
  {
    "id": "dna_rank_kid_school",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Ainda Bem que Não Sou Professor Deles!",
    "description": "Filmes com as tags Criança Malvada e Colegio/Escola ao mesmo tempo.",
    "icon": "🎒",
    "target_type": "tag_double_and",
    "target_value": 20,
    "target_metadata": {
      "tags": [
        "Criança Malvada",
        "Colegio/Escola"
      ],
      "tagMode": "double_and"
    },
    "ranks": [
      {
        "id": "dna_rank_kid_school__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Ainda Bem que Não Sou Professor Deles! • Rank Bronze",
        "description": "Filmes com as tags Criança Malvada e Colegio/Escola ao mesmo tempo. (Rank Bronze: meta 2).",
        "legacy_id": "dna_kid_school_30"
      },
      {
        "id": "dna_rank_kid_school__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Ainda Bem que Não Sou Professor Deles! • Rank Prata",
        "description": "Filmes com as tags Criança Malvada e Colegio/Escola ao mesmo tempo. (Rank Prata: meta 5)."
      },
      {
        "id": "dna_rank_kid_school__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Ainda Bem que Não Sou Professor Deles! • Rank Épico",
        "description": "Filmes com as tags Criança Malvada e Colegio/Escola ao mesmo tempo. (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_kid_school__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Ainda Bem que Não Sou Professor Deles! • Rank Ouro",
        "description": "Filmes com as tags Criança Malvada e Colegio/Escola ao mesmo tempo. (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_kid_school__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Ainda Bem que Não Sou Professor Deles! • Rank Mítico",
        "description": "Filmes com as tags Criança Malvada e Colegio/Escola ao mesmo tempo. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dna_kid_school_30"
    ],
    "sort_order": 97
  },
  {
    "id": "dna_rank_kid_us",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Manual de Como Não se Criar uma Criança",
    "description": "Filmes dos EUA com a tag Criança Malvada (inclui coproduções).",
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
    "ranks": [
      {
        "id": "dna_rank_kid_us__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Manual de Como Não se Criar uma Criança • Rank Bronze",
        "description": "Filmes dos EUA com a tag Criança Malvada (inclui coproduções). (Rank Bronze: meta 3).",
        "legacy_id": "dna_kid_us_30"
      },
      {
        "id": "dna_rank_kid_us__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Manual de Como Não se Criar uma Criança • Rank Prata",
        "description": "Filmes dos EUA com a tag Criança Malvada (inclui coproduções). (Rank Prata: meta 8)."
      },
      {
        "id": "dna_rank_kid_us__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Manual de Como Não se Criar uma Criança • Rank Épico",
        "description": "Filmes dos EUA com a tag Criança Malvada (inclui coproduções). (Rank Épico: meta 15)."
      },
      {
        "id": "dna_rank_kid_us__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Manual de Como Não se Criar uma Criança • Rank Ouro",
        "description": "Filmes dos EUA com a tag Criança Malvada (inclui coproduções). (Rank Ouro: meta 22)."
      },
      {
        "id": "dna_rank_kid_us__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Manual de Como Não se Criar uma Criança • Rank Mítico",
        "description": "Filmes dos EUA com a tag Criança Malvada (inclui coproduções). (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "dna_kid_us_30"
    ],
    "sort_order": 98
  },
  {
    "id": "dna_rank_pirata_lgbt",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "A Bandeira Desse Pirata É Diferente! (Arco-Íris nos Sete Mares)",
    "description": "Filmes com tag Personagem LGBT vistos em My Family Cine, YouTube ou Internet.",
    "icon": "🏳️‍🌈",
    "target_type": "multi_ritual_rule",
    "target_value": 20,
    "target_metadata": {
      "ruleKey": "pirata_tag_lgbt_15"
    },
    "ranks": [
      {
        "id": "dna_rank_pirata_lgbt__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "A Bandeira Desse Pirata É Diferente! (Arco-Íris nos Sete Mares) • Rank Bronze",
        "description": "Filmes com tag Personagem LGBT vistos em My Family Cine, YouTube ou Internet. (Rank Bronze: meta 2).",
        "legacy_id": "multi_dna_rc_pirata_lgbt_15"
      },
      {
        "id": "dna_rank_pirata_lgbt__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "A Bandeira Desse Pirata É Diferente! (Arco-Íris nos Sete Mares) • Rank Prata",
        "description": "Filmes com tag Personagem LGBT vistos em My Family Cine, YouTube ou Internet. (Rank Prata: meta 5)."
      },
      {
        "id": "dna_rank_pirata_lgbt__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "A Bandeira Desse Pirata É Diferente! (Arco-Íris nos Sete Mares) • Rank Épico",
        "description": "Filmes com tag Personagem LGBT vistos em My Family Cine, YouTube ou Internet. (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_pirata_lgbt__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "A Bandeira Desse Pirata É Diferente! (Arco-Íris nos Sete Mares) • Rank Ouro",
        "description": "Filmes com tag Personagem LGBT vistos em My Family Cine, YouTube ou Internet. (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_pirata_lgbt__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "A Bandeira Desse Pirata É Diferente! (Arco-Íris nos Sete Mares) • Rank Mítico",
        "description": "Filmes com tag Personagem LGBT vistos em My Family Cine, YouTube ou Internet. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "multi_dna_rc_pirata_lgbt_15"
    ],
    "sort_order": 99
  },
  {
    "id": "dna_rank_folha_branco",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "DNA Cinéfilo: Ué, uma Folha em Branco?!",
    "description": "Filmes cadastrados com 0 tags vinculadas.",
    "icon": "📄",
    "target_type": "movie_zero_tags_count",
    "target_value": 10,
    "target_metadata": {
      "tagCount": 0
    },
    "ranks": [
      {
        "id": "dna_rank_folha_branco__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "DNA Cinéfilo: Ué, uma Folha em Branco?! • Rank Bronze",
        "description": "Filmes cadastrados com 0 tags vinculadas. (Rank Bronze: meta 1).",
        "legacy_id": "tc_folha_em_branco_15"
      },
      {
        "id": "dna_rank_folha_branco__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "DNA Cinéfilo: Ué, uma Folha em Branco?! • Rank Prata",
        "description": "Filmes cadastrados com 0 tags vinculadas. (Rank Prata: meta 3)."
      },
      {
        "id": "dna_rank_folha_branco__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "DNA Cinéfilo: Ué, uma Folha em Branco?! • Rank Épico",
        "description": "Filmes cadastrados com 0 tags vinculadas. (Rank Épico: meta 5)."
      },
      {
        "id": "dna_rank_folha_branco__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "DNA Cinéfilo: Ué, uma Folha em Branco?! • Rank Ouro",
        "description": "Filmes cadastrados com 0 tags vinculadas. (Rank Ouro: meta 8)."
      },
      {
        "id": "dna_rank_folha_branco__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "DNA Cinéfilo: Ué, uma Folha em Branco?! • Rank Mítico",
        "description": "Filmes cadastrados com 0 tags vinculadas. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "tc_folha_em_branco_15"
    ],
    "sort_order": 100
  },
  {
    "id": "dna_rank_em_familia_cinema",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "Pipoca Dividida (Disputa de Balde na Fileira F)",
    "description": "Filmes com tag Em Família assistidos no Cinema.",
    "icon": "🍿",
    "target_type": "tag_platform_count",
    "target_value": 20,
    "target_metadata": {
      "tag": "Em Família",
      "platform": "Cinema"
    },
    "ranks": [
      {
        "id": "dna_rank_em_familia_cinema__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Pipoca Dividida (Disputa de Balde na Fileira F) • Rank Bronze",
        "description": "Filmes com tag Em Família assistidos no Cinema. (Rank Bronze: meta 2).",
        "legacy_id": "tc_em_familia_cinema_10"
      },
      {
        "id": "dna_rank_em_familia_cinema__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Pipoca Dividida (Disputa de Balde na Fileira F) • Rank Prata",
        "description": "Filmes com tag Em Família assistidos no Cinema. (Rank Prata: meta 5)."
      },
      {
        "id": "dna_rank_em_familia_cinema__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Pipoca Dividida (Disputa de Balde na Fileira F) • Rank Épico",
        "description": "Filmes com tag Em Família assistidos no Cinema. (Rank Épico: meta 10)."
      },
      {
        "id": "dna_rank_em_familia_cinema__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Pipoca Dividida (Disputa de Balde na Fileira F) • Rank Ouro",
        "description": "Filmes com tag Em Família assistidos no Cinema. (Rank Ouro: meta 15)."
      },
      {
        "id": "dna_rank_em_familia_cinema__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Pipoca Dividida (Disputa de Balde na Fileira F) • Rank Mítico",
        "description": "Filmes com tag Em Família assistidos no Cinema. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "tc_em_familia_cinema_10"
    ],
    "sort_order": 101
  },
  {
    "id": "dna_rank_em_familia_agosto",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "data_limite"
    ],
    "tier": "mythic",
    "title": "Festa de Aniversário com a Galera!",
    "description": "Filmes com tag Em Família assistidos no mês de Agosto.",
    "icon": "🎂",
    "target_type": "tag_month",
    "target_value": 10,
    "target_metadata": {
      "tag": "Em Família",
      "month": 8
    },
    "ranks": [
      {
        "id": "dna_rank_em_familia_agosto__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Festa de Aniversário com a Galera! • Rank Bronze",
        "description": "Filmes com tag Em Família assistidos no mês de Agosto. (Rank Bronze: meta 1).",
        "legacy_id": "tc_em_familia_agosto_5"
      },
      {
        "id": "dna_rank_em_familia_agosto__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Festa de Aniversário com a Galera! • Rank Prata",
        "description": "Filmes com tag Em Família assistidos no mês de Agosto. (Rank Prata: meta 3)."
      },
      {
        "id": "dna_rank_em_familia_agosto__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Festa de Aniversário com a Galera! • Rank Épico",
        "description": "Filmes com tag Em Família assistidos no mês de Agosto. (Rank Épico: meta 5)."
      },
      {
        "id": "dna_rank_em_familia_agosto__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Festa de Aniversário com a Galera! • Rank Ouro",
        "description": "Filmes com tag Em Família assistidos no mês de Agosto. (Rank Ouro: meta 8)."
      },
      {
        "id": "dna_rank_em_familia_agosto__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Festa de Aniversário com a Galera! • Rank Mítico",
        "description": "Filmes com tag Em Família assistidos no mês de Agosto. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "tc_em_familia_agosto_5"
    ],
    "sort_order": 102
  },
  {
    "id": "dna_rank_milagre_jogo",
    "kind": "rank",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Milagre na Indústria: Essa Adaptação Ficou Boa?!",
    "description": "Filmes com tag Baseado em jogo e Minha Nota >= 8.000.",
    "icon": "👾",
    "target_type": "tag_min_rating_count",
    "target_value": 10,
    "target_metadata": {
      "tag": "Baseado em jogo",
      "minRating": 8000
    },
    "ranks": [
      {
        "id": "dna_rank_milagre_jogo__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Milagre na Indústria: Essa Adaptação Ficou Boa?! • Rank Bronze",
        "description": "Filmes com tag Baseado em jogo e Minha Nota >= 8.000. (Rank Bronze: meta 1).",
        "legacy_id": "tc_milagre_industria_baseado_jogo_nota_8"
      },
      {
        "id": "dna_rank_milagre_jogo__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Milagre na Indústria: Essa Adaptação Ficou Boa?! • Rank Prata",
        "description": "Filmes com tag Baseado em jogo e Minha Nota >= 8.000. (Rank Prata: meta 3)."
      },
      {
        "id": "dna_rank_milagre_jogo__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Milagre na Indústria: Essa Adaptação Ficou Boa?! • Rank Épico",
        "description": "Filmes com tag Baseado em jogo e Minha Nota >= 8.000. (Rank Épico: meta 5)."
      },
      {
        "id": "dna_rank_milagre_jogo__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Milagre na Indústria: Essa Adaptação Ficou Boa?! • Rank Ouro",
        "description": "Filmes com tag Baseado em jogo e Minha Nota >= 8.000. (Rank Ouro: meta 8)."
      },
      {
        "id": "dna_rank_milagre_jogo__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Milagre na Indústria: Essa Adaptação Ficou Boa?! • Rank Mítico",
        "description": "Filmes com tag Baseado em jogo e Minha Nota >= 8.000. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "tc_milagre_industria_baseado_jogo_nota_8"
    ],
    "sort_order": 103
  },
  {
    "id": "dna_kid_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_kid_1"
    ],
    "sort_order": 104
  },
  {
    "id": "dna_school_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_school_1"
    ],
    "sort_order": 105
  },
  {
    "id": "dna_anime_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_anime_1"
    ],
    "sort_order": 106
  },
  {
    "id": "dna_silent_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_silent_1"
    ],
    "sort_order": 107
  },
  {
    "id": "dna_bw_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_bw_1"
    ],
    "sort_order": 108
  },
  {
    "id": "dna_parody_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_parody_1"
    ],
    "sort_order": 109
  },
  {
    "id": "dna_xmas_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_xmas_1"
    ],
    "sort_order": 110
  },
  {
    "id": "dna_alien_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_alien_1"
    ],
    "sort_order": 111
  },
  {
    "id": "dna_kidnap_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_kidnap_1"
    ],
    "sort_order": 112
  },
  {
    "id": "dna_wizard_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_wizard_1"
    ],
    "sort_order": 113
  },
  {
    "id": "dna_alien_mx_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_alien_mx_1"
    ],
    "sort_order": 114
  },
  {
    "id": "dna_true_crime_reais_10",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_true_crime_reais_10"
    ],
    "sort_order": 115
  },
  {
    "id": "dna_vamp_wolf_6",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_vamp_wolf_6"
    ],
    "sort_order": 116
  },
  {
    "id": "dna_zombie_dystopia_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_zombie_dystopia_5"
    ],
    "sort_order": 117
  },
  {
    "id": "dna_villain_10",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_villain_10"
    ],
    "sort_order": 118
  },
  {
    "id": "dna_ghost_10",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_ghost_10"
    ],
    "sort_order": 119
  },
  {
    "id": "dna_time_epic_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_time_epic_5"
    ],
    "sort_order": 120
  },
  {
    "id": "dna_xmas_horror_3",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_xmas_horror_3"
    ],
    "sort_order": 121
  },
  {
    "id": "dna_game_anime_25",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_game_anime_25"
    ],
    "sort_order": 122
  },
  {
    "id": "dna_supernatural_bestiary_12",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_supernatural_bestiary_12"
    ],
    "sort_order": 123
  },
  {
    "id": "dna_cult_classic_13",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_cult_classic_13"
    ],
    "sort_order": 124
  },
  {
    "id": "dna_facts_supernatural_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "epic",
    "title": "Baseado em Fatos... Sobrenaturais?!",
    "description": "Conquistar 3 filmes que tenham a tag Fatos Reais combinada com Fantasma, Demônio ou Aliens no mesmo filme.",
    "icon": "🔮",
    "target_type": "tag_multi_or_and",
    "target_value": 3,
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
    "legacy_ids": [
      "dna_facts_supernatural_5"
    ],
    "sort_order": 125
  },
  {
    "id": "dna_cry_epic_10",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_cry_epic_10"
    ],
    "sort_order": 126
  },
  {
    "id": "dna_crime_br_10",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_crime_br_10"
    ],
    "sort_order": 127
  },
  {
    "id": "dna_power_non_us_20",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_power_non_us_20"
    ],
    "sort_order": 128
  },
  {
    "id": "dna_asian_horror_15",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
    "tier": "gold",
    "title": "Terror Asiático Não Perdoa!",
    "description": "Conquistar 5 filmes de terror (Fantasma, Demônio, Gore ou Zumbi) produzidos no Japão, Coreia do Sul, Tailândia ou Indonésia (inclui coproduções).",
    "icon": "👺",
    "target_type": "tag_hybrid_asian_horror",
    "target_value": 5,
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
    "legacy_ids": [
      "dna_asian_horror_15"
    ],
    "sort_order": 129
  },
  {
    "id": "dna_gore_br_15",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "A Nossa Bandeira Vai Ser Vermelha!!",
    "description": "Conquistar 5 filmes do Brasil com a tag Gore (inclui coproduções).",
    "icon": "🩸",
    "target_type": "tag_hybrid_country",
    "target_value": 5,
    "target_metadata": {
      "tags": [
        "Gore"
      ],
      "countryCode": "br",
      "countryName": "Brasil",
      "countryFlag": "🇧🇷",
      "isHybrid": true
    },
    "legacy_ids": [
      "dna_gore_br_15"
    ],
    "sort_order": 130
  },
  {
    "id": "dna_lgbt_africa_20",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
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
    "legacy_ids": [
      "dna_lgbt_africa_20"
    ],
    "sort_order": 131
  },
  {
    "id": "multi_dna_rc_pirata_crime_real_15",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_dna_rc_pirata_crime_real_15"
    ],
    "sort_order": 132
  },
  {
    "id": "multi_dna_rc_antigo_pb_mudo_3",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_dna_rc_antigo_pb_mudo_3"
    ],
    "sort_order": 133
  },
  {
    "id": "multi_dna_rc_netflix_gore_30",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_dna_rc_netflix_gore_30"
    ],
    "sort_order": 134
  },
  {
    "id": "multi_dna_ac_rc_minecraft_stack_64",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema"
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
    "legacy_ids": [
      "multi_dna_ac_rc_minecraft_stack_64"
    ],
    "sort_order": 135
  },
  {
    "id": "multi_dna_rc_marvel_dc_cinema_20",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_dna_rc_marvel_dc_cinema_20"
    ],
    "sort_order": 136
  },
  {
    "id": "dna_animais_gore_1",
    "kind": "unique",
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
    "legacy_ids": [
      "dna_animais_gore_1"
    ],
    "sort_order": 137
  },
  {
    "id": "dna_caso_evandro_crime_final_epico_7",
    "kind": "unique",
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
    "legacy_ids": [
      "dna_caso_evandro_crime_final_epico_7"
    ],
    "sort_order": 138
  },
  {
    "id": "tc_em_familia_terror_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema"
    ],
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
    "legacy_ids": [
      "tc_em_familia_terror_5"
    ],
    "sort_order": 139
  },
  {
    "id": "tc_em_familia_natal_3",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "data_limite"
    ],
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
    "legacy_ids": [
      "tc_em_familia_natal_3"
    ],
    "sort_order": 140
  },
  {
    "id": "tc_em_familia_nota_85_10",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_em_familia_nota_85_10"
    ],
    "sort_order": 141
  },
  {
    "id": "tc_em_familia_marvel_dc_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "silver",
    "title": "Maratona dos Heróis com a Turma",
    "description": "Conquistar 5 filmes com a tag Em Família que também possuam a tag Marvel ou DC (5 filmes).",
    "icon": "🦸‍♂️",
    "target_type": "tag_and_any_of_tags",
    "target_value": 5,
    "target_metadata": {
      "tag": "Em Família",
      "orTags": [
        "Marvel",
        "DC"
      ]
    },
    "legacy_ids": [
      "tc_em_familia_marvel_dc_5"
    ],
    "sort_order": 142
  },
  {
    "id": "tc_em_familia_nota_90_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_em_familia_nota_90_5"
    ],
    "sort_order": 143
  },
  {
    "id": "tc_muitas_tags_7_30",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "gold",
    "title": "DNA Cinéfilo: Isso Aqui É uma Loucura Generalizada!",
    "description": "Conquistar 30 filmes cadastrados que possuam 7 ou mais tags customizadas vinculadas no mesmo filme (30 filmes).",
    "icon": "🌪️",
    "target_type": "movies_min_tags_count",
    "target_value": 30,
    "target_metadata": {
      "minTags": 7
    },
    "legacy_ids": [
      "tc_muitas_tags_7_30"
    ],
    "sort_order": 144
  },
  {
    "id": "tc_you_died_terror_tragico_nota_3",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema",
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_you_died_terror_tragico_nota_3"
    ],
    "sort_order": 145
  },
  {
    "id": "tc_press_f_tragico_emocionante_fisica_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "ritual_cinefilo"
    ],
    "tier": "silver",
    "title": "Press F to Pay Respects",
    "description": "Conquistar 5 filmes que possuam a tag pessoal Trágico OU a tag pessoal Emocionante, assistidos em mídia física (Blu-ray ou DVD) (5 filmes).",
    "icon": "⌨️",
    "target_type": "tags_or_physical_media_count",
    "target_value": 5,
    "target_metadata": {
      "orTags": [
        "Trágico",
        "Emocionante"
      ]
    },
    "legacy_ids": [
      "tc_press_f_tragico_emocionante_fisica_5"
    ],
    "sort_order": 146
  },
  {
    "id": "tc_ah_shit_repetido_crime_acao_1990_2004_1",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema",
      "ritual_cinefilo"
    ],
    "tier": "bronze",
    "title": "Ah Shit, Here We Go Again... (CJ de Volta ao Bairro)",
    "description": "Conquistar 1 filme que possua a tag Repetido, pertença ao gênero Crime OU Ação, e tenha ano de lançamento situado entre 1990 e 2004 (1 filme).",
    "icon": "🚲",
    "target_type": "tag_and_genres_or_year_range",
    "target_value": 1,
    "target_metadata": {
      "tag": "Repetido",
      "orGenres": [
        "Crime",
        "Ação"
      ],
      "minYear": 1990,
      "maxYear": 2004
    },
    "legacy_ids": [
      "tc_ah_shit_repetido_crime_acao_1990_2004_1"
    ],
    "sort_order": 147
  },
  {
    "id": "tc_magia_profunda_bruxa_decadas",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "Não me cite a Magia Profunda, Bruxa. Eu estava lá quando ela foi escrita.",
    "description": "Conquistar pelo menos 1 filme com a tag Bruxo em cada uma das 8 décadas entre 1960s e 2030s (1960s, 1970s, 1980s, 1990s, 2000s, 2010s, 2020s, 2030s) (8 décadas no checklist).",
    "icon": "🧙‍♀️",
    "target_type": "tag_decades_checklist",
    "target_value": 8,
    "target_metadata": {
      "tag": "Bruxo",
      "decades": [
        1960,
        1970,
        1980,
        1990,
        2000,
        2010,
        2020,
        2030
      ]
    },
    "legacy_ids": [
      "tc_magia_profunda_bruxa_decadas"
    ],
    "sort_order": 148
  },
  {
    "id": "tc_new_game_plus_repetido_nota_9",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_new_game_plus_repetido_nota_9"
    ],
    "sort_order": 149
  },
  {
    "id": "tc_climao_almoco_domingo",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "epic",
    "title": "Climão no Almoço de Domingo (Chama a Christina Rocha!)",
    "description": "Conquistar 10 filmes do gênero Drama que possuam a tag Em família combinada com a tag Abuso familiar OU Preconceito (10 filmes).",
    "icon": "🛋️",
    "target_type": "genre_and_tag_and_any_tag",
    "target_value": 10,
    "target_metadata": {
      "genre": "Drama",
      "requiredTag": "Em Família",
      "orTags": [
        "Abuso Familiar",
        "Preconceito"
      ]
    },
    "legacy_ids": [
      "tc_climao_almoco_domingo"
    ],
    "sort_order": 150
  },
  {
    "id": "tc_cake_is_a_lie_ficcao_dystopia_viagem_nota_lt5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "anatomia_cinema",
      "tribunal_critica"
    ],
    "tier": "silver",
    "title": "O Bolo É uma Mentira! (The Cake Is a Lie)",
    "description": "Conquistar 3 filmes do gênero Ficção Científica com a tag Dystopia OU Viagem no tempo que tenham recebido Minha Nota abaixo de 5.000 (3 filmes).",
    "icon": "🎂",
    "target_type": "genre_and_tags_or_max_rating",
    "target_value": 3,
    "target_metadata": {
      "genre": "Ficção Científica",
      "orTags": [
        "Dystopia",
        "Viagem no Tempo"
      ],
      "maxRating": 5000
    },
    "legacy_ids": [
      "tc_cake_is_a_lie_ficcao_dystopia_viagem_nota_lt5"
    ],
    "sort_order": 151
  },
  {
    "id": "tc_e_verdade_esse_bilete_fatos_reais_nota_lt6",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_e_verdade_esse_bilete_fatos_reais_nota_lt6"
    ],
    "sort_order": 152
  },
  {
    "id": "dna_platinum_master",
    "kind": "platinum",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo"
    ],
    "tier": "platinum",
    "title": "O Arquivista Supremo das Tags",
    "description": "Conquistar 100% dos troféus e ranks da categoria DNA Cinéfilo (incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 119,
    "target_metadata": {
      "category": "dna_cinefilo",
      "categoryScope": "dna_cinefilo"
    },
    "legacy_ids": [
      "dna_platinum_master"
    ],
    "sort_order": 153
  },
  {
    "id": "ac_rank_curta",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Maratona Expressa de Curtas",
    "description": "Assistir filmes do gênero Curta.",
    "icon": "⏱️",
    "target_type": "genre_count",
    "target_value": 50,
    "target_metadata": {
      "genre": "Curta"
    },
    "ranks": [
      {
        "id": "ac_rank_curta__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Acabou Antes da Pipoca Esfriar!",
        "description": "Assistir filmes do gênero Curta. (Rank Bronze: meta 1).",
        "legacy_id": "ac_curta_1"
      },
      {
        "id": "ac_rank_curta__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "Maratona Rápida no Horário de Almoço",
        "description": "Assistir filmes do gênero Curta. (Rank Prata: meta 10).",
        "legacy_id": "ac_curta_10"
      },
      {
        "id": "ac_rank_curta__epic",
        "tier": "epic",
        "target_value": 20,
        "title": "Festival de Curtas-Metragens",
        "description": "Assistir filmes do gênero Curta. (Rank Épico: meta 20)."
      },
      {
        "id": "ac_rank_curta__gold",
        "tier": "gold",
        "target_value": 35,
        "title": "Dose Diária de Curta",
        "description": "Assistir filmes do gênero Curta. (Rank Ouro: meta 35)."
      },
      {
        "id": "ac_rank_curta__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Mestre dos Curtas (50 Filmes)",
        "description": "Assistir filmes do gênero Curta. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "ac_curta_1",
      "ac_curta_10"
    ],
    "sort_order": 154
  },
  {
    "id": "ac_rank_faroeste",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Gatilho Mais Rápido do Oeste",
    "description": "Assistir filmes do gênero Faroeste.",
    "icon": "🤠",
    "target_type": "genre_count",
    "target_value": 15,
    "target_metadata": {
      "genre": "Faroeste"
    },
    "ranks": [
      {
        "id": "ac_rank_faroeste__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Esta Cidade É Pequena Demais para Nós Dois",
        "description": "Assistir filmes do gênero Faroeste. (Rank Bronze: meta 1).",
        "legacy_id": "ac_faroeste_1"
      },
      {
        "id": "ac_rank_faroeste__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Duelo ao Meio-Dia",
        "description": "Assistir filmes do gênero Faroeste. (Rank Prata: meta 3).",
        "legacy_id": "ac_faroeste_10"
      },
      {
        "id": "ac_rank_faroeste__epic",
        "tier": "epic",
        "target_value": 6,
        "title": "Xerife da Fronteira",
        "description": "Assistir filmes do gênero Faroeste. (Rank Épico: meta 6)."
      },
      {
        "id": "ac_rank_faroeste__gold",
        "tier": "gold",
        "target_value": 10,
        "title": "Gatilho Mais Rápido do Oeste",
        "description": "Assistir filmes do gênero Faroeste. (Rank Ouro: meta 10)."
      },
      {
        "id": "ac_rank_faroeste__mythic",
        "tier": "mythic",
        "target_value": 15,
        "title": "Lenda do Velho Oeste (15 Faroestes)",
        "description": "Assistir filmes do gênero Faroeste. (Rank Mítico: meta 15)."
      }
    ],
    "legacy_ids": [
      "ac_faroeste_1",
      "ac_faroeste_10"
    ],
    "sort_order": 155
  },
  {
    "id": "ac_rank_drama",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Haja Terapia! (Rei do Drama)",
    "description": "Assistir filmes do gênero Drama.",
    "icon": "🎭",
    "target_type": "genre_count",
    "target_value": 120,
    "target_metadata": {
      "genre": "Drama"
    },
    "ranks": [
      {
        "id": "ac_rank_drama__bronze",
        "tier": "bronze",
        "target_value": 15,
        "title": "Anatomia do Cinema: Haja Terapia! (Rei do Drama) • Rank Bronze",
        "description": "Assistir filmes do gênero Drama. (Rank Bronze: meta 15).",
        "legacy_id": "ac_drama_150"
      },
      {
        "id": "ac_rank_drama__silver",
        "tier": "silver",
        "target_value": 35,
        "title": "Anatomia do Cinema: Haja Terapia! (Rei do Drama) • Rank Prata",
        "description": "Assistir filmes do gênero Drama. (Rank Prata: meta 35)."
      },
      {
        "id": "ac_rank_drama__epic",
        "tier": "epic",
        "target_value": 60,
        "title": "Anatomia do Cinema: Haja Terapia! (Rei do Drama) • Rank Épico",
        "description": "Assistir filmes do gênero Drama. (Rank Épico: meta 60)."
      },
      {
        "id": "ac_rank_drama__gold",
        "tier": "gold",
        "target_value": 90,
        "title": "Anatomia do Cinema: Haja Terapia! (Rei do Drama) • Rank Ouro",
        "description": "Assistir filmes do gênero Drama. (Rank Ouro: meta 90)."
      },
      {
        "id": "ac_rank_drama__mythic",
        "tier": "mythic",
        "target_value": 120,
        "title": "Anatomia do Cinema: Haja Terapia! (Rei do Drama) • Rank Mítico",
        "description": "Assistir filmes do gênero Drama. (Rank Mítico: meta 120)."
      }
    ],
    "legacy_ids": [
      "ac_drama_150"
    ],
    "sort_order": 156
  },
  {
    "id": "ac_rank_comedia",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Rir É o Melhor Remédio",
    "description": "Assistir filmes do gênero Comédia.",
    "icon": "😂",
    "target_type": "genre_count",
    "target_value": 50,
    "target_metadata": {
      "genre": "Comédia"
    },
    "ranks": [
      {
        "id": "ac_rank_comedia__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Anatomia do Cinema: Rir É o Melhor Remédio • Rank Bronze",
        "description": "Assistir filmes do gênero Comédia. (Rank Bronze: meta 5).",
        "legacy_id": "ac_comedia_100"
      },
      {
        "id": "ac_rank_comedia__silver",
        "tier": "silver",
        "target_value": 12,
        "title": "Anatomia do Cinema: Rir É o Melhor Remédio • Rank Prata",
        "description": "Assistir filmes do gênero Comédia. (Rank Prata: meta 12)."
      },
      {
        "id": "ac_rank_comedia__epic",
        "tier": "epic",
        "target_value": 25,
        "title": "Anatomia do Cinema: Rir É o Melhor Remédio • Rank Épico",
        "description": "Assistir filmes do gênero Comédia. (Rank Épico: meta 25)."
      },
      {
        "id": "ac_rank_comedia__gold",
        "tier": "gold",
        "target_value": 38,
        "title": "Anatomia do Cinema: Rir É o Melhor Remédio • Rank Ouro",
        "description": "Assistir filmes do gênero Comédia. (Rank Ouro: meta 38)."
      },
      {
        "id": "ac_rank_comedia__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Anatomia do Cinema: Rir É o Melhor Remédio • Rank Mítico",
        "description": "Assistir filmes do gênero Comédia. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "ac_comedia_100"
    ],
    "sort_order": 157
  },
  {
    "id": "ac_rank_terror_suspense",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Mestre do Medo e da Tensão",
    "description": "Quotas equilibradas de Terror + Suspense (até 20 Terror + 20 Suspense = 40 filmes).",
    "icon": "🩸",
    "target_type": "genre_quotas",
    "target_value": 40,
    "target_metadata": {
      "quotas": [
        {
          "genre": "Terror",
          "count": 20
        },
        {
          "genre": "Suspense",
          "count": 20
        }
      ]
    },
    "ranks": [
      {
        "id": "ac_rank_terror_suspense__bronze",
        "tier": "bronze",
        "target_value": 4,
        "title": "Anatomia do Cinema: Mestre do Medo e da Tensão • Rank Bronze",
        "description": "Quotas equilibradas de Terror + Suspense (até 20 Terror + 20 Suspense = 40 filmes). (Rank Bronze: meta 4).",
        "legacy_id": "ac_terror_suspense_quota_150"
      },
      {
        "id": "ac_rank_terror_suspense__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "Anatomia do Cinema: Mestre do Medo e da Tensão • Rank Prata",
        "description": "Quotas equilibradas de Terror + Suspense (até 20 Terror + 20 Suspense = 40 filmes). (Rank Prata: meta 10)."
      },
      {
        "id": "ac_rank_terror_suspense__epic",
        "tier": "epic",
        "target_value": 20,
        "title": "Anatomia do Cinema: Mestre do Medo e da Tensão • Rank Épico",
        "description": "Quotas equilibradas de Terror + Suspense (até 20 Terror + 20 Suspense = 40 filmes). (Rank Épico: meta 20)."
      },
      {
        "id": "ac_rank_terror_suspense__gold",
        "tier": "gold",
        "target_value": 30,
        "title": "Anatomia do Cinema: Mestre do Medo e da Tensão • Rank Ouro",
        "description": "Quotas equilibradas de Terror + Suspense (até 20 Terror + 20 Suspense = 40 filmes). (Rank Ouro: meta 30)."
      },
      {
        "id": "ac_rank_terror_suspense__mythic",
        "tier": "mythic",
        "target_value": 40,
        "title": "Anatomia do Cinema: Mestre do Medo e da Tensão • Rank Mítico",
        "description": "Quotas equilibradas de Terror + Suspense (até 20 Terror + 20 Suspense = 40 filmes). (Rank Mítico: meta 40)."
      }
    ],
    "legacy_ids": [
      "ac_terror_suspense_quota_150"
    ],
    "sort_order": 158
  },
  {
    "id": "ac_rank_acao_aventura",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Viciado em Adrenalina",
    "description": "Quotas equilibradas de Ação + Aventura (até 45 Ação + 45 Aventura = 90 filmes).",
    "icon": "🏎️",
    "target_type": "genre_quotas",
    "target_value": 90,
    "target_metadata": {
      "quotas": [
        {
          "genre": "Ação",
          "count": 45
        },
        {
          "genre": "Aventura",
          "count": 45
        }
      ]
    },
    "ranks": [
      {
        "id": "ac_rank_acao_aventura__bronze",
        "tier": "bronze",
        "target_value": 10,
        "title": "Anatomia do Cinema: Viciado em Adrenalina • Rank Bronze",
        "description": "Quotas equilibradas de Ação + Aventura (até 45 Ação + 45 Aventura = 90 filmes). (Rank Bronze: meta 10).",
        "legacy_id": "ac_acao_aventura_quota_150"
      },
      {
        "id": "ac_rank_acao_aventura__silver",
        "tier": "silver",
        "target_value": 24,
        "title": "Anatomia do Cinema: Viciado em Adrenalina • Rank Prata",
        "description": "Quotas equilibradas de Ação + Aventura (até 45 Ação + 45 Aventura = 90 filmes). (Rank Prata: meta 24)."
      },
      {
        "id": "ac_rank_acao_aventura__epic",
        "tier": "epic",
        "target_value": 44,
        "title": "Anatomia do Cinema: Viciado em Adrenalina • Rank Épico",
        "description": "Quotas equilibradas de Ação + Aventura (até 45 Ação + 45 Aventura = 90 filmes). (Rank Épico: meta 44)."
      },
      {
        "id": "ac_rank_acao_aventura__gold",
        "tier": "gold",
        "target_value": 66,
        "title": "Anatomia do Cinema: Viciado em Adrenalina • Rank Ouro",
        "description": "Quotas equilibradas de Ação + Aventura (até 45 Ação + 45 Aventura = 90 filmes). (Rank Ouro: meta 66)."
      },
      {
        "id": "ac_rank_acao_aventura__mythic",
        "tier": "mythic",
        "target_value": 90,
        "title": "Anatomia do Cinema: Viciado em Adrenalina • Rank Mítico",
        "description": "Quotas equilibradas de Ação + Aventura (até 45 Ação + 45 Aventura = 90 filmes). (Rank Mítico: meta 90)."
      }
    ],
    "legacy_ids": [
      "ac_acao_aventura_quota_150"
    ],
    "sort_order": 159
  },
  {
    "id": "ac_rank_quimera_4_generos",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Anatomia do Cinema: Quimera Cinematográfica (4+ Gêneros)",
    "description": "Assistir filmes com 4 ou mais gêneros oficiais simultâneos.",
    "icon": "🐉",
    "target_type": "movie_min_genre_count",
    "target_value": 30,
    "target_metadata": {
      "minGenresPerMovie": 4
    },
    "ranks": [
      {
        "id": "ac_rank_quimera_4_generos__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Anatomia do Cinema: Quimera Cinematográfica (4+ Gêneros) • Rank Bronze",
        "description": "Assistir filmes com 4 ou mais gêneros oficiais simultâneos. (Rank Bronze: meta 3).",
        "legacy_id": "ac_quimera_4_generos_15"
      },
      {
        "id": "ac_rank_quimera_4_generos__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Anatomia do Cinema: Quimera Cinematográfica (4+ Gêneros) • Rank Prata",
        "description": "Assistir filmes com 4 ou mais gêneros oficiais simultâneos. (Rank Prata: meta 8)."
      },
      {
        "id": "ac_rank_quimera_4_generos__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Anatomia do Cinema: Quimera Cinematográfica (4+ Gêneros) • Rank Épico",
        "description": "Assistir filmes com 4 ou mais gêneros oficiais simultâneos. (Rank Épico: meta 15)."
      },
      {
        "id": "ac_rank_quimera_4_generos__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Anatomia do Cinema: Quimera Cinematográfica (4+ Gêneros) • Rank Ouro",
        "description": "Assistir filmes com 4 ou mais gêneros oficiais simultâneos. (Rank Ouro: meta 22)."
      },
      {
        "id": "ac_rank_quimera_4_generos__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Anatomia do Cinema: Quimera Cinematográfica (4+ Gêneros) • Rank Mítico",
        "description": "Assistir filmes com 4 ou mais gêneros oficiais simultâneos. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "ac_quimera_4_generos_15"
    ],
    "sort_order": 160
  },
  {
    "id": "ac_rank_animacao_dublada",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema",
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "Dublagem de Ouro nos Desenhos!",
    "description": "Assistir filmes de Animação com áudio Dublado.",
    "icon": "🎙️",
    "target_type": "multi_ritual_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "animacao_dublada_15"
    },
    "ranks": [
      {
        "id": "ac_rank_animacao_dublada__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Dublagem de Ouro nos Desenhos! • Rank Bronze",
        "description": "Assistir filmes de Animação com áudio Dublado. (Rank Bronze: meta 3).",
        "legacy_id": "multi_ac_rc_animacao_dublada_15"
      },
      {
        "id": "ac_rank_animacao_dublada__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Dublagem de Ouro nos Desenhos! • Rank Prata",
        "description": "Assistir filmes de Animação com áudio Dublado. (Rank Prata: meta 8)."
      },
      {
        "id": "ac_rank_animacao_dublada__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Dublagem de Ouro nos Desenhos! • Rank Épico",
        "description": "Assistir filmes de Animação com áudio Dublado. (Rank Épico: meta 15)."
      },
      {
        "id": "ac_rank_animacao_dublada__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Dublagem de Ouro nos Desenhos! • Rank Ouro",
        "description": "Assistir filmes de Animação com áudio Dublado. (Rank Ouro: meta 22)."
      },
      {
        "id": "ac_rank_animacao_dublada__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Dublagem de Ouro nos Desenhos! • Rank Mítico",
        "description": "Assistir filmes de Animação com áudio Dublado. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "multi_ac_rc_animacao_dublada_15"
    ],
    "sort_order": 161
  },
  {
    "id": "ac_rank_terror_sem_gore",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema",
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Ué, Cadê o Sangue?! Temos que Fazer o Código ABACABB!",
    "description": "Assistir filmes do gênero Terror sem a tag Gore.",
    "icon": "👻",
    "target_type": "multi_ritual_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "terror_sem_gore_30"
    },
    "ranks": [
      {
        "id": "ac_rank_terror_sem_gore__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Ué, Cadê o Sangue?! Temos que Fazer o Código ABACABB! • Rank Bronze",
        "description": "Assistir filmes do gênero Terror sem a tag Gore. (Rank Bronze: meta 3).",
        "legacy_id": "multi_ac_dna_terror_sem_gore_30"
      },
      {
        "id": "ac_rank_terror_sem_gore__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Ué, Cadê o Sangue?! Temos que Fazer o Código ABACABB! • Rank Prata",
        "description": "Assistir filmes do gênero Terror sem a tag Gore. (Rank Prata: meta 8)."
      },
      {
        "id": "ac_rank_terror_sem_gore__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Ué, Cadê o Sangue?! Temos que Fazer o Código ABACABB! • Rank Épico",
        "description": "Assistir filmes do gênero Terror sem a tag Gore. (Rank Épico: meta 15)."
      },
      {
        "id": "ac_rank_terror_sem_gore__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Ué, Cadê o Sangue?! Temos que Fazer o Código ABACABB! • Rank Ouro",
        "description": "Assistir filmes do gênero Terror sem a tag Gore. (Rank Ouro: meta 22)."
      },
      {
        "id": "ac_rank_terror_sem_gore__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Ué, Cadê o Sangue?! Temos que Fazer o Código ABACABB! • Rank Mítico",
        "description": "Assistir filmes do gênero Terror sem a tag Gore. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "multi_ac_dna_terror_sem_gore_30"
    ],
    "sort_order": 162
  },
  {
    "id": "ac_doc_1",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_doc_1"
    ],
    "sort_order": 163
  },
  {
    "id": "ac_musica_1",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_musica_1"
    ],
    "sort_order": 164
  },
  {
    "id": "ac_animacao_1",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_animacao_1"
    ],
    "sort_order": 165
  },
  {
    "id": "ac_acao_aventura_1",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_acao_aventura_1"
    ],
    "sort_order": 166
  },
  {
    "id": "ac_comedia_romance_1",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_comedia_romance_1"
    ],
    "sort_order": 167
  },
  {
    "id": "ac_crime_policial_1",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_crime_policial_1"
    ],
    "sort_order": 168
  },
  {
    "id": "ac_misterio_suspense_1",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_misterio_suspense_1"
    ],
    "sort_order": 169
  },
  {
    "id": "ac_terrir_5",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_terrir_5"
    ],
    "sort_order": 170
  },
  {
    "id": "ac_ficcao_terror_5",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_ficcao_terror_5"
    ],
    "sort_order": 171
  },
  {
    "id": "ac_bio_historia_10",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_bio_historia_10"
    ],
    "sort_order": 172
  },
  {
    "id": "ac_guerra_drama_10",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_guerra_drama_10"
    ],
    "sort_order": 173
  },
  {
    "id": "ac_drama_romance_15",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_drama_romance_15"
    ],
    "sort_order": 174
  },
  {
    "id": "ac_animacao_familia_15",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_animacao_familia_15"
    ],
    "sort_order": 175
  },
  {
    "id": "ac_fantasia_aventura_15",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_fantasia_aventura_15"
    ],
    "sort_order": 176
  },
  {
    "id": "ac_policial_misterio_20",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_policial_misterio_20"
    ],
    "sort_order": 177
  },
  {
    "id": "ac_animacao_adulta_3",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_animacao_adulta_3"
    ],
    "sort_order": 178
  },
  {
    "id": "ac_faroeste_weird_2",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_faroeste_weird_2"
    ],
    "sort_order": 179
  },
  {
    "id": "ac_guerra_comedia_3",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_guerra_comedia_3"
    ],
    "sort_order": 180
  },
  {
    "id": "ac_familia_spooky_5",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_familia_spooky_5"
    ],
    "sort_order": 181
  },
  {
    "id": "ac_doc_crime_10",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_doc_crime_10"
    ],
    "sort_order": 182
  },
  {
    "id": "ac_bio_musica_10",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_bio_musica_10"
    ],
    "sort_order": 183
  },
  {
    "id": "ac_misterio_suspense_terror_10",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_misterio_suspense_terror_10"
    ],
    "sort_order": 184
  },
  {
    "id": "ac_blockbuster_triplo_15",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_blockbuster_triplo_15"
    ],
    "sort_order": 185
  },
  {
    "id": "ac_mafia_triplo_15",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_mafia_triplo_15"
    ],
    "sort_order": 186
  },
  {
    "id": "ac_trincheira_amor_5",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_trincheira_amor_5"
    ],
    "sort_order": 187
  },
  {
    "id": "ac_doc_bio_hist_quota_75",
    "kind": "unique",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Anatomia do Cinema: Professor de História e Atualidades",
    "description": "Conquistar 10 filmes de Documentário, 10 de Biografia e 10 de História (30 filmes).",
    "icon": "🏛️",
    "target_type": "genre_quotas",
    "target_value": 30,
    "target_metadata": {
      "quotas": [
        {
          "genre": "Documentário",
          "count": 10
        },
        {
          "genre": "Biografia",
          "count": 10
        },
        {
          "genre": "História",
          "count": 10
        }
      ]
    },
    "legacy_ids": [
      "ac_doc_bio_hist_quota_75"
    ],
    "sort_order": 188
  },
  {
    "id": "ac_crise_5_generos_5",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_crise_5_generos_5"
    ],
    "sort_order": 189
  },
  {
    "id": "ac_locadora_15_generos_25",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_locadora_15_generos_25"
    ],
    "sort_order": 190
  },
  {
    "id": "ac_trindade_drama_comedia_terror_440",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_trindade_drama_comedia_terror_440"
    ],
    "sort_order": 191
  },
  {
    "id": "ac_enciclopedia_combos_50",
    "kind": "unique",
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
    "legacy_ids": [
      "ac_enciclopedia_combos_50"
    ],
    "sort_order": 192
  },
  {
    "id": "ac_platinum_master",
    "kind": "platinum",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema"
    ],
    "tier": "platinum",
    "title": "Anatomia do Cinema: O Mestre Supremo dos Gêneros",
    "description": "Conquistar 100% dos troféus e ranks da categoria Anatomia do Cinema (incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 86,
    "target_metadata": {
      "category": "anatomia_cinema",
      "categoryScope": "anatomia_cinema"
    },
    "legacy_ids": [
      "ac_platinum_master"
    ],
    "sort_order": 193
  },
  {
    "id": "cross_uk_comedia_10",
    "kind": "unique",
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
    "legacy_ids": [
      "cross_uk_comedia_10"
    ],
    "sort_order": 194
  },
  {
    "id": "cross_brasil_musica_5",
    "kind": "unique",
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
    "legacy_ids": [
      "cross_brasil_musica_5"
    ],
    "sort_order": 195
  },
  {
    "id": "cross_animacao_antropo_10",
    "kind": "unique",
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
    "legacy_ids": [
      "cross_animacao_antropo_10"
    ],
    "sort_order": 196
  },
  {
    "id": "triple_brasil_crime_real_5",
    "kind": "unique",
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
    "legacy_ids": [
      "triple_brasil_crime_real_5"
    ],
    "sort_order": 197
  },
  {
    "id": "triple_europa_terror_demonio_5",
    "kind": "unique",
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
    "legacy_ids": [
      "triple_europa_terror_demonio_5"
    ],
    "sort_order": 198
  },
  {
    "id": "multi_ac_rc_curta_youtube_5",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_ac_rc_curta_youtube_5"
    ],
    "sort_order": 199
  },
  {
    "id": "multi_ac_rc_terror_anos_80_10",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_ac_rc_terror_anos_80_10"
    ],
    "sort_order": 200
  },
  {
    "id": "multi_ac_rc_pirata_romance_30",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_ac_rc_pirata_romance_30"
    ],
    "sort_order": 201
  },
  {
    "id": "tc_konami_code_acao_aventura_1980s_30",
    "kind": "unique",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema",
      "ritual_cinefilo"
    ],
    "tier": "gold",
    "title": "Konami Code: 30 Vidas no Cineclube!",
    "description": "Conquistar 30 filmes dos gêneros Ação ou Aventura lançados na década de 1980 (entre 1980 e 1989) (30 filmes).",
    "icon": "🎮",
    "target_type": "genres_or_decade_range_count",
    "target_value": 30,
    "target_metadata": {
      "genres": [
        "Ação",
        "Aventura"
      ],
      "minYear": 1980,
      "maxYear": 1989
    },
    "legacy_ids": [
      "tc_konami_code_acao_aventura_1980s_30"
    ],
    "sort_order": 202
  },
  {
    "id": "tc_rush_b_acao_max_90_min",
    "kind": "unique",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema",
      "ritual_cinefilo"
    ],
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
    "legacy_ids": [
      "tc_rush_b_acao_max_90_min"
    ],
    "sort_order": 203
  },
  {
    "id": "tc_ray_tracing_bomba_2021_ficcao_acao_reviews_500k",
    "kind": "unique",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema",
      "ritual_cinefilo",
      "tribunal_critica"
    ],
    "tier": "silver",
    "title": "\"Nem o Ray Tracing Salva Essa Bomba!\"",
    "description": "Conquistar 3 filmes lançados a partir do ano de 2021 do gênero Ficção Científica ou Ação que tenham mais de 500.000 Global Reviews e Minha Nota abaixo de 5.000 (3 filmes).",
    "icon": "💥",
    "target_type": "bomba_ray_tracing_count",
    "target_value": 3,
    "target_metadata": {
      "genres": [
        "Ficção Científica",
        "Ação"
      ],
      "minYear": 2021,
      "minGlobalReviews": 500000,
      "maxRating": 5000
    },
    "legacy_ids": [
      "tc_ray_tracing_bomba_2021_ficcao_acao_reviews_500k"
    ],
    "sort_order": 204
  },
  {
    "id": "dl_rank_terror_outubro",
    "kind": "rank",
    "category": "data_limite",
    "categories": [
      "data_limite",
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Data Limite: Mês das Bruxas Completo (31 Dias de Terror!)",
    "description": "Assistir filmes de Terror no mês de Outubro.",
    "icon": "🕯️",
    "target_type": "genre_month",
    "target_value": 31,
    "target_metadata": {
      "genre": "Terror",
      "month": 10
    },
    "ranks": [
      {
        "id": "dl_rank_terror_outubro__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Esquenta do Halloween (5 Filmes)",
        "description": "Assistir filmes de Terror no mês de Outubro. (Rank Bronze: meta 5).",
        "legacy_id": "dl_terror_outubro_13"
      },
      {
        "id": "dl_rank_terror_outubro__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "Noite de Terror em Outubro (10 Filmes)",
        "description": "Assistir filmes de Terror no mês de Outubro. (Rank Prata: meta 10).",
        "legacy_id": "dl_terror_outubro_13"
      },
      {
        "id": "dl_rank_terror_outubro__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Jason Ficaria Orgulhoso! (15 Filmes)",
        "description": "Assistir filmes de Terror no mês de Outubro. (Rank Épico: meta 15).",
        "legacy_id": "dl_terror_outubro_13"
      },
      {
        "id": "dl_rank_terror_outubro__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Quase Um Susto Por Noite (22 Filmes)",
        "description": "Assistir filmes de Terror no mês de Outubro. (Rank Ouro: meta 22).",
        "legacy_id": "dl_terror_outubro_31"
      },
      {
        "id": "dl_rank_terror_outubro__mythic",
        "tier": "mythic",
        "target_value": 31,
        "title": "Mês das Bruxas Completo (31 Dias de Terror!)",
        "description": "Assistir filmes de Terror no mês de Outubro. (Rank Mítico: meta 31).",
        "legacy_id": "dl_terror_outubro_31"
      }
    ],
    "legacy_ids": [
      "dl_terror_outubro_13",
      "dl_terror_outubro_13",
      "dl_terror_outubro_13",
      "dl_terror_outubro_31",
      "dl_terror_outubro_31"
    ],
    "sort_order": 205
  },
  {
    "id": "dl_rank_todos_12_meses",
    "kind": "rank",
    "category": "data_limite",
    "categories": [
      "data_limite"
    ],
    "tier": "mythic",
    "title": "Data Limite: Cinéfilo Sem Férias (Janeiro a Dezembro)",
    "description": "Assistir filmes em CADA UM dos 12 meses do ano (de 1 a 15 filmes por mês).",
    "icon": "📆",
    "target_type": "all_12_months_coverage",
    "target_value": 15,
    "target_metadata": {
      "minPerMonth": 1
    },
    "ranks": [
      {
        "id": "dl_rank_todos_12_meses__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Cinéfilo de Janeiro a Dezembro (1 por mês)",
        "description": "Assistir filmes em CADA UM dos 12 meses do ano (de 1 a 15 filmes por mês). (Rank Bronze: meta 1).",
        "legacy_id": "dl_todos_12_meses_1"
      },
      {
        "id": "dl_rank_todos_12_meses__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Ritmo Constante o Ano Todo (3 por mês)",
        "description": "Assistir filmes em CADA UM dos 12 meses do ano (de 1 a 15 filmes por mês). (Rank Prata: meta 3).",
        "legacy_id": "dl_todos_12_meses_1"
      },
      {
        "id": "dl_rank_todos_12_meses__epic",
        "tier": "epic",
        "target_value": 6,
        "title": "Meia Dúzia Todo Mês (6 por mês)",
        "description": "Assistir filmes em CADA UM dos 12 meses do ano (de 1 a 15 filmes por mês). (Rank Épico: meta 6).",
        "legacy_id": "dl_todos_12_meses_1"
      },
      {
        "id": "dl_rank_todos_12_meses__gold",
        "tier": "gold",
        "target_value": 10,
        "title": "Dezena Garantida no Calendário (10 por mês)",
        "description": "Assistir filmes em CADA UM dos 12 meses do ano (de 1 a 15 filmes por mês). (Rank Ouro: meta 10).",
        "legacy_id": "dl_todos_12_meses_15"
      },
      {
        "id": "dl_rank_todos_12_meses__mythic",
        "tier": "mythic",
        "target_value": 15,
        "title": "Sem Férias para o Controle Remoto (15 por mês)",
        "description": "Assistir filmes em CADA UM dos 12 meses do ano (de 1 a 15 filmes por mês). (Rank Mítico: meta 15).",
        "legacy_id": "dl_todos_12_meses_15"
      }
    ],
    "legacy_ids": [
      "dl_todos_12_meses_1",
      "dl_todos_12_meses_1",
      "dl_todos_12_meses_1",
      "dl_todos_12_meses_15",
      "dl_todos_12_meses_15"
    ],
    "sort_order": 206
  },
  {
    "id": "dl_rank_fevereiro",
    "kind": "rank",
    "category": "data_limite",
    "categories": [
      "data_limite"
    ],
    "tier": "mythic",
    "title": "Data Limite: Carnaval no Sofá!",
    "description": "Assistir filmes no mês de Fevereiro.",
    "icon": "🎭",
    "target_type": "month_movie_count",
    "target_value": 20,
    "target_metadata": {
      "month": 2
    },
    "ranks": [
      {
        "id": "dl_rank_fevereiro__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Data Limite: Carnaval no Sofá! • Rank Bronze",
        "description": "Assistir filmes no mês de Fevereiro. (Rank Bronze: meta 2).",
        "legacy_id": "dl_fevereiro_geral_15"
      },
      {
        "id": "dl_rank_fevereiro__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Data Limite: Carnaval no Sofá! • Rank Prata",
        "description": "Assistir filmes no mês de Fevereiro. (Rank Prata: meta 5)."
      },
      {
        "id": "dl_rank_fevereiro__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Data Limite: Carnaval no Sofá! • Rank Épico",
        "description": "Assistir filmes no mês de Fevereiro. (Rank Épico: meta 10)."
      },
      {
        "id": "dl_rank_fevereiro__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Data Limite: Carnaval no Sofá! • Rank Ouro",
        "description": "Assistir filmes no mês de Fevereiro. (Rank Ouro: meta 15)."
      },
      {
        "id": "dl_rank_fevereiro__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Data Limite: Carnaval no Sofá! • Rank Mítico",
        "description": "Assistir filmes no mês de Fevereiro. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "dl_fevereiro_geral_15"
    ],
    "sort_order": 207
  },
  {
    "id": "dl_rank_pride_junho",
    "kind": "rank",
    "category": "data_limite",
    "categories": [
      "data_limite",
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Data Limite: Mês do Orgulho (Pride Month)",
    "description": "Assistir filmes com tag Personagem LGBT no mês de Junho.",
    "icon": "🏳️‍🌈",
    "target_type": "tag_month",
    "target_value": 10,
    "target_metadata": {
      "tag": "Personagem LGBT",
      "month": 6
    },
    "ranks": [
      {
        "id": "dl_rank_pride_junho__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Data Limite: Mês do Orgulho (Pride Month) • Rank Bronze",
        "description": "Assistir filmes com tag Personagem LGBT no mês de Junho. (Rank Bronze: meta 1).",
        "legacy_id": "dl_pride_lgbt_junho_10"
      },
      {
        "id": "dl_rank_pride_junho__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Data Limite: Mês do Orgulho (Pride Month) • Rank Prata",
        "description": "Assistir filmes com tag Personagem LGBT no mês de Junho. (Rank Prata: meta 3)."
      },
      {
        "id": "dl_rank_pride_junho__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Data Limite: Mês do Orgulho (Pride Month) • Rank Épico",
        "description": "Assistir filmes com tag Personagem LGBT no mês de Junho. (Rank Épico: meta 5)."
      },
      {
        "id": "dl_rank_pride_junho__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Data Limite: Mês do Orgulho (Pride Month) • Rank Ouro",
        "description": "Assistir filmes com tag Personagem LGBT no mês de Junho. (Rank Ouro: meta 8)."
      },
      {
        "id": "dl_rank_pride_junho__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Data Limite: Mês do Orgulho (Pride Month) • Rank Mítico",
        "description": "Assistir filmes com tag Personagem LGBT no mês de Junho. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "dl_pride_lgbt_junho_10"
    ],
    "sort_order": 208
  },
  {
    "id": "dl_rank_pride_sem_fronteiras",
    "kind": "rank",
    "category": "data_limite",
    "categories": [
      "data_limite",
      "volta_ao_mundo",
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "Data Limite: Orgulho Sem Fronteiras em Junho",
    "description": "Filmes fora dos EUA e fora do Brasil + Drama ou Romance + tag Personagem LGBT + vistos em Junho.",
    "icon": "🌈",
    "target_type": "quad_pride_sem_fronteiras",
    "target_value": 10,
    "target_metadata": {
      "excludeCountryCodes": [
        "us",
        "br"
      ],
      "isQuad": true
    },
    "ranks": [
      {
        "id": "dl_rank_pride_sem_fronteiras__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Data Limite: Orgulho Sem Fronteiras em Junho • Rank Bronze",
        "description": "Filmes fora dos EUA e fora do Brasil + Drama ou Romance + tag Personagem LGBT + vistos em Junho. (Rank Bronze: meta 1).",
        "legacy_id": "quad_pride_sem_fronteiras_5"
      },
      {
        "id": "dl_rank_pride_sem_fronteiras__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Data Limite: Orgulho Sem Fronteiras em Junho • Rank Prata",
        "description": "Filmes fora dos EUA e fora do Brasil + Drama ou Romance + tag Personagem LGBT + vistos em Junho. (Rank Prata: meta 3)."
      },
      {
        "id": "dl_rank_pride_sem_fronteiras__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Data Limite: Orgulho Sem Fronteiras em Junho • Rank Épico",
        "description": "Filmes fora dos EUA e fora do Brasil + Drama ou Romance + tag Personagem LGBT + vistos em Junho. (Rank Épico: meta 5)."
      },
      {
        "id": "dl_rank_pride_sem_fronteiras__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Data Limite: Orgulho Sem Fronteiras em Junho • Rank Ouro",
        "description": "Filmes fora dos EUA e fora do Brasil + Drama ou Romance + tag Personagem LGBT + vistos em Junho. (Rank Ouro: meta 8)."
      },
      {
        "id": "dl_rank_pride_sem_fronteiras__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Data Limite: Orgulho Sem Fronteiras em Junho • Rank Mítico",
        "description": "Filmes fora dos EUA e fora do Brasil + Drama ou Romance + tag Personagem LGBT + vistos em Junho. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "quad_pride_sem_fronteiras_5"
    ],
    "sort_order": 209
  },
  {
    "id": "dl_natal_fora_epoca_3",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_natal_fora_epoca_3"
    ],
    "sort_order": 210
  },
  {
    "id": "dl_drama_novembro_10",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_drama_novembro_10"
    ],
    "sort_order": 211
  },
  {
    "id": "dl_escola_fev_ago_5",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_escola_fev_ago_5"
    ],
    "sort_order": 212
  },
  {
    "id": "dl_natal_dezembro_10",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_natal_dezembro_10"
    ],
    "sort_order": 213
  },
  {
    "id": "dl_romance_junho_10",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_romance_junho_10"
    ],
    "sort_order": 214
  },
  {
    "id": "dl_romance_fevereiro_10",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_romance_fevereiro_10"
    ],
    "sort_order": 215
  },
  {
    "id": "dl_animacao_familia_julho_10",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_animacao_familia_julho_10"
    ],
    "sort_order": 216
  },
  {
    "id": "dl_repetido_viagem_janeiro_5",
    "kind": "unique",
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
    "legacy_ids": [
      "dl_repetido_viagem_janeiro_5"
    ],
    "sort_order": 217
  },
  {
    "id": "quad_natal_classico_5",
    "kind": "unique",
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
    "legacy_ids": [
      "quad_natal_classico_5"
    ],
    "sort_order": 218
  },
  {
    "id": "quad_outubro_macabro_mundo_10",
    "kind": "unique",
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
    "legacy_ids": [
      "quad_outubro_macabro_mundo_10"
    ],
    "sort_order": 219
  },
  {
    "id": "quad_natal_macabro_3",
    "kind": "unique",
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
    "legacy_ids": [
      "quad_natal_macabro_3"
    ],
    "sort_order": 220
  },
  {
    "id": "mafia_rank_oscar_winner",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Tapete Vermelho de Gala (Oscar)",
    "description": "Assistir filmes ganhadores de pelo menos 1 Oscar.",
    "icon": "🏆",
    "target_type": "hollywood_oscar_winner_count",
    "target_value": 50,
    "target_metadata": {
      "minWins": 1
    },
    "ranks": [
      {
        "id": "mafia_rank_oscar_winner__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "O Oscar Vai Para... Meu Catálogo!",
        "description": "Assistir filmes ganhadores de pelo menos 1 Oscar. (Rank Bronze: meta 1).",
        "legacy_id": "mafia_oscar_winner_1"
      },
      {
        "id": "mafia_rank_oscar_winner__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "Convidado da Academia (10 Estatuetas)",
        "description": "Assistir filmes ganhadores de pelo menos 1 Oscar. (Rank Prata: meta 10).",
        "legacy_id": "mafia_oscar_winner_15"
      },
      {
        "id": "mafia_rank_oscar_winner__epic",
        "tier": "epic",
        "target_value": 20,
        "title": "Tapete Vermelho de Gala (20 Estatuetas)",
        "description": "Assistir filmes ganhadores de pelo menos 1 Oscar. (Rank Épico: meta 20)."
      },
      {
        "id": "mafia_rank_oscar_winner__gold",
        "tier": "gold",
        "target_value": 35,
        "title": "Votante de Honra do Oscar (35 Estatuetas)",
        "description": "Assistir filmes ganhadores de pelo menos 1 Oscar. (Rank Ouro: meta 35)."
      },
      {
        "id": "mafia_rank_oscar_winner__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Sócio Vitalício da Estatueta Dourada (50 Filmes)",
        "description": "Assistir filmes ganhadores de pelo menos 1 Oscar. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "mafia_oscar_winner_1",
      "mafia_oscar_winner_15"
    ],
    "sort_order": 221
  },
  {
    "id": "mafia_rank_sony",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Império Sony Pictures",
    "description": "Filmes do estúdio/distribuidora Sony Pictures / Columbia / TriStar.",
    "icon": "🎮",
    "target_type": "hollywood_distributor_studio_count",
    "target_value": 60,
    "target_metadata": {
      "company": "Sony Pictures",
      "patterns": [
        "sony",
        "columbia pictures",
        "tri-star",
        "tristar"
      ]
    },
    "ranks": [
      {
        "id": "mafia_rank_sony__bronze",
        "tier": "bronze",
        "target_value": 10,
        "title": "Pensei que a Sony Só Fazia Música e PlayStation!",
        "description": "Filmes do estúdio/distribuidora Sony Pictures / Columbia / TriStar. (Rank Bronze: meta 10).",
        "legacy_id": "mafia_dist_sony_10"
      },
      {
        "id": "mafia_rank_sony__silver",
        "tier": "silver",
        "target_value": 20,
        "title": "Mais Filmes que Exclusivos de PS5",
        "description": "Filmes do estúdio/distribuidora Sony Pictures / Columbia / TriStar. (Rank Prata: meta 20).",
        "legacy_id": "mafia_dist_sony_30"
      },
      {
        "id": "mafia_rank_sony__epic",
        "tier": "epic",
        "target_value": 35,
        "title": "Acionista da Columbia Pictures",
        "description": "Filmes do estúdio/distribuidora Sony Pictures / Columbia / TriStar. (Rank Épico: meta 35).",
        "legacy_id": "mafia_dist_sony_50"
      },
      {
        "id": "mafia_rank_sony__gold",
        "tier": "gold",
        "target_value": 48,
        "title": "Diretoria Executiva da Sony",
        "description": "Filmes do estúdio/distribuidora Sony Pictures / Columbia / TriStar. (Rank Ouro: meta 48)."
      },
      {
        "id": "mafia_rank_sony__mythic",
        "tier": "mythic",
        "target_value": 60,
        "title": "Monopólio da Sony Pictures (60 Filmes)",
        "description": "Filmes do estúdio/distribuidora Sony Pictures / Columbia / TriStar. (Rank Mítico: meta 60)."
      }
    ],
    "legacy_ids": [
      "mafia_dist_sony_10",
      "mafia_dist_sony_30",
      "mafia_dist_sony_50"
    ],
    "sort_order": 222
  },
  {
    "id": "mafia_rank_warner",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Torre da Warner Bros.",
    "description": "Filmes do estúdio/distribuidora Warner Bros.",
    "icon": "🛡️",
    "target_type": "hollywood_distributor_studio_count",
    "target_value": 60,
    "target_metadata": {
      "company": "Warner Bros.",
      "patterns": [
        "warner"
      ]
    },
    "ranks": [
      {
        "id": "mafia_rank_warner__bronze",
        "tier": "bronze",
        "target_value": 10,
        "title": "Como Assim Não Foi Cancelado pelo CEO?!",
        "description": "Filmes do estúdio/distribuidora Warner Bros. (Rank Bronze: meta 10).",
        "legacy_id": "mafia_studio_warner_15"
      },
      {
        "id": "mafia_rank_warner__silver",
        "tier": "silver",
        "target_value": 20,
        "title": "Tem de Tudo Aqui: Do Herói ao Terror!",
        "description": "Filmes do estúdio/distribuidora Warner Bros. (Rank Prata: meta 20).",
        "legacy_id": "mafia_studio_warner_30"
      },
      {
        "id": "mafia_rank_warner__epic",
        "tier": "epic",
        "target_value": 35,
        "title": "Passe Livre nos Estúdios de Burbank",
        "description": "Filmes do estúdio/distribuidora Warner Bros. (Rank Épico: meta 35)."
      },
      {
        "id": "mafia_rank_warner__gold",
        "tier": "gold",
        "target_value": 48,
        "title": "Chefe de Produção da Warner",
        "description": "Filmes do estúdio/distribuidora Warner Bros. (Rank Ouro: meta 48)."
      },
      {
        "id": "mafia_rank_warner__mythic",
        "tier": "mythic",
        "target_value": 60,
        "title": "Dono da Caixa d’Água da Warner (60 Filmes)",
        "description": "Filmes do estúdio/distribuidora Warner Bros. (Rank Mítico: meta 60)."
      }
    ],
    "legacy_ids": [
      "mafia_studio_warner_15",
      "mafia_studio_warner_30"
    ],
    "sort_order": 223
  },
  {
    "id": "mafia_rank_a24",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: O Surpreendente Selo A24",
    "description": "Filmes da distribuidora/estúdio A24.",
    "icon": "💎",
    "target_type": "hollywood_distributor_studio_count",
    "target_value": 30,
    "target_metadata": {
      "company": "A24",
      "patterns": [
        "a24"
      ]
    },
    "ranks": [
      {
        "id": "mafia_rank_a24__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "A Máfia de Hollywood: O Surpreendente Selo A24 • Rank Bronze",
        "description": "Filmes da distribuidora/estúdio A24. (Rank Bronze: meta 3).",
        "legacy_id": "mafia_dist_a24_10"
      },
      {
        "id": "mafia_rank_a24__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "A Máfia de Hollywood: O Surpreendente Selo A24 • Rank Prata",
        "description": "Filmes da distribuidora/estúdio A24. (Rank Prata: meta 8).",
        "legacy_id": "mafia_dist_a24_30"
      },
      {
        "id": "mafia_rank_a24__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "A Máfia de Hollywood: O Surpreendente Selo A24 • Rank Épico",
        "description": "Filmes da distribuidora/estúdio A24. (Rank Épico: meta 15)."
      },
      {
        "id": "mafia_rank_a24__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "A Máfia de Hollywood: O Surpreendente Selo A24 • Rank Ouro",
        "description": "Filmes da distribuidora/estúdio A24. (Rank Ouro: meta 22)."
      },
      {
        "id": "mafia_rank_a24__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "A Máfia de Hollywood: O Surpreendente Selo A24 • Rank Mítico",
        "description": "Filmes da distribuidora/estúdio A24. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "mafia_dist_a24_10",
      "mafia_dist_a24_30"
    ],
    "sort_order": 224
  },
  {
    "id": "mafia_rank_unique_directors",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Panteão dos Diretores Únicos",
    "description": "Diretores distintos com 3 ou mais filmes conquistados no catálogo.",
    "icon": "🎬",
    "target_type": "hollywood_unique_directors_quota",
    "target_value": 20,
    "target_metadata": {
      "minFilmsPerDirector": 3
    },
    "ranks": [
      {
        "id": "mafia_rank_unique_directors__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "A Máfia de Hollywood: Panteão dos Diretores Únicos • Rank Bronze",
        "description": "Diretores distintos com 3 ou mais filmes conquistados no catálogo. (Rank Bronze: meta 3).",
        "legacy_id": "mafia_unique_directors_3_films_10"
      },
      {
        "id": "mafia_rank_unique_directors__silver",
        "tier": "silver",
        "target_value": 6,
        "title": "A Máfia de Hollywood: Panteão dos Diretores Únicos • Rank Prata",
        "description": "Diretores distintos com 3 ou mais filmes conquistados no catálogo. (Rank Prata: meta 6).",
        "legacy_id": "mafia_unique_directors_4_films_15"
      },
      {
        "id": "mafia_rank_unique_directors__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "A Máfia de Hollywood: Panteão dos Diretores Únicos • Rank Épico",
        "description": "Diretores distintos com 3 ou mais filmes conquistados no catálogo. (Rank Épico: meta 10)."
      },
      {
        "id": "mafia_rank_unique_directors__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "A Máfia de Hollywood: Panteão dos Diretores Únicos • Rank Ouro",
        "description": "Diretores distintos com 3 ou mais filmes conquistados no catálogo. (Rank Ouro: meta 15)."
      },
      {
        "id": "mafia_rank_unique_directors__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "A Máfia de Hollywood: Panteão dos Diretores Únicos • Rank Mítico",
        "description": "Diretores distintos com 3 ou mais filmes conquistados no catálogo. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "mafia_unique_directors_3_films_10",
      "mafia_unique_directors_4_films_15"
    ],
    "sort_order": 225
  },
  {
    "id": "mafia_rank_disney_pixar",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Só Tem Filme Fofo (Disney & Pixar)",
    "description": "Filmes do estúdio/distribuidora Disney / Pixar.",
    "icon": "🏰",
    "target_type": "hollywood_distributor_studio_count",
    "target_value": 20,
    "target_metadata": {
      "company": "Disney / Pixar",
      "patterns": [
        "disney",
        "walt disney",
        "pixar",
        "buena vista"
      ]
    },
    "ranks": [
      {
        "id": "mafia_rank_disney_pixar__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "A Máfia de Hollywood: Só Tem Filme Fofo (Disney & Pixar) • Rank Bronze",
        "description": "Filmes do estúdio/distribuidora Disney / Pixar. (Rank Bronze: meta 2).",
        "legacy_id": "mafia_studio_disney_pixar_10"
      },
      {
        "id": "mafia_rank_disney_pixar__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "A Máfia de Hollywood: Só Tem Filme Fofo (Disney & Pixar) • Rank Prata",
        "description": "Filmes do estúdio/distribuidora Disney / Pixar. (Rank Prata: meta 5)."
      },
      {
        "id": "mafia_rank_disney_pixar__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "A Máfia de Hollywood: Só Tem Filme Fofo (Disney & Pixar) • Rank Épico",
        "description": "Filmes do estúdio/distribuidora Disney / Pixar. (Rank Épico: meta 10)."
      },
      {
        "id": "mafia_rank_disney_pixar__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "A Máfia de Hollywood: Só Tem Filme Fofo (Disney & Pixar) • Rank Ouro",
        "description": "Filmes do estúdio/distribuidora Disney / Pixar. (Rank Ouro: meta 15)."
      },
      {
        "id": "mafia_rank_disney_pixar__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "A Máfia de Hollywood: Só Tem Filme Fofo (Disney & Pixar) • Rank Mítico",
        "description": "Filmes do estúdio/distribuidora Disney / Pixar. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "mafia_studio_disney_pixar_10"
    ],
    "sort_order": 226
  },
  {
    "id": "mafia_rank_downtown_globo",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Orgulho da Indústria Nacional!",
    "description": "Filmes somados da Downtown Filmes ou Globo Filmes.",
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
    "ranks": [
      {
        "id": "mafia_rank_downtown_globo__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "A Máfia de Hollywood: Orgulho da Indústria Nacional! • Rank Bronze",
        "description": "Filmes somados da Downtown Filmes ou Globo Filmes. (Rank Bronze: meta 1).",
        "legacy_id": "mafia_studio_br_downtown_globo_10"
      },
      {
        "id": "mafia_rank_downtown_globo__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "A Máfia de Hollywood: Orgulho da Indústria Nacional! • Rank Prata",
        "description": "Filmes somados da Downtown Filmes ou Globo Filmes. (Rank Prata: meta 3)."
      },
      {
        "id": "mafia_rank_downtown_globo__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "A Máfia de Hollywood: Orgulho da Indústria Nacional! • Rank Épico",
        "description": "Filmes somados da Downtown Filmes ou Globo Filmes. (Rank Épico: meta 5)."
      },
      {
        "id": "mafia_rank_downtown_globo__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "A Máfia de Hollywood: Orgulho da Indústria Nacional! • Rank Ouro",
        "description": "Filmes somados da Downtown Filmes ou Globo Filmes. (Rank Ouro: meta 8)."
      },
      {
        "id": "mafia_rank_downtown_globo__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "A Máfia de Hollywood: Orgulho da Indústria Nacional! • Rank Mítico",
        "description": "Filmes somados da Downtown Filmes ou Globo Filmes. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "mafia_studio_br_downtown_globo_10"
    ],
    "sort_order": 227
  },
  {
    "id": "mafia_rank_twisted_pictures",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Game Over! (Twisted Pictures)",
    "description": "Filmes do estúdio Twisted Pictures.",
    "icon": "🩸",
    "target_type": "hollywood_studio_count",
    "target_value": 15,
    "target_metadata": {
      "studio": "Twisted Pictures",
      "patterns": [
        "twisted pictures"
      ]
    },
    "ranks": [
      {
        "id": "mafia_rank_twisted_pictures__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "A Máfia de Hollywood: Game Over! (Twisted Pictures) • Rank Bronze",
        "description": "Filmes do estúdio Twisted Pictures. (Rank Bronze: meta 1).",
        "legacy_id": "mafia_studio_twisted_pictures_10"
      },
      {
        "id": "mafia_rank_twisted_pictures__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "A Máfia de Hollywood: Game Over! (Twisted Pictures) • Rank Prata",
        "description": "Filmes do estúdio Twisted Pictures. (Rank Prata: meta 3)."
      },
      {
        "id": "mafia_rank_twisted_pictures__epic",
        "tier": "epic",
        "target_value": 6,
        "title": "A Máfia de Hollywood: Game Over! (Twisted Pictures) • Rank Épico",
        "description": "Filmes do estúdio Twisted Pictures. (Rank Épico: meta 6)."
      },
      {
        "id": "mafia_rank_twisted_pictures__gold",
        "tier": "gold",
        "target_value": 10,
        "title": "A Máfia de Hollywood: Game Over! (Twisted Pictures) • Rank Ouro",
        "description": "Filmes do estúdio Twisted Pictures. (Rank Ouro: meta 10)."
      },
      {
        "id": "mafia_rank_twisted_pictures__mythic",
        "tier": "mythic",
        "target_value": 15,
        "title": "A Máfia de Hollywood: Game Over! (Twisted Pictures) • Rank Mítico",
        "description": "Filmes do estúdio Twisted Pictures. (Rank Mítico: meta 15)."
      }
    ],
    "legacy_ids": [
      "mafia_studio_twisted_pictures_10"
    ],
    "sort_order": 228
  },
  {
    "id": "mafia_rank_oscar_streaming",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood",
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "Noite de Gala do Oscar no Sofá de Casa",
    "description": "Ganhadores do Oscar assistidos em streamings oficiais.",
    "icon": "🛋️",
    "target_type": "multi_ritual_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "oscar_winner_streaming_oficial_20"
    },
    "ranks": [
      {
        "id": "mafia_rank_oscar_streaming__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Noite de Gala do Oscar no Sofá de Casa • Rank Bronze",
        "description": "Ganhadores do Oscar assistidos em streamings oficiais. (Rank Bronze: meta 3).",
        "legacy_id": "multi_mh_rc_oscar_streaming_oficial_20"
      },
      {
        "id": "mafia_rank_oscar_streaming__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Noite de Gala do Oscar no Sofá de Casa • Rank Prata",
        "description": "Ganhadores do Oscar assistidos em streamings oficiais. (Rank Prata: meta 8)."
      },
      {
        "id": "mafia_rank_oscar_streaming__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Noite de Gala do Oscar no Sofá de Casa • Rank Épico",
        "description": "Ganhadores do Oscar assistidos em streamings oficiais. (Rank Épico: meta 15)."
      },
      {
        "id": "mafia_rank_oscar_streaming__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Noite de Gala do Oscar no Sofá de Casa • Rank Ouro",
        "description": "Ganhadores do Oscar assistidos em streamings oficiais. (Rank Ouro: meta 22)."
      },
      {
        "id": "mafia_rank_oscar_streaming__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Noite de Gala do Oscar no Sofá de Casa • Rank Mítico",
        "description": "Ganhadores do Oscar assistidos em streamings oficiais. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "multi_mh_rc_oscar_streaming_oficial_20"
    ],
    "sort_order": 229
  },
  {
    "id": "mafia_rank_netflix",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: TUDUM! O Império Original Netflix",
    "description": "Filmes produzidos ou distribuídos pela Netflix.",
    "icon": "🔴",
    "target_type": "hollywood_distributor_studio_count",
    "target_value": 100,
    "target_metadata": {
      "company": "Netflix",
      "patterns": [
        "netflix"
      ]
    },
    "ranks": [
      {
        "id": "mafia_rank_netflix__bronze",
        "tier": "bronze",
        "target_value": 10,
        "title": "TUDUM! Caiu Direto no Sofá",
        "description": "Filmes produzidos ou distribuídos pela Netflix. (Rank Bronze: meta 10).",
        "legacy_id": "mafia_dist_netflix_15"
      },
      {
        "id": "mafia_rank_netflix__silver",
        "tier": "silver",
        "target_value": 25,
        "title": "Sócio do Catálogo Vermelho",
        "description": "Filmes produzidos ou distribuídos pela Netflix. (Rank Prata: meta 25)."
      },
      {
        "id": "mafia_rank_netflix__epic",
        "tier": "epic",
        "target_value": 50,
        "title": "Maratona Sem Fim da Netflix",
        "description": "Filmes produzidos ou distribuídos pela Netflix. (Rank Épico: meta 50)."
      },
      {
        "id": "mafia_rank_netflix__gold",
        "tier": "gold",
        "target_value": 75,
        "title": "Acionista Majoritário do TUDUM",
        "description": "Filmes produzidos ou distribuídos pela Netflix. (Rank Ouro: meta 75)."
      },
      {
        "id": "mafia_rank_netflix__mythic",
        "tier": "mythic",
        "target_value": 100,
        "title": "Dono do Algoritmo da Netflix (100 Filmes)",
        "description": "Filmes produzidos ou distribuídos pela Netflix. (Rank Mítico: meta 100)."
      }
    ],
    "legacy_ids": [
      "mafia_dist_netflix_15"
    ],
    "sort_order": 230
  },
  {
    "id": "mafia_rank_oscar_azarao",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Morreu na Praia (Azarões do Oscar)",
    "description": "Filmes indicados ao Oscar que não venceram nenhuma estatueta.",
    "icon": "👏",
    "target_type": "hollywood_oscar_nominated_unwon_count",
    "target_value": 30,
    "target_metadata": {},
    "ranks": [
      {
        "id": "mafia_rank_oscar_azarao__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "A Máfia de Hollywood: Morreu na Praia (Azarões do Oscar) • Rank Bronze",
        "description": "Filmes indicados ao Oscar que não venceram nenhuma estatueta. (Rank Bronze: meta 3).",
        "legacy_id": "mafia_oscar_nominated_unwon_15"
      },
      {
        "id": "mafia_rank_oscar_azarao__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "A Máfia de Hollywood: Morreu na Praia (Azarões do Oscar) • Rank Prata",
        "description": "Filmes indicados ao Oscar que não venceram nenhuma estatueta. (Rank Prata: meta 8)."
      },
      {
        "id": "mafia_rank_oscar_azarao__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "A Máfia de Hollywood: Morreu na Praia (Azarões do Oscar) • Rank Épico",
        "description": "Filmes indicados ao Oscar que não venceram nenhuma estatueta. (Rank Épico: meta 15)."
      },
      {
        "id": "mafia_rank_oscar_azarao__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "A Máfia de Hollywood: Morreu na Praia (Azarões do Oscar) • Rank Ouro",
        "description": "Filmes indicados ao Oscar que não venceram nenhuma estatueta. (Rank Ouro: meta 22)."
      },
      {
        "id": "mafia_rank_oscar_azarao__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "A Máfia de Hollywood: Morreu na Praia (Azarões do Oscar) • Rank Mítico",
        "description": "Filmes indicados ao Oscar que não venceram nenhuma estatueta. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "mafia_oscar_nominated_unwon_15"
    ],
    "sort_order": 231
  },
  {
    "id": "mafia_rank_animacao_oscar",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood",
      "anatomia_cinema"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: Traço de Ouro (Animações com Oscar)",
    "description": "Filmes do gênero Animação ganhadores de pelo menos 1 Oscar.",
    "icon": "🎨",
    "target_type": "hybrid_genre_oscar_winner",
    "target_value": 10,
    "target_metadata": {
      "genre": "Animação",
      "minWins": 1
    },
    "ranks": [
      {
        "id": "mafia_rank_animacao_oscar__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Rabisco Premiado (1 Animação)",
        "description": "Filmes do gênero Animação ganhadores de pelo menos 1 Oscar. (Rank Bronze: meta 1)."
      },
      {
        "id": "mafia_rank_animacao_oscar__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Pódio dos Desenhos (3 Animações)",
        "description": "Filmes do gênero Animação ganhadores de pelo menos 1 Oscar. (Rank Prata: meta 3)."
      },
      {
        "id": "mafia_rank_animacao_oscar__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Estúdio de Ouro Animado (5 Animações)",
        "description": "Filmes do gênero Animação ganhadores de pelo menos 1 Oscar. (Rank Épico: meta 5)."
      },
      {
        "id": "mafia_rank_animacao_oscar__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Lenda da Animação na Academia (8 Animações)",
        "description": "Filmes do gênero Animação ganhadores de pelo menos 1 Oscar. (Rank Ouro: meta 8)."
      },
      {
        "id": "mafia_rank_animacao_oscar__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Olimpo da Animação com Oscar (10 Animações)",
        "description": "Filmes do gênero Animação ganhadores de pelo menos 1 Oscar. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [],
    "sort_order": 232
  },
  {
    "id": "ss_dicionario_az_26",
    "kind": "unique",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "A Máfia de Hollywood: O Dicionário Completo de A a Z!",
    "description": "Conquistar pelo menos 1 filme que inicie com CADA UMA das 26 letras do alfabeto, de A até Z (26 letras no checklist).",
    "icon": "🔤",
    "target_type": "alphabet_az_coverage",
    "target_value": 26,
    "target_metadata": {
      "targetLetters": 26
    },
    "legacy_ids": [
      "ss_dicionario_az_26"
    ],
    "sort_order": 233
  },
  {
    "id": "mafia_oscar_3_3",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_oscar_3_3"
    ],
    "sort_order": 234
  },
  {
    "id": "mafia_oscar_noms_10",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_oscar_noms_10"
    ],
    "sort_order": 235
  },
  {
    "id": "mafia_studio_new_line_10",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_studio_new_line_10"
    ],
    "sort_order": 236
  },
  {
    "id": "mafia_studio_arad_8",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_studio_arad_8"
    ],
    "sort_order": 237
  },
  {
    "id": "mafia_studio_constantin_8",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_studio_constantin_8"
    ],
    "sort_order": 238
  },
  {
    "id": "mafia_studio_dc_15",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_studio_dc_15"
    ],
    "sort_order": 239
  },
  {
    "id": "mafia_oscar_wins_8",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_oscar_wins_8"
    ],
    "sort_order": 240
  },
  {
    "id": "mafia_studio_fox_20",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_studio_fox_20"
    ],
    "sort_order": 241
  },
  {
    "id": "mafia_studio_blumhouse_20",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_studio_blumhouse_20"
    ],
    "sort_order": 242
  },
  {
    "id": "mafia_dist_lionsgate_20",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_dist_lionsgate_20"
    ],
    "sort_order": 243
  },
  {
    "id": "mafia_dist_paris_diamond_20",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_dist_paris_diamond_20"
    ],
    "sort_order": 244
  },
  {
    "id": "mafia_dist_paramount_uip_25",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_dist_paramount_uip_25"
    ],
    "sort_order": 245
  },
  {
    "id": "mafia_writer_director_same_15",
    "kind": "unique",
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
    "target_metadata": {},
    "legacy_ids": [
      "mafia_writer_director_same_15"
    ],
    "sort_order": 246
  },
  {
    "id": "mafia_oscar_5_noms_0_wins_3",
    "kind": "unique",
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
    "target_metadata": {},
    "legacy_ids": [
      "mafia_oscar_5_noms_0_wins_3"
    ],
    "sort_order": 247
  },
  {
    "id": "mafia_oscar_5_5",
    "kind": "unique",
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
    "target_metadata": {},
    "legacy_ids": [
      "mafia_oscar_5_5"
    ],
    "sort_order": 248
  },
  {
    "id": "mafia_unique_writers_3_films_10",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_unique_writers_3_films_10"
    ],
    "sort_order": 249
  },
  {
    "id": "mafia_oscar_officer_90",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_oscar_officer_90"
    ],
    "sort_order": 250
  },
  {
    "id": "mafia_conglomerates_monopoly_150",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_conglomerates_monopoly_150"
    ],
    "sort_order": 251
  },
  {
    "id": "mafia_oscar_lifetime_member",
    "kind": "unique",
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
    "legacy_ids": [
      "mafia_oscar_lifetime_member"
    ],
    "sort_order": 252
  },
  {
    "id": "mafia_godfather_plat",
    "kind": "platinum",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "platinum",
    "title": "A Máfia de Hollywood: O Poderoso Chefão dos Estúdios",
    "description": "Conquistar 100% dos troféus e ranks da categoria A Máfia de Hollywood (incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 82,
    "target_metadata": {
      "category": "mafia_hollywood",
      "categoryScope": "mafia_hollywood"
    },
    "legacy_ids": [
      "mafia_godfather_plat"
    ],
    "sort_order": 253
  },
  {
    "id": "multi_mh_tc_a24_conceitual",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_mh_tc_a24_conceitual"
    ],
    "sort_order": 254
  },
  {
    "id": "multi_mh_rc_sony_midia_fisica_10",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_mh_rc_sony_midia_fisica_10"
    ],
    "sort_order": 255
  },
  {
    "id": "mh_roberto_gomez_bolanos",
    "kind": "unique",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood"
    ],
    "tier": "silver",
    "title": "A Máfia de Hollywood: Isso, Isso, Isso! (Tá em Acapulco Tomando Coco)",
    "description": "Conquistar 1 filme que tenha Roberto Gómez Bolaños creditado em Direção, Roteiro ou Produção (1 filme).",
    "icon": "🥪",
    "target_type": "hollywood_director_or_writer_count",
    "target_value": 1,
    "target_metadata": {
      "person": "Roberto Gómez Bolaños",
      "patterns": [
        "roberto gomez bolanos",
        "roberto gómez bolaños",
        "chespirito"
      ],
      "checkProducers": true
    },
    "legacy_ids": [
      "mh_roberto_gomez_bolanos"
    ],
    "sort_order": 256
  },
  {
    "id": "tc_rank_imdb_80",
    "kind": "rank",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Tribunal da Crítica: O Panteão dos 8.0 no IMDb",
    "description": "Filmes com nota IMDb válida >= 8.0.",
    "icon": "⭐",
    "target_type": "critic_tribunal_rule",
    "target_value": 50,
    "target_metadata": {
      "ruleKey": "imdb_gte_80"
    },
    "ranks": [
      {
        "id": "tc_rank_imdb_80__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Voz das Massas (5 Filmes)",
        "description": "Filmes com nota IMDb válida >= 8.0. (Rank Bronze: meta 5).",
        "legacy_id": "tc_voz_das_massas_3"
      },
      {
        "id": "tc_rank_imdb_80__silver",
        "tier": "silver",
        "target_value": 12,
        "title": "This is Cinema! (12 Filmes)",
        "description": "Filmes com nota IMDb válida >= 8.0. (Rank Prata: meta 12).",
        "legacy_id": "tc_this_is_cinema_10"
      },
      {
        "id": "tc_rank_imdb_80__epic",
        "tier": "epic",
        "target_value": 25,
        "title": "O Panteão dos 8.0 (25 Filmes)",
        "description": "Filmes com nota IMDb válida >= 8.0. (Rank Épico: meta 25).",
        "legacy_id": "tc_panteao_dos_8_25"
      },
      {
        "id": "tc_rank_imdb_80__gold",
        "tier": "gold",
        "target_value": 38,
        "title": "Selo Ouro do Público (38 Filmes)",
        "description": "Filmes com nota IMDb válida >= 8.0. (Rank Ouro: meta 38)."
      },
      {
        "id": "tc_rank_imdb_80__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "Cânone Supremo do IMDb (50 Filmes)",
        "description": "Filmes com nota IMDb válida >= 8.0. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "tc_voz_das_massas_3",
      "tc_this_is_cinema_10",
      "tc_panteao_dos_8_25"
    ],
    "sort_order": 257
  },
  {
    "id": "tc_rank_1m_reviews",
    "kind": "rank",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Tribunal da Crítica: A Voz das Multidões (1M+ Reviews)",
    "description": "Filmes com >= 1.000.000 Global Reviews.",
    "icon": "🌍",
    "target_type": "critic_tribunal_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "gr_gte_1m"
    },
    "ranks": [
      {
        "id": "tc_rank_1m_reviews__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Fenômeno de Bilheteria Global",
        "description": "Filmes com >= 1.000.000 Global Reviews. (Rank Bronze: meta 3).",
        "legacy_id": "tc_fenomeno_bilheteria_3"
      },
      {
        "id": "tc_rank_1m_reviews__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Só Eu que Não Tinha Visto?!",
        "description": "Filmes com >= 1.000.000 Global Reviews. (Rank Prata: meta 8).",
        "legacy_id": "tc_so_eu_nao_tinha_visto_15"
      },
      {
        "id": "tc_rank_1m_reviews__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "A Bolha de Hollywood",
        "description": "Filmes com >= 1.000.000 Global Reviews. (Rank Épico: meta 15).",
        "legacy_id": "tc_bolha_de_hollywood_30"
      },
      {
        "id": "tc_rank_1m_reviews__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Arrasa-Quarteirão Mundial",
        "description": "Filmes com >= 1.000.000 Global Reviews. (Rank Ouro: meta 22).",
        "legacy_id": "tc_voz_das_multidoes_50"
      },
      {
        "id": "tc_rank_1m_reviews__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "A Voz das Multidões (30 Filmes)",
        "description": "Filmes com >= 1.000.000 Global Reviews. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "tc_fenomeno_bilheteria_3",
      "tc_so_eu_nao_tinha_visto_15",
      "tc_bolha_de_hollywood_30",
      "tc_voz_das_multidoes_50"
    ],
    "sort_order": 258
  },
  {
    "id": "tc_rank_only_mc_na",
    "kind": "rank",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Tribunal da Crítica: Eu Declino! (Só Metacritic N/A)",
    "description": "Filmes onde apenas o Metacritic está N/A (com Rotten Tomatoes válido).",
    "icon": "📂",
    "target_type": "critic_tribunal_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "only_mc_na"
    },
    "ranks": [
      {
        "id": "tc_rank_only_mc_na__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Tribunal da Crítica: Eu Declino! (Só Metacritic N/A) • Rank Bronze",
        "description": "Filmes onde apenas o Metacritic está N/A (com Rotten Tomatoes válido). (Rank Bronze: meta 3).",
        "legacy_id": "tc_evidencia_nao_encontrada_10"
      },
      {
        "id": "tc_rank_only_mc_na__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Tribunal da Crítica: Eu Declino! (Só Metacritic N/A) • Rank Prata",
        "description": "Filmes onde apenas o Metacritic está N/A (com Rotten Tomatoes válido). (Rank Prata: meta 8).",
        "legacy_id": "tc_eu_declino_20"
      },
      {
        "id": "tc_rank_only_mc_na__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Tribunal da Crítica: Eu Declino! (Só Metacritic N/A) • Rank Épico",
        "description": "Filmes onde apenas o Metacritic está N/A (com Rotten Tomatoes válido). (Rank Épico: meta 15)."
      },
      {
        "id": "tc_rank_only_mc_na__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Tribunal da Crítica: Eu Declino! (Só Metacritic N/A) • Rank Ouro",
        "description": "Filmes onde apenas o Metacritic está N/A (com Rotten Tomatoes válido). (Rank Ouro: meta 22)."
      },
      {
        "id": "tc_rank_only_mc_na__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Tribunal da Crítica: Eu Declino! (Só Metacritic N/A) • Rank Mítico",
        "description": "Filmes onde apenas o Metacritic está N/A (com Rotten Tomatoes válido). (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "tc_evidencia_nao_encontrada_10",
      "tc_eu_declino_20"
    ],
    "sort_order": 259
  },
  {
    "id": "tc_rank_both_mc_rt_na",
    "kind": "rank",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Tribunal da Crítica: Fantasma no Catálogo (MC e RT N/A)",
    "description": "Filmes onde tanto o Metacritic quanto o Rotten Tomatoes estão N/A.",
    "icon": "👻",
    "target_type": "critic_tribunal_rule",
    "target_value": 60,
    "target_metadata": {
      "ruleKey": "both_mc_rt_na"
    },
    "ranks": [
      {
        "id": "tc_rank_both_mc_rt_na__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Tribunal da Crítica: Fantasma no Catálogo (MC e RT N/A) • Rank Bronze",
        "description": "Filmes onde tanto o Metacritic quanto o Rotten Tomatoes estão N/A. (Rank Bronze: meta 5).",
        "legacy_id": "tc_filme_realmente_existe_30"
      },
      {
        "id": "tc_rank_both_mc_rt_na__silver",
        "tier": "silver",
        "target_value": 15,
        "title": "Tribunal da Crítica: Fantasma no Catálogo (MC e RT N/A) • Rank Prata",
        "description": "Filmes onde tanto o Metacritic quanto o Rotten Tomatoes estão N/A. (Rank Prata: meta 15).",
        "legacy_id": "tc_fantasma_no_catalogo_50"
      },
      {
        "id": "tc_rank_both_mc_rt_na__epic",
        "tier": "epic",
        "target_value": 30,
        "title": "Tribunal da Crítica: Fantasma no Catálogo (MC e RT N/A) • Rank Épico",
        "description": "Filmes onde tanto o Metacritic quanto o Rotten Tomatoes estão N/A. (Rank Épico: meta 30)."
      },
      {
        "id": "tc_rank_both_mc_rt_na__gold",
        "tier": "gold",
        "target_value": 45,
        "title": "Tribunal da Crítica: Fantasma no Catálogo (MC e RT N/A) • Rank Ouro",
        "description": "Filmes onde tanto o Metacritic quanto o Rotten Tomatoes estão N/A. (Rank Ouro: meta 45)."
      },
      {
        "id": "tc_rank_both_mc_rt_na__mythic",
        "tier": "mythic",
        "target_value": 60,
        "title": "Tribunal da Crítica: Fantasma no Catálogo (MC e RT N/A) • Rank Mítico",
        "description": "Filmes onde tanto o Metacritic quanto o Rotten Tomatoes estão N/A. (Rank Mítico: meta 60)."
      }
    ],
    "legacy_ids": [
      "tc_filme_realmente_existe_30",
      "tc_fantasma_no_catalogo_50"
    ],
    "sort_order": 260
  },
  {
    "id": "tc_rank_minha_nota_95",
    "kind": "rank",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Tribunal da Crítica: Inesquecíveis! (Minha Nota 9.500+)",
    "description": "Filmes com Minha Nota >= 9.500.",
    "icon": "🌟",
    "target_type": "critic_tribunal_rule",
    "target_value": 20,
    "target_metadata": {
      "ruleKey": "ur_gte_9500"
    },
    "ranks": [
      {
        "id": "tc_rank_minha_nota_95__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "Tribunal da Crítica: Inesquecíveis! (Minha Nota 9.500+) • Rank Bronze",
        "description": "Filmes com Minha Nota >= 9.500. (Rank Bronze: meta 2).",
        "legacy_id": "tc_inesqueciveis_10"
      },
      {
        "id": "tc_rank_minha_nota_95__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "Tribunal da Crítica: Inesquecíveis! (Minha Nota 9.500+) • Rank Prata",
        "description": "Filmes com Minha Nota >= 9.500. (Rank Prata: meta 5).",
        "legacy_id": "tc_amo_fundo_coracao_20"
      },
      {
        "id": "tc_rank_minha_nota_95__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "Tribunal da Crítica: Inesquecíveis! (Minha Nota 9.500+) • Rank Épico",
        "description": "Filmes com Minha Nota >= 9.500. (Rank Épico: meta 10)."
      },
      {
        "id": "tc_rank_minha_nota_95__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "Tribunal da Crítica: Inesquecíveis! (Minha Nota 9.500+) • Rank Ouro",
        "description": "Filmes com Minha Nota >= 9.500. (Rank Ouro: meta 15)."
      },
      {
        "id": "tc_rank_minha_nota_95__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "Tribunal da Crítica: Inesquecíveis! (Minha Nota 9.500+) • Rank Mítico",
        "description": "Filmes com Minha Nota >= 9.500. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "tc_inesqueciveis_10",
      "tc_amo_fundo_coracao_20"
    ],
    "sort_order": 261
  },
  {
    "id": "tc_primeira_sentenca_1",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_primeira_sentenca_1"
    ],
    "sort_order": 262
  },
  {
    "id": "tc_pena_maxima_1",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_pena_maxima_1"
    ],
    "sort_order": 263
  },
  {
    "id": "tc_tomate_fresco_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_tomate_fresco_3"
    ],
    "sort_order": 264
  },
  {
    "id": "tc_garimpeiro_primeira_viagem_1",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_garimpeiro_primeira_viagem_1"
    ],
    "sort_order": 265
  },
  {
    "id": "tc_sem_tomates_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_sem_tomates_10"
    ],
    "sort_order": 266
  },
  {
    "id": "tc_filme_ruim_muito_publico_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_filme_ruim_muito_publico_5"
    ],
    "sort_order": 267
  },
  {
    "id": "tc_apenas_eu_diretor_atores_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_apenas_eu_diretor_atores_10"
    ],
    "sort_order": 268
  },
  {
    "id": "tc_valeu_a_pena_garimpar_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_valeu_a_pena_garimpar_5"
    ],
    "sort_order": 269
  },
  {
    "id": "tc_tomate_podre_vale_ouro_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_tomate_podre_vale_ouro_5"
    ],
    "sort_order": 270
  },
  {
    "id": "tc_hipocrisia_critica_chata_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hipocrisia_critica_chata_5"
    ],
    "sort_order": 271
  },
  {
    "id": "tc_precisao_farmaceutico_15",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_precisao_farmaceutico_15"
    ],
    "sort_order": 272
  },
  {
    "id": "tc_clube_dos_80_25",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_clube_dos_80_25"
    ],
    "sort_order": 273
  },
  {
    "id": "tc_copo_meio_cheio_15",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_copo_meio_cheio_15"
    ],
    "sort_order": 274
  },
  {
    "id": "tc_julgamento_popular_20",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_julgamento_popular_20"
    ],
    "sort_order": 275
  },
  {
    "id": "tc_apelacao_negada_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_apelacao_negada_10"
    ],
    "sort_order": 276
  },
  {
    "id": "tc_fundo_da_internet_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_fundo_da_internet_5"
    ],
    "sort_order": 277
  },
  {
    "id": "tc_eu_gostei_importa_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_eu_gostei_importa_10"
    ],
    "sort_order": 278
  },
  {
    "id": "tc_desculpe_senhor_juiz_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_desculpe_senhor_juiz_5"
    ],
    "sort_order": 279
  },
  {
    "id": "tc_reu_culpado_3_a_1_15",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_reu_culpado_3_a_1_15"
    ],
    "sort_order": 280
  },
  {
    "id": "tc_100_aprovacao_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_100_aprovacao_3"
    ],
    "sort_order": 281
  },
  {
    "id": "tc_metacritica_sem_alma_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_metacritica_sem_alma_10"
    ],
    "sort_order": 282
  },
  {
    "id": "tc_bomba_atomica_submarina_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_bomba_atomica_submarina_3"
    ],
    "sort_order": 283
  },
  {
    "id": "tc_nem_minha_mae_conhece_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_nem_minha_mae_conhece_10"
    ],
    "sort_order": 284
  },
  {
    "id": "tc_melhor_filme_vai_para_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_melhor_filme_vai_para_5"
    ],
    "sort_order": 285
  },
  {
    "id": "tc_amados_por_todos_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_amados_por_todos_10"
    ],
    "sort_order": 286
  },
  {
    "id": "tc_regua_mais_fina_50",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_regua_mais_fina_50"
    ],
    "sort_order": 287
  },
  {
    "id": "tc_inimigo_criticos_intelectuais_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_inimigo_criticos_intelectuais_10"
    ],
    "sort_order": 288
  },
  {
    "id": "tc_grande_jurado_massas_40",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_grande_jurado_massas_40"
    ],
    "sort_order": 289
  },
  {
    "id": "tc_arquivo_obscuro_sonhos_15",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_arquivo_obscuro_sonhos_15"
    ],
    "sort_order": 290
  },
  {
    "id": "tc_desacato_autoridade_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_desacato_autoridade_10"
    ],
    "sort_order": 291
  },
  {
    "id": "tc_checkpoint_777_7",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
    "tier": "mythic",
    "title": "Tribunal da Crítica: Checkpoint 777 (O Número da Sorte do Tribunal)",
    "description": "Conquistar 3 filmes onde TODAS as 4 notas estejam no intervalo do 7: Minha Nota (7.000–7.999), IMDb (7.0–7.9), Rotten Tomatoes (70%–79%) e Metacritic (70–79).",
    "icon": "🎰",
    "target_type": "critic_tribunal_rule",
    "target_value": 3,
    "target_metadata": {
      "ruleKey": "checkpoint_777"
    },
    "legacy_ids": [
      "tc_checkpoint_777_7"
    ],
    "sort_order": 292
  },
  {
    "id": "tc_olimpo_9800_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_olimpo_9800_3"
    ],
    "sort_order": 293
  },
  {
    "id": "tc_unanimidade_absoluta_20",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_unanimidade_absoluta_20"
    ],
    "sort_order": 294
  },
  {
    "id": "tc_arqueologo_supremo_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_arqueologo_supremo_10"
    ],
    "sort_order": 295
  },
  {
    "id": "tc_hybrid_vergonha_franca_1",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica",
      "volta_ao_mundo"
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
    "legacy_ids": [
      "tc_hybrid_vergonha_franca_1"
    ],
    "sort_order": 296
  },
  {
    "id": "tc_hybrid_no_more_mutants_1",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_no_more_mutants_1"
    ],
    "sort_order": 297
  },
  {
    "id": "tc_hybrid_papai_noel_bom_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_papai_noel_bom_3"
    ],
    "sort_order": 298
  },
  {
    "id": "tc_hybrid_game_over_orgulho_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_game_over_orgulho_3"
    ],
    "sort_order": 299
  },
  {
    "id": "tc_hybrid_rir_coisa_seria_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_rir_coisa_seria_5"
    ],
    "sort_order": 300
  },
  {
    "id": "tc_hybrid_sexta_13_baixo_orcamento_2",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_sexta_13_baixo_orcamento_2"
    ],
    "sort_order": 301
  },
  {
    "id": "tc_hybrid_tribunal_estrangeiro_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_tribunal_estrangeiro_5"
    ],
    "sort_order": 302
  },
  {
    "id": "tc_hybrid_brasil_mundo_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_brasil_mundo_5"
    ],
    "sort_order": 303
  },
  {
    "id": "tc_hybrid_gravado_meu_bairro_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_gravado_meu_bairro_5"
    ],
    "sort_order": 304
  },
  {
    "id": "tc_hybrid_a24_acima_8_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_a24_acima_8_5"
    ],
    "sort_order": 305
  },
  {
    "id": "tc_hybrid_oscar_baixo_reviews_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_oscar_baixo_reviews_5"
    ],
    "sort_order": 306
  },
  {
    "id": "tc_hybrid_agosto_ouro_15",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_agosto_ouro_15"
    ],
    "sort_order": 307
  },
  {
    "id": "tc_hybrid_gore_rt_90_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_gore_rt_90_3"
    ],
    "sort_order": 308
  },
  {
    "id": "tc_hybrid_musica_nota_9_3",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica",
      "anatomia_cinema"
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
    "legacy_ids": [
      "tc_hybrid_musica_nota_9_3"
    ],
    "sort_order": 309
  },
  {
    "id": "tc_hybrid_paradoxo_shyamalan_2",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_paradoxo_shyamalan_2"
    ],
    "sort_order": 310
  },
  {
    "id": "tc_hybrid_marvel_dc_acima_85_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_marvel_dc_acima_85_10"
    ],
    "sort_order": 311
  },
  {
    "id": "tc_hybrid_stephen_king_juiz_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_stephen_king_juiz_5"
    ],
    "sort_order": 312
  },
  {
    "id": "tc_hybrid_juiz_juri_carrasco_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_juiz_juri_carrasco_5"
    ],
    "sort_order": 313
  },
  {
    "id": "tc_hybrid_medo_bom_terror_20",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_medo_bom_terror_20"
    ],
    "sort_order": 314
  },
  {
    "id": "tc_hybrid_chorei_certeza_15",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_chorei_certeza_15"
    ],
    "sort_order": 315
  },
  {
    "id": "tc_hybrid_brazil_devastated_3",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_brazil_devastated_3"
    ],
    "sort_order": 316
  },
  {
    "id": "tc_hybrid_nerd_canto_oscar_20",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_nerd_canto_oscar_20"
    ],
    "sort_order": 317
  },
  {
    "id": "tc_hybrid_final_epico_nota_9_15",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_final_epico_nota_9_15"
    ],
    "sort_order": 318
  },
  {
    "id": "tc_hybrid_animacao_aula_adulto_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_animacao_aula_adulto_10"
    ],
    "sort_order": 319
  },
  {
    "id": "tc_hybrid_gema_escondida_mapa_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_gema_escondida_mapa_10"
    ],
    "sort_order": 320
  },
  {
    "id": "tc_hybrid_blumhouse_terror_suspense_5",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_blumhouse_terror_suspense_5"
    ],
    "sort_order": 321
  },
  {
    "id": "tc_hybrid_dezembro_gala_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_dezembro_gala_10"
    ],
    "sort_order": 322
  },
  {
    "id": "tc_hybrid_desmascarando_top250_3",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "dna_cinefilo",
      "tribunal_critica"
    ],
    "tier": "gold",
    "title": "Tribunal da Crítica: Nem Todo Top 250 Me Engana! (Desmascarando o IMDb)",
    "description": "Conquistar 1 filme com a tag TOP250 ao qual você deu Minha Nota abaixo de 7.500.",
    "icon": "🎭",
    "target_type": "critic_tribunal_rule",
    "target_value": 1,
    "target_metadata": {
      "ruleKey": "top250_ur_lt_7500",
      "isHybrid": true
    },
    "legacy_ids": [
      "tc_hybrid_desmascarando_top250_3"
    ],
    "sort_order": 323
  },
  {
    "id": "tc_hybrid_oasis_deserto_terror_10",
    "kind": "unique",
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
    "legacy_ids": [
      "tc_hybrid_oasis_deserto_terror_10"
    ],
    "sort_order": 324
  },
  {
    "id": "tc_hybrid_obras_primas_15_paises_15",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "volta_ao_mundo",
      "tribunal_critica"
    ],
    "tier": "gold",
    "title": "Tribunal da Crítica: Obras-Primas dos Quatro Cantos do Planeta",
    "description": "Conquistar 15 filmes de 15 países diferentes no Desafio dos 195 (país de origem único, excluindo os EUA) que tenham Minha Nota igual ou superior a 8.500 (15 países).",
    "icon": "🌐",
    "target_type": "hybrid_15_countries_masterpieces",
    "target_value": 15,
    "target_metadata": {
      "minRating": 8.5,
      "isHybrid": true
    },
    "legacy_ids": [
      "tc_hybrid_obras_primas_15_paises_15"
    ],
    "sort_order": 325
  },
  {
    "id": "tc_hybrid_orgulho_aclamado_lgbt_10",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica",
      "dna_cinefilo",
      "anatomia_cinema"
    ],
    "tier": "gold",
    "title": "Tribunal da Crítica: Orgulho Aclamado pela Crítica e pelo Meu Coração",
    "description": "Conquistar 10 filmes do gênero Drama ou Romance com a tag Personagem LGBT e Minha Nota acima de 8.500.",
    "icon": "🌈",
    "target_type": "critic_tribunal_rule",
    "target_value": 10,
    "target_metadata": {
      "ruleKey": "lgbt_drama_romance_ur_gt_8500_rt_gt_80",
      "isHybrid": true
    },
    "legacy_ids": [
      "tc_hybrid_orgulho_aclamado_lgbt_10"
    ],
    "sort_order": 326
  },
  {
    "id": "tc_hybrid_elite_mafia_oscar_15",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "mafia_hollywood",
      "tribunal_critica"
    ],
    "tier": "gold",
    "title": "Tribunal da Crítica: A Elite da Academia (Favoritos do Oscar!)",
    "description": "Conquistar 15 filmes Ganhadores do Oscar que receberam Minha Nota igual ou superior a 9.000.",
    "icon": "🎩",
    "target_type": "critic_tribunal_rule",
    "target_value": 15,
    "target_metadata": {
      "ruleKey": "oscar_winner_ur_gte_9000",
      "isHybrid": true
    },
    "legacy_ids": [
      "tc_hybrid_elite_mafia_oscar_15"
    ],
    "sort_order": 327
  },
  {
    "id": "tc_hybrid_curador_joias_raras_15",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica",
      "volta_ao_mundo",
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Tribunal da Crítica: Curador Mundial de Joias Raras",
    "description": "Conquistar 15 filmes raros (< 50.000 Global Reviews e Minha Nota >= 8.500), com uma tag distinta para cada filme e cobrindo 8+ países únicos no Desafio dos 195.",
    "icon": "💎",
    "target_type": "hybrid_curador_joias_raras",
    "target_value": 15,
    "target_metadata": {
      "maxReviews": 50000,
      "minRating": 8.5,
      "minCountries": 8,
      "isHybrid": true
    },
    "legacy_ids": [
      "tc_hybrid_curador_joias_raras_15"
    ],
    "sort_order": 328
  },
  {
    "id": "tc_suprema_corte_plat",
    "kind": "platinum",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
    "tier": "platinum",
    "title": "Tribunal da Crítica: A Suprema Corte do Cinema",
    "description": "Conquistar 100% dos troféus e ranks da categoria Tribunal da Crítica (incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 82,
    "target_metadata": {
      "category": "tribunal_critica",
      "categoryScope": "tribunal_critica"
    },
    "legacy_ids": [
      "tc_suprema_corte_plat"
    ],
    "sort_order": 329
  },
  {
    "id": "tc_achou_errado_rt_lt40_ur_gte80_5",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_achou_errado_rt_lt40_ur_gte80_5"
    ],
    "sort_order": 330
  },
  {
    "id": "tc_666_sessao_do_capeta",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_666_sessao_do_capeta"
    ],
    "sort_order": 331
  },
  {
    "id": "tc_333_o_meio_besta",
    "kind": "unique",
    "category": "tribunal_critica",
    "categories": [
      "tribunal_critica"
    ],
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
    "legacy_ids": [
      "tc_333_o_meio_besta"
    ],
    "sort_order": 332
  },
  {
    "id": "rc_rank_cinema",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: VIP do Balcão de Pipoca (Cinema)",
    "description": "Filmes assistidos no Cinema.",
    "icon": "🎟️",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 60,
    "target_metadata": {
      "ruleKey": "cinema_count"
    },
    "ranks": [
      {
        "id": "rc_rank_cinema__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "Saindo de Casa!",
        "description": "Filmes assistidos no Cinema. (Rank Bronze: meta 5).",
        "legacy_id": "rc_bronze_cinema_15"
      },
      {
        "id": "rc_rank_cinema__silver",
        "tier": "silver",
        "target_value": 15,
        "title": "Não Vão Pegar Meu Celular!!",
        "description": "Filmes assistidos no Cinema. (Rank Prata: meta 15).",
        "legacy_id": "rc_silver_cinema_30"
      },
      {
        "id": "rc_rank_cinema__epic",
        "tier": "epic",
        "target_value": 30,
        "title": "Sócio de Carteirinha da Sala Escura",
        "description": "Filmes assistidos no Cinema. (Rank Épico: meta 30).",
        "legacy_id": "rc_epic_cinema_50"
      },
      {
        "id": "rc_rank_cinema__gold",
        "tier": "gold",
        "target_value": 45,
        "title": "Poltrona Cativa no IMAX",
        "description": "Filmes assistidos no Cinema. (Rank Ouro: meta 45).",
        "legacy_id": "rc_gold_cinema_75"
      },
      {
        "id": "rc_rank_cinema__mythic",
        "tier": "mythic",
        "target_value": 60,
        "title": "VIP do Balcão de Pipoca (60 Sessões)",
        "description": "Filmes assistidos no Cinema. (Rank Mítico: meta 60)."
      }
    ],
    "legacy_ids": [
      "rc_bronze_cinema_15",
      "rc_silver_cinema_30",
      "rc_epic_cinema_50",
      "rc_gold_cinema_75"
    ],
    "sort_order": 333
  },
  {
    "id": "rc_rank_audio_original",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Mestre do Idioma Nativo (Original)",
    "description": "Filmes assistidos no idioma Original.",
    "icon": "👶",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "audio_original_count"
    },
    "ranks": [
      {
        "id": "rc_rank_audio_original__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "O Ritual do Cinéfilo: Mestre do Idioma Nativo (Original) • Rank Bronze",
        "description": "Filmes assistidos no idioma Original. (Rank Bronze: meta 3).",
        "legacy_id": "rc_bronze_original_5"
      },
      {
        "id": "rc_rank_audio_original__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "O Ritual do Cinéfilo: Mestre do Idioma Nativo (Original) • Rank Prata",
        "description": "Filmes assistidos no idioma Original. (Rank Prata: meta 8).",
        "legacy_id": "rc_silver_original_15"
      },
      {
        "id": "rc_rank_audio_original__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "O Ritual do Cinéfilo: Mestre do Idioma Nativo (Original) • Rank Épico",
        "description": "Filmes assistidos no idioma Original. (Rank Épico: meta 15).",
        "legacy_id": "rc_epic_original_30"
      },
      {
        "id": "rc_rank_audio_original__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "O Ritual do Cinéfilo: Mestre do Idioma Nativo (Original) • Rank Ouro",
        "description": "Filmes assistidos no idioma Original. (Rank Ouro: meta 22)."
      },
      {
        "id": "rc_rank_audio_original__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "O Ritual do Cinéfilo: Mestre do Idioma Nativo (Original) • Rank Mítico",
        "description": "Filmes assistidos no idioma Original. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "rc_bronze_original_5",
      "rc_silver_original_15",
      "rc_epic_original_30"
    ],
    "sort_order": 334
  },
  {
    "id": "rc_rank_midia_fisica",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Curador de Estante (Mídia Física Vive!)",
    "description": "Filmes assistidos em Blu-ray ou DVD.",
    "icon": "💿",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 60,
    "target_metadata": {
      "ruleKey": "physical_media_count"
    },
    "ranks": [
      {
        "id": "rc_rank_midia_fisica__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "O Ritual do Cinéfilo: Curador de Estante (Mídia Física Vive!) • Rank Bronze",
        "description": "Filmes assistidos em Blu-ray ou DVD. (Rank Bronze: meta 5).",
        "legacy_id": "rc_bronze_midia_fisica_10"
      },
      {
        "id": "rc_rank_midia_fisica__silver",
        "tier": "silver",
        "target_value": 15,
        "title": "O Ritual do Cinéfilo: Curador de Estante (Mídia Física Vive!) • Rank Prata",
        "description": "Filmes assistidos em Blu-ray ou DVD. (Rank Prata: meta 15).",
        "legacy_id": "rc_silver_midia_fisica_35"
      },
      {
        "id": "rc_rank_midia_fisica__epic",
        "tier": "epic",
        "target_value": 30,
        "title": "O Ritual do Cinéfilo: Curador de Estante (Mídia Física Vive!) • Rank Épico",
        "description": "Filmes assistidos em Blu-ray ou DVD. (Rank Épico: meta 30).",
        "legacy_id": "rc_epic_midia_fisica_60"
      },
      {
        "id": "rc_rank_midia_fisica__gold",
        "tier": "gold",
        "target_value": 45,
        "title": "O Ritual do Cinéfilo: Curador de Estante (Mídia Física Vive!) • Rank Ouro",
        "description": "Filmes assistidos em Blu-ray ou DVD. (Rank Ouro: meta 45)."
      },
      {
        "id": "rc_rank_midia_fisica__mythic",
        "tier": "mythic",
        "target_value": 60,
        "title": "O Ritual do Cinéfilo: Curador de Estante (Mídia Física Vive!) • Rank Mítico",
        "description": "Filmes assistidos em Blu-ray ou DVD. (Rank Mítico: meta 60)."
      }
    ],
    "legacy_ids": [
      "rc_bronze_midia_fisica_10",
      "rc_silver_midia_fisica_35",
      "rc_epic_midia_fisica_60"
    ],
    "sort_order": 335
  },
  {
    "id": "rc_rank_youtube",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: O YouTube Passa Filme Inteiro?!",
    "description": "Filmes assistidos no YouTube.",
    "icon": "▶️",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "youtube_count"
    },
    "ranks": [
      {
        "id": "rc_rank_youtube__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "O Ritual do Cinéfilo: O YouTube Passa Filme Inteiro?! • Rank Bronze",
        "description": "Filmes assistidos no YouTube. (Rank Bronze: meta 3).",
        "legacy_id": "rc_bronze_youtube_10"
      },
      {
        "id": "rc_rank_youtube__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "O Ritual do Cinéfilo: O YouTube Passa Filme Inteiro?! • Rank Prata",
        "description": "Filmes assistidos no YouTube. (Rank Prata: meta 8).",
        "legacy_id": "rc_silver_youtube_25"
      },
      {
        "id": "rc_rank_youtube__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "O Ritual do Cinéfilo: O YouTube Passa Filme Inteiro?! • Rank Épico",
        "description": "Filmes assistidos no YouTube. (Rank Épico: meta 15)."
      },
      {
        "id": "rc_rank_youtube__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "O Ritual do Cinéfilo: O YouTube Passa Filme Inteiro?! • Rank Ouro",
        "description": "Filmes assistidos no YouTube. (Rank Ouro: meta 22)."
      },
      {
        "id": "rc_rank_youtube__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "O Ritual do Cinéfilo: O YouTube Passa Filme Inteiro?! • Rank Mítico",
        "description": "Filmes assistidos no YouTube. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "rc_bronze_youtube_10",
      "rc_silver_youtube_25"
    ],
    "sort_order": 336
  },
  {
    "id": "rc_rank_dublado",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Versão Brasileira: Herbert Richers!",
    "description": "Filmes assistidos com áudio Dublado.",
    "icon": "🎙️",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 250,
    "target_metadata": {
      "ruleKey": "audio_dublado_count"
    },
    "ranks": [
      {
        "id": "rc_rank_dublado__bronze",
        "tier": "bronze",
        "target_value": 25,
        "title": "O Ritual do Cinéfilo: Versão Brasileira: Herbert Richers! • Rank Bronze",
        "description": "Filmes assistidos com áudio Dublado. (Rank Bronze: meta 25).",
        "legacy_id": "rc_bronze_dublado_50"
      },
      {
        "id": "rc_rank_dublado__silver",
        "tier": "silver",
        "target_value": 75,
        "title": "O Ritual do Cinéfilo: Versão Brasileira: Herbert Richers! • Rank Prata",
        "description": "Filmes assistidos com áudio Dublado. (Rank Prata: meta 75).",
        "legacy_id": "rc_silver_dublado_150"
      },
      {
        "id": "rc_rank_dublado__epic",
        "tier": "epic",
        "target_value": 125,
        "title": "O Ritual do Cinéfilo: Versão Brasileira: Herbert Richers! • Rank Épico",
        "description": "Filmes assistidos com áudio Dublado. (Rank Épico: meta 125).",
        "legacy_id": "rc_epic_dublado_300"
      },
      {
        "id": "rc_rank_dublado__gold",
        "tier": "gold",
        "target_value": 185,
        "title": "O Ritual do Cinéfilo: Versão Brasileira: Herbert Richers! • Rank Ouro",
        "description": "Filmes assistidos com áudio Dublado. (Rank Ouro: meta 185)."
      },
      {
        "id": "rc_rank_dublado__mythic",
        "tier": "mythic",
        "target_value": 250,
        "title": "O Ritual do Cinéfilo: Versão Brasileira: Herbert Richers! • Rank Mítico",
        "description": "Filmes assistidos com áudio Dublado. (Rank Mítico: meta 250)."
      }
    ],
    "legacy_ids": [
      "rc_bronze_dublado_50",
      "rc_silver_dublado_150",
      "rc_epic_dublado_300"
    ],
    "sort_order": 337
  },
  {
    "id": "rc_rank_legendado",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Leitor Ninja (Legendado)",
    "description": "Filmes assistidos com áudio Legendado.",
    "icon": "📖",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 150,
    "target_metadata": {
      "ruleKey": "audio_legendado_count"
    },
    "ranks": [
      {
        "id": "rc_rank_legendado__bronze",
        "tier": "bronze",
        "target_value": 15,
        "title": "O Ritual do Cinéfilo: Leitor Ninja (Legendado) • Rank Bronze",
        "description": "Filmes assistidos com áudio Legendado. (Rank Bronze: meta 15).",
        "legacy_id": "rc_bronze_legendado_30"
      },
      {
        "id": "rc_rank_legendado__silver",
        "tier": "silver",
        "target_value": 40,
        "title": "O Ritual do Cinéfilo: Leitor Ninja (Legendado) • Rank Prata",
        "description": "Filmes assistidos com áudio Legendado. (Rank Prata: meta 40).",
        "legacy_id": "rc_silver_legendado_90"
      },
      {
        "id": "rc_rank_legendado__epic",
        "tier": "epic",
        "target_value": 75,
        "title": "O Ritual do Cinéfilo: Leitor Ninja (Legendado) • Rank Épico",
        "description": "Filmes assistidos com áudio Legendado. (Rank Épico: meta 75).",
        "legacy_id": "rc_epic_legendado_150"
      },
      {
        "id": "rc_rank_legendado__gold",
        "tier": "gold",
        "target_value": 110,
        "title": "O Ritual do Cinéfilo: Leitor Ninja (Legendado) • Rank Ouro",
        "description": "Filmes assistidos com áudio Legendado. (Rank Ouro: meta 110)."
      },
      {
        "id": "rc_rank_legendado__mythic",
        "tier": "mythic",
        "target_value": 150,
        "title": "O Ritual do Cinéfilo: Leitor Ninja (Legendado) • Rank Mítico",
        "description": "Filmes assistidos com áudio Legendado. (Rank Mítico: meta 150)."
      }
    ],
    "legacy_ids": [
      "rc_bronze_legendado_30",
      "rc_silver_legendado_90",
      "rc_epic_legendado_150"
    ],
    "sort_order": 338
  },
  {
    "id": "rc_rank_lancamento_mesmo_ano",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Acabou de Sair do Forno!",
    "description": "Filmes onde o Ano de Lançamento e o Ano Visto são iguais.",
    "icon": "🆕",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 50,
    "target_metadata": {
      "ruleKey": "same_year_seen_release"
    },
    "ranks": [
      {
        "id": "rc_rank_lancamento_mesmo_ano__bronze",
        "tier": "bronze",
        "target_value": 5,
        "title": "O Ritual do Cinéfilo: Acabou de Sair do Forno! • Rank Bronze",
        "description": "Filmes onde o Ano de Lançamento e o Ano Visto são iguais. (Rank Bronze: meta 5).",
        "legacy_id": "rc_bronze_lancamento_mesmo_ano_10"
      },
      {
        "id": "rc_rank_lancamento_mesmo_ano__silver",
        "tier": "silver",
        "target_value": 12,
        "title": "O Ritual do Cinéfilo: Acabou de Sair do Forno! • Rank Prata",
        "description": "Filmes onde o Ano de Lançamento e o Ano Visto são iguais. (Rank Prata: meta 12).",
        "legacy_id": "rc_silver_lancamento_mesmo_ano_30"
      },
      {
        "id": "rc_rank_lancamento_mesmo_ano__epic",
        "tier": "epic",
        "target_value": 25,
        "title": "O Ritual do Cinéfilo: Acabou de Sair do Forno! • Rank Épico",
        "description": "Filmes onde o Ano de Lançamento e o Ano Visto são iguais. (Rank Épico: meta 25).",
        "legacy_id": "rc_epic_lancamento_mesmo_ano_60"
      },
      {
        "id": "rc_rank_lancamento_mesmo_ano__gold",
        "tier": "gold",
        "target_value": 38,
        "title": "O Ritual do Cinéfilo: Acabou de Sair do Forno! • Rank Ouro",
        "description": "Filmes onde o Ano de Lançamento e o Ano Visto são iguais. (Rank Ouro: meta 38)."
      },
      {
        "id": "rc_rank_lancamento_mesmo_ano__mythic",
        "tier": "mythic",
        "target_value": 50,
        "title": "O Ritual do Cinéfilo: Acabou de Sair do Forno! • Rank Mítico",
        "description": "Filmes onde o Ano de Lançamento e o Ano Visto são iguais. (Rank Mítico: meta 50)."
      }
    ],
    "legacy_ids": [
      "rc_bronze_lancamento_mesmo_ano_10",
      "rc_silver_lancamento_mesmo_ano_30",
      "rc_epic_lancamento_mesmo_ano_60"
    ],
    "sort_order": 339
  },
  {
    "id": "rc_rank_duracao_gt_180",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Haja Bexiga! (+3 Horas)",
    "description": "Filmes com mais de 180 minutos de duração.",
    "icon": "⏳",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 20,
    "target_metadata": {
      "ruleKey": "runtime_gt_180"
    },
    "ranks": [
      {
        "id": "rc_rank_duracao_gt_180__bronze",
        "tier": "bronze",
        "target_value": 2,
        "title": "O Ritual do Cinéfilo: Haja Bexiga! (+3 Horas) • Rank Bronze",
        "description": "Filmes com mais de 180 minutos de duração. (Rank Bronze: meta 2).",
        "legacy_id": "rc_silver_duracao_gt_180_3"
      },
      {
        "id": "rc_rank_duracao_gt_180__silver",
        "tier": "silver",
        "target_value": 5,
        "title": "O Ritual do Cinéfilo: Haja Bexiga! (+3 Horas) • Rank Prata",
        "description": "Filmes com mais de 180 minutos de duração. (Rank Prata: meta 5).",
        "legacy_id": "rc_epic_duracao_gt_180_10"
      },
      {
        "id": "rc_rank_duracao_gt_180__epic",
        "tier": "epic",
        "target_value": 10,
        "title": "O Ritual do Cinéfilo: Haja Bexiga! (+3 Horas) • Rank Épico",
        "description": "Filmes com mais de 180 minutos de duração. (Rank Épico: meta 10)."
      },
      {
        "id": "rc_rank_duracao_gt_180__gold",
        "tier": "gold",
        "target_value": 15,
        "title": "O Ritual do Cinéfilo: Haja Bexiga! (+3 Horas) • Rank Ouro",
        "description": "Filmes com mais de 180 minutos de duração. (Rank Ouro: meta 15)."
      },
      {
        "id": "rc_rank_duracao_gt_180__mythic",
        "tier": "mythic",
        "target_value": 20,
        "title": "O Ritual do Cinéfilo: Haja Bexiga! (+3 Horas) • Rank Mítico",
        "description": "Filmes com mais de 180 minutos de duração. (Rank Mítico: meta 20)."
      }
    ],
    "legacy_ids": [
      "rc_silver_duracao_gt_180_3",
      "rc_epic_duracao_gt_180_10"
    ],
    "sort_order": 340
  },
  {
    "id": "rc_rank_streaming_livre",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: A Frota Negra do Streaming Livre",
    "description": "Filmes assistidos na Internet ou My Family Cine.",
    "icon": "🏴‍☠️",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 200,
    "target_metadata": {
      "ruleKey": "internet_or_mfc_count"
    },
    "ranks": [
      {
        "id": "rc_rank_streaming_livre__bronze",
        "tier": "bronze",
        "target_value": 20,
        "title": "O Ritual do Cinéfilo: A Frota Negra do Streaming Livre • Rank Bronze",
        "description": "Filmes assistidos na Internet ou My Family Cine. (Rank Bronze: meta 20).",
        "legacy_id": "rc_epic_pirata_jack_sparrow_50"
      },
      {
        "id": "rc_rank_streaming_livre__silver",
        "tier": "silver",
        "target_value": 50,
        "title": "O Ritual do Cinéfilo: A Frota Negra do Streaming Livre • Rank Prata",
        "description": "Filmes assistidos na Internet ou My Family Cine. (Rank Prata: meta 50).",
        "legacy_id": "rc_gold_streaming_livre_100"
      },
      {
        "id": "rc_rank_streaming_livre__epic",
        "tier": "epic",
        "target_value": 100,
        "title": "O Ritual do Cinéfilo: A Frota Negra do Streaming Livre • Rank Épico",
        "description": "Filmes assistidos na Internet ou My Family Cine. (Rank Épico: meta 100)."
      },
      {
        "id": "rc_rank_streaming_livre__gold",
        "tier": "gold",
        "target_value": 150,
        "title": "O Ritual do Cinéfilo: A Frota Negra do Streaming Livre • Rank Ouro",
        "description": "Filmes assistidos na Internet ou My Family Cine. (Rank Ouro: meta 150)."
      },
      {
        "id": "rc_rank_streaming_livre__mythic",
        "tier": "mythic",
        "target_value": 200,
        "title": "O Ritual do Cinéfilo: A Frota Negra do Streaming Livre • Rank Mítico",
        "description": "Filmes assistidos na Internet ou My Family Cine. (Rank Mítico: meta 200)."
      }
    ],
    "legacy_ids": [
      "rc_epic_pirata_jack_sparrow_50",
      "rc_gold_streaming_livre_100"
    ],
    "sort_order": 341
  },
  {
    "id": "rc_rank_minutos_totais",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Maratonista Interminável (1.000 Horas)",
    "description": "Acumular minutos assistidos no catálogo (teto de 60.000 minutos / 1.000 horas).",
    "icon": "⌛",
    "target_type": "ritual_total_minutos",
    "target_value": 60000,
    "target_metadata": {
      "targetMinutes": 30000
    },
    "ranks": [
      {
        "id": "rc_rank_minutos_totais__bronze",
        "tier": "bronze",
        "target_value": 5000,
        "title": "O Ritual do Cinéfilo: Maratonista Interminável (1.000 Horas) • Rank Bronze",
        "description": "Acumular minutos assistidos no catálogo (teto de 60.000 minutos / 1.000 horas). (Rank Bronze: meta 5.000).",
        "legacy_id": "rc_gold_minutos_totais_30k"
      },
      {
        "id": "rc_rank_minutos_totais__silver",
        "tier": "silver",
        "target_value": 15000,
        "title": "O Ritual do Cinéfilo: Maratonista Interminável (1.000 Horas) • Rank Prata",
        "description": "Acumular minutos assistidos no catálogo (teto de 60.000 minutos / 1.000 horas). (Rank Prata: meta 15.000).",
        "legacy_id": "rc_mythic_maratonista_60k"
      },
      {
        "id": "rc_rank_minutos_totais__epic",
        "tier": "epic",
        "target_value": 30000,
        "title": "O Ritual do Cinéfilo: Maratonista Interminável (1.000 Horas) • Rank Épico",
        "description": "Acumular minutos assistidos no catálogo (teto de 60.000 minutos / 1.000 horas). (Rank Épico: meta 30.000)."
      },
      {
        "id": "rc_rank_minutos_totais__gold",
        "tier": "gold",
        "target_value": 45000,
        "title": "O Ritual do Cinéfilo: Maratonista Interminável (1.000 Horas) • Rank Ouro",
        "description": "Acumular minutos assistidos no catálogo (teto de 60.000 minutos / 1.000 horas). (Rank Ouro: meta 45.000)."
      },
      {
        "id": "rc_rank_minutos_totais__mythic",
        "tier": "mythic",
        "target_value": 60000,
        "title": "O Ritual do Cinéfilo: Maratonista Interminável (1.000 Horas) • Rank Mítico",
        "description": "Acumular minutos assistidos no catálogo (teto de 60.000 minutos / 1.000 horas). (Rank Mítico: meta 60.000)."
      }
    ],
    "legacy_ids": [
      "rc_gold_minutos_totais_30k",
      "rc_mythic_maratonista_60k"
    ],
    "sort_order": 342
  },
  {
    "id": "rc_rank_duracao_lte_60",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Dá pra Ver no Meu Almoço (<= 60 min)",
    "description": "Filmes com 60 minutos ou menos de duração.",
    "icon": "🥪",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "runtime_lte_60"
    },
    "ranks": [
      {
        "id": "rc_rank_duracao_lte_60__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "O Ritual do Cinéfilo: Dá pra Ver no Meu Almoço (<= 60 min) • Rank Bronze",
        "description": "Filmes com 60 minutos ou menos de duração. (Rank Bronze: meta 3).",
        "legacy_id": "rc_silver_duracao_lte_60_20"
      },
      {
        "id": "rc_rank_duracao_lte_60__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "O Ritual do Cinéfilo: Dá pra Ver no Meu Almoço (<= 60 min) • Rank Prata",
        "description": "Filmes com 60 minutos ou menos de duração. (Rank Prata: meta 8)."
      },
      {
        "id": "rc_rank_duracao_lte_60__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "O Ritual do Cinéfilo: Dá pra Ver no Meu Almoço (<= 60 min) • Rank Épico",
        "description": "Filmes com 60 minutos ou menos de duração. (Rank Épico: meta 15)."
      },
      {
        "id": "rc_rank_duracao_lte_60__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "O Ritual do Cinéfilo: Dá pra Ver no Meu Almoço (<= 60 min) • Rank Ouro",
        "description": "Filmes com 60 minutos ou menos de duração. (Rank Ouro: meta 22)."
      },
      {
        "id": "rc_rank_duracao_lte_60__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "O Ritual do Cinéfilo: Dá pra Ver no Meu Almoço (<= 60 min) • Rank Mítico",
        "description": "Filmes com 60 minutos ou menos de duração. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "rc_silver_duracao_lte_60_20"
    ],
    "sort_order": 343
  },
  {
    "id": "rc_rank_streaming_livre_mesmo_ano",
    "kind": "rank",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "mythic",
    "title": "O Ritual do Cinéfilo: Pesquei um Peixe Novinho!",
    "description": "Filmes assistidos no ano de lançamento via My Family Cine, Internet ou YouTube.",
    "icon": "🎣",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "free_streaming_same_year"
    },
    "ranks": [
      {
        "id": "rc_rank_streaming_livre_mesmo_ano__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "O Ritual do Cinéfilo: Pesquei um Peixe Novinho! • Rank Bronze",
        "description": "Filmes assistidos no ano de lançamento via My Family Cine, Internet ou YouTube. (Rank Bronze: meta 3).",
        "legacy_id": "rc_silver_streaming_livre_mesmo_ano_20"
      },
      {
        "id": "rc_rank_streaming_livre_mesmo_ano__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "O Ritual do Cinéfilo: Pesquei um Peixe Novinho! • Rank Prata",
        "description": "Filmes assistidos no ano de lançamento via My Family Cine, Internet ou YouTube. (Rank Prata: meta 8)."
      },
      {
        "id": "rc_rank_streaming_livre_mesmo_ano__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "O Ritual do Cinéfilo: Pesquei um Peixe Novinho! • Rank Épico",
        "description": "Filmes assistidos no ano de lançamento via My Family Cine, Internet ou YouTube. (Rank Épico: meta 15)."
      },
      {
        "id": "rc_rank_streaming_livre_mesmo_ano__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "O Ritual do Cinéfilo: Pesquei um Peixe Novinho! • Rank Ouro",
        "description": "Filmes assistidos no ano de lançamento via My Family Cine, Internet ou YouTube. (Rank Ouro: meta 22)."
      },
      {
        "id": "rc_rank_streaming_livre_mesmo_ano__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "O Ritual do Cinéfilo: Pesquei um Peixe Novinho! • Rank Mítico",
        "description": "Filmes assistidos no ano de lançamento via My Family Cine, Internet ou YouTube. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "rc_silver_streaming_livre_mesmo_ano_20"
    ],
    "sort_order": 344
  },
  {
    "id": "rc_bronze_curta_15min_10",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_curta_15min_10"
    ],
    "sort_order": 345
  },
  {
    "id": "rc_bronze_exato_120min_5",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_exato_120min_5"
    ],
    "sort_order": 346
  },
  {
    "id": "rc_bronze_youtube_legendado_5",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_youtube_legendado_5"
    ],
    "sort_order": 347
  },
  {
    "id": "rc_bronze_cinema_legendado_3",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_cinema_legendado_3"
    ],
    "sort_order": 348
  },
  {
    "id": "rc_bronze_ano_1994_5",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_ano_1994_5"
    ],
    "sort_order": 349
  },
  {
    "id": "rc_bronze_ano_2012_3",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_ano_2012_3"
    ],
    "sort_order": 350
  },
  {
    "id": "rc_bronze_anos_1920_1940_3",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_anos_1920_1940_3"
    ],
    "sort_order": 351
  },
  {
    "id": "rc_bronze_prime_video_mesmo_ano_10",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_bronze_prime_video_mesmo_ano_10"
    ],
    "sort_order": 352
  },
  {
    "id": "rc_silver_duracao_gt_150_10",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_duracao_gt_150_10"
    ],
    "sort_order": 353
  },
  {
    "id": "rc_silver_cinema_gt_150min_5",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_cinema_gt_150min_5"
    ],
    "sort_order": 354
  },
  {
    "id": "rc_silver_hbo_max_30",
    "kind": "unique",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "silver",
    "title": "O Ritual do Cinéfilo: Qual Era o Nome Mesmo? HBO, HBO Max ou Só Max?!",
    "description": "Conquistar 30 filmes assistidos na Max / HBO Max (30 filmes).",
    "icon": "💜",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 30,
    "target_metadata": {
      "ruleKey": "hbo_max_count"
    },
    "legacy_ids": [
      "rc_silver_hbo_max_30"
    ],
    "sort_order": 355
  },
  {
    "id": "rc_silver_netflix_50",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_netflix_50"
    ],
    "sort_order": 356
  },
  {
    "id": "rc_silver_internet_25",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_internet_25"
    ],
    "sort_order": 357
  },
  {
    "id": "rc_silver_esperar_streaming_30",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_esperar_streaming_30"
    ],
    "sort_order": 358
  },
  {
    "id": "rc_silver_antes_1994_30",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_antes_1994_30"
    ],
    "sort_order": 359
  },
  {
    "id": "rc_silver_antes_1958_10",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_antes_1958_10"
    ],
    "sort_order": 360
  },
  {
    "id": "rc_silver_bug_milenio_10",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_bug_milenio_10"
    ],
    "sort_order": 361
  },
  {
    "id": "rc_silver_decada_2010_30",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_silver_decada_2010_30"
    ],
    "sort_order": 362
  },
  {
    "id": "rc_epic_combo_streamings_oficiais_150",
    "kind": "unique",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "epic",
    "title": "O Ritual do Cinéfilo: Cinema em Casa (O Combo das Assinaturas)",
    "description": "Conquistar 150 filmes somados nas plataformas oficiais (Apple TV+, Disney+, Star+, Max / HBO Max, Netflix e Prime Video).",
    "icon": "🍿",
    "target_type": "ritual_cinefilo_rule",
    "target_value": 150,
    "target_metadata": {
      "ruleKey": "official_streaming_count"
    },
    "legacy_ids": [
      "rc_epic_combo_streamings_oficiais_150"
    ],
    "sort_order": 363
  },
  {
    "id": "rc_epic_capsula_tempo_30anos_15",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_epic_capsula_tempo_30anos_15"
    ],
    "sort_order": 364
  },
  {
    "id": "rc_epic_nomade_telas_8",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_epic_nomade_telas_8"
    ],
    "sort_order": 365
  },
  {
    "id": "rc_gold_petista_dinamico",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_gold_petista_dinamico"
    ],
    "sort_order": 366
  },
  {
    "id": "rc_plat_mestre_cabine",
    "kind": "platinum",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo"
    ],
    "tier": "platinum",
    "title": "O Ritual do Cinéfilo: O Mestre da Cabine de Projeção",
    "description": "Conquistar 100% dos troféus e ranks da categoria O Ritual do Cinéfilo (incluindo multicategoria).",
    "icon": "🏆",
    "target_type": "platinum_dynamic",
    "target_value": 57,
    "target_metadata": {
      "category": "ritual_cinefilo",
      "categoryScope": "ritual_cinefilo"
    },
    "legacy_ids": [
      "rc_plat_mestre_cabine"
    ],
    "sort_order": 367
  },
  {
    "id": "rc_ano_2001_11",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_ano_2001_11"
    ],
    "sort_order": 368
  },
  {
    "id": "rc_segunda_guerra_5",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_segunda_guerra_5"
    ],
    "sort_order": 369
  },
  {
    "id": "rc_todos_anos_vida_34",
    "kind": "unique",
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
    "legacy_ids": [
      "rc_todos_anos_vida_34"
    ],
    "sort_order": 370
  },
  {
    "id": "multi_rc_tc_pele_ii",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_tc_pele_ii"
    ],
    "sort_order": 371
  },
  {
    "id": "multi_rc_dl_nascimento_ago94",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_dl_nascimento_ago94"
    ],
    "sort_order": 372
  },
  {
    "id": "multi_rc_tc_cinema_nota_gt8_10",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_tc_cinema_nota_gt8_10"
    ],
    "sort_order": 373
  },
  {
    "id": "multi_rc_dl_ferias_cinema_10",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_dl_ferias_cinema_10"
    ],
    "sort_order": 374
  },
  {
    "id": "multi_rc_tc_midia_fisica_nota_gt8_15",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_tc_midia_fisica_nota_gt8_15"
    ],
    "sort_order": 375
  },
  {
    "id": "multi_rc_tc_pirata_indie_hidden_gem_10",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_tc_pirata_indie_hidden_gem_10"
    ],
    "sort_order": 376
  },
  {
    "id": "multi_rc_tc_gt180_nota_gt9_5",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_tc_gt180_nota_gt9_5"
    ],
    "sort_order": 377
  },
  {
    "id": "multi_rc_tc_reliquia_museu_pre1980_15",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_tc_reliquia_museu_pre1980_15"
    ],
    "sort_order": 378
  },
  {
    "id": "multi_rc_tc_celso_russomanno_30",
    "kind": "unique",
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
    "legacy_ids": [
      "multi_rc_tc_celso_russomanno_30"
    ],
    "sort_order": 379
  },
  {
    "id": "tc_achou_que_nao_ia_ter_cinema_fev_mar_set",
    "kind": "unique",
    "category": "ritual_cinefilo",
    "categories": [
      "ritual_cinefilo",
      "data_limite"
    ],
    "tier": "bronze",
    "title": "Achou que Não Ia Ter Cinema Hoje? Achou Errado, Otário!",
    "description": "Conquistar 3 filmes assistidos no Cinema durante os meses de Fevereiro, Março ou Setembro (3 filmes).",
    "icon": "🚐",
    "target_type": "cinema_specific_months_count",
    "target_value": 3,
    "target_metadata": {
      "months": [
        2,
        3,
        9
      ]
    },
    "legacy_ids": [
      "tc_achou_que_nao_ia_ter_cinema_fev_mar_set"
    ],
    "sort_order": 380
  },
  {
    "id": "multi_rank_non_us_oscar",
    "kind": "rank",
    "category": "mafia_hollywood",
    "categories": [
      "mafia_hollywood",
      "volta_ao_mundo"
    ],
    "tier": "mythic",
    "title": "Esse Ouro Eles Não Vão Roubar! (Oscar Fora dos EUA)",
    "description": "Filmes ganhadores do Oscar produzidos fora dos Estados Unidos.",
    "icon": "🌐",
    "target_type": "hybrid_non_us_oscar_winner",
    "target_value": 30,
    "target_metadata": {
      "excludeCountryCode": "us",
      "minWins": 1,
      "isHybrid": true
    },
    "ranks": [
      {
        "id": "multi_rank_non_us_oscar__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Esse Ouro Eles Não Vão Roubar! (Oscar Fora dos EUA) • Rank Bronze",
        "description": "Filmes ganhadores do Oscar produzidos fora dos Estados Unidos. (Rank Bronze: meta 3).",
        "legacy_id": "multi_non_us_oscar_5"
      },
      {
        "id": "multi_rank_non_us_oscar__silver",
        "tier": "silver",
        "target_value": 8,
        "title": "Esse Ouro Eles Não Vão Roubar! (Oscar Fora dos EUA) • Rank Prata",
        "description": "Filmes ganhadores do Oscar produzidos fora dos Estados Unidos. (Rank Prata: meta 8).",
        "legacy_id": "multi_non_us_oscar_15"
      },
      {
        "id": "multi_rank_non_us_oscar__epic",
        "tier": "epic",
        "target_value": 15,
        "title": "Esse Ouro Eles Não Vão Roubar! (Oscar Fora dos EUA) • Rank Épico",
        "description": "Filmes ganhadores do Oscar produzidos fora dos Estados Unidos. (Rank Épico: meta 15).",
        "legacy_id": "multi_non_us_oscar_30"
      },
      {
        "id": "multi_rank_non_us_oscar__gold",
        "tier": "gold",
        "target_value": 22,
        "title": "Esse Ouro Eles Não Vão Roubar! (Oscar Fora dos EUA) • Rank Ouro",
        "description": "Filmes ganhadores do Oscar produzidos fora dos Estados Unidos. (Rank Ouro: meta 22)."
      },
      {
        "id": "multi_rank_non_us_oscar__mythic",
        "tier": "mythic",
        "target_value": 30,
        "title": "Esse Ouro Eles Não Vão Roubar! (Oscar Fora dos EUA) • Rank Mítico",
        "description": "Filmes ganhadores do Oscar produzidos fora dos Estados Unidos. (Rank Mítico: meta 30)."
      }
    ],
    "legacy_ids": [
      "multi_non_us_oscar_5",
      "multi_non_us_oscar_15",
      "multi_non_us_oscar_30"
    ],
    "sort_order": 381
  },
  {
    "id": "multi_rank_short_oscar",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema",
      "mafia_hollywood"
    ],
    "tier": "mythic",
    "title": "Tão Rápido que Já Pegou o Ouro!",
    "description": "Curtas-metragens ganhadores de pelo menos 1 Oscar.",
    "icon": "⏱️",
    "target_type": "hybrid_genre_oscar_winner",
    "target_value": 10,
    "target_metadata": {
      "genre": "Curta",
      "minWins": 1,
      "isHybrid": true
    },
    "ranks": [
      {
        "id": "multi_rank_short_oscar__bronze",
        "tier": "bronze",
        "target_value": 1,
        "title": "Tão Rápido que Já Pegou o Ouro! • Rank Bronze",
        "description": "Curtas-metragens ganhadores de pelo menos 1 Oscar. (Rank Bronze: meta 1).",
        "legacy_id": "multi_short_oscar_5"
      },
      {
        "id": "multi_rank_short_oscar__silver",
        "tier": "silver",
        "target_value": 3,
        "title": "Tão Rápido que Já Pegou o Ouro! • Rank Prata",
        "description": "Curtas-metragens ganhadores de pelo menos 1 Oscar. (Rank Prata: meta 3)."
      },
      {
        "id": "multi_rank_short_oscar__epic",
        "tier": "epic",
        "target_value": 5,
        "title": "Tão Rápido que Já Pegou o Ouro! • Rank Épico",
        "description": "Curtas-metragens ganhadores de pelo menos 1 Oscar. (Rank Épico: meta 5)."
      },
      {
        "id": "multi_rank_short_oscar__gold",
        "tier": "gold",
        "target_value": 8,
        "title": "Tão Rápido que Já Pegou o Ouro! • Rank Ouro",
        "description": "Curtas-metragens ganhadores de pelo menos 1 Oscar. (Rank Ouro: meta 8)."
      },
      {
        "id": "multi_rank_short_oscar__mythic",
        "tier": "mythic",
        "target_value": 10,
        "title": "Tão Rápido que Já Pegou o Ouro! • Rank Mítico",
        "description": "Curtas-metragens ganhadores de pelo menos 1 Oscar. (Rank Mítico: meta 10)."
      }
    ],
    "legacy_ids": [
      "multi_short_oscar_5"
    ],
    "sort_order": 382
  },
  {
    "id": "multi_rank_romance_school",
    "kind": "rank",
    "category": "anatomia_cinema",
    "categories": [
      "anatomia_cinema",
      "dna_cinefilo"
    ],
    "tier": "mythic",
    "title": "Amor nos Corredores (Suspiros na Sala de Aula)",
    "description": "Filmes de Romance com a tag Colegio/Escola.",
    "icon": "🏫",
    "target_type": "hybrid_genre_tag",
    "target_value": 35,
    "target_metadata": {
      "genre": "Romance",
      "tag": "Colegio/Escola",
      "isHybrid": true
    },
    "ranks": [
      {
        "id": "multi_rank_romance_school__bronze",
        "tier": "bronze",
        "target_value": 3,
        "title": "Amor nos Corredores (Suspiros na Sala de Aula) • Rank Bronze",
        "description": "Filmes de Romance com a tag Colegio/Escola. (Rank Bronze: meta 3).",
        "legacy_id": "multi_romance_school_20"
      },
      {
        "id": "multi_rank_romance_school__silver",
        "tier": "silver",
        "target_value": 10,
        "title": "Amor nos Corredores (Suspiros na Sala de Aula) • Rank Prata",
        "description": "Filmes de Romance com a tag Colegio/Escola. (Rank Prata: meta 10)."
      },
      {
        "id": "multi_rank_romance_school__epic",
        "tier": "epic",
        "target_value": 18,
        "title": "Amor nos Corredores (Suspiros na Sala de Aula) • Rank Épico",
        "description": "Filmes de Romance com a tag Colegio/Escola. (Rank Épico: meta 18)."
      },
      {
        "id": "multi_rank_romance_school__gold",
        "tier": "gold",
        "target_value": 26,
        "title": "Amor nos Corredores (Suspiros na Sala de Aula) • Rank Ouro",
        "description": "Filmes de Romance com a tag Colegio/Escola. (Rank Ouro: meta 26)."
      },
      {
        "id": "multi_rank_romance_school__mythic",
        "tier": "mythic",
        "target_value": 35,
        "title": "Amor nos Corredores (Suspiros na Sala de Aula) • Rank Mítico",
        "description": "Filmes de Romance com a tag Colegio/Escola. (Rank Mítico: meta 35)."
      }
    ],
    "legacy_ids": [
      "multi_romance_school_20"
    ],
    "sort_order": 383
  },
  {
    "id": "multi_brazil_oscar_1",
    "kind": "unique",
    "category": "volta_ao_mundo",
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
    "legacy_ids": [
      "multi_brazil_oscar_1"
    ],
    "sort_order": 384
  },
  {
    "id": "multi_horror_oscar_1",
    "kind": "unique",
    "category": "anatomia_cinema",
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
    "legacy_ids": [
      "multi_horror_oscar_1"
    ],
    "sort_order": 385
  },
  {
    "id": "multi_blumhouse_october_3",
    "kind": "unique",
    "category": "mafia_hollywood",
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
    "legacy_ids": [
      "multi_blumhouse_october_3"
    ],
    "sort_order": 386
  },
  {
    "id": "multi_romance_lgbt_10",
    "kind": "unique",
    "category": "anatomia_cinema",
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
    "legacy_ids": [
      "multi_romance_lgbt_10"
    ],
    "sort_order": 387
  },
  {
    "id": "multi_pixar_cry_5",
    "kind": "unique",
    "category": "mafia_hollywood",
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
    "legacy_ids": [
      "multi_pixar_cry_5"
    ],
    "sort_order": 388
  },
  {
    "id": "multi_gore_twisted_lionsgate_5",
    "kind": "unique",
    "category": "mafia_hollywood",
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
    "legacy_ids": [
      "multi_gore_twisted_lionsgate_5"
    ],
    "sort_order": 389
  },
  {
    "id": "multi_disney_july_dec_5",
    "kind": "unique",
    "category": "mafia_hollywood",
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
    "legacy_ids": [
      "multi_disney_july_dec_5"
    ],
    "sort_order": 390
  },
  {
    "id": "multi_disney_fox_horror_5",
    "kind": "unique",
    "category": "mafia_hollywood",
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
    "legacy_ids": [
      "multi_disney_fox_horror_5"
    ],
    "sort_order": 391
  },
  {
    "id": "multi_top250_oscar_15",
    "kind": "unique",
    "category": "mafia_hollywood",
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
    "legacy_ids": [
      "multi_top250_oscar_15"
    ],
    "sort_order": 392
  },
  {
    "id": "multi_sk_oscar_5",
    "kind": "unique",
    "category": "dna_cinefilo",
    "categories": [
      "dna_cinefilo",
      "mafia_hollywood"
    ],
    "tier": "epic",
    "title": "Stephen King no Tapete Vermelho!",
    "description": "Conquistar 3 filmes com a tag SK (Stephen King) que foram Indicados ou Ganhadores do Oscar (3 filmes).",
    "icon": "🤡",
    "target_type": "hybrid_sk_oscar",
    "target_value": 3,
    "target_metadata": {
      "tag": "SK",
      "minNominationsOrWins": 1,
      "isHybrid": true
    },
    "legacy_ids": [
      "multi_sk_oscar_5"
    ],
    "sort_order": 393
  },
  {
    "id": "multi_dc_warner_vs_marvel_disney_30",
    "kind": "unique",
    "category": "mafia_hollywood",
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
    "legacy_ids": [
      "multi_dc_warner_vs_marvel_disney_30"
    ],
    "sort_order": 394
  },
  {
    "id": "multi_seven_deadly_sins_49",
    "kind": "unique",
    "category": "dna_cinefilo",
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
    "legacy_ids": [
      "multi_seven_deadly_sins_49"
    ],
    "sort_order": 395
  },
  {
    "id": "multi_michael_jackson_ultimate_anthology",
    "kind": "unique",
    "category": "anatomia_cinema",
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
    "legacy_ids": [
      "multi_michael_jackson_ultimate_anthology"
    ],
    "sort_order": 396
  }
];
export const CLIENT_TROPHY_DEFINITIONS = TROPHY_DEFINITIONS;
