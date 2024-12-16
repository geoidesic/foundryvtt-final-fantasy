import RollCalc from "./RollCalc.js"
import { generateRandomElementId } from "~/src/helpers/util";
import { SYSTEM_ID } from "./constants.js"

export default class RollCalcActor extends RollCalc {
  
  async equipment(params) {
    
    ChatMessage.create({
      user: game.user.id,
      flags: { [SYSTEM_ID]: { data: {...params, chatTemplate: 'EquipmentChat'} } }
    })
    return;

    const message = await this.defaultItem(params);

    game.system.log.d('equipment params', params);
    message.rollType = params.rollType;
    message.chatTemplate = 'EquipmentChat';

    return message;
  }

  async defaultItem(params) {
    const item = params.item;
    const actor = params?.actor;
    const { roll, die, error } = await this.roll(6, 1);
    if (error) return false;
    return { item, actor, roll, die, formula: '' };
  }

  async execute(type, item) {
    game.system.log.d('execute', type, item);
    if(type === 'action') {
      return this.executeAction(item);
    }
    if(type === 'trait') {
      return this.executeTrait(item);
    }
  }

  async executeTrait(item) {
    game.system.log.d('executeTrait', item);
    this.params.item = item;
    this.params.rollType = 'RollChat';
    const message = await this.defaultItem(this.params);
    game.system.log.d('message', message);

    ChatMessage.create({
      user: game.user.id,
      flags: { [SYSTEM_ID]: { data: {...message, chatTemplate: 'RollChat'} } }
    })
  }

  async executeAction(item) {
    if (item.type !== "action") return;

    // Show dialog for extra modifiers
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
    const roll = await new Roll(rollFormula, rollData).evaluate({async: true});
    
    // Create chat message data
    const messageData = {
      id: `${SYSTEM_ID}--actor-sheet-${generateRandomElementId()}`,
      speaker: ChatMessage.getSpeaker({ actor: this.params.actor }),
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