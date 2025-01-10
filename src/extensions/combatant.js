/**
 * Extend the base Combatant class to implement additional system-specific logic.
 * Controls the display of Combatants in the Combat Tracker.
 */
export default class FFCombatants extends Combatant {
  /**
   * Initialize the combatant
   * @param {object} object - The combatant data
   * @param {object} [options={}] - Additional options
   */
  constructor(object, options = {}) {
    super(object, options);
  }
}