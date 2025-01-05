import { localize } from "~/src/helpers/util";
import { SYSTEM_ID } from "~/src/helpers/constants";

export default class RollGuards {

  actor;

  //- shuttle is used to pass data from the guards to the roll calculator
  shuttle = {
    hasModifiers: {
      extraModifiers: null
    }
  }

  constructor(actor) {
    this.actor = actor;
  }

  /******************
   * Private Methods
   ******************/
  /**
   * Dialog to allow extra modifiers to be added to the roll
   * @param {*} item 
   * @returns 
   */
  async _showModifierDialog(item) {
    return await Dialog.prompt({
      title: "Extra Modifiers",
      content: `
        <form>
          <div class="form-group">
            <label>Additional Modifier:</label>
            <input type="number" name="modifier" value="0">
          </div>
        </form>
      `,
      label: "Roll",
      callback: (html) => {
        const form = html[0].querySelector("form");
        return {
          modifier: parseInt(form.modifier.value) || 0,
          confirmed: true
        };
      },
      rejectClose: true // This ensures we get a proper reject when dialog is closed
    });
  }

  /******************
   * Public Methods
   ******************/
  async isAction(item) {
    return item.type === 'action';
  }

  async isCombat() {
    return game.combat;
  }

  async hasTargets(item) {
    // Check if we have targeted entities
    const targets = game.user.targets;
    const hasTargets = targets.size > 0;

    // if no targets, then don't roll
    if (!hasTargets) {
      ui.notifications.warn(`${item.name} has no targets. Please select targets and roll again.`);
      return false
    }
    return true;
  }

  async targetsMatchActionIntent(item) {

    const target = item.system.target;
    const targets = game.user.targets;
    const size = targets.size;

    // Store original targets to restore later if needed
    const originalTargets = new Set(game.user.targets);
    let token;
    try {
      // Handle self-targeting
      if (target === 'self') {
        token = this.actor.activeToken;
        if (!token) {
          ui.notifications.warn("No token found for self-targeting");
          return false;
        }
        // Try to target
        await token.setTarget(true, { user: game.user, releaseOthers: true });
        return true;
      }
      
      // Handle other targeting types
      switch (target) {
        case 'single':
          if (size !== 1) {
            ui.notifications.warn("This ability requires exactly one target");
            return false;
          }
          token = this.actor.activeToken;
          if(targets.has(token)) {
            ui.notifications.warn("This ability cannot target yourself");
            return false;
          }
          break;
        case 'enemy':
          if (size < 1) {
            ui.notifications.warn("This ability requires at least one enemy target");
            return false;
          }
          token = this.actor.activeToken;
          if(targets.has(token)) {
            ui.notifications.warn("This ability cannot target yourself");
            return false;
          }
          // Additional enemy validation could go here
          break;
        case 'ally':
          if (size < 1) {
            ui.notifications.warn("This ability requires at least one ally target");
            return false;
          }
          // Additional ally validation could go here
          break;
        case 'all':
          if (size < 1) {
            ui.notifications.warn("This ability requires at least one target");
            return false;
          }
          break;
      }

      return true;
    } catch (error) {
      game.system.log.e('Error in targetsMatchActionIntent:', error);
      return false;
    } finally {
      // Only restore original targets if we're NOT doing self-targeting
      if (target !== 'self' && originalTargets.size > 0) {
        game.user.targets.forEach(t => t.setTarget(false, { user: game.user, releaseOthers: false }));
        originalTargets.forEach(t => t.setTarget(true, { user: game.user, releaseOthers: false }));
      }
    }
  }


  /**
   * Tracks action usage for limited actions.
   * Check for limitations only if in combat 
   * and if the item has limitations but fewer uses, then add uses
   */
  async hasRemainingUses(item) {
    // Check for limitations only if in combat
    if (item.system.hasLimitation && game.combat) {
      const maxUses = item.system.limitation;

      // Check remaining uses
      const remainingUses = maxUses - (item.system.uses || 0);
      if (remainingUses <= 0) {
        ui.notifications.warn(`${item.name} has no remaining uses.`);
        return false;
      }

      // Confirm use
      const confirmed = await Dialog.confirm({
        title: "Confirm Ability Use",
        content: `<p>Use ${item.name}? (${remainingUses} use${remainingUses > 1 ? 's' : ''} remaining)</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: true
      });

      if (!confirmed) return false;

      // Update uses while preserving other system data
      const systemData = foundry.utils.deepClone(item.system);
      systemData.uses = (systemData.uses || 0) + 1;
      await item.update({ system: systemData });
    }
    return true;
  }

  async hasModifiers(item) {
    if (!item.system.hasCR) {
      return true;
    }

    // Show dialog for extra modifiers
    this.shuttle.hasModifiers.extraModifiers = await this._showModifierDialog(item);

    // If dialog was cancelled or closed, unmark effects for deletion
    if (!this.shuttle.hasModifiers.extraModifiers?.confirmed) {
      // Remove pending deletion flags from all effects
      for (const effect of this.actor.effects) {
        if (effect.getFlag(SYSTEM_ID, 'pendingDeletion')) {
          await effect.unsetFlag(SYSTEM_ID, 'pendingDeletion');
        }
      }
      return false;
    }

    // If confirmed, delete all effects marked for deletion
    for (const effect of this.actor.effects) {
      if (effect.getFlag(SYSTEM_ID, 'pendingDeletion')) {
        await effect.delete();
      }
    }

    Hooks.call('FF15.processTargetRollAdditionalModifiers', { item, extraModifiers: this.shuttle.hasModifiers.extraModifiers, actor: this.actor });
    return true;
  }

  async hasEnablers(item) {
    if (!game.combat || !item.system.enables?.value) { return false }
    const enablesList = item.system.enables.list;
    if (!enablesList?.length) { return false }
    return true;
  }

  async hasActiveEnablerSlot(item) {

    const { actionState } = this.actor.system;
    const actionType = item.system.type || 'primary'; // default to primary if not set

    // Get enabler slots (non-primary/secondary slots)
    const enablerSlots = actionState.available.filter(slot =>
      slot !== 'primary' && slot !== 'secondary'
    );

    // First check if any of the item's tags match enabler slots
    if (item.system.tags?.some(tag => enablerSlots.includes(tag))) {
      return true;
    }

    // Then check if we have a matching action slot (primary/secondary)
    if (actionState.available.includes(actionType)) {
      return true;
    }

    // Finally check enabled effects if we have enablers
    if (await this.hasEnablers(item)) {
      const enabledEffects = this.actor.effects.filter(
        effect => effect.system.tags?.includes('enabler')
      );

      if (enabledEffects?.length) {
        const enabledEffectsLinkedToEnablerSlots = enabledEffects.filter(
          effect => enablerSlots.some(slot => {
            const originItem = fromUuidSync(effect.origin);
            return originItem?.system.tags?.includes(slot);
          })
        );

        if (enabledEffectsLinkedToEnablerSlots.length) {
          return true;
        }
      }
    }

    // If we get here, no valid slot was found
    const msg = localize("Types.Item.Types.action.SlotNotAvailable").replace("%s", actionType);
    ui.notifications.warn(msg);
    return false;
  }

  async matchesEnablerEffect(item) {
    return this.actor.itemTagsMatchEnablerEffectTags(item);
  }

  async hasRequiredEffects(item) {
    if (!item.system.requires?.value) { return true }

    // Check each required effect
    for (const requireRef of item.system.requires.list) {
      const requiredItem = await fromUuid(requireRef.uuid);
      game.system.log.o('[ENABLE] [HAS ACTIVE EFFECT] requiredItem:', requiredItem);
      if (!requiredItem) continue;
      game.system.log.o('[ENABLE] [HAS ACTIVE EFFECT] requiredItem.effects:', requiredItem.effects);
      

      // Check if any of the required item's effects are active (not disabled)
      let hasActiveEffect = false;
      for (const effect of this.actor.effects) {
        if (effect.name === requiredItem.name) {
          hasActiveEffect = true;
          // Flag the effect for deletion instead of deleting it immediately
          await effect.setFlag(SYSTEM_ID, 'pendingDeletion', true);
          break;
        }
      }

      if (!hasActiveEffect) {
        ui.notifications.warn(game.i18n.format("FF15.Warnings.RequiredEffectNotActive", { name: requiredItem.name }));
        return false;
      }
    }
    return true;
  }

}