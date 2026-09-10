<script>
  import { appState } from '../lib/state.svelte.js';
  import { EC_LEVELS } from '../lib/presets.js';
  import { byteLength, QR_BYTE_LIMIT } from '../lib/utils.js';

  const bytes = $derived(byteLength(appState.text ?? ''));
</script>

<div class="field">
  <div class="field-row">
    <label for="qr-text">Text to encode</label>
    <span class="count" aria-live="polite">{bytes} bytes</span>
  </div>
  <textarea
    id="qr-text"
    rows="5"
    maxlength="4000"
    placeholder="Type or paste any text, URL, Wi-Fi string…"
    bind:value={appState.text}
    aria-describedby="qr-text-hint qr-status"
  ></textarea>
  <p id="qr-text-hint" class="hint">
    Anything you type stays on your device — the QR is generated 100% offline.
    Max ~{QR_BYTE_LIMIT} bytes (less at higher error correction).
  </p>

  <div class="ec-row">
    <label for="ec-level">Error correction</label>
    <select id="ec-level" bind:value={appState.ecLevel} aria-describedby="ec-hint">
      {#each EC_LEVELS as level}
        <option value={level}>{level}</option>
      {/each}
    </select>
    <span id="ec-hint" class="hint">L = most data · H = most resilient. M is a good default.</span>
  </div>
</div>

<style>
  .field { display: grid; gap: 0.5rem; }
  .field-row { display: flex; justify-content: space-between; align-items: baseline; }
  label { font-weight: 600; color: var(--text-h); font-size: 0.95rem; }
  .count { font-size: 0.8rem; color: var(--muted); font-variant-numeric: tabular-nums; }
  textarea {
    width: 100%; box-sizing: border-box; resize: vertical; min-height: 120px;
    font: inherit; color: var(--text-h); background: var(--input-bg);
    border: 1.5px solid var(--border); border-radius: 12px; padding: 0.75rem 0.9rem;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  textarea:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
  .hint { font-size: 0.82rem; color: var(--muted); margin: 0; }
  .ec-row { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.25rem; }
  .ec-row label { font-size: 0.88rem; }
  select {
    font: inherit; font-size: 0.9rem; color: var(--text-h); background: var(--input-bg);
    border: 1.5px solid var(--border); border-radius: 10px; padding: 0.35rem 0.6rem;
  }
  select:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
  .ec-row .hint { flex-basis: 100%; }
</style>
