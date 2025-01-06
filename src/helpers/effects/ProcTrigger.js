import { activeEffectModes, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

export default class ProcTrigger {

  constructor(actor) {
    this.actor = actor;
  }
  async process(event) {
    const { item, roll, targets } = event;
    console.log(item, roll, targets);
  }
}