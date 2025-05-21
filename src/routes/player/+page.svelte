<script lang="ts">
  import { onMount } from 'svelte';
  import type { ScriptIncidentPlayer } from '../../model/script';
  import Table from '../../view/table.svelte';
  import type { CharacterName } from '../../model/characters';
  import type { TragedySetName } from '../../model/tragedySets';
  import { parseSearchForPlayerAid } from '../../serilezer';
  import './page.css';
  import { getString as getStringOriginal } from '../../translations';

  let searchParams: URLSearchParams | undefined;
  let lang: string;
  $: getString = (key: string, ...args: any[]) => {
    return getStringOriginal(key, lang, ...args);
  };

  onMount(() => {
    lang = navigator.language?.split('-')[0];
    searchParams = new URLSearchParams(document.location.search);
    const pushState = history.pushState;
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      pushState.apply(history, [data, unused, url]);
      searchParams = new URLSearchParams(document.location.search);
    };
  });

  let tragedySet: TragedySetName | undefined;
  let cast: CharacterName[] | undefined;
  let incidents: ScriptIncidentPlayer[] | undefined;
  let specialRules: string[] | undefined;
  $: [tragedySet, cast, incidents, specialRules] = parseSearchForPlayerAid(searchParams);
  $: tablet = searchParams?.has('tablet');
  $: touchTarget = searchParams?.has('touchTarget');

  let reversedTablet: URLSearchParams | undefined;
  let reversedTouchTarget: URLSearchParams | undefined;

  $: {
    if (searchParams) {
      reversedTablet = new URLSearchParams(searchParams);
      if (searchParams.has('tablet')) {
        reversedTablet.delete('tablet');
      } else {
        reversedTablet.append('tablet', '');
      }
      reversedTouchTarget = new URLSearchParams(searchParams);
      if (searchParams.has('touchTarget')) {
        reversedTouchTarget.delete('touchTarget');
      } else {
        reversedTouchTarget.append('touchTarget', '');
      }
    }
  }
</script>

{#if tragedySet && cast && incidents && specialRules}
  <nav class="hide-on-print">
    <ul>
      <li>
        <a href="?{reversedTablet?.toString()}" data-sveltekit-reload>
          {#if tablet}{getString('Print View')}{:else}{getString('Tablet View')}{/if}</a
        >
      </li>
      {#if tablet}
        <li>
          <a href="?{reversedTouchTarget?.toString()}" data-sveltekit-reload>
            {#if touchTarget}{getString('Compakt View')}{:else}{getString(
                'Touch optimized View'
              )}{/if}</a
          >
        </li>
      {/if}
    </ul>
  </nav>
  <Table
    {lang}
    {tragedySet}
    {cast}
    {incidents}
    {specialRules}
    {tablet}
    touchTarget={touchTarget && tablet}
  />
{:else}
  <div
    style="display: grid; justify-items: center; align-items: center; grid-template-rows: auto 1fr; height: 100vh;"
  >
    <h1>{getString('Tragedy Looper Deduction overview')}</h1>

    <p
      aria-busy="true"
      style="font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif; font-size: xx-large;"
    >
      {getString('Rendering')}
    </p>
  </div>
{/if}

<style lang="scss">
  * {
    box-sizing: border-box;
  }
  nav {
    top: 0px;
    position: sticky;
    z-index: 9999;
    width: fit-content;
    background-color: var(--background);
    border-right: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
    padding: 1em;
    border-bottom-right-radius: var(--border-radius);

    --primary: hsl(195, 85%, 41%);
    --primary-hover: hsl(195, 90%, 32%);
    --primary-focus: rgba(16, 149, 193, 0.125);
    --primary-inverse: #fff;

    --font-family: system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell',
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';
    --line-height: 1.5;
    --font-weight: 400;
    --font-size: 16px;
    --border-radius: 0.25rem;
    --border-width: 1px;
    --outline-width: 3px;
    --spacing: 1rem;
    --typography-spacing-vertical: 1.5rem;
    --block-spacing-vertical: calc(var(--spacing) * 2);
    --block-spacing-horizontal: var(--spacing);
    --grid-spacing-vertical: 0;
    --grid-spacing-horizontal: var(--spacing);
    --form-element-spacing-vertical: 0.75rem;
    --form-element-spacing-horizontal: 1rem;
    --nav-element-spacing-vertical: 1rem;
    --nav-element-spacing-horizontal: 0.5rem;
    --nav-link-spacing-vertical: 0.5rem;
    --nav-link-spacing-horizontal: 0.5rem;
    --form-label-font-weight: var(--font-weight);
    --transition: 0.2s ease-in-out;
    --modal-overlay-backdrop-filter: blur(0.25rem);

    ul {
      list-style: none;
      padding: 0px;
      display: grid;
      grid-auto-flow: column;
      gap: var(--form-element-spacing-vertical);
      li {
        background-color: lightblue;
        display: contents;
        a {
          border-radius: 1em;
          border: 1px solid red;
          padding: 0.4em;

          --background-color: var(--primary);
          --border-color: var(--primary);
          --color: var(--primary-inverse);
          --box-shadow: var(--button-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
          padding: var(--form-element-spacing-vertical) var(--form-element-spacing-horizontal);
          border: var(--border-width) solid var(--border-color);
          border-radius: var(--border-radius);
          outline: none;
          background-color: var(--background-color);
          box-shadow: var(--box-shadow);
          color: var(--color);
          font-weight: var(--font-weight);
          font-size: 1rem;
          line-height: var(--line-height);
          text-align: center;
          cursor: pointer;
          transition: background-color var(--transition), border-color var(--transition),
            color var(--transition), box-shadow var(--transition);

          &:is([aria-current], :hover, :active, :focus) {
            --background-color: var(--primary-hover);
            --border-color: var(--primary-hover);
            --box-shadow: var(--button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
            --color: var(--primary-inverse);
          }
          &:focus {
            --box-shadow: var(--button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),
              0 0 0 var(--outline-width) var(--primary-focus);
          }
        }
      }
    }
  }
</style>
