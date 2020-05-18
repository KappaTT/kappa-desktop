import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import auth, { TAuthState } from './auth';
import kappa, { TKappaState } from './kappa';
import ui, { TUIState } from './ui';

export interface TRedux {
  auth: TAuthState;
  kappa: TKappaState;
  ui: TUIState;
}

export const reducers = combineReducers({
  auth,
  kappa,
  ui
});

export default createStore(reducers, applyMiddleware(ReduxThunk));
