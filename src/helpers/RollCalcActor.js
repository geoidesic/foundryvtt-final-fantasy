import RollCalc from "./RollCalc.js"
import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_ID } from "./constants.js"


export default class RollCalcActor extends RollCalc {

  async defaultChat(item) {

    await ChatMessage.create({
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
    await this.defaultChat(item);
  }


  async abilityAction(item) {
    // Get targets before showing dialog
    const targets = game.user.targets;
    const hasTargets = targets.size > 0;

    if (!(await this._handleGuards(item, [
      this.RG.isAction,
      this.RG.hasTargets,
      this.RG.hasActiveEnablerSlot,
      this.RG.hasModifiers,
    ]))) {
      return;
    }
    
    await this._handleRemainingUses(item);

    // Build roll formula and data
    let formula = `1d20 + ${this.RG.shuttle.hasModifiers.extraModifiers.modifier} `;
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
    const message = await roll.toMessage(messageData);

    // Mark the action as used
    await this._markActionAsUsed(item, item.system.type || 'primary', message);

    // Enable the effects of the action
    await this._handleEffectEnabling(item);
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
    game.system.log.d("[SLOT_UPDATE] Starting slot update for:", item.name);
    game.system.log.d("[SLOT_UPDATE] Available slots:", actionState.available);
    game.system.log.d("[SLOT_UPDATE] Item tags:", item.system.tags);

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
        game.system.log.d("[SLOT_UPDATE] Found matching tag slot:", matchingSlot);
        slotToUse = matchingSlot;

        // If we're using a tag slot, we need to disable any matching enabler effects
        const enabledEffects = this.params.actor.effects.filter(
          effect => effect.statuses.has('enabled')
        );
        
        for (const effect of enabledEffects) {
          const originItem = fromUuidSync(effect.origin);
          if (originItem?.system.tags?.includes(slotToUse)) {
            game.system.log.d("[SLOT_UPDATE] Disabling enabler effect:", effect);
            await effect.update({ disabled: true });
          }
        }
      }
    }

    // If no tag slot found, fall back to primary/secondary
    if (!slotToUse && actionState.available.includes(actionType)) {
      game.system.log.d("[SLOT_UPDATE] Using action type slot:", actionType);
      slotToUse = actionType;
    }

    if (!slotToUse) {
      game.system.log.w("[SLOT_UPDATE] No valid slot found to use");
      return;
    }

    game.system.log.d("[SLOT_UPDATE] Final slot to use:", slotToUse);

    // Create new available array and remove exactly one instance of the used slot
    const newAvailable = [...actionState.available];
    const indexToRemove = newAvailable.findIndex(slot => slot === slotToUse);
    if (indexToRemove !== -1) {
      newAvailable.splice(indexToRemove, 1);
      game.system.log.d("[SLOT_UPDATE] Removed slot at index:", indexToRemove);
    }

    // Create new used array
    const newUsed = [...actionState.used, {
      type: slotToUse,
      messageId: message.id
    }];

    game.system.log.d("[SLOT_UPDATE] New available slots:", newAvailable);
    game.system.log.d("[SLOT_UPDATE] New used slots:", newUsed);

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

    if (!(await this._handleGuards(item, [
      this.RG.hasEnablers
    ]))) {
      return;
    }

    const actorEffects = this.params.actor.effects;
    
    // Iterate through the enables list
    for (const enableItemRef of item.system.enables.list) {

      // Get the actual item from the UUID
      const enableItem = await fromUuid(enableItemRef.uuid);
      if (!enableItem) {
        continue;
      }

      // Get the item's effects
      const itemEffects = enableItem.effects;
      if (!itemEffects?.size) {
        continue;
      }

      // For each effect on the enabled item
      for (const effect of itemEffects) {

        // Find matching effect on actor (if any)
        const matchingEffect = actorEffects.find(ae =>
          ae.label === effect.label &&
          ae.disabled // Only enable if it's currently disabled
        );

        // If we found a matching disabled effect, enable it
        if (matchingEffect) {
          await matchingEffect.update({ disabled: false });
        }
      }

      //- create a chat message for the enabled effect, to remind the user and GM that it is in play
      this.ability(enableItem.type, enableItem);
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
      if (!(await guardMethod.call(this.RG, item))) {
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
   * Tracks action usage for limited actions.
   * Check for limitations only if in combat 
   * and if the item has limitations but fewer uses, then add uses
   */
  async _handleRemainingUses(item) {
    // Check for limitations only if in combat
    if (item.system.hasLimitation && game.combat) {
      const maxUses = item.system.limitation;

      // Check remaining uses
      const remainingUses = maxUses - (item.system.uses || 0);
      if (remainingUses <= 0) {
        ui.notifications.warn(`${item.name} has no remaining uses.`);
        return;
      }

      // Confirm use
      const confirmed = await Dialog.confirm({
        title: "Confirm Ability Use",
        content: `<p>Use ${item.name}? (${remainingUses} use${remainingUses > 1 ? 's' : ''} remaining)</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: true
      });

      if (!confirmed) return;

      // Update uses while preserving other system data
      const systemData = foundry.utils.deepClone(item.system);
      systemData.uses = (systemData.uses || 0) + 1;
      await item.update({ system: systemData });
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
      game.system.log.d('check', item.system.checkAttribute);
      const attrVal = this.params.actor.system.attributes.primary[item.system.checkAttribute]?.val || 0;
      rollData[item.system.checkAttribute] = attrVal;
      rollFormula += ` + @${item.system.checkAttribute}`;
    }
    return { rollFormula, rollData };
  }
}