import { SYSTEM_ID } from "~/src/helpers/constants.js";

/**
 * Extension of the ActiveEffect class for FFXIV
 * @extends {ActiveEffect}
 */
export default class FFActiveEffect extends ActiveEffect {

  /**
   * Creates a new FFXIV active effect
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
   * Updates the combat duration
   * @return {Promise<void>} Returns a promise that resolves when the duration is updated
   */
  async updateCombatDuration() {
    game.system.log.o('[ACTIVE EFFECT] Starting updateCombatDuration for:', {
      name: this.name,
      origin: this.origin,
      duration: this.duration
    });

    // Get the origin item uuid of the effect from this.origin
    const originUuid = this.origin;
    if (!originUuid) {
      game.system.log.w('[ACTIVE EFFECT] No origin UUID found');
      return;
    }

    // Get the item from the origin item uuid
    const originItem = await fromUuid(originUuid);
    if (!originItem) {
      game.system.log.w('[ACTIVE EFFECT] No origin item found for UUID:', originUuid);
      return;
    }

    game.system.log.o('[ACTIVE EFFECT] Found origin item:', {
      name: originItem.name,
      system: originItem.system
    });

    // Get the duration (and units) from the item
    const duration = originItem.system.duration;
    if (!duration) {
      game.system.log.w('[ACTIVE EFFECT] No duration found on origin item');
      return;
    }

    const effectData = {
      duration: {
        startRound: game.combat?.round ?? 0,
        startTurn: game.combat?.turn ?? 0
      }
    }

    if(originItem.system.durationUnits === "rounds") {
      effectData.duration.rounds = originItem.system.duration;
      effectData.duration.turns = 0;
      game.system.log.o('[ACTIVE EFFECT] Setting rounds duration:', effectData.duration);
    } else if(originItem.system.durationUnits === "turns") {
      effectData.duration.turns = originItem.system.duration;
      effectData.duration.rounds = 0;
      game.system.log.o('[ACTIVE EFFECT] Setting turns duration:', effectData.duration);
    }

    // Set the duration to the effect
    game.system.log.o('[ACTIVE EFFECT] Updating effect with duration:', effectData);
    await this.update(effectData);
  }

  async delete(options={}) {
    game.system.log.o('[ACTIVE EFFECT] Starting effect deletion:', {
      effectName: this.name,
      effectId: this.id,
      effectDuration: this.duration,
      effectFlags: this.flags,
      effectChanges: this.changes,
      effectDisabled: this.disabled,
      options
    });

    try {
      const result = await super.delete(options);
      game.system.log.o('[ACTIVE EFFECT] Effect deletion completed:', {
        effectName: this.name,
        result
      });
      return result;
    } catch (error) {
      game.system.log.e('[ACTIVE EFFECT] Effect deletion failed:', {
        effectName: this.name,
        error
      });
      throw error;
    }
  }
}
