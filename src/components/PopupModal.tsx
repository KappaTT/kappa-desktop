import React from 'react';
import { StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, View } from 'react-native';

import { theme } from '@constants';

const { width, height } = Dimensions.get('window');

const PopupModal: React.FC<{
  visible: boolean;
  allowClose?: boolean;
  onDoneClosing?(): void;
  children?: React.ReactNode;
}> = ({ visible, allowClose = true, onDoneClosing = () => {}, children }) => {
  const heightBase = new Animated.Value(height * 0.05);

  const progress = React.useRef<Animated.Value>(new Animated.Value(1)).current;
  const [doneClosing, setDoneClosing] = React.useState<boolean>(true);

  const backgroundOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  const handleClose = React.useCallback(() => {
    Animated.timing(progress, {
      toValue: 1,
      easing: Easing.out(Easing.poly(4)),
      duration: 200
    }).start(() => {
      onDoneClosing();

      setDoneClosing(true);
    });
  }, [onDoneClosing, progress]);

  const onPressBackground = React.useCallback(() => {
    if (allowClose) {
      handleClose();
    }
  }, [allowClose, handleClose]);

  React.useEffect(() => {
    if (!visible) {
      handleClose();
    }
  }, [handleClose, visible]);

  React.useEffect(() => {
    if (visible) {
      setDoneClosing(false);

      Animated.timing(progress, {
        toValue: 0,
        easing: Easing.out(Easing.poly(4)),
        duration: 200
      }).start();
    }
  }, [progress, visible]);

  if (doneClosing) {
    return <React.Fragment />;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.background,
        {
          opacity: backgroundOpacity
        }
      ]}
    >
      <Animated.View
        style={[
          styles.foreground,
          {
            transform: [
              {
                translateY: Animated.multiply(heightBase, progress)
              }
            ]
          }
        ]}
      >
        <TouchableOpacity style={styles.touchableBackground} activeOpacity={1} onPress={onPressBackground} />

        <View style={styles.container}>{children}</View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `rgba(0, 0, 0, 0.5)`
  },
  foreground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  touchableBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  container: {
    position: 'absolute',
    left: 40,
    right: 40,
    minHeight: 80,
    borderRadius: 8,
    backgroundColor: theme.COLORS.WHITE,
    overflow: 'hidden'
  }
});

export default PopupModal;
