import React from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';

import * as secrets from '@secrets';

export const GOOGLE_CLIENT_ID =
  process.env.NODE_ENV !== 'development' ? secrets.GOOGLE_CLIENT_IDS.prod : secrets.GOOGLE_CLIENT_IDS.dev;

const GoogleSignInButton: React.FC<{
  onSuccess(payload: GoogleLoginResponse): void;
  onFailure(error: any): void;
}> = ({ onSuccess, onFailure }) => {
  return (
    <GoogleLogin
      clientId={GOOGLE_CLIENT_ID}
      buttonText="Sign in with Google"
      cookiePolicy="single_host_origin"
      onSuccess={onSuccess}
      onFailure={onFailure}
    />
  );
};

export default GoogleSignInButton;
