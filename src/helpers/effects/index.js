// Import effects directly
import PrimaryBaseDamageBuff from './primaryBaseDamageBuff.js';
import DamageDiceReroll from './DamageDiceReroll.js';
import TransferEffectToAllies from './TransferEffectToAllies.js';
import EnableCombatTurnSlot from './EnableCombatTurnSlot.js';
import DamageOverTime from './DamageOverTime.js';
import ProcTrigger from './ProcTrigger.js';
// Export effects as an object
export default {
  PrimaryBaseDamageBuff,
  DamageDiceReroll,
  TransferEffectToAllies,
  EnableCombatTurnSlot,
  DamageOverTime,
  ProcTrigger
};

export function registerEffectProcessors() {
  // ... other registrations ...

  Hooks.on('FF15.procTrigger', (event) => {
    const processor = new ProcTrigger(event.actor);
    processor.process(event);
  });
}