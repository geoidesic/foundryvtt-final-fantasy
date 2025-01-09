<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "#runtime/svelte/application";

  export let elementRoot;
</script>

<ApplicationShell bind:elementRoot />
