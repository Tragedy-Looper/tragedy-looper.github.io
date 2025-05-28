<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { getString, language } from '../routes/(site)/+layout.svelte';
  import { addTranslation } from '../storage';
  import { translationExists } from '../translations';
  import markdownit, { type Options } from 'markdown-it';
  import markdomnItKdb from 'markdown-it-kbd';
  import type { Renderer, Token } from 'markdown-it/index.js';
  import { base } from '$app/paths';
  import { showTranslationMissingDialog } from '../routes/+layout.svelte';

  let { translationKey }: { translationKey: string } = $props();

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

  let text = $derived(md.renderInline($getString(translationKey)));
  let doesTranslationExists = $derived(translationExists($language, translationKey));
</script>

{#if doesTranslationExists}{@html text}{:else}
  <span
    onclick={() =>
      showTranslationMissingDialog(translationKey, async () => {
        const tmp = translationKey;
        await tick();
        translationKey = '';
        await tick();
        translationKey = tmp;
      })}
    class="missingTranslation">{@html text}</span
  >
{/if}

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
