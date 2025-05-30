<script lang="ts">
  import { distinct, join, keys } from '../../../misc';
	import { scripts as scriptLookup, isScriptName } from '../../../model/script';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import GmHelper from './gmHelper.svelte';
  import { getString } from '../+layout.svelte';
  import Translation from '../../../view/translation.svelte';
  import type { Script } from '../../../scripts.g';

	$: scripts = Object.values(scriptLookup);

  let selectedScript: Script | undefined;

  let searchParams: URLSearchParams | undefined;

  onMount(() => {
    searchParams = new URLSearchParams(document.location.search);
    const pushState = history.pushState;
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      pushState.apply(history, [data, unused, url]);
      searchParams = new URLSearchParams(document.location.search);
    };
  });

  $: setNumber = parseInt(searchParams?.get('setNumber') ?? '-1');
  $: setName = searchParams?.get('setName');
  $: title = searchParams?.get('title');
  $: author = searchParams?.get('author');

  $: serilizedScript = searchParams?.get('script');

  $: {
    if (setName && setNumber > -1) {
      selectedScript = scripts.filter(
        (x) => x.set?.some((x) => x.name == setName) && x.set?.some((x) => x.number == setNumber)
      )[0];
    } else if (isScriptName(title)) {
			selectedScript = scriptLookup[title];
    } else if (serilizedScript != undefined) {
      selectedScript = JSON.parse(serilizedScript);
    }
  }
</script>

<h1><Translation translationKey={'Mastermind Aid'} /></h1>

{#if selectedScript}
  <GmHelper {selectedScript} />
{:else}
  No Script
{/if}
