import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, View, Text } from 'react-native';

import { theme } from '@constants';

const HorizontalLabel: React.FC<{
  index: number;
  total: number;
  count: number;
  label: string;
}> = ({ index, total, count, label }) => {
  return (
    <View style={styles.labelWrapper}>
      <Text
        style={[
          styles.label,
          index === 0 ? styles.leftLabel : index === total - 1 ? styles.rightLabel : styles.middleLabel
        ]}
      >
        {count} {label}
      </Text>
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
}> = ({ data, borderColor = theme.COLORS.WHITE, hideAllLabels = false, showAllLabels = false }) => {
  const totalCount = React.useMemo(() => {
    let total = 0;

    for (const section of data) {
      total += section.count;
    }

    return total;
  }, [data]);

  const renderLabels = () => {
    return data.map(
      (
        section: {
          count: number;
          label: string;
          color: string;
        },
        sectionIndex: number
      ) => {
        if (section.count === 0 && !showAllLabels) {
          return <React.Fragment key={section.label} />;
        }

        return (
          <HorizontalLabel
            key={section.label}
            index={sectionIndex}
            total={data.length}
            count={section.count}
            label={section.label}
          />
        );
      }
    );
  };

  const renderBars = () => {
    let count = 0;

    return data.map(
      (
        section: {
          count: number;
          label: string;
          color: string;
        },
        sectionIndex: number
      ) => {
        if (section.count === 0) {
          return <React.Fragment key={section.label} />;
        }

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
      }
    );
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
    flexBasis: 0,
    flexGrow: 1
  },
  label: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  leftLabel: {
    textAlign: 'left'
  },
  middleLabel: {
    textAlign: 'center'
  },
  rightLabel: {
    textAlign: 'right'
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
