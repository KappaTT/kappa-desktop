export const SET_SELECTED_PAGE = 'SET_SELECTED_PAGE';

export interface TNavState {
  selectedPageLabel: string;
}

const initialState: TNavState = {
  selectedPageLabel: 'Events'
};

export default (state = initialState, action: any): TNavState => {
  switch (action.type) {
    case SET_SELECTED_PAGE:
      return {
        ...state,
        selectedPageLabel: action.label
      };
    default:
      return state;
  }
};
