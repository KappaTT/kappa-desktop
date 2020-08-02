import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
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
import { saveSession } from '@reducers/actions/voting';

const SessionControls: React.FC<{ session: TSession }> = ({ session }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const kappaLoadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const votingLoadHistory = useSelector((state: TRedux) => state.voting.loadHistory);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);
  const isSavingCandidate = useSelector((state: TRedux) => state.voting.isSavingCandidate);

  const currentCandidate = React.useMemo(
    () => candidateArray.find((candidate) => candidate._id === session.currentCandidateId) || null,
    [candidateArray, session]
  );

  const isSessionActive = React.useMemo(() => session.active && session.operatorEmail === user.email, [
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
  const dispatchApproveCandidate = React.useCallback(
    () => dispatch(_voting.saveCandidate(user, { approved: true }, currentCandidate?.email)),
    [currentCandidate, dispatch, user]
  );
  const dispatchUnapproveCandidate = React.useCallback(
    () => dispatch(_voting.saveCandidate(user, { approved: false }, currentCandidate?.email)),
    [currentCandidate, dispatch, user]
  );

  const approvedCandidates = React.useMemo(
    () =>
      candidateArray
        .filter((candidate) => candidate.approved)
        .map((candidate) => ({
          ...candidate,
          thisSession: session.candidateOrder.findIndex((candidateId) => candidateId === candidate._id)
        })),
    [candidateArray, session.candidateOrder]
  );

  const candidateIndex = React.useMemo(
    () => session.candidateOrder.findIndex((candidateId) => candidateId === session.currentCandidateId),
    [session.candidateOrder, session.currentCandidateId]
  );

  const canGoBackward = React.useMemo(() => candidateIndex > 0, [candidateIndex]);
  const canGoForward = React.useMemo(() => candidateIndex < session.candidateOrder.length - 1, [
    candidateIndex,
    session.candidateOrder.length
  ]);

  const onPressBackward = React.useCallback(
    () =>
      dispatch(
        _voting.saveSession(
          user,
          {
            currentCandidateId:
              candidateIndex > 0 ? session.candidateOrder[candidateIndex - 1] : session.candidateOrder[candidateIndex]
          },
          session._id
        )
      ),
    [candidateIndex, dispatch, session._id, session.candidateOrder, user]
  );
  const onPressForward = React.useCallback(
    () =>
      dispatch(
        _voting.saveSession(
          user,
          {
            currentCandidateId:
              candidateIndex < session.candidateOrder.length - 1
                ? session.candidateOrder[candidateIndex + 1]
                : session.candidateOrder[candidateIndex]
          },
          session._id
        )
      ),
    [candidateIndex, dispatch, session._id, session.candidateOrder, user]
  );

  return (
    <View
      style={[styles.container, !isSessionActive && { opacity: 0.5 }]}
      pointerEvents={isSessionActive ? 'auto' : 'none'}
    >
      <View style={styles.content}>
        <ScrollView>
          <View style={styles.scrollContent}>
            {currentCandidate !== null && (
              <View style={styles.candidateArea}>
                <View style={styles.candidateHeader}>
                  <View style={styles.candidateName}>
                    <Text style={styles.name}>
                      {currentCandidate.familyName}, {currentCandidate.givenName}
                    </Text>

                    {currentCandidate.approved && (
                      <Icon
                        style={styles.approvedIcon}
                        family="Feather"
                        name="check"
                        size={24}
                        color={theme.COLORS.PRIMARY_GREEN}
                      />
                    )}
                  </View>

                  {currentCandidate.approved ? (
                    <RoundButton
                      label="Unapprove"
                      alt={true}
                      color={theme.COLORS.PRIMARY}
                      bgColor={theme.COLORS.SUPER_LIGHT_BLUE_GRAY}
                      loading={isSavingCandidate}
                      onPress={dispatchUnapproveCandidate}
                    />
                  ) : (
                    <RoundButton
                      label="Approve"
                      color={theme.COLORS.PRIMARY}
                      loading={isSavingCandidate}
                      onPress={dispatchApproveCandidate}
                    />
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
                  <View style={styles.splitProperty}>
                    <Text style={styles.propertyHeader}>2nd Time Rush</Text>
                    <Text style={styles.propertyValue}>{currentCandidate.secondTimeRush ? 'Yes' : 'No'}</Text>
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
                <View style={styles.statsArea}>
                  <View style={styles.voteListArea}>
                    <View style={styles.approvedCandidates}>
                      <Text style={[styles.voteCategoryTitle, { color: theme.COLORS.PRIMARY_GREEN }]}>
                        Approved Candidates
                      </Text>

                      {approvedCandidates.length > 0 ? (
                        <View>
                          {approvedCandidates.map((candidate) => (
                            <View key={`approved-${candidate._id}`} style={styles.approvedCandidateContainer}>
                              <View>
                                <Text style={styles.approvedCandidateName}>
                                  {candidate.familyName}, {candidate.givenName}
                                </Text>
                                <Text style={styles.approvedCandidateDetails}>
                                  {candidate.classYear} in {candidate.major}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.noVotes}>No Candidates</Text>
                      )}
                    </View>
                    <View style={styles.dividerWrapper}>
                      <View style={styles.divider} />
                    </View>
                    <View style={styles.goodVotes}>
                      <Text style={styles.voteCategoryTitle}>Voted to Approve</Text>
                      <Text style={styles.noVotes}>No votes</Text>
                    </View>
                    <View style={styles.dividerWrapper}>
                      <View style={styles.divider} />
                    </View>
                    <View style={styles.badVotes}>
                      <Text style={styles.voteCategoryTitle}>Voted to Reject</Text>
                      <Text style={styles.noVotes}>No votes</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.dangerZone}></View>
              </React.Fragment>
            )}
          </View>
        </ScrollView>
      </View>

      {session !== null && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 16
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
  candidateName: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 16
  },
  approvedIcon: {
    marginLeft: 8
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
    padding: 16,
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
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16
  },
  voteListArea: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  voteCategoryTitle: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  noVotes: {
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  approvedCandidates: {
    flex: 1,
    paddingRight: 16
  },
  approvedCandidateContainer: {
    width: '100%',
    height: 48,
    borderBottomColor: theme.COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  approvedCandidateName: {
    fontFamily: 'OpenSans',
    fontSize: 15,
    color: theme.COLORS.BLACK
  },
  approvedCandidateDetails: {
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
  },
  goodVotes: {
    flex: 1,
    paddingHorizontal: 16
  },
  badVotes: {
    flex: 1,
    paddingLeft: 16
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
  dangerZone: {}
});

export default SessionControls;
