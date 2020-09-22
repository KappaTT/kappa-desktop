import React from 'react';
import { NavigationProp } from '@react-navigation/native';

import ScreenContent from '@components/ScreenContent';
import Content from '@screens/content/VotingManagementContent';

const VotingManagementScreen: React.FC<{
  navigation: NavigationProp<any, 'Voting Management'>;
}> = ({ navigation }) => {
  return <ScreenContent navigation={navigation} Content={Content} />;
};

export default VotingManagementScreen;
