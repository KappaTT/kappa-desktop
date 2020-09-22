import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/ProfileContent';

const ProfileScreen: React.FC<{
  navigation: NavigationProp<any, 'Profile'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default ProfileScreen;
