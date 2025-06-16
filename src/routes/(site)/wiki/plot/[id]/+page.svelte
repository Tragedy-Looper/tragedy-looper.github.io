<script lang="ts">
  import { plotsLookup } from '../../../../../data';
  import { isArray } from '../../../../../misc';
  import Translation from '../../../../../view/translation.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  let plot = $derived(plotsLookup[data.id]);
</script>

{#if plot}
  <h1><Translation translationKey={plot.name} /></h1>
  <ul>
    <li>
      <b><Translation translationKey="Roles" />:</b>
      <ul>
        {#each Object.entries(plot.roles ?? {}) as [id, role]}
          <li>
            <Translation translationKey={`:${id}:`} link />

            ({#if isArray(role)}{role[0]}-{role[1]}{:else if role}{role}{/if})
          </li>
        {/each}
      </ul>
    </li>
    <li>
      <b><Translation translationKey="Rules" />:</b>
      <ul>
        {#each plot.rules ?? [] as rule}
          <li><Translation translationKey={rule.description} link /></li>
        {/each}
      </ul>
    </li>
  </ul>
{:else}
  <p><Translation translationKey="Plot not found" /></p>
{/if}
