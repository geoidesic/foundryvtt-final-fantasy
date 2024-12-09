<script>
  import { onMount, getContext } from "svelte";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import Effects from "~/src/components/organisms/item/shared/EffectsTab.svelte";
  import Description from "~/src/components/organisms/item/shared/DescriptionTab.svelte";
  import Details from "~/src/components/organisms/item/type/limitbreak/tabs/Details.svelte";
  let activeTab = "description";
  // Tabs
  const tabs = [
    // { label: "description", id: "description", component: Description },
    { label: "details", id: "details", component: Details },
    { label: "effects", id: "effects", component: Effects },
  ];

</script>

<template lang="pug">
  Tabs.gold( {tabs} bind:activeTab="{activeTab}")
</template>

<style lang="sass">
  @import '../../../../../styles/Mixins.sass'

</style>
