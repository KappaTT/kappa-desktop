import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _auth, _kappa } from '@reducers/actions';
import { TEvent } from '@backend/kappa';
import { getEventById } from '@services/kappaService';
import { CheckInPage, EditEventPage, EditProfilePage, RequestExcusePage } from '@pages';
import Ghost from '@components/Ghost';
import PopupModal from '@components/PopupModal';
import { incompleteUser } from '@backend/auth';

const ModalController: React.FC = () => {
  const user = useSelector((state: TRedux) => state.auth.user);
  const events = useSelector((state: TRedux) => state.kappa.events);
  const editingEventId = useSelector((state: TRedux) => state.kappa.editingEventId);
  const isSavingEvent = useSelector((state: TRedux) => state.kappa.isSavingEvent);
  const checkInEventId = useSelector((state: TRedux) => state.kappa.checkInEventId);
  const checkInExcuse = useSelector((state: TRedux) => state.kappa.checkInExcuse);
  const isCheckingIn = useSelector((state: TRedux) => state.kappa.isCheckingIn);
  const onboardingVisible = useSelector((state: TRedux) => state.auth.onboardingVisible);
  const isEditingUser = useSelector((state: TRedux) => state.auth.isEditingUser);

  const dispatch = useDispatch();
  const dispatchCancelEditEvent = React.useCallback(() => dispatch(_kappa.cancelEditEvent()), [dispatch]);
  const dispatchSaveEditEvent = React.useCallback(
    (event: Partial<TEvent>, eventId?: string) => dispatch(_kappa.saveEditEvent(user, event, eventId)),
    [dispatch, user]
  );
  const dispatchCancelCheckInEvent = React.useCallback(() => dispatch(_kappa.setCheckInEvent('', false)), [dispatch]);
  const dispatchShowOnboarding = React.useCallback(() => dispatch(_auth.showOnboarding()), [dispatch]);
  const dispatchHideOnboarding = React.useCallback(() => dispatch(_auth.hideOnboarding()), [dispatch]);

  React.useEffect(() => {
    if (!user) {
      if (onboardingVisible) {
        dispatchHideOnboarding();
      }

      return;
    }

    if (isEditingUser) {
      return;
    }

    let incomplete = false;

    for (const key of Object.keys(incompleteUser)) {
      if (user[key] === undefined || user[key] === incompleteUser[key]) {
        incomplete = true;
        break;
      }
    }

    if (incomplete && !onboardingVisible) {
      dispatchShowOnboarding();
    } else if (!incomplete && onboardingVisible) {
      dispatchHideOnboarding();
    }
  }, [user, onboardingVisible, isEditingUser, dispatchHideOnboarding, dispatchShowOnboarding]);

  return (
    <Ghost style={styles.container}>
      <PopupModal
        visible={checkInEventId !== '' && checkInExcuse === false}
        allowClose={!isCheckingIn}
        onDoneClosing={dispatchCancelCheckInEvent}
      >
        <CheckInPage
          initialEvent={checkInEventId === 'NONE' ? null : getEventById(events, checkInEventId)}
          onPressCancel={dispatchCancelCheckInEvent}
        />
      </PopupModal>

      <PopupModal
        visible={checkInEventId !== '' && checkInExcuse === true}
        allowClose={!isCheckingIn}
        onDoneClosing={dispatchCancelCheckInEvent}
      >
        <RequestExcusePage
          initialEvent={checkInEventId === 'NONE' ? null : getEventById(events, checkInEventId)}
          onPressCancel={dispatchCancelCheckInEvent}
        />
      </PopupModal>

      <PopupModal visible={editingEventId !== ''} allowClose={!isSavingEvent} onDoneClosing={dispatchCancelEditEvent}>
        <EditEventPage
          initialEvent={editingEventId === 'NEW' ? null : getEventById(events, editingEventId)}
          onPressCancel={dispatchCancelEditEvent}
          onPressSave={dispatchSaveEditEvent}
        />
      </PopupModal>

      <PopupModal
        visible={onboardingVisible || isEditingUser}
        allowClose={isEditingUser}
        onDoneClosing={dispatchHideOnboarding}
      >
        <EditProfilePage onPressCancel={dispatchHideOnboarding} />
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
