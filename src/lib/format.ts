const LOCALE = 'tr-TR';

/** Her kelimenin ilk harfi büyük, kalanı küçük (Türkçe): "ömer kaçar" → "Ömer Kaçar" */
export function formatTitleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase(LOCALE);
      if (!lower) return '';
      return lower.charAt(0).toLocaleUpperCase(LOCALE) + lower.slice(1);
    })
    .join(' ');
}

export function formatPersonName(name: string): string {
  return formatTitleCase(name);
}
