import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';

import { theme } from '@constants';
import { TRecords, TEventDict } from '@backend/kappa';
import { getAttendedEvents, getExcusedEvents, getTypeCounts } from '@services/kappaService';

const GeneralMeetingChart: React.FC<{
  isGettingAttendance: boolean;
  email: string;
  records: TRecords;
  events: TEventDict;
  gmCount: number;
}> = ({ isGettingAttendance, email, records, events, gmCount }) => {
  const attended = getAttendedEvents(records, email);

  const excused = getExcusedEvents(records, email);

  const gmCounts = getTypeCounts(events, attended, excused, 'GM');

  const gmStats = React.useMemo(() => {
    const fraction = gmCount === 0 ? 0 : gmCounts.sum / gmCount;

    return {
      raw: fraction,
      percent: `${Math.round(fraction * 100)}%`
    };
  }, [gmCount, gmCounts]);

  return (
    <View style={styles.adminChartsContainer}>
      <View style={styles.circleChartContainer}>
        <ProgressCircle
          style={styles.circleChart}
          progress={isGettingAttendance ? 0 : gmStats.raw}
          progressColor={theme.COLORS.PRIMARY}
          startAngle={-Math.PI * 0.8}
          endAngle={Math.PI * 0.8}
        />
        <View style={styles.circleChartLabels}>
          {isGettingAttendance ? (
            <ActivityIndicator color={theme.COLORS.PRIMARY} />
          ) : (
            <React.Fragment>
              <Text style={styles.circleChartValue}>{gmStats.percent}</Text>
              <Text style={styles.circleChartTitle}>GM</Text>
            </React.Fragment>
          )}
        </View>
      </View>

      <View style={styles.chartPropertyContainer}>
        <View style={styles.chartProperty}>
          <Text style={styles.chartPropertyLabel}>Attended</Text>
          <Text style={styles.chartPropertyValue}>{gmCounts.attended}</Text>
        </View>
        <View style={styles.chartProperty}>
          <Text style={styles.chartPropertyLabel}>Excused</Text>
          <Text style={styles.chartPropertyValue}>{gmCounts.excused}</Text>
        </View>
        <View style={styles.chartProperty}>
          <Text style={styles.chartPropertyLabel}>Pending</Text>
          <Text style={styles.chartPropertyValue}>{gmCounts.pending}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adminChartsContainer: {
    maxWidth: 300,
    marginTop: 24,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  circleChartContainer: {
    width: 144,
    height: 144
  },
  circleChart: {
    height: '100%'
  },
  circleChartLabels: {
    position: 'absolute',
    width: 144,
    height: 144,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleChartValue: {
    fontFamily: 'OpenSans',
    fontSize: 17
  },
  circleChartTitle: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    color: theme.COLORS.GRAY
  },
  chartPropertyContainer: {
    flexGrow: 1,
    paddingLeft: 24,
    justifyContent: 'center'
  },
  chartProperty: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.LIGHT_BORDER,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chartPropertyLabel: {
    marginRight: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 15,
    color: theme.COLORS.GRAY,
    textTransform: 'uppercase'
  },
  chartPropertyValue: {
    fontFamily: 'OpenSans',
    fontSize: 15
  }
});

export default GeneralMeetingChart;
