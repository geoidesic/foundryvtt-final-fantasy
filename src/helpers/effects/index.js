// Import effects directly
import PrimaryBaseDamageBuff from './PrimaryBaseDamageBuff.js';
import DamageDiceReroll from './DamageDiceReroll.js';
import TransferEffectToAllies from './TransferEffectToAllies.js';
import EnableCombatTurnSlot from './EnableCombatTurnSlot.js';
import DamageOverTime from './DamageOverTime.js';
import ProcTrigger from './ProcTrigger.js';

/**
 * Collection of custom effect processors
 * @type {Object.<string, any>}
 */
export default {
  PrimaryBaseDamageBuff,
  DamageDiceReroll,
  TransferEffectToAllies,
  EnableCombatTurnSlot,
  DamageOverTime,
  ProcTrigger
};

/**
 * Register effect processors with the system
 */
export function registerEffectProcessors() {
  // ... other registrations ...

  Hooks.on('FF15.procTrigger', (event) => {
    const processor = new ProcTrigger(event.actor);
    processor.process(event);
  });
}

/**
 * Process all effects for an actor
 * @param {Actor} actor - The actor to process effects for
 * @param {object} event - The event data
 * @return {Promise<void>} A promise that resolves when all effects are processed
 */