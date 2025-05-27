<script lang="ts">
  import {
    type scripts,
    type Script,
    type isScriptName,
    toPlayerIncident,
  } from '../../../model/script';

  import { onMount } from 'svelte';

  import { characterscomesInLater, type CharacterName } from '../../../model/characters';
  import { stringifySearchForPlayerAid } from '../../../serilezer';
  import { distinct, keys, require } from '../../../misc';
  import { base } from '$app/paths';
  import Option from './customScript/option.svelte';
  import Translation from '../../../view/translation.svelte';
  export let script: Script;

  let alwaysTransmitCharacters: boolean[] = characterscomesInLater.map(() => true);
  $: allAdditionamCharacters = alwaysTransmitCharacters.every((x) => x == true)
    ? true
    : alwaysTransmitCharacters.every((x) => x == false)
      ? false
      : undefined;

  function swtchAllCharacters() {
    const target = allAdditionamCharacters !== true;
    for (let i = 0; i < alwaysTransmitCharacters.length; i++) {
      alwaysTransmitCharacters[i] = target;
    }
  }

  $: additionalCharacters = alwaysTransmitCharacters
    .map((b, i) => [b, characterscomesInLater[i]] as const)
    .filter(([x]) => x)
    .map(([, x]) => x);

  function getParams(script: Script, additionalCharacters: CharacterName[]) {
    return stringifySearchForPlayerAid(
      script.tragedySet,
      distinct(keys<Partial<Record<CharacterName, any>>>(script.cast).concat(additionalCharacters)),
      script.incidents.map(toPlayerIncident),
      require(script).specialRules ?? []
    ).toString();
  }

  $: parameter = script ? getParams(script, additionalCharacters) : undefined;
  let host = '';
  let protocoll = '';

  onMount(() => {
    host = document.location.host;
    protocoll = document.location.protocol;
  });
  async function share(shareLink: string, title: string, text: string) {
    const shareData = {
      title: title,
      text: text,
      url: shareLink,
    };
    try {
      const shareFunction = navigator.canShare ?? ((data: any) => false);
      const isSharable = shareFunction(shareData);
      if (isSharable) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      message = `Copied <a href='${shareLink}' target='_blank' >Link</a> to Clipboard.`;
      return;
    } catch (error) {
      console.error(error);
    }
    message = `Please copy the <a href='${shareLink}' target='_blank' >Link</a> and share it.`;
  }
  let message: string | undefined;
</script>

<dialog open={message !== undefined}>
  <div>
    {@html message}
    <button on:click={() => (message = undefined)}>Close</button>
  </div>
</dialog>

{#if script}
  <header style="display: grid;  justify-content: space-between;">
    <div
      style=" width: fit-content; display: grid; gap:0.5em; grid-row: 1 / span 2 ; grid-column: 2; justify-self: end  ;"
    >
      <a
        aria-disabled={script == undefined}
        href={`${base}/script/customScript/?script=${encodeURIComponent(JSON.stringify(script))}`}
        class="outline"
        style="grid-row: 1; grid-column: 2; margin-bottom: var(--spacing);"
        role="button">Edit</a
      >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        tabindex="0"
        aria-disabled={script == undefined}
        class="outline"
        on:click={() =>
          share(
            `${base}/script/?script=${encodeURIComponent(JSON.stringify(script))}`,
            script.title,
            'A Tragedy Looper Script'
          )}
        style="grid-row: 1; grid-column: 1;"
        >Share Script
      </button>
      <!-- svelte-ignore a11y-interactive-supports-focus -->
      <button
        aria-disabled={script == undefined}
        class="outline"
        on:click={() =>
          share(`${base}/player/?${parameter}`, 'Player Aid', 'A Tragedy Looper Player Aid')}
        style=" grid-row: 2; grid-column: 1 / span 2"
        >Share Player Aid
      </button>
      <a
        aria-disabled={script == undefined}
        href={`${base}/gm/?script=${encodeURIComponent(JSON.stringify(script))}`}
        class="outline"
        target="_blank"
        style="grid-row: 3; grid-column: 1 / span 2"
        role="button">Open Mastermind Aid</a
      >
    </div>
    <!-- <span style="clear: right;"></span> -->
    <!-- <a style="float: right; clear: right;" href={`${base}/player/?${parameter}`} target="_blank"
		>Link to Script specific Player Aid</a
	> -->
    <!-- <button class="outline" style="float: right; width: fit-content;">Edit</button> -->

    <hgroup style="align-self: start; justify-self: start;">
      <h4>{script.creator}</h4>
      <h1>{script.title}</h1>

      <h2>
        {#if script.set}
          ({script.set.number}) {script.set.name}
        {/if}
      </h2>
    </hgroup>

    {#each script.difficultySets as e}
      <div style="align-self: end; justify-self: start;">
        Loops: {e.numberOfLoops} / difficulty:
        {#each Array.from({ length: e.difficulty }) as d}
          <div
            style="width: 1em; height: 1em; background-color: var(--pico-primary); display: inline-block; border-radius: 1em; border: 1px solid var(--pico-secondary)"
          ></div>
        {/each}{#each Array.from({ length: 8 - e.difficulty }) as d}<div
            style="width: 1em; height: 1em; background-color: transparent; border: 1px solid var(--pico-secondary); display: inline-block; border-radius: 1em;"
          ></div>{/each} ({e.difficulty})
      </div>
    {/each}
  </header>
  <div>
    <strong>{script.tragedySet}</strong>
  </div>
  <div>
    <strong><Translation translationKey={'Days per Loop'} /></strong>{script.daysPerLoop}
  </div>

  <div style="display: grid; justify-content: start; align-content:  baseline; gap: 0.3em;">
    <strong style="grid-column: 1; grid-row: 1;">Main Plot:</strong>
    <span style="grid-column: 2; grid-row: 1;">{script.mainPlot}</span>
    <strong style="grid-column: 1; grid-row: 2;">Sub Plot :</strong>
    {#each script.subPlots as s, i}
      <span style="grid-column: 2; grid-row: {i + 2};">
        {#if typeof s == 'string'}
          {s}
        {:else}
          {s[0]}
          <small>
            {#each Object.entries(s[1]) as [key, value]}
              <br />
              ({key}: {value})
            {/each}
          </small>
        {/if}
      </span>
    {/each}
  </div>

  <div>
    <table>
      <thead>
        <tr>
          <th>Cast</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(script.cast) as [cast, role]}
          <tr>
            <td>
              {cast}
            </td>
            <td>
              {#if Array.isArray(role)}
                {role[0]}
                {#each Object.entries(role[1]) as [key, value]}
                  <br />
                  {key}: {value}
                {/each}
              {:else}
                {role}
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Incident</th>
          <th>Culprit</th>
        </tr>
      </thead>
      <tbody>
        {#each script.incidents as { day, incident, culprit }}
          <tr>
            <td>
              {day}
            </td>
            <td>
              {#if Array.isArray(incident)}
                {incident[0]}<br />
                <small>
                  ({incident[1]})
                </small>
              {:else}
                {incident}
              {/if}
            </td>
            <td>
              {culprit}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if require(script).specialRules && require(script).specialRules?.filter((x) => x.length > 0).length > 0}
    <h5>Special Rules</h5>
    <div>
      {#each require(script).specialRules?.filter((x) => x.length > 0) as s}
        <p>
          {s}
        </p>
      {/each}
    </div>
  {/if}
  <div>
    <h5>Specifics</h5>
    {script.specifics}
    <h5>Story</h5>
    {script.story}
    <h5>Hints for the Mastermind</h5>
    {script.mastermindHints}
  </div>
  <hr />
  <div>
    {#if host}
      <strong>Always include suprise characters</strong>
      <input
        type="checkbox"
        on:click={(e) => {
          // e.preventDefault();
          swtchAllCharacters();
        }}
        bind:checked={allAdditionamCharacters}
        indeterminate={allAdditionamCharacters === undefined}
      />
      <ul>
        {#each characterscomesInLater as a, i}
          <li>
            <lable>
              <input type="checkbox" role="switch" bind:checked={alwaysTransmitCharacters[i]} />
              {a}
            </lable>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

<style>
</style>
