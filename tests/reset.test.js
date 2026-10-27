import test from 'node:test';
import assert from 'node:assert/strict';
import { resetLocalGame } from '../src/state/reset.js';
import { createProgress, completeFloor, saveProgress, loadProgress } from '../src/state/progress.js';

function storage() {
  const contents = new Map();
  return {
    getItem: key => contents.get(key) ?? null,
    setItem: (key, value) => contents.set(key, String(value)),
    removeItem: key => contents.delete(key)
  };
}

test('New game starts at Floor 0 and shows onboarding again', () => {
  const store = storage();
  let progress = completeFloor(createProgress(), 10);
  progress.onboarding = true;
  progress.diagnostic = { score: 7, total: 8, recommendedFloor: 7 };
  saveProgress(progress, store);
  const next = resetLocalGame(store);
  assert.equal(next.currentFloor, 0);
  assert.equal(next.unlockedFloor, 0);
  assert.equal(next.onboarding, false);
  assert.equal(next.diagnostic, null);
  assert.deepEqual(next.completed, []);
  assert.deepEqual(next.mastered, {});
  assert.equal(next.chapterCompleted, false);
  assert.deepEqual(loadProgress(store).completed, []);
});

test('New game clears only CodeBreak editor drafts, including Floor 100', () => {
  const store = storage();
  store.setItem('codebreak:draft:v1:0', 'function identify() {}');
  store.setItem('codebreak:draft:v1:100', 'final code');
  store.setItem('other-app:save', 'preserve');
  resetLocalGame(store);
  assert.equal(store.getItem('codebreak:draft:v1:0'), null);
  assert.equal(store.getItem('codebreak:draft:v1:100'), null);
  assert.equal(store.getItem('other-app:save'), 'preserve');
});

test('New game remains possible when draft removal is blocked', () => {
  const store = storage();
  store.removeItem = () => { throw new Error('Storage blocked'); };
  const next = resetLocalGame(store);
  assert.equal(next.currentFloor, 0);
});
