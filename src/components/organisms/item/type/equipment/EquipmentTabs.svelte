<script>
  import { onMount, getContext } from "svelte";
  import { isParentActor} from "~/src/helpers/util";
  import { SYSTEM_CODE } from "~/src/helpers/constants.js";
  import { localize } from "#runtime/util/i18n";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import Effects from "~/src/components/organisms/item/shared/EffectsTab.svelte";
  import Description from "~/src/components/organisms/item/shared/DescriptionTab.svelte";
  import Details from "~/src/components/organisms/item/type/equipment/tabs/Details.svelte";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";

  let activeTab = "description";
  // Tabs
  let tabs = [
    { label: localize(`${SYSTEM_CODE}.Description`), id: "description", component: Description },
    { label: localize(`${SYSTEM_CODE}.Details`), id: "details", component: Details },
    { label: localize(`${SYSTEM_CODE}.Effects`), id: "effects", component: Effects }
  ];

  const item = getContext("#doc");

  onMount(async () => {
    game.system.log.d("EquipmentTabs item", item);
  });

  $: parentIsActor = isParentActor($item);
  $: if (parentIsActor) {
     tabs = [
    { label: localize(`${SYSTEM_CODE}.Description`), id: "description", component: Description },
    // { label: localize(`${SYSTEM_CODE}.Details`), id: "details", component: Details },
    // { label: localize(`${SYSTEM_CODE}.Effects`), id: "effects", component: Effects },
  ];
  }
</script>


<template lang="pug">

.flex1.portrait-frame
  PortraitFrame
    Tabs( {tabs} bind:activeTab="{activeTab}")
</template>

<style lang="sass">
  @use '../../../../../styles/_mixins' as mixins
  .portrait-frame
    margin-right: -2px
    z-index: 2
    height: calc(100% - 40px)

</style>
  