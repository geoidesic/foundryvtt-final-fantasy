import RollCalc from "./RollCalc.js"
import { SYSTEM_ID } from "./constants.js"
export default class RollCalcActor extends RollCalc {


  async equipment(params) {
    const message = await this.defaultItem(params);

    game.system.log.d('equipment params', params);
    message.rollType = params.rollType;
    message.chatTemplate = 'EquipmentChat';
    message.title = 'Use';

    return message;
   
  }

  async defaultItem(params) {
    const item = params.item
    const actor = params?.actor
    const { roll, die, error } = await this.roll(6, 1)
    if (error) return false;
    return { item, actor, roll, die, formula: '' };
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
    const hasTargets = targets.size > 0;

    // Roll d20 + Ability Modifier
    const roll = await new Roll("1d20").evaluate({async: true});
    
    // Create chat message data
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.params.actor }),
      flavor: `${item.name}`,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll,
      flags: {
        [SYSTEM_ID]: {
          data: {
            chatTemplate: "RollChat",
            actor: {
              _id: this.params.actor._id,
              name: this.params.actor.name,
              img: this.params.actor.img
            },
            item: {
              _id: item._id,
              name: item.name,
              img: item.img,
              type: item.type,
              system: item.system
            },
            hasTargets,
            roll: roll.total,
            extraModifiers
          }
        }
      }
    };

    await roll.toMessage(messageData);
  }
}