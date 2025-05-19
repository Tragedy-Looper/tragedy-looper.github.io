<script lang="ts">
  import { base } from '$app/paths';
</script>

<a href={`${base}/`}>Home</a>

<slot />

<style>
  @media print {
    a {
      display: none;
    }
  }
</style>
