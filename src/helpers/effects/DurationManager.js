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

    // Get all effects with special duration types
    const effects = this.actor.effects.filter(e => 
      e.duration?.type && !e.disabled
    );

    game.system.log.o('[DURATION MANAGER] Found effects with duration type:', effects.map(e => ({
      name: e.name,
      duration: e.duration,
      disabled: e.disabled,
      origin: e.origin
    })));

    for (const effect of effects) {
      const durationType = effect.duration.type;
      const durationUnits = effect.duration.turns ? 'turns' : 'rounds';
      const currentRound = combat.round;
      const currentTurn = combat.turn;
      const startRound = effect.duration.startRound;
      const startTurn = effect.duration.startTurn;

      game.system.log.o('[DURATION MANAGER] Processing effect:', {
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
          // If we've moved past the starting round/turn
          if ((durationUnits === 'rounds' && currentRound > startRound) ||
              (durationUnits === 'turns' && (currentRound > startRound || currentTurn > startTurn))) {
            game.system.log.o('[DURATION MANAGER] Deleting endOfThis effect:', effect.name);
            await effect.delete();
          }
          break;

        case 'endOfNext':
          // If we've moved past the next round/turn
          if ((durationUnits === 'rounds' && currentRound > startRound + 1) ||
              (durationUnits === 'turns' && currentRound > startRound && currentTurn > startTurn)) {
            game.system.log.o('[DURATION MANAGER] Deleting endOfNext effect:', effect.name);
            await effect.delete();
          }
          break;

        case 'startOfNext':
          // If we've reached the start of the next round/turn
          if ((durationUnits === 'rounds' && currentRound > startRound) ||
              (durationUnits === 'turns' && (currentRound > startRound || currentTurn > startTurn))) {
            game.system.log.o('[DURATION MANAGER] Deleting startOfNext effect:', effect.name);
            await effect.delete();
          }
          break;
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

    // Get all effects that end on damage
    const effects = this.actor.effects.filter(e => 
      e.duration?.requiresDamage && !e.disabled
    );

    game.system.log.o('[DURATION MANAGER] Found effects with requiresDamage:', effects.map(e => ({
      name: e.name,
      duration: e.duration,
      disabled: e.disabled,
      origin: e.origin
    })));

    for (const effect of effects) {
      game.system.log.o('[DURATION MANAGER] Deleting effect:', {
        name: effect.name,
        duration: effect.duration,
        origin: effect.origin
      });
      await effect.delete();
    }
  }

  /**
   * Process duration updates when an ability is used
   * @param {Item} item - The ability item being used
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async onAbilityUse(item) {
    game.system.log.o('[DURATION MANAGER] onAbilityUse called:', {
      itemName: item?.name,
      itemType: item?.type,
      itemSystem: item?.system,
      actorName: this.actor?.name,
      itemUuid: item?.uuid,
      actorEffects: this.actor.effects.map(e => ({
        name: e.name,
        duration: e.duration,
        disabled: e.disabled,
        origin: e.origin,
        requiresAbility: e.duration?.requiresAbility,
        type: e.duration?.type,
        flags: e.flags
      }))
    });

    // Get all effects that end on next ability
    const effects = this.actor.effects.filter(e => {
      const hasNextAbilityDuration = e.system?.duration?.type === 'nextAbility' && !e.disabled;
      game.system.log.o('[DURATION MANAGER] Checking effect for nextAbility duration:', {
        effectName: e.name,
        hasNextAbilityDuration,
        systemDuration: e.system?.duration,
        coreDuration: e.duration,
        disabled: e.disabled,
        flags: e.flags,
        rawEffect: e
      });
      return hasNextAbilityDuration;
    });

    game.system.log.o('[DURATION MANAGER] Found effects with nextAbility duration:', effects.map(e => ({
      name: e.name,
      systemDuration: e.system?.duration,
      coreDuration: e.duration,
      disabled: e.disabled,
      origin: e.origin,
      effectUuid: e.uuid,
      flags: e.flags,
      rawEffect: e
    })));

    for (const effect of effects) {
      // Don't process the effect if the ability being used is the one that created it
      const effectOrigin = await fromUuid(effect.origin);
      game.system.log.o('[DURATION MANAGER] Comparing effect origin with ability:', {
        effectName: effect.name,
        effectOriginUuid: effectOrigin?.uuid,
        effectOriginName: effectOrigin?.name,
        abilityUuid: item?.uuid,
        abilityName: item?.name,
        isSourceAbility: effectOrigin?.uuid === item?.uuid || effectOrigin?.name === item?.name,
        effectOriginItem: effectOrigin,
        systemDuration: effect.system?.duration,
        coreDuration: effect.duration,
        effectOrigin: effect.origin
      });

      // Check both UUID and name since compendium items will have different UUIDs
      if (effectOrigin?.uuid === item.uuid || effectOrigin?.name === item?.name) {
        game.system.log.o('[DURATION MANAGER] Skipping effect deletion because ability is the source:', {
          effectName: effect.name,
          abilityName: item.name,
          systemDuration: effect.system?.duration,
          coreDuration: effect.duration,
          effectOrigin: effect.origin
        });
        continue;
      }

      game.system.log.o('[DURATION MANAGER] Deleting effect:', {
        name: effect.name,
        systemDuration: effect.system?.duration,
        coreDuration: effect.duration,
        origin: effect.origin,
        effectUuid: effect.uuid,
        abilityUuid: item?.uuid,
        effectOriginUuid: effectOrigin?.uuid
      });
      await effect.delete();
    }
  }
} 