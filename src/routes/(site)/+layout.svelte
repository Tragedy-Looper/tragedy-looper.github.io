<script lang="ts" module>
  export const languageOverride = writable<string | undefined>(undefined);
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
  import { getStringForLanguage, type ObjectFromTagedArray } from '../../translations';
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('Mounting layout');
    navigationLanguage.set(navigator.language?.split('-')[0] ?? 'en');
  });
</script>

<a href={`${base}/`}>{$getString('Home')}</a>

<slot />

<style>
  @media print {
    a {
      display: none;
    }
  }
</style>
