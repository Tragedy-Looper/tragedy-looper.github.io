<script lang="ts" module>
  export function getAvialableCharacterImages() {
    return getContext<LayoutProps['data']['characterImages']>('characterImages');
  }
</script>

<script lang="ts">
  import { base } from '$app/paths';
  import { type LayoutProps } from './$types';
  import { setContext, getContext } from 'svelte';

  const contextKey = 'characterImages';

  let { data, children }: LayoutProps = $props();

  let characterImages = Object.fromEntries(
    Object.entries(data.characterImages).map(([key, images]) => {
      return [key, images.map((image) => `${base}${image}`)] as const;
    })
  ) as typeof data.characterImages;
  setContext(contextKey, characterImages);
</script>

{@render children()}
