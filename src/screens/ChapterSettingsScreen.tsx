import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/ChapterSettingsContent';

const ChapterSettingsScreen: React.FC<{
  navigation: NavigationProp<any, 'Chapter Settings'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default ChapterSettingsScreen;
