import { Voting } from '@backend';
import { TUser } from '@backend/auth';
import { TCandidate } from '@backend/voting';
import {
  GET_CANDIDATES,
  GET_CANDIDATES_SUCCESS,
  GET_CANDIDATES_FAILURE,
  SAVE_CANDIDATE,
  SAVE_CANDIDATE_SUCCESS,
  SAVE_CANDIDATE_FAILURE,
  DELETE_CANDIDATE,
  DELETE_CANDIDATE_SUCCESS,
  DELETE_CANDIDATE_FAILURE
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
