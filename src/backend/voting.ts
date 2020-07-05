import { ENDPOINTS, METHODS, TResponse, makeAuthorizedRequest, pass, fail } from '@backend/backend';
import { TUser } from '@backend/auth';
import { log } from '@services/logService';

export interface TCandidate {
  _id: string;
  email: string;
  familyName: string;
  givenName: string;
  classYear?: '' | 'FR' | 'SO' | 'JR' | 'SR';
  major?: string;
  imageUrl?: string;
  approved: boolean;
}

export interface TGetCandidatesPayload {
  user: TUser;
}

interface TGetCandidatesRequestResponse {
  candidates: TCandidate[];
}

interface TGetCandidatesResponse extends TResponse {
  data?: {
    candidates: TCandidate[];
  };
}

export const getCandidates = async (payload: TGetCandidatesPayload): Promise<TGetCandidatesResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetCandidatesRequestResponse>(
      ENDPOINTS.GET_CANDIDATES(),
      METHODS.GET_CANDIDATES,
      {},
      payload.user.sessionToken
    );

    log('Get candidates response', response.code);

    if (!response.success || response.code === 500) {
      return fail({}, 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      candidates: response.data.candidates
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TCreateCandidatePayload {
  user: TUser;
  candidate: Partial<TCandidate>;
}

interface TCreateCandidateRequestResponse {
  candidate: TCandidate;
}

interface TCreateCandidateResponse extends TResponse {
  data?: {
    candidate: TCandidate;
  };
}

export const createCandidate = async (payload: TCreateCandidatePayload): Promise<TCreateCandidateResponse> => {
  try {
    const response = await makeAuthorizedRequest<TCreateCandidateRequestResponse>(
      ENDPOINTS.CREATE_CANDIDATE(),
      METHODS.CREATE_CANDIDATE,
      {
        body: {
          candidate: payload.candidate
        }
      },
      payload.user.sessionToken
    );

    log('Create candidate response', response.code);

    if (!response.success || response.code === 500) {
      return fail({}, 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      candidate: response.data.candidate
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TUpdateCandidatePayload {
  user: TUser;
  email: string;
  changes: Partial<TCandidate>;
}

interface TUpdateCandidateRequestResponse {
  candidate: TCandidate;
}

interface TUpdateCandidateResponse extends TResponse {
  data?: {
    candidate: TCandidate;
  };
}

export const updateCandidate = async (payload: TUpdateCandidatePayload): Promise<TUpdateCandidateResponse> => {
  try {
    const response = await makeAuthorizedRequest<TUpdateCandidateRequestResponse>(
      ENDPOINTS.UPDATE_CANDIDATE({ email: payload.email }),
      METHODS.UPDATE_CANDIDATE,
      {
        body: {
          changes: payload.changes
        }
      },
      payload.user.sessionToken
    );

    log('Update candidate response', response.code);

    if (!response.success || response.code === 500) {
      return fail({}, 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      candidate: response.data.candidate
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TDeleteCandidatePayload {
  user: TUser;
  candidate: TCandidate;
}

interface TDeleteCandidateRequestResponse {
  candidate: {
    _id: string;
  };
}

interface TDeleteCandidateResponse extends TResponse {
  data?: {
    candidate: {
      _id: string;
    };
  };
}

export const deleteCandidate = async (payload: TDeleteCandidatePayload): Promise<TDeleteCandidateResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteCandidateRequestResponse>(
      ENDPOINTS.DELETE_CANDIDATE({ email: payload.candidate.email }),
      METHODS.DELETE_CANDIDATE,
      {},
      payload.user.sessionToken
    );

    log('Delete candidate response', response.code);

    if (!response.success || response.code === 500) {
      return fail({}, 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      candidate: {
        _id: response.data.candidate._id
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};
