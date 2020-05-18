import React from 'react';
import { Provider } from 'react-redux';

import App from './src/App';
import store from '@reducers';

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default AppWrapper;
