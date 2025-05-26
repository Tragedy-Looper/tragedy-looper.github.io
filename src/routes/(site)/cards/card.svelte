<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import { characters, locations, type CharacterName } from '../../../model/characters';
  import Iron from './iron.svelte';
  import { Spring, spring } from 'svelte/motion';
  import { adjust, clamp, round } from '../../../misc';
  import { getString } from '../+layout.svelte';
  import type { PageServerData } from './$types';
  import './holo.css';
  import { getAvialableCharacterImages } from '../../+layout.svelte';

  const characterImages = getAvialableCharacterImages();

  type Card = {
    name: string;
    type: 'character';
    startLocation: readonly (typeof locations)[number][] | undefined;
    forbiddenLocation: readonly (typeof locations)[number][];
    gender: 'male' | 'female' | 'both' | 'diverse';
    paranoiaLimit: number | undefined;
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
  };

  let {
    scale = 1,
    animated = false,
    card,
    face = 'front',
  }: {
    scale?: number;
    animated?: boolean;
    card:
      | Card
      | CharacterName
      | ({
          type: 'character';
          key: CharacterName;
        } & Partial<Card>);
    face?: 'front' | 'back';
  } = $props();

  let actualCard = $derived(getCarddataFromName(card));

  function getCarddataFromName(c: typeof card): Card {
    const key = typeof c === 'string' ? c : 'key' in c ? c.key : (c.name as CharacterName);
    const value = typeof c === 'string' ? characters[c] : 'key' in c ? characters[c.key] : c;
    const dataFromCharacterName = {
      type: 'character' as const,
      ...value,
      forbiddenLocation: 'forbiddenLocation' in value ? value.forbiddenLocation : [],
      name: $getString(value.name),
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
      image: characterImages[key as keyof typeof characterImages],
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

    if (typeof c === 'string') {
      return dataFromCharacterName;
    } else {
      return {
        ...dataFromCharacterName,
        ...c,
      };
    }
  }

  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  const springPopoverSettings = { stiffness: 0.033, damping: 0.45 };

  let springRotate = new Spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = new Spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = new Spring({ x: 50, y: 50 }, springInteractSettings);
  let springRotateDelta = new Spring({ x: 0, y: 0 }, springPopoverSettings);
  let springTranslate = new Spring({ x: 0, y: 0 }, springPopoverSettings);
  let springScale = new Spring(1, springPopoverSettings);

  const updateSprings = (
    background: { x: number; y: number },
    rotate: { x: number; y: number },
    glare: { x: number; y: number; o: number }
  ) => {
    springBackground.stiffness = springInteractSettings.stiffness;
    springBackground.damping = springInteractSettings.damping;
    springRotate.stiffness = springInteractSettings.stiffness;
    springRotate.damping = springInteractSettings.damping;
    springGlare.stiffness = springInteractSettings.stiffness;
    springGlare.damping = springInteractSettings.damping;

    springBackground.set(background);
    springRotate.set(rotate);
    springGlare.set(glare);
  };

  const interact = (e: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) => {
    if (!animated) return;
    // endShowcase();

    const el = e.currentTarget;
    const rect = el?.getBoundingClientRect(); // get element's current size/position
    const absolute = {
      x: e.clientX - rect.left, // get mouse position from left
      y: e.clientY - rect.top, // get mouse position from right
    };
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };

    updateSprings(
      {
        x: adjust(percent.x, 0, 100, 37, 63),
        y: adjust(percent.y, 0, 100, 33, 67),
      },
      {
        x: round(-(center.x / 3.5)),
        y: round(center.y / 2),
      },
      {
        x: round(percent.x),
        y: round(percent.y),
        o: 1,
      }
    );
  };

  const interactEnd = (e: unknown, delay = 500) => {
    if (!animated) return;

    setTimeout(function () {
      const snapStiff = 0.01;
      const snapDamp = 0.06;

      springRotate.stiffness = snapStiff;
      springRotate.damping = snapDamp;
      springRotate.set({ x: 0, y: 0 }, { soft: 1 });

      springGlare.stiffness = snapStiff;
      springGlare.damping = snapDamp;
      springGlare.set({ x: 50, y: 50, o: 0 }, { soft: 1 });

      springBackground.stiffness = snapStiff;
      springBackground.damping = snapDamp;
      springBackground.set({ x: 50, y: 50 }, { soft: 1 });
    }, delay);
  };

  let dynamicStyles = $derived(
    animated
      ? `
    --pointer-x: ${springGlare.current.x}%;
    --pointer-y: ${springGlare.current.y}%;
    --pointer-from-center: ${clamp(
      Math.sqrt(
        (springGlare.current.y - 50) * (springGlare.current.y - 50) +
          (springGlare.current.x - 50) * (springGlare.current.x - 50)
      ) / 50,
      0,
      1
    )};
    --pointer-from-top: ${springGlare.current.y / 100};
    --pointer-from-left: ${springGlare.current.x / 100};
    --card-opacity: ${springGlare.current.o};
    --rotate-x: ${springRotate.current.x + springRotateDelta.current.x}deg;
    --rotate-y: ${springRotate.current.y + springRotateDelta.current.y}deg;
    --background-x: ${springBackground.current.x}%;
    --background-y: ${springBackground.current.y}%;
    --card-scale: ${springScale};
    --translate-x: ${springTranslate.current.x}px;
    --translate-y: ${springTranslate.current.y}px;
    --scale:${scale};
	`
      : ''
  );
</script>

{#if card}
  <div class:card__holder={animated} style={dynamicStyles} class="top">
    <div class="card__translater">
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="card__rotator"
        onpointermove={interact}
        onmouseout={interactEnd}
        onblur={interactEnd}
      >
        <div
          class="card"
          data-number="132"
          data-set="swsh9"
          data-subtypes="supporter"
          data-supertype="trainer"
          data-rarity="rare holo"
          data-trainer-gallery="false"
          style="--scale:{scale};"
        >
          {#if face == 'front'}
            <img src="{base}/cards/general/background.png" alt="Character" class="back" />
            <div class="card__shine back transformable"></div>
            <div class="card__glare back transformable"></div>

            <img src={actualCard.image} alt="Character" class="back image" />
            <img
              src="{base}/cards/general/{actualCard.gender}.png"
              alt="Cardbackground"
              class="back"
            />

            {#each locations as location}
              {#if actualCard.startLocation == undefined}
                <!-- If no start location is defined, show all no icons -->
              {:else if actualCard.startLocation.includes(location)}
                <img
                  src="{base}/cards/general/location-{location.toLocaleLowerCase()}-start.png"
                  alt={$getString(location)}
                  class="location back"
                />
              {:else if actualCard.forbiddenLocation.includes(location)}
                <img
                  src="{base}/cards/general/location-{location.toLocaleLowerCase()}-forbidden.png"
                  alt={$getString(location)}
                  class="location back"
                />
              {:else}
                <img
                  src="{base}/cards/general/location-{location.toLocaleLowerCase()}-blank.png"
                  alt={$getString(location)}
                  class="location back"
                />
              {/if}
            {/each}
            {#if actualCard.paranoiaLimit !== undefined}
              <img
                src="{base}/cards/general/paranoia-{actualCard.paranoiaLimit}.png"
                alt={$getString('paranoia')}
                class="paranoia back"
              />
            {/if}

            <h2>{actualCard.name}</h2>

            <ul class="abilities">
              {#each actualCard.abilities as ability}
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
                  {/if}
                  <div class="ability">
                    {#if ability.restrictedToLocation.length > 0}
                      <div>
                        {$getString('Only at')}: {ability.restrictedToLocation
                          .map($getString)
                          .join(', ')}
                      </div>
                    {/if}
                    {ability.description}
                  </div>
                </li>
              {/each}
            </ul>
            <ul class="tags">
              {#each actualCard.tags as tag}
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
            <div class="card__shine back transformable"></div>
            <div class="card__glare back transformable"></div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .top {
    height: calc(8.8cm * var(--scale, 1));
    width: calc(6.3cm * var(--scale, 1));
  }
  .card {
    box-sizing: border-box;
    break-inside: avoid;
    height: calc(8.8cm * var(--scale, 1));
    width: calc(6.3cm * var(--scale, 1));
    position: relative;
    border: calc(1px * var(--scale)) solid #ccc;
    border-radius: calc(0.2cm * var(--scale));
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

    font-size: calc(8pt * var(--scale));

    .image {
      object-fit: contain;
      object-position: bottom center;
      padding-top: calc(0.2cm * var(--scale));
      &[src*='tree'] {
        // hack for sacred tree
        // need to find a better way, but don't want to change every image
        object-fit: fill;
        padding: 0;
      }
    }
    .back {
      height: calc(8.8cm * var(--scale, 1));
      width: calc(6.3cm * var(--scale, 1));
      position: absolute;
    }
    h2 {
      position: absolute;
      display: flex;
      top: calc(1.6cm * var(--scale));
      left: calc(0.05cm * var(--scale));
      width: calc(0.7cm * var(--scale));
      height: calc(6cm * var(--scale));
      font-size: calc(11pt * var(--scale));
      align-items: center;
      justify-content: center;
      color: #cfcec7;

      margin: 0;
      writing-mode: vertical-lr;
      text-orientation: sideways;
      transform: rotate(180deg);
      // dark outline with layers of box-shadow
      text-shadow:
        0 0 1px #000,
        0 0 2px #000,
        0 0 3px #000,
        0 0 4px #000,
        0 0 5px #000,
        0 0 6px #000,
        0 0 7px #000,
        0 0 8px #000;
    }
    .abilities {
      position: absolute;
      display: flex;
      flex-direction: column;
      margin: 0;
      bottom: calc(0.3cm * var(--scale));
      right: calc(0.25cm * var(--scale));
      left: calc(1.1cm * var(--scale));
      color: white;
      & > li {
        margin-bottom: calc(-0.4cm * var(--scale));
      }
      & > li.active,
      & > li:last-child,
      & > li:has(+ .active) {
        margin-bottom: calc(-0.6cm * var(--scale));
      }
      div.ability {
        //metalic border
        // border: 1px solid #ccc;
        border-image: linear-gradient(to bottom, #ccc 60%, #0000 100%) 1;
        border-width: calc(1pt * var(--scale));
        border-style: solid;

        border-bottom: none;

        padding: calc(2pt * var(--scale)) calc(4pt * var(--scale));
        padding-bottom: calc(0.6cm * var(--scale));
        background: linear-gradient(to bottom, #0000005e 80%, #0000 100%);
        color: #fff;
        text-shadow:
          0 0 1px #000,
          0 0 2px #000,
          0 0 3px #000,
          0 0 4px #000,
          0 0 5px #000,
          0 0 6px #000,
          0 0 7px #000,
          0 0 8px #000;
        margin: 0;
        font-size: calc(8pt * var(--scale));
      }
    }
    .goodwillRank {
      display: flex;
      gap: 0cm;
      margin-bottom: calc(-0.3cm * var(--scale));
      margin-left: calc(0.55cm * var(--scale));
      li {
        list-style: none;

        margin-left: calc(-0.45cm * var(--scale));
      }
      img {
        width: calc(0.8cm * var(--scale));
      }
    }
    .perLoop {
      float: right;
      display: flex;
      gap: calc(0cm * var(--scale));
      margin-right: calc(0.2cm * var(--scale));
      margin-bottom: calc(-0.2cm * var(--scale));
      li {
        list-style: none;

        margin-left: calc(-0.45cm * var(--scale));
      }
      img {
        width: calc(0.55cm * var(--scale));
      }
    }
    .tags {
      list-style: none;

      position: absolute;
      display: flex;
      flex-direction: column;
      top: calc(1.75cm * var(--scale));
      right: calc(0.15cm * var(--scale));
      height: calc(6cm * var(--scale));
      font-size: calc(9pt * var(--scale));
      align-items: center;
      justify-content: top;

      li {
        display: inline-flex;
        align-items: center;
        gap: 0;
        margin: calc(-0.18cm * var(--scale)) 0;

        :global(svg) {
          // width: 1cm;
          height: calc(1cm * var(--scale));
          margin: 0 calc(-0.15cm * var(--scale));
          filter: drop-shadow(
            calc(1px * var(--scale)) calc(1px * var(--scale)) calc(2px * var(--scale)) #000
          );
        }

        div {
          display: inline-block;
          padding: calc(0.01cm * var(--scale)) calc(0.2cm * var(--scale));
          border-top: calc(0.02cm * var(--scale)) solid #152f32;
          border-bottom: calc(0.02cm * var(--scale)) solid #152f32;
          margin: 0 calc(0.03cm * var(--scale));
          // font-family: 'UnifrakturCook', serif;
          font-size: calc(8pt * var(--scale));
          color: #ffe68c;
          text-shadow:
            0 0 calc(4px * var(--scale)) #fff9c4,
            calc(1px * var(--scale)) calc(1px * var(--scale)) calc(2px * var(--scale)) #000;
          background: linear-gradient(to right, #204850, #3b7a75, #204850);
          box-shadow: 0 0 calc(10px * var(--scale)) rgba(0, 0, 0, 0.7);
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
