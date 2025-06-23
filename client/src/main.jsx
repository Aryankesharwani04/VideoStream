import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals.js';
import {Provider} from "react-redux";
import { applyMiddleware,compose } from 'redux';
import {legacy_createStore as createstore} from "redux"
import {thunk} from "redux-thunk"
import { GoogleOAuthProvider } from '@react-oauth/google';
import Reducers from './Reducers';
const store=createstore(Reducers,compose(applyMiddleware(thunk)));
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <Provider store={store}>
    <GoogleOAuthProvider clientId="627496213159-avlbb3sm61hi4ini6puhgoaaem3t7q40.apps.googleusercontent.com">
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </GoogleOAuthProvider>
  </Provider>
);

reportWebVitals();