<script lang="ts">
  import { base } from '$app/paths';
  import '@picocss/pico/css/pico.css';

  let geraStates = $state(  [
  {
    "toothCount": 15,
    "depth": 0.1,
    "toothAngle": 6.3,
    "rootAngle": 7.5,
    "holeRadius": 0.8,
    "gearPositionX": 681,
    "gearPositionY": 184,
    "gearRotation": 0,
    "gearScale": 1.35
  },
  {
    "toothCount": 18,
    "depth": 0.1,
    "toothAngle": 6.3,
    "rootAngle": 7.5,
    "holeRadius": 0.8,
    "gearPositionX": 334,
    "gearPositionY": 437,
    "gearRotation": 19,
    "gearScale": 1.72
  },
  {
    "toothCount": 15,
    "depth": 0.1,
    "toothAngle": 6.3,
    "rootAngle": 7.5,
    "holeRadius": 0.8,
    "gearPositionX": 1011,
    "gearPositionY": 374,
    "gearRotation": 0,
    "gearScale": 1.39
  }
]);

  



  function path(
    toothCount: number,
    depth: number,
    toothAngle: number,
    rootAngle: number,
    holeRadius: number
  ) {
    const pitchAngle = 360 / toothCount;
    const rampAngle = (pitchAngle - toothAngle - rootAngle) / 2;
    const r = 1 - depth;
    let text = 'M0,-1';
    let angle = 0;
    for (let i = 0; i < toothCount; i++) {
      angle += toothAngle / 2;
      text += 'A1,1,0,0,1,' + sin(angle) + ',' + -cos(angle);
      angle += rampAngle;
      text += 'L' + trunc(r * sin(angle)) + ',' + trunc(-r * cos(angle));
      angle += rootAngle;
      text +=
        'A' +
        trunc(r) +
        ',' +
        trunc(r) +
        ',0,0,1,' +
        trunc(r * sin(angle)) +
        ',' +
        trunc(-r * cos(angle));
      angle += rampAngle;
      text += 'L' + sin(angle) + ',' + -cos(angle);
      angle += toothAngle / 2;
      text += 'A1,1,0,0,1,' + sin(angle) + ',' + -cos(angle);
    }

    text +=
      'L0,' +
      -holeRadius +
      'A' +
      holeRadius +
      ',' +
      holeRadius +
      ',0,1,0,0,' +
      holeRadius +
      'A' +
      holeRadius +
      ',' +
      holeRadius +
      ',0,1,0,0,' +
      -holeRadius +
      'Z';
    return text;
  }

  function sin(x: number) {
    return trunc(Math.sin((2 * Math.PI * x) / 360));
  }

  function cos(x: number) {
    return trunc(Math.cos((2 * Math.PI * x) / 360));
  }

  function trunc(x: number) {
    return x;
    return parseFloat(x.toFixed(3).substring(0, 5));
  }
</script>

{#each geraStates as gear, i}
  <details>
    <summary>Gear Settings {i + 1}</summary>

    <div role="group">
      <label>
        Tooth Count
        <input type="number" bind:value={gear.toothCount} min="3" max="100" />
      </label>

      <label>
        Depth
        <input type="number" bind:value={gear.depth} min="0.01" max="1" step="0.01" />
      </label>

      <label>
        Tooth Angle
        <input type="number" bind:value={gear.toothAngle} min="0.1" max="90" step="0.1" />
      </label>

      <label>
        Root Angle
        <input type="number" bind:value={gear.rootAngle} min="0.1" max="90" step="0.1" />
      </label>

      <label>
        Hole Radius
        <input type="number" bind:value={gear.holeRadius} min="0.01" max="1" step="0.01" />
      </label>

      <label>
        Gear Position X
        <input type="number" bind:value={gear.gearPositionX} />
      </label>
      <label>
        Gear Position Y
        <input type="number" bind:value={gear.gearPositionY} />
      </label>
      <label>
        Gear Rotation
        <input type="number" bind:value={gear.gearRotation} min="0" max="360" step="1" />
      </label>
      <label>
        Gear Scale
        <input type="number" bind:value={gear.gearScale} min="0.1" max="5" step="0.01" />
      </label>
    </div>
  </details>
{/each}

<details>
  <summary>Export</summary>
  <textarea
    readonly
    rows="10"
    cols="50"
    style="width: 100%;"
    >
    {JSON.stringify(geraStates, null, 2)}
  </textarea>
</details>

<div class="root">
  <img src="{base}/cards/general/gearSample.png" />

  {#each geraStates as gear}
    <svg
      viewBox="-1.1, -1.1, 2.2, 2.2"
      style="--x:{gear.gearPositionX}; --y: {gear.gearPositionY}; --rotation: {gear.gearRotation}deg; --scale: {gear.gearScale}"
    >
      <path d={path(gear.toothCount, gear.depth, gear.toothAngle, gear.rootAngle, gear.holeRadius)}>
      </path>
    </svg>
  {/each}
</div>

<style>
  .root {
    position: relative;
    overflow: hidden;
  }

  svg {
    position: absolute;
    top: calc(var(--y) * 1px);
    left: calc(var(--x) * 1px);
    height: 30vh;
    transform: rotate(var(--rotation)) scale(var(--scale));
    width: 30vh;
  }
  img {
    width: 1408px;
    min-width: 1408px;
    max-width: 1408px;
    height: auto;
  }

  path {
    fill: #ccc;
    opacity: 0.8;
    stroke-width: 0.02;
  }
</style>
