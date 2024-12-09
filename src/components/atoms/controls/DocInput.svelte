<script>
  import { getContext, onMount, tick } from "svelte";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { resolveDotpath } from "~/src/helpers/paths";

  export let placeholder = "--";
  export let maxlength = "40";
  export let valuePath = "";
  export let label = "";
  export let document = false;
  export let editable = false;
  export let type = "standard";
  export let clickType = "click";
  export let pulse = false;
  export let updateOnInput = false;
  export let enabled = false;
  export let textClasses = "";

  let inputValue,
    LABEL = !!label,
    inputElement,
    pulseClass = "",
    initialRender = true
  ;

  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(update, 500);

  function handleKeyDown(event, index) {
    game.system.log.d('DocInput keydown: ' + event.key);
    if (event.key === "Enter") {
        event.preventDefault();
        inputElement.blur();
        editable = false;
        update(event);
    }
    
  }

  function handleBlur(event, index) {
    return;
    game.system.log.d('DocInput blurring');
    editable = false;
    enabled = false;
  }

  async function enableInput(event) {
    if(enabled) return;
    enabled = true;
    console.log('enableInput', event);
    if (event.key === 'Space') {
        console.log('space');
        event.preventDefault();
        return;
    }
    editable = true;
    await tick();

    inputElement.focus();
    inputElement.select();

  }
 
  function handleButtonKeyDown(event) {
    if (event.key === " ") {
        event.preventDefault(); // Prevent space from triggering the button click
    }
}

  async function update(event) {
    game.system.log.d('DocInput updating value: ' + `${event.target.value}`);
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

    // Apply pulse animation only when update is triggered by user interaction
    if(pulse) {
      pulseClass = "pulse";
      setTimeout(() => pulseClass = "", 1000);
    }
    enabled = false;
  }

  $: {
    let newValue = resolveDotpath($doc, valuePath);
    if (!initialRender && newValue !== inputValue) {
      inputValue = type == 'number' ? Number(newValue) : newValue;
    }
  } 
  $: displayValue = inputValue === '' || inputValue == 0 ? '' : inputValue;
  $: isEmpty = inputValue === '';
  $: hasFocus = inputElement === document.activeElement;

  onMount(async () => {
    inputValue = resolveDotpath($doc, valuePath);
    initialRender = false;
    if($$props.type == 'number') {
      inputValue = Number(inputValue);
      if( placeholder == '--'){
        placeholder = 0;
      }
    }
  });

</script>

<template lang="pug">
button.stealth(class="{$$props?.class?.includes('wide') ? 'wide' : ' '} + {$$props?.class?.includes('left') ? 'left' : ' '}" on:click!="{clickType=='click' ? enableInput : () => {}}")
  .flexrow.gap-15.wide
    +if('LABEL')
      .flex1.wide
        label.bold.gold(for="{inputElement?.id}") {label} 
    +if("editable")
      .flex5.wide
        input({...$$restProps} type="{$$props.type}" bind:this="{inputElement}" value="{inputValue}" on:keydown|stopPropagation="{handleKeyDown}" on:input|stopPropagation!="{updateOnInput ? updateDebounce : () => {}}" on:blur|stopPropagation="{handleBlur}" placeholder="{placeholder}" maxlength="{maxlength}")
      +else
        .output( class="{pulseClass} {textClasses}" class:empty="{inputValue === ''}") {displayValue || placeholder}
</template>

<style lang="sass">
  @import '../../../styles/Mixins.sass'
  /* CSS for the pulse effect */
  .pulse 
    transition: scale 0.5s ease-in-out
    animation: pulse-animation 0.5s ease-in-out

  @keyframes pulse-animation 
    0% 
      scale: 1
    
    50% 
      scale: 1.5
    
    100% 
      scale: 1
      
  button.stealth
    font-family: inherit
    font-size: inherit
    color: inherit
    margin: inherit
    letter-spacing: inherit
    text-shadow: inherit

  div.empty 
    width: 100%
    min-height: 1em
    display: inline-block
    border: 1px solid #aaa
    border-radius: var(--border-radius)

  .output:not([type="checkbox"])
    // margin-right: 0.5em

  
</style>