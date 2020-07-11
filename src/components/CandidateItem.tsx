import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TCandidate } from '@backend/voting';
import Icon from '@components/Icon';

const CandidateItem: React.FC<{ candidate: TCandidate }> = ({ candidate }) => {
  const selectedCandidateEmail = useSelector((state: TRedux) => state.voting.selectedCandidateEmail);

  const dispatch = useDispatch();
  const dispatchSelectCandidate = React.useCallback(
    (candidate: TCandidate) => dispatch(_voting.selectCandidate(candidate.email)),
    [dispatch]
  );

  const isSelected = React.useMemo(() => selectedCandidateEmail === candidate.email, [
    candidate.email,
    selectedCandidateEmail
  ]);

  const onPressSelect = React.useCallback(() => {
    dispatchSelectCandidate(candidate);
  }, [candidate, dispatchSelectCandidate]);

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
              <Text style={styles.email}>{candidate.email}</Text>
            </Text>

            <Text style={styles.classification}>
              Year:<Text style={styles.classYear}>{candidate.classYear}</Text>
              Major:<Text style={styles.major}>{candidate.major}</Text>
            </Text>
          </View>

          <View style={styles.selectIconContainer}>
            <Icon family="MaterialIcons" name="keyboard-arrow-right" size={36} color={theme.COLORS.PRIMARY} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 8,
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
  email: {
    marginLeft: 8,
    fontFamily: 'OpenSans',
    fontSize: 14,
    color: theme.COLORS.DARK_GRAY
  },
  classification: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 14
  },
  classYear: {
    marginLeft: 4,
    marginRight: 8,
    color: theme.COLORS.DARK_GRAY
  },
  major: {
    marginLeft: 4,
    color: theme.COLORS.DARK_GRAY
  },
  selectIconContainer: {}
});

export default CandidateItem;
