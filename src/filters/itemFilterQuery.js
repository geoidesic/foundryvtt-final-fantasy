import { get, writable } from 'svelte/store';
import { isWritableStore } from "#runtime/svelte/store/util";
import { Strings } from "#runtime/util";
import { isIterable } from "#runtime/util/object";
import { stepwiseResolveDotpath } from '~/src/helpers/paths';


/**
 * Creates a filter function to compare objects by a give property key against a regex test. The returned function
 * is also a writable Svelte store that builds a regex from the stores value.
 *
 * This filter function can be used w/ DynArrayReducer and bound as a store to input elements.
 *
 * @param {string|Iterable<string>}   properties - Property key to compare.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {boolean}  [opts.caseSensitive=false] - When true regex test is case-sensitive.
 *
 * @param {import('svelte/store').Writable<string>}  [opts.store=void] - Use the provided store to instead of creating
 *                                                                       a default writable store.
 *
 * @returns {(data: object) => boolean} The query string filter.
 */
export function createFilterQuery(properties, { caseSensitive = false, store } = {}) {
  let keyword = '';
  let regex;

  if (store !== void 0 && !isWritableStore(store)) {
    throw new TypeError(`createFilterQuery error: 'store' is not a writable store.`);
  }

  const storeKeyword = store ? store : writable(keyword);

  // If an existing store is provided then set initial values.
  if (store) {
    const current = get(store);

    if (typeof current === 'string') {
      keyword = Strings.normalize(current);
      game.system.log.d('keyword', keyword);
      regex = new RegExp(RegExp.escape(keyword), caseSensitive ? '' : 'i');
      game.system.log.d('keyword', regex);
    }
    else {
      store.set(keyword);
    }
  }

  /**
   * If there is no filter keyword / regex then do not filter otherwise filter based on the regex
   * created from the search input element.
   *
   * @param {object} data - Data object to test against regex.
   *
   * @returns {boolean} AnimationStore filter state.
   */
  function filterQuery(data) {
    if (keyword === '' || !regex) { 
      game.system.log.d('No keyword or regex, returning true');
      return true; 
    }
    

    if (isIterable(properties)) {
      // console.log('isIterable')
      for (const property of properties) {
        const value = data?.[property];
        // game.system.log.d('Checking property:', property, 'with value:', value);
        
        // Check if value is defined
        if (value !== undefined) {
          // Handle boolean values directly
          if (typeof value === 'boolean') {
            // game.system.log.d('Boolean value found:', value);
            if (value.toString() === keyword) {
              // game.system.log.d('Match found for boolean:', value);
              return true; 
            }
          } else {
            // Normalize string values
            const normalizedValue = Strings.normalize(value);
            // game.system.log.d('Normalized value:', normalizedValue);
            if (regex.test(normalizedValue)) { 
              // game.system.log.d('Match found for normalized value:', normalizedValue);
              return true; 
            }
          }
        } else {
          // game.system.log.d('Value is undefined for property:', property);
        }
      }
      // game.system.log.d('No matches found in iterable properties');
      return false;
    }
    else {
      // Handle the single property case
      const steps = stepwiseResolveDotpath(data, properties);
      const value = steps[steps.length - 1].val; // Get the final value from the resolved steps
      // game.system.log.d('Checking single property:', properties, 'with value:', value);
      
      // Check if value is defined
      if (value !== undefined) {
        // Handle boolean values directly
        if (typeof value === 'boolean') {
          // game.system.log.d('Boolean value found in single property:', value);
          return value.toString() === keyword; // Compare boolean as string
        }
        // Normalize string values
        const normalizedValue = Strings.normalize(value);
        // game.system.log.d('Normalized value for single property:', normalizedValue);
        return regex.test(normalizedValue);
      }
      // game.system.log.d('Value is undefined for single property:', properties);
      return false; // Return false if value is undefined
    }
  }

  /**
   * Create a custom store that changes when the search keyword changes.
   *
   * @param {(string) => void} handler - A callback function that accepts strings.
   *
   * @returns {import('svelte/store').Unsubscriber}
   */
  filterQuery.subscribe = (handler) => {
    return storeKeyword.subscribe(handler);
  };

  /**
   * Set
   *
   * @param {string}   value - A new value for the keyword / regex test.
   */
  filterQuery.set = (value) => {
    game.system.log.d('value', value)

    if (Array.isArray(value)) {
      // Join the array into a regex pattern
      const pattern = value.map(v => RegExp.escape(Strings.normalize(v))).join('|');
      keyword = value.join(', '); // Store the original values for reference
      regex = new RegExp(pattern, caseSensitive ? '' : 'i');
    } else if (typeof value === 'string') {
      keyword = Strings.normalize(value);
      game.system.log.d('keyword', keyword)
      regex = new RegExp(RegExp.escape(keyword), caseSensitive ? '' : 'i');
    } else if (typeof value === 'boolean') {
      keyword = value.toString(); // Convert boolean to string
      regex = new RegExp(keyword, caseSensitive ? '' : 'i'); // Create regex for boolean string
    }
    
    storeKeyword.set(keyword);
  };

  return filterQuery;
}
