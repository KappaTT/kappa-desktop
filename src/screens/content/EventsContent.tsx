import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth } from '@reducers/actions';
import { theme } from '@constants';

const EventsContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const authorized = useSelector((state: TRedux) => state.auth.authorized);

  const dispatch = useDispatch();

  return <View style={styles.container}></View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default EventsContent;
