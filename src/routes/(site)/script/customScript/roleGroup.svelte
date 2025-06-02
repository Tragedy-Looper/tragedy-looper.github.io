<script lang="ts">
  import type { CharacterName } from '../../../../model/characters';
  import type { ICustomScriptRoleExclusiveSelectionGroup } from '../../../../model/customScript';
  import Translation from '../../../../view/translation.svelte';
  import RoleSelect from './roleSelect.svelte';

  export let group: ICustomScriptRoleExclusiveSelectionGroup<CharacterName>;
  $: numberOfRoles = group.selectedNumber;
  $: selectors = group.selectors;
</script>

<h3>
  {#if group.role === 'person'}
    <Translation translationKey={'Number of Characters not in Plot roles'} />
  {:else}
    {group.role}
  {/if}
</h3>

{#if group.min !== group.max}
  <label>
    {#if group.role === 'person'}
      <small>(<Translation translationKey={'This inculdes Characters like Mystery Boy'} />)</small>
    {:else}
      Number of {group.role}'s
    {/if}
    <input type="number" bind:value={$numberOfRoles} min={group.min} max={group.max} />
  </label>
{/if}

{#each $selectors as role}
  <RoleSelect {role} />
{/each}
