import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { SIDEBAR_WIDTH } from '@services/utils';
import { TRedux } from '@reducers';
import Sidebar from '@components/Sidebar';

const ScreenContent: React.FC<{
  navigation: NavigationProp<any, string>;
  Content: React.FC<{ navigation: NavigationProp<any, string> }>;
}> = ({ navigation, Content }) => {
  const authorized = useSelector((state: TRedux) => state.auth.authorized);

  return (
    <View style={styles.container}>
      {authorized && (
        <View style={styles.sidebarContainer}>
          <Sidebar />
        </View>
      )}

      <View style={styles.appContainer}>
        <Content navigation={navigation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  sidebarContainer: {
    width: SIDEBAR_WIDTH
  },
  appContainer: {
    flex: 1
  }
});

export default ScreenContent;
