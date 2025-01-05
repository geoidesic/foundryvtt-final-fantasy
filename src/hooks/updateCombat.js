import { resetUses, resetActionState } from '~/src/helpers/util.js';
import { ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

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
  
    // Check for expired effects and process DOT effects on all actors in combat
    for (const combatant of combat.turns) {
      const currentActor = combatant.actor;
      if (!currentActor) continue;

      game.system.log.o("[EFFECT] Processing actor:", {
        name: currentActor.name,
        type: currentActor.type,
        id: currentActor.id
      });

      const effects = currentActor.effects;
      game.system.log.o("[EFFECT] Actor effects count:", effects.size);

      for (const effect of effects) {
        game.system.log.o("[EFFECT] Processing effect:", {
          name: effect.name,
          disabled: effect.disabled,
          changes: effect.changes
        });

        // Get the previous turn's state
        const previousCombatant = combat.turns[combat.previous?.turn];
        const nextCombatant = combat.turns[combat.previous?.turn + 1];
        const wasAdventurerStepEnd = previousCombatant?.actor?.type === "PC" && nextCombatant?.actor?.type === "NPC";
        const wasEnemyStepEnd = previousCombatant?.actor?.type === "NPC" && (!nextCombatant || nextCombatant?.actor?.type === "PC");

        game.system.log.o("[EFFECT] Previous combat state:", {
          wasAdventurerStepEnd,
          wasEnemyStepEnd,
          previousCombatant: previousCombatant?.actor?.name,
          nextCombatant: nextCombatant?.actor?.name
        });

        // Process DOT effects at the end of each step
        if (!effect.disabled) {
          // At adventurer step end, process DOTs on PCs
          if (wasAdventurerStepEnd && currentActor.type === "PC") {
            game.system.log.o("[EFFECT] Processing PC DOT at adventurer step end");
            for (const change of effect.changes) {
              game.system.log.o("[EFFECT] Checking PC change:", {
                key: change.key,
                mode: change.mode,
                value: change.value,
                expectedMode: ACTIVE_EFFECT_MODES.CUSTOM
              });
              if (change.key === "DamageOverTime" && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
                await Hooks.callAll('FF15.DamageOverTime', { actor: currentActor, change, effect });
              }
            }
          }
          // At enemy step end, process DOTs on NPCs
          else if (wasEnemyStepEnd && currentActor.type === "NPC") {
            game.system.log.o("[EFFECT] Processing NPC DOT at enemy step end");
            for (const change of effect.changes) {
              game.system.log.o("[EFFECT] Checking NPC change:", {
                key: change.key,
                mode: change.mode,
                value: change.value,
                expectedMode: ACTIVE_EFFECT_MODES.CUSTOM
              });
              if (change.key === "DamageOverTime" && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
                game.system.log.o("[EFFECT] Found valid DOT change, calling hook");
                await Hooks.callAll('FF15.DamageOverTime', { actor: currentActor, change, effect });
              }
            }
          }
        }

        // Skip effects without duration
        if (!effect.duration?.rounds && !effect.duration?.turns) continue;

        // Check if effect has expired
        const isExpired = effect.duration.remaining <= 0;
        if (!isExpired) continue;

        //- delete the effect if it still exists
        if(actor.effects.find(e => e.id === effect.id)) {
          try {
            await effect.delete();
          } catch (error) {
            game.system.log.e("[EFFECT] Error deleting effect:", error);
          }
        }

        //- transmit delete hook for any custom changes
        for (const change of effect.changes) {
          if (ACTIVE_EFFECT_MODES.CUSTOM === change.mode) {
            await Hooks.callAll(`FF15.${change.key}Delete`, { actor: currentActor, change, effect });
          }
        }
      }
    }
  });
}
