<script>
  import { getContext } from "svelte";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher } from "svelte";
  import { generateRandomElementId } from "~/src/helpers/util";

  const dispatch = createEventDispatcher();

  export let attr = void 0;
  export let label = "";
  export let placeholder = "";
  export let maxlength = "40";
  export let className = "";
  export let document = false;
  export let inputType = "text";
  export let id = generateRandomElementId()

  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(update, 300);

  console.log(doc); //TJSDocument
  console.log($doc); //Item

  let data;
  let LABEL = !!label;
  let type = "standard";
  const split = attr.split(".");

  $: if (attr.includes("system.")) {
    data = $doc?.system?.[split[1]] || placeholder;
  } else {
    data = $doc?.[attr] || placeholder;
  }

  async function update(event) {
    console.log("event", event);

    if ($doc && event.target.value) {
      await $doc.update({ [attr]: event.target.value });
    }
    dispatch("input", event.target.value);
  }
</script>

<template lang="pug">
  div.flexcol
    +if('LABEL')
      label(for="{id}") {label}
    input.flex3(type="{inputType}" name="{label}" id="{id}" class="{className}" value="{data}" on:input="{updateDebounce}" placeholder="{placeholder}" maxlength="{maxlength}")
</template>

<style lang="scss" scoped>
</style>
