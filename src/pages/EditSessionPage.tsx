import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { TRedux } from '@reducers';
import { _voting } from '@reducers/actions';
import { TCandidate, TSession } from '@backend/voting';
import { TYPE_OPTIONS } from '@services/votingService';
import { theme } from '@constants';
import { Icon, FormattedInput, RadioList, CheckList, CandidateReorder, Switch } from '@components';
import { sortEventByDate, getEventById } from '@services/kappaService';
import { useEffect } from 'react';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const EditSessionPage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const checkInEventId = useSelector((state: TRedux) => state.kappa.checkInEventId);
  const futureEventArray = useSelector((state: TRedux) => state.kappa.futureEventArray);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const editingSessionId = useSelector((state: TRedux) => state.voting.editingSessionId);
  const isSavingSession = useSelector((state: TRedux) => state.voting.isSavingSession);
  const isDeletingSession = useSelector((state: TRedux) => state.voting.isDeletingSession);

  const selectedSession = React.useMemo(
    () => sessionArray.find((session) => session._id === editingSessionId) || null,
    [editingSessionId, sessionArray]
  );

  const [readyToDelete, setReadyToDelete] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>(selectedSession?.name || '');
  const [type, setType] = React.useState<TSession['type']>(selectedSession?.type || 'REGULAR');
  const [maxVotes, setMaxVotes] = React.useState<string>(selectedSession?.maxVotes?.toString() || '');
  const [startDate, setStartDate] = React.useState(
    selectedSession ? moment(selectedSession.startDate) : moment(new Date()).startOf('hour')
  );
  const [candidateOrder, setCandidateOrder] = React.useState<string[]>(selectedSession?.candidateOrder || []);
  const currentCandidateId = React.useMemo(() => (candidateOrder.length > 0 ? candidateOrder[0] : ''), [
    candidateOrder
  ]);

  const initialEvent = checkInEventId === 'NONE' ? null : getEventById(events, checkInEventId);
  const [eventId, setEventId] = React.useState<string>(initialEvent ? initialEvent._id : '');
  const [openDate] = React.useState<moment.Moment>(moment());
  const eventOptions = React.useMemo(() => {
    return futureEventArray
      .filter((event) => event.eventType === 'GM')
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

  const dispatch = useDispatch();
  const dispatchSaveSession = React.useCallback(
    () =>
      dispatch(
        _voting.saveSession(
          user,
          {
            name,
            type,
            maxVotes: parseInt(maxVotes, 10),
            startDate: startDate.toISOString(),
            candidateOrder,
            currentCandidateId,
            gmId: eventId
          },
          editingSessionId !== 'NEW' ? editingSessionId : undefined
        )
      ),
    [candidateOrder, currentCandidateId, eventId, dispatch, editingSessionId, maxVotes, name, startDate, type, user]
  );
  const dispatchDeleteSession = React.useCallback(() => dispatch(_voting.deleteSession(user, editingSessionId)), [
    dispatch,
    editingSessionId,
    user
  ]);

  const candidateOptions = React.useMemo(
    () =>
      candidateArray.map((candidate) => ({
        id: candidate._id,
        title: `${candidate.familyName}, ${candidate.givenName}` + (candidate.approved ? ' (APPROVED)' : ''),
        subtitle: `${candidate.classYear} in ${candidate.major}`
      })),
    [candidateArray]
  );

  const richCandidateOrder = React.useMemo(() => {
    const richOrder = [];

    for (const candidateId of candidateOrder) {
      const candidate = candidateArray.find((candidate) => candidate._id === candidateId);

      if (candidate) {
        richOrder.push(candidate);
      }
    }

    return richOrder;
  }, [candidateArray, candidateOrder]);

  const readyToSave = React.useMemo(() => !(name === ''), [name]);

  const timezone = React.useMemo(() => {
    const date = new Date().toString();

    return date.substring(date.indexOf('(') + 1, date.lastIndexOf(')'));
  }, []);

  const onChangeName = React.useCallback((text: string) => {
    setName(text);
  }, []);

  const onChangeType = React.useCallback((chosen: TSession['type']) => {
    setType(chosen);
  }, []);

  const onChangeMaxVotes = React.useCallback((text: string) => {
    setMaxVotes(text);
  }, []);

  const onChangeStartDate = React.useCallback(
    (selectedDate) => {
      setStartDate(moment(selectedDate || startDate));
    },
    [startDate]
  );

  const onChangeTime = React.useCallback(
    (selectedDate) => {
      setStartDate(moment(`${startDate.format('YYYY-MM-DD')} ${moment(selectedDate).format('HH:mm')}`));
    },
    [startDate]
  );

  const selectedCandidates = React.useMemo(() => {
    const candidates = {};

    for (const candidateId of candidateOrder) {
      candidates[candidateId] = true;
    }

    return candidates;
  }, [candidateOrder]);

  const onChangeSelectedCandidates = React.useCallback(
    (selectedCandidateId: string) => {
      const newCandidates = [];

      for (const candidateId of candidateOrder) {
        if (selectedCandidateId !== candidateId) {
          newCandidates.push(candidateId);
        }
      }

      if (selectedCandidates[selectedCandidateId] !== true) {
        newCandidates.push(selectedCandidateId);
      }

      setCandidateOrder(newCandidates);
    },
    [candidateOrder, selectedCandidates]
  );

  const onPressAddAll = React.useCallback(() => {
    const newCandidates = [...candidateOrder];

    for (const candidate of candidateArray) {
      if (selectedCandidates[candidate._id] !== true) {
        newCandidates.push(candidate._id);
      }
    }

    setCandidateOrder(newCandidates);
  }, [candidateArray, candidateOrder, selectedCandidates]);

  const onPressClear = React.useCallback(() => {
    setCandidateOrder([]);
  }, []);

  const onChangeCandidateOrder = React.useCallback((richCandidateOrder: TCandidate[]) => {
    setCandidateOrder(richCandidateOrder.map((candidate) => candidate._id));
  }, []);

  const onChangeReadyToDelete = React.useCallback((newValue: boolean) => {
    setReadyToDelete(newValue);
  }, []);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isSavingSession || isDeletingSession} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Edit Session</Text>
          {selectedSession !== null && <Text style={styles.subtitleText}>{selectedSession.name}</Text>}
        </View>

        <View style={styles.saveWrapper}>
          {isSavingSession ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave || isDeletingSession}
              onPress={dispatchSaveSession}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderDetailsSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Session Name</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              placeholderText="ex: Third Week Voting"
              maxLength={64}
              value={name}
              onChangeText={onChangeName}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Voting Type</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <RadioList options={TYPE_OPTIONS} selected={type} onChange={onChangeType} />

            {type === 'MULTI' && (
              <React.Fragment>
                <View style={styles.propertyHeaderContainer}>
                  <Text style={styles.propertyHeader}>Max Votes</Text>
                  <Text style={styles.propertyHeaderRequired}>*</Text>
                </View>

                <FormattedInput
                  placeholderText="ex: 6"
                  maxLength={2}
                  value={maxVotes.toString()}
                  formatter={numberFormatter}
                  onChangeText={onChangeMaxVotes}
                />
              </React.Fragment>
            )}

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Voting Date</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <DatePicker selected={startDate.toDate()} onChange={onChangeStartDate} inline />

            <View style={[styles.propertyHeaderContainer]}>
              <Text style={styles.propertyHeader}>Start Time ({timezone})</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <DatePicker
              selected={startDate.toDate()}
              onChange={onChangeTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              dateFormat="h:mm aa"
              className="custom-time-picker"
            />

            {selectedSession !== null && (
              <View style={styles.dangerZone}>
                <View style={styles.deleteZone}>
                  <View style={styles.warning}>
                    <Text style={styles.zoneLabel}>Delete this session</Text>
                    <Text style={[styles.description, { marginTop: 2 }]}>
                      Deleting a session will delete all associated votes. Please double check and be certain this is
                      the session you want to delete.
                    </Text>
                  </View>

                  {isDeletingSession ? (
                    <ActivityIndicator style={styles.zoneIcon} color={theme.COLORS.PRIMARY} />
                  ) : (
                    <TouchableOpacity
                      style={!readyToDelete && { opacity: 0.4 }}
                      disabled={!readyToDelete}
                      onPress={dispatchDeleteSession}
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
                  <Switch value={readyToDelete} onValueChange={onChangeReadyToDelete} />
                  <Text style={styles.readyToDelete}>I am ready to delete this candidate</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderGMSelectionSection = () => {
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
                <RadioList options={eventOptions} selected={eventId} onChange={onChangeEventId} />

                <Text style={styles.description}>
                  You may only check into an event on the same day it happened. If you forgot to check in and it is the
                  same day, you can still submit the code. If it isn't, please send a late request and the exec board
                  will consider it. Regular excuses must be requested before an event.
                </Text>
              </React.Fragment>
            ) : (
              <Text style={styles.description}>
                No events available to check in for. You may only check into an event on the same day it happened. If
                you forgot to check in and it is the same day, you can still submit the code. If it isn't, please send a
                late request and the exec board will consider it. Regular excuses must be requested before an event.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCandidateSelectionSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Eligible Candidates</Text>
              <Text style={[styles.propertyHeaderRequired, { flex: 1 }]}>*</Text>

              <TouchableOpacity activeOpacity={0.6} style={{ marginRight: 16 }} onPress={onPressClear}>
                <Text style={styles.propertyButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.6} onPress={onPressAddAll}>
                <Text style={styles.propertyButtonText}>Add All</Text>
              </TouchableOpacity>
            </View>

            <CheckList options={candidateOptions} selected={selectedCandidates} onChange={onChangeSelectedCandidates} />

            <Text style={styles.description}>
              Select which candidates need to be voted on. For instance for Final Voting, select ALL candidates who were
              selected from Third Week Voting. You control the order in the next step.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCandidateOrderSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Voting Order</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <CandidateReorder richCandidateOrder={richCandidateOrder} onChangeOrder={onChangeCandidateOrder} />

            <Text style={styles.description}>
              Voting will automatically start with the top candidate in the list and proceed down the list one by one.
            </Text>
          </View>
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
        <View style={styles.section}>{renderDetailsSection()}</View>

        {renderDivider(null)}

        <View style={styles.section}>{renderGMSelectionSection()}</View>

        {renderDivider(null)}

        <View style={styles.section}>{renderCandidateSelectionSection()}</View>

        {renderDivider(null)}

        <View style={styles.section}>{renderCandidateOrderSection()}</View>
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
  propertyButtonText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
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
  },
  dangerZone: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.INPUT_ERROR_LIGHT
  },
  deleteZone: {
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

export default EditSessionPage;
