import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { theme } from '@constants';
import { prettyPhone } from '@services/kappaService';
import { Icon, Switch, RadioList, FormattedInput } from '@components';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const getGradYearOptions = () => {
  const options = [];

  const year = new Date().getFullYear();

  const first = `Spring ${year}`;

  options.push({
    id: first,
    title: first
  });

  for (let i = 0; i < 3; i++) {
    const fall = `Fall ${year + i}`;
    const spring = `Spring ${year + i + 1}`;

    options.push({
      id: fall,
      title: fall
    });
    options.push({
      id: spring,
      title: spring
    });
  }

  return options;
};

const EditProfilePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const isUpdatingUser = useSelector((state: TRedux) => state.kappa.isUpdatingUser);

  const [phone, setPhone] = React.useState<string>(user.phone || '');
  const [gradYear, setGradYear] = React.useState<string>(user.gradYear || '');

  const dispatch = useDispatch();
  const dispatchUpdateUser = React.useCallback(
    () => dispatch(_kappa.updateUser(user, user.email, { phone, gradYear })),
    [dispatch, user, phone, gradYear]
  );

  const prettyPhoneValue = React.useMemo(() => prettyPhone(phone), [phone]);
  const gradYearOptions = React.useMemo(() => getGradYearOptions(), []);

  const readyToSave = React.useMemo(
    () => !(prettyPhoneValue === '' || prettyPhoneValue === 'Invalid' || gradYear === ''),
    [gradYear, prettyPhoneValue]
  );

  const onChangePhone = React.useCallback((text: string) => {
    setPhone(text);
  }, []);

  const onChangeGradYear = React.useCallback((chosen: string) => {
    setGradYear(chosen);
  }, []);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isUpdatingUser} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Edit Profile</Text>
        </View>

        <View style={styles.saveWrapper}>
          {isUpdatingUser ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave}
              onPress={dispatchUpdateUser}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderContactSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Phone Number</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              placeholderText="phone number"
              maxLength={10}
              value={phone}
              formatter={numberFormatter}
              onChangeText={onChangePhone}
            />

            <Text style={styles.description}>
              Your phone number will be shared with brothers and used if anyone needs to contact you.
            </Text>

            <Text style={styles.description}>
              Please fill out all missing information. Information provided by the university or our official records
              cannot be edited at this time.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderGradYearSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Grad Year</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <RadioList options={gradYearOptions} selected={gradYear} onChange={onChangeGradYear} />

            <Text style={styles.description}>
              Choose the term that you will graduate in, not by credit hours, this is used to determine your points
              requirements and alumni status.
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
        <View style={styles.section}>{renderContactSection()}</View>

        {renderDivider(null)}

        <View style={styles.section}>{renderGradYearSection()}</View>
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
  }
});

export default EditProfilePage;
