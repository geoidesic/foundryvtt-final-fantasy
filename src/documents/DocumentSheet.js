import { SvelteApplication } from "#runtime/svelte/application";
import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

import DocumentShell from "./DocumentShell.svelte";

/**
 * Base class for Svelte-powered document sheets
 * @extends {SvelteApplication}
 */
export default class SvelteDocumentSheet extends SvelteApplication {
  /**
   * Document store that monitors updates to any assigned document.
   * @type {TJSDocument<foundry.abstract.Document>}
   */
  #documentStore = new TJSDocument(void 0, { delete: this.close.bind(this) });

  /**
   * Holds the document unsubscription function.
   * @type {Function}
   */
  #storeUnsubscribe;

  /**
   * Creates a new instance of the document sheet
   * @param {object} object - The object to initialize with
   */
  constructor(object) {
    super(object);

    // Define document store property
    Object.defineProperty(this.reactive, "document", {
      get: () => this.#documentStore.get(),
      set: (document) => {
        this.#documentStore.set(document);
      },
    });
    this.reactive.document = object;

    game.system.log.d('isEditing', this.reactive.document.system.isEditing);
  }

  /**
   * Default Application options
   * @return {object} options - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "No Document Assigned",
      width: 800,
      height: 600,
      resizable: true,
      minimizable: true,
      dragDrop: [{ dragSelector: ".directory-list .item", dropSelector: null }],
      svelte: {
        class: DocumentShell,
        target: document.body,
        // You can assign a function that is invoked with MyItemApp instance as `this`.
        props: function () {
          return { documentStore: this.#documentStore, /* document: this.reactive.document */ /* @deprecated: useful to know about but confusing to use in the template */ };
        },
      },
    });
  }

  /**
   * Gets the header buttons for the sheet
   * @return {Array<object>} Returns an array of button configurations for the sheet header
   */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    buttons.unshift({
      class: "configure-sheet",
      icon: "fas fa-cog",
      title: "open sheet configurator",
      onclick: (ev) => this._onConfigureSheet(ev),
    });
    return buttons;
  }

  /**
   * Handles sheet configuration
   * @param {Event} event - The triggering event
   * @return {void} Nothing
   */
  _onConfigureSheet(event) {
    if (event) {
      event.preventDefault();
    }
    // eslint-disable-next-line no-undef
    new DocumentSheetConfig(this.reactive.document, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - SvelteDocumentSheet.defaultOptions.width) / 2,
    }).render(true);
  }

  /**
   * Closes the sheet
   * @param {object} options - Options for closing
   * @return {Promise<void>} Returns a promise that resolves when the sheet is closed
   */
  async close(options = {}) {
    await super.close(options);

    if (this.#storeUnsubscribe) {
      this.#storeUnsubscribe();
      this.#storeUnsubscribe = void 0;
    }
  }

  /**
   * Handles document updates
   * @param {foundry.abstract.Document} doc - The document being updated
   * @param {object} options - Update options
   * @return {Promise<void>} Returns a promise that resolves when the document is updated
   */
  async #handleDocUpdate(doc, options) {
    const { action } = options;

    // I need to add a 'subscribe' action to TJSDocument so must check void.
    if ((action === void 0 || action === "update" || action === "subscribe") && doc) {
      this.reactive.title = doc?.isToken ? `[Token] ${doc?.name}` : doc?.name ?? "No Document Assigned";
    }
  }

  /**
   * Prepares base data for the sheet
   * @return {Promise<void>} Returns a promise that resolves when the base data is prepared
   */
  async prepareBaseData() {

  }

  /**
   * Renders the sheet
   * @param {boolean} force - Whether to force render
   * @param {object} options - Render options
   * @return {this} Returns the sheet instance for method chaining
   */
  render(force = false, options = {}) {
    if (!this.#storeUnsubscribe) {
      this.#storeUnsubscribe = this.#documentStore.subscribe(this.#handleDocUpdate.bind(this));
    }
    super.render(force, options);
    return this;
  }
}

