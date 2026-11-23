import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
  selectedBorderColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  selected = false,
  selectedBorderColor = Colors.secondary,
}) => {
  const containerStyle = [
    styles.card,
    Shadows.card,
    selected && {
      borderColor: selectedBorderColor,
      borderWidth: 2,
      backgroundColor: '#FAFCF8',
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
