import WelcomeApplication from "~/src/components/applications/WelcomeApplication"
import { SYSTEM_ID } from "~/src/helpers/constants"
import { initializeAutoAnimations } from "./autoAnimationsIntegration.js"

/**
 * Hook that runs when the system is ready
 * @return {void}
 */
export default function canvasReady() {
  Hooks.once("ready", async () => {
    if (!game.settings.get(SYSTEM_ID, 'dontShowWelcome')) {
      new WelcomeApplication().render(true, { focus: true });
    }
    
    // Initialize AutoAnimations integration
    initializeAutoAnimations();
  });
}