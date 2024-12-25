import { SYSTEM_ID } from "~/src/helpers/constants"
import { viewedCombat } from "~/src/stores"

export default class FFCombatTracker extends CombatTracker {

  constructor(options) {
    game.system.log.d('FFCombatTracker constructor');

    super(options);
  }

  initialize(options) {
    super.initialize(options);

    // Set a store here. 
    viewedCombat.set(this.viewed);
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
            turn.actions += `<badge class="${action}">${action[0].capitalize()}</badge>`
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