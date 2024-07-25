<script>
import { onMount } from 'svelte';
import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
import ScrollingContainer from "~/src/helpers/svelte-components/ScrollingContainer.svelte";

</script>
<template lang='pug'>
ScrollingContainer
  ProseMirror( attr="system.biography.profile" )

</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
</style>