"use strict";

import { connect } from "react-redux";
import { KeyLearningPoints } from "../lib/sdaAPI";
import {
  withQuestions,
  mapStateToProps,
  mapDispatchToProps,
} from "./QuestionsContainer";

const KeyLearningPointsQuestionsContainer = withQuestions(
  KeyLearningPoints,
  "KeyLearningPointQuestionForm"
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyLearningPointsQuestionsContainer);
