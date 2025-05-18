<script lang="ts">
  import { element, xlink_attr } from 'svelte/internal';
  import { getRoleOfCast, type Script } from '../../../model/script';
  import '@picocss/pico/css/pico.css';
  import { roles, type RoleName, type AbilityType } from '../../../model/roles';
  import { characters, type CharacterName, isCharacterName } from '../../../model/characters';
  import {
    fromEntries,
    hasProp,
    includes,
    keys,
    renderCharacterDeath,
    require,
    showAll,
    type RenderCharacterDeath,
  } from '../../../misc';
  import { plots } from '../../../model/plots';
  import OncePer from './oncePer.svelte';
  import { incidents } from '../../../model/incidents';

  export let selectedScript: Script;

  $: usedIncidents = showAll(
    selectedScript.incidents.map(
      (x) => [x, incidents[typeof x.incident === 'string' ? x.incident : x.incident[0]]] as const
    )
  ).map(([scriptIncident, incidendtMeta]) => {
    return {
      ...scriptIncident,
      ...incidendtMeta,
      effect: incidendtMeta.effect
        .map((x) => require(x))
        .map((x) => ({ ...x, type: x.type?.replaceAll('Character Death', 'Character Death') })),
    };
  });

  $: usedCharacters = Object.entries(selectedScript.cast).map(([key, value]) => {
    if (typeof value === 'string') {
      return { character: key, role: value };
    } else {
      return { character: key, role: value[0], ...value[1] };
    }
  });

  $: plotabilities = [...selectedScript.mainPlot, ...selectedScript.subPlots]
    .map((x) => {
      if (typeof x == 'string') {
        return { plot: x };
      }
      return { plot: x[0], ...x[1] };
    })
    .flatMap((x) => {
      const plot = require(plots[x.plot]);
      return plot.rules.map((y) => ({ ...x, ...plot, ...y }));
    })
    .map((x) => {
      const { name, ...rest } = x;
      return { ...rest, plot: name };
    });
  $: scriptRoles = Object.entries(selectedScript.cast)
    .map(([character, x]) => {
      if (typeof x == 'string') return { ...roles[x], character };
      else return { ...roles[x[0]], character, ...x[1] };
    })
    .map((x) => {
      const { name, ...rest } = x;
      return { role: name, ...rest };
    });
  $: roleabilities = scriptRoles.flatMap((x) => x.abilities.map((a) => ({ ...a, ...x })));

  $: abilities = [...plotabilities, ...roleabilities].map((x) => ({
    ...x,
    type: renderCharacterDeath(x.type),
  }));

  // $: abilityMapping = selectedRoles.flatMap((x) =>
  // 	x.abilities.map((y) => ({ ...y, name: x.name }))
  // );

  function sortabilities(
    a: { type?: RenderCharacterDeath<AbilityType> },
    b: { type?: RenderCharacterDeath<AbilityType> }
  ) {
    const ordering = (t: RenderCharacterDeath<AbilityType> | undefined) => {
      if (t == 'Delayed Loss condition: Character Death') return 5;
      if (t == 'Mandatory Loss condition: Character Death') return 5;
      if (t == 'Loss condition: Tragedy') return 4;
      if (t == 'Mandatory') return 3;
      if (t == 'Optional Loss condition: Character Death') return 2;
      if (t == 'Optional') return 1;
      return Infinity;
    };

    return ordering(b?.type) - ordering(a?.type);
  }
</script>

<hgroup style="align-self: start; justify-self: start;">
  <h4>{selectedScript.creator}</h4>
  <h1>{selectedScript.title}</h1>

  <h2>
    {#if selectedScript.set}
      ({selectedScript.set.number}) {selectedScript.set.name}
    {/if}
  </h2>
</hgroup>
<table>
  <thead>
    <th>Type</th>
    <th>Character</th>
    <th>Prerequiste</th>
    <th>Description</th>
    <th>Role / Plot / Incident</th>
  </thead>
  <tbody>
    {#if showAll(scriptRoles).filter((x) => x.unkillable === true).length + showAll(abilities)
        .filter((x) => includes(x['timing'], 'Always'))
        .sort(sortabilities).length > 0}
      <tr>
        <td colspan="7">Always </td>
      </tr>
      {#each showAll(scriptRoles).filter((x) => x.unkillable === true) as map}
        <tr>
          <td> mandatory </td>
          <td>
            {map.character ?? ''}
          </td>
          <td />
          <td> This Character can't die </td>
          <td>
            {map.role ?? ''}
          </td>
        </tr>
      {/each}
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Always'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>
          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}
            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'On character death')).length > 0}
      <tr>
        <td colspan="7">On Character Death</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'On character death'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>
          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}
            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'When this role is to be reveald') ).length > 0}
      <tr>
        <td colspan="7">On Role reveal</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'When this role is to be reveald'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>
          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}
            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'Loop Start') ).length + showAll(usedCharacters).filter((x) => x['enters on loop'] !== undefined).length > 0}
      <tr>
        <td colspan="7">Loop Start</td>
      </tr>
      {#each showAll(usedCharacters).filter((x) => x['enters on loop'] !== undefined) as map}
        <tr>
          <td> mandatory </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            On Loop {map['enters on loop']}
          </td>

          <td> Enters Play </td>
          <td>
            {map.role ?? ''}
          </td>
        </tr>
      {/each}

      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Loop Start'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}

            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(usedCharacters).filter((x) => x['enters on day'] !== undefined).length > 0}
      <tr>
        <td colspan="7">Day Start</td>
      </tr>
      {#each showAll(usedCharacters).filter((x) => x['enters on day'] !== undefined) as map}
        <tr>
          <td> mandatory </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            On Day {map['enters on day']}
          </td>

          <td> Enters Play </td>
          <td>
            {map.role ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'Mastermind Action step') ).length > 0}
      <tr>
        <td colspan="7">Placing Cards</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Mastermind Action step'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}

            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Card resolve')).length > 0}
      <tr>
        <td colspan="7">Resolving Cards</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Card resolve'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}

            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Mastermind Ability')).length > 0}
      <tr>
        <td colspan="7">Abilities Mastermind</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Mastermind Ability'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}

            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if scriptRoles.filter((x) => x['goodwillRefusel'] !== undefined).length + showAll(abilities).filter( (x) => includes(x['timing'], 'Goodwill ablility step') ).length > 0}
      <tr>
        <td colspan="7">Abilities Protagonists</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Goodwill ablility step'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}
            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
      {#each scriptRoles
        .filter((x) => x['goodwillRefusel'] !== undefined)
        .sort( (a, b) => sortabilities({ type: a.goodwillRefusel ?? 'Optional' }, { type: b.goodwillRefusel ?? 'Optional' }) ) as map}
        <tr>
          <td>
            {map.goodwillRefusel}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td />
          <td> Refuse Goodwill Ability </td>
          <td>
            {map.role ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'Incident trigger') ).length + usedIncidents.length + showAll(abilities).filter( (x) => includes(x['timing'], 'Incident step') ).length > 0}
      <tr>
        <td colspan="7">Incidents</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Incident trigger'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}
            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Incident step'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}

            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
      {#each usedIncidents as i}
        {@const char = isCharacterName(i.culprit) ? characters[i.culprit] : undefined}
        {@const limit = char ? char.paranoiaLimit : require(i).mob}
        {#each i.effect as e}
          <tr>
            <td>
              {e.type ?? ''}
            </td>
            <td>
              {#if char == undefined}
                Mob:
              {/if}
              {i.culprit ?? ''}
            </td>
            <td>
              On day {i.day}
              {#if limit ?? 0 > 0}limit {limit}{/if}
              {#if e.prerequisite}
                | {e.prerequisite}
              {/if}
            </td>

            <td>
              {#if require(char)?.doseNotTriggerIncidentEffect}
                This has no effect but the incident is triggered.
              {:else if char?.name && roles[getRoleOfCast(selectedScript, char.name) ?? 'Person']?.doseNotTriggerIncidentEffect}
                This has no effect but the incident is triggered.
              {:else}
                {e.description ?? ''}
              {/if}
              <OncePer ability={e} />
              <!-- <OncePer ability={i} /> -->
            </td>

            <td>
              {i.incident ?? ''}
            </td>
          </tr>
        {/each}
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Day End')).length > 0}
      <tr>
        <td colspan="7">Night: Day End</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Day End'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}
            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Loop End')).length > 0}
      <tr>
        <td colspan="7">Night: Loop End</td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Loop End'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            {map.type}
          </td>
          <td>
            {map.character ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? 'Last Day' : ''}
            {map.prerequisite ?? ''}
          </td>

          <td>
            {map.description ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {map.role ?? ''}

            {map.plot ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<style lang="scss">
  td[colspan] {
    padding-top: calc(2 * var(--spacing));
    border-color: var(--primary);
    --border-width: 3px;
  }
</style>
