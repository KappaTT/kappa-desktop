import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TCandidate } from '@backend/voting';
import Icon from '@components/Icon';

const SessionCandidateItem: React.FC<{ candidate: TCandidate }> = ({ candidate }) => {
  const currentCandidateId = useSelector((state: TRedux) => state.voting.currentCandidateId);

  const dispatch = useDispatch();
  const dispatchSelectSessionCandidate = React.useCallback(() => dispatch(_voting.selectSessionCandidate(candidate)), [
    candidate,
    dispatch
  ]);

  const isSelected = React.useMemo(() => currentCandidateId === candidate._id, [candidate._id, currentCandidateId]);

  const onPressSelect = React.useCallback(() => {
    dispatchSelectSessionCandidate();
  }, [dispatchSelectSessionCandidate]);

  return (
    <View
      style={[
        styles.container,
        isSelected && {
          backgroundColor: theme.COLORS.PRIMARY_LIGHT
        }
      ]}
    >
      <TouchableOpacity activeOpacity={0.4} disabled={isSelected} onPress={onPressSelect}>
        <View style={styles.contentWrapper}>
          <View style={styles.content}>
            <Text style={[styles.name, candidate.approved && { color: theme.COLORS.PRIMARY_GREEN }]}>
              {candidate.familyName}, {candidate.givenName}
            </Text>

            <Text style={styles.classification}>
              <Text style={styles.subText}>
                {candidate.classYear} in {candidate.major}
              </Text>
            </Text>
          </View>

          {isSelected && (
            <View style={styles.selectIconContainer}>
              <Icon family="MaterialIcons" name="keyboard-arrow-right" size={36} color={theme.COLORS.PRIMARY} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  contentWrapper: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  name: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 16
  },
  classification: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 14
  },
  subText: {
    color: theme.COLORS.DARK_GRAY
  },
  selectIconContainer: {}
});

export default SessionCandidateItem;
