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

  async _onCombatantMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();

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

  activateListeners(html) {
    super.activateListeners(html);
    //- recursively get super and give me the classnames till we traverse to the root class
    const classNames = this.getClassNames();
    console.log("Class Names:", classNames); // Log the class names

    

    const tracker = html.find("#combat-tracker");
    const combatants = tracker.find(".combatant");

    // Create new Combat encounter
    html.find(".combat-create").click(ev => this._onCombatCreate(ev));

    // Display Combat settings
    html.find(".combat-settings").click(ev => {
      ev.preventDefault();
      new CombatTrackerConfig().render(true);
    });

    // Cycle the current Combat encounter
    html.find(".combat-cycle").click(ev => this._onCombatCycle(ev));

    // Combat control
    html.find(".combat-control").click(ev => this._onCombatControl(ev));

    // Combatant control
    html.find(".combatant-control").click(ev => this._onCombatantControl(ev));

    // Hover on Combatant
    combatants.hover(this._onCombatantHoverIn.bind(this), this._onCombatantHoverOut.bind(this));

    // Click on Combatant
    combatants.click(this._onCombatantMouseDown.bind(this));

    // Context on right-click
    if ( game.user.isGM ) this._contextMenu(html);

    // Intersection Observer for Combatant avatars
    const observer = new IntersectionObserver(this._onLazyLoadImage.bind(this), {root: tracker[0]});
    combatants.each((i, li) => observer.observe(li));
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