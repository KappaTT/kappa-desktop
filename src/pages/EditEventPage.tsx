import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { TRedux } from '@reducers';
import { TEvent, TPointsDict } from '@backend/kappa';
import { theme } from '@constants';
import { Icon, Switch } from '@components';
import { extractPoints } from '@services/kappaService';

const EditEventPage: React.FC<{
  initialEvent: TEvent;
  onPressCancel(): void;
  onPressSave(event: Partial<TEvent>, eventId?: string): void;
}> = ({ initialEvent, onPressCancel, onPressSave }) => {
  const isSavingEvent = useSelector((state: TRedux) => state.kappa.isSavingEvent);

  const [type, setType] = React.useState<string>(initialEvent ? initialEvent.eventType : '');
  const [showErrors, setShowErrors] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>(initialEvent ? initialEvent.title : '');
  const [description, setDescription] = React.useState<string>(initialEvent ? initialEvent.description : '');
  const [pickerMode, setPickerMode] = React.useState<'date' | 'time'>(null);
  const [startDate, setStartDate] = React.useState(
    initialEvent ? moment(initialEvent.start) : moment(new Date()).startOf('hour')
  );
  const [duration, setDuration] = React.useState<string>(initialEvent ? initialEvent.duration.toString() : '');
  const [location, setLocation] = React.useState<string>(initialEvent ? initialEvent.location : '');
  const [mandatory, setMandatory] = React.useState<boolean>(initialEvent ? initialEvent.mandatory : false);
  const [excusable, setExcusable] = React.useState<boolean>(initialEvent ? initialEvent.excusable : true);
  const [profPoints, setProfPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'PROF') : ''
  );
  const [philPoints, setPhilPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'PHIL') : ''
  );
  const [broPoints, setBroPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'BRO') : ''
  );
  const [rushPoints, setRushPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'RUSH') : ''
  );
  const [anyPoints, setAnyPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'ANY') : ''
  );

  const timezone = React.useMemo(() => {
    const date = new Date().toString();

    return date.substring(date.indexOf('(') + 1, date.lastIndexOf(')'));
  }, []);

  const onPressSaveButton = React.useCallback(() => {
    const event: Partial<TEvent> = {
      eventType: type,
      mandatory,
      excusable,
      title,
      description,
      start: startDate.toISOString(),
      duration: parseInt(duration || '0', 10),
      location,

      creator: initialEvent ? initialEvent.creator : '',
      eventCode: initialEvent ? initialEvent.eventCode : ''
    };

    if (event.title === '' || event.duration === 0) {
      setShowErrors(true);
      Alert.alert('One or more fields is invalid');
      return;
    }

    const points: TPointsDict = {
      PROF: parseInt(profPoints || '0', 10),
      PHIL: parseInt(philPoints || '0', 10),
      BRO: parseInt(broPoints || '0', 10),
      RUSH: parseInt(rushPoints || '0', 10),
      ANY: parseInt(anyPoints || '0', 10)
    };

    event.points = points;

    onPressSave(event, initialEvent ? initialEvent._id : '');
  }, [
    type,
    mandatory,
    excusable,
    title,
    description,
    startDate,
    duration,
    location,
    initialEvent,
    profPoints,
    philPoints,
    broPoints,
    rushPoints,
    anyPoints,
    onPressSave
  ]);

  const onPressStartDate = React.useCallback(() => {
    setPickerMode('date');
  }, []);

  const onPressStartTime = React.useCallback(() => {
    setPickerMode('time');
  }, []);

  const onPressClosePicker = React.useCallback(() => {
    setPickerMode(null);
  }, []);

  const onChangeDate = React.useCallback(
    (selectedDate) => {
      setStartDate(moment(selectedDate || startDate));
    },
    [startDate]
  );

  const renderTypeSection = () => {
    return <View />;
  };

  const renderDateSection = () => {
    return <View />;
  };

  const renderDetailsSection = () => {
    return <View />;
  };

  const renderPointsSection = () => {
    return <View />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}></View>

      <View style={styles.content}>
        <View style={styles.section}>{renderTypeSection()}</View>

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
          <Icon style={styles.dividerIcon} family="Feather" name="x-circle" size={20} color={theme.COLORS.BORDER} />
          <View style={styles.divider} />
        </View>

        <View style={styles.section}>{renderDateSection()}</View>

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
          <Icon style={styles.dividerIcon} family="Feather" name="x-circle" size={20} color={theme.COLORS.BORDER} />
          <View style={styles.divider} />
        </View>

        <View style={styles.section}>{renderDetailsSection()}</View>

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
          <Icon style={styles.dividerIcon} family="Feather" name="x-circle" size={20} color={theme.COLORS.BORDER} />
          <View style={styles.divider} />
        </View>

        <View style={styles.section}>{renderPointsSection()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 440
  },
  header: {},
  content: {
    flex: 1,
    flexDirection: 'row'
  },
  section: {
    backgroundColor: 'black'
  },
  dividerWrapper: {
    marginHorizontal: 8,
    marginVertical: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    flexGrow: 1,
    borderLeftColor: theme.COLORS.BORDER,
    borderLeftWidth: 1
  },
  dividerIcon: {
    marginVertical: 8
  }
});

export default EditEventPage;
