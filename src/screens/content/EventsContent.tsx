import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { Header, Icon } from '@components';

const EventsContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const user = useSelector((state: TRedux) => state.auth.user);

  const [showing, setShowing] = React.useState<'Full Year' | 'Upcoming'>('Upcoming');

  const dispatch = useDispatch();
  const dispatchEditNewEvent = React.useCallback(() => dispatch(_kappa.editNewEvent()), [dispatch]);

  const onPressShowing = React.useCallback(() => {
    if (showing === 'Upcoming') {
      setShowing('Full Year');
    } else {
      setShowing('Upcoming');
    }
  }, [showing]);

  return (
    <View style={styles.container}>
      <Header title="Events" subtitle={showing} subtitleIsPressable={true} onSubtitlePress={onPressShowing}>
        <View style={styles.headerChildren}>
          {user.privileged && (
            <TouchableOpacity activeOpacity={0.6} onPress={dispatchEditNewEvent}>
              <Text style={styles.headerButtonText}>New Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </Header>

      <View style={styles.content}>
        <ScrollView></ScrollView>
      </View>
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

export default EventsContent;
