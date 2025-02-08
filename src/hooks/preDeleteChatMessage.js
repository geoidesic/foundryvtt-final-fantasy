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

    // Check if message has applied damage results
    const state = message.getFlag(SYSTEM_ID, 'state');
    if (state?.damageResults) {
      const hasAppliedDamage = Object.values(state.damageResults).some(result => result.applied);
      if (hasAppliedDamage) {
        game.system.log.w('[SLOT:RESTORE] Message has applied damage results, not restoring slot');
        return;
      }
    }

    const actor = game.actors.get(FFMessage.actor._id);
    if (!actor) return;

    // Find if this message is tracked in used actions
    const { actionState } = actor.system;
    const usedAction = actionState.used.find(u => u.messageId === message.id);

    // Restore MP cost if the action had one and hasn't been restored yet
    if (state?.mpCost && !state.mpRestored) {
      game.system.log.o('[MP:RESTORE] Starting MP restoration check:', {
        itemName: FFMessage.item.name,
        mpCost: state.mpCost
      });

      const currentMP = actor.system.points.MP.val;

      game.system.log.o('[MP:RESTORE] Restoring MP cost:', {
        itemName: FFMessage.item.name,
        mpCost: state.mpCost,
        currentMP,
        newMP: currentMP + state.mpCost
      });

      try {
        await actor.update({
          'system.points.MP.val': currentMP + state.mpCost
        });
        // Mark MP as restored to prevent double restoration
        await message.update({
          [`flags.${SYSTEM_ID}.state.mpRestored`]: true
        });
        game.system.log.o('[MP:RESTORE] Successfully restored MP cost');
      } catch (error) {
        game.system.log.e('[MP:RESTORE] Error restoring MP cost:', error);
      }
    } else {
      game.system.log.o('[MP:RESTORE] No MP cost to restore:', {
        itemName: FFMessage.item.name,
        mpCost: state?.mpCost,
        alreadyRestored: state?.mpRestored
      });
    }

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