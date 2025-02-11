<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let options = void 0;
  export let value = null;
  export let disabled = false;

  function handleChange(event) {
    dispatch('change', { value: event.target.value });
  }
</script>

<select {...$$restProps} on:change={handleChange} {disabled}>
  <!-- Placeholder option when nothing is selected -->
  <option value="" disabled selected={!value}>Please select an option</option>
  
  {#if options && options.length}
    {#each options as option}
      <option value={option.value}>
        {option.label}
      </option>
    {/each}
  {/if}
  <slot />
</select>

<style lang="sass">
  @use '../../../styles/_mixins' as mixins

  select 
    +mixins.input

    &:disabled 
      +mixins.input-disabled

    &.short
      height: inherit
</style> 