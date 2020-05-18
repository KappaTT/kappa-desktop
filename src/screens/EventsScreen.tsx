import React from 'react';

import { ParamType } from '@navigation/NavigationTypes';
import Content from '@screens/content/EventsContent';

const EventsScreen: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default EventsScreen;
