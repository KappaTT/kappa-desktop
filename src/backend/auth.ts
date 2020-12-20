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
  secretCode?: string;
  secretCodeExpiration?: string;

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
  secretCode: '',
  secretCodeExpiration: '',

  // ONBOARDING
  phone: '',
  gradYear: ''
};

export const incompleteUser: Partial<TUser> = {
  phone: '',
  gradYear: ''
};

/**
 * Remove the user from storage.
 */
export const purge = async () => {
  return deleteBatch('user', initialUser);
};

export interface TSignInPayload {
  // Google Sign In
  email?: string;
  idToken?: string;

  // Escape Hatch
  secretCode?: string;
}

interface TSignInRequestResponse {
  sessionToken: string;
  user: TUser;
}

interface TSignInResponse extends TResponse {
  data?: {
    user: TUser;
  };
}

/**
 * Sign in API request. Returns user object on success.
 */
export const signIn = async (payload: TSignInPayload): Promise<TSignInResponse> => {
  try {
    const response = await makeRequest<TSignInRequestResponse>(ENDPOINTS.SIGN_IN(), METHODS.SIGN_IN, {
      body: {
        user: {
          email: payload.email
        },
        idToken: payload.idToken,
        secretCode: payload.secretCode
      }
    });

    log('Sign in response', response);

    if (!response.success) {
      return fail({}, response.error?.message || 'issue connecting to the server', 500);
    } else if (response.code !== 200) {
      if (response.code === 401) {
        return fail({}, 'your email was not recognized', response.code);
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
