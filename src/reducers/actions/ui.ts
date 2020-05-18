import { TToast, SHOW_TOAST, HIDE_TOAST, DONE_HIDING_TOAST } from '@reducers/ui';

export const showToast = (toast: Partial<TToast>) => {
  return {
    type: SHOW_TOAST,
    toast
  };
};

export const hideToast = () => {
  return {
    type: HIDE_TOAST
  };
};

export const doneHidingToast = () => {
  return {
    type: DONE_HIDING_TOAST
  };
};
