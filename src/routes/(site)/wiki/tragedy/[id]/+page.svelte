<script lang="ts">
  import type { PageProps } from './$types';
  import { keywordsLookup, tragedysLookup } from '../../../../../data';
  import Translation from '../../../../../view/translation.svelte';

  let { data }: PageProps = $props();
  let tragedy = $derived(tragedysLookup[data.id]);
</script>

{#if tragedy}
  <main class="container">
    <article>
      <header>
        <h2><Translation translationKey={`:${tragedy.id}:`} /></h2>
      </header>
      <h4><Translation translationKey="Main Plots" /></h4>
      <ul>
        {#each tragedy.mainPlots as plot}
          <li><Translation translationKey={`:${plot}:`} link /></li>
        {/each}
      </ul>
      <h4><Translation translationKey="Sub Plots" /></h4>
      <ul>
        {#each tragedy.subPlots as plot}
          <li><Translation translationKey={`:${plot}:`} link /></li>
        {/each}
      </ul>
      <h4><Translation translationKey="Incidents" /></h4>
      <ul>
        {#each tragedy.incidents as incident}
          <li><Translation translationKey={`:${incident}:`} link /></li>
        {/each}
      </ul>
      <h4><Translation translationKey="Extra Rules" /></h4>
      <ul>
        {#each tragedy.extraRules ?? [] as rule}
          <li>
            <h5>
              <Translation translationKey={rule.name} />
            </h5>
            <p><Translation translationKey={rule.description} /></p>
          </li>
        {/each}
      </ul>
    </article>
  </main>
{:else}
  <p><Translation translationKey="Tag not found" /></p>
{/if}
