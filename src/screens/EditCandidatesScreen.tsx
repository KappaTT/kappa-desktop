import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/EditCandidatesContent';

const EditCandidatesScreen: React.FC<{
  navigation: NavigationProp<any, 'Edit Candidates'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default EditCandidatesScreen;
