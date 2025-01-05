
export default function deleteCombat() {
  Hooks.on("deleteCombat", async (combat) => {
    await combat.resetCombatantAbilities();
  });
  
}