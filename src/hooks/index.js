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
import canvasReady from './canvasReady.js';
import preCreateCombatant from './preCreateCombatant.js';
import updateActiveEffect from './updateActiveEffect.js';
import ready from './ready.js';
import init from './init.js';
import effects from '~/src/helpers/effects';

// Export effects as an object
export default {
  renderCombatTracker,
  renderActiveEffectConfig,
  renderChatMessage,
  preDeleteChatMessage,
  targetToken,
  deleteCombat,
  updateCombatant,
  updateCombat,
  applyActiveEffect,
  combatStart,
  preUpdateToken,
  createActiveEffect,
  canvasReady,
  preCreateCombatant,
  updateActiveEffect,
  ready,
  init,
  onDamage,
  onAbilityUse
};

export { 
  renderCombatTracker, 
  renderActiveEffectConfig, 
  renderChatMessage, 
  preDeleteChatMessage,
  targetToken,
  deleteCombat,
  updateCombatant,
  updateCombat,
  applyActiveEffect,
  combatStart,
  preUpdateToken,
  createActiveEffect,
  canvasReady,
  preCreateCombatant,
  updateActiveEffect,
  ready,
  init,
};

/**
 * Hook that runs when damage is applied
 */
function onDamage() {
  Hooks.on("FF15.onDamage", async (event) => {
    const actor = event.actor;
    if (!actor) return;

    const durationManager = new effects.DurationManager(actor);
    await durationManager.onDamage(event);
  });
}

/**
 * Hook that runs when an ability is used
 */
function onAbilityUse() {
  Hooks.on("FF15.onAbilityUse", async (event) => {
    const actor = event.actor;
    const item = event.item;
    if (!actor || !item) return;

    const durationManager = new effects.DurationManager(actor);
    await durationManager.onAbilityUse(item);
  });
}