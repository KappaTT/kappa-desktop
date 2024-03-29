import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { TRedux } from '@reducers';
import { TEvent, TPointsDict } from '@backend/kappa';
import { extractPoints, getEventById } from '@services/kappaService';
import { theme } from '@constants';
import { Icon, Switch, RadioList, FormattedInput } from '@components';

const numberFormatter = (text: string) => {
  return text !== undefined ? text.replace(/\D/g, '') : '';
};

const EditEventPage: React.FC<{
  onPressCancel(): void;
  onPressSave(event: Partial<TEvent>, eventId?: string): void;
}> = ({ onPressCancel, onPressSave }) => {
  const events = useSelector((state: TRedux) => state.kappa.events);
  const editingEventId = useSelector((state: TRedux) => state.kappa.editingEventId);
  const isSavingEvent = useSelector((state: TRedux) => state.kappa.isSavingEvent);

  const initialEvent = editingEventId === 'NEW' ? null : getEventById(events, editingEventId);

  const [type, setType] = React.useState<string>(initialEvent ? initialEvent.eventType : '');
  const [showErrors, setShowErrors] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>(initialEvent ? initialEvent.title : '');
  const [description, setDescription] = React.useState<string>(initialEvent ? initialEvent.description : '');
  const [startDate, setStartDate] = React.useState(
    initialEvent ? moment(initialEvent.start) : moment(new Date()).startOf('hour')
  );
  const [duration, setDuration] = React.useState<string>(initialEvent ? initialEvent.duration.toString() : '');
  const [location, setLocation] = React.useState<string>(initialEvent ? initialEvent.location : '');
  const [link, setLink] = React.useState<string>(initialEvent?.link || '');
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
  const [divPoints, setDivPoints] = React.useState<string>(
    initialEvent ? extractPoints(initialEvent.points, 'DIV') : ''
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
      link,

      creator: initialEvent ? initialEvent.creator : '',
      eventCode: initialEvent ? initialEvent.eventCode : ''
    };

    if (event.title === '' || event.duration === 0) {
      setShowErrors(true);
      alert('One or more fields is invalid');
      return;
    }

    const points: TPointsDict = {
      PROF: parseInt(profPoints || '0', 10),
      PHIL: parseInt(philPoints || '0', 10),
      BRO: parseInt(broPoints || '0', 10),
      RUSH: parseInt(rushPoints || '0', 10),
      DIV: parseInt(divPoints || '0', 10),
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
    link,
    initialEvent,
    profPoints,
    philPoints,
    broPoints,
    rushPoints,
    divPoints,
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

  const onChangeLocation = React.useCallback((text: string) => {
    setLocation(text);
  }, []);

  const onChangeLink = React.useCallback((text: string) => {
    setLink(text);
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

  const onChangeProfessional = React.useCallback((text: string) => {
    setProfPoints(text);
  }, []);

  const onChangePhilanthropy = React.useCallback((text: string) => {
    setPhilPoints(text);
  }, []);

  const onChangeBrotherhood = React.useCallback((text: string) => {
    setBroPoints(text);
  }, []);

  const onChangeRush = React.useCallback((text: string) => {
    setRushPoints(text);
  }, []);

  const onChangeDiv = React.useCallback((text: string) => {
    setDivPoints(text);
  }, []);

  const onChangeAny = React.useCallback((text: string) => {
    setAnyPoints(text);
  }, []);

  const renderHeader = () => {
    return (
      <React.Fragment>
        <View style={styles.cancelWrapper}>
          <TouchableOpacity activeOpacity={0.6} disabled={isSavingEvent} onPress={onPressCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{initialEvent ? 'Editing Event' : 'New Event'}</Text>
          {initialEvent !== null && <Text style={styles.subtitleText}>{initialEvent.title}</Text>}
        </View>

        <View style={styles.saveWrapper}>
          {isSavingEvent ? (
            <ActivityIndicator style={styles.saveLoader} color={theme.COLORS.PRIMARY} />
          ) : (
            <TouchableOpacity
              style={{
                opacity: readyToSave ? 1 : 0.6
              }}
              activeOpacity={0.6}
              disabled={!readyToSave}
              onPress={onPressSaveButton}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderTypeSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
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
                { id: 'Diversity', title: 'Diversity' },
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
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDateSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={[styles.propertyHeaderContainer, { marginBottom: 4 }]}>
              <Text style={styles.propertyHeader}>Date</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <DatePicker selected={startDate.toDate()} onChange={onChangeDate} inline />

            <View style={[styles.propertyHeaderContainer]}>
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
              maxLength={10}
              error={showErrors && (duration === '' || duration === '0')}
              value={duration}
              formatter={numberFormatter}
              onChangeText={onChangeDuration}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Location</Text>
            </View>

            <FormattedInput
              placeholderText="ex: EHall 106b1"
              maxLength={64}
              value={location}
              onChangeText={onChangeLocation}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Link</Text>
            </View>

            <FormattedInput
              placeholderText="ex: https://illinois.zoom.us/j/123456789"
              maxLength={256}
              value={link}
              onChangeText={onChangeLink}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDetailsSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Title</Text>
              <Text style={styles.propertyHeaderRequired}>*</Text>
            </View>

            <FormattedInput
              placeholderText="ex: General Meeting"
              maxLength={64}
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
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderPointsSection = () => {
    return (
      <View style={styles.sectionContent}>
        <ScrollView>
          <View style={styles.scrollContent}>
            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Professional</Text>
            </View>

            <FormattedInput
              placeholderText="points"
              maxLength={1}
              value={profPoints}
              formatter={numberFormatter}
              onChangeText={onChangeProfessional}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Philanthropy</Text>
            </View>

            <FormattedInput
              placeholderText="points"
              maxLength={1}
              value={philPoints}
              formatter={numberFormatter}
              onChangeText={onChangePhilanthropy}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Brotherhood</Text>
            </View>

            <FormattedInput
              placeholderText="points"
              maxLength={1}
              value={broPoints}
              formatter={numberFormatter}
              onChangeText={onChangeBrotherhood}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Rush</Text>
            </View>

            <FormattedInput
              placeholderText="points"
              maxLength={1}
              value={rushPoints}
              formatter={numberFormatter}
              onChangeText={onChangeRush}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Diversity</Text>
            </View>

            <FormattedInput
              placeholderText="points"
              maxLength={1}
              value={divPoints}
              formatter={numberFormatter}
              onChangeText={onChangeDiv}
            />

            <View style={styles.propertyHeaderContainer}>
              <Text style={styles.propertyHeader}>Any</Text>
            </View>

            <FormattedInput
              placeholderText="points"
              maxLength={1}
              value={anyPoints}
              formatter={numberFormatter}
              onChangeText={onChangeAny}
            />

            <Text style={styles.description}>Points in "Any" count for whatever category the brother is missing</Text>
          </View>
        </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontFamily: 'OpenSans',
    fontSize: 16
  },
  subtitleText: {
    fontFamily: 'OpenSans',
    fontSize: 12,
    color: theme.COLORS.DARK_GRAY
  },
  saveWrapper: {
    position: 'absolute',
    right: 0
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
  cancelWrapper: {
    position: 'absolute',
    left: 0
  },
  cancelText: {
    paddingHorizontal: 16,
    fontFamily: 'OpenSans',
    fontSize: 17,
    color: theme.COLORS.DARK_GRAY
  },
  content: {
    marginTop: 44,
    minHeight: 640,
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
  scrollContent: {
    paddingBottom: 16
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
