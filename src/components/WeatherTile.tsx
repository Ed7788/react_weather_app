import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/styles';
import RainCloudIcon from '../assets/images/rain_cloud.svg';
import SmallSunIcon from '../assets/images/small_sun.svg';
import SunCloudIcon from '../assets/images/sun_cloud.svg';
import { WeatherIconName } from '../types/weather';

const iconMap: Record<WeatherIconName, typeof SmallSunIcon> = {
  sun: SmallSunIcon,
  sunCloud: SunCloudIcon,
  rainCloud: RainCloudIcon,
};

type WeatherRowProps = {
  day: string;
  icon: WeatherIconName;
  temp: number;
  chance?: string;
};

export default function WeatherRow({ day, icon, temp, chance }: WeatherRowProps) {
  const Icon = iconMap[icon];

  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <Text style={styles.day}>{day}</Text>
        <View style={styles.iconCol}>
          <Icon width={28} height={28} />
        </View>
        <View style={styles.chanceCol}>
          {chance ? <Text style={styles.chance}>{chance}</Text> : null}
        </View>
        <Text style={styles.temp}>{temp}°</Text>
      </View>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '85%',
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
  },
  day: {
    fontSize: 16,
    color: Colors.textMain,
    flex: 1,
  },
  iconCol: {
    width: 40,
    alignItems: 'center',
  },
  chanceCol: {
    width: 60,
    alignItems: 'flex-start',
  },
  chance: {
    ...Typography.chancePercentage,
  },
  temp: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  dividerContainer: {
    paddingLeft: 24,
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    width: '100%',
  },
});