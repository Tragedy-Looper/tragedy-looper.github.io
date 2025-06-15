<script lang="ts">
  import '@picocss/pico/css/pico.css';
  import {
    incidentsLookup,
    plotsLookup,
    roles,
    rolesLookup,
    tragedysLookup,
  } from '../../../../data';
  import Translation from '../../../../view/translation.svelte';
  import Ability from '../../../../view/Ability.svelte';
  import { isArray } from '../../../../misc';

  let selectedTragedys = $state([] as string[]);
</script>

<main class="container">
  <h1>
    <Translation translationKey={'Roles'} />
  </h1>
  <details class="dropdown">
    <summary>
      {#each selectedTragedys as tragedy, i (tragedy)}
        {#if i > 0},
        {/if}
        <Translation translationKey={`:${tragedy}:`} />
      {:else}
        <Translation translationKey={'Select Tragedy Sets…'} />
      {/each}
    </summary>
    <ul>
      {#each Object.keys(tragedysLookup) as key (key)}
        <li>
          <label>
            <input type="checkbox" value={key} bind:group={selectedTragedys} />
            <Translation translationKey={`:${key}:`} />
          </label>
        </li>
      {/each}
    </ul>
  </details>

  {#each Object.entries(rolesLookup).filter(([key]) => selectedTragedys.length == 0 || selectedTragedys
        .flatMap( (t) => [...tragedysLookup[t as keyof typeof tragedysLookup].mainPlots, ...tragedysLookup[t as keyof typeof tragedysLookup].subPlots] )
        .flatMap((p) => Object.entries(plotsLookup[p].roles)
            .filter(([, v]) => v && (isArray(v) || v > 0))
            .map(([k]) => k))
        .includes(key)) as [key, role] (key)}
    <article>
      <header>
        {#if role.doseNotTriggerIncidentEffect}
          <span class="badge" style="float: right;">
            <Translation translationKey={'Dose not Trigger Incident Effects'} />
          </span>
        {/if}
        <h2><Translation translationKey={`:${role.id}:`} /></h2>
      </header>

      {#each role.abilities ??[] as a}
        <Ability {a} link />
      {/each}

    </article>
  {/each}
</main>

<style>
  .badge {
    background-color: var(--pico-primary);
    color: var(--pico-primary-inverse);
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    margin-right: 0.5rem;
  }
</style>
