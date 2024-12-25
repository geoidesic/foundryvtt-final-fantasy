import { localize } from "~/src/helpers/util";

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

  async hasTargets(item) {
    // Check if we have targeted entities
    const targets = game.user.targets;
    game.system.log.d("race targets", targets);
    const hasTargets = targets.size > 0;

    // if no targets, then don't roll
    if (!hasTargets) {
      ui.notifications.warn(`${item.name} has no targets. Please select targets and roll again.`);
      return false
    }
    return true;
  }

  async hasModifiers(item) {
    // Show dialog for extra modifiers
    this.shuttle.hasModifiers.extraModifiers = await this._showModifierDialog(item);

    // If dialog was cancelled or closed, return early
    if (!this.shuttle.hasModifiers.extraModifiers?.confirmed) {
      return false;
    }
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
    game.system.log.d("[SLOT_CHECK] Action type:", actionType);
    game.system.log.d("[SLOT_CHECK] Available slots:", actionState.available);
    game.system.log.d("[SLOT_CHECK] Item tags:", item.system.tags);

    // Get enabler slots (non-primary/secondary slots)
    const enablerSlots = actionState.available.filter(slot => 
      slot !== 'primary' && slot !== 'secondary'
    );
    game.system.log.d("[SLOT_CHECK] Enabler slots:", enablerSlots);

    // First check if any of the item's tags match enabler slots
    if (item.system.tags?.some(tag => enablerSlots.includes(tag))) {
      game.system.log.d("[SLOT_CHECK] Found matching tag slot");
      return true;
    }

    // Then check if we have a matching action slot (primary/secondary)
    if (actionState.available.includes(actionType)) {
      game.system.log.d("[SLOT_CHECK] Found matching action slot");
      return true;
    }

    // Finally check enabled effects if we have enablers
    if (await this.hasEnablers(item)) {
      const enabledEffects = this.actor.effects.filter(
        effect => effect.statuses.has('enabled')
      );
      game.system.log.d("[SLOT_CHECK] Enabled effects:", enabledEffects);

      if (enabledEffects?.length) {
        const enabledEffectsLinkedToEnablerSlots = enabledEffects.filter(
          effect => enablerSlots.some(slot => {
            const originItem = fromUuidSync(effect.origin);
            return originItem?.system.tags?.includes(slot);
          })
        );
        game.system.log.d("[SLOT_CHECK] Matching enabled effects:", enabledEffectsLinkedToEnablerSlots);

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

}