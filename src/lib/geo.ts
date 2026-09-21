/**
 * GPS does not need the internet — the chip talks to satellites. So a report can
 * always carry coordinates even with no data connection at all; it is only the
 * transmission that has to wait. That asymmetry is the whole reason the offline
 * queue is worth building.
 */
export interface Fix {
  lat: number;
  lon: number;
  accuracy: number;
}

export function getFix(timeoutMs = 8000): Promise<Fix | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    // Never let a slow fix hold up the report. A late alert with no coordinates
    // beats an accurate one that never left the phone.
    const timer = setTimeout(() => resolve(null), timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30_000 },
    );
  });
}
