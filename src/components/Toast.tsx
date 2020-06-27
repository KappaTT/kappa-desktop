import React from 'react';
import { StyleSheet, TouchableOpacity, Animated, Easing, View, Text } from 'react-native';

import { theme } from '@constants';
import { TToast } from '@reducers/ui';
import { HEADER_HEIGHT, SIDEBAR_WIDTH, TOAST_HEIGHT } from '@services/utils';

const Toast: React.FC<{
  toast: TToast;
  shouldClose?: boolean;
  onDoneClosing(): void;
  children?: React.ReactNode;
}> = ({ toast, shouldClose = false, onDoneClosing, children }) => {
  const progress = React.useRef<Animated.Value>(new Animated.Value(1)).current;

  const backgroundOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  const toastHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [TOAST_HEIGHT, 0]
  });

  const handleClose = React.useCallback(() => {
    Animated.timing(progress, {
      toValue: 1,
      easing: Easing.out(Easing.poly(4)),
      duration: 200,
      useNativeDriver: false
    }).start(() => {
      onDoneClosing();
    });
  }, [onDoneClosing, progress]);

  const onPressBackground = React.useCallback(() => {
    if (toast.allowClose) {
      handleClose();
    }
  }, [handleClose, toast.allowClose]);

  React.useEffect(() => {
    if (shouldClose) {
      handleClose();
    }
  }, [handleClose, shouldClose]);

  React.useEffect(() => {
    if (toast.timer > 0) {
      const t = setTimeout(handleClose, toast.timer);
      return () => clearTimeout(t);
    }
  }, [handleClose, toast.timer]);

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      easing: Easing.out(Easing.poly(4)),
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [progress]);

  return (
    <Animated.View
      pointerEvents={toast.showBackdrop ? 'auto' : 'box-none'}
      style={[
        styles.background,
        {
          opacity: backgroundOpacity
        }
      ]}
    >
      {toast.showBackdrop && (
        <TouchableOpacity style={styles.touchableBackground} activeOpacity={1} onPress={onPressBackground} />
      )}

      <TouchableOpacity disabled={toast.showBackdrop} activeOpacity={1.0} onPress={onPressBackground}>
        <Animated.View
          style={[
            styles.foreground,
            {
              backgroundColor: toast.toastColor,
              height: toastHeight
            }
          ]}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: toast.textColor }]}>{toast.title}</Text>
            <Text style={[styles.message, { color: toast.textColor }]}>{toast.message}</Text>

            {children}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  touchableBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `rgba(255, 255, 255, 0.5)`
  },
  foreground: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: SIDEBAR_WIDTH,
    right: 0
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    marginRight: 8
  },
  message: {
    fontFamily: 'OpenSans',
    fontSize: 14
  }
});

export default Toast;
