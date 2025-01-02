import { activeEffectModes, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

export default class EnableCombatTurnSlot {

  constructor(actor) {
    this.actor = actor;
  }

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