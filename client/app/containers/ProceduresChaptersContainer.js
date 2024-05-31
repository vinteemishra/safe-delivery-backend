"use strict";

import { connect } from "react-redux";
import { Procedures } from "lib/sdaAPI";
import {
  withChapters,
  mapStateToProps,
  mapDispatchToProps,
} from "./ChaptersContainer";

const ProceduresChaptersContainer = withChapters(Procedures);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProceduresChaptersContainer);
