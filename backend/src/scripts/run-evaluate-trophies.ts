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

    const ftTrophy = result.trophies.find((t: any) => t.id === 'cf_fernanda_torres');
    if (ftTrophy) {
      console.log(`\n[${ftTrophy.tier.toUpperCase()}] ${ftTrophy.id} - "${ftTrophy.title}": ${ftTrophy.is_unlocked ? '✅ CONQUISTADO' : '🔒 BLOQUEADO'} (${ftTrophy.progress_current}/${ftTrophy.progress_target} - ${ftTrophy.progress_percentage}%)`);
      if (ftTrophy.checklist && ftTrophy.checklist.length > 0) {
        console.log(`Total items in checklist: ${ftTrophy.checklist.length}`);
        const conquered = ftTrophy.checklist.filter((c: any) => c.conquered);
        console.log(`Items conquistados: ${conquered.length}`);
        conquered.forEach((c: any) => console.log(`  ✅ ${c.name}: ${c.extra_info || c.movie_title}`));
        const pending = ftTrophy.checklist.filter((c: any) => !c.conquered);
        console.log(`Items pendentes: ${pending.length}`);
        pending.slice(-3).forEach((c: any) => console.log(`  🔒 ${c.name}: ${c.extra_info}`));
      }
    }
  } catch (error) {
    console.error('Error evaluating trophies:', error);
  } finally {
    await pool.end();
  }
}

main();
