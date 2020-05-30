import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth } from '@reducers/actions';
import { incompleteUser } from '@backend/auth';
import { Images, theme } from '@constants';
import AppNavigator from '@navigation/AppNavigator';
import { setTopLevelNavigator, navigate } from '@navigation/NavigationService';
import { SIDEBAR_WIDTH } from '@services/utils';
import { Sidebar, ModalController, ToastController } from '@components';
import './styles/global.css';

const assetImages = [Images.Kappa];

const cacheImages = (images: any) => {
  return images.map((image: any) => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
};

const _loadResourcesAsync = async () => {
  await Promise.all([
    ...cacheImages(assetImages),
    Font.loadAsync({
      OpenSans: require('../assets/font/OpenSans-Regular.ttf'),
      'OpenSans-Bold': require('../assets/font/OpenSans-Bold.ttf'),
      'OpenSans-SemiBold': require('../assets/font/OpenSans-SemiBold.ttf'),
      'OpenSans-Light': require('../assets/font/OpenSans-Light.ttf'),
      'PlayfairDisplay-Bold': require('../assets/font/PlayfairDisplay-Bold.ttf')
    })
  ]);
};

const App = () => {
  const loadedUser = useSelector((state: TRedux) => state.auth.loadedUser);
  const authorized = useSelector((state: TRedux) => state.auth.authorized);
  const user = useSelector((state: TRedux) => state.auth.user);

  const [isLoadingComplete, setIsLoadingComplete] = React.useState<boolean>(false);
  const [isNavigatorReady, setIsNavigatorReady] = React.useState<boolean>(false);

  const dispatch = useDispatch();
  const dispatchLoadUser = React.useCallback(() => dispatch(_auth.loadUser()), [dispatch]);

  const _handleLoadingError = React.useCallback((error: any) => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  }, []);

  const _handleFinishLoading = React.useCallback(() => {
    setIsLoadingComplete(true);
  }, []);

  React.useEffect(() => {
    if (!loadedUser) {
      dispatchLoadUser();
    }
  }, [dispatchLoadUser, loadedUser]);

  React.useEffect(() => {
    if (loadedUser && !authorized) {
      navigate('LoginStack');
    }
  }, [loadedUser, authorized]);

  if (!isLoadingComplete) {
    return (
      <AppLoading startAsync={_loadResourcesAsync} onError={_handleLoadingError} onFinish={_handleFinishLoading} />
    );
  } else {
    return (
      <View style={styles.container}>
        {authorized && (
          <View style={styles.sidebarContainer}>
            <Sidebar />
          </View>
        )}

        <View style={styles.appContainer}>
          <AppNavigator
            ref={(navigatorRef) => {
              setTopLevelNavigator(navigatorRef);
              setIsNavigatorReady(true);
            }}
          />
        </View>

        <ToastController />
        <ModalController />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  sidebarContainer: {
    width: SIDEBAR_WIDTH
  },
  appContainer: {
    flex: 1
  }
});

export default App;
