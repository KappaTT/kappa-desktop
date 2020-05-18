import { Kappa } from '@backend';
import {
  GET_EVENTS,
  GET_EVENTS_SUCCESS,
  GET_EVENTS_FAILURE,
  SELECT_EVENT,
  UNSELECT_EVENT,
  GET_ATTENDANCE,
  GET_ATTENDANCE_SUCCESS,
  GET_ATTENDANCE_FAILURE,
  GET_DIRECTORY,
  GET_DIRECTORY_SUCCESS,
  GET_DIRECTORY_FAILURE,
  SELECT_USER,
  UNSELECT_USER,
  EDIT_NEW_EVENT,
  EDIT_EXISTING_EVENT,
  CANCEL_EDIT_EVENT,
  SAVE_EDIT_EVENT,
  SAVE_EDIT_EVENT_SUCCESS,
  SAVE_EDIT_EVENT_FAILURE,
  DELETE_EVENT,
  DELETE_EVENT_SUCCESS,
  DELETE_EVENT_FAILURE,
  SET_CHECK_IN_EVENT,
  CHECK_IN,
  CHECK_IN_SUCCESS,
  CHECK_IN_FAILURE,
  SET_GLOBAL_ERROR_MESSAGE,
  CLEAR_GLOBAL_ERROR_MESSAGE,
  GET_POINTS,
  GET_POINTS_SUCCESS,
  GET_POINTS_FAILURE,
  GET_EXCUSES,
  GET_EXCUSES_SUCCESS,
  GET_EXCUSES_FAILURE,
  CREATE_EXCUSE,
  CREATE_EXCUSE_SUCCESS,
  CREATE_EXCUSE_FAILURE,
  APPROVE_EXCUSE,
  APPROVE_EXCUSE_SUCCESS,
  APPROVE_EXCUSE_FAILURE,
  REJECT_EXCUSE,
  REJECT_EXCUSE_SUCCESS,
  REJECT_EXCUSE_FAILURE,
  GET_EVENT_SEARCH_RESULTS,
  GET_EVENT_SEARCH_RESULTS_SUCCESS,
  GET_EVENT_SEARCH_RESULTS_FAILURE
} from '@reducers/kappa';
import { TUser } from '@backend/auth';
import { TEvent, TExcuse, TEventSearch } from '@backend/kappa';

export const setGlobalError = (data) => {
  return {
    type: SET_GLOBAL_ERROR_MESSAGE,
    message: data.message,
    code: data.code
  };
};

export const clearGlobalError = () => {
  return {
    type: CLEAR_GLOBAL_ERROR_MESSAGE
  };
};

const gettingEvents = () => {
  return {
    type: GET_EVENTS
  };
};

const getEventsSuccess = (data) => {
  return {
    type: GET_EVENTS_SUCCESS,
    events: data.events
  };
};

const getEventsFailure = (err) => {
  return {
    type: GET_EVENTS_FAILURE,
    error: err
  };
};

export const getEvents = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingEvents());

    Kappa.getEvents({ user }).then((res) => {
      if (res.success) {
        dispatch(getEventsSuccess(res.data));
      } else {
        dispatch(getEventsFailure(res.error));
      }
    });
  };
};

const gettingDirectory = () => {
  return {
    type: GET_DIRECTORY
  };
};

const getDirectorySuccess = (data) => {
  return {
    type: GET_DIRECTORY_SUCCESS,
    users: data.users
  };
};

const getDirectoryFailure = (err) => {
  return {
    type: GET_DIRECTORY_FAILURE,
    error: err
  };
};

export const getDirectory = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingDirectory());

    Kappa.getUsers({ user }).then((res) => {
      if (res.success) {
        dispatch(getDirectorySuccess(res.data));
      } else {
        dispatch(getDirectoryFailure(res.error));
      }
    });
  };
};

const gettingAttendance = () => {
  return {
    type: GET_ATTENDANCE
  };
};

const getAttendanceSuccess = (data, loadKey?: string, overwrite: boolean = false) => {
  return {
    type: GET_ATTENDANCE_SUCCESS,
    attended: data.attended,
    excused: data.excused,
    loadKey,
    overwrite
  };
};

const getAttendanceFailure = (err) => {
  return {
    type: GET_ATTENDANCE_FAILURE,
    error: err
  };
};

export const getMyAttendance = (user: TUser, overwrite: boolean = false) => {
  return getUserAttendance(user, user.email, overwrite);
};

export const getUserAttendance = (user: TUser, target: string, overwrite: boolean = false) => {
  return (dispatch) => {
    dispatch(gettingAttendance());

    Kappa.getAttendanceByUser({ user, target }).then((res) => {
      if (res.success) {
        dispatch(getAttendanceSuccess(res.data, `user-${target}`, overwrite));
      } else {
        dispatch(getAttendanceFailure(res.error));
      }
    });
  };
};

export const getEventAttendance = (user: TUser, target: string, overwrite: boolean = false) => {
  return (dispatch) => {
    dispatch(gettingAttendance());

    Kappa.getAttendanceByEvent({ user, target }).then((res) => {
      if (res.success) {
        dispatch(getAttendanceSuccess(res.data, `event-${target}`, overwrite));
      } else {
        dispatch(getAttendanceFailure(res.error));
      }
    });
  };
};

const gettingExcuses = () => {
  return {
    type: GET_EXCUSES
  };
};

const getExcusesSuccess = (data) => {
  return {
    type: GET_EXCUSES_SUCCESS,
    pending: data.pending
  };
};

const getExcusesFailure = (err) => {
  return {
    type: GET_EXCUSES_FAILURE,
    error: err
  };
};

export const getExcuses = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingExcuses());

    Kappa.getPendingExcuses({ user }).then((res) => {
      if (res.success) {
        dispatch(getExcusesSuccess(res.data));
      } else {
        dispatch(getExcusesFailure(res.error));
      }
    });
  };
};

export const selectEvent = (eventId: string) => {
  return {
    type: SELECT_EVENT,
    eventId
  };
};

export const unselectEvent = () => {
  return {
    type: UNSELECT_EVENT
  };
};

export const selectUser = (email: string) => {
  return {
    type: SELECT_USER,
    email
  };
};

export const unselectUser = () => {
  return {
    type: UNSELECT_USER
  };
};

export const editNewEvent = () => {
  return {
    type: EDIT_NEW_EVENT
  };
};

export const editExistingEvent = (eventId: string) => {
  return {
    type: EDIT_EXISTING_EVENT,
    eventId
  };
};

export const cancelEditEvent = () => {
  return {
    type: CANCEL_EDIT_EVENT
  };
};

const savingEditEvent = () => {
  return {
    type: SAVE_EDIT_EVENT
  };
};

const saveEditEventSuccess = (data) => {
  return {
    type: SAVE_EDIT_EVENT_SUCCESS,
    event: data.event
  };
};

const saveEditEventFailure = (err) => {
  return {
    type: SAVE_EDIT_EVENT_FAILURE,
    error: err
  };
};

export const saveEditEvent = (user: TUser, event: Partial<TEvent>, eventId?: string) => {
  return (dispatch) => {
    dispatch(savingEditEvent());

    if (eventId) {
      Kappa.updateEvent({ user, eventId, changes: event }).then((res) => {
        if (res.success) {
          dispatch(saveEditEventSuccess(res.data));
        } else {
          dispatch(saveEditEventFailure(res.error));
        }
      });
    } else {
      Kappa.createEvent({ user, event }).then((res) => {
        if (res.success) {
          dispatch(saveEditEventSuccess(res.data));
        } else {
          dispatch(saveEditEventFailure(res.error));
        }
      });
    }
  };
};

const deletingEvent = () => {
  return {
    type: DELETE_EVENT
  };
};

const deleteEventSuccess = (data) => {
  return {
    type: DELETE_EVENT_SUCCESS,
    event: data.event
  };
};

const deleteEventFailure = (err) => {
  return {
    type: DELETE_EVENT_FAILURE,
    error: err
  };
};

export const deleteEvent = (user: TUser, event: TEvent) => {
  return (dispatch) => {
    dispatch(deletingEvent());

    Kappa.deleteEvent({ user, event }).then((res) => {
      if (res.success) {
        dispatch(deleteEventSuccess(res.data));
      } else {
        dispatch(deleteEventFailure(res.error));
      }
    });
  };
};

export const setCheckInEvent = (eventId: string, excuse: boolean) => {
  return {
    type: SET_CHECK_IN_EVENT,
    eventId,
    excuse
  };
};

const checkingIn = () => {
  return {
    type: CHECK_IN
  };
};

const checkInSuccess = (data) => {
  return {
    type: CHECK_IN_SUCCESS,
    attended: data.attended
  };
};

const checkInFailure = (err) => {
  return {
    type: CHECK_IN_FAILURE,
    error: err
  };
};

export const checkIn = (user: TUser, eventId: string, eventCode: string) => {
  return (dispatch) => {
    dispatch(checkingIn());

    Kappa.createAttendance({ user, eventId, eventCode }).then((res) => {
      if (res.success) {
        dispatch(checkInSuccess(res.data));
      } else {
        dispatch(checkInFailure(res.error));
      }
    });
  };
};

const creatingExcuse = () => {
  return {
    type: CREATE_EXCUSE
  };
};

const createExcuseSuccess = (data) => {
  return {
    type: CREATE_EXCUSE_SUCCESS,
    excused: data.excused,
    pending: data.pending
  };
};

const createExcuseFailure = (err) => {
  return {
    type: CREATE_EXCUSE_FAILURE,
    error: err
  };
};

export const createExcuse = (
  user: TUser,
  event: TEvent,
  excuse: {
    reason: string;
    late: boolean;
  }
) => {
  return (dispatch) => {
    dispatch(creatingExcuse());

    Kappa.createExcuse({ user, event, excuse }).then((res) => {
      if (res.success) {
        dispatch(createExcuseSuccess(res.data));
      } else {
        dispatch(createExcuseFailure(res.error));
      }
    });
  };
};

const approvingExcuse = () => {
  return {
    type: APPROVE_EXCUSE
  };
};

const approveExcuseSuccess = (data) => {
  return {
    type: APPROVE_EXCUSE_SUCCESS,
    excused: data.excused
  };
};

const approveExcuseFailure = (err) => {
  return {
    type: APPROVE_EXCUSE_FAILURE,
    error: err
  };
};

export const approveExcuse = (user: TUser, excuse: TExcuse) => {
  return (dispatch) => {
    dispatch(approvingExcuse());

    Kappa.updateExcuse({ user, excuse: { ...excuse, approved: true } }).then((res) => {
      if (res.success) {
        dispatch(approveExcuseSuccess(res.data));
      } else {
        dispatch(approveExcuseFailure(res.error));
      }
    });
  };
};

const rejectingExcuse = () => {
  return {
    type: REJECT_EXCUSE
  };
};

const rejectExcuseSuccess = (data) => {
  return {
    type: REJECT_EXCUSE_SUCCESS,
    excused: data.excused
  };
};

const rejectExcuseFailure = (err) => {
  return {
    type: REJECT_EXCUSE_FAILURE,
    error: err
  };
};

export const rejectExcuse = (user: TUser, excuse: TExcuse) => {
  return (dispatch) => {
    dispatch(rejectingExcuse());

    Kappa.updateExcuse({ user, excuse: { ...excuse, approved: false } }).then((res) => {
      if (res.success) {
        dispatch(rejectExcuseSuccess(res.data));
      } else {
        dispatch(rejectExcuseFailure(res.error));
      }
    });
  };
};

const gettingPoints = () => {
  return {
    type: GET_POINTS
  };
};

const getPointsSuccess = (data, target: string) => {
  return {
    type: GET_POINTS_SUCCESS,
    points: data.points,
    target
  };
};

const getPointsFailure = (err) => {
  return {
    type: GET_POINTS_FAILURE,
    error: err
  };
};

export const getPointsByUser = (user: TUser, target: string) => {
  return (dispatch) => {
    dispatch(gettingPoints());

    Kappa.getPointsByUser({ user, target }).then((res) => {
      if (res.success) {
        dispatch(getPointsSuccess(res.data, target));
      } else {
        dispatch(getPointsFailure(res.error));
      }
    });
  };
};

const gettingEventSearchResults = () => {
  return {
    type: GET_EVENT_SEARCH_RESULTS
  };
};

const getEventSearchResultsSuccess = (data) => {
  return {
    type: GET_EVENT_SEARCH_RESULTS_SUCCESS,
    events: data.events
  };
};

const getEventSearchResultsFailure = (err) => {
  return {
    type: GET_EVENT_SEARCH_RESULTS_FAILURE,
    error: err
  };
};

export const getEventSearchResults = (user: TUser, search: TEventSearch) => {
  return (dispatch) => {
    dispatch(gettingEventSearchResults());

    Kappa.getEventSearchResults({ user, search }).then((res) => {
      if (res.success) {
        dispatch(getEventSearchResultsSuccess(res.data));
      } else {
        dispatch(getEventSearchResultsFailure(res.error));
      }
    });
  };
};
