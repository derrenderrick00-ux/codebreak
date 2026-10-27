import test from 'node:test';
import assert from 'node:assert/strict';
import { canUseGameKeyboard, isEditableElement, shouldPreventGameScroll } from '../src/game/keyboardFocus.js';

function element(tag, { editable = false, role = null } = {}) {
  return { nodeName: tag.toUpperCase(), closest(selector) {
    if (tag === 'textarea' || tag === 'input' || tag === 'select') return this;
    if (editable && selector.includes('[contenteditable]')) return this;
    if (role === 'textbox' && selector.includes('[role="textbox"]')) return this;
    return null;
  } };
}
const body = element('body');
const textarea = element('textarea');
const input = element('input');
const button = element('button');
const canvas = element('canvas');
const event = (key, target, extras = {}) => ({ key, target, ...extras });

test('editable targets keep Space and all four arrows for typing/caret motion', () => {
  for (const target of [textarea, input, element('div',{ editable:true }), element('div',{role:'textbox'})]) {
    assert.ok(isEditableElement(target));
    assert.equal(canUseGameKeyboard({activeElement: target}), false);
    for (const key of [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
      assert.equal(shouldPreventGameScroll(event(key, target), {body}), false, `${key} in ${target.nodeName}`);
    }
  }
});

test('modal and form focus disable game controls', () => {
  assert.equal(canUseGameKeyboard({modalOpen:true,activeElement:body}),false);
  assert.equal(canUseGameKeyboard({modalOpen:false,activeElement:textarea}),false);
  assert.equal(shouldPreventGameScroll(event(' ',body),{modalOpen:true,body}),false);
  assert.equal(shouldPreventGameScroll(event('ArrowLeft',button),{body}),false);
});

test('outside dialogs only movement scroll keys are reserved for game world', () => {
  for(const key of [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
    assert.equal(shouldPreventGameScroll(event(key,body),{body}),true);
    assert.equal(shouldPreventGameScroll(event(key,canvas),{body}),true);
  }
  assert.equal(shouldPreventGameScroll(event('Enter',body),{body}),false);
  assert.equal(shouldPreventGameScroll(event(' ',body,{ctrlKey:true}),{body}),false);
  assert.equal(shouldPreventGameScroll(event('ArrowLeft',body,{altKey:true}),{body}),false);
  assert.equal(shouldPreventGameScroll(event(' ',body,{isComposing:true}),{body}),false);
});

test('Phaser keyboard setup opts out of global key capture', async () => {
  const {readFile} = await import('node:fs/promises');
  const scene = await readFile(new URL('../src/game/GameScene.js', import.meta.url),'utf8');
  assert.match(scene, /addKeys\('A,D,W,LEFT,RIGHT,UP,SPACE,E,SHIFT,ESC', false\)/);
  assert.match(scene, /canUseGameKeyboard\(\{ modalOpen: this\.isLocked, activeElement: document\.activeElement \}\)/);
});
