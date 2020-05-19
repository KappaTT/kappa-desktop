import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';

import { theme } from '@constants';
import { TSidebarElement } from '@navigation/SidebarLayout';
import Icon from '@components/Icon';
import SidebarNavButton from '@components/SidebarNavButton';

const SidebarDropdown: React.FC<{
  element: TSidebarElement;
  expanded: boolean;
  selectedLabel: string;
  onPress(element: TSidebarElement): void;
}> = ({ element, expanded, selectedLabel, onPress }) => {
  const navHeightBase = new Animated.Value(element.children.length * 24);
  const opacityBase = new Animated.Value(1);

  const [animating, setAnimating] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<Animated.Value>(new Animated.Value(1));

  const animate = React.useCallback(
    (target: number) => {
      Animated.timing(progress, {
        toValue: target,
        easing: Easing.out(Easing.poly(4)),
        duration: 200
      }).start(() => {
        onPress(element);
        setAnimating(false);
      });

      setAnimating(true);
    },
    [element, onPress, progress]
  );

  const onPressHeader = React.useCallback(() => {
    if (element.expanded) {
      animate(0);
    } else {
      animate(1);
    }
  }, [animate, element.expanded]);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPressHeader}>
        <View style={styles.headerButton}>
          <Icon
            family="MaterialIcons"
            name={(expanded && !animating) || (!expanded && animating) ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={18}
            color={theme.COLORS.DARK_GRAY}
          />
          <Text style={styles.label}>{element.label}</Text>
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.navArea,
          {
            height: Animated.multiply(navHeightBase, progress),
            opacity: Animated.multiply(opacityBase, progress)
          }
        ]}
      >
        {element.children.map((child) => (
          <SidebarNavButton
            key={child.label}
            element={child}
            selected={child.label === selectedLabel}
            level={1}
            onPress={() => onPress(child)}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8
  },
  headerButton: {
    width: '100%',
    height: 24,
    paddingHorizontal: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY,
    textTransform: 'uppercase'
  },
  navArea: {}
});

export default SidebarDropdown;
