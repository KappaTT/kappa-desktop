import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused, NavigationProp } from '@react-navigation/native';
import moment from 'moment';
import Constants from 'expo-constants';

import { TRedux } from '@reducers';
import { _kappa, _nav } from '@reducers/actions';
import { TEvent } from '@backend/kappa';
import { theme } from '@constants';
import { TPoints, POINTS_SO, GM_SO, POINTS_JR, GM_JR, POINTS_SR, GM_SR, getClassYear } from '@constants/Points';
import { LINK_LINKTREE } from '@constants/Links';
import { HEADER_HEIGHT, isEmpty } from '@services/utils';
import {
  shouldLoad,
  sortEventsByDateReverse,
  prettyPhone,
  getAttendedEvents,
  getExcusedEvents,
  getTypeCounts,
  isSecretCodeValid
} from '@services/kappaService';
import { Header, Icon, HorizontalSegmentBar, LinkContainer } from '@components';

const ProfileContent: React.FC<{
  navigation: NavigationProp<any, 'Profile'>;
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
  const isGettingDirectory = useSelector((state: TRedux) => state.kappa.isGettingDirectory);
  const getDirectoryError = useSelector((state: TRedux) => state.kappa.getDirectoryError);
  const isGeneratingSecretCode = useSelector((state: TRedux) => state.kappa.isGeneratingSecretCode);

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
  const dispatchGetDirectory = React.useCallback(() => dispatch(_kappa.getDirectory(user)), [dispatch, user]);
  const dispatchGenerateSecretCode = React.useCallback(() => dispatch(_kappa.generateSecretCode(user)), [
    dispatch,
    user
  ]);
  const dispatchSetSelectedPage = React.useCallback((routeName) => dispatch(_nav.setSelectedPage(routeName)), [
    dispatch
  ]);

  const refreshing = React.useMemo(() => isGettingEvents && isGettingAttendance && isGettingPoints, [
    isGettingAttendance,
    isGettingEvents,
    isGettingPoints
  ]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingEvents && (force || (!getEventsError && shouldLoad(loadHistory, 'events')))) dispatchGetEvents();
      if (!isGettingDirectory && (force || (!getDirectoryError && shouldLoad(loadHistory, 'directory'))))
        dispatchGetDirectory();
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
      isGettingDirectory,
      getDirectoryError,
      dispatchGetDirectory,
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

  const classYear = React.useMemo(() => getClassYear(user.firstYear), [user.firstYear]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  React.useEffect(() => {
    if (isFocused) {
      dispatchSetSelectedPage('Profile');
    }
  }, [dispatchSetSelectedPage, isFocused]);

  const renderRequirements = (points: TPoints, gm: number) => {
    return (
      <View style={styles.splitPropertyRow}>
        <View style={styles.splitProperty}>
          <Text style={styles.propertyHeader}>Prof</Text>
          <Text style={styles.propertyValue}>{points.PROF}</Text>
        </View>
        <View style={styles.splitProperty}>
          <Text style={styles.propertyHeader}>Phil</Text>
          <Text style={styles.propertyValue}>{points.PHIL}</Text>
        </View>
        <View style={styles.splitProperty}>
          <Text style={styles.propertyHeader}>Bro</Text>
          <Text style={styles.propertyValue}>{points.BRO}</Text>
        </View>
        <View style={styles.splitProperty}>
          <Text style={styles.propertyHeader}>Rush</Text>
          <Text style={styles.propertyValue}>{points.RUSH}</Text>
        </View>

        <View style={styles.splitProperty}>
          <Text style={styles.propertyHeader}>GM</Text>
          <Text style={styles.propertyValue}>{gm}%</Text>
        </View>
      </View>
    );
  };

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

        <Text style={styles.headingText}>Requirements</Text>

        <View style={styles.splitPropertyRow}>
          <View style={[styles.splitProperty, { opacity: classYear === 'FR' || classYear === 'SO' ? 1 : 0.4 }]}>
            <Text style={styles.subHeadingText}>Freshman and Sophomore</Text>

            {renderRequirements(POINTS_SO, GM_SO)}
          </View>

          <View style={[styles.splitProperty, { opacity: classYear === 'JR' ? 1 : 0.4 }]}>
            <Text style={styles.subHeadingText}>Junior</Text>

            {renderRequirements(POINTS_JR, GM_JR)}
          </View>

          <View style={[styles.splitProperty, { opacity: classYear === 'SR' ? 1 : 0.4 }]}>
            <Text style={styles.subHeadingText}>Senior</Text>

            {renderRequirements(POINTS_SR, GM_SR)}
          </View>
        </View>

        <Text style={styles.headingText}>Links</Text>

        <View style={styles.splitPropertyRow}>
          <View style={styles.splitProperty}>
            <LinkContainer link={LINK_LINKTREE}>
              <Text style={styles.propertyHeader}>Linktree</Text>
              <Text style={[styles.propertyValue, { color: theme.COLORS.PRIMARY }]} numberOfLines={1}>
                {LINK_LINKTREE || 'N/A'}
              </Text>
            </LinkContainer>
          </View>
        </View>

        <View style={styles.dangerZone}>
          <View style={styles.editZone}>
            <View style={styles.warning}>
              <Text style={styles.zoneLabel}>Sign in on mobile</Text>
              <Text style={styles.description}>
                If your phone does not support signing in with google, you can generate a unique sign in code. On your
                phone, please type the code to sign in. WARNING: do not share this code with anyone as it will allow
                them to sign into your account!
              </Text>
            </View>

            {isGeneratingSecretCode ? (
              <ActivityIndicator style={styles.zoneIcon} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity disabled={isGeneratingSecretCode} onPress={dispatchGenerateSecretCode}>
                <Text style={styles.zoneText}>
                  {isSecretCodeValid(user.secretCode, user.secretCodeExpiration) ? user.secretCode : 'Generate'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.madeWithText}>
          {`Whatsoever thy hand findeth to do, do it with thy might.\n\n${Constants.manifest.sdkVersion}\n\nJTC - Web Chair 2019-2021`}
        </Text>
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
  subHeadingText: {
    marginTop: 8,
    marginBottom: 8,
    fontFamily: 'OpenSans-Bold',
    fontSize: 14
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
  },
  dangerZone: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.INPUT_ERROR_LIGHT
  },
  editZone: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deleteZone: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  warning: {
    flex: 1,
    marginRight: 8
  },
  zoneLabel: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14
  },
  zoneIcon: {
    width: 32
  },
  zoneText: {
    paddingVertical: 16,
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    color: theme.COLORS.PRIMARY
  },
  madeWithText: {
    marginTop: 32,
    marginBottom: 8,
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.BORDER,
    textAlign: 'center'
  }
});

export default ProfileContent;
