<script lang="ts">
  import { distinct, join } from '../../../misc';
  import { scripts as scriptLookup } from '../../../model/script';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import ExportView from '../../../view/exportView.svelte';
  import { loadAllLocalScripts, loadScript } from '../../../storage';
  import type { Script } from '../../../scripts.g';
  import Rating from './rating.svelte';
  import Translation from '../../../view/translation.svelte';
  import { getAvialablePackageImages } from '../../+layout.svelte';

  const scripts = Object.values(scriptLookup);

  let searchParams = $state(undefined as URLSearchParams | undefined);

  let ownScripts: Script[] = $state([]);
  onMount(() => {
    searchParams = new URLSearchParams(document.location.search);
    const pushState = history.pushState;
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      pushState.apply(history, [data, unused, url]);
      searchParams = new URLSearchParams(document.location.search);
    };

    ownScripts = loadAllLocalScripts();
  });

  const tabs = ['own', 'set', 'tragedy'] as const;

  let tab = $derived.by(() => {
    const defaultTab = ownScripts.length > 0 ? 'own' : 'tragedy';
    const selected = searchParams?.get('tab') ?? defaultTab;
    return (
      tabs.includes(selected as (typeof tabs)[number]) ? selected : defaultTab
    ) as (typeof tabs)[number];
  });

  let setName = $derived(searchParams?.get('setName'));
  let title = $derived(searchParams?.get('title'));
  let author = $derived(searchParams?.get('author'));

  let selectedSet = $state('');

  let serilizedScript = $derived(searchParams?.get('script'));

  const packageImages = getAvialablePackageImages() ?? {};

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

  <a role="button" href={`${base}/script/customScript/`}>Create your own</a>
  <h1>…or use other Scripts</h1>
  <header>
    <nav>
      <ul>
        {#if ownScripts.length > 0}
          <li>
            <label>
              <input type="radio" bind:group={tab} value="own" />
              <Translation translationKey={'Own Scripts'} />
            </label>
          </li>
        {/if}
        <li>
          <label>
            <input type="radio" bind:group={tab} value="tragedy" />
            <Translation translationKey={'By Tragedy set'} />
          </label>
        </li>
        <li>
          <label>
            <input type="radio" bind:group={tab} value="set" />
            <Translation translationKey={'By Box'} />
          </label>
        </li>
      </ul>
    </nav>
  </header>

  {#if ownScripts.length > 0 && tab == 'own'}
    <article>
      <header>
        <h2>Your Creations</h2>
      </header>
      {#each ownScripts as s}
        <div>
          <a href={`${base}/script/overview/?script=${encodeURIComponent(JSON.stringify(s))}`}
            >{s.set?.number ?? ''}
            {s.title} by {s.creator} [{s.tragedySet}] difficulty {join(
              s.difficultySets?.map((x) => x.difficulty.toString()) ?? [],
              ' / '
            )}</a
          >
        </div>
      {/each}
    </article>
  {:else if tab == 'tragedy'}
    {#each distinct(scripts
        .map((key) => key.tragedySet)
        .sort( (a, b) => (a == undefined ? (b == undefined ? 0 : -1) : b == undefined ? 1 : a.localeCompare(b)) )) as set}
      <article>
        <header>
          <button
            onclick={() => exportSet(set)}
            class="outline"
            style="float: right; width: fit-content;">Export</button
          >
          <h2>{set ?? 'Independent'}</h2>
        </header>
        {#each scripts
          .filter((x) => x.tragedySet == set)
          .sort((a, b) => a.title.localeCompare(b.title)) as s}
          {#if s}
            {@render scriptEntry(s)}
          {/if}
        {/each}
      </article>
    {/each}
  {:else}
    {#each distinct(scripts
        .map((key) => key.set?.name)
        .sort( (a, b) => (a == undefined ? (b == undefined ? 0 : -1) : b == undefined ? 1 : a.localeCompare(b)) )) as set}
      <input type="radio" id="select_{set}" bind:group={selectedSet} value={set} />
      <article class="hideBoxArt">
        <header>
          {#if set}
            <button
              onclick={() => exportSet(set)}
              class="outline"
              style="float: right; width: fit-content;">Export</button
            >
          {/if}
          <h2>{set ?? 'Independent'}</h2>
        </header>
        {#each scripts
          .filter((x) => x.set?.name == set)
          .sort((a, b) => (a.set?.number ?? 0) - (b.set?.number ?? 0)) as s}
          {#if s}
            {@render scriptEntry(s)}
          {/if}
        {/each}
      </article>
    {/each}
    <div class="boxHolder">
      {#each distinct(scripts
          .map((key) => key.set?.name)
          .filter((x) => (x?.length ?? 0) > 0)
          .sort( (a, b) => (a == undefined ? (b == undefined ? 0 : -1) : b == undefined ? 1 : a.localeCompare(b)) )) as set}
        <label class="cover" for="select_{set}" class:checked={set == selectedSet}>
          {#if set && set in packageImages}
            <img alt="{set} cover" src={packageImages[set as keyof typeof packageImages]} />
          {:else}
            <Translation translationKey={set} />
          {/if}
        </label>
      {/each}
    </div>
  {/if}

  <!-- </main> -->
</main>

{#snippet scriptEntry(s: Script)}
  <div style="margin-bottom: 0.5em;">
    <a href={`${base}/script/overview/?title=${encodeURIComponent(s.title)}`}>
      {s.title} by {s.creator}</a
    ><br />

    <em style="display: block;">
      <Translation translationKey={s.set?.name ?? 'Independent'} />
      {s.set?.number ? `${s.set.number} ` : ''}
    </em>

    <Translation translationKey={'Tragedy'} />
    <strong>
      {s.tragedySet}
    </strong>

    {#if s.difficultySets && s.difficultySets.length > 0}
      difficulty {join(
        s.difficultySets.map((x) => x.difficulty.toString()),
        ' / '
      )}
    {/if}
    {#if s.rating}
      <br /><Rating rating={s.rating} />
    {/if}
  </div>
{/snippet}

<style>
  label > input {
    display: none;
  }
  nav {
    border-bottom: 1px solid var(--pico-color);
    margin-bottom: var(--pico-spacing);
    li {
      padding-bottom: 0;
    }
  }

  .boxHolder {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
  }

  label.cover {
    /* --aspect: calc(151.422 / 220.719);
    --height: 18rem;
    height: var(--height);
    width: calc(var(--height) * var(--aspect));
     */
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    text-align: center;

    height: fit-content;
    width: fit-content;

    &:has(img) {
      &.checked {
        overflow: visible;
        img {
          /* box-shadow: 0 0 1.5rem var(--pico-primary); */
        }
      }
      img {
        /* width: 100%;
        height: 100%; */
        max-width: 18rem;
        max-height: 18rem;
        object-fit: contain;
        object-position: center;
      }
    }

    &.checked {
      box-shadow: 0 0 1.5rem var(--pico-primary);
    }
    &:not(:has(img)) {
      --aspect: calc(151.422 / 220.719);
      --height: 18rem;
      height: var(--height);
      width: calc(var(--height) * var(--aspect));
      background-color: var(--pico-background-color);
      border: 1px solid var(--pico-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  input:has(+ .hideBoxArt) {
    display: none;
  }
  input + .hideBoxArt {
    display: none;
  }

  input:checked + .hideBoxArt {
    display: block;
  }

  label {
    padding: 0.5rem;
    margin-bottom: 0;
    transition: color 0.5s ease-in-out;
    &:has(input:checked) {
      color: var(--pico-primary);
      border: 1px solid var(--pico-primary);
      border-bottom: 1px solid var(--pico-background-color);
      margin-bottom: -1px;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;

      /* color:red; */
    }
    &:hover {
      background-color: var(--primary);
      color: var(--pico-primary-hover);
    }
  }
</style>
