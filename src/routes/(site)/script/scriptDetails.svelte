<script lang="ts">
  import { type isScriptName, toPlayerIncident } from '../../../model/script';

  import { onMount } from 'svelte';
  import qrcode from 'qrcode-generator';
  import {
    characterscomesInLater,
    isLocationName,
    type CharacterName,
    type LocationName,
  } from '../../../model/characters';
  import { zip, unzip } from 'gzip-js';
  import { distinct, isArray, keys } from '../../../misc';
  import { base } from '$app/paths';
  import Translation from '../../../view/translation.svelte';
  import { getString } from '../+layout.svelte';
  import type { Script } from '../../../scripts.g';
  import { isRoleName, singleRolenames, type RoleName } from '../../../model/roles';
  import {
    charactersLookup,
    incidentsLookup,
    isCharacterId,
    plotsLookup,
    rolesLookup,
    tragedysLookup,
  } from '../../../data';
  import { isIncidentName } from '../../../model/incidents';
  import { isPlotName, type PlotName } from '../../../model/plots';
  import { type Character } from '../../../characters.g';
  import { type Plot } from '../../../plots.g';
  import { generateUrl } from '../../../zipQueryHelper';
  import { linkOverview } from './overview/+page.svelte';
  import { linkPlayerAid } from '../../player/+page.svelte';
  import { linkScriptEdit } from './customScript/+page.svelte';
    import { getPlayedScripts, savePlayedScripts } from '../../../storage';
  export let script: (Script & { local: boolean }) | undefined;

  let playedScripts: string[] = [];

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

  function getPlayerAidLink(script: Script, additionalCharacters: CharacterName[]) {
    if (!script || !script.tragedySet) {
      return '';
    }

    return linkPlayerAid({
      tragedySet: script.tragedySet,
      cast: distinct(
        keys<Partial<Record<CharacterName, any>>>(script.cast).concat(additionalCharacters)
      ),
      incidents: script.incidents.map(toPlayerIncident),
      specialRules: script.specialRules ?? [],
    });
  }

  $: playerAidLink = script ? getPlayerAidLink(script, additionalCharacters) : undefined;
  let host = '';
  let protocoll = '';

  onMount(() => {
    playedScripts = getPlayedScripts();
    host = document.location.host;
    protocoll = document.location.protocol;
  });

  async function generateShareLink(script: Script): Promise<string> {
    if (!script || !script.tragedySet) {
      return '';
    }

    return linkOverview({ script });
  }

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
      message = {
        link: shareLink,
        message: `Copied <a href='${shareLink}' target='_blank' >Link</a> to Clipboard.`,
      };
      return;
    } catch (error) {
      console.error(error);
    }
    message = {
      message: `Please copy the <a href='${shareLink}' target='_blank' >Link</a> and share it.`,
      link: shareLink,
    };
  }
  let message: { message: string; link: string } | undefined;

  function generateDataUrl(link: string): string {
    const qr = qrcode(0, 'L');
    qr.addData(link);
    qr.make();
    return qr.createDataURL(4);
  }

  function removeLocal(script: Script & { local?: boolean }): Script {
    const { local, ...rest } = script;
    return rest;
  }

  $: githubIssueTitle = `[Script Submission] ${script?.title ?? 'Unknown Script'} by ${script?.creator ?? 'Unknown Creator'}`;
  $: githubIssueBody = `Script submission from Website

  <!-- DO NOT EDIT THIS SECTION!
${btoa(
  String.fromCharCode.apply(null, zip(JSON.stringify(removeLocal(script)), { level: 9 }))
).replace(/(.{30})/g, '$1\n')}
  -->
  
  `;
</script>

<dialog open={message !== undefined}>
  <article style="display: flex; flex-direction: column; gap: 0.5em;">
    <img
      src={generateDataUrl(message?.link ?? '')}
      alt="QR Code for the link"
      style=" object-fit: cover;"
    />

    <div>
      {@html message?.message ?? ''}
    </div>
    <footer>
      <button on:click={() => (message = undefined)}>Close</button>
    </footer>
  </article>
</dialog>

{#if script}
  <header
    style="display: grid;  justify-content: space-between; grid-template-columns: 1fr auto; grid-template-rows: auto auto auto auto;"
  >
    <div
      style=" width: fit-content; display: grid; gap:0.5em; grid-row: 1 / span 5; align-self: start ; grid-column: 2; justify-self: end  ;"
    >
      <a
        aria-disabled={script == undefined}
        href={linkScriptEdit({ script })}
        class="outline"
        style="grid-row: 1; grid-column: 2; margin-bottom: var(--spacing);"
        role="button">Edit</a
      >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        tabindex="0"
        aria-disabled={script == undefined}
        class="outline"
        on:click={async () =>
          share(await generateShareLink(script), script.title, 'A Tragedy Looper Script')}
        style="grid-row: 1; grid-column: 1;"
        >Share Script
      </button>
      <!-- svelte-ignore a11y-interactive-supports-focus -->
      <button
        aria-disabled={script == undefined}
        class="outline"
        on:click={() => {
          if (playerAidLink) {
            share(playerAidLink, 'Player Aid', 'A Tragedy Looper Player Aid');
          }
        }}
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
      {#if script.local}
        <a
          role="button"
          aria-disabled={script == undefined || script.title == undefined}
          href={`https://github.com/Tragedy-Looper/tragedy-looper.github.io/issues/new?title=${encodeURIComponent(githubIssueTitle)}&body=${encodeURIComponent(githubIssueBody)}&labels=${encodeURIComponent('script submission')}`}
          target="_blank"
          style="grid-row: 4; grid-column: 1 / span 2; margin-bottom: var(--spacing);"
          rel="noopener noreferrer">Publish on GitHub</a
        >
      {/if}
    </div>
    <!-- <span style="clear: right;"></span> -->
    <!-- <a style="float: right; clear: right;" href={`${base}/player/?${parameter}`} target="_blank"
		>Link to Script specific Player Aid</a
	> -->
    <!-- <button class="outline" style="float: right; width: fit-content;">Edit</button> -->

    <hgroup style="align-self: start; justify-self: start;">
      <h4>{script.creator}</h4>
      <h1>
        <Translation translationKey={script.title} />
        <input type="checkbox" bind:group={playedScripts} value={script.title} on:change={()=>{
          savePlayedScripts(playedScripts);
        }} />
      </h1>
      <small
        >{#if script.local}(<Translation translationKey="local script" />){/if}</small
      >
      {#if script.source}
        <h5>
          <Translation translationKey={'Source'} />
          <a href={script.source} target="_blank" rel="noopener noreferrer" class="outline">
            <small>{new URL(script.source).host}</small>
          </a>
        </h5>
      {/if}

      <h2>
        {#if script.set}
          ({#each script.set as set, i}{#if i > 0},
            {/if}{set.name}
            {set.number}
          {/each})
        {/if}
      </h2>
    </hgroup>

    <div>
      {#if script.description}
        <div class="description">
          <Translation translationKey={script.description} />
        </div>
        <label
          style="--show-more: '{$getString('Show more')}'; --show-less: '{$getString('Show less')}'"
        >
          <input type="checkbox" />
        </label>
      {/if}
    </div>

    {#each script.difficultySets ?? [] as e}
      <div style="align-self: end; justify-self: start;">
        <Translation
          translationKey={[
            'Loops: {numberOfLoops} / difficulty:',
            { numberOfLoops: e.numberOfLoops },
          ]}
        />
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
    <strong
      ><Translation
        translationKey={`:${script.tragedySet}:`}
        link
      />{#if script.incidents.some((x) => x.notTragedySpecified)}+{/if}</strong
    >
  </div>
  <div>
    <strong><Translation translationKey={'Days per Loop'} /></strong>
    {script.daysPerLoop}
  </div>

  <div style="display: grid; justify-content: start; align-content:  baseline; gap: 0.3em;">
    <strong style="grid-column: 1; grid-row: 1;"
      ><Translation translationKey={'Main Plot'} />:</strong
    >
    {#snippet plotEntry(s: PlotName | readonly [PlotName, Record<string, unknown>])}
      {#if typeof s == 'string'}
        <Translation translationKey={`:${s}:`} link />
      {:else}
        {@const plot = plotsLookup[s[0]]}
        {@const options = s[1] ?? {}}
        <Translation translationKey={plot.name} />
        {@render renderOptions(options, [plot])}
      {/if}
    {/snippet}
    {#each script.mainPlot as s, i}
      <span style="grid-column: 2; grid-row: {i + 1};">
        {@render plotEntry(s)}
      </span>
    {/each}
    <strong style="grid-column: 1; grid-row: 2;"
      ><Translation translationKey={'Sub Plot'} />:</strong
    >
    {#each script.subPlots as s, i}
      <span style="grid-column: 2; grid-row: {i + 1 + script.mainPlot.length};">
        {@render plotEntry(s)}
      </span>
    {/each}
  </div>

  <div>
    <table>
      <thead>
        <tr>
          <th><Translation translationKey={'Cast'} /></th>
          <th><Translation translationKey={'Role'} /></th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(script.cast) as [cast, role]}
          <tr>
            <td>
              <Translation translationKey={`:${cast}:`} link />
            </td>
            <td>
              {#if isArray(role)}
                {@const singleRols = singleRolenames(role[0])}
                {@render renderRole(role[0])}
                {@const roleData = singleRols.map((sr) => rolesLookup[sr])}
                {@const castData = charactersLookup[cast]}
                {@const options = { ...(role[1] ?? {}) }}
                {@render renderOptions(options, [...roleData, castData])}
              {:else if role != undefined}
                {@render renderRole(role)}
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
          <th><Translation translationKey={'Day'} /></th>
          <th><Translation translationKey={'Incident'} /></th>
          <th><Translation translationKey={'Culprit'} /></th>
        </tr>
      </thead>
      <tbody>
        {#each script.incidents as { day, incident, culprit }}
          <tr>
            <td>
              {day}
            </td>
            <td>
              {#if isArray(incident)}
                <Translation translationKey={`:${incident[0]}:`} link /><br />
                <small>
                  (<Translation translationKey={`:${incident[1]}:`} link />)
                </small>
              {:else}
                <Translation translationKey={`:${incident}:`} link />
              {/if}
            </td>
            <td>
              {#if culprit === undefined}
                <Translation translationKey={'No Culprit'} />
              {:else if isLocationName(culprit)}
                <Translation translationKey={culprit} />
              {:else}
                <Translation translationKey={charactersLookup[culprit].name} />
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if script.specialRules && script.specialRules?.filter((x) => x.length > 0).length > 0}
    <h5><Translation translationKey={'Special Rules'} /></h5>
    <div>
      {#each script.specialRules?.filter((x) => x.length > 0) as s}
        <p>
          <Translation translationKey={s} link />
        </p>
      {/each}
    </div>
  {/if}
  <div>
    {#if script.story}
      <h5><Translation translationKey={'Story'} /></h5>
      <Translation translationKey={script.story} block link />
    {/if}
    {#if script.mastermindHints}
      <h5><Translation translationKey={'Hints for the Mastermind'} /></h5>
      <Translation translationKey={script.mastermindHints} block link />
    {/if}
    {#if script['victory-conditions']}
      <h5><Translation translationKey={'Victory Conditions'} /></h5>
      <Translation translationKey={script['victory-conditions']} block link />
    {/if}
  </div>
  <hr />
  <div>
    {#if host}
      <strong><Translation translationKey={'Always include suprise characters'} /></strong>
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
              <Translation translationKey={`:${a}:`} link />
            </lable>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

{#snippet renderRole(role: RoleName)}
  {@const roles = singleRolenames(role)}
  {#each roles as r, i}
    <Translation translationKey={`:${r}:`} link />
    {#if i < roles.length - 1},
    {/if}
  {/each}
{/snippet}
{#snippet renderOptions(
  options: Record<string, unknown>,
  plots: { scriptSpecified?: (Character | Plot)['scriptSpecified'] }[]
)}
  {@const scriptSpecified = plots.flatMap((x) => x.scriptSpecified ?? [])}
  {#if scriptSpecified.length > 0}
    <small>
      {#each scriptSpecified as s}
        {@const optionName = s.name}
        {#if optionName in options}
          <br />
          (<Translation translationKey={s.name} />:
          {#if s.type === 'character' && isCharacterId(options[optionName])}
            <Translation translationKey={charactersLookup[options[optionName]].name} />
          {:else if s.type === 'location' && isLocationName(options[optionName])}
            <Translation translationKey={options[optionName] as LocationName} />
          {:else if s.type.startsWith('role') && isRoleName(options[optionName])}
            {@const splitted = singleRolenames(options[optionName])}
            {#each splitted as optionName}
              <Translation translationKey={rolesLookup[optionName].name} />
              {#if optionName !== splitted[splitted.length - 1]},
              {/if}
            {/each}
          {:else if s.type === 'plot' && isPlotName(options[optionName])}
            <Translation translationKey={plotsLookup[options[optionName]].name} />
          {:else if s.type === 'incident' && isIncidentName(options[optionName])}
            <Translation translationKey={incidentsLookup[options[optionName]].name} />
          {:else if s.type === 'number'}
            {options[optionName]}
          {:else if s.type === 'text' && typeof options[optionName] === 'string'}
            <Translation translationKey={options[optionName]} />
          {:else}
            {options[optionName]}
          {/if})
        {/if}
      {/each}
    </small>
  {/if}
{/snippet}

<style>
  header {
    gap: 0.5em;
    :has(.description) {
      .description {
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0.5em 0;
        font-size: 0.9em;
        margin-bottom: 0em;
      }
      &:has(input:checked) {
        .description {
          display: block;
        }
        label::before {
          content: var(--show-less);
        }
      }

      label::before {
        content: var(--show-more);
        color: var(--pico-secondary);
        font-size: 0.8em;
        transition: color 0.2s ease-in-out;
      }
      label:hover {
        &::before {
          color: var(--pico-primary);
        }
      }

      input {
        display: none;
      }
    }
  }
</style>
