import {
  OPEN_WEATHER_API_KEY,
  OPEN_WEATHER_GEOCODING_URL,
  OPEN_WEATHER_REVERSE_GEOCODING_URL,
} from '../config/openWeather';
import { CityLocation } from '../types/location';

type GeocodingResponseItem = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

export async function searchCities(
  query: string,
  limit = 5,
): Promise<CityLocation[]> {
  if (!query.trim()) {
    return [];
  }

  const url = `${OPEN_WEATHER_GEOCODING_URL}?q=${encodeURIComponent(
    query,
  )}&limit=${limit}&appid=${OPEN_WEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to search cities (${response.status})`);
    }

    const data = (await response.json()) as GeocodingResponseItem[];
    return data.map((item) => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.warn('[searchCities] error', error);
    throw error;
  }
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<CityLocation | null> {
  const url = `${OPEN_WEATHER_REVERSE_GEOCODING_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${OPEN_WEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to reverse geocode (${response.status})`);
    }

    const data = (await response.json()) as GeocodingResponseItem[];
    const match = data[0];
    if (!match) {
      return null;
    }

    return {
      name: match.name,
      country: match.country,
      state: match.state,
      lat: match.lat,
      lon: match.lon,
    };
  } catch (error) {
    console.warn('[reverseGeocode] error', error);
    throw error;
  }
}


