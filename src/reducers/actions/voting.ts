import { TUser } from '@backend/auth';
import { GET_CANDIDATES, GET_CANDIDATES_SUCCESS, GET_CANDIDATES_FAILURE } from '@reducers/voting';

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
  };
};
