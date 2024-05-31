"use strict";

import { Screens } from "lib/sdaAPI";

const REQUEST = "screens/REQUEST";
export const requestScreens = (lang) => ({ type: REQUEST, payload: lang });

const REQUEST_SUCCESS = "screens/REQUEST_SUCCESS";
export const requestSuccess = (langId, json) => ({
  type: REQUEST_SUCCESS,
  langId: langId,
  items: json,
});

const REQUEST_ERROR = "screens/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const UPDATE_REQUEST = "screens/UPDATE_REQUEST";
export const updateScreens = (items) => ({
  type: UPDATE_REQUEST,
  payload: { items: items },
});

export const fetchScreens = (langId) => (dispatch) => {
  dispatch(requestScreens(langId));
  return Screens.all(langId).then((json) =>
    dispatch(requestSuccess(langId, json))
  );
};

const initialState = {
  items: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        items: action.items,
      };
    case UPDATE_REQUEST:
      return {
        ...state,
        items: action.payload.items,
      };
    default:
      return state;
  }
}
