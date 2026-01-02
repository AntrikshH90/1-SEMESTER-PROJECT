export type VibrationType = 'none' | 'short' | 'medium' | 'long' | 'pulse' | 'alert';

export const VIBRATION_PATTERNS: Record<VibrationType, number[]> = {
  none: [],
  short: [200],
  medium: [500],
  long: [1000],
  pulse: [200, 100, 200],
  alert: [500, 200, 500, 200, 500]
};

export const VIBRATION_LABELS: Record<VibrationType, string> = {
  none: 'No Vibration',
  short: 'Short Buzz',
  medium: 'Medium Buzz',
  long: 'Long Buzz',
  pulse: 'Pulse (Da-da)',
  alert: 'High Alert'
};