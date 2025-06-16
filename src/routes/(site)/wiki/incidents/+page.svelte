<script lang="ts">
  import '@picocss/pico/css/pico.css';
  import { incidentsLookup, tragedysLookup } from '../../../../data';
  import Translation from '../../../../view/translation.svelte';
  import Ability from '../../../../view/Ability.svelte';

  let selectedTragedys = $state([] as string[]);
</script>

<main class="container">
  <h1>
    <Translation translationKey={'Incidents'} />
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

  {#each Object.entries(incidentsLookup).filter(([key]) => selectedTragedys.length == 0 || selectedTragedys
        .flatMap((t) => tragedysLookup[t as keyof typeof tragedysLookup].incidents)
        .includes(key)) as [key, incident] (key)}
    <article>
      <header>
        {#if incident.faked}
          <span class="badge" style="float: right;">
            <Translation translationKey={'Faked'} />
          </span>
        {/if}
        {#if incident.repeatedCulprit}
          <span class="badge" style="float: right;">
            <Translation translationKey={'Repeated Culprit'} />
          </span>
        {/if}
        {#if incident.mob}
          <span class="badge" style="float: right;">
            <Translation translationKey={['Mob ({count})', { count: incident.mob }]} />
          </span>
        {/if}
        <h2><Translation translationKey={`:${incident.id}:`} /></h2>
      </header>

      {#each incident.effect as e}
        <p>
          {#if e.type}
            <b>[<Translation translationKey={e.type} />]</b>
          {/if}
          {#if e.prerequisite}
            [<i><Translation translationKey={e.prerequisite} /></i>]{#if e.description}⇒{/if}
          {/if}
          {#if e.description}
            <Translation translationKey={e.description} />
          {/if}
        </p>
        <footer>
          {#if e.timesPerGame}
            <span class="badge">
              <Translation translationKey={['{times} times per game', { times: e.timesPerGame }]} />
            </span>
          {/if}
          {#if e.timesPerLoop}
            <span class="badge">
              <Translation translationKey={['{times} times per loop', { times: e.timesPerGame }]} />
            </span>
          {/if}
        </footer>
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
