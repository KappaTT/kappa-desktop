import React from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';

export const GOOGLE_CLIENT_ID =
  process.env.NODE_ENV !== 'development'
    ? '223233671218-l6tkqeif7rb8hj35ek87sci396nmt37r.apps.googleusercontent.com'
    : '223233671218-mujcmkmt5plupe2c5piurpvp1h435pgu.apps.googleusercontent.com';

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
