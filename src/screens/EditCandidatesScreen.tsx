import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import ScreenContent from '@components/ScreenContent';
import Content from '@screens/content/EditCandidatesContent';

const EditCandidatesScreen: React.FC<{
  navigation: NavigationProp<any, 'Edit Candidates'>;
}> = ({ navigation }) => {
  return <ScreenContent navigation={navigation} Content={Content} />;
};

export default EditCandidatesScreen;
