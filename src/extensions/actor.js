import FFActiveEffect from "./active-effect";
import { activeEffectModes, SYSTEM_ID, ACTIVE_EFFECT_MODES } from "~/src/helpers/constants"

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class FF15Actor extends Actor {

  /**
   * Creates a new FF15 actor
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
   * Gets effects that enable combat turn slots
   * @return {Array<ActiveEffect>} effects on the actor that have a change with key = EnableCombatTurnSlot mode = custom
   */
  get enablerEffects() {
    return this.effects.filter(effect =>
      effect.changes.some(change =>
        change.key === 'EnableCombatTurnSlot' && change.mode === ACTIVE_EFFECT_MODES.CUSTOM
      )
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
   * Checks if item tags match enabler effect tags
   * @param {Item} item - The item to check
   * @return {boolean} Whether tags match
   */
  itemTagsMatchEnablerEffectTags(item) {
    const itemTags = item.system.tags;
    for (const effect of this.effects) {
      if (effect.system.tags?.some(tag => itemTags.includes(tag))) {
        return true;
      }
    }
    return false;
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
   * Add effects from an item to this actor
   * @param {Item} item - The item to add effects from
   * @return {Array} Array of effect UUIDs that were enabled
   */
  async addLinkedEffects(item) {
    if (!item.hasEffects) {
      game.system.log.p("[ADD LINKED EFFECTS] Item has no effects:", item);
      return [];
    }

    const effectsToCreate = [];
    for (const effect of item.effects) {
      // Log the full effect data for debugging
      game.system.log.p("[ADD LINKED EFFECTS] Processing effect:", {
        name: effect.name,
        system: effect.system,
        flags: effect.flags,
        origin: effect.origin
      });

      // Add detailed flag logging
      game.system.log.p("[ADD LINKED EFFECTS] Effect flags detail:", {
        rawFlags: effect.flags,
        systemFlags: effect.flags?.[SYSTEM_ID],
        stackableFlag: effect.getFlag(SYSTEM_ID, 'stackable'),
        overlayFlag: effect.getFlag(SYSTEM_ID, 'overlay')
      });

      const sourceActors = this.getEffectSources(effect);
      const stackingBehavior = effect.getFlag(SYSTEM_ID, 'stackable') || 'differentSource';
      
      // Handle different stacking behaviors
      switch (stackingBehavior) {
        case 'replaces':
          // Delete all existing instances of this effect before adding the new one
          const existingEffects = this.effects.filter(e => e.name === effect.name);
          game.system.log.p("[ADD LINKED EFFECTS] Found existing effects to replace:", existingEffects.length);
          for (const existingEffect of existingEffects) {
            game.system.log.p("[ADD LINKED EFFECTS] Removing existing effect for replacement:", existingEffect.name);
            await existingEffect.delete();
          }
          break;
        case 'anySource':
          // Always allow stacking
          break;
        case 'differentSource':
        default:
          // Only allow one instance per source
          if (sourceActors.has(this.uuid)) {
            game.system.log.p("[ADD LINKED EFFECTS] Effect already exists from this source:", {
              name: effect.name,
              source: this.uuid,
              existingSources: Array.from(sourceActors)
            });
            continue;
          }
      }

      // If we get here, either:
      // 1. No matching effects exist
      // 2. Matching effects exist but stacking is allowed (anySource)
      // 3. Matching effects exist but were deleted (replaces)
      // 4. Matching effects exist but from different sources (differentSource)
      const effectData = {
        ...effect.toObject(),
        disabled: false,
        flags: {
          ...effect.flags,
          [SYSTEM_ID]: {
            overlay: effect.getFlag(SYSTEM_ID, 'overlay'),
            stackable: effect.getFlag(SYSTEM_ID, 'stackable'),
            origin: {
              actor: {
                uuid: this.uuid,
                name: this.name,
                img: this.img
              },
              effect: {
                uuid: effect.uuid
              }
            },
            transferredBy: {
              actor: {
                uuid: this.uuid,
                name: this.name,
                img: this.img
              }
            }
          }
        }
      };

      game.system.log.p("[ADD LINKED EFFECTS] Prepared effect data for creation:", effectData);
      effectsToCreate.push(effectData);
    }

    if (!effectsToCreate.length) {
      game.system.log.p("[ADD LINKED EFFECTS] No effects to add");
      return [];
    }

    // Set combat duration for each effect
    for (const effectData of effectsToCreate) {
      await FFActiveEffect.setCombatDuration(effectData);
    }

    game.system.log.p("[ADD LINKED EFFECTS] Creating effects on actor:", this.name, effectsToCreate);
    const created = await this.createEmbeddedDocuments("ActiveEffect", effectsToCreate);
    
    // Process hooks for newly created effects
    for (const effect of created) {
      if (!effect.isSuppressed) {
        await this._processEffectHooks(effect);
      }
    }

    game.system.log.p("[ADD LINKED EFFECTS] Created effects:", created.map(e => ({
      name: e.name,
      system: e.system,
      flags: e.flags,
      uuid: e.uuid
    })));
    return created.map(e => e.uuid);
  }

  /**
   * Process effect hooks for an effect
   * @param {ActiveEffect} effect - The effect to process hooks for
   * @return {Promise<void>} Returns a promise that resolves when hooks are processed
   */
  async _processEffectHooks(effect) {
    for (const change of effect.changes) {
      const matchingMode = activeEffectModes.find(e => e.value === change.mode);
      if (matchingMode) {
        game.system.log.g("[PROCESS EFFECT HOOKS] Processing effect:", change.key);
        await Hooks.callAll(`FF15.${change.key}`, { actor: this, change, effect });
      } 
    }
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
      //- if actor has focus, and has not moved, add the secondary action slot
      if (!this.statuses.has('focus') && !this.system.hasMoved && !this.hasSpecificDuplicate(this.system.actionState.available, 'secondary')) {

        for (const trait of movementSacrificingTraits) {
          //- find the related enabler slot for this and enable it
          const enablerEffects = trait.effects.filter(e => 
            e.changes.some(c => c.key === 'EnableCombatTurnSlot' && c.mode === ACTIVE_EFFECT_MODES.CUSTOM)
          );

          // Add each enabler slot to available if not already included
          for (const effect of enablerEffects) {
            for (const change of effect.changes) {
              if (change.key === 'EnableCombatTurnSlot' && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
                const value = change.value;
                if (!this.system.actionState.available.includes(value)) {
                  const updated = [...this.system.actionState.available, value];
                  await this.update({
                    'system.actionState.available': updated
                  });
                }
              }
            }
          }
        }

        await this.update({ system: { actionState: { available: [...this.system.actionState.available, 'secondary'] } } });
      }
      if (this.statuses.has('focus') && !this.system.hasMoved && this.hasSpecificDuplicate(this.system.actionState.available, 'secondary')) {

        for (const trait of movementSacrificingTraits) {
          //- find the related enabler slot for this and disable it
          const enablerEffects = trait.effects.filter(e => 
            e.changes.some(c => c.key === 'EnableCombatTurnSlot' && c.mode === ACTIVE_EFFECT_MODES.CUSTOM)
          );

          // Remove each enabler slot from available
          for (const effect of enablerEffects) {
            for (const change of effect.changes) {
              if (change.key === 'EnableCombatTurnSlot' && change.mode === ACTIVE_EFFECT_MODES.CUSTOM) {
                const value = change.value;
                if (this.system.actionState.available.includes(value)) {
                  const updated = this.system.actionState.available.filter(slot => slot !== value);
                  await this.update({
                    'system.actionState.available': updated
                  });
                }
              }
            }
          }
        }

        await this.update({ system: { actionState: { available: this.removeFirstDuplicate(this.system.actionState.available, 'secondary') } } });
      }
    }

    if(['ko', 'dead', 'comatose', 'brink', 'surprised', 'bind', 'stun'].includes(statusId)) {
      options = {...options, overlay: true};
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