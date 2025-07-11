import PCSheetShell from "./PCSheetShell.svelte";
import SvelteDocumentSheet from "~/src/documents/DocumentSheet";
import { SYSTEM_CODE, SYSTEM_ID } from "~/src/helpers/constants";
import { localize } from "~/src/helpers/util";
import { generateRandomElementId } from "~/src/helpers/util";

/**
 * Actor sheet implementation for Player Characters
 * @extends {SvelteDocumentSheet}
 */
export default class FFXIVActorSheet extends SvelteDocumentSheet {

  /**
   * Default Application options
   * @return {object} The default options for configuring the application window - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${SYSTEM_ID}--actor-sheet-${generateRandomElementId()}`,

      width: 440,
      height: 828,
      minHeight: 180,
      minWidth: 282,
      // id: `${SYSTEM_ID}--actor-sheet`, // @deprecated: I don't know why we need an ID for this? And having a non-unique ID causes https://github.com/geoidesic/foundryvtt-final-fantasy-XIV/issues/8
      classes: [SYSTEM_CODE],
      headerButtonNoLabel: game.settings.get(SYSTEM_ID, 'applicationWindowHeaderIconsOnly') || false, //- @why: without this the initial value on first load of this app after a page refresh will be wrong, despite a reactive setting in the .svelte template; I don't really know why
      dragDrop: [{ dragSelector: ".directory-list .item", dropSelector: null }],
      svelte: {
        class: PCSheetShell,
        target: document.body,
      },
    });
  }

  /**
   * Closes the actor sheet and updates editing state
   * @param {object} options - Options which affect how the window is closed
   * @return {Promise<void>} Returns a promise that resolves when the sheet is closed
   */
  async close(options = {}) {
    this.reactive.document?.update({system: {isEditing: false}});
    await super.close(options);
  }

  /**
   * Gets the header buttons configuration for the sheet
   * @return {Array<object>} Returns an array of button configurations for the sheet header
   */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
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
        label: localize("Types.Actor.HeaderButtons.Edit"),
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

  /**
   * Handles toggling the edit mode of the sheet
   * @param {Event} event - The triggering event
   * @return {Promise<void>} Returns a promise that resolves when the edit mode is toggled
   */
  async _onToggleEdit(event) {
    game.system.log.p("[TOGGLE EDIT] _onToggleEdit event", event);

    if (event?.event) {
      event.event.preventDefault();
    }
    await this.reactive.document.update({system: {isEditing: !this.reactive.document.system.isEditing}});
    this.render();
  }

  /**
   * Opens the token configuration application
   * @param {Event} event - The triggering event
   * @return {void}
   */
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
   * Determines if dragging can start from the given selector
   * @param {string} selector - The selector to check
   * @return {boolean} Whether dragging can start
   */
  _canDragStart(selector) {
    return true;
  }

  /**
   * Determines if drag and drop is allowed
   * @param {string} selector - The selector to check
   * @return {boolean} Whether drag and drop is allowed
   */
  _canDragDrop(selector) {
    return this.reactive.document.isOwner || game.user.isGM;
  }

  /**
   * Handles drag over events
   * @param {DragEvent} event - The drag event
   * @return {void}
   */
  _onDragOver(event) { }

  /**
   * Handles the start of a drag operation
   * @param {DragEvent} event - The drag event
   * @return {void}
   */
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

  /**
   * Handles dropping content onto the sheet
   * @param {DragEvent} event - The drop event
   * @return {Promise<void|boolean|ActiveEffect|Item>} The result of the drop operation
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const actor = this.reactive.document;
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

  /**
   * Handles dropping an active effect onto the sheet
   * @param {DragEvent} event - The drop event
   * @param {object} data - The dropped data
   * @return {Promise<boolean|ActiveEffect>} The created effect or false if failed
   */
  async _onDropActiveEffect(event, data) {
    const actor = this.reactive.document;
    const effect = await ActiveEffect.implementation.fromDropData(data);

    if (!actor.isOwner || !effect) {
      return false;
    }
    if (actor.uuid === effect.parent.uuid) {
      return false;
    }
    return ActiveEffect.create(effect.toObject(), { parent: actor });
  }

  /**
   * Handles dropping an actor onto the sheet
   * @param {DragEvent} event - The drop event
   * @param {object} data - The dropped data
   * @return {Promise<boolean>} Whether the drop was successful
   */
  async _onDropActor(event, data) {
    const actor = this.reactive.document;

    if (!actor.isOwner) {
      return false;
    }
  }

  /**
   * Handles dropping an item onto the sheet
   * @param {DragEvent} event - The drop event
   * @param {object} data - The dropped data
   * @param {boolean} ignoreValidation - Whether to ignore validation
   * @return {Promise<boolean|Item>} The created item or false if the operation failed
   */
  async _onDropItem(event, data, ignoreValidation = false) {
    // console.log('_onDropItem', data);
    const actor = this.reactive.document;

    if (!actor.isOwner) {
      ui.notifications.error(localize(`${SYSTEM_CODE}.Errors.NotOwner`))
      return false;
    }

    const droppedItem = await fromUuid(data.uuid);

    //- job items are complicated and have their own logic
    if(droppedItem.type === "job") {
      return this._onDropJob(event, data);
    }

    /**
     * Effect items are not to be dropped directly on the actor
     * @why: because Effect Items are not ActiveEffects, 
     * dropping them directly on the actor will have no effect,
     * other than to break the Actor sheet because it will accumulate
     * invisible Effect items that cannot be removed, for there is no
     * mechanism to remove them and no use for them. Effect items are only 
     * to be dropped onto other items, not actors.
     */
    if (droppedItem.type === "effect") {
      ui.notifications.error(localize(`${SYSTEM_CODE}.Errors.EffectItemsNotAllowed`))
      return false;
    }
    
    //- if equipment duplicate, increment quantity and return
    const duplicate = actor.items.find(x => x.name == droppedItem.name && x.type == droppedItem.type);
    if(duplicate) {
      await duplicate.update({system: {quantity: duplicate.system.quantity + 1}})
      ui.notifications.info(`Found matching item "${duplicate.name}" and incremented quantity.`)
      return
    }

    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if (actor.uuid === item.parent?.uuid) {
      return this._onSortItem(event, itemData);
    }

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }

  /**
   * Handles dropping a folder onto the sheet
   * @param {DragEvent} event - The drop event
   * @param {object} data - The dropped data
   * @return {Promise<Array>} Array of created items
   */
  async _onDropFolder(event, data) {
    game.system.log.o('[DROP FOLDER] Starting folder drop:', {
      event,
      data
    });

    const actor = this.reactive.document;
    if (!actor.isOwner) {
      game.system.log.w('[DROP FOLDER] Not owner, exiting');
      return [];
    }

    /* eslint-disable-next-line new-cap */
    const folder = await Folder.implementation.fromDropData(data);
    game.system.log.o('[DROP FOLDER] Retrieved folder:', {
      folder,
      name: folder?.name,
      contents: folder?.contents,
      children: folder?.children
    });

    if (!folder) {
      game.system.log.w('[DROP FOLDER] No folder found');
      return [];
    }

    // Process folder contents
    const items = [];
    let foundJob = false;

    // Helper function to process items in a folder
    const processItems = async (contents) => {
      game.system.log.o('[DROP FOLDER] Processing contents:', {
        count: contents?.length,
        items: contents?.map(i => ({ name: i.name, type: i.type }))
      });

      if (!contents?.length) return;

      // First pass - look for jobs
      if (!foundJob) {
        for (const item of contents) {
          if (item.type === 'job') {
            game.system.log.o('[DROP FOLDER] Found job:', item.name);
            await this._onDropJob(event, { uuid: item.uuid });
            foundJob = true;
            break;
          }
        }
      }

      // Second pass - handle non-job items
      for (const item of contents) {
        if (item.type !== 'job') {
          game.system.log.o('[DROP FOLDER] Processing non-job item:', {
            name: item.name,
            type: item.type
          });
          items.push(item);
        }
      }
    };

    // Process main folder contents
    if (folder.contents?.length) {
      game.system.log.o('[DROP FOLDER] Processing main folder contents');
      await processItems(folder.contents);
    }

    // Process any subfolders
    if (folder.children?.length) {
      game.system.log.o('[DROP FOLDER] Found subfolders:', folder.children.length);
      for (const child of folder.children) {
        game.system.log.o('[DROP FOLDER] Processing subfolder:', {
          name: child.name,
          entries: child.entries?.length
        });
        if (child.entries?.length) {
          await processItems(child.entries);
        }
      }
    }

    // Create all non-job items
    if (items.length) {
      game.system.log.o('[DROP FOLDER] Creating items:', {
        count: items.length,
        items: items.map(i => ({ name: i.name, type: i.type }))
      });
      for (const item of items) {
        await this._onDropItem(event, item, true);
      }
    }

    return items;
  }

  /**
   * Handles dropping a job onto the sheet
   * @param {DragEvent} event - The drop event
   * @param {object} data - The dropped data
   * @return {Promise<boolean|void>} Whether the drop was successful
   */
  async _onDropJob(event, data) {
    const actor = this.reactive.document;

    if (!actor.isOwner) {
      return false;
    }
    
    const job = await fromUuid(data.uuid);
    const grants = job.system.grants;
    const grantItems = [];
    const failedUuids = [];
    const existingUuids = new Set(actor.items.map(item => item.uuid));
    
    game.system.log.d('_onDropJob: Job grants:', grants);
    
    for (const grantObject of grants.list) {
      game.system.log.d('_onDropJob: Processing grant:', grantObject);
      
      // Try to get item, handling both short and full UUID formats
      let grantItem;
      if (grantObject.uuid.startsWith('Item.')) {
        grantItem = game.items.get(grantObject.uuid.replace('Item.', ''));
        game.system.log.d('_onDropJob: Attempting to find world item:', grantItem);
      } else {
        grantItem = await fromUuid(grantObject.uuid);
        game.system.log.d('_onDropJob: Attempting to find compendium item:', grantItem);
      }
      
      if (!grantItem) {
        game.system.log.w(`_onDropJob: Failed to find item with UUID: ${grantObject.uuid}`);
        failedUuids.push(grantObject.uuid);
        continue;
      }
      
      // Only add if we don't already have this item
      if(!existingUuids.has(grantItem.uuid)) {
        grantItems.push(grantItem);
        existingUuids.add(grantItem.uuid); // Add to set to prevent duplicates within the same job
      }
    }

    if (failedUuids.length > 0) {
      game.system.log.g('ItemBucket:_onDropJob: Failed Uuids:', failedUuids);
      const confirmed = await Dialog.confirm({
        title: "Missing Items Found",
        content: `
          <p>The following items could not be found:</p>
          <p>${failedUuids.join('<br>')}</p>
          <p>Would you like to remove these invalid references from the job?</p>
        `,
        yes: () => true,
        no: () => false
      });
      
      if (confirmed) {
        // Get fresh copy of job
        const jobToUpdate = await fromUuid(data.uuid);
        
        // Filter out failed UUIDs
        const updatedGrants = {
          ...jobToUpdate.system.grants,
          list: jobToUpdate.system.grants.list.filter(g => !failedUuids.includes(g.uuid))
        };
        
        // Update the job
        await jobToUpdate.update({
          'system.grants': updatedGrants
        });
        
        ui.notifications.info(`Removed ${failedUuids.length} invalid references from job.`);
      } else {
        ui.notifications.error(`Job import cancelled due to missing items.`);
        return false;
      }
    }

    if (grantItems.length > 0) {
      await actor.createEmbeddedDocuments("Item", grantItems);
    }

    await actor.update({
      system: {
        job: {
          uuid: job.uuid,
          name: job.name,
          grants: grants.list,
          level: job.system.level,
          role: job.system.role,
          img: job.img
        }
      }
    });
  }

  /**
   * Creates new items from dropped data
   * @param {object|Array} itemData - The item data to create
   * @return {Promise<void>} Returns a promise that resolves when the items have been created
   */
  async _onDropItemCreate(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    const actor = this.reactive.document;
    for (const v of itemData) {
      await actor.createEmbeddedDocuments("Item", [v]);
    }
  }

  /**
   * Handles sorting items within the actor's inventory
   * @param {Event} event - The triggering event
   * @param {object} itemData - The item data being sorted
   * @return {Promise<Item[]>} The updated array of sorted items
   */
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
    for (const el of dropTarget.parentElement.children) {
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

