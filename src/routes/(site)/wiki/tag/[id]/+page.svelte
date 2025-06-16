<script lang="ts">
  import type { PageProps } from './$types';
  import { rolesLookup, tagsLookup } from '../../../../../data';
  import Ability from '../../../../../view/Ability.svelte';
  import Translation from '../../../../../view/translation.svelte';

  let { data }: PageProps = $props();
  let tag = $derived(tagsLookup[data.id]);
</script>

{#if tag}
  <main class="container">
    <article>
      <header>
        <h2><Translation translationKey={`:${tag.id}:`} /></h2>
      </header>
    </article>
  </main>
{:else}
  <p><Translation translationKey="Tag not found" /></p>
{/if}
