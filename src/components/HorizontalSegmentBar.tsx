import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Text, TouchableOpacity } from 'react-native';

import { theme } from '@constants';

const HorizontalLabel: React.FC<{
  count: number;
  label: string;
  pressable: boolean;
  onPress(label: string): void;
}> = ({ count, label, pressable, onPress }) => {
  const onPressLabel = React.useCallback(() => onPress(label), [label, onPress]);

  return (
    <View style={styles.labelWrapper}>
      <TouchableOpacity disabled={!pressable} onPress={onPressLabel}>
        <Text style={[styles.label, pressable && { color: theme.COLORS.PRIMARY }]}>
          {count} {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const HorizontalBar: React.FC<{
  percent: number;
  color: string;
  borderColor: string;
  wrapperStyle: StyleProp<ViewStyle>;
}> = ({ percent, color, borderColor, wrapperStyle }) => {
  return (
    <View style={{ width: `${percent}%`, borderColor, borderWidth: 1.5 }}>
      <View style={wrapperStyle}>
        <View
          style={[
            styles.bar,
            {
              backgroundColor: color
            }
          ]}
        />
      </View>
    </View>
  );
};

const HorizontalSegmentBar: React.FC<{
  data: {
    count: number;
    label: string;
    color: string;
  }[];
  borderColor?: string;
  hideAllLabels?: boolean;
  showAllLabels?: boolean;
  pressableLabels?: boolean;
  onPressLabel?(label: string): void;
}> = ({
  data,
  borderColor = theme.COLORS.WHITE,
  hideAllLabels = false,
  showAllLabels = false,
  pressableLabels = false,
  onPressLabel = (label: string) => {}
}) => {
  const totalCount = React.useMemo(() => {
    let total = 0;

    for (const section of data) {
      total += section.count;
    }

    return total;
  }, [data]);

  const renderLabels = () => {
    return data
      .filter((section) => section.count > 0 || showAllLabels)
      .map((section) => {
        return (
          <HorizontalLabel
            key={section.label}
            count={section.count}
            label={section.label}
            pressable={pressableLabels}
            onPress={onPressLabel}
          />
        );
      });
  };

  const renderBars = () => {
    let count = 0;

    return data
      .filter((section) => section.count > 0)
      .map((section, sectionIndex: number) => {
        count += section.count;

        const leftSide = sectionIndex === 0 || count === section.count;
        const rightSide = count === totalCount;

        return (
          <HorizontalBar
            key={section.label}
            borderColor={borderColor}
            percent={(section.count / totalCount) * 100}
            color={section.color}
            wrapperStyle={[styles.barWrapper, leftSide && styles.leftBarWrapper, rightSide && styles.rightBarWrapper]}
          />
        );
      });
  };

  return (
    <View style={styles.wrapper}>
      {!hideAllLabels && <View style={styles.labelsWrapper}>{renderLabels()}</View>}
      <View style={styles.barsWrapper}>{renderBars()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%'
  },
  labelsWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  labelWrapper: {
    alignSelf: 'flex-start'
  },
  label: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  barsWrapper: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row'
  },
  barWrapper: {
    width: '100%',
    height: 10,
    overflow: 'hidden'
  },
  leftBarWrapper: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5
  },
  rightBarWrapper: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },
  bar: {
    flex: 1
  }
});

export default HorizontalSegmentBar;
