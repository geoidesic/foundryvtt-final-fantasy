// Import effects directly
import updateCombat from './updateCombat.js';
import renderChatMessage from './renderChatMessage.js';
import renderCombatTracker from './renderCombatTracker.js';
import updateCombatant from './updateCombatant.js';
import canvasReady from './canvasReady.js';
import ready from './ready.js';
import init from './init.js';
import effects from '~/src/helpers/effects';

// Export effects as an object
export default {
  renderChatMessage,
  renderCombatTracker,
  updateCombatant,
  updateCombat,
  canvasReady,
  ready,
  init,
  onDamage,
  onAbilityUse
};

export { 
  renderChatMessage, 
  renderCombatTracker,
  updateCombatant,
  updateCombat,
  canvasReady,
  ready,
  init,
};

console.log("[FFXIV] | [HOOKS] Setting up hooks");

/**
 * Hook that runs when damage is applied
 */
function onDamage() {
  Hooks.on("FFXIV.onDamage", async (event) => {
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
  console.log("[FFXIV] | [HOOKS] Registering onAbilityUse hook");
  Hooks.on("FFXIV.onAbilityUse", async (event) => {
    console.log("[FFXIV] | [ABILITY USE HOOK] Hook triggered", {
      itemName: event.item?.name,
      isNewAbilityUse: event.isNewAbilityUse,
      stack: new Error().stack
    });
  });
}