import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@constants';
import CheckListButton from '@components/CheckListButton';

const RadioList: React.FC<{
  options: {
    id: string;
    title: string;
    subtitle?: string;
  }[];
  selected: string;
  disabled?: boolean;
  onChange?(chosen: string): void;
}> = ({ options, selected, disabled = false, onChange = (chosen: string) => {} }) => {
  const onPressChange = React.useCallback(
    (_id: string) => {
      if (!disabled) {
        onChange(_id);
      }
    },
    [disabled, onChange]
  );

  return (
    <View style={disabled && { opacity: 0.6 }}>
      {options.map((option) => (
        <CheckListButton
          key={option.id}
          label={option}
          selected={option.id === selected}
          onPress={() => onPressChange(option.id)}
        />
      ))}
    </View>
  );
};

export default RadioList;
