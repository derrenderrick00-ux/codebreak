import { AppUI } from './ui/app.js';
import './style.css';

// UI and lessons load first; the much larger Phaser engine loads separately.
// Keeping Phaser behind an async import reduces the initial application chunk.
const ui = new AppUI();
import('./game/GameScene.js').then(({ startGame }) => {
  const game = startGame();
  if (import.meta.env.DEV) window.codebreakDebug = { game, ui };
}).catch((error) => {
  console.error('Game engine failed to initialize',error);
  const status = document.getElementById('game-status');
  if(status) status.textContent = 'GAME ENGINE FAILED TO LOAD — RELOAD OR CHECK CONSOLE';
});
