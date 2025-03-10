import DefaultChatHandler  from "~/src/helpers/rolls/handlers/DefaultChatHandler";
/**
 * Handles all effect-related operations
 */
export default class EffectManager {
  /**
   * @param {Actor} actor - The actor this handler is for
   */
  constructor(actor) {
    this.actor = actor;
    this.DefaultChatHandler = new DefaultChatHandler(actor);
  }

  /**
   * Apply effects from a list to specified targets
   * @protected
   * @param {Item} sourceItem - The item granting the effects
   * @param {Array} effectList - List of effect references to process
   * @param {Array} targets - Array of targets to apply effects to
   */
  async _applyEffectsFromList(sourceItem, effectList, targets) {
    if (!effectList?.length || !targets?.length) {
      if (!effectList?.length) {
        game.system.log.w("[EFFECT MANAGER] No effects to apply");
      }
      if (!targets?.length) {
        game.system.log.w("[EFFECT MANAGER] No targets to apply effects to");
      }
      return;
    }

    game.system.log.o("[EFFECT MANAGER] Processing effects from:", {
      sourceItem: sourceItem?.name,
      sourceItemUUID: sourceItem?.uuid,
      actor: this.actor?.name,
      effectList,
      targets: targets.map(t => t.actor?.name)
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
        ui.notifications.error(game.i18n.format("FFXIV.Errors.EffectApplicationFailed", { target: targetActor.name }));
      }
    }
  }

  /**
   * Handle all effects for an action
   * @param {Item} item - The item being used
   * @param {Object} result - The result from the action handler
   * @return {Promise<void>} Returns a promise that resolves when all effects are handled
   */
    async handleEffects(item, result) {

    }

  /**
   * Prepare effect data from effect items
   * @protected
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
   * @protected
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
   * @protected
   * @param {ActiveEffect} effect - The effect to clean
   * @param {Item} effectItem - The item containing the effect
   * @param {Item} sourceItem - The item granting the effect
   * @return {Object} Clean effect data
   */
  _prepareCleanEffectData(effect, effectItem, sourceItem) {
    game.system.log.o('[EFFECT MANAGER] Preparing clean effect data:', {
      effectName: effect.name,
      effectItemSystem: effectItem.system,
      sourceItemSystem: sourceItem.system
    });

    // Get durations array from source item (the granting item) first, then fall back to effect item
    const durations = sourceItem.system.durations || effectItem.system.durations || [];
    // Use the first applicable duration
    const duration = durations[0] || { type: 'none' };

    // Prepare the duration data
    const durationData = {
      startTime: game.time.worldTime,
      startRound: game.combat?.round ?? 0,
      startTurn: game.combat?.turn ?? 0,
      combat: game.combat?.id
    };

    // Add duration-specific data based on type
    if (duration.type === 'hasAmount' && duration.amount) {
      durationData.type = duration.units || 'rounds';
      durationData[duration.units === 'turns' ? 'turns' : 'rounds'] = duration.amount;
    } else if (duration.type === 'hasQualifier' && duration.qualifier) {
      durationData.type = duration.qualifier;
      if (duration.qualifier === 'nextAbility') {
        durationData.requiresAbility = true;
      } else if (duration.qualifier === 'untilDamage') {
        durationData.requiresDamage = true;
      }
    }

    game.system.log.o('[EFFECT MANAGER] Prepared duration data:', {
      effectName: effect.name,
      durationType: duration.type,
      durationUnits: duration.units,
      durationQualifier: duration.qualifier,
      durationData
    });

    return {
      name: effect.name,
      img: effect.img,
      changes: foundry.utils.deepClone(effect.changes),
      duration: durationData,
      disabled: false,
      flags: foundry.utils.deepClone(effect.flags),
      origin: sourceItem.uuid,
    };
  }

  /**
   * Handle enabler effects for an action
   * @protected
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
   * @protected
   * @param {Item} sourceItem - The item triggering the enabler
   * @param {Object} enableRef - The reference to the item to enable
   * @return {Promise<Array>} Array of enabled effect UUIDs
   */
  async _processEnablerRef(sourceItem, enableRef) {
    
  }

  /**
   * Find and validate compendium and actor items for an enabler reference
   * @protected
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
   * Check if item should be disabled by tags
   * @protected
   */
  async _shouldDisableByTags(item, origin) {
    const itemTags = item?.system?.tags || [];
    const shouldDisable = origin?.system?.tags?.some(tag => itemTags.includes(tag)) || false;
    return shouldDisable;
  }

  /**
   * Check if item should be disabled by requirements
   * @protected
   */
  async _shouldDisableByRequirements(item, effect) {
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