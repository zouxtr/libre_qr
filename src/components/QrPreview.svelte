<script>
  import { appState } from '../lib/state.svelte.js';

  let { previewEl = $bindable(null) } = $props();
</script>

<div
  class="preview-card"
  role="img"
  aria-label={appState.text?.trim() ? `QR code encoding: ${appState.text.slice(0, 120)}` : 'QR code preview'}
>
  {#if !appState.text?.trim()}
    <div class="empty">
      <p><strong>Type something</strong> to generate your QR code.</p>
      <p class="hint">It appears here instantly, offline.</p>
    </div>
  {/if}
  <div
    bind:this={previewEl}
    class="qr-mount"
    class:hidden={!appState.text?.trim()}
    aria-hidden="true"
  ></div>
</div>

{#if appState.qrWarning}
  <p class="warn" role="status">⚠ {appState.qrWarning}</p>
{/if}
{#if appState.qrError}
  <p class="err" role="alert">⛔ {appState.qrError}</p>
{/if}

<style>
  .preview-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 20px;
    box-shadow: var(--shadow); padding: 1.25rem; display: grid; place-items: center;
    min-height: 320px; transition: background 0.2s, border-color 0.2s;
  }
  .qr-mount :global(canvas) {
    width: min(100%, 300px) !important; height: auto !important;
    border-radius: 12px; display: block;
  }
  .qr-mount.hidden { display: none; }
  .empty { text-align: center; color: var(--muted); }
  .empty p { margin: 0.25rem 0; }
  .hint { font-size: 0.85rem; }
  .warn, .err {
    font-size: 0.88rem; border-radius: 12px; padding: 0.6rem 0.8rem; margin: 0.6rem 0 0;
  }
  .warn { background: var(--warn-bg); color: var(--warn-fg); border: 1px solid var(--warn-border); }
  .err { background: var(--err-bg); color: var(--err-fg); border: 1px solid var(--err-border); }
</style>
