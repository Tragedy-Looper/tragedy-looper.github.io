<script lang="ts" generics="TKey extends string | undefined">
  import { onDestroy, onMount, tick } from 'svelte';
  import { getString, language } from '../routes/(site)/+layout.svelte';
  import { addTranslation } from '../storage';
  import {
    translationExists,
    type ObjectFromTaged,
    type ObjectFromTagedArray,
    type ObjectFromTagedVoid,
  } from '../translations';
  import markdownit, { type Options } from 'markdown-it';
  import markdomnItKdb from 'markdown-it-kbd';
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

  const md = markdownit({
    html: false,
    linkify: false,
    typographer: true,
  }).use(markdomnItKdb);

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
</script>

{#if doesTranslationExists|| !enableTranslationUi.enabled}{@html text}{:else}
  <span
    onclick={() =>
      showTranslationMissingDialog(translationKey, async () => {
        const tmp = translationKey;
        await tick();
        translationKey = undefined;
        await tick();
        translationKey = tmp;
      })}
    class="missingTranslation">{@html text}</span
  >{/if}

<style>
  .missingTranslation {
    /* Style for missing translations with squiggly red underline */
    text-decoration: underline wavy var(--pico-mark-background-color);
    cursor: pointer;
  }
  .quote {
    font-style: italic;
    color: var(--pico-secondary);
    margin: 0.5rem 0;
  }
</style>
