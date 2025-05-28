<script lang="ts">
  import { distinct, join } from '../../../misc';
  import { scripts as scriptLookup } from '../../../model/script';
  import ScriptDetails from './scriptDetails.svelte';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import ExportView from '../../../view/exportView.svelte';
  import { loadAllLocalScripts, loadScript } from '../../../storage';
  import type { Script } from '../../../scripts.g';
  import Rating from './rating.svelte';

  $: scripts = Object.values(scriptLookup);

  let selectedScript:
    | (Script & { local: true | undefined })
    | (Script & { local: true | undefined })[]
    | undefined;

  let searchParams: URLSearchParams | undefined;

  let ownScripts: Script[] = [];
  onMount(() => {
    searchParams = new URLSearchParams(document.location.search);
    const pushState = history.pushState;
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      pushState.apply(history, [data, unused, url]);
      searchParams = new URLSearchParams(document.location.search);
    };

    ownScripts = loadAllLocalScripts();
  });

  $: setNumber = parseInt(searchParams?.get('setNumber') ?? '-1');
  $: setName = searchParams?.get('setName');
  $: title = searchParams?.get('title');
  $: author = searchParams?.get('author');

  $: serilizedScript = searchParams?.get('script');

  $: {
    if (serilizedScript != undefined) {
      selectedScript = JSON.parse(serilizedScript);
    } else if (searchParams) {
      const search = {
        title,
        author,
        set: setName && setNumber > -1 ? { name: setName, number: setNumber } : undefined,
      };

      const loading = loadScript(search);
      if (loading?.length === 1) {
        selectedScript = loading[0];
      } else {
        selectedScript = loading;
      }
    }

    // if (setName && setNumber > -1) {

    //   selectedScript = scripts.filter(
    //     (x) => x.set?.name == setName && x.set?.number == setNumber
    //   )[0];
    // } else if (isScriptName(title)) {
    //   selectedScript = scriptLookup[title];
    // } else if (serilizedScript != undefined) {
    //   selectedScript = JSON.parse(serilizedScript);
    // }
  }

  let exportJson: string | undefined;

  function exportSet(setName: string) {
    exportJson = JSON.stringify(
      scripts.filter((x) => x.set?.name == setName),
      undefined,
      2
    );
  }
</script>

<ExportView bind:exportJson />

<main class="container">
  <!-- <main class="container"> -->
  {#if Array.isArray(selectedScript)}
    <h1>There where more scripts matching please select one.</h1>
    <article>
      {#each selectedScript as s}
        <div>
          <a href={`${base}/script/?script=${encodeURIComponent(JSON.stringify(s))}`}
            >{s.set?.number ?? ''}
            {s.set?.name ?? ''}
            {s.title} by {s.creator} [{s.tragedySet}] difficulty {join(
              s.difficultySets?.map((x) => x.difficulty.toString()) ?? [],
              ' / '
            )}
            {s.local ? '(local script)' : ''}</a
          >
        </div>
      {/each}
    </article>
  {:else if selectedScript}
    <article>
      <ScriptDetails script={selectedScript} />
    </article>
  {/if}

  <a role="button" href={`${base}/script/customScript/`}>Create your own</a>
  <h1>…or use other Scripts</h1>

  {#if ownScripts.length > 0}
    <article>
      <header>
        <h2>Your Creations</h2>
      </header>
      {#each ownScripts as s}
        <div>
          <a href={`${base}/script/?script=${encodeURIComponent(JSON.stringify(s))}`}
            >{s.set?.number ?? ''}
            {s.title} by {s.creator} [{s.tragedySet}] difficulty {join(
              s.difficultySets?.map((x) => x.difficulty.toString()) ?? [],
              ' / '
            )}</a
          >
        </div>
      {/each}
    </article>
  {/if}

  {#each distinct(scripts
      .map((key) => key.set?.name)
      .sort( (a, b) => (a == undefined ? (b == undefined ? 0 : -1) : b == undefined ? 1 : a.localeCompare(b)) )) as set}
    <article>
      <header>
        <button
          on:click={() => exportSet(set)}
          class="outline"
          style="float: right; width: fit-content;">Export</button
        >
        <h2>{set ?? 'Independent'}</h2>
      </header>
      {#each scripts
        .filter((x) => x.set?.name == set)
        .sort((a, b) => (a.set?.number ?? 0) - (b.set?.number ?? 0)) as s}
        {#if s}
          <div>
            <a href={`${base}/script/?title=${encodeURIComponent(s.title)}`}
              >{s.set?.number ?? ''}
              {s.title} by {s.creator}</a
            ><br />
            [{s.tragedySet}] difficulty {join(
              s.difficultySets.map((x) => x.difficulty.toString()),
              ' / '
            )}
            {#if s.rating}
              <br /><Rating rating={s.rating} />
            {/if}
          </div>
        {/if}
      {/each}
    </article>
  {/each}

  <!-- </main> -->
</main>

<style>
</style>
