import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showTagline = true,
  light = false,
}) => {
  const iconSize = size === 'small' ? 24 : size === 'large' ? 44 : 32;
  const textSize = size === 'small' ? 18 : size === 'large' ? 28 : 22;
  const badgeSize = size === 'small' ? 10 : 12;

  const textColor = light ? Colors.white : Colors.primary;
  const subColor = light ? '#C2DFD2' : Colors.textSecondary;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, size === 'large' && styles.iconLarge]}>
          <Ionicons name="leaf" size={iconSize} color={light ? Colors.orange : Colors.primary} />
          <View style={styles.dotOverlay}>
            <Ionicons name="flash" size={iconSize * 0.45} color={Colors.orange} />
          </View>
        </View>
        <View style={styles.textGroup}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { fontSize: textSize, color: textColor }]}>
              CROP<Text style={{ color: Colors.orange }}>CONNECT</Text>
            </Text>
            <View style={styles.countryPill}>
              <Text style={[styles.countryText, { fontSize: badgeSize }]}>LK 🇱🇰</Text>
            </View>
          </View>
          {showTagline && (
            <Text style={[styles.tagline, { color: subColor }]}>
              AI-Powered Crop Rescue & Fair-Price Matcher
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#C3E7D5',
  },
  iconLarge: {
    width: 68,
    height: 68,
    borderRadius: 20,
  },
  dotOverlay: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  textGroup: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countryPill: {
    backgroundColor: '#FFF2DE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F7D6A3',
  },
  countryText: {
    fontWeight: '700',
    color: '#A05C06',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
