import type { SavedPrompt, HistoryEntry, ThemeMode, NamingStyle, AppPage } from '../types/prompt';

const SAVED_PROMPTS_KEY = 'prompterranker_saved_prompts';
const HISTORY_KEY = 'prompterranker_history';
const THEME_KEY = 'prompterranker_theme';
const NAMING_STYLE_KEY = 'prompterranker_naming_style';
const LAST_PAGE_KEY = 'prompterranker_active_page';

const LEGACY_KEYS = {
  savedPrompts: 'promptscorer_saved_prompts',
  history: 'promptscorer_history',
  theme: 'promptscorer_theme',
  namingStyle: 'promptscorer_naming_style',
  activePage: 'promptscorer_active_page',
} as const;

function getStoredValue(key: string, legacyKey: string): string | null {
  const currentValue = localStorage.getItem(key);
  if (currentValue !== null) {
    return currentValue;
  }

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null) {
    localStorage.setItem(key, legacyValue);
  }
  return legacyValue;
}

export function getSavedPrompts(): SavedPrompt[] {
  try {
    const raw = getStoredValue(SAVED_PROMPTS_KEY, LEGACY_KEYS.savedPrompts);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePromptToStorage(item: Omit<SavedPrompt, 'id' | 'createdAt'>): SavedPrompt {
  const existing = getSavedPrompts();
  const previousVersions = existing.filter((prompt) => prompt.title === item.title && prompt.category === item.category);
  const newItem: SavedPrompt = {
    ...item,
    version: previousVersions.length + 1,
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...existing];
  try {
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save prompt:', err);
  }

  return newItem;
}

export function exportSavedPrompts(): string {
  return JSON.stringify({
    schema: 'prompterranker-library',
    version: 1,
    exportedAt: new Date().toISOString(),
    prompts: getSavedPrompts(),
  }, null, 2);
}

export function importSavedPrompts(raw: string): { imported: number; skipped: number } {
  const parsed: unknown = JSON.parse(raw);
  const prompts = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && 'prompts' in parsed && Array.isArray(parsed.prompts)
      ? parsed.prompts
      : null;

  if (!prompts) {
    throw new Error('Invalid PrompterRanker backup: expected a prompts array.');
  }

  const validPrompts = prompts.filter((item): item is SavedPrompt => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Partial<SavedPrompt>;
    return typeof candidate.title === 'string'
      && typeof candidate.prompt === 'string'
      && typeof candidate.category === 'string'
      && typeof candidate.score === 'number'
      && typeof candidate.tokenCount === 'number';
  });

  const existing = getSavedPrompts();
  const imported = validPrompts.map((item) => ({
    ...item,
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    version: typeof item.version === 'number' ? item.version : 1,
  }));
  localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify([...imported, ...existing]));
  return { imported: imported.length, skipped: prompts.length - imported.length };
}

export function deleteSavedPrompt(id: string): void {
  const existing = getSavedPrompts();
  const updated = existing.filter((p) => p.id !== id);
  try {
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete saved prompt:', err);
  }
}

export function getPromptHistory(): HistoryEntry[] {
  try {
    const raw = getStoredValue(HISTORY_KEY, LEGACY_KEYS.history);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const existing = getPromptHistory();
  // Don't add duplicate if the prompt is identical to the top one
  if (existing.length > 0 && existing[0].prompt === entry.prompt) {
    return;
  }
  const newEntry: HistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  // Keep last 50 entries
  const updated = [newEntry, ...existing.slice(0, 49)];
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to log prompt history:', err);
  }
}

export function clearPromptHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const theme = getStoredValue(THEME_KEY, LEGACY_KEYS.theme);
    return theme === 'light' ? 'light' : 'dark'; // Default to dark
  } catch {
    return 'dark';
  }
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to store theme:', err);
  }
}

export function getStoredNamingStyle(): NamingStyle {
  try {
    const style = getStoredValue(NAMING_STYLE_KEY, LEGACY_KEYS.namingStyle);
    return style === 'neutral' ? 'neutral' : 'standard';
  } catch {
    return 'standard';
  }
}

export function setStoredNamingStyle(style: NamingStyle): void {
  try {
    localStorage.setItem(NAMING_STYLE_KEY, style);
  } catch (err) {
    console.error('Failed to store naming style:', err);
  }
}

export function getStoredActivePage(): AppPage {
  try {
    const page = getStoredValue(LAST_PAGE_KEY, LEGACY_KEYS.activePage) as AppPage;
    return page || 'studio';
  } catch {
    return 'studio';
  }
}

export function setStoredActivePage(page: AppPage): void {
  try {
    localStorage.setItem(LAST_PAGE_KEY, page);
  } catch (err) {
    console.error('Failed to store active page:', err);
  }
}
