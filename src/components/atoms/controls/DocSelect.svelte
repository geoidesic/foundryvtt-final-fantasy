<svelte:options accessors={true} />

<script>
  import { onMount, getContext } from "svelte";
  import { resolveDotpath } from "~/src/helpers/paths";

  export let options = void 0; //- {value: string, label: string}[]
  export let valuePath = "";
  export let document = false;
  export let preventDefault = false;
  export let disabled = false;
  export let label = "";
  export let editable = false;

  let inputValue,
    LABEL = !!label,
    inputElement,
    pulseClass = "";
    
  // Document reference
  const doc = document || getContext("#doc");

  const update = async () => {
    if (preventDefault) return;
    await $doc.update({ [valuePath]: Boolean(inputValue) });
  };

  onMount(() => {
    inputValue = resolveDotpath($doc, valuePath);
  });
</script>

<select {...$$restProps} bind:value={inputValue} on:change={update} {disabled}>
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
  @import "../../../styles/Mixins.sass"

  select 
    @include input

    &:disabled 
      @include input-disabled

    &.short
      height: inherit
</style>
