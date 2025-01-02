import { SYSTEM_ID } from "~/src/helpers/constants";

export const registerUpdateActiveEffectHook = () => {
  Hooks.on('preUpdateActiveEffect', async (effect, changes) => {
    // If the effect is being disabled or duration is expiring
    if (changes.disabled || (changes.duration?.remaining === 0)) {
      // Find all effects that were transferred from this actor
      const transferredEffects = game.actors.reduce((acc, actor) => {
        return acc.concat(actor.effects.filter(e => 
          e.getFlag(SYSTEM_ID, 'transferredFrom') === effect.parent.uuid &&
          e.name === effect.name
        ));
      }, []);
      
      game.system.log.p("[EFFECT] Removing transferred effects for", effect.name);
      
      for (const transferredEffect of transferredEffects) {
        await transferredEffect.delete();
      }
    }
  });
}; 