import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { prettyPhone } from '@services/kappaService';
import { theme } from '@constants';
import { TCandidate } from '@backend/voting';
import { TEvent } from '@backend/kappa';
import Icon from '@components/Icon';
import RoundButton from '@components/RoundButton';
import Chip from '@components/Chip';
import Switch from '@components/Switch';

const CandidateViewer: React.FC = () => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const selectedCandidateEmail = useSelector((state: TRedux) => state.voting.selectedCandidateEmail);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const isDeletingCandidate = useSelector((state: TRedux) => state.voting.isDeletingCandidate);

  const [readyToDelete, setReadyToDelete] = React.useState<boolean>(false);

  const selectedCandidate = React.useMemo(() => {
    const foundCandidate = candidateArray.find((candidate) => candidate.email === selectedCandidateEmail);

    if (foundCandidate) {
      return foundCandidate;
    }

    return null;
  }, [candidateArray, selectedCandidateEmail]);

  const attendedEvents = React.useMemo(() => {
    if (!selectedCandidate) return [];

    const events = [];

    for (const eventId of selectedCandidate.events) {
      const event = eventArray.find((event) => event._id === eventId);

      if (event) {
        events.push(event);
      }
    }

    return events;
  }, [eventArray, selectedCandidate]);

  const dispatch = useDispatch();
  const dispatchDeleteCandidate = React.useCallback(
    () => dispatch(_voting.deleteCandidate(user, selectedCandidateEmail)),
    [dispatch, selectedCandidateEmail, user]
  );
  const dispatchEditCandidate = React.useCallback(() => dispatch(_voting.editCandidate(selectedCandidateEmail)), [
    dispatch,
    selectedCandidateEmail
  ]);

  const onChangeReadyToDelete = React.useCallback((newValue: boolean) => {
    setReadyToDelete(newValue);
  }, []);

  return (
    <View style={styles.container}>
      {selectedCandidate !== null && (
        <View style={styles.content}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {selectedCandidate.givenName} {selectedCandidate.familyName}
            </Text>

            {selectedCandidate.approved && (
              <Chip
                iconFamily="Feather"
                iconName="check"
                backgroundColor={theme.COLORS.PRIMARY_GREEN}
                textColor={theme.COLORS.WHITE}
                label="Approved"
              />
            )}
          </View>

          <Text style={styles.sectionLabel}>Demographics</Text>
          <View style={styles.splitPropertyRow}>
            <View style={styles.splitProperty}>
              <Text style={styles.propertyHeader}>Year</Text>
              <Text style={styles.propertyValue}>{selectedCandidate.classYear}</Text>
            </View>
            <View style={styles.splitProperty}>
              <Text style={styles.propertyHeader}>Major</Text>
              <Text style={styles.propertyValue}>{selectedCandidate.major}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Contact</Text>
          <View style={styles.splitPropertyRow}>
            <View style={styles.splitProperty}>
              <Text style={styles.propertyHeader}>Email</Text>
              <Text style={styles.propertyValue}>{selectedCandidate.email}</Text>
            </View>
            <View style={styles.splitProperty}>
              <Text style={styles.propertyHeader}>Phone</Text>
              <Text style={styles.propertyValue}>{prettyPhone(selectedCandidate.phone)}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Attended Events</Text>
          {attendedEvents.map((event: TEvent) => (
            <View key={event._id} style={styles.eventContainer}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{moment(event.start).format('M/D/Y')}</Text>
            </View>
          ))}
          {attendedEvents.length === 0 && <Text style={styles.noEvents}>No events</Text>}

          <View style={styles.dangerZone}>
            <View style={styles.editZone}>
              <View style={styles.warning}>
                <Text style={styles.zoneLabel}>Edit this candidate</Text>
                <Text style={styles.description}>
                  Edits to candidates will only show up when users refresh. Please make sure you have refreshed the
                  latest candidate details before editing.
                </Text>
              </View>

              <TouchableOpacity disabled={isDeletingCandidate} onPress={dispatchEditCandidate}>
                <Icon style={styles.zoneIcon} family="Feather" name="edit" size={32} color={theme.COLORS.PRIMARY} />
              </TouchableOpacity>
            </View>
            <View style={styles.deleteZone}>
              <View style={styles.warning}>
                <Text style={styles.zoneLabel}>Delete this candidate</Text>
                <Text style={styles.description}>
                  Deleting a candidate will delete all associated votes. Please double check and be certain this is the
                  candidate you want to delete.
                </Text>
              </View>

              {isDeletingCandidate ? (
                <ActivityIndicator style={styles.zoneIcon} color={theme.COLORS.PRIMARY} />
              ) : (
                <TouchableOpacity
                  style={!readyToDelete && styles.disabledButton}
                  disabled={!readyToDelete}
                  onPress={dispatchDeleteCandidate}
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
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  content: {},
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: {
    marginRight: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 24
  },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 8,
    fontFamily: 'OpenSans-Bold',
    fontSize: 20
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
  },
  eventContainer: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  noEvents: {
    fontFamily: 'OpenSans',
    fontSize: 15
  }
});

export default CandidateViewer;
