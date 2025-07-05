/**
 * Standard item sheet implementation for FFXIV
 * @extends {FFXIVItemSheet}
 */
export default class FFXIVItemSheetStandard extends FFXIVItemSheet {
  /**
   * Creates a new instance of the item sheet
   * @param {...any} args - Constructor arguments
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * Default Application options
   * @return {object} options - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
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

  /**
   * Gets the template path for this sheet
   * @return {string} The path to the template file
   */
  get template() {
    return `systems/foundryvtt-final-fantasy-XIV/assets/templates/${this.item.type}.hbs`;
  }

  /**
   * Activates event listeners for the sheet
   * @param {JQuery} html - The rendered HTML of the sheet
   * @return {void} Nothing
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('[data-action="testButtonClick"]').click(this._onTestButtonClick.bind(this));
    const dropZone = html.find('[data-action="drop-handler"]');
    dropZone.on('dragover', this._onDragOver.bind(this));
    dropZone.on('drop', this._onDrop.bind(this));
  }

  /**
   * Handles test button click events
   * @param {Event} event - The click event
   * @return {void} Nothing
   * @private
   */
  _onTestButtonClick(event) {
    event.preventDefault();
    console.log("Test button clicked");
  }

  /**
   * Handles dragover events
   * @param {DragEvent} event - The dragover event
   * @return {void} Nothing
   * @private
   */
  _onDragOver(event) {
    event.preventDefault();
    const dropZone = event.currentTarget;
    dropZone.classList.add('drag-over');
  
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
  }

  /**
   * Handles drop events
   * @param {DragEvent} event - The drop event
   * @return {Promise<void>} Returns a promise that resolves when the drop operation is complete
   * @private
   */
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
