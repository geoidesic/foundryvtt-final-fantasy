import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_ID } from "./constants.js"
import RollCalc from "./RollCalc.js"
import FFActiveEffect from "~/src/extensions/active-effect.js"


export default class RollCalcActor extends RollCalc {

  async defaultChat(item) {
    return await ChatMessage.create({
      user: game.user.id,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.params.actor }) : null,
      flags: {
        [SYSTEM_ID]: {
          data: {
            chatTemplate: 'RollChat',
            actor: {
              _id: this.params.actor._id,
              name: this.params.actor.name,
              img: this.params.actor.img
            },
            item: {
              _id: item._id,
              uuid: item.uuid,
              name: item.name,
              img: item.img,
              type: item.type,
              system: item.system
            }
          }
        }
      }
    });
  }

  async equipment(item) {
    this.params.item = item;
    ChatMessage.create({
      user: game.user.id,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.params.actor }) : null,
      flags: { [SYSTEM_ID]: { data: { ...this.params, chatTemplate: 'EquipmentChat' } } }
    })
  }

  async attribute(key, code) {
    const attributeValue = this.params.actor.system.attributes[key][code].val;
    const rollFormula = `1d20 + ${attributeValue}`;
    const attributeName = game.i18n.localize(`FF15.Types.Actor.Types.PC.Attributes.${key}.${code}.Abbreviation`);
    const roll = await new Roll(rollFormula).evaluate({ async: true });
    const messageData = {
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: $actor }) : null,
      flavor: `${attributeName} ${game.i18n.localize('FF15.Check')}`,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll,
      flags: {
        [SYSTEM_ID]: {
          data: {
            chatTemplate: "AttributeRollChat",
            actor: {
              _id: this.params.actor._id,
              name: this.params.actor.name,
              img: this.params.actor.img
            },
            flavor: `${attributeName} ${game.i18n.localize('FF15.Check')}`,
            key: key,
            code: code,
            modifier: attributeValue
          },
          css: 'attribute-roll'
        }
      }
    };
    await roll.toMessage(messageData);
  }

  async ability(type, item) {

    await this._routeAbility(item);
  }

  async abilityTrait(item) {
    return await this.defaultChat(item);
  }

  /**
   * Create message data for an action
   * @param {Item} item - The action item
   * @param {boolean} hasTargets - Whether there are targets
   * @param {Array} targets - Array of target ids
   * @param {Roll} roll - Optional roll data
   * @returns {Object} Message data object
   */
  _createActionMessageData(item, hasTargets, targets, roll = null) {
    const messageData = {
      id: `${SYSTEM_ID}--actor-sheet-${generateRandomElementId()}`,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.params.actor }) : null,
      flavor: `${item.name}`,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      classes: ['testy', 'leather'],
      flags: {
        [SYSTEM_ID]: {
          data: {
            chatTemplate: "ActionRollChat",
            actor: {
              _id: this.params.actor._id,
              uuid: this.params.actor.uuid,
              name: this.params.actor.name,
              img: this.params.actor.img
            },
            item: {
              _id: item._id,
              uuid: item.uuid,
              name: item.name,
              img: item.img,
              type: item.type,
              system: {
                formula: item.system?.formula,
                directHitDamage: item.system?.directHitDamage,
                hasDirectHit: item.system?.hasDirectHit
              }
            },
            hasTargets,
            targets
          },
          state: {
            damageResults: false,
            initialised: false
          },
          css: 'leather'
        }
      }
    };

    // Add roll data if provided
    if (roll) {
      messageData.roll = roll;
      messageData.flags[SYSTEM_ID].data.roll = roll.total;
    }

    return messageData;
  }

  async abilityAction(item) {
    // Get targets before showing dialog
    const guards = [
      this.RG.isAction,
      this.RG.targetsMatchActionIntent,
      this.RG.hasRequiredEffects,
      this.RG.hasActiveEnablerSlot,
      this.RG.hasRemainingUses,
      this.RG.hasModifiers
    ]
    let message;

    if (!(await this._handleGuards(item, guards))) {
      return undefined;
    }

    const targets = game.user.targets;
    const hasTargets = targets.size > 0;
    // Handle target effects if the action grants them
    if (item.system.grants?.value && hasTargets) {
      await this._handleTargetEffects(item, targets);
    }

    if (!item.system.hasCR) {
      // Use action template if item has base damage effect
      if (item.system.hasBaseEffect && item.system.baseEffectType === 'damage') {
        const messageData = this._createActionMessageData(
          item, 
          hasTargets, 
          Array.from(targets).map((target) => target.id)
        );
        message = await ChatMessage.create(messageData);
      } else {
        message = await this.defaultChat(item);
      }

      // Mark the action as used
      await this._markCombatTrackerActionSlotAsUsed(item, item.system.type || 'primary', message);

      // Enable the effects of the action
      let allEnabledEffects = [];
      // Iterate through the enables list on the item that was used for the roll
      for (const enablesItemRef of item.system.enables.list) {
        const effects = await this._handleSingleItemEffectEnabling(enablesItemRef);
        allEnabledEffects = allEnabledEffects.concat(effects);
      }
      return;
    }

    // Build roll formula and data
    let formula = '1d20'

    if (this.RG.shuttle.hasModifiers.extraModifiers) {
      formula += ` + ${this.RG.shuttle.hasModifiers.extraModifiers.modifier} `;
    }

    let { rollFormula, rollData } = await this._handleAttributeCheck(item, formula);

    // Evaluate roll with actor data
    const roll = await new Roll(rollFormula, rollData).evaluate({ async: true });

    // Create chat message data
    const messageData = this._createActionMessageData(
      item, 
      hasTargets, 
      Array.from(targets).map((target) => target.id),
      roll
    );

    // Create the message
    message = await roll.toMessage(messageData);

    // Mark the action as used
    await this._markCombatTrackerActionSlotAsUsed(item, item.system.type || 'primary', message);

    // Enable or disable enabler effects as appropriate
    let allEnabledEffects = [];
    // Iterate through the enables list on the item that was used for the roll
    for (const enablesItemRef of item.system.enables.list) {
      const effects = await this._handleSingleItemEffectEnabling(enablesItemRef);
      allEnabledEffects = allEnabledEffects.concat(effects);
    }

    return message
  }


  /******************
   * Private methods
   ******************/

  /**
   * Mark the action as used
   * @param {Item} item - The item being used
   * @param {string} actionType - The type of action (primary/secondary) or custom slot
   * @param {ChatMessage} message - The chat message created for this action
   */
  async _markCombatTrackerActionSlotAsUsed(item, actionType, message) {

    if (!(await this._handleGuards(item, [
      this.RG.isCombat
    ]))) {
      return;
    }

    const { actionState } = this.params.actor.system;

    // First try to find a matching tag-based slot
    let slotToUse;
    const customSlots = actionState.available.filter(slot =>
      slot !== 'primary' && slot !== 'secondary'
    );

    // Check for matching tag slot first
    if (item.system.tags?.length) {
      const matchingSlot = customSlots.find(slot =>
        item.system.tags.includes(slot)
      );
      if (matchingSlot) {
        slotToUse = matchingSlot;

        const enablerEffectForThisSlot = this.params.actor.enablerEffects.find(effect => 
          effect.changes.some(change => 
            change.value === matchingSlot
          )
        );

        //- the effect's origin item flag contains the original effect uuid, which can be disected to get the original item
        const originItemUuid = enablerEffectForThisSlot.getFlag(SYSTEM_ID, 'origin.effect.uuid').split('.').slice(0, -2).join('.');
        const originItem = fromUuidSync(originItemUuid);
        if (originItem) {
          const uses = (originItem.system.uses || 0) + 1;
          await originItem.update({ system: { uses } });
        }

        //- also remove the enabler effect from the actor
        enablerEffectForThisSlot.delete();
      }
    }

    // If no tag slot found, fall back to primary/secondary
    if (!slotToUse && actionState.available.includes(actionType)) {
      slotToUse = actionType;
    }

    if (!slotToUse) {
      return;
    }


    // Create new available array and remove exactly one instance of the used slot
    const newAvailable = [...actionState.available];
    const indexToRemove = newAvailable.findIndex(slot => slot === slotToUse);
    if (indexToRemove !== -1) {
      newAvailable.splice(indexToRemove, 1);
    }

    // Create new used array
    const newUsed = [...actionState.used, {
      type: slotToUse,
      messageId: message.id
    }];

    // Update the actor's action state
    await this.params.actor.update({
      'system.actionState.available': newAvailable,
      'system.actionState.used': newUsed
    });
  }

  async _shouldDisableByTags(item, origin) {
    const itemTags = item?.system?.tags || [];
    const shouldDisable = origin?.system?.tags?.some(tag => itemTags.includes(tag)) || false;
    return shouldDisable;
  }

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

  async _handleSingleItemEffectEnabling(enablesItemRef) {
    // Get the compendium item for reference
    const compendiumItem = await fromUuid(enablesItemRef.uuid);
    if (!compendiumItem) { return [] }

    // Find the actor's version of the item by matching name and type
    const actorItem = this.params.actor.items.find(item => 
      item.name === compendiumItem.name && 
      item.type === compendiumItem.type
    );

    if (!actorItem) { return [] }
    if (!actorItem.hasEffects) { return [] }

    // Check if we've hit the usage limit using the actor's version of the item
    if (!await this.params.actor.actorItemHasRemainingUses(actorItem)) {
      game.system.log.w("[ENABLE]", `${actorItem.name} has been used ${actorItem.currentUses} times, reaching its usage limit of ${actorItem.maxUses}`);
      return [];
    }

    // Enable any disabled effects and get their UUIDs
    const effectsEnabled = await this.params.actor.enableTraitEffects(actorItem);

    // If we enabled any effects, create chat message
    if (effectsEnabled.length) {
      // Just send a chat message instead of recursively calling ability
      await this.defaultChat(actorItem);
    }

    return effectsEnabled;
  }

  /**
   * Check if the item passes all the guards
   * @param {*} item 
   * @param {*} guardMethodsArray 
   * @returns Boolean
   */
  async _handleGuards(item, guardMethodsArray) {
    // Run guards sequentially, stop on first failure
    for (const guardMethod of guardMethodsArray) {
      const result = await guardMethod.call(this.RG, item);  // Store the awaited result
      if (!result) {  // Check the result immediately
        return false;
      }
    }
    return true;
  }

  /**
   * Route the ability to the appropriate method based on the item type
   */
  async _routeAbility(item) {
    if (item.type === "action") {
      await this.abilityAction(item);
    } else if (item.type === "trait") {
      await this.abilityTrait(item);
    }
  }


  /**
   * Add attribute check to the roll formula if specified
   * @param {*} item 
   * @param {*} rollFormula 
   * @param {*} rollData 
   * @returns 
   */
  async _handleAttributeCheck(item, rollFormula, rollData = {}) {
    // Add attribute check if specified
    if (item.system.hasCheck) {
      const attrVal = this.params.actor.system.attributes.primary[item.system.checkAttribute]?.val || 0;
      rollData[item.system.checkAttribute] = attrVal;
      rollFormula += ` + @${item.system.checkAttribute}`;
    }
    return { rollFormula, rollData };
  }

  /**
   * Handle transferring effects to target actors
   * @param {Item} item - The action item being used
   * @param {Set} targets - The set of targeted tokens
   */
  async _handleTargetEffects(item, targets) {
    if (!item.system.grants?.list?.length) return;

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
                targetActor.toggleActiveEffect({ id: statusesToToggle[0], statuses: statusesToToggle });
              }
              return null;
            }

            // For non-status effects, clean up the data to only include valid ActiveEffect fields
            const cleanData = {
              name: effect.name,
              label: effect.label,
              icon: effect.icon,
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
}