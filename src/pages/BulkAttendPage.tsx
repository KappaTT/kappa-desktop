import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _kappa } from '@reducers/actions';
import { hasValidCheckIn } from '@services/kappaService';
import { theme } from '@constants';
import { Icon, CheckList } from '@components';

const BulkAttendPage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const eventArray = useSelector((state: TRedux) => state.kappa.eventArray);
  const directoryArray = useSelector((state: TRedux) => state.kappa.directoryArray);
  const records = useSelector((state: TRedux) => state.kappa.records);
  const bulkAttendanceEventId = useSelector((state: TRedux) => state.kappa.bulkAttendanceEventId);
  const isCreatingBulkAttendance = useSelector((state: TRedux) => state.kappa.isCreatingBulkAttendance);

  const selectedEvent = React.useMemo(() => eventArray.find((event) => event._id === bulkAttendanceEventId) || null, [
    bulkAttendanceEventId,
    eventArray
  ]);

  const [emails, setEmails] = React.useState<string[]>([]);

  const dispatch = useDispatch();
  const dispatchCreateBulkAttendance = React.useCallback(
    () => dispatch(_kappa.createBulkAttendance(user, bulkAttendanceEventId, emails)),
    [bulkAttendanceEventId, dispatch, emails, user]
  );

  const richBrotherOptions = React.useMemo(
    () => directoryArray.filter((brother) => !hasValidCheckIn(records, brother.email, bulkAttendanceEventId, false)),
    [bulkAttendanceEventId, directoryArray, records]
  );

  const brotherOptions = React.useMemo(
    () =>
      richBrotherOptions.map((brother) => ({
        id: brother.email,
        title: `${brother.familyName}, ${brother.givenName}`
      })),
    [richBrotherOptions]
  );

  const readyToSave = React.useMemo(() => !(emails.length === 0), [emails]);

  const selectedBrothers = React.useMemo(() => {
    const brothers = {};

    for (const email of emails) {
      brothers[email] = true;
    }

    return brothers;
  }, [emails]);

  const richSelectedBrothers = React.useMemo(
    () => directoryArray.filter((brother) => selectedBrothers[brother.email] === true),
    [directoryArray, selectedBrothers]
  );

  const onChangeSelectedBrothers = React.useCallback(
    (email: string) => {
      const newBrothers = [];

      for (const brother of directoryArray) {
        if (
          (brother.email !== email && selectedBrothers[brother.email] === true) ||
          (brother.email === email && selectedBrothers[brother.email] !== true)
        ) {
          newBrothers.push(brother.email);
        }
      }

      setEmails(newBrothers);
    },
    [directoryArray, selectedBrothers]
  );

  const onPressAddAll = React.useCallback(() => {
    const newBrothers = richBrotherOptions.map((brother) => brother.email);

    setEmails(newBrothers);
  }, [richBrotherOptions]);

  const onPressClear = React.useCallback(() => {
    setEmails([]);
  }, []);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isCreatingBulkAttendance} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Adding Attendance</Text>
          {selectedEvent !== null && <Text style={styles.subtitleText}>{selectedEvent.title}</Text>}
        </View>

        <View style={styles.saveWrapper}>
          {isCreatingBulkAttendance ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave}
              onPress={dispatchCreateBulkAttendance}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderBrotherSelectionSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Eligible Brothers</Text>
              <Text style={[styles.propertyHeaderRequired, { flex: 1 }]}>*</Text>

              <TouchableOpacity activeOpacity={0.6} style={{ marginRight: 16 }} onPress={onPressClear}>
                <Text style={styles.propertyButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.6} onPress={onPressAddAll}>
                <Text style={styles.propertyButtonText}>Add All</Text>
              </TouchableOpacity>
            </View>

            <CheckList options={brotherOptions} selected={selectedBrothers} onChange={onChangeSelectedBrothers} />

            <Text style={styles.description}>
              Select the brothers you wish to mark as having attended the vent. This list only shows brothers who
              haven't already checked in or been excused.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderSelectedBrothersSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Brothers to Add</Text>
            </View>

            {richSelectedBrothers.map((brother) => (
              <View key={brother._id} style={styles.selectedBrother}>
                <Text style={styles.brotherName}>
                  {brother.familyName}, {brother.givenName}
                </Text>
              </View>
            ))}

            <Text style={styles.description}>
              All brothers in this list will be checked into the event. Please double check because once they are
              checked in, you are not allowed to remove them. Note: brothers who have already checked in or been exucsed
              will not show up to select.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDivider = (readyStatus: boolean) => {
    return (
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
        {readyStatus !== null && (
          <React.Fragment>
            <Icon
              style={styles.dividerIcon}
              family="Feather"
              name="arrow-right-circle"
              size={20}
              color={readyStatus ? theme.COLORS.PRIMARY : theme.COLORS.BORDER}
            />
            <View style={styles.divider} />
          </React.Fragment>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{renderHeader()}</View>

      <View style={styles.content}>
        <View style={styles.section}>{renderBrotherSelectionSection()}</View>

        {renderDivider(null)}

        <View style={styles.section}>{renderSelectedBrothersSection()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    position: 'absolute',
    height: 44,
    top: 0,
    left: 0,
    right: 0,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontFamily: 'OpenSans',
    fontSize: 16
  },
  subtitleText: {
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
  },
  saveWrapper: {
    position: 'absolute',
    right: 0
  },
  saveText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.PRIMARY
  },
  saveLoader: {
    paddingHorizontal: 16
  },
  cancelWrapper: {
    position: 'absolute',
    left: 0
  },
  cancelText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.DARK_GRAY
  },
  content: {
    marginTop: 44,
    minHeight: 640,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8
  },
  section: {
    flex: 1
  },
  sectionContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8
  },
  scrollContent: {
    paddingBottom: 16
  },
  propertyHeaderContainer: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row'
  },
  propertyHeader: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  propertyHeaderRequired: {
    marginLeft: 2,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.PRIMARY
  },
  propertyButtonText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
    color: theme.COLORS.PRIMARY
  },
  description: {
    marginTop: 12,
    fontFamily: 'OpenSans',
    fontSize: 12
  },
  multilineInput: {
    height: 128
  },
  dividerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    flexGrow: 1,
    borderLeftColor: theme.COLORS.LIGHT_BORDER,
    borderLeftWidth: 1
  },
  dividerIcon: {
    marginVertical: 8
  },
  selectedBrother: {
    width: '100%',
    height: 48,
    backgroundColor: `${theme.COLORS.WHITE}DF`,
    borderBottomColor: theme.COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  brotherName: {
    fontFamily: 'OpenSans',
    fontSize: 15,
    color: theme.COLORS.BLACK
  }
});

export default BulkAttendPage;
