"use strict";
import React from "react";
import { RichTextDocument } from "./RichText/RichTextDocument";
import { langIdFromRoute, setWindowTitle } from "../lib/util";

export const withChapters = (api) =>
  class extends React.Component {
    constructor(props) {
      super(props);
      this.saveContent = this.saveContent.bind(this);
      this.api = api;
      this.state = {
        doc: {
          description: "",
        },
        chapter: {
          next_id: 1,
          cards: [],
        },
      };
    }

    componentWillMount() {
      console.log("dockey", this.props.docKey);
      this.api.get(this.props.docKey, this.props.langId).then((docs) => {
        console.log("got doc", docs);
        if (docs.length) {
          const doc = docs[0];
          const chapter = doc.chapters.find(
            (c) => c.key === this.props.chapterKey
          );
          setWindowTitle(chapter.description || "Edit chapter");
          this.setState({ doc: doc, chapter: chapter });
        }
      });
    }

    saveContent(chapter) {
      const newChapters = this.state.doc.chapters.map((c) => {
        return c.key === chapter.key ? chapter : c;
      });
      const newCard = { ...this.state.doc, chapters: newChapters };
      this.api.put(newCard).then((c) => {
        console.log("saved", c);
        this.setState({ doc: c, chapter: chapter });
      });
    }

    render() {
      console.log("Render ", this.state.doc);
      return (
        <RichTextDocument
          images={this.props.images}
          role={this.props.role}
          langId={this.props.langId}
          title={this.state.chapter.description}
          document={this.state.chapter}
          onSave={this.saveContent}
        />
      );
    }
  };

export const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  docKey: state.router.params.docKey,
  chapterKey: state.router.params.chapterKey,
  images: state.images.images,
  role: state.auth.auth.role,
});
