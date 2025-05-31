<script lang="ts">
  import type { CharacterName } from '../../../../model/characters';
  import type { ICustomScriptIncidentSelectionGroup } from '../../../../model/customScript';
  import Incedent from './incedent.svelte';

  export let incedentGroup: ICustomScriptIncidentSelectionGroup<CharacterName>;

  $: incidents = incedentGroup.selectors;
</script>


<table>
  <thead>
    <tr>
      <th>Day</th>
      <th>Incident</th>
      <th>Culprit</th>
      <th>Options</th>
    </tr>
  </thead>
  <tbody>
    {#each $incidents as incident}
      <Incedent {incident} />
    {/each}
  </tbody>
</table>
