import React from 'react';
import { StyleSheet, View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import moment from 'moment';

import { ParamType } from '@navigation/NavigationTypes';
import { TRedux } from '@reducers';
import { _auth, _kappa, _nav } from '@reducers/actions';
import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import { Header, Icon } from '@components';

const VotingManagementContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  const isFocused = useIsFocused();

  const user = useSelector((state: TRedux) => state.auth.user);
  const loadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const isGettingCandidates = false;
  const getCandidatesError = false;

  const [showing, setShowing] = React.useState<'Editing' | 'Voting'>('Editing');

  const dispatch = useDispatch();

  const refreshing = React.useMemo(() => isGettingCandidates, [isGettingCandidates]);

  const loadData = React.useCallback((force: boolean) => {}, []);

  const onRefresh = React.useCallback(() => {
    loadData(true);
  }, [loadData]);

  const onPressShowing = React.useCallback(() => {
    if (showing === 'Voting') {
      setShowing('Editing');
    } else {
      setShowing('Voting');
    }
  }, [showing]);

  React.useEffect(() => {
    if (isFocused && user.sessionToken) {
      loadData(false);
    }
  }, [isFocused, loadData, user.sessionToken]);

  return (
    <View style={styles.container}>
      <Header title="Voting Management">
        <View style={styles.headerChildren}></View>
      </Header>

      <View style={styles.content}></View>
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
  }
});

export default VotingManagementContent;
