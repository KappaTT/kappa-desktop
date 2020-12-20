import { SET_SELECTED_PAGE } from '@reducers/nav';

/**
 * Set the selected page.
 */
export const setSelectedPage = (routeName: string) => {
  return {
    type: SET_SELECTED_PAGE,
    routeName
  };
};
