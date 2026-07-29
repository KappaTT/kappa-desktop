import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import ScreenContent from '@components/ScreenContent';
import Content from '@screens/content/CoursesContent';

const CoursesScreen: React.FC<{
  navigation: NavigationProp<any, 'Courses'>;
}> = ({ navigation }) => {
  return <ScreenContent navigation={navigation} Content={Content} />;
};

export default CoursesScreen
;