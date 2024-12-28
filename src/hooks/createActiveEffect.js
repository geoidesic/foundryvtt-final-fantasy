export default function createActiveEffect() {
  Hooks.on("createActiveEffect", async (activeEffect, data) => {
    const origin = fromUuidSync(activeEffect.origin);
    game.system.log.o('createActiveEffect', { origin });
    if(origin.system.hasDuration) {
      const duration = origin.system.duration;
      const durationUnits = origin.system.durationUnits;
      let effectDuration = {};
      if(durationUnits === 'turn') {
        effectDuration = {
          turns: duration
        }
      }
      if(durationUnits === 'round') {
        effectDuration = {
          rounds: duration
        }
      }
      await activeEffect.update({ duration: effectDuration });
    }
  });
}

