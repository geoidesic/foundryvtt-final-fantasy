<script>
  import { onMount, getContext } from "svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import { localize } from "#runtime/svelte/helper"; // Import the localize function

  let levelEnabled = false;

  const actor = getContext("#doc");

  //- truncate everything after and including the first space
  $: jobName = $actor.system.job.name.split(' ')[0].toUpperCase();
  $: roleName = $actor.system.job.role.toUpperCase();
  $: level = $actor.system.job.level;

  onMount(() => {
    // console.log('TitleBlock mounted');
  });

  async function rest(event) {
    const confirmed = await Dialog.confirm({
      title: "",
      content: localize("FF15.TitleBlock.ConfirmRest"),
      yes: async () => {
        await $actor.update({
          system: {
            points: {
              MP: { val: $actor.system.points.MP.max },
              HP: { val: $actor.system.points.HP.max },
            },
            BP: { val: $actor.system.points.BP.max },
          },
        });
        ui.notifications.info(localize("FF15.TitleBlock.PointsRestored")); // Use localized string
      },
      no: () => {},
    });
  }
</script>

<template lang="pug">
.panel.heightcol
  .flexrow
    .flex2
      .flexrow.nowrap.justify-vertical.container(style="min-width: 150px")
        .flex0.rest
          button.stealth.rest-button(on:click|preventDefault="{rest}" data-tooltip="{localize('FF15.TitleBlock.Rest')}" aria-label="{localize('FF15.TitleBlock.Rest')}")
            img.rest-icon(src="systems/foundryvtt-final-fantasy/assets/icons/tabs/tent.webp")
        .flex1.right.mr-lg
          label.scaleup.widebold.font-inter.glow.white.inline-block LV
        .flex1.left.ml-lg
          label.scaleup.widebold.font-inter.glow.white.inline-block {level}
          //- input.font-inter(style="font-size: 2em;" name="level" id="level")
          //- DocInput.widebold.white.wide.font-inter(bind:enabled="{levelEnabled}" type="number" name="level" min=0 valuePath="system.job.level" textClasses="glow widebold scaleupint white ml-md")

    .flex3
      .flexrow.nowrap.mr-xl.mt-xxs.ml-xxl
        .flex4.job.right.white.wide.widebold.glow.pr-sm {roleName}
          //- DocInput.white.wide.widebold( type="text" name="role" valuePath="system.job.role" textClasses="glow white wide")
        .flex0.middle /
        .flex4.job.left.white.wide.widebold.glow.pl-sm {jobName}
          //- DocInput.white.wide.widebold( type="text" name="job" valuePath="system.job.name" textClasses="glow white wide")

</template>

<style lang="sass">
  @import '../../styles/Mixins.sass'
  :global(.FF15 .job input)
    font-size: 1em
      
  .job
    font-family: "Cinzel", serif
    font-size: 2em
    
  .middle
    font-size: 2em
    font-weight: 500
    color: #fff

  .rest
    text-align: left
    margin: 2px 15px 0 0
    padding: 0

    @container (min-width: 200px) 
      margin: 4px -40px 0 0
    


    .rest-button
      max-height: 35px
    .rest-icon
      max-width: 35px
      border: none
      height: 35px
      width: 35px

    .lv
    .level

  .container 
    container-type: inline-size
  
</style>
