import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth } from '@reducers/actions';
import { theme } from '@constants';
import { navigate } from '@navigation/NavigationService';
import SidebarLayout, { TSidebarElement } from '@navigation/SidebarLayout';
import SidebarDropdown from '@components/SidebarDropdown';
import SidebarNavButton from '@components/SidebarNavButton';

const Sidebar: React.FC = () => {
  const authorized = useSelector((state: TRedux) => state.auth.authorized);
  const user = useSelector((state: TRedux) => state.auth.user);
  const selectedPageLabel = useSelector((state: TRedux) => state.nav.selectedPageLabel);

  const [sidebarNav, setSidebarNav] = React.useState<{ [label: string]: TSidebarElement }>(() => {
    const nav = {};

    for (const element of Object.values(SidebarLayout)) {
      nav[element.label] = element;
    }

    return nav;
  });

  const dispatch = useDispatch();

  const onPressElement = React.useCallback(
    (element: TSidebarElement) => {
      if (element.type === 'DROP') {
        setSidebarNav({
          ...sidebarNav,
          [element.label]: {
            ...element,
            expanded: !element.expanded
          }
        });
      } else if (element.target) {
        navigate(element.target);
      }
    },
    [sidebarNav]
  );

  if (!authorized) {
    return <React.Fragment />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>Kappa Theta Tau</Text>
        <Text style={styles.subtitle}>{`${user.familyName}, ${user.givenName}`}</Text>
      </View>

      <View style={styles.messagesArea} />

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
    paddingHorizontal: 16
  },
  headerArea: {
    height: 56,
    paddingTop: 16
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
  messagesArea: {},
  navigationArea: {
    flex: 1,
    flexDirection: 'column'
  }
});

export default Sidebar;
