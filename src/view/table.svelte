<script lang="ts">
  import { onMount } from 'svelte';
  import { cssesc, distinct, hasProp, join, keys, require, showAll } from '../misc';
  import {
    type CharacterName,
    characterscomesInLater,
    characters as characterLookup,
    isCharacterLate,
  } from '../model/characters';
  import { incidents as incidentsLookup } from '../model/incidents';
  import { plots } from '../model/plots';
  import { roles, type Abilitie, type RoleName } from '../model/roles';
  import type { Script, ScriptIncident, ScriptIncidentPlayer } from '../model/script';
  import { tragedySets, type TragedySet, type TragedySetName } from '../model/tragedySets';
  import Selection from './selection.svelte';
  import Ability from './Ability.svelte';
  import { getString } from '../translations';

  export let tragedySet: TragedySetName;
  export let cast: readonly CharacterName[];
  export let incidents: readonly ScriptIncidentPlayer[];
  export let specialRules: readonly string[];

  export let tablet = true;
  export let touchTarget = false;

  export let lang: string;

  onMount(() => {
    const incidentTemplate = document.getElementById('incidences') as HTMLTemplateElement;
    const roleTemplate = document.getElementById('role') as HTMLTemplateElement;
    const tragedyRulesTemplate = document.getElementById('tragedyRules') as HTMLTemplateElement;

    const newPageTemplate = document.getElementById('newPage') as HTMLTemplateElement;
    const root = document.getElementById('root') as HTMLElement;
    if (tablet) {
      const containers: HTMLElement[] = [3, 2, 1]
        .map((x) => `rest-${x}`)
        .map((id) => document.getElementById(id) as HTMLDivElement);

      containers.forEach((c) => c.replaceChildren());

      let containerHeight = containers.map((x) => x.getBoundingClientRect().height);

      const elementWidth = containers.map((container) => {
        const width = container.getBoundingClientRect().width;
        container.style.width = `${width}px`;

        const randomElement = Array.from(tragedyRulesTemplate.content.children)
          .concat(Array.from(incidentTemplate.content.children))
          .concat(Array.from(roleTemplate.content.children))
          .map((x) => x.cloneNode(true) as HTMLDivElement)[0];

        container.appendChild(randomElement);
        const elementWidth = randomElement.getBoundingClientRect().width;
        randomElement.remove();
        const exactNumberOfColumns = width / elementWidth;
        const min = Math.floor(exactNumberOfColumns);
        const max = Math.ceil(exactNumberOfColumns);
        const border = 1;
        const newElementWidth =
          Math.abs((width - min * border) / min - elementWidth) <
          Math.abs((width - max * border) / max - elementWidth)
            ? (width - min * border) / min
            : (width - max * border) / max;

        return newElementWidth;
      });

      const updateHeight = () => {
        for (let i = 0; i < containerHeight.length; i++) {
          const height = containerHeight[i];
          const container = containers[i];
          container.style.height = `${height}px`;
          container.style.overflowY = 'visible';
        }
      };
      updateHeight();

      Array.from(tragedyRulesTemplate.content.children)
        .concat(Array.from(incidentTemplate.content.children))
        .concat(Array.from(roleTemplate.content.children))
        .map((x) => x.cloneNode(true) as HTMLDivElement)
        .forEach((incident) => {
          let currentContainer: HTMLElement | undefined = undefined;
          let currntDepth: number = Infinity;
          let currntWidth: number = Infinity;
          while (currentContainer == undefined) {
            let minHeight: number = Infinity;
            for (const [container, i] of containers.map((x, i) => [x, i] as const)) {
              container.appendChild(incident);
              incident.style.width = `${elementWidth[i]}px`;
              const container2IncedentRect = incident.getBoundingClientRect();
              const placmenetBottom = container2IncedentRect.bottom;
              minHeight = Math.min(minHeight, container2IncedentRect.height);
              let rect = container.getBoundingClientRect();
              if (isInsilde(container2IncedentRect, rect)) {
                incident.remove();
                rect = container.getBoundingClientRect();
                if (placmenetBottom < currntDepth) {
                  currntDepth = placmenetBottom;
                  currentContainer = container;
                  currntWidth = elementWidth[i];
                  continue;
                }
              } else {
                incident.remove();
              }
            }
            if (currentContainer == undefined) {
              containerHeight = containerHeight.map((x) => x + minHeight / 10);

              updateHeight();
            }
          }
          incident.style.width = `${currntWidth}px`;
          currentContainer.appendChild(incident);

          // // add page
          // const newPage = newPageTemplate.content.firstChild?.cloneNode(true) as HTMLDivElement;
          // root.appendChild(newPage);
          // containers.push(newPage);
          // newPage.appendChild(incident);
        });
    } else {
      const containers: HTMLElement[] = [1, 2, 3]
        .map((x) => `rest-${x}`)
        .map((id) => document.getElementById(id) as HTMLDivElement);

      containers.forEach((c) => c.replaceChildren());

      let originalWidth: number;

      const elementWidth = containers.map((container) => {
        const randomElement = Array.from(tragedyRulesTemplate.content.children)
          .concat(Array.from(incidentTemplate.content.children))
          .concat(Array.from(roleTemplate.content.children))
          .map((x) => x.cloneNode(true) as HTMLDivElement)[0];

        container.appendChild(randomElement);
        // fill other containers, otherwise they will not layouted correctly.
        const emptyContaines = containers.filter((x) => x.children.length == 0);
        emptyContaines.forEach((c) => c.appendChild(randomElement.cloneNode(true)));
        const width = container.getBoundingClientRect().width;

        const elementWidth = randomElement.getBoundingClientRect().width;
        if (!originalWidth) originalWidth = elementWidth;
        randomElement.remove();
        const exactNumberOfColumns = width / elementWidth;
        const min = Math.floor(exactNumberOfColumns);
        const max = Math.ceil(exactNumberOfColumns);
        const border = 1;
        const newElementWidth =
          Math.abs((width - min * border) / min - elementWidth) <
          Math.abs((width - max * border) / max - elementWidth)
            ? (width - min * border) / min
            : (width - max * border) / max;
        emptyContaines.forEach((c) => c.firstChild?.remove());

        return newElementWidth;
      });

      Array.from(tragedyRulesTemplate.content.children)
        .concat(Array.from(incidentTemplate.content.children))
        .concat(Array.from(roleTemplate.content.children))
        .map((x) => x.cloneNode(true) as HTMLDivElement)
        .forEach((incident) => {
          for (const [container, i] of containers.map((x, i) => [x, i] as const)) {
            container.appendChild(incident);
            if (i < elementWidth.length) {
              incident.style.width = `${elementWidth[i]}px`;
            } else {
              incident.style.width = `${originalWidth}px`;
            }

            // check that the other containr have element, otherwise the may change the size of this container wehn no longer empty

            const emptyContaines = containers.filter((x) => x.children.length == 0);

            emptyContaines.forEach((c) => c.appendChild(incident.cloneNode(true)));

            const rect = container.getBoundingClientRect();
            const container2IncedentRect = incident.getBoundingClientRect();
            const wasInside = isInsilde(container2IncedentRect, rect);
            emptyContaines.forEach((c) => c.firstChild?.remove());
            if (wasInside) {
              return;
            }
            incident.remove();
          }
          // add page
          const newPage = newPageTemplate.content.firstChild?.cloneNode(true) as HTMLDivElement;
          root.appendChild(newPage);
          containers.push(newPage);
          incident.style.width = `${originalWidth}px`;
          newPage.appendChild(incident);
        });
    }
  });

  function isInsilde(element: DOMRect, container: DOMRect): boolean {
    return (
      element.left >= container.left &&
      element.right <= container.right &&
      element.top >= container.top &&
      element.bottom <= container.bottom
    );
  }

  console.log(cssesc('test wert', { isIdentifier: true }));

  // $: tragedySet = script.tragedySet;
  $: chars = distinct(cast)
    .map((x) => characterLookup[x])
    .sort((a, b) => a.name.localeCompare(b.name));

  $: tg = tragedySets[tragedySet];

  $: r = distinct(
    [...tg.mainPlots, ...tg.subPlots].flatMap((x) => keys(plots[x].roles) as RoleName[])
  )
    .concat(require(tg).aditionalRoles ?? [])
    .sort()
    .map((x) => roles[x]);

  $: mainPlots = tragedySets[tragedySet].mainPlots.map((x) => plots[x]);
  $: subPlots = tragedySets[tragedySet].subPlots.map((x) => plots[x]);
  $: ince = incidents.map((x) => ({ ...incidentsLookup[x.incident], day: x.day }));

  function WriteLiens(cellCollback: (() => string[])[]) {
    let current = '';

    const rows = cellCollback.map((x) => x());
    // check length
    let columns: number | undefined = undefined;
    for (let i = 0; i < rows.length; i++) {
      if (i > 0) {
        current += '\n';
      }
      current += '"';
      const element = rows[i];
      if (columns === undefined) {
        columns = element.length;
      } else if (columns != element.length) {
        throw new Error(
          `row ${i + 1} has length ${element.length} expected ${columns} ${join(element, ' ')}`
        );
      }
      current += join(element, ' ') + '"';
    }
    // console.log(current.replaceAll('"', ''));
    return [
      current,
      join(
        [
          'min-content',
          ...r.map(() => 'auto'),
          'auto',
          'min-content',
          ...ince.map(() => 'min-content'),
          'auto',
          '1fr',
        ],
        // Array.from({ length: (columns ?? 1) - 1 })
        // 	.map(() => 'auto')
        // 	.concat(['1fr']),
        ' '
      ),
      join(
        Array.from({ length: rows.length - 1 })
          .map(() => 'auto')
          .concat(['1fr']),
        ' '
      ),
    ];
  }

  let gird_template_area: string | undefined;
  let gird_template_column: string | undefined;
  let gird_template_row: string | undefined;
  $: {
    [gird_template_area, gird_template_column, gird_template_row] = WriteLiens([
      () => {
        return Array.from({ length: r.length + ince.length + 5 }).map(() => 'top');
      },
      ...mainPlots.map((mp) => () => {
        return [
          'main-plot-header',
          ...r.map(
            (role) =>
              ` main-role-plot-${cssesc(role.name, {
                isIdentifier: true,
              })}-${cssesc(mp.name, { isIdentifier: true })} `
          ),
          `main-plot-header-${cssesc(mp.name, { isIdentifier: true })}`,
          `main-plot-header-${cssesc(mp.name, { isIdentifier: true })}`,
          ...ince.concat([undefined] as any).map(
            () =>
              `main-role-plot-rule-${cssesc(mp.name, {
                isIdentifier: true,
              })}`
          ),

          'rest-3',
        ];
      }),
      () => {
        return Array.from({ length: r.length + ince.length + 4 })
          .map(() => 'seccond')
          .concat(['rest-3']);
      },
      ...subPlots.map((mp) => () => {
        return [
          'sub-plot-header',
          ...r.map(
            (role) =>
              ` sub-role-plot-${cssesc(role.name, {
                isIdentifier: true,
              })}-${cssesc(mp.name, { isIdentifier: true })} `
          ),
          `sub-plot-header-${cssesc(mp.name, { isIdentifier: true })}`,
          `sub-plot-header-${cssesc(mp.name, { isIdentifier: true })}`,
          ...ince.concat([undefined] as any).map(
            () =>
              `sub-role-plot-rule-${cssesc(mp.name, {
                isIdentifier: true,
              })}`
          ),

          'rest-3',
        ];
      }),
      () => {
        return [
          'role-header',
          ...r.map((role) => `role-header-${cssesc(role.name, { isIdentifier: true })}`),
          '.',
          'incident-header',
          ...ince.map((incident) => `incident-header-${incident.day}`),
          'rest-2',
          'rest-3',
        ];
      },
      () => {
        return [
          'role-header',
          ...r.map((role) => `role-header-${cssesc(role.name, { isIdentifier: true })}`),
          '.',
          'incident-header-day',
          ...ince.map((incident) => `incident-day-${incident.day}`),
          'rest-2',
          'rest-3',
        ];
      },
      ...chars.map((char) => () => [
        `character-header`,
        ...r.map(
          (role) =>
            ` role-char-${cssesc(role.name, { isIdentifier: true })}-${cssesc(char.name, {
              isIdentifier: true,
            })} `
        ),
        ` char-header-${cssesc(char.name, { isIdentifier: true })} `,
        ` char-header-${cssesc(char.name, { isIdentifier: true })} `,
        ...ince.map(
          (incident) =>
            ` incdent-char-${incident.day}-${cssesc(char.name, { isIdentifier: true })} `
        ),
        'rest-2',
        'rest-3',
      ]),
      () => [
        'goodwillrefusal-header',
        ...r.map((role) => `goodwillrefusal-${cssesc(role.name, { isIdentifier: true })}`),
        '.',
        '.',
        ...ince.map((incident) => `incident-rule-${incident.day}`),
        'rest-2',
        'rest-3',
      ],

      () => [
        'rest-1',
        ...r.map((role) => `rest-1`),
        'rest-1',
        'rest-1',
        ...ince.map((role) => `rest-1`),
        'rest-2',
        'rest-3',
      ],
    ]);
  }
</script>

<div
  class="root"
  class:touchTarget
  class:tablet
  id="root"
  style=" scrollbar-gutter: stable both-edges;"
>
  <div
    class="table page"
    style="grid-template-columns: {gird_template_column} ;grid-template-rows: {gird_template_row} ; grid-template-areas: {gird_template_area ??
      ''};"
  >
    <div class="header vertical-header plot-main" style="grid-area: main-plot-header;">
      {getString('Main Plot', lang)}
    </div>
    {#each mainPlots as p}
      <div class="plot-main" style="grid-area: main-plot-header-{cssesc(p.name)};">
        {getString(p.name, lang)}
      </div>
      <div class="plot-main rules" style="grid-area: main-role-plot-rule-{cssesc(p.name)};">
        {#each p.rules as a}
          <Ability {a} compact />
        {/each}
      </div>

      {#each r as ri}
        <div
          class="plot-main role-counter"
          style="grid-area: main-role-plot-{cssesc(ri.name)}-{cssesc(p.name)};"
        >
          <div style="text-align: center;">
            {#if hasProp(p.roles, ri.name)}
              {@const amount = p.roles[ri.name]}
              {#if Array.isArray(amount)}
                {amount[0]} - {amount[1]}
              {:else if typeof amount == 'number'}
                {amount}
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    {/each}

    <div class="header vertical-header plot-sub" style="grid-area: sub-plot-header;">Sub Plot</div>
    {#each subPlots as p}
      <div class="plot-sub" style="grid-area: sub-plot-header-{cssesc(p.name)};">
        {getString(p.name, lang)}
      </div>
      <div class="plot-sub rules" style="grid-area: sub-role-plot-rule-{cssesc(p.name)};">
        {#each p.rules as a}
          <Ability {a} compact />
        {/each}
      </div>

      {#each r as ri}
        {@const roles = p.roles}
        {@const name = ri.name}
        <div
          class="plot-sub role-counter"
          style="grid-area: sub-role-plot-{cssesc(ri.name)}-{cssesc(p.name)};"
        >
          <div style="text-align: center;">
            {#if hasProp(roles, name)}
              {@const amount = roles[name]}
              {#if Array.isArray(amount)}
                {amount[0]} - {amount[1]}
              {:else if typeof amount == 'number'}
                {amount}
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    {/each}

    <!-- <div class="header vertical-header role" style="grid-area: role-ability-header;">Abbiliy</div> -->
    <div class="header vertical-header role" style="grid-area: role-header;">Roles</div>
    {#each r as ri}
      <div class="vertical-header role" style="grid-area: role-header-{cssesc(ri.name)};">
        {ri.name}
        {#if ri.unkillable}
          <!-- <small>(Unkillable)</small> -->
          <small>{getString('(Immortal)', lang)}</small>
        {/if}
      </div>
    {/each}
    <div class="header vertical-header incident" style="grid-area: incident-header-day;">Day</div>
    <div class="header vertical-header incident" style="grid-area: incident-header;">Incidents</div>
    {#each ince as i}
      <div class="vertical-header incident" style="grid-area: incident-header-{i.day};">
        {getString(i.name, lang)}<br />
      </div>
      <div class="vertical-header incident" style="grid-area: incident-day-{i.day};">
        {i.day}
      </div>
    {/each}

    <div class="header vertical-header character" style="grid-area: character-header;">
      {getString('Characters', lang)}
    </div>
    {#each chars as ci}
      <div class="character" style="grid-area: char-header-{cssesc(ci.name)}; ">
        {getString(ci.name, lang)}
        {#if isCharacterLate(ci.name)} <i>(?)</i>{/if}
      </div>

      {#each r as ri}
        <div class="role-char" style="grid-area: role-char-{cssesc(ri.name)}-{cssesc(ci.name)};">
          <Selection />
        </div>
      {/each}
      {#each ince as ri}
        <div class="incident-char" style="grid-area: incdent-char-{ri.day}-{cssesc(ci.name)};">
          <Selection />
        </div>
      {/each}
    {/each}

    <div class="header vertical-header role" style="grid-area: goodwillrefusal-header;">
      <div style="height: min-content; min-height: 100%;">
        {getString('Goodwill Refusel', lang)}
      </div>
    </div>
    {#each r as ri}
      <div class="vertical-header role" style="grid-area: goodwillrefusal-{cssesc(ri.name)};">

        {#each [getString(ri.goodwillRefusel ?? '', lang),
          getString(ri.goodwillOutburst ? 'Goodwill Outburst' : '', lang),
          getString(ri.afterDeath?'After Death':'',lang),
          getString(
            ri.scriptSpecified?.some((x) => x.name == 'world') ? 'World Selection' : '',
            lang
          )
        ].filter(x=>x?.length>0) as tag,i}
          {#if i > 0} | {/if}
          {tag}
        {/each}
      </div>
    {/each}

    <div
      class="overflow"
      id="rest-1"
      style="grid-area: rest-1; margin-top: 1px; margin-left: 1px;"
    />
    <div class="overflow" id="rest-2" style="grid-area: rest-2; margin-top:1px; margin-left:1px;" />
    <div
      class="overflow"
      id="rest-3"
      style="grid-area: rest-3; margin-left: 1px; margin-top: 1px;"
    />

    <!-- <div
			style="background-color: green; grid-row-start: role-char-{cssesc(r[0].name)}-{cssesc(
				chars[0].name
			)} ; grid-row-end: role-char-{cssesc(r[r.length - 1].name)}-{cssesc(
				chars[chars.length - 1].name
			)} ; grid-column-start: role-char-{cssesc(r[0].name)}-{cssesc(
				chars[0].name
			)} ; grid-column-end: role-char-{cssesc(r[r.length - 1].name)}-{cssesc(
				chars[chars.length - 1].name
			)} ; width:100%;height:100%;"
		/> -->
  </div>
</div>

<template id="newPage">
  <div class="page overflow" />
</template>
<template id="incidences">
  {#each ince as i}
    <article class="incident">
      <h1>
        {getString(i.name, lang)}
      </h1>
      <h2>{getString('Day {day}', lang, { name: 'day', value: i.day })}</h2>

      {#each i.effect as e}
        <p>
          {#if require(e).type}
            <b>[{getString(require(e).type, lang)}]</b>
          {/if}
          {#if require(e).prerequisite}
            [<i>{getString(require(e).prerequisite, lang)}</i>]{#if require(e).description}⇒{/if}
          {/if}
          {#if require(e).description}
            {getString(require(e).description, lang)}
          {/if}
        </p>
      {/each}
    </article>
  {/each}
</template>
<template id="role">
  {#each r as ri}
    <article class="role">
      <h1>
        {getString(ri.name, lang)}
      </h1>
      <h2>
        {ri.goodwillRefusel
          ? `${getString('Goodwill refusal', lang)}: ${getString(ri.goodwillRefusel, lang)}`
          : ''}
      </h2>
      {#if ri.unkillable}
        <h2>{getString('Immortal', lang)}</h2>
      {/if}
      {#if ri.afterDeath}
        <h2>{getString('After Death', lang)}</h2>
      {/if}
      {#each ri.abilities as a}
        <Ability {a} compact />
      {/each}
    </article>
  {/each}
</template>
<template id="tragedyRules">
  {#if (specialRules?.filter((x) => x.length > 0).length ?? 0) > 0}
    <article class="tragedyRules">
      <h1>{getString('Special Rule', lang)}</h1>
      {#each specialRules.filter((x) => x.length > 0) as sp}
        <p>
          {getString(sp, lang)}
        </p>
      {/each}
    </article>
  {/if}

  {#each tg.extraRules as ri}
    <article class="tragedyRules">
      <h1>
        {getString(ri.name, lang)}
      </h1>
      <p>
        {getString(ri.description, lang)}
      </p>
    </article>
  {/each}
</template>

<style lang="scss">
  :root {
    --background: white;
    --table-background: white;
    --color: black;

    --role-background-color-light: #612503;
    --character-background-color-light: #f7e6dd;
    --incident-background-color-light: #fff3eb;
    --plot-sub-background-color-light: #ade5ff;
    --plot-main-background-color-light: #18738f;

    --role-background-color: #612503;
    --character-background-color: #b0531e;
    --incident-background-color: #ffa978;
    --plot-sub-background-color: #ade5ff;
    --plot-main-background-color: #18738f;

    --role-color: #ffffff;
    --character-color: #ffffff;
    --incident-color: #000000;
    --plot-sub-color: #000000;
    --plot-main-color: #ffffff;

    --rule-width: 205rem;
  }
  .role-char,
  .incident-char {
    display: grid;
    padding: 0px !important;
  }

  :global(.touchTarget) .role-char,
  :global(.touchTarget) .incident-char {
    margin: 0.5em !important;
  }

  :global(.overflow) {
    display: flex;
    flex-wrap: wrap;
    justify-items: flex-start;
    align-content: flex-start;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    gap: 1px;
    overflow: hidden;
  }

  article {
    width: 5cm; //calc(var(--page-width) / 5 - 2px * 6);
    min-width: 3cm; //calc(var(--page-width) / 5 - 2px * 6);
    // margin: 2px;
    padding: 4px;
    break-inside: avoid-page;

    h1 {
      // font-size: large;
      margin: 0px;
      font-size: 9pt;
    }
    h2 {
      // font-size: small;
      margin: 0px;
      font-size: 9pt;
    }

    :global(p:first-of-type) {
      margin-top: 1px;
    }

    :global(span)::after {
      content: '\A';
      white-space: pre;
    }
  }

  :global(p) {
    margin-top: 8px;
    margin-bottom: 0px;
  }
  :global(p:first-child) {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .table {
    display: grid;

    font-size: 8pt;

    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    & > *:not(.overflow) {
      margin: 1px;
    }
  }

  .table > *:not(.overflow) {
    // background-color: var(--table-background);
    padding: 4px;
  }

  .rules {
    max-width: var(--rule-width);
  }
  .vertical-header.rules {
    max-width: unset;
    max-height: var(--rule-width);
  }

  .role-char {
    background-color: var(--character-background-color-light);
  }
  .incident-char {
    background-color: var(--incident-background-color-light);
  }

  .role {
    background-color: var(--role-background-color);
    color: var(--role-color);
  }
  .plot-sub {
    background-color: var(--plot-sub-background-color);
    color: var(--plot-sub-color);
  }
  .plot-main {
    background-color: var(--plot-main-background-color);
    color: var(--plot-main-color);
  }
  .character {
    background-color: var(--character-background-color);
    color: var(--character-color);
  }
  .incident {
    background-color: var(--incident-background-color);
    color: var(--incident-color);
  }
  .header {
    /* background-color: lightblue; */
    font-weight: bold;
    text-align: center;
  }
  .vertical-header {
    writing-mode: vertical-rl;
    transform: scale(-1, -1);
    /* width: min-content; */
  }

  .tablet {
    --page-width: 100%;
    --page-height: unset;
    .page {
      margin-top: 0px;
      margin-bottom: 0px;
      box-shadow: none;
      height: min-content;
    }
  }
</style>
