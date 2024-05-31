"use strict";
import { Modules } from "lib/sdaAPI";

const REQUEST = "modules/REQUEST";
export const requestModules = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "modules/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  modules: json,
});

const REQUEST_ERROR = "modules/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const ADD_REQUEST = "modules/ADD_REQUEST";
export const addModule = (module) => ({ type: ADD_REQUEST, payload: module });

const DELETE_REQUEST = "modules/DELETE_REQUEST";
export const deleteModule = (moduleId) => ({
  type: DELETE_REQUEST,
  payload: moduleId,
});

const initialState = {
  modules: [],
};

export const fetchModules = (langId) => (dispatch) => {
  dispatch(requestModules());
  return Modules.all(langId).then((json) => dispatch(requestSuccess(json)));
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        modules: action.modules,
      };
    case ADD_REQUEST:
      return {
        ...state,
        modules: [...state.modules, action.payload],
      };
    case DELETE_REQUEST:
      return {
        ...state,
        modules: state.modules.filter((m) => m.id !== action.payload),
      };
    default:
      return state;
  }
}
