<script lang="ts" module>
  export const languageOverride = writable<string | undefined>(undefined);

  const safedLang = browser ? window.localStorage?.getItem('languageOverride') : null;
  if (safedLang) {
    languageOverride.set(safedLang);
  }
  languageOverride.subscribe((lang) => {
    if (browser) {
      if (lang === undefined) {
        window.localStorage.removeItem('languageOverride');
      } else {
        window.localStorage.setItem('languageOverride', lang);
      }
    }
  });

  export const navigationLanguage = writable<string>('en');
  export const language = derived(
    [languageOverride, navigationLanguage],
    ([languageOverride, navigationLanguage]) => {
      return languageOverride ?? navigationLanguage;
    }
  );

  export const getString: Readable<
    <TKey extends string | undefined>(key: TKey, ...args: ObjectFromTagedArray<TKey>) => string
  > = derived([language], ([$language]) => {
    return (<TKey extends string | undefined>(
      key: TKey,
      ...args: ObjectFromTagedArray<TKey>
    ): string => {
      if (!key) {
        return '';
      }

      return getStringForLanguage(key, $language, ...args);
    }) as any; // not sure why this is needed, the signature seems to be the same
  });

  function loadAlternatives(): Record<string, Record<string, string>> {
    if (!browser) {
      return {};
    }
    const currentValue = JSON.parse(
      localStorage.getItem('tragedyLooper:Alternetives') ?? '{}'
    ) as Record<string, Record<string, string>>;
    return currentValue;
  }
  const alternatives = writable(loadAlternatives());

  export const getAlternative = derived(
    [alternatives, language],
    ([alternatives, currentLang]) =>
      (key: string) => {
        if (alternatives[currentLang]?.[key]) {
          console.warn(
            `Using alternative for ${key} in ${currentLang}, but this is not a good idea, as it might not be the same as the original text.`
          );
        }
        return alternatives[currentLang]?.[key];
      }
  );

  export function updateAlternative(lang: string, key: string, value: string | undefined) {
    const alt = get(alternatives);
    if (!alt[lang]) {
      alt[lang] = {};
    }
    if (value != alt[lang][key]) {
      if (value) {
        alt[lang][key] = value;
      } else {
        delete alt[lang][key];
      }
      localStorage.setItem('tragedyLooper:Alternetives', JSON.stringify(alt));
      alternatives.set(alt);
    }
  }
</script>

<script lang="ts">
  import { base } from '$app/paths';
  import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
  import {
    getAllKeys,
    getDeployedLanguage,
    getStringForLanguage,
    type ObjectFromTagedArray,
  } from '../../translations';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Translation, { imageSets } from '../../view/translation.svelte';
  import { enableTranslationUi } from '../+layout.svelte';
  import {
    charactersLookup,
    incidentsLookup,
    isCharacterId,
    isKeywordId,
    isPlotId,
    isTagId,
    keywordsLookup,
    plotsLookup,
    rolesLookup,
    tagsLookup,
    tragedysLookup,
  } from '../../data';
  import { isTragedySetName } from '../../model/tragedySets';
  import { isRoleName, singleRolenames } from '../../model/roles';
  import { isIncidentName } from '../../model/incidents';

  let showOptionsDialog = $state(false);

  onMount(() => {
    console.log('Mounting layout');
    navigationLanguage.set(navigator.language?.split('-')[0] ?? 'en');
  });
</script>

<nav class="noPrint" role="group">
  <a href={`${base}/`}><Translation translationKey={'Home'} /></a>
  <button class="outline" aria-label="Options" onclick={() => (showOptionsDialog = true)}>
    <svg
      viewBox="-1.1, -1.1, 2.2, 2.2"
      width="1.2rem"
      height="1.2rem"
      style="--x: 681; --y: 184; --rotation: 0deg; --scale: 0.61;"
      class="s-sYs9p7LIfgJe"
      ><path
        d="M0,-1A1,1,0,0,1,0.15988118769183485,-0.9871362650729879L0.2603659668955609,-0.7670134048910356A0.81,0.81,0,0,1,0.35825383907739106,-0.7264669206414776L0.5849576749872154,-0.8110638189893267A1,1,0,0,1,0.7071067811865475,-0.7071067811865476A1,1,0,0,1,0.8110638189893267,-0.5849576749872155L0.7264669206414777,-0.35825383907739106A0.81,0.81,0,0,1,0.7670134048910356,-0.2603659668955608L0.9871362650729879,-0.15988118769183493A1,1,0,0,1,1,-6.123233995736766e-17A1,1,0,0,1,0.9871362650729879,0.1598811876918348L0.7670134048910356,0.2603659668955609A0.81,0.81,0,0,1,0.7264669206414777,0.35825383907739095L0.8110638189893269,0.5849576749872152A1,1,0,0,1,0.7071067811865476,0.7071067811865475A1,1,0,0,1,0.5849576749872157,0.8110638189893264L0.35825383907739106,0.7264669206414776A0.81,0.81,0,0,1,0.260365966895561,0.7670134048910355L0.15988118769183476,0.9871362650729879A1,1,0,0,1,1.2246467991473532e-16,1A1,1,0,0,1,-0.15988118769183496,0.9871362650729879L-0.2603659668955605,0.7670134048910358A0.81,0.81,0,0,1,-0.3582538390773912,0.7264669206414776L-0.5849576749872152,0.8110638189893269A1,1,0,0,1,-0.7071067811865475,0.7071067811865477A1,1,0,0,1,-0.8110638189893264,0.5849576749872157L-0.7264669206414776,0.3582538390773911A0.81,0.81,0,0,1,-0.7670134048910355,0.2603659668955611L-0.9871362650729879,0.15988118769183482A1,1,0,0,1,-1,1.8369701987210297e-16A1,1,0,0,1,-0.987136265072988,-0.15988118769183446L-0.7670134048910356,-0.2603659668955608A0.81,0.81,0,0,1,-0.7264669206414777,-0.35825383907739083L-0.8110638189893267,-0.5849576749872154A1,1,0,0,1,-0.7071067811865477,-0.7071067811865474A1,1,0,0,1,-0.5849576749872157,-0.8110638189893264L-0.35825383907739117,-0.7264669206414776A0.81,0.81,0,0,1,-0.26036596689556113,-0.7670134048910355L-0.15988118769183488,-0.9871362650729879A1,1,0,0,1,-2.4492935982947064e-16,-1L0,-0.43A0.43,0.43,0,1,0,0,0.43A0.43,0.43,0,1,0,0,-0.43Z"
        class="s-sYs9p7LIfgJe"
      ></path></svg
    >
  </button>
</nav>

<dialog open={showOptionsDialog}>
  <article>
    <header>
      <button aria-label="Close" rel="prev" onclick={() => (showOptionsDialog = false)}></button>
      <strong>{$getString('Options')}</strong>
    </header>

    <form>
      <label>
        <Translation translationKey={'Language'} />
        <input
          list="languageOptions"
          bind:value={$languageOverride}
          placeholder="Language Override"
        />
        <datalist id="languageOptions">
          {#each getDeployedLanguage() as lang}
            <option value={lang}>{lang}</option>
          {/each}
        </datalist>
      </label>
      <label>
        <input type="checkbox" role="switch" bind:checked={enableTranslationUi.highilghtMissing} />
        <Translation translationKey={'Highlight missing translations'} />
        <small>
          <Translation
            translationKey={'Highlights text that has no translation for your language.'}
          />
        </small>
      </label>
      <label>
        <input
          type="checkbox"
          role="switch"
          disabled={!enableTranslationUi.highilghtMissing}
          bind:checked={enableTranslationUi.inlineEdit}
        />
        <Translation translationKey={'Allow editing missing translations'} />
        <small>
          <Translation
            translationKey={'Clicking on a missing Translation will open the translation editor.'}
          />
        </small>
      </label>
      <label>
        <input
          type="checkbox"
          disabled={!enableTranslationUi.highilghtMissing || !enableTranslationUi.inlineEdit}
          role="switch"
          bind:checked={enableTranslationUi.editLocals}
        />
        <Translation translationKey={'Allow editiung localy stored translations'} />
        <small>
          <Translation
            translationKey={'When you have stored local translations, this will allow you to odit it with a click.'}
          />
        </small>
      </label>

      <label>
        <Translation translationKey={'Icon Set'} />
        <select bind:value={enableTranslationUi.iconSet}>
          {#each Object.keys(imageSets) as set}
            <option value={set}>{set}</option>
          {/each}
        </select>
        <small>
          <Translation
            translationKey={'You can change if text or icons should be used, and what nomiclatur should be used.'}
          />
        </small></label
      >
    </form>
    <footer>
      <button onclick={() => (showOptionsDialog = false)}>
        <Translation translationKey={'Close'} />
      </button>
    </footer>
  </article>
</dialog>

<slot />

<style>
  nav {
    display: flex;
    width: fit-content;
    box-shadow: 1px 1px 0.5rem var(--pico-secondary);
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    a {
      align-self: center;
      justify-self: center;
      margin: 0 2rem;
    }
    * {
      border-top-right-radius: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    button:has(svg) {
      border-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
    }
    svg {
      transition: fill var(--pico-transition);
      fill: var(--pico-color);
    }
  }
  dialog > article {
    label {
      small {
        margin-top: 0.2rem;
      }
    }
  }
  @media print {
    nav {
      display: none;
    }
  }
</style>
