import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  heading: {
    fontWeight: '400',
    fontSize: 120,
    lineHeight: 120,
    color: Colors.textPrimary ?? '#000000',
  },

  body: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    color: '#070501',
  },

  subheading: {
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 24,
    color: Colors.textPrimary ?? '#000000',
  },

  chancePercentage: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    color: Colors.chanceText,
    textAlign: 'right',
  },
});