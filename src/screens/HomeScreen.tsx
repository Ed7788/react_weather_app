import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/styles';
import WeatherRow from '../components/WeatherTile';
import LocationIcon from '../components/LocationIcon';
import SearchLocationBar from '../components/SearchLocationBar';
import RainCloudIcon from '../assets/images/rain_cloud.svg';
import SmallSunIcon from '../assets/images/small_sun.svg';
import SunCloudIcon from '../assets/images/sun_cloud.svg';
import { CityLocation } from '../types/location';
import { CurrentWeather, DailyForecast, WeatherIconName } from '../types/weather';

const fallbackForecast: DailyForecast[] = [
  { day: 'Monday', icon: 'sun', tempCelsius: 20 },
  { day: 'Tuesday', icon: 'sunCloud', tempCelsius: 18, chanceOfPrecip: '10%' },
  { day: 'Wednesday', icon: 'rainCloud', tempCelsius: 16, chanceOfPrecip: '40%' },
  { day: 'Thursday', icon: 'sunCloud', tempCelsius: 19 },
];

type HomeScreenProps = {
  location?: CityLocation;
  weather?: CurrentWeather | null;
  forecast?: DailyForecast[];
  isWeatherLoading?: boolean;
  weatherError?: string | null;
  onSearchPress?: () => void;
  onLocationPress?: () => void;
};

const heroIconMap: Record<WeatherIconName, typeof SmallSunIcon> = {
  sun: SmallSunIcon,
  sunCloud: SunCloudIcon,
  rainCloud: RainCloudIcon,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 0,
    alignItems: 'center',
    overflow: 'visible',
  },
  searchBarContainer: {
    width: '100%',
    marginBottom: 30,
  },
  header: {
    paddingVertical: 10,
    width: '100%',
    height: 200,
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  heroIcon: {
    position: 'absolute',
    left: -120,
    top: -60,
  },
  locationContainer: {
    width: '100%',
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 9,
    marginBottom: 13,
    paddingRight: 62,
  },
  location: {
    fontSize: 16,
    color: '#070501',
  },
  temperature: {
    color: '#070501',
  },
  description: {
    fontSize: 18,
    color: '#070501',
    paddingRight: 22,
  },
  forecastContainer: {
    width: '100%',
    marginTop: 140,
    flex: 1,
  },
});

export default function HomeScreen({
  location,
  weather,
  forecast,
  isWeatherLoading,
  weatherError,
  onSearchPress,
  onLocationPress,
}: HomeScreenProps) {
  const locationName = location?.name ?? 'Cupertino';
  const HeroIcon = heroIconMap[weather?.icon ?? 'sun'];
  const temperatureValue =
    weather && typeof weather.tempCelsius === 'number'
      ? `${Math.round(weather.tempCelsius)}°`
      : '--°';
  const description =
    (isWeatherLoading ? 'Loading weather...' : null) ??
    weatherError ??
    weather?.description ??
    'Sunny and bright';
  const forecastSource =
    forecast && forecast.length > 0 ? forecast : fallbackForecast;

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <SearchLocationBar
          onSearchPress={onSearchPress}
          onLocationPress={onLocationPress}
        />
      </View>
      <View style={styles.header}>
        <View style={styles.heroIcon}>
          <HeroIcon width={320} height={320} />
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <LocationIcon width={16} height={20} fill="#070501" />
            <Text style={styles.location}>{locationName}</Text>
          </View>
          <Text style={[Typography.heading, styles.temperature]}>
            {isWeatherLoading ? '...' : temperatureValue}
          </Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <View style={styles.forecastContainer}>
        <FlatList
          scrollEnabled={false}
          data={forecastSource.map((item) => ({
            day: item.day,
            icon: item.icon,
            temp: Math.round(item.tempCelsius),
            chance: item.chanceOfPrecip,
          }))}
          keyExtractor={(item) => item.day}
          renderItem={({ item }) => <WeatherRow {...item} />}
        />
      </View>
    </View>
  );
}