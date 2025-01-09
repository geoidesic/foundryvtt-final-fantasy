<script>
import { onMount, getContext } from 'svelte';
import { SYSTEM_ID } from "~/src/helpers/constants";
import PrimaryAttributes from "~/src/components/molecules/Attributes/PrimaryAttributes.svelte";
import SecondaryAttributes from "~/src/components/molecules/Attributes/SecondaryAttributes.svelte";
import RollCalcActor from "~/src/helpers/RollCalcActor";

const actor = getContext("#doc");
const RollCalc = new RollCalcActor({ actor: $actor });

const onclick = async (key, code) => {
  await RollCalc.attribute(key, code);
}

</script>
<template lang='pug'>
  .molecule.flexrow
    .flex
      PrimaryAttributes(onclick="{onclick}")
    .flex
      SecondaryAttributes(onclick="{onclick}")
    
</template>
<style lang='sass'>
  @use '../../../styles/_mixins' as mixins

  .molecule
    height: 100%
    width: 100%
    white-space: nowrap
</style>