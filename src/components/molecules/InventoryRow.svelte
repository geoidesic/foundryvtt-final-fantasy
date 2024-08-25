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
<li class="{$$restProps.class} flexrow justify-flexrow-vertical standard-list-row" >
  
  slot(name="c1")
  .flex4.left
    slot(name="c2" )
  .flex2
    slot(name="c3")
  .flex2
    slot(name="c4")
  .actions.flex.right(class="{!$doc.system.inventoryLocked ? '' : 'flex0'}")
    +if("!$doc.system.inventoryLocked")
      slot(name="c5")
      +else()
        div.rowbutton.rowimgbezelbutton.negative.pointer( on:click|preventDefault!="{toggle}")
          i.fa.fa-lock(style="{styleCss}" )

</li>
</template>

<style lang="sass" >
  .flexrow 
    gap: 2px




        
        

  //- li
  //-   padding: 3px
  //-   margin: 0 2px 2px 2px
  //-   align-items: center
  //-   border-radius: var(--border-radius)
    
  //-   &:not(.header):not(.footer)
  //-     background-color: #cdc8c7

  //-   &.header
  //-     padding: 2px 3px
  //-     line-height: 1rem
  //-     text-align: top
  //-     justify-content: top
  //-     border-bottom-left-radius: 0
  //-     border-bottom-right-radius: 0
  //-     margin-bottom: 0
  //-     border-bottom: none

</style>
