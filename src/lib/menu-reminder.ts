export const MENU_SKIPPED_KEY = 'kamp-asistani-menu-skipped';

export function markMenuSkipped() {
  try {
    localStorage.setItem(MENU_SKIPPED_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearMenuSkipped() {
  try {
    localStorage.removeItem(MENU_SKIPPED_KEY);
  } catch {
    /* ignore */
  }
}

export function isMenuSkipped(): boolean {
  try {
    return !!localStorage.getItem(MENU_SKIPPED_KEY);
  } catch {
    return false;
  }
}
