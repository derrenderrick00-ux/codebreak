import { FLOOR_COUNT } from '../content/floors.js';
import { createProgress, saveProgress } from './progress.js';

// Reset only CodeBreak's own save and editor drafts, never unrelated site data.
// Downloaded JSON backups are untouched and remain importable.
export function resetLocalGame(store = globalThis.localStorage) {
  for (let floor = 0; floor <= FLOOR_COUNT; floor++) {
    try { store.removeItem(`codebreak:draft:v1:${floor}`); }
    catch { /* Local storage might be blocked; the in-memory reset still works. */ }
  }
  return saveProgress(createProgress(), store);
}
