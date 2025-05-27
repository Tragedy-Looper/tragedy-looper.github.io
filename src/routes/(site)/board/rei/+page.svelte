<script lang="ts">
  import { getString } from '../../+layout.svelte';
  import Translation from '../../../../view/translation.svelte';
  import Borders from './Borders.svelte';
  import '@picocss/pico';
</script>

<main class="container">
  <hgroup>
    <h1><Translation translationKey={'Rei Board'} /></h1>
    <p>Work in progress</p>
  </hgroup>
  <p>
    <Translation
      translationKey={'Since this board will probably never be released in english, not to mention any other language. This is an atempt to have a localized version.'}
    />
    <Translation translationKey={'Not everything is cleand up yet.'} />
  </p>
  <ul>
    {#snippet entry(text: string, checked: boolean, additon?: string)}
      <li>
        <label style="cursor: default;">
          <input type="checkbox" {checked} readonly disabled />
          <Translation translationKey={text} />{#if additon}
            <input style="display: none;" />
            <!-- HACK to style small with the after input style. Since Translation may add a span and template-->
            <small style="margin-top: 0;"><Translation translationKey={additon} /></small
            >{/if}</label
        >
      </li>
    {/snippet}

    {@render entry('Location Icons', true)}
    {@render entry('Intrigue Places', true, 'kind off')}
    {@render entry('Location background', true, 'could be better')}
    {@render entry('Dispair place', false)}
    {@render entry('Day stages', false, 'They are already prety clean, but images and not text.')}
    {@render entry('Day track', false)}
    {@render entry('Incident track', false)}
    {@render entry('Loop track', false)}
    {@render entry('Extra gauge', false)}
    {@render entry('Additional decorations', false)}
  </ul>
  <div class="board">
    <img src="/board/rei/location-background2.png" alt="Board" />
    <Borders></Borders>
    <img
      src="/board/rei/intrigue.png"
      alt="Intrigue Place top left"
      class="intrigue"
      style="--top: 4.3cm; --left:6.3cm;"
    />
    <img
      src="/board/rei/intrigue.png"
      alt="Intrigue Place bottom left"
      class="intrigue"
      style="--top: 21.8cm; --left:6.3cm;"
    />
    <img
      src="/board/rei/intrigue.png"
      alt="Intrigue Place top right"
      class="intrigue"
      style="--top: 4.3cm; --left:50.4cm;"
    />
    <img
      src="/board/rei/intrigue.png"
      alt="Intrigue Place bottom right"
      class="intrigue"
      style="--top: 21.8cm; --left:50.4cm;"
    />
    <img src="/board/rei/border.png" alt="Rei" />
  </div>
  <p style="text-align: center;">
    <Translation
      translationKey={'Printing this page will only Print the board in 57.57cm × 40.57cm.'}
    /><br /><small>(<Translation translationKey={'Print to PDF is recommended'} />)</small>
  </p>
</main>

<style>
  @media print {
    :not(:is(main, .board, .board *)) {
      display: none;
    }
    * {
      margin: 0;
    }
  }
  ul {
    padding: 0;
    margin: 1rem;
    display: grid;
    grid-auto-rows: 1fr 1fr 1fr;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
    @media (max-width: 800px) {
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
  li {
    list-style: none;
  }
  @page {
    size: 57.57cm 40.57cm;
    margin: 0;
  }
  main {
    --scale: 0.5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .board {
    position: relative;
    @media print {
      --scale: 1;
    }
    --width: calc(57.57cm * var(--scale));
    --height: calc(40.57cm * var(--scale));

    width: var(--width);
    height: var(--height);
    margin: 1rem;
    @media print {
      margin: 0;
    }
  }
  .board > :global(*) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
  }
  .intrigue {
    position: absolute;
    width: calc(6.32cm * var(--scale));
    height: auto;
    top: calc(var(--top) * var(--scale));
    left: calc(var(--left) * var(--scale));
  }
</style>
