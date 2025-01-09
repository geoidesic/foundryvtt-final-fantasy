<svelte:options accessors={true} />

<script>

  import TJSProseMirror from "~/src/components/TJSProseMirror.svelte";
  import { TJSContentEdit, TJSTinyMCE } from "#standard/component/fvtt-editor";
  import { getContext } from "svelte";

  // If you are developing ProseMirror plugins import from this path to enable PM debugging tooling.
  // import { TJSProseMirror }     from '@typhonjs-fvtt/svelte-standard/component/dev';

  // Not always necessary, but you can use DOMPurify to sanitize user input client side.
  // import { DOMPurify }          from '@typhonjs-fvtt/runtime/dompurify';

  export let content = "";
  export let attr = "";
  export let classes = "";
  export let editable = "";

  const doc = getContext("#doc");
  // console.log("$doc", $doc);

  function doSomethingWithEnrichedContent(event) {
    // console.log(`! event - editor:enrichedContent - ${event.detail.enrichedContent}`)
  }

  /**
   * You can set a document to load / save content from given a `fieldName` in the format of `a.b.c`.
   * When you set a document you can also enable collaboration.
   *
   * The simplest example is:
   *
   * <TJSProseMirror options={{document: <doc>, fieldName: 'some.data.path'}} />
   *
   * The following options data is commented out as it is set to a specific document for the DnD5e system.
   */
  const options = {
    document: $doc, // An item to edit description; note: replace w/ valid doc.
    fieldName: attr, // Path to data in `a.b.c`; note: this is a v10 field name.
    // collaborate: false,                             // Enables collaboration; requires document.
    // button: true      // Show edit button to launch editor when hovered; when false editor is open by default.
    classes,   // Adds additional classes to `.editor` element.
    // clickToEdit: false,  // Clicking editor content initializes the editor; hides the edit button.
    // DOMPurify,        // You can pass DOMPurify from `@typhonjs-fvtt/runtime/dompurify though ProseMirror does
    // essential client side sanitation; IE stripping `<script>` tags, etc.
    editable,   // Enable / disable editing
    // enrichContent: true  // The default is true, but if you set it to false content is not enriched.
    // initialSelection: 'start', // The initial selection / cursor position: 'all', 'end', or 'start'.
    // styles: { '--tjs-editor-toolbar-background': 'red' } // Apply any inline styles / CSS variables
  };

  /**
   * Just an example that you can also bind the content / enrichedContent. You can also bind Svelte stores.
   */
  let enrichedContent;

  // $: if (content) {
  //   console.log(`! bound content changed: ${content}`);
  // }
  // $: if (enrichedContent) {
  //   console.log(`! bound enrichedContent changed: ${enrichedContent}`);
  // }
</script>

<TJSProseMirror
  {options}
  {...$$restProps}
  bind:content
  bind:enrichedContent
  on:editor:cancel={() => console.log("! event - editor:cancel")}
  on:editor:enrichedContent={doSomethingWithEnrichedContent}
  on:editor:save={(event) => console.log(`! event - editor:save - ${event.detail.content}`)}
  on:editor:start={() => console.log("! event - editor:start")}
/>


