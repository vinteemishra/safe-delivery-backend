"use strict";
import { Procedures } from "lib/sdaAPI";

const REQUEST = "procedures/REQUEST";
export const requestProcedures = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "procedures/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  procedures: json,
});

const REQUEST_ERROR = "procedures/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const ADD_REQUEST = "procedures/ADD_REQUEST";
export const addProcedure = (procedure) => ({
  type: ADD_REQUEST,
  payload: procedure,
});

const DELETE_REQUEST = "procedures/DELETE_REQUEST";
export const deleteModule = (procedureId) => ({
  type: DELETE_REQUEST,
  payload: procedureId,
});

const initialState = {
  procedures: [],
};

export const fetchProcedures = (langId) => (dispatch) => {
  dispatch(requestProcedures());
  return Procedures.all(langId).then((json) => dispatch(requestSuccess(json)));
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        procedures: action.procedures,
      };
    case ADD_REQUEST:
      return {
        ...state,
        procedures: [...state.procedures, action.payload],
      };
    case DELETE_REQUEST:
      return {
        ...state,
        procedures: state.procedures.filter((m) => m.id !== action.payload),
      };
    default:
      return state;
  }
}
