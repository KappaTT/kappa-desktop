import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@constants';
import CheckListButton from '@components/CheckListButton';

const CheckList: React.FC<{
  options: {
    id: string;
    title: string;
    subtitle?: string;
  }[];
  selected: {
    [id: string]: boolean;
  };
  onChange?(chosen: string): void;
}> = ({ options, selected, onChange = (chosen: string) => {} }) => {
  return (
    <View>
      {options.map((option) => (
        <CheckListButton
          key={option.id}
          label={option}
          selected={selected[option.id] === true}
          onPress={() => onChange(option.id)}
        />
      ))}
    </View>
  );
};

export default CheckList;
