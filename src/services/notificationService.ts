/**
 * Browser Notifications (Sound disabled)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendAqiAlert(city: string, aqi: number, threshold: number): void {
  // Sound completely removed as requested
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`VayuDrishti AQI Alert: ${city}`, {
      body: `Air Quality has crossed threshold of ${threshold}! Current AQI is ${aqi}.`,
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚠️</text></svg>',
    });
  }
}

/**
 * Audio chime disabled - no sound
 */
export function playAlertChime(): void {
  // Intentionally empty: no audio chimes or beeps
}
