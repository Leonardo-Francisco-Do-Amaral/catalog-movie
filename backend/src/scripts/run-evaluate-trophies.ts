import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { evaluateTrophies } from '../services/trophyService';
import pool from '../config/database';

const NEW_TROPHY_IDS = [
  'tc_triforce_do_cinema',
  'tc_magia_profunda_bruxa_decadas',
  'ss_gotta_go_fast',
  'tc_new_game_plus_repetido_nota_9',
  'tc_konami_code_acao_aventura_1980s_30',
  'tc_666_sessao_do_capeta',
  'tc_climao_almoco_domingo',
  'tc_e_morreu_terror_suspense_tragico_final_epico',
  'tc_333_o_meio_besta',
  'tc_milagre_industria_baseado_jogo_nota_8',
  'tc_cake_is_a_lie_ficcao_dystopia_viagem_nota_lt5',
  'tc_snake_stealth_suspense_crime',
  'mh_roberto_gomez_bolanos',
  'tc_rush_b_acao_max_90_min',
  'tc_e_verdade_esse_bilete_fatos_reais_nota_lt6',
  'tc_ray_tracing_bomba_2021_ficcao_acao_reviews_500k',
  'tc_achou_que_nao_ia_ter_cinema_fev_mar_set',
  'us_michael_jackson_collection',
  'multi_michael_jackson_ultimate_anthology'
];

async function main() {
  console.log('--- Starting Trophy Seed & Evaluation ---');
  try {
    const result = await evaluateTrophies({ markNew: false });
    console.log('Evaluation completed successfully!');
    console.log(`Total Trophies: ${result.totalTrophies}`);
    console.log(`Unlocked Trophies: ${result.unlockedCount} / ${result.totalTrophies} (${result.overallPercentage}%)`);
    console.log(`XP / Points: ${result.earnedPoints} / ${result.totalPoints}`);
    if (result.xpStatus) {
      console.log(`Level: ${result.xpStatus.level} (${result.xpStatus.levelTitle}) | Total XP: ${result.xpStatus.totalXp} XP`);
    }

    console.log('\n--- DETALHES DOS 17 NOVOS TROFÉUS ---');
    for (const id of NEW_TROPHY_IDS) {
      const trophy = result.trophies.find((t: any) => t.id === id);
      if (!trophy) {
        console.error(`❌ Troféu não encontrado: ${id}`);
        continue;
      }
      const statusIcon = trophy.is_unlocked ? '✅ CONQUISTADO' : '🔒 PENDENTE';
      console.log(`\n${trophy.icon} [${trophy.tier.toUpperCase()}] "${trophy.title}" (${trophy.id})`);
      console.log(`   Descrição: "${trophy.description}"`);
      console.log(`   Status: ${statusIcon} | Progresso: ${trophy.progress_current}/${trophy.progress_target} (${trophy.progress_percentage}%)`);
      console.log(`   Categorias: [${trophy.categories.join(', ')}]`);
      if (trophy.checklist && trophy.checklist.length > 0) {
        const conquered = trophy.checklist.filter((c: any) => c.conquered);
        console.log(`   Checklist: ${conquered.length}/${trophy.checklist.length} itens conquistados`);
        conquered.slice(0, 3).forEach((c: any) => console.log(`      ✅ ${c.name}: ${c.extra_info || c.movie_title || ''}`));
        if (conquered.length > 3) console.log(`      ... e mais ${conquered.length - 3} itens`);
        const pending = trophy.checklist.filter((c: any) => !c.conquered);
        if (pending.length > 0) {
          console.log(`      🔒 Exemplo pendente: ${pending[0].name} (${pending[0].extra_info || ''})`);
        }
      }
    }
  } catch (error) {
    console.error('Error evaluating trophies:', error);
  } finally {
    await pool.end();
  }
}

main();
