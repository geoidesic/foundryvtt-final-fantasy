import { LOG_PREFIX, LOG_STYLES, LOG_PREFIX_COLOR, SYSTEM_CODE } from './constants';

export const log = {
  ASSERT: 1, ERROR: 2, WARN: 3, INFO: 4, DEBUG: 5, VERBOSE: 6,
  set level(level) {
    this.a = (level >= this.ASSERT) ? console.assert.bind(window.console, LOG_PREFIX) : () => { };
    this.e = (level >= this.ERROR) ? console.error.bind(window.console, LOG_PREFIX) : () => { };
    this.w = (level >= this.WARN) ? console.warn.bind(window.console, LOG_PREFIX) : () => { };
    this.i = (level >= this.INFO) ? console.info.bind(window.console, LOG_PREFIX) : () => { };
    this.d = (level >= this.DEBUG) ? console.debug.bind(window.console, LOG_PREFIX) : () => { };
    this.v = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX) : () => { };

    // Colorized log methods - short versions
    this.p = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.p) : () => { };
    this.g = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.g) : () => { };
    this.r = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.r) : () => { };
    this.o = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.o) : () => { };
    this.b = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.b) : () => { };
    this.y = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.y) : () => { };
    this.c = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.c) : () => { };
    this.m = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.m) : () => { };
    this.gr = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.gr) : () => { };
    this.br = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.br) : () => { };
    this.pi = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.pi) : () => { };
    this.t = (level >= this.VERBOSE) ? console.log.bind(window.console, LOG_PREFIX_COLOR, LOG_STYLES.t) : () => { };

    // Colorized log methods - full name aliases
    this.purple = this.p;
    this.green = this.g;
    this.red = this.r;
    this.orange = this.o;
    this.blue = this.b;
    this.yellow = this.y;
    this.cyan = this.c;
    this.magenta = this.m;
    this.gray = this.gr;
    this.brown = this.br;
    this.pink = this.pi;
    this.teal = this.t;

    this.loggingLevel = level;
  },
  get level() { return this.loggingLevel; }
};

/**
 * Toggles the bookmark/favorite status of an item
 * @param {Item} item - The item to toggle
 * @param {Function} callback - Callback function to run after toggle
 * @return {Promise<void>} A promise that resolves when the item is updated
 */
export async function toggleBookmark(item, callback = () => { }) {
  await item.update({ system: { favourite: !item.system.favourite } });
  callback();
}

/**
 * Gets the origin of an effect
 * @param {ActiveEffect} effect - The effect to get the origin for
 * @param {boolean} tryFromUuidSync - Whether to try getting from UUID synchronously
 * @return {Item|null} The origin item or null
 */
export function getEffectOrigin(effect, tryFromUuidSync = false) {
  if (!game.actors) return null;
  const origin = effect._source.origin;
  if (!origin) return null;
  const split = origin.split(".");
  let item = void 0;
  if (split.length == 4) {
    item = effect.parent.items.get(split[3]);
  } else {
    try {
      item = game.actors?.get(origin)
        || game.items?.get(origin)
        || game.packs?.get('effects');

      if (!item && tryFromUuidSync) {
        item = fromUuidSync(origin);
      }
    } catch (error) {
      console.warn('getEffectOrigin', effect, origin);
      throw error;
    }
  }

  return item;
}

/**
 * Gets a localized string
 * @param {string} string - The string to localize
 * @return {string} The localized string
 */
export function localize(string) {
  if (typeof game === 'undefined') return string; //- avoid lint error
  return game.i18n.localize(`${SYSTEM_CODE}.${string}`);
}

/**
 * Checks if a value is a number
 * @param {*} value - The value to check
 * @return {boolean} Whether the value is a number
 */
export function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Checks if a value is an attribute
 * @param {string} val - The value to check
 * @return {boolean} Whether the value is an attribute
 */
export function isAttribute(val) {
  if (Object.keys(attributes).includes(val)) return true;
  return false;
}


/**
 * Checks if an item is a passive effect
 * @param {Item} item - The item to check
 * @return {boolean} Whether the item is a passive effect
 */
export function isPassiveEffectFromItem(item) {
  game.system.log.d("isPassiveEffectFromItem item", item);
  if (item instanceof ActiveEffect) {
    const parent = item.parent;
    if (
      parent instanceof Item
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Converts a string to slug format
 * @param {string} str - The string to slugify
 * @return {string} The slugified string
 */
export function slugify(str) {
  return str.toLowerCase().replace(/ /g, '-');
}

/**
 * Checks if an item's parent is an actor
 * @param {Item} item - The item to check
 * @return {boolean} Whether the item's parent is an actor
 */
export function isParentActor(item) {
  return item?.parent?.constructor?.name === 'FFXIVActor';
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @return {string} The capitalized string
 */
export function ucfirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Checks if an object is empty
 * @param {object} obj - The object to check
 * @return {boolean} Whether the object is empty
 */
export const isEmptyObj = (obj) => Object.keys(obj).length === 0

/**
 * Gets a compendium pack from a UUID
 * @param {string} uuid - The UUID to get the pack from
 * @return {Promise<CompendiumCollection|boolean>} The pack or false if not found
 */
export const getPackFromUuid = async (uuid) => {
  const split = uuid.split(".");
  if (split[0] !== 'Compendium') {
    log.w('Not a compendium uuid', uuid)
    return false;
  }
  const packName = `${split[1]}.${split[2]}`;
  const pack = game.packs.get(packName);
  return pack;
}

/**
 * Generates a random element ID
 * @param {number} length - The length of the ID
 * @return {string} The generated ID
 */
export function generateRandomElementId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Gets the actor owner
 * @param {Actor} actor The actor to get the owner for
 * @return {User} The owner user
 */
export function getActorOwner(actor) {
  const owners = getOwners(actor);
  if (owners.length === 0) {
    return game.user;
  }
  if (owners.length === 1) {
    return owners[0];
  }

  const owner = owners.reduce((owner, currentOwner) => {
    if (!currentOwner.isGM) {
      return currentOwner;
    }
    return owner;
  }, null);

  if (!owner) {
    if (game.user.isGM) {
      return game.user;
    }
  }

  if (!owner) {
    return game.users.find(u => u.isGM);
  }
  return owner;
}

/**
 * Gets the owners of an actor
 * @param {Actor} actor - The actor to get owners for
 * @return {User[]} Array of users who own the actor
 */
export function getOwners(actor) {
  return game.users.filter(u => actor.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
}

/**
 * Gets all GM users
 * @return {string[]} Array of GM user IDs
 */
export function getGMs() {
  return game.users.filter(u => u.isGM).map(u => u.id)
}

/**
 * Converts a UUID string to a storage-safe format by replacing dots with underscores
 * @param {string} uuid - The UUID string to encode
 * @return {string} The encoded UUID string with dots replaced by underscores
 */
export function encodeUuidString(uuid) {
  return uuid.replace(/\./g, "_");
}

/**
 * Converts a storage-safe UUID string back to standard format by replacing underscores with dots
 * @param {string} uuid - The encoded UUID string to decode
 * @return {string} The decoded UUID string with underscores replaced by dots
 */
export function decodeUuidString(uuid) {
  return uuid.replace(/_/g, "\.");
}

/**
 * Finds all keys in an object that have a specific value
 * @param {object} obj - The object to search
 * @param {*} value - The value to search for
 * @return {Array<string>} Array of keys that have the specified value
 */
export function findKeysByValue(obj, value) {
  return Object.entries(obj)
    .filter(([key, val]) => val === value)
    .map(([key]) => key);
}

/**
 * Truncates a string to a specified length
 * @param {string} str The string to truncate
 * @param {number} n The maximum length
 * @return {string} The truncated string
 */
export function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str;
}

/**
 * Updates a chat message
 * @param {string} messageId The ID of the message to update
 * @param {object} data The update data
 * @return {Promise<void>} A promise that resolves when the message is updated
 */
export async function updateMessage(messageId, data) {
  // check if chat message owner is this user
  const message = game.messages.get(messageId);
  if (message.user.id !== game.user.id) {
    // emit to owner of message
    game.socket.emit(`system.${game.system.id}`, {
      type: "chatMessage",
      mode: "messageUpdate",
      messageId,
      data
    });
  } else {
    game.system.log.d('Current user is message owner');
    // update message
    await message.update(data)
  }
}


