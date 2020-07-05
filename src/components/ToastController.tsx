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
  const kappaGlobalErrorMessage = useSelector((state: TRedux) => state.kappa.globalErrorMessage);
  const kappaGlobalErrorCode = useSelector((state: TRedux) => state.kappa.globalErrorCode);
  const kappaGlobalErrorDate = useSelector((state: TRedux) => state.kappa.globalErrorDate);
  const votingGlobalErrorMessage = useSelector((state: TRedux) => state.voting.globalErrorMessage);
  const votingGlobalErrorCode = useSelector((state: TRedux) => state.voting.globalErrorCode);
  const votingGlobalErrorDate = useSelector((state: TRedux) => state.voting.globalErrorDate);
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
    if (kappaGlobalErrorMessage !== '') {
      dispatchShowToast({
        title: 'Error',
        message: kappaGlobalErrorMessage,
        allowClose: kappaGlobalErrorCode !== 401,
        timer: kappaGlobalErrorCode !== 401 ? 6000 : -1,
        toastColor: theme.COLORS.PRIMARY,
        textColor: theme.COLORS.WHITE,
        code: kappaGlobalErrorCode,
        showBackdrop: kappaGlobalErrorCode === 401
      });
    }
  }, [kappaGlobalErrorMessage, kappaGlobalErrorCode, kappaGlobalErrorDate, dispatchShowToast]);

  React.useEffect(() => {
    if (votingGlobalErrorMessage !== '') {
      dispatchShowToast({
        title: 'Error',
        message: votingGlobalErrorMessage,
        allowClose: votingGlobalErrorCode !== 401,
        timer: votingGlobalErrorCode !== 401 ? 6000 : -1,
        toastColor: theme.COLORS.PRIMARY,
        textColor: theme.COLORS.WHITE,
        code: votingGlobalErrorCode,
        showBackdrop: votingGlobalErrorCode === 401
      });
    }
  }, [votingGlobalErrorMessage, votingGlobalErrorCode, votingGlobalErrorDate, dispatchShowToast]);

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
