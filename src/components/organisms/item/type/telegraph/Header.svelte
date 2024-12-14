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
              li {$item.system.controller}
            +if("$item.system.classification")
              li {$item.system.classification}
            +if("$item.system.origin")
              li {$item.system.origin}
            +if("$item.system.range")
              li {$item.system.range}
            +if("$item.system.target")
              li {$item.system.target}
            +if("$item.system.activationTrigger")
              li {$item.system.activationTrigger}
</template>

<style lang="sass">
  @import '../../../../../styles/Mixins.sass'

  .description-tab
    +itemSheetDescriptionTab
</style> 