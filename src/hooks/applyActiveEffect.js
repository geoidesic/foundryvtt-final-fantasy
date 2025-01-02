import CustomEffect from "~/src/helpers/CustomEffect";
import { activeEffectModes } from "~/src/helpers/constants"

export default function applyActiveEffect() {
  Hooks.on("applyActiveEffect", async (actor, data, id, state, obj) => {
    // game.system.log.o("applyActiveEffect", { actor, data, id, state, obj });
    // console.trace();
    // const customEffect = new CustomEffect(actor);
    
    // //- iterate effects and then within that loop iterate changes
    // for (const effect of actor.effects) {
    //   //- if effect is suppressed, or disabled, skip it
    //   if (effect.isSuppressed || effect.disabled) continue;
  
    //   for (const change of effect.changes) {
        
    //     //- if the change is a custom mode
    //     if (activeEffectModes.find(e => e.value === change.mode)) {
    //       await customEffect.handleChange(change);
    //     }
    //   }
    // }
  });
}