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
      style: CONST.CHAT_MESSAGE_STYLES.ROLL,
      rolls: roll ? [roll] : [],
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

    // Add roll total to flags if provided
    if (roll) {
      messageData.flags[SYSTEM_ID].data.roll = roll.total;
    }

    return messageData;
  }

  async abilityAction(item, options = {}) {
    try {
      // Early return if guards fail
      if (!(await this._handleGuards(item, [
        this.RG.isAction, this.RG.isActorsTurn, this.RG.isReaction,
        this.RG.targetsMatchActionIntent, this.RG.hasRequiredEffects,
        this.RG.hasActiveEnablerSlot, this.RG.hasRemainingUses, this.RG.hasModifiers
      ]))) return;

      const targets = game.user.targets;
      const hasTargets = targets.size > 0;
      const targetIds = Array.from(targets).map(target => target.id);

      // Handle target effects
      if (item.system.grants?.value && hasTargets) {
        await this._handleTargetEffects(item, targets);
      }

      let roll;
      let message;
      if (item.system.hasCR) {
        // Handle roll with modifiers
        roll = await this._handleRollWithModifiers(item);
        const d20Term = roll.terms[0];
        const rawD20 = d20Term.modifiers.includes('kh1') 
          ? Math.max(...d20Term.results.map(r => r.result))
          : d20Term.results[0].result;

        game.system.log.d("[PROC] Roll result:", {
          total: roll.total,
          terms: roll.terms,
          rawD20
        });
        message = await roll.toMessage(this._createActionMessageData(item, hasTargets, targetIds, roll));
      } else {
        message = item.system.hasBaseEffect && item.system.baseEffectType === 'damage'
          ? await ChatMessage.create(this._createActionMessageData(item, hasTargets, targetIds))
          : await this.defaultChat(item);
      }

      // Check for proc trigger
      if (item.system.procTrigger) {
        game.system.log.d("[PROC] Checking proc trigger:", {
          itemName: item.name,
          procTrigger: item.system.procTrigger,
          hasCR: item.system.hasCR,
          hasRoll: !!roll
        });
        
        Hooks.callAll('FF15.ProcTrigger', { 
          actor: this.params.actor, 
          item,
          roll,
          targets
        });
      }

      // Mark action as used and handle effects
      await this._markCombatTrackerActionSlotAsUsed(item, item.system.type || 'primary', message);
      await this._handleEnablerEffects(item);

      return message;
    } catch (error) {
      game.system.log.e("Error applying effects", error);
      ui.notifications.error(game.i18n.format("FF15.Errors.EffectApplicationFailed", { target: this.params.actor.name }));
    }
  }

  // New helper method to handle roll calculations
  async _handleRollWithModifiers(item) {
    let [diceCount, diceType] = [1, 20];
    let formula = '';

    if (this.RG.shuttle.hasModifiers.extraModifiers) {
      const { bonusDice, penalty } = this.RG.shuttle.hasModifiers.extraModifiers;
      if (bonusDice) {
        diceCount += parseInt(bonusDice);
        diceType = '20kh1';
      }
      formula = `${diceCount}d${diceType}${penalty ? ` - ${penalty}` : ''}`;
    }

    const { rollFormula, rollData } = await this._handleAttributeCheck(item, formula);
    const roll = await new Roll(rollFormula, rollData).evaluate();
    
    // For advantage rolls (kh1), we need to get the highest result
    const d20Term = roll.terms[0];
    const d20Result = d20Term.modifiers.includes('kh1') 
      ? Math.max(...d20Term.results.map(r => r.result))
      : d20Term.results[0].result;
    
    game.system.log.d("[PROC] Roll details:", {
      formula: roll.formula,
      d20Result,
      total: roll.total,
      terms: roll.terms
    });

    return roll;
  }

  // New helper method to handle enabler effects
  async _handleEnablerEffects(item) {
    game.system.log.d("[ENABLE] Starting _handleEnablerEffects for:", {
      itemName: item.name,
      enablesList: item.system.enables.list
    });

    let allEnabledEffects = [];
    for (const enablesItemRef of item.system.enables.list) {
      game.system.log.d("[ENABLE] Processing enable ref:", enablesItemRef);
      const effects = await this._handleSingleItemEffectEnabling(enablesItemRef);
      allEnabledEffects = allEnabledEffects.concat(effects);
    }
    return allEnabledEffects;
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

    // Track reaction usage
    if (item.system.type === 'reaction') {
      await this.params.actor.update({
        'system.actionState.usedReaction': true
      });
      return;
    }

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
    game.system.log.d("[ENABLE] Starting _handleSingleItemEffectEnabling for ref:", enablesItemRef);
    
    // Get the compendium item for reference
    const compendiumItem = await fromUuid(enablesItemRef.uuid);
    if (!compendiumItem) {
      game.system.log.w("[ENABLE] Could not find compendium item for uuid:", enablesItemRef.uuid);
      return [];
    }

    game.system.log.d("[ENABLE] Found compendium item:", {
      name: compendiumItem.name,
      type: compendiumItem.type,
      hasEffects: compendiumItem.hasEffects,
      effects: compendiumItem.effects?.size || 0
    });

    // Find actor's version of the item by matching name and type
    const actorItem = this.params.actor.items.find(item => 
      item.name === compendiumItem.name && 
      item.type === compendiumItem.type
    );

    game.system.log.d("[ENABLE] Actor item search result:", {
      found: !!actorItem,
      name: actorItem?.name,
      hasEffects: actorItem?.hasEffects,
      effects: actorItem?.effects?.size || 0
    });

    if (!actorItem) { return [] }
    if (!actorItem.hasEffects) { return [] }

    // Check if we've hit the usage limit using the actor's version of the item
    const hasRemainingUses = await this.params.actor.actorItemHasRemainingUses(actorItem);
    game.system.log.d("[ENABLE] Usage check:", {
      itemName: actorItem.name,
      hasRemainingUses,
      currentUses: actorItem.currentUses,
      maxUses: actorItem.maxUses,
      effects: actorItem.effects?.size || 0
    });

    if (!hasRemainingUses) {
      game.system.log.w("[ENABLE]", `${actorItem.name} has been used ${actorItem.currentUses} times, reaching its usage limit of ${actorItem.maxUses}`);
      return [];
    }

    // Enable any disabled effects and get their UUIDs
    game.system.log.d("[ENABLE] About to enable effects for:", {
      itemName: actorItem.name,
      effects: actorItem.effects?.size || 0,
      effectsList: Array.from(actorItem.effects || []).map(e => ({ id: e.id, name: e.name, disabled: e.disabled }))
    });
    
    const effectsEnabled = await this.params.actor.enableLinkedEffects(actorItem);
    game.system.log.d("[ENABLE] Effects enabled:", {
      itemName: actorItem.name,
      effectsEnabled,
      effectsCount: effectsEnabled.length
    });

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
                targetActor.toggleStatusEffect(statusesToToggle[0]);
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