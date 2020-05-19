import { SET_SELECTED_PAGE } from '@reducers/nav';

export const setSelectedPage = (label: string) => {
  return {
    type: SET_SELECTED_PAGE,
    label
  };
};
