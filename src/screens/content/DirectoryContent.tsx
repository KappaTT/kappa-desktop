import React from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa, _nav } from '@reducers/actions';
import { TUser } from '@backend/auth';
import { TEvent } from '@backend/kappa';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { hasValidCheckIn, getEventById, shouldLoad, sortUserByName } from '@services/kappaService';
import { Header, Icon } from '@components';

const { height } = Dimensions.get('window');

const DirectoryContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const isGettingEvents = useSelector((state: TRedux) => state.kappa.isGettingEvents);
  const getEventsError = useSelector((state: TRedux) => state.kappa.getEventsError);
  const isGettingDirectory = useSelector((state: TRedux) => state.kappa.isGettingDirectory);
  const getDirectoryError = useSelector((state: TRedux) => state.kappa.getDirectoryError);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);
  const isGettingExcuses = useSelector((state: TRedux) => state.kappa.isGettingExcuses);
  const getExcusesError = useSelector((state: TRedux) => state.kappa.getExcusesError);
  const getDirectoryErrorMessage = useSelector((state: TRedux) => state.kappa.getDirectoryErrorMessage);

  const [refreshing, setRefreshing] = React.useState<boolean>(
    isGettingEvents || isGettingDirectory || isGettingAttendance
  );

  const dispatch = useDispatch();
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetMyAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getMyAttendance(user, overwrite)),
    [dispatch, user]
  );
  const dispatchGetDirectory = React.useCallback(() => dispatch(_kappa.getDirectory(user)), [dispatch, user]);
  const dispatchGetExcuses = React.useCallback(() => dispatch(_kappa.getExcuses(user)), [dispatch, user]);
  const dispatchSelectUser = React.useCallback((email: string) => dispatch(_kappa.selectUser(email)), [dispatch]);

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

  const keyExtractor = (item: TUser) => item._id;

  const renderItem = ({ item }: { item: TUser }) => {
    return (
      <React.Fragment>
        <TouchableOpacity onPress={() => dispatchSelectUser(item.email)}>
          <View style={styles.userContainer}>
            <View style={styles.userHeader}>
              <View style={styles.selectIcon}>
                <Text style={styles.userRole}>{item.role}</Text>
                <Icon family="MaterialIcons" name="keyboard-arrow-right" size={36} color={theme.COLORS.PRIMARY} />
              </View>
            </View>

            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>
                {item.familyName}, {item.givenName}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Brothers">
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

      <View style={styles.content}>
        <FlatList
          ref={(ref) => (scrollRef.current = ref)}
          data={Object.values(directory).sort(sortUserByName)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={
            <React.Fragment>
              <Text style={styles.errorMessage}>{getDirectoryErrorMessage || 'No users'}</Text>
            </React.Fragment>
          }
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
    marginLeft: 8
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
  separator: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  userContainer: {
    marginHorizontal: 16,
    height: 48,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  userHeader: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  userName: {
    fontFamily: 'OpenSans',
    fontSize: 16,
    color: theme.COLORS.BLACK
  },
  userNameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    backgroundColor: theme.COLORS.WHITE
  },
  mandatoryIcon: {
    marginLeft: 4
  },
  userRole: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  },
  selectIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorMessage: {
    marginTop: '40vh',
    textAlign: 'center',
    fontFamily: 'OpenSans'
  }
});

export default DirectoryContent;
