export default class ItemSheetStandard extends ItemSheet {
  constructor(...args) {
    super(...args);
  }

  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 560,
      classes: ["dnd5e", "sheet", "item"],
      resizable: true,
      scrollY: [
        ".tab[data-tab=details]",
        ".tab[data-tab=effects] .items-list",
        ".tab[data-tab=description] .editor-content",
        ".tab[data-tab=advancement] .items-list"
      ],
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description" }],
      dragDrop: [
        { dragSelector: "[data-effect-id]", dropSelector: "form" },
        { dragSelector: ".advancement-item", dropSelector: ".advancement" }
      ],
      accordions: [{
        headingSelector: ".description-header", contentSelector: ".editor"
      }],
      elements: {
        effects: "dnd5e-effects"
      },
      legacyDisplay: true,
      contextMenu: ContextMenu
    });
  }

  /** @inheritDoc */
  get template() {
    return `systems/foundryvtt-final-fantasy/assets/templates/${this.item.type}.hbs`;
  }

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('[data-action="testButtonClick"]').click(this._onTestButtonClick.bind(this));
    const dropZone = html.find('[data-action="drop-handler"]');
    dropZone.on('dragover', this._onDragOver.bind(this));
    dropZone.on('drop', this._onDrop.bind(this));
  }
  // Method to handle the button click
  _onTestButtonClick(event) {
    event.preventDefault();
    console.log("Test button clicked");
  }
  // Handle dragover event
  _onDragOver(event) {
    event.preventDefault(); // Ensure the drop is allowed
    const dropZone = event.currentTarget;
    dropZone.classList.add('drag-over'); // Add visual feedback
  
    // Optional: remove the feedback when the drag leaves the area
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
  }
  // Handle drop event
  async _onDrop(event) {
    event.preventDefault();
    const originalEvent = event.originalEvent || event; // Ensure we're accessing the original event
    const data = JSON.parse(originalEvent.dataTransfer.getData("text/plain"));
    const item = await Item.implementation.fromDropData(data);
    const list = []
    list.push({ uuid: item.uuid })
    const key = 'grants'
    await this.item.update({system : {[key] : { list }}});
    game.system.log.d('item', this.item.system.grants.list) //- outputs `0: {['object Object']}
  }
}
