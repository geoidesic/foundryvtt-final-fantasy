import { SYSTEM_ID, getTypeOptions } from "~/src/helpers/constants"
import { TJSDocument }   from '@typhonjs-fvtt/runtime/svelte/store/fvtt/document';

export default class FFCombatTracker extends CombatTracker {

  #combat;
  #combatants;

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

     this.#combatants.subscribe((values) =>
     {
        console.log(`Combatants ------`);
        for (const combatant of values)
        {
           console.log(combatant.name);
        }
     });
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

  async getData() {
    const data = await super.getData();
    for (const turn of data.turns) {
      const combatant = game.combat.combatants.get(turn.id);
      const actor = combatant.actor
      turn.actorId = actor.id
      if(turn.active) {
        turn.hasActions = true
        turn.actions = ''
        if (actor.system.actionState?.available) {
          for (const action of actor.system.actionState.available.sort()) {
            //- if action is custom, i.e. not in getTypeOptions, then use the class name: custom-action
            if (!getTypeOptions().some(e => e.value === action)) {  
              turn.actions += `<badge data-tooltip="${game.i18n.localize(`FF15.Types.Item.Types.Options.Type.${action}`)}" class="custom-action">${action[0].capitalize()}</badge>`
            } else {
              turn.actions += `<badge data-tooltip="${game.i18n.localize(`FF15.Types.Item.Types.Options.Type.${action}`)}" class="${action}">${action[0].capitalize()}</badge>`
            }
          }
        }
        if (actor.system.actionState?.used) {
          game.system.log.d("FFCombatTracker getData actor.system.actionState.used", actor.system.actionState.used)
          for (const action of actor.system.actionState.used.sort()) {
            turn.actions += `<badge class="used">${action.type[0].capitalize()}</badge>`
          }
        }
      }
    }
    game.system.log.d('FFCombatTracker getData', data);
    return data;
  }

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