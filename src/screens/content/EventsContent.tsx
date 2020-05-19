import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { theme } from '@constants';
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
  }
});

export default EventsContent;
