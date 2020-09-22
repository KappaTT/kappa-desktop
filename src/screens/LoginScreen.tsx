import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/LoginContent';

const LoginScreen: React.FC<{
  navigation: NavigationProp<any, 'Login'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default LoginScreen;
