import WelcomeApplication from "~/src/components/applications/WelcomeApplication"
import { SYSTEM_ID } from "~/src/helpers/constants"

export default function canvasReady() {
  Hooks.once("ready", async () => {
    if (!game.settings.get(SYSTEM_ID, 'dontShowWelcome')) {
      new WelcomeApplication().render(true, { focus: true });
    }
  });
}