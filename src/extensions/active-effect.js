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
    const origin = fromUuidSync(this.origin);
    if (!origin?.transferredEffects?.length) return false;
    return Array.isArray(origin.transferredEffects) && 
            origin.transferredEffects.length > 0;
  }

  static async setCombatDuration(effectData) {
    game.system.log.o("[ENABLE] setCombatDuration effectsData pre", effectData);
    // Get the origin item
    const originItem = await fromUuid(effectData.origin);
    game.system.log.o("[EFFECT] setCombatDuration originItem", originItem);
    if (!originItem?.system?.duration) return;
    
    // effectData.duration = {
    //   startRound: game.combat?.round ?? 0,
    //   startTurn: game.combat?.turn ?? 0
    // }
    
    effectData.duration = originItem.system.duration;

    game.system.log.o("[ENABLE] setCombatDuration effectsData post", effectData);
  }

  async updateCombatDuration() {
    // Get the origin item uuid of the effect from this.origin
    const originUuid = this.origin;
    if (!originUuid) return;

    // Get the item from the origin item uuid
    const originItem = await fromUuid(originUuid);
    game.system.log.o("[EFFECT] updateCombatDuration originItem", originItem);

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
