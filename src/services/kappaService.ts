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

export const canCheckIn = (event: TEvent, now: moment.Moment = moment()) => {
  return (
    moment(event.start).isSame(now, 'day') ||
    (moment(event.start).isBefore(now, 'day') &&
      moment(event.start).add(event.duration, 'minutes').isSameOrAfter(now, 'day'))
  );
};

export const separateByEventId = (events: TEvent[]) => {
  const separated = {};

  for (const event of events) {
    separated[event._id] = event;
  }

  return separated;
};

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

export const separateByEmail = (users: TUser[]) => {
  const separated = {};

  for (const user of users) {
    separated[user.email] = user;
  }

  return separated;
};

export const getEventById = (events: TEventDict, eventId: string) => {
  if (events.hasOwnProperty(eventId)) {
    return events[eventId];
  }

  return null;
};

export const getUserByEmail = (directory: TDirectory, email: string) => {
  if (directory.hasOwnProperty(email)) {
    return directory[email];
  }

  return null;
};

export const mergeDirectory = (directory: TDirectory, newUsers: TUser[]) => {
  const mergedDirectory = directory;

  for (const user of newUsers) {
    mergedDirectory[user.email] = user;
  }

  return mergedDirectory;
};

export const mergeEvents = (events: TEventDict, newEvents: TEvent[]) => {
  const mergedEvents = events;

  for (const event of newEvents) {
    mergedEvents[event._id] = event;
  }

  return mergedEvents;
};

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

export const excludeUserFromRecords = (records: TRecords, target: string) => {
  const newRecords = records;

  newRecords.attended[target] = undefined;
  delete newRecords.attended[target];

  newRecords.excused[target] = undefined;
  delete newRecords.excused[target];

  return newRecords;
};

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

export const getAttendance = (records: TRecords, email: string, eventId: string) => {
  if (!records.attended.hasOwnProperty(email)) {
    return undefined;
  }

  return records.attended[email][eventId];
};

export const getExcuse = (records: TRecords, email: string, eventId: string) => {
  if (!records.excused.hasOwnProperty(email)) {
    return undefined;
  }

  return records.excused[email][eventId];
};

export const getAttendedEvents = (records: TRecords, email: string) => {
  if (!records.attended.hasOwnProperty(email)) {
    return {};
  }

  return records.attended[email];
};

export const getExcusedEvents = (records: TRecords, email: string) => {
  if (!records.excused.hasOwnProperty(email)) {
    return {};
  }

  return records.excused[email];
};

export const getEventRecordCounts = (records: TRecords, eventId: string) => {
  let attended = 0;
  let excused = 0;
  let pending = 0;

  for (const record of Object.values(records.attended)) {
    if (record.hasOwnProperty(eventId)) {
      attended++;
    }
  }

  for (const record of Object.values(records.excused)) {
    if (record.hasOwnProperty(eventId)) {
      if (record[eventId].approved) {
        excused++;
      } else {
        pending++;
      }
    }
  }

  return {
    attended,
    excused,
    pending,
    sum: attended + excused + pending
  };
};

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

export const hasValidCheckIn = (records: TRecords, email: string, eventId: string, allowPending: boolean = false) => {
  const attend = getAttendance(records, email, eventId);

  if (attend) return true;

  const excuse = getExcuse(records, email, eventId);

  return excuse !== undefined && (allowPending || excuse.approved);
};

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

export const getMissedMandatoryByUser = (records: TRecords, mandatoryEvents: TEventDict, email: string) => {
  const missed = {};

  for (const event of Object.values(mandatoryEvents)) {
    if (!hasValidCheckIn(records, email, event._id, true)) {
      missed[event._id] = event;
    }
  }

  return missed;
};

export const getMissedMandatory = (records: TRecords, mandatoryEvents: TEventDict, directory: TDirectory) => {
  const missed = {};

  for (const user of Object.values(directory)) {
    missed[user.email] = getMissedMandatoryByUser(records, mandatoryEvents, user.email);
  }

  return missed;
};

export const getMissedMandatoryByEvent = (missedMandatory: TUserEventDict, directory: TDirectory, eventId: string) => {
  const missed = {};

  for (const [email, events] of Object.entries(missedMandatory)) {
    if (events.hasOwnProperty(eventId)) {
      missed[email] = directory[email];
    }
  }

  return missed;
};

export const prettyPhone = (phone: string) => {
  if (!phone || phone.length === 0) {
    return '';
  }

  if (phone.length !== 10) {
    return 'Invalid';
  }

  return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6, 10)}`;
};

export const sortEventByDate = (a: { start: string }, b: { start: string }) =>
  moment(a.start).isBefore(moment(b.start)) ? -1 : 1;

export const sortEventsByDateReverse = (a: { start: string }, b: { start: string }) =>
  moment(a.start).isBefore(moment(b.start)) ? 1 : -1;

export const sortUserByName = (
  a: { familyName: string; givenName: string },
  b: { familyName: string; givenName: string }
) => {
  const nameA = `${a.familyName}, ${b.givenName}`;
  const nameB = `${b.familyName}, ${b.givenName}`;

  return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
};

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
    default:
      return '';
  }
};

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

export const extractPoints = (points: TPointsDict, type: string) => {
  if (!points || !points.hasOwnProperty(type)) {
    return '0';
  }

  return `${points[type]}`;
};

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

export const setGlobalError = (message: string, code: number) => {
  return {
    globalErrorMessage: message,
    globalErrorCode: code,
    globalErrorDate: new Date()
  };
};

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

export const recomputeKappaState = ({
  events,
  records,
  directory
}: {
  events: TEventDict;
  records: TRecords;
  directory: TDirectory;
}) => {
  const eventArray = Object.values(events);
  const now = moment();
  const futureEventArray = eventArray.filter(
    (event) => moment(event.start).isSameOrAfter(now, 'day') || canCheckIn(event, now)
  );
  const futureEvents = separateByEventId(futureEventArray);
  const eventsSize = Object.keys(events).length;
  const directoryArray = Object.values(directory);
  const directorySize = directoryArray.length;
  const eventsByDate = separateByDate(Object.values(events));
  const mandatoryEvents = getMandatoryEvents(events);
  const missedMandatory = getMissedMandatory(records, mandatoryEvents, directory);
  const gmCount = getTypeCount(events, 'GM');
  const eventSections = Object.entries(eventsByDate)
    .sort((a, b) => (moment(a[0]).isBefore(moment(b[0])) ? -1 : 1))
    .map((entry: [string, TEvent[]]) => ({ title: entry[0], data: entry[1] }));
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
