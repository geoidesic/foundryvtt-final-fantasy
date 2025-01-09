<script>
  import { onMount } from 'svelte';
  import HP from "~/src/components/molecules/Points/HP.svelte";
  
  </script>
  <template lang='pug'>
    section.organism
      .flexrow.section
        .flex.hp.pa-md
          HP
        
  </template>
  <style lang='sass'>
    @use '../../../styles/_mixins' as mixins
  
    .section
      width: 100%
      position: relative
      overflow: hidden
      border-bottom: 4px ridge var(--ff-border-color)
      border-left: 4px ridge var(--ff-border-color)
      border-right: 4px ridge var(--ff-border-color)
  
    .hp
      position: relative
      background: linear-gradient(to right, rgb(171, 67, 125), rgb(205, 139, 171))
      clip-path: polygon(0 0, 100% 0, 100% 50%, 80% 100%, 0 100%)
  
    .mp
      position: relative
      background: linear-gradient(to right, rgb(58 158 68), rgb(174 206 106))
      clip-path: polygon(0 0, 100% 0, 100% 50%, 80% 100%, 0 100%)
  
    .bp
      position: relative
      background: linear-gradient(to right, rgb(177 144 113), rgb(255 212 171))
      clip-path: polygon(0 0, 100% 0, 100% 50%, 80% 100%, 0 100%)
  
  </style>
  