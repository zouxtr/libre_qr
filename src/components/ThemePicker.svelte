<script>
  import { appState } from '../lib/state.svelte.js';
  import { DOT_TYPES, CORNER_SQUARE_TYPES, CORNER_DOT_TYPES } from '../lib/presets.js';
</script>

<fieldset class="themes">
  <legend>Style</legend>

  <div class="grid">
    <label>Dot style
      <select bind:value={appState.dotType}>
        {#each DOT_TYPES as t}<option value={t}>{t}</option>{/each}
      </select>
    </label>
    <label>Foreground
      <input type="color" bind:value={appState.fgColor} aria-label="QR foreground color" />
    </label>
    <label>Background
      <input type="color" bind:value={appState.bgColor} aria-label="QR background color" />
    </label>
    <label class="check">
      <input type="checkbox" bind:checked={appState.useGradient} />
      Gradient dots
    </label>
    {#if appState.useGradient}
      <label>Gradient from
        <input type="color" bind:value={appState.gradientFrom} aria-label="Gradient start color" />
      </label>
      <label>Gradient to
        <input type="color" bind:value={appState.gradientTo} aria-label="Gradient end color" />
      </label>
    {/if}
    <label>Corner squares
      <select bind:value={appState.cornerSquareType}>
        {#each CORNER_SQUARE_TYPES as t}<option value={t}>{t}</option>{/each}
      </select>
    </label>
    <label>Corner dots
      <select bind:value={appState.cornerDotType}>
        {#each CORNER_DOT_TYPES as t}<option value={t}>{t}</option>{/each}
      </select>
    </label>
  </div>
</fieldset>

<style>
  .themes { border: 1px solid var(--border); border-radius: 16px; padding: 1rem; margin: 0; background: var(--card); }
  legend { font-weight: 700; color: var(--text-h); padding: 0 0.4rem; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; margin-top: 0.25rem; }
  @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
  .grid label { display: grid; gap: 0.3rem; font-size: 0.85rem; color: var(--text-h); font-weight: 600; }
  select, input[type="color"] {
    font: inherit; color: var(--text-h); background: var(--input-bg);
    border: 1.5px solid var(--border); border-radius: 10px; padding: 0.35rem 0.5rem;
    width: 100%; box-sizing: border-box; height: 2.4rem;
  }
  select:focus-visible, input[type="color"]:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
  .check { display: flex !important; flex-direction: row !important; align-items: center; gap: 0.5rem; }
  .check input { width: 1.1rem; height: 1.1rem; accent-color: var(--accent); }
</style>
