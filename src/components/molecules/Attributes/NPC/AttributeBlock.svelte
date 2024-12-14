<script>
  import { onMount } from "svelte";
  import { getSizeOptions } from "~/src/helpers/constants";
  import PrimaryAttributes from "~/src/components/molecules/Attributes/PrimaryAttributes.svelte";
  import SecondaryAttributes from "~/src/components/molecules/Attributes/SecondaryAttributes.svelte";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";

  const sizeOptions = getSizeOptions();


</script>

<template lang="pug">
.molecule
  .flexrow.sheet-row.justify-vertical
    .flex1.ml-md.mt-md.left.white
      label Size
    .flex1.mt-md.mr-md.right
      DocSelect.right.white(name="size" valuePath="system.size" options="{sizeOptions}")
  .flexrow

    .flex
      PrimaryAttributes
    .flex
      SecondaryAttributes

</template>

<style lang="sass">
  @import '../../../../styles/Mixins.sass'

  .molecule
    height: 100%
    width: 100%
    white-space: nowrap
</style>
