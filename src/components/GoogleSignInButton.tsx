import React from 'react';
import GoogleLogin from 'react-google-login';

const GoogleSignInButton: React.FC<{
  onSuccess(): void;
}> = ({ onSuccess }) => {
  return (
    <GoogleLogin
      clientId="223233671218-mujcmkmt5plupe2c5piurpvp1h435pgu.apps.googleusercontent.com"
      buttonText="Sign in with Google"
      onSuccess={(res) => console.log('success', res)}
      onFailure={(res) => console.log('failure', res)}
    />
  );
};

export default GoogleSignInButton;
