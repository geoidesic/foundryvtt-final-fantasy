<script>
  import { getContext, onMount, tick } from "svelte";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { resolveDotpath } from "~/src/helpers/paths";
  import { editableDocNode } from "~/src/helpers/util";

  export let placeholder = "";
  export let maxlength = "40";
  export let disabled = false;
  export let inputType = "text";
  export let valuePath = "";
  export let label = "";
  export let document = false;
  export let editable = false;

  let data;
  let inputValue;
  let LABEL = !!label;
  let type = "standard";
  let inputElement

  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(update, 500);

  function handleKeyDown(event, index) {
    if (event.key === "Enter") {
      event.preventDefault();
      inputElement.blur();
      editable = false;
    }
  }

  async function handleDblClick(event) {
    game.system.log.d(event);
    game.system.log.d('dblclick');
    editable = true; // or use  editable=!editable  to toggle
    await tick();

    inputElement.focus();
    inputElement.select();
  }

  function update(event) {
    const val = event.target.value;
    inputValue = val;  // Update the local value
    data.set(val);  // Update the document value
    game.system.log.d(`Updated value: ${val}`);
  }

  onMount(async () => {
    game.system.log.d("DocInput mounted");
    game.system.log.d($doc);
    data = editableDocNode($doc, valuePath);
    inputValue = data.get();  // Initialize inputValue with the current document value

    game.system.log.d(inputValue);
    game.system.log.d($$restProps);
    game.system.log.d($$props);


  });
</script>

<template lang="pug">
div(on:dblclick!="{handleDblClick}")
  +if('LABEL')
    label {label}
  +if("editable")
    input({...$$restProps} bind:this="{inputElement}" type="{inputType}" value="{inputValue}" on:keydown="{handleKeyDown}" on:input="{updateDebounce}" placeholder="{placeholder}" maxlength="{maxlength}")
    +else
      div({...$$restProps}) {inputValue}
</template>
