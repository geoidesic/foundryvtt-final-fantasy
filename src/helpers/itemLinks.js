import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

import { SYSTEM_CODE } from "~/src/helpers/constants"


/**
 * Use this to remove an item from a linked list of items.
 * @param {TJSDocument} $doc - The document containing the items
 * @param {string} key - The key in the document's system data
 * @param {Number} index - The index of the item to delete
 * @return {Array} updated list
 */
export async function deleteItemLink($doc, key, index) {
  game.system.log.d('key', key)
  game.system.log.d('index', index)

  const itemList = $doc.system?.[key]?.list;
  itemList.splice(index, 1);

  game.system.log.d('itemList', itemList)
  game.system.log.d('itemList', $doc.system?.[key]?.list)
  await $doc.update({ system: { [key]: { value: 1, list: itemList } } });
}


/**
 * This function can be used within a drop listener to store the dropped item.
 * Ensure that the model of the item with the drop listener has a system node with a list array
 * @param {object} event - The drop event
 * @param {object} $doc - The document to update
 * @param {string} key - The system data node to store the list to
 * @return {object} saved droppedItemData
 */
export async function onDropItemOnItem(event, $doc, key) {

  game.system.log.d('key', key)
  game.system.log.d('$doc.type', $doc.type)
  if (typeof key === 'undefined') {
    console.error('onDropItemOnItem `key` string is not defined. This determines where to store the drop in the item.system.')
  }
  const droppedItem = new TJSDocument();
  await droppedItem.setFromDataTransfer(JSON.parse(event.dataTransfer.getData("text/plain")));
  const result = {}
  try {
    const droppedItemData = droppedItem.get();
    game.system.log.d('droppedItemData', droppedItemData)

    //- filter out duplicates
    if ($doc.system?.[key]?.list.find(r => r.uuid === droppedItemData.uuid)) {
      const error = game.i18n.localize(`${SYSTEM_CODE}.Types.Item.AlreadyExists`)
      game.system.log.w(error);
      ui.notifications.warn(error)
      return false;
    }
    game.system.log.d('droppedItemData.type', droppedItemData.type)

    //- if item is of type `limitebreak` only allow one. I.e. must delete before adding new
    if (droppedItemData.type === 'limitbreak' && $doc.type === 'job') {
      const existingLimitbreak = await Promise.all($doc.system?.[key]?.list.map(async r => {
        const item = await fromUuid(r.uuid);
        game.system.log.d('Checking item', item); // Log each item being checked
        return item.type === 'limitbreak' ? item : null; // Return the item if it's a limitbreak
      }));

      const foundLimitbreak = existingLimitbreak.find(item => item !== null); // Find any existing limitbreak

      game.system.log.d('foundLimitbreak', foundLimitbreak); // Log the found limitbreak item

      if (foundLimitbreak) {
        const error = game.i18n.localize(`${SYSTEM_CODE}.Types.Item.LimitBreakAlreadyExists`);
        game.system.log.w(error);
        ui.notifications.warn(error);
        return false;
      }
    }



    const itemList = $doc.system?.[key]?.list || [];

    // only store the uuid, anything else will cause desync
    // in other words, if you denormalise here, when the original item changes, every instance of that linkedlist will need manual updating.
    itemList.push({
      uuid: droppedItemData.uuid,
    });
    game.system.log.d('itemList', itemList)

    //- this works but causes a sort validation error. Don't know why. It shouldn't
    await $doc.update({ [`system.${key}`]: { value: true, list: itemList } });

    //- this doesn't work. Don't know why. It should
    // await $doc.update({system: { [key]: { value: 1, list: itemList } }});

    result[key] = droppedItemData
    return result;
  } catch (err) {
    game.system.log.e(err);
  }
}
/**
 * @why this function is designed this way specifically.
 * We can't directly edit the linked array here for two reason:
 * 1. If we overwrite it, we lose the reference to the original array
 * 2. If we simply edit it, the caller component's reactivity won't be triggered (because reactivity for arrays in Svelte is triggered by assignment, not editing)
 * So you have to do the assignment in the component from the return value here
 * @param {array} list - The array you wish to update
 * @param {array} uuids - The list of uuids to fetch objects from
 * @param {string} uuid - A single uuid to fetch, i.e. won't process the whole batch, just a single item
 * @return {array} A new array of fetched items
 */
export async function updateList(list, uuids, uuid = false) {
  // game.system.log.d('updateList', list, uuids, uuid)
  // game.system.log.d('uuids.length', uuids.length)
  if (uuids.length === 0) return [];
  if (!uuid) {
    return Object.values(await uuidsFromList(uuids));
  } else {
    return Object.values({ ...list, ...await uuidsFromList(uuids, uuid) });
  }
}

/**
 * Gets items from a list of UUIDs
 * @param {array} list - List of item objects
 * @param {boolean} byUuid - Whether to fetch by UUID
 * @return {object} UUID key/value pairs
 */
export async function uuidsFromList(list, byUuid = false) {
  const items = {}
  for (const item of list) {
    if (!byUuid) {
      items[item.uuid] = await fromUuid(item.uuid);
    } else {
      if (byUuid == item.uuid) {
        items[item.uuid] = await fromUuid(item.uuid);
      }
    }
  }
  return items;
}