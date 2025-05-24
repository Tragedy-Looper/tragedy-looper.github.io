<script lang="ts">
  import '@picocss/pico/css/pico.css';
  import {
    getAllKeys,
    getAllTranslationsForLanguage,
    getMissingForLanguage,
    getString,
  } from '../../../translations';
  import { distinct } from '../../../misc';
  import { onMount } from 'svelte';
  import ExportView from '../../../view/exportView.svelte';
  import { getLocalisatio, setLocalisatio } from '../../../storage';
  import { browser } from '$app/environment';

  let lang: string;
  onMount(() => {
    lang = navigator.language?.split('-')[0];
  });
  $: missingTranslation = getMissingForLanguage(lang);
  const allKeys = getAllKeys();

  $: table = getAllTranslationsForLanguage(lang);

  $: browser ? setLocalisatio(lang, table) : undefined;

  let exportJson: string | undefined;
  let exportAllJson: string | undefined;

  let filterMissing = true;

  function exportData() {
    console.log('exportng');
    exportJson = JSON.stringify(
      Object.fromEntries(
        Object.entries(getLocalisatio(lang))
          .filter(([key, value]) => value?.length ?? 0 > 0)
          .map(([key, value]) => [key, value.trim()] as const)
      ),
      undefined,
      2
    );
  }
  function exportAllData() {
    console.log('exportng');
    const localisation = getLocalisatio(lang);
    exportAllJson = JSON.stringify(
      Object.fromEntries(
        allKeys
          .map((key) => [key, table[key]?.trim() ?? ''] as const)
          .sort(([keya, a], [keyB, b]) =>
            a.length > 0 == b.length > 0 ? keya.localeCompare(keyB) : b.length - a.length
          )
      ),
      undefined,
      2
    );
  }
</script>

<ExportView bind:exportJson={exportAllJson} />
<ExportView bind:exportJson />

<main class="container">
  <h1>{getString('Missing Translations', lang)} 🏗️</h1>
  <p>
    {getString(
      "This should list all texts and keywords used, but not yet translated into your language. However, it's not applied everywhere yet. The Player Aid should be completely set, but others are missing.",
      lang
    )}
  </p>
  <p>
    {getString(
      'If you translated something, please open an issue on Github and post the exported text, or submit a pull request.',
      lang
    )}
  </p>
  <p>
    {getString(
      'After I include your text, everyone should be able to see the translations online  Currently, your translations are stored in your browser, so you can check if it works as intended. These are marked with «»',
      lang
    )}
  </p>
  <p>
    <a href="https://lokimidgard.github.io/tragedy-looper-deduction-">Github Reposetory</a>
  </p>

  <label>
    {getString('Language', lang)}
    <input type="tel" bind:value={lang} />
  </label>

  <button on:click={() => exportData()}>Export</button>
  <button on:click={() => exportAllData()}>Export All tags</button>

  <label>
    {getString('Only show Missing', lang)}
    <input type="checkbox" role="switch" bind:checked={filterMissing} />
  </label>

  {#if lang}
    <table>
      <colgroup>
        <col style="width: min-content;" />
        <col style="width: 70%;" />
      </colgroup>
      <thead>
        <tr>
          <th>
            {getString('Key', lang)}
          </th>
          <th>
            {getString('Translation', lang)}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each distinct(filterMissing ? missingTranslation : allKeys).sort() as e}
          <tr>
            <td>{e}</td>
            <td>
              <textarea bind:value={table[e]} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
</style>
