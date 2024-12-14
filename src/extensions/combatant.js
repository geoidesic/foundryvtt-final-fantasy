/**
 * Extend the base Combatant class to implement additional system-specific logic.
 * Controls the display of Combatants in the Combat Tracker.
 */
export default class SurgeCombatants extends Combatant {
  constructor(object, options = {}) {
    game.system.log.d('SurgeCombatants constructor');

    super(object, options);
  }
}