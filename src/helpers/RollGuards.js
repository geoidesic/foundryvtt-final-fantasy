
export default class RollGuards {

  actor; 
  
  constructor(actor) {
    this.actor = actor;
  }

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
    const extraModifiers = await this._showModifierDialog(item);

    // If dialog was cancelled or closed, return early
    if (!extraModifiers?.confirmed) {
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

  // async hasActiveEnablerSlot(item) {
  //   //- if not then don't block the roll
  //   if(!(await this.hasEnablers(item))) { return true }
    
  //   //- get slots that don't match the primary and secondary keywords
  //   const enablerSlots = this.actor.system.actionState.available.filter(item => !'primary' && !'secondary');
  //   if (!enablerSlots?.length) { return true }

  //   //- check if any of the remaining slots match any of the actor's enabled job trait effects. 
  //   //- To get the effects from the actor, and check if any of them are linked to the 'enabled` condition / statusEffect
  //   const enabledEffects = this.params.actor.effects.filter(
  //     effect => effect.statuses.has('enabled')
  //   )
  //   if (!enabledEffects?.length) { return true }

  //   //- check if any of the enabled effects are linked to any of the enabler slots
  //   const enabledEffectsLinkedToEnablerSlots = enabledEffects.filter(
  //     effect => enablerSlots.some(slot => {
  //       const originItem = fromUuidSync(effect.origin)
  //       return slot.system.effects.has(effect.id)
  //     })
  //   )
    
  // }

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
}