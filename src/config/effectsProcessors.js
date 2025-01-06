import effects from '~/src/helpers/effects';

export function setupEffectsProcessors() {
  Hooks.on('FF15.processAdditionalBaseDamageFromItem', (event) => {
    const processor = new effects.PrimaryBaseDamageBuff(event.actor);
    processor.process(event);
  });

  Hooks.on('FF15.DamageDiceReroll', (event) => {
    const processor = new effects.DamageDiceReroll(event.actor);
    processor.process(event);
  });

  Hooks.on('FF15.EnableCombatTurnSlot', async (event) => {
    const processor = new effects.EnableCombatTurnSlot(event.actor);
    await processor.process(event);
  });

  Hooks.on('FF15.TransferEffectToAllies', async (event) => {
    const processor = new effects.TransferEffectToAllies(event.actor);
    await processor.process(event);
  });
  
  Hooks.on('FF15.TransferEffectToAlliesDelete', async (event) => {
    const processor = new effects.TransferEffectToAllies(event.actor);
    await processor.delete(event);
  });

  Hooks.on('FF15.DamageOverTime', async (event) => {
    const processor = new effects.DamageOverTime(event.actor);
    await processor.process(event);
  });

  Hooks.on('FF15.ProcTrigger', async (event) => {
    const processor = new effects.ProcTrigger(event.actor);
    await processor.process(event);
  });
}