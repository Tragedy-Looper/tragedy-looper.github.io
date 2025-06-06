<script lang="ts">
    import '@picocss/pico/css/pico.css';

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
    {
      title: 'gneral',
      lookup: {
        paranoia: {
          id: 'paranoia',
          name: 'Paranoia',
        },
        paranoia2: {
          id: 'paranoia',
          name: 'Unease',
        },
        intrigue: {
          id: 'intrigue',
          name: 'Intrigue',
        },
        hope: {
          id: 'hope',
          name: 'Hope',
        },
        despair: {
          id: 'despair',
          name: 'Despair',
        },
        goodwill: {
          id: 'goodwill',
          name: 'Goodwill',
        },
      },
    },
  ] as const;

  const allNames = Object.fromEntries(
    data.flatMap(({ lookup }) => Object.values(lookup).map((item) => [item.name, item.id] as const))
  ) as Record<string, string>;

  let text = $state('');
  let replaced = $derived.by(() => {
    // check if text is JSON
    try {
      const parsed = JSON.parse(transformJsoncToJSON(text));
      if (typeof parsed === 'object' && parsed !== null) {
        return JSON.stringify(replaceTextInObject(parsed), null, 2);
      }
      console.warn('Input is not a valid JSON object');
    } catch (error) {
      // if JSON parsing fails, assume it's a plain text
      console.warn(`Input is not a valid JSON object: ${error}`);
    }
    return replaceText(text);
  });

  export function transformJsoncToJSON(text: string): string {
    // run over the text for the first occurence of a //, but skip any that are inside a string
    let inString = false;
    let inComment = false;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      // Handle string start/end (ignore escaped quotes)
      if (!inComment && char === '"' && (i === 0 || text[i - 1] !== '\\')) {
        inString = !inString;
        result += char;
      }
      // Handle single-line comment //
      else if (!inString && char === '/' && nextChar === '/') {
        inComment = true;
        i++; // skip next character
      }
      // Handle multi-line comment /*
      else if (!inString && char === '/' && nextChar === '*') {
        inComment = true;
        let endIdx = text.indexOf('*/', i + 2);
        if (endIdx === -1) {
          // Unterminated comment, skip rest
          break;
        }
        i = endIdx + 1; // skip to end of comment
      }
      // End single-line comment at newline
      else if (inComment && char === '\n') {
        inComment = false;
        result += char;
      }
      // Not in comment, add char
      else if (!inComment) {
        result += char;
      }
      // If in comment, skip char (except for newline above)
    }

    // remove trailing commas
    result = result.replaceAll(/,\s*([\]}])/g, '$1');
    return result;
  }

  function replaceTextInObject<T extends unknown>(obj: T): T {
    if (typeof obj === 'string') {
      return replaceText(obj) as T; // if obj is a string, replace text
    }
    if (typeof obj !== 'object' || obj === null) {
      return obj; // return as is if not an object or string
    }
    // if obj is an array, map over it
    if (Array.isArray(obj)) {
      return obj.map((item) => replaceTextInObject(item)) as unknown as T;
    }

    // if obj is an object, create a new object with replaced text
    const newObj: Record<string, any> = {};
    const keysToSkip = ['id', 'name', 'mainPlot', 'subPlots', 'cast', 'incidents', 'title']; // keys that should not be replaced
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // we do not want to replace text in all fields
        const fieldsToReplace = [
          'victory-conditions',
          'description',
          'story',
          'mastermindHints',
          'prerequisite',
        ];
        if (!fieldsToReplace.includes(key)) {
          newObj[key] = value; // keep original name
          continue; // skip further processing for this key
        }
      } else if (keysToSkip.includes(key)) {
        newObj[key] = value; // keep original id/name
        continue; // skip further processing for this key
      }
      newObj[key] = replaceTextInObject(value);
    }
    return newObj as T;
  }

  function replaceText(text: string) {
    let result = text;
    for (const [name, id] of Object.entries(allNames).toSorted(
      (a, b) => b[0].length - a[0].length
    )) {
      // replace all occurrences if not enclosed in colons
      const regex = new RegExp(`(?<!:)${escapeRegExp(name)}(?!:)`, 'g');
      result = result.replaceAll(regex, `:${id}:`);
    }
    return result;
  }
</script>

<article>
  <textarea bind:value={text}> </textarea>
  <textarea bind:value={replaced} readonly> </textarea>
</article>

{#each data as { title, lookup }}
  <article>
    <h2>{title}</h2>
    <dl>
      {#each Object.values(lookup) as { id, name }}
        <div>
          <dt>:{id}:</dt>
          <dd>{name}</dd>
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
