import './styles/Variables.sass';
import './styles/Main.sass';
import './styles/MarginsAndPadding.sass';

import { SYSTEM_ID } from "~/src/helpers/constants"
import { log } from "~/src/helpers/utility"
import { registerSettings } from "~/src/settings"
import WelcomeApplication from "~/src/components/applications/WelcomeApplication"

window.log = log;
log.level = log.DEBUG;



Hooks.once("init", async (a, b, c) => {
  log.d(`Starting System ${SYSTEM_ID}`);

  CONFIG.debug.hooks = true;

  registerSettings();
  Hooks.call("gff15.initIsComplete");
});

Hooks.once("ready", async () => {
  if (!game.settings.get(SYSTEM_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }
});
