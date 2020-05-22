import React from 'react';
import { Switch as NativeSwitch, TouchableOpacity } from 'react-native';

import { theme } from '@constants';

const Switch: React.FC<{
  value?: boolean;
  thumbColor?: string;
  backgroundColor?: string;
  trackColor?: string;
  onValueChange?(newValue: boolean): void;
}> = ({
  value = false,
  thumbColor = theme.COLORS.PRIMARY,
  backgroundColor = theme.COLORS.LIGHT_BORDER,
  trackColor = theme.COLORS.PRIMARY,
  onValueChange = (newValue: boolean) => {}
}) => {
  const onPress = React.useCallback(() => {
    // Using touchable to intercept and mimic behavior due to bug that causes focus overlay on switch if pressed
    onValueChange(!value);
  }, [onValueChange, value]);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <NativeSwitch
        pointerEvents="none"
        value={value}
        thumbColor="#FFF"
        thumbTintColor={thumbColor}
        // @ts-ignore
        activeThumbColor={thumbColor}
        onTintColor={`${trackColor}50`}
        tintColor={backgroundColor}
        trackColor={{ false: trackColor, true: trackColor }}
      />
    </TouchableOpacity>
  );
};

export default Switch;
