# QRLibre — Free Offline Text → QR Code

Single-purpose web app: type text, get a styled QR code. Inspired by KDE's QRca, as a static web app.

- ✅ 100% client-side (`qr-code-styling`, bundled via npm) — works offline after first load, no backend, no API calls
- ✅ Real-time generation, fine-tune style (dots, corners, colors, gradient)
- ✅ Copy image (Clipboard API) + Download PNG + Download SVG
- ✅ Image quality setting (512 / 1024 / 2048px PNG + copy; SVG stays vector-sharp)
- ✅ Length + contrast guards, EC level L/M/Q/H selector
- ✅ Responsive, light/dark (auto + manual), accessible, no login/tracking/ads

## Quick start

Requirements: Node 20+ and npm.

```bash
npm install
npm run dev      # dev server with HMR
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Project structure

```
├── index.html              # title, meta, favicon
├── public/favicon.svg
├── src/
│   ├── main.js             # Svelte mount
│   ├── App.svelte          # layout + QR lifecycle
│   ├── app.css             # design tokens, light/dark
│   ├── lib/
│   │   ├── qr.js           # qr-code-styling singleton + PNG/SVG/clipboard
│   │   ├── state.svelte.js # reactive app state (Svelte 5 runes)
│   │   ├── presets.js      # style option lists (dot/corner/EC types)
│   │   ├── utils.js        # byte limits, contrast, debounce
│   │   └── exportSnapshot.js
│   └── components/         # TextInput, QrPreview, ThemePicker, Actions, ThemeToggle
├── vite.config.js          # base './' for portable static hosting
└── .github/workflows/deploy.yml
```

## Privacy

No analytics, no cookies, no network calls after load. Paste anything — it never leaves your device.

## Deploy

Any static host works (`dist/` after `npm run build`):

- **GitHub Pages:** push to `main` — the included Actions workflow builds and deploys `dist/`.
  In repo Settings → Pages, choose Source: **GitHub Actions**.
- **Netlify / Vercel:** build command `npm run build`, publish dir `dist`.

## Accessibility

Labeled inputs, skip link, keyboard-operable controls/buttons, `aria-live` status for copy/download/errors, focus-visible rings, contrast-checked UI (plus a QR contrast warning so codes stay scannable).

## License

MIT — see [LICENSE](./LICENSE).
