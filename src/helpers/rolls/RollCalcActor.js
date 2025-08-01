import { SYSTEM_ID } from "~/src/helpers/constants.js"
import RollCalc from "./RollCalc.js"
import AttributeHandler from "./handlers/AttributeHandler.js";
import EffectManager from "./handlers/EffectManager.js";
import GuardManager from "./handlers/GuardManager.js";
import DefaultChat from "~/src/helpers/rolls/handlers/DefaultChatHandler.js";


/**
 * Extends RollCalc to handle actor-specific roll calculations
 * @extends {RollCalc}
 */
export default class RollCalcActor extends RollCalc {


  constructor(params) {
    super(params);
    this.params = params;
    this.AttributeHandler = new AttributeHandler(params.actor);
    this.EffectManager = new EffectManager(params.actor);
    this.GuardManager = new GuardManager(params.actor);
    this.DefaultChat = new DefaultChat(params.actor);
  }

  /**
   * @param {Item} item - The item to create a chat message for
   */
  defaultChat(item) {
    this.DefaultChat.handle(item);
  }

  /**
   * @param {Item} item - The equipment item
   */
  equipment(item) {
    this.params.item = item;
    ChatMessage.create({
      user: game.user.id,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.params.actor }) : null,
      flags: { [SYSTEM_ID]: { data: { ...this.params, chatTemplate: 'EquipmentChat' } } }
    })
  }

  /**
   * @param {string} key - The attribute key
   * @param {string} code - The attribute code
   */
  attribute(key, code) {
    this.AttributeHandler.handle({key, code});
  }

  /**
   * @param {string} type - The type of ability
   * @param {Item} item - The ability item
   */
  ability(type, item) {
    console.log("[FFXIV] | [ABILITY CHAIN] Starting ability chain", {
      // Add relevant details
    });
    this._routeAbility(item);
  }

  /**
   * @param {Item} item - The trait item
   */
  abilityTrait(item) {
    this.defaultChat(item);
  }

  /**
   * @param {Item} item - The action item
   * @param {Object} [options={}] - Additional options
   */
  async abilityAction(item, options = {}) {
    console.log("[FFXIV] | [ROLL CALC] abilityAction call stack:", {
      stack: new Error().stack,
      itemName: item?.name,
      options
    });

    try {
      // Early return if guards fail
      if (!(await this.GuardManager.handleGuards(item, [
       'hasModifiers',  
      ]))) {
        return;
      }

      // Handle effects
      await this.EffectManager.handleEffects(); //- e.g.

      this.defaultChat(item);

    } catch (error) {
      game.system.log.e("Error in ability action", error);
      ui.notifications.error(game.i18n.format("FFXIV.Errors.AbilityActionFailed", { target: this.params.actor.name }));
    }
  }

  /**
   * Route ability to appropriate handler
   * @param {Item} item - The item to route
   * @return {Promise<void>} Returns a promise that resolves when the ability has been routed and handled
   */
  _routeAbility(item) {
    if (item.type === "action") {
      this.abilityAction(item);
    } else if (item.type === "trait") {
      this.abilityTrait(item);
    }
  }
}