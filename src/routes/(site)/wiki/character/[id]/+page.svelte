<script lang="ts">
  import type { PageProps } from './$types';
  import { charactersLookup } from '../../../../../data';
  import Translation from '../../../../../view/translation.svelte';
  import { getString } from '../../../+layout.svelte';

  let { data }: PageProps = $props();

  let character = charactersLookup[data.id];
</script>

{#if character}
  <h1><Translation translationKey={character.name} /></h1>
  <ul>
    <li>
      <b><Translation translationKey="Tags" />:</b>
      {#each character.tags as tag,i}
        {#if i > 0}, {/if}
        <Translation translationKey={`:${tag}:`} link/>
      {/each}
    </li>
    <li><b><Translation translationKey="Paranoia Limit" />:</b> {character.paranoiaLimit}</li>

    <li>
      <b><Translation translationKey="Abilities" />:</b>
      <ul>
        {#each character.abilities ?? [] as ability}
          <li>
            {#if ability.type == 'active'}
              <span class="badge"
                ><Translation
                  translationKey={[
                    'Active {goodwillRank} :goodwill:',
                    { goodwillRank: ability.goodwillRank },
                  ]}
                />
              </span>
              {#if ability.immuneToGoodwillRefusel}
                <span class="badge"
                  ><Translation translationKey="Immune to Goodwill Refusal" /></span
                >
              {/if}
              {#if ability.timesPerLoop}
                <span class="badge"
                  ><Translation
                    translationKey={['Times per Loop: {times}', { times: ability.timesPerLoop }]}
                  /></span
                >
              {/if}
              {#if ability.restrictedToLocation}
                <span class="badge"
                  ><Translation
                    translationKey={[
                      'Restricted to Location: {location}',
                      {
                        location: ability.restrictedToLocation.map((l) => $getString(l)).join(', '),
                      },
                    ]}
                  /></span
                >
              {/if}
            {:else if ability.type == 'passive'}
              <span class="badge"><Translation translationKey="Passive" /></span>
            {/if}
            <Translation translationKey={ability.description} link />
          </li>
        {/each}
      </ul>
    </li>
  </ul>
{:else}
  <p><Translation translationKey="Character not found" /></p>
{/if}
