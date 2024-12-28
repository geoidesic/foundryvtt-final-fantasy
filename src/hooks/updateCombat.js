import { resetUses, resetActionState } from '~/src/helpers/util.js';

export default function renderCombatTracker() {
  // Reset uses at end of turn for abilities with 'turn' limitation units
  Hooks.on("updateCombat", async (combat, changed, options, userId) => {
    // Only process if the turn actually changed
    // Only process if the turn actually changed
    if (!("turn" in changed) || changed.turn === null) return;
  
    // Get the previous combatant
    const previousTurn = combat.turns[combat.previous?.turn];
    if (!previousTurn) return;
  
    const actor = previousTurn.actor;
    if (!actor) return;
  
    // Find all items with turn-based limitations
    const turnLimitedItems = actor.items.filter(i =>
      i.system.hasLimitation &&
      i.system.limitationUnits === "turn"
    );
  
    await resetUses(turnLimitedItems);
  
    // Reset action state at end of turn
    await resetActionState(actor, true);
  
    //- reset hasMoved flag
    await actor.update({ system: { hasMoved: false } });
  
    //- reset any ActiveEffects that have origin actions with a duration of 'turn'
    // const effects = actor.effects.filter(e => e.origin?.action?.system.durationUnits === 'turn');
    // for (const effect of effects) {
    //   //- for enabler effects, disable them
    //   if (effect.origin?.action?.type === 'enabler') {
    //     await effect.update({ disabled: true });
    //   }
    //   //- for other effects, delete them
    //   else {
    //     await effect.delete();
    //   }
    // }
  
  });
  
}
