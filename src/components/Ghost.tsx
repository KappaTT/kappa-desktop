import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

const Ghost: React.FC<{
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}> = ({ style, children }) => {
  return (
    <View style={style} pointerEvents="box-none">
      {children}
    </View>
  );
};

export default Ghost;
