import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _voting } from '@reducers/actions';
import { TEvent } from '@backend/kappa';
import { getVotes } from '@services/votingService';
import { theme } from '@constants';
import { Icon, RoundButton, FormattedInput } from '@components';

const VotingPage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionToCandidateToVotes = useSelector((state: TRedux) => state.voting.sessionToCandidateToVotes);
  const isGettingActiveVotes = useSelector((state: TRedux) => state.voting.isGettingActiveVotes);
  const isSubmittingVote = useSelector((state: TRedux) => state.voting.isSubmittingVote);

  const [votingRefreshDate, setVotingRefreshDate] = React.useState(null);
  const [reason, setReason] = React.useState<string>('');
  const [showReasonError, setShowReasonError] = React.useState<boolean>(false);

  const activeSession = React.useMemo(() => sessionArray.find((session) => session.active) || null, [sessionArray]);

  const currentCandidate = React.useMemo(
    () => candidateArray.find((candidate) => candidate._id === activeSession?.currentCandidateId) || null,
    [activeSession, candidateArray]
  );

  const dispatch = useDispatch();
  const dispatchGetActiveVotes = React.useCallback(() => dispatch(_voting.getActiveVotes(user)), [dispatch, user]);
  const dispatchSubmitVote = React.useCallback(
    (verdict: boolean) =>
      dispatch(
        _voting.submitVote(user, {
          sessionId: activeSession?._id,
          candidateId: currentCandidate?._id,
          verdict,
          reason: verdict ? '' : reason
        })
      ),
    [activeSession, currentCandidate, dispatch, reason, user]
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

  const votes = getVotes(sessionToCandidateToVotes, activeSession?._id, activeSession?.currentCandidateId, {});

  const currentVote = React.useMemo(() => votes.find((vote) => vote.userEmail === user.email) || null, [
    user.email,
    votes
  ]);

  const onChangeReason = React.useCallback((text: string) => setReason(text), []);

  const onPressReject = React.useCallback(() => {
    if (reason.trim().length === 0) {
      setShowReasonError(true);
    } else {
      setShowReasonError(false);
      dispatchSubmitVote(false);
    }
  }, [dispatchSubmitVote, reason]);

  const onPressApprove = React.useCallback(() => {
    setShowReasonError(false);
    dispatchSubmitVote(true);
  }, [dispatchSubmitVote]);

  const refreshVotes = React.useCallback(() => {
    if (!isGettingActiveVotes) dispatchGetActiveVotes();

    setVotingRefreshDate(moment());
  }, [dispatchGetActiveVotes, isGettingActiveVotes]);

  React.useEffect(() => {
    if (
      activeSession !== null &&
      !isGettingActiveVotes &&
      (votingRefreshDate === null || votingRefreshDate.isBefore(moment()))
    ) {
      const t = setTimeout(refreshVotes, votingRefreshDate === null ? 0 : 5000);
      return () => clearTimeout(t);
    }
  }, [activeSession, isGettingActiveVotes, refreshVotes, votingRefreshDate]);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={false} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Exit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Voting</Text>
          <Text style={styles.subtitleText}>{activeSession !== null ? activeSession.name : 'No Active Session'}</Text>
        </View>
      </React.Fragment>
    );
  };

  const renderCurrentCandidateSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={[styles.propertyHeader, { marginTop: 0 }]}>Current Candidate</Text>
            </View>

            <View style={styles.activeContent}>
              {currentCandidate !== null ? (
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
              ) : (
                <View style={styles.candidateArea}>
                  <Text style={styles.noVotes}>
                    There is currently no candidate being voted on. This page will automatically update.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.propertyHeaderContainer}>
              <Text style={[styles.propertyHeader, { marginTop: 0 }]}>Your Vote</Text>
            </View>

            <View style={styles.currentVoteContainer}>
              {currentVote !== null ? (
                <React.Fragment>
                  <View style={styles.splitPropertyRow}>
                    <View style={styles.splitProperty}>
                      <Text style={[styles.propertyHeader, { marginTop: 0 }]}>Verdict</Text>
                      <Text style={styles.propertyValue}>
                        {currentVote?.verdict === true ? 'Approved' : 'Rejected'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.splitPropertyRow}>
                    <View style={styles.splitProperty}>
                      <Text style={styles.propertyHeader}>Reason</Text>
                      <Text style={styles.propertyValue}>
                        {currentVote?.verdict === false ? currentVote.reason : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              ) : (
                <Text style={styles.noVotes}>You have not submitted a vote</Text>
              )}
            </View>

            <View style={styles.votingContainer}>
              <View style={[styles.section, { marginRight: 16 }]}>
                <View style={styles.candidateHeader}>
                  <View style={styles.candidateName}>
                    <Text style={styles.name}>Vote to reject</Text>
                  </View>

                  <RoundButton label="  Reject  " loading={isSubmittingVote} onPress={onPressReject} />
                </View>

                <Text style={styles.description}>
                  When you vote to reject a candidate, you are saying you do not believe this candidate would make a
                  good addition to the fraternity. You must provide a reason for why you are rejecting which represents
                  why they are not fit for brotherhood. An example of this would be if you witnessed them having bad
                  interactions with other rushes. Votes that do not have valid reasons will be dismissed.
                </Text>

                <View style={[styles.propertyHeaderContainer, { marginHorizontal: 0, marginTop: 0 }]}>
                  <Text style={styles.propertyHeader}>Reason</Text>
                </View>

                <FormattedInput
                  style={styles.multilineInput}
                  placeholderText="Why are you against this candidate?"
                  maxLength={256}
                  multiline={true}
                  numberOfLines={6}
                  error={showReasonError}
                  value={reason}
                  onChangeText={onChangeReason}
                />
              </View>

              {renderDivider()}

              <View style={[styles.section, { marginLeft: 16 }]}>
                <View style={styles.candidateHeader}>
                  <View style={styles.candidateName}>
                    <Text style={styles.name}>Vote to approve</Text>
                  </View>

                  <RoundButton label="Approve" loading={isSubmittingVote} onPress={onPressApprove} />
                </View>

                <Text style={styles.description}>
                  When you vote to approve a candidate, you are saying you believe they represent and uphold the ideals
                  and pillars of the fraternity. If you have not had enough interaction with the candidate to feel
                  comfortable vouching for their character, make your decision based on the fraternity discussion. Note:
                  if you change your mind, you can switch your vote up until the voting moves to the next candidate.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDivider = () => {
    return (
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{renderHeader()}</View>

      <View
        style={[styles.content, activeSession === null && { opacity: 0.5 }]}
        pointerEvents={activeSession !== null ? 'auto' : 'none'}
      >
        <View style={styles.section}>{renderCurrentCandidateSection()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
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
    flex: 1,
    flexDirection: 'row'
  },
  section: {
    flex: 1
  },
  approvedListSection: {
    width: 300
  },
  sectionContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  scrollContent: {
    paddingBottom: 16
  },
  propertyHeaderContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'row'
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
  approvedCandidatesList: {
    marginHorizontal: 16
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
  noVotes: {
    fontFamily: 'OpenSans',
    fontSize: 15
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
  progressBar: {
    flex: 1
  },
  currentVoteContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY
  },
  votingContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    flexDirection: 'row'
  },
  multilineInput: {
    height: 128
  }
});

export default VotingPage;
