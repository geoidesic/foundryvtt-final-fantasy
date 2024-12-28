import { resetActionState } from '~/src/helpers/util.js';
import { SYSTEM_ID } from "~/src/helpers/constants";

export default function combatStart() {

  Hooks.on("combatStart", async (combat, data, meta, id) => {
    const combatStartSound = game.settings.get(SYSTEM_ID, 'combatStartSound').trim();
    if (combatStartSound !== '') {
      AudioHelper.play({ src: combatStartSound, volume: 1, autoplay: true, loop: false });
    }
  
    const combatants = combat.combatants.contents;
  
    // For each combatant
    for (const combatant of combatants) {
      const actor = combatant.actor;
      if (!actor) continue;
      await resetActionState(actor);
    }
  
    
  });
}