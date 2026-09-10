// Helpers: byte-length limits, contrast check, debounce.
export const QR_BYTE_LIMIT = 2953; // byte mode, EC-L theoretical max
export const QR_WARN_AT = 2000; // styled QRs get dense; warn early

export function byteLength(str) {
  return new TextEncoder().encode(str).length;
}

export function lengthStatus(text, ecLevel) {
  const bytes = byteLength(text ?? '');
  // Higher EC levels store less data; shrink the effective cap heuristically.
  const cap = ecLevel === 'H' ? 1200 : ecLevel === 'Q' ? 1600 : ecLevel === 'M' ? 2200 : QR_BYTE_LIMIT;
  if (bytes > cap) {
    return {
      level: 'error',
      bytes,
      message: `Too long for a QR code (${bytes} bytes, ~${cap} max at EC-${ecLevel}). Shorten the text or lower the error-correction level.`,
    };
  }
  if (bytes > QR_WARN_AT || (ecLevel !== 'L' && bytes > cap * 0.8)) {
    return {
      level: 'warn',
      bytes,
      message: `Long text (${bytes} bytes) — the QR will be very dense and harder to scan.`,
    };
  }
  return { level: 'ok', bytes, message: '' };
}

function luminance(hex) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a, b) {
  try {
    const l1 = luminance(a);
    const l2 = luminance(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  } catch {
    return 21;
  }
}

export function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
