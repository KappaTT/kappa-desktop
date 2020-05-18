import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useIsFocused } from 'react-navigation-hooks';

import { ParamType } from '@navigation/NavigationTypes';

const LoginContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  return (
    <View>
      <Text>Login</Text>
    </View>
  );
};

const styles = StyleSheet.create({});

export default LoginContent;
