import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import Content from '@screens/content/VotingManagementContent';

const VotingManagementScreen: React.FC<{
  navigation: NavigationProp<any, 'Voting Management'>;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default VotingManagementScreen;
