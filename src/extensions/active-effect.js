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
   * Sets the combat duration for the effect from the origin of the item
   * @param {ActiveEffect} activeEffect - The active effect to set duration for
   * @return {Promise<void>} Returns a promise that resolves when the duration is set
   */
  static async setCombatDuration(activeEffect) {
    game.system.log.o('[ACTIVE EFFECT] Starting setCombatDuration:', {
      effectName: activeEffect.name,
      effectDuration: activeEffect.duration,
      effectFlags: activeEffect.flags,
      effectOrigin: activeEffect.origin
    });

    // Get effect item
    const effectItem = await fromUuid(activeEffect.uuid);
    game.system.log.o('[ACTIVE EFFECT] Effect Item duration data:', {
      effectItem: effectItem?.name,
      duration: effectItem?.system?.duration,
      durationUnits: effectItem?.system?.durationUnits,
      durationType: effectItem?.system?.durationType,
      durationQualifier: effectItem?.system?.durationQualifier,
      flags: effectItem?.flags
    });

    // Get source item
    const sourceItem = await fromUuid(activeEffect.origin);
    game.system.log.o('[ACTIVE EFFECT] Source Item duration data:', {
      sourceItem: sourceItem?.name,
      duration: sourceItem?.system?.duration,
      durationUnits: sourceItem?.system?.durationUnits,
      durationType: sourceItem?.system?.durationType,
      durationQualifier: sourceItem?.system?.durationQualifier,
      flags: sourceItem?.flags
    });

    // Get base duration data
    const combat = game.combat;
    const baseDurationData = {
      startTime: game.time.worldTime,
      startRound: combat?.round ?? 1,
      startTurn: combat?.turn ?? 0,
      combat: combat?.id
    };

    game.system.log.o('[ACTIVE EFFECT] Base duration data:', baseDurationData);

    // Set duration based on type
    const durationType = sourceItem?.system?.durationType || effectItem?.system?.durationType;
    const durationUnits = sourceItem?.system?.durationUnits || effectItem?.system?.durationUnits;
    const durationQualifier = sourceItem?.system?.durationQualifier || effectItem?.system?.durationQualifier;
    const duration = sourceItem?.system?.duration || effectItem?.system?.duration;

    game.system.log.o('[ACTIVE EFFECT] Duration components:', {
      durationType,
      durationUnits,
      durationQualifier,
      duration
    });

    let durationData = baseDurationData;

    // Set the duration type based on the source configuration
    if (durationType === 'hasAmount' && duration) {
      // For numeric durations in rounds/turns
      durationData = {
        ...baseDurationData,
        type: durationUnits || 'rounds', // Use rounds as default if not specified
        [durationUnits === 'turns' ? 'turns' : 'rounds']: duration
      };
      game.system.log.o('[ACTIVE EFFECT] Set numeric duration:', durationData);
    } else if (durationType === 'hasQualifier' && durationQualifier) {
      // For special timing conditions
      durationData = {
        ...baseDurationData,
        type: durationQualifier,
        [durationUnits === 'turns' ? 'turns' : 'rounds']: 1  // Default to 1 for qualifiers that need a duration
      };

      // Add any qualifier-specific data
      switch (durationQualifier) {
        case 'endOfThis':
          // Duration until end of current turn/round
          game.system.log.o('[ACTIVE EFFECT] Setting endOfThis duration');
          break;
        case 'endOfNext':
          // Duration until end of next turn/round
          durationData[durationUnits === 'turns' ? 'turns' : 'rounds'] = 2;
          game.system.log.o('[ACTIVE EFFECT] Setting endOfNext duration');
          break;
        case 'startOfNext':
          // Duration until start of next turn/round
          durationData[durationUnits === 'turns' ? 'turns' : 'rounds'] = 1;
          game.system.log.o('[ACTIVE EFFECT] Setting startOfNext duration');
          break;
        case 'untilDamage':
          // Special flag for damage-based duration
          durationData.requiresDamage = true;
          game.system.log.o('[ACTIVE EFFECT] Setting untilDamage duration');
          break;
        case 'nextAbility':
          // Special flag for ability-based duration
          await activeEffect.update({
            // Store our custom duration type in system data
            'system.duration.type': 'nextAbility',
            // Use Foundry's core duration system for basic tracking
            'duration': {
              ...baseDurationData,
              type: 'turns',  // Use turns as the base type
              turns: 999,     // Set a high number since we'll handle removal ourselves
              startRound: game.combat?.round ?? 1,
              startTurn: game.combat?.turn ?? 0,
              combat: game.combat?.id
            }
          });
          game.system.log.o('[ACTIVE EFFECT] Setting nextAbility duration with data:', {
            effectName: activeEffect.name,
            systemDuration: { type: 'nextAbility' },
            coreDuration: {
              ...baseDurationData,
              type: 'turns',
              turns: 999
            }
          });
          break;
      }

      game.system.log.o('[ACTIVE EFFECT] Set qualified duration:', {
        durationData,
        effectName: activeEffect.name,
        durationType,
        durationQualifier
      });
    } else {
      // If no duration type is specified or it's set to none, set a default
      durationData = {
        ...baseDurationData,
        type: 'none'
      };
      game.system.log.o('[ACTIVE EFFECT] Set default duration:', durationData);
    }

    game.system.log.o('[ACTIVE EFFECT] Final duration data:', {
      effectName: activeEffect.name,
      durationData,
      durationType,
      durationQualifier,
      durationUnits,
      duration
    });

    // Update the effect with the new duration
    try {
      game.system.log.o('[ACTIVE EFFECT] Attempting to update effect with duration:', {
        effectName: activeEffect.name,
        currentDuration: activeEffect.duration,
        newDuration: durationData
      });

      await activeEffect.update({ duration: durationData });
      
      game.system.log.o('[ACTIVE EFFECT] Successfully updated effect duration:', activeEffect);
    } catch (error) {
      game.system.log.e('[ACTIVE EFFECT] Failed to update effect duration:', {
        effectName: activeEffect.name,
        error,
        durationData
      });
      throw error;
    }
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
