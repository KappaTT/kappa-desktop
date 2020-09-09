import React from 'react';
import { TouchableOpacity, Clipboard, Linking } from 'react-native';
import { useDispatch } from 'react-redux';

import { TToast } from '@reducers/ui';
import { _ui } from '@reducers/actions';
import { theme } from '@constants';

const LinkContainer: React.FC<{ link?: string; disabled?: boolean; children: React.ReactNode }> = ({
  link,
  disabled = false,
  children
}) => {
  const dispatch = useDispatch();
  const dispatchShowToast = React.useCallback((toast: Partial<TToast>) => dispatch(_ui.showToast(toast)), [dispatch]);

  const onPressLink = React.useCallback(() => {
    if (link) {
      Clipboard.setString(link);

      dispatchShowToast({
        title: 'Copied',
        message: 'The link was saved to your clipboard',
        allowClose: true,
        timer: 1500,
        toastColor: theme.COLORS.PRIMARY_GREEN,
        textColor: theme.COLORS.WHITE,
        showBackdrop: false
      });
    }
  }, [dispatchShowToast, link]);

  const onLongPressLink = React.useCallback(async () => {
    if (link) {
      const canOpen = await Linking.canOpenURL(link);

      if (canOpen) {
        window.open(link, '_blank');
      }
    }
  }, [link]);

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPressLink} onLongPress={onLongPressLink}>
      {children}
    </TouchableOpacity>
  );
};

export default LinkContainer;
