import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/MessagesContent';

const MessagesScreen: React.FC<{
  navigation: NavigationProp<any, 'Messages'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default MessagesScreen;
