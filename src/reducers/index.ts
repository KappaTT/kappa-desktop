import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import auth, { TAuthState } from './auth';
import courses, { TCoursesState } from './courses';
import kappa, { TKappaState } from './kappa';
import nav, { TNavState } from './nav';
import ui, { TUIState } from './ui';
import voting, { TVotingState } from './voting';

export interface TRedux {
  auth: TAuthState;
  courses: TCoursesState;
  kappa: TKappaState;
  nav: TNavState;
  ui: TUIState;
  voting: TVotingState;
}

export const reducers = combineReducers({
  auth,
  courses,
  kappa,
  nav,
  ui,
  voting
});

export default createStore(reducers, applyMiddleware(ReduxThunk));
