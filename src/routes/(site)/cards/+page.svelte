<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import { onMount } from 'svelte';
  import { characters, locations } from '../../../model/characters';
  import Iron from './iron.svelte';
  import Card from './card.svelte';
    import { getString } from '../+layout.svelte';



  let cards_per_page = 8;

  let page_width = 29.7;
  let page_height = 21;
  let page_margin = 0.5;

  let printCardBacks = true;

  let selectedCards: string[] = [];


  $: cards = Object.entries(characters)
    .toSorted(([a], [b]) => $getString(a).localeCompare($getString(b)))
    .map(([key, value]) => {
      return {
        type: 'character' as const,
        ...value,
        forbiddenLocation: 'forbiddenLocation' in value ? value.forbiddenLocation : [],
        name: $getString(value.name),
        key: value.name,
        gender:
          (value.tags.includes('boy' as never) || value.tags.includes('man' as never)) &&
          (value.tags.includes('girl' as never) || value.tags.includes('woman' as never))
            ? ('both' as const)
            : value.tags.includes('boy' as never) || value.tags.includes('man' as never)
            ? ('male' as const)
            : value.tags.includes('girl' as never) || value.tags.includes('woman' as never)
            ? ('female' as const)
            : ('diverse' as const),
        tags: value.tags.map($getString).toSorted((a, b) => a.localeCompare(b)),
        image: `${base}/cards/characters/${key.toLocaleLowerCase().replaceAll('?', '')}.png`,
        abilities: value.abilities.map((ability) => {
          return {
            ...ability,
            timesPerLoop: 'timesPerLoop' in ability ? ability.timesPerLoop : 0,
            immuneToGoodwillRefusel:
              'immuneToGoodwillRefusel' in ability ? ability.immuneToGoodwillRefusel : false,
            restrictedToLocation:
              'restrictedToLocation' in ability ? ability.restrictedToLocation : [],

            description: $getString(ability.description),
          };
        }),
      };
    });

  $: pages = cards
    .filter((x) => selectedCards.includes(x.key))
    .reduce((acc, card, index) => {
      const pageIndex = Math.floor(index / cards_per_page);
      if (!acc[pageIndex]) {
        acc[pageIndex] = [];
      }
      acc[pageIndex].push(card);
      return acc;
    }, [] as (typeof cards)[]);

  onMount(() => {
    selectedCards = cards.map((x) => x.key);
  });
</script>

<div class="settings container screen">
  <article>
    <h2>Print Settings</h2>
    <div role="group">
      <label>
        Cards per page
        <input type="number" bind:value={cards_per_page} min="1" max="20" />
      </label>
      <label>
        Page width (cm)
        <input type="number" bind:value={page_width} min="1" max="50" />
      </label>
      <label>
        Page height (cm)
        <input type="number" bind:value={page_height} min="1" max="50" />
      </label>
      <label>
        Page margin (cm)
        <input type="number" bind:value={page_margin} min="0" max="5" />
      </label>
    </div>

    <label>
      Print card backs
      <input type="checkbox" bind:checked={printCardBacks} role="switch" />
    </label>

    <div>
      {#if selectedCards.length == 0}
        <p>No Cards selected for print. Select cards to print</p>
      {:else if selectedCards.length == cards.length}
        <p>All cards selected</p>
      {:else}
        <p>{selectedCards.length} of {cards.length} cards selected</p>
      {/if}
    </div>

    <div role="group">
      <button
        class:outline={selectedCards.length != 0}
        on:click={() => (selectedCards = cards.map((x) => x.key))}>Select All</button
      >
      <button
        class:outline={selectedCards.length != cards.length}
        on:click={() => (selectedCards = [])}>Deselect All</button
      >
      <button
        class="outline"
        on:click={() =>
          (selectedCards = cards.map((x) => x.key).filter((x) => !selectedCards.includes(x)))}
        >Invert selection</button
      >
    </div>
    <div>
      <p>
        Use the <strong>Print</strong> button of your browser (default shortcut <kbd>Ctrl</kbd>+<kbd
          >P</kbd
        > ) to print the cards.
      </p>
      <p>
        {#if printCardBacks}
          Make sure to set the page size to A4 landscape, set the margins to 0 and <b>enable</b> double
          sided printing (short edge).
        {:else}
          Make sure to set the page size to A4 landscape, set the margins to 0 and <b>disable</b> double
          sided printing.
        {/if}<br />
        Or change the the card layout settings above.
      </p>
    </div>
  </article>
</div>

<div class="cardholder screen">
  {#each cards as card}
    <label class="card">
      <input type="checkbox" bind:group={selectedCards} value={card.key} />
      <Card {card} />
    </label>
  {/each}
</div>

<div
  class="cardholder print"
  style="--page-width:{page_width}cm;--page-height:{page_height}cm; --page-margin:{page_margin}cm;"
>
  {#each pages as page}
    <div class="page">
      {#each page as card}
        <div style="background-color: black;padding: 0.3cm;">
          <Card {card} />
        </div>
      {/each}
    </div>
    {#if printCardBacks}
      <div class="page">
        {#each page as card}
          <div style="background-color: black;padding: 0.3cm;">
            <Card card={undefined} />
          </div>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  :root {
    --pager-margin: 0.05cm;
  }
  @media print {
    .screen {
      display: none !important;
    }
    @page {
      size: A4 landscape;
      margin: var(--pager-margin);
    }
  }

  @media screen {
    .print {
      display: none !important;
    }
  }
  .cardholder {
    display: flex;
    gap: 0.5cm;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    max-width: 100%;
  }

  @media print {
    .cardholder > div {
      padding: 0.35cm 0.2cm;
      color: white;
      h2 {
        color: #e1e6eb;
      }
    }

    .cardholder {
      gap: 0;
    }
  }

  .page {
    // DIN A4 landscape
    width: calc(29.7cm);
    height: calc(21cm);

    padding: var(--pager-margin);

    break-inside: avoid;

    display: flex;
    gap: 0.5cm;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-content: space-around;
    align-items: center;

    margin: 0 auto;
    max-width: 100%;
  }

  // @import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
  li {
    list-style: none;
  }
  .fancy-text {
    display: inline-block;
    padding: 0.5em 1em;
    font-family: 'UnifrakturCook', serif;
    font-size: 2rem;
    color: #ffe68c;
    text-shadow: 0 0 4px #fff9c4, 1px 1px 2px #000;

    background: linear-gradient(to right, #204850, #3b7a75, #204850);
    border-left: 5px solid #aaa;
    border-right: 5px solid #aaa;
    border-image: linear-gradient(to bottom, #ccc, #444) 1;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
  }

  body {
    background: #0c0c1c;
    color: white;
    text-align: center;
    padding-top: 5em;
  }

  label.card {
    & > input {
      display: none;
    }
    border-radius: 8px;
    &:has(input:checked) {
      box-shadow: 0 0 10px 5px var(--pico-primary);
      background: linear-gradient(to right, #204850, #3b7a75, #204850);
    }
  }
</style>
