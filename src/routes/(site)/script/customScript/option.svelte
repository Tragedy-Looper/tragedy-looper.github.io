<script lang="ts">
    import { derived } from 'svelte/store';
  import { characters } from '../../../../model/characters';
  import type { AdditionalOptions } from '../../../../model/customScript';

  export let option: AdditionalOptions;

  $: selection = option.value;

  $: tragedySet = option.script.tragedySet;
  $: selectodPlots = option.script.selectedPlots;
  $: otherPlots = [...$tragedySet.mainPlots, ...$tragedySet.subPlots];

  $: incidents = derived( option.script.incidents,a=> a.toSorted((a,b)=> a.localeCompare(b)));
  $: unusedRoles = derived( option.script.unusedRoles,a=> a.toSorted((a,b)=> a.localeCompare(b)));
  $: usedRoles = derived( option.script.usedRoles,a=> a.toSorted((a,b)=> a.localeCompare(b)));
  $: allRoles = derived( option.script.allRoles,a=> a.toSorted((a,b)=> a.localeCompare(b)));

  $: usedCharacters = option.script.usedCharacters;

  let viewOptional = false;
</script>

<div>
  {#if option.option.type == 'text' || option.option.type == 'number'}
    {#if option.option.optional === true}
      <input
        type="checkbox"
        role="switch"
        on:change={(e) => ($selection = undefined)}
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
