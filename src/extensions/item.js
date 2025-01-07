/**
 * Extend the base Item document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Item}
 */
export default class FF15Item extends Item {

  get hasLimitation() {
    return this.system.hasLimitation;
  }

  get hasRequires() {
    return this.system.requires?.value === true;
  }

  get usesRemaining() {
    if (!this.system.hasLimitation) return 0;
    return parseInt(this.system.limitation || 0) - this.currentUses;
  }
  
  get maxUses() {
    return parseInt(this.system.limitation || 0);
  }

  get currentUses() {
    // Only return a number if uses is explicitly set to a number
    if (this.system.uses === undefined || this.system.uses === null || this.system.uses === '') return 0;
    const parsed = parseInt(this.system.uses);
    if (isNaN(parsed)) return 0;
    return parsed;
  }

  get hasEffects() {
    return this.effects?.size > 0;
  }

}
