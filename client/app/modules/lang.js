"use strict";
import { Lang } from "lib/sdaAPI";

const REQUEST = "lang/REQUEST";
export const requestLanguages = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "lang/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  languages: json,
});

const REQUEST_ERROR = "lang/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const ADD_REQUEST = "lang/ADD_REQUEST";
export const addLanguage = (lang) => ({ type: ADD_REQUEST, payload: lang });

const EDIT_REQUEST = "lang/EDIT_REQUEST";
export const editLanguage = (lang) => ({ type: EDIT_REQUEST, payload: lang });

const DELETE_REQUEST = "lang/DELETE_REQUEST";
export const deleteLanguage = (langId) => ({
  type: DELETE_REQUEST,
  payload: langId,
});

const initialState = {
  currentLangId: "",
  languages: [],
};

export const fetchLanguages = () => (dispatch) => {
  dispatch(requestLanguages());
  return Lang.all().then((json) => dispatch(requestSuccess(json)));
};

const descriptionComparator = (a, b) =>
  (a.description || "").localeCompare(b.description || "");

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        languages: action.languages.sort(descriptionComparator),
      };
    case ADD_REQUEST:
      return {
        ...state,
        languages: [...state.languages, action.payload].sort(
          descriptionComparator
        ),
      };
    case EDIT_REQUEST:
      const languages = [...state.languages].filter(
        (l) => l.id !== action.payload.id
      );
      languages.push(action.payload);
      languages.sort(descriptionComparator);
      return {
        ...state,
        languages,
      };
    case DELETE_REQUEST:
      return {
        ...state,
        languages: state.languages.filter((l) => l.id !== action.payload),
      };
    default:
      return state;
  }
}
