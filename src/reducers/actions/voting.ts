import { Voting } from '@backend';
import { TUser } from '@backend/auth';
import { TCandidate, TSession, TVote } from '@backend/voting';
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
  SELECT_SESSION,
  UNSELECT_SESSION,
  START_SESSION,
  START_SESSION_SUCCESS,
  START_SESSION_FAILURE,
  STOP_SESSION,
  STOP_SESSION_SUCCESS,
  STOP_SESSION_FAILURE,
  EDIT_SESSION,
  CANCEL_EDIT_SESSION,
  SAVE_SESSION,
  DELETE_SESSION,
  SAVE_SESSION_SUCCESS,
  SAVE_SESSION_FAILURE,
  DELETE_SESSION_SUCCESS,
  DELETE_SESSION_FAILURE,
  GET_ACTIVE_VOTES,
  GET_ACTIVE_VOTES_SUCCESS,
  GET_ACTIVE_VOTES_FAILURE,
  GET_CANDIDATE_VOTES,
  GET_CANDIDATE_VOTES_SUCCESS,
  GET_CANDIDATE_VOTES_FAILURE,
  CREATE_NEXT_SESSION,
  CREATE_NEXT_SESSION_SUCCESS,
  CREATE_NEXT_SESSION_FAILURE,
  SHOW_PRESENTATION_MODE,
  HIDE_PRESENTATION_MODE,
  SHOW_VOTING,
  HIDE_VOTING,
  SUBMIT_VOTE,
  SUBMIT_VOTE_SUCCESS,
  SUBMIT_VOTE_FAILURE,
  SET_GLOBAL_ERROR_MESSAGE,
  CLEAR_GLOBAL_ERROR_MESSAGE
} from '@reducers/voting';

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

const savingSession = () => {
  return {
    type: SAVE_SESSION
  };
};

const saveSessionSuccess = (data) => {
  return {
    type: SAVE_SESSION_SUCCESS,
    session: data.session
  };
};

const saveSessionFailure = (error) => {
  return {
    type: SAVE_SESSION_FAILURE,
    error
  };
};

export const saveSession = (user: TUser, session: Partial<TSession>, _id?: string) => {
  return (dispatch) => {
    dispatch(savingSession());

    if (_id) {
      Voting.updateSession({ user, _id, changes: session }).then((res) => {
        if (res.success) {
          dispatch(saveSessionSuccess(res.data));
        } else {
          dispatch(saveSessionFailure(res.error));
        }
      });
    } else {
      Voting.createSession({ user, session }).then((res) => {
        if (res.success) {
          dispatch(saveSessionSuccess(res.data));
        } else {
          dispatch(saveSessionFailure(res.error));
        }
      });
    }
  };
};

const deletingSession = () => {
  return {
    type: DELETE_SESSION
  };
};

const deleteSessionSuccess = (data) => {
  return {
    type: DELETE_SESSION_SUCCESS,
    session: data.session
  };
};

const deleteSessionFailure = (error) => {
  return {
    type: DELETE_SESSION_FAILURE,
    error
  };
};

export const deleteSession = (user: TUser, _id: string) => {
  return (dispatch) => {
    dispatch(deletingSession());

    Voting.deleteSession({ user, _id }).then((res) => {
      if (res.success) {
        dispatch(deleteSessionSuccess(res.data));
      } else {
        dispatch(deleteSessionFailure(res.error));
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

const gettingActiveVotes = () => {
  return {
    type: GET_ACTIVE_VOTES
  };
};

const getActiveVotesSuccess = (data) => {
  return {
    type: GET_ACTIVE_VOTES_SUCCESS,
    sessions: data.sessions,
    candidate: data.candidate,
    candidates: data.candidates,
    votes: data.votes
  };
};

const getActiveVotesFailure = (error) => {
  return {
    type: GET_ACTIVE_VOTES_FAILURE,
    error
  };
};

export const getActiveVotes = (user: TUser) => {
  return (dispatch) => {
    dispatch(gettingActiveVotes());

    Voting.getActiveVotes({ user }).then((res) => {
      if (res.success) {
        dispatch(getActiveVotesSuccess(res.data));
      } else {
        dispatch(getActiveVotesFailure(res.error));
      }
    });
  };
};

const gettingCandidateVotes = () => {
  return {
    type: GET_CANDIDATE_VOTES
  };
};

const getCandidateVotesSuccess = (data, useLoadHistory: boolean) => {
  return {
    type: GET_CANDIDATE_VOTES_SUCCESS,
    session: data.session,
    candidate: data.candidate,
    votes: data.votes,
    useLoadHistory
  };
};

const getCandidateVotesFailure = (error) => {
  return {
    type: GET_CANDIDATE_VOTES_FAILURE,
    error
  };
};

export const getCandidateVotes = (
  user: TUser,
  sessionId: string,
  candidateId: string,
  useLoadHistory: boolean = true
) => {
  return (dispatch) => {
    dispatch(gettingCandidateVotes());

    Voting.getCandidateVotes({ user, sessionId, candidateId }).then((res) => {
      if (res.success) {
        dispatch(getCandidateVotesSuccess(res.data, useLoadHistory));
      } else {
        dispatch(getCandidateVotesFailure(res.error));
      }
    });
  };
};

const submittingVote = () => {
  return {
    type: SUBMIT_VOTE
  };
};

const submitVoteSuccess = (data) => {
  return {
    type: SUBMIT_VOTE_SUCCESS,
    votes: data.votes
  };
};

const submitVoteFailure = (error) => {
  return {
    type: SUBMIT_VOTE_FAILURE,
    error
  };
};

export const submitVote = (user: TUser, vote: Partial<TVote>) => {
  return (dispatch) => {
    dispatch(submittingVote());

    Voting.submitVote({ user, vote }).then((res) => {
      if (res.success) {
        dispatch(submitVoteSuccess(res.data));
      } else {
        dispatch(submitVoteFailure(res.error));
      }
    });
  };
};

export const submitMultiVote = (user: TUser, candidates: string[]) => {
  return (dispatch) => {
    dispatch(submittingVote());

    Voting.submitMultiVote({ user, candidates }).then((res) => {
      if (res.success) {
        dispatch(submitVoteSuccess(res.data));
      } else {
        dispatch(submitVoteFailure(res.error));
      }
    });
  };
};

const creatingNextSession = () => {
  return {
    type: CREATE_NEXT_SESSION
  };
};

const createNextSessionSuccess = (data) => {
  return {
    type: CREATE_NEXT_SESSION_SUCCESS,
    session: data.session
  };
};

const createNextSessionFailure = (error) => {
  return {
    type: CREATE_NEXT_SESSION_FAILURE,
    error
  };
};

export const createNextSession = (user: TUser, sessionId: string) => {
  return (dispatch) => {
    dispatch(creatingNextSession());

    Voting.createNextSession({ user, sessionId }).then((res) => {
      if (res.success) {
        dispatch(createNextSessionSuccess(res.data));
      } else {
        dispatch(createNextSessionFailure(res.error));
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

export const editSession = (_id: string = 'NEW') => {
  return {
    type: EDIT_SESSION,
    _id
  };
};

export const cancelEditSession = () => {
  return {
    type: CANCEL_EDIT_SESSION
  };
};

export const showPresentationMode = () => {
  return {
    type: SHOW_PRESENTATION_MODE
  };
};

export const hidePresentationMode = () => {
  return {
    type: HIDE_PRESENTATION_MODE
  };
};

export const showVoting = () => {
  return {
    type: SHOW_VOTING
  };
};

export const hideVoting = () => {
  return {
    type: HIDE_VOTING
  };
};
