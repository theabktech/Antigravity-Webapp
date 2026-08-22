// Haptic feedback service for mobile devices

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export const triggerHaptic = (type: HapticType = 'light', enabled = true) => {
  if (!enabled || typeof window === 'undefined' || !('navigator' in window) || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 60, 25]);
        break;
      case 'warning':
        navigator.vibrate([30, 80, 30]);
        break;
      case 'error':
        navigator.vibrate([40, 50, 40, 50, 60]);
        break;
    }
  } catch {
    // Ignore unsupported vibrations silently
  }
};
