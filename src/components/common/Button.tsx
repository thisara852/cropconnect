import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'orange' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  isLoading = false,
  disabled = false,
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const isDisabled = disabled || isLoading;

  let buttonStyle: ViewStyle = styles.btnPrimary;
  let labelStyle: TextStyle = styles.textLight;
  let iconColor: string = Colors.white;

  switch (variant) {
    case 'secondary':
      buttonStyle = styles.btnSecondary;
      labelStyle = styles.textLight;
      iconColor = Colors.white;
      break;
    case 'orange':
      buttonStyle = styles.btnOrange;
      labelStyle = styles.textLight;
      iconColor = Colors.white;
      break;
    case 'outline':
      buttonStyle = styles.btnOutline;
      labelStyle = styles.textOutline;
      iconColor = Colors.primary;
      break;
    case 'ghost':
      buttonStyle = styles.btnGhost;
      labelStyle = styles.textGhost;
      iconColor = Colors.primary;
      break;
    case 'danger':
      buttonStyle = styles.btnDanger;
      labelStyle = styles.textLight;
      iconColor = Colors.white;
      break;
    default:
      buttonStyle = styles.btnPrimary;
      labelStyle = styles.textLight;
      iconColor = Colors.white;
  }

  let sizeStyle: ViewStyle = styles.sizeLarge;
  let fontSizeStyle: TextStyle = styles.fontLarge;
  let iconSize = 20;

  if (size === 'small') {
    sizeStyle = styles.sizeSmall;
    fontSizeStyle = styles.fontSmall;
    iconSize = 16;
  } else if (size === 'medium') {
    sizeStyle = styles.sizeMedium;
    fontSizeStyle = styles.fontMedium;
    iconSize = 18;
  }

  return (
    <TouchableOpacity
      style={[
        styles.base,
        buttonStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
        />
      ) : (
        <View style={styles.contentRow}>
          {iconName && iconPosition === 'left' && (
            <Ionicons name={iconName} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={[styles.textBase, labelStyle, fontSizeStyle, textStyle]}>{title}</Text>
          {iconName && iconPosition === 'right' && (
            <Ionicons name={iconName} size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
  textLight: {
    color: Colors.white,
  },
  textOutline: {
    color: Colors.primary,
  },
  textGhost: {
    color: Colors.primary,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.secondary,
  },
  btnOrange: {
    backgroundColor: Colors.orange,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: Colors.error,
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  sizeMedium: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  sizeLarge: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  fontSmall: {
    fontSize: 13,
  },
  fontMedium: {
    fontSize: 15,
  },
  fontLarge: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
