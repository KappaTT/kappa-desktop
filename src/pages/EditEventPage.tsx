import React from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { TRedux } from '@reducers';
import { TEvent, TPointsDict } from '@backend/kappa';
import { theme } from '@constants';
import { Icon, Switch, RadioList, FormattedInput } from '@components';
import { extractPoints } from '@services/kappaService';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

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

  const readyStateType = React.useMemo(() => {
    return type !== '';
  }, [type]);

  const readyStateDate = React.useMemo(() => {
    return duration !== '' && duration !== '0';
  }, [duration]);

  const readyStateDetails = React.useMemo(() => {
    return title.trim() !== '';
  }, [title]);

  const readyToSave = React.useMemo(() => readyStateType && readyStateDate && readyStateDetails, [
    readyStateDate,
    readyStateDetails,
    readyStateType
  ]);

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

  const onChangeType = React.useCallback((chosen) => {
    setType(chosen);
  }, []);

  const onChangeDate = React.useCallback(
    (selectedDate) => {
      setStartDate(moment(selectedDate || startDate));
    },
    [startDate]
  );

  const onChangeTime = React.useCallback(
    (selectedDate) => {
      setStartDate(moment(`${startDate.format('YYYY-MM-DD')} ${moment(selectedDate).format('HH:mm')}`));
    },
    [startDate]
  );

  const onChangeDuration = React.useCallback((text: string) => {
    setDuration(text);
  }, []);

  const onChangeTitle = React.useCallback((text: string) => {
    setTitle(text);
  }, []);

  const onChangeDescription = React.useCallback((text: string) => {
    setDescription(text);
  }, []);

  const onChangeMandatory = React.useCallback((value: boolean) => {
    setMandatory(value);
  }, []);

  const onChangeExcusable = React.useCallback((value: boolean) => {
    setExcusable(value);
  }, []);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <TouchableOpacity activeOpacity={0.6} onPress={onPressCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            opacity: readyToSave ? 1 : 0.6
          }}
          activeOpacity={0.6}
          disabled={!readyToSave}
          onPress={onPressSaveButton}
        >
          {isSavingEvent ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  const renderTypeSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Event Type</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <RadioList
            options={[
              { id: 'GM', title: 'GM' },
              { id: 'Weekly Happy Hour', title: 'Weekly Happy Hour' },
              { id: 'Philanthropy', title: 'Philanthropy' },
              { id: 'Professional', title: 'Professional' },
              { id: 'Rush', title: 'Rush' },
              { id: 'Brotherhood', title: 'Brotherhood' },
              { id: 'Misc', title: 'Misc' }
            ]}
            selected={type}
            onChange={onChangeType}
          />

          <Text style={styles.description}>
            The type of event affects GM counts. If an event is not marked as a GM, it will not count towards the GM
            attendance rate. Weekly Happy Hour events can only count for 1 Brother point per semester. Points must be
            set per-event as well.
          </Text>
        </ScrollView>
      </View>
    );
  };

  const renderDateSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Date</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <DatePicker selected={startDate.toDate()} onChange={onChangeDate} inline />

          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Start Time ({timezone})</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <DatePicker
            selected={startDate.toDate()}
            onChange={onChangeTime}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
            className="custom-time-picker"
          />

          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Duration (minutes)</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <FormattedInput
            placeholderText="ex: 60"
            maxLength={4}
            error={showErrors && (duration === '' || duration === '0')}
            value={duration}
            formatter={numberFormatter}
            onChangeText={onChangeDuration}
          />
        </ScrollView>
      </View>
    );
  };

  const renderDetailsSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Title</Text>
            <Text style={styles.propertyHeaderRequired}>*</Text>
          </View>

          <FormattedInput
            placeholderText="ex: General Meeting"
            maxLength={32}
            error={showErrors && title.trim() === ''}
            value={title}
            onChangeText={onChangeTitle}
          />

          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Short Description</Text>
          </View>

          <FormattedInput
            style={styles.multilineInput}
            placeholderText="ex: Weekly meeting for the whole chapter"
            maxLength={256}
            multiline={true}
            numberOfLines={6}
            value={description}
            onChangeText={onChangeDescription}
          />

          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Mandatory</Text>
          </View>

          <Switch value={mandatory} onValueChange={onChangeMandatory} />

          <Text style={styles.description}>
            Choose if unexcused absence results in security deposit loss (ex: voting)
          </Text>

          <View style={styles.propertyHeaderContainer}>
            <Text style={styles.propertyHeader}>Excusable</Text>
          </View>

          <Switch value={excusable} onValueChange={onChangeExcusable} />

          <Text style={styles.description}>
            Allow a valid excuse to count as attending (for instance GM). Do not choose this if there are points
          </Text>
        </ScrollView>
      </View>
    );
  };

  const renderPointsSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView></ScrollView>
      </View>
    );
  };

  const renderDivider = (readyStatus: boolean) => {
    return (
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
        <Icon
          style={styles.dividerIcon}
          family="Feather"
          name="arrow-right-circle"
          size={20}
          color={readyStatus ? theme.COLORS.PRIMARY : theme.COLORS.BORDER}
        />
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{renderHeader()}</View>

      <View style={styles.content}>
        <View style={styles.section}>{renderTypeSection()}</View>

        {renderDivider(readyStateType)}

        <View
          pointerEvents={!readyStateType ? 'none' : 'auto'}
          style={[styles.section, !readyStateType && { opacity: 0.6 }]}
        >
          {renderDateSection()}
        </View>

        {renderDivider(readyStateDate)}

        <View
          pointerEvents={!readyStateType || !readyStateDate ? 'none' : 'auto'}
          style={[styles.section, (!readyStateType || !readyStateDate) && { opacity: 0.6 }]}
        >
          {renderDetailsSection()}
        </View>

        {renderDivider(readyStateDetails)}

        <View
          pointerEvents={!readyStateType || !readyStateDate || !readyStateDetails ? 'none' : 'auto'}
          style={[styles.section, (!readyStateType || !readyStateDate || !readyStateDetails) && { opacity: 0.6 }]}
        >
          {renderPointsSection()}
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center'
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
  cancelText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.GRAY
  },
  content: {
    marginTop: 44,
    minHeight: 520,
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
  }
});

export default EditEventPage;
