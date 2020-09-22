import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/DirectoryContent';

const DirectoryScreen: React.FC<{
  navigation: NavigationProp<any, 'Directory'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default DirectoryScreen;
