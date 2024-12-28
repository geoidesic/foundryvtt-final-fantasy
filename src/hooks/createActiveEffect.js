export default function createActiveEffect() {
  Hooks.on("createActiveEffect", async (activeEffect, data) => {
    const origin = fromUuidSync(activeEffect.origin);
    game.system.log.o('createActiveEffect', { origin });
    
    // Only process effects that have duration
    if (!origin?.system.hasDuration) return;

    const duration = origin.system.duration;
    const durationUnits = origin.system.durationUnits;
    let effectDuration = {};

    // Set up duration based on unit type
    if (durationUnits === 'turn') {
      effectDuration = {
        turns: duration,
        startTime: game.time.worldTime,
        combat: game.combat?.id
      };
    } else if (durationUnits === 'round') {
      effectDuration = {
        rounds: duration,
        startTime: game.time.worldTime,
        combat: game.combat?.id
      };
    }

    // Only update if we have duration data
    if (Object.keys(effectDuration).length > 0) {
      await activeEffect.update({ duration: effectDuration });
    }
  });
}

