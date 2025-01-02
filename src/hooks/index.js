// Import effects directly
import renderCombatTracker from './renderCombatTracker.js';
import updateCombat from './updateCombat.js';
import renderActiveEffectConfig from './renderActiveEffectConfig.js';
import renderChatMessage from './renderChatMessage.js';
import preDeleteChatMessage from './preDeleteChatMessage.js';
import targetToken from './targetToken.js';
import deleteCombat from './deleteCombat.js';
import updateCombatant from './updateCombatant.js';
import applyActiveEffect from './applyActiveEffect.js';
import combatStart from './combatStart.js';
import preUpdateToken from './preUpdateToken.js';
import createActiveEffect from './createActiveEffect.js';
import init from './init.js';
import canvasReady from './canvasReady.js';
import ready from './ready.js';
import preCreateCombatant from './preCreateCombatant.js';
import { registerUpdateActiveEffectHook } from './updateActiveEffect.js';

// Export effects as an object
export default {
  renderCombatTracker,
  renderActiveEffectConfig,
  renderChatMessage,
  preDeleteChatMessage,
  targetToken,
  deleteCombat,
  updateCombatant,
  applyActiveEffect,
  combatStart,
  preUpdateToken,
  updateCombat,
  createActiveEffect,
  init,
  canvasReady,
  ready,
  preCreateCombatant,
  updateActiveEffect: registerUpdateActiveEffectHook,
};

export { 
  renderCombatTracker, 
  renderActiveEffectConfig, 
  renderChatMessage, 
  preDeleteChatMessage,
  targetToken,
  deleteCombat,
  updateCombatant,
  applyActiveEffect,
  combatStart,
  preUpdateToken,
  updateCombat,
  createActiveEffect,
  init,
  canvasReady,
  ready,
  preCreateCombatant,
  registerUpdateActiveEffectHook as updateActiveEffect,
};