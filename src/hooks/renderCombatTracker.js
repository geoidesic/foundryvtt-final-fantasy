import { Timing } from "@typhonjs-fvtt/runtime/util";

/**
 * Implements FF rules for turn order steps
 * @return {void}
 */
export default function renderCombatTracker() {
  Hooks.on("renderCombatTracker", (app, html, data) => {
    const isCombatActive = !!game.combat?.started;

    // Create a debounced update function
    const updateDebounced = Timing.debounce(async (combatant, value) => {
      const newInitiative = parseInt(value, 10);
      if (!isNaN(newInitiative) && combatant) {
        await combatant.update({ initiative: newInitiative });
      }
    }, 600);

    // Iterate through combatants
    $(html).find(".combatant").each((index, element) => {
      const combatantId = $(element).data("combatant-id");
      const combatant = game.combat?.combatants.get(combatantId);

      if (combatant && !isCombatActive) {
        // Make initiative editable
        const $initiative = $(element).find(".initiative");

        $initiative.attr("contenteditable", "true");

        $initiative.on("input", (event) => {
          updateDebounced(combatant, $(event.currentTarget).text());
        });

        $initiative.on("dblclick contextmenu", (event) => {
          event.stopPropagation();
          event.preventDefault();
        });

        $initiative.on("blur", async (event) => {
          const newInitiative = parseInt($(event.currentTarget).text(), 10);
          if (!isNaN(newInitiative) && combatant) {
            await combatant.update({ initiative: newInitiative });
          }
        });
      }
    });

    // If we have combat and turns, trigger the updateCombatant hook
    if (data.combat?.turns?.length) {
      // Call the hook with the first combatant and empty update data
      Hooks.call('updateCombatant', data.combat.turns[0], {});
    }
  });
}
