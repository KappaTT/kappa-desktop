import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { Header } from '@components';

const ChapterSettingsContent: React.FC<{
  navigation: NavigationProp<any, 'Chapter Settings'>;
}> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Chapter Settings">
        <View style={styles.headerChildren} />
      </Header>

      <View style={styles.content} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerChildren: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  refreshContainer: {},
  refreshIcon: {
    margin: 8,
    width: 17
  },
  headerButtonContainer: {
    marginRight: 8
  },
  headerButtonText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
    color: theme.COLORS.PRIMARY
  },
  content: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0
  }
});

export default ChapterSettingsContent;
