import { OPEN_WEATHER_API_KEY } from '../config/openWeather';
import {
  CurrentWeather,
  DailyForecast,
  WeatherIconName,
} from '../types/weather';

type CurrentWeatherResponse = {
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
  };
};

type ForecastListItem = {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
  }>;
  pop?: number;
};

type ForecastResponse = {
  list: ForecastListItem[];
};

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const conditionIconMap: Record<string, WeatherIconName> = {
  Clear: 'sun',
  Clouds: 'sunCloud',
  Mist: 'sunCloud',
  Fog: 'sunCloud',
  Drizzle: 'rainCloud',
  Rain: 'rainCloud',
  Thunderstorm: 'rainCloud',
  Snow: 'sunCloud',
};

const formatDescription = (description: string) => {
  if (!description) {
    return '';
  }
  return description.charAt(0).toUpperCase() + description.slice(1);
};

const mapConditionToIcon = (condition?: string): WeatherIconName => {
  if (!condition) {
    return 'sunCloud';
  }
  return conditionIconMap[condition] ?? 'sunCloud';
};

const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

const toDateKey = (timestamp: number) =>
  new Date(timestamp * 1000).toISOString().split('T')[0];

const pickRepresentativeForecast = (items: ForecastListItem[]) => {
  return (
    items.reduce((closest, item) => {
      const hour = new Date(item.dt * 1000).getHours();
      const distance = Math.abs(hour - 12); // prefer midday
      if (!closest) {
        return { item, distance };
      }
      return distance < closest.distance ? { item, distance } : closest;
    }, null as { item: ForecastListItem; distance: number } | null)?.item ??
    items[0]
  );
};

export async function getCurrentWeather(
  lat: number,
  lon: number,
): Promise<CurrentWeather> {
  const url = `${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch weather (${response.status})`);
  }

  const data = (await response.json()) as CurrentWeatherResponse;
  const weatherEntry = data.weather[0];

  return {
    tempCelsius: data.main?.temp ?? 0,
    description: formatDescription(weatherEntry?.description ?? ''),
    icon: mapConditionToIcon(weatherEntry?.main),
  };
}

export async function getDailyForecast(
  lat: number,
  lon: number,
  days = 4,
): Promise<DailyForecast[]> {
  const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch forecast (${response.status})`);
  }

  const data = (await response.json()) as ForecastResponse;
  const grouped = new Map<string, ForecastListItem[]>();

  data.list.forEach((item) => {
    const key = toDateKey(item.dt);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)?.push(item);
  });

  const todayKey = toDateKey(Date.now() / 1000);
  const entries: DailyForecast[] = [];

  for (const [key, items] of grouped) {
    if (key === todayKey) {
      continue;
    }
    const representative = pickRepresentativeForecast(items);
    const date = new Date(key);
    const chance =
      representative?.pop ?? items[0]?.pop ?? 0;

    entries.push({
      day: dayFormatter.format(date),
      tempCelsius: representative?.main?.temp ?? 0,
      icon: mapConditionToIcon(representative?.weather?.[0]?.main),
      chanceOfPrecip: chance ? `${Math.round(chance * 100)}%` : undefined,
    });
  }

  return entries.slice(0, days);
}
