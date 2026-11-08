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
      'tc_folha_em_branco_15',
      'tc_em_familia_10',
      'tc_em_familia_terror_5',
      'tc_em_familia_natal_3',
      'tc_em_familia_cinema_10',
      'tc_em_familia_nota_85_10',
      'tc_em_familia_estrangeiro_5',
      'tc_em_familia_agosto_5',
      'tc_em_familia_streaming_15',
      'tc_em_familia_marvel_dc_5',
      'tc_em_familia_emocionante_10',
      'tc_em_familia_nota_90_5',
      'tc_em_familia_paises_5',
      'tc_muitas_tags_7_30',
      'tc_em_familia_45',
    ];

    console.log('\n--- Status of 15 New Trophies ---');
    for (const t of result.trophies) {
      if (newTrophyIds.includes(t.id)) {
        console.log(`[${t.tier.toUpperCase()}] ${t.id} - "${t.title}": ${t.is_unlocked ? '✅ CONQUISTADO' : '🔒 BLOQUEADO'} (${t.progress_current}/${t.progress_target} - ${t.progress_percentage}%)`);
      }
    }
  } catch (error) {
    console.error('Error evaluating trophies:', error);
  } finally {
    await pool.end();
  }
}

main();
