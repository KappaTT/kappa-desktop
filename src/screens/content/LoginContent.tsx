import React from 'react';
import { StyleSheet, View, Text, Image, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, useLinkTo } from '@react-navigation/native';
import { GoogleLoginResponse } from 'react-google-login';

import { TRedux } from '@reducers';
import { _auth, _nav } from '@reducers/actions';
import { theme, Images } from '@constants';
import { GoogleSignInButton } from '@components';

const LoginContent: React.FC<{
  navigation: NavigationProp<any, 'Login'>;
}> = ({ navigation }) => {
  const linkTo = useLinkTo();

  const authorized = useSelector((state: TRedux) => state.auth.authorized);
  const isAuthenticating = useSelector((state: TRedux) => state.auth.isAuthenticating);
  const signInErrorMessage = useSelector((state: TRedux) => state.auth.signInErrorMessage);

  const dispatch = useDispatch();
  const dispatchSignInWithGoogle = React.useCallback(
    (data: { email: string; idToken: string }) => dispatch(_auth.signInWithGoogle(data)),
    [dispatch]
  );
  const dispatchSetSelectedPage = React.useCallback((label: string) => dispatch(_nav.setSelectedPage(label)), [
    dispatch
  ]);

  const onGoogleSuccess = React.useCallback(
    (data: GoogleLoginResponse) => {
      dispatchSignInWithGoogle({
        email: data.profileObj.email,
        idToken: data.tokenId
      });
    },
    [dispatchSignInWithGoogle]
  );

  const onGoogleFailure = React.useCallback((error: any) => {
    console.warn(error);
  }, []);

  React.useEffect(() => {
    if (authorized) {
      linkTo('/events');
    }
  }, [authorized, dispatchSetSelectedPage, linkTo, navigation]);

  React.useEffect(() => {
    if (signInErrorMessage) {
      alert(signInErrorMessage);
    }
  }, [signInErrorMessage]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Kappa</Text>
        <Image style={styles.logo} source={Images.Kappa} resizeMode="contain" />
        <Text style={styles.subtitle}>Theta Tau</Text>

        <View style={styles.bottomArea}>
          {isAuthenticating ? (
            <ActivityIndicator color={theme.COLORS.PRIMARY} />
          ) : (
            <GoogleSignInButton onSuccess={onGoogleSuccess} onFailure={onGoogleFailure} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    textTransform: 'uppercase',
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 48
  },
  subtitle: {
    textTransform: 'uppercase',
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 32
  },
  logo: {
    width: 128,
    height: 128,
    marginVertical: 20
  },
  bottomArea: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'flex-start'
  }
});

export default LoginContent;
