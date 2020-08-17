export const SHOW_TOAST = 'SHOW_TOAST';
export const HIDE_TOAST = 'HIDE_TOAST';
export const DONE_HIDING_TOAST = 'DONE_HIDING_TOAST';

export interface TToast {
  title: string;
  message: string;
  allowClose: boolean;
  timer: number;
  code: number;
  toastColor: string;
  textColor: string;
  showBackdrop: boolean;
}

export interface TUIState {
  isShowingToast: boolean;
  isHidingToast: boolean;
  toast: TToast;
}

const initialToast: TToast = {
  title: '',
  message: '',
  allowClose: true,
  timer: -1,
  code: -1,
  toastColor: 'white',
  textColor: 'black',
  showBackdrop: false
};

const initialState: TUIState = {
  isShowingToast: false,
  isHidingToast: false,
  toast: initialToast
};

export default (state = initialState, action: any): TUIState => {
  switch (action.type) {
    case SHOW_TOAST:
      if (state.toast.allowClose === false && state.toast.title !== '') {
        return {
          ...state
        };
      }

      return {
        ...state,
        isShowingToast: true,
        isHidingToast: false,
        toast: {
          title: action.toast.title || initialToast.title,
          message: action.toast.message || initialToast.message,
          allowClose: action.toast.allowClose !== false,
          timer: action.toast.timer !== undefined ? action.toast.timer : initialToast.timer,
          code: action.toast.code !== undefined ? action.toast.code : initialToast.code,
          toastColor: action.toast.toastColor || initialToast.toastColor,
          textColor: action.toast.textColor || initialToast.textColor,
          showBackdrop: action.toast.showBackdrop === true
        }
      };
    case HIDE_TOAST:
      return {
        ...state,
        isHidingToast: true
      };
    case DONE_HIDING_TOAST:
      return {
        ...state,
        isShowingToast: false,
        isHidingToast: false,
        toast: initialToast
      };
    default:
      return state;
  }
};
