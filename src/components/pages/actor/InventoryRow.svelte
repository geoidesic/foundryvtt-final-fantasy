<script>
    import { getContext, onMount } from "svelte";
    export let index = -1;
    export let toggleLock = () => {}

    const doc = getContext("#doc");

    $: styleCss = index > -1 ? 'visibility: hidden' : 'cursor: pointer';

    function toggle(event) {
      if(index === -1) toggleLock(event);
    }
</script>

<template lang="pug">
<li class="{$$restProps.class} flexrow" >
    div.flex0
      slot(name="c1")
    .flex3.left.ml-xl
      slot(name="c2")
    .flex1
      slot(name="c3")
    .flex1
      slot(name="c4")
    .actions.right(class="{!$doc.system.inventoryLocked ? '' : 'flex0'}")
      +if("!$doc.system.inventoryLocked")
        slot(name="c5")
        +else()
          div.rowbutton.rowimgbezelbutton.negative.pointer( on:click|preventDefault!="{toggle}")
            i.fa.fa-lock(style="{styleCss}" )

</li>
</template>

<style lang="scss" >
  .flexrow {
    gap: 2px;
  }
</style>
