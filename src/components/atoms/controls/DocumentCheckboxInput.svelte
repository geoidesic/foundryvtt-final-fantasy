<svelte:options accessors={true} />

<script>
  import { getContext } from "svelte";

  const document = getContext("#doc");

  export let value;
  export let preventDefault = false;
  export let disabled = false;

  $: game.system.log.d('value', value);
  
  // game.system.log.d('$$props', $$props);
  // game.system.log.d('$$restProps', $$restProps);
</script>

<div class={$$props.class}>
  {#if $$props.label}
    <label class="flex1">{$$props.label}</label>
  {/if}
  <input
    type="checkbox"
    bind:checked={value}
    disabled={disabled || !$document.isOwner}
    on:change
    on:change={async () => {
      if (preventDefault) return;
      $document.update({
        system: $document.system,
        flags: $document.flags,
      });
    }}
  />
</div>

<style lang="scss" >
  .small {
    width: 14px;
    height: 14px;
  }
</style>
