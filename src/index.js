import './styles/Main.sass';

import { log, slugify } from "~/src/helpers/util"
import { SYSTEM_ID, SYSTEM_CODE, activeEffectModes } from "~/src/helpers/constants"
import { setupModels } from './config/models';
import { registerSettings } from "~/src/settings"
import { mappedGameTargets } from '~/src/stores';
import { getDefaultStatusEffects } from "./helpers/Conditions";
import WelcomeApplication from "~/src/components/applications/WelcomeApplication"
import FF15Actor from '~/src/extensions/actor.js'
import FF15PCSheet from "~/src/components/applications/PCSheet";
import FF15NPCSheet from "~/src/components/applications/NPCSheet";
import FF15ItemSheet from "~/src/components/applications/ItemSheet";
import FFActiveEffect from "~/src/extensions/active-effect.js"
import ItemSheetStandard from "~/src/components/applications/ItemSheetStandard";
import FFToken from "~/src/extensions/token.js"
import systemconfig from "~/src/helpers/systemconfig.ts"
import FFChat from "~/src/components/organisms/chat/FFChat.svelte";
import FFTokenHUD from './extensions/token-hud.js'
import FFCombatTracker from './extensions/combat-tracker.js'
import { Timing } from "@typhonjs-fvtt/runtime/util";
import FFCombat from './extensions/combat.js'
import FFCombatant from './extensions/combatant.js'
import ColourContrast from "~/src/helpers/ColourContrast";
import { getActorOwner } from "~/src/helpers/util";
import CustomEffect from "~/src/helpers/CustomEffect";

//- helpers
function setupDSN() {
  // Set up Dice So Nice to icrementally show attacks then damge rolls
  if (game.modules.get("dice-so-nice")?.active && !game.settings.get(game.system.id, ICON.settings.dsn_setup)) {
    game.settings.set("dice-so-nice", "enabledSimultaneousRolls", true);
    game.settings.set("dice-so-nice", "enabledSimultaneousRollForMessage", true);
    game.settings.set("dice-so-nice", "immediatelyDisplayChatMessages", true);
    game.settings.set(game.system.id, ICON.settings.dsn_setup, true);
  }
}

//- debug hooks
CONFIG.debug.hooks = true;


//- Foundry Class Extensions
CONFIG.Actor.documentClass = FF15Actor
CONFIG.Combat.documentClass = FFCombat
CONFIG.Combatant.documentClass = FFCombatant
CONFIG.Token.objectClass = FFToken
CONFIG.ActiveEffect.documentClass = FFActiveEffect



//- Set initiative dice
CONFIG.Combat.initiative = {
  formula: "1d20 + (@attributes.primary.dex.val)",
};



//- Foundry System Hooks
Hooks.once("init", async (a, b, c) => {

  CONFIG.ui.combat = FFCombatTracker;
  game.system.log = log;
  log.level = log.VERBOSE;
  game.system.log.i(`Starting System ${SYSTEM_ID}`);

  // CONFIG.debug.hooks = true;

  registerSettings();
  setupModels();

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

    // Create a debounced update function
    const updateDebounced = Timing.debounce(async (combatant, value) => {
      const newInitiative = parseInt(value);
      if (!isNaN(newInitiative)) {
        await combatant.update({ initiative: newInitiative });
      }
    }, 600);

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

Hooks.on('preUpdateToken', async (tokenDocument, update) => {
  // prevent movement while focused
  const actor = game.actors.get(tokenDocument.actorId);
  if (actor.statuses.has('focus') && (update.x || update.y)) {
    delete update.x;
    delete update.y;
    ui.notifications.warn(game.i18n.localize("FF15.Errors.CannotMoveWhileFocused"))
  }

  //- indicate that the actor has moved
  if (update.x || update.y) {
    actor.update({ system: { hasMoved: true } });
  }
});

const resetActionState = async (actor) => {
  // Reset action state
  const baseActions = ['primary', 'secondary'];
  const extraActions = actor.statuses.has('focus') ? ['secondary'] : [];

  await actor.update({
    'system.actionState': {
      available: [...baseActions, ...extraActions],
      used: []
    }
  });
};

Hooks.on("preCreateActiveEffect", async (actor, data, meta, id) => {
});

Hooks.on("applyActiveEffect", async (actor, data, id, state, obj) => {
  const customEffect = new CustomEffect(actor);
  
  //- iterate effects and then within that loop iterate changes
  for (const effect of actor.effects) {
    for (const change of effect.changes) {
      
      //- if the change is a custom mode
      if (activeEffectModes.find(e => e.value === change.mode)) {
        await customEffect.handleChange(change);
      }
    }
  }
});

Hooks.on("updateActiveEffect", async (effect, data, meta, id) => {
});

Hooks.on("preDeleteActiveEffect", async (effect, data, id) => {
});

Hooks.on("deleteActiveEffect", async (effect, data, id) => {
});

Hooks.on("combatStart", async (combat, data, meta, id) => {
  const combatStartSound = game.settings.get(SYSTEM_ID, 'combatStartSound').trim();
  if (combatStartSound !== '') {
    AudioHelper.play({ src: combatStartSound, volume: 1, autoplay: true, loop: false });
  }

  const combatants = combat.combatants.contents;

  // For each combatant
  for (const combatant of combatants) {
    const actor = combatant.actor;
    if (!actor) continue;
    await resetActionState(actor);
  }

  
});

Hooks.on("renderCombatTracker", (app, html, data) => {
  // game.system.log.d('renderCombatTracker fired', {
  //   turns: data.combat?.turns?.map(t => ({
  //     name: t.name,
  //     initiative: t.initiative,
  //     isNPC: t.actor?.type === "NPC"
  //   }))
  // });

  // If we have combat and turns, trigger the updateCombatant hook
  if (data.combat?.turns?.length) {
    // Call the hook with the first combatant and empty update data
    Hooks.call('updateCombatant', data.combat.turns[0], {});
  }
});

Hooks.on("preCreateCombatant", async (combatant, data, meta, id) => {

  const actor = combatant.actor;
  if (!actor) return;

  await resetActionState(actor);

});

/**
 * Handle combat tracker sorting and visual grouping
 */
Hooks.on("updateCombatant", async (combatant, updateData) => {


  const combat = combatant.parent;
  if (!combat) {
    return;
  }

  // Get and sort all combatants
  const turns = combat.turns;


  // Sort the turns array
  turns.sort((a, b) => {
    const aIsNPC = a.actor?.type === "NPC";
    const bIsNPC = b.actor?.type === "NPC";

    // First sort by PC/NPC status
    if (aIsNPC !== bIsNPC) return aIsNPC ? 1 : -1;

    // Then sort by initiative within each group
    const ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;
    return ib - ia;
  });


  // Find the first NPC index
  const firstNPCIndex = turns.findIndex(t => t.actor?.type === "NPC");

  // Update the turn order in the combat document
  await combat.update({ turns: turns });

  // Add visual grouping via CSS
  if (firstNPCIndex > 0 && firstNPCIndex < turns.length) {
    const tracker = ui.combat;
    if (!tracker) {
      return;
    }

    const combatants = tracker.element.find('.combatant');

    combatants.each((index, element) => {
      const $element = $(element);
      const currentClasses = $element.attr('class');


      // Remove existing border classes
      $element.removeClass('npc-group-start pc-group-end');

      // Add appropriate border class
      if (index === firstNPCIndex) {
        $element.addClass('npc-group-start');
      } else if (index === firstNPCIndex - 1) {
        $element.addClass('pc-group-end');
      }
    });
  }

});

const _resetUses = async (items) => {
  for (const item of items) {
    await item.update({ system: { uses: 0 } });
  }
}

Hooks.on("deleteCombat", async (combat) => {
  const combatants = combat.combatants.contents;

  // For each combatant
  for (const combatant of combatants) {
    const actor = combatant.actor;
    if (!actor) continue;

    // Get all items that have limitations
    const items = actor.items.filter(i => i.system.hasLimitation);
    await _resetUses(items);

    // Disable all status effects
    for (const effect of actor.effects) {
      await effect.update({ disabled: true });
    }
    await resetActionState(actor, true);
  }


});


// Reset uses at end of turn for abilities with 'turn' limitation units
Hooks.on("updateCombat", async (combat, changed, options, userId) => {


  // Only process if the turn actually changed
  if (!("turn" in changed) || changed.turn === null) return;

  // Get the previous combatant
  const previousTurn = combat.turns[combat.previous?.turn];
  if (!previousTurn) return;

  const actor = previousTurn.actor;
  if (!actor) return;

  // Find all items with turn-based limitations
  const turnLimitedItems = actor.items.filter(i =>
    i.system.hasLimitation &&
    i.system.limitationUnits === "turn"
  );

  await _resetUses(turnLimitedItems);

  // Reset action state at end of turn
  await resetActionState(actor, true);

  //- reset hasMoved flag
  await actor.update({ system: { hasMoved: false } });

});

Hooks.on("renderActiveEffectConfig", (app, jq) => {
  const ae = app.document;
  jq.find("[name=statuses]")
    .closest(".form-group")
    .before(
      `<div class="form-group">
        <label>Is Overlay?</label>
        <input type=checkbox name="flags.${SYSTEM_ID}.overlay" ${ae.flags?.[SYSTEM_ID]?.overlay ? "checked" : ""}>
      </div>`
    );
  app.setPosition();
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
  const FFMessageState = message.getFlag(SYSTEM_ID, 'state');

  game.system.log.p(">>>>>> race renderChatMessage HOOK TRIGGERED <<<<<<", {
    messageId: message.id,
    hasFFMessage: !!FFMessage,
    flags: message.flags[SYSTEM_ID]
  });

  // Add texture div to message header if it exists
  const messageHeader = html.find('.message-header');
  if (messageHeader.length) {
    messageHeader.prepend('<div class="texture"></div>');
  }

  if (message.flags[SYSTEM_ID]?.css) {
    html.addClass(message.flags[SYSTEM_ID].css);
  }

  if (typeof FFMessage === 'object') {
    const originalContent = html[0].innerHTML;

    // Create tempDiv for all message types
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalContent;

    // Apply color variables to header for all message types
    const header = tempDiv.querySelector('.message-header');
    if (header) {
      // Get actor color variables
      const sourceActor = game.actors.get(FFMessage.actor._id);
      const ownerColor = getActorOwner(sourceActor).color;
      const colorCalc = new ColourContrast(ownerColor);
      const cssVars = colorCalc.getCSSVariables();

      // Apply color variables to header
      header.style.setProperty('--message-color', cssVars.color);
      header.style.setProperty('--message-contrast', cssVars.contrast);
      header.style.setProperty('--message-color-rgb', cssVars.rgb);
    }

    let content;

    // For Attribute and Action rolls, extract just the message content
    if (['AttributeRollChat', 'ActionRollChat'].includes(FFMessage.chatTemplate)) {
      // Extract the message content and flavor text
      const messageContent = tempDiv.querySelector('.message-content');
      const flavorText = tempDiv.querySelector('.flavor-text');
      const contentToPass = `
        ${flavorText ? `<span class="flavor-text">${flavorText.innerHTML}</span>` : ''}
        ${messageContent ? messageContent.innerHTML : ''}
      `;
      // Remove flavor text from header and update HTML
      if (header) {
        const headerFlavorText = header.querySelector('.flavor-text');
        if (headerFlavorText) {
          headerFlavorText.remove();
        }
        html[0].innerHTML = header.outerHTML;
      }
      content = contentToPass;
    } else {
      // For other message types, update header colors but keep original content
      if (header) {
        const originalHeader = html[0].querySelector('.message-header');
        if (originalHeader) {
          originalHeader.outerHTML = header.outerHTML;
        }
      }
      content = originalContent;
    }
    html.addClass(SYSTEM_CODE);
    html.addClass('leather');

    message._svelteComponent = new FFChat({
      target: html[0],
      props: {
        classes: 'leather',
        FFMessage,
        FFMessageState,
        messageId: message._id,
        content
      }
    });
  }
});

// Add this new hook
Hooks.on("preDeleteChatMessage", async (message) => {
  // Check if this is an action message
  const FFMessage = message.getFlag(SYSTEM_ID, 'data');
  if (!FFMessage?.item?.type === 'action') return;

  const actor = game.actors.get(FFMessage.actor._id);
  if (!actor) return;

  // Find if this message is tracked in used actions
  const { actionState } = actor.system;
  const usedAction = actionState.used.find(u => u.messageId === message.id);

  if (usedAction) {
    // Restore the action
    await actor.update({
      'system.actionState': {
        available: [...actionState.available, usedAction.type],
        used: actionState.used.filter(u => u.messageId !== message.id)
      }
    });
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
  mappedGameTargets.set(targets);

});



