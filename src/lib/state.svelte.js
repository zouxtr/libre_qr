// Shared reactive state (Svelte 5 runes). Single source of truth for the app.
export const appState = $state({
  text: 'https://example.org — hello from LibreQR!',
  dotType: 'rounded',
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  useGradient: false,
  gradientFrom: '#0ea5e9',
  gradientTo: '#6366f1',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  ecLevel: 'M', // L | M | Q | H
  uiTheme: 'auto', // auto | light | dark (resolved theme in `resolvedDark`)
  resolvedDark: false,
  // transient UI
  qrError: '',
  qrWarning: '',
  status: '', // aria-live toast message
  busy: false, // copy/download in flight
});
