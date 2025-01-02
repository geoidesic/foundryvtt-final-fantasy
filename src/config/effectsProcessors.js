import effects from '~/src/helpers/effects';

export function setupEffectsProcessors() {
  Hooks.on('FF15.processAdditionalBaseDamageFromItem', (event) => {
    const processor = new effects.PrimaryBaseDamageBuff(event.actor);
    processor.process(event);
  });

  Hooks.on('FF15.RerollDamageDice', (event) => {
    const processor = new effects.RerollDamageDice(event.actor);
    processor.process(event);
  });

  Hooks.on('FF15.EnableCombatTurnSlot', async (event) => {
    const processor = new effects.EnableCombatTurnSlot(event.actor);
    await processor.process(event);
  });
}