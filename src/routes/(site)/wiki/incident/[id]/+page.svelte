<script lang="ts">
  import { incidentsLookup } from '../../../../../data';
  import Translation from '../../../../../view/translation.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let incident = incidentsLookup[data.id];
</script>

{#if incident}
  <h1><Translation translationKey={incident.name} /></h1>
  <ul>
    {#if incident.faked}
      <li>
        <Translation translationKey={'Faked'} />
      </li>
    {/if}
    {#if incident.repeatedCulprit}
      <li>
        <Translation translationKey={'Repeated Culprit'} />
      </li>
    {/if}
    {#if incident.mob}
      <li>
        <Translation translationKey={['Mob incident ({mob})', { mob: incident.mob }]} />
      </li>
    {/if}
    <li>
      <b><Translation translationKey="Effect" />:</b>
      <ul>
        {#each incident.effect ?? [] as effect}
          <li><Translation translationKey={effect.description} link/></li>
        {/each}
      </ul>
    </li>
  </ul>
{:else}
  <p><Translation translationKey="Incident not found" /></p>
{/if}
