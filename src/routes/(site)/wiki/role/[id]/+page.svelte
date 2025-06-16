<script lang="ts">
  import { rolesLookup } from '../../../../../data';
  import Ability from '../../../../../view/Ability.svelte';
  import Translation from '../../../../../view/translation.svelte';
  import type { PageProps } from './$types';
  import '@picocss/pico/css/pico.css';

  let { data }: PageProps = $props();
  let role = $derived(rolesLookup[data.id]);
</script>

{#if role}
  <main class="container">
    <article>
      <header>
        {#if role.doseNotTriggerIncidentEffect}
          <span class="badge" style="float: right;">
            <Translation translationKey={'Dose not Trigger Incident Effects'} />
          </span>
        {/if}
        <h2><Translation translationKey={`:${role.id}:`} /></h2>
      </header>

      {#each role.abilities ?? [] as a}
        <Ability {a} link />
      {/each}
    </article>
  </main>
  {:else}
  ungn
{/if}
