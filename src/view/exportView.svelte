<script lang="ts">
  export let exportJson: string | undefined;

  let copiedLable: HTMLElement;

  let animate = false;

  $: focusOn(undefined, exportJson);

  async function focusOn(
    e:
      | (FocusEvent & {
          currentTarget: EventTarget & HTMLTextAreaElement;
        })
      | undefined,
    text: string | undefined
  ) {
    e?.currentTarget.select();

    if (exportJson) {
      await navigator.clipboard.writeText(exportJson);

      copiedLable.addEventListener('animationend', () => {
        animate = false;
      });
      animate = true;
    }
  }
</script>

<dialog open={exportJson !== undefined}>
  <form>
    <div style="position: relative;">
      <textarea
        bind:value={exportJson}
        on:click={(e) => focusOn(e, exportJson)}
        style="height: calc(100vh - 10rem); width: calc(100vw -  2 * var(--block-spacing-horizontal))"
        readonly
      />
      <ins class="instrted" class:animate bind:this={copiedLable}>Text Copied ✔</ins>
    </div>
    <button on:click={() => (exportJson = undefined)}>Close</button>
  </form>
</dialog>

<style lang="scss">
  ins {
    position: absolute;
    padding: 0px 0.6rem;
    margin: 1rem;
    border-radius: 1rem;
    color: white;
    background-color: var(--pico-ins-color);
    bottom: 0px;

    max-width: 0rem;
    // width: 0%;
    display: block;
    overflow: hidden;
    // height: 3rem;
    white-space: nowrap;
    opacity: 0;
  }
  ins.animate {
    animation: show 2.5s ease-in-out;
  }
  @keyframes show {
    0% {
      max-width: 0%;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      max-width: 100%;
    }
    51% {
      max-width: 100%;
    }
    100% {
      max-width: 100%;
      opacity: 0;
    }
  }
</style>
