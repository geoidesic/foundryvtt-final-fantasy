<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { onMount } from 'svelte';

  export let tabs = [];

  // type of sheet
  export let sheet;
  export let activeTab = void 0;
  export let efx = ripple();

  onMount(() => {
    activeTab = tabs[0].id;
    log.d("Tabs", tabs);
  });
</script>

<template lang="pug">
.tabs
  .tabs-list
    +each("tabs as tab")
      button(
        class="{tab.id === activeTab ? 'active' : ''}"
        on:click|preventDefault!="{() => activeTab = tab.id}"
        transition:efx
      ) {tab.label}
  .tab-content
    +each("tabs as tab")
      +if("tab.id === activeTab")
        svelte:component(this="{tab.component}" sheet="{sheet}")
</template>

<style lang="sass">
  @import "../../styles/Mixins.sass"

  .tab-content 
    @include flex-column
    flex: 2
    height: 100%
    width: 100%

  .tabs 
    @include flex-column
    @include flex-group-top
    @include border
    height: 100%
    width: 100%
    .tab-content
      margin-top: -8px
    .tabs-list 
      @include flex-row
      @include flex-space-evenly
      @include border-bottom
      @include panel-1
      list-style: none
      width: 100%
      margin: 0
      padding: 0.25rem
      height: 100%
      flex: 0

      button 
        --button-border-radius: 5px
        --button-line-height: var(--tab-line-height)
        --button-font-size: var(--tab-font-size)
        --button-color: var(--tab-text-color)
        --button-hover-background-color: var(--border-color)
        --button-focus-outline-color: var(--border-color)
        --color-shadow-primary: var(--border-shadow)
        --button-border-radius: 0
        --button-padding: 0 0 1px 0
        --button-border-style: solid
        --button-border-color: transparent
        --button-font-weight: bold
        position: relative
        overflow: hidden
        clip-path: var(--tjs-icon-button-clip-path, none)
        transform-style: preserve-3d
        letter-spacing: 2px
        height: 100%
        font-weight: normal
        font-family: "Cinzel", serif
        margin: 0 2px
        width: 100%
        text-shadow: 0px 0px 1px var(--color-shadow-primary)

        -webkit-text-stroke-width: 0.5px
        -webkit-text-stroke-color: rgba(100, 0, 0, 0.1)
        // &:not(:first-child) 
        //   border-left: none

        &:hover 
          --button-border-style: ridge
          --button-border-color: var(--border-color)

        //   // color: var(--border-color)
        //   box-shadow: none
        //   &:not(:disabled) 
        //     clip-path: var(--tjs-icon-button-clip-path-hover, var(--tjs-icon-button-clip-path, none))

        &.active
          --button-border-style: ridge
          --button-border-color: var(--border-color)

          // background: var(--border-color)
          // color: var(--border-color)

        @include button
        
</style>
