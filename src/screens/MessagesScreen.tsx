import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import ScreenContent from '@components/ScreenContent';
import Content from '@screens/content/MessagesContent';

const MessagesScreen: React.FC<{
  navigation: NavigationProp<any, 'Messages'>;
}> = ({ navigation }) => {
  return <ScreenContent navigation={navigation} Content={Content} />;
};

export default MessagesScreen;
