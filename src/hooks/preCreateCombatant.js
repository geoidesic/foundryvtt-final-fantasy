import { resetActionState } from '~/src/helpers/util.js';

export default function preCreateCombatant() {
  Hooks.on("preCreateCombatant", async (combatant, data, meta, id) => {
    const actor = combatant.actor;
    if (!actor) return;
    await resetActionState(actor);
  });
}