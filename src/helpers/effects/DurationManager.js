/**
 * Handles special duration types for effects
 */
export default class DurationManager {
  /**
   * @param {Actor} actor - The actor this effect is applied to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Process duration updates when combat updates
   * @param {Combat} combat - The combat instance
   * @param {object} changed - What changed in the combat
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async updateCombat(combat, changed) {
    if (!("turn" in changed || "round" in changed)) return;

    game.system.log.o('[DURATION MANAGER] updateCombat called:', {
      combat,
      changed,
      actorName: this.actor?.name
    });

    const effects = this.actor.effects.filter(e => 
      e.system?.durations?.length > 0 && !e.disabled
    );

    game.system.log.o('[DURATION MANAGER] Found effects with multiple durations:', effects.map(e => ({
      name: e.name,
      durations: e.system?.durations,
      disabled: e.disabled,
      origin: e.origin
    })));

    for (const effect of effects) {
      const durations = effect.system.durations;
      let shouldDelete = false;

      for (const duration of durations) {
        const durationType = duration.type;
        const durationUnits = duration.units;
        const currentRound = combat.round;
        const currentTurn = combat.turn;
        const startRound = effect.duration.startRound;
        const startTurn = effect.duration.startTurn;

        game.system.log.o('[DURATION MANAGER] Processing duration:', {
          name: effect.name,
          durationType,
          durationUnits,
          currentRound,
          currentTurn,
          startRound,
          startTurn
        });

        switch (durationType) {
          case 'endOfThis':
            if ((durationUnits === 'rounds' && currentRound > startRound) ||
                (durationUnits === 'turns' && (currentRound > startRound || currentTurn > startTurn))) {
              shouldDelete = true;
            }
            break;

          case 'endOfNext':
            if ((durationUnits === 'rounds' && currentRound > startRound + 1) ||
                (durationUnits === 'turns' && currentRound > startRound && currentTurn > startTurn)) {
              shouldDelete = true;
            }
            break;

          case 'startOfNext':
            if ((durationUnits === 'rounds' && currentRound > startRound) ||
                (durationUnits === 'turns' && (currentRound > startRound || currentTurn > startTurn))) {
              shouldDelete = true;
            }
            break;
        }

        if (shouldDelete) break;
      }

      if (shouldDelete) {
        game.system.log.o('[DURATION MANAGER] Deleting effect:', {
          name: effect.name,
          origin: effect.origin
        });
        await effect.delete();
      }
    }
  }

  /**
   * Process duration updates when damage is applied
   * @param {object} event - The damage event
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async onDamage(event) {
    game.system.log.o('[DURATION MANAGER] onDamage called:', {
      event,
      actorName: this.actor?.name
    });

    const effects = this.actor.effects.filter(e => 
      e.system?.durations?.some(d => d.type === 'untilDamage') && !e.disabled
    );

    game.system.log.o('[DURATION MANAGER] Found effects with untilDamage duration:', effects.map(e => ({
      name: e.name,
      durations: e.system?.durations,
      disabled: e.disabled,
      origin: e.origin
    })));

    for (const effect of effects) {
      game.system.log.o('[DURATION MANAGER] Deleting effect:', {
        name: effect.name,
        origin: effect.origin
      });
      await effect.delete();
    }
  }

  /**
   * Process duration updates when an ability is used
   * @param {object} event - The ability use event containing item and isNewAbilityUse
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async onAbilityUse(event) {
    console.log("[FF15] | [DURATION MANAGER] onAbilityUse entry point", {
      itemName: event.item?.name,
      isNewAbilityUse: event.isNewAbilityUse,
      stack: new Error().stack
    });
    game.system.log.o('[DURATION MANAGER] onAbilityUse called:', {
      itemName: event.item?.name,
      itemType: event.item?.type,
      isNewAbilityUse: event.isNewAbilityUse,
      itemSystem: event.item?.system,
      actorName: this.actor?.name,
      itemUuid: event.item?.uuid,
      actorEffects: this.actor.effects.map(e => ({
        name: e.name,
        durations: e.system?.durations,
        disabled: e.disabled,
        origin: e.origin,
        requiresAbility: e.duration?.requiresAbility,
        type: e.duration?.type,
        flags: e.flags
      }))
    });

    if (!event.isNewAbilityUse) {
      game.system.log.o('[DURATION MANAGER] Skipping nextAbility check - not a new ability use');
      return;
    }

    const effects = this.actor.effects.filter(e => 
      e.system?.durations?.some(d => d.type === 'nextAbility') && !e.disabled
    );

    game.system.log.o('[DURATION MANAGER] Found effects with nextAbility duration:', effects.map(e => ({
      name: e.name,
      durations: e.system?.durations,
      disabled: e.disabled,
      origin: e.origin,
      effectUuid: e.uuid,
      flags: e.flags,
      rawEffect: e
    })));

    for (const effect of effects) {
      const effectOrigin = await fromUuid(effect.origin);
      
      if (effectOrigin?.uuid === event.item.uuid || effectOrigin?.name === event.item?.name) {
        game.system.log.o('[DURATION MANAGER] Skipping effect deletion because ability is the source:', {
          effectName: effect.name,
          abilityName: event.item.name,
          systemDuration: effect.system?.durations,
          coreDuration: effect.duration,
          effectOrigin: effect.origin
        });
        continue;
      }

      game.system.log.o('[DURATION MANAGER] Deleting effect:', {
        name: effect.name,
        systemDuration: effect.system?.durations,
        coreDuration: effect.duration,
        origin: effect.origin,
        effectUuid: effect.uuid,
        abilityUuid: event.item?.uuid,
        effectOriginUuid: effectOrigin?.uuid
      });
      await effect.delete();
    }
  }
} 