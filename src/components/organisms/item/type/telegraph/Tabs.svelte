<script>
  import { localize } from "#runtime/util/i18n";
  import { onMount, getContext } from "svelte";
  import { SYSTEM_CODE } from "~/src/helpers/constants.js";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Description from "~/src/components/organisms/item/shared/DescriptionTab.svelte";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
  import Details from "~/src/components/organisms/item/type/telegraph/tabs/Details.svelte";

  let activeTab = "description";
  
  const tabs = [
    { label: localize(`${SYSTEM_CODE}.ChatText`), id: "description", component: Description },
    { label: localize(`${SYSTEM_CODE}.Details`), id: "details", component: Details }
  ];
</script>

<template lang="pug">
.flex1.portrait-frame
  PortraitFrame.high.frame.wide
    Tabs.tabs.small.wide({tabs} bind:activeTab="{activeTab}")
</template>

<style lang="sass">
  @import '../../../../../styles/Mixins.sass'

  .portrait-frame
    margin-right: -2px
    z-index: 2
    height: calc(100% - 40px)
</style> 