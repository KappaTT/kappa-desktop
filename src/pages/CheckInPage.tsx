import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { TEvent } from '@backend/kappa';
import { TToast } from '@reducers/ui';
import { _kappa, _ui } from '@reducers/actions';
import { theme } from '@constants';
import { hasValidCheckIn, sortEventByDate } from '@services/kappaService';
import { Icon, RadioList, FormattedInput } from '@components';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const CheckInPage: React.FC<{
  initialEvent: TEvent;
  onPressCancel(): void;
}> = ({ initialEvent, onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const futureEventArray = useSelector((state: TRedux) => state.kappa.futureEventArray);
  const isCheckingIn = useSelector((state: TRedux) => state.kappa.isCheckingIn);
  const checkInRequestDate = useSelector((state: TRedux) => state.kappa.checkInRequestDate);
  const checkInSuccessDate = useSelector((state: TRedux) => state.kappa.checkInSuccessDate);

  const [openDate, setOpenDate] = React.useState<moment.Moment>(moment());
  const [eventId, setEventId] = React.useState<string>(initialEvent ? initialEvent._id : '');
  const [eventCode, setEventCode] = React.useState<string>('');

  const dispatch = useDispatch();
  const dispatchCheckIn = React.useCallback(() => dispatch(_kappa.checkIn(user, eventId, eventCode)), [
    dispatch,
    eventCode,
    eventId,
    user
  ]);
  const dispatchShowToast = React.useCallback((toast: Partial<TToast>) => dispatch(_ui.showToast(toast)), [dispatch]);

  const readyStateEvent = React.useMemo(() => {
    return eventId !== '';
  }, [eventId]);

  const readyStateCode = React.useMemo(() => {
    return eventCode.length === 4;
  }, [eventCode]);

  const readyToSubmit = React.useMemo(() => readyStateEvent && readyStateCode, [readyStateCode, readyStateEvent]);

  const eventOptions = React.useMemo(() => {
    return futureEventArray
      .filter(
        (event) => !hasValidCheckIn(records, user.email, event._id, true) && moment(event.start).isSame(openDate, 'day')
      )
      .sort(sortEventByDate)
      .map((event) => ({
        id: event._id,
        title: event.title,
        subtitle: moment(event.start).format('ddd LLL')
      }));
  }, [futureEventArray, openDate, records, user.email]);

  const onChangeEventId = React.useCallback((chosen: string) => {
    setEventId(chosen);
  }, []);

  const onChangeEventCode = React.useCallback((text: string) => {
    setEventCode(text);
  }, []);

  React.useEffect(() => {
    if (
      checkInRequestDate !== null &&
      checkInSuccessDate !== null &&
      checkInRequestDate.isAfter(openDate) &&
      checkInSuccessDate.isAfter(checkInRequestDate)
    ) {
      dispatchShowToast({
        title: 'Success',
        message: 'You have been checked in to the event!',
        allowClose: true,
        timer: 2000,
        toastColor: theme.COLORS.PRIMARY_GREEN,
        textColor: theme.COLORS.WHITE,
        showBackdrop: false
      });

      onPressCancel();
    }
  }, [openDate, checkInRequestDate, checkInSuccessDate, dispatchShowToast, onPressCancel]);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isCheckingIn} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Check In</Text>
        </View>

        <View style={styles.saveWrapper}>
          {isCheckingIn ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSubmit ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSubmit}
              onPress={dispatchCheckIn}
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
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Event</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          {eventOptions.length > 0 ? (
            <React.Fragment>
              <RadioList options={eventOptions} selected={eventId} onChange={onChangeEventId} />

              <Text style={styles.description}>
                You may only check into an event on the same day it happened. If you forgot to check in and it is the
                same day, you can still submit the code. If it isn't, please send a request from your messages page and
                the exec board will consider it. Excuses must be requested before an event.
              </Text>
            </React.Fragment>
          ) : (
            <Text style={styles.description}>
              No events available to check in or request excuses for. You may only check into an event on the same day
              it happened. If you forgot to check in and it is the same day, you can still submit the code. If it isn't,
              please send a request from your messages page. Excuses must be requested before an event.
            </Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderCodeSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Code</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <FormattedInput
            placeholderText="ex: 1234"
            maxLength={4}
            value={eventCode}
            formatter={numberFormatter}
            onChangeText={onChangeEventCode}
          />
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
          {renderCodeSection()}
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
    color: theme.COLORS.GRAY
  },
  content: {
    marginTop: 44,
    minHeight: 560,
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

export default CheckInPage;
