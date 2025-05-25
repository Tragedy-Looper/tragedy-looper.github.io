<script lang="ts">
  import { derived } from 'svelte/store';
  import { characters } from '../../../../model/characters';
  import type { AdditionalOptions } from '../../../../model/customScript';

  // export let option: AdditionalOptions;

  let { option }: { option: AdditionalOptions } = $props();

  let selection = option.value;

  let tragedySet = option.script.tragedySet;
  let selectodPlots = option.script.selectedPlots;
  let otherPlots = [...$tragedySet.mainPlots, ...$tragedySet.subPlots];

  let incidents = derived(option.script.incidents, (a) => a.toSorted((a, b) => a.localeCompare(b)));
  let unusedRoles = derived(option.script.unusedRoles, (a) =>
    a.toSorted((a, b) => a.localeCompare(b))
  );
  let usedRoles = derived(option.script.usedRoles, (a) => a.toSorted((a, b) => a.localeCompare(b)));
  let allRoles = derived(option.script.allRoles, (a) => a.toSorted((a, b) => a.localeCompare(b)));

  let usedCharacters = option.script.usedCharacters;

  let viewOptional = false;
</script>

<div>
  {#if option.option.type == 'text' || option.option.type == 'number'}
    {#if option.option.optional === true}
      <input
        type="checkbox"
        role="switch"
        onchange={(e) => ($selection = undefined)}
        bind:checked={viewOptional}
      />
    {/if}
    {option.option.name}
    {#if option.option.optional !== true || viewOptional}
      {#if option.option.type == 'number'}
        <input bind:value={$selection} type="number" />
      {:else if option.option.type == 'text'}
        <input bind:value={$selection} type="text" />
      {/if}
    {/if}
  {:else}
    {option.option.name}

    <select bind:value={$selection}>
      {#if option.option.optional == true}
        <option value={undefined}>Not Set</option>
      {/if}
      {#if option.option.type == 'plot'}
        {#each otherPlots.filter((p) => !$selectodPlots.includes(p)) as p}
          <option value={p}>{p}</option>
        {/each}
      {:else if option.option.type == 'character'}
        {#each $usedCharacters as p}
          <option value={p}>{p}</option>
        {/each}
      {:else if option.option.type == 'location'}
        {#each option.script.locations as p}
          <option value={p}>{p}</option>
        {/each}
      {:else if option.option.type == 'incident'}
        {#each $incidents as p}
          <option value={p}>{p}</option>
        {/each}
      {:else if option.option.type == 'role not in plot'}
        {#each $unusedRoles as p}
          <option value={p}>{p}</option>
        {/each}
      {:else if option.option.type == 'role in plot'}
        {#each $usedRoles as p}
          <option value={p}>{p}</option>
        {/each}
      {:else if option.option.type == 'role in tragedy set'}
        {#each $allRoles as p}
          <option value={p}>{p}</option>
        {/each}
      {:else if Array.isArray(option.option.type)}
        {#each option.option.type as p}
          <option value={p}>{p}</option>
        {/each}
      {/if}
    </select>
  {/if}
</div>
