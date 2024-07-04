import {
  contentURL,
  createBlockBlobFromBuffer,
  getBlockBlobToBuffer,
} from "../lib/blobstorage";
import { upsert as upsertLang } from "../api/languages/languages.model";
import { list as listScreens } from "../api/screens/screens.model";
import {
  list as listAbout,
  sections as aboutSections,
} from "../api/about/about.model";
import {
  listImages,
  listVideos,
  videoScreenKey,
} from "../api/assets/assets.model";
import {
  insert,
  list as listModules,
  screenKey as moduleScreenKey,
} from "../api/modules/modules.model";
import {
  list as listDrugs,
  screenKey as drugScreenKey,
} from "../api/drugs/drugs.model";
import { list as listOnboardings } from "../api/onboarding/onboarding.model";
import { list as listCertificates } from "../api/certificates/certificates.model";
import { list as listNotifications } from "../api/notifications/notifications.model";
import { keyLearningPointsModel } from "../api/key-learning-points/key-learning-points.model";
import { casesModel } from "../api/cases/cases.model";
import { runMappingsUpdate } from "../api/pub/updateMappings";
import { actionCardsModel } from "../api/action-cards/action-cards.model";
import { proceduresModel } from "../api/procedures/procedures.model";
import { httpRequest } from "./httpUtil";
import log from "../config/logging";


const Parallel = require("async-parallel");

import { chapterScreenKey } from "./chapters";

import { docToHtml } from "./richdocument";
import config from "../config";

import ZipExporter from "./zipexporter";
import { publishLangLegacy } from "./publisherLegacy";
import { getModuleCategories } from "../api/module-categories/module-categories.model";

const https = require('https'); 
const fs = require('fs');
// const axios = require('axios');









export const publishIndex = (version, langs1, exporter, draft) => {
  const langs = [...langs1];

  const prop = draft ? "draftLastPublished" : "lastPublished";
  const index = {
    version: version,
    languages: langs
      .filter((lang) => lang[prop])
      .map((lang) => ({
        id: lang.id,
        countryCode: lang.countryCode,
        latitude: lang.latitude,
        longitude: lang.longitude,
        description: lang.description,
        version: lang.version,
        href: contentURL(`${lang.id}/bundle.json`, draft),
        hrefZip: contentURL(`${lang.id}/bundle.zip`, draft),
      })),
  };
  


main();



  // fetchContentBundle('ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3', true);
  // fetchmodulecategory(true);
  // filterModulesByCategory('ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3', true, 'b08c23ad-1e01-2d12-102b-ad6706e7358a');


  

  return exporter("index.json", JSON.stringify(index));
};

export const publishModule = (screenMap, modul, refs) => {
  const iconAlt = `${modul.icon}_alt`;

  const m = {
    id: modul.key,
    version: modul.LastUpdated,
    icon: modul.icon,
    iconAlt: iconAlt,
    description: screenMap.get(moduleScreenKey(modul.key)),
    actionCards: modul.actionCards,
    procedures: modul.procedures,
    keyLearningPoints: modul.keyLearningPoints,
    videos: modul.videos,
    drugs: modul.drugs,
  };
  refs.images.add(modul.icon);
  refs.images.add(iconAlt);

  modul.procedures.forEach((p) => refs.procedures.add(p));
  modul.actionCards.forEach((p) => refs.actionCards.add(p));
  modul.keyLearningPoints.forEach((klp) => refs.keyLearningPoints.add(klp));
  modul.videos.forEach((v) => refs.videos.add(v));

  return m;
  // return exporter(`${lang.id}/modules/${module.key}.json`, JSON.stringify(m));
};

const publishModules = async (screenMap, lang, refs) => {
  const modules = await listModules(lang.id);
  const translatedModules = modules.filter((m) => m.id);
  return translatedModules.map((modul) =>
    publishModule(screenMap, modul, refs)
  );
};

class RichDocumentPublisher {
  constructor(model) {
    this.model = model;
  }

  docPath(doc) {
    return `${this.model.docTypePlural}/${doc.key}.json`;
  }

  publishChapter(screens, chapter, refs) {
    return {
      id: chapter.key,
      description: screens.get(chapterScreenKey(chapter.key)),
      content: docToHtml(chapter, refs),
    };
  }

  publishDoc(screens, doc, refs) {
    const d = {
      id: doc.key,
      version: doc.LastUpdated,
      icon: doc.icon,
      description: screens.get(this.model.screenKey(doc.key)),
      chapters: (doc.chapters || []).map((chapter) =>
        this.publishChapter(screens, chapter, refs)
      ),
    };
    refs.images.add(doc.icon);
    return d;
  }

  async publishDocuments(screens, lang, docs, refs) {
    const ds = await this.model.list(lang.id);
    const referencedDocs = new Set(docs);
    const translatedDocs = ds.filter((d) => referencedDocs.has(d.key));
    return translatedDocs.map((doc) => this.publishDoc(screens, doc, refs));
  }
}

const publishDrug = (screens, drug, refs) => {
  return {
    id: drug.key,
    version: drug.LastUpdated,
    description: screens.get(drugScreenKey(drug.key)),
    content: docToHtml(drug, refs),
  };
};

const publishDrugs = async (screens, lang, refs) => {
  const ds = await listDrugs(lang.id);
  return ds.map((drug) => publishDrug(screens, drug, refs));
};

const publishOnboarding = async (lang) => {
  const onboardingScreens = await listOnboardings(lang.id);
  return Promise.all(
    onboardingScreens.map(async (onboardingScreen) => {
      return {
        id: onboardingScreen.key,
        version: onboardingScreen.LastUpdated,
        question: onboardingScreen.question.translated,
        answers: onboardingScreen.answers.map((a) => a.translated),
      };
    })
  );
};

const publishAnswer = (a) => {
  const result = a.result;
  const correct = result ? result === "correct" : a.correct;
  return {
    value: a.value.translated,
    correct: correct,
    result: result,
  };
};

const publishQuestion = (q, refs) => {
  const d = {
    id: q.key,
    question: q.question.translated,
    quizzType: q.quizzType,
    image: q.image,
    showToggle: q.showToggle || false,
    link: q.link,
    essential: q.essential || false,
    description: q.description.translated.trim(),
    answers: q.answers
      .filter((a) => a.value.translated)
      .map((a) => publishAnswer(a)),
  };

  if (q.image && !refs.images.has(q.image)) {
    refs.imagesLearningPlatform.add(q.image);
  }

  return d;
};

const publishKLP = (klp, refs) => {
  return {
    id: klp.key,
    version: klp.LastUpdated,
    level: klp.level,
    description: klp.description,
    title: klp.title,
    questions: klp.questions.map((q) => publishQuestion(q, refs)),
  };
};

const publishKeyLearningPoints = async (lang, klps, refs) => {
  // Do nothing if Learning Platform is disabled
  if (!lang.learningPlatform) {
    return [];
  }

  const allKLPS = await keyLearningPointsModel.list(lang.id);
  const referencedKLPS = new Set(klps);
  const translatedKLPS = allKLPS.filter((klp) => referencedKLPS.has(klp.key));

  return translatedKLPS.map((klp) => publishKLP(klp, refs));
};

const publishCase = (caze, refs) => {
  const d = {
    id: caze.key,
    version: caze.LastUpdated,
    description: caze.description,
    title: caze.title,
    image: caze.image,
    order: caze.sortOrder,
    questions: caze.questions.map((q) => publishQuestion(q, refs)),
  };
  if (caze.image && !refs.images.has(caze.image)) {
    refs.imagesLearningPlatform.add(caze.image);
  }

  return d;
};

const publishCertificate = (casesMap, cert, refs) => {
  const cases = cert.cases.map((c) => publishCase(casesMap.get(c), refs));
  cases.sort((a, b) => (a.order || 1e20) - (b.order || 1e20));
  const casesVersion = cases.reduce((acc, c) => Math.max(acc, c.version), 0);
  return {
    id: cert.key,
    version: Math.max(cert.LastUpdated, casesVersion),
    description: cert.description,
    content: docToHtml(cert, refs),
    deadly: cert.deadly,
    passRate: cert.passRate,
    cases: cases,
  };
};

const publishCertificates = async (cases, lang, refs) => {
  // Do nothing if Learning Platform is disabled
  if (!lang.learningPlatform) {
    return [];
  }

  const certs = await listCertificates(lang.id);
  return certs.map((cert) => publishCertificate(cases, cert, refs));
};

const publishNotifications = async (lang) => {
  const ns = await listNotifications(lang.id);
  return ns.map((n) => ({
    id: n.key,
    shortDescription: n.translated.shortDescription,
    longDescription: n.translated.longDescription,
    link: n.link,
  }));
};

const publishScreens = (screens) => {
  let m = {};
  screens.forEach((s) => {
    m[s.key] = s.translated || s.adapted;
  });
  return m;
};

const publishImages = async (lang, refs) => {
  const images = [...refs.images];
  const imagesLP = [...refs.imagesLearningPlatform];
  const allImages = await listImages(lang.assetVersion);
  const imageMap = new Map(allImages.map((i) => [i.key, i]));

  const formatImages = (imageKey) => {
    const image = imageMap.get(imageKey);
    if (!image) {
      refs.msgs.push(`Missing image '${imageKey}'`);
    }

    return {
      id: imageKey,
      src: image ? image.href : undefined,
      version: image ? image.lastModified : undefined,
    };
  };

  let imagesFormatted = images.map(formatImages).concat([...refs.thumbnails]);
  let imagesLPFormatted = imagesLP.map(formatImages);

  return {
    images: imagesFormatted,
    imagesLearningPlatform: imagesLPFormatted,
  };
};

const publishVideos = async (screens, refs) => {
  const videos = [...refs.videos];
  const allVideos = await listVideos();
  const videoMap = new Map(allVideos.map((v) => [v.key, v]));
  return videos.map((videoKey) => {
    const video = videoMap.get(videoKey);
    let icon = undefined;

    if (!video) {
      refs.msgs.push(`Missing video '${videoKey}'`);
    } else if (video.icon) {
      refs.thumbnails.add({
        id: videoKey,
        src: video.icon,
        version: video.iconLastModified,
      });
      icon = videoKey;
    }
    return {
      id: videoKey,
      src: video ? video.href : undefined,
      icon: icon,
      description: screens.get(videoScreenKey(videoKey)),
      version: video ? video.lastModified : undefined,
    };
  });
};

const publishSection = (doc, refs) => {
  const section = {
    id: doc.section,
    version: doc.LastUpdated,
    description: doc.section,
    icon: "icon2",
    chapters: (doc.chapters || []).map((chapter) => ({
      description: doc.section,
      content: docToHtml(chapter, refs),
    })),
  };

  return section;
  // return exporter(`${lang.id}/about/${doc.section}.json`, JSON.stringify(section));
};

const publishAbout = async (lang, refs) => {
  const sections = await Promise.all(
    aboutSections.map((section) => listAbout(lang.id, section))
  );
  // Flatten result
  const aboutDocs = [].concat(...sections);
  return aboutDocs.map((doc) => publishSection(doc, refs));
};

async function exportImageList(lang, images, exporter, draft, zipName) {
  log.debug(`Collecting and adding images for ${zipName}`);
  const zipExporter = new ZipExporter(lang.id + "/", exporter);
  const imageSources = images.filter((image) => image.src);
  log.debug(`Adding ${imageSources.length} images to zip...`);
  await Parallel.map(
    imageSources,
    async (image) => zipExporter.addAsset(image.src),
    { concurrency: 5 }
  );
  log.debug("Creating zip");
  const buf = await zipExporter.toBuffer();
  log.debug(`Saving ${zipName}.zip on blob store.`);
  await createBlockBlobFromBuffer(draft)(
    `${lang.id}/${zipName}.zip`,
    buf,
    "application/zip"
  );
}

/**
 * This is the main function which published the language. It calls
 * all the above code collecting the various parts that make up a
 * language.
 */
const publishLang = async (version, lang, textExporter, user, draft) => {
  let references = {
    images: new Set(),
    imagesLearningPlatform: new Set(),
    thumbnails: new Set(),
    videos: new Set(),
    procedures: new Set(),
    actionCards: new Set(),
    keyLearningPoints: new Set(),
    certificates: new Set(),
    msgs: [],
  };

  const videoDuration = (draft) => {
    // draft = draft || config.env == "dev";

    draft = false; // Always update released videos durations

    var options = {
      host: config.durationService.host,
      path: "/trigger?draft=" + draft,
      port: config.durationService.port,
      headers: { "x-sda-auth": config.durationService.apiKey },
    };
    return httpRequest(options);
  };

  // const videoDurationPromise = videoDuration(draft);

  const allScreens = await listScreens(lang.id);
  const allCases = await casesModel.list(lang.id, "", true);

  // Only publish screens not used to translate other types of content
  const screens = publishScreens(
    allScreens.filter(
      (s) =>
        s.key.includes("upq:") ||
        s.key.includes("lp:") ||
        s.key.includes("onb:") ||
        s.key.includes("ufq:") ||
        !s.key.includes(":")
    )
  );

  const screensMap = new Map(
    allScreens.map((s) => [s.key, s.translated || s.adapted])
  );
  const casesMap = new Map(allCases.map((c) => [c.key, c]));

  const about = await publishAbout(lang, references);
  const modules = await publishModules(screensMap, lang, references);
  const procedures = await new RichDocumentPublisher(
    proceduresModel
  ).publishDocuments(screensMap, lang, references.procedures, references);
  const actionCards = await new RichDocumentPublisher(
    actionCardsModel
  ).publishDocuments(screensMap, lang, references.actionCards, references);
  const drugs = await publishDrugs(screensMap, lang, references);
  const onboarding = await publishOnboarding(lang);
  const keyLearningPoints = await publishKeyLearningPoints(
    lang,
    references.keyLearningPoints,
    references
  );
  const certificates = await publishCertificates(casesMap, lang, references);

  const videos = await publishVideos(screensMap, references);
  const { images, imagesLearningPlatform } = await publishImages(
    lang,
    references
  );
  const allImages = [...images, ...imagesLearningPlatform];

  const notifications = await publishNotifications(lang);

  const updatedLang = draft
    ? { ...lang, draftLastPublished: Date.now(), draftVersion: version }
    : { ...lang, lastPublished: Date.now(), version: version };
  const bundle = {
    description: lang.description,
    learningPlatform: lang.learningPlatform,
    langId: lang.id,
    countryCode: lang.countryCode,
    latitude: lang.latitude,
    longitude: lang.longitude,
    version,
    screen: screens,
    about,
    videos,
    images: allImages,
    notifications,
    procedures,
    actionCards,
    modules,
    drugs,
    onboarding,
  };

  if (lang.learningPlatform) {
    bundle.keyLearningPoints = keyLearningPoints;
    bundle.certificates = certificates;
  }
  log.debug("All content collected");

  
  const bundleJson = JSON.stringify(bundle);
  await createBlockBlobFromBuffer(draft)(
    `${lang.id}/content-bundle.json`,
    Buffer.from(bundleJson, "utf8"),
    "application/json"
  );

  
  await exportImageList(lang, images, textExporter, draft, "image-bundle");
  await exportImageList(
    lang,
    imagesLearningPlatform,
    textExporter,
    draft,
    "image-learning-bundle"
  );

  log.debug("Everything written to blob store");

  await videoDuration();
  log.debug("Video duration done");

  // Update mappings
  await runMappingsUpdate();
  log.debug("Updated mappings");

  // Await legacy publish language
  await publishLangLegacy(version, lang, textExporter, user, draft);

  return upsertLang(user, updatedLang);
};

export const unpublishLang = (lang, user) => {
  const { lastPublished, ...updatedLang } = lang;
  return upsertLang(user, updatedLang);
};

export const publisher = async (langId, ls, exporter, user, draft) => {
  // We need to keep legacy publish

  const langs = await ls;
  const publishPromises = langs.map((lang) => {
    const nextVersion = Math.max(lang.draftVersion || 0, lang.version || 0) + 1;
    return langId && langId === lang.id
      ? publishLang(nextVersion, lang, exporter, user, draft)
      : Promise.resolve(lang);
  });

  const languages = await Promise.all(publishPromises);
  const index = await publishIndex(Date.now(), languages, exporter, draft);
  
  return { index, languages };
};

export const unpublisher = (langId, ls, exporter, user) => {
  const publishedLangs = ls.then((langs) => {
    return Promise.all(
      langs.map((lang) => {
        return langId && langId === lang.id
          ? unpublishLang(lang, user)
          : Promise.resolve(lang);
      })
    );
  });

  return Promise.all([ls, publishedLangs]).then((ps) => {
    const pubLangs = ps[1];
    return publishIndex(Date.now(), pubLangs, exporter, false).then((index) =>
      JSON.stringify({
        index: index,
        languages: pubLangs,
      })
    );
  });
};

export const getModuleCategoryVersion = async () => {
  const blobBuffer = await getBlockBlobToBuffer(
    "assets/module_categories.json"
  );
  const categories = JSON.parse(blobBuffer.toString());
  return categories.version;
};

export const publishModuleCategory = async (user) => {
  console.log("Received request to publish module categories: ", user);
  const moduleCategories = await getModuleCategories();
  const version = await getModuleCategoryVersion();
  console.log("Version : ", version);
  await createBlockBlobFromBuffer(false)(
    "assets/module_categories.json",
    Buffer.from(
      JSON.stringify({
        version: version + 1,
        date: new Date(),
        categories: moduleCategories,
      }),
      "utf8"
    ),
    "application/json"
  );
};



const contentURL1 = (path, draft) => {
  const basePath = draft ? 'localcontent' : 'release';
  return `${basePath}/${path}`;
}



const fetchContentBundle = (lang, draft) => {
  const baseURL = 'https://sdacms.blob.core.windows.net';
  const path = contentURL1(`${lang}/content-bundle.json`, draft);
  // const hrefZip= contentURL1(`${lang.id}/bundle.zip`, draft);

  const fullURL = `${baseURL}/${path}`;
  // const fullURL1 = `${baseURL}/${hrefZip}`;


  console.log('Fetching content bundle from:', fullURL); 
  // console.log('Fetching bundle.zip:', fullURL1); // Log the full URL for debugging


  return new Promise((resolve, reject) => {
    https.get(fullURL, (res) => {
      let data = '';

      
      res.on('data', (chunk) => {
        data += chunk;
      });

      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (err) {
          console.error('Failed to parse content bundle:', err);
          reject(err);
        }
      });
    }).on('error', (err) => {
      console.error('Failed to fetch content bundle:', err);
      reject(err);
    });
  });
};

const fetchModuleCategory = (draft) => {
  const baseURL = 'https://sdacms.blob.core.windows.net';
  const path = contentURL1('assets/module_categories.json', draft);
  const fullURL = `${baseURL}/${path}`;

  console.log('Fetching module categories from:', fullURL); 

  return new Promise((resolve, reject) => {
    https.get(fullURL, (res) => {
      let data = '';

      
      res.on('data', (chunk) => {
        data += chunk;
      });

      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (err) {
          console.error('Failed to parse module category:', err);
          reject(err);
        }
      });
    }).on('error', (err) => {
      console.error('Failed to fetch module category:', err);
      reject(err);
    });
  });
};

// const categoryId = 'b08c23ad-1e01-2d12-102b-ad6706e7358a';

const filterModulesByCategory = async (lang, draft, categoryId) => {
  try {
    
    
    const moduleCategories = await fetchModuleCategory(draft);
    console.log("hiii",categoryId);

    
    const category = moduleCategories.categories.find(cat => cat.id === categoryId);

    if (!category) {
      console.error('Category not found');
      return null;
    }

    console.log('Found Category:', category);

    
    const contentBundle = await fetchContentBundle(lang, draft);

    
    if (!contentBundle.modules) {
      console.error('Content bundle does not contain a "modules" property.');
      return null;
    }

    
    const filteredModules = contentBundle.modules.filter(module => {
      return category.modules.includes(module.id);
    });

    filteredModules.forEach(module => {
      module.actionCardDetails = module.actionCards.map(actionCardId => {
        return contentBundle.actionCards.find(card => card.id === actionCardId);
      });

      module.drugDetails = module.drugs.map(drugId => {
        return contentBundle.drugs.find(drug => drug.id === drugId);
      });

      module.procedureDetails = module.procedures.map(procedureId => {
        return contentBundle.procedures.find(procedure => procedure.id === procedureId);
      });

      module.keyLearningPointDetails = module.keyLearningPoints.map(pointId => {
        return contentBundle.keyLearningPoints.find(point => point.id === pointId);
      });

      module.videoDetails = module.videos.map(videoId => {
        return contentBundle.videos.find(video => video.id === videoId);
      });
    });

    return { category, modules: filteredModules };
  } catch (error) {
    console.error('Error filtering modules by category:', error);
    return null;
  }
};


const JSZip = require('jszip');

// const downloadImage = (relativePath) => {
//   const baseUrl = 'https://sdacms.blob.core.windows.net/content/assets/images/india'; 
//   const imageUrl = `${baseUrl}${relativePath}`; 
//   console.log(imageUrl);

//   return new Promise((resolve, reject) => {
//     const request = https.get(imageUrl, (response) => {
//       if (response.statusCode !== 200) {
//         if (response.statusCode === 404) {
//           console.log(`Image not found: ${imageUrl}`);
//           resolve(null); // Skip this image
//         } else {
//           reject(new Error(`Failed to download image ${imageUrl}: Status code ${response.statusCode}`));
//         }
//         return;
//       }

//       let data = [];
//       response.on('data', (chunk) => {
//         data.push(chunk);
//       });

//       response.on('end', () => {
//         resolve(Buffer.concat(data));
//       });
//     }).on('error', (err) => {
//       console.error(`Failed to download image ${imageUrl}:`, err);
//       reject(err);
//     });

    
//     request.setTimeout(10000, () => {
//       request.abort();
//       reject(new Error(`Download timed out for image ${imageUrl}`));
//     });
//   });
// };

const downloadImage = (relativePath, langId, timeoutDuration = 30000, retries = 3) => {
  // const baseUrl = 'https://sdacms.blob.core.windows.net/content/assets/images/india';
  // const imageUrl = `${baseUrl}${relativePath}`;
  // console.log(imageUrl);
  if((langId=='ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3')||(langId=='22118d52-0d78-431d-b1ba-545ee63017ca')){
    var baseUrl = 'https://sdacms.blob.core.windows.net/content/assets/images/india';
    }else if((langId=='da5137d1-8492-4312-b444-8e4d4949a3c7')||(langId=='dc40648b-0a77-446b-b11b-e0aa17aed697')){
    var baseUrl = 'https://sdacms.blob.core.windows.net/content/assets/images/africa';
    }else{
    var baseUrl = 'https://sdacms.blob.core.windows.net/content/assets/images/africa';
    }
    const imageUrl = `${baseUrl}${relativePath}`;
    console.log(imageUrl);
  

  return new Promise((resolve, reject) => {
    const attemptDownload = (attempt) => {
      const request = https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          if (response.statusCode === 404) {
            console.log(`Image not found: ${imageUrl}`);
            resolve(null); 
          } else {
            reject(new Error(`Failed to download image ${imageUrl}: Status code ${response.statusCode}`));
          }
          return;
        }

        let data = [];
        response.on('data', (chunk) => {
          data.push(chunk);
        });

        response.on('end', () => {
          resolve(Buffer.concat(data));
        });
      }).on('error', (err) => {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; 
          console.log(`Attempt ${attempt} failed. Retrying in ${delay} ms...`);
          setTimeout(() => attemptDownload(attempt + 1), delay);
        } else {
          console.error(`Failed to download image ${imageUrl}:`, err);
          reject(err);
        }
      });

      request.setTimeout(timeoutDuration, () => {
        request.abort();
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; 
          console.log(`Download timed out for image ${imageUrl}. Retrying in ${delay} ms...`);
          setTimeout(() => attemptDownload(attempt + 1), delay);
        } else {
          reject(new Error(`Download timed out for image ${imageUrl} after ${retries} attempts`));
        }
      });
    };

    attemptDownload(1);
  });
};

const createImageZip = async (contentFilePath, zipFilePath, langId) => {
  try {
    const content = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'));
    const modules = content.module || [];

    const images = [];
    modules.forEach(module => {
      console.log('Processing module:', module.moduleId);
      


      
        // if (category && category.icon) {
        //   let iconPath = category.icon;
        //   if (!iconPath.endsWith('.png')) {
        //     iconPath += '.png';
        //   }
        //   images.push(iconPath);
        //   console.log('Found category icon:', iconPath);
        // }
      
        // Check if modules exist and iterate through each module to find its icon
        
        if (module.icon) {
          
              let iconPath = module.icon;
              if (!iconPath.endsWith('.png')) {
                iconPath += '.png';
              }
              images.push(iconPath);
              console.log('Found module icon:', iconPath);
            } else {
              console.log('No icon found for module');
            }
          
   
        
        

    if (module.actionCardDetails) {
        module.actionCardDetails.forEach(card => {
          if (card && card.icon) {
            let iconPath = card.icon;
            if (!iconPath.endsWith('.png')) {
              iconPath += '.png';
            }
            images.push(iconPath);
            console.log('Found action card image:', iconPath);
          }
        });
      }

      if (module.videoDetails) {
        module.videoDetails.forEach(video => {
          if (video && video.thumbnail) {
            let thumbnailPath = video.thumbnail;
            if (!thumbnailPath.endsWith('.png')) {
              thumbnailPath += '.png';
            }
            images.push(thumbnailPath);
            console.log('Found video thumbnail:', thumbnailPath);
          }
        });
      }

      if (module.procedureDetails) {
        module.procedureDetails.forEach(procedure => {
          if (procedure && procedure.icon) {
            let iconPath = procedure.icon;
            if (!iconPath.endsWith('.png')) {
              iconPath += '.png';
            }
            images.push(iconPath);
            console.log('Found procedure icon:', iconPath);
          }
          if (procedure.chapters) {
            procedure.chapters.forEach(chapter => {
              const matches = chapter.content.match(/<img src="(\/richtext\/[^"]+)"/g);
              if (matches) {
                matches.forEach(match => {
                  let imagePath = match.replace('<img src="', '').replace('"', '');
                  if (!imagePath.endsWith('.png')) {
                    imagePath += '.png';
                  }
                  images.push(imagePath);
                  console.log('Found procedure chapter image:', imagePath);
                });
              }
            });
          }
        });
      }

      if (module.keyLearningPointDetails) {
        module.keyLearningPointDetails.forEach(point => {
          if (point && point.questions) {
            point.questions.forEach(question => {
              if (question && question.image) {
                let imagePath = question.image;
                if (!imagePath.endsWith('.png')) {
                  imagePath += '.png';
                }
                images.push(imagePath);
                console.log('Found key learning point image:', imagePath);
              }
            });
          }
        });
      }
    });

    if (images.length === 0) {
      console.log('No images found in the content.');
    }

    const zip = new JSZip();
    const downloadPromises = images.map(async (imageUrl) => {
      try {
        const imageData = await downloadImage(imageUrl, langId);
        if (imageData) {
          const imageName = imageUrl.split('/').pop();
          zip.file(imageName, imageData, { binary: true });
        }
      } catch (error) {
        console.error(`Error downloading or adding image ${imageUrl} to zip:`, error);
      }
    });

    await Promise.all(downloadPromises);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(zipFilePath, zipContent);
    console.log('Zip file created successfully:', zipFilePath);
    return zipFilePath;
  } catch (error) {
    console.error('Error creating image zip:', error);
  }
};

module.exports = {
  createImageZip,
  downloadImage,
};


const { URL } = require('url');

function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
}

const downloadVideo = (videoUrl, timeoutDuration = 30000, retries = 3) => {
  console.log('Downloading video:', videoUrl);

  return new Promise((resolve, reject) => {
    const attemptDownload = (attempt) => {
      if (!isValidUrl(videoUrl)) {
        return reject(new Error(`Invalid URL: ${videoUrl}`));
      }

      const request = https.get(videoUrl, (response) => {
        if (response.statusCode !== 200) {
          if (response.statusCode === 404) {
            console.log(`Video not found: ${videoUrl}`);
            resolve(null); 
          } else {
            reject(new Error(`Failed to download video ${videoUrl}: Status code ${response.statusCode}`));
          }
          return;
        }

        let data = [];
        response.on('data', (chunk) => {
          data.push(chunk);
        });

        response.on('end', () => {
          resolve(Buffer.concat(data));
        });
      }).on('error', (err) => {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; 
          console.log(`Attempt ${attempt} failed. Retrying in ${delay} ms...`);
          setTimeout(() => attemptDownload(attempt + 1), delay);
        } else {
          console.error(`Failed to download video ${videoUrl}:`, err);
          reject(err);
        }
      });

      request.setTimeout(timeoutDuration, () => {
        request.abort();
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; 
          console.log(`Download timed out for video ${videoUrl}. Retrying in ${delay} ms...`);
          setTimeout(() => attemptDownload(attempt + 1), delay);
        } else {
          reject(new Error(`Download timed out for video ${videoUrl} after ${retries} attempts`));
        }
      });
    };

    attemptDownload(1);
  });
};

const createVideoZip = async (contentFilePath, zipFilePath) => {
  try {
    const content = JSON.parse(fs.readFileSync(contentFilePath, 'utf-8'));
    const modules = content.module || [];

    const videos = [];
    modules.forEach(module => {
      console.log('Processing module:', module.moduleId);

      if (module.actionCardDetails) {
        module.actionCardDetails.forEach(card => {
          if (card && card.link) {
            let videoPath = extractVideoPath(card.link);
            videos.push(videoPath);
            console.log('Found action card video:', videoPath);
          }
        });
      }

      if (module.videoDetails) {
        module.videoDetails.forEach(video => {
          if (video && video.link) {
            let videoPath = extractVideoPath(video.link);
            videos.push(videoPath);
            console.log('Found video thumbnail:', videoPath);
          }
        });
      }

      if (module.procedureDetails) {
        module.procedureDetails.forEach(procedure => {
          if (procedure && procedure.link) {
            let videoPath = extractVideoPath(procedure.link);
            videos.push(videoPath);
            console.log('Found procedure icon:', videoPath);
          }
          if (procedure.chapters) {
            procedure.chapters.forEach(chapter => {
              const matches = chapter.content.match(/<img src="(\/richtext\/[^"]+)"/g);
              if (matches) {
                matches.forEach(match => {
                  let imagePath = match.replace('<img src="', '').replace('"', '');
                  videos.push(imagePath);
                  console.log('Found procedure chapter image:', imagePath);
                });
              }
            });
          }
        });
      }

      if (module.keyLearningPointDetails) {
        module.keyLearningPointDetails.forEach(point => {
          if (point && point.questions) {
            point.questions.forEach(question => {
              if (question && question.link) {
                let videoPath = extractVideoPath(question.link);
                videos.push(videoPath);
                console.log('Found key learning point video:', videoPath);
              }
            });
          }
        });
      }
    });

    if (videos.length === 0) {
      console.log('No videos found in the content.');
      return;
    }

    const zip = new JSZip();
    const downloadPromises = videos.map(async (videoUrl) => {
      try {
        const videoData = await downloadVideo(videoUrl);
        if (videoData) {
          console.log(videoUrl);
          const videoName = videoUrl.split('/').pop();
          zip.file(videoName, videoData, { binary: true });
        }
      } catch (error) {
        console.error(`Error downloading or adding video ${videoUrl} to zip:`, error);
      }
    });

    await Promise.all(downloadPromises);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(zipFilePath, zipContent);
    console.log('Zip file created successfully:', zipFilePath);
    return zipFilePath;
  } catch (error) {
    console.error('Error creating video zip:', error);
  }
};

const extractVideoPath = (link) => {
  const videoPrefix = 'video:/';
  const richtextPrefix = '/richtext/';
  if (link.startsWith(videoPrefix)) {
    return `https://sdacms.blob.core.windows.net/content/assets/videos/english WHO/${link.substr(videoPrefix.length)}.mp4`;
  } else if (link.startsWith(richtextPrefix)) {
    return `https://yourdomain.com${link}`; 
  }
  return link;
};

module.exports = {
  createVideoZip,
  extractVideoPath,
  downloadVideo,
  isValidUrl
};


const main = async (categoryId,langId) => {
  // const lang = 'ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3';
  const lang=langId;
  const draft = true;

  const result = await filterModulesByCategory(lang, draft, categoryId);

  if (result) {
    const output = {
      category: result.category,
      module: result.modules.map(module => ({
        moduleId: module.id,
        icon:module.icon,
        actionCardDetails: module.actionCardDetails,
        drugDetails: module.drugDetails,
        procedureDetails: module.procedureDetails,
        keyLearningPointDetails: module.keyLearningPointDetails,
        videoDetails: module.videoDetails
      }))
    };

    const fileName = 'content_bundle_module_category.json';
    fs.writeFileSync(fileName, JSON.stringify(output, null, 2), 'utf-8');
    console.log('The details have been written to content_bundle_module_category.json');

    
    // await createImageZip(fileName, 'category-wise-image-bundle1.zip');
    return fileName;
  }
};

const main1 = async (categoryId,langId) => {
  // const lang = 'ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3';
  const lang=langId;
  const draft = true;

  const result = await filterModulesByCategory(lang, draft, categoryId);

  if (result) {
    const output = {
      category: result.category,
      module: result.modules.map(module => ({
        moduleId: module.id,
        icon: module.icon,
        actionCardDetails: module.actionCardDetails,
        drugDetails: module.drugDetails,
        procedureDetails: module.procedureDetails,
        keyLearningPointDetails: module.keyLearningPointDetails,
        videoDetails: module.videoDetails
      }))
    };

    const fileName = 'content_bundle_module_category.json';
    fs.writeFileSync(fileName, JSON.stringify(output, null, 2), 'utf-8');
    console.log('The details have been written to content_bundle_module_category.json');

    
    const zipfile=await createImageZip(fileName, 'sda-category-wise-image-bundle.zip',langId);
    return zipfile;
  }
};


const main2 = async (categoryId,langId) => {
  // const lang = 'ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3';
  const lang=langId;
  const draft = true;

  const result = await filterModulesByCategory(lang, draft, categoryId);

  if (result) {
    const output = {
      category: result.category,
      module: result.modules.map(module => ({
        moduleId: module.id,
        actionCardDetails: module.actionCardDetails,
        drugDetails: module.drugDetails,
        procedureDetails: module.procedureDetails,
        keyLearningPointDetails: module.keyLearningPointDetails,
        videoDetails: module.videoDetails
      }))
    };

    const fileName = 'content_bundle_module_category.json';
    fs.writeFileSync(fileName, JSON.stringify(output, null, 2), 'utf-8');
    console.log('The details have been written to content_bundle_module_category.json');

    
    const zipfile=await createVideoZip(fileName, 'category-wise-video-bundle.zip');
    return zipfile;
  }
};
const publiss = async (categoryId,langId) => {
  const filename = await main(categoryId,langId);
  return filename;
};

const publiss1 = async (categoryId,langId) => {
  const filename = await main1(categoryId,langId);
  return filename;
};

const publiss2 = async (categoryId,langId) => {
  const filename = await main2(categoryId,langId);
  return filename;
};

module.exports = { main, publiss,main1, publiss1, main2, publiss2,publisher,publishModuleCategory,getModuleCategoryVersion};













