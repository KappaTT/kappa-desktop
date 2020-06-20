import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { TEvent } from '@backend/kappa';
import { getEventById } from '@services/kappaService';
import { CheckInPage, EditEventPage } from '@pages';
import Ghost from '@components/Ghost';
import PopupModal from '@components/PopupModal';

const ModalController: React.FC = () => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const editingEventId = useSelector((state: TRedux) => state.kappa.editingEventId);
  const checkInEventId = useSelector((state: TRedux) => state.kappa.checkInEventId);
  const checkInExcuse = useSelector((state: TRedux) => state.kappa.checkInExcuse);

  const dispatch = useDispatch();
  const dispatchCancelEditEvent = React.useCallback(() => dispatch(_kappa.cancelEditEvent()), [dispatch]);
  const dispatchSaveEditEvent = React.useCallback(
    (event: Partial<TEvent>, eventId?: string) => dispatch(_kappa.saveEditEvent(user, event, eventId)),
    [dispatch, user]
  );
  const dispatchCancelCheckInEvent = React.useCallback(() => dispatch(_kappa.setCheckInEvent('', false)), [dispatch]);

  return (
    <Ghost style={styles.container}>
      <PopupModal visible={checkInEventId !== '' && checkInExcuse === false} onDoneClosing={dispatchCancelCheckInEvent}>
        <CheckInPage
          initialEvent={checkInEventId === 'NONE' ? null : getEventById(events, checkInEventId)}
          onPressCancel={dispatchCancelCheckInEvent}
        />
      </PopupModal>

      <PopupModal visible={editingEventId !== ''} onDoneClosing={dispatchCancelEditEvent}>
        <EditEventPage
          initialEvent={editingEventId === 'NEW' ? null : getEventById(events, editingEventId)}
          onPressCancel={dispatchCancelEditEvent}
          onPressSave={dispatchSaveEditEvent}
        />
      </PopupModal>
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
