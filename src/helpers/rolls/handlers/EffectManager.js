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
    game.system.log.o('[ABILITY:ENABLER] Processing enabler effects for:', item.name);
    let allEnabledEffects = [];
    for (const enablesItemRef of item.system.enables.list) {
      game.system.log.o('[ABILITY:ENABLER] Processing enabler item ref:', enablesItemRef);
      const effects = await this._handleSingleItemEffectEnabling(item, enablesItemRef);
      allEnabledEffects = allEnabledEffects.concat(effects);
    }
    game.system.log.o('[ABILITY:ENABLER] Enabled effects:', allEnabledEffects);
    return allEnabledEffects;
  }

  /**
   * Handle single item effect enabling
   * @private
   */
  async _handleSingleItemEffectEnabling(item, enablesItemRef) {
    // Get the compendium item for reference
    const compendiumItem = await fromUuid(enablesItemRef.uuid);
    if (!compendiumItem) {
      game.system.log.w("[ENABLE] Could not find compendium item for uuid:", enablesItemRef.uuid);
      return [];
    }

    game.system.log.o('[ENABLE] Found compendium item:', { 
      name: compendiumItem.name, 
      type: compendiumItem.type,
      hasEffects: compendiumItem.hasEffects,
      effects: compendiumItem.effects.map(e => ({
        name: e.name,
        flags: foundry.utils.deepClone(e.flags),
        rawFlags: foundry.utils.deepClone(e.flags?.[SYSTEM_ID]),
        stackable: e.getFlag(SYSTEM_ID, 'stackable'),
        toObject: foundry.utils.deepClone(e.toObject())
      }))
    });

    // Find actor's version of the item by matching name and type
    const actorItem = this.actor.items.find(item => 
      item.name === compendiumItem.name && 
      item.type === compendiumItem.type
    );

    if (!actorItem) {
      game.system.log.w("[ENABLE] Could not find matching actor item for:", compendiumItem.name);
      return [];
    }
    if (!actorItem.hasEffects) {
      game.system.log.w("[ENABLE] Actor item has no effects:", actorItem.name, actorItem);
      return [];
    }
    game.system.log.o("[ENABLE] Actor item :", {
      item: actorItem,
      effects: actorItem.effects.map(e => ({
        name: e.name,
        flags: foundry.utils.deepClone(e.flags),
        rawFlags: foundry.utils.deepClone(e.flags?.[SYSTEM_ID]),
        stackable: e.getFlag(SYSTEM_ID, 'stackable'),
        toObject: foundry.utils.deepClone(e.toObject())
      }))
    });

    // Check if we've hit the usage limit using the actor's version of the item
    const hasRemainingUses = await this.actor.actorItemHasRemainingUses(actorItem);

    if (!hasRemainingUses) {
      game.system.log.w("[ENABLE]", `${actorItem.name} has been used ${actorItem.currentUses} times, reaching its usage limit of ${actorItem.maxUses}`);
      return [];
    }

    // Add effects and get their UUIDs
    game.system.log.o('[ENABLE] Adding linked effects for:', actorItem.name);
    const effectsEnabled = await this.actor.addLinkedEffects(actorItem);

    // If we added any effects, create chat message
    if (effectsEnabled.length) {
      game.system.log.o('[ENABLE] Effects added:', effectsEnabled);
      //- if the enabler effect item has the same name as the triggering item, don't send a default chat message
      if (item.name !== actorItem.name) {
        await this.DefaultChat.handle(actorItem);
      }
    }

    if (actorItem.type === 'trait' && actorItem.system.sacrificesMovement) {
      const tokenId = this.actor.token?.id;
      if (tokenId && getTokenMovement(tokenId) > 0) {
        ui.notifications.warn(`Cannot enable ${actorItem.name} after moving.`);
        return [];
      } else {
        // game.system.log.o('[FOCUS] Pre-toggle state:', {
        //   hasFocus: this.actor.statuses.has('focus'),
        //   hasMoved: this.actor.system.hasMoved,
        //   actionState: this.actor.system.actionState,
        //   hasSecondarySlot: this.actor.system.actionState.available.includes('secondary'),
        //   hasSecondaryDuplicate: this.actor.hasSpecificDuplicate(this.actor.system.actionState.available, 'secondary'),
        //   inCombat: !!game.combat
        // });

        if (!game.combat) {
          ui.notifications.warn("Focus can only be toggled during combat.");
          return [];
        }

        await this.actor.toggleStatusEffect("focus");

        // game.system.log.o('[FOCUS] Post-toggle state:', {
        //   hasFocus: this.actor.statuses.has('focus'),
        //   hasMoved: this.actor.system.hasMoved,
        //   actionState: this.actor.system.actionState,
        //   hasSecondarySlot: this.actor.system.actionState.available.includes('secondary'),
        //   hasSecondaryDuplicate: this.actor.hasSpecificDuplicate(this.actor.system.actionState.available, 'secondary')
        // });
      }
    }

    return effectsEnabled;
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