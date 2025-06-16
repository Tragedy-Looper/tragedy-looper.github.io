<script lang="ts" module>
  export function getAvialableCharacterImages() {
    return getContext<LayoutProps['data']>('characterImages').characterImages;
  }
  export function getAvialablePackageImages() {
    return getContext<LayoutProps['data']>('characterImages').tragedySetImages;
  }


  export function showTranslationMissingDialog(
    key: string,
    newTextCallback: (newText: string) => void
  ) {
    translationKey = key;
    translationCallback = newTextCallback;
    userTranslation = get(getString)(key);
    if (userTranslation.startsWith('«') && userTranslation.endsWith('»')) {
      userTranslation = userTranslation.slice(1, -1).trim();
    } else {
      userTranslation = '';
    }
  }

  const defaultSettings = {
    highilghtMissing: true,
    inlineEdit: false,
    editLocals: false,
    iconSet: 'zManText' as keyof typeof imageSets,
  };

  export let enableTranslationUi = $state(defaultSettings);

  let translationCallback = $state(undefined as undefined | ((newText: string) => void));
  let translationKey = $state(undefined as string | undefined);
  let userTranslation = $state('');
</script>

<script lang="ts">
  import { type LayoutProps } from './$types';
  import { setContext, getContext, onMount } from 'svelte';
  import { getString, language } from './(site)/+layout.svelte';
  import { addTranslation } from '../storage';
  import { get } from 'svelte/store';
  import { browser } from '$app/environment';
    import type { imageSets } from '../view/translation.svelte';

  const contextKey = 'characterImages';

  function submitTranslation() {
    if (!translationKey || !userTranslation || userTranslation.length === 0) {
      return;
    }
    addTranslation(translationKey, userTranslation, $language);

    if (translationCallback) {
      translationCallback(userTranslation);
    }
    translationKey = undefined;
    translationCallback = undefined;
    userTranslation = '';
  }

  let { data, children }: LayoutProps = $props();

  setContext(contextKey, data);

  onMount(() => {
    if (browser) {
      const settings = JSON.parse(window.localStorage.getItem('tragedy_looper_settings') ?? '{}');
      if (settings) {
        for (const key in settings) {
          enableTranslationUi[key as keyof typeof enableTranslationUi] = settings[key];
        }
      }
    }
  });

  $effect(() => {
    window.localStorage.setItem('tragedy_looper_settings', JSON.stringify(enableTranslationUi));
  });

  function closeDialog() {
    translationKey = undefined;
    translationCallback = undefined;
    userTranslation = '';
  }
</script>

{@render children()}

<dialog open={translationKey !== undefined} class="translationMissingDialog">
  <article>
    <header>
      <button aria-label="Close" rel="prev" onclick={() => closeDialog()}></button>
      <p>
        <strong>{$getString('Missing Translation')}</strong>
      </p>
    </header>
    <p>{$getString('The translation for this text is missing.')}</p>
    <p>{$getString('The missing translation:')}</p>
    <p class="quote">{translationKey}</p>
    <textarea bind:value={userTranslation}></textarea>
    <p>
      {$getString('If you translate the text it will be used in this Browser.')}
    </p>
    <p>
      {$getString('Please consider contributing to the translations and submit it to')}

      <a href="https://github.com/LokiMidgard/tragedy-looper-deduction-tool/issues">GitHub</a>.
      {$getString('That way everyone can benefit from your translation.')}
    </p>

    <footer>
      <button class="outline" style="float: left;" onclick={() => closeDialog()}
        >{$getString('Close')}</button
      >
      <button disabled={!userTranslation} onclick={() => submitTranslation()}
        >{$getString('Submit')}</button
      >
    </footer>
  </article>
</dialog>

<style>
  .quote {
    font-style: italic;
    color: var(--pico-secondary);
    margin: 0.5rem 0;
  }
</style>
