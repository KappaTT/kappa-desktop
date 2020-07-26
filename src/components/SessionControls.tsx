import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TSession } from '@backend/voting';
import { TEvent } from '@backend/kappa';
import RoundButton from '@components/RoundButton';

const SessionControls: React.FC<{ session: TSession }> = ({ session }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const kappaLoadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const votingLoadHistory = useSelector((state: TRedux) => state.voting.loadHistory);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);
  const currentCandidateId = useSelector((state: TRedux) => state.voting.currentCandidateId);

  const currentCandidate = React.useMemo(
    () => candidateArray.find((candidate) => candidate._id === currentCandidateId) || null,
    [candidateArray, currentCandidateId]
  );

  const attendedEvents = React.useMemo(() => {
    if (!currentCandidate) return [];

    const events = [];

    for (const eventId of currentCandidate.events) {
      const event = eventArray.find((event) => event._id === eventId);

      if (event) {
        events.push(event);
      }
    }

    return events;
  }, [eventArray, currentCandidate]);

  const dispatch = useDispatch();
  const dispatchApproveCandidate = React.useCallback(() => console.log('TODO'), []);

  return (
    <View style={styles.container}>
      {currentCandidate !== null && (
        <View style={styles.candidateArea}>
          <View style={styles.candidateHeader}>
            <Text style={styles.name}>
              {currentCandidate.familyName}, {currentCandidate.givenName}
            </Text>

            <RoundButton label="Approve" color={theme.COLORS.PRIMARY} onPress={dispatchApproveCandidate} />
          </View>

          <View style={styles.splitPropertyRow}>
            <View style={styles.splitProperty}>
              <Text style={styles.propertyHeader}>Year</Text>
              <Text style={styles.propertyValue}>{currentCandidate.classYear}</Text>
            </View>
            <View style={styles.splitProperty}>
              <Text style={styles.propertyHeader}>Major</Text>
              <Text style={styles.propertyValue}>{currentCandidate.major}</Text>
            </View>
          </View>

          <Text style={styles.propertyHeader}>Attended Events</Text>
          {attendedEvents.map((event: TEvent) => (
            <View key={event._id} style={styles.eventContainer}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{moment(event.start).format('ddd LLL')}</Text>
            </View>
          ))}
          {attendedEvents.length === 0 && <Text style={styles.noEvents}>No events</Text>}
        </View>
      )}

      <View style={styles.controlsArea}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  candidateArea: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 16
  },
  splitPropertyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  splitProperty: {
    marginRight: 24
  },
  propertyHeader: {
    marginTop: 16,
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
  },
  controlsArea: {}
});

export default SessionControls;
