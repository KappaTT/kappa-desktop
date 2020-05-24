import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _nav } from '@reducers/actions';
import { theme } from '@constants';
import { navigate } from '@navigation/NavigationService';
import SidebarLayout, { TSidebarElement } from '@navigation/SidebarLayout';
import SidebarDropdown from '@components/SidebarDropdown';
import SidebarNavButton from '@components/SidebarNavButton';
import Icon from '@components/Icon';

const Sidebar: React.FC = () => {
  const authorized = useSelector((state: TRedux) => state.auth.authorized);
  const user = useSelector((state: TRedux) => state.auth.user);
  const selectedPageLabel = useSelector((state: TRedux) => state.nav.selectedPageLabel);
  const pendingExcusesArray = useSelector((state: TRedux) => state.kappa.pendingExcusesArray);

  const [sidebarNav, setSidebarNav] = React.useState<{ [label: string]: TSidebarElement }>(() => {
    const nav = {};

    for (const element of Object.values(SidebarLayout)) {
      nav[element.label] = element;
    }

    return nav;
  });

  const dispatch = useDispatch();
  const dispatchSetSelectedPage = React.useCallback((label: string) => dispatch(_nav.setSelectedPage(label)), [
    dispatch
  ]);
  const dispatchSignOut = React.useCallback(() => dispatch(_auth.signOut()), [dispatch]);

  const unreadMessages = React.useMemo(() => {
    if (pendingExcusesArray.length > 0) return true;

    return false;
  }, [pendingExcusesArray]);

  const onPressElement = React.useCallback(
    (element: TSidebarElement) => {
      if (element.type === 'DROP') {
        // Set this element to be expanded

        setSidebarNav({
          ...sidebarNav,
          [element.label]: {
            ...element,
            expanded: !element.expanded
          }
        });
      } else if (element.target) {
        navigate(element.target);
        dispatchSetSelectedPage(element.label);
      } else {
        switch (element.label) {
          case 'Sign Out':
            dispatchSignOut();
            break;
        }
      }
    },
    [dispatchSetSelectedPage, dispatchSignOut, sidebarNav]
  );

  if (!authorized) {
    return <React.Fragment />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>Kappa Theta Tau</Text>
          <Text style={styles.subtitle}>{`${user.familyName}, ${user.givenName}`}</Text>
        </View>

        <View style={styles.messagesArea}>
          <TouchableOpacity activeOpacity={0.6} onPress={() => console.log('TODO')}>
            <Icon family="Feather" name="message-square" size={24} color={theme.COLORS.DARK_GRAY} />

            {unreadMessages && (
              <View style={styles.badgeWrapper}>
                <View style={styles.badgeContainer}>
                  <View style={styles.badge} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navigationArea}>
        {SidebarLayout.filter((element) => user.privileged || !element.privileged).map((element) => (
          <React.Fragment key={element.label}>
            {element.type === 'DROP' && (
              <SidebarDropdown
                element={sidebarNav[element.label]}
                expanded={sidebarNav[element.label].expanded}
                selectedLabel={selectedPageLabel}
                onPress={onPressElement}
              />
            )}
            {element.type === 'NAV' && (
              <SidebarNavButton
                element={sidebarNav[element.label]}
                selected={element.label === selectedPageLabel}
                onPress={onPressElement}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    borderRightColor: theme.COLORS.LIGHT_BORDER,
    borderRightWidth: 1
  },
  headerArea: {
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    lineHeight: 13,
    color: theme.COLORS.DARK_GRAY
  },
  subtitle: {
    fontFamily: 'OpenSans',
    fontSize: 13,
    lineHeight: 13,
    color: theme.COLORS.DARK_GRAY
  },
  titleArea: {},
  messagesArea: {
    position: 'absolute',
    right: 0,
    height: '100%',
    paddingHorizontal: 8,
    backgroundColor: theme.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  badgeWrapper: {
    position: 'absolute',
    top: -2,
    right: -3
  },
  badgeContainer: {
    borderColor: theme.COLORS.WHITE,
    borderWidth: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.COLORS.PRIMARY
  },
  navigationArea: {
    marginTop: 12,
    flex: 1,
    flexDirection: 'column'
  }
});

export default Sidebar;
