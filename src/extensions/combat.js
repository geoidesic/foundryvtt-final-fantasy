export default class FFCombat extends Combat {
  constructor(data, context) {
    super(data, context);
    game.system.log.d('>>>>>>>>>> SurgeCombat constructor')
  }

  
  /**
   * Return the Array of combatants sorted into initiative order, breaking ties alphabetically by name.
   * @returns {Combatant[]}
   */
  setupTurns() {
    this.turns ||= [];

    // Determine the turn order and the current turn
    const turns = this.combatants.contents.sort(this._sortCombatants);
    if ( this.turn !== null) this.turn = Math.clamp(this.turn, 0, turns.length-1);

    // Update state tracking
    let c = turns[this.turn];
    this.current = this._getCurrentState(c);

    // One-time initialization of the previous state
    if ( !this.previous ) this.previous = this.current;

    // Return the array of prepared turns
    return this.turns = turns;
  }

    /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * This method can be overridden by a system or module which needs to display combatants in an alternative order.
   * The default sorting rules sort in descending order of initiative using combatant IDs for tiebreakers.
   * @param {Combatant} a     Some combatant
   * @param {Combatant} b     Some other combatant
   * @protected
   */
    _sortCombatants(a, b) {
      const aIsNPC = a.actor?.type === "NPC";
      const bIsNPC = b.actor?.type === "NPC";
      
      // Set CSS classes based on the order
      if (aIsNPC && !bIsNPC) {
        a.css = 'npc-group-start'; // First NPC
        b.css = 'pc-group-end'; // Last PC before NPC
        return 1;
      } else if (!aIsNPC && bIsNPC) {
        a.css = 'pc-group-end'; // Last PC before NPC
        b.css = 'npc-group-start'; // First NPC
        return -1;
      }

      if (a.initiative === null && b.initiative === null) return 0;
      if (a.initiative === null) return 1;
      if (b.initiative === null) return -1;
      return b.initiative - a.initiative;
    }
}