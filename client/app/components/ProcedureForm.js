"use strict";
import { connect } from "react-redux";
import { withChapters, mapStateToProps } from "./ChapterForm";
import { Procedures } from "lib/sdaAPI";

const ProcedureForm = withChapters(Procedures);
export default connect(mapStateToProps)(ProcedureForm);
