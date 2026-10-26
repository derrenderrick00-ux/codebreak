import Phaser from 'phaser';
import { GAME_CONFIG } from './game/GameScene.js';
import { AppUI } from './ui/app.js';
import './style.css';

// Create UI listeners before the first Phaser scene emits game:ready.
const ui = new AppUI();
const game = new Phaser.Game(GAME_CONFIG);

// Available for local debugging only; never exposes an execution sandbox.
if (import.meta.env.DEV) window.codebreakDebug = { game, ui };
