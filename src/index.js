import './styles/Main.sass';

import FF15Actor from '~/src/extensions/actor.js'
import FFActiveEffect from "~/src/extensions/active-effect.js"
import FFToken from "~/src/extensions/token.js"
import FFCombat from './extensions/combat.js'
import FFCombatant from './extensions/combatant.js'
import RollGuards from "~/src/helpers/RollGuards";
import hooks from "~/src/hooks";
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
// CONFIG.debug.hooks = true;


//- Foundry Class Extensions
CONFIG.Actor.documentClass = FF15Actor
CONFIG.Combat.documentClass = FFCombat
CONFIG.Combatant.documentClass = FFCombatant
CONFIG.Token.objectClass = FFToken
CONFIG.ActiveEffect.documentClass = FFActiveEffect
CONFIG.FF15 = {
  RollGuards: RollGuards
}

//- Set initiative dice
CONFIG.Combat.initiative = {
  formula: "1d20 + (@attributes.primary.dex.val)",
};

//- Foundry System Hooks
hooks.init();
hooks.ready();
hooks.applyActiveEffect();
hooks.canvasReady();
hooks.createActiveEffect();
hooks.combatStart();
hooks.preCreateCombatant();
hooks.preDeleteChatMessage();
hooks.preUpdateToken();
hooks.renderActiveEffectConfig();
hooks.renderChatMessage();
hooks.targetToken();
hooks.updateCombat();
hooks.updateCombatant();
hooks.deleteCombat();





