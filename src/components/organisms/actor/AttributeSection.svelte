<script>
import { onMount } from 'svelte';
import PortraitFrame from "~/src/components/molecules/PortraitFrame.svelte";
import AttributeBlock from "~/src/components/molecules/Attributes/AttributeBlock.svelte";
import TitleBlock from "~/src/components/molecules/TitleBlock.svelte";
import { ASSET_PATH } from '~/src/helpers/constants';
import { getContext } from 'svelte';

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
<template lang='pug'>
  section.organism
    .flexcol.background
      .texture
      TitleBlock
      .flexrow.panel.borderless
        .flex2
          AttributeBlock
        .flex1.portrait-frame
          PortraitFrame(img="{true}" imgSrc="{$documentStore?.img}" onClick="{_editToken}")
      
</template>
<style lang='sass'>
  @import '../../../styles/Mixins.sass'
  .portrait-frame
    margin-right: -2px
    z-index: 2

  +background
</style>