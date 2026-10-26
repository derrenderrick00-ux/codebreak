import { FLOOR_COUNT, getFloor } from '../content/floors.js';
const KEY = 'codebreak:progress:v2';
const BACKUP_KEY = 'codebreak:corrupt:last';
const VERSION = 2;

export function createProgress() {
  return {
    version: VERSION, currentFloor: 0, unlockedFloor: 0, completed: [], attempts: {},
    mastered: {}, mode: 'guided', onboarding: false, diagnostic: null,
    sound: false, playedIntro: false, chapterCompleted: false, updatedAt: new Date().toISOString()
  };
}
function validFloor(n) { return Number.isInteger(n) && n >= 0 && n <= FLOOR_COUNT; }
export function normalizeProgress(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return createProgress();
  if (candidate.version !== VERSION) throw new Error('Unsupported progress file version');
  const base = createProgress();
  base.unlockedFloor = validFloor(candidate.unlockedFloor) ? candidate.unlockedFloor : 0;
  base.currentFloor = validFloor(candidate.currentFloor) ? Math.min(candidate.currentFloor, base.unlockedFloor) : 0;
  base.completed = Array.isArray(candidate.completed) ? [...new Set(candidate.completed.filter(validFloor))].sort((a,b)=>a-b) : [];
  base.attempts = {};
  for (const [key,value] of Object.entries(candidate.attempts ?? {})) {
    if (validFloor(Number(key)) && Number.isInteger(value) && value >= 0 && value < 100000) base.attempts[key] = value;
  }
  base.mastered = {};
  for (const [key,value] of Object.entries(candidate.mastered ?? {})) {
    if (validFloor(Number(key)) && value === true && base.completed.includes(Number(key))) base.mastered[key] = true;
  }
  base.mode = ['guided', 'practice', 'mastery'].includes(candidate.mode) ? candidate.mode : 'guided';
  base.onboarding = candidate.onboarding === true;
  base.playedIntro = candidate.playedIntro === true;
  base.chapterCompleted = candidate.chapterCompleted === true && base.completed.includes(10);
  base.sound = candidate.sound === true;
  base.diagnostic = candidate.diagnostic && typeof candidate.diagnostic === 'object'
    && Number.isInteger(candidate.diagnostic.score) && candidate.diagnostic.score >= 0 && candidate.diagnostic.score <= 8
    ? { score: candidate.diagnostic.score, total: 8, recommendedFloor: validFloor(candidate.diagnostic.recommendedFloor) ? candidate.diagnostic.recommendedFloor : 1 } : null;
  base.updatedAt = typeof candidate.updatedAt === 'string' ? candidate.updatedAt : base.updatedAt;
  // Completing a floor always unlocks its successor; a diagnostic can unlock additional floors.
  for (const n of base.completed) base.unlockedFloor = Math.max(base.unlockedFloor, Math.min(10, n + 1));
  base.currentFloor = Math.min(base.currentFloor, base.unlockedFloor);
  return base;
}
export function loadProgress(store) {
  try { store ??= globalThis.localStorage; const raw = store.getItem(KEY); return raw ? normalizeProgress(JSON.parse(raw)) : createProgress(); }
  catch (error) {
    try { const raw = store.getItem(KEY); if (raw) store.setItem(BACKUP_KEY, String(raw).slice(0,500000)); store.removeItem(KEY); } catch { /* storage can be disabled */ }
    return createProgress();
  }
}
export function saveProgress(progress, store) {
  const normalized = normalizeProgress({ ...progress, updatedAt: new Date().toISOString() });
  try { (store ?? globalThis.localStorage).setItem(KEY, JSON.stringify(normalized)); } catch { /* private browsing or full storage */ }
  return normalized;
}
export function completeFloor(progress, floor) {
  if (!validFloor(floor)) throw new Error('Invalid floor number');
  const next = normalizeProgress(progress);
  next.completed = [...new Set([...next.completed, floor])].sort((a,b)=>a-b);
  next.mastered[String(floor)] = true; // All automated tests passed; counts as floor-level mastery only.
  next.unlockedFloor = Math.max(next.unlockedFloor, Math.min(10, floor + 1));
  if (floor === 10) next.chapterCompleted = true;
  return next;
}
export function registerAttempt(progress, floor) {
  const next = normalizeProgress(progress);
  next.attempts[String(floor)] = (next.attempts[String(floor)] ?? 0) + 1;
  return next;
}
export function applyPlacement(progress, diagnostic) {
  const next = normalizeProgress(progress);
  next.diagnostic = { ...diagnostic };
  next.unlockedFloor = Math.max(next.unlockedFloor, diagnostic.recommendedFloor);
  next.currentFloor = diagnostic.recommendedFloor;
  next.onboarding = true;
  return next;
}
export function setCurrentFloor(progress, floor) {
  if (!validFloor(floor) || floor > progress.unlockedFloor) throw new Error('Floor is locked');
  const next = normalizeProgress(progress); next.currentFloor = floor; return next;
}
export function summarize(progress) {
  const cleared = progress.completed.filter(n => n >= 1 && n <= 10).length;
  return { cleared, total: FLOOR_COUNT, percentage: Math.round(cleared / FLOOR_COUNT * 100), core: progress.chapterCompleted, current: getFloor(progress.currentFloor).title };
}
export function exportProgress(progress) { return JSON.stringify(normalizeProgress(progress), null, 2); }
export function importProgress(text) { return normalizeProgress(JSON.parse(text)); }
export const PROGRESS_KEY = KEY;
