import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { TRedux } from '@reducers';
import { _auth, _voting } from '@reducers/actions';
import { TCandidate } from '@backend/voting';
import { theme } from '@constants';
import { Icon, FormattedInput, CheckList } from '@components';

const nameFormatter = (text: string) => {
  return text !== undefined ? text.trim() : '';
};

const EditSessionPage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);
  const isSavingSession = false;

  const selectedSession = React.useMemo(
    () => sessionArray.find((session) => session._id === selectedSessionId) || null,
    [selectedSessionId, sessionArray]
  );

  const [name, setName] = React.useState<string>(selectedSession?.name || '');
  const [startDate, setStartDate] = React.useState(
    selectedSession ? moment(selectedSession.startDate) : moment(new Date()).startOf('hour')
  );
  const [candidateOrder, setCandidateOrder] = React.useState<string[]>(selectedSession?.candidateOrder || []);
  const currentCandidateId = React.useMemo(() => (candidateOrder.length > 0 ? candidateOrder[0] : ''), [
    candidateOrder
  ]);

  const dispatch = useDispatch();
  const dispatchSaveSession = React.useCallback(() => console.log('TODO'), []);

  const candidateOptions = React.useMemo(
    () =>
      candidateArray.map((candidate) => ({
        id: candidate._id,
        title: `${candidate.familyName}, ${candidate.givenName}` + (candidate.approved ? ' (APPROVED)' : ''),
        subtitle: `${candidate.classYear} in ${candidate.major}`
      })),
    [candidateArray]
  );

  const readyToSave = React.useMemo(() => !(name === ''), [name]);

  const timezone = React.useMemo(() => {
    const date = new Date().toString();

    return date.substring(date.indexOf('(') + 1, date.lastIndexOf(')'));
  }, []);

  const onChangeName = React.useCallback((text: string) => {
    setName(text);
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

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isSavingSession} onPress={onPressCancel}>
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
              disabled={!readyToSave}
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
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>First Name</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <FormattedInput
            placeholderText="ex: Third Week Voting"
            maxLength={32}
            value={name}
            formatter={nameFormatter}
            onChangeText={onChangeName}
          />

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
        </ScrollView>
      </View>
    );
  };

  const renderCandidateSelectionSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Eligible Candidates</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <CheckList options={candidateOptions} selected={selectedCandidates} onChange={onChangeSelectedCandidates} />

          <Text style={styles.description}>
            Select which candidates need to be voted on. For instance for Final Voting, select ALL candidates who were
            selected from Third Week Voting. You control the order in the next step.
          </Text>
        </ScrollView>
      </View>
    );
  };

  const renderCandidateOrderSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Voting Order</Text>
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

export default EditSessionPage;
