"use strict";

import React from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";

const LoadingProgressBar = ({ isLoaded, children }) => {
  return isLoaded ? (
    <section>{children}</section>
  ) : (
    <ProgressBar mode="indeterminate" />
  );
};

export default LoadingProgressBar;
