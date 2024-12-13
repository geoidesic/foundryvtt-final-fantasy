import { SYSTEM_ID } from "~/src/helpers/constants"

export default class FFCombatTracker extends CombatTracker {

  constructor(options) {
    game.system.log.d('FFCombatTracker constructor');
    
    super(options);
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
   * Override the getData method to sort combatants
   * @override
   */
  async getData(options={}) {
    const data = await super.getData(options);
    
    if (data.combat) {
      // Sort combatants: PCs first, then NPCs
      data.turns = this._sortCombatants(data.combat.turns);
    }
    
    return data;
  }

  /**
   * Custom sort method to separate PCs and NPCs
   * @private
   */
  _sortCombatants(turns) {
    return turns.sort((a, b) => {
      // Check if combatant is NPC by checking actor type
      const aIsNPC = a.actor?.type === "NPC";
      const bIsNPC = b.actor?.type === "NPC";
      
      // If one is NPC and other isn't, NPCs go last
      if (aIsNPC !== bIsNPC) {
        return aIsNPC ? 1 : -1;
      }
      
      // If both are same type (both PC or both NPC), sort by initiative
      if (a.initiative === null && b.initiative === null) return 0;
      if (a.initiative === null) return 1;
      if (b.initiative === null) return -1;
      return b.initiative - a.initiative;
    });
  }

  async _onCombatantMouseDown(event) {
    event.preventDefault();
    // event.stopPropagation(); //- this breaks the context menu, so removing it and the input click still works as expected

    const li = event.currentTarget;
    const combatant = this.viewed.combatants.get(li.dataset.combatantId);
    const token = combatant.token;
    if ( !combatant.actor?.testUserPermission(game.user, "OBSERVER") ) return;
    const now = Date.now();

    // Handle double-left click to open sheet
    const dt = now - this._clickTime;
    this._clickTime = now;
    if ( dt <= 250 ) {
      //- #19 - prevent double click from opening sheet when clicking on the initiative field
      if(event.target.type === undefined) {
        return combatant.actor?.sheet.render(true);
      }
    }

    // Control and pan to Token object
    if ( token?.object ) {
      token.object?.control({releaseOthers: true});
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