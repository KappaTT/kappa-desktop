import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa, _ui, _voting } from '@reducers/actions';
import { theme } from '@constants';
import { TSession } from '@backend/voting';
import Icon from '@components/Icon';
import HorizontalSegmentBar from '@components/HorizontalSegmentBar';

const SessionItem: React.FC<{ session: TSession }> = ({ session }) => {
  const selectedSessionId = useSelector((state: TRedux) => state.voting.selectedSessionId);

  const dispatch = useDispatch();
  const dispatchSelectSession = React.useCallback(() => dispatch(_voting.selectSession(session)), [dispatch, session]);

  const isSelected = React.useMemo(() => selectedSessionId === session._id, [selectedSessionId, session._id]);

  const candidateIndex = React.useMemo(
    () => session.candidateOrder.findIndex((candidateId) => candidateId === session.currentCandidateId),
    [session.candidateOrder, session.currentCandidateId]
  );

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
            <View style={styles.contentHeader}>
              <Text style={styles.name}>{session.name || 'Untitled'}</Text>
              {session.active && <Text style={styles.activeText}>ACTIVE</Text>}
            </View>

            <View style={styles.contentBottom}>
              <Text style={styles.classification}>
                <Text style={styles.subText}>
                  {session.startDate && moment(session.startDate).format('MM/DD/YY h:mm A')}
                </Text>
              </Text>

              <View style={styles.barContainer}>
                <HorizontalSegmentBar
                  hideAllLabels={true}
                  borderColor={isSelected ? theme.COLORS.PRIMARY_LIGHT : theme.COLORS.WHITE}
                  data={[
                    {
                      count: candidateIndex,
                      label: 'Complete',
                      color: theme.COLORS.PRIMARY
                    },
                    {
                      count: session.candidateOrder.length - candidateIndex,
                      label: 'Remaining',
                      color: theme.COLORS.BORDER
                    }
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.selectIconContainer}>
            <Icon
              family="MaterialIcons"
              name="keyboard-arrow-right"
              size={36}
              color={isSelected ? theme.COLORS.PRIMARY : theme.COLORS.WHITE}
            />
          </View>
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
  name: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 16
  },
  activeText: {
    marginLeft: 8,
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.PRIMARY
  },
  contentBottom: {
    flexDirection: 'row'
  },
  classification: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 14
  },
  subText: {
    color: theme.COLORS.DARK_GRAY
  },
  barContainer: {
    marginLeft: 8,
    flex: 1
  },
  selectIconContainer: {}
});

export default SessionItem;
