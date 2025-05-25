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
</script>

<script lang="ts">
  import { base } from '$app/paths';
  import { derived, writable, type Readable, type Writable } from 'svelte/store';
  import {
    getAllKeys,
    getDeployedLanguage,
    getStringForLanguage,
    type ObjectFromTagedArray,
  } from '../../translations';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  onMount(() => {
    console.log('Mounting layout');
    navigationLanguage.set(navigator.language?.split('-')[0] ?? 'en');
  });
</script>

<article role="group">
  <a href={`${base}/`}>{$getString('Home')}</a>
  <input list="languageOptions" bind:value={$languageOverride} placeholder="Language Override" />
  <datalist id="languageOptions">
    {#each getDeployedLanguage() as lang}
      <option value={lang}>{lang}</option>
    {/each}
  </datalist>
</article>

<slot />

<style>
  @media print {
    a {
      display: none;
    }
  }
  article {
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
    input {
      width: 30rempx;
    }
  }
</style>
