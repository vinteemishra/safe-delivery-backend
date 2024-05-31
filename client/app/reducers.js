import { compose, createStore, applyMiddleware, combineReducers } from "redux";
import procedures from "./modules/procedures";
import thunk from "redux-thunk";
import { setWindowTitle } from "./lib/util.js";
import { routes } from "./routes";
import {
  routerForBrowser,
  provideRouter,
  LOCATION_CHANGED,
} from "redux-little-router";
import App from "./App.js";
import screens from "./modules/screens";
import lang from "./modules/lang";
import modules from "./modules/modules";
import moduleCategories from "./modules/module-categories";
import actioncards from "./modules/actioncards";
import { fetchImages, default as images } from "./modules/images";
import { fetchVideos, default as videos } from "./modules/videos";
import { fetchAuth, default as auth } from "./modules/auth";

function titleReducer(state = {}, action = {}) {
  action.type === LOCATION_CHANGED &&
    setWindowTitle(action.payload.result.title);
  return {};
}

let reducer = combineReducers({
  lang,
  screens,
  modules,
  moduleCategories,
  actioncards,
  images,
  videos,
  procedures,
  auth,
  titleReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const { routerReducer, routerMiddleware, routerEnhancer } = routerForBrowser({
  routes,
});

const enhancers = composeEnhancers(
  routerEnhancer,
  applyMiddleware(routerMiddleware, thunk)
);
export const clientOnlyStore = createStore(reducer, {}, enhancers);

export const AppWithRouter = provideRouter({
  store: clientOnlyStore,
})(App);
