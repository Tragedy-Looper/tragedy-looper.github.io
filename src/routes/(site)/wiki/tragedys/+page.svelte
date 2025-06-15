<script lang="ts">
  import '@picocss/pico/css/pico.css';
  import { tragedysLookup } from '../../../../data';
  import Translation from '../../../../view/translation.svelte';
</script>

<ul>
  {#each Object.keys(tragedysLookup) as tragedy}
    <li>
      <Translation translationKey={`:${tragedy}:`} link />
    </li>
  {/each}
</ul>
