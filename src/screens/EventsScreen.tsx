import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import ScreenContent from '@components/ScreenContent';
import Content from '@screens/content/EventsContent';

const EventsScreen: React.FC<{
  navigation: NavigationProp<any, 'Events'>;
}> = ({ navigation }) => {
  return <ScreenContent navigation={navigation} Content={Content} />;
};

export default EventsScreen;
