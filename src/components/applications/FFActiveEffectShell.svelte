<script>
  import { onMount, getContext, setContext } from "svelte";
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Details from "~/src/components/tabs/activeEffect/Details.svelte";
  
  export let elementRoot = void 0;
  
   const doc = getContext('#external').doc;
  // setContext("#doc", application.reactive.document);
  
  let activeTab = "details";
  
  // const tabs = [
  //   { 
  //     label: localize('EFFECT.Details'), 
  //     id: "details", 
  //     component: Details,
  //     img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/spiral.webp'
  //   }
  // ];

  onMount(() => {
    // Any initialization if needed
  });
</script>

<svelte:options accessors={true}/>

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    .effect-sheet
      pre yo
      //- Tabs.tabs.tall(tabs="{tabs}" bind:activeTab="{activeTab}")
</template>

<style lang="sass">
  .effect-sheet
    height: 100%
    :global(.window-content)
      padding: 0
    
    :global(.window-content > :global(.app))
      height: 100%
</style>
