import { TToast, SHOW_TOAST, HIDE_TOAST, DONE_HIDING_TOAST } from '@reducers/ui';

/**
 * Show a new toast.
 */
export const showToast = (toast: Partial<TToast>) => {
  return {
    type: SHOW_TOAST,
    toast
  };
};

/**
 * Hide the existing toast.
 */
export const hideToast = () => {
  return {
    type: HIDE_TOAST
  };
};

/**
 * Finished hiding the existing toast.
 */
export const doneHidingToast = () => {
  return {
    type: DONE_HIDING_TOAST
  };
};
