"use strict";
import React from "react";
import { connect } from "react-redux";
import { translatedFontStyle, langIdFromRoute } from "lib/util";
import { Notifications } from "lib/sdaAPI";
import Input from "react-toolbox/lib/input";
import Button from "react-toolbox/lib/button";

function Header(props) {
  if (!props.show) {
    return null;
  }

  return (
    <thead>
      <tr>
        <th>&nbsp;</th>
        <th>Master</th>
        <th>Adapted</th>
        <th>Translated</th>
      </tr>
    </thead>
  );
}

class NotificationForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notification: null,
      masterShort: "",
      masterLong: "",
      adaptedShort: "",
      adaptedLong: "",
      translatedShort: "",
      translatedLong: "",
      translatedFontStyle: translatedFontStyle(props.langId),
    };
  }

  componentWillMount() {
    Notifications.get(this.props.notificationKey, this.props.langId)
      .then((docs) => {
        console.log("all docs", docs);
        if (docs.length > 0) {
          let doc = docs[0];
          this.setState({
            notification: doc,
            masterShort: doc.content.shortDescription,
            masterLong: doc.content.longDescription,
            adaptedShort: doc.adapted.shortDescription,
            adaptedLong: doc.adapted.longDescription,
            translatedShort: doc.translated.shortDescription,
            translatedLong: doc.translated.longDescription,
          });
        }
      })
      .catch((err) => console.error(err));
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  handleSave() {
    const s = this.state;
    const content = {
      shortDescription: s.masterShort,
      longDescription: s.masterLong,
    };
    const adapted = {
      shortDescription: s.adaptedShort,
      longDescription: s.adaptedLong,
    };
    const translated = {
      shortDescription: s.translatedShort,
      longDescription: s.translatedLong,
    };

    const not = {
      ...this.state.notification,
      content: content,
      adapted: adapted,
      translated: translated,
    };
    Notifications.put(not).then((r) => {
      console.log("saved notification", r);
      this.setState({ notification: r });
    });
  }

  render() {
    return !this.state.notification ? null : (
      <div>
        <h2>Notification</h2>
        <div className="grid grid-with-gutter">
          <div className="grid-cell grid-3 ">
            <table style={{ width: "100%" }}>
              <Header show={this.props.langId !== ""} />

              <tbody>
                <tr>
                  <td style={{ width: "20%" }}>Short Description</td>
                  <td>
                    <Input
                      type="text"
                      disabled={this.props.langId !== ""}
                      name="masterShort"
                      value={this.state.masterShort}
                      onChange={this.handleChange.bind(this, "masterShort")}
                    />
                  </td>
                  {this.props.langId !== "" && (
                    <td>
                      <Input
                        type="text"
                        disabled={this.props.role === "translator"}
                        value={this.state.adaptedShort}
                        onChange={this.handleChange.bind(this, "adaptedShort")}
                      />
                    </td>
                  )}
                  {this.props.langId !== "" && (
                    <td>
                      <Input
                        type="text"
                        style={this.state.translatedFontStyle}
                        spellCheck="false"
                        value={this.state.translatedShort}
                        onChange={this.handleChange.bind(
                          this,
                          "translatedShort"
                        )}
                      />
                    </td>
                  )}
                </tr>
                <tr>
                  <td>Long Description</td>
                  <td>
                    <Input
                      type="text"
                      multiline={true}
                      rows={8}
                      disabled={this.props.langId !== ""}
                      name="masterLong"
                      value={this.state.masterLong}
                      onChange={this.handleChange.bind(this, "masterLong")}
                    />
                  </td>
                  {this.props.langId !== "" && (
                    <td>
                      <Input
                        type="text"
                        multiline={true}
                        rows={8}
                        disabled={this.props.role === "translator"}
                        value={this.state.adaptedLong}
                        onChange={this.handleChange.bind(this, "adaptedLong")}
                      />
                    </td>
                  )}
                  {this.props.langId !== "" && (
                    <td>
                      <Input
                        type="text"
                        multiline={true}
                        rows={8}
                        style={this.state.translatedFontStyle}
                        spellCheck="false"
                        value={this.state.translatedLong}
                        onChange={this.handleChange.bind(
                          this,
                          "translatedLong"
                        )}
                      />
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid-cell grid-right grid-3">
            <Button
              icon="ic_save"
              label="Save"
              raised
              primary
              onClick={this.handleSave.bind(this)}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  images: state.images.images,
  role: state.auth.auth.role,
  notificationKey: state.router.params.notificationKey || "Unknown",
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationForm);
