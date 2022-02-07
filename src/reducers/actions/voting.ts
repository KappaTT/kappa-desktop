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
  CLEAR_GLOBAL_ERROR_MESSAGE,
  EDIT_MULT_CANDIDATE,
  CANCEL_EDIT_MULT_CANDIDATE
} from '@reducers/voting';

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
 * Is getting the list of candidates.
 */
const gettingCandidates = () => {
  return {
    type: GET_CANDIDATES
  };
};

/**
 * Finished getting the candidates successfully.
 */
const getCandidatesSuccess = (data) => {
  return {
    type: GET_CANDIDATES_SUCCESS,
    candidates: data.candidates
  };
};

/**
 * Finished getting the candidates with an error.
 */
const getCandidatesFailure = (error) => {
  return {
    type: GET_CANDIDATES_FAILURE,
    error
  };
};

/**
 * Get the list of candidates.
 */
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

/**
 * Is saving a candidate.
 */
const savingCandidate = () => {
  return {
    type: SAVE_CANDIDATE
  };
};

/**
 * Finished saving a candidate successfully.
 */
const saveCandidateSuccess = (data) => {
  return {
    type: SAVE_CANDIDATE_SUCCESS,
    candidate: data.candidate
  };
};

/**
 * Finished saving a candidate with an error.
 */
const saveCandidateFailure = (error) => {
  return {
    type: SAVE_CANDIDATE_FAILURE,
    error
  };
};

/**
 * Save a given candidate by email if one exists, create one otherwise.
 */
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

export const saveSuccess = (data) => {
  return (dispatch) => {
    dispatch(saveCandidateSuccess(data));
  };
};

export const saveFailure = (error) => {
  return (dispatch) => {
    dispatch(saveCandidateFailure(error));
  };
};

/**
 * Is deleting a candidate.
 */
const deletingCandidate = () => {
  return {
    type: DELETE_CANDIDATE
  };
};

/**
 * Finished deleting a candidate successfully.
 */
const deleteCandidateSuccess = (data) => {
  return {
    type: DELETE_CANDIDATE_SUCCESS,
    candidate: data.candidate
  };
};

/**
 * Finished deleting a candidate with an error.
 */
const deleteCandidateFailure = (error) => {
  return {
    type: DELETE_CANDIDATE_FAILURE,
    error
  };
};

/**
 * Delete a given candidate by email.
 */
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

/**
 * Select a given candidate.
 */
export const selectCandidate = (email: string) => {
  return {
    type: SELECT_CANDIDATE,
    email
  };
};

/**
 * Clear the candidate selection.
 */
export const unselectCandidate = () => {
  return {
    type: UNSELECT_CANDIDATE
  };
};

/**
 * Edit or create a new candidate.
 */
export const editCandidate = (email: string = 'NEW') => {
  return {
    type: EDIT_CANDIDATE,
    email
  };
};

/**
 * Close the candidate editor.
 */
export const cancelEditCandidate = () => {
  return {
    type: CANCEL_EDIT_CANDIDATE
  };
};

/**
 * Edit or create multiple new candidates
 */
export const editMultCandidate = (email: string = 'NEW') => {
  return {
    type: EDIT_MULT_CANDIDATE,
    email
  };
};

/**
 * Close the multiple candidate editor.
 */
export const cancelEditMultCandidate = () => {
  return {
    type: CANCEL_EDIT_MULT_CANDIDATE
  };
};

/**
 * Is getting the session list.
 */
const gettingSessions = () => {
  return {
    type: GET_SESSIONS
  };
};

/**
 * Finished getting the sessions successfully.
 */
const getSessionsSuccess = (data) => {
  return {
    type: GET_SESSIONS_SUCCESS,
    sessions: data.sessions
  };
};

/**
 * Finished getting the sessions with an error.
 */
const getSessionsFailure = (error) => {
  return {
    type: GET_SESSIONS_FAILURE,
    error
  };
};

/**
 * Get the available voting sessions.
 */
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

/**
 * Is saving a session.
 */
const savingSession = () => {
  return {
    type: SAVE_SESSION
  };
};

/**
 * Finished saving a session successfully.
 */
const saveSessionSuccess = (data) => {
  return {
    type: SAVE_SESSION_SUCCESS,
    session: data.session
  };
};

/**
 * Finished saving a session with an error.
 */
const saveSessionFailure = (error) => {
  return {
    type: SAVE_SESSION_FAILURE,
    error
  };
};

/**
 * Save a session by id if it exists otherwise create a new one.
 */
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

/**
 * Is deleting a session.
 */
const deletingSession = () => {
  return {
    type: DELETE_SESSION
  };
};

/**
 * Finished deleting a session successfully.
 */
const deleteSessionSuccess = (data) => {
  return {
    type: DELETE_SESSION_SUCCESS,
    session: data.session
  };
};

/**
 * Finished deleting a session with an error.
 */
const deleteSessionFailure = (error) => {
  return {
    type: DELETE_SESSION_FAILURE,
    error
  };
};

/**
 * Delete a given session.
 */
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

/**
 * Is starting a session.
 */
const startingSession = () => {
  return {
    type: START_SESSION
  };
};

/**
 * Finished starting a session successfully.
 */
const startSessionSuccess = (data) => {
  return {
    type: START_SESSION_SUCCESS,
    session: data.session
  };
};

/**
 * Finished starting a session with an error.
 */
const startSessionFailure = (error) => {
  return {
    type: START_SESSION_FAILURE,
    error
  };
};

/**
 * Start a session for voting.
 */
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

/**
 * Is stopping a session.
 */
const stoppingSession = () => {
  return {
    type: STOP_SESSION
  };
};

/**
 * Finished stopping a session successfully.
 */
const stopSessionSuccess = (data) => {
  return {
    type: STOP_SESSION_SUCCESS,
    session: data.session
  };
};

/**
 * Finished stopping a session with an error.
 */
const stopSessionFailure = (error) => {
  return {
    type: STOP_SESSION_FAILURE,
    error
  };
};

/**
 * Stop a given voting session.
 */
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

/**
 * Is getting the votes for an active session and candidate.
 */
const gettingActiveVotes = () => {
  return {
    type: GET_ACTIVE_VOTES
  };
};

/**
 * Finished getting the active votes successfully.
 */
const getActiveVotesSuccess = (data) => {
  return {
    type: GET_ACTIVE_VOTES_SUCCESS,
    sessions: data.sessions,
    candidate: data.candidate,
    candidates: data.candidates,
    votes: data.votes
  };
};

/**
 * Finished getting the active votes with an error.
 */
const getActiveVotesFailure = (error) => {
  return {
    type: GET_ACTIVE_VOTES_FAILURE,
    error
  };
};

/**
 * Get the votes for the active session and candidate if available.
 */
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

/**
 * Is getting the votes for a given candidate.
 */
const gettingCandidateVotes = () => {
  return {
    type: GET_CANDIDATE_VOTES
  };
};

/**
 * Finished getting the votes successfully.
 */
const getCandidateVotesSuccess = (data, useLoadHistory: boolean) => {
  return {
    type: GET_CANDIDATE_VOTES_SUCCESS,
    session: data.session,
    candidate: data.candidate,
    votes: data.votes,
    useLoadHistory
  };
};

/**
 * Finished getting the votes with an error.
 */
const getCandidateVotesFailure = (error) => {
  return {
    type: GET_CANDIDATE_VOTES_FAILURE,
    error
  };
};

/**
 * Get the votes for a given candidate and session.
 */
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

/**
 * Is submitting a vote.
 */
const submittingVote = () => {
  return {
    type: SUBMIT_VOTE
  };
};

/**
 * Finished submitting a vote successfully.
 */
const submitVoteSuccess = (data) => {
  return {
    type: SUBMIT_VOTE_SUCCESS,
    votes: data.votes
  };
};

/**
 * Finished submitting a vote with an error.
 */
const submitVoteFailure = (error) => {
  return {
    type: SUBMIT_VOTE_FAILURE,
    error
  };
};

/**
 * Submit a vote for a given session and candidate.
 */
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

/**
 * Submit votes for multiple candidates in a given session.
 */
export const submitMultiVote = (user: TUser, sessionId: string, candidates: string[]) => {
  return (dispatch) => {
    dispatch(submittingVote());

    Voting.submitMultiVote({ user, sessionId, candidates }).then((res) => {
      if (res.success) {
        dispatch(submitVoteSuccess(res.data));
      } else {
        dispatch(submitVoteFailure(res.error));
      }
    });
  };
};

/**
 * Is creating the next session.
 */
const creatingNextSession = () => {
  return {
    type: CREATE_NEXT_SESSION
  };
};

/**
 * Finished creating the next session successfully.
 */
const createNextSessionSuccess = (data) => {
  return {
    type: CREATE_NEXT_SESSION_SUCCESS,
    session: data.session
  };
};

/**
 * Finished creating the next session with an error.
 */
const createNextSessionFailure = (error) => {
  return {
    type: CREATE_NEXT_SESSION_FAILURE,
    error
  };
};

/**
 * Create the next session based on the current session status.
 */
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

/**
 * Select a given session.
 */
export const selectSession = (session: TSession) => {
  return {
    type: SELECT_SESSION,
    session
  };
};

/**
 * Clear the session selection.
 */
export const unselectSession = () => {
  return {
    type: UNSELECT_SESSION
  };
};

/**
 * Edit a given session or create a new one.
 */
export const editSession = (_id: string = 'NEW') => {
  return {
    type: EDIT_SESSION,
    _id
  };
};

/**
 * Close the session editor.
 */
export const cancelEditSession = () => {
  return {
    type: CANCEL_EDIT_SESSION
  };
};

/**
 * Show the presentation mode.
 */
export const showPresentationMode = () => {
  return {
    type: SHOW_PRESENTATION_MODE
  };
};

/**
 * Hide the presentation mode.
 */
export const hidePresentationMode = () => {
  return {
    type: HIDE_PRESENTATION_MODE
  };
};

/**
 * Show the voting page.
 */
export const showVoting = () => {
  return {
    type: SHOW_VOTING
  };
};

/**
 * Hide the voting page.
 */
export const hideVoting = () => {
  return {
    type: HIDE_VOTING
  };
};
