<script lang="ts">
  import { onMount } from 'svelte';
  import { join, require, showAll } from '../misc';
  import type { Abilitie } from '../model/roles';
  import OncePer from '../routes/(site)/gm/oncePer.svelte';
  import { getString } from '../routes/(site)/+layout.svelte';

  export let a: Abilitie<Record<string, any>>;
  export let compact: boolean = false;

  $: ability = require(a);
</script>

<p>
  <span
    >[<b>{$getString(a.type)}</b>{#if ability.timing !== undefined}
      &nbsp;<i>
        {join(
          ability.timing.map((x) => $getString(x)),
          ', '
        )}</i
      >{/if}]</span
  >
  {#if ability.prerequisite}
    [<i>{$getString(ability.prerequisite)}</i>] {#if a.description !== undefined}⇒{/if}
  {/if}
  {$getString(a.description ?? '')}
  <OncePer {ability} {compact} />
</p>
