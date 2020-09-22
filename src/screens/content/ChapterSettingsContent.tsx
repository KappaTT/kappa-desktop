import React from 'react';
import { StyleSheet, View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused, NavigationProp } from '@react-navigation/native';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa, _nav } from '@reducers/actions';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { Header, Icon } from '@components';

const ChapterSettingsContent: React.FC<{
  navigation: NavigationProp<any, 'Chapter Settings'>;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  return (
    <View style={styles.container}>
      <Header title="Chapter Settings">
        <View style={styles.headerChildren}></View>
      </Header>

      <View style={styles.content}></View>
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
