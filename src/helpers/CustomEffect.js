/**
 * @deprecated: use custom Hooks instead. 
 * Define them in config/effectsProcessors.js
 * Then add a matching effect helper in src/helpers/effects/
 */
export default class CustomEffect {
  /**
   * Creates a new CustomEffect instance
   * @param {object} actor - The actor this effect belongs to
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Parse a data path into its components
   * @param {string} path - The data path (e.g. "@array.push:system.actionState.available")
   * @return {Object} Returns an object containing the parsed method and target path
   */
  static _parsePath(path) {
    const [method, target] = path.split(':');
    return {
      method: method.replace('@', ''),
      target
    };
  }

  /**
   * Handle array push operations
   * @param {string} target - The target data path
   * @param {*} value - The value to push
   * @return {Promise<void>} Returns a promise that resolves when the array is updated
   */
  async arrayPush(target, value) {
    game.system.log.d('EFFECTS | arrayPush', { target, value });
    
    // Get the current value at the target path
    const current = foundry.utils.getProperty(this.actor, target) || [];
    
    // Ensure we're working with an array
    if (!Array.isArray(current)) {
      game.system.log.w('EFFECTS | arrayPush target is not an array', { target, current });
      return;
    }

    // Create a new array with the value pushed
    const updated = [...current];
    if (!updated.includes(value)) {
      updated.push(value);
    }

    // Update the actor with the new array
    await this.actor.update({
      [target]: updated
    });
  }

  /**
   * Enable a slot in the action state
   * @param {object} change - The change data containing the slot value
   * @return {Promise<void>} Returns a promise that resolves when the slot is enabled
   */
  async enableSlot(change) {
    this.arrayPush('system.actionState.available', change.value);
    game.system.log.d('EFFECTS | enables', { change });
  }

  /**
   * Handle a custom effect change
   * @param {Object} change - The effect change data
   * @return {Promise<void>} Returns a promise that resolves when the effect change is handled
   */
  async handleChange(change) {
    game.system.log.d('EFFECTS | handleChange', { change });
    
    const { method, target } = CustomEffect._parsePath(change.key);
    
    switch (method) {
      case 'array.push':
        await this.arrayPush(target, change.value);
        break;
      case 'enableSlot':
        await this.enableSlot(change);
        break;
      default:
        game.system.log.w('EFFECTS | Unknown custom effect method', { method });
    }
  }
} 