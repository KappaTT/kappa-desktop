import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { theme } from '@constants';
import { TPendingExcuse } from '@backend/kappa';
import RoundButton from '@components/RoundButton';
import Icon from '@components/Icon';
import Switch from '@components/Switch';

const PendingExcuseItem: React.FC<{ excuse: TPendingExcuse }> = ({ excuse }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const isApprovingExcuse = useSelector((state: TRedux) => state.kappa.isApprovingExcuse);
  const isRejectingExcuse = useSelector((state: TRedux) => state.kappa.isRejectingExcuse);

  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [readyToDelete, setReadyToDelete] = React.useState<boolean>(false);

  const dispatch = useDispatch();
  const dispatchApproveExcuse = React.useCallback(() => dispatch(_kappa.approveExcuse(user, excuse)), [
    dispatch,
    user,
    excuse
  ]);
  const dispatchRejectExcuse = React.useCallback(() => dispatch(_kappa.rejectExcuse(user, excuse)), [
    dispatch,
    user,
    excuse
  ]);

  const onPressExpand = React.useCallback(() => {
    setExpanded(!expanded);
    setReadyToDelete(false);
  }, [expanded]);

  const onChangeReadyToDelete = React.useCallback((newValue: boolean) => {
    setReadyToDelete(newValue);
  }, []);

  const getExcuseRequester = React.useCallback(
    (excuse: TPendingExcuse) => {
      if (directory.hasOwnProperty(excuse.email)) {
        return `${directory[excuse.email].givenName} ${directory[excuse.email].familyName}`;
      }

      return excuse.email;
    },
    [directory]
  );

  const excuseRequestor = React.useMemo(() => getExcuseRequester(excuse), [excuse, getExcuseRequester]);
  const excuseStart = React.useMemo(() => moment(excuse.start).format('MM/DD'), [excuse.start]);

  const renderExpanded = () => {
    return (
      <View style={styles.expandedContent}>
        <View style={styles.dangerZone}>
          <View style={styles.editZone}>
            <View style={styles.warning}>
              <Text style={styles.zoneLabel}>Approve</Text>
              <Text style={styles.description}>
                Approving an excuse will count as if they attended the event and will give any associated points
              </Text>
            </View>

            {isApprovingExcuse ? (
              <ActivityIndicator style={styles.zoneIcon} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity disabled={isApprovingExcuse || isRejectingExcuse} onPress={dispatchApproveExcuse}>
                <Icon
                  style={styles.zoneIcon}
                  family="Feather"
                  name="thumbs-up"
                  size={32}
                  color={theme.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.deleteZone}>
            <View style={styles.warning}>
              <Text style={styles.zoneLabel}>Reject</Text>
              <Text style={styles.description}>
                Rejecting an excuse will delete the excuse permanently and is an action that cannot be undone. Please
                double check and be certain you want to reject this excuse.
              </Text>
            </View>

            {isRejectingExcuse ? (
              <ActivityIndicator style={styles.zoneIcon} color={theme.COLORS.PRIMARY} />
            ) : (
              <TouchableOpacity
                style={
                  !readyToDelete && {
                    opacity: 0.4
                  }
                }
                disabled={!readyToDelete || isApprovingExcuse || isRejectingExcuse}
                onPress={dispatchRejectExcuse}
              >
                <Icon
                  style={styles.zoneIcon}
                  family="Feather"
                  name="thumbs-down"
                  size={32}
                  color={theme.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.enableDeleteContainer}>
            <Switch value={readyToDelete} onValueChange={onChangeReadyToDelete} />
            <Text style={styles.readyToDelete}>I am ready to reject this excuse</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.content}>
          <TouchableOpacity activeOpacity={0.4} disabled={!user.privileged} onPress={onPressExpand}>
            <View style={styles.excuseContent}>
              <Text style={styles.excuseRequester}>{excuseRequestor}</Text>

              <View style={styles.excuseEvent}>
                <Text style={styles.excuseEventTitle}>{excuse.title}</Text>
                <Text style={styles.excuseEventStart}>{excuseStart}</Text>
                {excuse.late && <Text style={styles.excuseLate}>LATE</Text>}
              </View>

              <Text style={styles.excuseReason}>{excuse.reason}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {expanded && renderExpanded()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1
  },
  row: {
    width: '100%',
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  content: {
    flex: 1
  },
  excuseContent: {
    paddingTop: 8,
    paddingBottom: 16
  },
  excuseRequester: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 16
  },
  excuseEvent: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  excuseEventTitle: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  excuseEventStart: {
    marginLeft: 8,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  excuseLate: {
    marginLeft: 8,
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    color: theme.COLORS.PRIMARY
  },
  excuseReason: {
    marginTop: 12
  },
  propertyWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  propertyIcon: {
    marginLeft: 8
  },
  propertyText: {
    marginLeft: 4,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13
  },
  expandedContent: {
    marginBottom: 16
  },
  splitPropertyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  splitProperty: {
    marginRight: 24
  },
  propertyHeader: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyValue: {
    marginTop: 4,
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  dangerZone: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.INPUT_ERROR_LIGHT
  },
  editZone: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deleteZone: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  warning: {
    flex: 1,
    marginRight: 8
  },
  zoneLabel: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14
  },
  description: {
    marginTop: 2,
    fontFamily: 'OpenSans',
    fontSize: 12
  },
  zoneIcon: {
    width: 32
  },
  enableDeleteContainer: {
    marginTop: 8,
    marginLeft: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  readyToDelete: {
    marginLeft: 8,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13
  },
  disabledButton: {
    opacity: 0.4
  }
});

export default PendingExcuseItem;
