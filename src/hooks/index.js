// Import effects directly
import renderChatMessage from './renderChatMessage.js';
import renderCombatTracker from './renderCombatTracker.js';
import updateCombatant from './updateCombatant.js';
import canvasReady from './canvasReady.js';
import targetToken from './targetToken.js';
import ready from './ready.js';
import init from './init.js';

// Export effects as an object
export default {
  renderChatMessage,
  renderCombatTracker,
  updateCombatant,
  targetToken,
  canvasReady,
  ready,
  init,
};

export { 
  renderChatMessage, 
  renderCombatTracker,
  updateCombatant,
  targetToken,
  canvasReady,
  ready,
  init,
};

console.log("[FFXIV] | [HOOKS] Setting up hooks");