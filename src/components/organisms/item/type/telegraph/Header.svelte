<script>
  import { onMount, getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";

  const item = getContext("#doc");
</script>

<template lang="pug">
  .item-header
    .flexcol.description-tab
      .flexrow
        .flexcol.flex1.left
          ol.properties-list
            li.bg-gold.white.border-gold Telegraph
            +if("$item.system.source")
              li Source: {$item.system.source}
            +if("$item.system.controller")
              li Controller: {$item.system.controller}
            li Classification: {$item.system.classification === 'fixed' ? 'Fixed Telegraph' : 'Movable Telegraph'}
            +if("$item.system.origin")
              li Origin: {$item.system.origin}
            +if("$item.system.range")
              li Range: {$item.system.range}
            +if("$item.system.target")
              li Target: {$item.system.target}
            +if("$item.system.activationTrigger")
              li Trigger: {$item.system.activationTrigger}
</template>

<style lang="sass">
  @import '../../../../../styles/Mixins.sass'

  .description-tab
    +itemSheetDescriptionTab
</style> 