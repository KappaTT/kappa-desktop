import { SET_SELECTED_PAGE } from '@reducers/nav';

export const setSelectedPage = (routeName: string) => {
  return {
    type: SET_SELECTED_PAGE,
    routeName
  };
};
