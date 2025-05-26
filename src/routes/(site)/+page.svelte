<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import { onMount } from 'svelte';
  import { getMissingForLanguage } from '../../translations';
  import Card from './cards/card.svelte';
  import { getString } from './+layout.svelte';

  let lang: string;
  onMount(() => {
    lang = navigator.language?.split('-')[0];
  });
  $: missingTranslation = getMissingForLanguage(lang);
</script>

<main class="container">
  <div class="cards">
    <Card
      scale={0.5}
      animated
      card={{
        abilities: [],
        forbiddenLocation: [],
        gender: 'diverse',
        image: `${base}/cards/characters/hero_A.png`,
        name: $getString('Hero A'),
        tags: [],
        type: 'character',
        paranoiaLimit: undefined,
        startLocation: undefined,
      }}
    />
    <Card
      scale={0.5}
      animated
      card={{
        abilities: [],
        forbiddenLocation: [],
        gender: 'diverse',
        image: `${base}/cards/characters/hero_B.png`,
        name: $getString('Hero B'),
        tags: [],
        type: 'character',
        paranoiaLimit: undefined,
        startLocation: undefined,
      }}
    />
    <Card
      scale={0.5}
      animated
      card={{
        abilities: [],
        forbiddenLocation: [],
        gender: 'diverse',
        image: `${base}/cards/characters/hero_C.png`,
        name: $getString('Hero C'),
        tags: [],
        type: 'character',
        paranoiaLimit: undefined,
        startLocation: undefined,
      }}
    />
  </div>
  <h1>{$getString('Tragedy Looper Deduction Sheet Overview')}</h1>
  <article>
    <p>
      {$getString("If you're the Mastermind,")}
      <a href="{base}/script">{$getString('choose a script (SPOILER!!)')}</a>.
    </p>
    <p>{$getString('Otherwise, ask your Mastermind to choose a script and send you the link.')}</p>
  </article>
  <article>
    <p>
      <a href="{base}/cards"
        >{$getString(
          "If translations exist, you'll find localized character cards by following this link."
        )}</a
      >
    </p>
    <div class="cards">
      <Card scale={0.3} animated face='back' card={'Boy Student'} />
      <Card scale={0.3} animated face='back' card={'Girl Student'} />
      <Card scale={0.3} animated face='back' card={'Black Cat'} />
    </div>
  </article>
  <article>
    <p>
      {$getString('Feedback (in English) is appriciated on')}
      <a href="https://github.com/LokiMidgard/tragedy-looper-deduction-tool#readme">Github</a>
      {$getString('or')}
      <a
        href="https://boardgamegeek.com/thread/3066363/website-generate-script-specific-mastermind-and-pl"
        >Board Game Geek</a
      >.
    </p>
  </article>
  <article>
    {#if missingTranslation.length > 0}
      <p>
        {$getString(
          'For your Language there are missing translations, if you have time and fun you can help and add some localisations using the below. And post them on Github.'
        )}<br />
        <a href={`${base}/translations`}>{$getString('Translation Overview')} </a>
      </p>
    {:else}
      <p>
        <a href={`${base}/translations`}>{$getString('Translation Overview')} </a>
      </p>
    {/if}
  </article>
  <div class="cards" style="margin-bottom: 3rem;">
    <Card
      scale={0.5}
      animated
      card={{
        abilities: [],
        forbiddenLocation: [],
        gender: 'diverse',
        image: `${base}/cards/characters/writer.png`,
        name: $getString('Writer'),
        tags: [],
        type: 'character',
        paranoiaLimit: undefined,
        startLocation: undefined,
      }}
    />
  </div>
</main>

<style>
  .cards {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    justify-content: center;
    align-content: center;
    transform-style: preserve-3d;
    perspective: 1000px;
    & > :global(*) {
      transform: translateY(-13px) rotateY(-5deg);
    }
    & > :global(:first-child) {
      transform: translateZ(-20px) translateX(20px) rotateY(-5deg) rotateZ(-15deg);
    }
    & > :global(:last-child) {
      transform: translateZ(20px) translateX(-20px) rotateY(-5deg) rotateZ(15deg);
    }
    & > :global(:only-child) {
      transform: rotateY(0deg) rotateZ(0deg);
    }
  }
</style>
