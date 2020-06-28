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

  const [expanded, setExpanded] = React.useState<boolean>(false);

  const dispatch = useDispatch();

  const onPressExpand = React.useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const getExcuseRequester = (excuse: TPendingExcuse) => {
    if (directory.hasOwnProperty(excuse.email)) {
      return `${directory[excuse.email].givenName} ${directory[excuse.email].familyName}`;
    }

    return excuse.email;
  };

  const renderExpanded = () => {
    return <View style={styles.expandedContent}></View>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.content}>
          <TouchableOpacity activeOpacity={0.4} disabled={!user.privileged} onPress={onPressExpand}></TouchableOpacity>
        </View>
      </View>

      {expanded && renderExpanded()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16
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
  eventDescriptionWrapper: {
    marginTop: 8
  },
  eventDescription: {
    fontFamily: 'OpenSans',
    fontSize: 15
  },
  expandedContent: {
    marginTop: 16
  },
  splitPropertyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  splitProperty: {
    marginLeft: 16,
    marginRight: 16
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
    marginTop: 16,
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
