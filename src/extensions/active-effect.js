import { SYSTEM_ID } from "~/src/helpers/constants.js";

/**
 * Extension of the ActiveEffect class for FF15
 * @extends {ActiveEffect}
 */
export default class FFActiveEffect extends ActiveEffect {

  /**
   * Creates a new FF15 active effect
   * @param {object} data - The effect data
   * @param {object} context - The initialization context
   */
  constructor(data, context) {
    super(data, context);
  }

  /**
   * Gets whether the effect is temporary
   * @return {boolean} Returns true if the effect is temporary
   */
  get isTemporary() {
    if (this.getFlag(SYSTEM_ID, "overlay")) return true;
    return super.isTemporary;
  }

  /**
   * Check if the effect is transferred from an item 
   * (i.e. a passive effect from an item owned by that actor, 
   * rather than an active effect transferred as a result of an action 
   * by another actor)
   * @return {boolean} Whether the effect is transferred from an item
   */
  get isTransferred() {
    const origin = fromUuidSync(this.origin);
    if (!origin?.transferredEffects?.length) return false;
    return Array.isArray(origin.transferredEffects) && 
            origin.transferredEffects.length > 0;
  }

  /**
   * Sets the combat duration for the effect
   * @param {object} effectData - The effect data
   * @return {Promise<void>} Returns a promise that resolves when the duration is set
   */
  static async setCombatDuration(effectData) {
    // Get the origin item
    const originItem = await fromUuid(effectData.origin);
    if (!originItem?.system?.duration) return;
    
    // effectData.duration = {
    //   startRound: game.combat?.round ?? 0,
    //   startTurn: game.combat?.turn ?? 0
    // }
    
    effectData.duration = originItem.system.duration;

  }

  /**
   * Updates the combat duration
   * @return {Promise<void>} Returns a promise that resolves when the duration is updated
   */
  async updateCombatDuration() {
    // Get the origin item uuid of the effect from this.origin
    const originUuid = this.origin;
    if (!originUuid) return;

    // Get the item from the origin item uuid
    const originItem = await fromUuid(originUuid);

    if (!originItem) return;

    // Get the duration (and units) from the item
    const duration = originItem.system.duration;
    if (!duration) return;

    const effectData = {
      duration: {
        startRound: game.combat?.round ?? 0,
        startTurn: game.combat?.turn ?? 0
      }
    }

    if(originItem.system.durationUnits === "rounds") {
      effectData.duration.rounds = originItem.system.duration;
      effectData.duration.turns = 0;
    } else if(originItem.system.durationUnits === "turns") {
      effectData.duration.turns = originItem.system.duration;
      effectData.duration.rounds = 0;
    }

    // Set the duration to the effect
    await this.update(effectData);
  }
}
