<script lang="ts">
    import { getString } from '../../+layout.svelte';
  import { characters, rolesLookup } from '../../../../data';
  import { isCharacterPlotless, type CharacterName } from '../../../../model/characters';
  import type { ICustomScriptRoleExclusiveSelectionGroup } from '../../../../model/customScript';
  import { singleRolenames } from '../../../../model/roles';
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
    {#each singleRolenames(group.role) as role, index}
      {#if index > 0},
      {/if}
      <Translation translationKey={rolesLookup[role].name} />
    {/each}
  {/if}
</h3>

{#if group.min !== group.max}
  <label>
    {#if group.role === 'person'}
      <small>(<Translation translationKey={['This inculdes Characters like {char}',{char:characters.filter(isCharacterPlotless).map(x=>$getString(x.name)).filter((x,i)=>i<2).join(` ${$getString('or')} `)}]} />)</small>
    {:else}
      Number of {#each singleRolenames(group.role) as role, index}
        {#if index > 0},
        {/if}
        <Translation translationKey={rolesLookup[role].name} />
      {/each}'s
    {/if}
    <input type="number" bind:value={$numberOfRoles} min={group.min} max={group.max} />
  </label>
{/if}

{#each $selectors as role}
  <RoleSelect {role} />
{/each}
