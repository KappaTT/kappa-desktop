import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { theme } from '@constants';
import { TSidebarElement } from '@navigation/SidebarLayout';

const SidebarNavButton: React.FC<{
  element: TSidebarElement;
  selected: boolean;
  level?: number;
  onPress(element: TSidebarElement): void;
}> = ({ element, selected, level = 0, onPress }) => {
  const onPressElement = React.useCallback(() => {
    onPress(element);
  }, [element, onPress]);

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPressElement}>
      <View style={[styles.container, level === 1 && styles.subContainer, selected && styles.selectedContainer]}>
        <Text style={[styles.label, level === 1 && styles.subLabel, selected && styles.selectedLabel]}>
          {element.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center'
  },
  subContainer: {
    paddingHorizontal: 8
  },
  selectedContainer: {
    backgroundColor: `${theme.COLORS.PRIMARY}0f`
  },
  label: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 14,
    color: theme.COLORS.DARK_GRAY
  },
  subLabel: {
    fontFamily: 'OpenSans',
    marginLeft: 6
  },
  selectedLabel: {
    color: theme.COLORS.PRIMARY
  }
});

export default SidebarNavButton;
