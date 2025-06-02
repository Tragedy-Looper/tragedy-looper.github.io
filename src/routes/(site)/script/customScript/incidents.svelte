<script lang="ts">
  import type { CharacterName } from '../../../../model/characters';
  import type { ICustomScriptIncidentSelectionGroup } from '../../../../model/customScript';
  import Translation from '../../../../view/translation.svelte';
  import Incedent from './incedent.svelte';

  export let incedentGroup: ICustomScriptIncidentSelectionGroup<CharacterName>;

  $: incidents = incedentGroup.selectors;
</script>

<table>
  <thead>
    <tr>
      <th><Translation translationKey={'Day'} /></th>
      <th><Translation translationKey={'Incident'} /></th>
      <th><Translation translationKey={'Culprit'} /></th>
      <th><Translation translationKey={'Options'} /></th>
    </tr>
  </thead>
  <tbody>
    {#each $incidents as incident}
      <Incedent {incident} />
    {/each}
  </tbody>
</table>
