import { SYSTEM_ID } from "~/src/helpers/constants"

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class FFXIVActor extends Actor {

  /**
   * Creates a new FFXIV actor
   * @param {object} data - The actor data
   * @param {object} context - The initialization context
   */
  constructor(data = {}, context) {
    super(data, context);
  }

  /**
   * Gets the active token for this actor
   * @return {Token|null} The active token or null if none found
   */
  get activeToken() {
    for (const token of canvas.tokens.placeables) {
      if (token.actor === this) {
        return token;
      }
    }
    return null;
  }

  /**
   * Gets all ally tokens for this actor
   * @return {Token[]} Array of ally tokens
   */
  get allyTokens() {
    // Get all tokens on the canvas
    const tokens = canvas.tokens.placeables;
    if (!tokens?.length) return [];

    // Get current combat
    const combat = game.combat;
    if (!combat) return [];

    // Get all combatant actor IDs for quick lookup
    const combatantActorIds = new Set(combat.combatants.contents.map(c => c.actor?.id).filter(Boolean));

    // Find all ally tokens (non-hostile) that are also combatants
    return tokens.filter(token =>
      token.actor // Must have an actor
      && token.document.disposition === 1 // Must be friendly
      && combatantActorIds.has(token.actor.id) // Must be a combatant in the current combat
      && token.actor.id !== this.id // Must not be the source actor
    );
  }


  /**
   * Checks for specific duplicates in an array
   * @param {Array} arr - The array to check
   * @param {string} str - The string to look for duplicates
   * @return {boolean} Whether duplicates were found
   */
  hasSpecificDuplicate(arr, str) {
    return arr.filter(item => item === str).length > 1;
  }

  /**
   * Check if an item has remaining uses
   * @param {Item} item - The item to check for remaining uses
   * @return {boolean} Whether the item has remaining uses
   */
  async actorItemHasRemainingUses(item) {
    game.system.log.p("[USES] Checking remaining uses for:", item);
    game.system.log.p("[USES] Checking remaining uses item name:", item.name);
    game.system.log.p("[USES] hasLimitation:", item.system.hasLimitation);
    game.system.log.p("[USES] currentUses:", item.currentUses);
    game.system.log.p("[USES] usesRemaining:", item.usesRemaining);

    if (!item.system.hasLimitation) { return true }
    return item.usesRemaining > 0;
  }


  /**
   * Get the set of actor UUIDs that have applied an effect with this name
   * @param {ActiveEffect} effect - The effect to check for
   * @return {Set<string>} Set of actor UUIDs that have applied this effect
   */
  getEffectSources(effect) {
    return new Set(
      this.effects
        .filter(e => e.name === effect.name)
        .map(e => e.getFlag(SYSTEM_ID, 'transferredBy.actor.uuid') || this.uuid)
    );
  }

  /**
   * Remove the first duplicate from an array
   * @param {Array} arr - The array to process
   * @param {string} name - The name to check for duplicates
   * @return {Array} The processed array
   */
  removeFirstDuplicate(arr, name) {
    const index = arr.indexOf(name); // Find the first occurrence
    if (index !== -1 && arr.slice(index + 1).includes(name)) {
      arr.splice(index, 1); // Remove only the first duplicate
    }
    return arr;
  };

  /**
   * Only applies via the token HUD
   * @param {string} statusId - The ID of the status effect to toggle
   * @param {object} options - Options for toggling the status effect
   * @return {Promise<ActiveEffect|boolean|undefined>} A promise which resolves to one of the following values:
   *                                 - ActiveEffect if a new effect need to be created
   *                                 - true if was already an existing effect
   *                                 - false if an existing effect needed to be removed
   *                                 - undefined if no changes need to be made
   */
  async toggleStatusEffect(statusId, options) {
    if (game.combat?.started && statusId === 'focus') {
      //- if actor has focus, and there are no secondary action slots left, prevent the effect from being removed
      if (this.statuses.has('focus') && !this.system.actionState.available.includes('secondary')) {
        ui.notifications.warn('You cannot change Focus while you have no secondary action slots left.');
        return false;
      }
      if (!this.statuses.has('focus') && this.system.hasMoved) {
        ui.notifications.warn('You cannot change Focus while you have moved this turn.');
        return false;
      }

      // Find all traits that sacrifice movement
      const movementSacrificingTraits = this.items.filter(item => 
        item.type === 'trait' && 
        item.system.sacrificesMovement
      );

      game.system.log.o('[TOGGLE STATUS] Found movement sacrificing traits:', {
        traits: movementSacrificingTraits.map(t => ({
          name: t.name,
          type: t.type,
          sacrificesMovement: t.system.sacrificesMovement,
          effects: t.effects.map(e => ({
            name: e.name,
            disabled: e.disabled,
            changes: e.changes,
            flags: e.flags
          }))
        }))
      });
      
      this.handlePluginOverrides()
    }

    if(['ko', 'dead', 'comatose', 'brink', 'surprised', 'bind', 'stun'].includes(statusId)) {
      options = {...options, overlay: true};
    }

    return super.toggleStatusEffect(statusId, options);
  }

  /**
   * Handles plugin overrides for status effect toggling
   * @override
   * @param {Array<Trait>} movementSacrificingTraits - The traits that sacrifice movement
   */
  async handlePluginOverrides(movementSacrificingTraits) {
    
  }


  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    super.prepareBaseData();

    // console.log('prepareBaseData');
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
  */
  prepareDerivedData() {
    super.prepareDerivedData();
    // const actorData = this.data;
    // const data = actorData.data;
    // const flags = actorData.flags.boilerplate || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    // this._prepareCharacterData(actorData);
    // this._prepareNpcData(actorData);
    // console.log('prepareDerivedData', this.system.spd.level);

    // disable any passive effects for items that are not equipped. @deprecated? maybe not needed. See extended/active-effects:isSuppressed
    // for (let item of this.items) {
    //   if (item.system.wearable && item.system.location != 'worn') {
    //     for (let effect of item.effects) {
    //       effect.updateSource({ disabled: true })
    //     }
    //   }
    // }
  }

  /**
   * Deletes all items of a specific type from the actor
   * @param {string} type - The type of items to delete
   * @return {Promise<void>} Returns a promise that resolves when items are deleted
   */
  async deleteAllItems(type) {
    game.system.log.d(type)
    game.system.log.d(typeof type)
    for (const item of this.items) {
      if (Array.isArray(type) && type.includes(item.type) || !type || type === 'all' || item.type === type) {
        await item.delete();
      }
    }
  }

  /**
   * Handles pre-creation setup
   * @return {Promise<void>} Returns a promise that resolves when setup is complete
   */
  async _preCreate() {
    game.system.log.d('preCreate', this);
    if (this.type === 'PC') {
      const prototypeToken = { disposition: 1, actorLink: true }; // Set disposition to "Friendly"
      this.updateSource({ prototypeToken });
    }
  }

  /**
   * Handles dropping content onto the actor
   * @param {DragEvent} event - The drop event
   * @return {Promise<void>} Returns a promise that resolves when the drop is handled
   */
  async _onDrop(event) {
    console.log('_onDrop in the actor.js', event);
  }

}