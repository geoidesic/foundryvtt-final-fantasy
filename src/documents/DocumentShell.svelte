<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "#runtime/svelte/component/application";

  export let elementRoot;
</script>

<ApplicationShell bind:elementRoot />
