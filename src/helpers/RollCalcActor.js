import RollCalc from "./RollCalc.js"
import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_ID } from "./constants.js"

export default class RollCalcActor extends RollCalc {


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
    game.system.log.g('ability method start', { type, item });

    // Check for limitations only if in combat
    if (item.system.hasLimitation && game.combat) {
      game.system.log.g('item has limitation and in combat', { maxUses: item.system.limitation, currentUses: item.system.uses });
      const maxUses = item.system.limitation;
      
      // Check remaining uses
      const remainingUses = maxUses - (item.system.uses || 0);
      if (remainingUses <= 0) {
        game.system.log.g('no uses remaining');
        ui.notifications.warn(`${item.name} has no remaining uses.`);
        return;
      }

      // Confirm use
      game.system.log.g('showing confirmation dialog');
      const confirmed = await Dialog.confirm({
        title: "Confirm Ability Use",
        content: `<p>Use ${item.name}? (${remainingUses} use${remainingUses > 1 ? 's' : ''} remaining)</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: true
      });

      game.system.log.g('dialog result', { confirmed });
      if (!confirmed) return;

      // Update uses while preserving other system data
      game.system.log.g('updating uses');
      const systemData = foundry.utils.deepClone(item.system);
      systemData.uses = (systemData.uses || 0) + 1;
      await item.update({ system: systemData });
      game.system.log.g('uses updated', { newUses: systemData.uses });
    }

    // Execute the appropriate ability type
    game.system.log.g('executing ability type', { type });
    if (type === 'action') {
      game.system.log.g('calling abilityAction');
      await this.abilityAction(item);
      game.system.log.g('abilityAction completed');
    } else if (type === 'trait') {
      game.system.log.g('calling abilityTrait');
      await this.abilityTrait(item);
      game.system.log.g('abilityTrait completed');
    }
    game.system.log.g('ability method complete');
  }

  async abilityTrait(item) {
    game.system.log.g('abilityTrait start', { item });
    
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
    game.system.log.g('trait chat message created');
  }

  async abilityAction(item) {
    game.system.log.g('abilityAction start', { item });
    if (item.type !== "action") {
      game.system.log.g('not an action item, returning');
      return;
    }

    // Show dialog for extra modifiers
    game.system.log.g('showing modifier dialog');
    const extraModifiers = await Dialog.prompt({
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
          modifier: parseInt(form.modifier.value) || 0
        };
      }
    });
    game.system.log.g('modifier dialog complete', { extraModifiers });

    // Check if we have targeted entities
    const targets = game.user.targets;
    game.system.log.d("race targets", targets);
    const hasTargets = targets.size > 0;

    // Build roll formula and data
    let rollFormula = `1d20 + ${extraModifiers.modifier} `;
    const rollData = {};

    // Add attribute check if specified
    if (item.system.hasCheck) {
      game.system.log.d('check', item.system.checkAttribute);
      const attrVal = this.params.actor.system.attributes.primary[item.system.checkAttribute]?.val || 0;
      rollData[item.system.checkAttribute] = attrVal;
      rollFormula += ` + @${item.system.checkAttribute}`;
    }

    game.system.log.d('rollFormula', rollFormula);
    game.system.log.d('rollData', rollData);

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

    await roll.toMessage(messageData);
  }
}