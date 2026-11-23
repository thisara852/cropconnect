import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../../types/auth';
import { Colors } from '../../constants/theme';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'small' }) => {
  let label = 'Farmer';
  let icon: keyof typeof Ionicons.glyphMap = 'leaf';
  let bg: string = Colors.farmerBg;
  let text: string = Colors.farmer;
  let borderColor = '#B8E2CC';

  if (role === 'buyer') {
    label = 'Buyer';
    icon = 'cart';
    bg = Colors.buyerBg;
    text = Colors.orangeDark;
    borderColor = '#FCD7A8';
  } else if (role === 'admin') {
    label = 'Official Admin';
    icon = 'shield-checkmark';
    bg = Colors.adminBg;
    text = Colors.adminGold;
    borderColor = '#CBD5E1';
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor },
        isSmall ? styles.badgeSmall : styles.badgeMedium,
      ]}
    >
      <Ionicons name={icon} size={isSmall ? 12 : 15} color={text} />
      <Text style={[styles.text, { color: text }, isSmall ? styles.textSmall : styles.textMedium]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
});
