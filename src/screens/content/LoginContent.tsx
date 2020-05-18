import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useIsFocused } from 'react-navigation-hooks';

import { ParamType } from '@navigation/NavigationTypes';
import { theme, Images } from '@constants';
import { GoogleSignInButton } from '@components';

const LoginContent: React.FC<{
  navigation: ParamType;
}> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Kappa</Text>
        <Image style={styles.logo} source={Images.Kappa} resizeMode="contain" />
        <Text style={styles.subtitle}>Theta Tau</Text>
        <View style={styles.bottomArea}>
          <GoogleSignInButton onSuccess={() => {}} />
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
