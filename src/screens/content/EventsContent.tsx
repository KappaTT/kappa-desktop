import React from 'react';
import { StyleSheet, Dimensions, View, Text, ActivityIndicator, TouchableOpacity, SectionList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { theme } from '@constants';
import { TEvent } from '@backend/kappa';
import { HEADER_HEIGHT } from '@services/utils';
import { hasValidCheckIn, getEventById, shouldLoad } from '@services/kappaService';
import { Header, Icon, EventItem } from '@components';

const { height } = Dimensions.get('window');

const EventsContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const isGettingEvents = useSelector((state: TRedux) => state.kappa.isGettingEvents);
  const getEventsError = useSelector((state: TRedux) => state.kappa.getEventsError);
  const isGettingDirectory = useSelector((state: TRedux) => state.kappa.isGettingDirectory);
  const getDirectoryError = useSelector((state: TRedux) => state.kappa.getDirectoryError);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);
  const isGettingExcuses = useSelector((state: TRedux) => state.kappa.isGettingExcuses);
  const getExcusesError = useSelector((state: TRedux) => state.kappa.getExcusesError);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const eventSections = useSelector((state: TRedux) => state.kappa.eventSections);
  const upcomingSections = useSelector((state: TRedux) => state.kappa.upcomingSections);
  const editingEventId = useSelector((state: TRedux) => state.kappa.editingEventId);
  const getEventsErrorMessage = useSelector((state: TRedux) => state.kappa.getEventsErrorMessage);
  const selectedEventId = useSelector((state: TRedux) => state.kappa.selectedEventId);

  const [refreshing, setRefreshing] = React.useState<boolean>(
    isGettingEvents || isGettingDirectory || isGettingAttendance
  );
  const [showing, setShowing] = React.useState<'Full Year' | 'Upcoming'>('Full Year');

  const dispatch = useDispatch();
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetMyAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getMyAttendance(user, overwrite)),
    [dispatch, user]
  );
  const dispatchGetDirectory = React.useCallback(() => dispatch(_kappa.getDirectory(user)), [dispatch, user]);
  const dispatchGetExcuses = React.useCallback(() => dispatch(_kappa.getExcuses(user)), [dispatch, user]);
  const dispatchEditNewEvent = React.useCallback(() => dispatch(_kappa.editNewEvent()), [dispatch]);
  const dispatchSaveEditEvent = React.useCallback(
    (event: Partial<TEvent>, eventId?: string) => dispatch(_kappa.saveEditEvent(user, event, eventId)),
    [dispatch, user]
  );
  const dispatchCancelEditEvent = React.useCallback(() => dispatch(_kappa.cancelEditEvent()), [dispatch]);

  const scrollRef = React.useRef(undefined);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingEvents && (force || (!getEventsError && shouldLoad(loadHistory, 'events')))) dispatchGetEvents();
      if (!isGettingDirectory && (force || (!getDirectoryError && shouldLoad(loadHistory, 'directory'))))
        dispatchGetDirectory();
      if (!isGettingAttendance && (force || (!getAttendanceError && shouldLoad(loadHistory, `user-${user.email}`))))
        dispatchGetMyAttendance(force);
      if (!isGettingExcuses && (force || (!getExcusesError && shouldLoad(loadHistory, 'excuses'))))
        dispatchGetExcuses();
    },
    [
      isGettingEvents,
      getEventsError,
      loadHistory,
      dispatchGetEvents,
      isGettingDirectory,
      getDirectoryError,
      dispatchGetDirectory,
      isGettingAttendance,
      getAttendanceError,
      user.email,
      dispatchGetMyAttendance,
      isGettingExcuses,
      getExcusesError,
      dispatchGetExcuses
    ]
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    loadData(true);
  }, [loadData]);

  const onPressShowing = React.useCallback(() => {
    if (showing === 'Upcoming') {
      setShowing('Full Year');
    } else {
      setShowing('Upcoming');
    }
  }, [showing]);

  React.useEffect(() => {
    if (!isGettingEvents && !isGettingDirectory && !isGettingAttendance) {
      setRefreshing(false);
    }
  }, [isGettingEvents, isGettingDirectory, isGettingAttendance]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  const keyExtractor = (item: TEvent, index) => {
    return `${item._id}-${index}`;
  };

  const renderSectionHeader = ({ section: { title, data } }) => {
    return (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderText}>{moment(title).format('ddd LL')}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: TEvent }) => {
    return (
      <React.Fragment>
        <EventItem event={item} />

        <View style={styles.separator} />
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Events" subtitle={showing} subtitleIsPressable={true} onSubtitlePress={onPressShowing}>
        <View style={styles.headerChildren}>
          {user.privileged && (
            <View style={styles.headerButtonContainer}>
              <TouchableOpacity activeOpacity={0.6} onPress={dispatchEditNewEvent}>
                <Text style={styles.headerButtonText}>New Event</Text>
              </TouchableOpacity>
            </View>
          )}

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

      <View style={styles.content}>
        <SectionList
          ref={(ref) => (scrollRef.current = ref)}
          contentContainerStyle={styles.sectionContent}
          sections={showing === 'Upcoming' ? upcomingSections : eventSections}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.errorMessage}>{getEventsErrorMessage || 'No upcoming events'}</Text>}
        />
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
  refreshContainer: {},
  refreshIcon: {
    padding: 8
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
  },
  sectionContent: {
    paddingTop: 8
  },
  sectionHeaderContainer: {
    backgroundColor: theme.COLORS.WHITE
  },
  sectionHeaderText: {
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 16,
    fontFamily: 'OpenSans-Bold',
    fontSize: 17
  },
  separator: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  errorMessage: {
    marginTop: '40vh',
    textAlign: 'center',
    fontFamily: 'OpenSans'
  }
});

export default EventsContent;
