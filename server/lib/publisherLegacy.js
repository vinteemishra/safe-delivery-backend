import { createBlockBlobFromBuffer } from "../lib/blobstorage";
import { upsert as upsertLang } from "../api/languages/languages.model";
import { list as listScreens } from "../api/screens/screens.model";
import { list as listAbout, sections } from "../api/about/about.model";
import {
  listImages,
  listVideos,
  videoScreenKey,
} from "../api/assets/assets.model";
import {
  list as listModules,
  screenKey as moduleScreenKey,
} from "../api/modules/modules.model";
import {
  list as listDrugs,
  screenKey as drugScreenKey,
} from "../api/drugs/drugs.model";
import { list as listCertificates } from "../api/certificates/certificates.model";
import { list as listNotifications } from "../api/notifications/notifications.model";
import { list as listOnboardings } from "../api/onboarding/onboarding.model";
import { keyLearningPointsModel } from "../api/key-learning-points/key-learning-points.model";
import { casesModel } from "../api/cases/cases.model";
import { actionCardsModel } from "../api/action-cards/action-cards.model";
import { proceduresModel } from "../api/procedures/procedures.model";
import { chapterScreenKey } from "./chapters";
import { docToHtml } from "./richdocument";
import ZipExporter from "./zipexporter";
const Parallel = require("async-parallel");

const publishModule = (lang, screens, module, exporter, refs) => {
  const iconAlt = `${module.icon}_alt`;

  const m = {
    id: module.key,
    version: module.LastUpdated,
    icon: module.icon,
    iconAlt: iconAlt,
    description: screens.get(moduleScreenKey(module.key)),
    actionCards: module.actionCards,
    procedures: module.procedures,
    keyLearningPoints: module.keyLearningPoints,
    videos: module.videos,
    drugs: module.drugs,
  };
  refs.images.add(module.icon);
  refs.images.add(iconAlt);

  module.procedures.forEach((p) => refs.procedures.add(p));
  module.actionCards.forEach((p) => refs.actionCards.add(p));
  module.keyLearningPoints.forEach((klp) => refs.keyLearningPoints.add(klp));
  module.videos.forEach((v) => refs.videos.add(v));

  return exporter(`${lang.id}/modules/${module.key}.json`, JSON.stringify(m));
};

const publishModules = (screensMap, lang, exporter, refs) => {
  return screensMap.then((screens) => {
    return listModules(lang.id).then((ms) => {
      const translatedModules = ms.filter((m) => m.id);
      return Promise.all(
        translatedModules.map((module) =>
          publishModule(lang, screens, module, exporter, refs)
        )
      ).then(() => {
        return translatedModules.map((m) => ({
          id: m.key,
          version: m.LastUpdated,
          href: `modules/${m.key}.json`,
        }));
      });
    });
  });
};

class RichDocumentPublisher {
  constructor(model) {
    this.model = model;
  }

  docPath(doc) {
    return `${this.model.docTypePlural}/${doc.key}.json`;
  }

  publishChapter(screens, chapter, refs) {
    const chap = {
      id: chapter.key,
      description: screens.get(chapterScreenKey(chapter.key)),
      content: docToHtml(chapter, refs),
    };
    return chap;
  }

  publishDoc(lang, screens, doc, exporter, refs) {
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

    return exporter(`${lang.id}/${this.docPath(doc)}`, JSON.stringify(d));
  }

  publishDocuments(screensMap, lang, docs, exporter, refs) {
    return screensMap.then((screens) => {
      return this.model.list(lang.id).then((ds) => {
        const referencedDocs = new Set(docs);
        const translatedDocs = ds.filter((d) => referencedDocs.has(d.key));
        return Promise.all(
          translatedDocs.map((doc) =>
            this.publishDoc(lang, screens, doc, exporter, refs)
          )
        ).then(() => {
          return translatedDocs.map((doc) => ({
            id: doc.key,
            version: doc.LastUpdated,
            href: this.docPath(doc),
          }));
        });
      });
    });
  }
}

const publishDrug = (lang, screens, drug, exporter, refs) => {
  const d = {
    id: drug.key,
    version: drug.LastUpdated,
    description: screens.get(drugScreenKey(drug.key)),
    content: docToHtml(drug, refs),
  };

  return exporter(`${lang.id}/drugs/${drug.key}.json`, JSON.stringify(d));
};

const publishDrugs = (screensMap, lang, exporter, refs) => {
  return screensMap.then((screens) => {
    return listDrugs(lang.id).then((ds) => {
      return Promise.all(
        ds.map((drug) => publishDrug(lang, screens, drug, exporter, refs))
      ).then(() => {
        return ds.map((p) => ({
          id: p.key,
          version: p.LastUpdated,
          href: `drugs/${p.key}.json`,
        }));
      });
    });
  });
};

const publishOnboarding = async (lang, exporter) => {
  const onboardingScreens = await listOnboardings(lang.id);

  const toPublish = await Promise.all(
    onboardingScreens.map(async (onboardingScreen) => {
      const d = {
        id: onboardingScreen.key,
        version: onboardingScreen.LastUpdated,
        question: onboardingScreen.question.translated,
        answers: onboardingScreen.answers.map((a) => a.translated),
      };
      const filePath = `onboarding/${onboardingScreen.key}.json`;
      await exporter(`${lang.id}/${filePath}`, JSON.stringify(d));
      return {
        id: onboardingScreen.key,
        version: onboardingScreen.LastUpdated,
        href: filePath,
      };
    })
  );

  return toPublish;
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

const publishQuestion = (lang, q, exporter, refs) => {
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

  q.image && refs.images.add(q.image);

  return d;
};

const publishKLP = (lang, klp, exporter, refs) => {
  const d = {
    id: klp.key,
    version: klp.LastUpdated,
    level: klp.level,
    description: klp.description,
    title: klp.title,
    questions: klp.questions.map((q) =>
      publishQuestion(lang, q, exporter, refs)
    ),
  };

  return exporter(
    `${lang.id}/keyLearningPoints/${klp.key}.json`,
    JSON.stringify(d)
  );
};

const publishKeyLearningPoints = (screensMap, lang, klps, exporter, refs) => {
  // Do nothing if Learning Platform is disabled
  if (!lang.learningPlatform) {
    return new Promise((resolve) => {
      resolve([]);
    });
  }

  return keyLearningPointsModel.list(lang.id).then((allKLPS) => {
    const referencedKLPS = new Set(klps);
    const translatedKLPS = allKLPS.filter((klp) => referencedKLPS.has(klp.key));

    return Promise.all(
      translatedKLPS.map((klp) => publishKLP(lang, klp, exporter, refs))
    ).then(() => {
      return translatedKLPS.map((klp) => ({
        id: klp.key,
        version: klp.LastUpdated,
        href: `keyLearningPoints/${klp.key}.json`,
      }));
    });
  });
};

const publishCase = (lang, caze, exporter, refs) => {
  const d = {
    id: caze.key,
    version: caze.LastUpdated,
    description: caze.description,
    title: caze.title,
    image: caze.image,
    order: caze.sortOrder,
    questions: caze.questions.map((q) =>
      publishQuestion(lang, q, exporter, refs)
    ),
  };
  caze.image && refs.images.add(caze.image);

  return d;
};

const publishCertificate = (casesMap, lang, cert, exporter, refs) => {
  const cases = cert.cases.map((c) =>
    publishCase(lang, casesMap.get(c), exporter, refs)
  );
  cases.sort((a, b) => (a.order || 1e20) - (b.order || 1e20));
  const casesVersion = cases.reduce((acc, c) => Math.max(acc, c.version), 0);
  const d = {
    id: cert.key,
    version: Math.max(cert.LastUpdated, casesVersion),
    description: cert.description,
    content: docToHtml(cert, refs),
    deadly: cert.deadly,
    passRate: cert.passRate,
    cases: cases,
  };

  return exporter(
    `${lang.id}/certificates/${cert.key}.json`,
    JSON.stringify(d)
  );
};

const publishCertificates = (casesMap, lang, exporter, refs) => {
  // Do nothing if Learning Platform is disabled
  if (!lang.learningPlatform) {
    return new Promise((resolve) => {
      resolve([]);
    });
  }

  return casesMap.then((cases) => {
    return listCertificates(lang.id).then((certs) => {
      console.log("CasesMap list:", certs);
      return Promise.all(
        certs.map((cert) =>
          publishCertificate(cases, lang, cert, exporter, refs)
        )
      ).then(() => {
        return certs.map((p) => ({
          id: p.key,
          version: p.LastUpdated,
          href: `certificates/${p.key}.json`,
        }));
      });
    });
  });
};

const publishNotifications = (lang, exporter, refs) => {
  return listNotifications(lang.id).then((ns) => {
    return ns.map((n) => ({
      id: n.key,
      shortDescription: n.translated.shortDescription,
      longDescription: n.translated.longDescription,
      link: n.link,
    }));
  });
};

const publishScreens = (screens) => {
  return screens.then((ss) => {
    let m = {};
    ss.forEach((s) => {
      m[s.key] = s.translated || s.adapted;
    });
    return m;
  });
};

const publishImages = (lang, images, refs) => {
  return listImages(lang.assetVersion).then((allImages) => {
    const imageMap = new Map(allImages.map((i) => [i.key, i]));
    let icons = images.map((imageKey) => {
      const image = imageMap.get(imageKey);
      if (!image) {
        refs.msgs.push(`Missing image '${imageKey}'`);
      }

      return {
        id: imageKey,
        src: image ? image.href : undefined,
        version: image ? image.lastModified : undefined,
      };
    });

    return icons.concat([...refs.thumbnails]);
  });
};

const publishVideos = (screensMap, lang, videos, refs) => {
  return screensMap.then((screens) => {
    return listVideos().then((allVideos) => {
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
    });
  });
};

const publishSection = (lang, doc, exporter, refs) => {
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

  return exporter(
    `${lang.id}/about/${doc.section}.json`,
    JSON.stringify(section)
  );
};

const publishAbout = (lang, exporter, refs) => {
  return Promise.all(
    sections.map((section) => listAbout(lang.id, section))
  ).then((r) => {
    const docs = [].concat(...r);

    return Promise.all(
      docs.map((doc) => publishSection(lang, doc, exporter, refs))
    ).then(() => {
      return docs.map((d) => {
        return {
          id: d.section,
          version: d.LastUpdated,
          href: `about/${d.section}.json`,
        };
      });
    });
  });
};

export const publishLangLegacy = (version, lang, textExporter, user, draft) => {
  let references = {
    images: new Set(),
    thumbnails: new Set(),
    videos: new Set(),
    procedures: new Set(),
    actionCards: new Set(),
    keyLearningPoints: new Set(),
    certificates: new Set(),
    msgs: [],
  };

  // const videoDuration = (draft) => {
  //   draft = draft || config.env == "dev";

  //   var options = {
  //     host: config.durationService.host,
  //     path: "/trigger?draft=" + draft,
  //     port: config.durationService.port,
  //     headers: { "x-sda-auth": config.durationService.apiKey }
  //   };
  //   return httpRequest(options);
  // };

  const zipExporter = new ZipExporter(lang.id + "/", textExporter);
  const exporter = zipExporter.addEntry.bind(zipExporter);

  const allScreens = listScreens(lang.id);
  const allCases = casesModel.list(lang.id, "", true);

  // Only publish screens not used to translate other types of content
  const screens = publishScreens(
    allScreens.then((screens) =>
      screens.filter(
        (s) =>
          s.key.includes("upq:") ||
          s.key.includes("lp:") ||
          s.key.includes("onb:") ||
          s.key.includes("ufq:") ||
          !s.key.includes(":")
      )
    )
  );

  const screensMap = allScreens.then(
    (screens) => new Map(screens.map((s) => [s.key, s.translated || s.adapted]))
  );
  const casesMap = allCases.then(
    (cases) => new Map(cases.map((c) => [c.key, c]))
  );

  const about = publishAbout(lang, exporter, references);
  const modules = publishModules(screensMap, lang, exporter, references);
  const procedures = modules.then(() =>
    new RichDocumentPublisher(proceduresModel).publishDocuments(
      screensMap,
      lang,
      references.procedures,
      exporter,
      references
    )
  );
  const actionCards = modules.then(() =>
    new RichDocumentPublisher(actionCardsModel).publishDocuments(
      screensMap,
      lang,
      references.actionCards,
      exporter,
      references
    )
  );
  const drugs = modules.then(() =>
    publishDrugs(screensMap, lang, exporter, references)
  );
  const onboarding = modules.then(() => publishOnboarding(lang, exporter));
  const keyLearningPoints = modules.then(() =>
    publishKeyLearningPoints(
      screensMap,
      lang,
      references.keyLearningPoints,
      exporter,
      references
    )
  );
  const certificates = modules.then(() =>
    publishCertificates(casesMap, lang, exporter, references)
  );

  const refsDone = Promise.all([
    about,
    modules,
    actionCards,
    procedures,
    drugs,
    keyLearningPoints,
  ]);
  const videos = refsDone.then(() =>
    publishVideos(screensMap, lang, [...references.videos], references)
  );
  const images = videos.then(() =>
    publishImages(lang, [...references.images], references)
  );
  const notifications = videos.then(() =>
    publishNotifications(lang, [...references.videos], references)
  );

  return Promise.all([
    screens,
    about,
    videos,
    images,
    procedures,
    modules,
    actionCards,
    drugs,
    onboarding,
    notifications,
    keyLearningPoints,
    certificates,
  ]).then((res) => {
    console.log("All content published");
    const [
      screens,
      about,
      videos,
      images,
      procedures,
      modules,
      actionCards,
      drugs,
      onboarding,
      notifications,
      keyLearningPoints,
      certificates,
    ] = res;

    const updatedLang = draft
      ? { ...lang, draftLastPublished: Date.now(), draftVersion: version }
      : { ...lang, lastPublished: Date.now(), version: version };
    const blob = `${lang.id}/bundle.json`;
    const bundle = {
      description: lang.description,
      learningPlatform: lang.learningPlatform,
      langId: lang.id,
      countryCode: lang.countryCode,
      latitude: lang.latitude,
      longitude: lang.longitude,
      version: version,
      screen: screens,
      about: about,
      videos: videos,
      images: images,
      notifications: notifications,
      procedures: procedures,
      actionCards: actionCards,
      modules: modules,
      drugs: drugs,
      onboarding,
    };

    if (lang.learningPlatform) {
      bundle.keyLearningPoints = keyLearningPoints;
      bundle.certificates = certificates;
    }

    const is = images.filter((image) => image.src);

    console.log("Adding images to zip");
    return Parallel.map(is, async (image) => zipExporter.addAsset(image.src), {
      concurrency: 15,
    }).then((x) =>
      exporter(blob, JSON.stringify(bundle)).then((r) => {
        console.log("Writing zip");
        return zipExporter.toBuffer().then((buf) => {
          console.log("Buffer created from zip, write blob");
          return createBlockBlobFromBuffer(draft)(
            `${lang.id}/bundle.zip`,
            buf,
            "application/zip"
          ).then(() => {
            console.log("Blob written");
            return upsertLang(user, updatedLang);
          });
        });
      })
    );
  });
};
