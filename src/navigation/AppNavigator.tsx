import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
  LinkingOptions,
  getStateFromPath,
  getPathFromState
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { theme } from '@constants';
import {
  DirectoryScreen,
  EditCandidatesScreen,
  EventsScreen,
  LoginScreen,
  MessagesScreen,
  ProfileScreen,
  VotingManagementScreen
} from '@screens';
import { navigationRef } from '@navigation/NavigationService';

// Create stacks
const LoginStack = createStackNavigator();
const MessagesStack = createStackNavigator();
const EventsStack = createStackNavigator();
const DirectoryStack = createStackNavigator();
const EditCandidatesStack = createStackNavigator();
const VotingManagementStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const LoginStackNavigator = () => {
  return (
    <LoginStack.Navigator screenOptions={{ headerShown: false }}>
      <LoginStack.Screen name="Login" component={LoginScreen} />
    </LoginStack.Navigator>
  );
};

const EventsStackNavigator = () => {
  return (
    <EventsStack.Navigator screenOptions={{ headerShown: false }}>
      <EventsStack.Screen name="Events" component={EventsScreen} />
    </EventsStack.Navigator>
  );
};

const DirectoryStackNavigator = () => {
  return (
    <DirectoryStack.Navigator screenOptions={{ headerShown: false }}>
      <DirectoryStack.Screen name="Directory" component={DirectoryScreen} />
    </DirectoryStack.Navigator>
  );
};

const MessagesStackNavigator = () => {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="Messages" component={MessagesScreen} />
    </MessagesStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
};

const EditCandidatesNavigator = () => {
  return (
    <EditCandidatesStack.Navigator screenOptions={{ headerShown: false }}>
      <EditCandidatesStack.Screen name="Edit Candidates" component={EditCandidatesScreen} />
    </EditCandidatesStack.Navigator>
  );
};

const VotingManagementNavigator = () => {
  return (
    <VotingManagementStack.Navigator screenOptions={{ headerShown: false }}>
      <VotingManagementStack.Screen name="Voting Management" component={VotingManagementScreen} />
    </VotingManagementStack.Navigator>
  );
};

// Create Tab navigator for caching
const Tab = createBottomTabNavigator();

const NavigatorTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.COLORS.WHITE
  }
};

// Hides the tab bar flash, coordinated with hiding tab bar visibility
const ConsumeTabBar = () => <React.Fragment />;

const ScreenLinks = (routes: { routeName: string; link: string }[]) => {
  const links = {};

  for (const { routeName, link } of routes) {
    links[routeName] = {
      screens: {
        [routeName]: link
      }
    };
  }

  return links;
};

const domains = ['localhost:19006', 'app.kappathetatau.org'];

const LinkingArray: { routeName: string; link: string }[] = [
  { routeName: 'Login', link: 'login' },
  { routeName: 'Events', link: 'events' },
  { routeName: 'Directory', link: 'directory' },
  { routeName: 'Messages', link: 'messages' },
  { routeName: 'Profile', link: 'profile' },
  { routeName: 'Edit Candidates', link: 'edit-candidates' },
  { routeName: 'Voting Management', link: 'voting-management' }
];

const LinkingConfig: LinkingOptions = {
  enabled: true,
  prefixes: domains.map((domain) => `https://${domain}`),
  config: {
    initialRouteName: 'Login',
    screens: ScreenLinks(LinkingArray)
  },
  getStateFromPath,
  getPathFromState
};

const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef} theme={NavigatorTheme} linking={LinkingConfig}>
      <Tab.Navigator tabBar={ConsumeTabBar} screenOptions={{ tabBarVisible: false }}>
        <Tab.Screen name="Login" component={LoginStackNavigator} />
        <Tab.Screen name="Events" component={EventsStackNavigator} />
        <Tab.Screen name="Directory" component={DirectoryStackNavigator} />
        <Tab.Screen name="Messages" component={MessagesStackNavigator} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
        <Tab.Screen name="Edit Candidates" component={EditCandidatesNavigator} />
        <Tab.Screen name="Voting Management" component={VotingManagementNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
