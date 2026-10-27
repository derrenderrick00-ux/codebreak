/**
 * Keyboard routing for CodeBreak.
 * The game owns movement keys only while the player is in the game world.
 * The browser owns those keys inside editors, forms, dialogs, and other UI.
 */
const NAVIGATION_KEYS = new Set([' ', 'Spacebar', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export function isEditableElement(element) {
  if (!element || typeof element.closest !== 'function') return false;
  return Boolean(element.closest('textarea, input, select, [contenteditable], [role="textbox"], [role="combobox"]'));
}

export function canUseGameKeyboard({ modalOpen = false, activeElement = null } = {}) {
  return !modalOpen && !isEditableElement(activeElement);
}

export function shouldPreventGameScroll(event, { modalOpen = false, body = null } = {}) {
  if (!event || !canUseGameKeyboard({ modalOpen, activeElement: event.target })) return false;
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return false;
  if (!NAVIGATION_KEYS.has(event.key)) return false;
  const target = event.target;
  // Keep browser keyboard behavior on buttons, links, controls, dialogs, etc.
  // Only suppress scrolling when the game itself has keyboard focus.
  return Boolean(target && (target === body || target.nodeName === 'CANVAS' || target.nodeName === 'HTML'));
}
