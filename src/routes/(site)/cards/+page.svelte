<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import { getString as getStringOriginal } from '../../../translations';
  import { onMount } from 'svelte';
  import { characters, locations } from '../../../model/characters';
  import Iron from './iron.svelte';
  import Card from './card.svelte';

  let lang: string;
  onMount(() => {
    lang = navigator.language?.split('-')[0];
  });

  let cards_per_page = 8;

  $: getString = (key: string) => getStringOriginal(key, lang);

  $: cards = Object.entries(characters)
    .toSorted(([a], [b]) => getString(a).localeCompare(getString(b)))
    .map(([key, value]) => {
      return {
        ...value,
        forbiddenLocation: 'forbiddenLocation' in value ? value.forbiddenLocation : [],
        name: getString(value.name),
        gender:
          (value.tags.includes('boy' as never) || value.tags.includes('man' as never)) &&
          (value.tags.includes('girl' as never) || value.tags.includes('woman' as never))
            ? ('both' as const)
            : value.tags.includes('boy' as never) || value.tags.includes('man' as never)
            ? ('male' as const)
            : value.tags.includes('girl' as never) || value.tags.includes('woman' as never)
            ? ('female' as const)
            : ('diverse' as const),
        tags: value.tags.map(getString).toSorted((a, b) => a.localeCompare(b)),
        image: `${base}/cards/characters/${key.toLocaleLowerCase().replaceAll('?', '')}.png`,
        abilities: value.abilities.map((ability) => {
          return {
            ...ability,
            timesPerLoop: 'timesPerLoop' in ability ? ability.timesPerLoop : 0,
            immuneToGoodwillRefusel:
              'immuneToGoodwillRefusel' in ability ? ability.immuneToGoodwillRefusel : false,
            restrictedToLocation:
              'restrictedToLocation' in ability ? ability.restrictedToLocation : [],

            description: getString(ability.description),
          };
        }),
      };
    });

  $: pages = cards.reduce((acc, card, index) => {
    const pageIndex = Math.floor(index / cards_per_page);
    if (!acc[pageIndex]) {
      acc[pageIndex] = [];
    }
    acc[pageIndex].push(card);
    return acc;
  }, [] as (typeof cards)[]);
</script>

<div class="container screen">
  {#each cards as card}
    <Card {card} />
  {/each}
</div>

<div class="container print">
  {#each pages as page}
    <div class="page">
      {#each page as card}
        <div style="background-color: black;padding: 0.3cm;">
          <Card {card} />
        </div>
      {/each}
    </div>
    <div class="page">
      {#each page as card}
        <div style="background-color: black;padding: 0.3cm;">
          <Card card={undefined} />
        </div>
      {/each}
    </div>
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
  .container {
    display: flex;
    gap: 0.5cm;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    max-width: 100%;
  }

  @media print {
    .container > div {
      padding: 0.35cm 0.2cm;
      color: white;
      h2 {
        color: #e1e6eb;
      }
    }

    .container {
      gap: 0;
    }
  }

  .page {
    --pager-margin: 0.05cm;
    // DIN A4 landscape
    width: calc(29.7cm - var(--pager-margin) * 2 / 2);
    height: calc(21cm - var(--pager-margin) * 2 / 2);

    break-inside: avoid;

    display: flex;
    gap: 0.5cm;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-content: space-around;
    align-items: center;

    margin: 0 auto;
    max-width: 100%;
    padding: 0.5cm;
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
</style>
