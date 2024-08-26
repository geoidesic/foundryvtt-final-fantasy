<script>
  import { getContext, onMount, tick } from "svelte";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { resolveDotpath } from "~/src/helpers/paths";

  export let placeholder = "";
  export let maxlength = "40";
  export let disabled = false;
  export let valuePath = "";
  export let label = "";
  export let document = false;
  export let editable = false;
  export let type = "standard";

  let inputValue,
    LABEL = !!label,
    inputElement,
    pulseClass = ""
    ;
  

  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(update, 500);

  function handleKeyDown(event, index) {
    if (event.key === "Enter") {
      event.preventDefault();
      inputElement.blur();
      editable = false;
    }
  }

  function handleBlur(event, index) {
      editable = false;
  }

  async function handleDblClick(event) {
    game.system.log.d(event);
    game.system.log.d('dblclick');
    editable = true; // or use  editable=!editable  to toggle
    await tick();

    inputElement.focus();
    inputElement.select();
  }

  async function update(event) {
    let val = event.target.value;
    if(type == 'number' && $$props.max !== undefined && val > $$props.max) {
      val = $$props.max;
      ui.notifications.warn(`Value cannot exceed ${$$props.max}`);
    }
    if(type == 'number' &&  $$props.min !== undefined && val < $$props.min) {
      val = $$props.min;
      ui.notifications.warn(`Value cannot exceed ${$$props.min}`);
    }
    inputValue = type == 'number' ? Number(val) : val;  // Update the local value
    await $doc.update({[valuePath]: val});   // Update the document value
    game.system.log.d(`Updated value: ${val}`);


  }

  $: inputValue = resolveDotpath($doc, valuePath);

  $: if(inputValue !== undefined) {
    inputValue = type == 'number' ? Number(inputValue) : inputValue;
    pulseClass = "pulse";
    setTimeout(() => pulseClass = "", 1000);
  }


  onMount(async () => {

  });
</script>

<template lang="pug">
div(on:dblclick!="{handleDblClick}")
  +if('LABEL')
    label {label}
  +if("editable")
    input({...$$restProps} type="{$$props.type}" bind:this="{inputElement}" value="{inputValue}" on:keydown="{handleKeyDown}" on:blur="{handleBlur}" on:input="{updateDebounce}" placeholder="{placeholder}" maxlength="{maxlength}")
    +else
      div({...$$restProps} class="{pulseClass}") {inputValue}
</template>


<style>
  /* CSS for the pulse effect */

  .pulse {
    transition: scale 0.5s ease-in-out;
    animation: pulse-animation 0.5s ease-in-out;
  }

  @keyframes pulse-animation {
    0% {
      scale: 1;
    }
    50% {
      scale: 1.5;
    }
    100% {
      scale: 1;
    }
  }
</style>