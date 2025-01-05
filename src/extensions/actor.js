import FF15Item from "./item";
import FFActiveEffect from "./active-effect";
import { activeEffectModes } from "~/src/helpers/constants"

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
      token.document.disposition === 1 && // Must be friendly
      combatantActorIds.has(token.actor.id) // Must be a combatant in the current combat
    );
  }

  hasSpecificDuplicate (arr, str) {
    return arr.filter(item => item === str).length > 1;
  } 

  /**
   * Check if an enabler item (e.g. a Trait) has any effects that are disabled (meaning the trait hasn't been used yet)
   * @param {FF15Item} item 
   * @returns {boolean}
   */
  hasDisabledEnablerEffects(item) {
    return Array.from(item.effects).some(effect => {
      const matchingEffect = this.effects.find(ae => ae.name === effect.name);
      return matchingEffect?.disabled;
    });
  }

  async actorItemHasRemainingUses(item) {
    if(!item.system.hasLimitation) { return true }
    // If the trait hasn't been used (has disabled effects) but shows uses, reset it
    if (this.hasDisabledEnablerEffects(item) && item.currentUses) {
      await item.update({ 'system.uses': 0 });
    }
    return item.usesRemaining > 0;
  }


  itemTagsMatchEnablerEffectTags(item) {
    const itemTags = item.system.tags;
    for(const effect of this.effects) {
      if(effect.system.tags?.some(tag => itemTags.includes(tag))) { 
        return true;
      }
    }
    return false;
  }

  /**
   * Find a matching effect based on provided criteria
   * @param {ActiveEffect} effect - The effect to match against
   * @param {Object} criteria - Object with keys matching effect properties and values to match against
   * @returns {ActiveEffect|undefined} The matching effect or undefined if none found
   */
  matchingEffect(effect, criteria = { }) {
    return this.effects.find(ae => {
      // Always match on name
      if (ae.name !== effect.name) return false;

      // Check each criteria
      for (const [key, value] of Object.entries(criteria)) {
        // If the value is a function, use it as a predicate
        if (typeof value === 'function') {
          if (!value(ae[key])) return false;
        }
        // Otherwise do a direct comparison
        else if (ae[key] !== value) return false;
      }
      return true;
    });
  }

  /**
   * Add a trait effect to the actor
   * @param {FF15Item} item 
   * @returns {Promise<Array<string>>} A promise which resolves to an array of effect UUIDs that were enabled
   */
  async addTraitEffects(item) {
    game.system.log.o("[ENABLE] addTraitEffect", item);
    
    if (!item.hasEffects) return [];

    // Convert effects to plain objects and set combat duration
    const effectsData = Array.from(item.effects).map(effect => effect.toObject());
    game.system.log.o("[ENABLE] addTraitEffect effectsData", effectsData);
    for (const effectData of effectsData) {
      await FFActiveEffect.setCombatDuration(effectData);
    }

    // Create the effects
    const created = await this.createEmbeddedDocuments("ActiveEffect", effectsData);
    game.system.log.o("[ENABLE] addTraitEffect created", created);
    return created.map(e => e.uuid);
  }

  /**
   * Enable effects for a trait
   * @param {FF15Item} item 
   * @returns {Promise<Array<string>>} A promise which resolves to an array of effect UUIDs that were enabled
   */
  async enableTraitEffects(item) {
    let effectsEnabled = [];
    for (const effect of item.effects) {
      const matchingEffect = this.matchingEffect(effect, { disabled: true });
      if (matchingEffect) {
        const updatedEffectData = matchingEffect.toObject();
        await matchingEffect.update({ disabled: false });
        effectsEnabled.push(matchingEffect.uuid);
        if (effect.isSuppressed) continue;
        for (const change of effect.changes) {
          if (activeEffectModes.find(e => e.value === change.mode)) {
            await Hooks.callAll(`FF15.${change.key}`, { actor: this, change, effect });
          }
        }
      } else {
        await this.addTraitEffects(item);
        for (const effect of item.effects) {
          if (effect.isSuppressed) continue;
          for (const change of effect.changes) {
            await Hooks.callAll(`FF15.${change.key}`, { actor: this, change, effect });
          }
        }
      }
    }
    return effectsEnabled;
  }

  async disableEnablerEffects(item) {};

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