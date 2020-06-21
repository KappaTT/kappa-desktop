import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { prettyPoints, shouldLoad, sortEventsByDateReverse } from '@services/kappaService';
import { theme } from '@constants';
import { TUser } from '@backend/auth';
import { TEvent } from '@backend/kappa';
import { isEmpty } from '@services/utils';
import HorizontalSegmentBar from '@components/HorizontalSegmentBar';
import Icon from '@components/Icon';

const BrotherItem: React.FC<{ brother: TUser }> = ({ brother }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const gmCount = useSelector((state: TRedux) => state.kappa.gmCount);
  const missedMandatory = useSelector((state: TRedux) => state.kappa.missedMandatory);
  const points = useSelector((state: TRedux) => state.kappa.points);
  const isGettingPoints = useSelector((state: TRedux) => state.kappa.isGettingPoints);
  const getPointsError = useSelector((state: TRedux) => state.kappa.getPointsError);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);

  const [expanded, setExpanded] = React.useState<boolean>(false);

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
  }, [expanded]);

  //   const chartData = React.useMemo(() => {
  //     return [
  //       { count: recordCounts.attended, label: 'Attended', color: theme.COLORS.PRIMARY },
  //       { count: recordCounts.excused, label: 'Excused', color: theme.COLORS.PRIMARY },
  //       { count: recordCounts.pending, label: 'Pending', color: theme.COLORS.INPUT_ERROR_LIGHT },
  //       {
  //         count: directorySize - recordCounts.attended - recordCounts.excused - recordCounts.pending,
  //         label: 'Absent',
  //         color: theme.COLORS.LIGHT_BORDER
  //       }
  //     ];
  //   }, [recordCounts, directorySize]);

  const mandatory = React.useMemo(() => {
    if (!user.privileged) return [];

    if (isEmpty(missedMandatory[brother.email])) return [];

    return Object.values(missedMandatory[brother.email]).sort(sortEventsByDateReverse);
  }, [user.privileged, missedMandatory, brother.email]);

  React.useEffect(() => {
    if (expanded) {
      loadData(false);
    }
  }, [expanded, loadData]);

  const renderExpanded = () => {
    return (
      <View style={styles.expandedContent}>
        <View style={styles.splitPropertyRow}>
          {/* <View style={[styles.splitProperty, { marginLeft: 0 }]}>
            <Text style={styles.propertyHeader}>Location</Text>
            <Text style={styles.propertyValue}>{event.location}</Text>
          </View>

          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Duration</Text>
            <Text style={styles.propertyValue}>
              {event.duration < 60
                ? `${event.duration} minutes`
                : moment.duration(event.duration, 'minutes').humanize()}
            </Text>
          </View>

          <View style={styles.splitProperty}>
            <Text style={styles.propertyHeader}>Points</Text>
            <Text style={styles.propertyValue}>{prettyPoints(event.points)}</Text>
          </View>

          {user.privileged && (
            <View style={styles.splitProperty}>
              <Text style={styles.propertyHeader}>Check-In Code</Text>
              <Text style={styles.propertyValue}>{event.eventCode}</Text>
            </View>
          )} */}

          {/* {user.privileged && (
            <View style={styles.chartArea}>
              <HorizontalSegmentBar data={chartData} />
            </View>
          )} */}
        </View>

        {user.privileged && (
          <React.Fragment>
            {mandatory.length > 0 && (
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
    marginTop: 16
  },
  splitPropertyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  splitProperty: {
    marginLeft: 16,
    marginRight: 16
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
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
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

export default BrotherItem;
