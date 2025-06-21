import { SYSTEM_ID } from "~/src/helpers/constants";
import { log } from "~/src/helpers/util"

import { registerSettings } from "~/src/settings"
import { setupModels } from '~/src/config/models';

import FFActiveEffectSheet from "~/src/components/applications/FFActiveEffectSheet";
import FFXIVPCSheet from "~/src/components/applications/PCSheet";
import FFXIVNPCSheet from "~/src/components/applications/NPCSheet";
import FFXIVItemSheet from "~/src/components/applications/ItemSheet";
import FFCombatTracker from '~/src//extensions/combat-tracker.js'
import hooks from "~/src/hooks";
import systemconfig from "~/src/helpers/systemconfig.ts"


/**
 * Hook that runs during system initialization
 * @return {void}
*/
export default function init() {

  Hooks.once("init", async (a, b, c) => {
    game.FFXIV = game.system;
    game.system.log = log;
    game.system.log.level = log.VERBOSE;
    game.system.log.i(`Starting System ${SYSTEM_ID}`);

    if (game.version > 13) {
      // V12 -> 13 SHIM
      window.MIN_WINDOW_WIDTH = 200;
      window.MIN_WINDOW_HEIGHT = 50;
    }

    registerSettings();
    setupModels();

    game.system.config = systemconfig;
    game.system.log.d(game.system.id)
    game.system.log.d(game.system.config)


    CONFIG.ui.combat = FFCombatTracker;

    //- Regiser Sheets
    Actors.registerSheet("foundryvtt-final-fantasy", FFXIVPCSheet, {
      makeDefault: true,
      types: ["PC"]
    });
    Actors.registerSheet("foundryvtt-final-fantasy", FFXIVNPCSheet, {
      makeDefault: true,
      types: ["NPC"]
    });
    Items.registerSheet("foundryvtt-final-fantasy", FFXIVItemSheet, {
      makeDefault: true,
    });

    DocumentSheetConfig.registerSheet(ActiveEffect, "foundryvtt-final-fantasy", FFActiveEffectSheet, {
      makeDefault: true,
    });



    Handlebars.registerHelper("getSetting", function (moduleName, settingKey) {
      return game.settings.get(moduleName, settingKey);
    });

    //- for testing without Svelte (handy when asking questions on Discord)
    // Items.registerSheet("foundryvtt-final-fantasy", ItemSheetStandard, {
    //   makeDefault: true,
    // });

    Hooks.call("FFXIV.initIsComplete");

    // Override the default combat tracker behavior
    hooks.renderCombatTracker();

  });
}