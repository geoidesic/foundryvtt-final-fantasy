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

    // Get all effects with special duration types
    const effects = this.actor.effects.filter(e => 
      e.duration?.type && !e.disabled
    );

    for (const effect of effects) {
      const durationType = effect.duration.type;
      const durationUnits = effect.duration.turns ? 'turns' : 'rounds';
      const currentRound = combat.round;
      const currentTurn = combat.turn;
      const startRound = effect.duration.startRound;
      const startTurn = effect.duration.startTurn;

      switch (durationType) {
        case 'endOfThis':
          // If we've moved past the starting round/turn
          if ((durationUnits === 'rounds' && currentRound > startRound) ||
              (durationUnits === 'turns' && (currentRound > startRound || currentTurn > startTurn))) {
            await effect.delete();
          }
          break;

        case 'endOfNext':
          // If we've moved past the next round/turn
          if ((durationUnits === 'rounds' && currentRound > startRound + 1) ||
              (durationUnits === 'turns' && currentRound > startRound && currentTurn > startTurn)) {
            await effect.delete();
          }
          break;

        case 'startOfNext':
          // If we've reached the start of the next round/turn
          if ((durationUnits === 'rounds' && currentRound > startRound) ||
              (durationUnits === 'turns' && (currentRound > startRound || currentTurn > startTurn))) {
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
    // Get all effects that end on damage
    const effects = this.actor.effects.filter(e => 
      e.duration?.requiresDamage && !e.disabled
    );

    for (const effect of effects) {
      await effect.delete();
    }
  }

  /**
   * Process duration updates when an ability is used
   * @param {Item} item - The ability item being used
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async onAbilityUse(item) {
    // Get all effects that end on next ability
    const effects = this.actor.effects.filter(e => 
      e.duration?.requiresAbility && !e.disabled
    );

    for (const effect of effects) {
      await effect.delete();
    }
  }
} 