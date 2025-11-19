import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import type { GeoPosition } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import HomeScreen from './src/screens/HomeScreen';
import SearchCityScreen from './src/screens/SearchCityScreen';
import { CityLocation } from './src/types/location';
import { CurrentWeather, DailyForecast } from './src/types/weather';
import { getCurrentWeather, getDailyForecast } from './src/services/weather';
import { reverseGeocode } from './src/services/geocoding';

const DEFAULT_CITY: CityLocation = {
  name: 'Cupertino',
  country: 'USA',
  lat: 37.323,
  lon: -122.0322,
};

export default function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityLocation>(DEFAULT_CITY);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const loadWeather = useCallback(async (city: CityLocation) => {
    if (typeof city.lat !== 'number' || typeof city.lon !== 'number') {
      setWeatherError('Missing coordinates for this city');
      setCurrentWeather(null);
      setForecast([]);
      return;
    }

    setIsWeatherLoading(true);
    try {
      const [weather, forecastData] = await Promise.all([
        getCurrentWeather(city.lat, city.lon),
        getDailyForecast(city.lat, city.lon),
      ]);
      setCurrentWeather(weather);
      setForecast(forecastData);
      setWeatherError(null);
    } catch (error) {
      console.warn('Failed to load weather', error);
      setWeatherError('Unable to load weather right now');
      setForecast([]);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedCity);
  }, [loadWeather, selectedCity]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    Geolocation.requestAuthorization?.();
    return true;
  }, []);

  const getCurrentPosition = useCallback(
    () =>
      new Promise<GeoPosition>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          },
        );
      }),
    [],
  );

  const handleSelectCity = (city: CityLocation) => {
    setSelectedCity(city);
    setIsSearching(false);
  };

  const handleUseCurrentLocation = useCallback(async () => {
    setIsRequestingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setWeatherError('Location permission denied');
        return;
      }

      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const city = await reverseGeocode(latitude, longitude);

      if (!city) {
        setWeatherError('Unable to determine your location');
        return;
      }

      setSelectedCity(city);
      setWeatherError(null);
      setIsSearching(false);
    } catch (error) {
      console.warn('Failed to access current location', error);
      setWeatherError('Unable to fetch your current location');
    } finally {
      setIsRequestingLocation(false);
    }
  }, [getCurrentPosition, requestLocationPermission]);

  const initialLocationRef = useRef(false);
  useEffect(() => {
    if (initialLocationRef.current) {
      return;
    }
    initialLocationRef.current = true;
    handleUseCurrentLocation();
  }, [handleUseCurrentLocation]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        {isSearching ? (
          <SearchCityScreen
            currentLocation={selectedCity}
            onSelectCity={handleSelectCity}
            onClose={() => setIsSearching(false)}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocatingCurrentCity={isRequestingLocation}
          />
        ) : (
          <HomeScreen
            location={selectedCity}
            weather={currentWeather}
            forecast={forecast}
            isWeatherLoading={isWeatherLoading}
            weatherError={weatherError}
            onSearchPress={() => setIsSearching(true)}
            onLocationPress={handleUseCurrentLocation}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});