const STORAGE_PREFIX = 'kamp-final-check-';

export function getPackedItems(userId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function setPackedItem(userId: string, itemId: string, packed: boolean) {
  try {
    const current = getPackedItems(userId);
    if (packed) {
      current[itemId] = true;
    } else {
      delete current[itemId];
    }
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(current));
  } catch {
    /* ignore */
  }
}
