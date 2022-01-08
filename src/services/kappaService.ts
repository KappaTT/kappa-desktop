import moment from 'moment';

import {
  TAttendance,
  TExcuse,
  TRecords,
  TEvent,
  TEventDateDict,
  TDirectory,
  TEventDict,
  TAttendanceEventDict,
  TExcuseEventDict,
  TUserEventDict,
  TLoadHistory,
  TPointsDict
} from '@backend/kappa';
import { TUser } from '@backend/auth';
import { log } from '@services/logService';

/**
 * Check if a given secret code is valid and has not expired.
 */
export const isSecretCodeValid = (secretCode?: string, secretCodeExpiration?: string) => {
  if (!secretCode || !secretCodeExpiration) return false;

  return moment(secretCodeExpiration).isAfter(moment());
};

/**
 * Check if an event if eligible for check in.
 */
export const canCheckIn = (event: TEvent, now: moment.Moment = moment()) => {
  return (
    moment(event.start).isSame(now, 'day') ||
    (moment(event.start).isBefore(now, 'day') &&
      moment(event.start).add(event.duration, 'minutes').isSameOrAfter(now, 'day'))
  );
};

/**
 * Create a map from event id to event.
 */
export const separateByEventId = (events: TEvent[]) => {
  const separated = {};

  for (const event of events) {
    separated[event._id] = event;
  }

  return separated;
};

/**
 * Create a map from event date to list of events on that date.
 */
export const separateByDate = (events: TEvent[]) => {
  const separated = {};

  for (const event of events) {
    const date = moment(event.start).format('YYYY-MM-DD');

    if (!separated.hasOwnProperty(date)) {
      separated[date] = [];
    }

    separated[date].push(event);
  }

  return separated;
};

/**
 * Create a map from email to user.
 */
export const separateByEmail = (users: TUser[]) => {
  const separated = {};

  for (const user of users) {
    separated[user.email] = user;
  }

  return separated;
};

/**
 * Get an event with the given id.
 */
export const getEventById = (events: TEventDict, eventId: string) => {
  if (events.hasOwnProperty(eventId)) {
    return events[eventId];
  }

  return null;
};

/**
 * Get a user with the given email.
 */
export const getUserByEmail = (directory: TDirectory, email: string) => {
  if (directory.hasOwnProperty(email)) {
    return directory[email];
  }

  return null;
};

/**
 * Merge a list of new user data into the existing directory.
 */
export const mergeDirectory = (directory: TDirectory, newUsers: TUser[]) => {
  const mergedDirectory = directory;

  for (const user of newUsers) {
    mergedDirectory[user.email] = user;
  }

  return mergedDirectory;
};

/**
 * Merge a list of new event data into the existing events.
 */
export const mergeEvents = (events: TEventDict, newEvents: TEvent[]) => {
  const mergedEvents = events;

  for (const event of newEvents) {
    mergedEvents[event._id] = event;
  }

  return mergedEvents;
};

/**
 * Merge a list of new event data into the existing date-separated events.
 */
export const mergeEventDates = (eventDateDict: TEventDateDict, newEvents: TEvent[]) => {
  const separated = eventDateDict;

  for (const event of newEvents) {
    const date = moment(event.start).format('YYYY-MM-DD');

    if (!separated.hasOwnProperty(date)) {
      separated[date] = [];
    }

    separated[date].push(event);
  }

  return separated;
};

/**
 * Remove a given user from the attendance records.
 */
export const excludeUserFromRecords = (records: TRecords, target: string) => {
  const newRecords = records;

  newRecords.attended[target] = undefined;
  delete newRecords.attended[target];

  newRecords.excused[target] = undefined;
  delete newRecords.excused[target];

  return newRecords;
};

/**
 * Remove a given event from the attendance records.
 */
export const excludeEventFromRecords = (records: TRecords, target: string) => {
  const newRecords = records;

  for (const email of Object.keys(records.attended)) {
    newRecords.attended[email][target] = undefined;
    delete newRecords.attended[email][target];
  }

  for (const email of Object.keys(records.excused)) {
    newRecords.excused[email][target] = undefined;
    delete newRecords.excused[email][target];
  }

  return newRecords;
};

/**
 * Merge a list of new attendance and excuse data into the existing records.
 */
export const mergeRecords = (
  records: TRecords,
  newRecords: {
    attended: TAttendance[];
    excused: TExcuse[];
  }
) => {
  const mergedRecords = records;

  for (const attend of newRecords.attended) {
    const email = attend.email;
    const eventId = attend.eventId;

    if (!mergedRecords.attended.hasOwnProperty(email)) {
      mergedRecords.attended[email] = {};
    }

    mergedRecords.attended[email][eventId] = attend;
  }

  for (const excuse of newRecords.excused) {
    const email = excuse.email;
    const eventId = excuse.eventId;

    if (!mergedRecords.excused.hasOwnProperty(email)) {
      mergedRecords.excused[email] = {};
    }

    if (excuse.approved === null) {
      delete mergedRecords.excused[email][eventId];
    } else {
      mergedRecords.excused[email][eventId] = excuse;
    }
  }

  return mergedRecords;
};

/**
 * Get the attendance data for a given user and event.
 */
export const getAttendance = (records: TRecords, email: string, eventId: string) => {
  if (!records.attended.hasOwnProperty(email)) {
    return undefined;
  }

  return records.attended[email][eventId];
};

/**
 * Get the excuse data for a given user and event.
 */
export const getExcuse = (records: TRecords, email: string, eventId: string) => {
  if (!records.excused.hasOwnProperty(email)) {
    return undefined;
  }

  return records.excused[email][eventId];
};

/**
 * Get a list of all events a user attended.
 */
export const getAttendedEvents = (records: TRecords, email: string) => {
  if (!records.attended.hasOwnProperty(email)) {
    return {};
  }

  return records.attended[email];
};

/**
 * Get a list of all excused events a user attended.
 */
export const getExcusedEvents = (records: TRecords, email: string) => {
  if (!records.excused.hasOwnProperty(email)) {
    return {};
  }

  return records.excused[email];
};

/**
 * Aggregate the users who attended or excused a given event.
 */
export const getEventRecords = (directory: TDirectory, records: TRecords, eventId: string) => {
  const attended: {
    [email: string]: TUser;
  } = {};
  const excused: {
    [email: string]: TUser;
  } = {};
  const pending: {
    [email: string]: TUser;
  } = {};
  const absent: {
    [email: string]: TUser;
  } = {};

  for (const [email, record] of Object.entries(records.attended)) {
    if (record.hasOwnProperty(eventId)) {
      attended[email] = directory[email];
    }
  }

  for (const [email, record] of Object.entries(records.excused)) {
    if (record.hasOwnProperty(eventId)) {
      if (record[eventId].approved) {
        excused[email] = directory[email];
      } else {
        pending[email] = directory[email];
      }
    }
  }

  for (const [email, user] of Object.entries(directory)) {
    if (!attended.hasOwnProperty(email) && !excused.hasOwnProperty(email) && !pending.hasOwnProperty(email)) {
      absent[email] = user;
    }
  }

  return {
    attended: Object.values(attended).sort(sortUserByName),
    excused: Object.values(excused).sort(sortUserByName),
    pending: Object.values(pending).sort(sortUserByName),
    absent: Object.values(absent).sort(sortUserByName)
  };
};

/**
 * Get the record counts for a given user.
 */
export const getUserRecordCounts = (records: TRecords, email: string) => {
  let attended = 0;
  let excused = 0;
  let pending = 0;

  const attendedEvents = getAttendedEvents(records, email);

  attended = Object.keys(attendedEvents).length;

  const excusedEvents = getExcusedEvents(records, email);

  for (const excuse of Object.values(excusedEvents)) {
    if (excuse.approved) {
      excused++;
    } else {
      pending++;
    }
  }

  return {
    attended,
    excused,
    pending,
    sum: attended + excused + pending
  };
};

/**
 * Get the number of events in a given type.
 */
export const getTypeCount = (events: TEventDict, type: string, allowFuture: boolean = false) => {
  let count = 0;

  const now = moment();

  for (const event of Object.values(events)) {
    if (event.eventType === type) {
      if (allowFuture || moment(event.start).isSameOrBefore(now, 'day')) {
        count++;
      }
    }
  }

  return count;
};

/**
 * Get the number of events in a given type that a user attended or excused.
 */
export const getTypeCounts = (
  events: TEventDict,
  attended: TAttendanceEventDict,
  excused: TExcuseEventDict,
  type: string,
  allowFuture: boolean = false
) => {
  let attendedCount = 0;
  let excusedCount = 0;
  let pendingCount = 0;

  const now = moment();

  for (const eventId of Object.keys(attended)) {
    if (events.hasOwnProperty(eventId) && events[eventId].eventType === type) {
      if (allowFuture || moment(events[eventId].start).isSameOrBefore(now, 'day')) {
        attendedCount++;
      }
    }
  }

  for (const [eventId, excuse] of Object.entries(excused)) {
    if (events.hasOwnProperty(eventId) && events[eventId].eventType === type) {
      if (allowFuture || moment(events[eventId].start).isSameOrBefore(now, 'day')) {
        if (excuse.approved) {
          excusedCount++;
        } else {
          pendingCount++;
        }
      }
    }
  }

  return {
    attended: attendedCount,
    excused: excusedCount,
    pending: pendingCount,
    sum: attendedCount + excusedCount + pendingCount
  };
};

/**
 * Check if a user has valid attendance or an excuse for a given event.
 */
export const hasValidCheckIn = (records: TRecords, email: string, eventId: string, allowPending: boolean = false) => {
  const attend = getAttendance(records, email, eventId);

  if (attend) return true;

  const excuse = getExcuse(records, email, eventId);

  return excuse !== undefined && (allowPending || excuse.approved);
};

/**
 * Get the mandatory events map.
 */
export const getMandatoryEvents = (events: TEventDict) => {
  const mandatory = {};

  const now = moment();

  for (const event of Object.values(events)) {
    if (event.mandatory) {
      if (moment(event.start).isBefore(now, 'day')) {
        mandatory[event._id] = event;
      }
    }
  }

  return mandatory;
};

/**
 * Get the mandatory events a user missed.
 */
export const getMissedMandatoryByUser = (records: TRecords, mandatoryEvents: TEventDict, email: string) => {
  const missed = {};

  for (const event of Object.values(mandatoryEvents)) {
    if (!hasValidCheckIn(records, email, event._id, true)) {
      missed[event._id] = event;
    }
  }

  return missed;
};

/**
 * Get the missed events for each user.
 */
export const getMissedMandatory = (records: TRecords, mandatoryEvents: TEventDict, directory: TDirectory) => {
  const missed = {};

  for (const user of Object.values(directory)) {
    missed[user.email] = getMissedMandatoryByUser(records, mandatoryEvents, user.email);
  }

  return missed;
};

/**
 * Get the users who missed a given mandatory event.
 */
export const getMissedMandatoryByEvent = (missedMandatory: TUserEventDict, directory: TDirectory, eventId: string) => {
  const missed = {};

  for (const [email, events] of Object.entries(missedMandatory)) {
    if (events.hasOwnProperty(eventId)) {
      missed[email] = directory[email];
    }
  }

  return missed;
};

/**
 * Pretty print a phone number.
 */
export const prettyPhone = (phone: string) => {
  if (!phone || phone.length === 0) {
    return '';
  }

  if (phone.length !== 10) {
    return 'Invalid';
  }

  return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6, 10)}`;
};

/**
 * Sorting function to sort events by date.
 */
export const sortEventByDate = (a: { start: string }, b: { start: string }) =>
  moment(a.start).isBefore(moment(b.start)) ? -1 : 1;

/**
 * Sorting function to sort events by date in reverse.
 */
export const sortEventsByDateReverse = (a: { start: string }, b: { start: string }) =>
  moment(a.start).isBefore(moment(b.start)) ? 1 : -1;

/**
 * Sorting function to sort users by their name.
 */
export const sortUserByName = (
  a: { familyName: string; givenName: string },
  b: { familyName: string; givenName: string }
) => {
  const nameA = `${a.familyName}, ${b.givenName}`;
  const nameB = `${b.familyName}, ${b.givenName}`;

  return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
};

/**
 * Convert a point category to the full name.
 */
export const getCategoryLongName = (category: string) => {
  switch (category) {
    case 'ANY':
      return 'Any';
    case 'BRO':
      return 'Brotherhood';
    case 'PHIL':
      return 'Philanthropy';
    case 'PROF':
      return 'Professional';
    case 'RUSH':
      return 'Rush';
    case 'DIV':
      return 'Diversity';
    default:
      return '';
  }
};

/**
 * Pretty print a user's points.
 */
export const prettyPoints = (points: TPointsDict) => {
  if (!points) {
    return 'N/A';
  }

  let pretty = '';

  for (const [category, count] of Object.entries(points)) {
    if (count === 0) continue;

    if (pretty !== '') {
      pretty += '\n';
    }

    pretty += `${count} ${getCategoryLongName(category)}`;
  }

  if (pretty === '') {
    return 'N/A';
  }

  return pretty;
};

/**
 * Count the number of points a user has of a given category.
 */
export const extractPoints = (points: TPointsDict, type: string) => {
  if (!points || !points.hasOwnProperty(type)) {
    return '0';
  }

  return `${points[type]}`;
};

/**
 * Get the index of the first future date with events.
 */
export const getFutureDateIndex = (
  eventSections: {
    title: string;
    data: TEvent[];
  }[]
) => {
  if (eventSections.length === 0) {
    return -1;
  }

  const now = moment();

  for (let i = 0; i < eventSections.length; i++) {
    const event = moment(eventSections[i].title);

    if (event.isSameOrAfter(now, 'day')) {
      return i;
    }
  }

  return -1;
};

/**
 * Set the global error message.
 */
export const setGlobalError = (message: string, code: number) => {
  return {
    globalErrorMessage: message.startsWith('FetchEvent.respondWith')
      ? 'Safari is not supported. Please use Chrome!'
      : message,
    globalErrorCode: code,
    globalErrorDate: new Date()
  };
};

/**
 * Exclude keys from the cache that match a given exclude function.
 */
export const excludeFromHistory = (loadHistory: TLoadHistory, exclude?: (key: string) => boolean) => {
  const newLoadHistory = {};

  for (const key of Object.keys(loadHistory)) {
    if (exclude(key)) {
      continue;
    }

    newLoadHistory[key] = loadHistory[key];
  }

  return newLoadHistory;
};

/**
 * Check if the key is in the cache and is recent enough.
 */
export const shouldLoad = (loadHistory: TLoadHistory, key: string) => {
  if (!loadHistory.hasOwnProperty(key)) {
    return true;
  }

  const liveTime = moment().diff(loadHistory[key], 'minutes');

  if (liveTime > 10) {
    return true;
  } else {
    log(`Using cache (${liveTime}):`, key);
    return false;
  }
};

/**
 * Recompute the kappa redux state with the given events, records, and directory.
 */
export const recomputeKappaState = ({
  events,
  records,
  directory
}: {
  events: TEventDict;
  records: TRecords;
  directory: TDirectory;
}) => {
  const eventArray = Object.values(events).sort(sortEventByDate);
  const now = moment();
  const futureEventArray = eventArray.filter(
    (event) => moment(event.start).isSameOrAfter(now, 'day') || canCheckIn(event, now)
  );
  const futureEvents = separateByEventId(futureEventArray);
  const eventsSize = eventArray.length;
  const directoryArray = Object.values(directory).sort(sortUserByName);
  const directorySize = directoryArray.length;
  const eventsByDate = separateByDate(eventArray);
  const mandatoryEvents = getMandatoryEvents(events);
  const missedMandatory = getMissedMandatory(records, mandatoryEvents, directory);
  const gmCount = getTypeCount(events, 'GM');
  const eventSections = Object.entries(eventsByDate).map((entry: [string, TEvent[]]) => ({
    title: entry[0],
    data: entry[1]
  }));
  const futureIndex = getFutureDateIndex(eventSections);
  const upcomingSections = futureIndex >= 0 ? eventSections.slice(futureIndex) : [];

  return {
    events,
    eventsSize,
    eventArray,
    futureEventArray,
    futureEvents,
    records,
    directoryArray,
    directory,
    directorySize,
    eventsByDate,
    mandatoryEvents,
    missedMandatory,
    gmCount,
    eventSections,
    upcomingSections,
    futureIndex
  };
};
