import { Auth } from '@backend';

import {
  SHOW_MODAL,
  HIDE_MODAL,
  LOADED_USER,
  SET_USER,
  SIGN_IN,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_OUT,
  SHOW_SIGN_IN,
  MODIFY_USER
} from '@reducers/auth';
import { TUser, initialUser, purge } from '@backend/auth';
import { getBatch, setBatch } from '@services/asyncStorage';
import { log } from '@services/logService';

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

export const modifyUser = (user: TUser) => {
  return {
    type: MODIFY_USER,
    user
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

export const authenticate = (email: string, idToken: string) => {
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

export const authenticateWithSecretCode = (secretCode: string) => {
  return (dispatch) => {
    dispatch(signingIn());

    Auth.signIn({ secretCode }).then((res) => {
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

export const signInWithGoogle = (data: { email: string; idToken: string }) => {
  return (dispatch) => {
    dispatch(authenticate(data.email, data.idToken));
  };
};
