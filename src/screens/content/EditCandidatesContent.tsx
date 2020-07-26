import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa, _nav, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { shouldLoad } from '@services/kappaService';
import { TCandidate } from '@backend/voting';
import { CandidateItem, Header, Icon, CandidateViewer, SubHeader } from '@components';

const EditCandidatesContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const kappaLoadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const votingLoadHistory = useSelector((state: TRedux) => state.voting.loadHistory);
  const selectedCandidateEmail = useSelector((state: TRedux) => state.voting.selectedCandidateEmail);
  const isGettingEvents = useSelector((state: TRedux) => state.kappa.isGettingEvents);
  const getEventsError = useSelector((state: TRedux) => state.kappa.getEventsError);
  const approvedCandidateArray = useSelector((state: TRedux) => state.voting.approvedCandidateArray);
  const unapprovedCandidateArray = useSelector((state: TRedux) => state.voting.unapprovedCandidateArray);
  const isGettingCandidates = useSelector((state: TRedux) => state.voting.isGettingCandidates);
  const getCandidatesError = useSelector((state: TRedux) => state.voting.getCandidatesError);

  const dispatch = useDispatch();
  const dispatchGetEvents = React.useCallback(() => dispatch(_kappa.getEvents(user)), [dispatch, user]);
  const dispatchGetCandidates = React.useCallback(() => dispatch(_voting.getCandidates(user)), [dispatch, user]);
  const dispatchEditNewCandidate = React.useCallback(() => dispatch(_voting.editCandidate()), [dispatch]);
  const dispatchSelectCandidate = React.useCallback(
    (candidate: TCandidate) => dispatch(_voting.selectCandidate(candidate.email)),
    [dispatch]
  );
  const dispatchUnselectCandidate = React.useCallback(() => dispatch(_voting.unselectCandidate()), [dispatch]);

  const refreshing = React.useMemo(() => isGettingCandidates, [isGettingCandidates]);

  const loadData = React.useCallback(
    (force: boolean) => {
      if (!isGettingEvents && (force || (!getEventsError && shouldLoad(kappaLoadHistory, 'events'))))
        dispatchGetEvents();
      if (!isGettingCandidates && (force || (!getCandidatesError && shouldLoad(votingLoadHistory, 'candidates'))))
        dispatchGetCandidates();
    },
    [
      dispatchGetCandidates,
      dispatchGetEvents,
      getCandidatesError,
      getEventsError,
      isGettingCandidates,
      isGettingEvents,
      kappaLoadHistory,
      votingLoadHistory
    ]
  );

  const onRefresh = React.useCallback(() => {
    loadData(true);
  }, [loadData]);

  React.useEffect(() => {
    if (approvedCandidateArray.length > 0) {
      if (selectedCandidateEmail === '') {
        dispatchSelectCandidate(approvedCandidateArray[0]);
      }
    } else if (unapprovedCandidateArray.length > 0) {
      if (selectedCandidateEmail === '') {
        dispatchSelectCandidate(unapprovedCandidateArray[0]);
      }
    } else {
      if (selectedCandidateEmail !== '') {
        dispatchUnselectCandidate();
      }
    }
  }, [
    approvedCandidateArray,
    dispatchSelectCandidate,
    dispatchUnselectCandidate,
    selectedCandidateEmail,
    unapprovedCandidateArray
  ]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  const keyExtractor = React.useCallback((item: TCandidate) => item._id, []);

  const renderItem = ({ item }: { item: TCandidate }) => {
    return <CandidateItem candidate={item} />;
  };

  const renderCandidateList = () => {
    return (
      <View style={styles.sectionContent}>
        <SubHeader title="Candidates" />
        <View style={styles.candidateList}>
          <FlatList data={approvedCandidateArray} keyExtractor={keyExtractor} renderItem={renderItem} />
          <FlatList data={unapprovedCandidateArray} keyExtractor={keyExtractor} renderItem={renderItem} />
        </View>
      </View>
    );
  };

  const renderCandidateDetails = () => {
    return (
      <View style={styles.sectionContent}>
        <SubHeader title="Candidate Details" />
        <ScrollView>
          <CandidateViewer />
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Candidates">
        <View style={styles.headerChildren}>
          <View style={styles.headerButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} onPress={dispatchEditNewCandidate}>
              <Text style={styles.headerButtonText}>New Candidate</Text>
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
  candidateListSection: {
    width: 400
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
  candidateList: {
    justifyContent: 'flex-start'
  }
});

export default EditCandidatesContent;
