import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _voting } from '@reducers/actions';
import { TEvent } from '@backend/kappa';
import { getVotes } from '@services/votingService';
import { theme } from '@constants';
import { Icon, HorizontalSegmentBar } from '@components';

const PresentationModePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const directorySize = useSelector((state: TRedux) => state.kappa.directorySize);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionToCandidateToVotes = useSelector((state: TRedux) => state.voting.sessionToCandidateToVotes);
  const isGettingCandidates = useSelector((state: TRedux) => state.voting.isGettingCandidates);
  const isGettingActiveVotes = useSelector((state: TRedux) => state.voting.isGettingActiveVotes);

  const [votingRefreshDate, setVotingRefreshDate] = React.useState(moment());

  const dispatch = useDispatch();
  const dispatchGetCandidates = React.useCallback(() => dispatch(_voting.getCandidates(user)), [dispatch, user]);
  const dispatchGetActiveVotes = React.useCallback(() => dispatch(_voting.getActiveVotes(user)), [dispatch, user]);

  const activeSession = React.useMemo(() => sessionArray.find((session) => session.active) || null, [sessionArray]);

  const approvedCandidates = React.useMemo(
    () =>
      candidateArray
        .filter((candidate) => candidate.approved)
        .map((candidate) => ({
          ...candidate,
          thisSession:
            activeSession !== null
              ? activeSession.candidateOrder.findIndex((candidateId) => candidateId === candidate._id)
              : false
        })),
    [candidateArray, activeSession]
  );

  const currentCandidate = React.useMemo(
    () => candidateArray.find((candidate) => candidate._id === activeSession?.currentCandidateId) || null,
    [activeSession, candidateArray]
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

  const candidateApprovalData = React.useMemo(
    () => [
      {
        count: votes.length,
        label: 'Voted',
        color: theme.COLORS.PRIMARY
      },
      {
        count: directorySize - votes.length,
        label: 'Abstained',
        color: theme.COLORS.BORDER
      }
    ],
    [directorySize, votes.length]
  );

  const refreshVotes = React.useCallback(() => {
    if (!isGettingActiveVotes) dispatchGetActiveVotes();
    if (!isGettingCandidates) dispatchGetCandidates();

    setVotingRefreshDate(moment());
  }, [dispatchGetActiveVotes, dispatchGetCandidates, isGettingActiveVotes, isGettingCandidates]);

  React.useEffect(() => {
    if (votingRefreshDate.isBefore(moment()) && !isGettingCandidates && !isGettingActiveVotes) {
      const t = setTimeout(refreshVotes, 5000);
      return () => clearTimeout(t);
    }
  }, [isGettingActiveVotes, isGettingCandidates, refreshVotes, votingRefreshDate]);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={false} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Exit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Voting Presentation</Text>
          <Text style={styles.subtitleText}>{activeSession !== null ? activeSession.name : 'No Active Session'}</Text>
        </View>
      </React.Fragment>
    );
  };

  const renderApprovedListSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={[styles.propertyHeader, { marginTop: 0, color: theme.COLORS.PRIMARY_GREEN }]}>
                Approved Candidates
              </Text>
            </View>

            {approvedCandidates.length > 0 ? (
              <View style={styles.approvedCandidatesList}>
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
        </ScrollView>
      </View>
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

            <View style={[styles.activeContent, activeSession !== null && { opacity: 0.5 }]}>
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
                      showAllLabels={true}
                      borderColor={theme.COLORS.SUPER_LIGHT_BLUE_GRAY}
                      data={candidateApprovalData}
                    />
                  </View>
                </View>
              )}
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

      <View style={styles.content}>
        <View style={styles.approvedListSection}>{renderApprovedListSection()}</View>

        {renderDivider()}

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
  }
});

export default PresentationModePage;
