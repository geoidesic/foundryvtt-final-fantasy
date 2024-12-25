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
    if (item.type !== "action") {
      return;
    }

    // Check if we have targeted entities
    const targets = game.user.targets;
    game.system.log.d("race targets", targets);
    const hasTargets = targets.size > 0;

    // if no targets, then don't roll
    if (!hasTargets) {
      ui.notifications.warn(`${item.name} has no targets. Please select targets and roll again.`);
      return;
    }

    await this._handleRemainingUses(item);

    // Show dialog for extra modifiers
    const extraModifiers = await this._showModifierDialog(item);

    // If dialog was cancelled or closed, return early
    if (!extraModifiers?.confirmed) {
      return;
    }

    // Build roll formula and data
    let formula = `1d20 + ${extraModifiers.modifier} `;
    let { rollFormula, rollData } = await this._handleAttributeCheck(item, formula);

    // Evaluate roll with actor data
    const roll = await new Roll(rollFormula, rollData).evaluate({ async: true });

    // Create chat message data
    const messageData = {
      id: `${SYSTEM_ID}--actor-sheet-${generateRandomElementId()}`,
      speaker: game.settings.get(SYSTEM_ID, 'chatMessageSenderIsActorOwner') ? ChatMessage.getSpeaker({ actor: this.params.actor }) : null,
      // speaker: ChatMessage.getSpeaker({ actor: this.params.actor }), //- this sets the speaker to the actor owner, without it, it will be the user that triggered the action
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
            extraModifiers,
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

    // Before creating the message, check if this action type is available
    const actionType = item.system.type || 'primary'; // default to primary if not set
    const { actionState } = this.params.actor.system;
    
    if (!actionState.available.includes(actionType)) {
      ui.notifications.warn(`No ${actionType} action available.`);
      return;
    }

    // Create the message
    const message = await roll.toMessage(messageData);

    // Find the index of the first matching action type
    const indexToRemove = actionState.available.findIndex(a => a === actionType);

    // Create new available array without the used action
    const newAvailable = [...actionState.available];
    if (indexToRemove !== -1) {
      newAvailable.splice(indexToRemove, 1);
    }

    // Update the actor's actionState
    await this.params.actor.update({
      'system.actionState.available': newAvailable,
      'system.actionState.used': [...actionState.used, {
        type: actionType,
        messageId: message.id
      }]
    });

    // Handle effect enabling after successful modifier dialog
    await this._handleEffectEnabling(item);

  }


  /******************
   * Private methods
   ******************/

  async _updateActionState(actionType, messageId) {
    const { actionState } = this.params.actor.system;
    
    // Update the actor's actionState
    await this.params.actor.update({
      'system.actionState': {
        
        available: [...actionState.available.filter(a => a !== actionType)],
        used: [...actionState.used, {
          type: actionType,
          messageId: messageId
        }]
      }
    });
  }

  async _handleEffectEnabling(item) {

    if (!game.combat || !item.system.enables?.value) {
      
      return;
    }

    const enablesList = item.system.enables.list;
    if (!enablesList?.length) {
      return;
    }

    // Get all active effects currently on the actor
    const actorEffects = this.params.actor.effects;

    // Iterate through the enables list
    for (const enableItemRef of enablesList) {

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

      this.ability(enableItem.type, enableItem);
    }
  }

  async _routeAbility(item) {
    if (item.type === "action") {
      await this.abilityAction(item);
    } else if (item.type === "trait") {
      await this.abilityTrait(item);
    }
  }

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


  async _showModifierDialog(item) {

    return await Dialog.prompt({
      title: "Extra Modifiers",
      content: `
        <form>
          <div class="form-group">
            <label>Additional Modifier:</label>
            <input type="number" name="modifier" value="0">
          </div>
        </form>
      `,
      label: "Roll",
      callback: (html) => {
        const form = html[0].querySelector("form");
        return {
          modifier: parseInt(form.modifier.value) || 0,
          confirmed: true
        };
      },
      rejectClose: true // This ensures we get a proper reject when dialog is closed
    });
  }

  async _handleAttributeCheck(item, rollFormula, rollData={}) {
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