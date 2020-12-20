import { jsonRequest, jsonAuthorizedRequest } from '@services/Networking';
import { isEmpty } from '@services/utils';
import * as secrets from 'secrets';

export const M_GET = 'GET';
export const M_POST = 'POST';
export const M_PUT = 'PUT';
export const M_PATCH = 'PATCH';
export const M_DELETE = 'DELETE';
export type TMethod = typeof M_GET | typeof M_POST | typeof M_PUT | typeof M_PATCH | typeof M_DELETE;

export const BASE_URL_PRODUCTION = secrets.API_URL;
export const BASE_URL_DEVELOPMENT = 'http://127.0.0.1:3000/dev/';

export const BASE_URL = process.env.NODE_ENV !== 'development' ? BASE_URL_PRODUCTION : BASE_URL_DEVELOPMENT;

/**
 * Endpoints available for the Kappa API.
 */
export const ENDPOINTS: {
  [key: string]: (config?: any) => string;
} = {
  SIGN_IN: () => 'users/login',
  GENERATE_SECRET_CODE: () => 'users/generate-secret-code',
  CREATE_USER: () => 'users',
  UPDATE_USER: (config: { email: string }) => `users/${encodeURIComponent(config.email)}`,
  DELETE_USER: (config: { email: string }) => `users/${encodeURIComponent(config.email)}`,
  GET_EVENTS: () => 'events',
  GET_USERS: () => 'users',
  GET_ATTENDANCE_BY_USER: (config: { email: string }) => `attendance/user/${encodeURIComponent(config.email)}`,
  GET_ATTENDANCE_BY_EVENT: (config: { eventId: string }) => `attendance/event/${encodeURIComponent(config.eventId)}`,
  CREATE_EVENT: () => 'events',
  UPDATE_EVENT: (config: { eventId: string }) => `events/${encodeURIComponent(config.eventId)}`,
  DELETE_EVENT: (config: { eventId: string }) => `events/${encodeURIComponent(config.eventId)}`,
  CREATE_ATTENDANCE: () => 'attendance',
  CREATE_BULK_ATTENDANCE: () => 'bulk-attendance',
  GET_EXCUSES: () => 'excuse',
  CREATE_EXCUSE: () => 'excuse',
  UPDATE_EXCUSE: () => 'excuse',
  GET_POINTS_BY_USER: (config: { email: string }) => `points/${encodeURIComponent(config.email)}`,
  GET_EVENT_SEARCH_RESULTS: () => 'search/events',
  GET_CANDIDATES: () => 'candidates',
  CREATE_CANDIDATE: () => 'candidates',
  UPDATE_CANDIDATE: (config: { email: string }) => `candidates/${encodeURIComponent(config.email)}`,
  DELETE_CANDIDATE: (config: { email: string }) => `candidates/${encodeURIComponent(config.email)}`,
  GET_SESSIONS: () => 'sessions',
  CREATE_SESSION: () => 'sessions',
  UPDATE_SESSION: (config: { _id: string }) => `sessions/${encodeURIComponent(config._id)}`,
  DELETE_SESSION: (config: { _id: string }) => `sessions/${encodeURIComponent(config._id)}`,
  START_SESSION: (config: { _id: string }) => `start-session/${encodeURIComponent(config._id)}`,
  STOP_SESSION: (config: { _id: string }) => `stop-session/${encodeURIComponent(config._id)}`,
  GET_ACTIVE_VOTES: () => 'active-candidate/votes',
  GET_CANDIDATE_VOTES: () => 'votes',
  CREATE_NEXT_SESSION: () => 'session/next',
  SUBMIT_VOTE: () => 'vote',
  SUBMIT_MULTI_VOTE: () => 'multi-vote'
};

/**
 * Methods for the Kappa API.
 */
export const METHODS: {
  [key: string]: TMethod;
} = {
  SIGN_IN: M_POST,
  GENERATE_SECRET_CODE: M_POST,
  CREATE_USER: M_POST,
  UPDATE_USER: M_PATCH,
  DELETE_USER: M_DELETE,
  GET_EVENTS: M_GET,
  GET_USERS: M_GET,
  GET_ATTENDANCE_BY_USER: M_GET,
  GET_ATTENDANCE_BY_EVENT: M_GET,
  CREATE_EVENT: M_POST,
  UPDATE_EVENT: M_PATCH,
  DELETE_EVENT: M_DELETE,
  CREATE_ATTENDANCE: M_POST,
  CREATE_BULK_ATTENDANCE: M_POST,
  GET_EXCUSES: M_GET,
  CREATE_EXCUSE: M_POST,
  UPDATE_EXCUSE: M_PATCH,
  GET_POINTS_BY_USER: M_GET,
  GET_EVENT_SEARCH_RESULTS: M_POST,
  GET_CANDIDATES: M_GET,
  CREATE_CANDIDATE: M_POST,
  UPDATE_CANDIDATE: M_PATCH,
  DELETE_CANDIDATE: M_DELETE,
  GET_SESSIONS: M_GET,
  CREATE_SESSION: M_POST,
  UPDATE_SESSION: M_PATCH,
  DELETE_SESSION: M_DELETE,
  START_SESSION: M_PATCH,
  STOP_SESSION: M_PATCH,
  GET_ACTIVE_VOTES: M_GET,
  GET_CANDIDATE_VOTES: M_POST,
  CREATE_NEXT_SESSION: M_POST,
  SUBMIT_VOTE: M_POST,
  SUBMIT_MULTI_VOTE: M_POST
};

export interface TResponse {
  success: boolean;
  error?: {
    code?: number;
    message?: string;
    blame?: TFlatBlame;
  };
}

export interface TRequestResponse {
  success: boolean;
  code?: number;
  error?: {
    message?: string;
    details?: string;
  };
}

export interface TFlatBlame {
  [key: string]: string;
}

export interface TBlame {
  [key: string]: TFlatBlame;
}

/**
 * Make a request to a given endpoint with a method and optional configurations.
 */
export const makeRequest = async <T>(
  endpoint: string,
  method: TMethod,
  params: {
    queryParams?: any;
    headers?: any;
    body?: any;
  }
) => {
  return jsonRequest<T>(BASE_URL, undefined, endpoint, true, method, params.headers, params.queryParams, params.body);
};

/**
 * Make a regular request but with the given authorization token.
 */
export const makeAuthorizedRequest = async <T>(
  endpoint: string,
  method: TMethod,
  params: {
    queryParams?: any;
    headers?: any;
    body?: any;
  },
  token: string
) => {
  return jsonAuthorizedRequest<T>(
    BASE_URL,
    undefined,
    endpoint,
    true,
    token,
    method,
    params.headers,
    params.queryParams,
    params.body
  );
};

/**
 * Elevate all blamed fields.
 */
export const flattenBlame = (blameObj: TBlame): TFlatBlame => {
  const blame = {};

  for (const [key, value] of Object.entries(blameObj)) {
    for (const [key2, value2] of Object.entries(value)) {
      blame[key2] = value2;
    }
  }

  return blame;
};

/**
 * Return a failure object with blamed fields and optional message and code.
 */
export const fail = (blame: TBlame, message?: string, code?: number) => {
  if (isEmpty(blame)) {
    return {
      success: false,
      error: {
        blame: {},
        message,
        code
      }
    };
  }

  return {
    success: false,
    error: {
      blame: flattenBlame(blame),
      message,
      code
    }
  };
};

/**
 * Return a success object with optional data.
 */
export const pass = <T>(data?: T) => {
  return {
    success: true,
    data
  };
};
