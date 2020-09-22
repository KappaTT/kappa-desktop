import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import ScreenContent from '@components/ScreenContent';
import Content from '@screens/content/DirectoryContent';

const DirectoryScreen: React.FC<{
  navigation: NavigationProp<any, 'Directory'>;
}> = ({ navigation }) => {
  return <ScreenContent navigation={navigation} Content={Content} />;
};

export default DirectoryScreen;
