import {
  ENDPOINTS,
  METHODS,
  TResponse,
  makeRequest,
  makeAuthorizedRequest,
  pass,
  fail,
  TBlame
} from '@backend/backend';
import { getBatch, deleteBatch } from '@services/asyncStorage';
import { log } from '@services/logService';

export interface TGoogleUser {
  email: string;
  familyName: string;
  givenName: string;
  id: string;
  photoUrl: string;
}

export const initialGoogleUser: TGoogleUser = {
  email: '',
  familyName: '',
  givenName: '',
  id: '',
  photoUrl: ''
};

export interface TUser {
  // INITIAL CREATION
  _id: string;
  sessionToken?: string;
  email: string;
  familyName: string;
  givenName: string;
  firstYear?: string;
  semester?: string;
  type: string;
  role?: string;
  privileged?: boolean;

  // ONBOARDING
  phone?: string;
  gradYear?: string;
}

export const initialUser: TUser = {
  // INITIAL CREATION
  _id: '',
  sessionToken: '',
  email: '',
  familyName: '',
  givenName: '',
  firstYear: '',
  semester: '',
  type: '',
  role: '',
  privileged: false,

  // ONBOARDING
  phone: '',
  gradYear: ''
};

export const incompleteUser: Partial<TUser> = {
  phone: '',
  gradYear: ''
};

export interface TUserResponse {
  sessionToken: string;
  _id: string;
  email: string;
  familyName: string;
  givenName: string;
  firstYear: string;
  semester: string;
  type: string;
  role?: string;
  privileged?: boolean;
  phone?: string;
  gradYear?: string;
}

export const purge = async () => {
  return deleteBatch('user', initialUser);
};

export interface TSignInPayload {
  email: string;
  idToken: string;
}

interface TSignInRequestResponse {
  sessionToken: string;
  user: TUserResponse;
}

interface TSignInResponse extends TResponse {
  data?: {
    user: TUserResponse;
  };
}

export const signIn = async (payload: TSignInPayload): Promise<TSignInResponse> => {
  try {
    const response = await makeRequest<TSignInRequestResponse>(ENDPOINTS.SIGN_IN(), METHODS.SIGN_IN, {
      body: {
        user: {
          email: payload.email
        },
        idToken: payload.idToken
      }
    });

    log('Sign in response', response);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your netid was not recognized', response.code);
      }

      return fail({}, response.error?.message, response.code);
    }

    return pass({
      user: {
        ...response.data.user,
        sessionToken: response.data.sessionToken
      }
    });
  } catch (error) {
    log(error);
    return fail({}, "that wasn't supposed to happen", -1);
  }
};
