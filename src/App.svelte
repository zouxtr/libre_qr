<script>
  import { onMount } from 'svelte';
  import { appState } from './lib/state.svelte.js';
  import { mountQr, updateQr } from './lib/qr.js';
  import { lengthStatus, contrastRatio, debounce } from './lib/utils.js';
  import { snapshot } from './lib/exportSnapshot.js';
  import TextInput from './components/TextInput.svelte';
  import QrPreview from './components/QrPreview.svelte';
  import ThemePicker from './components/ThemePicker.svelte';
  import Actions from './components/Actions.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';

  let previewEl = $state(null);
  let mounted = $state(false);

  function validate() {
    const ls = lengthStatus(appState.text ?? '', appState.ecLevel);
    appState.qrError = ls.level === 'error' ? ls.message : '';
    const warnings = [];
    if (ls.level === 'warn') warnings.push(ls.message);
    const fg = appState.useGradient ? appState.gradientTo : appState.fgColor;
    if (contrastRatio(fg, appState.bgColor) < 2.2) {
      warnings.push('Low contrast between code and background — it may not scan. Pick more distinct colors.');
    }
    appState.qrWarning = warnings.join(' ');
  }

  const debouncedUpdate = debounce(async () => {
    validate();
    if (!mounted || appState.qrError || !appState.text?.trim()) return;
    try {
      await updateQr(snapshot());
    } catch (e) {
      console.error(e);
      appState.qrError = 'This text could not be encoded as a QR code. Try shortening it or lowering error correction.';
    }
  }, 220);

  onMount(async () => {
    validate();
    try {
      await mountQr(previewEl, snapshot());
      mounted = true;
    } catch (e) {
      console.error(e);
      appState.qrError = 'Could not render the QR code in this browser.';
    }
  });

  // Re-render live on any relevant change (instant theme switching).
  $effect(() => {
    // track deps explicitly:
    void appState.text; void appState.dotType; void appState.fgColor; void appState.bgColor;
    void appState.useGradient; void appState.gradientFrom; void appState.gradientTo;
    void appState.cornerSquareType; void appState.cornerDotType; void appState.ecLevel;
    if (!mounted) return;
    debouncedUpdate();
  });

  // Clear toast after a few seconds.
  $effect(() => {
    if (!appState.status) return;
    const t = setTimeout(() => (appState.status = ''), 3500);
    return () => clearTimeout(t);
  });
</script>

<a class="skip" href="#qr-text">Skip to text input</a>

<header class="topbar">
  <div class="brand">
    <img src="./favicon.svg" alt="" width="28" height="28" />
    <div>
      <strong>QRLibre</strong>
      <span>free · open source · on device</span>
    </div>
  </div>
  <ThemeToggle />
</header>

<main class="layout">
  <section class="intro">
    <h1>Text → QR code, instantly.</h1>
    <p>Type anything. The code is generated <strong>entirely in your browser</strong> — no server, no uploads, works offline after first load.</p>
  </section>

  <div class="grid">
    <section class="panel controls" aria-label="QR content and style">
      <TextInput />
      <ThemePicker />
    </section>

    <section class="panel side" aria-label="QR preview and export">
      <QrPreview bind:previewEl />
      <div class="export">
        <Actions />
      </div>
    </section>
  </div>

  <div id="qr-status" class="toast" role="status" aria-live="polite" class:show={!!appState.status}>
    {appState.status}
  </div>

  <footer>
    <p>QRLibre is <a href="https://github.com/" rel="noreferrer">open source (MIT)</a> · built with Svelte + qr-code-styling · your text never leaves this page.</p>
  </footer>
</main>

<style>
  .skip {
    position: absolute; left: -999px; top: 0; background: var(--accent);
    color: #fff; padding: 0.5rem 1rem; border-radius: 0 0 12px 0; z-index: 10;
  }
  .skip:focus { left: 0; }
  .topbar {
    max-width: 1080px; margin: 0 auto; padding: 0.9rem 1.25rem;
    display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  }
  .brand { display: flex; align-items: center; gap: 0.65rem; }
  .brand strong { display: block; color: var(--text-h); font-size: 1.1rem; line-height: 1.1; }
  .brand span { font-size: 0.78rem; color: var(--muted); }
  .layout { max-width: 1080px; margin: 0 auto; padding: 0 1.25rem 2.5rem; }
  .intro { text-align: center; margin: 1rem auto 1.5rem; max-width: 640px; }
  .intro h1 { color: var(--text-h); font-size: clamp(1.7rem, 4vw, 2.5rem); margin: 0 0 0.5rem; letter-spacing: -0.02em; }
  .intro p { color: var(--muted); margin: 0; }
  .intro strong { color: var(--text-h); }
  .grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1.25rem; align-items: start; }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  .panel { display: grid; gap: 1rem; align-content: start; }
  .controls :global(.field), .controls :global(.themes) { box-shadow: var(--shadow); }
  .controls :global(.field) {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 1rem;
  }
  .side { position: sticky; top: 1rem; }
  @media (max-width: 900px) { .side { position: static; } }
  .export { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 1rem; box-shadow: var(--shadow); }
  .toast {
    position: fixed; left: 50%; bottom: 1.25rem; transform: translate(-50%, 20px);
    background: var(--text-h); color: var(--bg); padding: 0.65rem 1rem; border-radius: 12px;
    opacity: 0; pointer-events: none; transition: opacity 0.2s, transform 0.2s;
    max-width: min(92vw, 480px); text-align: center; font-size: 0.9rem; z-index: 20;
  }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }
  footer { text-align: center; margin-top: 2rem; color: var(--muted); font-size: 0.82rem; }
  footer a { color: var(--accent); }
</style>
