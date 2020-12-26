import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _kappa } from '@reducers/actions';
import { theme } from '@constants';
import { prettyPhone, getUserByEmail } from '@services/kappaService';
import { Icon, Switch, RadioList, FormattedInput } from '@components';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const getFirstYearOptions = () => {
  const options = [];

  const year = new Date().getFullYear() - 5;

  for (let i = 0; i < 6; i++) {
    const option = `${year + i}`;

    options.push({
      id: option,
      title: option
    });
  }

  return options;
};

const getGradYearOptions = () => {
  const options = [];

  const year = new Date().getFullYear();

  for (let i = 0; i < 5; i++) {
    const spring = `Spring ${year + i}`;
    const fall = `Fall ${year + i}`;

    options.push({
      id: spring,
      title: spring
    });
    options.push({
      id: fall,
      title: fall
    });
  }

  return options;
};

const getPledgeClassOptions = () => {
  const options = [];

  const year = new Date().getFullYear() - 5;

  for (let i = 0; i < 6; i++) {
    const spring = `Spring ${year + i}`;
    const fall = `Fall ${year + i}`;

    options.push({
      id: spring,
      title: spring
    });
    options.push({
      id: fall,
      title: fall
    });
  }

  return options;
};

const EditProfilePage: React.FC<{
  onPressCancel(): void;
}> = ({ onPressCancel }) => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const directory = useSelector((state: TRedux) => state.kappa.directory);
  const editingUserEmail = useSelector((state: TRedux) => state.kappa.editingUserEmail);
  const isUpdatingUser = useSelector((state: TRedux) => state.kappa.isUpdatingUser);

  const initialUser =
    editingUserEmail === 'NEW' ? null : editingUserEmail === '' ? user : getUserByEmail(directory, editingUserEmail);

  const [email, setEmail] = React.useState<string>(initialUser?.email || '');
  const [phone, setPhone] = React.useState<string>(initialUser?.phone || '');
  const [givenName, setGivenName] = React.useState<string>(initialUser?.givenName || '');
  const [familyName, setFamilyName] = React.useState<string>(initialUser?.familyName || '');
  const [firstYear, setFirstYear] = React.useState<string>(initialUser?.firstYear || '');
  const [gradYear, setGradYear] = React.useState<string>(initialUser?.gradYear || '');
  const [pledgeClass, setPledgeClass] = React.useState<string>(initialUser?.semester || '');
  const [role, setRole] = React.useState<string>(initialUser?.role || '');
  const [privileged, setPrivileged] = React.useState<boolean>(initialUser?.privileged || false);

  const canEditPrivileged = React.useMemo(() => user.privileged, [user.privileged]);
  const canEditWeb = React.useMemo(() => user.privileged && user.role.toLowerCase() === 'web', [
    user.privileged,
    user.role
  ]);

  const dispatch = useDispatch();
  const dispatchUpdateUser = React.useCallback(
    () =>
      dispatch(
        canEditWeb
          ? _kappa.updateUser(user, initialUser ? initialUser.email : '', {
              email: email !== initialUser?.email ? email : undefined,
              phone: phone || '',
              givenName,
              familyName,
              firstYear,
              gradYear: gradYear || '',
              semester: pledgeClass,
              role,
              privileged
            })
          : canEditPrivileged
          ? _kappa.updateUser(user, initialUser ? initialUser.email : '', {
              phone: phone || '',
              givenName,
              familyName,
              firstYear,
              gradYear: gradYear || '',
              semester: pledgeClass
            })
          : _kappa.updateUser(user, initialUser ? initialUser.email : '', {
              phone,
              gradYear
            })
      ),
    [
      dispatch,
      canEditWeb,
      user,
      initialUser,
      email,
      phone,
      givenName,
      familyName,
      firstYear,
      gradYear,
      pledgeClass,
      role,
      privileged,
      canEditPrivileged
    ]
  );

  const prettyPhoneValue = React.useMemo(() => prettyPhone(phone), [phone]);
  const firstYearOptions = React.useMemo(() => getFirstYearOptions(), []);
  const gradYearOptions = React.useMemo(() => getGradYearOptions(), []);
  const pledgeClassOptions = React.useMemo(() => getPledgeClassOptions(), []);

  const readyToSave = React.useMemo(
    () =>
      user.email === editingUserEmail
        ? !(prettyPhoneValue === '' || prettyPhoneValue === 'Invalid' || gradYear === '')
        : true,
    [editingUserEmail, gradYear, prettyPhoneValue, user.email]
  );

  const onChangeEmail = React.useCallback((text: string) => {
    setEmail(text);
  }, []);

  const onChangePhone = React.useCallback((text: string) => {
    setPhone(text);
  }, []);

  const onChangeGivenName = React.useCallback((text: string) => {
    setGivenName(text);
  }, []);

  const onChangeFamilyName = React.useCallback((text: string) => {
    setFamilyName(text);
  }, []);

  const onChangeFirstYear = React.useCallback((chosen: string) => {
    setFirstYear(chosen);
  }, []);

  const onChangeGradYear = React.useCallback((chosen: string) => {
    setGradYear(chosen);
  }, []);

  const onChangePledgeClass = React.useCallback((chosen: string) => {
    setPledgeClass(chosen);
  }, []);

  const onChangeRole = React.useCallback((text: string) => {
    setRole(text);
  }, []);

  const onChangePrivileged = React.useCallback((newValue: boolean) => {
    setPrivileged(newValue);
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
          <Text style={styles.titleText}>{initialUser === null ? 'New' : 'Edit'} Profile</Text>
          {initialUser !== null && (
            <Text style={styles.subtitleText}>
              {initialUser.familyName}, {initialUser.givenName}
            </Text>
          )}
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
            {canEditPrivileged && (
              <React.Fragment>
                <View style={styles.propertyHeaderContainer}>
                  <Text style={styles.propertyHeader}>First Name</Text>
                  <Text style={styles.propertyHeaderRequired}>*</Text>
                </View>

                <FormattedInput
                  placeholderText="ex: Jeff"
                  maxLength={48}
                  value={givenName}
                  onChangeText={onChangeGivenName}
                />

                <View style={styles.propertyHeaderContainer}>
                  <Text style={styles.propertyHeader}>Last Name</Text>
                  <Text style={styles.propertyHeaderRequired}>*</Text>
                </View>

                <FormattedInput
                  placeholderText="ex: Taylor-Chang"
                  maxLength={48}
                  value={familyName}
                  onChangeText={onChangeFamilyName}
                />

                <View style={styles.propertyHeaderContainer}>
                  <Text style={styles.propertyHeader}>Email</Text>
                  <Text style={styles.propertyHeaderRequired}>*</Text>
                </View>

                <FormattedInput
                  style={!canEditWeb && styles.disabledInput}
                  placeholderText="ex: jjt4@illinois.edu"
                  maxLength={48}
                  editable={canEditWeb}
                  value={email}
                  onChangeText={onChangeEmail}
                />

                <Text style={styles.description}>
                  This email is the one they will sign in with. It must be a valid gmail account. If the user does not
                  have an Illinois.edu email managed by gmail (newer freshmen or those who opted out), they must use a
                  personal gmail account.
                </Text>

                <Text style={styles.description}>Please contact the web chair to update this.</Text>
              </React.Fragment>
            )}

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
              This phone number will be shared with brothers and used if anyone needs to contact you.
            </Text>

            {!canEditPrivileged && (
              <Text style={styles.description}>
                Some records can only be updated by exec. Please contact a member of exec to update them for you!
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderYearSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            {canEditPrivileged && (
              <React.Fragment>
                <View style={styles.propertyHeaderContainer}>
                  <Text style={styles.propertyHeader}>Freshman Year</Text>
                  <Text style={styles.propertyHeaderRequired}>*</Text>
                </View>

                <RadioList options={firstYearOptions} selected={firstYear} onChange={onChangeFirstYear} />

                <Text style={styles.description}>
                  The year you entered the university, for instance a student who entered in 2017 and graduates in 2021
                  would select 2017.
                </Text>
              </React.Fragment>
            )}

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Grad Year</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <RadioList options={gradYearOptions} selected={gradYear} onChange={onChangeGradYear} />

            <Text style={styles.description}>
              Choose the term for graduation, not by credit hours, this is used to determine points requirements.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderPledgeSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Pledge Class</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <RadioList
              disabled={!canEditPrivileged}
              options={pledgeClassOptions}
              selected={pledgeClass}
              onChange={onChangePledgeClass}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderAdminSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Exec Role</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              style={!canEditWeb && styles.disabledInput}
              placeholderText="ex: Web"
              maxLength={48}
              editable={canEditWeb}
              value={role}
              onChangeText={onChangeRole}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Privileged</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <Switch value={privileged} disabled={!canEditWeb} onValueChange={onChangePrivileged} />

            <Text style={styles.description}>
              If this is enabled, the user will have full admin privileges. This should be enabled for the fewest amount
              of people possible to avoid issues.
            </Text>

            <Text style={styles.description}>For security reasons, these values must be changed by the Web Chair.</Text>
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

        <View style={styles.section}>{renderYearSection()}</View>

        {canEditPrivileged && (
          <React.Fragment>
            {renderDivider(null)}

            <View style={styles.section}>{renderPledgeSection()}</View>

            {renderDivider(null)}

            <View style={styles.section}>{renderAdminSection()}</View>
          </React.Fragment>
        )}
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
  },
  disabledInput: {
    opacity: 0.6
  }
});

export default EditProfilePage;
