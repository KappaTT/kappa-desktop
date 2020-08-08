import moment from 'moment';

import { setGlobalError } from '@services/kappaService';
import { TLoadHistory } from '@backend/kappa';
import { TCandidate, TCandidateDict, TSession, TSessionToCandidateToVoteDict } from '@backend/voting';
import {
  recomputeVotingState,
  separateByCandidateEmail,
  mergeCandidates,
  mergeSessions,
  sortSessionByDate,
  mergeVotes
} from '@services/votingService';

export const SET_GLOBAL_ERROR_MESSAGE = 'SET_GLOBAL_ERROR_MESSAGE';
export const CLEAR_GLOBAL_ERROR_MESSAGE = 'CLEAR_GLOBAL_ERROR_MESSAGE';

export const GET_CANDIDATES = 'GET_CANDIDATES';
export const GET_CANDIDATES_SUCCESS = 'GET_CANDIDATES_SUCCESS';
export const GET_CANDIDATES_FAILURE = 'GET_CANDIDATES_FAILURE';
export const SAVE_CANDIDATE = 'SAVE_CANDIDATE';
export const SAVE_CANDIDATE_SUCCESS = 'SAVE_CANDIDATE_SUCCESS';
export const SAVE_CANDIDATE_FAILURE = 'SAVE_CANDIDATE_FAILURE';
export const DELETE_CANDIDATE = 'DELETE_CANDIDATE';
export const DELETE_CANDIDATE_SUCCESS = 'DELETE_CANDIDATE_SUCCESS';
export const DELETE_CANDIDATE_FAILURE = 'DELETE_CANDIDATE_FAILURE';

export const SELECT_CANDIDATE = 'SELECT_CANDIDATE';
export const UNSELECT_CANDIDATE = 'UNSELECT_CANDIDATE';
export const EDIT_CANDIDATE = 'EDIT_CANDIDATE';
export const CANCEL_EDIT_CANDIDATE = 'CANCEL_EDIT_CANDIDATE';

export const GET_SESSIONS = 'GET_SESSIONS';
export const GET_SESSIONS_SUCCESS = 'GET_SESSIONS_SUCCESS';
export const GET_SESSIONS_FAILURE = 'GET_SESSIONS_FAILURE';
export const SAVE_SESSION = 'SAVE_SESSION';
export const SAVE_SESSION_SUCCESS = 'SAVE_SESSION_SUCCESS';
export const SAVE_SESSION_FAILURE = 'SAVE_SESSION_FAILURE';
export const DELETE_SESSION = 'DELETE_SESSION';
export const DELETE_SESSION_SUCCESS = 'DELETE_SESSION_SUCCESS';
export const DELETE_SESSION_FAILURE = 'DELETE_SESSION_FAILURE';
export const START_SESSION = 'START_SESSION';
export const START_SESSION_SUCCESS = 'START_SESSION_SUCCESS';
export const START_SESSION_FAILURE = 'START_SESSION_FAILURE';
export const STOP_SESSION = 'STOP_SESSION';
export const STOP_SESSION_SUCCESS = 'STOP_SESSION_SUCCESS';
export const STOP_SESSION_FAILURE = 'STOP_SESSION_FAILURE';
export const GET_ACTIVE_VOTES = 'GET_ACTIVE_VOTES';
export const GET_ACTIVE_VOTES_SUCCESS = 'GET_ACTIVE_VOTES_SUCCESS';
export const GET_ACTIVE_VOTES_FAILURE = 'GET_ACTIVE_VOTES_FAILURE';
export const GET_CANDIDATE_VOTES = 'GET_CANDIDATE_VOTES';
export const GET_CANDIDATE_VOTES_SUCCESS = 'GET_CANDIDATE_VOTES_SUCCESS';
export const GET_CANDIDATE_VOTES_FAILURE = 'GET_CANDIDATE_VOTES_FAILURE';

export const SELECT_SESSION = 'SELECT_SESSION';
export const UNSELECT_SESSION = 'UNSELECT_SESSION';
export const EDIT_SESSION = 'EDIT_SESSION';
export const CANCEL_EDIT_SESSION = 'CANCEL_EDIT_SESSION';

export interface TVotingState {
  globalErrorMessage: string;
  globalErrorCode: number;
  globalErrorDate: Date;

  isGettingCandidates: boolean;
  getCandidatesError: boolean;
  getCandidatesErrorMessage: string;

  isSavingCandidate: boolean;
  saveCandidateError: boolean;
  saveCandidateErrorMessage: string;

  isDeletingCandidate: boolean;
  deleteCandidateError: boolean;
  deleteCandidateErrorMessage: string;

  selectedCandidateEmail: string;
  editingCandidateEmail: string;

  isGettingSessions: boolean;
  getSessionsError: boolean;
  getSessionsErrorMessage: string;

  isSavingSession: boolean;
  saveSessionError: boolean;
  saveSessionErrorMessage: string;

  isDeletingSession: boolean;
  deleteSessionError: boolean;
  deleteSessionErrorMessage: string;

  isStartingSession: boolean;
  startSessionError: boolean;
  startSessionErrorMessage: string;

  isStoppingSession: boolean;
  stopSessionError: boolean;
  stopSessionErrorMessage: string;

  isGettingActiveVotes: boolean;
  getActiveVotesError: boolean;
  getActiveVotesErrorMessage: string;

  isGettingCandidateVotes: boolean;
  getCandidateVotesError: boolean;
  getCandidateVotesErrorMessage: string;

  selectedSessionId: string;
  editingSessionId: string;
  currentCandidateId: string;

  loadHistory: TLoadHistory;
  candidateArray: TCandidate[];
  approvedCandidateArray: TCandidate[];
  unapprovedCandidateArray: TCandidate[];
  emailToCandidate: TCandidateDict;
  sessionArray: TSession[];
  sessionToCandidateToVotes: TSessionToCandidateToVoteDict;
}

const initialState: TVotingState = {
  globalErrorMessage: '',
  globalErrorCode: 0,
  globalErrorDate: null,

  isGettingCandidates: false,
  getCandidatesError: false,
  getCandidatesErrorMessage: '',

  isSavingCandidate: false,
  saveCandidateError: false,
  saveCandidateErrorMessage: '',

  isDeletingCandidate: false,
  deleteCandidateError: false,
  deleteCandidateErrorMessage: '',

  selectedCandidateEmail: '',
  editingCandidateEmail: '',

  isGettingSessions: false,
  getSessionsError: false,
  getSessionsErrorMessage: '',

  isSavingSession: false,
  saveSessionError: false,
  saveSessionErrorMessage: '',

  isDeletingSession: false,
  deleteSessionError: false,
  deleteSessionErrorMessage: '',

  isStartingSession: false,
  startSessionError: false,
  startSessionErrorMessage: '',

  isStoppingSession: false,
  stopSessionError: false,
  stopSessionErrorMessage: '',

  isGettingActiveVotes: false,
  getActiveVotesError: false,
  getActiveVotesErrorMessage: '',

  isGettingCandidateVotes: false,
  getCandidateVotesError: false,
  getCandidateVotesErrorMessage: '',

  selectedSessionId: '',
  editingSessionId: '',
  currentCandidateId: '',

  loadHistory: {},
  candidateArray: [],
  approvedCandidateArray: [],
  unapprovedCandidateArray: [],
  emailToCandidate: {},
  sessionArray: [],
  sessionToCandidateToVotes: {}
};

export default (state = initialState, action: any): TVotingState => {
  switch (action.type) {
    case SET_GLOBAL_ERROR_MESSAGE:
      return {
        ...state,
        ...setGlobalError(action.message, action.code)
      };
    case CLEAR_GLOBAL_ERROR_MESSAGE:
      return {
        ...state,
        globalErrorMessage: '',
        globalErrorCode: 0,
        globalErrorDate: null
      };
    case GET_CANDIDATES:
      return {
        ...state,
        isGettingCandidates: true,
        getCandidatesError: false,
        getCandidatesErrorMessage: ''
      };
    case GET_CANDIDATES_SUCCESS:
      return {
        ...state,
        isGettingCandidates: false,
        loadHistory: {
          ...state.loadHistory,
          candidates: moment()
        },
        ...recomputeVotingState({
          emailToCandidate: separateByCandidateEmail(action.candidates),
          sessionToCandidateToVotes: state.sessionToCandidateToVotes
        })
      };
    case GET_CANDIDATES_FAILURE:
      return {
        ...state,
        isGettingCandidates: false,
        getCandidatesError: true,
        getCandidatesErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case SAVE_CANDIDATE:
      return {
        ...state,
        isSavingCandidate: true,
        saveCandidateError: false,
        saveCandidateErrorMessage: ''
      };
    case SAVE_CANDIDATE_SUCCESS:
      return {
        ...state,
        isSavingCandidate: false,
        editingCandidateEmail: '',
        ...recomputeVotingState({
          emailToCandidate: mergeCandidates(state.emailToCandidate, [action.candidate]),
          sessionToCandidateToVotes: state.sessionToCandidateToVotes
        })
      };
    case SAVE_CANDIDATE_FAILURE:
      return {
        ...state,
        isSavingCandidate: false,
        saveCandidateError: true,
        saveCandidateErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case DELETE_CANDIDATE:
      return {
        ...state,
        isDeletingCandidate: true,
        deleteCandidateError: false,
        deleteCandidateErrorMessage: ''
      };
    case DELETE_CANDIDATE_SUCCESS: {
      const remainingCandidates = state.emailToCandidate;
      delete remainingCandidates[action.candidate.email];

      return {
        ...state,
        isDeletingCandidate: false,
        selectedCandidateEmail: '',
        ...recomputeVotingState({
          emailToCandidate: remainingCandidates,
          sessionToCandidateToVotes: state.sessionToCandidateToVotes
        })
      };
    }
    case SELECT_CANDIDATE:
      return {
        ...state,
        selectedCandidateEmail: action.email
      };
    case UNSELECT_CANDIDATE:
      return {
        ...state,
        selectedCandidateEmail: ''
      };
    case EDIT_CANDIDATE:
      return {
        ...state,
        editingCandidateEmail: action.email
      };
    case CANCEL_EDIT_CANDIDATE:
      return {
        ...state,
        editingCandidateEmail: ''
      };
    case GET_SESSIONS:
      return {
        ...state,
        isGettingSessions: true,
        getSessionsError: false,
        getSessionsErrorMessage: ''
      };
    case GET_SESSIONS_SUCCESS:
      return {
        ...state,
        isGettingSessions: false,
        loadHistory: {
          ...state.loadHistory,
          sessions: moment()
        },
        sessionArray: action.sessions.sort(sortSessionByDate)
      };
    case GET_SESSIONS_FAILURE:
      return {
        ...state,
        isGettingSessions: false,
        getSessionsError: true,
        getSessionsErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case SAVE_SESSION:
      return {
        ...state,
        isSavingSession: true,
        saveSessionError: false,
        saveSessionErrorMessage: ''
      };
    case SAVE_SESSION_SUCCESS:
      return {
        ...state,
        isSavingSession: false,
        editingSessionId: '',
        sessionArray: mergeSessions(state.sessionArray, [action.session])
      };
    case SAVE_SESSION_FAILURE:
      return {
        ...state,
        isSavingSession: false,
        saveSessionError: true,
        saveSessionErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case DELETE_SESSION:
      return {
        ...state,
        isDeletingSession: true,
        deleteSessionError: false,
        deleteSessionErrorMessage: ''
      };
    case DELETE_SESSION_SUCCESS:
      return {
        ...state,
        isDeletingSession: false,
        editingSessionId: '',
        selectedSessionId: '',
        sessionArray: state.sessionArray.slice().filter((session) => session._id !== action.session._id)
      };
    case DELETE_SESSION_FAILURE:
      return {
        ...state,
        isDeletingSession: false,
        deleteSessionError: true,
        deleteSessionErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case START_SESSION:
      return {
        ...state,
        isStartingSession: true,
        startSessionError: false,
        startSessionErrorMessage: ''
      };
    case START_SESSION_SUCCESS:
      return {
        ...state,
        isStartingSession: false,
        sessionArray: mergeSessions(state.sessionArray, [action.session])
      };
    case START_SESSION_FAILURE:
      return {
        ...state,
        isStartingSession: false,
        startSessionError: true,
        startSessionErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case STOP_SESSION:
      return {
        ...state,
        isStoppingSession: true,
        stopSessionError: false,
        stopSessionErrorMessage: ''
      };
    case STOP_SESSION_SUCCESS:
      return {
        ...state,
        isStoppingSession: false,
        sessionArray: mergeSessions(state.sessionArray, [action.session])
      };
    case STOP_SESSION_FAILURE:
      return {
        ...state,
        isStoppingSession: false,
        stopSessionError: true,
        stopSessionErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case GET_ACTIVE_VOTES:
      return {
        ...state,
        isGettingActiveVotes: true,
        getActiveVotesError: false,
        getActiveVotesErrorMessage: ''
      };
    case GET_ACTIVE_VOTES_SUCCESS:
      if (action.session !== null && action.candidate !== null) {
        return {
          ...state,
          isGettingActiveVotes: false,
          loadHistory: {
            ...state.loadHistory,
            [`votes-${action.session._id}-${action.candidate._id}`]: moment()
          },
          sessionArray: mergeSessions(state.sessionArray, [action.session]),
          ...recomputeVotingState({
            emailToCandidate: mergeCandidates(state.emailToCandidate, [action.candidate]),
            sessionToCandidateToVotes: mergeVotes(state.sessionToCandidateToVotes, action.votes)
          })
        };
      } else {
        return {
          ...state
        };
      }
    case GET_ACTIVE_VOTES_FAILURE:
      return {
        ...state,
        isGettingActiveVotes: false,
        getActiveVotesError: true,
        getActiveVotesErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case GET_CANDIDATE_VOTES:
      return {
        ...state,
        isGettingCandidateVotes: true,
        getCandidateVotesError: false,
        getCandidateVotesErrorMessage: ''
      };
    case GET_CANDIDATE_VOTES_SUCCESS:
      return {
        ...state,
        isGettingCandidateVotes: false,
        loadHistory: {
          ...state.loadHistory,
          [`votes-${action.session._id}-${action.candidate._id}`]: moment()
        },
        ...recomputeVotingState({
          emailToCandidate: state.emailToCandidate,
          sessionToCandidateToVotes: mergeVotes(state.sessionToCandidateToVotes, action.votes)
        })
      };
    case GET_CANDIDATE_VOTES_FAILURE:
      return {
        ...state,
        isGettingCandidateVotes: false,
        getCandidateVotesError: true,
        getCandidateVotesErrorMessage: action.error.message,
        ...setGlobalError(action.error.message, action.error.code)
      };
    case SELECT_SESSION:
      return {
        ...state,
        selectedSessionId: action.session._id,
        currentCandidateId: action.session.currentCandidateId
      };
    case UNSELECT_SESSION:
      return {
        ...state,
        selectedSessionId: '',
        currentCandidateId: ''
      };
    case EDIT_SESSION:
      return {
        ...state,
        editingSessionId: action._id
      };
    case CANCEL_EDIT_SESSION:
      return {
        ...state,
        editingSessionId: ''
      };
    default:
      return state;
  }
};
