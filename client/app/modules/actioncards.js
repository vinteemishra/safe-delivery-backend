"use strict";
import { ActionCards } from "lib/sdaAPI";

const REQUEST = "actioncard/REQUEST";
export const requestActionCards = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "actioncard/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  actionCards: json,
});

const REQUEST_ERROR = "actioncard/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const ADD_REQUEST = "actioncard/ADD_REQUEST";
export const addActionCard = (card) => ({ type: ADD_REQUEST, payload: card });

const DELETE_REQUEST = "actioncard/DELETE_REQUEST";
export const deleteActionCard = (cardKey) => ({
  type: DELETE_REQUEST,
  payload: cardKey,
});

const initialState = {
  actionCards: [],
};

export const fetchActionCards = (langId) => (dispatch) => {
  dispatch(requestActionCards());
  return ActionCards.all(langId).then((json) => dispatch(requestSuccess(json)));
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        actionCards: action.actionCards,
      };
    case ADD_REQUEST:
      return {
        ...state,
        actionCards: [...state.actionCards, action.payload],
      };
    case DELETE_REQUEST:
      return {
        ...state,
        actionCards: state.actionCards.filter((c) => c.key !== action.payload),
      };
    default:
      return state;
  }
}
