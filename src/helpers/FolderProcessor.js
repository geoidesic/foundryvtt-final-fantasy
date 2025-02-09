/**
 * Helper class for processing folder drops in the system
 */
export default class FolderProcessor {
  /**
   * Process a single item
   * @param {Item} item - The item to process
   * @param {Array} list - The list to add the item to
   * @param {boolean} isJob - Whether this is being processed for a job
   * @param {Object} options - Additional options
   * @param {boolean} options.preventDuplicates - Whether to prevent duplicate items
   * @param {boolean} options.warnOnCompendiumDrops - Whether to warn on non-compendium drops
   * @param {Object} sourceContext - Context about where the item came from
   * @return {Promise<boolean>} Whether the item was processed successfully
   */
  static async processItem(item, list, isJob, options = {}, sourceContext = {}) {
    if (!item) return false;

    const { preventDuplicates = true, warnOnCompendiumDrops = true } = options;

    game.system.log.o("[FOLDER PROCESSOR] Processing item:", { 
      item, 
      uuid: item.uuid,
      type: item.type,
      list: list.map(x => x.uuid),
      sourceContext
    });

    // Skip if item already exists in list
    const existingInList = list.some(existing => existing.uuid === item.uuid);
    
    if (preventDuplicates && existingInList) {
      game.system.log.w(`${item.name} is already in the list.`);
      return false;
    }

    // Check if it's a non-compendium item and warning is enabled
    if (warnOnCompendiumDrops && !item.uuid.startsWith('Compendium.')) {
      const confirmed = await Dialog.confirm({
        title: "Non-Compendium Item",
        content: `<p>Warning: You are adding an item from the game world rather than from a compendium. If this item is deleted from the game, it could cause inconsistencies.</p><p>Are you sure you want to add this item?</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: false
      });
      
      if (!confirmed) return false;
    }

    // Add item to list
    game.system.log.o("[FOLDER PROCESSOR] Adding item to list:", { uuid: item.uuid });
    list.push({ uuid: item.uuid });

    // If this is a job and we're dropping an action with enabled traits
    if (isJob && item.type === 'action' && item.system.enables?.value) {
      // Get all enabled traits from the action
      const enabledTraits = item.system.enables.list || [];
      
      game.system.log.o("[FOLDER PROCESSOR] Processing enabled traits:", enabledTraits);
      
      // Add each enabled trait that isn't already in the list
      for (const trait of enabledTraits) {
        const traitExists = list.some(existing => existing.uuid === trait.uuid);
        game.system.log.o("[FOLDER PROCESSOR] Checking trait:", { trait, exists: traitExists });
        
        if (!traitExists) {
          // Verify the trait exists before adding it
          const traitItem = await fromUuid(trait.uuid);
          if (traitItem) {
            game.system.log.o("[FOLDER PROCESSOR] Adding verified trait to list:", trait.uuid);
            list.push({ uuid: trait.uuid });
          } else {
            game.system.log.w("[FOLDER PROCESSOR] Failed to find trait with UUID:", {
              uuid: trait.uuid,
              sourceAction: {
                name: item.name,
                id: item._id,
                uuid: item.uuid
              },
              sourceFolder: sourceContext,
              invalidTrait: trait
            });
          }
        }
      }
    }

    return true;
  }

  /**
   * Process a folder and all its contents
   * @param {Folder} folder - The folder to process
   * @param {Array} list - The list to add items to
   * @param {boolean} isJob - Whether this is being processed for a job
   * @param {Object} options - Additional options
   * @return {Promise<void>}
   */
  static async processFolder(folder, list, isJob, options = {}) {
    const folderContext = {
      name: folder.name,
      id: folder._id,
      uuid: folder.uuid
    };

    game.system.log.o("[FOLDER PROCESSOR] Processing folder:", {
      folder: folderContext,
      contents: folder?.contents,
      children: folder?.children,
      entries: folder?.children?.[0]?.entries
    });

    if (!folder) return;

    // Process each child folder
    if (folder.children?.length) {
      game.system.log.o("[FOLDER PROCESSOR] Processing child folders:", folder.children);
      for (const child of folder.children) {
        game.system.log.o("[FOLDER PROCESSOR] Processing child:", child);
        
        // Process entries in this child folder
        if (child.entries?.length) {
          game.system.log.o("[FOLDER PROCESSOR] Processing entries:", child.entries);
          for (const entry of child.entries) {
            game.system.log.o("[FOLDER PROCESSOR] Processing entry:", entry);
            const item = await fromUuid(entry.uuid);
            await this.processItem(item, list, isJob, options, folderContext);
          }
        }

        // If this child has nested folders, process them
        if (child.children?.length) {
          const subFolder = await fromUuid(child.folder.uuid);
          await this.processFolder(subFolder, list, isJob, options);
        }
      }
    }

    // Process any direct contents (for non-compendium folders)
    if (folder.contents?.length) {
      game.system.log.o("[FOLDER PROCESSOR] Processing folder contents:", folder.contents);
      for (const content of folder.contents) {
        if (content.type === "Folder") {
          game.system.log.o("[FOLDER PROCESSOR] Found nested folder:", content);
          const subFolder = await fromUuid(content.uuid);
          await this.processFolder(subFolder, list, isJob, options);
        } else {
          game.system.log.o("[FOLDER PROCESSOR] Processing item from folder:", content);
          const item = await fromUuid(content.uuid);
          await this.processItem(item, list, isJob, options, folderContext);
        }
      }
    }
  }

  /**
   * Groups items in a folder by type
   * @param {Folder} folder - The folder to process
   * @return {Promise<Object>} Object containing grouped items
   */
  static async groupFolderContentsByType(folder) {
    const groups = {
      job: [],
      other: []
    };

    if (!folder?.contents) return groups;

    for (const item of folder.contents) {
      const resolvedItem = await fromUuid(item.uuid);
      if (!resolvedItem) continue;

      if (resolvedItem.type === 'job') {
        groups.job.push(resolvedItem);
      } else {
        groups.other.push(resolvedItem);
      }
    }

    game.system.log.o("[FOLDER PROCESSOR] Grouped items:", {
      jobs: groups.job.length,
      other: groups.other.length
    });

    return groups;
  }
} 