export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Major Indian tech hubs and educational centers
export const INDIAN_CITIES_COORDINATES: Record<string, Coordinates> = {
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  delhi: { latitude: 28.6139, longitude: 77.2090 },
  "new delhi": { latitude: 28.6139, longitude: 77.2090 },
  "delhi ncr": { latitude: 28.6139, longitude: 77.2090 },
  gurugram: { latitude: 28.4595, longitude: 77.0266 },
  gurgaon: { latitude: 28.4595, longitude: 77.0266 },
  noida: { latitude: 28.5355, longitude: 77.3910 },
  "greater noida": { latitude: 28.4744, longitude: 77.5040 },
  mumbai: { latitude: 19.0760, longitude: 72.8777 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  hyderabad: { latitude: 17.3850, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  mathura: { latitude: 27.4924, longitude: 77.6737 },
  roorkee: { latitude: 29.8543, longitude: 77.8880 },
  kanpur: { latitude: 26.4499, longitude: 80.3319 },
  indore: { latitude: 22.7196, longitude: 75.8577 },
  bhopal: { latitude: 23.2599, longitude: 77.4126 },
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  coimbatore: { latitude: 11.0168, longitude: 76.9558 },
  chandigarh: { latitude: 30.7333, longitude: 76.7794 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  varanasi: { latitude: 25.3176, longitude: 82.9739 },
  patna: { latitude: 25.5941, longitude: 85.1376 },
  bhubaneswar: { latitude: 20.2961, longitude: 85.8245 },
  goa: { latitude: 15.2993, longitude: 74.1240 },
  nagpur: { latitude: 21.1458, longitude: 79.0882 },
};

/**
 * Normalizes city name and finds its coordinates from the dictionary.
 */
export function getCityCoordinates(city?: string | null): Coordinates | null {
  if (!city) return null;
  const clean = city.toLowerCase().trim();
  for (const [key, coords] of Object.entries(INDIAN_CITIES_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return null;
}

/**
 * Calculates Haversine distance in kilometers between two coordinate points.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
