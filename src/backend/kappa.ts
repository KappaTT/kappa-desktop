import { ENDPOINTS, METHODS, TResponse, makeAuthorizedRequest, pass, fail, TBlame } from '@backend/backend';
import { TUser } from '@backend/auth';
import { log } from '@services/logService';
import moment from 'moment';

export interface TLoadHistory {
  [key: string]: moment.Moment;
}

export interface TEvent {
  _id: string;
  creator: string;
  eventType: string;
  eventCode?: string;
  mandatory: boolean;
  excusable: boolean;
  title: string;
  description: string;
  start: string;
  duration: number;
  location: string;
  points: TPointsDict;
}

export interface TEventDict {
  [eventId: string]: TEvent;
}

export interface TEventDateDict {
  [date: string]: TEvent[];
}

export interface TUserEventDict {
  [email: string]: TEventDict;
}

export interface TDirectory {
  [email: string]: TUser;
}

export interface TAttendance {
  _id: string;
  eventId: string;
  email: string;
}

export interface TAttendanceEventDict {
  [eventId: string]: TAttendance;
}

export interface TAttendanceUserDict {
  [email: string]: TAttendanceEventDict;
}

export interface TExcuse {
  _id: string;
  eventId: string;
  email: string;
  reason: string;
  late: boolean;
  approved: boolean;
}

export interface TPendingExcuse extends TExcuse {
  title: string;
  start: string;
}

export interface TExcuseEventDict {
  [eventId: string]: TExcuse;
}

export interface TExcuseUserDict {
  [email: string]: TExcuseEventDict;
}

export interface TRecords {
  attended: TAttendanceUserDict;
  excused: TExcuseUserDict;
}

export interface TPointsDict {
  [category: string]: number;
}

export interface TPointsUserDict {
  [email: string]: TPointsDict;
}

export interface TEventSearch {
  title: string;
  profPoints: string;
  philPoints: string;
  broPoints: string;
  rushPoints: string;
  anyPoints: string;
}

export interface TEventSearchResult extends TEvent {
  attended?: boolean;
  excused?: boolean;
  pending?: boolean;
}

export interface TCreateUserPayload {
  user: TUser;
  newUser: Partial<TUser>;
}

interface TCreateUserRequestResponse {
  user: TUser;
}

interface TCreateUserResponse extends TResponse {
  data?: TCreateUserRequestResponse;
}

export const createUser = async (payload: TCreateUserPayload): Promise<TCreateUserResponse> => {
  try {
    const response = await makeAuthorizedRequest<TCreateUserRequestResponse>(
      ENDPOINTS.CREATE_USER(),
      METHODS.CREATE_USER,
      {
        body: {
          user: payload.newUser
        }
      },
      payload.user.sessionToken
    );

    log('Create user response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      user: response.data.user
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TUpdateUserPayload {
  user: TUser;
  target: string;
  changes: Partial<TUser>;
}

interface TUpdateUserRequestResponse {
  user: TUser;
}

interface TUpdateUserResponse extends TResponse {
  data?: TUpdateUserRequestResponse;
}

export const updateUser = async (payload: TUpdateUserPayload): Promise<TUpdateUserResponse> => {
  try {
    const response = await makeAuthorizedRequest<TUpdateUserRequestResponse>(
      ENDPOINTS.UPDATE_USER({
        email: payload.target
      }),
      METHODS.UPDATE_USER,
      {
        body: {
          changes: payload.changes
        }
      },
      payload.user.sessionToken
    );

    log('Update user response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      user: response.data.user
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TDeleteUserPayload {
  user: TUser;
  target: string;
}

interface TDeleteUserRequestResponse {
  user: {
    email: string;
  };
}

interface TDeleteUserResponse extends TResponse {
  data?: TDeleteUserRequestResponse;
}

export const deleteUser = async (payload: TDeleteUserPayload): Promise<TDeleteUserResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteUserRequestResponse>(
      ENDPOINTS.DELETE_USER({
        email: payload.target
      }),
      METHODS.DELETE_USER,
      {},
      payload.user.sessionToken
    );

    log('Delete user response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      user: response.data.user
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetEventsPayload {
  user: TUser;
}

interface TGetEventsRequestResponse {
  events: TEvent[];
}

interface TGetEventsResponse extends TResponse {
  data?: {
    events: TEvent[];
  };
}

export const getEvents = async (payload: TGetEventsPayload): Promise<TGetEventsResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetEventsRequestResponse>(
      ENDPOINTS.GET_EVENTS(),
      METHODS.GET_EVENTS,
      {},
      payload.user.sessionToken
    );

    log('Get events response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      events: response.data.events
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TCreateEventPayload {
  user: TUser;
  event: Partial<TEvent>;
}

interface TCreateEventRequestResponse {
  event: TEvent;
}

interface TCreateEventResponse extends TResponse {
  data?: {
    event: TEvent;
  };
}

export const createEvent = async (payload: TCreateEventPayload): Promise<TCreateEventResponse> => {
  try {
    const response = await makeAuthorizedRequest<TCreateEventRequestResponse>(
      ENDPOINTS.CREATE_EVENT(),
      METHODS.CREATE_EVENT,
      {
        body: {
          event: payload.event
        }
      },
      payload.user.sessionToken
    );

    log('Create event response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      event: response.data.event
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TUpdateEventPayload {
  user: TUser;
  eventId: string;
  changes: Partial<TEvent>;
}

interface TUpdateEventRequestResponse {
  event: TEvent;
}

interface TUpdateEventResponse extends TResponse {
  data?: {
    event: TEvent;
  };
}

export const updateEvent = async (payload: TUpdateEventPayload): Promise<TUpdateEventResponse> => {
  try {
    const response = await makeAuthorizedRequest<TUpdateEventRequestResponse>(
      ENDPOINTS.UPDATE_EVENT({ eventId: payload.eventId }),
      METHODS.UPDATE_EVENT,
      {
        body: {
          changes: payload.changes
        }
      },
      payload.user.sessionToken
    );

    log('Update event response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      event: response.data.event
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TDeleteEventPayload {
  user: TUser;
  event: TEvent;
}

interface TDeleteEventRequestResponse {
  event: {
    _id: string;
  };
}

interface TDeleteEventResponse extends TResponse {
  data?: {
    event: {
      _id: string;
    };
  };
}

export const deleteEvent = async (payload: TDeleteEventPayload): Promise<TDeleteEventResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteEventRequestResponse>(
      ENDPOINTS.DELETE_EVENT({ eventId: payload.event._id }),
      METHODS.DELETE_EVENT,
      {},
      payload.user.sessionToken
    );

    log('Delete event response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      event: {
        _id: response.data.event._id
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetUsersPayload {
  user: TUser;
}

interface TGetUsersRequestResponse {
  users: TUser[];
  user: TUser;
  sessionToken: string;
}

interface TGetUsersResponse extends TResponse {
  data?: TGetUsersRequestResponse;
}

export const getUsers = async (payload: TGetUsersPayload): Promise<TGetUsersResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetUsersRequestResponse>(
      ENDPOINTS.GET_USERS(),
      METHODS.GET_USERS,
      {},
      payload.user.sessionToken
    );

    log('Get users response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      users: response.data.users,
      user: response.data.user,
      sessionToken: response.data.sessionToken
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetAttendancePayload {
  user: TUser;
  target: string;
}

interface TGetAttendanceRequestResponse {
  attended: TAttendance[];
  excused: TExcuse[];
}

interface TGetAttendanceResponse extends TResponse {
  data?: {
    attended: TAttendance[];
    excused: TExcuse[];
  };
}

export const getAttendanceByUser = async (payload: TGetAttendancePayload): Promise<TGetAttendanceResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetAttendanceRequestResponse>(
      ENDPOINTS.GET_ATTENDANCE_BY_USER({ email: payload.target }),
      METHODS.GET_ATTENDANCE_BY_USER,
      {},
      payload.user.sessionToken
    );

    log('Get attendance response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      attended: response.data.attended || [],
      excused: response.data.excused || []
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export const getAttendanceByEvent = async (payload: TGetAttendancePayload): Promise<TGetAttendanceResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetAttendanceRequestResponse>(
      ENDPOINTS.GET_ATTENDANCE_BY_EVENT({ eventId: payload.target }),
      METHODS.GET_ATTENDANCE_BY_EVENT,
      {},
      payload.user.sessionToken
    );

    log('Get attendance response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      attended: response.data.attended || [],
      excused: response.data.excused || []
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TCreateAttendancePayload {
  user: TUser;
  eventId: string;
  eventCode: string;
}

interface TCreateAttendanceRequestResponse {
  attended: TAttendance[];
}

interface TCreateAttendanceResponse extends TResponse {
  data?: {
    attended: TAttendance[];
  };
}

export const createAttendance = async (payload: TCreateAttendancePayload): Promise<TCreateAttendanceResponse> => {
  try {
    const response = await makeAuthorizedRequest<TCreateAttendanceRequestResponse>(
      ENDPOINTS.CREATE_ATTENDANCE(),
      METHODS.CREATE_ATTENDANCE,
      {
        body: {
          eventId: payload.eventId,
          eventCode: payload.eventCode
        }
      },
      payload.user.sessionToken
    );

    log('Get attendance response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      attended: response.data.attended || []
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetPendingExcusesPayload {
  user: TUser;
}

interface TGetPendingExcusesRequestResponse {
  pending: TPendingExcuse[];
}

interface TGetPendingExcusesResponse extends TResponse {
  data?: {
    pending: TPendingExcuse[];
  };
}

export const getPendingExcuses = async (payload: TGetPendingExcusesPayload): Promise<TGetPendingExcusesResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetPendingExcusesRequestResponse>(
      ENDPOINTS.GET_EXCUSES(),
      METHODS.GET_EXCUSES,
      {},
      payload.user.sessionToken
    );

    log('Get excuses response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      pending: response.data.pending || []
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TCreateExcusePayload {
  user: TUser;
  event: TEvent;
  excuse: {
    reason: string;
    late: boolean;
  };
}

export interface TCreateExcuseRequestResponse {
  excused: TExcuse[];
}

export interface TCreateExcuseResponse extends TResponse {
  data?: {
    excused: TExcuse[];
    pending: TPendingExcuse[];
  };
}

export const createExcuse = async (payload: TCreateExcusePayload): Promise<TCreateExcuseResponse> => {
  try {
    const response = await makeAuthorizedRequest<TCreateExcuseRequestResponse>(
      ENDPOINTS.CREATE_EXCUSE(),
      METHODS.CREATE_EXCUSE,
      {
        body: {
          excuse: {
            ...payload.excuse,
            eventId: payload.event._id
          }
        }
      },
      payload.user.sessionToken
    );

    log('Create excuse response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      excused: response.data.excused,
      pending: [
        {
          ...response.data.excused[0],
          title: payload.event.title,
          start: payload.event.start
        }
      ]
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TUpdateExcusePayload {
  user: TUser;
  excuse: {
    _id: string;
    eventId: string;
    email: string;
    approved: boolean;
  };
}

interface TUpdateExcuseRequestResponse {
  excused: TExcuse[];
}

interface TUpdateExcuseResponse extends TResponse {
  data?: {
    excused: TExcuse[];
  };
}

export const updateExcuse = async (payload: TUpdateExcusePayload): Promise<TUpdateExcuseResponse> => {
  try {
    const response = await makeAuthorizedRequest<TUpdateExcuseRequestResponse>(
      ENDPOINTS.UPDATE_EXCUSE(),
      METHODS.UPDATE_EXCUSE,
      {
        body: {
          excuse: payload.excuse
        }
      },
      payload.user.sessionToken
    );

    log('Modify excuse response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      excused: response.data.excused
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetPointsByUserPayload {
  user: TUser;
  target: string;
}

interface TGetPointsByUserRequestResponse {
  points: TPointsDict;
}

interface TGetPointsByUserResponse extends TResponse {
  data?: {
    points: TPointsDict;
  };
}

export const getPointsByUser = async (payload: TGetPointsByUserPayload): Promise<TGetPointsByUserResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetPointsByUserRequestResponse>(
      ENDPOINTS.GET_POINTS_BY_USER({ email: payload.target }),
      METHODS.GET_POINTS_BY_USER,
      {},
      payload.user.sessionToken
    );

    log('Get points response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      points: response.data.points
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetEventSearchResultsPayload {
  user: TUser;
  search: TEventSearch;
}

interface TGetEventSearchResultsRequestResponse {
  events: TEventSearchResult[];
}

interface TGetEventSearchResultsResponse extends TResponse {
  data?: {
    events: TEventSearchResult[];
  };
}

export const getEventSearchResults = async (
  payload: TGetEventSearchResultsPayload
): Promise<TGetEventSearchResultsResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetEventSearchResultsRequestResponse>(
      ENDPOINTS.GET_EVENT_SEARCH_RESULTS(),
      METHODS.GET_EVENT_SEARCH_RESULTS,
      {
        body: {
          search: payload.search
        }
      },
      payload.user.sessionToken
    );

    log('Get event search response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      events: response.data.events
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};
