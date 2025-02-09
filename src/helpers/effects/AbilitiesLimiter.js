import { ACTIVE_EFFECT_MODES } from "~/src/helpers/constants";

/**
 * Handles primary base damage buff effects
 */
export default class AbilitiesLimiter {
  /**
   * @param {Actor} actor - The actor this effect is applied to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Process the primary base damage buff effect
   * @param {object} event - The event containing damage results
   * @return {Promise<void>} A promise that resolves when processing is complete
   */
  async process(event) {

  }
}