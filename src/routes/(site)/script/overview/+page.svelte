<script lang="ts" module>
  type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

  export function linkOverview(
    params: RequireAtLeastOne<{
      title: string;
      author: string;
      set: { name: string; number: number };
    }>
  ): string;
  export function linkOverview(params: { script: Script & {local?:boolean} }): string;
  export function linkOverview(
    params:
      | { script: Script & { local?: boolean } }
      | RequireAtLeastOne<{ title: string; author: string; set: { name: string; number: number } }>
  ): string {
    const transfareObject =
      'script' in params
        ? {
            script: params.script,
          }
        : {
            setNumber: params.set?.number,
            setName: params.set?.name,
            title: params.title,
            author: params.author,
          };
    return generateUrl(`${base}/script/overview/`, transfareObject);
  }
</script>

<script lang="ts">
  import { join } from '../../../../misc';
  import { isScript, scripts as scriptLookup } from '../../../../model/script';
  import ScriptDetails from './../scriptDetails.svelte';
  import { onMount } from 'svelte';

  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';
  import ExportView from '../../../../view/exportView.svelte';
  import { loadAllLocalScripts, loadScript } from '../../../../storage';
  import type { Script } from '../../../../scripts.g';
  import Rating from './../rating.svelte';
  import Translation from '../../../../view/translation.svelte';
  import { generateUrl, getParams } from '../../../../zipQueryHelper';
  import { goto } from '$app/navigation';

  $: scripts = Object.values(scriptLookup);

  let selectedScript:
    | (Script & { local: true | undefined })
    | (Script & { local: true | undefined })[]
    | undefined;

  let searchParams: URLSearchParams | undefined;

  let ownScripts: Script[] = [];
  onMount(async () => {
    searchParams = new URLSearchParams(document.location.search);
    const pushState = history.pushState;
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      pushState.apply(history, [data, unused, url]);
      searchParams = new URLSearchParams(document.location.search);
    };

    ownScripts = await loadAllLocalScripts();
  });

  $: decodedParams = (searchParams ? getParams(searchParams) : {}) as Partial<{
    script: Script & {
      local: true | undefined;
    };
    setNumber: number;
    setName: string;
    title: string;
    author: string;
  }>;

  $: setNumber = decodedParams.setNumber;
  $: setName = decodedParams.setName;
  $: title = decodedParams.title;
  $: author = decodedParams.author;

  $: serilizedScript = decodedParams.script;

  $: {
    if (serilizedScript != undefined) {
      selectedScript = serilizedScript;
    } else if (searchParams) {
      const search = {
        title,
        author,
        set: setName && setNumber != undefined ? { name: setName, number: setNumber } : undefined,
      };

      loadScript(search).then((loading) => {
        if (loading?.length === 1) {
          selectedScript = loading[0];
        } else {
          selectedScript = loading;
        }
      });
    }
  }

  let exportJson: string | undefined;
</script>

<ExportView bind:exportJson />

<main class="container">
  <!-- <main class="container"> -->
  {#if Array.isArray(selectedScript)}
    <h1>There where more scripts matching please select one.</h1>
    <article>
      {#each selectedScript as s}
        <div>
          <a href={linkOverview({ script: s })}
            >{#each s.set ?? [] as set, i}
              {#if i > 0}
                /
              {/if}
              {set.number ?? ''}
              {set.name ?? ''}
            {:else}
              <Translation translationKey="No Set" />
            {/each}
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
</main>

<style>
</style>
