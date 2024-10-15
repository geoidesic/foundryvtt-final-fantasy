<svelte:options accessors={true} />

<script>
  import { onMount, getContext } from 'svelte';
  import { resolveDotpath } from "~/src/helpers/paths";

  // The value of the input
  export let valuePath = "";
  export let document = false;
  export let preventDefault = false;
  export let disabled = false;
  export let label = "";
  export let editable = false;

  let inputValue,
    LABEL = !!label,
    inputElement,
    pulseClass = ""
  ;

  // Document reference
  const doc = document || getContext("#doc");

  const update = async () => {
    game.system.log.d('DocCheckBox internal default update method')
    if (preventDefault) return;
    await $doc.update({[valuePath]: Boolean(inputValue)}); 
    game.system.log.d('valuePath', valuePath)
    game.system.log.d($doc)
  }

  onMount(() => {
    inputValue = resolveDotpath($doc, valuePath);
  });

  //- NB: the template here can't be pug because it doesn't support dupicate properties, which we need for on:change default
</script>

<template>
  <div class={$$props.class}>
    {#if $$props.label}
      <label class="flex1">{$$props.label}</label>
    {/if}
    <input
      type="checkbox"
      bind:this={inputElement}
      bind:checked={inputValue}
      disabled={disabled || !$doc.isOwner}
      on:change
      on:change={update}
    />
  </div>
</template>


<style lang="sass" >
  .small 
    width: 14px
    height: 14px
  
</style>
