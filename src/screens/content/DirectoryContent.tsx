import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused, NavigationProp } from '@react-navigation/native';

import { TRedux } from '@reducers';
import { _kappa, _nav } from '@reducers/actions';
import { TUser } from '@backend/auth';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { shouldLoad } from '@services/kappaService';
import { Header, Icon, BrotherItem } from '@components';

const DirectoryContent: React.FC<{
  navigation: NavigationProp<any, 'Directory'>;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const directoryArray = useSelector((state: TRedux) => state.kappa.directoryArray);
  const isGettingEvents = useSelector((state: TRedux) => state.kappa.isGettingEvents);
  const getEventsError = useSelector((state: TRedux) => state.kappa.getEventsError);
  const isGettingDirectory = useSelector((state: TRedux) => state.kappa.isGettingDirectory);
  const getDirectoryError = useSelector((state: TRedux) => state.kappa.getDirectoryError);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);
  const isGettingExcuses = useSelector((state: TRedux) => state.kappa.isGettingExcuses);
  const getExcusesError = useSelector((state: TRedux) => state.kappa.getExcusesError);
  const getDirectoryErrorMessage = useSelector((state: TRedux) => state.kappa.getDirectoryErrorMessage);

  const dispatch = useDispatch();
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetMyAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getMyAttendance(user, overwrite)),
    [dispatch, user]
  );
  const dispatchGetDirectory = React.useCallback(() => dispatch(_kappa.getDirectory(user)), [dispatch, user]);
  const dispatchGetExcuses = React.useCallback(() => dispatch(_kappa.getExcuses(user)), [dispatch, user]);
  const dispatchEditNewUser = React.useCallback(() => dispatch(_kappa.editNewUser()), [dispatch]);
  const dispatchSetSelectedPage = React.useCallback((routeName) => dispatch(_nav.setSelectedPage(routeName)), [
    dispatch
  ]);

  const scrollRef = React.useRef(undefined);

  const refreshing = React.useMemo(() => isGettingEvents || isGettingDirectory || isGettingAttendance, [
    isGettingAttendance,
    isGettingDirectory,
    isGettingEvents
  ]);

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
    loadData(true);
  }, [loadData]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  React.useEffect(() => {
    if (isFocused) {
      dispatchSetSelectedPage('Directory');
    }
  }, [dispatchSetSelectedPage, isFocused]);

  const keyExtractor = React.useCallback((item: TUser) => item._id, []);

  const renderItem = ({ item }: { item: TUser }) => {
    return (
      <React.Fragment>
        <BrotherItem brother={item} />
      </React.Fragment>
    );
  };

  const [searchState, setSearchState] = React.useState({
    searchText: '',
    filteredData: []
  });

  const search = (searchText) => {
    let filteredData = directoryArray.filter(function (item) {
      const fullName = item.givenName.toLowerCase() + ' ' + item.familyName.toLowerCase();
      return (
        fullName.includes(searchText.toLowerCase()) ||
        item.phone.includes(searchText.toLowerCase()) ||
        item.email.includes(searchText.toLowerCase())
      );
    });

    setSearchState({ searchText: searchText, filteredData: filteredData });
  };

  return (
    <View style={styles.container}>
      <Header title="Brothers">
        <View style={styles.headerChildren}>
          <View style={styles.headerSearchBarContainer}>
            <SearchBar
              round={true}
              autoCapitalize="none"
              autoCorrect={false}
              lightTheme={true}
              placeholder="Search Brothers..."
              containerStyle={{
                backgroundColor: 'transparent',
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent'
              }}
              inputContainerStyle={{
                backgroundColor: 'transparent',
                height: 35
              }}
              inputStyle={{
                fontSize: 14
              }}
              onChangeText={(searchText) => search(searchText)}
              value={searchState.searchText}
            />
          </View>

          {user.role.toLowerCase() === 'web' && (
            <View style={styles.headerButtonContainer}>
              <TouchableOpacity activeOpacity={0.6} onPress={dispatchEditNewUser}>
                <Text style={styles.headerButtonText}>New Brother</Text>
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
        <FlatList
          ref={(ref) => (scrollRef.current = ref)}
          data={
            searchState.filteredData && searchState.filteredData.length > 0 ? searchState.filteredData : directoryArray
          }
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
  },
  separator: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  mandatoryIcon: {
    marginLeft: 4
  },
  errorMessage: {
    marginTop: '40vh',
    textAlign: 'center',
    fontFamily: 'OpenSans'
  },
  headerSearchBarContainer: {
    marginTop: 8,
    marginBottom: 8
  }
});

export default DirectoryContent;
