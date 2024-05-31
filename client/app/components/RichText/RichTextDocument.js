"use strict";

import React from "react";
import RichTextComponent from "./RichTextComponent";
import RichTextTranslation from "./RichTextTranslation";

export const RichTextDocument = (props) => {
  if (props.langId !== "") {
    return <RichTextTranslation {...props} />;
  } else {
    return <RichTextComponent {...props} />;
  }
};
