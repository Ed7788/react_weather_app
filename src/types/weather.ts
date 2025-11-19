export type WeatherIconName = 'sun' | 'sunCloud' | 'rainCloud';

export type CurrentWeather = {
  tempCelsius: number;
  description: string;
  icon: WeatherIconName;
};

export type DailyForecast = {
  day: string;
  tempCelsius: number;
  icon: WeatherIconName;
  chanceOfPrecip?: string;
};

