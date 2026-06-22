import * as XLSX from 'xlsx';

export interface UserImportRow {
  name: string;
  age: number;
  username: string;
  password: string;
  tent_name: string;
}

const HEADER_MAP: Record<string, keyof UserImportRow | 'skip'> = {
  ad_soyad: 'name',
  ad: 'name',
  name: 'name',
  isim: 'name',
  yas: 'age',
  age: 'age',
  kullanici_adi: 'username',
  kullanici: 'username',
  username: 'username',
  sifre: 'password',
  password: 'password',
  cadir_adi: 'tent_name',
  cadir: 'tent_name',
  tent: 'tent_name',
  tent_name: 'tent_name',
};

function foldTurkish(s: string): string {
  return s
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function normalizeHeader(h: string): string {
  return foldTurkish(
    h
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
  );
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  return String(value).trim();
}

function parseTable(rows: unknown[][]): { rows: UserImportRow[]; errors: string[] } {
  const errors: string[] = [];
  const nonEmpty = rows.filter((row) => row.some((c) => cellToString(c) !== ''));

  if (nonEmpty.length < 2) {
    return { rows: [], errors: ['Dosyada en az bir başlık satırı ve bir veri satırı olmalı.'] };
  }

  const headers = nonEmpty[0].map((h) => normalizeHeader(cellToString(h)));
  const fieldIndexes: Partial<Record<keyof UserImportRow, number>> = {};

  headers.forEach((h, i) => {
    const mapped = HEADER_MAP[h];
    if (mapped && mapped !== 'skip') fieldIndexes[mapped] = i;
  });

  const required: (keyof UserImportRow)[] = ['name', 'username', 'password', 'tent_name'];
  for (const key of required) {
    if (fieldIndexes[key] === undefined) {
      errors.push(
        `Eksik sütun: ${key}. Beklenen başlıklar: Ad Soyad, Yaş, Kullanıcı Adı, Şifre, Çadır Adı`
      );
    }
  }
  if (errors.length) return { rows: [], errors };

  const parsed: UserImportRow[] = [];

  for (let li = 1; li < nonEmpty.length; li++) {
    const cells = nonEmpty[li].map(cellToString);
    const get = (key: keyof UserImportRow) => cells[fieldIndexes[key]!] ?? '';

    const ageRaw = get('age');
    const age = ageRaw ? Number(ageRaw) : 30;
    if (Number.isNaN(age) || age < 1 || age > 120) {
      errors.push(`Satır ${li + 1}: geçersiz yaş`);
      continue;
    }

    const row: UserImportRow = {
      name: get('name'),
      age,
      username: get('username'),
      password: get('password'),
      tent_name: get('tent_name'),
    };

    if (!row.name || !row.username || !row.password || !row.tent_name) {
      errors.push(`Satır ${li + 1}: boş alan var`);
      continue;
    }

    parsed.push(row);
  }

  return { rows: parsed, errors };
}

function detectDelimiter(line: string): ',' | ';' | '\t' {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of line) {
    if (ch in counts) counts[ch as keyof typeof counts]++;
  }
  if (counts[';'] >= counts[','] && counts[';'] >= counts['\t']) return ';';
  if (counts['\t'] > counts[',']) return '\t';
  return ',';
}

function parseLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delim) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export function parseUsersCsv(text: string): { rows: UserImportRow[]; errors: string[] } {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ['Dosyada en az bir başlık satırı ve bir veri satırı olmalı.'] };
  }

  const delim = detectDelimiter(lines[0]);
  const table = lines.map((line) => parseLine(line, delim));
  return parseTable(table);
}

export function parseUsersXlsx(buffer: ArrayBuffer): { rows: UserImportRow[]; errors: string[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], errors: ['Excel dosyasında sayfa bulunamadı.'] };
  }
  const sheet = workbook.Sheets[sheetName];
  const table = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as unknown[][];
  return parseTable(table);
}

export function parseUsersFile(
  buffer: ArrayBuffer,
  filename: string
): { rows: UserImportRow[]; errors: string[] } {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return parseUsersXlsx(buffer);
  }
  const text = new TextDecoder('utf-8').decode(buffer);
  return parseUsersCsv(text);
}

const TEMPLATE_ROWS: unknown[][] = [
  ['Ad Soyad', 'Yaş', 'Kullanıcı Adı', 'Şifre', 'Çadır Adı'],
  ['Ahmet Yılmaz', 35, 'ahmet', 'OrnekSifre123', 'Büyük Aile Çadırı'],
  ['Ayşe Yılmaz', 32, 'ayse', 'OrnekSifre456', 'Büyük Aile Çadırı'],
];

export function buildUserImportTemplateBuffer(): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet(TEMPLATE_ROWS);
  sheet['!cols'] = [{ wch: 22 }, { wch: 8 }, { wch: 18 }, { wch: 20 }, { wch: 24 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Katılımcılar');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

/** @deprecated use UserImportRow */
export type CsvUserRow = UserImportRow;
