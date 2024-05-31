"use strict";
import { ModuleCategories } from "../lib/sdaAPI";

const REQUEST = "moduleCategories/REQUEST";
export const requestModuleCategories = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "moduleCategories/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  moduleCategories: json,
});

const REQUEST_ERROR = "moduleCategories/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const ADD_REQUEST = "moduleCategories/ADD_REQUEST";
export const addModuleCategory = (modulesCategory) => ({
  type: ADD_REQUEST,
  payload: modulesCategory,
});

const DELETE_REQUEST = "moduleCategories/DELETE_REQUEST";
export const deleteModuleCategory = (moduleId) => ({
  type: DELETE_REQUEST,
  payload: moduleId,
});

const initialState = {
  moduleCategories: [],
};

export const fetchModuleCategories = () => (dispatch) => {
  dispatch(requestModuleCategories());
  return ModuleCategories.all().then((json) => dispatch(requestSuccess(json)));
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        moduleCategories: action.moduleCategories,
      };
    case ADD_REQUEST:
      return {
        ...state,
        moduleCategories: [...state.moduleCategories, action.payload],
      };
    case DELETE_REQUEST:
      return {
        ...state,
        moduleCategories: state.moduleCategories.filter(
          (m) => m.id !== action.payload
        ),
      };
    default:
      return state;
  }
}
