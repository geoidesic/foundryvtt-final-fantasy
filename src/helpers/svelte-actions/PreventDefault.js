/**
 * Svelte action to prevent default behavior on specified events
 * @param {HTMLElement} node - The DOM node to apply the action to
 * @param {string[]} events - Array of event names to prevent default on
 * @return {void}
 */
export default function preventDefault(node, events = ['click']) {
  event.preventDefault();
  return;
}