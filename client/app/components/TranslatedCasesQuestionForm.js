"use strict";

import { connect } from "react-redux";
import { Cases } from "../lib/sdaAPI";
import {
  withTranslatedQuestions,
  mapStateToProps,
} from "./TranslatedQuestionForm";

const TranslatedCasesQuestionForm = withTranslatedQuestions(Cases);

export default connect(mapStateToProps)(TranslatedCasesQuestionForm);
