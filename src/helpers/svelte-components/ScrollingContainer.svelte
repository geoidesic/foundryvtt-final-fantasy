<script>
  let scrollClass = "";
  function scrollFade(event) {
    /*       const node = event.target;
      const isScrollable = node.scrollHeight > node.clientHeight;

      // GUARD: If element is not scrollable, remove all classes
      if (!isScrollable) {
         node.classList.remove('is-bottom-overflowing', 'is-top-overflowing');
         return;
      }

      // Otherwise, the element is overflowing!
      // Now we just need to find out which direction it is overflowing to (can be both)
      const isScrolledToBottom = node.scrollHeight <= node.clientHeight + node.scrollTop;
      const isScroledlToTop = node.scrollTop === 0;
      if (!isScrolledToBottom) {
         scrollClass = ' faded bottom-overflowing';
         if (!isScroledlToTop) {
            scrollClass += ' top-overflowing';
         }
      } else if (!isScroledlToTop) {
         scrollClass = ' faded top-overflowing';
      } else {
         scrollClass = '';
      } */
  }

  export let scrollTop = 0;

  function onScroll(event) {
    scrollTop = event.target.scrollTop;
  }

  function initialScroll(node) {
    node.scrollTop = scrollTop;

    return;
  }
</script>

<div class="container">
  <div class="content{scrollClass}" on:scroll={onScroll} use:initialScroll>
    <slot>Scrolling Content</slot>
  </div>
</div>

<style lang="sass">
  @use "../../styles/_mixins" as mixins

  .container
    +mixins.flex-column
    position: relative
    width: 100%
    height: 100%
    z-index: var(--z-index-app)

    .content
      +mixins.flex-column
      width: 100%
      height: 100%
      position: absolute
      top: 0
      left: 0
      bottom: 0
      overflow-y: auto
      padding: 0
      z-index: var(--z-index-app)
</style>

