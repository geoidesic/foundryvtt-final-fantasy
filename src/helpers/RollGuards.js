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
    if(!item.system.hasTarget) { return true }
    const targets = game.user.targets;
    const target = item.system.target;

    game.system.log.g('targetsMatchActionIntent',  target );
    game.system.log.g('targetsMatchActionIntent targets.size', targets.size);

    switch (target) {
      case "single":
        const allow =  targets.size === 1;
        if (!allow) {
          const msg = localize("Types.Item.Types.action.SingleTarget").replace("%s", item.name);
          ui.notifications.warn(msg);
        }
        return allow;
      case "enemy":
        return targets.some(t => t.isEnemy);
      case "ally":
        return targets.some(t => t.isAlly);
      case "all":
        return targets.size > 0;
      default:
        return false;
    }
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
        effect => effect.statuses.has('enabled')
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

}