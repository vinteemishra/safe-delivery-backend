"use strict";
import { Assets, Lang } from "lib/sdaAPI";
import config from "Config";

const REQUEST = "images/REQUEST";
export const requestimages = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "images/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  images: json,
});

const REQUEST_ERROR = "images/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const initialState = {
  images: new Map(),
};

export const fetchImages = (payload) => (dispatch) => {
  dispatch(requestimages());
  if (payload.langId) {
    Lang.get(payload.langId).then((lang) =>
      Assets.images(lang.assetVersion).then((images) =>
        dispatch(requestSuccess(images))
      )
    );
  }
  return Assets.images(payload.assetVersion).then((json) =>
    dispatch(requestSuccess(json))
  );
};

export const imageURL = (image) => `${config.blobContainer}${image.href}`;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        images: new Map(
          action.images.map((image) => [image.key, imageURL(image)])
        ),
      };
    default:
      return state;
  }
}
