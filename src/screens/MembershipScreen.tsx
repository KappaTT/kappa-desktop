import React from 'react';

import { ParamType } from '@navigation/NavigationTypes';
import Content from '@screens/content/MembershipContent';

const MembershipScreen: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  return <Content navigation={navigation} />;
};

export default MembershipScreen;
