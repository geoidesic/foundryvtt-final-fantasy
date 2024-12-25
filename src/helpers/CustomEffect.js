export default class CustomEffect {
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Parse a data path into its components
   * @param {string} path - The data path (e.g. "@array.push:system.actionState.available")
   * @returns {Object} The parsed components { method, target }
   */
  static parsePath(path) {
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
   * Handle a custom effect change
   * @param {Object} change - The effect change data
   */
  async handleChange(change) {
    game.system.log.d('EFFECTS | handleChange', { change });
    
    const { method, target } = CustomEffect.parsePath(change.key);
    
    switch (method) {
      case 'array.push':
        await this.arrayPush(target, change.value);
        break;
      default:
        game.system.log.w('EFFECTS | Unknown custom effect method', { method });
    }
  }
} 