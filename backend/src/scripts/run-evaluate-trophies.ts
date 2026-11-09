import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { evaluateTrophies } from '../services/trophyService';
import pool from '../config/database';

async function main() {
  console.log('--- Starting Trophy Seed & Evaluation ---');
  try {
    const result = await evaluateTrophies({ markNew: false });
    console.log('Evaluation completed successfully!');
    console.log(`Total Trophies: ${result.totalTrophies}`);
    console.log(`Unlocked Trophies: ${result.unlockedCount}`);
    console.log(`Overall Percentage: ${result.overallPercentage}%`);

    const newTrophyIds = [
      'cf_isaac_bardavid',
      'cf_wendel_bezerra',
      'mh_guillermo_del_toro_6',
      'tc_you_died_terror_tragico_nota_3',
      'tc_achou_errado_rt_lt40_ur_gte80_5',
      'tc_press_f_tragico_emocionante_fisica_5',
      'tc_ah_shit_repetido_crime_acao_1990_2004_1',
    ];

    console.log('\n--- Status of 7 New Trophies ---');
    for (const t of result.trophies) {
      if (newTrophyIds.includes(t.id)) {
        console.log(`[${t.tier.toUpperCase()}] ${t.id} - "${t.title}": ${t.is_unlocked ? '✅ CONQUISTADO' : '🔒 BLOQUEADO'} (${t.progress_current}/${t.progress_target} - ${t.progress_percentage}%)`);
        if (t.checklist && t.checklist.length > 0) {
          const conquered = t.checklist.filter((c: any) => c.conquered);
          console.log(`   Items conquistados: ${conquered.length}/${t.checklist.length}`);
          conquered.slice(0, 5).forEach((c: any) => console.log(`     - ${c.name}: ${c.extra_info || c.movie_title}`));
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
