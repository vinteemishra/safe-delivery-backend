"use strict";

import { connect } from "react-redux";
import { ActionCards } from "lib/sdaAPI";
import {
  withChapters,
  mapStateToProps,
  mapDispatchToProps,
} from "./ChaptersContainer";

const ActionCardsChaptersContainer = withChapters(ActionCards);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActionCardsChaptersContainer);
