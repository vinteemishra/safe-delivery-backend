"use strict";
import { Auth } from "lib/sdaAPI";
import config from "Config";

const REQUEST = "auth/REQUEST";
export const requestAuth = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "auth/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  auth: json,
});

const REQUEST_ERROR = "auth/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const initialState = {
  auth: {},
};

export const fetchAuth = () => (dispatch) => {
  dispatch(requestAuth());
  return Auth.info().then((json) => dispatch(requestSuccess(json)));
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        auth: action.auth,
      };
    default:
      return state;
  }
}
