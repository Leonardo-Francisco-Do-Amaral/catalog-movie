export const EQUIPPED_CLASS_STORAGE_KEY = 'cine_rpg_equipped_class_id';

export const POWER_TIER_META = {
  specialty: {
    key: 'specialty',
    badge: '★ ESPECIALIDADE DA CLASSE',
    shortBadge: '★ Especialidade',
    cardTone:
      'border-amber-400/70 bg-gradient-to-br from-amber-950/55 via-zinc-950 to-amber-950/35 shadow-[0_0_24px_rgba(245,158,11,0.2)]',
    badgeTone: 'bg-amber-400/20 text-amber-200 border-amber-300/65',
  },
  tactical: {
    key: 'tactical',
    badge: '◐ PODER TÁTICO',
    shortBadge: '◐ Tático',
    cardTone:
      'border-cyan-400/45 bg-gradient-to-br from-cyan-950/35 via-zinc-950 to-zinc-950',
    badgeTone: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/45',
  },
  support: {
    key: 'support',
    badge: '○ BÔNUS DE APOIO',
    shortBadge: '○ Apoio',
    cardTone: 'border-zinc-700/80 bg-zinc-950/85',
    badgeTone: 'bg-zinc-800/90 text-zinc-300 border-zinc-600/60',
  },
};

export const CLASS_POWER_MODE_META = {
  secret_draw: {
    key: 'secret_draw',
    icon: '🃏',
    label: 'Sessão Secreta',
    cooldownLabel: '1 uso / 15 dias',
    accentText: 'text-fuchsia-300',
  },
  chimera: {
    key: 'chimera',
    icon: '🧬',
    label: 'Quimera Cinéfila',
    cooldownLabel: '1 uso / 15 dias',
    accentText: 'text-emerald-300',
  },
  bingo: {
    key: 'bingo',
    icon: '📜',
    label: 'Pergaminhos da Guilda',
    cooldownLabel: '1 uso / mês',
    accentText: 'text-amber-300',
  },
};

export const CLASS_POWERS_BY_ID = {
  andarilho_setima_arte: {
    specialtyMode: 'bingo',
    powers: {
      secret_draw: {
        title: 'Passo de Camaleão',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🃏',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Prepara o próximo sorteio para abrir 7 cartas de uma vez na mesa (mantendo custo normal de 1 ficha).',
      },
      chimera: {
        title: 'Cantil de Estrada',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🧪',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Adiciona +2 Tags aleatórias extras na Quimera ativa para facilitar o encontro de um filme.',
      },
      bingo: {
        title: 'Mochila de Improviso',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🎒',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Reduz em -1 a meta do contrato escolhido na mesa (mín. 1) — ou reduz em -3 nos contadores altos.',
      },
    },
  },

  barbaro_imax: {
    specialtyMode: 'chimera',
    powers: {
      secret_draw: {
        title: 'Ingresso de Pipoca',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🍿',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'pick_card_or_buff',
        desc: 'Concede +20 XP bônus na carta ativa escolhida (ou arma para a próxima carta que você escolher).',
      },
      chimera: {
        title: 'Rugido Surround',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '💥',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Injeta automaticamente os gêneros Ação, Aventura e Ficção Científica como aceitos na Quimera ativa!',
      },
      bingo: {
        title: 'Balde Gigante',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🥤',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Concede +2 de progresso imediato no contrato escolhido na mesa (não conclui metas de meta 1 sozinho).',
      },
    },
  },

  sicario_telonas: {
    specialtyMode: 'secret_draw',
    powers: {
      secret_draw: {
        title: 'Saque Relâmpago',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '⚡',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Arma o próximo sorteio com filtro de duração enxuta (filmes ≤ 105 min) para maratonar rápido!',
      },
      chimera: {
        title: 'Lâmina Curta',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🗡️',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Libera Curtas-Metragens (< 50 min) na Quimera ativa e garante +15 XP extras ao cumprir.',
      },
      bingo: {
        title: 'Corte Rápido',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '✂️',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Reduz em -25% (mín. -1) a meta numérica do contrato selecionado na mesa.',
      },
    },
  },

  bardo_herbert_richers: {
    specialtyMode: 'bingo',
    powers: {
      secret_draw: {
        title: 'Refrão Nostálgico',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🎙️',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'open_hand_or_buff',
        desc: 'Revela Ano de Lançamento e Duração no verso das cartas fechadas da mão atual (ou do próximo sorteio).',
      },
      chimera: {
        title: 'Estúdio Clássico',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🔊',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Adiciona um bônus de +40 XP na Quimera ativa se o filme assistido for cadastrado com áudio Dublado.',
      },
      bingo: {
        title: 'Versão Brasileira',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🎙️',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Aplica a meta reduzida (❄️ -Dif) no contrato escolhido sem gastar ficha, preservando XP Normal e +0.1 de atributo!',
      },
    },
  },

  corsario_sete_mares: {
    specialtyMode: 'secret_draw',
    powers: {
      secret_draw: {
        title: 'Contrabando no Convés',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🏴‍☠️',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Permite guardar 1 carta extra além do limite de pendentes na mão no próximo sorteio/escolha.',
      },
      chimera: {
        title: 'Bandeira Pirata',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '⛵',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Adiciona +1 Bloco Regional aleatório extra com todos os seus países na Quimera ativa.',
      },
      bingo: {
        title: 'Mapa Rasgado',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🗺️',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Substitui o contrato selecionado por outro aleatório do Grimório sem gastar ficha de Trocar Contrato.',
      },
    },
  },

  vampiro_madrugada: {
    specialtyMode: 'chimera',
    powers: {
      secret_draw: {
        title: 'Voo Noturno',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🦇',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Prepara o próximo sorteio com 8 cartas e garantia de raridade mínima Mediano (♦) ou superior.',
      },
      chimera: {
        title: 'Beijo da Meia-Noite',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🩸',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Injeta +5 Tags extras aleatórias na Quimera ativa e promove 1 delas para Tag Ouro Checkpot acumulável!',
      },
      bingo: {
        title: 'Sede Noturna',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🌙',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Acrescenta +20 XP extras na recompensa de qualquer contrato aberto da mesa.',
      },
    },
  },

  carnical_grindhouse: {
    specialtyMode: 'bingo',
    powers: {
      secret_draw: {
        title: 'Fita Manjada',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '📼',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'pick_card',
        desc: 'Devolve 1 carta ativa ao baralho (como uma Ficha Bumerangue grátis sem gastar a carteira).',
      },
      chimera: {
        title: 'Serra Elétrica',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🪚',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: 'pillar',
        desc: 'Descarta 1 dos 4 pilares exigidos da Quimera ativa mantendo +20 XP fixos de consolação.',
      },
      bingo: {
        title: 'Banho de Sangue (+Dif)',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🩸',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Promove o contrato selecionado para 🔥 +Dif (+XP máximo e +0.2 atributo) mantendo a meta/contador do nível Normal!',
      },
    },
  },

  cacador_trufas: {
    specialtyMode: 'secret_draw',
    powers: {
      secret_draw: {
        title: 'Faro de Relíquias',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🍄',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'open_hand_or_buff',
        desc: 'Ativa o Raio-X de Marcos no verso das cartas: revela quais marcos secretos (Ano, País, Universo, Fama) cada carta oculta guarda!',
      },
      chimera: {
        title: 'Trufa Subterrânea',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🕵️',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Ativa regra especial Cult na Quimera ativa: filmes com < 5.000 votos pagam +40 XP bônus na colheita!',
      },
      bingo: {
        title: 'Garimpo Fino',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '⛏️',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Concede +1 de avanço imediato em qualquer contrato aberto da mesa (ou reduz a meta em -1 se alvo = 1).',
      },
    },
  },

  cartografo_195_reinos: {
    specialtyMode: 'chimera',
    powers: {
      secret_draw: {
        title: 'Rosa dos Ventos',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🧭',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Arma o próximo sorteio com 7 cartas e +20 XP bônus na próxima carta escolhida.',
      },
      chimera: {
        title: 'Fronteira Livre',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🌍',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: 'country_block',
        desc: 'Escolha manualmente 1 País do catálogo para somar à Quimera ativa e cravá-lo como País Ouro Checkpot (+0.5 DES)!',
      },
      bingo: {
        title: 'Passaporte Diplomático',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🛂',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Avança +2 pontos (ou conclui metas unitárias) em contratos de Países, Anos, Fronteiras ou Lado B.',
      },
    },
  },

  sacerdote_cinefilo: {
    specialtyMode: 'secret_draw',
    powers: {
      secret_draw: {
        title: 'Exorcismo de Naipe',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '✝️',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'pick_card',
        desc: 'Purifica 1 carta ativa da sua fila: devolve ao baralho grátis E garante uma carta Difícil (♠+) no próximo sorteio!',
      },
      chimera: {
        title: 'Vela da Mesa',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🕯️',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Revela a raridade oculta de todas as Cartas de Tarô da Quimera ativa e soma +15 XP fixos.',
      },
      bingo: {
        title: 'Água Benta',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '💧',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Reduz em -35% (mín. -1) o contador de qualquer pergaminho aberto na mesa mantendo XP e atributos intactos.',
      },
    },
  },

  monge_tres_casas: {
    specialtyMode: 'bingo',
    powers: {
      secret_draw: {
        title: 'Peso Exato',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '⚖️',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'pick_card_or_buff',
        desc: 'Adiciona +25 XP extras à carta ativa selecionada (ou à próxima carta concluída).',
      },
      chimera: {
        title: 'Equilíbrio dos Dados',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🎲',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Amplia a janela de Ano da Quimera ativa em ±4 anos, libera 1 Tag Ouro extra e soma +20 XP fixos.',
      },
      bingo: {
        title: 'Balança Micrométrica',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '⚖️',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Corta pela METADE (-50%, mín. 1) o contador necessário de qualquer pergaminho da mesa, mantendo todo XP e atributo!',
      },
    },
  },

  cavaleiro_laser_azul: {
    specialtyMode: 'chimera',
    powers: {
      secret_draw: {
        title: 'Encarte com Luva',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '💿',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Abre uma mão de colecionador com 10 cartas sorteadas de uma só vez no próximo sorteio.',
      },
      chimera: {
        title: 'Edição de Colecionador',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '📀',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: 'genre',
        desc: 'Escolha manualmente 1 Gênero extra para adicionar à Quimera ativa e promova-o a Gênero Ouro Checkpot (+0.5 AGI)!',
      },
      bingo: {
        title: 'Laser Limpo',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '✨',
        cooldownLabel: '1 uso / mês',
        targetMode: 'instant',
        desc: 'Adiciona imediatamente +1 ficha de Trocar 1 Contrato e +1 ficha de Sinete +Dif no estoque do mês.',
      },
    },
  },

  algoz_tomatometro: {
    specialtyMode: 'secret_draw',
    powers: {
      secret_draw: {
        title: 'Leque Implacável (12 Cartas)',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🎯',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Abre uma mesa com 12 cartas de uma só vez no próximo sorteio com raridade mínima Mediano (♦) — zero cartas comuns!',
      },
      chimera: {
        title: 'Selo Fresco',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🍅',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Injeta +3 Tags extras aleatórias na Quimera ativa e soma +15 XP fixos de crítica.',
      },
      bingo: {
        title: 'Caneta Vermelha',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🖊️',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Adiciona +25 XP extras no contrato selecionado e reduz a exigência dele em -1 (ou avança +1 se já reduzida).',
      },
    },
  },

  gladiador_ps5: {
    specialtyMode: 'bingo',
    powers: {
      secret_draw: {
        title: 'Troféu de Arena',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🛡️',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'pick_card_or_buff',
        desc: 'Eleva em +30 XP a recompensa de uma carta ativa selecionada (ou arma bônus para a próxima carta).',
      },
      chimera: {
        title: 'Armadura de Platina',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🏆',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Concede +1 escolha extra na Mesa de Tarô da Quimera ativa (ou revela raridades + soma +25 XP se todas já foram usadas).',
      },
      bingo: {
        title: 'Lacre de Ferro (Coringa)',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '⚔️',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Crava um Sinete de Ferro no contrato escolhido: ele passa a valer na hora para fechar Fileiras (+75 XP) que passam por ele!',
      },
    },
  },

  arquimago_tempo: {
    specialtyMode: 'chimera',
    powers: {
      secret_draw: {
        title: 'Portal das Décadas',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '⏳',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Prepara o próximo sorteio com 9 cartas e exibe Raio-X destacando os Anos Inéditos da Máquina do Tempo!',
      },
      chimera: {
        title: 'Fenda Cronológica Suprema',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🧙‍♂️',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Expande a faixa de Ano da Quimera ativa em ±12 anos E transforma targetYear ±3 em Anos Jackpot extras (+0.5 INT)!',
      },
      bingo: {
        title: 'Ampulheta Arcana',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '⌛',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Concede +2 de progresso no contrato selecionado na mesa (se meta = 1, conclui com o toque do tempo!).',
      },
    },
  },

  paladino_oscar: {
    specialtyMode: 'secret_draw',
    powers: {
      secret_draw: {
        title: 'Decreto da Academia',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '👑',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'pick_card',
        desc: 'Consagra 1 carta ativa da sua mão subindo sua raridade em +1 nível (ex: ♠ Difícil → ♥ Muito Difícil → ★ Exótica de 150 XP)!',
      },
      chimera: {
        title: 'Tapete Vermelho',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🌟',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Concede +35 XP fixos dourados na Quimera ativa e reforça os Jackpots com selo da Academia.',
      },
      bingo: {
        title: 'Estatueta Dourada',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🏆',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Eleva o contrato escolhido para 🔥 +Dif gratuitamente E reduz sua exigência em -25% para acelerar a colheita!',
      },
    },
  },

  cronista_creditos_pos: {
    specialtyMode: 'bingo',
    powers: {
      secret_draw: {
        title: 'Cena Pós-Créditos',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🎞️',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Abre uma mão estendida de 9 cartas e garante +25 XP extras na próxima carta aceita.',
      },
      chimera: {
        title: 'Gancho Secreto',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '🪝',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Adiciona +2 Anos Jackpot extras dentro da janela da Quimera ativa e +1 Tag Ouro extra.',
      },
      bingo: {
        title: 'Super Ficha do Cartório',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '📜',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square_and_goal',
        desc: 'Escolha qualquer pergaminho em aberto E selecione exatamente qual das 35 missões do Grimório deseja colocar no lugar!',
      },
    },
  },

  alquimista_maratonas: {
    specialtyMode: 'chimera',
    powers: {
      secret_draw: {
        title: 'Destilado Cult',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '⚗️',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'instant',
        desc: 'Gera +1 Ficha Bumerangue extra na carteira da Sessão Secreta e arma +20 XP no próximo sorteio.',
      },
      chimera: {
        title: 'Transmutação de Tag Dourada',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🧪',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: 'tag',
        desc: 'Escolha manualmente 1 Tag exata para adicionar à Quimera ativa já marcada como Tag Ouro Jackpot (+0.5 CAR) + 3 Tags aleatórias!',
      },
      bingo: {
        title: 'Elixir Triplo',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🧫',
        cooldownLabel: '1 uso / mês',
        targetMode: 'instant',
        desc: 'Destila progresso imediato em 3 pergaminhos abertos da mesa (+1 de avanço cada, ou +3 nos contadores altos).',
      },
    },
  },

  oraculo_pelicula: {
    specialtyMode: 'secret_draw',
    powers: {
      secret_draw: {
        title: 'Clarividência de 15 Cartas',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🔮',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'O próximo sorteio abre uma mesa colossal com 15 CARTAS de uma só vez + Raio-X completo de todos os marcos secretos!',
      },
      chimera: {
        title: 'Terceiro Olho do Tarô',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '👁️',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: null,
        desc: 'Revela todas as 5 Cartas de Tarô ocultas da Quimera ativa E concede +1 escolha de Carta!',
      },
      bingo: {
        title: 'Profecia do Sinete',
        tier: 'support',
        tierLabel: '○ Apoio',
        icon: '✨',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Abençoa 1 contrato aberto com +35 XP extras e avança +1 em sua barra.',
      },
    },
  },

  arquiteto_multiverso: {
    specialtyMode: 'chimera',
    powers: {
      secret_draw: {
        title: 'Fenda de 10 Cartas Raras',
        tier: 'tactical',
        tierLabel: '◐ Tático',
        icon: '🌌',
        cooldownLabel: '1 uso / 15 dias',
        actionType: 'next_draw',
        desc: 'Sorteia 10 cartas (todas Difícil ♠, Muito Difícil ♥ ou Exótica ★) com Raio-X de marcos e 1 vaga extra acima do limite da fila!',
      },
      chimera: {
        title: 'Convergência do Arquiteto',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '👑',
        cooldownLabel: '1 uso / 15 dias',
        requiresChoice: 'pillar',
        desc: 'Escolha 1 dos 4 pilares da Quimera ativa (Ano, País, Gênero ou Tags): ele vira JACKPOT GARANTIDO ao cumprir a base!',
      },
      bingo: {
        title: 'Decreto do Multiverso',
        tier: 'specialty',
        tierLabel: '★ Especialidade',
        icon: '🌌',
        cooldownLabel: '1 uso / mês',
        targetMode: 'pick_square',
        desc: 'Eleva o contrato escolhido para 🔥 +Dif (+0.2 atributo e XP máximo) E reduz sua meta pela metade (-50%)!',
      },
    },
  },
};

export function getClassPowers(classId) {
  return CLASS_POWERS_BY_ID[classId] || CLASS_POWERS_BY_ID.andarilho_setima_arte;
}

export function getEquippedClassId(defaultHighestClassId = 'andarilho_setima_arte') {
  try {
    const unlocked = getUnlockedClassIds();
    const fallbackHighest =
      window.localStorage.getItem('cine_rpg_highest_class_id') || defaultHighestClassId;
    const saved = window.localStorage.getItem(EQUIPPED_CLASS_STORAGE_KEY);
    if (saved && CLASS_POWERS_BY_ID[saved] && unlocked.includes(saved)) {
      return saved;
    }
    if (fallbackHighest && CLASS_POWERS_BY_ID[fallbackHighest]) {
      return fallbackHighest;
    }
  } catch {
    // ignore storage errors
  }
  return CLASS_POWERS_BY_ID[defaultHighestClassId] ? defaultHighestClassId : 'andarilho_setima_arte';
}

export function getUnlockedClassIds() {
  try {
    const raw = window.localStorage.getItem('cine_rpg_unlocked_class_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((id) => Boolean(CLASS_POWERS_BY_ID[id]));
      }
    }
  } catch {
    // ignore storage errors
  }
  return ['andarilho_setima_arte'];
}

export function equipClassId(classId) {
  try {
    if (typeof window !== 'undefined' && CLASS_POWERS_BY_ID[classId]) {
      window.localStorage.setItem(EQUIPPED_CLASS_STORAGE_KEY, classId);
      dispatchClassPowerSync();
    }
  } catch {
    // ignore storage errors
  }
}

export function dispatchClassPowerSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cine-class-power-sync'));
  }
}
