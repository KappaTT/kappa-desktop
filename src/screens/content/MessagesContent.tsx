import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa, _nav } from '@reducers/actions';
import { TExcuse } from '@backend/kappa';
import { getExcusedEvents, getEventById, sortEventsByDateReverse, shouldLoad } from '@services/kappaService';
import { theme } from '@constants';
import { HEADER_HEIGHT, isEmpty } from '@services/utils';
import { Header, Icon } from '@components';

const MessagesContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const pendingExcusesArray = useSelector((state: TRedux) => state.kappa.pendingExcusesArray);
  const isGettingExcuses = useSelector((state: TRedux) => state.kappa.isGettingExcuses);
  const getExcusesError = useSelector((state: TRedux) => state.kappa.getExcusesError);

  const [showing, setShowing] = React.useState<'Pending' | 'Approved'>('Pending');

  const dispatch = useDispatch();
  const dispatchGetExcuses = React.useCallback(() => dispatch(_kappa.getExcuses(user)), [dispatch, user]);

  const refreshing = React.useMemo(() => isGettingExcuses, [isGettingExcuses]);

  const excused = getExcusedEvents(records, user.email);
  const excusedArray = Object.values(excused)
    .filter((excuse) => excuse.approved)
    .map((excuse: TExcuse) => {
      const event = getEventById(events, excuse.eventId);

      if (isEmpty(event)) return null;

      return {
        ...excuse,
        title: event.title,
        start: event.start,
        prettyStart: moment(event.start).format('ddd LLL')
      };
    })
    .filter((excuse) => excuse !== null)
    .sort(sortEventsByDateReverse);

  const showingWithCount = React.useMemo(
    () => `${showing} (${showing === 'Pending' ? pendingExcusesArray.length : excusedArray.length})`,
    [excusedArray.length, pendingExcusesArray.length, showing]
  );

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingExcuses && (force || (!getExcusesError && shouldLoad(loadHistory, 'excuses'))))
        dispatchGetExcuses();
    },
    [isGettingExcuses, getExcusesError, loadHistory, dispatchGetExcuses]
  );

  const onRefresh = React.useCallback(() => {
    loadData(true);
  }, [loadData]);

  const onPressShowing = React.useCallback(() => {
    if (showing === 'Approved') {
      setShowing('Pending');
    } else {
      setShowing('Approved');
    }
  }, [showing]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [user.sessionToken, isFocused, loadData]);

  return (
    <View style={styles.container}>
      <Header title="Messages" subtitle={showingWithCount} subtitleIsPressable={true} onSubtitlePress={onPressShowing}>
        <View style={styles.headerChildren}>
          <View style={styles.refreshContainer}>
            {refreshing ? (
              <ActivityIndicator style={styles.refreshIcon} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity onPress={onRefresh}>
                <Icon
                  style={styles.refreshIcon}
                  family="Feather"
                  name="refresh-cw"
                  size={17}
                  color={theme.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Header>

      <View style={styles.content}>{showing === 'Pending' ? <React.Fragment /> : <React.Fragment />}</View>
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
    bottom: 0,
    padding: 16
  }
});

export default MessagesContent;
