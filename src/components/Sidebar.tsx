import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth } from '@reducers/actions';
import { theme } from '@constants';
import SidebarLayout from '@navigation/SidebarLayout';

const Sidebar: React.FC = () => {
  const authorized = useSelector((state: TRedux) => state.auth.authorized);
  const user = useSelector((state: TRedux) => state.auth.user);

  if (!authorized) {
    return <React.Fragment />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>Kappa Theta Tau</Text>
        <Text style={styles.subtitle}>{`${user.familyName}, ${user.givenName}`}</Text>
      </View>
      <View style={styles.messagesArea} />
      <View style={styles.navigationArea} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  headerArea: {
    height: 56,
    paddingTop: 16
  },
  title: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    lineHeight: 13
  },
  subtitle: {
    fontFamily: 'OpenSans',
    fontSize: 13,
    lineHeight: 13
  }
});

export default Sidebar;
