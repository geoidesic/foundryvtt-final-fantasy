<script>
  import { createEventDispatcher } from 'svelte';

  export let maxStars = 5;
  export let icon = 'fas fa-star';
  export let value = 0;
  export let label = '';
  export let activeColor = '#ffd700';

  let hoverValue = 0;
  const dispatch = createEventDispatcher();

  function handleMouseOver(index) {
    hoverValue = index + 1;
  }

  function handleMouseLeave() {
    hoverValue = 0;
  }

  function handleClick(index) {
    value = index + 1;
    dispatch('change', value);
  }

  $: stars = Array(maxStars).fill(0).map((_, i) => ({
    active: hoverValue ? i < hoverValue : i < value
  }));
</script>

<div class="star-rating" on:mouseleave={handleMouseLeave} role="group" aria-label={label || 'Rating'}>
  {#if label}
    <label for="star-rating-group">{label}</label>
  {/if}
  <div class="stars" id="star-rating-group">
    {#each stars as star, i}
      <i
        class="{icon} {star.active ? 'active' : ''}"
        on:mouseover={() => handleMouseOver(i)}
        on:focus={() => handleMouseOver(i)}
        on:click={() => handleClick(i)}
        on:keydown={e => e.key === 'Enter' && handleClick(i)}
        role="button"
        tabindex="0"
        style="--active-color: {activeColor}"
        aria-label="{i + 1} of {maxStars} stars"
      ></i>
    {/each}
  </div>
</div>

<style lang="sass">
  .star-rating
    display: flex
    flex-direction: column
    gap: 0.5rem

  .stars
    display: flex
    gap: 0.25rem

  i
    cursor: pointer
    color: #666
    transition: color 0.2s ease
    font-size: 1.2rem

    &.active
      color: var(--active-color)

    &:hover
      transform: scale(1.1)
</style> 