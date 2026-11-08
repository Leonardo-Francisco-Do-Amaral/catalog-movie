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
  console.log('=== BUSCANDO LINHAS NO CSV ===');
  rows.forEach((row, idx) => {
    const rowStr = JSON.stringify(row);
    if (rowStr.toLowerCase().includes('steve') || rowStr.toLowerCase().includes('pentecostal') || rowStr.toLowerCase().includes('100') || rowStr.toLowerCase().includes('vai')) {
      console.log(`\nLinha ${idx + 2}:`);
      console.log(`- Nome Original: ${row['Nome Original']}`);
      console.log(`- Tradução: ${row['Tradução']}`);
      console.log(`- Ano: ${row['Ano do filme']}`);
    }
  });
}

run();
