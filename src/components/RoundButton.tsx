import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { theme } from '@constants';

const RoundButton: React.FC<{
  color?: string;
  label: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  right?: boolean;
  alt?: boolean;
  flex?: boolean;
  onPress?(): void;
}> = ({
  color = theme.COLORS.PRIMARY,
  label,
  icon = null,
  loading = false,
  disabled = false,
  right = false,
  alt = false,
  flex = false,
  onPress = () => {}
}) => {
  const buttonColorStyle = alt
    ? {
        backgroundColor: theme.COLORS.WHITE,
        borderWidth: 1,
        borderColor: color
      }
    : {
        backgroundColor: color
      };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => {
        if (!loading) {
          onPress();
        }
      }}
    >
      <View style={[styles.button, buttonColorStyle, flex && { flexGrow: 1 }]}>
        {!right && icon}

        <Text
          style={[
            styles.buttonText,
            !right && icon && { marginLeft: 8 },
            right && icon && { marginRight: 8 },
            alt
              ? {
                  color
                }
              : {
                  color: theme.COLORS.WHITE
                }
          ]}
        >
          {label}
        </Text>

        {right && icon}
      </View>

      {loading && (
        <View style={[styles.loadingContainer, buttonColorStyle]}>
          <ActivityIndicator color={alt ? color : theme.COLORS.WHITE} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 17
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default RoundButton;
