import pool, { query } from '../config/database';
import { evaluateTrophies } from '../services/trophyService';

interface TargetMovieSpec {
  item: number;
  expectedTitle: string;
  searchPattern: string;
}

const targetSpecs: TargetMovieSpec[] = [
  { item: 1, expectedTitle: 'Vingadores: Ultimato', searchPattern: 'Vingadores: Ultimato' },
  { item: 2, expectedTitle: 'O Poço', searchPattern: 'O Poço' },
  { item: 3, expectedTitle: 'Jojo Rabbit', searchPattern: 'Jojo Rabbit' },
  { item: 4, expectedTitle: 'Homem-Aranha: No Aranhaverso', searchPattern: 'Homem-Aranha: No Aranhaverso' },
  { item: 5, expectedTitle: 'Tão Forte e Tão Perto', searchPattern: 'Tão Forte e Tão Perto' },
  { item: 6, expectedTitle: 'A Cura', searchPattern: 'A Cura' },
  { item: 7, expectedTitle: 'Minha Mãe é uma Peça 3: O Filme', searchPattern: 'Minha Mãe é uma Peça 3' },
  { item: 8, expectedTitle: 'Que Horas Ela Volta?', searchPattern: 'Que Horas Ela Volta' },
  { item: 9, expectedTitle: 'Star Wars: O Despertar da Força', searchPattern: 'Star Wars: O Despertar da Força' },
  { item: 10, expectedTitle: 'Minha Mãe é uma Peça: O Filme', searchPattern: 'Minha Mãe é uma Peça: O Filme' },
  { item: 11, expectedTitle: 'Parasita', searchPattern: 'Parasita' },
  { item: 12, expectedTitle: 'Star Wars: A Ascensão Skywalker', searchPattern: 'Star Wars: A Ascensão Skywalker' },
  { item: 13, expectedTitle: 'A Busca', searchPattern: 'A Busca' },
  { item: 14, expectedTitle: 'Star Wars: Os Últimos Jedi', searchPattern: 'Star Wars: Os Últimos Jedi' },
  { item: 15, expectedTitle: 'História de um Casamento', searchPattern: 'História de um Casamento' },
  { item: 16, expectedTitle: 'Loucos e Perigosos', searchPattern: 'Loucos e Perigosos' },
];

function normalizeStr(val: string): string {
  return (val || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  const dbClient = await pool.connect();
  try {
    console.log('===============================================================');
    console.log('   MIGRATION: REGISTRAR E APLICAR TAG "Em Família" EM LOTE    ');
    console.log('===============================================================\n');

    await dbClient.query('BEGIN');

    // 1. Cadastrar/Garantir a tag "Em Família" na tabela user_tags
    const tagName = 'Em Família';
    const tagSlug = 'em-familia';

    const tagUpsertRes = await dbClient.query(
      `INSERT INTO user_tags (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name, slug`,
      [tagName, tagSlug]
    );

    const tagId = tagUpsertRes.rows[0].id;
    console.log(`[Tag Status] Tag "${tagName}" garantida na tabela user_tags (ID: ${tagId}, Slug: ${tagSlug})\n`);

    // 2. Buscar todos os filmes do banco para correspondência precisa
    const allMoviesRes = await dbClient.query(`
      SELECT m.id, m.title, m.original_title, m.release_year,
             COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags
      FROM movies m
      LEFT JOIN movie_tags mt ON m.id = mt.movie_id
      LEFT JOIN user_tags ut ON mt.tag_id = ut.id
      GROUP BY m.id
      ORDER BY m.id
    `);
    const allMovies = allMoviesRes.rows;

    const successfulUpdates: any[] = [];
    const notFoundTitles: string[] = [];

    for (const spec of targetSpecs) {
      const normPattern = normalizeStr(spec.searchPattern);
      
      // Encontra o filme candidato mais adequado
      const matchedMovie = allMovies.find((m: any) => {
        const normTitle = normalizeStr(m.title);
        const normOrig = normalizeStr(m.original_title);
        return normTitle === normPattern || normOrig === normPattern ||
               normTitle.startsWith(normPattern) || normPattern.startsWith(normTitle);
      });

      if (!matchedMovie) {
        console.error(`❌ Item ${spec.item}: "${spec.expectedTitle}" NÃO FOI ENCONTRADO no banco de dados!`);
        notFoundTitles.push(spec.expectedTitle);
        continue;
      }

      const movieId = matchedMovie.id;
      const existingTags: string[] = matchedMovie.tags || [];
      const alreadyHasTag = existingTags.includes(tagName);

      if (alreadyHasTag) {
        console.log(`ℹ️ Item ${spec.item}: [ID ${movieId}] "${matchedMovie.title}" já possuía a tag "${tagName}".`);
      } else {
        // Vincula a tag em movie_tags preservando as tags existentes
        await dbClient.query(
          `INSERT INTO movie_tags (movie_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [movieId, tagId]
        );
        console.log(`✅ Item ${spec.item}: [ID ${movieId}] "${matchedMovie.title}" (${matchedMovie.release_year}) -> Tag "${tagName}" vinculada com sucesso!`);
      }

      successfulUpdates.push({
        item: spec.item,
        movieId,
        title: matchedMovie.title,
        originalTitle: matchedMovie.original_title,
        year: matchedMovie.release_year,
        previousTags: existingTags,
        alreadyHadTag: alreadyHasTag,
      });
    }

    await dbClient.query('COMMIT');
    console.log('\n[Database] Transação confirmada com sucesso (COMMIT).\n');

    // 3. Verificação pós-execução no banco
    console.log('===============================================================');
    console.log('   VERIFICAÇÃO PÓS-EXECUÇÃO DOS 16 FILMES NO BANCO DE DADOS   ');
    console.log('===============================================================\n');

    const movieIds = successfulUpdates.map((u) => u.movieId);
    const verifyRes = await dbClient.query(
      `SELECT m.id, m.title, m.original_title, m.release_year,
              COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags
       FROM movies m
       LEFT JOIN movie_tags mt ON m.id = mt.movie_id
       LEFT JOIN user_tags ut ON mt.tag_id = ut.id
       WHERE m.id = ANY($1)
       GROUP BY m.id
       ORDER BY m.id`,
      [movieIds]
    );

    verifyRes.rows.forEach((row: any) => {
      const match = successfulUpdates.find((u) => u.movieId === row.id);
      const hasEmFamilia = row.tags.includes(tagName);
      console.log(`Item ${match?.item || '?'}: [ID ${row.id}] "${row.title}" (${row.release_year})`);
      console.log(`  Tags Finais (${row.tags.length}): [${row.tags.join(', ')}]`);
      console.log(`  Contém "Em Família": ${hasEmFamilia ? 'SIM ✅' : 'NÃO ❌'}\n`);
    });

    console.log(`Resumo: ${successfulUpdates.length} de ${targetSpecs.length} filmes processados.`);
    if (notFoundTitles.length > 0) {
      console.warn(`Atenção: ${notFoundTitles.length} filmes não foram localizados:`, notFoundTitles);
    } else {
      console.log('Todos os 16 filmes foram localizados e atualizados com 100% de sucesso!');
    }

    // 4. Executa avaliação de troféus para manter cache e troféus atualizados
    try {
      await evaluateTrophies();
      console.log('\n[Trophies] Sincronização do motor de troféus executada com sucesso.');
    } catch (e: any) {
      console.warn('[Trophies] Aviso na sincronização de troféus:', e.message);
    }

  } catch (err: any) {
    await dbClient.query('ROLLBACK');
    console.error('❌ ERRO NA EXECUÇÃO:', err);
    process.exit(1);
  } finally {
    dbClient.release();
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
