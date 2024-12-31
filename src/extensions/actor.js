/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class FF15Actor extends Actor {

  constructor(data = {}, context) {
    super(data, context);
  }

  get activeToken() {
    for(const token of canvas.tokens.placeables) {
      if(token.actor === this) {
        return token;
      }
    }
    return null;
  }

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
      token.actor && // Must have an actor
      !token.actor.hostile && // Must not be hostile
      combatantActorIds.has(token.actor.id) // Must be a combatant in the current combat
    );
  }

  hasSpecificDuplicate (arr, str) {
    return arr.filter(item => item === str).length > 1;
  } 

  removeFirstDuplicate (arr, name) {
    const index = arr.indexOf(name); // Find the first occurrence
    if (index !== -1 && arr.slice(index + 1).includes(name)) {
      arr.splice(index, 1); // Remove only the first duplicate
    }
    return arr;
  };

  /**
   * Only applies via the token HUD
   * @param {*} statusId 
   * @param {*} options 
   * @returns {Promise<ActiveEffect|boolean|undefined>}  A promise which resolves to one of the following values:
   *                                 - ActiveEffect if a new effect need to be created
   *                                 - true if was already an existing effect
   *                                 - false if an existing effect needed to be removed
   *                                 - undefined if no changes need to be made
   */ 
  async toggleStatusEffect(statusId, options) {
    
    if(game.combat && statusId === 'focus' ) {
      //- if actor has focus, and there are no secondary action slots left, prevent the effect from being removed
      if(this.statuses.has('focus') && !this.system.actionState.available.includes('secondary')) {
        ui.notifications.warn('You cannot change Focus while you have no secondary action slots left.');
        return false;
      }
      if(!this.statuses.has('focus') && this.system.hasMoved) {
        ui.notifications.warn('You cannot change Focus while you have moved this turn.');
        return false;
      }
      //- if actor has focus, and has not moved, add the secondary action slot
      if(!this.statuses.has('focus') && !this.system.hasMoved && !this.hasSpecificDuplicate(this.system.actionState.available, 'secondary')) {
        await this.update({ system: { actionState: { available: [...this.system.actionState.available, 'secondary'] } } });
      }
      if(this.statuses.has('focus') && !this.system.hasMoved && this.hasSpecificDuplicate(this.system.actionState.available, 'secondary')) {
        await this.update({ system: { actionState: { available: this.removeFirstDuplicate(this.system.actionState.available, 'secondary') } } });
      }
    }

    return super.toggleStatusEffect(statusId, options);
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

  

  async deleteAllItems(type) {
    game.system.log.d(type)
    game.system.log.d(typeof type)
    for (let item of this.items) {
      if(Array.isArray(type) && type.includes(item.type) || !type || type === 'all' || item.type === type) {
        await item.delete();
      }
    }
  }

  async _preCreate() {
    game.system.log.d('preCreate', this);
    if(this.type === 'PC') {
      const prototypeToken = { disposition: 1, actorLink: true }; // Set disposition to "Friendly"
      this.updateSource({ prototypeToken });
    }
  }

  async _onDrop(event) {
    console.log('_onDrop in the actor.js', event);
  }

  
}