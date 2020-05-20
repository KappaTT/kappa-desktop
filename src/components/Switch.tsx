import React from 'react';
import { Switch as NativeSwitch } from 'react-native';

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
  return (
    <NativeSwitch
      value={value}
      thumbColor="#FFF"
      thumbTintColor={thumbColor}
      // @ts-ignore
      activeThumbColor={thumbColor}
      onTintColor={`${trackColor}50`}
      tintColor={backgroundColor}
      trackColor={{ false: trackColor, true: trackColor }}
      onValueChange={onValueChange}
    />
  );
};

export default Switch;
