import RollCalc from "./RollCalc.js"
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
}