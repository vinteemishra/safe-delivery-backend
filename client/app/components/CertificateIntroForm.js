"use strict";
import React from "react";
import { connect } from "react-redux";
import { RichTextDocument } from "./RichText/RichTextDocument";
import { Certificates } from "../lib/sdaAPI";
import { langIdFromRoute } from "../lib/util";

class CertificateIntroForm extends React.Component {
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
    Certificates.get(this.props.certKey, this.props.langId)
      .then((docs) => {
        if (docs.length > 0) {
          let doc = docs[0];
          console.log("docs", docs[0]);
          this.setState({ doc: docs[0] });
        }
      })
      .catch((err) => console.error(err));
  }

  saveContent(doc) {
    Certificates.put(doc).then((r) => {
      console.log("Certificate saved", r);
    });
  }

  render() {
    console.log("Render cert intro", this.state.doc);
    return (
      <RichTextDocument
        images={this.props.images}
        role={this.props.role}
        langId={this.props.langId}
        title={this.state.doc.description || "Certificate intro"}
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
  certKey: state.router.params.parentKey || "Unknown",
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CertificateIntroForm);
