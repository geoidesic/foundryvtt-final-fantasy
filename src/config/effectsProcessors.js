import effects from '~/src/helpers/effects';

export function setupEffectsProcessors() {
  Hooks.on('FF15.processAdditionalBaseDamageFromItem', (event) => {
    game.system.log.o('[PrimaryBaseDamageBuff] effects', effects);
    game.system.log.o('[PrimaryBaseDamageBuff] Processing additional base damage from item:', event);
    const processor = new effects.PrimaryBaseDamageBuff(event.actor);
    processor.process(event);
  });
}