"use strict";

const fs = require("fs");

require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

const videosFile = "/Users/jeppestampe/videos.json";
const dbClient = require("../server/lib/documentdb").dbClient;

const langId = {
  "7cf6efab-a9d7-54d2-2cbd-ec82efe4a7da": "English",
  "6a146956-9f21-206a-98cf-55db7b0a8301": "French",
  "dca15fb5-81b8-eeaa-c971-d08a7e5c7570": "South Africa",
  "3163c8ae-e97e-2ad3-986d-82868e1b342b": "Laos",
  "cca954e8-6c14-6924-6990-010cd19c7919": "Ethiopia - English",
  "49bc07fa-9ad4-816c-17db-e693a28dd40f": "India - Hindi",
  "52510488-1303-5e36-6616-cc66413a73f1": "Tanzania - English",
  "7a3f367b-99df-9bca-0b1f-100dcc14ae95": "Myanmar",
  "c212e9db-06b3-2282-a07d-d3c0c9fe12ea": "Moldova",
  "791bb5cb-192d-9a45-a03a-c4a0805caf23": "Ghana - English",
  "164307e0-7889-595d-2571-18152e3b067d": "India - English",
};
const getLangId = (id) => {
  return langId[id] || id;
};

const erroneousFilesOld = {
  "/India/Hypertension/how to diagnose": "/India/Hypertension/how_to_diagnose",
  "/India/Hypertension/management of hypertension":
    "/India/Hypertension/management_of_hypertension",
  "/India/Hypertension/severe preeclampsia eclampsia":
    "/India/Hypertension/severe_preeclampsia_eclampsia",
  "/english WHO/Hypertension/how to diagnose":
    "/english WHO/Hypertension/how_to_diagnose",
  "/english WHO/Hypertension/management of hypertension":
    "/english WHO/Hypertension/management_of_hypertension",
  "/english WHO/Hypertension/severe preeclampsia eclampsia":
    "/english WHO/Hypertension/severe_preeclampsia_eclampsia",
  "/ethiopia english/Hypertension/how to diagnose":
    "/ethiopia english/Hypertension/how_to_diagnose",
  "/ethiopia english/Hypertension/management of hypertension":
    "/ethiopia english/Hypertension/management_of_hypertension",
  "/ethiopia english/Hypertension/severe preeclampsia eclampsia":
    "/ethiopia english/Hypertension/severe_preeclampsia_eclampsia",
  "/french/Hypertension/how to diagnose":
    "/french/Hypertension/how_to_diagnose",
  "/french/Hypertension/management of hypertension":
    "/french/Hypertension/management_of_hypertension",
  "/french/Hypertension/severe preeclampsia eclampsia":
    "/french/Hypertension/severe_preeclampsia_eclampsia",
  "/myanmar/Hypertension/how to diagnose":
    "/myanmar/Hypertension/how_to_diagnose",
  "/myanmar/Hypertension/management of hypertension":
    "/myanmar/Hypertension/management_of_hypertension",
  "/myanmar/Hypertension/severe preeclampsia eclampsia":
    "/myanmar/Hypertension/severe_preeclampsia_eclampsia",
  "/south africa/Hypertension/how to diagnose":
    "/south africa/Hypertension/how_to_diagnose",
  "/south africa/Hypertension/management of hypertension":
    "/south africa/Hypertension/management_of_hypertension",
  "/south africa/Hypertension/severe preeclampsia eclampsia":
    "/south africa/Hypertension/severe_preeclampsia_eclampsia",
  "/tanzania/Hypertension/how to diagnose":
    "/tanzania/Hypertension/how_to_diagnose",
  "/tanzania/Hypertension/management of hypertension":
    "/tanzania/Hypertension/management_of_hypertension",
  "/tanzania/Hypertension/severe preeclampsia eclampsia":
    "/tanzania/Hypertension/severe_preeclampsia_eclampsia",
};

const erroneousFiles = {
  "/french/Prolonged labour/first_stage_active_phase":
    "/french/Prolonged labour/1st_stage_active_phase",
  "/french/Prolonged labour/first_stage_latent_phase":
    "/french/Prolonged labour/1st_stage_latent_phase",
  "/french/Prolonged labour/second_stage_prolonged":
    "/french/Prolonged labour/2nd_stage_prolonged",
  "/french/Prolonged labour/second_stage_vacuum_extraction":
    "/french/Prolonged labour/2nd_stage_vacuum_extraction",
  "/laos/Prolonged labour/first_stage_active_phase":
    "/laos/Prolonged labour/1st_stage_active_phase",
  "/laos/Prolonged labour/first_stage_latent_phase":
    "/laos/Prolonged labour/1st_stage_latent_phase",
  "/laos/Prolonged labour/second_stage_prolonged":
    "/laos/Prolonged labour/2nd_stage_prolonged",
  "/laos/Prolonged labour/second_stage_vacuum_extraction":
    "/laos/Prolonged labour/2nd_stage_vacuum_extraction",
  "/myanmar/Prolonged labour/first_stage_active_phase":
    "/myanmar/Prolonged labour/1st_stage_active_phase",
  "/myanmar/Prolonged labour/first_stage_latent_phase":
    "/myanmar/Prolonged labour/1st_stage_latent_phase",
  "/myanmar/Prolonged labour/second_stage_prolonged":
    "/myanmar/Prolonged labour/2nd_stage_prolonged",
  "/myanmar/Prolonged labour/second_stage_vacuum_extraction":
    "/myanmar/Prolonged labour/2nd_stage_vacuum_extraction",
  "/India/Prolonged labour/first_stage_active_phase":
    "/India/Prolonged labour/1st_stage_active_phase",
  "/India/Prolonged labour/first_stage_latent_phase":
    "/India/Prolonged labour/1st_stage_latent_phase",
  "/India/Prolonged labour/second_stage_prolonged":
    "/India/Prolonged labour/2nd_stage_prolonged",
  "/India/Prolonged labour/second_stage_vacuum_extraction":
    "/India/Prolonged labour/2nd_stage_vacuum_extraction",
  "/english WHO/Prolonged labour/first_stage_active_phase":
    "/english WHO/Prolonged labour/1st_stage_active_phase",
  "/english WHO/Prolonged labour/first_stage_latent_phase":
    "/english WHO/Prolonged labour/1st_stage_latent_phase",
  "/english WHO/Prolonged labour/second_stage_prolonged":
    "/english WHO/Prolonged labour/2nd_stage_prolonged",
  "/english WHO/Prolonged labour/second_stage_vacuum_extraction":
    "/english WHO/Prolonged labour/2nd_stage_vacuum_extraction",
  "/ethiopia english/Prolonged labour/first_stage_active_phase":
    "/ethiopia english/Prolonged labour/1st_stage_active_phase",
  "/ethiopia english/Prolonged labour/first_stage_latent_phase":
    "/ethiopia english/Prolonged labour/1st_stage_latent_phase",
  "/ethiopia english/Prolonged labour/second_stage_prolonged":
    "/ethiopia english/Prolonged labour/2nd_stage_prolonged",
  "/ethiopia english/Prolonged labour/second_stage_vacuum_extraction":
    "/ethiopia english/Prolonged labour/2nd_stage_vacuum_extraction",
  "/south africa/Prolonged labour/first_stage_active_phase":
    "/south africa/Prolonged labour/1st_stage_active_phase",
  "/south africa/Prolonged labour/first_stage_latent_phase":
    "/south africa/Prolonged labour/1st_stage_latent_phase",
  "/south africa/Prolonged labour/second_stage_prolonged":
    "/south africa/Prolonged labour/2nd_stage_prolonged",
  "/south africa/Prolonged labour/second_stage_vacuum_extraction":
    "/south africa/Prolonged labour/2nd_stage_vacuum_extraction",
  "/tanzania/Prolonged labour/first_stage_active_phase":
    "/tanzania/Prolonged labour/1st_stage_active_phase",
  "/tanzania/Prolonged labour/first_stage_latent_phase":
    "/tanzania/Prolonged labour/1st_stage_latent_phase",
  "/tanzania/Prolonged labour/second_stage_prolonged":
    "/tanzania/Prolonged labour/2nd_stage_prolonged",
  "/tanzania/Prolonged labour/second_stage_vacuum_extraction":
    "/tanzania/Prolonged labour/2nd_stage_vacuum_extraction",
};

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

const showWrongVideoFiles = () =>
  new Promise((res, rej) => {
    // // List wrong filenames
    // const videos = JSON.parse(fs.readFileSync(videosFile)).map((v) => (v.key));
    // console.log("Wrong file names:");
    // videos.map((v) => {
    //     const parts = v.split("/");
    //     const last = parts[parts.length - 1];
    //     if (last.indexOf(" ") != -1) {
    //         console.log("  ", v);
    //     }
    // });
    // console.log("");

    const videos = JSON.parse(fs.readFileSync(videosFile)).map((v) => v.key);
    console.log("Wrong file names:");
    videos.map((v) => {
      if (
        v.includes("stage_active_phase") ||
        v.includes("stage_latent_phase")
      ) {
        console.log("Potential mismatch:", v);
      }
    });
    console.log("");
  });

/*
 * Check which KLPs use a wrong video link.
 */
const checkKLPs = () =>
  new Promise((res, rej) => {
    const erroneousLinksOld = {
      "video:/Hypertension/how to diagnose":
        "video:/Hypertension/how_to_diagnose",
      "video:/Hypertension/management of hypertension":
        "video:/Hypertension/management_of_hypertension",
      "video:/Hypertension/severe preeclampsia eclampsia":
        "video:/Hypertension/severe_preeclampsia_eclampsia",
    };
    const erroneousLinks = {
      "video:/Prolonged labour/first_stage_active_phase":
        "video:/Prolonged labour/1st_stage_active_phase",
      "video:/Prolonged labour/first_stage_latent_phase":
        "video:/Prolonged labour/1st_stage_latent_phase",
      "video:/Prolonged labour/second_stage_prolonged":
        "video:/Prolonged labour/2nd_stage_prolonged",
      "video:/Prolonged labour/second_stage_vacuum_extraction":
        "video:/Prolonged labour/2nd_stage_vacuum_extraction",
    };
    console.log("Checking KLPs:");
    dbClient.queryDocs("key-learning-points", {}).then((docs) => {
      let count = 0;
      docs.map((d) => {
        let shouldUpdate = false;
        if (d.questions !== undefined) {
          d.questions.map((q) => {
            // if (q.link !== undefined && q.link.startsWith("video:")) {
            if (Object.keys(erroneousLinks).includes(q.link)) {
              if (q.link.includes("second_stage_vacuum")) {
                count++;
                const shouldBe = erroneousLinks[q.link];
                q.link = shouldBe;
                shouldUpdate = true;
              }
            }
          });
        }
        if (shouldUpdate) {
          d.LastUpdated = new Date().getTime();
          console.log("Should fix KLP with langId:", d.id, getLangId(d.langId));
          // dbClient.upsertDoc('key-learning-points', d).then(() => {
          //     console.log("Fixed KLP:", d.id);
          // });
        }
      });
      res();
    });
  });

/*
 * Check which Notifications use a wrong video link.
 */
const checkNotifications = () =>
  new Promise((res, rej) => {
    const erroneousLinksOld = {
      "video:/Hypertension/how to diagnose":
        "video:/Hypertension/how_to_diagnose",
      "video:/Hypertension/management of hypertension":
        "video:/Hypertension/management_of_hypertension",
      "video:/Hypertension/severe preeclampsia eclampsia":
        "video:/Hypertension/severe_preeclampsia_eclampsia",
    };
    const erroneousLinks = {
      "video:/Prolonged labour/first_stage_active_phase":
        "video:/Prolonged labour/1st_stage_active_phase",
      "video:/Prolonged labour/first_stage_latent_phase":
        "video:/Prolonged labour/1st_stage_latent_phase",
      "video:/Prolonged labour/second_stage_prolonged":
        "video:/Prolonged labour/2nd_stage_prolonged",
      "video:/Prolonged labour/second_stage_vacuum_extraction":
        "video:/Prolonged labour/2nd_stage_vacuum_extraction",
    };
    console.log("Checking Notifications:");
    dbClient.queryDocs("notifications", {}).then((docs) => {
      let count = 0;
      docs.map((d) => {
        if (d.link !== undefined && d.link.startsWith("video:")) {
          if (Object.keys(erroneousLinks).includes(d.link)) {
            // if (d.link.includes("second_stage_vacuum")) {
            count++;
            const shouldBe = erroneousLinks[d.link];
            d.link = shouldBe;
            d.LastUpdated = new Date().getTime();
            console.log(
              "Should fix Notification with langId:",
              d.id,
              getLangId(d.langId)
            );
            // dbClient.upsertDoc('notifications', d).then(() => {
            //     console.log("Fixed notification:", d.id);
            // });
          }
        }
      });
      res();
    });
  });

/*
 * Check which screens uses wrong video
 */
const checkScreens = () =>
  new Promise((res, rej) => {
    const erroneousTextsOld = {
      "how to diagnose": "how_to_diagnose",
      "management of hypertension": "management_of_hypertension",
      "severe preeclampsia eclampsia": "severe_preeclampsia_eclampsia",
    };
    const erroneousTexts = {
      first_stage_active_phase: "1st_stage_active_phase",
      first_stage_latent_phase: "1st_stage_latent_phase",
      second_stage_prolonged: "2nd_stage_prolonged",
      second_stage_vacuum_extraction: "2nd_stage_vacuum_extraction",
    };
    const errKeys = Object.keys(erroneousTexts);
    console.log("Checking screen texts:");
    dbClient.queryDocs("screens", {}).then((docs) => {
      let count = 0;
      docs.map((d) => {
        if (d.key !== undefined && d.key.startsWith("video:")) {
          for (const errText of errKeys) {
            if (d.key.endsWith(errText)) {
              // if (d.key.startsWith("second_stage_vacuum")) {
              d.key = d.key.replace(errText, erroneousTexts[errText]);
              d.content = d.content.replace(errText, erroneousTexts[errText]);
              if (d.adapted !== undefined && d.adapted.endsWith(errText)) {
                d.adapted = d.adapted.replace(errText, erroneousTexts[errText]);
              }
              if (
                d.translated !== undefined &&
                d.translated.endsWith(errText)
              ) {
                d.translated = d.translated.replace(
                  errText,
                  erroneousTexts[errText]
                );
              }
              d.LastUpdated = new Date().getTime();
              console.log("Should fix this screen:", d.id, getLangId(d.langId));
              // dbClient.upsertDoc('screens', d).then(() => {
              //     console.log("Fixed screen:", d.id);
              // });
              continue;
            }
          }
        }
      });
      res();
    });
  });

/*
 * Check which modules use the wrong video:
 */
const checkModules = () =>
  new Promise((res, rej) => {
    console.log("Checking modules:");
    dbClient.queryDocs("modules", {}).then((docs) => {
      let count = 0;
      docs.map((d) => {
        let shouldUpdate = false;
        if (d.videos !== undefined) {
          d.videos = d.videos.map((video) => {
            // if (video.includes("second_stage_vacuum")) {
            if (Object.keys(erroneousFiles).includes(video)) {
              shouldUpdate = true;
              count++;
              return erroneousFiles[video];
            } else {
              return video;
            }
          });
        }
        if (shouldUpdate) {
          d.LastUpdated = new Date().getTime();
          console.log(
            "Should fixing module with langId:",
            d.id,
            getLangId(d.langId)
          );
          // dbClient.upsertDoc('modules', d).then(() => {
          //     console.log("Fixed module:", d.id);
          // });
        }
      });
      res();
    });
  });

// Run everything
checkKLPs().then(checkModules).then(checkScreens).then(checkNotifications);
// showWrongVideoFiles();
