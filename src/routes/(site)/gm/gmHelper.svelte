<script lang="ts">
  import { getRoleOfCast, type Script } from '../../../model/script';
  import '@picocss/pico/css/pico.css';
  import { roles, type RoleName, type AbilityType } from '../../../model/roles';
  import { characters, type CharacterName, isCharacterName } from '../../../model/characters';
  import {
    fromEntries,
    hasProp,
    includes,
    isArray,
    keys,
    renderCharacterDeath,
    require,
    showAll,
    type RenderCharacterDeath,
  } from '../../../misc';
  import { plots } from '../../../model/plots';
  import OncePer from './oncePer.svelte';
  import { incidents } from '../../../model/incidents';
  import { getString } from '../+layout.svelte';
  import { get } from 'svelte/store';
  import type { Role } from '../../../roles.g';
  import Translation from '../../../view/translation.svelte';

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
    .flatMap(([character, x]) => {
      if (typeof x == 'string') {
        if (x.includes('|')) {
          const [role, ...rest] = x.split('|');

          return x.split('|').map((x) => {
            return { ...roles[x as keyof typeof roles], character };
          });
        } else {
          return [{ ...roles[x as keyof typeof roles], character }];
        }
      } else {
        return [{ ...roles[x[0]], character, ...x[1] }];
      }
    })
    .map((x) => {
      const { name, ...rest } = x;
      return { role: name, ...rest } as Role & { role: RoleName; character: CharacterName };
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
      if (t == 'Delayed Loss condition: Protagonists Death') return 5;
      if (t == 'Mandatory Loss condition: Protagonists Death') return 5;
      if (t == 'Loss condition: Tragedy') return 4;
      if (t == 'Optional Loss condition: Tragedy') return 4;
      if (t == 'Mandatory') return 3;
      if (t == 'Optional Loss condition: Protagonists Death') return 2;
      if (t == 'Optional') return 1;
      return Infinity;
    };

    return ordering(b?.type) - ordering(a?.type);
  }
</script>

<hgroup style="align-self: start; justify-self: start;">
  <h4>{selectedScript.creator}</h4>
  <h1><Translation translationKey={selectedScript.title} /></h1>

  <h2>
    {#if selectedScript.set}
      ({selectedScript.set.number}) <Translation translationKey={selectedScript.set.name} />
    {/if}
  </h2>
</hgroup>
<table>
  <thead>
    <tr>
      <th><Translation translationKey={'Type'} /></th>
      <th><Translation translationKey={'Character'} /></th>
      <th><Translation translationKey={'Prerequiste'} /></th>
      <th><Translation translationKey={'Description'} /></th>
      <th><Translation translationKey={'Role / Plot / Incident'} /></th>
    </tr>
  </thead>
  <tbody>
    {#if scriptRoles.filter((x) => x.tags?.includes('Immortal')).length + showAll(abilities)
        .filter((x) => includes(x['timing'], 'Always'))
        .sort(sortabilities).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Always'} /></td>
      </tr>
      {#each scriptRoles.filter((x) => x.tags?.includes('Immortal')) as map}
        <tr>
          <td> <Translation translationKey={'mandatory'} /> </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td></td>
          <td> <Translation translationKey={"This Character can't die"} /> </td>
          <td>
            {$getString(map.role) ?? ''}
          </td>
        </tr>
      {/each}
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Always'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>
          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'On character death')).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'On Character Death'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'On character death'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>
          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'When this role is to be reveald') ).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'On Role reveal'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'When this role is to be reveald'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            <Translation translationKey={map.character} />
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            <Translation translationKey={map.prerequisite} />
          </td>
          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'Loop Start') ).length + showAll(usedCharacters).filter((x) => x['enters on loop'] !== undefined).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Loop Start'} /></td>
      </tr>
      {#each showAll(usedCharacters).filter((x) => x['enters on loop'] !== undefined) as map}
        <tr>
          <td> <Translation translationKey={'mandatory'} /> </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            <Translation translationKey={['On Loop {day}', { day: map['enters on loop'] }]} />
          </td>

          <td> <Translation translationKey={'Enters Play'} /> </td>
          <td>
            {$getString(map.role) ?? ''}
          </td>
        </tr>
      {/each}

      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Loop Start'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}

            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(usedCharacters).filter((x) => x['enters on day'] !== undefined).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Day Start'} /></td>
      </tr>
      {#each showAll(usedCharacters).filter((x) => x['enters on day'] !== undefined) as map}
        <tr>
          <td> <Translation translationKey={'mandatory'} /> </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            <Translation translationKey={['On Day {day}', { day: map['enters on day'] }]} />
          </td>

          <td> <Translation translationKey={'Enters Play'} /> </td>
          <td>
            {$getString(map.role) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'Mastermind Action step') ).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Placing Cards'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Mastermind Action step'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}

            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Card resolve')).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Resolving Cards'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Card resolve'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Mastermind Ability')).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Abilities Mastermind'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Mastermind Ability'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if scriptRoles.filter((x) => x['goodwillRefusel'] !== undefined).length + showAll(abilities).filter( (x) => includes(x['timing'], 'Goodwill ablility step') ).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Abilities Protagonists'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Goodwill ablility step'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
      {#each scriptRoles
        .filter((x) => x['goodwillRefusel'] !== undefined)
        .sort( (a, b) => sortabilities({ type: a.goodwillRefusel ?? 'Optional' }, { type: b.goodwillRefusel ?? 'Optional' }) ) as map}
        <tr>
          <td>
            <Translation translationKey={map.goodwillRefusel} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td></td>
          <td> <Translation translationKey={'Refuse Goodwill Ability'} /> </td>
          <td>
            {$getString(map.role) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter( (x) => includes(x['timing'], 'Incident trigger') ).length + usedIncidents.length + showAll(abilities).filter( (x) => includes(x['timing'], 'Incident step') ).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Incidents'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Incident trigger'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Incident step'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}

            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
      {#each usedIncidents as i}
        {@const char = isCharacterName(i.culprit) ? characters[i.culprit] : undefined}
        {@const limit = char ? char.paranoiaLimit : require(i).mob}
        {#each i.effect as e}
          <tr>
            <td>
              {$getString(e.type) ?? ''}
            </td>
            <td>
              {#if char == undefined}
                <Translation translationKey={'Mob'} />:
              {/if}
              {$getString(i.culprit) ?? ''}
            </td>
            <td>
              <Translation translationKey={['On day {day}', { day: i.day }]} />
              {#if limit ?? 0 > 0}<Translation translationKey={('limit {limit}', { limit })} />{/if}
              {#if e.prerequisite}
                | <Translation translationKey={e.prerequisite} />
              {/if}
            </td>

            <td>
              {#if require(char)?.doseNotTriggerIncidentEffect}
                <Translation translationKey={'This has no effect but the incident is triggered.'} />
              {:else if char?.name && roles[getRoleOfCast(selectedScript, char.name) ?? 'Person']?.doseNotTriggerIncidentEffect}
                <Translation translationKey={'This has no effect but the incident is triggered.'} />
              {:else}
                <Translation translationKey={e.description} />
              {/if}
              <OncePer ability={e} />
              <!-- <OncePer ability={i} /> -->
            </td>

            <td>
              {#if isArray(i.incident)}
                {#each i.incident as incident, index}
                  {#if index > 0}
                    →
                  {/if}
                  {$getString(incident) ?? ''}
                {/each}
              {:else}
                {$getString(i.incident) ?? ''}
              {/if}
            </td>
          </tr>
        {/each}
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Day End')).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Night: Day End'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Day End'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
    {#if showAll(abilities).filter((x) => includes(x['timing'], 'Loop End')).length > 0}
      <tr>
        <td colspan="7"><Translation translationKey={'Night: Loop End'} /></td>
      </tr>
      {#each showAll(abilities)
        .filter((x) => includes(x['timing'], 'Loop End'))
        .sort(sortabilities) as map}
        <tr>
          <td>
            <Translation translationKey={map.type} />
          </td>
          <td>
            {$getString(map.character) ?? ''}
          </td>
          <td>
            {includes(map.timing, 'Last Day') ? $getString('Last Day') : ''}
            {$getString(map.prerequisite) ?? ''}
          </td>

          <td>
            {$getString(map.description) ?? ''}
            <OncePer ability={map} />
          </td>
          <td>
            {$getString(map.role) ?? ''}
            {$getString(map.plot) ?? ''}
          </td>
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<style lang="scss">
  td[colspan] {
    padding-top: calc(2 * var(--spacing));
    border-color: var(--pico-primary);
    --border-width: 3px;
  }
</style>
