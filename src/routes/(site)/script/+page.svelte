<script lang="ts">
  import { distinct, join } from '../../../misc';
  import { scripts as scriptLookup } from '../../../model/script';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import ExportView from '../../../view/exportView.svelte';
  import {
    deleteLocalScript,
    getPlayedScripts,
    loadAllLocalScripts,
    loadScript,
    savePlayedScripts,
  } from '../../../storage';
  import type { Script } from '../../../scripts.g';
  import Rating from './rating.svelte';
  import Translation from '../../../view/translation.svelte';
  import { getAvialablePackageImages } from '../../+layout.svelte';
  import { linkOverview } from './overview/+page.svelte';
  import { tragedysLookup } from '../../../data';

  const scripts = Object.values(scriptLookup);

  let searchParams = $state(undefined as URLSearchParams | undefined);

  let playedScripts: string[] = $state([]);

  let shouldDeleteScript = $state(undefined as Script | undefined);

  let ownScripts: Script[] = $state([]);
  onMount(async () => {
    playedScripts = getPlayedScripts();
    searchParams = new URLSearchParams(document.location.search);
    const pushState = history.pushState;
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      pushState.apply(history, [data, unused, url]);
      searchParams = new URLSearchParams(document.location.search);
    };

    ownScripts = await loadAllLocalScripts();
  });

  const tabs = ['own', 'set', 'tragedy'] as const;

  let tab = $derived.by(() => {
    const defaultTab = ownScripts.length > 0 ? 'own' : 'tragedy';
    const selected = searchParams?.get('tab') ?? defaultTab;
    return (
      tabs.includes(selected as (typeof tabs)[number]) ? selected : defaultTab
    ) as (typeof tabs)[number];
  });

  let selectedSet = $state('');

  const packageImages = getAvialablePackageImages() ?? {};

  let exportJson: string | undefined = $state(undefined);

  function exportSet(setName: string) {
    exportJson = JSON.stringify(
      scripts.filter((x) => x.set?.some((x) => x?.name == setName)),
      undefined,
      2
    );
  }
</script>

<ExportView bind:exportJson />

<dialog open={shouldDeleteScript !== undefined}>
  <article>
    <header>
      <h2>Delete Script</h2>
    </header>
    <p>
      Are you sure you want to delete the script
      <strong>{shouldDeleteScript?.title}</strong>?
    </p>
    <footer>
      <button
        class="outline"
        onclick={() => {
          shouldDeleteScript = undefined;
        }}>Cancel</button
      >
      <button
        class="outline"
        onclick={() => {
          deleteLocalScript(shouldDeleteScript!).then(() => {
            ownScripts = ownScripts.filter((x) => x !== shouldDeleteScript);
            shouldDeleteScript = undefined;
          });
        }}>Delete</button
      >
    </footer>
  </article>
</dialog>

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
        <h2><Translation translationKey={'Your Creations'} /></h2>
      </header>
      {#each ownScripts as s}
        <div style="display: flex; align-items: center;  gap: 0.5rem;">
          <a style="flex-grow: 2;" href={linkOverview({ script: s })}>
            <Translation translationKey={s.title} /> by {s.creator} [<Translation
              translationKey={tragedysLookup[s.tragedySet!]?.name}
            />] <Translation translationKey={'difficulty'} />
            {join(s.difficultySets?.map((x) => x.difficulty.toString()) ?? [], ' / ')}</a
          >
          <button
            aria-label="Delete Script"
            class="outline"
            style="align-self: flex-end;"
            onclick={() => {
              shouldDeleteScript = s;
            }}
            ><svg
              width="1.5rem"
              height="1.5rem"
              viewBox="0 0 1024 1024"
              style="fill: var(--pico-color);"
              class="icon"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M32 241.6c-11.2 0-20-8.8-20-20s8.8-20 20-20l940 1.6c11.2 0 20 8.8 20 20s-8.8 20-20 20L32 241.6zM186.4 282.4c0-11.2 8.8-20 20-20s20 8.8 20 20v688.8l585.6-6.4V289.6c0-11.2 8.8-20 20-20s20 8.8 20 20v716.8l-666.4 7.2V282.4z"
                fill=""
              /><path
                d="M682.4 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM367.2 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM524.8 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM655.2 213.6v-48.8c0-17.6-14.4-32-32-32H418.4c-18.4 0-32 14.4-32 32.8V208h-40v-42.4c0-40 32.8-72.8 72.8-72.8H624c40 0 72.8 32.8 72.8 72.8v48.8h-41.6z"
                fill=""
              /></svg
            ></button
          >
        </div>
      {/each}
    </article>
  {/if}
  <div class:hide={tab != 'tragedy'}>
    {#each distinct(scripts
        .map((key) => key.tragedySet)
        .filter((x) => x != undefined)
        .sort( (a, b) => (a == undefined ? (b == undefined ? 0 : -1) : b == undefined ? 1 : a.localeCompare(b)) )) as set}
      <article>
        <header>
          <h2><Translation translationKey={tragedysLookup[set].name} /></h2>
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
  </div>
  <div class:hide={tab != 'set'}>
    {#each distinct(scripts
        .flatMap((x) => x.set ?? [])
        .map((key) => key.name)
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
          .filter((x) => x.set?.some((x) => x?.name == set))
          .sort((a, b) => (a.set?.filter((x) => x.name == set)[0]?.number ?? 0) - (b.set?.filter((x) => x.name == set)[0]?.number ?? 0)) as s}
          {#if s}
            {@render scriptEntry(s)}
          {/if}
        {/each}
      </article>
    {/each}
    <div class="boxHolder">
      {#each distinct(scripts
          .flatMap((x) => x.set ?? [])
          .filter((x) => x?.name != undefined && x?.name.length > 0)
          .map((key) => key.name)
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
  </div>

  <!-- </main> -->
</main>

{#snippet scriptEntry(s: Script)}
  <div style="margin-bottom: 0.5em;">
    <a href={linkOverview({ title: s.title })}>
      <Translation translationKey={s.title} /> <Translation translationKey={'by'} /> {s.creator}</a
    >
    <input
      type="checkbox"
      bind:group={playedScripts}
      value={s.title}
      onchange={() => {
        savePlayedScripts(playedScripts);
      }}
    />

    <br />

    <em style="display: block;">
      {#each s.set ?? [] as set}
        <Translation translationKey={set.name} />
        {set.number ? `${set.number} ` : ''}
      {:else}
        <Translation translationKey={'Independent'} />
      {/each}
    </em>

    <Translation translationKey={'Tragedy'} />
    <strong>
      {#if s.tragedySet}
        <Translation
          translationKey={tragedysLookup[s.tragedySet].name}
        />{#if s.incidents.some((x) => x.notTragedySpecified)}+{/if}
      {:else}
        <Translation translationKey={'No Set'} />
      {/if}
    </strong>

    {#if s.difficultySets && s.difficultySets.length > 0}
      difficulty {join(
        s.difficultySets.map((x) => x.difficulty.toString()),
        ' / '
      )}
    {/if}
    {#if s.rating}
      {@const r =
        s.rating == undefined
          ? s.rating
          : (Math.min(Math.max(0, s.rating), 10) as
              | undefined
              | 1
              | 2
              | 3
              | 4
              | 5
              | 6
              | 7
              | 8
              | 9
              | 10)}
      <br /><Rating rating={r} />
    {/if}
  </div>
{/snippet}

<style>
  .hide {
    display: none;
  }

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

  button:has(svg) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    cursor: pointer;
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
