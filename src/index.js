import './styles/Main.sass';

import FF15Actor from '~/src/extensions/actor.js'
import FF15Item from '~/src/extensions/item.js'
import FFActiveEffect from "~/src/extensions/active-effect.js"
import FFEffectModel from "~/src/models/ActiveEffectModel.js"
import FFToken from "~/src/extensions/token.js"
import FFCombat from './extensions/combat.js'
import FFCombatant from './extensions/combatant.js'
import RollGuards from "~/src/helpers/rolls/RollGuards";
import hooks from "~/src/hooks";

/* eslint-disable-next-line no-unused-vars */
import { setupDSN } from "~/src/helpers/dsnSetup.js";

//- debug hooks
// CONFIG.debug.hooks = true;

//- Foundry Class Extensions
CONFIG.Actor.documentClass = FF15Actor
CONFIG.Item.documentClass = FF15Item
CONFIG.Combat.documentClass = FFCombat
CONFIG.Combatant.documentClass = FFCombatant
CONFIG.Token.objectClass = FFToken
CONFIG.ActiveEffect.documentClass = FFActiveEffect
CONFIG.ActiveEffect.dataModels.base = FFEffectModel

CONFIG.FF15 = {
  RollGuards: RollGuards
}

CONFIG.time.roundTime = 6;

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
hooks.updateActiveEffect();





