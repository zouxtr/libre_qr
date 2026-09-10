<script>
  import { appState } from '../lib/state.svelte.js';
  import { downloadPng, downloadSvg, copyPngToClipboard, updateQr } from '../lib/qr.js';
  import { snapshot } from '../lib/exportSnapshot.js';

  const canAct = $derived(!!appState.text?.trim() && !appState.qrError && !appState.busy);

  async function withBusy(fn, okMsg) {
    if (!canAct && !appState.busy) return;
    appState.busy = true;
    appState.status = '';
    try {
      await updateQr(snapshot());
      await fn();
      appState.status = okMsg;
    } catch (e) {
      console.error(e);
      appState.status = e?.name === 'NotAllowedError'
        ? 'Clipboard blocked by the browser — use Download instead.'
        : `Action failed: ${e?.message ?? e}`;
    } finally {
      appState.busy = false;
    }
  }

  const onCopy = () => withBusy(copyPngToClipboard, 'QR image copied to clipboard ✓');
  const onPng = () => withBusy(() => downloadPng(snapshot()), 'QR downloaded as PNG ✓');
  const onSvg = () => withBusy(() => downloadSvg(snapshot()), 'QR downloaded as SVG ✓');
</script>

<div class="actions">
  <button type="button" class="primary" onclick={onCopy} disabled={!canAct} aria-keyshortcuts="c">
    📋 {appState.busy ? 'Working…' : 'Copy image'}
  </button>
  <button type="button" onclick={onPng} disabled={!canAct}>⬇ PNG</button>
  <button type="button" onclick={onSvg} disabled={!canAct}>⬇ SVG</button>
</div>
<p class="note">Copy needs HTTPS/localhost + clipboard permission. Download always works offline.</p>

<style>
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
