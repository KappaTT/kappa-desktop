import React from 'react';
import { StyleSheet, View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa, _nav } from '@reducers/actions';
import { TEvent } from '@backend/kappa';
import { theme } from '@constants';
import { HEADER_HEIGHT, isEmpty } from '@services/utils';
import {
  shouldLoad,
  sortEventsByDateReverse,
  prettyPhone,
  getAttendedEvents,
  getExcusedEvents,
  getTypeCounts
} from '@services/kappaService';
import { Header, Icon, HorizontalSegmentBar } from '@components';

const ProfileContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const isGettingEvents = useSelector((state: TRedux) => state.kappa.isGettingEvents);
  const getEventsError = useSelector((state: TRedux) => state.kappa.getEventsError);
  const gmCount = useSelector((state: TRedux) => state.kappa.gmCount);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);
  const missedMandatory = useSelector((state: TRedux) => state.kappa.missedMandatory);
  const points = useSelector((state: TRedux) => state.kappa.points);
  const isGettingPoints = useSelector((state: TRedux) => state.kappa.isGettingPoints);
  const getPointsError = useSelector((state: TRedux) => state.kappa.getPointsError);

  const attended = getAttendedEvents(records, user.email);
  const excused = getExcusedEvents(records, user.email);
  const gmCounts = getTypeCounts(events, attended, excused, 'GM');

  const dispatch = useDispatch();
  const dispatchEditUser = React.useCallback(() => dispatch(_kappa.editUser(user.email)), [dispatch, user.email]);
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetMyAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getMyAttendance(user, overwrite)),
    [dispatch, user]
  );
  const dispatchGetPoints = React.useCallback(() => dispatch(_kappa.getPointsByUser(user, user.email)), [
    dispatch,
    user
  ]);

  const refreshing = React.useMemo(() => isGettingEvents && isGettingAttendance && isGettingPoints, [
    isGettingAttendance,
    isGettingEvents,
    isGettingPoints
  ]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingEvents && (force || (!getEventsError && shouldLoad(loadHistory, 'events')))) dispatchGetEvents();
      if (!isGettingAttendance && (force || (!getAttendanceError && shouldLoad(loadHistory, `user-${user.email}`))))
        dispatchGetMyAttendance(force);
      if (!isGettingPoints && (force || (!getPointsError && shouldLoad(loadHistory, `points-${user.email}`))))
        dispatchGetPoints();
    },
    [
      isGettingEvents,
      getEventsError,
      loadHistory,
      dispatchGetEvents,
      isGettingAttendance,
      getAttendanceError,
      user.email,
      dispatchGetMyAttendance,
      isGettingPoints,
      getPointsError,
      dispatchGetPoints
    ]
  );

  const onRefresh = React.useCallback(() => {
    loadData(true);
  }, [loadData]);

  const chartData = React.useMemo(() => {
    return [
      { count: gmCounts.attended, label: 'Attended', color: theme.COLORS.PRIMARY },
      { count: gmCounts.excused, label: 'Excused', color: theme.COLORS.PRIMARY },
      { count: gmCounts.pending, label: 'Pending', color: theme.COLORS.INPUT_ERROR_LIGHT },
      {
        count: gmCount - gmCounts.attended - gmCounts.excused - gmCounts.pending,
        label: 'Absent',
        color: theme.COLORS.LIGHT_BORDER
      }
    ];
  }, [gmCounts.attended, gmCounts.excused, gmCounts.pending, gmCount]);

  const mandatory = React.useMemo(() => {
    if (!user.privileged) return [];

    if (isEmpty(missedMandatory[user.email])) return [];

    return Object.values(missedMandatory[user.email]).sort(sortEventsByDateReverse);
  }, [user, missedMandatory]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  return (
    <View style={styles.container}>
      <Header title="Profile" subtitle={`${user.familyName}, ${user.givenName}`} subtitleIsPressable={false}>
        <View style={styles.headerChildren}>
          <Text style={styles.roleText}>{user.role}</Text>

          <View style={styles.headerButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={dispatchEditUser}>
              <Text style={styles.headerButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

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
        <Text style={[styles.headingText, { marginTop: 0 }]}>Standing</Text>

        <View style={styles.splitPropertyRow}>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Freshman Year</Text>
            <Text style={styles.propertyValue}>{user.firstYear}</Text>
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Grad Year</Text>
            <Text style={styles.propertyValue}>{user.gradYear}</Text>
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Pledge Class</Text>
            <Text style={styles.propertyValue}>{user.semester}</Text>
          </View>
        </View>

        <Text style={styles.headingText}>Contact</Text>

        <View style={styles.splitPropertyRow}>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Email</Text>
            <Text style={styles.propertyValue}>{user.email}</Text>
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Phone</Text>
            <Text style={styles.propertyValue}>{prettyPhone(user.phone)}</Text>
          </View>
        </View>

        <Text style={styles.headingText}>Points and GM Attendance</Text>

        <View style={styles.splitPropertyRow}>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Prof</Text>
            {isGettingPoints ? (
              <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
            ) : (
              <Text style={styles.propertyValue}>
                {points.hasOwnProperty(user.email) ? points[user.email].PROF : '0'}
              </Text>
            )}
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Phil</Text>
            {isGettingPoints ? (
              <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
            ) : (
              <Text style={styles.propertyValue}>
                {points.hasOwnProperty(user.email) ? points[user.email].PHIL : '0'}
              </Text>
            )}
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Bro</Text>
            {isGettingPoints ? (
              <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
            ) : (
              <Text style={styles.propertyValue}>
                {points.hasOwnProperty(user.email) ? points[user.email].BRO : '0'}
              </Text>
            )}
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Rush</Text>
            {isGettingPoints ? (
              <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
            ) : (
              <Text style={styles.propertyValue}>
                {points.hasOwnProperty(user.email) ? points[user.email].RUSH : '0'}
              </Text>
            )}
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Any</Text>
            {isGettingPoints ? (
              <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
            ) : (
              <Text style={styles.propertyValue}>
                {points.hasOwnProperty(user.email) ? points[user.email].ANY : '0'}
              </Text>
            )}
          </View>

          <View style={styles.chartArea}>
            <HorizontalSegmentBar data={chartData} />
          </View>
        </View>

        {!isGettingAttendance && mandatory.length > 0 && (
          <React.Fragment>
            <Text style={styles.mandatoryHeaderText}>Missed Mandatory</Text>

            <View style={styles.mandatoryContainer}>
              {mandatory.map((event: TEvent) => (
                <View key={event._id} style={styles.eventContainer}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{moment(event.start).format('M/D/Y')}</Text>
                </View>
              ))}
            </View>
          </React.Fragment>
        )}
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
    bottom: 0,
    padding: 16
  },
  roleText: {
    position: 'absolute',
    left: 0,
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  },
  headingText: {
    marginTop: 24,
    marginBottom: 8,
    fontFamily: 'OpenSans-Bold',
    fontSize: 20
  },
  propertyWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  propertyIcon: {
    marginLeft: 8
  },
  propertyText: {
    marginLeft: 4,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13
  },
  splitPropertyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  splitProperty: {
    marginRight: 24
  },
  propertyHeader: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyValue: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  propertyLoader: {
    alignSelf: 'flex-start'
  },
  chartArea: {
    marginLeft: 16,
    flex: 1
  },
  description: {
    marginTop: 2,
    fontFamily: 'OpenSans',
    fontSize: 12
  },
  mandatoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  mandatoryHeaderText: {
    marginTop: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.PRIMARY
  },
  eventContainer: {
    marginRight: 16,
    height: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  eventTitle: {
    fontFamily: 'OpenSans',
    fontSize: 16
  },
  eventDate: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  }
});

export default ProfileContent;
