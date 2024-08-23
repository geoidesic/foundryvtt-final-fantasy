import './styles/Variables.sass';
import './styles/Main.sass';
import './styles/MarginsAndPadding.sass';

import { log } from "~/src/helpers/utility"
import { SYSTEM_ID } from "~/src/helpers/constants"
import { registerSettings } from "~/src/settings"
import { setupModels } from './config/models';
import WelcomeApplication from "~/src/components/applications/WelcomeApplication"
import FF15Actor from '~/src/extensions/actor.js'
import FF15ActorSheet from "~/src/components/applications/ActorSheet";
import FF15ItemSheet from "~/src/components/applications/ItemSheet";
import systemconfig from "~/src/helpers/systemconfig.ts"

//- helpers
function setupDSN() {
  // Set up Dice So Nice to icrementally show attacks then damge rolls
  if (game.modules.get("dice-so-nice")?.active && !game.settings.get(game.system.id, ICON.settings.dsn_setup)) {
      console.log(`First login setup for Dice So Nice`);
      game.settings.set("dice-so-nice", "enabledSimultaneousRolls", true);
      game.settings.set("dice-so-nice", "enabledSimultaneousRollForMessage", true);
      game.settings.set("dice-so-nice", "immediatelyDisplayChatMessages", true);
      game.settings.set(game.system.id, ICON.settings.dsn_setup, true);
  }
}



//- Foundry Class Extensions
CONFIG.Actor.documentClass = FF15Actor


//- Foundry System Hooks
Hooks.once("init", async (a, b, c) => {


  game.system.log = log;
  log.level = log.DEBUG;
  game.system.log.i(`Starting System ${SYSTEM_ID}`);

  // CONFIG.debug.hooks = true;

  registerSettings();
  setupModels();

  game.system.config = systemconfig;
  game.system.log.d(game.system.id)
  game.system.log.d(game.system.config)

  //- Regiser Sheets
  Actors.registerSheet("foundryvtt-final-fantasy", FF15ActorSheet, {
    makeDefault: true,
  });
  Items.registerSheet("foundryvtt-final-fantasy", FF15ItemSheet, {
    makeDefault: true,
  });

  
  Hooks.call("gff15.initIsComplete");
});

Hooks.once("ready", async () => {

  if (!game.settings.get(SYSTEM_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }
});
