import React from 'react';

import { ParamType } from '@navigation/NavigationTypes';
import Content from '@screens/content/LoginContent';

const LoginScreen: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default LoginScreen;
