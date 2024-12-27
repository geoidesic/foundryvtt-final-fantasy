import { SYSTEM_ID } from "~/src/helpers/constants.js";

export default class FFActiveEffect extends ActiveEffect {

    get isTemporary() {
      if (this.getFlag(SYSTEM_ID, "overlay")) return true;
      return super.isTemporary;
    }

}
