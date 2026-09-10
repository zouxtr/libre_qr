import QRCodeStyling from 'qr-code-styling';

// Single QRCodeStyling instance shared by preview + PNG export.
// type 'canvas' is used so getRawData('png') and ClipboardItem both work.
// SVG export is produced on demand via a temporary svg-typed instance
// with identical styling options (qr-code-styling renders per-type).
export const QR_SIZE = 512;

let qr = null;

export function buildOptions(s) {
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
    width: QR_SIZE,
    height: QR_SIZE,
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
  text: 'LibreQR',
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

export function getQr() {
  if (!qr) qr = new QRCodeStyling(buildOptions(DEFAULTS));
  return qr;
}

export function mountQr(el, snapshot) {
  const instance = getQr();
  el.innerHTML = '';
  instance.append(el);
  return instance.update(buildOptions(snapshot));
}

export function updateQr(snapshot) {
  return getQr().update(buildOptions(snapshot));
}

export async function downloadPng(snapshot, filename = 'libreqr-code') {
  await updateQr(snapshot);
  return getQr().download({ name: filename, extension: 'png' });
}

export async function downloadSvg(snapshot, filename = 'libreqr-code') {
  const opts = { ...buildOptions(snapshot), type: 'svg' };
  const svgQr = new QRCodeStyling(opts);
  return svgQr.download({ name: filename, extension: 'svg' });
}

export async function copyPngToClipboard() {
  const blob = await getQr().getRawData('png');
  const pngBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'image/png' });
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
}
