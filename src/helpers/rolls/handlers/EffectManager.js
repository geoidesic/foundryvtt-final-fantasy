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
      await this._handleTargetEffects(item, targets);
    }

    // Process enabler effects regardless of roll success
    if (item.system.enables?.list?.length > 0) {
      await this._handleEnablerEffects(item);
    }
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
   * Handle target effects
   * @private
   */
  async _handleTargetEffects(item, targets) {

    if (!item.system.grants?.list?.length) return;
    
    game.system.log.o("[STACKING EFFECTS] Source actor using this item:", {
      actor: this.actor?.name,
      itemName: item?.name,
      itemUUID: item?.uuid,
    });
    
    for (const target of targets) {
      const targetActor = target.actor;
      if (!targetActor) continue;

      try {
        // Get all effects from the grants list
        const effectPromises = item.system.grants.list.flatMap(async (grantRef) => {
          const effectItem = await fromUuid(grantRef.uuid);
          if (!effectItem) {
            return [];
          }

          // Get all effects from the effect item
          return effectItem.effects.map(effect => {
            // Check if effect already exists on target
            const existingEffect = targetActor.effects.find(e =>
              e.name === effect.name &&
              e.origin === item.uuid
            );

            // Skip if effect already exists
            if (existingEffect) {
              return null;
            }

            // If the effect has statuses, toggle them instead of creating a new effect
            if (effect.statuses?.size) {
              const statuses = Array.from(effect.statuses);
              // Only toggle statuses that aren't already active
              const statusesToToggle = statuses.filter(status => !targetActor.statuses.has(status));
              if (statusesToToggle.length) {
                targetActor.toggleStatusEffect(statusesToToggle[0]);
              }
              return null;
            }

            // For non-status effects, clean up the data to only include valid ActiveEffect fields
            const cleanData = {
              name: effect.name,
              img: effect.img,
              changes: foundry.utils.deepClone(effect.changes),
              duration: effectItem.system.duration,
              disabled: false,
              flags: foundry.utils.deepClone(effect.flags),
              origin: item.uuid,
            };

            return cleanData;
          });
        });

        // Wait for all effect data to be prepared and flatten the array
        const effectData = (await Promise.all(effectPromises)).flat().filter(Boolean);

        if (effectData.length) {
          // Create all non-status effects at once
          await targetActor.createEmbeddedDocuments('ActiveEffect', effectData);
        }
      } catch (error) {
        game.system.log.e("Error applying effects to target", error);
        ui.notifications.error(game.i18n.format("FF15.Errors.EffectApplicationFailed", { target: targetActor.name }));
      }
    }
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
      hasEffects: compendiumItem.hasEffects
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
      game.system.log.w("[ENABLE] Actor item has no effects:", actorItem.name);
      return [];
    }
    game.system.log.o("[ENABLE] Actor item :", actorItem);

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