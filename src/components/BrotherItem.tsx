import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Clipboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { TToast } from '@reducers/ui';
import { _auth, _kappa, _ui } from '@reducers/actions';
import {
  prettyPoints,
  shouldLoad,
  sortEventsByDateReverse,
  prettyPhone,
  getAttendedEvents,
  getExcusedEvents,
  getTypeCounts
} from '@services/kappaService';
import { theme } from '@constants';
import { TUser } from '@backend/auth';
import { TEvent } from '@backend/kappa';
import { isEmpty } from '@services/utils';
import HorizontalSegmentBar from '@components/HorizontalSegmentBar';
import Icon from '@components/Icon';
import Switch from '@components/Switch';

const BrotherItem: React.FC<{ brother: TUser }> = ({ brother }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const gmCount = useSelector((state: TRedux) => state.kappa.gmCount);
  const missedMandatory = useSelector((state: TRedux) => state.kappa.missedMandatory);
  const points = useSelector((state: TRedux) => state.kappa.points);
  const isGettingPoints = useSelector((state: TRedux) => state.kappa.isGettingPoints);
  const getPointsError = useSelector((state: TRedux) => state.kappa.getPointsError);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);
  const isDeletingUser = useSelector((state: TRedux) => state.kappa.isDeletingUser);

  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [readyToDelete, setReadyToDelete] = React.useState<boolean>(false);

  const attended = getAttendedEvents(records, brother.email);
  const excused = getExcusedEvents(records, brother.email);
  const gmCounts = getTypeCounts(events, attended, excused, 'GM');

  const isWebChair = React.useMemo(() => user.role?.toLowerCase() === 'web', [user.role]);

  const dispatch = useDispatch();
  const dispatchGetAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getUserAttendance(user, brother.email, overwrite)),
    [dispatch, user, brother.email]
  );
  const dispatchGetPoints = React.useCallback(() => dispatch(_kappa.getPointsByUser(user, brother.email)), [
    dispatch,
    user,
    brother.email
  ]);
  const dispatchEditUser = React.useCallback(() => dispatch(_kappa.editUser(brother.email)), [brother.email, dispatch]);
  const dispatchDeleteUser = React.useCallback(() => dispatch(_kappa.deleteUser(user, brother.email)), [
    dispatch,
    brother.email,
    user
  ]);
  const dispatchShowToast = React.useCallback((toast: Partial<TToast>) => dispatch(_ui.showToast(toast)), [dispatch]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (user.privileged) {
        if (
          !isGettingAttendance &&
          (force || (!getAttendanceError && shouldLoad(loadHistory, `user-${brother.email}`)))
        )
          dispatchGetAttendance(force);
        if (!isGettingPoints && (force || (!getPointsError && shouldLoad(loadHistory, `points-${brother.email}`))))
          dispatchGetPoints();

        setReadyToDelete(false);
      }
    },
    [
      user.privileged,
      isGettingAttendance,
      getAttendanceError,
      loadHistory,
      brother.email,
      dispatchGetAttendance,
      isGettingPoints,
      getPointsError,
      dispatchGetPoints
    ]
  );

  const onPressExpand = React.useCallback(() => {
    setExpanded(!expanded);
    setReadyToDelete(false);
  }, [expanded]);

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

    if (isEmpty(missedMandatory[brother.email])) return [];

    return Object.values(missedMandatory[brother.email]).sort(sortEventsByDateReverse);
  }, [user.privileged, missedMandatory, brother.email]);

  const onPressEmail = React.useCallback(() => {
    Clipboard.setString(brother.email);

    dispatchShowToast({
      title: 'Copied',
      message: 'The email was saved to your clipboard',
      allowClose: true,
      timer: 1500,
      toastColor: theme.COLORS.PRIMARY_GREEN,
      textColor: theme.COLORS.WHITE,
      showBackdrop: false
    });
  }, [brother.email, dispatchShowToast]);

  const onPressPhone = React.useCallback(() => {
    Clipboard.setString(brother.phone);

    dispatchShowToast({
      title: 'Copied',
      message: 'The phone number was saved to your clipboard',
      allowClose: true,
      timer: 1500,
      toastColor: theme.COLORS.PRIMARY_GREEN,
      textColor: theme.COLORS.WHITE,
      showBackdrop: false
    });
  }, [brother.phone, dispatchShowToast]);

  const onChangeReadyToDelete = React.useCallback((newValue: boolean) => {
    setReadyToDelete(newValue);
  }, []);

  React.useEffect(() => {
    if (expanded) {
      loadData(false);
    }
  }, [expanded, loadData]);

  const renderExpanded = () => {
    return (
      <View style={styles.expandedContent}>
        <View style={styles.splitPropertyRow}>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Grad Year</Text>
            <Text style={styles.propertyValue}>{brother.gradYear}</Text>
          </View>
          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Pledge Class</Text>
            <Text style={styles.propertyValue}>{brother.semester}</Text>
          </View>
          <View style={styles.splitProperty}>
            <TouchableOpacity activeOpacity={0.6} onPress={onPressEmail}>
              <Text style={styles.propertyHeader}>Email</Text>
              <Text style={styles.propertyValue}>{brother.email}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.splitProperty}>
            <TouchableOpacity activeOpacity={0.6} onPress={onPressPhone}>
              <Text style={styles.propertyHeader}>Phone</Text>
              <Text style={styles.propertyValue}>{prettyPhone(brother.phone)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {user.privileged && (
          <React.Fragment>
            <View style={[styles.splitPropertyRow, { marginTop: 12 }]}>
              <View style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Prof</Text>
                {isGettingPoints ? (
                  <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
                ) : (
                  <Text style={styles.propertyValue}>
                    {points.hasOwnProperty(brother.email) ? points[brother.email].PROF : '0'}
                  </Text>
                )}
              </View>
              <View style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Phil</Text>
                {isGettingPoints ? (
                  <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
                ) : (
                  <Text style={styles.propertyValue}>
                    {points.hasOwnProperty(brother.email) ? points[brother.email].PHIL : '0'}
                  </Text>
                )}
              </View>
              <View style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Bro</Text>
                {isGettingPoints ? (
                  <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
                ) : (
                  <Text style={styles.propertyValue}>
                    {points.hasOwnProperty(brother.email) ? points[brother.email].BRO : '0'}
                  </Text>
                )}
              </View>
              <View style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Rush</Text>
                {isGettingPoints ? (
                  <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
                ) : (
                  <Text style={styles.propertyValue}>
                    {points.hasOwnProperty(brother.email) ? points[brother.email].RUSH : '0'}
                  </Text>
                )}
              </View>
              <View style={styles.splitProperty}>
                <Text style={styles.propertyHeader}>Any</Text>
                {isGettingPoints ? (
                  <ActivityIndicator style={styles.propertyLoader} color={theme.COLORS.PRIMARY} />
                ) : (
                  <Text style={styles.propertyValue}>
                    {points.hasOwnProperty(brother.email) ? points[brother.email].ANY : '0'}
                  </Text>
                )}
              </View>

              <View style={styles.chartArea}>
                <HorizontalSegmentBar data={chartData} />
              </View>
            </View>

            <View style={styles.dangerZone}>
              <View style={styles.editZone}>
                <View style={styles.warning}>
                  <Text style={styles.zoneLabel}>Edit this user</Text>
                  <Text style={styles.description}>
                    Edits to this user will only show up when users refresh. Please make sure you have refreshed the
                    latest user details before editing.
                  </Text>
                </View>

                <TouchableOpacity disabled={isDeletingUser} onPress={dispatchEditUser}>
                  <Icon style={styles.zoneIcon} family="Feather" name="edit" size={32} color={theme.COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>
              <View style={styles.deleteZone}>
                <View style={styles.warning}>
                  <Text style={styles.zoneLabel}>Delete this user</Text>
                  {!isWebChair ? (
                    <Text style={styles.description}>Contact the web chair to delete users!</Text>
                  ) : (
                    <Text style={styles.description}>
                      Deleting a user will delete all associated points, attendance and excuse records. Please double
                      check and be certain this is the user you want to delete.
                    </Text>
                  )}
                </View>

                {isDeletingUser ? (
                  <ActivityIndicator style={styles.zoneIcon} color={theme.COLORS.PRIMARY} />
                ) : (
                  <TouchableOpacity
                    style={!readyToDelete && styles.disabledButton}
                    disabled={!readyToDelete || !isWebChair}
                    onPress={dispatchDeleteUser}
                  >
                    <Icon
                      style={styles.zoneIcon}
                      family="Feather"
                      name="trash-2"
                      size={32}
                      color={theme.COLORS.PRIMARY}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {isWebChair && (
                <View style={styles.enableDeleteContainer}>
                  <Switch value={readyToDelete} onValueChange={onChangeReadyToDelete} />
                  <Text style={styles.readyToDelete}>I am ready to delete this user</Text>
                </View>
              )}
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
          </React.Fragment>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.4} onPress={onPressExpand}>
        <View style={styles.userContainer}>
          <View style={styles.userHeader}>
            <View style={styles.selectIcon}>
              <Text style={styles.userRole}>{brother.role}</Text>
              <Icon family="MaterialIcons" name="keyboard-arrow-right" size={36} color={theme.COLORS.PRIMARY} />
            </View>
          </View>

          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>
              {brother.familyName}, {brother.givenName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && renderExpanded()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  userContainer: {
    height: 48
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
  expandedContent: {
    marginBottom: 16
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
  disabledButton: {
    opacity: 0.4
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
  enableDeleteContainer: {
    marginTop: 8,
    marginLeft: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  readyToDelete: {
    marginLeft: 8,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13
  }
});

export default BrotherItem;
