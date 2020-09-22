import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/EventsContent';

const EventsScreen: React.FC<{
  navigation: NavigationProp<any, 'Events'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default EventsScreen;
