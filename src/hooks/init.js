import { SYSTEM_ID } from "~/src/helpers/constants";
import { log } from "~/src/helpers/util"

import { registerSettings } from "~/src/settings"
import { setupModels } from '~/src/config/models';
import { setupEffectsProcessors } from '~/src/config/effectsProcessors';

import FFActiveEffectSheet from "~/src/components/applications/FFActiveEffectSheet";
import FF15PCSheet from "~/src/components/applications/PCSheet";
import FF15NPCSheet from "~/src/components/applications/NPCSheet";
import FF15ItemSheet from "~/src/components/applications/ItemSheet";
import FFCombatTracker from '~/src//extensions/combat-tracker.js'
import ItemSheetStandard from "~/src/components/applications/ItemSheetStandard";
import hooks from "~/src/hooks";
import systemconfig from "~/src/helpers/systemconfig.ts"

export default function init() {

  Hooks.once("init", async (a, b, c) => {

    CONFIG.ui.combat = FFCombatTracker;
    game.system.log = log;
    log.level = log.VERBOSE;
    game.system.log.i(`Starting System ${SYSTEM_ID}`);
  
    // CONFIG.debug.hooks = true;
  
    registerSettings();
    setupModels();
    setupEffectsProcessors();
  
    game.system.config = systemconfig;
    game.system.log.d(game.system.id)
    game.system.log.d(game.system.config)
  
    //- Regiser Sheets
    Actors.registerSheet("foundryvtt-final-fantasy", FF15PCSheet, {
      makeDefault: true,
      types: ["PC"]
    });
    Actors.registerSheet("foundryvtt-final-fantasy", FF15NPCSheet, {
      makeDefault: true,
      types: ["NPC"]
    });
    Items.registerSheet("foundryvtt-final-fantasy", FF15ItemSheet, {
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
  
    Hooks.call("gff15.initIsComplete");
  
    // Override the default combat tracker behavior
    hooks.renderCombatTracker();
    
  });
}