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

    // any other criteria in the future: dues, messages from exec, reminders, etc?

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

  const onPressMessages = React.useCallback(() => {
    onPressElement({
      type: 'NAV',
      label: 'Messages',
      target: 'MessagesStack'
    });
  }, [onPressElement]);

  if (!authorized) {
    return <React.Fragment />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>Kappa Theta Tau</Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            {`${user.familyName}, ${user.givenName}`}
          </Text>
        </View>

        <View
          style={[
            styles.messagesCircle,
            selectedPageLabel === 'Messages' && { backgroundColor: `${theme.COLORS.PRIMARY}0f` }
          ]}
        >
          <TouchableOpacity activeOpacity={0.6} onPress={onPressMessages}>
            <Icon
              style={styles.messagesIcon}
              family="Feather"
              name="message-square"
              size={24}
              color={selectedPageLabel === 'Messages' ? theme.COLORS.PRIMARY : theme.COLORS.DARK_GRAY}
            />

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
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  titleArea: {
    flex: 1,
    paddingRight: 4
  },
  title: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    lineHeight: 13,
    color: theme.COLORS.DARK_GRAY
  },
  subtitle: {
    marginTop: -2,
    fontFamily: 'OpenSans',
    fontSize: 13,
    color: theme.COLORS.DARK_GRAY
  },
  messagesCircle: {
    marginTop: -4,
    borderRadius: 8,
    backgroundColor: theme.COLORS.WHITE
  },
  messagesIcon: {
    padding: 4
  },
  badgeWrapper: {
    position: 'absolute',
    top: 2,
    right: 1
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
    flex: 1,
    flexDirection: 'column'
  }
});

export default Sidebar;
