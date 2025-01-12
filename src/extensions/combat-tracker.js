import { SYSTEM_ID, getTypeOptions } from "~/src/helpers/constants"
import { TJSDocument }   from '@typhonjs-fvtt/runtime/svelte/store/fvtt/document';

/**
 * Extended Combat Tracker class for Final Fantasy system
 * @extends {CombatTracker}
 */
export default class FFCombatTracker extends CombatTracker {

  #combat;
  #combatants;

  /**
   * Initialize the combat tracker
   * @param {object} options - Configuration options
   */
  constructor(options)
  {
     super(options);

     this.#combat = new TJSDocument();

     // For the time being until the next TRL release don't add just a sort
     // function as there is an edge case I'm fixing.
     this.#combatants = this.#combat.embedded.create(Combatant, 'combatants');

     // This will create a permanent listener to TJSDocument so the combatants
     // embedded collection will always receive updates on change. This is safe
     // in this context, but be wary of doing this adhoc.
     this.#combat.subscribe(() => void 0);

     this.#combatants.subscribe((values) =>{});
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "combat",
      template: `systems/${SYSTEM_ID}/src/extensions/templates/combat-tracker.html`,
      title: "COMBAT.SidebarTitle",
      scrollY: [".directory-list"]
    });
  }

  /**
   * Get additional data for the combat tracker
   * @return {Promise<object>} The prepared data
   */
  async getData() {
    const data = await super.getData();
    for (const turn of data.turns) {
      const currentCombatant = game.combat.combatants.get(turn.id);
      const actor = currentCombatant.actor;
      turn.actorId = actor.id;
      if(turn.active) {
        turn.hasActions = true;
        turn.actions = '';
        if (actor.system.actionState?.available) {
          for (const action of actor.system.actionState.available.sort()) {
            //- if action is custom, i.e. not in getTypeOptions, then use the class name: custom-action
            if (!getTypeOptions().some(e => e.value === action)) {  
              turn.actions += `<div data-tooltip="${game.i18n.localize(`FF15.Types.Item.Types.Options.Type.${action}`)}" class="action-slot-badge custom-action">${action[0]?.capitalize()}</div>`
            } else {
              turn.actions += `<div data-tooltip="${game.i18n.localize(`FF15.Types.Item.Types.Options.Type.${action}`)}" class="action-slot-badge ${action}">${action[0]?.capitalize()}</div>`
            }
          }
        }
        if (actor.system.actionState?.used) {
          // game.system.log.d("FFCombatTracker getData actor.system.actionState.used", actor.system.actionState.used)
          for (const action of actor.system.actionState.used.sort()) {
            turn.actions += `<div class="action-slot-badge used">${action.type[0].capitalize()}</div>`
          }
        }
      }
    }
    return data;
  }

  /**
   * Handle mouse down events on combatants
   * @param {Event} event - The triggering mouse event
   * @return {Promise<void>} Returns a promise that resolves when the mouse down event is handled
   */
  async _onCombatantMouseDown(event) {
    event.preventDefault();
    // event.stopPropagation(); //- this breaks the context menu, so removing it and the input click still works as expected

    const li = event.currentTarget;
    const combatant = this.viewed.combatants.get(li.dataset.combatantId);
    const token = combatant.token;
    if (!combatant.actor?.testUserPermission(game.user, "OBSERVER")) return;
    const now = Date.now();

    // Handle double-left click to open sheet
    const dt = now - this._clickTime;
    this._clickTime = now;
    if (dt <= 250) {
      //- #19 - prevent double click from opening sheet when clicking on the initiative field
      if (event.target.type === undefined) {
        return combatant.actor?.sheet.render(true);
      }
    }

    // Control and pan to Token object
    if (token?.object) {
      token.object?.control({ releaseOthers: true });
      return canvas.animatePan(token.object.center);
    }
  }

  /**
   * Get the class hierarchy names
   * @return {Array<string>} Array of class names in the inheritance chain
   */
  getClassNames() {
    const classNames = [];
    let currentClass = this.constructor;

    while (currentClass) {
      classNames.push(currentClass.name);
      currentClass = Object.getPrototypeOf(currentClass);
    }

    return classNames;
  }

}