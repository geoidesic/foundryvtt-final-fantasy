import { resetUses, resetActionState } from '~/src/helpers/util.js';

export default function renderCombatTracker() {
  // Reset uses at end of turn for abilities with 'turn' limitation units
  Hooks.on("updateCombat", async (combat, changed, options, userId) => {
    // Only process if the turn or round actually changed
    if (!("turn" in changed || "round" in changed) || changed.turn === null) return;
  
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
  
    // Check for expired effects on all actors in combat
    for (const combatant of combat.turns) {
      const currentActor = combatant.actor;
      if (!currentActor) continue;

      const effects = currentActor.effects;
      for (const effect of effects) {
        // Skip effects without duration
        if (!effect.duration?.rounds && !effect.duration?.turns) continue;

        // Check if effect has expired
        const isExpired = effect.duration.remaining <= 0;
        if (!isExpired) continue;

        // Handle expired effect based on type
        if (effect.origin?.action?.type === 'enabler') {
          await effect.update({ disabled: true });
        } else {
          await effect.delete();
        }
      }
    }
  });
}
