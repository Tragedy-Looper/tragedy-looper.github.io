<script lang="ts">
  import {
    charactersLookup,
    incidentsLookup,
    keywordsLookup,
    plotsLookup,
    rolesLookup,
    tagsLookup,
    tragedysLookup,
  } from '../../../data';
    import { escapeRegExp } from '../../../misc';

  const data = [
    {
      title: 'Characters',
      lookup: charactersLookup,
    },
    {
      title: 'Roles',
      lookup: rolesLookup,
    },
    {
      title: 'Incidents',
      lookup: incidentsLookup,
    },
    {
      title: 'Keywords',
      lookup: keywordsLookup,
    },
    {
      title: 'Plots',
      lookup: plotsLookup,
    },
    {
      title: 'tags',
      lookup: tagsLookup,
    },
    {
      title: 'Tragedys',
      lookup: tragedysLookup,
    },
  ] as const;

  const allNames = Object.fromEntries(
    data.flatMap(({ lookup }) => Object.values(lookup).map((item) => [item.id, item.name] as const))
  ) as Record<string, string>;

  let text = $state('');
  let replaced = $derived.by(() => {
    let result = text;
    for (const [id, name] of Object.entries(allNames).toSorted((a, b) => b[1].length - a[1].length)) {
        // replace all occurrences if not enclosed in colons
        const regex = new RegExp(`(?<!:)${escapeRegExp(name)}(?!:)`, 'g');
        result = result.replaceAll(regex, `:${id}:`);
    }
    return result;
  });
</script>

<article>
  <textarea bind:value={text}> </textarea>
  <textarea bind:value={replaced} readonly> </textarea>
</article>

{#each data as { title, lookup }}
  <article>
    <h2>{title}</h2>
    <dl>
      {#each Object.entries(lookup) as [id, name]}
        <div>
          <dt>:{id}:</dt>
          <dd>{name.name}</dd>
        </div>
      {/each}
    </dl>
  </article>
{/each}

<style>
  dl {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;

    & > div {
      max-width: 300px;
      border: 1px solid var(--pico-secondary);
      border-radius: 0.5rem;
      padding: 0.5rem;
    }

    gap: 1.5rem;
  }
</style>
