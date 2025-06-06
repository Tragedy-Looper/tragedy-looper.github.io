<script lang="ts" module>
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { getAlternative, language, updateAlternative } from '../+layout.svelte';
  import Translation from '../../../view/translation.svelte';
</script>

<script lang="ts">
  let {
    lang,
    key,
    alternatives,
  }: { lang: string; key: string; alternatives: { original: string; text: string[] }[] } = $props();

  let allAlternetives = $derived(
    alternatives.flatMap((x) => x.text).toSorted((a, b) => a.localeCompare(b))
  );
  let original = $derived(
    alternatives.flatMap((x) => x.original).toSorted((a, b) => a.localeCompare(b))[0] ?? 'UNKNOWN' // should all be the same
  );

  let selectedAlternative = $state(get(getAlternative)(key));
  $effect(() => {
    updateAlternative(lang, key, selectedAlternative);
  });
</script>

<label>
  <input type="radio" name={key} value={undefined} bind:group={selectedAlternative} />
  {original} <small>(<Translation translationKey="default" />)</small>
</label>
{#each allAlternetives as alternative}
  <label>
    <input type="radio" name={key} value={alternative} bind:group={selectedAlternative} />
    {alternative}
  </label>
{/each}

<style>
  label > input[type='radio'] ~ small {
    margin-top: 0;
    margin-left: 2rem;
  }
</style>
