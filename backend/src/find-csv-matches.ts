import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function run() {
  const csvPath = path.join(__dirname, '../Filmes versao reboot 2.0 att 29-04-2024 (1) (2).xlsm - Filmes.csv');
  const rows = await readCSV(csvPath);
  console.log('=== BUSCANDO CORRESPONDÊNCIAS NO CSV ===');
  rows.forEach((row, idx) => {
    const ratingStr = row['minha nota']?.trim().replace(',', '.');
    const month = row['Mês visto']?.trim();
    const year = row['ano visto ']?.trim() || row['ano visto']?.trim();
    const platform = row['Visto em']?.trim();

    // 1. Verificar correspondência para Steve Vai (8.2, 10, 2023)
    if (ratingStr === '8.2' && month === '10' && year === '2023') {
      console.log(`\nMatch para Steve Vai (Linha ${idx + 2}):`);
      console.log(`- Nome Original: "${row['Nome Original']}"`);
      console.log(`- Tradução: "${row['Tradução']}"`);
      console.log(`- Ano: "${row['Ano do filme']}"`);
      console.log(`- Minha Nota: "${row['minha nota']}"`);
    }

    // 2. Verificar correspondência para 100 Anos do Movimento Pentecostal (4.125, 8, 2023)
    if (ratingStr === '4.125' && month === '8' && year === '2023') {
      console.log(`\nMatch para Pentecostal (Linha ${idx + 2}):`);
      console.log(`- Nome Original: "${row['Nome Original']}"`);
      console.log(`- Tradução: "${row['Tradução']}"`);
      console.log(`- Ano: "${row['Ano do filme']}"`);
      console.log(`- Minha Nota: "${row['minha nota']}"`);
    }
  });
}

run();
