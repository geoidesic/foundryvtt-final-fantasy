<script>
  export let type = '';
  
  $: badgeClasses = type ? `badge-${type}` : '';
</script>

<template lang="pug">
.badge(class="{badgeClasses}")
  slot
</template>

<style lang="sass">
@use '../../styles/_mixins' as mixins


.badge
  align-items: center
  justify-content: center
  padding: 0.25rem 0.5rem
  border-radius: 0.25rem
  font-size: 0.75rem
  color: #fff
  font-weight: 600
  line-height: 1
  white-space: nowrap
  background-color: var(--color-text-dark-inactive)
  &.round
    display: none
    padding: 0.25rem
    min-width: 1.5rem
    min-height: 1.5rem

.badge-success
  background-color: var(--color-positive)

.badge-warning
  background-color: var(--color-warning)

.badge-danger
  background-color: var(--color-negative)

.badge-primary
  background-color: rgb(205, 83, 110)

.badge-secondary
  background-color: rgb(205, 83, 110)
</style> 