<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import {
    getAllKeys,
    getAllTranslationsForLanguage,
    getMissingForLanguage,
    getString as getStringOriginal,
  } from '../../../translations';
  import { distinct } from '../../../misc';
  import { onMount } from 'svelte';
  import ExportView from '../../../view/exportView.svelte';
  import { getLocalisatio, setLocalisatio } from '../../../storage';
  import { browser } from '$app/environment';
  import { characters, locations } from '../../../model/characters';

  let lang: string;
  onMount(() => {
    lang = navigator.language?.split('-')[0];
  });

  $: getString = (key: string) => getStringOriginal(key, lang);

  $: cards = Object.entries(characters).map(([key, value]) => {
    return {
      ...value,
      forbiddenLocation: 'forbiddenLocation' in value ? value.forbiddenLocation : [],
      name: getString(value.name),
      gender: value.tags.includes('boy' as never)
        ? ('male' as const)
        : value.tags.includes('girl' as never)
        ? ('female' as const)
        : ('diverse' as const),
      tags: value.tags.map(getString),
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
</script>

<div>
  {#each cards as card}
    <div
      class="card"
      class:male={card.gender == 'male'}
      class:female={card.gender == 'female'}
      class:diverse={card.gender == 'diverse'}
    >
      <img src={card.image} alt="character image" class="back image" />

      {#each locations as location}
        {#if card.startLocation.includes(location)}
          <img
            src="/cards/general/location-{location.toLocaleLowerCase()}-start.png"
            alt={getString(location)}
            class="location back"
          />
        {:else if card.forbiddenLocation.includes(location)}
          <img
            src="/cards/general/location-{location.toLocaleLowerCase()}-forbidden.png"
            alt={getString(location)}
            class="location back"
          />
        {:else if card.startLocation.length == 0}
          <img
            src="/cards/general/location-{location.toLocaleLowerCase()}-start.png"
            alt={getString(location)}
            class="location back"
          />
        {:else}
          <img
            src="/cards/general/location-{location.toLocaleLowerCase()}-blank.png"
            alt={getString(location)}
            class="location back"
          />
        {/if}
      {/each}
      <img
        src="/cards/general/paranoia-{card.paranoiaLimit}.png"
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
                    <img src="/cards/general/loop.png" alt="loop icon" />
                  </li>
                {/each}
              </ul>
              <ul class="goodwillRank">
                {#each Array.from({ length: ability.goodwillRank }) as _, i}
                  <li>
                    <img src="/cards/general/goodwill.png" alt="goodwill icon" />
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
            <svg class="diamond" viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#d0d0d0" />
                  <stop offset="50%" stop-color="#888" />
                  <stop offset="100%" stop-color="#444" />
                </linearGradient>
              </defs>
              <!-- Diamant -->
              <polygon
                points="16,0 32,16 16,32 0,16"
                fill="url(#metal)"
                stroke="#222"
                stroke-width="1"
              />
              <!-- Stange -->
              <rect x="14" y="32" width="4" height="64" fill="url(#metal)" />
              <!-- Kugel -->
              <circle cx="16" cy="32" r="4" fill="url(#metal)" stroke="#222" stroke-width="0.5" />
              <!-- Spitze -->
              <polygon
                points="16,96 28,128 4,128"
                fill="url(#metal)"
                stroke="#222"
                stroke-width="1"
              />
            </svg>
            <div>
              {tag}
            </div>
            <svg class="diamond" viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#d0d0d0" />
                  <stop offset="50%" stop-color="#888" />
                  <stop offset="100%" stop-color="#444" />
                </linearGradient>
              </defs>
              <!-- Diamant -->
              <polygon
                points="16,0 32,16 16,32 0,16"
                fill="url(#metal)"
                stroke="#222"
                stroke-width="1"
              />
              <!-- Stange -->
              <rect x="14" y="32" width="4" height="64" fill="url(#metal)" />
              <!-- Kugel -->
              <circle cx="16" cy="32" r="4" fill="url(#metal)" stroke="#222" stroke-width="0.5" />
              <!-- Spitze -->
              <polygon
                points="16,96 28,128 4,128"
                fill="url(#metal)"
                stroke="#222"
                stroke-width="1"
              />
            </svg>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>

<style lang="scss">
  @media print {
    @page {
      size: landscape;
    }
  }
  div:has(> .card) {
    display: flex;
    gap: 0.5cm;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    max-width: 100%;
  }

  .card {
    break-inside: avoid;
    height: 8.8cm;
    width: 6.3cm;
    position: relative;
    border: 1px solid #ccc;
    border-radius: 0.2cm;
    padding: 0;
    background-color: #f9f9f9;
    overflow: hidden;

    font-size: 8pt;

    background-position: center;
    background-size: cover;
    background-clip: border-box;
    &.male {
      background-image: url('/cards/general/back-male.png');
    }
    &.female {
      background-image: url('/cards/general/back-female.png');
    }
    &.diverse {
      background-image: url('/cards/general/back-diverse.png');
    }
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
      left: 0.6cm;
      color: white;
      & > li {
        margin-bottom: -0.4cm;
      }
      & > li.active,
      & > li:last-child,
      & > li:has(+ .active) {
        margin-bottom: -0.8cm;
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
      margin-bottom: -0.2cm;
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
      margin-bottom: -0.2cm;
      li {
        list-style: none;

        margin-left: -0.45cm;
      }
      img {
        width: 0.8cm;
      }
    }
    .tags {
      list-style: none;

      position: absolute;
      display: flex;
      flex-direction: column;
      top: 1.9cm;
      right: 0.15cm;
      height: 6cm;
      font-size: 9pt;
      align-items: center;
      justify-content: top;

      li {
        display: inline-flex;
        align-items: center;
        gap: 0;
        margin: 0;

        .diamond {
          height: 1cm;
          fill: #ddd;
          filter: drop-shadow(1px 1px 2px #000);
        }
        div {
          display: inline-block;
          padding: 0.1cm 0.3cm;
          margin: 0 -0.15cm;
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

  @import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
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
