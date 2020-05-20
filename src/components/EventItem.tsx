import React from 'react';
import { StyleSheet, Animated, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import {
  hasValidCheckIn,
  getAttendance,
  getExcuse,
  getEventRecordCounts,
  getMissedMandatoryByEvent,
  sortUserByName,
  prettyPoints,
  shouldLoad
} from '@services/kappaService';
import { theme } from '@constants';
import { TUser } from '@backend/auth';
import { TEvent } from '@backend/kappa';
import RoundButton from '@components/RoundButton';
import Icon from '@components/Icon';
import Switch from '@components/Switch';

const EventItem: React.FC<{ event: TEvent }> = ({ event }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const directorySize = useSelector((state: TRedux) => state.kappa.directorySize);
  const missedMandatory = useSelector((state: TRedux) => state.kappa.missedMandatory);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);

  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [readyToDelete, setReadyToDelete] = React.useState<boolean>(false);

  const dispatch = useDispatch();
  const dispatchSelectEvent = React.useCallback(() => dispatch(_kappa.selectEvent(event._id)), [dispatch, event._id]);
  const dispatchUnselectEvent = React.useCallback(() => dispatch(_kappa.unselectEvent()), [dispatch]);
  const dispatchGetAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getEventAttendance(user, event._id, overwrite)),
    [dispatch, user, event._id]
  );
  const dispatchGetMyAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getMyAttendance(user, overwrite)),
    [dispatch, user]
  );

  const loadData = React.useCallback(
    (force: boolean) => {
      if (user.privileged) {
        if (!isGettingAttendance && (force || (!getAttendanceError && shouldLoad(loadHistory, `event-${event._id}`)))) {
          dispatchGetAttendance(force);
        }

        setReadyToDelete(false);
      } else {
        if (!isGettingAttendance && (force || (!getAttendanceError && shouldLoad(loadHistory, `user-${user.email}`)))) {
          dispatchGetMyAttendance(force);
        }
      }
    },
    [
      user.privileged,
      user.email,
      isGettingAttendance,
      getAttendanceError,
      loadHistory,
      event._id,
      dispatchGetAttendance,
      dispatchGetMyAttendance
    ]
  );

  const onPressExpand = React.useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const attended = React.useMemo(() => {
    return getAttendance(records, user.email, event._id);
  }, [event._id, records, user.email]);

  const excused = React.useMemo(() => {
    return getExcuse(records, user.email, event._id);
  }, [event._id, records, user.email]);

  const recordCounts = getEventRecordCounts(records, event._id);

  const recordStats = React.useMemo(() => {
    const fraction = directorySize === 0 ? 0 : recordCounts.sum / directorySize;

    return {
      raw: fraction,
      percent: `${Math.round(fraction * 100)}%`
    };
  }, [recordCounts, directorySize]);

  const mandatory = React.useMemo(() => {
    if (!user.privileged) return [];

    if (event._id === '') return [];

    return Object.values(getMissedMandatoryByEvent(missedMandatory, directory, event._id)).sort(sortUserByName);
  }, [user, missedMandatory, directory, event._id]);

  return (
    <View style={styles.eventContainer}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>{moment(event.start).format('h:mm A')}</Text>

        {event.mandatory && (
          <Icon
            style={styles.mandatoryIcon}
            family="Feather"
            name="alert-circle"
            size={16}
            color={theme.COLORS.PRIMARY}
          />
        )}

        {hasValidCheckIn(records, user.email, event._id) && (
          <Icon style={styles.checkIcon} family="Feather" name="check" size={16} color={theme.COLORS.PRIMARY_GREEN} />
        )}
      </View>

      <View style={styles.eventDescriptionWrapper}>
        <Text style={styles.eventDescription}>{event.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16
  },
  eventHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap'
  },
  eventTitle: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13
  },
  eventDate: {
    marginLeft: 8,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  mandatoryIcon: {
    marginLeft: 8
  },
  checkIcon: {
    marginLeft: 8
  },
  eventDescriptionWrapper: {
    marginTop: 8,
    marginBottom: 12
  },
  eventDescription: {
    fontFamily: 'OpenSans',
    fontSize: 15
  }
});

export default EventItem;
