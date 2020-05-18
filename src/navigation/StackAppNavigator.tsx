import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainStackNavigator from '@navigation/MainStackNavigator';

export default createAppContainer(
  createSwitchNavigator({
    Main: MainStackNavigator
  })
);
