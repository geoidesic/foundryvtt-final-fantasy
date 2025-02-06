import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_ID } from "~/src/helpers/constants.js"
import RollCalc from "./RollCalc.js"
import ActionHandler from "./handlers/ActionHandler.js";
import AttributeHandler from "./handlers/AttributeHandler.js";
import EffectManager from "./handlers/EffectManager.js";
import CombatSlotManager from "./handlers/CombatSlotManager.js";
import GuardManager from "./handlers/GuardManager.js";
import { createDefaultChat } from "~/src/helpers/rolls/handlers/DefaultChatHandler.js";

/**
 * Extends RollCalc to handle actor-specific roll calculations
 * @extends {RollCalc}
 */
export default class RollCalcActor extends RollCalc {
  constructor(params) {
    super(params);
    this.params = params;
    this.actionHandler = new ActionHandler(params.actor);
    this.attributeHandler = new AttributeHandler(params.actor);
    this.effectManager = new EffectManager(params.actor);
    this.combatSlotManager = new CombatSlotManager(params.actor);
    this.guardManager = new GuardManager(params.actor, this.RG);
  }

  /**
   * Create a default chat message for an item
   * @param {Item} item - The item to create a chat message for
   * @return {Promise<ChatMessage>} The created chat message
   */
  async defaultChat(item) {
    return await createDefaultChat(this.params.actor, item);
  }

  /**
   * Create a chat message for equipment
   * @param {Item} item - The equipment item
   * @return {Promise<ChatMessage>} The created chat message
   */
  async equipment(item) {
    this.params.item = item;
    ChatMessage.create({
      user: game.user.id,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.params.actor }) : null,
      flags: { [SYSTEM_ID]: { data: { ...this.params, chatTemplate: 'EquipmentChat' } } }
    })
  }

  /**
   * Roll an attribute check
   * @param {string} key - The attribute key
   * @param {string} code - The attribute code
   * @return {Promise<void>} Returns a promise that resolves when the attribute check is complete
   */
  async attribute(key, code) {
    await this.attributeHandler.handle({key, code});
  }

  /**
   * Handle an ability roll
   * @param {string} type - The type of ability
   * @param {Item} item - The ability item
   * @return {Promise<void>} Returns a promise that resolves when the ability has been handled
   */
  async ability(type, item) {
    await this._routeAbility(item);
  }

  /**
   * Handle a trait ability
   * @param {Item} item - The trait item
   * @return {Promise<ChatMessage>} The created chat message
   */
  async abilityTrait(item) {
    return await this.defaultChat(item);
  }

  /**
   * Handle an action ability
   * @param {Item} item - The action item
   * @param {Object} [options={}] - Additional options
   * @return {Promise<ChatMessage|void>} Returns a promise that resolves with the created chat message if successful
   */
  async abilityAction(item, options = {}) {
    try {
      // Early return if guards fail
      if (!(await this.guardManager.handleGuards(item, [
        'isAction', 'isActorsTurn', 'isReaction',
        'targetsMatchActionIntent', 'hasRequiredEffects',
        'hasActiveEnablerSlot', 'hasRemainingUses', 'hasModifiers'
      ]))) {
        return;
      }

      // Handle the action
      const result = await this.actionHandler.handle(item, options);
      if (!result.success) {
        return;
      }

      // Handle effects
      await this.effectManager.handleEffects(item, result);

      // Mark slot as used
      await this.combatSlotManager.markSlotUsed(item, result);

      return result.message;
    } catch (error) {
      game.system.log.e("Error in ability action", error);
      ui.notifications.error(game.i18n.format("FF15.Errors.AbilityActionFailed", { target: this.params.actor.name }));
    }
  }

  /**
   * Route ability to appropriate handler
   * @param {Item} item - The item to route
   * @return {Promise<void>} Returns a promise that resolves when the ability has been routed and handled
   */
  async _routeAbility(item) {
    if (item.type === "action") {
      await this.abilityAction(item);
    } else if (item.type === "trait") {
      await this.abilityTrait(item);
    }
  }
}