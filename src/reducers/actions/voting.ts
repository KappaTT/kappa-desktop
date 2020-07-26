import { Voting } from '@backend';
import { TUser } from '@backend/auth';
import { TCandidate, TSession } from '@backend/voting';
import {
  GET_CANDIDATES,
  GET_CANDIDATES_SUCCESS,
  GET_CANDIDATES_FAILURE,
  SAVE_CANDIDATE,
  SAVE_CANDIDATE_SUCCESS,
  SAVE_CANDIDATE_FAILURE,
  DELETE_CANDIDATE,
  DELETE_CANDIDATE_SUCCESS,
  DELETE_CANDIDATE_FAILURE,
  SELECT_CANDIDATE,
  UNSELECT_CANDIDATE,
  EDIT_CANDIDATE,
  CANCEL_EDIT_CANDIDATE,
  GET_SESSIONS,
  GET_SESSIONS_SUCCESS,
  GET_SESSIONS_FAILURE,
  SELECT_SESSION_CANDIDATE,
  SELECT_SESSION,
  UNSELECT_SESSION,
  UNSELECT_SESSION_CANDIDATE,
  START_SESSION,
  START_SESSION_SUCCESS,
  START_SESSION_FAILURE,
  STOP_SESSION,
  STOP_SESSION_SUCCESS,
  STOP_SESSION_FAILURE
} from '@reducers/voting';
import { atan } from 'react-native-reanimated';

const gettingCandidates = () => {
  return {
    type: GET_CANDIDATES
  };
};

const getCandidatesSuccess = (data) => {
  return {
    type: GET_CANDIDATES_SUCCESS,
    candidates: data.candidates
  };
};

const getCandidatesFailure = (error) => {
  return {
    type: GET_CANDIDATES_FAILURE,
    error
  };
};

export const getCandidates = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingCandidates());

    Voting.getCandidates({ user }).then((res) => {
      if (res.success) {
        dispatch(getCandidatesSuccess(res.data));
      } else {
        dispatch(getCandidatesFailure(res.error));
      }
    });
  };
};

const savingCandidate = () => {
  return {
    type: SAVE_CANDIDATE
  };
};

const saveCandidateSuccess = (data) => {
  return {
    type: SAVE_CANDIDATE_SUCCESS,
    candidate: data.candidate
  };
};

const saveCandidateFailure = (error) => {
  return {
    type: SAVE_CANDIDATE_FAILURE,
    error
  };
};

export const saveCandidate = (user: TUser, candidate: Partial<TCandidate>, email?: string) => {
  return (dispatch) => {
    dispatch(savingCandidate());

    if (email) {
      Voting.updateCandidate({ user, email, changes: candidate }).then((res) => {
        if (res.success) {
          dispatch(saveCandidateSuccess(res.data));
        } else {
          dispatch(saveCandidateFailure(res.error));
        }
      });
    } else {
      Voting.createCandidate({ user, candidate }).then((res) => {
        if (res.success) {
          dispatch(saveCandidateSuccess(res.data));
        } else {
          dispatch(saveCandidateFailure(res.error));
        }
      });
    }
  };
};

const deletingCandidate = () => {
  return {
    type: DELETE_CANDIDATE
  };
};

const deleteCandidateSuccess = (data) => {
  return {
    type: DELETE_CANDIDATE_SUCCESS,
    candidate: data.candidate
  };
};

const deleteCandidateFailure = (error) => {
  return {
    type: DELETE_CANDIDATE_FAILURE,
    error
  };
};

export const deleteCandidate = (user: TUser, email: string) => {
  return (dispatch) => {
    dispatch(deletingCandidate());

    Voting.deleteCandidate({ user, email }).then((res) => {
      if (res.success) {
        dispatch(deleteCandidateSuccess(res.data));
      } else {
        dispatch(deleteCandidateFailure(res.error));
      }
    });
  };
};

export const selectCandidate = (email: string) => {
  return {
    type: SELECT_CANDIDATE,
    email
  };
};

export const unselectCandidate = () => {
  return {
    type: UNSELECT_CANDIDATE
  };
};

export const editCandidate = (email: string = 'NEW') => {
  return {
    type: EDIT_CANDIDATE,
    email
  };
};

export const cancelEditCandidate = () => {
  return {
    type: CANCEL_EDIT_CANDIDATE
  };
};

const gettingSessions = () => {
  return {
    type: GET_SESSIONS
  };
};

const getSessionsSuccess = (data) => {
  return {
    type: GET_SESSIONS_SUCCESS,
    sessions: data.sessions
  };
};

const getSessionsFailure = (error) => {
  return {
    type: GET_SESSIONS_FAILURE,
    error
  };
};

export const getSessions = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingSessions());

    Voting.getSessions({ user }).then((res) => {
      if (res.success) {
        dispatch(getSessionsSuccess(res.data));
      } else {
        dispatch(getSessionsFailure(res.error));
      }
    });
  };
};

const startingSession = () => {
  return {
    type: START_SESSION
  };
};

const startSessionSuccess = (data) => {
  return {
    type: START_SESSION_SUCCESS,
    session: data.session
  };
};

const startSessionFailure = (error) => {
  return {
    type: START_SESSION_FAILURE,
    error
  };
};

export const startSession = (user: TUser, session: TSession) => {
  return (dispatch) => {
    dispatch(startingSession());

    Voting.startSession({ user, _id: session._id }).then((res) => {
      if (res.success) {
        dispatch(startSessionSuccess(res.data));
      } else {
        dispatch(startSessionFailure(res.error));
      }
    });
  };
};

const stoppingSession = () => {
  return {
    type: STOP_SESSION
  };
};

const stopSessionSuccess = (data) => {
  return {
    type: STOP_SESSION_SUCCESS,
    session: data.session
  };
};

const stopSessionFailure = (error) => {
  return {
    type: STOP_SESSION_FAILURE,
    error
  };
};

export const stopSession = (user: TUser, session: TSession) => {
  return (dispatch) => {
    dispatch(stoppingSession());

    Voting.stopSession({ user, _id: session._id }).then((res) => {
      if (res.success) {
        dispatch(stopSessionSuccess(res.data));
      } else {
        dispatch(stopSessionFailure(res.error));
      }
    });
  };
};

export const selectSession = (session: TSession) => {
  return {
    type: SELECT_SESSION,
    session
  };
};

export const unselectSession = () => {
  return {
    type: UNSELECT_SESSION
  };
};

export const selectSessionCandidate = (candidate: TCandidate) => {
  return {
    type: SELECT_SESSION_CANDIDATE,
    _id: candidate._id
  };
};

export const unselectSessionCandidate = () => {
  return {
    type: UNSELECT_SESSION_CANDIDATE
  };
};
