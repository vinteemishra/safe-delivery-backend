import { sections } from "containers/AboutContainer";

const commonRoutes = (title) => ({
  title: title,
  "/screens": {
    title: "Screens",
  },
  "/about": {
    title: "About",
    "/:section": {
      titles: new Map(sections.map((s) => [s.section, s.title])),
      title: "About section",
    },
  },
  "/procedures": {
    title: "Procedures",
    "/:docKey": {
      title: "Procedure",
      "/:chapterKey": {
        title: "Edit chapter",
      },
    },
  },
  "/action-cards": {
    title: "Action Cards",
    "/:docKey": {
      title: "Action Card",
      "/:chapterKey": {
        title: "Edit chapter",
      },
    },
  },
  "/key-learning-points": {
    title: "Key Learning Points",
    "/:parentKey": {
      title: "KLP",
      "/:questionKey": {
        title: "Question",
      },
    },
  },
  "/certificates": {
    title: "Certificates",
    "/:parentKey": {
      title: "Certificate",
    },
  },
  "/cases": {
    title: "Cases",
    "/:parentKey": {
      title: "Case",
      "/:questionKey": {
        title: "Edit question",
      },
    },
  },
  "/drugs": {
    title: "Drugs",
    "/:drugKey": {
      title: "Drug",
    },
  },
  "/notifications": {
    title: "Notifications",
    "/:notificationKey": {
      title: "Edit notification",
    },
  },
  "/module-categories": {
    title: "Module Categories",
    "/:moduleCategoryKey": { title: "Module Category" },
  },
  "/modules": {
    title: "Modules",
    "/:moduleKey": {
      title: "Module",
    },
  },
  "/onboarding": {
    title: "Onboarding",
    "/:onbKey": {
      title: "Onboarding",
    },
  },
});

export const routes = {
  "/": {
    title: "Home",
  },
  "/masters": commonRoutes("Masters"),
  "/languages": {
    title: "Languages",
    "/:langId": commonRoutes("Language"),
  },
  "/admin": {
    title: "Admin",
    "/events": {
      title: "Event Checker",
    },
  },
};
