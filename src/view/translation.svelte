<script lang="ts" generics="TKey extends string | undefined">
  import { onDestroy, onMount, tick } from 'svelte';
  import { getString, language } from '../routes/(site)/+layout.svelte';
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

  type Parameters = {
    translationKey:
      | (TKey & ObjectFromTaged<TKey>)
      | [TKey, ...ObjectFromTagedArray<TKey>]
      | undefined;
    block?: boolean;
  };

  let { translationKey, block = false }: Parameters = $props();

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

  const icons = ['paranoia', 'goodwill', 'intrigue', 'hope', 'dispair'] as const;

  const set: keyof typeof images = 'wizKids';

  let images = {
    zMan: {
      paranoia: `${base}/icons/zMan/paranoia.png`,
      goodwill: `${base}/icons/zMan/goodwill.png`,
      intrigue: `${base}/icons/zMan/intrigue.png`,
      hope: `${base}/icons/zMan/hope.png`,
      dispair: `${base}/icons/zMan/dispair.png`,
    },
    wizKids: {
      paranoia: `${base}/icons/wizKids/unease.svg`,
      goodwill: `${base}/icons/wizKids/goodwill.svg`,
      intrigue: `${base}/icons/wizKids/intrigue.svg`,
      hope: `${base}/icons/zMan/hope.png`,
      dispair: `${base}/icons/zMan/dispair.png`,
    },
  } satisfies Record<string, Record<(typeof icons)[number], string>>;

  const md = markdownit({
    html: false,
    linkify: false,
    typographer: true,
  })
    .use(markdomnItKdb)
    .use(emoji, {
      defs: Object.fromEntries(icons.map((icon) => [icon, icon] as const)),
      enabled: icons,
    });
  md.renderer.rules.emoji = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: unknown,
    self: Renderer
  ) => {
    const token = tokens[idx];
    const emojiName = token.content as (typeof icons)[number];
    // If the emoji is not paranoia, return the default rendering
    if (!icons.includes(emojiName)) {
      return self.renderToken(tokens, idx, options);
    }
    // Otherwise, return a custom rendering for paranoia
    return `<span class="emoji" title="${$getString(emojiName)}"><img src="${images[set][emojiName]}" ></img></span>`;
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

  let text = $derived(
    block ? md.render($getString(key, parametrs)) : md.renderInline($getString(key, parametrs))
  );
  let doesTranslationExists = $derived(translationExists($language, key));

  let isLocal = $derived(hasLocalTranslation($language, key));

  let highiligt = $derived(
    enableTranslationUi.highilghtMissing &&
      (!doesTranslationExists || (enableTranslationUi.editLocals && isLocal))
  );
</script>

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

<style>
  .missingTranslation {
    /* Style for missing translations with squiggly red underline */
    text-decoration: underline wavy var(--pico-mark-background-color);

    &.interactive {
      cursor: pointer;
    }
  }
</style>
