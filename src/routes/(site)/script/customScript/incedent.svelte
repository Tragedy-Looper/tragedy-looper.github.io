<script lang="ts">
  import { derived } from 'svelte/store';
  import type { CharacterName } from '../../../../model/characters';
  import type { ICustomScriptIncidentSelection } from '../../../../model/customScript';
  import Option from './option.svelte';
  import { incidentNames } from '../../../../model/incidents';
  import { getString } from '../../+layout.svelte';
  import Translation from '../../../../view/translation.svelte';
  import { charactersLookup, incidentsLookup } from '../../../../data';

  export let incident: ICustomScriptIncidentSelection<CharacterName>;

  $: availableCharacters = derived(incident.availableCharacters, (a) => {
    return a.toSorted((a, b) => {
      return a.localeCompare(b);
    });
  });
  $: options = incident.options;
  $: selectedCharacter = incident.selectedCharacter;
  $: isNotInTragedy = incident.notInTragedy;
  $: selectedDay = incident.currentDay;
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
    {selectedDay}
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
        <option value="" selected>{$getString('No incident')}</option>
        {#each $allIncidents as incident}
          <option value={incident}
            ><Translation translationKey={incidentsLookup[incident].name} /></option
          >
        {/each}
      </select>
    </div>
  </td>
  <td>
    {#if $selectedIncident}
      <select bind:value={$selectedCharacter}>
        <option value="" disabled selected>{$getString('Select a character')}</option>
        {#each $availableCharacters as day}
          <option value={day} ><Translation translationKey={charactersLookup[day].name} /></option>
        {/each}
      </select>
    {:else}{/if}
  </td>
  <td>
    {#each $options as option}
      <Option {option} />
    {/each}
  </td>
</tr>
