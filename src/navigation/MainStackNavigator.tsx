import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import { LoginScreen, EventsScreen, DirectoryScreen } from '@screens';

const LoginStack = createStackNavigator(
  {
    Login: {
      screen: LoginScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const EventsStack = createStackNavigator(
  {
    Events: {
      screen: EventsScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

const DirectoryStack = createStackNavigator(
  {
    Directory: {
      screen: DirectoryScreen,
      navigationOptions: ({ navigation }) => ({
        header: null,
        headerStyle: {
          height: 0
        }
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarVisible: false
    })
  }
);

export default createBottomTabNavigator({
  LoginStack,
  EventsStack,
  DirectoryStack
});
