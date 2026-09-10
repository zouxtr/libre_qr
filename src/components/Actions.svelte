<script>
  import { appState } from '../lib/state.svelte.js';
  import { EXPORT_SIZES } from '../lib/presets.js';
  import { downloadPng, downloadSvg, copyPngToClipboard, updateQr } from '../lib/qr.js';
  import { snapshot } from '../lib/exportSnapshot.js';

  const canAct = $derived(!!appState.text?.trim() && !appState.qrError && !appState.busy);

  const sizeLabel = $derived(
    appState.exportSize === 2048 ? 'Ultra (2048px)' : appState.exportSize === 512 ? 'Standard (512px)' : 'High (1024px)',
  );

  function savedMessage(outcome, kind) {
    if (outcome?.method === 'share') return 'Share sheet opened — choose Save Image / Files ✓';
    if (outcome?.method === 'tab') return 'Image opened in a new tab — long-press / Share to save it ✓';
    return `${kind} ✓`;
  }

  async function withBusy(fn, okFor) {
    if (!canAct && !appState.busy) return;
    appState.busy = true;
    appState.status = '';
    try {
      await updateQr(snapshot());
      // fn runs synchronously in the tap chain (no await between tap and
      // window.open/navigator.share) so mobile popup blockers allow it.
      const outcome = await fn();
      appState.status = typeof okFor === 'function' ? okFor(outcome) : okFor;
    } catch (e) {
      console.error(e);
      appState.status = e?.name === 'NotAllowedError'
        ? 'Clipboard blocked by the browser — use Download instead.'
        : `Action failed: ${e?.message ?? e}`;
    } finally {
      appState.busy = false;
    }
  }

  const onCopy = () => withBusy(() => copyPngToClipboard(snapshot()), `QR image copied (${sizeLabel}) ✓`);
  const onPng = () => withBusy(() => downloadPng(snapshot()), (o) => savedMessage(o, `QR downloaded as PNG (${sizeLabel})`));
  const onSvg = () => withBusy(() => downloadSvg(snapshot()), (o) => savedMessage(o, 'QR downloaded as SVG'));
</script>

<div class="quality">
  <label for="export-size">Image quality</label>
  <select id="export-size" bind:value={appState.exportSize} aria-describedby="export-size-hint">
    {#each EXPORT_SIZES as size}
      <option value={size}>{size === 2048 ? 'Ultra — 2048px' : size === 512 ? 'Standard — 512px' : 'High — 1024px'}</option>
    {/each}
  </select>
  <span id="export-size-hint" class="hint">PNG + copy resolution. SVG is vector — always sharp.</span>
</div>

<div class="actions">
  <button type="button" class="primary" onclick={onCopy} disabled={!canAct} aria-keyshortcuts="c">
    📋 {appState.busy ? 'Working…' : 'Copy image'}
  </button>
  <button type="button" onclick={onPng} disabled={!canAct}>⬇ PNG</button>
  <button type="button" onclick={onSvg} disabled={!canAct}>⬇ SVG</button>
</div>
<p class="note">Copy needs HTTPS/localhost + clipboard permission. On iPhone/iPad the file may open in a new tab or Share sheet — use Save Image / Save to Files there.</p>

<style>
  .quality { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.7rem; }
  .quality label { font-size: 0.88rem; font-weight: 600; color: var(--text-h); }
  .quality select {
    font: inherit; font-size: 0.9rem; color: var(--text-h); background: var(--input-bg);
    border: 1.5px solid var(--border); border-radius: 10px; padding: 0.35rem 0.6rem;
  }
  .quality select:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
  .quality .hint { flex-basis: 100%; font-size: 0.8rem; color: var(--muted); }
  .actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  button {
    font: inherit; font-weight: 650; font-size: 0.95rem; cursor: pointer;
    border-radius: 12px; padding: 0.65rem 1rem; border: 1.5px solid var(--border);
    background: var(--input-bg); color: var(--text-h);
    transition: transform 0.08s, box-shadow 0.15s, border-color 0.15s, opacity 0.15s;
  }
  button:hover:not(:disabled) { border-color: var(--accent); box-shadow: var(--shadow); }
  button:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
  button:disabled { opacity: 0.45; cursor: not-allowed; }
  button:active:not(:disabled) { transform: translateY(1px); }
  .primary { background: var(--accent); border-color: var(--accent); color: white; }
  .primary:hover:not(:disabled) { filter: brightness(1.05); }
  .note { font-size: 0.8rem; color: var(--muted); margin: 0.4rem 0 0; }
</style>
