import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { TRedux } from '@reducers';
import { _kappa, _voting } from '@reducers/actions';
import { TEvent } from '@backend/kappa';
import { incompleteUser } from '@backend/auth';
import {
  BulkAttendPage,
  CheckInPage,
  EditEventPage,
  EditProfilePage,
  RequestExcusePage,
  EditCandidatePage,
  EditSessionPage,
  PresentationModePage,
  VotingPage
} from '@pages';
import Ghost from '@components/Ghost';
import PopupModal from '@components/PopupModal';
import FullPageModal from '@components/FullPageModal';
import EditMultCandidatePage from '@pages/EditMultCandidatePage';

const ModalController: React.FC = () => {
  const authorized = useSelector((state: TRedux) => state.auth.authorized);
  const user = useSelector((state: TRedux) => state.auth.user);
  const editingEventId = useSelector((state: TRedux) => state.kappa.editingEventId);
  const isSavingEvent = useSelector((state: TRedux) => state.kappa.isSavingEvent);
  const checkInEventId = useSelector((state: TRedux) => state.kappa.checkInEventId);
  const checkInExcuse = useSelector((state: TRedux) => state.kappa.checkInExcuse);
  const isCheckingIn = useSelector((state: TRedux) => state.kappa.isCheckingIn);
  const editingUserEmail = useSelector((state: TRedux) => state.kappa.editingUserEmail);
  const isUpdatingUser = useSelector((state: TRedux) => state.kappa.isUpdatingUser);
  const bulkAttendanceEventId = useSelector((state: TRedux) => state.kappa.bulkAttendanceEventId);
  const isCreatingBulkAttendance = useSelector((state: TRedux) => state.kappa.isCreatingBulkAttendance);
  const editingCandidateEmail = useSelector((state: TRedux) => state.voting.editingCandidateEmail);
  const editingMultCandidateEmail = useSelector((state: TRedux) => state.voting.editingMultCandidateEmail);
  const isSavingCandidate = useSelector((state: TRedux) => state.voting.isSavingCandidate);
  const editingSessionId = useSelector((state: TRedux) => state.voting.editingSessionId);
  const isSavingSession = useSelector((state: TRedux) => state.voting.isSavingSession);
  const isDeletingSession = useSelector((state: TRedux) => state.voting.isDeletingSession);
  const isShowingPresentationMode = useSelector((state: TRedux) => state.voting.isShowingPresentationMode);
  const isShowingVoting = useSelector((state: TRedux) => state.voting.isShowingVoting);

  const dispatch = useDispatch();
  const dispatchCancelEditEvent = React.useCallback(() => dispatch(_kappa.cancelEditEvent()), [dispatch]);
  const dispatchSaveEditEvent = React.useCallback(
    (event: Partial<TEvent>, eventId?: string) => dispatch(_kappa.saveEditEvent(user, event, eventId)),
    [dispatch, user]
  );
  const dispatchCancelCheckInEvent = React.useCallback(() => dispatch(_kappa.setCheckInEvent('', false)), [dispatch]);
  const dispatchCancelEditUser = React.useCallback(() => dispatch(_kappa.cancelEditUser()), [dispatch]);
  const dispatchHideBulkAttendance = React.useCallback(() => dispatch(_kappa.hideBulkAttendance()), [dispatch]);
  const dispatchCancelEditCandidate = React.useCallback(() => dispatch(_voting.cancelEditCandidate()), [dispatch]);
  const dispatchCancelEditMultCandidate = React.useCallback(() => dispatch(_voting.cancelEditMultCandidate()), [
    dispatch
  ]);
  const dispatchCancelEditSession = React.useCallback(() => dispatch(_voting.cancelEditSession()), [dispatch]);
  const dispatchHidePresentationMode = React.useCallback(() => dispatch(_voting.hidePresentationMode()), [dispatch]);
  const dispatchHideVoting = React.useCallback(() => dispatch(_voting.hideVoting()), [dispatch]);

  const userIsIncomplete = React.useMemo(() => {
    if (!authorized || !user) return false;

    let incomplete = false;

    for (const key of Object.keys(incompleteUser)) {
      if (user[key] === undefined || user[key] === incompleteUser[key]) {
        incomplete = true;
        break;
      }
    }

    return incomplete;
  }, [authorized, user]);

  return (
    <Ghost style={styles.container}>
      <PopupModal
        visible={checkInEventId !== '' && checkInExcuse === false}
        allowClose={!isCheckingIn}
        onDoneClosing={dispatchCancelCheckInEvent}
      >
        <CheckInPage onPressCancel={dispatchCancelCheckInEvent} />
      </PopupModal>

      <PopupModal
        visible={checkInEventId !== '' && checkInExcuse === true}
        allowClose={!isCheckingIn}
        onDoneClosing={dispatchCancelCheckInEvent}
      >
        <RequestExcusePage onPressCancel={dispatchCancelCheckInEvent} />
      </PopupModal>

      <PopupModal visible={editingEventId !== ''} allowClose={!isSavingEvent} onDoneClosing={dispatchCancelEditEvent}>
        <EditEventPage onPressCancel={dispatchCancelEditEvent} onPressSave={dispatchSaveEditEvent} />
      </PopupModal>

      <PopupModal
        visible={userIsIncomplete || (authorized && editingUserEmail !== '')}
        allowClose={!userIsIncomplete && !isUpdatingUser}
        onDoneClosing={dispatchCancelEditUser}
      >
        <EditProfilePage onPressCancel={dispatchCancelEditUser} />
      </PopupModal>

      <PopupModal
        visible={bulkAttendanceEventId !== ''}
        allowClose={!isCreatingBulkAttendance}
        onDoneClosing={dispatchHideBulkAttendance}
      >
        <BulkAttendPage onPressCancel={dispatchHideBulkAttendance} />
      </PopupModal>

      <PopupModal
        visible={editingCandidateEmail !== ''}
        allowClose={!isSavingCandidate}
        onDoneClosing={dispatchCancelEditCandidate}
      >
        <EditCandidatePage onPressCancel={dispatchCancelEditCandidate} />
      </PopupModal>

      <PopupModal
        visible={editingMultCandidateEmail !== ''}
        allowClose={!isSavingCandidate}
        onDoneClosing={dispatchCancelEditMultCandidate}
      >
        <EditMultCandidatePage onPressCancel={dispatchCancelEditMultCandidate} />
      </PopupModal>

      <PopupModal
        visible={editingSessionId !== ''}
        allowClose={!isSavingSession && !isDeletingSession}
        onDoneClosing={dispatchCancelEditSession}
      >
        <EditSessionPage onPressCancel={dispatchCancelEditSession} />
      </PopupModal>

      <FullPageModal visible={isShowingPresentationMode} onDoneClosing={dispatchHidePresentationMode}>
        <PresentationModePage onPressCancel={dispatchHidePresentationMode} />
      </FullPageModal>

      <FullPageModal visible={isShowingVoting} onDoneClosing={dispatchHideVoting}>
        <VotingPage onPressCancel={dispatchHideVoting} />
      </FullPageModal>
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
