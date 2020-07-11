import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Icon from '@components/Icon';

const Chip: React.FC<{
  iconFamily: string;
  iconName: string;
  label: string;
  backgroundColor: string;
  textColor: string;
}> = ({ iconFamily, iconName, label, backgroundColor, textColor }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor
        }
      ]}
    >
      <Icon family={iconFamily} name={iconName} color={textColor} size={16} />
      <Text
        style={[
          styles.label,
          {
            color: textColor
          }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    marginLeft: 4,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 14,
    lineHeight: 14
  }
});

export default Chip;
