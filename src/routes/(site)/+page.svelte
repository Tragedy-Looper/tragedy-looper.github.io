<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import { onMount } from 'svelte';
  import { getMissingForLanguage, translationExists } from '../../translations';
  import Card from './cards/card.svelte';
  import { getString, language } from './+layout.svelte';
  import Translation from '../../view/translation.svelte';

  // iso 639-1 language code
  type Language = 'en' | 'de' | 'fr' | 'es' | 'it' | 'ja' | 'ko' | 'zh';

  const languageToFlag: Record<Language, string> = {
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷',
    es: '🇪🇸',
    it: '🇮🇹',
    ja: '🇯🇵',
    ko: '🇰🇷',
    zh: '🇨🇳',
  };

  // flag emojis for languages

  let lang: string;
  onMount(() => {
    lang = navigator.language?.split('-')[0];
  });
  $: missingTranslation = getMissingForLanguage(lang);
</script>

<main class="container">
  <hgroup>
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
    <h1><Translation translationKey={'Tragedy Looper Deduction Sheet Overview'} /></h1>
    <span></span>
  </hgroup>
  <article>
    <header>
      <strong><Translation translationKey={'Scripts'} /></strong>
    </header>
    <p>
      <Translation
        translationKey={'Here you will find a list of scripts. Use one of them, or create your own.'}
      />
    </p>
    <p>
      <Translation
        translationKey={"If you're the Mastermind, [choose a script (SPOILER!!)](/script)."}
      />
    </p>
    <p>
      <Translation
        translationKey={'Otherwise, ask your Mastermind to choose a script and send you the link.'}
      />
    </p>
  </article>
  <article>
    <header>
      <strong><Translation translationKey={'Character Cards'} /></strong>
    </header>
    <p>
      <a href="{base}/cards"
        >{$getString(
          "If translations exist, you'll find localized character cards by following this link."
        )}</a
      >
    </p>
    <a href="{base}/cards">
      <div class="cards">
        <Card scale={0.3} animated face="back" card={'boyStudent'} />
        <Card scale={0.3} animated face="back" card={'girlStudent'} />
        <Card scale={0.3} animated face="back" card={'blackCat'} />
      </div>
    </a>
  </article>
  <article>
    <header>
      <strong><Translation translationKey={'Rei Board'} /></strong>
    </header>
    <p>
      <Translation
        translationKey={'Not yet completed. But here is the current version of the Rei Board.'}
      />
    </p>
    <a href="{base}/board/rei">
      <img
        src={`${base}/board/rei/preview.png`}
        alt={$getString('Gear Sample')}
        style="width: 100%; max-width: 500px; margin: 0 auto; display: block;"
      /></a
    >
  </article>
  <article>
    <header>
      <strong><Translation translationKey={'Feedback'} /></strong>
    </header>
    <p>
      <Translation translationKey={'This is a community project, so it is not perfect.'} />
      <Translation translationKey={'If you find bugs or have suggestions, please let me know.'} />
      {$getString(
        'Through I may not have time to fix it. But I will be happy to integrate your contributions.'
      )}
    </p>
    <p>
      {$getString('Feedback (in English) is appriciated on')}
      <a
        href="https://github.com/LokiMidgard/tragedy-looper-deduction-tool#readme"
        target="_blank"
        rel="noopener noreferrer">Github</a
      >
      <Translation translationKey={'or'} />
      <a
        href="https://boardgamegeek.com/thread/3066363/website-generate-script-specific-mastermind-and-pl"
        target="_blank"
        rel="noopener noreferrer">Board Game Geek</a
      >.
    </p>
    <p>
      <Translation
        translationKey={'But I had problems getting notifications from BGG, so Github is preferred.'}
      />
    </p>
  </article>
  <article>
    <header>
      <strong><Translation translationKey={'Translations'} /></strong>
    </header>
    {#if missingTranslation.length > 0}
      <p>
        {$getString(
          'For your Language there are missing translations, if you have time and fun you can help and add some localisations using the below. And post them on Github.'
        )}<br />
        <a href={`${base}/translations`}
          ><Translation translationKey={'Translation Overview'} />
        </a>
      </p>
    {:else}
      <p>
        <a href={`${base}/translations`}
          ><Translation translationKey={'Translation Overview'} />
        </a>
      </p>
    {/if}
  </article>
  <article>
    <header>
      <strong><Translation translationKey={'Additional Links'} /></strong>
    </header>
    <p>
      <Translation
        translationKey={'Here are some additonal interesting links related to Tragedy Looper.'}
      />
    </p>
    <ul>
      {#snippet entry(
        title: string,
        description: string,
        link: string,
        languages: Language[] = [],
        partialLanguages: Language[] = []
      )}
        <li>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
          {#if languages.length > 0}
            <span class="language">
              {#each languages as lang}
                {languageToFlag[lang]}&nbsp;
              {/each}
            </span>
          {/if}
          {#if partialLanguages.length > 0}
            (<Translation translationKey={'partially'} />
            <span class="language">
              {#each partialLanguages as lang}
                {languageToFlag[lang]}&nbsp;
              {/each}
            </span>)
          {/if}
          <p>{description}</p>
        </li>
      {/snippet}

      {@render entry(
        'WizKids English release',
        $getString('The current English edition for sale.'),
        'https://shop.wizkids.com/products/tragedy-looper-new-tragedies',
        ['en']
      )}
      {@render entry(
        'Rooper Udonarium',
        $getString('A website to play Tragedy Looper Online, with an English interface and cards.'),
        `https://d3snr6xc5uvnuy.cloudfront.net/rooper-udonarium/udonarium/?lang=${lang == 'ja' ? 'ja' : 'en'}`,
        ['ja'],
        ['en']
      )}
      {@render entry(
        'Tabletop Simulator',
        $getString('Tabletop Simulator Mod'),
        'https://steamcommunity.com/workshop/filedetails/?id=3460409203',
        ['en']
      )}
      {@render entry(
        'TTS Club Discord',
        $getString('Sessions are hosted semi-regularly here. It's recommended to use the KeywordTracker plugin via BetterDiscord.'),
        'https://discord.com/channels/90897972715352064/208223653077319681',
        ['en']
      )}
      {@render entry(
        'Tragedy Looper Generator',
        $getString('A website to generate scripts'),
        'https://alephtwo.github.io/tragedy-looper-generator/',
        ['en']
      )}

      {@render entry(
        'Melodice Playlist',
        $getString('A playlist for Tragedy Looper'),
        'https://melodice.org/playlist/tragedy-looper-2011/'
      )}
      {@render entry(
        'BoardGameGeek',
        $getString('BGG page.'),
        'https://boardgamegeek.com/boardgame/148319/tragedy-looper',
        ['en']
      )}
      {@render entry(
        'JP Wiki',
        $getString('A fan wiki with lots of information.'),
        'https://w.atwiki.jp/rooper',
        ['ja']
      )}
      {@render entry(
        'DLSite Store',
        $getString('Japanese storefront.'),
        'https://www.dlsite.com/home/fsr/=/title_id/SRI0000043091/order/title_d/from/work.titles',
        ['ja']
      )}
    </ul>
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
  main {
    --columns: 3;
    display: grid;
    /* grid-template-columns: 1fr 1fr; */
    /* grid-auto-columns: 1fr; */
    /* grid-auto-columns: 1fr; */
    /* grid-template-columns: 1fr; */
    /* grid-template-rows: auto auto 1fr; */
    grid-template-columns: repeat(var(--columns), 1fr);
    @media (max-width: 1600px) {
      --columns: 2;
    }
    @media (max-width: 800px) {
      --columns: 1;
    }
    gap: 1rem;
  }

  main > :last-child,
  hgroup {
    grid-column: span var(--columns);
  }

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

  .language {
    font-family: 'Noto Sans', 'Twemoji', sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    font-variation-settings: 'wdth' 100;
  }
</style>
