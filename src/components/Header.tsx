import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import Icon from '@components/Icon';

const Header: React.FC<{
  title: string;
  subtitle?: string;
  subtitleIsPressable?: boolean;
  onSubtitlePress?(): void;
  children?: React.ReactNode;
}> = ({ title, subtitle = '', subtitleIsPressable = false, onSubtitlePress = () => {}, children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>{title}</Text>

        {subtitle !== '' && (
          <View style={styles.subtitleArea}>
            <Icon family="Feather" name="chevron-right" size={24} color={theme.COLORS.BORDER} />

            <TouchableOpacity activeOpacity={0.6} disabled={!subtitleIsPressable} onPress={onSubtitlePress}>
              <Text
                style={[
                  styles.subtitle,
                  subtitleIsPressable && {
                    color: theme.COLORS.PRIMARY
                  }
                ]}
              >
                {subtitle}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.childrenArea}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    backgroundColor: theme.COLORS.WHITE,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  titleArea: {
    flexDirection: 'row'
  },
  title: {
    fontFamily: 'OpenSans',
    fontSize: 17
  },
  subtitleArea: {
    flexDirection: 'row'
  },
  subtitle: {
    fontFamily: 'OpenSans',
    fontSize: 17
  },
  childrenArea: {
    flex: 1,
    height: '100%',
    marginLeft: 16
  }
});

export default Header;
