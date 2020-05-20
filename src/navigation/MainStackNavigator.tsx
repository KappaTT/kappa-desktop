import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';

import { LoginScreen, EventsScreen, DirectoryScreen } from '@screens';

const LoginStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerStyle: {
        height: 0
      }
    })
  }
});

const EventsStack = createStackNavigator({
  Events: {
    screen: EventsScreen,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerStyle: {
        height: 0
      }
    })
  }
});

const DirectoryStack = createStackNavigator({
  Events: {
    screen: DirectoryScreen,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerStyle: {
        height: 0
      }
    })
  }
});

export default createStackNavigator(
  {
    LoginStack,
    EventsStack,
    DirectoryStack
  },
  {
    headerMode: 'none'
  }
);
