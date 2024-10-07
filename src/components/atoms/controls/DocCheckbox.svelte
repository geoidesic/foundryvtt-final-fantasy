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
    if (preventDefault) return;
    await $doc.update({[valuePath]: Boolean(inputValue)}); 
  }

  onMount(() => {
    inputValue = resolveDotpath($doc, valuePath);
  });

</script>

<template lang="pug">
  div(class="{$$props.class}")
    +if("$$props.label")
      label.flex1 {$$props.label}
    input(
      {...$$restProps} 
      type="checkbox" 
      bind:this="{inputElement}" 
      bind:checked="{inputValue}" 
      disabled="{disabled || !$doc.isOwner}"
      on:change="{update}"
    )

</template>

<style lang="sass" >
  .small 
    width: 14px
    height: 14px
  
</style>
