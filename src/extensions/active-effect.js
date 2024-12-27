import { SYSTEM_ID } from "~/src/helpers/constants.js";

export default class FFActiveEffect extends ActiveEffect {

    get isTemporary() {
      if (this.getFlag(SYSTEM_ID, "overlay")) return true;
      return super.isTemporary;
    }

    /**
     * Check if the effect is transferred from an item 
     * (i.e. a passive effect from an item owned by that actor, 
     * rather than an active effect transferred as a result of an action 
     * by another actor)
     * @returns {boolean}
     */
    get isTransferred() {
      return this.flags?.[SYSTEM_ID]?.originInstance.transferredEffects.length > 0;
    }

}
