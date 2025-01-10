import { SYSTEM_ID } from "~/src/helpers/constants";

/**
 * Handles enabling additional combat turn slots
 */
export default class EnableCombatTurnSlot {
  /**
   * @param {Actor} actor - The actor this effect is applied to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Process the enable combat turn slot effect
   * @param {object} event - The event containing effect data
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async process(event) {
    const { change } = event;
    const target = 'system.actionState.available';
    const current = foundry.utils.getProperty(this.actor, target) || [];
    
    // Ensure we're working with an array
    if (!Array.isArray(current)) {
      game.system.log.w('EFFECTS | EnableCombatTurnSlot target is not an array', { target, current });
      return;
    }

    // Create a new array with the value pushed
    const updated = [...current];
    if (!updated.includes(change.value)) {
      updated.push(change.value);
    }

    // Update the actor with the new array
    await this.actor.update({
      [target]: updated
    });
  }
} 