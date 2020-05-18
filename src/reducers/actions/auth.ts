import { Auth } from '@backend';

import {
  SHOW_ONBOARDING,
  HIDE_ONBOARDING,
  SHOW_MODAL,
  HIDE_MODAL,
  LOADED_USER,
  SET_USER,
  SIGN_IN,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_OUT,
  SHOW_SIGN_IN,
  SIGN_IN_WITH_GOOGLE,
  SIGN_IN_WITH_GOOGLE_SUCCESS,
  SIGN_IN_WITH_GOOGLE_FAILURE,
  UPDATE_USER,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  MODIFY_USER
} from '@reducers/auth';
import { TUser, initialUser, TUserResponse, TGoogleUser, purge } from '@backend/auth';
import { getBatch, setBatch, deleteBatch } from '@services/secureStorage';
import * as GoogleService from '@services/googleService';
import { log } from '@services/logService';
import { DEMO_USER } from '@services/demoService';

export const showOnboarding = (editing: boolean = false) => {
  return {
    type: SHOW_ONBOARDING,
    editing
  };
};

export const hideOnboarding = () => {
  return {
    type: HIDE_ONBOARDING
  };
};

export const showModal = () => {
  return {
    type: SHOW_MODAL
  };
};

export const hideModal = () => {
  return {
    type: HIDE_MODAL
  };
};

export const showSignIn = () => {
  return {
    type: SHOW_SIGN_IN
  };
};

export const loadedUser = () => {
  return {
    type: LOADED_USER
  };
};

export const setUser = (user: TUser, authorized: boolean = true) => {
  return {
    type: SET_USER,
    user,
    authorized
  };
};

export const modifyUser = (changes: Partial<TUser>) => {
  return {
    type: MODIFY_USER,
    changes
  };
};

export const loadUser = () => {
  return (dispatch) => {
    getBatch('user', initialUser, true).then((user: TUser | undefined) => {
      if (user?.email) {
        dispatch(setUser(user));
      }

      dispatch(loadedUser());
    });
  };
};

const signingIn = () => {
  return {
    type: SIGN_IN
  };
};

export const signOut = () => {
  purge();

  return {
    type: SIGN_OUT
  };
};

const signInSuccess = () => {
  return {
    type: SIGN_IN_SUCCESS
  };
};

const signInFailure = (err) => {
  return {
    type: SIGN_IN_FAILURE,
    error: err
  };
};

export const authenticate = (email: string, idToken: string, googleUser: TGoogleUser) => {
  return (dispatch) => {
    dispatch(signingIn());

    Auth.signIn({ email, idToken }).then((res) => {
      if (res.success) {
        const user = res.data.user;

        dispatch(setUser(user));
        dispatch(signInSuccess());

        setBatch('user', user);
      } else {
        dispatch(signInFailure(res.error));
      }
    });
  };
};

const signingInWithGoogle = () => {
  return {
    type: SIGN_IN_WITH_GOOGLE
  };
};

const signInWithGoogleSuccess = () => {
  return {
    type: SIGN_IN_WITH_GOOGLE_SUCCESS
  };
};

const signInWithGoogleFailure = (err) => {
  return {
    type: SIGN_IN_WITH_GOOGLE_FAILURE,
    error: err
  };
};

export const signInWithGoogle = () => {
  return (dispatch) => {
    dispatch(signingInWithGoogle());

    GoogleService.login().then((res) => {
      if (res.success) {
        if (res.data.email.endsWith('@illinois.edu')) {
          dispatch(signInWithGoogleSuccess());
          dispatch(authenticate(res.data.email, res.data.idToken, res.data));
        } else if (res.data.email === 'thetataudemo@gmail.com') {
          dispatch(signInWithGoogleSuccess());
          dispatch(setUser(DEMO_USER));
          dispatch(signInSuccess());
        } else {
          dispatch(
            signInWithGoogleFailure({
              message: 'must use a valid illinois.edu email'
            })
          );
        }
      } else {
        dispatch(
          signInWithGoogleFailure({
            message: 'Canceled'
          })
        );
      }
    });
  };
};

const updatingUser = () => {
  return {
    type: UPDATE_USER
  };
};

const updateUserSuccess = () => {
  return {
    type: UPDATE_USER_SUCCESS
  };
};

const updateUserFailure = (err) => {
  return {
    type: UPDATE_USER_FAILURE,
    error: err
  };
};

export const updateUser = (user: TUser, changes: Partial<TUser>) => {
  return (dispatch) => {
    dispatch(updatingUser());

    Auth.updateUser({ user, changes }).then((res) => {
      if (res.success) {
        dispatch(modifyUser(res.data.changes));
        dispatch(updateUserSuccess());

        setBatch('user', res.data.changes);
      } else {
        dispatch(updateUserFailure(res.error));
      }
    });
  };
};
