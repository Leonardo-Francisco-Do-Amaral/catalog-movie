import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const BAZAAR_POWER_HELP = {
  secret_amulet: {
    icon: '🛡️',
    title: 'Amuleto Contra-Maldição (Escudo do Arlequim)',
    subtitle: 'Sessão Secreta & Tarô da Quimera',
    description:
      'Enquanto estiver ARMADO, estilhaça automaticamente para anular 100% dos efeitos da próxima Maldição que você abrir — seja uma Carta Amaldiçoada na Sessão Secreta ou um Arcano Amaldiçoado no Tarô da Quimera (nesse caso também devolve +1 escolha limpa!).',
    rule: 'Fica ativo até interceptar 1 Maldição (não expira por tempo).',
  },
  secret_transmute: {
    icon: '⚖️',
    title: 'Selo de Transmutação (XP ↔ Ouro)',
    subtitle: 'Sessão Secreta • Fila Ativa',
    description:
      'Escolha 1 filme ativo na sua fila da Sessão Secreta para converter a recompensa dele entre XP RPG (⚡) e Moedas do Bazar (🪙) com valor proporcional.',
    rule: 'Use dentro do painel de detalhes de qualquer filme ativo da fila.',
  },
  secret_radar: {
    icon: '🕵️',
    title: 'Radar do Croupier (Mão Antidisfarce)',
    subtitle: 'Sessão Secreta • Mesa',
    description:
      'Faz piscar um brilho pulsante nas cartas fechadas da mesa que estão escondendo Cartas Especiais disfarçadas, sem revelar qual especial está lá.',
    rule: 'Se não houver mão aberta, fica armado para a próxima mesa que você sortear.',
  },
  secret_hand_plus2: {
    icon: '🃏',
    title: 'Manga Cheia (+2 Cartas na Mesa)',
    subtitle: 'Sessão Secreta • Próxima Mão',
    description:
      'Arme antes de sortear para adicionar +2 cartas extras na próxima mesa da Sessão Secreta mantendo o equilíbrio justo entre XP e Ouro.',
    rule: 'Limite de 1 poder de cartas extras (+2 ou +5) armado por sorteio — não acumula.',
  },
  secret_hand_plus5: {
    icon: '🌟',
    title: 'Manga Cheia Suprema (+5 Cartas)',
    subtitle: 'Sessão Secreta • Próxima Mão',
    description:
      'Arme antes de sortear para abrir +5 cartas extras de uma vez na próxima mesa da Sessão Secreta.',
    rule: 'Limite de 1 poder de cartas extras (+2 ou +5) armado por sorteio — não acumula.',
  },
  secret_special_storm: {
    icon: '🌪️',
    title: 'Baralho Carregado (2 a 6 Especiais)',
    subtitle: 'Sessão Secreta • Próxima Mão',
    description:
      'Modifica a distribuição da próxima mesa sorteada para conter entre 2 e 6 Cartas Especiais escondidas atrás dos naipes (no lugar do padrão 1 a 3).',
    rule: 'Limite de 1 armação por vez antes de puxar a próxima mão.',
  },
  chimera_oracle_2: {
    icon: '🔮',
    title: 'Oráculo Bis (+1 Escolha de Tarô)',
    subtitle: 'Quimera Cinéfila • Tarô',
    description:
      'Libera +1 escolha extra de Carta de Tarô na mesma mesa da Quimera ativa (totalizando 2 Arcanos combinados).',
    rule: 'Apenas 1 Poder de Tarô (Novo Corte, Oráculo Bis ou Oráculo Triplo) pode ser usado por Quimera.',
  },
  chimera_oracle_3: {
    icon: '👑',
    title: 'Oráculo Triplo (+2 Escolhas de Tarô)',
    subtitle: 'Quimera Cinéfila • Tarô',
    description:
      'Libera +2 escolhas extras de Carta de Tarô na mesma mesa da Quimera ativa (totalizando até 3 Arcanos combinados!).',
    rule: 'Apenas 1 Poder de Tarô (Novo Corte, Oráculo Bis ou Oráculo Triplo) pode ser usado por Quimera.',
  },
  chimera_tarot_reroll: {
    icon: '🎲',
    title: 'Novo Corte do Tarô (Re-roll)',
    subtitle: 'Quimera Cinéfila • Tarô',
    description:
      'Troca todas as cartas de Tarô ainda fechadas (não seladas) da Quimera por novas cartas sorteadas do deck.',
    rule: 'Apenas 1 Poder de Tarô (Novo Corte, Oráculo Bis ou Oráculo Triplo) pode ser usado por Quimera.',
  },
  chimera_invert_essence: {
    icon: '⚗️',
    title: 'Alquimia Inversa (Virar XP ↔ Ouro)',
    subtitle: 'Quimera Cinéfila • Contrato Ativo ou Pronto',
    description:
      'Inverte manualmente uma Quimera à sua escolha entre Contrato de Ouro (🪙) e Contrato de XP RPG (⚡), recalculando pilares e Jackpots instantaneamente.',
    rule: 'Funciona tanto durante a caçada quanto antes de despertar uma Quimera já capturada.',
  },
  chimera_golden_jackpot: {
    icon: '💎',
    title: 'Selo de Jackpot Dourado',
    subtitle: 'Quimera Cinéfila • Pilares Internos',
    description:
      'Você escolhe uma categoria (Ano, País ou Tag) e o poder sorteia aleatoriamente +1 fator interno extra lá dentro para também virar Jackpot Dourado.',
    rule: 'Gênero não participa porque possui apenas 2 opções.',
  },
  bingo_hybrid_seal: {
    icon: '⚖️',
    title: 'Sinete Híbrido dos Pergaminhos',
    subtitle: 'Pergaminhos (Bingo) • Casa ou Fileira',
    description:
      'Em um pergaminho ou fileira de XP, divide a recompensa em 50% XP + 50% Ouro (🪙). Em um pergaminho ou fileira já Dourada, aumenta o ganho em +25% Moedas extras!',
    rule: 'Ative este botão e clique no pergaminho ou emblema de linha aberta desejado.',
  },
  vip_seat: {
    icon: '🛋️',
    title: 'Relíquia: Poltrona VIP Permanente',
    subtitle: 'Relíquia Passiva Permanente',
    description:
      'Expande para sempre em +1 a capacidade de contratos na fila da Sessão Secreta (10 → 11) e da Quimera Cinéfila (4 → 5).',
    rule: 'Efeito permanente ativo automaticamente em toda a conta.',
  },
  golden_loupe: {
    icon: '🔍',
    title: 'Relíquia: Lupa Eterna de Ouro',
    subtitle: 'Relíquia Passiva Permanente',
    description:
      'Aplica um bônus automático de +10% em todo Ouro do Bazar (🪙) colhido na Sessão Secreta (inclusive Portal), Quimera Cinéfila e Pergaminhos.',
    rule: 'Efeito permanente cumulativo com outros multiplicadores de ouro.',
  },
  house_insurance: {
    icon: '🛡️',
    title: 'Relíquia: Seguro da Casa',
    subtitle: 'Relíquia Passiva Permanente • 1× / 15 Dias',
    description:
      'Uma vez a cada ciclo de 15 dias, devolve automaticamente +1 Ficha de Sorteio na Sessão Secreta caso você finalize uma rodada inteira com 0 cartas escolhidas.',
    rule: 'Recarrega automaticamente nos dias 1 e 15 de cada mês.',
  },
  bingo_upgrade: {
    icon: '🔺',
    title: 'Sinete +Dificuldade (+Dif)',
    subtitle: 'Ferramenta dos Pergaminhos',
    description:
      'Aumenta a dificuldade de um pergaminho ainda aberto e escala proporcionalmente sua recompensa (em XP ou em Ouro nos Pergaminhos Dourados!).',
    rule: 'Clique no botão e depois selecione uma casa aberta do tabuleiro.',
  },
  bingo_downgrade: {
    icon: '🔻',
    title: 'Sinete -Dificuldade (-Dif)',
    subtitle: 'Ferramenta dos Pergaminhos',
    description:
      'Reduz a dificuldade de um pergaminho ainda aberto para torná-lo mais fácil de concluir, ajustando a recompensa proporcionalmente.',
    rule: 'Clique no botão e depois selecione uma casa aberta do tabuleiro.',
  },
  bingo_square_reroll: {
    icon: '🎲',
    title: 'Trocar Casa',
    subtitle: 'Ferramenta dos Pergaminhos',
    description:
      'Substitui o desafio de um único pergaminho aberto por outro do mesmo nível de dificuldade.',
    rule: 'Não altera casas já concluídas e preservadas com lacre.',
  },
  bingo_board_reroll: {
    icon: '🔄',
    title: 'Trocar Mesa',
    subtitle: 'Ferramenta dos Pergaminhos',
    description:
      'Reescreve todas as casas ainda não concluídas da cartela atual preservando integralmente seus pergaminhos já lacrados.',
    rule: 'Disponível enquanto houver pelo menos 1 casa aberta.',
  },
};

export default function PowerHelpButton({
  helpKey = '',
  help = null,
  size = 'sm',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const spec = help || BAZAAR_POWER_HELP[helpKey];

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!spec) return null;

  const sizeCls =
    size === 'xs'
      ? 'w-4 h-4 text-[9px]'
      : size === 'md'
      ? 'w-6 h-6 text-[11px]'
      : 'w-5 h-5 text-[10px]';

  const summaryTitle = `${spec.title}: ${spec.description}${spec.rule ? ` (${spec.rule})` : ''}`;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title={summaryTitle}
        aria-label={`Ver o que faz: ${spec.title}`}
        className={`inline-flex items-center justify-center rounded-full border border-white/25 bg-black/60 hover:bg-amber-400 hover:text-zinc-950 hover:border-amber-200 text-amber-200 font-black leading-none transition-all cursor-pointer shrink-0 ${sizeCls} ${className}`}
      >
        ?
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border-2 border-amber-400/55 bg-gradient-to-br from-[#171108] via-zinc-950 to-[#11121c] p-5 sm:p-6 shadow-[0_0_50px_rgba(251,191,36,0.28)] flex flex-col gap-3.5 text-left"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar ajuda do poder"
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 pr-8">
                <span className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-300/45 flex items-center justify-center text-2xl shrink-0">
                  {spec.icon || '✨'}
                </span>
                <div className="min-w-0">
                  {spec.subtitle && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-300/85">
                      {spec.subtitle}
                    </div>
                  )}
                  <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                    {spec.title}
                  </h4>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-amber-400/40 via-white/15 to-transparent" />

              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {spec.description}
              </p>

              {spec.rule && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-200">
                  📌 {spec.rule}
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="self-end px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
