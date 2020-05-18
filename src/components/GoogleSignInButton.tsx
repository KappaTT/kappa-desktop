import React from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';

const GoogleSignInButton: React.FC<{
  onSuccess(payload: GoogleLoginResponse): void;
  onFailure(error: any): void;
}> = ({ onSuccess, onFailure }) => {
  return (
    <GoogleLogin
      clientId="223233671218-mujcmkmt5plupe2c5piurpvp1h435pgu.apps.googleusercontent.com"
      buttonText="Sign in with Google"
      cookiePolicy="single_host_origin"
      onSuccess={onSuccess}
      onFailure={onFailure}
    />
  );
};

export default GoogleSignInButton;
