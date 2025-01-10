/**
 * Svelte action to automatically scroll an element to the bottom
 * @param {HTMLElement} node - The DOM node to apply the action to
 * @return {void}
 */
export default function autoScroll(node) {
  setTimeout(() => {
    const chatMessage = node.parentNode;
    const chatLog = chatMessage.parentNode;
    const scrollTop = chatLog.scrollTop;
    const scrollHeight = chatLog.scrollHeight - chatLog.offsetHeight;
    const chatMessageHeight = chatMessage.offsetHeight;
    if (scrollTop >= scrollHeight - chatMessageHeight) {
      chatLog.scrollTop += chatMessageHeight;
    }
  }, 0);
}