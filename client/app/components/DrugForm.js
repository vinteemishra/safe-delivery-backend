"use strict";
import React from "react";
import { connect } from "react-redux";
import { RichTextDocument } from "./RichText/RichTextDocument";
import { Drugs } from "../lib/sdaAPI";
import { langIdFromRoute, setWindowTitle } from "../lib/util";

class DrugForm extends React.Component {
  constructor(props) {
    super(props);
    this.saveContent = this.saveContent.bind(this);

    this.state = {
      doc: {
        next_id: 1,
        langId: props.langId,
        cards: [],
      },
    };
  }

  componentWillMount() {
    Drugs.get(this.props.drugKey, this.props.langId)
      .then((docs) => {
        console.log("all docs", docs);
        if (docs.length > 0) {
          let doc = docs[0];
          setWindowTitle(doc.description);
          this.setState({ doc });
        }
      })
      .catch((err) => console.error(err));
  }

  saveContent(doc) {
    Drugs.put(doc).then((r) => {
      console.log("saved drug", r);
    });
  }

  render() {
    console.log("Render drug", this.state.doc);
    return (
      <RichTextDocument
        images={this.props.images}
        role={this.props.role}
        langId={this.props.langId}
        title={this.state.doc.description || "Drug"}
        document={this.state.doc}
        onSave={this.saveContent}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  images: state.images.images,
  role: state.auth.auth.role,
  drugKey: state.router.params.drugKey || "Unknown",
});

export default connect(mapStateToProps, null)(DrugForm);
