import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TSession } from '@backend/voting';
import Icon from '@components/Icon';

const SessionItem: React.FC<{ session: TSession }> = ({ session }) => {
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);

  const dispatch = useDispatch();
  const dispatchSelectSession = React.useCallback(() => dispatch(_voting.selectSession(session)), [dispatch]);

  const isSelected = React.useMemo(() => selectedSessionId === session._id, [selectedSessionId, session._id]);

  const onPressSelect = React.useCallback(() => {
    dispatchSelectSession();
  }, [dispatchSelectSession]);

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
            <Text style={[styles.name, session.active && { color: theme.COLORS.PRIMARY_GREEN }]}>
              {session.name || 'Untitled'}
            </Text>

            <Text style={styles.classification}>
              <Text style={styles.subText}>
                {session.startDate && moment(session.startDate).format('ddd LL h:mm A')}
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

export default SessionItem;
