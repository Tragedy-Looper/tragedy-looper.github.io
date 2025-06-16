<script lang="ts">
  import type { PageProps } from './$types';
  import { keywordsLookup } from '../../../../../data';
  import Translation from '../../../../../view/translation.svelte';

  let { data }: PageProps = $props();
  let keyword = $derived(keywordsLookup[data.id]);
</script>

{#if keyword}
  <main class="container">
    <article>
      <header>
        <h2><Translation translationKey={`:${keyword.id}:`} /></h2>
      </header>
    </article>
  </main>
{:else}
  <p><Translation translationKey="Tag not found" /></p>
{/if}
