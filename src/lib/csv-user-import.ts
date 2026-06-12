export interface CsvUserRow {
  name: string;
  age: number;
  username: string;
  password: string;
  tent_name: string;
}

const HEADER_MAP: Record<string, keyof CsvUserRow | 'skip'> = {
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

function normalizeHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function parseUsersCsv(text: string): { rows: CsvUserRow[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ['Dosyada en az bir başlık satırı ve bir veri satırı olmalı.'] };
  }

  const delim = detectDelimiter(lines[0]);
  const headers = parseLine(lines[0], delim).map(normalizeHeader);
  const fieldIndexes: Partial<Record<keyof CsvUserRow, number>> = {};

  headers.forEach((h, i) => {
    const mapped = HEADER_MAP[h];
    if (mapped && mapped !== 'skip') fieldIndexes[mapped] = i;
  });

  const required: (keyof CsvUserRow)[] = ['name', 'username', 'password', 'tent_name'];
  for (const key of required) {
    if (fieldIndexes[key] === undefined) {
      errors.push(`Eksik sütun: ${key} (ad_soyad, kullanici_adi, sifre, cadir_adi)`);
    }
  }
  if (errors.length) return { rows: [], errors };

  const rows: CsvUserRow[] = [];

  for (let li = 1; li < lines.length; li++) {
    const cells = parseLine(lines[li], delim);
    const get = (key: keyof CsvUserRow) => cells[fieldIndexes[key]!] ?? '';

    const ageRaw = get('age');
    const age = ageRaw ? Number(ageRaw) : 30;
    if (Number.isNaN(age) || age < 1 || age > 120) {
      errors.push(`Satır ${li + 1}: geçersiz yaş`);
      continue;
    }

    const row: CsvUserRow = {
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

    rows.push(row);
  }

  return { rows, errors };
}

export const CSV_TEMPLATE = `ad_soyad,yas,kullanici_adi,sifre,cadir_adi
Ahmet Yılmaz,35,ahmet,OrnekSifre123,Büyük Aile Çadırı
Ayşe Yılmaz,32,ayse,OrnekSifre456,Büyük Aile Çadırı`;
