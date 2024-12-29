<script>
  import { getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import DocSelect from "~/src/components/atoms/controls/DocSelect.svelte";
  import DocInput from "~/src/components/atoms/controls/DocInput.svelte";
  


  let modes = application.options.modes;
  let isActorEffect = application.getData().isActorEffect;
  let isItemEffect = application.getData().isItemEffect;


  const application = getContext("#external").application;
  const effect = application.object;
  

  function options() {
    Object.entries(modes).map(([value, label]) => ({ value: parseInt(value), label }))
  }
  function onChangeKey(event, change) {
    const changes = [...effect.changes];
    const index = changes.indexOf(change);
    if (index !== -1) {
      changes[index] = { ...change, key: event.target.value };
      effect.update({ changes });
    }
  }
  
  function onChangeValue(event, change) {
    const changes = [...effect.changes];
    const index = changes.indexOf(change);
    if (index !== -1) {
      changes[index] = { ...change, value: event.target.value };
      effect.update({ changes });
    }
  }
  
  function addChange() {
    const changes = effect.changes.concat([{ key: "", mode: 0, value: "" }]);
    effect.update({ changes });
  }
  
  function deleteChange(index) {
    const changes = effect.changes.filter((_, i) => i !== index);
    effect.update({ changes });
  }

  // Event handler factories for template
  const handleKeyChange = (change) => (e) => onChangeKey(e, change);
  const handleValueChange = (change) => (e) => onChangeValue(e, change);
  const handleDelete = (i) => () => deleteChange(i);

  function getValuePath(type, index) {
    return `changes[${index}].${type}`;
  }

</script>

<template lang="pug">
.flexcol.wide
  form(autocomplete="off")
    //- Effect Configuration
    .form-group
      label {localize('EFFECT.Label')}
      DocInput(name="label" valuePath="label")
    
    .form-group
      label {localize('EFFECT.Icon')}
      DocInput.image(name="icon" valuePath="icon")
      img.preview(src="{effect.icon}" alt="{effect.label}")
    
    //- Effect Changes
    section.changes
      h3 {localize('EFFECT.Changes')}
      .changes-list
        +each("effect.changes as change, i")
          .change-row
            DocSelect.mode(
              options="{options}"
              valuePath="{getValuePath('mode', i)}"
              document="{effect}"
            )
            
            DocInput.key(
              name="key"
              valuePath="{getValuePath('key', i)}"
              placeholder="{localize('EFFECT.KeyPlaceholder')}"
            )
            
            DocInput.value(
              name="value"
              valuePath="{getValuePath('value', i)}"
              placeholder="{localize('EFFECT.ValuePlaceholder')}"
            )
            
            button.delete(type="button" on:click!="{handleDelete(i)}")
              i.fas.fa-trash
      
      button.add-change(type="button" on:click!="{addChange}")
        i.fas.fa-plus
        | {localize('EFFECT.Add')}
    
    //- Duration Configuration
    +if("isActorEffect || isItemEffect")
      section.duration
        h3 {localize('EFFECT.Duration')}
        .form-group
          label {localize('EFFECT.DurationSecs')}
          DocInput(type="number" name="duration.seconds" valuePath="duration.seconds")
        
        .form-group
          label {localize('EFFECT.DurationTurns')}
          DocInput(type="number" name="duration.turns" valuePath="duration.turns")
        
        .form-group
          label {localize('EFFECT.DurationRounds')}
          DocInput(type="number" name="duration.rounds" valuePath="duration.rounds")
</template>

<style lang="sass">
  .changes-list
    margin: 0.5em 0
    .change-row
      display: flex
      gap: 0.5em
      margin-bottom: 0.5em
      
      select, input
        flex: 1
        
      button.delete
        flex: 0 0 auto
        
  .add-change
    width: 100%
    margin: 0.5em 0
    
  img.preview
    flex: 0 0 36px
    margin-left: 0.5em
    
  .form-group
    margin: 0.5em 0
    display: flex
    flex-direction: column
    gap: 0.25em
    
    label
      font-weight: bold
      
    input
      width: 100%
</style> 