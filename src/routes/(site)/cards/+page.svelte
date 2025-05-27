<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import { onMount } from 'svelte';
  import { characters, type CharacterName } from '../../../model/characters';
  import Iron from './iron.svelte';
  import Card from './card.svelte';
  import { getString } from '../+layout.svelte';
  import { getAvialableCharacterImages } from '../../+layout.svelte';
  import Translation from '../../../view/translation.svelte';

  const characterImages = getAvialableCharacterImages();

  let cards_per_page = $state(8);

  let page_width = $state(29.7);
  let page_height = $state(21);
  let page_margin = $state(0.5);

  let printCardBacks = $state(true);

  let selectedCards: string[] = $state([]);
  let selectedImage: Record<string, string> = $state(
    Object.fromEntries(Object.entries(characterImages).map(([key, images]) => [key, images[0]]))
  );

  let cards = $derived(
    Object.keys(characters)
      .toSorted((a, b) => $getString(a).localeCompare($getString(b)))
      .map((key) => {
        return {
          type: 'character' as const,
          image: selectedImage[key],
          key: key as CharacterName,
        };
      })
  );

  let pages = $derived(
    cards
      .filter((x) => selectedCards.includes(x.key))
      .reduce(
        (acc, card, index) => {
          const pageIndex = Math.floor(index / cards_per_page);
          if (!acc[pageIndex]) {
            acc[pageIndex] = [];
          }
          acc[pageIndex].push(card);
          return acc;
        },
        [] as (typeof cards)[]
      )
  );

  onMount(() => {
    selectedCards = cards.map((x) => x.key);
  });
</script>

<div class="settings container screen">
  <article>
    <details>
      <summary>Print Settings</summary>
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
    </details>

    <details>
      <summary>Card selection</summary>
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
          onclick={() => (selectedCards = cards.map((x) => x.key))}>Select All</button
        >
        <button
          class:outline={selectedCards.length != cards.length}
          onclick={() => (selectedCards = [])}>Deselect All</button
        >
        <button
          class="outline"
          onclick={() =>
            (selectedCards = cards.map((x) => x.key).filter((x) => !selectedCards.includes(x)))}
          >Invert selection</button
        >
      </div>
    </details>

    <details>
      <summary><Translation translationKey={'Alternate character images'} /></summary>

      {#each Object.entries(characterImages).filter(([, x]) => x.length > 1) as [key, images]}
        <div>
          <strong><Translation translationKey={key} /></strong>
          {selectedImage[key]}
          <div class="image-selection">
            {#each images as image}
              <label>
                <input type="radio" name="phase" bind:group={selectedImage[key]} value={image} />
                <img src={image} alt={$getString(key)} />
              </label>
            {/each}
          </div>
        </div>
      {/each}
    </details>

    <div>
      <p>
        <Translation translationKey={'Use the **Print** button of your browser (default shortcut[[Ctrl]]+[[P]]) to print the cards.'} />
      </p>
      <p>
        {#if printCardBacks}
          <Translation
            translationKey={'Make sure to set the page size to A4 landscape, set the margins to 0 and **enable** double sided printing (short edge).'}
          />
        {:else}
          <Translation
            translationKey={'Make sure to set the page size to A4 landscape, set the margins to 0 and **disable** double sided printing.'}
          />
        {/if}<br />
        <Translation translationKey={'Or change the the card layout settings above.'} />
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
            <Card {card} face="back" />
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
    }

    .cardholder {
      gap: 0;
    }
  }

  details {
    summary {
      cursor: pointer;
      font-weight: bold;
      color: var(--pico-primary);
      &:hover {
        color: var(--pico-primary-hover);
      }
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

  .image-selection {
    display: flex;

    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;

    label {
      input {
        display: none;
      }
      &:has(input:checked) {
        img {
          filter: drop-shadow(0 0 5px var(--pico-primary));
        }
      }
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      align-self: end;

      img {
        border-radius: 4px;
        filter: drop-shadow(0 0 5px var(--pico-secondary));

        max-height: 200px;
        max-width: 200px;
        object-fit: contain;
        object-position: bottom center;
      }
    }
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
