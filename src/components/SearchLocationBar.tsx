import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import SearchIcon from '../assets/images/search.svg';
import LocationArrowIcon from '../assets/images/location_arrow.svg';

type SearchLocationBarProps = {
  onSearchPress?: () => void;
  onLocationPress?: () => void;
};

export default function SearchLocationBar({
  onSearchPress,
  onLocationPress,
}: SearchLocationBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={onLocationPress}
        activeOpacity={0.7}>
        <LocationArrowIcon width={20} height={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
        <SearchIcon width={20} height={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  searchButton: {
    padding: 8,
  },
  locationButton: {
    padding: 8,
  },
});

