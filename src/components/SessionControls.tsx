import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TSession, TVote } from '@backend/voting';
import { TEvent } from '@backend/kappa';
import { TToast } from '@reducers/ui';
import { getVotes } from '@services/votingService';
import RoundButton from '@components/RoundButton';
import Icon from '@components/Icon';
import HorizontalSegmentBar from '@components/HorizontalSegmentBar';

const SessionControls: React.FC<{ session: TSession }> = ({ session }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const directorySize = useSelector((state: TRedux) => state.kappa.directorySize);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionToCandidateToVotes = useSelector((state: TRedux) => state.voting.sessionToCandidateToVotes);
  const isSavingCandidate = useSelector((state: TRedux) => state.voting.isSavingCandidate);
  const isGettingCandidateVotes = useSelector((state: TRedux) => state.voting.isGettingCandidateVotes);
  const isCreatingNextSession = useSelector((state: TRedux) => state.voting.isCreatingNextSession);
  const createNextSessionDate = useSelector((state: TRedux) => state.voting.createNextSessionDate);
  const createNextSessionSession = useSelector((state: TRedux) => state.voting.createNextSessionSession);

  const [createNextSessionRequestDate, setCreateNextSessionRequestDate] = React.useState(moment());
  const [votingRefreshDate, setVotingRefreshDate] = React.useState(null);

  const currentCandidate = React.useMemo(
    () => candidateArray.find((candidate) => candidate._id === session.currentCandidateId) || null,
    [candidateArray, session]
  );

  const dispatch = useDispatch();
  const dispatchApproveCandidate = React.useCallback(
    () => dispatch(_voting.saveCandidate(user, { approved: true }, currentCandidate?.email)),
    [currentCandidate, dispatch, user]
  );
  const dispatchUnapproveCandidate = React.useCallback(
    () => dispatch(_voting.saveCandidate(user, { approved: false }, currentCandidate?.email)),
    [currentCandidate, dispatch, user]
  );
  const dispatchGetCandidateVotes = React.useCallback(
    (sessionId: string, candidateId: string, useLoadHistory: boolean) =>
      dispatch(_voting.getCandidateVotes(user, sessionId, candidateId, useLoadHistory)),
    [dispatch, user]
  );
  const dispatchSelectSession = React.useCallback(
    (newSession: TSession) => dispatch(_voting.selectSession(newSession)),
    [dispatch]
  );
  const dispatchCreateNextSession = React.useCallback(() => dispatch(_voting.createNextSession(user, session._id)), [
    dispatch,
    session._id,
    user
  ]);
  const dispatchShowToast = React.useCallback((toast: Partial<TToast>) => dispatch(_ui.showToast(toast)), [dispatch]);

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

  const votes = getVotes(sessionToCandidateToVotes, session._id, session.currentCandidateId, directory);

  const approvedVotes = React.useMemo(() => votes.filter((vote) => vote.verdict === true), [votes]);
  const rejectedVotes = React.useMemo(() => votes.filter((vote) => vote.verdict !== true), [votes]);

  const candidateApprovalData = React.useMemo(
    () => [
      {
        count: approvedVotes.length,
        label: 'Approved',
        color: theme.COLORS.PRIMARY
      },
      {
        count: rejectedVotes.length,
        label: 'Rejected',
        color: theme.COLORS.BLACK
      },
      {
        count: directorySize - approvedVotes.length - rejectedVotes.length,
        label: 'Abstained',
        color: theme.COLORS.BORDER
      }
    ],
    [approvedVotes.length, directorySize, rejectedVotes.length]
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

  const sessionProgressData = React.useMemo(
    () => [
      {
        count: candidateIndex,
        label: 'Complete',
        color: theme.COLORS.PRIMARY
      },
      {
        count: session.candidateOrder.length - candidateIndex,
        label: 'Remaining',
        color: theme.COLORS.BORDER
      }
    ],
    [candidateIndex, session.candidateOrder.length]
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

  const onPressCreateNextRound = React.useCallback(() => {
    dispatchCreateNextSession();
  }, [dispatchCreateNextSession]);

  const refreshVotes = React.useCallback(() => {
    if (!isGettingCandidateVotes && session.currentCandidateId !== '')
      dispatchGetCandidateVotes(session._id, session.currentCandidateId, false);

    setVotingRefreshDate(moment());
  }, [dispatchGetCandidateVotes, isGettingCandidateVotes, session]);

  React.useEffect(() => {
    if (createNextSessionDate !== null && createNextSessionSession !== null) {
      if (createNextSessionDate.isAfter(createNextSessionRequestDate)) {
        setCreateNextSessionRequestDate(moment());

        dispatchSelectSession(createNextSessionSession);

        dispatchShowToast({
          title: 'Success',
          message: 'Created next session!',
          allowClose: true,
          timer: 2000,
          toastColor: theme.COLORS.PRIMARY_GREEN,
          textColor: theme.COLORS.WHITE,
          showBackdrop: false
        });
      }
    }
  }, [
    createNextSessionDate,
    createNextSessionRequestDate,
    createNextSessionSession,
    dispatchSelectSession,
    dispatchShowToast
  ]);

  React.useEffect(() => {
    if (
      session.active === true &&
      !isGettingCandidateVotes &&
      (votingRefreshDate === null || votingRefreshDate.isBefore(moment()))
    ) {
      const t = setTimeout(refreshVotes, votingRefreshDate === null ? 0 : 5000);
      return () => clearTimeout(t);
    }
  }, [isGettingCandidateVotes, refreshVotes, session.active, votingRefreshDate]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View
              style={[styles.activeContent, !isSessionActive && { opacity: 0.5 }]}
              pointerEvents={isSessionActive ? 'auto' : 'none'}
            >
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

                  <View style={[styles.progressBar, { marginTop: 16 }]}>
                    <HorizontalSegmentBar
                      borderColor={theme.COLORS.SUPER_LIGHT_BLUE_GRAY}
                      data={candidateApprovalData}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.instructions}>
              <Text style={styles.description}>
                To start a voting session, click the "start" button in the top right corner of the controls. Once a
                session is active, brothers will be prompted to submit votes. This page will automatically load new
                votes.
              </Text>
              <Text style={styles.description}>
                Once you have collected votes, you can review the negative votes for valid reasons. If a candidate has
                no valid rejections, click the "approve" button. If the candidate should not be approved, click the
                arrow to advance to the next candidate. The candidates who have been approved will appear in the list
                below.
              </Text>
            </View>

            <View
              style={[styles.activeContent, !isSessionActive && { opacity: 0.5 }]}
              pointerEvents={isSessionActive ? 'auto' : 'none'}
            >
              <View style={styles.statsArea}>
                <View style={styles.voteListArea}>
                  <View style={styles.approvedCandidates}>
                    <Text style={[styles.voteCategoryTitle, { color: theme.COLORS.PRIMARY_GREEN }]}>
                      Approved Candidates
                    </Text>

                    {approvedCandidates.length > 0 ? (
                      <View>
                        {approvedCandidates.map((candidate, index) => (
                          <View key={`approved-${candidate._id}`} style={styles.approvedCandidateContainer}>
                            <View>
                              <Text style={styles.approvedCandidateName}>
                                {candidate.familyName}, {candidate.givenName}
                              </Text>
                              <Text style={styles.approvedCandidateDetails}>
                                {candidate.classYear} in {candidate.major}
                              </Text>
                            </View>
                            <Text style={styles.approvedCandidateIndex}>{index + 1}</Text>
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

                    {approvedVotes.map((vote) => (
                      <View key={vote._id} style={styles.voteContainer}>
                        <Text style={styles.voteTitle}>{vote.userName}</Text>
                        <Text style={styles.voteSubtitle}>Approved</Text>
                      </View>
                    ))}
                    {approvedVotes.length === 0 && <Text style={styles.noVotes}>No votes</Text>}
                  </View>
                  <View style={styles.dividerWrapper}>
                    <View style={styles.divider} />
                  </View>
                  <View style={styles.badVotes}>
                    <Text style={styles.voteCategoryTitle}>Voted to Reject</Text>

                    {rejectedVotes.map((vote) => (
                      <View key={vote._id} style={styles.voteContainer}>
                        <Text style={styles.voteTitle}>{vote.userName}</Text>
                        <Text style={styles.voteSubtitle}>{vote.reason}</Text>
                      </View>
                    ))}
                    {rejectedVotes.length === 0 && <Text style={styles.noVotes}>No votes</Text>}
                  </View>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.dangerZone,
                session.active && {
                  opacity: 0.5
                }
              ]}
              pointerEvents={session.active ? 'none' : 'auto'}
            >
              <View style={styles.editZone}>
                <View style={styles.warning}>
                  <Text style={styles.zoneLabel}>Create next round</Text>
                  <Text style={[styles.description, { marginTop: 2 }]}>
                    Once you finish a session (which will correspond to a single round of voting), you can create a new
                    session from the remaining unapproved candidates and start the next session. Candidates will
                    automatically be ordered by votes. If any candidates were not voted on, they will automatically be
                    prioritized in their current order. You must end the session before creating a new one.
                  </Text>
                </View>

                {isCreatingNextSession ? (
                  <ActivityIndicator style={styles.zoneIcon} color={theme.COLORS.PRIMARY} />
                ) : (
                  <TouchableOpacity onPress={onPressCreateNextRound}>
                    <Icon
                      style={styles.zoneIcon}
                      family="Feather"
                      name="upload"
                      size={32}
                      color={theme.COLORS.PRIMARY}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

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
            data={sessionProgressData}
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
  activeContent: {},
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
  approvedCandidateIndex: {
    marginRight: 8,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 17,
    color: theme.COLORS.PRIMARY_GREEN
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
  voteContainer: {
    width: '100%',
    height: 48,
    borderBottomColor: theme.COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  voteTitle: {
    fontFamily: 'OpenSans',
    fontSize: 15,
    color: theme.COLORS.BLACK
  },
  voteSubtitle: {
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
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
  description: {
    marginTop: 12,
    fontFamily: 'OpenSans',
    fontSize: 12
  },
  dangerZone: {
    marginTop: 16,
    marginHorizontal: 16,
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
  instructions: {
    marginHorizontal: 16
  }
});

export default SessionControls;
