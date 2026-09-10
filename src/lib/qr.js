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

function exportSizeOf(snapshot) {
  const n = Number(snapshot?.exportSize);
  return [512, 1024, 2048].includes(n) ? n : 1024;
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
  const hiRes = new QRCodeStyling({ ...buildOptions(snapshot, size), type: 'canvas' });
  return hiRes.download({ name: `${filename}-${size}px`, extension: 'png' });
}

export async function downloadSvg(snapshot, filename = 'qrlibre-code') {
  const opts = { ...buildOptions(snapshot, PREVIEW_SIZE), type: 'svg' };
  const svgQr = new QRCodeStyling(opts);
  return svgQr.download({ name: filename, extension: 'svg' });
}

export async function copyPngToClipboard(snapshot) {
  const size = exportSizeOf(snapshot);
  const hiRes = new QRCodeStyling({ ...buildOptions(snapshot, size), type: 'canvas' });
  const blob = await hiRes.getRawData('png');
  const pngBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'image/png' });
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
}
