<script>
import { onMount, getContext } from 'svelte';
import { localize } from "#runtime/util/i18n"
import { SYSTEM_CODE } from '~/src/helpers/constants'
import { ucfirst } from '~/src/helpers/util'

export let code;
export let key;
export let abbreviateLabel = false;
export let showSign = false;

export let onclick = () => {
  console.log('default onclick');
};

const actor = getContext('#doc');
const application = getContext("#external").application;
const { width } = application.position.stores;
// game.system.log.d('actor', actor);
// game.system.log.d('$actor', $actor);

const add = () => {
  if(!isEditing) return;
  $actor.update({system: {attributes: {[key]: { [code]: {val: value + 1}}}}})
}

const remove = () => {
  if(!isEditing) return;
  $actor.update({system: {attributes: {[key]: { [code]: {val: value - 1}}}}})
}



$: label = abbreviateLabel ? localize(`${SYSTEM_CODE}.Types.Actor.Types.PC.Attributes.${key}.${code}.Abbreviation`) : localize(`${SYSTEM_CODE}.Types.Actor.Types.PC.Attributes.${key}.${code}.Label`);
$: value = $actor?.system?.attributes?.[key]?.[code]?.val;
$: isEditing = $actor?.system?.isEditing;
$: sign = showSign ? value > 0 ? '+' : value < 0 ? '' : '' : '';
$: disabled = isEditing ? '' : 'disabled'

$: abbreviateLabel = $width <= 600;

onMount(() => {
});

</script>
<template lang='pug'>
  .attribute
    .underscore.flexrow.justify-vertical
      +if("!isEditing")
        .flex0
          button.wide.stealth.flex.dice(on:click!="{onclick(key, code)}")
            i.fas.fa-dice
      .flex3.left
        button.left.wide.tall.stealth.flexrow(class="{disabled}" data-tooltip="{isEditing ? localize(`${SYSTEM_CODE}.Types.Actor.EditAttribute.Tooltip`) : undefined}" on:click="{add}" on:contextmenu="{remove}") 
          .flex2.header {label} 
          .flex0.header {sign}{value} 
    
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
  .attribute
    width: 100%
    @include white-shadow-header(var(--size-md))
    @include white-shadow-underscore(3.5px, rgba(255, 255, 255, 0.4), rgba(0,0,0,0.3), 0px, 0.1em, -3px, 103%, 0px)
    
    & 
      margin-bottom: 1em
      transform: scaleY(1.5)
      transform-origin: top
      text-align: left
  .dice
    z-index: 3
    max-width: 1.4rem
    color: white
    cursor: pointer
    transform: scaleY(0.75)
    transform-origin: top
    text-align: left
    color: var(--ff-border-color)
    &:hover
      color: var(--border-highlight)

  button
    &.dice
      margin-bottom: -5px
      padding: 0
</style>