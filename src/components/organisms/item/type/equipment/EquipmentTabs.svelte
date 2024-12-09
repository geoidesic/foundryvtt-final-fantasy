<script>
  import { onMount, getContext } from "svelte";
  import { isParentActor} from "~/src/helpers/util";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import Effects from "~/src/components/organisms/item/shared/EffectsTab.svelte";
  import Description from "~/src/components/organisms/item/shared/DescriptionTab.svelte";
  import Details from "~/src/components/organisms/item/type/equipment/tabs/Details.svelte";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";

  let activeTab = "description";
  // Tabs
  let tabs = [
    { label: "description", id: "description", component: Description },
    { label: "effects", id: "effects", component: Effects },
  ];

  const item = getContext("#doc");

  onMount(async () => {
    game.system.log.d("EquipmentTabs item", item);
  });

  $: parentIsActor = isParentActor($item);
  $: if (parentIsActor) {
    tabs = [
      { label: "description", id: "description", component: Description },
      { label: "details", id: "details", component: Details },
      { label: "effects", id: "effects", component: Effects },
    ];
  }
</script>


<template lang="pug">

.flex1.portrait-frame
  PortraitFrame
    Tabs( {tabs} bind:activeTab="{activeTab}")
</template>

<style lang="sass">
  @import '../../../../../styles/Mixins.sass'
  .portrait-frame
    margin-right: -2px
    z-index: 2

  +background
</style>
  