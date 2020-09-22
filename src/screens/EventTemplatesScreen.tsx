import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/EventTemplatesContent';

const EventTemplatesScreen: React.FC<{
  navigation: NavigationProp<any, 'Event Templates'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default EventTemplatesScreen;
