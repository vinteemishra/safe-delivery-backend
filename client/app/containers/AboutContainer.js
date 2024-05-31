"use strict";

import React, { Component } from "react";
import DocumentCard from "../components/DocumentCard";
import { connect } from "react-redux";
import { langIdFromRoute } from "../lib/util";

export const sections = [
  {
    title: "Introduction",
    section: "introduction",
  },
  {
    title: "Developers",
    section: "developers",
  },
  {
    title: "Thank you",
    section: "thankyou",
  },
  {
    title: "Copyright",
    section: "copyright",
  },
  {
    title: "Disclaimer",
    section: "disclaimer",
  },
  {
    title: "Welcome",
    section: "welcome",
  },
  {
    title: "UPQ Introduction",
    section: "upq-introduction",
  },
  {
    title: "UPQ Thank You",
    section: "upq-thankyou",
  },
  {
    title: "LP - Introduction",
    section: "lp-introduction",
  },
  {
    title: "LP - Coming Soon",
    section: "comingsoon",
  },
  {
    title: "Background Survey",
    section: "background-survey",
  },
  {
    title: "F&Q",
    section: "feedback-and-troubleshooting",
  },
];

class AboutContainer extends Component {
  render() {
    return (
      <section>
        {sections.map((s) => (
          <div key={s.section} style={{ display: "inline-block" }}>
            <DocumentCard
              title={s.title}
              editUrl={`${this.props.currentPathname}/${s.section}`}
            />
          </div>
        ))}
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  currentPathname: state.router.pathname,
});

const mapDispatchToProps = (dispatch) => ({
  push: (curr, loc) => {
    const newLoc = loc.startsWith("/") ? loc : `${curr}/${loc}`;
    dispatch({ type: PUSH, payload: newLoc });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AboutContainer);
