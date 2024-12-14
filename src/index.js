import './styles/Main.sass';

import { log } from "~/src/helpers/util"
import { SYSTEM_ID } from "~/src/helpers/constants"
import { setupModels } from './config/models';
import { registerSettings } from "~/src/settings"
import { mappedGameTargets } from '~/src/stores';
import { getDefaultStatusEffects } from "./helpers/Conditions";
import WelcomeApplication from "~/src/components/applications/WelcomeApplication"
import FF15Actor from '~/src/extensions/actor.js'
import FF15ActorSheet from "~/src/components/applications/ActorSheet";
import FF15ItemSheet from "~/src/components/applications/ItemSheet";
import ItemSheetStandard from "~/src/components/applications/ItemSheetStandard";
import systemconfig from "~/src/helpers/systemconfig.ts"
import FFChat from "~/src/components/organisms/chat/FFChat.svelte";
import FFTokenHUD from './extensions/token-hud.js'
import FFCombatTracker from './extensions/combat-tracker.js'
import { Timing } from "@typhonjs-fvtt/runtime/util";

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

//- debug hooks
// CONFIG.debug.hooks = true;


//- Foundry Class Extensions
CONFIG.Actor.documentClass = FF15Actor
CONFIG.ui.combat = FFCombatTracker;

//- Set initiative dice
CONFIG.Combat.initiative = {
  formula: "1d20 + (@attributes.primary.dex.val)",
};



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

  Handlebars.registerHelper("getSetting", function (moduleName, settingKey) {
    return game.settings.get(moduleName, settingKey);
  });

  //- for testing without Svelte (handy when asking questions on Discord)
  // Items.registerSheet("foundryvtt-final-fantasy", ItemSheetStandard, {
  //   makeDefault: true,
  // });

  Hooks.call("gff15.initIsComplete");

  // Override the default combat tracker behavior
  Hooks.on("renderCombatTracker", (app, html) => {
    const isCombatActive = game.combat?.started ? true : false;
    console.log('isCombatActive', isCombatActive);

    // Create a debounced update function
    const updateDebounced = Timing.debounce(async (combatant, value) => {
      const newInitiative = parseInt(value);
      if (!isNaN(newInitiative)) {
        await combatant.update({ initiative: newInitiative });
      }
    }, 1000);

    // Pass isCombatActive to the template context
    html.find(".combatant").each(function (index, element) {
      const combatantId = $(element).data("combatant-id");
      const combatant = game.combat?.combatants.get(combatantId);

      // Make initiative editable if combat is not active
      if (!isCombatActive) {
        $(element).find(".initiative").each(function () {
          // Listen for changes in the initiative input
          $(this).on("input", function (event) {
            updateDebounced(combatant, $(this).val());
          });

          $(this).on("dblclick", function (event) {
            event.stopPropagation();
            event.preventDefault();
          });

          $(this).on("contextmenu", function (event) {
            event.stopPropagation();
            event.preventDefault();
          });

          $(this).on("blur", async function () {
            const newInitiative = parseInt($(this).text(), 10);
            if (!isNaN(newInitiative)) {
              await combatant.update({ initiative: newInitiative });
            }
          });
        });
      }
    });
  });
});

Hooks.once("ready", async () => {
  if (!game.settings.get(SYSTEM_ID, 'dontShowWelcome')) {
    new WelcomeApplication().render(true, { focus: true });
  }
});

Hooks.on('canvasReady', () => {
  // render custom token hud
  CONFIG.statusEffects = getDefaultStatusEffects();
  canvas.hud.token = new FFTokenHUD({ defaultStatusEffects: CONFIG.statusEffects })

  //- status effects

  // measuredTemplates.set(canvas.templates?.placeables || false)

})

Hooks.on("combatStart", async () => {
  const combatStartSound = game.settings.get(SYSTEM_ID, 'combatStartSound').trim();
  if (combatStartSound !== '') {
    AudioHelper.play({ src: combatStartSound, volume: 1, autoplay: true, loop: false });
  }
});

Hooks.on("updateCombatant", (combatant, updateData) => {
  if (updateData.initiative !== undefined) {
    console.log(`Combatant: ${combatant.name}, Initiative: ${updateData.initiative}`);
  }
});



/**
 * Used by chat message demo to manually attach a Svelte component, SurgeRoll, to a chat message.
 *
 * Note: You must manually destroy this Svelte component in an associated `preDeleteChatMessage` like the one provided
 * below. The reason being is that you are manually / conditionally creating a Svelte component that is not monitored /
 * controlled by TRL itself, so you must also manually destroy this component when the chat message is deleted.
 */
Hooks.on('renderChatMessage', (message, html) => {
  const FFMessage = message.getFlag(SYSTEM_ID, 'data');
  game.system.log.d('FFMessage', FFMessage);
  if (typeof FFMessage === 'object') {
    message._svelteComponent = new FFChat(
      {
        target: html[0],
        props: {
          FFMessage,
          messageId: message._id
        }
      }
    )
  }
});

/**
 * Used by chat messages to react to targeting changes.
 */
Hooks.on("targetToken", (User, Token) => {

  const targets =
    game.user.targets
      // strip out this target if it is flagged as for untargeting, return all others
      .filter((target) => {
        if (Token._id === target._id && target == false) return false;
        return true;
      })
      // map the targets to the format needed for the store
      .map((target) => {
        return {
          avatar: target.document.texture.src,
          actorUuid: target.actor.uuid, // map the token actor (not the linked actor)
          clickedByUserId: User._id,
          tokenUuid: target.document.uuid
        }
      })
  game.system.log.d('targets', targets);
  mappedGameTargets.set(targets);

});