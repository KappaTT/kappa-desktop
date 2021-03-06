import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { theme } from '@constants';

const RoundButton: React.FC<{
  color?: string;
  textColor?: string;
  bgColor?: string;
  label: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  right?: boolean;
  alt?: boolean;
  flex?: boolean;
  size?: 'small' | 'medium';
  onPress?(): void;
}> = ({
  color = theme.COLORS.PRIMARY,
  textColor = theme.COLORS.WHITE,
  bgColor = theme.COLORS.WHITE,
  label,
  icon = null,
  loading = false,
  disabled = false,
  right = false,
  alt = false,
  flex = false,
  size = 'small',
  onPress = () => {}
}) => {
  const buttonColorStyle = alt
    ? {
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: color
      }
    : {
        backgroundColor: color
      };

  return (
    <TouchableOpacity activeOpacity={0.8} disabled={disabled || loading} onPress={onPress}>
      <View
        style={[
          styles.button,
          size === 'medium' && styles.buttonMedium,
          buttonColorStyle,
          flex && { flexGrow: 1 },
          disabled && { opacity: 0.3 }
        ]}
      >
        {!right && icon}

        <Text
          style={[
            styles.buttonText,
            size === 'medium' && styles.buttonTextMedium,
            !right && icon && { marginLeft: 8 },
            right && icon && { marginRight: 8 },
            alt
              ? {
                  color
                }
              : {
                  color: textColor
                }
          ]}
        >
          {label}
        </Text>

        {right && icon}
      </View>

      {loading && (
        <View style={[styles.loadingContainer, size === 'medium' && styles.loadingContainerMedium, buttonColorStyle]}>
          <ActivityIndicator color={alt ? color : textColor} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 26,
    paddingHorizontal: 16,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonMedium: {
    height: 38,
    borderRadius: 19
  },
  buttonText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 14
  },
  buttonTextMedium: {
    fontSize: 17
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainerMedium: {
    borderRadius: 19
  }
});

export default RoundButton;
