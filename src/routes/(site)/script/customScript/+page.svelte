<script lang="ts" module>
  export function linkScriptEdit(params: { script: Script }): string {
    return generateUrl(`${base}/script/customScript/`, params);
  }
</script>

<script lang="ts">
  import '@picocss/pico/css/pico.css';
  import { fromEntries, keys } from '../../../../misc';
  import { type PlotName } from '../../../../model/plots';
  import type { RoleName } from '../../../../model/roles';
  import {} from '../../../../model/tragedySets';
  import { type CharacterName, isCharacterPlotless } from '../../../../model/characters';

  import { CustomScript } from '../../../../model/customScript';
  import PlotSelection from './plotSelection.svelte';
  import RoleGroup from './roleGroup.svelte';
  import Incedent from './incidents.svelte';
  import Difficulty from './difficulty.svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import ExportView from '../../../../view/exportView.svelte';
  import { saveScript } from '../../../../storage';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import { validateScript } from '../../../../model/validation';
  import type { ValidationError } from '@apideck/better-ajv-errors';
  import Translation from '../../../../view/translation.svelte';
  import { tragedysLookup } from '../../../../data';
  import { linkOverview } from '../overview/+page.svelte';
  import { generateUrl, getParams } from '../../../../zipQueryHelper';
  import type { Script } from '../../../../scripts.g';

  const model = new CustomScript();

  const tragedySetName = model.tragedySetName;
  const tragedySet = model.tragedySet;
  const mainPlots = model.mainPlots;
  const subPlots = model.subPlots;

  const rolesGroup = derived(model.roles, (a) =>
    a.toSorted((a, b) =>
      a.role == 'person' ? +1 : b.role == 'person' ? -1 : a.role.localeCompare(b.role)
    )
  );
  const days = model.daysPerLoop;

  const title = model.title;
  const creator = model.creator;
  const difSet = model.difficultySets;

  const story = model.story;
  const victoryConditions = model.victoryConditions;
  const mastermindHints = model.mastermindHints;
  const specialRules = model.specialRules;
  const description = model.description;

  let exportJson: string | undefined;
  let importJson: string | undefined;

  let showImport = false;
  let error = [] as ValidationError[];

  // let searchParams: URLSearchParams | undefined;

  onMount(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const pushState = history.pushState;
    // history.pushState = function (data: any, unused: string, url?: string | URL | null) {
    // 	pushState.apply(history, [data, unused, url]);
    // 	searchParams = new URLSearchParams(document.location.search);
    // };
    const serilizedScript = getParams(searchParams)?.script as Script | undefined;
    if (serilizedScript) {
      const validation = validateScript(serilizedScript);
      if (!validation.valid) {
        error = validation.errors;
        console.error('Validation errors:', error);
        return;
      }
      model.import(validation.script);
    } else {
      model.difficultySets.set([{ numberOfLoops: 4, difficulty: 3 }]);
    }
  });

  function save() {
    const data = model.export();
    saveScript(data);

    goto(linkOverview({ script: data }));
  }
</script>

<main class="container">
  <article>
    <ExportView bind:exportJson />

    <dialog open={showImport}>
      <form>
        <textarea
          bind:value={importJson}
          style="height: calc(100vh - 10rem); width: calc(100vw -  2 * var(--pico-block-spacing-horizontal))"
        ></textarea>
        <div class="grid">
          <button
            disabled={!importJson}
            on:click={() => {
              const result = validateScript(JSON.parse(importJson ?? '{}'));

              if (result.valid) {
                model.import(result.script);
                showImport = false;
              } else {
                error = result.errors;
                console.error('Validation errors:', error);
              }

              return;
            }}>Import</button
          >
          <button on:click={() => (showImport = false)}>Cancel</button>
        </div>
      </form>
    </dialog>

    <dialog open={error.length > 0}>
      <article>
        <header>
          <button aria-label="Close" rel="prev" on:click={() => (error = [])}></button>
          <p>
            <strong>Error</strong>
          </p>
        </header>
        <p>There where errors while validating your script.</p>
        <p>Here is a list of the errors:</p>
        <ul>
          {#each error as e}
            {@const context = e.context}
            <li>
              <strong>{e.path}</strong>: <Translation translationKey={e.message} /><br />
              {#if e.suggestion}
                <small>
                  <Translation translationKey={e.suggestion} />
                </small>
              {/if}
              {#if 'allowedValues' in context && typeof context.allowedValues === 'object' && Array.isArray(context.allowedValues)}
                <Translation translationKey={'Allowed Values'} />
                <ul>
                  {#each context.allowedValues as av}
                    <li>{av}</li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      </article>
    </dialog>

    <button
      class="outline"
      style="float: right; width: fit-content;"
      on:click={() => (showImport = true)}>Import</button
    >
    <h1>Your Script</h1>

    <label>
      Title
      <input
        aria-invalid={$title === undefined || $title.length === 0}
        type="text"
        bind:value={$title}
      />
    </label>
    <label>
      Creator
      <input type="text" bind:value={$creator} />
    </label>

    <h2>Tragedy Set</h2>
    <select bind:value={$tragedySetName}>
      {#each keys(tragedysLookup) as tgs}
        <option value={tgs}><Translation translationKey={tragedysLookup[tgs].name} /></option>
      {/each}
    </select>

    {#if ($tragedySet['numberOfMainPlots'] ?? 0) > 1}
      <h2>Main Plots</h2>
    {:else}
      <h2>Main Plot</h2>
    {/if}
    {#each $mainPlots as plotSelection}
      <PlotSelection {plotSelection} />
    {/each}
    {#if ($tragedySet['numberOfSubPlots'] ?? 0) > 1}
      <h2>Sub Plots</h2>
    {:else}
      <h2>Sub Plot</h2>
    {/if}
    {#each $subPlots as plotSelection}
      <PlotSelection {plotSelection} />
    {/each}

    <h2><Translation translationKey= {'Difficulty'}/></h2>

    <Difficulty {difSet} />

    <h2>Days</h2>
    <input type="number" bind:value={$days} />

    <h2>Roles</h2>
    {#each $rolesGroup as group}
      <RoleGroup {group} />
    {/each}
    <h2>Incidents</h2>
    <Incedent incedentGroup={model.incidentGroup} />

    <h5>Description</h5>
    <textarea bind:value={$description}></textarea>

    <h5>Story</h5>
    <textarea bind:value={$story}></textarea>

    <h5>Special Rules</h5>
    <textarea bind:value={$specialRules}></textarea>

    <h5>Hints for the Mastermind</h5>
    <textarea bind:value={$mastermindHints}></textarea>

    <h5>Victory Conditions</h5>
    <textarea bind:value={$victoryConditions}></textarea>

    <div class="grid">
      <button
        class="outline"
        on:click={() => (exportJson = JSON.stringify(model.export(), undefined, 2))}>Export</button
      >
      <button disabled={$title === undefined || $title.length === 0} on:click={() => save()}
        >Save</button
      >
    </div>
  </article>
</main>
