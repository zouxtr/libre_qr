<script>
  import { appState } from '../lib/state.svelte.js';

  function applyTheme() {
    const root = document.documentElement;
    const dark = appState.uiTheme === 'dark' || (appState.uiTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    appState.resolvedDark = dark;
    root.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('libreqr-theme', appState.uiTheme); } catch { /* private mode */ }
  }

  function cycle() {
    appState.uiTheme = appState.uiTheme === 'auto' ? 'light' : appState.uiTheme === 'light' ? 'dark' : 'auto';
    applyTheme();
  }

  $effect(() => {
    // init once + follow OS changes when in auto mode
    try {
      const saved = localStorage.getItem('libreqr-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'auto') appState.uiTheme = saved;
    } catch { /* ignore */ }
    applyTheme();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (appState.uiTheme === 'auto') applyTheme(); };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  });

  const label = $derived(appState.uiTheme === 'auto' ? '◐ Auto' : appState.uiTheme === 'dark' ? '🌙 Dark' : '☀️ Light');
</script>

<button type="button" class="toggle" onclick={cycle} aria-label="Toggle color theme (current: {appState.uiTheme})" title="Light / dark / auto">
  {label}
</button>

<style>
  .toggle {
    font: inherit; font-size: 0.88rem; font-weight: 650; cursor: pointer;
    border: 1.5px solid var(--border); background: var(--input-bg); color: var(--text-h);
    border-radius: 999px; padding: 0.45rem 0.9rem;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .toggle:hover { border-color: var(--accent); }
  .toggle:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
</style>
