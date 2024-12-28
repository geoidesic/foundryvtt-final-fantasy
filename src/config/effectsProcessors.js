import effects from '~/src/helpers/effects';

export function setupEffectsProcessors() {
  Hooks.on('FF15.processAdditionalBaseDamageFromItem', (event) => {
    const processor = new effects.PrimaryBaseDamageBuff(event.actor);
    processor.process(event);
  });
}