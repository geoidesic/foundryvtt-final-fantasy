import FFTokenHUD from '~/src/extensions/token-hud.js'
import { getDefaultStatusEffects } from "~/src/helpers/Conditions";

/**
 * Hook that runs when the canvas is ready
 * @return {void}
 */
export default function canvasReady() {

  Hooks.on('canvasReady', () => {
    // render custom token hud
    CONFIG.statusEffects = getDefaultStatusEffects();
    canvas.hud.token = new FFTokenHUD({ defaultStatusEffects: CONFIG.statusEffects })
  
    //- status effects
  
    // measuredTemplates.set(canvas.templates?.placeables || false)
  
  })
}
