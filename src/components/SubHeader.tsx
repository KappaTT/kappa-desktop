import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { theme } from '@constants';
import { HEADER_HEIGHT } from '@services/utils';
import Icon from '@components/Icon';

const SubHeader: React.FC<{
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
    height: 24,
    paddingHorizontal: 16,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY,
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
    fontSize: 14
  },
  subtitleArea: {
    flexDirection: 'row'
  },
  subtitle: {
    fontFamily: 'OpenSans',
    fontSize: 14
  },
  childrenArea: {
    flex: 1,
    height: '100%',
    marginLeft: 16
  }
});

export default SubHeader;
