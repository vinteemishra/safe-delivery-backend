"use strict";

import { connect } from "react-redux";
import { Cases } from "../lib/sdaAPI";
import {
  withQuestions,
  mapStateToProps,
  mapDispatchToProps,
} from "./QuestionsContainer";

const CasesQuestionsContainer = withQuestions(Cases, "CasesQuestionForm");

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CasesQuestionsContainer);
