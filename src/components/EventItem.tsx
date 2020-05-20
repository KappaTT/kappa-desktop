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
import { TEvent, TRecords } from '@backend/kappa';
import RoundButton from '@components/RoundButton';
import Icon from '@components/Icon';
import Switch from '@components/Switch';

const EventItem: React.FC<{ user: TUser; records: TRecords; event: TEvent }> = ({ user, records, event }) => {
  const dispatch = useDispatch();
  const dispatchSelectEvent = React.useCallback(() => dispatch(_kappa.selectEvent(event._id)), [dispatch, event]);

  return (
    <TouchableOpacity onPress={dispatchSelectEvent}>
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
    </TouchableOpacity>
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
