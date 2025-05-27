<script lang="ts">
  import { getString } from '../../+layout.svelte';
  import { keys } from '../../../../misc';
  import type { ICustomScriptPlotMutalExclusiveSelection } from '../../../../model/customScript';
  import type { PlotName } from '../../../../model/plots';
  import Option from './option.svelte';

  export let plotSelection: ICustomScriptPlotMutalExclusiveSelection<PlotName>;

  $: selectedPlot = plotSelection.selectedPlot;
  $: availablePlots = plotSelection.availablePlots;

  $: options = plotSelection.options;
</script>

<hr />

<select bind:value={$selectedPlot}>
  <option value="" disabled selected>{$getString('Select a plot')}</option>
  {#each $availablePlots as p}
    <option value={p}>{p}</option>
  {/each}
</select>
{#each $options as option}
  <Option {option} />
{/each}
<hr />
