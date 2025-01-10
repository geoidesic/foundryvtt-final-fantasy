import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_ID } from "./constants.js"
import RollCalc from "./RollCalc.js"
import FFActiveEffect from "~/src/extensions/active-effect.js"

/**
 * Extends RollCalc to handle actor-specific roll calculations
 * @extends {RollCalc}
 */
export default class RollCalcActor extends RollCalc {

  /**
   * Create a default chat message for an item
   * @param {Item} item - The item to create a chat message for
   * @return {Promise<ChatMessage>} The created chat message
   */
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
   * @return {Promise<void>} 
   */
  async attribute(key, code) {
    const attributeValue = this.params.actor.system.attributes[key][code].val;
    const rollFormula = `1d20 + ${attributeValue}`;
    const attributeName = game.i18n.localize(`FF15.Types.Actor.Types.PC.Attributes.${key}.${code}.Abbreviation`);
    const roll = await new Roll(rollFormula).evaluate({ async: true });
    const isCritical = roll.total === 20;
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
            modifier: attributeValue,
            isCritical
          },
          css: `attribute-roll ${isCritical ? 'crit' : ''}`
        }
      }
    };
    await roll.toMessage(messageData);
  }

  /**
   * Handle an ability roll
   * @param {string} type - The type of ability
   * @param {Item} item - The ability item
   * @return {Promise<void>}
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
   * Create message data for an action
   * @param {Item} item - The action item
   * @param {boolean} hasTargets - Whether there are targets
   * @param {Array} targets - Array of target ids
   * @param {Roll} [roll=null] - Optional roll data
   * @param {boolean} [isCritical=false] - Whether the roll was critical
   * @return {Object} Message data object
   */
  _createActionMessageData(item, hasTargets, targets, roll = null, isCritical = false) {
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
                hasDirectHit: item.system?.hasDirectHit,
                CR: item.system?.CR,
                isHealerRecovery: item.system?.isHealerRecovery
              }
            },
            hasTargets,
            targets,
            isSuccess: false,
            isCritical: false,
            d20Result: null
          },
          state: {
            damageResults: false,
            initialised: false
          },
          css: `leather ${isCritical ? 'crit' : ''}`
        }
      }
    };

    // Add roll total to flags if provided
    if (roll) {
      messageData.flags[SYSTEM_ID].data.roll = roll.total;
    }

    return messageData;
  }

  /**
   * Handle an action ability
   * @param {Item} item - The action item
   * @param {Object} [options={}] - Additional options
   * @return {Promise<ChatMessage|void>} The created chat message if successful
   */
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

      let message;
      let roll;
      let isSuccess = false;
      let isCritical = false;
      let d20Result = null;

      if (item.system.hasCR) {
        // Handle roll with modifiers
        const rollResult = await this._handleRollWithModifiers(item);
        roll = rollResult.roll;
        isSuccess = rollResult.isSuccess;
        isCritical = rollResult.isCritical;
        d20Result = rollResult.d20Result;

        game.system.log.d("[ACTION] Roll result:", {
          itemName: item.name,
          total: roll.total,
          isSuccess,
          isCritical,
          d20Result
        });

        // Create message data with roll results
        const messageData = this._createActionMessageData(item, hasTargets, targetIds, roll, isCritical);
        messageData.flags[SYSTEM_ID].data.isSuccess = isSuccess;
        messageData.flags[SYSTEM_ID].data.isCritical = isCritical;
        messageData.flags[SYSTEM_ID].data.d20Result = d20Result;

        message = await roll.toMessage(messageData);

        // If successful, handle effects
        if (isSuccess) {
          await this._handleEnablerEffects(item);
        }
      } else {
        message = item.system.hasBaseEffect && item.system.baseEffectType === 'damage'
          ? await ChatMessage.create(this._createActionMessageData(item, hasTargets, targetIds))
          : await this.defaultChat(item);
      }

      // Check for proc trigger
      if (item.system.procTrigger) {
        Hooks.callAll('FF15.ProcTrigger', { 
          actor: this.params.actor, 
          item,
          roll,
          targets
        });
      }

      // Mark action as used
      await this._markCombatTrackerActionSlotAsUsed(item, item.system.type || 'primary', message);

      return message;
    } catch (error) {
      game.system.log.e("Error applying effects", error);
      ui.notifications.error(game.i18n.format("FF15.Errors.EffectApplicationFailed", { target: this.params.actor.name }));
    }
  }

  /**
   * Handle critical hit detection and processing
   * @param {Roll} roll - The roll object
   * @param {Item} item - The item being used
   * @return {Object} Object containing critical hit information
   */
  async _handleCriticalHit(roll, item) {
    // Get the d20 result
    const d20Term = roll.terms[0];
    const d20Result = d20Term.modifiers.includes('kh1') 
      ? Math.max(...d20Term.results.map(r => r.result))
      : d20Term.results[0].result;

    // Check if it's a critical hit (natural 20)
    const isCritical = d20Result === 20;

    game.system.log.d("[CRITICAL] Critical hit check:", {
      d20Result,
      isCritical,
      itemName: item.name,
      isHealerRecovery: item.system.isHealerRecovery
    });

    // If it's a critical hit, we need to:
    // 1. Double the damage/healing dice
    // 2. Auto-succeed the check
    if (isCritical) {
      // For healer recovery skills, we only double healing dice
      const isHealerRecovery = item.system.baseEffectType === 'heal';
      const hasDirectHit = item.system.hasDirectHit && !isHealerRecovery;

      // Double all damage/healing dice formulas
      const formulaFields = isHealerRecovery 
        ? ['formula'] // Only double healing for healer recovery skills
        : ['directHitDamage', 'formula']; // Double damage for other skills

      for (const field of formulaFields) {
        const formula = item.system[field];
        if (formula) {
          // Double the number of dice in all dice expressions
          const modifiedFormula = formula.replace(/(\d+)d(\d+)/g, (match, count, sides) => {
            return `${parseInt(count) * 2}d${sides}`;
          });
          item.system[field] = modifiedFormula;

          game.system.log.d("[CRITICAL] Modified formula:", {
            field,
            original: formula,
            modified: modifiedFormula
          });
        }
      }
    }

    return {
      isCritical,
      d20Result,
      // Return original roll formula for reference
      originalFormulas: {
        directHitDamage: item.system.directHitDamage,
        formula: item.system.formula
      }
    };
  }

  /**
   * Handle roll modifiers for an action
   * @param {Item} item - The item being used
   * @return {Promise<Object>} Object containing roll results
   */
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
    
    // Handle critical hit detection
    const criticalInfo = await this._handleCriticalHit(roll, item);
    const { isCritical, d20Result } = criticalInfo;

    // If it's a critical hit, we auto-succeed regardless of DC
    const isSuccess = isCritical || roll.total >= item.system.CR;

    game.system.log.d("[ROLL] Roll details:", {
      formula: roll.formula,
      d20Result,
      total: roll.total,
      terms: roll.terms,
      isCritical,
      isSuccess,
      CR: item.system.CR,
      isHealerRecovery: item.system.isHealerRecovery
    });

    // If it's a critical hit and a healer recovery skill, double the healing
    if (isCritical && item.system.isHealerRecovery && item.system.formula) {
      // Double the healing dice
      const healFormula = item.system.formula;
      const modifiedFormula = healFormula.replace(/(\d+)d(\d+)/g, (match, count, sides) => {
        return `${parseInt(count) * 2}d${sides}`;
      });
      item.system.formula = modifiedFormula;

      game.system.log.d("[CRITICAL] Modified healing formula:", {
        original: healFormula,
        modified: modifiedFormula
      });
    }

    return {
      roll,
      isSuccess,
      isCritical,
      d20Result
    };
  }

  /**
   * Handle enabler effects for an action
   * @param {Item} item - The item being used
   * @return {Promise<void>}
   */
  async _handleEnablerEffects(item) {
    let allEnabledEffects = [];
    for (const enablesItemRef of item.system.enables.list) {
      const effects = await this._handleSingleItemEffectEnabling(enablesItemRef);
      allEnabledEffects = allEnabledEffects.concat(effects);
    }
    return allEnabledEffects;
  }

  /**
   * Handle target effects for an action
   * @param {Item} item - The item being used
   * @param {Set<Token>} targets - The targets to apply effects to
   * @return {Promise<void>}
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

  /**
   * Mark a combat tracker action slot as used
   * @param {Item} item - The item that was used
   * @param {string} actionType - The type of action
   * @param {ChatMessage} message - The associated chat message
   * @return {Promise<void>}
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

  /**
   * Check if an item should be disabled based on tags
   * @param {Item} item - The item to check
   * @param {Item} origin - The origin item
   * @return {Promise<boolean>} Whether the item should be disabled
   */
  async _shouldDisableByTags(item, origin) {
    const itemTags = item?.system?.tags || [];
    const shouldDisable = origin?.system?.tags?.some(tag => itemTags.includes(tag)) || false;
    return shouldDisable;
  }

  /**
   * Check if an item should be disabled based on requirements
   * @param {Item} item - The item to check
   * @param {Item} origin - The origin item
   * @param {ActiveEffect} effect - The effect to check
   * @return {Promise<boolean>} Whether the item should be disabled
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

  /**
   * Handle enabling a single item's effects
   * @param {Object} enablesItemRef - Reference to the item to enable
   * @return {Promise<void>}
   */
  async _handleSingleItemEffectEnabling(enablesItemRef) {
    // Get the compendium item for reference
    const compendiumItem = await fromUuid(enablesItemRef.uuid);
    if (!compendiumItem) {
      game.system.log.w("[ENABLE] Could not find compendium item for uuid:", enablesItemRef.uuid);
      return [];
    }

    // Find actor's version of the item by matching name and type
    const actorItem = this.params.actor.items.find(item => 
      item.name === compendiumItem.name && 
      item.type === compendiumItem.type
    );

    if (!actorItem) { return [] }
    if (!actorItem.hasEffects) { return [] }

    // Check if we've hit the usage limit using the actor's version of the item
    const hasRemainingUses = await this.params.actor.actorItemHasRemainingUses(actorItem);

    if (!hasRemainingUses) {
      game.system.log.w("[ENABLE]", `${actorItem.name} has been used ${actorItem.currentUses} times, reaching its usage limit of ${actorItem.maxUses}`);
      return [];
    }

    // Enable any disabled effects and get their UUIDs
    const effectsEnabled = await this.params.actor.enableLinkedEffects(actorItem);

    // If we enabled any effects, create chat message
    if (effectsEnabled.length) {
      // Just send a chat message instead of recursively calling ability
      await this.defaultChat(actorItem);
    }

    return effectsEnabled;
  }

  /**
   * Handle guard checks for an action
   * @param {Item} item - The item to check guards for
   * @param {Array<Function>} guardMethodsArray - Array of guard methods to check
   * @return {Promise<boolean>} Whether all guards passed
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
   * Route an ability to its appropriate handler
   * @param {Item} item - The item to route
   * @return {Promise<void>}
   */
  async _routeAbility(item) {
    if (item.type === "action") {
      await this.abilityAction(item);
    } else if (item.type === "trait") {
      await this.abilityTrait(item);
    }
  }

  /**
   * Handle an attribute check roll
   * @param {Item} item - The item being used
   * @param {string} rollFormula - The formula to roll
   * @param {Object} [rollData={}] - Additional roll data
   * @return {Promise<Roll>} The resulting roll
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
}