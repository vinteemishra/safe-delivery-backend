import React from "react";
import ReactDOM from "react-dom";
import "react-toolbox/lib/commons.scss";
import { AppWithRouter, clientOnlyStore } from "./reducers";
import { Provider } from "react-redux";

import { fetchImages, default as images } from "./modules/images";
import { fetchVideos, default as videos } from "./modules/videos";
import { fetchAuth, default as auth } from "./modules/auth";
import { langIdFromRoute } from "./lib/util";

// Initial fetch
fetchAuth()(clientOnlyStore.dispatch);
const langId = langIdFromRoute(clientOnlyStore.getState());
fetchImages({ langId: langId && langId !== "" ? langId : undefined })(
  clientOnlyStore.dispatch
);
fetchVideos()(clientOnlyStore.dispatch);

ReactDOM.render(
  <Provider store={clientOnlyStore}>
    <AppWithRouter />
  </Provider>,
  document.getElementById("app")
);

process.env.NODE_ENV === "development" && module.hot.accept();
