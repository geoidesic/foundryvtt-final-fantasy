import { SYSTEM_ID } from "~/src/helpers/constants";

export default function combatStart() {

  Hooks.on("combatStart", async (combat, data, meta, id) => {
    const combatStartSound = game.settings.get(SYSTEM_ID, 'combatStartSound').trim();
    if (combatStartSound !== '') {
      foundry.audio.AudioHelper.play({ src: combatStartSound, volume: 1, autoplay: true, loop: false });
    }
    await combat.resetCombatantAbilities();
  });
}