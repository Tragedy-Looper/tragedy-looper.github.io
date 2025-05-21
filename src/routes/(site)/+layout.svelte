<script lang="ts">
  import { base } from '$app/paths';
  import { getString as getStringOriginal } from '../../translations';
  import { onMount } from 'svelte';

  let lang: string;
  $: getString = (key: string, ...args: any[]) => {
    return getStringOriginal(key, lang, ...args);
  };
  onMount(() => {
    lang = navigator.language?.split('-')[0];
  });
</script>

<a href={`${base}/`}>{getString('Home')}</a>

<slot />

<style>
  @media print {
    a {
      display: none;
    }
  }
</style>
