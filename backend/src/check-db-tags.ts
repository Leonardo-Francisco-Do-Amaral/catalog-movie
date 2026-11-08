import { query } from './config/database';

async function run() {
  const tags = await query("SELECT * FROM user_tags WHERE name IN ('Preto branco', 'Preto e branco', 'Man', 'Men', 'X') ORDER BY name");
  console.log('=== TAGS NO BANCO ===');
  console.log(tags.rows);
}

run().then(() => process.exit(0));
