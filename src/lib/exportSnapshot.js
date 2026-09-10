// Plain snapshot helper to avoid circular imports between qr.js and state.
import { appState } from './state.svelte.js';

export function snapshot() {
  return {
    text: appState.text,
    dotType: appState.dotType,
    fgColor: appState.fgColor,
    bgColor: appState.bgColor,
    useGradient: appState.useGradient,
    gradientFrom: appState.gradientFrom,
    gradientTo: appState.gradientTo,
    cornerSquareType: appState.cornerSquareType,
    cornerDotType: appState.cornerDotType,
    ecLevel: appState.ecLevel,
  };
}
