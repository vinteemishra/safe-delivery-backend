"use strict";

import mount from "koa-mount";
import {
  admin,
  pub,
  screens,
  languages,
  about,
  assets,
  apks,
  modules,
  procedures,
  drugs,
  actionCards,
  notifications,
  auth,
  keyLearningPoints,
  cases,
  certificates,
  onboarding,
  events,
  profiles,
  actions,
  search,
  modulesCategories,
} from "../api";
import koa from "koa";
import whatsApp from "../api/pub";

export default function configRoutes(app) {
  const apiApp = new koa();

  apiApp.use(mount("/public", pub.routes()));
  apiApp.use(mount("/admin", admin.routes()));
  apiApp.use(mount("/screens", screens.routes()));
  apiApp.use(mount("/languages", languages.routes()));
  apiApp.use(mount("/about", about.routes()));
  apiApp.use(mount("/apks", apks.routes()));
  apiApp.use(mount("/assets", assets.routes()));
  apiApp.use(mount("/modules", modules.routes()));
  apiApp.use(mount("/procedures", procedures.routes()));
  apiApp.use(mount("/action-cards", actionCards.routes()));
  apiApp.use(mount("/drugs", drugs.routes()));
  apiApp.use(mount("/notifications", notifications.routes()));
  apiApp.use(mount("/auth", auth.routes()));
  apiApp.use(mount("/key-learning-points", keyLearningPoints.routes()));
  apiApp.use(mount("/cases", cases.routes()));
  apiApp.use(mount("/certificates", certificates.routes()));
  apiApp.use(mount("/onboarding", onboarding.routes()));
  apiApp.use(mount("/events", events.routes()));
  apiApp.use(mount("/whatsApp", whatsApp.routes()));
  apiApp.use(mount("/profiles", profiles.routes()));
  apiApp.use(mount("/actions", actions.routes()));
  apiApp.use(mount("/search", search.routes()));
  apiApp.use(mount("/module-categorization", modulesCategories.routes()));

  app.use(mount("/api", apiApp));
}
