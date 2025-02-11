import FFActiveEffect from "~/src/extensions/active-effect.js";

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

  });
}

