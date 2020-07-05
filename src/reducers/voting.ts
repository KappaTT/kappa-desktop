import moment from 'moment';

import { setGlobalError } from '@services/kappaService';
import { TLoadHistory } from '@backend/kappa';
import { TCandidate, TCandidateDict } from '@backend/voting';
import { recomputeVotingState, separateByCandidateEmail, mergeCandidates } from '@services/votingService';

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

  loadHistory: TLoadHistory;
  candidateArray: TCandidate[];
  emailToCandidate: TCandidateDict;
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

  loadHistory: {},
  candidateArray: [],
  emailToCandidate: {}
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
          emailToCandidate: separateByCandidateEmail(action.candidates)
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
        ...recomputeVotingState({
          emailToCandidate: mergeCandidates(state.emailToCandidate, [action.candidate])
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
        ...recomputeVotingState({
          emailToCandidate: remainingCandidates
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
    default:
      return state;
  }
};
