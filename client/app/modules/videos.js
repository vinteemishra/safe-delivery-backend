"use strict";
import { Assets } from "lib/sdaAPI";
import config from "Config";

const REQUEST = "videos/REQUEST";
export const requestVideos = () => ({ type: REQUEST });

const REQUEST_SUCCESS = "videos/REQUEST_SUCCESS";
export const requestSuccess = (json) => ({
  type: REQUEST_SUCCESS,
  videos: json,
});

const REQUEST_ERROR = "videos/REQUEST_ERROR";
export const requestError = (errors) => ({
  type: REQUEST_ERROR,
  error: true,
  payload: errors,
});

const initialState = {
  videos: new Map(),
};

export const fetchVideos = () => (dispatch) => {
  dispatch(requestVideos());
  return Assets.videos().then((json) => dispatch(requestSuccess(json)));
};

export const videoURL = (video) => `${config.blobContainer}${video.href}`;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_SUCCESS:
      return {
        ...state,
        videos: new Map(
          action.videos.map((video) => [video.key, videoURL(video)])
        ),
      };
    default:
      return state;
  }
}
