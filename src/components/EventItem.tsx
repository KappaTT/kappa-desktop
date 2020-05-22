import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import HorizontalSegmentBar from '@components/HorizontalSegmentBar';
import GeneralMeetingChart from './GeneralMeetingChart';

const EventItem: React.FC<{ event: TEvent }> = ({ event }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const directorySize = useSelector((state: TRedux) => state.kappa.directorySize);
  const missedMandatory = useSelector((state: TRedux) => state.kappa.missedMandatory);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);
  const isDeletingEvent = useSelector((state: TRedux) => state.kappa.isDeletingEvent);

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
  const dispatchEditEvent = React.useCallback(() => dispatch(_kappa.editExistingEvent(event._id)), [
    dispatch,
    event._id
  ]);
  const dispatchDeleteEvent = React.useCallback(() => dispatch(_kappa.deleteEvent(user, event)), [
    dispatch,
    event,
    user
  ]);

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

  const attended = getAttendance(records, user.email, event._id);

  const excused = getExcuse(records, user.email, event._id);

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

  const excuseDisabled = React.useMemo(() => {
    return excused !== undefined || attended !== undefined;
  }, [attended, excused]);

  const checkInDisabled = React.useMemo(() => {
    return attended !== undefined || !moment(event.start).isSame(moment(), 'day');
  }, [attended, event.start]);

  React.useEffect(() => {
    if (expanded) {
      loadData(false);
    }
  }, [expanded, loadData]);

  const renderExpanded = () => {
    return (
      <View style={styles.expandedContent}>
        <View style={styles.splitPropertyRow}>
          <View style={[styles.splitProperty, { marginLeft: 0 }]}>
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
          )}
        </View>

        {user.privileged && (
          <View style={styles.expandedAdminContainer}>
            <View style={styles.dangerZoneContainer}>
              <View style={styles.dangerZone}>
                <View style={styles.editZone}>
                  <View style={styles.warning}>
                    <Text style={styles.zoneLabel}>Edit this event</Text>
                    <Text style={styles.description}>
                      Edits to events will only show up when users refresh. Please make sure you have refreshed the
                      latest event details before editing.
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => {}}>
                    <Icon style={styles.zoneIcon} family="Feather" name="edit" size={32} color={theme.COLORS.PRIMARY} />
                  </TouchableOpacity>
                </View>
                <View style={styles.deleteZone}>
                  <View style={styles.warning}>
                    <Text style={styles.zoneLabel}>Delete this event</Text>
                    <Text style={styles.description}>
                      Deleting an event will delete all associated points, attendance and excuse records. Please double
                      check and be certain this is the event you want to delete.
                    </Text>
                  </View>

                  {isDeletingEvent ? (
                    <ActivityIndicator style={styles.zoneIcon} />
                  ) : (
                    <TouchableOpacity
                      style={!readyToDelete && styles.disabledButton}
                      disabled={!readyToDelete}
                      onPress={dispatchDeleteEvent}
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
                <View style={styles.enableDeleteContainer}>
                  <Switch value={readyToDelete} onValueChange={(newValue: boolean) => setReadyToDelete(newValue)} />
                  <Text style={styles.readyToDelete}>I am ready to delete this event</Text>
                </View>
              </View>
            </View>
            <View style={styles.chartArea}>
              <GeneralMeetingChart
                isGettingAttendance={isGettingAttendance}
                email={'jjt4@illinois.edu'}
                records={records}
                events={events}
                gmCount={100}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.eventContainer}>
      <View style={styles.eventRow}>
        <View style={styles.eventContent}>
          <TouchableOpacity activeOpacity={0.4} onPress={onPressExpand}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{moment(event.start).format('h:mm A')}</Text>

              {event.mandatory && (
                <View style={styles.propertyWrapper}>
                  <Icon
                    style={styles.propertyIcon}
                    family="Feather"
                    name="alert-circle"
                    size={16}
                    color={theme.COLORS.PRIMARY}
                  />

                  <Text style={[styles.propertyText, { color: theme.COLORS.PRIMARY }]}>Mandatory</Text>
                </View>
              )}

              {attended !== undefined && (
                <View style={styles.propertyWrapper}>
                  <Icon
                    style={styles.propertyIcon}
                    family="Feather"
                    name="check"
                    size={16}
                    color={theme.COLORS.PRIMARY_GREEN}
                  />

                  <Text style={[styles.propertyText, { color: theme.COLORS.PRIMARY_GREEN }]}>Checked In</Text>
                </View>
              )}

              {excused !== undefined && excused.approved && (
                <View style={styles.propertyWrapper}>
                  <Icon
                    style={styles.propertyIcon}
                    family="Feather"
                    name="check"
                    size={16}
                    color={theme.COLORS.PRIMARY_GREEN}
                  />

                  <Text style={[styles.propertyText, { color: theme.COLORS.PRIMARY_GREEN }]}>Excused</Text>
                </View>
              )}

              {excused !== undefined && !excused.approved && (
                <View style={styles.propertyWrapper}>
                  <Icon
                    style={styles.propertyIcon}
                    family="Feather"
                    name="clock"
                    size={16}
                    color={theme.COLORS.YELLOW_GRADIENT_END}
                  />

                  <Text style={[styles.propertyText, { color: theme.COLORS.YELLOW_GRADIENT_END }]}>
                    Excuse under review
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.eventDescriptionWrapper}>
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          <View style={styles.checkInButton}>
            <RoundButton label="Check In" alt={true} disabled={checkInDisabled} />
          </View>

          <TouchableOpacity disabled={excuseDisabled}>
            <Text
              style={[
                styles.requestExcuseText,
                excuseDisabled && {
                  opacity: 0.4
                }
              ]}
            >
              Request Excuse
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {expanded && renderExpanded()}
    </View>
  );
};

const styles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16
  },
  eventRow: {
    width: '100%',
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  eventContent: {
    flex: 1
  },
  checkInButton: {
    marginBottom: 8
  },
  requestExcuseText: {
    height: '100%',
    textAlign: 'center',
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 14,
    color: theme.COLORS.PRIMARY
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
  eventDescriptionWrapper: {
    marginTop: 8
  },
  eventDescription: {
    fontFamily: 'OpenSans',
    fontSize: 15
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
  expandedAdminContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  chartArea: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dangerZoneContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  dangerZone: {
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
  description: {
    marginTop: 2,
    fontFamily: 'OpenSans',
    fontSize: 12
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
  },
  disabledButton: {
    opacity: 0.4
  }
});

export default EventItem;
