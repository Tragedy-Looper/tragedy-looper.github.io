<script lang="ts" module>
  const icons = ['paranoia', 'goodwill', 'intrigue', 'hope', 'dispair'] as const;

  export const imageSets = {
    zMan: {
      paranoia: { type: 'icon', imagePath: `${base}/icons/zMan/paranoia.png` },
      goodwill: { type: 'icon', imagePath: `${base}/icons/zMan/goodwill.png` },
      intrigue: { type: 'icon', imagePath: `${base}/icons/zMan/intrigue.png` },
      hope: { type: 'icon', imagePath: `${base}/icons/zMan/hope.png` },
      dispair: { type: 'icon', imagePath: `${base}/icons/zMan/dispair.png` },
    },
    wizKids: {
      paranoia: { type: 'icon', imagePath: `${base}/icons/wizKids/unease.svg` },
      goodwill: { type: 'icon', imagePath: `${base}/icons/wizKids/goodwill.svg` },
      intrigue: { type: 'icon', imagePath: `${base}/icons/wizKids/intrigue.svg` },
      hope: { type: 'icon', imagePath: `${base}/icons/zMan/hope.png` },
      dispair: { type: 'icon', imagePath: `${base}/icons/zMan/dispair.png` },
    },
    zManText: {
      paranoia: { type: 'text', text: `Paranoia` },
      goodwill: { type: 'text', text: `Goodwill` },
      intrigue: { type: 'text', text: `Intrigue` },
      hope: { type: 'text', text: `Hope` },
      dispair: { type: 'text', text: `Dispair` },
    },
    wizKidsText: {
      paranoia: { type: 'text', text: `Unease` },
      goodwill: { type: 'text', text: `Goodwill` },
      intrigue: { type: 'text', text: `Intrigue` },
      hope: { type: 'text', text: `Hope` },
      dispair: { type: 'text', text: `Dispair` },
    },
  } satisfies Record<
    string,
    Record<
      (typeof icons)[number],
      { type: 'icon'; imagePath: string } | { type: 'text'; text: string }
    >
  >;
</script>

<script lang="ts" generics="TKey extends string | undefined">
  import { onDestroy, onMount, tick } from 'svelte';
  import { getAlternative, getString, language } from '../routes/(site)/+layout.svelte';
  import { addTranslation } from '../storage';
  import {
    hasLocalTranslation,
    translationExists,
    type ObjectFromTaged,
    type ObjectFromTagedArray,
    type ObjectFromTagedVoid,
  } from '../translations';
  import markdownit, { type Options } from 'markdown-it';
  import markdomnItKdb from 'markdown-it-kbd';
  import { full as emoji } from 'markdown-it-emoji';
  import type { Renderer, Token } from 'markdown-it/index.js';
  import { base } from '$app/paths';
  import { enableTranslationUi, showTranslationMissingDialog } from '../routes/+layout.svelte';
  import {
    charactersLookup,
    incidentsLookup,
    isCharacterId,
    isKeywordId,
    isPlotId,
    isTagId,
    keywordsLookup,
    plotsLookup,
    rolesLookup,
    tagsLookup,
    tragedysLookup,
  } from '../data';
  import { isIncidentName } from '../model/incidents';
  import { isRoleName, singleRolenames } from '../model/roles';
  import { isTragedySetName } from '../model/tragedySets';
  import { browser } from '$app/environment';

  type Parameters = {
    translationKey:
      | (TKey & ObjectFromTaged<TKey>)
      | [TKey, ...ObjectFromTagedArray<TKey>]
      | undefined;
    block?: boolean;
    link?: boolean;
  };

  let { translationKey, block = false, link = false }: Parameters = $props();

  let key = $derived(
    Array.isArray(translationKey)
      ? (translationKey as [TKey, ...ObjectFromTagedArray<TKey>])[0]
      : typeof translationKey === 'string'
        ? translationKey
        : null
  );

  let parametrs = $derived(
    Array.isArray(translationKey)
      ? ((
          translationKey as [TKey, ...ObjectFromTagedArray<TKey>]
        )[1] as unknown as ObjectFromTagedVoid<TKey>)
      : undefined
  );

  let set = $derived(
    enableTranslationUi.iconSet in imageSets ? enableTranslationUi.iconSet : 'zMan'
  );

  const defs = Object.fromEntries([
    ...icons.map((icon) => [icon, icon] as const),
    ...Object.keys(charactersLookup).map((char) => [char, char] as const),
    ...Object.keys(incidentsLookup).map((char) => [char, char] as const),
    ...Object.keys(rolesLookup).map((char) => [char, char] as const),
    ...Object.keys(plotsLookup).map((char) => [char, char] as const),
    ...Object.keys(tragedysLookup).map((char) => [char, char] as const),
    ...Object.keys(keywordsLookup).map((char) => [char, char] as const),
    ...Object.keys(tagsLookup).map((char) => [char, char] as const),
  ]);

  const md = $derived.by(() => {
    const md = markdownit({
      html: false,
      linkify: false,
      typographer: true,
    })
      .use(markdomnItKdb)
      .use(emoji, {
        defs,
        enabled: Object.keys(defs),
      });
    md.renderer.rules.emoji = (
      tokens: Token[],
      idx: number,
      options: Options,
      env: unknown,
      self: Renderer
    ) => {
      const token = tokens[idx];
      const emojiName = token.content;
      // If the emoji is not paranoia, return the default rendering
      if (emojiName in imageSets[set]) {
        const placholder = imageSets[set][emojiName as keyof (typeof imageSets)[typeof set]];
        if (placholder.type === 'text') {
          return placholder.text;
        } else if (placholder.type === 'icon') {
          return `<span class="emoji" title="${$getString(emojiName)}"><img src="${placholder.imagePath}" ></img></span>`;
        } else {
          return self.renderToken(tokens, idx, options);
        }
      }

      let alternativeName: string | undefined = undefined;

      if ($getAlternative(emojiName)) {
        alternativeName = $getAlternative(emojiName);
      }
      if (isCharacterId(emojiName)) {
        const character = charactersLookup[emojiName];
        const name = alternativeName ?? $getString(character.name);
        if (link) {
          return `<a href="${base}/wiki/character/${character.id}"><span class="emoji" title="${name}">${name}</span></a>`;
        }
        return name;
      } else if (isIncidentName(emojiName)) {
        const incident = incidentsLookup[emojiName];
        const name = alternativeName ?? $getString(incident.name);
        if (link) {
          return `<a href="${base}/wiki/incident/${incident.id}"><span class="emoji" title="${name}">${name}</span></a>`;
        }
        return name;
      } else if (isRoleName(emojiName)) {
        const roleNames = singleRolenames(emojiName);

        return roleNames
          .map((roleName) => {
            const role = rolesLookup[roleName];
            const name = alternativeName ?? $getString(role.name);
            if (link) {
              return `<a href="${base}/wiki/role/${role.id}"><span class="emoji" title="${name}">${name}</span></a>`;
            }
            return name;
          })
          .join(', ');
      } else if (isPlotId(emojiName)) {
        const plot = plotsLookup[emojiName];
        const name = alternativeName ?? $getString(plot.name);
        if (link) {
          return `<a href="${base}/wiki/plot/${plot.id}"><span class="emoji" title="${name}">${name}</span></a>`;
        }
        return name;
      } else if (isTragedySetName(emojiName)) {
        const tragedy = tragedysLookup[emojiName];
        const name = alternativeName ?? $getString(tragedy.name);
        if (link) {
          return `<a href="${base}/wiki/tragedy/${tragedy.id}"><span class="emoji" title="${name}">${name}</span></a>`;
        }
        return name;
      } else if (isKeywordId(emojiName)) {
        const keyword = keywordsLookup[emojiName];
        const name = alternativeName ?? $getString(keyword.name);
        if (link) {
          return `<a href="${base}/wiki/keyword/${keyword.id}"><span class="emoji" title="${name}">${name}</span></a>`;
        }
        return name;
      } else if (isTagId(emojiName)) {
        const tag = tagsLookup[emojiName];
        const name = alternativeName ?? $getString(tag.name);
        if (link) {
          return `<a href="${base}/wiki/tag/${tag.id}"><span class="emoji" title="${name}">${name}</span></a>`;
        }
        return name;
      }
      return `EMOCO: ${emojiName}`;
      return self.renderToken(tokens, idx, options);
    };

    // add base to links

    const proxy = (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) =>
      self.renderToken(tokens, idx, options);
    const defaultBulletListOpenRenderer = md.renderer.rules.link_open || proxy;

    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const href = tokens[idx].attrGet('href');

      if (href && href.startsWith('/')) {
        tokens[idx].attrSet('href', `${base}${href}`);
      }
      return defaultBulletListOpenRenderer(tokens, idx, options, env, self);
    };

    return md;
  });

  export const getKeyToName = (key: string) => {
    return (
      Object.values({
        ...charactersLookup,
        ...keywordsLookup,
        ...plotsLookup,
        ...tagsLookup,
        ...incidentsLookup,
        ...rolesLookup,
        ...tragedysLookup,
      })
        .filter((x) => x.name == key)
        .map((x) => x.id)[0] ?? key
    );
  };

  function replacedNames(params: string): string {
    const original = getKeyToName(params);
    const altered = $getAlternative(original);
    if (altered) {
      return altered;
    }
    return params;
  }

  let text = $derived(
    block
      ? md.render(replacedNames($getString(key, parametrs)))
      : md.renderInline(replacedNames($getString(key, parametrs)))
  );
  let doesTranslationExists = $derived(translationExists($language, key));

  let isLocal = $derived(hasLocalTranslation($language, key));

  let highiligt = $derived(
    enableTranslationUi.highilghtMissing &&
      (!doesTranslationExists || (enableTranslationUi.editLocals && isLocal))
  );
</script>

{#if browser}
  {#if !highiligt}{@html text}{:else}
    <span
      class:interactive={enableTranslationUi.inlineEdit}
      onclick={() => {
        if (!enableTranslationUi.inlineEdit) {
          return;
        }
        showTranslationMissingDialog(translationKey, async () => {
          const tmp = translationKey;
          await tick();
          translationKey = undefined;
          await tick();
          translationKey = tmp;
        });
      }}
      class="missingTranslation">{@html text}</span
    >{/if}
{:else}
  {@html text}
{/if}

<style>
  .missingTranslation {
    /* Style for missing translations with squiggly red underline */
    text-decoration: underline wavy var(--pico-mark-background-color);

    &.interactive {
      cursor: pointer;
    }
  }
</style>
