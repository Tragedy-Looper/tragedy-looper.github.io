<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { getString, language } from '../routes/(site)/+layout.svelte';
  import { addTranslation } from '../storage';
  import { translationExists } from '../translations';
  import markdownit, { type Options } from 'markdown-it';
  import markdomnItKdb from 'markdown-it-kbd';
  import type { Renderer, Token } from 'markdown-it/index.js';
  import { base } from '$app/paths';

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
  let showMissingDialog = $state(false);
  let userTranslation = $state('');

  let template: HTMLTemplateElement | undefined = $state(undefined);

  function submitTranslation() {
    addTranslation(translationKey, userTranslation, $language);
    showMissingDialog = false;
    const tmp = translationKey;
    translationKey = '';
    tick().then(() => {
      translationKey = tmp; // reset to trigger reactivity
    });
  }

  let htmlDialog: HTMLDialogElement | undefined;

  onMount(() => {
    if (
      translationKey &&
      translationKey.length > 0 &&
      !doesTranslationExists &&
      !htmlDialog &&
      template
    ) {
      console.log('Creating dialog for missing translation');
      const dialog = template.content.querySelector('dialog') as HTMLDialogElement;
      htmlDialog = dialog;
      document.body.appendChild(dialog);
    }
  });
  onDestroy(() => {
    if (htmlDialog) {
      htmlDialog.remove();
      htmlDialog = undefined;
    }
  });
</script>

{#if doesTranslationExists}{@html text}{:else}
  <span onclick={() => (showMissingDialog = true)} class="missingTranslation">{@html text}</span>
  <template bind:this={template}>
    <dialog open={showMissingDialog}>
      <article>
        <header>
          <button aria-label="Close" rel="prev" onclick={() => (showMissingDialog = false)}
          ></button>
          <p>
            <strong>{$getString('Missing Translation')}</strong>
          </p>
        </header>
        <p>{$getString('The translation for this text is missing.')}</p>
        <p>{$getString('The missing translation:')}</p>
        <p class="quote">{translationKey}</p>
        <textarea bind:value={userTranslation}></textarea>
        <p>
          {$getString('If you translate the text it will be used in this Browser.')}
        </p>
        <p>
          {$getString('Please consider contributing to the translations and submit it to')}

          <a href="https://github.com/LokiMidgard/tragedy-looper-deduction-tool/issues">GitHub</a>.
          {$getString('That way everyone can benefit from your translation.')}
        </p>
        <footer>
          <button class="outline" style="float: left;" onclick={() => (showMissingDialog = false)}
            >{$getString('Close')}</button
          >
          <button disabled={!userTranslation} onclick={() => submitTranslation()}
            >{$getString('Submit')}</button
          >
        </footer>
      </article>
    </dialog>
  </template>
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
