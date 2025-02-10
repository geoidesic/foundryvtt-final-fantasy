/**
 * @why The purpose of this listener is to ensure combat durations are set correctly
 * when an active effect is created.
 */
/**
 * Hook that runs when an active effect is created
 * @return {void}
 */
export default function createActiveEffect() {
  Hooks.on("createActiveEffect", async (activeEffect, data) => {
    game.system.log.o('[CREATE ACTIVE EFFECT] Processing effect:', {
      name: activeEffect.name,
      duration: activeEffect.duration,
      origin: activeEffect.origin
    });

    // Skip if already has a properly configured duration
    if (activeEffect.duration?.rounds || activeEffect.duration?.turns) {
      game.system.log.o('[CREATE ACTIVE EFFECT] Effect already has duration configured:', activeEffect.duration);
      return;
    }
    
    // Use the consolidated duration handling
    await FFActiveEffect.setCombatDuration(activeEffect);
  });
}

