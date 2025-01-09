<svelte:options accessors={true} />

<script>
  import { onMount, getContext, createEventDispatcher } from "svelte";
  import { resolveDotpath, formatDotpath } from "~/src/helpers/paths";

  const dispatch = createEventDispatcher();

  export let options = void 0; //- {value: string, label: string}[]
  export let valuePath = "";
  export let document = false;
  export let preventDefault = false;
  export let disabled = false;
  export let label = "";
  export let callback = void 0;
  export let handleOwnUpdates = true;

  let inputValue = null, // Initialize to null to avoid preselection
    LABEL = !!label,
    inputElement,
    pulseClass = "";
    
  // Document reference
  const doc = document || getContext("#doc");

  const update = async () => {
    if (preventDefault) return;
    
    if (handleOwnUpdates) {
      const updateObj = { [formatDotpath(valuePath)]: inputValue }
      game.system.log.b('DocSelect:updateObj', updateObj);
      await $doc.update(updateObj);
      game.system.log.b($doc)
      if (callback) await callback(inputValue);
    } else {
      dispatch('change', { value: inputValue, path: valuePath });
    }
  };

  onMount(() => {
    inputValue = resolveDotpath($doc, valuePath);
  });
</script>

<select {...$$restProps} bind:value={inputValue} on:change={update} {disabled}>
  <!-- Placeholder option when nothing is selected -->
  <option value="" disabled selected={!inputValue}>Please select an option</option>
  
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
