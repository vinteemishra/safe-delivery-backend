"use strict";

import React, { Component } from "react";
import NavBar from "./components/NavBar";
import { connect } from "react-redux";
import ProgressBar from "react-toolbox/lib/progress_bar";
import { PUSH } from "redux-little-router";
import { AdminFragments, AppFragments } from "./fragments";
// import Onboarding_test from './components/onboarding_test';

class App extends Component {
  componentWillReceiveProps(nextProps) {
    const { auth } = nextProps;
    auth &&
      auth.role &&
      auth.role !== "admin" &&
      auth.role !== this.props.auth.role &&
      this.initialRedirect(auth);
  }

  initialRedirect(auth) {
    if (window.location.pathname !== "/") {
      return;
    }

    auth.languages.length == 1
      ? this.props.push(`/languages/${auth.languages[0]}`)
      : this.props.push("/languages");
  }

  renderBreadcrumb(breadcrumb, languages) {
    const breadcrumbLength = breadcrumb.length;
    return breadcrumb.map((b, i) => {
      if (i === 0 || b == "") {
        return;
      }

      languages.map((l) => {
        b === l.id && (b = l.description);
      });

      if (breadcrumbLength === i + 1) {
        return (
          <div
            key={b}
            style={{ padding: 4, margin: 4, marginTop: 16, display: "inline" }}
          >
            {b}
          </div>
        );
      }

      return (
        <button
          key={b}
          style={{ padding: 4, margin: 4, marginTop: 16 }}
          onClick={() => {
            let path = "";

            for (let j = 1; j <= i; j++) {
              path = path + "/" + breadcrumb[j];
            }

            this.props.push(path);
          }}
        >
          {b}
        </button>
      );
    });
  }
  render() {
    const isLoaded = !!(
      this.props.auth.role &&
      this.props.images.size &&
      this.props.videos.size
    );
    const breadcrumb = window.location.pathname.split("/");

    return (
      <div>
        <NavBar />
        <div style={{ flexDirection: "column-reverse" }}>
          {this.renderBreadcrumb(breadcrumb, this.props.languages)}
        </div>
        <section style={{ padding: 20 }}>
          {isLoaded && this.props.auth.role === "admin" && <AdminFragments />}
          {isLoaded && <AppFragments />}
          {!isLoaded && <ProgressBar mode="indeterminate" />}
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth.auth,
  videos: state.videos.videos,
  images: state.images.images,
  languages: state.lang.languages,
});

const mapDispatchToProps = (dispatch) => ({
  push: (loc) => {
    dispatch({ type: PUSH, payload: loc });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
