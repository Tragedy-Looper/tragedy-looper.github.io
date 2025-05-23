<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import { getString as getStringOriginal } from '../../../translations';
  import { onMount } from 'svelte';
  import { characters, locations } from '../../../model/characters';
  import Iron from './iron.svelte';

  export let card:
    | {
        name: string;
        type: 'character';
        startLocation: readonly (typeof locations)[number][];
        forbiddenLocation: readonly (typeof locations)[number][];
        gender: 'male' | 'female' | 'both' | 'diverse';
        paranoiaLimit: number;
        image: string;
        tags: readonly string[];
        abilities: (
          | {
              type: 'passive';
              description: string;
              restrictedToLocation: readonly string[];
            }
          | {
              type: 'active';
              description: string;
              goodwillRank: number;
              timesPerLoop: number;
              immuneToGoodwillRefusel: boolean;
              restrictedToLocation: readonly string[];
            }
        )[];
      }
    | undefined;

  let lang: string;
  onMount(() => {
    lang = navigator.language?.split('-')[0];
  });

  $: getString = (key: string) => getStringOriginal(key, lang);
</script>

<div class="card">
  {#if card}
    <img src="{base}/cards/general/background.png" alt="Character" class="back" />
    <img src={card.image} alt="Character" class="back image" />
    <img src="{base}/cards/general/{card.gender}.png" alt="Cardbackground" class="back" />

    {#each locations as location}
      {#if card.startLocation.includes(location)}
        <img
          src="{base}/cards/general/location-{location.toLocaleLowerCase()}-start.png"
          alt={getString(location)}
          class="location back"
        />
      {:else if card.forbiddenLocation.includes(location)}
        <img
          src="{base}/cards/general/location-{location.toLocaleLowerCase()}-forbidden.png"
          alt={getString(location)}
          class="location back"
        />
      {:else}
        <img
          src="{base}/cards/general/location-{location.toLocaleLowerCase()}-blank.png"
          alt={getString(location)}
          class="location back"
        />
      {/if}
    {/each}
    <img
      src="{base}/cards/general/paranoia-{card.paranoiaLimit}.png"
      alt={getString('paranoia')}
      class="paranoia back"
    />

    <h2>{card.name}</h2>

    <ul class="abilities">
      {#each card.abilities as ability}
        <li class={ability.type}>
          {#if ability.type == 'active'}
            <ul class="perLoop">
              {#each Array.from({ length: ability.timesPerLoop }) as _, i}
                <li>
                  <img src="{base}/cards/general/loop.png" alt="loop icon" />
                </li>
              {/each}
            </ul>
            <ul class="goodwillRank">
              {#each Array.from({ length: ability.goodwillRank }) as _, i}
                <li>
                  <img src="{base}/cards/general/goodwill.png" alt="goodwill icon" />
                </li>
              {/each}
            </ul>
          {:else}{/if}
          <p>
            {#if ability.restrictedToLocation.length > 0}
              <div>
                {getString('Only at')}: {ability.restrictedToLocation.map(getString).join(', ')}
              </div>
            {/if}
            {ability.description}
          </p>
        </li>
      {/each}
    </ul>
    <ul class="tags">
      {#each card.tags as tag}
        <li>
          <Iron />
          <div>
            {tag}
          </div>
          <Iron />
        </li>
      {/each}
    </ul>
  {:else}
    <img src="{base}/cards/general/cardback.png" alt="Empty" class="back" />
  {/if}
</div>

<style lang="scss">
  .card {
    box-sizing: border-box;
    break-inside: avoid;
    height: 8.8cm;
    width: 6.3cm;
    position: relative;
    border: 1px solid #ccc;
    border-radius: 0.2cm;
    background-color: #000;

    @media print {
      break-inside: avoid;
      page-break-inside: avoid;
      border-color: black;
      //   box-shadow: #000 0 0 0cm 0.3cm;
      // margin: 3.31cm;
    }

    padding: 0;
    overflow: hidden;

    font-size: 8pt;

    .image {
      object-fit: contain;
      padding-top: 0.2cm;
      &[src*='tree'] {
        // hack for sacred tree
        // need to find a better way, but don't want to change every image
        object-fit: fill;
        padding: 0;
      }
    }
    img.back {
      height: 8.8cm;
      width: 6.3cm;
      position: absolute;
    }
    h2 {
      position: absolute;
      display: flex;
      top: 1.6cm;
      left: 0.05cm;
      width: 0.7cm;
      height: 6cm;
      font-size: 11pt;
      align-items: center;
      justify-content: center;
      color: #cfcec7;

      margin: 0;
      writing-mode: vertical-lr;
      text-orientation: sideways;
      transform: rotate(180deg);
      // dark outline with layers of box-shadow
      text-shadow: 0 0 1px #000, 0 0 2px #000, 0 0 3px #000, 0 0 4px #000, 0 0 5px #000,
        0 0 6px #000, 0 0 7px #000, 0 0 8px #000;
    }
    .abilities {
      position: absolute;
      display: flex;
      flex-direction: column;
      margin: 0;
      bottom: 0.3cm;
      right: 0.25cm;
      left: 1.1cm;
      color: white;
      & > li {
        margin-bottom: -0.4cm;
      }
      & > li.active,
      & > li:last-child,
      & > li:has(+ .active) {
        margin-bottom: -0.6cm;
      }
      p {
        //metalic border
        // border: 1px solid #ccc;
        border-image: linear-gradient(to bottom, #ccc 60%, #0000 100%) 1;
        border-width: 1pt;
        border-style: solid;

        border-bottom: none;

        padding: 02pt 4pt;
        padding-bottom: 0.6cm;
        background: linear-gradient(to bottom, #0000005e 80%, #0000 100%);
        color: #fff;
        text-shadow: 0 0 1px #000, 0 0 2px #000, 0 0 3px #000, 0 0 4px #000, 0 0 5px #000,
          0 0 6px #000, 0 0 7px #000, 0 0 8px #000;
        margin: 0;
        font-size: 8pt;
      }
    }
    .goodwillRank {
      display: flex;
      gap: 0cm;
      margin-bottom: -0.3cm;
      margin-left: 0.55cm;
      li {
        list-style: none;

        margin-left: -0.45cm;
      }
      img {
        width: 0.8cm;
      }
    }
    .perLoop {
      float: right;
      display: flex;
      gap: 0cm;
      margin-right: 0.2cm;
      margin-bottom: -0.2cm;
      li {
        list-style: none;

        margin-left: -0.45cm;
      }
      img {
        width: 0.55cm;
      }
    }
    .tags {
      list-style: none;

      position: absolute;
      display: flex;
      flex-direction: column;
      top: 1.75cm;
      right: 0.15cm;
      height: 6cm;
      font-size: 9pt;
      align-items: center;
      justify-content: top;

      li {
        display: inline-flex;
        align-items: center;
        gap: 0;
        margin: -0.18cm 0;

        :global(svg) {
          // width: 1cm;
          height: 1cm;
          margin: 0 -0.15cm;
          filter: drop-shadow(1px 1px 2px #000);
        }
        .diamond {
          height: 1cm;
          fill: #ddd;
          filter: drop-shadow(1px 1px 2px #000);
        }
        div {
          display: inline-block;
          padding: 0.01cm 0.2cm;
          border-top: 0.02cm solid #152f32;
          border-bottom: 0.02cm solid #152f32;
          margin: 0 0.03cm;
          // font-family: 'UnifrakturCook', serif;
          font-size: 8pt;
          color: #ffe68c;
          text-shadow: 0 0 4px #fff9c4, 1px 1px 2px #000;
          background: linear-gradient(to right, #204850, #3b7a75, #204850);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
        }
      }
    }
  }
  li {
    list-style: none;
  }
  ul {
    padding: 0;
  }
</style>
