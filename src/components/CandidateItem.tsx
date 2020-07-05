import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui } from '@reducers/actions';
import { theme } from '@constants';
import { TCandidate } from '@backend/voting';
import Icon from '@components/Icon';

const CandidateItem: React.FC<{ candidate: TCandidate; onPressSelect?(candidate: TCandidate): void }> = ({
  candidate,
  onPressSelect = (candidate) => {}
}) => {
  const dispatch = useDispatch();

  const _onPressSelect = React.useCallback(() => {
    onPressSelect(candidate);
  }, [candidate, onPressSelect]);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.4} onPress={_onPressSelect}></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  }
});

export default CandidateItem;
