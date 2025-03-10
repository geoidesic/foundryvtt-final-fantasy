import './styles/Main.sass';

import FFXIVActor from '~/src/extensions/actor.js'
import FFXIVItem from '~/src/extensions/item.js'
import FFActiveEffect from "~/src/extensions/active-effect.js"
import FFEffectModel from "~/src/models/ActiveEffectModel.js"
import FFToken from "~/src/extensions/token.js"
import FFCombat from './extensions/combat.js'
import FFCombatant from './extensions/combatant.js'
import hooks from "~/src/hooks";
import RollGuards from "~/src/helpers/rolls/RollGuards";

/* eslint-disable-next-line no-unused-vars */
import { setupDSN } from "~/src/helpers/dsnSetup.js";

//- debug hooks
// CONFIG.debug.hooks = true;


CONFIG.FFXIV = {
  RollGuards: RollGuards
}


//- Foundry Class Extensions
CONFIG.Actor.documentClass = FFXIVActor
CONFIG.Item.documentClass = FFXIVItem
CONFIG.Combat.documentClass = FFCombat
CONFIG.Combatant.documentClass = FFCombatant
CONFIG.Token.objectClass = FFToken
CONFIG.ActiveEffect.documentClass = FFActiveEffect
CONFIG.ActiveEffect.dataModels.base = FFEffectModel


CONFIG.time.roundTime = 6;

//- Set initiative dice
CONFIG.Combat.initiative = {
  formula: "1d20 + (@attributes.primary.dex.val)",
};

//- Foundry System Hooks
hooks.init();
hooks.ready();
hooks.canvasReady(); //- custom token HUD and status effects
hooks.renderCombatTracker();
hooks.preDeleteChatMessage();
hooks.preUpdateToken();
// hooks.renderActiveEffectConfig(); @deprecated
hooks.renderChatMessage();
hooks.targetToken();
hooks.updateCombat();
hooks.updateCombatant();
hooks.deleteCombat();
hooks.updateActiveEffect();
// hooks.movement();


