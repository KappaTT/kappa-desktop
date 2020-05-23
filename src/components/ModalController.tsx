import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import Ghost from '@components/Ghost';
import PopupModal from '@components/PopupModal';

const ModalController: React.FC = () => {
  const editingEventId = useSelector((state: TRedux) => state.kappa.editingEventId);

  const dispatch = useDispatch();
  const dispatchCancelEditEvent = React.useCallback(() => dispatch(_kappa.cancelEditEvent()), [dispatch]);

  return (
    <Ghost style={styles.container}>
      <PopupModal visible={editingEventId !== ''} onDoneClosing={dispatchCancelEditEvent}></PopupModal>
    </Ghost>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});

export default ModalController;
