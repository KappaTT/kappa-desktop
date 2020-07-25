import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TSession } from '@backend/voting';

const SessionControls: React.FC<{ session: TSession }> = ({ session }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const kappaLoadHistory = useSelector((state: TRedux) => state.kappa.loadHistory);
  const votingLoadHistory = useSelector((state: TRedux) => state.voting.loadHistory);
  const candidateArray = useSelector((state: TRedux) => state.voting.candidateArray);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);

  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.candidateArea}></View>
      <View style={styles.controlsArea}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  candidateArea: {},
  controlsArea: {}
});

export default SessionControls;
