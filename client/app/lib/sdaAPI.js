"use strict";

import config from "Config";

// TODO Renew token when expired
const authHeader = () => ({}); //{'Authorization': 'Bearer ' + sessionStorage.getItem('token')};

const sdaAPI = {
  get: (url) => {
    console.log("Get url " + url);
    return fetch(`${config.apiUrl}${url}`, {
      headers: new Headers(authHeader()),
      credentials: "same-origin",
      method: "GET",
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`${url} GET failed with ${response.status}`);
      }
    });
  },
  post: (url, body, accepts = "application/json") => {
    console.log("Post url " + url, "body:", body, "accepts: ", accepts);
    return fetch(`${config.apiUrl}${url}`, {
      credentials: "same-origin",
      headers: new Headers(
        Object.assign({}, authHeader(), {
          Accept: accepts,
          "Content-Type": "application/json",
        })
      ),
      method: "POST",
      body: JSON.stringify(body),
    }).then(function (response) {
      if (response.ok) {
        return accepts === "application/json" ? response.json() : response;
      } else {
        throw new Error(`${url} POST failed with ${response.status}`);
      }
    });
  },
  put: (url, body) => {
    console.log("Put url " + url, "body:", body);
    return fetch(`${config.apiUrl}${url}`, {
      credentials: "same-origin",
      headers: new Headers(
        Object.assign({}, authHeader(), {
          Accept: "application/json",
          "Content-Type": "application/json",
        })
      ),
      method: "PUT",
      body: JSON.stringify(body),
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`${url} PUT failed with ${response.status}`);
      }
    });
  },
  patch: (url, body) => {
    console.log("Patch url " + url, "body:", body);
    return fetch(`${config.apiUrl}${url}`, {
      credentials: "same-origin",
      headers: new Headers(
        Object.assign({}, authHeader(), {
          Accept: "application/json",
          "Content-Type": "application/json",
        })
      ),
      method: "PATCH",
      body: JSON.stringify(body),
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`${url} PUT failed with ${response.status}`);
      }
    });
  },
  delete: (url) => {
    console.log("Delete url " + url);
    return fetch(`${config.apiUrl}${url}`, {
      credentials: "same-origin",
      headers: new Headers(
        Object.assign({}, authHeader(), {
          Accept: "application/json",
        })
      ),
      method: "DELETE",
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`${url} DELETE failed with ${response.status}`);
      }
    });
  },
};

const Screens = {
  all: (langId) => sdaAPI.get(`/screens?langId=${langId}`),
  put: (items) => sdaAPI.put("/screens", items),
};

const Assets = {
  images: (assetVersion = undefined) =>
    sdaAPI.get(
      `/assets/images${assetVersion ? `?version=${assetVersion}` : ""}`
    ),
  videos: () => sdaAPI.get("/assets/videos"),
};

const Auth = {
  info: () => sdaAPI.get("/auth"),
};

const About = {
  all: (langId, section) => sdaAPI.get(`/about/${section}?langId=${langId}`),
  put: (section, item) => sdaAPI.put(`/about/${section}`, item),
};

const Admin = {
  // events: (appId) => sdaAPI.get(`/admin/events/${appId}`)
  events: (appId) => sdaAPI.get(`/events/${appId}`),
  certsById: (certId) => sdaAPI.get(`/admin/certsById/${certId}`),
  certsByMember: (memberId) => sdaAPI.get(`/admin/certsByMember/${memberId}`),
};

const APKs = {
  list: (langId) => sdaAPI.get(`/apks/list?langId=${langId}`),
  status: () => sdaAPI.get("/apks/status"),
  generate: (langId, draft) => sdaAPI.post("/apks/genApk", { draft, langId }),
  latest: (langId) => sdaAPI.get(`/apks/latest?langId=${langId}`),
};

const Lang = {
  all: () => sdaAPI.get("/languages"),
  post: (lang) => sdaAPI.post("/languages", lang),
  get: (langId) => sdaAPI.get(`/languages/${langId}`),
  del: (langId) => sdaAPI.delete(`/languages/${langId}`),
  publish: (langId, options) =>
    sdaAPI.post(`/languages/${langId}/publish`, options),
  unpublish: (langId, options) =>
    sdaAPI.post(`/languages/${langId}/unpublish`, options),
};

const Modules = {
  all: (langId) => sdaAPI.get(`/modules?langId=${langId}`),
  get: (moduleKey, langId) =>
    sdaAPI.get(`/modules/${moduleKey}?langId=${langId}`),
  put: (module) => sdaAPI.put("/modules", module),
  post: (module) => sdaAPI.post("/modules", module),
  del: (moduleKey) => sdaAPI.delete(`/modules/${moduleKey}`),
};

const ModuleCategories = {
  all: () => sdaAPI.get("/module-categorization"),
  get: (moduleKey) => sdaAPI.get(`/module-categorization/?key=${moduleKey}`),
  patch: (moduleCategory) =>
    sdaAPI.patch("/module-categorization", moduleCategory),
  post: (module) => sdaAPI.post("/module-categorization", module),
  del: (key) => sdaAPI.delete(`/modules/${key}`),
};

const Procedures = {
  all: (langId, showAll) =>
    sdaAPI.get(`/procedures?langId=${langId}&showAll=${!!showAll}`),
  get: (procedureKey, langId) =>
    sdaAPI.get(`/procedures/${procedureKey}?langId=${langId}`),
  put: (procedure) => sdaAPI.put("/procedures", procedure),
  post: (procedure) => sdaAPI.post("/procedures", procedure),
  del: (procedureKey) => sdaAPI.delete(`/procedures/${procedureKey}`),
};

const ActionCards = {
  all: (langId, showAll) =>
    sdaAPI.get(`/action-cards?langId=${langId}&showAll=${!!showAll}`),
  get: (cardKey, langId) =>
    sdaAPI.get(`/action-cards/${cardKey}?langId=${langId}`),
  put: (card) => sdaAPI.put("/action-cards", card),
  post: (card) => sdaAPI.post("/action-cards", card),
  del: (cardKey) => sdaAPI.delete(`/action-cards/${cardKey}`),
};

const KeyLearningPoints = {
  all: (langId, showAll) =>
    sdaAPI.get(`/key-learning-points?langId=${langId}&showAll=${!!showAll}`),
  get: (klpKey, langId) =>
    sdaAPI.get(`/key-learning-points/${klpKey}?langId=${langId}`),
  put: (klp) => sdaAPI.put("/key-learning-points", klp),
  post: (klp) => sdaAPI.post("/key-learning-points", klp),
  del: (klpKey) => sdaAPI.delete(`/key-learning-points/${klpKey}`),
};

const Cases = {
  all: (langId, showAll) =>
    sdaAPI.get(`/cases?langId=${langId}&showAll=${!!showAll}`),
  get: (caseKey, langId) => sdaAPI.get(`/cases/${caseKey}?langId=${langId}`),
  put: (caze) => sdaAPI.put("/cases", caze),
  post: (caze) => sdaAPI.post("/cases", caze),
  del: (caseKey) => sdaAPI.delete(`/cases/${caseKey}`),
};

const Certificates = {
  all: (langId, showAll) =>
    sdaAPI.get(`/certificates?langId=${langId}&showAll=${!!showAll}`),
  get: (certKey, langId) =>
    sdaAPI.get(`/certificates/${certKey}?langId=${langId}`),
  put: (cert) => sdaAPI.put("/certificates", cert),
  post: (cert) => sdaAPI.post("/certificates", cert),
  del: (certKey) => sdaAPI.delete(`/certificates/${certKey}`),
  genCert: (json) => sdaAPI.post("/public/genCertificate", json, "image/png"),
};

const Drugs = {
  all: (langId, showAll) =>
    sdaAPI.get(`/drugs?langId=${langId}&showAll=${!!showAll}`),
  get: (drugKey, langId) => sdaAPI.get(`/drugs/${drugKey}?langId=${langId}`),
  put: (drug) => sdaAPI.put("/drugs", drug),
  post: (drug) => sdaAPI.post("/drugs", drug),
  del: (drugKey) => sdaAPI.delete(`/drugs/${drugKey}`),
};

const Notifications = {
  all: (langId) => sdaAPI.get(`/notifications?langId=${langId}`),
  get: (notificationKey, langId) =>
    sdaAPI.get(`/notifications/${notificationKey}?langId=${langId}`),
  put: (notification) => sdaAPI.put("/notifications", notification),
  post: (notification) => sdaAPI.post("/notifications", notification),
  del: (notificationKey) => sdaAPI.delete(`/notifications/${notificationKey}`),
};

const Onboarding = {
  all: (langId) => sdaAPI.get(`/onboarding?langId=${langId}`),
  get: (onbKey, langId) => sdaAPI.get(`/onboarding/${onbKey}?langId=${langId}`),
  put: (onboardingScreen) => sdaAPI.put("/onboarding", onboardingScreen),
  post: (onboardingScreen) => sdaAPI.post("/onboarding", onboardingScreen),
  del: (onbKey) => sdaAPI.delete(`/onboarding/${onbKey}`),
};

const Profiles = {
  getFromEmail: (email) => sdaAPI.get(`/profiles?email=${email}`),
};

const LogActions = {
  getActions: (pageNumber) =>
    sdaAPI.get(`/actions?perPage=20&pageNumber=${pageNumber}`),
};

const Search = {
  search: (searchString, type) => {
    const params = { searchString, type };
    var esc = encodeURIComponent;
    var query = Object.keys(params)
      .map((k) => params[k] && esc(k) + "=" + esc(params[k]))
      .join("&");
    return sdaAPI.get(`/search?${query}`);
  },
};

export {
  Screens,
  Lang,
  About,
  Admin,
  APKs,
  Modules,
  Assets,
  Procedures,
  Drugs,
  ActionCards,
  Notifications,
  Auth,
  KeyLearningPoints,
  Cases,
  Certificates,
  Onboarding,
  Profiles,
  LogActions,
  Search,
  ModuleCategories,
};
