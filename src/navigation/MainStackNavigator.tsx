import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';

import { LoginScreen } from '@screens';

// Login

const LoginStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  }
});

export default createStackNavigator(
  {
    LoginStack
  },
  {
    headerMode: 'none'
  }
);
