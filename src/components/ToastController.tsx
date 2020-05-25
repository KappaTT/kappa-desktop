import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { TToast } from '@reducers/ui';
import { _auth, _kappa, _ui } from '@reducers/actions';
import { theme } from '@constants';
import { log } from '@services/logService';

import Ghost from '@components/Ghost';
import Toast from '@components/Toast';

const ToastController: React.FC = () => {
  const globalErrorMessage = useSelector((state: TRedux) => state.kappa.globalErrorMessage);
  const globalErrorCode = useSelector((state: TRedux) => state.kappa.globalErrorCode);
  const globalErrorDate = useSelector((state: TRedux) => state.kappa.globalErrorDate);
  const isShowingToast = useSelector((state: TRedux) => state.ui.isShowingToast);
  const isHidingToast = useSelector((state: TRedux) => state.ui.isHidingToast);
  const toast = useSelector((state: TRedux) => state.ui.toast);

  const dispatch = useDispatch();
  const dispatchShowToast = React.useCallback((toast: Partial<TToast>) => dispatch(_ui.showToast(toast)), [dispatch]);
  const dispatchHideToast = React.useCallback(() => dispatch(_ui.hideToast()), [dispatch]);
  const dispatchDoneHidingToast = React.useCallback(() => dispatch(_ui.doneHidingToast()), [dispatch]);
  const dispatchClearError = React.useCallback(() => dispatch(_kappa.clearGlobalError()), [dispatch]);
  const dispatchSignOut = React.useCallback(() => dispatch(_auth.signOut()), [dispatch]);

  const onDoneClosing = React.useCallback(() => {
    dispatchDoneHidingToast();

    if (toast.code > 0) {
      dispatchClearError();
    }
  }, [dispatchClearError, dispatchDoneHidingToast, toast.code]);

  const onPressSignOut = React.useCallback(() => {
    dispatchHideToast();
    dispatchSignOut();
  }, [dispatchHideToast, dispatchSignOut]);

  React.useEffect(() => {
    if (globalErrorMessage !== '') {
      dispatchShowToast({
        title: 'Error',
        message: globalErrorMessage,
        allowClose: globalErrorCode !== 401,
        timer: globalErrorCode !== 401 ? 6000 : -1,
        toastColor: theme.COLORS.PRIMARY,
        textColor: theme.COLORS.WHITE,
        code: globalErrorCode,
        showBackdrop: globalErrorCode === 401
      });
    }
  }, [globalErrorMessage, globalErrorCode, globalErrorDate, dispatchShowToast]);

  return (
    <Ghost style={styles.container}>
      {isShowingToast && (
        <Toast toast={toast} shouldClose={isHidingToast} onDoneClosing={onDoneClosing}>
          {toast.code === 401 && (
            <View style={styles.signInButton}>
              <TouchableOpacity onPress={onPressSignOut}>
                <Text style={styles.signInText}>Return to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </Toast>
      )}
    </Ghost>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  signInButton: {
    marginLeft: 8
  },
  signInText: {
    fontFamily: 'OpenSans-SemiBold',
    textDecorationLine: 'underline',
    color: theme.COLORS.WHITE
  }
});

export default ToastController;
