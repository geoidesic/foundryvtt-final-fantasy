<script>
  import { onMount, getContext, setContext } from "svelte";
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { localize } from "#runtime/svelte/helper";
  import { SYSTEM_ID } from "~/src/helpers/constants";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Changes from "~/src/components/tabs/activeEffect/Changes.svelte";
  import Config from "~/src/components/tabs/activeEffect/Config.svelte";
  export let elementRoot = void 0;
  
   const doc = getContext('#external').doc;
  // setContext("#doc", application.reactive.document);
  
  let activeTab = "details";
  
  const tabs = [
    { 
      label: localize('EFFECT.Config'), 
      id: "config", 
      component: Config,
      img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/cog.webp'
    },
    { 
      label: localize('EFFECT.Changes'), 
      id: "changes", 
      component: Changes,
      img: '/systems/foundryvtt-final-fantasy/assets/icons/tabs/list.webp'
    },
  ];

  onMount(() => {
    // Any initialization if needed
  });
</script>

<svelte:options accessors={true}/>

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    .effect-sheet
      Tabs.tabs.tall(tabs="{tabs}" bind:activeTab="{activeTab}")
</template>

<style lang="sass">
  .effect-sheet
    height: 100%
    :global(.window-content)
      padding: 0
    
    :global(.window-content > :global(.app))
      height: 100%
</style>
