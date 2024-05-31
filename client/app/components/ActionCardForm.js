"use strict";
import { connect } from "react-redux";
import { withChapters, mapStateToProps } from "./ChapterForm";
import { ActionCards } from "lib/sdaAPI";

const ActionCardForm = withChapters(ActionCards);
export default connect(mapStateToProps)(ActionCardForm);
