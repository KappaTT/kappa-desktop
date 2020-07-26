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
import Icon from '@components/Icon';
import HorizontalSegmentBar from '@components/HorizontalSegmentBar';

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

  const isSessionActive = React.useMemo(() => session?.active && session?.operatorEmail === user.email, [
    session,
    user.email
  ]);

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
  const dispatchUnapproveCandidate = React.useCallback(() => console.log('TODO'), []);

  const canGoBackward = React.useMemo(() => false, []);
  const canGoForward = React.useMemo(() => true, []);

  const onPressBackward = React.useCallback(() => console.log('TODO'), []);
  const onPressForward = React.useCallback(() => console.log('TODO'), []);

  return (
    <View
      style={[styles.container, !isSessionActive && { opacity: 0.5 }]}
      pointerEvents={isSessionActive ? 'auto' : 'none'}
    >
      {currentCandidate !== null && (
        <View style={styles.candidateArea}>
          <View style={styles.candidateHeader}>
            <Text style={styles.name}>
              {currentCandidate.familyName}, {currentCandidate.givenName}
            </Text>

            {currentCandidate.approved ? (
              <RoundButton
                label="Unapprove"
                alt={true}
                color={theme.COLORS.PRIMARY}
                onPress={dispatchUnapproveCandidate}
              />
            ) : (
              <RoundButton label="Approve" color={theme.COLORS.PRIMARY} onPress={dispatchApproveCandidate} />
            )}
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

      {session !== null && (
        <React.Fragment>
          <View style={styles.controlsArea}>
            <TouchableOpacity
              style={{ opacity: canGoBackward ? 1 : 0.4 }}
              activeOpacity={0.6}
              disabled={!canGoBackward}
              onPress={onPressBackward}
            >
              <View style={[styles.skipControl, { paddingRight: 16 }]}>
                <Icon family="Feather" name="arrow-left-circle" size={24} color={theme.COLORS.PRIMARY} />
              </View>
            </TouchableOpacity>

            <View style={styles.progressBar}>
              <HorizontalSegmentBar
                showAllLabels={true}
                borderColor={theme.COLORS.SUPER_LIGHT_BLUE_GRAY}
                data={[
                  {
                    count: 0,
                    label: 'Complete',
                    color: theme.COLORS.PRIMARY
                  },
                  {
                    count: session.candidateOrder.length,
                    label: 'Remaining',
                    color: theme.COLORS.BORDER
                  }
                ]}
              />
            </View>

            <TouchableOpacity
              style={{ opacity: canGoForward ? 1 : 0.4 }}
              activeOpacity={0.6}
              disabled={!canGoForward}
              onPress={onPressForward}
            >
              <View style={[styles.skipControl, { paddingLeft: 16 }]}>
                <Icon family="Feather" name="arrow-right-circle" size={24} color={theme.COLORS.PRIMARY} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsArea}>
            <View style={styles.voteListArea}>
              <View style={styles.goodVotes}></View>
              <View style={styles.badVotes}></View>
            </View>
          </View>

          <View style={styles.dangerZone}></View>
        </React.Fragment>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  candidateArea: {
    marginTop: 16,
    marginHorizontal: 16,
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
  controlsArea: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  skipControl: {
    padding: 8
  },
  progressBar: {
    flex: 1
  },
  statsArea: {
    marginTop: 16
  },
  dangerZone: {}
});

export default SessionControls;
