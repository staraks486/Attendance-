import { Coordinates, WorkLocation } from '../types';

/**
 * Calculates Haversine distance between two sets of coordinates in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if user location is inside work location geofence
 */
export function checkGeofence(
  coords: Coordinates,
  location: WorkLocation
): { isInside: boolean; distanceMeters: number } {
  const distance = calculateDistanceMeters(
    coords.lat,
    coords.lng,
    location.lat,
    location.lng
  );
  return {
    isInside: distance <= location.radiusMeters,
    distanceMeters: distance,
  };
}

/**
 * Reverse geocodes lat/lng into a human readable address string.
 * Tries Nominatim free API with a fast timeout, falls back gracefully.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'GeoClock-Attendance-App/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.display_name) {
        // Shorten long address
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
    }
  } catch (e) {
    // Fallback if offline or API blocked
  }

  // Graceful fallback display
  return `GPS Pin (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
}

/**
 * Formats seconds or minutes into HH:MM:SS string
 */
export function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export function formatTimeOnly(isoString?: string | null): string {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDateShort(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}
