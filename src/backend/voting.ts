import { ENDPOINTS, METHODS, TResponse, makeAuthorizedRequest, pass, fail } from '@backend/backend';
import { TUser } from '@backend/auth';
import { log } from '@services/logService';

export interface TCandidate {
  _id: string;
  email: string;
  phone?: string;
  familyName: string;
  givenName: string;
  classYear?: '' | 'FR' | 'SO' | 'JR' | 'SR';
  major?: string;
  secondTimeRush?: boolean;
  imageUrl?: string;
  approved: boolean;
  events: string[];
}

export interface TCandidateDict {
  [email: string]: TCandidate;
}

export interface TSession {
  _id: string;
  name: string;
  startDate: string;
  operatorEmail: string;
  candidateOrder: string[];
  currentCandidateId: string;
  active: boolean;
}

export interface TVote {
  _id: string;
  sessionId: string;
  candidateId: string;
  userEmail: string;
  verdict: boolean;
  reason: string;
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

    if (!response.success) {
      return fail({}, 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
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

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
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

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
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
  email: string;
}

interface TDeleteCandidateRequestResponse {
  candidate: {
    email: string;
  };
}

interface TDeleteCandidateResponse extends TResponse {
  data?: {
    candidate: {
      email: string;
    };
  };
}

export const deleteCandidate = async (payload: TDeleteCandidatePayload): Promise<TDeleteCandidateResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteCandidateRequestResponse>(
      ENDPOINTS.DELETE_CANDIDATE({ email: payload.email }),
      METHODS.DELETE_CANDIDATE,
      {},
      payload.user.sessionToken
    );

    log('Delete candidate response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      candidate: {
        email: response.data.candidate.email
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TGetSessionsPayload {
  user: TUser;
}

interface TGetSessionsRequestResponse {
  sessions: TSession[];
}

interface TGetSessionsResponse extends TResponse {
  data?: {
    sessions: TSession[];
  };
}

export const getSessions = async (payload: TGetSessionsPayload): Promise<TGetSessionsResponse> => {
  try {
    const response = await makeAuthorizedRequest<TGetSessionsRequestResponse>(
      ENDPOINTS.GET_SESSIONS(),
      METHODS.GET_SESSIONS,
      {},
      payload.user.sessionToken
    );

    log('Get sessions response', response.code);

    if (!response.success) {
      return fail({}, 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      sessions: response.data.sessions
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TCreateSessionPayload {
  user: TUser;
  session: Partial<TSession>;
}

interface TCreateSessionRequestResponse {
  session: TSession;
}

interface TCreateSessionResponse extends TResponse {
  data?: {
    session: TSession;
  };
}

export const createSession = async (payload: TCreateSessionPayload): Promise<TCreateSessionResponse> => {
  try {
    const response = await makeAuthorizedRequest<TCreateSessionRequestResponse>(
      ENDPOINTS.CREATE_SESSION(),
      METHODS.CREATE_SESSION,
      {
        body: {
          session: payload.session
        }
      },
      payload.user.sessionToken
    );

    log('Create session response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      session: response.data.session
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TUpdateSessionPayload {
  user: TUser;
  _id: string;
  changes: Partial<TSession>;
}

interface TUpdateSessionRequestResponse {
  session: TSession;
}

interface TUpdateSessionResponse extends TResponse {
  data?: {
    session: TSession;
  };
}

export const updateSession = async (payload: TUpdateSessionPayload): Promise<TUpdateSessionResponse> => {
  try {
    const response = await makeAuthorizedRequest<TUpdateSessionRequestResponse>(
      ENDPOINTS.UPDATE_SESSION({ _id: payload._id }),
      METHODS.UPDATE_SESSION,
      {
        body: {
          changes: payload.changes
        }
      },
      payload.user.sessionToken
    );

    log('Update session response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      session: response.data.session
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TDeleteSessionPayload {
  user: TUser;
  _id: string;
}

interface TDeleteSessionRequestResponse {
  session: {
    _id: string;
  };
}

interface TDeleteSessionResponse extends TResponse {
  data?: {
    session: {
      _id: string;
    };
  };
}

export const deleteSession = async (payload: TDeleteSessionPayload): Promise<TDeleteSessionResponse> => {
  try {
    const response = await makeAuthorizedRequest<TDeleteSessionRequestResponse>(
      ENDPOINTS.DELETE_SESSION({ _id: payload._id }),
      METHODS.DELETE_SESSION,
      {},
      payload.user.sessionToken
    );

    log('Delete session response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      session: {
        _id: response.data.session._id
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TStartSessionPayload {
  user: TUser;
  _id: string;
}

interface TStartSessionRequestResponse {
  session: TSession;
}

interface TStartSessionResponse extends TResponse {
  data?: {
    session: TSession;
  };
}

export const startSession = async (payload: TStartSessionPayload): Promise<TStartSessionResponse> => {
  try {
    const response = await makeAuthorizedRequest<TStartSessionRequestResponse>(
      ENDPOINTS.START_SESSION({ _id: payload._id }),
      METHODS.START_SESSION,
      {},
      payload.user.sessionToken
    );

    log('Start session response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      session: response.data.session
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};

export interface TStopSessionPayload {
  user: TUser;
  _id: string;
}

interface TStopSessionRequestResponse {
  session: TSession;
}

interface TStopSessionResponse extends TResponse {
  data?: {
    session: TSession;
  };
}

export const stopSession = async (payload: TStopSessionPayload): Promise<TStopSessionResponse> => {
  try {
    const response = await makeAuthorizedRequest<TStopSessionRequestResponse>(
      ENDPOINTS.STOP_SESSION({ _id: payload._id }),
      METHODS.STOP_SESSION,
      {},
      payload.user.sessionToken
    );

    log('Stop session response', response.code);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your credentials were invalid or have expired', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      session: response.data.session
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};
