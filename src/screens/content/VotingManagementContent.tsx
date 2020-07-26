import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa, _nav, _ui, _voting } from '@reducers/actions';
import { shouldLoad } from '@services/kappaService';
import { sortSessionByDate } from '@services/votingService';
import { TCandidate, TSession } from '@backend/voting';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { Header, SubHeader, Icon, SessionItem, SessionCandidateItem, SessionControls } from '@components';
import { selectSessionCandidate } from '@reducers/actions/voting';

const VotingManagementContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const kappaLoadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const votingLoadHistory = useSelector((state: TRedux) => state.voting.loadHistory);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);
  const isGettingEvents = useSelector((state: TRedux) => state.kappa.isGettingEvents);
  const getEventsError = useSelector((state: TRedux) => state.kappa.getEventsError);
  const isGettingCandidates = useSelector((state: TRedux) => state.voting.isGettingCandidates);
  const getCandidatesError = useSelector((state: TRedux) => state.voting.getCandidatesError);
  const isGettingSessions = useSelector((state: TRedux) => state.voting.isGettingSessions);
  const getSessionsError = useSelector((state: TRedux) => state.voting.getSessionsError);

  const dispatch = useDispatch();
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetCandidates = React.useCallback(() => dispatch(_voting.getCandidates(user)), [dispatch, user]);
  const dispatchGetSessions = React.useCallback(() => dispatch(_voting.getSessions(user)), [dispatch, user]);
  const dispatchSelectSession = React.useCallback((session: TSession) => dispatch(_voting.selectSession(session)), [
    dispatch
  ]);
  const dispatchUnselectSession = React.useCallback(() => dispatch(_voting.unselectSession()), [dispatch]);

  const refreshing = React.useMemo(() => isGettingCandidates, [isGettingCandidates]);

  const [showingSessions, setShowingSessions] = React.useState<boolean>(false);

  const sortedSessionArray = React.useMemo(() => {
    return sessionArray.slice().sort(sortSessionByDate);
  }, [sessionArray]);

  const selectedSession = React.useMemo(() => {
    const index = sortedSessionArray.findIndex((session) => session._id === selectedSessionId);

    if (index >= 0) {
      return sortedSessionArray[index];
    }

    return null;
  }, [selectedSessionId, sortedSessionArray]);

  const candidatesInSession = React.useMemo(() => {
    if (selectedSession === null) {
      return [];
    }

    const candidates: TCandidate[] = [];

    for (const candidateId of selectedSession.candidateOrder) {
      const index = candidateArray.findIndex((candidate) => candidate._id === candidateId);

      if (index >= 0) {
        candidates.push(candidateArray[index]);
      }
    }

    return candidates;
  }, [candidateArray, selectedSession]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingEvents && (force || (!getEventsError && shouldLoad(kappaLoadHistory, 'events'))))
        dispatchGetEvents();
      if (!isGettingCandidates && (force || (!getCandidatesError && shouldLoad(votingLoadHistory, 'candidates'))))
        dispatchGetCandidates();
      if (!isGettingSessions && (force || (!getSessionsError && shouldLoad(votingLoadHistory, 'sessions'))))
        dispatchGetSessions();
    },
    [
      dispatchGetCandidates,
      dispatchGetEvents,
      dispatchGetSessions,
      getCandidatesError,
      getEventsError,
      getSessionsError,
      isGettingCandidates,
      isGettingEvents,
      isGettingSessions,
      kappaLoadHistory,
      votingLoadHistory
    ]
  );

  const onSubtitlePress = React.useCallback(() => {
    if (selectedSession) {
      setShowingSessions(!showingSessions);
    }
  }, [selectedSession, showingSessions]);

  const onPressStartTopSession = React.useCallback(() => {
    console.log(selectedSession?.active, 'TODO');
  }, [selectedSession]);

  const onRefresh = React.useCallback(() => {
    loadData(true);
  }, [loadData]);

  React.useEffect(() => {
    if (selectedSessionId === '') {
      setShowingSessions(true);
    } else {
      setShowingSessions(false);
    }
  }, [selectedSessionId]);

  React.useEffect(() => {
    if (sortedSessionArray.length > 0) {
      if (selectedSessionId === '') {
        const now = moment();

        for (const session of sortedSessionArray) {
          if (moment(session.startDate).isSameOrAfter(now)) {
            dispatchSelectSession(session);
            break;
          }
        }
      } else {
        const index = sortedSessionArray.findIndex((session) => session._id === selectedSessionId);

        if (index >= 0) {
          dispatchSelectSession(sortedSessionArray[index]);
        } else {
          dispatchUnselectSession();
        }
      }
    } else {
      if (selectedSessionId !== '') {
        dispatchUnselectSession();
      }
    }
  }, [dispatchSelectSession, dispatchUnselectSession, selectedSessionId, sortedSessionArray]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  const sessionKeyExtractor = React.useCallback((item: TSession) => item._id, []);
  const candidateKeyExtractor = React.useCallback((item: TCandidate) => item._id, []);

  const renderSessionItem = ({ item }: { item: TSession }) => {
    return <SessionItem session={item} />;
  };

  const renderCandidateItem = ({ item }: { item: TCandidate }) => {
    return <SessionCandidateItem candidate={item} />;
  };

  const renderSessionList = () => {
    return (
      <View style={styles.sectionContent}>
        <SubHeader title="Sessions" />

        <View style={styles.sessionList}>
          <FlatList data={sortedSessionArray} keyExtractor={sessionKeyExtractor} renderItem={renderSessionItem} />
        </View>
      </View>
    );
  };

  const renderCandidateList = () => {
    return (
      <View style={styles.sectionContent}>
        <SubHeader title="Candidates">
          <View style={styles.headerChildren}>
            <TouchableOpacity activeOpacity={0.6} onPress={() => {}}>
              <Text style={styles.headerButtonText}>Edit List</Text>
            </TouchableOpacity>
          </View>
        </SubHeader>

        <View style={styles.candidateList}>
          <FlatList data={candidatesInSession} keyExtractor={candidateKeyExtractor} renderItem={renderCandidateItem} />
        </View>
      </View>
    );
  };

  const renderCandidateDetails = () => {
    return (
      <View style={styles.sectionContent}>
        <SubHeader title="Session Controls">
          <View style={styles.headerChildren}>
            {selectedSession?.operatorEmail === user.email || selectedSession?.operatorEmail === '' ? (
              <TouchableOpacity activeOpacity={0.6} onPress={onPressStartTopSession}>
                <Text style={styles.headerButtonText}>{selectedSession?.active ? 'Stop' : 'Start'}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.headerButtonText, { color: theme.COLORS.BLACK }]}>
                You are not the operator. Operator: {selectedSession?.operatorEmail}
              </Text>
            )}
          </View>
        </SubHeader>

        <SessionControls session={selectedSession} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Voting Management"
        subtitle={selectedSession ? selectedSession.name : 'No Session'}
        subtitleIsPressable={true}
        onSubtitlePress={onSubtitlePress}
      >
        <View style={styles.headerChildren}>
          <View style={styles.headerButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={() => console.log('TODO')}>
              <Text style={styles.headerButtonText}>New Session</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.refreshContainer}>
            {refreshing ? (
              <ActivityIndicator style={styles.refreshIcon} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity onPress={onRefresh}>
                <Icon
                  style={styles.refreshIcon}
                  family="Feather"
                  name="refresh-cw"
                  size={17}
                  color={theme.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Header>

      <View style={styles.content}>
        <View style={styles.contentBody}>
          {showingSessions && (
            <React.Fragment>
              <View style={styles.sessionListSection}>{renderSessionList()}</View>

              <View style={styles.dividerWrapper}>
                <View style={styles.divider} />
              </View>
            </React.Fragment>
          )}

          <View style={styles.candidateListSection}>{renderCandidateList()}</View>

          <View style={styles.dividerWrapper}>
            <View style={styles.divider} />
          </View>

          <View style={styles.candidateDetailsSection}>{renderCandidateDetails()}</View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerChildren: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  refreshContainer: {},
  refreshIcon: {
    margin: 8,
    width: 17
  },
  headerButtonContainer: {
    marginRight: 8
  },
  headerButtonText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
    color: theme.COLORS.PRIMARY
  },
  content: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0
  },
  contentBody: {
    flex: 1,
    flexDirection: 'row'
  },
  sessionListSection: {
    width: 300
  },
  candidateListSection: {
    width: 300
  },
  candidateDetailsSection: {
    flex: 1
  },
  section: {
    flex: 1
  },
  sectionContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
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
  errorMessage: {
    marginTop: '40vh',
    textAlign: 'center',
    fontFamily: 'OpenSans'
  },
  sessionList: {
    justifyContent: 'flex-start'
  },
  candidateList: {
    justifyContent: 'flex-start'
  }
});

export default VotingManagementContent;
