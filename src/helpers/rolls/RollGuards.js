import { localize } from "~/src/helpers/util";
import { SYSTEM_ID } from "~/src/helpers/constants";
import ModifierDialog from '~/src/components/organisms/dialogs/ModifierDialog.svelte';

/**
 * Class to handle various checks and guards for rolling actions
 */
export default class RollGuards {
  /** @type {Actor} The actor associated with these roll guards */
  actor;

  /** 
   * Shuttle object used to pass data from guards to roll calculator
   * @type {Object} 
   */
  shuttle = {
    hasModifiers: {
      extraModifiers: null
    }
  }

  /**
   * Create a new RollGuards instance
   * @param {Actor} actor - The actor to check guards for
   */
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Dialog to allow extra modifiers to be added to the roll
   * @param {Item} item - The item being rolled
   * @return {Promise<Object>} The modifier data from the dialog
   * @private
   */
  async _showModifierDialog(item) {
    return new Promise((resolve, reject) => {
      new Dialog({
        title: "Extra Modifiers",
        content: `<div id="modifier-dialog-container"></div>`,
        buttons: {
          roll: {
            label: "Roll",
            callback: (html) => {
              resolve({
                penalty: window._modifierDialogComponent?._state?.penalty || 0,
                bonusDice: window._modifierDialogComponent?._state?.bonusDice || 0,
                confirmed: true
              });
            }
          },
          cancel: {
            label: "Cancel",
            callback: () => reject(new Error('Dialog cancelled'))
          }
        },
        render: (html) => {
          // Initialize our Svelte component after the dialog HTML is rendered
          const container = html.find('#modifier-dialog-container')[0];
          window._modifierDialogComponent = new ModifierDialog({
            target: container,
            props: {
              mutuallyExclusive: false
            }
          });
        },
        close: () => {
          window._modifierDialogComponent?.$destroy();
          delete window._modifierDialogComponent;
          reject(new Error('Dialog closed'));
        }
      }).render(true);
    });
  }

  /**
   * Check and handle any modifiers for the roll
   * @param {Item} item - The item being used
   * @return {Promise<boolean>} Whether modifiers were successfully handled
   */
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

    Hooks.call('FFXIV.processTargetRollAdditionalModifiers', { item, extraModifiers: this.shuttle.hasModifiers.extraModifiers, actor: this.actor });
    return true;
  }

}