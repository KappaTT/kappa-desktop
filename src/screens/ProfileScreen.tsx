import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import ScreenContent from '@components/ScreenContent';
import Content from '@screens/content/ProfileContent';

const ProfileScreen: React.FC<{
  navigation: NavigationProp<any, 'Profile'>;
}> = ({ navigation }) => {
  return <ScreenContent navigation={navigation} Content={Content} />;
};

export default ProfileScreen;
