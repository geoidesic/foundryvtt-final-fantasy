<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { onMount } from 'svelte';

  export let tabs = [];

  // type of sheet
  export let sheet = void 0;
  export let activeTab = void 0;

  onMount(() => {
    activeTab = tabs[0].id;
    game.system.log.d("Tabs", tabs);
  });
  
</script>

<template lang="pug">
.tabs
  .tabs-list
    +each("tabs as tab")
      button.short.gold(
        class="{tab.id === activeTab ? 'active' : ''}"
        on:click|preventDefault!="{() => activeTab = tab.id}"
      ) 
        +if("!tab.img && !tab.icon")
          span {tab.label}
          +else
            +if("tab.img")
              img.tab-icon(src="{tab.img}" alt="{tab.label} tab icon")

  div(class="{`tab-content ${$$props?.class?.includes('small') ? 'tab-content--small' : ''} ${$$props?.class?.includes('tall') ? 'tab-content--tall' : ''}`}")
    +each("tabs as tab")
      +if("tab.id === activeTab")
        svelte:component(this="{tab.component}" sheet="{sheet}")
</template>

<style lang="sass">
  @use '../../styles/_mixins' as mixins
  .tab-icon
    border: none
    text-align: middle
    height: 35px



  .tabs
    .tabs-list
      a.button, button
        display: flex
        &.active
          outline: none
    +mixins.flex-column
    +mixins.flex-group-top
    +mixins.border
    height: 100%
    width: 100%
    background: url(/systems/foundryvtt-final-fantasy-XIV/assets/parchment4.webp) repeat
    overflow: hidden
    
    .tabs-list 
      +mixins.flex-row
      +mixins.flex-space-evenly
      +mixins.border-bottom
      +mixins.panel-1
      list-style: none
      width: 100%
      margin: 0
      padding: 0.25rem
      height: 100%
      flex: 0

      button 
        --color-shadow-primary: var(--border-shadow)
        position: relative
        overflow: hidden
        clip-path: var(--tjs-icon-button-clip-path, none)
        transform-style: preserve-3d
        letter-spacing: 2px
        height: 100%
        font-weight: normal
        font-family: "Cinzel", serif
        margin: 0 2px
        background: rgba(216, 214, 203, 0.8)
        width: 100%
        text-shadow: 0px 0px 1px var(--color-shadow-primary)
        // background: rgba(0, 0, 0, 0.1)
        padding: 0.5rem 0
        -webkit-text-stroke-width: 0.5px
        -webkit-text-stroke-color: rgba(100, 0, 0, 0.1)
        border: none
        // &:not(:first-child) 
        //   border-left: none
        // color: var(--ff-border-color)
        opacity: 0.4

        transition: opacity 0.5s ease-out

        &:hover
          box-shadow: 0 -7px 15px -6px var(--color-shadow-primary)
          opacity: 1
        //   // color: var(--ff-border-color)
        //   box-shadow: none
        //   &:not(:disabled) 
        //     clip-path: var(--tjs-icon-button-clip-path-hover, var(--tjs-icon-button-clip-path, none))

        &.active
          box-shadow: 0 -7px 15px -6px var(--color-shadow-primary)
          // box-shadow: 0 -7px 15px -5px var(--ff-border-color)
          z-index: 100
          opacity: 1
          // text-decoration: underline
          // border: 4px ridge var(--ff-border-color)
          // border-bottom: 1px solid transparent !important
          // box-shadow: none

        img
          margin-top: -4px
    .tab-content
      z-index: 1
      // background: url(../ui/parchment.jpg) repeat
      border: 1px solid transparent
      border-radius: 10px
      flex: 2
      width: 100%

      +mixins.flex-column
      &.tab-content--tall
        height: calc(100% - 60px)
      &.tab-content--small
        height: calc(100% - 20px)

        
</style>
