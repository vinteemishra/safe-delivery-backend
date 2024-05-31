"use strict";

import { connect } from "react-redux";
import { KeyLearningPoints } from "../lib/sdaAPI";
import {
  withTranslatedQuestions,
  mapStateToProps,
} from "./TranslatedQuestionForm";

const TranslatedKeyLearningPointQuestionForm =
  withTranslatedQuestions(KeyLearningPoints);

export default connect(mapStateToProps)(TranslatedKeyLearningPointQuestionForm);
