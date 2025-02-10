import { SYSTEM_ID } from "~/src/helpers/constants";
import DefaultChat  from "~/src/helpers/rolls/handlers/ActionHandler";
/**
 * Handles all effect-related operations
 */
export default class EffectManager {
  /**
   * @param {Actor} actor - The actor this handler is for
   */
  constructor(actor) {
    this.actor = actor;
    this.DefaultChat = new DefaultChat(actor);
  }

  /**
   * Handle all effects for an action
   * @param {Item} item - The item being used
   * @param {Object} result - The result from the action handler
   * @return {Promise<void>} Returns a promise that resolves when all effects are handled
   */
  async handleEffects(item, result) {
    const { hasTargets, targets } = result;

    // Handle target effects
    if (item.system.grants?.value && hasTargets) {
      await this._applyEffectsFromList(item, item.system.grants.list, targets);
    }

    // Handle source effects
    if (item.system.sourceGrants?.list?.length) {
      await this._applyEffectsFromList(item, item.system.sourceGrants.list, [{ actor: this.actor }]);
    }

    // Process enabler effects regardless of roll success
    if (item.system.enables?.list?.length > 0) {
      await this._handleEnablerEffects(item);
    }
  }

  /**
   * Apply effects from a list to specified targets
   * @private
   * @param {Item} sourceItem - The item granting the effects
   * @param {Array} effectList - List of effect references to process
   * @param {Array} targets - Array of targets to apply effects to
   */
  async _applyEffectsFromList(sourceItem, effectList, targets) {
    if (!effectList?.length || !targets?.length) return;

    game.system.log.o("[EFFECTS] Processing effects from:", {
      sourceItem: sourceItem?.name,
      sourceItemUUID: sourceItem?.uuid,
      actor: this.actor?.name
    });

    for (const target of targets) {
      const targetActor = target.actor;
      if (!targetActor) continue;

      try {
        const effectData = await this._prepareEffectData(sourceItem, effectList, targetActor);
        if (effectData.length) {
          await targetActor.createEmbeddedDocuments('ActiveEffect', effectData);
        }
      } catch (error) {
        game.system.log.e("Error applying effects to target", error);
        ui.notifications.error(game.i18n.format("FF15.Errors.EffectApplicationFailed", { target: targetActor.name }));
      }
    }
  }

  /**
   * Prepare effect data from effect items
   * @private
   * @param {Item} sourceItem - The item granting the effects
   * @param {Array} effectList - List of effect references to process
   * @param {Actor} targetActor - The actor to check against for existing effects
   * @return {Promise<Array>} Array of prepared effect data
   */
  async _prepareEffectData(sourceItem, effectList, targetActor) {
    // Get all effects from the grants list
    const effectPromises = effectList.flatMap(async (grantRef) => {
      const effectItem = await fromUuid(grantRef.uuid);
      if (!effectItem) return [];

      // Get all effects from the effect item
      return effectItem.effects.map(effect => {
        // Check if effect already exists
        const existingEffect = targetActor.effects.find(e =>
          e.name === effect.name &&
          e.origin === sourceItem.uuid
        );

        // Skip if effect already exists
        if (existingEffect) return null;

        // Handle status effects
        if (effect.statuses?.size) {
          return this._handleStatusEffect(effect, targetActor);
        }

        // For non-status effects, prepare clean data
        return this._prepareCleanEffectData(effect, effectItem, sourceItem);
      });
    });

    // Wait for all effect data to be prepared and flatten the array
    return (await Promise.all(effectPromises)).flat().filter(Boolean);
  }

  /**
   * Handle status effect application
   * @private
   * @param {ActiveEffect} effect - The effect to process
   * @param {Actor} targetActor - The actor to apply the status to
   * @return {null} Always returns null as statuses are handled directly
   */
  _handleStatusEffect(effect, targetActor) {
    const statuses = Array.from(effect.statuses);
    // Only toggle statuses that aren't already active
    const statusesToToggle = statuses.filter(status => !targetActor.statuses.has(status));
    if (statusesToToggle.length) {
      targetActor.toggleStatusEffect(statusesToToggle[0]);
    }
    return null;
  }

  /**
   * Prepare clean effect data for creation
   * @private
   * @param {ActiveEffect} effect - The effect to clean
   * @param {Item} effectItem - The item containing the effect
   * @param {Item} sourceItem - The item granting the effect
   * @return {Object} Clean effect data
   */
  _prepareCleanEffectData(effect, effectItem, sourceItem) {
    return {
      name: effect.name,
      img: effect.img,
      changes: foundry.utils.deepClone(effect.changes),
      duration: effectItem.system.duration,
      disabled: false,
      flags: foundry.utils.deepClone(effect.flags),
      origin: sourceItem.uuid,
    };
  }

  /**
   * Handle enabler effects for an action
   * @private
   */
  async _handleEnablerEffects(item) {
    if (!item.system.enables?.list?.length) return [];

    const enabledEffects = [];
    for (const enableRef of item.system.enables.list) {
      const effects = await this._processEnablerRef(item, enableRef);
      enabledEffects.push(...effects);
    }

    game.system.log.o('[ABILITY:ENABLER] Enabled effects:', enabledEffects);
    return enabledEffects;
  }

  /**
   * Process a single enabler reference
   * @private
   * @param {Item} sourceItem - The item triggering the enabler
   * @param {Object} enableRef - The reference to the item to enable
   * @return {Promise<Array>} Array of enabled effect UUIDs
   */
  async _processEnablerRef(sourceItem, enableRef) {
    // Find and validate items
    const { compendiumItem, actorItem } = await this._findEnablerItems(enableRef);
    if (!actorItem || !actorItem.hasEffects) return [];

    // Check usage limits
    if (!await this.actor.actorItemHasRemainingUses(actorItem)) {
      game.system.log.w("[ENABLE]", `${actorItem.name} has no remaining uses`);
      return [];
    }

    // Handle special case for traits
    if (actorItem.type === 'trait') {
      const canEnableTrait = await this._validateTraitEnabling(actorItem);
      if (!canEnableTrait) return [];
    }

    // Apply effects
    const effectsEnabled = await this.actor.addLinkedEffects(actorItem);
    
    // Handle chat message if needed
    if (effectsEnabled.length && sourceItem.name !== actorItem.name) {
      await this.DefaultChat.handle(actorItem);
    }

    return effectsEnabled;
  }

  /**
   * Find and validate compendium and actor items for an enabler reference
   * @private
   * @param {Object} enableRef - The reference to the item to enable
   * @return {Promise<Object>} Object containing compendium and actor items
   */
  async _findEnablerItems(enableRef) {
    const compendiumItem = await fromUuid(enableRef.uuid);
    if (!compendiumItem) {
      game.system.log.w("[ENABLE] Could not find compendium item:", enableRef.uuid);
      return { compendiumItem: null, actorItem: null };
    }

    const actorItem = this.actor.items.find(item => 
      item.name === compendiumItem.name && 
      item.type === compendiumItem.type
    );

    if (!actorItem) {
      game.system.log.w("[ENABLE] Could not find matching actor item:", compendiumItem.name);
      return { compendiumItem, actorItem: null };
    }

    return { compendiumItem, actorItem };
  }

  /**
   * Validate if a trait can be enabled
   * @private
   * @param {Item} trait - The trait item to validate
   * @return {Promise<boolean>} Whether the trait can be enabled
   */
  async _validateTraitEnabling(trait) {
    if (!trait.system.sacrificesMovement) return true;

    const tokenId = this.actor.token?.id;
    if (!tokenId) return true;

    if (getTokenMovement(tokenId) > 0) {
      ui.notifications.warn(`Cannot enable ${trait.name} after moving.`);
      return false;
    }

    if (!game.combat) {
      ui.notifications.warn("Focus can only be toggled during combat.");
      return false;
    }

    await this.actor.toggleStatusEffect("focus");
    return true;
  }

  /**
   * Check if item should be disabled by tags
   * @private
   */
  async _shouldDisableByTags(item, origin) {
    const itemTags = item?.system?.tags || [];
    const shouldDisable = origin?.system?.tags?.some(tag => itemTags.includes(tag)) || false;
    return shouldDisable;
  }

  /**
   * Check if item should be disabled by requirements
   * @private
   */
  async _shouldDisableByRequirements(item, origin, effect) {
    if (!item.hasRequires) return false;
    const requiresList = item.system.requires.list || [];
    // Get all required items first
    const requiredItems = await Promise.all(requiresList.map(req => fromUuid(req.uuid)));
    // Then compare names
    const shouldDisable = requiredItems.some(requiredItem => {
      return requiredItem?.name === effect.name;
    });
    return shouldDisable;
  }

} 