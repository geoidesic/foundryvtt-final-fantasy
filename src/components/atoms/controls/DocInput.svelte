<script>
  import { getContext, onMount, tick, createEventDispatcher } from "svelte";
  import { Timing } from "#runtime/util";
  import { resolveDotpath } from "~/src/helpers/paths";

  const dispatch = createEventDispatcher();

  // For empty state display
  export let placeholder = "--";
  // For input length constraints
  export let maxlength = "40";
  // For targeting specific document properties
  export let valuePath = "";
  // For accessibility and form organization
  export let label = "";
  // When you need to override the default document context
  export let document = false;
  // For controlling edit state
  export let editable = false;
  // For input validation and formatting
  export let type = "standard";
  // For controlling click behavior
  export let clickType = "click";
  // For visual feedback when values change
  export let pulse = false;
  // For real-time update behavior
  export let updateOnInput = false;
  // For controlling input state
  export let enabled = false;
  // For custom styling of the output text
  export let textClasses = "";
  // For cases where you want the input to always be in edit mode
  export let alwaysEditable = false;
  // For layout control
  export let fullWidth = false;
  // For UX patterns where immediate updates would be disruptive
  export let updateOnBlur = false;
  // Set to false when DocInput should not update the document directly
  export let handleOwnUpdates = true;

  let inputValue,
    LABEL = !!label,
    inputElement,
    pulseClass = "",
    initialRender = true,
    internalUpdate = false,
    externalValue,
    displayValue = "";

  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(update, 500);

  function handleKeyDown(event, index) {
    game.system.log.d('DocInput keydown: ' + event.key);
    if (!updateOnBlur && event.key === "Enter") {
        event.preventDefault();
        inputElement.blur();
        editable = false;
        update(event);
    }
  }

  function handleBlur(event, index) {
    game.system.log.d('DocInput blurring');
    if (!alwaysEditable) {
      editable = false;
      enabled = false;
    }
    if (updateOnBlur) {
      if (handleOwnUpdates) {
        update(event);
      } else {
        dispatch('change', { value: event.target.value, path: valuePath });
      }
    }
  }

  async function enableInput(event) {
    if(enabled || alwaysEditable) return;
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
    internalUpdate = true;
    let val = event.target.value;
    if(type == 'number' && $$props.max !== undefined && val > $$props.max) {
      val = $$props.max;
      ui.notifications.warn(`Value cannot exceed ${$$props.max}`);
    }
    if(type == 'number' &&  $$props.min !== undefined && val < $$props.min) {
      val = $$props.min;
      ui.notifications.warn(`Value cannot exceed ${$$props.min}`);
    }
    inputValue = type == 'number' ? Number(val) : val;

    if (handleOwnUpdates) {
      await $doc.update({[valuePath]: val});
      if (pulse) {
        pulseClass = "pulse";
        setTimeout(() => pulseClass = "", 1000);
      }
      enabled = false;
    } else {
      dispatch('change', { value: val, path: valuePath });
    }
    internalUpdate = false;
  }

  $: {
    if (!internalUpdate) {
      externalValue = resolveDotpath($doc, valuePath) ?? "";
    }
  }

  $: {
    if (!internalUpdate && !initialRender && externalValue !== inputValue) {
      inputValue = type == 'number' ? Number(externalValue) : externalValue;
    }
  }

  $: {
    displayValue = inputValue === undefined || inputValue === '' || inputValue == 0 ? '' : inputValue;
  }

  $: isEmpty = inputValue === '';
  $: hasFocus = inputElement === document.activeElement;
  $: editable = alwaysEditable || editable;

  onMount(async () => {
    const resolved = resolveDotpath($doc, valuePath);
    inputValue = resolved ?? "";
    
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
+if("alwaysEditable")
  .flexrow.gap-15(class="{fullWidth ? 'wide' : ''}")
    +if("LABEL")
      .flex1.wide
        label.bold.gold(for="{inputElement?.id}") {label} 
    .flex5.wide
    
      input({...$$restProps} type="{$$props.type}" bind:this="{inputElement}" value="{inputValue}" on:keydown|stopPropagation="{handleKeyDown}" on:input|stopPropagation!="{updateOnInput ? updateDebounce : () => {}}" on:blur|stopPropagation="{handleBlur}" placeholder="{placeholder}" maxlength="{maxlength}")
+if("!alwaysEditable")
  button.stealth(class="{$$props?.class?.includes('widebutton') ? 'wide' : ' ' + $$props?.class?.includes('left') ? 'left' : ' '}" on:click!="{clickType=='click' ? enableInput : () => {}}")
    .flexrow.gap-15.wide.doc-input
      +if("LABEL")
        .flex1.wide
          label.bold.gold(for="{inputElement?.id}") {label} 
      +if("editable")
        .flex5.wide
          input({...$$restProps} type="{$$props.type}" bind:this="{inputElement}" value="{inputValue}" on:keydown|stopPropagation="{handleKeyDown}" on:input|stopPropagation!="{updateOnInput ? updateDebounce : () => {}}" on:blur|stopPropagation="{handleBlur}" placeholder="{placeholder}" maxlength="{maxlength}")
        +else
          .output(class="{pulseClass} {textClasses}" class:empty="{isEmpty}") {inputValue ? inputValue : placeholder}
</template>

<style lang="sass">
  @use '../../../styles/_mixins' as mixins
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

  .wide
    width: 100%

  input
    width: 100%
    background-color: white
    height: 1.5rem
    border: 1px solid #ccc
    border-radius: 3px
    padding: 0 0.5rem
</style>