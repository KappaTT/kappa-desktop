export const GET_CANDIDATES = 'GET_CANDIDATES';
export const GET_CANDIDATES_SUCCESS = 'GET_CANDIDATES_SUCCESS';
export const GET_CANDIDATES_FAILURE = 'GET_CANDIDATES_FAILURE';

export interface TVotingState {
  isGettingCandidates: boolean;
  getCandidatesError: boolean;
  getCandidatesErrorMessage: string;
}

const initialState: TVotingState = {
  isGettingCandidates: false,
  getCandidatesError: false,
  getCandidatesErrorMessage: ''
};

export default (state = initialState, action: any): TVotingState => {
  switch (action.type) {
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
        isGettingCandidates: false
      };
    case GET_CANDIDATES_FAILURE:
      return {
        ...state,
        isGettingCandidates: false,
        getCandidatesError: true,
        getCandidatesErrorMessage: action.error.message
      };
    default:
      return state;
  }
};
