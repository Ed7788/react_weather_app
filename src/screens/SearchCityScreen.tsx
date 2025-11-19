import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchIcon from '../assets/images/search.svg';
import LocationIcon from '../components/LocationIcon';
import { searchCities } from '../services/geocoding';
import { Colors } from '../theme/colors';
import { CityLocation } from '../types/location';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


type SearchCityScreenProps = {
  onClose: () => void;
  onSelectCity: (city: CityLocation) => void;
  currentLocation?: CityLocation;
  onUseCurrentLocation?: () => void;
  isLocatingCurrentCity?: boolean;
};

const HISTORY_STORAGE_KEY = 'weather-search-history';
const MAX_HISTORY_ITEMS = 5;

export default function SearchCityScreen({
  onClose,
  onSelectCity,
  currentLocation,
  onUseCurrentLocation,
  isLocatingCurrentCity = false,
}: SearchCityScreenProps) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<CityLocation[]>([]);
  const [results, setResults] = useState<CityLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_STORAGE_KEY)
      .then((value) => {
        if (value) {
          setHistory(JSON.parse(value));
        }
      })
      .catch(() => {
        setHistory([]);
      });
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(() => {
      setIsLoading(true);
      searchCities(trimmed)
        .then((data) => {
          setResults(data);
          setError(null);
        })
        .catch(() => {
          setError('Unable to load cities right now');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const persistHistory = async (items: CityLocation[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (storageError) {
      console.warn('Failed to store search history', storageError);
    }
  };

  const addToHistory = (city: CityLocation) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(
            item.name === city.name &&
            item.country === city.country &&
            item.state === city.state
          ),
      );
      const updated = [city, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      persistHistory(updated);
      return updated;
    });
  };

  const removeFromHistory = (city: CityLocation) => {
    setHistory((prev) => {
      const updated = prev.filter(
        (item) =>
          !(
            item.name === city.name &&
            item.country === city.country &&
            item.state === city.state
          ),
      );
      persistHistory(updated);
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    AsyncStorage.removeItem(HISTORY_STORAGE_KEY).catch(() => null);
  };

  const handleSelectCity = (city: CityLocation) => {
    addToHistory(city);
    onSelectCity(city);
    onClose();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Get Weather</Text>

      <View style={styles.searchFieldWrapper}>
        <View
          style={[
            styles.searchField,
            (isFocused || query.length > 0) && styles.searchFieldFocused,
          ]}>
          <SearchIcon width={18} height={18} />
          <TextInput
            placeholder="Enter city name"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.currentLocationRow,
          !onUseCurrentLocation && styles.currentLocationRowDisabled,
        ]}
        onPress={onUseCurrentLocation}
        disabled={!onUseCurrentLocation || isLocatingCurrentCity}>
        <LocationIcon width={16} height={20} fill="#466FE2" />
        <Text style={styles.currentLocationText}>
          {isLocatingCurrentCity
            ? 'Detecting location...'
            : currentLocation?.name ?? 'Use current location'}
        </Text>
        {isLocatingCurrentCity && (
          <ActivityIndicator size="small" color="#466FE2" />
        )}
      </TouchableOpacity>

      {history.length > 0 && query.length === 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Past Search</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearHistory}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {history.map((item) => (
            <View style={styles.historyRow} key={`${item.name}-${item.country}`}>
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => handleSelectCity(item)}>
                <Text style={styles.historyCity}>{item.name}</Text>
                <Text style={styles.historyCountry}>{item.country}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeHistoryButton}
                onPress={() => removeFromHistory(item)}>
                <Text style={styles.removeHistoryText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {query.length > 0 && (
        <View style={styles.dropdownContainer}>
          {!query.trim() ? null : isLoading ? (
            <View style={styles.dropdownState}>
              <ActivityIndicator color={Colors.textPrimary} />
            </View>
          ) : error ? (
            <View style={styles.dropdownState}>
              <Text style={styles.dropdownStateText}>{error}</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.dropdownState}>
              <Text style={styles.dropdownStateText}>No locations found</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => `${item.name}-${item.lat}-${item.lon}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => handleSelectCity(item)}>
                  <Text style={styles.resultCity}>{item.name}</Text>
                  <Text style={styles.resultCountry}>
                    {item.country}
                    {item.state ? ` • ${item.state}` : ''}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={ResultSeparator}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  closeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 28,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 24,
  },
  searchFieldWrapper: {
    marginBottom: 24,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  searchFieldFocused: {
    borderColor: '#466FE2',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: 20,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  currentLocationRowDisabled: {
    opacity: 0.5,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#466FE2',
  },
  historySection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clearHistory: {
    fontSize: 14,
    color: '#466FE2',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  historyItem: {
    flex: 1,
  },
  historyCity: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  historyCountry: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  removeHistoryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeHistoryText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  dropdownContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 16,
    maxHeight: 260,
    overflow: 'hidden',
  },
  dropdownState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownStateText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  resultRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  resultCity: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  resultCountry: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  resultDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});

const ResultSeparator = () => <View style={styles.resultDivider} />;


