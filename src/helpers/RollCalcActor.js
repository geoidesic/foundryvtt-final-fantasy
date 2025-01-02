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


  async abilityAction(item) {
    // Get targets before showing dialog
    const guards = [
      this.RG.isAction,
      this.RG.targetsMatchActionIntent,
      this.RG.hasActiveEnablerSlot,
      this.RG.hasModifiers,
      this.RG.hasRemainingUses,
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

    if(!item.system.hasCR) {
      message = await this.defaultChat(item);
       // Mark the action as used
      await this._markCombatTrackerActionSlotAsUsed(item, item.system.type || 'primary', message);

      // Enable the effects of the action
      await this._handleEffectEnabling(item);
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
    const messageData = {
      id: `${SYSTEM_ID}--actor-sheet-${generateRandomElementId()}`,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.params.actor }) : null,
      flavor: `${item.name}`,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      classes: ['testy', 'leather'],
      roll,
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
            roll: roll.total,
            targets: Array.from(targets).map((target) => target.id)
          },
          state: {
            damageResults: false,
            initialised: false
          },
          css: 'leather'
        }
      }
    };

    // Create the message
    message = await roll.toMessage(messageData);

    // Mark the action as used
    await this._markCombatTrackerActionSlotAsUsed(item, item.system.type || 'primary', message);

    // Enable the effects of the action
    await this._handleEffectEnabling(item);

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
    game.system.log.d("[SLOT_UPDATE] Custom slots:", customSlots);

    // Check for matching tag slot first
    if (item.system.tags?.length) {
      const matchingSlot = customSlots.find(slot =>
        item.system.tags.includes(slot)
      );
      if (matchingSlot) {
        slotToUse = matchingSlot;

        // If we're using a tag slot, we need to disable any matching enabler effects
        const enabledEffects = this.params.actor.effects.filter(
          effect => effect.system.tags?.includes('enabler')
        );

        for (const effect of enabledEffects) {
          const originItem = fromUuidSync(effect.origin);
          if (originItem?.system.tags?.includes(slotToUse)) {
            await effect.update({ disabled: true });
          }
        }
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

  /**
   * Check item's enablers and enable any disabled actor effects that match
   */
  async _handleEffectEnabling(item) {
    
    game.system.log.o('[ENABLE] Starting _handleEffectEnabling for item:', item.name);
    game.system.log.o('[ENABLE] Starting _handleEffectEnabling item:', item);

    if (!(await this._handleGuards(item, [
      this.RG.isCombat,
      this.RG.hasEnablers
    ]))) {
      game.system.log.o('[ENABLE] Failed guards check');
      return;
    }

    const actorEffects = this.params.actor.effects;
    game.system.log.o('[ENABLE] Actor effects:', actorEffects);

    // Iterate through the enables list
    game.system.log.o('[ENABLE] Enables list:', item.system.enables.list);
    for (const enableItemRef of item.system.enables.list) {
      // Get the actual item from the UUID
      const enableItem = await fromUuid(enableItemRef.uuid);
      if (!enableItem) {
        game.system.log.o('[ENABLE] Could not find item for UUID:', enableItemRef.uuid);
        continue;
      }
      game.system.log.o('[ENABLE] Processing enable item.name:', enableItem.name);
      game.system.log.o('[ENABLE] Processing enable item:', enableItem);

      // Get the item's effects
      const itemEffects = enableItem.effects;
      if (!itemEffects?.size) {
        game.system.log.o('[ENABLE] No effects found on item:', enableItem.name);
        continue;
      }
      game.system.log.o('[ENABLE] Item effects:', itemEffects);

      // Check if any effects are disabled (meaning the trait hasn't been used yet)
      const hasDisabledEffects = Array.from(itemEffects).some(effect => {
        const matchingEffect = actorEffects.find(ae => ae.name === effect.name);
        return matchingEffect?.disabled;
      });

      // Check if we've hit the usage limit
      if (enableItem.system.hasLimitation) {
        game.system.log.o('[ENABLE] Before check - system.uses:', enableItem.system.uses);
        game.system.log.o('[ENABLE] Before check - currentUses:', enableItem.currentUses);
        game.system.log.o('[ENABLE] Before check - usesRemaining:', enableItem.usesRemaining);
        game.system.log.o('[ENABLE] Before check - maxUses:', enableItem.maxUses);
        
        // If the trait hasn't been used (has disabled effects) but shows uses, reset it
        if (hasDisabledEffects && enableItem.system.uses) {
          game.system.log.o('[ENABLE] Found disabled effects but uses is set, resetting uses for', enableItem.name);
          await enableItem.update({ 'system.uses': 0 });
        }

        let hasUsesRemaining = enableItem.usesRemaining;
       
        if (!hasUsesRemaining) {
          game.system.log.w("[ENABLE]", `${enableItem.name} has been used ${enableItem.currentUses} times, reaching its usage limit of ${enableItem.maxUses}`);
          continue;
        }
      }

      let effectEnabled = false;
      // Enable any disabled effects
      for (const effect of itemEffects) {
        game.system.log.o('[ENABLE] Processing effect:', effect.name);
        // Find matching effect on actor (if any)
        const matchingEffect = actorEffects.find(ae =>
          ae.name === effect.name &&
          ae.disabled // Only enable if it's currently disabled
        );
        game.system.log.o('[ENABLE] Found matching effect:', matchingEffect?.name, 'disabled:', matchingEffect?.disabled);

        if (matchingEffect) {
          await matchingEffect.update({ disabled: false });
          effectEnabled = true;
          game.system.log.o('[ENABLE] Enabled effect:', matchingEffect.name);
        }
      }

      // If we enabled any effects, increment uses and create chat message
      if (effectEnabled) {
        game.system.log.o('[ENABLE] Effects were enabled for:', enableItem.name);
        if (enableItem.system.hasLimitation) {
          game.system.log.o('[ENABLE] Before increment - system.uses:', enableItem.system.uses);
          game.system.log.o('[ENABLE] Before increment - currentUses:', enableItem.currentUses);
          await enableItem.update({ 'system.uses': enableItem.currentUses + 1 });
          game.system.log.o('[ENABLE] After increment - system.uses:', enableItem.system.uses);
          game.system.log.o('[ENABLE] After increment - currentUses:', enableItem.currentUses);
        }

        // Log current available slots
        const { actionState } = this.params.actor.system;
        game.system.log.o('[ENABLE] Current available slots:', actionState.available);

        // Just send a chat message instead of recursively calling ability
        await this.defaultChat(enableItem);
      } else {
        game.system.log.o('[ENABLE] No effects were enabled for:', enableItem.name);
      }
    }
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
    game.system.log.o('[_handleTargetEffects] targets', targets);

    for (const target of targets) {
      const targetActor = target.actor;
      game.system.log.o('[_handleTargetEffects] targetActor', targetActor);
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
              duration: effect.duration,
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