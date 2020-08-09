import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TCandidate } from '@backend/voting';
import Icon from '@components/Icon';

const SessionCandidateItem: React.FC<{ candidate: TCandidate }> = ({ candidate }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const sessionArray = useSelector((state: TRedux) => state.voting.sessionArray);
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);

  const dispatch = useDispatch();
  const dispatchSelectSessionCandidate = React.useCallback(
    () =>
      dispatch(
        _voting.saveSession(
          user,
          {
            currentCandidateId: candidate._id
          },
          selectedSessionId
        )
      ),
    [candidate._id, dispatch, selectedSessionId, user]
  );

  const selectedSession = React.useMemo(() => {
    const index = sessionArray.findIndex((session) => session._id === selectedSessionId);

    if (index >= 0) {
      return sessionArray[index];
    }

    return null;
  }, [selectedSessionId, sessionArray]);

  const isSelected = React.useMemo(() => selectedSession?.currentCandidateId === candidate._id, [
    candidate._id,
    selectedSession
  ]);

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
            <View style={styles.contentHeader}>
              <Text style={styles.name}>
                {candidate.familyName}, {candidate.givenName}
              </Text>
              {candidate.approved && (
                <Icon
                  style={styles.approvedIcon}
                  family="Feather"
                  name="check"
                  size={18}
                  color={theme.COLORS.PRIMARY_GREEN}
                />
              )}
            </View>

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
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  approvedIcon: {
    marginLeft: 8
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
