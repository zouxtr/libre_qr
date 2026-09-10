import QRCodeStyling from 'qr-code-styling';

// Single QRCodeStyling instance for the on-screen preview (fixed size for
// fast re-renders). PNG copy/download render via temporary off-DOM instances
// at the user-chosen export resolution. SVG export is vector (infinite
// sharpness) and unaffected by the size setting.
export const PREVIEW_SIZE = 512;
export const QR_SIZE = PREVIEW_SIZE; // legacy alias

let qr = null;

export function buildOptions(s, size = PREVIEW_SIZE) {
  const dotsOptions = s.useGradient
    ? {
        type: s.dotType,
        gradient: {
          type: 'linear',
          rotation: Math.PI / 4,
          colorStops: [
            { offset: 0, color: s.gradientFrom },
            { offset: 1, color: s.gradientTo },
          ],
        },
      }
    : { type: s.dotType, color: s.fgColor };

  const accent = s.useGradient ? s.gradientTo : s.fgColor;

  return {
    width: size,
    height: size,
    type: 'canvas',
    data: s.text?.trim() ? s.text : ' ',
    margin: 16,
    qrOptions: { errorCorrectionLevel: s.ecLevel },
    dotsOptions,
    cornersSquareOptions: { type: s.cornerSquareType, color: accent },
    cornersDotOptions: { type: s.cornerDotType, color: accent },
    backgroundOptions: { color: s.bgColor },
  };
}

const DEFAULTS = {
  text: 'QRLibre',
  dotType: 'rounded',
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  useGradient: false,
  gradientFrom: '#0ea5e9',
  gradientTo: '#6366f1',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  ecLevel: 'M',
};

export function exportSizeOf(snapshot) {
  const n = Number(snapshot?.exportSize);
  return [512, 1024, 2048].includes(n) ? n : 1024;
}

export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // iPadOS 13+ reports as Macintosh; touch points give it away.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function revokeLater(url, ms = 30_000) {
  try {
    setTimeout(() => URL.revokeObjectURL(url), ms);
  } catch {
    /* ignore */
  }
}

function triggerAnchorDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // Required for Firefox: the anchor must be in the DOM.
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Save a Blob cross-browser. Desktop + Android Chrome honor the `download`
 * attribute. iOS Safari (and iOS Chrome, which uses WebKit) ignore it, so:
 *  1. Try the Web Share API with files (native Share sheet → Save Image).
 *  2. Otherwise open the object URL in a new tab so the user can long-press
 *     / Share / Save via the browser UI.
 * Must be called synchronously from the user's tap/click handler chain.
 * Resolves to { method: 'download' | 'share' | 'tab' }.
 */
export async function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  try {
    // iOS ignores <a download>; prefer Share sheet when files can be shared.
    if (
      typeof navigator !== 'undefined' &&
      'canShare' in navigator &&
      'share' in navigator
    ) {
      try {
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          return { method: 'share', url: null };
        }
      } catch (err) {
        // User dismissed the sheet → treat as done, not an error.
        if (err?.name === 'AbortError') return { method: 'share', url: null };
        // Otherwise fall through to anchor/tab fallbacks.
      }
    }

    if (isIOS()) {
      // No forced download possible: show the file; user long-presses to save.
      const win = window.open(url, '_blank');
      if (win) return { method: 'tab', url };
      // Popup blocked: navigate current tab (still lets user save via UI).
      window.location.href = url;
      return { method: 'tab', url };
    }

    triggerAnchorDownload(url, filename);
    return { method: 'download', url: null };
  } finally {
    // Revoke only when we no longer need the URL (anchor downloads copy
    // the data synchronously; tabs need it until the user is done).
    if (!isIOS()) revokeLater(url, 10_000);
    else revokeLater(url, 120_000);
  }
}

async function toBlob(raw, mime) {
  if (raw instanceof Blob) return raw;
  return new Blob([raw], { type: mime });
}

export function getQr() {
  if (!qr) qr = new QRCodeStyling(buildOptions(DEFAULTS));
  return qr;
}

export function mountQr(el, snapshot) {
  const instance = getQr();
  el.innerHTML = '';
  instance.append(el);
  return instance.update(buildOptions(snapshot, PREVIEW_SIZE));
}

export function updateQr(snapshot) {
  return getQr().update(buildOptions(snapshot, PREVIEW_SIZE));
}

export async function downloadPng(snapshot, filename = 'qrlibre-code') {
  const size = exportSizeOf(snapshot);
  const name = `${filename}-${size}px.png`;
  const hiRes = new QRCodeStyling({ ...buildOptions(snapshot, size), type: 'canvas' });
  const raw = await hiRes.getRawData('png');
  const blob = await toBlob(raw, 'image/png');
  return saveBlob(blob, name);
}

export async function downloadSvg(snapshot, filename = 'qrlibre-code') {
  const name = `${filename}.svg`;
  const opts = { ...buildOptions(snapshot, PREVIEW_SIZE), type: 'svg' };
  const svgQr = new QRCodeStyling(opts);
  const raw = await svgQr.getRawData('svg');
  const blob = await toBlob(raw, 'image/svg+xml');
  return saveBlob(blob, name);
}

export async function copyPngToClipboard(snapshot) {
  const size = exportSizeOf(snapshot);
  const hiRes = new QRCodeStyling({ ...buildOptions(snapshot, size), type: 'canvas' });
  const blob = await hiRes.getRawData('png');
  const pngBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'image/png' });
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
}
