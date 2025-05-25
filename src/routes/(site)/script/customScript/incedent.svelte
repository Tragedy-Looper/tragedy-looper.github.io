<script lang="ts">
  import { derived } from 'svelte/store';
  import type { CharacterName } from '../../../../model/characters';
  import type { ICustomScriptIncidentSelection } from '../../../../model/customScript';
  import Option from './option.svelte';
  import { incidentNames, incidents } from '../../../../model/incidents';
  import { getString } from '../../+layout.svelte';

  export let incident: ICustomScriptIncidentSelection<CharacterName>;

  $: availableCharacters = derived(incident.availableCharacters, (a) => {
    return a.toSorted((a, b) => {
      return a.localeCompare(b);
    });
  });
  $: availableDays = incident.availableDays;
  $: options = incident.options;
  $: selectedCharacter = incident.selectedCharacter;
  $: isNotInTragedy = incident.notInTragedy;
  $: selectedDay = incident.selectedDay;
  $: selectedIncident = incident.selectedIncident;
  $: allTragedyIncidents = derived(incident.script.incidents, (a) =>
    a.toSorted((a, b) => a.localeCompare(b))
  );
  $: allNotTragedyIncidents = derived(incident.script.incidents, (a) =>
    incidentNames.filter((x) => !a.includes(x)).toSorted((a, b) => a.localeCompare(b))
  );

  $: allIncidents = derived(
    [allTragedyIncidents, allNotTragedyIncidents, isNotInTragedy],
    ([$allTragedyIncidents, $allNotTragedyIncidents, $isNotInTragedy]) => {
      return $isNotInTragedy ? $allNotTragedyIncidents : $allTragedyIncidents;
    }
  );
</script>

<tr>
  <td>
    <select bind:value={$selectedDay}>
      {#each $availableDays as day}
        <option>{day}</option>
      {/each}
    </select>
  </td>
  <td>
    <div role="group">
      <label>
        {$isNotInTragedy ? $getString('Is not in Tragedy') : $getString('Is in Tragedy')}
        <input
          role="switch"
          type="checkbox"
          bind:checked={$isNotInTragedy}
          title="Check if this incident is not in the tragedy"
        />
      </label>
      <select bind:value={$selectedIncident}>
        {#each $allIncidents as day}
          <option>{day}</option>
        {/each}
      </select>
    </div>
  </td>
  <td>
    <select bind:value={$selectedCharacter}>
      {#each $availableCharacters as day}
        <option>{day}</option>
      {/each}
    </select>
  </td>
  <td>
    {#each $options as option}
      <Option {option} />
    {/each}
  </td>
</tr>
