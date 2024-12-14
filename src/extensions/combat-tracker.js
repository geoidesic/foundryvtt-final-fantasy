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
   * Override getData to implement our custom sorting on initial load
   * @override
   */
  async getData(options = {}) {
    game.system.log.d('FFCombatTracker getData - start');
    const data = await super.getData(options);

    if (!data.combat?.turns) return data;

    // Log initial state
    game.system.log.d('css-debug: Initial turns state:', {
      turns: data.combat.turns.map(t => ({
        name: t.name,
        css: t.css,
        type: t.actor?.type
      }))
    });

    // Create a new array but preserve the Combatant instances
    const sortedTurns = [...data.combat.turns].sort((a, b) => {
      const aIsNPC = a.actor?.type === "NPC";
      const bIsNPC = b.actor?.type === "NPC";
      if (aIsNPC !== bIsNPC) return aIsNPC ? 1 : -1;
      if (a.initiative === null && b.initiative === null) return 0;
      if (a.initiative === null) return 1;
      if (b.initiative === null) return -1;
      return b.initiative - a.initiative;
    });

    // Find the first NPC index
    const firstNPCIndex = sortedTurns.findIndex(t => t.actor?.type === "NPC");

    game.system.log.d('css-debug: After sorting:', {
      firstNPCIndex,
      turns: sortedTurns.map(t => ({
        name: t.name,
        type: t.actor?.type,
        css: t.css
      }))
    });

    // Add CSS classes for visual grouping
    if (firstNPCIndex > 0 && firstNPCIndex < sortedTurns.length) {
      sortedTurns.forEach((turn, index) => {
        // Log before modification
        game.system.log.d(`css-debug: Processing turn ${index}:`, {
          name: turn.name,
          beforeCss: turn.css
        });

        // Directly set the css property
        if (index === firstNPCIndex) {
          turn.css = 'npc-group-start';
        } else if (index === firstNPCIndex - 1) {
          turn.css = 'pc-group-end';
        }

        // Log after modification
        game.system.log.d(`css-debug: After processing turn ${index}:`, {
          name: turn.name,
          afterCss: turn.css
        });
      });
    }

    // Update the turns
    data.combat.turns = sortedTurns;

    // Log final state before template render
    game.system.log.d('css-debug: Final state before template:', {
      turns: data.combat.turns.map(t => ({
        name: t.name,
        css: t.css,
        type: t.actor?.type
      }))
    });

    game.system.log.d('FFCombatTracker getData - end');
    return data;
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