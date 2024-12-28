export default function preCreateCombatant() {
  Hooks.on("preCreateCombatant", async (combatant, data, meta, id) => {
    const actor = combatant.actor;
    if (!actor) return;
    await resetActionState(actor);
  });
}