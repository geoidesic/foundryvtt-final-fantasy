import ActorSheetShell from "./ActorSheetShell.svelte";
import SvelteDocumentSheet from "~/src/documents/DocumentSheet";
import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { localize } from "#runtime/svelte/helper";

export default class FF15ActorSheet extends SvelteDocumentSheet {

  /**
   * Default Application options
   *
   * @returns {object} options - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 440,
      height: 828,
      minWidth: 660,
      // id: `${SYSTEM_ID}--actor-sheet`, // @deprecated: I don't know why we need an ID for this? And having a non-unique ID causes https://github.com/geoidesic/foundryvtt-final-fantasy/issues/8
      classes: [SYSTEM_CODE],
      headerButtonNoLabel: game.settings.get(SYSTEM_ID, 'applicationWindowHeaderIconsOnly') || false, //- @why: without this the initial value on first load of this app after a page refresh will be wrong, despite a reactive setting in the .svelte template; I don't really know why
      dragDrop: [{ dragSelector: ".directory-list .item", dropSelector: null }],
      svelte: {
        class: ActorSheetShell,
        target: document.body,
      },
    });
  }


  async close(options = {}) {
    this.reactive.document.update({system: {isEditing: false}});
    await super.close(options);
  }

  _getHeaderButtons() {
    game.system.log.d('_getHeaderButtons')
    game.system.log.d('isEditing', this.reactive.document.system.isEditing);

    const buttons = super._getHeaderButtons();
    const storage = this.reactive.sessionStorage;
    const canConfigure = game.user.isGM || (this.reactive.document.isOwner && game.user.can("TOKEN_CONFIGURE"));
    if (this.reactive.document.documentName === "Actor") {
      if (canConfigure) {
        buttons.unshift({
          label: this.token ? "Token" : "TOKEN.TitlePrototype",
          class: "configure-token",
          icon: "fas fa-user-circle",
          onclick: (ev) => this._onConfigureToken(ev),
        });
      }
    }
    const canEdit = game.user.isGM || (this.reactive.document.isOwner);
    if (canEdit) {
      buttons.unshift({
        label: localize("FF15.Types.Actor.HeaderButtons.Edit"),
        class: "edit-sheet" + (this.reactive.document.system.isEditing ? " active" : ""),
        icon: "fas " + (this.reactive.document.system.isEditing ? "fa-toggle-on" : "fa-toggle-off"),
        // onclick: (ev) => this._onToggleEdit(ev),
        onPress: (ev) => {
          this._onToggleEdit(ev)
        }
      })
    }
    return buttons;
  }

  async _onToggleEdit(event) {
    game.system.log.d('_onToggleEdit')
    if (event) {
      event.preventDefault();
    }
    await this.reactive.document.update({system: {isEditing: !this.reactive.document.system.isEditing}});
    game.system.log.d('after toggle: isEditing', this.reactive.document.system.isEditing);
    this.render();
  }

  _onConfigureToken(event) {
    if (event) {
      event.preventDefault();
    }
    const actor = this.reactive.document;
    const token = actor.isToken ? actor.token : actor.prototypeToken;
    new CONFIG.Token.prototypeSheetClass(token, {
      left: Math.max(this.position.left - 560 - 10, 10),
      top: this.position.top,
    }).render(true);
  }

  /**
   * Drag&Drop handling
   */
  _canDragStart(selector) {
    return true;
  }
  _canDragDrop(selector) {
    return this.reactive.document.isOwner || game.user.isGM;
  }
  _onDragOver(event) { }

  _onDragStart(event) {
    {
      const li = event.currentTarget;
      if (event.target.classList.contains("content-link")) {
        return;
      }

      // Create drag data
      let dragData;

      // Owned Items
      if (li.dataset.itemId) {
        const item = this.actor.items.get(li.dataset.itemId);
        dragData = item.toDragData();
      }

      // Active Effect
      if (li.dataset.effectId) {
        const effect = this.actor.effects.get(li.dataset.effectId);
        dragData = effect.toDragData();
      }

      if (!dragData) {
        return;
      }

      // Set data transfer
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
  }

  async _onDrop(event) {

    const data = TextEditor.getDragEventData(event);
    const actor = this.reactive.document;
    console.log('event', event);
    console.log('data', data);
    console.log('actor', actor);

    if (actor.documentName !== "Actor") {
      return;
    }
    /**
     * A hook event that fires when some useful data is dropped onto an ActorSheet.
     * @function dropActorSheetData
     * @memberof hookEvents
     * @param {Actor} actor      The Actor
     * @param {ActorSheet} sheet The ActorSheet application
     * @param {object} data      The data that has been dropped onto the sheet
     */
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if (allowed === false) {
      return;
    }

    // Handle different data types
    switch (data.type) {
      case "ActiveEffect": {
        return await this._onDropActiveEffect(event, data);
      }
      case "Actor": {
        return await this._onDropActor(event, data);
      }
      case "Item": {
        return await this._onDropItem(event, data);
      }

      case "Folder": {
        return await this._onDropFolder(event, data);
      }
      default: {
        log.e(`Impossible type "${data.type}" in _onDrop.`);
        return;
      }
    }
  }

  async _onDropActiveEffect(event, data) {
    console.log('_onDropActiveEffect');

    console.log('data', data);
    const actor = this.reactive.document;

    const effect = await ActiveEffect.implementation.fromDropData(data);
    console.log('effect', effect);

    if (!actor.isOwner || !effect) {
      return false;
    }
    if (actor.uuid === effect.parent.uuid) {
      return false;
    }
    return ActiveEffect.create(effect.toObject(), { parent: actor });
  }

  async _onDropActor(event, data) {
    const actor = this.reactive.document;

    if (!actor.isOwner) {
      return false;
    }
  }

  async _onDropItem(event, data, ignoreValidation = false) {
    console.log('_onDropItem', data);
    const actor = this.reactive.document;

    if (!actor.isOwner) {
      return false;
    }

    //- if equipment duplicate, increment quantity and return
    const droppedItem = await fromUuid(data.uuid);
    const duplicate = actor.items.find(x => x.name = droppedItem.name);
    if(duplicate) {
      await duplicate.update({system: {quantity: duplicate.system.quantity + 1}})
      ui.notifications.info(`Found matching item "${duplicate.name}" and incremented quantity.`)
      return
    }

    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();
    const itemEffects = Array.from(itemData.effects);

    // Handle item sorting within the same Actor
    if (actor.uuid === item.parent?.uuid) {
      return this._onSortItem(event, itemData);
    }

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }

  async _onDropFolder(event, data) {
    const actor = this.reactive.document;

    const folder = await Folder.implementation.fromDropData(data);
    if (!folder && data.documentName !== "Item" && !actor.isOwner) {
      return [];
    }

    if (folder.contents.length) {
      for (let item of folder.contents) {
        await this._onDropItem(event, item, true);
      }
    }
  }

  async _onDropItemCreate(itemData) {

    itemData = itemData instanceof Array ? itemData : [itemData];
    const actor = this.reactive.document;
    for(let v of itemData) {
      const item = v
      await actor.createEmbeddedDocuments("Item", [item]);
    }
  }

  _onSortItem(event, itemData) {
    const actor = this.reactive.document;

    // Get the drag source and drop target
    const items = actor.items;
    const source = items.get(itemData._id);
    const dropTarget = event.target.closest("[data-item-id]");
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (source.id === target.id) {
      return;
    }

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== source.id) {
        siblings.push(items.get(el.dataset.itemId));
      }
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(source, { target, siblings });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target.data._id;
      return update;
    });

    // Perform the update
    return actor.updateEmbeddedDocuments("Item", updateData);
  }
}

