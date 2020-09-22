export const SET_SELECTED_PAGE = 'SET_SELECTED_PAGE';

export interface TNavState {
  selectedRouteName: string;
}

const initialState: TNavState = {
  selectedRouteName: 'Login'
};

export default (state = initialState, action: any): TNavState => {
  switch (action.type) {
    case SET_SELECTED_PAGE:
      return {
        ...state,
        selectedRouteName: action.routeName
      };
    default:
      return state;
  }
};
