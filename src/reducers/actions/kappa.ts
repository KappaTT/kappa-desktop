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
  GET_EVENT_SEARCH_RESULTS_FAILURE,
  UPDATE_USER,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  EDIT_USER,
  CANCEL_EDIT_USER,
  EDIT_NEW_USER,
  DELETE_USER,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  GENERATE_SECRET_CODE,
  GENERATE_SECRET_CODE_SUCCESS,
  GENERATE_SECRET_CODE_FAILURE,
  CREATE_BULK_ATTENDANCE,
  CREATE_BULK_ATTENDANCE_SUCCESS,
  CREATE_BULK_ATTENDANCE_FAILURE,
  SHOW_BULK_ATTENDANCE,
  HIDE_BULK_ATTENDANCE
} from '@reducers/kappa';
import { TUser } from '@backend/auth';
import { TEvent, TExcuse, TEventSearch } from '@backend/kappa';
import { modifyUser } from './auth';
import { setBatch } from '@services/asyncStorage';

/**
 * Set the global error message.
 */
export const setGlobalError = (data) => {
  return {
    type: SET_GLOBAL_ERROR_MESSAGE,
    message: data.message,
    code: data.code
  };
};

/**
 * Clear the global error message.
 */
export const clearGlobalError = () => {
  return {
    type: CLEAR_GLOBAL_ERROR_MESSAGE
  };
};

/**
 * Is generating a secret code.
 */
const generatingSecretCode = () => {
  return {
    type: GENERATE_SECRET_CODE
  };
};

/**
 * Finished generating a secret code successfully.
 */
const generateSecretCodeSuccess = (data) => {
  return {
    type: GENERATE_SECRET_CODE_SUCCESS
  };
};

/**
 * Finished generating a secret code with an error.
 */
const generateSecretCodeFailure = (error) => {
  return {
    type: GENERATE_SECRET_CODE_FAILURE,
    error
  };
};

/**
 * Generate a secret code.
 */
export const generateSecretCode = (user: TUser) => {
  return (dispatch) => {
    dispatch(generatingSecretCode());

    Kappa.generateSecretCode({ user }).then((res) => {
      if (res.success) {
        if (user.email === res.data.user?.email) {
          dispatch(modifyUser(res.data.user));
          setBatch('user', {
            secretCode: res.data.user.secretCode,
            secretCodeExpiration: res.data.user.secretCodeExpiration
          });
        }

        dispatch(generateSecretCodeSuccess(res.data));
      } else {
        dispatch(generateSecretCodeFailure(res.error));
      }
    });
  };
};

/**
 * Open the editing page for a given user by email.
 */
export const editUser = (email: string) => {
  return {
    type: EDIT_USER,
    email
  };
};

/**
 * Open the editing page to create a new user.
 */
export const editNewUser = () => {
  return {
    type: EDIT_NEW_USER
  };
};

/**
 * Cancel the user editing page.
 */
export const cancelEditUser = () => {
  return {
    type: CANCEL_EDIT_USER
  };
};

/**
 * Is updating a user.
 */
const updatingUser = () => {
  return {
    type: UPDATE_USER
  };
};

/**
 * Finished updating a user successfully.
 */
const updateUserSuccess = (data) => {
  return {
    type: UPDATE_USER_SUCCESS,
    user: data.user
  };
};

/**
 * Finished updating a user with an error.
 */
const updateUserFailure = (error) => {
  return {
    type: UPDATE_USER_FAILURE,
    error
  };
};

/**
 * Update a given user.
 */
export const updateUser = (user: TUser, target: string, changes: Partial<TUser>) => {
  return (dispatch) => {
    dispatch(updatingUser());

    if (target) {
      Kappa.updateUser({ user, target, changes }).then((res) => {
        if (res.success) {
          if (user.email === res.data.user?.email) {
            dispatch(modifyUser(res.data.user));
            setBatch('user', changes);
          }

          dispatch(updateUserSuccess(res.data));
        } else {
          dispatch(updateUserFailure(res.error));
        }
      });
    } else {
      Kappa.createUser({ user, newUser: changes }).then((res) => {
        if (res.success) {
          dispatch(updateUserSuccess(res.data));
        } else {
          dispatch(updateUserFailure(res.error));
        }
      });
    }
  };
};

/**
 * Is deleting a user.
 */
const deletingUser = () => {
  return {
    type: DELETE_USER
  };
};

/**
 * Finished deleting a user successfully.
 */
const deleteUserSuccess = (data) => {
  return {
    type: DELETE_USER_SUCCESS,
    user: data.user
  };
};

/**
 * Finished deleting a user with an error.
 */
const deleteUserFailure = (error) => {
  return {
    type: DELETE_USER_FAILURE,
    error
  };
};

/**
 * Delete a given user.
 */
export const deleteUser = (user: TUser, email: string) => {
  return (dispatch) => {
    dispatch(deletingUser());

    Kappa.deleteUser({ user, target: email }).then((res) => {
      if (res.success) {
        dispatch(deleteUserSuccess(res.data));
      } else {
        dispatch(deleteUserFailure(res.error));
      }
    });
  };
};

/**
 * Is getting the list of events.
 */
const gettingEvents = () => {
  return {
    type: GET_EVENTS
  };
};

/**
 * Finished getting the events successfully.
 */
const getEventsSuccess = (data) => {
  return {
    type: GET_EVENTS_SUCCESS,
    events: data.events
  };
};

/**
 * Finished getting the events with an error.
 */
const getEventsFailure = (err) => {
  return {
    type: GET_EVENTS_FAILURE,
    error: err
  };
};

/**
 * Get the list of events.
 */
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

/**
 * Is getting the brother list.
 */
const gettingDirectory = () => {
  return {
    type: GET_DIRECTORY
  };
};

/**
 * Finished getting the brother list successfully.
 */
const getDirectorySuccess = (data) => {
  return {
    type: GET_DIRECTORY_SUCCESS,
    users: data.users,
    user: data.user,
    sessionToken: data.sessionToken
  };
};

/**
 * Finished getting the brother list with an error.
 */
const getDirectoryFailure = (err) => {
  return {
    type: GET_DIRECTORY_FAILURE,
    error: err
  };
};

/**
 * Get the list of brothers.
 */
export const getDirectory = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingDirectory());

    Kappa.getUsers({ user }).then((res) => {
      if (res.success) {
        if (res.data.user) {
          const latestUser = {
            ...res.data.user,
            sessionToken: res.data.sessionToken
          };

          dispatch(modifyUser(latestUser));
          setBatch('user', latestUser);
        }

        dispatch(getDirectorySuccess(res.data));
      } else {
        dispatch(getDirectoryFailure(res.error));
      }
    });
  };
};

/**
 * Is getting attendance.
 */
const gettingAttendance = () => {
  return {
    type: GET_ATTENDANCE
  };
};

/**
 * Finished getting attendance successfully for a given user or event.
 */
const getAttendanceSuccess = (data, loadKey?: string, target?: string, overwrite: boolean = false) => {
  return {
    type: GET_ATTENDANCE_SUCCESS,
    attended: data.attended,
    excused: data.excused,
    loadKey,
    target,
    overwrite
  };
};

/**
 * Finished getting attendance with an error.
 */
const getAttendanceFailure = (err) => {
  return {
    type: GET_ATTENDANCE_FAILURE,
    error: err
  };
};

/**
 * Get attendance for the signed in user.
 */
export const getMyAttendance = (user: TUser, overwrite: boolean = false) => {
  return getUserAttendance(user, user.email, overwrite);
};

/**
 * Get attendance for a given user.
 */
export const getUserAttendance = (user: TUser, target: string, overwrite: boolean = false) => {
  return (dispatch) => {
    dispatch(gettingAttendance());

    Kappa.getAttendanceByUser({ user, target }).then((res) => {
      if (res.success) {
        dispatch(getAttendanceSuccess(res.data, `user-${target}`, target, overwrite));
      } else {
        dispatch(getAttendanceFailure(res.error));
      }
    });
  };
};

/**
 * Get attendance for a given event.
 */
export const getEventAttendance = (user: TUser, target: string, overwrite: boolean = false) => {
  return (dispatch) => {
    dispatch(gettingAttendance());

    Kappa.getAttendanceByEvent({ user, target }).then((res) => {
      if (res.success) {
        dispatch(getAttendanceSuccess(res.data, `event-${target}`, target, overwrite));
      } else {
        dispatch(getAttendanceFailure(res.error));
      }
    });
  };
};

/**
 * Is getting excuses.
 */
const gettingExcuses = () => {
  return {
    type: GET_EXCUSES
  };
};

/**
 * Finished getting excuses successfully.
 */
const getExcusesSuccess = (data) => {
  return {
    type: GET_EXCUSES_SUCCESS,
    pending: data.pending
  };
};

/**
 * Finished getting excuses with an error.
 */
const getExcusesFailure = (err) => {
  return {
    type: GET_EXCUSES_FAILURE,
    error: err
  };
};

/**
 * Get the pending excuses for a given user.
 */
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

/**
 * Select a given event.
 */
export const selectEvent = (eventId: string) => {
  return {
    type: SELECT_EVENT,
    eventId
  };
};

/**
 * Clear the event selection.
 */
export const unselectEvent = () => {
  return {
    type: UNSELECT_EVENT
  };
};

/**
 * Select a given user.
 */
export const selectUser = (email: string) => {
  return {
    type: SELECT_USER,
    email
  };
};

/**
 * Clear the user selection.
 */
export const unselectUser = () => {
  return {
    type: UNSELECT_USER
  };
};

/**
 * Open the event editor page to create a new event.
 */
export const editNewEvent = () => {
  return {
    type: EDIT_NEW_EVENT
  };
};

/**
 * Open the event editor page to edit an existing event.
 */
export const editExistingEvent = (eventId: string) => {
  return {
    type: EDIT_EXISTING_EVENT,
    eventId
  };
};

/**
 * Close the event editor.
 */
export const cancelEditEvent = () => {
  return {
    type: CANCEL_EDIT_EVENT
  };
};

/**
 * Is saving an event.
 */
const savingEditEvent = () => {
  return {
    type: SAVE_EDIT_EVENT
  };
};

/**
 * Finished saving an event successfully.
 */
const saveEditEventSuccess = (data) => {
  return {
    type: SAVE_EDIT_EVENT_SUCCESS,
    event: data.event
  };
};

/**
 * Finished saving an event with an error.
 */
const saveEditEventFailure = (err) => {
  return {
    type: SAVE_EDIT_EVENT_FAILURE,
    error: err
  };
};

/**
 * Save an event with the given id or create one that does not exist.
 */
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

/**
 * Is deleting an event.
 */
const deletingEvent = () => {
  return {
    type: DELETE_EVENT
  };
};

/**
 * Finished deleting an event successfully.
 */
const deleteEventSuccess = (data) => {
  return {
    type: DELETE_EVENT_SUCCESS,
    event: data.event
  };
};

/**
 * Finished deleting an event with an error.
 */
const deleteEventFailure = (err) => {
  return {
    type: DELETE_EVENT_FAILURE,
    error: err
  };
};

/**
 * Delete a given event.
 */
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

/**
 * Set the event being checked into.
 */
export const setCheckInEvent = (eventId: string, excuse: boolean) => {
  return {
    type: SET_CHECK_IN_EVENT,
    eventId,
    excuse
  };
};

/**
 * Is checking in to an event.
 */
const checkingIn = () => {
  return {
    type: CHECK_IN
  };
};

/**
 * Finished checking in successfully.
 */
const checkInSuccess = (data) => {
  return {
    type: CHECK_IN_SUCCESS,
    attended: data.attended
  };
};

/**
 * Finished checking in with an error.
 */
const checkInFailure = (err) => {
  return {
    type: CHECK_IN_FAILURE,
    error: err
  };
};

/**
 * Check into a given event with a given code.
 */
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

/**
 * Is creating an excuse.
 */
const creatingExcuse = () => {
  return {
    type: CREATE_EXCUSE
  };
};

/**
 * Finished creating an excuse successfully.
 */
const createExcuseSuccess = (data) => {
  return {
    type: CREATE_EXCUSE_SUCCESS,
    excused: data.excused,
    pending: data.pending
  };
};

/**
 * Finished creating an excuse with an error.
 */
const createExcuseFailure = (err) => {
  return {
    type: CREATE_EXCUSE_FAILURE,
    error: err
  };
};

/**
 * Create a new excuse for a given event.
 */
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

/**
 * Is approving an excuse.
 */
const approvingExcuse = () => {
  return {
    type: APPROVE_EXCUSE
  };
};

/**
 * Finished approving an excuse successfully.
 */
const approveExcuseSuccess = (data) => {
  return {
    type: APPROVE_EXCUSE_SUCCESS,
    excused: data.excused
  };
};

/**
 * Finished approving an excuse with an error.
 */
const approveExcuseFailure = (err) => {
  return {
    type: APPROVE_EXCUSE_FAILURE,
    error: err
  };
};

/**
 * Approve a given excuse.
 */
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

/**
 * Is rejecting an excuse.
 */
const rejectingExcuse = () => {
  return {
    type: REJECT_EXCUSE
  };
};

/**
 * Finished rejecting an excuse successfully.
 */
const rejectExcuseSuccess = (data) => {
  return {
    type: REJECT_EXCUSE_SUCCESS,
    excused: data.excused
  };
};

/**
 * Finished rejecting an excuse with an error.
 */
const rejectExcuseFailure = (err) => {
  return {
    type: REJECT_EXCUSE_FAILURE,
    error: err
  };
};

/**
 * Reject a given excuse.
 */
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

/**
 * Is getting the points for a user.
 */
const gettingPoints = () => {
  return {
    type: GET_POINTS
  };
};

/**
 * Finished getting points successfully.
 */
const getPointsSuccess = (data, target: string) => {
  return {
    type: GET_POINTS_SUCCESS,
    points: data.points,
    target
  };
};

/**
 * Finished getting points with an error.
 */
const getPointsFailure = (err) => {
  return {
    type: GET_POINTS_FAILURE,
    error: err
  };
};

/**
 * Get the points for a given user.
 */
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

/**
 * Show the bulk attendance editor.
 */
export const showBulkAttendance = (eventId: string) => {
  return {
    type: SHOW_BULK_ATTENDANCE,
    eventId
  };
};

/**
 * Hide the bulk attendance editor.
 */
export const hideBulkAttendance = () => {
  return {
    type: HIDE_BULK_ATTENDANCE
  };
};

/**
 * Is creating new bulk attendance.
 */
const creatingBulkAttendance = () => {
  return {
    type: CREATE_BULK_ATTENDANCE
  };
};

/**
 * Finished creating the bulk attendance successfully.
 */
const createBulkAttendanceSuccess = (data) => {
  return {
    type: CREATE_BULK_ATTENDANCE_SUCCESS,
    attended: data.attended
  };
};

/**
 * Finished creating the bulk attendance with an error.
 */
const createBulkAttendanceFailure = (error) => {
  return {
    type: CREATE_BULK_ATTENDANCE_FAILURE,
    error
  };
};

/**
 * Create the bulk attendance records.
 */
export const createBulkAttendance = (user: TUser, eventId: string, emails: string[]) => {
  return (dispatch) => {
    dispatch(creatingBulkAttendance());

    Kappa.createBulkAttendance({ user, eventId, emails }).then((res) => {
      if (res.success) {
        dispatch(createBulkAttendanceSuccess(res.data));
      } else {
        dispatch(createBulkAttendanceFailure(res.error));
      }
    });
  };
};

/**
 * Is getting the event search results.
 */
const gettingEventSearchResults = () => {
  return {
    type: GET_EVENT_SEARCH_RESULTS
  };
};

/**
 * Finished getting event search results successfully.
 */
const getEventSearchResultsSuccess = (data) => {
  return {
    type: GET_EVENT_SEARCH_RESULTS_SUCCESS,
    events: data.events
  };
};

/**
 * Finished getting event search results with an error.
 */
const getEventSearchResultsFailure = (err) => {
  return {
    type: GET_EVENT_SEARCH_RESULTS_FAILURE,
    error: err
  };
};

/**
 * Get events that match given criteria.
 */
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
