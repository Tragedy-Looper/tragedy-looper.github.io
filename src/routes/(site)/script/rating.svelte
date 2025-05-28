<script lang="ts">
  import { ratingMap } from '../../../model/script';

  let { rating }: { rating: undefined | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 } = $props();

  const maxRating = ratingMap.length - 1;
</script>

{#if rating}
  {#each Array.from({ length: maxRating + 1 }).map((_, i) => i) as i}
    {#if i % 2 == 1 || i == 0}
      <!-- Continue-->
    {:else if rating == i - 1}
      <!-- half star-->
      🌘
    {:else if rating >= i}
      <!-- Full star-->
      🌕
    {:else}
      <!-- Empty star-->
      🌑
    {/if}
  {/each}
  <small>({ratingMap[rating]})</small>
{/if}
