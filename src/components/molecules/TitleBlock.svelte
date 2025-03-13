<script>
  import { onMount, getContext } from "svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  import { localize } from "~/src/helpers/util";

  let levelEnabled = false;

  const actor = getContext("#doc");

  //- truncate everything after and including the first space
  $: jobName = $actor.system.job?.name.split(' ')[0].toUpperCase();
  $: roleName = $actor.system.job?.role.toUpperCase();
  $: level = $actor.system.job?.level || ''
  $: hasJob = $actor.system.job?.name ? true : false;

  onMount(() => {
    // console.log('TitleBlock mounted');
  });

  async function rest(event) {
    const confirmed = await Dialog.confirm({
      title: "",
      content: localize("TitleBlock.ConfirmRest"),
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
        ui.notifications.info(localize("TitleBlock.PointsRestored")); // Use localized string
      },
      no: () => {},
    });
  }
</script>

<template lang="pug">
.px-sm.panel.pt-xs.containerx.wide
  .flexrow
    .flex4.no-wrap
      .flexrow.no-wrap
        .flex1.rest-button
          .left.mt-xxs
            button.stealth(on:click|preventDefault="{rest}" data-tooltip="{localize('TitleBlock.Rest')}" aria-label="{localize('TitleBlock.Rest')}")
              img.rest-icon(src="/systems/foundryvtt-final-fantasy/assets/icons/tabs/tent.webp" alt="{localize('TitleBlock.Rest')}")

        .flex4.nowrap.font-inter.lvcontainer.glow
          .scaleup {localize('LV')} 
          .scaleup {level}

    .flex4.no-wrap.font-cinzel.job  {roleName} /  {jobName}
       
</template>

<style lang="sass">
  @use '../../styles/_mixins' as mixins
  .containerx
    container-type: inline-size
    font-size: 2rem
    color: white
  .rest-button
    max-width: 35px
  .rest-icon
    min-width: 35px
    
  .job
    text-align: right
    @container (max-width: 390px)
      text-align: center
  .lvcontainer
    display: flex
    justify-content: center
    gap: 3rem
    min-width: 11rem

</style>
