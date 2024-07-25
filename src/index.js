import './styles/Variables.sass';
import './styles/Main.sass';
import './styles/MarginsAndPadding.sass';

import { log } from "~/src/helpers/utility"
import { SYSTEM_ID } from "~/src/helpers/constants"
import { registerSettings } from "~/src/settings"
import WelcomeApplication from "~/src/components/applications/WelcomeApplication"
import FF15Actor from '~/src/extensions/actor.js'
import FF15ActorSheet from "~/src/components/applications/ActorSheet";
import systemconfig from "~/src/helpers/systemconfig.ts"


//- global logging
window.log = log;
log.level = log.DEBUG;

//- Foundry Class Extensions
CONFIG.Actor.documentClass = FF15Actor


//- Foundry System Hooks
Hooks.once("init", async (a, b, c) => {
  log.d(`Starting System ${SYSTEM_ID}`);

  CONFIG.debug.hooks = true;

  registerSettings();

  game.system.config = systemconfig;
  log.d(game.system.id)
  log.d(game.system.config)

  //- Regiser Sheets
  Actors.registerSheet("foundryvtt-final-fantasy", FF15ActorSheet, {
    makeDefault: true,
  });
  
  Hooks.call("gff15.initIsComplete");
});

Hooks.once("ready", async () => {

  if (!game.settings.get(SYSTEM_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }
});
