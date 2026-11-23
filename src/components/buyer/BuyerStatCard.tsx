import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';

interface BuyerStatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  variant?: 'green' | 'orange' | 'blue' | 'purple';
  onPress?: () => void;
}

export const BuyerStatCard: React.FC<BuyerStatCardProps> = ({
  label,
  value,
  subtitle,
  iconName,
  variant = 'green',
  onPress,
}) => {
  let iconBg = '#EAF6F0';
  let iconColor: string = Colors.secondary;
  let borderColor = '#E2E8DE';

  if (variant === 'orange') {
    iconBg = '#FEF4E8';
    iconColor = Colors.orangeDark;
    borderColor = '#FCD7A8';
  } else if (variant === 'blue') {
    iconBg = '#EBF3FB';
    iconColor = Colors.info;
    borderColor = '#BFDBFE';
  } else if (variant === 'purple') {
    iconBg = '#F3E8FF';
    iconColor = '#7C3AED';
    borderColor = '#DDD6FE';
  }

  const Content = (
    <View style={[styles.card, Shadows.small, { borderColor }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <Text style={styles.valueText}>{value}</Text>
      </View>

      <Text style={styles.labelText} numberOfLines={1}>
        {label}
      </Text>
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
        {Content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{Content}</View>;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textDark,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  subtitleText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
