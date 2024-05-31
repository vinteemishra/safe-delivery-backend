"use strict";
import React from "react";
import { connect } from "react-redux";
import { RichTextDocument } from "./RichText/RichTextDocument";
import { About } from "../lib/sdaAPI";
import { langIdFromRoute, setWindowTitle } from "../lib/util";

class AboutForm extends React.Component {
  constructor(props) {
    super(props);
    this.saveContent = this.saveContent.bind(this);

    this.state = {
      doc: {
        langId: props.langId,
      },
      chapter: {
        next_id: 1,
        cards: [],
      },
    };
  }

  componentWillMount() {
    setWindowTitle(this.props.sectionTitle);
    About.all(this.props.langId, this.props.section).then((docs) => {
      if (docs.length > 0) {
        let doc = docs[0];
        console.log("docs", doc);
        this.setState({ doc: doc });
        if (doc.chapters) {
          this.setState({ chapter: doc.chapters[0] });
        }
      }
    });
  }

  saveContent(chapter) {
    const newDoc = { ...this.state.doc, chapters: [chapter] };
    About.put(this.props.section, newDoc).then((r) => {
      console.log("saved", r);
      this.setState({ doc: r, chapter: chapter });
    });
  }

  render() {
    console.log("Render ", this.state.chapter);
    return (
      <RichTextDocument
        images={this.props.images}
        role={this.props.role}
        langId={this.props.langId}
        title={this.props.sectionTitle}
        document={this.state.chapter}
        onSave={this.saveContent}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  section: state.router.params.section || "Unknown",
  sectionTitle:
    state.router.result.titles.get(state.router.params.section) || "Unknown",
  images: state.images.images,
  role: state.auth.auth.role,
});

export default connect(mapStateToProps)(AboutForm);
