<script>
  import StarRating from '~/src/components/molecules/StarRating.svelte';
  import { localize } from '~/src/helpers/util';
  export let penalty = 0;
  export let bonusDice = 0;

  // Make the state accessible to the parent dialog
  $: if (window._modifierDialogComponent) {
    window._modifierDialogComponent._state = { penalty, bonusDice };
  }

  function handlePenaltyChange(value) {
    penalty = value;
    if (value > 0) bonusDice = 0;
  }

  function handleBonusChange(value) {
    bonusDice = value;
    if (value > 0) penalty = 0;
  }
</script>

<form class="modifier-dialog">
  <div class="flexrow">
    <div class="flexcol">
      <svelte:component 
        this={StarRating}
        label={localize('Modifiers.Penalty')}
        value={penalty}
        on:change={e => handlePenaltyChange(e.detail)}
        maxStars={6}
        icon="fas fa-burst"
        activeColor="var(--color-negative)"
      />
    </div>
    <div class="flexcol">
      <svelte:component 
        this={StarRating}
        label={localize('Modifiers.Advantage')}
        value={bonusDice}
        on:change={e => handleBonusChange(e.detail)}
        maxStars={6}
        icon="fas fa-dice-d20"
        activeColor="var(--ff-border-color)"
      />
    </div>
  </div>
</form>

<style lang="sass">
  .modifier-dialog
    padding: 1rem
    
  :global(.flexrow)
    display: flex
    flex-direction: row
    flex-wrap: wrap
    justify-content: space-between
    gap: 1rem
    
  :global(.flexcol)
    flex: 1
    padding: 0.5rem
</style> 