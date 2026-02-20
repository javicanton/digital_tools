import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_FIELDS = [
  'tool_id',
  'nombre',
  'url_oficial',
  'categoria_principal',
  'etiquetas',
  'descripcion_corta',
  'funcionalidades_clave',
  'utilidad_en_investigacion',
  'fases_investigacion',
  'tipos_datos',
  'precio_modelo',
  'coste_estimado',
  'requisitos_sistema',
  'integraciones',
  'importacion',
  'exportacion',
  'trabajo_colaborativo',
  'documentacion_tutoriales',
  'idioma_interfaz',
  'transparencia_datos',
  'protocolos_etica',
  'uso_IA',
  'curva_aprendizaje',
  'alternativas',
  'notas_limitaciones',
  'ultima_actualizacion_aprox',
];

function parseArgs(argv) {
  const args = {
    input: './data/tools.csv',
    output: './public/data/tools.json',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--input') {
      args.input = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--output') {
      args.output = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--help' || token === '-h') {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Uso:
  npm run import:csv -- --input ./ruta/tools.csv --output ./public/data/tools.json

Tambien acepta JSON como entrada:
  npm run import:csv -- --input ./ruta/tools.json --output ./public/data/tools.json`);
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = false;
        continue;
      }

      value += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(value);
      value = '';
      continue;
    }

    if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function normalizeRecord(record) {
  return REQUIRED_FIELDS.reduce((acc, field) => {
    const value = record[field];
    acc[field] = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
    return acc;
  }, {});
}

function validateHeaders(headers) {
  if (headers.length !== REQUIRED_FIELDS.length) {
    throw new Error(
      `El CSV debe tener ${REQUIRED_FIELDS.length} columnas exactas. Recibidas: ${headers.length}`
    );
  }

  const missing = REQUIRED_FIELDS.filter((field) => !headers.includes(field));
  const unknown = headers.filter((field) => !REQUIRED_FIELDS.includes(field));

  if (missing.length || unknown.length) {
    throw new Error(
      `Cabeceras invalidas. Faltan: [${missing.join(', ')}] | No esperadas: [${unknown.join(', ')}]`
    );
  }
}

function fromCsvRows(rows) {
  if (!rows.length) {
    return [];
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((entry, index) => (index === 0 ? entry.replace(/^\uFEFF/, '') : entry));

  validateHeaders(headers);

  const records = dataRows
    .filter((row) => row.some((cell) => String(cell ?? '').trim().length > 0))
    .map((row, rowIndex) => {
      const record = {};

      headers.forEach((header, colIndex) => {
        record[header] = row[colIndex] ?? '';
      });

      if (!record.tool_id) {
        throw new Error(`Fila ${rowIndex + 2}: tool_id vacio.`);
      }

      return normalizeRecord(record);
    });

  return records;
}

function fromJsonPayload(rawText) {
  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed)) {
    throw new Error('El JSON de entrada debe ser un array de herramientas.');
  }

  return parsed.map((item, index) => {
    const missing = REQUIRED_FIELDS.filter(
      (field) => !Object.prototype.hasOwnProperty.call(item, field)
    );

    if (missing.length) {
      throw new Error(`Registro ${index + 1}: faltan campos -> ${missing.join(', ')}`);
    }

    return normalizeRecord(item);
  });
}

function validateDuplicates(records) {
  const seen = new Set();

  for (const record of records) {
    if (seen.has(record.tool_id)) {
      throw new Error(`tool_id duplicado: ${record.tool_id}`);
    }

    seen.add(record.tool_id);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (!args.input || !args.output) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const absoluteInput = path.resolve(args.input);
  const absoluteOutput = path.resolve(args.output);

  const rawContent = await readFile(absoluteInput, 'utf8');

  const isJsonInput = absoluteInput.toLowerCase().endsWith('.json');
  const records = isJsonInput
    ? fromJsonPayload(rawContent)
    : fromCsvRows(parseCsv(rawContent));

  validateDuplicates(records);

  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, `${JSON.stringify(records, null, 2)}\n`, 'utf8');

  console.log(`Importacion completada: ${records.length} herramientas en ${absoluteOutput}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
