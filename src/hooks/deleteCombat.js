import { resetActionState, resetUses } from '~/src/helpers/util.js';

export default function deleteCombat() {
  Hooks.on("deleteCombat", async (combat) => {
    const combatants = combat.combatants.contents;
  
    // For each combatant
    for (const combatant of combatants) {
      const actor = combatant.actor;
      if (!actor) continue;
  
      // Get all items that have limitations
      const items = actor.items.filter(i => i.system.hasLimitation);
      await resetUses(items);
  
      // Disable or delete all status effects
      for (const effect of actor.effects) {
        if (effect.isTransferred) {
          await effect.update({ disabled: true });
        } else {
          await effect.delete();
        }
      }
      await resetActionState(actor, true);
    }
  });
  
}