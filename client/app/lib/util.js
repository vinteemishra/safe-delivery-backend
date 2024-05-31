"use strict";

export const genkey = (s) =>
  s
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[%?$&/=@#.',:;()]/g, "")
    .replace(/ +/g, "-")
    .toLowerCase() +
  "_" +
  Date.now();

export const langIdFromRoute = (state) => {
  try {
    return state.router.params && "langId" in state.router.params
      ? state.router.params.langId
      : "";
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const setWindowTitle = (title) =>
  title && (document.title = `Safe Delivery CMS - ${title}`);

// export const ARABIC = "da5137d1-8492-4312-b444-8e4d4949a3c7"; // NB: Actual french in DEV
export const ARABIC = "5f06426b-f7f4-ced1-66e3-d8ab3d0881bd"; // Real Arabic
const MYANMAR = "7a3f367b-99df-9bca-0b1f-100dcc14ae95"; // Myanmar
const NEPALI = "48a750e1-e772-975f-3632-1854b5b4501b"; // Nepal - Nepali
const AFGHANISTAN = "a5cf01c8-aee8-1f48-bac8-b887483595ca";

export const translatedFontStyle = (langId) => {
  switch (langId) {
    case MYANMAR:
      return {
        fontFamily: "Padauk",
        lineHeight: "22px",
      };
    case ARABIC:
      return {
        direction: "rtl",
        // unicodeBidi: "bidi-override",
      };
    case AFGHANISTAN:
      return {
        direction: "rtl",
      };
    default:
      return {};
  }
  // if (langId === NEPALI) {
  //   return {
  //     fontFamily: "Preeti",
  //     // lineHeight: '22px'
  //   }
  // }
};

export const initiateDownload = (filename, url) => {
  var tag = document.createElement("a");
  tag.href = url;
  tag.download = filename;
  document.body.appendChild(tag);
  tag.click();
  document.body.removeChild(tag);
};
