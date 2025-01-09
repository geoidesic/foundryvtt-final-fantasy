<script>
  import { onMount, getContext } from "svelte";
  import { ASSET_PATH } from "~/src/helpers/constants";
  import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";

  const application = getContext("#external").application;
  const documentStore = getContext("#doc");
  let _filePickerInstance = {};

  function _launchStandardProfileEditor(event) {
    const current = $documentStore.img;
    if (_filePickerInstance instanceof FilePicker && !_filePickerInstance?.rendered) {
      _filePickerInstance.render(true);
      return;
    }
    _filePickerInstance = new FilePicker({
      type: "image",
      current: current,
      callback: (path) => {
        $documentStore.update({ img: path });
      },

      top: application.position.top + 40,
      left: application.position.left + 10,
    });
    return _filePickerInstance.browse();
  }

  //- provide Tokenizer support
  function _editToken(event) {
    if (game.modules.has("vtta-tokenizer") && typeof Tokenizer !== "undefined") {
      _launchTokenizer();
    } else {
      _launchStandardProfileEditor(event);
    }
  }

  function _launchTokenizer() {
    if (game.modules.has("vtta-tokenizer") && typeof Tokenizer !== "undefined") {
      Tokenizer.tokenizeActor($documentStore);
    }
  }
</script>

<template lang="pug">

.portrait-frame
  PortraitFrame(img="{true}" imgSrc="{$documentStore?.img}" onClick="{_editToken}")

</template>

<style lang="sass">
  @use '../../../styles/_mixins' as mixins
  .portrait-frame
    margin-right: -2px
    z-index: 2
  
    +mixins.background
</style>
