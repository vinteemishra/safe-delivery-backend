"use strict";

import { connect } from "react-redux";
import { Certificates } from "../lib/sdaAPI";
import {
  withTranslatedQuestions,
  mapStateToProps,
} from "./TranslatedQuestionForm";

const TranslatedCertificatesQuestionForm =
  withTranslatedQuestions(Certificates);

export default connect(mapStateToProps)(TranslatedCertificatesQuestionForm);
