/**
 * Extend the base Item document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Item}
 */
export default class FF15Item extends Item {
  /**
   * Whether the item has a limitation on its usage
   * @return {boolean} True if the item has a limitation
   */
  get hasLimitation() {
    return this.system.hasLimitation;
  }

  /**
   * Whether the item has requirements that must be met
   * @return {boolean} True if the item has requirements
   */
  get hasRequires() {
    return this.system.requires?.value === true;
  }

  /**
   * Get the number of uses remaining for this item
   * @return {number} Number of uses remaining
   */
  get usesRemaining() {
    if (!this.system.hasLimitation) return 0;
    return parseInt(this.system.limitation || 0) - this.currentUses;
  }
  
  /**
   * Get the maximum number of uses for this item
   * @return {number} Maximum number of uses
   */
  get maxUses() {
    return parseInt(this.system.limitation || 0);
  }

  /**
   * Get the current number of times this item has been used
   * @return {number} Current number of uses
   */
  get currentUses() {
    // Only return a number if uses is explicitly set to a number
    if (this.system.uses === undefined || this.system.uses === null || this.system.uses === '') return 0;
    const parsed = parseInt(this.system.uses);
    if (isNaN(parsed)) return 0;
    return parsed;
  }

  /**
   * Whether the item has any active effects
   * @return {boolean} True if the item has effects
   */
  get hasEffects() {
    return this.effects?.size > 0;
  }
}
