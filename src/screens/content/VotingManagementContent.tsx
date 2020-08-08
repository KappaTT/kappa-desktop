import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa, _nav, _ui, _voting } from '@reducers/actions';
import { shouldLoad } from '@services/kappaService';
import { TCandidate, TSession } from '@backend/voting';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { Header, SubHeader, Icon, SessionItem, SessionCandidateItem, SessionControls } from '@components';

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
  const isGettingDirectory = useSelector((state: TRedux) => state.kappa.isGettingDirectory);
  const getDirectoryError = useSelector((state: TRedux) => state.kappa.getDirectoryError);
  const isGettingCandidates = useSelector((state: TRedux) => state.voting.isGettingCandidates);
  const getCandidatesError = useSelector((state: TRedux) => state.voting.getCandidatesError);
  const isGettingSessions = useSelector((state: TRedux) => state.voting.isGettingSessions);
  const getSessionsError = useSelector((state: TRedux) => state.voting.getSessionsError);
  const isStartingSession = useSelector((state: TRedux) => state.voting.isStartingSession);
  const isStoppingSession = useSelector((state: TRedux) => state.voting.isStoppingSession);
  const isGettingCandidateVotes = useSelector((state: TRedux) => state.voting.isGettingCandidateVotes);
  const getCandidateVotesError = useSelector((state: TRedux) => state.voting.getCandidateVotesError);

  const selectedSession = React.useMemo(() => {
    const index = sessionArray.findIndex((session) => session._id === selectedSessionId);

    if (index >= 0) {
      return sessionArray[index];
    }

    return null;
  }, [selectedSessionId, sessionArray]);

  const dispatch = useDispatch();
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetDirectory = React.useCallback(() => dispatch(_kappa.getDirectory(user)), [dispatch, user]);
  const dispatchGetCandidates = React.useCallback(() => dispatch(_voting.getCandidates(user)), [dispatch, user]);
  const dispatchGetSessions = React.useCallback(() => dispatch(_voting.getSessions(user)), [dispatch, user]);
  const dispatchSelectSession = React.useCallback((session: TSession) => dispatch(_voting.selectSession(session)), [
    dispatch
  ]);
  const dispatchUnselectSession = React.useCallback(() => dispatch(_voting.unselectSession()), [dispatch]);
  const dispatchStartSession = React.useCallback((session: TSession) => dispatch(_voting.startSession(user, session)), [
    dispatch,
    user
  ]);
  const dispatchStopSession = React.useCallback((session: TSession) => dispatch(_voting.stopSession(user, session)), [
    dispatch,
    user
  ]);
  const dispatchEditSession = React.useCallback(() => dispatch(_voting.editSession(selectedSessionId)), [
    dispatch,
    selectedSessionId
  ]);
  const dispatchNewSession = React.useCallback(() => dispatch(_voting.editSession()), [dispatch]);
  const dispatchGetCandidateVotes = React.useCallback(
    (sessionId: string, candidateId: string) => dispatch(_voting.getCandidateVotes(user, sessionId, candidateId, true)),
    [dispatch, user]
  );
  const dispatchOpenPresentationMode = React.useCallback(() => console.log('TODO'), []);

  const refreshing = React.useMemo(
    () => isGettingEvents || isGettingDirectory || isGettingCandidates || isGettingSessions || isGettingCandidateVotes,
    [isGettingCandidateVotes, isGettingCandidates, isGettingDirectory, isGettingEvents, isGettingSessions]
  );

  const [showingSessions, setShowingSessions] = React.useState<boolean>(false);

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
      if (!isGettingDirectory && (force || (!getDirectoryError && shouldLoad(kappaLoadHistory, 'directory'))))
        dispatchGetDirectory();
      if (!isGettingCandidates && (force || (!getCandidatesError && shouldLoad(votingLoadHistory, 'candidates'))))
        dispatchGetCandidates();
      if (!isGettingSessions && (force || (!getSessionsError && shouldLoad(votingLoadHistory, 'sessions'))))
        dispatchGetSessions();
    },
    [
      dispatchGetCandidates,
      dispatchGetDirectory,
      dispatchGetEvents,
      dispatchGetSessions,
      getCandidatesError,
      getDirectoryError,
      getEventsError,
      getSessionsError,
      isGettingCandidates,
      isGettingDirectory,
      isGettingEvents,
      isGettingSessions,
      kappaLoadHistory,
      votingLoadHistory
    ]
  );

  const loadVotes = React.useCallback(
    (force: boolean) => {
      if (
        !isGettingCandidateVotes &&
        (force ||
          (!getCandidateVotesError &&
            selectedSession !== null &&
            selectedSession.currentCandidateId !== '' &&
            selectedSession.active !== true &&
            shouldLoad(votingLoadHistory, `votes-${selectedSession._id}-${selectedSession.currentCandidateId}`)))
      )
        dispatchGetCandidateVotes(selectedSession._id, selectedSession.currentCandidateId);
    },
    [dispatchGetCandidateVotes, getCandidateVotesError, isGettingCandidateVotes, selectedSession, votingLoadHistory]
  );

  const onSubtitlePress = React.useCallback(() => {
    if (selectedSession) {
      setShowingSessions(!showingSessions);
    }
  }, [selectedSession, showingSessions]);

  const onPressStartStopSession = React.useCallback(() => {
    if (selectedSession) {
      if (selectedSession.active && selectedSession.operatorEmail === user.email) {
        dispatchStopSession(selectedSession);
      } else if (!selectedSession.active) {
        dispatchStartSession(selectedSession);
      }
    }
  }, [dispatchStartSession, dispatchStopSession, selectedSession, user.email]);

  const onRefresh = React.useCallback(() => {
    loadData(true);
    loadVotes(true);
  }, [loadData, loadVotes]);

  React.useEffect(() => {
    if (selectedSessionId === '') {
      setShowingSessions(true);
    } else if (Dimensions.get('window').width < 1400) {
      setShowingSessions(false);
    }
  }, [selectedSessionId]);

  React.useEffect(() => {
    if (sessionArray.length > 0) {
      if (selectedSessionId === '') {
        const now = moment();

        for (const session of sessionArray) {
          if (session.active) {
            dispatchSelectSession(session);
            return;
          }
        }

        for (const session of sessionArray) {
          if (moment(session.startDate).isSameOrAfter(now)) {
            dispatchSelectSession(session);
            return;
          }
        }
      } else {
        const index = sessionArray.findIndex((session) => session._id === selectedSessionId);

        if (index >= 0) {
          dispatchSelectSession(sessionArray[index]);
        } else {
          dispatchUnselectSession();
        }
      }
    } else {
      if (selectedSessionId !== '') {
        dispatchUnselectSession();
      }
    }
  }, [dispatchSelectSession, dispatchUnselectSession, selectedSessionId, sessionArray]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadVotes(false);
    }
  }, [isFocused, loadVotes, user.sessionToken]);

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
          <FlatList data={sessionArray} keyExtractor={sessionKeyExtractor} renderItem={renderSessionItem} />
        </View>
      </View>
    );
  };

  const renderCandidateList = () => {
    return (
      <View style={styles.sectionContent}>
        <SubHeader title="Candidates" />

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
          {selectedSession !== null && (
            <View style={styles.headerChildren}>
              {selectedSession.operatorEmail === user.email || selectedSession.operatorEmail === '' ? (
                <TouchableOpacity
                  activeOpacity={0.6}
                  disabled={isStartingSession || isStoppingSession}
                  onPress={onPressStartStopSession}
                >
                  <Text style={styles.headerButtonText}>{selectedSession.active ? 'Stop' : 'Start'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.headerButtonText, { color: theme.COLORS.BLACK }]}>
                  Operator: {selectedSession.operatorEmail}
                </Text>
              )}
            </View>
          )}
        </SubHeader>

        {selectedSession !== null && <SessionControls session={selectedSession} />}
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
            <TouchableOpacity
              style={{ opacity: selectedSession === null || selectedSession.active === true ? 0.4 : 1 }}
              activeOpacity={0.6}
              disabled={selectedSession === null || selectedSession.active === true}
              onPress={dispatchEditSession}
            >
              <Text style={styles.headerButtonText}>Edit Session</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={dispatchNewSession}>
              <Text style={styles.headerButtonText}>New Session</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              opacity: selectedSession?.operatorEmail === user.email ? 0.4 : 1
            }}
            activeOpacity={0.6}
            disabled={selectedSession?.operatorEmail === user.email}
            onPress={dispatchOpenPresentationMode}
          >
            <Icon
              style={styles.refreshIcon}
              family="MaterialCommunityIcons"
              name="television-play"
              size={20}
              color={theme.COLORS.PRIMARY}
            />
          </TouchableOpacity>

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
    marginLeft: 8,
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
