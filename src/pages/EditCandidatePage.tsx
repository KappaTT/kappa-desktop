import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { prettyPhone, sortEventByDate } from '@services/kappaService';
import { CLASS_YEAR_OPTIONS } from '@services/votingService';
import { Icon, RadioList, FormattedInput, CheckList } from '@components';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const emailFormatter = (text: string) => {
  return text !== undefined ? text.trim() : '';
};

const EditCandidatePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const editingCandidateEmail = useSelector((state: TRedux) => state.voting.editingCandidateEmail);
  const isSavingCandidate = useSelector((state: TRedux) => state.voting.isSavingCandidate);

  const selectedCandidate = React.useMemo(() => {
    const foundCandidate = candidateArray.find((candidate) => candidate.email === editingCandidateEmail);

    if (foundCandidate) {
      return foundCandidate;
    }

    return null;
  }, [candidateArray, editingCandidateEmail]);

  const [email, setEmail] = React.useState<string>(selectedCandidate?.email || '');
  const [phone, setPhone] = React.useState<string>(selectedCandidate?.phone || '');
  const [classYear, setClassYear] = React.useState<string>(selectedCandidate?.classYear || '');
  const [major, setMajor] = React.useState<string>(selectedCandidate?.major || '');
  const [attendedEvents, setAttendedEvents] = React.useState<string[]>(selectedCandidate?.events || []);

  const dispatch = useDispatch();
  const dispatchSaveCandidate = React.useCallback(() => dispatch(_voting.saveCandidate(user, {})), [dispatch, user]);

  const prettyPhoneValue = React.useMemo(() => prettyPhone(phone), [phone]);
  const selectedEvents = React.useMemo(() => {
    const events = {};

    for (const event of attendedEvents) {
      events[event] = true;
    }

    return events;
  }, [attendedEvents]);
  const eventOptions = React.useMemo(
    () =>
      eventArray.map((event) => ({
        id: event._id,
        title: event.title,
        subtitle: moment(event.start).format('ddd LLL')
      })),
    [eventArray]
  );

  const readyToSave = React.useMemo(
    () => !(prettyPhoneValue === '' || prettyPhoneValue === 'Invalid' || classYear === ''),
    [classYear, prettyPhoneValue]
  );

  const onChangeEmail = React.useCallback((text: string) => {
    setEmail(text);
  }, []);

  const onChangePhone = React.useCallback((text: string) => {
    setPhone(text);
  }, []);

  const onChangeMajor = React.useCallback((text: string) => {
    setMajor(text);
  }, []);

  const onChangeClassYear = React.useCallback((chosen: string) => {
    setClassYear(chosen);
  }, []);

  const onChangeEvents = React.useCallback(
    (eventId: string) => {
      const newAttendedEvents = [];

      for (const event of eventArray) {
        if (
          (event._id !== eventId && selectedEvents[event._id] === true) ||
          (event._id === eventId && selectedEvents[event._id] !== true)
        ) {
          newAttendedEvents.push(event._id);
        }
      }

      setAttendedEvents(newAttendedEvents);
    },
    [eventArray, selectedEvents]
  );

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isSavingCandidate} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Edit Candidate</Text>
          {selectedCandidate !== null && (
            <Text style={styles.subtitleText}>
              {selectedCandidate.givenName} {selectedCandidate.familyName}
            </Text>
          )}
        </View>

        <View style={styles.saveWrapper}>
          {isSavingCandidate ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave}
              onPress={dispatchSaveCandidate}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderContactSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Email</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <FormattedInput
            placeholderText="ex: jjt4@illinois.edu"
            maxLength={64}
            value={email}
            formatter={emailFormatter}
            onChangeText={onChangeEmail}
          />

          <Text style={styles.description}>The candidate's email must be unique. Please provide the full email.</Text>

          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Phone Number</Text>
          </View>

          <FormattedInput
            placeholderText="phone number"
            maxLength={10}
            value={phone}
            formatter={numberFormatter}
            onChangeText={onChangePhone}
          />

          <Text style={styles.description}>
            The phone number is solely for rush contact purposes, it will not be shared beyond exec.
          </Text>

          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Major</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <FormattedInput
            placeholderText="ex: Computer Science"
            maxLength={64}
            value={major}
            onChangeText={onChangeMajor}
          />
        </ScrollView>
      </View>
    );
  };

  const renderGradYearSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Class Year</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <RadioList options={CLASS_YEAR_OPTIONS} selected={classYear} onChange={onChangeClassYear} />

          <Text style={styles.description}>
            Choose their actual class year based on when they enrolled at the university, not by credit hours.
          </Text>
        </ScrollView>
      </View>
    );
  };

  const renderEventsSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Attended Events</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <CheckList options={eventOptions} selected={selectedEvents} onChange={onChangeEvents} />

          <Text style={styles.description}>Select all the events that the candidate attended.</Text>
        </ScrollView>
      </View>
    );
  };

  const renderDivider = (readyStatus: boolean) => {
    return (
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
        {readyStatus !== null && (
          <React.Fragment>
            <Icon
              style={styles.dividerIcon}
              family="Feather"
              name="arrow-right-circle"
              size={20}
              color={readyStatus ? theme.COLORS.PRIMARY : theme.COLORS.BORDER}
            />
            <View style={styles.divider} />
          </React.Fragment>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{renderHeader()}</View>

      <View style={styles.content}>
        <View style={styles.section}>{renderContactSection()}</View>

        {renderDivider(null)}

        <View style={styles.section}>{renderGradYearSection()}</View>

        {renderDivider(null)}

        <View style={styles.section}>{renderEventsSection()}</View>
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

export default EditCandidatePage;