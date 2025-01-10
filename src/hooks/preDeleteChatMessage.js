import { SYSTEM_ID } from "~/src/helpers/constants"

/**
 * Hook that runs before a chat message is deleted
 * @return {void}
 */
export default function preDeleteChatMessage() {
  // Add this new hook
  Hooks.on("preDeleteChatMessage", async (message) => {
    // Check if this is an action message
    const FFMessage = message.getFlag(SYSTEM_ID, 'data');
    if (!FFMessage || !FFMessage.actor || !FFMessage.item || FFMessage.item.type !== 'action') return;

    const actor = game.actors.get(FFMessage.actor._id);
    if (!actor) return;

    // Find if this message is tracked in used actions
    const { actionState } = actor.system;
    const usedAction = actionState.used.find(u => u.messageId === message.id);

    if (usedAction) {
      // Restore the action
      await actor.update({
        'system.actionState': {
          available: [...actionState.available, usedAction.type],
          used: actionState.used.filter(u => u.messageId !== message.id)
        }
      });
    }
  });

}