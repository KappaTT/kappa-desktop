import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { TEvent } from '@backend/kappa';
import { TToast } from '@reducers/ui';
import { _kappa, _ui } from '@reducers/actions';
import { theme } from '@constants';
import { getEventById, hasValidCheckIn, sortEventByDate, shouldLoad } from '@services/kappaService';
import { Icon, RadioList, FormattedInput } from '@components';

const RequestExcusePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const checkInEventId = useSelector((state: TRedux) => state.kappa.checkInEventId);
  const isGettingEvents = useSelector((state: TRedux) => state.kappa.isGettingEvents);
  const getEventsError = useSelector((state: TRedux) => state.kappa.getEventsError);
  const isGettingAttendance = useSelector((state: TRedux) => state.kappa.isGettingAttendance);
  const getAttendanceError = useSelector((state: TRedux) => state.kappa.getAttendanceError);
  const isCreatingExcuse = useSelector((state: TRedux) => state.kappa.isCreatingExcuse);
  const createExcuseRequestDate = useSelector((state: TRedux) => state.kappa.createExcuseRequestDate);
  const createExcuseSuccessDate = useSelector((state: TRedux) => state.kappa.createExcuseSuccessDate);

  const initialEvent = checkInEventId === 'NONE' ? null : getEventById(events, checkInEventId);

  const [openDate, setOpenDate] = React.useState<moment.Moment>(moment());
  const [reason, setReason] = React.useState<string>('');
  const [selectedEvent, setSelectedEvent] = React.useState<TEvent>(initialEvent);

  const late = React.useMemo(() => {
    if (!selectedEvent) {
      return false;
    }

    return moment(selectedEvent.start).isBefore(openDate, 'day');
  }, [openDate, selectedEvent]);

  const dispatch = useDispatch();
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetMyAttendance = React.useCallback(
    (overwrite: boolean = false) => dispatch(_kappa.getMyAttendance(user, overwrite)),
    [dispatch, user]
  );
  const dispatchCreateExcuse = React.useCallback(
    () => dispatch(_kappa.createExcuse(user, selectedEvent, { reason, late })),
    [dispatch, user, selectedEvent, reason, late]
  );
  const dispatchShowToast = React.useCallback((toast: Partial<TToast>) => dispatch(_ui.showToast(toast)), [dispatch]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingEvents && (force || (!getEventsError && shouldLoad(loadHistory, 'events')))) dispatchGetEvents();
      if (!isGettingAttendance && (force || (!getAttendanceError && shouldLoad(loadHistory, `user-${user.email}`))))
        dispatchGetMyAttendance(force);
    },
    [
      dispatchGetEvents,
      dispatchGetMyAttendance,
      getAttendanceError,
      getEventsError,
      isGettingAttendance,
      isGettingEvents,
      loadHistory,
      user.email
    ]
  );

  const readyStateEvent = React.useMemo(() => {
    return selectedEvent !== null;
  }, [selectedEvent]);

  const readyStateReason = React.useMemo(() => {
    return reason.trim().length > 0;
  }, [reason]);

  const readyToSubmit = React.useMemo(() => readyStateEvent && readyStateReason, [readyStateEvent, readyStateReason]);

  const eventOptions = React.useMemo(() => {
    return eventArray
      .filter((event) => !hasValidCheckIn(records, user.email, event._id, true))
      .sort(sortEventByDate)
      .map((event) => ({
        id: event._id,
        title: moment(event.start).isBefore(openDate, 'day') ? event.title + ' (Late)' : event.title,
        subtitle: moment(event.start).format('ddd LLL')
      }));
  }, [eventArray, openDate, records, user.email]);

  const onChangeEventId = React.useCallback(
    (chosen: string) => {
      setSelectedEvent(getEventById(events, chosen));
    },
    [events]
  );

  const onChangeReason = React.useCallback((text: string) => {
    setReason(text);
  }, []);

  React.useEffect(() => {
    if (
      createExcuseRequestDate !== null &&
      createExcuseSuccessDate !== null &&
      createExcuseRequestDate.isAfter(openDate) &&
      createExcuseSuccessDate.isAfter(createExcuseRequestDate)
    ) {
      dispatchShowToast({
        title: 'Success',
        message: 'Your excuse has been submitted!',
        allowClose: true,
        timer: 2000,
        toastColor: theme.COLORS.PRIMARY_GREEN,
        textColor: theme.COLORS.WHITE,
        showBackdrop: false
      });

      onPressCancel();
    }
  }, [openDate, dispatchShowToast, onPressCancel, createExcuseRequestDate, createExcuseSuccessDate]);

  React.useEffect(() => {
    if (!initialEvent) {
      loadData(false);
    }
  }, [initialEvent, loadData]);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isCreatingExcuse} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Request{late ? ' Late ' : ' '}Excuse</Text>
        </View>

        <View style={styles.saveWrapper}>
          {isCreatingExcuse ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSubmit ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSubmit}
              onPress={dispatchCreateExcuse}
            >
              <Text style={styles.saveText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderEventSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Event</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            {eventOptions.length > 0 ? (
              <React.Fragment>
                <RadioList
                  options={eventOptions}
                  selected={selectedEvent ? selectedEvent._id : ''}
                  onChange={onChangeEventId}
                />

                <Text style={styles.description}>
                  You may only check into an event on the same day it happened. If you forgot to check in and it is the
                  same day, you can still submit the code. If it isn't, please send a late request and the exec board
                  will consider it. Regular excuses must be requested before an event.
                </Text>
              </React.Fragment>
            ) : (
              <Text style={styles.description}>
                No events available to check in or request excuses for. You may only check into an event on the same day
                it happened. If you forgot to check in and it is the same day, you can still submit the code. If it
                isn't, please send a late request and the exec board will consider it. Regular excuses must be requested
                before an event otherwise.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderReasonSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Reason</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              style={styles.multilineInput}
              placeholderText="ex: I have an exam"
              maxLength={256}
              multiline={true}
              numberOfLines={6}
              value={reason}
              onChangeText={onChangeReason}
            />

            {late && (
              <React.Fragment>
                <Text style={styles.description}>
                  Submit a special request if you were unable to submit an excuse beforehand but had a valid excuse or
                  if you missed the check in but attended the event. Please provide any details that you think we should
                  consider. We may not be able to approve all requests but we will try to be as understanding as
                  possible!
                </Text>
                <Text style={styles.description}>
                  Example: I couldn't submit the code due to bad reception at Legends, but this was the code: 1234
                </Text>
              </React.Fragment>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDivider = (readyStatus: boolean) => {
    return (
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
        <Icon
          style={styles.dividerIcon}
          family="Feather"
          name="arrow-right-circle"
          size={20}
          color={readyStatus ? theme.COLORS.PRIMARY : theme.COLORS.BORDER}
        />
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{renderHeader()}</View>

      <View style={styles.content}>
        <View style={styles.section}>{renderEventSection()}</View>

        {renderDivider(readyStateEvent)}

        <View
          pointerEvents={!readyStateEvent ? 'none' : 'auto'}
          style={[styles.section, !readyStateEvent && { opacity: 0.6 }]}
        >
          {renderReasonSection()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    position: 'absolute',
    height: 44,
    top: 0,
    left: 0,
    right: 0,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontFamily: 'OpenSans',
    fontSize: 16
  },
  subtitleText: {
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
  },
  saveWrapper: {
    position: 'absolute',
    right: 0
  },
  saveText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.PRIMARY
  },
  saveLoader: {
    paddingHorizontal: 16
  },
  cancelWrapper: {
    position: 'absolute',
    left: 0
  },
  cancelText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.DARK_GRAY
  },
  content: {
    marginTop: 44,
    minHeight: 640,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8
  },
  section: {
    flex: 1
  },
  sectionContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8
  },
  scrollContent: {
    paddingBottom: 16
  },
  propertyHeaderContainer: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row'
  },
  propertyHeader: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyHeaderRequired: {
    marginLeft: 2,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.PRIMARY
  },
  description: {
    marginTop: 12,
    fontFamily: 'OpenSans',
    fontSize: 12
  },
  multilineInput: {
    height: 128
  },
  dividerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    flexGrow: 1,
    borderLeftColor: theme.COLORS.LIGHT_BORDER,
    borderLeftWidth: 1
  },
  dividerIcon: {
    marginVertical: 8
  }
});

export default RequestExcusePage;
